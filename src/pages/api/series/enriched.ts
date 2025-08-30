import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../../lib/database'
import { 
  withMiddleware, 
  createErrorResponse, 
  createSuccessResponse, 
  ErrorCode, 
  validatePagination, 
  sanitizeString 
} from '../../../lib/middleware/auth'
import { applyRateLimit } from '../../../lib/middleware/security'
import type { ComicSeriesRow } from '../../../lib/types'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

async function handleGetEnrichedSeries(request: Request): Promise<Response> {
  // Apply rate limiting
  const rateLimitResponse = applyRateLimit(request, 60000, 50); // 50 requests per minute
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
    
    // Validate and sanitize parameters
    let publisher = url.searchParams.get('publisher')
    const limitParam = url.searchParams.get('limit')
    const offsetParam = url.searchParams.get('offset')
    const wikidata_only = url.searchParams.get('wikidata_only') === 'true'
    
    // Validate pagination
    const { limit, offset } = validatePagination(limitParam, offsetParam)
    
    // Sanitize publisher filter
    if (publisher) {
      publisher = sanitizeString(publisher, 100)
      // Validate against known publishers for security
      const allowedPublishers = ['Marvel', 'DC Comics', 'Dark Horse Comics', 'Image Comics', 'IDW Publishing']
      if (!allowedPublishers.some(p => p.toLowerCase().includes(publisher!.toLowerCase()))) {
        return createErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          'Invalid publisher filter',
          400
        )
      }
    }

    // Build secure query with proper filtering
    let query = supabase
      .from('comic_series')
      .select(`
        id,
        name,
        publisher,
        description,
        series_id,
        start_year,
        enriched_data,
        is_enriched,
        data_source,
        last_enriched_at,
        aliases
      `, { count: 'exact' })
      .eq('is_enriched', true)
      .order('name')
      .range(offset, offset + limit - 1)

    if (publisher) {
      query = query.ilike('publisher', `%${publisher}%`)
    }

    if (wikidata_only) {
      query = query.not('enriched_data->wikidata_qid', 'is', null)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        'Failed to retrieve enriched series data',
        500,
        { databaseError: error.message }
      )
    }

    // Transform data to include enrichment metadata
    const enrichedSeries = (data as ComicSeriesRow[] || []).map(series => ({
      ...series,
      enrichment_quality: {
        has_wikidata: !!(series.enriched_data as any)?.wikidata_qid,
        has_comicvine: !!(series.enriched_data as any)?.comicvine_id,
        has_gcd: !!(series.enriched_data as any)?.gcd_id,
        alias_count: series.aliases?.length || 0
      }
    }))

    return createSuccessResponse(
      enrichedSeries,
      `Retrieved ${enrichedSeries.length} enriched series`,
      200,
      {
        total: count || enrichedSeries.length,
        page: Math.floor(offset / limit) + 1,
        limit,
        offset,
        filters: {
          publisher,
          wikidata_only
        }
      }
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      'Internal server error',
      500,
      { error: err instanceof Error ? err.message : 'Unknown error' }
    )
  }
}

export default async function handler(req: Request): Promise<Response> {
  return withMiddleware(req, handleGetEnrichedSeries, false) // No auth required for public data
}

// Export for different runtime environments
export { handler as GET }