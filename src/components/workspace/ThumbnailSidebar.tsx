import React, { useState } from 'react';
import { PageInfo } from '../../types';
import { RotateCw, Trash2, Copy, Eye, GripVertical, CheckSquare, Square, X } from 'lucide-react';

interface ThumbnailSidebarProps {
  pages: PageInfo[];
  currentPageIndex: number;
  selectedPageIndices: number[];
  onSelectPage: (index: number) => void;
  onToggleSelectPage: (index: number) => void;
  onReorderPages: (fromIndex: number, toIndex: number) => void;
  onRotatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onDuplicatePage: (index: number) => void;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export const ThumbnailSidebar: React.FC<ThumbnailSidebarProps> = ({
  pages,
  currentPageIndex,
  selectedPageIndices,
  onSelectPage,
  onToggleSelectPage,
  onReorderPages,
  onRotatePage,
  onDeletePage,
  onDuplicatePage,
  isOpenOnMobile = false,
  onCloseMobile,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      onReorderPages(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white/70">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Page Navigation</span>
          <p className="text-[11px] text-slate-400 font-medium">{pages.length} {pages.length === 1 ? 'page' : 'pages'} total</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-100 border border-slate-200 hidden sm:block">
            Drag to reorder
          </div>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
              title="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {pages.map((page, index) => {
          const isCurrent = index === currentPageIndex;
          const isSelected = selectedPageIndices.includes(index);
          const isDraggingThis = draggedIndex === index;
          const isDragTarget = dragOverIndex === index;

          return (
            <div
              key={`${page.pageIndex}-${index}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onClick={() => {
                onSelectPage(index);
                if (onCloseMobile && window.innerWidth < 1024) {
                  onCloseMobile();
                }
              }}
              className={`group relative rounded-2xl p-2.5 transition-all duration-150 cursor-pointer ${
                isDraggingThis ? 'opacity-30 scale-95' : ''
              } ${
                isDragTarget ? 'border-t-4 border-indigo-600' : ''
              } ${
                isCurrent
                  ? 'bg-indigo-50/80 ring-2 ring-indigo-600 shadow-md shadow-indigo-500/10'
                  : 'bg-white hover:bg-slate-100/70 border border-slate-200/80 shadow-2xs'
              }`}
            >
              {/* Top Bar: Reorder Handle, Multi-select checkbox, Page number */}
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <div className="flex items-center gap-1.5">
                  <div
                    className="cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-500 p-0.5"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelectPage(index);
                    }}
                    className="text-slate-400 hover:text-indigo-600 transition-colors p-0.5 min-w-[24px] min-h-[24px] flex items-center justify-center"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                  <span className={`text-xs font-bold ${isCurrent ? 'text-indigo-700' : 'text-slate-700'}`}>
                    Page {index + 1}
                  </span>
                </div>

                {page.rotation > 0 && (
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                    {page.rotation}°
                  </span>
                )}
              </div>

              {/* Thumbnail Image Container */}
              <div className="relative w-full aspect-[1/1.414] bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex items-center justify-center checkerboard">
                {page.thumbnailUrl ? (
                  <img
                    src={page.thumbnailUrl}
                    alt={`Page ${index + 1}`}
                    className="w-full h-full object-contain transition-transform duration-200 pointer-events-none"
                    style={{ transform: `rotate(${page.rotation}deg)` }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                    <Eye className="w-5 h-5 text-slate-300 animate-pulse" />
                    <span>Rendering...</span>
                  </div>
                )}

                {/* Quick Actions Bar (Visible always on mobile or on hover on desktop) */}
                <div className="absolute inset-x-0 bottom-0 bg-slate-900/70 backdrop-blur-[2px] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRotatePage(index);
                    }}
                    className="p-1.5 rounded-lg bg-white/95 text-slate-700 hover:text-indigo-600 active:scale-95 shadow-sm transition-all min-w-[28px] min-h-[28px] flex items-center justify-center"
                    title="Rotate 90° Clockwise"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicatePage(index);
                    }}
                    className="p-1.5 rounded-lg bg-white/95 text-slate-700 hover:text-indigo-600 active:scale-95 shadow-sm transition-all min-w-[28px] min-h-[28px] flex items-center justify-center"
                    title="Duplicate Page"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {pages.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePage(index);
                      }}
                      className="p-1.5 rounded-lg bg-white/95 text-rose-600 hover:bg-rose-50 active:scale-95 shadow-sm transition-all min-w-[28px] min-h-[28px] flex items-center justify-center"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-50/80 border-r border-slate-200/90 flex-col h-full shrink-0 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile/Tablet Slide-out Drawer */}
      {isOpenOnMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={onCloseMobile}
          />
          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl z-50 flex flex-col animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
