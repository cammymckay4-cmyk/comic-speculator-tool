import React, { forwardRef } from 'react';
import { LucideIcon, EyeIcon, EyeOffIcon } from 'lucide-react';

interface ComicInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  disabled?: boolean;
  required?: boolean;
  error?: string;
  success?: string;
  hint?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  className?: string;
  inputClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled';
}

const ComicInput = forwardRef<HTMLInputElement, ComicInputProps>(
  ({
    label,
    placeholder,
    value,
    onChange,
    onBlur,
    onFocus,
    type = 'text',
    disabled = false,
    required = false,
    error,
    success,
    hint,
    icon: Icon,
    iconPosition = 'left',
    className = '',
    inputClassName = '',
    size = 'md',
    variant = 'default',
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    };

    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    const baseInputClasses = `
      w-full font-inter text-ink-black bg-parchment
      border-comic border-ink-black shadow-comic
      focus:outline-none focus:ring-2 focus:ring-golden-age-yellow focus:ring-offset-2
      transition-all duration-200 ease-in-out
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100
      placeholder:text-ink-black placeholder:opacity-50
    `;

    const variantClasses = {
      default: 'bg-parchment',
      filled: 'bg-gray-50 focus:bg-parchment',
    };

    const stateClasses = error 
      ? 'border-kirby-red shadow-[6px_6px_0px_#D62828] focus:ring-kirby-red'
      : success 
      ? 'border-green-500 shadow-[6px_6px_0px_#10B981] focus:ring-green-500'
      : 'border-ink-black shadow-comic focus:shadow-[7px_7px_0px_#1C1C1C]';

    const focusTransform = isFocused && !error && !disabled 
      ? 'transform -translate-x-1 -translate-y-1' 
      : '';

    const inputClasses = `
      ${baseInputClasses}
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${stateClasses}
      ${focusTransform}
      ${Icon ? (iconPosition === 'left' ? 'pl-12' : 'pr-12') : ''}
      ${isPassword ? 'pr-12' : ''}
      ${inputClassName}
    `.replace(/\s+/g, ' ').trim();

    const handleFocus = () => {
      setIsFocused(true);
      onFocus?.();
    };

    const handleBlur = () => {
      setIsFocused(false);
      onBlur?.();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className={`space-y-2 ${className}`}>
        {/* Label */}
        {label && (
          <label className="block font-inter font-semibold text-ink-black text-sm uppercase tracking-wide">
            {label}
            {required && <span className="text-kirby-red ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {Icon && iconPosition === 'left' && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Icon className={`${iconSizeClasses[size]} text-ink-black opacity-60`} />
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            type={inputType}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={inputClasses}
          />

          {/* Right Icon */}
          {Icon && iconPosition === 'right' && !isPassword && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Icon className={`${iconSizeClasses[size]} text-ink-black opacity-60`} />
            </div>
          )}

          {/* Password Toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-ink-black opacity-60 hover:opacity-100 transition-opacity"
            >
              {showPassword ? (
                <EyeOffIcon className={iconSizeClasses[size]} />
              ) : (
                <EyeIcon className={iconSizeClasses[size]} />
              )}
            </button>
          )}
        </div>

        {/* Helper Text */}
        {(error || success || hint) && (
          <div className="space-y-1">
            {error && (
              <div className="comic-speech-bubble text-kirby-red">
                {error}
              </div>
            )}
            
            {success && (
              <div className="comic-speech-bubble text-green-600 border-green-500">
                {success}
              </div>
            )}
            
            {hint && !error && !success && (
              <p className="text-ink-black opacity-60 text-xs font-inter">
                {hint}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

ComicInput.displayName = 'ComicInput';

// Specialized input components
interface ComicTextareaProps extends Omit<ComicInputProps, 'type' | 'icon' | 'iconPosition'> {
  rows?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const ComicTextarea: React.FC<ComicTextareaProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  error,
  success,
  hint,
  className = '',
  inputClassName = '',
  size = 'md',
  variant = 'default',
  rows = 4,
  resize = 'vertical',
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  const baseTextareaClasses = `
    w-full font-inter text-ink-black bg-parchment
    border-comic border-ink-black shadow-comic
    focus:outline-none focus:ring-2 focus:ring-golden-age-yellow focus:ring-offset-2
    transition-all duration-200 ease-in-out
    disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100
    placeholder:text-ink-black placeholder:opacity-50
  `;

  const variantClasses = {
    default: 'bg-parchment',
    filled: 'bg-gray-50 focus:bg-parchment',
  };

  const stateClasses = error 
    ? 'border-kirby-red shadow-[6px_6px_0px_#D62828] focus:ring-kirby-red'
    : success 
    ? 'border-green-500 shadow-[6px_6px_0px_#10B981] focus:ring-green-500'
    : 'border-ink-black shadow-comic focus:shadow-[7px_7px_0px_#1C1C1C]';

  const focusTransform = isFocused && !error && !disabled 
    ? 'transform -translate-x-1 -translate-y-1' 
    : '';

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  };

  const textareaClasses = `
    ${baseTextareaClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${stateClasses}
    ${focusTransform}
    ${resizeClasses[resize]}
    ${inputClassName}
  `.replace(/\s+/g, ' ').trim();

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block font-inter font-semibold text-ink-black text-sm uppercase tracking-wide">
          {label}
          {required && <span className="text-kirby-red ml-1">*</span>}
        </label>
      )}

      {/* Textarea */}
      <textarea
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={textareaClasses}
      />

      {/* Helper Text */}
      {(error || success || hint) && (
        <div className="space-y-1">
          {error && (
            <div className="comic-speech-bubble text-kirby-red">
              {error}
            </div>
          )}
          
          {success && (
            <div className="comic-speech-bubble text-green-600 border-green-500">
              {success}
            </div>
          )}
          
          {hint && !error && !success && (
            <p className="text-ink-black opacity-60 text-xs font-inter">
              {hint}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ComicInput;