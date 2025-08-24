/**
 * Market Value Service Demo
 * 
 * This file demonstrates the usage of the market value aggregation service
 * with sample comic book sales data.
 */

import { calculateMarketValue, Sale } from '../lib/marketValue';

// Sample sales data for Amazing Spider-Man #300 
const sampleSalesData: Sale[] = [
  // Recent sales within 30-day window
  { salePrice: 250, shipping: 15, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), currency: 'GBP' }, // 2 days ago
  { salePrice: 275, shipping: 20, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), currency: 'GBP' }, // 4 days ago
  { salePrice: 290, shipping: 12, date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), currency: 'GBP' }, // 6 days ago
  { salePrice: 310, shipping: 18, date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), currency: 'GBP' }, // 8 days ago
  { salePrice: 265, shipping: 22, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), currency: 'GBP' }, // 10 days ago
  { salePrice: 285, shipping: 15, date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), currency: 'GBP' }, // 12 days ago
  { salePrice: 320, shipping: 25, date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), currency: 'GBP' }, // 14 days ago - High outlier
  { salePrice: 240, shipping: 10, date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000), currency: 'GBP' }, // 16 days ago - Low outlier
  { salePrice: 295, shipping: 18, date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), currency: 'GBP' }, // 18 days ago
  { salePrice: 280, shipping: 16, date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), currency: 'GBP' }, // 20 days ago
  { salePrice: 300, shipping: 20, date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000), currency: 'GBP' }, // 22 days ago
  { salePrice: 270, shipping: 14, date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), currency: 'GBP' }, // 25 days ago
  
  // Older sales outside 30-day window - should be filtered out
  { salePrice: 350, shipping: 30, date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), currency: 'GBP' }, // 35 days ago
  { salePrice: 200, shipping: 10, date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), currency: 'GBP' }, // 40 days ago
];

console.log('🚀 Market Value Aggregation Service Demo\n');

try {
  // Calculate market value with default 30-day window
  const marketValue = calculateMarketValue(sampleSalesData);
  
  console.log('📊 Market Value Analysis Results:');
  console.log('================================');
  console.log(`Sample Count: ${marketValue.sampleCount} sales`);
  console.log(`Median Price: £${marketValue.median.toFixed(2)}`);
  console.log(`Mean Price: £${marketValue.mean.toFixed(2)}`);
  console.log(`Standard Deviation: £${marketValue.stdDev.toFixed(2)}`);
  console.log(`Price Range: £${marketValue.min.toFixed(2)} - £${marketValue.max.toFixed(2)}`);
  console.log(`Low Confidence: ${marketValue.lowConfidence ? 'Yes' : 'No'} (< 5 samples)`);
  console.log(`Last Updated: ${marketValue.lastUpdated}`);
  
  console.log('\n🔍 Analysis Notes:');
  console.log('- Outliers (top/bottom 10%) were trimmed for statistical accuracy');
  console.log('- Only sales within the last 30 days were included');
  console.log('- All prices include shipping costs for total buyer expense');
  
  // Demonstrate different time windows
  console.log('\n📅 Different Time Window Analysis:');
  
  const sevenDayValue = calculateMarketValue(sampleSalesData, 7);
  const sixtyDayValue = calculateMarketValue(sampleSalesData, 60);
  
  console.log(`7-day median: £${sevenDayValue.median.toFixed(2)} (${sevenDayValue.sampleCount} total samples)`);
  console.log(`30-day median: £${marketValue.median.toFixed(2)} (${marketValue.sampleCount} total samples)`);
  console.log(`60-day median: £${sixtyDayValue.median.toFixed(2)} (${sixtyDayValue.sampleCount} total samples)`);
  
} catch (error) {
  console.error('❌ Error calculating market value:', error.message);
}

// Demonstrate error handling
console.log('\n🛡️  Error Handling Demo:');

try {
  calculateMarketValue([]);
} catch (error) {
  console.log(`✅ Empty array: ${error.message}`);
}

try {
  calculateMarketValue([
    { salePrice: -100, shipping: 10, date: new Date() } // Invalid negative price
  ]);
} catch (error) {
  console.log(`✅ Invalid data: ${error.message}`);
}

export { sampleSalesData };