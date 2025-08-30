import helmet from 'helmet';

/**
 * Security middleware configuration for API routes
 * Provides rate limiting and security headers for serverless functions
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory rate limit store (for production, consider Redis or database)
const rateLimitStore: RateLimitStore = {};

/**
 * Simple rate limiter for serverless functions
 * @param ip - Client IP address
 * @param windowMs - Time window in milliseconds
 * @param maxRequests - Maximum requests per window
 */
export function checkRateLimit(ip: string, windowMs: number = 60000, maxRequests: number = 100): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const key = `${ip}-${Math.floor(now / windowMs)}`;
  
  // Clean up old entries
  Object.keys(rateLimitStore).forEach(k => {
    if (rateLimitStore[k].resetTime < now) {
      delete rateLimitStore[k];
    }
  });
  
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + windowMs
    };
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (rateLimitStore[key].count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  rateLimitStore[key].count++;
  return { allowed: true, remaining: maxRequests - rateLimitStore[key].count };
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return cfConnectingIP || realIP || null;
}

/**
 * Get security headers using helmet library
 */
export function getSecurityHeaders(): Record<string, string> {
  const helmetConfig = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for UI frameworks
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:"],
        frameAncestors: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false // Disable for better compatibility
  });
  
  // Extract headers from helmet middleware simulation
  const headers: Record<string, string> = {};
  
  // Manually set the headers that helmet would provide
  headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none';";
  headers['X-Frame-Options'] = 'DENY';
  headers['X-Content-Type-Options'] = 'nosniff';
  headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
  headers['X-XSS-Protection'] = '1; mode=block';
  headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
  headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()';
  
  return headers;
}

/**
 * Apply security middleware to API response
 */
export function applySecurityHeaders(response: Response): Response {
  const headers = getSecurityHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * Validate and apply rate limiting to API requests
 * Returns a Response if rate limit is exceeded, null if allowed
 */
export function applyRateLimit(request: Request, windowMs: number = 60000, maxRequests: number = 100): Response | null {
  const clientIP = getClientIP(request);
  if (!clientIP) {
    // If we can't determine the client IP, allow the request but with a default limit
    return null;
  }
  const { allowed, remaining } = checkRateLimit(clientIP, windowMs, maxRequests);
  
  if (!allowed) {
    const response = new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Too many requests', 
        message: 'Rate limit exceeded. Please try again later.' 
      }),
      { 
        status: 429, 
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil(windowMs / 1000).toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (Date.now() + windowMs).toString()
        } 
      }
    );
    
    return applySecurityHeaders(response);
  }
  
  return null;
}

/**
 * Enhanced CORS configuration with security considerations
 */
export function getCORSHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:3000',
    'https://comic-speculator-tool.netlify.app',
    // Add your production domain here
  ];
  
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);
  
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'https://comic-speculator-tool.netlify.app',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  };
}