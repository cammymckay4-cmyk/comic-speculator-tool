import { supabase } from '../../../lib/supabaseClient';

interface AlertRule {
  id: string;
  user_id: string;
  series_id?: string;
  issue_id?: string;
  grade_id?: string;
  max_price?: number;
  min_deal_score?: number;
  auction_types?: string[];
  is_active: boolean;
  notification_email: boolean;
  notification_frequency: string;
  created_at: string;
  updated_at: string;
  
  // Related data
  comic_series?: {
    id: string;
    name: string;
    publisher: string;
  };
  comic_issues?: {
    id: string;
    issue_number: string;
    variant?: string;
    key_issue?: boolean;
  };
  grading_standards?: {
    id: string;
    company: string;
    grade_label: string;
    grade_value?: number;
  };
}

interface UpdateAlertRequest {
  series_id?: string;
  issue_id?: string;
  grade_id?: string;
  max_price?: number;
  min_deal_score?: number;
  auction_types?: string[];
  is_active?: boolean;
  notification_email?: boolean;
  notification_frequency?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    timestamp: string;
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
 * PUT /api/alerts/{settingId} - Update an existing alert setting
 */
async function handleUpdateAlert(request: Request, settingId: string): Promise<Response> {
  const { user, error: authError } = await validateAuthToken(request);
  
  if (authError || !user) {
    return new Response(
      JSON.stringify({ success: false, error: authError || 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Validate settingId format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(settingId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid setting ID format. Must be a valid UUID.' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body: UpdateAlertRequest = await request.json();
    
    // Validate min_deal_score range if provided
    if (body.min_deal_score !== undefined && (body.min_deal_score < 0 || body.min_deal_score > 100)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'min_deal_score must be between 0 and 100' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate max_price if provided
    if (body.max_price !== undefined && body.max_price <= 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'max_price must be greater than 0' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate notification_frequency if provided
    const validFrequencies = ['immediate', 'daily', 'weekly'];
    if (body.notification_frequency && !validFrequencies.includes(body.notification_frequency)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'notification_frequency must be one of: immediate, daily, weekly' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the alert rule exists and belongs to the user
    const { data: existingAlert, error: fetchError } = await supabase
      .from('user_alert_rules')
      .select('id, user_id')
      .eq('id', settingId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingAlert) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Alert rule not found or access denied' 
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build the update object with only provided fields
    const updateData: any = {};
    
    if (body.series_id !== undefined) updateData.series_id = body.series_id;
    if (body.issue_id !== undefined) updateData.issue_id = body.issue_id;
    if (body.grade_id !== undefined) updateData.grade_id = body.grade_id;
    if (body.max_price !== undefined) updateData.max_price = body.max_price;
    if (body.min_deal_score !== undefined) updateData.min_deal_score = body.min_deal_score;
    if (body.auction_types !== undefined) updateData.auction_types = body.auction_types;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.notification_email !== undefined) updateData.notification_email = body.notification_email;
    if (body.notification_frequency !== undefined) updateData.notification_frequency = body.notification_frequency;

    // If no fields to update, return error
    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'At least one field must be provided for update' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update the alert rule
    const { data, error } = await supabase
      .from('user_alert_rules')
      .update(updateData)
      .eq('id', settingId)
      .eq('user_id', user.id)
      .select(`
        *,
        comic_series:series_id(id, name, publisher),
        comic_issues:issue_id(id, issue_number, variant, key_issue),
        grading_standards:grade_id(id, company, grade_label, grade_value)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update alert rule' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response: ApiResponse<AlertRule> = {
      success: true,
      data,
      message: 'Alert rule updated successfully',
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    return new Response(
      JSON.stringify(response),
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
 * DELETE /api/alerts/{settingId} - Delete an alert setting
 */
async function handleDeleteAlert(request: Request, settingId: string): Promise<Response> {
  const { user, error: authError } = await validateAuthToken(request);
  
  if (authError || !user) {
    return new Response(
      JSON.stringify({ success: false, error: authError || 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Validate settingId format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(settingId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid setting ID format. Must be a valid UUID.' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the alert rule exists and belongs to the user
    const { data: existingAlert, error: fetchError } = await supabase
      .from('user_alert_rules')
      .select('id, user_id')
      .eq('id', settingId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingAlert) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Alert rule not found or access denied' 
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete the alert rule
    const { error } = await supabase
      .from('user_alert_rules')
      .delete()
      .eq('id', settingId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to delete alert rule' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response: ApiResponse = {
      success: true,
      message: 'Alert rule deleted successfully',
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API Error in DELETE /api/alerts/[settingId]:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Main API handler for /api/alerts/[settingId]
 */
export async function handler(request: Request): Promise<Response> {
  try {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Extract settingId from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const settingId = pathParts[pathParts.length - 1];

    if (!settingId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Setting ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    switch (request.method) {
      case 'PUT':
        return handleUpdateAlert(request, settingId);
      case 'DELETE':
        return handleDeleteAlert(request, settingId);
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Method not allowed' }),
          { status: 405, headers: { 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('API Error in /api/alerts/[settingId]:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Export for different runtime environments
export default handler;
export { handler as PUT, handler as DELETE };