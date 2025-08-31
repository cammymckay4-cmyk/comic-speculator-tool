import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, Check, Calendar, DollarSign, Star, Tag, BookOpen, TrendingUp, Sparkles, Award, Clock } from 'lucide-react';

const SearchFilterShowcase = () => {
  const [currentSection, setCurrentSection] = useState('search');
  const [searchValue, setSearchValue] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({
    publisher: [],
    condition: [],
    priceRange: '',
    year: ''
  });

  // Search Bar Component - ENHANCED VERSION
  const SearchBar = ({ variant = 'default', size = 'lg', showFilters = true }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [localSearch, setLocalSearch] = useState('');

    const sizeConfigs = {
      sm: { padding: '8px 12px', fontSize: '14px', iconSize: 16 },
      md: { padding: '12px 16px', fontSize: '16px', iconSize: 20 },
      lg: { padding: '16px 20px', fontSize: '18px', iconSize: 24 }
    };

    const config = sizeConfigs[size];

    return (
      <div style={{ width: '100%' }}>
        <div style={{
          position: 'relative',
          width: '100%'
        }}>
          <input
            type="text"
            placeholder="Search comics, creators, publishers..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
              width: '100%',
              padding: config.padding,
              paddingLeft: `${config.iconSize + 24}px`,
              paddingRight: showFilters ? '120px' : `${config.iconSize + 24}px`,
              backgroundColor: 'rgb(253, 246, 227)',
              background: isFocused 
                ? 'linear-gradient(to bottom, rgb(255, 252, 240), rgb(253, 246, 227))'
                : 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
              border: '3px solid rgb(28, 28, 28)',
              boxShadow: isFocused ? '6px 6px 0px rgb(28, 28, 28)' : '3px 3px 0px rgb(28, 28, 28)',
              fontFamily: 'system-ui, sans-serif',
              fontSize: config.fontSize,
              fontWeight: '500',
              color: 'rgb(28, 28, 28)',
              outline: 'none',
              transition: 'all 0.2s ease',
              transform: isFocused ? 'translate(-2px, -2px)' : 'none'
            }}
          />
          
          <Search 
            size={config.iconSize}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgb(107, 114, 128)'
            }}
          />

          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              style={{
                position: 'absolute',
                right: showFilters ? '100px' : '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={config.iconSize} color="rgb(107, 114, 128)" />
            </button>
          )}

          {showFilters && (
            <button
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'linear-gradient(135deg, rgb(247, 181, 56), rgb(245, 158, 11))',
                color: 'rgb(28, 28, 28)',
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: '2px 2px 0px rgb(28, 28, 28)',
                padding: '6px 12px',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-1px, -1px)';
                e.currentTarget.style.boxShadow = '3px 3px 0px rgb(28, 28, 28)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '2px 2px 0px rgb(28, 28, 28)';
              }}
            >
              <Filter size={14} />
              Filters
            </button>
          )}
        </div>

        {/* Search Suggestions */}
        {isFocused && localSearch && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            backgroundColor: 'rgb(253, 246, 227)',
            background: 'linear-gradient(to bottom, rgb(255, 252, 240), rgb(253, 246, 227))',
            border: '3px solid rgb(28, 28, 28)',
            boxShadow: '6px 6px 0px rgb(28, 28, 28)',
            zIndex: 50
          }}>
            <div style={{ padding: '8px' }}>
              <div style={{
                padding: '8px 12px',
                fontSize: '12px',
                fontFamily: 'system-ui, sans-serif',
                fontWeight: '600',
                textTransform: 'uppercase',
                color: 'rgb(107, 114, 128)',
                borderBottom: '2px solid rgb(28, 28, 28)',
                background: 'linear-gradient(to right, rgba(247, 181, 56, 0.1), transparent)'
              }}>
                Suggestions
              </div>
              {['Amazing Spider-Man #1', 'Batman: Year One', 'X-Men #94'].map((suggestion, index) => (
                <button
                  key={index}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: index < 2 ? '1px solid rgba(28, 28, 28, 0.1)' : 'none',
                    cursor: 'pointer',
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '14px',
                    color: 'rgb(28, 28, 28)',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(247, 181, 56, 0.2)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Filter Dropdown Component - ENHANCED WITH COLORS
  const FilterDropdown = ({ title, options, multiple = true, icon: Icon, color = 'default' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(multiple ? [] : '');

    const colorSchemes = {
      default: {
        bg: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
        hover: 'linear-gradient(to bottom, rgb(255, 252, 240), rgb(253, 246, 227))',
        accent: 'rgb(247, 181, 56)'
      },
      publisher: {
        bg: 'linear-gradient(to bottom, rgb(240, 249, 255), rgb(224, 242, 254))',
        hover: 'linear-gradient(to bottom, rgb(248, 250, 252), rgb(240, 249, 255))',
        accent: 'rgb(59, 130, 246)'
      },
      condition: {
        bg: 'linear-gradient(to bottom, rgb(240, 253, 244), rgb(220, 252, 231))',
        hover: 'linear-gradient(to bottom, rgb(248, 253, 249), rgb(240, 253, 244))',
        accent: 'rgb(34, 197, 94)'
      },
      price: {
        bg: 'linear-gradient(to bottom, rgb(254, 242, 242), rgb(254, 226, 226))',
        hover: 'linear-gradient(to bottom, rgb(254, 249, 249), rgb(254, 242, 242))',
        accent: 'rgb(239, 68, 68)'
      }
    };

    const scheme = colorSchemes[color] || colorSchemes.default;

    const handleSelect = (option) => {
      if (multiple) {
        setSelected(prev => 
          prev.includes(option) 
            ? prev.filter(item => item !== option)
            : [...prev, option]
        );
      } else {
        setSelected(option);
        setIsOpen(false);
      }
    };

    return (
      <div style={{ position: 'relative', minWidth: '200px' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: isOpen ? scheme.hover : scheme.bg,
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
            {Icon && <Icon size={16} style={{ color: scheme.accent }} />}
            <span>{title}</span>
            {(multiple ? selected.length > 0 : selected) && (
              <span style={{
                background: `linear-gradient(135deg, ${scheme.accent}, ${scheme.accent}dd)`,
                color: 'rgb(255, 255, 255)',
                padding: '2px 6px',
                fontSize: '11px',
                fontWeight: '700',
                borderRadius: '10px',
                boxShadow: '1px 1px 0px rgba(0,0,0,0.2)'
              }}>
                {multiple ? selected.length : '1'}
              </span>
            )}
          </div>
          <ChevronDown 
            size={16} 
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
            background: scheme.bg,
            border: '3px solid rgb(28, 28, 28)',
            boxShadow: '6px 6px 0px rgb(28, 28, 28)',
            zIndex: 50,
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {options.map((option, index) => {
              const isSelected = multiple 
                ? selected.includes(option.value)
                : selected === option.value;

              return (
                <button
                  key={index}
                  onClick={() => handleSelect(option.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: isSelected 
                      ? `linear-gradient(to right, ${scheme.accent}33, transparent)`
                      : 'transparent',
                    border: 'none',
                    borderBottom: index < options.length - 1 ? '1px solid rgba(28, 28, 28, 0.1)' : 'none',
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
                      e.target.style.background = `linear-gradient(to right, ${scheme.accent}1a, transparent)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check size={16} style={{ color: scheme.accent }} />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Active Filter Tags
  const FilterTag = ({ label, onRemove }) => (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      background: 'linear-gradient(135deg, rgb(247, 181, 56), rgb(245, 158, 11))',
      color: 'rgb(28, 28, 28)',
      padding: '6px 12px',
      border: '2px solid rgb(28, 28, 28)',
      boxShadow: '2px 2px 0px rgb(28, 28, 28)',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      <span>{label}</span>
      <button
        onClick={onRemove}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <X size={14} />
      </button>
    </div>
  );

  // Quick Filter Buttons - ENHANCED WITH COLORS
  const QuickFilter = ({ label, icon: Icon, active, onClick, color = 'default' }) => {
    const colorSchemes = {
      default: {
        inactive: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
        active: 'linear-gradient(135deg, rgb(214, 40, 40), rgb(185, 28, 28))',
        hover: 'linear-gradient(to bottom, rgb(255, 252, 240), rgb(253, 246, 227))'
      },
      hot: {
        inactive: 'linear-gradient(to bottom, rgb(254, 242, 242), rgb(254, 226, 226))',
        active: 'linear-gradient(135deg, rgb(239, 68, 68), rgb(220, 38, 38))',
        hover: 'linear-gradient(to bottom, rgb(254, 249, 249), rgb(254, 242, 242))'
      },
      new: {
        inactive: 'linear-gradient(to bottom, rgb(240, 253, 244), rgb(220, 252, 231))',
        active: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
        hover: 'linear-gradient(to bottom, rgb(248, 253, 249), rgb(240, 253, 244))'
      },
      value: {
        inactive: 'linear-gradient(to bottom, rgb(254, 249, 195), rgb(254, 240, 138))',
        active: 'linear-gradient(135deg, rgb(251, 191, 36), rgb(245, 158, 11))',
        hover: 'linear-gradient(to bottom, rgb(254, 252, 211), rgb(254, 249, 195))'
      },
      premium: {
        inactive: 'linear-gradient(to bottom, rgb(243, 232, 255), rgb(233, 213, 255))',
        active: 'linear-gradient(135deg, rgb(147, 51, 234), rgb(126, 34, 206))',
        hover: 'linear-gradient(to bottom, rgb(250, 245, 255), rgb(243, 232, 255))'
      }
    };

    const scheme = colorSchemes[color] || colorSchemes.default;

    return (
      <button
        onClick={onClick}
        style={{
          padding: '8px 16px',
          background: active ? scheme.active : scheme.inactive,
          color: active ? 'rgb(253, 246, 227)' : 'rgb(28, 28, 28)',
          border: '3px solid rgb(28, 28, 28)',
          boxShadow: active ? '4px 4px 0px rgb(28, 28, 28)' : '3px 3px 0px rgb(28, 28, 28)',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
          transform: active ? 'translate(-1px, -1px)' : 'none'
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.background = scheme.hover;
            e.currentTarget.style.transform = 'translate(-1px, -1px)';
            e.currentTarget.style.boxShadow = '4px 4px 0px rgb(28, 28, 28)';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.background = scheme.inactive;
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '3px 3px 0px rgb(28, 28, 28)';
          }
        }}
      >
        {Icon && <Icon size={16} />}
        {label}
      </button>
    );
  };

  // Advanced Filter Panel - ENHANCED
  const AdvancedFilterPanel = () => {
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [yearFrom, setYearFrom] = useState('');
    const [yearTo, setYearTo] = useState('');

    return (
      <div style={{
        background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
        border: '3px solid rgb(28, 28, 28)',
        boxShadow: '6px 6px 0px rgb(28, 28, 28)',
        padding: '24px'
      }}>
        <h3 style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '18px',
          fontWeight: '600',
          color: 'rgb(28, 28, 28)',
          margin: '0 0 20px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          textAlign: 'center',
          padding: '12px',
          background: 'linear-gradient(to right, rgba(247, 181, 56, 0.2), transparent, rgba(247, 181, 56, 0.2))',
          borderBottom: '2px solid rgb(28, 28, 28)'
        }}>
          Advanced Filters
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {/* Publisher Filter */}
          <FilterDropdown
            title="Publisher"
            icon={BookOpen}
            color="publisher"
            options={[
              { value: 'marvel', label: 'Marvel Comics' },
              { value: 'dc', label: 'DC Comics' },
              { value: 'image', label: 'Image Comics' },
              { value: 'darkhorse', label: 'Dark Horse' },
              { value: 'idw', label: 'IDW Publishing' }
            ]}
            multiple={true}
          />

          {/* Condition Filter */}
          <FilterDropdown
            title="Condition"
            icon={Star}
            color="condition"
            options={[
              { value: 'mint', label: 'Mint (10.0)' },
              { value: 'near-mint', label: 'Near Mint (9.0+)' },
              { value: 'very-fine', label: 'Very Fine (8.0+)' },
              { value: 'fine', label: 'Fine (6.0+)' },
              { value: 'good', label: 'Good (2.0+)' }
            ]}
            multiple={true}
          />

          {/* Category Filter */}
          <FilterDropdown
            title="Category"
            icon={Tag}
            color="default"
            options={[
              { value: 'superhero', label: 'Superhero' },
              { value: 'horror', label: 'Horror' },
              { value: 'scifi', label: 'Sci-Fi' },
              { value: 'fantasy', label: 'Fantasy' },
              { value: 'indie', label: 'Indie' }
            ]}
            multiple={true}
          />

          {/* Price Range */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              color: 'rgb(28, 28, 28)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <DollarSign size={16} style={{ color: 'rgb(239, 68, 68)' }} />
              Price Range
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'linear-gradient(to bottom, rgb(254, 242, 242), rgb(254, 226, 226))',
                  border: '2px solid rgb(28, 28, 28)',
                  boxShadow: '2px 2px 0px rgb(28, 28, 28)',
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px' }}>-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'linear-gradient(to bottom, rgb(254, 242, 242), rgb(254, 226, 226))',
                  border: '2px solid rgb(28, 28, 28)',
                  boxShadow: '2px 2px 0px rgb(28, 28, 28)',
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Year Range */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              color: 'rgb(28, 28, 28)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <Calendar size={16} style={{ color: 'rgb(59, 130, 246)' }} />
              Year Published
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="From"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'linear-gradient(to bottom, rgb(240, 249, 255), rgb(224, 242, 254))',
                  border: '2px solid rgb(28, 28, 28)',
                  boxShadow: '2px 2px 0px rgb(28, 28, 28)',
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px' }}>-</span>
              <input
                type="number"
                placeholder="To"
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'linear-gradient(to bottom, rgb(240, 249, 255), rgb(224, 242, 254))',
                  border: '2px solid rgb(28, 28, 28)',
                  boxShadow: '2px 2px 0px rgb(28, 28, 28)',
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '2px solid rgb(28, 28, 28)'
        }}>
          <button style={{
            flex: 1,
            padding: '12px',
            background: 'linear-gradient(135deg, rgb(214, 40, 40), rgb(185, 28, 28))',
            color: 'rgb(253, 246, 227)',
            border: '3px solid rgb(28, 28, 28)',
            boxShadow: '3px 3px 0px rgb(28, 28, 28)',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-1px, -1px)';
            e.currentTarget.style.boxShadow = '4px 4px 0px rgb(28, 28, 28)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '3px 3px 0px rgb(28, 28, 28)';
          }}>
            Apply Filters
          </button>
          <button style={{
            padding: '12px 24px',
            background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
            color: 'rgb(28, 28, 28)',
            border: '3px solid rgb(28, 28, 28)',
            boxShadow: '3px 3px 0px rgb(28, 28, 28)',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-1px, -1px)';
            e.currentTarget.style.boxShadow = '4px 4px 0px rgb(28, 28, 28)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '3px 3px 0px rgb(28, 28, 28)';
          }}>
            Clear All
          </button>
        </div>
      </div>
    );
  };

  const sections = [
    { id: 'search', label: 'Search Bars' },
    { id: 'quick', label: 'Quick Filters' },
    { id: 'dropdowns', label: 'Filter Dropdowns' },
    { id: 'advanced', label: 'Advanced Panel' },
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
          Search & Filter Components
        </h1>
        <p style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '18px',
          color: 'rgb(28, 28, 28)',
          opacity: 0.7,
          margin: 0
        }}>
          Advanced search bars, filters, and category selectors
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

        {/* Search Bars */}
        {currentSection === 'search' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Large Search with Filter (Recommended)</h3>
              <SearchBar variant="default" size="lg" showFilters={true} />
            </div>

            {/* Active Filters Display */}
            <div style={{
              background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
              border: '3px solid rgb(28, 28, 28)',
              boxShadow: '6px 6px 0px rgb(28, 28, 28)',
              padding: '20px'
            }}>
              <h4 style={{ marginBottom: '16px' }}>Active Filters:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <FilterTag label="Marvel" onRemove={() => {}} />
                <FilterTag label="Near Mint" onRemove={() => {}} />
                <FilterTag label="$50-$200" onRemove={() => {}} />
                <FilterTag label="1990-2000" onRemove={() => {}} />
              </div>
            </div>
          </div>
        )}

        {/* Quick Filters */}
        {currentSection === 'quick' && (
          <div style={{
            background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
            border: '3px solid rgb(28, 28, 28)',
            boxShadow: '6px 6px 0px rgb(28, 28, 28)',
            padding: '32px'
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
              Quick Filter Buttons
            </h2>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              <QuickFilter label="Hot This Week" icon={TrendingUp} active={true} onClick={() => {}} color="hot" />
              <QuickFilter label="New Arrivals" icon={Sparkles} active={false} onClick={() => {}} color="new" />
              <QuickFilter label="Under $50" icon={DollarSign} active={false} onClick={() => {}} color="value" />
              <QuickFilter label="Key Issues" icon={Star} active={false} onClick={() => {}} color="premium" />
              <QuickFilter label="First Appearances" icon={Award} active={false} onClick={() => {}} color="default" />
              <QuickFilter label="Graded Only" icon={Check} active={false} onClick={() => {}} color="condition" />
            </div>
          </div>
        )}

        {/* Filter Dropdowns */}
        {currentSection === 'dropdowns' && (
          <div style={{
            background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
            border: '3px solid rgb(28, 28, 28)',
            boxShadow: '6px 6px 0px rgb(28, 28, 28)',
            padding: '32px'
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
              Filter Dropdown Components
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <FilterDropdown
                title="Publisher"
                icon={BookOpen}
                color="publisher"
                options={[
                  { value: 'marvel', label: 'Marvel Comics' },
                  { value: 'dc', label: 'DC Comics' },
                  { value: 'image', label: 'Image Comics' }
                ]}
                multiple={true}
              />

              <FilterDropdown
                title="Sort By"
                icon={null}
                color="default"
                options={[
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                  { value: 'newest', label: 'Newest First' },
                  { value: 'oldest', label: 'Oldest First' }
                ]}
                multiple={false}
              />

              <FilterDropdown
                title="Condition"
                icon={Star}
                color="condition"
                options={[
                  { value: 'mint', label: 'Mint (10.0)' },
                  { value: 'near-mint', label: 'Near Mint (9.0+)' },
                  { value: 'very-fine', label: 'Very Fine (8.0+)' }
                ]}
                multiple={true}
              />

              <FilterDropdown
                title="Price Range"
                icon={DollarSign}
                color="price"
                options={[
                  { value: 'under50', label: 'Under $50' },
                  { value: '50-200', label: '$50 - $200' },
                  { value: '200-500', label: '$200 - $500' },
                  { value: 'over500', label: 'Over $500' }
                ]}
                multiple={false}
              />
            </div>
          </div>
        )}

        {/* Advanced Filter Panel */}
        {currentSection === 'advanced' && (
          <AdvancedFilterPanel />
        )}

      </div>
    </div>
  );
};

export default SearchFilterShowcase;