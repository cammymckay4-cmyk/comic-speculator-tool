// User and Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  subscriptionTier: 'free' | 'pro' | 'premium';
  subscriptionStatus: 'active' | 'inactive' | 'cancelled' | 'trial';
  joinDate: string;
  lastActive?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  currency: 'USD' | 'GBP' | 'EUR';
  collectionView: 'grid' | 'list';
  defaultCondition?: ComicCondition;
  favoritePublishers?: string[];
  favoriteCharacters?: string[];
}

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  name?: string;
  rememberMe?: boolean;
}

// User Profile Types (for secure profile system)
export interface UserProfile {
  id: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  username?: string;
  avatarUrl?: string | null;
  bio?: string | null;
}

// Comic and Collection Types
export interface Comic {
  id: string;
  title: string;
  issue: string;
  issueNumber: number;
  seriesId?: string;
  publisher: string;
  publishDate: string;
  coverImageUrl: string;
  thumbnailImage?: string;
  creators: ComicCreator[];
  description?: string;
  pageCount?: number;
  format: ComicFormat;
  isbn?: string;
  upc?: string;
  diamondCode?: string;
  variantDescription?: string;
  isVariant: boolean;
  isKeyIssue: boolean;
  keyIssueReason?: string;
  storyArcs?: string[];
  characters?: string[];
  teams?: string[];
  locations?: string[];
  genres?: string[];
  tags?: string[];
  prices: ComicPrice[];
  marketValue?: number;
  lastUpdated: string;
}

export interface ComicCreator {
  name: string;
  role: 'writer' | 'artist' | 'penciler' | 'inker' | 'colorist' | 'letterer' | 'cover' | 'editor';
}

export interface ComicPrice {
  condition: ComicCondition;
  price: number;
  currency: string;
  source: string;
  date: string;
}

export type ComicFormat = 
  | 'single-issue' 
  | 'trade-paperback' 
  | 'hardcover' 
  | 'graphic-novel' 
  | 'digital' 
  | 'omnibus' 
  | 'deluxe-edition'
  | 'treasury-edition'
  | 'magazine';

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

// Alert Types
export interface UserAlert {
  id: string;
  userId: string;
  comicId?: string;
  comic?: Comic;
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
}

// Collection Types
export interface UserCollection {
  id: string;
  userId: string;
  comics: CollectionComic[];
  totalValue: number;
  totalComics: number;
  lastUpdated: string;
  name?: string;
  isPublic: boolean;
}

export interface CollectionComic {
  comicId: string;
  comic: Comic;
  condition: ComicCondition;
  purchasePrice?: number;
  purchaseDate?: string;
  purchaseLocation?: string;
  notes?: string;
  images?: string[];
  addedDate: string;
  tags?: string[];
}

// News Types
export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  category: NewsCategory;
  tags: string[];
  featuredImage?: string;
  relatedComics?: string[];
  isBreaking?: boolean;
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
