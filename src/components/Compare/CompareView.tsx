import React, { useState, useEffect } from 'react';
import {
  Scale,
  X,
  Plus,
  TrendingUp,
  Building2,
  Trash2,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import type { NormalizedStock } from '../../types';
import { fetchStockFundamentals } from '../../services/api';
import {
  formatCurrency,
  formatPercent,
  formatRatio,
  formatNumber,
} from '../../utils/formatters';

interface CompareViewProps {
  compareList: string[];
  onRemoveFromCompare: (symbol: string) => void;
  onClearCompare: () => void;
  onSelectStock: (symbol: string) => void;
  onOpenAddModal: () => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  compareList,
  onRemoveFromCompare,
  onClearCompare,
  onSelectStock,
  onOpenAddModal,
}) => {
  const [stocks, setStocks] = useState<NormalizedStock[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (compareList.length === 0) {
      setStocks([]);
      return;
    }

    setIsLoading(true);
    Promise.all(compareList.map((s) => fetchStockFundamentals(s).catch(() => null)))
      .then((res) => {
        setStocks(res.filter(Boolean) as NormalizedStock[]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [compareList]);

  if (compareList.length === 0) {
    return (
      <div className="bg-[#121622] border border-[#1E2638] rounded-xl p-12 text-center max-w-lg mx-auto space-y-3">
        <div className="w-12 h-12 rounded-full bg-blue-950/40 text-blue-400 flex items-center justify-center mx-auto">
          <Scale className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white">No Stocks Selected for Comparison</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Select companies using the checkboxes in the Stock Screener table to analyze valuation multiples, profitability margins, and financial health side-by-side.
        </p>
      </div>
    );
  }

  const sections = [
    {
      title: 'Market Overview',
      metrics: [
        { label: 'Current Price', render: (s: NormalizedStock) => formatCurrency(s.price, s.currency, false) },
        {
          label: '1-Day Change',
          render: (s: NormalizedStock) => {
            const p = s.dayChangePercent;
            const col = p === null ? 'text-slate-400' : p >= 0 ? 'text-emerald-400' : 'text-rose-400';
            return <span className={`font-mono font-medium ${col}`}>{formatPercent(p)}</span>;
          },
        },
        { label: 'Market Cap', render: (s: NormalizedStock) => formatCurrency(s.marketCap, s.currency) },
        { label: 'Enterprise Value', render: (s: NormalizedStock) => formatCurrency(s.enterpriseValue, s.currency) },
        { label: 'Exchange & Country', render: (s: NormalizedStock) => `${s.exchange} • ${s.country}` },
        { label: 'Sector', render: (s: NormalizedStock) => s.sector || '—' },
      ],
    },
    {
      title: 'Valuation Multiples',
      metrics: [
        { label: 'Trailing P/E (TTM)', render: (s: NormalizedStock) => formatRatio(s.peRatio) },
        { label: 'Forward P/E', render: (s: NormalizedStock) => formatRatio(s.forwardPe) },
        { label: 'Price to Book (P/B)', render: (s: NormalizedStock) => formatRatio(s.priceToBook) },
        { label: 'Price to Sales (P/S)', render: (s: NormalizedStock) => formatRatio(s.priceToSales) },
        { label: 'EV / EBITDA', render: (s: NormalizedStock) => formatRatio(s.evToEbitda) },
        { label: 'Dividend Yield', render: (s: NormalizedStock) => formatPercent(s.dividendYield, false) },
        { label: 'Earnings Yield', render: (s: NormalizedStock) => formatPercent(s.earningsYield, false) },
      ],
    },
    {
      title: 'Profitability & Returns',
      metrics: [
        { label: 'Revenue Growth (YoY)', render: (s: NormalizedStock) => formatPercent(s.revenueGrowth) },
        { label: 'Gross Margin', render: (s: NormalizedStock) => formatPercent(s.grossMargin, false) },
        { label: 'Operating Margin', render: (s: NormalizedStock) => formatPercent(s.operatingMargin, false) },
        { label: 'Net Profit Margin', render: (s: NormalizedStock) => formatPercent(s.netMargin, false) },
        { label: 'Return on Equity (ROE)', render: (s: NormalizedStock) => formatPercent(s.returnOnEquity, false) },
        { label: 'Return on Assets (ROA)', render: (s: NormalizedStock) => formatPercent(s.returnOnAssets, false) },
      ],
    },
    {
      title: 'Financial Health & Balance Sheet',
      metrics: [
        { label: 'Debt to Equity', render: (s: NormalizedStock) => formatPercent(s.debtToEquity, false) },
        { label: 'Current Ratio', render: (s: NormalizedStock) => formatRatio(s.currentRatio, '') },
        { label: 'Quick Ratio', render: (s: NormalizedStock) => formatRatio(s.quickRatio, '') },
        { label: 'Free Cash Flow', render: (s: NormalizedStock) => formatCurrency(s.freeCashFlow, s.currency) },
        { label: 'Beta (Volatility)', render: (s: NormalizedStock) => formatNumber(s.beta, 2) },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#121622] border border-[#1E2638] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">Side-by-Side Stock Comparison</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 font-mono">
              {stocks.length} equities
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare fundamental strength, operational profitability, and relative multiples across companies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearCompare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-[#1A2234] border border-[#1E2638] transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Comparison</span>
          </button>
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-[#121622] border border-[#1E2638] rounded-xl overflow-x-auto shadow-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1E2638] bg-[#0E131E]">
              <th className="py-4 px-4 w-60 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                Metric
              </th>
              {stocks.map((stock) => (
                <th key={stock.symbol} className="py-4 px-4 min-w-[200px] border-l border-[#1E2638]">
                  <div className="flex items-start justify-between">
                    <div>
                      <button
                        onClick={() => onSelectStock(stock.symbol)}
                        className="font-mono font-bold text-sm text-blue-400 hover:underline block text-left"
                      >
                        {stock.symbol}
                      </button>
                      <span className="text-slate-300 font-medium truncate max-w-[150px] block mt-0.5">
                        {stock.companyName}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveFromCompare(stock.symbol)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#1A2234]">
            {sections.map((section) => (
              <React.Fragment key={section.title}>
                <tr className="bg-[#151B28]/80 text-blue-400 font-mono text-[11px] font-semibold">
                  <td colSpan={stocks.length + 1} className="py-2 px-4 uppercase tracking-wider">
                    {section.title}
                  </td>
                </tr>
                {section.metrics.map((m) => (
                  <tr key={m.label} className="hover:bg-[#161D2C] transition">
                    <td className="py-2.5 px-4 text-slate-400 font-sans font-medium">
                      {m.label}
                    </td>
                    {stocks.map((stock) => (
                      <td
                        key={stock.symbol}
                        className="py-2.5 px-4 font-mono text-slate-200 border-l border-[#1E2638]"
                      >
                        {m.render(stock)}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
