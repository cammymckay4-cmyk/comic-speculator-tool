import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import DealCard from '../components/DealCard';

// Mock deal data based on fixture structure
const mockDeal = {
  dealScoreId: 'test-deal-1',
  issueId: 'amazing-spider-man-1963-300',
  listingId: 'ebay-uk-asm300-001',
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

// Helper function to render component with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('DealCard Navigation', () => {
  it('should render View Deal button with correct navigation link', () => {
    renderWithRouter(<DealCard deal={mockDeal} />);
    
    // Find the View Deal button
    const viewDealButton = screen.getByRole('button', { name: /view deal/i });
    expect(viewDealButton).toBeInTheDocument();
    
    // Check that it's wrapped in a Link with correct href
    const linkElement = viewDealButton.closest('a');
    expect(linkElement).toHaveAttribute('href', '/item/ebay-uk-asm300-001');
  });

  it('should render Details button with correct navigation link', () => {
    renderWithRouter(<DealCard deal={mockDeal} />);
    
    // Find the Details button
    const detailsButton = screen.getByRole('button', { name: /details/i });
    expect(detailsButton).toBeInTheDocument();
    
    // Check that it's wrapped in a Link with correct href
    const linkElement = detailsButton.closest('a');
    expect(linkElement).toHaveAttribute('href', '/item/ebay-uk-asm300-001');
  });

  it('should fallback to issueId when listingId is not available', () => {
    const dealWithoutListingId = {
      ...mockDeal,
      listingId: undefined
    };
    
    renderWithRouter(<DealCard deal={dealWithoutListingId} />);
    
    // Both buttons should link to the issueId instead
    const viewDealButton = screen.getByRole('button', { name: /view deal/i });
    const detailsButton = screen.getByRole('button', { name: /details/i });
    
    const viewLinkElement = viewDealButton.closest('a');
    const detailsLinkElement = detailsButton.closest('a');
    
    expect(viewLinkElement).toHaveAttribute('href', '/item/amazing-spider-man-1963-300');
    expect(detailsLinkElement).toHaveAttribute('href', '/item/amazing-spider-man-1963-300');
  });

  it('should display deal information correctly', () => {
    renderWithRouter(<DealCard deal={mockDeal} />);
    
    // Check that the deal information is displayed
    expect(screen.getByText('Amazing Spider-Man #300')).toBeInTheDocument();
    expect(screen.getByText('23% off')).toBeInTheDocument();
    expect(screen.getByText('£455.00')).toBeInTheDocument();
    expect(screen.getByText('£590.00')).toBeInTheDocument();
    expect(screen.getByText('£135.00')).toBeInTheDocument();
    expect(screen.getByText('Marvel Comics')).toBeInTheDocument();
    expect(screen.getByText('CGC 9.4')).toBeInTheDocument();
  });
});