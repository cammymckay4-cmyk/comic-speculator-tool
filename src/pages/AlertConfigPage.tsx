import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  ArrowLeft,
  Bell,
  TrendingDown,
  TrendingUp,
  Package,
  Clock,
  Mail,
  MessageSquare,
  Smartphone,
  Save,
  AlertCircle
} from 'lucide-react'
import { fetchPublicComicById } from '@/services/collectionService'
import { useCreateAlert } from '@/hooks/useAlertsQuery'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from '@/store/toastStore'
import type { AlertType } from '@/lib/types'

const alertTypeOptions = [
  { 
    value: 'price-drop' as AlertType, 
    label: 'Price Drop', 
    icon: TrendingDown, 
    color: 'text-green-600',
    description: 'Alert me when the price drops below a target price'
  },
  { 
    value: 'price-increase' as AlertType, 
    label: 'Price Increase', 
    icon: TrendingUp, 
    color: 'text-red-600',
    description: 'Alert me when the price rises above a target price'
  },
  { 
    value: 'new-issue' as AlertType, 
    label: 'New Issue', 
    icon: Package, 
    color: 'text-blue-600',
    description: 'Alert me when new issues of this series are released'
  },
  { 
    value: 'availability' as AlertType, 
    label: 'Availability', 
    icon: Bell, 
    color: 'text-purple-600',
    description: 'Alert me when this comic becomes available for purchase'
  },
  { 
    value: 'auction-ending' as AlertType, 
    label: 'Auction Ending', 
    icon: Clock, 
    color: 'text-orange-600',
    description: 'Alert me when auctions for this comic are ending soon'
  }
]

const notificationTypes = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'push', label: 'Browser Notification', icon: MessageSquare },
  { value: 'sms', label: 'SMS (Premium)', icon: Smartphone }
]

const AlertConfigPage: React.FC = () => {
  const { comicId } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    alertType: 'price-drop' as AlertType,
    targetPrice: '',
    priceDirection: 'below' as 'above' | 'below',
    notifications: ['email'] as string[],
    description: ''
  })

  const { data: comic, isLoading, isError, error } = useQuery({
    queryKey: ['public-comic', comicId],
    queryFn: () => {
      if (!comicId) throw new Error('Comic ID is required')
      return fetchPublicComicById(comicId)
    },
    enabled: !!comicId
  })

  const createAlertMutation = useCreateAlert((data) => {
    toast.success('Alert Created', 'Your price alert has been set up successfully')
    navigate('/alerts')
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!comic) return

    // Validate form data
    const alertName = formData.name || `${comic.title} ${comic.issue} Alert`
    
    // For price alerts, validate target price
    if (['price-drop', 'price-increase'].includes(formData.alertType)) {
      const price = parseFloat(formData.targetPrice)
      if (!formData.targetPrice || isNaN(price) || price <= 0) {
        toast.error('Invalid Price', 'Please enter a valid target price for this alert.')
        return
      }
    }

    try {
      console.log('Creating alert for comic:', {
        comicId: comicId,
        comicTitle: comic.title,
        name: alertName,
        alertType: formData.alertType,
        targetPrice: formData.targetPrice ? parseFloat(formData.targetPrice) : undefined,
        priceDirection: formData.priceDirection,
      })

      await createAlertMutation.mutateAsync({
        name: alertName,
        alertType: formData.alertType,
        comicId: comicId,
        thresholdPrice: formData.targetPrice ? parseFloat(formData.targetPrice) : undefined,
        priceDirection: formData.priceDirection,
        description: formData.description || undefined
      })
    } catch (error) {
      console.error('Failed to create alert:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to create alert. Please try again.'
      toast.error('Alert Failed', errorMessage)
    }
  }

  const handleChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const toggleNotification = (type: string) => {
    setFormData(prev => ({
      ...prev,
      notifications: prev.notifications.includes(type)
        ? prev.notifications.filter(n => n !== type)
        : [...prev.notifications, type]
    }))
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading comic details..." />
      </div>
    )
  }

  // Handle error state
  if (isError || !comic) {
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white comic-border shadow-comic p-8 text-center">
            <AlertCircle size={48} className="text-kirby-red mx-auto mb-4" />
            <h1 className="font-super-squad text-2xl text-ink-black mb-2">
              Comic Not Found
            </h1>
            <p className="font-persona-aura text-gray-600 mb-6">
              {error instanceof Error ? error.message : 'The comic you\'re looking for could not be found.'}
            </p>
            <button
              onClick={() => navigate('/alerts')}
              className="comic-button"
            >
              Go to Alerts
            </button>
          </div>
        </div>
      </div>
    )
  }

  const selectedAlertType = alertTypeOptions.find(opt => opt.value === formData.alertType)
  const Icon = selectedAlertType?.icon || Bell

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

      {/* Page Header */}
      <div className="bg-gradient-to-br from-stan-lee-blue to-kirby-red py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-4">
            <img
              src={comic.coverImage || '/comic-placeholder.jpg'}
              alt={`${comic.title} ${comic.issue}`}
              className="w-16 h-20 object-cover border-2 border-parchment shadow-comic"
            />
            <div>
              <h1 className="font-super-squad text-3xl md:text-4xl text-parchment mb-2">
                SET PRICE ALERT
              </h1>
              <p className="font-persona-aura text-parchment opacity-90">
                {comic.title} {comic.issue}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Configuration Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white comic-border shadow-comic p-8 space-y-8">
          {/* Alert Name */}
          <div>
            <label className="block font-super-squad text-lg text-ink-black mb-3">
              ALERT NAME
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full p-4 border-2 border-ink-black comic-border font-persona-aura text-lg focus:outline-none focus:ring-2 focus:ring-stan-lee-blue"
              placeholder={`${comic.title} ${comic.issue} Price Alert`}
            />
            <p className="font-persona-aura text-sm text-gray-600 mt-2">
              Leave blank to use the default name
            </p>
          </div>

          {/* Alert Type Selection */}
          <div>
            <label className="block font-super-squad text-lg text-ink-black mb-4">
              ALERT TYPE
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alertTypeOptions.map((option) => {
                const OptionIcon = option.icon
                return (
                  <label
                    key={option.value}
                    className={`flex flex-col p-4 border-2 cursor-pointer transition-all comic-border ${
                      formData.alertType === option.value
                        ? 'border-stan-lee-blue bg-stan-lee-blue bg-opacity-10 transform translate-y-[-2px] shadow-comic'
                        : 'border-gray-300 hover:border-stan-lee-blue hover:translate-y-[-1px]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="alertType"
                      value={option.value}
                      checked={formData.alertType === option.value}
                      onChange={(e) => handleChange('alertType', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center mb-2">
                      <OptionIcon size={24} className={`mr-3 ${option.color}`} />
                      <span className="font-persona-aura font-bold text-ink-black">{option.label}</span>
                    </div>
                    <p className="font-persona-aura text-sm text-gray-600">
                      {option.description}
                    </p>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Target Price (for price-related alerts) */}
          {(formData.alertType === 'price-drop' || formData.alertType === 'price-increase') && (
            <div>
              <label className="block font-super-squad text-lg text-ink-black mb-4">
                TARGET PRICE
              </label>
              <div className="flex items-center space-x-4">
                <select
                  value={formData.priceDirection}
                  onChange={(e) => handleChange('priceDirection', e.target.value)}
                  className="p-4 border-2 border-ink-black comic-border font-persona-aura text-lg focus:outline-none focus:ring-2 focus:ring-stan-lee-blue"
                >
                  <option value="below">Alert when price drops below</option>
                  <option value="above">Alert when price rises above</option>
                </select>
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-4 font-persona-aura text-gray-600 text-lg">£</span>
                  <input
                    type="number"
                    value={formData.targetPrice}
                    onChange={(e) => handleChange('targetPrice', e.target.value)}
                    className="w-full p-4 pl-10 border-2 border-ink-black comic-border font-persona-aura text-lg focus:outline-none focus:ring-2 focus:ring-stan-lee-blue"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="mt-3 p-3 bg-golden-age-yellow bg-opacity-20 border-2 border-golden-age-yellow comic-border">
                <p className="font-persona-aura text-sm text-ink-black">
                  <strong>Current market value:</strong> £{(comic.marketValue || 0).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Notification Preferences */}
          <div>
            <label className="block font-super-squad text-lg text-ink-black mb-4">
              NOTIFICATION PREFERENCES
            </label>
            <div className="space-y-3">
              {notificationTypes.map((type) => {
                const TypeIcon = type.icon
                return (
                  <label
                    key={type.value}
                    className="flex items-center p-3 border-2 border-gray-300 comic-border cursor-pointer hover:border-stan-lee-blue transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.notifications.includes(type.value)}
                      onChange={() => toggleNotification(type.value)}
                      className="w-5 h-5 border-2 border-ink-black mr-3"
                    />
                    <TypeIcon size={20} className="text-gray-600 mr-3" />
                    <span className="font-persona-aura font-medium text-ink-black">{type.label}</span>
                    {type.value === 'sms' && (
                      <span className="ml-2 px-2 py-1 bg-golden-age-yellow text-xs font-super-squad border border-ink-black">
                        PREMIUM
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-super-squad text-lg text-ink-black mb-3">
              ADDITIONAL NOTES (OPTIONAL)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full p-4 border-2 border-ink-black comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue resize-none"
              placeholder="Any additional details or preferences for this alert..."
              rows={4}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-4 font-persona-aura font-semibold text-ink-black hover:text-kirby-red transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createAlertMutation.isPending}
              className="comic-button flex items-center space-x-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createAlertMutation.isPending ? (
                <>
                  <div className="animate-spin w-6 h-6 border-2 border-parchment border-t-transparent rounded-full"></div>
                  <span>Creating Alert...</span>
                </>
              ) : (
                <>
                  <Save size={24} />
                  <span>Create Alert</span>
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {createAlertMutation.isError && (
            <div className="mt-6 p-4 bg-red-100 border-2 border-red-300 comic-border">
              <div className="flex items-start space-x-3">
                <AlertCircle size={24} className="text-red-600 mt-0.5" />
                <div>
                  <p className="font-persona-aura text-red-700 font-semibold">
                    Failed to create alert
                  </p>
                  <p className="font-persona-aura text-red-600 text-sm mt-1">
                    {createAlertMutation.error instanceof Error 
                      ? createAlertMutation.error.message 
                      : 'Please check your inputs and try again.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default AlertConfigPage