import { describe, it, expect } from 'vitest';
import { computeDealScore, type Listing, type MarketValue } from '../lib/dealScore';

describe('DealScore Service', () => {
  describe('computeDealScore', () => {
    // Test data setup
    const validListing: Listing = {
      price: 100,
      shippingCost: 10,
    };

    const validMarketValue: MarketValue = {
      median: 200,
      sampleCount: 10,
      lowConfidence: false,
    };

    describe('Score Calculation', () => {
      it('should calculate correct score for good deal', () => {
        // totalPrice = 100 + 10 = 110
        // score = 100 * (1 - 110/200) = 100 * (1 - 0.55) = 45
        const result = computeDealScore(validListing, validMarketValue);
        
        expect(result.score).toBe(45);
        expect(result.priceAboveMarket).toBe(false);
        expect(result.lowData).toBe(false);
        expect(result.flags).toContain('GOOD_DEAL');
      });

      it('should calculate correct score for excellent deal', () => {
        const cheapListing: Listing = {
          price: 50,
          shippingCost: 10,
        };
        // totalPrice = 50 + 10 = 60
        // score = 100 * (1 - 60/200) = 100 * (1 - 0.3) = 70
        const result = computeDealScore(cheapListing, validMarketValue);
        
        expect(result.score).toBe(70);
        expect(result.flags).toContain('EXCELLENT_DEAL');
      });

      it('should calculate correct score for bad deal', () => {
        const expensiveListing: Listing = {
          price: 180,
          shippingCost: 30,
        };
        // totalPrice = 180 + 30 = 210
        // score = 100 * (1 - 210/200) = 100 * (1 - 1.05) = -5
        // clamped to 0
        const result = computeDealScore(expensiveListing, validMarketValue);
        
        expect(result.score).toBe(0);
        expect(result.priceAboveMarket).toBe(true);
        expect(result.flags).toContain('POOR_DEAL');
        expect(result.flags).toContain('ABOVE_MARKET');
      });

      it('should clamp score to maximum 100', () => {
        const freeListing: Listing = {
          price: 0,
          shippingCost: 0,
        };
        // totalPrice = 0
        // score = 100 * (1 - 0/200) = 100
        const result = computeDealScore(freeListing, validMarketValue);
        
        expect(result.score).toBe(100);
        expect(result.flags).toContain('EXCELLENT_DEAL');
      });

      it('should handle price exactly equal to median', () => {
        const equalPriceListing: Listing = {
          price: 180,
          shippingCost: 20,
        };
        // totalPrice = 200 (equals median)
        // score = 100 * (1 - 200/200) = 0
        const result = computeDealScore(equalPriceListing, validMarketValue);
        
        expect(result.score).toBe(0);
        expect(result.priceAboveMarket).toBe(false);
        expect(result.flags).toContain('POOR_DEAL');
      });
    });

    describe('Low Data Detection', () => {
      it('should set lowData flag when lowConfidence is true', () => {
        const lowConfidenceMarket: MarketValue = {
          median: 200,
          sampleCount: 10,
          lowConfidence: true,
        };
        
        const result = computeDealScore(validListing, lowConfidenceMarket);
        
        expect(result.lowData).toBe(true);
        expect(result.flags).toContain('LOW_CONFIDENCE');
        expect(result.notes).toContain('Market data has low confidence');
      });

      it('should set lowData flag when sampleCount < 5', () => {
        const lowSampleMarket: MarketValue = {
          median: 200,
          sampleCount: 3,
          lowConfidence: false,
        };
        
        const result = computeDealScore(validListing, lowSampleMarket);
        
        expect(result.lowData).toBe(true);
        expect(result.flags).toContain('LOW_SAMPLE_SIZE');
        expect(result.notes).toContain('Small sample size: 3 items');
      });

      it('should set lowData flag when both conditions are true', () => {
        const lowDataMarket: MarketValue = {
          median: 200,
          sampleCount: 2,
          lowConfidence: true,
        };
        
        const result = computeDealScore(validListing, lowDataMarket);
        
        expect(result.lowData).toBe(true);
        expect(result.flags).toContain('LOW_CONFIDENCE');
        expect(result.flags).toContain('LOW_SAMPLE_SIZE');
        expect(result.notes).toContain('Market data has low confidence');
        expect(result.notes).toContain('Small sample size: 2 items');
      });

      it('should not set lowData flag when conditions are not met', () => {
        const goodDataMarket: MarketValue = {
          median: 200,
          sampleCount: 5,
          lowConfidence: false,
        };
        
        const result = computeDealScore(validListing, goodDataMarket);
        
        expect(result.lowData).toBe(false);
        expect(result.flags).not.toContain('LOW_CONFIDENCE');
        expect(result.flags).not.toContain('LOW_SAMPLE_SIZE');
      });
    });

    describe('Price Above Market Detection', () => {
      it('should set priceAboveMarket when total price exceeds median', () => {
        const expensiveListing: Listing = {
          price: 190,
          shippingCost: 20,
        };
        // totalPrice = 210 > 200 (median)
        
        const result = computeDealScore(expensiveListing, validMarketValue);
        
        expect(result.priceAboveMarket).toBe(true);
        expect(result.flags).toContain('ABOVE_MARKET');
        expect(result.notes).toContain('Price exceeds market median');
      });

      it('should not set priceAboveMarket when total price is below median', () => {
        const cheapListing: Listing = {
          price: 90,
          shippingCost: 10,
        };
        // totalPrice = 100 < 200 (median)
        
        const result = computeDealScore(validListing, validMarketValue);
        
        expect(result.priceAboveMarket).toBe(false);
        expect(result.flags).not.toContain('ABOVE_MARKET');
      });
    });

    describe('Deal Quality Flags', () => {
      it('should flag fair deals (0 < score < 25)', () => {
        const fairDealListing: Listing = {
          price: 160,
          shippingCost: 20,
        };
        // totalPrice = 180, score = 100 * (1 - 180/200) = 10
        
        const result = computeDealScore(fairDealListing, validMarketValue);
        
        expect(result.score).toBe(10);
        expect(result.flags).toContain('FAIR_DEAL');
      });

      it('should flag good deals (25 <= score < 50)', () => {
        // validListing gives score = 45
        const result = computeDealScore(validListing, validMarketValue);
        
        expect(result.score).toBe(45);
        expect(result.flags).toContain('GOOD_DEAL');
      });

      it('should flag excellent deals (score >= 50)', () => {
        const excellentListing: Listing = {
          price: 80,
          shippingCost: 10,
        };
        // totalPrice = 90, score = 100 * (1 - 90/200) = 55
        
        const result = computeDealScore(excellentListing, validMarketValue);
        
        expect(result.score).toBe(55);
        expect(result.flags).toContain('EXCELLENT_DEAL');
      });

      it('should flag poor deals (score = 0)', () => {
        const poorListing: Listing = {
          price: 220,
          shippingCost: 30,
        };
        // totalPrice = 250, score clamped to 0
        
        const result = computeDealScore(poorListing, validMarketValue);
        
        expect(result.score).toBe(0);
        expect(result.flags).toContain('POOR_DEAL');
      });
    });

    describe('Error Handling', () => {
      it('should throw error for null listing', () => {
        expect(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          computeDealScore(null as any, validMarketValue);
        }).toThrow('Listing and marketValue are required');
      });

      it('should throw error for undefined listing', () => {
        expect(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          computeDealScore(undefined as any, validMarketValue);
        }).toThrow('Listing and marketValue are required');
      });

      it('should throw error for null marketValue', () => {
        expect(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          computeDealScore(validListing, null as any);
        }).toThrow('Listing and marketValue are required');
      });

      it('should throw error for undefined marketValue', () => {
        expect(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          computeDealScore(validListing, undefined as any);
        }).toThrow('Listing and marketValue are required');
      });

      it('should throw error for non-numeric listing price', () => {
        const invalidListing = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          price: 'invalid' as any,
          shippingCost: 10,
        };
        
        expect(() => {
          computeDealScore(invalidListing, validMarketValue);
        }).toThrow('Listing price and shippingCost must be numbers');
      });

      it('should throw error for non-numeric shipping cost', () => {
        const invalidListing = {
          price: 100,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          shippingCost: null as any,
        };
        
        expect(() => {
          computeDealScore(invalidListing, validMarketValue);
        }).toThrow('Listing price and shippingCost must be numbers');
      });

      it('should throw error for negative price', () => {
        const invalidListing = {
          price: -10,
          shippingCost: 5,
        };
        
        expect(() => {
          computeDealScore(invalidListing, validMarketValue);
        }).toThrow('Listing price and shippingCost must be non-negative');
      });

      it('should throw error for negative shipping cost', () => {
        const invalidListing = {
          price: 100,
          shippingCost: -5,
        };
        
        expect(() => {
          computeDealScore(invalidListing, validMarketValue);
        }).toThrow('Listing price and shippingCost must be non-negative');
      });

      it('should throw error for non-numeric median', () => {
        const invalidMarket = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          median: 'invalid' as any,
          sampleCount: 10,
          lowConfidence: false,
        };
        
        expect(() => {
          computeDealScore(validListing, invalidMarket);
        }).toThrow('MarketValue median and sampleCount must be numbers');
      });

      it('should throw error for non-numeric sample count', () => {
        const invalidMarket = {
          median: 200,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sampleCount: '10' as any,
          lowConfidence: false,
        };
        
        expect(() => {
          computeDealScore(validListing, invalidMarket);
        }).toThrow('MarketValue median and sampleCount must be numbers');
      });

      it('should throw error for zero median', () => {
        const invalidMarket = {
          median: 0,
          sampleCount: 10,
          lowConfidence: false,
        };
        
        expect(() => {
          computeDealScore(validListing, invalidMarket);
        }).toThrow('MarketValue median must be positive');
      });

      it('should throw error for negative median', () => {
        const invalidMarket = {
          median: -100,
          sampleCount: 10,
          lowConfidence: false,
        };
        
        expect(() => {
          computeDealScore(validListing, invalidMarket);
        }).toThrow('MarketValue median must be positive');
      });

      it('should throw error for negative sample count', () => {
        const invalidMarket = {
          median: 200,
          sampleCount: -5,
          lowConfidence: false,
        };
        
        expect(() => {
          computeDealScore(validListing, invalidMarket);
        }).toThrow('MarketValue sampleCount must be non-negative');
      });
    });

    describe('Edge Cases', () => {
      it('should handle zero price and shipping', () => {
        const freeListing: Listing = {
          price: 0,
          shippingCost: 0,
        };
        
        const result = computeDealScore(freeListing, validMarketValue);
        
        expect(result.score).toBe(100);
        expect(result.priceAboveMarket).toBe(false);
        expect(result.lowData).toBe(false);
      });

      it('should handle very small median values', () => {
        const smallMedianMarket: MarketValue = {
          median: 0.01,
          sampleCount: 10,
          lowConfidence: false,
        };
        
        const smallListing: Listing = {
          price: 0.005,
          shippingCost: 0.002,
        };
        // totalPrice = 0.007, score = 100 * (1 - 0.007/0.01) = 30
        
        const result = computeDealScore(smallListing, smallMedianMarket);
        
        expect(result.score).toBe(30);
        expect(result.flags).toContain('GOOD_DEAL');
      });

      it('should round score to 2 decimal places', () => {
        const precisionMarket: MarketValue = {
          median: 3,
          sampleCount: 10,
          lowConfidence: false,
        };
        
        const precisionListing: Listing = {
          price: 1,
          shippingCost: 0,
        };
        // totalPrice = 1, score = 100 * (1 - 1/3) = 66.66666...
        
        const result = computeDealScore(precisionListing, precisionMarket);
        
        expect(result.score).toBe(66.67);
      });
    });
  });
});