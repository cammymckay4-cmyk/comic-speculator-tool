// Database schema types for Supabase with enriched comic data
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      comic_series: {
        Row: {
          id: string
          name: string
          publisher: string
          description: string | null
          series_id: string | null
          start_year: number | null
          created_at: string
          // NEW ENRICHMENT COLUMNS:
          enriched_data: Json | null  // Contains Wikidata QID, URLs, ComicVine ID, GCD ID, etc.
          is_enriched: boolean | null
          data_source: string | null
          last_enriched_at: string | null
          aliases: string[] | null
        }
        Insert: {
          id?: string
          name: string
          publisher: string
          description?: string | null
          series_id?: string | null
          start_year?: number | null
          created_at?: string
          enriched_data?: Json | null
          is_enriched?: boolean | null
          data_source?: string | null
          last_enriched_at?: string | null
          aliases?: string[] | null
        }
        Update: {
          id?: string
          name?: string
          publisher?: string
          description?: string | null
          series_id?: string | null
          start_year?: number | null
          created_at?: string
          enriched_data?: Json | null
          is_enriched?: boolean | null
          data_source?: string | null
          last_enriched_at?: string | null
          aliases?: string[] | null
        }
      }
      // Existing tables (preserved as-is)
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      alert_rule: {
        Row: {
          id: string
          user_id: string
          series_name: string
          issue_number: string | null
          grade_name: string | null
          threshold_gbp: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          series_name: string
          issue_number?: string | null
          grade_name?: string | null
          threshold_gbp: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          series_name?: string
          issue_number?: string | null
          grade_name?: string | null
          threshold_gbp?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      deal: {
        Row: {
          id: string
          series_name: string
          issue_number: string
          grade_name: string
          listing_price_gbp: number
          market_value_gbp: number
          deal_score: number
          source_url: string | null
          source_platform: string
          listing_end_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          series_name: string
          issue_number: string
          grade_name: string
          listing_price_gbp: number
          market_value_gbp: number
          deal_score: number
          source_url?: string | null
          source_platform: string
          listing_end_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          series_name?: string
          issue_number?: string
          grade_name?: string
          listing_price_gbp?: number
          market_value_gbp?: number
          deal_score?: number
          source_url?: string | null
          source_platform?: string
          listing_end_time?: string | null
          created_at?: string
        }
      }
      market_value: {
        Row: {
          id: string
          series_name: string
          issue_number: string
          grade_name: string
          median_price_gbp: number
          sample_count: number
          window_days: number
          last_updated: string
        }
        Insert: {
          id?: string
          series_name: string
          issue_number: string
          grade_name: string
          median_price_gbp: number
          sample_count: number
          window_days: number
          last_updated?: string
        }
        Update: {
          id?: string
          series_name?: string
          issue_number?: string
          grade_name?: string
          median_price_gbp?: number
          sample_count?: number
          window_days?: number
          last_updated?: string
        }
      }
    }
    Views: {
      enrichment_statistics: {
        Row: {
          publisher: string
          total_series: number
          enriched_series: number
          wikidata_linked: number
          enrichment_percentage: number
        }
      }
    }
    Functions: {
      search_enriched_series: {
        Args: { search_term: string }
        Returns: {
          id: string
          name: string
          publisher: string
          is_enriched: boolean
          wikidata_url: string | null
          comicvine_url: string | null
        }[]
      }
    }
  }
}