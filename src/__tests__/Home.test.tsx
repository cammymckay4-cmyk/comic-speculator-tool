import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../pages/Home';

// Mock the fixture data
vi.mock('../data/fixtures.json', () => ({
  default: {
    deals: [
      {
        series: { title: "The Amazing Spider-Man" },
        issue: { issueId: "asm-300", issueNumber: "300" },
        grade: { scale: "CGC", numeric: 9.4, label: "NM" },
        deal: {
          listingId: "test-1",
          totalPriceGBP: 455,
          marketValueGBP: 590,
          dealScore: 23
        }
      },
      {
        series: { title: "The X-Men" },
        issue: { issueId: "xmen-1", issueNumber: "1" },
        grade: { scale: "Raw", numeric: null, label: "GD 2.0" },
        deal: {
          listingId: "test-2",
          totalPriceGBP: 2300,
          marketValueGBP: 2750,
          dealScore: 16
        }
      },
      {
        series: { title: "Batman" },
        issue: { issueId: "batman-181", issueNumber: "181" },
        grade: { scale: "CGC", numeric: 8.5, label: "VF+" },
        deal: {
          listingId: "test-3",
          totalPriceGBP: 760,
          marketValueGBP: 925,
          dealScore: 18
        }
      }
    ]
  }
}));

// Mock navigation component
vi.mock('../components/Navigation', () => ({
  default: () => <div data-testid="navigation">Navigation</div>
}));

// Mock table and card components
vi.mock('../components/DealTable', () => ({
  default: ({ deals }: { deals: any[] }) => (
    <div data-testid="deal-table">Deal Table with {deals.length} deals</div>
  )
}));

vi.mock('../components/DealCard', () => ({
  default: ({ deal }: { deal: any }) => (
    <div data-testid="deal-card">{deal.title}</div>
  )
}));

describe('Home Component Enhanced Statistics', () => {
  it('should display correct total listings count', () => {
    render(<Home />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Total Listings')).toBeInTheDocument();
  });

  it('should display correct total savings', () => {
    render(<Home />);
    expect(screen.getByText('£750.00')).toBeInTheDocument();
    expect(screen.getByText('Potential Savings')).toBeInTheDocument();
  });

  it('should display correct average listing price', () => {
    render(<Home />);
    expect(screen.getByText('£1,171.67')).toBeInTheDocument();
    expect(screen.getByText('Avg. Listing Price')).toBeInTheDocument();
  });

  it('should display correct average deal score', () => {
    render(<Home />);
    expect(screen.getByText('19%')).toBeInTheDocument();
    expect(screen.getByText('Avg. Deal Score')).toBeInTheDocument();
  });

  it('should display correct average market value', () => {
    render(<Home />);
    expect(screen.getByText('£1,421.67')).toBeInTheDocument();
    expect(screen.getByText('Average Market Value')).toBeInTheDocument();
  });

  it('should display the best deal correctly', () => {
    render(<Home />);
    // The best deal should be Amazing Spider-Man #300 with 23% score
    expect(screen.getByText('23%')).toBeInTheDocument();
    expect(screen.getByText('The Amazing Spider-Man #300')).toBeInTheDocument();
    expect(screen.getByText('Save £135.00')).toBeInTheDocument();
  });

  it('should show all statistics cards', () => {
    render(<Home />);
    expect(screen.getByText('Total Listings')).toBeInTheDocument();
    expect(screen.getByText('Potential Savings')).toBeInTheDocument();
    expect(screen.getByText('Avg. Listing Price')).toBeInTheDocument();
    expect(screen.getByText('Avg. Deal Score')).toBeInTheDocument();
    expect(screen.getByText('Average Market Value')).toBeInTheDocument();
    expect(screen.getByText('Best Deal')).toBeInTheDocument();
  });
});