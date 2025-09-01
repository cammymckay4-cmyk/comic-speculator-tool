import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface ComicData {
  id: string
  title: string
  issue: string
  publisher: string
  coverImage: string
  value: string
  trend: 'up' | 'down' | 'neutral'
  change: string
}

interface ComicCardProps {
  comic: ComicData
  onClick?: () => void
  variant?: 'default' | 'compact' | 'detailed'
}

const ComicCard: React.FC<ComicCardProps> = ({ 
  comic, 
  onClick,
  variant = 'default' 
}) => {
  return (
    <div 
      className="comic-card overflow-hidden group"
      onClick={onClick}
    >
      {/* Cover Image */}
      <div className="relative h-64 bg-gray-100 overflow-hidden">
        <img
          src={comic.coverImage}
          alt={`${comic.title} ${comic.issue}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Price Badge */}
        <div className="absolute top-2 right-2 bg-golden-age-yellow text-ink-black px-3 py-1 font-super-squad text-sm border-2 border-ink-black shadow-comic-sm">
          {comic.value}
        </div>
        
        {/* Trend Badge */}
        {comic.trend !== 'neutral' && (
          <div className={`absolute top-2 left-2 px-2 py-1 rounded-none border-2 border-ink-black shadow-comic-sm flex items-center space-x-1 ${
            comic.trend === 'up' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {comic.trend === 'up' ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            <span className="font-persona-aura text-xs font-bold">{comic.change}</span>
          </div>
        )}
      </div>
      
      {/* Card Content */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs font-persona-aura text-gray-600 uppercase tracking-wide">
            {comic.publisher}
          </span>
        </div>
        <h3 className="font-super-squad text-lg text-ink-black mb-1">
          {comic.title}
        </h3>
        <p className="font-persona-aura text-sm text-gray-700">
          Issue {comic.issue}
        </p>
        
        {variant === 'detailed' && (
          <div className="mt-4 pt-4 border-t-2 border-gray-200">
            <button className="w-full comic-button text-sm py-2">
              VIEW DETAILS
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ComicCard
