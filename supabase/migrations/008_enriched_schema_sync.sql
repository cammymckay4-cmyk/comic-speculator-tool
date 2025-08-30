-- Ensure comic_series table has enrichment columns to match live database
-- This migration syncs the repository with the successfully enriched live database

-- Add enrichment columns if they don't exist
ALTER TABLE comic_series ADD COLUMN IF NOT EXISTS enriched_data JSONB;
ALTER TABLE comic_series ADD COLUMN IF NOT EXISTS is_enriched BOOLEAN DEFAULT FALSE;
ALTER TABLE comic_series ADD COLUMN IF NOT EXISTS data_source TEXT;
ALTER TABLE comic_series ADD COLUMN IF NOT EXISTS last_enriched_at TIMESTAMPTZ;
ALTER TABLE comic_series ADD COLUMN IF NOT EXISTS aliases TEXT[];

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comic_series_enriched ON comic_series(is_enriched);
CREATE INDEX IF NOT EXISTS idx_comic_series_publisher ON comic_series(publisher);
CREATE INDEX IF NOT EXISTS idx_comic_series_enriched_data ON comic_series USING GIN(enriched_data);

-- Create the enrichment statistics view
CREATE OR REPLACE VIEW enrichment_statistics AS
SELECT 
    publisher,
    COUNT(*) as total_series,
    COUNT(*) FILTER (WHERE is_enriched = true) as enriched_series,
    COUNT(*) FILTER (WHERE enriched_data ? 'wikidata_qid') as wikidata_linked,
    ROUND(
        COUNT(*) FILTER (WHERE is_enriched = true) * 100.0 / COUNT(*), 
        1
    ) as enrichment_percentage
FROM comic_series
WHERE publisher IN ('Marvel', 'DC Comics')
GROUP BY publisher

UNION ALL

SELECT 
    'Total' as publisher,
    COUNT(*) as total_series,
    COUNT(*) FILTER (WHERE is_enriched = true) as enriched_series,
    COUNT(*) FILTER (WHERE enriched_data ? 'wikidata_qid') as wikidata_linked,
    ROUND(
        COUNT(*) FILTER (WHERE is_enriched = true) * 100.0 / COUNT(*), 
        1
    ) as enrichment_percentage
FROM comic_series
WHERE publisher IN ('Marvel', 'DC Comics');

-- Create the enhanced search function
CREATE OR REPLACE FUNCTION search_enriched_series(search_term TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    publisher TEXT,
    is_enriched BOOLEAN,
    wikidata_url TEXT,
    comicvine_url TEXT
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
        END as comicvine_url
    FROM comic_series cs
    WHERE 
        cs.name ILIKE '%' || search_term || '%'
        OR (cs.aliases IS NOT NULL AND cs.aliases::TEXT ILIKE '%' || search_term || '%')
    ORDER BY 
        cs.is_enriched DESC,
        cs.name;
END;
$$ LANGUAGE plpgsql;

-- Add comments to document the enriched schema
COMMENT ON COLUMN comic_series.enriched_data IS 'JSONB containing Wikidata QID, ComicVine ID, GCD ID, and other enrichment metadata';
COMMENT ON COLUMN comic_series.is_enriched IS 'Boolean flag indicating whether series has been enriched with external data';
COMMENT ON COLUMN comic_series.data_source IS 'Source of enrichment data (e.g., "wikidata", "comicvine", "gcd")';
COMMENT ON COLUMN comic_series.last_enriched_at IS 'Timestamp of last enrichment update';
COMMENT ON COLUMN comic_series.aliases IS 'Array of alternative names/aliases for the series';

COMMENT ON VIEW enrichment_statistics IS 'Statistics showing enrichment coverage by publisher';
COMMENT ON FUNCTION search_enriched_series IS 'Enhanced search function that includes series aliases and returns external URLs';