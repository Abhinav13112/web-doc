import React from 'react';
import { Star, FolderOpen, ArrowRight } from 'lucide-react';
import DocumentCard from '../components/DocumentCard';

export function FavoritesPage({
  documents,
  loading,
  onNavigateToView,
  onPreview,
  onDownload,
  onRename,
  onToggleFavorite,
  onMoveToTrash
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Starred Favorites
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Quick access to your most important documents
            </p>
          </div>
        </div>
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
              onPreview={onPreview}
              onDownload={onDownload}
              onRename={onRename}
              onToggleFavorite={onToggleFavorite}
              onMoveToTrash={onMoveToTrash}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 my-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Star className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              No favorites yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              Click the star icon on any document in your library to bookmark it here for instant access.
            </p>
          </div>
          <button
            onClick={() => onNavigateToView('documents', 'all')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all"
          >
            <span>Browse Documents</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;
