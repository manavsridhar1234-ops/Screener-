import type { NormalizedStock, FinancialGrowthPoint, StatementRow } from '../types';

/**
 * Escapes CSV values and wraps in quotes if needed
 */
function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

function formatRawOrDash(val: number | string | null | undefined): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'number') return String(val);
  return val;
}

export function exportStockModelToCsv(
  stock: NormalizedStock,
  growthSeries: FinancialGrowthPoint[],
  statements?: { is: StatementRow[]; bs: StatementRow[]; cf: StatementRow[] }
): void {
  const rows: (string | number)[][] = [];

  // 1. Header & Metadata
  rows.push(['EQUITYLENS RESEARCH TERMINAL — FINANCIAL MODEL & STATEMENT AUDIT']);
  rows.push(['Export Generated On', new Date().toISOString()]);
  rows.push(['Company Name', stock.companyName]);
  rows.push(['Ticker Symbol', stock.symbol]);
  rows.push(['Exchange Route', stock.exchange]);
  rows.push(['Country', stock.country]);
  rows.push(['Sector', stock.sector || '—']);
  rows.push(['Industry', stock.industry || '—']);
  rows.push(['Reporting Currency', stock.currency]);
  rows.push([]);

  // 2. Market Quote & Valuation Multiples
  rows.push(['SECTION 1: MARKET QUOTE & VALUATION MULTIPLES']);
  rows.push(['Metric Description', 'Value', 'Unit / Details']);
  rows.push(['Current Share Price', stock.price !== null ? stock.price.toFixed(2) : '—', stock.currency]);
  rows.push(['Day Change %', stock.dayChangePercent !== null ? `${stock.dayChangePercent.toFixed(2)}%` : '—', '%']);
  rows.push(['Market Capitalization', formatRawOrDash(stock.marketCap), stock.currency]);
  rows.push(['Enterprise Value', formatRawOrDash(stock.enterpriseValue), stock.currency]);
  rows.push(['Trailing P/E Ratio (TTM)', stock.peRatio !== null ? stock.peRatio.toFixed(2) : '—', 'x']);
  rows.push(['Forward P/E Ratio', stock.forwardPe !== null ? stock.forwardPe.toFixed(2) : '—', 'x']);
  rows.push(['Price to Book (P/B)', stock.priceToBook !== null ? stock.priceToBook.toFixed(2) : '—', 'x']);
  rows.push(['Price to Sales (P/S)', stock.priceToSales !== null ? stock.priceToSales.toFixed(2) : '—', 'x']);
  rows.push(['EV / EBITDA', stock.evToEbitda !== null ? stock.evToEbitda.toFixed(2) : '—', 'x']);
  rows.push(['EV / Revenue', stock.evToRevenue !== null ? stock.evToRevenue.toFixed(2) : '—', 'x']);
  rows.push(['Dividend Yield', stock.dividendYield !== null ? `${(stock.dividendYield * 100).toFixed(2)}%` : '—', '%']);
  rows.push(['Beta (5Y Monthly)', stock.beta !== null ? stock.beta.toFixed(2) : '—', 'Volatility']);
  rows.push(['52-Week High', stock.fiftyTwoWeekHigh !== null ? stock.fiftyTwoWeekHigh.toFixed(2) : '—', stock.currency]);
  rows.push(['52-Week Low', stock.fiftyTwoWeekLow !== null ? stock.fiftyTwoWeekLow.toFixed(2) : '—', stock.currency]);
  rows.push([]);

  // 3. Profitability & Returns
  rows.push(['SECTION 2: PROFITABILITY & CAPITAL EFFICIENCY']);
  rows.push(['Metric Description', 'Value', 'Unit / Details']);
  rows.push(['Revenue (TTM)', formatRawOrDash(stock.revenue), stock.currency]);
  rows.push(['Revenue Growth (YoY)', stock.revenueGrowth !== null ? `${(stock.revenueGrowth * 100).toFixed(2)}%` : '—', '%']);
  rows.push(['Gross Margin', stock.grossMargin !== null ? `${(stock.grossMargin * 100).toFixed(2)}%` : '—', '%']);
  rows.push(['Operating Margin', stock.operatingMargin !== null ? `${(stock.operatingMargin * 100).toFixed(2)}%` : '—', '%']);
  rows.push(['Net Profit Margin', stock.netMargin !== null ? `${(stock.netMargin * 100).toFixed(2)}%` : '—', '%']);
  rows.push(['Return on Equity (ROE)', stock.returnOnEquity !== null ? `${(stock.returnOnEquity * 100).toFixed(2)}%` : '—', '%']);
  rows.push(['Return on Assets (ROA)', stock.returnOnAssets !== null ? `${(stock.returnOnAssets * 100).toFixed(2)}%` : '—', '%']);
  rows.push(['Diluted EPS', stock.eps !== null ? stock.eps.toFixed(2) : '—', stock.currency]);
  rows.push([]);

  // 4. Financial Health & Solvency
  rows.push(['SECTION 3: BALANCE SHEET HEALTH & CASH FLOW']);
  rows.push(['Metric Description', 'Value', 'Unit / Details']);
  rows.push(['Total Cash & Equivalents', formatRawOrDash(stock.totalCash), stock.currency]);
  rows.push(['Total Debt Outstanding', formatRawOrDash(stock.totalDebt), stock.currency]);
  rows.push(['Debt to Equity', stock.debtToEquity !== null ? `${(stock.debtToEquity * 100).toFixed(2)}%` : '—', '%']);
  rows.push(['Current Ratio', stock.currentRatio !== null ? stock.currentRatio.toFixed(2) : '—', 'x']);
  rows.push(['Quick Ratio', stock.quickRatio !== null ? stock.quickRatio.toFixed(2) : '—', 'x']);
  rows.push(['Operating Cash Flow', formatRawOrDash(stock.operatingCashFlow), stock.currency]);
  rows.push(['Free Cash Flow', formatRawOrDash(stock.freeCashFlow), stock.currency]);
  rows.push([]);

  // 5. 5-Year Financial Growth Series (Chronological Matrix)
  if (growthSeries && growthSeries.length > 0) {
    rows.push(['SECTION 4: 5-YEAR FINANCIAL GROWTH HISTORY']);
    const headerRow: (string | number)[] = ['Financial Line Item', ...growthSeries.map((g) => g.year)];
    rows.push(headerRow);

    rows.push(['Revenue', ...growthSeries.map((g) => formatRawOrDash(g.revenue))]);
    rows.push([
      'Revenue YoY Growth %',
      ...growthSeries.map((g) => (g.revenueGrowthYoY !== null && g.revenueGrowthYoY !== undefined ? `${g.revenueGrowthYoY.toFixed(2)}%` : '—')),
    ]);
    rows.push(['Gross Profit', ...growthSeries.map((g) => formatRawOrDash(g.grossProfit))]);
    rows.push(['Net Income', ...growthSeries.map((g) => formatRawOrDash(g.netIncome))]);
    rows.push([
      'Net Income YoY Growth %',
      ...growthSeries.map((g) => (g.netIncomeGrowthYoY !== null && g.netIncomeGrowthYoY !== undefined ? `${g.netIncomeGrowthYoY.toFixed(2)}%` : '—')),
    ]);
    rows.push([
      'Operating Cash Flow',
      ...growthSeries.map((g) => formatRawOrDash(g.operatingCashFlow)),
    ]);
    rows.push(['Free Cash Flow', ...growthSeries.map((g) => formatRawOrDash(g.freeCashFlow))]);
    rows.push([]);
  }

  // 6. Detailed Annual Statements (Income Statement, Balance Sheet, Cash Flow)
  if (statements) {
    if (statements.is && statements.is.length > 0) {
      rows.push(['SECTION 5A: INCOME STATEMENT LINE ITEMS']);
      rows.push(['Line Item', 'Period', `Reported Value (${stock.currency})`]);
      statements.is.forEach((item) => {
        rows.push([item.label, item.period, formatRawOrDash(item.value)]);
      });
      rows.push([]);
    }

    if (statements.bs && statements.bs.length > 0) {
      rows.push(['SECTION 5B: BALANCE SHEET LINE ITEMS']);
      rows.push(['Line Item', 'Period', `Reported Value (${stock.currency})`]);
      statements.bs.forEach((item) => {
        rows.push([item.label, item.period, formatRawOrDash(item.value)]);
      });
      rows.push([]);
    }

    if (statements.cf && statements.cf.length > 0) {
      rows.push(['SECTION 5C: CASH FLOW STATEMENT LINE ITEMS']);
      rows.push(['Line Item', 'Period', `Reported Value (${stock.currency})`]);
      statements.cf.forEach((item) => {
        rows.push([item.label, item.period, formatRawOrDash(item.value)]);
      });
      rows.push([]);
    }
  }

  // Disclaimer
  rows.push(['DISCLAIMER & SOURCE NOTICE']);
  rows.push(['Data Feed Provider', 'Yahoo Finance API via EquityLens Server BFF']);
  rows.push(['Regulatory Note', 'For educational and financial research purposes only. Not investment advice.']);

  // Convert to CSV string with BOM for Excel UTF-8 support
  const csvContent = '\uFEFF' + rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const safeDate = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${stock.symbol}_Financial_Model_${safeDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportScreenerToCsv(stocks: NormalizedStock[]): void {
  const rows: (string | number)[][] = [];

  rows.push(['EQUITYLENS RESEARCH TERMINAL — SCREENER UNIVERSE EXPORT']);
  rows.push(['Export Timestamp', new Date().toISOString()]);
  rows.push(['Total Filtered Records', stocks.length]);
  rows.push([]);

  // Column Headers
  rows.push([
    'Symbol',
    'Company Name',
    'Exchange',
    'Sector',
    'Industry',
    'Currency',
    'Price',
    'Day Change %',
    'Market Cap',
    'Enterprise Value',
    'Trailing P/E',
    'Forward P/E',
    'EV/EBITDA',
    'Price to Sales (P/S)',
    'Price to Book (P/B)',
    'ROE %',
    'ROIC %',
    'Operating Margin %',
    'Net Margin %',
    'Debt to Equity %',
    'Dividend Yield %',
    'Free Cash Flow',
    '52-Week High',
    '52-Week Low',
    'Volume',
  ]);

  stocks.forEach((s) => {
    rows.push([
      s.symbol,
      s.companyName,
      s.exchange,
      s.sector || '—',
      s.industry || '—',
      s.currency,
      s.price !== null ? s.price.toFixed(2) : '—',
      s.dayChangePercent !== null ? `${s.dayChangePercent.toFixed(2)}%` : '—',
      formatRawOrDash(s.marketCap),
      formatRawOrDash(s.enterpriseValue),
      s.peRatio !== null ? s.peRatio.toFixed(2) : '—',
      s.forwardPe !== null ? s.forwardPe.toFixed(2) : '—',
      s.evToEbitda !== null ? s.evToEbitda.toFixed(2) : '—',
      s.priceToSales !== null ? s.priceToSales.toFixed(2) : '—',
      s.priceToBook !== null ? s.priceToBook.toFixed(2) : '—',
      s.returnOnEquity !== null ? `${(s.returnOnEquity * 100).toFixed(2)}%` : '—',
      s.returnOnInvestedCapital !== null && s.returnOnInvestedCapital !== undefined ? `${(s.returnOnInvestedCapital * 100).toFixed(2)}%` : '—',
      s.operatingMargin !== null ? `${(s.operatingMargin * 100).toFixed(2)}%` : '—',
      s.netMargin !== null ? `${(s.netMargin * 100).toFixed(2)}%` : '—',
      s.debtToEquity !== null ? `${(s.debtToEquity * 100).toFixed(2)}%` : '—',
      s.dividendYield !== null ? `${(s.dividendYield * 100).toFixed(2)}%` : '—',
      formatRawOrDash(s.freeCashFlow),
      s.fiftyTwoWeekHigh !== null ? s.fiftyTwoWeekHigh.toFixed(2) : '—',
      s.fiftyTwoWeekLow !== null ? s.fiftyTwoWeekLow.toFixed(2) : '—',
      s.volume ? s.volume : '—',
    ]);
  });

  const csvContent = '\uFEFF' + rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const safeDate = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `EquityLens_Screener_Universe_${safeDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
