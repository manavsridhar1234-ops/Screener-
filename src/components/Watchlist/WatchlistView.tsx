import React, { useState, useEffect } from 'react';
import {
  Star,
  Trash2,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Scale,
  RefreshCw,
} from 'lucide-react';
import type { NormalizedStock } from '../../types';
import { fetchStockFundamentals } from '../../services/api';
import { useWatchlist } from '../../context/WatchlistContext';
import {
  formatCurrency,
  formatPercent,
  formatRatio,
} from '../../utils/formatters';

interface WatchlistViewProps {
  onSelectStock: (symbol: string) => void;
  onToggleCompare: (symbol: string) => void;
  compareList: string[];
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  onSelectStock,
  onToggleCompare,
  compareList,
}) => {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const [stocks, setStocks] = useState<NormalizedStock[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (watchlist.length === 0) {
      setStocks([]);
      return;
    }

    setIsLoading(true);
    Promise.all(watchlist.map((s) => fetchStockFundamentals(s).catch(() => null)))
      .then((res) => {
        setStocks(res.filter(Boolean) as NormalizedStock[]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [watchlist]);

  if (watchlist.length === 0) {
    return (
      <div className="bg-[#121622] border border-[#1E2638] rounded-xl p-12 text-center max-w-lg mx-auto space-y-3">
        <div className="w-12 h-12 rounded-full bg-amber-950/40 text-amber-400 flex items-center justify-center mx-auto">
          <Star className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white">Your Watchlist is Empty</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Click the star icon next to any ticker in the Stock Screener or Stock Analysis pages to bookmark companies for rapid monitoring.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#121622] border border-[#1E2638] rounded-xl p-4 flex items-center justify-between shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">Personal Watchlist</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/60 font-mono">
              {stocks.length} tracked
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Bookmarked companies saved to your local browser storage.
          </p>
        </div>
      </div>

      <div className="bg-[#121622] border border-[#1E2638] rounded-xl overflow-x-auto shadow-xl">
        {isLoading ? (
          <div className="p-8 text-center flex items-center justify-center gap-2 text-xs text-slate-400">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            Loading watchlist fundamentals...
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E2638] bg-[#0E131E] text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-3">Ticker</th>
                <th className="py-3 px-3">Company</th>
                <th className="py-3 px-3">Exchange</th>
                <th className="py-3 px-3 text-right">Price</th>
                <th className="py-3 px-3 text-right">1D Change</th>
                <th className="py-3 px-3 text-right">Market Cap</th>
                <th className="py-3 px-3 text-right">P/E (TTM)</th>
                <th className="py-3 px-3 text-right">Rev Growth</th>
                <th className="py-3 px-3 text-right">ROE</th>
                <th className="py-3 px-3 text-right">FCF</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2234]">
              {stocks.map((stock) => {
                const isPositive = (stock.dayChangePercent ?? 0) >= 0;
                const isCompared = compareList.includes(stock.symbol);
                return (
                  <tr key={stock.symbol} className="hover:bg-[#161D2C] transition">
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => onSelectStock(stock.symbol)}
                        className="font-mono font-bold text-blue-400 hover:underline"
                      >
                        {stock.symbol}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-200 truncate max-w-[180px]">
                      {stock.companyName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      {stock.exchange}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-white">
                      {formatCurrency(stock.price, stock.currency, false)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                        {formatPercent(stock.dayChangePercent)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                      {formatCurrency(stock.marketCap, stock.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                      {formatRatio(stock.peRatio)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                      {formatPercent(stock.revenueGrowth)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-semibold">
                      {formatPercent(stock.returnOnEquity, false)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                      {formatCurrency(stock.freeCashFlow, stock.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onToggleCompare(stock.symbol)}
                          title="Toggle Compare"
                          className={`p-1.5 rounded transition ${
                            isCompared
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:text-white hover:bg-[#1E2638]'
                          }`}
                        >
                          <Scale className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeFromWatchlist(stock.symbol)}
                          title="Remove from Watchlist"
                          className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-[#1E2638] transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
