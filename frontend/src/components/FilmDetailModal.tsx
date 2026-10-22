import React from 'react';
import { X, ExternalLink, Star, Edit3, Trash2, CheckCircle2, Clock, Ban, Calendar, Film as FilmIcon, MessageSquare, Link as LinkIcon } from 'lucide-react';
import { Film } from '../types';

interface FilmDetailModalProps {
  film: Film | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (film: Film) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, currentStatus: string) => void;
  onRatingChange: (id: number, rating: number) => void;
}

export const FilmDetailModal: React.FC<FilmDetailModalProps> = ({
  film,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
  onRatingChange,
}) => {
  if (!isOpen || !film) return null;

  const getStatusBadge = () => {
    switch (film.status) {
      case 'watched':
        return (
          <button
            onClick={() => onToggleStatus(film.id, film.status)}
            title="Нажмите, чтобы перевести в «В планах»"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cat-green/15 text-cat-green border border-cat-green/30 hover:bg-cat-green/25 active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Просмотрено</span>
          </button>
        );
      case 'dropped':
        return (
          <button
            onClick={() => onToggleStatus(film.id, film.status)}
            title="Нажмите, чтобы перевести в «В планах»"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cat-red/15 text-cat-red border border-cat-red/30 hover:bg-cat-red/25 active:scale-95 transition-all"
          >
            <Ban className="w-4 h-4" />
            <span>Брошено</span>
          </button>
        );
      default:
        return (
          <button
            onClick={() => onToggleStatus(film.id, film.status)}
            title="Нажмите, чтобы отметить «Просмотрено»"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cat-peach/15 text-cat-peach border border-cat-peach/30 hover:bg-cat-peach/25 active:scale-95 transition-all"
          >
            <Clock className="w-4 h-4" />
            <span>В планах</span>
          </button>
        );
    }
  };

  const getDomain = (url: string) => {
    try {
      const u = new URL(url);
      return u.hostname.replace('www.', '');
    } catch {
      return 'Ссылка';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cat-crust/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-cat-mantle border border-cat-surface1 shadow-2xl p-6 sm:p-7 overflow-hidden">
        
        {/* Top bar: ID and Close */}
        <div className="flex items-center justify-between pb-3 border-b border-cat-surface0/60 mb-5 text-xs text-cat-overlay0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-cat-surface0 text-cat-subtext0 font-mono">
              #{film.id}
            </span>
            {film.created_at && (
              <span className="flex items-center gap-1 text-cat-overlay0">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(film.created_at).toLocaleDateString('ru-RU')}</span>
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-cat-overlay0 hover:text-cat-text hover:bg-cat-surface0 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title & Year */}
        <div className="mb-5">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cat-mauve/20 to-cat-lavender/30 border border-cat-mauve/40 flex items-center justify-center text-cat-mauve shrink-0 shadow-lg shadow-cat-crust/50">
              <FilmIcon className="w-6 h-6 text-cat-mauve" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-cat-text tracking-tight leading-snug">
                {film.title}
              </h2>
              {film.year && (
                <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-cat-surface0 text-cat-lavender border border-cat-surface1">
                  Год выпуска: {film.year}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status & Rating row */}
        <div className="p-4 rounded-2xl bg-cat-surface0/50 border border-cat-surface1/60 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status */}
          <div>
            <div className="text-[11px] font-medium text-cat-overlay0 uppercase tracking-wider mb-1.5">
              Статус просмотра
            </div>
            {getStatusBadge()}
          </div>

          {/* Rating */}
          <div>
            <div className="text-[11px] font-medium text-cat-overlay0 uppercase tracking-wider mb-1.5">
              Оценка фильма
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => onRatingChange(film.id, film.rating === star ? 0 : star)}
                    className="p-1 hover:scale-125 transition-transform"
                    title={`Поставить оценку ${star}`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= film.rating
                          ? 'fill-cat-yellow text-cat-yellow'
                          : 'text-cat-surface2 hover:text-cat-yellow/60'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-semibold text-cat-yellow ml-1">
                {film.rating > 0 ? `${film.rating}/5` : 'Нет оценки'}
              </span>
            </div>
          </div>
        </div>

        {/* Watch Link */}
        <div className="mb-4">
          {film.url ? (
            <a
              href={film.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-cat-mauve hover:bg-cat-mauve/90 text-cat-crust font-semibold text-sm transition-all active:scale-[0.99] shadow-lg shadow-cat-mauve/20"
            >
              <span>Смотреть на {getDomain(film.url)}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <button
              onClick={() => {
                onClose();
                onEdit(film);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-cat-surface0/60 hover:bg-cat-surface0 text-cat-subtext0 border border-dashed border-cat-surface2 text-xs transition-colors"
            >
              <LinkIcon className="w-3.5 h-3.5 text-cat-lavender" />
              <span>Добавить ссылку на просмотр</span>
            </button>
          )}
        </div>

        {/* Notes / Comment section */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-xs font-medium text-cat-subtext0 uppercase tracking-wider mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-cat-lavender" />
            <span>Заметки и впечатления</span>
          </div>

          {film.comment ? (
            <div className="p-3.5 rounded-2xl bg-cat-surface0/70 border border-cat-surface1 text-cat-text text-sm italic leading-relaxed">
              "{film.comment}"
            </div>
          ) : (
            <p className="text-xs text-cat-overlay0 italic px-1">
              Заметок пока нет.
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-cat-surface0/70">
          <button
            onClick={() => onDelete(film.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-cat-red/80 hover:text-cat-red hover:bg-cat-red/10 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Удалить фильм</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(film);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cat-surface0 hover:bg-cat-surface1 text-cat-text text-xs font-semibold border border-cat-surface1 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-cat-mauve" />
              <span>Редактировать</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-cat-surface1 hover:bg-cat-surface2 text-cat-subtext1 text-xs font-semibold transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
