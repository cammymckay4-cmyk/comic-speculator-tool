import React from 'react'
import Toast from './Toast'
import { useToastStore } from '@/store/toastStore'

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <div className="max-w-sm w-[calc(100vw-2rem)] sm:w-full space-y-2">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className="transform transition-all duration-300 ease-in-out pointer-events-auto"
            style={{ 
              transform: `translateY(${index * 8}px)`,
              zIndex: 1000 - index
            }}
          >
          <Toast
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast}
          />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ToastContainer