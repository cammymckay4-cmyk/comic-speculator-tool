import { Listing, MarketValue, DealScoreInfo } from './types';
import fixtureData from '../data/fixtures.json';

/**
 * Fetches current live listings for comic books
 * @param searchTerms - Array of search terms to query
 * @returns Promise of array of listings
 */
export async function fetchLiveListings(searchTerms: string[]): Promise<Listing[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // For MVP, generate mock listings based on fixture data
  const mockListings: Listing[] = [];
  
  // Create listings from existing deal scores in fixture data
  fixtureData.dealScores.forEach((dealScore, index) => {
    const issue = fixtureData.issues.find(i => i.issueId === dealScore.issueId);
    const series = fixtureData.series.find(s => s.seriesId === issue?.seriesId);
    
    if (issue && series) {
      const title = `${series.title} #${issue.issueNumber}`;
      
      // Only include if title matches search terms (or no search terms provided)
      const matchesSearch = searchTerms.length === 0 || searchTerms.some(term => 
        title.toLowerCase().includes(term.toLowerCase()) ||
        series.title.toLowerCase().includes(term.toLowerCase())
      );
      
      if (matchesSearch) {
        mockListings.push({
          listingId: dealScore.listingId,
          issueId: dealScore.issueId,
          gradeId: dealScore.gradeId,
          title,
          totalPriceGBP: dealScore.totalPriceGBP,
          source: 'eBay UK',
          endTime: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          url: `https://ebay.co.uk/itm/${dealScore.listingId.replace('ebay-uk-', '')}`
        });
      }
    }
  });
  
  return mockListings;
}

/**
 * Fetches sold listings for market analysis
 * @param issueId - The comic issue ID
 * @param gradeId - The grade ID
 * @param windowDays - Number of days to look back
 * @returns Promise of array of sold listings
 */
export async function fetchSoldListings(issueId: string, gradeId: string, windowDays: number = 30): Promise<Listing[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // For MVP, return mock sold listings based on market value sample count
  const marketValue = fixtureData.marketValues.find(
    mv => mv.issueId === issueId && mv.gradeId === gradeId && mv.windowDays === windowDays
  );
  
  if (!marketValue) {
    return [];
  }
  
  const soldListings: Listing[] = [];
  const issue = fixtureData.issues.find(i => i.issueId === issueId);
  const series = fixtureData.series.find(s => s.seriesId === issue?.seriesId);
  
  if (issue && series) {
    const title = `${series.title} #${issue.issueNumber}`;
    
    // Generate mock sold listings based on sample count
    for (let i = 0; i < marketValue.sampleCount; i++) {
      // Generate prices around the mean with some variation
      const priceVariation = (Math.random() - 0.5) * 0.3; // ±15% variation
      const price = Math.max(
        marketValue.minGBP,
        Math.min(
          marketValue.maxGBP,
          marketValue.meanGBP * (1 + priceVariation)
        )
      );
      
      soldListings.push({
        listingId: `sold-${issueId}-${gradeId}-${i}`,
        issueId,
        gradeId,
        title,
        totalPriceGBP: Math.round(price * 100) / 100,
        source: 'eBay UK',
        endTime: new Date(Date.now() - Math.random() * windowDays * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }
  
  return soldListings;
}

/**
 * Calculates market value from sold listings
 * @param soldListings - Array of sold listings
 * @returns Market value information
 */
export async function calculateMarketValue(soldListings: Listing[]): Promise<MarketValue | null> {
  if (soldListings.length === 0) {
    return null;
  }
  
  const prices = soldListings.map(listing => listing.totalPriceGBP).sort((a, b) => a - b);
  const sum = prices.reduce((acc, price) => acc + price, 0);
  const mean = sum / prices.length;
  
  // Calculate median
  const median = prices.length % 2 === 0
    ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
    : prices[Math.floor(prices.length / 2)];
  
  // Calculate standard deviation
  const variance = prices.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) / prices.length;
  const stdDev = Math.sqrt(variance);
  
  const firstListing = soldListings[0];
  
  return {
    marketValueId: `calculated-${firstListing.issueId}-${firstListing.gradeId}-30d`,
    issueId: firstListing.issueId,
    gradeId: firstListing.gradeId,
    windowDays: 30,
    sampleCount: soldListings.length,
    medianGBP: Math.round(median * 100) / 100,
    meanGBP: Math.round(mean * 100) / 100,
    stdDevGBP: Math.round(stdDev * 100) / 100,
    minGBP: Math.min(...prices),
    maxGBP: Math.max(...prices),
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Computes deal score for a listing compared to market value
 * @param listing - The listing to evaluate
 * @param marketValue - The market value to compare against
 * @returns Deal score information
 */
export async function computeDealScore(listing: Listing, marketValue: MarketValue): Promise<DealScoreInfo> {
  // Calculate deal score as percentage savings
  const savingsGBP = marketValue.medianGBP - listing.totalPriceGBP;
  const score = Math.round((savingsGBP / marketValue.medianGBP) * 100);
  
  return {
    dealScoreId: `computed-${listing.listingId}-${Date.now()}`,
    listingId: listing.listingId,
    issueId: listing.issueId,
    gradeId: listing.gradeId,
    marketValueGBP: marketValue.medianGBP,
    totalPriceGBP: listing.totalPriceGBP,
    score: Math.max(0, score), // Ensure score is not negative
    computedAt: new Date().toISOString()
  };
}