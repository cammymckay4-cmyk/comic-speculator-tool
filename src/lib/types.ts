// Core data types for the comic speculator tool

export interface Series {
  seriesId: string;
  title: string;
  publisher: string;
  startYear: number;
  description?: string;
  aliases?: string[];
}

export interface Issue {
  issueId: string;
  seriesId: string;
  issueNumber: string;
  coverDate: string;
  startYear: number;
  keyNotes?: string;
}

export interface Grade {
  gradeId: string;
  scale: string;
  numeric?: number;
  label: string;
  certBody?: string;
  description?: string;
}

export interface Listing {
  listingId: string;
  issueId: string;
  gradeId: string;
  title: string;
  totalPriceGBP: number;
  source: string;
  endTime?: string;
  url?: string;
}

export interface MarketValue {
  marketValueId: string;
  issueId: string;
  gradeId: string;
  windowDays: number;
  sampleCount: number;
  medianGBP: number;
  meanGBP: number;
  stdDevGBP?: number;
  minGBP: number;
  maxGBP: number;
  lastUpdated: string;
}

export interface DealScoreInfo {
  dealScoreId: string;
  listingId: string;
  issueId: string;
  gradeId: string;
  marketValueGBP: number;
  totalPriceGBP: number;
  score: number;
  computedAt: string;
}

export interface ParsedTitle {
  series: string;
  issueNumber: string;
  variant?: string;
  publisher?: string;
}

export interface TopDeal {
  listing: Listing;
  marketValue: MarketValue;
  dealScore: DealScoreInfo;
}