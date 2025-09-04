import React, { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainNavbar from './components/layout/MainNavbar'
import Footer from './components/layout/Footer'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ToastContainer from './components/ui/ToastContainer'
import AdminRoute from './components/auth/AdminRoute'
import { Toaster } from 'sonner'
import { useUserStore } from './store/userStore'
import { supabase } from './lib/supabaseClient'
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
  
  // Check for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser({
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
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
        } else if (event === 'SIGNED_IN' && session?.user) {
          setUser({
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            avatar: session.user.user_metadata?.avatar_url || null,
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setLoading])
  
  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      {/* Main Navigation */}
      <MainNavbar 
        user={user || undefined}
        onNavigate={(page) => console.log('Navigate to:', page)}
        onLogout={() => {}}
        notificationCount={3}
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
