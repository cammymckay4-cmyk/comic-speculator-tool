import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal
} from 'lucide-react';

interface PaginationProps {
  current?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  variant?: 'classic' | 'compact';
}

const Pagination: React.FC<PaginationProps> = ({
  current = 1,
  total = 10,
  onPageChange,
  variant = 'classic'
}) => {
  const [page, setPage] = useState(current);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= total) {
      setPage(newPage);
      onPageChange?.(newPage);
    }
  };

  // Generate page numbers to show for classic variant
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = total > 7;
    
    if (!showEllipsis) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(total);
      } else if (page >= total - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(total);
      }
    }
    
    return pages;
  };

  if (variant === 'compact') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
        border: '3px solid rgb(28, 28, 28)',
        boxShadow: '3px 3px 0px rgb(28, 28, 28)',
        borderRadius: '0'
      }}>
        {/* First Page */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={page === 1}
          style={{
            padding: '6px',
            background: page === 1 
              ? 'rgb(200, 200, 200)'
              : 'rgb(253, 246, 227)',
            border: '2px solid rgb(28, 28, 28)',
            boxShadow: '2px 2px 0px rgb(28, 28, 28)',
            cursor: page === 1 ? 'not-allowed' : 'pointer',
            opacity: page === 1 ? 0.5 : 1,
            display: 'flex'
          }}
          title="First Page"
        >
          <ChevronsLeft size={18} color="rgb(28, 28, 28)" />
        </button>

        {/* Previous */}
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          style={{
            padding: '6px',
            background: page === 1 
              ? 'rgb(200, 200, 200)'
              : 'rgb(253, 246, 227)',
            border: '2px solid rgb(28, 28, 28)',
            boxShadow: '2px 2px 0px rgb(28, 28, 28)',
            cursor: page === 1 ? 'not-allowed' : 'pointer',
            opacity: page === 1 ? 0.5 : 1,
            display: 'flex'
          }}
          title="Previous Page"
        >
          <ChevronLeft size={18} color="rgb(28, 28, 28)" />
        </button>

        {/* Page Info */}
        <div style={{
          padding: '6px 12px',
          background: 'linear-gradient(135deg, rgb(247, 181, 56), rgb(245, 158, 11))',
          border: '2px solid rgb(28, 28, 28)',
          boxShadow: '2px 2px 0px rgb(28, 28, 28)',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: '600',
          color: 'rgb(28, 28, 28)'
        }}>
          PAGE {page} OF {total}
        </div>

        {/* Next */}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === total}
          style={{
            padding: '6px',
            background: page === total 
              ? 'rgb(200, 200, 200)'
              : 'rgb(253, 246, 227)',
            border: '2px solid rgb(28, 28, 28)',
            boxShadow: '2px 2px 0px rgb(28, 28, 28)',
            cursor: page === total ? 'not-allowed' : 'pointer',
            opacity: page === total ? 0.5 : 1,
            display: 'flex'
          }}
          title="Next Page"
        >
          <ChevronRight size={18} color="rgb(28, 28, 28)" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => handlePageChange(total)}
          disabled={page === total}
          style={{
            padding: '6px',
            background: page === total 
              ? 'rgb(200, 200, 200)'
              : 'rgb(253, 246, 227)',
            border: '2px solid rgb(28, 28, 28)',
            boxShadow: '2px 2px 0px rgb(28, 28, 28)',
            cursor: page === total ? 'not-allowed' : 'pointer',
            opacity: page === total ? 0.5 : 1,
            display: 'flex'
          }}
          title="Last Page"
        >
          <ChevronsRight size={18} color="rgb(28, 28, 28)" />
        </button>
      </div>
    );
  }

  // Classic variant
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '16px',
      background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
      border: '3px solid rgb(28, 28, 28)',
      boxShadow: '6px 6px 0px rgb(28, 28, 28)',
      borderRadius: '0',
      flexWrap: 'wrap',
      justifyContent: 'center'
    }}>
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
        style={{
          padding: '8px 12px',
          background: page === 1 
            ? 'rgb(200, 200, 200)'
            : 'linear-gradient(135deg, rgb(107, 114, 128), rgb(75, 85, 99))',
          color: 'rgb(255, 255, 255)',
          border: '2px solid rgb(28, 28, 28)',
          boxShadow: page === 1 ? '2px 2px 0px rgb(28, 28, 28)' : '3px 3px 0px rgb(28, 28, 28)',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: '600',
          cursor: page === 1 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          opacity: page === 1 ? 0.5 : 1,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (page !== 1) {
            e.currentTarget.style.transform = 'translate(-1px, -1px)';
            e.currentTarget.style.boxShadow = '4px 4px 0px rgb(28, 28, 28)';
          }
        }}
        onMouseLeave={(e) => {
          if (page !== 1) {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '3px 3px 0px rgb(28, 28, 28)';
          }
        }}
      >
        <ChevronLeft size={16} />
        <span>PREV</span>
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((pageNum, index) => {
        if (pageNum === 'ellipsis') {
          return (
            <span 
              key={`ellipsis-${index}`}
              style={{
                padding: '8px 4px',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                color: 'rgb(107, 114, 128)'
              }}
            >
              <MoreHorizontal size={20} />
            </span>
          );
        }

        const isActive = pageNum === page;
        return (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum as number)}
            style={{
              minWidth: '40px',
              padding: '8px',
              background: isActive
                ? 'linear-gradient(135deg, rgb(214, 40, 40), rgb(185, 28, 28))'
                : 'linear-gradient(to bottom, rgb(255, 255, 255), rgb(245, 245, 245))',
              color: isActive ? 'rgb(255, 255, 255)' : 'rgb(28, 28, 28)',
              border: '2px solid rgb(28, 28, 28)',
              boxShadow: isActive ? '4px 4px 0px rgb(28, 28, 28)' : '2px 2px 0px rgb(28, 28, 28)',
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: isActive ? 'translate(-2px, -2px)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.transform = 'translate(-1px, -1px)';
                e.currentTarget.style.boxShadow = '3px 3px 0px rgb(28, 28, 28)';
                e.currentTarget.style.background = 'linear-gradient(to bottom, rgb(247, 181, 56), rgb(245, 158, 11))';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '2px 2px 0px rgb(28, 28, 28)';
                e.currentTarget.style.background = 'linear-gradient(to bottom, rgb(255, 255, 255), rgb(245, 245, 245))';
              }
            }}
          >
            {pageNum}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(page + 1)}
        disabled={page === total}
        style={{
          padding: '8px 12px',
          background: page === total 
            ? 'rgb(200, 200, 200)'
            : 'linear-gradient(135deg, rgb(107, 114, 128), rgb(75, 85, 99))',
          color: 'rgb(255, 255, 255)',
          border: '2px solid rgb(28, 28, 28)',
          boxShadow: page === total ? '2px 2px 0px rgb(28, 28, 28)' : '3px 3px 0px rgb(28, 28, 28)',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: '600',
          cursor: page === total ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          opacity: page === total ? 0.5 : 1,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (page !== total) {
            e.currentTarget.style.transform = 'translate(-1px, -1px)';
            e.currentTarget.style.boxShadow = '4px 4px 0px rgb(28, 28, 28)';
          }
        }}
        onMouseLeave={(e) => {
          if (page !== total) {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '3px 3px 0px rgb(28, 28, 28)';
          }
        }}
      >
        <span>NEXT</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;