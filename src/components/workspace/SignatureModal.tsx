import React, { useRef, useState, useEffect } from 'react';
import { X, Check, Trash2, PenTool, Upload, RefreshCw } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSignature: (dataUrl: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSaveSignature,
}) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'upload'>('draw');
  const [penColor, setPenColor] = useState<string>('#0f172a');
  const [penWidth, setPenWidth] = useState<number>(3);
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    if (isOpen && activeTab === 'draw') {
      setTimeout(() => {
        initCanvas();
      }, 50);
    }
  }, [isOpen, activeTab]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    setHasDrawn(false);
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      const dataUrl = canvas.toDataURL('image/png');
      onSaveSignature(dataUrl);
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSaveSignature(reader.result);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Add Signature</h3>
              <p className="text-xs text-slate-500">Draw or upload your signature</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-4 sm:px-6 pt-2 gap-4 sm:gap-6 text-sm font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('draw')}
            className={`pb-2.5 border-b-2 flex items-center gap-2 transition-colors min-h-[40px] ${
              activeTab === 'draw'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Draw Signature</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 border-b-2 flex items-center gap-2 transition-colors min-h-[40px] ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'draw' ? (
            <div className="space-y-3 sm:space-y-4">
              {/* Controls bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Ink:</span>
                  {[
                    { color: '#0f172a', name: 'Black' },
                    { color: '#1e3a8a', name: 'Blue' },
                    { color: '#991b1b', name: 'Crimson' },
                  ].map(c => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setPenColor(c.color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        penColor === c.color ? 'border-indigo-600 scale-110 shadow-xs' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-medium">Thickness:</span>
                  {[2, 3, 5].map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setPenWidth(w)}
                      className={`px-2 py-1 text-xs rounded-lg border min-w-[28px] ${
                        penWidth === w ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-700' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {w}px
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 text-xs flex items-center gap-1 ml-1"
                    title="Clear signature"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Drawing Box */}
              <div className="relative border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 overflow-hidden h-44 sm:h-52">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full cursor-crosshair touch-none"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 text-xs sm:text-sm p-4 text-center">
                    <span>Sign your name here</span>
                    <span className="text-[11px] text-slate-300 mt-1">Use your finger, trackpad, mouse or stylus</span>
                  </div>
                )}
                {/* Baseline guide */}
                <div className="absolute left-6 right-6 bottom-10 border-b border-slate-200 pointer-events-none"></div>
              </div>
            </div>
          ) : (
            <div className="py-6 sm:py-8">
              <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/60 hover:bg-indigo-50/30 transition-all text-center">
                <Upload className="w-8 h-8 text-indigo-500 mb-2" />
                <span className="text-sm font-semibold text-slate-800">Upload signature file</span>
                <span className="text-xs text-slate-500 mt-1">PNG with transparent background recommended</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 text-center"
          >
            Cancel
          </button>
          {activeTab === 'draw' && (
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasDrawn}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all min-h-[40px]"
            >
              <Check className="w-4 h-4" />
              <span>Insert Signature</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
