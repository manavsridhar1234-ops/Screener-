export interface MetricInterpretation {
  status: 'positive' | 'warning' | 'caution' | 'neutral' | 'premium';
  badge: string;
  summary: string;
  takeaway: string;
  benchmarkComparison?: string;
}

/**
 * Generates an institutional, context-aware interpretation of a financial metric for a specific stock.
 */
export function getMetricInterpretation(
  metricKey: string,
  val: number | string | null | undefined,
  stock?: {
    symbol?: string;
    companyName?: string;
    sector?: string;
    peRatio?: number | null;
    forwardPe?: number | null;
    price?: number | null;
    currency?: string;
    marketCap?: number | null;
    totalCash?: number | null;
    totalDebt?: number | null;
  } | null
): MetricInterpretation | null {
  if (val === null || val === undefined || val === '') return null;

  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  const isNaNNum = isNaN(num);
  const ticker = stock?.symbol || 'the stock';

  switch (metricKey) {
    // -------------------------------------------------------------
    // VALUATION
    // -------------------------------------------------------------
    case 'peRatio': {
      if (isNaNNum) return null;
      if (num < 0) {
        return {
          status: 'warning',
          badge: 'Negative Earnings (Net Loss)',
          summary: `${ticker} operates at a net loss over the trailing twelve months, making P/E not meaningful. Valuation is better assessed through revenue and cash flow multiples.`,
          takeaway: 'Focus on path to GAAP profitability, unit economics, and cash burn rate.',
          benchmarkComparison: 'Market Benchmark: 18x - 22x',
        };
      }
      if (num <= 13) {
        return {
          status: 'positive',
          badge: 'Value Multiple / Cyclical Discount',
          summary: `At ${num.toFixed(1)}x trailing earnings, ${ticker} trades at a steep discount to the broader market (~20x). Investors pay only $${num.toFixed(2)} for every $1 of annual earnings.`,
          takeaway: 'Check if this discount reflects a genuine bargain or cyclical peak earnings / secular risk.',
          benchmarkComparison: 'S&P 500 Historical Median: ~18x - 22x',
        };
      }
      if (num <= 23) {
        return {
          status: 'neutral',
          badge: 'Fair / Market-Average Valuation',
          summary: `Trading at ${num.toFixed(1)}x trailing earnings places ${ticker} right in line with historical market averages. Reflects a balanced risk-reward profile without extreme multiple stretch.`,
          takeaway: 'Future stock returns will largely track organic earnings expansion rather than multiple expansion.',
          benchmarkComparison: 'S&P 500 Historical Median: ~18x - 22x',
        };
      }
      if (num <= 35) {
        return {
          status: 'premium',
          badge: 'Growth / Moat Premium',
          summary: `At ${num.toFixed(1)}x P/E, ${ticker} commands a noticeable premium. The market is pricing in sustained double-digit earnings growth, wide competitive moats, and durable pricing power.`,
          takeaway: 'Consistent earnings beats are needed to justify and sustain this premium valuation.',
          benchmarkComparison: 'Tech & Quality Benchmark: 25x - 35x',
        };
      }
      return {
        status: 'caution',
        badge: 'High Growth Multiple',
        summary: `At ${num.toFixed(1)}x P/E, this stock trades at an aggressive multiple. Investors are paying a high upfront price based on expectations of dramatic multi-year profit acceleration.`,
        takeaway: 'High sensitivity to interest rate spikes or slight top-line deceleration.',
        benchmarkComparison: 'High-Growth Tech Average: >35x',
      };
    }

    case 'forwardPe': {
      if (isNaNNum) return null;
      const trailing = stock?.peRatio;
      if (trailing && trailing > 0) {
        const drop = ((trailing - num) / trailing) * 100;
        if (drop >= 15) {
          return {
            status: 'positive',
            badge: 'Strong Earnings Growth Projected',
            summary: `Forward P/E of ${num.toFixed(1)}x is significantly lower than trailing P/E (${trailing.toFixed(1)}x). Wall Street consensus forecasts a ${drop.toFixed(0)}% earnings expansion over the next 12 months.`,
            takeaway: 'Rapid bottom-line compounding helps the company quickly grow into its valuation.',
            benchmarkComparison: `Trailing P/E: ${trailing.toFixed(1)}x → Forward: ${num.toFixed(1)}x`,
          };
        }
        if (drop <= -15) {
          return {
            status: 'warning',
            badge: 'Earnings Contraction Anticipated',
            summary: `Forward P/E of ${num.toFixed(1)}x is higher than trailing P/E (${trailing.toFixed(1)}x). Analysts model an earnings decline due to margin pressure or cyclical comps.`,
            takeaway: 'Rising forward multiple signals earnings headwinds that may test market support.',
            benchmarkComparison: `Trailing P/E: ${trailing.toFixed(1)}x → Forward: ${num.toFixed(1)}x`,
          };
        }
      }
      if (num < 15) {
        return {
          status: 'positive',
          badge: 'Attractive Forward Multiple',
          summary: `At ${num.toFixed(1)}x forward earnings, ${ticker} is priced conservatively relative to forward market projections.`,
          takeaway: 'Provides a solid margin of safety if consensus estimates are reliable.',
          benchmarkComparison: 'Market Forward Average: ~18x',
        };
      }
      return {
        status: num > 28 ? 'caution' : 'neutral',
        badge: num > 28 ? 'Elevated Forward Multiple' : 'Standard Forward Multiple',
        summary: `At ${num.toFixed(1)}x projected earnings, the market prices in healthy execution across core product lines over the coming fiscal year.`,
        takeaway: 'Verify upcoming consensus revisions during quarterly reporting periods.',
        benchmarkComparison: 'Market Forward Average: ~18x',
      };
    }

    case 'priceToBook': {
      if (isNaNNum) return null;
      if (num < 1.0) {
        return {
          status: 'positive',
          badge: 'Trading Below Book Value',
          summary: `At ${num.toFixed(2)}x P/B, the stock sells for less than the net accounting equity of its physical and financial assets.`,
          takeaway: 'Classic Benjamin Graham value metric; verify asset quality and avoidance of balance sheet write-downs.',
          benchmarkComparison: 'Deep Value Benchmark: <1.0x',
        };
      }
      if (num <= 3.5) {
        return {
          status: 'neutral',
          badge: 'Asset-Backed Sound Valuation',
          summary: `At ${num.toFixed(1)}x book value, valuation is well-anchored by tangible assets and capital equipment.`,
          takeaway: 'Ideal metric for capital-intensive firms, manufacturing, energy, and commercial banks.',
          benchmarkComparison: 'Traditional Industrial Average: 1.5x - 3.0x',
        };
      }
      return {
        status: 'premium',
        badge: 'Asset-Light / Intangible Moat',
        summary: `A high P/B of ${num.toFixed(1)}x is typical for modern asset-light technology or franchise leaders whose core value lies in code, brand, and patents rather than physical buildings.`,
        takeaway: 'Look to Return on Equity (ROE) and Free Cash Flow rather than book value to evaluate asset-light leaders.',
        benchmarkComparison: 'Software & IP Leaders: Frequently >8x - 15x',
      };
    }

    case 'priceToSales': {
      if (isNaNNum) return null;
      if (num <= 2.0) {
        return {
          status: 'positive',
          badge: 'Conservative Sales Multiple',
          summary: `Paying only ${num.toFixed(1)}x annual sales offers attractive top-line valuation cushion. Any margin improvement directly expands investor returns.`,
          takeaway: 'Great for evaluating turnaround candidates or steady industrial revenue generators.',
          benchmarkComparison: 'Broad Market Average: 2.0x - 2.5x',
        };
      }
      if (num <= 6.0) {
        return {
          status: 'neutral',
          badge: 'Healthy Sales Multiple',
          summary: `At ${num.toFixed(1)}x sales, the price aligns with sound profitable enterprise benchmarks.`,
          takeaway: 'Evaluate alongside gross margin to confirm healthy revenue conversion.',
          benchmarkComparison: 'Broad Market Average: 2.0x - 2.5x',
        };
      }
      return {
        status: 'caution',
        badge: 'High Sales Multiple',
        summary: `At ${num.toFixed(1)}x sales, ${ticker} requires elite gross margins (>70%) and sustained hyper-growth to justify this multiple on top-line revenue alone.`,
        takeaway: 'Sensitive to top-line decelerations or rising enterprise customer churn.',
        benchmarkComparison: 'High-Growth SaaS Baseline: >8x',
      };
    }

    case 'evToEbitda': {
      if (isNaNNum) return null;
      if (num <= 10) {
        return {
          status: 'positive',
          badge: 'Attractive Buyout / PE Multiple',
          summary: `At ${num.toFixed(1)}x EV/EBITDA, the business is priced attractively from a corporate acquirer and private equity perspective, factoring in total debt.`,
          takeaway: 'Demonstrates strong operational cash generation relative to enterprise enterprise value.',
          benchmarkComparison: 'Institutional Buyout Sweetspot: <10x',
        };
      }
      if (num <= 18) {
        return {
          status: 'neutral',
          badge: 'Standard Enterprise Multiple',
          summary: `At ${num.toFixed(1)}x EV/EBITDA, the firm trades near normalized peer multiples, reflecting steady operational health.`,
          takeaway: 'Capital-structure neutral; confirms healthy operating profit without debt distortion.',
          benchmarkComparison: 'Historical Market Median: 11x - 14x',
        };
      }
      return {
        status: 'caution',
        badge: 'Premium Enterprise Multiple',
        summary: `At ${num.toFixed(1)}x EV/EBITDA, buyers are paying a substantial premium for raw cash generation before depreciation and interest.`,
        takeaway: 'Requires sustained EBITDA expansion to prevent multiple de-rating.',
        benchmarkComparison: 'Market Average: 11x - 14x',
      };
    }

    case 'evToRevenue': {
      if (isNaNNum) return null;
      return {
        status: num < 3 ? 'positive' : num > 10 ? 'caution' : 'neutral',
        badge: num < 3 ? 'Attractive EV/Sales' : num > 10 ? 'Premium EV/Sales' : 'Standard EV/Sales',
        summary: `Enterprise Value is ${num.toFixed(1)}x total annual revenue. Unlike P/S, this factors in both market cap and net debt obligations.`,
        takeaway: 'Superior to Price/Sales when comparing companies with divergent balance sheet debt.',
        benchmarkComparison: 'Market Baseline: 2.0x - 3.5x',
      };
    }

    case 'enterpriseValue': {
      return {
        status: 'neutral',
        badge: 'Theoretical Takeover Cost',
        summary: `Reflects the total theoretical price to buy 100% of ${ticker}'s common shares, repay all debt liabilities, and take custody of its cash reserves.`,
        takeaway: 'The definitive denominator for institutional enterprise valuation multiples.',
      };
    }

    case 'marketCap': {
      return {
        status: 'neutral',
        badge: 'Total Equity Valuation',
        summary: `The cumulative open-market value of all outstanding shares for ${ticker}. Determines index inclusion, liquidity tier, and portfolio sizing.`,
        takeaway: 'Mega-caps offer liquidity and balance sheet durability; small-caps offer higher growth potential.',
      };
    }

    // -------------------------------------------------------------
    // PROFITABILITY & RETURNS
    // -------------------------------------------------------------
    case 'grossMargin': {
      if (isNaNNum) return null;
      if (num >= 65) {
        return {
          status: 'positive',
          badge: 'Elite Pricing Power',
          summary: `Gross margin of ${num.toFixed(1)}% is world-class. Retains ${num.toFixed(0)}¢ of every sales dollar after direct costs, signaling tremendous pricing power and software-scale leverage.`,
          takeaway: 'Exceptional defense against supplier inflation; leaves massive budget for R&D and profit conversion.',
          benchmarkComparison: 'Software & IP Leaders: >65% | Retail/Mfg: 20%-35%',
        };
      }
      if (num >= 40) {
        return {
          status: 'positive',
          badge: 'Healthy Unit Economics',
          summary: `At ${num.toFixed(1)}%, gross margin provides a robust cushion above cost of goods sold, supporting healthy operating profitability.`,
          takeaway: 'Solid competitive position with moderate pricing flexibility.',
          benchmarkComparison: 'Broad Industrial Average: 35% - 45%',
        };
      }
      if (num >= 20) {
        return {
          status: 'neutral',
          badge: 'Standard Commercial Margin',
          summary: `A ${num.toFixed(1)}% gross margin is standard for physical retail, distribution, or hardware manufacturing businesses with significant material costs.`,
          takeaway: 'Must maintain high inventory turnover and strict inventory control to preserve net profits.',
          benchmarkComparison: 'Distribution / Retail Baseline: 20% - 30%',
        };
      }
      return {
        status: 'warning',
        badge: 'Thin Gross Margin',
        summary: `At ${num.toFixed(1)}%, gross margin is razor-thin. Modest increases in commodity inputs or supply chain freight can eliminate operating profits.`,
        takeaway: 'Highly vulnerable to input cost inflation and price competition.',
        benchmarkComparison: 'Vulnerable Baseline: <20%',
      };
    }

    case 'operatingMargin': {
      if (isNaNNum) return null;
      if (num >= 25) {
        return {
          status: 'positive',
          badge: 'Elite Operational Moat',
          summary: `Converts ${num.toFixed(1)}% of total sales into operating profit (EBIT) after paying all production and operating overhead.`,
          takeaway: 'Signals dominant industry leadership, disciplined SG&A costs, and wide economic moats.',
          benchmarkComparison: 'S&P 500 Operating Median: ~12% - 15%',
        };
      }
      if (num >= 15) {
        return {
          status: 'positive',
          badge: 'Healthy Operating Profitability',
          summary: `At ${num.toFixed(1)}%, operating margin comfortably surpasses general industry averages, demonstrating efficient management execution.`,
          takeaway: 'Provides reliable earnings stability across economic cycles.',
          benchmarkComparison: 'S&P 500 Operating Median: ~12% - 15%',
        };
      }
      if (num >= 5) {
        return {
          status: 'neutral',
          badge: 'Moderate Operating Margin',
          summary: `Converts ${num.toFixed(1)}% of revenue to operating profit. Typical for capital-heavy, wholesale, or supermarket chains.`,
          takeaway: 'Profits can compress quickly during economic downturns if sales dip.',
          benchmarkComparison: 'Cyclical Baseline: 5% - 10%',
        };
      }
      return {
        status: 'warning',
        badge: num < 0 ? 'Operating Loss' : 'Thin Operating Cushion',
        summary: num < 0
          ? `${ticker} lost money on core operations (${num.toFixed(1)}% operating margin). Core sales do not yet cover day-to-day overhead.`
          : `At ${num.toFixed(1)}%, operating cushion is narrow. Any unexpected spike in SG&A or drop in volume threatens profitability.`,
        takeaway: 'Monitor cost-reduction initiatives and breakeven timeline.',
        benchmarkComparison: 'Fragile Baseline: <5%',
      };
    }

    case 'netMargin': {
      if (isNaNNum) return null;
      if (num >= 20) {
        return {
          status: 'positive',
          badge: 'High Bottom-Line Conversion',
          summary: `Generates ${num.toFixed(1)}¢ of pure net income for every $1 of customer sales after all taxes, interest, and operating costs.`,
          takeaway: 'Generates immense capital surplus available for dividends, repurchases, and reinvestment.',
          benchmarkComparison: 'S&P 500 Median: ~11% - 13%',
        };
      }
      if (num >= 10) {
        return {
          status: 'positive',
          badge: 'Solid Profitability',
          summary: `At ${num.toFixed(1)}% net margin, ${ticker} reliably translates sales into bottom-line shareholder earnings.`,
          takeaway: 'Solid earnings engine with sustainable operating margins.',
          benchmarkComparison: 'S&P 500 Median: ~11% - 13%',
        };
      }
      if (num >= 0) {
        return {
          status: 'neutral',
          badge: 'Modest Net Margin',
          summary: `At ${num.toFixed(1)}%, profit conversion is positive but moderate. Subject to shifts in tax rates or debt interest expenses.`,
          takeaway: 'Examine debt interest expenses to see if leverage is depressing bottom-line conversion.',
          benchmarkComparison: 'Low-Margin Baseline: 2% - 8%',
        };
      }
      return {
        status: 'warning',
        badge: 'Unprofitable (Net Loss)',
        summary: `${ticker} reported a negative net margin of ${num.toFixed(1)}%. It is currently operating at a net loss for common shareholders.`,
        takeaway: 'Track cash runway and unit economics to assess financial staying power.',
        benchmarkComparison: 'Profitable Standard: >0%',
      };
    }

    case 'returnOnEquity': {
      if (isNaNNum) return null;
      if (num >= 25) {
        return {
          status: 'positive',
          badge: 'Elite Capital Compounding',
          summary: `Generates a phenomenal ${num.toFixed(1)}% annual return on shareholder equity. Meets the highest institutional criteria for compounders.`,
          takeaway: 'Confirm ROE is driven by genuine net profit margins and asset efficiency rather than excessive debt leverage.',
          benchmarkComparison: 'Buffett Wide-Moat Standard: >15% | Elite: >25%',
        };
      }
      if (num >= 15) {
        return {
          status: 'positive',
          badge: 'Wide-Moat Capital Return',
          summary: `At ${num.toFixed(1)}% ROE, management allocates shareholder capital with high efficiency, exceeding typical cost of equity hurdle rates.`,
          takeaway: 'A key hallmark of businesses with enduring competitive advantages.',
          benchmarkComparison: 'Cost of Equity Hurdle: ~8% - 10%',
        };
      }
      if (num >= 8) {
        return {
          status: 'neutral',
          badge: 'Average Capital Return',
          summary: `At ${num.toFixed(1)}% ROE, the company earns an acceptable return on equity roughly equal to long-term equity market averages.`,
          takeaway: 'Adequate capital productivity; room for management to optimize capital allocation.',
          benchmarkComparison: 'Cost of Equity Hurdle: ~8% - 10%',
        };
      }
      return {
        status: 'caution',
        badge: 'Subdued Capital Efficiency',
        summary: `At ${num.toFixed(1)}% ROE, capital compounding is sluggish. Shareholders earn low returns relative to the risk of equity ownership.`,
        takeaway: 'Capital reinvestment in new projects is not currently yielding strong economic returns.',
        benchmarkComparison: 'Underperforming: <8%',
      };
    }

    case 'returnOnAssets': {
      if (isNaNNum) return null;
      return {
        status: num >= 10 ? 'positive' : num >= 5 ? 'neutral' : 'caution',
        badge: num >= 10 ? 'High Asset Productivity' : num >= 5 ? 'Healthy Asset Return' : 'Low Asset Turnover',
        summary: `Generates ${num.toFixed(1)}% net profit relative to total company assets. Demonstrates asset productivity independent of debt financing.`,
        takeaway: 'Comparing ROA with ROE reveals how much debt leverage management uses to boost equity returns.',
        benchmarkComparison: 'Capital-Light Target: >10% | Capital-Heavy Target: >5%',
      };
    }

    case 'eps': {
      if (isNaNNum) return null;
      return {
        status: num > 0 ? 'positive' : 'warning',
        badge: num > 0 ? 'Positive Per-Share Earnings' : 'Negative Per-Share Earnings',
        summary: `Represents $${num.toFixed(2)} in net diluted profit earned for every single share of stock. Diluted EPS factors in all options and convertibles.`,
        takeaway: 'Consistent multi-year EPS growth is the single most proven driver of long-term share price appreciation.',
      };
    }

    // -------------------------------------------------------------
    // GROWTH
    // -------------------------------------------------------------
    case 'revenueGrowth': {
      if (isNaNNum) return null;
      if (num >= 20) {
        return {
          status: 'positive',
          badge: 'Rapid Top-Line Expansion',
          summary: `At ${num.toFixed(1)}% YoY growth, ${ticker} is rapidly expanding market share and demonstrating strong customer demand in its core verticals.`,
          takeaway: 'High-velocity growth creates operational leverage that dramatically expands future cash flow.',
          benchmarkComparison: 'High-Growth Benchmark: >20%',
        };
      }
      if (num >= 10) {
        return {
          status: 'positive',
          badge: 'Solid Double-Digit Growth',
          summary: `Growing revenue at ${num.toFixed(1)}% YoY comfortably outpaces broader GDP growth and inflation, signaling healthy commercial traction.`,
          takeaway: 'Steady compounder rate that supports reliable multi-year expansion.',
          benchmarkComparison: 'Mature Compounder Benchmark: 8% - 15%',
        };
      }
      if (num >= 2) {
        return {
          status: 'neutral',
          badge: 'Moderate Steady Growth',
          summary: `Top-line growth of ${num.toFixed(1)}% reflects a mature, defensive business tracking general economic expansion.`,
          takeaway: 'Value creation depends on margin expansion, buybacks, and dividend distributions rather than high top-line growth.',
          benchmarkComparison: 'GDP / Inflation Benchmark: ~2% - 5%',
        };
      }
      return {
        status: 'warning',
        badge: 'Top-Line Contraction',
        summary: `Revenue declined by ${Math.abs(num).toFixed(1)}% YoY. The company experienced top-line headwinds due to cyclical factors or competitive disruption.`,
        takeaway: 'Check whether the decline is a temporary industry cycle or structural loss of customer accounts.',
        benchmarkComparison: 'Positive Growth Threshold: >0%',
      };
    }

    case 'revenue': {
      return {
        status: 'neutral',
        badge: 'Annual Top-Line Scale',
        summary: `Total dollar volume of products and services sold over the trailing twelve months. Establishes the scale and operating breadth of ${ticker}.`,
        takeaway: 'High-quality revenue is contracted, diversified across clients, and carries recurring subscription characteristics.',
      };
    }

    // -------------------------------------------------------------
    // FINANCIAL HEALTH & LIQUIDITY
    // -------------------------------------------------------------
    case 'debtToEquity': {
      if (isNaNNum) return null;
      if (num <= 35) {
        return {
          status: 'positive',
          badge: 'Pristine Conservative Balance Sheet',
          summary: `Debt is only ${num.toFixed(1)}% of equity. The business operates with minimal reliance on external borrowed money, providing supreme solvency durability.`,
          takeaway: 'Virtually immune to interest rate hikes or debt refinancing crunches.',
          benchmarkComparison: 'Conservative Target: <50%',
        };
      }
      if (num <= 90) {
        return {
          status: 'positive',
          badge: 'Balanced Leverage',
          summary: `At ${num.toFixed(1)}% D/E, debt financing is utilized in moderation to boost equity returns without endangering corporate solvency.`,
          takeaway: 'Healthy capital structure well-supported by regular operational cash flow.',
          benchmarkComparison: 'Safe Range: 40% - 90%',
        };
      }
      if (num <= 160) {
        return {
          status: 'caution',
          badge: 'Elevated Debt Burden',
          summary: `At ${num.toFixed(1)}% D/E, the firm carries substantial leverage relative to equity. Requires steady cash flow to service mandatory interest payments.`,
          takeaway: 'Check interest coverage ratio (EBIT / Interest Expense) to ensure cash flows comfortably cover debts.',
          benchmarkComparison: 'Caution Threshold: >100%',
        };
      }
      return {
        status: 'warning',
        badge: 'High Financial Leverage',
        summary: `With a ${num.toFixed(1)}% Debt-to-Equity ratio, the business is heavily levered. In economic downturns, mandatory debt debt obligations can jeopardize equity value.`,
        takeaway: 'Elevated financial risk; vulnerable during high-interest rate environments or revenue contractions.',
        benchmarkComparison: 'High-Risk Threshold: >150%',
      };
    }

    case 'currentRatio': {
      if (isNaNNum) return null;
      if (num >= 2.0) {
        return {
          status: 'positive',
          badge: 'Abundant Short-Term Liquidity',
          summary: `Short-term liquid assets are ${num.toFixed(2)}x upcoming liabilities due within the year. The company possesses an immense working capital safety buffer.`,
          takeaway: 'Zero short-term liquidity risk, though extremely high ratios (>3x) may indicate excess idle cash.',
          benchmarkComparison: 'Ideal Liquidity Range: 1.3x - 2.2x',
        };
      }
      if (num >= 1.2) {
        return {
          status: 'positive',
          badge: 'Healthy Liquidity',
          summary: `At ${num.toFixed(2)}x, liquid current assets comfortably exceed short-term bills due over the next 12 months.`,
          takeaway: 'Healthy working capital management that meets standard institutional safety rules.',
          benchmarkComparison: 'Ideal Liquidity Range: 1.3x - 2.2x',
        };
      }
      if (num >= 1.0) {
        return {
          status: 'neutral',
          badge: 'Tight Working Capital',
          summary: `At ${num.toFixed(2)}x, current assets barely match upcoming bills. Requires steady daily customer collections to avoid short-term cash crunches.`,
          takeaway: 'Monitor working capital cycles and short-term credit line utilization.',
          benchmarkComparison: 'Adequate Threshold: >1.0x',
        };
      }
      return {
        status: 'warning',
        badge: 'Working Capital Deficit',
        summary: `At ${num.toFixed(2)}x, upcoming liabilities due within 12 months exceed total liquid current assets.`,
        takeaway: 'Requires ongoing inventory turnover, customer receivables, or debt refinancing to service near-term bills.',
        benchmarkComparison: 'Liquidity Stress: <1.0x',
      };
    }

    case 'quickRatio': {
      if (isNaNNum) return null;
      if (num >= 1.0) {
        return {
          status: 'positive',
          badge: 'Acid-Test Passed',
          summary: `Quick ratio of ${num.toFixed(2)}x proves ${ticker} can pay off 100% of its upcoming short-term bills today using just cash and receivables, without needing to sell a single dollar of warehouse inventory.`,
          takeaway: 'The gold standard test for strict liquidity during sudden supply chain or economic shocks.',
          benchmarkComparison: 'Safe Acid-Test Standard: >1.0x',
        };
      }
      return {
        status: 'neutral',
        badge: 'Inventory Dependent',
        summary: `At ${num.toFixed(2)}x, strict cash and receivables do not fully cover near-term obligations without ongoing inventory liquidation.`,
        takeaway: 'Standard for high-turnover retailers; monitor inventory turnover velocity.',
        benchmarkComparison: 'Safe Acid-Test Standard: >1.0x',
      };
    }

    case 'totalCash': {
      const debt = stock?.totalDebt || 0;
      const netCash = num - debt;
      return {
        status: netCash >= 0 ? 'positive' : 'neutral',
        badge: netCash >= 0 ? 'Net Cash Balance Sheet' : 'Liquidity Reserve',
        summary: netCash >= 0
          ? `Total cash reserves exceed all outstanding debt, putting ${ticker} in a fortress net-cash position with zero bankruptcy risk.`
          : `Liquid cash cushion provides defensive runway and capital flexibility during tight economic cycles.`,
        takeaway: 'Cash reserves offer strategic firepower for accretive M&A, share buybacks, and R&D.',
      };
    }

    case 'totalDebt': {
      const cash = stock?.totalCash || 0;
      const netDebt = num - cash;
      return {
        status: netDebt <= 0 ? 'positive' : 'neutral',
        badge: netDebt <= 0 ? 'Fully Cash-Covered Debt' : 'Corporate Debt Obligations',
        summary: netDebt <= 0
          ? `All ${num ? '$' + (num / 1e9).toFixed(1) + 'B' : ''} of debt is fully backed by greater cash reserves in the bank.`
          : `Total contractual debt liabilities requiring regular interest service and refinancing schedule tracking.`,
        takeaway: 'Examine debt maturities to ensure no concentrated near-term balloon payments.',
      };
    }

    // -------------------------------------------------------------
    // CASH FLOW
    // -------------------------------------------------------------
    case 'freeCashFlow': {
      if (isNaNNum) return null;
      if (num > 0) {
        return {
          status: 'positive',
          badge: 'Cash Compounding Engine',
          summary: `Generates real, unencumbered surplus cash after paying all operating expenses and capital investments. FCF is the true economic lifeblood of the company.`,
          takeaway: 'Unlike accounting net income, free cash flow cannot be manipulated by non-cash accruals.',
          benchmarkComparison: 'Positive & Expanding is the Gold Standard',
        };
      }
      return {
        status: 'warning',
        badge: 'Negative FCF (Cash Burn)',
        summary: `Operations and CapEx consumed more cash than generated over the trailing year. The company is currently burning cash on a net basis.`,
        takeaway: 'Evaluate how many years of cash reserves remain to fund ongoing operations.',
        benchmarkComparison: 'Sustainable Standard: >0',
      };
    }

    case 'operatingCashFlow': {
      return {
        status: 'positive',
        badge: 'Core Operational Cash',
        summary: `The actual cash collected at the register from day-to-day commercial operations before capital expenditures.`,
        takeaway: 'Must consistently exceed reported net income over multi-year cycles to verify earnings quality.',
      };
    }

    // -------------------------------------------------------------
    // PERFORMANCE & VOLATILITY
    // -------------------------------------------------------------
    case 'beta': {
      if (isNaNNum) return null;
      if (num <= 0.8) {
        return {
          status: 'positive',
          badge: 'Defensive / Low Volatility',
          summary: `Beta of ${num.toFixed(2)} means ${ticker} fluctuates significantly less than the overall market. Offers portfolio downside stability during market sell-offs.`,
          takeaway: 'Typical of defensive stalwarts, consumer essentials, healthcare, and utilities.',
          benchmarkComparison: 'Market Benchmark Beta: 1.00',
        };
      }
      if (num <= 1.25) {
        return {
          status: 'neutral',
          badge: 'Market-Correlated Volatility',
          summary: `A beta of ${num.toFixed(2)} moves in close tandem with the general stock market index.`,
          takeaway: 'Standard systematic risk profile for diversified large-cap enterprises.',
          benchmarkComparison: 'Market Benchmark Beta: 1.00',
        };
      }
      return {
        status: 'caution',
        badge: 'High Volatility / Aggressive',
        summary: `At ${num.toFixed(2)} Beta, this stock experiences larger price swings than the broader market. Expect sharp drawdowns during corrections alongside high upside beta during rallies.`,
        takeaway: 'Best suited for growth or momentum-oriented risk tolerance.',
        benchmarkComparison: 'High-Beta Benchmark: >1.30',
      };
    }

    case 'distFrom52wHigh': {
      if (isNaNNum) return null;
      if (num >= -6) {
        return {
          status: 'positive',
          badge: 'Trading Near 52W High (Momentum)',
          summary: `Trading within ${Math.abs(num).toFixed(1)}% of its 52-week peak. Demonstrates powerful institutional accumulation and strong positive trend momentum.`,
          takeaway: 'Leading stocks breaking out to new highs historically exhibit continued relative strength.',
          benchmarkComparison: 'Near-High Threshold: Within -5%',
        };
      }
      if (num >= -20) {
        return {
          status: 'neutral',
          badge: 'Healthy Consolidation / Pullback',
          summary: `Trading ${Math.abs(num).toFixed(1)}% off its high. Reflects a standard consolidation or pullback within a broader market cycle.`,
          takeaway: 'Monitor key moving average support levels for potential accumulation.',
          benchmarkComparison: 'Normal Pullback Range: -5% to -20%',
        };
      }
      return {
        status: 'caution',
        badge: 'Significant Drawdown',
        summary: `The stock is ${Math.abs(num).toFixed(1)}% below its 52-week peak. It has experienced a deep correction or bear-market re-rating.`,
        takeaway: 'Look for signs of fundamental stabilization before attempting to catch falling prices.',
        benchmarkComparison: 'Deep Correction: >-25%',
      };
    }

    case 'dividendYield': {
      if (isNaNNum) return null;
      if (num >= 4.0) {
        return {
          status: 'positive',
          badge: 'High Income Yield',
          summary: `Yields an attractive ${num.toFixed(2)}% in direct annual cash payouts per share, well above broader index dividend averages.`,
          takeaway: 'Verify the Dividend Payout Ratio (Dividends / Net Income) to ensure the dividend is fully covered by earnings.',
          benchmarkComparison: 'S&P 500 Average Yield: ~1.5%',
        };
      }
      if (num >= 1.2) {
        return {
          status: 'positive',
          badge: 'Sustainable Core Dividend',
          summary: `A healthy ${num.toFixed(2)}% yield typical of mature, cash-generative blue chips balancing dividend payouts with business reinvestment.`,
          takeaway: 'Focus on dividend growth rate (CAGR) over nominal yield.',
          benchmarkComparison: 'S&P 500 Average Yield: ~1.5%',
        };
      }
      if (num > 0) {
        return {
          status: 'neutral',
          badge: 'Modest Dividend / Growth Focus',
          summary: `Yield of ${num.toFixed(2)}% is modest. The company prioritizes retaining profits to reinvest in growth, acquisitions, or share repurchases.`,
          takeaway: 'Total Shareholder Return is driven primarily by capital gains rather than income.',
          benchmarkComparison: 'Growth Reinvestment Baseline: <1.0%',
        };
      }
      return {
        status: 'neutral',
        badge: 'Zero Dividend / 100% Retained Earnings',
        summary: `${ticker} does not pay a cash dividend. 100% of earnings are retained to fund research, expansion, or balance sheet preservation.`,
        takeaway: 'Standard for fast-growing technology, biotech, and high-reinvestment platforms.',
      };
    }

    case 'dayChangePercent': {
      if (isNaNNum) return null;
      return {
        status: num >= 0 ? 'positive' : 'warning',
        badge: num >= 0 ? 'Positive Daily Session' : 'Daily Pullback',
        summary: `${ticker} moved ${num >= 0 ? '+' : ''}${num.toFixed(2)}% in the latest market trading session.`,
        takeaway: 'Daily fluctuations are often noise; cross-reference with quarterly fundamental trends.',
      };
    }

    case 'price': {
      if (isNaNNum) return null;
      const curr = stock?.currency || 'USD';
      const pe = stock?.peRatio;
      return {
        status: 'neutral',
        badge: 'Last Traded Price (LTP)',
        summary: `${ticker} currently trades at ${curr === 'INR' ? '₹' : '$'}${num.toFixed(2)} per share${pe ? ` (${pe > 0 ? `${pe.toFixed(1)}x trailing earnings` : 'negative earnings'})` : ''}.`,
        takeaway: 'Evaluate share price in relation to historical earnings power and balance sheet assets, rather than nominal unit size.',
      };
    }

    default:
      return null;
  }
}
