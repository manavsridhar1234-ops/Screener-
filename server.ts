import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  fetchStockFundamentals,
  fetchStockHistory,
  fetchStockStatements,
  searchStocks,
  resolveTickerSymbol,
} from './server/marketData';
import {
  initializeUniverse,
  queryScreenerStocks,
  addStockToUniverse,
  refreshUniverse,
  SCREENER_PRESETS,
  getPeerBenchmarkData,
} from './server/screenerService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parsing
  app.use(express.json());

  // Initialize Screener Universe asynchronously
  initializeUniverse().catch((err) => {
    console.error('Universe init error:', err);
  });

  // -------------------------------------------------------------
  // API Routes
  // -------------------------------------------------------------

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'EquityLens API Server',
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Screener presets
  app.get('/api/screener/presets', (req, res) => {
    res.json({ presets: SCREENER_PRESETS });
  });

  // 3. Screener query endpoint
  app.get('/api/screener/stocks', (req, res) => {
    try {
      const {
        search,
        universe,
        sectors,
        exchanges,
        marketCapCategory,
        sortBy = 'marketCap',
        sortOrder = 'desc',
        page = '1',
        pageSize = '50',
      } = req.query;

      // Parse numerical filter ranges from query params (e.g., peMin, peMax, peIncludeMissing)
      const parseRange = (paramBase: string) => {
        const minStr = req.query[`${paramBase}Min`];
        const maxStr = req.query[`${paramBase}Max`];
        const incStr = req.query[`${paramBase}Inc`];

        const min = minStr !== undefined && minStr !== '' ? Number(minStr) : null;
        const max = maxStr !== undefined && maxStr !== '' ? Number(maxStr) : null;
        const includeMissing = incStr === 'true' || incStr === undefined; // default true for clean filtering

        if (min === null && max === null) return undefined;
        return { min, max, includeMissing };
      };

      const filters: any = {
        search: typeof search === 'string' ? search : '',
        universe: (typeof universe === 'string' ? universe : 'all') as any,
        sectors: sectors ? (Array.isArray(sectors) ? sectors : [sectors as string]) : undefined,
        exchanges: exchanges ? (Array.isArray(exchanges) ? exchanges : [exchanges as string]) : undefined,
        marketCapCategory: (typeof marketCapCategory === 'string' ? marketCapCategory : 'all') as any,

        marketCap: parseRange('marketCap'),
        enterpriseValue: parseRange('enterpriseValue'),
        peRatio: parseRange('peRatio'),
        forwardPe: parseRange('forwardPe'),
        priceToBook: parseRange('priceToBook'),
        priceToSales: parseRange('priceToSales'),
        evToEbitda: parseRange('evToEbitda'),
        dividendYield: parseRange('dividendYield'),
        earningsYield: parseRange('earningsYield'),
        revenue: parseRange('revenue'),
        revenueGrowth: parseRange('revenueGrowth'),
        grossMargin: parseRange('grossMargin'),
        operatingMargin: parseRange('operatingMargin'),
        netMargin: parseRange('netMargin'),
        returnOnEquity: parseRange('returnOnEquity'),
        returnOnAssets: parseRange('returnOnAssets'),
        eps: parseRange('eps'),
        freeCashFlow: parseRange('freeCashFlow'),
        fcfMargin: parseRange('fcfMargin'),
        debtToEquity: parseRange('debtToEquity'),
        currentRatio: parseRange('currentRatio'),
        quickRatio: parseRange('quickRatio'),
        price: parseRange('price'),
        dayChangePercent: parseRange('dayChangePercent'),
        distFrom52wHigh: parseRange('distFrom52wHigh'),
        beta: parseRange('beta'),
      };

      const result = queryScreenerStocks(
        filters,
        String(sortBy),
        sortOrder === 'asc' ? 'asc' : 'desc',
        parseInt(String(page), 10) || 1,
        parseInt(String(pageSize), 10) || 50
      );

      res.json(result);
    } catch (err: any) {
      console.error('Screener query error:', err);
      res.status(500).json({ error: 'Failed to query screener', details: err.message });
    }
  });

  // 4. Add custom stock to screener universe
  app.post('/api/screener/add', async (req, res) => {
    try {
      const { symbol } = req.body;
      if (!symbol || typeof symbol !== 'string') {
        res.status(400).json({ error: 'Valid ticker symbol is required' });
        return;
      }

      const stock = await addStockToUniverse(symbol);
      res.json({ success: true, stock });
    } catch (err: any) {
      console.error('Add stock error:', err);
      res.status(404).json({ error: err.message || 'Stock not found or unavailable' });
    }
  });

  // 5. Refresh universe data
  app.post('/api/screener/refresh', async (req, res) => {
    try {
      const result = await refreshUniverse();
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to refresh universe', details: err.message });
    }
  });

  // 6. Global search for tickers & companies
  app.get('/api/stocks/search', async (req, res) => {
    try {
      const q = String(req.query.q || '');
      const results = await searchStocks(q);
      res.json({ results });
    } catch (err: any) {
      res.json({ results: [] });
    }
  });

  // 7. Stock Fundamentals & Profile
  app.get('/api/stocks/:symbol/fundamentals', async (req, res) => {
    try {
      const rawSymbol = req.params.symbol;
      const stock = await fetchStockFundamentals(rawSymbol);
      res.json({ stock });
    } catch (err: any) {
      console.error(`Fundamentals error for ${req.params.symbol}:`, err.message);
      res.status(404).json({
        error: `Fundamentals currently unavailable for ${req.params.symbol}`,
        message: err.message,
      });
    }
  });

  // 8. Stock Historical Price Quotes
  app.get('/api/stocks/:symbol/history', async (req, res) => {
    try {
      const rawSymbol = req.params.symbol;
      const range = (req.query.range as any) || '1y';
      const quotes = await fetchStockHistory(rawSymbol, range);
      res.json({ symbol: rawSymbol, range, quotes });
    } catch (err: any) {
      console.error(`History error for ${req.params.symbol}:`, err.message);
      res.status(404).json({
        error: `Price history unavailable for ${req.params.symbol}`,
        message: err.message,
      });
    }
  });

  // 9. Stock Financial Statements
  app.get('/api/stocks/:symbol/statements', async (req, res) => {
    try {
      const rawSymbol = req.params.symbol;
      const statements = await fetchStockStatements(rawSymbol);
      res.json({ symbol: rawSymbol, ...statements });
    } catch (err: any) {
      res.json({ symbol: req.params.symbol, is: [], bs: [], cf: [] });
    }
  });

  // 10. Peer & Sector Benchmarking
  app.get('/api/stocks/:symbol/peers', async (req, res) => {
    try {
      const rawSymbol = req.params.symbol;
      const benchmarkData = await getPeerBenchmarkData(rawSymbol);
      if (!benchmarkData) {
        res.status(404).json({ error: `Peer benchmark data unavailable for ${rawSymbol}` });
        return;
      }
      res.json({ success: true, benchmark: benchmarkData });
    } catch (err: any) {
      console.error(`Peers error for ${req.params.symbol}:`, err.message);
      res.status(500).json({ error: 'Failed to compute peer benchmarks', message: err.message });
    }
  });

  // -------------------------------------------------------------
  // Vite / Static Files Middleware
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EquityLens Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
