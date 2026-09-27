import React, { useState } from 'react';
import { X, Stamp, Check } from 'lucide-react';
import { WatermarkAnnotation } from '../../types';

interface WatermarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyWatermark: (watermark: Omit<WatermarkAnnotation, 'id' | 'pageIndex' | 'type'>, applyToAll: boolean) => void;
}

export const WatermarkModal: React.FC<WatermarkModalProps> = ({
  isOpen,
  onClose,
  onApplyWatermark,
}) => {
  const [text, setText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(42);
  const [opacity, setOpacity] = useState(0.25);
  const [rotation, setRotation] = useState(45);
  const [color, setColor] = useState('#ef4444');
  const [position, setPosition] = useState<'diagonal' | 'center' | 'top' | 'bottom'>('diagonal');
  const [applyToAll, setApplyToAll] = useState(true);

  if (!isOpen) return null;

  const presets = ['CONFIDENTIAL', 'DRAFT', 'DO NOT COPY', 'SAMPLE', 'APPROVED', 'ORIGINAL'];

  const handleApply = () => {
    onApplyWatermark(
      {
        text,
        fontSize,
        opacity,
        rotation,
        color,
        position,
      },
      applyToAll
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Stamp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Add Watermark</h3>
              <p className="text-xs text-slate-500">Stamp customized text across pages</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Text Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Watermark Text
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-800"
              placeholder="e.g. CONFIDENTIAL"
            />
          </div>

          {/* Quick presets */}
          <div>
            <span className="block text-xs text-slate-400 font-medium mb-1.5">Quick Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setText(p)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                    text === p
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Box */}
          <div className="relative h-24 sm:h-28 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
            <span className="text-xs text-slate-300 select-none">Live Watermark Preview</span>
            <div
              className="absolute font-extrabold tracking-wider select-none pointer-events-none text-center px-2"
              style={{
                fontSize: `${Math.min(fontSize * 0.6, 32)}px`,
                color,
                opacity,
                transform: `rotate(${rotation}deg)`,
              }}
            >
              {text || 'PREVIEW'}
            </div>
          </div>

          {/* Sliders: Size & Opacity */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <div className="flex justify-between text-xs text-slate-600 font-medium mb-1">
                <span>Font Size</span>
                <span>{fontSize}px</span>
              </div>
              <input
                type="range"
                min="18"
                max="80"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-600 font-medium mb-1">
                <span>Opacity</span>
                <span>{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          {/* Angle / Rotation */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Angle / Orientation</label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {[
                { label: '45°', full: 'Diagonal (45°)', val: 45 },
                { label: '0°', full: 'Horizontal (0°)', val: 0 },
                { label: '90°', full: 'Vertical (90°)', val: 90 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setRotation(opt.val)}
                  className={`py-1.5 text-xs rounded-xl border font-medium transition-all min-h-[36px] ${
                    rotation === opt.val
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="hidden sm:inline">{opt.full}</span>
                  <span className="sm:hidden">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Stamp Color</label>
            <div className="flex items-center gap-2.5 sm:gap-3">
              {[
                { hex: '#ef4444', name: 'Red' },
                { hex: '#64748b', name: 'Gray' },
                { hex: '#3b82f6', name: 'Blue' },
                { hex: '#10b981', name: 'Green' },
                { hex: '#0f172a', name: 'Dark' },
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    color === c.hex ? 'border-slate-900 scale-110 shadow-xs' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                title="Custom color"
              />
            </div>
          </div>

          {/* Target Pages */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-700">
              <input
                type="checkbox"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="font-medium">Apply watermark across all pages</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm min-h-[40px]"
          >
            <Check className="w-4 h-4" />
            <span>Apply Watermark</span>
          </button>
        </div>
      </div>
    </div>
  );
};
