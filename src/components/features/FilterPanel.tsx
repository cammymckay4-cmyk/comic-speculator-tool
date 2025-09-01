import React, { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { PUBLISHERS, COMIC_CONDITIONS } from '@/utils/constants'

interface FilterPanelProps {
  onClose: () => void
  onApply: (filters: any) => void
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onClose, onApply }) => {
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>([])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [yearRange, setYearRange] = useState({ min: '', max: '' })

  const handleApply = () => {
    onApply({
      publishers: selectedPublishers,
      conditions: selectedConditions,
      priceRange,
      yearRange,
    })
  }

  const handleReset = () => {
    setSelectedPublishers([])
    setSelectedConditions([])
    setPriceRange({ min: '', max: '' })
    setYearRange({ min: '', max: '' })
  }

  return (
    <div className="bg-white border-b-comic border-ink-black shadow-comic-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-super-squad text-2xl text-ink-black">FILTER COLLECTION</h3>
          <button
            onClick={onClose}
            className="text-ink-black hover:text-kirby-red transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Publishers */}
          <div>
            <label className="font-super-squad text-sm text-ink-black mb-2 block">
              PUBLISHERS
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {PUBLISHERS.map((publisher) => (
                <label key={publisher} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPublishers.includes(publisher)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPublishers([...selectedPublishers, publisher])
                      } else {
                        setSelectedPublishers(selectedPublishers.filter(p => p !== publisher))
                      }
                    }}
                    className="w-4 h-4 text-kirby-red border-2 border-ink-black focus:ring-0"
                  />
                  <span className="font-persona-aura text-sm text-ink-black">
                    {publisher}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div>
            <label className="font-super-squad text-sm text-ink-black mb-2 block">
              CONDITION
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {COMIC_CONDITIONS.slice(0, 8).map((condition) => (
                <label key={condition.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedConditions.includes(condition.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedConditions([...selectedConditions, condition.value])
                      } else {
                        setSelectedConditions(selectedConditions.filter(c => c !== condition.value))
                      }
                    }}
                    className="w-4 h-4 text-kirby-red border-2 border-ink-black focus:ring-0"
                  />
                  <span className="font-persona-aura text-sm text-ink-black">
                    {condition.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="font-super-squad text-sm text-ink-black mb-2 block">
              PRICE RANGE (£)
            </label>
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-full comic-input py-2"
              />
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-full comic-input py-2"
              />
            </div>
          </div>

          {/* Year Range */}
          <div>
            <label className="font-super-squad text-sm text-ink-black mb-2 block">
              YEAR RANGE
            </label>
            <div className="space-y-3">
              <input
                type="number"
                placeholder="From"
                value={yearRange.min}
                onChange={(e) => setYearRange({ ...yearRange, min: e.target.value })}
                className="w-full comic-input py-2"
              />
              <input
                type="number"
                placeholder="To"
                value={yearRange.max}
                onChange={(e) => setYearRange({ ...yearRange, max: e.target.value })}
                className="w-full comic-input py-2"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={handleReset}
            className="px-6 py-2 text-ink-black hover:text-kirby-red font-persona-aura font-semibold transition-colors"
          >
            Reset All
          </button>
          <button
            onClick={handleApply}
            className="comic-button"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterPanel
