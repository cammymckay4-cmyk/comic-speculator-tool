import { createClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const baseUrl = process.env.BASE_URL || 'http://localhost:5173' // Default to Vite dev server

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- VITE_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Rate limiting configuration (5,000 requests/day = 1 request every ~17.3 seconds)
const RATE_LIMIT_DELAY_MS = 18 * 1000 // 18 seconds between requests for safety
const MAX_REQUESTS_PER_DAY = 4800 // Leave some buffer from the 5,000/day limit

interface Comic {
  id: string
  title: string
  issue: string
  publisher: string
  ebay_low_price?: number | null
  ebay_medium_price?: number | null
  ebay_high_price?: number | null
  ebay_updated_at?: string | null
}

interface EbayUpdateResult {
  success: boolean
  comic_id: string
  title?: string
  issue?: string
  prices?: {
    low: number
    medium: number
    high: number
  }
  total_listings_found?: number
  message?: string
  error?: string
}

// Progress tracking
interface ProgressState {
  totalComics: number
  processedComics: number
  successfulUpdates: number
  failedUpdates: number
  requestsThisSession: number
  requestsToday: number
  startTime: string
  lastProcessedId?: string
  lastRequestDate?: string
}

// Helper function to update eBay prices for a single comic
async function updateEbayPricesForComic(comic: Comic): Promise<EbayUpdateResult | null> {
  try {
    console.log(`💰 Updating eBay prices for: "${comic.title} #${comic.issue}"`)
    
    const response = await fetch(`${baseUrl}/api/ebay/update-prices?comic_id=${encodeURIComponent(comic.id)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.log(`❌ eBay API error ${response.status}: ${response.statusText}`)
      return {
        success: false,
        comic_id: comic.id,
        error: `HTTP ${response.status}: ${response.statusText}`
      }
    }
    
    const result: EbayUpdateResult = await response.json()
    
    if (!result.success) {
      console.log(`❌ eBay update failed: ${result.error || result.message || 'Unknown error'}`)
      return result
    }
    
    if (result.prices) {
      console.log(`✅ Prices updated - Low: £${result.prices.low}, Medium: £${result.prices.medium}, High: £${result.prices.high}`)
    } else {
      console.log(`✅ ${result.message || 'No listings found'}`)
    }
    
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
      return JSON.parse(data)
    }
  } catch (error) {
    console.log('No previous progress found, starting fresh')
  }
  return null
}

// Helper function to check if we've reached daily limit
function checkDailyLimit(progress: ProgressState): boolean {
  const today = new Date().toDateString()
  const progressDate = progress.lastRequestDate ? new Date(progress.lastRequestDate).toDateString() : ''
  
  // Reset daily counter if it's a new day
  if (today !== progressDate) {
    progress.requestsToday = 0
    progress.lastRequestDate = new Date().toISOString()
    return false
  }
  
  return progress.requestsToday >= MAX_REQUESTS_PER_DAY
}

// Helper function to wait with rate limiting
function waitForRateLimit(): Promise<void> {
  console.log(`⏳ Waiting ${RATE_LIMIT_DELAY_MS / 1000} seconds for rate limiting...`)
  return new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY_MS))
}

// Helper function to get next batch of comics
async function getComicsToProcess(lastProcessedId?: string, limit: number = 100): Promise<Comic[]> {
  let query = supabase
    .from('comics')
    .select('id, title, issue, publisher, ebay_low_price, ebay_medium_price, ebay_high_price, ebay_updated_at')
    .order('created_at', { ascending: true })
    .limit(limit)
  
  // Filter for comics that need eBay price updates (null or old prices)
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  
  query = query.or(`ebay_updated_at.is.null,ebay_updated_at.lt.${threeDaysAgo.toISOString()}`)
  
  // If resuming, start from where we left off
  if (lastProcessedId) {
    query = query.gt('id', lastProcessedId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('❌ Failed to fetch comics:', error.message)
    return []
  }
  
  return data || []
}

// Main function to populate eBay prices
async function populateEbayPrices(): Promise<void> {
  console.log('🚀 Starting eBay price population...')
  
  try {
    // Load previous progress if available
    let progress = await loadProgress()
    
    // Check daily rate limit
    if (progress && checkDailyLimit(progress)) {
      console.log('⏸️  Daily API request limit reached (5,000/day). Please try again tomorrow.')
      return
    }
    
    // Get initial batch of comics to process
    let comics = await getComicsToProcess(progress?.lastProcessedId, 100)
    
    if (!comics || comics.length === 0) {
      console.log('🎉 No comics need eBay price updates!')
      return
    }
    
    // Initialize or update progress
    if (!progress) {
      // Count total comics that need updates for better progress tracking
      const { count } = await supabase
        .from('comics')
        .select('*', { count: 'exact', head: true })
        .or('ebay_updated_at.is.null,ebay_updated_at.lt.' + new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())
      
      progress = {
        totalComics: count || comics.length,
        processedComics: 0,
        successfulUpdates: 0,
        failedUpdates: 0,
        requestsThisSession: 0,
        requestsToday: 0,
        startTime: new Date().toISOString(),
        lastRequestDate: new Date().toISOString()
      }
    }
    
    console.log(`📊 Found ${comics.length} comics to process in this batch`)
    console.log(`📈 Previous progress: ${progress.processedComics}/${progress.totalComics} processed, ${progress.successfulUpdates} successful updates`)
    console.log(`🌐 Requests today: ${progress.requestsToday}/${MAX_REQUESTS_PER_DAY}`)
    
    let batchIndex = 0
    
    while (comics.length > 0) {
      console.log(`\n📦 Processing batch ${batchIndex + 1} (${comics.length} comics)`)
      
      for (const comic of comics) {
        // Check daily limit before each request
        if (checkDailyLimit(progress)) {
          console.log(`⏸️  Reached daily request limit (${MAX_REQUESTS_PER_DAY}). Stopping for today.`)
          console.log('💡 Run the script tomorrow to continue processing.')
          await saveProgress(progress)
          return
        }
        
        // Check session limit for safety
        if (progress.requestsThisSession >= 500) { // Conservative session limit
          console.log(`⏸️  Reached session request limit (500). Stopping to be safe.`)
          console.log('💡 Run the script again to continue processing.')
          await saveProgress(progress)
          return
        }
        
        console.log(`\n🔄 Processing comic ${progress.processedComics + 1}: "${comic.title} #${comic.issue}"`)
        
        // Update eBay prices for this comic
        const result = await updateEbayPricesForComic(comic)
        progress.requestsThisSession++
        progress.requestsToday++
        progress.lastRequestDate = new Date().toISOString()
        
        if (result?.success) {
          progress.successfulUpdates++
        } else {
          progress.failedUpdates++
        }
        
        progress.processedComics++
        progress.lastProcessedId = comic.id
        await saveProgress(progress)
        
        // Rate limiting wait between requests
        await waitForRateLimit()
      }
      
      // Get next batch of comics
      batchIndex++
      comics = await getComicsToProcess(progress.lastProcessedId, 100)
      
      // Update total count if we found more comics
      if (comics.length > 0 && progress.processedComics >= progress.totalComics) {
        progress.totalComics += comics.length
      }
    }
    
    // Final summary
    console.log('\n📈 eBay Price Population Summary:')
    console.log(`✅ Successfully updated: ${progress.successfulUpdates} comics`)
    console.log(`❌ Failed updates: ${progress.failedUpdates} comics`)
    console.log(`📊 Total processed this session: ${progress.processedComics} comics`)
    console.log(`🌐 API requests made this session: ${progress.requestsThisSession}`)
    console.log(`🌐 Total API requests today: ${progress.requestsToday}/${MAX_REQUESTS_PER_DAY}`)
    
    const duration = Date.now() - new Date(progress.startTime).getTime()
    console.log(`⏱️  Session duration: ${Math.round(duration / 1000 / 60)} minutes`)
    
    // Clean up progress file when all processing is complete
    if (comics.length === 0) {
      console.log('\n🎉 All comics have been processed!')
      try {
        const fs = await import('fs')
        fs.unlinkSync('ebay-price-progress.json')
        console.log('🧹 Progress file cleaned up')
      } catch (error) {
        // Ignore cleanup errors
      }
    } else {
      console.log('\n💡 Run the script again to continue processing remaining comics.')
    }
    
  } catch (error) {
    console.error('💥 eBay price population failed:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏸️  Received interrupt signal. Saving progress...')
  // Progress is already being saved after each comic, so we can exit safely
  console.log('💾 Progress saved. You can resume later by running the script again.')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n⏸️  Received termination signal. Saving progress...')
  console.log('💾 Progress saved. You can resume later by running the script again.')
  process.exit(0)
})

// Run the population script
populateEbayPrices().catch(console.error)