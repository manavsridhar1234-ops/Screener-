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
      <div className="bg-[#0E1217] border border-[#1F2633] rounded-xl p-12 text-center max-w-lg mx-auto space-y-3 shadow-xl shadow-black/20 font-sans">
        <div className="w-12 h-12 rounded-full bg-[#141820] border border-[#1F2633] text-[#F59E0B] flex items-center justify-center mx-auto shadow-sm">
          <Star className="w-5 h-5 fill-[#F59E0B]/20" />
        </div>
        <h3 className="text-sm font-semibold text-[#F0F2F5]">Your Watchlist is Empty</h3>
        <p className="text-xs text-[#8E98A8] leading-relaxed">
          Click the star icon next to any ticker in the Stock Screener or Stock Analysis pages to bookmark companies for rapid monitoring.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      <div className="bg-[#0E1217] border border-[#1F2633] rounded-xl p-4 sm:p-5 flex items-center justify-between shadow-xl shadow-black/20">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#F0F2F5]">Personal Watchlist</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1C1811] text-[#F59E0B] border border-[#F59E0B]/30 font-mono">
              {stocks.length} tracked
            </span>
          </div>
          <p className="text-xs text-[#8E98A8] mt-1">
            Bookmarked companies saved to your local browser storage.
          </p>
        </div>
      </div>

      <div className="bg-[#0E1217] border border-[#1F2633] rounded-xl overflow-x-auto shadow-xl shadow-black/20">
        {isLoading ? (
          <div className="p-8 text-center flex items-center justify-center gap-2 text-xs text-[#8E98A8]">
            <RefreshCw className="w-4 h-4 animate-spin text-[#38BDF8]" />
            Loading watchlist fundamentals...
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1F2633] bg-[#090B0E] text-[#8E98A8] font-mono text-[11px]">
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
            <tbody className="divide-y divide-[#1F2633]">
              {stocks.map((stock) => {
                const isPositive = (stock.dayChangePercent ?? 0) >= 0;
                const isCompared = compareList.includes(stock.symbol);
                return (
                  <tr key={stock.symbol} className="hover:bg-[#141820]/60 transition">
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => onSelectStock(stock.symbol)}
                        className="font-mono font-bold text-[#38BDF8] hover:underline"
                      >
                        {stock.symbol}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#F0F2F5] truncate max-w-[180px]">
                      {stock.companyName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#8E98A8]">
                      {stock.exchange}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#F0F2F5]">
                      {formatCurrency(stock.price, stock.currency, false)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      <span className={isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                        {formatPercent(stock.dayChangePercent)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#F0F2F5]">
                      {formatCurrency(stock.marketCap, stock.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#F0F2F5]">
                      {formatRatio(stock.peRatio)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#F0F2F5]">
                      {formatPercent(stock.revenueGrowth)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      <span className={
                        stock.returnOnEquity !== null && stock.returnOnEquity >= 15
                          ? 'text-[#10B981]'
                          : stock.returnOnEquity !== null && stock.returnOnEquity < 0
                          ? 'text-[#EF4444]'
                          : 'text-[#F0F2F5]'
                      }>
                        {formatPercent(stock.returnOnEquity, false)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#F0F2F5]">
                      {formatCurrency(stock.freeCashFlow, stock.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onToggleCompare(stock.symbol)}
                          title="Toggle Compare"
                          className={`p-1.5 rounded transition ${
                            isCompared
                              ? 'bg-[#161B26] text-[#38BDF8] border border-[#38BDF8]/40'
                              : 'text-[#8E98A8] hover:text-[#F0F2F5] hover:bg-[#141820]'
                          }`}
                        >
                          <Scale className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeFromWatchlist(stock.symbol)}
                          title="Remove from Watchlist"
                          className="p-1.5 rounded text-[#8E98A8] hover:text-[#EF4444] hover:bg-[#141820] transition"
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
