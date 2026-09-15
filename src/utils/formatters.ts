/**
 * Financial number and currency formatting utilities
 */

export function formatCurrency(
  val: number | null | undefined,
  currency: string = 'USD',
  compact: boolean = true
): string {
  if (val === null || val === undefined || isNaN(val)) {
    return '—';
  }

  const symbol = currency === 'INR' ? '₹' : '$';

  if (!compact) {
    return `${symbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  const absVal = Math.abs(val);
  const sign = val < 0 ? '-' : '';

  if (currency === 'INR') {
    // For INR, we can use Cr / L or standard B / M
    if (absVal >= 10_000_000_000_000) {
      return `${sign}₹${(absVal / 10_000_000_000_000).toFixed(2)}T`;
    }
    if (absVal >= 10_000_000) {
      // Crores (1 Cr = 10M INR)
      const cr = absVal / 10_000_000;
      if (cr >= 1000) {
        return `${sign}₹${(cr / 1000).toFixed(1)}k Cr`;
      }
      return `${sign}₹${cr.toFixed(1)} Cr`;
    }
    if (absVal >= 100_000) {
      // Lakhs
      return `${sign}₹${(absVal / 100_000).toFixed(1)} L`;
    }
    return `${sign}₹${absVal.toLocaleString()}`;
  }

  // USD standard
  if (absVal >= 1_000_000_000_000) {
    return `${sign}$${(absVal / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (absVal >= 1_000_000_000) {
    return `${sign}$${(absVal / 1_000_000_000).toFixed(2)}B`;
  }
  if (absVal >= 1_000_000) {
    return `${sign}$${(absVal / 1_000_000).toFixed(2)}M`;
  }
  if (absVal >= 1_000) {
    return `${sign}$${(absVal / 1_000).toFixed(1)}K`;
  }

  return `${sign}$${absVal.toFixed(2)}`;
}

export function formatPercent(
  val: number | null | undefined,
  includeSign: boolean = true,
  decimals: number = 2
): string {
  if (val === null || val === undefined || isNaN(val)) {
    return '—';
  }

  const sign = includeSign && val > 0 ? '+' : '';
  return `${sign}${val.toFixed(decimals)}%`;
}

export function formatRatio(
  val: number | null | undefined,
  suffix: string = 'x',
  decimals: number = 2
): string {
  if (val === null || val === undefined || isNaN(val)) {
    return '—';
  }
  return `${val.toFixed(decimals)}${suffix}`;
}

export function formatNumber(
  val: number | null | undefined,
  decimals: number = 2
): string {
  if (val === null || val === undefined || isNaN(val)) {
    return '—';
  }
  const absVal = Math.abs(val);
  const sign = val < 0 ? '-' : '';

  if (absVal >= 1_000_000_000) {
    return `${sign}${(absVal / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (absVal >= 1_000_000) {
    return `${sign}${(absVal / 1_000_000).toFixed(decimals)}M`;
  }
  if (absVal >= 1_000) {
    return `${sign}${(absVal / 1_000).toFixed(decimals)}K`;
  }
  return `${sign}${absVal.toFixed(decimals)}`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
