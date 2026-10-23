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

export function DocumentCard({
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
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/5 transition-all flex flex-col justify-between">
      {/* Top row: Category icon, favorite button, and menu */}
      <div className="flex items-start justify-between gap-2">
        <div
          onClick={() => onPreview(doc)}
          className={`p-3 rounded-xl ${categoryConfig.bg} border ${categoryConfig.border} cursor-pointer transition-transform group-hover:scale-105`}
        >
          <FileIcon category={doc.category} ext={doc.file_ext} className="w-6 h-6" />
        </div>

        <div className="flex items-center gap-1">
          {!isTrashView && (
            <button
              onClick={() => onToggleFavorite(doc)}
              className={`p-1.5 rounded-lg transition-colors ${
                doc.is_favorite
                  ? 'text-amber-400 hover:text-amber-500'
                  : 'text-slate-300 dark:text-slate-600 hover:text-amber-400 opacity-0 group-hover:opacity-100'
              }`}
              title={doc.is_favorite ? 'Remove from favorites' : 'Mark as favorite'}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>
          )}

          {/* Action Menu */}
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

      {/* File details */}
      <div className="mt-4">
        <h4
          onClick={() => !isTrashView && onPreview(doc)}
          className={`font-semibold text-slate-900 dark:text-white text-sm truncate ${!isTrashView ? 'cursor-pointer hover:text-brand-600 dark:hover:text-brand-400' : ''}`}
          title={doc.name}
        >
          {doc.name}
        </h4>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <span>{formatBytes(doc.file_size)}</span>
          <span>{formatDate(doc.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

export default DocumentCard;
