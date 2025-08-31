import React from 'react';

interface ComicLoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'inline' | 'overlay' | 'card';
  className?: string;
}

const ComicLoading: React.FC<ComicLoadingProps> = ({
  text = 'LOADING',
  size = 'md',
  variant = 'default',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl',
  };

  const baseClasses = `
    font-bangers uppercase tracking-wider text-kirby-red
    comic-loading-pulse select-none
  `;

  const LoadingText = () => (
    <div className={`${baseClasses} ${sizeClasses[size]} ${className}`}>
      {text}...
      <div className="inline-block ml-1">
        <span className="animate-pulse">.</span>
        <span className="animate-pulse animation-delay-300">.</span>
        <span className="animate-pulse animation-delay-600">.</span>
      </div>
    </div>
  );

  const LoadingBubble = ({ children }: { children: React.ReactNode }) => (
    <div className="comic-border bg-parchment p-8 text-center shadow-comic">
      {children}
      <div className="mt-4 flex justify-center space-x-1">
        <div className="w-3 h-3 bg-kirby-red comic-loading-pulse"></div>
        <div className="w-3 h-3 bg-golden-age-yellow comic-loading-pulse animation-delay-300"></div>
        <div className="w-3 h-3 bg-stan-lee-blue comic-loading-pulse animation-delay-600"></div>
      </div>
    </div>
  );

  switch (variant) {
    case 'inline':
      return <LoadingText />;

    case 'overlay':
      return (
        <div className="fixed inset-0 bg-parchment bg-opacity-90 flex items-center justify-center z-50">
          <LoadingBubble>
            <LoadingText />
          </LoadingBubble>
        </div>
      );

    case 'card':
      return (
        <div className="flex items-center justify-center p-12">
          <LoadingBubble>
            <LoadingText />
          </LoadingBubble>
        </div>
      );

    default:
      return (
        <div className="flex items-center justify-center py-8">
          <LoadingText />
        </div>
      );
  }
};

// Specialized loading components for different contexts
interface ComicSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ComicSpinner: React.FC<ComicSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`inline-block ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-ink-black rounded-full animate-spin border-t-kirby-red border-r-golden-age-yellow border-b-stan-lee-blue border-l-transparent"></div>
        
        {/* Inner dot */}
        <div className="absolute inset-2 bg-kirby-red rounded-full comic-loading-pulse"></div>
      </div>
    </div>
  );
};

interface ComicProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export const ComicProgressBar: React.FC<ComicProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  className = '',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`space-y-2 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center">
          {label && (
            <span className="font-bangers uppercase text-ink-black text-sm tracking-wide">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="font-inter font-bold text-kirby-red text-sm">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      
      <div className="comic-border bg-parchment h-8 relative overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-kirby-red to-golden-age-yellow transition-all duration-300 ease-out relative"
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Comic-style shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
        </div>
        
        {/* Progress text overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bangers uppercase text-ink-black text-xs tracking-wider drop-shadow-sm">
            {clampedProgress < 50 ? `${Math.round(clampedProgress)}%` : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

// Thematic loading messages
const loadingMessages = [
  'LOADING',
  'FETCHING',
  'PROCESSING',
  'SCANNING',
  'SEARCHING',
  'POWERING UP',
  'CHARGING',
  'ACTIVATING',
  'INITIALIZING',
  'CONNECTING'
];

interface ComicThematicLoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'inline' | 'overlay' | 'card';
  className?: string;
  randomText?: boolean;
}

export const ComicThematicLoading: React.FC<ComicThematicLoadingProps> = ({
  size = 'md',
  variant = 'default',
  className = '',
  randomText = false,
}) => {
  const [currentMessage, setCurrentMessage] = React.useState(loadingMessages[0]);

  React.useEffect(() => {
    if (!randomText) return;

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * loadingMessages.length);
      setCurrentMessage(loadingMessages[randomIndex]);
    }, 1500);

    return () => clearInterval(interval);
  }, [randomText]);

  return (
    <ComicLoading
      text={currentMessage}
      size={size}
      variant={variant}
      className={className}
    />
  );
};

// Full page loading screen component
interface ComicLoadingScreenProps {
  title?: string;
  subtitle?: string;
  progress?: number;
  showProgress?: boolean;
}

export const ComicLoadingScreen: React.FC<ComicLoadingScreenProps> = ({
  title = 'ComicScoutUK',
  subtitle = 'Loading your comic universe...',
  progress,
  showProgress = false,
}) => {
  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full space-y-8">
        {/* Logo/Title */}
        <div className="space-y-2">
          <h1 className="font-bangers text-6xl text-kirby-red uppercase tracking-wider">
            {title}
          </h1>
          <p className="font-inter text-ink-black opacity-70">
            {subtitle}
          </p>
        </div>

        {/* Loading Animation */}
        <div className="space-y-6">
          <ComicThematicLoading size="lg" randomText />
          
          {showProgress && typeof progress === 'number' && (
            <ComicProgressBar 
              progress={progress} 
              showPercentage={false}
            />
          )}
        </div>

        {/* Decorative elements */}
        <div className="flex justify-center space-x-4 opacity-30">
          <div className="w-4 h-4 bg-kirby-red comic-loading-pulse"></div>
          <div className="w-4 h-4 bg-golden-age-yellow comic-loading-pulse animation-delay-300"></div>
          <div className="w-4 h-4 bg-stan-lee-blue comic-loading-pulse animation-delay-600"></div>
        </div>
      </div>
    </div>
  );
};

export default ComicLoading;