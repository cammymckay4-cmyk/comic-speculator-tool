import { createClient } from '@supabase/supabase-js'

interface VercelRequest {
  method?: string;
  query: { [key: string]: string | string[] | undefined };
}

interface VercelResponse {
  status(code: number): VercelResponse;
  json(body: any): void;
}

interface ComicVineSearchResponse {
  error: string;
  limit: number;
  offset: number;
  number_of_page_results: number;
  number_of_total_results: number;
  status_code: number;
  results?: Array<{
    id: number;
    name: string;
    issue_number: string;
    volume: {
      name: string;
      id: number;
    };
    image?: {
      icon_url: string;
      medium_url: string;
      screen_url: string;
      screen_large_url: string;
      small_url: string;
      super_url: string;
      thumb_url: string;
      tiny_url: string;
      original_url: string;
    };
    cover_date: string;
    description: string;
  }>;
}

interface Comic {
  id: string;
  title: string;
  issue: string;
  publisher: string;
  cover_image?: string;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
): Promise<void> {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { comic_id } = request.query;

    // Validate required parameters
    if (!comic_id || typeof comic_id !== 'string') {
      return response.status(400).json({ 
        error: 'Missing required parameter: comic_id' 
      });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return response.status(500).json({
        error: 'Supabase configuration missing',
        message: 'VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // ComicVine API configuration
    const API_KEY = process.env.COMICVINE_API_KEY;
    if (!API_KEY) {
      return response.status(500).json({
        error: 'ComicVine API key not configured',
        message: 'COMICVINE_API_KEY environment variable is required'
      });
    }

    // Step 1: Get comic details from database
    const { data: comic, error: fetchError } = await supabase
      .from('comics')
      .select('id, title, issue, publisher, cover_image')
      .eq('id', comic_id)
      .single();

    if (fetchError || !comic) {
      return response.status(404).json({
        error: 'Comic not found',
        message: `No comic found with ID: ${comic_id}`
      });
    }

    // Check if comic already has a cover image
    if (comic.cover_image && comic.cover_image.trim() !== '') {
      return response.status(200).json({
        success: true,
        message: 'Comic already has cover image',
        cover_url: comic.cover_image
      });
    }

    // Step 2: Search ComicVine API for matching comic
    const searchQuery = `${comic.title} ${comic.issue}`.trim();
    console.log(`🔍 Searching ComicVine for: "${searchQuery}"`);
    
    const comicVineSearchUrl = new URL('https://comicvine.gamespot.com/api/issues/');
    comicVineSearchUrl.searchParams.set('api_key', API_KEY);
    comicVineSearchUrl.searchParams.set('format', 'json');
    comicVineSearchUrl.searchParams.set('filter', `name:${comic.title}`);
    comicVineSearchUrl.searchParams.set('field_list', 'id,name,issue_number,volume,image,cover_date,description');
    comicVineSearchUrl.searchParams.set('limit', '20');

    const searchResponse = await fetch(comicVineSearchUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'comic-speculator-tool/1.0'
      }
    });

    if (!searchResponse.ok) {
      console.error('ComicVine search failed:', {
        status: searchResponse.status,
        statusText: searchResponse.statusText
      });
      return response.status(searchResponse.status).json({
        error: `ComicVine API error: ${searchResponse.status} ${searchResponse.statusText}`
      });
    }

    const searchData: ComicVineSearchResponse = await searchResponse.json() as ComicVineSearchResponse;

    if (searchData.status_code !== 1 || !searchData.results || searchData.results.length === 0) {
      console.log('❌ No ComicVine search results found');
      return response.status(404).json({
        error: 'No matching comic found in ComicVine',
        message: `No results found for "${searchQuery}"`
      });
    }

    // Step 3: Find the best match
    let bestMatch = searchData.results[0]; // Default to first result
    
    for (const result of searchData.results) {
      // Check for exact issue match
      const issueMatch = result.issue_number === comic.issue || 
                        result.issue_number === `#${comic.issue}` ||
                        comic.issue.includes(result.issue_number || '');
      
      // Check for title similarity in volume name
      const titleMatch = result.volume?.name?.toLowerCase().includes(comic.title.toLowerCase()) ||
                        comic.title.toLowerCase().includes(result.volume?.name?.toLowerCase() || '');
      
      if (issueMatch && titleMatch) {
        bestMatch = result;
        break;
      }
    }

    if (!bestMatch.image?.medium_url) {
      console.log('❌ Best match has no cover image');
      return response.status(404).json({
        error: 'No cover image available',
        message: 'Found matching comic but no cover image available'
      });
    }

    console.log(`✅ Found match: ${bestMatch.volume?.name} #${bestMatch.issue_number}`);

    // Step 4: Download the cover image (medium size)
    const imageUrl = bestMatch.image.medium_url;
    console.log(`📥 Downloading image from: ${imageUrl}`);

    const imageResponse = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'comic-speculator-tool/1.0'
      }
    });

    if (!imageResponse.ok) {
      console.error('Image download failed:', {
        status: imageResponse.status,
        statusText: imageResponse.statusText
      });
      return response.status(500).json({
        error: 'Failed to download cover image',
        message: `Image download failed: ${imageResponse.status} ${imageResponse.statusText}`
      });
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    // Validate image size (should be around 200KB as requested)
    if (imageBuffer.length > 1024 * 1024) { // 1MB limit for safety
      return response.status(400).json({
        error: 'Image too large',
        message: `Image size (${Math.round(imageBuffer.length / 1024)}KB) exceeds maximum allowed size`
      });
    }

    console.log(`✅ Downloaded image (${Math.round(imageBuffer.length / 1024)}KB)`);

    // Step 5: Upload to Supabase storage in 'comic-covers' bucket
    const fileName = `${comic_id}-${Date.now()}.${contentType.split('/')[1] || 'jpg'}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('comic-covers')
      .upload(fileName, imageBuffer, {
        contentType,
        cacheControl: '31536000', // Cache for 1 year
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload failed:', uploadError);
      return response.status(500).json({
        error: 'Failed to upload image to storage',
        message: uploadError.message
      });
    }

    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('comic-covers')
      .getPublicUrl(fileName);

    console.log(`✅ Uploaded to storage: ${publicUrl}`);

    // Step 6: Update comic.cover_image_url in database
    const { error: updateError } = await supabase
      .from('comics')
      .update({ 
        cover_image: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', comic_id);

    if (updateError) {
      console.error('Database update failed:', updateError);
      // Try to clean up uploaded file
      try {
        await supabase.storage.from('comic-covers').remove([fileName]);
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file:', cleanupError);
      }
      
      return response.status(500).json({
        error: 'Failed to update database',
        message: updateError.message
      });
    }

    console.log(`✅ Updated database for comic ${comic_id}`);

    // Step 7: Return success status
    return response.status(200).json({
      success: true,
      comic_id,
      cover_url: publicUrl,
      comicvine_match: {
        id: bestMatch.id,
        name: bestMatch.volume?.name,
        issue_number: bestMatch.issue_number,
        cover_date: bestMatch.cover_date
      },
      image_info: {
        size_kb: Math.round(imageBuffer.length / 1024),
        content_type: contentType,
        filename: fileName
      }
    });

  } catch (error) {
    console.error('Internal server error:', error);
    
    return response.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}