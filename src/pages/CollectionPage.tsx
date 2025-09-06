import React, { useState, useEffect } from 'react'
import { 
  Filter, 
  Grid, 
  List, 
  Plus,
  Download,
  Upload,
  Star,
  LogIn
} from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import ComicCard from '@/components/ui/ComicCard'
import SearchBar from '@/components/features/SearchBar'
import FilterPanel from '@/components/features/FilterPanel'
import SortDropdown from '@/components/features/SortDropdown'
import Pagination from '@/components/features/Pagination'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ComicSearchModal from '@/components/features/ComicSearchModal'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import { useCollectionQuery, useCollectionCount } from '@/hooks/useCollectionQuery'
import { useWishlistCount } from '@/hooks/useWishlistQuery'
import { getCollectionStats, removeFromCollection } from '@/services/collectionService'
import { useUserStore } from '@/store/userStore'
import { toast } from '@/store/toastStore'


const CollectionPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useUserStore()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [showComicSearchModal, setShowComicSearchModal] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [comicToDelete, setComicToDelete] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState('title')
  const [activeFilters, setActiveFilters] = useState({
    publishers: [] as string[],
    conditions: [] as string[],
    priceRange: { min: '', max: '' },
    yearRange: { min: '', max: '' },
  })
  
  const itemsPerPage = 12

  // Fetch user collection data with backend filtering
  const { data: collectionComics, isLoading, isError, error } = useCollectionQuery({
    searchTerm,
    filters: activeFilters,
    sortOrder,
    page: currentPage,
    itemsPerPage
  })

  // Get total count for pagination
  const { data: totalItems } = useCollectionCount({
    searchTerm,
    filters: activeFilters
  })

  // Get wishlist count for display
  const { data: wishlistCount } = useWishlistCount()
  
  // For stats, we need to fetch all comics without filtering (or use a separate stats endpoint)
  const { data: allComics } = useCollectionQuery({
    searchTerm: '',
    filters: { publishers: [], conditions: [], priceRange: { min: '', max: '' }, yearRange: { min: '', max: '' } },
    sortOrder: 'created_at',
    page: 1,
    itemsPerPage: 1000 // Large number to get all for stats
  })

  // Calculate collection statistics
  const stats = allComics ? getCollectionStats(allComics) : {
    totalComics: 0,
    totalValue: 0,
    averageValue: 0,
    keyIssues: 0
  }

  // Remove from collection mutation
  const removeFromCollectionMutation = useMutation({
    mutationFn: ({ entryId, userEmail }: { entryId: string; userEmail: string }) => removeFromCollection(entryId, userEmail),
    onSuccess: () => {
      // Invalidate collection queries
      queryClient.invalidateQueries({ queryKey: ['collection'] })
      queryClient.invalidateQueries({ queryKey: ['collection-count'] })
      
      // Show success toast
      toast.success('Comic Removed', 'The comic has been removed from your collection')
      
      // Close modal
      setIsDeleteModalOpen(false)
      setComicToDelete(null)
    },
    onError: (error) => {
      console.error('Failed to remove comic:', error)
      toast.error('Remove Failed', 'Failed to remove the comic. Please try again.')
    }
  })
  
  // Transform collection comics for display (matching the old structure)
  const displayComics = collectionComics?.map(collectionComic => ({
    id: collectionComic.comic.id,
    entryId: collectionComic.id, // Collection entry ID for removal operations
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
    addedDate: collectionComic.addedDate ? new Date(collectionComic.addedDate) : new Date(),
    ebayStatus: collectionComic.comic.ebayStatus
  })) || []

  const totalPages = Math.ceil((totalItems || 0) / itemsPerPage)

  // Handle delete comic
  const handleDeleteClick = (comic: any) => {
    setComicToDelete(comic)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (comicToDelete && comicToDelete.entryId && user?.email) {
      removeFromCollectionMutation.mutate({ entryId: comicToDelete.entryId, userEmail: user.email })
    }
  }

  const handleEditClick = (comic: any) => {
    navigate(`/collection/${comic.id}`)
  }

  // Check for authentication and redirect if needed
  useEffect(() => {
    if (!user) {
      // Redirect to auth with collection as redirect target
      navigate('/auth?redirect=/collection')
      return
    }
  }, [user, navigate])

  // Reset current page when search term, sort order, or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortOrder, activeFilters])

  // If user is not authenticated, show a login prompt as fallback
  if (!user) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="bg-white comic-border shadow-comic p-8 max-w-md text-center">
          <h2 className="font-super-squad text-2xl text-ink-black mb-4">Login Required</h2>
          <p className="font-persona-aura text-gray-600 mb-6">
            You need to be logged in to view your collection.
          </p>
          <button 
            onClick={() => navigate('/auth?redirect=/collection')}
            className="comic-button flex items-center space-x-2 mx-auto"
          >
            <LogIn size={18} />
            <span>Login to Continue</span>
          </button>
        </div>
      </div>
    )
  }

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
          <button 
            onClick={() => navigate('/wishlist')}
            className="flex items-center space-x-2 text-stan-lee-blue hover:text-kirby-red transition-colors"
          >
            <Star size={18} />
            <span className="font-persona-aura font-semibold">Wishlist ({wishlistCount || 0})</span>
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
              <button 
                onClick={() => setShowComicSearchModal(true)}
                className="comic-button flex items-center space-x-2 mx-auto"
              >
                <Plus size={18} />
                <span>Add Your First Comic</span>
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayComics.map((comic) => (
              <ComicCard 
                key={comic.id} 
                comic={comic} 
                variant="detailed"
                onClick={() => navigate(`/collection/${comic.id}`)}
                onEdit={() => handleEditClick(comic)}
                onDelete={() => handleDeleteClick(comic)}
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

      {/* Comic Search Modal */}
      <ComicSearchModal 
        isOpen={showComicSearchModal}
        onClose={() => setShowComicSearchModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setComicToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="DELETE COMIC"
        message={`Are you sure you want to delete "${comicToDelete?.title} ${comicToDelete?.issue}" from your collection? This action cannot be undone.`}
        confirmText="Delete Comic"
        cancelText="Cancel"
        isLoading={removeFromCollectionMutation.isPending}
        variant="danger"
      />
    </div>
  )
}

export default CollectionPage
