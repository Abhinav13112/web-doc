import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { documentsApi } from './services/api';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import UploadModal from './components/UploadModal';
import DocumentPreviewModal from './components/DocumentPreviewModal';
import RenameModal from './components/RenameModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Toast from './components/Toast';

import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import FavoritesPage from './pages/FavoritesPage';
import TrashPage from './pages/TrashPage';
import SettingsPage from './pages/SettingsPage';
import AuthPage from './pages/AuthPage';

// High quality initial mock documents for demo mode or initial preview
const DEMO_DOCUMENTS = [
  {
    id: 'demo-doc-1',
    name: 'Quarterly_Financial_Report_2026.pdf',
    original_name: 'Quarterly_Financial_Report_2026.pdf',
    category: 'pdf',
    file_ext: '.pdf',
    file_size: 2457600, // 2.34 MB
    is_favorite: true,
    is_trashed: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-doc-2',
    name: 'Project_Specification_DocuVault.docx',
    original_name: 'Project_Specification_DocuVault.docx',
    category: 'word',
    file_ext: '.docx',
    file_size: 1548576, // 1.47 MB
    is_favorite: true,
    is_trashed: false,
    created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-doc-3',
    name: 'Customer_Metrics_Analysis.xlsx',
    original_name: 'Customer_Metrics_Analysis.xlsx',
    category: 'spreadsheet',
    file_ext: '.xlsx',
    file_size: 843200, // 823 KB
    is_favorite: false,
    is_trashed: false,
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-doc-4',
    name: 'System_Architecture_Diagram.png',
    original_name: 'System_Architecture_Diagram.png',
    category: 'image',
    file_ext: '.png',
    file_size: 3245600, // 3.09 MB
    is_favorite: true,
    is_trashed: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-doc-5',
    name: 'Investor_Pitch_Deck_Q3.pptx',
    original_name: 'Investor_Pitch_Deck_Q3.pptx',
    category: 'presentation',
    file_ext: '.pptx',
    file_size: 6890000, // 6.57 MB
    is_favorite: false,
    is_trashed: false,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-doc-6',
    name: 'Old_Database_Dump_v1.sql',
    original_name: 'Old_Database_Dump_v1.sql',
    category: 'text',
    file_ext: '.sql',
    file_size: 512000,
    is_favorite: false,
    is_trashed: true,
    trashed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export function App() {
  const { user, loading: authLoading, signOut, isDemoUser } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'documents' | 'favorites' | 'trash' | 'settings'
  const [currentCategory, setCurrentCategory] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Documents & Stats Data State
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 24, totalPages: 1 });

  // Modals & Feedback State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [renameDoc, setRenameDoc] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete',
    isDestructive: true,
    action: null
  });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load documents
  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    if (isDemoUser) {
      // Simulate real filtering for demo mode
      let filtered = [...DEMO_DOCUMENTS];
      if (currentView === 'trash') {
        filtered = filtered.filter(d => d.is_trashed);
      } else {
        filtered = filtered.filter(d => !d.is_trashed);
        if (currentView === 'favorites') {
          filtered = filtered.filter(d => d.is_favorite);
        } else if (currentCategory !== 'all') {
          filtered = filtered.filter(d => d.category === currentCategory);
        }
      }

      if (debouncedSearch) {
        filtered = filtered.filter(d => d.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
      }

      filtered.sort((a, b) => {
        if (sortBy === 'name') return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        if (sortBy === 'file_size') return order === 'asc' ? a.file_size - b.file_size : b.file_size - a.file_size;
        return order === 'asc'
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      });

      setDocuments(filtered);
      setPagination({ total: filtered.length, page: 1, limit: 24, totalPages: 1 });
      setLoading(false);
      return;
    }

    try {
      const params = {
        category: currentCategory !== 'all' ? currentCategory : undefined,
        is_favorite: currentView === 'favorites' ? 'true' : undefined,
        is_trashed: currentView === 'trash' ? 'true' : 'false',
        search: debouncedSearch || undefined,
        sortBy,
        order,
        page,
        limit: 24
      };

      const response = await documentsApi.list(params);
      if (response?.data) {
        setDocuments(response.data);
        setPagination(response.pagination || { total: response.data.length, page: 1, limit: 24, totalPages: 1 });
      }
    } catch (err) {
      console.warn('API error fetching documents:', err.message);
      // Fallback to empty list gracefully
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [user, isDemoUser, currentView, currentCategory, debouncedSearch, sortBy, order, page]);

  // Load stats
  const fetchStats = useCallback(async () => {
    if (!user) return;

    if (isDemoUser) {
      const active = DEMO_DOCUMENTS.filter(d => !d.is_trashed);
      const totalSize = active.reduce((acc, d) => acc + d.file_size, 0);
      const quota = 500 * 1024 * 1024;
      setStats({
        totalDocuments: active.length,
        totalSizeBytes: totalSize,
        formattedTotalSize: `${(totalSize / (1024 * 1024)).toFixed(1)} MB`,
        storageQuotaBytes: quota,
        formattedStorageQuota: '500 MB',
        percentUsed: parseFloat(((totalSize / quota) * 100).toFixed(1)),
        totalFavorites: active.filter(d => d.is_favorite).length,
        totalTrashed: DEMO_DOCUMENTS.filter(d => d.is_trashed).length,
        recentUploads: active.slice(0, 5),
        categoryDistribution: {
          pdf: { count: active.filter(d => d.category === 'pdf').length, bytes: 2457600 },
          word: { count: active.filter(d => d.category === 'word').length, bytes: 1548576 },
          spreadsheet: { count: active.filter(d => d.category === 'spreadsheet').length, bytes: 843200 },
          presentation: { count: active.filter(d => d.category === 'presentation').length, bytes: 6890000 },
          image: { count: active.filter(d => d.category === 'image').length, bytes: 3245600 },
          text: { count: 0, bytes: 0 },
          archive: { count: 0, bytes: 0 },
          other: { count: 0, bytes: 0 }
        }
      });
      return;
    }

    try {
      const response = await documentsApi.getStats();
      if (response?.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.warn('API error fetching stats:', err.message);
    }
  }, [user, isDemoUser]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchStats();
    }
  }, [user, fetchDocuments, fetchStats]);

  // Document Operations
  const handleDownload = async (doc) => {
    try {
      showToast(`Generating secure download link for ${doc.name}...`, 'info');
      if (isDemoUser) {
        showToast(`Downloaded ${doc.name} (Demo Mode)`, 'success');
        return;
      }
      const response = await documentsApi.getDownloadUrl(doc.id);
      const downloadUrl = response.data?.downloadUrl;
      if (downloadUrl) {
        const link = window.document.createElement('a');
        link.href = downloadUrl;
        link.download = doc.original_name || doc.name;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        showToast(`Downloading '${doc.name}'`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Download failed.', 'error');
    }
  };

  const handleToggleFavorite = async (doc) => {
    try {
      const newFavStatus = !doc.is_favorite;
      if (isDemoUser) {
        setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, is_favorite: newFavStatus } : d));
        showToast(newFavStatus ? 'Added to favorites' : 'Removed from favorites', 'success');
        return;
      }
      await documentsApi.update(doc.id, { is_favorite: newFavStatus });
      fetchDocuments();
      fetchStats();
      showToast(newFavStatus ? 'Added to favorites' : 'Removed from favorites', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update favorite status.', 'error');
    }
  };

  const handleRenameConfirm = async (id, newName) => {
    if (isDemoUser) {
      setDocuments(prev => prev.map(d => d.id === id ? { ...d, name: newName } : d));
      showToast(`Document renamed to ${newName}`, 'success');
      return;
    }
    await documentsApi.update(id, { name: newName });
    fetchDocuments();
    showToast(`Document renamed to ${newName}`, 'success');
  };

  const handleMoveToTrash = (doc) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Move to Trash?',
      message: `Are you sure you want to move "${doc.name}" to trash? You can restore it anytime.`,
      confirmText: 'Move to Trash',
      isDestructive: false,
      action: async () => {
        if (isDemoUser) {
          setDocuments(prev => prev.filter(d => d.id !== doc.id));
          showToast(`'${doc.name}' moved to trash.`, 'info');
          setDeleteConfirm({ isOpen: false });
          return;
        }
        await documentsApi.moveToTrash(doc.id);
        fetchDocuments();
        fetchStats();
        showToast(`'${doc.name}' moved to trash.`, 'info');
        setDeleteConfirm({ isOpen: false });
      }
    });
  };

  const handleRestore = async (doc) => {
    try {
      if (isDemoUser) {
        setDocuments(prev => prev.filter(d => d.id !== doc.id));
        showToast(`'${doc.name}' restored.`, 'success');
        return;
      }
      await documentsApi.restore(doc.id);
      fetchDocuments();
      fetchStats();
      showToast(`'${doc.name}' restored to your library.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to restore document.', 'error');
    }
  };

  const handlePermanentDelete = (doc) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Permanently Delete File?',
      message: `This will permanently delete "${doc.name}" from cloud storage and database. This action CANNOT be undone.`,
      confirmText: 'Delete Forever',
      isDestructive: true,
      action: async () => {
        if (isDemoUser) {
          setDocuments(prev => prev.filter(d => d.id !== doc.id));
          showToast(`'${doc.name}' permanently deleted.`, 'info');
          setDeleteConfirm({ isOpen: false });
          return;
        }
        await documentsApi.permanentDelete(doc.id);
        fetchDocuments();
        fetchStats();
        showToast(`'${doc.name}' permanently deleted.`, 'info');
        setDeleteConfirm({ isOpen: false });
      }
    });
  };

  const handleEmptyTrash = () => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Empty Entire Trash Bin?',
      message: 'All documents currently in Trash will be permanently deleted from cloud storage. This cannot be undone.',
      confirmText: 'Empty Trash',
      isDestructive: true,
      action: async () => {
        if (isDemoUser) {
          setDocuments([]);
          showToast('Trash emptied.', 'info');
          setDeleteConfirm({ isOpen: false });
          return;
        }
        await documentsApi.emptyTrash();
        fetchDocuments();
        fetchStats();
        showToast('Trash emptied.', 'info');
        setDeleteConfirm({ isOpen: false });
      }
    });
  };

  // If authenticating initial boot
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // If not logged in, render AuthPage
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={(view) => {
          setCurrentView(view);
          if (view !== 'documents') setCurrentCategory('all');
        }}
        currentCategory={currentCategory}
        onSelectCategory={(cat) => {
          setCurrentView('documents');
          setCurrentCategory(cat);
        }}
        stats={stats}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        <Navbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenUpload={() => setIsUploadOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <DashboardPage
              stats={stats}
              onNavigateToView={(view, cat = 'all') => {
                setCurrentView(view);
                setCurrentCategory(cat);
              }}
              onOpenUpload={() => setIsUploadOpen(true)}
              onPreview={setPreviewDoc}
              onDownload={handleDownload}
            />
          )}

          {currentView === 'documents' && (
            <DocumentsPage
              documents={documents}
              loading={loading}
              pagination={pagination}
              category={currentCategory}
              onSelectCategory={setCurrentCategory}
              sortBy={sortBy}
              onSortChange={setSortBy}
              order={order}
              onOrderToggle={() => setOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              onPageChange={setPage}
              searchTerm={searchTerm}
              onClearSearch={() => setSearchTerm('')}
              onOpenUpload={() => setIsUploadOpen(true)}
              onPreview={setPreviewDoc}
              onDownload={handleDownload}
              onRename={setRenameDoc}
              onToggleFavorite={handleToggleFavorite}
              onMoveToTrash={handleMoveToTrash}
            />
          )}

          {currentView === 'favorites' && (
            <FavoritesPage
              documents={documents}
              loading={loading}
              onNavigateToView={(view, cat = 'all') => {
                setCurrentView(view);
                setCurrentCategory(cat);
              }}
              onPreview={setPreviewDoc}
              onDownload={handleDownload}
              onRename={setRenameDoc}
              onToggleFavorite={handleToggleFavorite}
              onMoveToTrash={handleMoveToTrash}
            />
          )}

          {currentView === 'trash' && (
            <TrashPage
              documents={documents}
              loading={loading}
              onEmptyTrash={handleEmptyTrash}
              onRestore={handleRestore}
              onPermanentDelete={handlePermanentDelete}
            />
          )}

          {currentView === 'settings' && (
            <SettingsPage
              stats={stats}
              onSignOut={signOut}
            />
          )}
        </main>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => {
          fetchDocuments();
          fetchStats();
          showToast('File(s) uploaded successfully!', 'success');
        }}
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        onDownload={handleDownload}
      />

      {/* Rename Modal */}
      <RenameModal
        document={renameDoc}
        isOpen={Boolean(renameDoc)}
        onClose={() => setRenameDoc(null)}
        onConfirm={handleRenameConfirm}
      />

      {/* Delete / Action Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.title}
        message={deleteConfirm.message}
        confirmText={deleteConfirm.confirmText}
        isDestructive={deleteConfirm.isDestructive}
        onClose={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
        onConfirm={deleteConfirm.action}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
