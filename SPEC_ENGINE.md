# Spec Engine Module

This module provides advanced speculation and deal scoring capabilities for comic book listings.

## Usage Example

```typescript
import { 
  computeDealScore, 
  type SpecListing, 
  type SpecMarketData, 
  type SpecAnalysisContext 
} from './lib/specEngine';

// Example listing
const listing: SpecListing = {
  listingId: 'ebay-12345',
  issueId: 'asm-300',
  gradeId: 'cgc-9-8',
  price: 100,
  shippingCost: 10,
  title: 'Amazing Spider-Man #300 CGC 9.8',
  source: 'eBay',
  endTime: '2024-01-01T12:00:00Z'
};

// Example market data
const marketData: SpecMarketData = {
  marketValueId: 'market-asm-300-cgc-9-8',
  issueId: 'asm-300',
  gradeId: 'cgc-9-8',
  medianPrice: 200,
  meanPrice: 210,
  sampleCount: 15,
  priceRange: { min: 150, max: 280 },
  volatility: 0.15,
  trend: 'rising',
  confidence: 0.85,
  windowDays: 30,
  lastUpdated: '2024-01-01T00:00:00Z'
};

// Analysis context
const context: SpecAnalysisContext = {
  timeframe: 'medium',
  riskTolerance: 'moderate',
  marketConditions: 'bull'
};

// Compute deal score
const result = computeDealScore(listing, marketData, context);

console.log(`Overall Score: ${result.overallScore}`);
console.log(`Recommendation: ${result.recommendation}`);
console.log(`Value Score: ${result.components.valueScore}`);
console.log(`Flags: ${result.flags.join(', ')}`);
```

## Features

- **Advanced TypeScript types** for all input/output parameters
- **Comprehensive validation** with detailed error messages
- **Multi-component scoring** (value, trend, risk, liquidity)
- **Context-aware recommendations** based on timeframe and risk tolerance
- **Detailed analysis output** with projections and risk factors
- **Extensible design** ready for sophisticated analysis algorithms

## Testing

The module includes 31 comprehensive unit tests covering:
- Basic functionality
- Score calculations
- Recommendation logic
- Context handling
- Error scenarios
- Edge cases

Run tests with: `npm test src/__tests__/specEngine.test.ts`