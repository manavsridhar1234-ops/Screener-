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
  onOpenCommandPalette?: () => void;
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
  onOpenCommandPalette,
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
    <header className="sticky top-0 z-40 bg-[#0B0D10]/95 backdrop-blur border-b border-[#252A33]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              id="brand-home-btn"
              onClick={() => setActiveTab('screener')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-[#11141A] border border-[#252A33] flex items-center justify-center text-[#7FA6C9] group-hover:border-[#7FA6C9]/60 transition">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-base tracking-tight text-[#E8E9EB] font-sans">
                    Equity<span className="text-[#7FA6C9]">Lens</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#B8A36A]/10 text-[#B8A36A] border border-[#B8A36A]/30 font-mono font-medium">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-[#8B919C] font-mono tracking-tight hidden sm:block">
                  Institutional Research Terminal
                </p>
              </div>
            </button>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-[#11141A] p-1 rounded-lg border border-[#252A33]">
              <button
                id="nav-tab-screener"
                onClick={() => setActiveTab('screener')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'screener'
                    ? 'bg-[#151922] text-[#E8E9EB] border border-[#252A33]'
                    : 'text-[#8B919C] hover:text-[#E8E9EB] hover:bg-[#151922]/50'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Stock Screener</span>
              </button>

              <button
                id="nav-tab-detail"
                onClick={() => setActiveTab('detail')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'detail'
                    ? 'bg-[#151922] text-[#E8E9EB] border border-[#252A33]'
                    : 'text-[#8B919C] hover:text-[#E8E9EB] hover:bg-[#151922]/50'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Stock Analysis</span>
                {selectedStockSymbol && (
                  <span className="text-[10px] px-1 py-0.2 rounded bg-[#11141A] font-mono text-[#7FA6C9] border border-[#252A33]">
                    {selectedStockSymbol}
                  </span>
                )}
              </button>

              <button
                id="nav-tab-watchlist"
                onClick={() => setActiveTab('watchlist')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'watchlist'
                    ? 'bg-[#151922] text-[#E8E9EB] border border-[#252A33]'
                    : 'text-[#8B919C] hover:text-[#E8E9EB] hover:bg-[#151922]/50'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Watchlist</span>
                {watchlist.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#151922] font-mono text-[#8B919C] border border-[#252A33]">
                    {watchlist.length}
                  </span>
                )}
              </button>

              <button
                id="nav-tab-compare"
                onClick={() => setActiveTab('compare')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'compare'
                    ? 'bg-[#151922] text-[#E8E9EB] border border-[#252A33]'
                    : 'text-[#8B919C] hover:text-[#E8E9EB] hover:bg-[#151922]/50'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Compare</span>
                {compareList.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#7FA6C9]/15 text-[#7FA6C9] font-mono border border-[#7FA6C9]/30">
                    {compareList.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Search bar & Universe Actions */}
          <div className="flex items-center gap-2.5 flex-1 max-w-md justify-end">
            {/* Global Search with dropdown */}
            <div ref={searchRef} className="relative w-full max-w-xs sm:max-w-sm">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8B919C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="global-stock-search-input"
                  type="text"
                  placeholder="Search ticker or company (e.g. MSFT, Shakti, Reliance)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                  className="w-full bg-[#11141A] border border-[#252A33] rounded-lg pl-9 pr-14 py-1.5 text-xs text-[#E8E9EB] placeholder-[#8B919C]/60 focus:outline-none focus:border-[#7FA6C9] focus:ring-1 focus:ring-[#7FA6C9]/30 transition font-sans"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B919C] hover:text-[#E8E9EB]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  onOpenCommandPalette && (
                    <button
                      onClick={onOpenCommandPalette}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#151922] border border-[#252A33] text-[10px] font-mono text-[#8B919C] hover:text-[#E8E9EB] transition"
                      title="Open Terminal Command Palette (⌘K / Ctrl+K)"
                    >
                      ⌘K
                    </button>
                  )
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#11141A] border border-[#252A33] rounded-lg shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-3 text-center text-xs text-[#8B919C] flex items-center justify-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#7FA6C9]" />
                      Searching global markets...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-1 divide-y divide-[#252A33]">
                      {searchResults.map((item) => (
                        <button
                          key={item.symbol}
                          id={`search-result-${item.symbol}`}
                          onClick={() => handleSelectResult(item.symbol)}
                          className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-[#151922] transition group"
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold text-xs text-[#7FA6C9] group-hover:underline">
                                {item.symbol}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#151922] text-[#8B919C] font-mono border border-[#252A33]">
                                {item.exchange}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#E8E9EB] truncate max-w-[200px]">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#8B919C]">
                            <span>{item.country}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition text-[#7FA6C9]" />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-xs text-[#8B919C] mb-2">No matching symbols found.</p>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          onOpenAddModal();
                        }}
                        className="text-xs text-[#7FA6C9] hover:underline inline-flex items-center gap-1 font-medium"
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#252A33] bg-[#11141A] hover:bg-[#151922] text-xs font-medium text-[#8B919C] hover:text-[#E8E9EB] transition-all shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8B919C]" />
              <span className="hidden sm:inline">Mode:</span>
              <span className="font-medium text-[#E8E9EB]">{experienceLevel === 'beginner' ? 'Beginner' : 'Pro'}</span>
            </button>

            {/* Add Custom Ticker Button */}
            <button
              id="header-add-ticker-btn"
              onClick={onOpenAddModal}
              title="Add any custom stock to screener"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11141A] hover:bg-[#151922] border border-[#252A33] text-xs font-medium text-[#8B919C] hover:text-[#E8E9EB] transition shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#8B919C]" />
              <span className="hidden sm:inline">Add Ticker</span>
            </button>

            {/* Refresh Button */}
            <button
              id="header-refresh-btn"
              onClick={onRefreshUniverse}
              disabled={isRefreshing}
              title="Refresh universe fundamentals and quotes"
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#11141A] hover:bg-[#151922] border border-[#252A33] text-[#8B919C] hover:text-[#E8E9EB] transition shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#E8E9EB]' : ''}`} />
            </button>

            {/* User Account / Sign Out */}
            {user && (
              <div className="flex items-center gap-1.5 pl-1 sm:pl-2 border-l border-[#252A33]">
                <div
                  className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#11141A] border border-[#252A33] text-[11px] font-mono text-[#8B919C]"
                  title={`Logged in as ${user.email}`}
                >
                  <UserIcon className="w-3 h-3 text-[#8B919C]" />
                  <span className="truncate max-w-[100px] text-[#E8E9EB]">{user.name}</span>
                  {user.isGuest && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#151922] text-[#8B919C] border border-[#252A33]">
                      GUEST
                    </span>
                  )}
                </div>
                <button
                  id="header-logout-btn"
                  onClick={logout}
                  title="Sign out / Switch account"
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#11141A] hover:bg-[#151922] hover:text-[#B87878] border border-[#252A33] text-[#8B919C] transition shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex md:hidden items-center justify-between py-2.5 border-t border-[#252A33] text-xs overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('screener')}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium ${activeTab === 'screener' ? 'bg-[#151922] text-[#E8E9EB] border border-[#252A33]' : 'text-[#8B919C]'}`}
          >
            Screener
          </button>
          <button
            onClick={() => setActiveTab('detail')}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium ${activeTab === 'detail' ? 'bg-[#151922] text-[#E8E9EB] border border-[#252A33]' : 'text-[#8B919C]'}`}
          >
            Stock Analysis
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium ${activeTab === 'watchlist' ? 'bg-[#151922] text-[#E8E9EB] border border-[#252A33]' : 'text-[#8B919C]'}`}
          >
            Watchlist ({watchlist.length})
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium ${activeTab === 'compare' ? 'bg-[#151922] text-[#E8E9EB] border border-[#252A33]' : 'text-[#8B919C]'}`}
          >
            Compare ({compareList.length})
          </button>
          <button
            onClick={toggleExperienceLevel}
            className="px-2 py-1 rounded-lg shrink-0 text-[11px] bg-[#11141A] border border-[#252A33] text-[#8B919C] font-medium"
          >
            {experienceLevel === 'beginner' ? 'Beg' : 'Pro'}
          </button>
        </div>
      </div>
    </header>
  );
};
