# ComicScoutUK Database Migrations

This directory contains the database migration scripts for the ComicScoutUK application. These migrations replace the mock data dependencies and establish a production-ready PostgreSQL schema on Supabase.

## Migration Files

### 001_core_schema.sql
**Complete database schema with all required tables**

- **Core Entity Tables**: Users, comic series, issues, grading standards
- **Data Pipeline Tables**: Raw listings, normalized listings, market values, deals
- **User Interaction Tables**: Collections, alert rules, notifications
- **Performance Features**: Strategic indexes, auto-updating timestamps
- **Constraints**: Data validation, foreign key relationships

**Tables Created**: 12 core tables with proper relationships and constraints

### 002_row_level_security.sql
**Comprehensive RLS policies for security and multi-tenancy**

- **User Management**: Profile access and modification policies
- **Data Protection**: User-specific data isolation (collections, alerts)
- **Public Access**: Read-only access to comic data and deals
- **System Access**: Service role permissions for data management
- **Security Features**: Audit logging, rate limiting, automatic user creation

**Security Level**: Production-ready with multi-tenant isolation

### 003_seed_grades.sql
**Standard comic book grading scales**

- **CGC Scale**: Complete 0.5-10.0 grading scale (25 grades)
- **CBCS Scale**: Complete grading scale matching CGC
- **PGX Scale**: Complete grading scale matching CGC  
- **Raw Grades**: Unslabbed comic condition categories
- **Specialty Grades**: Qualified, Authentic, Apparent designations

**Total Grades**: 90+ grading standards with consistent UUIDs

### 004_seed_sample_data.sql
**Realistic sample data for testing and development**

- **Popular Series**: Spider-Man, X-Men, Batman, Walking Dead, etc.
- **Key Issues**: First appearances, origin stories, major events
- **Market Values**: Statistical pricing data with trends
- **Live Listings**: eBay-style auction and buy-it-now listings
- **Deals Pipeline**: High-value opportunities with scoring
- **Sample User**: Complete user profile with collection and alerts

**Data Volume**: 100+ comics, market values, and active listings

### 005_functions_and_views.sql
**Business logic utilities and optimized views**

- **Deal Scoring**: Advanced algorithms for opportunity identification
- **Search Functions**: Series lookup with alias matching
- **Alert Matching**: User notification trigger logic
- **Maintenance**: Automated cleanup and market value updates
- **Optimized Views**: Pre-joined data for common application queries

**Performance**: Indexed functions and materialized view patterns

## Quick Start

### Option 1: Apply All Migrations (Recommended)

```bash
# Run the automated migration script
./apply-migrations.sh
```

### Option 2: Manual Migration Application

```bash
# Apply migrations in order using Supabase CLI
supabase db reset
supabase migration up

# Or apply individually
psql -h your-supabase-host -U postgres -d your-database -f 001_core_schema.sql
psql -h your-supabase-host -U postgres -d your-database -f 002_row_level_security.sql
psql -h your-supabase-host -U postgres -d your-database -f 003_seed_grades.sql
psql -h your-supabase-host -U postgres -d your-database -f 004_seed_sample_data.sql
psql -h your-supabase-host -U postgres -d your-database -f 005_functions_and_views.sql
```

## Configuration Requirements

### Environment Variables
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Database Connection (for direct access)
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

### Authentication Integration
The schema integrates with Supabase Auth:
- User profiles are automatically created when users sign up
- Row Level Security policies use `auth.uid()` for user identification
- Service role permissions allow backend data management

## Schema Overview

### Data Flow Architecture
```
Raw Listings → Normalized Listings → Market Values → Deals
                      ↓
               User Collections ← User Alert Rules → Alert Notifications
```

### Key Relationships
- **Series ↔ Issues**: One-to-many relationship with variant support
- **Issues ↔ Market Values**: Per-grade pricing data
- **Users ↔ Collections**: Personal comic inventory with valuations
- **Users ↔ Alerts**: Automated deal notifications based on criteria

### Security Model
- **Public Read**: Comic data, grading standards, active deals
- **User Private**: Collections, alert rules, notifications
- **Service Role**: Data ingestion, market value calculations
- **Audit Trail**: All user actions logged for security

## Performance Considerations

### Strategic Indexes
- **Composite Indexes**: Multi-column lookups (series + issue + grade)
- **Partial Indexes**: Active-only records, recent data
- **GIN Indexes**: Array fields (aliases, auction types)
- **Functional Indexes**: Computed values, trend analysis

### Query Optimization
- **Materialized Views**: Pre-computed aggregations
- **Function Indexing**: Business logic calculations
- **Statistics Updates**: Automated ANALYZE commands

## Testing the Migration

### Verify Core Tables
```sql
-- Check table creation
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Verify data seeding
SELECT company, COUNT(*) FROM grading_standards GROUP BY company;
SELECT name, publisher FROM comic_series LIMIT 5;
```

### Test User Functionality  
```sql
-- Test user collection stats
SELECT * FROM get_user_collection_stats('99999999-9999-4000-a000-000000000001');

-- Test search functionality
SELECT * FROM search_comic_series('spider');

-- Verify RLS policies
SET ROLE authenticated;
SELECT * FROM user_collections; -- Should only show user's own data
```

### Test Deal Pipeline
```sql
-- Check active deals
SELECT deal_type, COUNT(*), AVG(deal_score) 
FROM active_deals_detailed GROUP BY deal_type;

-- Test deal scoring
SELECT calculate_deal_score(1000.00, 1500.00, 200.00, 25);
```

## Migration Benefits

### Replaces Mock Data Dependencies
- ✅ Eliminates fixture file dependencies
- ✅ Enables real data ingestion pipelines
- ✅ Supports production-scale data volumes
- ✅ Provides realistic development environment

### Production-Ready Features
- ✅ Row Level Security for multi-tenancy
- ✅ Performance-optimized schema design
- ✅ Comprehensive data validation
- ✅ Automated maintenance procedures
- ✅ Audit trails and security logging

### Development Efficiency
- ✅ Realistic sample data for testing
- ✅ Business logic functions for complex queries
- ✅ Optimized views for common application patterns
- ✅ Complete API integration points

## Next Steps After Migration

1. **Update Application Code**
   - Replace fixture imports with database queries
   - Update API endpoints to use new schema
   - Implement authentication with Supabase Auth

2. **Configure Data Ingestion**
   - Set up eBay API integration for raw listings
   - Implement market value calculation jobs  
   - Configure automated deal discovery

3. **Deploy to Production**
   - Apply migrations to production database
   - Update environment variables
   - Test all API endpoints with real data

4. **Monitor and Maintain**
   - Set up automated maintenance jobs
   - Monitor query performance
   - Implement backup and recovery procedures

## Support

For questions about the migration:
1. Review the ARCHITECTURE.md for schema design rationale
2. Check CODE_AUDIT.md for implementation decisions
3. Refer to TECHNICAL_DEBT.md for known issues and future improvements

The migration provides a complete, production-ready foundation for the ComicScoutUK application.