export type ToolMode = 
  | 'select' 
  | 'text' 
  | 'draw' 
  | 'highlight' 
  | 'shape' 
  | 'image' 
  | 'signature' 
  | 'watermark' 
  | 'erase';

export type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow';

export interface BaseAnnotation {
  id: string;
  pageIndex: number;
  type: string;
}

export interface TextAnnotation extends BaseAnnotation {
  type: 'text';
  x: number; // percentage (0 to 100) or pixels relative to page
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
}

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingAnnotation extends BaseAnnotation {
  type: 'drawing';
  points: DrawingPoint[];
  color: string;
  strokeWidth: number;
  opacity: number;
}

export interface HighlightAnnotation extends BaseAnnotation {
  type: 'highlight';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
}

export interface ShapeAnnotation extends BaseAnnotation {
  type: 'shape';
  shapeType: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
}

export interface ImageAnnotation extends BaseAnnotation {
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  dataUrl: string;
}

export interface SignatureAnnotation extends BaseAnnotation {
  type: 'signature';
  x: number;
  y: number;
  width: number;
  height: number;
  dataUrl: string;
}

export interface WatermarkAnnotation extends BaseAnnotation {
  type: 'watermark';
  text: string;
  fontSize: number;
  color: string;
  opacity: number;
  rotation: number; // in degrees
  position: 'diagonal' | 'center' | 'top' | 'bottom';
}

export type Annotation = 
  | TextAnnotation 
  | DrawingAnnotation 
  | HighlightAnnotation 
  | ShapeAnnotation 
  | ImageAnnotation 
  | SignatureAnnotation 
  | WatermarkAnnotation;

export interface PageInfo {
  pageIndex: number; // original index
  displayNumber: number;
  rotation: number; // 0, 90, 180, 270
  width: number;
  height: number;
  thumbnailUrl?: string;
}

export interface PdfDocumentState {
  file: File | null;
  fileName: string;
  fileSize: number;
  arrayBuffer: ArrayBuffer | null;
  pageCount: number;
  pages: PageInfo[];
  currentPageIndex: number;
}

export interface HistoryState {
  pages: PageInfo[];
  annotations: Annotation[];
}
