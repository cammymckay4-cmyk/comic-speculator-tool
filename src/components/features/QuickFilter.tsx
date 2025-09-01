import React from 'react';

interface QuickFilterProps {
  label: string;
  icon?: React.ComponentType<{ size?: number }>;
  active?: boolean;
  onClick?: () => void;
  color?: 'default' | 'hot' | 'new' | 'value' | 'premium' | 'condition';
}

const QuickFilter: React.FC<QuickFilterProps> = ({ 
  label, 
  icon: Icon, 
  active = false, 
  onClick,
  color = 'default' 
}) => {
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
    },
    condition: {
      inactive: 'linear-gradient(to bottom, rgb(240, 253, 244), rgb(220, 252, 231))',
      active: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
      hover: 'linear-gradient(to bottom, rgb(248, 253, 249), rgb(240, 253, 244))'
    }
  };

  const scheme = colorSchemes[color];

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

export default QuickFilter;