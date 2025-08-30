// Types for comic series enrichment data
export interface EnrichedData {
  wikidata_qid?: string
  wikidata_url?: string
  comicvine_id?: string
  comicvine_url?: string
  gcd_id?: number
  gcd_url?: string
  publication_years?: {
    start: number
    end?: number
  }
  issue_count?: number
  publisher_type: 'Marvel' | 'DC'
  genre: string[]
  data_source: string
  enrichment_date: string
}

export interface EnrichedSeries {
  id: string
  name: string
  publisher: string
  is_enriched: boolean
  enriched_data: EnrichedData | null
  wikidata_url?: string
  comicvine_url?: string
  description?: string | null
  series_id?: string | null
  start_year?: number | null
  aliases?: string[] | null
  created_at: string
  data_source?: string | null
  last_enriched_at?: string | null
}

export interface EnrichmentStatistics {
  publisher: string
  total_series: number
  enriched_series: number
  wikidata_linked: number
  enrichment_percentage: number
}

export interface SearchResult {
  id: string
  name: string
  publisher: string
  is_enriched: boolean
  wikidata_url: string | null
  comicvine_url: string | null
}

// Utility functions for working with enriched data
export function getWikidataUrl(enrichedData: EnrichedData | null): string | null {
  if (!enrichedData?.wikidata_qid) return null
  return `https://www.wikidata.org/wiki/${enrichedData.wikidata_qid}`
}

export function getComicVineUrl(enrichedData: EnrichedData | null): string | null {
  if (!enrichedData?.comicvine_id) return null
  return `https://comicvine.gamespot.com/volume/4050-${enrichedData.comicvine_id}`
}

export function getGrandComicsDatabaseUrl(enrichedData: EnrichedData | null): string | null {
  if (!enrichedData?.gcd_id) return null
  return `https://www.comics.org/series/${enrichedData.gcd_id}/`
}

export function hasExternalLinks(enrichedData: EnrichedData | null): boolean {
  return !!(
    enrichedData?.wikidata_qid ||
    enrichedData?.comicvine_id ||
    enrichedData?.gcd_id
  )
}

export function getEnrichmentLevel(series: EnrichedSeries): 'none' | 'basic' | 'verified' {
  if (!series.is_enriched || !series.enriched_data) return 'none'
  if (series.enriched_data.wikidata_qid) return 'verified'
  return 'basic'
}