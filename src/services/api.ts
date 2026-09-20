import type {
  NormalizedStock,
  HistoricalQuote,
  StatementRow,
  ScreenerFilters,
  ScreenerPreset,
  PeerBenchmarkData,
  FinancialGrowthPoint,
} from '../types';

export interface ScreenerResponse {
  stocks: NormalizedStock[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  availableSectors: string[];
  availableExchanges: string[];
  lastUpdated: string;
  universeCount: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  quoteType: string;
  country: string;
}

/**
 * Fetch screener filtered stocks
 */
export async function fetchScreenerStocks(
  filters: Partial<ScreenerFilters> = {},
  sortBy: string = 'marketCap',
  sortOrder: 'asc' | 'desc' = 'desc',
  page: number = 1,
  pageSize: number = 50
): Promise<ScreenerResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.universe) params.set('universe', filters.universe);
  if (filters.marketCapCategory) params.set('marketCapCategory', filters.marketCapCategory);
  if (filters.sectors && filters.sectors.length > 0) {
    filters.sectors.forEach(s => params.append('sectors', s));
  }
  if (filters.exchanges && filters.exchanges.length > 0) {
    filters.exchanges.forEach(e => params.append('exchanges', e));
  }

  // Numerical range filters
  const rangeKeys = [
    'marketCap', 'enterpriseValue', 'peRatio', 'forwardPe', 'priceToBook',
    'priceToSales', 'evToEbitda', 'dividendYield', 'earningsYield',
    'revenue', 'revenueGrowth', 'grossMargin', 'operatingMargin', 'netMargin',
    'returnOnEquity', 'returnOnAssets', 'eps', 'freeCashFlow', 'fcfMargin',
    'debtToEquity', 'currentRatio', 'quickRatio', 'price',
    'dayChangePercent', 'distFrom52wHigh', 'beta'
  ] as const;

  for (const key of rangeKeys) {
    const range = (filters as any)[key];
    if (range) {
      if (range.min !== null && range.min !== undefined && range.min !== '') {
        params.set(`${key}Min`, String(range.min));
      }
      if (range.max !== null && range.max !== undefined && range.max !== '') {
        params.set(`${key}Max`, String(range.max));
      }
      params.set(`${key}Inc`, String(range.includeMissing ?? true));
    }
  }

  params.set('sortBy', sortBy);
  params.set('sortOrder', sortOrder);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const res = await fetch(`/api/screener/stocks?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch screener data (${res.status})`);
  }
  return res.json();
}

/**
 * Fetch screener presets
 */
export async function fetchPresets(): Promise<ScreenerPreset[]> {
  const res = await fetch('/api/screener/presets');
  if (!res.ok) throw new Error('Failed to fetch presets');
  const data = await res.json();
  return data.presets || [];
}

/**
 * Add custom ticker to universe
 */
export async function addStockToUniverse(symbol: string): Promise<NormalizedStock> {
  const res = await fetch('/api/screener/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to add ticker to universe');
  }
  return data.stock;
}

/**
 * Trigger universe refresh
 */
export async function refreshUniverseData(): Promise<{ count: number; refreshedAt: string }> {
  const res = await fetch('/api/screener/refresh', { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to refresh universe');
  return data;
}

/**
 * Search stocks across exchanges
 */
export async function searchCompanies(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) return [];
  const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query.trim())}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

/**
 * Fetch stock profile & fundamentals
 */
export async function fetchStockFundamentals(symbol: string): Promise<NormalizedStock> {
  const res = await fetch(`/api/stocks/${encodeURIComponent(symbol)}/fundamentals`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch fundamentals for ${symbol}`);
  }
  return data.stock;
}

/**
 * Fetch stock historical quotes
 */
export async function fetchStockHistory(
  symbol: string,
  range: '1d' | '5d' | '1m' | '6m' | '1y' | '5y' | 'all' = '1y'
): Promise<HistoricalQuote[]> {
  const res = await fetch(`/api/stocks/${encodeURIComponent(symbol)}/history?range=${range}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch history for ${symbol}`);
  }
  return data.quotes || [];
}

/**
 * Fetch stock financial statements and multi-year growth series
 */
export async function fetchStockStatements(symbol: string): Promise<{
  is: StatementRow[];
  bs: StatementRow[];
  cf: StatementRow[];
  growthSeries: FinancialGrowthPoint[];
}> {
  const res = await fetch(`/api/stocks/${encodeURIComponent(symbol)}/statements`);
  if (!res.ok) return { is: [], bs: [], cf: [], growthSeries: [] };
  const data = await res.json();
  return {
    is: data.is || [],
    bs: data.bs || [],
    cf: data.cf || [],
    growthSeries: data.growthSeries || [],
  };
}

/**
 * Fetch peer benchmark data and sector percentile rankings
 */
export async function fetchStockPeers(symbol: string): Promise<PeerBenchmarkData | null> {
  const res = await fetch(`/api/stocks/${encodeURIComponent(symbol)}/peers`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.benchmark || null;
}

/**
 * Ask In-House Stock AI Assistant
 */
export async function askStockAiApi(payload: {
  symbol: string;
  question: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  experienceLevel?: 'beginner' | 'pro';
  stock?: NormalizedStock;
  benchmarkData?: PeerBenchmarkData | null;
  growthSeries?: FinancialGrowthPoint[];
}): Promise<string> {
  const res = await fetch('/api/ai/stock-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to get AI analysis');
  }
  return data.answer;
}
