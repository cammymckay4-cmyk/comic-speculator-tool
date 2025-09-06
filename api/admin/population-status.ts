import { createClient } from '@supabase/supabase-js'

interface VercelRequest {
  method?: string;
  query: { [key: string]: string | string[] | undefined };
}

interface VercelResponse {
  status(code: number): VercelResponse;
  json(body: any): void;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
): Promise<void> {
  try {
    // Only allow GET requests
    if (request.method !== 'GET') {
      return response.status(405).json({ 
        error: 'Method Not Allowed',
        message: 'Only GET requests are allowed' 
      });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return response.status(500).json({
        error: 'Server Configuration Error',
        message: 'Database connection not configured'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query for total comics count
    const { count: totalCount, error: totalError } = await supabase
      .from('comics')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('Error querying total comics:', totalError);
      return response.status(500).json({
        error: 'Database Error',
        message: 'Failed to query total comics count'
      });
    }

    // Query for processed comics (those with at least one market value populated)
    const { count: processedCount, error: processedError } = await supabase
      .from('comics')
      .select('*', { count: 'exact', head: true })
      .or('market_value_low.not.is.null,market_value_medium.not.is.null,market_value_high.not.is.null');

    if (processedError) {
      console.error('Error querying processed comics:', processedError);
      return response.status(500).json({
        error: 'Database Error',
        message: 'Failed to query processed comics count'
      });
    }

    // Query for the most recent market value update timestamp
    const { data: latestUpdate, error: timestampError } = await supabase
      .from('comics')
      .select('market_value_updated_at')
      .not('market_value_updated_at', 'is', null)
      .order('market_value_updated_at', { ascending: false })
      .limit(1)
      .single();

    if (timestampError && timestampError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error querying latest update:', timestampError);
      return response.status(500).json({
        error: 'Database Error',
        message: 'Failed to query latest update timestamp'
      });
    }

    const total = totalCount ?? 0;
    const processed = processedCount ?? 0;
    const remaining = total - processed;
    const lastUpdated = latestUpdate?.market_value_updated_at || null;

    // Return the status information
    return response.status(200).json({
      processed: processed,
      remaining: remaining,
      total: total,
      lastUpdated: lastUpdated,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Population status API error:', error);
    
    return response.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}