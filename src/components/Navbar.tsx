import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  Scale,
  RefreshCw,
  PlusCircle,
  TrendingUp,
  Globe2,
  Building2,
  X,
  ExternalLink,
  Sparkles,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { searchCompanies, type SearchResult } from '../services/api';
import { useWatchlist } from '../context/WatchlistContext';
import { useExperience } from '../context/ExperienceContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: 'screener' | 'detail' | 'watchlist' | 'compare';
  setActiveTab: (tab: 'screener' | 'detail' | 'watchlist' | 'compare') => void;
  selectedStockSymbol: string;
  onSelectStock: (symbol: string) => void;
  compareList: string[];
  onOpenAddModal: () => void;
  onRefreshUniverse: () => void;
  isRefreshing: boolean;
  universeCount: number;
  lastUpdatedTime: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedStockSymbol,
  onSelectStock,
  compareList,
  onOpenAddModal,
  onRefreshUniverse,
  isRefreshing,
  universeCount,
  lastUpdatedTime,
}) => {
  const { watchlist } = useWatchlist();
  const { experienceLevel, toggleExperienceLevel } = useExperience();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 1) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchCompanies(searchQuery);
        setSearchResults(results);
        setShowDropdown(true);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (symbol: string) => {
    setShowDropdown(false);
    setSearchQuery('');
    onSelectStock(symbol);
    setActiveTab('detail');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0E14]/95 backdrop-blur border-b border-[#1E2638]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              id="brand-home-btn"
              onClick={() => setActiveTab('screener')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:bg-blue-600/30 group-hover:border-blue-400 transition">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-white font-sans">
                    Equity<span className="text-blue-500">Lens</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/60 font-mono font-medium">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
                  Institutional Screener & Research
                </p>
              </div>
            </button>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-[#121622] p-1 rounded-lg border border-[#1E2638]">
              <button
                id="nav-tab-screener"
                onClick={() => setActiveTab('screener')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'screener'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A2234]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Stock Screener</span>
              </button>

              <button
                id="nav-tab-detail"
                onClick={() => setActiveTab('detail')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'detail'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A2234]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Stock Analysis</span>
                {selectedStockSymbol && (
                  <span className="text-[10px] px-1 py-0.2 rounded bg-black/30 font-mono text-blue-200">
                    {selectedStockSymbol}
                  </span>
                )}
              </button>

              <button
                id="nav-tab-watchlist"
                onClick={() => setActiveTab('watchlist')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'watchlist'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A2234]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Watchlist</span>
                {watchlist.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#1F293D] font-mono text-slate-300">
                    {watchlist.length}
                  </span>
                )}
              </button>

              <button
                id="nav-tab-compare"
                onClick={() => setActiveTab('compare')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'compare'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A2234]'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Compare</span>
                {compareList.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                    {compareList.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Search bar & Universe Actions */}
          <div className="flex items-center gap-3 flex-1 max-w-md justify-end">
            {/* Global Search with dropdown */}
            <div ref={searchRef} className="relative w-full max-w-xs sm:max-w-sm">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="global-stock-search-input"
                  type="text"
                  placeholder="Search ticker or company (e.g. MSFT, Shakti, Reliance)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                  className="w-full bg-[#121622] border border-[#1E2638] rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-sans"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#121622] border border-[#1E2638] rounded-lg shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-3 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                      Searching global markets...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-1 divide-y divide-[#1A2234]">
                      {searchResults.map((item) => (
                        <button
                          key={item.symbol}
                          id={`search-result-${item.symbol}`}
                          onClick={() => handleSelectResult(item.symbol)}
                          className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-[#1A2336] transition group"
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-blue-400 group-hover:text-blue-300">
                                {item.symbol}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#182234] text-slate-300 font-mono">
                                {item.exchange}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-300 truncate max-w-[200px]">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span>{item.country}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition text-blue-400" />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-xs text-slate-400 mb-2">No matching symbols found.</p>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          onOpenAddModal();
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-medium"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Add "{searchQuery}" manually to screener
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Experience Level Toggle (Monochrome) */}
            <button
              id="header-experience-level-btn"
              onClick={toggleExperienceLevel}
              title={`Switch experience mode (Current: ${experienceLevel === 'beginner' ? 'Beginner' : 'Pro Analyst'}). Click to toggle.`}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all shrink-0 ${
                experienceLevel === 'beginner'
                  ? 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-800'
                  : 'bg-slate-800 text-white border-slate-600 hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline text-slate-400">Mode:</span>
              <span className="font-semibold">{experienceLevel === 'beginner' ? 'Beginner' : 'Pro'}</span>
            </button>

            {/* Add Custom Ticker Button */}
            <button
              id="header-add-ticker-btn"
              onClick={onOpenAddModal}
              title="Add any custom stock to screener"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121622] hover:bg-[#1A2234] border border-[#1E2638] text-xs font-medium text-slate-200 hover:text-white transition shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Add Ticker</span>
            </button>

            {/* Refresh Button */}
            <button
              id="header-refresh-btn"
              onClick={onRefreshUniverse}
              disabled={isRefreshing}
              title="Refresh universe fundamentals and quotes"
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#121622] hover:bg-[#1A2234] border border-[#1E2638] text-slate-400 hover:text-slate-200 transition shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-slate-200' : ''}`} />
            </button>

            {/* User Account / Sign Out */}
            {user && (
              <div className="flex items-center gap-1.5 pl-1 sm:pl-2 border-l border-slate-800">
                <div
                  className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300"
                  title={`Logged in as ${user.email}`}
                >
                  <UserIcon className="w-3 h-3 text-slate-400" />
                  <span className="truncate max-w-[100px]">{user.name}</span>
                  {user.isGuest && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      GUEST
                    </span>
                  )}
                </div>
                <button
                  id="header-logout-btn"
                  onClick={logout}
                  title="Sign out / Switch account"
                  className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#121622] hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-900/50 border border-[#1E2638] text-slate-400 transition shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex md:hidden items-center justify-between py-2.5 border-t border-slate-800/80 text-xs overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('screener')}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium ${activeTab === 'screener' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400'}`}
          >
            Screener
          </button>
          <button
            onClick={() => setActiveTab('detail')}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium ${activeTab === 'detail' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400'}`}
          >
            Stock Analysis
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium ${activeTab === 'watchlist' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400'}`}
          >
            Watchlist ({watchlist.length})
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium ${activeTab === 'compare' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400'}`}
          >
            Compare ({compareList.length})
          </button>
          <button
            onClick={toggleExperienceLevel}
            className="px-2 py-1 rounded-lg shrink-0 text-[11px] bg-slate-900 border border-slate-800 text-slate-200 font-medium"
          >
            {experienceLevel === 'beginner' ? 'Beg' : 'Pro'}
          </button>
        </div>
      </div>
    </header>
  );
};
