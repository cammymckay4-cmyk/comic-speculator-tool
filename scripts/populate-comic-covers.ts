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

// ComicVine API rate limiting configuration (200 requests per hour)
const RATE_LIMIT_DELAY_MS = 18 * 1000 // 18 seconds between requests (200/hour = 1 request every 18 seconds)
const MAX_REQUESTS_PER_SESSION = 190 // Leave some buffer from the 200/hour limit

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface Comic {
  id: string
  title: string
  issue: string
  publisher: string
  cover_image?: string | null
}

interface FetchCoverResponse {
  success: boolean
  comic_id?: string
  cover_url?: string
  error?: string
  message?: string
}

// Progress tracking interface
interface ProgressState {
  totalComics: number
  processedComics: number
  successfulUpdates: number
  failedUpdates: number
  skippedComics: number
  requestsThisSession: number
  startTime: string
  lastProcessedId?: string
  sessionId: string
}

// Helper function to fetch comic cover using the API endpoint
async function fetchComicCover(comicId: string): Promise<FetchCoverResponse> {
  try {
    console.log(`📸 Fetching cover for comic ID: ${comicId}`)
    
    const response = await fetch(`${baseUrl}/api/comicvine/fetch-cover?comic_id=${encodeURIComponent(comicId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'comic-speculator-tool-script/1.0'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log(`❌ API error ${response.status}: ${response.statusText}`)
      console.log(`Error details: ${errorText}`)
      return {
        success: false,
        error: `API error ${response.status}: ${response.statusText}`,
        message: errorText
      }
    }
    
    const result: FetchCoverResponse = await response.json() as FetchCoverResponse
    
    if (result.success) {
      console.log(`✅ Cover fetched successfully: ${result.cover_url}`)
    } else {
      console.log(`❌ Cover fetch failed: ${result.error || 'Unknown error'}`)
    }
    
    return result
    
  } catch (error) {
    console.log(`❌ Fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return {
      success: false,
      error: 'Request failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Helper function to save progress state
async function saveProgress(progress: ProgressState): Promise<void> {
  const progressFile = 'comic-covers-progress.json'
  const fs = await import('fs')
  fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2))
  console.log(`💾 Progress saved: ${progress.processedComics}/${progress.totalComics} processed`)
}

// Helper function to load progress state
async function loadProgress(): Promise<ProgressState | null> {
  try {
    const progressFile = 'comic-covers-progress.json'
    const fs = await import('fs')
    if (fs.existsSync(progressFile)) {
      const data = fs.readFileSync(progressFile, 'utf-8')
      const progress: ProgressState = JSON.parse(data)
      console.log(`📂 Loaded previous progress: ${progress.processedComics}/${progress.totalComics} processed`)
      return progress
    }
  } catch (error) {
    console.log('No previous progress found, starting fresh')
  }
  return null
}

// Helper function to wait with rate limiting
function waitForRateLimit(): Promise<void> {
  console.log(`⏳ Waiting ${RATE_LIMIT_DELAY_MS / 1000} seconds for ComicVine rate limiting...`)
  return new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY_MS))
}

// Helper function to generate session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Helper function to estimate time remaining
function estimateTimeRemaining(progress: ProgressState): string {
  const elapsed = Date.now() - new Date(progress.startTime).getTime()
  const averageTimePerComic = elapsed / progress.processedComics
  const remaining = progress.totalComics - progress.processedComics
  const estimatedMs = remaining * averageTimePerComic
  
  const hours = Math.floor(estimatedMs / (1000 * 60 * 60))
  const minutes = Math.floor((estimatedMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `~${hours}h ${minutes}m`
  } else {
    return `~${minutes}m`
  }
}

// Main function to populate comic covers
async function populateComicCovers(): Promise<void> {
  console.log('🚀 Starting comic cover population from ComicVine...')
  console.log(`⏰ Rate limit: 200 requests/hour (${RATE_LIMIT_DELAY_MS / 1000}s between requests)`)
  
  try {
    // Load previous progress if available
    let progress = await loadProgress()
    const isResuming = !!progress
    
    // Get comics that need cover images
    let query = supabase
      .from('comics')
      .select('id, title, issue, publisher, cover_image')
      .or('cover_image.is.null,cover_image.eq.') // Comics without cover images or empty string
      .order('created_at', { ascending: true })
      .limit(1000) // Process in chunks to avoid memory issues
    
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
      console.log('🎉 No comics need cover images!')
      
      // Clean up progress file if all done
      if (progress) {
        try {
          const fs = await import('fs')
          fs.unlinkSync('comic-covers-progress.json')
          console.log('🧹 Cleaned up progress file')
        } catch (error) {
          // Ignore cleanup errors
        }
      }
      
      return
    }
    
    // Initialize or update progress
    if (!progress) {
      progress = {
        totalComics: comics.length,
        processedComics: 0,
        successfulUpdates: 0,
        failedUpdates: 0,
        skippedComics: 0,
        requestsThisSession: 0,
        startTime: new Date().toISOString(),
        sessionId: generateSessionId()
      }
    } else {
      // Reset session counters but keep cumulative progress
      progress.requestsThisSession = 0
      progress.sessionId = generateSessionId()
    }
    
    console.log(`📊 Found ${comics.length} comics to process`)
    if (isResuming) {
      console.log(`📈 Previous progress: ${progress.processedComics}/${progress.totalComics} processed, ${progress.successfulUpdates} successful`)
    }
    
    // Process each comic
    for (let i = 0; i < comics.length; i++) {
      const comic = comics[i]
      
      // Check rate limiting for this session
      if (progress.requestsThisSession >= MAX_REQUESTS_PER_SESSION) {
        console.log(`\n⏸️  Reached session request limit (${MAX_REQUESTS_PER_SESSION}). Stopping to respect ComicVine rate limits.`)
        console.log('💡 Run the script again in an hour to continue processing.')
        await saveProgress(progress)
        break
      }
      
      const comicNumber = progress.processedComics + 1
      const totalComics = progress.totalComics
      const percentage = Math.round((comicNumber / totalComics) * 100)
      
      console.log(`\n🔄 Processing comic ${comicNumber}/${totalComics} (${percentage}%): "${comic.title} #${comic.issue}"`)
      
      if (progress.processedComics > 0 && comicNumber % 10 === 0) {
        const timeRemaining = estimateTimeRemaining(progress)
        console.log(`📈 Progress update: ${percentage}% complete, estimated time remaining: ${timeRemaining}`)
      }
      
      // Skip comics that already have cover images (in case data changed since query)
      if (comic.cover_image && comic.cover_image.trim() !== '') {
        console.log(`⏭️  Skipping - already has cover image`)
        progress.skippedComics++
        progress.processedComics++
        progress.lastProcessedId = comic.id
        continue
      }
      
      // Fetch cover image using API endpoint
      const result = await fetchComicCover(comic.id)
      progress.requestsThisSession++
      
      if (result.success) {
        progress.successfulUpdates++
        console.log(`✅ Cover added successfully`)
      } else {
        progress.failedUpdates++
        console.log(`❌ Failed to fetch cover: ${result.error}`)
      }
      
      progress.processedComics++
      progress.lastProcessedId = comic.id
      
      // Save progress every 5 comics or if this is the last one
      if (progress.processedComics % 5 === 0 || i === comics.length - 1) {
        await saveProgress(progress)
      }
      
      // Rate limiting wait (except for the last comic)
      if (i < comics.length - 1 && progress.requestsThisSession < MAX_REQUESTS_PER_SESSION) {
        await waitForRateLimit()
      }
    }
    
    // Final summary
    const duration = Date.now() - new Date(progress.startTime).getTime()
    const durationHours = Math.round(duration / 1000 / 60 / 60 * 10) / 10
    const durationMinutes = Math.round(duration / 1000 / 60)
    
    console.log('\n📈 Population Summary:')
    console.log(`✅ Successfully updated: ${progress.successfulUpdates} comics`)
    console.log(`❌ Failed updates: ${progress.failedUpdates} comics`)
    console.log(`⏭️  Skipped (already have covers): ${progress.skippedComics} comics`)
    console.log(`📊 Total processed: ${progress.processedComics}/${progress.totalComics} comics`)
    console.log(`🌐 API requests made this session: ${progress.requestsThisSession}`)
    
    if (durationHours >= 1) {
      console.log(`⏱️  Total session duration: ${durationHours}h`)
    } else {
      console.log(`⏱️  Total session duration: ${durationMinutes}m`)
    }
    
    if (progress.processedComics < progress.totalComics) {
      const remaining = progress.totalComics - progress.processedComics
      const estimatedHours = Math.ceil(remaining / 200) // 200 per hour
      console.log(`\n💡 ${remaining} comics remaining. Estimated time to complete: ~${estimatedHours}h`)
      console.log('Run the script again in an hour to continue processing.')
    } else {
      console.log('\n🎉 All comics have been processed!')
      
      // Clean up progress file when complete
      try {
        const fs = await import('fs')
        fs.unlinkSync('comic-covers-progress.json')
        console.log('🧹 Cleaned up progress file')
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    
  } catch (error) {
    console.error('💥 Population failed:', error)
    
    // Save progress even on error
    if (typeof error === 'object' && error !== null && 'progress' in error) {
      try {
        await saveProgress(error.progress as ProgressState)
        console.log('💾 Progress saved despite error')
      } catch (saveError) {
        console.error('Failed to save progress:', saveError)
      }
    }
    
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏸️  Received interrupt signal. Saving progress...')
  
  // Try to save current progress
  try {
    const fs = await import('fs')
    if (fs.existsSync('comic-covers-progress.json')) {
      console.log('💾 Progress file exists and will be preserved for resumption')
    }
  } catch (error) {
    console.error('Error checking progress file:', error)
  }
  
  console.log('👋 Shutting down gracefully. Run the script again to resume.')
  process.exit(0)
})

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Run the population script
console.log('🏃 Starting Comic Cover Population Script')
console.log('Press Ctrl+C to stop gracefully and save progress')
populateComicCovers().catch(console.error)