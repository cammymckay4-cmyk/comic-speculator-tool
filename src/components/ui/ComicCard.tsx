import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Edit, Trash2, Heart } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addToWishlist, removeFromWishlist, isComicInWishlist } from '@/services/wishlistService'
import { useUserStore } from '@/store/userStore'
import { toast } from '@/store/toastStore'
import type { EbayStatus } from '@/lib/types'

interface ComicData {
  id: string
  title: string
  issue: string
  publisher: string
  coverImage: string
  value: string
  trend: 'up' | 'down' | 'neutral'
  change: string
  ebayStatus?: EbayStatus
}

interface ComicCardProps {
  comic: ComicData
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onWishlistChange?: () => void
  variant?: 'default' | 'compact' | 'detailed'
  showWishlist?: boolean
}

const ComicCard: React.FC<ComicCardProps> = ({ 
  comic, 
  onClick,
  onEdit,
  onDelete,
  onWishlistChange,
  variant = 'default',
  showWishlist = true
}) => {
  const queryClient = useQueryClient()
  const { user } = useUserStore()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [checkingWishlist, setCheckingWishlist] = useState(false)

  // Check if comic is in wishlist
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!user?.email) return
      setCheckingWishlist(true)
      try {
        const inWishlist = await isComicInWishlist(comic.id, user.email)
        setIsInWishlist(inWishlist)
      } catch (error) {
        console.error('Error checking wishlist status:', error)
      } finally {
        setCheckingWishlist(false)
      }
    }

    checkWishlistStatus()
  }, [comic.id, user?.email])

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: ({ comicId, userEmail }: { comicId: string; userEmail: string }) => 
      addToWishlist(userEmail, { comicId }),
    onSuccess: () => {
      setIsInWishlist(true)
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist-count'] })
      toast.success('Added to Wishlist', 'Comic has been added to your wishlist')
      onWishlistChange?.()
    },
    onError: (error) => {
      console.error('Failed to add to wishlist:', error)
      toast.error('Wishlist Error', 'Failed to add comic to wishlist. Please try again.')
    }
  })

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async ({ comicId, userEmail }: { comicId: string; userEmail: string }) => {
      // First get the wishlist item to find its ID
      const { getWishlistItemByComicId } = await import('@/services/wishlistService')
      const wishlistItem = await getWishlistItemByComicId(comicId, userEmail)
      if (!wishlistItem) throw new Error('Wishlist item not found')
      return removeFromWishlist(wishlistItem.id, userEmail)
    },
    onSuccess: () => {
      setIsInWishlist(false)
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist-count'] })
      toast.success('Removed from Wishlist', 'Comic has been removed from your wishlist')
      onWishlistChange?.()
    },
    onError: (error) => {
      console.error('Failed to remove from wishlist:', error)
      toast.error('Wishlist Error', 'Failed to remove comic from wishlist. Please try again.')
    }
  })

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!user?.email) {
      toast.error('Sign In Required', 'Please sign in to add comics to your wishlist')
      return
    }

    if (isInWishlist) {
      removeFromWishlistMutation.mutate({ comicId: comic.id, userEmail: user.email })
    } else {
      addToWishlistMutation.mutate({ comicId: comic.id, userEmail: user.email })
    }
  }
  return (
    <div 
      className="comic-card overflow-hidden group"
      onClick={onClick}
    >
      {/* Cover Image */}
      <div className="relative h-64 bg-gray-100 overflow-hidden">
        <img
          src={comic.coverImage}
          alt={`${comic.title} ${comic.issue}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Price Badge */}
        <div className="absolute top-2 right-2 bg-golden-age-yellow text-ink-black px-3 py-1 font-super-squad text-sm border-2 border-ink-black shadow-comic-sm">
          {comic.value}
        </div>
        
        {/* Trend Badge */}
        {comic.trend !== 'neutral' && (
          <div className={`absolute top-2 left-2 px-2 py-1 rounded-none border-2 border-ink-black shadow-comic-sm flex items-center space-x-1 ${
            comic.trend === 'up' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {comic.trend === 'up' ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            <span className="font-persona-aura text-xs font-bold">{comic.change}</span>
          </div>
        )}
        
        {/* eBay Status Badges */}
        <div className="absolute bottom-2 left-2 flex flex-col space-y-1">
          {comic.ebayStatus?.hasLiveListings && (
            <div className="bg-stan-lee-blue text-parchment px-2 py-1 border-2 border-ink-black shadow-comic-sm">
              <span className="font-persona-aura text-xs font-bold">
                Live ({comic.ebayStatus.liveListingsCount})
              </span>
            </div>
          )}
          {comic.ebayStatus?.hasEndingSoon && (
            <div className="bg-orange-500 text-white px-2 py-1 border-2 border-ink-black shadow-comic-sm">
              <span className="font-persona-aura text-xs font-bold">
                Ending Soon ({comic.ebayStatus.endingSoonCount})
              </span>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="absolute bottom-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {showWishlist && (
            <button
              onClick={handleWishlistToggle}
              disabled={checkingWishlist || addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
              className={`p-2 border-2 border-ink-black shadow-comic-sm transition-colors ${
                isInWishlist 
                  ? 'bg-kirby-red text-parchment hover:bg-red-700' 
                  : 'bg-golden-age-yellow text-ink-black hover:bg-yellow-400'
              } ${
                checkingWishlist || addToWishlistMutation.isPending || removeFromWishlistMutation.isPending
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart size={16} className={isInWishlist ? 'fill-current' : ''} />
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="bg-stan-lee-blue text-parchment p-2 border-2 border-ink-black shadow-comic-sm hover:bg-blue-700 transition-colors"
              title="Edit Comic"
            >
              <Edit size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="bg-kirby-red text-parchment p-2 border-2 border-ink-black shadow-comic-sm hover:bg-red-700 transition-colors"
              title="Delete Comic"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs font-persona-aura text-gray-600 uppercase tracking-wide">
            {comic.publisher}
          </span>
        </div>
        <h3 className="font-super-squad text-lg text-ink-black mb-1">
          {comic.title}
        </h3>
        <p className="font-persona-aura text-sm text-gray-700">
          Issue {comic.issue}
        </p>
        
        {variant === 'detailed' && (
          <div className="mt-4 pt-4 border-t-2 border-gray-200">
            <button className="w-full comic-button text-sm py-2">
              VIEW DETAILS
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ComicCard
