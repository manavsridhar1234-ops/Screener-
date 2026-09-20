export interface NormalizedStock {
  symbol: string;
  companyName: string;
  exchange: string;
  country: string;
  currency: string;
  sector: string | null;
  industry: string | null;
  marketCap: number | null;
  enterpriseValue: number | null;
  employees: number | null;
  price: number | null;
  peRatio: number | null;
  forwardPe: number | null;
  priceToBook: number | null;
  priceToSales: number | null;
  dividendYield: number | null;
  eps: number | null;
  revenue: number | null;
  revenueGrowth: number | null;
  grossProfit: number | null;
  grossMargin: number | null;
  operatingIncome: number | null;
  operatingMargin: number | null;
  netIncome: number | null;
  netMargin: number | null;
  totalAssets: number | null;
  totalLiabilities: number | null;
  totalDebt: number | null;
  totalCash: number | null;
  netDebt: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  quickRatio: number | null;
  operatingCashFlow: number | null;
  freeCashFlow: number | null;
  returnOnEquity: number | null;
  returnOnAssets: number | null;
  returnOnInvestedCapital: number | null;
  // Performance metrics
  dayChange: number | null;
  dayChangePercent: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  distFrom52wHigh: number | null;
  volume: number | null;
  avgVolume: number | null;
  beta: number | null;
  earningsYield: number | null;
  evToEbitda: number | null;
  evToRevenue: number | null;
  fcfMargin: number | null;
  // Metadata
  lastUpdated: string;
  source: string;
  fiscalYearEnd?: string | null;
  businessSummary?: string | null;
  website?: string | null;
}

export type MarketCapCategory = 'mega' | 'large' | 'mid' | 'small' | 'micro' | 'all';

export interface FilterRange {
  min: number | null;
  max: number | null;
  includeMissing: boolean;
}

export interface ScreenerFilters {
  search: string;
  universe: 'all' | 'us' | 'india' | 'custom';
  exchanges: string[];
  sectors: string[];
  marketCapCategory: MarketCapCategory;
  // Numerical filters
  marketCap: FilterRange;
  enterpriseValue: FilterRange;
  peRatio: FilterRange;
  forwardPe: FilterRange;
  priceToBook: FilterRange;
  priceToSales: FilterRange;
  evToEbitda: FilterRange;
  dividendYield: FilterRange;
  earningsYield: FilterRange;
  revenue: FilterRange;
  revenueGrowth: FilterRange;
  grossMargin: FilterRange;
  operatingMargin: FilterRange;
  netMargin: FilterRange;
  returnOnEquity: FilterRange;
  returnOnAssets: FilterRange;
  eps: FilterRange;
  freeCashFlow: FilterRange;
  fcfMargin: FilterRange;
  debtToEquity: FilterRange;
  currentRatio: FilterRange;
  quickRatio: FilterRange;
  price: FilterRange;
  dayChangePercent: FilterRange;
  distFrom52wHigh: FilterRange;
  beta: FilterRange;
}

export interface ScreenerPreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  filters: Partial<ScreenerFilters>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface HistoricalQuote {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StatementRow {
  label: string;
  period: string;
  value: number | null;
  currency: string;
}

export interface StockDetailData {
  profile: NormalizedStock;
  history: HistoricalQuote[];
  incomeStatement?: StatementRow[];
  balanceSheet?: StatementRow[];
  cashFlow?: StatementRow[];
  dataFreshness: {
    lastUpdated: string;
    source: string;
    isRealtime: boolean;
    missingFieldsCount: number;
    totalFieldsCount: number;
  };
}

export type TableColumnId =
  | 'company'
  | 'symbol'
  | 'exchange'
  | 'country'
  | 'sector'
  | 'marketCap'
  | 'price'
  | 'dayChangePercent'
  | 'peRatio'
  | 'forwardPe'
  | 'priceToBook'
  | 'priceToSales'
  | 'dividendYield'
  | 'revenue'
  | 'revenueGrowth'
  | 'grossMargin'
  | 'operatingMargin'
  | 'netMargin'
  | 'returnOnEquity'
  | 'returnOnAssets'
  | 'debtToEquity'
  | 'currentRatio'
  | 'quickRatio'
  | 'freeCashFlow'
  | 'enterpriseValue'
  | 'evToEbitda'
  | 'beta'
  | 'distFrom52wHigh';

export interface ColumnDefinition {
  id: TableColumnId;
  label: string;
  group: 'overview' | 'valuation' | 'profitability' | 'health' | 'performance';
  defaultVisible: boolean;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
}

export interface SectorPercentileRank {
  metricKey: string;
  metricLabel: string;
  stockValue: number | null;
  sectorMedian: number | null;
  percentile: number; // 0 to 100
  rank: number; // 1 = best
  totalCompared: number;
  badgeType: 'positive' | 'neutral' | 'caution' | 'na';
  headline: string; // e.g., "Cheaper P/E than 82% of Technology peers"
  detail: string; // e.g., "P/E 28.2x vs sector median 34.5x"
  isHigherBetter: boolean;
}

export interface PeerBenchmarkData {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  country: string;
  currency: string;
  peerStocks: NormalizedStock[];
  percentileRanks: SectorPercentileRank[];
  sectorMedianMetrics: Record<string, number | null>;
  totalSectorCompanies: number;
  summary: string;
}

export type ExperienceLevel = 'beginner' | 'pro';

export interface FinancialGrowthPoint {
  year: string;
  date: string;
  revenue: number | null;
  netIncome: number | null;
  freeCashFlow: number | null;
  operatingCashFlow?: number | null;
  grossProfit?: number | null;
  revenueGrowthYoY?: number | null;
  netIncomeGrowthYoY?: number | null;
  fcfMargin?: number | null;
}

export interface MetricDefinition {
  key: string;
  name: string;
  category: 'Valuation' | 'Profitability' | 'Financial Health' | 'Growth' | 'Cash Flow' | 'Performance';
  formula: string;
  beginnerSummary: string;
  beginnerAnalogy: string;
  proExplanation: string;
  higherIsBetter: boolean | 'contextual';
  benchmarkGuide: string;
  unit: 'ratio' | 'currency' | 'percent' | 'number';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
