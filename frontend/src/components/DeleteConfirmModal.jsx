import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

export function DeleteConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Delete",
  isDestructive = true,
  isLoading = false,
  onClose,
  onConfirm
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-inner ${
            isDestructive
              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-500'
              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-500'
          }`}>
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              {message}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-semibold shadow-md active:scale-[0.98] transition-all disabled:opacity-50 ${
                isDestructive
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
              }`}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
