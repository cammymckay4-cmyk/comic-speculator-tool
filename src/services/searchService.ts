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
    issueNumber: data.issueNumber,
    publisher: data.publisher,
    coverImageUrl: data.coverImage,
    marketValue: data.marketValue || 0,
    publicationYear: data.publicationYear,
    isKeyIssue: data.isKeyIssue || false,
    keyIssueReason: data.keyIssueReason
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
      issueNumber,
      publisher,
      coverImage,
      marketValue,
      publicationYear,
      isKeyIssue,
      keyIssueReason
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