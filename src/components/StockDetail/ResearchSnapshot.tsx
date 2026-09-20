import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  BarChart2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import type { NormalizedStock, FinancialGrowthPoint } from '../../types';
import { formatCurrency, formatPercent, formatRatio } from '../../utils/formatters';
import { generateAsciiSparkline } from '../../utils/institutionalAnalysis';
import { MetricTooltip } from '../Common/MetricTooltip';

interface ResearchSnapshotProps {
  stock: NormalizedStock;
  growthSeries?: FinancialGrowthPoint[];
  benchmarkData?: any;
  onOpenExplainMove: () => void;
  onOpenThesis?: () => void;
  onOpenThesisBuilder?: () => void;
  onOpenScorecard?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const ResearchSnapshot: React.FC<ResearchSnapshotProps> = ({
  stock,
  growthSeries = [],
  benchmarkData,
  onOpenExplainMove,
  onOpenThesis,
  onOpenThesisBuilder,
  onOpenScorecard,
  onNavigateTab,
}) => {
  const isPositive = (stock.dayChangePercent ?? 0) >= 0;
  const netDebt = stock.netDebt ?? ((stock.totalDebt || 0) - (stock.totalCash || 0));
  const isNetCash = netDebt <= 0;

  const handleOpenThesis = onOpenThesis || onOpenThesisBuilder || (() => {});
  const handleOpenScorecard = onOpenScorecard || (() => {
    if (onNavigateTab) onNavigateTab('scorecard');
  });

  // 3 Key Things to Investigate auto-generated from fundamental signals
  const questionsToInvestigate = React.useMemo(() => {
    const list: string[] = [];

    // Question 1: Top-line growth vs sustainability
    if (stock.revenueGrowth && stock.revenueGrowth > 20) {
      list.push(
        `Sustainability of high-velocity revenue growth (${stock.revenueGrowth.toFixed(1)}% YoY) as baseline comps toughen.`
      );
    } else if (stock.revenueGrowth && stock.revenueGrowth < 5) {
      list.push(
        `Top-line deceleration catalysts: Is ${stock.revenueGrowth.toFixed(1)}% growth cyclical or structural market share loss?`
      );
    } else {
      list.push(
        `Revenue growth trajectory vs sector peers and pricing power under margin pressure.`
      );
    }

    // Question 2: Valuation multiple vs historical mean
    const fwdPe = stock.forwardPe ?? stock.peRatio;
    if (fwdPe && fwdPe > 35) {
      list.push(
        `Valuation compression sensitivity: At ${fwdPe.toFixed(1)}x forward P/E, what earnings beats are baked into consensus?`
      );
    } else if (fwdPe && fwdPe < 15) {
      list.push(
        `Value trap vs re-rating potential: Why is the market discounting forward earnings to ${fwdPe.toFixed(1)}x P/E?`
      );
    } else {
      list.push(
        `Multiple re-rating catalysts and PEG ratio alignment with forward earnings growth.`
      );
    }

    // Question 3: Cash conversion & balance sheet leverage
    if (stock.freeCashFlow && stock.netIncome && stock.freeCashFlow > stock.netIncome) {
      list.push(
        `Cash conversion quality: FCF (${formatCurrency(stock.freeCashFlow, stock.currency)}) exceeds reported Net Income (${((stock.freeCashFlow / stock.netIncome) * 100).toFixed(0)}% conversion).`
      );
    } else if (stock.totalDebt && stock.totalDebt > (stock.totalCash || 0)) {
      list.push(
        `Refinancing risk and interest coverage on ${formatCurrency(stock.totalDebt, stock.currency)} total debt in a higher-rate regime.`
      );
    } else {
      list.push(
        `Capital allocation strategy: Will surplus net cash be deployed for buybacks, dividends, or strategic M&A?`
      );
    }

    return list.slice(0, 3);
  }, [stock]);

  // Ascii sparkline for 5Y revenue & FCF with bulletproof array checking
  const safeGrowthSeries = Array.isArray(growthSeries) ? growthSeries : [];
  const revSparkline = generateAsciiSparkline(safeGrowthSeries.map((g) => g.revenue));
  const fcfSparkline = generateAsciiSparkline(safeGrowthSeries.map((g) => g.freeCashFlow));

  return (
    <div
      id="research-snapshot-card"
      className="bg-[#11141A] border border-[#252A33] rounded-xl p-4 sm:p-5 space-y-4 shadow-sm"
    >
      {/* Top Bar: Title, Tags, and Fast Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#252A33]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#E8E9EB] flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-[#7FA6C9]" />
            Research Snapshot
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-[#151922] border border-[#252A33] text-[#8B919C]">
              Growth
            </span>
            <span className="px-2 py-0.5 rounded bg-[#151922] border border-[#252A33] text-[#8B919C]">
              Quality
            </span>
            <span className="px-2 py-0.5 rounded bg-[#151922] border border-[#252A33] text-[#8B919C]">
              Valuation
            </span>
            <span className="px-2 py-0.5 rounded bg-[#151922] border border-[#252A33] text-[#8B919C]">
              Balance Sheet
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="explain-move-snapshot-btn"
            onClick={onOpenExplainMove}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#151922] hover:bg-[#151922]/80 text-[#E8E9EB] border border-[#252A33] transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#7FA6C9]" />
            <span>Explain Today's Move ({stock.dayChangePercent !== null ? `${stock.dayChangePercent >= 0 ? '+' : ''}${stock.dayChangePercent.toFixed(2)}%` : '0%'})</span>
          </button>
          <button
            id="open-thesis-snapshot-btn"
            onClick={handleOpenThesis}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#151922] hover:bg-[#151922]/80 text-[#E8E9EB] border border-[#252A33] transition"
          >
            <span>Thesis Builder</span>
          </button>
        </div>
      </div>

      {/* Grid of 5 Key Pillar Metrics: Numbers are the Visual Hero */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
        {/* Pillar 1: Growth */}
        <MetricTooltip
          metricKey="revenueGrowth"
          value={stock.revenueGrowth}
          formattedValue={stock.revenueGrowth !== null ? `${stock.revenueGrowth >= 0 ? '+' : ''}${stock.revenueGrowth.toFixed(1)}%` : '—'}
          stock={stock}
          className="w-full block"
        >
          <div className="p-3 rounded-lg bg-[#151922] border border-[#252A33] hover:border-[#7FA6C9]/50 transition cursor-help space-y-1 group">
            <div className="text-[11px] font-medium text-[#8B919C] uppercase tracking-wider flex items-center justify-between">
              <span className="group-hover:text-[#E8E9EB] transition">Growth</span>
              <span className="font-mono text-[10px] text-[#8B919C]">{revSparkline}</span>
            </div>
            <div className="text-xl font-mono font-semibold text-[#E8E9EB] group-hover:text-[#7FA6C9] transition">
              {stock.revenueGrowth !== null ? `${stock.revenueGrowth >= 0 ? '+' : ''}${stock.revenueGrowth.toFixed(1)}%` : '—'}
            </div>
            <div className="text-[11px] text-[#8B919C] truncate flex items-center justify-between">
              <span>YoY Revenue Growth</span>
              <span className="text-[9px] text-[#7FA6C9] opacity-0 group-hover:opacity-100 transition">Hover Info</span>
            </div>
          </div>
        </MetricTooltip>

        {/* Pillar 2: Profitability */}
        <MetricTooltip
          metricKey="operatingMargin"
          value={stock.operatingMargin}
          formattedValue={stock.operatingMargin !== null ? `${stock.operatingMargin.toFixed(1)}%` : '—'}
          stock={stock}
          className="w-full block"
        >
          <div className="p-3 rounded-lg bg-[#151922] border border-[#252A33] hover:border-[#6FA58A]/50 transition cursor-help space-y-1 group">
            <div className="text-[11px] font-medium text-[#8B919C] uppercase tracking-wider flex items-center justify-between">
              <span className="group-hover:text-[#E8E9EB] transition">Profitability</span>
            </div>
            <div className="text-xl font-mono font-semibold text-[#E8E9EB] group-hover:text-[#6FA58A] transition">
              {stock.operatingMargin !== null ? `${stock.operatingMargin.toFixed(1)}%` : '—'}
            </div>
            <div className="text-[11px] text-[#8B919C] truncate flex items-center justify-between">
              <span>Operating Margin {stock.returnOnEquity ? `| ${stock.returnOnEquity.toFixed(0)}% ROE` : ''}</span>
              <span className="text-[9px] text-[#6FA58A] opacity-0 group-hover:opacity-100 transition">Hover Info</span>
            </div>
          </div>
        </MetricTooltip>

        {/* Pillar 3: Cash Generation */}
        <MetricTooltip
          metricKey="freeCashFlow"
          value={stock.freeCashFlow}
          formattedValue={formatCurrency(stock.freeCashFlow, stock.currency)}
          stock={stock}
          className="w-full block"
        >
          <div className="p-3 rounded-lg bg-[#151922] border border-[#252A33] hover:border-[#7FA6C9]/50 transition cursor-help space-y-1 group">
            <div className="text-[11px] font-medium text-[#8B919C] uppercase tracking-wider flex items-center justify-between">
              <span className="group-hover:text-[#E8E9EB] transition">Cash Flow</span>
              <span className="font-mono text-[10px] text-[#8B919C]">{fcfSparkline}</span>
            </div>
            <div className="text-xl font-mono font-semibold text-[#E8E9EB] group-hover:text-[#7FA6C9] transition">
              {formatCurrency(stock.freeCashFlow, stock.currency)}
            </div>
            <div className="text-[11px] text-[#8B919C] truncate flex items-center justify-between">
              <span>Free Cash Flow {stock.fcfMargin ? `(${stock.fcfMargin.toFixed(1)}%)` : ''}</span>
              <span className="text-[9px] text-[#7FA6C9] opacity-0 group-hover:opacity-100 transition">Hover Info</span>
            </div>
          </div>
        </MetricTooltip>

        {/* Pillar 4: Balance Sheet */}
        <MetricTooltip
          metricKey="debtToEquity"
          value={stock.debtToEquity}
          formattedValue={stock.debtToEquity !== null ? `${stock.debtToEquity.toFixed(1)}%` : '—'}
          stock={stock}
          className="w-full block"
        >
          <div className="p-3 rounded-lg bg-[#151922] border border-[#252A33] hover:border-[#7FA6C9]/50 transition cursor-help space-y-1 group">
            <div className="text-[11px] font-medium text-[#8B919C] uppercase tracking-wider flex items-center justify-between">
              <span className="group-hover:text-[#E8E9EB] transition">Balance Sheet</span>
            </div>
            <div className="text-xl font-mono font-semibold text-[#E8E9EB] truncate group-hover:text-[#7FA6C9] transition">
              {isNetCash
                ? `+${formatCurrency(Math.abs(netDebt), stock.currency)}`
                : `-${formatCurrency(netDebt, stock.currency)}`}
            </div>
            <div className="text-[11px] text-[#8B919C] truncate flex items-center justify-between">
              <span>{isNetCash ? 'Surplus Net Cash' : 'Net Debt'} {stock.currentRatio ? `(${stock.currentRatio.toFixed(1)}x)` : ''}</span>
              <span className="text-[9px] text-[#7FA6C9] opacity-0 group-hover:opacity-100 transition">Hover Info</span>
            </div>
          </div>
        </MetricTooltip>

        {/* Pillar 5: Valuation */}
        <MetricTooltip
          metricKey={stock.forwardPe ? 'forwardPe' : 'peRatio'}
          value={stock.forwardPe ?? stock.peRatio}
          formattedValue={stock.forwardPe ? `${stock.forwardPe.toFixed(1)}x` : stock.peRatio ? `${stock.peRatio.toFixed(1)}x` : '—'}
          stock={stock}
          className="w-full block col-span-2 sm:col-span-1"
        >
          <div className="p-3 rounded-lg bg-[#151922] border border-[#252A33] hover:border-[#7FA6C9]/50 transition cursor-help space-y-1 group">
            <div className="text-[11px] font-medium text-[#8B919C] uppercase tracking-wider flex items-center justify-between">
              <span className="group-hover:text-[#E8E9EB] transition">Valuation</span>
            </div>
            <div className="text-xl font-mono font-semibold text-[#E8E9EB] group-hover:text-[#7FA6C9] transition">
              {stock.forwardPe ? `${stock.forwardPe.toFixed(1)}x` : stock.peRatio ? `${stock.peRatio.toFixed(1)}x` : '—'}
            </div>
            <div className="text-[11px] text-[#8B919C] truncate flex items-center justify-between">
              <span>{stock.forwardPe ? 'Forward P/E' : 'Trailing P/E'} {stock.evToEbitda ? `| ${stock.evToEbitda.toFixed(1)}x` : ''}</span>
              <span className="text-[9px] text-[#7FA6C9] opacity-0 group-hover:opacity-100 transition">Hover Info</span>
            </div>
          </div>
        </MetricTooltip>
      </div>

      {/* Institutional Research Roadmap: Key Things to Investigate */}
      <div className="pt-2 border-t border-[#252A33] flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs">
        <div className="space-y-1.5 flex-1">
          <div className="font-medium text-[#E8E9EB] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7FA6C9]" />
            <span>Key Things to Investigate for {stock.symbol}:</span>
          </div>
          <div className="space-y-1 pl-3 text-[#8B919C] font-mono text-[11px]">
            {questionsToInvestigate.map((q, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#8B919C] font-medium">{idx + 1}.</span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleOpenScorecard}
          className="text-xs text-[#8B919C] hover:text-[#E8E9EB] transition flex items-center gap-1 shrink-0 self-start md:self-center font-mono py-1 px-2.5 rounded bg-[#151922] border border-[#252A33]"
        >
          <span>View 6-Dimension Scorecard</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
