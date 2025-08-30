# Comic Data Seeding Scripts

This directory contains scripts for populating the ComicScout database with comic book data from various sources.

## Scripts Overview

### `seed-comics-data.ts` - Main Comic Catalog Seeding Script

**Purpose**: Populates the application's `comic_series` and `comic_issues` tables with data from an external Comic Catalog Database (GCD format).

**Data Source**: External MySQL database containing comprehensive Marvel and DC Comics data with ~500,000+ issues and detailed metadata.

## Setup and Configuration

### 1. Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Supabase Configuration (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# GCD Database Connection (Required)
GCD_DATABASE_URL=mysql://user:password@host:port/database

# Processing Configuration (Optional)
BATCH_SIZE=100                    # Records to process in each batch
MAX_SERIES=1000                   # Maximum series to process (for testing)
MAX_ISSUES=50                     # Maximum issues per series (for testing)
DRY_RUN=false                     # Set to 'true' to preview without writing
```

### 2. Install Dependencies

```bash
npm install
```

The script requires:
- `mysql2` - MySQL database connectivity
- `dotenv` - Environment variable management
- `@supabase/supabase-js` - Supabase client

## Usage

### Running the Complete Seeding Process

```bash
# Install dependencies first
npm install

# Run the complete seeding process
npm run seed:comics

# Alternative direct execution
tsx scripts/seed-comics-data.ts
```

### Testing and Development

```bash
# Dry run (preview changes without writing)
DRY_RUN=true npm run seed:comics

# Process limited data for testing
MAX_SERIES=10 MAX_ISSUES=5 npm run seed:comics

# Process in smaller batches
BATCH_SIZE=50 npm run seed:comics
```

## Data Mapping

The script maps data from the GCD database schema to your application's schema:

### Series Mapping
| GCD Table | GCD Field | Application Table | Application Field |
|-----------|-----------|-------------------|-------------------|
| `gcd_series` | `name` | `comic_series` | `name` |
| `gcd_series` | `sort_name` | `comic_series` | `aliases[]` |
| `gcd_publisher` | `name` | `comic_series` | `publisher` |
| `gcd_series` | `year_began` | `comic_series` | `publication_start_date` |
| `gcd_series` | `year_ended` | `comic_series` | `publication_end_date` |

### Issue Mapping
| GCD Table | GCD Field | Application Table | Application Field |
|-----------|-----------|-------------------|-------------------|
| `gcd_issue` | `number` | `comic_issues` | `issue_number` |
| `gcd_issue` | `volume` | `comic_issues` | `variant` |
| `gcd_issue` | `publication_date` | `comic_issues` | `release_date` |
| `gcd_issue` | `title` | `comic_issues` | `synopsis` |

## Script Features

### 🚀 **Robust Processing**
- Batch processing to handle large datasets efficiently
- Automatic retry logic for failed operations
- Comprehensive error logging and statistics

### 🔄 **Upsert Logic**
- Safely handles existing data (updates rather than duplicates)
- Uses natural keys for conflict resolution
- Preserves data integrity with foreign key relationships

### 📊 **Progress Monitoring**
- Real-time progress tracking
- Detailed statistics and timing information
- Error reporting with context

### 🛡️ **Safety Features**
- Dry run mode for testing
- Configurable limits for development/testing
- Connection validation before processing

### 🎯 **Data Quality**
- Filters out soft-deleted records (`deleted = 0`)
- Handles various date formats from source data
- Normalizes text data and handles Unicode properly

## Output and Monitoring

The script provides detailed console output:

```
🚀 Starting Comic Catalog Database Seeding
==========================================
📋 Configuration:
   Batch size: 100
   Max series: unlimited
   Max issues per series: unlimited
   Dry run: false

🔌 Connecting to databases...
✅ Database connections established

📚 Fetching publishers (Marvel & DC)...
✅ Found 2 publishers

🏢 Processing publisher: Marvel Comics

  📖 Processing series 1/12887: The Amazing Spider-Man
    📚 Processing 963 issues...
    ✅ Completed processing The Amazing Spider-Man

📊 Processing Statistics:
========================
⏱️  Duration: 45 minutes
📖 Series processed: 13389
📖 Series skipped: 0
📚 Issues processed: 486532
📚 Issues skipped: 127
❌ Errors encountered: 3
```

## Error Handling

The script handles various error conditions gracefully:

- **Connection failures**: Validates database connections before processing
- **Data conflicts**: Uses upsert logic to handle existing records
- **Invalid data**: Logs and skips problematic records without stopping
- **Timeouts**: Batches operations to prevent long-running transactions

## Performance Considerations

### Database Optimization
- Uses batch processing to minimize transaction overhead
- Leverages existing database indexes for efficient lookups
- Implements proper connection management

### Memory Management
- Processes data in configurable batches
- Streams large result sets rather than loading everything into memory
- Proper cleanup of database connections

### Recommended Settings
- **Production**: `BATCH_SIZE=100` (default)
- **Development**: `BATCH_SIZE=50`, `MAX_SERIES=100`
- **Testing**: `DRY_RUN=true`, `MAX_SERIES=5`, `MAX_ISSUES=10`

## Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
Error: Missing GCD_DATABASE_URL environment variable
```
- Ensure `.env` file exists and contains correct database URL
- Verify database is accessible from your network

**Permission Errors**
```bash
Error: Supabase connection failed: insufficient privileges
```
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Ensure service role has write permissions on target tables

**Memory Issues**
```bash
Error: JavaScript heap out of memory
```
- Reduce `BATCH_SIZE` (try 50 or 25)
- Set `MAX_SERIES` to process data in chunks

### Monitoring Progress

For long-running imports, you can monitor progress by:
1. Watching the console output for completion percentages
2. Checking the database directly for record counts
3. Using the statistics summary at the end

### Resuming Failed Imports

The script uses upsert logic, so it's safe to re-run after failures:
- Already processed data will be updated, not duplicated
- The script will continue from where it left off
- Use dry run mode first to verify the resume behavior

## Data Source Information

The external Comic Catalog Database contains:
- **Publishers**: Marvel Comics, DC Comics
- **Series**: 13,389 total (12,887 Marvel, 502 DC)
- **Issues**: ~500,000+ estimated
- **Time Period**: Comprehensive historical data
- **Data Quality**: Professionally curated with metadata

## Next Steps

After successful seeding:
1. **Verify Data**: Check record counts in `comic_series` and `comic_issues` tables
2. **Update Indexes**: Ensure database indexes are optimized for your query patterns
3. **Set up Monitoring**: Consider setting up alerts for data freshness
4. **Schedule Updates**: Plan for periodic re-syncing with the source database

## Support

For issues with the seeding script:
1. Check the error logs for specific failure details
2. Try running with `DRY_RUN=true` to validate configuration
3. Verify all environment variables are correctly set
4. Ensure both databases are accessible and have sufficient resources