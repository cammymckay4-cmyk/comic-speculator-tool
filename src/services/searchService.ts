import { supabase } from '@/lib/supabaseClient'

// Interface for search results - simplified version of the comic data
export interface SearchResultComic {
  id: string
  title: string
  issueNumber: string
  publisher: string
  coverImageUrl: string
  marketValue: number
  publicationYear?: number
  isKeyIssue?: boolean
  keyIssueReason?: string
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
    publicationYear: data.publication_year,
    isKeyIssue: data.is_key_issue || false,
    keyIssueReason: data.key_issue_reason
  }
}

export const searchPublicComics = async (searchTerm: string): Promise<SearchResultComic[]> => {
  if (!searchTerm || !searchTerm.trim()) {
    return []
  }

  const trimmedSearch = searchTerm.trim()

  // Search across title, issue, and publisher fields using Supabase's ilike for case-insensitive search
  const { data, error } = await supabase
    .from('comics')
    .select(`
      id,
      title,
      issue,
      publisher,
      cover_image,
      market_value,
      publication_year,
      is_key_issue,
      key_issue_reason
    `)
    .ilike('title', `%${trimmedSearch}%`)
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