import React, { useState, useEffect } from 'react';
import { X, Star, Link as LinkIcon, Film as FilmIcon } from 'lucide-react';
import { Film } from '../types';

interface FilmModalProps {
  isOpen: boolean;
  film: Film | null;
  onClose: () => void;
  onSave: (data: {
    title: string;
    year?: number | null;
    url?: string;
    status: 'plan' | 'watched' | 'dropped';
    rating: number;
    comment?: string;
  }) => Promise<void>;
}

export const FilmModal: React.FC<FilmModalProps> = ({
  isOpen,
  film,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'plan' | 'watched' | 'dropped'>('plan');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (film) {
      setTitle(film.title);
      setYear(film.year ? film.year.toString() : '');
      setUrl(film.url || '');
      setStatus(film.status);
      setRating(film.rating || 0);
      setComment(film.comment || '');
    } else {
      setTitle('');
      setYear('');
      setUrl('');
      setStatus('plan');
      setRating(0);
      setComment('');
    }
    setError('');
  }, [film, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Название фильма обязательно');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const yearNum = year ? parseInt(year, 10) : null;
      await onSave({
        title: title.trim(),
        year: yearNum && !isNaN(yearNum) ? yearNum : null,
        url: url.trim(),
        status,
        rating,
        comment: comment.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cat-crust/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-cat-mantle border border-cat-surface1 shadow-2xl p-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cat-surface0 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cat-mauve/20 text-cat-mauve">
              <FilmIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-cat-text">
              {film ? 'Редактировать фильм' : 'Добавить фильм'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-cat-overlay0 hover:text-cat-text hover:bg-cat-surface0 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-cat-red/20 border border-cat-red/40 text-cat-red text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-cat-subtext0 uppercase tracking-wider mb-1.5">
              Название <span className="text-cat-red">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Интерстеллар"
              autoFocus
              className="w-full px-3.5 py-2 rounded-xl bg-cat-surface0 border border-cat-surface1 text-cat-text placeholder-cat-overlay0 text-sm focus:outline-none focus:border-cat-mauve"
            />
          </div>

          {/* Year & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-cat-subtext0 uppercase tracking-wider mb-1.5">
                Год выпуска
              </label>
              <input
                type="number"
                min="1880"
                max="2100"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
                className="w-full px-3.5 py-2 rounded-xl bg-cat-surface0 border border-cat-surface1 text-cat-text placeholder-cat-overlay0 text-sm focus:outline-none focus:border-cat-mauve"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-cat-subtext0 uppercase tracking-wider mb-1.5">
                Статус
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-cat-surface0 border border-cat-surface1 text-cat-text text-sm focus:outline-none focus:border-cat-mauve cursor-pointer"
              >
                <option value="plan">В планах</option>
                <option value="watched">Просмотрено</option>
                <option value="dropped">Брошено</option>
              </select>
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="block text-xs font-semibold text-cat-subtext0 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-cat-lavender" />
              <span>Ссылка на просмотр</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://rezka.bid/... или Кинопоиск"
              className="w-full px-3.5 py-2 rounded-xl bg-cat-surface0 border border-cat-surface1 text-cat-text placeholder-cat-overlay0 text-sm focus:outline-none focus:border-cat-mauve"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-xs font-semibold text-cat-subtext0 uppercase tracking-wider mb-1.5">
              Оценка (1-5)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(rating === star ? 0 : star)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= rating
                          ? 'fill-cat-yellow text-cat-yellow'
                          : 'text-cat-surface2 hover:text-cat-yellow/60'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs text-cat-subtext0 ml-2">
                {rating > 0 ? `${rating} из 5` : 'Без оценки'}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-cat-subtext0 uppercase tracking-wider mb-1.5">
              Заметки / Комментарий
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Впечатления, кто посоветовал, заметки..."
              className="w-full px-3.5 py-2 rounded-xl bg-cat-surface0 border border-cat-surface1 text-cat-text placeholder-cat-overlay0 text-sm focus:outline-none focus:border-cat-mauve resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-cat-surface0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-cat-surface0 hover:bg-cat-surface1 text-cat-subtext1 text-sm font-medium transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-cat-mauve hover:bg-cat-mauve/90 text-cat-crust text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : film ? 'Обновить' : 'Добавить'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
