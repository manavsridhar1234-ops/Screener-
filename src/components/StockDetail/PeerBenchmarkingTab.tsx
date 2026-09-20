import React from 'react';
import {
  Users,
  Scale,
  Award,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import type { NormalizedStock, PeerBenchmarkData, SectorPercentileRank } from '../../types';
import {
  formatCurrency,
  formatPercent,
  formatRatio,
  formatNumber,
} from '../../utils/formatters';

interface PeerBenchmarkingTabProps {
  currentStock: NormalizedStock;
  benchmarkData: PeerBenchmarkData;
  onSelectStock: (symbol: string) => void;
  compareList: string[];
  onToggleCompare: (symbol: string) => void;
  onCompareWithPeers?: (symbols: string[]) => void;
}

export const PeerBenchmarkingTab: React.FC<PeerBenchmarkingTabProps> = ({
  currentStock,
  benchmarkData,
  onSelectStock,
  compareList,
  onToggleCompare,
  onCompareWithPeers,
}) => {
  const peerSymbols = benchmarkData.peerStocks.map((p) => p.symbol);
  const allPeersInCompare = peerSymbols.every((s) => compareList.includes(s));

  const handleCompareAll = () => {
    if (onCompareWithPeers) {
      onCompareWithPeers(peerSymbols);
    } else {
      peerSymbols.forEach((sym) => {
        if (!compareList.includes(sym)) onToggleCompare(sym);
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Executive Summary & Action Banner */}
      <div className="bg-[#121622] border border-[#1E2638] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/60 text-blue-300 font-mono text-xs">
                {benchmarkData.sector} Sector
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {benchmarkData.industry}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-400">
                {benchmarkData.totalSectorCompanies} Companies in Benchmark Cohort
              </span>
            </div>
            <h2 className="text-base font-semibold text-white">
              Peer & Industry Benchmarking Analysis
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {benchmarkData.summary}
            </p>
          </div>

          {/* Automated Peer Discovery Call-to-Action */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2">
            <button
              id="peer-tab-compare-all-btn"
              onClick={handleCompareAll}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
            >
              <Scale className="w-4 h-4" />
              <span>Compare with 4 Peers in Matrix</span>
            </button>
            <p className="text-[11px] text-slate-500 font-mono text-center">
              Pulls {peerSymbols.join(', ')} into Side-by-Side
            </p>
          </div>
        </div>
      </div>

      {/* 2. Discovered Competitor Companies Table */}
      <div className="bg-[#121622] border border-[#1E2638] rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-[#1E2638] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">
                Discovered Competitors ({benchmarkData.peerStocks.length} Selected)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Top industry rivals matched by sector ({benchmarkData.sector}) and market exposure ({benchmarkData.country}).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCompareAll}
              className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
            >
              <span>{allPeersInCompare ? 'Peers active in Compare' : 'Add all to Compare'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E2638] bg-[#0E131E] text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-3">Company / Ticker</th>
                <th className="py-3 px-3">Exchange / Country</th>
                <th className="py-3 px-3 text-right">Price</th>
                <th className="py-3 px-3 text-right">1D Change</th>
                <th className="py-3 px-3 text-right">Market Cap</th>
                <th className="py-3 px-3 text-right">P/E (TTM)</th>
                <th className="py-3 px-3 text-right">ROE (%)</th>
                <th className="py-3 px-3 text-right">Net Margin</th>
                <th className="py-3 px-3 text-right">Debt / Equity</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2234]">
              {/* Reference Stock Row */}
              <tr className="bg-blue-950/20 border-b border-blue-900/40">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-mono font-bold">
                      CURRENT
                    </span>
                    <span className="font-mono font-bold text-white">
                      {currentStock.symbol}
                    </span>
                    <span className="text-slate-300 truncate max-w-[160px]">
                      {currentStock.companyName}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono text-slate-400">
                  {currentStock.exchange} • {currentStock.country}
                </td>
                <td className="py-3 px-3 text-right font-mono font-semibold text-white">
                  {formatCurrency(currentStock?.price, currentStock?.currency, false)}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  <span className={(currentStock?.dayChangePercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {formatPercent(currentStock?.dayChangePercent)}
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-300">
                  {formatCurrency(currentStock?.marketCap, currentStock?.currency)}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-blue-400">
                  {formatRatio(currentStock.peRatio)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-400 font-semibold">
                  {formatPercent(currentStock.returnOnEquity, false)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-300">
                  {formatPercent(currentStock.netMargin, false)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-300">
                  {formatRatio(currentStock.debtToEquity)}
                </td>
                <td className="py-3 px-3 text-center text-slate-500 font-mono text-[11px]">
                  Reference Target
                </td>
              </tr>

              {/* Competitor Peer Rows */}
              {benchmarkData.peerStocks.map((peer) => {
                const isCompared = compareList.includes(peer.symbol);
                return (
                  <tr key={peer.symbol} className="hover:bg-[#161D2C] transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectStock(peer.symbol)}
                          className="font-mono font-bold text-blue-400 hover:underline text-left"
                        >
                          {peer.symbol}
                        </button>
                        <span className="text-slate-300 truncate max-w-[160px]">
                          {peer.companyName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {peer.exchange} • {peer.country}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-white">
                      {formatCurrency(peer?.price, peer?.currency, false)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <span className={(peer?.dayChangePercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {formatPercent(peer?.dayChangePercent)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      {formatCurrency(peer?.marketCap, peer?.currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-200">
                      {formatRatio(peer.peRatio)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-200">
                      {formatPercent(peer.returnOnEquity, false)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      {formatPercent(peer.netMargin, false)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      {formatRatio(peer.debtToEquity)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onToggleCompare(peer.symbol)}
                          title="Toggle Compare"
                          className={`px-2 py-1 rounded text-xs font-mono transition flex items-center gap-1 ${
                            isCompared
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'bg-[#1A2234] text-slate-300 hover:text-white hover:bg-[#222E44]'
                          }`}
                        >
                          <Scale className="w-3 h-3" />
                          <span>{isCompared ? 'Compared' : 'Compare'}</span>
                        </button>
                        <button
                          onClick={() => onSelectStock(peer.symbol)}
                          title="Inspect Stock Details"
                          className="px-2 py-1 rounded bg-[#1A2234] text-slate-300 hover:text-blue-400 hover:bg-[#222E44] text-xs font-mono transition"
                        >
                          Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Detailed Sector Percentile Scorecard & Valuation Gauges */}
      <div className="bg-[#121622] border border-[#1E2638] rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E2638] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">
                Sector Percentile Rankings & Valuation Cones
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluates where {currentStock.companyName} sits compared to {benchmarkData.totalSectorCompanies} sector peers.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-[#151B28] px-2.5 py-1 rounded border border-[#1E2638]">
            Cohort: {benchmarkData.sector}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benchmarkData.percentileRanks.map((rank) => {
            const isPos = rank.badgeType === 'positive';
            const isCaut = rank.badgeType === 'caution';
            return (
              <div
                key={rank.metricKey}
                className="bg-[#0E131E] border border-[#1A2234] rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                      {rank.metricLabel}
                    </span>
                    <h4 className="text-sm font-semibold text-white mt-0.5">
                      {rank.headline}
                    </h4>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isPos
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                        : isCaut
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                        : 'bg-blue-950/60 text-blue-300 border border-blue-800/60'
                    }`}
                  >
                    {rank.isHigherBetter
                      ? `Top ${Math.max(1, 100 - rank.percentile)}%`
                      : `#${rank.rank} of ${rank.totalCompared}`}
                  </span>
                </div>

                {/* Number Comparison */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#141A26] p-2.5 rounded-lg border border-[#1E2638]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">COMPANY VALUE</span>
                    <span className="text-white font-bold text-sm">
                      {rank.stockValue !== null ? rank.stockValue.toFixed(1) : '—'}
                      {rank.metricKey.includes('Margin') || rank.metricKey.includes('Growth') || rank.metricKey.includes('Equity')
                        ? '%'
                        : rank.metricKey.includes('peRatio')
                        ? 'x'
                        : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">SECTOR MEDIAN</span>
                    <span className="text-slate-300 font-bold text-sm">
                      {rank.sectorMedian !== null ? rank.sectorMedian.toFixed(1) : '—'}
                      {rank.metricKey.includes('Margin') || rank.metricKey.includes('Growth') || rank.metricKey.includes('Equity')
                        ? '%'
                        : rank.metricKey.includes('peRatio')
                        ? 'x'
                        : ''}
                    </span>
                  </div>
                </div>

                {/* Percentile visual meter */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-mono">
                    <span className="text-slate-400">Percentile Rank</span>
                    <span className="text-slate-200 font-semibold">{rank.percentile}%</span>
                  </div>
                  <div className="w-full bg-[#1A2234] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isPos
                          ? 'bg-emerald-500'
                          : isCaut
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(4, rank.percentile))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Laggards (0%)</span>
                    <span>Median (50%)</span>
                    <span>Leaders (100%)</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  {rank.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Sector Medians Summary Card */}
      <div className="bg-[#121622] border border-[#1E2638] rounded-xl p-5 shadow-lg">
        <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider mb-3">
          {benchmarkData.sector} Sector Multiples & Benchmark Medians
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="bg-[#151B28] p-3 rounded-lg border border-[#1F293D]">
            <span className="text-slate-500 block text-[10px]">MEDIAN P/E (TTM)</span>
            <span className="text-white font-bold text-sm mt-0.5 block">
              {formatRatio(benchmarkData.sectorMedianMetrics.peRatio)}
            </span>
          </div>
          <div className="bg-[#151B28] p-3 rounded-lg border border-[#1F293D]">
            <span className="text-slate-500 block text-[10px]">MEDIAN ROE</span>
            <span className="text-emerald-400 font-bold text-sm mt-0.5 block">
              {formatPercent(benchmarkData.sectorMedianMetrics.returnOnEquity, false)}
            </span>
          </div>
          <div className="bg-[#151B28] p-3 rounded-lg border border-[#1F293D]">
            <span className="text-slate-500 block text-[10px]">MEDIAN NET MARGIN</span>
            <span className="text-white font-bold text-sm mt-0.5 block">
              {formatPercent(benchmarkData.sectorMedianMetrics.netMargin, false)}
            </span>
          </div>
          <div className="bg-[#151B28] p-3 rounded-lg border border-[#1F293D]">
            <span className="text-slate-500 block text-[10px]">REV GROWTH</span>
            <span className="text-white font-bold text-sm mt-0.5 block">
              {formatPercent(benchmarkData.sectorMedianMetrics.revenueGrowth, false)}
            </span>
          </div>
          <div className="bg-[#151B28] p-3 rounded-lg border border-[#1F293D]">
            <span className="text-slate-500 block text-[10px]">DEBT TO EQUITY</span>
            <span className="text-white font-bold text-sm mt-0.5 block">
              {formatRatio(benchmarkData.sectorMedianMetrics.debtToEquity)}
            </span>
          </div>
          <div className="bg-[#151B28] p-3 rounded-lg border border-[#1F293D]">
            <span className="text-slate-500 block text-[10px]">FCF MARGIN</span>
            <span className="text-white font-bold text-sm mt-0.5 block">
              {formatPercent(benchmarkData.sectorMedianMetrics.fcfMargin, false)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
