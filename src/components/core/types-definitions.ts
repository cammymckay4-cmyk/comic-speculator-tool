// User and Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  subscriptionTier: 'free' | 'pro' | 'premium';
  subscriptionStatus: 'active' | 'inactive' | 'cancelled' | 'trial';
  joinDate: string;
  lastLogin?: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
}

// Comic and Collection Types
export interface Comic {
  id: string;
  title: string;
  issueNumber?: string;
  seriesId?: string;
  publisher: Publisher;
  publishDate: string;
  coverImage: string;
  coverImageThumbnail?: string;
  creators: Creator[];
  description?: string;
  pageCount?: number;
  format: ComicFormat;
  genres: string[];
  isbn?: string;
  upc?: string;
  marketValue?: MarketValue;
  rarity: RarityLevel;
  keyIssue?: boolean;
  keyIssueNotes?: string[];
}

export interface ComicSeries {
  id: string;
  title: string;
  publisher: Publisher;
  startYear: number;
  endYear?: number;
  status: 'ongoing' | 'completed' | 'cancelled' | 'hiatus';
  issueCount?: number;
  description?: string;
  genres: string[];
  coverImage?: string;
}

export interface Publisher {
  id: string;
  name: string;
  founded?: number;
  logo?: string;
  website?: string;
}

export interface Creator {
  id: string;
  name: string;
  role: CreatorRole;
  avatar?: string;
}

export type CreatorRole = 'writer' | 'artist' | 'penciller' | 'inker' | 'colorist' | 'letterer' | 'editor' | 'cover-artist';

export type ComicFormat = 'standard' | 'variant' | 'limited' | 'foil' | 'sketch' | 'blank' | 'incentive' | 'exclusive';

export type RarityLevel = 'common' | 'uncommon' | 'rare' | 'very-rare' | 'ultra-rare' | 'legendary';

export interface MarketValue {
  current: number;
  currency: string;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage?: number;
  priceHistory?: PricePoint[];
}

export interface PricePoint {
  date: string;
  price: number;
  source?: string;
}

// Collection Types
export interface UserCollection {
  id: string;
  userId: string;
  comics: CollectedComic[];
  totalValue?: number;
  lastUpdated: string;
  isPublic: boolean;
  name?: string;
  description?: string;
}

export interface CollectedComic {
  comicId: string;
  comic: Comic;
  condition: ComicCondition;
  grade?: number;
  purchasePrice?: number;
  purchaseDate?: string;
  purchaseLocation?: string;
  notes?: string;
  images?: string[];
  addedDate: string;
  tags?: string[];
}

export type ComicCondition = 
  | 'mint' 
  | 'near-mint-plus' 
  | 'near-mint' 
  | 'near-mint-minus'
  | 'very-fine-plus'
  | 'very-fine'
  | 'very-fine-minus'
  | 'fine-plus'
  | 'fine'
  | 'fine-minus'
  | 'very-good-plus'
  | 'very-good'
  | 'very-good-minus'
  | 'good-plus'
  | 'good'
  | 'fair'
  | 'poor';

// Wishlist Types
export interface UserWishlist {
  id: string;
  userId: string;
  comics: WishlistComic[];
  lastUpdated: string;
  name?: string;
}

export interface WishlistComic {
  comicId: string;
  comic: Comic;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  maxPrice?: number;
  minCondition?: ComicCondition;
  notes?: string;
  addedDate: string;
  tags?: string[];
}

// Alert Types
export interface UserAlert {
  id: string;
  userId: string;
  comicId?: string;
  comic?: Comic;
  seriesId?: string;
  series?: ComicSeries;
  type: AlertType;
  criteria: AlertCriteria;
  isActive: boolean;
  createdDate: string;
  lastTriggered?: string;
  triggerCount: number;
  name: string;
  description?: string;
}

export type AlertType = 
  | 'price-drop' 
  | 'price-increase' 
  | 'new-issue' 
  | 'availability' 
  | 'auction-ending'
  | 'market-trend'
  | 'news-mention';

export interface AlertCriteria {
  priceThreshold?: number;
  priceDirection?: 'above' | 'below';
  condition?: ComicCondition;
  marketplace?: string[];
  keywords?: string[];
  publishers?: string[];
  creators?: string[];
}

// News Types
export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  lastUpdated?: string;
  source: string;
  sourceUrl?: string;
  category: NewsCategory;
  tags: string[];
  featuredImage?: string;
  relatedComics?: string[];
  isBreaking?: boolean;
  views?: number;
}

export type NewsCategory = 
  | 'industry-news'
  | 'new-releases'
  | 'creator-news'
  | 'publisher-news'
  | 'market-trends'
  | 'reviews'
  | 'interviews'
  | 'events';

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  publisher?: string[];
  creators?: string[];
  genres?: string[];
  yearRange?: [number, number];
  priceRange?: [number, number];
  condition?: ComicCondition[];
  format?: ComicFormat[];
  rarity?: RarityLevel[];
  sortBy?: SortOption;
  sortOrder?: 'asc' | 'desc';
}

export type SortOption = 
  | 'title'
  | 'issue-number'
  | 'publish-date'
  | 'added-date'
  | 'market-value'
  | 'purchase-price'
  | 'relevance';

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Component Prop Types
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

// Subscription and Payment Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: PlanFeature[];
  isPopular?: boolean;
  trialDays?: number;
  maxCollectionSize?: number;
  maxAlerts?: number;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  description?: string;
  limit?: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

// Error Types
export interface FormError {
  field: string;
  message: string;
}

export interface ValidationError {
  [key: string]: string | undefined;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Hook Types
export interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

// Context Types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (credentials: AuthFormData) => Promise<void>;
  signUp: (userData: AuthFormData) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Event Types
export interface NavigationEvent {
  page: string;
  params?: Record<string, any>;
}

export interface ComicActionEvent {
  action: 'add-to-collection' | 'add-to-wishlist' | 'create-alert' | 'view-details';
  comicId: string;
  comic?: Comic;
}

// Local Storage Keys
export enum StorageKeys {
  USER_PREFERENCES = 'comicscout_user_preferences',
  SEARCH_HISTORY = 'comicscout_search_history',
  COLLECTION_VIEW = 'comicscout_collection_view',
  AUTH_TOKEN = 'comicscout_auth_token',
  THEME = 'comicscout_theme',
}