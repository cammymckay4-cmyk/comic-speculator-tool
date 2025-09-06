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

    // Kill any running populate-market-values processes
    console.log('🛑 Attempting to stop market value population processes...');
    
    const { execSync } = await import('child_process');
    
    let killedCount = 0;
    let errorMessage = '';

    try {
      // Find and kill npm run populate:market-values processes
      const findProcessCommand = process.platform === 'win32' 
        ? 'tasklist /FI "IMAGENAME eq node.exe" /FO CSV | findstr "populate:market-values"'
        : 'pgrep -f "populate:market-values" || echo "No processes found"';
      
      const killCommand = process.platform === 'win32'
        ? 'taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq populate:market-values*"'
        : 'pkill -f "populate:market-values"';

      // First, try to find processes
      const processOutput = execSync(findProcessCommand, { encoding: 'utf8', timeout: 5000 });
      
      if (processOutput && processOutput.trim() && !processOutput.includes('No processes found')) {
        // Kill the processes
        execSync(killCommand, { encoding: 'utf8', timeout: 5000 });
        killedCount = 1; // Assume at least one process was killed
        console.log('✅ Successfully stopped market value population processes');
      } else {
        console.log('ℹ️ No active populate:market-values processes found');
      }

      // Also try to kill any node processes running the populate script directly
      try {
        const nodeKillCommand = process.platform === 'win32'
          ? 'taskkill /F /IM "node.exe" /FI "COMMANDLINE eq *populate-market-values*"'
          : 'pkill -f "scripts/populate-market-values"';
        
        execSync(nodeKillCommand, { encoding: 'utf8', timeout: 5000 });
      } catch (nodeKillError) {
        // This is expected if no additional processes are found
        console.log('ℹ️ No additional node processes found for population script');
      }

    } catch (error) {
      console.error('⚠️ Error while stopping processes:', error);
      errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      // Don't return error here, as the lack of processes might be normal
    }

    // Return success response
    return response.status(200).json({
      success: true,
      message: killedCount > 0 
        ? `Successfully stopped ${killedCount} market value population process(es)` 
        : 'No active population processes found to stop',
      killedProcesses: killedCount,
      timestamp: new Date().toISOString(),
      ...(errorMessage && { warning: errorMessage })
    });

  } catch (error) {
    console.error('❌ API endpoint error:', error);
    
    return response.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
}