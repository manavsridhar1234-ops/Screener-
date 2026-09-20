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
    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-[#252A33]">
      <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono font-medium text-[#8B919C] shrink-0">
        <Sparkles className="w-3 h-3 text-[#7FA6C9]" />
        <span>STRATEGY PRESETS:</span>
      </div>

      <button
        id="preset-all-btn"
        onClick={onClearPreset}
        className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition ${
          activePresetId === null
            ? 'bg-[#7FA6C9] text-[#0B0D10] font-semibold shadow-sm'
            : 'bg-[#151922] text-[#8B919C] hover:bg-[#151922]/80 hover:text-[#E8E9EB] border border-[#252A33]'
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
                ? 'bg-[#7FA6C9] text-[#0B0D10] shadow-sm font-semibold'
                : 'bg-[#151922] text-[#8B919C] hover:bg-[#151922]/80 hover:text-[#E8E9EB] border border-[#252A33]'
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
