import React from 'react';
import { Cpu, ShieldCheck, Zap, Lock, Code2, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
          About PrivyPDF
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          The Philosophy of Local-First PDF Editing
        </h1>
        <p className="text-base text-slate-500 max-w-xl mx-auto">
          Built for privacy conscious individuals, attorneys, medical providers, and businesses who cannot risk uploading sensitive files to unknown cloud servers.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Why We Built PrivyPDF</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Most online PDF converters and editors force you to upload your confidential files to their backend servers. Many of these services retain copies of your documents, analyze your text for marketing algorithms, or process your tax and identity forms on multi-tenant servers prone to leaks.
        </p>
        <p className="text-slate-600 text-sm leading-relaxed">
          PrivyPDF flips that paradigm upside-down. Modern web browsers are astonishingly powerful execution environments equipped with WebAssembly, WebGL, and high-performance JavaScript engines. By bringing professional PDF vector rendering and manipulation entirely into the client, you get instant processing speeds with <strong>zero server privacy compromises</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3">
            <Zap className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Blazing Fast</h3>
              <p className="text-xs text-slate-500">No waiting for slow file uploads or server queue bottlenecks.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Offline Capable</h3>
              <p className="text-xs text-slate-500">Works seamlessly even without active internet connection once loaded.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack Transparency */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <Code2 className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">Engineered with Open Standards</h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          PrivyPDF is built with battle-tested open technologies:
        </p>
        <ul className="space-y-3 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <strong>PDF-Lib:</strong> Client-side PDF binary parsing, page copying, and vector manipulation.
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <strong>PDF.js:</strong> Mozilla's browser rendering standard for high-fidelity canvas rasterization.
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <strong>HTML5 Canvas API:</strong> Real-time hardware-accelerated drawing and annotation layers.
          </li>
        </ul>

        <div className="pt-4 border-t border-slate-100 flex justify-center">
          <Link
            to="/pdf-editor"
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
          >
            Try the PDF Workspace Now
          </Link>
        </div>
      </div>
    </div>
  );
};
