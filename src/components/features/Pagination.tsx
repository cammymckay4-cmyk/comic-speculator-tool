import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  const getPageNumbers = () => {
    const pages = []
    const showEllipsis = totalPages > 7
    
    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push('...')
      }
      
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(currentPage + 1, totalPages - 1); i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...')
      }
      
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {/* First Page */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="p-2 bg-white border-comic border-ink-black shadow-comic-sm
                 hover:bg-golden-age-yellow hover:translate-x-[-2px] hover:translate-y-[-2px] 
                 hover:shadow-comic transition-all duration-150
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 
                 disabled:hover:translate-y-0 disabled:hover:bg-white"
        aria-label="First page"
      >
        <ChevronsLeft size={18} className="text-ink-black" />
      </button>

      {/* Previous Page */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 bg-white border-comic border-ink-black shadow-comic-sm
                 hover:bg-golden-age-yellow hover:translate-x-[-2px] hover:translate-y-[-2px] 
                 hover:shadow-comic transition-all duration-150
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 
                 disabled:hover:translate-y-0 disabled:hover:bg-white"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} className="text-ink-black" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 font-persona-aura text-ink-black">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`min-w-[40px] px-3 py-2 border-comic border-ink-black shadow-comic-sm
                         font-persona-aura font-semibold transition-all duration-150
                         ${currentPage === page 
                           ? 'bg-kirby-red text-parchment translate-x-[-2px] translate-y-[-2px] shadow-comic' 
                           : 'bg-white text-ink-black hover:bg-golden-age-yellow hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-comic'
                         }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next Page */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 bg-white border-comic border-ink-black shadow-comic-sm
                 hover:bg-golden-age-yellow hover:translate-x-[-2px] hover:translate-y-[-2px] 
                 hover:shadow-comic transition-all duration-150
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 
                 disabled:hover:translate-y-0 disabled:hover:bg-white"
        aria-label="Next page"
      >
        <ChevronRight size={18} className="text-ink-black" />
      </button>

      {/* Last Page */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="p-2 bg-white border-comic border-ink-black shadow-comic-sm
                 hover:bg-golden-age-yellow hover:translate-x-[-2px] hover:translate-y-[-2px] 
                 hover:shadow-comic transition-all duration-150
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 
                 disabled:hover:translate-y-0 disabled:hover:bg-white"
        aria-label="Last page"
      >
        <ChevronsRight size={18} className="text-ink-black" />
      </button>
    </div>
  )
}

export default Pagination
