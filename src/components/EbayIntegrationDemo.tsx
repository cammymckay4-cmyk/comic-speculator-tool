/**
 * Demo component showing eBay Client integration
 * This demonstrates how to use the eBay ingestion module in the Comic Scout application
 */

import React, { useState } from 'react';
import { fetchLiveListings, fetchSoldListings, type Listing, type Sale } from '../lib/ebayClient';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { formatGBP } from '../lib/format';
import { ExternalLink, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface EbayIntegrationDemoProps {
  issueId?: string;
  searchTerm?: string;
}

const EbayIntegrationDemo: React.FC<EbayIntegrationDemoProps> = ({ 
  issueId = 'amazing-spider-man-1963-300',
  searchTerm = 'Amazing Spider-Man 300'
}) => {
  const [liveListings, setLiveListings] = useState<Listing[]>([]);
  const [soldListings, setSoldListings] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<{ live: boolean; sold: boolean }>({ live: false, sold: false });

  const handleFetchLiveListings = async () => {
    setLoading(prev => ({ ...prev, live: true }));
    try {
      const results = await fetchLiveListings(searchTerm);
      setLiveListings(results);
    } catch (error) {
      console.error('Error fetching live listings:', error);
      setLiveListings([]);
    } finally {
      setLoading(prev => ({ ...prev, live: false }));
    }
  };

  const handleFetchSoldListings = async () => {
    setLoading(prev => ({ ...prev, sold: true }));
    try {
      const results = await fetchSoldListings(issueId, 'CGC-9.8', 30);
      setSoldListings(results);
    } catch (error) {
      console.error('Error fetching sold listings:', error);
      setSoldListings([]);
    } finally {
      setLoading(prev => ({ ...prev, sold: false }));
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const handleViewListing = (listing: Listing) => {
    // Open eBay listing in new tab or show user feedback
    if (listing.url) {
      window.open(listing.url, '_blank');
      toast.success('Redirecting to eBay listing...');
    } else {
      toast.info('eBay listing URL not available for demo data');
    }
  };

  const handleViewSale = (sale: Sale) => {
    // Open eBay sale in new tab or show user feedback
    if (sale.url) {
      window.open(sale.url, '_blank');
      toast.success('Redirecting to completed sale...');
    } else {
      toast.info('Sale URL not available for demo data');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            eBay Integration Demo
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Demonstration of the eBay ingestion module for Comic Scout
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={handleFetchLiveListings} 
              disabled={loading.live}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {loading.live ? 'Loading...' : 'Fetch Live Listings'}
            </Button>
            <Button 
              onClick={handleFetchSoldListings} 
              disabled={loading.sold}
              variant="outline"
              className="flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              {loading.sold ? 'Loading...' : 'Fetch Sold Listings'}
            </Button>
          </div>

          {/* Live Listings Section */}
          {liveListings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Live Listings ({liveListings.length})
              </h3>
              <div className="space-y-3">
                {liveListings.map((listing, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-2">{listing.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Price: <strong>{formatGBP(listing.price)}</strong></span>
                            <span>Shipping: {formatGBP(listing.shippingCost)}</span>
                            <Badge variant="outline">
                              {listing.sellerRating}% seller
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            Ends: {getTimeRemaining(listing.endTime)}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="mt-2"
                            onClick={() => handleViewListing(listing)}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Sold Listings Section */}
          {soldListings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Recent Sales ({soldListings.length})
              </h3>
              <div className="space-y-3">
                {soldListings.map((sale, index) => (
                  <Card key={index} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-medium">
                              Sale Price: {formatGBP(sale.salePrice)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Shipping: {formatGBP(sale.shipping)}
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {new Date(sale.dateOfSale).toLocaleDateString()}
                          </Badge>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewSale(sale)}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Sale
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {(liveListings.length === 0 && soldListings.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              Click the buttons above to fetch sample eBay data
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EbayIntegrationDemo;