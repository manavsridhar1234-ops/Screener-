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
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl p-12 text-center max-w-lg mx-auto space-y-3 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-[#151922] border border-[#252A33] text-[#B8A36A] flex items-center justify-center mx-auto">
          <Star className="w-5 h-5 fill-[#B8A36A]/20" />
        </div>
        <h3 className="text-sm font-semibold text-[#E8E9EB]">Your Watchlist is Empty</h3>
        <p className="text-xs text-[#8B919C] leading-relaxed">
          Click the star icon next to any ticker in the Stock Screener or Stock Analysis pages to bookmark companies for rapid monitoring.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#E8E9EB]">Personal Watchlist</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#151922] text-[#B8A36A] border border-[#252A33] font-mono">
              {stocks.length} tracked
            </span>
          </div>
          <p className="text-xs text-[#8B919C] mt-0.5">
            Bookmarked companies saved to your local browser storage.
          </p>
        </div>
      </div>

      <div className="bg-[#11141A] border border-[#252A33] rounded-xl overflow-x-auto shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center flex items-center justify-center gap-2 text-xs text-[#8B919C]">
            <RefreshCw className="w-4 h-4 animate-spin text-[#7FA6C9]" />
            Loading watchlist fundamentals...
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#252A33] bg-[#0B0D10] text-[#8B919C] font-mono text-[11px]">
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
            <tbody className="divide-y divide-[#252A33]">
              {stocks.map((stock) => {
                const isPositive = (stock.dayChangePercent ?? 0) >= 0;
                const isCompared = compareList.includes(stock.symbol);
                return (
                  <tr key={stock.symbol} className="hover:bg-[#151922]/60 transition">
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => onSelectStock(stock.symbol)}
                        className="font-mono font-medium text-[#7FA6C9] hover:underline"
                      >
                        {stock.symbol}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#E8E9EB] truncate max-w-[180px]">
                      {stock.companyName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#8B919C]">
                      {stock.exchange}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-[#E8E9EB]">
                      {formatCurrency(stock.price, stock.currency, false)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      <span className={isPositive ? 'text-[#6FA58A]' : 'text-[#B87878]'}>
                        {formatPercent(stock.dayChangePercent)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#E8E9EB]">
                      {formatCurrency(stock.marketCap, stock.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#E8E9EB]">
                      {formatRatio(stock.peRatio)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#E8E9EB]">
                      {formatPercent(stock.revenueGrowth)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      <span className={
                        stock.returnOnEquity !== null && stock.returnOnEquity >= 15
                          ? 'text-[#6FA58A]'
                          : stock.returnOnEquity !== null && stock.returnOnEquity < 0
                          ? 'text-[#B87878]'
                          : 'text-[#E8E9EB]'
                      }>
                        {formatPercent(stock.returnOnEquity, false)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#E8E9EB]">
                      {formatCurrency(stock.freeCashFlow, stock.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onToggleCompare(stock.symbol)}
                          title="Toggle Compare"
                          className={`p-1.5 rounded transition ${
                            isCompared
                              ? 'bg-[#151922] text-[#7FA6C9] border border-[#252A33]'
                              : 'text-[#8B919C] hover:text-[#E8E9EB] hover:bg-[#151922]'
                          }`}
                        >
                          <Scale className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeFromWatchlist(stock.symbol)}
                          title="Remove from Watchlist"
                          className="p-1.5 rounded text-[#8B919C] hover:text-[#B87878] hover:bg-[#151922] transition"
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
