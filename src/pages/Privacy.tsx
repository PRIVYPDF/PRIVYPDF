import React from 'react';
import { ShieldCheck, Lock, EyeOff, ServerOff, Cpu, HardDrive, FileCheck } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Local-Only Privacy Policy</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy & Security Architecture
        </h1>
        <p className="text-base text-slate-500 max-w-xl mx-auto">
          PrivyPDF was engineered from the ground up to respect document privacy by eliminating backend file transfers entirely.
        </p>
      </div>

      {/* Main Guarantee Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-10 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Our Core Privacy Promise: Processed Locally In Your Browser
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              PrivyPDF is designed so that supported PDF processing happens directly in your browser. Your files are not uploaded to our server or any third-party cloud storage. All parsing, vector rendering, visual editing, drawing, and PDF generation execute purely on your local device.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <ServerOff className="w-4 h-4 text-rose-500" />
              <span>No Server Uploads</span>
            </div>
            <p className="text-xs text-slate-500">
              There is no file upload API endpoint. Your files never leave your client device memory.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Cpu className="w-4 h-4 text-indigo-500" />
              <span>Client-Side Compute</span>
            </div>
            <p className="text-xs text-slate-500">
              Operations run via WebAssembly, PDF.js, and HTML5 Canvas inside your browser sandbox.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <EyeOff className="w-4 h-4 text-emerald-500" />
              <span>Zero Content Analytics</span>
            </div>
            <p className="text-xs text-slate-500">
              We never inspect, log, or track document content, text, passwords, or images.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Technical Questions */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-slate-900">Frequently Asked Privacy Questions</h3>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-2">
          <h4 className="font-bold text-slate-900 text-base">Where do my PDF files go when I drag them in?</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            When you drag or select a PDF, the browser creates an in-memory <code>ArrayBuffer</code> through the standard HTML5 File API. The document exists purely in your computer's RAM for the duration of your tab session. When you close the tab, the buffer is garbage collected.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-2">
          <h4 className="font-bold text-slate-900 text-base">Can PrivyPDF staff or hackers see my signed contracts or medical documents?</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            No. Because the files are never transmitted across the network to our server, neither PrivyPDF nor any network interceptor can inspect or store your documents. You can even disconnect your Wi-Fi or go into Airplane mode after the app loads, and all PDF editing and generation tools will continue working!
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-2">
          <h4 className="font-bold text-slate-900 text-base">What about my signatures and watermarks?</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            When you draw a signature with your mouse or stylus, the vector strokes are rendered into a PNG raster layer directly inside your browser. The image is embedded into the PDF binary streams via client-side PDF-lib. Nothing is stored in any cloud database.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-2">
          <h4 className="font-bold text-slate-900 text-base">Why factual privacy language instead of "100% secure"?</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            We believe in honest, transparent engineering. No system can claim "100% security" as an absolute guarantee (for example, if your own device has local malware). Instead, we provide verifiable architectural facts: <strong>"Processed locally in your browser and not uploaded to our server."</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
