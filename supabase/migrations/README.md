# ComicScout Database Migrations

This directory contains Supabase migration scripts for the ComicScout UK application. These migrations replace the mock data dependencies with a complete, production-ready database schema.

## Migration Overview

### 001_core_schema.sql
- **Purpose**: Creates the complete database schema with all required tables
- **Key Features**:
  - Core entities: `comic_series`, `issue`, `grade`, `market_value`, `deal`
  - Data ingestion: `listing_raw`, `listing_normalised` 
  - User management: `users`, `alert_rule`, `user_alert`
  - Performance indexes on all critical queries
  - Auto-updating timestamp triggers
  - Proper foreign key constraints and cascading deletes

### 002_row_level_security.sql
- **Purpose**: Implements comprehensive Row Level Security policies
- **Key Features**:
  - User isolation for personal data (alerts, profiles)
  - Public read access to comic data and deals
  - Service role restrictions for data modification
  - Automatic user creation from Supabase Auth
  - Multi-tenancy support for future expansion

### 003_seed_grades.sql
- **Purpose**: Populates the grade table with standard comic book grading scales
- **Key Features**:
  - Complete CGC grade scale (0.5 to 10.0)
  - CBCS, PGX, and Raw/Ungraded categories
  - Consistent UUIDs for reliable grade references
  - Numeric values for sorting and comparison

### 004_seed_sample_data.sql  
- **Purpose**: Seeds the database with realistic sample data for testing and development
- **Key Features**:
  - Popular comic series (Spider-Man, Batman, X-Men)
  - Key issues with historical significance
  - Market value data with statistical accuracy
  - Sample listings and deals with realistic pricing
  - Demonstrates complete data flow from raw listings to deals

### 005_functions_and_views.sql
- **Purpose**: Creates utility functions and views for application logic
- **Key Features**:
  - Deal score calculation function
  - Search functionality for series and aliases
  - Comprehensive views for deal and market value data
  - User alert matching system
  - Maintenance functions for cleanup and refresh

## Running Migrations

### Prerequisites
- Supabase CLI installed and configured
- Access to the target Supabase project
- Database connection established

### Commands
```bash
# Run all migrations in order
supabase db push

# Or run individual migrations
supabase db push --include-all --dry-run  # Preview changes
supabase db push --include-all            # Apply changes

# Reset and re-run (development only)
supabase db reset
supabase db push
```

### Local Development
```bash
# Start local Supabase instance
supabase start

# Apply migrations to local instance
supabase db push --local

# View database in browser
supabase db diff --local
```

## Data Migration Strategy

### Phase 1: Schema Creation (Migrations 001-002)
1. Create all tables with proper relationships
2. Set up RLS policies for security
3. Add performance indexes
4. Configure auto-updating timestamps

### Phase 2: Reference Data (Migration 003)
1. Populate grade table with standard scales
2. Ensure consistent grade references across application
3. Support for multiple grading companies

### Phase 3: Sample Data (Migration 004)  
1. Add realistic comic series and issues
2. Create market value baselines
3. Generate sample deals for testing
4. Demonstrate complete data pipeline

### Phase 4: Application Logic (Migration 005)
1. Deploy utility functions for business logic
2. Create optimized views for common queries
3. Implement alert matching system
4. Add maintenance and cleanup routines

## Post-Migration Steps

### 1. Update Application Configuration
- Configure Supabase client with new schema
- Update environment variables for database URL
- Test connection with new schema

### 2. API Integration
- Update API endpoints to use database instead of fixtures
- Implement proper error handling for database queries
- Add caching layer for performance optimization

### 3. Data Validation
- Verify all sample data loads correctly
- Test all functions and views
- Validate RLS policies work as expected
- Run application test suite against new schema

### 4. Performance Optimization
- Monitor query performance with real data
- Add additional indexes if needed
- Optimize slow queries identified in testing

## Schema Design Principles

### Normalization
- Proper 3NF normalization for data consistency
- Efficient foreign key relationships
- Minimal data duplication

### Scalability
- Indexed queries for common access patterns
- Partitioning support for large datasets
- Efficient pagination support

### Security  
- Row Level Security for multi-tenancy
- Service role restrictions for sensitive operations
- Audit trails for important data changes

### Maintainability
- Clear naming conventions
- Comprehensive documentation
- Automated timestamp management
- Constraint enforcement at database level

## Troubleshooting

### Common Issues
1. **Migration fails**: Check for existing data conflicts
2. **RLS blocks queries**: Verify user authentication and policies
3. **Performance issues**: Check if indexes are being used
4. **Function errors**: Validate input parameters and return types

### Rollback Strategy
```bash
# View migration history
supabase db diff --check

# Reset to previous state (development only)  
supabase db reset
git checkout previous-commit
supabase db push
```

## Next Steps
After successful migration:
1. Update application code to use new schema
2. Implement real data ingestion pipelines  
3. Set up monitoring and alerting
4. Plan for production deployment