interface EbayFindingResponse {
  findCompletedItemsResponse: [{
    searchResult: [{
      item?: Array<{
        itemId: string;
        title: string;
        sellingStatus: [{
          convertedCurrentPrice: [{
            '@currencyId': string;
            __value__: string;
          }];
        }];
        condition?: [{
          conditionId: string;
          conditionDisplayName: string;
        }];
        listingInfo: [{
          endTime: string;
        }];
      }>;
      '@count': string;
    }];
    ack: string;
    errorMessage?: [{
      error: Array<{
        errorId: string;
        domain: string;
        severity: string;
        category: string;
        message: string;
      }>;
    }];
  }];
}

interface EbayPriceUpdate {
  comic_id: string;
  ebay_low_price?: number;
  ebay_medium_price?: number;
  ebay_high_price?: number;
  ebay_updated_at: string;
}

interface VercelRequest {
  method?: string;
  query: { [key: string]: string | string[] | undefined };
}

interface VercelResponse {
  status(code: number): VercelResponse;
  json(body: any): void;
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
    if (!comic_id) {
      return response.status(400).json({ 
        error: 'Missing required parameter: comic_id' 
      });
    }

    // Get comic details from database
    const comic = await getComicFromDatabase(String(comic_id));
    if (!comic) {
      return response.status(404).json({ 
        error: 'Comic not found' 
      });
    }

    // Fetch completed eBay listings
    const ebayData = await fetchEbayCompletedItems(comic);
    if (!ebayData || ebayData.length === 0) {
      return response.status(200).json({
        success: true,
        comic_id: String(comic_id),
        message: 'No completed eBay listings found for this comic'
      });
    }

    // Calculate pricing tiers
    const pricingTiers = calculatePricingTiers(ebayData);
    
    // Convert USD to GBP
    const gbpPrices = await convertUsdToGbp(pricingTiers);

    // Update database
    const updateResult = await updateComicPrices(String(comic_id), gbpPrices);
    
    if (!updateResult.success) {
      return response.status(500).json({
        error: 'Failed to update comic prices',
        details: updateResult.error
      });
    }

    return response.status(200).json({
      success: true,
      comic_id: String(comic_id),
      title: comic.title,
      issue: comic.issue,
      prices: gbpPrices,
      total_listings_found: ebayData.length
    });

  } catch (error) {
    console.error('eBay update prices error:', error);
    
    return response.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

// Helper function to get comic from database
async function getComicFromDatabase(comicId: string): Promise<{
  id: string;
  title: string;
  issue: string;
  publisher: string;
} | null> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from('comics')
      .select('id, title, issue, publisher')
      .eq('id', comicId)
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching comic from database:', error);
    return null;
  }
}

// Helper function to fetch completed items from eBay Finding API
async function fetchEbayCompletedItems(comic: {
  title: string;
  issue: string;
}): Promise<Array<{ price: number; endTime: string }> | null> {
  try {
    const EBAY_APP_ID = process.env.EBAY_APP_ID;
    if (!EBAY_APP_ID) {
      throw new Error('eBay API key not configured');
    }

    // Construct search keywords
    const keywords = `${comic.title} ${comic.issue} comic`;
    
    // Build eBay Finding API URL
    const ebayUrl = new URL('https://svcs.ebay.com/services/search/FindingService/v1');
    const params = {
      'OPERATION-NAME': 'findCompletedItems',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': EBAY_APP_ID,
      'RESPONSE-DATA-FORMAT': 'JSON',
      'REST-PAYLOAD': '',
      'keywords': keywords,
      'categoryId': '63', // Collectible Comics
      'sortOrder': 'EndTimeSoonest',
      'itemFilter(0).name': 'Condition',
      'itemFilter(0).value(0)': '3000', // Good
      'itemFilter(0).value(1)': '4000', // Very Good
      'itemFilter(0).value(2)': '5000', // Excellent
      'itemFilter(1).name': 'EndTimeFrom',
      'itemFilter(1).value': getDateNDaysAgo(90), // Last 90 days
      'paginationInput.entriesPerPage': '100'
    };

    // Add parameters to URL
    Object.entries(params).forEach(([key, value]) => {
      ebayUrl.searchParams.set(key, value);
    });

    const response = await fetch(ebayUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'comic-speculator-tool/1.0'
      }
    });

    if (!response.ok) {
      console.error(`eBay API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: EbayFindingResponse = await response.json();
    
    // Check for API errors
    const searchResponse = data.findCompletedItemsResponse[0];
    if (searchResponse.ack !== 'Success') {
      console.error('eBay API returned error:', searchResponse.errorMessage);
      return null;
    }

    const items = searchResponse.searchResult[0].item;
    if (!items || items.length === 0) {
      return [];
    }

    // Extract price and end time data
    return items.map(item => ({
      price: parseFloat(item.sellingStatus[0].convertedCurrentPrice[0].__value__),
      endTime: item.listingInfo[0].endTime
    })).filter(item => !isNaN(item.price) && item.price > 0);

  } catch (error) {
    console.error('Error fetching eBay data:', error);
    return null;
  }
}

// Helper function to calculate pricing tiers (25th, 50th, 75th percentiles)
function calculatePricingTiers(priceData: Array<{ price: number; endTime: string }>): {
  low: number;
  medium: number;
  high: number;
} {
  const prices = priceData.map(item => item.price).sort((a, b) => a - b);
  
  const low = calculatePercentile(prices, 25);
  const medium = calculatePercentile(prices, 50); // median
  const high = calculatePercentile(prices, 75);
  
  return { low, medium, high };
}

// Helper function to calculate percentile
function calculatePercentile(sortedArray: number[], percentile: number): number {
  if (sortedArray.length === 0) return 0;
  
  const index = (percentile / 100) * (sortedArray.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  
  if (lower === upper) {
    return sortedArray[lower];
  }
  
  const weight = index - lower;
  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}

// Helper function to convert USD prices to GBP
async function convertUsdToGbp(usdPrices: {
  low: number;
  medium: number;
  high: number;
}): Promise<{
  low: number;
  medium: number;
  high: number;
}> {
  // For production, you might want to use a real-time exchange rate API
  // For now, using a fixed conversion rate
  const USD_TO_GBP_RATE = 0.79;
  
  return {
    low: Math.round((usdPrices.low * USD_TO_GBP_RATE) * 100) / 100,
    medium: Math.round((usdPrices.medium * USD_TO_GBP_RATE) * 100) / 100,
    high: Math.round((usdPrices.high * USD_TO_GBP_RATE) * 100) / 100
  };
}

// Helper function to update comic prices in database
async function updateComicPrices(
  comicId: string, 
  prices: { low: number; medium: number; high: number }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return { success: false, error: 'Supabase configuration missing' };
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Update comic with eBay prices
    const { error } = await supabase
      .from('comics')
      .update({
        ebay_low_price: prices.low,
        ebay_medium_price: prices.medium,
        ebay_high_price: prices.high,
        ebay_updated_at: new Date().toISOString()
      })
      .eq('id', comicId);
    
    if (error) {
      console.error('Database update error:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating comic prices:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Helper function to get date N days ago in ISO format
function getDateNDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}