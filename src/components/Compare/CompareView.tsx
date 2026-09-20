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
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl p-12 text-center max-w-lg mx-auto space-y-3 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-[#151922] border border-[#252A33] text-[#7FA6C9] flex items-center justify-center mx-auto">
          <Scale className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-[#E8E9EB]">No Stocks Selected for Comparison</h3>
        <p className="text-xs text-[#8B919C] leading-relaxed">
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
            const col = p === null ? 'text-[#8B919C]' : p >= 0 ? 'text-[#6FA58A]' : 'text-[#B87878]';
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
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#E8E9EB]">Side-by-Side Stock Comparison</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#151922] text-[#7FA6C9] border border-[#252A33] font-mono">
              {stocks.length} equities
            </span>
          </div>
          <p className="text-xs text-[#8B919C] mt-0.5">
            Compare fundamental strength, operational profitability, and relative multiples across companies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearCompare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#8B919C] hover:text-[#B87878] hover:bg-[#151922] border border-[#252A33] transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Comparison</span>
          </button>
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#252A33] bg-[#0B0D10]">
              <th className="py-4 px-4 w-60 text-[#8B919C] font-mono uppercase tracking-wider text-[11px]">
                Metric
              </th>
              {stocks.map((stock) => (
                <th key={stock.symbol} className="py-4 px-4 min-w-[200px] border-l border-[#252A33]">
                  <div className="flex items-start justify-between">
                    <div>
                      <button
                        onClick={() => onSelectStock(stock.symbol)}
                        className="font-mono font-medium text-sm text-[#7FA6C9] hover:underline block text-left"
                      >
                        {stock.symbol}
                      </button>
                      <span className="text-[#E8E9EB] font-medium truncate max-w-[150px] block mt-0.5">
                        {stock.companyName}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveFromCompare(stock.symbol)}
                      className="text-[#8B919C] hover:text-[#B87878] p-1 rounded transition"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#252A33]">
            {sections.map((section) => (
              <React.Fragment key={section.title}>
                <tr className="bg-[#151922] text-[#7FA6C9] font-mono text-[11px] font-medium border-y border-[#252A33]">
                  <td colSpan={stocks.length + 1} className="py-2 px-4 uppercase tracking-wider">
                    {section.title}
                  </td>
                </tr>
                {section.metrics.map((m) => (
                  <tr key={m.label} className="hover:bg-[#151922]/60 transition">
                    <td className="py-2.5 px-4 text-[#8B919C] font-sans font-medium">
                      {m.label}
                    </td>
                    {stocks.map((stock) => (
                      <td
                        key={stock.symbol}
                        className="py-2.5 px-4 font-mono text-[#E8E9EB] border-l border-[#252A33]"
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
