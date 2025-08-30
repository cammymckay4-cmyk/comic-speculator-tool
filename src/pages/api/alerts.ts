import { supabase } from '../../lib/supabaseClient';

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

interface CreateAlertRequest {
  series_id?: string;
  issue_id?: string;
  grade_id?: string;
  max_price?: number;
  min_deal_score?: number;
  auction_types?: string[];
  notification_email?: boolean;
  notification_frequency?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    count?: number;
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
 * GET /api/alerts - Retrieve user's alert settings
 */
async function handleGetAlerts(request: Request): Promise<Response> {
  const { user, error: authError } = await validateAuthToken(request);
  
  if (authError || !user) {
    return new Response(
      JSON.stringify({ success: false, error: authError || 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse query parameters for filtering and pagination
    const url = new URL(request.url);
    const isActive = url.searchParams.get('active');
    const seriesId = url.searchParams.get('series_id');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Build query with filters
    let query = supabase
      .from('user_alert_rules')
      .select(`
        *,
        comic_series:series_id(id, name, publisher),
        comic_issues:issue_id(id, issue_number, variant, key_issue),
        grading_standards:grade_id(id, company, grade_label, grade_value)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    if (seriesId) {
      query = query.eq('series_id', seriesId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to retrieve alert rules' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response: ApiResponse<AlertRule[]> = {
      success: true,
      data: data || [],
      message: `Retrieved ${data?.length || 0} alert rules`,
      meta: {
        count: data?.length || 0,
        timestamp: new Date().toISOString()
      }
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API Error in GET /api/alerts:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * POST /api/alerts - Create a new alert setting
 */
async function handleCreateAlert(request: Request): Promise<Response> {
  const { user, error: authError } = await validateAuthToken(request);
  
  if (authError || !user) {
    return new Response(
      JSON.stringify({ success: false, error: authError || 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body: CreateAlertRequest = await request.json();
    
    // Validate that at least one targeting criteria is provided
    if (!body.series_id && !body.issue_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'At least one of series_id or issue_id must be provided' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate min_deal_score range
    if (body.min_deal_score !== undefined && (body.min_deal_score < 0 || body.min_deal_score > 100)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'min_deal_score must be between 0 and 100' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate max_price
    if (body.max_price !== undefined && body.max_price <= 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'max_price must be greater than 0' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate notification_frequency
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

    // Check if a similar alert rule already exists
    let duplicateQuery = supabase
      .from('user_alert_rules')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (body.series_id) duplicateQuery = duplicateQuery.eq('series_id', body.series_id);
    if (body.issue_id) duplicateQuery = duplicateQuery.eq('issue_id', body.issue_id);
    if (body.grade_id) duplicateQuery = duplicateQuery.eq('grade_id', body.grade_id);

    const { data: existingAlert } = await duplicateQuery.single();

    if (existingAlert) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'A similar alert rule already exists for this combination' 
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insert new alert rule
    const { data, error } = await supabase
      .from('user_alert_rules')
      .insert({
        user_id: user.id,
        series_id: body.series_id || null,
        issue_id: body.issue_id || null,
        grade_id: body.grade_id || null,
        max_price: body.max_price || null,
        min_deal_score: body.min_deal_score || null,
        auction_types: body.auction_types || null,
        notification_email: body.notification_email !== false, // Default to true
        notification_frequency: body.notification_frequency || 'immediate',
        is_active: true
      })
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
        JSON.stringify({ success: false, error: 'Failed to create alert rule' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response: ApiResponse<AlertRule> = {
      success: true,
      data,
      message: 'Alert rule created successfully',
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    return new Response(
      JSON.stringify(response),
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
 * Main API handler for /api/alerts
 */
export async function handler(request: Request): Promise<Response> {
  try {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    switch (request.method) {
      case 'GET':
        return handleGetAlerts(request);
      case 'POST':
        return handleCreateAlert(request);
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Method not allowed' }),
          { status: 405, headers: { 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('API Error in /api/alerts:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Export for different runtime environments
export default handler;
export { handler as GET, handler as POST };