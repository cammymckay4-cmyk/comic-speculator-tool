import React, { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { SORT_OPTIONS } from '@/utils/constants'

interface SortDropdownProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (option: string) => {
    onChange(option)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border-comic border-ink-black shadow-comic-sm
                 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-comic
                 transition-all duration-150"
      >
        <span className="font-persona-aura font-semibold text-ink-black">
          Sort: {SORT_OPTIONS[value as keyof typeof SORT_OPTIONS]?.label || 'Select'}
        </span>
        <ChevronDown 
          size={18} 
          className={`text-ink-black transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 w-56 bg-white comic-border shadow-comic-lg z-50">
            <div className="py-2">
              {Object.entries(SORT_OPTIONS).map(([key, option]) => (
                <button
                  key={key}
                  onClick={() => handleSelect(key)}
                  className="w-full px-4 py-2 text-left hover:bg-golden-age-yellow hover:bg-opacity-20
                           transition-colors duration-150 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{option.icon}</span>
                    <span className="font-persona-aura text-ink-black">
                      {option.label}
                    </span>
                  </div>
                  {value === key && (
                    <Check size={16} className="text-kirby-red" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default SortDropdown
