import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAlerts, createAlert, updateAlertStatus, deleteAlert, CreateAlertData } from '@/services/alertService'
import { useUserStore } from '@/store/userStore'

export const useAlertsQuery = () => {
  const { user } = useUserStore()
  
  return useQuery({
    queryKey: ['alerts', user?.id],
    queryFn: () => {
      if (!user) {
        throw new Error('No user found')
      }
      return fetchAlerts()
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  })
}

export const useCreateAlert = () => {
  const queryClient = useQueryClient()
  const { user } = useUserStore()
  
  return useMutation({
    mutationFn: (alertData: CreateAlertData) => {
      if (!user) {
        throw new Error('No user found')
      }
      return createAlert(alertData)
    },
    onSuccess: () => {
      // Invalidate and refetch alerts after successful creation
      queryClient.invalidateQueries({ queryKey: ['alerts', user?.id] })
      // Also invalidate alerts count
      queryClient.invalidateQueries({ queryKey: ['alertsCount', user?.id] })
    },
  })
}

export const useUpdateAlertStatus = () => {
  const queryClient = useQueryClient()
  const { user } = useUserStore()
  
  return useMutation({
    mutationFn: ({ alertId, isActive }: { alertId: string; isActive: boolean }) => {
      return updateAlertStatus(alertId, isActive)
    },
    onSuccess: () => {
      // Invalidate and refetch alerts after successful update
      queryClient.invalidateQueries({ queryKey: ['alerts', user?.id] })
      // Also invalidate alerts count
      queryClient.invalidateQueries({ queryKey: ['alertsCount', user?.id] })
    },
  })
}

export const useDeleteAlert = () => {
  const queryClient = useQueryClient()
  const { user } = useUserStore()
  
  return useMutation({
    mutationFn: (alertId: string) => {
      return deleteAlert(alertId)
    },
    onSuccess: () => {
      // Invalidate and refetch alerts after successful deletion
      queryClient.invalidateQueries({ queryKey: ['alerts', user?.id] })
      // Also invalidate alerts count
      queryClient.invalidateQueries({ queryKey: ['alertsCount', user?.id] })
    },
  })
}