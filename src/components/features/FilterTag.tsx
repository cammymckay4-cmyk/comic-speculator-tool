import React from 'react';
import { X } from 'lucide-react';

interface FilterTagProps {
  label: string;
  onRemove?: () => void;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const FilterTag: React.FC<FilterTagProps> = ({ 
  label, 
  onRemove,
  variant = 'default'
}) => {
  const variants = {
    default: {
      background: 'linear-gradient(135deg, rgb(247, 181, 56), rgb(245, 158, 11))',
      color: 'rgb(28, 28, 28)'
    },
    success: {
      background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
      color: 'rgb(253, 246, 227)'
    },
    warning: {
      background: 'linear-gradient(135deg, rgb(245, 158, 11), rgb(217, 119, 6))',
      color: 'rgb(28, 28, 28)'
    },
    danger: {
      background: 'linear-gradient(135deg, rgb(239, 68, 68), rgb(220, 38, 38))',
      color: 'rgb(253, 246, 227)'
    }
  };

  const config = variants[variant];

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      background: config.background,
      color: config.color,
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
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            color: 'inherit'
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default FilterTag;