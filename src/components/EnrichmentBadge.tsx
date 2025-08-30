import { ExternalLink } from 'lucide-react'
import { Badge } from './ui/badge'
import type { EnrichedData } from '../lib/enrichment'
import { 
  getWikidataUrl, 
  getComicVineUrl, 
  getGrandComicsDatabaseUrl 
} from '../lib/enrichment'

interface EnrichmentBadgeProps {
  enrichedData: EnrichedData | null
  isEnriched: boolean
  className?: string
}

export function EnrichmentBadge({ enrichedData, isEnriched, className }: EnrichmentBadgeProps) {
  if (!isEnriched || !enrichedData) return null

  const wikidataUrl = getWikidataUrl(enrichedData)
  const comicVineUrl = getComicVineUrl(enrichedData)
  const gcdUrl = getGrandComicsDatabaseUrl(enrichedData)

  return (
    <div className={`flex gap-2 flex-wrap ${className}`}>
      {wikidataUrl && (
        <Badge variant="secondary" className="gap-1">
          <ExternalLink size={12} />
          <a 
            href={wikidataUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Wikidata Verified
          </a>
        </Badge>
      )}
      
      {comicVineUrl && (
        <Badge variant="outline" className="gap-1">
          <ExternalLink size={12} />
          <a 
            href={comicVineUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline"
          >
            ComicVine
          </a>
        </Badge>
      )}
      
      {gcdUrl && (
        <Badge variant="outline" className="gap-1">
          <ExternalLink size={12} />
          <a 
            href={gcdUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline"
          >
            GCD
          </a>
        </Badge>
      )}
    </div>
  )
}