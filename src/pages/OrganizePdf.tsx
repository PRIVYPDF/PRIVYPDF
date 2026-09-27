import React, { useState } from 'react';
import { Layers, RotateCw, Trash2, Copy, Download, GripVertical, Check } from 'lucide-react';
import { DropZone } from '../components/common/DropZone';
import { loadPdfDocument, renderPageThumbnail } from '../services/pdf/pdfRenderer';
import { reorderAndRotatePages } from '../services/pdf/pdfModifier';
import { downloadFile, triggerConfetti } from '../utils/fileUtils';

interface OrganizePageItem {
  id: string;
  originalIndex: number;
  rotation: number;
  thumbnailUrl: string;
}

export const OrganizePdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<OrganizePageItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileLoaded = async (loadedFile: File, loadedBuffer: ArrayBuffer) => {
    try {
      setFile(loadedFile);
      setBuffer(loadedBuffer);

      const pdfDoc = await loadPdfDocument(loadedBuffer);
      const count = pdfDoc.numPages;

      const loadedPages: OrganizePageItem[] = [];
      for (let i = 1; i <= count; i++) {
        const thumb = await renderPageThumbnail(pdfDoc, i, 0.35);
        loadedPages.push({
          id: `p-${i}-${Date.now()}`,
          originalIndex: i - 1,
          rotation: 0,
          thumbnailUrl: thumb,
        });
      }
      setPages(loadedPages);
    } catch (err) {
      console.error('Error loading PDF for organize:', err);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      const updated = [...pages];
      const [moved] = updated.splice(draggedIndex, 1);
      updated.splice(index, 0, moved);
      setPages(updated);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const rotatePage = (index: number) => {
    setPages(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        rotation: (updated[index].rotation + 90) % 360,
      };
      return updated;
    });
  };

  const duplicatePage = (index: number) => {
    const pageToDup = pages[index];
    const newPage: OrganizePageItem = {
      ...pageToDup,
      id: `dup-${Date.now()}-${Math.random()}`,
    };
    const updated = [...pages];
    updated.splice(index + 1, 0, newPage);
    setPages(updated);
  };

  const deletePage = (index: number) => {
    if (pages.length <= 1) return;
    setPages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveNewOrder = async () => {
    if (!buffer) return;
    try {
      setIsSaving(true);
      const pageInfos = pages.map(p => ({
        originalIndex: p.originalIndex,
        rotation: p.rotation,
      }));

      const organizedBytes = await reorderAndRotatePages(buffer, pageInfos);
      const outName = `${file?.name.replace(/\.pdf$/i, '') || 'document'}-organized.pdf`;
      downloadFile(organizedBytes, outName);
      triggerConfetti();
    } catch (err) {
      console.error('Error saving organized order:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" />
          <span>Local Page Organizer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Organize & Reorder PDF Pages
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Drag and drop pages to rearrange, duplicate, or delete without re-uploading.
        </p>
      </div>

      {!buffer ? (
        <DropZone
          onFileLoaded={handleFileLoaded}
          title="Drop your PDF here to organize"
          subtitle="or click to browse your local device"
        />
      ) : (
        <div className="space-y-6">
          {/* Top Bar */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-800">{pages.length} pages in current layout</p>
              <p className="text-xs text-slate-400">Drag any card or use the quick buttons below</p>
            </div>

            <button
              type="button"
              onClick={handleSaveNewOrder}
              disabled={isSaving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 disabled:opacity-50 transition-all cursor-pointer min-h-[44px]"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Save New Order & Download</span>
                </>
              )}
            </button>
          </div>

          {/* Draggable grid */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {pages.map((page, index) => {
                const isDraggingThis = draggedIndex === index;
                const isDragTarget = dragOverIndex === index;

                return (
                  <div
                    key={page.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={() => handleDrop(index)}
                    className={`group relative rounded-2xl p-2.5 transition-all cursor-grab active:cursor-grabbing border ${
                      isDraggingThis ? 'opacity-30 scale-95' : ''
                    } ${isDragTarget ? 'border-t-4 border-indigo-600' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'}`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5 px-0.5">
                      <div className="flex items-center gap-1 text-slate-700 font-bold">
                        <GripVertical className="w-3.5 h-3.5 text-slate-300" />
                        <span>Page {index + 1}</span>
                      </div>
                      {page.rotation > 0 && (
                        <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1 py-0.2 rounded">
                          {page.rotation}°
                        </span>
                      )}
                    </div>

                    <div className="w-full aspect-[1/1.414] bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs flex items-center justify-center relative">
                      <img
                        src={page.thumbnailUrl}
                        alt={`Page ${index + 1}`}
                        className="w-full h-full object-contain pointer-events-none transition-transform duration-200"
                        style={{ transform: `rotate(${page.rotation}deg)` }}
                      />
                    </div>

                    {/* Touch & Desktop Action buttons bar */}
                    <div className="flex items-center justify-center gap-1 mt-2 pt-1 border-t border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => rotatePage(index)}
                        className="flex-1 py-1 px-1 rounded-lg bg-white border border-slate-200 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition-colors flex items-center justify-center min-h-[30px]"
                        title="Rotate 90°"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicatePage(index)}
                        className="flex-1 py-1 px-1 rounded-lg bg-white border border-slate-200 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition-colors flex items-center justify-center min-h-[30px]"
                        title="Duplicate Page"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {pages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deletePage(index)}
                          className="flex-1 py-1 px-1 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 text-rose-600 hover:text-rose-700 transition-colors flex items-center justify-center min-h-[30px]"
                          title="Delete Page"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
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
