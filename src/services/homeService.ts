import { supabase } from '@/lib/supabaseClient'
import type { Comic, NewsArticle, EbayStatus } from '@/lib/types'
import { addEbayStatusToComic } from '@/lib/ebayUtils'

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
  ebayStatus?: EbayStatus
}

// Fetch user's collection statistics
export const fetchUserStats = async (userId: string): Promise<UserStats> => {
  if (!userId) {
    throw new Error('User ID is required')
  }

  // Get total comics count and collection value from user collection
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const { data: collectionEntries, error: comicsError } = await supabase
    .from('user_collection_entries')
    .select(`
      *,
      comic:comics(market_value)
    `)
    .eq('user_id', user.id)

  if (comicsError) {
    throw new Error(`Failed to fetch user stats: ${comicsError.message}`)
  }

  const totalComics = collectionEntries?.length || 0
  const collectionValue = collectionEntries?.reduce((sum, entry) => {
    const marketValue = Array.isArray(entry.comic) ? entry.comic[0]?.market_value : entry.comic?.market_value
    return sum + (marketValue || 0)
  }, 0) || 0

  // Get active alerts count (assuming alerts table exists)
  const { count: alertsCount, error: alertsError } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (alertsError) {
    console.warn('Failed to fetch alerts count:', alertsError.message)
  }

  // Get recent additions (collection entries added in last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const { count: recentCount, error: recentError } = await supabase
    .from('user_collection_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('added_date', sevenDaysAgo.toISOString())

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

// Fetch hot/trending comics (most recently added to master list)
export const fetchHotComics = async (): Promise<HotComic[]> => {
  const { data: comics, error } = await supabase
    .from('comics')
    .select('id, title, issue, publisher, cover_image, market_value, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    throw new Error(`Failed to fetch hot comics: ${error.message}`)
  }

  if (!comics) {
    return []
  }

  // Transform the data to match the expected format
  return comics.map((comic, index) => {
    const baseComic = {
      id: comic.id,
      title: comic.title,
      issue: comic.issue,
      publisher: comic.publisher,
      coverImage: comic.cover_image || `https://via.placeholder.com/200x300/D62828/FDF6E3?text=${encodeURIComponent(comic.title)}`,
      value: `£${comic.market_value?.toLocaleString() || '0'}`,
      trend: (index < 3 ? 'up' : 'neutral') as 'up' | 'down' | 'neutral', // Mock trend for now
      change: index < 3 ? `+${5 + index * 3}%` : '0%'
    }
    
    // Add eBay status using utility function
    return addEbayStatusToComic(baseComic)
  })
}

// Fetch recent news articles
export const fetchRecentNews = async (): Promise<NewsArticle[]> => {
  const { data: news, error } = await supabase
    .from('news')
    .select('id, title, excerpt, author, publish_date, category, featured_image')
    .order('publish_date', { ascending: false })
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
    publishDate: article.publish_date,
    category: article.category as any,
    tags: [],
    featuredImage: article.featured_image
  }))
}