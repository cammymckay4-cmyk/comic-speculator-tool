import React from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  variant?: 'danger' | 'warning' | 'info'
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger'
}) => {
  if (!isOpen) return null

  const getVariantClasses = () => {
    switch (variant) {
      case 'danger':
        return {
          headerBg: 'bg-gradient-to-r from-red-600 to-kirby-red',
          iconColor: 'text-red-600',
          confirmButton: 'bg-kirby-red hover:bg-red-700 text-parchment'
        }
      case 'warning':
        return {
          headerBg: 'bg-gradient-to-r from-yellow-500 to-golden-age-yellow',
          iconColor: 'text-yellow-600',
          confirmButton: 'bg-golden-age-yellow hover:bg-yellow-500 text-ink-black'
        }
      case 'info':
        return {
          headerBg: 'bg-gradient-to-r from-stan-lee-blue to-blue-600',
          iconColor: 'text-blue-600',
          confirmButton: 'bg-stan-lee-blue hover:bg-blue-700 text-parchment'
        }
    }
  }

  const variantClasses = getVariantClasses()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white comic-border shadow-comic max-w-md w-full">
        {/* Header */}
        <div className={`${variantClasses.headerBg} p-6 flex justify-between items-center`}>
          <h2 className="font-super-squad text-xl text-parchment">{title}</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-parchment hover:text-golden-age-yellow transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start space-x-4 mb-6">
            <AlertTriangle size={24} className={`${variantClasses.iconColor} flex-shrink-0 mt-1`} />
            <p className="font-persona-aura text-ink-black leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 font-persona-aura font-semibold text-ink-black hover:text-kirby-red transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-6 py-3 font-persona-aura font-semibold border-2 border-ink-black shadow-comic-sm 
                         transition-all duration-150 hover:translate-y-[-2px] hover:shadow-comic 
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none 
                         ${variantClasses.confirmButton}`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal