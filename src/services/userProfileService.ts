import { supabase } from '@/lib/supabaseClient'
import type { User } from '@/lib/types'

export interface UserProfileStats {
  totalComics: number
  totalValue: number
  averageValue: number
  keyIssues: number
  topPublishers: Array<{
    name: string
    count: number
  }>
}

export interface UserProfile {
  user: User
  stats: UserProfileStats
}

export const fetchUserProfileByUsername = async (username: string): Promise<UserProfile> => {
  if (!username) {
    throw new Error('Username is required')
  }

  // Get user profile from the secure profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, bio, created_at')
    .eq('username', username)
    .single()
  
  if (profileError) {
    if (profileError.code === 'PGRST116') {
      throw new Error(`User '${username}' not found`)
    }
    throw new Error(`Failed to fetch user profile: ${profileError.message}`)
  }

  // Create user object from profile data (only public, non-sensitive data)
  const user: User = {
    id: profile.id,
    name: profile.username,
    email: '', // Don't expose email addresses - this is private data
    avatar: profile.avatar_url || null,
    subscriptionTier: 'free', // Default value - would come from subscription table in real app
    subscriptionStatus: 'active', // Default value
    joinDate: profile.created_at,
    lastActive: profile.created_at // We don't store last_active in profiles for privacy
  }

  // Fetch real stats for this user
  const stats = await fetchUserStats(profile.id)

  return {
    user,
    stats
  }
}

const fetchUserStats = async (userId: string): Promise<UserProfileStats> => {
  // Get total comics count
  const { count: totalComics, error: countError } = await supabase
    .from('comics')
    .select('*', { count: 'exact', head: true })
    .eq('userId', userId)

  if (countError) {
    throw new Error(`Failed to fetch comics count: ${countError.message}`)
  }

  // Get collection data for stats
  const { data: comics, error: comicsError } = await supabase
    .from('comics')
    .select('marketValue, isKeyIssue, publisher')
    .eq('userId', userId)

  if (comicsError) {
    throw new Error(`Failed to fetch comics data: ${comicsError.message}`)
  }

  const totalValue = comics?.reduce((sum, comic) => sum + (comic.marketValue || 0), 0) || 0
  const averageValue = (totalComics || 0) > 0 ? Math.floor(totalValue / (totalComics || 1)) : 0
  const keyIssues = comics?.filter(comic => comic.isKeyIssue).length || 0

  // Calculate top publishers
  const publisherCounts: Record<string, number> = {}
  comics?.forEach(comic => {
    if (comic.publisher) {
      publisherCounts[comic.publisher] = (publisherCounts[comic.publisher] || 0) + 1
    }
  })

  const topPublishers = Object.entries(publisherCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  return {
    totalComics: totalComics || 0,
    totalValue,
    averageValue,
    keyIssues,
    topPublishers
  }
}