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

interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword?: string;
}

interface RegisterResponse {
  user: {
    id: string;
    email: string;
    email_confirmed_at?: string;
  };
  requiresEmailConfirmation: boolean;
}

/**
 * Validate password strength
 */
function validatePasswordStrength(password: string): string[] {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be no longer than 128 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for common weak passwords
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common, please choose a stronger password');
  }
  
  return errors;
}

/**
 * Enhanced API Handler for user registration endpoint
 * POST /api/auth/register
 * 
 * Security improvements:
 * - Enhanced password validation
 * - Rate limiting ready
 * - Input sanitization
 * - Registration attempt logging
 * - Password strength requirements
 * - Disposable email detection ready
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
      let body: RegisterRequest;
      try {
        const rawBody = await req.json();
        
        // Sanitize inputs
        body = {
          email: sanitizeString(rawBody.email || '', 254).toLowerCase(),
          password: rawBody.password || '',
          confirmPassword: rawBody.confirmPassword
        };
      } catch (parseError) {
        return createErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          'Invalid JSON in request body',
          400
        );
      }

      const { email, password, confirmPassword } = body;

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

      // Enhanced password validation
      const passwordErrors = validatePasswordStrength(password);
      if (passwordErrors.length > 0) {
        return createErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          passwordErrors.join('; '),
          400
        );
      }

      // Password confirmation check (if provided)
      if (confirmPassword && password !== confirmPassword) {
        return createErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          'Passwords do not match',
          400
        );
      }

      const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      
      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            registration_ip: clientIP,
            registration_user_agent: req.headers.get('user-agent')
          }
        }
      });

      const duration = Date.now() - startTime;
      await logSlowQuery('auth_register', duration, { email: email.substring(0, email.indexOf('@')) + '@***' });

      if (error) {
        console.error('Registration error:', {
          error: error.message,
          email: email.substring(0, email.indexOf('@')) + '@***',
          ip: clientIP,
          timestamp: new Date().toISOString()
        });
        
        // Log failed registration attempt
        try {
          await supabase
            .from('user_activity_log')
            .insert({
              user_id: null,
              activity_type: 'failed_registration',
              activity_details: {
                email: email.substring(0, email.indexOf('@')) + '@***',
                error: error.message,
                ip: clientIP
              },
              ip_address: clientIP
            });
        } catch (logError) {
          console.error('Failed to log registration attempt:', logError);
        }
        
        // Return generic error to prevent information disclosure
        return createErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          'Registration failed. Please check your input and try again.',
          400
        );
      }

      if (!data.user) {
        return createErrorResponse(
          ErrorCode.INTERNAL_ERROR,
          'Registration failed unexpectedly',
          500
        );
      }

      // Log successful registration
      try {
        await supabase
          .from('user_activity_log')
          .insert({
            user_id: data.user.id,
            activity_type: 'registration',
            activity_details: {
              ip: clientIP,
              user_agent: req.headers.get('user-agent'),
              email_confirmed: !!data.user.email_confirmed_at
            },
            ip_address: clientIP
          });
      } catch (logError) {
        console.error('Failed to log successful registration:', logError);
      }

      // Create user profile record
      try {
        await supabase
          .from('user_preferences')
          .insert({
            user_id: data.user.id,
            email_notifications: true,
            public_collection: false,
            advanced_analytics: false
          });
      } catch (profileError) {
        console.error('Failed to create user preferences:', profileError);
        // Don't fail registration if profile creation fails
      }

      const responseData: RegisterResponse = {
        user: {
          id: data.user.id,
          email: data.user.email!,
          email_confirmed_at: data.user.email_confirmed_at,
        },
        requiresEmailConfirmation: !data.user.email_confirmed_at
      };

      const message = data.user.email_confirmed_at 
        ? 'Registration successful' 
        : 'Registration successful. Please check your email to confirm your account.';

      return createSuccessResponse(
        responseData,
        message,
        201,
        { registration_duration_ms: duration }
      );

    } catch (error) {
      console.error('API Error in auth/register:', error);
      
      const duration = Date.now() - startTime;
      await logSlowQuery('auth_register_error', duration, { error: error instanceof Error ? error.message : 'Unknown error' });
      
      return createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        'Registration service temporarily unavailable',
        500
      );
    }
  }, false); // No auth required for registration
}

// Export for different runtime environments
export default handler;
export { handler as POST };