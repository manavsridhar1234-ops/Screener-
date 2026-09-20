import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import type { ScreenerFilters } from '../../types';

interface ActiveFilterChipsProps {
  filters: Partial<ScreenerFilters>;
  onRemoveFilter: (key: keyof ScreenerFilters) => void;
  onClearAllFilters: () => void;
  onRemoveArrayItem: (key: 'sectors' | 'exchanges', item: string) => void;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filters,
  onRemoveFilter,
  onClearAllFilters,
  onRemoveArrayItem,
}) => {
  const chips: { id: string; label: string; onRemove: () => void }[] = [];

  // Universe
  if (filters.universe && filters.universe !== 'all') {
    chips.push({
      id: 'universe',
      label: `Market: ${filters.universe === 'us' ? 'US Equities' : 'Indian Equities'}`,
      onRemove: () => onRemoveFilter('universe'),
    });
  }

  // Market Cap
  if (filters.marketCapCategory && filters.marketCapCategory !== 'all') {
    const labels: Record<string, string> = {
      mega: 'Mega Cap (>$200B / ₹16T)',
      large: 'Large Cap ($10B–$200B)',
      mid: 'Mid Cap ($2B–$10B)',
      small: 'Small Cap ($300M–$2B)',
      micro: 'Micro Cap (<$300M)',
    };
    chips.push({
      id: 'marketCapCat',
      label: `Cap: ${labels[filters.marketCapCategory] || filters.marketCapCategory}`,
      onRemove: () => onRemoveFilter('marketCapCategory'),
    });
  }

  // Sectors
  if (filters.sectors && filters.sectors.length > 0) {
    filters.sectors.forEach((sec) => {
      chips.push({
        id: `sector-${sec}`,
        label: `Sector: ${sec}`,
        onRemove: () => onRemoveArrayItem('sectors', sec),
      });
    });
  }

  // Exchanges
  if (filters.exchanges && filters.exchanges.length > 0) {
    filters.exchanges.forEach((ex) => {
      chips.push({
        id: `exchange-${ex}`,
        label: `Exchange: ${ex}`,
        onRemove: () => onRemoveArrayItem('exchanges', ex),
      });
    });
  }

  // Numerical Range Filters
  const numericalConfigs: { key: keyof ScreenerFilters; label: string; unit?: string }[] = [
    { key: 'peRatio', label: 'P/E' },
    { key: 'forwardPe', label: 'Fwd P/E' },
    { key: 'priceToBook', label: 'P/B' },
    { key: 'priceToSales', label: 'P/S' },
    { key: 'evToEbitda', label: 'EV/EBITDA' },
    { key: 'dividendYield', label: 'Dividend Yield', unit: '%' },
    { key: 'earningsYield', label: 'Earnings Yield', unit: '%' },
    { key: 'revenueGrowth', label: 'Rev Growth', unit: '%' },
    { key: 'grossMargin', label: 'Gross Margin', unit: '%' },
    { key: 'operatingMargin', label: 'Operating Margin', unit: '%' },
    { key: 'netMargin', label: 'Net Margin', unit: '%' },
    { key: 'returnOnEquity', label: 'ROE', unit: '%' },
    { key: 'returnOnAssets', label: 'ROA', unit: '%' },
    { key: 'eps', label: 'EPS' },
    { key: 'debtToEquity', label: 'Debt/Equity', unit: '%' },
    { key: 'currentRatio', label: 'Current Ratio' },
    { key: 'quickRatio', label: 'Quick Ratio' },
    { key: 'dayChangePercent', label: '1D Change', unit: '%' },
    { key: 'distFrom52wHigh', label: 'From 52W High', unit: '%' },
    { key: 'beta', label: 'Beta' },
  ];

  for (const item of numericalConfigs) {
    const range = (filters as any)[item.key];
    if (range && (range.min !== null || range.max !== null)) {
      let desc = '';
      const u = item.unit || '';
      if (range.min !== null && range.max !== null) {
        desc = `${range.min}${u} to ${range.max}${u}`;
      } else if (range.min !== null) {
        desc = `≥ ${range.min}${u}`;
      } else if (range.max !== null) {
        desc = `≤ ${range.max}${u}`;
      }
      chips.push({
        id: item.key,
        label: `${item.label}: ${desc}`,
        onRemove: () => onRemoveFilter(item.key),
      });
    }
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-2">
      <span className="text-[11px] font-mono text-[#8B919C] mr-1">Active Filters:</span>
      {chips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono bg-[#151922] text-[#7FA6C9] border border-[#252A33]"
        >
          <span>{chip.label}</span>
          <button
            onClick={chip.onRemove}
            className="hover:text-[#E8E9EB] p-0.5 rounded focus:outline-none"
            title="Remove filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        id="clear-all-filters-btn"
        onClick={onClearAllFilters}
        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-[#8B919C] hover:text-[#B87878] transition ml-2 font-mono"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Clear All ({chips.length})</span>
      </button>
    </div>
  );
};
