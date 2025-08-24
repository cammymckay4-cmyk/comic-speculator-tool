import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../pages/api/top-deals';
import * as topDeals from '../lib/topDeals';

// Mock the topDeals module
vi.mock('../lib/topDeals');

const mockGetTopDeals = vi.mocked(topDeals.getTopDeals);

describe('top-deals API endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 405 for non-GET requests', async () => {
    const request = new Request('http://localhost/api/top-deals', {
      method: 'POST'
    });

    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(405);
    expect(data.error).toBe('Method not allowed');
  });

  it('should return top deals with default parameters', async () => {
    const mockDeals = [
      {
        listing: {
          listingId: 'test-1',
          issueId: 'asm-300',
          gradeId: 'cgc-9-4',
          title: 'Amazing Spider-Man #300',
          totalPriceGBP: 200,
          source: 'eBay'
        },
        marketValue: {
          marketValueId: 'mv-1',
          issueId: 'asm-300',
          gradeId: 'cgc-9-4',
          windowDays: 30,
          sampleCount: 5,
          medianGBP: 250,
          meanGBP: 250,
          minGBP: 200,
          maxGBP: 300,
          lastUpdated: '2024-01-01T00:00:00Z'
        },
        dealScore: {
          dealScoreId: 'deal-1',
          listingId: 'test-1',
          issueId: 'asm-300',
          gradeId: 'cgc-9-4',
          marketValueGBP: 250,
          totalPriceGBP: 200,
          score: 20,
          computedAt: '2024-01-01T00:00:00Z'
        }
      }
    ];

    mockGetTopDeals.mockResolvedValue(mockDeals);

    const request = new Request('http://localhost/api/top-deals');
    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockDeals);
    expect(data.meta.count).toBe(1);
    expect(data.meta.minScore).toBe(10);
    expect(data.meta.searchTerms).toBe('default');
    expect(mockGetTopDeals).toHaveBeenCalledWith(10, undefined);
  });

  it('should handle custom minScore parameter', async () => {
    mockGetTopDeals.mockResolvedValue([]);

    const request = new Request('http://localhost/api/top-deals?minScore=25');
    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.meta.minScore).toBe(25);
    expect(mockGetTopDeals).toHaveBeenCalledWith(25, undefined);
  });

  it('should handle custom searchTerms parameter', async () => {
    mockGetTopDeals.mockResolvedValue([]);

    const request = new Request('http://localhost/api/top-deals?searchTerms=Spider-Man,Batman');
    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.meta.searchTerms).toEqual(['Spider-Man', 'Batman']);
    expect(mockGetTopDeals).toHaveBeenCalledWith(10, ['Spider-Man', 'Batman']);
  });

  it('should validate minScore parameter', async () => {
    const request = new Request('http://localhost/api/top-deals?minScore=invalid');
    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid minScore parameter');
  });

  it('should validate minScore range', async () => {
    const request = new Request('http://localhost/api/top-deals?minScore=150');
    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid minScore parameter');
  });

  it('should validate empty searchTerms', async () => {
    const request = new Request('http://localhost/api/top-deals?searchTerms=,,,');
    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid searchTerms parameter');
  });

  it('should handle errors from getTopDeals', async () => {
    mockGetTopDeals.mockRejectedValue(new Error('Database error'));

    const request = new Request('http://localhost/api/top-deals');
    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
    expect(data.message).toBe('Database error');
  });

  it('should set appropriate headers', async () => {
    mockGetTopDeals.mockResolvedValue([]);

    const request = new Request('http://localhost/api/top-deals');
    const response = await handler(request);

    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(response.headers.get('Cache-Control')).toBe('no-cache, max-age=300');
  });
});