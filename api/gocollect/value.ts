interface GoCollectValueResponse {
  item_id: string;
  title?: string;
  issue_number?: string;
  grade: string;
  fmv_usd?: number;
  fmv_gbp?: number;
  metrics?: {
    day_30?: any;
    day_90?: any;
    day_365?: any;
  };
  error?: string;
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
  // Only allow GET requests
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { item_id, grade } = request.query;

    // Validate required parameters
    if (!item_id) {
      return response.status(400).json({ 
        error: 'Missing required parameter: item_id' 
      });
    }

    // Default grade to 9.4 if not specified
    const gradeValue = grade ? String(grade) : '9.4';

    // GoCollect API configuration
    const API_KEY = process.env.VITE_GOCOLLECT_API_KEY || '7GnRRxsw3JMYnZF9rW8fF7VU8gJVK5q71KKvURNwd2a24cf0';
    const API_BASE_URL = `https://gocollect.com/api/insights/v1/item/${String(item_id)}`;
    
    // Build GoCollect API URL with grade parameter
    const apiUrl = new URL(API_BASE_URL);
    apiUrl.searchParams.set('grade', gradeValue);

    // Make request to GoCollect API
    const goCollectResponse = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'comic-speculator-tool/1.0'
      }
    });

    // Handle non-JSON responses
    const contentType = goCollectResponse.headers.get('content-type');
    let data: any;

    if (contentType && contentType.includes('application/json')) {
      data = await goCollectResponse.json();
    } else {
      // If not JSON, return as text in a structured format
      const textData = await goCollectResponse.text();
      data = { 
        message: textData,
        contentType: contentType || 'unknown'
      };
    }

    // Handle API errors
    if (!goCollectResponse.ok) {
      console.error('GoCollect API error:', {
        status: goCollectResponse.status,
        statusText: goCollectResponse.statusText,
        data
      });

      return response.status(goCollectResponse.status).json({
        error: `GoCollect API error: ${goCollectResponse.status} ${goCollectResponse.statusText}`,
        details: data
      });
    }

    // Extract relevant data and convert USD to GBP (using 0.79 exchange rate)
    const USD_TO_GBP_RATE = 0.79;
    
    const responseData: GoCollectValueResponse = {
      item_id: String(item_id),
      title: data.title || data.name,
      issue_number: data.issue_number || data.issue,
      grade: gradeValue,
      fmv_usd: data.fmv || data.fair_market_value || data.current_value,
      fmv_gbp: data.fmv ? Math.round((data.fmv * USD_TO_GBP_RATE) * 100) / 100 : undefined,
      metrics: {
        day_30: data.metrics?.day_30 || data.price_data?.day_30,
        day_90: data.metrics?.day_90 || data.price_data?.day_90,
        day_365: data.metrics?.day_365 || data.price_data?.day_365
      }
    };

    // If fmv_usd is available, ensure fmv_gbp is calculated
    if (responseData.fmv_usd && !responseData.fmv_gbp) {
      responseData.fmv_gbp = Math.round((responseData.fmv_usd * USD_TO_GBP_RATE) * 100) / 100;
    }

    // Return successful response
    return response.status(200).json({
      success: true,
      ...responseData,
      raw_data: data // Include raw data for debugging/reference
    });

  } catch (error) {
    console.error('Internal server error:', error);
    
    return response.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}