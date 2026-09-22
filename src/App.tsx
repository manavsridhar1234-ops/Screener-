import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { ExperienceProvider } from './context/ExperienceContext';
import { LoginView } from './components/Auth/LoginView';
import { Navbar } from './components/Navbar';
import { ScreenerView } from './components/Screener/ScreenerView';
import { StockDetailView } from './components/StockDetail/StockDetailView';
import { CompareView } from './components/Compare/CompareView';
import { WatchlistView } from './components/Watchlist/WatchlistView';
import { AddStockModal } from './components/Screener/AddStockModal';
import { CommandPaletteModal } from './components/Navigation/CommandPaletteModal';
import { FooterDataSources } from './components/Common/FooterDataSources';
import { refreshUniverseData, fetchScreenerStocks } from './services/api';
import type { NormalizedStock } from './types';
import {
  TrendingUp,
  ShieldCheck,
  Server,
  Layers,
  Database,
  ExternalLink,
} from 'lucide-react';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'screener' | 'detail' | 'watchlist' | 'compare'>('screener');
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>('MSFT');
  const [compareList, setCompareList] = useState<string[]>(['MSFT', 'SHAKTIPUMP.NS']);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [universeCount, setUniverseCount] = useState<number>(38);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(new Date().toLocaleTimeString());
  const [cachedStocks, setCachedStocks] = useState<NormalizedStock[]>([]);

  // Load initial universe stats & cached stocks for quick search
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchScreenerStocks({}, 'marketCap', 'desc', 1, 50)
      .then((res) => {
        setUniverseCount(res.universeCount || res.total || 38);
        if (res.stocks) {
          setCachedStocks(res.stocks);
        }
        if (res.lastUpdated) {
          setLastUpdatedTime(new Date(res.lastUpdated).toLocaleTimeString());
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  // Global keyboard shortcut for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isAuthenticated) {
    return <LoginView />;
  }

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
    <div className="min-h-screen bg-[#0B0D10] text-[#E8E9EB] flex flex-col font-sans selection:bg-[#7FA6C9]/25 selection:text-[#E8E9EB]">
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
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-6">
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

      {/* Global Command Palette (⌘K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectStock={handleSelectStock}
        onNavigate={(view) => setActiveTab(view)}
        stocksList={cachedStocks}
      />

      {/* Institutional Terminal Footer & Data Sources Attribution */}
      <FooterDataSources />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ExperienceProvider>
        <WatchlistProvider>
          <AppContent />
        </WatchlistProvider>
      </ExperienceProvider>
    </AuthProvider>
  );
}
