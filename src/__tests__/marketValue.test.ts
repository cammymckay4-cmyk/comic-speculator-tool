import { describe, it, expect, beforeEach } from 'vitest';
import { calculateMarketValue, Sale, MarketValue } from '../lib/marketValue';

describe('Market Value Aggregation Service', () => {
  let mockSales: Sale[];
  let recentDate: Date;
  let oldDate: Date;

  beforeEach(() => {
    // Set up dates for testing
    recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 5); // 5 days ago
    
    oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 40); // 40 days ago (outside 30-day window)

    // Sample sales data for testing
    mockSales = [
      { salePrice: 100, shipping: 10, date: recentDate },
      { salePrice: 150, shipping: 15, date: recentDate },
      { salePrice: 200, shipping: 20, date: recentDate },
      { salePrice: 120, shipping: 12, date: recentDate },
      { salePrice: 180, shipping: 18, date: recentDate },
    ];
  });

  describe('calculateMarketValue', () => {
    it('should calculate correct market value for valid sales data', () => {
      const result = calculateMarketValue(mockSales);

      expect(result.sampleCount).toBe(5);
      expect(result.lowConfidence).toBe(false); // sampleCount of 5 is NOT < 5, so should be false
      expect(result.median).toBe(165); // Middle value: [110, 132, 165, 198, 220] -> 165
      expect(result.mean).toBe(165); // (110 + 132 + 165 + 198 + 220) / 5 = 165
      expect(result.min).toBe(110);
      expect(result.max).toBe(220);
      expect(result.stdDev).toBeGreaterThan(0);
      expect(result.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO format
    });

    it('should correctly identify low confidence when sampleCount < 5', () => {
      const smallSales = mockSales.slice(0, 3);
      const result = calculateMarketValue(smallSales);

      expect(result.sampleCount).toBe(3);
      expect(result.lowConfidence).toBe(true);
    });

    it('should not flag low confidence when sampleCount >= 5', () => {
      const largeSales = [
        ...mockSales,
        { salePrice: 160, shipping: 16, date: recentDate },
        { salePrice: 140, shipping: 14, date: recentDate }
      ];
      const result = calculateMarketValue(largeSales);

      expect(result.sampleCount).toBe(7);
      expect(result.lowConfidence).toBe(false);
    });

    it('should filter sales to specified time window', () => {
      const salesWithOldData = [
        ...mockSales,
        { salePrice: 300, shipping: 30, date: oldDate }, // This should be filtered out
        { salePrice: 350, shipping: 35, date: oldDate }  // This should be filtered out
      ];

      const result = calculateMarketValue(salesWithOldData, 30);
      
      // Only the recent sales should be used for calculation
      expect(result.median).toBe(165); // Should be same as original since old data filtered out
      expect(result.sampleCount).toBe(7); // But original sample count includes all
    });

    it('should exclude top and bottom 10% for trimmed calculations with large dataset', () => {
      // Create a larger dataset to test trimming
      const largeSales: Sale[] = [];
      for (let i = 1; i <= 20; i++) {
        largeSales.push({
          salePrice: i * 10,
          shipping: i,
          date: recentDate
        });
      }
      // Totals will be: 11, 22, 33, ..., 220 (20 values)
      // Bottom 10% (2 values): 11, 22 should be excluded
      // Top 10% (2 values): 209, 220 should be excluded
      // Remaining: 33, 44, 55, ..., 198 (16 values)

      const result = calculateMarketValue(largeSales);
      
      expect(result.sampleCount).toBe(20);
      expect(result.min).toBe(33); // First value after trimming bottom 10%
      expect(result.max).toBe(198); // Last value after trimming top 10%
    });

    it('should handle string dates correctly', () => {
      const salesWithStringDates = mockSales.map(sale => ({
        ...sale,
        date: sale.date.toISOString()
      }));

      const result = calculateMarketValue(salesWithStringDates);
      expect(result.sampleCount).toBe(5);
      expect(result.median).toBe(165);
    });

    it('should calculate correct median for even number of elements', () => {
      const evenSales = mockSales.slice(0, 4); // 4 sales
      const result = calculateMarketValue(evenSales);
      
      // Sorted totals: [110, 132, 165, 198]
      // Median of even count: (132 + 165) / 2 = 148.5
      expect(result.median).toBe(148.5);
    });

    it('should calculate correct median for odd number of elements', () => {
      const result = calculateMarketValue(mockSales); // 5 sales
      
      // Sorted totals: [110, 132, 165, 198, 220]
      // Median of odd count: 165 (middle element)
      expect(result.median).toBe(165);
    });

    it('should calculate standard deviation correctly', () => {
      // Use a simple dataset where we can verify the calculation
      const simpleSales: Sale[] = [
        { salePrice: 10, shipping: 0, date: recentDate },
        { salePrice: 20, shipping: 0, date: recentDate },
        { salePrice: 30, shipping: 0, date: recentDate }
      ];
      
      const result = calculateMarketValue(simpleSales);
      
      // Values: [10, 20, 30], mean = 20
      // Variance = ((10-20)² + (20-20)² + (30-20)²) / (3-1) = (100 + 0 + 100) / 2 = 100
      // StdDev = sqrt(100) = 10
      expect(result.mean).toBe(20);
      expect(result.stdDev).toBe(10);
    });

    it('should handle single sale without trimming', () => {
      const singleSale = [mockSales[0]];
      const result = calculateMarketValue(singleSale);
      
      expect(result.sampleCount).toBe(1);
      expect(result.lowConfidence).toBe(true);
      expect(result.median).toBe(110);
      expect(result.mean).toBe(110);
      expect(result.min).toBe(110);
      expect(result.max).toBe(110);
      expect(result.stdDev).toBe(0); // Single value has no deviation
    });
  });

  describe('Error Handling', () => {
    it('should throw error for empty sales array', () => {
      expect(() => calculateMarketValue([])).toThrow('Sales array cannot be empty');
    });

    it('should throw error for non-array input', () => {
      expect(() => calculateMarketValue(null as any)).toThrow('Sales must be an array');
      expect(() => calculateMarketValue(undefined as any)).toThrow('Sales must be an array');
      expect(() => calculateMarketValue({} as any)).toThrow('Sales must be an array');
    });

    it('should throw error for invalid window days', () => {
      expect(() => calculateMarketValue(mockSales, 0)).toThrow('Window days must be greater than 0');
      expect(() => calculateMarketValue(mockSales, -5)).toThrow('Window days must be greater than 0');
    });

    it('should throw error when no valid sales in time window', () => {
      const oldSales = mockSales.map(sale => ({
        ...sale,
        date: oldDate
      }));

      expect(() => calculateMarketValue(oldSales, 30))
        .toThrow('No valid sales found within the specified time window');
    });

    it('should filter out sales with invalid prices', () => {
      const invalidSales: Sale[] = [
        { salePrice: -10, shipping: 10, date: recentDate }, // Negative price
        { salePrice: 0, shipping: 10, date: recentDate },   // Zero price
        { salePrice: 100, shipping: -5, date: recentDate }, // Negative shipping
        { salePrice: 150, shipping: 15, date: recentDate }, // Valid sale
        { salePrice: 200, shipping: 20, date: recentDate }  // Valid sale
      ];

      const result = calculateMarketValue(invalidSales);
      
      // Should only process the 2 valid sales
      expect(result.sampleCount).toBe(5); // Original count includes all
      // But calculations should be based on only 2 valid sales
      expect(result.median).toBe(192.5); // (165 + 220) / 2
    });

    it('should filter out sales with invalid dates', () => {
      const invalidDateSales: Sale[] = [
        { salePrice: 100, shipping: 10, date: 'invalid-date' },
        { salePrice: 150, shipping: 15, date: recentDate },
        { salePrice: 200, shipping: 20, date: new Date('invalid') }
      ];

      const result = calculateMarketValue(invalidDateSales);
      
      // Should only process the 1 valid sale
      expect(result.sampleCount).toBe(3); // Original count
      expect(result.median).toBe(165); // Only valid sale: 150 + 15
    });

    it('should filter out sales with malformed structure', () => {
      const malformedSales: Sale[] = [
        { salePrice: 'invalid' as any, shipping: 10, date: recentDate },
        { salePrice: 150, shipping: 'invalid' as any, date: recentDate },
        { salePrice: 200, shipping: 20, date: recentDate } // Valid
      ];

      const result = calculateMarketValue(malformedSales);
      
      expect(result.sampleCount).toBe(3);
      expect(result.median).toBe(220); // Only valid sale: 200 + 20
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small dataset without trimming', () => {
      const tinyDataset = mockSales.slice(0, 2);
      const result = calculateMarketValue(tinyDataset);
      
      // With < 10 samples, no trimming should occur
      expect(result.min).toBe(110); // 100 + 10
      expect(result.max).toBe(165); // 150 + 15
      expect(result.median).toBe(137.5); // (110 + 165) / 2
    });

    it('should handle dataset with identical values', () => {
      const identicalSales: Sale[] = Array(5).fill(null).map(() => ({
        salePrice: 100,
        shipping: 10,
        date: recentDate
      }));

      const result = calculateMarketValue(identicalSales);
      
      expect(result.median).toBe(110);
      expect(result.mean).toBe(110);
      expect(result.min).toBe(110);
      expect(result.max).toBe(110);
      expect(result.stdDev).toBe(0);
    });

    it('should handle custom window days parameter', () => {
      const customWindowDate = new Date();
      customWindowDate.setDate(customWindowDate.getDate() - 8); // 8 days ago

      const salesWithCustomWindow = [
        { salePrice: 100, shipping: 10, date: recentDate }, // 5 days ago - included
        { salePrice: 150, shipping: 15, date: customWindowDate }, // 8 days ago - excluded with 7-day window
      ];

      const result7Days = calculateMarketValue(salesWithCustomWindow, 7);
      const result10Days = calculateMarketValue(salesWithCustomWindow, 10);

      expect(result7Days.median).toBe(110); // Only first sale
      expect(result10Days.median).toBe(137.5); // Both sales: (110 + 165) / 2
    });
  });
});