import { supabase } from '@/lib/supabaseClient'

// Interface for search results - simplified version of the comic data
export interface SearchResultComic {
  id: string
  title: string
  issueNumber: string
  publisher: string
  coverImageUrl: string
  marketValue: number
  isKeyIssue?: boolean
  keyNotes?: string
}

// Transform Supabase data to SearchResultComic format
const transformSearchResult = (data: any): SearchResultComic => {
  return {
    id: data.id,
    title: data.title,
    issueNumber: data.issue,
    publisher: data.publisher,
    coverImageUrl: data.cover_image,
    marketValue: data.market_value || 0,
    isKeyIssue: data.is_key_issue || false,
    keyNotes: data.key_notes
  }
}

const normalizeSearchTerm = (term: string): string => {
  // Handle hyphenated words - convert "spider-man" to "spiderman" for matching
  return term.toLowerCase().replace(/-/g, '')
}

const buildSearchQuery = (searchTerms: string[]) => {
  const conditions: string[] = []
  
  searchTerms.forEach(term => {
    const normalizedTerm = normalizeSearchTerm(term)
    // Search for each term in title OR issue fields
    // Also search for the original term with hyphens in case the data has hyphens
    const titleConditions = [
      `title.ilike.%${term}%`,
      `title.ilike.%${normalizedTerm}%`
    ]
    const issueConditions = [
      `issue.ilike.%${term}%`,
      `issue.ilike.%${normalizedTerm}%`
    ]
    
    // Combine title and issue conditions with OR
    const termConditions = [...titleConditions, ...issueConditions].join(',')
    conditions.push(`(${termConditions})`)
  })
  
  // Join all term conditions with AND - all terms must match somewhere
  return conditions.join(',')
}

export const searchPublicComics = async (searchTerm: string): Promise<SearchResultComic[]> => {
  if (!searchTerm || !searchTerm.trim()) {
    return []
  }

  const trimmedSearch = searchTerm.trim()
  // Split search term by spaces to handle partial matches
  const searchTerms = trimmedSearch.split(/\s+/).filter(term => term.length > 0)

  let query = supabase
    .from('comics')
    .select(`
      id,
      title,
      issue,
      publisher,
      cover_image,
      market_value,
      is_key_issue,
      key_notes
    `)

  if (searchTerms.length === 1) {
    // Single term - search in title OR issue
    const term = searchTerms[0]
    const normalizedTerm = normalizeSearchTerm(term)
    query = query.or(`title.ilike.%${term}%,title.ilike.%${normalizedTerm}%,issue.ilike.%${term}%,issue.ilike.%${normalizedTerm}%`)
  } else {
    // Multiple terms - use AND logic with each term matching title OR issue
    const searchConditions = buildSearchQuery(searchTerms)
    query = query.or(searchConditions)
  }

  const { data, error } = await query
    .order('title', { ascending: true })
    .limit(50) // Limit results for performance

  if (error) {
    throw new Error(`Failed to search comics: ${error.message}`)
  }

  if (!data) {
    return []
  }

  return data.map(transformSearchResult)
}