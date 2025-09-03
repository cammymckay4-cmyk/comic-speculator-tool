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

  // For now, create a mock user profile since we don't have a public user profiles table
  // In a real implementation, you would have a public profiles table with public user data
  const mockUser: User = {
    id: 'mock-user-id',
    name: username,
    email: `${username}@example.com`,
    avatar: null,
    subscriptionTier: 'free',
    subscriptionStatus: 'active',
    joinDate: '2023-01-01T00:00:00.000Z',
    lastActive: '2024-01-01T00:00:00.000Z'
  }

  // Create mock stats for demonstration
  const mockStats: UserProfileStats = {
    totalComics: 156,
    totalValue: 12450,
    averageValue: 79,
    keyIssues: 23,
    topPublishers: [
      { name: 'Marvel Comics', count: 67 },
      { name: 'DC Comics', count: 54 },
      { name: 'Image Comics', count: 23 },
      { name: 'Dark Horse Comics', count: 12 }
    ]
  }

  return {
    user: mockUser,
    stats: mockStats
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