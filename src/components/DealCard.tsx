import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Clock } from 'lucide-react';

interface Deal {
  dealScoreId: string;
  issueId: string;
  gradeId: string;
  marketValueGBP: number;
  totalPriceGBP: number;
  dealScore: number;
  title: string;
  savings: number;
  grade?: {
    scale: string;
    numeric: number;
    label: string;
  };
  series?: {
    publisher: string;
  };
}

interface DealCardProps {
  deal: Deal;
}

const DealCard = ({ deal }: DealCardProps) => {
  const getTimeRemaining = () => {
    // Mock time remaining calculation
    const hours = Math.floor(Math.random() * 24) + 1;
    const minutes = Math.floor(Math.random() * 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge 
            variant={deal.dealScore >= 25 ? "default" : "secondary"}
            className="font-bold"
          >
            {deal.dealScore}% off
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-3 h-3" />
            {getTimeRemaining()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <Link 
            to={`/item/${deal.issueId}`}
            className="font-bold text-lg hover:text-primary hover:underline block"
          >
            {deal.title}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">
              {deal.series?.publisher}
            </span>
            <Badge variant="outline">
              {deal.grade?.scale} {deal.grade?.numeric}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Price</span>
            <span className="text-xl font-bold">£{deal.totalPriceGBP.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Market Value</span>
            <span className="text-sm line-through text-muted-foreground">
              £{deal.marketValueGBP.toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between items-center border-t pt-2">
            <span className="text-sm font-medium text-success">You Save</span>
            <span className="text-lg font-bold text-success">
              £{deal.savings.toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button className="flex-1" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Deal
          </Button>
          <Link to={`/item/${deal.issueId}`}>
            <Button variant="outline" size="sm">
              Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default DealCard;