import React, { useState, useEffect } from 'react'
import { X, Plus, Book, Upload, Image as ImageIcon, Save } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/store/toastStore'
import type { ComicCondition, ComicFormat, CollectionComic } from '@/lib/types'
import { uploadComicImage } from '@/services/storageService'
import { updateCollectionEntry, type AddToCollectionData } from '@/services/collectionService'
import { useUserStore } from '@/store/userStore'

interface EditComicFormProps {
  isOpen: boolean
  onClose: () => void
  comic: CollectionComic
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

const formatOptions: { value: ComicFormat; label: string }[] = [
  { value: 'single-issue', label: 'Single Issue' },
  { value: 'trade-paperback', label: 'Trade Paperback' },
  { value: 'hardcover', label: 'Hardcover' },
  { value: 'graphic-novel', label: 'Graphic Novel' },
  { value: 'omnibus', label: 'Omnibus' },
  { value: 'deluxe-edition', label: 'Deluxe Edition' },
  { value: 'treasury-edition', label: 'Treasury Edition' },
  { value: 'magazine', label: 'Magazine' },
  { value: 'digital', label: 'Digital' },
]

const publisherOptions = [
  'Marvel Comics',
  'DC Comics',
  'Image Comics',
  'Dark Horse Comics',
  'IDW Publishing',
  'BOOM! Studios',
  'Valiant Entertainment',
  'Dynamite Entertainment',
  'Archie Comics',
  'Other',
]

const EditComicForm: React.FC<EditComicFormProps> = ({ isOpen, onClose, comic }) => {
  const { user } = useUserStore()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    title: '',
    issueNumber: '',
    publisher: '',
    customPublisher: '',
    condition: 'near-mint' as ComicCondition,
    format: 'single-issue' as ComicFormat,
    estimatedValue: '',
    purchasePrice: '',
    purchaseDate: '',
    purchaseLocation: '',
    coverImage: '',
    notes: '',
    isKeyIssue: false,
    keyNotes: '',
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form with comic data when modal opens or comic changes
  useEffect(() => {
    if (isOpen && comic) {
      const isCustomPublisher = !publisherOptions.slice(0, -1).includes(comic.comic.publisher)
      
      setFormData({
        title: comic.comic.title || '',
        issueNumber: comic.comic.issue || '',
        publisher: isCustomPublisher ? 'Other' : comic.comic.publisher || '',
        customPublisher: isCustomPublisher ? comic.comic.publisher || '' : '',
        condition: comic.condition || 'near-mint',
        format: comic.comic.format || 'single-issue',
        estimatedValue: comic.comic.marketValue ? comic.comic.marketValue.toString() : '',
        purchasePrice: comic.purchasePrice ? comic.purchasePrice.toString() : '',
        purchaseDate: comic.purchaseDate || '',
        purchaseLocation: comic.purchaseLocation || '',
        coverImage: comic.comic.coverImage || '',
        notes: comic.notes || '',
        isKeyIssue: comic.comic.isKeyIssue || false,
        keyNotes: comic.comic.keyNotes || '',
      })
      setPreviewUrl('')
      setSelectedFile(null)
      setErrors({})
    }
  }, [isOpen, comic])
  
  // TanStack Query mutation for updating comic
  const updateComicMutation = useMutation({
    mutationFn: (comicData: AddToCollectionData) => {
      if (!comic.id) {
        throw new Error('Comic entry ID is required')
      }
      if (!user?.email) {
        throw new Error('User email is required')
      }
      return updateCollectionEntry(comic.id, user.email, comicData)
    },
    onSuccess: () => {
      // Invalidate and refetch the collection query
      queryClient.invalidateQueries({ queryKey: ['collection', user?.email] })
      queryClient.invalidateQueries({ queryKey: ['collection-count', user?.email] })
      queryClient.invalidateQueries({ queryKey: ['comic', comic.comicId] })
      
      // Show success notification
      toast.success('Changes Saved', { description: 'Your updates to the comic have been saved.' })
      
      // Close modal
      onClose()
    },
    onError: (error) => {
      console.error('Failed to update comic:', error)
      // Show error notification
      toast.error('Save Failed', { description: 'Your changes could not be saved. Please try again.' })
    }
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, coverImage: 'Please select an image file' }))
        return
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, coverImage: 'File size must be less than 5MB' }))
        return
      }

      setSelectedFile(file)
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      
      // Clear any existing errors
      setErrors(prev => ({ ...prev, coverImage: '' }))
    }
  }

  const clearImage = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setFormData(prev => ({ ...prev, coverImage: '' }))
    // Clear the file input
    const fileInput = document.getElementById('coverImageFile') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.issueNumber.trim()) {
      newErrors.issueNumber = 'Issue number is required'
    }

    if (!formData.publisher.trim()) {
      newErrors.publisher = 'Publisher is required'
    }

    if (formData.publisher === 'Other' && !formData.customPublisher.trim()) {
      newErrors.customPublisher = 'Custom publisher name is required'
    }


    if (formData.estimatedValue && isNaN(parseFloat(formData.estimatedValue))) {
      newErrors.estimatedValue = 'Please enter a valid amount'
    }

    if (formData.purchasePrice && isNaN(parseFloat(formData.purchasePrice))) {
      newErrors.purchasePrice = 'Please enter a valid amount'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      let coverImageUrl = formData.coverImage.trim()

      // Upload image if file is selected
      if (selectedFile) {
        try {
          coverImageUrl = await uploadComicImage(selectedFile)
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError)
          setErrors(prev => ({ 
            ...prev, 
            coverImage: uploadError instanceof Error ? uploadError.message : 'Upload failed' 
          }))
          return
        }
      }

      // Prepare collection entry data with comicId for updates
      const comicData: AddToCollectionData = {
        comicId: comic.comicId,
        condition: formData.condition,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
        purchaseDate: formData.purchaseDate || null,
        purchaseLocation: formData.purchaseLocation.trim() || null,
        notes: formData.notes.trim() || null,
      }

      // Use the mutation to update the comic
      await updateComicMutation.mutateAsync(comicData)
      
    } catch (error) {
      console.error('Failed to update comic:', error)
      setErrors(prev => ({ 
        ...prev, 
        general: error instanceof Error ? error.message : 'Failed to update comic. Please try again.' 
      }))
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error for this field when user starts typing
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
        <div className="bg-gradient-to-r from-golden-age-yellow to-kirby-red p-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Book size={24} className="text-ink-black" />
            <h2 className="font-super-squad text-2xl text-ink-black">EDIT COMIC</h2>
          </div>
          <button
            onClick={onClose}
            className="text-ink-black hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-super-squad text-lg text-ink-black border-b-2 border-ink-black pb-1">
              BASIC INFORMATION
            </h3>
            
            {/* Title */}
            <div>
              <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`w-full p-3 border-2 comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue ${
                  errors.title ? 'border-red-500' : 'border-ink-black'
                }`}
                placeholder="e.g., The Amazing Spider-Man"
                required
              />
              {errors.title && <p className="mt-1 text-sm text-red-600 font-persona-aura">{errors.title}</p>}
            </div>

            {/* Issue Number and Publisher */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                  Issue Number *
                </label>
                <input
                  type="text"
                  value={formData.issueNumber}
                  onChange={(e) => handleChange('issueNumber', e.target.value)}
                  className={`w-full p-3 border-2 comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue ${
                    errors.issueNumber ? 'border-red-500' : 'border-ink-black'
                  }`}
                  placeholder="e.g., #1, Annual #1"
                  required
                />
                {errors.issueNumber && <p className="mt-1 text-sm text-red-600 font-persona-aura">{errors.issueNumber}</p>}
              </div>

              <div>
                <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                  Publisher *
                </label>
                <select
                  value={formData.publisher}
                  onChange={(e) => handleChange('publisher', e.target.value)}
                  className={`w-full p-3 border-2 comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue ${
                    errors.publisher ? 'border-red-500' : 'border-ink-black'
                  }`}
                  required
                >
                  <option value="">Select Publisher</option>
                  {publisherOptions.map(publisher => (
                    <option key={publisher} value={publisher}>{publisher}</option>
                  ))}
                </select>
                {errors.publisher && <p className="mt-1 text-sm text-red-600 font-persona-aura">{errors.publisher}</p>}
              </div>
            </div>

            {/* Custom Publisher (if "Other" selected) */}
            {formData.publisher === 'Other' && (
              <div>
                <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                  Publisher Name *
                </label>
                <input
                  type="text"
                  value={formData.customPublisher}
                  onChange={(e) => handleChange('customPublisher', e.target.value)}
                  className={`w-full p-3 border-2 comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue ${
                    errors.customPublisher ? 'border-red-500' : 'border-ink-black'
                  }`}
                  placeholder="Enter publisher name"
                  required
                />
                {errors.customPublisher && <p className="mt-1 text-sm text-red-600 font-persona-aura">{errors.customPublisher}</p>}
              </div>
            )}

            {/* Format */}
            <div>
              <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                Format
              </label>
              <select
                value={formData.format}
                onChange={(e) => handleChange('format', e.target.value)}
                className="w-full p-3 border-2 border-ink-black comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue"
              >
                {formatOptions.map(format => (
                  <option key={format.value} value={format.value}>{format.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition and Values */}
          <div className="space-y-4">
            <h3 className="font-super-squad text-lg text-ink-black border-b-2 border-ink-black pb-1">
              CONDITION & VALUE
            </h3>
            
            {/* Condition */}
            <div>
              <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                Condition *
              </label>
              <select
                value={formData.condition}
                onChange={(e) => handleChange('condition', e.target.value)}
                className="w-full p-3 border-2 border-ink-black comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue"
                required
              >
                {conditionOptions.map(condition => (
                  <option key={condition.value} value={condition.value}>{condition.label}</option>
                ))}
              </select>
            </div>

            {/* Estimated Value and Purchase Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                  Estimated Value
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 font-persona-aura text-gray-600">£</span>
                  <input
                    type="number"
                    value={formData.estimatedValue}
                    onChange={(e) => handleChange('estimatedValue', e.target.value)}
                    className={`w-full p-3 pl-8 border-2 comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue ${
                      errors.estimatedValue ? 'border-red-500' : 'border-ink-black'
                    }`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                {errors.estimatedValue && <p className="mt-1 text-sm text-red-600 font-persona-aura">{errors.estimatedValue}</p>}
              </div>

              <div>
                <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                  Purchase Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 font-persona-aura text-gray-600">£</span>
                  <input
                    type="number"
                    value={formData.purchasePrice}
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
            </div>
          </div>

          {/* Purchase Information */}
          <div className="space-y-4">
            <h3 className="font-super-squad text-lg text-ink-black border-b-2 border-ink-black pb-1">
              PURCHASE INFORMATION
            </h3>
            
            {/* Purchase Date and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleChange('purchaseDate', e.target.value)}
                  className="w-full p-3 border-2 border-ink-black comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue"
                />
              </div>

              <div>
                <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                  Purchase Location
                </label>
                <input
                  type="text"
                  value={formData.purchaseLocation}
                  onChange={(e) => handleChange('purchaseLocation', e.target.value)}
                  className="w-full p-3 border-2 border-ink-black comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue"
                  placeholder="e.g., Local Comic Shop, eBay, Convention"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="font-super-squad text-lg text-ink-black border-b-2 border-ink-black pb-1">
              ADDITIONAL INFORMATION
            </h3>
            
            {/* Cover Image Upload */}
            <div>
              <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                Cover Image
              </label>
              
              {/* File Input */}
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="file"
                    id="coverImageFile"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="coverImageFile"
                    className={`w-full p-3 border-2 comic-border font-persona-aura cursor-pointer flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors ${
                      errors.coverImage ? 'border-red-500' : 'border-ink-black'
                    }`}
                  >
                    <Upload size={20} className="text-gray-600" />
                    <span className="text-gray-600">
                      {selectedFile ? selectedFile.name : 'Choose image file...'}
                    </span>
                  </label>
                </div>

                {/* Alternative URL Input */}
                <div className="text-center text-sm text-gray-600 font-persona-aura">OR</div>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => handleChange('coverImage', e.target.value)}
                  className={`w-full p-3 border-2 comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue ${
                    errors.coverImage ? 'border-red-500' : 'border-ink-black'
                  }`}
                  placeholder="Or enter image URL: https://example.com/cover.jpg"
                />

                {/* Image Preview */}
                {(previewUrl || formData.coverImage) && (
                  <div className="relative inline-block">
                    <img
                      src={previewUrl || formData.coverImage}
                      alt="Cover preview"
                      className="w-32 h-48 object-cover border-2 border-ink-black comic-border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                    <div className="mt-2 flex items-center space-x-1 text-sm text-gray-600 font-persona-aura">
                      <ImageIcon size={16} />
                      <span>Preview</span>
                    </div>
                  </div>
                )}
                
                {errors.coverImage && (
                  <p className="text-sm text-red-600 font-persona-aura">{errors.coverImage}</p>
                )}
              </div>
            </div>

            {/* Key Issue */}
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isKeyIssue}
                  onChange={(e) => handleChange('isKeyIssue', e.target.checked)}
                  className="w-5 h-5 border-2 border-ink-black text-stan-lee-blue focus:ring-stan-lee-blue"
                />
                <span className="font-persona-aura font-semibold text-ink-black">
                  This is a key issue
                </span>
              </label>

              {formData.isKeyIssue && (
                <div>
                  <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                    Key Issue Reason
                  </label>
                  <input
                    type="text"
                    value={formData.keyNotes}
                    onChange={(e) => handleChange('keyNotes', e.target.value)}
                    className="w-full p-3 border-2 border-ink-black comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue"
                    placeholder="e.g., First appearance of Spider-Man"
                  />
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="w-full p-3 border-2 border-ink-black comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue resize-none"
                placeholder="Additional notes about this comic..."
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
              disabled={updateComicMutation.isPending}
              className="comic-button flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateComicMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditComicForm