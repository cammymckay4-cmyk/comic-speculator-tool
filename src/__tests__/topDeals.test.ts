import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTopDeals } from '../lib/topDeals';
import * as marketData from '../lib/marketData';
import { Listing, MarketValue, DealScoreInfo } from '../lib/types';

// Mock the marketData module
vi.mock('../lib/marketData');

// Create typed mocks
const mockFetchLiveListings = vi.mocked(marketData.fetchLiveListings);
const mockFetchSoldListings = vi.mocked(marketData.fetchSoldListings);
const mockCalculateMarketValue = vi.mocked(marketData.calculateMarketValue);
const mockComputeDealScore = vi.mocked(marketData.computeDealScore);

describe('getTopDeals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array when no listings are found', async () => {
    // Arrange
    mockFetchLiveListings.mockResolvedValue([]);

    // Act
    const result = await getTopDeals(10);

    // Assert
    expect(result).toEqual([]);
    expect(mockFetchLiveListings).toHaveBeenCalledWith([
      'Amazing Spider-Man',
      'Batman',
      'X-Men',
      'Superman',
      'Fantastic Four',
      'Avengers',
      'Iron Man',
      'Thor',
      'Captain America',
      'Hulk'
    ]);
  });

  it('should filter out deals below minimum score', async () => {
    // Arrange
    const mockListings: Listing[] = [
      {
        listingId: 'listing-1',
        issueId: 'asm-300',
        gradeId: 'cgc-9-4',
        title: 'Amazing Spider-Man #300',
        totalPriceGBP: 200,
        source: 'eBay'
      },
      {
        listingId: 'listing-2', 
        issueId: 'batman-181',
        gradeId: 'cgc-8-5',
        title: 'Batman #181',
        totalPriceGBP: 300,
        source: 'eBay'
      }
    ];

    const mockSoldListings: Listing[] = [
      {
        listingId: 'sold-1',
        issueId: 'asm-300',
        gradeId: 'cgc-9-4',
        title: 'Amazing Spider-Man #300',
        totalPriceGBP: 250,
        source: 'eBay'
      }
    ];

    const mockMarketValue: MarketValue = {
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
    };

    const mockDealScore1: DealScoreInfo = {
      dealScoreId: 'deal-1',
      listingId: 'listing-1',
      issueId: 'asm-300',
      gradeId: 'cgc-9-4',
      marketValueGBP: 250,
      totalPriceGBP: 200,
      score: 20, // Above threshold
      computedAt: '2024-01-01T00:00:00Z'
    };

    const mockDealScore2: DealScoreInfo = {
      dealScoreId: 'deal-2',
      listingId: 'listing-2',
      issueId: 'batman-181',
      gradeId: 'cgc-8-5',
      marketValueGBP: 350,
      totalPriceGBP: 300,
      score: 5, // Below threshold
      computedAt: '2024-01-01T00:00:00Z'
    };

    mockFetchLiveListings.mockResolvedValue(mockListings);
    mockFetchSoldListings.mockResolvedValue(mockSoldListings);
    mockCalculateMarketValue.mockResolvedValue(mockMarketValue);
    mockComputeDealScore
      .mockResolvedValueOnce(mockDealScore1)
      .mockResolvedValueOnce(mockDealScore2);

    // Act
    const result = await getTopDeals(10);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].dealScore.score).toBe(20);
    expect(result[0].listing.listingId).toBe('listing-1');
  });

  it('should sort deals by score in descending order', async () => {
    // Arrange
    const mockListings: Listing[] = [
      {
        listingId: 'listing-1',
        issueId: 'asm-300',
        gradeId: 'cgc-9-4',
        title: 'Amazing Spider-Man #300',
        totalPriceGBP: 200,
        source: 'eBay'
      },
      {
        listingId: 'listing-2',
        issueId: 'batman-181',
        gradeId: 'cgc-8-5',
        title: 'Batman #181',
        totalPriceGBP: 300,
        source: 'eBay'
      },
      {
        listingId: 'listing-3',
        issueId: 'xmen-1',
        gradeId: 'cgc-9-8',
        title: 'X-Men #1',
        totalPriceGBP: 1000,
        source: 'eBay'
      }
    ];

    const mockSoldListings: Listing[] = [
      {
        listingId: 'sold-1',
        issueId: 'test',
        gradeId: 'test',
        title: 'Test',
        totalPriceGBP: 250,
        source: 'eBay'
      }
    ];

    const mockMarketValue: MarketValue = {
      marketValueId: 'mv-1',
      issueId: 'test',
      gradeId: 'test',
      windowDays: 30,
      sampleCount: 5,
      medianGBP: 250,
      meanGBP: 250,
      minGBP: 200,
      maxGBP: 300,
      lastUpdated: '2024-01-01T00:00:00Z'
    };

    // Deal scores: 15%, 25%, 35%
    const mockDealScores: DealScoreInfo[] = [
      {
        dealScoreId: 'deal-1',
        listingId: 'listing-1',
        issueId: 'asm-300',
        gradeId: 'cgc-9-4',
        marketValueGBP: 250,
        totalPriceGBP: 200,
        score: 15,
        computedAt: '2024-01-01T00:00:00Z'
      },
      {
        dealScoreId: 'deal-2',
        listingId: 'listing-2',
        issueId: 'batman-181',
        gradeId: 'cgc-8-5',
        marketValueGBP: 400,
        totalPriceGBP: 300,
        score: 25,
        computedAt: '2024-01-01T00:00:00Z'
      },
      {
        dealScoreId: 'deal-3',
        listingId: 'listing-3',
        issueId: 'xmen-1',
        gradeId: 'cgc-9-8',
        marketValueGBP: 1500,
        totalPriceGBP: 1000,
        score: 35,
        computedAt: '2024-01-01T00:00:00Z'
      }
    ];

    mockFetchLiveListings.mockResolvedValue(mockListings);
    mockFetchSoldListings.mockResolvedValue(mockSoldListings);
    mockCalculateMarketValue.mockResolvedValue(mockMarketValue);
    mockComputeDealScore
      .mockResolvedValueOnce(mockDealScores[0])
      .mockResolvedValueOnce(mockDealScores[1])
      .mockResolvedValueOnce(mockDealScores[2]);

    // Act
    const result = await getTopDeals(10);

    // Assert
    expect(result).toHaveLength(3);
    expect(result[0].dealScore.score).toBe(35); // Highest score first
    expect(result[1].dealScore.score).toBe(25);
    expect(result[2].dealScore.score).toBe(15); // Lowest score last
  });

  it('should limit results to top 10 deals', async () => {
    // Arrange - create 15 mock listings
    const mockListings: Listing[] = Array.from({ length: 15 }, (_, i) => ({
      listingId: `listing-${i}`,
      issueId: `issue-${i}`,
      gradeId: 'cgc-9-4',
      title: `Comic #${i}`,
      totalPriceGBP: 100,
      source: 'eBay'
    }));

    const mockSoldListings: Listing[] = [
      {
        listingId: 'sold-1',
        issueId: 'test',
        gradeId: 'test',
        title: 'Test',
        totalPriceGBP: 150,
        source: 'eBay'
      }
    ];

    const mockMarketValue: MarketValue = {
      marketValueId: 'mv-1',
      issueId: 'test',
      gradeId: 'test',
      windowDays: 30,
      sampleCount: 5,
      medianGBP: 150,
      meanGBP: 150,
      minGBP: 100,
      maxGBP: 200,
      lastUpdated: '2024-01-01T00:00:00Z'
    };

    mockFetchLiveListings.mockResolvedValue(mockListings);
    mockFetchSoldListings.mockResolvedValue(mockSoldListings);
    mockCalculateMarketValue.mockResolvedValue(mockMarketValue);

    // Mock deal scores with varying values
    mockListings.forEach((_, i) => {
      const dealScore: DealScoreInfo = {
        dealScoreId: `deal-${i}`,
        listingId: `listing-${i}`,
        issueId: `issue-${i}`,
        gradeId: 'cgc-9-4',
        marketValueGBP: 150,
        totalPriceGBP: 100,
        score: 20 + i, // Scores from 20 to 34
        computedAt: '2024-01-01T00:00:00Z'
      };
      mockComputeDealScore.mockResolvedValueOnce(dealScore);
    });

    // Act
    const result = await getTopDeals(10);

    // Assert
    expect(result).toHaveLength(10); // Should be limited to 10
    expect(result[0].dealScore.score).toBe(34); // Highest score
    expect(result[9].dealScore.score).toBe(25); // 10th highest score
  });

  it('should skip deals when market value cannot be calculated', async () => {
    // Arrange
    const mockListings: Listing[] = [
      {
        listingId: 'listing-1',
        issueId: 'asm-300',
        gradeId: 'cgc-9-4',
        title: 'Amazing Spider-Man #300',
        totalPriceGBP: 200,
        source: 'eBay'
      }
    ];

    mockFetchLiveListings.mockResolvedValue(mockListings);
    mockFetchSoldListings.mockResolvedValue([]); // No sold listings
    mockCalculateMarketValue.mockResolvedValue(null); // Cannot calculate

    // Act
    const result = await getTopDeals(10);

    // Assert
    expect(result).toEqual([]);
    expect(mockComputeDealScore).not.toHaveBeenCalled();
  });

  it('should handle custom search terms', async () => {
    // Arrange
    const customSearchTerms = ['Spider-Man', 'X-Men'];
    mockFetchLiveListings.mockResolvedValue([]);

    // Act
    await getTopDeals(10, customSearchTerms);

    // Assert
    expect(mockFetchLiveListings).toHaveBeenCalledWith(customSearchTerms);
  });

  it('should handle errors gracefully', async () => {
    // Arrange
    mockFetchLiveListings.mockRejectedValue(new Error('Network error'));

    // Act & Assert
    await expect(getTopDeals(10)).rejects.toThrow('Failed to retrieve top deals: Network error');
  });

  it('should skip individual listings that cause errors', async () => {
    // Arrange
    const mockListings: Listing[] = [
      {
        listingId: 'listing-1',
        issueId: 'asm-300',
        gradeId: 'cgc-9-4',
        title: 'Amazing Spider-Man #300',
        totalPriceGBP: 200,
        source: 'eBay'
      },
      {
        listingId: 'listing-2',
        issueId: 'batman-181',
        gradeId: 'cgc-8-5',
        title: 'Batman #181',
        totalPriceGBP: 300,
        source: 'eBay'
      }
    ];

    const mockSoldListings: Listing[] = [
      {
        listingId: 'sold-1',
        issueId: 'test',
        gradeId: 'test',
        title: 'Test',
        totalPriceGBP: 250,
        source: 'eBay'
      }
    ];

    const mockMarketValue: MarketValue = {
      marketValueId: 'mv-1',
      issueId: 'test',
      gradeId: 'test',
      windowDays: 30,
      sampleCount: 5,
      medianGBP: 250,
      meanGBP: 250,
      minGBP: 200,
      maxGBP: 300,
      lastUpdated: '2024-01-01T00:00:00Z'
    };

    const mockDealScore: DealScoreInfo = {
      dealScoreId: 'deal-2',
      listingId: 'listing-2',
      issueId: 'batman-181',
      gradeId: 'cgc-8-5',
      marketValueGBP: 400,
      totalPriceGBP: 300,
      score: 25,
      computedAt: '2024-01-01T00:00:00Z'
    };

    mockFetchLiveListings.mockResolvedValue(mockListings);
    mockFetchSoldListings
      .mockRejectedValueOnce(new Error('Sold listings error')) // First listing fails
      .mockResolvedValueOnce(mockSoldListings); // Second listing succeeds
    mockCalculateMarketValue.mockResolvedValue(mockMarketValue);
    mockComputeDealScore.mockResolvedValue(mockDealScore);

    // Act
    const result = await getTopDeals(10);

    // Assert
    expect(result).toHaveLength(1); // Only successful listing
    expect(result[0].listing.listingId).toBe('listing-2');
  });
});