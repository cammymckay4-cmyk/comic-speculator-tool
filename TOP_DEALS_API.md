# Top Deals API Documentation

## Overview

The Top Deals aggregator analyzes comic book listings to identify the best deals based on market value and savings potential. It provides both a programmatic API and a JavaScript function for integration.

## API Endpoint

### GET `/api/top-deals`

Retrieves the top comic book deals sorted by deal score percentage.

#### Query Parameters

- `minScore` (optional): Minimum deal score threshold (0-100). Default: 10
- `searchTerms` (optional): Comma-separated list of search terms to filter comics. Default: uses predefined popular series

#### Example Requests

```bash
# Get top deals with default settings (minimum 10% savings)
curl "http://localhost:3000/api/top-deals"

# Get deals with higher threshold (minimum 20% savings)
curl "http://localhost:3000/api/top-deals?minScore=20"

# Search for specific series
curl "http://localhost:3000/api/top-deals?searchTerms=Spider-Man,Batman&minScore=15"
```

#### Response Format

```json
{
  "success": true,
  "data": [
    {
      "listing": {
        "listingId": "ebay-uk-567890123",
        "issueId": "amazing-spider-man-1963-129",
        "gradeId": "raw-nm",
        "title": "The Amazing Spider-Man #129",
        "totalPriceGBP": 68,
        "source": "eBay UK",
        "endTime": "2024-01-15T18:30:00Z",
        "url": "https://ebay.co.uk/itm/567890123"
      },
      "marketValue": {
        "marketValueId": "calculated-amazing-spider-man-1963-129-raw-nm-30d",
        "issueId": "amazing-spider-man-1963-129",
        "gradeId": "raw-nm",
        "windowDays": 30,
        "sampleCount": 15,
        "medianGBP": 107.95,
        "meanGBP": 102.5,
        "stdDevGBP": 12.75,
        "minGBP": 75,
        "maxGBP": 125,
        "lastUpdated": "2024-01-10T14:30:00Z"
      },
      "dealScore": {
        "dealScoreId": "computed-ebay-uk-567890123-1641826200000",
        "listingId": "ebay-uk-567890123",
        "issueId": "amazing-spider-man-1963-129",
        "gradeId": "raw-nm",
        "marketValueGBP": 107.95,
        "totalPriceGBP": 68,
        "score": 37,
        "computedAt": "2024-01-10T15:45:30Z"
      }
    }
  ],
  "meta": {
    "count": 1,
    "minScore": 10,
    "searchTerms": "default",
    "timestamp": "2024-01-10T15:45:30Z"
  }
}
```

#### Error Responses

- `400` - Invalid parameters
- `405` - Method not allowed (only GET supported)
- `500` - Internal server error

## JavaScript Function

### `getTopDeals(minScore?, searchTerms?)`

Direct function access for server-side or client-side usage.

```typescript
import { getTopDeals } from './src/lib/topDeals';

// Get top deals with default settings
const deals = await getTopDeals();

// Custom filtering
const highValueDeals = await getTopDeals(25, ['Amazing Spider-Man', 'X-Men']);

console.log(`Found ${deals.length} deals:`);
deals.forEach(deal => {
  console.log(`${deal.listing.title}: ${deal.dealScore.score}% (£${deal.listing.totalPriceGBP})`);
});
```

## Data Flow

1. **Fetch Live Listings**: Retrieves current comic listings from various sources
2. **Parse Titles**: Normalizes listing titles to identify series and issue numbers
3. **Get Market Data**: Fetches recent sold listings for comparable items
4. **Calculate Market Value**: Computes median/mean prices from sold data
5. **Compute Deal Score**: Calculates percentage savings vs market value
6. **Filter & Sort**: Removes low-scoring deals and sorts by score descending
7. **Return Top 10**: Limits results to the best 10 deals

## Deal Score Calculation

Deal Score = `((Market Value - Listing Price) / Market Value) * 100`

- Higher scores indicate better deals
- Negative scores (overpriced items) are filtered out
- Only deals with sufficient market data are included

## Testing

The implementation includes comprehensive test coverage:

```bash
npm run test      # Run all tests
npm run test:ui   # Run with UI interface
```

Test files:
- `src/__tests__/topDeals.test.ts` - Core logic tests
- `src/__tests__/topDealsApi.test.ts` - API endpoint tests

## Current Implementation Notes

- Uses fixture data for demonstration
- Market data simulated from existing sales patterns
- Real implementation would integrate with eBay/other APIs
- Deal scores range from 0-100% representing savings percentage
- Results cached for 5 minutes to reduce API load