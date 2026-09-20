import React from 'react';
import { Sparkles, TrendingUp, TrendingDown, Clock, ShieldCheck, X } from 'lucide-react';
import type { NormalizedStock } from '../../types';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { explainStockDailyMove } from '../../utils/institutionalAnalysis';

interface ExplainMoveModalProps {
  stock: NormalizedStock;
  isOpen: boolean;
  onClose: () => void;
}

export const ExplainMoveModal: React.FC<ExplainMoveModalProps> = ({
  stock,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const { dayChangePercent, isPositive, drivers, sourceAttribution } =
    explainStockDailyMove(stock);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#11141A] border border-[#252A33] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl space-y-4 p-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#252A33] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#151922] border border-[#252A33] text-[#7FA6C9]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-[#E8E9EB]">
                  Why is {stock.symbol} Moving Today?
                </h3>
                <span
                  className={`font-mono text-xs font-medium px-2 py-0.5 rounded flex items-center gap-0.5 border border-[#252A33] ${
                    isPositive
                      ? 'bg-[#151922] text-[#6FA58A]'
                      : 'bg-[#151922] text-[#B87878]'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {dayChangePercent >= 0 ? '+' : ''}
                  {dayChangePercent.toFixed(2)}%
                </span>
              </div>
              <div className="text-[11px] text-[#8B919C] font-mono mt-0.5">
                Current Price: {formatCurrency(stock.price, stock.currency, false)} | Sector: {stock.sector || 'Equities'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#151922] text-[#8B919C] hover:text-[#E8E9EB] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drivers Breakdown */}
        <div className="space-y-3 pt-1">
          <span className="text-[11px] font-mono text-[#8B919C] uppercase tracking-wider block">
            Synthesized Catalysts & Order Flow Drivers:
          </span>

          <div className="space-y-2.5">
            {drivers.map((driver, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#0B0D10] border border-[#252A33] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#E8E9EB]">
                    {driver.headline}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#151922] text-[#8B919C] border border-[#252A33]">
                    {driver.category}
                  </span>
                </div>
                <p className="text-xs text-[#8B919C] leading-relaxed">
                  {driver.explanation}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#8B919C] pt-1 border-t border-[#252A33]">
                  <span>Source: {driver.source}</span>
                  <span>{driver.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#252A33] flex items-center justify-between text-[11px] font-mono text-[#8B919C]">
          <span>{sourceAttribution}</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#151922] hover:bg-[#151922]/80 text-[#E8E9EB] border border-[#252A33] font-medium transition text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
