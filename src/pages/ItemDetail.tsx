import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import fixtureData from '../data/fixtures.json';
import { formatGBP } from '@/lib/format';

const ItemDetail = () => {
  const { listingId } = useParams<{ listingId: string }>();

  const itemData = useMemo(() => {
    if (!listingId) return null;

    const deal = fixtureData.deals.find(d => d.deal.listingId === listingId);
    if (!deal) return null;

    const title = `${deal.series.title} #${deal.issue.issueNumber}`;
    return {
      listingId,
      title,
      series: deal.series,
      issue: deal.issue,
      grade: deal.grade,
      marketValue: deal.marketValue,
      dealInfo: deal.deal,
    };
  }, [listingId]);

  if (!itemData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Not Found</h1>
            <p className="text-muted-foreground mt-2">
              The requested listing could not be found.
            </p>
            <Link to="/">
              <Button className="mt-4" variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { issue, series, grade, marketValue, dealInfo, title } = itemData;

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
          </div>
          {/* Deal Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Deal Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-muted-foreground text-sm">Grade</div>
                  <Badge variant="outline">{grade.scale} {grade.numeric ?? grade.label}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground text-sm">Current Price</div>
                  <div className="text-lg font-bold">{formatGBP(dealInfo.totalPriceGBP)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground text-sm">Market Value</div>
                  <div className="text-lg font-bold">{formatGBP(dealInfo.marketValueGBP)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground text-sm">Deal Score</div>
                  <div className="text-lg font-bold">{dealInfo.dealScore}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PriceChart (simple text) */}
          <Card>
            <CardHeader>
              <CardTitle>PriceChart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Mean (GBP)</div>
                  <div className="font-medium">{formatGBP(marketValue.mean)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Median (GBP)</div>
                  <div className="font-medium">{formatGBP(marketValue.median)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Sample Size</div>
                  <div className="font-medium">{marketValue.sample}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ItemDetail;