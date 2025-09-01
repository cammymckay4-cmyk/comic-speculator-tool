import React, { useState } from 'react';
import { 
  Home, 
  Package, 
  Bell, 
  User, 
  ChevronDown, 
  Settings, 
  LogOut,
  Grid3X3
} from 'lucide-react';

interface NavItem {
  label: string;
  key: string;
  icon: React.ComponentType<{ size?: number }>;
}

interface UserInfo {
  name: string;
  email: string;
  avatar?: string;
}

interface ComicNavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: UserInfo;
  navItems?: NavItem[];
}

const ComicNavbar: React.FC<ComicNavbarProps> = ({
  currentPage,
  setCurrentPage,
  user,
  navItems = [
    { label: 'Home', key: 'home', icon: Home },
    { label: 'Collection', key: 'collection', icon: Package },
    { label: 'Alerts', key: 'alerts', icon: Bell },
    { label: 'Components', key: 'components', icon: Grid3X3 }
  ]
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav style={{
      backgroundColor: 'rgb(0, 48, 73)',
      borderBottom: '3px solid rgb(28, 28, 28)',
      boxShadow: '0 3px 0px rgb(28, 28, 28)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          
          {/* Logo */}
          <button
            onClick={() => setCurrentPage('home')}
            style={{
              fontFamily: '"Super Squad", Impact, sans-serif',
              fontSize: '28px',
              fontWeight: '900',
              color: 'rgb(253, 246, 227)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textShadow: '2px 2px 0px rgba(0,0,0,0.3)'
            }}
          >
            ComicScoutUK
          </button>

          {/* Desktop Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setCurrentPage(item.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: currentPage === item.key ? 'rgba(247, 181, 56, 0.2)' : 'transparent',
                    color: currentPage === item.key ? 'rgb(247, 181, 56)' : 'rgb(253, 246, 227)',
                    border: 'none',
                    borderRadius: '4px',
                    fontFamily: '"Persona Aura", system-ui, sans-serif',
                    fontSize: '14px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== item.key) {
                      e.currentTarget.style.backgroundColor = 'rgba(247, 181, 56, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== item.key) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* User Profile */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'rgb(253, 246, 227)',
                  cursor: 'pointer',
                  fontFamily: '"Persona Aura", system-ui, sans-serif',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'rgb(253, 246, 227)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgb(28, 28, 28)'
                }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                  ) : (
                    <User size={18} color="rgb(28, 28, 28)" />
                  )}
                </div>
                <span>{user.name}</span>
                <ChevronDown size={16} />
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '200px',
                  backgroundColor: 'rgb(253, 246, 227)',
                  border: '3px solid rgb(28, 28, 28)',
                  boxShadow: '6px 6px 0px rgb(28, 28, 28)'
                }}>
                  <button
                    onClick={() => {
                      setCurrentPage('account');
                      setDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid rgba(28, 28, 28, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontFamily: '"Persona Aura", system-ui, sans-serif',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(247, 181, 56, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Settings size={16} />
                    Account Hub
                  </button>
                  <button
                    onClick={() => {
                      // Handle sign out
                      setDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontFamily: '"Persona Aura", system-ui, sans-serif',
                      fontSize: '14px',
                      color: 'rgb(214, 40, 40)',
                      cursor: 'pointer'
                    }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ComicNavbar;