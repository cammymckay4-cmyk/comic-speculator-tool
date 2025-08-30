import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../../lib/database'
import { 
  withMiddleware, 
  createErrorResponse, 
  createSuccessResponse, 
  ErrorCode, 
  sanitizeString,
  validatePagination
} from '../../../lib/middleware/auth'
import { applyRateLimit } from '../../../lib/middleware/security'
import type { EnrichedSearchResult } from '../../../lib/types'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

async function handleEnhancedSearch(request: Request): Promise<Response> {
  // Apply rate limiting - more restrictive for search
  const rateLimitResponse = applyRateLimit(request, 60000, 30); // 30 requests per minute
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  if (request.method !== 'GET') {
    return createErrorResponse(
      ErrorCode.INVALID_INPUT,
      `Method ${request.method} not allowed`,
      405
    )
  }

  try {
    const url = new URL(request.url)
    const searchQuery = url.searchParams.get('q')
    const enrichedOnly = url.searchParams.get('enriched_only') === 'true'
    const publisher = url.searchParams.get('publisher')
    const limitParam = url.searchParams.get('limit')
    const offsetParam = url.searchParams.get('offset')

    if (!searchQuery) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Search query parameter "q" is required',
        400
      )
    }

    // Sanitize and validate search query
    const sanitizedQuery = sanitizeString(searchQuery, 200)
    
    // Minimum query length for performance
    if (sanitizedQuery.length < 2) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Search query must be at least 2 characters long',
        400
      )
    }

    // Validate pagination
    const { limit, offset } = validatePagination(limitParam, offsetParam)

    // Use the enhanced search function with additional filtering
    let query = supabase.rpc('search_enriched_series', { 
      search_term: sanitizedQuery 
    })

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        'Search operation failed',
        500,
        { databaseError: error.message }
      )
    }

    // Apply additional filters in memory if needed
    let results = (data as EnrichedSearchResult[]) || []
    
    if (enrichedOnly) {
      results = results.filter(series => series.is_enriched)
    }
    
    if (publisher) {
      const sanitizedPublisher = sanitizeString(publisher, 100)
      results = results.filter(series => 
        series.publisher.toLowerCase().includes(sanitizedPublisher.toLowerCase())
      )
    }

    // Apply pagination
    const total = results.length
    const paginatedResults = results.slice(offset, offset + limit)

    // Add search relevance scoring
    const scoredResults = paginatedResults.map(series => ({
      ...series,
      relevance_score: calculateRelevanceScore(series, sanitizedQuery),
      enrichment_indicators: {
        wikidata_available: !!series.wikidata_url,
        comicvine_available: !!series.comicvine_url,
        fully_enriched: series.is_enriched && !!(series.enriched_data as any)?.wikidata_qid
      }
    }))

    // Sort by relevance score
    scoredResults.sort((a, b) => b.relevance_score - a.relevance_score)

    return createSuccessResponse(
      scoredResults,
      `Found ${total} matching series`,
      200,
      {
        total,
        page: Math.floor(offset / limit) + 1,
        limit,
        offset,
        search_query: sanitizedQuery,
        filters: {
          enriched_only,
          publisher
        },
        search_performance: {
          query_length: sanitizedQuery.length,
          result_count: total,
          enriched_results: scoredResults.filter(s => s.is_enriched).length
        }
      }
    )

  } catch (err) {
    console.error('Search error:', err)
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      'Search service temporarily unavailable',
      500,
      { error: err instanceof Error ? err.message : 'Unknown error' }
    )
  }
}

/**
 * Calculate relevance score for search results
 */
function calculateRelevanceScore(series: EnrichedSearchResult, query: string): number {
  let score = 0
  const lowerQuery = query.toLowerCase()
  const lowerName = series.name.toLowerCase()
  
  // Exact match gets highest score
  if (lowerName === lowerQuery) {
    score += 100
  }
  // Starts with query
  else if (lowerName.startsWith(lowerQuery)) {
    score += 80
  }
  // Contains query
  else if (lowerName.includes(lowerQuery)) {
    score += 60
  }
  
  // Bonus for enriched series
  if (series.is_enriched) {
    score += 20
  }
  
  // Bonus for Wikidata linking
  if (series.wikidata_url) {
    score += 10
  }
  
  // Bonus for major publishers
  if (['Marvel', 'DC Comics'].includes(series.publisher)) {
    score += 5
  }
  
  return score
}

export default async function handler(req: Request): Promise<Response> {
  return withMiddleware(req, handleEnhancedSearch, false) // No auth required for search
}

// Export for different runtime environments
export { handler as GET }