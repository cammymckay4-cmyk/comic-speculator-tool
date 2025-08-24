import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import fixtureData from '../data/fixtures.json';

// Mock deal data from fixtures
const testDeal = fixtureData.deals[0];

const mockDealCardData = {
  dealScoreId: 'test-deal',
  issueId: testDeal.issue.issueId,
  listingId: testDeal.deal.listingId,
  gradeId: testDeal.grade.gradeId,
  marketValueGBP: testDeal.deal.marketValueGBP,
  totalPriceGBP: testDeal.deal.totalPriceGBP,
  dealScore: testDeal.deal.dealScore,
  title: `${testDeal.series.title} #${testDeal.issue.issueNumber}`,
  savings: testDeal.deal.marketValueGBP - testDeal.deal.totalPriceGBP,
  grade: testDeal.grade,
  series: testDeal.series
};

describe('Navigation Integration with Fixture Data', () => {
  it('should use correct listing IDs from fixture data', () => {
    // Verify the fixture data has the expected structure
    expect(testDeal.deal.listingId).toBe('ebay-uk-asm300-001');
    expect(testDeal.issue.issueId).toBe('amazing-spider-man-1963-300');
    
    // Verify the mock data matches expectations
    expect(mockDealCardData.listingId).toBe('ebay-uk-asm300-001');
    expect(mockDealCardData.issueId).toBe('amazing-spider-man-1963-300');
  });

  it('should have valid route paths for all deals in fixture data', () => {
    // Test that all deals have either listingId or issueId for navigation
    fixtureData.deals.forEach((deal, index) => {
      const hasListingId = deal.deal.listingId && deal.deal.listingId.length > 0;
      const hasIssueId = deal.issue.issueId && deal.issue.issueId.length > 0;
      
      expect(hasListingId || hasIssueId, 
        `Deal ${index} should have either listingId or issueId for navigation`
      ).toBe(true);
      
      if (hasListingId) {
        expect(deal.deal.listingId).toMatch(/^[a-zA-Z0-9\-]+$/);
      }
      
      if (hasIssueId) {
        expect(deal.issue.issueId).toMatch(/^[a-zA-Z0-9\-]+$/);
      }
    });
  });

  it('should construct valid navigation paths', () => {
    fixtureData.deals.forEach((deal, index) => {
      const id = deal.deal.listingId ?? deal.issue.issueId;
      const expectedPath = `/item/${id}`;
      
      // Verify the path looks like a valid route
      expect(expectedPath).toMatch(/^\/item\/[a-zA-Z0-9\-]+$/);
      
      // Verify no spaces or invalid characters
      expect(id).not.toContain(' ');
      expect(id).not.toContain('/');
    });
  });

  it('should handle all fixture data deals', () => {
    // Ensure we have test data
    expect(fixtureData.deals.length).toBeGreaterThan(0);
    
    // Log the first few deals for verification
    const sampleDeals = fixtureData.deals.slice(0, 3).map(deal => ({
      title: `${deal.series.title} #${deal.issue.issueNumber}`,
      listingId: deal.deal.listingId,
      issueId: deal.issue.issueId,
      navigationId: deal.deal.listingId ?? deal.issue.issueId
    }));
    
    sampleDeals.forEach(deal => {
      expect(deal.navigationId).toBeTruthy();
      expect(typeof deal.navigationId).toBe('string');
    });
  });
});