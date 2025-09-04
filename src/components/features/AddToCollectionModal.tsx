import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ComicCondition, Comic } from '@/lib/types'
import { addToCollection, type AddToCollectionData } from '@/services/collectionService'
import { toast } from '@/store/toastStore'
import { useUserStore } from '@/store/userStore'

interface AddToCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  comic: Comic
}

const conditionOptions: { value: ComicCondition; label: string }[] = [
  { value: 'mint', label: 'Mint (MT)' },
  { value: 'near-mint-plus', label: 'Near Mint+ (NM+)' },
  { value: 'near-mint', label: 'Near Mint (NM)' },
  { value: 'near-mint-minus', label: 'Near Mint- (NM-)' },
  { value: 'very-fine-plus', label: 'Very Fine+ (VF+)' },
  { value: 'very-fine', label: 'Very Fine (VF)' },
  { value: 'very-fine-minus', label: 'Very Fine- (VF-)' },
  { value: 'fine-plus', label: 'Fine+ (FN+)' },
  { value: 'fine', label: 'Fine (FN)' },
  { value: 'fine-minus', label: 'Fine- (FN-)' },
  { value: 'very-good-plus', label: 'Very Good+ (VG+)' },
  { value: 'very-good', label: 'Very Good (VG)' },
  { value: 'very-good-minus', label: 'Very Good- (VG-)' },
  { value: 'good-plus', label: 'Good+ (GD+)' },
  { value: 'good', label: 'Good (GD)' },
  { value: 'fair', label: 'Fair (FR)' },
  { value: 'poor', label: 'Poor (PR)' },
]

const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({ isOpen, onClose, comic }) => {
  const { user } = useUserStore()
  const queryClient = useQueryClient()
  
  // Collection form data
  const [collectionData, setCollectionData] = useState({
    condition: 'near-mint' as ComicCondition,
    purchasePrice: '',
    purchaseDate: '',
    purchaseLocation: '',
    notes: '',
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Add to collection mutation
  const addToCollectionMutation = useMutation({
    mutationFn: (data: AddToCollectionData) => {
      if (!user?.email) {
        throw new Error('No user found')
      }
      return addToCollection(user.email, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] })
      queryClient.invalidateQueries({ queryKey: ['collection-count'] })
      queryClient.invalidateQueries({ queryKey: ['user-collection-entry'] })
      
      toast.success('Comic Added', 'The comic has been successfully added to your collection!')
      
      resetForm()
      onClose()
    },
    onError: (error) => {
      console.error('Failed to add comic to collection:', error)
      toast.error('Add Failed', 'The comic could not be added to your collection. Please try again.')
    }
  })

  const resetForm = () => {
    setCollectionData({
      condition: 'near-mint',
      purchasePrice: '',
      purchaseDate: '',
      purchaseLocation: '',
      notes: '',
    })
    setErrors({})
  }

  const validateCollectionForm = () => {
    const newErrors: Record<string, string> = {}

    if (collectionData.purchasePrice && isNaN(parseFloat(collectionData.purchasePrice))) {
      newErrors.purchasePrice = 'Please enter a valid amount'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateCollectionForm()) {
      return
    }

    if (!user?.email) {
      setErrors(prev => ({ ...prev, general: 'You must be logged in to add comics' }))
      return
    }

    try {
      const data: AddToCollectionData = {
        comicId: comic.id,
        condition: collectionData.condition,
        purchasePrice: collectionData.purchasePrice ? parseFloat(collectionData.purchasePrice) : null,
        purchaseDate: collectionData.purchaseDate || null,
        purchaseLocation: collectionData.purchaseLocation.trim() || null,
        notes: collectionData.notes.trim() || null,
      }

      await addToCollectionMutation.mutateAsync(data)
      
    } catch (error) {
      console.error('Failed to add comic to collection:', error)
      setErrors(prev => ({ 
        ...prev, 
        general: error instanceof Error ? error.message : 'Failed to add comic. Please try again.' 
      }))
    }
  }

  const handleChange = (field: string, value: string) => {
    setCollectionData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white comic-border shadow-comic max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-stan-lee-blue to-kirby-red p-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Plus size={24} className="text-parchment" />
            <h2 className="font-super-squad text-2xl text-parchment">
              ADD TO COLLECTION
            </h2>
          </div>
          <button
            onClick={() => {
              resetForm()
              onClose()
            }}
            className="text-parchment hover:text-golden-age-yellow transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selected Comic Display */}
            <div className="bg-gray-50 p-4 border-2 border-ink-black comic-border">
              <h3 className="font-super-squad text-lg text-ink-black mb-3">COMIC</h3>
              <div className="flex items-start space-x-4">
                {comic.coverImage && (
                  <img
                    src={comic.coverImage}
                    alt={`${comic.title} ${comic.issue}`}
                    className="w-20 h-30 object-cover border border-ink-black flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-persona-aura font-bold text-lg text-ink-black">
                    {comic.title} {comic.issue}
                  </h4>
                  <p className="font-persona-aura text-gray-600 mb-1">
                    {comic.publisher}
                  </p>
                  <p className="font-persona-aura text-stan-lee-blue font-semibold">
                    Market Value: £{(comic.marketValue || 0).toFixed(2)}
                  </p>
                  {comic.isKeyIssue && (
                    <p className="font-persona-aura text-kirby-red font-semibold">
                      ⭐ Key Issue
                      {comic.keyNotes && `: ${comic.keyNotes}`}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Collection Details Form */}
            <div className="space-y-4">
              <h3 className="font-super-squad text-lg text-ink-black border-b-2 border-ink-black pb-1">
                COLLECTION DETAILS
              </h3>
              
              {/* Condition */}
              <div>
                <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                  Condition *
                </label>
                <select
                  value={collectionData.condition}
                  onChange={(e) => handleChange('condition', e.target.value)}
                  className="w-full p-3 border-2 border-ink-black comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue"
                  required
                >
                  {conditionOptions.map(condition => (
                    <option key={condition.value} value={condition.value}>{condition.label}</option>
                  ))}
                </select>
              </div>

              {/* Purchase Price and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                    Purchase Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 font-persona-aura text-gray-600">£</span>
                    <input
                      type="number"
                      value={collectionData.purchasePrice}
                      onChange={(e) => handleChange('purchasePrice', e.target.value)}
                      className={`w-full p-3 pl-8 border-2 comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue ${
                        errors.purchasePrice ? 'border-red-500' : 'border-ink-black'
                      }`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  {errors.purchasePrice && <p className="mt-1 text-sm text-red-600 font-persona-aura">{errors.purchasePrice}</p>}
                </div>

                <div>
                  <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={collectionData.purchaseDate}
                    onChange={(e) => handleChange('purchaseDate', e.target.value)}
                    className="w-full p-3 border-2 border-ink-black comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue"
                  />
                </div>
              </div>

              {/* Purchase Location */}
              <div>
                <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                  Purchase Location
                </label>
                <input
                  type="text"
                  value={collectionData.purchaseLocation}
                  onChange={(e) => handleChange('purchaseLocation', e.target.value)}
                  className="w-full p-3 border-2 border-ink-black comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue"
                  placeholder="e.g., Local Comic Shop, eBay, Convention"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                  Notes
                </label>
                <textarea
                  value={collectionData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full p-3 border-2 border-ink-black comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue resize-none"
                  placeholder="Additional notes about this comic in your collection..."
                  rows={3}
                />
              </div>
            </div>

            {/* General Error Display */}
            {errors.general && (
              <div className="p-3 bg-red-100 border-2 border-red-500 comic-border">
                <p className="text-sm text-red-600 font-persona-aura">{errors.general}</p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 font-persona-aura font-semibold text-ink-black hover:text-kirby-red transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addToCollectionMutation.isPending}
                className="comic-button flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addToCollectionMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    <span>Add to Collection</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddToCollectionModal