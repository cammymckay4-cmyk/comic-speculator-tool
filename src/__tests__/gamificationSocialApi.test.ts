import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handler as trophiesHandler } from '../pages/api/trophies';
import { handler as userTrophiesHandler } from '../pages/api/users/[userId]/trophies';
import { handler as followHandler } from '../pages/api/users/[userId]/follow';
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
          single: vi.fn(),
          order: vi.fn(() => ({}))
        })),
        order: vi.fn(() => ({}))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn()
      }))
    }))
  }
}));

describe('Gamification & Social API Integration Tests', () => {
  const mockUser = {
    id: 'test-user-id-123',
    email: 'test@example.com'
  };

  const mockTargetUser = {
    id: 'target-user-id-456',
    email: 'target@example.com'
  };

  const mockTrophy = {
    id: 'trophy-123',
    name: 'First Comic',
    description: 'Add your first comic to your collection',
    category: 'collection',
    icon: 'trophy',
    rarity: 'common',
    points: 10,
    requirements: { type: 'collection_count', threshold: 1 },
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  const mockUserTrophy = {
    id: 'user-trophy-123',
    user_id: 'test-user-id-123',
    trophy_id: 'trophy-123',
    earned_at: '2024-01-15T12:00:00Z',
    progress_data: null,
    trophy: mockTrophy
  };

  const mockFollowRelationship = {
    id: 'follow-123',
    follower_id: 'test-user-id-123',
    following_id: 'target-user-id-456',
    created_at: '2024-01-01T00:00:00Z'
  };

  const validAuthHeader = 'Bearer valid-jwt-token';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =====================================================
  // GET /api/trophies Tests
  // =====================================================
  describe('GET /api/trophies', () => {
    it('should retrieve all active trophies successfully without authentication', async () => {
      const mockQuery = {
        eq: vi.fn(() => mockQuery),
        order: vi.fn(() => mockQuery)
      };
      
      mockQuery.order.mockResolvedValueOnce({
        data: [mockTrophy],
        error: null
      });
      
      const mockSelect = vi.fn(() => mockQuery);
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      const request = new Request('http://localhost:3000/api/trophies', {
        method: 'GET'
      });

      const response = await trophiesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0]).toEqual(mockTrophy);
      expect(data.message).toBe('Retrieved 1 available trophies');
    });

    it('should retrieve trophies with valid authentication', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockQuery = {
        eq: vi.fn(() => mockQuery),
        order: vi.fn(() => mockQuery)
      };
      
      mockQuery.order.mockResolvedValueOnce({
        data: [mockTrophy],
        error: null
      });
      
      (supabase.from as any).mockReturnValue({ select: vi.fn(() => mockQuery) });

      const request = new Request('http://localhost:3000/api/trophies', {
        method: 'GET',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await trophiesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 401 for invalid authentication token', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      });

      const request = new Request('http://localhost:3000/api/trophies', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer invalid-token' }
      });

      const response = await trophiesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid or expired token');
    });

    it('should handle database errors gracefully', async () => {
      const mockQuery = {
        eq: vi.fn(() => mockQuery),
        order: vi.fn(() => mockQuery)
      };
      
      mockQuery.order.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' }
      });
      
      (supabase.from as any).mockReturnValue({ select: vi.fn(() => mockQuery) });

      const request = new Request('http://localhost:3000/api/trophies', {
        method: 'GET'
      });

      const response = await trophiesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to retrieve trophies');
    });

    it('should return empty array when no trophies exist', async () => {
      const mockQuery = {
        eq: vi.fn(() => mockQuery),
        order: vi.fn(() => mockQuery)
      };
      
      mockQuery.order.mockResolvedValueOnce({
        data: [],
        error: null
      });
      
      (supabase.from as any).mockReturnValue({ select: vi.fn(() => mockQuery) });

      const request = new Request('http://localhost:3000/api/trophies', {
        method: 'GET'
      });

      const response = await trophiesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(0);
      expect(data.message).toBe('Retrieved 0 available trophies');
    });
  });

  // =====================================================
  // GET /api/users/{userId}/trophies Tests
  // =====================================================
  describe('GET /api/users/{userId}/trophies', () => {
    it('should retrieve user trophies successfully', async () => {
      // Mock user existence check
      const mockUserQuery = {
        eq: vi.fn(() => mockUserQuery),
        single: vi.fn(() => Promise.resolve({
          data: mockTargetUser,
          error: null
        }))
      };

      // Mock user trophies query
      const mockTrophiesQuery = {
        eq: vi.fn(() => mockTrophiesQuery),
        order: vi.fn(() => Promise.resolve({
          data: [mockUserTrophy],
          error: null
        }))
      };

      (supabase.from as any)
        .mockReturnValueOnce({ select: vi.fn(() => mockUserQuery) }) // User check
        .mockReturnValueOnce({ select: vi.fn(() => mockTrophiesQuery) }); // Trophies query

      const request = new Request('http://localhost:3000/api/users/target-user-id-456/trophies', {
        method: 'GET'
      });

      const response = await userTrophiesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0]).toEqual(mockUserTrophy);
      expect(data.metadata.total).toBe(1);
      expect(data.metadata.total_points).toBe(10);
      expect(data.metadata.rarity_breakdown.common).toBe(1);
    });

    it('should return 400 for invalid user ID format', async () => {
      const request = new Request('http://localhost:3000/api/users/invalid-id/trophies', {
        method: 'GET'
      });

      const response = await userTrophiesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid user ID format');
    });

    it('should return 404 for non-existent user', async () => {
      const mockUserQuery = {
        eq: vi.fn(() => mockUserQuery),
        single: vi.fn(() => Promise.resolve({
          data: null,
          error: { code: 'PGRST116' }
        }))
      };

      (supabase.from as any).mockReturnValue({ select: vi.fn(() => mockUserQuery) });

      const request = new Request(`http://localhost:3000/api/users/${mockTargetUser.id}/trophies`, {
        method: 'GET'
      });

      const response = await userTrophiesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('User not found');
    });

    it('should return empty trophies for user with no trophies', async () => {
      // Mock user existence check
      const mockUserQuery = {
        eq: vi.fn(() => mockUserQuery),
        single: vi.fn(() => Promise.resolve({
          data: mockTargetUser,
          error: null
        }))
      };

      // Mock empty trophies query
      const mockTrophiesQuery = {
        eq: vi.fn(() => mockTrophiesQuery),
        order: vi.fn(() => Promise.resolve({
          data: [],
          error: null
        }))
      };

      (supabase.from as any)
        .mockReturnValueOnce({ select: vi.fn(() => mockUserQuery) })
        .mockReturnValueOnce({ select: vi.fn(() => mockTrophiesQuery) });

      const request = new Request(`http://localhost:3000/api/users/${mockTargetUser.id}/trophies`, {
        method: 'GET'
      });

      const response = await userTrophiesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(0);
      expect(data.metadata.total).toBe(0);
      expect(data.metadata.total_points).toBe(0);
    });
  });

  // =====================================================
  // POST /api/users/{userId}/follow Tests
  // =====================================================
  describe('POST /api/users/{userId}/follow', () => {
    it('should follow user successfully', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock target user existence check
      const mockUserQuery = {
        eq: vi.fn(() => mockUserQuery),
        single: vi.fn(() => Promise.resolve({
          data: mockTargetUser,
          error: null
        }))
      };

      // Mock existing follow check (no existing follow)
      const mockFollowQuery = {
        eq: vi.fn(() => mockFollowQuery),
        single: vi.fn(() => Promise.resolve({
          data: null,
          error: { code: 'PGRST116' }
        }))
      };

      // Mock insert operation
      const mockInsertQuery = {
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: mockFollowRelationship,
            error: null
          }))
        }))
      };

      (supabase.from as any)
        .mockReturnValueOnce({ select: vi.fn(() => mockUserQuery) }) // User check
        .mockReturnValueOnce({ select: vi.fn(() => mockFollowQuery) }) // Existing follow check
        .mockReturnValueOnce({ insert: vi.fn(() => mockInsertQuery) }); // Insert

      const request = new Request(`http://localhost:3000/api/users/${mockTargetUser.id}/follow`, {
        method: 'POST',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await followHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockFollowRelationship);
      expect(data.message).toBe('Successfully followed user');
    });

    it('should return 401 for missing authorization', async () => {
      const request = new Request(`http://localhost:3000/api/users/${mockTargetUser.id}/follow`, {
        method: 'POST'
      });

      const response = await followHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authorization header required');
    });

    it('should return 400 for attempting to follow yourself', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const request = new Request(`http://localhost:3000/api/users/${mockUser.id}/follow`, {
        method: 'POST',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await followHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Cannot follow yourself');
    });

    it('should return 404 for non-existent target user', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockUserQuery = {
        eq: vi.fn(() => mockUserQuery),
        single: vi.fn(() => Promise.resolve({
          data: null,
          error: { code: 'PGRST116' }
        }))
      };

      (supabase.from as any).mockReturnValue({ select: vi.fn(() => mockUserQuery) });

      const request = new Request(`http://localhost:3000/api/users/${mockTargetUser.id}/follow`, {
        method: 'POST',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await followHandler(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Target user not found');
    });

    it('should return 409 for already following user', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock target user existence check
      const mockUserQuery = {
        eq: vi.fn(() => mockUserQuery),
        single: vi.fn(() => Promise.resolve({
          data: mockTargetUser,
          error: null
        }))
      };

      // Mock existing follow check (already following)
      const mockFollowQuery = {
        eq: vi.fn(() => mockFollowQuery),
        single: vi.fn(() => Promise.resolve({
          data: mockFollowRelationship,
          error: null
        }))
      };

      (supabase.from as any)
        .mockReturnValueOnce({ select: vi.fn(() => mockUserQuery) })
        .mockReturnValueOnce({ select: vi.fn(() => mockFollowQuery) });

      const request = new Request(`http://localhost:3000/api/users/${mockTargetUser.id}/follow`, {
        method: 'POST',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await followHandler(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Already following this user');
    });
  });

  // =====================================================
  // DELETE /api/users/{userId}/follow Tests
  // =====================================================
  describe('DELETE /api/users/{userId}/follow', () => {
    it('should unfollow user successfully', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock existing follow check (currently following)
      const mockFollowQuery = {
        eq: vi.fn(() => mockFollowQuery),
        single: vi.fn(() => Promise.resolve({
          data: mockFollowRelationship,
          error: null
        }))
      };

      // Mock delete operation
      const mockDeleteQuery = {
        eq: vi.fn(() => Promise.resolve({
          error: null
        }))
      };

      (supabase.from as any)
        .mockReturnValueOnce({ select: vi.fn(() => mockFollowQuery) }) // Follow check
        .mockReturnValueOnce({ delete: vi.fn(() => mockDeleteQuery) }); // Delete

      const request = new Request(`http://localhost:3000/api/users/${mockTargetUser.id}/follow`, {
        method: 'DELETE',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await followHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Successfully unfollowed user');
    });

    it('should return 404 for not currently following user', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockFollowQuery = {
        eq: vi.fn(() => mockFollowQuery),
        single: vi.fn(() => Promise.resolve({
          data: null,
          error: { code: 'PGRST116' }
        }))
      };

      (supabase.from as any).mockReturnValue({ select: vi.fn(() => mockFollowQuery) });

      const request = new Request(`http://localhost:3000/api/users/${mockTargetUser.id}/follow`, {
        method: 'DELETE',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await followHandler(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Not currently following this user');
    });

    it('should return 400 for attempting to unfollow yourself', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const request = new Request(`http://localhost:3000/api/users/${mockUser.id}/follow`, {
        method: 'DELETE',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await followHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Cannot unfollow yourself');
    });
  });

  // =====================================================
  // CORS and Method Validation Tests
  // =====================================================
  describe('CORS and Method Validation', () => {
    it('should handle OPTIONS requests for trophies endpoint', async () => {
      const request = new Request('http://localhost:3000/api/trophies', {
        method: 'OPTIONS'
      });

      const response = await trophiesHandler(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    });

    it('should handle OPTIONS requests for user trophies endpoint', async () => {
      const request = new Request(`http://localhost:3000/api/users/${mockTargetUser.id}/trophies`, {
        method: 'OPTIONS'
      });

      const response = await userTrophiesHandler(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    });

    it('should handle OPTIONS requests for follow endpoint', async () => {
      const request = new Request(`http://localhost:3000/api/users/${mockTargetUser.id}/follow`, {
        method: 'OPTIONS'
      });

      const response = await followHandler(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('DELETE');
    });

    it('should return 405 for unsupported methods on trophies endpoint', async () => {
      const request = new Request('http://localhost:3000/api/trophies', {
        method: 'POST'
      });

      const response = await trophiesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Method not allowed');
    });

    it('should return 405 for unsupported methods on user trophies endpoint', async () => {
      const request = new Request(`http://localhost:3000/api/users/${mockTargetUser.id}/trophies`, {
        method: 'POST'
      });

      const response = await userTrophiesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Method not allowed');
    });

    it('should return 405 for unsupported methods on follow endpoint', async () => {
      const request = new Request(`http://localhost:3000/api/users/${mockTargetUser.id}/follow`, {
        method: 'GET'
      });

      const response = await followHandler(request);
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Method not allowed');
    });
  });

  describe('URL Path Parsing', () => {
    it('should return 400 when userId is missing from trophies URL', async () => {
      const request = new Request('http://localhost:3000/api/users//trophies', {
        method: 'GET'
      });

      const response = await userTrophiesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('User ID is required');
    });

    it('should return 400 when userId is missing from follow URL', async () => {
      const request = new Request('http://localhost:3000/api/users//follow', {
        method: 'POST',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await followHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('User ID is required');
    });
  });
});