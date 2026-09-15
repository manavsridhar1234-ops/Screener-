import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Globe,
  Star,
  Scale,
  RefreshCw,
  ExternalLink,
  Info,
  Calendar,
  Layers,
  CircleDollarSign,
  Percent,
  ShieldCheck,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Users,
  Award,
  ArrowRight,
} from 'lucide-react';
import type {
  NormalizedStock,
  HistoricalQuote,
  StatementRow,
  PeerBenchmarkData,
} from '../../types';
import {
  fetchStockFundamentals,
  fetchStockHistory,
  fetchStockStatements,
  fetchStockPeers,
} from '../../services/api';
import {
  formatCurrency,
  formatPercent,
  formatRatio,
  formatNumber,
  formatDate,
} from '../../utils/formatters';
import { useWatchlist } from '../../context/WatchlistContext';
import { PeerBenchmarkingTab } from './PeerBenchmarkingTab';

interface StockDetailViewProps {
  symbol: string;
  onSelectStock: (symbol: string) => void;
  compareList: string[];
  onToggleCompare: (symbol: string) => void;
  onCompareWithPeers?: (peerSymbols: string[]) => void;
}

export const StockDetailView: React.FC<StockDetailViewProps> = ({
  symbol,
  onSelectStock,
  compareList,
  onToggleCompare,
  onCompareWithPeers,
}) => {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const [stock, setStock] = useState<NormalizedStock | null>(null);
  const [historyQuotes, setHistoryQuotes] = useState<HistoricalQuote[]>([]);
  const [statements, setStatements] = useState<{
    is: StatementRow[];
    bs: StatementRow[];
    cf: StatementRow[];
  }>({ is: [], bs: [], cf: [] });

  const [chartRange, setChartRange] = useState<'1d' | '5d' | '1m' | '6m' | '1y' | '5y'>('1y');
  const [activeTab, setActiveTab] = useState<'overview' | 'peers' | 'financials' | 'integrity'>('overview');
  const [activeStatementTab, setActiveStatementTab] = useState<'is' | 'bs' | 'cf'>('is');
  const [benchmarkData, setBenchmarkData] = useState<PeerBenchmarkData | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hoveredQuote, setHoveredQuote] = useState<HistoricalQuote | null>(null);

  // Load stock fundamentals, statements, and peer benchmarks on symbol change
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setErrorMsg(null);

    Promise.all([
      fetchStockFundamentals(symbol),
      fetchStockStatements(symbol),
      fetchStockPeers(symbol),
    ])
      .then(([fund, stmt, peerData]) => {
        if (!isCancelled) {
          setStock(fund);
          setStatements(stmt);
          setBenchmarkData(peerData);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setErrorMsg(err.message || `Unable to load data for ${symbol}`);
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [symbol]);

  // Load chart history when symbol or chartRange changes
  useEffect(() => {
    let isCancelled = false;
    setIsChartLoading(true);

    fetchStockHistory(symbol, chartRange)
      .then((quotes) => {
        if (!isCancelled) {
          setHistoryQuotes(quotes);
          if (quotes.length > 0) {
            setHoveredQuote(quotes[quotes.length - 1]);
          }
        }
      })
      .catch(() => {
        if (!isCancelled) setHistoryQuotes([]);
      })
      .finally(() => {
        if (!isCancelled) setIsChartLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [symbol, chartRange]);

  if (isLoading) {
    return (
      <div className="bg-[#121622] border border-[#1E2638] rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Fetching normalized fundamentals for {symbol}...</p>
      </div>
    );
  }

  if (errorMsg || !stock) {
    return (
      <div className="bg-[#121622] border border-[#1E2638] rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-950/40 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white">Stock Data Unavailable</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          {errorMsg || `Could not find fundamental or market quote records for ticker "${symbol}".`}
        </p>
        <p className="text-xs text-slate-500 font-mono">
          For Indian NSE equities, verify the suffix is <code className="text-blue-400">.NS</code> (e.g. SHAKTIPUMP.NS, RELIANCE.NS).
        </p>
        <button
          onClick={() => onSelectStock('MSFT')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition"
        >
          View Microsoft (MSFT)
        </button>
      </div>
    );
  }

  // 52-week position calculation
  const high52 = stock.week52High || 0;
  const low52 = stock.week52Low || 0;
  const currPrice = stock.price || 0;
  let rangePercent = 50;
  if (high52 > low52 && currPrice >= low52) {
    rangePercent = Math.min(100, Math.max(0, ((currPrice - low52) / (high52 - low52)) * 100));
  }

  const isPositive = (stock.dayChangePercent ?? 0) >= 0;
  const isCompared = compareList.includes(stock.symbol);

  // SVG Chart rendering
  const minChartPrice = historyQuotes.length > 0 ? Math.min(...historyQuotes.map(q => q.low || q.close)) : 0;
  const maxChartPrice = historyQuotes.length > 0 ? Math.max(...historyQuotes.map(q => q.high || q.close)) : 100;
  const priceRange = maxChartPrice - minChartPrice || 1;

  const chartWidth = 700;
  const chartHeight = 220;
  const padding = 20;

  const points = historyQuotes.map((q, idx) => {
    const x = padding + (idx / Math.max(1, historyQuotes.length - 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - ((q.close - minChartPrice) / priceRange) * (chartHeight - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const areaPoints = points
    ? `${padding},${chartHeight - padding} ${points} ${chartWidth - padding},${chartHeight - padding}`
    : '';

  return (
    <div className="space-y-4">
      {/* 1. Header Card */}
      <div className="bg-[#121622] border border-[#1E2638] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono font-bold text-2xl text-white tracking-wider">
                {stock.symbol}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#1A2234] border border-[#243048] text-slate-300 font-mono">
                {stock.exchange}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/60 text-blue-300 font-sans">
                {stock.country}
              </span>
              {stock.currency && (
                <span className="text-xs px-2 py-0.5 rounded bg-[#1A2234] text-slate-400 font-mono">
                  {stock.currency}
                </span>
              )}
            </div>

            <h1 className="text-base font-semibold text-slate-200 mt-1">
              {stock.companyName}
            </h1>

            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5 flex-wrap">
              <span>{stock.sector || 'General Sector'}</span>
              <span>•</span>
              <span>{stock.industry || 'General Industry'}</span>
              {stock.employees && (
                <>
                  <span>•</span>
                  <span>{stock.employees.toLocaleString()} employees</span>
                </>
              )}
            </div>
          </div>

          {/* Action buttons & Live Price */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:items-end">
            <div className="text-left sm:text-right">
              <div className="flex items-baseline gap-2">
                <span className="font-mono font-bold text-3xl text-white">
                  {formatCurrency(stock.price, stock.currency, false)}
                </span>
                <span
                  className={`font-mono text-sm font-semibold flex items-center gap-0.5 ${
                    isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {formatPercent(stock.dayChangePercent)}
                  <span className="text-xs opacity-75">
                    ({stock.dayChange && stock.dayChange > 0 ? '+' : ''}
                    {stock.dayChange?.toFixed(2)})
                  </span>
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                Market Cap: {formatCurrency(stock.marketCap, stock.currency)}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {benchmarkData && benchmarkData.peerStocks.length > 0 && (
                <button
                  id="compare-peers-btn"
                  onClick={() => {
                    const peerSyms = benchmarkData.peerStocks.map((p) => p.symbol);
                    if (onCompareWithPeers) {
                      onCompareWithPeers(peerSyms);
                    } else {
                      peerSyms.forEach((sym) => onToggleCompare(sym));
                    }
                  }}
                  title={`Auto-populate Side-by-Side matrix with ${benchmarkData.peerStocks.map((p) => p.symbol).join(', ')}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-blue-500/40 bg-blue-950/40 text-blue-300 hover:bg-blue-900/60 hover:text-white transition shadow-sm"
                >
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Compare with Peers</span>
                  <span className="text-[10px] bg-blue-800/60 text-blue-200 px-1.5 py-0.5 rounded-full font-mono">
                    {benchmarkData.peerStocks.length}
                  </span>
                </button>
              )}

              <button
                id="toggle-watchlist-btn"
                onClick={() => toggleWatchlist(stock.symbol)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition ${
                  isInWatchlist(stock.symbol)
                    ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                    : 'bg-[#151B28] text-slate-300 border-[#1E2638] hover:bg-[#1A2234]'
                }`}
              >
                <Star
                  className={`w-4 h-4 ${
                    isInWatchlist(stock.symbol) ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                  }`}
                />
                <span>{isInWatchlist(stock.symbol) ? 'Watching' : 'Watchlist'}</span>
              </button>

              <button
                id="toggle-compare-btn"
                onClick={() => onToggleCompare(stock.symbol)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition ${
                  isCompared
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-[#151B28] text-slate-300 border-[#1E2638] hover:bg-[#1A2234]'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>{isCompared ? 'Compared' : 'Compare'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 52-Week Range Bar */}
        <div className="mt-5 pt-4 border-t border-[#1E2638]">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>52W Low: {formatCurrency(stock.week52Low, stock.currency, false)}</span>
            <span className="text-slate-200 font-semibold">52-Week Price Range</span>
            <span>52W High: {formatCurrency(stock.week52High, stock.currency, false)}</span>
          </div>
          <div className="relative w-full h-2 rounded-full bg-[#1A2234] overflow-hidden">
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"
              style={{ width: `${rangePercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-1">
            <span>{stock.distFrom52wHigh !== null ? `${stock.distFrom52wHigh?.toFixed(1)}% from High` : ''}</span>
            <span>Volume: {stock.volume ? stock.volume.toLocaleString() : '—'}</span>
          </div>
        </div>

        {/* Sector Percentile Rankings Badges */}
        {benchmarkData && benchmarkData.percentileRanks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#1E2638]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-400" />
                  Sector Percentile Rankings
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#1A2234] text-slate-400 border border-[#243048]">
                  vs {benchmarkData.totalSectorCompanies} {benchmarkData.sector} peers
                </span>
              </div>
              <button
                onClick={() => setActiveTab('peers')}
                className="text-[11px] font-mono text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
              >
                <span>View Full Peer Matrix & Multiples</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Badges Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {benchmarkData.percentileRanks.map((rank) => {
                const isPos = rank.badgeType === 'positive';
                const isCaut = rank.badgeType === 'caution';
                return (
                  <div
                    key={rank.metricKey}
                    onClick={() => setActiveTab('peers')}
                    className={`p-2.5 rounded-lg border transition text-xs cursor-pointer hover:border-slate-500 ${
                      isPos
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                        : isCaut
                        ? 'bg-amber-950/20 border-amber-800/40 text-amber-300'
                        : 'bg-[#151B28] border-[#1F293D] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-semibold text-white truncate text-[11px]">
                        {rank.headline}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          isPos
                            ? 'bg-emerald-900/60 text-emerald-200'
                            : isCaut
                            ? 'bg-amber-900/60 text-amber-200'
                            : 'bg-[#1F293D] text-slate-300'
                        }`}
                      >
                        {rank.isHigherBetter
                          ? `Top ${Math.max(1, 100 - rank.percentile)}%`
                          : `#${rank.rank}/${rank.totalCompared}`}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1 truncate">
                      {rank.detail}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Interactive Price Chart Card */}
      <div className="bg-[#121622] border border-[#1E2638] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">Historical Price Action</h2>
              {hoveredQuote && (
                <span className="text-xs font-mono text-slate-300 bg-[#151B28] px-2 py-0.5 rounded border border-[#1E2638]">
                  {formatDate(hoveredQuote.date)}: <strong className="text-white">{formatCurrency(hoveredQuote.close, stock.currency, false)}</strong>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live market quotes via Yahoo Finance API
            </p>
          </div>

          {/* Time range buttons */}
          <div className="flex items-center gap-1 bg-[#0E131E] p-1 rounded-lg border border-[#1E2638]">
            {(['1d', '5d', '1m', '6m', '1y', '5y'] as const).map((r) => (
              <button
                key={r}
                id={`chart-range-${r}`}
                onClick={() => setChartRange(r)}
                className={`px-2.5 py-1 text-xs font-mono uppercase rounded transition ${
                  chartRange === r
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-[#182234]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Chart Graphic */}
        <div className="relative w-full h-[230px] flex items-center justify-center bg-[#0B0E14] rounded-lg border border-[#1A2234] overflow-hidden">
          {isChartLoading ? (
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              Loading {chartRange.toUpperCase()} quotes...
            </div>
          ) : historyQuotes.length === 0 ? (
            <div className="text-xs text-slate-400 font-mono">
              No historical price quotes available for this time range.
            </div>
          ) : (
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-full preserve-3d"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              {areaPoints && (
                <polygon points={areaPoints} fill="url(#chartGradient)" />
              )}

              {/* Price Line */}
              {points && (
                <polyline
                  points={points}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          )}
        </div>
      </div>

      {/* 3. Navigation Tabs: Overview, Peers & Benchmarks, Financial Statements, Data Integrity */}
      <div className="flex items-center gap-2 border-b border-[#1E2638] pb-1 overflow-x-auto">
        <button
          id="detail-tab-overview"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-t-lg transition border-b-2 shrink-0 ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-400 bg-[#121622]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Core Fundamentals & Multiples</span>
        </button>

        <button
          id="detail-tab-peers"
          onClick={() => setActiveTab('peers')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-t-lg transition border-b-2 shrink-0 ${
            activeTab === 'peers'
              ? 'border-blue-500 text-blue-400 bg-[#121622]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Peer & Industry Benchmarking</span>
          {benchmarkData && benchmarkData.peerStocks.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-blue-900/60 text-blue-200 font-mono text-[10px]">
              {benchmarkData.peerStocks.length}
            </span>
          )}
        </button>

        <button
          id="detail-tab-financials"
          onClick={() => setActiveTab('financials')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-t-lg transition border-b-2 shrink-0 ${
            activeTab === 'financials'
              ? 'border-blue-500 text-blue-400 bg-[#121622]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Annual Financial Statements</span>
        </button>

        <button
          id="detail-tab-integrity"
          onClick={() => setActiveTab('integrity')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-t-lg transition border-b-2 shrink-0 ${
            activeTab === 'integrity'
              ? 'border-blue-500 text-blue-400 bg-[#121622]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Data Provider & Field Integrity</span>
        </button>
      </div>

      {/* Tab: Peer Benchmarking & Competitor Discovery */}
      {activeTab === 'peers' && (
        benchmarkData ? (
          <PeerBenchmarkingTab
            currentStock={stock}
            benchmarkData={benchmarkData}
            onSelectStock={onSelectStock}
            compareList={compareList}
            onToggleCompare={onToggleCompare}
            onCompareWithPeers={onCompareWithPeers}
          />
        ) : (
          <div className="bg-[#121622] border border-[#1E2638] rounded-xl p-8 text-center space-y-2">
            <RefreshCw className="w-5 h-5 text-blue-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono">
              Computing automated peer discovery and sector percentile rankings...
            </p>
          </div>
        )
      )}

      {/* Tab 1: Core Fundamentals & Multiples */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Valuation Multiples */}
          <div className="bg-[#121622] border border-[#1E2638] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1E2638]">
              <CircleDollarSign className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                Valuation Multiples
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#1A2234]">
                <span className="text-slate-400">Trailing P/E (TTM)</span>
                <span className="font-mono text-white font-medium">{formatRatio(stock.peRatio)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1A2234]">
                <span className="text-slate-400">Forward P/E</span>
                <span className="font-mono text-slate-200">{formatRatio(stock.forwardPe)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1A2234]">
                <span className="text-slate-400">Price to Book (P/B)</span>
                <span className="font-mono text-slate-200">{formatRatio(stock.priceToBook)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1A2234]">
                <span className="text-slate-400">Price to Sales (P/S)</span>
                <span className="font-mono text-slate-200">{formatRatio(stock.priceToSales)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1A2234]">
                <span className="text-slate-400">Enterprise Value</span>
                <span className="font-mono text-slate-200">{formatCurrency(stock.enterpriseValue, stock.currency)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1A2234]">
                <span className="text-slate-400">EV / EBITDA</span>
                <span className="font-mono text-slate-200">{formatRatio(stock.evToEbitda)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1A2234]">
                <span className="text-slate-400">EV / Revenue</span>
                <span className="font-mono text-slate-200">{formatRatio(stock.evToRevenue)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Dividend Yield</span>
                <span className="font-mono text-emerald-400 font-medium">{formatPercent(stock.dividendYield, false)}</span>
              </div>
            </div>
          </div>

          {/* Profitability & Returns */}
          <div className="bg-[#121622] border border-[#1E2638] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1E2638]">
              <Percent className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                Profitability & Growth
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#1A2234]">
                <span className="text-slate-400">Revenue (TTM)</span>
                <span className="font-mono text-white font-medium">{formatCurrency(stock.revenue, stock.currency)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1A2234]">
                <span className="text-slate-400">Revenue Growth (YoY)</span>
                <span className={`font-mono font-medium ${stock.revenueGrowth && stock.revenueGrowth > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatPercent(stock.revenueGrowth)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1A2234]">
                <span className="text-slate-400">Gross Margin</span>
                <span className="font-mono text-slate-200">{formatPercent(stock.grossMargin, false)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1A2234]">
                <span className="text-slate-400">Operating Margin</span>
                <span className="font-mono text-slate-200">{formatPercent(stock.operatingMargin, false)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1A2234]">
                <span className="text-slate-400">Net Profit Margin</span>
                <span className="font-mono text-slate-200">{formatPercent(stock.netMargin, false)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1A2234]">
                <span className="text-slate-400">Return on Equity (ROE)</span>
                <span className="font-mono text-emerald-400 font-semibold">{formatPercent(stock.returnOnEquity, false)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1A2234]">
                <span className="text-slate-400">Return on Assets (ROA)</span>
                <span className="font-mono text-slate-200">{formatPercent(stock.returnOnAssets, false)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Diluted EPS</span>
                <span className="font-mono text-white font-medium">{stock.eps !== null ? stock.eps?.toFixed(2) : '—'}</span>
              </div>
            </div>
          </div>

          {/* Financial Health & Solvency */}
          <div className="bg-[#121622] border border-[#1E2638] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1E2638]">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                Financial Health
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#1A2234]">
                <span className="text-slate-400">Total Cash</span>
                <span className="font-mono text-white font-medium">{formatCurrency(stock.totalCash, stock.currency)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1A2234]">
                <span className="text-slate-400">Total Debt</span>
                <span className="font-mono text-slate-200">{formatCurrency(stock.totalDebt, stock.currency)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1A2234]">
                <span className="text-slate-400">Debt to Equity</span>
                <span className="font-mono text-slate-200">{formatPercent(stock.debtToEquity, false)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1A2234]">
                <span className="text-slate-400">Current Ratio</span>
                <span className="font-mono text-slate-200">{formatRatio(stock.currentRatio, '')}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1A2234]">
                <span className="text-slate-400">Quick Ratio</span>
                <span className="font-mono text-slate-200">{formatRatio(stock.quickRatio, '')}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1A2234]">
                <span className="text-slate-400">Operating Cash Flow</span>
                <span className="font-mono text-slate-200">{formatCurrency(stock.operatingCashFlow, stock.currency)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1A2234]">
                <span className="text-slate-400">Free Cash Flow</span>
                <span className="font-mono text-white font-medium">{formatCurrency(stock.freeCashFlow, stock.currency)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Beta (5Y Monthly)</span>
                <span className="font-mono text-slate-200">{formatNumber(stock.beta, 2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Financial Statements */}
      {activeTab === 'financials' && (
        <div className="bg-[#121622] border border-[#1E2638] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-[#0E131E] p-1 rounded-lg border border-[#1E2638]">
              <button
                onClick={() => setActiveStatementTab('is')}
                className={`px-3 py-1 text-xs font-medium rounded transition ${
                  activeStatementTab === 'is' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Income Statement
              </button>
              <button
                onClick={() => setActiveStatementTab('bs')}
                className={`px-3 py-1 text-xs font-medium rounded transition ${
                  activeStatementTab === 'bs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Balance Sheet
              </button>
              <button
                onClick={() => setActiveStatementTab('cf')}
                className={`px-3 py-1 text-xs font-medium rounded transition ${
                  activeStatementTab === 'cf' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cash Flow
              </button>
            </div>

            <span className="text-xs font-mono text-slate-400">
              Reported in {stock.currency}
            </span>
          </div>

          {/* Statement Table */}
          <div className="overflow-x-auto">
            {statements[activeStatementTab].length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Detailed statement line items currently undergoing quarterly consolidation or not reported.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1E2638] text-slate-400 font-mono">
                    <th className="py-2.5 px-3">Metric / Line Item</th>
                    <th className="py-2.5 px-3">Period</th>
                    <th className="py-2.5 px-3 text-right font-bold text-white">
                      Reported Value ({stock.currency})
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A2234] font-mono">
                  {statements[activeStatementTab].map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#161D2C] transition">
                      <td className="py-2.5 px-3 text-slate-300 font-sans font-medium">
                        {row.label}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {row.period}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-200">
                        {formatCurrency(row.value, row.currency || stock.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Data Provider & Integrity Audit */}
      {activeTab === 'integrity' && (
        <div className="bg-[#121622] border border-[#1E2638] rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Market Data Integrity Audit</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Technical honesty report detailing sources, refresh timestamps, and missing-field status.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#151B28] p-3 rounded-lg border border-[#1F293D]">
              <span className="text-[11px] text-slate-400 block font-mono">PRIMARY DATA PROVIDER</span>
              <span className="text-xs font-semibold text-white mt-1 block">Yahoo Finance (Server BFF)</span>
            </div>
            <div className="bg-[#151B28] p-3 rounded-lg border border-[#1F293D]">
              <span className="text-[11px] text-slate-400 block font-mono">LAST NORMALIZED SYNC</span>
              <span className="text-xs font-semibold text-white mt-1 block font-mono">
                {new Date(stock.lastUpdated).toLocaleTimeString()}
              </span>
            </div>
            <div className="bg-[#151B28] p-3 rounded-lg border border-[#1F293D]">
              <span className="text-[11px] text-slate-400 block font-mono">REPORTING CURRENCY</span>
              <span className="text-xs font-semibold text-white mt-1 block font-mono">{stock.currency}</span>
            </div>
            <div className="bg-[#151B28] p-3 rounded-lg border border-[#1F293D]">
              <span className="text-[11px] text-slate-400 block font-mono">EXCHANGE ROUTE</span>
              <span className="text-xs font-semibold text-white mt-1 block font-mono">{stock.exchange}</span>
            </div>
          </div>

          <div className="bg-[#151B28] p-4 rounded-lg border border-[#1F293D] space-y-2 text-xs">
            <span className="font-semibold text-white block">Field Resolution & Missing Data Policy:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-400 leading-relaxed">
              <li>
                <strong className="text-slate-300">Technical Honesty:</strong> When fundamental fields are not disclosed by the company or not applicable (such as commercial banks without traditional gross inventory or industrial debt ratios), the application presents <code className="text-blue-400">"—"</code> rather than substituting false zero values.
              </li>
              <li>
                <strong className="text-slate-300">Resilient Architecture:</strong> Unlike the legacy EODHD endpoints that failed with HTTP 403/404, the new Node backend service isolates errors gracefully and retains 15-minute cached records.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Business Description */}
      {stock.description && (
        <div className="bg-[#121622] border border-[#1E2638] rounded-xl p-5 shadow-lg">
          <h3 className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-wider mb-2">
            Company Business Overview
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
            {stock.description}
          </p>
        </div>
      )}
    </div>
  );
};
