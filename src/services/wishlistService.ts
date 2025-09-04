import { supabase } from '@/lib/supabaseClient'
import type { Comic } from '@/lib/types'

// Interface for the wishlist_items table in Supabase
export interface SupabaseWishlistItem {
  id: string
  user_id: string
  comic_id: string
  target_condition?: string
  max_price?: number
  notes?: string
  added_date: string
  updated_at: string
  comic: {
    id: string
    title: string
    issue: string
    publisher: string
    cover_image: string
    market_value: number
    variant_description?: string
    is_key_issue?: boolean
    key_notes?: string
    created_at: string
    updated_at: string
  }
}

// Interface for wishlist items in frontend
export interface WishlistItem {
  id: string // wishlist entry ID
  comicId: string
  comic: Comic
  targetCondition?: string
  maxPrice?: number
  notes?: string
  addedDate: string
}

// Transform Supabase wishlist item with comic data to match our frontend types
const transformWishlistItem = (item: SupabaseWishlistItem): WishlistItem => {
  // Create a Comic object from the Supabase comic data
  const comic: Comic = {
    id: item.comic.id,
    title: item.comic.title,
    issue: item.comic.issue,
    issueNumber: parseInt(item.comic.issue.replace('#', '')) || 0,
    publisher: item.comic.publisher,
    publishDate: new Date().toISOString(),
    coverImage: item.comic.cover_image,
    creators: [],
    format: 'single-issue',
    isVariant: false,
    isKeyIssue: item.comic.is_key_issue || false,
    keyNotes: item.comic.key_notes,
    prices: [],
    marketValue: item.comic.market_value,
    lastUpdated: item.comic.updated_at
  }

  // Create a WishlistItem object
  const wishlistItem: WishlistItem = {
    id: item.id, // Wishlist entry ID
    comicId: item.comic_id,
    comic: comic,
    targetCondition: item.target_condition,
    maxPrice: item.max_price,
    notes: item.notes,
    addedDate: item.added_date
  }

  return wishlistItem
}

export interface WishlistFilters {
  searchTerm?: string
  publishers?: string[]
  priceRange?: { min?: number; max?: number }
}

export interface WishlistQueryOptions {
  filters?: WishlistFilters
  sortOrder?: string
  page?: number
  itemsPerPage?: number
}

// Helper function to build OR conditions without duplicates
const buildTermConditions = (term: string, fields: string[]): string => {
  const normalizedTerm = term.toLowerCase().replace(/-/g, '')
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

// Fetch user's wishlist items with filtering and pagination
export const fetchUserWishlist = async (
  userEmail: string,
  options: WishlistQueryOptions = {}
): Promise<WishlistItem[]> => {
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
    .from('wishlist_items')
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

  // Apply price range filter (on market value)
  if (filters.priceRange?.min !== undefined) {
    query = query.gte('comic.market_value', filters.priceRange.min)
  }
  if (filters.priceRange?.max !== undefined) {
    query = query.lte('comic.market_value', filters.priceRange.max)
  }

  // Apply sorting
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
    case 'added-date':
      query = query.order('added_date', { ascending: false }) // Most recent first
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
    throw new Error(`Failed to fetch wishlist: ${error.message}`)
  }

  if (!data) {
    return []
  }

  // Transform the Supabase data to match our frontend types
  return data.map(transformWishlistItem)
}

// Get count of user's wishlist items with filters
export const getWishlistCount = async (
  userEmail: string,
  filters: WishlistFilters = {}
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
    .from('wishlist_items')
    .select(`
      *,
      comic:comics!inner(
        id,
        title,
        issue,
        publisher,
        market_value
      )
    `, { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Apply the same filters as fetchUserWishlist but only for counting
  if (filters.searchTerm && filters.searchTerm.trim()) {
    const searchTerm = filters.searchTerm.trim()
    const searchTerms = searchTerm.split(/\s+/).filter(term => term.length > 0)
    
    if (searchTerms.length === 1) {
      const term = searchTerms[0]
      const conditions = buildTermConditions(term, ['comic.title', 'comic.issue', 'comic.publisher'])
      query = query.or(conditions)
    } else {
      searchTerms.forEach(term => {
        const conditions = buildTermConditions(term, ['comic.title', 'comic.issue', 'comic.publisher'])
        query = query.or(conditions)
      })
    }
  }

  if (filters.publishers && filters.publishers.length > 0) {
    query = query.in('comic.publisher', filters.publishers)
  }

  if (filters.priceRange?.min !== undefined) {
    query = query.gte('comic.market_value', filters.priceRange.min)
  }
  if (filters.priceRange?.max !== undefined) {
    query = query.lte('comic.market_value', filters.priceRange.max)
  }

  const { count, error } = await query

  if (error) {
    throw new Error(`Failed to get wishlist count: ${error.message}`)
  }

  return count || 0
}

// Interface for adding a comic to wishlist
export interface AddToWishlistData {
  comicId: string
  targetCondition?: string
  maxPrice?: number
  notes?: string
}

// Add a comic to user's wishlist
export const addToWishlist = async (
  userEmail: string,
  wishlistData: AddToWishlistData
): Promise<WishlistItem> => {
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
    comic_id: wishlistData.comicId,
    target_condition: wishlistData.targetCondition,
    max_price: wishlistData.maxPrice,
    notes: wishlistData.notes
  }

  const { data, error } = await supabase
    .from('wishlist_items')
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
    throw new Error(`Failed to add to wishlist: ${error.message}`)
  }

  if (!data) {
    throw new Error('No data returned from wishlist entry creation')
  }

  return transformWishlistItem(data)
}

// Remove a comic from user's wishlist
export const removeFromWishlist = async (
  wishlistItemId: string,
  userEmail: string
): Promise<void> => {
  if (!wishlistItemId) {
    throw new Error('Wishlist item ID is required')
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
    .from('wishlist_items')
    .delete()
    .eq('id', wishlistItemId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Failed to remove from wishlist: ${error.message}`)
  }
}

// Check if a comic is in user's wishlist
export const isComicInWishlist = async (
  comicId: string,
  userEmail: string
): Promise<boolean> => {
  if (!comicId || !userEmail) {
    return false
  }

  try {
    // Get the current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return false
    }

    const { data, error } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('comic_id', comicId)
      .eq('user_id', user.id)
      .single()

    return !!data && !error
  } catch (error) {
    return false
  }
}

// Get wishlist item by comic ID
export const getWishlistItemByComicId = async (
  comicId: string,
  userEmail: string
): Promise<WishlistItem | null> => {
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
      .from('wishlist_items')
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

    return transformWishlistItem(data)
  } catch (error) {
    return null
  }
}