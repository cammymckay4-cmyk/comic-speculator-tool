import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { handler as wishlistHandler } from '../pages/api/wishlist';
import { handler as wishlistItemHandler } from '../pages/api/wishlist/[wantId]';
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
        neq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn()
      }))
    }))
  }
}));

describe('Wishlist API Integration Tests', () => {
  const mockUser = {
    id: 'test-user-id-123',
    email: 'test@example.com'
  };

  const mockWishlistItem = {
    id: 'wishlist-item-123',
    user_id: 'test-user-id-123',
    series_id: 'series-123',
    issue_id: 'issue-123',
    grade_id: 'grade-123',
    acquisition_date: null,
    acquisition_price: null,
    current_value: 100.00,
    notes: 'Must have comic',
    condition_notes: null,
    storage_location: null,
    personal_rating: 9,
    is_wishlist_item: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    comic_series: { name: 'Amazing Spider-Man', publisher: 'Marvel' },
    comic_issues: { issue_number: '1', variant: null, key_issue: true },
    grading_standards: { company: 'CGC', grade_label: 'NM+', grade_value: 9.6 }
  };

  const validAuthHeader = 'Bearer valid-jwt-token';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/wishlist', () => {
    it('should retrieve user wishlist successfully', async () => {
      // Mock successful authentication
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock database query for wishlist items only
      const mockQuery = {
        eq: vi.fn(() => mockQuery),
        order: vi.fn(() => Promise.resolve({
          data: [mockWishlistItem],
          error: null
        }))
      };
      
      const mockSelect = vi.fn(() => mockQuery);
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      const request = new Request('http://localhost:3000/api/wishlist', {
        method: 'GET',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await wishlistHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0]).toEqual(mockWishlistItem);
      expect(data.data[0].is_wishlist_item).toBe(true);
      expect(data.message).toBe('Retrieved 1 wishlist items');
    });

    it('should return empty array for user with no wishlist items', async () => {
      // Mock successful authentication
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock database query returning empty results
      const mockQuery = {
        eq: vi.fn(() => mockQuery),
        order: vi.fn(() => Promise.resolve({
          data: [],
          error: null
        }))
      };
      
      const mockSelect = vi.fn(() => mockQuery);
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      const request = new Request('http://localhost:3000/api/wishlist', {
        method: 'GET',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await wishlistHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(0);
      expect(data.message).toBe('Retrieved 0 wishlist items');
    });

    it('should return 401 for missing authorization header', async () => {
      const request = new Request('http://localhost:3000/api/wishlist', {
        method: 'GET'
      });

      const response = await wishlistHandler(request);
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

      const request = new Request('http://localhost:3000/api/wishlist', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer invalid-token' }
      });

      const response = await wishlistHandler(request);
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

      const mockQuery = {
        eq: vi.fn(() => mockQuery),
        order: vi.fn(() => Promise.resolve({
          data: null,
          error: { message: 'Database connection failed' }
        }))
      };
      
      (supabase.from as any).mockReturnValue({ select: vi.fn(() => mockQuery) });

      const request = new Request('http://localhost:3000/api/wishlist', {
        method: 'GET',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await wishlistHandler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to retrieve wishlist');
    });
  });

  describe('POST /api/wishlist', () => {
    const validWishlistData = {
      series_id: 'series-123',
      issue_id: 'issue-123',
      grade_id: 'grade-123',
      max_price: 100.00,
      notes: 'Must have comic',
      personal_rating: 9
    };

    it('should add comic to wishlist successfully', async () => {
      // Mock successful authentication
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock existing item check (no duplicate)
      const mockSelectQuery = {
        eq: vi.fn(() => mockSelectQuery),
        single: vi.fn(() => Promise.resolve({
          data: null,
          error: { code: 'PGRST116' } // No rows found
        }))
      };
      
      // Mock insert operation
      const mockInsertQuery = {
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: mockWishlistItem,
            error: null
          }))
        }))
      };

      (supabase.from as any)
        .mockReturnValueOnce({ select: vi.fn(() => mockSelectQuery) }) // For duplicate check
        .mockReturnValueOnce({ insert: vi.fn(() => mockInsertQuery) }); // For insert

      const request = new Request('http://localhost:3000/api/wishlist', {
        method: 'POST',
        headers: { 
          'Authorization': validAuthHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validWishlistData)
      });

      const response = await wishlistHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockWishlistItem);
      expect(data.data.is_wishlist_item).toBe(true);
      expect(data.message).toBe('Comic added to wishlist successfully');
    });

    it('should add comic to wishlist with minimal data', async () => {
      // Mock successful authentication
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock existing item check (no duplicate)
      const mockSelectQuery = {
        eq: vi.fn(() => mockSelectQuery),
        single: vi.fn(() => Promise.resolve({
          data: null,
          error: { code: 'PGRST116' }
        }))
      };
      
      // Mock insert operation
      const minimalWishlistItem = {
        ...mockWishlistItem,
        current_value: null,
        notes: null,
        personal_rating: null
      };

      const mockInsertQuery = {
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: minimalWishlistItem,
            error: null
          }))
        }))
      };

      (supabase.from as any)
        .mockReturnValueOnce({ select: vi.fn(() => mockSelectQuery) })
        .mockReturnValueOnce({ insert: vi.fn(() => mockInsertQuery) });

      const minimalData = {
        series_id: 'series-123',
        issue_id: 'issue-123'
      };

      const request = new Request('http://localhost:3000/api/wishlist', {
        method: 'POST',
        headers: { 
          'Authorization': validAuthHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(minimalData)
      });

      const response = await wishlistHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.is_wishlist_item).toBe(true);
      expect(data.message).toBe('Comic added to wishlist successfully');
    });

    it('should return 400 for missing required fields', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const invalidData = { grade_id: 'grade-123' }; // Missing series_id and issue_id

      const request = new Request('http://localhost:3000/api/wishlist', {
        method: 'POST',
        headers: { 
          'Authorization': validAuthHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidData)
      });

      const response = await wishlistHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('series_id and issue_id are required');
    });

    it('should return 400 for invalid personal_rating', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const invalidData = {
        ...validWishlistData,
        personal_rating: 11 // Out of valid range (1-10)
      };

      const request = new Request('http://localhost:3000/api/wishlist', {
        method: 'POST',
        headers: { 
          'Authorization': validAuthHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidData)
      });

      const response = await wishlistHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('personal_rating must be between 1 and 10');
    });

    it('should return 409 for duplicate wishlist item', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock existing item check (duplicate found)
      const mockSelectQuery = {
        eq: vi.fn(() => mockSelectQuery),
        single: vi.fn(() => Promise.resolve({
          data: { id: 'existing-wishlist-item-123' },
          error: null
        }))
      };
      
      (supabase.from as any).mockReturnValue({ select: vi.fn(() => mockSelectQuery) });

      const request = new Request('http://localhost:3000/api/wishlist', {
        method: 'POST',
        headers: { 
          'Authorization': validAuthHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validWishlistData)
      });

      const response = await wishlistHandler(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe('This comic is already in your wishlist');
    });

    it('should return 400 for invalid JSON', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const request = new Request('http://localhost:3000/api/wishlist', {
        method: 'POST',
        headers: { 
          'Authorization': validAuthHeader,
          'Content-Type': 'application/json'
        },
        body: 'invalid json'
      });

      const response = await wishlistHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid JSON in request body');
    });
  });

  describe('PUT /api/wishlist/[wantId]', () => {
    const wantId = 'wishlist-item-123';
    const updateData = {
      max_price: 120.00,
      notes: 'Updated wishlist notes',
      personal_rating: 10
    };

    it('should update wishlist item successfully', async () => {
      // Mock successful authentication
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock existing item check
      const mockExistingQuery = {
        eq: vi.fn(() => mockExistingQuery),
        single: vi.fn(() => Promise.resolve({
          data: mockWishlistItem,
          error: null
        }))
      };

      // Mock update operation
      const mockUpdateQuery = {
        eq: vi.fn(() => mockUpdateQuery),
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { ...mockWishlistItem, current_value: 120.00, notes: 'Updated wishlist notes', personal_rating: 10 },
            error: null
          }))
        }))
      };

      (supabase.from as any)
        .mockReturnValueOnce({ select: vi.fn(() => mockExistingQuery) }) // For existence check
        .mockReturnValueOnce({ update: vi.fn(() => mockUpdateQuery) }); // For update

      const request = new Request(`http://localhost:3000/api/wishlist/${wantId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': validAuthHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const response = await wishlistItemHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Wishlist item updated successfully');
      expect(data.data.current_value).toBe(120.00);
      expect(data.data.notes).toBe('Updated wishlist notes');
      expect(data.data.personal_rating).toBe(10);
    });

    it('should return 404 for non-existent wishlist item', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockExistingQuery = {
        eq: vi.fn(() => mockExistingQuery),
        single: vi.fn(() => Promise.resolve({
          data: null,
          error: { code: 'PGRST116' }
        }))
      };

      (supabase.from as any).mockReturnValue({ select: vi.fn(() => mockExistingQuery) });

      const request = new Request(`http://localhost:3000/api/wishlist/${wantId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': validAuthHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const response = await wishlistItemHandler(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Wishlist item not found or unauthorized');
    });

    it('should return 400 for invalid wishlist item ID format', async () => {
      const invalidWantId = 'invalid-id';
      
      const request = new Request(`http://localhost:3000/api/wishlist/${invalidWantId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': validAuthHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const response = await wishlistItemHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid wishlist item ID format');
    });

    it('should return 400 for no fields to update', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockExistingQuery = {
        eq: vi.fn(() => mockExistingQuery),
        single: vi.fn(() => Promise.resolve({
          data: mockWishlistItem,
          error: null
        }))
      };

      (supabase.from as any).mockReturnValue({ select: vi.fn(() => mockExistingQuery) });

      const request = new Request(`http://localhost:3000/api/wishlist/${wantId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': validAuthHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // Empty update data
      });

      const response = await wishlistItemHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('No fields provided for update');
    });

    it('should return 409 for duplicate comic when updating core identifiers', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockExistingQuery = {
        eq: vi.fn(() => mockExistingQuery),
        single: vi.fn(() => Promise.resolve({
          data: mockWishlistItem,
          error: null
        }))
      };

      // Mock duplicate check - return a duplicate
      const mockDuplicateQuery = {
        eq: vi.fn(() => mockDuplicateQuery),
        neq: vi.fn(() => mockDuplicateQuery),
        single: vi.fn(() => Promise.resolve({
          data: { id: 'another-wishlist-item' },
          error: null
        }))
      };

      (supabase.from as any)
        .mockReturnValueOnce({ select: vi.fn(() => mockExistingQuery) })
        .mockReturnValueOnce({ select: vi.fn(() => mockDuplicateQuery) });

      const duplicateUpdateData = {
        series_id: 'different-series-123',
        issue_id: 'different-issue-123'
      };

      const request = new Request(`http://localhost:3000/api/wishlist/${wantId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': validAuthHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(duplicateUpdateData)
      });

      const response = await wishlistItemHandler(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe('A comic with these details already exists in your wishlist');
    });
  });

  describe('DELETE /api/wishlist/[wantId]', () => {
    const wantId = 'wishlist-item-123';

    it('should delete wishlist item successfully', async () => {
      // Mock successful authentication
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock existing item check
      const mockExistingQuery = {
        eq: vi.fn(() => mockExistingQuery),
        single: vi.fn(() => Promise.resolve({
          data: mockWishlistItem,
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
        .mockReturnValueOnce({ select: vi.fn(() => mockExistingQuery) }) // For existence check
        .mockReturnValueOnce({ delete: vi.fn(() => mockDeleteQuery) }); // For delete

      const request = new Request(`http://localhost:3000/api/wishlist/${wantId}`, {
        method: 'DELETE',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await wishlistItemHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Wishlist item deleted successfully');
      expect(data.data).toEqual(mockWishlistItem);
    });

    it('should return 404 for non-existent wishlist item', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockExistingQuery = {
        eq: vi.fn(() => mockExistingQuery),
        single: vi.fn(() => Promise.resolve({
          data: null,
          error: { code: 'PGRST116' }
        }))
      };

      (supabase.from as any).mockReturnValue({ select: vi.fn(() => mockExistingQuery) });

      const request = new Request(`http://localhost:3000/api/wishlist/${wantId}`, {
        method: 'DELETE',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await wishlistItemHandler(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Wishlist item not found or unauthorized');
    });

    it('should return 400 for invalid wishlist item ID format', async () => {
      const invalidWantId = 'invalid-id';
      
      const request = new Request(`http://localhost:3000/api/wishlist/${invalidWantId}`, {
        method: 'DELETE',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await wishlistItemHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid wishlist item ID format');
    });
  });

  describe('CORS and Method Validation', () => {
    it('should handle OPTIONS requests (CORS preflight) on wishlist endpoint', async () => {
      const request = new Request('http://localhost:3000/api/wishlist', {
        method: 'OPTIONS'
      });

      const response = await wishlistHandler(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('PUT');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('DELETE');
    });

    it('should handle OPTIONS requests (CORS preflight) on wishlist item endpoint', async () => {
      const wantId = 'wishlist-item-123';
      const request = new Request(`http://localhost:3000/api/wishlist/${wantId}`, {
        method: 'OPTIONS'
      });

      const response = await wishlistItemHandler(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('PUT');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('DELETE');
    });

    it('should return 405 for unsupported methods on wishlist endpoint', async () => {
      const request = new Request('http://localhost:3000/api/wishlist', {
        method: 'PATCH'
      });

      const response = await wishlistHandler(request);
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Method not allowed');
    });

    it('should return 405 for unsupported methods on wishlist item endpoint', async () => {
      const wantId = 'wishlist-item-123';
      const request = new Request(`http://localhost:3000/api/wishlist/${wantId}`, {
        method: 'POST'
      });

      const response = await wishlistItemHandler(request);
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Method not allowed');
    });
  });

  describe('Authentication Edge Cases', () => {
    it('should return 401 for malformed authorization header', async () => {
      const request = new Request('http://localhost:3000/api/wishlist', {
        method: 'GET',
        headers: { 'Authorization': 'InvalidFormat token' }
      });

      const response = await wishlistHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authorization header required');
    });

    it('should return 401 when supabase auth throws error', async () => {
      (supabase.auth.getUser as any).mockRejectedValue(new Error('Auth service unavailable'));

      const request = new Request('http://localhost:3000/api/wishlist', {
        method: 'GET',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await wishlistHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Token validation failed');
    });
  });
});