import React, { useState, useEffect } from 'react'
import { X, Search, Book, Plus } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/store/toastStore'
import type { ComicCondition } from '@/lib/types'
import { addToCollection, type SupabaseComic, type AddToCollectionData } from '@/services/collectionService'
import { searchPublicComics, type SearchResultComic } from '@/services/searchService'
import { useUserStore } from '@/store/userStore'

interface ComicSearchModalProps {
  isOpen: boolean
  onClose: () => void
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

// Transform SearchResultComic to SupabaseComic format
const transformSearchResultToSupabaseComic = (searchResult: SearchResultComic): SupabaseComic => {
  return {
    id: searchResult.id,
    title: searchResult.title,
    issue: searchResult.issueNumber,
    publisher: searchResult.publisher,
    cover_image: searchResult.coverImageUrl,
    market_value: searchResult.marketValue,
    is_key_issue: searchResult.isKeyIssue || false,
    key_notes: searchResult.keyNotes || undefined,
    variant_description: undefined,
    page_count: undefined,
    notes: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

const ComicSearchModal: React.FC<ComicSearchModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUserStore()
  const queryClient = useQueryClient()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SupabaseComic[]>([])
  const [selectedComic, setSelectedComic] = useState<SupabaseComic | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showCollectionForm, setShowCollectionForm] = useState(false)
  
  // Collection form data
  const [collectionData, setCollectionData] = useState({
    condition: 'near-mint' as ComicCondition,
    purchasePrice: '',
    purchaseDate: '',
    purchaseLocation: '',
    notes: '',
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Debounced search effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    const searchTimer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const searchResponse = await searchPublicComics(searchTerm)
        const transformedResults = searchResponse.results.map(transformSearchResultToSupabaseComic)
        setSearchResults(transformedResults)
      } catch (error) {
        console.error('Search failed:', error)
        toast.error('Search Failed', { description: 'Could not search comics. Please try again.' })
      } finally {
        setIsSearching(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(searchTimer)
  }, [searchTerm])
  
  // Add to collection mutation
  const addToCollectionMutation = useMutation({
    mutationFn: (data: AddToCollectionData) => {
      if (!user?.email) {
        throw new Error('No user found')
      }
      return addToCollection(user.email, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', user?.email] })
      queryClient.invalidateQueries({ queryKey: ['collection-count', user?.email] })
      
      toast.success('Comic Added', { description: 'The comic has been added to your collection.' })
      
      resetForm()
      onClose()
    },
    onError: (error) => {
      console.error('Failed to add comic to collection:', error)
      toast.error('Add Failed', { description: 'The comic could not be added. Please try again.' })
    }
  })

  const resetForm = () => {
    setSearchTerm('')
    setSearchResults([])
    setSelectedComic(null)
    setShowCollectionForm(false)
    setCollectionData({
      condition: 'near-mint',
      purchasePrice: '',
      purchaseDate: '',
      purchaseLocation: '',
      notes: '',
    })
    setErrors({})
  }

  const handleComicSelect = (comic: SupabaseComic) => {
    setSelectedComic(comic)
    setShowCollectionForm(true)
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
    
    if (!selectedComic) return
    
    if (!validateCollectionForm()) {
      return
    }

    if (!user?.email) {
      setErrors(prev => ({ ...prev, general: 'You must be logged in to add comics' }))
      return
    }

    try {
      const data: AddToCollectionData = {
        comicId: selectedComic.id,
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
      <div className="bg-white comic-border shadow-comic max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-stan-lee-blue to-kirby-red p-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Search size={24} className="text-parchment" />
            <h2 className="font-super-squad text-2xl text-parchment">
              {showCollectionForm ? 'ADD TO COLLECTION' : 'SEARCH COMICS'}
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
          {!showCollectionForm ? (
            /* Search Phase */
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-ink-black comic-border font-persona-aura focus:outline-none focus:ring-2 focus:ring-stan-lee-blue"
                  placeholder="Search for comics by title, issue, or publisher..."
                  autoFocus
                />
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="w-5 h-5 border-2 border-stan-lee-blue border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Search Instructions */}
              {!searchTerm.trim() && (
                <div className="text-center py-12 text-gray-600 font-persona-aura">
                  <Book size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg mb-2">Search our master comics database</p>
                  <p>Start typing to find the comic you want to add to your collection</p>
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-super-squad text-lg text-ink-black border-b-2 border-ink-black pb-1">
                    SEARCH RESULTS ({searchResults.length})
                  </h3>
                  <div className="grid gap-4">
                    {searchResults.map((comic) => (
                      <div
                        key={comic.id}
                        className="p-4 border-2 border-ink-black comic-border hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleComicSelect(comic)}
                      >
                        <div className="flex items-start space-x-4">
                          {comic.cover_image && (
                            <img
                              src={comic.cover_image}
                              alt={`${comic.title} ${comic.issue}`}
                              className="w-16 h-24 object-cover border border-ink-black flex-shrink-0"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-persona-aura font-bold text-lg text-ink-black">
                              {comic.title} {comic.issue}
                            </h4>
                            <p className="font-persona-aura text-gray-600 mb-1">
                              {comic.publisher}
                            </p>
                            {comic.is_key_issue && (
                              <p className="font-persona-aura text-kirby-red font-semibold mb-1">
                                ⭐ Key Issue
                                {comic.key_notes && `: ${comic.key_notes}`}
                              </p>
                            )}
                            <p className="font-persona-aura text-stan-lee-blue font-semibold">
                              Market Value: £{comic.market_value.toFixed(2)}
                            </p>
                          </div>
                          <Plus size={24} className="text-stan-lee-blue flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchTerm.trim() && !isSearching && searchResults.length === 0 && (
                <div className="text-center py-12 text-gray-600 font-persona-aura">
                  <Search size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg mb-2">No comics found</p>
                  <p>Try different search terms or check your spelling</p>
                </div>
              )}
            </div>
          ) : (
            /* Collection Form Phase */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selected Comic Display */}
              <div className="bg-gray-50 p-4 border-2 border-ink-black comic-border">
                <h3 className="font-super-squad text-lg text-ink-black mb-3">SELECTED COMIC</h3>
                <div className="flex items-start space-x-4">
                  {selectedComic?.cover_image && (
                    <img
                      src={selectedComic.cover_image}
                      alt={`${selectedComic.title} ${selectedComic.issue}`}
                      className="w-20 h-30 object-cover border border-ink-black flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-persona-aura font-bold text-lg text-ink-black">
                      {selectedComic?.title} {selectedComic?.issue}
                    </h4>
                    <p className="font-persona-aura text-gray-600 mb-1">
                      {selectedComic?.publisher}
                    </p>
                    <p className="font-persona-aura text-stan-lee-blue font-semibold">
                      Market Value: £{selectedComic?.market_value.toFixed(2)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCollectionForm(false)}
                    className="text-gray-500 hover:text-kirby-red transition-colors"
                  >
                    Change Comic
                  </button>
                </div>
              </div>

              {/* Collection Details Form */}
              <div className="space-y-4">
                <h3 className="font-super-squad text-lg text-ink-black border-b-2 border-ink-black pb-1">
                  YOUR COLLECTION DETAILS
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
                  onClick={() => setShowCollectionForm(false)}
                  className="px-6 py-3 font-persona-aura font-semibold text-ink-black hover:text-kirby-red transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={addToCollectionMutation.isPending}
                  className="comic-button flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addToCollectionMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Adding to Collection...</span>
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
          )}
        </div>
      </div>
    </div>
  )
}

export default ComicSearchModal