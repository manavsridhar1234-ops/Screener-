import React, { useState, useEffect, useCallback } from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Search,
  PlusCircle,
  Database,
  Filter,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import type {
  NormalizedStock,
  ScreenerFilters,
  ScreenerPreset,
  TableColumnId,
} from '../../types';
import {
  fetchScreenerStocks,
  fetchPresets,
  type ScreenerResponse,
} from '../../services/api';
import { PresetsBar } from './PresetsBar';
import { ActiveFilterChips } from './ActiveFilterChips';
import { ScreenerFiltersComponent } from './ScreenerFilters';
import { ScreenerTable } from './ScreenerTable';
import {
  ColumnPickerModal,
  DEFAULT_VISIBLE_COLUMNS,
  ALL_COLUMNS,
} from './ColumnPickerModal';
import { AddStockModal } from './AddStockModal';

interface ScreenerViewProps {
  onSelectStock: (symbol: string) => void;
  compareList: string[];
  onToggleCompare: (symbol: string) => void;
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
  onOpenAddModal: () => void;
  universeCount: number;
}

export const ScreenerView: React.FC<ScreenerViewProps> = ({
  onSelectStock,
  compareList,
  onToggleCompare,
  isAddModalOpen,
  onCloseAddModal,
  onOpenAddModal,
  universeCount,
}) => {
  // Filters state
  const [filters, setFilters] = useState<Partial<ScreenerFilters>>({
    search: '',
    universe: 'all',
    marketCapCategory: 'all',
    sectors: [],
    exchanges: [],
  });

  // Presets
  const [presets, setPresets] = useState<ScreenerPreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<string>('marketCap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Screener response data
  const [stocks, setStocks] = useState<NormalizedStock[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const [availableExchanges, setAvailableExchanges] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // UI Modals & Panels
  const [isFiltersExpanded, setIsFiltersExpanded] = useState<boolean>(false);
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState<boolean>(false);

  // Table Columns configuration (persisted to localStorage)
  const [visibleColumns, setVisibleColumns] = useState<TableColumnId[]>(() => {
    try {
      const saved = localStorage.getItem('equitylens_table_columns_v1');
      return saved ? JSON.parse(saved) : DEFAULT_VISIBLE_COLUMNS;
    } catch {
      return DEFAULT_VISIBLE_COLUMNS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('equitylens_table_columns_v1', JSON.stringify(visibleColumns));
    } catch (e) {
      console.error(e);
    }
  }, [visibleColumns]);

  // Load presets on mount
  useEffect(() => {
    fetchPresets()
      .then(setPresets)
      .catch((err) => console.error('Failed to load presets:', err));
  }, []);

  // Fetch stocks query
  const loadStocks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res: ScreenerResponse = await fetchScreenerStocks(
        filters,
        sortBy,
        sortOrder,
        page,
        pageSize
      );
      setStocks(res.stocks);
      setTotalCount(res.total);
      setTotalPages(res.totalPages);
      setAvailableSectors(res.availableSectors);
      setAvailableExchanges(res.availableExchanges);
      setLastUpdated(res.lastUpdated);
    } catch (err) {
      console.error('Failed to fetch screener stocks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortBy, sortOrder, page, pageSize]);

  // Execute query on dependency change
  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  // Sort handler
  const handleSort = (colId: string) => {
    if (sortBy === colId) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(colId);
      setSortOrder('desc');
    }
    setPage(1);
  };

  // Filter handlers
  const handleUpdateFilter = (key: keyof ScreenerFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setActivePresetId(null);
    setPage(1);
  };

  const handleRemoveFilter = (key: keyof ScreenerFilters) => {
    setFilters(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setActivePresetId(null);
    setPage(1);
  };

  const handleRemoveArrayItem = (key: 'sectors' | 'exchanges', item: string) => {
    setFilters(prev => {
      const current = prev[key] || [];
      return {
        ...prev,
        [key]: current.filter(x => x !== item),
      };
    });
    setActivePresetId(null);
    setPage(1);
  };

  const handleClearAllFilters = () => {
    setFilters({
      search: '',
      universe: 'all',
      marketCapCategory: 'all',
      sectors: [],
      exchanges: [],
    });
    setActivePresetId(null);
    setPage(1);
  };

  // Presets handlers
  const handleSelectPreset = (preset: ScreenerPreset) => {
    setActivePresetId(preset.id);
    setFilters(prev => ({
      search: prev.search || '',
      universe: prev.universe || 'all',
      ...preset.filters,
    }));
    if (preset.sortBy) {
      setSortBy(preset.sortBy);
      setSortOrder(preset.sortOrder || 'desc');
    }
    setPage(1);
  };

  const handleClearPreset = () => {
    setActivePresetId(null);
    handleClearAllFilters();
  };

  // Column picker handlers
  const handleToggleColumn = (colId: TableColumnId) => {
    setVisibleColumns(prev =>
      prev.includes(colId) ? prev.filter(c => c !== colId) : [...prev, colId]
    );
  };

  const handleResetColumns = () => {
    setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
  };

  const handleSelectAllColumns = () => {
    setVisibleColumns(ALL_COLUMNS.map(c => c.id));
  };

  const handleStockAdded = (newStock: NormalizedStock) => {
    loadStocks();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Strategy Presets */}
      <div className="bg-[#121622] border border-[#1E2638] rounded-xl p-4 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 border-b border-[#1E2638] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Institutional Stock Screener</h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 font-mono">
                {universeCount} equities tracked
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-metric filtering across US & Indian equities with live valuation multiples, profitability margins, and solvency ratios.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="toggle-filter-panel-btn"
              onClick={() => setIsFiltersExpanded(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                isFiltersExpanded
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-[#151B28] text-slate-200 border-[#1E2638] hover:bg-[#1A2234]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{isFiltersExpanded ? 'Hide Filter Controls' : 'Advanced Filters'}</span>
            </button>

            <button
              id="quick-add-stock-btn"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-medium transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Ticker</span>
            </button>
          </div>
        </div>

        {/* Strategy Presets Horizontal Bar */}
        <PresetsBar
          presets={presets}
          activePresetId={activePresetId}
          onSelectPreset={handleSelectPreset}
          onClearPreset={handleClearPreset}
        />

        {/* Active Filter Chips */}
        <ActiveFilterChips
          filters={filters}
          onRemoveFilter={handleRemoveFilter}
          onClearAllFilters={handleClearAllFilters}
          onRemoveArrayItem={handleRemoveArrayItem}
        />
      </div>

      {/* Collapsible Advanced Filters Section */}
      {isFiltersExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <ScreenerFiltersComponent
            filters={filters}
            onUpdateFilter={handleUpdateFilter}
            availableSectors={availableSectors}
            availableExchanges={availableExchanges}
          />
        </div>
      )}

      {/* Main Results Table */}
      <ScreenerTable
        stocks={stocks}
        totalCount={totalCount}
        isLoading={isLoading}
        visibleColumns={visibleColumns}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onOpenColumnPicker={() => setIsColumnPickerOpen(true)}
        onSelectStock={onSelectStock}
        compareList={compareList}
        onToggleCompare={onToggleCompare}
        onClearFilters={handleClearAllFilters}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onChangePage={setPage}
        onChangePageSize={(sz) => {
          setPageSize(sz);
          setPage(1);
        }}
      />

      {/* Column Picker Modal */}
      <ColumnPickerModal
        isOpen={isColumnPickerOpen}
        onClose={() => setIsColumnPickerOpen(false)}
        visibleColumns={visibleColumns}
        onToggleColumn={handleToggleColumn}
        onResetColumns={handleResetColumns}
        onSelectAllColumns={handleSelectAllColumns}
      />

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        onStockAdded={handleStockAdded}
      />
    </div>
  );
};
