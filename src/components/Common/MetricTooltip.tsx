import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  HelpCircle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { METRIC_DEFINITIONS } from '../../data/metricDefinitions';
import { getMetricInterpretation, MetricInterpretation } from '../../utils/metricInterpretation';
import type { MetricDefinition, NormalizedStock } from '../../types';

interface MetricTooltipProps {
  metricKey: string;
  value?: number | string | null;
  formattedValue?: string;
  stock?: Partial<NormalizedStock> | null;
  onMetricClick?: (def: MetricDefinition, rawValue?: any, formattedValue?: string) => void;
  showHelpIcon?: boolean;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  underlined?: boolean;
}

export const MetricTooltip: React.FC<MetricTooltipProps> = ({
  metricKey,
  value,
  formattedValue,
  stock,
  onMetricClick,
  showHelpIcon = false,
  className = '',
  children,
  disabled = false,
  underlined = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placeAbove: boolean }>({
    top: 0,
    left: 0,
    placeAbove: true,
  });

  const anchorRef = useRef<HTMLDivElement | HTMLButtonElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const enterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const def: MetricDefinition | undefined = METRIC_DEFINITIONS[metricKey];
  const interpretation: MetricInterpretation | null = def
    ? getMetricInterpretation(metricKey, value, stock)
    : null;

  // Calculate coordinates relative to viewport
  const updatePosition = useCallback(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const cardWidth = 350;
    const estimatedHeight = 310;
    const padding = 12;

    // Determine vertical placement
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placeAbove = spaceBelow < estimatedHeight && spaceAbove >= estimatedHeight;

    let top = placeAbove ? rect.top - 8 : rect.bottom + 8;

    // Horizontal centering with screen edge boundaries
    let left = rect.left + rect.width / 2 - cardWidth / 2;
    if (left < padding) left = padding;
    if (left + cardWidth > window.innerWidth - padding) {
      left = window.innerWidth - cardWidth - padding;
    }

    setCoords({ top, left, placeAbove });
  }, []);

  const handleMouseEnter = () => {
    if (disabled || !def) return;
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    enterTimerRef.current = setTimeout(() => {
      updatePosition();
      setIsOpen(true);
    }, 120);
  };

  const handleMouseLeave = () => {
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    leaveTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  const handleCardMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const handleCardMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  // Close on window resize or scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleScrollOrResize = () => {
      updatePosition();
    };
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (!def) return;
    if (onMetricClick) {
      e.stopPropagation();
      onMetricClick(def, value, formattedValue);
    }
  };

  if (!def) {
    return <span className={className}>{children || formattedValue || value}</span>;
  }

  // Category styling
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'valuation':
        return 'text-[#7FA6C9] bg-[#151922] border-[#252A33]';
      case 'profitability':
        return 'text-[#6FA58A] bg-[#151922] border-[#252A33]';
      case 'growth':
        return 'text-[#7FA6C9] bg-[#151922] border-[#252A33]';
      case 'cash flow':
        return 'text-[#8B919C] bg-[#151922] border-[#252A33]';
      case 'financial health':
        return 'text-[#7FA6C9] bg-[#151922] border-[#252A33]';
      default:
        return 'text-[#B8A36A] bg-[#151922] border-[#252A33]';
    }
  };

  // Interpretation status badge styling
  const getStatusBadgeColor = (status: MetricInterpretation['status']) => {
    switch (status) {
      case 'positive':
        return 'text-[#6FA58A] bg-[#6FA58A]/10 border-[#6FA58A]/30';
      case 'premium':
        return 'text-[#B8A36A] bg-[#B8A36A]/10 border-[#B8A36A]/30';
      case 'warning':
        return 'text-[#B87878] bg-[#B87878]/10 border-[#B87878]/30';
      case 'caution':
        return 'text-[#B8A36A] bg-[#B8A36A]/10 border-[#B8A36A]/30';
      default:
        return 'text-[#7FA6C9] bg-[#7FA6C9]/10 border-[#7FA6C9]/30';
    }
  };

  const displayVal =
    formattedValue ||
    (value !== null && value !== undefined && value !== '' ? String(value) : null);

  return (
    <>
      <div
        ref={anchorRef as any}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={`inline-flex items-center gap-1 cursor-help transition-all ${
          underlined
            ? onMetricClick
              ? 'border-b border-dashed border-[#252A33] hover:border-[#7FA6C9] hover:text-[#7FA6C9]'
              : 'border-b border-dotted border-[#252A33] hover:border-[#8B919C]'
            : ''
        } ${className}`}
      >
        <span>{children || displayVal || '—'}</span>
        {showHelpIcon && (
          <HelpCircle className="w-3 h-3 text-[#8B919C] opacity-60 hover:opacity-100 transition-opacity" />
        )}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={cardRef}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: coords.placeAbove ? 'translateY(-100%)' : 'translateY(0)',
              width: '350px',
              maxWidth: 'calc(100vw - 24px)',
            }}
            className="z-[9999] bg-[#11141A] border border-[#252A33] rounded-lg shadow-xl p-4 text-left pointer-events-auto backdrop-blur-md transition-all duration-150 animate-fadeIn font-sans"
          >
            {/* Header: Category & Metric Name */}
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#252A33]">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border uppercase tracking-wider ${getCategoryColor(
                      def.category
                    )}`}
                  >
                    {def.category}
                  </span>
                  {stock?.symbol && (
                    <span className="text-[11px] font-mono text-[#8B919C]">
                      {stock.symbol}
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-semibold text-[#E8E9EB] leading-tight">
                  {def.name}
                </h4>
              </div>

              {displayVal && (
                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase font-mono text-[#8B919C]">Current</div>
                  <div className="text-sm font-mono font-medium text-[#E8E9EB] tracking-tight">
                    {displayVal}
                  </div>
                </div>
              )}
            </div>

            {/* Live Stock-Specific Interpretation Section */}
            {interpretation && (
              <div className="my-2.5 p-2.5 rounded-lg bg-[#151922] border border-[#252A33] space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B919C] font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#7FA6C9]" />
                    Interpretation
                  </span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded border ${getStatusBadgeColor(
                      interpretation.status
                    )}`}
                  >
                    {interpretation.badge}
                  </span>
                </div>

                <p className="text-[11px] text-[#E8E9EB] leading-relaxed">
                  {interpretation.summary}
                </p>

                {interpretation.takeaway && (
                  <div className="pt-1.5 border-t border-[#252A33] text-[10px] text-[#8B919C] flex items-start gap-1.5">
                    <span className="text-[#7FA6C9] font-medium shrink-0">Key Takeaway:</span>
                    <span className="text-[#E8E9EB]">{interpretation.takeaway}</span>
                  </div>
                )}

                {interpretation.benchmarkComparison && (
                  <div className="text-[10px] font-mono text-[#8B919C] flex items-center gap-1">
                    <span>Benchmark:</span>
                    <span className="text-[#E8E9EB]">
                      {interpretation.benchmarkComparison}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Fundamental Concept / Summary */}
            <div className="space-y-1.5 text-[11px] pt-1">
              <div className="text-[#8B919C] leading-snug">
                <span className="text-[#E8E9EB] font-medium">What it tells you: </span>
                {def.beginnerSummary}
              </div>

              {/* Formula */}
              {def.formula && (
                <div className="p-1.5 rounded bg-[#151922] border border-[#252A33] text-[10px] font-mono text-[#8B919C] flex items-start gap-1">
                  <span className="text-[#8B919C] shrink-0 font-medium">Formula:</span>
                  <span className="text-[#7FA6C9] break-all">{def.formula}</span>
                </div>
              )}

              {/* Benchmark Guideline if no custom interpretation */}
              {!interpretation && def.benchmarkGuide && (
                <div className="text-[10px] text-[#8B919C] flex items-start gap-1">
                  <span className="text-[#8B919C] font-medium shrink-0">Benchmark:</span>
                  <span className="text-[#E8E9EB]">{def.benchmarkGuide}</span>
                </div>
              )}
            </div>

            {/* Footer Prompt */}
            {onMetricClick && (
              <div className="mt-2.5 pt-2 border-t border-[#252A33] flex items-center justify-between text-[10px] text-[#8B919C]">
                <span className="text-[#7FA6C9] hover:underline flex items-center gap-1 cursor-pointer">
                  <ArrowUpRight className="w-3 h-3" />
                  Click to inspect full deep dive & AI analysis
                </span>
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
};
