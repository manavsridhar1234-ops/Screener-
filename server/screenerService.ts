import fs from 'fs';
import path from 'path';
import type {
  NormalizedStock,
  ScreenerFilters,
  ScreenerPreset,
  PeerBenchmarkData,
  SectorPercentileRank,
} from '../src/types';
import { fetchStockFundamentals, normalizeStockData, resolveTickerSymbol } from './marketData';

// Map of symbol -> NormalizedStock in memory
const universeMap = new Map<string, NormalizedStock>();
let lastUniverseRefresh = new Date().toISOString();

/**
 * Default financial presets
 */
export const SCREENER_PRESETS: ScreenerPreset[] = [
  {
    id: 'value',
    name: 'Value Stocks',
    description: 'Companies with reasonable P/E, conservative P/B, and positive net profit margins.',
    badge: 'Value',
    filters: {
      peRatio: { min: 0, max: 20, includeMissing: false },
      priceToBook: { min: 0, max: 3.0, includeMissing: false },
      netMargin: { min: 5, max: null, includeMissing: false },
      debtToEquity: { min: null, max: 100, includeMissing: true }
    }
  },
  {
    id: 'quality',
    name: 'Quality Stocks',
    description: 'High return on equity, healthy net margins, and manageable debt levels.',
    badge: 'Quality',
    filters: {
      returnOnEquity: { min: 15, max: null, includeMissing: false },
      netMargin: { min: 12, max: null, includeMissing: false },
      debtToEquity: { min: 0, max: 60, includeMissing: false }
    }
  },
  {
    id: 'growth',
    name: 'Growth Stocks',
    description: 'Accelerating top-line revenue growth with positive net profitability.',
    badge: 'Growth',
    filters: {
      revenueGrowth: { min: 15, max: null, includeMissing: false },
      netMargin: { min: 5, max: null, includeMissing: false }
    }
  },
  {
    id: 'dividend',
    name: 'Dividend Yielders',
    description: 'Consistent cash flow generation and attractive dividend payout yield above 2%.',
    badge: 'Dividend',
    filters: {
      dividendYield: { min: 2.0, max: null, includeMissing: false },
      freeCashFlow: { min: 0, max: null, includeMissing: true }
    }
  },
  {
    id: 'financially_strong',
    name: 'Financially Strong',
    description: 'Strong liquidity position with current ratio > 1.3 and conservative debt.',
    badge: 'Balance Sheet',
    filters: {
      currentRatio: { min: 1.3, max: null, includeMissing: false },
      debtToEquity: { min: 0, max: 50, includeMissing: false }
    }
  },
  {
    id: 'undervalued_pe',
    name: 'Undervalued by P/E',
    description: 'Profitable companies trading at a P/E multiple below 18x.',
    badge: 'Low P/E',
    filters: {
      peRatio: { min: 0.1, max: 18, includeMissing: false },
      netMargin: { min: 0.1, max: null, includeMissing: false }
    }
  },
  {
    id: 'high_roe',
    name: 'High ROE (>20%)',
    description: 'Exceptional capital allocation with Return on Equity exceeding 20%.',
    badge: 'High ROE',
    filters: {
      returnOnEquity: { min: 20, max: null, includeMissing: false }
    }
  },
  {
    id: 'low_debt',
    name: 'Low Debt / Debt-Free',
    description: 'Companies operating with minimal financial leverage (Debt/Equity < 20%).',
    badge: 'Solvency',
    filters: {
      debtToEquity: { min: 0, max: 20, includeMissing: false }
    }
  },
  {
    id: 'profitable',
    name: 'Profitable Companies',
    description: 'Robust bottom-line net margin above 10% and operating margin above 12%.',
    badge: 'Profits',
    filters: {
      netMargin: { min: 10, max: null, includeMissing: false },
      operatingMargin: { min: 12, max: null, includeMissing: false }
    }
  }
];

/**
 * Initialize screener universe from rawSeed.json or fetch baseline
 */
export async function initializeUniverse() {
  const seedPath = path.join(process.cwd(), 'server', 'rawSeed.json');
  if (fs.existsSync(seedPath)) {
    try {
      const content = fs.readFileSync(seedPath, 'utf8');
      const items = JSON.parse(content);
      for (const item of items) {
        if (item.symbol && item.raw) {
          const normalized = normalizeStockData(item.raw, item.symbol);
          universeMap.set(normalized.symbol.toUpperCase(), normalized);
        }
      }
      console.log(`Loaded ${universeMap.size} stocks into universe from rawSeed.json`);
      lastUniverseRefresh = new Date().toISOString();
      return;
    } catch (e: any) {
      console.error('Failed to parse rawSeed.json:', e.message);
    }
  }

  // Fallback: fetch priority stocks (MSFT, SHAKTIPUMP.NS, RELIANCE.NS, AAPL)
  const priorities = ['MSFT', 'AAPL', 'NVDA', 'SHAKTIPUMP.NS', 'RELIANCE.NS', 'TCS.NS', 'INFY.NS'];
  for (const s of priorities) {
    try {
      const stock = await fetchStockFundamentals(s);
      universeMap.set(stock.symbol.toUpperCase(), stock);
    } catch (err: any) {
      console.error(`Initial fetch error for ${s}:`, err.message);
    }
  }
}

/**
 * Add or enrich a custom ticker in the universe
 */
export async function addStockToUniverse(symbolInput: string): Promise<NormalizedStock> {
  const resolved = await resolveTickerSymbol(symbolInput);
  const normalized = await fetchStockFundamentals(resolved);
  universeMap.set(normalized.symbol.toUpperCase(), normalized);
  return normalized;
}

/**
 * Refresh all stocks in the universe
 */
export async function refreshUniverse(): Promise<{ count: number; refreshedAt: string }> {
  const symbols = Array.from(universeMap.keys());
  for (const sym of symbols) {
    try {
      const fresh = await fetchStockFundamentals(sym);
      universeMap.set(sym, fresh);
    } catch (err) {
      // Keep existing data if fresh call fails
    }
  }
  lastUniverseRefresh = new Date().toISOString();
  return { count: universeMap.size, refreshedAt: lastUniverseRefresh };
}

/**
 * Helper: Check if a numeric value falls within a FilterRange
 */
function matchesRange(val: number | null | undefined, range?: { min: number | null; max: number | null; includeMissing: boolean }): boolean {
  if (!range) return true;
  const { min, max, includeMissing } = range;

  // If no min and no max are set, it matches regardless
  if (min === null && max === null) return true;

  // Missing data handling
  if (val === null || val === undefined || isNaN(val)) {
    return includeMissing;
  }

  if (min !== null && val < min) return false;
  if (max !== null && val > max) return false;
  return true;
}

/**
 * Filter and sort screener universe
 */
export function queryScreenerStocks(
  filters: Partial<ScreenerFilters> = {},
  sortBy: string = 'marketCap',
  sortOrder: 'asc' | 'desc' = 'desc',
  page: number = 1,
  pageSize: number = 50
) {
  let stocks = Array.from(universeMap.values());

  // 1. Search filter
  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    stocks = stocks.filter(
      s => s.symbol.toLowerCase().includes(q) || s.companyName.toLowerCase().includes(q)
    );
  }

  // 2. Universe filter
  if (filters.universe && filters.universe !== 'all') {
    if (filters.universe === 'us') {
      stocks = stocks.filter(s => s.country === 'United States' || (!s.symbol.endsWith('.NS') && !s.symbol.endsWith('.BO')));
    } else if (filters.universe === 'india') {
      stocks = stocks.filter(s => s.country === 'India' || s.symbol.endsWith('.NS') || s.symbol.endsWith('.BO'));
    }
  }

  // 3. Exchange filter
  if (filters.exchanges && filters.exchanges.length > 0) {
    stocks = stocks.filter(s => filters.exchanges!.includes(s.exchange));
  }

  // 4. Sector filter
  if (filters.sectors && filters.sectors.length > 0) {
    stocks = stocks.filter(s => s.sector && filters.sectors!.includes(s.sector));
  }

  // 5. Market cap category
  if (filters.marketCapCategory && filters.marketCapCategory !== 'all') {
    stocks = stocks.filter(s => {
      const mc = s.marketCap;
      if (mc === null) return false;
      const isINR = s.currency === 'INR';
      // In INR, ₹1B = 100 Crore. Mega cap ~₹1.6T (160,000 Cr ~ $20B)
      const capInUSD = isINR ? mc / 85 : mc;

      switch (filters.marketCapCategory) {
        case 'mega': return capInUSD >= 200_000_000_000;
        case 'large': return capInUSD >= 10_000_000_000 && capInUSD < 200_000_000_000;
        case 'mid': return capInUSD >= 2_000_000_000 && capInUSD < 10_000_000_000;
        case 'small': return capInUSD >= 300_000_000 && capInUSD < 2_000_000_000;
        case 'micro': return capInUSD < 300_000_000;
        default: return true;
      }
    });
  }

  // 6. Valuation filters
  stocks = stocks.filter(s => {
    return (
      matchesRange(s.marketCap, filters.marketCap) &&
      matchesRange(s.enterpriseValue, filters.enterpriseValue) &&
      matchesRange(s.peRatio, filters.peRatio) &&
      matchesRange(s.forwardPe, filters.forwardPe) &&
      matchesRange(s.priceToBook, filters.priceToBook) &&
      matchesRange(s.priceToSales, filters.priceToSales) &&
      matchesRange(s.evToEbitda, filters.evToEbitda) &&
      matchesRange(s.dividendYield, filters.dividendYield) &&
      matchesRange(s.earningsYield, filters.earningsYield) &&
      // Profitability
      matchesRange(s.revenue, filters.revenue) &&
      matchesRange(s.revenueGrowth, filters.revenueGrowth) &&
      matchesRange(s.grossMargin, filters.grossMargin) &&
      matchesRange(s.operatingMargin, filters.operatingMargin) &&
      matchesRange(s.netMargin, filters.netMargin) &&
      matchesRange(s.returnOnEquity, filters.returnOnEquity) &&
      matchesRange(s.returnOnAssets, filters.returnOnAssets) &&
      matchesRange(s.eps, filters.eps) &&
      matchesRange(s.freeCashFlow, filters.freeCashFlow) &&
      matchesRange(s.fcfMargin, filters.fcfMargin) &&
      // Financial Health
      matchesRange(s.debtToEquity, filters.debtToEquity) &&
      matchesRange(s.currentRatio, filters.currentRatio) &&
      matchesRange(s.quickRatio, filters.quickRatio) &&
      // Performance
      matchesRange(s.price, filters.price) &&
      matchesRange(s.dayChangePercent, filters.dayChangePercent) &&
      matchesRange(s.distFrom52wHigh, filters.distFrom52wHigh) &&
      matchesRange(s.beta, filters.beta)
    );
  });

  // Extract distinct sectors and exchanges for UI filters
  const allSectors = Array.from(
    new Set(Array.from(universeMap.values()).map(s => s.sector).filter(Boolean) as string[])
  ).sort();

  const allExchanges = Array.from(
    new Set(Array.from(universeMap.values()).map(s => s.exchange).filter(Boolean) as string[])
  ).sort();

  // 7. Sort stocks (numerical sorting, nulls always sorted to the end)
  const multiplier = sortOrder === 'asc' ? 1 : -1;
  stocks.sort((a, b) => {
    const valA = (a as any)[sortBy];
    const valB = (b as any)[sortBy];

    if (valA === null || valA === undefined) return 1; // nulls always at bottom
    if (valB === null || valB === undefined) return -1;

    if (typeof valA === 'string' && typeof valB === 'string') {
      return valA.localeCompare(valB) * multiplier;
    }
    return (Number(valA) - Number(valB)) * multiplier;
  });

  // 8. Pagination
  const total = stocks.length;
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const startIndex = (safePage - 1) * safePageSize;
  const paginated = safePageSize >= 500 ? stocks : stocks.slice(startIndex, startIndex + safePageSize);

  return {
    stocks: paginated,
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.ceil(total / safePageSize),
    availableSectors: allSectors,
    availableExchanges: allExchanges,
    lastUpdated: lastUniverseRefresh,
    universeCount: universeMap.size,
  };
}

/**
 * Calculate median of a number array
 */
function calculateMedian(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Automated Peer Discovery and Sector Percentile Rankings
 */
export async function getPeerBenchmarkData(symbolInput: string): Promise<PeerBenchmarkData | null> {
  const symbol = symbolInput.toUpperCase();
  let targetStock = universeMap.get(symbol);

  // If not yet cached in universe, try fetching live fundamentals
  if (!targetStock) {
    try {
      targetStock = await fetchStockFundamentals(symbol);
      if (targetStock) {
        universeMap.set(symbol, targetStock);
      }
    } catch {
      // Fallback
    }
  }

  if (!targetStock) return null;

  const targetSector = targetStock.sector || 'General';
  const targetCountry = targetStock.country || (symbol.endsWith('.NS') || symbol.endsWith('.BO') ? 'India' : 'United States');
  const allUniverse = Array.from(universeMap.values());

  // 1. Sector Peer Discovery (excluding target stock)
  const sectorStocks = allUniverse.filter(
    (s) => s.symbol.toUpperCase() !== symbol && s.sector === targetStock.sector
  );

  // Filter by country within same sector
  const sameCountrySector = sectorStocks.filter(
    (s) => s.country === targetStock.country
  ).sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));

  const diffCountrySector = sectorStocks.filter(
    (s) => s.country !== targetStock.country
  ).sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));

  // Fallback pool of same country stocks in case sector is tiny
  const sameCountryGeneral = allUniverse.filter(
    (s) => s.symbol.toUpperCase() !== symbol && s.country === targetStock.country
  ).sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));

  // Select 3 to 4 best peers
  const candidatePeers: NormalizedStock[] = [];
  const added = new Set<string>();

  const tryAdd = (st: NormalizedStock) => {
    if (!added.has(st.symbol) && st.symbol.toUpperCase() !== symbol) {
      added.add(st.symbol);
      candidatePeers.push(st);
    }
  };

  sameCountrySector.forEach(tryAdd);
  if (candidatePeers.length < 4) diffCountrySector.forEach(tryAdd);
  if (candidatePeers.length < 4) sameCountryGeneral.forEach(tryAdd);

  const finalPeers = candidatePeers.slice(0, 4);

  // 2. Cohort for Sector Percentile Calculations
  // Use all universe stocks in the same sector if >= 3, else expand to same country
  let cohort = allUniverse.filter((s) => s.sector === targetStock.sector);
  if (cohort.length < 3) {
    cohort = allUniverse.filter((s) => s.country === targetStock.country);
  }
  if (cohort.length < 3) {
    cohort = allUniverse;
  }

  // Helper to compute percentile and ranking for a given metric
  const computeMetricRank = (
    key: keyof NormalizedStock,
    label: string,
    isHigherBetter: boolean,
    formatter: (v: number | null) => string
  ): SectorPercentileRank | null => {
    const stockVal = targetStock![key] as number | null;
    const validValues = cohort
      .map((s) => s[key] as number | null)
      .filter((v): v is number => v !== null && !isNaN(v));

    if (validValues.length === 0 || stockVal === null || isNaN(stockVal)) {
      return null;
    }

    const median = calculateMedian(validValues);
    let percentile = 50;
    let rank = 1;

    if (isHigherBetter) {
      // Higher is better (e.g. ROE, Net Margin, Rev Growth)
      const countLower = validValues.filter((v) => v < stockVal).length;
      percentile = Math.round((countLower / validValues.length) * 100);
      rank = validValues.filter((v) => v > stockVal).length + 1;
    } else {
      // Lower is better / cheaper (e.g. P/E, Debt/Equity)
      const countHigher = validValues.filter((v) => v > stockVal).length;
      percentile = Math.round((countHigher / validValues.length) * 100);
      rank = validValues.filter((v) => v < stockVal).length + 1;
    }

    let badgeType: 'positive' | 'neutral' | 'caution' = 'neutral';
    let headline = '';

    if (key === 'peRatio') {
      if (percentile >= 60) {
        badgeType = 'positive';
        headline = `Cheaper P/E than ${percentile}% of ${targetSector} peers`;
      } else if (percentile <= 35) {
        badgeType = 'caution';
        headline = `P/E higher than ${100 - percentile}% of ${targetSector} peers (Premium Valuation)`;
      } else {
        badgeType = 'neutral';
        headline = `P/E in line with ${targetSector} sector median (${percentile}th percentile)`;
      }
    } else if (key === 'returnOnEquity') {
      const topPct = Math.max(1, 100 - percentile);
      if (percentile >= 65) {
        badgeType = 'positive';
        headline = `Top ${topPct}% in ROE (higher than ${percentile}% of ${targetSector} peers)`;
      } else if (percentile <= 35) {
        badgeType = 'caution';
        headline = `ROE trails sector median (${percentile}th percentile)`;
      } else {
        badgeType = 'neutral';
        headline = `ROE in line with ${targetSector} sector average`;
      }
    } else if (key === 'netMargin') {
      const topPct = Math.max(1, 100 - percentile);
      if (percentile >= 65) {
        badgeType = 'positive';
        headline = `Top ${topPct}% in Net Profit Margin (High Profitability)`;
      } else if (percentile <= 35) {
        badgeType = 'caution';
        headline = `Net margin trails ${100 - percentile}% of ${targetSector} peers`;
      } else {
        badgeType = 'neutral';
        headline = `Net profit margin aligns with sector median`;
      }
    } else if (key === 'revenueGrowth') {
      const topPct = Math.max(1, 100 - percentile);
      if (percentile >= 65) {
        badgeType = 'positive';
        headline = `Top ${topPct}% in Revenue Growth (${stockVal >= 0 ? '+' : ''}${stockVal.toFixed(1)}% YoY)`;
      } else if (percentile <= 35) {
        badgeType = 'caution';
        headline = `Revenue growth below ${100 - percentile}% of peers`;
      } else {
        badgeType = 'neutral';
        headline = `Revenue growth in line with sector average`;
      }
    } else if (key === 'debtToEquity') {
      if (percentile >= 65) {
        badgeType = 'positive';
        headline = `Lower Debt/Equity than ${percentile}% of peers (Solid Balance Sheet)`;
      } else if (percentile <= 30) {
        badgeType = 'caution';
        headline = `Elevated Debt/Equity vs ${100 - percentile}% of peers`;
      } else {
        badgeType = 'neutral';
        headline = `Debt/Equity leverage in line with sector peers`;
      }
    } else if (key === 'fcfMargin') {
      const topPct = Math.max(1, 100 - percentile);
      if (percentile >= 65) {
        badgeType = 'positive';
        headline = `Top ${topPct}% in Free Cash Flow Margin (${stockVal.toFixed(1)}%)`;
      } else {
        badgeType = 'neutral';
        headline = `FCF margin in line with sector peers`;
      }
    } else {
      const topPct = Math.max(1, 100 - percentile);
      headline = isHigherBetter
        ? `Top ${topPct}% in ${label}`
        : `Ranked #${rank} of ${validValues.length} in ${label}`;
    }

    const detail = `${label}: ${formatter(stockVal)} vs sector median ${formatter(median)} (Rank #${rank} of ${validValues.length})`;

    return {
      metricKey: String(key),
      metricLabel: label,
      stockValue: stockVal,
      sectorMedian: median,
      percentile,
      rank,
      totalCompared: validValues.length,
      badgeType,
      headline,
      detail,
      isHigherBetter,
    };
  };

  const percentiles: SectorPercentileRank[] = [
    computeMetricRank('peRatio', 'P/E (TTM)', false, (v) => (v !== null ? `${v.toFixed(1)}x` : '—')),
    computeMetricRank('returnOnEquity', 'Return on Equity', true, (v) => (v !== null ? `${v.toFixed(1)}%` : '—')),
    computeMetricRank('netMargin', 'Net Profit Margin', true, (v) => (v !== null ? `${v.toFixed(1)}%` : '—')),
    computeMetricRank('revenueGrowth', 'Revenue Growth', true, (v) => (v !== null ? `${v.toFixed(1)}%` : '—')),
    computeMetricRank('debtToEquity', 'Debt to Equity', false, (v) => (v !== null ? `${v.toFixed(1)}` : '—')),
    computeMetricRank('fcfMargin', 'FCF Margin', true, (v) => (v !== null ? `${v.toFixed(1)}%` : '—')),
  ].filter(Boolean) as SectorPercentileRank[];

  const sectorMedians: Record<string, number | null> = {
    peRatio: calculateMedian(cohort.map((s) => s.peRatio).filter((v): v is number => v !== null && !isNaN(v))),
    returnOnEquity: calculateMedian(cohort.map((s) => s.returnOnEquity).filter((v): v is number => v !== null && !isNaN(v))),
    netMargin: calculateMedian(cohort.map((s) => s.netMargin).filter((v): v is number => v !== null && !isNaN(v))),
    revenueGrowth: calculateMedian(cohort.map((s) => s.revenueGrowth).filter((v): v is number => v !== null && !isNaN(v))),
    debtToEquity: calculateMedian(cohort.map((s) => s.debtToEquity).filter((v): v is number => v !== null && !isNaN(v))),
    operatingMargin: calculateMedian(cohort.map((s) => s.operatingMargin).filter((v): v is number => v !== null && !isNaN(v))),
    fcfMargin: calculateMedian(cohort.map((s) => s.fcfMargin).filter((v): v is number => v !== null && !isNaN(v))),
  };

  // Generate automated executive summary
  const strongRanks = percentiles.filter((p) => p.badgeType === 'positive');
  const cautionRanks = percentiles.filter((p) => p.badgeType === 'caution');
  let summary = `${targetStock.companyName} is evaluated against ${cohort.length} companies in ${targetSector}.`;
  if (strongRanks.length > 0) {
    summary += ` Outperforms peer benchmarks in ${strongRanks.map((r) => r.metricLabel).join(', ')}.`;
  }
  if (cautionRanks.length > 0) {
    summary += ` Trades at higher multiples or elevated leverage in ${cautionRanks.map((r) => r.metricLabel).join(', ')}.`;
  }

  return {
    symbol: targetStock.symbol,
    companyName: targetStock.companyName,
    sector: targetSector,
    industry: targetStock.industry || 'General',
    country: targetCountry,
    currency: targetStock.currency,
    peerStocks: finalPeers,
    percentileRanks: percentiles,
    sectorMedianMetrics: sectorMedians,
    totalSectorCompanies: cohort.length,
    summary,
  };
}
