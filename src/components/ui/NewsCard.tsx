import React from 'react'
import { Clock, ArrowRight } from 'lucide-react'

interface NewsArticle {
  id: string
  title: string
  excerpt: string
  date: string
  category: string
  image?: string
}

interface NewsCardProps {
  article: NewsArticle
  onClick?: () => void
}

const NewsCard: React.FC<NewsCardProps> = ({ article, onClick }) => {
  return (
    <div 
      className="bg-white comic-border shadow-comic overflow-hidden hover:translate-y-[-2px] transition-transform cursor-pointer group"
      onClick={onClick}
    >
      {/* Image */}
      {article.image && (
        <div className="h-48 bg-gray-100 overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      {/* Content */}
      <div className="p-6">
        {/* Category Badge */}
        <div className="mb-3">
          <span className="inline-block bg-stan-lee-blue text-parchment px-3 py-1 text-xs font-persona-aura font-semibold uppercase tracking-wide">
            {article.category}
          </span>
        </div>
        
        {/* Title */}
        <h3 className="font-super-squad text-xl text-ink-black mb-2 group-hover:text-kirby-red transition-colors">
          {article.title}
        </h3>
        
        {/* Excerpt */}
        <p className="font-persona-aura text-gray-700 text-sm mb-4 line-clamp-2">
          {article.excerpt}
        </p>
        
        {/* Footer */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1 text-gray-500">
            <Clock size={14} />
            <span className="font-persona-aura text-xs">
              {article.date}
            </span>
          </div>
          
          <button className="flex items-center space-x-1 text-stan-lee-blue hover:text-kirby-red transition-colors">
            <span className="font-persona-aura text-sm font-semibold">Read More</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewsCard
