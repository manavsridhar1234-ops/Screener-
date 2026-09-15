import React, { useState, useEffect } from 'react';
import { WatchlistProvider } from './context/WatchlistContext';
import { Navbar } from './components/Navbar';
import { ScreenerView } from './components/Screener/ScreenerView';
import { StockDetailView } from './components/StockDetail/StockDetailView';
import { CompareView } from './components/Compare/CompareView';
import { WatchlistView } from './components/Watchlist/WatchlistView';
import { AddStockModal } from './components/Screener/AddStockModal';
import { refreshUniverseData, fetchScreenerStocks } from './services/api';
import {
  TrendingUp,
  ShieldCheck,
  Server,
  Layers,
  Database,
  ExternalLink,
} from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'screener' | 'detail' | 'watchlist' | 'compare'>('screener');
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>('MSFT');
  const [compareList, setCompareList] = useState<string[]>(['MSFT', 'SHAKTIPUMP.NS']);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [universeCount, setUniverseCount] = useState<number>(38);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(new Date().toLocaleTimeString());

  // Load initial universe stats
  useEffect(() => {
    fetchScreenerStocks({}, 'marketCap', 'desc', 1, 1)
      .then((res) => {
        setUniverseCount(res.universeCount || res.total || 38);
        if (res.lastUpdated) {
          setLastUpdatedTime(new Date(res.lastUpdated).toLocaleTimeString());
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectStock = (symbol: string) => {
    setSelectedStockSymbol(symbol.toUpperCase());
    setActiveTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleCompare = (symbol: string) => {
    const upper = symbol.toUpperCase();
    setCompareList((prev) => {
      if (prev.includes(upper)) {
        return prev.filter((s) => s !== upper);
      }
      if (prev.length >= 5) {
        alert('You can compare up to 5 stocks simultaneously.');
        return prev;
      }
      return [...prev, upper];
    });
  };

  const handleRemoveFromCompare = (symbol: string) => {
    setCompareList((prev) => prev.filter((s) => s !== symbol.toUpperCase()));
  };

  const handleClearCompare = () => {
    setCompareList([]);
  };

  const handleCompareWithPeers = (peerSymbols: string[]) => {
    const combined = Array.from(new Set([selectedStockSymbol, ...peerSymbols])).slice(0, 5);
    setCompareList(combined);
    setActiveTab('compare');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefreshUniverse = async () => {
    setIsRefreshing(true);
    try {
      const res = await refreshUniverseData();
      setUniverseCount(res.count);
      setLastUpdatedTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedStockSymbol={selectedStockSymbol}
        onSelectStock={handleSelectStock}
        compareList={compareList}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onRefreshUniverse={handleRefreshUniverse}
        isRefreshing={isRefreshing}
        universeCount={universeCount}
        lastUpdatedTime={lastUpdatedTime}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'screener' && (
          <ScreenerView
            onSelectStock={handleSelectStock}
            compareList={compareList}
            onToggleCompare={handleToggleCompare}
            isAddModalOpen={isAddModalOpen}
            onCloseAddModal={() => setIsAddModalOpen(false)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            universeCount={universeCount}
          />
        )}

        {activeTab === 'detail' && (
          <StockDetailView
            symbol={selectedStockSymbol}
            onSelectStock={handleSelectStock}
            compareList={compareList}
            onToggleCompare={handleToggleCompare}
            onCompareWithPeers={handleCompareWithPeers}
          />
        )}

        {activeTab === 'watchlist' && (
          <WatchlistView
            onSelectStock={handleSelectStock}
            onToggleCompare={handleToggleCompare}
            compareList={compareList}
          />
        )}

        {activeTab === 'compare' && (
          <CompareView
            compareList={compareList}
            onRemoveFromCompare={handleRemoveFromCompare}
            onClearCompare={handleClearCompare}
            onSelectStock={handleSelectStock}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}
      </main>

      {/* Global Add Stock Modal */}
      <AddStockModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onStockAdded={(stock) => {
          setUniverseCount((prev) => prev + 1);
          handleSelectStock(stock.symbol);
        }}
      />

      {/* Institutional Terminal Footer */}
      <footer className="border-t border-[#1E2638] bg-[#0A0D13] py-6 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono font-medium">BFF Data Engine Online</span>
              </div>
              <span>•</span>
              <span className="font-mono text-slate-400">
                Tracking {universeCount} US & Indian Equities
              </span>
              <span>•</span>
              <span className="font-mono text-slate-500 hidden sm:inline">
                Last Sync: {lastUpdatedTime}
              </span>
            </div>

            {/* Quick Benchmark Tickers */}
            <div className="flex items-center gap-2 font-mono text-[11px] flex-wrap justify-center">
              <span className="text-slate-500">Quick Access:</span>
              {['MSFT', 'SHAKTIPUMP.NS', 'RELIANCE.NS', 'NVDA', 'TCS.NS', 'AAPL'].map((sym) => (
                <button
                  key={sym}
                  onClick={() => handleSelectStock(sym)}
                  className="px-2 py-0.5 rounded bg-[#121622] hover:bg-[#1C2538] text-slate-300 hover:text-blue-400 border border-[#1E2638] transition"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#171E2D] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <p>
              EquityLens Research Terminal — Market quotes and financial statements powered by Yahoo Finance API with resilient server caching and missing-data normalization.
            </p>
            <p className="font-mono text-slate-400">
              Technical Honesty & Integrity Standard
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <WatchlistProvider>
      <AppContent />
    </WatchlistProvider>
  );
}
