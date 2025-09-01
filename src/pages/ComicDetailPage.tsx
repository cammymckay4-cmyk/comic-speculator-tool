import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft,
  Heart,
  Bell,
  Share2,
  ShoppingCart,
  TrendingUp,
  Calendar,
  User,
  Tag,
  BookOpen,
  Star,
  DollarSign,
  AlertCircle
} from 'lucide-react'
import { COMIC_CONDITIONS } from '@/utils/constants'

// Mock comic data (in a real app, this would be fetched based on the ID)
const mockComicData = {
  id: '1',
  title: 'Amazing Spider-Man',
  issue: '#1',
  issueNumber: 1,
  publisher: 'Marvel Comics',
  publishDate: 'March 1963',
  coverImage: 'https://via.placeholder.com/400x600/D62828/FDF6E3?text=Spider-Man+%231',
  creators: [
    { name: 'Stan Lee', role: 'Writer' },
    { name: 'Steve Ditko', role: 'Artist' },
  ],
  description: 'The first appearance of Spider-Man! High school student Peter Parker is bitten by a radioactive spider and gains amazing powers. After a personal tragedy, he learns that with great power comes great responsibility.',
  pageCount: 32,
  format: 'Single Issue',
  isKeyIssue: true,
  keyIssueReason: 'First appearance of Spider-Man',
  characters: ['Spider-Man', 'Aunt May', 'Uncle Ben', 'Flash Thompson'],
  storyArcs: ['Spider-Man Origin'],
  currentValue: 45000,
  trend: 'up',
  trendPercentage: 12,
  conditions: [
    { grade: 'Mint', price: 150000 },
    { grade: 'Near Mint', price: 45000 },
    { grade: 'Very Fine', price: 18000 },
    { grade: 'Fine', price: 8000 },
    { grade: 'Good', price: 3000 },
  ],
  priceHistory: [
    { date: 'Jan 2024', value: 40000 },
    { date: 'Feb 2024', value: 41000 },
    { date: 'Mar 2024', value: 42000 },
    { date: 'Apr 2024', value: 43000 },
    { date: 'May 2024', value: 44000 },
    { date: 'Jun 2024', value: 45000 },
  ],
}

const ComicDetailPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedCondition, setSelectedCondition] = useState('Near Mint')
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [hasAlert, setHasAlert] = useState(false)

  // In a real app, fetch comic data based on id
  const comic = mockComicData

  return (
    <div className="min-h-screen bg-parchment">
      {/* Back Navigation */}
      <div className="bg-white border-b-comic border-ink-black shadow-comic-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-stan-lee-blue hover:text-kirby-red transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-persona-aura font-semibold">Back to Collection</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cover Image */}
          <div className="lg:col-span-1">
            <div className="bg-white comic-border shadow-comic p-4 sticky top-24">
              <img
                src={comic.coverImage}
                alt={`${comic.title} ${comic.issue}`}
                className="w-full h-auto"
              />
              
              {/* Quick Actions */}
              <div className="mt-4 space-y-3">
                <button
                  onClick={() => setIsInWishlist(!isInWishlist)}
                  className={`w-full flex items-center justify-center space-x-2 py-3 border-comic border-ink-black shadow-comic-sm
                            transition-all duration-150 hover:translate-y-[-2px] hover:shadow-comic
                            ${isInWishlist ? 'bg-kirby-red text-parchment' : 'bg-white text-ink-black'}`}
                >
                  <Heart size={18} fill={isInWishlist ? 'currentColor' : 'none'} />
                  <span className="font-persona-aura font-semibold">
                    {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                  </span>
                </button>

                <button
                  onClick={() => setHasAlert(!hasAlert)}
                  className={`w-full flex items-center justify-center space-x-2 py-3 border-comic border-ink-black shadow-comic-sm
                            transition-all duration-150 hover:translate-y-[-2px] hover:shadow-comic
                            ${hasAlert ? 'bg-golden-age-yellow text-ink-black' : 'bg-white text-ink-black'}`}
                >
                  <Bell size={18} fill={hasAlert ? 'currentColor' : 'none'} />
                  <span className="font-persona-aura font-semibold">
                    {hasAlert ? 'Alert Set' : 'Set Price Alert'}
                  </span>
                </button>

                <button className="w-full comic-button flex items-center justify-center space-x-2">
                  <ShoppingCart size={18} />
                  <span>Find on eBay</span>
                </button>

                <button className="w-full flex items-center justify-center space-x-2 py-3 text-stan-lee-blue hover:text-kirby-red transition-colors">
                  <Share2 size={18} />
                  <span className="font-persona-aura font-semibold">Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white comic-border shadow-comic p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-golden-age-yellow text-ink-black px-3 py-1 text-xs font-super-squad uppercase border-2 border-ink-black">
                      {comic.publisher}
                    </span>
                    {comic.isKeyIssue && (
                      <span className="bg-kirby-red text-parchment px-3 py-1 text-xs font-super-squad uppercase border-2 border-ink-black">
                        KEY ISSUE
                      </span>
                    )}
                  </div>
                  <h1 className="font-super-squad text-4xl text-ink-black mb-2">
                    {comic.title} {comic.issue}
                  </h1>
                  <p className="font-persona-aura text-gray-600">
                    Published {comic.publishDate}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-super-squad text-3xl text-ink-black">
                    £{comic.currentValue.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-end space-x-1 text-green-600">
                    <TrendingUp size={16} />
                    <span className="font-persona-aura text-sm font-semibold">
                      +{comic.trendPercentage}% this month
                    </span>
                  </div>
                </div>
              </div>

              {comic.keyIssueReason && (
                <div className="bg-golden-age-yellow bg-opacity-20 border-2 border-golden-age-yellow p-4">
                  <div className="flex items-start space-x-2">
                    <Star size={20} className="text-golden-age-yellow mt-0.5" />
                    <div>
                      <p className="font-super-squad text-sm text-ink-black mb-1">KEY ISSUE</p>
                      <p className="font-persona-aura text-ink-black">
                        {comic.keyIssueReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white comic-border shadow-comic p-6">
              <h2 className="font-super-squad text-2xl text-ink-black mb-4">
                SYNOPSIS
              </h2>
              <p className="font-persona-aura text-gray-700 leading-relaxed">
                {comic.description}
              </p>
            </div>

            {/* Creators */}
            <div className="bg-white comic-border shadow-comic p-6">
              <h2 className="font-super-squad text-2xl text-ink-black mb-4">
                CREATIVE TEAM
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {comic.creators.map((creator) => (
                  <div key={creator.name} className="flex items-center space-x-3">
                    <User size={20} className="text-gray-400" />
                    <div>
                      <p className="font-persona-aura font-semibold text-ink-black">
                        {creator.name}
                      </p>
                      <p className="font-persona-aura text-sm text-gray-600">
                        {creator.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price by Condition */}
            <div className="bg-white comic-border shadow-comic p-6">
              <h2 className="font-super-squad text-2xl text-ink-black mb-4">
                MARKET VALUES BY CONDITION
              </h2>
              <div className="space-y-3">
                {comic.conditions.map((condition) => (
                  <button
                    key={condition.grade}
                    onClick={() => setSelectedCondition(condition.grade)}
                    className={`w-full p-4 border-2 transition-all duration-150
                              ${selectedCondition === condition.grade 
                                ? 'bg-golden-age-yellow border-ink-black shadow-comic translate-x-[-2px] translate-y-[-2px]' 
                                : 'bg-white border-gray-300 hover:border-ink-black hover:shadow-comic-sm'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-left">
                        <p className="font-persona-aura font-semibold text-ink-black">
                          {condition.grade}
                        </p>
                        <p className="font-persona-aura text-xs text-gray-600">
                          {COMIC_CONDITIONS.find(c => c.label.includes(condition.grade))?.grade}
                        </p>
                      </div>
                      <p className="font-super-squad text-xl text-ink-black">
                        £{condition.price.toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="bg-white comic-border shadow-comic p-6">
              <h2 className="font-super-squad text-2xl text-ink-black mb-4">
                COMIC DETAILS
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <BookOpen size={18} className="text-gray-400" />
                    <span className="font-persona-aura text-gray-600">Page Count:</span>
                    <span className="font-persona-aura font-semibold text-ink-black">
                      {comic.pageCount}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar size={18} className="text-gray-400" />
                    <span className="font-persona-aura text-gray-600">Format:</span>
                    <span className="font-persona-aura font-semibold text-ink-black">
                      {comic.format}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Tag size={18} className="text-gray-400" />
                    <span className="font-persona-aura text-gray-600">Issue:</span>
                    <span className="font-persona-aura font-semibold text-ink-black">
                      #{comic.issueNumber}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign size={18} className="text-gray-400" />
                    <span className="font-persona-aura text-gray-600">Trend:</span>
                    <span className="font-persona-aura font-semibold text-green-600">
                      Rising
                    </span>
                  </div>
                </div>
              </div>

              {/* Characters */}
              <div className="mt-6 pt-6 border-t-2 border-gray-200">
                <p className="font-persona-aura text-gray-600 mb-3">Characters:</p>
                <div className="flex flex-wrap gap-2">
                  {comic.characters.map((character) => (
                    <span
                      key={character}
                      className="px-3 py-1 bg-stan-lee-blue text-parchment text-xs font-persona-aura font-semibold border-2 border-ink-black shadow-comic-sm"
                    >
                      {character}
                    </span>
                  ))}
                </div>
              </div>

              {/* Story Arcs */}
              {comic.storyArcs.length > 0 && (
                <div className="mt-4">
                  <p className="font-persona-aura text-gray-600 mb-3">Story Arcs:</p>
                  <div className="flex flex-wrap gap-2">
                    {comic.storyArcs.map((arc) => (
                      <span
                        key={arc}
                        className="px-3 py-1 bg-kirby-red text-parchment text-xs font-persona-aura font-semibold border-2 border-ink-black shadow-comic-sm"
                      >
                        {arc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComicDetailPage
