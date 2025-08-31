import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  Star,
  Hash,
  Clock,
  SortAsc,
  SortDesc,
  Filter,
  LayoutGrid,
  List
} from 'lucide-react';

const SortingControlsShowcase = () => {
  const [currentSection, setCurrentSection] = useState('dropdown');
  const [selectedSort, setSelectedSort] = useState('relevance');
  const [sortDirection, setSortDirection] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');

  // Sort Dropdown Component
  const SortDropdown = ({ variant = 'default' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState({ value: 'relevance', label: 'Most Relevant', icon: Star });

    const sortOptions = [
      { value: 'relevance', label: 'Most Relevant', icon: Star, color: 'rgb(247, 181, 56)' },
      { value: 'price-low', label: 'Price: Low to High', icon: TrendingUp, color: 'rgb(34, 197, 94)' },
      { value: 'price-high', label: 'Price: High to Low', icon: TrendingDown, color: 'rgb(214, 40, 40)' },
      { value: 'newest', label: 'Newest First', icon: Calendar, color: 'rgb(59, 130, 246)' },
      { value: 'oldest', label: 'Oldest First', icon: Clock, color: 'rgb(107, 114, 128)' },
      { value: 'title-asc', label: 'Title: A to Z', icon: SortAsc, color: 'rgb(147, 51, 234)' },
      { value: 'title-desc', label: 'Title: Z to A', icon: SortDesc, color: 'rgb(147, 51, 234)' },
      { value: 'issue', label: 'Issue Number', icon: Hash, color: 'rgb(249, 115, 22)' }
    ];

    const handleSelect = (option) => {
      setSelected(option);
      setIsOpen(false);
    };

    return (
      <div style={{ position: 'relative', minWidth: '250px' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: isOpen 
              ? 'linear-gradient(to bottom, rgb(255, 252, 240), rgb(253, 246, 227))'
              : 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
            border: '3px solid rgb(28, 28, 28)',
            boxShadow: isOpen ? '6px 6px 0px rgb(28, 28, 28)' : '3px 3px 0px rgb(28, 28, 28)',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            color: 'rgb(28, 28, 28)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            transition: 'all 0.2s ease',
            transform: isOpen ? 'translate(-2px, -2px)' : 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpDown size={16} style={{ color: 'rgb(107, 114, 128)' }} />
            <span>Sort By:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {selected.icon && <selected.icon size={14} style={{ color: selected.color }} />}
              <span style={{ fontWeight: '700', color: selected.color }}>{selected.label}</span>
            </div>
          </div>
          <ArrowDown 
            size={14} 
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s ease'
            }}
          />
        </button>

        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
            border: '3px solid rgb(28, 28, 28)',
            boxShadow: '6px 6px 0px rgb(28, 28, 28)',
            zIndex: 50,
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {sortOptions.map((option, index) => {
              const Icon = option.icon;
              const isSelected = selected.value === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: isSelected 
                      ? `linear-gradient(to right, ${option.color}22, transparent)`
                      : 'transparent',
                    border: 'none',
                    borderBottom: index < sortOptions.length - 1 ? '1px solid rgba(28, 28, 28, 0.1)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '14px',
                    color: 'rgb(28, 28, 28)',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.target.style.background = `linear-gradient(to right, ${option.color}15, transparent)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={16} style={{ color: option.color }} />
                    <span style={{ fontWeight: isSelected ? '600' : '400' }}>{option.label}</span>
                  </div>
                  {isSelected && (
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: option.color
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Sort Toggle Buttons - FIXED CONTRAST
  const SortToggleGroup = () => {
    const [active, setActive] = useState('price-low');

    const options = [
      { value: 'price-low', label: 'Price ↑', color: 'rgb(34, 197, 94)' },
      { value: 'price-high', label: 'Price ↓', color: 'rgb(214, 40, 40)' },
      { value: 'newest', label: 'Newest', color: 'rgb(59, 130, 246)' },
      { value: 'popular', label: 'Popular', color: 'rgb(247, 181, 56)' }
    ];

    return (
      <div style={{
        display: 'inline-flex',
        border: '3px solid rgb(28, 28, 28)',
        boxShadow: '3px 3px 0px rgb(28, 28, 28)',
        overflow: 'hidden',
        backgroundColor: 'rgb(255, 255, 255)'
      }}>
        {options.map((option, index) => (
          <button
            key={option.value}
            onClick={() => setActive(option.value)}
            style={{
              padding: '10px 16px',
              background: active === option.value
                ? `linear-gradient(135deg, ${option.color}, ${option.color}dd)`
                : 'linear-gradient(to bottom, rgb(245, 245, 245), rgb(230, 230, 230))',
              color: active === option.value ? 'rgb(255, 255, 255)' : 'rgb(28, 28, 28)',
              border: 'none',
              borderRight: index < options.length - 1 ? '2px solid rgb(28, 28, 28)' : 'none',
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
              boxShadow: active === option.value 
                ? 'inset 0 2px 4px rgba(0, 0, 0, 0.2)' 
                : 'inset 0 -2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (active !== option.value) {
                e.currentTarget.style.background = 'linear-gradient(to bottom, rgb(210, 210, 210), rgb(190, 190, 190))';
              }
            }}
            onMouseLeave={(e) => {
              if (active !== option.value) {
                e.currentTarget.style.background = 'linear-gradient(to bottom, rgb(245, 245, 245), rgb(230, 230, 230))';
              }
            }}
          >
            {option.label}
            {active === option.value && (
              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                height: '3px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)'
              }} />
            )}
          </button>
        ))}
      </div>
    );
  };

  // Sort Direction Toggle - ENHANCED WITH CONTRAST
  const SortDirectionToggle = () => {
    const [direction, setDirection] = useState('asc');

    return (
      <button
        onClick={() => setDirection(direction === 'asc' ? 'desc' : 'asc')}
        style={{
          padding: '10px 16px',
          background: direction === 'asc'
            ? 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))'
            : 'linear-gradient(135deg, rgb(214, 40, 40), rgb(185, 28, 28))',
          border: '3px solid rgb(28, 28, 28)',
          boxShadow: '3px 3px 0px rgb(28, 28, 28)',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: '600',
          color: 'rgb(255, 255, 255)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translate(-1px, -1px)';
          e.currentTarget.style.boxShadow = '4px 4px 0px rgb(28, 28, 28)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '3px 3px 0px rgb(28, 28, 28)';
        }}
      >
        {direction === 'asc' ? (
          <>
            <ArrowUp size={16} style={{ color: 'rgb(255, 255, 255)' }} />
            <span>Ascending</span>
          </>
        ) : (
          <>
            <ArrowDown size={16} style={{ color: 'rgb(255, 255, 255)' }} />
            <span>Descending</span>
          </>
        )}
      </button>
    );
  };

  // Combined Sort Bar
  const SortBar = () => {
    const [sortBy, setSortBy] = useState('relevance');
    const [direction, setDirection] = useState('asc');
    const [view, setView] = useState('grid');

    const sortOptions = [
      { value: 'relevance', label: 'Relevance' },
      { value: 'price', label: 'Price' },
      { value: 'date', label: 'Date Added' },
      { value: 'title', label: 'Title' }
    ];

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
        border: '3px solid rgb(28, 28, 28)',
        boxShadow: '6px 6px 0px rgb(28, 28, 28)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Left Side - Sort Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'rgb(107, 114, 128)'
          }}>
            Sort By:
          </span>

          {/* Sort Options */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                style={{
                  padding: '8px 14px',
                  background: sortBy === option.value
                    ? 'linear-gradient(135deg, rgb(247, 181, 56), rgb(245, 158, 11))'
                    : 'rgb(253, 246, 227)',
                  color: sortBy === option.value ? 'rgb(28, 28, 28)' : 'rgb(107, 114, 128)',
                  border: '2px solid rgb(28, 28, 28)',
                  boxShadow: sortBy === option.value ? '3px 3px 0px rgb(28, 28, 28)' : '2px 2px 0px rgb(28, 28, 28)',
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: sortBy === option.value ? 'translate(-1px, -1px)' : 'none'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Direction Toggle */}
          <button
            onClick={() => setDirection(direction === 'asc' ? 'desc' : 'asc')}
            style={{
              padding: '8px',
              background: 'rgb(253, 246, 227)',
              border: '2px solid rgb(28, 28, 28)',
              boxShadow: '2px 2px 0px rgb(28, 28, 28)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title={direction === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
          >
            {direction === 'asc' ? (
              <ArrowUp size={18} style={{ color: 'rgb(34, 197, 94)' }} />
            ) : (
              <ArrowDown size={18} style={{ color: 'rgb(214, 40, 40)' }} />
            )}
          </button>
        </div>

        {/* Right Side - View Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'rgb(107, 114, 128)',
            marginRight: '4px'
          }}>
            View:
          </span>
          <button
            onClick={() => setView('grid')}
            style={{
              padding: '8px',
              background: view === 'grid'
                ? 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))'
                : 'rgb(253, 246, 227)',
              color: view === 'grid' ? 'rgb(255, 255, 255)' : 'rgb(28, 28, 28)',
              border: '2px solid rgb(28, 28, 28)',
              boxShadow: view === 'grid' ? '3px 3px 0px rgb(28, 28, 28)' : '2px 2px 0px rgb(28, 28, 28)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              transform: view === 'grid' ? 'translate(-1px, -1px)' : 'none'
            }}
            title="Grid View"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setView('list')}
            style={{
              padding: '8px',
              background: view === 'list'
                ? 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))'
                : 'rgb(253, 246, 227)',
              color: view === 'list' ? 'rgb(255, 255, 255)' : 'rgb(28, 28, 28)',
              border: '2px solid rgb(28, 28, 28)',
              boxShadow: view === 'list' ? '3px 3px 0px rgb(28, 28, 28)' : '2px 2px 0px rgb(28, 28, 28)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              transform: view === 'list' ? 'translate(-1px, -1px)' : 'none'
            }}
            title="List View"
          >
            <List size={18} />
          </button>
        </div>
      </div>
    );
  };

  // Mobile Sort Sheet
  const MobileSortSheet = ({ isOpen, onClose }) => {
    const [selected, setSelected] = useState('relevance');

    const sortOptions = [
      { value: 'relevance', label: 'Most Relevant', icon: Star },
      { value: 'price-low', label: 'Price: Low to High', icon: TrendingUp },
      { value: 'price-high', label: 'Price: High to Low', icon: TrendingDown },
      { value: 'newest', label: 'Newest First', icon: Calendar },
      { value: 'oldest', label: 'Oldest First', icon: Clock }
    ];

    if (!isOpen) return null;

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end'
      }}>
        <div style={{
          width: '100%',
          background: 'rgb(253, 246, 227)',
          borderTop: '3px solid rgb(28, 28, 28)',
          boxShadow: '0 -6px 0px rgb(28, 28, 28)',
          borderRadius: '0',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px',
            borderBottom: '2px solid rgb(28, 28, 28)',
            background: 'linear-gradient(to right, rgba(247, 181, 56, 0.2), transparent)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '18px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: 0
            }}>
              Sort Options
            </h3>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                background: 'rgb(214, 40, 40)',
                color: 'rgb(255, 255, 255)',
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: '2px 2px 0px rgb(28, 28, 28)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>

          {/* Options */}
          <div style={{ padding: '8px' }}>
            {sortOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selected === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelected(option.value);
                    setTimeout(onClose, 200);
                  }}
                  style={{
                    width: '100%',
                    padding: '16px',
                    margin: '8px 0',
                    background: isSelected
                      ? 'linear-gradient(135deg, rgb(247, 181, 56), rgb(245, 158, 11))'
                      : 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
                    color: isSelected ? 'rgb(28, 28, 28)' : 'rgb(28, 28, 28)',
                    border: '3px solid rgb(28, 28, 28)',
                    boxShadow: isSelected ? '4px 4px 0px rgb(28, 28, 28)' : '3px 3px 0px rgb(28, 28, 28)',
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '16px',
                    fontWeight: isSelected ? '600' : '400',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                    transform: isSelected ? 'translate(-1px, -1px)' : 'none'
                  }}
                >
                  <Icon size={20} />
                  <span>{option.label}</span>
                  {isSelected && (
                    <div style={{
                      marginLeft: 'auto',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'rgb(28, 28, 28)'
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const sections = [
    { id: 'dropdown', label: 'Sort Dropdown' },
    { id: 'toggle', label: 'Toggle Buttons' },
    { id: 'combined', label: 'Sort Bar' },
    { id: 'mobile', label: 'Mobile Sheet' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'rgb(253, 246, 227)',
      fontFamily: 'system-ui, sans-serif',
      padding: '32px 16px'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{
          fontFamily: 'Impact, "Arial Black", sans-serif',
          fontSize: '48px',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          color: 'rgb(214, 40, 40)',
          margin: '0 0 16px 0',
          textShadow: '3px 3px 0px rgb(28, 28, 28)'
        }}>
          Sorting Controls
        </h1>
        <p style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '18px',
          color: 'rgb(28, 28, 28)',
          opacity: 0.7,
          margin: 0
        }}>
          Sort options, direction toggles, and view selectors
        </p>
      </div>

      {/* Section Navigation */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setCurrentSection(section.id)}
              style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                border: '3px solid rgb(28, 28, 28)',
                padding: '8px 16px',
                cursor: 'pointer',
                backgroundColor: currentSection === section.id ? 'rgb(214, 40, 40)' : 'rgb(253, 246, 227)',
                color: currentSection === section.id ? 'rgb(253, 246, 227)' : 'rgb(28, 28, 28)',
                boxShadow: currentSection === section.id ? '6px 6px 0px rgb(28, 28, 28)' : '3px 3px 0px rgb(28, 28, 28)',
                transform: currentSection === section.id ? 'translate(-2px, -2px)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Sort Dropdown */}
        {currentSection === 'dropdown' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
            <div>
              <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Full Sort Dropdown</h3>
              <SortDropdown />
            </div>

            <div style={{
              padding: '24px',
              background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
              border: '3px solid rgb(28, 28, 28)',
              boxShadow: '6px 6px 0px rgb(28, 28, 28)',
              maxWidth: '600px',
              width: '100%'
            }}>
              <h4 style={{ marginBottom: '16px' }}>Features:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Color-coded sort options with icons</li>
                <li>Shows current selection prominently</li>
                <li>Smooth dropdown animation</li>
                <li>Visual indicators for selected state</li>
                <li>Hover effects on options</li>
              </ul>
            </div>
          </div>
        )}

        {/* Toggle Buttons */}
        {currentSection === 'toggle' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
            <div>
              <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Sort Toggle Group</h3>
              <SortToggleGroup />
            </div>

            <div>
              <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Direction Toggle</h3>
              <SortDirectionToggle />
            </div>

            <div style={{
              padding: '24px',
              background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
              border: '3px solid rgb(28, 28, 28)',
              boxShadow: '6px 6px 0px rgb(28, 28, 28)',
              maxWidth: '600px',
              width: '100%'
            }}>
              <h4 style={{ marginBottom: '16px' }}>Usage:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Toggle groups for quick sort switching</li>
                <li>Separate direction control</li>
                <li>Color indicators for sort type</li>
                <li>Active state highlighting</li>
              </ul>
            </div>
          </div>
        )}

        {/* Combined Sort Bar */}
        {currentSection === 'combined' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Complete Sort Bar</h3>
              <SortBar />
            </div>

            <div style={{
              padding: '24px',
              background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
              border: '3px solid rgb(28, 28, 28)',
              boxShadow: '6px 6px 0px rgb(28, 28, 28)'
            }}>
              <h4 style={{ marginBottom: '16px' }}>Includes:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Sort option buttons</li>
                <li>Ascending/Descending toggle</li>
                <li>Grid/List view switcher</li>
                <li>Responsive layout</li>
                <li>All controls in one bar</li>
              </ul>
            </div>
          </div>
        )}

        {/* Mobile Sheet */}
        {currentSection === 'mobile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
            <button
              onClick={() => {
                const sheet = document.getElementById('mobile-sort-sheet');
                if (sheet) sheet.style.display = 'flex';
              }}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, rgb(214, 40, 40), rgb(185, 28, 28))',
                color: 'rgb(253, 246, 227)',
                border: '3px solid rgb(28, 28, 28)',
                boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'pointer'
              }}
            >
              Open Mobile Sort Sheet
            </button>

            <div style={{
              padding: '24px',
              background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
              border: '3px solid rgb(28, 28, 28)',
              boxShadow: '6px 6px 0px rgb(28, 28, 28)',
              maxWidth: '600px',
              width: '100%'
            }}>
              <h4 style={{ marginBottom: '16px' }}>Mobile Features:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Bottom sheet modal</li>
                <li>Touch-friendly buttons</li>
                <li>Large tap targets</li>
                <li>Auto-close on selection</li>
                <li>Overlay backdrop</li>
              </ul>
            </div>

            <div 
              id="mobile-sort-sheet"
              style={{ display: 'none' }}
            >
              <MobileSortSheet 
                isOpen={true} 
                onClose={() => {
                  const sheet = document.getElementById('mobile-sort-sheet');
                  if (sheet) sheet.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SortingControlsShowcase;