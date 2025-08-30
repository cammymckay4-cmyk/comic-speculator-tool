import { supabase } from '../../../../lib/supabaseClient';

interface UserTrophy {
  id: string;
  user_id: string;
  trophy_id: string;
  earned_at: string;
  progress_data?: any;
  trophy: {
    id: string;
    name: string;
    description: string;
    category: string;
    icon?: string;
    rarity: string;
    points: number;
    requirements?: any;
  };
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    total?: number;
    total_points?: number;
    rarity_breakdown?: {
      common: number;
      rare: number;
      epic: number;
      legendary: number;
    };
  };
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
  const match = url.match(/\/api\/users\/([^\/]+)\/trophies/);
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
 * GET /api/users/{userId}/trophies - Retrieve the trophies a specific user has earned
 */
async function handleGetUserTrophies(request: Request): Promise<Response> {
  // Auth is optional for viewing others' trophies (public social feature)
  // but we'll validate if provided
  const { user, error: authError } = await validateAuthToken(request);
  
  // Don't fail if no auth token - trophy viewing could be public
  if (authError && authError !== 'Authorization header required') {
    return new Response(
      JSON.stringify({ success: false, error: authError }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Extract userId from URL
  const userId = extractUserIdFromPath(request.url);
  
  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, error: 'User ID is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!isValidUUID(userId)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid user ID format' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // First verify the user exists
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !targetUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user trophies with trophy details
    const { data, error } = await supabase
      .from('user_trophies')
      .select(`
        *,
        trophy:trophies(
          id,
          name,
          description,
          category,
          icon,
          rarity,
          points,
          requirements
        )
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to retrieve user trophies' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calculate trophy statistics
    const trophies = data || [];
    const totalPoints = trophies.reduce((sum, ut) => sum + (ut.trophy?.points || 0), 0);
    const rarityBreakdown = {
      common: trophies.filter(ut => ut.trophy?.rarity === 'common').length,
      rare: trophies.filter(ut => ut.trophy?.rarity === 'rare').length,
      epic: trophies.filter(ut => ut.trophy?.rarity === 'epic').length,
      legendary: trophies.filter(ut => ut.trophy?.rarity === 'legendary').length,
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: trophies,
        message: `Retrieved ${trophies.length} trophies for user`,
        metadata: {
          total: trophies.length,
          total_points: totalPoints,
          rarity_breakdown: rarityBreakdown
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API Error in GET /api/users/{userId}/trophies:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Main API handler for /api/users/{userId}/trophies
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
        return handleGetUserTrophies(request);
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Method not allowed' }),
          { status: 405, headers: { 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('API Error in /api/users/{userId}/trophies:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Export for different runtime environments
export default handler;
export { handler as GET };