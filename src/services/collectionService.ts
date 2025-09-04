import { supabase } from '@/lib/supabaseClient'
import type { CollectionComic, Comic, ComicFormat } from '@/lib/types'
import { addEbayStatusToComic } from '@/lib/ebayUtils'

// Interface for the comics table in Supabase (master list)
export interface SupabaseComic {
  id: string
  title: string
  issue: string
  publisher: string
  cover_image: string
  market_value: number
  variant_description?: string
  is_key_issue?: boolean
  key_notes?: string
  page_count?: number
  notes?: string
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
  const baseComic: Comic = {
    id: entry.comic.id,
    title: entry.comic.title,
    issue: entry.comic.issue,
    issueNumber: parseInt(entry.comic.issue.replace('#', '')) || 0,
    publisher: entry.comic.publisher,
    publishDate: new Date().toISOString(),
    coverImage: entry.comic.cover_image,
    creators: [], // This should be populated from your schema
    format: (entry.comic.variant_description as ComicFormat) || 'single-issue',
    isVariant: false,
    isKeyIssue: entry.comic.is_key_issue || false,
    keyNotes: entry.comic.key_notes,
    prices: [],
    marketValue: entry.comic.market_value,
    lastUpdated: entry.comic.updated_at
  }
  
  // Add eBay status to the comic
  const comic = addEbayStatusToComic(baseComic)

  // Create a CollectionComic object
  const collectionComic: CollectionComic = {
    id: entry.id, // Collection entry ID for removal operations
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

// Search normalization functions (matching searchService.ts)
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
        variant_description,
        is_key_issue,
        key_notes,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', user.id)

  // Apply search filter (search in comic data)
  if (filters.searchTerm && filters.searchTerm.trim()) {
    const searchTerm = filters.searchTerm.trim()
    // Split search term by spaces to handle partial matches
    const searchTerms = searchTerm.split(/\s+/).filter(term => term.length > 0)
    
    if (searchTerms.length === 1) {
      // Single term - search in title, issue, or publisher
      const term = searchTerms[0]
      const conditions = buildTermConditions(term, ['comic.title', 'comic.issue', 'comic.publisher'])
      query = query.or(conditions)
    } else {
      // Multiple terms - chain OR conditions, each term must match somewhere
      searchTerms.forEach(term => {
        const conditions = buildTermConditions(term, ['comic.title', 'comic.issue', 'comic.publisher'])
        query = query.or(conditions)
      })
    }
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
  
  switch (sortOrder) {
    case 'title':
      query = query.order('title', { foreignTable: 'comic', ascending: true })
      break
    case 'issue-number':
      query = query.order('issue', { foreignTable: 'comic', ascending: true })
      break
    case 'market-value':
      query = query.order('market_value', { foreignTable: 'comic', ascending: false }) // Highest first
      break
    case 'purchase-price':
      query = query.order('purchase_price', { ascending: false }) // Highest first
      break
    case 'added-date':
      query = query.order('added_date', { ascending: false }) // Most recent first
      break
    case 'publish-date':
      query = query.order('created_at', { foreignTable: 'comic', ascending: false }) // Most recent first
      break
    case 'purchase-date':
      query = query.order('purchase_date', { ascending: false }) // Most recent first
      break
    default:
      query = query.order('added_date', { ascending: false })
  }

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
        variant_description
      )
    `, { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Apply the same filters as fetchUserCollection but only for counting
  if (filters.searchTerm && filters.searchTerm.trim()) {
    const searchTerm = filters.searchTerm.trim()
    // Split search term by spaces to handle partial matches
    const searchTerms = searchTerm.split(/\s+/).filter(term => term.length > 0)
    
    if (searchTerms.length === 1) {
      // Single term - search in title, issue, or publisher
      const term = searchTerms[0]
      const conditions = buildTermConditions(term, ['comic.title', 'comic.issue', 'comic.publisher'])
      query = query.or(conditions)
    } else {
      // Multiple terms - chain OR conditions, each term must match somewhere
      searchTerms.forEach(term => {
        const conditions = buildTermConditions(term, ['comic.title', 'comic.issue', 'comic.publisher'])
        query = query.or(conditions)
      })
    }
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
        variant_description,
        is_key_issue,
        key_notes,
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
  format: string // Keep for frontend compatibility but don't save to DB
  estimatedValue?: number | null
  coverImageUrl?: string | null
  isKeyIssue: boolean
  keyNotes?: string | null
}

// Combined interface for the add comic form (backwards compatibility)
export interface AddComicData {
  title: string
  issueNumber: string
  publisher: string
  condition: string
  format: string // Keep for frontend compatibility but don't save to DB
  estimatedValue?: number | null
  purchasePrice?: number | null
  purchaseDate?: string | null
  purchaseLocation?: string | null
  coverImageUrl?: string | null
  notes?: string | null
  isKeyIssue: boolean
  keyNotes?: string | null
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
    variant_description: comicData.format,
    market_value: comicData.estimatedValue || 0,
    cover_image: comicData.coverImageUrl || '',
    is_key_issue: comicData.isKeyIssue,
    key_notes: comicData.keyNotes
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
        variant_description,
        is_key_issue,
        key_notes,
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
    format: comicData.format, // Format is accepted but not saved to DB
    estimatedValue: comicData.estimatedValue,
    coverImageUrl: comicData.coverImageUrl,
    isKeyIssue: comicData.isKeyIssue,
    keyNotes: comicData.keyNotes
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
        variant_description,
        is_key_issue,
        key_notes,
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
        variant_description,
        is_key_issue,
        key_notes,
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

// New function to search master comics list (using same logic as working main search)
export const searchMasterComics = async (
  searchTerm: string,
  limit: number = 20
): Promise<SupabaseComic[]> => {
  if (!searchTerm || !searchTerm.trim()) {
    return []
  }

  const trimmedSearch = searchTerm.trim()
  
  // Split search term by spaces to handle partial matches
  const searchTerms = trimmedSearch.split(/\s+/).filter(term => term.length > 0)
  
  let query = supabase
    .from('comics')
    .select('*')

  // Use the same simple logic as the working main search - only search title and issue
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
    .limit(limit)

  if (error) {
    throw new Error(`Failed to search comics: ${error.message}`)
  }

  return data || []
}

// Function to fetch a single comic by ID from master comics table (public access)
export const fetchPublicComicById = async (comicId: string): Promise<Comic> => {
  if (!comicId) {
    throw new Error('Comic ID is required')
  }

  const { data, error } = await supabase
    .from('comics')
    .select(`
      id,
      title,
      issue,
      publisher,
      cover_image,
      market_value,
      variant_description,
      is_key_issue,
      key_notes,
      page_count,
      created_at,
      updated_at,
      notes
    `)
    .eq('id', comicId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch comic: ${error.message}`)
  }

  if (!data) {
    throw new Error('Comic not found')
  }

  // Transform the Supabase comic data to match our frontend Comic type
  const comic: Comic = {
    id: data.id,
    title: data.title,
    issue: data.issue,
    issueNumber: parseInt(data.issue.replace('#', '')) || 0,
    publisher: data.publisher,
    publishDate: data.created_at || new Date().toISOString(),
    coverImage: data.cover_image || '',
    creators: [],
    description: data.notes || '',
    pageCount: data.page_count || undefined,
    format: (data.variant_description as ComicFormat) || 'single-issue',
    isVariant: !!data.variant_description,
    variantDescription: data.variant_description || undefined,
    isKeyIssue: data.is_key_issue || false,
    keyNotes: data.key_notes || undefined,
    storyArcs: [],
    characters: [],
    prices: [],
    marketValue: data.market_value || 0,
    lastUpdated: data.updated_at
  }

  return comic
}

// Function to check if user has this comic in their collection
export const getUserCollectionEntry = async (comicId: string, userEmail: string): Promise<CollectionComic | null> => {
  if (!comicId || !userEmail) {
    return null
  }

  try {
    // Get the current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return null
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
          variant_description,
          is_key_issue,
          key_notes,
          created_at,
          updated_at
        )
      `)
      .eq('comic_id', comicId)
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      return null
    }

    // Transform the Supabase data to match our frontend types
    return transformCollectionEntry(data)
  } catch (error) {
    return null
  }
}

// Function to fetch a single comic by ID (for ComicDetailPage)
export const fetchComicById = async (comicId: string): Promise<CollectionComic> => {
  if (!comicId) {
    throw new Error('Comic ID is required')
  }

  // Get the current user from Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  // This function expects a collection entry ID, not a comic ID
  // We need to find the collection entry that matches this ID
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
        variant_description,
        is_key_issue,
        key_notes,
        created_at,
        updated_at
      )
    `)
    .eq('id', comicId) // This is actually the collection entry ID
    .eq('user_id', user.id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch comic: ${error.message}`)
  }

  if (!data) {
    throw new Error('Comic not found')
  }

  // Transform the Supabase data to match our frontend types
  return transformCollectionEntry(data)
}