import React from 'react'
import { LOADING_MESSAGES } from '@/utils/constants'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  variant?: 'default' | 'inline' | 'overlay' | 'card'
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  variant = 'default',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }

  // Get random loading message if no text provided
  const loadingText = text || LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]

  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 bg-ink-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-parchment comic-border shadow-comic-lg p-8 flex flex-col items-center">
          <div className={`${sizeClasses[size]} relative animate-spin`}>
            <div className="absolute inset-0 border-4 border-kirby-red border-t-transparent rounded-full"></div>
            <div className="absolute inset-2 border-4 border-golden-age-yellow border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
          </div>
          <p className={`font-super-squad ${textSizeClasses[size]} text-ink-black mt-4 animate-pulse`}>
            {loadingText}...
          </p>
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className="bg-white comic-border shadow-comic p-6 flex flex-col items-center">
        <div className={`${sizeClasses[size]} relative animate-spin`}>
          <div className="absolute inset-0 border-4 border-kirby-red border-t-transparent rounded-full"></div>
        </div>
        <p className={`font-super-squad ${textSizeClasses[size]} text-ink-black mt-4 animate-pulse`}>
          {loadingText}...
        </p>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        <div className={`${sizeClasses[size]} relative animate-spin`}>
          <div className="absolute inset-0 border-4 border-kirby-red border-t-transparent rounded-full"></div>
        </div>
        <span className={`font-super-squad ${textSizeClasses[size]} text-ink-black animate-pulse`}>
          {loadingText}...
        </span>
      </div>
    )
  }

  // Default variant
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} relative animate-spin`}>
        <div className="absolute inset-0 border-4 border-kirby-red border-t-transparent rounded-full"></div>
        <div className="absolute inset-2 border-4 border-golden-age-yellow border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
      </div>
      <p className={`font-super-squad ${textSizeClasses[size]} text-ink-black mt-4 animate-pulse`}>
        {loadingText}...
      </p>
    </div>
  )
}

export default LoadingSpinner
