import { useState, useMemo } from 'react';
import Navigation from '../components/Navigation';
import DealTable from '../components/DealTable';
import DealCard from '../components/DealCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import fixtureData from '../data/fixtures.json';
import { formatGBP } from '@/lib/format';

const Home = () => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Combine deal data with related information
  const dealsForTable = useMemo(() => {
    return fixtureData.deals.map((d, idx) => {
      const title = `${d.series.title} #${d.issue.issueNumber}`;
      const gradeDisplay = `${d.grade.scale} ${d.grade.numeric ?? d.grade.label}`;
      return {
        id: `${d.issue.issueId}-${idx}`,
        listingId: d.deal.listingId,
        issueId: d.issue.issueId,
        title,
        gradeDisplay,
        totalPriceGBP: d.deal.totalPriceGBP,
        marketValueGBP: d.deal.marketValueGBP,
        dealScore: d.deal.dealScore,
      };
    });
  }, []);

  // Enhanced summary statistics calculations
  const summaryStats = useMemo(() => {
    const totalSavings = dealsForTable.reduce((sum, deal) => sum + (deal.marketValueGBP - deal.totalPriceGBP), 0);
    const averageListingPrice = dealsForTable.length > 0 
      ? dealsForTable.reduce((sum, deal) => sum + deal.totalPriceGBP, 0) / dealsForTable.length 
      : 0;
    const averageMarketValue = dealsForTable.length > 0
      ? dealsForTable.reduce((sum, deal) => sum + deal.marketValueGBP, 0) / dealsForTable.length
      : 0;
    const averageDealScore = dealsForTable.length > 0
      ? dealsForTable.reduce((sum, deal) => sum + deal.dealScore, 0) / dealsForTable.length
      : 0;
    
    // Find the best deal (highest deal score)
    const bestDeal = dealsForTable.length > 0
      ? dealsForTable.reduce((best, current) => 
          current.dealScore > best.dealScore ? current : best
        )
      : null;
    
    return {
      totalListings: dealsForTable.length,
      totalSavings,
      averageListingPrice,
      averageMarketValue,
      averageDealScore,
      bestDeal,
    };
  }, [dealsForTable]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Top Comic Deals</h1>
              <p className="text-muted-foreground mt-1">
                Best value comics updated in real-time
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                onClick={() => setViewMode('table')}
                size="sm"
              >
                Table View
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                onClick={() => setViewMode('cards')}
                size="sm"
              >
                Card View
              </Button>
            </div>
          </div>

          {/* Enhanced Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Listings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.totalListings}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Potential Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatGBP(summaryStats.totalSavings)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Listing Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatGBP(summaryStats.averageListingPrice)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Deal Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(summaryStats.averageDealScore)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Market Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">
                  {formatGBP(summaryStats.averageMarketValue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {summaryStats.totalListings} listings
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Best Deal
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summaryStats.bestDeal ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-sm font-bold">
                        {summaryStats.bestDeal.dealScore}%
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {summaryStats.bestDeal.title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Save {formatGBP(summaryStats.bestDeal.marketValueGBP - summaryStats.bestDeal.totalPriceGBP)}
                    </p>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No deals available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          {viewMode === 'table' ? (
            <DealTable deals={dealsForTable} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dealsForTable.map((deal) => (
                <DealCard key={deal.id} deal={{
                  // Backfill minimal shape expected by DealCard if used
                  dealScoreId: deal.id,
                  issueId: deal.issueId,
                  gradeId: '',
                  marketValueGBP: deal.marketValueGBP,
                  totalPriceGBP: deal.totalPriceGBP,
                  dealScore: deal.dealScore,
                  title: deal.title,
                  savings: deal.marketValueGBP - deal.totalPriceGBP,
                }} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;