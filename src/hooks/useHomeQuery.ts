import { useQuery } from '@tanstack/react-query'
import { fetchUserStats, fetchHotComics, fetchRecentNews } from '@/services/homeService'
import { useUserStore } from '@/store/userStore'

export const useUserStatsQuery = () => {
  const { user } = useUserStore()

  return useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: () => {
      if (!user?.id) {
        throw new Error('No user found')
      }
      return fetchUserStats(user.id)
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

export const useHotComicsQuery = () => {
  return useQuery({
    queryKey: ['hotComics'],
    queryFn: fetchHotComics,
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
  })
}

export const useRecentNewsQuery = () => {
  return useQuery({
    queryKey: ['recentNews'],
    queryFn: fetchRecentNews,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  })
}