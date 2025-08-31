# Supabase Maintenance: Setting Up Cron Jobs

## Why

The `issue_search` materialized view in our Supabase database requires periodic refreshing to ensure search results remain current and accurate. Materialized views store the results of a query physically, which improves query performance but means the data can become stale as the underlying tables are updated.

Since this refresh operation cannot be automated directly from our application code (materialized view refreshes require database-level scheduling), we must set up a scheduled cron job within the Supabase dashboard to perform this maintenance automatically.

## Setup Instructions

Follow these steps to create a scheduled cron job in your Supabase dashboard:

1. **Navigate to the Supabase Dashboard**
   - Log into your Supabase project dashboard
   - Select your project

2. **Access Cron Jobs**
   - Go to **Database** in the left sidebar
   - Click on **Cron Jobs**

3. **Create New Cron Job**
   - Click the **"Create a new cron job"** button
   - Fill in the following details:

4. **Configure the Cron Job**
   - **Name**: `refresh_issue_search_materialized_view`
   - **Description**: `Daily refresh of the issue_search materialized view to keep search results current`
   - **Schedule**: `0 2 * * *` (runs daily at 2:00 AM UTC)
   - **SQL Command**:
     ```sql
     REFRESH MATERIALIZED VIEW CONCURRENTLY public.issue_search;
     ```

5. **Save and Enable**
   - Review your settings
   - Click **"Create cron job"**
   - Ensure the job is enabled

## Important Notes

### The CONCURRENTLY Keyword

It is **critical** to use the `CONCURRENTLY` keyword in the refresh command. Here's why:

- **Without CONCURRENTLY**: The materialized view refresh will lock the entire view, making it unavailable for queries during the refresh operation. This can cause application downtime and poor user experience.

- **With CONCURRENTLY**: The refresh operation creates a new version of the materialized view in the background while keeping the current version available for queries. Once the new version is complete, it atomically replaces the old version with minimal disruption.

### Schedule Explanation

The cron schedule `0 2 * * *` breaks down as follows:
- `0` - Minute (0th minute)
- `2` - Hour (2 AM)
- `*` - Day of month (every day)
- `*` - Month (every month)
- `*` - Day of week (every day of the week)

This schedule runs the refresh daily at 2:00 AM UTC, which is typically a low-traffic time for most applications.

### Monitoring

After setting up the cron job:
- Monitor the **Cron Jobs** section in your Supabase dashboard for execution logs
- Check for any failed executions and investigate errors if they occur
- Consider setting up alerts for cron job failures if your Supabase plan supports it

### Troubleshooting

If the cron job fails to execute:
1. Verify that your database user has sufficient privileges to refresh materialized views
2. Check that the `public.issue_search` materialized view exists
3. Review the execution logs in the Supabase dashboard for specific error messages
4. Ensure your Supabase plan includes cron job functionality

## Next Steps

After setting up the cron job, you should:
1. Test the job by triggering it manually (if supported by your Supabase plan)
2. Monitor the first few automatic executions to ensure they complete successfully
3. Document any custom monitoring or alerting procedures specific to your team's workflow