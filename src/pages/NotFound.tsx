import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, Edit3, Layers, Scissors, Minimize2 } from 'lucide-react';
import { SeoHead } from '../components/common/SeoHead';

export const NotFound: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24 text-center max-w-2xl mx-auto">
      <SeoHead
        title="404 — Page Not Found"
        description="The requested page could not be found on PrivyPDF. Browse our private browser-based PDF tools."
        noindex={true}
      />

      <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
        <FileQuestion className="w-10 h-10" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
        Error 404
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
        Page Not Found
      </h1>
      <p className="text-base text-slate-600 leading-relaxed mb-8 max-w-md">
        The link you followed may be broken or the page may have been moved. All your local PDF processing tools are available from our homepage.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto mb-10">
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all min-h-[44px]"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/pdf-editor"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm transition-all min-h-[44px]"
        >
          <Edit3 className="w-4 h-4 text-indigo-600" />
          <span>Open PDF Editor</span>
        </Link>
      </div>

      {/* Quick Tools Grid */}
      <div className="w-full border-t border-slate-200/80 pt-8 text-left">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">
          Popular Private PDF Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/merge-pdf"
            className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all text-xs font-semibold text-slate-700"
          >
            <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Merge PDF</span>
          </Link>
          <Link
            to="/split-pdf"
            className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all text-xs font-semibold text-slate-700"
          >
            <Scissors className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Split PDF</span>
          </Link>
          <Link
            to="/compress-pdf"
            className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all text-xs font-semibold text-slate-700"
          >
            <Minimize2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Compress PDF</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
