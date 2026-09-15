import React, { createContext, useContext, useState, useEffect } from 'react';

interface WatchlistContextType {
  watchlist: string[];
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  toggleWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | null>(null);

const STORAGE_KEY = 'equitylens_watchlist_v1';

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['MSFT', 'SHAKTIPUMP.NS', 'RELIANCE.NS', 'NVDA'];
    } catch {
      return ['MSFT', 'SHAKTIPUMP.NS', 'RELIANCE.NS', 'NVDA'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    } catch (e) {
      console.error('Failed to save watchlist to localStorage', e);
    }
  }, [watchlist]);

  const addToWatchlist = (symbol: string) => {
    const upper = symbol.toUpperCase();
    if (!watchlist.includes(upper)) {
      setWatchlist(prev => [...prev, upper]);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    const upper = symbol.toUpperCase();
    setWatchlist(prev => prev.filter(s => s !== upper));
  };

  const toggleWatchlist = (symbol: string) => {
    const upper = symbol.toUpperCase();
    if (watchlist.includes(upper)) {
      removeFromWatchlist(upper);
    } else {
      addToWatchlist(upper);
    }
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.includes(symbol.toUpperCase());
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        isInWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
