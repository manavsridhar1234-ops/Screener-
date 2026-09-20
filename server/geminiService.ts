import { GoogleGenAI } from '@google/genai';
import type { NormalizedStock, PeerBenchmarkData, FinancialGrowthPoint } from '../src/types';

// Lazy initialization of GoogleGenAI client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

interface ChatRequestPayload {
  symbol: string;
  stock: NormalizedStock;
  question: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  experienceLevel?: 'beginner' | 'pro';
  benchmarkData?: PeerBenchmarkData | null;
  growthSeries?: FinancialGrowthPoint[];
}

export async function askStockAi(payload: ChatRequestPayload): Promise<string> {
  const {
    symbol,
    stock,
    question,
    history = [],
    experienceLevel = 'beginner',
    benchmarkData,
    growthSeries = [],
  } = payload;

  const ai = getAiClient();

  // Format financial facts to ground Gemini
  const facts = {
    symbol: stock.symbol,
    name: stock.companyName,
    exchange: stock.exchange,
    country: stock.country,
    currency: stock.currency,
    sector: stock.sector || 'N/A',
    industry: stock.industry || 'N/A',
    currentPrice: stock.price,
    dayChangePercent: stock.dayChangePercent ? `${stock.dayChangePercent.toFixed(2)}%` : 'N/A',
    marketCap: stock.marketCap ? `${(stock.marketCap / 1e9).toFixed(2)}B ${stock.currency}` : 'N/A',
    enterpriseValue: stock.enterpriseValue ? `${(stock.enterpriseValue / 1e9).toFixed(2)}B ${stock.currency}` : 'N/A',
    valuation: {
      peRatio: stock.peRatio ? `${stock.peRatio.toFixed(2)}x` : 'N/A',
      forwardPe: stock.forwardPe ? `${stock.forwardPe.toFixed(2)}x` : 'N/A',
      priceToBook: stock.priceToBook ? `${stock.priceToBook.toFixed(2)}x` : 'N/A',
      priceToSales: stock.priceToSales ? `${stock.priceToSales.toFixed(2)}x` : 'N/A',
      evToEbitda: stock.evToEbitda ? `${stock.evToEbitda.toFixed(2)}x` : 'N/A',
      dividendYield: stock.dividendYield ? `${(stock.dividendYield * 100).toFixed(2)}%` : '0%',
      earningsYield: stock.earningsYield ? `${(stock.earningsYield * 100).toFixed(2)}%` : 'N/A',
    },
    profitabilityAndMargins: {
      revenue: stock.revenue ? `${(stock.revenue / 1e9).toFixed(2)}B ${stock.currency}` : 'N/A',
      revenueGrowthYoY: stock.revenueGrowth ? `${(stock.revenueGrowth * 100).toFixed(2)}%` : 'N/A',
      grossMargin: stock.grossMargin ? `${(stock.grossMargin * 100).toFixed(2)}%` : 'N/A',
      operatingMargin: stock.operatingMargin ? `${(stock.operatingMargin * 100).toFixed(2)}%` : 'N/A',
      netMargin: stock.netMargin ? `${(stock.netMargin * 100).toFixed(2)}%` : 'N/A',
      roe: stock.returnOnEquity ? `${(stock.returnOnEquity * 100).toFixed(2)}%` : 'N/A',
      roa: stock.returnOnAssets ? `${(stock.returnOnAssets * 100).toFixed(2)}%` : 'N/A',
    },
    balanceSheetAndCashFlow: {
      totalCash: stock.totalCash ? `${(stock.totalCash / 1e9).toFixed(2)}B ${stock.currency}` : 'N/A',
      totalDebt: stock.totalDebt ? `${(stock.totalDebt / 1e9).toFixed(2)}B ${stock.currency}` : 'N/A',
      debtToEquity: stock.debtToEquity ? `${stock.debtToEquity.toFixed(2)}%` : 'N/A',
      currentRatio: stock.currentRatio ? `${stock.currentRatio.toFixed(2)}x` : 'N/A',
      quickRatio: stock.quickRatio ? `${stock.quickRatio.toFixed(2)}x` : 'N/A',
      freeCashFlow: stock.freeCashFlow ? `${(stock.freeCashFlow / 1e9).toFixed(2)}B ${stock.currency}` : 'N/A',
      operatingCashFlow: stock.operatingCashFlow ? `${(stock.operatingCashFlow / 1e9).toFixed(2)}B ${stock.currency}` : 'N/A',
      beta: stock.beta ? stock.beta.toFixed(2) : 'N/A',
      range52w: `${stock.fiftyTwoWeekLow ?? '—'} - ${stock.fiftyTwoWeekHigh ?? '—'} ${stock.currency}`,
    },
    percentileRankings: benchmarkData?.percentileRanks?.map(r => ({
      metric: r.metricLabel,
      headline: r.headline,
      percentile: `Top ${Math.max(1, 100 - r.percentile)}% in ${benchmarkData.sector}`,
    })) || [],
    recentAnnualHistory: growthSeries.map(p => ({
      year: p.year,
      revenue: p.revenue ? `${(p.revenue / 1e9).toFixed(2)}B` : 'N/A',
      netIncome: p.netIncome ? `${(p.netIncome / 1e9).toFixed(2)}B` : 'N/A',
      fcf: p.freeCashFlow ? `${(p.freeCashFlow / 1e9).toFixed(2)}B` : 'N/A',
      revenueGrowthYoY: p.revenueGrowthYoY ? `${p.revenueGrowthYoY}%` : 'N/A',
    })),
  };

  const systemInstruction = experienceLevel === 'beginner'
    ? `You are EquityLens AI, an expert, objective financial tutor and equity analyst.
The user is a BEGINNER investor.
Guidelines:
1. Explain financial concepts in clear, conversational, jargon-free language.
2. Use relatable everyday analogies where helpful (e.g. explaining P/E as paying $X for each $1 of profit, or Debt-to-Equity as borrowing vs own money).
3. Always reference the actual numbers provided in the stock facts.
4. Highlight what is good and what is a risk in a balanced, objective manner.
5. Do NOT give direct financial advice or buy/sell instructions (maintain compliance disclaimer).
6. Format responses with clean markdown, short paragraphs, and bullet points. Keep answers punchy (around 150-250 words).`
    : `You are EquityLens AI, an institutional-grade equity research analyst.
The user is an ADVANCED / PRO investor.
Guidelines:
1. Provide concise, rigorous, data-driven financial analysis using institutional financial terminology.
2. Discuss specific valuation multiples (P/E, Forward P/E, EV/EBITDA, P/B, FCF yield), capital allocation, ROIC/ROE, margins (gross, operating, net), balance sheet liquidity (Current/Quick ratio), and debt structure.
3. Reference peer benchmarks, sector percentiles, and multi-year CAGR trends from the data.
4. Detail specific upside catalysts and structural risk vectors.
5. Format with structured markdown, bold key figures, and concise bullet points. Maintain institutional neutrality (no solicitations).`;

  if (!ai) {
    // Graceful rule-based synthesis if no API key is configured
    return generateFallbackAnalysis(stock, question, experienceLevel, benchmarkData);
  }

  try {
    const chatContents: any[] = [];

    // Add recent history turns
    if (history.length > 0) {
      for (const turn of history.slice(-6)) {
        chatContents.push({
          role: turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: turn.content }],
        });
      }
    }

    // Add current user prompt with ground truth facts
    chatContents.push({
      role: 'user',
      parts: [
        {
          text: `STOCK CONTEXT & VERIFIED FINANCIAL DATA:
${JSON.stringify(facts, null, 2)}

USER QUESTION:
"${question}"

Please answer the question accurately grounded in the verified financial data above.`,
        },
      ],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatContents,
      config: {
        systemInstruction,
        temperature: 0.4,
        topP: 0.9,
      },
    });

    return response.text?.trim() || generateFallbackAnalysis(stock, question, experienceLevel, benchmarkData);
  } catch (err: any) {
    console.error('Gemini API Error in askStockAi:', err?.message || err);
    return generateFallbackAnalysis(stock, question, experienceLevel, benchmarkData);
  }
}

function generateFallbackAnalysis(
  stock: NormalizedStock,
  question: string,
  level: 'beginner' | 'pro',
  benchmarkData?: PeerBenchmarkData | null
): string {
  const currency = stock.currency;
  const pe = stock.peRatio ? `${stock.peRatio.toFixed(1)}x` : 'N/A';
  const price = stock.price ? `${currency} ${stock.price.toFixed(2)}` : 'N/A';
  const mcap = stock.marketCap ? `${(stock.marketCap / 1e9).toFixed(1)}B ${currency}` : 'N/A';
  const fcf = stock.freeCashFlow ? `${(stock.freeCashFlow / 1e9).toFixed(1)}B ${currency}` : 'N/A';
  const roe = stock.returnOnEquity ? `${(stock.returnOnEquity * 100).toFixed(1)}%` : 'N/A';
  const dToE = stock.debtToEquity !== null ? `${stock.debtToEquity.toFixed(0)}%` : 'N/A';

  if (level === 'beginner') {
    return `### Analysis for ${stock.companyName} (${stock.symbol})

**Key Takeaways for Everyday Investors:**
- **Price & Valuation**: Currently trading at **${price}** with a Price-to-Earnings (P/E) of **${pe}**. A lower P/E typically means you pay less for each dollar of earnings, while higher P/E reflects investor optimism for future growth.
- **Profitability**: The company delivers a Return on Equity (ROE) of **${roe}**, showing how efficiently it turns shareholder capital into profit.
- **Financial Strength**: Total Free Cash Flow sits at **${fcf}**, with a Debt-to-Equity ratio of **${dToE}**. Free cash flow is the actual cash left after running the business and investing in equipment.
- **Sector Context**: Competing in **${stock.sector || 'its sector'}**, with an overall market value of **${mcap}**.

*Note: For detailed research, combine these fundamental multiples with long-term business competitive advantages (moats).*`;
  }

  return `### Institutional Summary: ${stock.symbol} (${stock.companyName})

- **Valuation Multiples**: Trading at **${pe}** TTM P/E (Forward P/E: ${stock.forwardPe ? stock.forwardPe.toFixed(1) + 'x' : 'N/A'}), EV/EBITDA: ${stock.evToEbitda ? stock.evToEbitda.toFixed(1) + 'x' : 'N/A'}. Market Cap: **${mcap}**.
- **Return Metrics & Quality**: ROE is **${roe}** with ROA of ${stock.returnOnAssets ? (stock.returnOnAssets * 100).toFixed(1) + '%' : 'N/A'}. Operating margin: ${stock.operatingMargin ? (stock.operatingMargin * 100).toFixed(1) + '%' : 'N/A'}.
- **Cash Generation & Solvency**: TTM Free Cash Flow is **${fcf}**. Debt-to-Equity is **${dToE}** with a Current Ratio of ${stock.currentRatio ? stock.currentRatio.toFixed(2) + 'x' : 'N/A'}.
- **Cohort Positioning**: ${benchmarkData ? `Ranked across ${benchmarkData.totalSectorCompanies} sector peers. Median P/E: ${benchmarkData.sectorMedianMetrics.peRatio ? benchmarkData.sectorMedianMetrics.peRatio.toFixed(1) + 'x' : 'N/A'}.` : 'Sector cohort analysis available.'}`;
}
