import React, { useState } from 'react';
import { X, PlusCircle, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { addStockToUniverse } from '../../services/api';
import type { NormalizedStock } from '../../types';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStockAdded: (stock: NormalizedStock) => void;
}

export const AddStockModal: React.FC<AddStockModalProps> = ({
  isOpen,
  onClose,
  onStockAdded,
}) => {
  const [symbolInput, setSymbolInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbolInput.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const stock = await addStockToUniverse(symbolInput.trim());
      setSuccessMsg(`Successfully added ${stock.symbol} (${stock.companyName}) to universe!`);
      onStockAdded(stock);
      setSymbolInput('');
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch or add stock to universe');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#11141A] border border-[#252A33] rounded-xl max-w-md w-full shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8B919C] hover:text-[#E8E9EB] p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#151922] border border-[#252A33] flex items-center justify-center text-[#7FA6C9]">
            <PlusCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-[#E8E9EB]">Add Ticker to Screener</h3>
        </div>

        <p className="text-xs text-[#8B919C] mb-4 leading-relaxed">
          Input any publicly listed company ticker symbol. EquityLens will immediately fetch fundamental data, valuation multiples, and market quotes from live market data providers.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-[#E8E9EB] mb-1.5">
              Ticker Symbol
            </label>
            <input
              type="text"
              placeholder="e.g. MSFT, SHAKTIPUMP.NS, RELIANCE.NS, GOOGL"
              value={symbolInput}
              onChange={(e) => setSymbolInput(e.target.value)}
              className="w-full bg-[#0B0D10] border border-[#252A33] rounded-lg px-3 py-2 text-sm text-[#E8E9EB] placeholder-[#8B919C] focus:outline-none focus:border-[#7FA6C9] font-mono"
              autoFocus
            />
            <div className="mt-1.5 text-[11px] text-[#8B919C] font-mono">
              Tip: For NSE stocks use <code className="text-[#7FA6C9]">.NS</code> (e.g. <code className="text-[#7FA6C9]">SHAKTIPUMP.NS</code>), for BSE use <code className="text-[#7FA6C9]">.BO</code>.
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-[#151922] border border-[#B87878]/60 text-[#B87878] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-[#151922] border border-[#6FA58A]/60 text-[#6FA58A] text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-[#8B919C] hover:text-[#E8E9EB] hover:bg-[#151922] border border-[#252A33] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !symbolInput.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#7FA6C9] hover:bg-[#7FA6C9]/90 disabled:opacity-50 text-xs font-semibold text-[#0B0D10] transition shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Fetching Fundamentals...
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add Stock
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
