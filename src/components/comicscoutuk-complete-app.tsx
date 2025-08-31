import React, { useState } from 'react';
import { 
  Search, Filter, X, ChevronDown, Check, Calendar, DollarSign, Star, Tag, BookOpen,
  TrendingUp, TrendingDown, Clock, Bell, User, Settings, LogOut, Home, Newspaper,
  AlertCircle, Menu, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Plus, Eye,
  Heart, Trash2, Edit, MoreHorizontal, Zap, ShoppingCart, Award, Package
} from 'lucide-react';

const ComicScoutUKApp = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState({
    name: 'Stan Lee',
    email: 'stan@marvel.com',
    avatar: null
  });

  // Shared Navbar Component
  const Navbar = () => {
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
                {[
                  { label: 'Home', key: 'home', icon: Home },
                  { label: 'Collection', key: 'collection', icon: Package },
                  { label: 'Alerts', key: 'alerts', icon: Bell }
                ].map((item) => (
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
                    <User size={18} color="rgb(28, 28, 28)" />
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

  // Home Dashboard Page
  const HomePage = () => {
    const hotComics = [
      { id: 1, title: 'Amazing Spider-Man', issue: '#1', value: '£850', change: '+12%', trend: 'up' },
      { id: 2, title: 'Batman', issue: '#497', value: '£320', change: '+8%', trend: 'up' },
      { id: 3, title: 'X-Men', issue: '#94', value: '£1,250', change: '-3%', trend: 'down' }
    ];

    const news = [
      { id: 1, title: 'Marvel Announces New Spider-Man Series', date: 'Today', category: 'NEWS' },
      { id: 2, title: 'Key Issue Alert: First Appearance Values Rising', date: '2 days ago', category: 'MARKET' }
    ];

    return (
      <div style={{ padding: '32px 16px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgb(214, 40, 40), rgb(185, 28, 28))',
          border: '3px solid rgb(28, 28, 28)',
          boxShadow: '6px 6px 0px rgb(28, 28, 28)',
          padding: '48px',
          marginBottom: '32px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h1 style={{
            fontFamily: '"Super Squad", Impact, sans-serif',
            fontSize: '48px',
            fontWeight: '900',
            color: 'rgb(253, 246, 227)',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            margin: '0 0 16px 0',
            textShadow: '3px 3px 0px rgba(0,0,0,0.3)'
          }}>
            Welcome Back, True Believer!
          </h1>
          <p style={{
            fontFamily: '"Persona Aura", system-ui, sans-serif',
            fontSize: '18px',
            color: 'rgb(253, 246, 227)',
            opacity: 0.9
          }}>
            Your collection is worth £12,450 • 3 new alerts triggered
          </p>
          
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '20px',
            transform: 'rotate(15deg)',
            fontFamily: '"Super Squad", Impact, sans-serif',
            fontSize: '60px',
            color: 'rgba(255, 255, 255, 0.1)',
            fontWeight: '900'
          }}>
            POW!
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {[
            { label: 'Total Comics', value: '156', icon: Package, color: 'rgb(59, 130, 246)' },
            { label: 'Collection Value', value: '£12,450', icon: DollarSign, color: 'rgb(34, 197, 94)' },
            { label: 'Active Alerts', value: '8', icon: Bell, color: 'rgb(247, 181, 56)' },
            { label: 'Wishlist Items', value: '23', icon: Heart, color: 'rgb(214, 40, 40)' }
          ].map((stat, index) => (
            <div key={index} style={{
              background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
              border: '3px solid rgb(28, 28, 28)',
              boxShadow: '4px 4px 0px rgb(28, 28, 28)',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: stat.color,
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: '2px 2px 0px rgb(28, 28, 28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <stat.icon size={24} color="white" />
              </div>
              <div>
                <div style={{
                  fontFamily: '"Persona Aura", system-ui, sans-serif',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  color: 'rgb(107, 114, 128)',
                  marginBottom: '4px'
                }}>
                  {stat.label}
                </div>
                <div style={{
                  fontFamily: '"Super Squad", Impact, sans-serif',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'rgb(28, 28, 28)'
                }}>
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hot Comics Section */}
        <div style={{
          background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
          border: '3px solid rgb(28, 28, 28)',
          boxShadow: '6px 6px 0px rgb(28, 28, 28)',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h2 style={{
            fontFamily: '"Super Squad", Impact, sans-serif',
            fontSize: '24px',
            textTransform: 'uppercase',
            color: 'rgb(28, 28, 28)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <TrendingUp size={24} color="rgb(214, 40, 40)" />
            Hot Comics This Week
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {hotComics.map((comic) => (
              <div key={comic.id} style={{
                backgroundColor: 'rgb(255, 255, 255)',
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-2px, -2px)';
                e.currentTarget.style.boxShadow = '5px 5px 0px rgb(28, 28, 28)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '3px 3px 0px rgb(28, 28, 28)';
              }}>
                <div>
                  <h3 style={{
                    fontFamily: '"Super Squad", Impact, sans-serif',
                    fontSize: '16px',
                    color: 'rgb(28, 28, 28)',
                    margin: '0 0 4px 0'
                  }}>
                    {comic.title} {comic.issue}
                  </h3>
                  <div style={{
                    fontFamily: '"Persona Aura", system-ui, sans-serif',
                    fontSize: '20px',
                    fontWeight: '700',
                    color: 'rgb(28, 28, 28)'
                  }}>
                    {comic.value}
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  backgroundColor: comic.trend === 'up' ? 'rgb(34, 197, 94)' : 'rgb(214, 40, 40)',
                  color: 'white',
                  fontFamily: '"Persona Aura", system-ui, sans-serif',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {comic.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {comic.change}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* News Section */}
        <div style={{
          background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
          border: '3px solid rgb(28, 28, 28)',
          boxShadow: '6px 6px 0px rgb(28, 28, 28)',
          padding: '24px'
        }}>
          <h2 style={{
            fontFamily: '"Super Squad", Impact, sans-serif',
            fontSize: '24px',
            textTransform: 'uppercase',
            color: 'rgb(28, 28, 28)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Newspaper size={24} color="rgb(59, 130, 246)" />
            Latest News
          </h2>

          {news.map((item) => (
            <div key={item.id} style={{
              padding: '16px',
              borderBottom: '1px solid rgba(28, 28, 28, 0.1)',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(247, 181, 56, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <h3 style={{
                  fontFamily: '"Super Squad", Impact, sans-serif',
                  fontSize: '16px',
                  color: 'rgb(28, 28, 28)',
                  margin: 0
                }}>
                  {item.title}
                </h3>
                <span style={{
                  padding: '2px 8px',
                  backgroundColor: 'rgb(214, 40, 40)',
                  color: 'white',
                  fontFamily: '"Persona Aura", system-ui, sans-serif',
                  fontSize: '10px',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  {item.category}
                </span>
              </div>
              <span style={{
                fontFamily: '"Persona Aura", system-ui, sans-serif',
                fontSize: '12px',
                color: 'rgb(107, 114, 128)'
              }}>
                {item.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Collection Page
  const CollectionPage = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [currentPageNum, setCurrentPageNum] = useState(1);

    const comics = [
      { id: 1, title: 'Amazing Spider-Man', issue: '#1', publisher: 'Marvel', year: '1963', condition: 'VF', value: '£850' },
      { id: 2, title: 'Batman', issue: '#497', publisher: 'DC', year: '1993', condition: 'NM', value: '£320' },
      { id: 3, title: 'X-Men', issue: '#94', publisher: 'Marvel', year: '1975', condition: 'FN', value: '£1,250' },
      { id: 4, title: 'Superman', issue: '#75', publisher: 'DC', year: '1993', condition: 'NM', value: '£180' },
      { id: 5, title: 'Spawn', issue: '#1', publisher: 'Image', year: '1992', condition: 'NM+', value: '£95' },
      { id: 6, title: 'The Walking Dead', issue: '#1', publisher: 'Image', year: '2003', condition: 'VF+', value: '£450' }
    ];

    return (
      <div style={{ padding: '32px 16px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: '"Super Squad", Impact, sans-serif',
            fontSize: '36px',
            textTransform: 'uppercase',
            color: 'rgb(28, 28, 28)',
            margin: '0 0 8px 0'
          }}>
            My Collection
          </h1>
          <p style={{
            fontFamily: '"Persona Aura", system-ui, sans-serif',
            fontSize: '16px',
            color: 'rgb(107, 114, 128)'
          }}>
            {comics.length} comics • Total value: £3,095
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div style={{
          background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
          border: '3px solid rgb(28, 28, 28)',
          boxShadow: '6px 6px 0px rgb(28, 28, 28)',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search your collection..."
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  background: 'white',
                  border: '2px solid rgb(28, 28, 28)',
                  boxShadow: '2px 2px 0px rgb(28, 28, 28)',
                  fontFamily: '"Persona Aura", system-ui, sans-serif',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <Search size={20} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgb(107, 114, 128)'
              }} />
            </div>

            {/* Quick Filters */}
            <button style={{
              padding: '10px 16px',
              background: 'linear-gradient(135deg, rgb(247, 181, 56), rgb(245, 158, 11))',
              color: 'rgb(28, 28, 28)',
              border: '2px solid rgb(28, 28, 28)',
              boxShadow: '2px 2px 0px rgb(28, 28, 28)',
              fontFamily: '"Persona Aura", system-ui, sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Filter size={16} />
              Filters
            </button>

            {/* View Toggle */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '8px',
                  backgroundColor: viewMode === 'grid' ? 'rgb(59, 130, 246)' : 'white',
                  color: viewMode === 'grid' ? 'white' : 'rgb(28, 28, 28)',
                  border: '2px solid rgb(28, 28, 28)',
                  boxShadow: '2px 2px 0px rgb(28, 28, 28)',
                  cursor: 'pointer'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="0" y="0" width="6" height="6"/>
                  <rect x="10" y="0" width="6" height="6"/>
                  <rect x="0" y="10" width="6" height="6"/>
                  <rect x="10" y="10" width="6" height="6"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '8px',
                  backgroundColor: viewMode === 'list' ? 'rgb(59, 130, 246)' : 'white',
                  color: viewMode === 'list' ? 'white' : 'rgb(28, 28, 28)',
                  border: '2px solid rgb(28, 28, 28)',
                  boxShadow: '2px 2px 0px rgb(28, 28, 28)',
                  cursor: 'pointer'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="0" y="2" width="16" height="2"/>
                  <rect x="0" y="7" width="16" height="2"/>
                  <rect x="0" y="12" width="16" height="2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Comics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {comics.map((comic) => (
            <div key={comic.id} style={{
              backgroundColor: 'white',
              border: '3px solid rgb(28, 28, 28)',
              boxShadow: '4px 4px 0px rgb(28, 28, 28)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-2px, -2px)';
              e.currentTarget.style.boxShadow = '6px 6px 0px rgb(28, 28, 28)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '4px 4px 0px rgb(28, 28, 28)';
            }}>
              {/* Comic Cover */}
              <div style={{
                height: viewMode === 'grid' ? '200px' : '100px',
                backgroundColor: 'rgb(229, 231, 235)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '2px solid rgb(28, 28, 28)',
                fontFamily: '"Super Squad", Impact, sans-serif',
                fontSize: '18px',
                color: 'rgb(107, 114, 128)'
              }}>
                {comic.title}
              </div>

              {/* Comic Info */}
              <div style={{ padding: '16px' }}>
                <h3 style={{
                  fontFamily: '"Super Squad", Impact, sans-serif',
                  fontSize: '18px',
                  color: 'rgb(28, 28, 28)',
                  margin: '0 0 8px 0'
                }}>
                  {comic.title} {comic.issue}
                </h3>
                
                <div style={{
                  fontFamily: '"Persona Aura", system-ui, sans-serif',
                  fontSize: '14px',
                  color: 'rgb(107, 114, 128)',
                  marginBottom: '12px'
                }}>
                  {comic.publisher} • {comic.year}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 8px',
                    backgroundColor: 'rgb(34, 197, 94)',
                    color: 'white',
                    fontFamily: '"Persona Aura", system-ui, sans-serif',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {comic.condition}
                  </span>
                  <span style={{
                    fontFamily: '"Super Squad", Impact, sans-serif',
                    fontSize: '20px',
                    color: 'rgb(214, 40, 40)'
                  }}>
                    {comic.value}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px'
        }}>
          <button style={{
            padding: '8px 12px',
            backgroundColor: 'rgb(107, 114, 128)',
            color: 'white',
            border: '2px solid rgb(28, 28, 28)',
            boxShadow: '2px 2px 0px rgb(28, 28, 28)',
            fontFamily: '"Persona Aura", system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ChevronLeft size={16} />
            PREV
          </button>

          {[1, 2, 3, 4, 5].map((page) => (
            <button key={page} style={{
              minWidth: '40px',
              padding: '8px',
              backgroundColor: page === currentPageNum ? 'rgb(214, 40, 40)' : 'white',
              color: page === currentPageNum ? 'white' : 'rgb(28, 28, 28)',
              border: '2px solid rgb(28, 28, 28)',
              boxShadow: page === currentPageNum ? '3px 3px 0px rgb(28, 28, 28)' : '2px 2px 0px rgb(28, 28, 28)',
              fontFamily: '"Persona Aura", system-ui, sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              {page}
            </button>
          ))}

          <button style={{
            padding: '8px 12px',
            backgroundColor: 'rgb(107, 114, 128)',
            color: 'white',
            border: '2px solid rgb(28, 28, 28)',
            boxShadow: '2px 2px 0px rgb(28, 28, 28)',
            fontFamily: '"Persona Aura", system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            NEXT
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  // Comic Detail Page
  const ComicDetailPage = () => {
    return (
      <div style={{ padding: '32px 16px', maxWidth: '1400px', margin: '0 auto' }}>
        <button
          onClick={() => setCurrentPage('collection')}
          style={{
            marginBottom: '24px',
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'rgb(59, 130, 246)',
            fontFamily: '"Persona Aura", system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <ChevronLeft size={16} />
          Back to Collection
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
          {/* Left Column - Cover Image */}
          <div>
            <div style={{
              backgroundColor: 'rgb(229, 231, 235)',
              border: '3px solid rgb(28, 28, 28)',
              boxShadow: '6px 6px 0px rgb(28, 28, 28)',
              height: '500px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              fontFamily: '"Super Squad", Impact, sans-serif',
              fontSize: '24px',
              color: 'rgb(107, 114, 128)'
            }}>
              Comic Cover
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button style={{
                padding: '12px',
                background: 'linear-gradient(135deg, rgb(247, 181, 56), rgb(245, 158, 11))',
                color: 'rgb(28, 28, 28)',
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                fontFamily: '"Persona Aura", system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <Star size={16} />
                Wishlist
              </button>
              <button style={{
                padding: '12px',
                background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
                color: 'white',
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                fontFamily: '"Persona Aura", system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <Bell size={16} />
                Set Alert
              </button>
            </div>
          </div>

          {/* Right Column - Details */}
          <div>
            <h1 style={{
              fontFamily: '"Super Squad", Impact, sans-serif',
              fontSize: '42px',
              textTransform: 'uppercase',
              color: 'rgb(28, 28, 28)',
              margin: '0 0 16px 0'
            }}>
              Amazing Spider-Man #1
            </h1>

            {/* Value Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
              <div style={{
                padding: '16px',
                background: 'linear-gradient(to bottom, rgb(240, 253, 244), rgb(220, 252, 231))',
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                textAlign: 'center'
              }}>
                <div style={{
                  fontFamily: '"Persona Aura", system-ui, sans-serif',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  color: 'rgb(107, 114, 128)',
                  marginBottom: '4px'
                }}>
                  Market Value
                </div>
                <div style={{
                  fontFamily: '"Super Squad", Impact, sans-serif',
                  fontSize: '24px',
                  color: 'rgb(34, 197, 94)'
                }}>
                  £850
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: 'linear-gradient(to bottom, rgb(240, 249, 255), rgb(224, 242, 254))',
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                textAlign: 'center'
              }}>
                <div style={{
                  fontFamily: '"Persona Aura", system-ui, sans-serif',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  color: 'rgb(107, 114, 128)',
                  marginBottom: '4px'
                }}>
                  Published
                </div>
                <div style={{
                  fontFamily: '"Super Squad", Impact, sans-serif',
                  fontSize: '18px',
                  color: 'rgb(59, 130, 246)'
                }}>
                  March 1963
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: 'linear-gradient(to bottom, rgb(254, 249, 195), rgb(254, 240, 138))',
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                textAlign: 'center'
              }}>
                <div style={{
                  fontFamily: '"Persona Aura", system-ui, sans-serif',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  color: 'rgb(107, 114, 128)',
                  marginBottom: '4px'
                }}>
                  Condition
                </div>
                <div style={{
                  fontFamily: '"Super Squad", Impact, sans-serif',
                  fontSize: '18px',
                  color: 'rgb(245, 158, 11)'
                }}>
                  VF 8.0
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{
              background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
              border: '3px solid rgb(28, 28, 28)',
              boxShadow: '4px 4px 0px rgb(28, 28, 28)',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontFamily: '"Super Squad", Impact, sans-serif',
                fontSize: '20px',
                textTransform: 'uppercase',
                color: 'rgb(28, 28, 28)',
                marginBottom: '12px'
              }}>
                Description
              </h3>
              <p style={{
                fontFamily: '"Persona Aura", system-ui, sans-serif',
                fontSize: '14px',
                lineHeight: '1.6',
                color: 'rgb(75, 85, 99)'
              }}>
                The first appearance of Spider-Man! Follow Peter Parker as he gains his amazing spider powers 
                and learns that with great power comes great responsibility. This key issue marks the beginning 
                of Marvel's most iconic superhero. Created by Stan Lee and Steve Ditko, this comic launched 
                one of the most successful franchises in comic book history.
              </p>
            </div>

            {/* Details Table */}
            <div style={{
              border: '3px solid rgb(28, 28, 28)',
              boxShadow: '4px 4px 0px rgb(28, 28, 28)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '12px 16px',
                backgroundColor: 'rgb(0, 48, 73)',
                color: 'rgb(253, 246, 227)',
                fontFamily: '"Super Squad", Impact, sans-serif',
                fontSize: '16px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Issue Details
              </div>
              {[
                { label: 'Publisher', value: 'Marvel Comics' },
                { label: 'Writer', value: 'Stan Lee' },
                { label: 'Artist', value: 'Steve Ditko' },
                { label: 'Cover Artist', value: 'Jack Kirby' },
                { label: 'Pages', value: '36' },
                { label: 'Key Issue', value: 'Yes - First Appearance of Spider-Man' }
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: index < 5 ? '1px solid rgba(28, 28, 28, 0.1)' : 'none',
                  backgroundColor: index % 2 === 0 ? 'rgba(247, 181, 56, 0.05)' : 'white'
                }}>
                  <span style={{
                    fontFamily: '"Persona Aura", system-ui, sans-serif',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'rgb(107, 114, 128)'
                  }}>
                    {item.label}:
                  </span>
                  <span style={{
                    fontFamily: '"Persona Aura", system-ui, sans-serif',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'rgb(28, 28, 28)'
                  }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Alerts Page
  const AlertsPage = () => {
    const alerts = [
      { id: 1, comic: 'Amazing Spider-Man #1', type: 'Price Drop', threshold: '£800', status: 'Active', lastTriggered: 'Yesterday' },
      { id: 2, comic: 'Batman #497', type: 'Price Increase', threshold: '£400', status: 'Active', lastTriggered: 'Never' },
      { id: 3, comic: 'X-Men #94', type: 'New Listing', threshold: 'Any', status: 'Triggered', lastTriggered: 'Today' },
      { id: 4, comic: 'Superman #75', type: 'Price Drop', threshold: '£150', status: 'Active', lastTriggered: '3 days ago' }
    ];

    return (
      <div style={{ padding: '32px 16px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              fontFamily: '"Super Squad", Impact, sans-serif',
              fontSize: '36px',
              textTransform: 'uppercase',
              color: 'rgb(28, 28, 28)',
              margin: '0 0 8px 0'
            }}>
              Price Alerts
            </h1>
            <p style={{
              fontFamily: '"Persona Aura", system-ui, sans-serif',
              fontSize: '16px',
              color: 'rgb(107, 114, 128)'
            }}>
              Track price changes and new listings for your favorite comics
            </p>
          </div>

          <button style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
            color: 'white',
            border: '3px solid rgb(28, 28, 28)',
            boxShadow: '3px 3px 0px rgb(28, 28, 28)',
            fontFamily: '"Persona Aura", system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Plus size={16} />
            New Alert
          </button>
        </div>

        {/* Alerts Table */}
        <div style={{
          backgroundColor: 'white',
          border: '3px solid rgb(28, 28, 28)',
          boxShadow: '6px 6px 0px rgb(28, 28, 28)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgb(0, 48, 73)' }}>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontFamily: '"Super Squad", Impact, sans-serif',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  color: 'rgb(253, 246, 227)',
                  borderBottom: '2px solid rgb(28, 28, 28)'
                }}>
                  Comic
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontFamily: '"Super Squad", Impact, sans-serif',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  color: 'rgb(253, 246, 227)',
                  borderBottom: '2px solid rgb(28, 28, 28)'
                }}>
                  Alert Type
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontFamily: '"Super Squad", Impact, sans-serif',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  color: 'rgb(253, 246, 227)',
                  borderBottom: '2px solid rgb(28, 28, 28)'
                }}>
                  Threshold
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontFamily: '"Super Squad", Impact, sans-serif',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  color: 'rgb(253, 246, 227)',
                  borderBottom: '2px solid rgb(28, 28, 28)'
                }}>
                  Status
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontFamily: '"Super Squad", Impact, sans-serif',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  color: 'rgb(253, 246, 227)',
                  borderBottom: '2px solid rgb(28, 28, 28)'
                }}>
                  Last Triggered
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'center',
                  fontFamily: '"Super Squad", Impact, sans-serif',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  color: 'rgb(253, 246, 227)',
                  borderBottom: '2px solid rgb(28, 28, 28)'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, index) => (
                <tr key={alert.id} style={{
                  backgroundColor: index % 2 === 0 ? 'white' : 'rgba(247, 181, 56, 0.05)',
                  borderBottom: '1px solid rgba(28, 28, 28, 0.1)'
                }}>
                  <td style={{
                    padding: '16px',
                    fontFamily: '"Persona Aura", system-ui, sans-serif',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'rgb(28, 28, 28)'
                  }}>
                    {alert.comic}
                  </td>
                  <td style={{
                    padding: '16px',
                    fontFamily: '"Persona Aura", system-ui, sans-serif',
                    fontSize: '14px',
                    color: 'rgb(75, 85, 99)'
                  }}>
                    {alert.type}
                  </td>
                  <td style={{
                    padding: '16px',
                    fontFamily: '"Persona Aura", system-ui, sans-serif',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'rgb(28, 28, 28)'
                  }}>
                    {alert.threshold}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: alert.status === 'Active' ? 'rgb(34, 197, 94)' : 
                                      alert.status === 'Triggered' ? 'rgb(214, 40, 40)' : 'rgb(107, 114, 128)',
                      color: 'white',
                      fontFamily: '"Persona Aura", system-ui, sans-serif',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {alert.status}
                    </span>
                  </td>
                  <td style={{
                    padding: '16px',
                    fontFamily: '"Persona Aura", system-ui, sans-serif',
                    fontSize: '14px',
                    color: 'rgb(107, 114, 128)'
                  }}>
                    {alert.lastTriggered}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button style={{
                      padding: '6px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      marginRight: '8px'
                    }}>
                      <Edit size={16} color="rgb(59, 130, 246)" />
                    </button>
                    <button style={{
                      padding: '6px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}>
                      <Trash2 size={16} color="rgb(214, 40, 40)" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Account Hub Page
  const AccountHubPage = () => {
    const hubOptions = [
      { 
        title: 'My Collection', 
        icon: Package, 
        color: 'rgb(59, 130, 246)',
        description: 'View and manage your comic collection',
        count: '156 comics',
        action: () => setCurrentPage('collection')
      },
      { 
        title: 'Price Alerts', 
        icon: Bell, 
        color: 'rgb(247, 181, 56)',
        description: 'Set up and manage price notifications',
        count: '8 active alerts',
        action: () => setCurrentPage('alerts')
      },
      { 
        title: 'My Wishlist', 
        icon: Heart, 
        color: 'rgb(214, 40, 40)',
        description: 'Comics you want to add to your collection',
        count: '23 items',
        action: () => {}
      },
      { 
        title: 'Account Settings', 
        icon: Settings, 
        color: 'rgb(107, 114, 128)',
        description: 'Manage your profile and preferences',
        count: 'Pro Member',
        action: () => {}
      }
    ];

    return (
      <div style={{ padding: '32px 16px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontFamily: '"Super Squad", Impact, sans-serif',
            fontSize: '42px',
            textTransform: 'uppercase',
            color: 'rgb(28, 28, 28)',
            margin: '0 0 16px 0'
          }}>
            Account Hub
          </h1>
          <p style={{
            fontFamily: '"Persona Aura", system-ui, sans-serif',
            fontSize: '16px',
            color: 'rgb(107, 114, 128)'
          }}>
            Manage your collection, alerts, and settings from one place
          </p>
        </div>

        {/* Hub Options Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {hubOptions.map((option, index) => (
            <button
              key={index}
              onClick={option.action}
              style={{
                background: 'linear-gradient(to bottom, white, rgb(250, 250, 250))',
                border: '3px solid rgb(28, 28, 28)',
                boxShadow: '6px 6px 0px rgb(28, 28, 28)',
                padding: '32px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-3px, -3px)';
                e.currentTarget.style.boxShadow = '9px 9px 0px rgb(28, 28, 28)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '6px 6px 0px rgb(28, 28, 28)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: option.color,
                  border: '3px solid rgb(28, 28, 28)',
                  boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <option.icon size={28} color="white" />
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontFamily: '"Super Squad", Impact, sans-serif',
                    fontSize: '22px',
                    textTransform: 'uppercase',
                    color: 'rgb(28, 28, 28)',
                    margin: '0 0 8px 0'
                  }}>
                    {option.title}
                  </h3>
                  <p style={{
                    fontFamily: '"Persona Aura", system-ui, sans-serif',
                    fontSize: '14px',
                    color: 'rgb(107, 114, 128)',
                    margin: '0 0 12px 0'
                  }}>
                    {option.description}
                  </p>
                  <span style={{
                    padding: '4px 12px',
                    backgroundColor: option.color,
                    color: 'white',
                    fontFamily: '"Persona Aura", system-ui, sans-serif',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {option.count}
                  </span>
                </div>
              </div>

              {/* Decorative corner */}
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '0',
                height: '0',
                borderLeft: '20px solid transparent',
                borderTop: `20px solid ${option.color}`,
                opacity: 0.3
              }} />
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        <div style={{
          marginTop: '48px',
          padding: '24px',
          background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
          border: '3px solid rgb(28, 28, 28)',
          boxShadow: '6px 6px 0px rgb(28, 28, 28)'
        }}>
          <h3 style={{
            fontFamily: '"Super Squad", Impact, sans-serif',
            fontSize: '20px',
            textTransform: 'uppercase',
            color: 'rgb(28, 28, 28)',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Your Collection Stats
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Total Value', value: '£12,450', change: '+8.3%' },
              { label: 'Comics Owned', value: '156', change: '+5 this month' },
              { label: 'Avg. Comic Value', value: '£79.80', change: '+12%' },
              { label: 'Member Since', value: 'Jan 2023', change: 'Pro Member' }
            ].map((stat, index) => (
              <div key={index} style={{
                textAlign: 'center',
                padding: '16px',
                backgroundColor: 'white',
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: '2px 2px 0px rgb(28, 28, 28)'
              }}>
                <div style={{
                  fontFamily: '"Persona Aura", system-ui, sans-serif',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  color: 'rgb(107, 114, 128)',
                  marginBottom: '4px'
                }}>
                  {stat.label}
                </div>
                <div style={{
                  fontFamily: '"Super Squad", Impact, sans-serif',
                  fontSize: '24px',
                  color: 'rgb(28, 28, 28)',
                  marginBottom: '4px'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: '"Persona Aura", system-ui, sans-serif',
                  fontSize: '11px',
                  color: 'rgb(34, 197, 94)'
                }}>
                  {stat.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render current page
  const renderPage = () => {
    switch(currentPage) {
      case 'home': return <HomePage />;
      case 'collection': return <CollectionPage />;
      case 'detail': return <ComicDetailPage />;
      case 'alerts': return <AlertsPage />;
      case 'account': return <AccountHubPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'rgb(253, 246, 227)',
      fontFamily: '"Persona Aura", system-ui, sans-serif'
    }}>
      <Navbar />
      {renderPage()}
      
      {/* Footer */}
      <footer style={{
        marginTop: '64px',
        padding: '32px',
        backgroundColor: 'rgb(0, 48, 73)',
        borderTop: '3px solid rgb(28, 28, 28)',
        textAlign: 'center'
      }}>
        <p style={{
          fontFamily: '"Persona Aura", system-ui, sans-serif',
          fontSize: '14px',
          color: 'rgb(253, 246, 227)',
          opacity: 0.7
        }}>
          © 2025 ComicScoutUK. Your comic collection, organized.
        </p>
      </footer>
    </div>
  );
};

export default ComicScoutUKApp;