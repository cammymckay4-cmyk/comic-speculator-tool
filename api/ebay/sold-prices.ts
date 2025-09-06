interface EbaySoldPricesRequest {
  title: string;
  issue?: string;
}

interface EbaySoldPricesResponse {
  success: boolean;
  comic: {
    title: string;
    issue?: string;
    searchQuery: string;
  };
  pricing: {
    average_sold_price_usd: number;
    average_sold_price_gbp: number;
    total_sold_listings: number;
    date_range: string;
  };
  market_values: {
    low: number;    // Conservative estimate (75% of average)
    medium: number; // Average sold price
    high: number;   // Premium estimate (125% of average)
  };
  updated_in_database?: boolean;
  error?: string;
}

interface EbayFindingApiResponse {
  findCompletedItemsResponse: [{
    searchResult: [{
      item?: Array<{
        title: string[];
        sellingStatus: [{
          currentPrice: [{
            __value__: string;
            '@currencyId': string;
          }];
        }];
        listingInfo: [{
          endTime: string[];
        }];
      }>;
    }];
    ack: string[];
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

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
): Promise<void> {
  // Only allow GET and POST requests
  if (request.method !== 'GET' && request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let title: string;
    let issue: string | undefined;

    // Handle both GET query params and POST body
    if (request.method === 'GET') {
      const { title: titleParam, issue: issueParam } = request.query;
      
      if (!titleParam) {
        return response.status(400).json({ 
          error: 'Missing required parameter: title' 
        });
      }
      
      title = String(titleParam);
      issue = issueParam ? String(issueParam) : undefined;
    } else {
      // POST request
      const { title: titleBody, issue: issueBody } = request.body as EbaySoldPricesRequest;
      
      if (!titleBody) {
        return response.status(400).json({
          error: 'Missing required field: title'
        });
      }
      
      title = titleBody;
      issue = issueBody;
    }

    // Build search query - "[comic title] [issue number] comic"
    let searchQuery = title.trim();
    if (issue) {
      searchQuery += ` ${issue.trim()}`;
    }
    searchQuery += ' comic';

    // eBay Finding API configuration
    const EBAY_APP_ID = process.env.EBAY_APP_ID;
    if (!EBAY_APP_ID) {
      return response.status(500).json({
        error: 'eBay API key not configured',
        message: 'EBAY_APP_ID environment variable is required'
      });
    }

    // Fetch sold listings from eBay
    const soldListings = await fetchEbaySoldListings(searchQuery, EBAY_APP_ID);
    
    if (soldListings.length === 0) {
      return response.status(404).json({
        error: 'No sold listings found',
        message: `No sold comic listings found for "${searchQuery}" in the last 90 days`
      });
    }

    // Calculate pricing metrics
    const pricingMetrics = calculatePricingMetrics(soldListings);
    
    // Update database if title and pricing data are available
    let updatedInDatabase = false;
    if (title && pricingMetrics.average_sold_price_gbp > 0) {
      try {
        updatedInDatabase = await updateMarketValueInDatabase(
          title, 
          issue, 
          pricingMetrics.market_values
        );
      } catch (dbError) {
        console.error('Failed to update database:', dbError);
        // Continue with response even if database update fails
      }
    }

    // Return successful response
    const responseData: EbaySoldPricesResponse = {
      success: true,
      comic: {
        title,
        issue,
        searchQuery
      },
      pricing: {
        average_sold_price_usd: pricingMetrics.average_sold_price_usd,
        average_sold_price_gbp: pricingMetrics.average_sold_price_gbp,
        total_sold_listings: soldListings.length,
        date_range: 'Last 90 days'
      },
      market_values: pricingMetrics.market_values,
      updated_in_database: updatedInDatabase
    };

    return response.status(200).json(responseData);

  } catch (error) {
    console.error('Internal server error:', error);
    
    return response.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

// Helper function to fetch sold listings from eBay Finding API
async function fetchEbaySoldListings(searchQuery: string, appId: string): Promise<Array<{
  price_usd: number;
  title: string;
  end_time: string;
}>> {
  const EBAY_FINDING_API_URL = 'https://svcs.ebay.com/services/search/FindingService/v1';
  
  // Calculate date 90 days ago
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const fromDate = ninetyDaysAgo.toISOString();

  // Build eBay Finding API request
  const apiUrl = new URL(EBAY_FINDING_API_URL);
  apiUrl.searchParams.set('OPERATION-NAME', 'findCompletedItems');
  apiUrl.searchParams.set('SERVICE-VERSION', '1.0.0');
  apiUrl.searchParams.set('SECURITY-APPNAME', appId);
  apiUrl.searchParams.set('RESPONSE-DATA-FORMAT', 'JSON');
  apiUrl.searchParams.set('REST-PAYLOAD', '');
  apiUrl.searchParams.set('keywords', searchQuery);
  apiUrl.searchParams.set('categoryId', '259104'); // Comics category
  apiUrl.searchParams.set('itemFilter(0).name', 'SoldItemsOnly');
  apiUrl.searchParams.set('itemFilter(0).value', 'true');
  apiUrl.searchParams.set('itemFilter(1).name', 'EndTimeFrom');
  apiUrl.searchParams.set('itemFilter(1).value', fromDate);
  apiUrl.searchParams.set('paginationInput.entriesPerPage', '100');
  apiUrl.searchParams.set('sortOrder', 'EndTimeSoonest');

  // Make request to eBay Finding API
  const ebayResponse = await fetch(apiUrl.toString(), {
    method: 'GET',
    headers: {
      'User-Agent': 'comic-speculator-tool/1.0',
      'Accept': 'application/json'
    }
  });

  if (!ebayResponse.ok) {
    throw new Error(`eBay API error: ${ebayResponse.status} ${ebayResponse.statusText}`);
  }

  const data: EbayFindingApiResponse = await ebayResponse.json();
  
  // Check for API errors
  const ack = data.findCompletedItemsResponse?.[0]?.ack?.[0];
  if (ack !== 'Success') {
    throw new Error(`eBay Finding API returned: ${ack}`);
  }

  // Extract sold listings
  const items = data.findCompletedItemsResponse?.[0]?.searchResult?.[0]?.item || [];
  
  const soldListings = items
    .filter(item => {
      // Ensure item has required fields and price is in USD
      const price = item.sellingStatus?.[0]?.currentPrice?.[0];
      return price && price['@currencyId'] === 'USD' && parseFloat(price.__value__) > 0;
    })
    .map(item => {
      const priceInfo = item.sellingStatus[0].currentPrice[0];
      return {
        price_usd: parseFloat(priceInfo.__value__),
        title: item.title[0],
        end_time: item.listingInfo[0].endTime[0]
      };
    });

  return soldListings;
}

// Helper function to calculate pricing metrics
function calculatePricingMetrics(soldListings: Array<{ price_usd: number; title: string; end_time: string }>) {
  const USD_TO_GBP_RATE = 0.79; // Same rate used in GoCollect integration
  
  // Calculate average price in USD
  const totalPriceUsd = soldListings.reduce((sum, listing) => sum + listing.price_usd, 0);
  const averagePriceUsd = totalPriceUsd / soldListings.length;
  
  // Convert to GBP
  const averagePriceGbp = Math.round((averagePriceUsd * USD_TO_GBP_RATE) * 100) / 100;
  
  // Calculate tiered market values (low, medium, high)
  const marketValues = {
    low: Math.round((averagePriceGbp * 0.75) * 100) / 100,    // 75% of average (conservative)
    medium: averagePriceGbp,                                   // Average price
    high: Math.round((averagePriceGbp * 1.25) * 100) / 100   // 125% of average (premium)
  };

  return {
    average_sold_price_usd: Math.round(averagePriceUsd * 100) / 100,
    average_sold_price_gbp: averagePriceGbp,
    market_values: marketValues
  };
}

// Helper function to update market value in database
async function updateMarketValueInDatabase(
  title: string, 
  issue: string | undefined, 
  marketValues: { low: number; medium: number; high: number }
): Promise<boolean> {
  try {
    // Import Supabase client - Note: This is a server environment, so we need to use a different approach
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration for database update');
      return false;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build query to find the comic
    let query = supabase
      .from('comics')
      .select('id')
      .eq('title', title);

    // Add issue filter if provided
    if (issue) {
      query = query.eq('issue_number', issue);
    }

    const { data: comics, error: selectError } = await query;

    if (selectError) {
      console.error('Database select error:', selectError);
      return false;
    }

    if (!comics || comics.length === 0) {
      console.log(`No comic found for title: "${title}"${issue ? ` issue: "${issue}"` : ''}`);
      return false;
    }

    // Update market values for all matching comics
    const comicIds = comics.map(comic => comic.id);
    
    const { error: updateError } = await supabase
      .from('comics')
      .update({
        market_value_low: marketValues.low,
        market_value_medium: marketValues.medium,
        market_value_high: marketValues.high,
        market_value_updated_at: new Date().toISOString()
      })
      .in('id', comicIds);

    if (updateError) {
      console.error('Database update error:', updateError);
      return false;
    }

    console.log(`Updated market values for ${comicIds.length} comics matching "${title}"${issue ? ` issue "${issue}"` : ''}`);
    return true;

  } catch (error) {
    console.error('Error updating database:', error);
    return false;
  }
}