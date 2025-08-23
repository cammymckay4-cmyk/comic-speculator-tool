import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import Navigation from '../components/Navigation';
import PriceChart from '../components/PriceChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Heart } from 'lucide-react';
import fixtureData from '../data/fixtures.json';

const ItemDetail = () => {
  const { issueId } = useParams<{ issueId: string }>();

  const itemData = useMemo(() => {
    if (!issueId) return null;

    const issue = fixtureData.issues.find(i => i.issueId === issueId);
    const series = issue ? fixtureData.series.find(s => s.seriesId === issue.seriesId) : null;
    const marketValues = fixtureData.marketValues.filter(mv => mv.issueId === issueId);
    const deals = fixtureData.dealScores.filter(ds => ds.issueId === issueId);

    return {
      issue,
      series,
      marketValues,
      deals,
      title: series ? `${series.title} #${issue?.issueNumber}` : 'Unknown Comic'
    };
  }, [issueId]);

  if (!itemData?.issue) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Comic not found</h1>
            <p className="text-muted-foreground mt-2">
              The requested comic could not be found.
            </p>
            <Button 
              onClick={() => window.history.back()} 
              className="mt-4"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const { issue, series, marketValues, deals, title } = itemData;
  const bestDeal = deals.sort((a, b) => b.dealScore - a.dealScore)[0];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Button 
                onClick={() => window.history.back()} 
                variant="ghost" 
                size="sm"
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Deals
              </Button>
              
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{series?.publisher}</Badge>
                <Badge variant="outline">{issue?.coverDate}</Badge>
                {issue?.keyNotes && (
                  <Badge variant="secondary">Key Issue</Badge>
                )}
              </div>
              {issue?.keyNotes && (
                <p className="text-muted-foreground">{issue.keyNotes}</p>
              )}
            </div>
            
            <Button variant="outline" size="sm">
              <Heart className="w-4 h-4 mr-2" />
              Watch
            </Button>
          </div>

          {/* Current Deals */}
          {deals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Current Deals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deals.map(deal => {
                    const grade = fixtureData.grades.find(g => g.gradeId === deal.gradeId);
                    const savings = deal.marketValueGBP - deal.totalPriceGBP;
                    
                    return (
                      <div 
                        key={deal.dealScoreId}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {grade?.scale} {grade?.numeric}
                            </Badge>
                            <Badge 
                              variant={deal.dealScore >= 25 ? "default" : "secondary"}
                              className="font-bold"
                            >
                              {deal.dealScore}% off
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            eBay UK • Ending soon
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold">£{deal.totalPriceGBP.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground line-through">
                            £{deal.marketValueGBP.toFixed(2)}
                          </div>
                          <div className="text-sm font-medium text-success">
                            Save £{savings.toFixed(2)}
                          </div>
                        </div>
                        
                        <Button size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Deal
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Market Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Price History (30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <PriceChart marketValues={marketValues} />
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Market Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {marketValues.map(mv => {
                    const grade = fixtureData.grades.find(g => g.gradeId === mv.gradeId);
                    return (
                      <div key={mv.marketValueId} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">
                            {grade?.scale} {grade?.numeric}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {mv.sampleCount} sales
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="text-muted-foreground">Median</div>
                            <div className="font-medium">£{mv.medianGBP.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Range</div>
                            <div className="font-medium">
                              £{mv.minGBP} - £{mv.maxGBP}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Facts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Publisher</span>
                    <span>{series?.publisher}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Series Start</span>
                    <span>{series?.startYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cover Date</span>
                    <span>{issue?.coverDate}</span>
                  </div>
                  {bestDeal && (
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-muted-foreground">Best Deal</span>
                      <Badge variant="default">{bestDeal.dealScore}% off</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ItemDetail;