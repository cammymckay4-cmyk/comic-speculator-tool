import type { EbayStatus } from './types'

/**
 * Generates sample eBay status data for demonstration purposes
 * In production, this would be replaced with real eBay API integration
 */
export function generateSampleEbayStatus(): EbayStatus | undefined {
  // 70% chance of having no eBay data
  if (Math.random() < 0.7) {
    return undefined
  }

  const hasLiveListings = Math.random() < 0.6
  const hasEndingSoon = Math.random() < 0.3
  
  if (!hasLiveListings && !hasEndingSoon) {
    return undefined
  }

  return {
    hasLiveListings,
    hasEndingSoon,
    liveListingsCount: hasLiveListings ? Math.floor(Math.random() * 8) + 1 : 0,
    endingSoonCount: hasEndingSoon ? Math.floor(Math.random() * 3) + 1 : 0,
    priceRange: {
      min: Math.floor(Math.random() * 50) + 10,
      max: Math.floor(Math.random() * 200) + 100,
      currency: 'USD'
    },
    lastChecked: new Date().toISOString()
  }
}

/**
 * Adds eBay status to comic data
 */
export function addEbayStatusToComic<T extends { id: string }>(comic: T): T & { ebayStatus?: EbayStatus } {
  return {
    ...comic,
    ebayStatus: generateSampleEbayStatus()
  }
}