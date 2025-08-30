import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { handler as collectionHandler } from '../pages/api/collection';
import { handler as collectionEntryHandler } from '../pages/api/collection/[entryId]';
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

describe('Collection API Integration Tests', () => {
  const mockUser = {
    id: 'test-user-id-123',
    email: 'test@example.com'
  };

  const mockCollectionItem = {
    id: 'collection-item-123',
    user_id: 'test-user-id-123',
    series_id: 'series-123',
    issue_id: 'issue-123',
    grade_id: 'grade-123',
    acquisition_date: '2024-01-01',
    acquisition_price: 50.00,
    current_value: 75.00,
    notes: 'Great condition',
    condition_notes: 'Minor spine wear',
    storage_location: 'Box 1',
    personal_rating: 8,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    comic_series: { name: 'Amazing Spider-Man', publisher: 'Marvel' },
    comic_issues: { issue_number: '1', variant: null, key_issue: true },
    grading_standards: { company: 'CGC', grade_label: 'VF+', grade_value: 8.5 }
  };

  const validAuthHeader = 'Bearer valid-jwt-token';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/collection', () => {
    it('should retrieve user collection successfully', async () => {
      // Mock successful authentication
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock database query
      const mockQuery = {
        eq: vi.fn(() => mockQuery),
        order: vi.fn(() => Promise.resolve({
          data: [mockCollectionItem],
          error: null
        }))
      };
      
      const mockSelect = vi.fn(() => mockQuery);
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      const request = new Request('http://localhost:3000/api/collection', {
        method: 'GET',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await collectionHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0]).toEqual(mockCollectionItem);
      expect(data.message).toBe('Retrieved 1 collection items');
    });

    it('should return 401 for missing authorization header', async () => {
      const request = new Request('http://localhost:3000/api/collection', {
        method: 'GET'
      });

      const response = await collectionHandler(request);
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

      const request = new Request('http://localhost:3000/api/collection', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer invalid-token' }
      });

      const response = await collectionHandler(request);
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

      const request = new Request('http://localhost:3000/api/collection', {
        method: 'GET',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await collectionHandler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to retrieve collection');
    });
  });

  describe('POST /api/collection', () => {
    const validCollectionData = {
      series_id: 'series-123',
      issue_id: 'issue-123',
      grade_id: 'grade-123',
      acquisition_date: '2024-01-01',
      acquisition_price: 50.00,
      personal_rating: 8
    };

    it('should add comic to collection successfully', async () => {
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
            data: mockCollectionItem,
            error: null
          }))
        }))
      };

      (supabase.from as any)
        .mockReturnValueOnce({ select: vi.fn(() => mockSelectQuery) }) // For duplicate check
        .mockReturnValueOnce({ insert: vi.fn(() => mockInsertQuery) }); // For insert

      const request = new Request('http://localhost:3000/api/collection', {
        method: 'POST',
        headers: { 
          'Authorization': validAuthHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validCollectionData)
      });

      const response = await collectionHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockCollectionItem);
      expect(data.message).toBe('Comic added to collection successfully');
    });

    it('should return 400 for missing required fields', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const invalidData = { grade_id: 'grade-123' }; // Missing series_id and issue_id

      const request = new Request('http://localhost:3000/api/collection', {
        method: 'POST',
        headers: { 
          'Authorization': validAuthHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidData)
      });

      const response = await collectionHandler(request);
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
        ...validCollectionData,
        personal_rating: 11 // Out of valid range (1-10)
      };

      const request = new Request('http://localhost:3000/api/collection', {
        method: 'POST',
        headers: { 
          'Authorization': validAuthHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidData)
      });

      const response = await collectionHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('personal_rating must be between 1 and 10');
    });

    it('should return 409 for duplicate collection item', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock existing item check (duplicate found)
      const mockSelectQuery = {
        eq: vi.fn(() => mockSelectQuery),
        single: vi.fn(() => Promise.resolve({
          data: { id: 'existing-item-123' },
          error: null
        }))
      };
      
      (supabase.from as any).mockReturnValue({ select: vi.fn(() => mockSelectQuery) });

      const request = new Request('http://localhost:3000/api/collection', {
        method: 'POST',
        headers: { 
          'Authorization': validAuthHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validCollectionData)
      });

      const response = await collectionHandler(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe('This comic is already in your collection');
    });
  });

  describe('PUT /api/collection/[entryId]', () => {
    const entryId = 'collection-item-123';
    const updateData = {
      acquisition_price: 60.00,
      current_value: 80.00,
      notes: 'Updated notes',
      personal_rating: 9
    };

    it('should update collection entry successfully', async () => {
      // Mock successful authentication
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock existing item check
      const mockExistingQuery = {
        eq: vi.fn(() => mockExistingQuery),
        single: vi.fn(() => Promise.resolve({
          data: { id: entryId, user_id: mockUser.id },
          error: null
        }))
      };

      // Mock update operation
      const mockUpdateQuery = {
        eq: vi.fn(() => mockUpdateQuery),
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { ...mockCollectionItem, ...updateData },
            error: null
          }))
        }))
      };

      (supabase.from as any)
        .mockReturnValueOnce({ select: vi.fn(() => mockExistingQuery) }) // For existence check
        .mockReturnValueOnce({ update: vi.fn(() => mockUpdateQuery) }); // For update

      const request = new Request(`http://localhost:3000/api/collection/${entryId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': validAuthHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const response = await collectionEntryHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Collection entry updated successfully');
      expect(data.data.acquisition_price).toBe(updateData.acquisition_price);
    });

    it('should return 404 for non-existent entry', async () => {
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

      const request = new Request(`http://localhost:3000/api/collection/${entryId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': validAuthHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const response = await collectionEntryHandler(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Collection entry not found or unauthorized');
    });

    it('should return 400 for invalid entry ID format', async () => {
      const invalidEntryId = 'invalid-id';
      
      const request = new Request(`http://localhost:3000/api/collection/${invalidEntryId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': validAuthHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const response = await collectionEntryHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid entry ID format');
    });

    it('should return 400 for no fields to update', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockExistingQuery = {
        eq: vi.fn(() => mockExistingQuery),
        single: vi.fn(() => Promise.resolve({
          data: { id: entryId, user_id: mockUser.id },
          error: null
        }))
      };

      (supabase.from as any).mockReturnValue({ select: vi.fn(() => mockExistingQuery) });

      const request = new Request(`http://localhost:3000/api/collection/${entryId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': validAuthHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // Empty update data
      });

      const response = await collectionEntryHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('No fields provided for update');
    });
  });

  describe('DELETE /api/collection/[entryId]', () => {
    const entryId = 'collection-item-123';

    it('should delete collection entry successfully', async () => {
      // Mock successful authentication
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock existing item check
      const mockExistingQuery = {
        eq: vi.fn(() => mockExistingQuery),
        single: vi.fn(() => Promise.resolve({
          data: mockCollectionItem,
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

      const request = new Request(`http://localhost:3000/api/collection/${entryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await collectionEntryHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Collection entry deleted successfully');
      expect(data.data).toEqual(mockCollectionItem);
    });

    it('should return 404 for non-existent entry', async () => {
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

      const request = new Request(`http://localhost:3000/api/collection/${entryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': validAuthHeader }
      });

      const response = await collectionEntryHandler(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Collection entry not found or unauthorized');
    });
  });

  describe('CORS and Method Validation', () => {
    it('should handle OPTIONS requests (CORS preflight)', async () => {
      const request = new Request('http://localhost:3000/api/collection', {
        method: 'OPTIONS'
      });

      const response = await collectionHandler(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });

    it('should return 405 for unsupported methods on collection endpoint', async () => {
      const request = new Request('http://localhost:3000/api/collection', {
        method: 'PATCH'
      });

      const response = await collectionHandler(request);
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Method not allowed');
    });

    it('should return 405 for unsupported methods on collection entry endpoint', async () => {
      const entryId = 'collection-item-123';
      const request = new Request(`http://localhost:3000/api/collection/${entryId}`, {
        method: 'POST'
      });

      const response = await collectionEntryHandler(request);
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Method not allowed');
    });
  });
});