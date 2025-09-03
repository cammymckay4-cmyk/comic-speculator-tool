import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  Star,
  BookOpen,
  DollarSign,
  User as UserIcon,
  MapPin,
  Clock,
  Badge
} from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { fetchUserProfileByUsername } from '@/services/userProfileService'

const UserProfilePage: React.FC = () => {
  const { username } = useParams()
  const navigate = useNavigate()

  const { data: userProfile, isLoading, isError, error } = useQuery({
    queryKey: ['user-profile', username],
    queryFn: () => fetchUserProfileByUsername(username!),
    enabled: !!username,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading user profile..." />
      </div>
    )
  }

  if (isError || !userProfile) {
    return (
      <div className="min-h-screen bg-parchment">
        <div className="bg-white border-b-comic border-ink-black shadow-comic-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-stan-lee-blue hover:text-kirby-red transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-persona-aura font-semibold">Back</span>
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white comic-border shadow-comic p-8 text-center">
            <UserIcon size={48} className="text-kirby-red mx-auto mb-4" />
            <h1 className="font-super-squad text-2xl text-ink-black mb-2">
              User Not Found
            </h1>
            <p className="font-persona-aura text-gray-600 mb-6">
              {error instanceof Error ? error.message : 'The user profile you\'re looking for could not be found.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="comic-button"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { user, stats } = userProfile

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
            <span className="font-persona-aura font-semibold">Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white comic-border shadow-comic p-8 mb-8">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.name}'s avatar`}
                  className="w-24 h-24 rounded-full border-comic border-ink-black shadow-comic"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-golden-age-yellow border-comic border-ink-black shadow-comic flex items-center justify-center">
                  <UserIcon size={40} className="text-ink-black" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="font-super-squad text-4xl text-ink-black">
                  {user.name}
                </h1>
                {user.subscriptionTier !== 'free' && (
                  <span className={`px-3 py-1 text-xs font-super-squad uppercase border-2 border-ink-black ${
                    user.subscriptionTier === 'premium' 
                      ? 'bg-kirby-red text-parchment' 
                      : 'bg-golden-age-yellow text-ink-black'
                  }`}>
                    {user.subscriptionTier}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span className="font-persona-aura text-sm">
                    Joined {new Date(user.joinDate).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </span>
                </div>
                {user.lastActive && (
                  <div className="flex items-center space-x-1">
                    <Clock size={16} />
                    <span className="font-persona-aura text-sm">
                      Last active {new Date(user.lastActive).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-golden-age-yellow bg-opacity-20 border-2 border-golden-age-yellow p-3 text-center">
                  <BookOpen size={20} className="text-golden-age-yellow mx-auto mb-1" />
                  <p className="font-super-squad text-xl text-ink-black">
                    {stats.totalComics.toLocaleString()}
                  </p>
                  <p className="font-persona-aura text-xs text-gray-600">Comics</p>
                </div>
                
                <div className="bg-stan-lee-blue bg-opacity-20 border-2 border-stan-lee-blue p-3 text-center">
                  <DollarSign size={20} className="text-stan-lee-blue mx-auto mb-1" />
                  <p className="font-super-squad text-xl text-ink-black">
                    £{stats.totalValue.toLocaleString()}
                  </p>
                  <p className="font-persona-aura text-xs text-gray-600">Collection Value</p>
                </div>
                
                <div className="bg-kirby-red bg-opacity-20 border-2 border-kirby-red p-3 text-center">
                  <Star size={20} className="text-kirby-red mx-auto mb-1" />
                  <p className="font-super-squad text-xl text-ink-black">
                    {stats.keyIssues}
                  </p>
                  <p className="font-persona-aura text-xs text-gray-600">Key Issues</p>
                </div>
                
                <div className="bg-green-600 bg-opacity-20 border-2 border-green-600 p-3 text-center">
                  <TrendingUp size={20} className="text-green-600 mx-auto mb-1" />
                  <p className="font-super-squad text-xl text-ink-black">
                    £{stats.averageValue}
                  </p>
                  <p className="font-persona-aura text-xs text-gray-600">Avg. Value</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Top Publishers */}
          <div className="bg-white comic-border shadow-comic p-6">
            <h2 className="font-super-squad text-2xl text-ink-black mb-4 flex items-center space-x-2">
              <Badge size={24} />
              <span>TOP PUBLISHERS</span>
            </h2>
            {stats.topPublishers.length > 0 ? (
              <div className="space-y-3">
                {stats.topPublishers.map((publisher, index) => (
                  <div key={publisher.name} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 bg-golden-age-yellow text-ink-black text-xs font-super-squad flex items-center justify-center rounded border border-ink-black">
                        {index + 1}
                      </span>
                      <span className="font-persona-aura font-semibold text-ink-black">
                        {publisher.name}
                      </span>
                    </div>
                    <span className="font-persona-aura text-gray-600">
                      {publisher.count} comics
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-persona-aura text-gray-600 italic">No publisher data available</p>
            )}
          </div>

          {/* Collection Breakdown */}
          <div className="bg-white comic-border shadow-comic p-6">
            <h2 className="font-super-squad text-2xl text-ink-black mb-4 flex items-center space-x-2">
              <BookOpen size={24} />
              <span>COLLECTION BREAKDOWN</span>
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-persona-aura font-semibold text-ink-black">Total Comics</span>
                <span className="font-persona-aura text-gray-600">{stats.totalComics}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-persona-aura font-semibold text-ink-black">Key Issues</span>
                <span className="font-persona-aura text-gray-600">{stats.keyIssues}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-persona-aura font-semibold text-ink-black">Regular Issues</span>
                <span className="font-persona-aura text-gray-600">{stats.totalComics - stats.keyIssues}</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-persona-aura font-semibold text-ink-black">Total Value</span>
                  <span className="font-super-squad text-lg text-kirby-red">£{stats.totalValue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white comic-border shadow-comic p-8 text-center">
          <h2 className="font-super-squad text-2xl text-ink-black mb-4">
            COMING SOON
          </h2>
          <p className="font-persona-aura text-gray-600 mb-6">
            Public collection viewing will be available in a future update. Stay tuned!
          </p>
          <div className="text-6xl mb-4">💥</div>
          <p className="font-super-squad text-lg text-kirby-red">
            POW! More features on the way!
          </p>
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage