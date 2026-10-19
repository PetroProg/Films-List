import { useState, useEffect, useCallback } from 'react';
import { Film, Stats, FilterStatus, SortOption } from './types';
import {
  fetchFilms,
  createFilm,
  updateFilm,
  deleteFilm,
  updateFilmStatus,
  updateFilmRating,
} from './api';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { FilmCard } from './components/FilmCard';
import { FilmRow } from './components/FilmRow';
import { FilmModal } from './components/FilmModal';
import { RandomModal } from './components/RandomModal';
import { Film as FilmIcon, Plus, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [films, setFilms] = useState<Film[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    plan: 0,
    watched: 0,
    dropped: 0,
    avg_rating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Controls
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<FilterStatus>('all');
  const [sort, setSort] = useState<SortOption>('created_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFilm, setEditingFilm] = useState<Film | null>(null);
  const [isRandomOpen, setIsRandomOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchFilms({ status, search, sort });
      setFilms(res.films);
      setStats(res.stats);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, [status, search, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Status toggle handler
  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'watched' ? 'plan' : 'watched';
    try {
      // Optimistic update
      setFilms((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: newStatus as any } : f))
      );
      await updateFilmStatus(id, newStatus);
      showToast(
        newStatus === 'watched'
          ? 'Отмечено как просмотренное!'
          : 'Возвращено в список «В планах»'
      );
      // Refresh stats
      const res = await fetchFilms({ status, search, sort });
      setStats(res.stats);
    } catch (err) {
      showToast('Не удалось обновить статус', 'error');
      loadData();
    }
  };

  // Rating change handler
  const handleRatingChange = async (id: number, rating: number) => {
    try {
      setFilms((prev) =>
        prev.map((f) => (f.id === id ? { ...f, rating } : f))
      );
      await updateFilmRating(id, rating);
      showToast(rating > 0 ? `Оценка ${rating}/5 сохранена` : 'Оценка снята');
      const res = await fetchFilms({ status, search, sort });
      setStats(res.stats);
    } catch {
      showToast('Не удалось обновить оценку', 'error');
      loadData();
    }
  };

  // Save Film (Add or Edit)
  const handleSaveFilm = async (data: {
    title: string;
    year?: number | null;
    url?: string;
    status: 'plan' | 'watched' | 'dropped';
    rating: number;
    comment?: string;
  }) => {
    if (editingFilm) {
      await updateFilm(editingFilm.id, data);
      showToast('Фильм успешно обновлен');
    } else {
      await createFilm(data);
      showToast('Новый фильм добавлен');
    }
    loadData();
  };

  // Delete handler
  const handleDeleteFilm = async (id: number) => {
    const target = films.find((f) => f.id === id);
    const title = target ? `«${target.title}»` : 'фильм';
    if (!window.confirm(`Вы уверены, что хотите удалить ${title}?`)) return;

    try {
      setFilms((prev) => prev.filter((f) => f.id !== id));
      await deleteFilm(id);
      showToast('Фильм удален');
      const res = await fetchFilms({ status, search, sort });
      setStats(res.stats);
    } catch {
      showToast('Не удалось удалить фильм', 'error');
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-cat-mantle text-cat-text flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl text-sm font-medium border flex items-center gap-2 ${
              toast.type === 'error'
                ? 'bg-cat-red/20 border-cat-red/40 text-cat-red'
                : 'bg-cat-surface0/95 border-cat-surface2 text-cat-text'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        stats={stats}
        onAddClick={() => {
          setEditingFilm(null);
          setIsModalOpen(true);
        }}
        onRandomClick={() => setIsRandomOpen(true)}
      />

      {/* Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          sort={sort}
          onSortChange={setSort}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          stats={stats}
        />

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-2xl bg-cat-red/15 border border-cat-red/30 text-cat-red flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cat-surface0 text-cat-text text-xs hover:bg-cat-surface1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Повторить</span>
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && films.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-2 border-cat-mauve border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-cat-subtext0">Загрузка коллекции...</p>
          </div>
        ) : films.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center rounded-3xl bg-cat-surface0/40 border border-cat-surface1/60 p-8 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-cat-surface0 border border-cat-surface1 flex items-center justify-center text-cat-mauve mx-auto mb-4">
              <FilmIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-cat-text mb-1">
              Ничего не найдено
            </h3>
            <p className="text-xs text-cat-subtext0 mb-6">
              {search || status !== 'all'
                ? 'По вашему запросу фильмов не найдено. Попробуйте сбросить фильтры.'
                : 'Ваша база фильмов пуста. Добавьте свой первый фильм!'}
            </p>
            <div className="flex items-center justify-center gap-2">
              {search || status !== 'all' ? (
                <button
                  onClick={() => {
                    setSearch('');
                    setStatus('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-cat-surface0 hover:bg-cat-surface1 border border-cat-surface1 text-xs font-semibold text-cat-text transition-colors"
                >
                  Сбросить фильтры
                </button>
              ) : null}
              <button
                onClick={() => {
                  setEditingFilm(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cat-mauve text-cat-crust text-xs font-semibold transition-all hover:bg-cat-mauve/90"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить фильм</span>
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {films.map((film) => (
              <FilmCard
                key={film.id}
                film={film}
                onEdit={(f) => {
                  setEditingFilm(f);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteFilm}
                onToggleStatus={handleToggleStatus}
                onRatingChange={handleRatingChange}
              />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-2">
            {films.map((film) => (
              <FilmRow
                key={film.id}
                film={film}
                onEdit={(f) => {
                  setEditingFilm(f);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteFilm}
                onToggleStatus={handleToggleStatus}
                onRatingChange={handleRatingChange}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Modal */}
      <FilmModal
        isOpen={isModalOpen}
        film={editingFilm}
        onClose={() => {
          setIsModalOpen(false);
          setEditingFilm(null);
        }}
        onSave={handleSaveFilm}
      />

      {/* Random Movie Picker Modal */}
      <RandomModal
        isOpen={isRandomOpen}
        onClose={() => setIsRandomOpen(false)}
        onMarkWatched={async (id) => {
          await handleToggleStatus(id, 'plan');
        }}
      />
    </div>
  );
}
