import React from 'react';
import { ExternalLink, Star, Edit3, Trash2, CheckCircle2, Clock, Ban } from 'lucide-react';
import { Film } from '../types';

interface FilmRowProps {
  film: Film;
  onEdit: (film: Film) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, currentStatus: string) => void;
  onRatingChange: (id: number, rating: number) => void;
}

export const FilmRow: React.FC<FilmRowProps> = ({
  film,
  onEdit,
  onDelete,
  onToggleStatus,
  onRatingChange,
}) => {
  const getStatusIcon = () => {
    switch (film.status) {
      case 'watched':
        return (
          <button
            onClick={() => onToggleStatus(film.id, film.status)}
            title="Просмотрено (нажмите, чтобы изменить)"
            className="p-1.5 rounded-lg text-cat-green bg-cat-green/10 hover:bg-cat-green/20 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        );
      case 'dropped':
        return (
          <button
            onClick={() => onToggleStatus(film.id, film.status)}
            title="Брошено (нажмите, чтобы изменить)"
            className="p-1.5 rounded-lg text-cat-red bg-cat-red/10 hover:bg-cat-red/20 transition-all"
          >
            <Ban className="w-4 h-4" />
          </button>
        );
      default:
        return (
          <button
            onClick={() => onToggleStatus(film.id, film.status)}
            title="В планах (нажмите, чтобы отметить просмотренным)"
            className="p-1.5 rounded-lg text-cat-peach bg-cat-peach/10 hover:bg-cat-peach/20 transition-all"
          >
            <Clock className="w-4 h-4" />
          </button>
        );
    }
  };

  return (
    <div className="group flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-cat-surface0/50 hover:bg-cat-surface0 border border-cat-surface1/60 hover:border-cat-surface2 transition-all">
      
      {/* Left: Status icon & Title + Year */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {getStatusIcon()}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-cat-text group-hover:text-cat-mauve transition-colors truncate">
              {film.title}
            </span>
            {film.year && (
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-cat-surface1 text-cat-lavender shrink-0">
                {film.year}
              </span>
            )}
          </div>
          {film.comment && (
            <p className="text-xs text-cat-overlay0 truncate mt-0.5 italic">
              {film.comment}
            </p>
          )}
        </div>
      </div>

      {/* Middle/Right: Rating, Link, and Actions */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Stars */}
        <div className="hidden sm:flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(film.id, film.rating === star ? 0 : star)}
              className="p-0.5 hover:scale-125 transition-transform"
              title={`Оценка ${star} из 5`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  star <= film.rating
                    ? 'fill-cat-yellow text-cat-yellow'
                    : 'text-cat-surface2 hover:text-cat-yellow/60'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Link */}
        {film.url && (
          <a
            href={film.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cat-mauve/20 hover:bg-cat-mauve text-cat-mauve hover:text-cat-crust transition-all shrink-0"
            title="Открыть ссылку"
          >
            <span className="hidden md:inline">Смотреть</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        {/* Edit & Delete */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(film)}
            className="p-1.5 rounded-lg text-cat-subtext0 hover:text-cat-mauve hover:bg-cat-surface1 transition-colors"
            title="Редактировать"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(film.id)}
            className="p-1.5 rounded-lg text-cat-subtext0 hover:text-cat-red hover:bg-cat-surface1 transition-colors"
            title="Удалить"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
