import { supabase } from '@/lib/supabaseClient'
import type { CollectionComic, Comic } from '@/lib/types'

// Interface for the comics table in Supabase
export interface SupabaseComic {
  id: string
  title: string
  issue: string
  publisher: string
  cover_image: string
  market_value: number
  condition: string
  purchase_price?: number
  purchase_date?: string
  created_at: string
  user_id: string
  // Add other fields as needed based on your Supabase schema
}

// Transform Supabase data to match our frontend types
const transformSupabaseComic = (supabaseComic: SupabaseComic): CollectionComic => {
  // Create a Comic object from the Supabase data
  const comic: Comic = {
    id: supabaseComic.id,
    title: supabaseComic.title,
    issue: supabaseComic.issue,
    issueNumber: parseInt(supabaseComic.issue.replace('#', '')) || 0,
    publisher: supabaseComic.publisher,
    publishDate: new Date().toISOString(), // This should come from your comics table
    coverImage: supabaseComic.cover_image,
    creators: [], // This should be populated from your schema
    format: 'single-issue', // Default format
    isVariant: false,
    isKeyIssue: false,
    prices: [],
    marketValue: supabaseComic.market_value,
    lastUpdated: supabaseComic.created_at
  }

  // Create a CollectionComic object
  const collectionComic: CollectionComic = {
    comicId: supabaseComic.id,
    comic: comic,
    condition: supabaseComic.condition as any, // Type assertion - adjust based on your schema
    purchasePrice: supabaseComic.purchase_price,
    purchaseDate: supabaseComic.purchase_date,
    addedDate: supabaseComic.created_at
  }

  return collectionComic
}

export interface CollectionFilters {
  searchTerm?: string
  publishers?: string[]
  conditions?: string[]
  priceRange?: { min?: number; max?: number }
  yearRange?: { min?: number; max?: number }
}

export interface CollectionQueryOptions {
  filters?: CollectionFilters
  sortOrder?: string
  page?: number
  itemsPerPage?: number
}

export const fetchUserCollection = async (
  userId: string, 
  options: CollectionQueryOptions = {}
): Promise<CollectionComic[]> => {
  if (!userId) {
    throw new Error('User ID is required')
  }

  const { filters = {}, sortOrder = 'created_at', page = 1, itemsPerPage = 12 } = options

  let query = supabase
    .from('comics')
    .select('*')
    .eq('user_id', userId)

  // Apply search filter
  if (filters.searchTerm && filters.searchTerm.trim()) {
    const searchTerm = filters.searchTerm.trim()
    query = query.or(`title.ilike.%${searchTerm}%,issue.ilike.%${searchTerm}%,publisher.ilike.%${searchTerm}%`)
  }

  // Apply publisher filter
  if (filters.publishers && filters.publishers.length > 0) {
    query = query.in('publisher', filters.publishers)
  }

  // Apply condition filter  
  if (filters.conditions && filters.conditions.length > 0) {
    query = query.in('condition', filters.conditions)
  }

  // Apply price range filter
  if (filters.priceRange?.min !== undefined) {
    query = query.gte('market_value', filters.priceRange.min)
  }
  if (filters.priceRange?.max !== undefined) {
    query = query.lte('market_value', filters.priceRange.max)
  }

  // Apply year range filter (assuming purchase_date is available)
  if (filters.yearRange?.min !== undefined) {
    const minYear = `${filters.yearRange.min}-01-01`
    query = query.gte('purchase_date', minYear)
  }
  if (filters.yearRange?.max !== undefined) {
    const maxYear = `${filters.yearRange.max}-12-31`
    query = query.lte('purchase_date', maxYear)
  }

  // Apply sorting
  let ascending = false
  let orderColumn = 'created_at'
  
  switch (sortOrder) {
    case 'title':
      orderColumn = 'title'
      ascending = true
      break
    case 'issue-number':
      // For issue sorting, we'll use the issue field and let Supabase handle it
      orderColumn = 'issue'
      ascending = true
      break
    case 'market-value':
      orderColumn = 'market_value'
      ascending = false // Highest first
      break
    case 'purchase-price':
      orderColumn = 'purchase_price'
      ascending = false // Highest first
      break
    case 'added-date':
      orderColumn = 'created_at'
      ascending = false // Most recent first
      break
    case 'publish-date':
    case 'purchase-date':
      orderColumn = 'purchase_date'
      ascending = false // Most recent first
      break
    default:
      orderColumn = 'created_at'
      ascending = false
  }

  query = query.order(orderColumn, { ascending })

  // Apply pagination
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1
  query = query.range(from, to)

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch collection: ${error.message}`)
  }

  if (!data) {
    return []
  }

  // Transform the Supabase data to match our frontend types
  return data.map(transformSupabaseComic)
}

export const getCollectionCount = async (
  userId: string, 
  filters: CollectionFilters = {}
): Promise<number> => {
  if (!userId) {
    throw new Error('User ID is required')
  }

  let query = supabase
    .from('comics')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Apply the same filters as fetchUserCollection but only for counting
  if (filters.searchTerm && filters.searchTerm.trim()) {
    const searchTerm = filters.searchTerm.trim()
    query = query.or(`title.ilike.%${searchTerm}%,issue.ilike.%${searchTerm}%,publisher.ilike.%${searchTerm}%`)
  }

  if (filters.publishers && filters.publishers.length > 0) {
    query = query.in('publisher', filters.publishers)
  }

  if (filters.conditions && filters.conditions.length > 0) {
    query = query.in('condition', filters.conditions)
  }

  if (filters.priceRange?.min !== undefined) {
    query = query.gte('market_value', filters.priceRange.min)
  }
  if (filters.priceRange?.max !== undefined) {
    query = query.lte('market_value', filters.priceRange.max)
  }

  if (filters.yearRange?.min !== undefined) {
    const minYear = `${filters.yearRange.min}-01-01`
    query = query.gte('purchase_date', minYear)
  }
  if (filters.yearRange?.max !== undefined) {
    const maxYear = `${filters.yearRange.max}-12-31`
    query = query.lte('purchase_date', maxYear)
  }

  const { count, error } = await query

  if (error) {
    throw new Error(`Failed to get collection count: ${error.message}`)
  }

  return count || 0
}

export const getCollectionStats = (comics: CollectionComic[]) => {
  const totalComics = comics.length
  const totalValue = comics.reduce((sum, comic) => sum + (comic.comic.marketValue || 0), 0)
  const averageValue = totalComics > 0 ? Math.floor(totalValue / totalComics) : 0
  const keyIssues = comics.filter(comic => comic.comic.isKeyIssue).length

  return {
    totalComics,
    totalValue,
    averageValue,
    keyIssues
  }
}