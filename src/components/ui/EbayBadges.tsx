import React from 'react'
import { Gavel, TrendingUp, TrendingDown } from 'lucide-react'
import type { EbayStatus } from '@/lib/types'

interface LiveAuctionBadgeProps {
  className?: string
}

export const LiveAuctionBadge: React.FC<LiveAuctionBadgeProps> = ({ className = '' }) => {
  return (
    <div className={`inline-flex items-center space-x-1 bg-green-500 text-white px-2 py-1 text-xs font-bold rounded border-2 border-ink-black shadow-comic-sm ${className}`}>
      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      <span>LIVE AUCTION</span>
    </div>
  )
}

interface BidCountDisplayProps {
  bidCount: number
  className?: string
}

export const BidCountDisplay: React.FC<BidCountDisplayProps> = ({ bidCount, className = '' }) => {
  return (
    <div className={`inline-flex items-center space-x-1 bg-golden-age-yellow text-ink-black px-2 py-1 text-xs font-bold rounded border-2 border-ink-black shadow-comic-sm ${className}`}>
      <Gavel size={12} />
      <span>{bidCount} BIDS</span>
    </div>
  )
}

interface PriceTrackingIndicatorProps {
  priceChange: number
  className?: string
}

export const PriceTrackingIndicator: React.FC<PriceTrackingIndicatorProps> = ({ priceChange, className = '' }) => {
  const isPositive = priceChange > 0
  const isNegative = priceChange < 0
  
  if (priceChange === 0) return null

  return (
    <div className={`inline-flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'} ${className}`}>
      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      <span className="text-xs font-semibold">
        {isPositive ? '+' : ''}£{Math.abs(priceChange).toFixed(2)}
      </span>
    </div>
  )
}

interface AuctionStatusBadgeProps {
  status: 'buy-it-now' | 'best-offer' | 'auction' | 'sold'
  className?: string
}

export const AuctionStatusBadge: React.FC<AuctionStatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'buy-it-now':
        return { text: 'BUY IT NOW', bgColor: 'bg-blue-500' }
      case 'best-offer':
        return { text: 'BEST OFFER', bgColor: 'bg-orange-500' }
      case 'auction':
        return { text: 'AUCTION', bgColor: 'bg-purple-500' }
      case 'sold':
        return { text: 'SOLD', bgColor: 'bg-gray-500' }
      default:
        return { text: status.toUpperCase(), bgColor: 'bg-gray-500' }
    }
  }

  const config = getStatusConfig(status)

  return (
    <div className={`inline-flex items-center ${config.bgColor} text-white px-2 py-1 text-xs font-bold rounded border-2 border-ink-black shadow-comic-sm ${className}`}>
      <span>{config.text}</span>
    </div>
  )
}

interface EbayStatusBadgesProps {
  ebayStatus: EbayStatus
  className?: string
}

export const EbayStatusBadges: React.FC<EbayStatusBadgesProps> = ({ ebayStatus, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {ebayStatus.hasLiveListings && (
        <>
          <LiveAuctionBadge />
          <BidCountDisplay bidCount={ebayStatus.liveListingsCount} />
        </>
      )}
      {ebayStatus.hasEndingSoon && (
        <AuctionStatusBadge status="auction" />
      )}
    </div>
  )
}