import React, { useState, useRef, useEffect } from 'react';
import { Film as FilmIcon, Plus, Dices, Download, CheckCircle2, Clock, Star, Sparkles } from 'lucide-react';
import { Stats } from '../types';
import { getExportUrl } from '../api';

interface HeaderProps {
  stats: Stats;
  onAddClick: () => void;
  onRandomClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ stats, onAddClick, onRandomClick }) => {
  const [exportOpen, setExportOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="border-b border-cat-surface0/60 bg-cat-mantle/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cat-mauve/20 to-cat-lavender/30 border border-cat-mauve/40 flex items-center justify-center text-cat-mauve shadow-lg shadow-cat-crust/50">
                <FilmIcon className="w-5 h-5 text-cat-mauve" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-cat-text tracking-tight flex items-center gap-2">
                  Films List
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cat-surface0 text-cat-lavender border border-cat-surface1">
                    v1.0
                  </span>
                </h1>
                <p className="text-xs text-cat-subtext0">Минималистичная база фильмов</p>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={onRandomClick}
                title="Случайный фильм"
                className="p-2 rounded-xl bg-cat-surface0 hover:bg-cat-surface1 text-cat-peach border border-cat-surface1 active:scale-95 transition-all"
              >
                <Dices className="w-5 h-5" />
              </button>
              <button
                onClick={onAddClick}
                title="Добавить фильм"
                className="p-2 rounded-xl bg-cat-mauve text-cat-crust font-semibold active:scale-95 transition-all shadow-md"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cat-surface0/70 border border-cat-surface1/60 text-cat-subtext1 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-cat-lavender" />
              <span>Всего:</span>
              <strong className="text-cat-text font-semibold">{stats.total}</strong>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cat-surface0/70 border border-cat-surface1/60 text-cat-subtext1 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-cat-peach" />
              <span>В планах:</span>
              <strong className="text-cat-peach font-semibold">{stats.plan}</strong>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cat-surface0/70 border border-cat-surface1/60 text-cat-subtext1 whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5 text-cat-green" />
              <span>Просмотрено:</span>
              <strong className="text-cat-green font-semibold">{stats.watched}</strong>
            </div>

            {stats.avg_rating > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cat-surface0/70 border border-cat-surface1/60 text-cat-subtext1 whitespace-nowrap">
                <Star className="w-3.5 h-3.5 fill-cat-yellow text-cat-yellow" />
                <span>Ср. оценка:</span>
                <strong className="text-cat-yellow font-semibold">{stats.avg_rating.toFixed(1)}</strong>
              </div>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={onRandomClick}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cat-surface0 hover:bg-cat-surface1 text-cat-peach border border-cat-surface1 font-medium text-sm transition-all active:scale-95 hover:shadow-md"
            >
              <Dices className="w-4 h-4 text-cat-peach" />
              <span>Что посмотреть?</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cat-surface0 hover:bg-cat-surface1 text-cat-subtext1 border border-cat-surface1 font-medium text-sm transition-all active:scale-95"
              >
                <Download className="w-4 h-4 text-cat-lavender" />
                <span>Экспорт</span>
              </button>

              {exportOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-cat-surface0 border border-cat-surface1 shadow-xl shadow-cat-crust/80 py-1.5 z-50">
                  <a
                    href={getExportUrl('csv')}
                    download
                    onClick={() => setExportOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-cat-text hover:bg-cat-surface1 hover:text-cat-mauve transition-colors"
                  >
                    <span>Выгрузить в CSV (.csv)</span>
                  </a>
                  <a
                    href={getExportUrl('json')}
                    download
                    onClick={() => setExportOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-cat-text hover:bg-cat-surface1 hover:text-cat-mauve transition-colors"
                  >
                    <span>Выгрузить в JSON (.json)</span>
                  </a>
                </div>
              )}
            </div>

            {/* Add Film */}
            <button
              onClick={onAddClick}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cat-mauve hover:bg-cat-mauve/90 text-cat-crust font-semibold text-sm transition-all active:scale-95 shadow-lg shadow-cat-mauve/20"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить фильм</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
