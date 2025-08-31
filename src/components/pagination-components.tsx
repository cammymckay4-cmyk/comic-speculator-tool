import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowLeft,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';

const PaginationShowcase = () => {
  const [currentSection, setCurrentSection] = useState('classic');
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 42;

  // Classic Pagination Component
  const ClassicPagination = ({ current = 1, total = 10, onPageChange }) => {
    const [page, setPage] = useState(current);

    const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= total) {
        setPage(newPage);
        onPageChange?.(newPage);
      }
    };

    // Generate page numbers to show
    const getPageNumbers = () => {
      const pages = [];
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
              onClick={() => handlePageChange(pageNum)}
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

  // Compact Pagination
  const CompactPagination = ({ current = 1, total = 10, onPageChange }) => {
    const [page, setPage] = useState(current);

    const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= total) {
        setPage(newPage);
        onPageChange?.(newPage);
      }
    };

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
  };

  // Load More Button
  const LoadMoreButton = ({ loading = false, hasMore = true, onClick }) => {
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
            cursor: !hasMore ? 'not-allowed' : 'pointer',
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
          {loading ? 'LOADING...' : hasMore ? 'LOAD MORE COMICS' : 'NO MORE COMICS'}
        </button>

        {hasMore && (
          <span style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
            color: 'rgb(107, 114, 128)'
          }}>
            Showing 20 of 156 comics
          </span>
        )}
      </div>
    );
  };

  // Jump to Page Component
  const JumpToPage = ({ total = 10, onPageChange }) => {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleJump = () => {
      const pageNum = parseInt(inputValue);
      if (pageNum >= 1 && pageNum <= total) {
        onPageChange?.(pageNum);
        setInputValue('');
        setIsOpen(false);
      }
    };

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            style={{
              padding: '10px 16px',
              background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
              color: 'rgb(28, 28, 28)',
              border: '3px solid rgb(28, 28, 28)',
              boxShadow: '3px 3px 0px rgb(28, 28, 28)',
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-1px, -1px)';
              e.currentTarget.style.boxShadow = '4px 4px 0px rgb(28, 28, 28)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '3px 3px 0px rgb(28, 28, 28)';
            }}
          >
            Jump to Page
          </button>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
            border: '3px solid rgb(28, 28, 28)',
            boxShadow: '3px 3px 0px rgb(28, 28, 28)'
          }}>
            <span style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              color: 'rgb(28, 28, 28)'
            }}>
              Go to:
            </span>
            <input
              type="number"
              min="1"
              max={total}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="#"
              style={{
                width: '60px',
                padding: '6px',
                background: 'rgb(255, 255, 255)',
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: '600',
                textAlign: 'center',
                outline: 'none'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleJump();
                }
              }}
            />
            <button
              onClick={handleJump}
              style={{
                padding: '6px 12px',
                background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
                color: 'rgb(255, 255, 255)',
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: '2px 2px 0px rgb(28, 28, 28)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              GO
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setInputValue('');
              }}
              style={{
                padding: '6px 12px',
                background: 'linear-gradient(135deg, rgb(214, 40, 40), rgb(185, 28, 28))',
                color: 'rgb(255, 255, 255)',
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: '2px 2px 0px rgb(28, 28, 28)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    );
  };

  // Results Per Page Selector
  const ResultsPerPage = ({ options = [12, 24, 48, 96], selected = 24, onChange }) => {
    const [current, setCurrent] = useState(selected);

    const handleChange = (value) => {
      setCurrent(value);
      onChange?.(value);
    };

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
        border: '3px solid rgb(28, 28, 28)',
        boxShadow: '3px 3px 0px rgb(28, 28, 28)'
      }}>
        <span style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: '600',
          color: 'rgb(107, 114, 128)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Show:
        </span>
        
        <div style={{
          display: 'flex',
          gap: '4px'
        }}>
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handleChange(option)}
              style={{
                padding: '6px 12px',
                background: current === option
                  ? 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))'
                  : 'rgb(255, 255, 255)',
                color: current === option ? 'rgb(255, 255, 255)' : 'rgb(28, 28, 28)',
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: current === option ? '3px 3px 0px rgb(28, 28, 28)' : '2px 2px 0px rgb(28, 28, 28)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: current === option ? 'translate(-1px, -1px)' : 'none'
              }}
            >
              {option}
            </button>
          ))}
        </div>
        
        <span style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: '600',
          color: 'rgb(107, 114, 128)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          per page
        </span>
      </div>
    );
  };

  const sections = [
    { id: 'classic', label: 'Classic Pagination' },
    { id: 'compact', label: 'Compact Style' },
    { id: 'loadmore', label: 'Load More' },
    { id: 'extras', label: 'Extra Controls' },
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
          Pagination Components
        </h1>
        <p style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '18px',
          color: 'rgb(28, 28, 28)',
          opacity: 0.7,
          margin: 0
        }}>
          Page navigation, load more buttons, and results controls
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

        {/* Classic Pagination */}
        {currentSection === 'classic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '800px' }}>
              <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Full Pagination with Numbers</h3>
              <ClassicPagination 
                current={5} 
                total={42} 
                onPageChange={(page) => console.log('Page:', page)} 
              />
            </div>

            <div style={{ width: '100%', maxWidth: '600px' }}>
              <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Small Page Count</h3>
              <ClassicPagination 
                current={3} 
                total={7} 
                onPageChange={(page) => console.log('Page:', page)} 
              />
            </div>

            <div style={{
              padding: '24px',
              background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
              border: '3px solid rgb(28, 28, 28)',
              boxShadow: '6px 6px 0px rgb(28, 28, 28)',
              maxWidth: '600px',
              width: '100%'
            }}>
              <h4 style={{ marginBottom: '16px' }}>Features:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Smart ellipsis for large page counts</li>
                <li>Always shows first and last pages</li>
                <li>Current page highlighted in red</li>
                <li>Hover states with golden color</li>
                <li>Disabled states for first/last pages</li>
              </ul>
            </div>
          </div>
        )}

        {/* Compact Style */}
        {currentSection === 'compact' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
            <div>
              <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Compact Navigation</h3>
              <CompactPagination 
                current={15} 
                total={42} 
                onPageChange={(page) => console.log('Page:', page)} 
              />
            </div>

            <div style={{
              padding: '24px',
              background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
              border: '3px solid rgb(28, 28, 28)',
              boxShadow: '6px 6px 0px rgb(28, 28, 28)',
              maxWidth: '600px',
              width: '100%'
            }}>
              <h4 style={{ marginBottom: '16px' }}>Best For:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Mobile interfaces</li>
                <li>Limited space layouts</li>
                <li>Quick navigation with jump buttons</li>
                <li>Shows current position clearly</li>
              </ul>
            </div>
          </div>
        )}

        {/* Load More */}
        {currentSection === 'loadmore' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
            <div>
              <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Load More Button - Active</h3>
              <LoadMoreButton 
                loading={false} 
                hasMore={true} 
                onClick={() => console.log('Load more')} 
              />
            </div>

            <div>
              <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Load More Button - Loading</h3>
              <LoadMoreButton 
                loading={true} 
                hasMore={true} 
                onClick={() => console.log('Load more')} 
              />
            </div>

            <div>
              <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Load More Button - No More</h3>
              <LoadMoreButton 
                loading={false} 
                hasMore={false} 
                onClick={() => console.log('Load more')} 
              />
            </div>
          </div>
        )}

        {/* Extra Controls */}
        {currentSection === 'extras' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
            <div>
              <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Jump to Page</h3>
              <JumpToPage 
                total={42} 
                onPageChange={(page) => console.log('Jump to:', page)} 
              />
            </div>

            <div>
              <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Results Per Page</h3>
              <ResultsPerPage 
                options={[12, 24, 48, 96]} 
                selected={24} 
                onChange={(value) => console.log('Per page:', value)} 
              />
            </div>

            <div style={{
              padding: '24px',
              background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
              border: '3px solid rgb(28, 28, 28)',
              boxShadow: '6px 6px 0px rgb(28, 28, 28)',
              maxWidth: '600px',
              width: '100%'
            }}>
              <h4 style={{ marginBottom: '16px' }}>Complete Pagination Bar Example:</h4>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                padding: '16px',
                background: 'rgb(255, 255, 255)',
                border: '2px solid rgb(28, 28, 28)'
              }}>
                <CompactPagination current={3} total={10} />
                <ResultsPerPage selected={24} />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaginationShowcase;