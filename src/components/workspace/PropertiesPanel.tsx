import React from 'react';
import { 
  ToolMode, 
  Annotation, 
  TextAnnotation, 
  DrawingAnnotation, 
  HighlightAnnotation, 
  ShapeAnnotation, 
  ShapeType 
} from '../../types';
import { 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Trash2, 
  Sliders, 
  Type, 
  Palette,
  Square,
  Highlighter,
  X
} from 'lucide-react';

interface PropertiesPanelProps {
  activeTool: ToolMode;
  selectedAnnotation: Annotation | null;
  onUpdateAnnotation: (updated: Annotation) => void;
  onDeleteAnnotation: (id: string) => void;
  // Default values for active tools
  defaultTextColor: string;
  setDefaultTextColor: (c: string) => void;
  defaultFontSize: number;
  setDefaultFontSize: (s: number) => void;
  defaultDrawColor: string;
  setDefaultDrawColor: (c: string) => void;
  defaultDrawWidth: number;
  setDefaultDrawWidth: (w: number) => void;
  defaultHighlightColor: string;
  setDefaultHighlightColor: (c: string) => void;
  defaultHighlightOpacity: number;
  setDefaultHighlightOpacity: (o: number) => void;
  defaultShapeStroke: string;
  setDefaultShapeStroke: (c: string) => void;
  defaultShapeFill: string;
  setDefaultShapeFill: (c: string) => void;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  activeTool,
  selectedAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  defaultTextColor,
  setDefaultTextColor,
  defaultFontSize,
  setDefaultFontSize,
  defaultDrawColor,
  setDefaultDrawColor,
  defaultDrawWidth,
  setDefaultDrawWidth,
  defaultHighlightColor,
  setDefaultHighlightColor,
  defaultHighlightOpacity,
  setDefaultHighlightOpacity,
  defaultShapeStroke,
  setDefaultShapeStroke,
  defaultShapeFill,
  setDefaultShapeFill,
  isOpenOnMobile = false,
  onCloseMobile,
}) => {
  const COLOR_PALETTE = [
    '#0f172a', // Slate 900
    '#dc2626', // Red 600
    '#2563eb', // Blue 600
    '#16a34a', // Green 600
    '#d97706', // Amber 600
    '#7c3aed', // Purple 600
    '#ffffff', // White
  ];

  const HIGHLIGHT_PALETTE = [
    '#fef08a', // Yellow
    '#bbf7d0', // Mint Green
    '#bae6fd', // Sky Blue
    '#fed7aa', // Peach
    '#fbcfe8', // Pink
  ];

  const panelContent = (
    <>
      <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white/70">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Properties & Style</span>
        </div>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
            title="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-5 flex-1 overflow-y-auto">
        {/* Selected Annotation Actions */}
        {selectedAnnotation && (
          <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                Selected: {selectedAnnotation.type}
              </span>
              <button
                type="button"
                onClick={() => onDeleteAnnotation(selectedAnnotation.id)}
                className="p-1 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors"
                title="Delete this element"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Properties for Selected Text */}
            {selectedAnnotation.type === 'text' && (
              <div className="space-y-3">
                {(() => {
                  const txt = selectedAnnotation as TextAnnotation;
                  return (
                    <>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Text Color</label>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {COLOR_PALETTE.map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => onUpdateAnnotation({ ...txt, color: c })}
                              className={`w-5 h-5 rounded-full border transition-all ${
                                txt.color === c ? 'ring-2 ring-indigo-600 scale-110' : 'border-slate-300'
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                          <input
                            type="color"
                            value={txt.color}
                            onChange={(e) => onUpdateAnnotation({ ...txt, color: e.target.value })}
                            className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500">Size: {txt.fontSize}px</span>
                        <input
                          type="range"
                          min="10"
                          max="48"
                          value={txt.fontSize}
                          onChange={(e) => onUpdateAnnotation({ ...txt, fontSize: Number(e.target.value) })}
                          className="w-28 accent-indigo-600"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onUpdateAnnotation({ ...txt, bold: !txt.bold })}
                          className={`p-1.5 rounded-lg border text-xs font-semibold ${
                            txt.bold ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateAnnotation({ ...txt, italic: !txt.italic })}
                          className={`p-1.5 rounded-lg border text-xs font-semibold ${
                            txt.italic ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <div className="h-4 w-px bg-slate-200 mx-1"></div>
                        {(['left', 'center', 'right'] as const).map(align => (
                          <button
                            key={align}
                            type="button"
                            onClick={() => onUpdateAnnotation({ ...txt, align })}
                            className={`p-1.5 rounded-lg border ${
                              txt.align === align ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                            {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                            {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Properties for Selected Shape */}
            {selectedAnnotation.type === 'shape' && (
              <div className="space-y-3">
                {(() => {
                  const shape = selectedAnnotation as ShapeAnnotation;
                  return (
                    <>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Stroke Color</label>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {COLOR_PALETTE.map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => onUpdateAnnotation({ ...shape, strokeColor: c })}
                              className={`w-5 h-5 rounded-full border transition-all ${
                                shape.strokeColor === c ? 'ring-2 ring-indigo-600 scale-110' : 'border-slate-300'
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500">Thickness: {shape.strokeWidth}px</span>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={shape.strokeWidth}
                          onChange={(e) => onUpdateAnnotation({ ...shape, strokeWidth: Number(e.target.value) })}
                          className="w-24 accent-indigo-600"
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Global Active Tool Defaults */}
        {activeTool === 'text' && (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Type className="w-4 h-4 text-indigo-600" />
              <span>Default Text Settings</span>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Color</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {COLOR_PALETTE.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setDefaultTextColor(c)}
                    className={`w-6 h-6 rounded-full border transition-all ${
                      defaultTextColor === c ? 'ring-2 ring-indigo-600 scale-110' : 'border-slate-300'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Font Size</span>
                <span>{defaultFontSize}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="48"
                value={defaultFontSize}
                onChange={(e) => setDefaultFontSize(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <p className="text-[11px] text-slate-400">Click anywhere on the document page to place a new text box.</p>
          </div>
        )}

        {activeTool === 'draw' && (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Palette className="w-4 h-4 text-indigo-600" />
              <span>Pen Settings</span>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Ink Color</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {COLOR_PALETTE.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setDefaultDrawColor(c)}
                    className={`w-6 h-6 rounded-full border transition-all ${
                      defaultDrawColor === c ? 'ring-2 ring-indigo-600 scale-110' : 'border-slate-300'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Pen Thickness</span>
                <span>{defaultDrawWidth}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={defaultDrawWidth}
                onChange={(e) => setDefaultDrawWidth(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <p className="text-[11px] text-slate-400">Freehand draw directly across the page canvas.</p>
          </div>
        )}

        {activeTool === 'highlight' && (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Highlighter className="w-4 h-4 text-amber-500" />
              <span>Highlighter Settings</span>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Highlight Color</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {HIGHLIGHT_PALETTE.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setDefaultHighlightColor(c)}
                    className={`w-6 h-6 rounded-full border transition-all ${
                      defaultHighlightColor === c ? 'ring-2 ring-indigo-600 scale-110' : 'border-slate-300'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Opacity</span>
                <span>{Math.round(defaultHighlightOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.6"
                step="0.05"
                value={defaultHighlightOpacity}
                onChange={(e) => setDefaultHighlightOpacity(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <p className="text-[11px] text-slate-400">Click and drag over paragraphs to highlight them.</p>
          </div>
        )}

        {activeTool === 'shape' && (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Square className="w-4 h-4 text-indigo-600" />
              <span>Shape Settings</span>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Border Color</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {COLOR_PALETTE.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setDefaultShapeStroke(c)}
                    className={`w-6 h-6 rounded-full border transition-all ${
                      defaultShapeStroke === c ? 'ring-2 ring-indigo-600 scale-110' : 'border-slate-300'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-400">Click and drag to draw shapes across the document.</p>
          </div>
        )}

        {activeTool === 'select' && !selectedAnnotation && (
          <div className="text-center py-8 text-slate-400 space-y-2">
            <Sliders className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-medium">Select an item on the page to adjust its formatting, color, or position.</p>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-50/80 border-l border-slate-200/90 flex-col h-full shrink-0 select-none overflow-y-auto">
        {panelContent}
      </aside>

      {/* Mobile/Tablet Slide-over Drawer */}
      {isOpenOnMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={onCloseMobile}
          />
          {/* Drawer Panel */}
          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
            {panelContent}
          </div>
        </div>
      )}
    </>
  );
};
