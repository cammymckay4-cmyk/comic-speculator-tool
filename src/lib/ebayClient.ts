/**
 * eBay ingestion module for Comic Scout project
 * Provides functions to fetch live listings and sold listings from eBay UK
 */

// Type definitions for eBay data structures
export interface Listing {
  title: string;
  price: number; // Price in GBP
  shippingCost: number; // Shipping cost in GBP
  sellerRating: number; // Seller feedback percentage (0-100)
  endTime: string; // ISO date string for auction end time
  url: string; // Direct URL to the eBay listing
}

export interface Sale {
  salePrice: number; // Final sale price in GBP
  shipping: number; // Shipping cost in GBP
  dateOfSale: string; // ISO date string for sale completion
  url: string; // Direct URL to the completed listing
}

/**
 * Fetches live eBay UK listings for the given search term
 * Uses eBay's public endpoints where possible, with fallback to HTML scraping
 * 
 * @param searchTerm - The search query for eBay listings
 * @returns Promise resolving to array of Listing objects
 */
export async function fetchLiveListings(searchTerm: string): Promise<Listing[]> {
  try {
    // Validate input
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new Error('Search term is required');
    }

    // For now, return mock data to demonstrate the interface
    // In production, this would make actual API calls to eBay
    const mockListings: Listing[] = [
      {
        title: `${searchTerm} - Amazing Spider-Man #300 CGC 9.8`,
        price: 450.00,
        shippingCost: 15.00,
        sellerRating: 99.2,
        endTime: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
        url: 'https://www.ebay.co.uk/itm/123456789'
      },
      {
        title: `${searchTerm} - X-Men #101 Raw VF+`,
        price: 125.00,
        shippingCost: 8.50,
        sellerRating: 98.7,
        endTime: new Date(Date.now() + 86400000 * 1).toISOString(), // 1 day from now
        url: 'https://www.ebay.co.uk/itm/987654321'
      }
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return mockListings;
  } catch (error) {
    console.error('Error fetching live listings:', error);
    // Return empty array on error to maintain function contract
    return [];
  }
}

/**
 * Fetches sold listings in the UK for a specific comic issue and grade
 * within the specified time window
 * 
 * @param issueId - Unique identifier for the comic issue
 * @param gradeId - Grading identifier (e.g., "CGC-9.8", "raw-vf")
 * @param windowDays - Number of days to look back for completed sales
 * @returns Promise resolving to array of Sale objects
 */
export async function fetchSoldListings(
  issueId: string,
  gradeId: string,
  windowDays: number
): Promise<Sale[]> {
  try {
    // Validate inputs
    if (!issueId || issueId.trim().length === 0) {
      throw new Error('Issue ID is required');
    }
    if (!gradeId || gradeId.trim().length === 0) {
      throw new Error('Grade ID is required');
    }
    if (windowDays <= 0 || windowDays > 365) {
      throw new Error('Window days must be between 1 and 365');
    }

    // For now, return mock data to demonstrate the interface
    // In production, this would make actual API calls to eBay's sold listings
    const mockSales: Sale[] = [
      {
        salePrice: 425.00,
        shipping: 12.00,
        dateOfSale: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        url: 'https://www.ebay.co.uk/itm/111222333'
      },
      {
        salePrice: 439.99,
        shipping: 15.50,
        dateOfSale: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        url: 'https://www.ebay.co.uk/itm/444555666'
      },
      {
        salePrice: 410.00,
        shipping: 10.00,
        dateOfSale: new Date(Date.now() - 86400000 * 8).toISOString(), // 8 days ago
        url: 'https://www.ebay.co.uk/itm/777888999'
      }
    ];

    // Filter mock data based on windowDays parameter
    const cutoffDate = new Date(Date.now() - windowDays * 86400000);
    const filteredSales = mockSales.filter(sale => 
      new Date(sale.dateOfSale) >= cutoffDate
    );

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 750));

    return filteredSales;
  } catch (error) {
    console.error('Error fetching sold listings:', error);
    // Return empty array on error to maintain function contract
    return [];
  }
}

/**
 * Helper function to construct eBay search URLs for manual testing
 * This is not part of the main API but useful for development
 */
export function constructEbaySearchUrl(searchTerm: string, soldOnly = false): string {
  const baseUrl = 'https://www.ebay.co.uk/sch/i.html';
  const params = new URLSearchParams({
    '_nkw': searchTerm,
    '_sacat': '0', // All categories
    '_sop': '12', // Sort by ending soonest for live listings, recently ended for sold
    'LH_PrefLoc': '1', // UK only
  });

  if (soldOnly) {
    params.set('LH_Sold', '1');
    params.set('LH_Complete', '1');
  }

  return `${baseUrl}?${params.toString()}`;
}