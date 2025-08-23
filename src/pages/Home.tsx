import { useState, useMemo } from 'react';
import Navigation from '../components/Navigation';
import DealTable from '../components/DealTable';
import DealCard from '../components/DealCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import fixtureData from '../data/fixtures.json';

const Home = () => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Combine deal data with related information
  const enrichedDeals = useMemo(() => {
    return fixtureData.dealScores
      .map(deal => {
        const issue = fixtureData.issues.find(i => i.issueId === deal.issueId);
        const series = issue ? fixtureData.series.find(s => s.seriesId === issue.seriesId) : null;
        const grade = fixtureData.grades.find(g => g.gradeId === deal.gradeId);
        const marketValue = fixtureData.marketValues.find(mv => 
          mv.issueId === deal.issueId && mv.gradeId === deal.gradeId
        );

        return {
          ...deal,
          issue,
          series,
          grade,
          marketValue,
          title: series ? `${series.title} #${issue?.issueNumber}` : 'Unknown Comic',
          savings: deal.marketValueGBP - deal.totalPriceGBP
        };
      })
      .sort((a, b) => b.dealScore - a.dealScore)
      .slice(0, 10);
  }, []);

  const totalSavings = enrichedDeals.reduce((sum, deal) => sum + deal.savings, 0);

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

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Deals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enrichedDeals.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Potential Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  £{totalSavings.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Best Deal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm font-bold">
                    {enrichedDeals[0]?.dealScore}% off
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {enrichedDeals[0]?.title}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          {viewMode === 'table' ? (
            <DealTable deals={enrichedDeals} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrichedDeals.map((deal) => (
                <DealCard key={deal.dealScoreId} deal={deal} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;