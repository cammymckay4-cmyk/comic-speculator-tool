import { useQuery } from '@tanstack/react-query'
import { fetchUserWishlist, getWishlistCount, type WishlistQueryOptions, type WishlistFilters } from '@/services/wishlistService'
import { useUserStore } from '@/store/userStore'

// Hook to fetch user's wishlist with filtering, sorting, and pagination
export const useWishlistQuery = (options: WishlistQueryOptions = {}) => {
  const { user } = useUserStore()
  
  return useQuery({
    queryKey: ['wishlist', user?.email, options],
    queryFn: () => fetchUserWishlist(user?.email || '', options),
    enabled: !!user?.email,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook to get the total count of wishlist items (for pagination)
export const useWishlistCount = (filters: WishlistFilters = {}) => {
  const { user } = useUserStore()
  
  return useQuery({
    queryKey: ['wishlist-count', user?.email, filters],
    queryFn: () => getWishlistCount(user?.email || '', filters),
    enabled: !!user?.email,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}