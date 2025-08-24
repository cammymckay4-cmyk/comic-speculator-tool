/**
 * DealScore Service - Computes deal scores for comic book listings
 * As per PRD requirements
 */

export interface Listing {
  price: number;
  shippingCost: number;
}

export interface MarketValue {
  median: number;
  sampleCount: number;
  lowConfidence?: boolean;
}

export interface DealScoreInfo {
  score: number;
  lowData: boolean;
  priceAboveMarket: boolean;
  flags?: string[];
  notes?: string;
}

/**
 * Computes a deal score for a comic book listing based on market value
 * @param listing - The listing with price and shipping cost
 * @param marketValue - Market value data with median, sample count, and confidence
 * @returns DealScoreInfo with score, flags, and metadata
 */
export function computeDealScore(listing: Listing, marketValue: MarketValue): DealScoreInfo {
  // Error handling for undefined or null inputs
  if (!listing || !marketValue) {
    throw new Error('Listing and marketValue are required');
  }

  if (typeof listing.price !== 'number' || typeof listing.shippingCost !== 'number') {
    throw new Error('Listing price and shippingCost must be numbers');
  }

  if (typeof marketValue.median !== 'number' || typeof marketValue.sampleCount !== 'number') {
    throw new Error('MarketValue median and sampleCount must be numbers');
  }

  if (listing.price < 0 || listing.shippingCost < 0) {
    throw new Error('Listing price and shippingCost must be non-negative');
  }

  if (marketValue.median <= 0) {
    throw new Error('MarketValue median must be positive');
  }

  if (marketValue.sampleCount < 0) {
    throw new Error('MarketValue sampleCount must be non-negative');
  }

  // Compute total price
  const totalPrice = listing.price + listing.shippingCost;

  // Calculate raw score: 100 * (1 - totalPrice / marketValue.median)
  const rawScore = 100 * (1 - totalPrice / marketValue.median);

  // Clamp score to range 0-100
  const score = Math.max(0, Math.min(100, rawScore));

  // Set lowData flag
  const lowData = marketValue.lowConfidence === true || marketValue.sampleCount < 5;

  // Set priceAboveMarket flag
  const priceAboveMarket = totalPrice > marketValue.median;

  // Prepare flags and notes
  const flags: string[] = [];
  const notes: string[] = [];

  if (lowData) {
    if (marketValue.lowConfidence) {
      flags.push('LOW_CONFIDENCE');
      notes.push('Market data has low confidence');
    }
    if (marketValue.sampleCount < 5) {
      flags.push('LOW_SAMPLE_SIZE');
      notes.push(`Small sample size: ${marketValue.sampleCount} items`);
    }
  }

  if (priceAboveMarket) {
    flags.push('ABOVE_MARKET');
    notes.push('Price exceeds market median');
  }

  if (score >= 50) {
    flags.push('EXCELLENT_DEAL');
  } else if (score >= 25) {
    flags.push('GOOD_DEAL');
  } else if (score > 0) {
    flags.push('FAIR_DEAL');
  } else {
    flags.push('POOR_DEAL');
  }

  return {
    score: Math.round(score * 100) / 100, // Round to 2 decimal places
    lowData,
    priceAboveMarket,
    flags: flags.length > 0 ? flags : undefined,
    notes: notes.length > 0 ? notes.join('; ') : undefined,
  };
}