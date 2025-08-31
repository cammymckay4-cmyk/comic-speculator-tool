import React, { useState, useEffect } from 'react';
import { Eye, Clock, TrendingUp, TrendingDown, Gavel, Star, AlertCircle, ExternalLink } from 'lucide-react';

const EbayIntegrationShowcase = () => {
  const [currentSection, setCurrentSection] = useState('live');
  const [liveTime, setLiveTime] = useState('2h 45m 23s');

  // Simulate countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const times = ['2h 45m 23s', '2h 45m 22s', '2h 45m 21s', '2h 45m 20s'];
      const currentIndex = times.indexOf(liveTime);
      const nextIndex = (currentIndex + 1) % times.length;
      setLiveTime(times[nextIndex]);
    }, 1000);

    return () => clearInterval(timer);
  }, [liveTime]);

  // Live Auction Badge
  const LiveAuctionBadge = ({ status = 'live', timeLeft, animated = true }) => {
    const configs = {
      live: {
        bg: 'rgb(34, 197, 94)', // Green to signify live
        border: 'rgb(22, 163, 74)',
        text: 'rgb(255, 255, 255)',
        label: 'LIVE AUCTION',
        pulse: false // Badge itself is static
      },
      ending: {
        bg: 'rgb(214, 40, 40)',
        border: 'rgb(185, 28, 28)',
        text: 'rgb(255, 255, 255)',
        label: 'ENDING SOON',
        pulse: true,
        urgent: true
      },
      ended: {
        bg: 'rgb(107, 114, 128)',
        border: 'rgb(75, 85, 99)',
        text: 'rgb(209, 213, 219)',
        label: 'AUCTION ENDED'
      },
      watching: {
        bg: 'rgb(0, 119, 181)', // eBay blue
        border: 'rgb(0, 95, 145)',
        text: 'rgb(255, 255, 255)',
        label: 'WATCHING'
      }
    };

    const config = configs[status];

    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: config.bg,
        color: config.text,
        padding: '6px 12px',
        border: `2px solid ${config.border}`,
        boxShadow: `3px 3px 0px ${config.border}`,
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        animation: animated && config.pulse ? (config.urgent ? 'fastPulse 1s infinite' : 'pulse 2s infinite') : 'none'
      }}>
        {status === 'live' && (
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: config.text,
            borderRadius: '50%',
            border: '1px solid rgba(0, 0, 0, 0.3)',
            animation: animated ? 'modernPulse 2s infinite ease-in-out' : 'none'
          }} />
        )}
        {status === 'watching' && <Eye size={14} />}
        {status === 'ending' && <AlertCircle size={14} />}
        
        <span>{config.label}</span>
        
        {timeLeft && (
          <span style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '700'
          }}>
            {timeLeft}
          </span>
        )}
      </div>
    );
  };

  // Bid Count Display
  const BidCountDisplay = ({ bidCount, currentBid, currency = '£', size = 'md' }) => {
    const sizeConfigs = {
      sm: { fontSize: '12px', padding: '4px 8px', iconSize: 14 },
      md: { fontSize: '14px', padding: '6px 12px', iconSize: 16 },
      lg: { fontSize: '16px', padding: '8px 16px', iconSize: 18 }
    };

    const config = sizeConfigs[size];

    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgb(253, 246, 227)',
        color: 'rgb(28, 28, 28)',
        padding: config.padding,
        border: '2px solid rgb(28, 28, 28)',
        boxShadow: '3px 3px 0px rgb(28, 28, 28)',
        fontFamily: 'system-ui, sans-serif',
        fontSize: config.fontSize,
        fontWeight: '600',
        minWidth: '140px' // Make it more rectangular
      }}>
        <Gavel size={config.iconSize} color="rgb(214, 40, 40)" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
          <span style={{ fontSize: config.fontSize, fontWeight: '700', color: 'rgb(214, 40, 40)' }}>
            {currency}{currentBid}
          </span>
          <span style={{ fontSize: '11px', opacity: 0.7 }}>
            {bidCount} bid{bidCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    );
  };

  // Price Tracking Indicator
  const PriceTrackingIndicator = ({ change, percentage, trend = 'up' }) => {
    const isUp = trend === 'up';
    const isDown = trend === 'down';
    const isFlat = trend === 'flat';

    const bgColor = isUp ? 'rgb(34, 197, 94)' : isDown ? 'rgb(214, 40, 40)' : 'rgb(107, 114, 128)';
    const borderColor = isUp ? 'rgb(22, 163, 74)' : isDown ? 'rgb(185, 28, 28)' : 'rgb(75, 85, 99)';
    const Icon = isUp ? TrendingUp : isDown ? TrendingDown : TrendingUp;

    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: bgColor,
        color: 'rgb(255, 255, 255)',
        padding: '4px 10px',
        border: `2px solid ${borderColor}`,
        boxShadow: `2px 2px 0px ${borderColor}`,
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        <Icon size={14} />
        <span>£{change}</span>
        <span>({percentage}%)</span>
      </div>
    );
  };

  // Auction Status Badge
  const AuctionStatusBadge = ({ status, watchers, seller }) => {
    const configs = {
      'buy-it-now': {
        bg: 'rgb(247, 181, 56)',
        border: 'rgb(217, 119, 6)',
        text: 'rgb(28, 28, 28)',
        label: 'BUY IT NOW'
      },
      'best-offer': {
        bg: 'rgb(0, 119, 181)',
        border: 'rgb(0, 95, 145)',
        text: 'rgb(255, 255, 255)',
        label: 'BEST OFFER'
      },
      'auction': {
        bg: 'rgb(220, 38, 127)',
        border: 'rgb(190, 24, 93)',
        text: 'rgb(255, 255, 255)',
        label: 'AUCTION'
      },
      'sold': {
        bg: 'rgb(107, 114, 128)',
        border: 'rgb(75, 85, 99)',
        text: 'rgb(209, 213, 219)',
        label: 'SOLD'
      }
    };

    const config = configs[status];

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backgroundColor: 'rgb(253, 246, 227)',
        border: '2px solid rgb(28, 28, 28)',
        boxShadow: '3px 3px 0px rgb(28, 28, 28)',
        padding: '12px'
      }}>
        <div style={{
          backgroundColor: config.bg,
          color: config.text,
          padding: '4px 12px',
          border: `2px solid ${config.border}`,
          boxShadow: `2px 2px 0px ${config.border}`,
          fontFamily: 'system-ui, sans-serif',
          fontSize: '12px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          textAlign: 'center'
        }}>
          {config.label}
        </div>

        {watchers && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'rgb(28, 28, 28)',
            opacity: 0.7
          }}>
            <Eye size={12} />
            <span>{watchers} watching</span>
          </div>
        )}

        {seller && (
          <div style={{
            fontSize: '11px',
            color: 'rgb(28, 28, 28)',
            opacity: 0.6
          }}>
            Seller: <strong>{seller}</strong>
          </div>
        )}
      </div>
    );
  };

  // eBay Integration Card
  const EbayIntegrationCard = ({ title, image, currentBid, bidCount, timeLeft, watchers, status }) => {
    return (
      <div style={{
        backgroundColor: 'rgb(253, 246, 227)',
        border: '3px solid rgb(28, 28, 28)',
        boxShadow: '6px 6px 0px rgb(28, 28, 28)',
        padding: '16px',
        width: '280px'
      }}>
        {/* Header with eBay branding hint */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '2px solid rgb(28, 28, 28)'
        }}>
          <span style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            fontWeight: '600',
            color: 'rgb(0, 119, 181)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            eBay Integration
          </span>
          <ExternalLink size={14} color="rgb(107, 114, 128)" />
        </div>

        {/* Comic Image Placeholder */}
        <div style={{
          width: '100%',
          height: '120px',
          backgroundColor: 'rgb(229, 231, 235)',
          border: '2px solid rgb(28, 28, 28)',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: 'rgb(107, 114, 128)'
        }}>
          {title}
        </div>

        {/* Status and Time */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <LiveAuctionBadge status={status} timeLeft={status === 'live' ? timeLeft : null} />
        </div>

        {/* Bid Information */}
        <BidCountDisplay bidCount={bidCount} currentBid={currentBid} />

        {/* Watchers */}
        {watchers && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '8px',
            fontSize: '12px',
            color: 'rgb(28, 28, 28)',
            opacity: 0.7
          }}>
            <Eye size={12} />
            <span>{watchers} watching</span>
          </div>
        )}
      </div>
    );
  };

  const sections = [
    { id: 'live', label: 'Live Badges' },
    { id: 'bids', label: 'Bid Displays' },
    { id: 'tracking', label: 'Price Tracking' },
    { id: 'status', label: 'Auction Status' },
    { id: 'integration', label: 'Full Integration' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'rgb(253, 246, 227)',
      fontFamily: 'system-ui, sans-serif',
      padding: '32px 16px'
    }}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          @keyframes modernPulse {
            0%, 100% { 
              opacity: 1; 
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.8);
            }
            50% { 
              opacity: 0.8; 
              transform: scale(1.1);
              box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.2);
            }
          }
          @keyframes fastPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.02); }
          }
        `}
      </style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{
          fontFamily: 'Impact, "Arial Black", sans-serif',
          fontSize: '48px',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          color: 'rgb(214, 40, 40)',
          margin: '0 0 16px 0',
          textShadow: '3px 3px 0px rgb(28, 28, 28)'
        }}>
          eBay Integration Styles
        </h1>
        <p style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '18px',
          color: 'rgb(28, 28, 28)',
          opacity: 0.7,
          margin: 0
        }}>
          Live auctions, bid tracking, and price monitoring
        </p>
      </div>

      {/* Section Navigation */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setCurrentSection(section.id)}
              style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                border: '3px solid rgb(28, 28, 28)',
                padding: '8px 16px',
                cursor: 'pointer',
                backgroundColor: currentSection === section.id ? 'rgb(214, 40, 40)' : 'rgb(253, 246, 227)',
                color: currentSection === section.id ? 'rgb(253, 246, 227)' : 'rgb(28, 28, 28)',
                boxShadow: currentSection === section.id ? '6px 6px 0px rgb(28, 28, 28)' : '3px 3px 0px rgb(28, 28, 28)',
                transform: currentSection === section.id ? 'translate(-2px, -2px)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Live Badges */}
        {currentSection === 'live' && (
          <div style={{
            backgroundColor: 'rgb(253, 246, 227)',
            border: '3px solid rgb(28, 28, 28)',
            boxShadow: '6px 6px 0px rgb(28, 28, 28)',
            padding: '32px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontFamily: 'Impact, "Arial Black", sans-serif',
              fontSize: '24px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'rgb(28, 28, 28)',
              margin: '0 0 24px 0',
              textAlign: 'center'
            }}>
              Live Auction Badges
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Live Auction
                </h4>
                <LiveAuctionBadge status="live" timeLeft={liveTime} />
                <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                  Active bidding with countdown
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Ending Soon
                </h4>
                <LiveAuctionBadge status="ending" timeLeft="47m 12s" />
                <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                  Less than 1 hour remaining
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Watching Item
                </h4>
                <LiveAuctionBadge status="watching" />
                <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                  Item in watchlist
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Auction Ended
                </h4>
                <LiveAuctionBadge status="ended" animated={false} />
                <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                  Bidding has closed
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bid Displays */}
        {currentSection === 'bids' && (
          <div style={{
            backgroundColor: 'rgb(253, 246, 227)',
            border: '3px solid rgb(28, 28, 28)',
            boxShadow: '6px 6px 0px rgb(28, 28, 28)',
            padding: '32px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontFamily: 'Impact, "Arial Black", sans-serif',
              fontSize: '24px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'rgb(28, 28, 28)',
              margin: '0 0 24px 0',
              textAlign: 'center'
            }}>
              Bid Count Displays
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Small Size
                </h4>
                <BidCountDisplay bidCount={15} currentBid="45.50" size="sm" />
              </div>

              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Medium Size
                </h4>
                <BidCountDisplay bidCount={8} currentBid="125.00" size="md" />
              </div>

              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Large Size
                </h4>
                <BidCountDisplay bidCount={23} currentBid="89.99" size="lg" />
              </div>

              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Single Bid
                </h4>
                <BidCountDisplay bidCount={1} currentBid="25.00" size="md" />
              </div>
            </div>
          </div>
        )}

        {/* Price Tracking */}
        {currentSection === 'tracking' && (
          <div style={{
            backgroundColor: 'rgb(253, 246, 227)',
            border: '3px solid rgb(28, 28, 28)',
            boxShadow: '6px 6px 0px rgb(28, 28, 28)',
            padding: '32px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontFamily: 'Impact, "Arial Black", sans-serif',
              fontSize: '24px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'rgb(28, 28, 28)',
              margin: '0 0 24px 0',
              textAlign: 'center'
            }}>
              Price Tracking Indicators
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', textAlign: 'center' }}>
              <div>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Price Increase
                </h4>
                <PriceTrackingIndicator change="12.50" percentage="+15.3" trend="up" />
                <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                  Value has increased
                </p>
              </div>

              <div>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Price Decrease
                </h4>
                <PriceTrackingIndicator change="8.25" percentage="-9.2" trend="down" />
                <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                  Value has decreased
                </p>
              </div>

              <div>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Price Stable
                </h4>
                <PriceTrackingIndicator change="0.00" percentage="0.0" trend="flat" />
                <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                  No change in value
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Auction Status */}
        {currentSection === 'status' && (
          <div style={{
            backgroundColor: 'rgb(253, 246, 227)',
            border: '3px solid rgb(28, 28, 28)',
            boxShadow: '6px 6px 0px rgb(28, 28, 28)',
            padding: '32px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontFamily: 'Impact, "Arial Black", sans-serif',
              fontSize: '24px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'rgb(28, 28, 28)',
              margin: '0 0 24px 0',
              textAlign: 'center'
            }}>
              Auction Status Types
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
              <AuctionStatusBadge status="auction" watchers={23} seller="comics_r_us" />
              <AuctionStatusBadge status="buy-it-now" watchers={8} seller="vintage_vault" />
              <AuctionStatusBadge status="best-offer" watchers={15} seller="comic_king" />
              <AuctionStatusBadge status="sold" seller="super_seller" />
            </div>
          </div>
        )}

        {/* Full Integration */}
        {currentSection === 'integration' && (
          <div style={{
            backgroundColor: 'rgb(253, 246, 227)',
            border: '3px solid rgb(28, 28, 28)',
            boxShadow: '6px 6px 0px rgb(28, 28, 28)',
            padding: '32px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontFamily: 'Impact, "Arial Black", sans-serif',
              fontSize: '24px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'rgb(28, 28, 28)',
              margin: '0 0 24px 0',
              textAlign: 'center'
            }}>
              Full eBay Integration Cards
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', justifyItems: 'center' }}>
              <EbayIntegrationCard
                title="Amazing Spider-Man #1"
                currentBid="850.00"
                bidCount={12}
                timeLeft={liveTime}
                watchers={45}
                status="live"
              />
              
              <EbayIntegrationCard
                title="X-Men #94"
                currentBid="425.50"
                bidCount={8}
                timeLeft="12m 34s"
                watchers={23}
                status="ending"
              />
              
              <EbayIntegrationCard
                title="Batman #1"
                currentBid="1250.00"
                bidCount={0}
                watchers={67}
                status="watching"
              />
            </div>

            <div style={{
              marginTop: '32px',
              padding: '16px',
              backgroundColor: 'rgba(0, 119, 181, 0.1)',
              border: '2px solid rgb(0, 119, 181)',
              boxShadow: '2px 2px 0px rgb(0, 119, 181)'
            }}>
              <h4 style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                fontWeight: '600',
                color: 'rgb(28, 28, 28)',
                margin: '0 0 8px 0'
              }}>
                eBay Integration Features:
              </h4>
              <ul style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                color: 'rgb(28, 28, 28)',
                margin: 0,
                paddingLeft: '16px'
              }}>
                <li>Real-time auction countdown timers</li>
                <li>Live bid tracking and current price display</li>
                <li>Watcher count for popularity indication</li>
                <li>Different status types (Live, Buy It Now, Best Offer, Sold)</li>
                <li>Price change indicators with trend arrows</li>
                <li>Direct links to eBay listings</li>
                <li>Visual feedback for ending soon auctions</li>
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default EbayIntegrationShowcase;