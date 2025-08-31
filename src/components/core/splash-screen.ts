import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number; // Duration in milliseconds
  autoRedirect?: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  duration = 4000,
  autoRedirect = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'display' | 'exit'>('enter');

  useEffect(() => {
    if (!autoRedirect) return;

    const timeline = [
      // Enter animation
      { delay: 0, action: () => setAnimationPhase('enter') },
      // Display phase
      { delay: 800, action: () => setAnimationPhase('display') },
      // Exit animation
      { delay: duration - 600, action: () => setAnimationPhase('exit') },
      // Complete and hide
      { delay: duration, action: () => {
        setIsVisible(false);
        onComplete?.();
      }}
    ];

    const timeouts = timeline.map(({ delay, action }) =>
      setTimeout(action, delay)
    );

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [duration, autoRedirect, onComplete]);

  const handleSkip = () => {
    setAnimationPhase('exit');
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-parchment flex items-center justify-center overflow-hidden">
      {/* Main Content Container */}
      <div className="relative text-center">
        {/* Comic-style Impact Text */}
        <div 
          className={`
            transition-all duration-800 ease-out transform
            ${animationPhase === 'enter' ? 'scale-0 rotate-12 opacity-0' : ''}
            ${animationPhase === 'display' ? 'scale-100 rotate-0 opacity-100' : ''}
            ${animationPhase === 'exit' ? 'scale-110 rotate-3 opacity-0' : ''}
          `}
        >
          {/* Main POW! Text */}
          <div className="relative">
            <h1 className="font-bangers text-9xl md:text-[12rem] text-kirby-red uppercase tracking-wider select-none relative z-10">
              POW!
            </h1>
            
            {/* Comic-style text outline/shadow */}
            <h1 className="font-bangers text-9xl md:text-[12rem] text-ink-black uppercase tracking-wider select-none absolute top-2 left-2 z-0">
              POW!
            </h1>
          </div>

          {/* Brand Text */}
          <div 
            className={`
              mt-4 transition-all duration-1000 delay-300
              ${animationPhase === 'enter' ? 'translate-y-8 opacity-0' : ''}
              ${animationPhase === 'display' ? 'translate-y-0 opacity-100' : ''}
              ${animationPhase === 'exit' ? 'translate-y-4 opacity-0' : ''}
            `}
          >
            <h2 className="font-bangers text-3xl md:text-4xl text-stan-lee-blue uppercase tracking-wide">
              ComicScoutUK
            </h2>
            <p className="font-inter text-ink-black opacity-70 mt-2 text-lg">
              Your Comic Universe Awaits
            </p>
          </div>
        </div>

        {/* Decorative Comic Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Star bursts around the text */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`
                absolute w-8 h-8 text-golden-age-yellow
                ${i === 0 ? 'top-10 left-10' : ''}
                ${i === 1 ? 'top-16 right-16' : ''}
                ${i === 2 ? 'bottom-20 left-20' : ''}
                ${i === 3 ? 'bottom-16 right-12' : ''}
                ${i === 4 ? 'top-1/3 left-8' : ''}
                ${i === 5 ? 'top-1/3 right-8' : ''}
                ${i === 6 ? 'bottom-1/3 left-12' : ''}
                ${i === 7 ? 'bottom-1/3 right-20' : ''}
                transition-all duration-1000 delay-${i * 100}
                ${animationPhase === 'enter' ? 'scale-0 rotate-180 opacity-0' : ''}
                ${animationPhase === 'display' ? 'scale-100 rotate-0 opacity-60 animate-pulse' : ''}
                ${animationPhase === 'exit' ? 'scale-0 rotate-45 opacity-0' : ''}
              `}
              style={{
                animationDelay: `${i * 200}ms`,
              }}
            >
              ★
            </div>
          ))}

          {/* Impact lines */}
          <div 
            className={`
              absolute inset-0 transition-all duration-800 delay-200
              ${animationPhase === 'enter' ? 'scale-50 opacity-0' : ''}
              ${animationPhase === 'display' ? 'scale-100 opacity-20' : ''}
              ${animationPhase === 'exit' ? 'scale-150 opacity-0' : ''}
            `}
          >
            {/* Radial impact lines */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 bg-ink-black origin-bottom"
                style={{
                  height: '80px',
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Skip Button */}
      {autoRedirect && (
        <button
          onClick={handleSkip}
          className={`
            absolute bottom-8 right-8 px-4 py-2 
            font-inter text-sm text-ink-black opacity-50 
            hover:opacity-100 transition-opacity duration-200
            border-2 border-ink-black hover:bg-golden-age-yellow hover:bg-opacity-20
            ${animationPhase === 'exit' ? 'opacity-0 pointer-events-none' : ''}
          `}
        >
          Skip
        </button>
      )}

      {/* Progress indicator */}
      {autoRedirect && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`
                  w-2 h-2 rounded-full bg-ink-black transition-all duration-300
                  ${animationPhase === 'display' ? 'animate-pulse' : 'opacity-30'}
                `}
                style={{
                  animationDelay: `${i * 200}ms`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Background texture overlay */}
      <div className="absolute inset-0 bg-comic-dots pointer-events-none" />
    </div>
  );
};

// Alternative splash screens for different contexts
interface QuickSplashProps {
  text: string;
  onComplete?: () => void;
  duration?: number;
}

export const QuickSplash: React.FC<QuickSplashProps> = ({
  text,
  onComplete,
  duration = 1500,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-parchment bg-opacity-95 flex items-center justify-center">
      <div className="comic-border bg-parchment p-8 text-center shadow-comic-lg animate-pulse">
        <h2 className="font-bangers text-4xl text-kirby-red uppercase tracking-wide">
          {text}
        </h2>
      </div>
    </div>
  );
};

// Page transition splash
interface TransitionSplashProps {
  isActive: boolean;
  text?: string;
}

export const TransitionSplash: React.FC<TransitionSplashProps> = ({
  isActive,
  text = 'LOADING',
}) => {
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-40 bg-parchment bg-opacity-90 flex items-center justify-center transition-all duration-300">
      <div className="text-center">
        <h2 className="font-bangers text-3xl text-kirby-red uppercase tracking-wide comic-loading-pulse">
          {text}...
        </h2>
        
        <div className="flex justify-center space-x-2 mt-4">
          <div className="w-3 h-3 bg-kirby-red rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-golden-age-yellow rounded-full animate-bounce animation-delay-300" />
          <div className="w-3 h-3 bg-stan-lee-blue rounded-full animate-bounce animation-delay-600" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;