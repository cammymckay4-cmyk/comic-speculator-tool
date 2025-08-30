import { supabase } from '../../lib/supabaseClient';

interface DashboardResponse {
  success: boolean;
  data?: DashboardData;
  error?: string;
  message?: string;
}

interface DashboardData {
  totalCollectionValue: number;
  valueOverTime: ValueOverTimeDataPoint[];
  marketHeatIndex: MarketHeatComic[];
  biggestMovers: {
    winners: BiggestMover[];
    losers: BiggestMover[];
  };
}

interface ValueOverTimeDataPoint {
  date: string;
  value: number;
  change: number;
  changePercentage: number;
}

interface MarketHeatComic {
  id: string;
  seriesName: string;
  issueNumber: string;
  variant?: string;
  currentValue: number;
  priceChange30d: number;
  priceChangePercentage: number;
  dealCount: number;
  heatScore: number;
}

interface BiggestMover {
  id: string;
  seriesName: string;
  issueNumber: string;
  variant?: string;
  currentValue: number;
  previousValue: number;
  priceChange: number;
  priceChangePercentage: number;
  grade?: string;
  inUserCollection: boolean;
}

/**
 * Extract and validate JWT token from Authorization header
 */
async function validateAuthToken(request: Request): Promise<{ user: any; error?: string }> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Authorization header required' };
  }

  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { user: null, error: 'Invalid or expired token' };
    }
    
    return { user };
  } catch (error) {
    return { user: null, error: 'Token validation failed' };
  }
}

/**
 * Calculate total collection value for the user
 */
async function getTotalCollectionValue(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_collections_valued')
    .select('current_market_value, acquisition_price')
    .eq('user_id', userId)
    .eq('is_wishlist_item', false);

  if (error) {
    console.error('Error fetching collection value:', error);
    return 0;
  }

  const totalValue = data?.reduce((sum, item) => {
    const value = item.current_market_value || item.acquisition_price || 0;
    return sum + value;
  }, 0) || 0;

  return totalValue;
}

/**
 * Get value over time data points for the user's collection
 */
async function getValueOverTime(userId: string): Promise<ValueOverTimeDataPoint[]> {
  // For now, we'll generate sample data based on current collection value
  // In a real implementation, you'd have historical value tracking
  const currentValue = await getTotalCollectionValue(userId);
  
  const dataPoints: ValueOverTimeDataPoint[] = [];
  const now = new Date();
  
  // Generate 12 months of sample data
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const variance = (Math.random() - 0.5) * 0.2; // ±10% variance
    const monthValue = currentValue * (1 + variance);
    const previousValue = i === 11 ? monthValue * 0.85 : dataPoints[dataPoints.length - 1]?.value || monthValue;
    
    const change = monthValue - previousValue;
    const changePercentage = previousValue > 0 ? (change / previousValue) * 100 : 0;
    
    dataPoints.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(monthValue * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercentage: Math.round(changePercentage * 100) / 100
    });
  }
  
  return dataPoints;
}

/**
 * Get market heat index comics (trending up significantly)
 */
async function getMarketHeatIndex(): Promise<MarketHeatComic[]> {
  const { data, error } = await supabase
    .from('trending_comics')
    .select(`
      series_name,
      issue_number,
      median_price,
      price_trend_30d,
      sample_count,
      trend_category
    `)
    .in('trend_category', ['hot', 'trending_up'])
    .order('price_trend_30d', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching market heat index:', error);
    return [];
  }

  // Calculate deal count from active deals
  const heatComics: MarketHeatComic[] = [];
  
  for (const comic of data || []) {
    // Get deal count for this comic
    const { data: dealData } = await supabase
      .from('active_deals_detailed')
      .select('deal_id')
      .eq('series_name', comic.series_name)
      .eq('issue_number', comic.issue_number);

    const dealCount = dealData?.length || 0;
    const heatScore = Math.min(100, comic.price_trend_30d + (dealCount * 2));

    heatComics.push({
      id: `${comic.series_name}-${comic.issue_number}`.replace(/\s+/g, '-').toLowerCase(),
      seriesName: comic.series_name,
      issueNumber: comic.issue_number,
      currentValue: comic.median_price || 0,
      priceChange30d: comic.price_trend_30d || 0,
      priceChangePercentage: comic.price_trend_30d || 0,
      dealCount,
      heatScore: Math.round(heatScore * 100) / 100
    });
  }
  
  return heatComics;
}

/**
 * Get biggest movers (winners and losers) from user's collection and market
 */
async function getBiggestMovers(userId: string): Promise<{ winners: BiggestMover[]; losers: BiggestMover[]; }> {
  // Get user's collection with market data
  const { data: userCollection, error: collectionError } = await supabase
    .from('user_collections_valued')
    .select(`
      collection_id,
      series_name,
      issue_number,
      variant,
      current_market_value,
      acquisition_price,
      gain_loss_percentage,
      grade_label
    `)
    .eq('user_id', userId)
    .eq('is_wishlist_item', false)
    .not('gain_loss_percentage', 'is', null);

  if (collectionError) {
    console.error('Error fetching user collection for movers:', collectionError);
  }

  // Get trending comics for market movers
  const { data: marketTrending, error: trendingError } = await supabase
    .from('trending_comics')
    .select(`
      series_name,
      issue_number,
      median_price,
      price_trend_30d,
      grade_label
    `)
    .not('price_trend_30d', 'is', null)
    .order('price_trend_30d', { ascending: false })
    .limit(20);

  if (trendingError) {
    console.error('Error fetching trending comics for movers:', trendingError);
  }

  const allMovers: BiggestMover[] = [];

  // Process user collection
  if (userCollection) {
    for (const item of userCollection) {
      if (item.gain_loss_percentage !== null && item.current_market_value && item.acquisition_price) {
        const change = item.current_market_value - item.acquisition_price;
        allMovers.push({
          id: item.collection_id,
          seriesName: item.series_name,
          issueNumber: item.issue_number,
          variant: item.variant,
          currentValue: item.current_market_value,
          previousValue: item.acquisition_price,
          priceChange: change,
          priceChangePercentage: item.gain_loss_percentage,
          grade: item.grade_label,
          inUserCollection: true
        });
      }
    }
  }

  // Process market trending (not in collection)
  if (marketTrending) {
    for (const item of marketTrending) {
      // Check if already in user collection
      const inCollection = userCollection?.some(uc => 
        uc.series_name === item.series_name && 
        uc.issue_number === item.issue_number
      );

      if (!inCollection && item.price_trend_30d !== null) {
        const previousValue = item.median_price * (1 - (item.price_trend_30d / 100));
        const change = item.median_price - previousValue;
        
        allMovers.push({
          id: `market-${item.series_name}-${item.issue_number}`.replace(/\s+/g, '-').toLowerCase(),
          seriesName: item.series_name,
          issueNumber: item.issue_number,
          currentValue: item.median_price || 0,
          previousValue: previousValue,
          priceChange: change,
          priceChangePercentage: item.price_trend_30d,
          grade: item.grade_label,
          inUserCollection: false
        });
      }
    }
  }

  // Sort and split into winners and losers
  const sortedByPercentage = allMovers.sort((a, b) => b.priceChangePercentage - a.priceChangePercentage);
  
  const winners = sortedByPercentage.filter(m => m.priceChangePercentage > 0).slice(0, 10);
  const losers = sortedByPercentage.filter(m => m.priceChangePercentage < 0).slice(-10).reverse();

  return { winners, losers };
}

/**
 * GET /api/dashboard - Retrieve comprehensive dashboard data
 */
async function handleGetDashboard(request: Request): Promise<Response> {
  const { user, error: authError } = await validateAuthToken(request);
  
  if (authError || !user) {
    return new Response(
      JSON.stringify({ success: false, error: authError || 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Aggregate all dashboard data
    const [totalCollectionValue, valueOverTime, marketHeatIndex, biggestMovers] = await Promise.all([
      getTotalCollectionValue(user.id),
      getValueOverTime(user.id),
      getMarketHeatIndex(),
      getBiggestMovers(user.id)
    ]);

    const dashboardData: DashboardData = {
      totalCollectionValue,
      valueOverTime,
      marketHeatIndex,
      biggestMovers
    };

    const response: DashboardResponse = {
      success: true,
      data: dashboardData,
      message: 'Dashboard data retrieved successfully'
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, max-age=300' // Cache for 5 minutes
        } 
      }
    );

  } catch (error) {
    console.error('API Error in GET /api/dashboard:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Main API handler for /api/dashboard
 */
export async function handler(request: Request): Promise<Response> {
  try {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    switch (request.method) {
      case 'GET':
        return handleGetDashboard(request);
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Method not allowed' }),
          { status: 405, headers: { 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('API Error in /api/dashboard:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Export for different runtime environments
export default handler;
export { handler as GET };