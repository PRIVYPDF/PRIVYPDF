import React, { useState } from 'react';
import { Stamp, Download, CheckSquare, Square, Eye } from 'lucide-react';
import { DropZone } from '../components/common/DropZone';
import { loadPdfDocument, extractAllThumbnails } from '../services/pdf/pdfRenderer';
import { addWatermarkToPdf } from '../services/pdf/pdfModifier';
import { downloadFile, triggerConfetti } from '../utils/fileUtils';

export const WatermarkPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(0);

  // Watermark parameters
  const [text, setText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState('#ef4444');
  const [opacity, setOpacity] = useState(0.25);
  const [rotation, setRotation] = useState(45);
  const [position, setPosition] = useState<'diagonal' | 'center' | 'top' | 'bottom'>('diagonal');
  const [targetScope, setTargetScope] = useState<'all' | 'custom'>('all');
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isApplying, setIsApplying] = useState(false);

  const presets = ['CONFIDENTIAL', 'DRAFT', 'DO NOT COPY', 'SAMPLE', 'APPROVED', 'ORIGINAL', 'RESTRICTED'];

  const handleFileLoaded = async (loadedFile: File, loadedBuffer: ArrayBuffer) => {
    try {
      setFile(loadedFile);
      setBuffer(loadedBuffer);

      const pdfDoc = await loadPdfDocument(loadedBuffer);
      const count = pdfDoc.numPages;
      setPageCount(count);

      const thumbs = await extractAllThumbnails(loadedBuffer, 0.3);
      setThumbnails(thumbs);
      setSelectedPages(Array.from({ length: count }, (_, i) => i + 1));
    } catch (err) {
      console.error('Error loading PDF for watermark:', err);
    }
  };

  const togglePage = (pageNum: number) => {
    setSelectedPages(prev =>
      prev.includes(pageNum) ? prev.filter(p => p !== pageNum) : [...prev, pageNum].sort((a, b) => a - b)
    );
  };

  const handleApplyWatermark = async () => {
    if (!buffer) return;
    try {
      setIsApplying(true);
      const targetIndices = targetScope === 'all'
        ? undefined
        : selectedPages.map(p => p - 1);

      const watermarkedBytes = await addWatermarkToPdf(buffer, {
        text,
        fontSize,
        color,
        opacity,
        rotation,
        position,
        pageIndices: targetIndices,
      });

      const outName = `${file?.name.replace(/\.pdf$/i, '') || 'document'}-watermarked.pdf`;
      downloadFile(watermarkedBytes, outName);
      triggerConfetti();
    } catch (err) {
      console.error('Error adding watermark:', err);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <Stamp className="w-3.5 h-3.5" />
          <span>Local PDF Watermarker</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Watermark PDF Documents
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Stamp custom diagonal, header, or footer watermarks across your document pages without uploading.
        </p>
      </div>

      {!buffer ? (
        <DropZone
          onFileLoaded={handleFileLoaded}
          title="Drop your PDF here to watermark"
          subtitle="or click to browse your local device"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Controls Form (1 col) */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
              Watermark Customization
            </h3>

            {/* Text input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Watermark Text
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. CONFIDENTIAL"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-800"
              />
            </div>

            {/* Presets */}
            <div>
              <span className="block text-xs text-slate-400 font-medium mb-1.5">Quick Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setText(p)}
                    className={`px-2 py-0.5 text-xs rounded-lg border transition-all ${
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

            {/* Position */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Position</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'diagonal' as const, label: 'Diagonal' },
                  { id: 'center' as const, label: 'Center' },
                  { id: 'top' as const, label: 'Top Header' },
                  { id: 'bottom' as const, label: 'Bottom Footer' },
                ].map(pos => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => {
                      setPosition(pos.id);
                      if (pos.id === 'diagonal') setRotation(45);
                      else if (pos.id === 'top' || pos.id === 'bottom' || pos.id === 'center') setRotation(0);
                    }}
                    className={`py-1.5 text-xs rounded-xl border font-bold capitalize transition-all ${
                      position === pos.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Font Size</span>
                  <span>{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="90"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
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

            {/* Color */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Color</label>
              <div className="flex items-center gap-2">
                {['#ef4444', '#64748b', '#2563eb', '#16a34a', '#0f172a'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 ${
                      color === c ? 'border-slate-900 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                />
              </div>
            </div>

            {/* Target Scope */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pages to Stamp</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setTargetScope('all')}
                  className={`py-1.5 rounded-xl border font-bold ${
                    targetScope === 'all'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  All Pages ({pageCount})
                </button>
                <button
                  type="button"
                  onClick={() => setTargetScope('custom')}
                  className={`py-1.5 rounded-xl border font-bold ${
                    targetScope === 'custom'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Selected ({selectedPages.length})
                </button>
              </div>
            </div>

            {/* Apply CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleApplyWatermark}
                disabled={isApplying || !text}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isApplying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Applying Locally...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Watermarked PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Preview / Page Grid (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">
                Document Preview ({pageCount} Pages)
              </h3>
              <span className="text-xs text-slate-400">Live watermark overlay preview</span>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-h-[600px] overflow-y-auto p-1">
              {thumbnails.map((thumb, index) => {
                const pageNum = index + 1;
                const isSelected = selectedPages.includes(pageNum);
                const isStamped = targetScope === 'all' || isSelected;

                return (
                  <div
                    key={pageNum}
                    onClick={() => {
                      if (targetScope === 'custom') togglePage(pageNum);
                    }}
                    className={`group relative rounded-2xl p-2.5 transition-all border ${
                      targetScope === 'custom' && isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/30'
                        : 'border-slate-200 bg-slate-50/50'
                    } ${targetScope === 'custom' ? 'cursor-pointer' : ''}`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5 px-0.5">
                      <span className="font-bold text-slate-700">Page {pageNum}</span>
                      {targetScope === 'custom' && (
                        isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-400" />
                        )
                      )}
                    </div>

                    <div className="w-full aspect-[1/1.414] bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs flex items-center justify-center relative">
                      <img
                        src={thumb}
                        alt={`Page ${pageNum}`}
                        className="w-full h-full object-contain pointer-events-none"
                      />

                      {/* Live Watermark Overlay simulation */}
                      {isStamped && (
                        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden ${
                          position === 'top' ? 'items-start pt-6' : position === 'bottom' ? 'items-end pb-6' : 'items-center'
                        }`}>
                          <span
                            className="font-extrabold uppercase tracking-widest select-none text-center px-2"
                            style={{
                              fontSize: `${fontSize * 0.28}px`,
                              color,
                              opacity,
                              transform: `rotate(${rotation}deg)`,
                            }}
                          >
                            {text || 'WATERMARK'}
                          </span>
                        </div>
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
