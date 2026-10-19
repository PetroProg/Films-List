import React from 'react';
import { ExternalLink, Star, Edit3, Trash2, CheckCircle2, Clock, Ban } from 'lucide-react';
import { Film } from '../types';

interface FilmCardProps {
  film: Film;
  onEdit: (film: Film) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, currentStatus: string) => void;
  onRatingChange: (id: number, rating: number) => void;
}

export const FilmCard: React.FC<FilmCardProps> = ({
  film,
  onEdit,
  onDelete,
  onToggleStatus,
  onRatingChange,
}) => {
  const getStatusBadge = () => {
    switch (film.status) {
      case 'watched':
        return (
          <button
            onClick={() => onToggleStatus(film.id, film.status)}
            title="Нажмите, чтобы перевести в статус «В планах»"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-cat-green/15 text-cat-green border border-cat-green/30 hover:bg-cat-green/25 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Просмотрено</span>
          </button>
        );
      case 'dropped':
        return (
          <button
            onClick={() => onToggleStatus(film.id, film.status)}
            title="Нажмите, чтобы перевести в статус «В планах»"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-cat-red/15 text-cat-red border border-cat-red/30 hover:bg-cat-red/25 transition-all"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Брошено</span>
          </button>
        );
      default:
        return (
          <button
            onClick={() => onToggleStatus(film.id, film.status)}
            title="Нажмите, чтобы отметить «Просмотрено»"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-cat-peach/15 text-cat-peach border border-cat-peach/30 hover:bg-cat-peach/25 transition-all"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>В планах</span>
          </button>
        );
    }
  };

  return (
    <div className="group relative rounded-2xl bg-cat-surface0/70 hover:bg-cat-surface0 border border-cat-surface1/80 hover:border-cat-surface2 p-4 transition-all duration-200 hover:shadow-xl hover:shadow-cat-crust/50 flex flex-col justify-between">
      
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-cat-text group-hover:text-cat-mauve transition-colors line-clamp-2 leading-snug">
              {film.title}
            </h3>
            {film.year && (
              <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-md bg-cat-surface1 text-cat-lavender border border-cat-surface2/40">
                {film.year}
              </span>
            )}
          </div>

          <div className="shrink-0">{getStatusBadge()}</div>
        </div>

        {/* Comment / Note */}
        {film.comment && (
          <p className="text-xs text-cat-subtext0 bg-cat-mantle/60 border border-cat-surface1/50 rounded-xl p-2.5 my-3 line-clamp-3 italic">
            "{film.comment}"
          </p>
        )}
      </div>

      {/* Bottom Footer: Stars, Link, Action Icons */}
      <div className="pt-3 border-t border-cat-surface1/60 mt-3 space-y-3">
        {/* Rating and Direct Link */}
        <div className="flex items-center justify-between gap-2">
          {/* 5-star rating */}
          <div className="flex items-center gap-1" title="Нажмите на звезду для быстрой оценки">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onRatingChange(film.id, film.rating === star ? 0 : star)}
                className="p-0.5 hover:scale-125 transition-transform"
                title={`Оценка ${star} из 5`}
              >
                <Star
                  className={`w-4 h-4 transition-colors ${
                    star <= film.rating
                      ? 'fill-cat-yellow text-cat-yellow'
                      : 'text-cat-surface2 hover:text-cat-yellow/60'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Link button if present */}
          {film.url && (
            <a
              href={film.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-cat-mauve/20 hover:bg-cat-mauve text-cat-mauve hover:text-cat-crust border border-cat-mauve/40 transition-all active:scale-95 shrink-0"
            >
              <span>Смотреть</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Card actions */}
        <div className="flex items-center justify-between text-xs text-cat-overlay0 pt-1">
          <span className="text-[11px] text-cat-overlay0">
            #{film.id}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(film)}
              className="p-1.5 rounded-lg text-cat-subtext0 hover:text-cat-mauve hover:bg-cat-surface1 transition-colors"
              title="Редактировать фильм"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(film.id)}
              className="p-1.5 rounded-lg text-cat-subtext0 hover:text-cat-red hover:bg-cat-surface1 transition-colors"
              title="Удалить фильм"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
