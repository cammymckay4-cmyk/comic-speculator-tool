interface GoCollectSingleValueResponse {
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

interface GoCollectTieredValueResponse {
  item_id: string;
  title?: string;
  issue_number?: string;
  low_value?: number;    // Grade 6.0 FMV in GBP
  medium_value?: number; // Grade 8.0 FMV in GBP
  high_value?: number;   // Grade 9.4 FMV in GBP
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

    // If grade is provided, return single value. If not, return three tiers.
    if (grade) {
      return await handleSingleGradeRequest(item_id, String(grade), response);
    } else {
      return await handleTieredGradeRequest(item_id, response);
    }

  } catch (error) {
    console.error('Internal server error:', error);
    
    return response.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

// Helper function to handle single grade requests
async function handleSingleGradeRequest(
  item_id: string | string[] | undefined, 
  grade: string, 
  response: VercelResponse
): Promise<void> {
  const API_KEY = process.env.VITE_GOCOLLECT_API_KEY;
  if (!API_KEY) {
    return response.status(500).json({
      error: 'GoCollect API key not configured',
      message: 'VITE_GOCOLLECT_API_KEY environment variable is required'
    });
  }
  const USD_TO_GBP_RATE = 0.79;

  try {
    const data = await fetchGoCollectData(String(item_id), grade, API_KEY);
    
    const responseData: GoCollectSingleValueResponse = {
      item_id: String(item_id),
      title: data.title || data.name,
      issue_number: data.issue_number || data.issue,
      grade: grade,
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

    return response.status(200).json({
      success: true,
      ...responseData,
      raw_data: data
    });
  } catch (error: any) {
    return response.status(error.status || 500).json({
      error: error.message || 'Failed to fetch single grade data',
      details: error.details
    });
  }
}

// Helper function to handle tiered grade requests (6.0, 8.0, 9.4)
async function handleTieredGradeRequest(
  item_id: string | string[] | undefined,
  response: VercelResponse
): Promise<void> {
  const API_KEY = process.env.VITE_GOCOLLECT_API_KEY;
  if (!API_KEY) {
    return response.status(500).json({
      error: 'GoCollect API key not configured',
      message: 'VITE_GOCOLLECT_API_KEY environment variable is required'
    });
  }
  const USD_TO_GBP_RATE = 0.79;
  const GRADES = ['6.0', '8.0', '9.4'];

  try {
    // Make three parallel API calls
    const promises = GRADES.map(grade => 
      fetchGoCollectData(String(item_id), grade, API_KEY)
        .catch(error => ({ error: error.message, grade }))
    );

    const results = await Promise.all(promises);

    // Extract title and issue_number from the first successful result
    const firstValidResult = results.find(result => !result.error);
    const title = firstValidResult?.title || firstValidResult?.name;
    const issue_number = firstValidResult?.issue_number || firstValidResult?.issue;

    // Convert USD values to GBP for each grade
    const responseData: GoCollectTieredValueResponse = {
      item_id: String(item_id),
      title,
      issue_number,
      low_value: undefined,    // Grade 6.0
      medium_value: undefined, // Grade 8.0  
      high_value: undefined    // Grade 9.4
    };

    // Process results for each grade
    results.forEach((result, index) => {
      if (!result.error) {
        const fmv_usd = result.fmv || result.fair_market_value || result.current_value;
        const fmv_gbp = fmv_usd ? Math.round((fmv_usd * USD_TO_GBP_RATE) * 100) / 100 : undefined;
        
        if (index === 0) responseData.low_value = fmv_gbp;      // Grade 6.0
        else if (index === 1) responseData.medium_value = fmv_gbp; // Grade 8.0
        else if (index === 2) responseData.high_value = fmv_gbp;   // Grade 9.4
      }
    });

    return response.status(200).json({
      success: true,
      ...responseData
    });
  } catch (error: any) {
    return response.status(500).json({
      error: 'Failed to fetch tiered grade data',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

// Helper function to fetch data from GoCollect API
async function fetchGoCollectData(item_id: string, grade: string, apiKey: string): Promise<any> {
  const API_BASE_URL = `https://gocollect.com/api/insights/v1/item/${item_id}`;
  
  // Build GoCollect API URL with grade parameter
  const apiUrl = new URL(API_BASE_URL);
  apiUrl.searchParams.set('grade', grade);

  // Make request to GoCollect API
  const goCollectResponse = await fetch(apiUrl.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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

    throw {
      status: goCollectResponse.status,
      message: `GoCollect API error: ${goCollectResponse.status} ${goCollectResponse.statusText}`,
      details: data
    };
  }

  return data;
}