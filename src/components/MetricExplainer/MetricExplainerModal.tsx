import React from 'react';
import { X, Sparkles, BookOpen, Calculator, HelpCircle, ArrowUpRight, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import type { MetricDefinition, NormalizedStock, ExperienceLevel } from '../../types';
import { useExperience } from '../../context/ExperienceContext';

interface MetricExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  metric: MetricDefinition | null;
  stock?: NormalizedStock | null;
  rawValue?: number | string | null;
  formattedValue?: string;
  onAskAi?: (question: string) => void;
}

export const MetricExplainerModal: React.FC<MetricExplainerModalProps> = ({
  isOpen,
  onClose,
  metric,
  stock,
  rawValue,
  formattedValue,
  onAskAi,
}) => {
  const { experienceLevel, setExperienceLevel } = useExperience();

  if (!isOpen || !metric) return null;

  const displayVal = formattedValue || (rawValue !== null && rawValue !== undefined ? String(rawValue) : 'N/A');

  const handleAskAiAboutMetric = () => {
    if (onAskAi && stock) {
      const q = `Explain ${stock.companyName} (${stock.symbol})'s ${metric.name} of ${displayVal}. Is this strong or concerning compared to industry standards, and what does it mean for long-term investors?`;
      onAskAi(q);
      onClose();
    }
  };

  return (
    <div
      id="metric-explainer-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="metric-explainer-dialog"
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-[#0F1420] border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800/80 bg-slate-900/40">
          <div className="pr-6">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-md">
                {metric.category}
              </span>
              {stock && (
                <span className="text-xs font-mono text-slate-400">
                  {stock.symbol}
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-slate-100">
              {metric.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Stock Metric Value Callout */}
        <div className="px-5 py-3.5 bg-slate-950/60 border-b border-slate-800/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">
              Current Value for {stock?.symbol || 'Asset'}
            </span>
            <span className="text-2xl font-bold text-emerald-400 font-mono tracking-tight">
              {displayVal}
            </span>
          </div>

          {/* In-Modal Level Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setExperienceLevel('beginner')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                experienceLevel === 'beginner'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Beginner
            </button>
            <button
              type="button"
              onClick={() => setExperienceLevel('pro')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                experienceLevel === 'pro'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pro / Analyst
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-sm text-slate-300">
          {/* Beginner Content */}
          {experienceLevel === 'beginner' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/15">
                <div className="flex items-center gap-2 text-sky-400 font-medium text-xs mb-1.5">
                  <HelpCircle className="w-4 h-4" />
                  What this means in plain English:
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {metric.beginnerSummary}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                <div className="flex items-center gap-2 text-amber-400 font-medium text-xs mb-1.5">
                  <BookOpen className="w-4 h-4" />
                  Everyday Analogy:
                </div>
                <p className="text-slate-300 text-xs leading-relaxed italic">
                  "{metric.beginnerAnalogy}"
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-300 font-medium text-xs mb-1">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Is higher or lower better?
                </div>
                <p className="text-xs text-slate-400">
                  {metric.higherIsBetter === true
                    ? 'Higher is generally better: Reflects greater profitability, cash flow, or operational health.'
                    : metric.higherIsBetter === false
                    ? 'Lower is generally better: Means the stock is priced cheaper relative to its underlying performance.'
                    : 'Contextual: Depends on sector, debt structure, and company growth stage.'}
                </p>
              </div>
            </div>
          ) : (
            /* Pro Content */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 font-medium text-xs mb-1.5">
                  <Calculator className="w-4 h-4" />
                  Mathematical Formula & Derivation:
                </div>
                <code className="text-xs font-mono text-emerald-400 block bg-black/40 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                  {metric.formula}
                </code>
              </div>

              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                <div className="flex items-center gap-2 text-indigo-300 font-medium text-xs mb-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  Institutional Analysis & Mechanics:
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {metric.proExplanation}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-300 font-medium text-xs mb-1">
                  <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  Benchmark & Rules of Thumb:
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {metric.benchmarkGuide}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Click anywhere outside or press Esc to close
          </div>

          {onAskAi && stock && (
            <button
              type="button"
              onClick={handleAskAiAboutMetric}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-md hover:shadow-sky-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ask AI about this metric
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
