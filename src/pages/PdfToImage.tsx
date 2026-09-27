import React, { useState } from 'react';
import { Image as ImageIcon, Download, CheckSquare, Square, Package } from 'lucide-react';
import { DropZone } from '../components/common/DropZone';
import { loadPdfDocument, extractAllThumbnails } from '../services/pdf/pdfRenderer';
import { exportPdfPagesToImages, createZipFromImages } from '../services/pdf/pdfToImage';
import { downloadFile, triggerConfetti } from '../utils/fileUtils';

export const PdfToImage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const handleFileLoaded = async (loadedFile: File, loadedBuffer: ArrayBuffer) => {
    try {
      setFile(loadedFile);
      setBuffer(loadedBuffer);
      setIsExporting(true);

      const pdfDoc = await loadPdfDocument(loadedBuffer);
      const count = pdfDoc.numPages;
      setPageCount(count);

      const thumbs = await extractAllThumbnails(loadedBuffer, 0.3);
      setThumbnails(thumbs);

      // Select all by default
      const all = Array.from({ length: count }, (_, i) => i + 1);
      setSelectedPages(all);
    } catch (err) {
      console.error('Error loading PDF for image extraction:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const togglePage = (pageNum: number) => {
    setSelectedPages(prev =>
      prev.includes(pageNum) ? prev.filter(p => p !== pageNum) : [...prev, pageNum].sort((a, b) => a - b)
    );
  };

  const selectAll = () => {
    setSelectedPages(Array.from({ length: pageCount }, (_, i) => i + 1));
  };

  const selectNone = () => {
    setSelectedPages([]);
  };

  // Download single image
  const handleDownloadSingle = async (pageNum: number) => {
    if (!buffer) return;
    try {
      setIsExporting(true);
      const results = await exportPdfPagesToImages(buffer, [pageNum], format, 2.0);
      if (results.length > 0) {
        const item = results[0];
        downloadFile(item.blob, `${file?.name.replace(/\.pdf$/i, '')}-${item.fileName}`, item.blob.type);
      }
    } catch (err) {
      console.error('Error exporting single page image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Download batch ZIP or single
  const handleBatchDownload = async () => {
    if (!buffer || selectedPages.length === 0) return;
    try {
      setIsExporting(true);
      setProgress({ current: 0, total: selectedPages.length });

      const results = await exportPdfPagesToImages(
        buffer,
        selectedPages,
        format,
        2.0,
        0.95,
        (current, total) => setProgress({ current, total })
      );

      const baseName = file?.name.replace(/\.pdf$/i, '') || 'pdf-images';

      if (results.length === 1) {
        const single = results[0];
        downloadFile(single.blob, `${baseName}-${single.fileName}`, single.blob.type);
      } else {
        const zipBlob = await createZipFromImages(results, baseName);
        downloadFile(zipBlob, `${baseName}-images.zip`, 'application/zip');
      }

      triggerConfetti();
    } catch (err) {
      console.error('Error during batch export:', err);
    } finally {
      setIsExporting(false);
      setProgress(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Local PDF to Image</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Extract PDF Pages as Images
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Convert PDF pages into high-resolution PNG or JPG graphics. Download individually or as a ZIP.
        </p>
      </div>

      {!buffer ? (
        <DropZone
          onFileLoaded={handleFileLoaded}
          title="Drop your PDF here to extract images"
          subtitle="or click to browse your local device"
        />
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            {/* Format choice */}
            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Format:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormat('png')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all min-h-[36px] flex items-center ${
                    format === 'png' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  PNG (Lossless)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('jpeg')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all min-h-[36px] flex items-center ${
                    format === 'jpeg' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  JPG (Photo)
                </button>
              </div>
            </div>

            {/* Selection quick toggles */}
            <div className="flex items-center justify-between sm:justify-start gap-3 text-xs">
              <button
                type="button"
                onClick={selectAll}
                className="text-indigo-600 font-semibold hover:underline min-h-[36px] flex items-center"
              >
                Select All ({pageCount})
              </button>
              <button
                type="button"
                onClick={selectNone}
                className="text-slate-500 hover:underline min-h-[36px] flex items-center"
              >
                Deselect All
              </button>
            </div>

            {/* Export CTA */}
            <button
              type="button"
              onClick={handleBatchDownload}
              disabled={isExporting || selectedPages.length === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 disabled:opacity-50 transition-all cursor-pointer min-h-[44px]"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                  <span className="truncate">
                    {progress ? `Rendering (${progress.current}/${progress.total})...` : 'Exporting...'}
                  </span>
                </>
              ) : (
                <>
                  {selectedPages.length > 1 ? <Package className="w-4 h-4 shrink-0" /> : <Download className="w-4 h-4 shrink-0" />}
                  <span className="truncate">
                    {selectedPages.length > 1
                      ? `Download ${selectedPages.length} Images as ZIP`
                      : 'Download Image'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Thumbnails grid */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Click pages to toggle or download individually</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {thumbnails.map((thumb, index) => {
                const pageNum = index + 1;
                const isSelected = selectedPages.includes(pageNum);

                return (
                  <div
                    key={pageNum}
                    onClick={() => togglePage(pageNum)}
                    className={`group relative cursor-pointer rounded-2xl p-2.5 transition-all border ${
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

                    <div className="w-full aspect-[1/1.414] bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs flex items-center justify-center relative">
                      <img
                        src={thumb}
                        alt={`Page ${pageNum}`}
                        className="w-full h-full object-contain pointer-events-none"
                      />

                      {/* Download individual icon */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadSingle(pageNum);
                        }}
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-white/95 text-slate-700 hover:text-indigo-600 shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity min-w-[32px] min-h-[32px] flex items-center justify-center"
                        title={`Download Page ${pageNum} image directly`}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
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
