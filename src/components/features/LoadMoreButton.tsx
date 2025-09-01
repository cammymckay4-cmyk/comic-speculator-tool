import React from 'react';

interface LoadMoreButtonProps {
  loading?: boolean;
  hasMore?: boolean;
  onClick?: () => void;
  loadingText?: string;
  loadMoreText?: string;
  noMoreText?: string;
  resultsText?: string;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  loading = false,
  hasMore = true,
  onClick,
  loadingText = 'LOADING...',
  loadMoreText = 'LOAD MORE COMICS',
  noMoreText = 'NO MORE COMICS',
  resultsText = 'Showing 20 of 156 comics'
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      padding: '32px'
    }}>
      <button
        onClick={onClick}
        disabled={loading || !hasMore}
        style={{
          padding: '16px 32px',
          background: !hasMore 
            ? 'rgb(200, 200, 200)'
            : loading
            ? 'linear-gradient(135deg, rgb(107, 114, 128), rgb(75, 85, 99))'
            : 'linear-gradient(135deg, rgb(214, 40, 40), rgb(185, 28, 28))',
          color: 'rgb(255, 255, 255)',
          border: '3px solid rgb(28, 28, 28)',
          boxShadow: '4px 4px 0px rgb(28, 28, 28)',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '16px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          cursor: !hasMore || loading ? 'not-allowed' : 'pointer',
          opacity: !hasMore ? 0.5 : 1,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (hasMore && !loading) {
            e.currentTarget.style.transform = 'translate(-2px, -2px)';
            e.currentTarget.style.boxShadow = '6px 6px 0px rgb(28, 28, 28)';
          }
        }}
        onMouseLeave={(e) => {
          if (hasMore && !loading) {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '4px 4px 0px rgb(28, 28, 28)';
          }
        }}
      >
        {loading ? loadingText : hasMore ? loadMoreText : noMoreText}
      </button>

      {hasMore && resultsText && (
        <span style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          color: 'rgb(107, 114, 128)'
        }}>
          {resultsText}
        </span>
      )}
    </div>
  );
};

export default LoadMoreButton;