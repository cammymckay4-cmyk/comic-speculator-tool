import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAlerts, createAlert, updateAlertStatus, deleteAlert, CreateAlertData } from '@/services/alertService'
import { useUserStore } from '@/store/userStore'

export const useAlertsQuery = () => {
  const { user } = useUserStore()

  return useQuery({
    queryKey: ['alerts', user?.email],
    queryFn: () => {
      if (!user?.email) {
        throw new Error('No user found')
      }
      return fetchAlerts(user.email)
    },
    enabled: !!user?.email,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  })
}

export const useCreateAlert = () => {
  const queryClient = useQueryClient()
  const { user } = useUserStore()

  return useMutation({
    mutationFn: (alertData: Omit<CreateAlertData, 'userEmail'>) => {
      if (!user?.email) {
        throw new Error('No user found')
      }
      return createAlert({ ...alertData, userEmail: user.email })
    },
    onSuccess: () => {
      // Invalidate and refetch alerts after successful creation
      queryClient.invalidateQueries({ queryKey: ['alerts', user?.email] })
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
      queryClient.invalidateQueries({ queryKey: ['alerts', user?.email] })
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
      queryClient.invalidateQueries({ queryKey: ['alerts', user?.email] })
      // Also invalidate alerts count
      queryClient.invalidateQueries({ queryKey: ['alertsCount', user?.id] })
    },
  })
}