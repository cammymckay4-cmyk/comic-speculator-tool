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

// Interface for search response with metadata
export interface SearchResponse {
  results: SearchResultComic[]
  correctedQuery?: string
  originalQuery: string
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
  // Handle hyphenated words, remove articles, and normalize case
  return term
    .toLowerCase()
    .replace(/^(the|a|an)\s+/i, '') // Remove leading articles
    .replace(/-/g, '') // Remove hyphens (spider-man -> spiderman)
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

// Create search variants for better matching
const createSearchVariants = (term: string): string[] => {
  const variants = new Set<string>()
  const normalized = normalizeSearchTerm(term)
  
  variants.add(term) // Original
  variants.add(normalized) // Normalized
  
  // Add hyphenated version if term contains common words that are often hyphenated
  if (term.toLowerCase().includes('spider') && term.toLowerCase().includes('man')) {
    variants.add(term.toLowerCase().replace(/spiderman/g, 'spider-man'))
    variants.add(term.toLowerCase().replace(/spider[\s-]*man/g, 'spiderman'))
  }
  
  return Array.from(variants).filter(v => v.length > 0)
}

// Helper function to build OR conditions for all variants of a term
const buildTermConditions = (term: string, fields: string[]): string => {
  const variants = createSearchVariants(term)
  const conditions = new Set<string>() // Use Set to avoid duplicates
  
  variants.forEach(variant => {
    fields.forEach(field => {
      conditions.add(`${field}.ilike.%${variant}%`)
    })
  })
  
  return Array.from(conditions).join(',')
}

export const searchPublicComics = async (searchTerm: string): Promise<SearchResponse> => {
  if (!searchTerm || !searchTerm.trim()) {
    return {
      results: [],
      originalQuery: searchTerm
    }
  }

  const trimmedSearch = searchTerm.trim()
  const originalQuery = trimmedSearch
  
  // Split search term by spaces to handle partial matches
  const searchTerms = trimmedSearch.split(/\s+/).filter(term => term.length > 0)
  
  // Create normalized version of query for correction display
  const normalizedTerms = searchTerms.map(normalizeSearchTerm).filter(term => term.length > 0)
  const correctedQuery = normalizedTerms.length > 0 && normalizedTerms.join(' ') !== trimmedSearch.toLowerCase() 
    ? normalizedTerms.join(' ') 
    : undefined

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

  // Build a single OR condition that searches for ANY of the terms in ANY field
  const allConditions = new Set<string>()
  
  searchTerms.forEach(term => {
    const termConditions = buildTermConditions(term, ['title', 'issue'])
    termConditions.split(',').forEach(condition => allConditions.add(condition))
  })

  if (allConditions.size > 0) {
    query = query.or(Array.from(allConditions).join(','))
  }

  const { data, error } = await query
    .order('title', { ascending: true })
    .limit(50) // Limit results for performance

  if (error) {
    throw new Error(`Failed to search comics: ${error.message}`)
  }

  if (!data) {
    return {
      results: [],
      originalQuery,
      correctedQuery
    }
  }

  return {
    results: data.map(transformSearchResult),
    originalQuery,
    correctedQuery
  }
}

// Legacy function for backward compatibility
export const searchComics = async (searchTerm: string): Promise<SearchResultComic[]> => {
  const response = await searchPublicComics(searchTerm)
  return response.results
}