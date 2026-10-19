import React from 'react';
import { Search, X, LayoutGrid, ListFilter, ArrowUpDown } from 'lucide-react';
import { FilterStatus, SortOption, Stats } from '../types';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: FilterStatus;
  onStatusChange: (status: FilterStatus) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  stats: Stats;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  stats,
}) => {
  const tabs: { key: FilterStatus; label: string; count: number }[] = [
    { key: 'all', label: 'Все', count: stats.total },
    { key: 'plan', label: 'В планах', count: stats.plan },
    { key: 'watched', label: 'Просмотрено', count: stats.watched },
    { key: 'dropped', label: 'Брошено', count: stats.dropped },
  ];

  return (
    <div className="space-y-3.5 mb-6">
      {/* Top row: Search & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-cat-overlay0 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск по названию или заметке..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-cat-surface0/80 border border-cat-surface1 text-cat-text placeholder-cat-overlay0 text-sm focus:outline-none focus:border-cat-mauve focus:ring-1 focus:ring-cat-mauve transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cat-overlay0 hover:text-cat-text p-0.5 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort and View Mode */}
        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-start">
          {/* Sort selector */}
          <div className="relative flex-1 sm:flex-none">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cat-surface0/80 border border-cat-surface1 text-xs text-cat-subtext1">
              <ArrowUpDown className="w-3.5 h-3.5 text-cat-lavender shrink-0" />
              <select
                value={sort}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                aria-label="Сортировка фильмов"
                className="bg-transparent text-cat-text text-xs focus:outline-none cursor-pointer pr-4"
              >
                <option value="created_desc" className="bg-cat-surface0 text-cat-text">Сначала новые</option>
                <option value="title_asc" className="bg-cat-surface0 text-cat-text">По названию (А-Я)</option>
                <option value="title_desc" className="bg-cat-surface0 text-cat-text">По названию (Я-А)</option>
                <option value="year_desc" className="bg-cat-surface0 text-cat-text">По году (новые)</option>
                <option value="year_asc" className="bg-cat-surface0 text-cat-text">По году (старые)</option>
                <option value="rating_desc" className="bg-cat-surface0 text-cat-text">По оценке (высокая)</option>
                <option value="rating_asc" className="bg-cat-surface0 text-cat-text">По оценке (низкая)</option>
              </select>
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center p-1 rounded-xl bg-cat-surface0/80 border border-cat-surface1">
            <button
              onClick={() => onViewModeChange('grid')}
              title="Сетка карточек"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-cat-surface1 text-cat-mauve shadow-sm'
                  : 'text-cat-overlay1 hover:text-cat-text'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              title="Компактный список"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-cat-surface1 text-cat-mauve shadow-sm'
                  : 'text-cat-overlay1 hover:text-cat-text'
              }`}
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Bottom row: Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = status === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onStatusChange(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-cat-mauve text-cat-crust shadow-md shadow-cat-mauve/20 font-semibold'
                  : 'bg-cat-surface0/60 hover:bg-cat-surface0 text-cat-subtext0 border border-cat-surface1/60 hover:text-cat-text'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-cat-crust/20 text-cat-crust font-bold'
                    : 'bg-cat-surface1 text-cat-subtext1'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
