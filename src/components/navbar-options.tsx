import React, { useState } from 'react';
import { User, Bell, Search, Menu, X, ChevronDown, Settings, LogOut, Star, Heart, BookOpen, TrendingUp, DollarSign } from 'lucide-react';

const NavbarShowcase = () => {
  const [currentNavbar, setCurrentNavbar] = useState('option1');
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState({});

  const mockUser = {
    name: "Stan Lee",
    email: "stan@marvel.com",
    avatar: null
  };

  const navigationItems = [
    { label: 'Home', key: 'home', icon: BookOpen },
    { label: 'Weekly News', key: 'news', icon: TrendingUp },
    { label: 'My Collection', key: 'collection', icon: Star },
    { label: 'Alerts', key: 'alerts', icon: Bell },
    { label: 'Pricing', key: 'pricing', icon: DollarSign },
  ];

  const toggleDropdown = (navbarId) => {
    setDropdownOpen(prev => ({
      ...prev,
      [navbarId]: !prev[navbarId]
    }));
  };

  const toggleMobileMenu = (navbarId) => {
    setMobileMenuOpen(prev => ({
      ...prev,
      [navbarId]: !prev[navbarId]
    }));
  };

  // Shared Styles
  const buttonStyle = {
    fontFamily: 'Impact, "Arial Black", sans-serif',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    border: '3px solid rgb(28, 28, 28)',
    padding: '8px 16px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: 'rgb(253, 246, 227)',
    color: 'rgb(28, 28, 28)',
    boxShadow: '3px 3px 0px rgb(28, 28, 28)'
  };

  // Option 1: Classic Horizontal Layout
  const Navbar1 = () => (
    <div>
      <nav style={{
        backgroundColor: 'rgb(0, 48, 73)',
        borderBottom: '3px solid rgb(28, 28, 28)',
        boxShadow: '3px 3px 0px rgb(28, 28, 28)',
        padding: '0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
            
            {/* Logo */}
            <div>
              <button style={{
                fontFamily: 'Impact, "Arial Black", sans-serif',
                fontSize: '24px',
                fontWeight: '900',
                color: 'rgb(253, 246, 227)',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = 'rgb(247, 181, 56)'}
              onMouseLeave={(e) => e.target.style.color = 'rgb(253, 246, 227)'}
              >
                ComicScoutUK
              </button>
            </div>

            {/* Desktop Navigation */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {navigationItems.map((item) => (
                <button
                  key={item.key}
                  style={{
                    color: 'rgb(253, 246, 227)',
                    background: 'none',
                    border: 'none',
                    padding: '8px 16px',
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '14px',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderRadius: '0'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'rgb(247, 181, 56)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'rgb(253, 246, 227)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* User Section */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => toggleDropdown('nav1')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'rgb(253, 246, 227)',
                  background: 'none',
                  border: 'none',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = 'rgb(247, 181, 56)'}
                onMouseLeave={(e) => e.target.style.color = 'rgb(253, 246, 227)'}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'rgb(253, 246, 227)',
                  border: '2px solid rgb(28, 28, 28)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={18} color="rgb(28, 28, 28)" />
                </div>
                <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px', fontWeight: '500' }}>
                  {mockUser.name}
                </span>
                <ChevronDown size={16} />
              </button>

              {/* Dropdown */}
              {dropdownOpen.nav1 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  marginTop: '8px',
                  width: '200px',
                  backgroundColor: 'rgb(253, 246, 227)',
                  border: '3px solid rgb(28, 28, 28)',
                  boxShadow: '6px 6px 0px rgb(28, 28, 28)',
                  zIndex: 50
                }}>
                  <div style={{ padding: '16px', borderBottom: '2px solid rgb(28, 28, 28)' }}>
                    <p style={{ margin: '0', fontFamily: 'system-ui, sans-serif', fontSize: '14px', fontWeight: '600' }}>
                      {mockUser.name}
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontFamily: 'system-ui, sans-serif', fontSize: '12px', opacity: 0.7 }}>
                      {mockUser.email}
                    </p>
                  </div>
                  <button style={{
                    ...buttonStyle,
                    width: '100%',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none',
                    boxShadow: 'none',
                    padding: '12px 16px'
                  }}>
                    <Settings size={16} />
                    Account Settings
                  </button>
                  <button style={{
                    ...buttonStyle,
                    width: '100%',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none',
                    boxShadow: 'none',
                    padding: '12px 16px',
                    color: 'rgb(214, 40, 40)'
                  }}>
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );

  // Option 2: Two-Row Layout with Search
  const Navbar2 = () => (
    <div>
      <nav style={{
        backgroundColor: 'rgb(0, 48, 73)',
        borderBottom: '3px solid rgb(28, 28, 28)',
        boxShadow: '3px 3px 0px rgb(28, 28, 28)'
      }}>
        {/* Top Row */}
        <div style={{ borderBottom: '2px solid rgb(253, 246, 227)', borderOpacity: 0.2 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '48px' }}>
              
              {/* Logo */}
              <div>
                <button style={{
                  fontFamily: 'Impact, "Arial Black", sans-serif',
                  fontSize: '28px',
                  fontWeight: '900',
                  color: 'rgb(253, 246, 227)',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  ComicScoutUK
                </button>
              </div>

              {/* Search Bar */}
              <div style={{ flex: 1, maxWidth: '400px', margin: '0 32px' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    placeholder="Search comics, creators, publishers..."
                    style={{
                      width: '100%',
                      padding: '8px 40px 8px 16px',
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: '14px',
                      border: '2px solid rgb(28, 28, 28)',
                      backgroundColor: 'rgb(253, 246, 227)',
                      color: 'rgb(28, 28, 28)',
                      outline: 'none'
                    }}
                  />
                  <Search 
                    size={20} 
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgb(28, 28, 28)',
                      opacity: 0.6
                    }}
                  />
                </div>
              </div>

              {/* User Section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Bell size={20} color="rgb(253, 246, 227)" style={{ cursor: 'pointer' }} />
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'rgb(253, 246, 227)',
                  border: '2px solid rgb(28, 28, 28)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}>
                  <User size={18} color="rgb(28, 28, 28)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Navigation */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', gap: '8px', height: '48px', alignItems: 'center' }}>
            {navigationItems.map((item) => (
              <button
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'rgb(253, 246, 227)',
                  background: 'none',
                  border: 'none',
                  padding: '8px 16px',
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '14px',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgb(247, 181, 56)';
                  e.target.style.color = 'rgb(28, 28, 28)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'rgb(253, 246, 227)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );

  // Option 3: Compact with Dropdown Menus
  const Navbar3 = () => (
    <div>
      <nav style={{
        backgroundColor: 'rgb(0, 48, 73)',
        borderBottom: '3px solid rgb(28, 28, 28)',
        boxShadow: '3px 3px 0px rgb(28, 28, 28)',
        padding: '0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '56px' }}>
            
            {/* Logo with Action Bubble */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button style={{
                fontFamily: 'Impact, "Arial Black", sans-serif',
                fontSize: '20px',
                fontWeight: '900',
                color: 'rgb(253, 246, 227)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}>
                ComicScoutUK
              </button>
              
              <div style={{
                backgroundColor: 'rgb(247, 181, 56)',
                color: 'rgb(28, 28, 28)',
                padding: '4px 12px',
                fontFamily: 'Impact, "Arial Black", sans-serif',
                fontSize: '12px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: '2px 2px 0px rgb(28, 28, 28)',
                transform: 'rotate(-3deg)'
              }}>
                HOT!
              </div>
            </div>

            {/* Compact Navigation */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {navigationItems.slice(0, 3).map((item) => (
                <button
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'rgb(253, 246, 227)',
                    background: 'none',
                    border: 'none',
                    padding: '6px 12px',
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '13px',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(247, 181, 56, 0.2)';
                    e.target.style.color = 'rgb(247, 181, 56)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = 'rgb(253, 246, 227)';
                  }}
                >
                  <item.icon size={14} />
                  {item.label}
                </button>
              ))}
              
              {/* More Menu */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => toggleDropdown('nav3')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'rgb(253, 246, 227)',
                    background: 'none',
                    border: 'none',
                    padding: '6px 12px',
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '13px',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    cursor: 'pointer'
                  }}
                >
                  <Menu size={14} />
                  More
                  <ChevronDown size={12} />
                </button>
                
                {dropdownOpen.nav3 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    marginTop: '8px',
                    width: '180px',
                    backgroundColor: 'rgb(253, 246, 227)',
                    border: '3px solid rgb(28, 28, 28)',
                    boxShadow: '6px 6px 0px rgb(28, 28, 28)',
                    zIndex: 50
                  }}>
                    {navigationItems.slice(3).map((item) => (
                      <button
                        key={item.key}
                        style={{
                          ...buttonStyle,
                          width: '100%',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          border: 'none',
                          boxShadow: 'none',
                          padding: '12px 16px'
                        }}
                      >
                        <item.icon size={16} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* User Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                position: 'relative',
                backgroundColor: 'rgb(214, 40, 40)',
                borderRadius: '50%',
                padding: '8px',
                cursor: 'pointer'
              }}>
                <Bell size={16} color="rgb(253, 246, 227)" />
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'rgb(247, 181, 56)',
                  borderRadius: '50%',
                  border: '1px solid rgb(253, 246, 227)'
                }}></div>
              </div>
              
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'rgb(253, 246, 227)',
                border: '2px solid rgb(28, 28, 28)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}>
                <User size={20} color="rgb(28, 28, 28)" />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );

  // Option 4: Mobile-First Hamburger Style
  const Navbar4 = () => (
    <div>
      <nav style={{
        backgroundColor: 'rgb(0, 48, 73)',
        borderBottom: '3px solid rgb(28, 28, 28)',
        boxShadow: '3px 3px 0px rgb(28, 28, 28)',
        padding: '0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => toggleMobileMenu('nav4')}
              style={{
                backgroundColor: 'rgb(214, 40, 40)',
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                padding: '8px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translate(-1px, -1px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translate(0, 0)'}
            >
              {mobileMenuOpen.nav4 ? 
                <X size={20} color="rgb(253, 246, 227)" /> : 
                <Menu size={20} color="rgb(253, 246, 227)" />
              }
            </button>

            {/* Logo */}
            <div>
              <button style={{
                fontFamily: 'Impact, "Arial Black", sans-serif',
                fontSize: '22px',
                fontWeight: '900',
                color: 'rgb(253, 246, 227)',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}>
                ComicScoutUK
              </button>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button style={{
                backgroundColor: 'rgb(247, 181, 56)',
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: '2px 2px 0px rgb(28, 28, 28)',
                padding: '6px',
                cursor: 'pointer'
              }}>
                <Search size={16} color="rgb(28, 28, 28)" />
              </button>
              
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'rgb(253, 246, 227)',
                border: '2px solid rgb(28, 28, 28)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}>
                <User size={16} color="rgb(28, 28, 28)" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen.nav4 && (
          <div style={{
            backgroundColor: 'rgb(253, 246, 227)',
            borderTop: '2px solid rgb(28, 28, 28)',
            boxShadow: 'inset 0 2px 0 rgb(28, 28, 28)'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                {navigationItems.map((item) => (
                  <button
                    key={item.key}
                    style={{
                      ...buttonStyle,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      justifyContent: 'flex-start',
                      padding: '12px 16px',
                      backgroundColor: 'rgb(253, 246, 227)',
                      border: '2px solid rgb(28, 28, 28)',
                      boxShadow: '3px 3px 0px rgb(28, 28, 28)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgb(247, 181, 56)';
                      e.target.style.transform = 'translate(-1px, -1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgb(253, 246, 227)';
                      e.target.style.transform = 'translate(0, 0)';
                    }}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );

  const navbarOptions = [
    { id: 'option1', label: 'Option 1: Classic Horizontal', component: Navbar1, description: 'Traditional layout with horizontal navigation and user dropdown' },
    { id: 'option2', label: 'Option 2: Two-Row with Search', component: Navbar2, description: 'Spacious layout with prominent search bar and icon navigation' },
    { id: 'option3', label: 'Option 3: Compact Dropdown', component: Navbar3, description: 'Condensed design with "More" menu and notification badges' },
    { id: 'option4', label: 'Option 4: Mobile-First', component: Navbar4, description: 'Hamburger menu style with mobile-optimized layout' }
  ];

  const CurrentNavbar = navbarOptions.find(option => option.id === currentNavbar)?.component || Navbar1;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'rgb(253, 246, 227)' }}>
      {/* Current Navbar Display */}
      <CurrentNavbar />

      {/* Content Area */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontFamily: 'Impact, "Arial Black", sans-serif',
            fontSize: '48px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: 'rgb(214, 40, 40)',
            margin: '0 0 16px 0'
          }}>
            Navbar Options
          </h1>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '18px',
            color: 'rgb(28, 28, 28)',
            opacity: 0.7,
            margin: 0
          }}>
            Choose your preferred navigation style
          </p>
        </div>

        {/* Option Selector */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {navbarOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setCurrentNavbar(option.id)}
                style={{
                  ...buttonStyle,
                  padding: '20px',
                  textAlign: 'left',
                  backgroundColor: currentNavbar === option.id ? 'rgb(214, 40, 40)' : 'rgb(253, 246, 227)',
                  color: currentNavbar === option.id ? 'rgb(253, 246, 227)' : 'rgb(28, 28, 28)',
                  boxShadow: currentNavbar === option.id ? '6px 6px 0px rgb(28, 28, 28)' : '3px 3px 0px rgb(28, 28, 28)',
                  transform: currentNavbar === option.id ? 'translate(-2px, -2px)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (currentNavbar !== option.id) {
                    e.target.style.backgroundColor = 'rgb(247, 181, 56)';
                    e.target.style.transform = 'translate(-1px, -1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentNavbar !== option.id) {
                    e.target.style.backgroundColor = 'rgb(253, 246, 227)';
                    e.target.style.transform = 'translate(0, 0)';
                  }
                }}
              >
                <h3 style={{
                  fontFamily: 'Impact, "Arial Black", sans-serif',
                  fontSize: '16px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  margin: '0 0 8px 0'
                }}>
                  {option.label}
                </h3>
                <p style={{
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '14px',
                  opacity: 0.8,
                  margin: 0,
                  textTransform: 'none',
                  letterSpacing: 'normal',
                  fontWeight: 'normal'
                }}>
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Features Description */}
        <div style={{
          backgroundColor: 'rgb(253, 246, 227)',
          border: '3px solid rgb(28, 28, 28)',
          boxShadow: '6px 6px 0px rgb(28, 28, 28)',
          padding: '32px',
          marginBottom: '32px'
        }}>
          <h2 style={{
            fontFamily: 'Impact, "Arial Black", sans-serif',
            fontSize: '24px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: 'rgb(28, 28, 28)',
            margin: '0 0 24px 0',
            textAlign: 'center'
          }}>
            All Options Include:
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {[
              { icon: '🎨', title: 'Comic Book Styling', desc: 'Bold borders, shadows, and comic-themed colors' },
              { icon: '📱', title: 'Responsive Design', desc: 'Works perfectly on desktop, tablet, and mobile' },
              { icon: '⚡', title: 'Smooth Animations', desc: 'Subtle hover effects and transitions' },
              { icon: '👤', title: 'User Management', desc: 'Profile dropdowns and account access' },
              { icon: '🔍', title: 'Search Integration', desc: 'Easy to add search functionality' },
              { icon: '🔔', title: 'Notifications', desc: 'Alert badges and notification systems' }
            ].map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '16px',
                backgroundColor: 'rgb(247, 181, 56)',
                backgroundColor: 'rgba(247, 181, 56, 0.1)',
                border: '2px solid rgb(247, 181, 56)',
                boxShadow: '2px 2px 0px rgb(247, 181, 56)'
              }}>
                <span style={{ fontSize: '24px' }}>{feature.icon}</span>
                <div>
                  <h4 style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'rgb(28, 28, 28)',
                    margin: '0 0 4px 0'
                  }}>
                    {feature.title}
                  </h4>
                  <p style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '14px',
                    color: 'rgb(28, 28, 28)',
                    opacity: 0.7,
                    margin: 0
                  }}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            color: 'rgb(28, 28, 28)',
            opacity: 0.7
          }}>
            Try clicking the navigation items and user profiles to see interactive elements!
          </p>
        </div>
      </div>
    </div>
  );
};

export default NavbarShowcase;