import { supabase } from '../supabaseClient';

/**
 * Database query optimization utilities
 */

/**
 * Cached queries with TTL
 */
interface CachedQuery<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const queryCache = new Map<string, CachedQuery<any>>();

/**
 * Execute query with caching
 */
export async function cachedQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  ttlSeconds: number = 300 // 5 minutes default
): Promise<T> {
  const now = Date.now();
  const cached = queryCache.get(cacheKey);
  
  if (cached && (now - cached.timestamp) < cached.ttl * 1000) {
    return cached.data;
  }
  
  const data = await queryFn();
  queryCache.set(cacheKey, {
    data,
    timestamp: now,
    ttl: ttlSeconds
  });
  
  return data;
}

/**
 * Clear cache for a specific key or all cache
 */
export function clearCache(key?: string): void {
  if (key) {
    queryCache.delete(key);
  } else {
    queryCache.clear();
  }
}

/**
 * Optimized collection query with proper joins and indexing
 */
export async function getUserCollectionOptimized(
  userId: string,
  isWishlist: boolean = false,
  limit: number = 50,
  offset: number = 0
) {
  const cacheKey = `user_collection_${userId}_${isWishlist}_${limit}_${offset}`;
  
  return cachedQuery(cacheKey, async () => {
    const { data, error, count } = await supabase
      .from('user_collections')
      .select(`
        id,
        acquisition_date,
        acquisition_price,
        current_value,
        notes,
        personal_rating,
        is_wishlist_item,
        created_at,
        comic_series:series_id!inner(
          id,
          name,
          publisher
        ),
        comic_issues:issue_id!inner(
          id,
          issue_number,
          variant,
          key_issue
        ),
        grading_standards:grade_id(
          id,
          company,
          grade_label,
          grade_value
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_wishlist_item', isWishlist)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch user collection: ${error.message}`);
    }

    return { data: data || [], count: count || 0 };
  }, 120); // 2 minute cache
}

/**
 * Optimized dashboard data with aggregate queries
 */
export async function getDashboardDataOptimized(userId: string) {
  const cacheKey = `dashboard_${userId}`;
  
  return cachedQuery(cacheKey, async () => {
    // Use a single query with aggregations instead of multiple queries
    const { data, error } = await supabase.rpc('get_user_dashboard_stats', {
      p_user_id: userId
    });

    if (error) {
      console.error('Dashboard query error:', error);
      // Fallback to individual queries if RPC fails
      return await getDashboardDataFallback(userId);
    }

    return data;
  }, 300); // 5 minute cache
}

/**
 * Fallback dashboard data queries
 */
async function getDashboardDataFallback(userId: string) {
  // Collection value query
  const collectionValueQuery = supabase
    .from('user_collections_valued')
    .select('current_market_value, acquisition_price')
    .eq('user_id', userId)
    .eq('is_wishlist_item', false);

  // Alert count query
  const alertCountQuery = supabase
    .from('user_alert_rules')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true);

  // Execute queries in parallel
  const [collectionResult, alertResult] = await Promise.all([
    collectionValueQuery,
    alertCountQuery
  ]);

  if (collectionResult.error) {
    throw new Error(`Collection query failed: ${collectionResult.error.message}`);
  }

  if (alertResult.error) {
    throw new Error(`Alert query failed: ${alertResult.error.message}`);
  }

  const totalValue = collectionResult.data?.reduce((sum, item) => {
    return sum + (item.current_market_value || item.acquisition_price || 0);
  }, 0) || 0;

  return {
    totalCollectionValue: totalValue,
    activeAlerts: alertResult.data?.length || 0,
    totalItems: collectionResult.data?.length || 0
  };
}

/**
 * Batch insert operation with conflict handling
 */
export async function batchInsertWithConflictHandling<T>(
  tableName: string,
  records: T[],
  conflictColumns: string[] = ['id'],
  batchSize: number = 100
): Promise<void> {
  const batches = [];
  for (let i = 0; i < records.length; i += batchSize) {
    batches.push(records.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const { error } = await supabase
      .from(tableName)
      .upsert(batch, {
        onConflict: conflictColumns.join(','),
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`Batch insert error for ${tableName}:`, error);
      throw new Error(`Batch insert failed: ${error.message}`);
    }
  }
}

/**
 * Optimized search with full-text search and ranking
 */
export async function searchComicsOptimized(
  searchTerm: string,
  limit: number = 20
) {
  const cacheKey = `search_${searchTerm}_${limit}`;
  
  return cachedQuery(cacheKey, async () => {
    // Use the search function from the database
    const { data, error } = await supabase.rpc('search_comic_series', {
      search_term: searchTerm
    }).limit(limit);

    if (error) {
      throw new Error(`Search failed: ${error.message}`);
    }

    return data || [];
  }, 600); // 10 minute cache for searches
}

/**
 * Performance monitoring and query logging
 */
export async function logSlowQuery(
  queryName: string,
  duration: number,
  queryDetails?: any
): Promise<void> {
  if (duration > 1000) { // Log queries slower than 1 second
    console.warn(`Slow query detected: ${queryName} took ${duration}ms`, queryDetails);
    
    // Log to monitoring table if available
    try {
      await supabase
        .from('system_metrics')
        .insert({
          metric_name: `slow_query_${queryName}`,
          metric_value: duration,
          metric_unit: 'ms',
          additional_data: queryDetails
        });
    } catch (error) {
      // Don't fail the main operation if logging fails
      console.error('Failed to log slow query:', error);
    }
  }
}

/**
 * Database health check
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const startTime = Date.now();
    
    // Simple query to test connectivity
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    const duration = Date.now() - startTime;
    
    if (error) {
      console.error('Database health check failed:', error);
      return false;
    }
    
    // Log if query is slow
    if (duration > 500) {
      console.warn(`Database health check slow: ${duration}ms`);
    }
    
    return true;
  } catch (error) {
    console.error('Database health check error:', error);
    return false;
  }
}

/**
 * Execute query with retry logic for transient failures
 */
export async function executeWithRetry<T>(
  queryFn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Check if error is retryable
      if (isRetryableError(error)) {
        console.warn(`Query failed (attempt ${attempt}/${maxRetries}), retrying in ${delayMs}ms:`, error);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2; // Exponential backoff
      } else {
        throw lastError;
      }
    }
  }
  
  throw lastError!;
}

/**
 * Check if an error is worth retrying
 */
function isRetryableError(error: any): boolean {
  const retryableMessages = [
    'connection',
    'timeout',
    'network',
    'temporary',
    'unavailable'
  ];
  
  const errorMessage = error?.message?.toLowerCase() || '';
  return retryableMessages.some(msg => errorMessage.includes(msg));
}

/**
 * Cleanup old cache entries periodically
 */
setInterval(() => {
  const now = Date.now();
  const expiredKeys: string[] = [];
  
  queryCache.forEach((value, key) => {
    if (now - value.timestamp > value.ttl * 1000) {
      expiredKeys.push(key);
    }
  });
  
  expiredKeys.forEach(key => queryCache.delete(key));
  
  if (expiredKeys.length > 0) {
    console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
  }
}, 60000); // Run every minute