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

// Helper function to build OR conditions without duplicates
const buildTermConditions = (term: string, fields: string[]): string => {
  const normalizedTerm = normalizeSearchTerm(term)
  const conditions = new Set<string>() // Use Set to avoid duplicates
  
  fields.forEach(field => {
    conditions.add(`${field}.ilike.%${term}%`)
    // Only add normalized version if it's different from original
    if (normalizedTerm !== term) {
      conditions.add(`${field}.ilike.%${normalizedTerm}%`)
    }
  })
  
  return Array.from(conditions).join(',')
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
    const conditions = buildTermConditions(term, ['title', 'issue'])
    query = query.or(conditions)
  } else {
    // Multiple terms - chain OR conditions, each term must match somewhere
    searchTerms.forEach(term => {
      const conditions = buildTermConditions(term, ['title', 'issue'])
      query = query.or(conditions)
    })
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