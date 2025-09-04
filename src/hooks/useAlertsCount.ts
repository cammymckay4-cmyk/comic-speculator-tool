import { useQuery } from '@tanstack/react-query'
import { getActiveAlertsCount } from '@/services/alertService'
import { useUserStore } from '@/store/userStore'

export const useAlertsCount = () => {
  const { user } = useUserStore()

  return useQuery({
    queryKey: ['alertsCount', user?.id],
    queryFn: getActiveAlertsCount,
    enabled: !!user,
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  })
}