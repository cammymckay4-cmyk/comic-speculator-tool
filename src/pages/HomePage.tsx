import React, { useState } from 'react'
import { 
  TrendingUp, 
  Star, 
  AlertCircle, 
  DollarSign,
  ArrowRight,
  Zap,
  Trophy,
  Users,
  BarChart3,
  Clock
} from 'lucide-react'
import ComicCard from '@/components/ui/ComicCard'
import StatsCard from '@/components/ui/StatsCard'
import NewsCard from '@/components/ui/NewsCard'
import { COMIC_EFFECTS } from '@/utils/constants'

// Mock data for demonstration
const mockTrendingComics = [
  {
    id: '1',
    title: 'Amazing Spider-Man',
    issue: '#1',
    publisher: 'Marvel',
    coverImage: 'https://via.placeholder.com/200x300/D62828/FDF6E3?text=Spider-Man',
    value: '£2,500',
    trend: 'up' as const,
    change: '+12%',
  },
  {
    id: '2',
    title: 'Batman',
    issue: '#423',
    publisher: 'DC',
    coverImage: 'https://via.placeholder.com/200x300/003049/FDF6E3?text=Batman',
    value: '£850',
    trend: 'up' as const,
    change: '+8%',
  },
  {
    id: '3',
    title: 'X-Men',
    issue: '#94',
    publisher: 'Marvel',
    coverImage: 'https://via.placeholder.com/200x300/F7B538/1C1C1C?text=X-Men',
    value: '£1,200',
    trend: 'down' as const,
    change: '-3%',
  },
  {
    id: '4',
    title: 'The Walking Dead',
    issue: '#1',
    publisher: 'Image',
    coverImage: 'https://via.placeholder.com/200x300/1C1C1C/FDF6E3?text=TWD',
    value: '£3,100',
    trend: 'up' as const,
    change: '+15%',
  },
]

const mockNews = [
  {
    id: '1',
    title: 'Marvel Announces New Spider-Man Series',
    excerpt: 'A fresh take on the web-slinger coming this summer with acclaimed writer...',
    date: '2 hours ago',
    category: 'New Releases',
    image: 'https://via.placeholder.com/400x200/D62828/FDF6E3?text=News',
  },
  {
    id: '2',
    title: 'Comic Con 2024 Exclusive Reveals',
    excerpt: 'Major announcements and exclusive variants unveiled at this year\'s convention...',
    date: '5 hours ago',
    category: 'Events',
    image: 'https://via.placeholder.com/400x200/003049/FDF6E3?text=Comic+Con',
  },
  {
    id: '3',
    title: 'Key Issue Alert: First Appearance Skyrockets',
    excerpt: 'Recent MCU announcement causes 300% price increase for this key issue...',
    date: '1 day ago',
    category: 'Market Trends',
    image: 'https://via.placeholder.com/400x200/F7B538/1C1C1C?text=Key+Issue',
  },
]

const HomePage: React.FC = () => {
  const [selectedEffect] = useState(COMIC_EFFECTS[Math.floor(Math.random() * COMIC_EFFECTS.length)])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-stan-lee-blue to-kirby-red py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-super-squad text-5xl md:text-7xl text-parchment mb-6 animate-fade-in">
              {selectedEffect} WELCOME TO COMICSCOUT UK
            </h1>
            <p className="font-persona-aura text-xl text-parchment opacity-90 mb-8 max-w-3xl mx-auto">
              Track your collection, discover rare issues, and stay ahead of the market with the UK's premier comic management platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="comic-button flex items-center justify-center space-x-2">
                <Star size={20} />
                <span>Start Your Collection</span>
              </button>
              <button className="comic-button-secondary flex items-center justify-center space-x-2">
                <TrendingUp size={20} />
                <span>View Market Trends</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-parchment">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Comics"
              value="12,847"
              change="+234 this week"
              icon={<BarChart3 />}
              trend="up"
            />
            <StatsCard
              title="Active Users"
              value="3,421"
              change="+12% growth"
              icon={<Users />}
              trend="up"
            />
            <StatsCard
              title="Price Alerts"
              value="8,923"
              change="423 triggered today"
              icon={<AlertCircle />}
              trend="neutral"
            />
            <StatsCard
              title="Market Value"
              value="£2.4M"
              change="+5.2% this month"
              icon={<DollarSign />}
              trend="up"
            />
          </div>
        </div>
      </section>

      {/* Trending Comics Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-super-squad text-3xl text-ink-black">
              🔥 HOT THIS WEEK
            </h2>
            <button className="flex items-center space-x-2 text-stan-lee-blue hover:text-kirby-red transition-colors">
              <span className="font-persona-aura font-semibold">View All</span>
              <ArrowRight size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockTrendingComics.map((comic) => (
              <ComicCard key={comic.id} comic={comic} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-golden-age-yellow to-yellow-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-super-squad text-3xl text-ink-black text-center mb-12">
            SUPER POWERS AT YOUR FINGERTIPS
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white comic-border shadow-comic p-6 hover:translate-y-[-4px] transition-transform">
              <div className="bg-kirby-red w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Zap size={24} className="text-parchment" />
              </div>
              <h3 className="font-super-squad text-xl text-ink-black mb-2">
                INSTANT VALUATION
              </h3>
              <p className="font-persona-aura text-ink-black opacity-80">
                Get real-time market values for your entire collection with our advanced pricing engine.
              </p>
            </div>

            <div className="bg-white comic-border shadow-comic p-6 hover:translate-y-[-4px] transition-transform">
              <div className="bg-stan-lee-blue w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Trophy size={24} className="text-parchment" />
              </div>
              <h3 className="font-super-squad text-xl text-ink-black mb-2">
                COLLECTION TRACKER
              </h3>
              <p className="font-persona-aura text-ink-black opacity-80">
                Organize, catalog, and showcase your comics with our intuitive management system.
              </p>
            </div>

            <div className="bg-white comic-border shadow-comic p-6 hover:translate-y-[-4px] transition-transform">
              <div className="bg-golden-age-yellow w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Clock size={24} className="text-ink-black" />
              </div>
              <h3 className="font-super-squad text-xl text-ink-black mb-2">
                PRICE ALERTS
              </h3>
              <p className="font-persona-aura text-ink-black opacity-80">
                Never miss a deal with customizable alerts for your wishlist items.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-16 bg-parchment">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-super-squad text-3xl text-ink-black">
              📰 LATEST NEWS
            </h2>
            <button className="flex items-center space-x-2 text-stan-lee-blue hover:text-kirby-red transition-colors">
              <span className="font-persona-aura font-semibold">Read More</span>
              <ArrowRight size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockNews.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-ink-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-super-squad text-4xl text-golden-age-yellow mb-6">
            READY TO BECOME A COMIC LEGEND?
          </h2>
          <p className="font-persona-aura text-xl text-parchment opacity-90 mb-8">
            Join thousands of collectors who trust ComicScoutUK to manage their collections.
          </p>
          <button className="comic-button text-lg px-8 py-4">
            START FREE TRIAL
          </button>
        </div>
      </section>
    </div>
  )
}

export default HomePage
