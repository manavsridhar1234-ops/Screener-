import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Award,
  CircleDollarSign,
  Activity,
  Layers,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import type { NormalizedStock, FinancialGrowthPoint, ScorecardDimension } from '../../types';
import { computeQualityScorecard } from '../../utils/institutionalAnalysis';

interface QualityScorecardSectionProps {
  stock: NormalizedStock;
  growthSeries?: FinancialGrowthPoint[];
  onMetricClick?: (metric: any) => void;
}

export const QualityScorecardSection: React.FC<QualityScorecardSectionProps> = ({
  stock,
  growthSeries = [],
  onMetricClick,
}) => {
  const scorecard = React.useMemo(
    () => computeQualityScorecard(stock, growthSeries || []),
    [stock, growthSeries]
  );

  const [selectedDimension, setSelectedDimension] = useState<ScorecardDimension | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Strong':
        return 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30';
      case 'Healthy':
        return 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30';
      case 'Moderate':
        return 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30';
      case 'Caution':
        return 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30';
      default:
        return 'bg-[#141820] text-[#8E98A8] border-[#1F2633]';
    }
  };

  return (
    <div id="quality-scorecard-section" className="space-y-4 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1F2633]">
        <div>
          <h2 className="text-sm font-mono font-bold text-[#F0F2F5] uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-[#38BDF8]" />
            <span>Institutional Quality Scorecard</span>
          </h2>
          <p className="text-xs text-[#8E98A8] mt-0.5">
            Objective fundamental evaluation across 6 core capital allocation & financial dimensions.
          </p>
        </div>
        <div className="text-xs font-mono text-[#8E98A8]">
          Status: <span className="text-[#10B981] font-semibold">Audited TTM & FY Comps</span>
        </div>
      </div>

      {/* Grid of 6 Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {scorecard.dimensions.map((dim) => {
          return (
            <div
              key={dim.id}
              onClick={() => setSelectedDimension(dim)}
              className="bg-[#0E1217] hover:bg-[#141820] border border-[#1F2633] hover:border-[#38BDF8]/50 rounded-xl p-4 sm:p-5 transition cursor-pointer flex flex-col justify-between group shadow-lg shadow-black/20"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-semibold text-xs text-[#F0F2F5] group-hover:text-[#38BDF8] transition">
                    {dim.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(
                      dim.status
                    )}`}
                  >
                    {dim.status}
                  </span>
                </div>

                <p className="text-[11px] text-[#8E98A8] line-clamp-2 mb-3 leading-relaxed">
                  {dim.summary}
                </p>

                {/* Compact Metrics Preview */}
                <div className="space-y-1.5 pt-2 border-t border-[#1F2633]/80">
                  {dim.metrics.slice(0, 2).map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <span className="text-[#8E98A8] truncate max-w-[130px]">{m.label}</span>
                      <span className="font-mono font-semibold text-[#F0F2F5]">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#1F2633] flex items-center justify-between text-[10px] text-[#8E98A8] font-mono group-hover:text-[#F0F2F5]">
                <span>View dimension audit</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-[#38BDF8]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Drill-down Modal for Dimension Audit */}
      {selectedDimension && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#0E1217] border border-[#1F2633] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-[#1F2633] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#161B26] border border-[#38BDF8]/40 text-[#38BDF8]">
                    {stock.symbol}
                  </span>
                  <h3 className="font-semibold text-sm text-[#F0F2F5]">
                    {selectedDimension.name} Audit
                  </h3>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border uppercase ${getStatusBadge(selectedDimension.status)}`}>
                    Overall: {selectedDimension.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDimension(null)}
                className="p-1 rounded-lg hover:bg-[#141820] text-[#8E98A8] hover:text-[#F0F2F5] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#8E98A8] leading-relaxed">
              {selectedDimension.detailNotes}
            </p>

            {/* Metrics Breakdown Table */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-[#8E98A8] uppercase tracking-wider block">
                Evaluated Metrics vs Institutional Thresholds:
              </span>
              <div className="divide-y divide-[#1F2633] border border-[#1F2633] rounded-xl overflow-hidden bg-[#090B0E]">
                {selectedDimension.metrics.map((m, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-[#F0F2F5]">{m.label}</div>
                      <div className="text-[10px] text-[#8E98A8] font-mono mt-0.5">{m.benchmark}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-[#F0F2F5]">{m.value}</div>
                      <div className="text-[10px] font-mono capitalize">
                        {m.status === 'good' && <span className="text-[#10B981] font-semibold">Pass</span>}
                        {m.status === 'neutral' && <span className="text-[#8E98A8]">In Line</span>}
                        {m.status === 'warning' && <span className="text-[#F59E0B] font-semibold">Review</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedDimension(null)}
                className="px-4 py-2 rounded-lg bg-[#141820] hover:bg-[#1A202C] border border-[#1F2633] text-xs font-mono font-semibold text-[#F0F2F5] transition"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
