import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useUserStore } from '@/store/userStore'
import { toast } from '@/store/toastStore'

export const usePostAuthActions = () => {
  const { user } = useUserStore()
  const location = useLocation()

  useEffect(() => {
    // Only run if user is authenticated and we have an intended action
    if (!user) return

    const intendedAction = sessionStorage.getItem('authIntendedAction')
    if (!intendedAction) return

    console.log('[POST-AUTH] Processing intended action:', intendedAction, 'at', location.pathname)

    // Small delay to let the page load and components initialize
    const timer = setTimeout(() => {
      // Process the intended action based on its type
      switch (intendedAction) {
        case 'add_to_collection':
          toast.info('Welcome back!', 'You can now add this comic to your collection.')
          break
        case 'add_to_wishlist':
          toast.info('Welcome back!', 'You can now add this comic to your wishlist.')
          break
        case 'set_price_alert':
          toast.info('Welcome back!', 'You can now set a price alert for this comic.')
          break
        default:
          console.log('[POST-AUTH] Unknown intended action:', intendedAction)
      }

      // Clear the intended action after processing
      sessionStorage.removeItem('authIntendedAction')
    }, 1000)

    return () => clearTimeout(timer)
  }, [user, location])

  return {
    hasIntendedAction: !!sessionStorage.getItem('authIntendedAction'),
    getIntendedAction: () => sessionStorage.getItem('authIntendedAction')
  }
}