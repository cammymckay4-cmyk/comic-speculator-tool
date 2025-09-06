import React, { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import MainNavbar from './components/layout/MainNavbar'
import Footer from './components/layout/Footer'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ToastContainer from './components/ui/ToastContainer'
import AdminRoute from './components/auth/AdminRoute'
import { Toaster } from 'sonner'
import { useUserStore } from './store/userStore'
import { supabase } from './lib/supabaseClient'
import { useAlertsCount } from './hooks/useAlertsCount'
import { usePostAuthActions } from './hooks/usePostAuthActions'
import { setAuthStorage, getAuthStorage, clearAuthStorage, cleanupExpiredAuthStorage } from './utils/authStorage'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'))
const CollectionPage = lazy(() => import('./pages/CollectionPage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const AlertsPage = lazy(() => import('./pages/AlertsPage'))
const AlertConfigPage = lazy(() => import('./pages/AlertConfigPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const NewsPage = lazy(() => import('./pages/NewsPage'))
const ComicDetailPage = lazy(() => import('./pages/ComicDetailPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const AuthConfirmPage = lazy(() => import('./pages/AuthConfirmPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))

function App() {
  const { user, setUser, setLoading } = useUserStore()
  const { data: alertsCount = 0 } = useAlertsCount()
  const navigate = useNavigate()
  
  // Handle post-auth actions
  usePostAuthActions()

  // Clean up expired auth storage on app load
  useEffect(() => {
    cleanupExpiredAuthStorage()
  }, [])

  // Track where users came from using URL params and localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const hasToken = urlParams.has('token_hash')
    const hasType = urlParams.has('type')
    const hasError = urlParams.has('error_code')
    const redirectParam = urlParams.get('redirect')
    const actionParam = urlParams.get('action')
    
    // Store redirect path from URL params
    if (redirectParam && !getAuthStorage('authReturnPath')) {
      setAuthStorage('authReturnPath', redirectParam)
    }
    
    // Store intended action if present
    if (actionParam && !getAuthStorage('authIntendedAction')) {
      setAuthStorage('authIntendedAction', actionParam)
    }
    
    if (hasToken || hasType || hasError) {
      console.log('[APP] Email confirmation detected - setting redirect flag')
      setAuthStorage('shouldRedirectToAccount', 'true')
    }
  }, [])

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            avatar: session.user.user_metadata?.avatar_url || null,
          })
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('[APP] Auth state change detected:', {
          event,
          hasSession: !!session,
          userEmail: session?.user?.email,
          currentPath: window.location.pathname,
          timestamp: new Date().toISOString()
        })
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('[APP] User signed out or no session - clearing user state and flags')
          setUser(null)
          // Clear redirect flags on logout
          clearAuthStorage('shouldRedirectToAccount')
          clearAuthStorage('hasNavigatedAfterAuth')
          clearAuthStorage('authReturnPath')
          clearAuthStorage('authIntendedAction')
        } else if (event === 'SIGNED_IN' && session?.user) {
          console.log('[APP] User signed in - setting user state:', {
            userId: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name
          })
          
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            avatar: session.user.user_metadata?.avatar_url || null,
          })
          
          // Determine correct destination after successful auth
          const userCreatedAt = new Date(session.user.created_at)
          const now = new Date()
          const isNewSignup = (now.getTime() - userCreatedAt.getTime()) < 60000 // 60 seconds
          const shouldRedirectToAccount = getAuthStorage('shouldRedirectToAccount')
          const authReturnPath = getAuthStorage('authReturnPath')
          const urlParams = new URLSearchParams(window.location.search)
          const redirectParam = urlParams.get('redirect')
          
          console.log('Auth Return Path from storage:', authReturnPath)
          console.log('Redirect param:', redirectParam)
          
          if (!getAuthStorage('hasNavigatedAfterAuth')) {
            console.log('[APP] Determining post-auth destination:', {
              isNewSignup,
              shouldRedirectToAccount: !!shouldRedirectToAccount,
              authReturnPath,
              redirectParam,
              userCreatedAt: userCreatedAt.toISOString(),
              now: now.toISOString()
            })
            
            setAuthStorage('hasNavigatedAfterAuth', 'true')
            
            let destination = '/'
            
            if (isNewSignup) {
              // New signup → go to /account to complete profile
              console.log('[APP] New signup detected - redirecting to account page')
              destination = '/account'
            } else if (shouldRedirectToAccount) {
              // Email confirmation → go to account
              console.log('[APP] Email confirmation redirect - going to account page')
              destination = '/account'
            } else if (authReturnPath) {
              // Return to stored path from localStorage
              console.log('[APP] Returning to stored path:', authReturnPath)
              destination = authReturnPath
            } else if (redirectParam) {
              // Use redirect param from URL
              console.log('[APP] Using redirect param:', redirectParam)
              destination = redirectParam
            } else {
              // Regular sign-in → home page
              console.log('[APP] Regular sign-in - going to home page')
              destination = '/'
            }
            
            console.log('Final destination:', destination)
            
            // Clear redirect data after use
            clearAuthStorage('shouldRedirectToAccount')
            clearAuthStorage('authReturnPath')
            
            // Note: Keep authIntendedAction for post-auth action completion
            navigate(destination)
            return
          }
          
          console.log('[APP] User authenticated, current location:', window.location.pathname)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setLoading, navigate])
  
  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      {/* Main Navigation */}
      <MainNavbar 
        user={user || undefined}
        onNavigate={(page) => console.log('Navigate to:', page)}
        onLogout={() => {}}
        notificationCount={alertsCount}
      />

      {/* Main Content */}
      <main className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" text="Loading..." />
          </div>
        }>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/comic/:id" element={<ComicDetailPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/confirm" element={<AuthConfirmPage />} />
            
            {/* Protected Routes (add auth guard later) */}
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/alerts/configure/:comicId" element={<AlertConfigPage />} />
            <Route path="/account" element={<AccountPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            } />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Footer */}
      <Footer />
      
      {/* Toast Container */}
      <ToastContainer />
      
      {/* Sonner Toast Provider */}
      <Toaster />
    </div>
  )
}

export default App
