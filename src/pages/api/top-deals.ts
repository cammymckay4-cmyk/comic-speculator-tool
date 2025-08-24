import { getTopDeals } from '../../lib/topDeals';

/**
 * API Handler for top deals endpoint
 * GET /api/top-deals?minScore=10&searchTerms=term1,term2
 */
export async function handler(request: Request): Promise<Response> {
  try {
    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }), 
        { 
          status: 405, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const minScoreParam = url.searchParams.get('minScore');
    const searchTermsParam = url.searchParams.get('searchTerms');

    // Validate and parse minScore
    let minScore = 10; // default
    if (minScoreParam !== null) {
      const parsed = parseInt(minScoreParam, 10);
      if (isNaN(parsed) || parsed < 0 || parsed > 100) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid minScore parameter. Must be a number between 0 and 100.' 
          }), 
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
      minScore = parsed;
    }

    // Parse search terms
    let searchTerms: string[] | undefined;
    if (searchTermsParam) {
      searchTerms = searchTermsParam
        .split(',')
        .map(term => term.trim())
        .filter(term => term.length > 0);
      
      if (searchTerms.length === 0) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid searchTerms parameter. Must be a comma-separated list of terms.' 
          }), 
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Get top deals
    const topDeals = await getTopDeals(minScore, searchTerms);

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        data: topDeals,
        meta: {
          count: topDeals.length,
          minScore,
          searchTerms: searchTerms || 'default',
          timestamp: new Date().toISOString()
        }
      }), 
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, max-age=300' // Cache for 5 minutes
        } 
      }
    );

  } catch (error) {
    console.error('API Error in top-deals:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Export for different runtime environments
export default handler;
export { handler as GET };