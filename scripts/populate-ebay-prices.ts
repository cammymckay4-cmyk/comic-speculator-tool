import { createClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const ebayApiKey = process.env.EBAY_API_KEY
const baseUrl = process.env.BASE_URL || 'http://localhost:5173'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- VITE_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

if (!ebayApiKey) {
  console.error('Missing eBay API key:')
  console.error('- EBAY_API_KEY')
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// eBay API rate limiting configuration (5,000/day = ~3.5 requests/minute max)
const RATE_LIMIT_DELAY_MS = 20 * 1000 // 20 seconds between requests (conservative)
const MAX_REQUESTS_PER_DAY = 4900 // Leave buffer from 5,000/day limit
const MAX_REQUESTS_PER_SESSION = 200 // Process in smaller batches

interface Comic {
  id: string
  title: string
  issue: string
  publisher: string
  market_value_low?: number | null
  market_value_medium?: number | null
  market_value_high?: number | null
  market_value_updated_at?: string | null
}

interface EbayUpdateResult {
  success: boolean
  comic_id: string
  title?: string
  issue?: string
  sales_data?: {
    sales_count: number
    price_range: {
      min: number
      max: number
      average: number
    }
    tier_prices: {
      low: number
      medium: number
      high: number
    }
  }
  error?: string
  updated_at?: string
}

// Progress tracking
interface ProgressState {
  totalComics: number
  processedComics: number
  successfulUpdates: number
  failedUpdates: number
  noDataFound: number
  requestsThisSession: number
  requestsToday: number
  startTime: string
  lastProcessedId?: string
  dailyResetDate: string
}

// Helper function to call eBay update API
async function updateComicPricesFromEbay(comic: Comic): Promise<EbayUpdateResult | null> {
  try {
    console.log(`📡 Fetching eBay prices for: "${comic.title} #${comic.issue}"`)
    
    const response = await fetch(`${baseUrl}/api/ebay/update-prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        comic_id: comic.id
      })
    })
    
    if (!response.ok) {
      console.log(`❌ eBay API error ${response.status}: ${response.statusText}`)
      return {
        success: false,
        comic_id: comic.id,
        error: `API error: ${response.status} ${response.statusText}`
      }
    }
    
    const result: EbayUpdateResult = await response.json()
    
    if (!result.success) {
      console.log(`❌ eBay update failed: ${result.error || 'Unknown error'}`)
      return result
    }
    
    if (result.sales_data?.sales_count === 0) {
      console.log(`ℹ️  No eBay sales data found`)
      return result
    }
    
    console.log(`✅ Updated with ${result.sales_data?.sales_count} sales - Avg: $${result.sales_data?.price_range.average}`)
    return result
    
  } catch (error) {
    console.log(`❌ eBay update error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return {
      success: false,
      comic_id: comic.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Helper function to save progress state
async function saveProgress(progress: ProgressState): Promise<void> {
  const progressFile = 'ebay-price-progress.json'
  const fs = await import('fs')
  fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2))
}

// Helper function to load progress state
async function loadProgress(): Promise<ProgressState | null> {
  try {
    const progressFile = 'ebay-price-progress.json'
    const fs = await import('fs')
    if (fs.existsSync(progressFile)) {
      const data = fs.readFileSync(progressFile, 'utf-8')
      const progress: ProgressState = JSON.parse(data)
      
      // Check if we need to reset daily counters
      const today = new Date().toDateString()
      if (progress.dailyResetDate !== today) {
        progress.requestsToday = 0
        progress.dailyResetDate = today
        console.log('🔄 Daily request counter reset')
      }
      
      return progress
    }
  } catch (error) {
    console.log('No previous progress found, starting fresh')
  }
  return null
}

// Helper function to wait with rate limiting
function waitForRateLimit(): Promise<void> {
  console.log(`⏳ Waiting ${RATE_LIMIT_DELAY_MS / 1000} seconds for rate limiting...`)
  return new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY_MS))
}

// Helper function to check if we should skip a comic based on recent updates
function shouldSkipComic(comic: Comic, daysThreshold: number = 7): boolean {
  if (!comic.market_value_updated_at) {
    return false // Never updated, should process
  }
  
  const lastUpdate = new Date(comic.market_value_updated_at)
  const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
  
  return daysSinceUpdate < daysThreshold
}

// Main function to populate eBay prices
async function populateEbayPrices(): Promise<void> {
  console.log('🚀 Starting eBay price population...')
  
  try {
    // Load previous progress if available
    let progress = await loadProgress()
    
    // Check daily rate limits
    if (progress?.requestsToday >= MAX_REQUESTS_PER_DAY) {
      console.log(`⏸️  Daily rate limit reached (${MAX_REQUESTS_PER_DAY}). Please try again tomorrow.`)
      return
    }
    
    // Get comics that need price updates
    let query = supabase
      .from('comics')
      .select('id, title, issue, publisher, market_value_low, market_value_medium, market_value_high, market_value_updated_at')
      .order('market_value_updated_at', { ascending: true, nullsFirst: true }) // Prioritize never-updated comics
      .limit(1000) // Process in chunks
    
    // If resuming, start from where we left off
    if (progress?.lastProcessedId) {
      console.log(`📍 Resuming from comic ID: ${progress.lastProcessedId}`)
      query = query.gt('id', progress.lastProcessedId)
    }
    
    const { data: allComics, error } = await query
    
    if (error) {
      console.error('❌ Failed to fetch comics:', error.message)
      process.exit(1)
    }
    
    if (!allComics || allComics.length === 0) {
      console.log('📚 No comics found to process!')
      return
    }
    
    // Filter out comics that were recently updated (within 7 days)
    const comics = allComics.filter(comic => !shouldSkipComic(comic, 7))
    
    if (comics.length === 0) {
      console.log('✨ All comics have been recently updated! No processing needed.')
      return
    }
    
    console.log(`📊 Found ${comics.length} comics needing eBay price updates (${allComics.length - comics.length} skipped as recently updated)`)
    
    // Initialize or update progress
    if (!progress) {
      const today = new Date().toDateString()
      progress = {
        totalComics: comics.length,
        processedComics: 0,
        successfulUpdates: 0,
        failedUpdates: 0,
        noDataFound: 0,
        requestsThisSession: 0,
        requestsToday: 0,
        startTime: new Date().toISOString(),
        dailyResetDate: today
      }
    } else {
      progress.totalComics = comics.length
    }
    
    console.log(`📈 Previous progress: ${progress.processedComics}/${progress.totalComics} processed, ${progress.successfulUpdates} successful updates`)
    console.log(`📊 Daily requests: ${progress.requestsToday}/${MAX_REQUESTS_PER_DAY}, Session requests: ${progress.requestsThisSession}/${MAX_REQUESTS_PER_SESSION}`)
    
    for (const comic of comics) {
      // Check session and daily rate limits
      if (progress.requestsThisSession >= MAX_REQUESTS_PER_SESSION) {
        console.log(`⏸️  Reached session request limit (${MAX_REQUESTS_PER_SESSION}). Stopping to prevent rate limit issues.`)
        console.log('💡 Run the script again to continue processing.')
        break
      }
      
      if (progress.requestsToday >= MAX_REQUESTS_PER_DAY) {
        console.log(`⏸️  Reached daily request limit (${MAX_REQUESTS_PER_DAY}). Stopping to respect eBay API limits.`)
        console.log('💡 Try again tomorrow to continue processing.')
        break
      }
      
      console.log(`\n🔄 Processing comic ${progress.processedComics + 1}/${progress.totalComics}: "${comic.title} #${comic.issue}"`)
      
      // Update eBay prices
      const result = await updateComicPricesFromEbay(comic)
      progress.requestsThisSession++
      progress.requestsToday++
      
      if (!result) {
        progress.failedUpdates++
      } else if (!result.success) {
        progress.failedUpdates++
      } else if (result.sales_data?.sales_count === 0) {
        progress.noDataFound++
      } else {
        progress.successfulUpdates++
      }
      
      progress.processedComics++
      progress.lastProcessedId = comic.id
      await saveProgress(progress)
      
      // Rate limiting wait for next iteration
      if (progress.requestsThisSession < MAX_REQUESTS_PER_SESSION && 
          progress.requestsToday < MAX_REQUESTS_PER_DAY) {
        await waitForRateLimit()
      }
    }
    
    // Final summary
    console.log('\n📈 eBay Price Population Summary:')
    console.log(`✅ Successfully updated: ${progress.successfulUpdates} comics`)
    console.log(`ℹ️  No data found: ${progress.noDataFound} comics`)
    console.log(`❌ Failed updates: ${progress.failedUpdates} comics`)
    console.log(`📊 Total processed this session: ${progress.processedComics} comics`)
    console.log(`🌐 API requests made this session: ${progress.requestsThisSession}`)
    console.log(`🌐 API requests made today: ${progress.requestsToday}/${MAX_REQUESTS_PER_DAY}`)
    
    const duration = Date.now() - new Date(progress.startTime).getTime()
    console.log(`⏱️  Session duration: ${Math.round(duration / 1000 / 60)} minutes`)
    
    if (progress.processedComics < progress.totalComics) {
      if (progress.requestsToday >= MAX_REQUESTS_PER_DAY) {
        console.log('\n💡 Daily rate limit reached. Continue tomorrow to process remaining comics.')
      } else {
        console.log('\n💡 To continue processing remaining comics, run the script again.')
      }
    } else {
      console.log('\n🎉 All comics have been processed!')
      // Clean up progress file when complete
      try {
        const fs = await import('fs')
        fs.unlinkSync('ebay-price-progress.json')
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    
  } catch (error) {
    console.error('💥 eBay price population failed:', error)
    process.exit(1)
  }
}

// Run the population script
populateEbayPrices().catch(console.error)