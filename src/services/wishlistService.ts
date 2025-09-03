import { supabase } from '@/lib/supabaseClient'
import type { CollectionComic } from '@/lib/types'
import { transformSupabaseComic } from './collectionService'

export interface WishlistItem {
  id: string
  userId: string
  comicId: string
  createdAt: string
  comic?: CollectionComic
}

export const getWishlist = async (userId: string): Promise<WishlistItem[]> => {
  if (!userId) {
    throw new Error('User ID is required')
  }

  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      id,
      user_id,
      comic_id,
      created_at,
      comics (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch wishlist: ${error.message}`)
  }

  if (!data) {
    return []
  }

  // Transform the data to include comic details
  return data.map((item: any) => ({
    id: item.id,
    userId: item.user_id,
    comicId: item.comic_id,
    createdAt: item.created_at,
    comic: item.comics ? transformSupabaseComic(item.comics) : undefined
  }))
}

export const addToWishlist = async (userId: string, comicId: string): Promise<WishlistItem> => {
  if (!userId || !comicId) {
    throw new Error('User ID and Comic ID are required')
  }

  // First check if the item already exists
  const { data: existing, error: checkError } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .eq('comic_id', comicId)
    .single()

  if (checkError && checkError.code !== 'PGRST116') {
    throw new Error(`Failed to check existing wishlist item: ${checkError.message}`)
  }

  if (existing) {
    throw new Error('Comic is already in wishlist')
  }

  const { data, error } = await supabase
    .from('wishlists')
    .insert([{
      user_id: userId,
      comic_id: comicId
    }])
    .select(`
      id,
      user_id,
      comic_id,
      created_at,
      comics (*)
    `)
    .single()

  if (error) {
    throw new Error(`Failed to add to wishlist: ${error.message}`)
  }

  if (!data) {
    throw new Error('No data returned from wishlist creation')
  }

  return {
    id: data.id,
    userId: data.user_id,
    comicId: data.comic_id,
    createdAt: data.created_at,
    comic: data.comics ? transformSupabaseComic(data.comics) : undefined
  }
}

export const removeFromWishlist = async (userId: string, comicId: string): Promise<void> => {
  if (!userId || !comicId) {
    throw new Error('User ID and Comic ID are required')
  }

  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('comic_id', comicId)

  if (error) {
    throw new Error(`Failed to remove from wishlist: ${error.message}`)
  }
}

export const isInWishlist = async (userId: string, comicId: string): Promise<boolean> => {
  if (!userId || !comicId) {
    return false
  }

  const { data, error } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .eq('comic_id', comicId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking wishlist:', error)
    return false
  }

  return !!data
}

export const getWishlistCount = async (userId: string): Promise<number> => {
  if (!userId) {
    return 0
  }

  const { count, error } = await supabase
    .from('wishlists')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    console.error('Error getting wishlist count:', error)
    return 0
  }

  return count || 0
}