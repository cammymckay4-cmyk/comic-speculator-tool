import { describe, it, expect } from 'vitest';
import { 
  computeDealScore, 
  type SpecListing, 
  type SpecMarketData, 
  type SpecAnalysisContext,
  type SpecDealScore 
} from '../lib/specEngine';

describe('Spec Engine', () => {
  describe('computeDealScore', () => {
    // Test data setup
    const validListing: SpecListing = {
      listingId: 'test-listing-1',
      issueId: 'asm-300',
      gradeId: 'cgc-9-8',
      price: 100,
      shippingCost: 10,
      title: 'Amazing Spider-Man #300 CGC 9.8',
      source: 'eBay',
      endTime: '2024-01-01T12:00:00Z',
      url: 'https://example.com/listing/1'
    };

    const validMarketData: SpecMarketData = {
      marketValueId: 'market-asm-300-cgc-9-8',
      issueId: 'asm-300',
      gradeId: 'cgc-9-8',
      medianPrice: 200,
      meanPrice: 210,
      sampleCount: 15,
      priceRange: {
        min: 150,
        max: 280
      },
      volatility: 0.15,
      trend: 'rising',
      confidence: 0.85,
      windowDays: 30,
      lastUpdated: '2024-01-01T00:00:00Z'
    };

    const defaultContext: SpecAnalysisContext = {
      timeframe: 'medium',
      riskTolerance: 'moderate'
    };

    describe('Basic Functionality', () => {
      it('should compute deal score for valid inputs', () => {
        const result = computeDealScore(validListing, validMarketData, defaultContext);
        
        expect(result).toBeDefined();
        expect(result.scoreId).toMatch(/^spec-test-listing-1-\d+$/);
        expect(result.listingId).toBe('test-listing-1');
        expect(typeof result.overallScore).toBe('number');
        expect(result.overallScore).toBeGreaterThanOrEqual(0);
        expect(result.overallScore).toBeLessThanOrEqual(100);
        expect(result.confidence).toBe(0.85);
        expect(['strong_buy', 'buy', 'hold', 'pass', 'avoid']).toContain(result.recommendation);
      });

      it('should use default context when not provided', () => {
        const result = computeDealScore(validListing, validMarketData);
        
        expect(result).toBeDefined();
        expect(result.analysis.timeToRealization).toBe('6-18 months'); // medium timeframe default
      });

      it('should calculate component scores correctly', () => {
        const result = computeDealScore(validListing, validMarketData, defaultContext);
        
        expect(result.components).toBeDefined();
        expect(typeof result.components.valueScore).toBe('number');
        expect(typeof result.components.trendScore).toBe('number');
        expect(typeof result.components.riskScore).toBe('number');
        expect(typeof result.components.liquidityScore).toBe('number');
        
        // All component scores should be between 0 and 100
        Object.values(result.components).forEach(score => {
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
        });
      });
    });

    describe('Score Calculation', () => {
      it('should calculate high value score for good deals', () => {
        // totalPrice = 110, median = 200, discount = 45%
        const result = computeDealScore(validListing, validMarketData, defaultContext);
        
        expect(result.components.valueScore).toBe(45); // 45% discount
        expect(result.overallScore).toBeGreaterThan(50); // Should be a good score
        expect(result.flags).toContain('EXCELLENT_VALUE');
      });

      it('should calculate low value score for bad deals', () => {
        const expensiveListing: SpecListing = {
          ...validListing,
          price: 180,
          shippingCost: 30
        };
        // totalPrice = 210, median = 200, no discount
        
        const result = computeDealScore(expensiveListing, validMarketData, defaultContext);
        
        expect(result.components.valueScore).toBe(0); // No discount, above market
        expect(result.flags).toContain('ABOVE_MARKET');
      });

      it('should handle exact market price', () => {
        const marketPriceListing: SpecListing = {
          ...validListing,
          price: 180,
          shippingCost: 20
        };
        // totalPrice = 200, exactly at median
        
        const result = computeDealScore(marketPriceListing, validMarketData, defaultContext);
        
        expect(result.components.valueScore).toBe(0); // No discount
        expect(result.flags).not.toContain('ABOVE_MARKET'); // Not above market
      });

      it('should round scores to 2 decimal places', () => {
        const precisionMarket: SpecMarketData = {
          ...validMarketData,
          medianPrice: 3
        };
        
        const precisionListing: SpecListing = {
          ...validListing,
          price: 1,
          shippingCost: 0
        };
        // totalPrice = 1, discount = 66.666...%
        
        const result = computeDealScore(precisionListing, precisionMarket, defaultContext);
        
        expect(result.components.valueScore).toBe(66.67);
        expect(result.overallScore.toString()).toMatch(/^\d+(\.\d{1,2})?$/); // Max 2 decimal places
      });
    });

    describe('Recommendation Logic', () => {
      it('should recommend strong_buy for excellent deals', () => {
        const excellentListing: SpecListing = {
          ...validListing,
          price: 30,
          shippingCost: 5
        };
        // totalPrice = 35, huge discount
        
        const result = computeDealScore(excellentListing, validMarketData, defaultContext);
        
        expect(result.overallScore).toBeGreaterThan(80);
        expect(result.recommendation).toBe('strong_buy');
      });

      it('should recommend avoid for poor deals', () => {
        const poorListing: SpecListing = {
          ...validListing,
          price: 400,
          shippingCost: 100
        };
        
        const poorMarket: SpecMarketData = {
          ...validMarketData,
          confidence: 0.1,
          sampleCount: 1
        };
        
        const result = computeDealScore(poorListing, poorMarket, defaultContext);
        
        expect(result.overallScore).toBeLessThan(40);
        expect(['pass', 'avoid']).toContain(result.recommendation);
      });

      it('should adjust recommendation for conservative risk tolerance', () => {
        const conservativeContext: SpecAnalysisContext = {
          timeframe: 'medium',
          riskTolerance: 'conservative'
        };
        
        const result = computeDealScore(validListing, validMarketData, conservativeContext);
        
        // Conservative should be more cautious than moderate
        expect(['hold', 'pass', 'avoid']).toContain(result.recommendation);
      });
    });

    describe('Context Handling', () => {
      it('should handle different timeframes', () => {
        const shortTerm: SpecAnalysisContext = { timeframe: 'short', riskTolerance: 'moderate' };
        const longTerm: SpecAnalysisContext = { timeframe: 'long', riskTolerance: 'moderate' };
        
        const shortResult = computeDealScore(validListing, validMarketData, shortTerm);
        const longResult = computeDealScore(validListing, validMarketData, longTerm);
        
        expect(shortResult.analysis.timeToRealization).toBe('3-6 months');
        expect(longResult.analysis.timeToRealization).toBe('1-3 years');
      });

      it('should handle market conditions', () => {
        const bullMarketContext: SpecAnalysisContext = {
          timeframe: 'medium',
          riskTolerance: 'moderate',
          marketConditions: 'bull'
        };
        
        const result = computeDealScore(validListing, validMarketData, bullMarketContext);
        
        expect(result).toBeDefined();
        // Future enhancement: should adjust scoring based on market conditions
      });

      it('should handle key events', () => {
        const eventContext: SpecAnalysisContext = {
          timeframe: 'medium',
          riskTolerance: 'moderate',
          keyEvents: ['Movie announcement', 'Character death']
        };
        
        const result = computeDealScore(validListing, validMarketData, eventContext);
        
        expect(result).toBeDefined();
        // Future enhancement: should factor in key events
      });
    });

    describe('Flags and Analysis', () => {
      it('should generate appropriate value flags', () => {
        const testCases = [
          { discount: 35, expectedFlag: 'EXCELLENT_VALUE' },
          { discount: 20, expectedFlag: 'GOOD_VALUE' },
          { discount: 8, expectedFlag: 'FAIR_VALUE' }
        ];
        
        testCases.forEach(({ discount, expectedFlag }) => {
          const testPrice = validMarketData.medianPrice * (1 - discount / 100);
          const testListing: SpecListing = {
            ...validListing,
            price: testPrice,
            shippingCost: 0
          };
          
          const result = computeDealScore(testListing, validMarketData, defaultContext);
          expect(result.flags).toContain(expectedFlag);
        });
      });

      it('should flag low sample size', () => {
        const lowSampleMarket: SpecMarketData = {
          ...validMarketData,
          sampleCount: 3
        };
        
        const result = computeDealScore(validListing, lowSampleMarket, defaultContext);
        
        expect(result.flags).toContain('LOW_SAMPLE_SIZE');
      });

      it('should flag low confidence', () => {
        const lowConfidenceMarket: SpecMarketData = {
          ...validMarketData,
          confidence: 0.6
        };
        
        const result = computeDealScore(validListing, lowConfidenceMarket, defaultContext);
        
        expect(result.flags).toContain('LOW_CONFIDENCE');
      });

      it('should flag market trends', () => {
        const risingMarket: SpecMarketData = { ...validMarketData, trend: 'rising' };
        const fallingMarket: SpecMarketData = { ...validMarketData, trend: 'falling' };
        
        const risingResult = computeDealScore(validListing, risingMarket, defaultContext);
        const fallingResult = computeDealScore(validListing, fallingMarket, defaultContext);
        
        expect(risingResult.flags).toContain('RISING_TREND');
        expect(fallingResult.flags).toContain('FALLING_TREND');
      });

      it('should provide comprehensive analysis data', () => {
        const result = computeDealScore(validListing, validMarketData, defaultContext);
        
        expect(result.analysis).toBeDefined();
        expect(typeof result.analysis.currentValue).toBe('number');
        expect(typeof result.analysis.projectedValue).toBe('number');
        expect(typeof result.analysis.timeToRealization).toBe('string');
        expect(Array.isArray(result.analysis.riskFactors)).toBe(true);
        expect(Array.isArray(result.analysis.opportunities)).toBe(true);
        expect(result.analysis.riskFactors.length).toBeGreaterThan(0);
        expect(result.analysis.opportunities.length).toBeGreaterThan(0);
      });

      it('should include proper metadata', () => {
        const result = computeDealScore(validListing, validMarketData, defaultContext);
        
        expect(result.metadata).toBeDefined();
        expect(result.metadata.computedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
        expect(result.metadata.engineVersion).toBe('1.0.0-stub');
        expect(result.metadata.analysisType).toBe('comprehensive');
      });
    });

    describe('Error Handling', () => {
      it('should throw error for missing listing', () => {
        expect(() => {
          // @ts-expect-error Testing invalid input
          computeDealScore(null, validMarketData, defaultContext);
        }).toThrow('Both listing and marketData are required');
      });

      it('should throw error for missing market data', () => {
        expect(() => {
          // @ts-expect-error Testing invalid input
          computeDealScore(validListing, null, defaultContext);
        }).toThrow('Both listing and marketData are required');
      });

      it('should throw error for invalid price', () => {
        const invalidListing: SpecListing = {
          ...validListing,
          price: -10
        };
        
        expect(() => {
          computeDealScore(invalidListing, validMarketData, defaultContext);
        }).toThrow('Listing price must be a non-negative number');
      });

      it('should throw error for invalid shipping cost', () => {
        const invalidListing: SpecListing = {
          ...validListing,
          shippingCost: -5
        };
        
        expect(() => {
          computeDealScore(invalidListing, validMarketData, defaultContext);
        }).toThrow('Shipping cost must be a non-negative number');
      });

      it('should throw error for invalid median price', () => {
        const invalidMarket: SpecMarketData = {
          ...validMarketData,
          medianPrice: 0
        };
        
        expect(() => {
          computeDealScore(validListing, invalidMarket, defaultContext);
        }).toThrow('Market median price must be a positive number');
      });

      it('should throw error for invalid sample count', () => {
        const invalidMarket: SpecMarketData = {
          ...validMarketData,
          sampleCount: -1
        };
        
        expect(() => {
          computeDealScore(validListing, invalidMarket, defaultContext);
        }).toThrow('Sample count must be a non-negative number');
      });

      it('should throw error for non-numeric price', () => {
        const invalidListing: SpecListing = {
          ...validListing,
          // @ts-expect-error Testing invalid input
          price: 'not a number'
        };
        
        expect(() => {
          computeDealScore(invalidListing, validMarketData, defaultContext);
        }).toThrow('Listing price must be a non-negative number');
      });
    });

    describe('Edge Cases', () => {
      it('should handle zero price and shipping', () => {
        const freeListing: SpecListing = {
          ...validListing,
          price: 0,
          shippingCost: 0
        };
        
        const result = computeDealScore(freeListing, validMarketData, defaultContext);
        
        expect(result.components.valueScore).toBe(100); // 100% discount
        expect(result.flags).toContain('EXCELLENT_VALUE');
        expect(result.recommendation).toBe('strong_buy');
      });

      it('should handle very small market prices', () => {
        const smallMarket: SpecMarketData = {
          ...validMarketData,
          medianPrice: 0.01
        };
        
        const smallListing: SpecListing = {
          ...validListing,
          price: 0.005,
          shippingCost: 0.002
        };
        
        const result = computeDealScore(smallListing, smallMarket, defaultContext);
        
        expect(result.components.valueScore).toBe(30); // 30% discount
        expect(result).toBeDefined();
      });

      it('should handle maximum values', () => {
        const maxMarket: SpecMarketData = {
          ...validMarketData,
          medianPrice: Number.MAX_SAFE_INTEGER / 2,
          sampleCount: 1000
        };
        
        const result = computeDealScore(validListing, maxMarket, defaultContext);
        
        expect(result).toBeDefined();
        expect(result.components.valueScore).toBe(100); // Tiny fraction of max value
      });

      it('should handle all risk tolerance levels', () => {
        const riskLevels: SpecAnalysisContext['riskTolerance'][] = ['conservative', 'moderate', 'aggressive'];
        
        riskLevels.forEach(riskTolerance => {
          const context: SpecAnalysisContext = { timeframe: 'medium', riskTolerance };
          const result = computeDealScore(validListing, validMarketData, context);
          
          expect(result).toBeDefined();
          expect(['strong_buy', 'buy', 'hold', 'pass', 'avoid']).toContain(result.recommendation);
        });
      });

      it('should handle all timeframes', () => {
        const timeframes: SpecAnalysisContext['timeframe'][] = ['short', 'medium', 'long'];
        const expectedRealizations = ['3-6 months', '6-18 months', '1-3 years'];
        
        timeframes.forEach((timeframe, index) => {
          const context: SpecAnalysisContext = { timeframe, riskTolerance: 'moderate' };
          const result = computeDealScore(validListing, validMarketData, context);
          
          expect(result.analysis.timeToRealization).toBe(expectedRealizations[index]);
        });
      });
    });
  });
});