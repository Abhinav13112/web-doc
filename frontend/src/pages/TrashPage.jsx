import React from 'react';
import { Trash2, RotateCcw, AlertTriangle, FolderOpen } from 'lucide-react';
import DocumentCard from '../components/DocumentCard';

export function TrashPage({
  documents,
  loading,
  onEmptyTrash,
  onRestore,
  onPermanentDelete
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-500">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Trash Bin
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Documents in trash can be restored or permanently removed
            </p>
          </div>
        </div>

        {documents && documents.length > 0 && (
          <button
            onClick={onEmptyTrash}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-semibold transition-all shadow-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Empty Trash</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
          ))}
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              isTrashView={true}
              onRestore={onRestore}
              onPermanentDelete={onPermanentDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 my-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
            <Trash2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Trash is empty
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              Any documents you delete will show up here before they are permanently purged.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrashPage;
