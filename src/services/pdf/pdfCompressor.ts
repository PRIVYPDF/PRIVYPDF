import { PDFDocument } from 'pdf-lib';
import { loadPdfDocument } from './pdfRenderer';

export interface CompressionOptions {
  level: 'extreme' | 'recommended' | 'low';
  imageQuality?: number; // 0.1 to 1.0
  dpiScale?: number;
}

export interface CompressionResult {
  compressedBytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  savedPercentage: number;
  isSmaller: boolean;
  notes?: string;
}

export async function compressPdfClientSide(
  pdfBytes: ArrayBuffer,
  options: CompressionOptions = { level: 'recommended' }
): Promise<CompressionResult> {
  const originalSize = pdfBytes.byteLength;

  // Configure parameters based on level
  let quality = 0.7;
  let scale = 1.35;

  if (options.level === 'extreme') {
    quality = 0.45;
    scale = 1.0;
  } else if (options.level === 'low') {
    quality = 0.88;
    scale = 1.75;
  }

  if (options.imageQuality !== undefined) {
    quality = options.imageQuality;
  }
  if (options.dpiScale !== undefined) {
    scale = options.dpiScale;
  }

  // 1. Try structural cleanup with pdf-lib first (stripping unreferenced objects)
  const sourceDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const structuralCleanBytes = await sourceDoc.save({ useObjectStreams: true });
  
  // 2. Render each page to compressed JPEG
  const pdfJsDoc = await loadPdfDocument(pdfBytes);
  const numPages = pdfJsDoc.numPages;

  const targetDoc = await PDFDocument.create();

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfJsDoc.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) continue;

    // @ts-expect-error pdfjs typings
    await page.render({ canvasContext: ctx, viewport }).promise;

    // Convert to compressed jpeg data url
    const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
    const base64 = jpegDataUrl.split(',')[1];
    const binary = atob(base64);
    const imgBytes = new Uint8Array(binary.length);
    for (let j = 0; j < binary.length; j++) {
      imgBytes[j] = binary.charCodeAt(j);
    }

    const embeddedImage = await targetDoc.embedJpg(imgBytes);
    // Standard PDF page size in points (width/scale, height/scale)
    const originalPtWidth = viewport.width / scale;
    const originalPtHeight = viewport.height / scale;

    const newPage = targetDoc.addPage([originalPtWidth, originalPtHeight]);
    newPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: originalPtWidth,
      height: originalPtHeight,
    });
  }

  const rasterCompressedBytes = await targetDoc.save({ useObjectStreams: true });

  // Compare structural clean vs raster compressed vs original
  let finalBytes = rasterCompressedBytes;
  let notes = '';

  if (rasterCompressedBytes.byteLength < originalSize) {
    finalBytes = rasterCompressedBytes;
  } else if (structuralCleanBytes.byteLength < originalSize) {
    finalBytes = structuralCleanBytes;
    notes = 'PDF was already vector-optimized. Stream structural compression applied.';
  } else {
    // If the PDF is mostly raw text with no heavy images, rasterization can increase size
    finalBytes = structuralCleanBytes;
    notes = 'This document already has optimal vector encoding without heavy bitmaps.';
  }

  const compressedSize = finalBytes.byteLength;
  const savedBytes = Math.max(0, originalSize - compressedSize);
  const savedPercentage = originalSize > 0 
    ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
    : 0;

  return {
    compressedBytes: finalBytes,
    originalSize,
    compressedSize,
    savedBytes,
    savedPercentage,
    isSmaller: compressedSize < originalSize,
    notes,
  };
}
