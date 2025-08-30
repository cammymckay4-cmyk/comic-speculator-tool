import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../../lib/database'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: `Method ${req.method} not allowed` }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const url = new URL(req.url)
    const publisher = url.searchParams.get('publisher')
    const limit = Number(url.searchParams.get('limit')) || 50

    let query = supabase
      .from('comic_series')
      .select('*')
      .eq('is_enriched', true)
      .order('name')
      .limit(limit)

    if (publisher) {
      query = query.eq('publisher', publisher)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}