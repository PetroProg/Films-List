import React, { useState, useEffect } from 'react';
import { X, Dices, ExternalLink, CheckCircle2, Star, Sparkles } from 'lucide-react';
import { Film } from '../types';
import { fetchRandomFilm } from '../api';

interface RandomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMarkWatched: (id: number) => Promise<void>;
}

export const RandomModal: React.FC<RandomModalProps> = ({
  isOpen,
  onClose,
  onMarkWatched,
}) => {
  const [film, setFilm] = useState<Film | null>(null);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const roll = async () => {
    setLoading(true);
    setAnimating(true);
    try {
      const result = await fetchRandomFilm('plan');
      setTimeout(() => {
        setFilm(result);
        setAnimating(false);
        setLoading(false);
      }, 350);
    } catch {
      setAnimating(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      roll();
    } else {
      setFilm(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cat-crust/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-cat-mantle border border-cat-surface1 shadow-2xl p-6 overflow-hidden text-center">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-cat-overlay0 hover:text-cat-text hover:bg-cat-surface0 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cat-peach/20 to-cat-yellow/30 text-cat-peach border border-cat-peach/30 mb-3 shadow-lg">
          <Dices className={`w-8 h-8 ${animating ? 'animate-spin' : ''}`} />
        </div>

        <h2 className="text-xl font-bold text-cat-text mb-1 flex items-center justify-center gap-2">
          <span>Что посмотреть?</span>
          <Sparkles className="w-4 h-4 text-cat-yellow" />
        </h2>
        <p className="text-xs text-cat-subtext0 mb-6">
          Случайный выбор из списка «В планах»
        </p>

        {/* Movie Card Result */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-cat-peach border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-cat-subtext1">Выбираем идеальный фильм...</p>
          </div>
        ) : film ? (
          <div className="rounded-2xl bg-cat-surface0/90 border border-cat-surface1 p-5 mb-6 text-left shadow-inner">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-lg font-bold text-cat-text">
                {film.title}
              </h3>
              {film.year && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-cat-surface1 text-cat-lavender border border-cat-surface2/40">
                  {film.year}
                </span>
              )}
            </div>

            {film.rating > 0 && (
              <div className="flex items-center gap-1 mb-3">
                {[...Array(film.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-cat-yellow text-cat-yellow" />
                ))}
              </div>
            )}

            {film.comment && (
              <p className="text-xs text-cat-subtext0 bg-cat-mantle/70 rounded-xl p-3 italic border border-cat-surface1/40">
                "{film.comment}"
              </p>
            )}

            {film.url && (
              <div className="mt-4 pt-3 border-t border-cat-surface1">
                <a
                  href={film.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-cat-mauve text-cat-crust font-semibold text-xs transition-all hover:bg-cat-mauve/90 active:scale-95"
                >
                  <span>Перейти к просмотру</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-cat-subtext0 text-sm">
            В списке «В планах» пока нет фильмов!
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={roll}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cat-surface0 hover:bg-cat-surface1 text-cat-peach border border-cat-peach/40 text-sm font-semibold transition-all active:scale-95"
          >
            <Dices className="w-4 h-4" />
            <span>Крутить ещё</span>
          </button>

          {film && (
            <button
              onClick={async () => {
                await onMarkWatched(film.id);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cat-green text-cat-crust text-sm font-semibold transition-all active:scale-95 hover:bg-cat-green/90"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Просмотрено</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
