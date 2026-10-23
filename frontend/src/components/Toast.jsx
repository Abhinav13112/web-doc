import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { type = 'info', message } = toast;

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      bg: 'bg-emerald-500 text-white',
      border: 'border-emerald-600'
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-rose-500 text-white',
      border: 'border-rose-600'
    },
    info: {
      icon: Info,
      bg: 'bg-slate-900 text-white dark:bg-slate-800',
      border: 'border-slate-700'
    }
  }[type] || {
    icon: Info,
    bg: 'bg-slate-900 text-white',
    border: 'border-slate-700'
  };

  const Icon = typeConfig.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border ${typeConfig.border} ${typeConfig.bg} text-xs font-semibold max-w-sm`}>
        <Icon className="w-4 h-4 shrink-0" />
        <span className="flex-1 leading-snug">{message}</span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default Toast;
