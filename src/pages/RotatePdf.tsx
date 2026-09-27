import React, { useState } from 'react';
import { RotateCw, RotateCcw, Download, CheckSquare, Square } from 'lucide-react';
import { DropZone } from '../components/common/DropZone';
import { loadPdfDocument, extractAllThumbnails } from '../services/pdf/pdfRenderer';
import { reorderAndRotatePages } from '../services/pdf/pdfModifier';
import { downloadFile, triggerConfetti } from '../utils/fileUtils';

export const RotatePdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageRotations, setPageRotations] = useState<number[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isRotating, setIsRotating] = useState(false);

  const handleFileLoaded = async (loadedFile: File, loadedBuffer: ArrayBuffer) => {
    try {
      setFile(loadedFile);
      setBuffer(loadedBuffer);

      const pdfDoc = await loadPdfDocument(loadedBuffer);
      const count = pdfDoc.numPages;
      setPageCount(count);
      setPageRotations(new Array(count).fill(0));

      const thumbs = await extractAllThumbnails(loadedBuffer, 0.3);
      setThumbnails(thumbs);
      setSelectedPages([]);
    } catch (err) {
      console.error('Error loading PDF for rotation:', err);
    }
  };

  const rotateSingle = (index: number, angle: number = 90) => {
    setPageRotations(prev => {
      const updated = [...prev];
      updated[index] = (updated[index] + angle) % 360;
      return updated;
    });
  };

  const rotateSelected = (angle: number) => {
    if (selectedPages.length === 0) return;
    setPageRotations(prev => {
      const updated = [...prev];
      selectedPages.forEach(pNum => {
        const idx = pNum - 1;
        updated[idx] = (updated[idx] + angle) % 360;
      });
      return updated;
    });
  };

  const rotateAll = (angle: number) => {
    setPageRotations(prev => prev.map(r => (r + angle) % 360));
  };

  const togglePageSelection = (pageNum: number) => {
    setSelectedPages(prev =>
      prev.includes(pageNum) ? prev.filter(p => p !== pageNum) : [...prev, pageNum]
    );
  };

  const selectAll = () => {
    setSelectedPages(Array.from({ length: pageCount }, (_, i) => i + 1));
  };

  const deselectAll = () => {
    setSelectedPages([]);
  };

  const handleSaveRotatedPdf = async () => {
    if (!buffer) return;
    try {
      setIsRotating(true);
      const pageInfos = pageRotations.map((rot, idx) => ({
        originalIndex: idx,
        rotation: rot,
      }));

      const rotatedBytes = await reorderAndRotatePages(buffer, pageInfos);
      const outName = `${file?.name.replace(/\.pdf$/i, '') || 'document'}-rotated.pdf`;
      downloadFile(rotatedBytes, outName);
      triggerConfetti();
    } catch (err) {
      console.error('Error applying rotations:', err);
    } finally {
      setIsRotating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <RotateCw className="w-3.5 h-3.5" />
          <span>Local PDF Rotator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Rotate PDF Pages
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Rotate individual pages or the entire document by 90°, 180°, or 270°. Permanent, instant, and private.
        </p>
      </div>

      {!buffer ? (
        <DropZone
          onFileLoaded={handleFileLoaded}
          title="Drop your PDF here to rotate"
          subtitle="or click to browse your local device"
        />
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">Rotate:</span>
              <button
                type="button"
                onClick={() => rotateAll(90)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-bold transition-all flex items-center gap-1.5 min-h-[36px]"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate All 90°</span>
              </button>
              <button
                type="button"
                onClick={() => rotateAll(180)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-bold transition-all flex items-center gap-1.5 min-h-[36px]"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate All 180°</span>
              </button>
              {selectedPages.length > 0 && (
                <button
                  type="button"
                  onClick={() => rotateSelected(90)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1.5 min-h-[36px]"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate Selected ({selectedPages.length}) 90°</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs text-indigo-600 font-semibold hover:underline min-h-[36px] flex items-center"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-xs text-slate-500 hover:underline min-h-[36px] flex items-center"
                >
                  Deselect
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveRotatedPdf}
                disabled={isRotating}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 disabled:opacity-50 transition-all cursor-pointer min-h-[44px]"
              >
                {isRotating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 shrink-0" />
                    <span>Download Rotated PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Thumbnails grid */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {thumbnails.map((thumb, index) => {
                const pageNum = index + 1;
                const rot = pageRotations[index] || 0;
                const isSelected = selectedPages.includes(pageNum);

                return (
                  <div
                    key={pageNum}
                    className={`group relative rounded-2xl p-2.5 transition-all border ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/30'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5 px-0.5">
                      <button
                        type="button"
                        onClick={() => togglePageSelection(pageNum)}
                        className="flex items-center gap-1.5 text-slate-700 font-bold"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>Page {pageNum}</span>
                      </button>

                      {rot > 0 && (
                        <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          {rot}°
                        </span>
                      )}
                    </div>

                    <div className="w-full aspect-[1/1.414] bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs flex items-center justify-center relative">
                      <img
                        src={thumb}
                        alt={`Page ${pageNum}`}
                        className="w-full h-full object-contain pointer-events-none transition-transform duration-200"
                        style={{ transform: `rotate(${rot}deg)` }}
                      />
                    </div>

                    {/* Touch & Desktop rotate action button */}
                    <button
                      type="button"
                      onClick={() => rotateSingle(index, 90)}
                      className="w-full mt-2 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors min-h-[36px]"
                      title="Rotate Page 90°"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Rotate 90°</span>
                    </button>
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
