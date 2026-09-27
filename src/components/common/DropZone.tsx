import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, ShieldCheck, Sparkles, ArrowUpRight } from 'lucide-react';
import { createSamplePdf } from '../../services/pdf/pdfModifier';

interface DropZoneProps {
  onFileLoaded: (file: File, buffer: ArrayBuffer) => void;
  accept?: string;
  multiple?: boolean;
  onMultipleFilesLoaded?: (files: { file: File; buffer: ArrayBuffer }[]) => void;
  title?: string;
  subtitle?: string;
  allowSample?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFileLoaded,
  accept = '.pdf,application/pdf',
  multiple = false,
  onMultipleFilesLoaded,
  title = 'Drop your PDF here',
  subtitle = 'or choose a file from your device',
  allowSample = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    if (multiple && onMultipleFilesLoaded) {
      const results: { file: File; buffer: ArrayBuffer }[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const buffer = await file.arrayBuffer();
        results.push({ file, buffer });
      }
      onMultipleFilesLoaded(results);
    } else {
      const file = fileList[0];
      const buffer = await file.arrayBuffer();
      onFileLoaded(file, buffer);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const handleLoadSample = async () => {
    try {
      setIsLoadingSample(true);
      const sampleBytes = await createSamplePdf();
      const sampleBlob = new Blob([sampleBytes as unknown as BlobPart], { type: 'application/pdf' });
      const sampleFile = new File([sampleBlob], 'PrivyPDF-Sample-Workspace.pdf', { type: 'application/pdf' });
      const buffer = sampleBytes.buffer.slice(sampleBytes.byteOffset, sampleBytes.byteOffset + sampleBytes.byteLength) as ArrayBuffer;
      onFileLoaded(sampleFile, buffer);
    } catch (err) {
      console.error('Error creating sample PDF:', err);
    } finally {
      setIsLoadingSample(false);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer group rounded-3xl border-2 border-dashed p-5 sm:p-8 md:p-12 text-center transition-all duration-200 bg-white/70 backdrop-blur-xs ${
          isDragging
            ? 'border-indigo-600 bg-indigo-50/70 scale-[1.01] shadow-xl shadow-indigo-500/10'
            : 'border-slate-200/90 hover:border-indigo-400 hover:bg-slate-50/50 shadow-lg shadow-slate-200/40'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3 sm:space-y-4">
          {/* Icon */}
          <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-200 ${
            isDragging 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
              : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
          }`}>
            <UploadCloud className="w-7 h-7 sm:w-10 sm:h-10" />
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h3 className="text-lg sm:text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>
          </div>

          {/* CTA Button */}
          <div className="pt-2 w-full sm:w-auto">
            <span className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 group-hover:bg-indigo-700 transition-colors">
              <FileText className="w-4 h-4" />
              <span>Choose {multiple ? 'Files' : 'PDF'}</span>
            </span>
          </div>

          {/* Privacy badge */}
          <div className="pt-2 sm:pt-4 flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 bg-slate-50/80 border border-slate-200/80 px-3 sm:px-4 py-2 rounded-2xl sm:rounded-full text-left sm:text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong className="text-slate-700 font-semibold">🔒 Private & Local:</strong> Processed locally in your browser.
            </span>
          </div>
        </div>
      </div>

      {/* Quick Sample Trigger */}
      {allowSample && (
        <div className="mt-4 flex items-center justify-center px-2">
          <button
            type="button"
            onClick={handleLoadSample}
            disabled={isLoadingSample}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/90 hover:bg-indigo-100/90 px-4 py-2.5 rounded-xl transition-all border border-indigo-200/80 min-h-[40px]"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{isLoadingSample ? 'Generating sample...' : 'No PDF at hand? Load sample demo PDF'}</span>
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      )}
    </div>
  );
};
