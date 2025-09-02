# Supabase Setup for ComicScout UK

This directory contains the Supabase configuration for handling email confirmations via Resend API.

## Structure

### Edge Functions
- `functions/send-confirmation-email/` - Main function that sends emails via Resend API
- `functions/handle-email-webhook/` - Webhook handler for database triggers

### Migrations
- `migrations/001_create_confirmation_email_trigger.sql` - Initial trigger setup (HTTP-based)
- `migrations/002_create_webhook_approach.sql` - Alternative webhook-based approach

## Setup Instructions

### 1. Deploy Edge Functions

```bash
# Deploy the email sending function
supabase functions deploy send-confirmation-email

# Deploy the webhook handler
supabase functions deploy handle-email-webhook
```

### 2. Set Environment Variables

In your Supabase project dashboard, set the following secrets:

```bash
# Set the Resend API key
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

### 3. Run Migrations

```bash
# Apply the database migrations
supabase db reset
```

### 4. Configure Database Webhook

In your Supabase dashboard:

1. Go to Database → Webhooks
2. Create a new webhook with:
   - **Name**: `email-confirmation-webhook`
   - **Table**: `public.email_confirmations`
   - **Events**: `INSERT`
   - **URL**: `https://your-project.supabase.co/functions/v1/handle-email-webhook`
   - **HTTP Headers**: `Authorization: Bearer YOUR_SUPABASE_ANON_KEY`

### 5. Verify Domain in Resend

Make sure you have verified the domain `comicscout.uk` in your Resend dashboard to send emails from `noreply@comicscout.uk`.

## How It Works

1. User signs up via the React app
2. Supabase creates a new user record with a confirmation token
3. Database trigger inserts a record into `email_confirmations` table
4. Database webhook calls `handle-email-webhook` function
5. Webhook function calls `send-confirmation-email` function
6. Resend API sends the confirmation email
7. User clicks the confirmation link
8. React app handles the confirmation via the `/auth/confirm` route

## Testing

To test the email confirmation flow:

1. Start your local development server
2. Go to the signup page
3. Create a new account
4. Check the `email_confirmations` table for the record
5. Check the function logs for any errors

## Troubleshooting

### Common Issues

1. **RESEND_API_KEY not found**: Make sure the secret is set in Supabase
2. **Domain not verified**: Verify `comicscout.uk` in Resend dashboard
3. **Webhook not firing**: Check the webhook configuration in Supabase dashboard
4. **Function errors**: Check the Edge Function logs in Supabase dashboard

### Debugging

Check the logs:
```bash
# View function logs
supabase functions logs send-confirmation-email
supabase functions logs handle-email-webhook
```

### Database Queries

Check pending email confirmations:
```sql
SELECT * FROM public.email_confirmations WHERE sent_at IS NULL;
```

Check failed attempts:
```sql
SELECT * FROM public.email_confirmations WHERE last_error IS NOT NULL;
```