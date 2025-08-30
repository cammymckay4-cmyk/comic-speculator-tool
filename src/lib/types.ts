// Core data types for the comic speculator tool

// Enriched data structure from Wikidata and external sources
export interface EnrichedData {
  wikidata_qid?: string;
  wikidata_url?: string;
  comicvine_id?: string;
  comicvine_url?: string;
  gcd_id?: string;
  gcd_url?: string;
  description?: string;
  first_appearance_year?: number;
  creator_names?: string[];
  genres?: string[];
  tags?: string[];
  external_links?: Record<string, string>;
}

// Enhanced series interface with enrichment support
export interface Series {
  seriesId: string;
  title: string;
  publisher: string;
  startYear: number;
  description?: string;
  aliases?: string[];
  // New enrichment fields
  enriched_data?: EnrichedData | null;
  is_enriched?: boolean;
  data_source?: string;
  last_enriched_at?: string;
}

// Database row type matching Supabase schema
export interface ComicSeriesRow {
  id: string;
  name: string;
  publisher: string;
  description?: string | null;
  series_id?: string | null;
  start_year?: number | null;
  created_at: string;
  enriched_data?: EnrichedData | null;
  is_enriched?: boolean | null;
  data_source?: string | null;
  last_enriched_at?: string | null;
  aliases?: string[] | null;
}

export interface Issue {
  issueId: string;
  seriesId: string;
  issueNumber: string;
  coverDate: string;
  startYear: number;
  keyNotes?: string;
}

export interface Grade {
  gradeId: string;
  scale: string;
  numeric?: number;
  label: string;
  certBody?: string;
  description?: string;
}

export interface Listing {
  listingId: string;
  issueId: string;
  gradeId: string;
  title: string;
  totalPriceGBP: number;
  source: string;
  endTime?: string;
  url?: string;
}

export interface MarketValue {
  marketValueId: string;
  issueId: string;
  gradeId: string;
  windowDays: number;
  sampleCount: number;
  medianGBP: number;
  meanGBP: number;
  stdDevGBP?: number;
  minGBP: number;
  maxGBP: number;
  lastUpdated: string;
}

export interface DealScoreInfo {
  dealScoreId: string;
  listingId: string;
  issueId: string;
  gradeId: string;
  marketValueGBP: number;
  totalPriceGBP: number;
  score: number;
  computedAt: string;
}

export interface ParsedTitle {
  series: string;
  issueNumber: string;
  variant?: string;
  publisher?: string;
}

export interface NormalizedListing {
  seriesId: string;
  issueNumber: string;
  grade: string;
  confidence: number;
  notes?: string;
}

export interface ConfidenceScore {
  series: number;
  issue: number;
  grade: number;
  overall: number;
}

export interface TopDeal {
  listing: Listing;
  marketValue: MarketValue;
  dealScore: DealScoreInfo;
  series?: ComicSeriesRow;
  enrichmentBonus?: number;
}

// Enhanced search result with enrichment data
export interface EnrichedSearchResult {
  id: string;
  name: string;
  publisher: string;
  is_enriched: boolean;
  wikidata_url?: string | null;
  comicvine_url?: string | null;
  enriched_data?: EnrichedData | null;
}

// Enrichment statistics view
export interface EnrichmentStats {
  publisher: string;
  total_series: number;
  enriched_series: number;
  wikidata_linked: number;
  enrichment_percentage: number;
}

// API Response standardization
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    timestamp: string;
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: any;
  };
}

// Enhanced authentication result
export interface AuthResult {
  user: any | null;
  error?: string;
  isActive?: boolean;
  emailVerified?: boolean;
}

// Security and validation types
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INVALID_INPUT = 'INVALID_INPUT'
}