// Helper functions for localStorage with timestamp and cleanup
export const setAuthStorage = (key: string, value: string, expiryMinutes = 60) => {
  const now = new Date()
  const item = {
    value: value,
    expiry: now.getTime() + (expiryMinutes * 60 * 1000)
  }
  localStorage.setItem(key, JSON.stringify(item))
}

export const getAuthStorage = (key: string) => {
  const itemStr = localStorage.getItem(key)
  if (!itemStr) {
    return null
  }
  try {
    const item = JSON.parse(itemStr)
    const now = new Date()
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key)
      return null
    }
    return item.value
  } catch (e) {
    // Handle old format or corrupted data
    localStorage.removeItem(key)
    return null
  }
}

export const clearAuthStorage = (key: string) => {
  localStorage.removeItem(key)
}

// Clean up expired auth storage items
export const cleanupExpiredAuthStorage = () => {
  const authKeys = ['authReturnPath', 'authIntendedAction', 'shouldRedirectToAccount', 'hasNavigatedAfterAuth']
  authKeys.forEach(key => {
    getAuthStorage(key) // This will automatically clean up expired items
  })
}