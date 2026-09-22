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
import { exportScreenerToCsv } from '../../utils/exportSpreadsheet';
import { useWatchlist } from '../../context/WatchlistContext';
import { MetricTooltip } from '../Common/MetricTooltip';

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

  // Export to CSV / Excel
  const handleExportCSV = () => {
    if (stocks.length === 0) return;
    exportScreenerToCsv(stocks);
  };

  // Helper to render formatted cell value
  const renderCell = (stock: NormalizedStock, colId: TableColumnId) => {
    switch (colId) {
      case 'company':
        return (
          <div className="flex flex-col min-w-[170px]">
            <span
              onClick={() => onSelectStock(stock.symbol)}
              className="text-xs font-semibold text-[#F0F2F5] hover:text-[#38BDF8] cursor-pointer transition truncate max-w-[210px]"
              title={stock.companyName}
            >
              {stock.companyName}
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-[#8E98A8]">
              <span className="font-mono text-[#8E98A8]">{stock.exchange}</span>
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
              className="font-mono font-semibold text-xs text-[#38BDF8] hover:text-[#38BDF8]/80 hover:underline transition text-left"
            >
              {stock.symbol}
            </button>
            <button
              onClick={() => toggleWatchlist(stock.symbol)}
              className="p-0.5 text-[#8E98A8] hover:text-[#F59E0B] transition"
              title={isInWatchlist(stock.symbol) ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  isInWatchlist(stock.symbol) ? 'fill-[#F59E0B] text-[#F59E0B]' : ''
                }`}
              />
            </button>
          </div>
        );

      case 'exchange':
        return <span className="font-mono text-[#8E98A8] text-xs">{stock.exchange}</span>;

      case 'country':
        return <span className="text-[#8E98A8] text-xs truncate max-w-[90px]">{stock.country}</span>;

      case 'sector':
        return (
          <span
            className="text-[#8E98A8] text-xs truncate max-w-[130px] block"
            title={stock.sector || 'Unclassified'}
          >
            {stock.sector || '—'}
          </span>
        );

      case 'marketCap': {
        const val = stock.marketCap;
        const formatted = formatCurrency(val, stock.currency);
        return (
          <MetricTooltip metricKey="marketCap" value={val} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className="font-mono text-[#F0F2F5] text-xs font-semibold">{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'price': {
        const val = stock.price;
        const formatted = formatCurrency(val, stock.currency, false);
        return (
          <MetricTooltip metricKey="price" value={val} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className="font-mono text-[#E8E9EB] text-xs font-medium">{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'dayChangePercent': {
        const p = stock.dayChangePercent;
        const color = p === null ? 'text-[#8B919C]' : p > 0 ? 'text-[#6FA58A]' : p < 0 ? 'text-[#B87878]' : 'text-[#8B919C]';
        const formatted = formatPercent(p);
        return (
          <MetricTooltip metricKey="dayChangePercent" value={p} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className={`font-mono text-xs font-medium ${color}`}>{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'peRatio': {
        const formatted = formatRatio(stock.peRatio);
        return (
          <MetricTooltip metricKey="peRatio" value={stock.peRatio} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className="font-mono text-[#E8E9EB] text-xs">{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'forwardPe': {
        const formatted = formatRatio(stock.forwardPe);
        return (
          <MetricTooltip metricKey="forwardPe" value={stock.forwardPe} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className="font-mono text-[#E8E9EB] text-xs">{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'priceToBook': {
        const formatted = formatRatio(stock.priceToBook);
        return (
          <MetricTooltip metricKey="priceToBook" value={stock.priceToBook} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className="font-mono text-[#E8E9EB] text-xs">{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'priceToSales': {
        const formatted = formatRatio(stock.priceToSales);
        return (
          <MetricTooltip metricKey="priceToSales" value={stock.priceToSales} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className="font-mono text-[#E8E9EB] text-xs">{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'evToEbitda': {
        const formatted = formatRatio(stock.evToEbitda);
        return (
          <MetricTooltip metricKey="evToEbitda" value={stock.evToEbitda} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className="font-mono text-[#E8E9EB] text-xs">{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'dividendYield': {
        const formatted = formatPercent(stock.dividendYield, false);
        return (
          <MetricTooltip metricKey="dividendYield" value={stock.dividendYield} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className="font-mono text-[#6FA58A] text-xs">{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'enterpriseValue': {
        const formatted = formatCurrency(stock.enterpriseValue, stock.currency);
        return (
          <MetricTooltip metricKey="enterpriseValue" value={stock.enterpriseValue} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className="font-mono text-[#E8E9EB] text-xs">{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'revenue': {
        const formatted = formatCurrency(stock.revenue, stock.currency);
        return (
          <MetricTooltip metricKey="revenue" value={stock.revenue} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className="font-mono text-[#E8E9EB] text-xs">{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'revenueGrowth': {
        const g = stock.revenueGrowth;
        const color = g === null ? 'text-[#8B919C]' : g > 0 ? 'text-[#6FA58A]' : g < 0 ? 'text-[#B87878]' : 'text-[#8B919C]';
        const formatted = formatPercent(g);
        return (
          <MetricTooltip metricKey="revenueGrowth" value={g} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className={`font-mono text-xs font-medium ${color}`}>{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'grossMargin': {
        const formatted = formatPercent(stock.grossMargin, false);
        return (
          <MetricTooltip metricKey="grossMargin" value={stock.grossMargin} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className="font-mono text-[#E8E9EB] text-xs">{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'operatingMargin': {
        const formatted = formatPercent(stock.operatingMargin, false);
        return (
          <MetricTooltip metricKey="operatingMargin" value={stock.operatingMargin} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className="font-mono text-[#E8E9EB] text-xs">{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'netMargin': {
        const m = stock.netMargin;
        const color = m === null ? 'text-[#8B919C]' : m > 0 ? 'text-[#6FA58A]' : m < 0 ? 'text-[#B87878]' : 'text-[#8B919C]';
        const formatted = formatPercent(m, false);
        return (
          <MetricTooltip metricKey="netMargin" value={m} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className={`font-mono text-xs font-medium ${color}`}>{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'returnOnEquity': {
        const roe = stock.returnOnEquity;
        const color = roe === null ? 'text-[#8B919C]' : roe >= 15 ? 'text-[#6FA58A] font-semibold' : roe < 0 ? 'text-[#B87878]' : 'text-[#E8E9EB]';
        const formatted = formatPercent(roe, false);
        return (
          <MetricTooltip metricKey="returnOnEquity" value={roe} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className={`font-mono text-xs ${color}`}>{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'returnOnAssets': {
        const formatted = formatPercent(stock.returnOnAssets, false);
        return (
          <MetricTooltip metricKey="returnOnAssets" value={stock.returnOnAssets} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className="font-mono text-[#E8E9EB] text-xs">{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'debtToEquity': {
        const dte = stock.debtToEquity;
        const color = dte === null ? 'text-[#8B919C]' : dte > 100 ? 'text-[#B8A36A]' : 'text-[#E8E9EB]';
        const formatted = formatPercent(dte, false);
        return (
          <MetricTooltip metricKey="debtToEquity" value={dte} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className={`font-mono text-xs ${color}`}>{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'currentRatio': {
        const formatted = formatRatio(stock.currentRatio, '');
        return (
          <MetricTooltip metricKey="currentRatio" value={stock.currentRatio} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className="font-mono text-[#E8E9EB] text-xs">{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'quickRatio': {
        const formatted = formatRatio(stock.quickRatio, '');
        return (
          <MetricTooltip metricKey="quickRatio" value={stock.quickRatio} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className="font-mono text-[#E8E9EB] text-xs">{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'freeCashFlow': {
        const formatted = formatCurrency(stock.freeCashFlow, stock.currency);
        return (
          <MetricTooltip metricKey="freeCashFlow" value={stock.freeCashFlow} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className="font-mono text-[#E8E9EB] text-xs">{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'beta': {
        const formatted = formatNumber(stock.beta, 2);
        return (
          <MetricTooltip metricKey="beta" value={stock.beta} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className="font-mono text-[#8B919C] text-xs">{formatted}</span>
          </MetricTooltip>
        );
      }

      case 'distFrom52wHigh': {
        const d = stock.distFrom52wHigh;
        const color = d === null ? 'text-[#8B919C]' : d < -30 ? 'text-[#B87878]' : 'text-[#8B919C]';
        const formatted = formatPercent(d);
        return (
          <MetricTooltip metricKey="distFrom52wHigh" value={d} formattedValue={formatted} stock={stock} className="justify-end w-full">
            <span className={`font-mono text-xs ${color}`}>{formatted}</span>
          </MetricTooltip>
        );
      }

      default:
        return <span className="text-[#8B919C]">—</span>;
    }
  };

  const activeColumnsList = ALL_COLUMNS.filter(c => visibleColumns.includes(c.id));

  return (
    <div className="bg-[#0E1217] border border-[#1F2633] rounded-xl overflow-hidden flex flex-col shadow-xl shadow-black/30">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-[#1F2633] flex flex-wrap items-center justify-between gap-3 bg-[#0E1217]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#F0F2F5]">Results</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#141820] text-[#38BDF8] border border-[#1F2633]">
              {totalCount} {totalCount === 1 ? 'stock' : 'stocks'}
            </span>
          </div>

          {compareList.length > 0 && (
            <div className="flex items-center gap-1.5 bg-[#141820] border border-[#38BDF8]/30 px-2.5 py-1 rounded-lg text-xs text-[#38BDF8]">
              <Scale className="w-3.5 h-3.5" />
              <span className="font-medium">{compareList.length} selected for comparison</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Column Selector */}
          <button
            id="customize-columns-btn"
            onClick={onOpenColumnPicker}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#8E98A8] hover:text-[#F0F2F5] bg-[#141820] hover:bg-[#1A202C] border border-[#1F2633] transition"
          >
            <Columns className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Columns ({visibleColumns.length})</span>
          </button>

          {/* Export to Excel / CSV */}
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            disabled={stocks.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#F0F2F5] bg-[#141820] hover:bg-[#1A202C] border border-[#1F2633] transition disabled:opacity-40"
            title="Export filtered stock universe with all valuation, profitability, and solvency metrics to CSV / Excel"
          >
            <Download className="w-3.5 h-3.5 text-[#34D399]" />
            <span className="hidden sm:inline font-medium">Export (Excel / CSV)</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto relative min-h-[350px]">
        {isLoading ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-7 h-7 rounded-full border-2 border-[#38BDF8] border-t-transparent animate-spin" />
            <p className="text-xs text-[#8E98A8] font-mono">Filtering normalized equity database...</p>
          </div>
        ) : stocks.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
            <div className="w-10 h-10 rounded-full bg-[#141820] border border-[#1F2633] flex items-center justify-center text-[#8E98A8] mb-1">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-[#F0F2F5]">No Matching Stocks Found</h4>
            <p className="text-xs text-[#8E98A8] leading-relaxed">
              No companies in the universe match the current filter criteria. Try relaxing your valuation multiples, broadening the market cap range, or checking "Inc. N/A".
            </p>
            <button
              onClick={onClearFilters}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#141820] hover:bg-[#1A202C] border border-[#1F2633] text-[#F0F2F5] text-xs font-medium transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1F2633] bg-[#090B0E] text-[11px] font-mono text-[#8E98A8] select-none">
                {/* Selection Checkbox */}
                <th className="py-3 px-3 w-8 text-center">
                  <span className="sr-only">Select</span>
                </th>

                {activeColumnsList.map((col) => {
                  const isSorted = sortBy === col.id;
                  const isMetric =
                    col.id !== 'company' &&
                    col.id !== 'symbol' &&
                    col.id !== 'exchange' &&
                    col.id !== 'country' &&
                    col.id !== 'sector';
                  return (
                    <th
                      key={col.id}
                      onClick={() => onSort(col.id)}
                      style={{ minWidth: col.minWidth || 90 }}
                      className={`py-3 px-3 cursor-pointer hover:bg-[#141820] transition text-${col.align || 'left'} ${
                        isSorted ? 'text-[#38BDF8] font-semibold bg-[#141820]' : ''
                      }`}
                    >
                      <div className={`inline-flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                        {isMetric ? (
                          <MetricTooltip metricKey={col.id} underlined={false}>
                            <span className="hover:text-[#F0F2F5] transition-colors">{col.label}</span>
                          </MetricTooltip>
                        ) : (
                          <span>{col.label}</span>
                        )}
                        {isSorted ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp className="w-3 h-3 text-[#38BDF8]" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-[#38BDF8]" />
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
            <tbody className="divide-y divide-[#1F2633] text-xs">
              {stocks.map((stock) => {
                const isCompared = compareList.includes(stock.symbol);
                return (
                  <tr
                    key={stock.symbol}
                    id={`stock-row-${stock.symbol}`}
                    className={`hover:bg-[#141820]/70 transition group ${
                      isCompared ? 'bg-[#38BDF8]/10' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isCompared}
                        onChange={() => onToggleCompare(stock.symbol)}
                        className="w-3.5 h-3.5 rounded bg-[#090B0E] border-[#1F2633] text-[#38BDF8] focus:ring-0 cursor-pointer"
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
      <div className="p-3 border-t border-[#1F2633] bg-[#0E1217] flex flex-wrap items-center justify-between gap-3 text-xs text-[#8E98A8]">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onChangePageSize(Number(e.target.value))}
            className="bg-[#151922] border border-[#252A33] rounded px-2 py-1 text-xs text-[#E8E9EB] focus:outline-none"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>All</option>
          </select>
          <span className="font-mono text-[#8B919C]">
            Page {page} of {totalPages || 1} ({totalCount} total stocks)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onChangePage(page - 1)}
            disabled={page <= 1}
            className="px-2.5 py-1 rounded bg-[#151922] border border-[#252A33] text-[#8B919C] hover:text-[#E8E9EB] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          <button
            onClick={() => onChangePage(page + 1)}
            disabled={page >= totalPages}
            className="px-2.5 py-1 rounded bg-[#151922] border border-[#252A33] text-[#8B919C] hover:text-[#E8E9EB] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
