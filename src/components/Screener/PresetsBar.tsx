import React from 'react';
import type { ScreenerPreset, ScreenerFilters } from '../../types';
import { Sparkles, Check } from 'lucide-react';

interface PresetsBarProps {
  presets: ScreenerPreset[];
  activePresetId: string | null;
  onSelectPreset: (preset: ScreenerPreset) => void;
  onClearPreset: () => void;
}

export const PresetsBar: React.FC<PresetsBarProps> = ({
  presets,
  activePresetId,
  onSelectPreset,
  onClearPreset,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-[#1E2638]">
      <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono font-medium text-slate-400 shrink-0">
        <Sparkles className="w-3 h-3 text-amber-400" />
        <span>STRATEGY PRESETS:</span>
      </div>

      <button
        id="preset-all-btn"
        onClick={onClearPreset}
        className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition ${
          activePresetId === null
            ? 'bg-blue-600 text-white font-semibold shadow-sm'
            : 'bg-[#121622] text-slate-300 hover:bg-[#1A2234] border border-[#1E2638]'
        }`}
      >
        All Equities
      </button>

      {presets.map((preset) => {
        const isActive = activePresetId === preset.id;
        return (
          <button
            key={preset.id}
            id={`preset-btn-${preset.id}`}
            onClick={() => onSelectPreset(preset)}
            title={preset.description}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium shrink-0 transition ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400 font-semibold'
                : 'bg-[#121622] text-slate-300 hover:bg-[#1A2234] hover:text-white border border-[#1E2638]'
            }`}
          >
            {isActive && <Check className="w-3 h-3" />}
            <span>{preset.name}</span>
          </button>
        );
      })}
    </div>
  );
};
