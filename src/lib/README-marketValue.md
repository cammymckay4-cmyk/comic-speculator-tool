# Market Value Aggregation Service

The Market Value Aggregation Service provides statistical analysis of comic book sales data to determine market values with confidence indicators and outlier filtering.

## Features

- **Time Window Filtering**: Analyze sales within a specified time period (default: 30 days)
- **Data Validation**: Filters out invalid sales data (negative prices, malformed dates)
- **Outlier Trimming**: Excludes top and bottom 10% of sales for more accurate statistics
- **Statistical Analysis**: Calculates median, mean, standard deviation, min, and max values
- **Confidence Indicators**: Flags results with low confidence when sample size < 5
- **Error Handling**: Comprehensive validation and error reporting

## Usage

```typescript
import { calculateMarketValue, Sale } from '@/lib/marketValue';

// Sample sales data
const sales: Sale[] = [
  { salePrice: 250, shipping: 15, date: new Date('2024-12-20') },
  { salePrice: 275, shipping: 20, date: new Date('2024-12-18') },
  { salePrice: 290, shipping: 12, date: new Date('2024-12-15') },
  // ... more sales
];

// Calculate market value
const marketValue = calculateMarketValue(sales, 30); // 30-day window

console.log({
  median: marketValue.median,           // £298.00
  mean: marketValue.mean,               // £299.00
  stdDev: marketValue.stdDev,           // £18.37
  min: marketValue.min,                 // £265.00
  max: marketValue.max,                 // £328.00
  sampleCount: marketValue.sampleCount, // 14
  lowConfidence: marketValue.lowConfidence, // false
  lastUpdated: marketValue.lastUpdated  // ISO timestamp
});
```

## Types

### Sale Interface

```typescript
interface Sale {
  /** Sale price in GBP */
  salePrice: number;
  /** Shipping cost in GBP */
  shipping: number;
  /** Date of the sale */
  date: Date | string;
  /** Optional: Currency code (for validation) */
  currency?: string;
}
```

### MarketValue Interface

```typescript
interface MarketValue {
  /** Median price from filtered sales */
  median: number;
  /** Mean price from filtered sales */
  mean: number;
  /** Standard deviation of filtered sales */
  stdDev: number;
  /** Minimum price from filtered sales */
  min: number;
  /** Maximum price from filtered sales */
  max: number;
  /** Total number of sales before filtering (original sample size) */
  sampleCount: number;
  /** ISO timestamp of when calculation was performed */
  lastUpdated: string;
  /** True if sample size is less than 5 (low confidence) */
  lowConfidence: boolean;
}
```

## Function Reference

### calculateMarketValue(sales, windowDays?)

Calculates market value statistics from an array of sales.

**Parameters:**
- `sales: Sale[]` - Array of sale records to analyze
- `windowDays: number = 30` - Number of days to look back (default: 30)

**Returns:** `MarketValue` object with statistical analysis

**Throws:** Error if input is empty or malformed

## Algorithm Details

1. **Input Validation**: Checks for array input and positive window days
2. **Time Filtering**: Includes only sales within the specified time window
3. **Data Validation**: Filters out sales with:
   - Negative or zero sale prices
   - Negative shipping costs
   - Invalid dates
   - Malformed data structures
4. **Price Calculation**: Combines sale price + shipping for total buyer cost
5. **Sorting**: Orders prices from lowest to highest
6. **Trimming**: For datasets ≥10 samples, excludes bottom 10% and top 10%
7. **Statistics**: Calculates median, mean, standard deviation, min, max
8. **Confidence**: Sets `lowConfidence = true` if original sample count < 5

## Error Handling

The service provides comprehensive error handling for:

- Empty or null input arrays
- Invalid window days (≤ 0)
- No valid sales within time window
- Malformed sale objects
- Invalid price values
- Invalid date formats

## Testing

The service includes comprehensive test coverage with 20 test cases covering:

- Basic functionality with various sample sizes
- Edge cases (single sale, identical values, small datasets)
- Error handling scenarios
- Time window filtering accuracy
- Trimming logic verification
- Statistical calculation accuracy

Run tests with:
```bash
npm run test
```

## Examples

See `src/__tests__/marketValue.demo.ts` for a complete working example with sample data and different scenarios.