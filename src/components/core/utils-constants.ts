// Theme and Styling Constants
export const COLORS = {
  PARCHMENT: '#FDF6E3',
  INK_BLACK: '#1C1C1C',
  STAN_LEE_BLUE: '#003049',
  KIRBY_RED: '#D62828',
  GOLDEN_AGE_YELLOW: '#F7B538',
} as const;

export const FONTS = {
  BANGERS: "'Bangers', cursive",
  INTER: "'Inter', sans-serif",
} as const;

// Comic Condition Values and Labels
export const COMIC_CONDITIONS = {
  'mint': { label: 'Mint (MT)', grade: 10, description: 'Perfect condition' },
  'near-mint-plus': { label: 'Near Mint+ (NM+)', grade: 9.6, description: 'Nearly perfect' },
  'near-mint': { label: 'Near Mint (NM)', grade: 9.4, description: 'Minor flaws' },
  'near-mint-minus': { label: 'Near Mint- (NM-)', grade: 9.2, description: 'Very minor defects' },
  'very-fine-plus': { label: 'Very Fine+ (VF+)', grade: 8.5, description: 'Minor wear' },
  'very-fine': { label: 'Very Fine (VF)', grade: 8.0, description: 'Light wear' },
  'very-fine-minus': { label: 'Very Fine- (VF-)', grade: 7.5, description: 'Moderate wear' },
  'fine-plus': { label: 'Fine+ (FN+)', grade: 6.5, description: 'Noticeable wear' },
  'fine': { label: 'Fine (FN)', grade: 6.0, description: 'Above average' },
  'fine-minus': { label: 'Fine- (FN-)', grade: 5.5, description: 'Below average' },
  'very-good-plus': { label: 'Very Good+ (VG+)', grade: 4.5, description: 'Used condition' },
  'very-good': { label: 'Very Good (VG)', grade: 4.0, description: 'Well-read' },
  'very-good-minus': { label: 'Very Good- (VG-)', grade: 3.5, description: 'Heavily used' },
  'good-plus': { label: 'Good+ (GD+)', grade: 2.5, description: 'Poor condition' },
  'good': { label: 'Good (GD)', grade: 2.0, description: 'Readable copy' },
  'fair': { label: 'Fair (FR)', grade: 1.5, description: 'Damaged but complete' },
  'poor': { label: 'Poor (PR)', grade: 1.0, description: 'Severely damaged' },
} as const;

// Creator Roles
export const CREATOR_ROLES = {
  'writer': { label: 'Writer', icon: '✍️' },
  'artist': { label: 'Artist', icon: '🎨' },
  'penciller': { label: 'Penciller', icon: '✏️' },
  'inker': { label: 'Inker', icon: '🖋️' },
  'colorist': { label: 'Colorist', icon: '🌈' },
  'letterer': { label: 'Letterer', icon: '📝' },
  'editor': { label: 'Editor', icon: '📋' },
  'cover-artist': { label: 'Cover Artist', icon: '🖼️' },
} as const;

// Comic Formats
export const COMIC_FORMATS = {
  'standard': { label: 'Standard Issue', description: 'Regular monthly issue' },
  'variant': { label: 'Variant Cover', description: 'Alternative cover art' },
  'limited': { label: 'Limited Edition', description: 'Limited print run' },
  'foil': { label: 'Foil Cover', description: 'Metallic foil elements' },
  'sketch': { label: 'Sketch Variant', description: 'Black and white artwork' },
  'blank': { label: 'Blank Cover', description: 'Blank cover for sketches' },
  'incentive': { label: 'Retailer Incentive', description: 'Special retailer variant' },
  'exclusive': { label: 'Convention Exclusive', description: 'Convention or store exclusive' },
} as const;

// Rarity Levels
export const RARITY_LEVELS = {
  'common': { label: 'Common', color: '#6B7280', multiplier: 1 },
  'uncommon': { label: 'Uncommon', color: '#10B981', multiplier: 1.5 },
  'rare': { label: 'Rare', color: '#3B82F6', multiplier: 2.5 },
  'very-rare': { label: 'Very Rare', color: '#8B5CF6', multiplier: 4 },
  'ultra-rare': { label: 'Ultra Rare', color: '#F59E0B', multiplier: 7 },
  'legendary': { label: 'Legendary', color: '#EF4444', multiplier: 12 },
} as const;

// News Categories
export const NEWS_CATEGORIES = {
  'industry-news': { label: 'Industry News', icon: '🏢', color: COLORS.STAN_LEE_BLUE },
  'new-releases': { label: 'New Releases', icon: '🆕', color: COLORS.KIRBY_RED },
  'creator-news': { label: 'Creator News', icon: '👨‍🎨', color: COLORS.GOLDEN_AGE_YELLOW },
  'publisher-news': { label: 'Publisher News', icon: '📚', color: COLORS.INK_BLACK },
  'market-trends': { label: 'Market Trends', icon: '📈', color: '#10B981' },
  'reviews': { label: 'Reviews', icon: '⭐', color: '#8B5CF6' },
  'interviews': { label: 'Interviews', icon: '🎤', color: '#F59E0B' },
  'events': { label: 'Events', icon: '📅', color: '#EF4444' },
} as const;

// Alert Types
export const ALERT_TYPES = {
  'price-drop': { label: 'Price Drop', icon: '📉', description: 'When price drops below threshold' },
  'price-increase': { label: 'Price Increase', icon: '📈', description: 'When price rises above threshold' },
  'new-issue': { label: 'New Issue', icon: '🆕', description: 'When new issues are released' },
  'availability': { label: 'Availability', icon: '🔍', description: 'When item becomes available' },
  'auction-ending': { label: 'Auction Ending', icon: '⏰', description: 'When auctions are ending soon' },
  'market-trend': { label: 'Market Trend', icon: '📊', description: 'When market conditions change' },
  'news-mention': { label: 'News Mention', icon: '📰', description: 'When mentioned in news' },
} as const;

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'GBP',
    interval: 'monthly' as const,
    maxCollectionSize: 50,
    maxAlerts: 3,
    features: [
      'Track up to 50 comics',
      'Basic price alerts (3 max)',
      'Weekly news updates',
      'Standard support',
    ],
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    currency: 'GBP',
    interval: 'monthly' as const,
    maxCollectionSize: 500,
    maxAlerts: 25,
    features: [
      'Track up to 500 comics',
      'Advanced price alerts (25 max)',
      'Daily news updates',
      'Market trend analysis',
      'Priority support',
      'Export collection data',
    ],
    isPopular: true,
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 24.99,
    currency: 'GBP',
    interval: 'monthly' as const,
    maxCollectionSize: -1, // Unlimited
    maxAlerts: -1, // Unlimited
    features: [
      'Unlimited comic tracking',
      'Unlimited price alerts',
      'Real-time notifications',
      'Advanced market analytics',
      'Custom collection reports',
      'API access',
      'White-glove support',
      'Early access to new features',
    ],
  },
} as const;

// Sort Options
export const SORT_OPTIONS = {
  'title': { label: 'Title', icon: '🔤' },
  'issue-number': { label: 'Issue Number', icon: '#️⃣' },
  'publish-date': { label: 'Publish Date', icon: '📅' },
  'added-date': { label: 'Date Added', icon: '➕' },
  'market-value': { label: 'Market Value', icon: '💰' },
  'purchase-price': { label: 'Purchase Price', icon: '🏪' },
  'relevance': { label: 'Relevance', icon: '🎯' },
} as const;

// API Endpoints (if needed for client-side routing)
export const API_ENDPOINTS = {
  AUTH: {
    SIGN_IN: '/api/auth/signin',
    SIGN_UP: '/api/auth/signup',
    SIGN_OUT: '/api/auth/signout',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  COMICS: {
    SEARCH: '/api/comics/search',
    DETAILS: '/api/comics/:id',
    TRENDING: '/api/comics/trending',
    HOT: '/api/comics/hot',
  },
  COLLECTION: {
    GET: '/api/collection',
    ADD: '/api/collection/add',
    REMOVE: '/api/collection/remove',
    UPDATE: '/api/collection/update',
  },
  WISHLIST: {
    GET: '/api/wishlist',
    ADD: '/api/wishlist/add',
    REMOVE: '/api/wishlist/remove',
  },
  ALERTS: {
    GET: '/api/alerts',
    CREATE: '/api/alerts/create',
    UPDATE: '/api/alerts/:id',
    DELETE: '/api/alerts/:id',
  },
  NEWS: {
    GET: '/api/news',
    DETAILS: '/api/news/:id',
    CATEGORIES: '/api/news/categories',
  },
  SUBSCRIPTION: {
    PLANS: '/api/subscription/plans',
    SUBSCRIBE: '/api/subscription/subscribe',
    CANCEL: '/api/subscription/cancel',
    UPDATE: '/api/subscription/update',
  },
} as const;

// Loading Messages (Comic-themed)
export const LOADING_MESSAGES = [
  'LOADING',
  'FETCHING',
  'PROCESSING',
  'SCANNING',
  'SEARCHING',
  'POWERING UP',
  'CHARGING',
  'ACTIVATING',
  'INITIALIZING',
  'CONNECTING',
  'ASSEMBLING',
  'TRANSFORMING',
  'CALCULATING',
  'ANALYZING',
] as const;

// Comic Sound Effects for UI Feedback
export const COMIC_EFFECTS = [
  'POW!',
  'BAM!',
  'WHAM!',
  'BOOM!',
  'ZAP!',
  'KAPOW!',
  'CRASH!',
  'BANG!',
  'SMASH!',
  'THWACK!',
] as const;

// Date Formats
export const DATE_FORMATS = {
  FULL: 'MMMM do, yyyy',
  SHORT: 'MMM d, yyyy',
  NUMERIC: 'MM/dd/yyyy',
  TIME: 'h:mm a',
  DATETIME: 'MMM d, yyyy h:mm a',
  ISO: 'yyyy-MM-dd',
} as const;

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Animation Durations
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  SPLASH_SCREEN: 4000,
} as const;

// Form Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`,
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  NAME_TOO_SHORT: `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`,
  NAME_TOO_LONG: `Name cannot exceed ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`,
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please sign in to continue',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'The requested item could not be found',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SIGN_IN: 'Welcome back!',
  SIGN_UP: 'Account created successfully!',
  SIGN_OUT: 'You have been signed out',
  PROFILE_UPDATED: 'Profile updated successfully',
  COMIC_ADDED: 'Comic added to collection',
  COMIC_REMOVED: 'Comic removed from collection',
  ALERT_CREATED: 'Alert created successfully',
  ALERT_UPDATED: 'Alert updated successfully',
  ALERT_DELETED: 'Alert deleted successfully',
  SUBSCRIPTION_UPDATED: 'Subscription updated successfully',
} as const;

// Default Values
export const DEFAULTS = {
  PAGE_SIZE: 20,
  SEARCH_DEBOUNCE: 300,
  TOAST_DURATION: 5000,
  COLLECTION_VIEW: 'grid' as const,
  THEME: 'light' as const,
} as const;