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
  try {
    // Only allow POST requests
    if (request.method !== 'POST') {
      return response.status(405).json({ 
        error: 'Method Not Allowed',
        message: 'Only POST requests are allowed' 
      });
    }

    // Check for authentication key
    const { key } = request.query;
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret) {
      console.error('ADMIN_SECRET environment variable not set');
      return response.status(500).json({
        error: 'Server Configuration Error',
        message: 'Admin authentication not configured'
      });
    }

    if (!key || key !== adminSecret) {
      return response.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing admin key'
      });
    }

    // Run the eBay population script
    console.log('🚀 Starting eBay price population script...');
    
    // Since the script runs immediately on import, we need to spawn it as a separate process
    // to avoid blocking the API response and to handle the script's process.exit calls
    const { spawn } = await import('child_process');
    
    // Use npm run command to execute the script
    const child = spawn('npm', ['run', 'populate:ebay-prices'], {
      detached: true,
      stdio: 'ignore',
      env: { ...process.env },
      cwd: process.cwd()
    });
    
    child.unref(); // Allow parent process to exit independently

    // Return success response immediately
    return response.status(200).json({
      success: true,
      message: 'eBay price population started successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API endpoint error:', error);
    
    return response.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}