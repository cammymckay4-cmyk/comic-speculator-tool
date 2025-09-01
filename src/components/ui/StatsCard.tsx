import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  trend = 'neutral',
  className = '',
}) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  }

  const trendIcons = {
    up: <TrendingUp size={16} />,
    down: <TrendingDown size={16} />,
    neutral: <Minus size={16} />,
  }

  return (
    <div className={`bg-white comic-border shadow-comic p-6 hover:translate-y-[-2px] transition-transform ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-persona-aura text-sm text-gray-600 uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className="font-super-squad text-3xl text-ink-black">
            {value}
          </p>
        </div>
        {icon && (
          <div className="bg-golden-age-yellow bg-opacity-20 p-3 rounded-full">
            <div className="text-golden-age-yellow">
              {icon}
            </div>
          </div>
        )}
      </div>
      
      {change && (
        <div className={`flex items-center space-x-1 ${trendColors[trend]}`}>
          {trendIcons[trend]}
          <span className="font-persona-aura text-sm font-medium">
            {change}
          </span>
        </div>
      )}
    </div>
  )
}

export default StatsCard
