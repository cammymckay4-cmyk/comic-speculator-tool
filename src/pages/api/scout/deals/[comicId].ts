import { supabase } from '../../../../lib/supabaseClient';

interface ScoutDealsResponse {
  success: boolean;
  data?: DealResult[];
  error?: string;
  message?: string;
  meta?: {
    count: number;
    comic_id: string;
    timestamp: string;
  };
}

interface DealResult {
  deal_id: string;
  deal_score: number;
  potential_profit?: number;
  profit_percentage?: number;
  deal_type: string;
  confidence_level: string;
  expires_at?: string;
  
  // Listing details
  listing: {
    id: string;
    title: string;
    price: number;
    shipping_cost?: number;
    total_price: number;
    source: string;
    auction_type?: string;
    ends_at?: string;
    url?: string;
  };
  
  // Comic details
  comic: {
    series_name: string;
    series_publisher?: string;
    issue_number: string;
    variant?: string;
    key_issue?: boolean;
    grade_label?: string;
    grade_company?: string;
  };
  
  // Market context
  market: {
    median_value: number;
    sample_count: number;
    last_updated: string;
  };
}

/**
 * Extract and validate JWT token from Authorization header
 */
async function validateAuthToken(request: Request): Promise<{ user: any; error?: string }> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Authorization header required' };
  }

  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { user: null, error: 'Invalid or expired token' };
    }
    
    return { user };
  } catch (error) {
    return { user: null, error: 'Token validation failed' };
  }
}

/**
 * GET /api/scout/deals/{comicId} - Retrieve live ranked deals for a specific comic
 */
async function handleGetScoutDeals(request: Request, comicId: string): Promise<Response> {
  const { user, error: authError } = await validateAuthToken(request);
  
  if (authError || !user) {
    return new Response(
      JSON.stringify({ success: false, error: authError || 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Validate comicId format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(comicId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid comic ID format. Must be a valid UUID.' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse query parameters for filtering
    const url = new URL(request.url);
    const minScore = parseFloat(url.searchParams.get('minScore') || '0');
    const maxPrice = url.searchParams.get('maxPrice') ? parseFloat(url.searchParams.get('maxPrice')!) : null;
    const dealType = url.searchParams.get('dealType');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

    // Query for active deals matching the comic ID
    // Join with normalized_listings to get comic details and active deals
    let query = supabase
      .from('deals')
      .select(`
        id,
        deal_score,
        potential_profit,
        profit_percentage,
        deal_type,
        confidence_level,
        expires_at,
        
        normalized_listings!inner (
          id,
          title,
          price,
          shipping_cost,
          source,
          auction_type,
          ends_at,
          listing_url,
          
          comic_series!inner (
            id,
            name,
            publisher
          ),
          comic_issues!inner (
            id,
            issue_number,
            variant,
            key_issue
          ),
          grading_standards (
            company,
            grade_label,
            grade_value
          )
        ),
        
        market_values (
          median_price_gbp,
          sample_count,
          last_updated
        )
      `)
      .eq('is_active', true)
      .eq('normalized_listings.comic_issues.id', comicId)
      .gte('deal_score', minScore)
      .order('deal_score', { ascending: false })
      .limit(limit);

    // Apply additional filters
    if (maxPrice !== null) {
      query = query.lte('normalized_listings.price', maxPrice);
    }

    if (dealType) {
      query = query.eq('deal_type', dealType);
    }

    const { data: deals, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to retrieve deals' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Transform the data into the expected format
    const transformedDeals: DealResult[] = (deals || []).map((deal: any) => {
      const listing = deal.normalized_listings;
      const comic = listing.comic_issues;
      const series = listing.comic_series;
      const grade = listing.grading_standards;
      const market = deal.market_values;

      const totalPrice = (listing.price || 0) + (listing.shipping_cost || 0);

      return {
        deal_id: deal.id,
        deal_score: deal.deal_score,
        potential_profit: deal.potential_profit,
        profit_percentage: deal.profit_percentage,
        deal_type: deal.deal_type,
        confidence_level: deal.confidence_level,
        expires_at: deal.expires_at,
        
        listing: {
          id: listing.id,
          title: listing.title,
          price: listing.price || 0,
          shipping_cost: listing.shipping_cost || 0,
          total_price: totalPrice,
          source: listing.source,
          auction_type: listing.auction_type,
          ends_at: listing.ends_at,
          url: listing.listing_url
        },
        
        comic: {
          series_name: series.name,
          series_publisher: series.publisher,
          issue_number: comic.issue_number,
          variant: comic.variant,
          key_issue: comic.key_issue,
          grade_label: grade?.grade_label,
          grade_company: grade?.company
        },
        
        market: {
          median_value: market?.median_price_gbp || 0,
          sample_count: market?.sample_count || 0,
          last_updated: market?.last_updated || new Date().toISOString()
        }
      };
    });

    const response: ScoutDealsResponse = {
      success: true,
      data: transformedDeals,
      message: `Retrieved ${transformedDeals.length} deals for comic`,
      meta: {
        count: transformedDeals.length,
        comic_id: comicId,
        timestamp: new Date().toISOString()
      }
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, max-age=300' // Cache for 5 minutes
        } 
      }
    );

  } catch (error) {
    console.error('API Error in GET /api/scout/deals/[comicId]:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Main API handler for /api/scout/deals/[comicId]
 */
export async function handler(request: Request): Promise<Response> {
  try {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Extract comicId from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const comicId = pathParts[pathParts.length - 1];

    if (!comicId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Comic ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    switch (request.method) {
      case 'GET':
        return handleGetScoutDeals(request, comicId);
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Method not allowed' }),
          { status: 405, headers: { 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('API Error in /api/scout/deals/[comicId]:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Export for different runtime environments
export default handler;
export { handler as GET };