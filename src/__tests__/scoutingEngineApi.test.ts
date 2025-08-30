import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { handler as scoutDealsHandler } from '../pages/api/scout/deals/[comicId]';
import { handler as alertsHandler } from '../pages/api/alerts';
import { handler as alertSettingHandler } from '../pages/api/alerts/[settingId]';
import { supabase } from '../lib/supabaseClient';

// Mock the supabase client
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => ({
                  lte: vi.fn(() => ({}))
                }))
              }))
            }))
          })),
          single: vi.fn(),
          order: vi.fn(() => ({
            range: vi.fn(() => ({}))
          }))
        })),
        gte: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({}))
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn()
            }))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn()
        }))
      }))
    }))
  }
}));

describe('Scouting Engine API Integration Tests', () => {
  const mockUser = {
    id: 'test-user-id-123',
    email: 'test@example.com'
  };

  const mockComicId = '12345678-1234-4123-a123-123456789abc';
  const mockSettingId = '87654321-4321-4321-b321-987654321abc';

  const mockDealsResponse = [
    {
      id: 'deal-123',
      deal_score: 85.5,
      potential_profit: 1200.00,
      profit_percentage: 15.5,
      deal_type: 'underpriced',
      confidence_level: 'high',
      expires_at: '2024-12-31T23:59:59Z',
      normalized_listings: {
        id: 'listing-123',
        title: 'Amazing Spider-Man #1 CGC 9.8',
        price: 2500.00,
        shipping_cost: 25.00,
        source: 'eBay',
        auction_type: 'buy_it_now',
        ends_at: '2024-12-25T10:00:00Z',
        listing_url: 'https://ebay.com/item/123',
        comic_series: {
          id: 'series-123',
          name: 'Amazing Spider-Man',
          publisher: 'Marvel Comics'
        },
        comic_issues: {
          id: mockComicId,
          issue_number: '1',
          variant: null,
          key_issue: true
        },
        grading_standards: {
          company: 'CGC',
          grade_label: '9.8',
          grade_value: 9.8
        }
      },
      market_values: {
        median_price_gbp: 3000.00,
        sample_count: 25,
        last_updated: '2024-12-01T12:00:00Z'
      }
    }
  ];

  const mockAlertRule = {
    id: mockSettingId,
    user_id: mockUser.id,
    series_id: 'series-123',
    issue_id: mockComicId,
    grade_id: 'grade-cgc-98',
    max_price: 2000.00,
    min_deal_score: 75.0,
    auction_types: ['buy_it_now'],
    is_active: true,
    notification_email: true,
    notification_frequency: 'immediate',
    created_at: '2024-12-01T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
    comic_series: {
      id: 'series-123',
      name: 'Amazing Spider-Man',
      publisher: 'Marvel Comics'
    },
    comic_issues: {
      id: mockComicId,
      issue_number: '1',
      variant: null,
      key_issue: true
    },
    grading_standards: {
      id: 'grade-cgc-98',
      company: 'CGC',
      grade_label: '9.8',
      grade_value: 9.8
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/scout/deals/{comicId}', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      });

      const request = new Request('http://localhost/api/scout/deals/' + mockComicId, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer invalid-token' }
      });

      const response = await scoutDealsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid or expired token');
    });

    it('should return 400 for invalid comic ID format', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const request = new Request('http://localhost/api/scout/deals/invalid-id', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer valid-token' }
      });

      const response = await scoutDealsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid comic ID format');
    });

    it('should successfully return deals for authenticated user', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock the complex query chain
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: mockDealsResponse,
          error: null
        })
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      });

      const request = new Request('http://localhost/api/scout/deals/' + mockComicId, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer valid-token' }
      });

      const response = await scoutDealsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].deal_score).toBe(85.5);
      expect(data.data[0].listing.title).toBe('Amazing Spider-Man #1 CGC 9.8');
      expect(data.meta.comic_id).toBe(mockComicId);
    });

    it('should handle query parameters correctly', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: mockDealsResponse,
          error: null
        })
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      });

      const request = new Request('http://localhost/api/scout/deals/' + mockComicId + '?minScore=80&maxPrice=3000&dealType=underpriced&limit=10', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer valid-token' }
      });

      const response = await scoutDealsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockQuery.gte).toHaveBeenCalledWith('deal_score', 80);
      expect(mockQuery.lte).toHaveBeenCalledWith('normalized_listings.price', 3000);
      expect(mockQuery.eq).toHaveBeenCalledWith('deal_type', 'underpriced');
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
    });
  });

  describe('GET /api/alerts', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      });

      const request = new Request('http://localhost/api/alerts', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer invalid-token' }
      });

      const response = await alertsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid or expired token');
    });

    it('should successfully return user alert rules', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [mockAlertRule],
          error: null
        })
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      });

      const request = new Request('http://localhost/api/alerts', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer valid-token' }
      });

      const response = await alertsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].id).toBe(mockSettingId);
      expect(data.data[0].min_deal_score).toBe(75.0);
    });
  });

  describe('POST /api/alerts', () => {
    it('should create new alert rule successfully', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock the duplicate check to return no existing alert
      const mockSelectQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null
        })
      };

      const mockInsertQuery = {
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockAlertRule,
            error: null
          })
        })
      };

      mockSupabase.from
        .mockReturnValueOnce({ select: vi.fn().mockReturnValue(mockSelectQuery) })
        .mockReturnValueOnce({ insert: vi.fn().mockReturnValue(mockInsertQuery) });

      const request = new Request('http://localhost/api/alerts', {
        method: 'POST',
        headers: { 
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          series_id: 'series-123',
          issue_id: mockComicId,
          grade_id: 'grade-cgc-98',
          max_price: 2000.00,
          min_deal_score: 75.0,
          auction_types: ['buy_it_now'],
          notification_frequency: 'immediate'
        })
      });

      const response = await alertsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(mockSettingId);
      expect(data.message).toBe('Alert rule created successfully');
    });

    it('should return 400 for missing required fields', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const request = new Request('http://localhost/api/alerts', {
        method: 'POST',
        headers: { 
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          max_price: 2000.00
        })
      });

      const response = await alertsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('At least one of series_id or issue_id must be provided');
    });

    it('should return 400 for invalid min_deal_score', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const request = new Request('http://localhost/api/alerts', {
        method: 'POST',
        headers: { 
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          series_id: 'series-123',
          min_deal_score: 150
        })
      });

      const response = await alertsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('min_deal_score must be between 0 and 100');
    });
  });

  describe('PUT /api/alerts/{settingId}', () => {
    it('should update alert rule successfully', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock the existence check
      const mockExistenceQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: mockSettingId, user_id: mockUser.id },
          error: null
        })
      };

      // Mock the update query
      const mockUpdateQuery = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { ...mockAlertRule, max_price: 2500.00 },
            error: null
          })
        })
      };

      mockSupabase.from
        .mockReturnValueOnce({ select: vi.fn().mockReturnValue(mockExistenceQuery) })
        .mockReturnValueOnce({ update: vi.fn().mockReturnValue(mockUpdateQuery) });

      const request = new Request('http://localhost/api/alerts/' + mockSettingId, {
        method: 'PUT',
        headers: { 
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          max_price: 2500.00
        })
      });

      const response = await alertSettingHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.max_price).toBe(2500.00);
      expect(data.message).toBe('Alert rule updated successfully');
    });

    it('should return 400 for invalid setting ID format', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const request = new Request('http://localhost/api/alerts/invalid-id', {
        method: 'PUT',
        headers: { 
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          max_price: 2500.00
        })
      });

      const response = await alertSettingHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid setting ID format');
    });

    it('should return 404 for non-existent alert rule', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' }
        })
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      });

      const request = new Request('http://localhost/api/alerts/' + mockSettingId, {
        method: 'PUT',
        headers: { 
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          max_price: 2500.00
        })
      });

      const response = await alertSettingHandler(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Alert rule not found or access denied');
    });
  });

  describe('DELETE /api/alerts/{settingId}', () => {
    it('should delete alert rule successfully', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock the existence check
      const mockExistenceQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: mockSettingId, user_id: mockUser.id },
          error: null
        })
      };

      // Mock the delete query
      const mockDeleteQuery = {
        eq: vi.fn().mockReturnThis()
      };
      mockDeleteQuery.eq.mockResolvedValue({ error: null });

      mockSupabase.from
        .mockReturnValueOnce({ select: vi.fn().mockReturnValue(mockExistenceQuery) })
        .mockReturnValueOnce({ delete: vi.fn().mockReturnValue(mockDeleteQuery) });

      const request = new Request('http://localhost/api/alerts/' + mockSettingId, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer valid-token' }
      });

      const response = await alertSettingHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Alert rule deleted successfully');
    });
  });

  describe('CORS handling', () => {
    it('should handle OPTIONS requests correctly for scout deals', async () => {
      const request = new Request('http://localhost/api/scout/deals/' + mockComicId, {
        method: 'OPTIONS'
      });

      const response = await scoutDealsHandler(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    });

    it('should handle OPTIONS requests correctly for alerts', async () => {
      const request = new Request('http://localhost/api/alerts', {
        method: 'OPTIONS'
      });

      const response = await alertsHandler(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });

    it('should handle OPTIONS requests correctly for alert settings', async () => {
      const request = new Request('http://localhost/api/alerts/' + mockSettingId, {
        method: 'OPTIONS'
      });

      const response = await alertSettingHandler(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('PUT');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('DELETE');
    });
  });
});