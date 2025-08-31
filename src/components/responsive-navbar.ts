import React, { useState, useEffect } from 'react';
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
  Heart, 
  BookOpen, 
  TrendingUp, 
  DollarSign,
  Home,
  Newspaper,
  AlertCircle
} from 'lucide-react';

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface ResponsiveNavbarProps {
  user?: User;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  notificationCount?: number;
}

const ResponsiveNavbar: React.FC<ResponsiveNavbarProps> = ({
  user,
  onNavigate = () => {},
  onLogout,
  onSearch,
  notificationCount = 0
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Navigation items configuration
  const navigationItems = [
    { label: 'Home', key: 'home', icon: Home },
    { label: 'Weekly News', key: 'news', icon: Newspaper },
    { label: 'My Collection', key: 'collection', icon: Star },
    { label: 'Alerts', key: 'alerts', icon: AlertCircle },
    { label: 'Pricing', key: 'pricing', icon: DollarSign },
  ];

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Close mobile menu when switching to desktop
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle navigation clicks
  const handleNavClick = (key: string) => {
    onNavigate(key);
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  // Handle logout
  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    onLogout?.();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-dropdown]')) {
        setDropdownOpen(false);
        setMoreMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Desktop Navbar (Option 3: Compact with Dropdown Menus)
  const DesktopNavbar = () => (
    <nav className="bg-stan-lee-blue border-b-comic border-ink-black shadow-comic-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          
          {/* Logo with Hot Badge */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleNavClick('home')}
              className="text-parchment font-bangers text-xl tracking-wide hover:text-golden-age-yellow transition-colors duration-200"
            >
              ComicScoutUK
            </button>
            
            <div className="bg-golden-age-yellow text-ink-black px-3 py-1 font-bangers text-xs uppercase tracking-wider border-2 border-ink-black shadow-comic-sm transform -rotate-3 hover:rotate-0 transition-transform duration-200">
              HOT!
            </div>
          </div>

          {/* Compact Navigation */}
          <div className="flex items-center space-x-1">
            {navigationItems.slice(0, 3).map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className="flex items-center space-x-2 text-parchment hover:text-golden-age-yellow px-3 py-2 font-inter text-sm font-medium uppercase tracking-wide transition-all duration-200 hover:bg-golden-age-yellow hover:bg-opacity-10 rounded-sm"
              >
                <item.icon size={14} />
                <span className="hidden lg:block">{item.label}</span>
              </button>
            ))}
            
            {/* More Menu */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="flex items-center space-x-2 text-parchment hover:text-golden-age-yellow px-3 py-2 font-inter text-sm font-medium uppercase tracking-wide transition-colors duration-200"
              >
                <Menu size={14} />
                <span>More</span>
                <ChevronDown 
                  size={12} 
                  className={`transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              
              {moreMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-parchment comic-border shadow-comic-lg z-50">
                  <div className="py-2">
                    {navigationItems.slice(3).map((item) => (
                      <button
                        key={item.key}
                        onClick={() => handleNavClick(item.key)}
                        className="w-full text-left px-4 py-3 text-ink-black hover:bg-golden-age-yellow hover:bg-opacity-20 font-inter text-sm font-semibold uppercase tracking-wide flex items-center space-x-3 transition-colors duration-200"
                      >
                        <item.icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => handleNavClick('notifications')}
                className="relative bg-kirby-red hover:bg-opacity-80 rounded-full p-2 transition-colors duration-200"
              >
                <Bell size={16} className="text-parchment" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-golden-age-yellow text-ink-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border border-parchment">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* User Profile */}
            {user ? (
              <div className="relative" data-dropdown>
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

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-parchment comic-border shadow-comic-lg z-50">
                    <div className="px-4 py-3 border-b-2 border-ink-black">
                      <p className="font-inter font-semibold text-ink-black text-sm">
                        {user.name}
                      </p>
                      <p className="font-inter text-ink-black text-xs opacity-70">
                        {user.email}
                      </p>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => {
                          handleNavClick('account');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-ink-black hover:bg-golden-age-yellow hover:bg-opacity-20 font-inter text-sm flex items-center space-x-3 transition-colors duration-200"
                      >
                        <Settings size={16} />
                        <span>Account Settings</span>
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-kirby-red hover:bg-kirby-red hover:bg-opacity-10 font-inter text-sm flex items-center space-x-3 transition-colors duration-200"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('auth')}
                className="comic-button text-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );

  // Mobile Navbar (Option 4: Mobile-First Hamburger Style)
  const MobileNavbar = () => (
    <nav className="bg-stan-lee-blue border-b-comic border-ink-black shadow-comic-sm">
      <div className="px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-kirby-red border-2 border-ink-black shadow-comic-sm p-2 hover:transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-comic transition-all duration-200"
          >
            {mobileMenuOpen ? 
              <X size={20} className="text-parchment" /> : 
              <Menu size={20} className="text-parchment" />
            }
          </button>

          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="text-parchment font-bangers text-xl tracking-wide hover:text-golden-age-yellow transition-colors duration-200"
          >
            ComicScoutUK
          </button>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleNavClick('search')}
              className="bg-golden-age-yellow border-2 border-ink-black shadow-comic-sm p-2 hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
            >
              <Search size={16} className="text-ink-black" />
            </button>
            
            {user ? (
              <button
                onClick={() => handleNavClick('profile')}
                className="w-8 h-8 bg-parchment rounded-full flex items-center justify-center border-2 border-ink-black"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User size={16} className="text-ink-black" />
                )}
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('auth')}
                className="bg-parchment border-2 border-ink-black shadow-comic-sm px-3 py-1 font-inter font-semibold text-xs text-ink-black uppercase tracking-wide"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="bg-parchment border-t-2 border-ink-black shadow-inner">
          <div className="px-4 py-4">
            {/* User Info (if logged in) */}
            {user && (
              <div className="mb-4 p-4 bg-golden-age-yellow bg-opacity-20 border-2 border-golden-age-yellow shadow-comic-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-parchment rounded-full flex items-center justify-center border-2 border-ink-black">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-ink-black" />
                    )}
                  </div>
                  <div>
                    <p className="font-inter font-semibold text-ink-black text-sm">
                      {user.name}
                    </p>
                    <p className="font-inter text-ink-black text-xs opacity-70">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {navigationItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  className="comic-button flex items-center justify-center space-x-2 p-3 text-sm"
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* User Actions */}
            {user && (
              <div className="pt-4 border-t-2 border-ink-black space-y-2">
                <button
                  onClick={() => handleNavClick('account')}
                  className="w-full text-left px-4 py-3 text-ink-black hover:bg-golden-age-yellow hover:bg-opacity-20 font-inter text-sm flex items-center space-x-3 border-2 border-ink-black shadow-comic-sm transition-colors duration-200"
                >
                  <Settings size={16} />
                  <span>Account Settings</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-kirby-red hover:bg-kirby-red hover:bg-opacity-10 font-inter text-sm flex items-center space-x-3 border-2 border-kirby-red shadow-comic-sm transition-colors duration-200"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );

  // Return the appropriate navbar based on screen size
  return isMobile ? <MobileNavbar /> : <DesktopNavbar />;
};

export default ResponsiveNavbar;