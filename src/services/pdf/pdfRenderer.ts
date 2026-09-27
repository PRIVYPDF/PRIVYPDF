import * as pdfjsLib from 'pdfjs-dist';

// Set up the PDF.js worker
if (typeof window !== 'undefined') {
  try {
    // Attempt local worker or CDN fallback
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF.js worker setup warning:', e);
  }
}

export interface RenderPageOptions {
  scale?: number;
  rotation?: number;
}

/**
 * Loads a PDF document from an ArrayBuffer or Uint8Array
 */
export async function loadPdfDocument(data: ArrayBuffer | Uint8Array) {
  const loadingTask = pdfjsLib.getDocument({
    data: data instanceof ArrayBuffer ? new Uint8Array(data) : data,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
    cMapPacked: true,
  });
  return await loadingTask.promise;
}

/**
 * Renders a specific page to an HTML Canvas
 */
export async function renderPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number, // 1-based
  canvas: HTMLCanvasElement,
  options: RenderPageOptions = {}
): Promise<{ width: number; height: number }> {
  const page = await pdfDoc.getPage(pageNumber);
  const scale = options.scale || 1.5;
  const rotation = options.rotation !== undefined ? options.rotation : page.rotate;
  
  const viewport = page.getViewport({ scale, rotation });
  
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not get 2D canvas context');
  }
  
  // Clear canvas before drawing
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };
  
  // @ts-expect-error pdfjs typings
  await page.render(renderContext).promise;
  
  return {
    width: viewport.width,
    height: viewport.height,
  };
}

/**
 * Generates a thumbnail DataURL for a specific page
 */
export async function renderPageThumbnail(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number = 0.35,
  rotation?: number
): Promise<string> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ 
    scale, 
    rotation: rotation !== undefined ? rotation : page.rotate 
  });
  
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  const context = canvas.getContext('2d');
  if (!context) return '';
  
  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };
  
  // @ts-expect-error pdfjs typings
  await page.render(renderContext).promise;
  return canvas.toDataURL('image/jpeg', 0.85);
}

/**
 * Extracts thumbnails for all pages in a document
 */
export async function extractAllThumbnails(
  data: ArrayBuffer | Uint8Array,
  scale: number = 0.35
): Promise<string[]> {
  const pdfDoc = await loadPdfDocument(data);
  const numPages = pdfDoc.numPages;
  const thumbnails: string[] = [];
  
  for (let i = 1; i <= numPages; i++) {
    const thumb = await renderPageThumbnail(pdfDoc, i, scale);
    thumbnails.push(thumb);
  }
  
  return thumbnails;
}

/**
 * Renders page to high-res image data URL (PNG/JPEG)
 */
export async function renderPageToImage(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  format: 'png' | 'jpeg' = 'png',
  dpiScale: number = 2.0,
  quality: number = 0.95
): Promise<{ dataUrl: string; blob: Blob }> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: dpiScale });
  
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Cannot get canvas context');
  
  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };
  
  // @ts-expect-error pdfjs typings
  await page.render(renderContext).promise;
  
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const dataUrl = canvas.toDataURL(mimeType, quality);
  
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b || new Blob([])), mimeType, quality);
  });
  
  return { dataUrl, blob };
}
