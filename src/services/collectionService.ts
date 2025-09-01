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

export const fetchUserCollection = async (userId: string): Promise<CollectionComic[]> => {
  if (!userId) {
    throw new Error('User ID is required')
  }

  const { data, error } = await supabase
    .from('comics')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch collection: ${error.message}`)
  }

  if (!data) {
    return []
  }

  // Transform the Supabase data to match our frontend types
  return data.map(transformSupabaseComic)
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