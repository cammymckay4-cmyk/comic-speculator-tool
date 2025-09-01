import React from 'react';

interface ComicButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: React.ComponentType<{ size?: number }>;
  className?: string;
  style?: React.CSSProperties;
}

const ComicButton: React.FC<ComicButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon: Icon,
  className = '',
  style = {}
}) => {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, rgb(214, 40, 40), rgb(185, 28, 28))',
      color: 'rgb(253, 246, 227)',
      hoverBg: 'linear-gradient(135deg, rgb(239, 68, 68), rgb(220, 38, 38))'
    },
    secondary: {
      background: 'linear-gradient(135deg, rgb(107, 114, 128), rgb(75, 85, 99))',
      color: 'rgb(253, 246, 227)',
      hoverBg: 'linear-gradient(135deg, rgb(156, 163, 175), rgb(107, 114, 128))'
    },
    success: {
      background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
      color: 'rgb(253, 246, 227)',
      hoverBg: 'linear-gradient(135deg, rgb(74, 222, 128), rgb(34, 197, 94))'
    },
    warning: {
      background: 'linear-gradient(135deg, rgb(247, 181, 56), rgb(245, 158, 11))',
      color: 'rgb(28, 28, 28)',
      hoverBg: 'linear-gradient(135deg, rgb(251, 191, 36), rgb(247, 181, 56))'
    },
    danger: {
      background: 'linear-gradient(135deg, rgb(239, 68, 68), rgb(220, 38, 38))',
      color: 'rgb(253, 246, 227)',
      hoverBg: 'linear-gradient(135deg, rgb(248, 113, 113), rgb(239, 68, 68))'
    }
  };

  const sizes = {
    sm: {
      padding: '8px 16px',
      fontSize: '12px',
      iconSize: 14
    },
    md: {
      padding: '12px 24px',
      fontSize: '14px',
      iconSize: 16
    },
    lg: {
      padding: '16px 32px',
      fontSize: '16px',
      iconSize: 20
    }
  };

  const variantConfig = variants[variant];
  const sizeConfig = sizes[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        padding: sizeConfig.padding,
        background: disabled ? 'rgb(200, 200, 200)' : variantConfig.background,
        color: disabled ? 'rgb(107, 114, 128)' : variantConfig.color,
        border: '3px solid rgb(28, 28, 28)',
        boxShadow: disabled ? '2px 2px 0px rgb(28, 28, 28)' : '3px 3px 0px rgb(28, 28, 28)',
        fontFamily: 'system-ui, sans-serif',
        fontSize: sizeConfig.fontSize,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Icon ? '8px' : '0',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.5 : 1,
        ...style
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translate(-1px, -1px)';
          e.currentTarget.style.boxShadow = '4px 4px 0px rgb(28, 28, 28)';
          e.currentTarget.style.background = variantConfig.hoverBg;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '3px 3px 0px rgb(28, 28, 28)';
          e.currentTarget.style.background = variantConfig.background;
        }
      }}
    >
      {Icon && <Icon size={sizeConfig.iconSize} />}
      {children}
    </button>
  );
};

export default ComicButton;