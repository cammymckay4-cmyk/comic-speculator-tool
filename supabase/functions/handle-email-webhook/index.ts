import { serve } from "https://deno.land/std@0.210.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: any
  schema: string
  old_record?: any
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: WebhookPayload = await req.json()
    
    // Only handle INSERT operations on email_confirmations table
    if (payload.type !== 'INSERT' || payload.table !== 'email_confirmations') {
      return new Response(
        JSON.stringify({ message: 'Not an email confirmation insert' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    const { record } = payload
    const { id, email, confirmation_url } = record

    if (!email || !confirmation_url) {
      console.error('Missing email or confirmation_url in webhook payload')
      return new Response(
        JSON.stringify({ error: 'Invalid payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    try {
      // Call the send-confirmation-email function
      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-confirmation-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          confirmation_url
        })
      })

      if (emailResponse.ok) {
        // Update the email_confirmations record as sent
        await supabase
          .from('email_confirmations')
          .update({ 
            sent_at: new Date().toISOString(),
            attempts: record.attempts + 1 
          })
          .eq('id', id)

        console.log(`Confirmation email sent successfully to ${email}`)
        
        return new Response(
          JSON.stringify({ success: true, message: 'Email sent successfully' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
        )
      } else {
        const errorText = await emailResponse.text()
        console.error('Failed to send email:', errorText)
        
        // Update with error
        await supabase
          .from('email_confirmations')
          .update({ 
            attempts: record.attempts + 1,
            last_error: errorText
          })
          .eq('id', id)

        return new Response(
          JSON.stringify({ error: 'Failed to send email', details: errorText }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
        )
      }

    } catch (emailError) {
      console.error('Error sending email:', emailError)
      
      // Update with error
      await supabase
        .from('email_confirmations')
        .update({ 
          attempts: record.attempts + 1,
          last_error: emailError.message
        })
        .eq('id', id)

      return new Response(
        JSON.stringify({ error: 'Failed to send email', message: emailError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

  } catch (error) {
    console.error('Error in handle-email-webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    )
  }
})