import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Layers,
  Percent,
  CircleDollarSign,
  ShieldCheck,
  Activity,
  Check,
} from 'lucide-react';
import type { ScreenerFilters, FilterRange, MarketCapCategory } from '../../types';

interface ScreenerFiltersProps {
  filters: Partial<ScreenerFilters>;
  onUpdateFilter: (key: keyof ScreenerFilters, value: any) => void;
  availableSectors: string[];
  availableExchanges: string[];
}

export const ScreenerFiltersComponent: React.FC<ScreenerFiltersProps> = ({
  filters,
  onUpdateFilter,
  availableSectors,
  availableExchanges,
}) => {
  // Accordion state
  const [openSections, setOpenSections] = useState({
    universe: true,
    valuation: false,
    profitability: false,
    health: false,
    performance: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateRange = (
    key: keyof ScreenerFilters,
    type: 'min' | 'max' | 'includeMissing',
    value: any
  ) => {
    const current: FilterRange = (filters as any)[key] || {
      min: null,
      max: null,
      includeMissing: true,
    };

    let parsedVal = value;
    if (type === 'min' || type === 'max') {
      parsedVal = value === '' || value === null || isNaN(Number(value)) ? null : Number(value);
    }

    onUpdateFilter(key, {
      ...current,
      [type]: parsedVal,
    });
  };

  // Helper renderer for a numeric filter field
  const renderRangeField = (
    key: keyof ScreenerFilters,
    label: string,
    placeholderMin: string = 'Min',
    placeholderMax: string = 'Max',
    step: string = 'any',
    unit?: string
  ) => {
    const range: FilterRange = (filters as any)[key] || {
      min: null,
      max: null,
      includeMissing: true,
    };

    const hasValue = range.min !== null || range.max !== null;

    return (
      <div className={`p-2.5 rounded-lg border transition ${
        hasValue ? 'bg-[#161B26] border-[#38BDF8]/60 shadow-sm shadow-[#38BDF8]/10' : 'bg-[#11151D] border-[#1F2633]'
      }`}>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-medium text-[#F0F2F5] flex items-center gap-1">
            <span>{label}</span>
            {unit && <span className="text-[10px] text-[#8E98A8] font-mono">({unit})</span>}
          </label>
          <label className="flex items-center gap-1 text-[10px] text-[#8E98A8] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={range.includeMissing ?? true}
              onChange={(e) => updateRange(key, 'includeMissing', e.target.checked)}
              className="w-3 h-3 rounded bg-[#090B0E] border-[#1F2633] text-[#38BDF8] focus:ring-0"
            />
            <span>Inc. N/A</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            step={step}
            placeholder={placeholderMin}
            value={range.min ?? ''}
            onChange={(e) => updateRange(key, 'min', e.target.value)}
            className="w-full bg-[#090B0E] border border-[#1F2633] rounded px-2 py-1 text-xs text-[#F0F2F5] placeholder-[#8E98A8]/60 focus:border-[#38BDF8] focus:outline-none font-mono"
          />
          <input
            type="number"
            step={step}
            placeholder={placeholderMax}
            value={range.max ?? ''}
            onChange={(e) => updateRange(key, 'max', e.target.value)}
            className="w-full bg-[#090B0E] border border-[#1F2633] rounded px-2 py-1 text-xs text-[#F0F2F5] placeholder-[#8E98A8]/60 focus:border-[#38BDF8] focus:outline-none font-mono"
          />
        </div>
      </div>
    );
  };

  const handleSectorToggle = (sec: string) => {
    const current = filters.sectors || [];
    if (current.includes(sec)) {
      onUpdateFilter('sectors', current.filter(s => s !== sec));
    } else {
      onUpdateFilter('sectors', [...current, sec]);
    }
  };

  const handleExchangeToggle = (ex: string) => {
    const current = filters.exchanges || [];
    if (current.includes(ex)) {
      onUpdateFilter('exchanges', current.filter(e => e !== ex));
    } else {
      onUpdateFilter('exchanges', [...current, ex]);
    }
  };

  return (
    <div className="space-y-3">
      {/* 1. Market Universe & Overview Group */}
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('universe')}
          className="w-full px-4 py-3 flex items-center justify-between bg-[#151922] hover:bg-[#151922]/80 transition text-left"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-[#E8E9EB] tracking-wide">
            <Layers className="w-4 h-4 text-[#7FA6C9]" />
            <span>MARKET UNIVERSE & CATEGORIES</span>
          </div>
          {openSections.universe ? (
            <ChevronUp className="w-4 h-4 text-[#8B919C]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#8B919C]" />
          )}
        </button>

        {openSections.universe && (
          <div className="p-4 space-y-4">
            {/* Market Selection */}
            <div>
              <label className="text-[11px] font-mono text-[#8B919C] block mb-1.5 uppercase">
                Geographic Market / Universe
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'all', label: 'Global (All)' },
                  { id: 'us', label: 'US Equities' },
                  { id: 'india', label: 'Indian (NSE / BSE)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onUpdateFilter('universe', item.id)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition ${
                      (filters.universe || 'all') === item.id
                        ? 'bg-[#151922] text-[#E8E9EB] border-[#7FA6C9] font-semibold'
                        : 'bg-[#0B0D10] border-[#252A33] text-[#8B919C] hover:border-[#8B919C]/40 hover:text-[#E8E9EB]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Market Cap Category */}
            <div>
              <label className="text-[11px] font-mono text-[#8B919C] block mb-1.5 uppercase">
                Market Cap Category
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {[
                  { id: 'all', label: 'All Caps' },
                  { id: 'mega', label: 'Mega >$200B' },
                  { id: 'large', label: 'Large $10B–$200B' },
                  { id: 'mid', label: 'Mid $2B–$10B' },
                  { id: 'small', label: 'Small $300M–$2B' },
                  { id: 'micro', label: 'Micro <$300M' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onUpdateFilter('marketCapCategory', item.id as MarketCapCategory)}
                    className={`py-1 px-1.5 rounded-md text-[11px] font-medium border text-center transition truncate ${
                      (filters.marketCapCategory || 'all') === item.id
                        ? 'bg-[#151922] text-[#E8E9EB] border-[#7FA6C9] font-semibold'
                        : 'bg-[#0B0D10] border-[#252A33] text-[#8B919C] hover:border-[#8B919C]/40 hover:text-[#E8E9EB]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exchanges filter chips */}
            {availableExchanges.length > 0 && (
              <div>
                <label className="text-[11px] font-mono text-[#8B919C] block mb-1.5 uppercase">
                  Exchanges
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableExchanges.map((ex) => {
                    const isSelected = filters.exchanges?.includes(ex);
                    return (
                      <button
                        key={ex}
                        onClick={() => handleExchangeToggle(ex)}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono border transition ${
                          isSelected
                            ? 'bg-[#151922] text-[#E8E9EB] border-[#7FA6C9]'
                            : 'bg-[#0B0D10] border-[#252A33] text-[#8B919C] hover:text-[#E8E9EB]'
                        }`}
                      >
                        {ex}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sectors filter chips */}
            {availableSectors.length > 0 && (
              <div>
                <label className="text-[11px] font-mono text-[#8B919C] block mb-1.5 uppercase">
                  Sectors
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableSectors.map((sec) => {
                    const isSelected = filters.sectors?.includes(sec);
                    return (
                      <button
                        key={sec}
                        onClick={() => handleSectorToggle(sec)}
                        className={`px-2 py-0.5 rounded text-xs border transition ${
                          isSelected
                            ? 'bg-[#151922] text-[#E8E9EB] border-[#7FA6C9] font-medium'
                            : 'bg-[#0B0D10] border-[#252A33] text-[#8B919C] hover:text-[#E8E9EB]'
                        }`}
                      >
                        {sec}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Valuation Multiples Group */}
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('valuation')}
          className="w-full px-4 py-3 flex items-center justify-between bg-[#151922] hover:bg-[#151922]/80 transition text-left"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-[#E8E9EB] tracking-wide">
            <CircleDollarSign className="w-4 h-4 text-[#7FA6C9]" />
            <span>VALUATION MULTIPLES</span>
          </div>
          {openSections.valuation ? (
            <ChevronUp className="w-4 h-4 text-[#8B919C]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#8B919C]" />
          )}
        </button>

        {openSections.valuation && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {renderRangeField('peRatio', 'Trailing P/E', '0', '35', '0.1', 'x')}
            {renderRangeField('forwardPe', 'Forward P/E', '0', '30', '0.1', 'x')}
            {renderRangeField('priceToBook', 'Price to Book (P/B)', '0', '5', '0.1', 'x')}
            {renderRangeField('priceToSales', 'Price to Sales (P/S)', '0', '10', '0.1', 'x')}
            {renderRangeField('evToEbitda', 'EV / EBITDA', '0', '25', '0.1', 'x')}
            {renderRangeField('dividendYield', 'Dividend Yield', '0', '10', '0.1', '%')}
            {renderRangeField('earningsYield', 'Earnings Yield (1/PE)', '0', '20', '0.1', '%')}
          </div>
        )}
      </div>

      {/* 3. Profitability & Returns Group */}
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('profitability')}
          className="w-full px-4 py-3 flex items-center justify-between bg-[#151922] hover:bg-[#151922]/80 transition text-left"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-[#E8E9EB] tracking-wide">
            <Percent className="w-4 h-4 text-[#7FA6C9]" />
            <span>PROFITABILITY, MARGINS & GROWTH</span>
          </div>
          {openSections.profitability ? (
            <ChevronUp className="w-4 h-4 text-[#8B919C]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#8B919C]" />
          )}
        </button>

        {openSections.profitability && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {renderRangeField('revenueGrowth', 'Revenue Growth (YoY)', '-20', '50', '0.1', '%')}
            {renderRangeField('grossMargin', 'Gross Margin', '0', '80', '0.1', '%')}
            {renderRangeField('operatingMargin', 'Operating Margin', '0', '40', '0.1', '%')}
            {renderRangeField('netMargin', 'Net Profit Margin', '0', '30', '0.1', '%')}
            {renderRangeField('returnOnEquity', 'Return on Equity (ROE)', '0', '40', '0.1', '%')}
            {renderRangeField('returnOnAssets', 'Return on Assets (ROA)', '0', '20', '0.1', '%')}
            {renderRangeField('eps', 'Diluted EPS', '0', '100', '0.1')}
            {renderRangeField('fcfMargin', 'Free Cash Flow Margin', '0', '40', '0.1', '%')}
          </div>
        )}
      </div>

      {/* 4. Financial Health & Solvency Group */}
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('health')}
          className="w-full px-4 py-3 flex items-center justify-between bg-[#151922] hover:bg-[#151922]/80 transition text-left"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-[#E8E9EB] tracking-wide">
            <ShieldCheck className="w-4 h-4 text-[#7FA6C9]" />
            <span>FINANCIAL HEALTH & BALANCE SHEET</span>
          </div>
          {openSections.health ? (
            <ChevronUp className="w-4 h-4 text-[#8B919C]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#8B919C]" />
          )}
        </button>

        {openSections.health && (
          <div className="p-4 space-y-3">
            <div className="text-[11px] text-[#8B919C] bg-[#151922] p-2.5 rounded-lg border border-[#252A33]">
              <span className="font-semibold text-[#E8E9EB]">Financial Institution Note:</span> Traditional industrial metrics like Debt/Equity or Current Ratio may be non-applicable or not reported for banks (e.g. JPM, HDFCBANK). Check "Inc. N/A" to include them.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {renderRangeField('debtToEquity', 'Debt to Equity', '0', '150', '1', '%')}
              {renderRangeField('currentRatio', 'Current Ratio', '0.5', '4', '0.1')}
              {renderRangeField('quickRatio', 'Quick Ratio', '0.5', '3', '0.1')}
            </div>
          </div>
        )}
      </div>

      {/* 5. Performance & Risk Group */}
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('performance')}
          className="w-full px-4 py-3 flex items-center justify-between bg-[#151922] hover:bg-[#151922]/80 transition text-left"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-[#E8E9EB] tracking-wide">
            <Activity className="w-4 h-4 text-[#7FA6C9]" />
            <span>PRICE ACTION & RISK METRICS</span>
          </div>
          {openSections.performance ? (
            <ChevronUp className="w-4 h-4 text-[#8B919C]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#8B919C]" />
          )}
        </button>

        {openSections.performance && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {renderRangeField('dayChangePercent', 'Daily Change', '-10', '10', '0.1', '%')}
            {renderRangeField('distFrom52wHigh', 'Distance from 52W High', '-50', '0', '1', '%')}
            {renderRangeField('beta', 'Beta (Volatility vs Index)', '0', '2.5', '0.1')}
          </div>
        )}
      </div>
    </div>
  );
};
