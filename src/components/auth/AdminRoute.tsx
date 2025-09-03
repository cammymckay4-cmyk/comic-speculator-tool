import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { adminService } from '@/services/adminService'
import { useUserStore } from '@/store/userStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface AdminRouteProps {
  children: React.ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUserStore()

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        if (!user) {
          setIsAdmin(false)
          return
        }

        const userRole = await adminService.checkUserRole()
        setIsAdmin(userRole === 'admin')
      } catch (error) {
        console.error('Error checking admin access:', error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAccess()
  }, [user])

  // Show loading spinner while checking permissions
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Verifying permissions..." />
      </div>
    )
  }

  // Redirect to home if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  // Render protected content for admin users
  return <>{children}</>
}