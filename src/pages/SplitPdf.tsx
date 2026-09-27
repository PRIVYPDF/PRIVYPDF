import React, { useState, useEffect } from 'react';
import { Scissors, Download, FileText, CheckSquare, Square, Package, Sparkles } from 'lucide-react';
import { DropZone } from '../components/common/DropZone';
import { loadPdfDocument, extractAllThumbnails } from '../services/pdf/pdfRenderer';
import { extractPages, splitPdfIntoIndividualPages } from '../services/pdf/pdfModifier';
import { downloadFile, triggerConfetti } from '../utils/fileUtils';
import JSZip from 'jszip';

export const SplitPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [rangeInput, setRangeInput] = useState('');
  const [splitMode, setSplitMode] = useState<'extract' | 'all'>('extract');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileLoaded = async (loadedFile: File, loadedBuffer: ArrayBuffer) => {
    try {
      setFile(loadedFile);
      setBuffer(loadedBuffer);
      setIsProcessing(true);

      const pdfDoc = await loadPdfDocument(loadedBuffer);
      const count = pdfDoc.numPages;
      setPageCount(count);

      const thumbs = await extractAllThumbnails(loadedBuffer, 0.3);
      setThumbnails(thumbs);

      // Default select page 1
      setSelectedPages([1]);
      setRangeInput('1');
    } catch (err) {
      console.error('Error loading PDF for split:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePageSelection = (pageNum: number) => {
    let updated: number[];
    if (selectedPages.includes(pageNum)) {
      updated = selectedPages.filter(p => p !== pageNum);
    } else {
      updated = [...selectedPages, pageNum].sort((a, b) => a - b);
    }
    setSelectedPages(updated);
    setRangeInput(updated.join(', '));
  };

  const selectAll = () => {
    const all = Array.from({ length: pageCount }, (_, i) => i + 1);
    setSelectedPages(all);
    setRangeInput(`1-${pageCount}`);
  };

  const clearSelection = () => {
    setSelectedPages([]);
    setRangeInput('');
  };

  // Parse page range text input
  const handleRangeInputChange = (val: string) => {
    setRangeInput(val);
    const pages = new Set<number>();
    const parts = val.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let p = Math.min(start, end); p <= Math.max(start, end); p++) {
            if (p >= 1 && p <= pageCount) pages.add(p);
          }
        }
      } else {
        const p = parseInt(trimmed, 10);
        if (!isNaN(p) && p >= 1 && p <= pageCount) {
          pages.add(p);
        }
      }
    }
    setSelectedPages(Array.from(pages).sort((a, b) => a - b));
  };

  const handleExecuteSplit = async () => {
    if (!buffer || pageCount === 0) return;
    try {
      setIsProcessing(true);

      if (splitMode === 'extract') {
        if (selectedPages.length === 0) return;
        // Zero-based indices for pdf-lib
        const zeroBased = selectedPages.map(p => p - 1);
        const splitBytes = await extractPages(buffer, zeroBased);
        const outName = `${file?.name.replace(/\.pdf$/i, '') || 'document'}-split.pdf`;
        downloadFile(splitBytes, outName);
        triggerConfetti();
      } else {
        // Split every page into separate individual PDF files in a ZIP
        const results = await splitPdfIntoIndividualPages(buffer);
        const zip = new JSZip();
        const baseName = file?.name.replace(/\.pdf$/i, '') || 'document';

        results.forEach(({ pageNum, bytes }) => {
          zip.file(`${baseName}-page-${pageNum}.pdf`, bytes);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadFile(zipBlob, `${baseName}-all-pages.zip`, 'application/zip');
        triggerConfetti();
      }
    } catch (err) {
      console.error('Error during PDF split:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <Scissors className="w-3.5 h-3.5" />
          <span>Local PDF Splitter</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Split & Extract PDF Pages
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Choose specific pages or ranges to extract into a single file, or split every page into a ZIP archive.
        </p>
      </div>

      {!buffer ? (
        <DropZone
          onFileLoaded={handleFileLoaded}
          title="Drop your PDF here to split"
          subtitle="or click to browse your local device"
        />
      ) : (
        <div className="space-y-6">
          {/* Options Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm space-y-5">
            {/* Split Mode Tabs */}
            <div className="flex flex-col sm:flex-row border-b border-slate-100 pb-2 sm:pb-4 gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setSplitMode('extract')}
                className={`pb-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 min-h-[40px] ${
                  splitMode === 'extract'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Scissors className="w-4 h-4 shrink-0" />
                <span>Extract Selected Pages</span>
              </button>
              <button
                type="button"
                onClick={() => setSplitMode('all')}
                className={`pb-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 min-h-[40px] ${
                  splitMode === 'all'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Package className="w-4 h-4 shrink-0" />
                <span>Split Every Page into ZIP</span>
              </button>
            </div>

            {splitMode === 'extract' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Page Range (e.g. 1-3, 5)
                  </label>
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => handleRangeInputChange(e.target.value)}
                    placeholder="e.g. 1-2, 4"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-800"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-indigo-600 hover:underline font-semibold min-h-[32px] flex items-center"
                    >
                      Select All ({pageCount})
                    </button>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-slate-500 hover:underline min-h-[32px] flex items-center"
                    >
                      Clear Selection
                    </button>
                  </div>
                  <span className="text-slate-500 font-medium">
                    {selectedPages.length} of {pageCount} pages selected
                  </span>
                </div>
              </div>
            )}

            {splitMode === 'all' && (
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 space-y-1">
                <p className="font-semibold">All {pageCount} pages will be split into individual PDF files.</p>
                <p className="text-indigo-700">They will be compressed and packaged into a .ZIP archive in your browser.</p>
              </div>
            )}

            {/* Execute Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleExecuteSplit}
                disabled={isProcessing || (splitMode === 'extract' && selectedPages.length === 0)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 disabled:opacity-50 transition-all cursor-pointer min-h-[44px]"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    <span>Processing Locally...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {splitMode === 'extract'
                        ? `Extract & Download ${selectedPages.length} Pages`
                        : `Split All ${pageCount} Pages into ZIP`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Visual Thumbnail Grid */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Click pages to toggle selection</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {thumbnails.map((thumb, index) => {
                const pageNum = index + 1;
                const isSelected = selectedPages.includes(pageNum);

                return (
                  <div
                    key={pageNum}
                    onClick={() => togglePageSelection(pageNum)}
                    className={`group cursor-pointer rounded-2xl p-2 transition-all border ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/30'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5 px-0.5">
                      <span className="font-bold text-slate-700">Page {pageNum}</span>
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>

                    <div className="w-full aspect-[1/1.414] bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs flex items-center justify-center">
                      <img
                        src={thumb}
                        alt={`Page ${pageNum}`}
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
