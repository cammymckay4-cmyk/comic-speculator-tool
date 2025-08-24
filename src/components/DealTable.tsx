import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { ExternalLink, TrendingUp, Clock } from 'lucide-react';
import { formatGBP } from '@/lib/format';

interface DealRow {
  id: string;
  listingId?: string;
  issueId: string;
  title: string;
  gradeDisplay: string;
  totalPriceGBP: number;
  marketValueGBP: number;
  dealScore: number;
}

interface DealTableProps {
  deals: DealRow[];
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
            <TableCaption>Current comic deals</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Comic</TableHead>
                <TableHead scope="col">Grade</TableHead>
                <TableHead scope="col" className="text-right">Current Price (GBP)</TableHead>
                <TableHead scope="col" className="text-right">Market Value (GBP)</TableHead>
                <TableHead scope="col" className="text-right">Deal Score %</TableHead>
                <TableHead scope="col" className="text-center">Time Left</TableHead>
                <TableHead scope="col" className="text-center">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => (
                <TableRow key={deal.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <Link 
                        to={`/item/${deal.listingId ?? deal.issueId}`}
                        className="font-medium hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {deal.title}
                      </Link>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline">
                      {deal.gradeDisplay}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-right font-bold">
                    {formatGBP(deal.totalPriceGBP)}
                  </TableCell>
                  
                  <TableCell className="text-right text-muted-foreground">
                    {formatGBP(deal.marketValueGBP)}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <span className="font-bold">{deal.dealScore}%</span>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {getTimeRemaining()}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <Button size="sm" variant="outline" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
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