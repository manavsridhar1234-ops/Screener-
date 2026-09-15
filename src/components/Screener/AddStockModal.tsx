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
      <div className="bg-[#121622] border border-[#1E2638] rounded-xl max-w-md w-full shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <PlusCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Add Ticker to Screener</h3>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Input any publicly listed company ticker symbol. EquityLens will immediately fetch fundamental data, valuation multiples, and market quotes from live market data providers.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
              Ticker Symbol
            </label>
            <input
              type="text"
              placeholder="e.g. MSFT, SHAKTIPUMP.NS, RELIANCE.NS, GOOGL"
              value={symbolInput}
              onChange={(e) => setSymbolInput(e.target.value)}
              className="w-full bg-[#0B0E14] border border-[#1E2638] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              autoFocus
            />
            <div className="mt-1.5 text-[11px] text-slate-400 font-mono">
              Tip: For NSE stocks use <code className="text-blue-400">.NS</code> (e.g. <code className="text-blue-400">SHAKTIPUMP.NS</code>), for BSE use <code className="text-blue-400">.BO</code>.
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-[#1A2234] border border-[#1E2638] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !symbolInput.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-semibold text-white transition shadow-sm"
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
