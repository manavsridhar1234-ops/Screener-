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
import { FooterDataSources } from './components/Common/FooterDataSources';
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
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'screener' | 'detail' | 'watchlist' | 'compare'>('screener');
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>('MSFT');
  const [compareList, setCompareList] = useState<string[]>(['MSFT', 'SHAKTIPUMP.NS']);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [universeCount, setUniverseCount] = useState<number>(38);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(new Date().toLocaleTimeString());

  // Load initial universe stats
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchScreenerStocks({}, 'marketCap', 'desc', 1, 1)
      .then((res) => {
        setUniverseCount(res.universeCount || res.total || 38);
        if (res.lastUpdated) {
          setLastUpdatedTime(new Date(res.lastUpdated).toLocaleTimeString());
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

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
