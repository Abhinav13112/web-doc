import React, { useState } from 'react';
import {
  LayoutGrid,
  List,
  ArrowUpDown,
  Filter,
  FolderOpen,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  FileText
} from 'lucide-react';
import DocumentCard from '../components/DocumentCard';
import DocumentListItem from '../components/DocumentListItem';

export function DocumentsPage({
  documents,
  loading,
  pagination,
  category,
  onSelectCategory,
  sortBy,
  onSortChange,
  order,
  onOrderToggle,
  onPageChange,
  searchTerm,
  onClearSearch,
  onOpenUpload,
  onPreview,
  onDownload,
  onRename,
  onToggleFavorite,
  onMoveToTrash
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const categories = [
    { id: 'all', label: 'All Files' },
    { id: 'pdf', label: 'PDFs' },
    { id: 'word', label: 'Word' },
    { id: 'spreadsheet', label: 'Spreadsheets' },
    { id: 'presentation', label: 'Presentations' },
    { id: 'image', label: 'Images' },
    { id: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white capitalize">
            {category === 'all' ? 'All Documents' : `${category} Documents`}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {pagination?.total || 0} document(s) in collection
            {searchTerm && ` • Matching "${searchTerm}"`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="text-slate-400 font-medium hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer"
            >
              <option value="created_at" className="dark:bg-slate-900">Upload Date</option>
              <option value="name" className="dark:bg-slate-900">Name</option>
              <option value="file_size" className="dark:bg-slate-900">File Size</option>
              <option value="category" className="dark:bg-slate-900">Category</option>
            </select>
            <button
              onClick={onOrderToggle}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={order === 'asc' ? 'Ascending' : 'Descending'}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Upload Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              category === cat.id
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading Skeleton / States */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
          ))}
        </div>
      ) : documents.length > 0 ? (
        <>
          {/* Documents Display */}
          {viewMode === 'grid' ? (
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
            <div className="space-y-2">
              {documents.map((doc) => (
                <DocumentListItem
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
          )}

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} items)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 my-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto shadow-inner">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {searchTerm ? 'No matching documents found' : 'No documents in this view'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              {searchTerm
                ? `No documents matched your search query "${searchTerm}". Try a different keyword.`
                : 'Upload files to start managing your documents in this category.'}
            </p>
          </div>
          {searchTerm ? (
            <button
              onClick={onClearSearch}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
            >
              <X className="w-4 h-4" />
              <span>Clear Search</span>
            </button>
          ) : (
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default DocumentsPage;
