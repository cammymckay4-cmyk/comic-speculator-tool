import React, { useState, useMemo, useEffect } from 'react'
import { 
  Filter, 
  Grid, 
  List, 
  Plus,
  Download,
  Upload,
  Star
} from 'lucide-react'
import ComicCard from '@/components/ui/ComicCard'
import SearchBar from '@/components/features/SearchBar'
import FilterPanel from '@/components/features/FilterPanel'
import SortDropdown from '@/components/features/SortDropdown'
import Pagination from '@/components/features/Pagination'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useCollectionQuery } from '@/hooks/useCollectionQuery'
import { getCollectionStats } from '@/services/collectionService'


const CollectionPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState('title')
  const [activeFilters, setActiveFilters] = useState({
    publishers: [] as string[],
    conditions: [] as string[],
    priceRange: { min: '', max: '' },
    yearRange: { min: '', max: '' },
  })
  
  // Fetch user collection data
  const { data: collectionComics, isLoading, isError, error } = useCollectionQuery()
  
  const itemsPerPage = 12
  
  // Calculate collection statistics
  const stats = collectionComics ? getCollectionStats(collectionComics) : {
    totalComics: 0,
    totalValue: 0,
    averageValue: 0,
    keyIssues: 0
  }
  
  // Transform collection comics for display (matching the old structure)
  const allDisplayComics = collectionComics?.map(collectionComic => ({
    id: collectionComic.comic.id,
    title: collectionComic.comic.title,
    issue: collectionComic.comic.issue,
    publisher: collectionComic.comic.publisher,
    coverImage: collectionComic.comic.coverImage,
    value: `£${collectionComic.comic.marketValue || 0}`,
    marketValue: collectionComic.comic.marketValue || 0,
    trend: 'neutral' as 'up' | 'down' | 'neutral', // This could be calculated based on price history
    change: '+0%', // This could be calculated based on price history
    condition: collectionComic.condition,
    purchasePrice: collectionComic.purchasePrice ? `£${collectionComic.purchasePrice}` : 'N/A',
    purchasePriceValue: collectionComic.purchasePrice || 0,
    purchaseDate: collectionComic.purchaseDate ? new Date(collectionComic.purchaseDate).toLocaleDateString() : 'N/A',
    purchaseDateValue: collectionComic.purchaseDate ? new Date(collectionComic.purchaseDate) : null,
    addedDate: collectionComic.createdAt ? new Date(collectionComic.createdAt) : new Date(),
  })) || []

  // Create filtered and sorted comics using useMemo
  const filteredAndSortedComics = useMemo(() => {
    let filtered = [...allDisplayComics]

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(comic => 
        comic.title.toLowerCase().includes(searchLower) ||
        comic.issue.toLowerCase().includes(searchLower) ||
        comic.publisher.toLowerCase().includes(searchLower)
      )
    }

    // Apply publisher filter
    if (activeFilters.publishers.length > 0) {
      filtered = filtered.filter(comic => 
        activeFilters.publishers.includes(comic.publisher)
      )
    }

    // Apply condition filter
    if (activeFilters.conditions.length > 0) {
      filtered = filtered.filter(comic => 
        activeFilters.conditions.includes(comic.condition)
      )
    }

    // Apply price range filter
    if (activeFilters.priceRange.min || activeFilters.priceRange.max) {
      filtered = filtered.filter(comic => {
        const price = comic.marketValue
        const min = activeFilters.priceRange.min ? parseFloat(activeFilters.priceRange.min) : 0
        const max = activeFilters.priceRange.max ? parseFloat(activeFilters.priceRange.max) : Infinity
        return price >= min && price <= max
      })
    }

    // Apply year range filter (based on purchase date for now, could be extended to publication year)
    if (activeFilters.yearRange.min || activeFilters.yearRange.max) {
      filtered = filtered.filter(comic => {
        if (!comic.purchaseDateValue) return false
        const year = comic.purchaseDateValue.getFullYear()
        const minYear = activeFilters.yearRange.min ? parseInt(activeFilters.yearRange.min) : 0
        const maxYear = activeFilters.yearRange.max ? parseInt(activeFilters.yearRange.max) : new Date().getFullYear()
        return year >= minYear && year <= maxYear
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'issue-number':
          // Extract numeric part from issue string
          const aIssue = parseInt(a.issue.replace(/\D/g, '')) || 0
          const bIssue = parseInt(b.issue.replace(/\D/g, '')) || 0
          return aIssue - bIssue
        case 'market-value':
          return b.marketValue - a.marketValue // Descending
        case 'purchase-price':
          return b.purchasePriceValue - a.purchasePriceValue // Descending
        case 'added-date':
          return b.addedDate.getTime() - a.addedDate.getTime() // Most recent first
        case 'publish-date':
          // For now, sort by purchase date as we don't have publish date
          if (!a.purchaseDateValue || !b.purchaseDateValue) return 0
          return b.purchaseDateValue.getTime() - a.purchaseDateValue.getTime()
        case 'relevance':
        default:
          return 0 // Keep original order for relevance/default
      }
    })

    return filtered
  }, [allDisplayComics, searchTerm, activeFilters, sortOrder])

  const displayComics = filteredAndSortedComics
  const totalItems = displayComics.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Reset current page when search term or sort order changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortOrder])

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your collection" />
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
            We couldn't load your collection. Please try again later.
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
      <div className="bg-gradient-to-br from-stan-lee-blue to-kirby-red py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-super-squad text-4xl md:text-5xl text-parchment mb-4">
            MY COLLECTION
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-none border-2 border-parchment p-4">
              <p className="font-persona-aura text-parchment opacity-80 text-sm">Total Comics</p>
              <p className="font-super-squad text-2xl text-parchment">{stats.totalComics}</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-none border-2 border-parchment p-4">
              <p className="font-persona-aura text-parchment opacity-80 text-sm">Total Value</p>
              <p className="font-super-squad text-2xl text-parchment">£{stats.totalValue.toLocaleString()}</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-none border-2 border-parchment p-4">
              <p className="font-persona-aura text-parchment opacity-80 text-sm">Average Value</p>
              <p className="font-super-squad text-2xl text-parchment">£{stats.averageValue.toLocaleString()}</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-none border-2 border-parchment p-4">
              <p className="font-persona-aura text-parchment opacity-80 text-sm">Key Issues</p>
              <p className="font-super-squad text-2xl text-parchment">{stats.keyIssues}</p>
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
                placeholder="Search your collection..."
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

              {/* Action Buttons */}
              <button className="comic-button flex items-center space-x-2">
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
            setCurrentPage(1) // Reset to first page when filters change
            setShowFilters(false)
          }}
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="flex gap-4 mb-6">
          <button className="flex items-center space-x-2 text-stan-lee-blue hover:text-kirby-red transition-colors">
            <Download size={18} />
            <span className="font-persona-aura font-semibold">Export Collection</span>
          </button>
          <button className="flex items-center space-x-2 text-stan-lee-blue hover:text-kirby-red transition-colors">
            <Upload size={18} />
            <span className="font-persona-aura font-semibold">Import Comics</span>
          </button>
          <button className="flex items-center space-x-2 text-stan-lee-blue hover:text-kirby-red transition-colors">
            <Star size={18} />
            <span className="font-persona-aura font-semibold">Wishlist (23)</span>
          </button>
        </div>

        {/* Comics Grid/List */}
        {displayComics.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white comic-border shadow-comic p-8 max-w-md mx-auto">
              <h3 className="font-super-squad text-2xl text-ink-black mb-4">Your Collection is Empty</h3>
              <p className="font-persona-aura text-gray-600 mb-6">
                Start building your comic collection by adding your first comic!
              </p>
              <button className="comic-button flex items-center space-x-2 mx-auto">
                <Plus size={18} />
                <span>Add Your First Comic</span>
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayComics.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((comic) => (
              <ComicCard key={comic.id} comic={comic} variant="detailed" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {displayComics.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((comic) => (
              <div key={comic.id} className="bg-white comic-border shadow-comic p-4 flex items-center space-x-4 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform">
                <img
                  src={comic.coverImage}
                  alt={`${comic.title} ${comic.issue}`}
                  className="w-20 h-28 object-cover border-2 border-ink-black"
                />
                <div className="flex-1">
                  <h3 className="font-super-squad text-lg text-ink-black">{comic.title} {comic.issue}</h3>
                  <p className="font-persona-aura text-sm text-gray-600">{comic.publisher} • {comic.condition}</p>
                  <p className="font-persona-aura text-sm text-gray-600">Purchased: {comic.purchaseDate} for {comic.purchasePrice}</p>
                </div>
                <div className="text-right">
                  <p className="font-super-squad text-xl text-ink-black">{comic.value}</p>
                  <p className={`font-persona-aura text-sm ${comic.trend === 'up' ? 'text-green-600' : comic.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                    {comic.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-12">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  )
}

export default CollectionPage
