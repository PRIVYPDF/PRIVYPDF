import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Menu, 
  X, 
  ChevronDown,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const tools = [
    { name: 'PDF Workspace & Editor', path: '/pdf-editor', desc: 'Edit text, draw, sign, highlight & reorder', icon: Sparkles, featured: true },
    { name: 'Merge PDF', path: '/merge-pdf', desc: 'Combine multiple PDFs into one document', icon: Layers },
    { name: 'Split PDF', path: '/split-pdf', desc: 'Extract pages or split into separate files', icon: Scissors },
    { name: 'Compress PDF', path: '/compress-pdf', desc: 'Reduce PDF file size locally', icon: Minimize2 },
    { name: 'Image to PDF', path: '/image-to-pdf', desc: 'Convert JPG, PNG, WebP to PDF', icon: ImageIcon },
    { name: 'PDF to Image', path: '/pdf-to-image', desc: 'Extract pages as high-res PNG or JPG', icon: ImageIcon },
    { name: 'Rotate PDF', path: '/rotate-pdf', desc: 'Rotate specific or all PDF pages', icon: RotateCw },
    { name: 'Delete Pages', path: '/delete-pdf-pages', desc: 'Visually select and remove pages', icon: Trash2 },
    { name: 'Organize PDF', path: '/organize-pdf', desc: 'Reorder, rotate and organize pages', icon: Layers },
    { name: 'Watermark PDF', path: '/watermark-pdf', desc: 'Stamp text or image watermarks', icon: Stamp },
    { name: 'Protect PDF', path: '/protect-pdf', desc: 'Set password & restrict modifications', icon: Lock },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Privy<span className="text-indigo-600">PDF</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                  <ShieldCheck className="w-3 h-3 mr-0.5" />
                  100% Local
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden md:block font-medium">Your PDFs. Your Device. Your Privacy.</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Tools Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setToolsOpen(!toolsOpen)}
                onBlur={() => setTimeout(() => setToolsOpen(false), 200)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  toolsOpen || tools.some(t => t.path === location.pathname)
                    ? 'text-indigo-600 bg-indigo-50/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <span>All PDF Tools</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>

              {toolsOpen && (
                <div className="absolute left-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-3 px-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
                    Browser-Based Tools
                  </div>
                  <div className="grid grid-cols-1 gap-1 max-h-[75vh] overflow-y-auto">
                    {tools.map((tool) => {
                      const Icon = tool.icon;
                      const isActive = location.pathname === tool.path;
                      return (
                        <Link
                          key={tool.path}
                          to={tool.path}
                          onClick={() => setToolsOpen(false)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                            isActive
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                          } ${tool.featured ? 'border border-indigo-100 bg-indigo-50/30' : ''}`}
                        >
                          <div className={`p-2 rounded-lg mt-0.5 ${
                            tool.featured ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold flex items-center gap-1.5">
                              {tool.name}
                              {tool.featured && (
                                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">Hero</span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 leading-snug">{tool.desc}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/pdf-editor"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                location.pathname === '/pdf-editor'
                  ? 'text-indigo-600 bg-indigo-50/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              PDF Workspace
            </Link>

            <Link
              to="/privacy"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                location.pathname === '/privacy'
                  ? 'text-indigo-600 bg-indigo-50/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Privacy Architecture
            </Link>

            <Link
              to="/about"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                location.pathname === '/about'
                  ? 'text-indigo-600 bg-indigo-50/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              About
            </Link>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 px-3 py-1.5 rounded-full font-medium shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Processed locally in your browser</span>
            </div>

            <Link
              to="/pdf-editor"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm shadow-indigo-600/30 transition-all hover:shadow-md shrink-0"
            >
              <span>Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Mobile / Tablet menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Backdrop & Panel */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 top-16 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="lg:hidden fixed top-16 left-0 right-0 max-h-[calc(100vh-4rem)] overflow-y-auto bg-white border-b border-slate-200 z-40 px-4 pt-3 pb-8 space-y-4 shadow-xl">
            {/* Local Badge for mobile */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs font-semibold text-emerald-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Local Client-Side Processing</span>
              </div>
              <span className="text-[10px] text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-200">Zero Server Uploads</span>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5">PDF Toolkit</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {tools.map(tool => (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-indigo-50 min-h-[44px]"
                  >
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                      <tool.icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold">{tool.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5">Information</div>
              <Link
                to="/privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 min-h-[44px]"
              >
                Privacy Statement & Architecture
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 min-h-[44px]"
              >
                About PrivyPDF
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 min-h-[44px]"
              >
                Contact & Feedback
              </Link>
            </div>

            <div className="pt-2">
              <Link
                to="/pdf-editor"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex justify-center items-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md min-h-[44px]"
              >
                <span>Launch PDF Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
