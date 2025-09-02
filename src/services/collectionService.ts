import { supabase } from '@/lib/supabaseClient'
import type { CollectionComic, Comic } from '@/lib/types'

// Interface for the comics table in Supabase
export interface SupabaseComic {
  id: string
  title: string
  issue: string
  publisher: string
  coverImage: string
  marketValue: number
  condition: string
  purchasePrice?: number
  purchaseDate?: string
  purchaseLocation?: string
  notes?: string
  publicationYear?: number
  format?: string
  isKeyIssue?: boolean
  keyIssueReason?: string
  createdAt: string
  userId: string
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
    publishDate: supabaseComic.publicationYear ? 
      new Date(supabaseComic.publicationYear, 0, 1).toISOString() : 
      new Date().toISOString(),
    coverImage: supabaseComic.coverImage,
    creators: [], // This should be populated from your schema
    format: (supabaseComic.format as any) || 'single-issue',
    isVariant: false,
    isKeyIssue: supabaseComic.isKeyIssue || false,
    keyIssueReason: supabaseComic.keyIssueReason,
    prices: [],
    marketValue: supabaseComic.marketValue,
    lastUpdated: supabaseComic.createdAt
  }

  // Create a CollectionComic object
  const collectionComic: CollectionComic = {
    comicId: supabaseComic.id,
    comic: comic,
    condition: supabaseComic.condition as any, // Type assertion - adjust based on your schema
    purchasePrice: supabaseComic.purchasePrice,
    purchaseDate: supabaseComic.purchaseDate,
    purchaseLocation: supabaseComic.purchaseLocation,
    notes: supabaseComic.notes,
    addedDate: supabaseComic.createdAt
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

  const { filters = {}, sortOrder = 'createdAt', page = 1, itemsPerPage = 12 } = options

  let query = supabase
    .from('comics')
    .select('*')
    .eq('userId', userId)

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
    query = query.gte('marketValue', filters.priceRange.min)
  }
  if (filters.priceRange?.max !== undefined) {
    query = query.lte('marketValue', filters.priceRange.max)
  }

  // Apply year range filter (assuming purchase_date is available)
  if (filters.yearRange?.min !== undefined) {
    const minYear = `${filters.yearRange.min}-01-01`
    query = query.gte('purchaseDate', minYear)
  }
  if (filters.yearRange?.max !== undefined) {
    const maxYear = `${filters.yearRange.max}-12-31`
    query = query.lte('purchaseDate', maxYear)
  }

  // Apply sorting
  let ascending = false
  let orderColumn = 'createdAt'
  
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
      orderColumn = 'marketValue'
      ascending = false // Highest first
      break
    case 'purchase-price':
      orderColumn = 'purchasePrice'
      ascending = false // Highest first
      break
    case 'added-date':
      orderColumn = 'createdAt'
      ascending = false // Most recent first
      break
    case 'publish-date':
    case 'purchase-date':
      orderColumn = 'purchaseDate'
      ascending = false // Most recent first
      break
    default:
      orderColumn = 'createdAt'
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
    .eq('userId', userId)

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
    query = query.gte('marketValue', filters.priceRange.min)
  }
  if (filters.priceRange?.max !== undefined) {
    query = query.lte('marketValue', filters.priceRange.max)
  }

  if (filters.yearRange?.min !== undefined) {
    const minYear = `${filters.yearRange.min}-01-01`
    query = query.gte('purchaseDate', minYear)
  }
  if (filters.yearRange?.max !== undefined) {
    const maxYear = `${filters.yearRange.max}-12-31`
    query = query.lte('purchaseDate', maxYear)
  }

  const { count, error } = await query

  if (error) {
    throw new Error(`Failed to get collection count: ${error.message}`)
  }

  return count || 0
}

export const fetchComicById = async (comicId: string): Promise<CollectionComic> => {
  if (!comicId) {
    throw new Error('Comic ID is required')
  }

  const { data, error } = await supabase
    .from('comics')
    .select('*')
    .eq('id', comicId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch comic: ${error.message}`)
  }

  if (!data) {
    throw new Error('Comic not found')
  }

  // Transform the Supabase data to match our frontend types
  return transformSupabaseComic(data)
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

// Interface for adding a new comic
export interface AddComicData {
  title: string
  issueNumber: string
  publisher: string
  publicationYear: number
  condition: string
  format: string
  estimatedValue?: number | null
  purchasePrice?: number | null
  purchaseDate?: string | null
  purchaseLocation?: string | null
  coverImageUrl?: string | null
  notes?: string | null
  isKeyIssue: boolean
  keyIssueReason?: string | null
  addedDate: string
}

export const addComic = async (userId: string, comicData: AddComicData): Promise<CollectionComic> => {
  if (!userId) {
    throw new Error('User ID is required')
  }

  // Map the form data to Supabase schema
  const supabaseData = {
    userId: userId,
    title: comicData.title,
    issue: comicData.issueNumber,
    publisher: comicData.publisher,
    publicationYear: comicData.publicationYear,
    condition: comicData.condition,
    format: comicData.format,
    marketValue: comicData.estimatedValue || 0,
    purchasePrice: comicData.purchasePrice,
    purchaseDate: comicData.purchaseDate,
    purchaseLocation: comicData.purchaseLocation,
    coverImage: comicData.coverImageUrl || '',
    notes: comicData.notes,
    isKeyIssue: comicData.isKeyIssue,
    keyIssueReason: comicData.keyIssueReason,
    createdAt: comicData.addedDate
  }

  const { data, error } = await supabase
    .from('comics')
    .insert([supabaseData])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to add comic: ${error.message}`)
  }

  if (!data) {
    throw new Error('No data returned from comic creation')
  }

  // Transform the returned data to match our frontend types
  return transformSupabaseComic(data)
}

export const updateComic = async (comicId: string, updatedData: Partial<AddComicData>): Promise<CollectionComic> => {
  if (!comicId) {
    throw new Error('Comic ID is required')
  }

  // Map the form data to Supabase schema
  const supabaseData: any = {}
  
  if (updatedData.title) supabaseData.title = updatedData.title
  if (updatedData.issueNumber) supabaseData.issue = updatedData.issueNumber
  if (updatedData.publisher) supabaseData.publisher = updatedData.publisher
  if (updatedData.publicationYear) supabaseData.publicationYear = updatedData.publicationYear
  if (updatedData.condition) supabaseData.condition = updatedData.condition
  if (updatedData.format) supabaseData.format = updatedData.format
  if (updatedData.estimatedValue !== undefined) supabaseData.marketValue = updatedData.estimatedValue || 0
  if (updatedData.purchasePrice !== undefined) supabaseData.purchasePrice = updatedData.purchasePrice
  if (updatedData.purchaseDate !== undefined) supabaseData.purchaseDate = updatedData.purchaseDate
  if (updatedData.purchaseLocation !== undefined) supabaseData.purchaseLocation = updatedData.purchaseLocation
  if (updatedData.coverImageUrl !== undefined) supabaseData.coverImage = updatedData.coverImageUrl || ''
  if (updatedData.notes !== undefined) supabaseData.notes = updatedData.notes
  if (updatedData.isKeyIssue !== undefined) supabaseData.isKeyIssue = updatedData.isKeyIssue
  if (updatedData.keyIssueReason !== undefined) supabaseData.keyIssueReason = updatedData.keyIssueReason

  const { data, error } = await supabase
    .from('comics')
    .update(supabaseData)
    .eq('id', comicId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update comic: ${error.message}`)
  }

  if (!data) {
    throw new Error('No data returned from comic update')
  }

  // Transform the returned data to match our frontend types
  return transformSupabaseComic(data)
}