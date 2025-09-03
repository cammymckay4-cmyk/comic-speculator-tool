import { serve } from "https://deno.land/std@0.210.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export type UserRole = 'user' | 'moderator' | 'admin'

interface AdminUser {
  id: string
  email: string
  username: string
  role: UserRole
  created_at: string
  last_sign_in_at?: string
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
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Create regular client for user authentication
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    // Extract JWT token from Bearer header
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    // Check if user has admin role
    const { data: profile, error: roleError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (roleError || !profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    // Parse the request URL to determine the endpoint
    const url = new URL(req.url)
    const pathname = url.pathname

    // Handle different endpoints
    if (pathname.endsWith('/list-users') && req.method === 'GET') {
      return await handleListUsers(supabaseAdmin)
    } else if (pathname.endsWith('/update-role') && req.method === 'POST') {
      const body = await req.json()
      return await handleUpdateRole(supabaseAdmin, body)
    } else {
      return new Response(
        JSON.stringify({ error: 'Endpoint not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

  } catch (error) {
    console.error('Error in admin-ops:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    )
  }
})

async function handleListUsers(supabaseAdmin: any): Promise<Response> {
  try {
    // Get all users from auth.users using admin client
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      throw authError
    }

    // Get profile data for all users including roles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, username, role')

    if (profileError) {
      throw profileError
    }

    // Combine auth data with profile data
    const users: AdminUser[] = authUsers.users.map((user: any) => {
      const profile = profiles?.find((p: any) => p.id === user.id)
      return {
        id: user.id,
        email: user.email || '',
        username: profile?.username || 'Unknown',
        role: profile?.role || 'user',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      }
    })

    return new Response(
      JSON.stringify({ users }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    )

  } catch (error) {
    console.error('Error listing users:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to list users', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    )
  }
}

async function handleUpdateRole(supabaseAdmin: any, body: any): Promise<Response> {
  try {
    const { userId, newRole } = body

    if (!userId || !newRole) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or newRole in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    // Validate role
    if (!['user', 'moderator', 'admin'].includes(newRole)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role specified' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    // Update the role in profiles table
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, message: 'User role updated successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    )

  } catch (error) {
    console.error('Error updating user role:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update user role', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    )
  }
}