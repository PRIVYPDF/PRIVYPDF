import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ShieldCheck, 
  Layers, 
  Scissors, 
  Minimize2, 
  Image as ImageIcon, 
  RotateCw, 
  Trash2, 
  Stamp, 
  Lock, 
  ArrowRight, 
  Sparkles,
  Cpu, 
  HardDriveDownload,
  EyeOff,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { DropZone } from '../components/common/DropZone';
import { SeoHead } from '../components/common/SeoHead';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: 'Are my PDF files uploaded to your servers or cloud?',
      answer: 'No. PrivyPDF runs 100% locally in your web browser using client-side WebAssembly and modern JavaScript. Your files are processed entirely in your device memory and are never uploaded to any remote server.',
    },
    {
      question: 'Is PrivyPDF free to use, and is there a file size limit?',
      answer: 'PrivyPDF is completely free with no account or subscription required. Because processing happens on your local device, file limits are determined only by your computer or mobile device memory.',
    },
    {
      question: 'Can I use PrivyPDF on mobile devices or tablets?',
      answer: 'Yes! PrivyPDF is designed to be fully mobile-first and responsive. You can edit, sign, merge, and organize PDFs using touch gestures on iPhones, iPads, Android smartphones, and tablets.',
    },
    {
      question: 'What happens to my documents when I close the tab?',
      answer: 'Because all document operations take place within temporary browser RAM, your files are completely cleared the moment you close the tab or clear the document.',
    },
  ];

  const handleFileLoaded = (file: File, buffer: ArrayBuffer) => {
    // Navigate straight to workspace with the file!
    navigate('/pdf-editor', { state: { file, buffer } });
  };

  const tools = [
    {
      title: 'PDF Workspace & Editor',
      description: 'The all-in-one studio: annotate, add text, draw, sign, highlight, and manage pages in one place.',
      icon: Sparkles,
      path: '/pdf-editor',
      badge: 'Hero Feature',
      highlight: true,
    },
    {
      title: 'Merge PDF',
      description: 'Combine multiple PDF documents into a single organized file with custom page order.',
      icon: Layers,
      path: '/merge-pdf',
    },
    {
      title: 'Split PDF',
      description: 'Extract specific pages, custom page ranges, or split every page into separate files.',
      icon: Scissors,
      path: '/split-pdf',
    },
    {
      title: 'Compress PDF',
      description: 'Reduce PDF file size locally using browser canvas rasterization while retaining readability.',
      icon: Minimize2,
      path: '/compress-pdf',
    },
    {
      title: 'Image to PDF',
      description: 'Convert JPG, PNG, and WebP images into formatted PDF documents with custom margins & fit.',
      icon: ImageIcon,
      path: '/image-to-pdf',
    },
    {
      title: 'PDF to Image',
      description: 'Extract PDF pages as high-resolution PNG or JPG graphics. Single download or batch ZIP.',
      icon: ImageIcon,
      path: '/pdf-to-image',
    },
    {
      title: 'Rotate PDF',
      description: 'Permanently rotate individual pages or all pages by 90°, 180°, or 270° clockwise.',
      icon: RotateCw,
      path: '/rotate-pdf',
    },
    {
      title: 'Delete PDF Pages',
      description: 'Select unwanted pages with visual thumbnails and generate a clean, stripped PDF.',
      icon: Trash2,
      path: '/delete-pdf-pages',
    },
    {
      title: 'Organize PDF',
      description: 'Visually sort, reorder, duplicate, rotate, and reorganize pages with drag-and-drop ease.',
      icon: Layers,
      path: '/organize-pdf',
    },
    {
      title: 'Watermark PDF',
      description: 'Stamp custom text or images with adjustable transparency, position, and rotation.',
      icon: Stamp,
      path: '/watermark-pdf',
    },
    {
      title: 'Protect PDF',
      description: 'Lock document permissions and apply privacy restrictions client-side directly on your device.',
      icon: Lock,
      path: '/protect-pdf',
    },
  ];

  return (
    <div className="min-h-screen">
      <SeoHead
        title="PrivyPDF — Your PDFs. Your Device. Your Privacy."
        description="Private browser-based PDF workspace. Edit, merge, split, compress, sign, and convert PDF files locally. No files are uploaded to any server."
        canonicalPath="/"
        breadcrumbs={[{ name: 'Home', url: '/' }]}
        faqs={faqs}
      />

      {/* Hero Section */}
      <section className="relative pt-8 pb-14 sm:pt-14 sm:pb-24 lg:pt-16 lg:pb-28 overflow-hidden bg-gradient-to-b from-indigo-50/40 via-white to-white">
        <div className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 text-center">
          {/* Privacy Badge */}
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 rounded-2xl sm:rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs sm:text-sm font-semibold mb-5 sm:mb-6 shadow-2xs max-w-full text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>🔒 Private & Local Processing: Your files are processed locally in your browser.</span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4 sm:mb-6">
            Free Online <span className="text-indigo-600">PDF Tools</span>
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal px-2">
            Edit, organize, convert and manage your PDF files directly in your browser.
          </p>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 w-full max-w-md mx-auto sm:max-w-none">
            <button
              onClick={() => {
                const el = document.getElementById('dropzone-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 active:scale-98 transition-all hover:shadow-xl min-h-[44px]"
            >
              <Sparkles className="w-5 h-5 shrink-0" />
              <span>Start with a PDF</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('all-tools-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm sm:text-base shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all min-h-[44px]"
            >
              <span>Explore Tools</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>

          {/* Upload DropZone */}
          <div id="dropzone-section" className="max-w-2xl mx-auto scroll-mt-20 sm:scroll-mt-24 w-full">
            <DropZone
              onFileLoaded={handleFileLoaded}
              title="Drop your PDF here"
              subtitle="or choose a file from your device"
              allowSample={true}
            />
          </div>
        </div>
      </section>

      {/* Privacy Architecture Flow Section */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
              Zero-Server Guarantee
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-3 mb-2">
              How PrivyPDF Protects Your Documents
            </h2>
            <p className="text-sm text-slate-400">
              Unlike traditional PDF web services, your documents never touch a remote cloud backend.
            </p>
          </div>

          {/* Step Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
            {[
              { step: '01', title: 'User File', desc: 'File opened from your disk or device storage.', icon: FileText },
              { step: '02', title: 'Browser Memory', desc: 'Read directly into sandboxed JavaScript ArrayBuffer.', icon: EyeOff },
              { step: '03', title: 'Local Processing', desc: 'Compiled WebAssembly & Canvas engine runs on your CPU.', icon: Cpu },
              { step: '04', title: 'Generated PDF', desc: 'New byte streams created locally via PDF-Lib.', icon: Zap },
              { step: '05', title: 'User Download', desc: 'File saved straight back to your download folder.', icon: HardDriveDownload },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 relative group hover:border-indigo-500 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-indigo-400">{item.step}</span>
                    <Icon className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Transparency Callout */}
          <div className="mt-10 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-center max-w-xl mx-auto flex items-center justify-center gap-3 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>No PDF upload API • No cloud storage • No database retention</span>
          </div>
        </div>
      </section>

      {/* All Tools Grid Section */}
      <section id="all-tools-grid" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Toolkit Suite
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3 mb-2">
            Every PDF Tool You Need. Always Local.
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            Click any tool below to launch its dedicated workflow or drop your file into the main workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.title}
                onClick={() => navigate(tool.path)}
                className={`group cursor-pointer rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-200 bg-white border ${
                  tool.highlight
                    ? 'border-indigo-200 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30 hover:shadow-xl hover:border-indigo-400'
                    : 'border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                    tool.highlight ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {tool.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      {tool.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                  {tool.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-4">
                  {tool.description}
                </p>

                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature differentiator banner */}
      <section className="py-12 bg-indigo-50/50 border-y border-indigo-100/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="text-2xl font-extrabold text-slate-900">
            The Private PDF Workspace Advantage
          </h2>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto">
            Upload your document once to reorder pages, delete duplicates, sign with your stylus, stamp watermarks, and download — without reloading or re-uploading your file 10 times across different tools.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/pdf-editor')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
            >
              <span>Launch PDF Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need to Know About PrivyPDF
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Answers to common questions regarding privacy, file security, and features.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2"
            >
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{faq.question}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
