import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  ToolMode, 
  ShapeType, 
  Annotation, 
  TextAnnotation, 
  DrawingAnnotation, 
  HighlightAnnotation, 
  ShapeAnnotation, 
  ImageAnnotation, 
  SignatureAnnotation, 
  WatermarkAnnotation, 
  PageInfo 
} from '../../types';
import { renderPageToCanvas, loadPdfDocument } from '../../services/pdf/pdfRenderer';
import { Trash2, Move, RotateCw, Edit3 } from 'lucide-react';

interface EditorCanvasProps {
  arrayBuffer: ArrayBuffer | null;
  currentPage: PageInfo;
  currentPageIndex: number;
  zoom: number;
  activeTool: ToolMode;
  activeShape: ShapeType;
  annotations: Annotation[];
  onAddAnnotation: (ann: Annotation) => void;
  onUpdateAnnotation: (ann: Annotation) => void;
  onDeleteAnnotation: (id: string) => void;
  selectedAnnotationId: string | null;
  onSelectAnnotation: (id: string | null) => void;
  // Defaults
  defaultTextColor: string;
  defaultFontSize: number;
  defaultDrawColor: string;
  defaultDrawWidth: number;
  defaultHighlightColor: string;
  defaultHighlightOpacity: number;
  defaultShapeStroke: string;
  defaultShapeFill: string;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  arrayBuffer,
  currentPage,
  currentPageIndex,
  zoom,
  activeTool,
  activeShape,
  annotations,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  selectedAnnotationId,
  onSelectAnnotation,
  defaultTextColor,
  defaultFontSize,
  defaultDrawColor,
  defaultDrawWidth,
  defaultHighlightColor,
  defaultHighlightOpacity,
  defaultShapeStroke,
  defaultShapeFill,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);

  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [pageSize, setPageSize] = useState<{ width: number; height: number }>({ width: 595, height: 842 });
  const [isRendering, setIsRendering] = useState(false);

  // Measure container width for responsive auto-fitting
  useEffect(() => {
    if (!wrapperRef.current) return;
    const updateWidth = () => {
      if (wrapperRef.current) {
        setContainerWidth(wrapperRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Compute responsive auto-fit scale
  const availableWidth = containerWidth > 0 
    ? Math.max(240, containerWidth - (containerWidth < 640 ? 16 : 48)) 
    : pageSize.width;
  const fitScale = Math.min(1.0, availableWidth / pageSize.width);
  const currentScale = fitScale * zoom;

  const displayWidth = pageSize.width * currentScale;
  const displayHeight = pageSize.height * currentScale;

  // Interaction state
  const isInteractingRef = useRef(false);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Moving annotation state
  const [draggingAnnId, setDraggingAnnId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Resizing annotation state
  const [resizingAnnId, setResizingAnnId] = useState<string | null>(null);
  const resizeInitialRef = useRef<{ width: number; height: number; x: number; y: number; startX: number; startY: number }>({
    width: 0, height: 0, x: 0, y: 0, startX: 0, startY: 0
  });

  // Render the PDF page to base canvas
  useEffect(() => {
    let isCancelled = false;

    const render = async () => {
      if (!arrayBuffer || !pdfCanvasRef.current) return;
      try {
        setIsRendering(true);
        const pdfDoc = await loadPdfDocument(arrayBuffer);
        if (isCancelled) return;

        // Render with baseline * currentScale for sharp retina output
        const scale = 1.5 * currentScale;
        const dims = await renderPageToCanvas(
          pdfDoc,
          currentPageIndex + 1,
          pdfCanvasRef.current,
          { scale, rotation: currentPage.rotation }
        );

        if (!isCancelled) {
          setPageSize({
            width: dims.width / (1.5 * currentScale),
            height: dims.height / (1.5 * currentScale),
          });
        }
      } catch (err) {
        console.error('Error rendering page to canvas:', err);
      } finally {
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    };

    render();

    return () => {
      isCancelled = true;
    };
  }, [arrayBuffer, currentPageIndex, currentPage.rotation, currentScale]);

  // Page annotations
  const pageAnnotations = annotations.filter(a => a.pageIndex === currentPageIndex);

  // Helper: client coords to percentage coords (0 - 100), supports Touch and Mouse
  const getNormalizedCoords = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      }
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  };

  // Mouse / Touch Down handler on canvas overlay
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool === 'select' || activeTool === 'erase') return;

    const coords = getNormalizedCoords(e);
    isInteractingRef.current = true;
    startPosRef.current = coords;

    if (activeTool === 'draw') {
      currentPathRef.current = [coords];
      const ctx = drawCanvasRef.current?.getContext('2d');
      if (ctx && containerRef.current) {
        ctx.beginPath();
        const rect = containerRef.current.getBoundingClientRect();
        ctx.moveTo((coords.x / 100) * rect.width, (coords.y / 100) * rect.height);
      }
    } else if (activeTool === 'text') {
      // Place a new text annotation immediately!
      const newText: TextAnnotation = {
        id: `text-${Date.now()}`,
        pageIndex: currentPageIndex,
        type: 'text',
        x: coords.x,
        y: coords.y,
        width: 30,
        height: 8,
        text: 'Type text here',
        fontSize: defaultFontSize,
        fontFamily: 'sans-serif',
        color: defaultTextColor,
        bold: false,
        italic: false,
        align: 'left',
      };
      onAddAnnotation(newText);
      onSelectAnnotation(newText.id);
      isInteractingRef.current = false;
    }
  };

  // Mouse / Touch Move handler
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    // If moving an existing annotation
    if (draggingAnnId && containerRef.current) {
      const coords = getNormalizedCoords(e);
      const ann = annotations.find(a => a.id === draggingAnnId);
      if (ann && 'x' in ann && 'y' in ann) {
        const newX = Math.max(0, Math.min(100 - (ann.width || 5), coords.x - dragOffsetRef.current.x));
        const newY = Math.max(0, Math.min(100 - (ann.height || 5), coords.y - dragOffsetRef.current.y));
        onUpdateAnnotation({ ...ann, x: newX, y: newY } as Annotation);
      }
      return;
    }

    // If resizing an existing annotation
    if (resizingAnnId && containerRef.current) {
      const coords = getNormalizedCoords(e);
      const ann = annotations.find(a => a.id === resizingAnnId);
      if (ann && 'width' in ann && 'height' in ann) {
        const deltaX = coords.x - resizeInitialRef.current.startX;
        const deltaY = coords.y - resizeInitialRef.current.startY;
        const newWidth = Math.max(5, Math.min(100 - ann.x, resizeInitialRef.current.width + deltaX));
        const newHeight = Math.max(3, Math.min(100 - ann.y, resizeInitialRef.current.height + deltaY));
        onUpdateAnnotation({ ...ann, width: newWidth, height: newHeight } as Annotation);
      }
      return;
    }

    if (!isInteractingRef.current) return;
    const coords = getNormalizedCoords(e);

    if (activeTool === 'draw') {
      currentPathRef.current.push(coords);
      const ctx = drawCanvasRef.current?.getContext('2d');
      if (ctx && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        ctx.strokeStyle = defaultDrawColor;
        ctx.lineWidth = defaultDrawWidth * (currentScale / 1.0);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineTo((coords.x / 100) * rect.width, (coords.y / 100) * rect.height);
        ctx.stroke();
      }
    } else if (activeTool === 'highlight' || activeTool === 'shape') {
      const x = Math.min(startPosRef.current.x, coords.x);
      const y = Math.min(startPosRef.current.y, coords.y);
      const width = Math.abs(coords.x - startPosRef.current.x);
      const height = Math.abs(coords.y - startPosRef.current.y);
      setDragPreview({ x, y, width, height });
    }
  };

  // Mouse / Touch Up handler
  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    // End dragging or resizing
    if (draggingAnnId) {
      setDraggingAnnId(null);
      return;
    }
    if (resizingAnnId) {
      setResizingAnnId(null);
      return;
    }

    if (!isInteractingRef.current) return;
    isInteractingRef.current = false;
    const coords = getNormalizedCoords(e);

    if (activeTool === 'draw') {
      if (currentPathRef.current.length > 1) {
        const newDrawing: DrawingAnnotation = {
          id: `draw-${Date.now()}`,
          pageIndex: currentPageIndex,
          type: 'drawing',
          points: [...currentPathRef.current],
          color: defaultDrawColor,
          strokeWidth: defaultDrawWidth,
          opacity: 1,
        };
        onAddAnnotation(newDrawing);
      }
      currentPathRef.current = [];
      const ctx = drawCanvasRef.current?.getContext('2d');
      if (ctx && drawCanvasRef.current) {
        ctx.clearRect(0, 0, drawCanvasRef.current.width, drawCanvasRef.current.height);
      }
    } else if (activeTool === 'highlight') {
      const x = Math.min(startPosRef.current.x, coords.x);
      const y = Math.min(startPosRef.current.y, coords.y);
      const width = Math.max(2, Math.abs(coords.x - startPosRef.current.x));
      const height = Math.max(2, Math.abs(coords.y - startPosRef.current.y));

      const newHighlight: HighlightAnnotation = {
        id: `highlight-${Date.now()}`,
        pageIndex: currentPageIndex,
        type: 'highlight',
        x,
        y,
        width,
        height,
        color: defaultHighlightColor,
        opacity: defaultHighlightOpacity,
      };
      onAddAnnotation(newHighlight);
      setDragPreview(null);
    } else if (activeTool === 'shape') {
      const x = Math.min(startPosRef.current.x, coords.x);
      const y = Math.min(startPosRef.current.y, coords.y);
      const width = Math.max(4, Math.abs(coords.x - startPosRef.current.x));
      const height = Math.max(4, Math.abs(coords.y - startPosRef.current.y));

      const newShape: ShapeAnnotation = {
        id: `shape-${Date.now()}`,
        pageIndex: currentPageIndex,
        type: 'shape',
        shapeType: activeShape,
        x,
        y,
        width,
        height,
        strokeColor: defaultShapeStroke,
        fillColor: defaultShapeFill,
        strokeWidth: 2,
      };
      onAddAnnotation(newShape);
      setDragPreview(null);
    }
  };

  // Start dragging an annotation
  const startDragAnnotation = (e: React.MouseEvent | React.TouchEvent, ann: Annotation) => {
    e.stopPropagation();
    if (activeTool === 'erase') {
      onDeleteAnnotation(ann.id);
      return;
    }
    onSelectAnnotation(ann.id);
    if ('x' in ann && 'y' in ann) {
      const coords = getNormalizedCoords(e);
      dragOffsetRef.current = {
        x: coords.x - ann.x,
        y: coords.y - ann.y,
      };
      setDraggingAnnId(ann.id);
    }
  };

  // Start resizing an annotation
  const startResizeAnnotation = (e: React.MouseEvent | React.TouchEvent, ann: Annotation) => {
    e.stopPropagation();
    if ('width' in ann && 'height' in ann && 'x' in ann && 'y' in ann) {
      const coords = getNormalizedCoords(e);
      resizeInitialRef.current = {
        width: ann.width,
        height: ann.height,
        x: ann.x,
        y: ann.y,
        startX: coords.x,
        startY: coords.y,
      };
      setResizingAnnId(ann.id);
    }
  };

  return (
    <div 
      ref={wrapperRef}
      className="flex-1 overflow-auto bg-slate-200/60 p-2 sm:p-4 md:p-8 flex items-center justify-center min-h-0 select-none w-full"
    >
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
        }}
        className={`relative bg-white shadow-2xl rounded-sm transition-all duration-75 overflow-hidden shrink-0 ${
          activeTool === 'draw' || activeTool === 'highlight' ? 'touch-none cursor-crosshair' : 'touch-manipulation'
        } ${activeTool === 'text' ? 'cursor-text' : ''} ${activeTool === 'erase' ? 'cursor-not-allowed' : ''}`}
      >
        {/* Base PDF.js Canvas */}
        <canvas
          ref={pdfCanvasRef}
          style={{ width: `${displayWidth}px`, height: `${displayHeight}px` }}
          className="block absolute inset-0 pointer-events-none"
        />

        {/* Live Freehand In-Progress Canvas */}
        <canvas
          ref={drawCanvasRef}
          width={displayWidth}
          height={displayHeight}
          className="absolute inset-0 pointer-events-none z-10"
        />

        {/* Drag Preview for Highlight / Shapes */}
        {dragPreview && (
          <div
            className="absolute z-20 pointer-events-none border-2 border-indigo-500 bg-indigo-500/20"
            style={{
              left: `${dragPreview.x}%`,
              top: `${dragPreview.y}%`,
              width: `${dragPreview.width}%`,
              height: `${dragPreview.height}%`,
            }}
          />
        )}

        {/* Render Saved Annotations for this page */}
        {pageAnnotations.map((ann) => {
          const isSelected = ann.id === selectedAnnotationId;

          // Drawing points rendered as SVG
          if (ann.type === 'drawing') {
            const drawAnn = ann as DrawingAnnotation;
            const pointsSvg = drawAnn.points
              .map(p => `${(p.x / 100) * displayWidth},${(p.y / 100) * displayHeight}`)
              .join(' ');

            return (
              <svg
                key={ann.id}
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
              >
                <polyline
                  points={pointsSvg}
                  fill="none"
                  stroke={drawAnn.color}
                  strokeWidth={drawAnn.strokeWidth * (zoom / 1.5)}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={drawAnn.opacity || 1}
                />
              </svg>
            );
          }

          // Highlights
          if (ann.type === 'highlight') {
            const h = ann as HighlightAnnotation;
            return (
              <div
                key={ann.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeTool === 'erase') onDeleteAnnotation(ann.id);
                  else onSelectAnnotation(ann.id);
                }}
                className={`absolute z-10 transition-shadow ${
                  isSelected ? 'ring-2 ring-indigo-600' : ''
                } ${activeTool === 'erase' ? 'hover:opacity-50 cursor-pointer' : 'cursor-pointer'}`}
                style={{
                  left: `${h.x}%`,
                  top: `${h.y}%`,
                  width: `${h.width}%`,
                  height: `${h.height}%`,
                  backgroundColor: h.color,
                  opacity: h.opacity,
                  mixBlendMode: 'multiply',
                }}
              />
            );
          }

          // Text Annotations
          if (ann.type === 'text') {
            const t = ann as TextAnnotation;
            return (
              <div
                key={ann.id}
                onMouseDown={(e) => startDragAnnotation(e, ann)}
                onTouchStart={(e) => startDragAnnotation(e, ann)}
                className={`absolute z-20 group p-1 rounded transition-all ${
                  isSelected
                    ? 'ring-2 ring-indigo-600 bg-white/40 shadow-sm'
                    : 'hover:ring-1 hover:ring-slate-400'
                } cursor-move`}
                style={{
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  width: `${t.width}%`,
                  minHeight: `${t.height}%`,
                }}
              >
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    onUpdateAnnotation({ ...t, text: e.currentTarget.innerText });
                  }}
                  className="w-full h-full outline-hidden whitespace-pre-wrap select-text leading-tight"
                  style={{
                    fontSize: `${(t.fontSize || 16) * zoom}px`,
                    color: t.color,
                    fontWeight: t.bold ? 'bold' : 'normal',
                    fontStyle: t.italic ? 'italic' : 'normal',
                    textAlign: t.align || 'left',
                    fontFamily: t.fontFamily || 'sans-serif',
                  }}
                >
                  {t.text}
                </div>

                {/* Resize handle */}
                {isSelected && (
                  <div
                    onMouseDown={(e) => startResizeAnnotation(e, ann)}
                    onTouchStart={(e) => startResizeAnnotation(e, ann)}
                    className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-indigo-600 rounded-full cursor-se-resize border border-white shadow-xs"
                  />
                )}
              </div>
            );
          }

          // Shapes
          if (ann.type === 'shape') {
            const s = ann as ShapeAnnotation;
            return (
              <div
                key={ann.id}
                onMouseDown={(e) => startDragAnnotation(e, ann)}
                onTouchStart={(e) => startDragAnnotation(e, ann)}
                className={`absolute z-20 group transition-all cursor-move ${
                  isSelected ? 'ring-2 ring-indigo-600' : 'hover:ring-1 hover:ring-slate-300'
                }`}
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: `${s.width}%`,
                  height: `${s.height}%`,
                }}
              >
                {s.shapeType === 'rectangle' && (
                  <div
                    className="w-full h-full"
                    style={{
                      border: `${s.strokeWidth}px solid ${s.strokeColor}`,
                      backgroundColor: s.fillColor || 'transparent',
                    }}
                  />
                )}
                {s.shapeType === 'circle' && (
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      border: `${s.strokeWidth}px solid ${s.strokeColor}`,
                      backgroundColor: s.fillColor || 'transparent',
                    }}
                  />
                )}
                {(s.shapeType === 'line' || s.shapeType === 'arrow') && (
                  <svg className="w-full h-full overflow-visible">
                    <line
                      x1="0"
                      y1="0"
                      x2="100%"
                      y2="100%"
                      stroke={s.strokeColor}
                      strokeWidth={s.strokeWidth}
                    />
                  </svg>
                )}
                {isSelected && (
                  <div
                    onMouseDown={(e) => startResizeAnnotation(e, ann)}
                    onTouchStart={(e) => startResizeAnnotation(e, ann)}
                    className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-indigo-600 rounded-full cursor-se-resize border border-white"
                  />
                )}
              </div>
            );
          }

          // Image & Signature
          if (ann.type === 'image' || ann.type === 'signature') {
            const img = ann as (ImageAnnotation | SignatureAnnotation);
            return (
              <div
                key={ann.id}
                onMouseDown={(e) => startDragAnnotation(e, ann)}
                onTouchStart={(e) => startDragAnnotation(e, ann)}
                className={`absolute z-20 group p-1 transition-all cursor-move ${
                  isSelected ? 'ring-2 ring-indigo-600 shadow-md' : 'hover:ring-1 hover:ring-indigo-300'
                }`}
                style={{
                  left: `${img.x}%`,
                  top: `${img.y}%`,
                  width: `${img.width}%`,
                  height: `${img.height}%`,
                }}
              >
                <img
                  src={img.dataUrl}
                  alt={ann.type}
                  className="w-full h-full object-contain pointer-events-none select-none"
                />

                {isSelected && (
                  <div
                    onMouseDown={(e) => startResizeAnnotation(e, ann)}
                    onTouchStart={(e) => startResizeAnnotation(e, ann)}
                    className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-indigo-600 rounded-full cursor-se-resize border-2 border-white shadow-xs"
                  />
                )}
              </div>
            );
          }

          // Watermark
          if (ann.type === 'watermark') {
            const wm = ann as WatermarkAnnotation;
            return (
              <div
                key={ann.id}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-15 overflow-hidden"
              >
                <div
                  className="font-extrabold tracking-widest select-none uppercase"
                  style={{
                    fontSize: `${(wm.fontSize || 36) * zoom}px`,
                    color: wm.color,
                    opacity: wm.opacity,
                    transform: `rotate(${wm.rotation || 45}deg)`,
                  }}
                >
                  {wm.text}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
