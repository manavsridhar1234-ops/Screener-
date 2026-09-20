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
import { MetricTooltip } from '../Common/MetricTooltip';

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
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-[#151922] border border-[#252A33] text-[#7FA6C9] font-mono text-xs">
                {benchmarkData.sector} Sector
              </span>
              <span className="text-xs text-[#8B919C] font-mono">
                {benchmarkData.industry}
              </span>
              <span className="text-xs text-[#8B919C]">•</span>
              <span className="text-xs font-mono text-[#8B919C]">
                {benchmarkData.totalSectorCompanies} Companies in Benchmark Cohort
              </span>
            </div>
            <h2 className="text-base font-semibold text-[#E8E9EB]">
              Peer & Industry Benchmarking Analysis
            </h2>
            <p className="text-xs text-[#8B919C] leading-relaxed">
              {benchmarkData.summary}
            </p>
          </div>

          {/* Automated Peer Discovery Call-to-Action */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2">
            <button
              id="peer-tab-compare-all-btn"
              onClick={handleCompareAll}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#151922] hover:bg-[#151922]/80 text-[#E8E9EB] border border-[#252A33] text-xs font-medium transition"
            >
              <Scale className="w-4 h-4 text-[#7FA6C9]" />
              <span>Compare with 4 Peers in Matrix</span>
            </button>
            <p className="text-[11px] text-[#8B919C] font-mono text-center">
              Pulls {peerSymbols.join(', ')} into Side-by-Side
            </p>
          </div>
        </div>
      </div>

      {/* 2. Discovered Competitor Companies Table */}
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#252A33] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#7FA6C9]" />
              <h3 className="text-sm font-semibold text-[#E8E9EB]">
                Discovered Competitors ({benchmarkData.peerStocks.length} Selected)
              </h3>
            </div>
            <p className="text-xs text-[#8B919C] mt-0.5">
              Top industry rivals matched by sector ({benchmarkData.sector}) and market exposure ({benchmarkData.country}).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCompareAll}
              className="text-xs font-mono text-[#7FA6C9] hover:underline flex items-center gap-1 transition"
            >
              <span>{allPeersInCompare ? 'Peers active in Compare' : 'Add all to Compare'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#252A33] bg-[#0B0D10] text-[#8B919C] font-mono text-[11px]">
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
            <tbody className="divide-y divide-[#252A33]">
              {/* Reference Stock Row */}
              <tr className="bg-[#151922]/40 border-b border-[#252A33]">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-[#151922] border border-[#252A33] text-[#7FA6C9] text-[10px] font-mono font-medium">
                      CURRENT
                    </span>
                    <span className="font-mono font-medium text-[#E8E9EB]">
                      {currentStock.symbol}
                    </span>
                    <span className="text-[#8B919C] truncate max-w-[160px]">
                      {currentStock.companyName}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono text-[#8B919C]">
                  {currentStock.exchange} • {currentStock.country}
                </td>
                <td className="py-3 px-3 text-right font-mono font-medium text-[#E8E9EB]">
                  <MetricTooltip metricKey="price" value={currentStock?.price} formattedValue={formatCurrency(currentStock?.price, currentStock?.currency, false)} stock={currentStock} className="justify-end w-full">
                    <span>{formatCurrency(currentStock?.price, currentStock?.currency, false)}</span>
                  </MetricTooltip>
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  <MetricTooltip metricKey="dayChangePercent" value={currentStock?.dayChangePercent} formattedValue={formatPercent(currentStock?.dayChangePercent)} stock={currentStock} className="justify-end w-full">
                    <span className={(currentStock?.dayChangePercent ?? 0) >= 0 ? 'text-[#6FA58A]' : 'text-[#B87878]'}>
                      {formatPercent(currentStock?.dayChangePercent)}
                    </span>
                  </MetricTooltip>
                </td>
                <td className="py-3 px-3 text-right font-mono text-[#E8E9EB]">
                  <MetricTooltip metricKey="marketCap" value={currentStock?.marketCap} formattedValue={formatCurrency(currentStock?.marketCap, currentStock?.currency)} stock={currentStock} className="justify-end w-full">
                    <span>{formatCurrency(currentStock?.marketCap, currentStock?.currency)}</span>
                  </MetricTooltip>
                </td>
                <td className="py-3 px-3 text-right font-mono font-medium text-[#7FA6C9]">
                  <MetricTooltip metricKey="peRatio" value={currentStock.peRatio} formattedValue={formatRatio(currentStock.peRatio)} stock={currentStock} className="justify-end w-full">
                    <span>{formatRatio(currentStock.peRatio)}</span>
                  </MetricTooltip>
                </td>
                <td className="py-3 px-3 text-right font-mono text-[#6FA58A] font-medium">
                  <MetricTooltip metricKey="returnOnEquity" value={currentStock.returnOnEquity} formattedValue={formatPercent(currentStock.returnOnEquity, false)} stock={currentStock} className="justify-end w-full">
                    <span>{formatPercent(currentStock.returnOnEquity, false)}</span>
                  </MetricTooltip>
                </td>
                <td className="py-3 px-3 text-right font-mono text-[#E8E9EB]">
                  <MetricTooltip metricKey="netMargin" value={currentStock.netMargin} formattedValue={formatPercent(currentStock.netMargin, false)} stock={currentStock} className="justify-end w-full">
                    <span>{formatPercent(currentStock.netMargin, false)}</span>
                  </MetricTooltip>
                </td>
                <td className="py-3 px-3 text-right font-mono text-[#8B919C]">
                  <MetricTooltip metricKey="debtToEquity" value={currentStock.debtToEquity} formattedValue={formatRatio(currentStock.debtToEquity)} stock={currentStock} className="justify-end w-full">
                    <span>{formatRatio(currentStock.debtToEquity)}</span>
                  </MetricTooltip>
                </td>
                <td className="py-3 px-3 text-center text-[#8B919C] font-mono text-[11px]">
                  Reference Target
                </td>
              </tr>

              {/* Competitor Peer Rows */}
              {benchmarkData.peerStocks.map((peer) => {
                const isCompared = compareList.includes(peer.symbol);
                return (
                  <tr key={peer.symbol} className="hover:bg-[#151922]/50 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectStock(peer.symbol)}
                          className="font-mono font-semibold text-[#7FA6C9] hover:underline text-left"
                        >
                          {peer.symbol}
                        </button>
                        <span className="text-[#8B919C] truncate max-w-[160px]">
                          {peer.companyName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#8B919C]">
                      {peer.exchange} • {peer.country}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-[#E8E9EB]">
                      <MetricTooltip metricKey="price" value={peer?.price} formattedValue={formatCurrency(peer?.price, peer?.currency, false)} stock={peer} className="justify-end w-full">
                        <span>{formatCurrency(peer?.price, peer?.currency, false)}</span>
                      </MetricTooltip>
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <MetricTooltip metricKey="dayChangePercent" value={peer?.dayChangePercent} formattedValue={formatPercent(peer?.dayChangePercent)} stock={peer} className="justify-end w-full">
                        <span className={(peer?.dayChangePercent ?? 0) >= 0 ? 'text-[#6FA58A]' : 'text-[#B87878]'}>
                          {formatPercent(peer?.dayChangePercent)}
                        </span>
                      </MetricTooltip>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#8B919C]">
                      <MetricTooltip metricKey="marketCap" value={peer?.marketCap} formattedValue={formatCurrency(peer?.marketCap, peer?.currency)} stock={peer} className="justify-end w-full">
                        <span>{formatCurrency(peer?.marketCap, peer?.currency)}</span>
                      </MetricTooltip>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#E8E9EB]">
                      <MetricTooltip metricKey="peRatio" value={peer.peRatio} formattedValue={formatRatio(peer.peRatio)} stock={peer} className="justify-end w-full">
                        <span>{formatRatio(peer.peRatio)}</span>
                      </MetricTooltip>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#E8E9EB]">
                      <MetricTooltip metricKey="returnOnEquity" value={peer.returnOnEquity} formattedValue={formatPercent(peer.returnOnEquity, false)} stock={peer} className="justify-end w-full">
                        <span>{formatPercent(peer.returnOnEquity, false)}</span>
                      </MetricTooltip>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#8B919C]">
                      <MetricTooltip metricKey="netMargin" value={peer.netMargin} formattedValue={formatPercent(peer.netMargin, false)} stock={peer} className="justify-end w-full">
                        <span>{formatPercent(peer.netMargin, false)}</span>
                      </MetricTooltip>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#8B919C]">
                      <MetricTooltip metricKey="debtToEquity" value={peer.debtToEquity} formattedValue={formatRatio(peer.debtToEquity)} stock={peer} className="justify-end w-full">
                        <span>{formatRatio(peer.debtToEquity)}</span>
                      </MetricTooltip>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onToggleCompare(peer.symbol)}
                          title="Toggle Compare"
                          className={`px-2 py-1 rounded text-xs font-mono transition flex items-center gap-1 border border-[#252A33] ${
                            isCompared
                              ? 'bg-[#151922] text-[#7FA6C9] font-medium'
                              : 'bg-[#0B0D10] text-[#8B919C] hover:text-[#E8E9EB] hover:bg-[#151922]'
                          }`}
                        >
                          <Scale className="w-3 h-3" />
                          <span>{isCompared ? 'Compared' : 'Compare'}</span>
                        </button>
                        <button
                          onClick={() => onSelectStock(peer.symbol)}
                          title="Inspect Stock Details"
                          className="px-2 py-1 rounded bg-[#0B0D10] border border-[#252A33] text-[#8B919C] hover:text-[#7FA6C9] hover:bg-[#151922] text-xs font-mono transition"
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
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#252A33] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#7FA6C9]" />
              <h3 className="text-sm font-semibold text-[#E8E9EB]">
                Sector Percentile Rankings & Valuation Cones
              </h3>
            </div>
            <p className="text-xs text-[#8B919C] mt-0.5">
              Evaluates where {currentStock.companyName} sits compared to {benchmarkData.totalSectorCompanies} sector peers.
            </p>
          </div>
          <span className="text-xs font-mono text-[#8B919C] bg-[#151922] px-2.5 py-1 rounded border border-[#252A33]">
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
                className="bg-[#0B0D10] border border-[#252A33] rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono text-[#8B919C] uppercase tracking-wider block">
                      {rank.metricLabel}
                    </span>
                    <h4 className="text-sm font-medium text-[#E8E9EB] mt-0.5">
                      {rank.headline}
                    </h4>
                  </div>
                  <span
                    className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full shrink-0 border border-[#252A33] ${
                      isPos
                        ? 'bg-[#151922] text-[#6FA58A]'
                        : isCaut
                        ? 'bg-[#151922] text-[#B8A36A]'
                        : 'bg-[#151922] text-[#7FA6C9]'
                    }`}
                  >
                    {rank.isHigherBetter
                      ? `Top ${Math.max(1, 100 - rank.percentile)}%`
                      : `#${rank.rank} of ${rank.totalCompared}`}
                  </span>
                </div>

                {/* Number Comparison */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#151922] p-2.5 rounded-lg border border-[#252A33]">
                  <div>
                    <span className="text-[#8B919C] block text-[10px]">COMPANY VALUE</span>
                    <span className="text-[#E8E9EB] font-semibold text-sm">
                      {rank.stockValue !== null ? rank.stockValue.toFixed(1) : '—'}
                      {rank.metricKey.includes('Margin') || rank.metricKey.includes('Growth') || rank.metricKey.includes('Equity')
                        ? '%'
                        : rank.metricKey.includes('peRatio')
                        ? 'x'
                        : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8B919C] block text-[10px]">SECTOR MEDIAN</span>
                    <span className="text-[#8B919C] font-semibold text-sm">
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
                    <span className="text-[#8B919C]">Percentile Rank</span>
                    <span className="text-[#E8E9EB] font-medium">{rank.percentile}%</span>
                  </div>
                  <div className="w-full bg-[#151922] h-2 rounded-full overflow-hidden border border-[#252A33]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isPos
                          ? 'bg-[#6FA58A]'
                          : isCaut
                          ? 'bg-[#B8A36A]'
                          : 'bg-[#7FA6C9]'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(4, rank.percentile))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#8B919C] font-mono">
                    <span>Laggards (0%)</span>
                    <span>Median (50%)</span>
                    <span>Leaders (100%)</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#8B919C] leading-relaxed font-sans">
                  {rank.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Institutional Sector Distribution Matrix Table */}
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#252A33]">
          <div>
            <h3 className="text-xs font-mono font-semibold text-[#E8E9EB] uppercase tracking-wider">
              Sector Relative Distribution & Percentile Matrix
            </h3>
            <p className="text-xs text-[#8B919C] mt-0.5">
              Horizontal dispersion mapping comparing {currentStock.symbol} directly against {benchmarkData.sector} peers.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#8B919C]">
            {benchmarkData.totalSectorCompanies} Peers Analyzed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-[#8B919C] border-b border-[#252A33] text-[11px]">
                <th className="py-2.5 px-3 font-semibold">Fundamental Metric</th>
                <th className="py-2.5 px-3 text-right font-semibold">{currentStock.symbol} Value</th>
                <th className="py-2.5 px-3 text-right font-semibold">Sector Median</th>
                <th className="py-2.5 px-4 font-semibold text-center w-48">Percentile Distribution (0% to 100%)</th>
                <th className="py-2.5 px-3 text-right font-semibold">Sector Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252A33]">
              {benchmarkData.percentileRanks.map((rank) => {
                const pct = Math.min(100, Math.max(0, rank.percentile));
                return (
                  <tr key={rank.metricKey} className="hover:bg-[#151922]/50 transition">
                    <td className="py-3 px-3 font-medium text-[#E8E9EB]">
                      {rank.metricLabel}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-[#E8E9EB]">
                      {rank.stockValue !== null ? rank.stockValue.toFixed(1) : '—'}
                      {rank.metricKey.includes('Margin') || rank.metricKey.includes('Growth') || rank.metricKey.includes('Equity')
                        ? '%'
                        : rank.metricKey.includes('peRatio')
                        ? 'x'
                        : ''}
                    </td>
                    <td className="py-3 px-3 text-right text-[#8B919C]">
                      {rank.sectorMedian !== null ? rank.sectorMedian.toFixed(1) : '—'}
                      {rank.metricKey.includes('Margin') || rank.metricKey.includes('Growth') || rank.metricKey.includes('Equity')
                        ? '%'
                        : rank.metricKey.includes('peRatio')
                        ? 'x'
                        : ''}
                    </td>
                    <td className="py-3 px-4">
                      {/* Visual Dispersion Slider with Sector Median marker (50%) and Stock Dot */}
                      <div className="relative w-full h-4 flex items-center">
                        {/* Track */}
                        <div className="w-full h-1.5 bg-[#151922] rounded-full relative overflow-visible border border-[#252A33]">
                          {/* 50% Median Line */}
                          <div className="absolute top-[-3px] bottom-[-3px] left-1/2 w-0.5 bg-[#8B919C] z-0" title="Sector Median (50%)" />
                          {/* Stock Percentile Marker Dot */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#E8E9EB] border border-[#7FA6C9] z-10 shadow-sm"
                            style={{ left: `${pct}%` }}
                            title={`${rank.percentile}th Percentile`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="font-medium text-[#E8E9EB]">
                        #{rank.rank}
                      </span>
                      <span className="text-[#8B919C] text-[10px]">
                        {' '}/ {rank.totalCompared}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Sector Medians Summary Card */}
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-mono font-semibold text-[#E8E9EB] uppercase tracking-wider mb-3">
          {benchmarkData.sector} Sector Multiples & Benchmark Medians
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="bg-[#151922] p-3 rounded-lg border border-[#252A33]">
            <span className="text-[#8B919C] block text-[10px]">MEDIAN P/E (TTM)</span>
            <span className="text-[#E8E9EB] font-medium text-sm mt-0.5 block">
              {formatRatio(benchmarkData.sectorMedianMetrics.peRatio)}
            </span>
          </div>
          <div className="bg-[#151922] p-3 rounded-lg border border-[#252A33]">
            <span className="text-[#8B919C] block text-[10px]">MEDIAN ROE</span>
            <span className="text-[#6FA58A] font-medium text-sm mt-0.5 block">
              {formatPercent(benchmarkData.sectorMedianMetrics.returnOnEquity, false)}
            </span>
          </div>
          <div className="bg-[#151922] p-3 rounded-lg border border-[#252A33]">
            <span className="text-[#8B919C] block text-[10px]">MEDIAN NET MARGIN</span>
            <span className="text-[#E8E9EB] font-medium text-sm mt-0.5 block">
              {formatPercent(benchmarkData.sectorMedianMetrics.netMargin, false)}
            </span>
          </div>
          <div className="bg-[#151922] p-3 rounded-lg border border-[#252A33]">
            <span className="text-[#8B919C] block text-[10px]">REV GROWTH</span>
            <span className="text-[#E8E9EB] font-medium text-sm mt-0.5 block">
              {formatPercent(benchmarkData.sectorMedianMetrics.revenueGrowth, false)}
            </span>
          </div>
          <div className="bg-[#151922] p-3 rounded-lg border border-[#252A33]">
            <span className="text-[#8B919C] block text-[10px]">DEBT TO EQUITY</span>
            <span className="text-[#8B919C] font-medium text-sm mt-0.5 block">
              {formatRatio(benchmarkData.sectorMedianMetrics.debtToEquity)}
            </span>
          </div>
          <div className="bg-[#151922] p-3 rounded-lg border border-[#252A33]">
            <span className="text-[#8B919C] block text-[10px]">FCF MARGIN</span>
            <span className="text-[#E8E9EB] font-medium text-sm mt-0.5 block">
              {formatPercent(benchmarkData.sectorMedianMetrics.fcfMargin, false)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
