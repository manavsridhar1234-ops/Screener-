import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Database,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { NormalizedStock, FinancialGrowthPoint } from '../../types';
import { detectFinancialAnomaliesAndIntegrity } from '../../utils/institutionalAnalysis';

interface FinancialAnomaliesSectionProps {
  stock: NormalizedStock;
  growthSeries: FinancialGrowthPoint[];
}

export const FinancialAnomaliesSection: React.FC<FinancialAnomaliesSectionProps> = ({
  stock,
  growthSeries,
}) => {
  const audit = React.useMemo(
    () => detectFinancialAnomaliesAndIntegrity(stock, growthSeries),
    [stock, growthSeries]
  );

  const [filterSeverity, setFilterSeverity] = useState<'all' | 'warning' | 'verified'>('all');

  const filteredAnomalies = audit.anomalies.filter((a) => {
    if (filterSeverity === 'warning') return a.type === 'warning' || a.type === 'caution';
    if (filterSeverity === 'verified') return a.type === 'verified';
    return true;
  });

  return (
    <div id="financial-anomalies-section" className="space-y-4">
      {/* Top Banner: Data Integrity Status */}
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#151922] border border-[#252A33] text-[#7FA6C9]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-mono font-semibold text-[#E8E9EB] uppercase tracking-wider">
                Financial Data Integrity & Anomaly Surveillance
              </h2>
              {audit.requiresReviewCount > 0 ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#151922] text-[#B8A36A] border border-[#252A33]">
                  {audit.requiresReviewCount} Review Alert{audit.requiresReviewCount > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#151922] text-[#6FA58A] border border-[#252A33]">
                  All Reconciled
                </span>
              )}
            </div>
            <p className="text-xs text-[#8B919C] mt-1 max-w-2xl leading-relaxed">
              Automated cross-statement verification engine scans GAAP SEC 10-K/10-Q filings for margin discrepancies, valuation period mismatches, and cash conversion divergences.
            </p>
          </div>
        </div>

        {/* Coverage Score */}
        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-[#252A33] pt-3 md:pt-0 md:pl-5 shrink-0">
          <div className="text-left md:text-right">
            <div className="text-2xl font-mono font-semibold text-[#E8E9EB]">
              {audit.overallCoverageScore}%
            </div>
            <div className="text-[11px] text-[#8B919C] font-mono">
              Audit Integrity Index
            </div>
          </div>
        </div>
      </div>

      {/* Anomalies & Reconciliations List */}
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#252A33]">
          <div className="text-xs font-mono font-semibold text-[#E8E9EB] uppercase tracking-wider">
            Detected Cross-Field Inconsistencies & Verifications
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-2.5 py-1 rounded transition border ${
                filterSeverity === 'all'
                  ? 'bg-[#151922] text-[#E8E9EB] border-[#252A33] font-medium'
                  : 'border-transparent text-[#8B919C] hover:text-[#E8E9EB]'
              }`}
            >
              All ({audit.anomalies.length})
            </button>
            <button
              onClick={() => setFilterSeverity('warning')}
              className={`px-2.5 py-1 rounded transition border ${
                filterSeverity === 'warning'
                  ? 'bg-[#151922] text-[#B8A36A] border-[#252A33] font-medium'
                  : 'border-transparent text-[#8B919C] hover:text-[#E8E9EB]'
              }`}
            >
              Flags ({audit.requiresReviewCount})
            </button>
            <button
              onClick={() => setFilterSeverity('verified')}
              className={`px-2.5 py-1 rounded transition border ${
                filterSeverity === 'verified'
                  ? 'bg-[#151922] text-[#6FA58A] border-[#252A33] font-medium'
                  : 'border-transparent text-[#8B919C] hover:text-[#E8E9EB]'
              }`}
            >
              Verified ({audit.anomalies.filter((a) => a.type === 'verified').length})
            </button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2.5">
          {filteredAnomalies.map((item) => {
            const isWarning = item.type === 'warning';
            const isCaution = item.type === 'caution';
            const isVerified = item.type === 'verified';

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-lg border border-[#252A33] bg-[#151922]/40 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {isWarning && (
                      <AlertTriangle className="w-4 h-4 text-[#B87878] shrink-0 mt-0.5" />
                    )}
                    {isCaution && (
                      <Info className="w-4 h-4 text-[#B8A36A] shrink-0 mt-0.5" />
                    )}
                    {isVerified && (
                      <CheckCircle2 className="w-4 h-4 text-[#6FA58A] shrink-0 mt-0.5" />
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-xs text-[#E8E9EB]">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0B0D10] border border-[#252A33] text-[#8B919C] uppercase">
                          {item.category}
                        </span>
                        {item.metricReference && (
                          <span className="text-[10px] font-mono text-[#8B919C]">
                            ref: {item.metricReference}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8B919C] leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-[#252A33] uppercase shrink-0 bg-[#0B0D10] ${
                      isWarning
                        ? 'text-[#B87878]'
                        : isCaution
                        ? 'text-[#B8A36A]'
                        : 'text-[#6FA58A]'
                    }`}
                  >
                    {isWarning ? 'Attention' : isCaution ? 'Notice' : 'Reconciled'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dataset Freshness & Lineage Table */}
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl p-4 sm:p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-[#252A33]">
          <span className="text-xs font-mono font-semibold text-[#E8E9EB] uppercase tracking-wider flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-[#7FA6C9]" />
            <span>Underlying Data Lineage & Freshness SLA</span>
          </span>
          <span className="text-[11px] font-mono text-[#8B919C]">
            Source: SEC Edgar Filings & Standard Reporting
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-[#8B919C] border-b border-[#252A33] text-[11px]">
                <th className="py-2 px-3 font-medium">Dataset Category</th>
                <th className="py-2 px-3 font-medium">Field Completeness</th>
                <th className="py-2 px-3 font-medium">Update Freshness</th>
                <th className="py-2 px-3 text-right font-medium">Audit Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252A33]">
              {audit.freshness.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#151922]/50 transition">
                  <td className="py-2.5 px-3 font-medium text-[#E8E9EB]">
                    {row.dataset}
                  </td>
                  <td className="py-2.5 px-3 text-[#E8E9EB]">
                    {row.coverage}
                  </td>
                  <td className="py-2.5 px-3 text-[#8B919C]">
                    {row.freshness}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#6FA58A]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Certified</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
