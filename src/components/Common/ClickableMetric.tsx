import React from 'react';
import { HelpCircle } from 'lucide-react';
import { METRIC_DEFINITIONS } from '../../data/metricDefinitions';
import type { MetricDefinition } from '../../types';

interface ClickableMetricProps {
  metricKey: string;
  value?: number | string | null;
  formattedValue?: string;
  label?: string;
  showHelpIcon?: boolean;
  onMetricClick: (def: MetricDefinition, rawValue?: any, formattedValue?: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export const ClickableMetric: React.FC<ClickableMetricProps> = ({
  metricKey,
  value,
  formattedValue,
  label,
  showHelpIcon = false,
  onMetricClick,
  className = '',
  children,
}) => {
  const def = METRIC_DEFINITIONS[metricKey];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (def) {
      onMetricClick(def, value, formattedValue);
    }
  };

  if (!def) {
    return <span className={className}>{children || formattedValue || value}</span>;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={`Click to inspect ${def.name} calculation & benchmark`}
      className={`group/metric inline-flex items-center gap-1 text-left cursor-pointer transition-colors border-b border-dashed border-slate-700/80 hover:border-sky-400/80 hover:text-sky-300 focus:outline-none ${className}`}
    >
      <span>{children || formattedValue || (value !== null && value !== undefined ? String(value) : '—')}</span>
      {showHelpIcon && (
        <HelpCircle className="w-3 h-3 text-slate-500 opacity-0 group-hover/metric:opacity-100 transition-opacity" />
      )}
    </button>
  );
};
