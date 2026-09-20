import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  Scale,
  Star,
  Sparkles,
  Command,
  X,
} from 'lucide-react';
import type { NormalizedStock } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStock: (symbol: string) => void;
  onNavigate?: (view: 'screener' | 'compare' | 'watchlist') => void;
  onNavigateView?: (view: 'screener' | 'compare' | 'watchlist') => void;
  onApplyPreset?: (presetId: string) => void;
  stocks?: NormalizedStock[];
  stocksList?: NormalizedStock[];
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectStock,
  onNavigate,
  onNavigateView,
  onApplyPreset,
  stocks,
  stocksList,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const effectiveStocks = stocks || stocksList || [];
  const handleNavigate = onNavigate || onNavigateView || (() => {});

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle keyboard navigation & escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Filter stocks matching query
  const matchedStocks = trimmed
    ? effectiveStocks
        .filter(
          (s) =>
            s.symbol.toLowerCase().includes(trimmed) ||
            s.companyName.toLowerCase().includes(trimmed) ||
            (s.sector && s.sector.toLowerCase().includes(trimmed))
        )
        .slice(0, 6)
    : effectiveStocks.slice(0, 4);

  // Command shortcuts
  const commands = [
    {
      id: 'screener',
      label: 'Open Screener & Query Builder',
      category: 'Navigation',
      icon: SlidersHorizontal,
      action: () => {
        handleNavigate('screener');
        onClose();
      },
    },
    {
      id: 'compare',
      label: 'Compare Multiple Stocks',
      category: 'Navigation',
      icon: Scale,
      action: () => {
        handleNavigate('compare');
        onClose();
      },
    },
    {
      id: 'watchlist',
      label: 'View Watchlist',
      category: 'Navigation',
      icon: Star,
      action: () => {
        handleNavigate('watchlist');
        onClose();
      },
    },
  ];

  const presets = [
    { id: 'quality', label: 'Screen: Quality Compounders (High ROE, Low Debt)', tag: 'Quality' },
    { id: 'growth', label: 'Screen: High Growth Tech & Semi Compounders', tag: 'Growth' },
    { id: 'value', label: 'Screen: Deep Value & Cash Flow Leaders', tag: 'Value' },
    { id: 'dividend', label: 'Screen: High Dividend Yielders (> 2%)', tag: 'Yield' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center pt-16 sm:pt-24 p-4 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="bg-[#11141A] border border-[#252A33] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl space-y-0">
        {/* Search input bar */}
        <div className="p-3.5 border-b border-[#252A33] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#8B919C] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a stock ticker (e.g. AMD, NVDA, AAPL), view, or screen..."
            className="w-full bg-transparent text-sm text-[#E8E9EB] placeholder:text-[#8B919C] focus:outline-none font-sans"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-[#151922] text-[10px] font-mono text-[#8B919C] border border-[#252A33]">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Matching Stocks */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8B919C] px-3 py-1">
              Stocks & Tickers
            </div>
            <div className="space-y-1">
              {matchedStocks.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => {
                    onSelectStock(s.symbol);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#151922] text-left transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs text-[#E8E9EB] bg-[#151922] border border-[#252A33] px-2 py-0.5 rounded">
                      {s.symbol}
                    </span>
                    <div>
                      <div className="text-xs text-[#E8E9EB] font-medium group-hover:text-white truncate max-w-[240px]">
                        {s.companyName}
                      </div>
                      <div className="text-[10px] font-mono text-[#8B919C]">
                        {s.sector || 'Equities'} • {s.exchange}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-xs font-semibold text-[#E8E9EB]">
                      {formatCurrency(s.price, s.currency, false)}
                    </div>
                    <div
                      className={`text-[10px] font-mono ${
                        (s.dayChangePercent ?? 0) >= 0
                          ? 'text-[#6FA58A]'
                          : 'text-[#B87878]'
                      }`}
                    >
                      {(s.dayChangePercent ?? 0) >= 0 ? '+' : ''}
                      {s.dayChangePercent?.toFixed(2)}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Commands */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8B919C] px-3 py-1">
              Terminal Views
            </div>
            <div className="space-y-1">
              {commands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#151922] text-left transition group text-xs text-[#8B919C] hover:text-[#E8E9EB]"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#7FA6C9] group-hover:text-[#E8E9EB]" />
                      <span>{cmd.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8B919C] group-hover:text-[#E8E9EB]" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Institutional Screener Presets */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8B919C] px-3 py-1">
              Institutional Screener Presets
            </div>
            <div className="space-y-1">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    handleNavigate('screener');
                    if (onApplyPreset) onApplyPreset(p.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#151922] text-left transition group text-xs text-[#8B919C] hover:text-[#E8E9EB]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151922] text-[#8B919C] border border-[#252A33]">
                      {p.tag}
                    </span>
                    <span>{p.label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8B919C] group-hover:text-[#E8E9EB]" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-[#252A33] bg-[#0B0D10] flex items-center justify-between text-[10px] font-mono text-[#8B919C] px-4">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#151922] border border-[#252A33] text-[#8B919C]">↑↓</kbd>
            <span>to navigate</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#151922] border border-[#252A33] text-[#8B919C]">Enter</kbd>
            <span>to select</span>
          </div>
          <span>EquityLens Terminal</span>
        </div>
      </div>
    </div>
  );
};
