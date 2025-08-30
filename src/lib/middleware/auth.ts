import { supabase } from '../supabaseClient';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

/**
 * Standardized authentication result interface
 */
export interface AuthResult {
  user: any | null;
  error?: string;
}

/**
 * Standardized API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    timestamp: string;
    [key: string]: any;
  };
}

/**
 * Error codes for consistent error handling
 */
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INVALID_INPUT = 'INVALID_INPUT'
}

/**
 * Enhanced JWT token validation with improved security
 */
export async function validateAuthToken(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { 
      user: null, 
      error: 'Authorization header with Bearer token required' 
    };
  }

  const token = authHeader.substring(7).trim();
  
  // Basic token format validation
  if (!token || token.length < 10) {
    return { 
      user: null, 
      error: 'Invalid token format' 
    };
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('Token validation error:', error.message);
      return { 
        user: null, 
        error: 'Invalid or expired token' 
      };
    }
    
    if (!user) {
      return { 
        user: null, 
        error: 'User not found or token invalid' 
      };
    }

    // Additional user validation - ensure user is active
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, is_active, email_verified')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return { 
        user: null, 
        error: 'User profile not found' 
      };
    }

    if (!userProfile.is_active) {
      return { 
        user: null, 
        error: 'User account is deactivated' 
      };
    }
    
    return { user: { ...user, ...userProfile } };
    
  } catch (error) {
    console.error('Auth validation error:', error);
    return { 
      user: null, 
      error: 'Token validation failed' 
    };
  }
}

/**
 * Enhanced UUID validation with strict format checking
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitize and validate string input
 */
export function sanitizeString(input: string, maxLength: number = 500): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  // Remove potentially dangerous characters and trim
  const sanitized = input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
    
  if (sanitized.length > maxLength) {
    throw new Error(`Input too long. Maximum ${maxLength} characters allowed`);
  }
  
  return sanitized;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
}

/**
 * Enhanced CORS configuration with environment-based origins
 */
export function getCorsHeaders(): Record<string, string> {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigins.includes('*') ? '*' : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Security headers for all responses
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  errorCode: ErrorCode,
  message: string,
  statusCode: number,
  details?: any
): Response {
  const response: ApiResponse = {
    success: false,
    error: errorCode,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      ...(details && { details })
    }
  };

  return new Response(
    JSON.stringify(response),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        ...getSecurityHeaders(),
      }
    }
  );
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200,
  meta?: any
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };

  return new Response(
    JSON.stringify(response),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': statusCode === 200 ? 'no-cache, max-age=300' : 'no-cache',
        ...getSecurityHeaders(),
      }
    }
  );
}

/**
 * Request rate limiting configuration
 */
export function createRateLimiter(windowMs: number = 15 * 60 * 1000, max: number = 100) {
  return rateLimit({
    windowMs, // 15 minutes default
    max, // limit each IP to max requests per windowMs
    message: {
      success: false,
      error: ErrorCode.RATE_LIMITED,
      message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

/**
 * Validate pagination parameters
 */
export function validatePagination(limit?: string, offset?: string): { limit: number; offset: number } {
  const parsedLimit = limit ? parseInt(limit, 10) : 50;
  const parsedOffset = offset ? parseInt(offset, 10) : 0;

  if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    throw new Error('Invalid limit parameter. Must be between 1 and 100');
  }

  if (isNaN(parsedOffset) || parsedOffset < 0) {
    throw new Error('Invalid offset parameter. Must be non-negative');
  }

  return { limit: parsedLimit, offset: parsedOffset };
}

/**
 * Input validation for numeric values
 */
export function validateNumericRange(
  value: any,
  min: number,
  max: number,
  fieldName: string
): number {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  
  if (num < min || num > max) {
    throw new Error(`${fieldName} must be between ${min} and ${max}`);
  }
  
  return num;
}

/**
 * Middleware wrapper for consistent request handling
 */
export async function withMiddleware(
  request: Request,
  handler: (request: Request, user?: any) => Promise<Response>,
  requireAuth: boolean = true
): Promise<Response> {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: getCorsHeaders(),
      });
    }

    let user = null;

    // Authentication check if required
    if (requireAuth) {
      const { user: authenticatedUser, error } = await validateAuthToken(request);
      
      if (error || !authenticatedUser) {
        return createErrorResponse(
          ErrorCode.UNAUTHORIZED,
          error || 'Authentication required',
          401
        );
      }
      
      user = authenticatedUser;
    }

    // Call the actual handler
    return await handler(request, user);

  } catch (error) {
    console.error('Middleware error:', error);
    
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      'Internal server error',
      500
    );
  }
}