import React, { useRef } from 'react';
import type { NormalizedStock, PeerBenchmarkData, FinancialGrowthPoint } from '../../types';
import {
  formatCurrency,
  formatPercent,
  formatRatio,
  formatNumber,
} from '../../utils/formatters';
import {
  X,
  Printer,
  FileDown,
  Copy,
  Check,
  Building2,
  TrendingUp,
  ShieldCheck,
  Award,
  AlertTriangle,
} from 'lucide-react';

interface InvestmentMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: NormalizedStock;
  benchmarkData: PeerBenchmarkData | null;
  growthSeries: FinancialGrowthPoint[];
}

export const InvestmentMemoModal: React.FC<InvestmentMemoModalProps> = ({
  isOpen,
  onClose,
  stock,
  benchmarkData,
  growthSeries,
}) => {
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const memoText = `
# EQUITYLENS 1-PAGE INVESTMENT MEMO
**Company:** ${stock.companyName} (${stock.symbol})
**Exchange:** ${stock.exchange} | **Sector:** ${stock.sector || 'N/A'} | **Industry:** ${stock.industry || 'N/A'}
**Price:** ${formatCurrency(stock.price, stock.currency, false)} | **Market Cap:** ${formatCurrency(stock.marketCap, stock.currency)}
**Date:** ${new Date().toLocaleDateString()}

---

## 1. Valuation & Financial Quality
- Trailing P/E: ${formatRatio(stock.peRatio)}
- Forward P/E: ${formatRatio(stock.forwardPe)}
- EV/EBITDA: ${formatRatio(stock.evToEbitda)}
- Dividend Yield: ${formatPercent(stock.dividendYield, false)}
- Return on Equity (ROE): ${formatPercent(stock.returnOnEquity, false)}
- Operating Margin: ${formatPercent(stock.operatingMargin, false)}
- Net Profit Margin: ${formatPercent(stock.netMargin, false)}
- Total Debt: ${formatCurrency(stock.totalDebt, stock.currency)}
- Total Cash: ${formatCurrency(stock.totalCash, stock.currency)}
- Free Cash Flow: ${formatCurrency(stock.freeCashFlow, stock.currency)}

---

## 2. 5-Year Historical Performance
${growthSeries
  .map(
    (g) =>
      `- ${g.year}: Revenue: ${formatCurrency(g.revenue, stock.currency)} | Net Income: ${formatCurrency(g.netIncome, stock.currency)} | FCF: ${formatCurrency(g.freeCashFlow, stock.currency)}`
  )
  .join('\n')}

---

## 3. Executive Business Overview
${stock.description || 'Global corporate equity overview.'}

*Disclaimer: Generated via EquityLens Research Terminal. Educational and informational purposes only.*
`.trim();

    navigator.clipboard.writeText(memoText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="investment-memo-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible"
    >
      <div
        ref={printRef}
        id="investment-memo-content"
        className="w-full max-w-4xl bg-[#0D111A] border border-[#20293A] rounded-2xl shadow-2xl overflow-hidden my-auto print:bg-white print:text-black print:border-none print:shadow-none print:rounded-none print:max-w-none print:w-full"
      >
        {/* Modal Top Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#1E2638] bg-[#0A0E17] print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span className="text-xs font-mono font-semibold text-slate-200">
              1-Page Investment Tearsheet Memo
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              PDF / Print Ready
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copy-memo-markdown-btn"
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-[#161D2B] hover:bg-[#1E273A] border border-[#232D42] transition"
              title="Copy memo as Markdown"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              id="print-memo-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-900 bg-white hover:bg-slate-200 transition shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              id="close-memo-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#161D2B] transition ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Memo Body */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-200 print:text-black print:p-8 print:space-y-4 font-sans text-xs">
          {/* Header Block */}
          <div className="border-b border-[#1E2638] pb-5 print:border-slate-300">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white print:text-black">
                    {stock.companyName}
                  </h1>
                  <span className="font-mono text-sm px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 print:bg-slate-100 print:text-slate-800 print:border-slate-300">
                    {stock.symbol}
                  </span>
                </div>
                <p className="text-xs text-slate-400 print:text-slate-600 mt-1 font-mono">
                  {stock.exchange} • {stock.country} • Sector: {stock.sector || 'General Equities'} • Industry: {stock.industry || 'Diversified'}
                </p>
              </div>

              {/* Price & Valuation Callout */}
              <div className="sm:text-right">
                <div className="text-2xl font-mono font-bold text-white print:text-black">
                  {formatCurrency(stock.price, stock.currency, false)}
                </div>
                <div className="text-xs font-mono text-slate-400 print:text-slate-600 mt-0.5">
                  Market Cap: {formatCurrency(stock.marketCap, stock.currency)}
                </div>
                <div className="text-[11px] font-mono text-slate-500 print:text-slate-500 mt-0.5">
                  Memo Date: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Summary & Moat Overview */}
          <div className="space-y-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 print:text-slate-800">
              1. Executive Business Overview & Competitive Moat
            </h2>
            <div className="bg-[#121622] p-4 rounded-xl border border-[#1E2638] text-slate-300 leading-relaxed print:bg-slate-50 print:border-slate-300 print:text-slate-800">
              <p className="line-clamp-4 print:line-clamp-none">
                {stock.description ||
                  `${stock.companyName} is an operating enterprise listed on ${stock.exchange}. The company operates in the ${stock.sector} sector with established capital footprint and core business market share.`}
              </p>
            </div>
          </div>

          {/* Section 2: Valuation Multiples & Capital Quality Matrix */}
          <div className="space-y-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 print:text-slate-800">
              2. Fundamental Multiples & Balance Sheet Solvency
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg bg-[#121622] border border-[#1E2638] print:bg-slate-50 print:border-slate-300">
                <span className="text-[10px] font-mono text-slate-400 print:text-slate-600 block">P/E RATIO (TTM)</span>
                <span className="text-sm font-mono font-bold text-white print:text-black mt-0.5 block">
                  {formatRatio(stock.peRatio)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#121622] border border-[#1E2638] print:bg-slate-50 print:border-slate-300">
                <span className="text-[10px] font-mono text-slate-400 print:text-slate-600 block">FORWARD P/E</span>
                <span className="text-sm font-mono font-bold text-white print:text-black mt-0.5 block">
                  {formatRatio(stock.forwardPe)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#121622] border border-[#1E2638] print:bg-slate-50 print:border-slate-300">
                <span className="text-[10px] font-mono text-slate-400 print:text-slate-600 block">EV / EBITDA</span>
                <span className="text-sm font-mono font-bold text-white print:text-black mt-0.5 block">
                  {formatRatio(stock.evToEbitda)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#121622] border border-[#1E2638] print:bg-slate-50 print:border-slate-300">
                <span className="text-[10px] font-mono text-slate-400 print:text-slate-600 block">DIVIDEND YIELD</span>
                <span className="text-sm font-mono font-bold text-white print:text-black mt-0.5 block">
                  {formatPercent(stock.dividendYield, false)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#121622] border border-[#1E2638] print:bg-slate-50 print:border-slate-300">
                <span className="text-[10px] font-mono text-slate-400 print:text-slate-600 block">RETURN ON EQUITY</span>
                <span className="text-sm font-mono font-bold text-white print:text-black mt-0.5 block">
                  {formatPercent(stock.returnOnEquity, false)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#121622] border border-[#1E2638] print:bg-slate-50 print:border-slate-300">
                <span className="text-[10px] font-mono text-slate-400 print:text-slate-600 block">OPERATING MARGIN</span>
                <span className="text-sm font-mono font-bold text-white print:text-black mt-0.5 block">
                  {formatPercent(stock.operatingMargin, false)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#121622] border border-[#1E2638] print:bg-slate-50 print:border-slate-300">
                <span className="text-[10px] font-mono text-slate-400 print:text-slate-600 block">TOTAL DEBT</span>
                <span className="text-sm font-mono font-bold text-white print:text-black mt-0.5 block">
                  {formatCurrency(stock.totalDebt, stock.currency)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#121622] border border-[#1E2638] print:bg-slate-50 print:border-slate-300">
                <span className="text-[10px] font-mono text-slate-400 print:text-slate-600 block">FREE CASH FLOW</span>
                <span className="text-sm font-mono font-bold text-white print:text-black mt-0.5 block">
                  {formatCurrency(stock.freeCashFlow, stock.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: 5-Year Historical Growth Trajectory */}
          {growthSeries && growthSeries.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 print:text-slate-800">
                3. 5-Year Financial Trajectory (Income & Cash Flow)
              </h2>
              <div className="overflow-x-auto rounded-xl border border-[#1E2638] print:border-slate-300">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-[#121622] border-b border-[#1E2638] text-slate-400 print:bg-slate-100 print:border-slate-300 print:text-slate-700">
                      <th className="py-2 px-3 font-medium">Fiscal Period</th>
                      <th className="py-2 px-3 text-right font-medium">Revenue</th>
                      <th className="py-2 px-3 text-right font-medium">YoY Growth</th>
                      <th className="py-2 px-3 text-right font-medium">Net Income</th>
                      <th className="py-2 px-3 text-right font-medium">Free Cash Flow</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#182030] print:divide-slate-200">
                    {growthSeries.map((g, idx) => (
                      <tr key={idx} className="hover:bg-[#161D2B] print:hover:bg-transparent">
                        <td className="py-2 px-3 text-slate-300 print:text-black font-semibold">
                          {g.year}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-200 print:text-black">
                          {formatCurrency(g.revenue, stock.currency)}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-300 print:text-black">
                          {g.revenueGrowthYoY !== null && g.revenueGrowthYoY !== undefined
                            ? `${g.revenueGrowthYoY.toFixed(1)}%`
                            : '—'}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-200 print:text-black">
                          {formatCurrency(g.netIncome, stock.currency)}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-200 print:text-black font-semibold">
                          {formatCurrency(g.freeCashFlow, stock.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 4: Sector Percentile & Peer Positioning */}
          {benchmarkData && benchmarkData.percentiles && (
            <div className="space-y-2">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 print:text-slate-800">
                4. Sector Percentile Rankings ({benchmarkData.peerStocks.length} Industry Peers)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-lg bg-[#121622] border border-[#1E2638] print:bg-slate-50 print:border-slate-300">
                  <span className="text-[10px] font-mono text-slate-400 print:text-slate-600 block">VALUATION MULTIPLE RANK</span>
                  <div className="text-xs font-medium text-slate-200 print:text-black mt-1">
                    Cheaper P/E than <strong className="text-white print:text-black">{benchmarkData.percentiles.peCheaperThanPercent.toFixed(0)}%</strong> of peers
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#121622] border border-[#1E2638] print:bg-slate-50 print:border-slate-300">
                  <span className="text-[10px] font-mono text-slate-400 print:text-slate-600 block">PROFITABILITY RANK (ROE)</span>
                  <div className="text-xs font-medium text-slate-200 print:text-black mt-1">
                    Top <strong className="text-white print:text-black">{benchmarkData.percentiles.roePercentile.toFixed(0)}th percentile</strong> in capital return
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#121622] border border-[#1E2638] print:bg-slate-50 print:border-slate-300">
                  <span className="text-[10px] font-mono text-slate-400 print:text-slate-600 block">BALANCE SHEET SOLVENCY</span>
                  <div className="text-xs font-medium text-slate-200 print:text-black mt-1">
                    Safer Debt/Equity than <strong className="text-white print:text-black">{benchmarkData.percentiles.debtHealthPercentile.toFixed(0)}%</strong> of sector
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Key Investment Thesis & Risks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-[#121622] border border-[#1E2638] space-y-1.5 print:bg-slate-50 print:border-slate-300">
              <span className="text-xs font-mono font-bold text-slate-200 print:text-black flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-slate-400 print:text-slate-700" />
                <span>Primary Bull Catalysts</span>
              </span>
              <ul className="text-[11px] text-slate-400 print:text-slate-700 space-y-1 list-disc list-inside leading-relaxed">
                <li>Demonstrated free cash flow generation of {formatCurrency(stock.freeCashFlow, stock.currency)}.</li>
                <li>Sustainable return on equity profile with disciplined working capital management.</li>
                <li>Established industry presence with defensible customer switching costs.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-[#121622] border border-[#1E2638] space-y-1.5 print:bg-slate-50 print:border-slate-300">
              <span className="text-xs font-mono font-bold text-slate-200 print:text-black flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-slate-400 print:text-slate-700" />
                <span>Primary Risk Considerations</span>
              </span>
              <ul className="text-[11px] text-slate-400 print:text-slate-700 space-y-1 list-disc list-inside leading-relaxed">
                <li>Cyclical sensitivity to broader macroeconomic demand and interest rate shifts.</li>
                <li>Ongoing reinvestment requirements to maintain competitive positioning.</li>
                <li>Valuation multiple compression risk if forward earnings growth slows.</li>
              </ul>
            </div>
          </div>

          {/* Institutional Tear-Sheet Footer */}
          <div className="pt-4 border-t border-[#1E2638] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 print:text-slate-500 print:border-slate-300 font-mono">
            <span>EQUITYLENS RESEARCH TERMINAL • NORMALIZED MARKET MODEL</span>
            <span>DATA SOURCE: YAHOO FINANCE BFF / SEC EDGAR • FOR RESEARCH ONLY</span>
          </div>
        </div>
      </div>
    </div>
  );
};
