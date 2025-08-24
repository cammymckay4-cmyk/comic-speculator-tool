import { TopDeal, Listing, MarketValue, DealScoreInfo } from './types';
import { parseTitle } from './normaliser';
import { 
  fetchLiveListings, 
  fetchSoldListings, 
  calculateMarketValue, 
  computeDealScore 
} from './marketData';

/**
 * Default search terms for finding comic deals
 */
const DEFAULT_SEARCH_TERMS = [
  'Amazing Spider-Man',
  'Batman',
  'X-Men',
  'Superman',
  'Fantastic Four',
  'Avengers',
  'Iron Man',
  'Thor',
  'Captain America',
  'Hulk'
];

/**
 * Aggregates and returns the top comic book deals based on deal score
 * @param minScore - Minimum deal score threshold (default: 10)
 * @param searchTerms - Array of search terms to query (optional)
 * @returns Promise of array of top deals sorted by deal score
 */
export async function getTopDeals(
  minScore: number = 10,
  searchTerms: string[] = DEFAULT_SEARCH_TERMS
): Promise<TopDeal[]> {
  try {
    console.log(`Fetching top deals with minScore: ${minScore}, searchTerms:`, searchTerms);
    
    // Step 1: Retrieve current live listings
    const listings = await fetchLiveListings(searchTerms);
    console.log(`Found ${listings.length} live listings`);
    
    if (listings.length === 0) {
      return [];
    }
    
    // Step 2: Process each listing to compute deal scores
    const dealPromises = listings.map(async (listing): Promise<TopDeal | null> => {
      try {
        // Parse title to identify series and issue (for additional validation)
        const parsedTitle = parseTitle(listing.title);
        console.log(`Processing listing: ${listing.title} -> ${parsedTitle.series} #${parsedTitle.issueNumber}`);
        
        // Step 3: Fetch recent sales for market value calculation
        const soldListings = await fetchSoldListings(listing.issueId, listing.gradeId);
        
        if (soldListings.length === 0) {
          console.log(`No sold listings found for ${listing.issueId} (${listing.gradeId}), skipping`);
          return null; // Skip deals without market data
        }
        
        // Step 4: Calculate market value
        const marketValue = await calculateMarketValue(soldListings);
        
        if (!marketValue) {
          console.log(`Could not calculate market value for ${listing.issueId}, skipping`);
          return null;
        }
        
        // Step 5: Compute deal score
        const dealScore = await computeDealScore(listing, marketValue);
        
        // Step 6: Filter by minimum score
        if (dealScore.score < minScore) {
          console.log(`Deal score ${dealScore.score} below threshold ${minScore}, skipping`);
          return null;
        }
        
        return {
          listing,
          marketValue,
          dealScore
        };
        
      } catch (error) {
        console.error(`Error processing listing ${listing.listingId}:`, error);
        return null; // Skip problematic listings
      }
    });
    
    // Wait for all deal computations to complete
    const deals = await Promise.all(dealPromises);
    
    // Filter out null results and sort by deal score (descending)
    const validDeals = deals
      .filter((deal): deal is TopDeal => deal !== null)
      .sort((a, b) => b.dealScore.score - a.dealScore.score);
    
    console.log(`Found ${validDeals.length} valid deals after filtering`);
    
    // Return top 10 deals
    const topDeals = validDeals.slice(0, 10);
    
    console.log(`Returning top ${topDeals.length} deals:`, 
      topDeals.map(d => `${d.listing.title}: ${d.dealScore.score}%`)
    );
    
    return topDeals;
    
  } catch (error) {
    console.error('Error in getTopDeals:', error);
    throw new Error(`Failed to retrieve top deals: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}