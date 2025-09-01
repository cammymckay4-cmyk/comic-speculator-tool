import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  title: string;
  options: FilterOption[];
  multiple?: boolean;
  icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color?: 'default' | 'publisher' | 'condition' | 'price';
  onSelectionChange?: (selected: string | string[]) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  title,
  options,
  multiple = true,
  icon: Icon,
  color = 'default',
  onSelectionChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(multiple ? [] : ['']);

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

  const handleSelect = (option: string) => {
    let newSelected: string | string[];

    if (multiple) {
      const currentArray = selected as string[];
      newSelected = currentArray.includes(option)
        ? currentArray.filter(item => item !== option)
        : [...currentArray, option];
      setSelected(newSelected);
    } else {
      newSelected = option;
      setSelected([option]);
      setIsOpen(false);
    }

    onSelectionChange?.(newSelected);
  };

  const selectedCount = multiple ? (selected as string[]).length : (selected[0] ? 1 : 0);

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
          {selectedCount > 0 && (
            <span style={{
              background: `linear-gradient(135deg, ${scheme.accent}, ${scheme.accent}dd)`,
              color: 'rgb(255, 255, 255)',
              padding: '2px 6px',
              fontSize: '11px',
              fontWeight: '700',
              borderRadius: '10px',
              boxShadow: '1px 1px 0px rgba(0,0,0,0.2)'
            }}>
              {selectedCount}
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
            const isSelected = (selected as string[]).includes(option.value);

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
                    e.currentTarget.style.background = `linear-gradient(to right, ${scheme.accent}1a, transparent)`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
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

export default FilterDropdown;