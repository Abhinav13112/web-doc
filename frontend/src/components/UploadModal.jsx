import React, { useState, useRef, useCallback } from 'react';
import {
  X,
  UploadCloud,
  File,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { documentsApi } from '../services/api';
import { formatBytes } from '../utils/formatters';

export function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [fileQueue, setFileQueue] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFilesAdded = (files) => {
    setGeneralError('');
    const newFiles = Array.from(files).map((file) => {
      // Check duplicate in current queue
      const isDuplicate = fileQueue.some(item => item.file.name === file.name && item.file.size === file.size);
      return {
        id: Math.random().toString(36).substring(2, 9),
        file,
        name: file.name,
        size: file.size,
        progress: 0,
        status: isDuplicate ? 'duplicate' : 'ready', // 'ready' | 'uploading' | 'success' | 'error' | 'duplicate'
        error: isDuplicate ? 'File already in upload queue' : null
      };
    });

    setFileQueue(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const removeFileFromQueue = (id) => {
    setFileQueue(prev => prev.filter(item => item.id !== id));
  };

  const handleStartUpload = async () => {
    const readyFiles = fileQueue.filter(item => item.status === 'ready' || item.status === 'error');
    if (readyFiles.length === 0) return;

    setIsUploading(true);
    setGeneralError('');

    let anyUploaded = false;

    // Upload files sequentially or in batch
    for (const queueItem of readyFiles) {
      // Update status to uploading
      setFileQueue(prev =>
        prev.map(item => item.id === queueItem.id ? { ...item, status: 'uploading', progress: 10 } : item)
      );

      try {
        const formData = new FormData();
        formData.append('files', queueItem.file);

        await documentsApi.upload(formData, (percent) => {
          setFileQueue(prev =>
            prev.map(item => item.id === queueItem.id ? { ...item, progress: percent } : item)
          );
        });

        setFileQueue(prev =>
          prev.map(item => item.id === queueItem.id ? { ...item, status: 'success', progress: 100 } : item)
        );
        anyUploaded = true;
      } catch (err) {
        setFileQueue(prev =>
          prev.map(item => item.id === queueItem.id ? { ...item, status: 'error', error: err.message } : item)
        );
      }
    }

    setIsUploading(false);
    if (anyUploaded && onUploadSuccess) {
      onUploadSuccess();
    }
  };

  const totalFiles = fileQueue.length;
  const completedFiles = fileQueue.filter(f => f.status === 'success').length;
  const hasPendingFiles = fileQueue.some(f => f.status === 'ready' || f.status === 'error');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Upload Documents</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Add documents to your cloud library</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 scale-[0.99]'
                : 'border-slate-300 dark:border-slate-700/80 hover:border-brand-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFilesAdded(e.target.files)}
              multiple
              className="hidden"
            />
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-brand-100 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-sm">
              <UploadCloud className="w-7 h-7" />
            </div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">
              Click to browse or drag and drop files here
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports PDF, Word, Excel, PowerPoint, Images, Markdown, and Archives (up to 50MB per file)
            </p>
          </div>

          {generalError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Upload Queue */}
          {fileQueue.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
                <span>Selected Files ({completedFiles}/{totalFiles} uploaded)</span>
                {!isUploading && (
                  <button
                    onClick={() => setFileQueue([])}
                    className="text-rose-500 hover:text-rose-600 text-xs font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {fileQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-700 text-slate-500 shrink-0">
                        <File className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-400 font-medium">
                            {formatBytes(item.size)}
                          </span>
                          {item.status === 'uploading' && (
                            <span className="text-[11px] text-brand-600 dark:text-brand-400 font-medium">
                              Uploading... {item.progress}%
                            </span>
                          )}
                          {item.status === 'success' && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Uploaded
                            </span>
                          )}
                          {item.status === 'error' && (
                            <span className="text-[11px] text-rose-500 font-medium truncate">
                              Error: {item.error}
                            </span>
                          )}
                          {item.status === 'duplicate' && (
                            <span className="text-[11px] text-amber-500 font-medium flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Duplicate
                            </span>
                          )}
                        </div>
                        {/* Progress Bar */}
                        {item.status === 'uploading' && (
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1 mt-1.5 overflow-hidden">
                            <div
                              className="bg-brand-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {!isUploading && item.status !== 'success' && (
                      <button
                        onClick={() => removeFileFromQueue(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-xs text-slate-400">
            {fileQueue.length} file(s) selected
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleStartUpload}
              disabled={isUploading || !hasPendingFiles}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Files</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;
