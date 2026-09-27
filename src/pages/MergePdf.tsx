import React, { useState } from 'react';
import { Layers, ArrowUpDown, Trash2, Download, Plus, GripVertical, FileText, CheckCircle2 } from 'lucide-react';
import { DropZone } from '../components/common/DropZone';
import { mergePdfs } from '../services/pdf/pdfModifier';
import { downloadFile, formatBytes, triggerConfetti } from '../utils/fileUtils';
import { SeoHead } from '../components/common/SeoHead';
import { ToolSeoContent } from '../components/common/ToolSeoContent';
import { Scissors, Minimize2, Edit3 } from 'lucide-react';

interface MergeItem {
  id: string;
  file: File;
  buffer: ArrayBuffer;
}

export const MergePdf: React.FC = () => {
  const [items, setItems] = useState<MergeItem[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);

  const handleMultipleFilesLoaded = (newFiles: { file: File; buffer: ArrayBuffer }[]) => {
    const formatted: MergeItem[] = newFiles.map(f => ({
      id: `${f.file.name}-${Date.now()}-${Math.random()}`,
      file: f.file,
      buffer: f.buffer,
    }));
    setItems(prev => [...prev, ...formatted]);
    setMergedBlob(null);
  };

  const handleRemove = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setMergedBlob(null);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const reordered = [...items];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setItems(reordered);
    setMergedBlob(null);
  };

  const handleMerge = async () => {
    if (items.length < 2) return;
    try {
      setIsMerging(true);
      const buffers = items.map(i => i.buffer);
      const mergedBytes = await mergePdfs(buffers);
      const blob = new Blob([mergedBytes as unknown as BlobPart], { type: 'application/pdf' });
      setMergedBlob(blob);
      downloadFile(mergedBytes, 'merged-document.pdf');
      triggerConfetti();
    } catch (err) {
      console.error('Error merging PDFs:', err);
    } finally {
      setIsMerging(false);
    }
  };

  const faqs = [
    {
      question: 'Is there a limit on how many PDFs I can merge?',
      answer: 'No arbitrary limits. You can combine as many PDF files as your local device RAM supports. There are no daily caps or hidden paywalls.',
    },
    {
      question: 'Are my files uploaded anywhere during merge?',
      answer: 'Never. The PDF compilation runs inside your web browser using JavaScript and WebAssembly. Your files never leave your computer or phone.',
    },
    {
      question: 'Does merging reduce PDF quality or scramble fonts?',
      answer: 'No. Vector outlines, embedded fonts, form fields, and high-resolution images are preserved losslessly from the original documents.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <SeoHead
        title="Merge PDF Files Online — Combine PDFs Privately for Free"
        description="Combine multiple PDF documents into a single organized file directly in your browser. 100% private, free, and no file uploads to external servers."
        canonicalPath="/merge-pdf"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Merge PDF', url: '/merge-pdf' },
        ]}
        faqs={faqs}
      />

      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" />
          <span>Local PDF Merger</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Merge Multiple PDF Documents
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Combine multiple PDFs into a single file with custom ordering. Processed entirely in your browser memory.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="mb-8">
        <DropZone
          multiple={true}
          onMultipleFilesLoaded={handleMultipleFilesLoaded}
          onFileLoaded={(file, buffer) => handleMultipleFilesLoaded([{ file, buffer }])}
          title="Select or Drop Multiple PDF Files"
          subtitle="Add as many PDF files as you'd like to combine"
        />
      </div>

      {/* Selected Files List */}
      {items.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">
              Files to Merge ({items.length})
            </h3>
            <span className="text-xs text-slate-400">Drag or use arrows to adjust order</span>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 text-center text-xs font-bold text-slate-400">{idx + 1}</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate" title={item.file.name}>
                      {item.file.name}
                    </p>
                    <p className="text-xs text-slate-400">{formatBytes(item.file.size)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white disabled:opacity-30"
                    title="Move Up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === items.length - 1}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white disabled:opacity-30"
                    title="Move Down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 ml-1"
                    title="Remove File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Merge CTA */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {items.length < 2 ? 'Please add at least 2 PDF files to merge.' : 'Ready to merge files in listed order.'}
            </span>

            <button
              type="button"
              onClick={handleMerge}
              disabled={items.length < 2 || isMerging}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-600/25 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isMerging ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Merging Local Documents...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Merge & Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* SEO & Informational Content */}
      <ToolSeoContent
        toolName="Merge PDF"
        howToSteps={[
          {
            title: 'Choose PDF Files',
            description: 'Select two or more PDF files from your computer or mobile device. Drag and drop is supported.',
          },
          {
            title: 'Arrange Document Order',
            description: 'Use the up and down arrow controls to order your files exactly as you want them to appear in the combined PDF.',
          },
          {
            title: 'Merge & Save',
            description: 'Click Merge & Download PDF to assemble the final document in memory and instantly download it to your storage.',
          },
        ]}
        features={[
          {
            title: 'Zero Server Uploads',
            description: 'All merging logic executes locally in your browser memory without transmitting confidential documents over the internet.',
            icon: <Layers className="w-4 h-4 text-indigo-600" />,
          },
          {
            title: 'Flexible Reordering',
            description: 'Easily rearrange files up or down to ensure every section, chapter, or appendix lands in the proper sequence.',
            icon: <ArrowUpDown className="w-4 h-4 text-indigo-600" />,
          },
          {
            title: 'Fast & Lightweight',
            description: 'Powered by client-side WebAssembly, merging happens in seconds even on mobile devices.',
            icon: <Download className="w-4 h-4 text-indigo-600" />,
          },
        ]}
        faqs={faqs}
        relatedTools={[
          {
            title: 'Split PDF',
            description: 'Extract specific pages or page ranges from any multi-page PDF document.',
            path: '/split-pdf',
            icon: <Scissors className="w-4 h-4 text-indigo-600" />,
          },
          {
            title: 'Compress PDF',
            description: 'Reduce file size while preserving high visual sharpness and readable text.',
            path: '/compress-pdf',
            icon: <Minimize2 className="w-4 h-4 text-indigo-600" />,
          },
          {
            title: 'PDF Editor',
            description: 'Annotate, sign, draw, add text, and organize pages in our private workspace.',
            path: '/pdf-editor',
            icon: <Edit3 className="w-4 h-4 text-indigo-600" />,
          },
        ]}
      />
    </div>
  );
};
