import { useQuery } from '@tanstack/react-query'
import { fetchUserCollection, getCollectionCount, CollectionFilters } from '@/services/collectionService'
import { useUserStore } from '@/store/userStore'

export interface UseCollectionQueryOptions {
  searchTerm?: string
  filters?: {
    publishers: string[]
    conditions: string[]
    priceRange: { min: string; max: string }
    yearRange: { min: string; max: string }
  }
  sortOrder?: string
  page?: number
  itemsPerPage?: number
}

export const useCollectionQuery = (options: UseCollectionQueryOptions = {}) => {
  const { user } = useUserStore()
  const { 
    searchTerm = '', 
    filters = { publishers: [], conditions: [], priceRange: { min: '', max: '' }, yearRange: { min: '', max: '' } },
    sortOrder = 'created_at',
    page = 1,
    itemsPerPage = 12
  } = options

  // Convert filters to the format expected by the service
  const serviceFilters: CollectionFilters = {
    searchTerm,
    publishers: filters.publishers,
    conditions: filters.conditions,
    priceRange: {
      min: filters.priceRange.min ? parseFloat(filters.priceRange.min) : undefined,
      max: filters.priceRange.max ? parseFloat(filters.priceRange.max) : undefined,
    },
    yearRange: {
      min: filters.yearRange.min ? parseInt(filters.yearRange.min) : undefined,
      max: filters.yearRange.max ? parseInt(filters.yearRange.max) : undefined,
    }
  }

  return useQuery({
    queryKey: [
      'collection', 
      user?.email, 
      searchTerm, 
      filters.publishers, 
      filters.conditions, 
      filters.priceRange, 
      filters.yearRange,
      sortOrder,
      page,
      itemsPerPage
    ],
    queryFn: () => {
      if (!user?.email) {
        throw new Error('No user found')
      }
      return fetchUserCollection(user.email, {
        filters: serviceFilters,
        sortOrder,
        page,
        itemsPerPage
      })
    },
    enabled: !!user?.email,
    staleTime: 1000 * 60 * 2, // Reduced to 2 minutes since we're doing server-side filtering
    refetchOnWindowFocus: false,
  })
}

export const useCollectionCount = (options: UseCollectionQueryOptions = {}) => {
  const { user } = useUserStore()
  const { 
    searchTerm = '', 
    filters = { publishers: [], conditions: [], priceRange: { min: '', max: '' }, yearRange: { min: '', max: '' } }
  } = options

  // Convert filters to the format expected by the service
  const serviceFilters: CollectionFilters = {
    searchTerm,
    publishers: filters.publishers,
    conditions: filters.conditions,
    priceRange: {
      min: filters.priceRange.min ? parseFloat(filters.priceRange.min) : undefined,
      max: filters.priceRange.max ? parseFloat(filters.priceRange.max) : undefined,
    },
    yearRange: {
      min: filters.yearRange.min ? parseInt(filters.yearRange.min) : undefined,
      max: filters.yearRange.max ? parseInt(filters.yearRange.max) : undefined,
    }
  }

  return useQuery({
    queryKey: [
      'collection-count', 
      user?.email, 
      searchTerm, 
      filters.publishers, 
      filters.conditions, 
      filters.priceRange, 
      filters.yearRange
    ],
    queryFn: () => {
      if (!user?.email) {
        throw new Error('No user found')
      }
      return getCollectionCount(user.email, serviceFilters)
    },
    enabled: !!user?.email,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  })
}