import React, { useState } from 'react'
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus,
  Download,
  Upload,
  SortAsc,
  Star
} from 'lucide-react'
import ComicCard from '@/components/ui/ComicCard'
import SearchBar from '@/components/features/SearchBar'
import FilterPanel from '@/components/features/FilterPanel'
import SortDropdown from '@/components/features/SortDropdown'
import Pagination from '@/components/features/Pagination'

// Mock collection data
const mockCollection = Array.from({ length: 24 }, (_, i) => ({
  id: `comic-${i + 1}`,
  title: ['Amazing Spider-Man', 'Batman', 'X-Men', 'Superman', 'The Walking Dead'][i % 5],
  issue: `#${Math.floor(Math.random() * 500) + 1}`,
  publisher: ['Marvel', 'DC', 'Image'][i % 3],
  coverImage: `https://via.placeholder.com/200x300/${['D62828', '003049', 'F7B538'][i % 3]}/FDF6E3?text=Comic+${i + 1}`,
  value: `£${Math.floor(Math.random() * 5000) + 100}`,
  trend: ['up', 'down', 'neutral'][i % 3] as 'up' | 'down' | 'neutral',
  change: `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 20)}%`,
  condition: ['Mint', 'Near Mint', 'Very Fine', 'Fine'][i % 4],
  purchasePrice: `£${Math.floor(Math.random() * 1000) + 50}`,
  purchaseDate: new Date(2023, i % 12, (i % 28) + 1).toLocaleDateString(),
}))

const CollectionPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSort, setSelectedSort] = useState('title')
  
  const itemsPerPage = 12
  const totalItems = mockCollection.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  // Calculate collection statistics
  const totalValue = mockCollection.reduce((sum, comic) => {
    const value = parseInt(comic.value.replace('£', '').replace(',', ''))
    return sum + value
  }, 0)
  
  const averageValue = Math.floor(totalValue / mockCollection.length)

  return (
    <div className="min-h-screen bg-parchment">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-stan-lee-blue to-kirby-red py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-super-squad text-4xl md:text-5xl text-parchment mb-4">
            MY COLLECTION
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-none border-2 border-parchment p-4">
              <p className="font-persona-aura text-parchment opacity-80 text-sm">Total Comics</p>
              <p className="font-super-squad text-2xl text-parchment">{mockCollection.length}</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-none border-2 border-parchment p-4">
              <p className="font-persona-aura text-parchment opacity-80 text-sm">Total Value</p>
              <p className="font-super-squad text-2xl text-parchment">£{totalValue.toLocaleString()}</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-none border-2 border-parchment p-4">
              <p className="font-persona-aura text-parchment opacity-80 text-sm">Average Value</p>
              <p className="font-super-squad text-2xl text-parchment">£{averageValue.toLocaleString()}</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-none border-2 border-parchment p-4">
              <p className="font-persona-aura text-parchment opacity-80 text-sm">Key Issues</p>
              <p className="font-super-squad text-2xl text-parchment">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="sticky top-16 z-30 bg-white border-b-comic border-ink-black shadow-comic">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left Section - Search and Filter */}
            <div className="flex-1 flex gap-4">
              <SearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search your collection..."
                className="flex-1"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`comic-button flex items-center space-x-2 ${showFilters ? 'bg-golden-age-yellow' : ''}`}
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>

            {/* Right Section - Sort and View Controls */}
            <div className="flex gap-4 items-center">
              <SortDropdown 
                value={selectedSort}
                onChange={setSelectedSort}
              />
              
              {/* View Mode Toggle */}
              <div className="flex border-comic border-ink-black shadow-comic-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-kirby-red text-parchment' : 'bg-white text-ink-black'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 border-l-2 border-ink-black ${viewMode === 'list' ? 'bg-kirby-red text-parchment' : 'bg-white text-ink-black'}`}
                >
                  <List size={18} />
                </button>
              </div>

              {/* Action Buttons */}
              <button className="comic-button flex items-center space-x-2">
                <Plus size={18} />
                <span className="hidden sm:inline">Add Comic</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel 
          onClose={() => setShowFilters(false)}
          onApply={(filters) => {
            console.log('Applied filters:', filters)
            setShowFilters(false)
          }}
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="flex gap-4 mb-6">
          <button className="flex items-center space-x-2 text-stan-lee-blue hover:text-kirby-red transition-colors">
            <Download size={18} />
            <span className="font-persona-aura font-semibold">Export Collection</span>
          </button>
          <button className="flex items-center space-x-2 text-stan-lee-blue hover:text-kirby-red transition-colors">
            <Upload size={18} />
            <span className="font-persona-aura font-semibold">Import Comics</span>
          </button>
          <button className="flex items-center space-x-2 text-stan-lee-blue hover:text-kirby-red transition-colors">
            <Star size={18} />
            <span className="font-persona-aura font-semibold">Wishlist (23)</span>
          </button>
        </div>

        {/* Comics Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockCollection.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((comic) => (
              <ComicCard key={comic.id} comic={comic} variant="detailed" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {mockCollection.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((comic) => (
              <div key={comic.id} className="bg-white comic-border shadow-comic p-4 flex items-center space-x-4 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform">
                <img
                  src={comic.coverImage}
                  alt={`${comic.title} ${comic.issue}`}
                  className="w-20 h-28 object-cover border-2 border-ink-black"
                />
                <div className="flex-1">
                  <h3 className="font-super-squad text-lg text-ink-black">{comic.title} {comic.issue}</h3>
                  <p className="font-persona-aura text-sm text-gray-600">{comic.publisher} • {comic.condition}</p>
                  <p className="font-persona-aura text-sm text-gray-600">Purchased: {comic.purchaseDate} for {comic.purchasePrice}</p>
                </div>
                <div className="text-right">
                  <p className="font-super-squad text-xl text-ink-black">{comic.value}</p>
                  <p className={`font-persona-aura text-sm ${comic.trend === 'up' ? 'text-green-600' : comic.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                    {comic.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-12">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  )
}

export default CollectionPage
