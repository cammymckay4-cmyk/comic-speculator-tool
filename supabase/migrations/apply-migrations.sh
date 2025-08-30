#!/bin/bash

# =====================================================
# ComicScoutUK Database Migration Application Script
# File: apply-migrations.sh
# Description: Automated script to apply all database migrations
# =====================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR"
LOG_FILE="$SCRIPT_DIR/migration.log"

# Migration files in order
MIGRATIONS=(
    "001_core_schema.sql"
    "002_row_level_security.sql"
    "003_seed_grades.sql"
    "004_seed_sample_data.sql"
    "005_functions_and_views.sql"
)

# Helper functions
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

print_header() {
    echo -e "\n${BLUE}================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if we're in the right directory
    if [[ ! -f "$MIGRATIONS_DIR/001_core_schema.sql" ]]; then
        print_error "Migration files not found. Please run this script from the migrations directory."
        exit 1
    fi
    
    # Check for Supabase CLI
    if command -v supabase &> /dev/null; then
        print_success "Supabase CLI found"
        SUPABASE_CLI=true
    else
        print_warning "Supabase CLI not found. Will attempt direct psql connection."
        SUPABASE_CLI=false
    fi
    
    # Check for psql
    if command -v psql &> /dev/null; then
        print_success "PostgreSQL client (psql) found"
        PSQL_AVAILABLE=true
    else
        print_error "PostgreSQL client (psql) not found. Please install PostgreSQL client tools."
        exit 1
    fi
    
    # Check environment variables
    if [[ -z "$DATABASE_URL" && -z "$SUPABASE_DB_URL" ]]; then
        if [[ "$SUPABASE_CLI" == true ]]; then
            print_warning "DATABASE_URL not set, but Supabase CLI available. Will use local connection."
        else
            print_error "DATABASE_URL or SUPABASE_DB_URL must be set for direct connection."
            echo "Example: export DATABASE_URL='postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres'"
            exit 1
        fi
    fi
}

# Test database connection
test_connection() {
    print_header "Testing Database Connection"
    
    if [[ "$SUPABASE_CLI" == true ]] && [[ -z "$DATABASE_URL" ]]; then
        # Test Supabase CLI connection
        if supabase status --experimental 2>/dev/null | grep -q "API URL"; then
            print_success "Supabase connection established"
            return 0
        else
            print_warning "Supabase CLI connection failed, trying direct connection..."
        fi
    fi
    
    # Test direct database connection
    if [[ -n "$DATABASE_URL" ]]; then
        if psql "$DATABASE_URL" -c "SELECT 1;" &>/dev/null; then
            print_success "Direct database connection established"
            return 0
        else
            print_error "Database connection failed"
            return 1
        fi
    elif [[ -n "$SUPABASE_DB_URL" ]]; then
        if psql "$SUPABASE_DB_URL" -c "SELECT 1;" &>/dev/null; then
            print_success "Supabase database connection established"
            return 0
        else
            print_error "Supabase database connection failed"
            return 1
        fi
    fi
    
    print_error "No valid database connection available"
    return 1
}

# Apply a single migration
apply_migration() {
    local migration_file="$1"
    local migration_path="$MIGRATIONS_DIR/$migration_file"
    
    echo -e "\n${BLUE}Applying migration: $migration_file${NC}"
    log "Starting migration: $migration_file"
    
    if [[ ! -f "$migration_path" ]]; then
        print_error "Migration file not found: $migration_path"
        return 1
    fi
    
    # Choose connection method
    if [[ "$SUPABASE_CLI" == true ]] && [[ -z "$DATABASE_URL" ]]; then
        # Use Supabase CLI
        if supabase db push --include-all --experimental &> /dev/null; then
            # If CLI push works, execute the specific file
            if psql "$(supabase status --experimental | grep 'DB URL' | cut -d: -f2- | xargs)" -f "$migration_path" &> /dev/null; then
                print_success "Migration applied successfully via Supabase CLI"
                log "Migration $migration_file applied successfully via Supabase CLI"
                return 0
            fi
        fi
        print_warning "Supabase CLI method failed, trying direct connection..."
    fi
    
    # Use direct connection
    local db_url="${DATABASE_URL:-$SUPABASE_DB_URL}"
    if [[ -n "$db_url" ]]; then
        if psql "$db_url" -f "$migration_path" &> /dev/null; then
            print_success "Migration applied successfully via direct connection"
            log "Migration $migration_file applied successfully via direct connection"
            return 0
        else
            print_error "Migration failed via direct connection"
            log "Migration $migration_file failed via direct connection"
            
            # Show error details
            echo "Error details:"
            psql "$db_url" -f "$migration_path" 2>&1 | tail -20
            return 1
        fi
    fi
    
    print_error "No connection method available for migration"
    return 1
}

# Verify migration results
verify_migrations() {
    print_header "Verifying Migration Results"
    
    local db_url="${DATABASE_URL:-$SUPABASE_DB_URL}"
    if [[ "$SUPABASE_CLI" == true ]] && [[ -z "$db_url" ]]; then
        db_url="$(supabase status --experimental 2>/dev/null | grep 'DB URL' | cut -d: -f2- | xargs)"
    fi
    
    if [[ -z "$db_url" ]]; then
        print_warning "Cannot verify migrations - no database connection"
        return 0
    fi
    
    # Check core tables
    echo "Checking core tables..."
    local table_count=$(psql "$db_url" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" 2>/dev/null || echo "0")
    
    if [[ "$table_count" -ge 12 ]]; then
        print_success "Core tables created ($table_count tables found)"
    else
        print_warning "Expected at least 12 tables, found $table_count"
    fi
    
    # Check grading standards data
    echo "Checking sample data..."
    local grade_count=$(psql "$db_url" -t -c "SELECT COUNT(*) FROM grading_standards;" 2>/dev/null || echo "0")
    
    if [[ "$grade_count" -ge 80 ]]; then
        print_success "Grading standards seeded ($grade_count grades found)"
    else
        print_warning "Expected at least 80 grading standards, found $grade_count"
    fi
    
    # Check comic series data
    local series_count=$(psql "$db_url" -t -c "SELECT COUNT(*) FROM comic_series;" 2>/dev/null || echo "0")
    
    if [[ "$series_count" -ge 5 ]]; then
        print_success "Comic series seeded ($series_count series found)"
    else
        print_warning "Expected at least 5 comic series, found $series_count"
    fi
    
    # Check functions
    echo "Checking functions..."
    local function_count=$(psql "$db_url" -t -c "SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';" 2>/dev/null || echo "0")
    
    if [[ "$function_count" -ge 10 ]]; then
        print_success "Business logic functions created ($function_count functions found)"
    else
        print_warning "Expected at least 10 functions, found $function_count"
    fi
    
    print_success "Migration verification completed"
}

# Main migration process
main() {
    print_header "ComicScoutUK Database Migration"
    echo "This script will apply all database migrations to replace mock data dependencies."
    echo "Migration log: $LOG_FILE"
    echo ""
    
    # Initialize log
    echo "Migration started at $(date)" > "$LOG_FILE"
    
    # Check prerequisites
    check_prerequisites
    
    # Test connection
    if ! test_connection; then
        print_error "Database connection test failed. Please check your configuration."
        exit 1
    fi
    
    # Confirm before proceeding
    echo -e "\n${YELLOW}This will modify your database schema. Continue? (y/N)${NC}"
    read -r confirmation
    if [[ ! "$confirmation" =~ ^[Yy]$ ]]; then
        echo "Migration cancelled by user."
        exit 0
    fi
    
    # Apply migrations
    print_header "Applying Migrations"
    
    local success_count=0
    local total_count=${#MIGRATIONS[@]}
    
    for migration in "${MIGRATIONS[@]}"; do
        if apply_migration "$migration"; then
            ((success_count++))
        else
            print_error "Migration failed: $migration"
            echo "Check the log file for details: $LOG_FILE"
            exit 1
        fi
    done
    
    # Verify results
    verify_migrations
    
    # Summary
    print_header "Migration Complete"
    print_success "Successfully applied $success_count/$total_count migrations"
    echo ""
    echo "Next steps:"
    echo "1. Update your application code to use the database instead of fixtures"
    echo "2. Configure environment variables for your application"
    echo "3. Test API endpoints with the new schema"
    echo "4. Set up data ingestion pipelines"
    echo ""
    echo "For more information, see:"
    echo "- supabase/migrations/README.md"
    echo "- ARCHITECTURE.md"
    
    log "Migration completed successfully at $(date)"
}

# Handle script interruption
trap 'print_error "Migration interrupted"; exit 1' INT TERM

# Run main function
main "$@"