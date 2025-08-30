#!/bin/bash

# ComicScout Database Migration Script
# This script applies all database migrations in the correct order

set -e  # Exit on any error

echo "🚀 Starting ComicScout Database Migration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
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

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    print_error "supabase/config.toml not found. Please run this script from the project root."
    exit 1
fi

# Check if logged in to Supabase
if ! supabase status &> /dev/null; then
    print_warning "Not connected to Supabase. Attempting to start local instance..."
    supabase start || {
        print_error "Failed to start local Supabase. Please check your configuration."
        exit 1
    }
fi

print_status "Checking current migration status..."

# Get the migration directory
MIGRATION_DIR="supabase/migrations"

if [ ! -d "$MIGRATION_DIR" ]; then
    print_error "Migration directory not found: $MIGRATION_DIR"
    exit 1
fi

print_status "Found migration files:"
ls -la "$MIGRATION_DIR"/*.sql 2>/dev/null | while read line; do
    echo "  📄 $(basename "$line")"
done

# Function to apply a single migration
apply_migration() {
    local migration_file=$1
    local migration_name=$(basename "$migration_file" .sql)
    
    print_status "Applying migration: $migration_name"
    
    # Apply the migration
    if supabase db push --include-all 2>&1; then
        print_success "Migration $migration_name completed successfully"
        return 0
    else
        print_error "Migration $migration_name failed"
        return 1
    fi
}

# Dry run first to check for issues
print_status "Performing dry run to check for issues..."
if supabase db push --include-all --dry-run 2>&1; then
    print_success "Dry run completed successfully"
else
    print_error "Dry run failed. Please check the migration files."
    exit 1
fi

# Apply all migrations
print_status "Applying all migrations..."
if supabase db push --include-all; then
    print_success "All migrations applied successfully!"
else
    print_error "Migration failed. Please check the logs above."
    exit 1
fi

# Verify the schema
print_status "Verifying database schema..."
echo ""
echo "📊 Database Tables:"
supabase db diff --check || true

print_status "Testing database functions..."

# Test a few key functions to ensure they're working
echo ""
echo "🧪 Testing key database functions:"

# Test the calculate_deal_score function
echo "  Testing calculate_deal_score function..."
supabase db shell --query "SELECT calculate_deal_score(100, 150) as deal_score_test;" || print_warning "Function test failed"

# Test the search_series function  
echo "  Testing search_series function..."
supabase db shell --query "SELECT * FROM search_series('spider') LIMIT 1;" || print_warning "Function test failed"

# Check if sample data was loaded
echo "  Verifying sample data..."
supabase db shell --query "SELECT count(*) as series_count FROM comic_series;" || print_warning "Sample data check failed"
supabase db shell --query "SELECT count(*) as grade_count FROM grade;" || print_warning "Sample data check failed"

print_success "Database migration completed!"
echo ""
echo "📋 Next Steps:"
echo "  1. Update your application configuration to use the new database schema"
echo "  2. Test your API endpoints with the new database"
echo "  3. Run your application test suite"
echo "  4. Update environment variables for production deployment"
echo ""
echo "📚 For more information, see: supabase/migrations/README.md"
echo ""

# Show current database URL for reference
print_status "Current database connection:"
supabase status | grep "DB URL" || echo "  Use 'supabase status' to see connection details"

print_success "Migration script completed successfully! 🎉"