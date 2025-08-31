import { supabase } from '../../../../lib/supabaseClient';

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
  const match = url.match(/\/api\/users\/([^\/]+)\/followers/);
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
 * Check if user's profile is public or if requesting user has permission to view
 */
async function canViewUserFollowers(targetUserId: string, requestingUserId?: string): Promise<boolean> {
  // If same user, always allow
  if (requestingUserId && requestingUserId === targetUserId) {
    return true;
  }

  // Check if target user's profile is public
  const { data: targetUser } = await supabase
    .from('users')
    .select('profile_is_public')
    .eq('id', targetUserId)
    .single();

  return targetUser?.profile_is_public === true;
}

/**
 * GET /api/users/{userId}/followers - Get a user's followers
 */
async function handleGetFollowers(request: Request): Promise<Response> {
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

  try {
    // Check if requesting user can view this user's followers
    const canView = await canViewUserFollowers(targetUserId, user.id);
    
    if (!canView) {
      return new Response(
        JSON.stringify({ success: false, error: 'Profile is private' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // First verify the target user exists
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', targetUserId)
      .single();

    if (userError || !targetUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get followers with user details
    const { data: followers, error } = await supabase
      .from('user_follows')
      .select(`
        follower_id,
        created_at,
        follower:users!user_follows_follower_id_fkey (
          id,
          username,
          full_name,
          profile_is_public
        )
      `)
      .eq('following_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch followers' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Format response data
    const formattedFollowers = followers.map(follow => ({
      userId: follow.follower_id,
      username: follow.follower.username,
      fullName: follow.follower.full_name,
      profileIsPublic: follow.follower.profile_is_public,
      followedAt: follow.created_at
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          followers: formattedFollowers,
          totalCount: formattedFollowers.length
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API Error in GET /api/users/{userId}/followers:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Main API handler for /api/users/{userId}/followers
 */
export async function handler(request: Request): Promise<Response> {
  try {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    switch (request.method) {
      case 'GET':
        return handleGetFollowers(request);
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Method not allowed' }),
          { status: 405, headers: { 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('API Error in /api/users/{userId}/followers:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Export for different runtime environments
export default handler;
export { handler as GET };