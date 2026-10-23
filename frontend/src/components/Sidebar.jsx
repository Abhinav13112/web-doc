import React from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  FileSpreadsheet,
  Presentation,
  FileImage,
  FolderArchive,
  Star,
  Trash2,
  Settings,
  HardDrive,
  X,
  ShieldCheck
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';

export function Sidebar({
  currentView,
  onSelectView,
  currentCategory,
  onSelectCategory,
  stats,
  isOpen,
  onClose
}) {
  const navMain = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'documents', label: 'All Documents', icon: FolderOpen, count: stats?.totalDocuments },
  ];

  const categories = [
    { id: 'pdf', label: 'PDFs', icon: FileText, color: 'text-rose-500', count: stats?.categoryDistribution?.pdf?.count },
    { id: 'word', label: 'Word Documents', icon: FileText, color: 'text-blue-500', count: stats?.categoryDistribution?.word?.count },
    { id: 'spreadsheet', label: 'Spreadsheets', icon: FileSpreadsheet, color: 'text-emerald-500', count: stats?.categoryDistribution?.spreadsheet?.count },
    { id: 'presentation', label: 'Presentations', icon: Presentation, color: 'text-amber-500', count: stats?.categoryDistribution?.presentation?.count },
    { id: 'image', label: 'Images', icon: FileImage, color: 'text-purple-500', count: stats?.categoryDistribution?.image?.count },
    { id: 'other', label: 'Other Files', icon: FolderArchive, color: 'text-slate-400', count: (stats?.categoryDistribution?.text?.count || 0) + (stats?.categoryDistribution?.archive?.count || 0) + (stats?.categoryDistribution?.other?.count || 0) },
  ];

  const navBottom = [
    { id: 'favorites', label: 'Favorites', icon: Star, color: 'text-amber-400', count: stats?.totalFavorites },
    { id: 'trash', label: 'Trash', icon: Trash2, color: 'text-rose-400', count: stats?.totalTrashed },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (view, category = null) => {
    onSelectView(view);
    if (category !== null) {
      onSelectCategory(category);
    }
    if (onClose) onClose();
  };

  const isCategoryActive = (catId) => currentView === 'documents' && currentCategory === catId;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">DocuVault</span>
              <span className="block text-[10px] font-medium text-brand-600 dark:text-brand-400 tracking-wider uppercase">Cloud Storage</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Main Views */}
          <div className="space-y-1">
            {navMain.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id && (item.id !== 'documents' || currentCategory === 'all');
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, 'all')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Categories Section */}
          <div>
            <div className="px-3 mb-2 text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Categories
            </div>
            <div className="space-y-1">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = isCategoryActive(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleNavClick('documents', cat.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${cat.color || 'text-slate-400'}`} />
                      <span>{cat.label}</span>
                    </div>
                    {cat.count !== undefined && cat.count > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {cat.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Favorites & Trash & Settings */}
          <div>
            <div className="px-3 mb-2 text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Library
            </div>
            <div className="space-y-1">
              {navBottom.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${item.color || 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Storage Usage Footer Widget */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <HardDrive className="w-4 h-4 text-brand-500" />
              <span>Storage Used</span>
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {stats?.percentUsed || 0}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-1.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                (stats?.percentUsed || 0) > 85 ? 'bg-rose-500' : 'bg-brand-500'
              }`}
              style={{ width: `${Math.min(100, stats?.percentUsed || 0)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
            <span>{stats?.formattedTotalSize || '0 B'} used</span>
            <span>{stats?.formattedStorageQuota || '500 MB'}</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
