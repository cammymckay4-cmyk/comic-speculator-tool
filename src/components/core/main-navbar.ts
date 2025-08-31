import React, { useState } from 'react';
import { ChevronDownIcon, UserIcon, LogOutIcon, SettingsIcon } from 'lucide-react';

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface MainNavbarProps {
  user?: User;
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

const MainNavbar: React.FC<MainNavbarProps> = ({
  user,
  onLogout,
  onNavigate = () => {}
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigationItems = [
    { label: 'Home', key: 'home' },
    { label: 'Weekly News', key: 'news' },
    { label: 'My Collection', key: 'collection' },
    { label: 'Alerts', key: 'alerts' },
    { label: 'Pricing', key: 'pricing' },
  ];

  const handleNavClick = (key: string) => {
    onNavigate(key);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    onLogout?.();
  };

  return (
    <nav className="bg-stan-lee-blue border-b-comic border-ink-black shadow-comic-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <button
              onClick={() => handleNavClick('home')}
              className="text-parchment font-bangers text-2xl tracking-wide hover:text-golden-age-yellow transition-colors duration-200"
            >
              ComicScoutUK
            </button>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex space-x-1">
            {navigationItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className="text-parchment hover:text-golden-age-yellow px-4 py-2 font-inter font-medium uppercase tracking-wide text-sm transition-all duration-200 hover:transform hover:-translate-y-1"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* User Profile Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 text-parchment hover:text-golden-age-yellow transition-colors duration-200 px-3 py-2 rounded-md"
                >
                  <div className="w-8 h-8 bg-parchment rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-ink-black"
                      />
                    ) : (
                      <UserIcon className="w-5 h-5 text-ink-black" />
                    )}
                  </div>
                  <span className="font-inter font-medium text-sm hidden sm:block">
                    {user.name}
                  </span>
                  <ChevronDownIcon 
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-parchment comic-border shadow-comic-lg z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-ink-black">
                        <p className="font-inter font-medium text-ink-black text-sm">
                          {user.name}
                        </p>
                        <p className="font-inter text-ink-black text-xs opacity-70">
                          {user.email}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => {
                          handleNavClick('account');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-ink-black hover:bg-golden-age-yellow hover:bg-opacity-20 font-inter text-sm flex items-center space-x-2 transition-colors duration-200"
                      >
                        <SettingsIcon className="w-4 h-4" />
                        <span>Account Settings</span>
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-kirby-red hover:bg-kirby-red hover:bg-opacity-10 font-inter text-sm flex items-center space-x-2 transition-colors duration-200"
                      >
                        <LogOutIcon className="w-4 h-4" />
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

        {/* Mobile Navigation Menu */}
        <div className="md:hidden border-t border-ink-black mt-2 pt-2 pb-2">
          <div className="flex flex-wrap gap-2">
            {navigationItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className="text-parchment hover:text-golden-age-yellow px-3 py-1 font-inter font-medium uppercase tracking-wide text-xs transition-colors duration-200"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </nav>
  );
};

export default MainNavbar;