import { create } from 'zustand'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearAllToasts: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9)
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }))
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }))
  },
  clearAllToasts: () => {
    set({ toasts: [] })
  }
}))

// Convenience function for easy toast creation
export const toast = {
  success: (title: string, message?: string) => {
    useToastStore.getState().addToast({ type: 'success', title, message })
  },
  error: (title: string, message?: string) => {
    useToastStore.getState().addToast({ type: 'error', title, message })
  },
  warning: (title: string, message?: string) => {
    useToastStore.getState().addToast({ type: 'warning', title, message })
  },
  info: (title: string, message?: string) => {
    useToastStore.getState().addToast({ type: 'info', title, message })
  }
}