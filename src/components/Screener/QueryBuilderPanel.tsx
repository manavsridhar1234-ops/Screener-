import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Play,
  Save,
  RotateCcw,
  Sparkles,
  Check,
  Bookmark,
  ChevronDown,
  X,
} from 'lucide-react';
import type { ScreenerFilters, SavedScreen, FilterRange } from '../../types';

export interface QueryRule {
  id: string;
  field: keyof ScreenerFilters | 'netCash' | 'roic' | 'altmanZ';
  operator: '>' | '<' | '>=' | '<=' | 'between';
  value: number;
  value2?: number;
  label: string;
  unit: string;
}

interface QueryBuilderPanelProps {
  onApplyQuery: (filters: Partial<ScreenerFilters>) => void;
  onClose?: () => void;
}

const AVAILABLE_FIELDS: {
  field: QueryRule['field'];
  label: string;
  unit: string;
  category: string;
  defaultVal: number;
}[] = [
  { field: 'marketCap', label: 'Market Cap', unit: '$B', category: 'Universe', defaultVal: 10 },
  { field: 'peRatio', label: 'Trailing P/E', unit: 'x', category: 'Valuation', defaultVal: 20 },
  { field: 'forwardPe', label: 'Forward P/E', unit: 'x', category: 'Valuation', defaultVal: 25 },
  { field: 'priceToBook', label: 'Price to Book (P/B)', unit: 'x', category: 'Valuation', defaultVal: 3 },
  { field: 'priceToSales', label: 'Price to Sales (P/S)', unit: 'x', category: 'Valuation', defaultVal: 5 },
  { field: 'evToEbitda', label: 'EV / EBITDA', unit: 'x', category: 'Valuation', defaultVal: 18 },
  { field: 'dividendYield', label: 'Dividend Yield', unit: '%', category: 'Valuation', defaultVal: 2 },
  { field: 'revenueGrowth', label: 'Revenue Growth (YoY)', unit: '%', category: 'Growth', defaultVal: 15 },
  { field: 'operatingMargin', label: 'Operating Margin', unit: '%', category: 'Profitability', defaultVal: 15 },
  { field: 'grossMargin', label: 'Gross Margin', unit: '%', category: 'Profitability', defaultVal: 40 },
  { field: 'netMargin', label: 'Net Profit Margin', unit: '%', category: 'Profitability', defaultVal: 10 },
  { field: 'returnOnEquity', label: 'Return on Equity (ROE)', unit: '%', category: 'Profitability', defaultVal: 15 },
  { field: 'debtToEquity', label: 'Debt to Equity', unit: '%', category: 'Balance Sheet', defaultVal: 50 },
  { field: 'currentRatio', label: 'Current Ratio', unit: 'x', category: 'Balance Sheet', defaultVal: 1.3 },
  { field: 'fcfMargin', label: 'FCF Margin', unit: '%', category: 'Cash Flow', defaultVal: 12 },
];

export const QueryBuilderPanel: React.FC<QueryBuilderPanelProps> = ({
  onApplyQuery,
  onClose,
}) => {
  const [combinator, setCombinator] = useState<'AND' | 'OR'>('AND');
  const [rules, setRules] = useState<QueryRule[]>([
    {
      id: '1',
      field: 'marketCap',
      operator: '>=',
      value: 10,
      label: 'Market Cap',
      unit: '$B',
    },
    {
      id: '2',
      field: 'revenueGrowth',
      operator: '>=',
      value: 15,
      label: 'Revenue Growth (YoY)',
      unit: '%',
    },
    {
      id: '3',
      field: 'returnOnEquity',
      operator: '>=',
      value: 15,
      label: 'Return on Equity (ROE)',
      unit: '%',
    },
    {
      id: '4',
      field: 'debtToEquity',
      operator: '<=',
      value: 60,
      label: 'Debt to Equity',
      unit: '%',
    },
  ]);

  const [savedScreens, setSavedScreens] = useState<SavedScreen[]>(() => {
    try {
      const saved = localStorage.getItem('equitylens_saved_screens');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [screenName, setScreenName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const addRule = () => {
    const nextField = AVAILABLE_FIELDS[rules.length % AVAILABLE_FIELDS.length];
    setRules((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        field: nextField.field,
        operator: '>=',
        value: nextField.defaultVal,
        label: nextField.label,
        unit: nextField.unit,
      },
    ]);
  };

  const removeRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRuleField = (id: string, newFieldKey: QueryRule['field']) => {
    const fieldDef = AVAILABLE_FIELDS.find((f) => f.field === newFieldKey);
    if (!fieldDef) return;
    setRules((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              field: newFieldKey,
              label: fieldDef.label,
              unit: fieldDef.unit,
              value: fieldDef.defaultVal,
            }
          : r
      )
    );
  };

  const updateRuleValue = (id: string, val: number) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, value: val } : r))
    );
  };

  const updateRuleOperator = (id: string, op: QueryRule['operator']) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, operator: op } : r))
    );
  };

  const executeQuery = () => {
    const generatedFilters: Partial<ScreenerFilters> = {};

    rules.forEach((rule) => {
      const fieldKey = rule.field as keyof ScreenerFilters;
      let min: number | null = null;
      let max: number | null = null;

      // Handle billion scaling for Market Cap
      let numericalVal = rule.value;
      if (rule.field === 'marketCap') {
        numericalVal = rule.value * 1_000_000_000;
      }

      if (rule.operator === '>' || rule.operator === '>=') {
        min = numericalVal;
      } else if (rule.operator === '<' || rule.operator === '<=') {
        max = numericalVal;
      } else if (rule.operator === 'between') {
        min = numericalVal;
        max = rule.value2 ?? numericalVal * 2;
      }

      (generatedFilters as any)[fieldKey] = {
        min,
        max,
        includeMissing: false,
      };
    });

    onApplyQuery(generatedFilters);
  };

  const handleSaveScreen = () => {
    if (!screenName.trim()) return;
    const newScreen: SavedScreen = {
      id: Math.random().toString(),
      name: screenName.trim(),
      description: `${rules.length} conditions (${combinator} logic)`,
      rulesCount: rules.length,
      filters: {},
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newScreen, ...savedScreens];
    setSavedScreens(updated);
    try {
      localStorage.setItem('equitylens_saved_screens', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setScreenName('');
    setShowSaveInput(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const loadPreset = (presetName: string) => {
    if (presetName === 'compounders') {
      setRules([
        { id: '1', field: 'marketCap', operator: '>=', value: 10, label: 'Market Cap', unit: '$B' },
        { id: '2', field: 'revenueGrowth', operator: '>=', value: 12, label: 'Revenue Growth (YoY)', unit: '%' },
        { id: '3', field: 'returnOnEquity', operator: '>=', value: 18, label: 'Return on Equity (ROE)', unit: '%' },
        { id: '4', field: 'debtToEquity', operator: '<=', value: 40, label: 'Debt to Equity', unit: '%' },
      ]);
    } else if (presetName === 'fcf') {
      setRules([
        { id: '1', field: 'fcfMargin', operator: '>=', value: 15, label: 'FCF Margin', unit: '%' },
        { id: '2', field: 'operatingMargin', operator: '>=', value: 15, label: 'Operating Margin', unit: '%' },
        { id: '3', field: 'peRatio', operator: '<=', value: 30, label: 'Trailing P/E', unit: 'x' },
      ]);
    } else if (presetName === 'value') {
      setRules([
        { id: '1', field: 'peRatio', operator: '<=', value: 18, label: 'Trailing P/E', unit: 'x' },
        { id: '2', field: 'priceToBook', operator: '<=', value: 2.5, label: 'Price to Book (P/B)', unit: 'x' },
        { id: '3', field: 'dividendYield', operator: '>=', value: 2.0, label: 'Dividend Yield', unit: '%' },
        { id: '4', field: 'netMargin', operator: '>=', value: 8, label: 'Net Profit Margin', unit: '%' },
      ]);
    }
  };

  return (
    <div className="bg-[#101522] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Institutional Query Builder & Logic Engine
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Construct granular multi-factor Boolean queries across financial statements and metrics.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Fast Templates:</span>
          <button
            onClick={() => loadPreset('compounders')}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-800 transition"
          >
            Quality Compounders
          </button>
          <button
            onClick={() => loadPreset('fcf')}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-800 transition"
          >
            FCF Generators
          </button>
          <button
            onClick={() => loadPreset('value')}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-800 transition"
          >
            Deep Value
          </button>
        </div>
      </div>

      {/* Logic Combinator Bar */}
      <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
        <span>Match</span>
        <div className="inline-flex rounded-lg p-0.5 bg-slate-950 border border-slate-800">
          <button
            onClick={() => setCombinator('AND')}
            className={`px-3 py-1 rounded text-xs font-bold transition ${
              combinator === 'AND'
                ? 'bg-slate-800 text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            ALL (AND)
          </button>
          <button
            onClick={() => setCombinator('OR')}
            className={`px-3 py-1 rounded text-xs font-bold transition ${
              combinator === 'OR'
                ? 'bg-slate-800 text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            ANY (OR)
          </button>
        </div>
        <span>of the following {rules.length} conditions:</span>
      </div>

      {/* Rules Stack */}
      <div className="space-y-2.5">
        {rules.map((rule, idx) => (
          <div
            key={rule.id}
            className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80"
          >
            <span className="font-mono text-xs text-slate-500 w-6 shrink-0">
              #{idx + 1}
            </span>

            {/* Field Dropdown */}
            <select
              value={rule.field}
              onChange={(e) => updateRuleField(rule.id, e.target.value as any)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-slate-700"
            >
              {AVAILABLE_FIELDS.map((f) => (
                <option key={f.field} value={f.field}>
                  {f.label} ({f.category})
                </option>
              ))}
            </select>

            {/* Operator */}
            <select
              value={rule.operator}
              onChange={(e) => updateRuleOperator(rule.id, e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-slate-700"
            >
              <option value=">=">&gt;= (Greater or equal)</option>
              <option value="<=">&lt;= (Less or equal)</option>
              <option value=">">&gt; (Greater than)</option>
              <option value="<">&lt; (Less than)</option>
            </select>

            {/* Numerical Input */}
            <div className="flex items-center gap-1.5 flex-1 max-w-[200px]">
              <input
                type="number"
                value={rule.value}
                onChange={(e) => updateRuleValue(rule.id, parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-slate-700"
              />
              <span className="text-xs font-mono text-slate-400 w-8 shrink-0">
                {rule.unit}
              </span>
            </div>

            {/* Remove Rule */}
            <button
              onClick={() => removeRule(rule.id)}
              className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-500 hover:text-rose-400 transition self-end sm:self-auto"
              title="Remove condition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={addRule}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-300 border border-slate-800 transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Condition</span>
          </button>

          {!showSaveInput ? (
            <button
              onClick={() => setShowSaveInput(true)}
              className="px-3 py-1.5 rounded-lg hover:bg-slate-900 text-xs font-mono text-slate-400 hover:text-slate-200 transition flex items-center gap-1"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save Screen</span>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={screenName}
                onChange={(e) => setScreenName(e.target.value)}
                placeholder="Screen name..."
                className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
              />
              <button
                onClick={handleSaveScreen}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-white font-mono"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveInput(false)}
                className="p-1 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <Check className="w-3 h-3" /> Saved!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={executeQuery}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition shadow"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Execute Query ({rules.length} Rules)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
