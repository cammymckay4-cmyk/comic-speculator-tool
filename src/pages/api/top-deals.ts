import { getTopDeals } from '../../lib/topDeals';
import { 
  withMiddleware, 
  createErrorResponse, 
  createSuccessResponse, 
  ErrorCode, 
  validateNumericRange,
  sanitizeString
} from '../../lib/middleware/auth';
import { applyRateLimit } from '../../lib/middleware/security';

/**
 * Enhanced API Handler for top deals endpoint with enrichment integration
 * GET /api/top-deals?minScore=10&searchTerms=term1,term2&enriched_only=true&publisher=Marvel
 */
async function handleTopDeals(request: Request): Promise<Response> {
  // Apply rate limiting
  const rateLimitResponse = applyRateLimit(request, 60000, 40); // 40 requests per minute
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  if (request.method !== 'GET') {
    return createErrorResponse(
      ErrorCode.INVALID_INPUT,
      'Only GET method allowed',
      405
    );
  }

  try {
    // Parse query parameters
    const url = new URL(request.url);
    const minScoreParam = url.searchParams.get('minScore');
    const searchTermsParam = url.searchParams.get('searchTerms');
    const enrichedOnlyParam = url.searchParams.get('enriched_only') === 'true';
    const publisherParam = url.searchParams.get('publisher');
    const wikidataOnlyParam = url.searchParams.get('wikidata_only') === 'true';

    // Validate and parse minScore with enhanced validation
    let minScore = 10; // default
    if (minScoreParam !== null) {
      try {
        minScore = validateNumericRange(minScoreParam, 0, 100, 'minScore');
      } catch (error) {
        return createErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          error instanceof Error ? error.message : 'Invalid minScore parameter',
          400
        );
      }
    }

    // Parse and sanitize search terms
    let searchTerms: string[] | undefined;
    if (searchTermsParam) {
      try {
        const sanitizedTerms = sanitizeString(searchTermsParam, 1000);
        searchTerms = sanitizedTerms
          .split(',')
          .map(term => sanitizeString(term.trim(), 100))
          .filter(term => term.length > 0);
        
        if (searchTerms.length === 0) {
          return createErrorResponse(
            ErrorCode.VALIDATION_ERROR,
            'Search terms cannot be empty after sanitization',
            400
          );
        }
        
        // Limit number of search terms for performance
        if (searchTerms.length > 10) {
          return createErrorResponse(
            ErrorCode.VALIDATION_ERROR,
            'Maximum 10 search terms allowed',
            400
          );
        }
      } catch (error) {
        return createErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          'Invalid search terms format',
          400
        );
      }
    }

    // Sanitize publisher filter
    let publisher: string | undefined;
    if (publisherParam) {
      try {
        publisher = sanitizeString(publisherParam, 100);
        // Validate against known publishers
        const allowedPublishers = ['Marvel', 'DC Comics', 'Dark Horse Comics', 'Image Comics', 'IDW Publishing'];
        if (!allowedPublishers.some(p => p.toLowerCase().includes(publisher!.toLowerCase()))) {
          return createErrorResponse(
            ErrorCode.VALIDATION_ERROR,
            'Invalid publisher filter',
            400
          );
        }
      } catch (error) {
        return createErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          'Invalid publisher parameter',
          400
        );
      }
    }

    // Enhanced filter options for enriched data
    const dealFilters = {
      minScore,
      searchTerms,
      enriched_only: enrichedOnlyParam,
      publisher,
      wikidata_only: wikidataOnlyParam
    };

    // Get enhanced top deals with enrichment data
    const topDeals = await getTopDeals(minScore, searchTerms, dealFilters);

    // Apply post-processing filters if needed
    let filteredDeals = topDeals;
    
    if (enrichedOnlyParam) {
      filteredDeals = filteredDeals.filter(deal => 
        deal.series?.is_enriched === true
      );
    }
    
    if (wikidataOnlyParam) {
      filteredDeals = filteredDeals.filter(deal => 
        deal.series?.enriched_data && 
        (deal.series.enriched_data as any).wikidata_qid
      );
    }
    
    if (publisher) {
      filteredDeals = filteredDeals.filter(deal =>
        deal.series?.publisher?.toLowerCase().includes(publisher!.toLowerCase())
      );
    }

    // Add enrichment insights to metadata
    const enrichmentStats = {
      total_deals: filteredDeals.length,
      enriched_deals: filteredDeals.filter(d => d.series?.is_enriched).length,
      wikidata_deals: filteredDeals.filter(d => d.series?.enriched_data && (d.series.enriched_data as any).wikidata_qid).length,
      average_score: filteredDeals.length > 0 
        ? Math.round((filteredDeals.reduce((sum, d) => sum + d.dealScore.score, 0) / filteredDeals.length) * 100) / 100
        : 0
    };

    return createSuccessResponse(
      filteredDeals,
      `Found ${filteredDeals.length} top deals`,
      200,
      {
        filters: dealFilters,
        enrichment_stats: enrichmentStats,
        performance: {
          cache_hint: 'Results cached for 5 minutes',
          query_time: new Date().toISOString()
        }
      }
    );

  } catch (error) {
    console.error('API Error in top-deals:', error);
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      'Failed to retrieve top deals',
      500,
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

export default async function handler(req: Request): Promise<Response> {
  return withMiddleware(req, handleTopDeals, false) // No auth required for public deals data
}

// Export for different runtime environments
export { handler as GET };