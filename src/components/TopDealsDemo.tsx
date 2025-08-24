import React, { useState, useEffect } from 'react';
import { TopDeal } from '../lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { formatGBP } from '@/lib/format';

/**
 * Example component demonstrating Top Deals API integration
 * This could be added to the Home page or as a new dedicated page
 */
const TopDealsDemo: React.FC = () => {
  const [deals, setDeals] = useState<TopDeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(10);

  const fetchTopDeals = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/top-deals?minScore=${minScore}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch deals');
      }
      
      setDeals(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopDeals();
  }, [minScore]);

  const handleRefresh = () => {
    fetchTopDeals();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Top Comic Deals</h2>
          <p className="text-muted-foreground">
            Best deals automatically detected from live listings
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={minScore} 
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value={5}>Min 5% savings</option>
            <option value={10}>Min 10% savings</option>
            <option value={15}>Min 15% savings</option>
            <option value={20}>Min 20% savings</option>
            <option value={25}>Min 25% savings</option>
          </select>
          
          <Button 
            onClick={handleRefresh} 
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-muted-foreground">Finding the best deals...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deals.map((deal, index) => (
            <Card key={deal.listing.listingId} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Badge variant="secondary" className="text-lg font-bold">
                    #{index + 1}
                  </Badge>
                  <Badge 
                    variant={deal.dealScore.score >= 25 ? "default" : "outline"}
                    className="text-sm font-bold"
                  >
                    {deal.dealScore.score}% off
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-tight">
                  {deal.listing.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Price</span>
                    <span className="text-xl font-bold text-primary">
                      {formatGBP(deal.listing.totalPriceGBP)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Market Value</span>
                    <span className="text-sm line-through text-muted-foreground">
                      {formatGBP(deal.marketValue.medianGBP)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-sm font-medium text-success">You Save</span>
                    <span className="text-lg font-bold text-success">
                      {formatGBP(deal.marketValue.medianGBP - deal.listing.totalPriceGBP)}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                  <div>Market data: {deal.marketValue.sampleCount} recent sales</div>
                  <div>Source: {deal.listing.source}</div>
                </div>
                
                <Button className="w-full" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Deal
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && deals.length === 0 && !error && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No deals found with {minScore}% or higher savings.
              Try lowering the minimum score threshold.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TopDealsDemo;