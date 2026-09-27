import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ToolMode, 
  ShapeType, 
  Annotation, 
  PageInfo, 
  HistoryState, 
  WatermarkAnnotation 
} from '../types';
import { loadPdfDocument, extractAllThumbnails, renderPageThumbnail } from '../services/pdf/pdfRenderer';
import { 
  applyAnnotationsToPdf, 
  reorderAndRotatePages, 
  deletePagesFromPdf,
  createSamplePdf 
} from '../services/pdf/pdfModifier';
import { formatBytes, downloadFile, triggerConfetti } from '../utils/fileUtils';
import { DropZone } from '../components/common/DropZone';
import { WorkspaceHeader } from '../components/workspace/WorkspaceHeader';
import { EditorToolbar } from '../components/workspace/EditorToolbar';
import { ThumbnailSidebar } from '../components/workspace/ThumbnailSidebar';
import { PropertiesPanel } from '../components/workspace/PropertiesPanel';
import { EditorCanvas } from '../components/workspace/EditorCanvas';
import { SignatureModal } from '../components/workspace/SignatureModal';
import { WatermarkModal } from '../components/workspace/WatermarkModal';
import { SeoHead } from '../components/common/SeoHead';
import { useLocation } from 'react-router-dom';

export const PdfEditor: React.FC = () => {
  const location = useLocation();

  // Document State
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [selectedPageIndices, setSelectedPageIndices] = useState<number[]>([]);
  const [isLoadingDoc, setIsLoadingDoc] = useState<boolean>(false);

  // Annotations State
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  // Undo / Redo History
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Active Tool & Canvas State
  const [activeTool, setActiveTool] = useState<ToolMode>('select');
  const [activeShape, setActiveShape] = useState<ShapeType>('rectangle');
  const [zoom, setZoom] = useState<number>(1.0);

  // Modals & Mobile Drawers
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isWatermarkModalOpen, setIsWatermarkModalOpen] = useState(false);
  const [isMobileThumbnailsOpen, setIsMobileThumbnailsOpen] = useState(false);
  const [isMobilePropertiesOpen, setIsMobilePropertiesOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Style Defaults
  const [defaultTextColor, setDefaultTextColor] = useState('#0f172a');
  const [defaultFontSize, setDefaultFontSize] = useState(18);
  const [defaultDrawColor, setDefaultDrawColor] = useState('#2563eb');
  const [defaultDrawWidth, setDefaultDrawWidth] = useState(3);
  const [defaultHighlightColor, setDefaultHighlightColor] = useState('#fef08a');
  const [defaultHighlightOpacity, setDefaultHighlightOpacity] = useState(0.35);
  const [defaultShapeStroke, setDefaultShapeStroke] = useState('#dc2626');
  const [defaultShapeFill, setDefaultShapeFill] = useState('transparent');

  // Push state to history
  const pushHistory = useCallback((newPages: PageInfo[], newAnnotations: Annotation[]) => {
    setHistory(prev => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      return [...upToCurrent, { pages: newPages, annotations: newAnnotations }];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Load PDF into state
  const handleLoadPdf = async (loadedFile: File, buffer: ArrayBuffer) => {
    try {
      setIsLoadingDoc(true);
      setFile(loadedFile);
      setFileName(loadedFile.name);
      setArrayBuffer(buffer);

      const pdfDoc = await loadPdfDocument(buffer);
      const count = pdfDoc.numPages;

      const newPages: PageInfo[] = [];
      for (let i = 1; i <= count; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });
        const thumb = await renderPageThumbnail(pdfDoc, i, 0.35);
        newPages.push({
          pageIndex: i - 1,
          displayNumber: i,
          rotation: 0,
          width: viewport.width,
          height: viewport.height,
          thumbnailUrl: thumb,
        });
      }

      setPages(newPages);
      setCurrentPageIndex(0);
      setSelectedPageIndices([0]);
      setAnnotations([]);
      setSelectedAnnotationId(null);

      // Initialize history
      setHistory([{ pages: newPages, annotations: [] }]);
      setHistoryIndex(0);
    } catch (err) {
      console.error('Error loading PDF document:', err);
    } finally {
      setIsLoadingDoc(false);
    }
  };

  // Check if buffer passed via React Router location state
  useEffect(() => {
    if (location.state && (location.state as any).file && (location.state as any).buffer) {
      const s = location.state as { file: File; buffer: ArrayBuffer };
      handleLoadPdf(s.file, s.buffer);
    }
  }, [location.state]);

  // Undo Handler
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setPages(prevState.pages);
      setAnnotations(prevState.annotations);
      setHistoryIndex(historyIndex - 1);
      setSelectedAnnotationId(null);
    }
  };

  // Redo Handler
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setPages(nextState.pages);
      setAnnotations(nextState.annotations);
      setHistoryIndex(historyIndex + 1);
      setSelectedAnnotationId(null);
    }
  };

  // Annotation helpers
  const handleAddAnnotation = (ann: Annotation) => {
    const updated = [...annotations, ann];
    setAnnotations(updated);
    pushHistory(pages, updated);
  };

  const handleUpdateAnnotation = (updatedAnn: Annotation) => {
    const updated = annotations.map(a => a.id === updatedAnn.id ? updatedAnn : a);
    setAnnotations(updated);
    pushHistory(pages, updated);
  };

  const handleDeleteAnnotation = (id: string) => {
    const updated = annotations.filter(a => a.id !== id);
    setAnnotations(updated);
    if (selectedAnnotationId === id) setSelectedAnnotationId(null);
    pushHistory(pages, updated);
  };

  // Page reordering
  const handleReorderPages = (fromIndex: number, toIndex: number) => {
    const reordered = [...pages];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setPages(reordered);
    setCurrentPageIndex(toIndex);
    pushHistory(reordered, annotations);
  };

  // Rotate single page
  const handleRotatePage = (index: number) => {
    const updated = pages.map((p, i) => {
      if (i === index) {
        return { ...p, rotation: (p.rotation + 90) % 360 };
      }
      return p;
    });
    setPages(updated);
    pushHistory(updated, annotations);
  };

  // Rotate current active page
  const handleRotateCurrentPage = () => {
    handleRotatePage(currentPageIndex);
  };

  // Delete page
  const handleDeletePage = (index: number) => {
    if (pages.length <= 1) return;
    const updated = pages.filter((_, i) => i !== index);
    setPages(updated);
    const newCurrent = Math.min(currentPageIndex, updated.length - 1);
    setCurrentPageIndex(newCurrent);
    // Remove annotations for deleted page
    const filteredAnn = annotations.filter(a => a.pageIndex !== index);
    setAnnotations(filteredAnn);
    pushHistory(updated, filteredAnn);
  };

  // Delete current page
  const handleDeleteCurrentPage = () => {
    handleDeletePage(currentPageIndex);
  };

  // Duplicate page
  const handleDuplicatePage = (index: number) => {
    const pageToDup = pages[index];
    const duplicated: PageInfo = {
      ...pageToDup,
      pageIndex: pageToDup.pageIndex, // original index reference
      displayNumber: pages.length + 1,
    };
    const updated = [...pages];
    updated.splice(index + 1, 0, duplicated);
    setPages(updated);
    setCurrentPageIndex(index + 1);
    pushHistory(updated, annotations);
  };

  // Multi-select toggle
  const handleToggleSelectPage = (index: number) => {
    setSelectedPageIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  // Insert signature
  const handleSaveSignature = (dataUrl: string) => {
    const newSignature: Annotation = {
      id: `sig-${Date.now()}`,
      pageIndex: currentPageIndex,
      type: 'signature',
      x: 35,
      y: 60,
      width: 25,
      height: 12,
      dataUrl,
    };
    handleAddAnnotation(newSignature);
    setSelectedAnnotationId(newSignature.id);
  };

  // Insert image
  const handleUploadImage = (dataUrl: string) => {
    const newImage: Annotation = {
      id: `img-${Date.now()}`,
      pageIndex: currentPageIndex,
      type: 'image',
      x: 30,
      y: 30,
      width: 30,
      height: 25,
      rotation: 0,
      dataUrl,
    };
    handleAddAnnotation(newImage);
    setSelectedAnnotationId(newImage.id);
  };

  // Apply watermark
  const handleApplyWatermark = (
    wmConfig: Omit<WatermarkAnnotation, 'id' | 'pageIndex' | 'type'>,
    applyToAll: boolean
  ) => {
    const targetPages = applyToAll ? pages.map((_, i) => i) : [currentPageIndex];
    const newWatermarks: Annotation[] = targetPages.map((pIdx, i) => ({
      id: `wm-${Date.now()}-${i}`,
      pageIndex: pIdx,
      type: 'watermark',
      ...wmConfig,
    }));

    const updated = [...annotations, ...newWatermarks];
    setAnnotations(updated);
    pushHistory(pages, updated);
  };

  // Export & Download final PDF
  const handleSaveDownload = async () => {
    if (!arrayBuffer) return;
    try {
      setIsSaving(true);

      // 1. First reorder / rotate pages as per current workspace
      const pageInfos = pages.map(p => ({
        originalIndex: p.pageIndex,
        rotation: p.rotation,
      }));
      const reorderedBytes = await reorderAndRotatePages(arrayBuffer, pageInfos);

      // 2. Next embed annotations (text, draw, images, signatures, watermarks, shapes)
      const finalBytes = await applyAnnotationsToPdf(reorderedBytes.buffer as ArrayBuffer, annotations);

      // Download
      const outputName = fileName ? fileName.replace(/\.pdf$/i, '') + '-edited.pdf' : 'PrivyPDF-Document.pdf';
      downloadFile(finalBytes, outputName);
      triggerConfetti();
    } catch (err) {
      console.error('Error generating final PDF:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setFileName('');
    setArrayBuffer(null);
    setPages([]);
    setAnnotations([]);
    setSelectedAnnotationId(null);
    setHistory([]);
    setHistoryIndex(-1);
  };

  // Selected annotation object
  const selectedAnnotation = annotations.find(a => a.id === selectedAnnotationId) || null;

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] overflow-hidden bg-slate-100 w-full">
      <SeoHead
        title="Free Online PDF Editor — Edit, Draw, Sign & Annotate PDFs Privately"
        description="Private browser-based PDF editor. Add text, drawings, highlights, shapes, images, watermarks, and electronic signatures to PDF files without uploading to servers."
        canonicalPath="/pdf-editor"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'PDF Editor', url: '/pdf-editor' },
        ]}
        faqs={[
          {
            question: 'Can I add text and change its font size or color?',
            answer: 'Yes! The PrivyPDF editor allows you to type custom text anywhere on your PDF, customize its font size, font family, color, bold, and italic styles, and move or resize the text box freely.',
          },
          {
            question: 'Does the downloaded PDF retain my drawings, signatures, and edits?',
            answer: 'Yes. All text, pen strokes, highlighter marks, shapes, images, and signatures are permanently rendered and embedded directly into the final PDF document vector streams upon download.',
          },
          {
            question: 'Can I reorder, duplicate, or delete pages in the PDF editor?',
            answer: 'Yes, the page thumbnail sidebar allows you to drag to reorder pages, rotate individual pages by 90-degree increments, duplicate pages, and delete unwanted pages directly in the workspace.',
          },
        ]}
      />

      {!arrayBuffer ? (
        // Initial Empty State: DropZone
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 max-w-3xl mx-auto w-full overflow-y-auto">
          <div className="text-center mb-6 sm:mb-8 space-y-2 px-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Interactive Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Free Private Online PDF Editor & Workspace
            </h1>
            <p className="text-slate-500 max-w-lg mx-auto text-xs sm:text-sm">
              All editing, annotations, drawing, signing, and reordering take place in your browser memory.
            </p>
          </div>

          <DropZone
            onFileLoaded={handleLoadPdf}
            title="Drop your PDF here to edit"
            subtitle="or click to browse your local device"
            allowSample={true}
          />
        </div>
      ) : (
        // Loaded Workspace View
        <div className="flex flex-col h-full overflow-hidden w-full relative">
          {/* Top Header */}
          <WorkspaceHeader
            fileName={fileName}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onSaveDownload={handleSaveDownload}
            onClearFile={handleClearFile}
            isSaving={isSaving}
            hasUnsavedChanges={annotations.length > 0 || pages.some(p => p.rotation > 0)}
            onToggleThumbnails={() => setIsMobileThumbnailsOpen(!isMobileThumbnailsOpen)}
            onToggleProperties={() => setIsMobilePropertiesOpen(!isMobilePropertiesOpen)}
            pageCount={pages.length}
          />

          {/* Editing Toolbar */}
          <EditorToolbar
            activeTool={activeTool}
            onSelectTool={setActiveTool}
            activeShape={activeShape}
            onSelectShape={setActiveShape}
            onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
            onOpenWatermarkModal={() => setIsWatermarkModalOpen(true)}
            onUploadImage={handleUploadImage}
            onRotateCurrentPage={handleRotateCurrentPage}
            onDeleteCurrentPage={handleDeleteCurrentPage}
            zoom={zoom}
            onZoomChange={setZoom}
            canDelete={pages.length > 1}
          />

          {/* Workspace Body: Left Thumbnails, Center Canvas, Right Properties */}
          <div className="flex-1 flex overflow-hidden w-full relative">
            {/* Left Page Thumbnails (Desktop sidebar + Mobile drawer) */}
            <ThumbnailSidebar
              pages={pages}
              currentPageIndex={currentPageIndex}
              selectedPageIndices={selectedPageIndices}
              onSelectPage={setCurrentPageIndex}
              onToggleSelectPage={handleToggleSelectPage}
              onReorderPages={handleReorderPages}
              onRotatePage={handleRotatePage}
              onDeletePage={handleDeletePage}
              onDuplicatePage={handleDuplicatePage}
              isOpenOnMobile={isMobileThumbnailsOpen}
              onCloseMobile={() => setIsMobileThumbnailsOpen(false)}
            />

            {/* Center Canvas */}
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
              <EditorCanvas
                arrayBuffer={arrayBuffer}
                currentPage={pages[currentPageIndex] || { pageIndex: 0, displayNumber: 1, rotation: 0, width: 595, height: 842 }}
                currentPageIndex={currentPageIndex}
                zoom={zoom}
                activeTool={activeTool}
                activeShape={activeShape}
                annotations={annotations}
                onAddAnnotation={handleAddAnnotation}
                onUpdateAnnotation={handleUpdateAnnotation}
                onDeleteAnnotation={handleDeleteAnnotation}
                selectedAnnotationId={selectedAnnotationId}
                onSelectAnnotation={(id) => {
                  setSelectedAnnotationId(id);
                  if (id && window.innerWidth < 1024) {
                    setIsMobilePropertiesOpen(true);
                  }
                }}
                defaultTextColor={defaultTextColor}
                defaultFontSize={defaultFontSize}
                defaultDrawColor={defaultDrawColor}
                defaultDrawWidth={defaultDrawWidth}
                defaultHighlightColor={defaultHighlightColor}
                defaultHighlightOpacity={defaultHighlightOpacity}
                defaultShapeStroke={defaultShapeStroke}
                defaultShapeFill={defaultShapeFill}
              />

              {/* Mobile Quick Page Switcher Bar */}
              <div className="lg:hidden bg-white/95 backdrop-blur-xs border-t border-slate-200/90 px-2.5 py-1.5 flex items-center justify-between z-20 text-xs shrink-0 gap-1.5 shadow-2xs">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                    disabled={currentPageIndex === 0}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 font-semibold disabled:opacity-30 active:bg-slate-100 min-h-[36px] flex items-center"
                  >
                    ←
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsMobileThumbnailsOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold min-h-[36px] flex items-center gap-1 text-[11px] sm:text-xs"
                    title="View all pages"
                  >
                    <span>Page {currentPageIndex + 1}/{pages.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
                    disabled={currentPageIndex === pages.length - 1}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 font-semibold disabled:opacity-30 active:bg-slate-100 min-h-[36px] flex items-center"
                  >
                    →
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobilePropertiesOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold min-h-[36px] flex items-center gap-1 text-[11px] sm:text-xs"
                  title="Configure tool properties"
                >
                  <span>Tool Options ⚙️</span>
                </button>
              </div>
            </div>

            {/* Right Contextual Properties (Desktop sidebar + Mobile drawer) */}
            <PropertiesPanel
              activeTool={activeTool}
              selectedAnnotation={selectedAnnotation}
              onUpdateAnnotation={handleUpdateAnnotation}
              onDeleteAnnotation={handleDeleteAnnotation}
              defaultTextColor={defaultTextColor}
              setDefaultTextColor={setDefaultTextColor}
              defaultFontSize={defaultFontSize}
              setDefaultFontSize={setDefaultFontSize}
              defaultDrawColor={defaultDrawColor}
              setDefaultDrawColor={setDefaultDrawColor}
              defaultDrawWidth={defaultDrawWidth}
              setDefaultDrawWidth={setDefaultDrawWidth}
              defaultHighlightColor={defaultHighlightColor}
              setDefaultHighlightColor={setDefaultHighlightColor}
              defaultHighlightOpacity={defaultHighlightOpacity}
              setDefaultHighlightOpacity={setDefaultHighlightOpacity}
              defaultShapeStroke={defaultShapeStroke}
              setDefaultShapeStroke={setDefaultShapeStroke}
              defaultShapeFill={defaultShapeFill}
              setDefaultShapeFill={setDefaultShapeFill}
              isOpenOnMobile={isMobilePropertiesOpen}
              onCloseMobile={() => setIsMobilePropertiesOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSaveSignature={handleSaveSignature}
      />

      {/* Watermark Modal */}
      <WatermarkModal
        isOpen={isWatermarkModalOpen}
        onClose={() => setIsWatermarkModalOpen(false)}
        onApplyWatermark={handleApplyWatermark}
      />
    </div>
  );
};
