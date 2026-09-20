import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Calendar,
  Save,
  Check,
  TrendingUp,
  TrendingDown,
  HelpCircle,
  X,
} from 'lucide-react';
import type { NormalizedStock, InvestmentThesis } from '../../types';
import { getDefaultThesis } from '../../utils/institutionalAnalysis';

interface ThesisBuilderModalProps {
  stock: NormalizedStock;
  isOpen: boolean;
  onClose: () => void;
}

export const ThesisBuilderModal: React.FC<ThesisBuilderModalProps> = ({
  stock,
  isOpen,
  onClose,
}) => {
  const storageKey = `equitylens_thesis_${stock.symbol}`;
  const [thesis, setThesis] = useState<InvestmentThesis>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return getDefaultThesis(stock);
  });

  const [savedAlert, setSavedAlert] = useState(false);
  const [newBull, setNewBull] = useState('');
  const [newBear, setNewBear] = useState('');
  const [newChange, setNewChange] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setThesis(JSON.parse(saved));
      } else {
        setThesis(getDefaultThesis(stock));
      }
    } catch (e) {
      setThesis(getDefaultThesis(stock));
    }
  }, [stock.symbol]);

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      const updated = {
        ...thesis,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setThesis(updated);
      setSavedAlert(true);
      setTimeout(() => setSavedAlert(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const addBullItem = () => {
    if (!newBull.trim()) return;
    setThesis((prev) => ({ ...prev, bullCase: [...prev.bullCase, newBull.trim()] }));
    setNewBull('');
  };

  const removeBullItem = (idx: number) => {
    setThesis((prev) => ({
      ...prev,
      bullCase: prev.bullCase.filter((_, i) => i !== idx),
    }));
  };

  const addBearItem = () => {
    if (!newBear.trim()) return;
    setThesis((prev) => ({ ...prev, bearCase: [...prev.bearCase, newBear.trim()] }));
    setNewBear('');
  };

  const removeBearItem = (idx: number) => {
    setThesis((prev) => ({
      ...prev,
      bearCase: prev.bearCase.filter((_, i) => i !== idx),
    }));
  };

  const addChangeItem = () => {
    if (!newChange.trim()) return;
    setThesis((prev) => ({
      ...prev,
      changeMyView: [...prev.changeMyView, newChange.trim()],
    }));
    setNewChange('');
  };

  const removeChangeItem = (idx: number) => {
    setThesis((prev) => ({
      ...prev,
      changeMyView: prev.changeMyView.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#11141A] border border-[#252A33] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-[#252A33] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#151922] border border-[#252A33] text-[#7FA6C9]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-[#E8E9EB]">
                  Institutional Thesis Builder ({stock.symbol})
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#151922] border border-[#252A33] text-[#8B919C]">
                  Local Terminal Memo
                </span>
              </div>
              <p className="text-xs text-[#8B919C] mt-0.5">
                Document Bull/Bear hypotheses, falsification kill criteria, and forward catalysts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#151922] text-[#8B919C] hover:text-[#E8E9EB] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body scrollable */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Section 1: Bull Case */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-[#6FA58A] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Bull Case Hypotheses</span>
              </span>
              <span className="text-[10px] font-mono text-[#8B919C]">
                {thesis.bullCase.length} points
              </span>
            </div>

            <div className="space-y-2">
              {thesis.bullCase.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-[#151922]/40 border border-[#252A33] text-xs text-[#E8E9EB]"
                >
                  <span className="leading-relaxed">• {item}</span>
                  <button
                    onClick={() => removeBullItem(idx)}
                    className="text-[#8B919C] hover:text-[#B87878] p-0.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newBull}
                onChange={(e) => setNewBull(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addBullItem()}
                placeholder="Add bull case driver..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#0B0D10] border border-[#252A33] text-xs text-[#E8E9EB] placeholder:text-[#8B919C] focus:outline-none focus:border-[#7FA6C9]"
              />
              <button
                onClick={addBullItem}
                className="px-3 py-1.5 rounded-lg bg-[#151922] hover:bg-[#151922]/80 border border-[#252A33] text-xs font-mono text-[#E8E9EB] transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Section 2: Bear Case */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-[#B87878] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" />
                <span>Bear Case Risks & Headwinds</span>
              </span>
              <span className="text-[10px] font-mono text-[#8B919C]">
                {thesis.bearCase.length} risks
              </span>
            </div>

            <div className="space-y-2">
              {thesis.bearCase.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-[#151922]/40 border border-[#252A33] text-xs text-[#E8E9EB]"
                >
                  <span className="leading-relaxed">• {item}</span>
                  <button
                    onClick={() => removeBearItem(idx)}
                    className="text-[#8B919C] hover:text-[#B87878] p-0.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newBear}
                onChange={(e) => setNewBear(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addBearItem()}
                placeholder="Add downside risk / headwind..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#0B0D10] border border-[#252A33] text-xs text-[#E8E9EB] placeholder:text-[#8B919C] focus:outline-none focus:border-[#7FA6C9]"
              />
              <button
                onClick={addBearItem}
                className="px-3 py-1.5 rounded-lg bg-[#151922] hover:bg-[#151922]/80 border border-[#252A33] text-xs font-mono text-[#E8E9EB] transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Section 3: What Would Change My View (Kill Criteria) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-[#B8A36A] uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>What Would Change My View? (Kill Criteria)</span>
              </span>
              <span className="text-[10px] font-mono text-[#8B919C]">
                Falsification triggers
              </span>
            </div>

            <div className="space-y-2">
              {thesis.changeMyView.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-[#151922]/40 border border-[#252A33] text-xs text-[#E8E9EB]"
                >
                  <span className="leading-relaxed">⚠ {item}</span>
                  <button
                    onClick={() => removeChangeItem(idx)}
                    className="text-[#8B919C] hover:text-[#B87878] p-0.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newChange}
                onChange={(e) => setNewChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addChangeItem()}
                placeholder="Add thesis kill trigger (e.g., margins drop < 20%)..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#0B0D10] border border-[#252A33] text-xs text-[#E8E9EB] placeholder:text-[#8B919C] focus:outline-none focus:border-[#7FA6C9]"
              />
              <button
                onClick={addChangeItem}
                className="px-3 py-1.5 rounded-lg bg-[#151922] hover:bg-[#151922]/80 border border-[#252A33] text-xs font-mono text-[#E8E9EB] transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Section 4: Next Catalysts */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-medium text-[#8B919C] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#7FA6C9]" />
              <span>Forward Catalysts Calendar</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {thesis.nextCatalysts.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#0B0D10] border border-[#252A33] space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#E8E9EB] font-medium">{cat.date}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#151922] border border-[#252A33] text-[#8B919C]">
                      {cat.impactType}
                    </span>
                  </div>
                  <p className="text-xs text-[#8B919C] leading-snug">
                    {cat.event}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#252A33] flex items-center justify-between shrink-0 bg-[#0B0D10]">
          <div className="text-[11px] font-mono text-[#8B919C]">
            Last updated: {thesis.lastUpdated}
          </div>

          <div className="flex items-center gap-2">
            {savedAlert && (
              <span className="text-xs text-[#6FA58A] font-mono flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> Saved to Terminal!
              </span>
            )}
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-[#151922] hover:bg-[#151922]/80 text-[#E8E9EB] border border-[#252A33] text-xs font-medium font-mono flex items-center gap-1.5 transition shadow-sm"
            >
              <Save className="w-3.5 h-3.5 text-[#7FA6C9]" />
              <span>Save Thesis</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
