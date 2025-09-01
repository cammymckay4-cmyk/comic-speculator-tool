import React, { useState } from 'react'
import { 
  TrendingUp, 
  Calendar, 
  Tag, 
  Bookmark,
  Share2,
  Filter,
  Search
} from 'lucide-react'
import NewsCard from '@/components/ui/NewsCard'
import SearchBar from '@/components/features/SearchBar'
import Pagination from '@/components/features/Pagination'

// Mock news data
const mockNewsArticles = [
  {
    id: '1',
    title: 'Marvel Announces Phase 6 Comic Tie-Ins',
    excerpt: 'Following the success of their cinematic universe, Marvel Comics unveils an ambitious slate of comics that will directly tie into upcoming MCU Phase 6 films, featuring exclusive first appearances and key storylines.',
    date: '2 hours ago',
    category: 'Publisher News',
    image: 'https://via.placeholder.com/400x200/D62828/FDF6E3?text=Marvel+News',
    author: 'Sarah Mitchell',
    readTime: '5 min read',
    tags: ['Marvel', 'MCU', 'Phase 6'],
    trending: true,
  },
  {
    id: '2',
    title: 'Record-Breaking Sale: Action Comics #1 Fetches £4.2M',
    excerpt: 'A pristine copy of Action Comics #1, featuring the first appearance of Superman, has shattered previous records at Heritage Auctions, becoming the most expensive comic book ever sold.',
    date: '1 day ago',
    category: 'Market Trends',
    image: 'https://via.placeholder.com/400x200/003049/FDF6E3?text=Record+Sale',
    author: 'James Cooper',
    readTime: '3 min read',
    tags: ['Superman', 'Auction', 'Record'],
    trending: true,
  },
  {
    id: '3',
    title: 'DC Black Label Announces Horror Anthology Series',
    excerpt: 'DC\'s mature readers imprint reveals "Nightmare Editions," a new horror anthology featuring reimagined versions of classic DC heroes in terrifying new scenarios.',
    date: '2 days ago',
    category: 'New Releases',
    image: 'https://via.placeholder.com/400x200/1C1C1C/FDF6E3?text=DC+Horror',
    author: 'Mike Davidson',
    readTime: '4 min read',
    tags: ['DC Comics', 'Black Label', 'Horror'],
    trending: false,
  },
  {
    id: '4',
    title: 'Todd McFarlane Returns to Interior Art for Spawn #350',
    excerpt: 'After years focusing on covers and writing, Todd McFarlane announces his return to full interior artwork for the milestone Spawn #350, promising "the most detailed work of my career."',
    date: '3 days ago',
    category: 'Creator News',
    image: 'https://via.placeholder.com/400x200/8B0000/FDF6E3?text=Spawn+350',
    author: 'Lisa Chen',
    readTime: '6 min read',
    tags: ['Spawn', 'Todd McFarlane', 'Image Comics'],
    trending: false,
  },
  {
    id: '5',
    title: 'Indie Publisher Boom! Studios Acquired by Penguin Random House',
    excerpt: 'In a surprising move that shakes up the comic industry landscape, Penguin Random House announces the acquisition of Boom! Studios, promising expanded distribution and new creative opportunities.',
    date: '3 days ago',
    category: 'Industry News',
    image: 'https://via.placeholder.com/400x200/F7B538/1C1C1C?text=Boom+Studios',
    author: 'Robert Hayes',
    readTime: '7 min read',
    tags: ['Boom Studios', 'Acquisition', 'Publishing'],
    trending: true,
  },
  {
    id: '6',
    title: 'Key Issue Alert: First Appearance of New Spider-Variant Causes Frenzy',
    excerpt: 'Spider-Man #127 sells out nationwide within hours as collectors scramble to secure the first appearance of Spider-UK, with secondary market prices already tripling.',
    date: '4 days ago',
    category: 'Market Trends',
    image: 'https://via.placeholder.com/400x200/FF0000/FDF6E3?text=Spider-UK',
    author: 'Emma Wilson',
    readTime: '3 min read',
    tags: ['Spider-Man', 'Key Issue', 'Marvel'],
    trending: true,
  },
]

const categories = [
  'All News',
  'Industry News',
  'New Releases',
  'Creator News',
  'Publisher News',
  'Market Trends',
  'Reviews',
  'Events',
]

const NewsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All News')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  
  const itemsPerPage = 6
  const filteredArticles = selectedCategory === 'All News' 
    ? mockNewsArticles 
    : mockNewsArticles.filter(article => article.category === selectedCategory)
  
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage)

  return (
    <div className="min-h-screen bg-parchment">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-stan-lee-blue to-kirby-red py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-super-squad text-5xl md:text-6xl text-parchment mb-4">
              COMIC NEWS HQ
            </h1>
            <p className="font-persona-aura text-xl text-parchment opacity-90 max-w-3xl mx-auto">
              Your daily dose of comic industry news, reviews, and insider scoops
            </p>
          </div>
        </div>
      </div>

      {/* Trending Bar */}
      <div className="bg-golden-age-yellow border-y-comic border-ink-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-4 overflow-x-auto">
            <div className="flex items-center space-x-2 flex-shrink-0">
              <TrendingUp size={18} className="text-kirby-red" />
              <span className="font-super-squad text-sm text-ink-black">TRENDING:</span>
            </div>
            {mockNewsArticles.filter(a => a.trending).map((article) => (
              <button
                key={article.id}
                className="flex-shrink-0 px-3 py-1 bg-white border-2 border-ink-black shadow-comic-sm hover:shadow-comic hover:translate-y-[-1px] transition-all"
              >
                <span className="font-persona-aura text-xs font-semibold text-ink-black">
                  {article.title.length > 40 ? article.title.substring(0, 40) + '...' : article.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="sticky top-16 z-30 bg-white border-b-comic border-ink-black shadow-comic">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search news articles..."
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`comic-button flex items-center justify-center space-x-2 ${showFilters ? 'bg-golden-age-yellow' : ''}`}
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-2 overflow-x-auto mt-4 pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 font-persona-aura font-semibold text-sm whitespace-nowrap transition-all
                          ${selectedCategory === category 
                            ? 'bg-kirby-red text-parchment border-comic border-ink-black shadow-comic translate-y-[-2px]' 
                            : 'bg-white text-ink-black border-2 border-gray-300 hover:border-ink-black hover:shadow-comic-sm'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Articles Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredArticles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Newsletter Signup */}
            <div className="bg-white comic-border shadow-comic p-6">
              <h3 className="font-super-squad text-xl text-ink-black mb-4">
                WEEKLY NEWSLETTER
              </h3>
              <p className="font-persona-aura text-sm text-gray-700 mb-4">
                Get the latest comic news delivered to your inbox every Friday!
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full comic-input"
                />
                <button type="submit" className="w-full comic-button">
                  Subscribe
                </button>
              </form>
            </div>

            {/* Popular Tags */}
            <div className="bg-white comic-border shadow-comic p-6">
              <h3 className="font-super-squad text-xl text-ink-black mb-4">
                POPULAR TAGS
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Marvel', 'DC Comics', 'Spider-Man', 'Batman', 'X-Men', 'Key Issues', 'Auctions', 'MCU', 'Image Comics', 'Indie'].map((tag) => (
                  <button
                    key={tag}
                    className="px-3 py-1 bg-golden-age-yellow text-ink-black border-2 border-ink-black shadow-comic-sm
                             hover:shadow-comic hover:translate-y-[-1px] transition-all font-persona-aura text-xs font-semibold"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Comments */}
            <div className="bg-white comic-border shadow-comic p-6">
              <h3 className="font-super-squad text-xl text-ink-black mb-4">
                COMMUNITY BUZZ
              </h3>
              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-200">
                  <p className="font-persona-aura text-sm text-gray-700 mb-1">
                    "Can't believe Action Comics #1 sold for that much!"
                  </p>
                  <p className="font-persona-aura text-xs text-gray-500">
                    - ComicFan42 on Record-Breaking Sale
                  </p>
                </div>
                <div className="pb-4 border-b border-gray-200">
                  <p className="font-persona-aura text-sm text-gray-700 mb-1">
                    "Finally! McFarlane back on interiors!"
                  </p>
                  <p className="font-persona-aura text-xs text-gray-500">
                    - SpawnCollector on Spawn #350
                  </p>
                </div>
                <div>
                  <p className="font-persona-aura text-sm text-gray-700 mb-1">
                    "Phase 6 tie-ins sound amazing!"
                  </p>
                  <p className="font-persona-aura text-xs text-gray-500">
                    - MarvelZombie on Marvel Announces...
                  </p>
                </div>
              </div>
            </div>

            {/* Advertisement Placeholder */}
            <div className="bg-gradient-to-br from-kirby-red to-stan-lee-blue p-8 text-center">
              <p className="font-super-squad text-2xl text-parchment mb-2">
                ADVERTISE HERE
              </p>
              <p className="font-persona-aura text-sm text-parchment opacity-90">
                Reach thousands of comic collectors
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsPage
