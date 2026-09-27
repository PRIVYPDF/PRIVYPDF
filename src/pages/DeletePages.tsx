import React, { useState } from 'react';
import { Trash2, Download, AlertTriangle, CheckSquare, Square, X } from 'lucide-react';
import { DropZone } from '../components/common/DropZone';
import { loadPdfDocument, extractAllThumbnails } from '../services/pdf/pdfRenderer';
import { deletePagesFromPdf } from '../services/pdf/pdfModifier';
import { downloadFile, triggerConfetti } from '../utils/fileUtils';

export const DeletePages: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPagesToDelete, setSelectedPagesToDelete] = useState<number[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFileLoaded = async (loadedFile: File, loadedBuffer: ArrayBuffer) => {
    try {
      setFile(loadedFile);
      setBuffer(loadedBuffer);

      const pdfDoc = await loadPdfDocument(loadedBuffer);
      setPageCount(pdfDoc.numPages);

      const thumbs = await extractAllThumbnails(loadedBuffer, 0.3);
      setThumbnails(thumbs);
      setSelectedPagesToDelete([]);
    } catch (err) {
      console.error('Error loading PDF for delete:', err);
    }
  };

  const togglePage = (pageNum: number) => {
    setSelectedPagesToDelete(prev =>
      prev.includes(pageNum) ? prev.filter(p => p !== pageNum) : [...prev, pageNum].sort((a, b) => a - b)
    );
  };

  const handleExecuteDelete = async () => {
    if (!buffer || selectedPagesToDelete.length === 0) return;
    try {
      setIsDeleting(true);
      setShowConfirmModal(false);

      // zero-based indices
      const zeroBased = selectedPagesToDelete.map(p => p - 1);
      const updatedBytes = await deletePagesFromPdf(buffer, zeroBased);

      const outName = `${file?.name.replace(/\.pdf$/i, '') || 'document'}-pages-removed.pdf`;
      downloadFile(updatedBytes, outName);
      triggerConfetti();
    } catch (err) {
      console.error('Error deleting pages:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider">
          <Trash2 className="w-3.5 h-3.5" />
          <span>Local Page Deleter</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Delete PDF Pages
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Visually select unwanted pages and generate a clean, trimmed PDF instantly on your device.
        </p>
      </div>

      {!buffer ? (
        <DropZone
          onFileLoaded={handleFileLoaded}
          title="Drop your PDF here to delete pages"
          subtitle="or click to browse your local device"
        />
      ) : (
        <div className="space-y-6">
          {/* Top Bar */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-800">
                {selectedPagesToDelete.length} of {pageCount} pages marked for deletion
              </p>
              <p className="text-xs text-slate-400">
                {pageCount - selectedPagesToDelete.length} pages will remain in final document
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={selectedPagesToDelete.length === 0 || selectedPagesToDelete.length >= pageCount}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/25 disabled:opacity-50 transition-all cursor-pointer min-h-[44px]"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span className="truncate">Delete {selectedPagesToDelete.length} Selected {selectedPagesToDelete.length === 1 ? 'Page' : 'Pages'}</span>
            </button>
          </div>

          {/* Thumbnails grid */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Click pages you wish to remove</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {thumbnails.map((thumb, index) => {
                const pageNum = index + 1;
                const isMarked = selectedPagesToDelete.includes(pageNum);

                return (
                  <div
                    key={pageNum}
                    onClick={() => togglePage(pageNum)}
                    className={`group relative cursor-pointer rounded-2xl p-2.5 transition-all border ${
                      isMarked
                        ? 'border-rose-500 bg-rose-50/70 ring-2 ring-rose-500/30'
                        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5 px-0.5">
                      <span className={`font-bold ${isMarked ? 'text-rose-700' : 'text-slate-700'}`}>
                        Page {pageNum}
                      </span>
                      {isMarked ? (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.2 rounded">Delete</span>
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>

                    <div className="w-full aspect-[1/1.414] bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs flex items-center justify-center relative">
                      <img
                        src={thumb}
                        alt={`Page ${pageNum}`}
                        className={`w-full h-full object-contain pointer-events-none transition-all ${
                          isMarked ? 'opacity-40 grayscale' : ''
                        }`}
                      />
                      {isMarked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-rose-900/10">
                          <Trash2 className="w-8 h-8 text-rose-600" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Remove {selectedPagesToDelete.length} selected {selectedPagesToDelete.length === 1 ? 'page' : 'pages'}?
                </h3>
                <p className="text-xs text-slate-500">
                  This will generate a new document with the selected pages permanently excised.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
              Pages to delete: <span className="font-mono font-bold text-rose-600">{selectedPagesToDelete.join(', ')}</span>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/25 min-h-[40px]"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>Confirm & Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
