import React from 'react';
import { Database, ShieldCheck, Cpu, Globe2, FileText, Clock } from 'lucide-react';

export const FooterDataSources: React.FC = () => {
  return (
    <footer id="equitylens-data-sources-footer" className="mt-16 border-t border-slate-800/80 bg-[#070A10] text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span className="text-sm font-semibold text-slate-200 tracking-tight">EquityLens</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Terminal</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Institutional-grade fundamental equity screener, valuation benchmarking, and AI financial analysis.
            </p>
          </div>

          {/* Data Sources Grid Item 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>Market Quotes & Pricing</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Real-time and 15-minute delayed equity price quotes aggregated through global exchange feeds across NASDAQ, NYSE, NSE India, and BSE India via Yahoo Finance v2 API.
            </p>
          </div>

          {/* Data Sources Grid Item 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Financial Statements</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Audited annual and quarterly balance sheets, income statements, and cash flows sourced directly from SEC EDGAR (Forms 10-K, 10-Q) and Indian regulatory corporate disclosures.
            </p>
          </div>

          {/* Data Sources Grid Item 3 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Intelligence Engine</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Qualitative interpretations, financial ratios explanations, and conversational stock analysis powered by Google Gemini (gemini-3.8-flash) server-side model.
            </p>
          </div>
        </div>

        {/* Regulatory Disclaimer & Timestamp */}
        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Educational and analytical research platform. Content does not constitute registered financial, legal, or investment advice.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Multiples normalized TTM
            </span>
            <span>© {new Date().getFullYear()} EquityLens</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
