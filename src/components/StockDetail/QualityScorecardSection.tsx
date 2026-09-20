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
        return 'bg-[#151922] text-[#6FA58A] border-[#252A33]';
      case 'Healthy':
        return 'bg-[#151922] text-[#7FA6C9] border-[#252A33]';
      case 'Moderate':
        return 'bg-[#151922] text-[#B8A36A] border-[#252A33]';
      case 'Caution':
        return 'bg-[#151922] text-[#B87878] border-[#252A33]';
      default:
        return 'bg-[#151922] text-[#8B919C] border-[#252A33]';
    }
  };

  return (
    <div id="quality-scorecard-section" className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#252A33]">
        <div>
          <h2 className="text-sm font-mono font-semibold text-[#E8E9EB] uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-[#7FA6C9]" />
            <span>Institutional Quality Scorecard</span>
          </h2>
          <p className="text-xs text-[#8B919C] mt-0.5">
            Objective fundamental evaluation across 6 core capital allocation & financial dimensions.
          </p>
        </div>
        <div className="text-xs font-mono text-[#8B919C]">
          Status: <span className="text-[#6FA58A] font-medium">Audited TTM & FY Comps</span>
        </div>
      </div>

      {/* Grid of 6 Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {scorecard.dimensions.map((dim) => {
          return (
            <div
              key={dim.id}
              onClick={() => setSelectedDimension(dim)}
              className="bg-[#11141A] hover:bg-[#151922] border border-[#252A33] hover:border-[#7FA6C9]/40 rounded-xl p-4 transition cursor-pointer flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-medium text-xs text-[#E8E9EB] group-hover:text-white transition">
                    {dim.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusBadge(
                      dim.status
                    )}`}
                  >
                    {dim.status}
                  </span>
                </div>

                <p className="text-[11px] text-[#8B919C] line-clamp-2 mb-3 leading-relaxed">
                  {dim.summary}
                </p>

                {/* Compact Metrics Preview */}
                <div className="space-y-1.5 pt-2 border-t border-[#252A33]/70">
                  {dim.metrics.slice(0, 2).map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <span className="text-[#8B919C] truncate max-w-[130px]">{m.label}</span>
                      <span className="font-mono font-medium text-[#E8E9EB]">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#252A33]/60 flex items-center justify-between text-[10px] text-[#8B919C] font-mono group-hover:text-[#E8E9EB]">
                <span>View dimension audit</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-[#7FA6C9]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Drill-down Modal for Dimension Audit */}
      {selectedDimension && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#11141A] border border-[#252A33] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-[#252A33] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#151922] border border-[#252A33] text-[#7FA6C9]">
                    {stock.symbol}
                  </span>
                  <h3 className="font-semibold text-sm text-[#E8E9EB]">
                    {selectedDimension.name} Audit
                  </h3>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border uppercase ${getStatusBadge(selectedDimension.status)}`}>
                    Overall: {selectedDimension.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDimension(null)}
                className="p-1 rounded-lg hover:bg-[#151922] text-[#8B919C] hover:text-[#E8E9EB] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#8B919C] leading-relaxed">
              {selectedDimension.detailNotes}
            </p>

            {/* Metrics Breakdown Table */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-[#8B919C] uppercase tracking-wider block">
                Evaluated Metrics vs Institutional Thresholds:
              </span>
              <div className="divide-y divide-[#252A33] border border-[#252A33] rounded-xl overflow-hidden bg-[#0B0D10]">
                {selectedDimension.metrics.map((m, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-[#E8E9EB]">{m.label}</div>
                      <div className="text-[10px] text-[#8B919C] font-mono mt-0.5">{m.benchmark}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-sm text-[#E8E9EB]">{m.value}</div>
                      <div className="text-[10px] font-mono capitalize">
                        {m.status === 'good' && <span className="text-[#6FA58A]">Pass</span>}
                        {m.status === 'neutral' && <span className="text-[#8B919C]">In Line</span>}
                        {m.status === 'warning' && <span className="text-[#B8A36A]">Review</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedDimension(null)}
                className="px-4 py-2 rounded-lg bg-[#151922] hover:bg-[#151922]/80 border border-[#252A33] text-xs font-mono font-medium text-[#E8E9EB] transition"
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
