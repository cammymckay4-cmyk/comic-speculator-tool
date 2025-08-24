/**
 * Market Value Aggregation Service
 * 
 * This module provides functionality to calculate market values from sales data
 * with statistical analysis including trimmed means and confidence indicators.
 */

/**
 * Represents an individual sale record
 */
export interface Sale {
  /** Sale price in GBP */
  salePrice: number;
  /** Shipping cost in GBP */
  shipping: number;
  /** Date of the sale */
  date: Date | string;
  /** Optional: Currency code (for validation) */
  currency?: string;
}

/**
 * Market value analysis result with statistical metrics
 */
export interface MarketValue {
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

/**
 * Calculates market value statistics from an array of sales
 * 
 * @param sales - Array of sale records to analyze
 * @param windowDays - Number of days to look back (default: 30)
 * @returns MarketValue object with statistical analysis
 * @throws Error if input is empty or malformed
 */
export function calculateMarketValue(sales: Sale[], windowDays: number = 30): MarketValue {
  // Input validation
  if (!Array.isArray(sales)) {
    throw new Error('Sales must be an array');
  }

  if (sales.length === 0) {
    throw new Error('Sales array cannot be empty');
  }

  if (windowDays <= 0) {
    throw new Error('Window days must be greater than 0');
  }

  // Filter sales to the specified time window and validate prices
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - windowDays);

  const validSales = sales.filter(sale => {
    try {
      // Validate sale structure
      if (typeof sale.salePrice !== 'number' || typeof sale.shipping !== 'number') {
        return false;
      }

      // Check for valid GBP prices (positive numbers)
      if (sale.salePrice <= 0 || sale.shipping < 0) {
        return false;
      }

      // Validate and filter by date
      const saleDate = new Date(sale.date);
      if (isNaN(saleDate.getTime())) {
        return false;
      }

      return saleDate >= cutoffDate;
    } catch {
      return false;
    }
  });

  if (validSales.length === 0) {
    throw new Error('No valid sales found within the specified time window');
  }

  // Calculate total amounts (salePrice + shipping) and sort
  const totalAmounts = validSales
    .map(sale => sale.salePrice + sale.shipping)
    .sort((a, b) => a - b);

  const originalSampleCount = sales.length;

  // Exclude top and bottom 10% for trimmed calculations
  let trimmedAmounts = totalAmounts;
  if (totalAmounts.length >= 10) {
    const bottomIndex = Math.floor(totalAmounts.length * 0.1);
    const topIndex = Math.ceil(totalAmounts.length * 0.9);
    trimmedAmounts = totalAmounts.slice(bottomIndex, topIndex);
  }

  // Calculate statistics on trimmed data
  const median = calculateMedian(trimmedAmounts);
  const mean = calculateMean(trimmedAmounts);
  const stdDev = calculateStandardDeviation(trimmedAmounts, mean);
  const min = Math.min(...trimmedAmounts);
  const max = Math.max(...trimmedAmounts);

  return {
    median,
    mean,
    stdDev,
    min,
    max,
    sampleCount: originalSampleCount,
    lastUpdated: new Date().toISOString(),
    lowConfidence: originalSampleCount < 5
  };
}

/**
 * Calculates the median of a sorted array of numbers
 */
function calculateMedian(sortedNumbers: number[]): number {
  const length = sortedNumbers.length;
  if (length === 0) {
    throw new Error('Cannot calculate median of empty array');
  }

  const middle = Math.floor(length / 2);
  
  if (length % 2 === 0) {
    // Even number of elements - average of middle two
    return (sortedNumbers[middle - 1] + sortedNumbers[middle]) / 2;
  } else {
    // Odd number of elements - middle element
    return sortedNumbers[middle];
  }
}

/**
 * Calculates the arithmetic mean of an array of numbers
 */
function calculateMean(numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error('Cannot calculate mean of empty array');
  }
  
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

/**
 * Calculates the standard deviation of an array of numbers
 */
function calculateStandardDeviation(numbers: number[], mean: number): number {
  if (numbers.length === 0) {
    throw new Error('Cannot calculate standard deviation of empty array');
  }

  if (numbers.length === 1) {
    return 0;
  }

  const variance = numbers.reduce((sum, num) => {
    return sum + Math.pow(num - mean, 2);
  }, 0) / (numbers.length - 1); // Sample standard deviation (n-1)

  return Math.sqrt(variance);
}