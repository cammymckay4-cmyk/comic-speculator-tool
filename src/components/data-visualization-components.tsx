import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Target, Star, DollarSign, Calendar } from 'lucide-react';

const DataVisualizationShowcase = () => {
  const [currentSection, setCurrentSection] = useState('price-charts');
  const [chartPeriod, setChartPeriod] = useState('6M');

  // Mock data for charts
  const priceHistoryData = [
    { month: 'Jan', value: 1250, change: 0 },
    { month: 'Feb', value: 1180, change: -70 },
    { month: 'Mar', value: 1320, change: 140 },
    { month: 'Apr', value: 1450, change: 130 },
    { month: 'May', value: 1380, change: -70 },
    { month: 'Jun', value: 1520, change: 140 }
  ];

  const collectionData = [
    { category: 'Marvel', value: 15420, count: 45, color: 'rgb(214, 40, 40)' },
    { category: 'DC', value: 12850, count: 38, color: 'rgb(0, 119, 181)' },
    { category: 'Image', value: 5680, count: 22, color: 'rgb(247, 181, 56)' },
    { category: 'Dark Horse', value: 3200, count: 15, color: 'rgb(147, 51, 234)' },
    { category: 'Other', value: 2850, count: 12, color: 'rgb(107, 114, 128)' }
  ];

  // Price History Chart
  const PriceHistoryChart = ({ data, period }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;
    const chartHeight = 200;

    return (
      <div style={{
        backgroundColor: 'rgb(253, 246, 227)',
        border: '3px solid rgb(28, 28, 28)',
        boxShadow: '6px 6px 0px rgb(28, 28, 28)',
        padding: '24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '2px solid rgb(28, 28, 28)'
        }}>
          <div>
            <h3 style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '18px',
              fontWeight: '600',
              color: 'rgb(28, 28, 28)',
              margin: '0 0 4px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Collection Value Trend
            </h3>
            <p style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
              color: 'rgb(107, 114, 128)',
              margin: 0
            }}>
              Total portfolio value over time
            </p>
          </div>
          
          {/* Period Selector */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {['1M', '3M', '6M', '1Y', 'ALL'].map((p) => (
              <button
                key={p}
                onClick={() => setChartPeriod(p)}
                style={{
                  backgroundColor: period === p ? 'rgb(214, 40, 40)' : 'rgb(253, 246, 227)',
                  color: period === p ? 'rgb(253, 246, 227)' : 'rgb(28, 28, 28)',
                  border: '2px solid rgb(28, 28, 28)',
                  boxShadow: period === p ? '3px 3px 0px rgb(28, 28, 28)' : '2px 2px 0px rgb(28, 28, 28)',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '12px',
                  fontWeight: '600',
                  transform: period === p ? 'translate(-1px, -1px)' : 'none'
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Area */}
        <div style={{ position: 'relative', height: `${chartHeight}px`, marginBottom: '20px' }}>
          {/* Y-axis labels */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '60px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            paddingRight: '10px'
          }}>
            <span style={{ fontSize: '12px', color: 'rgb(107, 114, 128)' }}>£{Math.round(maxValue)}</span>
            <span style={{ fontSize: '12px', color: 'rgb(107, 114, 128)' }}>£{Math.round((maxValue + minValue) / 2)}</span>
            <span style={{ fontSize: '12px', color: 'rgb(107, 114, 128)' }}>£{Math.round(minValue)}</span>
          </div>

          {/* Chart container */}
          <div style={{
            marginLeft: '60px',
            height: '100%',
            backgroundColor: 'rgb(243, 244, 246)',
            border: '2px solid rgb(28, 28, 28)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Grid lines */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: `
                linear-gradient(to bottom, transparent 0%, transparent 32%, rgba(28, 28, 28, 0.1) 33%, rgba(28, 28, 28, 0.1) 33%, transparent 34%),
                linear-gradient(to bottom, transparent 0%, transparent 65%, rgba(28, 28, 28, 0.1) 66%, rgba(28, 28, 28, 0.1) 66%, transparent 67%)
              `
            }} />

            {/* Line chart */}
            <svg style={{ width: '100%', height: '100%', position: 'absolute' }}>
              {/* Chart line */}
              <polyline
                fill="none"
                stroke="rgb(214, 40, 40)"
                strokeWidth="2"
                points={data.map((point, index) => {
                  const x = (index / (data.length - 1)) * 100;
                  const y = 100 - ((point.value - minValue) / range) * 100;
                  return `${x}%,${y}%`;
                }).join(' ')}
              />
            </svg>
          </div>
        </div>

        {/* X-axis labels */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginLeft: '60px',
          fontSize: '12px',
          color: 'rgb(107, 114, 128)'
        }}>
          {data.map((point, index) => (
            <span key={index}>{point.month}</span>
          ))}
        </div>

        {/* Summary Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '2px solid rgb(28, 28, 28)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: 'rgb(28, 28, 28)' }}>
              £{data[data.length - 1].value}
            </div>
            <div style={{ fontSize: '12px', color: 'rgb(107, 114, 128)' }}>Current Value</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: data[data.length - 1].change >= 0 ? 'rgb(34, 197, 94)' : 'rgb(214, 40, 40)' 
            }}>
              {data[data.length - 1].change >= 0 ? '+' : ''}£{data[data.length - 1].change}
            </div>
            <div style={{ fontSize: '12px', color: 'rgb(107, 114, 128)' }}>This Month</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: 'rgb(34, 197, 94)' }}>
              +£{data[data.length - 1].value - data[0].value}
            </div>
            <div style={{ fontSize: '12px', color: 'rgb(107, 114, 128)' }}>Total Gain</div>
          </div>
        </div>
      </div>
    );
  };

  // Collection Value Display
  const CollectionValueDisplay = ({ totalValue, todayChange, percentChange }) => {
    const isPositive = todayChange >= 0;

    return (
      <div style={{
        backgroundColor: 'rgb(253, 246, 227)',
        border: '3px solid rgb(28, 28, 28)',
        boxShadow: '6px 6px 0px rgb(28, 28, 28)',
        padding: '24px',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '16px',
          fontWeight: '600',
          color: 'rgb(107, 114, 128)',
          margin: '0 0 8px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Total Collection Value
        </h2>
        
        <div style={{
          fontSize: '48px',
          fontWeight: '900',
          color: 'rgb(28, 28, 28)',
          margin: '0 0 12px 0',
          fontFamily: 'system-ui, sans-serif'
        }}>
          £{totalValue.toLocaleString()}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          backgroundColor: isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(214, 40, 40, 0.1)',
          border: `2px solid ${isPositive ? 'rgb(34, 197, 94)' : 'rgb(214, 40, 40)'}`,
          boxShadow: `2px 2px 0px ${isPositive ? 'rgb(34, 197, 94)' : 'rgb(214, 40, 40)'}`,
          padding: '8px 16px',
          margin: '0 auto',
          width: 'fit-content'
        }}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            fontWeight: '600',
            color: isPositive ? 'rgb(34, 197, 94)' : 'rgb(214, 40, 40)'
          }}>
            {isPositive ? '+' : ''}£{Math.abs(todayChange)} ({percentChange}%) today
          </span>
        </div>
      </div>
    );
  };

  // Collection Breakdown (Pie Chart Style)
  const CollectionBreakdown = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
      <div style={{
        backgroundColor: 'rgb(253, 246, 227)',
        border: '3px solid rgb(28, 28, 28)',
        boxShadow: '6px 6px 0px rgb(28, 28, 28)',
        padding: '24px'
      }}>
        <h3 style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '18px',
          fontWeight: '600',
          color: 'rgb(28, 28, 28)',
          margin: '0 0 20px 0',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Collection by Publisher
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          {/* Publisher Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {data.map((item, index) => {
              const percentage = ((item.value / total) * 100).toFixed(1);
              return (
                <div key={index} style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '120px 1fr 140px', 
                  alignItems: 'center', 
                  gap: '16px',
                  padding: '12px',
                  backgroundColor: 'rgba(243, 244, 246, 0.3)',
                  border: '2px solid rgb(28, 28, 28)',
                  boxShadow: '2px 2px 0px rgb(28, 28, 28)'
                }}>
                  {/* Publisher Name with Color */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: item.color,
                      border: '2px solid rgb(28, 28, 28)',
                      boxShadow: '2px 2px 0px rgb(28, 28, 28)',
                      flexShrink: 0
                    }} />
                    <span style={{
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'rgb(28, 28, 28)'
                    }}>
                      {item.category}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    height: '28px',
                    backgroundColor: 'rgb(243, 244, 246)',
                    border: '2px solid rgb(28, 28, 28)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: item.color,
                      transition: 'width 1s ease-out',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: '8px'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: 'rgb(255, 255, 255)',
                        textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
                      }}>
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Values */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: '18px',
                      fontWeight: '700',
                      color: 'rgb(28, 28, 28)'
                    }}>
                      £{item.value.toLocaleString()}
                    </div>
                    <div style={{
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: '12px',
                      color: 'rgb(107, 114, 128)'
                    }}>
                      {item.count} comics
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Progress Bars
  const ProgressBar = ({ label, current, target, color, showPercentage = true }) => {
    const percentage = Math.min((current / target) * 100, 100);
    const isComplete = current >= target;

    return (
      <div style={{
        backgroundColor: 'rgb(253, 246, 227)',
        border: '2px solid rgb(28, 28, 28)',
        boxShadow: '3px 3px 0px rgb(28, 28, 28)',
        padding: '16px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            color: 'rgb(28, 28, 28)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {label}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isComplete && <Star size={16} color="rgb(247, 181, 56)" fill="rgb(247, 181, 56)" />}
            <span style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
              fontWeight: '700',
              color: isComplete ? 'rgb(34, 197, 94)' : 'rgb(28, 28, 28)'
            }}>
              {current} / {target}
            </span>
          </div>
        </div>

        <div style={{
          width: '100%',
          height: '12px',
          backgroundColor: 'rgb(243, 244, 246)',
          border: '2px solid rgb(28, 28, 28)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: color,
            transition: 'width 0.8s ease-out',
            position: 'relative'
          }}>
            {/* Shine effect */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: percentage > 0 ? 'shine 2s infinite' : 'none'
            }} />
          </div>
          
          {showPercentage && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: '700',
              color: percentage > 50 ? 'rgb(255, 255, 255)' : 'rgb(28, 28, 28)',
              textShadow: percentage > 50 ? '1px 1px 0px rgba(0,0,0,0.5)' : 'none'
            }}>
              {Math.round(percentage)}%
            </div>
          )}
        </div>

        <style>
          {`
            @keyframes shine {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}
        </style>
      </div>
    );
  };

  // Market Comparison Component
  const MarketComparison = () => {
    const comparisonData = [
      { metric: 'Avg. Comic Value', your: 285, market: 240, better: true },
      { metric: 'Portfolio Growth', your: 15.3, market: 12.7, better: true, isPercentage: true },
      { metric: 'Collection Size', your: 132, market: 89, better: true },
      { metric: 'Recent Acquisitions', your: 8, market: 12, better: false }
    ];

    return (
      <div style={{
        backgroundColor: 'rgb(253, 246, 227)',
        border: '3px solid rgb(28, 28, 28)',
        boxShadow: '6px 6px 0px rgb(28, 28, 28)',
        padding: '24px'
      }}>
        <h3 style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '18px',
          fontWeight: '600',
          color: 'rgb(28, 28, 28)',
          margin: '0 0 20px 0',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Your Collection vs Market Average
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {comparisonData.map((item, index) => (
            <div key={index} style={{
              backgroundColor: item.better ? 'rgba(34, 197, 94, 0.1)' : 'rgba(214, 40, 40, 0.1)',
              border: `2px solid ${item.better ? 'rgb(34, 197, 94)' : 'rgb(214, 40, 40)'}`,
              boxShadow: `2px 2px 0px ${item.better ? 'rgb(34, 197, 94)' : 'rgb(214, 40, 40)'}`,
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '12px',
                fontWeight: '600',
                color: 'rgb(107, 114, 128)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px'
              }}>
                {item.metric}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: 'rgb(28, 28, 28)'
                  }}>
                    {item.isPercentage ? '+' : ''}{item.your}{item.isPercentage ? '%' : ''}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: 'rgb(107, 114, 128)'
                  }}>
                    You
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: item.better ? 'rgb(34, 197, 94)' : 'rgb(214, 40, 40)'
                }}>
                  {item.better ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>

                <div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'rgb(107, 114, 128)'
                  }}>
                    {item.isPercentage ? '+' : ''}{item.market}{item.isPercentage ? '%' : ''}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: 'rgb(107, 114, 128)'
                  }}>
                    Market
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const sections = [
    { id: 'price-charts', label: 'Price History' },
    { id: 'collection-value', label: 'Collection Value' },
    { id: 'breakdown', label: 'Collection Breakdown' },
    { id: 'progress', label: 'Progress Tracking' },
    { id: 'comparison', label: 'Market Comparison' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'rgb(253, 246, 227)',
      fontFamily: 'system-ui, sans-serif',
      padding: '32px 16px'
    }}>
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
          Data Visualization
        </h1>
        <p style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '18px',
          color: 'rgb(28, 28, 28)',
          opacity: 0.7,
          margin: 0
        }}>
          Charts, analytics, and collection insights
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

        {/* Price History Charts */}
        {currentSection === 'price-charts' && (
          <PriceHistoryChart data={priceHistoryData} period={chartPeriod} />
        )}

        {/* Collection Value Display */}
        {currentSection === 'collection-value' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <CollectionValueDisplay 
              totalValue={40000} 
              todayChange={520} 
              percentChange="+1.3" 
            />
            <CollectionValueDisplay 
              totalValue={15750} 
              todayChange={-180} 
              percentChange="-1.1" 
            />
          </div>
        )}

        {/* Collection Breakdown */}
        {currentSection === 'breakdown' && (
          <CollectionBreakdown data={collectionData} />
        )}

        {/* Progress Tracking */}
        {currentSection === 'progress' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <ProgressBar 
              label="Marvel Complete Run" 
              current={47} 
              target={60} 
              color="rgb(214, 40, 40)" 
            />
            <ProgressBar 
              label="Golden Age Collection" 
              current={25} 
              target={25} 
              color="rgb(247, 181, 56)" 
            />
            <ProgressBar 
              label="Investment Goal" 
              current={28500} 
              target={50000} 
              color="rgb(34, 197, 94)" 
            />
            <ProgressBar 
              label="Key Issues Found" 
              current={12} 
              target={20} 
              color="rgb(147, 51, 234)" 
            />
          </div>
        )}

        {/* Market Comparison */}
        {currentSection === 'comparison' && (
          <MarketComparison />
        )}

      </div>
    </div>
  );
};

export default DataVisualizationShowcase;