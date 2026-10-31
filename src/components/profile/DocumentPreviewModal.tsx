import { createPortal } from 'react-dom';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, ExternalLink, FileText, Check, Copy, Trash2, Image as ImageIcon } from 'lucide-react';
import { DocumentItem } from '../../types/portfolio';

interface DocumentPreviewModalProps {
  document: DocumentItem | {
    id?: string;
    title: string;
    fileName: string;
    fileDataUrl: string;
    fileType: 'pdf' | 'image' | 'text';
    format?: string;
    textContent?: string;
    fileSize?: string;
    category?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  isOpen,
  onClose,
  onDelete,
  isAdmin = false,
}) => {
  const [downloaded, setDownloaded] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && window.document.body) {
      window.document.body.style.overflow = 'hidden';
      window.document.documentElement.style.overflow = 'hidden';
    } else if (window.document.body) {
      window.document.body.style.overflow = 'unset';
      window.document.documentElement.style.overflow = 'unset';
    }
    return () => {
      if (window.document.body) window.document.body.style.overflow = 'unset';
      window.document.documentElement.style.overflow = 'unset';
    };
  }, [isOpen]);

  // early return removed for exit animation

  const handleDownload = () => {
    try {
      if (document?.fileType === 'text' && !document?.fileDataUrl) {
        const blob = new Blob([document?.textContent || ''], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = document?.fileName?.endsWith('.txt') ? document.fileName : `${document?.title || 'document'}.txt`;
        if (window.document.body) {
          window.document.body.appendChild(link);
          link.click();
          window.document.body.removeChild(link);
        } else {
          link.click();
        }
        URL.revokeObjectURL(url);
      } else if (document?.fileDataUrl) {
        // If file is served from server uploads, trigger download directly
        const downloadUrl = document.fileDataUrl.startsWith('/api/uploads/')
          ? `/api/documents/${document.fileDataUrl.replace('/api/uploads/', '')}?download=true`
          : document.fileDataUrl;
        const link = window.document.createElement('a');
        link.href = downloadUrl;
        link.download = document.fileName || 'document';
        if (window.document.body) {
          window.document.body.appendChild(link);
          link.click();
          window.document.body.removeChild(link);
        } else {
          link.click();
        }
      }
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch (err) {
      console.error('Failed to download document:', err);
    }
  };

  const handleCopyText = () => {
    if (document?.textContent) {
      navigator.clipboard.writeText(document?.textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenNewTab = () => {
    if (document?.fileDataUrl) {
      if (document.fileDataUrl.startsWith('/api/')) {
        window.open(document.fileDataUrl, '_blank');
      } else {
        const w = window.open();
        if (w) {
          w.document.write(
            `<iframe src="${document?.fileDataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
          );
        }
      }
    }
  };

  const fileNameLower = (document?.fileName || '').toLowerCase();
  const isImage = document?.fileType === 'image' || fileNameLower.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i);
  const isPdf = document?.fileType === 'pdf' || fileNameLower.endsWith('.pdf');
  const isText = document?.fileType === 'text' || (!isImage && !isPdf && Boolean(document?.textContent));

  if (typeof window === 'undefined' || typeof window.document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {isOpen && (
      <motion.div 
        key="document-preview-backdrop"
        className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-5xl h-[100dvh] sm:h-[92vh] bg-white dark:bg-slate-900 rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-0 sm:border border-slate-200 dark:border-slate-800"
        >
          {/* Header Bar */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
                {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                  {document?.title || document.fileName}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 truncate">
                  <span className="truncate">{document.fileName}</span>
                  {document.fileSize && (
                    <>
                      <span>•</span>
                      <span>{document.fileSize}</span>
                    </>
                  )}
                  {document.category && (
                    <>
                      <span>•</span>
                      <span className="capitalize px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {document.category}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {isText && document?.textContent && (
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-all"
                  title="Copy Text"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDownload}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#000080] hover:bg-blue-900 text-white flex items-center gap-1.5 transition-all shadow-xs"
                title="Download Document"
              >
                {downloaded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span className="hidden sm:inline">Saved!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </>
                )}
              </button>

              {document?.fileDataUrl && !isText && (
                <button
                  type="button"
                  onClick={handleOpenNewTab}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  title="Open in new window"
                >
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              {isAdmin && onDelete && document.id && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete "${document?.title || document.fileName}"?`)) {
                      onDelete(document.id!);
                      onClose();
                    }
                  }}
                  className="p-1.5 sm:p-2 rounded-xl text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Document Content Viewport */}
          <div className="flex-1 w-full bg-slate-100 dark:bg-slate-950/60 overflow-auto p-2 sm:p-6 flex items-center justify-center relative">
            {isImage ? (
              <div className="max-w-full max-h-full flex items-center justify-center">
                <img
                  src={document?.fileDataUrl}
                  alt={document?.title}
                  className="max-h-[75vh] w-auto object-contain rounded-xl shadow-lg border border-slate-200 dark:border-slate-800"
                />
              </div>
            ) : isText ? (
              <div className="w-full h-full max-w-4xl bg-white dark:bg-slate-900 rounded-xl p-6 shadow-md border border-slate-200 dark:border-slate-800 overflow-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                {document?.textContent || (document?.fileDataUrl ? 'Loading text...' : 'No text content.')}
              </div>
            ) : isPdf ? (
              <div className="w-full h-full rounded-xl overflow-hidden bg-white shadow-md border border-slate-200 dark:border-slate-800 flex flex-col">
                <iframe
                  src={document?.fileDataUrl}
                  title={document?.title}
                  className="w-full flex-1 border-0 rounded-xl"
                />
              </div>
            ) : document?.fileDataUrl ? (
              <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border-2 border-amber-400/40">
                  <FileText className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                    {document?.title || document.fileName}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    {document.fileName} &bull; {document.fileSize || 'File'}
                  </p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {document.format || 'Document'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  This file ({document.fileSize || 'up to 100MB'}) is saved securely and ready for download.
                </p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full py-3 rounded-2xl bg-[#000080] hover:bg-blue-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download {document.fileName}</span>
                </button>
              </div>
            ) : (
              <div className="text-center p-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200">No Document File Attached</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 max-w-sm">
                  This document record exists in your profile. You can attach or replace the file using the Edit Profile option.
                </p>
              </div>
            )}
          </div>

          {/* Footer Bar info */}
          <div className="px-4 sm:px-6 py-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
            <span>Viewing {document.fileName || 'document'}</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">Personal Portfolio &bull; Secure Document Preview</span>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>,
    window.document.body
  );
};

