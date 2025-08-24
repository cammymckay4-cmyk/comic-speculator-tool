/**
 * Market value calculation module
 *
 * Provides functions to calculate statistical metrics (median, mean, stdDev, min, max)
 * on a list of sales with optional time window filtering and outlier trimming.
 */
export interface Sale {
  price: number;
  shipping?: number;
  date: string;
}

export interface MarketValue {
  median: number;
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  sampleCount: number;
  lastUpdated: string;
  lowConfidence: boolean;
}

export function calculateMarketValue(sales: Sale[], windowDays: number = 30): MarketValue {
  if (!Array.isArray(sales)) {
    throw new Error('Sales must be an array');
  }
  const now = Date.now();
  const cutoff = now - windowDays * 24 * 60 * 60 * 1000;

  // Filter recent sales within time window and with non-negative prices
  const recentSales = sales.filter((s) => {
    const saleDate = new Date(s.date).getTime();
    if (isNaN(saleDate)) return false;
    return saleDate >= cutoff && s.price >= 0;
  });

  if (recentSales.length === 0) {
    throw new Error('No recent sales data available');
  }

  // Calculate total amounts (price + shipping) for each sale
  const amounts = recentSales.map((s) => s.price + (s.shipping ?? 0));
  amounts.sort((a, b) => a - b);

  const sampleCount = amounts.length;

  // Trim top and bottom 10% of samples for outlier reduction (if enough samples)
  const trimCount = Math.max(Math.floor(sampleCount * 0.1), 1);
  const trimmedAmounts =
    sampleCount > 2 * trimCount ? amounts.slice(trimCount, sampleCount - trimCount) : amounts;

  const median = calculateMedian(trimmedAmounts);
  const mean = calculateMean(trimmedAmounts);
  const stdDev = calculateStandardDeviation(trimmedAmounts);
  const min = trimmedAmounts[0];
  const max = trimmedAmounts[trimmedAmounts.length - 1];
  const lowConfidence = sampleCount < 5;

  return {
    median,
    mean,
    stdDev,
    min,
    max,
    sampleCount,
    lastUpdated: new Date().toISOString(),
    lowConfidence,
  };
}

function calculateMedian(data: number[]): number {
  const len = data.length;
  if (len === 0) return 0;
  const mid = Math.floor(len / 2);
  if (len % 2 === 0) {
    return (data[mid - 1] + data[mid]) / 2;
  }
  return data[mid];
}

function calculateMean(data: number[]): number {
  if (data.length === 0) return 0;
  const sum = data.reduce((acc, val) => acc + val, 0);
  return sum / data.length;
}

function calculateStandardDeviation(data: number[]): number {
  if (data.length === 0) return 0;
  const mean = calculateMean(data);
  const variance =
    data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length;
  return Math.sqrt(variance);
}
