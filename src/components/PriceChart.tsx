import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MarketValue {
  marketValueId: string;
  gradeId: string;
  medianGBP: number;
  meanGBP: number;
  sampleCount: number;
  minGBP: number;
  maxGBP: number;
}

interface PriceChartProps {
  marketValues: MarketValue[];
}

const PriceChart = ({ marketValues }: PriceChartProps) => {
  // Mock price history data for visualization
  const generateMockHistory = (currentPrice: number) => {
    const history = [];
    let price = currentPrice * 0.9; // Start 10% lower
    
    for (let i = 30; i >= 0; i--) {
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      price = price * (1 + variation);
      history.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
        price: Math.max(price, currentPrice * 0.7) // Don't go below 70% of current
      });
    }
    
    return history;
  };

  if (marketValues.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No price history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {marketValues.map(mv => {
        const history = generateMockHistory(mv.medianGBP);
        const priceChange = history[history.length - 1].price - history[0].price;
        const percentChange = (priceChange / history[0].price) * 100;
        
        return (
          <div key={mv.marketValueId} className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                Grade: {mv.gradeId.includes('cgc') ? 'CGC' : 'RAW'} {mv.gradeId.includes('9-4') ? '9.4' : mv.gradeId.includes('9-8') ? '9.8' : '8.5'}
              </Badge>
              
              <div className="flex items-center gap-2">
                {percentChange > 0 ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : percentChange < 0 ? (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                ) : (
                  <Minus className="w-4 h-4 text-muted-foreground" />
                )}
                <span className={`text-sm font-medium ${
                  percentChange > 0 ? 'text-success' : 
                  percentChange < 0 ? 'text-destructive' : 
                  'text-muted-foreground'
                }`}>
                  {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
                </span>
              </div>
            </div>
            
            {/* Simple price chart visualization */}
            <div className="relative h-32 bg-muted rounded-lg p-4">
              <div className="flex items-end justify-between h-full">
                {history.slice(-14).map((point, index) => {
                  const maxPrice = Math.max(...history.map(h => h.price));
                  const minPrice = Math.min(...history.map(h => h.price));
                  const range = maxPrice - minPrice;
                  const height = range > 0 ? ((point.price - minPrice) / range) * 80 + 10 : 45;
                  
                  return (
                    <div
                      key={index}
                      className="bg-primary rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                      style={{
                        height: `${height}%`,
                        width: `${100 / 14 - 1}%`
                      }}
                      title={`${point.date}: £${point.price.toFixed(2)}`}
                    />
                  );
                })}
              </div>
              
              <div className="absolute bottom-1 left-4 text-xs text-muted-foreground">
                £{Math.min(...history.map(h => h.price)).toFixed(0)}
              </div>
              <div className="absolute top-1 left-4 text-xs text-muted-foreground">
                £{Math.max(...history.map(h => h.price)).toFixed(0)}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Current</div>
                <div className="font-bold">£{mv.medianGBP.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">30-day High</div>
                <div className="font-bold">£{mv.maxGBP.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">30-day Low</div>
                <div className="font-bold">£{mv.minGBP.toFixed(2)}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PriceChart;