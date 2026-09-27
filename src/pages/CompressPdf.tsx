import React, { useState } from 'react';
import { Minimize2, Download, ShieldCheck, CheckCircle2, AlertCircle, ArrowDown } from 'lucide-react';
import { DropZone } from '../components/common/DropZone';
import { compressPdfClientSide, CompressionResult } from '../services/pdf/pdfCompressor';
import { formatBytes, downloadFile, triggerConfetti } from '../utils/fileUtils';

export const CompressPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [level, setLevel] = useState<'extreme' | 'recommended' | 'low'>('recommended');
  const [isCompressing, setIsCompressing] = useState(false);
  const [result, setResult] = useState<CompressionResult | null>(null);

  const handleFileLoaded = (loadedFile: File, loadedBuffer: ArrayBuffer) => {
    setFile(loadedFile);
    setBuffer(loadedBuffer);
    setResult(null);
  };

  const handleRunCompression = async () => {
    if (!buffer) return;
    try {
      setIsCompressing(true);
      const res = await compressPdfClientSide(buffer, { level });
      setResult(res);
      if (res.isSmaller) {
        triggerConfetti();
      }
    } catch (err) {
      console.error('Compression error:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const outName = `${file?.name.replace(/\.pdf$/i, '') || 'document'}-compressed.pdf`;
    downloadFile(result.compressedBytes, outName);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Local PDF Compressor</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Compress PDF Locally
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Reduce PDF file size directly in your browser. No files are uploaded to any server.
        </p>
      </div>

      {!buffer ? (
        <DropZone
          onFileLoaded={handleFileLoaded}
          title="Drop your PDF here to compress"
          subtitle="or click to browse your local device"
        />
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
            {/* File info banner */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <p className="text-sm font-bold text-slate-800 truncate">{file?.name}</p>
                <p className="text-xs text-slate-500">Current file size: {formatBytes(file?.size || 0)}</p>
              </div>
              <button
                type="button"
                onClick={() => { setBuffer(null); setFile(null); setResult(null); }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Change File
              </button>
            </div>

            {/* Compression Presets */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Compression Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'extreme' as const,
                    title: 'Extreme Compression',
                    desc: 'Smallest file size, lower image quality',
                  },
                  {
                    id: 'recommended' as const,
                    title: 'Recommended',
                    desc: 'Balanced compression with sharp text',
                  },
                  {
                    id: 'low' as const,
                    title: 'Low Compression',
                    desc: 'High image quality, minimal size reduction',
                  },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => { setLevel(opt.id); setResult(null); }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      level === opt.id
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/30'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-900 mb-1">{opt.title}</div>
                    <div className="text-xs text-slate-500 leading-snug">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Run Compression Action */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRunCompression}
                disabled={isCompressing}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isCompressing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Compressing Locally...</span>
                  </>
                ) : (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    <span>Compress PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Real Results Display */}
          {result && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Compression Finished</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-400 font-medium block mb-0.5">Original Size</span>
                  <span className="text-base sm:text-lg font-bold text-slate-700">{formatBytes(result.originalSize)}</span>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                  <span className="text-xs text-indigo-500 font-medium block mb-0.5">Compressed Size</span>
                  <span className="text-base sm:text-lg font-bold text-indigo-700">{formatBytes(result.compressedSize)}</span>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <span className="text-xs text-emerald-600 font-medium block mb-0.5">Saved</span>
                  <span className="text-base sm:text-lg font-extrabold text-emerald-700">
                    {result.isSmaller ? `${result.savedPercentage}%` : '0%'}
                  </span>
                </div>
              </div>

              {result.notes && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{result.notes}</span>
                </div>
              )}

              {/* Download Compressed File */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all cursor-pointer min-h-[44px]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Compressed PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
