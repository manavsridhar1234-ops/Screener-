import YahooFinance from 'yahoo-finance2';
import type { NormalizedStock, HistoricalQuote, StatementRow, StockDetailData } from '../src/types';

// Instantiate YahooFinance client with notice suppression
const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

// In-memory cache for profiles and quotes (15-minute TTL for quotes, 24-hour for fundamentals)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const profileCache = new Map<string, CacheEntry<NormalizedStock>>();
const historyCache = new Map<string, CacheEntry<HistoricalQuote[]>>();
const statementsCache = new Map<string, CacheEntry<{ is?: StatementRow[]; bs?: StatementRow[]; cf?: StatementRow[] }>>();

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Clean & resolve symbol for Yahoo Finance
 * e.g., "SHAKTIPUMP.NSE" -> "SHAKTIPUMP.NS", "SHAKTIPUMP" -> auto-detect if Indian
 */
export async function resolveTickerSymbol(input: string): Promise<string> {
  const trimmed = input.trim().toUpperCase();
  if (!trimmed) return '';

  // If already ends with .NS or .BO
  if (trimmed.endsWith('.NSE')) {
    return trimmed.replace('.NSE', '.NS');
  }
  if (trimmed.endsWith('.BSE')) {
    return trimmed.replace('.BSE', '.BO');
  }
  if (trimmed.includes('.')) {
    return trimmed;
  }

  // Quick check if known US or directly valid
  try {
    const direct = await yf.quoteSummary(trimmed, { modules: ['price'] }).catch(() => null);
    if (direct?.price?.symbol) {
      return direct.price.symbol;
    }
  } catch {
    // Continue to search
  }

  // Fallback to search resolution
  try {
    const searchRes = await yf.search(trimmed);
    if (searchRes.quotes && searchRes.quotes.length > 0) {
      // Prioritize exact match or first quote with symbol
      const exact = searchRes.quotes.find(q => (q as any).symbol?.toUpperCase() === trimmed);
      if (exact && (exact as any).symbol) {
        return (exact as any).symbol;
      }
      const first = searchRes.quotes.find(q => (q as any).symbol);
      if (first && (first as any).symbol) {
        return (first as any).symbol;
      }
    }
  } catch {
    // Return original trimmed
  }

  return trimmed;
}

/**
 * Normalizes Yahoo Finance modules into internal NormalizedStock schema
 */
export function normalizeStockData(raw: any, symbol: string): NormalizedStock {
  const price = raw.price || {};
  const fin = raw.financialData || {};
  const stats = raw.defaultKeyStatistics || {};
  const summary = raw.summaryDetail || {};
  const profile = raw.assetProfile || {};

  const currentPrice = fin.currentPrice ?? price.regularMarketPrice ?? null;
  const peRatio = summary.trailingPE ?? stats.trailingPE ?? null;
  const earningsYield = peRatio && peRatio > 0 ? (1 / peRatio) * 100 : null;

  const totalDebt = fin.totalDebt ?? null;
  const totalCash = fin.totalCash ?? null;
  const netDebt = (totalDebt !== null && totalCash !== null) ? totalDebt - totalCash : null;

  const marketCap = price.marketCap ?? summary.marketCap ?? null;
  const ev = stats.enterpriseValue ?? null;
  const totalRevenue = fin.totalRevenue ?? null;
  const ebitda = fin.ebitda ?? null;

  const evToRevenue = (ev !== null && totalRevenue && totalRevenue > 0) ? ev / totalRevenue : null;
  const evToEbitda = stats.enterpriseToEbitda ?? ((ev !== null && ebitda && ebitda > 0) ? ev / ebitda : null);

  const freeCashFlow = fin.freeCashflow ?? null;
  const fcfMargin = (freeCashFlow !== null && totalRevenue && totalRevenue > 0)
    ? (freeCashFlow / totalRevenue) * 100
    : null;

  // 52-week high distance
  const fiftyTwoWeekHigh = summary.fiftyTwoWeekHigh ?? null;
  const fiftyTwoWeekLow = summary.fiftyTwoWeekLow ?? null;
  let distFrom52wHigh: number | null = null;
  if (currentPrice !== null && fiftyTwoWeekHigh && fiftyTwoWeekHigh > 0) {
    distFrom52wHigh = ((currentPrice - fiftyTwoWeekHigh) / fiftyTwoWeekHigh) * 100;
  }

  // Currency & country detection
  const currency = price.currency || summary.currency || (symbol.endsWith('.NS') || symbol.endsWith('.BO') ? 'INR' : 'USD');
  const country = profile.country || (symbol.endsWith('.NS') || symbol.endsWith('.BO') ? 'India' : 'United States');
  const exchange = price.exchangeName || price.exchange || (symbol.endsWith('.NS') ? 'NSE' : symbol.endsWith('.BO') ? 'BSE' : 'US');

  return {
    symbol: price.symbol || symbol,
    companyName: price.longName || price.shortName || symbol,
    exchange,
    country,
    currency,
    sector: profile.sector || null,
    industry: profile.industry || null,
    marketCap,
    enterpriseValue: ev,
    employees: profile.fullTimeEmployees ?? null,
    price: currentPrice,
    peRatio,
    forwardPe: stats.forwardPE ?? summary.forwardPE ?? null,
    priceToBook: stats.priceToBook ?? null,
    priceToSales: summary.priceToSalesTrailing12Months ?? null,
    dividendYield: summary.dividendYield !== undefined && summary.dividendYield !== null
      ? summary.dividendYield * 100
      : null,
    eps: stats.trailingEps ?? null,
    revenue: totalRevenue,
    revenueGrowth: fin.revenueGrowth !== undefined && fin.revenueGrowth !== null
      ? fin.revenueGrowth * 100
      : null,
    grossProfit: fin.grossProfits ?? null,
    grossMargin: fin.grossMargins !== undefined && fin.grossMargins !== null
      ? fin.grossMargins * 100
      : null,
    operatingIncome: stats.operatingIncome ?? null,
    operatingMargin: fin.operatingMargins !== undefined && fin.operatingMargins !== null
      ? fin.operatingMargins * 100
      : null,
    netIncome: stats.netIncomeToCommon ?? null,
    netMargin: fin.profitMargins !== undefined && fin.profitMargins !== null
      ? fin.profitMargins * 100
      : null,
    totalAssets: null, // Will be enriched from statements if available
    totalLiabilities: null,
    totalDebt,
    totalCash,
    netDebt,
    debtToEquity: fin.debtToEquity ?? null,
    currentRatio: fin.currentRatio ?? null,
    quickRatio: fin.quickRatio ?? null,
    operatingCashFlow: fin.operatingCashflow ?? null,
    freeCashFlow,
    returnOnEquity: fin.returnOnEquity !== undefined && fin.returnOnEquity !== null
      ? fin.returnOnEquity * 100
      : null,
    returnOnAssets: fin.returnOnAssets !== undefined && fin.returnOnAssets !== null
      ? fin.returnOnAssets * 100
      : null,
    returnOnInvestedCapital: null, // not natively reported, kept null per rule 9
    dayChange: price.regularMarketChange ?? null,
    dayChangePercent: price.regularMarketChangePercent !== undefined && price.regularMarketChangePercent !== null
      ? price.regularMarketChangePercent
      : null,
    fiftyTwoWeekHigh,
    fiftyTwoWeekLow,
    distFrom52wHigh,
    volume: price.regularMarketVolume ?? null,
    avgVolume: summary.averageVolume ?? summary.averageDailyVolume10Day ?? null,
    beta: stats.beta ?? summary.beta ?? null,
    earningsYield,
    evToEbitda,
    evToRevenue,
    fcfMargin,
    lastUpdated: new Date().toISOString(),
    source: 'Yahoo Finance Realtime & Financials',
    fiscalYearEnd: stats.lastFiscalYearEnd ? new Date(stats.lastFiscalYearEnd).toISOString().split('T')[0] : null,
    businessSummary: profile.longBusinessSummary || null,
    website: profile.website || null,
  };
}

/**
 * Fetch company profile & fundamentals with caching
 */
export async function fetchStockFundamentals(symbol: string): Promise<NormalizedStock> {
  const resolved = await resolveTickerSymbol(symbol);
  const cacheKey = resolved.toUpperCase();

  const cached = profileCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const raw = await yf.quoteSummary(resolved, {
      modules: ['price', 'assetProfile', 'financialData', 'defaultKeyStatistics', 'summaryDetail']
    });

    const normalized = normalizeStockData(raw, resolved);
    profileCache.set(cacheKey, { data: normalized, timestamp: Date.now() });
    return normalized;
  } catch (err: any) {
    // If cached version exists even if expired, return it with a warning
    if (cached) {
      return cached.data;
    }
    const message = err?.message || 'Failed to fetch fundamentals';
    throw new Error(`Unable to fetch fundamentals for ${resolved}: ${message}`);
  }
}

/**
 * Fetch stock historical chart data
 */
export async function fetchStockHistory(
  symbol: string,
  range: '1d' | '5d' | '1m' | '6m' | '1y' | '5y' | 'all' = '1y'
): Promise<HistoricalQuote[]> {
  const resolved = await resolveTickerSymbol(symbol);
  const cacheKey = `${resolved.toUpperCase()}_${range}`;

  const cached = historyCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const now = new Date();
  let startDate: Date;
  let interval: '1m' | '2m' | '5m' | '15m' | '1d' | '1wk' | '1mo' = '1d';

  switch (range) {
    case '1d':
      startDate = new Date(now.getTime() - 2 * 24 * 3600 * 1000);
      interval = '5m';
      break;
    case '5d':
      startDate = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      interval = '15m';
      break;
    case '1m':
      startDate = new Date(now.getTime() - 31 * 24 * 3600 * 1000);
      interval = '1d';
      break;
    case '6m':
      startDate = new Date(now.getTime() - 183 * 24 * 3600 * 1000);
      interval = '1d';
      break;
    case '5y':
      startDate = new Date(now.getTime() - 5 * 365 * 24 * 3600 * 1000);
      interval = '1wk';
      break;
    case 'all':
      startDate = new Date(now.getTime() - 15 * 365 * 24 * 3600 * 1000);
      interval = '1mo';
      break;
    case '1y':
    default:
      startDate = new Date(now.getTime() - 365 * 24 * 3600 * 1000);
      interval = '1d';
      break;
  }

  try {
    const chartRes = await yf.chart(resolved, {
      period1: startDate,
      interval: interval as any,
    });

    const quotes: HistoricalQuote[] = (chartRes.quotes || [])
      .filter(q => q.close !== null && q.close !== undefined)
      .map(q => ({
        date: new Date(q.date).toISOString(),
        open: Number(q.open ?? q.close),
        high: Number(q.high ?? q.close),
        low: Number(q.low ?? q.close),
        close: Number(q.close),
        volume: Number(q.volume ?? 0),
      }));

    historyCache.set(cacheKey, { data: quotes, timestamp: Date.now() });
    return quotes;
  } catch (err: any) {
    if (cached) return cached.data;
    throw new Error(`Unable to fetch historical price data for ${resolved}: ${err?.message || 'Network error'}`);
  }
}

/**
 * Fetch annual financial statement breakdown using fundamentalsTimeSeries
 */
export async function fetchStockStatements(symbol: string) {
  const resolved = await resolveTickerSymbol(symbol);
  const cacheKey = resolved.toUpperCase();

  const cached = statementsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS * 4) {
    return cached.data;
  }

  try {
    const twoYearsAgo = new Date(Date.now() - 3 * 365 * 24 * 3600 * 1000);
    const ts = await yf.fundamentalsTimeSeries(resolved, {
      period1: twoYearsAgo,
      module: 'all',
      type: 'annual'
    }).catch(() => []);

    const currency = resolved.endsWith('.NS') || resolved.endsWith('.BO') ? 'INR' : 'USD';

    // Build statement rows from latest annual period
    const is: StatementRow[] = [];
    const bs: StatementRow[] = [];
    const cf: StatementRow[] = [];

    if (ts && ts.length > 0) {
      // Sort descending by date
      const sorted = [...ts].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latest = sorted[0] as any;
      const period = latest.date ? new Date(latest.date).getFullYear().toString() : 'FY Latest';

      // Income statement
      if (latest.totalRevenue !== undefined) is.push({ label: 'Total Revenue', period, value: latest.totalRevenue, currency });
      if (latest.costOfRevenue !== undefined) is.push({ label: 'Cost of Revenue', period, value: latest.costOfRevenue, currency });
      if (latest.grossProfit !== undefined) is.push({ label: 'Gross Profit', period, value: latest.grossProfit, currency });
      if (latest.operatingExpense !== undefined) is.push({ label: 'Operating Expenses', period, value: latest.operatingExpense, currency });
      if (latest.operatingIncome !== undefined) is.push({ label: 'Operating Income', period, value: latest.operatingIncome, currency });
      if (latest.EBITDA !== undefined) is.push({ label: 'EBITDA', period, value: latest.EBITDA, currency });
      if (latest.netIncome !== undefined) is.push({ label: 'Net Income', period, value: latest.netIncome, currency });

      // Balance Sheet
      if (latest.cashAndCashEquivalents !== undefined) bs.push({ label: 'Cash & Cash Equivalents', period, value: latest.cashAndCashEquivalents, currency });
      if (latest.currentAssets !== undefined) bs.push({ label: 'Current Assets', period, value: latest.currentAssets, currency });
      if (latest.totalAssets !== undefined) bs.push({ label: 'Total Assets', period, value: latest.totalAssets, currency });
      if (latest.currentDebt !== undefined) bs.push({ label: 'Current Debt', period, value: latest.currentDebt, currency });
      if (latest.longTermDebt !== undefined) bs.push({ label: 'Long Term Debt', period, value: latest.longTermDebt, currency });
      if (latest.totalDebt !== undefined) bs.push({ label: 'Total Debt', period, value: latest.totalDebt, currency });
      if (latest.stockholdersEquity !== undefined || latest.commonStockEquity !== undefined) {
        bs.push({ label: "Stockholders' Equity", period, value: latest.stockholdersEquity ?? latest.commonStockEquity, currency });
      }

      // Cash Flow
      if (latest.operatingCashFlow !== undefined) cf.push({ label: 'Operating Cash Flow', period, value: latest.operatingCashFlow, currency });
      if (latest.capitalExpenditure !== undefined) cf.push({ label: 'Capital Expenditures', period, value: latest.capitalExpenditure, currency });
      if (latest.freeCashFlow !== undefined) cf.push({ label: 'Free Cash Flow', period, value: latest.freeCashFlow, currency });
      if (latest.financingCashFlow !== undefined) cf.push({ label: 'Financing Cash Flow', period, value: latest.financingCashFlow, currency });
      if (latest.investingCashFlow !== undefined) cf.push({ label: 'Investing Cash Flow', period, value: latest.investingCashFlow, currency });
    }

    const res = { is, bs, cf };
    statementsCache.set(cacheKey, { data: res, timestamp: Date.now() });
    return res;
  } catch {
    return { is: [], bs: [], cf: [] };
  }
}

/**
 * Search stocks across global exchanges (US, NSE, BSE)
 */
export async function searchStocks(query: string) {
  if (!query || query.trim().length === 0) return [];
  try {
    const res = await yf.search(query.trim());
    return (res.quotes || [])
      .filter((q: any) => q.isYahooFinance !== false && q.symbol)
      .slice(0, 12)
      .map((q: any) => {
        const sym = q.symbol as string;
        let exchangeDisplay = q.exchange || 'US';
        if (sym.endsWith('.NS')) exchangeDisplay = 'NSE';
        if (sym.endsWith('.BO')) exchangeDisplay = 'BSE';

        return {
          symbol: sym,
          name: q.shortname || q.longname || sym,
          exchange: exchangeDisplay,
          quoteType: q.quoteType || 'EQUITY',
          country: sym.endsWith('.NS') || sym.endsWith('.BO') ? 'India' : 'United States',
        };
      });
  } catch (err: any) {
    console.error('Search error:', err);
    return [];
  }
}
