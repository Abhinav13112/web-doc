import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Star,
  Download,
  Eye,
  Edit2,
  Trash2,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import FileIcon from './FileIcon';
import { formatBytes, formatDate, getCategoryConfig } from '../utils/formatters';

export function DocumentListItem({
  document: doc,
  onPreview,
  onDownload,
  onRename,
  onToggleFavorite,
  onMoveToTrash,
  onRestore,
  onPermanentDelete,
  isTrashView = false
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categoryConfig = getCategoryConfig(doc.category);

  return (
    <div className="group flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-brand-500/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all gap-4">
      {/* Left: Star + Icon + Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {!isTrashView ? (
          <button
            onClick={() => onToggleFavorite(doc)}
            className={`p-1 rounded-lg transition-colors shrink-0 ${
              doc.is_favorite
                ? 'text-amber-400 hover:text-amber-500'
                : 'text-slate-300 dark:text-slate-600 hover:text-amber-400 opacity-0 group-hover:opacity-100'
            }`}
          >
            <Star className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <div className="w-4" />
        )}

        <div
          onClick={() => !isTrashView && onPreview(doc)}
          className={`p-2 rounded-lg ${categoryConfig.bg} border ${categoryConfig.border} shrink-0 cursor-pointer`}
        >
          <FileIcon category={doc.category} ext={doc.file_ext} className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p
            onClick={() => !isTrashView && onPreview(doc)}
            className={`text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate ${
              !isTrashView ? 'cursor-pointer hover:text-brand-600 dark:hover:text-brand-400' : ''
            }`}
            title={doc.name}
          >
            {doc.name}
          </p>
        </div>
      </div>

      {/* Middle: Category & Size */}
      <div className="hidden md:flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 shrink-0">
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${categoryConfig.badge}`}>
          {categoryConfig.label}
        </span>
        <span className="w-20 text-right">{formatBytes(doc.file_size)}</span>
        <span className="w-24 text-right">{formatDate(doc.created_at)}</span>
      </div>

      {/* Right: Action Buttons & Menu */}
      <div className="flex items-center gap-1 shrink-0">
        {!isTrashView && (
          <>
            <button
              onClick={() => onPreview(doc)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:block"
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDownload(doc)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:block"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Menu Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              {!isTrashView ? (
                <>
                  <button
                    onClick={() => { setMenuOpen(false); onPreview(doc); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onDownload(doc); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onRename(doc); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Rename</span>
                  </button>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                  <button
                    onClick={() => { setMenuOpen(false); onMoveToTrash(doc); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Move to Trash</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setMenuOpen(false); onRestore(doc); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onPermanentDelete(doc); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Delete Forever</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentListItem;
