import React from 'react';
import type { MetricDefinition, NormalizedStock } from '../../types';
import { MetricTooltip } from './MetricTooltip';

interface ClickableMetricProps {
  metricKey: string;
  value?: number | string | null;
  formattedValue?: string;
  label?: string;
  showHelpIcon?: boolean;
  onMetricClick?: (def: MetricDefinition, rawValue?: any, formattedValue?: string) => void;
  className?: string;
  children?: React.ReactNode;
  stock?: Partial<NormalizedStock> | null;
}

export const ClickableMetric: React.FC<ClickableMetricProps> = ({
  metricKey,
  value,
  formattedValue,
  showHelpIcon = false,
  onMetricClick,
  className = '',
  children,
  stock,
}) => {
  return (
    <MetricTooltip
      metricKey={metricKey}
      value={value}
      formattedValue={formattedValue}
      stock={stock}
      onMetricClick={onMetricClick}
      showHelpIcon={showHelpIcon}
      className={className}
    >
      {children}
    </MetricTooltip>
  );
};

