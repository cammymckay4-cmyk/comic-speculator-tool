import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, TrendingUp, Clock } from 'lucide-react';

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

interface DealTableProps {
  deals: Deal[];
}

const DealTable = ({ deals }: DealTableProps) => {
  const getTimeRemaining = () => {
    // Mock time remaining calculation
    const hours = Math.floor(Math.random() * 24) + 1;
    const minutes = Math.floor(Math.random() * 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Top Deals
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comic</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead className="text-right">Current Price</TableHead>
                <TableHead className="text-right">Market Value</TableHead>
                <TableHead className="text-right">Deal Score</TableHead>
                <TableHead className="text-right">Savings</TableHead>
                <TableHead className="text-center">Time Left</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => (
                <TableRow key={deal.dealScoreId} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <Link 
                        to={`/item/${deal.issueId}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {deal.title}
                      </Link>
                      <div className="text-sm text-muted-foreground">
                        {deal.series?.publisher}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline">
                      {deal.grade?.scale} {deal.grade?.numeric}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-right font-bold">
                    £{deal.totalPriceGBP.toFixed(2)}
                  </TableCell>
                  
                  <TableCell className="text-right text-muted-foreground">
                    £{deal.marketValueGBP.toFixed(2)}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <Badge 
                      variant={deal.dealScore >= 25 ? "default" : "secondary"}
                      className="font-bold"
                    >
                      {deal.dealScore}% off
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-right font-medium text-success">
                    £{deal.savings.toFixed(2)}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {getTimeRemaining()}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DealTable;