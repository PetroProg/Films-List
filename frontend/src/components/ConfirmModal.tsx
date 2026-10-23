import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Удалить',
  cancelText = 'Отмена',
  variant = 'danger',
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cat-crust/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-cat-mantle border border-cat-surface1 shadow-2xl p-6 text-center overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-cat-overlay0 hover:text-cat-text hover:bg-cat-surface0 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-cat-red/15 border border-cat-red/30 flex items-center justify-center text-cat-red mx-auto mb-4 shadow-lg shadow-cat-red/10">
          {variant === 'danger' ? (
            <Trash2 className="w-6 h-6 text-cat-red" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-cat-peach" />
          )}
        </div>

        {/* Title & Message */}
        <h3 className="text-lg font-bold text-cat-text mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-cat-subtext0 leading-relaxed mb-6 px-2">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-cat-surface0 hover:bg-cat-surface1 text-cat-subtext1 text-xs font-semibold border border-cat-surface1 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-cat-red hover:bg-cat-red/90 text-cat-crust text-xs font-bold transition-all active:scale-95 shadow-lg shadow-cat-red/20"
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};
