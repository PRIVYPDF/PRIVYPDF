import JSZip from 'jszip';
import { loadPdfDocument, renderPageToImage } from './pdfRenderer';

export interface ExportImageResult {
  pageNum: number;
  fileName: string;
  dataUrl: string;
  blob: Blob;
}

export async function exportPdfPagesToImages(
  pdfBytes: ArrayBuffer,
  selectedPages: number[], // 1-based page numbers
  format: 'png' | 'jpeg' = 'png',
  dpiScale: number = 2.0,
  quality: number = 0.95,
  onProgress?: (current: number, total: number) => void
): Promise<ExportImageResult[]> {
  const pdfDoc = await loadPdfDocument(pdfBytes);
  const results: ExportImageResult[] = [];
  const ext = format === 'png' ? 'png' : 'jpg';

  for (let i = 0; i < selectedPages.length; i++) {
    const pageNum = selectedPages[i];
    const { dataUrl, blob } = await renderPageToImage(
      pdfDoc,
      pageNum,
      format,
      dpiScale,
      quality
    );

    results.push({
      pageNum,
      fileName: `page-${pageNum}.${ext}`,
      dataUrl,
      blob,
    });

    if (onProgress) {
      onProgress(i + 1, selectedPages.length);
    }
  }

  return results;
}

export async function createZipFromImages(
  images: ExportImageResult[],
  baseName: string = 'privypdf-images'
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(baseName) || zip;

  images.forEach(img => {
    folder.file(img.fileName, img.blob);
  });

  return await zip.generateAsync({ type: 'blob' });
}
