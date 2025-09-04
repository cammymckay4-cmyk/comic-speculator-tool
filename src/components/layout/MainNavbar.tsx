import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  User, 
  Bell, 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  Settings, 
  LogOut, 
  Star, 
  Home,
  Newspaper,
  AlertCircle,
  DollarSign,
  Heart,
  BookOpen
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useUserStore } from '@/store/userStore'

interface UserType {
  name: string
  email: string
  avatar?: string | null
}

interface MainNavbarProps {
  user?: UserType
  onNavigate?: (page: string) => void
  onLogout?: () => void
  onSearch?: (query: string) => void
  notificationCount?: number
}

const MainNavbar: React.FC<MainNavbarProps> = ({
  user,
  onNavigate = () => {},
  onLogout,
  onSearch,
  notificationCount = 0
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { clearUser } = useUserStore()

  // Navigation items configuration
  const navigationItems = [
    { label: 'Home', key: '/', icon: Home },
    { label: 'News', key: '/news', icon: Newspaper },
    { label: 'Collection', key: '/collection', icon: BookOpen },
    { label: 'Wishlist', key: '/wishlist', icon: Heart },
    { label: 'Alerts', key: '/alerts', icon: AlertCircle },
  ]

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle navigation clicks
  const handleNavClick = (path: string) => {
    navigate(path)
    onNavigate(path)
    setMobileMenuOpen(false)
  }

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search page with query parameter
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setMobileMenuOpen(false)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
        return
      }
      
      clearUser()
      setDropdownOpen(false)
      setMobileMenuOpen(false)
      onLogout?.()
      navigate('/auth')
    } catch (error) {
      console.error('Unexpected logout error:', error)
    }
  }

  return (
    <nav className="bg-stan-lee-blue border-b-comic border-ink-black shadow-comic sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavClick('/')}
              className="flex items-center space-x-2"
            >
              <span className="font-super-squad text-2xl text-parchment">
                COMICSCOUT UK
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`flex items-center space-x-2 px-3 py-2 text-parchment hover:text-golden-age-yellow transition-colors duration-200 ${
                  location.pathname === item.key ? 'text-golden-age-yellow' : ''
                }`}
              >
                <item.icon size={18} />
                <span className="font-semibold uppercase tracking-wide text-sm">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search comics..."
                  className="comic-input pl-4 pr-10 py-2 w-48 lg:w-64"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <Search size={18} className="text-ink-black" />
                </button>
              </div>
            </form>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => handleNavClick('/alerts')}
                className="relative bg-kirby-red hover:bg-opacity-80 rounded-full p-2 transition-colors duration-200"
              >
                <Bell size={18} className="text-parchment" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-golden-age-yellow text-ink-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border border-parchment">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
            </div>

            {/* User Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-parchment hover:text-golden-age-yellow transition-colors duration-200"
                >
                  <div className="w-9 h-9 bg-parchment rounded-full flex items-center justify-center border-2 border-ink-black">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-ink-black" />
                    )}
                  </div>
                  <ChevronDown 
                    size={14} 
                    className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-parchment comic-border shadow-comic-lg z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-ink-black">
                        <p className="font-persona-aura font-medium text-ink-black text-sm">
                          {user.name}
                        </p>
                        <p className="font-persona-aura text-ink-black text-xs opacity-70">
                          {user.email}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => {
                          handleNavClick('/account')
                          setDropdownOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 text-ink-black hover:bg-golden-age-yellow hover:bg-opacity-20 font-persona-aura text-sm flex items-center space-x-2 transition-colors duration-200"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Account Settings</span>
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-kirby-red hover:bg-kirby-red hover:bg-opacity-10 font-persona-aura text-sm flex items-center space-x-2 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('/auth')}
                className="comic-button text-sm"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-parchment hover:text-golden-age-yellow"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobile && mobileMenuOpen && (
          <div className="md:hidden border-t border-ink-black py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="px-4 mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search comics..."
                  className="comic-input w-full pl-4 pr-10 py-2"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <Search size={18} className="text-ink-black" />
                </button>
              </div>
            </form>

            {/* Mobile Navigation Links */}
            <div className="space-y-2 px-4">
              {navigationItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-parchment hover:bg-stan-lee-blue hover:bg-opacity-50 rounded transition-colors duration-200 ${
                    location.pathname === item.key ? 'bg-stan-lee-blue bg-opacity-50' : ''
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-semibold uppercase tracking-wide text-sm">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Overlay to close dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </nav>
  )
}

export default MainNavbar
