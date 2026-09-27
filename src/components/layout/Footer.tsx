import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ShieldCheck, Heart, Lock, Cpu, EyeOff, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 mt-16 sm:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand & Privacy Statement */}
          <div className="sm:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white">Privy<span className="text-indigo-400">PDF</span></span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Your PDFs. Your Device. Your Privacy. A zero-server PDF workspace and utility suite executing completely inside your browser memory.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2 max-w-sm">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Client-Side Privacy Architecture</span>
              </div>
              <p className="text-slate-400 leading-normal">
                Your files are processed locally in your browser and are not uploaded to our server. All operations run directly on your CPU via WebAssembly and Canvas.
              </p>
            </div>
          </div>

          {/* Quick Tools 1 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Workspace & Edit</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/pdf-editor" className="hover:text-white transition-colors">PDF Workspace & Editor</Link></li>
              <li><Link to="/watermark-pdf" className="hover:text-white transition-colors">Watermark PDF</Link></li>
              <li><Link to="/rotate-pdf" className="hover:text-white transition-colors">Rotate Pages</Link></li>
              <li><Link to="/organize-pdf" className="hover:text-white transition-colors">Organize & Reorder</Link></li>
              <li><Link to="/delete-pdf-pages" className="hover:text-white transition-colors">Delete Pages</Link></li>
            </ul>
          </div>

          {/* Quick Tools 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Convert & Manage</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/merge-pdf" className="hover:text-white transition-colors">Merge PDF</Link></li>
              <li><Link to="/split-pdf" className="hover:text-white transition-colors">Split PDF</Link></li>
              <li><Link to="/compress-pdf" className="hover:text-white transition-colors">Compress PDF</Link></li>
              <li><Link to="/image-to-pdf" className="hover:text-white transition-colors">Image to PDF</Link></li>
              <li><Link to="/pdf-to-image" className="hover:text-white transition-colors">PDF to Image (JPG/PNG)</Link></li>
              <li><Link to="/protect-pdf" className="hover:text-white transition-colors">Protect PDF</Link></li>
            </ul>
          </div>

          {/* Privacy & Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Integrity & Trust</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/privacy" className="hover:text-white transition-colors flex items-center gap-1.5"><EyeOff className="w-3.5 h-3.5 text-emerald-400" /> Privacy Statement</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-indigo-400" /> How Local Processing Works</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact & Feedback</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PrivyPDF. Built for absolute document privacy.</p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero server PDF uploads</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
