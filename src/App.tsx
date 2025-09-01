import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainNavbar from './components/layout/MainNavbar'
import Footer from './components/layout/Footer'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'))
const CollectionPage = lazy(() => import('./pages/CollectionPage'))
const AlertsPage = lazy(() => import('./pages/AlertsPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const NewsPage = lazy(() => import('./pages/NewsPage'))
const ComicDetailPage = lazy(() => import('./pages/ComicDetailPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))

// Mock user data (replace with actual auth context)
const mockUser = {
  name: 'Comic Fan',
  email: 'fan@comicscout.uk',
  avatar: null,
}

function App() {
  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      {/* Main Navigation */}
      <MainNavbar 
        user={mockUser}
        onNavigate={(page) => console.log('Navigate to:', page)}
        onLogout={() => console.log('Logout')}
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
            <Route path="/comic/:id" element={<ComicDetailPage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Protected Routes (add auth guard later) */}
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/account" element={<AccountPage />} />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App
