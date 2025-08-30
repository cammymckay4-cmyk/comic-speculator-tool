import { supabase } from '../../../lib/supabaseClient';

interface UpdateCollectionRequest {
  series_id?: string;
  issue_id?: string;
  grade_id?: string;
  acquisition_date?: string;
  acquisition_price?: number;
  current_value?: number;
  notes?: string;
  condition_notes?: string;
  storage_location?: string;
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
 * Extract entryId from URL path
 */
function extractEntryId(url: string): string | null {
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/');
  const entryId = pathParts[pathParts.length - 1];
  
  // Basic UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  return uuidRegex.test(entryId) ? entryId : null;
}

/**
 * PUT /api/collection/{entryId} - Update collection entry
 */
async function handleUpdateCollection(request: Request, entryId: string): Promise<Response> {
  const { user, error: authError } = await validateAuthToken(request);
  
  if (authError || !user) {
    return new Response(
      JSON.stringify({ success: false, error: authError || 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body: UpdateCollectionRequest = await request.json();

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

    // Check if the collection entry exists and belongs to the user
    const { data: existing, error: checkError } = await supabase
      .from('user_collections')
      .select('id, user_id')
      .eq('id', entryId)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existing) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Collection entry not found or unauthorized' 
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare update data (only include provided fields)
    const updateData: any = {};
    
    if (body.series_id !== undefined) updateData.series_id = body.series_id;
    if (body.issue_id !== undefined) updateData.issue_id = body.issue_id;
    if (body.grade_id !== undefined) updateData.grade_id = body.grade_id;
    if (body.acquisition_date !== undefined) updateData.acquisition_date = body.acquisition_date;
    if (body.acquisition_price !== undefined) updateData.acquisition_price = body.acquisition_price;
    if (body.current_value !== undefined) updateData.current_value = body.current_value;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.condition_notes !== undefined) updateData.condition_notes = body.condition_notes;
    if (body.storage_location !== undefined) updateData.storage_location = body.storage_location;
    if (body.personal_rating !== undefined) updateData.personal_rating = body.personal_rating;

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No fields provided for update' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check for duplicate if series_id, issue_id, or grade_id is being changed
    if (updateData.series_id || updateData.issue_id || updateData.grade_id !== undefined) {
      const { data: duplicate } = await supabase
        .from('user_collections')
        .select('id')
        .eq('user_id', user.id)
        .eq('series_id', updateData.series_id || existing.series_id)
        .eq('issue_id', updateData.issue_id || existing.issue_id)
        .eq('grade_id', updateData.grade_id !== undefined ? updateData.grade_id : existing.grade_id)
        .neq('id', entryId)
        .single();

      if (duplicate) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'A comic with these details already exists in your collection' 
          }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update the collection entry
    const { data, error } = await supabase
      .from('user_collections')
      .update(updateData)
      .eq('id', entryId)
      .eq('user_id', user.id)
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
        JSON.stringify({ success: false, error: 'Failed to update collection entry' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
        message: 'Collection entry updated successfully'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
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
 * DELETE /api/collection/{entryId} - Remove collection entry
 */
async function handleDeleteCollection(request: Request, entryId: string): Promise<Response> {
  const { user, error: authError } = await validateAuthToken(request);
  
  if (authError || !user) {
    return new Response(
      JSON.stringify({ success: false, error: authError || 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Check if the collection entry exists and belongs to the user
    const { data: existing, error: checkError } = await supabase
      .from('user_collections')
      .select(`
        *,
        comic_series:series_id(name, publisher),
        comic_issues:issue_id(issue_number, variant, key_issue),
        grading_standards:grade_id(company, grade_label, grade_value)
      `)
      .eq('id', entryId)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existing) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Collection entry not found or unauthorized' 
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete the collection entry
    const { error } = await supabase
      .from('user_collections')
      .delete()
      .eq('id', entryId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to delete collection entry' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: existing,
        message: 'Collection entry deleted successfully'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API Error in DELETE /api/collection/[entryId]:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Main API handler for /api/collection/[entryId]
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

    // Extract entryId from URL
    const entryId = extractEntryId(request.url);
    
    if (!entryId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid entry ID format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    switch (request.method) {
      case 'PUT':
        return handleUpdateCollection(request, entryId);
      case 'DELETE':
        return handleDeleteCollection(request, entryId);
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Method not allowed' }),
          { status: 405, headers: { 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('API Error in /api/collection/[entryId]:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Export for different runtime environments
export default handler;
export { handler as PUT, handler as DELETE };