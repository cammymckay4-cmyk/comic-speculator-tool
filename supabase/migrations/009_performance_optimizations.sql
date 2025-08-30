-- Performance optimizations for enriched comic series database
-- This migration adds indexes and optimizations for JSONB queries

-- Add specialized GIN indexes for JSONB enriched_data queries
CREATE INDEX IF NOT EXISTS idx_comic_series_wikidata_qid 
ON comic_series USING GIN ((enriched_data->'wikidata_qid'));

CREATE INDEX IF NOT EXISTS idx_comic_series_comicvine_id 
ON comic_series USING GIN ((enriched_data->'comicvine_id'));

CREATE INDEX IF NOT EXISTS idx_comic_series_gcd_id 
ON comic_series USING GIN ((enriched_data->'gcd_id'));

-- Create composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_comic_series_enriched_publisher 
ON comic_series (is_enriched, publisher) 
WHERE is_enriched = true;

-- Add index for alias searches (GIN index for array operations)
CREATE INDEX IF NOT EXISTS idx_comic_series_aliases 
ON comic_series USING GIN (aliases);

-- Add index for name searches with case-insensitive pattern matching
CREATE INDEX IF NOT EXISTS idx_comic_series_name_trgm 
ON comic_series USING GIN (name gin_trgm_ops);

-- Enable trigram extension if not already enabled (for fuzzy text search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Optimize the search function for better performance
CREATE OR REPLACE FUNCTION search_enriched_series_optimized(search_term TEXT, limit_count INT DEFAULT 50)
RETURNS TABLE (
    id UUID,
    name TEXT,
    publisher TEXT,
    is_enriched BOOLEAN,
    wikidata_url TEXT,
    comicvine_url TEXT,
    relevance_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cs.id,
        cs.name,
        cs.publisher,
        cs.is_enriched,
        CASE 
            WHEN cs.enriched_data ? 'wikidata_qid' 
            THEN 'https://www.wikidata.org/wiki/' || (cs.enriched_data->>'wikidata_qid')
            ELSE NULL
        END as wikidata_url,
        CASE 
            WHEN cs.enriched_data ? 'comicvine_id' 
            THEN 'https://comicvine.gamespot.com/volume/4050-' || (cs.enriched_data->>'comicvine_id')
            ELSE NULL
        END as comicvine_url,
        CASE 
            WHEN cs.name ILIKE search_term THEN 1.0
            WHEN cs.name ILIKE '%' || search_term || '%' THEN 0.8
            WHEN cs.aliases IS NOT NULL AND cs.aliases::TEXT ILIKE '%' || search_term || '%' THEN 0.6
            ELSE similarity(cs.name, search_term)
        END as relevance_score
    FROM comic_series cs
    WHERE 
        cs.name % search_term -- Use trigram similarity operator
        OR cs.name ILIKE '%' || search_term || '%'
        OR (cs.aliases IS NOT NULL AND cs.aliases::TEXT ILIKE '%' || search_term || '%')
    ORDER BY 
        relevance_score DESC,
        cs.is_enriched DESC NULLS LAST,
        cs.name
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create a materialized view for enrichment statistics (better performance for dashboard)
CREATE MATERIALIZED VIEW IF NOT EXISTS enrichment_statistics_mv AS
SELECT 
    publisher,
    COUNT(*) as total_series,
    COUNT(*) FILTER (WHERE is_enriched = true) as enriched_series,
    COUNT(*) FILTER (WHERE enriched_data ? 'wikidata_qid') as wikidata_linked,
    COUNT(*) FILTER (WHERE enriched_data ? 'comicvine_id') as comicvine_linked,
    COUNT(*) FILTER (WHERE enriched_data ? 'gcd_id') as gcd_linked,
    ROUND(
        COUNT(*) FILTER (WHERE is_enriched = true) * 100.0 / COUNT(*), 
        1
    ) as enrichment_percentage,
    AVG(array_length(aliases, 1)) as avg_alias_count,
    MAX(last_enriched_at) as last_update
FROM comic_series
WHERE publisher IN ('Marvel', 'DC Comics', 'Dark Horse Comics', 'Image Comics', 'IDW Publishing')
GROUP BY publisher

UNION ALL

SELECT 
    'Total' as publisher,
    COUNT(*) as total_series,
    COUNT(*) FILTER (WHERE is_enriched = true) as enriched_series,
    COUNT(*) FILTER (WHERE enriched_data ? 'wikidata_qid') as wikidata_linked,
    COUNT(*) FILTER (WHERE enriched_data ? 'comicvine_id') as comicvine_linked,
    COUNT(*) FILTER (WHERE enriched_data ? 'gcd_id') as gcd_linked,
    ROUND(
        COUNT(*) FILTER (WHERE is_enriched = true) * 100.0 / COUNT(*), 
        1
    ) as enrichment_percentage,
    AVG(array_length(aliases, 1)) as avg_alias_count,
    MAX(last_enriched_at) as last_update
FROM comic_series
WHERE publisher IN ('Marvel', 'DC Comics', 'Dark Horse Comics', 'Image Comics', 'IDW Publishing');

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrichment_stats_mv_publisher 
ON enrichment_statistics_mv (publisher);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_enrichment_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY enrichment_statistics_mv;
END;
$$ LANGUAGE plpgsql;

-- Add database performance monitoring function
CREATE OR REPLACE FUNCTION analyze_enrichment_performance()
RETURNS TABLE (
    query_type TEXT,
    avg_duration_ms NUMERIC,
    total_calls BIGINT,
    performance_notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'enriched_series_queries'::TEXT as query_type,
        0.0::NUMERIC as avg_duration_ms, -- Would be populated by actual monitoring
        0::BIGINT as total_calls,
        'Monitor queries using pg_stat_statements for actual metrics'::TEXT as performance_notes;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON INDEX idx_comic_series_wikidata_qid IS 'GIN index for fast Wikidata QID lookups in enriched_data JSONB';
COMMENT ON INDEX idx_comic_series_comicvine_id IS 'GIN index for fast ComicVine ID lookups in enriched_data JSONB';
COMMENT ON INDEX idx_comic_series_name_trgm IS 'Trigram GIN index for fuzzy text search on series names';
COMMENT ON MATERIALIZED VIEW enrichment_statistics_mv IS 'Cached enrichment statistics for dashboard performance';
COMMENT ON FUNCTION search_enriched_series_optimized IS 'Optimized search with relevance scoring and performance improvements';

-- Create a function to get enrichment quality metrics
CREATE OR REPLACE FUNCTION get_enrichment_quality_metrics()
RETURNS TABLE (
    metric_name TEXT,
    metric_value NUMERIC,
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'data_completeness'::TEXT,
        ROUND(COUNT(*) FILTER (WHERE 
            is_enriched = true AND 
            enriched_data ? 'wikidata_qid' AND 
            enriched_data ? 'description'
        ) * 100.0 / COUNT(*), 2) as metric_value,
        'Percentage of series with both Wikidata and description data'::TEXT
    FROM comic_series WHERE is_enriched = true

    UNION ALL

    SELECT 
        'external_linking_coverage'::TEXT,
        ROUND(COUNT(*) FILTER (WHERE 
            enriched_data ? 'wikidata_qid' OR 
            enriched_data ? 'comicvine_id' OR 
            enriched_data ? 'gcd_id'
        ) * 100.0 / COUNT(*), 2),
        'Percentage of enriched series with external database links'::TEXT
    FROM comic_series WHERE is_enriched = true

    UNION ALL

    SELECT 
        'alias_coverage'::TEXT,
        ROUND(COUNT(*) FILTER (WHERE aliases IS NOT NULL AND array_length(aliases, 1) > 0) * 100.0 / COUNT(*), 2),
        'Percentage of enriched series with alias data for enhanced search'::TEXT
    FROM comic_series WHERE is_enriched = true;
END;
$$ LANGUAGE plpgsql;