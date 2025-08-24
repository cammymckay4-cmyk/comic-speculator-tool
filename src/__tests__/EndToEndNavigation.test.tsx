import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import DealCard from '../components/DealCard';
import fixtureData from '../data/fixtures.json';

// Simple test component to capture route params
const RouteCapture = () => {
  const { listingId } = useParams();
  return <div data-testid="route-capture">Route param: {listingId}</div>;
};

// Test app with routing
const TestApp = ({ deal }: { deal: any }) => (
  <BrowserRouter>
    <DealCard deal={deal} />
    <Routes>
      <Route path="/item/:listingId" element={<RouteCapture />} />
    </Routes>
  </BrowserRouter>
);

describe('End-to-End Navigation Tests', () => {
  it('should navigate to correct route when View Deal button is clicked', () => {
    const testDeal = {
      dealScoreId: 'test-deal',
      issueId: fixtureData.deals[0].issue.issueId,
      listingId: fixtureData.deals[0].deal.listingId,
      gradeId: 'cgc-9-4-nm',
      marketValueGBP: 590,
      totalPriceGBP: 455,
      dealScore: 23,
      title: 'Amazing Spider-Man #300',
      savings: 135,
      grade: {
        scale: 'CGC',
        numeric: 9.4,
        label: 'NM'
      },
      series: {
        publisher: 'Marvel Comics'
      }
    };

    render(<TestApp deal={testDeal} />);
    
    // Find the View Deal button
    const viewDealButton = screen.getByRole('button', { name: /view deal/i });
    expect(viewDealButton).toBeInTheDocument();
    
    // The link should have the correct href
    const linkElement = viewDealButton.closest('a');
    expect(linkElement).toHaveAttribute('href', '/item/ebay-uk-asm300-001');
    
    // Click the link (this would navigate in a real browser)
    fireEvent.click(viewDealButton);
    
    // In this test environment, we can't actually test navigation
    // but we've verified the href is correct
  });

  it('should work with all fixture deals', () => {
    fixtureData.deals.forEach((dealData, index) => {
      const deal = {
        dealScoreId: `deal-${index}`,
        issueId: dealData.issue.issueId,
        listingId: dealData.deal.listingId,
        gradeId: dealData.grade.gradeId,
        marketValueGBP: dealData.deal.marketValueGBP,
        totalPriceGBP: dealData.deal.totalPriceGBP,
        dealScore: dealData.deal.dealScore,
        title: `${dealData.series.title} #${dealData.issue.issueNumber}`,
        savings: dealData.deal.marketValueGBP - dealData.deal.totalPriceGBP,
        grade: dealData.grade,
        series: dealData.series
      };

      const { unmount } = render(<TestApp deal={deal} />);
      
      // Find the View Deal button
      const viewDealButton = screen.getByRole('button', { name: /view deal/i });
      const linkElement = viewDealButton.closest('a');
      
      // Should have correct href
      const expectedId = dealData.deal.listingId ?? dealData.issue.issueId;
      expect(linkElement).toHaveAttribute('href', `/item/${expectedId}`);
      
      unmount();
    });
  });
});