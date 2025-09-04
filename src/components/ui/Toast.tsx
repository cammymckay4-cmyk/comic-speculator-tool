import React, { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />
      case 'error':
        return <XCircle size={20} className="text-red-600" />
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-600" />
      default:
        return <AlertCircle size={20} className="text-blue-600" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className={`max-w-sm w-full transform transition-all duration-300 ease-in-out`}>
      <div className={`${getBgColor()} border-2 comic-border shadow-comic p-4 flex items-start space-x-3`}>
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="font-persona-aura font-semibold text-ink-black text-sm">
            {title}
          </p>
          {message && (
            <p className="font-persona-aura text-ink-black text-sm mt-1">
              {message}
            </p>
          )}
        </div>
        <button
          onClick={() => onClose(id)}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

export default Toast