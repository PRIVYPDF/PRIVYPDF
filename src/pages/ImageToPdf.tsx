import React, { useState } from 'react';
import { Image as ImageIcon, Download, Trash2, ArrowUpDown, Plus, Settings } from 'lucide-react';
import { convertImagesToPdf, ImageItem, ImageToPdfOptions } from '../services/image/imageToPdf';
import { downloadFile, formatBytes, triggerConfetti } from '../utils/fileUtils';

export const ImageToPdf: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [options, setOptions] = useState<ImageToPdfOptions>({
    pageSize: 'a4',
    orientation: 'auto',
    margin: 'small',
    imageFit: 'contain',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFilesAdded = (files: FileList | null) => {
    if (!files) return;

    const newItems: ImageItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const previewUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = previewUrl;
      img.onload = () => {
        setImages(prev => [
          ...prev,
          {
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
            size: file.size,
            previewUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
          },
        ]);
      };
    }
  };

  const handleRemove = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;
    const reordered = [...images];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    setImages(reordered);
  };

  const handleCreatePdf = async () => {
    if (images.length === 0) return;
    try {
      setIsGenerating(true);
      const pdfBytes = await convertImagesToPdf(images, options);
      downloadFile(pdfBytes, 'converted-images.pdf');
      triggerConfetti();
    } catch (err) {
      console.error('Error generating PDF from images:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Local Image to PDF</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Convert Images to PDF
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Convert JPG, PNG, and WebP images into a beautifully formatted PDF document right inside your browser.
        </p>
      </div>

      <div className="space-y-6">
        {/* Upload Box */}
        <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center cursor-pointer bg-white/70 backdrop-blur-xs hover:bg-slate-50/50 transition-all shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8" />
          </div>
          <span className="text-lg font-bold text-slate-800">Add or Drop Images Here</span>
          <span className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WebP • Multi-file selection</span>
          <span className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-sm hover:bg-indigo-700">
            Select Images
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={(e) => handleFilesAdded(e.target.files)}
            className="hidden"
          />
        </label>

        {images.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Images List (2 cols on lg) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm">
                  Selected Images ({images.length})
                </h3>
                <span className="text-xs text-slate-400">Order reflects page sequence</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto p-1">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200"
                  >
                    <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0">
                      <img src={img.previewUrl} alt={img.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate" title={img.name}>{img.name}</p>
                      <p className="text-[11px] text-slate-400">{img.width}x{img.height} • {formatBytes(img.size)}</p>
                      <span className="text-[10px] text-indigo-600 font-semibold">Page {idx + 1}</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'up')}
                        disabled={idx === 0}
                        className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-20"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'down')}
                        disabled={idx === images.length - 1}
                        className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-20"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(img.id)}
                        className="text-xs text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Layout Options (1 col on lg) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
                <Settings className="w-4 h-4 text-indigo-600" />
                <span>Page Layout & Sizing</span>
              </div>

              {/* Page Size */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Page Size</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['a4', 'letter', 'fit'] as const).map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setOptions({ ...options, pageSize: size })}
                      className={`py-1.5 text-xs rounded-xl border font-bold capitalize transition-all ${
                        options.pageSize === size
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {size === 'fit' ? 'Auto-Fit' : size.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orientation */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Orientation</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['auto', 'portrait', 'landscape'] as const).map(orient => (
                    <button
                      key={orient}
                      type="button"
                      onClick={() => setOptions({ ...options, orientation: orient })}
                      className={`py-1.5 text-xs rounded-xl border font-bold capitalize transition-all ${
                        options.orientation === orient
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {orient}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margins */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Margins</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['none', 'small', 'medium'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setOptions({ ...options, margin: m })}
                      className={`py-1.5 text-xs rounded-xl border font-bold capitalize transition-all ${
                        options.margin === m
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Fit */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Image Fit</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['contain', 'cover'] as const).map(fit => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => setOptions({ ...options, imageFit: fit })}
                      className={`py-1.5 text-xs rounded-xl border font-bold capitalize transition-all ${
                        options.imageFit === fit
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {fit === 'contain' ? 'Fit Page' : 'Fill Page'}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCreatePdf}
                  disabled={isGenerating || images.length === 0}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Create & Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
