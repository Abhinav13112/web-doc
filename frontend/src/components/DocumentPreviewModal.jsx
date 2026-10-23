import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Loader2,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileCode,
  Table,
  EyeOff
} from 'lucide-react';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import DOMPurify from 'dompurify';
import { documentsApi } from '../services/api';
import { formatBytes, formatDate, getCategoryConfig } from '../utils/formatters';
import FileIcon from './FileIcon';

export function DocumentPreviewModal({ document: doc, isOpen, onClose, onDownload }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Office & Spreadsheet parsed data states
  const [docxHtml, setDocxHtml] = useState('');
  const [spreadsheetData, setSpreadsheetData] = useState(null);
  const [activeSheet, setActiveSheet] = useState('');
  const [textContent, setTextContent] = useState('');

  useEffect(() => {
    if (!isOpen || !doc) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setPreviewUrl('');
    setDocxHtml('');
    setSpreadsheetData(null);
    setTextContent('');
    setZoom(100);

    async function loadPreview() {
      try {
        let url = doc.localBlobUrl;
        if (!url) {
          try {
            const response = await documentsApi.getPreviewUrl(doc.id);
            url = response.data?.previewUrl;
          } catch (e) {
            console.warn('API preview url fetch error:', e.message);
          }
        }

        if (!url && !['.pdf', '.docx', '.xlsx', '.xls', '.csv', '.png', '.jpg', '.jpeg', '.webp'].includes(doc.file_ext?.toLowerCase())) {
          // Unsupported formats will show metadata card
          if (isMounted) setLoading(false);
          return;
        }

        if (!url) {
          throw new Error('Preview URL could not be generated. Please make sure the backend is connected or download the file directly.');
        }

        if (!isMounted) return;
        setPreviewUrl(url);

        const ext = doc.file_ext ? doc.file_ext.toLowerCase() : '';

        // If docx, fetch buffer and parse via mammoth
        if (ext === '.docx') {
          const fileRes = await fetch(url);
          const arrayBuffer = await fileRes.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          if (isMounted) {
            setDocxHtml(DOMPurify.sanitize(result.value));
            setLoading(false);
          }
          return;
        }

        // If spreadsheet (.xlsx, .xls, .csv)
        if (['.xlsx', '.xls', '.csv', '.ods'].includes(ext)) {
          const fileRes = await fetch(url);
          const arrayBuffer = await fileRes.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          const sheets = {};
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
            sheets[sheetName] = json;
          });

          if (isMounted) {
            setSpreadsheetData({ sheetNames: workbook.SheetNames, sheets });
            setActiveSheet(firstSheet);
            setLoading(false);
          }
          return;
        }

        // If plain text / markdown / code
        if (['.txt', '.md', '.markdown', '.json', '.xml', '.yaml', '.yml', '.js', '.jsx', '.ts', '.tsx', '.py', '.css', '.html', '.sql', '.log'].includes(ext)) {
          const fileRes = await fetch(url);
          const text = await fileRes.text();
          if (isMounted) {
            setTextContent(text);
            setLoading(false);
          }
          return;
        }

        // Default: direct URL loading for PDF, images, etc.
        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Preview error:', err);
          setError(err.message || 'Failed to load file preview.');
          setLoading(false);
        }
      }
    }

    loadPreview();

    return () => {
      isMounted = false;
    };
  }, [isOpen, doc]);

  if (!isOpen || !doc) return null;

  const ext = doc.file_ext ? doc.file_ext.toLowerCase() : '';
  const categoryConfig = getCategoryConfig(doc.category);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-3 sm:p-6'} bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150`}>
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
        isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[92vh] rounded-3xl'
      }`}>
        {/* Header Bar */}
        <div className="h-16 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
              <FileIcon category={doc.category} ext={doc.file_ext} className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                {doc.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{formatBytes(doc.file_size)}</span>
                <span>•</span>
                <span className="capitalize">{categoryConfig.label}</span>
                <span>•</span>
                <span>{formatDate(doc.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Viewer Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Zoom Controls (for image and docs) */}
            {['.png', '.jpg', '.jpeg', '.webp', '.svg', '.docx'].includes(ext) && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-slate-600 dark:text-slate-300">
                <button
                  onClick={() => setZoom(prev => Math.max(50, prev - 15))}
                  className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold px-1 min-w-[42px] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom(prev => Math.min(200, prev + 15))}
                  className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoom(100)}
                  className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Open in New Window */}
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Open original in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:block"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Download Button */}
            <button
              onClick={() => onDownload(doc)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Content Area */}
        <div className="flex-1 overflow-auto bg-slate-100/70 dark:bg-slate-950/80 p-4 flex flex-col items-center justify-center relative">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              <p className="text-sm font-medium">Preparing document preview...</p>
            </div>
          )}

          {error && !loading && (
            <div className="max-w-md p-6 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-center space-y-3 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Preview Unavailable</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
              <button
                onClick={() => onDownload(doc)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                Download Original File
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="w-full h-full flex flex-col items-center justify-center overflow-auto">
              {/* 1. PDF Preview */}
              {ext === '.pdf' && (
                <iframe
                  src={`${previewUrl}#toolbar=1&navpanes=0`}
                  title={doc.name}
                  className="w-full h-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white"
                />
              )}

              {/* 2. Word .docx Preview */}
              {ext === '.docx' && docxHtml && (
                <div
                  className="w-full max-w-4xl min-h-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-8 sm:p-12 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 preview-docx-content overflow-auto"
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                  dangerouslySetInnerHTML={{ __html: docxHtml }}
                />
              )}

              {/* 3. Spreadsheet Preview */}
              {['.xlsx', '.xls', '.csv', '.ods'].includes(ext) && spreadsheetData && (
                <div className="w-full h-full flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                  {/* Sheet Tabs */}
                  {spreadsheetData.sheetNames.length > 1 && (
                    <div className="flex items-center gap-1 px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                      <Table className="w-4 h-4 text-emerald-500 mr-1 shrink-0" />
                      {spreadsheetData.sheetNames.map((sheet) => (
                        <button
                          key={sheet}
                          onClick={() => setActiveSheet(sheet)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                            activeSheet === sheet
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {sheet}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Spreadsheet Data Grid */}
                  <div className="flex-1 overflow-auto p-4">
                    {spreadsheetData.sheets[activeSheet]?.length > 0 ? (
                      <table className="w-full border-collapse text-xs text-left">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 sticky top-0 shadow-sm">
                            <th className="p-2 border border-slate-200 dark:border-slate-700 w-12 text-center text-slate-400">#</th>
                            {spreadsheetData.sheets[activeSheet][0]?.map((col, idx) => (
                              <th key={idx} className="p-2 border border-slate-200 dark:border-slate-700 font-bold whitespace-nowrap">
                                {col || `Col ${idx + 1}`}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {spreadsheetData.sheets[activeSheet].slice(1, 100).map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="p-2 border border-slate-200 dark:border-slate-700 text-center text-slate-400 bg-slate-50 dark:bg-slate-850">
                                {rIdx + 1}
                              </td>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-2 border border-slate-200 dark:border-slate-700 truncate max-w-xs text-slate-800 dark:text-slate-200">
                                  {cell !== null && cell !== undefined ? String(cell) : ''}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        This worksheet contains no data.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. Image Preview */}
              {['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'].includes(ext) && (
                <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
                  <img
                    src={previewUrl}
                    alt={doc.name}
                    className="max-h-full max-w-full object-contain rounded-xl shadow-lg transition-transform duration-200"
                    style={{ transform: `scale(${zoom / 100})` }}
                  />
                </div>
              )}

              {/* 5. Plain Text / Markdown / Code Preview */}
              {textContent && (
                <div className="w-full max-w-4xl h-full bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xl border border-slate-800 overflow-auto font-mono text-xs leading-relaxed">
                  <pre className="whitespace-pre-wrap">{textContent}</pre>
                </div>
              )}

              {/* 6. PowerPoint Presentation (.pptx) or Unsupported File Info */}
              {['.ppt', '.pptx', '.doc', '.zip', '.rar', '.7z', '.tar', '.gz'].includes(ext) && !docxHtml && !textContent && (
                <div className="max-w-md p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-4 shadow-xl">
                  <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto shadow-inner">
                    <FileIcon category={doc.category} ext={doc.file_ext} className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">{doc.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {ext.startsWith('.ppt') ? 'Presentation file' : 'Archived or binary format'}. Direct in-browser rendering is not available for this format. You can download and open it on your device.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-left space-y-1 text-slate-600 dark:text-slate-300">
                    <div><span className="font-semibold">Size:</span> {formatBytes(doc.file_size)}</div>
                    <div><span className="font-semibold">MIME Type:</span> {doc.mime_type}</div>
                    <div><span className="font-semibold">Uploaded:</span> {formatDate(doc.created_at)}</div>
                  </div>
                  <button
                    onClick={() => onDownload(doc)}
                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download File ({formatBytes(doc.file_size)})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentPreviewModal;
