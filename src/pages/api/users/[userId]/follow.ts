import { supabase } from '../../../../lib/supabaseClient';

interface FollowRequest {
  // No body needed for follow/unfollow - userId is in URL
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Extract and validate JWT token from Authorization header
 */
async function validateAuthToken(request: Request): Promise<{ user: any; error?: string }> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Authorization header required' };
  }

  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { user: null, error: 'Invalid or expired token' };
    }
    
    return { user };
  } catch (error) {
    return { user: null, error: 'Token validation failed' };
  }
}

/**
 * Extract userId from URL path
 */
function extractUserIdFromPath(url: string): string | null {
  const match = url.match(/\/api\/users\/([^\/]+)\/follow/);
  return match ? match[1] : null;
}

/**
 * Validate UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * POST /api/users/{userId}/follow - Follow a user
 */
async function handleFollowUser(request: Request): Promise<Response> {
  const { user, error: authError } = await validateAuthToken(request);
  
  if (authError || !user) {
    return new Response(
      JSON.stringify({ success: false, error: authError || 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Extract userId from URL
  const targetUserId = extractUserIdFromPath(request.url);
  
  if (!targetUserId) {
    return new Response(
      JSON.stringify({ success: false, error: 'User ID is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!isValidUUID(targetUserId)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid user ID format' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Prevent self-following
  if (user.id === targetUserId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Cannot follow yourself' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // First verify the target user exists
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', targetUserId)
      .single();

    if (userError || !targetUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'Target user not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .single();

    if (existingFollow) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Already following this user' 
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create follow relationship
    const { data, error } = await supabase
      .from('user_follows')
      .insert({
        follower_id: user.id,
        following_id: targetUserId
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to follow user' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
        message: 'Successfully followed user'
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API Error in POST /api/users/{userId}/follow:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * DELETE /api/users/{userId}/follow - Unfollow a user
 */
async function handleUnfollowUser(request: Request): Promise<Response> {
  const { user, error: authError } = await validateAuthToken(request);
  
  if (authError || !user) {
    return new Response(
      JSON.stringify({ success: false, error: authError || 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Extract userId from URL
  const targetUserId = extractUserIdFromPath(request.url);
  
  if (!targetUserId) {
    return new Response(
      JSON.stringify({ success: false, error: 'User ID is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!isValidUUID(targetUserId)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid user ID format' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Prevent self-unfollowing (shouldn't happen, but safety check)
  if (user.id === targetUserId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Cannot unfollow yourself' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Check if currently following
    const { data: existingFollow } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .single();

    if (!existingFollow) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Not currently following this user' 
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Remove follow relationship
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId);

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to unfollow user' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully unfollowed user'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API Error in DELETE /api/users/{userId}/follow:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Main API handler for /api/users/{userId}/follow
 */
export async function handler(request: Request): Promise<Response> {
  try {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    switch (request.method) {
      case 'POST':
        return handleFollowUser(request);
      case 'DELETE':
        return handleUnfollowUser(request);
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Method not allowed' }),
          { status: 405, headers: { 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('API Error in /api/users/{userId}/follow:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Export for different runtime environments
export default handler;
export { handler as POST, handler as DELETE };