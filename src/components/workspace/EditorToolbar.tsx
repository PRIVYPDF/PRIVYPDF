import React, { useRef } from 'react';
import { 
  MousePointer, 
  Type, 
  PenTool, 
  Highlighter, 
  Square, 
  Circle, 
  Minus, 
  MoveRight, 
  Image as ImageIcon, 
  Signature as SignatureIcon, 
  Stamp, 
  Eraser, 
  RotateCw, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  ChevronDown
} from 'lucide-react';
import { ToolMode, ShapeType } from '../../types';

interface EditorToolbarProps {
  activeTool: ToolMode;
  onSelectTool: (tool: ToolMode) => void;
  activeShape: ShapeType;
  onSelectShape: (shape: ShapeType) => void;
  onOpenSignatureModal: () => void;
  onOpenWatermarkModal: () => void;
  onUploadImage: (dataUrl: string) => void;
  onRotateCurrentPage: () => void;
  onDeleteCurrentPage: () => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  canDelete: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  activeTool,
  onSelectTool,
  activeShape,
  onSelectShape,
  onOpenSignatureModal,
  onOpenWatermarkModal,
  onUploadImage,
  onRotateCurrentPage,
  onDeleteCurrentPage,
  zoom,
  onZoomChange,
  canDelete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shapesOpen, setShapesOpen] = React.useState(false);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploadImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getShapeIcon = (type: ShapeType) => {
    switch (type) {
      case 'rectangle': return Square;
      case 'circle': return Circle;
      case 'line': return Minus;
      case 'arrow': return MoveRight;
    }
  };

  const CurrentShapeIcon = getShapeIcon(activeShape);

  return (
    <div className="bg-white border-b border-slate-200/90 px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-2 shadow-2xs z-30 w-full overflow-hidden">
      {/* Hidden file input for image insertion */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleImageFile}
        className="hidden"
      />

      {/* Main Annotation Tools - Scrollable on mobile without showing scrollbar */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0">
        {/* Select */}
        <button
          type="button"
          onClick={() => onSelectTool('select')}
          className={`shrink-0 flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[36px] ${
            activeTool === 'select'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Select & Move Annotations (V)"
        >
          <MousePointer className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Select</span>
        </button>

        <div className="h-5 w-px bg-slate-200 mx-0.5 shrink-0"></div>

        {/* Text */}
        <button
          type="button"
          onClick={() => onSelectTool('text')}
          className={`shrink-0 flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[36px] ${
            activeTool === 'text'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Add Text Note (T)"
        >
          <Type className="w-4 h-4 shrink-0" />
          <span className="hidden xs:inline">Text</span>
        </button>

        {/* Draw (Pen) */}
        <button
          type="button"
          onClick={() => onSelectTool('draw')}
          className={`shrink-0 flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[36px] ${
            activeTool === 'draw'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Freehand Drawing Pen (D)"
        >
          <PenTool className="w-4 h-4 shrink-0" />
          <span className="hidden xs:inline">Draw</span>
        </button>

        {/* Highlight */}
        <button
          type="button"
          onClick={() => onSelectTool('highlight')}
          className={`shrink-0 flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[36px] ${
            activeTool === 'highlight'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Highlight Area (H)"
        >
          <Highlighter className="w-4 h-4 shrink-0" />
          <span className="hidden md:inline">Highlight</span>
        </button>

        {/* Shapes Menu */}
        <div className="relative shrink-0">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => {
                onSelectTool('shape');
              }}
              className={`flex items-center gap-1 pl-2.5 sm:pl-3 pr-1 py-1.5 rounded-l-xl text-xs font-semibold transition-all min-h-[36px] ${
                activeTool === 'shape'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Add Geometric Shape (S)"
            >
              <CurrentShapeIcon className="w-4 h-4 shrink-0" />
              <span className="capitalize hidden sm:inline">{activeShape}</span>
            </button>
            <button
              type="button"
              onClick={() => setShapesOpen(!shapesOpen)}
              className={`px-1 py-1.5 rounded-r-xl border-l text-xs transition-all min-h-[36px] ${
                activeTool === 'shape'
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {shapesOpen && (
            <div className="absolute top-full left-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40">
              {[
                { type: 'rectangle' as ShapeType, label: 'Rectangle', icon: Square },
                { type: 'circle' as ShapeType, label: 'Circle', icon: Circle },
                { type: 'line' as ShapeType, label: 'Line', icon: Minus },
                { type: 'arrow' as ShapeType, label: 'Arrow', icon: MoveRight },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.type}
                    type="button"
                    onClick={() => {
                      onSelectShape(s.type);
                      onSelectTool('shape');
                      setShapesOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-slate-50 min-h-[36px] ${
                      activeShape === s.type ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Image */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all min-h-[36px]"
          title="Upload & Place Local Image"
        >
          <ImageIcon className="w-4 h-4 text-slate-600 shrink-0" />
          <span className="hidden sm:inline">Image</span>
        </button>

        {/* Signature */}
        <button
          type="button"
          onClick={onOpenSignatureModal}
          className="shrink-0 flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all border border-indigo-200/60 min-h-[36px]"
          title="Draw or Insert Signature"
        >
          <SignatureIcon className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="hidden sm:inline">Sign</span>
        </button>

        {/* Watermark */}
        <button
          type="button"
          onClick={onOpenWatermarkModal}
          className="shrink-0 flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all min-h-[36px]"
          title="Stamp Watermark"
        >
          <Stamp className="w-4 h-4 text-slate-600 shrink-0" />
          <span className="hidden md:inline">Watermark</span>
        </button>

        {/* Eraser */}
        <button
          type="button"
          onClick={() => onSelectTool('erase')}
          className={`shrink-0 flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[36px] ${
            activeTool === 'erase'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Eraser (E)"
        >
          <Eraser className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Eraser</span>
        </button>
      </div>

      {/* Page Operations & Zoom Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-1">
        {/* Rotate current page */}
        <button
          type="button"
          onClick={onRotateCurrentPage}
          className="min-w-[34px] min-h-[34px] flex items-center justify-center rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
          title="Rotate Current Page 90°"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Delete current page */}
        {canDelete && (
          <button
            type="button"
            onClick={onDeleteCurrentPage}
            className="min-w-[34px] min-h-[34px] flex items-center justify-center rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Current Page"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <div className="h-5 w-px bg-slate-200 shrink-0"></div>

        {/* Zoom controls */}
        <div className="flex items-center bg-slate-100/90 rounded-xl p-0.5 border border-slate-200/80">
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(0.4, zoom - 0.15))}
            className="min-w-[28px] min-h-[28px] sm:min-w-[30px] sm:min-h-[30px] flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onZoomChange(1.0)}
            className="hidden xs:inline-block px-1.5 sm:px-2 text-[11px] sm:text-xs font-mono font-semibold text-slate-700 hover:text-indigo-600"
            title="Reset Zoom (100%)"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={() => onZoomChange(Math.min(2.5, zoom + 0.15))}
            className="min-w-[28px] min-h-[28px] sm:min-w-[30px] sm:min-h-[30px] flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
