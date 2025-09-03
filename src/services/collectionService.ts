import { supabase } from '@/lib/supabaseClient'
import type { CollectionComic, Comic } from '@/lib/types'

// Interface for the comics table in Supabase (master list)
export interface SupabaseComic {
  id: string
  title: string
  issue: string
  publisher: string
  cover_image: string
  market_value: number
  publication_year?: number
  format?: string
  is_key_issue?: boolean
  key_issue_reason?: string
  created_at: string
  updated_at: string
}

// Interface for user collection entries
export interface SupabaseUserCollectionEntry {
  id: string
  user_id: string
  comic_id: string
  condition: string
  purchase_price?: number
  purchase_date?: string
  purchase_location?: string
  notes?: string
  added_date: string
  updated_at: string
  comic: SupabaseComic
}

// Transform Supabase collection entry with comic data to match our frontend types
const transformCollectionEntry = (entry: SupabaseUserCollectionEntry): CollectionComic => {
  // Create a Comic object from the Supabase comic data
  const comic: Comic = {
    id: entry.comic.id,
    title: entry.comic.title,
    issue: entry.comic.issue,
    issueNumber: parseInt(entry.comic.issue.replace('#', '')) || 0,
    publisher: entry.comic.publisher,
    publishDate: entry.comic.publication_year ? 
      new Date(entry.comic.publication_year, 0, 1).toISOString() : 
      new Date().toISOString(),
    coverImage: entry.comic.cover_image,
    creators: [], // This should be populated from your schema
    format: (entry.comic.format as any) || 'single-issue',
    isVariant: false,
    isKeyIssue: entry.comic.is_key_issue || false,
    keyIssueReason: entry.comic.key_issue_reason,
    prices: [],
    marketValue: entry.comic.market_value,
    lastUpdated: entry.comic.updated_at
  }

  // Create a CollectionComic object
  const collectionComic: CollectionComic = {
    comicId: entry.comic_id,
    comic: comic,
    condition: entry.condition as any,
    purchasePrice: entry.purchase_price,
    purchaseDate: entry.purchase_date,
    purchaseLocation: entry.purchase_location,
    notes: entry.notes,
    addedDate: entry.added_date
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
  userEmail: string, 
  options: CollectionQueryOptions = {}
): Promise<CollectionComic[]> => {
  if (!userEmail) {
    throw new Error('User email is required')
  }

  // Get the current user from Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const { filters = {}, sortOrder = 'added_date', page = 1, itemsPerPage = 12 } = options

  let query = supabase
    .from('user_collection_entries')
    .select(`
      *,
      comic:comics!inner(
        id,
        title,
        issue,
        publisher,
        cover_image,
        market_value,
        publication_year,
        format,
        is_key_issue,
        key_issue_reason,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', user.id)

  // Apply search filter (search in comic data)
  if (filters.searchTerm && filters.searchTerm.trim()) {
    const searchTerm = filters.searchTerm.trim()
    query = query.or(`comic.title.ilike.%${searchTerm}%,comic.issue.ilike.%${searchTerm}%,comic.publisher.ilike.%${searchTerm}%`)
  }

  // Apply publisher filter
  if (filters.publishers && filters.publishers.length > 0) {
    query = query.in('comic.publisher', filters.publishers)
  }

  // Apply condition filter  
  if (filters.conditions && filters.conditions.length > 0) {
    query = query.in('condition', filters.conditions)
  }

  // Apply price range filter (on market value)
  if (filters.priceRange?.min !== undefined) {
    query = query.gte('comic.market_value', filters.priceRange.min)
  }
  if (filters.priceRange?.max !== undefined) {
    query = query.lte('comic.market_value', filters.priceRange.max)
  }

  // Apply year range filter (on purchase date)
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
  let orderColumn = 'added_date'
  
  switch (sortOrder) {
    case 'title':
      orderColumn = 'comic.title'
      ascending = true
      break
    case 'issue-number':
      orderColumn = 'comic.issue'
      ascending = true
      break
    case 'market-value':
      orderColumn = 'comic.market_value'
      ascending = false // Highest first
      break
    case 'purchase-price':
      orderColumn = 'purchase_price'
      ascending = false // Highest first
      break
    case 'added-date':
      orderColumn = 'added_date'
      ascending = false // Most recent first
      break
    case 'publish-date':
      orderColumn = 'comic.publication_year'
      ascending = false // Most recent first
      break
    case 'purchase-date':
      orderColumn = 'purchase_date'
      ascending = false // Most recent first
      break
    default:
      orderColumn = 'added_date'
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
  return data.map(transformCollectionEntry)
}

export const getCollectionCount = async (
  userEmail: string, 
  filters: CollectionFilters = {}
): Promise<number> => {
  if (!userEmail) {
    throw new Error('User email is required')
  }

  // Get the current user from Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  let query = supabase
    .from('user_collection_entries')
    .select(`
      *,
      comic:comics!inner(
        id,
        title,
        issue,
        publisher,
        market_value,
        publication_year
      )
    `, { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Apply the same filters as fetchUserCollection but only for counting
  if (filters.searchTerm && filters.searchTerm.trim()) {
    const searchTerm = filters.searchTerm.trim()
    query = query.or(`comic.title.ilike.%${searchTerm}%,comic.issue.ilike.%${searchTerm}%,comic.publisher.ilike.%${searchTerm}%`)
  }

  if (filters.publishers && filters.publishers.length > 0) {
    query = query.in('comic.publisher', filters.publishers)
  }

  if (filters.conditions && filters.conditions.length > 0) {
    query = query.in('condition', filters.conditions)
  }

  if (filters.priceRange?.min !== undefined) {
    query = query.gte('comic.market_value', filters.priceRange.min)
  }
  if (filters.priceRange?.max !== undefined) {
    query = query.lte('comic.market_value', filters.priceRange.max)
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

export const fetchUserCollectionEntryById = async (entryId: string, userEmail: string): Promise<CollectionComic> => {
  if (!entryId) {
    throw new Error('Entry ID is required')
  }
  if (!userEmail) {
    throw new Error('User email is required')
  }

  // Get the current user from Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('user_collection_entries')
    .select(`
      *,
      comic:comics!inner(
        id,
        title,
        issue,
        publisher,
        cover_image,
        market_value,
        publication_year,
        format,
        is_key_issue,
        key_issue_reason,
        created_at,
        updated_at
      )
    `)
    .eq('id', entryId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch collection entry: ${error.message}`)
  }

  if (!data) {
    throw new Error('Collection entry not found')
  }

  // Transform the Supabase data to match our frontend types
  return transformCollectionEntry(data)
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

// Interface for adding a comic to a user's collection
export interface AddToCollectionData {
  comicId: string
  condition: string
  purchasePrice?: number | null
  purchaseDate?: string | null
  purchaseLocation?: string | null
  notes?: string | null
}

// Interface for creating a new master comic
export interface CreateComicData {
  title: string
  issueNumber: string
  publisher: string
  publicationYear: number
  format: string
  estimatedValue?: number | null
  coverImageUrl?: string | null
  isKeyIssue: boolean
  keyIssueReason?: string | null
}

// Combined interface for the add comic form (backwards compatibility)
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

// New function to search/find or create a comic in the master list
export const findOrCreateComic = async (comicData: CreateComicData): Promise<SupabaseComic> => {
  // First, try to find an existing comic with the same title, issue, and publisher
  const { data: existingComic, error: searchError } = await supabase
    .from('comics')
    .select('*')
    .eq('title', comicData.title)
    .eq('issue', comicData.issueNumber)
    .eq('publisher', comicData.publisher)
    .single()

  if (!searchError && existingComic) {
    return existingComic
  }

  // If no existing comic found, create a new one
  const newComicData = {
    title: comicData.title,
    issue: comicData.issueNumber,
    publisher: comicData.publisher,
    publication_year: comicData.publicationYear,
    format: comicData.format,
    market_value: comicData.estimatedValue || 0,
    cover_image: comicData.coverImageUrl || '',
    is_key_issue: comicData.isKeyIssue,
    key_issue_reason: comicData.keyIssueReason
  }

  const { data, error } = await supabase
    .from('comics')
    .insert([newComicData])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create comic: ${error.message}`)
  }

  if (!data) {
    throw new Error('No data returned from comic creation')
  }

  return data
}

// Function to add a comic to user's collection
export const addToCollection = async (userEmail: string, collectionData: AddToCollectionData): Promise<CollectionComic> => {
  if (!userEmail) {
    throw new Error('User email is required')
  }

  // Get the current user from Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const entryData = {
    user_id: user.id,
    comic_id: collectionData.comicId,
    condition: collectionData.condition,
    purchase_price: collectionData.purchasePrice,
    purchase_date: collectionData.purchaseDate,
    purchase_location: collectionData.purchaseLocation,
    notes: collectionData.notes
  }

  const { data, error } = await supabase
    .from('user_collection_entries')
    .insert([entryData])
    .select(`
      *,
      comic:comics!inner(
        id,
        title,
        issue,
        publisher,
        cover_image,
        market_value,
        publication_year,
        format,
        is_key_issue,
        key_issue_reason,
        created_at,
        updated_at
      )
    `)
    .single()

  if (error) {
    throw new Error(`Failed to add to collection: ${error.message}`)
  }

  if (!data) {
    throw new Error('No data returned from collection entry creation')
  }

  return transformCollectionEntry(data)
}

// Backwards compatible function for existing add comic flow
export const addComic = async (userEmail: string, comicData: AddComicData): Promise<CollectionComic> => {
  if (!userEmail) {
    throw new Error('User email is required')
  }

  // First, find or create the comic in the master list
  const comic = await findOrCreateComic({
    title: comicData.title,
    issueNumber: comicData.issueNumber,
    publisher: comicData.publisher,
    publicationYear: comicData.publicationYear,
    format: comicData.format,
    estimatedValue: comicData.estimatedValue,
    coverImageUrl: comicData.coverImageUrl,
    isKeyIssue: comicData.isKeyIssue,
    keyIssueReason: comicData.keyIssueReason
  })

  // Then add it to the user's collection
  return addToCollection(userEmail, {
    comicId: comic.id,
    condition: comicData.condition,
    purchasePrice: comicData.purchasePrice,
    purchaseDate: comicData.purchaseDate,
    purchaseLocation: comicData.purchaseLocation,
    notes: comicData.notes
  })
}

// Update a user's collection entry (user-specific data only)
export const updateCollectionEntry = async (
  entryId: string, 
  userEmail: string, 
  updatedData: Partial<AddToCollectionData>
): Promise<CollectionComic> => {
  if (!entryId) {
    throw new Error('Entry ID is required')
  }
  if (!userEmail) {
    throw new Error('User email is required')
  }

  // Get the current user from Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const updateFields: any = {}
  
  if (updatedData.condition) updateFields.condition = updatedData.condition
  if (updatedData.purchasePrice !== undefined) updateFields.purchase_price = updatedData.purchasePrice
  if (updatedData.purchaseDate !== undefined) updateFields.purchase_date = updatedData.purchaseDate
  if (updatedData.purchaseLocation !== undefined) updateFields.purchase_location = updatedData.purchaseLocation
  if (updatedData.notes !== undefined) updateFields.notes = updatedData.notes

  const { data, error } = await supabase
    .from('user_collection_entries')
    .update(updateFields)
    .eq('id', entryId)
    .eq('user_id', user.id)
    .select(`
      *,
      comic:comics!inner(
        id,
        title,
        issue,
        publisher,
        cover_image,
        market_value,
        publication_year,
        format,
        is_key_issue,
        key_issue_reason,
        created_at,
        updated_at
      )
    `)
    .single()

  if (error) {
    throw new Error(`Failed to update collection entry: ${error.message}`)
  }

  if (!data) {
    throw new Error('No data returned from collection entry update')
  }

  return transformCollectionEntry(data)
}

// Backwards compatible update function
export const updateComic = async (comicId: string, updatedData: Partial<AddComicData>): Promise<CollectionComic> => {
  // This function is now deprecated - we need the entry ID, not the comic ID
  throw new Error('updateComic is deprecated. Use updateCollectionEntry with entry ID instead.')
}

// Remove a comic from user's collection (delete collection entry)
export const removeFromCollection = async (entryId: string, userEmail: string): Promise<void> => {
  if (!entryId) {
    throw new Error('Entry ID is required')
  }
  if (!userEmail) {
    throw new Error('User email is required')
  }

  // Get the current user from Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('user_collection_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Failed to remove from collection: ${error.message}`)
  }
}

// Backwards compatible delete function
export const deleteComic = async (comicId: string): Promise<void> => {
  throw new Error('deleteComic is deprecated. Use removeFromCollection with entry ID instead.')
}

export const fetchAllComicsForUser = async (userEmail: string): Promise<CollectionComic[]> => {
  if (!userEmail) {
    throw new Error('User email is required')
  }

  // Get the current user from Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('user_collection_entries')
    .select(`
      *,
      comic:comics!inner(
        id,
        title,
        issue,
        publisher,
        cover_image,
        market_value,
        publication_year,
        format,
        is_key_issue,
        key_issue_reason,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', user.id)
    .order('added_date', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch all comics: ${error.message}`)
  }

  if (!data) {
    return []
  }

  return data.map(transformCollectionEntry)
}

// New function to search master comics list
export const searchMasterComics = async (
  searchTerm: string,
  limit: number = 20
): Promise<SupabaseComic[]> => {
  if (!searchTerm || !searchTerm.trim()) {
    return []
  }

  const trimmedTerm = searchTerm.trim()
  
  const { data, error } = await supabase
    .from('comics')
    .select('*')
    .or(`title.ilike.%${trimmedTerm}%,issue.ilike.%${trimmedTerm}%,publisher.ilike.%${trimmedTerm}%`)
    .order('title', { ascending: true })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to search comics: ${error.message}`)
  }

  return data || []
}