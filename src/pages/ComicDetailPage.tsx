import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeft,
  Heart,
  Bell,
  Share2,
  ShoppingCart,
  TrendingUp,
  Calendar,
  User,
  Tag,
  BookOpen,
  Star,
  DollarSign,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react'
import { fetchComicById, deleteComic } from '@/services/collectionService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EditComicForm from '@/components/features/EditComicForm'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import { toast } from '@/store/toastStore'
import { useUserStore } from '@/store/userStore'


const ComicDetailPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useUserStore()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [hasAlert, setHasAlert] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Fetch comic data based on id from URL
  const { data: collectionComic, isLoading, isError, error } = useQuery({
    queryKey: ['comic', id],
    queryFn: () => fetchComicById(id!),
    enabled: !!id, // Only run query if ID is present
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteComic(id!),
    onSuccess: () => {
      // Invalidate collection queries
      queryClient.invalidateQueries({ queryKey: ['collection'] })
      queryClient.invalidateQueries({ queryKey: ['collection-count'] })
      
      // Show success toast
      toast.success('Comic Deleted', 'The comic has been removed from your collection')
      
      // Navigate back to collection
      navigate('/collection')
    },
    onError: (error) => {
      console.error('Failed to delete comic:', error)
      toast.error('Delete Failed', 'Failed to delete the comic. Please try again.')
    }
  })

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    deleteMutation.mutate()
    setIsDeleteModalOpen(false)
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading comic details..." />
      </div>
    )
  }

  // Handle error state
  if (isError || !collectionComic) {
    return (
      <div className="min-h-screen bg-parchment">
        <div className="bg-white border-b-comic border-ink-black shadow-comic-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-stan-lee-blue hover:text-kirby-red transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-persona-aura font-semibold">Back</span>
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white comic-border shadow-comic p-8 text-center">
            <AlertCircle size={48} className="text-kirby-red mx-auto mb-4" />
            <h1 className="font-super-squad text-2xl text-ink-black mb-2">
              Comic Not Found
            </h1>
            <p className="font-persona-aura text-gray-600 mb-6">
              {error instanceof Error ? error.message : 'The comic you\'re looking for could not be found.'}
            </p>
            <button
              onClick={() => navigate('/collection')}
              className="comic-button"
            >
              Back to Collection
            </button>
          </div>
        </div>
      </div>
    )
  }

  const comic = collectionComic.comic

  return (
    <div className="min-h-screen bg-parchment">
      {/* Back Navigation */}
      <div className="bg-white border-b-comic border-ink-black shadow-comic-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-stan-lee-blue hover:text-kirby-red transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-persona-aura font-semibold">Back to Collection</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cover Image */}
          <div className="lg:col-span-1">
            <div className="bg-white comic-border shadow-comic p-4 sticky top-24">
              <img
                src={comic.coverImage || '/comic-placeholder.jpg'}
                alt={`${comic.title} ${comic.issue}`}
                className="w-full h-auto"
              />
              
              {/* Quick Actions */}
              <div className="mt-4 space-y-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full flex items-center justify-center space-x-2 py-3 border-comic border-ink-black shadow-comic-sm bg-golden-age-yellow text-ink-black
                            transition-all duration-150 hover:translate-y-[-2px] hover:shadow-comic hover:bg-yellow-400"
                >
                  <Edit size={18} />
                  <span className="font-persona-aura font-semibold">
                    Edit Comic
                  </span>
                </button>

                <button
                  onClick={handleDeleteClick}
                  className="w-full flex items-center justify-center space-x-2 py-3 border-comic border-ink-black shadow-comic-sm bg-kirby-red text-parchment
                            transition-all duration-150 hover:translate-y-[-2px] hover:shadow-comic hover:bg-red-700"
                >
                  <Trash2 size={18} />
                  <span className="font-persona-aura font-semibold">
                    Delete Comic
                  </span>
                </button>
                
                <button
                  onClick={() => setIsInWishlist(!isInWishlist)}
                  className={`w-full flex items-center justify-center space-x-2 py-3 border-comic border-ink-black shadow-comic-sm
                            transition-all duration-150 hover:translate-y-[-2px] hover:shadow-comic
                            ${isInWishlist ? 'bg-kirby-red text-parchment' : 'bg-white text-ink-black'}`}
                >
                  <Heart size={18} fill={isInWishlist ? 'currentColor' : 'none'} />
                  <span className="font-persona-aura font-semibold">
                    {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                  </span>
                </button>

                <button
                  onClick={() => setHasAlert(!hasAlert)}
                  className={`w-full flex items-center justify-center space-x-2 py-3 border-comic border-ink-black shadow-comic-sm
                            transition-all duration-150 hover:translate-y-[-2px] hover:shadow-comic
                            ${hasAlert ? 'bg-golden-age-yellow text-ink-black' : 'bg-white text-ink-black'}`}
                >
                  <Bell size={18} fill={hasAlert ? 'currentColor' : 'none'} />
                  <span className="font-persona-aura font-semibold">
                    {hasAlert ? 'Alert Set' : 'Set Price Alert'}
                  </span>
                </button>

                <button className="w-full comic-button flex items-center justify-center space-x-2">
                  <ShoppingCart size={18} />
                  <span>Find on eBay</span>
                </button>

                <button className="w-full flex items-center justify-center space-x-2 py-3 text-stan-lee-blue hover:text-kirby-red transition-colors">
                  <Share2 size={18} />
                  <span className="font-persona-aura font-semibold">Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white comic-border shadow-comic p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-golden-age-yellow text-ink-black px-3 py-1 text-xs font-super-squad uppercase border-2 border-ink-black">
                      {comic.publisher}
                    </span>
                    {comic.isKeyIssue && (
                      <span className="bg-kirby-red text-parchment px-3 py-1 text-xs font-super-squad uppercase border-2 border-ink-black">
                        KEY ISSUE
                      </span>
                    )}
                  </div>
                  <h1 className="font-super-squad text-4xl text-ink-black mb-2">
                    {comic.title} {comic.issue}
                  </h1>
                  <p className="font-persona-aura text-gray-600">
                    Published {comic.publishDate ? new Date(comic.publishDate).toLocaleDateString('en-GB', { 
                      year: 'numeric', 
                      month: 'long' 
                    }) : 'Date unknown'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-super-squad text-3xl text-ink-black">
                    £{(comic.marketValue || 0).toLocaleString()}
                  </p>
                  <div className="flex items-center justify-end space-x-1 text-green-600">
                    <TrendingUp size={16} />
                    <span className="font-persona-aura text-sm font-semibold">
                      Market value
                    </span>
                  </div>
                </div>
              </div>

              {comic.isKeyIssue && comic.keyIssueReason && (
                <div className="bg-golden-age-yellow bg-opacity-20 border-2 border-golden-age-yellow p-4">
                  <div className="flex items-start space-x-2">
                    <Star size={20} className="text-golden-age-yellow mt-0.5" />
                    <div>
                      <p className="font-super-squad text-sm text-ink-black mb-1">KEY ISSUE</p>
                      <p className="font-persona-aura text-ink-black">
                        {comic.keyIssueReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {comic.description && (
              <div className="bg-white comic-border shadow-comic p-6">
                <h2 className="font-super-squad text-2xl text-ink-black mb-4">
                  SYNOPSIS
                </h2>
                <p className="font-persona-aura text-gray-700 leading-relaxed">
                  {comic.description}
                </p>
              </div>
            )}

            {/* Creators */}
            {comic.creators && comic.creators.length > 0 && (
              <div className="bg-white comic-border shadow-comic p-6">
                <h2 className="font-super-squad text-2xl text-ink-black mb-4">
                  CREATIVE TEAM
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {comic.creators.map((creator: any) => (
                    <div key={creator.name} className="flex items-center space-x-3">
                      <User size={20} className="text-gray-400" />
                      <div>
                        <p className="font-persona-aura font-semibold text-ink-black">
                          {creator.name}
                        </p>
                        <p className="font-persona-aura text-sm text-gray-600">
                          {creator.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current Condition and Price */}
            <div className="bg-white comic-border shadow-comic p-6">
              <h2 className="font-super-squad text-2xl text-ink-black mb-4">
                CONDITION & VALUE
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-golden-age-yellow border-2 border-ink-black shadow-comic">
                  <div className="text-left">
                    <p className="font-persona-aura font-semibold text-ink-black">
                      {collectionComic.condition.charAt(0).toUpperCase() + collectionComic.condition.slice(1).replace(/-/g, ' ')}
                    </p>
                    <p className="font-persona-aura text-xs text-gray-800">
                      Current condition
                    </p>
                  </div>
                  <p className="font-super-squad text-xl text-ink-black">
                    £{(comic.marketValue || 0).toLocaleString()}
                  </p>
                </div>
                {collectionComic.purchasePrice && (
                  <div className="flex justify-between items-center p-4 bg-gray-50 border-2 border-gray-300">
                    <div className="text-left">
                      <p className="font-persona-aura font-semibold text-ink-black">
                        Purchase Price
                      </p>
                      <p className="font-persona-aura text-xs text-gray-600">
                        {collectionComic.purchaseDate ? new Date(collectionComic.purchaseDate).toLocaleDateString('en-GB') : 'Date unknown'}
                      </p>
                    </div>
                    <p className="font-super-squad text-xl text-ink-black">
                      £{collectionComic.purchasePrice.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="bg-white comic-border shadow-comic p-6">
              <h2 className="font-super-squad text-2xl text-ink-black mb-4">
                COMIC DETAILS
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  {comic.pageCount && (
                    <div className="flex items-center space-x-2">
                      <BookOpen size={18} className="text-gray-400" />
                      <span className="font-persona-aura text-gray-600">Page Count:</span>
                      <span className="font-persona-aura font-semibold text-ink-black">
                        {comic.pageCount}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar size={18} className="text-gray-400" />
                    <span className="font-persona-aura text-gray-600">Format:</span>
                    <span className="font-persona-aura font-semibold text-ink-black">
                      {comic.format.charAt(0).toUpperCase() + comic.format.slice(1).replace(/-/g, ' ')}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Tag size={18} className="text-gray-400" />
                    <span className="font-persona-aura text-gray-600">Issue:</span>
                    <span className="font-persona-aura font-semibold text-ink-black">
                      {comic.issue}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User size={18} className="text-gray-400" />
                    <span className="font-persona-aura text-gray-600">Added:</span>
                    <span className="font-persona-aura font-semibold text-ink-black">
                      {new Date(collectionComic.addedDate).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Characters */}
              {comic.characters && comic.characters.length > 0 && (
                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                  <p className="font-persona-aura text-gray-600 mb-3">Characters:</p>
                  <div className="flex flex-wrap gap-2">
                    {comic.characters.map((character: any) => (
                      <span
                        key={character}
                        className="px-3 py-1 bg-stan-lee-blue text-parchment text-xs font-persona-aura font-semibold border-2 border-ink-black shadow-comic-sm"
                      >
                        {character}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Story Arcs */}
              {comic.storyArcs && comic.storyArcs.length > 0 && (
                <div className="mt-4">
                  <p className="font-persona-aura text-gray-600 mb-3">Story Arcs:</p>
                  <div className="flex flex-wrap gap-2">
                    {comic.storyArcs.map((arc: any) => (
                      <span
                        key={arc}
                        className="px-3 py-1 bg-kirby-red text-parchment text-xs font-persona-aura font-semibold border-2 border-ink-black shadow-comic-sm"
                      >
                        {arc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Comic Modal */}
      {collectionComic && (
        <EditComicForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          comic={collectionComic}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="DELETE COMIC"
        message={`Are you sure you want to delete "${collectionComic?.comic.title} ${collectionComic?.comic.issue}" from your collection? This action cannot be undone.`}
        confirmText="Delete Comic"
        cancelText="Cancel"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  )
}

export default ComicDetailPage
