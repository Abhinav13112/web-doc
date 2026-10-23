import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  Presentation,
  FolderOpen,
  HardDrive,
  Star,
  Trash2,
  UploadCloud,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { formatBytes, formatDate, getCategoryConfig } from '../utils/formatters';
import FileIcon from '../components/FileIcon';

export function DashboardPage({
  stats,
  onNavigateToView,
  onOpenUpload,
  onPreview,
  onDownload
}) {
  const summaryCards = [
    {
      title: 'Total Documents',
      value: stats?.totalDocuments || 0,
      icon: FolderOpen,
      color: 'text-brand-600 dark:text-brand-400',
      bg: 'bg-brand-50 dark:bg-brand-950/50',
      border: 'border-brand-200 dark:border-brand-900/50',
      onClick: () => onNavigateToView('documents', 'all')
    },
    {
      title: 'Storage Used',
      value: stats?.formattedTotalSize || '0 B',
      subtitle: `of ${stats?.formattedStorageQuota || '500 MB'} (${stats?.percentUsed || 0}%)`,
      icon: HardDrive,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/50',
      border: 'border-indigo-200 dark:border-indigo-900/50',
      onClick: () => onNavigateToView('settings')
    },
    {
      title: 'Starred Favorites',
      value: stats?.totalFavorites || 0,
      icon: Star,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      border: 'border-amber-200 dark:border-amber-900/50',
      onClick: () => onNavigateToView('favorites')
    },
    {
      title: 'Trash Bin',
      value: stats?.totalTrashed || 0,
      icon: Trash2,
      color: 'text-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-950/50',
      border: 'border-rose-200 dark:border-rose-900/50',
      onClick: () => onNavigateToView('trash')
    }
  ];

  const categoryList = [
    { id: 'pdf', label: 'PDF Documents', icon: FileText, color: 'text-rose-500', stat: stats?.categoryDistribution?.pdf },
    { id: 'word', label: 'Word Documents', icon: FileText, color: 'text-blue-500', stat: stats?.categoryDistribution?.word },
    { id: 'spreadsheet', label: 'Spreadsheets', icon: FileSpreadsheet, color: 'text-emerald-500', stat: stats?.categoryDistribution?.spreadsheet },
    { id: 'presentation', label: 'Presentations', icon: Presentation, color: 'text-amber-500', stat: stats?.categoryDistribution?.presentation },
    { id: 'image', label: 'Images & Photos', icon: FileImage, color: 'text-purple-500', stat: stats?.categoryDistribution?.image },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-700 p-8 text-white shadow-xl shadow-brand-500/10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-brand-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Secure Cloud Library</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to DocuVault
          </h1>
          <p className="text-sm text-brand-100 leading-relaxed">
            Upload, preview, organize, and download all your personal and professional documents safely in one centralized cloud library.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-brand-700 hover:bg-brand-50 text-xs font-bold shadow-md shadow-black/10 active:scale-95 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Documents</span>
            </button>
            <button
              onClick={() => onNavigateToView('documents', 'all')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all"
            >
              <span>Explore All Files</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.onClick}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-brand-500/50 hover:shadow-lg transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {card.title}
                </p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {card.value}
                </h3>
                {card.subtitle && (
                  <p className="text-[11px] text-slate-400 font-medium">
                    {card.subtitle}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-xl ${card.bg} border ${card.border} group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Distribution Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Document Categories
          </h3>
          <button
            onClick={() => onNavigateToView('documents', 'all')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categoryList.map((cat) => {
            const Icon = cat.icon;
            const count = cat.stat?.count || 0;
            const bytes = cat.stat?.bytes || 0;
            return (
              <div
                key={cat.id}
                onClick={() => onNavigateToView('documents', cat.id)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-brand-500/50 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-fit mb-3 group-hover:scale-110 transition-transform">
                  <Icon className={`w-5 h-5 ${cat.color}`} />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {cat.label}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <span>{count} files</span>
                  <span>{formatBytes(bytes)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Uploads Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recently Uploaded
            </h3>
          </div>
          <button
            onClick={() => onNavigateToView('documents', 'all')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            See all
          </button>
        </div>

        {stats?.recentUploads && stats.recentUploads.length > 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {stats.recentUploads.map((doc) => {
              const categoryConfig = getCategoryConfig(doc.category);
              return (
                <div
                  key={doc.id}
                  className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div
                    onClick={() => onPreview(doc)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className={`p-2 rounded-xl ${categoryConfig.bg} border ${categoryConfig.border} shrink-0`}>
                      <FileIcon category={doc.category} ext={doc.file_ext} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {doc.name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatBytes(doc.file_size)} • Uploaded {formatDate(doc.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onPreview(doc)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => onDownload(doc)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                    >
                      Download
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No documents uploaded yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Start uploading documents to build your cloud library.</p>
            </div>
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
