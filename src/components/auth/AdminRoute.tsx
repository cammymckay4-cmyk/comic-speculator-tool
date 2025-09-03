import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { adminService } from '../../services/adminService'
import { useUserStore } from '../../store/userStore'
import LoadingSpinner from '../ui/LoadingSpinner'

interface AdminRouteProps {
  children: React.ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useUserStore()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        if (!user) {
          setIsAdmin(false)
          setIsLoading(false)
          return
        }

        const adminStatus = await adminService.isCurrentUserAdmin()
        setIsAdmin(adminStatus)
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [user])

  // Show loading spinner while checking admin status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Checking permissions..." />
      </div>
    )
  }

  // Redirect to home if not logged in or not an admin
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />
  }

  // Render children if user is admin
  return <>{children}</>
}