import { supabase } from '@/lib/supabaseClient'
import type { Comic, NewsArticle } from '@/lib/types'

export interface UserStats {
  totalComics: number
  collectionValue: number
  activeAlerts: number
  recentAdditions: number
}

export interface HotComic {
  id: string
  title: string
  issue: string
  publisher: string
  coverImage: string
  value: string
  trend: 'up' | 'down' | 'neutral'
  change: string
}

// Fetch user's collection statistics
export const fetchUserStats = async (userId: string): Promise<UserStats> => {
  if (!userId) {
    throw new Error('User ID is required')
  }

  // Get total comics count and collection value
  const { data: comics, error: comicsError } = await supabase
    .from('comics')
    .select('marketValue')
    .eq('userId', userId)

  if (comicsError) {
    throw new Error(`Failed to fetch user stats: ${comicsError.message}`)
  }

  const totalComics = comics?.length || 0
  const collectionValue = comics?.reduce((sum, comic) => sum + (comic.marketValue || 0), 0) || 0

  // Get active alerts count (assuming alerts table exists)
  const { count: alertsCount, error: alertsError } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('userId', userId)
    .eq('isActive', true)

  if (alertsError) {
    console.warn('Failed to fetch alerts count:', alertsError.message)
  }

  // Get recent additions (comics added in last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const { count: recentCount, error: recentError } = await supabase
    .from('comics')
    .select('*', { count: 'exact', head: true })
    .eq('userId', userId)
    .gte('createdAt', sevenDaysAgo.toISOString())

  if (recentError) {
    console.warn('Failed to fetch recent additions count:', recentError.message)
  }

  return {
    totalComics,
    collectionValue,
    activeAlerts: alertsCount || 0,
    recentAdditions: recentCount || 0
  }
}

// Fetch hot/trending comics (most recently added across all users)
export const fetchHotComics = async (): Promise<HotComic[]> => {
  const { data: comics, error } = await supabase
    .from('comics')
    .select('id, title, issue, publisher, coverImage, marketValue, createdAt')
    .order('createdAt', { ascending: false })
    .limit(5)

  if (error) {
    throw new Error(`Failed to fetch hot comics: ${error.message}`)
  }

  if (!comics) {
    return []
  }

  // Transform the data to match the expected format
  return comics.map((comic, index) => ({
    id: comic.id,
    title: comic.title,
    issue: comic.issue,
    publisher: comic.publisher,
    coverImage: comic.coverImage || `https://via.placeholder.com/200x300/D62828/FDF6E3?text=${encodeURIComponent(comic.title)}`,
    value: `£${comic.marketValue?.toLocaleString() || '0'}`,
    trend: index < 3 ? 'up' : 'neutral' as const, // Mock trend for now
    change: index < 3 ? `+${5 + index * 3}%` : '0%'
  }))
}

// Fetch recent news articles
export const fetchRecentNews = async (): Promise<NewsArticle[]> => {
  const { data: news, error } = await supabase
    .from('news')
    .select('id, title, excerpt, author, publishDate, category, featuredImage')
    .order('publishDate', { ascending: false })
    .limit(3)

  if (error) {
    throw new Error(`Failed to fetch recent news: ${error.message}`)
  }

  if (!news) {
    return []
  }

  // Transform to match NewsArticle interface
  return news.map(article => ({
    id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    content: '', // Not needed for preview
    author: article.author,
    publishDate: article.publishDate,
    category: article.category as any,
    tags: [],
    featuredImage: article.featuredImage
  }))
}