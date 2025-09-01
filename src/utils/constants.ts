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
  SUPER_SQUAD: "'Super Squad', Impact, sans-serif",
  PERSONA_AURA: "'Persona Aura', system-ui, sans-serif",
  INTER: "'Inter', sans-serif",
} as const;

// Comic Categories
export const PUBLISHERS = [
  'Marvel Comics',
  'DC Comics',
  'Image Comics',
  'Dark Horse Comics',
  'IDW Publishing',
  'Boom! Studios',
  'Valiant Comics',
  'Dynamite Entertainment',
  'Aftershock Comics',
  'Black Mask Studios',
] as const;

export const COMIC_CONDITIONS = [
  { value: 'mint', label: 'Mint (MT)', grade: '10.0' },
  { value: 'near-mint-plus', label: 'Near Mint+ (NM+)', grade: '9.6-9.8' },
  { value: 'near-mint', label: 'Near Mint (NM)', grade: '9.2-9.4' },
  { value: 'near-mint-minus', label: 'Near Mint- (NM-)', grade: '9.0' },
  { value: 'very-fine-plus', label: 'Very Fine+ (VF+)', grade: '8.5' },
  { value: 'very-fine', label: 'Very Fine (VF)', grade: '8.0' },
  { value: 'very-fine-minus', label: 'Very Fine- (VF-)', grade: '7.5' },
  { value: 'fine-plus', label: 'Fine+ (FN+)', grade: '6.5' },
  { value: 'fine', label: 'Fine (FN)', grade: '6.0' },
  { value: 'fine-minus', label: 'Fine- (FN-)', grade: '5.5' },
  { value: 'very-good-plus', label: 'Very Good+ (VG+)', grade: '4.5' },
  { value: 'very-good', label: 'Very Good (VG)', grade: '4.0' },
  { value: 'very-good-minus', label: 'Very Good- (VG-)', grade: '3.5' },
  { value: 'good-plus', label: 'Good+ (G+)', grade: '2.5' },
  { value: 'good', label: 'Good (G)', grade: '2.0' },
  { value: 'fair', label: 'Fair (FR)', grade: '1.5' },
  { value: 'poor', label: 'Poor (PR)', grade: '0.5-1.0' },
] as const;

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    price: 0,
    maxCollection: 50,
    maxAlerts: 3,
    features: [
      'Basic collection management',
      'Up to 50 comics',
      'Up to 3 price alerts',
      'Weekly newsletter',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 9.99,
    maxCollection: 500,
    maxAlerts: 20,
    features: [
      'Advanced collection tools',
      'Up to 500 comics',
      'Up to 20 price alerts',
      'Daily market updates',
      'Export collection data',
      'Priority support',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    price: 19.99,
    maxCollection: -1, // Unlimited
    maxAlerts: -1, // Unlimited
    features: [
      'Unlimited collection size',
      'Unlimited price alerts',
      'Real-time market data',
      'Advanced analytics',
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
