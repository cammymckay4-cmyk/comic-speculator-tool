interface GoCollectSearchResponse {
  results?: any[];
  error?: string;
  total?: number;
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
    const { title, issue } = request.query;

    // Validate required parameters
    if (!title) {
      return response.status(400).json({ 
        error: 'Missing required parameter: title' 
      });
    }

    // Build search query - combine title and issue if provided
    let searchQuery = String(title);
    if (issue) {
      searchQuery += ` ${String(issue)}`;
    }

    // GoCollect API configuration
    const API_KEY = process.env.GOCOLLECT_API_KEY;
    if (!API_KEY) {
      return response.status(500).json({
        error: 'GoCollect API key not configured',
        message: 'GOCOLLECT_API_KEY environment variable is required'
      });
    }
    const API_BASE_URL = 'https://gocollect.com/api/collectibles/v1/item/search';
    
    // Build GoCollect API URL with query parameters
    const apiUrl = new URL(API_BASE_URL);
    apiUrl.searchParams.set('query', searchQuery);
    apiUrl.searchParams.set('cam', 'Comics');

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

    // Return successful response
    return response.status(200).json({
      success: true,
      query: {
        title: String(title),
        issue: issue ? String(issue) : undefined,
        searchQuery
      },
      data
    });

  } catch (error) {
    console.error('Internal server error:', error);
    
    return response.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}