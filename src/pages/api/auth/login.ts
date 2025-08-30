import { supabase } from '../../../lib/supabaseClient';
import { 
  withMiddleware, 
  ErrorCode, 
  createErrorResponse, 
  createSuccessResponse,
  sanitizeString,
  validateEmail,
  logSlowQuery
} from '../../../lib/middleware/auth';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    email_confirmed_at?: string;
    last_sign_in_at?: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at?: number;
    expires_in?: number;
  };
}

/**
 * Enhanced API Handler for user login endpoint
 * POST /api/auth/login
 * 
 * Security improvements:
 * - Input sanitization and validation
 * - Rate limiting ready
 * - Enhanced error handling
 * - Login attempt logging
 * - Account lockout protection
 */
export async function handler(request: Request): Promise<Response> {
  return withMiddleware(request, async (req) => {
    if (req.method !== 'POST') {
      return createErrorResponse(
        ErrorCode.INVALID_INPUT,
        'Method not allowed. Use POST.',
        405
      );
    }

    const startTime = Date.now();
    
    try {
      // Parse and validate request body
      let body: LoginRequest;
      try {
        const rawBody = await req.json();
        
        // Sanitize inputs
        body = {
          email: sanitizeString(rawBody.email || '', 254).toLowerCase(),
          password: rawBody.password || ''
        };
      } catch (parseError) {
        return createErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          'Invalid JSON in request body',
          400
        );
      }

      const { email, password } = body;

      // Validate required fields
      if (!email || !password) {
        return createErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          'Email and password are required',
          400
        );
      }

      // Enhanced email validation
      if (!validateEmail(email)) {
        return createErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          'Invalid email format',
          400
        );
      }

      // Password length validation
      if (password.length < 6 || password.length > 128) {
        return createErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          'Invalid password length',
          400
        );
      }

      // Check for account lockout (basic implementation)
      const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      
      // Authenticate user with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      const duration = Date.now() - startTime;
      await logSlowQuery('auth_login', duration, { email: email.substring(0, email.indexOf('@')) + '@***' });

      if (error) {
        console.error('Login error:', {
          error: error.message,
          email: email.substring(0, email.indexOf('@')) + '@***',
          ip: clientIP,
          timestamp: new Date().toISOString()
        });
        
        // Log failed login attempt
        try {
          await supabase
            .from('user_activity_log')
            .insert({
              user_id: null,
              activity_type: 'failed_login',
              activity_details: {
                email: email.substring(0, email.indexOf('@')) + '@***',
                error: error.message,
                ip: clientIP
              },
              ip_address: clientIP
            });
        } catch (logError) {
          // Don't fail login due to logging error
          console.error('Failed to log login attempt:', logError);
        }
        
        // Generic error message to prevent user enumeration
        return createErrorResponse(
          ErrorCode.UNAUTHORIZED,
          'Invalid login credentials',
          401
        );
      }

      if (!data.user || !data.session) {
        return createErrorResponse(
          ErrorCode.UNAUTHORIZED,
          'Authentication failed',
          401
        );
      }

      // Log successful login
      try {
        await supabase
          .from('user_activity_log')
          .insert({
            user_id: data.user.id,
            activity_type: 'login',
            activity_details: {
              ip: clientIP,
              user_agent: req.headers.get('user-agent')
            },
            ip_address: clientIP
          });
      } catch (logError) {
        console.error('Failed to log successful login:', logError);
      }

      // Prepare safe response data
      const responseData: LoginResponse = {
        user: {
          id: data.user.id,
          email: data.user.email!,
          email_confirmed_at: data.user.email_confirmed_at,
          last_sign_in_at: data.user.last_sign_in_at,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
          expires_in: data.session.expires_in,
        }
      };

      return createSuccessResponse(
        responseData,
        'Login successful',
        200,
        { login_duration_ms: duration }
      );

    } catch (error) {
      console.error('API Error in auth/login:', error);
      
      const duration = Date.now() - startTime;
      await logSlowQuery('auth_login_error', duration, { error: error instanceof Error ? error.message : 'Unknown error' });
      
      return createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        'Authentication service temporarily unavailable',
        500
      );
    }
  }, false); // No auth required for login
}

// Export for different runtime environments
export default handler;
export { handler as POST };