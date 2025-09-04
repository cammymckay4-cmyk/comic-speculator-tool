import React, { useState, useEffect } from 'react'
import { 
  Filter, 
  Grid, 
  List, 
  Plus,
  Star,
  BookOpen
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ComicCard from '@/components/ui/ComicCard'
import SearchBar from '@/components/features/SearchBar'
import FilterPanel from '@/components/features/FilterPanel'
import SortDropdown from '@/components/features/SortDropdown'
import Pagination from '@/components/features/Pagination'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ComicSearchModal from '@/components/features/ComicSearchModal'
import { useWishlistQuery, useWishlistCount } from '@/hooks/useWishlistQuery'
import { useUserStore } from '@/store/userStore'

const WishlistPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [showComicSearchModal, setShowComicSearchModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState('added-date')
  const [activeFilters, setActiveFilters] = useState({
    publishers: [] as string[],
    conditions: [] as string[],
    priceRange: { min: '', max: '' },
    yearRange: { min: '', max: '' },
  })
  
  const itemsPerPage = 12

  // Convert activeFilters to wishlist filters format
  const wishlistFilters = {
    searchTerm,
    publishers: activeFilters.publishers,
    priceRange: {
      min: activeFilters.priceRange.min ? parseFloat(activeFilters.priceRange.min) : undefined,
      max: activeFilters.priceRange.max ? parseFloat(activeFilters.priceRange.max) : undefined,
    }
  }

  // Fetch user wishlist data
  const { data: wishlistItems, isLoading, isError, error } = useWishlistQuery({
    filters: wishlistFilters,
    sortOrder,
    page: currentPage,
    itemsPerPage
  })

  // Get total count for pagination
  const { data: totalItems } = useWishlistCount(wishlistFilters)

  // Transform wishlist items for display (matching ComicCard expected format)
  const displayComics = wishlistItems?.map(wishlistItem => ({
    id: wishlistItem.comic.id,
    entryId: wishlistItem.id, // Wishlist entry ID for removal operations
    title: wishlistItem.comic.title,
    issue: wishlistItem.comic.issue,
    publisher: wishlistItem.comic.publisher,
    coverImage: wishlistItem.comic.coverImage,
    value: `£${wishlistItem.comic.marketValue || 0}`,
    marketValue: wishlistItem.comic.marketValue || 0,
    trend: 'neutral' as 'up' | 'down' | 'neutral',
    change: '+0%',
    targetCondition: wishlistItem.targetCondition,
    maxPrice: wishlistItem.maxPrice,
    notes: wishlistItem.notes,
    addedDate: wishlistItem.addedDate ? new Date(wishlistItem.addedDate).toLocaleDateString() : 'N/A',
  })) || []

  const totalPages = Math.ceil((totalItems || 0) / itemsPerPage)

  // Reset current page when search term, sort order, or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortOrder, activeFilters])

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your wishlist" />
      </div>
    )
  }

  // Handle error state
  if (isError) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="bg-white comic-border shadow-comic p-8 max-w-md text-center">
          <h2 className="font-super-squad text-2xl text-kirby-red mb-4">Oops! Something went wrong</h2>
          <p className="font-persona-aura text-ink-black mb-4">
            We couldn't load your wishlist. Please try again later.
          </p>
          <p className="font-persona-aura text-sm text-gray-600">
            Error: {error?.message}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="comic-button mt-4"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-kirby-red to-stan-lee-blue py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-super-squad text-4xl md:text-5xl text-parchment mb-4">
            MY WISHLIST
          </h1>
          <p className="font-persona-aura text-parchment opacity-90 text-lg max-w-2xl">
            Comics you want but don't own yet. Track the issues you're hunting for!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-none border-2 border-parchment p-4">
              <p className="font-persona-aura text-parchment opacity-80 text-sm">Total Wishlist Items</p>
              <p className="font-super-squad text-2xl text-parchment">{totalItems || 0}</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-none border-2 border-parchment p-4">
              <p className="font-persona-aura text-parchment opacity-80 text-sm">Estimated Total Value</p>
              <p className="font-super-squad text-2xl text-parchment">
                £{displayComics.reduce((total, comic) => total + comic.marketValue, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="sticky top-16 z-30 bg-white border-b-comic border-ink-black shadow-comic">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left Section - Search and Filter */}
            <div className="flex-1 flex gap-4">
              <SearchBar 
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search your wishlist..."
                className="flex-1"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`comic-button flex items-center space-x-2 ${showFilters ? 'bg-golden-age-yellow' : ''}`}
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>

            {/* Right Section - Sort and View Controls */}
            <div className="flex gap-4 items-center">
              <SortDropdown 
                value={sortOrder}
                onChange={setSortOrder}
              />
              
              {/* View Mode Toggle */}
              <div className="flex border-comic border-ink-black shadow-comic-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-kirby-red text-parchment' : 'bg-white text-ink-black'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 border-l-2 border-ink-black ${viewMode === 'list' ? 'bg-kirby-red text-parchment' : 'bg-white text-ink-black'}`}
                >
                  <List size={18} />
                </button>
              </div>

              {/* Navigation Buttons */}
              <button 
                onClick={() => navigate('/collection')}
                className="comic-button flex items-center space-x-2 bg-stan-lee-blue text-parchment"
              >
                <BookOpen size={18} />
                <span className="hidden sm:inline">Collection</span>
              </button>
              
              <button 
                onClick={() => setShowComicSearchModal(true)}
                className="comic-button flex items-center space-x-2"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Comic</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel 
          onClose={() => setShowFilters(false)}
          onApply={(filters) => {
            setActiveFilters(filters)
            setCurrentPage(1)
            setShowFilters(false)
          }}
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Comics Grid/List */}
        {displayComics.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white comic-border shadow-comic p-8 max-w-md mx-auto">
              <Star size={48} className="text-golden-age-yellow mx-auto mb-4" />
              <h3 className="font-super-squad text-2xl text-ink-black mb-4">Your Wishlist is Empty</h3>
              <p className="font-persona-aura text-gray-600 mb-6">
                Start adding comics you want to your wishlist! Use the heart icon on any comic card to add it to your wishlist.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowComicSearchModal(true)}
                  className="comic-button flex items-center space-x-2 mx-auto"
                >
                  <Plus size={18} />
                  <span>Browse Comics</span>
                </button>
                <button 
                  onClick={() => navigate('/collection')}
                  className="comic-button bg-stan-lee-blue text-parchment flex items-center space-x-2 mx-auto"
                >
                  <BookOpen size={18} />
                  <span>View Collection</span>
                </button>
              </div>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayComics.map((comic) => (
              <ComicCard 
                key={comic.id} 
                comic={comic} 
                variant="detailed"
                showWishlist={false} // Don't show wishlist button on wishlist page
                onClick={() => navigate(`/comic/${comic.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {displayComics.map((comic) => (
              <div key={comic.id} className="bg-white comic-border shadow-comic p-4 flex items-center space-x-4 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform">
                <img
                  src={comic.coverImage}
                  alt={`${comic.title} ${comic.issue}`}
                  className="w-20 h-28 object-cover border-2 border-ink-black cursor-pointer"
                  onClick={() => navigate(`/comic/${comic.id}`)}
                />
                <div className="flex-1">
                  <h3 className="font-super-squad text-lg text-ink-black">{comic.title} {comic.issue}</h3>
                  <p className="font-persona-aura text-sm text-gray-600">{comic.publisher}</p>
                  {comic.targetCondition && (
                    <p className="font-persona-aura text-sm text-gray-600">Target Condition: {comic.targetCondition}</p>
                  )}
                  {comic.maxPrice && (
                    <p className="font-persona-aura text-sm text-gray-600">Max Price: £{comic.maxPrice}</p>
                  )}
                  <p className="font-persona-aura text-sm text-gray-600">Added: {comic.addedDate}</p>
                  {comic.notes && (
                    <p className="font-persona-aura text-sm text-gray-500 italic mt-1">{comic.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-super-squad text-xl text-ink-black">{comic.value}</p>
                  <p className="font-persona-aura text-sm text-gray-600">Market Value</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Comic Search Modal */}
      <ComicSearchModal 
        isOpen={showComicSearchModal}
        onClose={() => setShowComicSearchModal(false)}
      />
    </div>
  )
}

export default WishlistPage