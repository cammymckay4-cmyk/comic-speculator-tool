import { supabase } from '../../lib/supabaseClient';

interface WishlistItem {
  id: string;
  user_id: string;
  series_id: string;
  issue_id: string;
  grade_id?: string;
  acquisition_date?: string;
  acquisition_price?: number;
  current_value?: number;
  notes?: string;
  condition_notes?: string;
  storage_location?: string;
  personal_rating?: number;
  is_wishlist_item: boolean;
  created_at: string;
  updated_at: string;
}

interface AddWishlistRequest {
  series_id: string;
  issue_id: string;
  grade_id?: string;
  max_price?: number;
  notes?: string;
  personal_rating?: number;
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
 * GET /api/wishlist - Retrieve user's wishlist
 */
async function handleGetWishlist(request: Request): Promise<Response> {
  const { user, error: authError } = await validateAuthToken(request);
  
  if (authError || !user) {
    return new Response(
      JSON.stringify({ success: false, error: authError || 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { data, error } = await supabase
      .from('user_collections')
      .select(`
        *,
        comic_series:series_id(name, publisher),
        comic_issues:issue_id(issue_number, variant, key_issue),
        grading_standards:grade_id(company, grade_label, grade_value)
      `)
      .eq('user_id', user.id)
      .eq('is_wishlist_item', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to retrieve wishlist' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data || [],
        message: `Retrieved ${data?.length || 0} wishlist items`
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API Error in GET /api/wishlist:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * POST /api/wishlist - Add comic to user's wishlist
 */
async function handleAddToWishlist(request: Request): Promise<Response> {
  const { user, error: authError } = await validateAuthToken(request);
  
  if (authError || !user) {
    return new Response(
      JSON.stringify({ success: false, error: authError || 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body: AddWishlistRequest = await request.json();
    
    // Validate required fields
    if (!body.series_id || !body.issue_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'series_id and issue_id are required' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate personal_rating if provided
    if (body.personal_rating !== undefined && (body.personal_rating < 1 || body.personal_rating > 10)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'personal_rating must be between 1 and 10' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if item already exists in wishlist
    const { data: existing } = await supabase
      .from('user_collections')
      .select('id')
      .eq('user_id', user.id)
      .eq('series_id', body.series_id)
      .eq('issue_id', body.issue_id)
      .eq('grade_id', body.grade_id || null)
      .eq('is_wishlist_item', true)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'This comic is already in your wishlist' 
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insert new wishlist item
    const { data, error } = await supabase
      .from('user_collections')
      .insert({
        user_id: user.id,
        series_id: body.series_id,
        issue_id: body.issue_id,
        grade_id: body.grade_id || null,
        current_value: body.max_price || null,
        notes: body.notes || null,
        personal_rating: body.personal_rating || null,
        is_wishlist_item: true
      })
      .select(`
        *,
        comic_series:series_id(name, publisher),
        comic_issues:issue_id(issue_number, variant, key_issue),
        grading_standards:grade_id(company, grade_label, grade_value)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to add comic to wishlist' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
        message: 'Comic added to wishlist successfully'
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (parseError) {
    console.error('Parse error:', parseError);
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Main API handler for /api/wishlist
 */
export async function handler(request: Request): Promise<Response> {
  try {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    switch (request.method) {
      case 'GET':
        return handleGetWishlist(request);
      case 'POST':
        return handleAddToWishlist(request);
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Method not allowed' }),
          { status: 405, headers: { 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('API Error in /api/wishlist:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Export for different runtime environments
export default handler;
export { handler as GET, handler as POST };