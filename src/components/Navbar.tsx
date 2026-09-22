import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  Scale,
  RefreshCw,
  PlusCircle,
  TrendingUp,
  Building2,
  X,
  ExternalLink,
  Sparkles,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Command,
  Check,
  Shield,
  Layers,
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
  const { experienceLevel, setExperienceLevel } = useExperience();
  const { user, logout } = useAuth();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // User menu dropdown state
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for search & user menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
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
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#090B0E]/95 backdrop-blur-md border-b border-[#1F2633] shadow-md shadow-black/40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-2 sm:gap-4">
            
            {/* Left: Clean Brand Logo */}
            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              <button
                id="brand-home-btn"
                onClick={() => setActiveTab('screener')}
                className="flex items-center gap-2.5 text-left group focus:outline-none"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-[#161B26] to-[#0E1217] border border-[#242D3D] flex items-center justify-center text-[#38BDF8] group-hover:border-[#38BDF8]/60 group-hover:shadow-[0_0_15px_-3px_rgba(56,189,248,0.3)] transition-all">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight text-[#F0F2F5] font-sans">
                    Equity<span className="text-[#38BDF8]">Lens</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-gradient-to-r from-[#F59E0B]/20 to-[#D97706]/10 text-[#F59E0B] border border-[#F59E0B]/40 font-mono font-semibold tracking-wider">
                    PRO
                  </span>
                </div>
              </button>

              {/* Desktop / Laptop Segmented Navigation Tabs */}
              <nav className="hidden md:flex items-center gap-1 bg-[#0E1217] p-1 rounded-xl border border-[#1F2633] shadow-inner">
                <button
                  id="nav-tab-screener"
                  onClick={() => setActiveTab('screener')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'screener'
                      ? 'bg-[#161B26] text-[#F0F2F5] border border-[#2A3344] shadow-sm font-semibold'
                      : 'text-[#8E98A8] hover:text-[#F0F2F5] hover:bg-[#141820]/60'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Screener</span>
                </button>

                <button
                  id="nav-tab-detail"
                  onClick={() => setActiveTab('detail')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'detail'
                      ? 'bg-[#161B26] text-[#F0F2F5] border border-[#2A3344] shadow-sm font-semibold'
                      : 'text-[#8E98A8] hover:text-[#F0F2F5] hover:bg-[#141820]/60'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Analysis</span>
                  {selectedStockSymbol && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#0E1217] font-mono text-[#38BDF8] border border-[#1F2633] font-semibold">
                      {selectedStockSymbol}
                    </span>
                  )}
                </button>

                <button
                  id="nav-tab-watchlist"
                  onClick={() => setActiveTab('watchlist')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'watchlist'
                      ? 'bg-[#161B26] text-[#F0F2F5] border border-[#2A3344] shadow-sm font-semibold'
                      : 'text-[#8E98A8] hover:text-[#F0F2F5] hover:bg-[#141820]/60'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Watchlist</span>
                  {watchlist.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#0E1217] font-mono text-[#F59E0B] border border-[#F59E0B]/30 font-medium">
                      {watchlist.length}
                    </span>
                  )}
                </button>

                <button
                  id="nav-tab-compare"
                  onClick={() => setActiveTab('compare')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'compare'
                      ? 'bg-[#161B26] text-[#F0F2F5] border border-[#2A3344] shadow-sm font-semibold'
                      : 'text-[#8E98A8] hover:text-[#F0F2F5] hover:bg-[#141820]/60'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Compare</span>
                  {compareList.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#38BDF8]/15 text-[#38BDF8] font-mono border border-[#38BDF8]/40 font-semibold">
                      {compareList.length}
                    </span>
                  )}
                </button>
              </nav>
            </div>

            {/* Right: Search + Quick Add + Mode + Unified Profile Menu */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              
              {/* Desktop / Laptop Global Search */}
              <div ref={searchRef} className="hidden sm:block relative w-44 md:w-56 lg:w-64 transition-all">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#8E98A8] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="global-stock-search-input"
                    type="text"
                    placeholder="Search ticker (e.g. MSFT)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                    className="w-full bg-[#0E1217] border border-[#1F2633] rounded-lg pl-8 pr-11 py-1.5 text-xs text-[#F0F2F5] placeholder-[#8E98A8]/60 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/25 transition font-sans"
                  />
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8E98A8] hover:text-[#F0F2F5]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    onOpenCommandPalette && (
                      <button
                        onClick={onOpenCommandPalette}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#141820] border border-[#1F2633] text-[9px] font-mono text-[#8E98A8] hover:text-[#F0F2F5] transition"
                        title="Open Command Palette (⌘K)"
                      >
                        ⌘K
                      </button>
                    )
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {showDropdown && (
                  <div className="absolute top-full right-0 left-0 sm:left-auto sm:w-80 mt-1.5 bg-[#0E1217] border border-[#1F2633] rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-3 text-center text-xs text-[#8E98A8] flex items-center justify-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#38BDF8]" />
                        Searching global markets...
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-1 divide-y divide-[#1F2633]">
                        {searchResults.map((item) => (
                          <button
                            key={item.symbol}
                            id={`search-result-${item.symbol}`}
                            onClick={() => handleSelectResult(item.symbol)}
                            className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-[#141820] transition group"
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-semibold text-xs text-[#38BDF8] group-hover:underline">
                                  {item.symbol}
                                </span>
                                <span className="text-[9px] px-1 py-0.2 rounded bg-[#141820] text-[#8E98A8] font-mono border border-[#1F2633]">
                                  {item.exchange}
                                </span>
                              </div>
                              <span className="text-[11px] text-[#F0F2F5] truncate">
                                {item.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-[#8E98A8] shrink-0">
                              <span>{item.country}</span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition text-[#38BDF8]" />
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 text-center">
                        <p className="text-xs text-[#8E98A8] mb-1.5">No matching symbols found.</p>
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            onOpenAddModal();
                          }}
                          className="text-xs text-[#38BDF8] hover:underline inline-flex items-center gap-1 font-medium"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Add "{searchQuery}" to screener
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Search Button (triggers Command Palette / Quick Search) */}
              <button
                id="mobile-search-trigger-btn"
                onClick={onOpenCommandPalette}
                className="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-[#0E1217] border border-[#1F2633] text-[#8E98A8] hover:text-[#F0F2F5] hover:bg-[#141820] transition"
                title="Search stocks"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Add Custom Ticker Button */}
              <button
                id="header-add-ticker-btn"
                onClick={onOpenAddModal}
                title="Add custom stock to universe"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0E1217] hover:bg-[#141820] border border-[#1F2633] hover:border-[#2A3344] text-xs font-medium text-[#8E98A8] hover:text-[#F0F2F5] transition shrink-0 shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span className="hidden sm:inline font-medium">Add Ticker</span>
              </button>

              {/* Compact Mode Pill (Beginner vs Pro) */}
              <div className="hidden lg:inline-flex rounded-lg p-0.5 bg-[#0E1217] border border-[#1F2633]">
                <button
                  onClick={() => setExperienceLevel('beginner')}
                  className={`px-2.5 py-0.5 text-[11px] font-medium rounded transition ${
                    experienceLevel === 'beginner'
                      ? 'bg-[#141820] text-[#F0F2F5] border border-[#1F2633]'
                      : 'text-[#8E98A8] hover:text-[#F0F2F5]'
                  }`}
                  title="Beginner mode: Guided fundamental cards and contextual interpretations"
                >
                  Beg
                </button>
                <button
                  onClick={() => setExperienceLevel('pro')}
                  className={`px-2.5 py-0.5 text-[11px] font-medium rounded transition ${
                    experienceLevel === 'pro'
                      ? 'bg-[#141820] text-[#38BDF8] border border-[#1F2633] font-semibold'
                      : 'text-[#8E98A8] hover:text-[#F0F2F5]'
                  }`}
                  title="Pro mode: High-density ratios, formulas, and deep institutional metrics"
                >
                  Pro
                </button>
              </div>

              {/* Unified User & Terminal Controls Menu */}
              <div ref={userMenuRef} className="relative">
                <button
                  id="user-terminal-menu-btn"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition ${
                    isUserMenuOpen
                      ? 'bg-[#151922] border-[#7FA6C9]/40 text-[#E8E9EB]'
                      : 'bg-[#11141A] border-[#252A33] text-[#8B919C] hover:text-[#E8E9EB] hover:bg-[#151922]'
                  }`}
                  title="Account and Terminal settings"
                >
                  <div className="w-5 h-5 rounded-full bg-[#151922] border border-[#252A33] flex items-center justify-center text-[#7FA6C9]">
                    <UserIcon className="w-3 h-3" />
                  </div>
                  <span className="hidden xl:inline text-xs font-medium text-[#E8E9EB] max-w-[85px] truncate">
                    {user?.name?.split(' ')[0] || 'Guest'}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-[#8B919C] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Popover */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-64 bg-[#11141A] border border-[#252A33] rounded-xl shadow-2xl z-50 p-2 text-xs divide-y divide-[#252A33] animate-in fade-in slide-in-from-top-1 duration-150">
                    
                    {/* User Info Header */}
                    <div className="px-2 py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[#E8E9EB] truncate">{user?.name || 'Guest Analyst'}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#151922] text-[#8B919C] font-mono border border-[#252A33]">
                          {user?.isGuest ? 'GUEST' : 'MEMBER'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8B919C] font-mono truncate mt-0.5">
                        {user?.email || 'guest@equitylens.internal'}
                      </p>
                    </div>

                    {/* Terminal Mode Switch */}
                    <div className="px-2 py-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-[#8B919C]">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-[#7FA6C9]" />
                          <span>Experience Mode</span>
                        </span>
                        <span className="font-mono text-[#E8E9EB] font-medium capitalize">
                          {experienceLevel}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#0B0D10] rounded-lg border border-[#252A33]">
                        <button
                          onClick={() => setExperienceLevel('beginner')}
                          className={`py-1 text-[11px] rounded font-medium transition ${
                            experienceLevel === 'beginner'
                              ? 'bg-[#151922] text-[#E8E9EB] border border-[#252A33]'
                              : 'text-[#8B919C] hover:text-[#E8E9EB]'
                          }`}
                        >
                          Beginner
                        </button>
                        <button
                          onClick={() => setExperienceLevel('pro')}
                          className={`py-1 text-[11px] rounded font-medium transition ${
                            experienceLevel === 'pro'
                              ? 'bg-[#151922] text-[#7FA6C9] border border-[#252A33]'
                              : 'text-[#8B919C] hover:text-[#E8E9EB]'
                          }`}
                        >
                          Pro Analyst
                        </button>
                      </div>
                    </div>

                    {/* Universe Data Refresh */}
                    <div className="px-2 py-2 space-y-1">
                      <button
                        onClick={() => {
                          onRefreshUniverse();
                          setIsUserMenuOpen(false);
                        }}
                        disabled={isRefreshing}
                        className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-[#151922] text-[#8B919C] hover:text-[#E8E9EB] transition text-left"
                      >
                        <span className="flex items-center gap-2">
                          <RefreshCw className={`w-3.5 h-3.5 text-[#7FA6C9] ${isRefreshing ? 'animate-spin' : ''}`} />
                          <span>Refresh Universe</span>
                        </span>
                        <span className="font-mono text-[10px] text-[#8B919C]">
                          {universeCount} stocks
                        </span>
                      </button>
                      {lastUpdatedTime && (
                        <p className="text-[10px] text-[#8B919C] font-mono px-1">
                          Last sync: {lastUpdatedTime}
                        </p>
                      )}
                    </div>

                    {/* Shortcuts & Modals */}
                    <div className="px-2 py-2 space-y-0.5">
                      {onOpenCommandPalette && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenCommandPalette();
                          }}
                          className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-[#151922] text-[#8B919C] hover:text-[#E8E9EB] transition text-left"
                        >
                          <span className="flex items-center gap-2">
                            <Command className="w-3.5 h-3.5 text-[#8B919C]" />
                            <span>Command Palette</span>
                          </span>
                          <kbd className="px-1.5 py-0.5 rounded bg-[#0B0D10] border border-[#252A33] text-[9px] font-mono text-[#8B919C]">
                            ⌘K
                          </kbd>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenAddModal();
                        }}
                        className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#151922] text-[#8B919C] hover:text-[#E8E9EB] transition text-left"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-[#8B919C]" />
                        <span>Add Custom Stock</span>
                      </button>
                    </div>

                    {/* Sign out */}
                    <div className="px-2 pt-1.5 pb-0.5">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#B87878]/10 text-[#8B919C] hover:text-[#B87878] transition text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign out / Switch account</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Gold standard mobile UX) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0D10]/95 backdrop-blur-lg border-t border-[#252A33] px-2 py-1 flex items-center justify-around">
        <button
          id="mobile-nav-screener"
          onClick={() => setActiveTab('screener')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition min-h-[48px] ${
            activeTab === 'screener'
              ? 'text-[#7FA6C9]'
              : 'text-[#8B919C] hover:text-[#E8E9EB]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 mb-0.5" />
          <span>Screener</span>
        </button>

        <button
          id="mobile-nav-detail"
          onClick={() => setActiveTab('detail')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition min-h-[48px] relative ${
            activeTab === 'detail'
              ? 'text-[#7FA6C9]'
              : 'text-[#8B919C] hover:text-[#E8E9EB]'
          }`}
        >
          <Building2 className="w-4 h-4 mb-0.5" />
          <span>Analysis</span>
          {selectedStockSymbol && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#7FA6C9]" />
          )}
        </button>

        <button
          id="mobile-nav-watchlist"
          onClick={() => setActiveTab('watchlist')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition min-h-[48px] relative ${
            activeTab === 'watchlist'
              ? 'text-[#7FA6C9]'
              : 'text-[#8B919C] hover:text-[#E8E9EB]'
          }`}
        >
          <Bookmark className="w-4 h-4 mb-0.5" />
          <span>Watchlist</span>
          {watchlist.length > 0 && (
            <span className="absolute top-1 right-1.5 px-1 py-0.2 rounded-full bg-[#151922] border border-[#252A33] text-[9px] font-mono text-[#8B919C]">
              {watchlist.length}
            </span>
          )}
        </button>

        <button
          id="mobile-nav-compare"
          onClick={() => setActiveTab('compare')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition min-h-[48px] relative ${
            activeTab === 'compare'
              ? 'text-[#7FA6C9]'
              : 'text-[#8B919C] hover:text-[#E8E9EB]'
          }`}
        >
          <Scale className="w-4 h-4 mb-0.5" />
          <span>Compare</span>
          {compareList.length > 0 && (
            <span className="absolute top-1 right-1.5 px-1 py-0.2 rounded-full bg-[#7FA6C9]/20 border border-[#7FA6C9]/40 text-[9px] font-mono text-[#7FA6C9]">
              {compareList.length}
            </span>
          )}
        </button>
      </nav>
    </>
  );
};
