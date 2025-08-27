import { describe, it, expect } from 'vitest';
import { formatGBP } from '../lib/format';
import { parseTitle } from '../lib/normaliser';
import fixtureData from '../data/fixtures.json';

describe('Additional Feature Tests', () => {
  describe('Format Utilities', () => {
    it('should format GBP currency correctly', () => {
      expect(formatGBP(123.45)).toBe('£123.45');
      expect(formatGBP(0)).toBe('£0.00');
      expect(formatGBP(1000)).toBe('£1,000.00');
      expect(formatGBP(1234.5)).toBe('£1,234.50');
    });

    it('should handle edge cases in formatting', () => {
      expect(formatGBP(0.1)).toBe('£0.10');
      expect(formatGBP(999.99)).toBe('£999.99');
      expect(formatGBP(10000.01)).toBe('£10,000.01');
    });
  });

  describe('Data Integrity', () => {
    it('should have valid fixture data structure', () => {
      expect(fixtureData).toBeDefined();
      expect(fixtureData.series).toBeInstanceOf(Array);
      expect(fixtureData.issues).toBeInstanceOf(Array);
      expect(fixtureData.grades).toBeInstanceOf(Array);
      expect(fixtureData.marketValues).toBeInstanceOf(Array);
      expect(fixtureData.dealScores).toBeInstanceOf(Array);
    });

    it('should have consistent issue and series relationships', () => {
      const seriesIds = fixtureData.series.map(s => s.seriesId);
      
      fixtureData.issues.forEach(issue => {
        expect(seriesIds).toContain(issue.seriesId);
        expect(issue.issueId).toBe(`${issue.seriesId}-${issue.issueNumber}`);
      });
    });

    it('should have valid market value data', () => {
      fixtureData.marketValues.forEach(mv => {
        expect(mv.sampleCount).toBeGreaterThan(0);
        expect(mv.medianGBP).toBeGreaterThan(0);
        expect(mv.meanGBP).toBeGreaterThan(0);
        expect(mv.minGBP).toBeGreaterThanOrEqual(0);
        expect(mv.maxGBP).toBeGreaterThan(mv.minGBP);
      });
    });
  });

  describe('Title Parsing Edge Cases', () => {
    it('should handle various comic title formats consistently', () => {
      const testCases = [
        {
          title: 'Amazing Spider-Man #1',
          expectedSeries: 'amazing-spider-man-1963',
          expectedIssue: '1'
        },
        {
          title: 'Batman #181 First Poison Ivy',
          expectedSeries: 'batman-1940',
          expectedIssue: '181'
        },
        {
          title: 'X-Men #101 Classic Issue',
          expectedSeries: 'x-men-1963',
          expectedIssue: '101'
        }
      ];

      testCases.forEach(({ title, expectedSeries, expectedIssue }) => {
        const result = parseTitle(title);
        expect(result.seriesId).toBe(expectedSeries);
        expect(result.issueNumber).toBe(expectedIssue);
      });
    });

    it('should assign confidence scores appropriately', () => {
      const highConfidenceTitle = 'Amazing Spider-Man #300 CGC 9.8 NM/MT';
      const lowConfidenceTitle = 'some random comic title 123';

      const highResult = parseTitle(highConfidenceTitle);
      const lowResult = parseTitle(lowConfidenceTitle);

      expect(highResult.confidence).toBeGreaterThan(0.8);
      expect(lowResult.confidence).toBeLessThan(0.6);
    });
  });

  describe('API Contract Validation', () => {
    it('should have consistent data types across fixtures', () => {
      // Verify all IDs are strings
      fixtureData.series.forEach(s => {
        expect(typeof s.seriesId).toBe('string');
        expect(typeof s.title).toBe('string');
        expect(typeof s.publisher).toBe('string');
        expect(typeof s.startYear).toBe('number');
      });

      fixtureData.issues.forEach(i => {
        expect(typeof i.issueId).toBe('string');
        expect(typeof i.seriesId).toBe('string');
        expect(typeof i.issueNumber).toBe('string');
      });

      fixtureData.grades.forEach(g => {
        expect(typeof g.gradeId).toBe('string');
        expect(typeof g.scale).toBe('string');
        expect(typeof g.label).toBe('string');
      });
    });

    it('should have valid price data', () => {
      fixtureData.deals.forEach(deal => {
        expect(typeof deal.deal.totalPriceGBP).toBe('number');
        expect(deal.deal.totalPriceGBP).toBeGreaterThan(0);
        expect(typeof deal.deal.marketValueGBP).toBe('number');
        expect(deal.deal.marketValueGBP).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance Characteristics', () => {
    it('should parse titles efficiently', () => {
      const titles = [
        'Amazing Spider-Man #300 CGC 9.8',
        'Batman #181 CGC 9.4',
        'X-Men #101 CGC 9.2',
        'Fantastic Four #1 CGC 9.6',
        'Iron Man #1 CGC 9.4'
      ];

      const startTime = performance.now();
      
      titles.forEach(title => {
        parseTitle(title);
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should parse multiple titles in under 10ms
      expect(duration).toBeLessThan(10);
    });
  });
});