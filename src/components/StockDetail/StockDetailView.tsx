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
  Sparkles,
  BarChart3,
  HelpCircle,
  Bot,
  FileText,
} from 'lucide-react';
import type {
  NormalizedStock,
  HistoricalQuote,
  StatementRow,
  PeerBenchmarkData,
  FinancialGrowthPoint,
  MetricDefinition,
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
import { exportStockModelToCsv } from '../../utils/exportSpreadsheet';
import { useWatchlist } from '../../context/WatchlistContext';
import { useExperience } from '../../context/ExperienceContext';
import { getMetricDefinition } from '../../data/metricDefinitions';
import { PeerBenchmarkingTab } from './PeerBenchmarkingTab';
import { FinancialGrowthCharts } from './FinancialGrowthCharts';
import { StockAiChat } from './StockAiChat';
import { MetricExplainerModal } from '../MetricExplainer/MetricExplainerModal';
import { InvestmentMemoModal } from './InvestmentMemoModal';
import { ClickableMetric } from '../Common/ClickableMetric';
import { MetricTooltip } from '../Common/MetricTooltip';
import { ResearchSnapshot } from './ResearchSnapshot';
import { QualityScorecardSection } from './QualityScorecardSection';
import { HistoricalValuationSection } from './HistoricalValuationSection';
import { FinancialAnomaliesSection } from './FinancialAnomaliesSection';
import { ExplainMoveModal } from './ExplainMoveModal';
import { ThesisBuilderModal } from './ThesisBuilderModal';

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
  const { experienceLevel } = useExperience();

  const [stock, setStock] = useState<NormalizedStock | null>(null);
  const [historyQuotes, setHistoryQuotes] = useState<HistoricalQuote[]>([]);
  const [statements, setStatements] = useState<{
    is: StatementRow[];
    bs: StatementRow[];
    cf: StatementRow[];
  }>({ is: [], bs: [], cf: [] });
  const [growthSeries, setGrowthSeries] = useState<FinancialGrowthPoint[]>([]);

  const [chartRange, setChartRange] = useState<'1d' | '5d' | '1m' | '6m' | '1y' | '5y'>('1y');
  const [activeTab, setActiveTab] = useState<'overview' | 'scorecard' | 'valuation' | 'growth' | 'peers' | 'financials' | 'integrity'>('overview');
  const [activeStatementTab, setActiveStatementTab] = useState<'is' | 'bs' | 'cf'>('is');
  const [benchmarkData, setBenchmarkData] = useState<PeerBenchmarkData | null>(null);

  // Modals & Panels
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [isExplainMoveOpen, setIsExplainMoveOpen] = useState(false);
  const [isThesisBuilderOpen, setIsThesisBuilderOpen] = useState(false);
  const [aiInitialQuestion, setAiInitialQuestion] = useState<string | null>(null);

  const [explainerMetric, setExplainerMetric] = useState<MetricDefinition | null>(null);
  const [explainerRawValue, setExplainerRawValue] = useState<any>(null);
  const [explainerFormattedValue, setExplainerFormattedValue] = useState<string>('');
  const [isExplainerOpen, setIsExplainerOpen] = useState<boolean>(false);

  const handleMetricClick = (metricKey: string, rawVal: any, formattedVal: string) => {
    const def = getMetricDefinition(metricKey);
    if (def) {
      setExplainerMetric(def);
      setExplainerRawValue(rawVal);
      setExplainerFormattedValue(formattedVal);
      setIsExplainerOpen(true);
    }
  };

  const handleAskAiAboutMetric = (question: string) => {
    setAiInitialQuestion(question);
    setIsAiChatOpen(true);
  };

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
          setStatements({ is: stmt.is, bs: stmt.bs, cf: stmt.cf });
          setGrowthSeries(stmt.growthSeries || []);
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
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#7FA6C9] border-t-transparent animate-spin" />
        <p className="text-xs text-[#8B919C] font-mono">Fetching normalized fundamentals for {symbol}...</p>
      </div>
    );
  }

  if (errorMsg || !stock) {
    return (
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#151922] border border-[#252A33] text-[#B87878] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#E8E9EB]">Stock Data Unavailable</h3>
        <p className="text-xs text-[#8B919C] leading-relaxed">
          {errorMsg || `Could not find fundamental or market quote records for ticker "${symbol}".`}
        </p>
        <p className="text-xs text-[#8B919C] font-mono">
          For Indian NSE equities, verify the suffix is <code className="text-[#7FA6C9]">.NS</code> (e.g. SHAKTIPUMP.NS, RELIANCE.NS).
        </p>
        <button
          onClick={() => onSelectStock('MSFT')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#151922] hover:bg-[#151922]/80 text-[#E8E9EB] border border-[#252A33] text-xs font-medium transition"
        >
          View Microsoft (MSFT)
        </button>
      </div>
    );
  }

  // 52-week position calculation
  const high52 = stock.fiftyTwoWeekHigh ?? (stock as any).week52High ?? 0;
  const low52 = stock.fiftyTwoWeekLow ?? (stock as any).week52Low ?? 0;
  const currPrice = stock.price || 0;
  let rangePercent = 50;
  if (high52 > low52 && currPrice >= low52) {
    rangePercent = Math.min(100, Math.max(0, ((currPrice - low52) / (high52 - low52)) * 100));
  }

  // Normalized day change percentage (guard against raw decimal fraction e.g. -0.0196)
  const rawDayPercent = stock.dayChangePercent;
  let displayDayPercent: number | null = rawDayPercent;
  if (rawDayPercent !== null && rawDayPercent !== undefined) {
    if (Math.abs(rawDayPercent) <= 0.25 && stock.dayChange && stock.price && Math.abs(stock.dayChange / stock.price) > 0.002) {
      displayDayPercent = (stock.dayChange / (stock.price - stock.dayChange)) * 100;
    } else if (Math.abs(rawDayPercent) <= 0.1 && rawDayPercent !== 0) {
      displayDayPercent = rawDayPercent * 100;
    }
  }

  const isPositive = (displayDayPercent ?? stock.dayChangePercent ?? 0) >= 0;
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
    <div className="space-y-4 font-sans">
      {/* 1. Header Card */}
      <div className="bg-[#0E1217] border border-[#1F2633] rounded-xl p-5 sm:p-6 shadow-xl shadow-black/20">
        {/* Top Row: Company Info & Live Price */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono font-bold text-2xl sm:text-3xl text-[#F0F2F5] tracking-wider text-glow-cyan">
                {stock.symbol}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#141820] border border-[#1F2633] text-[#8E98A8] font-mono whitespace-nowrap">
                {stock.exchange}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#161B26] border border-[#38BDF8]/30 text-[#38BDF8] font-sans font-medium whitespace-nowrap">
                {stock.country}
              </span>
              {stock.currency && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#141820] border border-[#1F2633] text-[#8E98A8] font-mono whitespace-nowrap">
                  {stock.currency}
                </span>
              )}
            </div>

            <h1 className="text-lg font-semibold text-[#F0F2F5] mt-1.5">
              {stock.companyName}
            </h1>

            <div className="flex items-center gap-2 text-xs text-[#8E98A8] mt-1.5 flex-wrap">
              <span className="whitespace-nowrap font-medium text-[#C8D1DE]">{stock.sector || 'General Sector'}</span>
              <span>•</span>
              <span className="whitespace-nowrap">{stock.industry || 'General Industry'}</span>
              {stock.employees && (
                <>
                  <span>•</span>
                  <span className="whitespace-nowrap font-mono">{stock.employees.toLocaleString()} employees</span>
                </>
              )}
            </div>
          </div>

          {/* Live Price Block */}
          <div className="text-left md:text-right shrink-0">
            <div className="flex items-baseline gap-2.5 md:justify-end">
              <span className="font-mono font-bold text-3xl sm:text-4xl text-[#F0F2F5] tracking-tight">
                {formatCurrency(stock.price, stock.currency, false)}
              </span>
              <MetricTooltip
                metricKey="dayChangePercent"
                value={displayDayPercent}
                formattedValue={`${isPositive ? '+' : ''}${formatPercent(displayDayPercent)}`}
                stock={stock}
              >
                <span
                  className={`font-mono text-sm font-semibold flex items-center gap-1 ${
                    isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {formatPercent(displayDayPercent)}
                  <span className="text-xs opacity-80 font-mono">
                    ({stock.dayChange && stock.dayChange > 0 ? '+' : ''}
                    {stock.dayChange?.toFixed(2)})
                  </span>
                </span>
              </MetricTooltip>
            </div>
            <div className="text-[11px] text-[#8E98A8] font-mono mt-1">
              <MetricTooltip
                metricKey="marketCap"
                value={stock.marketCap}
                formattedValue={formatCurrency(stock.marketCap, stock.currency)}
                stock={stock}
                className="text-[#8E98A8] hover:text-[#38BDF8]"
              >
                Market Cap: <span className="text-[#F0F2F5] font-semibold">{formatCurrency(stock.marketCap, stock.currency)}</span>
              </MetricTooltip>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="mt-5 pt-4 border-t border-[#1F2633] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Ask AI Analyst Button */}
            <button
              id="ask-stock-ai-action-btn"
              onClick={() => setIsAiChatOpen(true)}
              title="Ask the in-house AI Analyst anything about this stock"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#161B26] hover:bg-[#1A202C] border border-[#38BDF8]/40 text-[#F0F2F5] shadow-sm shadow-[#38BDF8]/10 hover:shadow-[#38BDF8]/20 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Ask AI Analyst</span>
            </button>

            {/* 1-Page Investment Memo / PDF Tearsheet */}
            <button
              id="view-investment-memo-btn"
              onClick={() => setIsMemoOpen(true)}
              title="Generate printable 1-Page Executive Investment Memo / PDF Tearsheet"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#1F2633] bg-[#141820] text-[#F0F2F5] hover:bg-[#1A202C] hover:border-[#38BDF8]/40 transition shadow-sm whitespace-nowrap shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>1-Page Memo</span>
            </button>

            {/* Export Model to Excel / CSV */}
            <button
              id="export-model-excel-btn"
              onClick={() => exportStockModelToCsv(stock, growthSeries, statements)}
              title="Export complete 5-year financial model, valuation multiples, and statement data to Excel / CSV"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#1F2633] bg-[#141820] text-[#8E98A8] hover:bg-[#1A202C] hover:text-[#F0F2F5] transition shadow-sm whitespace-nowrap shrink-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Export Model (Excel)</span>
            </button>

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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#1F2633] bg-[#141820] text-[#8E98A8] hover:text-[#F0F2F5] hover:bg-[#1A202C] transition shadow-sm whitespace-nowrap shrink-0"
              >
                <Users className="w-3.5 h-3.5 text-[#8E98A8]" />
                <span>Peers</span>
                <span className="text-[10px] bg-[#090B0E] text-[#38BDF8] px-1.5 py-0.5 rounded-full font-mono border border-[#1F2633]">
                  {benchmarkData.peerStocks.length}
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="toggle-watchlist-btn"
              onClick={() => toggleWatchlist(stock.symbol)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition whitespace-nowrap shrink-0 ${
                isInWatchlist(stock.symbol)
                  ? 'bg-[#1C1811] text-[#F59E0B] border-[#F59E0B]/50 shadow-sm shadow-[#F59E0B]/10'
                  : 'bg-[#141820] text-[#8E98A8] border-[#1F2633] hover:text-[#F0F2F5] hover:bg-[#1A202C]'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  isInWatchlist(stock.symbol) ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[#8E98A8]'
                }`}
              />
              <span>{isInWatchlist(stock.symbol) ? 'Watching' : 'Watchlist'}</span>
            </button>

            <button
              id="toggle-compare-btn"
              onClick={() => onToggleCompare(stock.symbol)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition whitespace-nowrap shrink-0 ${
                isCompared
                  ? 'bg-[#161B26] text-[#38BDF8] border-[#38BDF8]/60 shadow-sm shadow-[#38BDF8]/10'
                  : 'bg-[#141820] text-[#8E98A8] border-[#1F2633] hover:text-[#F0F2F5] hover:bg-[#1A202C]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isCompared ? 'Compared' : 'Compare'}</span>
            </button>
          </div>
        </div>

        {/* 52-Week Range Bar */}
        <div className="mt-5 pt-4 border-t border-[#1F2633]">
          <div className="flex items-center justify-between text-xs font-mono text-[#8E98A8] mb-2">
            <MetricTooltip
              metricKey="fiftyTwoWeekLow"
              value={stock.fiftyTwoWeekLow ?? (stock as any).week52Low}
              formattedValue={formatCurrency(stock.fiftyTwoWeekLow ?? (stock as any).week52Low, stock.currency, false)}
              stock={stock}
            >
              <span>52W Low: <strong className="text-[#F0F2F5]">{formatCurrency(stock.fiftyTwoWeekLow ?? (stock as any).week52Low, stock.currency, false)}</strong></span>
            </MetricTooltip>
            <span className="text-[#F0F2F5] font-semibold tracking-wide uppercase text-[11px]">52-Week Price Range</span>
            <MetricTooltip
              metricKey="fiftyTwoWeekHigh"
              value={stock.fiftyTwoWeekHigh ?? (stock as any).week52High}
              formattedValue={formatCurrency(stock.fiftyTwoWeekHigh ?? (stock as any).week52High, stock.currency, false)}
              stock={stock}
            >
              <span>52W High: <strong className="text-[#F0F2F5]">{formatCurrency(stock.fiftyTwoWeekHigh ?? (stock as any).week52High, stock.currency, false)}</strong></span>
            </MetricTooltip>
          </div>
          <div className="relative w-full h-2 rounded-full bg-[#141820] border border-[#1F2633] overflow-hidden">
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#38BDF8]/80 to-[#38BDF8] rounded-full shadow-sm shadow-[#38BDF8]/40"
              style={{ width: `${rangePercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-[#8E98A8] mt-1.5">
            <MetricTooltip
              metricKey="distFrom52wHigh"
              value={stock.distFrom52wHigh}
              formattedValue={stock.distFrom52wHigh !== null && stock.distFrom52wHigh !== undefined ? `${stock.distFrom52wHigh.toFixed(1)}% from High` : ''}
              stock={stock}
            >
              <span className="text-[#38BDF8]">{stock.distFrom52wHigh !== null && stock.distFrom52wHigh !== undefined ? `${stock.distFrom52wHigh.toFixed(1)}% from High` : ''}</span>
            </MetricTooltip>
            <span>Volume: <strong className="text-[#F0F2F5] font-mono">{stock.volume ? stock.volume.toLocaleString() : '—'}</strong></span>
          </div>
        </div>

        {/* Sector Percentile Rankings Badges */}
        {benchmarkData && benchmarkData.percentileRanks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#1F2633]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-[#F0F2F5] uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#38BDF8]" />
                  Sector Percentile Rankings
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#141820] text-[#8E98A8] border border-[#1F2633]">
                  vs {benchmarkData.totalSectorCompanies} {benchmarkData.sector} peers
                </span>
              </div>
              <button
                onClick={() => setActiveTab('peers')}
                className="text-[11px] font-mono text-[#38BDF8] hover:underline transition flex items-center gap-1"
              >
                <span>View Full Peer Matrix & Multiples</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Badges Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {benchmarkData.percentileRanks.map((rank) => {
                const isPos = rank.badgeType === 'positive';
                const isCaut = rank.badgeType === 'caution';
                return (
                  <div
                    key={rank.metricKey}
                    onClick={() => setActiveTab('peers')}
                    className="p-3 rounded-xl border border-[#1F2633] bg-[#141820] hover:border-[#38BDF8]/50 transition text-xs cursor-pointer shadow-sm group"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-semibold text-[#F0F2F5] group-hover:text-[#38BDF8] transition truncate text-[11px]">
                        {rank.headline}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                          isPos
                            ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30'
                            : isCaut
                            ? 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30'
                            : 'text-[#8E98A8] bg-[#090B0E] border-[#1F2633]'
                        }`}
                      >
                        {rank.isHigherBetter
                          ? `Top ${Math.max(1, 100 - rank.percentile)}%`
                          : `#${rank.rank}/${rank.totalCompared}`}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#8E98A8] font-mono mt-1.5 truncate">
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
      <div className="bg-[#0E1217] border border-[#1F2633] rounded-xl p-5 sm:p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#F0F2F5]">Historical Price Action</h2>
              {hoveredQuote && (
                <span className="text-xs font-mono text-[#8E98A8] bg-[#141820] px-2 py-0.5 rounded border border-[#1F2633]">
                  {formatDate(hoveredQuote.date)}: <strong className="text-[#38BDF8]">{formatCurrency(hoveredQuote.close, stock.currency, false)}</strong>
                </span>
              )}
            </div>
            <p className="text-xs text-[#8E98A8] mt-0.5">
              Live market quotes via Yahoo Finance Proxy
            </p>
          </div>

          {/* Time range buttons */}
          <div className="flex items-center gap-1 bg-[#090B0E] p-1 rounded-lg border border-[#1F2633]">
            {(['1d', '5d', '1m', '6m', '1y', '5y'] as const).map((r) => (
              <button
                key={r}
                id={`chart-range-${r}`}
                onClick={() => setChartRange(r)}
                className={`px-2.5 py-1 text-xs font-mono uppercase rounded transition ${
                  chartRange === r
                    ? 'bg-[#161B26] text-[#F0F2F5] font-semibold border border-[#38BDF8]/40 shadow-sm shadow-[#38BDF8]/20'
                    : 'text-[#8E98A8] hover:text-[#F0F2F5]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Chart Graphic */}
        <div className="relative w-full h-[230px] flex items-center justify-center bg-[#090B0E] rounded-lg border border-[#1F2633] overflow-hidden">
          {isChartLoading ? (
            <div className="flex items-center gap-2 text-xs font-mono text-[#8E98A8]">
              <RefreshCw className="w-4 h-4 animate-spin text-[#38BDF8]" />
              Loading {chartRange.toUpperCase()} quotes...
            </div>
          ) : historyQuotes.length === 0 ? (
            <div className="text-xs text-[#8E98A8] font-mono">
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
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
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
                  stroke="#38BDF8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          )}
        </div>
      </div>

      {/* 3. Navigation Tabs: Overview, Quality Scorecard, Historical Valuation, Growth, Peers, Statements, Data Integrity */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-[#1F2633] pb-1 overflow-x-auto overscroll-x-contain scrollbar-none">
        <button
          id="detail-tab-overview"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 shrink-0 ${
            activeTab === 'overview'
              ? 'border-[#38BDF8] text-[#38BDF8] bg-[#0E1217]'
              : 'border-transparent text-[#8E98A8] hover:text-[#F0F2F5]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Institutional Overview</span>
        </button>

        <button
          id="detail-tab-scorecard"
          onClick={() => setActiveTab('scorecard')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 shrink-0 ${
            activeTab === 'scorecard'
              ? 'border-[#38BDF8] text-[#38BDF8] bg-[#0E1217]'
              : 'border-transparent text-[#8E98A8] hover:text-[#F0F2F5]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Quality Scorecard</span>
          <span className="px-1.5 py-0.2 rounded bg-[#161B26] text-[#10B981] border border-[#10B981]/30 font-mono text-[10px]">
            6 Pillars
          </span>
        </button>

        <button
          id="detail-tab-valuation"
          onClick={() => setActiveTab('valuation')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 shrink-0 ${
            activeTab === 'valuation'
              ? 'border-[#38BDF8] text-[#38BDF8] bg-[#0E1217]'
              : 'border-transparent text-[#8E98A8] hover:text-[#F0F2F5]'
          }`}
        >
          <CircleDollarSign className="w-3.5 h-3.5" />
          <span>Historical Valuation</span>
          <span className="px-1.5 py-0.2 rounded bg-[#1C1811] text-[#F59E0B] border border-[#F59E0B]/30 font-mono text-[10px]">
            5Y Range
          </span>
        </button>

        <button
          id="detail-tab-growth"
          onClick={() => setActiveTab('growth')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 shrink-0 ${
            activeTab === 'growth'
              ? 'border-[#38BDF8] text-[#38BDF8] bg-[#0E1217]'
              : 'border-transparent text-[#8E98A8] hover:text-[#F0F2F5]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Financial Trends</span>
        </button>

        <button
          id="detail-tab-peers"
          onClick={() => setActiveTab('peers')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 shrink-0 ${
            activeTab === 'peers'
              ? 'border-[#38BDF8] text-[#38BDF8] bg-[#0E1217]'
              : 'border-transparent text-[#8E98A8] hover:text-[#F0F2F5]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Peer Benchmarking</span>
          {benchmarkData && benchmarkData.peerStocks.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#161B26] text-[#38BDF8] border border-[#38BDF8]/40 font-mono text-[10px]">
              {benchmarkData.peerStocks.length}
            </span>
          )}
        </button>

        <button
          id="detail-tab-financials"
          onClick={() => setActiveTab('financials')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 shrink-0 ${
            activeTab === 'financials'
              ? 'border-[#38BDF8] text-[#38BDF8] bg-[#0E1217]'
              : 'border-transparent text-[#8E98A8] hover:text-[#F0F2F5]'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>3-Statement Model</span>
        </button>

        <button
          id="detail-tab-integrity"
          onClick={() => setActiveTab('integrity')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 shrink-0 ${
            activeTab === 'integrity'
              ? 'border-[#38BDF8] text-[#38BDF8] bg-[#0E1217]'
              : 'border-transparent text-[#8E98A8] hover:text-[#F0F2F5]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Data Integrity Audit</span>
        </button>
      </div>

      {/* Tab: Quality Scorecard */}
      {activeTab === 'scorecard' && (
        <div className="space-y-4">
          <QualityScorecardSection stock={stock} onMetricClick={handleMetricClick} />
        </div>
      )}

      {/* Tab: Historical Valuation */}
      {activeTab === 'valuation' && (
        <div className="space-y-4">
          <HistoricalValuationSection stock={stock} onMetricClick={handleMetricClick} />
        </div>
      )}

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
          <div className="bg-[#11141A] border border-[#252A33] rounded-xl p-8 text-center space-y-2">
            <RefreshCw className="w-5 h-5 text-[#7FA6C9] animate-spin mx-auto" />
            <p className="text-xs text-[#8B919C] font-mono">
              Computing automated peer discovery and sector percentile rankings...
            </p>
          </div>
        )
      )}

      {/* Tab: Financial Growth & Cash Flow Charts */}
      {activeTab === 'growth' && (
        <div className="space-y-4">
          <FinancialGrowthCharts
            growthSeries={growthSeries}
            stock={stock}
            currency={stock.currency}
            onMetricClick={handleMetricClick}
          />
        </div>
      )}

      {/* Tab 1: Core Fundamentals & Multiples */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive Institutional Research Snapshot */}
          <ResearchSnapshot
            stock={stock}
            benchmarkData={benchmarkData}
            onOpenExplainMove={() => setIsExplainMoveOpen(true)}
            onOpenThesisBuilder={() => setIsThesisBuilderOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />

          {/* Interactive Metric Hint Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#11141A] border border-[#252A33] text-xs text-[#8B919C]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7FA6C9]" />
              <span>
                <strong className="text-[#E8E9EB]">Interactive Metrics:</strong> Hover over any metric for its institutional interpretation, or click to view calculation models.
              </span>
            </div>
            <button
              onClick={() => setIsAiChatOpen(true)}
              className="text-[#7FA6C9] hover:text-[#7FA6C9]/80 font-medium inline-flex items-center gap-1 transition"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Open AI Chat</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Valuation Multiples */}
            <div className="bg-[#11141A] border border-[#252A33] rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#252A33]">
                <CircleDollarSign className="w-4 h-4 text-[#7FA6C9]" />
                <h3 className="text-xs font-mono font-semibold text-[#E8E9EB] uppercase tracking-wider">
                  Valuation Multiples
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-[#252A33]/50">
                  <MetricTooltip
                    metricKey="peRatio"
                    value={stock.peRatio}
                    formattedValue={formatRatio(stock.peRatio)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Trailing P/E (TTM)
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="peRatio"
                    value={stock.peRatio}
                    formattedValue={formatRatio(stock.peRatio)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#E8E9EB] font-medium"
                  />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#252A33]/50">
                  <MetricTooltip
                    metricKey="forwardPe"
                    value={stock.forwardPe}
                    formattedValue={formatRatio(stock.forwardPe)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Forward P/E
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="forwardPe"
                    value={stock.forwardPe}
                    formattedValue={formatRatio(stock.forwardPe)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#E8E9EB]"
                  />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#252A33]/50">
                  <MetricTooltip
                    metricKey="priceToBook"
                    value={stock.priceToBook}
                    formattedValue={formatRatio(stock.priceToBook)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Price to Book (P/B)
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="priceToBook"
                    value={stock.priceToBook}
                    formattedValue={formatRatio(stock.priceToBook)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#E8E9EB]"
                  />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#252A33]/50">
                  <MetricTooltip
                    metricKey="priceToSales"
                    value={stock.priceToSales}
                    formattedValue={formatRatio(stock.priceToSales)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Price to Sales (P/S)
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="priceToSales"
                    value={stock.priceToSales}
                    formattedValue={formatRatio(stock.priceToSales)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#E8E9EB]"
                  />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#252A33]/50">
                  <MetricTooltip
                    metricKey="enterpriseValue"
                    value={stock.enterpriseValue}
                    formattedValue={formatCurrency(stock.enterpriseValue, stock.currency)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Enterprise Value
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="enterpriseValue"
                    value={stock.enterpriseValue}
                    formattedValue={formatCurrency(stock.enterpriseValue, stock.currency)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#E8E9EB]"
                  />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#252A33]/50">
                  <MetricTooltip
                    metricKey="evToEbitda"
                    value={stock.evToEbitda}
                    formattedValue={formatRatio(stock.evToEbitda)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    EV / EBITDA
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="evToEbitda"
                    value={stock.evToEbitda}
                    formattedValue={formatRatio(stock.evToEbitda)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#E8E9EB]"
                  />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#252A33]/50">
                  <MetricTooltip
                    metricKey="evToRevenue"
                    value={stock.evToRevenue}
                    formattedValue={formatRatio(stock.evToRevenue)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    EV / Revenue
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="evToRevenue"
                    value={stock.evToRevenue}
                    formattedValue={formatRatio(stock.evToRevenue)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#E8E9EB]"
                  />
                </div>
                <div className="flex justify-between items-center py-1">
                  <MetricTooltip
                    metricKey="dividendYield"
                    value={stock.dividendYield}
                    formattedValue={formatPercent(stock.dividendYield, false)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Dividend Yield
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="dividendYield"
                    value={stock.dividendYield}
                    formattedValue={formatPercent(stock.dividendYield, false)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#6FA58A] font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Profitability & Returns */}
            <div className="bg-[#11141A] border border-[#252A33] rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#252A33]">
                <Percent className="w-4 h-4 text-[#7FA6C9]" />
                <h3 className="text-xs font-mono font-semibold text-[#E8E9EB] uppercase tracking-wider">
                  Profitability & Growth
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-[#252A33]/50">
                  <MetricTooltip
                    metricKey="revenue"
                    value={stock.revenue}
                    formattedValue={formatCurrency(stock.revenue, stock.currency)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Revenue (TTM)
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="revenue"
                    value={stock.revenue}
                    formattedValue={formatCurrency(stock.revenue, stock.currency)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#E8E9EB] font-medium"
                  />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#252A33]/50">
                  <MetricTooltip
                    metricKey="revenueGrowth"
                    value={stock.revenueGrowth}
                    formattedValue={formatPercent(stock.revenueGrowth)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Revenue Growth (YoY)
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="revenueGrowth"
                    value={stock.revenueGrowth}
                    formattedValue={formatPercent(stock.revenueGrowth)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className={`font-mono font-medium ${stock.revenueGrowth && stock.revenueGrowth > 0 ? 'text-[#6FA58A]' : 'text-[#B87878]'}`}
                  />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#252A33]/50">
                  <MetricTooltip
                    metricKey="grossMargin"
                    value={stock.grossMargin}
                    formattedValue={formatPercent(stock.grossMargin, false)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Gross Margin
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="grossMargin"
                    value={stock.grossMargin}
                    formattedValue={formatPercent(stock.grossMargin, false)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#E8E9EB]"
                  />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#252A33]/50">
                  <MetricTooltip
                    metricKey="operatingMargin"
                    value={stock.operatingMargin}
                    formattedValue={formatPercent(stock.operatingMargin, false)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Operating Margin
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="operatingMargin"
                    value={stock.operatingMargin}
                    formattedValue={formatPercent(stock.operatingMargin, false)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#E8E9EB]"
                  />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#252A33]/50">
                  <MetricTooltip
                    metricKey="netMargin"
                    value={stock.netMargin}
                    formattedValue={formatPercent(stock.netMargin, false)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Net Profit Margin
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="netMargin"
                    value={stock.netMargin}
                    formattedValue={formatPercent(stock.netMargin, false)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#E8E9EB]"
                  />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#252A33]/50">
                  <MetricTooltip
                    metricKey="returnOnEquity"
                    value={stock.returnOnEquity}
                    formattedValue={formatPercent(stock.returnOnEquity, false)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Return on Equity (ROE)
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="returnOnEquity"
                    value={stock.returnOnEquity}
                    formattedValue={formatPercent(stock.returnOnEquity, false)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#6FA58A] font-medium"
                  />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#252A33]/50">
                  <MetricTooltip
                    metricKey="returnOnAssets"
                    value={stock.returnOnAssets}
                    formattedValue={formatPercent(stock.returnOnAssets, false)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Return on Assets (ROA)
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="returnOnAssets"
                    value={stock.returnOnAssets}
                    formattedValue={formatPercent(stock.returnOnAssets, false)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#E8E9EB]"
                  />
                </div>
                <div className="flex justify-between items-center py-1">
                  <MetricTooltip
                    metricKey="eps"
                    value={stock.eps}
                    formattedValue={stock.eps !== null ? stock.eps?.toFixed(2) : '—'}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Diluted EPS
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="eps"
                    value={stock.eps}
                    formattedValue={stock.eps !== null ? stock.eps?.toFixed(2) : '—'}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#E8E9EB] font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Financial Health & Solvency */}
            <div className="bg-[#11141A] border border-[#252A33] rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#252A33]">
                <ShieldCheck className="w-4 h-4 text-[#7FA6C9]" />
                <h3 className="text-xs font-mono font-semibold text-[#E8E9EB] uppercase tracking-wider">
                  Financial Health
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-[#252A33]/50">
                  <MetricTooltip
                    metricKey="totalCash"
                    value={stock.totalCash}
                    formattedValue={formatCurrency(stock.totalCash, stock.currency)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Total Cash
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="totalCash"
                    value={stock.totalCash}
                    formattedValue={formatCurrency(stock.totalCash, stock.currency)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#E8E9EB] font-medium"
                  />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#252A33]/50">
                  <MetricTooltip
                    metricKey="totalDebt"
                    value={stock.totalDebt}
                    formattedValue={formatCurrency(stock.totalDebt, stock.currency)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Total Debt
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="totalDebt"
                    value={stock.totalDebt}
                    formattedValue={formatCurrency(stock.totalDebt, stock.currency)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#E8E9EB]"
                  />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#252A33]/50">
                  <MetricTooltip
                    metricKey="debtToEquity"
                    value={stock.debtToEquity}
                    formattedValue={formatPercent(stock.debtToEquity, false)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Debt to Equity
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="debtToEquity"
                    value={stock.debtToEquity}
                    formattedValue={formatPercent(stock.debtToEquity, false)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#E8E9EB]"
                  />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#252A33]/50">
                  <MetricTooltip
                    metricKey="currentRatio"
                    value={stock.currentRatio}
                    formattedValue={formatRatio(stock.currentRatio, '')}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Current Ratio
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="currentRatio"
                    value={stock.currentRatio}
                    formattedValue={formatRatio(stock.currentRatio, '')}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#E8E9EB]"
                  />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#252A33]/50">
                  <MetricTooltip
                    metricKey="quickRatio"
                    value={stock.quickRatio}
                    formattedValue={formatRatio(stock.quickRatio, '')}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Quick Ratio
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="quickRatio"
                    value={stock.quickRatio}
                    formattedValue={formatRatio(stock.quickRatio, '')}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#E8E9EB]"
                  />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#252A33]/50">
                  <MetricTooltip
                    metricKey="operatingCashFlow"
                    value={stock.operatingCashFlow}
                    formattedValue={formatCurrency(stock.operatingCashFlow, stock.currency)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Operating Cash Flow
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="operatingCashFlow"
                    value={stock.operatingCashFlow}
                    formattedValue={formatCurrency(stock.operatingCashFlow, stock.currency)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#E8E9EB]"
                  />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#252A33]/50">
                  <MetricTooltip
                    metricKey="freeCashFlow"
                    value={stock.freeCashFlow}
                    formattedValue={formatCurrency(stock.freeCashFlow, stock.currency)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Free Cash Flow
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="freeCashFlow"
                    value={stock.freeCashFlow}
                    formattedValue={formatCurrency(stock.freeCashFlow, stock.currency)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#E8E9EB] font-medium"
                  />
                </div>
                <div className="flex justify-between items-center py-1">
                  <MetricTooltip
                    metricKey="beta"
                    value={stock.beta}
                    formattedValue={formatNumber(stock.beta, 2)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="text-[#8B919C] hover:text-[#E8E9EB] cursor-help"
                  >
                    Beta (5Y Monthly)
                  </MetricTooltip>
                  <ClickableMetric
                    metricKey="beta"
                    value={stock.beta}
                    formattedValue={formatNumber(stock.beta, 2)}
                    stock={stock}
                    onMetricClick={handleMetricClick}
                    className="font-mono text-[#E8E9EB]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Financial Growth & Cash Flow Charts on Overview */}
          <div className="pt-2">
            <FinancialGrowthCharts
              growthSeries={growthSeries}
              stock={stock}
              currency={stock.currency}
              onMetricClick={handleMetricClick}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Financial Statements */}
      {activeTab === 'financials' && (
        <div className="bg-[#11141A] border border-[#252A33] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-[#0B0D10] p-1 rounded-lg border border-[#252A33]">
              <button
                onClick={() => setActiveStatementTab('is')}
                className={`px-3 py-1 text-xs font-medium rounded transition ${
                  activeStatementTab === 'is' ? 'bg-[#151922] text-[#E8E9EB] font-semibold border border-[#252A33]' : 'text-[#8B919C] hover:text-[#E8E9EB]'
                }`}
              >
                Income Statement
              </button>
              <button
                onClick={() => setActiveStatementTab('bs')}
                className={`px-3 py-1 text-xs font-medium rounded transition ${
                  activeStatementTab === 'bs' ? 'bg-[#151922] text-[#E8E9EB] font-semibold border border-[#252A33]' : 'text-[#8B919C] hover:text-[#E8E9EB]'
                }`}
              >
                Balance Sheet
              </button>
              <button
                onClick={() => setActiveStatementTab('cf')}
                className={`px-3 py-1 text-xs font-medium rounded transition ${
                  activeStatementTab === 'cf' ? 'bg-[#151922] text-[#E8E9EB] font-semibold border border-[#252A33]' : 'text-[#8B919C] hover:text-[#E8E9EB]'
                }`}
              >
                Cash Flow
              </button>
            </div>

            <span className="text-xs font-mono text-[#8B919C]">
              Reported in {stock.currency}
            </span>
          </div>

          {/* Statement Table */}
          <div className="overflow-x-auto">
            {statements[activeStatementTab].length === 0 ? (
              <div className="py-12 text-center text-xs text-[#8B919C]">
                Detailed statement line items currently undergoing quarterly consolidation or not reported.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#252A33] text-[#8B919C] font-mono">
                    <th className="py-2.5 px-3">Metric / Line Item</th>
                    <th className="py-2.5 px-3">Period</th>
                    <th className="py-2.5 px-3 text-right font-medium text-[#E8E9EB]">
                      Reported Value ({stock.currency})
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252A33]/50 font-mono">
                  {statements[activeStatementTab].map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#151922]/60 transition">
                      <td className="py-2.5 px-3 text-[#E8E9EB] font-sans font-medium">
                        {row.label}
                      </td>
                      <td className="py-2.5 px-3 text-[#8B919C]">
                        {row.period}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#E8E9EB]">
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
        <div className="space-y-4">
          {/* Automated Fundamental Anomaly & Cross-Check Engine */}
          <FinancialAnomaliesSection stock={stock} />

          <div className="bg-[#11141A] border border-[#252A33] rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#E8E9EB]">Market Data Integrity Audit</h3>
              <p className="text-xs text-[#8B919C] mt-0.5">
                Technical honesty report detailing sources, refresh timestamps, and missing-field status.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-[#151922] p-3 rounded-lg border border-[#252A33]">
                <span className="text-[11px] text-[#8B919C] block font-mono">PRIMARY DATA PROVIDER</span>
                <span className="text-xs font-medium text-[#E8E9EB] mt-1 block">Yahoo Finance (Server BFF)</span>
              </div>
              <div className="bg-[#151922] p-3 rounded-lg border border-[#252A33]">
                <span className="text-[11px] text-[#8B919C] block font-mono">LAST NORMALIZED SYNC</span>
                <span className="text-xs font-medium text-[#E8E9EB] mt-1 block font-mono">
                  {new Date(stock.lastUpdated).toLocaleTimeString()}
                </span>
              </div>
              <div className="bg-[#151922] p-3 rounded-lg border border-[#252A33]">
                <span className="text-[11px] text-[#8B919C] block font-mono">REPORTING CURRENCY</span>
                <span className="text-xs font-medium text-[#E8E9EB] mt-1 block font-mono">{stock.currency}</span>
              </div>
              <div className="bg-[#151922] p-3 rounded-lg border border-[#252A33]">
                <span className="text-[11px] text-[#8B919C] block font-mono">EXCHANGE ROUTE</span>
                <span className="text-xs font-medium text-[#E8E9EB] mt-1 block font-mono">{stock.exchange}</span>
              </div>
            </div>

            <div className="bg-[#151922] p-4 rounded-lg border border-[#252A33] space-y-2 text-xs">
              <span className="font-semibold text-[#E8E9EB] block">Field Resolution & Missing Data Policy:</span>
              <ul className="list-disc list-inside space-y-1 text-[#8B919C] leading-relaxed">
                <li>
                  <strong className="text-[#E8E9EB]">Technical Honesty:</strong> When fundamental fields are not disclosed by the company or not applicable (such as commercial banks without traditional gross inventory or industrial debt ratios), the application presents <code className="text-[#7FA6C9] font-mono">"—"</code> rather than substituting false zero values.
                </li>
                <li>
                  <strong className="text-[#E8E9EB]">Resilient Architecture:</strong> Unlike external client-side scrapers that fail with CORS or HTTP 403 errors, the Node backend service isolates errors gracefully and retains 15-minute cached records.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Business Description */}
      {stock.description && (
        <div className="bg-[#11141A] border border-[#252A33] rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-mono font-semibold text-[#7FA6C9] uppercase tracking-wider mb-2">
            Company Business Overview
          </h3>
          <p className="text-xs text-[#8B919C] leading-relaxed max-w-4xl">
            {stock.description}
          </p>
        </div>
      )}

      {/* Floating Quick Ask AI Button when panel is closed */}
      {!isAiChatOpen && (
        <button
          id="floating-ask-ai-btn"
          onClick={() => setIsAiChatOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#151922] hover:bg-[#151922]/90 text-[#E8E9EB] shadow-lg shadow-black/50 font-medium text-xs border border-[#252A33] transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#7FA6C9]" />
          <span>Ask AI about {stock.symbol}</span>
        </button>
      )}

      {/* Explain Move AI Analysis Modal */}
      <ExplainMoveModal
        isOpen={isExplainMoveOpen}
        onClose={() => setIsExplainMoveOpen(false)}
        stock={stock}
      />

      {/* Institutional Thesis Builder Modal */}
      <ThesisBuilderModal
        isOpen={isThesisBuilderOpen}
        onClose={() => setIsThesisBuilderOpen(false)}
        stock={stock}
      />

      {/* 1-Page Investment Memo / PDF Tearsheet Modal */}
      <InvestmentMemoModal
        isOpen={isMemoOpen}
        onClose={() => setIsMemoOpen(false)}
        stock={stock}
        benchmarkData={benchmarkData}
        growthSeries={growthSeries}
      />

      {/* Metric Explainer Modal */}
      <MetricExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
        metric={explainerMetric}
        rawValue={explainerRawValue}
        formattedValue={explainerFormattedValue}
        symbol={stock.symbol}
        companyName={stock.companyName}
        onAskAiAboutMetric={handleAskAiAboutMetric}
      />

      {/* In-House AI Stock Assistant Chat Panel */}
      <StockAiChat
        stock={stock}
        benchmarkData={benchmarkData}
        growthSeries={growthSeries}
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        initialQuestion={aiInitialQuestion}
        onClearInitialQuestion={() => setAiInitialQuestion(null)}
      />
    </div>
  );
};
