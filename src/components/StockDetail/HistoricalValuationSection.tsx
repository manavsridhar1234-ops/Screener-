import React, { useState } from 'react';
import { History, TrendingUp, TrendingDown, Clock, BarChart3, HelpCircle } from 'lucide-react';
import type { NormalizedStock, FinancialGrowthPoint, HistoricalValuationMetricData } from '../../types';
import { computeHistoricalValuation } from '../../utils/institutionalAnalysis';

interface HistoricalValuationSectionProps {
  stock: NormalizedStock;
  growthSeries?: FinancialGrowthPoint[];
  onMetricClick?: (metric: any) => void;
}

export const HistoricalValuationSection: React.FC<HistoricalValuationSectionProps> = ({
  stock,
  growthSeries = [],
  onMetricClick,
}) => {
  const metricsData = React.useMemo(
    () => computeHistoricalValuation(stock, growthSeries || []),
    [stock, growthSeries]
  );

  const [activeKey, setActiveKey] = useState<string>('fwdPe');

  const selectedMetric =
    metricsData.find((m) => m.key === activeKey) || metricsData[0];

  const getStatusBadgeClass = (status: HistoricalValuationMetricData['status']) => {
    switch (status) {
      case 'Cheap':
        return 'bg-[#151922] text-[#6FA58A] border-[#252A33]';
      case 'Fair':
        return 'bg-[#151922] text-[#7FA6C9] border-[#252A33]';
      case 'Elevated':
        return 'bg-[#151922] text-[#B8A36A] border-[#252A33]';
      case 'Extended':
        return 'bg-[#151922] text-[#B87878] border-[#252A33]';
      default:
        return 'bg-[#151922] text-[#8B919C] border-[#252A33]';
    }
  };

  return (
    <div id="historical-valuation-section" className="bg-[#11141A] border border-[#252A33] rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#252A33]">
        <div>
          <h2 className="text-xs font-mono font-semibold text-[#E8E9EB] uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-[#7FA6C9]" />
            <span>5-Year Historical Valuation Range & Multiples History</span>
          </h2>
          <p className="text-xs text-[#8B919C] mt-0.5">
            Benchmarks current multiples against {stock.symbol}'s 5-year chronological cycle.
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {metricsData.map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveKey(m.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition whitespace-nowrap ${
                activeKey === m.key
                  ? 'bg-[#151922] text-[#E8E9EB] font-semibold border border-[#252A33]'
                  : 'text-[#8B919C] hover:text-[#E8E9EB] hover:bg-[#151922]/50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Metric Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Current Multiple */}
        <div className="p-3 rounded-lg bg-[#0B0D10] border border-[#252A33] space-y-1">
          <div className="text-[11px] font-medium text-[#8B919C] uppercase tracking-wider">
            Current Multiple
          </div>
          <div className="text-2xl font-mono font-semibold text-[#E8E9EB]">
            {selectedMetric.current !== null ? `${selectedMetric.current}x` : '—'}
          </div>
          <div className="text-[10px] font-mono">
            <span
              className={`px-1.5 py-0.5 rounded border text-[10px] uppercase tracking-wider ${getStatusBadgeClass(
                selectedMetric.status
              )}`}
            >
              {selectedMetric.status} ({selectedMetric.percentileRank5Y ?? 50}th %ile)
            </span>
          </div>
        </div>

        {/* 5Y Median */}
        <div className="p-3 rounded-lg bg-[#0B0D10] border border-[#252A33] space-y-1">
          <div className="text-[11px] font-medium text-[#8B919C] uppercase tracking-wider">
            5-Year Median
          </div>
          <div className="text-2xl font-mono font-semibold text-[#E8E9EB]">
            {selectedMetric.median5Y !== null ? `${selectedMetric.median5Y}x` : '—'}
          </div>
          <div className="text-[10px] text-[#8B919C]">
            Cycle Historical Anchor
          </div>
        </div>

        {/* 5Y Low */}
        <div className="p-3 rounded-lg bg-[#0B0D10] border border-[#252A33] space-y-1">
          <div className="text-[11px] font-medium text-[#8B919C] uppercase tracking-wider">
            5-Year Low
          </div>
          <div className="text-2xl font-mono font-semibold text-[#6FA58A]">
            {selectedMetric.low5Y !== null ? `${selectedMetric.low5Y}x` : '—'}
          </div>
          <div className="text-[10px] text-[#8B919C]">
            Cycle Floor Multiple
          </div>
        </div>

        {/* 5Y High */}
        <div className="p-3 rounded-lg bg-[#0B0D10] border border-[#252A33] space-y-1">
          <div className="text-[11px] font-medium text-[#8B919C] uppercase tracking-wider">
            5-Year High
          </div>
          <div className="text-2xl font-mono font-semibold text-[#B87878]">
            {selectedMetric.high5Y !== null ? `${selectedMetric.high5Y}x` : '—'}
          </div>
          <div className="text-[10px] text-[#8B919C]">
            Cycle Peak Multiple
          </div>
        </div>

        {/* Valuation Band Positioning */}
        <div className="p-3 rounded-lg bg-[#0B0D10] border border-[#252A33] space-y-1 col-span-2 sm:col-span-4 lg:col-span-1">
          <div className="text-[11px] font-medium text-[#8B919C] uppercase tracking-wider">
            5Y Range Position
          </div>
          <div className="text-sm font-mono font-semibold text-[#E8E9EB] mt-1">
            {selectedMetric.percentileRank5Y !== null ? `${selectedMetric.percentileRank5Y}% of 5Y Range` : 'Normal'}
          </div>
          {/* Visual Position Bar */}
          <div className="w-full bg-[#151922] h-2 rounded-full overflow-hidden mt-1.5 relative border border-[#252A33]">
            <div
              className="bg-[#7FA6C9] h-full rounded-full transition-all duration-300"
              style={{ width: `${selectedMetric.percentileRank5Y ?? 50}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5-Year Trajectory Bar Visualization */}
      <div className="p-4 rounded-xl bg-[#0B0D10] border border-[#252A33] space-y-3">
        <div className="flex items-center justify-between text-xs text-[#8B919C] font-mono">
          <span>5-Year Progression ({selectedMetric.label})</span>
          <span>Annual Year-End & Current Consensus</span>
        </div>

        <div className="grid grid-cols-5 gap-2 pt-2">
          {selectedMetric.history.map((pt, idx) => {
            const isLatest = idx === selectedMetric.history.length - 1;
            const maxVal = selectedMetric.high5Y || 100;
            const heightPct = Math.min(100, Math.max(15, ((pt.value || 0) / maxVal) * 100));

            return (
              <div key={pt.year} className="flex flex-col items-center gap-1.5 text-center">
                <div className="h-20 w-full flex items-end justify-center">
                  <div
                    className={`w-full max-w-[36px] rounded-t transition-all ${
                      isLatest
                        ? 'bg-[#7FA6C9]'
                        : 'bg-[#252A33] hover:bg-[#252A33]/80'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <div className="font-mono text-xs font-semibold text-[#E8E9EB]">
                  {pt.value !== null ? `${pt.value}x` : '—'}
                </div>
                <div className="text-[10px] font-mono text-[#8B919C]">
                  {pt.year}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
