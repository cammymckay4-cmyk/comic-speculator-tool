import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ComicButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const ComicButton: React.FC<ComicButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  type = 'button',
  className = '',
}) => {
  const baseClasses = `
    font-inter font-semibold uppercase tracking-wide
    border-comic border-ink-black
    transition-all duration-150 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-golden-age-yellow focus:ring-offset-2
    disabled:opacity-60 disabled:cursor-not-allowed
    disabled:transform-none disabled:hover:transform-none
    inline-flex items-center justify-center
    relative overflow-hidden
  `;

  const variantClasses = {
    primary: `
      bg-kirby-red text-parchment shadow-comic
      hover:transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-comic-hover
      active:transform active:translate-x-1 active:translate-y-1 active:shadow-comic-sm
      disabled:bg-gray-400 disabled:shadow-comic
    `,
    secondary: `
      bg-golden-age-yellow text-ink-black shadow-comic
      hover:transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-comic-hover
      active:transform active:translate-x-1 active:translate-y-1 active:shadow-comic-sm
      disabled:bg-gray-300 disabled:shadow-comic
    `,
    accent: `
      bg-stan-lee-blue text-parchment shadow-comic
      hover:transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-comic-hover
      active:transform active:translate-x-1 active:translate-y-1 active:shadow-comic-sm
      disabled:bg-gray-500 disabled:shadow-comic
    `,
    outline: `
      bg-parchment text-ink-black shadow-comic border-kirby-red
      hover:bg-kirby-red hover:text-parchment
      hover:transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-comic-hover
      active:transform active:translate-x-1 active:translate-y-1 active:shadow-comic-sm
      disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-comic
    `,
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedClasses}
    >
      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit">
          <div className="comic-loading text-inherit">
            LOADING...
          </div>
        </div>
      )}

      {/* Content Container */}
      <div className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {/* Left Icon */}
        {Icon && iconPosition === 'left' && (
          <Icon className={iconSizeClasses[size]} />
        )}

        {/* Button Text */}
        <span>{children}</span>

        {/* Right Icon */}
        {Icon && iconPosition === 'right' && (
          <Icon className={iconSizeClasses[size]} />
        )}
      </div>

      {/* Comic-style shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 transition-opacity duration-300 transform -skew-x-12" />
    </button>
  );
};

// Preset button components for common use cases
export const PrimaryButton: React.FC<Omit<ComicButtonProps, 'variant'>> = (props) => (
  <ComicButton {...props} variant="primary" />
);

export const SecondaryButton: React.FC<Omit<ComicButtonProps, 'variant'>> = (props) => (
  <ComicButton {...props} variant="secondary" />
);

export const AccentButton: React.FC<Omit<ComicButtonProps, 'variant'>> = (props) => (
  <ComicButton {...props} variant="accent" />
);

export const OutlineButton: React.FC<Omit<ComicButtonProps, 'variant'>> = (props) => (
  <ComicButton {...props} variant="outline" />
);

export default ComicButton;