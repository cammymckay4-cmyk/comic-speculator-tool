import { useQuery } from '@tanstack/react-query'
import { fetchUserCollection } from '@/services/collectionService'
import { useUserStore } from '@/store/userStore'

export const useCollectionQuery = () => {
  const { user } = useUserStore()

  return useQuery({
    queryKey: ['collection', user?.email], // Using email as user identifier
    queryFn: () => {
      if (!user?.email) {
        throw new Error('No user found')
      }
      // Note: This assumes user email maps to user_id in your Supabase table
      // You may need to adjust this based on your actual user ID structure
      return fetchUserCollection(user.email)
    },
    enabled: !!user?.email, // Only run query if user is logged in
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}