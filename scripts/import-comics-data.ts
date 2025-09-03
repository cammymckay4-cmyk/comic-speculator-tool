import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import Papa from 'papaparse'

// Environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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

interface CSVComicRow {
  title: string
  issue: string
  issue_number: string
  publisher: string
  publish_date: string
  cover_image?: string
  thumbnail_image?: string
  creators?: string
  description?: string
  page_count?: string
  format?: string
  isbn?: string
  upc?: string
  diamond_code?: string
  variant_description?: string
  is_variant?: string
  is_key_issue?: string
  key_issue_reason?: string
  story_arcs?: string
  characters?: string
  teams?: string
  locations?: string
  genres?: string
  tags?: string
  market_value?: string
}

interface ComicInsertData {
  id: string
  title: string
  issue: string
  issue_number: number
  publisher: string
  publish_date: string
  cover_image: string
  thumbnail_image?: string | null
  creators: any[]
  description?: string | null
  page_count?: number | null
  format: string
  isbn?: string | null
  upc?: string | null
  diamond_code?: string | null
  variant_description?: string | null
  is_variant: boolean
  is_key_issue: boolean
  key_issue_reason?: string | null
  story_arcs?: string[] | null
  characters?: string[] | null
  teams?: string[] | null
  locations?: string[] | null
  genres?: string[] | null
  tags?: string[] | null
  prices: any[]
  market_value?: number | null
  last_updated: string
}

function generateId(): string {
  return 'comic_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

function parseStringArray(value: string | undefined): string[] | null {
  if (!value || value.trim() === '') return null
  return value.split(',').map(item => item.trim()).filter(item => item.length > 0)
}

function parseCreators(creatorsString: string | undefined): any[] {
  if (!creatorsString || creatorsString.trim() === '') return []
  
  const creators = creatorsString.split(',').map(creator => {
    const parts = creator.trim().split(':')
    if (parts.length === 2) {
      return {
        name: parts[0].trim(),
        role: parts[1].trim().toLowerCase()
      }
    } else {
      return {
        name: creator.trim(),
        role: 'unknown'
      }
    }
  })
  
  return creators
}

function transformCSVRowToComic(row: CSVComicRow): ComicInsertData {
  const now = new Date().toISOString()
  
  return {
    id: generateId(),
    title: row.title,
    issue: row.issue,
    issue_number: parseInt(row.issue_number) || 0,
    publisher: row.publisher,
    publish_date: row.publish_date,
    cover_image: row.cover_image || '',
    thumbnail_image: row.thumbnail_image || null,
    creators: parseCreators(row.creators),
    description: row.description || null,
    page_count: row.page_count ? parseInt(row.page_count) : null,
    format: row.format || 'single-issue',
    isbn: row.isbn || null,
    upc: row.upc || null,
    diamond_code: row.diamond_code || null,
    variant_description: row.variant_description || null,
    is_variant: row.is_variant?.toLowerCase() === 'true',
    is_key_issue: row.is_key_issue?.toLowerCase() === 'true',
    key_issue_reason: row.key_issue_reason || null,
    story_arcs: parseStringArray(row.story_arcs),
    characters: parseStringArray(row.characters),
    teams: parseStringArray(row.teams),
    locations: parseStringArray(row.locations),
    genres: parseStringArray(row.genres),
    tags: parseStringArray(row.tags),
    prices: [],
    market_value: row.market_value ? parseFloat(row.market_value) : null,
    last_updated: now
  }
}

async function importComics() {
  const csvFilePath = join(process.cwd(), 'comics-data.csv')
  
  try {
    console.log('🚀 Starting comic data import...')
    console.log(`📂 Reading CSV file: ${csvFilePath}`)
    
    // Read and parse CSV file
    const csvContent = readFileSync(csvFilePath, 'utf-8')
    const parseResult = Papa.parse<CSVComicRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().replace(/ /g, '_')
    })
    
    if (parseResult.errors.length > 0) {
      console.error('❌ CSV parsing errors:')
      parseResult.errors.forEach(error => {
        console.error(`  Row ${error.row}: ${error.message}`)
      })
      return
    }
    
    const csvRows = parseResult.data
    console.log(`📊 Found ${csvRows.length} comics in CSV`)
    
    if (csvRows.length === 0) {
      console.log('⚠️  No data found in CSV file')
      return
    }
    
    // Transform CSV rows to comic data
    const comics: ComicInsertData[] = csvRows.map(transformCSVRowToComic)
    
    // Insert comics in batches
    const batchSize = 500
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < comics.length; i += batchSize) {
      const batch = comics.slice(i, i + batchSize)
      const batchNumber = Math.floor(i / batchSize) + 1
      const totalBatches = Math.ceil(comics.length / batchSize)
      
      console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} comics)...`)
      
      try {
        const { data, error } = await supabase
          .from('comics')
          .insert(batch)
          .select('id')
        
        if (error) {
          console.error(`❌ Batch ${batchNumber} failed:`, error.message)
          errorCount += batch.length
        } else {
          console.log(`✅ Batch ${batchNumber} successful: ${data?.length || batch.length} comics inserted`)
          successCount += data?.length || batch.length
        }
      } catch (err) {
        console.error(`❌ Batch ${batchNumber} failed with exception:`, err)
        errorCount += batch.length
      }
    }
    
    console.log('\n📈 Import Summary:')
    console.log(`✅ Successfully imported: ${successCount} comics`)
    console.log(`❌ Failed to import: ${errorCount} comics`)
    console.log(`📊 Total processed: ${successCount + errorCount} comics`)
    
    if (successCount > 0) {
      console.log('\n🎉 Comic data import completed successfully!')
    } else {
      console.log('\n⚠️  No comics were imported. Please check the errors above.')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('💥 Import failed:', error)
    process.exit(1)
  }
}

// Run the import
importComics().catch(console.error)