import React, { useState, useRef, useEffect } from 'react';
import { Film as FilmIcon, Plus, Dices, Download } from 'lucide-react';
import { getExportUrl } from '../api';

interface HeaderProps {
  onAddClick: () => void;
  onRandomClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddClick, onRandomClick }) => {
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
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cat-mauve/20 to-cat-lavender/30 border border-cat-mauve/40 flex items-center justify-center text-cat-mauve shadow-lg shadow-cat-crust/50">
              <FilmIcon className="w-5 h-5 text-cat-mauve" />
            </div>
            <h1 className="text-xl font-bold text-cat-text tracking-tight">
              Films List
            </h1>
          </div>

          {/* Right Actions: Desktop 3 blocks */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* 1. Random Film */}
            <button
              onClick={onRandomClick}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cat-surface0 hover:bg-cat-surface1 text-cat-peach border border-cat-surface1 font-medium text-sm transition-all active:scale-95 hover:shadow-md"
            >
              <Dices className="w-4 h-4 text-cat-peach" />
              <span>Что посмотреть?</span>
            </button>

            {/* 2. Export Dropdown */}
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

            {/* 3. Add Film */}
            <button
              onClick={onAddClick}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cat-mauve hover:bg-cat-mauve/90 text-cat-crust font-semibold text-sm transition-all active:scale-95 shadow-lg shadow-cat-mauve/20"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить фильм</span>
            </button>
          </div>

          {/* Right Actions: Mobile buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onRandomClick}
              title="Что посмотреть?"
              className="p-2 rounded-xl bg-cat-surface0 hover:bg-cat-surface1 text-cat-peach border border-cat-surface1 active:scale-95 transition-all"
            >
              <Dices className="w-5 h-5" />
            </button>
            <button
              onClick={() => setExportOpen(!exportOpen)}
              title="Экспорт"
              className="p-2 rounded-xl bg-cat-surface0 hover:bg-cat-surface1 text-cat-lavender border border-cat-surface1 active:scale-95 transition-all"
            >
              <Download className="w-5 h-5" />
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
      </div>
    </header>
  );
};
