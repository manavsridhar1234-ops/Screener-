import React from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  Download,
  Columns,
  Scale,
  ExternalLink,
  RotateCcw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import type { NormalizedStock, TableColumnId } from '../../types';
import { ALL_COLUMNS } from './ColumnPickerModal';
import { formatCurrency, formatPercent, formatRatio, formatNumber } from '../../utils/formatters';
import { useWatchlist } from '../../context/WatchlistContext';

interface ScreenerTableProps {
  stocks: NormalizedStock[];
  totalCount: number;
  isLoading: boolean;
  visibleColumns: TableColumnId[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (colId: string) => void;
  onOpenColumnPicker: () => void;
  onSelectStock: (symbol: string) => void;
  compareList: string[];
  onToggleCompare: (symbol: string) => void;
  onClearFilters: () => void;
  page: number;
  pageSize: number;
  totalPages: number;
  onChangePage: (newPage: number) => void;
  onChangePageSize: (newSize: number) => void;
}

export const ScreenerTable: React.FC<ScreenerTableProps> = ({
  stocks,
  totalCount,
  isLoading,
  visibleColumns,
  sortBy,
  sortOrder,
  onSort,
  onOpenColumnPicker,
  onSelectStock,
  compareList,
  onToggleCompare,
  onClearFilters,
  page,
  pageSize,
  totalPages,
  onChangePage,
  onChangePageSize,
}) => {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  // Export to CSV
  const handleExportCSV = () => {
    if (stocks.length === 0) return;
    const activeCols = ALL_COLUMNS.filter(c => visibleColumns.includes(c.id));
    const headerRow = activeCols.map(c => `"${c.label}"`).join(',');

    const rows = stocks.map(s => {
      return activeCols.map(c => {
        const val = (s as any)[c.id];
        if (val === null || val === undefined) return '""';
        if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
        return `"${val}"`;
      }).join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headerRow, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `equitylens_screener_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to render formatted cell value
  const renderCell = (stock: NormalizedStock, colId: TableColumnId) => {
    switch (colId) {
      case 'company':
        return (
          <div className="flex flex-col min-w-[170px]">
            <span
              onClick={() => onSelectStock(stock.symbol)}
              className="text-xs font-semibold text-slate-100 hover:text-blue-400 cursor-pointer transition truncate max-w-[210px]"
              title={stock.companyName}
            >
              {stock.companyName}
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="font-mono text-slate-300">{stock.exchange}</span>
              <span>•</span>
              <span className="truncate">{stock.country}</span>
            </div>
          </div>
        );

      case 'symbol':
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelectStock(stock.symbol)}
              className="font-mono font-bold text-xs text-blue-400 hover:text-blue-300 hover:underline transition text-left"
            >
              {stock.symbol}
            </button>
            <button
              onClick={() => toggleWatchlist(stock.symbol)}
              className="p-0.5 text-slate-500 hover:text-amber-400 transition"
              title={isInWatchlist(stock.symbol) ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  isInWatchlist(stock.symbol) ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
            </button>
          </div>
        );

      case 'exchange':
        return <span className="font-mono text-slate-300 text-xs">{stock.exchange}</span>;

      case 'country':
        return <span className="text-slate-300 text-xs truncate max-w-[90px]">{stock.country}</span>;

      case 'sector':
        return (
          <span
            className="text-slate-300 text-xs truncate max-w-[130px] block"
            title={stock.sector || 'Unclassified'}
          >
            {stock.sector || '—'}
          </span>
        );

      case 'marketCap':
        return (
          <span className="font-mono text-slate-100 text-xs font-medium">
            {formatCurrency(stock.marketCap, stock.currency)}
          </span>
        );

      case 'price':
        return (
          <span className="font-mono text-white text-xs font-semibold">
            {formatCurrency(stock.price, stock.currency, false)}
          </span>
        );

      case 'dayChangePercent': {
        const p = stock.dayChangePercent;
        const color = p === null ? 'text-slate-400' : p > 0 ? 'text-emerald-400' : p < 0 ? 'text-rose-400' : 'text-slate-300';
        return (
          <span className={`font-mono text-xs font-medium ${color}`}>
            {formatPercent(p)}
          </span>
        );
      }

      case 'peRatio':
        return (
          <span className="font-mono text-slate-200 text-xs">
            {formatRatio(stock.peRatio)}
          </span>
        );

      case 'forwardPe':
        return (
          <span className="font-mono text-slate-300 text-xs">
            {formatRatio(stock.forwardPe)}
          </span>
        );

      case 'priceToBook':
        return (
          <span className="font-mono text-slate-300 text-xs">
            {formatRatio(stock.priceToBook)}
          </span>
        );

      case 'priceToSales':
        return (
          <span className="font-mono text-slate-300 text-xs">
            {formatRatio(stock.priceToSales)}
          </span>
        );

      case 'evToEbitda':
        return (
          <span className="font-mono text-slate-300 text-xs">
            {formatRatio(stock.evToEbitda)}
          </span>
        );

      case 'dividendYield':
        return (
          <span className="font-mono text-slate-200 text-xs">
            {formatPercent(stock.dividendYield, false)}
          </span>
        );

      case 'enterpriseValue':
        return (
          <span className="font-mono text-slate-300 text-xs">
            {formatCurrency(stock.enterpriseValue, stock.currency)}
          </span>
        );

      case 'revenue':
        return (
          <span className="font-mono text-slate-300 text-xs">
            {formatCurrency(stock.revenue, stock.currency)}
          </span>
        );

      case 'revenueGrowth': {
        const g = stock.revenueGrowth;
        const color = g === null ? 'text-slate-400' : g > 0 ? 'text-emerald-400' : g < 0 ? 'text-rose-400' : 'text-slate-300';
        return (
          <span className={`font-mono text-xs font-medium ${color}`}>
            {formatPercent(g)}
          </span>
        );
      }

      case 'grossMargin':
        return (
          <span className="font-mono text-slate-300 text-xs">
            {formatPercent(stock.grossMargin, false)}
          </span>
        );

      case 'operatingMargin':
        return (
          <span className="font-mono text-slate-300 text-xs">
            {formatPercent(stock.operatingMargin, false)}
          </span>
        );

      case 'netMargin': {
        const m = stock.netMargin;
        const color = m === null ? 'text-slate-400' : m > 0 ? 'text-emerald-400' : m < 0 ? 'text-rose-400' : 'text-slate-300';
        return (
          <span className={`font-mono text-xs font-medium ${color}`}>
            {formatPercent(m, false)}
          </span>
        );
      }

      case 'returnOnEquity': {
        const roe = stock.returnOnEquity;
        const color = roe === null ? 'text-slate-400' : roe >= 15 ? 'text-emerald-400 font-semibold' : roe < 0 ? 'text-rose-400' : 'text-slate-200';
        return (
          <span className={`font-mono text-xs ${color}`}>
            {formatPercent(roe, false)}
          </span>
        );
      }

      case 'returnOnAssets':
        return (
          <span className="font-mono text-slate-300 text-xs">
            {formatPercent(stock.returnOnAssets, false)}
          </span>
        );

      case 'debtToEquity': {
        const dte = stock.debtToEquity;
        const color = dte === null ? 'text-slate-400' : dte > 100 ? 'text-amber-400' : 'text-slate-200';
        return (
          <span className={`font-mono text-xs ${color}`}>
            {formatPercent(dte, false)}
          </span>
        );
      }

      case 'currentRatio':
        return (
          <span className="font-mono text-slate-300 text-xs">
            {formatRatio(stock.currentRatio, '')}
          </span>
        );

      case 'quickRatio':
        return (
          <span className="font-mono text-slate-300 text-xs">
            {formatRatio(stock.quickRatio, '')}
          </span>
        );

      case 'freeCashFlow':
        return (
          <span className="font-mono text-slate-200 text-xs">
            {formatCurrency(stock.freeCashFlow, stock.currency)}
          </span>
        );

      case 'beta':
        return (
          <span className="font-mono text-slate-300 text-xs">
            {formatNumber(stock.beta, 2)}
          </span>
        );

      case 'distFrom52wHigh': {
        const d = stock.distFrom52wHigh;
        const color = d === null ? 'text-slate-400' : d < -30 ? 'text-rose-400' : 'text-slate-300';
        return (
          <span className={`font-mono text-xs ${color}`}>
            {formatPercent(d)}
          </span>
        );
      }

      default:
        return <span className="text-slate-400">—</span>;
    }
  };

  const activeColumnsList = ALL_COLUMNS.filter(c => visibleColumns.includes(c.id));

  return (
    <div className="bg-[#121622] border border-[#1E2638] rounded-xl overflow-hidden flex flex-col shadow-xl">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-[#1E2638] flex flex-wrap items-center justify-between gap-3 bg-[#151B28]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Results</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-950/80 text-blue-400 border border-blue-800/60">
              {totalCount} {totalCount === 1 ? 'stock' : 'stocks'}
            </span>
          </div>

          {compareList.length > 0 && (
            <div className="flex items-center gap-1.5 bg-blue-950/50 border border-blue-800/50 px-2.5 py-1 rounded-lg text-xs text-blue-300">
              <Scale className="w-3.5 h-3.5" />
              <span>{compareList.length} selected for comparison</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Column Selector */}
          <button
            id="customize-columns-btn"
            onClick={onOpenColumnPicker}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#101420] hover:bg-[#1A2234] border border-[#1E2638] transition"
          >
            <Columns className="w-3.5 h-3.5 text-blue-400" />
            <span>Columns ({visibleColumns.length})</span>
          </button>

          {/* Export CSV */}
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            disabled={stocks.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#101420] hover:bg-[#1A2234] border border-[#1E2638] transition disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto relative min-h-[350px]">
        {isLoading ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-400 font-mono">Filtering normalized equity database...</p>
          </div>
        ) : stocks.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#182030] flex items-center justify-center text-slate-500 mb-1">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white">No Matching Stocks Found</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              No companies in the universe match the current filter criteria. Try relaxing your valuation multiples, broadening the market cap range, or checking "Inc. N/A".
            </p>
            <button
              onClick={onClearFilters}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1E2638] bg-[#0E131E] text-[11px] font-mono text-slate-400 select-none">
                {/* Selection Checkbox */}
                <th className="py-3 px-3 w-8 text-center">
                  <span className="sr-only">Select</span>
                </th>

                {activeColumnsList.map((col) => {
                  const isSorted = sortBy === col.id;
                  return (
                    <th
                      key={col.id}
                      onClick={() => onSort(col.id)}
                      style={{ minWidth: col.minWidth || 90 }}
                      className={`py-3 px-3 cursor-pointer hover:bg-[#182234] transition text-${col.align || 'left'} ${
                        isSorted ? 'text-blue-400 font-bold bg-[#141B2A]' : ''
                      }`}
                    >
                      <div className={`inline-flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                        <span>{col.label}</span>
                        {isSorted ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp className="w-3 h-3 text-blue-400" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-blue-400" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2234] text-xs">
              {stocks.map((stock) => {
                const isCompared = compareList.includes(stock.symbol);
                return (
                  <tr
                    key={stock.symbol}
                    id={`stock-row-${stock.symbol}`}
                    className={`hover:bg-[#161D2C] transition group ${
                      isCompared ? 'bg-blue-950/30' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isCompared}
                        onChange={() => onToggleCompare(stock.symbol)}
                        className="w-3.5 h-3.5 rounded bg-[#0B0E14] border-[#1E2638] text-blue-600 focus:ring-0 cursor-pointer"
                        title="Select to compare"
                      />
                    </td>

                    {/* Dynamic Columns */}
                    {activeColumnsList.map((col) => (
                      <td
                        key={col.id}
                        className={`py-2.5 px-3 text-${col.align || 'left'} whitespace-nowrap`}
                      >
                        {renderCell(stock, col.id)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination & Footer */}
      <div className="p-3 border-t border-[#1E2638] bg-[#0E131E] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onChangePageSize(Number(e.target.value))}
            className="bg-[#151B28] border border-[#1E2638] rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>All</option>
          </select>
          <span className="font-mono text-slate-400">
            Page {page} of {totalPages || 1} ({totalCount} total stocks)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onChangePage(page - 1)}
            disabled={page <= 1}
            className="px-2.5 py-1 rounded bg-[#151B28] border border-[#1E2638] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          <button
            onClick={() => onChangePage(page + 1)}
            disabled={page >= totalPages}
            className="px-2.5 py-1 rounded bg-[#151B28] border border-[#1E2638] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
