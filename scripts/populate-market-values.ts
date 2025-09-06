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

// Rate limiting configuration (100 requests/day = 1 request every ~14.4 minutes)
const RATE_LIMIT_DELAY_MS = 15 * 60 * 1000 // 15 minutes between requests
const MAX_REQUESTS_PER_SESSION = 95 // Leave some buffer from the 100/day limit

interface Comic {
  id: string
  title: string
  issue: string
  publisher: string
  gocollect_id?: string | null
  market_value_low?: number | null
  market_value_medium?: number | null
  market_value_high?: number | null
  market_value_updated_at?: string | null
}

interface GoCollectSearchResult {
  success: boolean
  data?: {
    results?: Array<{
      item_id: string
      title: string
      issue_number?: string
      publisher?: string
      score?: number
    }>
  }
  error?: string
}

interface GoCollectValueResult {
  success: boolean
  item_id: string
  title?: string
  issue_number?: string
  low_value?: number
  medium_value?: number
  high_value?: number
  error?: string
}

// Progress tracking
interface ProgressState {
  totalComics: number
  processedComics: number
  successfulUpdates: number
  failedSearches: number
  failedValueFetches: number
  requestsThisSession: number
  startTime: string
  lastProcessedId?: string
}

// Helper function to search GoCollect for matching comic
async function searchGoCollectComic(comic: Comic): Promise<string | null> {
  try {
    const searchQuery = `${comic.title} ${comic.issue}`.trim()
    console.log(`🔍 Searching GoCollect for: "${searchQuery}"`)
    
    const response = await fetch(`${baseUrl}/api/gocollect/search?title=${encodeURIComponent(comic.title)}&issue=${encodeURIComponent(comic.issue)}`)
    
    if (!response.ok) {
      console.log(`❌ Search API error ${response.status}: ${response.statusText}`)
      return null
    }
    
    const result: GoCollectSearchResult = await response.json()
    
    if (!result.success || !result.data?.results?.length) {
      console.log(`❌ No search results found`)
      return null
    }
    
    // Find the best match - prefer exact title and issue matches
    const results = result.data.results
    let bestMatch = results[0] // Default to first result
    
    for (const item of results) {
      // Check for exact title match
      const titleMatch = item.title?.toLowerCase().includes(comic.title.toLowerCase())
      // Check for issue match
      const issueMatch = item.issue_number === comic.issue || 
                        item.issue_number === `#${comic.issue}` ||
                        comic.issue.includes(item.issue_number || '')
      
      if (titleMatch && issueMatch) {
        bestMatch = item
        break
      }
    }
    
    console.log(`✅ Found match: ${bestMatch.title} #${bestMatch.issue_number} (ID: ${bestMatch.item_id})`)
    return bestMatch.item_id
    
  } catch (error) {
    console.log(`❌ Search error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return null
  }
}

// Helper function to fetch market values from GoCollect
async function fetchGoCollectValues(gocollectId: string): Promise<GoCollectValueResult | null> {
  try {
    console.log(`💰 Fetching values for GoCollect ID: ${gocollectId}`)
    
    const response = await fetch(`${baseUrl}/api/gocollect/value?item_id=${encodeURIComponent(gocollectId)}`)
    
    if (!response.ok) {
      console.log(`❌ Value API error ${response.status}: ${response.statusText}`)
      return null
    }
    
    const result: GoCollectValueResult = await response.json()
    
    if (!result.success) {
      console.log(`❌ Value fetch failed: ${result.error || 'Unknown error'}`)
      return null
    }
    
    console.log(`✅ Values fetched - Low: £${result.low_value}, Medium: £${result.medium_value}, High: £${result.high_value}`)
    return result
    
  } catch (error) {
    console.log(`❌ Value fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return null
  }
}

// Helper function to update comic with market values
async function updateComicValues(comicId: string, gocollectId: string, values: GoCollectValueResult): Promise<boolean> {
  try {
    const updateData = {
      gocollect_id: gocollectId,
      market_value_low: values.low_value || null,
      market_value_medium: values.medium_value || null,
      market_value_high: values.high_value || null,
      market_value_updated_at: new Date().toISOString()
    }
    
    const { error } = await supabase
      .from('comics')
      .update(updateData)
      .eq('id', comicId)
    
    if (error) {
      console.log(`❌ Database update error: ${error.message}`)
      return false
    }
    
    console.log(`✅ Updated comic ${comicId} in database`)
    return true
    
  } catch (error) {
    console.log(`❌ Database update error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return false
  }
}

// Helper function to save progress state
async function saveProgress(progress: ProgressState): Promise<void> {
  const progressFile = 'market-value-progress.json'
  const fs = await import('fs')
  fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2))
}

// Helper function to load progress state
async function loadProgress(): Promise<ProgressState | null> {
  try {
    const progressFile = 'market-value-progress.json'
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

// Helper function to wait with rate limiting
function waitForRateLimit(): Promise<void> {
  console.log(`⏳ Waiting ${RATE_LIMIT_DELAY_MS / 1000 / 60} minutes for rate limiting...`)
  return new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY_MS))
}

// Main function to populate market values
async function populateMarketValues(): Promise<void> {
  console.log('🚀 Starting market value population from GoCollect...')
  
  try {
    // Load previous progress if available
    let progress = await loadProgress()
    
    // Get comics that need market value updates
    let query = supabase
      .from('comics')
      .select('id, title, issue, publisher, gocollect_id, market_value_low, market_value_medium, market_value_high, market_value_updated_at')
      .is('market_value_updated_at', null) // Only comics that haven't been processed
      .order('created_at', { ascending: true })
      .limit(1000) // Process in chunks
    
    // If resuming, start from where we left off
    if (progress?.lastProcessedId) {
      console.log(`📍 Resuming from comic ID: ${progress.lastProcessedId}`)
      query = query.gt('id', progress.lastProcessedId)
    }
    
    const { data: comics, error } = await query
    
    if (error) {
      console.error('❌ Failed to fetch comics:', error.message)
      process.exit(1)
    }
    
    if (!comics || comics.length === 0) {
      console.log('🎉 No comics need market value updates!')
      return
    }
    
    // Initialize or update progress
    if (!progress) {
      progress = {
        totalComics: comics.length,
        processedComics: 0,
        successfulUpdates: 0,
        failedSearches: 0,
        failedValueFetches: 0,
        requestsThisSession: 0,
        startTime: new Date().toISOString()
      }
    }
    
    console.log(`📊 Found ${comics.length} comics to process`)
    console.log(`📈 Previous progress: ${progress.processedComics}/${progress.totalComics} processed, ${progress.successfulUpdates} successful updates`)
    
    for (const comic of comics) {
      // Check rate limiting
      if (progress.requestsThisSession >= MAX_REQUESTS_PER_SESSION) {
        console.log(`⏸️  Reached session request limit (${MAX_REQUESTS_PER_SESSION}). Stopping to respect rate limits.`)
        console.log('💡 Run the script again later to continue processing.')
        break
      }
      
      console.log(`\n🔄 Processing comic ${progress.processedComics + 1}/${progress.totalComics}: "${comic.title} #${comic.issue}"`)
      
      let gocollectId = comic.gocollect_id
      
      // Search for GoCollect ID if not already found
      if (!gocollectId) {
        gocollectId = await searchGoCollectComic(comic)
        progress.requestsThisSession++
        
        if (!gocollectId) {
          progress.failedSearches++
          progress.processedComics++
          progress.lastProcessedId = comic.id
          await saveProgress(progress)
          continue
        }
        
        // Wait for rate limiting between requests
        if (progress.requestsThisSession < MAX_REQUESTS_PER_SESSION) {
          await waitForRateLimit()
        }
      }
      
      // Fetch market values
      const values = await fetchGoCollectValues(gocollectId)
      progress.requestsThisSession++
      
      if (!values) {
        progress.failedValueFetches++
        progress.processedComics++
        progress.lastProcessedId = comic.id
        await saveProgress(progress)
        continue
      }
      
      // Update database
      const success = await updateComicValues(comic.id, gocollectId, values)
      
      if (success) {
        progress.successfulUpdates++
      }
      
      progress.processedComics++
      progress.lastProcessedId = comic.id
      await saveProgress(progress)
      
      // Rate limiting wait for next iteration
      if (progress.requestsThisSession < MAX_REQUESTS_PER_SESSION) {
        await waitForRateLimit()
      }
    }
    
    // Final summary
    console.log('\n📈 Population Summary:')
    console.log(`✅ Successfully updated: ${progress.successfulUpdates} comics`)
    console.log(`❌ Failed searches: ${progress.failedSearches} comics`)
    console.log(`❌ Failed value fetches: ${progress.failedValueFetches} comics`)
    console.log(`📊 Total processed this session: ${progress.processedComics} comics`)
    console.log(`🌐 API requests made this session: ${progress.requestsThisSession}`)
    
    const duration = Date.now() - new Date(progress.startTime).getTime()
    console.log(`⏱️  Session duration: ${Math.round(duration / 1000 / 60)} minutes`)
    
    if (progress.processedComics < progress.totalComics) {
      console.log('\n💡 To continue processing remaining comics, run the script again.')
    } else {
      console.log('\n🎉 All comics have been processed!')
      // Clean up progress file when complete
      try {
        const fs = await import('fs')
        fs.unlinkSync('market-value-progress.json')
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    
  } catch (error) {
    console.error('💥 Population failed:', error)
    process.exit(1)
  }
}

// Run the population script
populateMarketValues().catch(console.error)