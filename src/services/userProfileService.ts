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

  // Get user by username from auth metadata
  // Note: This is a simplified approach. In production, you'd likely have a public profiles table
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
  
  if (usersError) {
    throw new Error(`Failed to fetch users: ${usersError.message}`)
  }

  const foundUser = users.find(user => 
    user.user_metadata?.full_name === username || 
    user.email?.split('@')[0] === username
  )

  if (!foundUser) {
    throw new Error(`User '${username}' not found`)
  }

  // Create user object from auth data
  const user: User = {
    id: foundUser.id,
    name: foundUser.user_metadata?.full_name || foundUser.email?.split('@')[0] || username,
    email: foundUser.email || '',
    avatar: foundUser.user_metadata?.avatar_url || null,
    subscriptionTier: 'free', // Default value - would come from subscription table in real app
    subscriptionStatus: 'active', // Default value
    joinDate: foundUser.created_at || new Date().toISOString(),
    lastActive: foundUser.last_sign_in_at || foundUser.created_at || new Date().toISOString()
  }

  // Fetch real stats for this user
  const stats = await fetchUserStats(foundUser.id)

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