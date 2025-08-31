import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Star, User, Bell, Menu, X, ChevronDown, Plus, Heart, TrendingUp, Award, Settings, BookOpen, Zap } from 'lucide-react';

// Types for the application
interface Comic {
  id: string;
  title: string;
  issue: string;
  series: string;
  cover: string;
  price: number;
  grade: string;
  value: number;
  trending: boolean;
  owned?: boolean;
  wishlist?: boolean;
}

interface AlertSetting {
  id: string;
  title: string;
  condition: string;
  enabled: boolean;
}

// Sample data
const sampleComics: Comic[] = [
  {
    id: '1',
    title: 'Amazing Spider-Man',
    issue: '#1',
    series: 'Amazing Spider-Man',
    cover: '/api/placeholder/200/300',
    price: 1250.00,
    grade: 'CGC 9.2',
    value: 1500.00,
    trending: true,
    owned: false,
    wishlist: true
  },
  {
    id: '2', 
    title: 'X-Men',
    issue: '#1',
    series: 'X-Men',
    cover: '/api/placeholder/200/300',
    price: 850.00,
    grade: 'CGC 8.5',
    value: 1200.00,
    trending: true,
    owned: true,
    wishlist: false
  },
  {
    id: '3',
    title: 'Batman',
    issue: '#1',
    series: 'Batman',
    cover: '/api/placeholder/200/300',
    price: 3200.00,
    grade: 'CGC 7.0',
    value: 4000.00,
    trending: false,
    owned: false,
    wishlist: true
  }
];

const alertSettings: AlertSetting[] = [
  { id: '1', title: 'Spider-Man #1 under £1000', condition: 'price < £1000', enabled: true },
  { id: '2', title: 'X-Men Grade 9.0+ available', condition: 'grade >= 9.0', enabled: true },
  { id: '3', title: 'Batman collection complete', condition: 'series complete', enabled: false }
];

// Navigation Component
const Navigation: React.FC<{ currentPage: string; onPageChange: (page: string) => void; isMobile: boolean }> = ({
  currentPage,
  onPageChange,
  isMobile
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: BookOpen },
    { id: 'collection', label: 'Collection', icon: Grid },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'account', label: 'Account', icon: User }
  ];

  if (isMobile) {
    return (
      <nav className="comic-nav relative">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-golden-age-yellow" />
            <span className="text-xl font-bold text-white">ComicScoutUK</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:text-golden-age-yellow"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-stan-lee-blue border-t-2 border-ink-black z-50">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-6 py-4 text-left hover:bg-golden-age-yellow hover:text-ink-black transition-colors ${
                    currentPage === item.id ? 'bg-golden-age-yellow text-ink-black' : 'text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>
    );
  }

  return (
    <nav className="comic-nav">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6">
        <div className="flex items-center space-x-2">
          <Zap className="h-8 w-8 text-golden-age-yellow" />
          <span className="text-2xl font-bold text-white">ComicScoutUK</span>
        </div>
        
        <div className="flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-none border-0 transition-all ${
                  currentPage === item.id
                    ? 'bg-golden-age-yellow text-ink-black shadow-md transform -translate-y-1'
                    : 'text-white hover:bg-golden-age-yellow hover:text-ink-black hover:transform hover:-translate-y-1'
                }`}
              >
                <Icon size={20} />
                <span className="font-bold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

// Comic Card Component
const ComicCard: React.FC<{ comic: Comic; onClick: () => void }> = ({ comic, onClick }) => (
  <div className="comic-card p-4 cursor-pointer" onClick={onClick}>
    <div className="relative mb-4">
      <img 
        src={comic.cover} 
        alt={`${comic.title} ${comic.issue}`}
        className="w-full h-64 object-cover border-2 border-ink-black"
      />
      {comic.trending && (
        <div className="absolute top-2 left-2 bg-kirby-red text-white px-2 py-1 text-xs font-bold">
          TRENDING
        </div>
      )}
      <div className="absolute top-2 right-2 flex space-x-1">
        {comic.owned && (
          <div className="bg-golden-age-yellow text-ink-black p-1 rounded">
            <Star size={16} fill="currentColor" />
          </div>
        )}
        {comic.wishlist && (
          <div className="bg-stan-lee-blue text-white p-1 rounded">
            <Heart size={16} fill="currentColor" />
          </div>
        )}
      </div>
    </div>
    
    <h3 className="font-bold text-lg mb-1 text-comic-shadow">{comic.title} {comic.issue}</h3>
    <p className="text-sm text-gray-600 mb-2">{comic.series}</p>
    <p className="text-sm font-medium mb-2">{comic.grade}</p>
    
    <div className="flex justify-between items-center">
      <span className="text-lg font-bold text-kirby-red">£{comic.price.toFixed(2)}</span>
      <span className="text-sm text-green-600">Value: £{comic.value.toFixed(2)}</span>
    </div>
  </div>
);

// Home Page Component
const HomePage: React.FC<{ onComicSelect: (comic: Comic) => void }> = ({ onComicSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredComics = sampleComics.filter(comic =>
    comic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comic.series.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredComics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedComics = filteredComics.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-parchment">
      {/* Hero Section */}
      <div className="bg-stan-lee-blue text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl font-bold mb-4 text-comic-shadow">
            Find Your Next Comic Treasure
          </h1>
          <p className="text-xl mb-8 opacity-90">
            The UK's premier platform for comic collectors and speculators
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="flex bg-white border-3 border-ink-black shadow-lg">
              <input
                type="text"
                placeholder="Search for comics, series, or issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-6 py-4 text-ink-black text-lg focus:outline-none"
              />
              <button className="comic-button px-6 border-l-3 border-ink-black">
                <Search size={24} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Comic book style background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-golden-age-yellow transform rotate-12"></div>
          <div className="absolute top-20 right-20 w-24 h-24 border-4 border-kirby-red transform -rotate-12"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 border-4 border-golden-age-yellow transform rotate-45"></div>
        </div>
      </div>

      {/* Filters and View Controls */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="comic-button flex items-center space-x-2"
            >
              <Filter size={20} />
              <span>Filters</span>
              <ChevronDown size={16} className={`transform transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <span className="text-ink-black font-medium">
              {filteredComics.length} comics found
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 border-2 border-ink-black ${viewMode === 'grid' ? 'bg-golden-age-yellow' : 'bg-white'}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 border-2 border-ink-black ${viewMode === 'list' ? 'bg-golden-age-yellow' : 'bg-white'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <div className="comic-panel mb-6">
            <h3 className="text-xl font-bold mb-4">Filter Comics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block font-medium mb-2">Series</label>
                <select className="comic-input w-full">
                  <option>All Series</option>
                  <option>Amazing Spider-Man</option>
                  <option>X-Men</option>
                  <option>Batman</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-2">Grade</label>
                <select className="comic-input w-full">
                  <option>All Grades</option>
                  <option>CGC 9.8+</option>
                  <option>CGC 9.0+</option>
                  <option>CGC 8.0+</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-2">Price Range</label>
                <select className="comic-input w-full">
                  <option>All Prices</option>
                  <option>Under £500</option>
                  <option>£500 - £1000</option>
                  <option>£1000+</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-2">Status</label>
                <select className="comic-input w-full">
                  <option>All</option>
                  <option>Available</option>
                  <option>Owned</option>
                  <option>Wishlist</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Comics Grid */}
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'
          : 'space-y-4 mb-8'
        }>
          {paginatedComics.map((comic) => (
            <ComicCard 
              key={comic.id} 
              comic={comic} 
              onClick={() => onComicSelect(comic)} 
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="comic-button disabled:opacity-50"
            >
              Previous
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 border-2 border-ink-black font-bold ${
                    currentPage === page ? 'bg-golden-age-yellow' : 'bg-white hover:bg-golden-age-yellow'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="comic-button disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Collection Page Component
const CollectionPage: React.FC<{ onComicSelect: (comic: Comic) => void }> = ({ onComicSelect }) => {
  const [activeTab, setActiveTab] = useState<'owned' | 'wishlist'>('owned');
  
  const ownedComics = sampleComics.filter(comic => comic.owned);
  const wishlistComics = sampleComics.filter(comic => comic.wishlist);
  
  const totalValue = ownedComics.reduce((sum, comic) => sum + comic.value, 0);

  return (
    <div className="min-h-screen bg-parchment py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-stan-lee-blue mb-4 text-comic-shadow">
            My Collection
          </h1>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="comic-card p-6 text-center">
              <div className="text-3xl font-bold text-stan-lee-blue mb-2">{ownedComics.length}</div>
              <div className="text-gray-600">Comics Owned</div>
            </div>
            <div className="comic-card p-6 text-center">
              <div className="text-3xl font-bold text-kirby-red mb-2">£{totalValue.toFixed(2)}</div>
              <div className="text-gray-600">Collection Value</div>
            </div>
            <div className="comic-card p-6 text-center">
              <div className="text-3xl font-bold text-golden-age-yellow mb-2">{wishlistComics.length}</div>
              <div className="text-gray-600">Wishlist Items</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('owned')}
            className={`px-6 py-3 font-bold border-2 border-ink-black ${
              activeTab === 'owned' 
                ? 'bg-golden-age-yellow text-ink-black shadow-md' 
                : 'bg-white text-ink-black hover:bg-golden-age-yellow'
            }`}
          >
            Owned Comics ({ownedComics.length})
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-6 py-3 font-bold border-2 border-ink-black ${
              activeTab === 'wishlist' 
                ? 'bg-golden-age-yellow text-ink-black shadow-md' 
                : 'bg-white text-ink-black hover:bg-golden-age-yellow'
            }`}
          >
            Wishlist ({wishlistComics.length})
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === 'owned' ? ownedComics : wishlistComics).map((comic) => (
            <ComicCard 
              key={comic.id} 
              comic={comic} 
              onClick={() => onComicSelect(comic)} 
            />
          ))}
        </div>

        {/* Add Comic Button */}
        <div className="fixed bottom-8 right-8">
          <button className="comic-button-primary rounded-full p-4 shadow-lg">
            <Plus size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Comic Detail Page Component  
const ComicDetailPage: React.FC<{ comic: Comic; onBack: () => void }> = ({ comic, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'market' | 'history'>('overview');
  
  return (
    <div className="min-h-screen bg-parchment py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <button onClick={onBack} className="comic-button mb-6">
          ← Back to Comics
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Comic Cover */}
          <div className="comic-card p-6">
            <img 
              src={comic.cover} 
              alt={`${comic.title} ${comic.issue}`}
              className="w-full max-w-md mx-auto border-2 border-ink-black"
            />
          </div>

          {/* Comic Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-stan-lee-blue mb-2 text-comic-shadow">
                {comic.title} {comic.issue}
              </h1>
              <p className="text-xl text-gray-600 mb-4">{comic.series}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="comic-card p-4 text-center">
                  <div className="text-2xl font-bold text-kirby-red">{comic.grade}</div>
                  <div className="text-sm text-gray-600">Grade</div>
                </div>
                <div className="comic-card p-4 text-center">
                  <div className="text-2xl font-bold text-golden-age-yellow">£{comic.value.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Market Value</div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                {!comic.owned && (
                  <button className="comic-button-primary flex-1">
                    Add to Collection
                  </button>
                )}
                {!comic.wishlist && (
                  <button className="comic-button flex-1">
                    Add to Wishlist
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {['overview', 'market', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 font-bold border-2 border-ink-black capitalize ${
                activeTab === tab 
                  ? 'bg-golden-age-yellow text-ink-black shadow-md' 
                  : 'bg-white text-ink-black hover:bg-golden-age-yellow'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="comic-panel">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Comic Overview</h3>
              <p className="text-gray-700 mb-4">
                This is a classic issue from the {comic.series} series. Known for its iconic cover and 
                significant storyline impact, this comic has become a cornerstone for collectors.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold mb-2">Key Details:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• First appearance of major character</li>
                    <li>• Historic storyline significance</li>
                    <li>• Limited print run</li>
                    <li>• High collector demand</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Condition Notes:</h4>
                  <p className="text-sm text-gray-600">
                    Graded by CGC with excellent centering and sharp corners. 
                    Minor wear consistent with grade.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'market' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Market Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="comic-card p-4">
                  <h4 className="font-bold text-stan-lee-blue mb-2">Price Trend</h4>
                  <div className="text-green-600 font-bold text-lg">↗ +12.5% (30 days)</div>
                  <p className="text-sm text-gray-600">Showing strong upward momentum</p>
                </div>
                <div className="comic-card p-4">
                  <h4 className="font-bold text-stan-lee-blue mb-2">Market Activity</h4>
                  <div className="text-blue-600 font-bold text-lg">23 Sales (30 days)</div>
                  <p className="text-sm text-gray-600">High liquidity</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'history' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Price History</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border border-gray-200">
                  <div>
                    <div className="font-medium">eBay Sale</div>
                    <div className="text-sm text-gray-600">CGC 9.2 • 2 days ago</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">£1,450</div>
                    <div className="text-sm text-green-600">+3.2%</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 border border-gray-200">
                  <div>
                    <div className="font-medium">Heritage Auction</div>
                    <div className="text-sm text-gray-600">CGC 9.2 • 1 week ago</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">£1,380</div>
                    <div className="text-sm text-red-600">-2.1%</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Alerts Page Component
const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState(alertSettings);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({ title: '', condition: '' });

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ));
  };

  const addAlert = () => {
    if (newAlert.title && newAlert.condition) {
      const newAlertItem: AlertSetting = {
        id: Date.now().toString(),
        title: newAlert.title,
        condition: newAlert.condition,
        enabled: true
      };
      setAlerts([...alerts, newAlertItem]);
      setNewAlert({ title: '', condition: '' });
      setShowAddAlert(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-stan-lee-blue text-comic-shadow">
            Alert Settings
          </h1>
          <button
            onClick={() => setShowAddAlert(true)}
            className="comic-button-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>New Alert</span>
          </button>
        </div>

        {/* Active Alerts */}
        <div className="space-y-4 mb-8">
          {alerts.map((alert) => (
            <div key={alert.id} className="comic-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-stan-lee-blue mb-1">
                    {alert.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Condition: {alert.condition}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 text-sm font-bold border-2 border-ink-black ${
                    alert.enabled ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {alert.enabled ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                  
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={`px-4 py-2 font-bold border-2 border-ink-black ${
                      alert.enabled 
                        ? 'bg-kirby-red text-white hover:bg-red-700' 
                        : 'bg-golden-age-yellow text-ink-black hover:bg-yellow-500'
                    }`}
                  >
                    {alert.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Alert Modal */}
        {showAddAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="comic-card max-w-md w-full mx-4 p-6">
              <h3 className="text-xl font-bold text-stan-lee-blue mb-4">Create New Alert</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-2">Alert Name</label>
                  <input
                    type="text"
                    value={newAlert.title}
                    onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                    className="comic-input w-full"
                    placeholder="e.g., Spider-Man #1 under £1000"
                  />
                </div>
                
                <div>
                  <label className="block font-medium mb-2">Condition</label>
                  <input
                    type="text"
                    value={newAlert.condition}
                    onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
                    className="comic-input w-full"
                    placeholder="e.g., price < £1000 AND grade >= 8.0"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={addAlert}
                  className="comic-button-primary flex-1"
                >
                  Create Alert
                </button>
                <button
                  onClick={() => setShowAddAlert(false)}
                  className="comic-button flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Notifications */}
        <div className="comic-panel">
          <h3 className="text-xl font-bold text-stan-lee-blue mb-4">Recent Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center p-4 border border-gray-200 rounded">
              <Bell className="text-golden-age-yellow mr-3" size={20} />
              <div className="flex-1">
                <div className="font-medium">Spider-Man #1 CGC 9.0 available for £950</div>
                <div className="text-sm text-gray-600">2 hours ago</div>
              </div>
            </div>
            <div className="flex items-center p-4 border border-gray-200 rounded">
              <TrendingUp className="text-kirby-red mr-3" size={20} />
              <div className="flex-1">
                <div className="font-medium">X-Men #1 value increased by 8%</div>
                <div className="text-sm text-gray-600">1 day ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Account Hub Page Component
const AccountHubPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'profile' | 'trophies' | 'settings'>('profile');
  
  const achievements = [
    { name: 'First Comic Added', description: 'Added your first comic to collection', earned: true },
    { name: 'Collector', description: 'Own 10 or more comics', earned: true },
    { name: 'High Value Owner', description: 'Collection worth over £1,000', earned: false },
    { name: 'Series Completionist', description: 'Complete a full comic series', earned: false }
  ];

  return (
    <div className="min-h-screen bg-parchment py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <h1 className="text-4xl font-bold text-stan-lee-blue mb-8 text-comic-shadow">
          Account Hub
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="comic-card p-6 sticky top-8">
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'trophies', label: 'Trophies', icon: Award },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id as any)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left font-medium border-2 border-ink-black ${
                        activeSection === item.id
                          ? 'bg-golden-age-yellow text-ink-black shadow-md'
                          : 'bg-white text-ink-black hover:bg-golden-age-yellow'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <div className="comic-card p-6">
                  <h3 className="text-xl font-bold text-stan-lee-blue mb-4">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-medium mb-2">Display Name</label>
                      <input className="comic-input w-full" value="Comic Collector" readOnly />
                    </div>
                    <div>
                      <label className="block font-medium mb-2">Email</label>
                      <input className="comic-input w-full" value="collector@example.com" readOnly />
                    </div>
                    <div>
                      <label className="block font-medium mb-2">Member Since</label>
                      <input className="comic-input w-full" value="January 2024" readOnly />
                    </div>
                    <div>
                      <label className="block font-medium mb-2">Location</label>
                      <input className="comic-input w-full" value="London, UK" readOnly />
                    </div>
                  </div>
                  <button className="comic-button-primary mt-4">Update Profile</button>
                </div>

                <div className="comic-card p-6">
                  <h3 className="text-xl font-bold text-stan-lee-blue mb-4">Collection Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-stan-lee-blue">15</div>
                      <div className="text-sm text-gray-600">Comics Owned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-kirby-red">£2,450</div>
                      <div className="text-sm text-gray-600">Total Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-golden-age-yellow">8</div>
                      <div className="text-sm text-gray-600">Wishlist Items</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">+12%</div>
                      <div className="text-sm text-gray-600">30-Day Growth</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'trophies' && (
              <div className="comic-card p-6">
                <h3 className="text-xl font-bold text-stan-lee-blue mb-4">Achievement Trophies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <div 
                      key={index}
                      className={`p-4 border-2 border-ink-black ${
                        achievement.earned ? 'bg-golden-age-yellow' : 'bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Award 
                          size={32} 
                          className={achievement.earned ? 'text-stan-lee-blue' : 'text-gray-400'} 
                        />
                        <div>
                          <div className={`font-bold ${achievement.earned ? 'text-ink-black' : 'text-gray-500'}`}>
                            {achievement.name}
                          </div>
                          <div className={`text-sm ${achievement.earned ? 'text-ink-black' : 'text-gray-500'}`}>
                            {achievement.description}
                          </div>
                        </div>
                      </div>
                      {achievement.earned && (
                        <div className="text-xs text-stan-lee-blue mt-2 font-bold">
                          ✓ EARNED
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="space-y-6">
                <div className="comic-card p-6">
                  <h3 className="text-xl font-bold text-stan-lee-blue mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    {[
                      'Email notifications for new alerts',
                      'Weekly collection value reports',
                      'New comic release announcements',
                      'Price drop notifications'
                    ].map((setting, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{setting}</span>
                        <input type="checkbox" className="w-5 h-5" defaultChecked={index < 2} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="comic-card p-6">
                  <h3 className="text-xl font-bold text-stan-lee-blue mb-4">Privacy Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Make collection public</span>
                      <input type="checkbox" className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Allow others to see wishlist</span>
                      <input type="checkbox" className="w-5 h-5" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Show real purchase prices</span>
                      <input type="checkbox" className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="comic-card p-6">
                  <h3 className="text-xl font-bold text-stan-lee-blue mb-4">Account Actions</h3>
                  <div className="flex space-x-4">
                    <button className="comic-button">Export Data</button>
                    <button className="comic-button-danger">Delete Account</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const ComicScoutUKApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleComicSelect = (comic: Comic) => {
    setSelectedComic(comic);
    setCurrentPage('detail');
  };

  const handleBackFromDetail = () => {
    setSelectedComic(null);
    setCurrentPage('home');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-center">
          <div className="loading-comic mb-4">
            <Zap size={64} className="text-stan-lee-blue mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-stan-lee-blue">Loading ComicScoutUK...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment">
      <Navigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
        isMobile={isMobile}
      />
      
      {currentPage === 'home' && (
        <HomePage onComicSelect={handleComicSelect} />
      )}
      
      {currentPage === 'collection' && (
        <CollectionPage onComicSelect={handleComicSelect} />
      )}
      
      {currentPage === 'detail' && selectedComic && (
        <ComicDetailPage comic={selectedComic} onBack={handleBackFromDetail} />
      )}
      
      {currentPage === 'alerts' && <AlertsPage />}
      
      {currentPage === 'account' && <AccountHubPage />}
    </div>
  );
};

export default ComicScoutUKApp;