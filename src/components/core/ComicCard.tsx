import React from 'react';

interface ComicCardProps {
  title: string;
  issue?: string;
  publisher?: string;
  year?: string;
  condition?: string;
  value?: string;
  imageUrl?: string;
  onClick?: () => void;
  variant?: 'collection' | 'marketplace';
  showDetails?: boolean;
}

const ComicCard: React.FC<ComicCardProps> = ({
  title,
  issue,
  publisher,
  year,
  condition,
  value,
  imageUrl,
  onClick,
  variant = 'collection',
  showDetails = true
}) => {
  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        border: '3px solid rgb(28, 28, 28)',
        boxShadow: '4px 4px 0px rgb(28, 28, 28)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translate(-2px, -2px)';
          e.currentTarget.style.boxShadow = '6px 6px 0px rgb(28, 28, 28)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '4px 4px 0px rgb(28, 28, 28)';
        }
      }}
    >
      {/* Comic Cover */}
      <div style={{
        height: variant === 'collection' ? '200px' : '250px',
        backgroundColor: imageUrl ? 'transparent' : 'rgb(229, 231, 235)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '2px solid rgb(28, 28, 28)',
        backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: 'Impact, "Arial Black", sans-serif',
        fontSize: '18px',
        color: 'rgb(107, 114, 128)'
      }}>
        {!imageUrl && title}
      </div>

      {/* Comic Info */}
      <div style={{ padding: '16px' }}>
        <h3 style={{
          fontFamily: 'Impact, "Arial Black", sans-serif',
          fontSize: '18px',
          color: 'rgb(28, 28, 28)',
          margin: '0 0 8px 0',
          textTransform: 'uppercase'
        }}>
          {title} {issue}
        </h3>
        
        {showDetails && (
          <>
            {(publisher || year) && (
              <div style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                color: 'rgb(107, 114, 128)',
                marginBottom: '12px'
              }}>
                {publisher} {publisher && year && '•'} {year}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {condition && (
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: 'rgb(34, 197, 94)',
                  color: 'white',
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {condition}
                </span>
              )}
              {value && (
                <span style={{
                  fontFamily: 'Impact, "Arial Black", sans-serif',
                  fontSize: '20px',
                  color: 'rgb(214, 40, 40)'
                }}>
                  {value}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ComicCard;