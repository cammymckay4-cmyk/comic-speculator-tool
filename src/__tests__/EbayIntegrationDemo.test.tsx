import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EbayIntegrationDemo from '../components/EbayIntegrationDemo';
import * as ebayClient from '../lib/ebayClient';

// Mock the eBay client
vi.mock('../lib/ebayClient');

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
  }
}));

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
});

const mockLiveListings = [
  {
    title: 'Amazing Spider-Man #300 CGC 9.8',
    price: 450.00,
    shippingCost: 15.00,
    sellerRating: 99.2,
    endTime: new Date(Date.now() + 86400000).toISOString(),
    url: 'https://www.ebay.co.uk/itm/123456789'
  }
];

const mockSoldListings = [
  {
    salePrice: 425.00,
    shipping: 12.00,
    dateOfSale: new Date(Date.now() - 86400000).toISOString(),
    url: 'https://www.ebay.co.uk/itm/completed/987654321'
  }
];

describe('EbayIntegrationDemo Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle View button click for live listings with URL', async () => {
    vi.mocked(ebayClient.fetchLiveListings).mockResolvedValue(mockLiveListings);
    
    render(<EbayIntegrationDemo />);
    
    // Fetch live listings first
    const fetchButton = screen.getByRole('button', { name: /fetch live listings/i });
    fireEvent.click(fetchButton);
    
    // Wait for listings to appear
    await waitFor(() => {
      expect(screen.getByText(/live listings \(1\)/i)).toBeInTheDocument();
    });
    
    // Find and click the View button
    const viewButton = screen.getByRole('button', { name: /^view$/i });
    fireEvent.click(viewButton);
    
    // Verify window.open was called with correct URL
    expect(mockWindowOpen).toHaveBeenCalledWith(
      'https://www.ebay.co.uk/itm/123456789',
      '_blank'
    );
  });

  it('should handle View Sale button click for sold listings with URL', async () => {
    vi.mocked(ebayClient.fetchSoldListings).mockResolvedValue(mockSoldListings);
    
    render(<EbayIntegrationDemo />);
    
    // Fetch sold listings first
    const fetchButton = screen.getByRole('button', { name: /fetch sold listings/i });
    fireEvent.click(fetchButton);
    
    // Wait for listings to appear
    await waitFor(() => {
      expect(screen.getByText(/recent sales \(1\)/i)).toBeInTheDocument();
    });
    
    // Find and click the View Sale button
    const viewSaleButton = screen.getByRole('button', { name: /view sale/i });
    fireEvent.click(viewSaleButton);
    
    // Verify window.open was called with correct URL
    expect(mockWindowOpen).toHaveBeenCalledWith(
      'https://www.ebay.co.uk/itm/completed/987654321',
      '_blank'
    );
  });

  it('should show info toast when URL is not available', async () => {
    const listingsWithoutUrl = [{
      ...mockLiveListings[0],
      url: ''
    }];
    
    vi.mocked(ebayClient.fetchLiveListings).mockResolvedValue(listingsWithoutUrl);
    
    render(<EbayIntegrationDemo />);
    
    // Fetch live listings first
    const fetchButton = screen.getByRole('button', { name: /fetch live listings/i });
    fireEvent.click(fetchButton);
    
    // Wait for listings to appear
    await waitFor(() => {
      expect(screen.getByText(/live listings \(1\)/i)).toBeInTheDocument();
    });
    
    // Find and click the View button
    const viewButton = screen.getByRole('button', { name: /^view$/i });
    fireEvent.click(viewButton);
    
    // Verify window.open was not called
    expect(mockWindowOpen).not.toHaveBeenCalled();
    
    // Verify info toast was called
    const { toast } = await import('sonner');
    expect(toast.info).toHaveBeenCalledWith('eBay listing URL not available for demo data');
  });

  it('should display live listings correctly', async () => {
    vi.mocked(ebayClient.fetchLiveListings).mockResolvedValue(mockLiveListings);
    
    render(<EbayIntegrationDemo />);
    
    // Fetch live listings first
    const fetchButton = screen.getByRole('button', { name: /fetch live listings/i });
    fireEvent.click(fetchButton);
    
    // Wait for listings to appear and verify content
    await waitFor(() => {
      expect(screen.getByText('Amazing Spider-Man #300 CGC 9.8')).toBeInTheDocument();
      expect(screen.getByText('Price:')).toBeInTheDocument();
      expect(screen.getByText('£450.00')).toBeInTheDocument();
      expect(screen.getByText('Shipping: £15.00')).toBeInTheDocument();
      expect(screen.getByText('99.2% seller')).toBeInTheDocument();
    });
  });

  it('should display sold listings correctly', async () => {
    vi.mocked(ebayClient.fetchSoldListings).mockResolvedValue(mockSoldListings);
    
    render(<EbayIntegrationDemo />);
    
    // Fetch sold listings first
    const fetchButton = screen.getByRole('button', { name: /fetch sold listings/i });
    fireEvent.click(fetchButton);
    
    // Wait for listings to appear and verify content
    await waitFor(() => {
      expect(screen.getByText('Sale Price: £425.00')).toBeInTheDocument();
      expect(screen.getByText('Shipping: £12.00')).toBeInTheDocument();
    });
  });
});