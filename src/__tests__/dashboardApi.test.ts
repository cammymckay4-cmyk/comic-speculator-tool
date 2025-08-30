import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { handler as dashboardHandler } from '../pages/api/dashboard';
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
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        })),
        in: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        })),
        not: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        })),
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

describe('Dashboard API Tests', () => {
  const mockUser = {
    id: 'test-user-id-123',
    email: 'test@example.com'
  };

  const mockCollectionItem = {
    collection_id: 'collection-123',
    series_name: 'Amazing Spider-Man',
    issue_number: '1',
    variant: null,
    current_market_value: 100.0,
    acquisition_price: 50.0,
    gain_loss_percentage: 100.0,
    grade_label: 'NM'
  };

  const mockTrendingComic = {
    series_name: 'X-Men',
    issue_number: '1',
    median_price: 200.0,
    price_trend_30d: 25.0,
    sample_count: 15,
    trend_category: 'hot',
    grade_label: 'VF+'
  };

  const mockDealData = [
    { deal_id: 'deal-1' },
    { deal_id: 'deal-2' }
  ];

  const validAuthHeader = 'Bearer valid-jwt-token';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/dashboard', () => {
    it('should return comprehensive dashboard data successfully', async () => {
      // Mock successful authentication
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock collection value query
      const mockCollectionQuery = {
        eq: vi.fn(() => mockCollectionQuery),
        select: vi.fn(() => Promise.resolve({
          data: [
            { current_market_value: 100, acquisition_price: 50 },
            { current_market_value: 150, acquisition_price: null },
            { current_market_value: null, acquisition_price: 75 }
          ],
          error: null
        }))
      };

      // Mock trending comics query
      const mockTrendingQuery = {
        in: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: [mockTrendingComic],
              error: null
            }))
          }))
        }))
      };

      // Mock user collection for movers
      const mockMoversCollectionQuery = {
        eq: vi.fn(() => mockMoversCollectionQuery),
        not: vi.fn(() => Promise.resolve({
          data: [mockCollectionItem],
          error: null
        }))
      };

      // Mock trending for market movers
      const mockMarketMoversQuery = {
        not: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: [{
                series_name: 'Fantastic Four',
                issue_number: '1',
                median_price: 300.0,
                price_trend_30d: 15.0,
                grade_label: 'VF'
              }],
              error: null
            }))
          }))
        }))
      };

      // Mock deal count queries
      const mockDealsQuery = {
        eq: vi.fn(() => mockDealsQuery),
        select: vi.fn(() => Promise.resolve({
          data: mockDealData,
          error: null
        }))
      };

      // Set up mock return values in order of calls
      (supabase.from as any)
        .mockReturnValueOnce({ select: vi.fn(() => mockCollectionQuery) }) // Total value
        .mockReturnValueOnce({ select: vi.fn(() => mockTrendingQuery) }) // Trending comics
        .mockReturnValueOnce({ select: vi.fn(() => mockDealsQuery) }) // Deal count
        .mockReturnValueOnce({ select: vi.fn(() => mockMoversCollectionQuery) }) // User collection for movers
        .mockReturnValueOnce({ select: vi.fn(() => mockMarketMoversQuery) }); // Market movers

      const request = new Request('http://localhost:3000/api/dashboard', {
        method: 'GET',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await dashboardHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('totalCollectionValue');
      expect(data.data).toHaveProperty('valueOverTime');
      expect(data.data).toHaveProperty('marketHeatIndex');
      expect(data.data).toHaveProperty('biggestMovers');
      expect(data.data.biggestMovers).toHaveProperty('winners');
      expect(data.data.biggestMovers).toHaveProperty('losers');
      expect(data.message).toBe('Dashboard data retrieved successfully');
    });

    it('should calculate total collection value correctly', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockCollectionData = [
        { current_market_value: 100, acquisition_price: 50 },
        { current_market_value: null, acquisition_price: 75 },
        { current_market_value: 200, acquisition_price: null }
      ];

      const mockCollectionQuery = {
        eq: vi.fn(() => mockCollectionQuery),
        select: vi.fn(() => Promise.resolve({
          data: mockCollectionData,
          error: null
        }))
      };

      // Mock other required queries with minimal data
      const mockEmptyQuery = {
        eq: vi.fn(() => mockEmptyQuery),
        in: vi.fn(() => mockEmptyQuery),
        not: vi.fn(() => mockEmptyQuery),
        order: vi.fn(() => mockEmptyQuery),
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        select: vi.fn(() => Promise.resolve({ data: [], error: null }))
      };

      (supabase.from as any)
        .mockReturnValueOnce({ select: vi.fn(() => mockCollectionQuery) }) // Total value
        .mockReturnValue({ select: vi.fn(() => mockEmptyQuery) }); // All other queries

      const request = new Request('http://localhost:3000/api/dashboard', {
        method: 'GET',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await dashboardHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.totalCollectionValue).toBe(375); // 100 + 75 + 200
    });

    it('should return value over time data with 12 months', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock all queries to return empty/minimal data
      const mockEmptyQuery = {
        eq: vi.fn(() => mockEmptyQuery),
        in: vi.fn(() => mockEmptyQuery),
        not: vi.fn(() => mockEmptyQuery),
        order: vi.fn(() => mockEmptyQuery),
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        select: vi.fn(() => Promise.resolve({ data: [], error: null }))
      };

      (supabase.from as any).mockReturnValue({ select: vi.fn(() => mockEmptyQuery) });

      const request = new Request('http://localhost:3000/api/dashboard', {
        method: 'GET',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await dashboardHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.valueOverTime).toHaveLength(12);
      expect(data.data.valueOverTime[0]).toHaveProperty('date');
      expect(data.data.valueOverTime[0]).toHaveProperty('value');
      expect(data.data.valueOverTime[0]).toHaveProperty('change');
      expect(data.data.valueOverTime[0]).toHaveProperty('changePercentage');
    });

    it('should return market heat index with calculated heat scores', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockTrendingQuery = {
        in: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: [mockTrendingComic],
              error: null
            }))
          }))
        }))
      };

      const mockDealsQuery = {
        eq: vi.fn(() => mockDealsQuery),
        select: vi.fn(() => Promise.resolve({
          data: mockDealData,
          error: null
        }))
      };

      // Mock other queries
      const mockEmptyQuery = {
        eq: vi.fn(() => mockEmptyQuery),
        not: vi.fn(() => mockEmptyQuery),
        order: vi.fn(() => mockEmptyQuery),
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        select: vi.fn(() => Promise.resolve({ data: [], error: null }))
      };

      (supabase.from as any)
        .mockReturnValueOnce({ select: vi.fn(() => mockEmptyQuery) }) // Total value
        .mockReturnValueOnce({ select: vi.fn(() => mockTrendingQuery) }) // Trending comics
        .mockReturnValueOnce({ select: vi.fn(() => mockDealsQuery) }) // Deal count
        .mockReturnValue({ select: vi.fn(() => mockEmptyQuery) }); // Other queries

      const request = new Request('http://localhost:3000/api/dashboard', {
        method: 'GET',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await dashboardHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.marketHeatIndex).toHaveLength(1);
      expect(data.data.marketHeatIndex[0]).toHaveProperty('seriesName');
      expect(data.data.marketHeatIndex[0]).toHaveProperty('heatScore');
      expect(data.data.marketHeatIndex[0]).toHaveProperty('dealCount');
      expect(data.data.marketHeatIndex[0].dealCount).toBe(2);
    });

    it('should return biggest movers with winners and losers', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockCollectionMovers = [
        { ...mockCollectionItem, gain_loss_percentage: 50.0 }, // Winner
        { ...mockCollectionItem, collection_id: 'collection-456', gain_loss_percentage: -20.0 } // Loser
      ];

      const mockMoversCollectionQuery = {
        eq: vi.fn(() => mockMoversCollectionQuery),
        not: vi.fn(() => Promise.resolve({
          data: mockCollectionMovers,
          error: null
        }))
      };

      const mockMarketMovers = [{
        series_name: 'Fantastic Four',
        issue_number: '1',
        median_price: 300.0,
        price_trend_30d: 30.0,
        grade_label: 'VF'
      }];

      const mockMarketMoversQuery = {
        not: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: mockMarketMovers,
              error: null
            }))
          }))
        }))
      };

      // Mock other queries
      const mockEmptyQuery = {
        eq: vi.fn(() => mockEmptyQuery),
        in: vi.fn(() => mockEmptyQuery),
        order: vi.fn(() => mockEmptyQuery),
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        select: vi.fn(() => Promise.resolve({ data: [], error: null }))
      };

      (supabase.from as any)
        .mockReturnValueOnce({ select: vi.fn(() => mockEmptyQuery) }) // Total value
        .mockReturnValueOnce({ select: vi.fn(() => mockEmptyQuery) }) // Trending comics
        .mockReturnValueOnce({ select: vi.fn(() => mockMoversCollectionQuery) }) // User collection for movers
        .mockReturnValueOnce({ select: vi.fn(() => mockMarketMoversQuery) }); // Market movers

      const request = new Request('http://localhost:3000/api/dashboard', {
        method: 'GET',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await dashboardHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.biggestMovers.winners.length).toBeGreaterThan(0);
      expect(data.data.biggestMovers.losers.length).toBeGreaterThan(0);
      expect(data.data.biggestMovers.winners[0]).toHaveProperty('inUserCollection');
      expect(data.data.biggestMovers.winners[0]).toHaveProperty('priceChangePercentage');
    });

    it('should return 401 for missing authorization header', async () => {
      const request = new Request('http://localhost:3000/api/dashboard', {
        method: 'GET'
      });

      const response = await dashboardHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authorization header required');
    });

    it('should return 401 for invalid token', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      });

      const request = new Request('http://localhost:3000/api/dashboard', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer invalid-token' }
      });

      const response = await dashboardHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid or expired token');
    });

    it('should handle database errors gracefully', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock database error
      const mockErrorQuery = {
        eq: vi.fn(() => mockErrorQuery),
        select: vi.fn(() => Promise.resolve({
          data: null,
          error: { message: 'Database connection failed' }
        }))
      };

      (supabase.from as any).mockReturnValue({ select: vi.fn(() => mockErrorQuery) });

      const request = new Request('http://localhost:3000/api/dashboard', {
        method: 'GET',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await dashboardHandler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle empty collections gracefully', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock empty collection
      const mockEmptyQuery = {
        eq: vi.fn(() => mockEmptyQuery),
        in: vi.fn(() => mockEmptyQuery),
        not: vi.fn(() => mockEmptyQuery),
        order: vi.fn(() => mockEmptyQuery),
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        select: vi.fn(() => Promise.resolve({ data: [], error: null }))
      };

      (supabase.from as any).mockReturnValue({ select: vi.fn(() => mockEmptyQuery) });

      const request = new Request('http://localhost:3000/api/dashboard', {
        method: 'GET',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await dashboardHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.totalCollectionValue).toBe(0);
      expect(data.data.marketHeatIndex).toHaveLength(0);
      expect(data.data.biggestMovers.winners).toHaveLength(0);
      expect(data.data.biggestMovers.losers).toHaveLength(0);
    });

    it('should include proper cache headers', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockEmptyQuery = {
        eq: vi.fn(() => mockEmptyQuery),
        in: vi.fn(() => mockEmptyQuery),
        not: vi.fn(() => mockEmptyQuery),
        order: vi.fn(() => mockEmptyQuery),
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        select: vi.fn(() => Promise.resolve({ data: [], error: null }))
      };

      (supabase.from as any).mockReturnValue({ select: vi.fn(() => mockEmptyQuery) });

      const request = new Request('http://localhost:3000/api/dashboard', {
        method: 'GET',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await dashboardHandler(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Cache-Control')).toBe('no-cache, max-age=300');
    });
  });

  describe('CORS and Method Validation', () => {
    it('should handle OPTIONS requests (CORS preflight)', async () => {
      const request = new Request('http://localhost:3000/api/dashboard', {
        method: 'OPTIONS'
      });

      const response = await dashboardHandler(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Authorization');
    });

    it('should return 405 for unsupported methods', async () => {
      const request = new Request('http://localhost:3000/api/dashboard', {
        method: 'POST'
      });

      const response = await dashboardHandler(request);
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Method not allowed');
    });
  });

  describe('Data Structure Validation', () => {
    it('should return properly structured dashboard data', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockEmptyQuery = {
        eq: vi.fn(() => mockEmptyQuery),
        in: vi.fn(() => mockEmptyQuery),
        not: vi.fn(() => mockEmptyQuery),
        order: vi.fn(() => mockEmptyQuery),
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        select: vi.fn(() => Promise.resolve({ data: [], error: null }))
      };

      (supabase.from as any).mockReturnValue({ select: vi.fn(() => mockEmptyQuery) });

      const request = new Request('http://localhost:3000/api/dashboard', {
        method: 'GET',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await dashboardHandler(request);
      const data = await response.json();

      expect(data).toMatchObject({
        success: true,
        data: {
          totalCollectionValue: expect.any(Number),
          valueOverTime: expect.any(Array),
          marketHeatIndex: expect.any(Array),
          biggestMovers: {
            winners: expect.any(Array),
            losers: expect.any(Array)
          }
        },
        message: expect.any(String)
      });
    });

    it('should validate valueOverTime structure', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockEmptyQuery = {
        eq: vi.fn(() => mockEmptyQuery),
        in: vi.fn(() => mockEmptyQuery),
        not: vi.fn(() => mockEmptyQuery),
        order: vi.fn(() => mockEmptyQuery),
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        select: vi.fn(() => Promise.resolve({ data: [], error: null }))
      };

      (supabase.from as any).mockReturnValue({ select: vi.fn(() => mockEmptyQuery) });

      const request = new Request('http://localhost:3000/api/dashboard', {
        method: 'GET',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await dashboardHandler(request);
      const data = await response.json();

      data.data.valueOverTime.forEach((point: any) => {
        expect(point).toHaveProperty('date');
        expect(point).toHaveProperty('value');
        expect(point).toHaveProperty('change');
        expect(point).toHaveProperty('changePercentage');
        expect(typeof point.date).toBe('string');
        expect(typeof point.value).toBe('number');
        expect(typeof point.change).toBe('number');
        expect(typeof point.changePercentage).toBe('number');
      });
    });
  });
});