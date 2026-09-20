import React from 'react';
import { X, Check, RotateCcw } from 'lucide-react';
import type { ColumnDefinition, TableColumnId } from '../../types';

export const ALL_COLUMNS: ColumnDefinition[] = [
  // Overview
  { id: 'company', label: 'Company', group: 'overview', defaultVisible: true, align: 'left', minWidth: 200 },
  { id: 'symbol', label: 'Ticker', group: 'overview', defaultVisible: true, align: 'left', minWidth: 100 },
  { id: 'exchange', label: 'Exchange', group: 'overview', defaultVisible: true, align: 'left', minWidth: 90 },
  { id: 'country', label: 'Country', group: 'overview', defaultVisible: true, align: 'left', minWidth: 100 },
  { id: 'sector', label: 'Sector', group: 'overview', defaultVisible: true, align: 'left', minWidth: 140 },
  { id: 'marketCap', label: 'Market Cap', group: 'overview', defaultVisible: true, align: 'right', minWidth: 120 },
  { id: 'price', label: 'Price', group: 'overview', defaultVisible: true, align: 'right', minWidth: 100 },
  { id: 'dayChangePercent', label: '1D Change', group: 'performance', defaultVisible: true, align: 'right', minWidth: 95 },

  // Valuation
  { id: 'peRatio', label: 'P/E (TTM)', group: 'valuation', defaultVisible: true, align: 'right', minWidth: 90 },
  { id: 'forwardPe', label: 'Fwd P/E', group: 'valuation', defaultVisible: false, align: 'right', minWidth: 90 },
  { id: 'priceToBook', label: 'P/B', group: 'valuation', defaultVisible: false, align: 'right', minWidth: 80 },
  { id: 'priceToSales', label: 'P/S', group: 'valuation', defaultVisible: false, align: 'right', minWidth: 80 },
  { id: 'evToEbitda', label: 'EV/EBITDA', group: 'valuation', defaultVisible: false, align: 'right', minWidth: 95 },
  { id: 'dividendYield', label: 'Div Yield', group: 'valuation', defaultVisible: false, align: 'right', minWidth: 90 },
  { id: 'enterpriseValue', label: 'Enterprise Val', group: 'valuation', defaultVisible: false, align: 'right', minWidth: 120 },

  // Profitability
  { id: 'revenue', label: 'Revenue', group: 'profitability', defaultVisible: false, align: 'right', minWidth: 110 },
  { id: 'revenueGrowth', label: 'Rev Growth', group: 'profitability', defaultVisible: true, align: 'right', minWidth: 100 },
  { id: 'grossMargin', label: 'Gross Margin', group: 'profitability', defaultVisible: false, align: 'right', minWidth: 100 },
  { id: 'operatingMargin', label: 'Op Margin', group: 'profitability', defaultVisible: false, align: 'right', minWidth: 95 },
  { id: 'netMargin', label: 'Net Margin', group: 'profitability', defaultVisible: true, align: 'right', minWidth: 95 },
  { id: 'returnOnEquity', label: 'ROE', group: 'profitability', defaultVisible: true, align: 'right', minWidth: 90 },
  { id: 'returnOnAssets', label: 'ROA', group: 'profitability', defaultVisible: false, align: 'right', minWidth: 85 },

  // Health
  { id: 'debtToEquity', label: 'Debt/Equity', group: 'health', defaultVisible: true, align: 'right', minWidth: 100 },
  { id: 'currentRatio', label: 'Current Ratio', group: 'health', defaultVisible: false, align: 'right', minWidth: 95 },
  { id: 'quickRatio', label: 'Quick Ratio', group: 'health', defaultVisible: false, align: 'right', minWidth: 90 },
  { id: 'freeCashFlow', label: 'Free Cash Flow', group: 'health', defaultVisible: true, align: 'right', minWidth: 115 },

  // Performance
  { id: 'beta', label: 'Beta', group: 'performance', defaultVisible: false, align: 'right', minWidth: 75 },
  { id: 'distFrom52wHigh', label: 'From 52W High', group: 'performance', defaultVisible: false, align: 'right', minWidth: 105 },
];

export const DEFAULT_VISIBLE_COLUMNS: TableColumnId[] = ALL_COLUMNS.filter(c => c.defaultVisible).map(c => c.id);

interface ColumnPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  visibleColumns: TableColumnId[];
  onToggleColumn: (colId: TableColumnId) => void;
  onResetColumns: () => void;
  onSelectAllColumns: () => void;
}

export const ColumnPickerModal: React.FC<ColumnPickerModalProps> = ({
  isOpen,
  onClose,
  visibleColumns,
  onToggleColumn,
  onResetColumns,
  onSelectAllColumns,
}) => {
  if (!isOpen) return null;

  const groups = [
    { key: 'overview', title: 'Overview & Market Cap' },
    { key: 'valuation', title: 'Valuation Multiples' },
    { key: 'profitability', title: 'Profitability & Returns' },
    { key: 'health', title: 'Financial Health & Solvency' },
    { key: 'performance', title: 'Market Performance & Risk' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#252A33]">
          <div>
            <h3 className="text-base font-semibold text-[#E8E9EB]">Customize Table Columns</h3>
            <p className="text-xs text-[#8B919C] mt-0.5">
              Select which financial metrics to display in the screener table ({visibleColumns.length} of {ALL_COLUMNS.length} visible).
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8B919C] hover:text-[#E8E9EB] hover:bg-[#151922] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {groups.map((group) => {
            const cols = ALL_COLUMNS.filter((c) => c.group === group.key);
            return (
              <div key={group.key} className="space-y-2.5">
                <h4 className="text-xs font-mono font-semibold text-[#7FA6C9] uppercase tracking-wider">
                  {group.title}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {cols.map((col) => {
                    const isChecked = visibleColumns.includes(col.id);
                    const isRequired = col.id === 'company' || col.id === 'symbol';
                    return (
                      <button
                        key={col.id}
                        type="button"
                        disabled={isRequired}
                        onClick={() => !isRequired && onToggleColumn(col.id)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border text-left transition ${
                          isChecked
                            ? 'bg-[#151922] border-[#7FA6C9]/60 text-[#E8E9EB]'
                            : 'bg-[#0B0D10] border-[#252A33] text-[#8B919C] hover:border-[#8B919C]/40 hover:text-[#E8E9EB]'
                        } ${isRequired ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span className="truncate mr-2">{col.label}</span>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 ${
                            isChecked ? 'bg-[#7FA6C9] text-[#0B0D10]' : 'border border-[#252A33]'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[2.5]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[#252A33] bg-[#0B0D10]">
          <div className="flex items-center gap-2">
            <button
              onClick={onResetColumns}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[#8B919C] hover:text-[#E8E9EB] hover:bg-[#151922] border border-[#252A33] transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
            <button
              onClick={onSelectAllColumns}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#8B919C] hover:text-[#E8E9EB] hover:bg-[#151922] border border-[#252A33] transition"
            >
              Select All
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#7FA6C9] hover:bg-[#7FA6C9]/90 text-[#0B0D10] text-xs font-semibold transition shadow-sm"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
