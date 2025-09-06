interface EbayFindingItem {
  itemId: [string];
  title: [string];
  sellingStatus: [{
    currentPrice: [{
      __value__: string;
      '@currencyId': string;
    }];
    convertedCurrentPrice: [{
      __value__: string;
      '@currencyId': string;
    }];
  }];
  listingInfo: [{
    endTime: [string];
    listingType: [string];
  }];
  condition?: [{
    conditionDisplayName: [string];
  }];
}

interface EbayFindingResponse {
  findCompletedItemsResponse: [{
    searchResult: [{
      '@count': string;
      item?: EbayFindingItem[];
    }];
    ack: [string];
  }];
}

interface VercelRequest {
  method?: string;
  query: { [key: string]: string | string[] | undefined };
  body?: any;
}

interface VercelResponse {
  status(code: number): VercelResponse;
  json(body: any): void;
}

interface PriceAnalysis {
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  salesCount: number;
  lowTierPrice: number;   // Poor to Good condition
  mediumTierPrice: number; // Fine to Very Fine condition
  highTierPrice: number;   // Near Mint to Mint condition
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
    const { comic_id } = request.body || {};

    // Validate required parameters
    if (!comic_id) {
      return response.status(400).json({ 
        error: 'Missing required parameter: comic_id' 
      });
    }

    const EBAY_API_KEY = process.env.EBAY_API_KEY;
    if (!EBAY_API_KEY) {
      return response.status(500).json({
        error: 'eBay API key not configured',
        message: 'EBAY_API_KEY environment variable is required'
      });
    }

    // Get comic details from database
    const comic = await getComicFromDatabase(comic_id);
    if (!comic) {
      return response.status(404).json({
        error: 'Comic not found',
        message: `No comic found with ID: ${comic_id}`
      });
    }

    // Search eBay for completed/sold listings
    const ebayData = await searchEbaySoldListings(comic, EBAY_API_KEY);
    
    if (!ebayData || ebayData.salesCount === 0) {
      return response.status(200).json({
        success: true,
        message: 'No sales data found on eBay',
        comic_id,
        sales_count: 0
      });
    }

    // Update market values in database
    await updateComicMarketValues(comic_id, ebayData);

    return response.status(200).json({
      success: true,
      comic_id,
      title: comic.title,
      issue: comic.issue,
      sales_data: {
        sales_count: ebayData.salesCount,
        price_range: {
          min: ebayData.minPrice,
          max: ebayData.maxPrice,
          average: ebayData.averagePrice
        },
        tier_prices: {
          low: ebayData.lowTierPrice,
          medium: ebayData.mediumTierPrice,
          high: ebayData.highTierPrice
        }
      },
      updated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('eBay API error:', error);
    
    return response.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

async function getComicFromDatabase(comicId: string) {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase
    .from('comics')
    .select('id, title, issue, publisher')
    .eq('id', comicId)
    .single();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
}

async function searchEbaySoldListings(
  comic: { title: string; issue: string; publisher?: string },
  apiKey: string
): Promise<PriceAnalysis | null> {
  const keywords = `${comic.title} #${comic.issue} comic book`;
  const categoryId = '63'; // Comics category
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const apiUrl = new URL('https://svcs.ebay.com/services/search/FindingService/v1');
  const params = new URLSearchParams({
    'OPERATION-NAME': 'findCompletedItems',
    'SERVICE-VERSION': '1.0.0',
    'SECURITY-APPNAME': apiKey,
    'RESPONSE-DATA-FORMAT': 'JSON',
    'keywords': keywords,
    'categoryId': categoryId,
    'itemFilter(0).name': 'SoldItemsOnly',
    'itemFilter(0).value': 'true',
    'itemFilter(1).name': 'Condition',
    'itemFilter(1).value': 'Used',
    'itemFilter(2).name': 'ListingType',
    'itemFilter(2).value': 'All',
    'itemFilter(3).name': 'EndTimeFrom',
    'itemFilter(3).value': ninetyDaysAgo,
    'paginationInput.entriesPerPage': '100'
  });

  apiUrl.search = params.toString();

  const response = await fetch(apiUrl.toString(), {
    method: 'GET',
    headers: {
      'User-Agent': 'comic-speculator-tool/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`eBay API error: ${response.status} ${response.statusText}`);
  }

  const data: EbayFindingResponse = await response.json();
  const searchResult = data.findCompletedItemsResponse?.[0]?.searchResult?.[0];
  
  if (!searchResult || !searchResult.item || searchResult.item.length === 0) {
    return null;
  }

  return analyzePrices(searchResult.item);
}

function analyzePrices(items: EbayFindingItem[]): PriceAnalysis {
  const prices: number[] = [];
  const conditionPrices: { [key: string]: number[] } = {
    poor: [],
    fair: [],
    good: [],
    veryGood: [],
    fine: [],
    veryFine: [],
    nearMint: [],
    mint: []
  };

  for (const item of items) {
    const priceValue = item.sellingStatus?.[0]?.convertedCurrentPrice?.[0]?.__value__ || 
                     item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__;
    
    if (!priceValue) continue;

    const price = parseFloat(priceValue);
    if (isNaN(price) || price <= 0) continue;

    prices.push(price);

    // Categorize by condition
    const conditionName = item.condition?.[0]?.conditionDisplayName?.[0]?.toLowerCase() || '';
    
    if (conditionName.includes('mint') && !conditionName.includes('near')) {
      conditionPrices.mint.push(price);
    } else if (conditionName.includes('near mint')) {
      conditionPrices.nearMint.push(price);
    } else if (conditionName.includes('very fine')) {
      conditionPrices.veryFine.push(price);
    } else if (conditionName.includes('fine')) {
      conditionPrices.fine.push(price);
    } else if (conditionName.includes('very good')) {
      conditionPrices.veryGood.push(price);
    } else if (conditionName.includes('good')) {
      conditionPrices.good.push(price);
    } else if (conditionName.includes('fair')) {
      conditionPrices.fair.push(price);
    } else {
      conditionPrices.good.push(price); // Default to good condition
    }
  }

  if (prices.length === 0) {
    return {
      averagePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      salesCount: 0,
      lowTierPrice: 0,
      mediumTierPrice: 0,
      highTierPrice: 0
    };
  }

  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Calculate tier prices based on condition groupings
  const lowTierPrices = [
    ...conditionPrices.poor,
    ...conditionPrices.fair,
    ...conditionPrices.good
  ];
  const mediumTierPrices = [
    ...conditionPrices.veryGood,
    ...conditionPrices.fine,
    ...conditionPrices.veryFine
  ];
  const highTierPrices = [
    ...conditionPrices.nearMint,
    ...conditionPrices.mint
  ];

  const calculateTierPrice = (tierPrices: number[], fallbackPrices: number[]): number => {
    const validPrices = tierPrices.length > 0 ? tierPrices : fallbackPrices;
    if (validPrices.length === 0) return averagePrice;
    
    return validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length;
  };

  return {
    averagePrice: Math.round(averagePrice * 100) / 100,
    minPrice: Math.round(minPrice * 100) / 100,
    maxPrice: Math.round(maxPrice * 100) / 100,
    salesCount: prices.length,
    lowTierPrice: Math.round(calculateTierPrice(lowTierPrices, prices) * 0.7 * 100) / 100,
    mediumTierPrice: Math.round(calculateTierPrice(mediumTierPrices, prices) * 100) / 100,
    highTierPrice: Math.round(calculateTierPrice(highTierPrices, prices) * 1.3 * 100) / 100
  };
}

async function updateComicMarketValues(comicId: string, priceData: PriceAnalysis): Promise<void> {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { error } = await supabase
    .from('comics')
    .update({
      market_value_low: priceData.lowTierPrice,
      market_value_medium: priceData.mediumTierPrice,
      market_value_high: priceData.highTierPrice,
      market_value_updated_at: new Date().toISOString()
    })
    .eq('id', comicId);

  if (error) {
    throw new Error(`Failed to update market values: ${error.message}`);
  }
}