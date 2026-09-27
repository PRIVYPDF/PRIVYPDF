import React from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Undo2, 
  Redo2, 
  Download, 
  X, 
  ChevronLeft,
  Layers,
  Sliders
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface WorkspaceHeaderProps {
  fileName: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSaveDownload: () => void;
  onClearFile: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onToggleThumbnails?: () => void;
  onToggleProperties?: () => void;
  pageCount?: number;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  fileName,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSaveDownload,
  onClearFile,
  isSaving,
  hasUnsavedChanges,
  onToggleThumbnails,
  onToggleProperties,
  pageCount = 1,
}) => {
  return (
    <header className="bg-white border-b border-slate-200/90 px-2 sm:px-4 lg:px-6 py-1.5 sm:py-2 flex items-center justify-between gap-1 sm:gap-3 shadow-2xs z-30 w-full overflow-hidden">
      {/* Left: Back / Title & File info */}
      <div className="flex items-center gap-1 sm:gap-2.5 min-w-0">
        <Link
          to="/"
          className="min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
          title="Back to Home"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <h1 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight hidden sm:block truncate">Workspace</h1>
              <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 sm:px-1.5 py-0.2 rounded-full border border-emerald-200/80 shrink-0">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                <span className="hidden xs:inline">Local</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 truncate max-w-[65px] xs:max-w-[110px] sm:max-w-xs font-medium" title={fileName}>
              {fileName || 'Document.pdf'}
            </p>
          </div>
        </div>
      </div>

      {/* Center: Undo & Redo */}
      <div className="flex items-center gap-0.5 bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/70 shrink-0">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="min-w-[30px] min-h-[30px] sm:min-w-[34px] sm:min-h-[34px] flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="min-w-[30px] min-h-[30px] sm:min-w-[34px] sm:min-h-[34px] flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Right: Mobile Drawer Toggles & Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Mobile/Tablet Thumbnails Toggle */}
        {onToggleThumbnails && (
          <button
            type="button"
            onClick={onToggleThumbnails}
            className="lg:hidden min-h-[32px] sm:min-h-[36px] px-1.5 sm:px-2 py-1 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1 transition-colors"
            title="Open Pages Drawer"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[10px] sm:text-[11px] font-bold">{pageCount}p</span>
          </button>
        )}

        {/* Mobile/Tablet Style Toggle */}
        {onToggleProperties && (
          <button
            type="button"
            onClick={onToggleProperties}
            className="lg:hidden min-h-[32px] sm:min-h-[36px] px-1.5 sm:px-2 py-1 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1 transition-colors"
            title="Open Style & Properties"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden xs:inline text-[10px] sm:text-[11px]">Style</span>
          </button>
        )}

        {/* Clear file button (desktop/tablet) */}
        <button
          type="button"
          onClick={onClearFile}
          className="hidden sm:flex min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] items-center justify-center px-2 py-1 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Clear and close document"
        >
          <X className="w-4 h-4" />
          <span className="hidden md:inline ml-1">Clear</span>
        </button>

        {/* Download Final PDF */}
        <button
          type="button"
          onClick={onSaveDownload}
          disabled={isSaving}
          className="min-h-[32px] sm:min-h-[38px] inline-flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm shadow-indigo-600/25 disabled:opacity-60 transition-all cursor-pointer shrink-0"
        >
          {isSaving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="hidden sm:inline">Saving...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Download<span className="hidden sm:inline"> PDF</span></span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
