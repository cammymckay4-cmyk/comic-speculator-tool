import React, { useState } from 'react'
import { X, Plus, TrendingDown, TrendingUp, Bell, Package, Clock } from 'lucide-react'
import { useCreateAlert } from '@/hooks/useAlertsQuery'
import type { AlertType } from '@/lib/types'

interface CreateAlertModalProps {
  isOpen: boolean
  onClose: () => void
}

const alertTypeOptions = [
  { value: 'price-drop' as AlertType, label: 'Price Drop', icon: TrendingDown, color: 'text-green-600' },
  { value: 'price-increase' as AlertType, label: 'Price Increase', icon: TrendingUp, color: 'text-red-600' },
  { value: 'new-issue' as AlertType, label: 'New Issue', icon: Package, color: 'text-blue-600' },
  { value: 'availability' as AlertType, label: 'Availability', icon: Bell, color: 'text-purple-600' },
  { value: 'auction-ending' as AlertType, label: 'Auction Ending', icon: Clock, color: 'text-orange-600' },
]

const CreateAlertModal: React.FC<CreateAlertModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    alertType: 'price-drop' as AlertType,
    thresholdPrice: '',
    priceDirection: 'below' as 'above' | 'below',
    description: '',
  })

  const createAlertMutation = useCreateAlert()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createAlertMutation.mutateAsync({
        name: formData.name,
        alertType: formData.alertType,
        thresholdPrice: formData.thresholdPrice ? parseFloat(formData.thresholdPrice) : undefined,
        priceDirection: formData.priceDirection,
        description: formData.description || undefined,
      })
      
      // Reset form and close modal on success
      setFormData({
        name: '',
        alertType: 'price-drop' as AlertType,
        thresholdPrice: '',
        priceDirection: 'below' as 'above' | 'below',
        description: '',
      })
      onClose()
    } catch (error) {
      console.error('Failed to create alert:', error)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const selectedAlertType = alertTypeOptions.find(opt => opt.value === formData.alertType)
  const Icon = selectedAlertType?.icon || Bell

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white comic-border shadow-comic max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-stan-lee-blue to-kirby-red p-6 flex justify-between items-center">
          <h2 className="font-super-squad text-2xl text-parchment">CREATE ALERT</h2>
          <button
            onClick={onClose}
            className="text-parchment hover:text-golden-age-yellow transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Alert Name */}
          <div>
            <label className="block font-persona-aura font-semibold text-ink-black mb-2">
              Alert Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full p-3 border-2 border-ink-black comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue"
              placeholder="e.g., Spider-Man Price Watch"
              required
            />
          </div>

          {/* Alert Type */}
          <div>
            <label className="block font-persona-aura font-semibold text-ink-black mb-3">
              Alert Type *
            </label>
            <div className="grid grid-cols-1 gap-3">
              {alertTypeOptions.map((option) => {
                const OptionIcon = option.icon
                return (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border-2 cursor-pointer transition-colors comic-border ${
                      formData.alertType === option.value
                        ? 'border-stan-lee-blue bg-stan-lee-blue bg-opacity-10'
                        : 'border-gray-300 hover:border-stan-lee-blue'
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
                    <OptionIcon size={20} className={`mr-3 ${option.color}`} />
                    <span className="font-persona-aura font-medium">{option.label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Price Threshold (for price-related alerts) */}
          {(formData.alertType === 'price-drop' || formData.alertType === 'price-increase') && (
            <div>
              <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                Price Threshold
              </label>
              <div className="flex items-center space-x-3">
                <select
                  value={formData.priceDirection}
                  onChange={(e) => handleChange('priceDirection', e.target.value)}
                  className="p-3 border-2 border-ink-black comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue"
                >
                  <option value="below">Below</option>
                  <option value="above">Above</option>
                </select>
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-3 font-persona-aura text-gray-600">£</span>
                  <input
                    type="number"
                    value={formData.thresholdPrice}
                    onChange={(e) => handleChange('thresholdPrice', e.target.value)}
                    className="w-full p-3 pl-8 border-2 border-ink-black comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block font-persona-aura font-semibold text-ink-black mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full p-3 border-2 border-ink-black comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue resize-none"
              placeholder="Additional details about this alert..."
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 font-persona-aura font-semibold text-ink-black hover:text-kirby-red transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createAlertMutation.isPending || !formData.name.trim()}
              className="comic-button flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createAlertMutation.isPending ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-parchment border-t-transparent rounded-full"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus size={20} />
                  <span>Create Alert</span>
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {createAlertMutation.isError && (
            <div className="mt-4 p-3 bg-red-100 border-2 border-red-300 comic-border">
              <p className="font-persona-aura text-red-700">
                Failed to create alert. Please try again.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default CreateAlertModal