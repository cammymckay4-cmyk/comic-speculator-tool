import React, { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';

interface SearchBarProps {
  variant?: 'default';
  size?: 'sm' | 'md' | 'lg';
  showFilters?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFilterClick?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  variant = 'default',
  size = 'lg',
  showFilters = true,
  placeholder = 'Search comics, creators, publishers...',
  value,
  onChange,
  onFilterClick
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localSearch, setLocalSearch] = useState(value || '');

  const sizeConfigs = {
    sm: { padding: '8px 12px', fontSize: '14px', iconSize: 16 },
    md: { padding: '12px 16px', fontSize: '16px', iconSize: 20 },
    lg: { padding: '16px 20px', fontSize: '18px', iconSize: 24 }
  };

  const config = sizeConfigs[size];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalSearch(newValue);
    onChange?.(newValue);
  };

  const handleClear = () => {
    setLocalSearch('');
    onChange?.('');
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <input
        type="text"
        placeholder={placeholder}
        value={localSearch}
        onChange={handleChange}
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
          onClick={handleClear}
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
          onClick={onFilterClick}
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
  );
};

export default SearchBar;