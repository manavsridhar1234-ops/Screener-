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
    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-[#1F2633]">
      <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono font-medium text-[#8E98A8] shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
        <span className="tracking-wider uppercase">STRATEGY PRESETS:</span>
      </div>

      <button
        id="preset-all-btn"
        onClick={onClearPreset}
        className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition ${
          activePresetId === null
            ? 'bg-gradient-to-r from-[#38BDF8] to-[#0284C7] text-[#090B0E] font-semibold shadow-md shadow-[#38BDF8]/20'
            : 'bg-[#141820] text-[#8E98A8] hover:bg-[#1A202C] hover:text-[#F0F2F5] border border-[#1F2633]'
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
                ? 'bg-gradient-to-r from-[#38BDF8] to-[#0284C7] text-[#090B0E] shadow-md shadow-[#38BDF8]/20 font-semibold'
                : 'bg-[#141820] text-[#8E98A8] hover:bg-[#1A202C] hover:text-[#F0F2F5] border border-[#1F2633]'
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
