import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { Annotation, TextAnnotation, DrawingAnnotation, HighlightAnnotation, ShapeAnnotation, ImageAnnotation, SignatureAnnotation, WatermarkAnnotation } from '../../types';

/**
 * Helper to convert hex color (#rrggbb) to pdf-lib rgb(r, g, b)
 */
export function hexToRgb(hex: string) {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16) || 0;
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return rgb(r, g, b);
}

/**
 * Creates a sample demo PDF for instant testing
 */
export async function createSamplePdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Page 1 - Welcome
  const page1 = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page1.getSize();

  // Top header bar
  page1.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: rgb(0.31, 0.27, 0.89), // Indigo 600
  });

  page1.drawText('PrivyPDF', {
    x: 48,
    y: height - 60,
    size: 28,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page1.drawText('Your PDFs. Your Device. Your Privacy.', {
    x: 48,
    y: height - 85,
    size: 13,
    font: font,
    color: rgb(0.85, 0.88, 1),
  });

  page1.drawText('Private Client-Side PDF Workspace', {
    x: 48,
    y: height - 160,
    size: 18,
    font: fontBold,
    color: rgb(0.12, 0.14, 0.2),
  });

  const bodyLines = [
    'Welcome to PrivyPDF! This document was generated 100% locally in your browser.',
    '',
    'Features to try right now:',
    '• Reorder, rotate, or delete pages in the left sidebar',
    '• Add text notes, freehand drawing, or highlight paragraphs',
    '• Draw or upload your electronic signature',
    '• Stamp custom diagonal watermarks',
    '• Split, merge, compress, or export to high-res images',
    '',
    'Notice: No files are ever sent to a remote server. Your data stays on your machine.'
  ];

  let yPos = height - 200;
  for (const line of bodyLines) {
    page1.drawText(line, {
      x: 48,
      y: yPos,
      size: 12,
      font: line.startsWith('•') ? fontBold : font,
      color: rgb(0.2, 0.25, 0.35),
    });
    yPos -= 22;
  }

  // Visual card box
  page1.drawRectangle({
    x: 48,
    y: yPos - 120,
    width: width - 96,
    height: 100,
    borderColor: rgb(0.8, 0.85, 0.95),
    borderWidth: 1.5,
    color: rgb(0.96, 0.97, 1),
  });

  page1.drawText('🔒 Verified Local Execution Sandbox', {
    x: 68,
    y: yPos - 55,
    size: 14,
    font: fontBold,
    color: rgb(0.15, 0.55, 0.35),
  });

  page1.drawText('Files are parsed into memory via WebAssembly and JavaScript Canvas APIs.', {
    x: 68,
    y: yPos - 80,
    size: 10,
    font: font,
    color: rgb(0.3, 0.35, 0.45),
  });

  // Page 2 - Contract sample to sign
  const page2 = doc.addPage([595.28, 841.89]);
  page2.drawText('Sample Document & Signature Section', {
    x: 48,
    y: height - 80,
    size: 20,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25),
  });

  page2.drawText('Page 2 of 2 - Demonstration Page', {
    x: 48,
    y: height - 105,
    size: 11,
    font: font,
    color: rgb(0.5, 0.55, 0.65),
  });

  page2.drawText('You can use the signature tool in the top toolbar to draw or upload your signature,', {
    x: 48,
    y: height - 160,
    size: 11,
    font: font,
    color: rgb(0.3, 0.35, 0.4),
  });

  page2.drawText('then place it accurately in the signature block below.', {
    x: 48,
    y: height - 180,
    size: 11,
    font: font,
    color: rgb(0.3, 0.35, 0.4),
  });

  // Signature box
  page2.drawRectangle({
    x: 48,
    y: height - 360,
    width: 250,
    height: 120,
    borderColor: rgb(0.75, 0.8, 0.9),
    borderWidth: 1,
    color: rgb(0.98, 0.99, 1),
  });

  page2.drawLine({
    start: { x: 68, y: height - 320 },
    end: { x: 278, y: height - 320 },
    thickness: 1,
    color: rgb(0.6, 0.65, 0.75),
  });

  page2.drawText('Authorized Signature', {
    x: 68,
    y: height - 340,
    size: 10,
    font: fontBold,
    color: rgb(0.4, 0.45, 0.55),
  });

  page2.drawText('Date: ____________________', {
    x: 340,
    y: height - 320,
    size: 11,
    font: font,
    color: rgb(0.3, 0.35, 0.4),
  });

  return await doc.save();
}

/**
 * Reorders and applies rotations to pages in a PDF
 */
export async function reorderAndRotatePages(
  pdfBytes: ArrayBuffer,
  pageInfos: { originalIndex: number; rotation: number }[]
): Promise<Uint8Array> {
  const sourceDoc = await PDFDocument.load(pdfBytes);
  const newDoc = await PDFDocument.create();

  const originalIndices = pageInfos.map(p => p.originalIndex);
  const copiedPages = await newDoc.copyPages(sourceDoc, originalIndices);

  copiedPages.forEach((page, index) => {
    const targetRotation = pageInfos[index].rotation || 0;
    // Current page rotation + target rotation
    const currentRot = page.getRotation().angle;
    page.setRotation(degrees((currentRot + targetRotation) % 360));
    newDoc.addPage(page);
  });

  return await newDoc.save();
}

/**
 * Deletes specified page indices from PDF
 */
export async function deletePagesFromPdf(
  pdfBytes: ArrayBuffer,
  pagesToDeleteIndices: number[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes);
  const numPages = doc.getPageCount();

  if (pagesToDeleteIndices.length >= numPages) {
    throw new Error('Cannot delete all pages in document. At least one page must remain.');
  }

  // Sort descending so deleting doesn't shift earlier indices
  const sorted = [...new Set(pagesToDeleteIndices)].sort((a, b) => b - a);
  for (const pageIdx of sorted) {
    if (pageIdx >= 0 && pageIdx < doc.getPageCount()) {
      doc.removePage(pageIdx);
    }
  }

  return await doc.save();
}

/**
 * Merges multiple PDF ArrayBuffers into one
 */
export async function mergePdfs(pdfBuffers: ArrayBuffer[]): Promise<Uint8Array> {
  const mergedDoc = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const doc = await PDFDocument.load(buffer);
    const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
    copiedPages.forEach(page => mergedDoc.addPage(page));
  }

  return await mergedDoc.save();
}

/**
 * Extracts a subset of page indices into a new PDF
 */
export async function extractPages(
  pdfBytes: ArrayBuffer,
  pageIndicesToExtract: number[]
): Promise<Uint8Array> {
  const sourceDoc = await PDFDocument.load(pdfBytes);
  const newDoc = await PDFDocument.create();

  const copiedPages = await newDoc.copyPages(sourceDoc, pageIndicesToExtract);
  copiedPages.forEach(page => newDoc.addPage(page));

  return await newDoc.save();
}

/**
 * Splits PDF into individual page buffers
 */
export async function splitPdfIntoIndividualPages(
  pdfBytes: ArrayBuffer
): Promise<{ pageNum: number; bytes: Uint8Array }[]> {
  const sourceDoc = await PDFDocument.load(pdfBytes);
  const count = sourceDoc.getPageCount();
  const results: { pageNum: number; bytes: Uint8Array }[] = [];

  for (let i = 0; i < count; i++) {
    const singleDoc = await PDFDocument.create();
    const [page] = await singleDoc.copyPages(sourceDoc, [i]);
    singleDoc.addPage(page);
    const bytes = await singleDoc.save();
    results.push({ pageNum: i + 1, bytes });
  }

  return results;
}

/**
 * Rotates all pages by a given delta angle (90, 180, 270)
 */
export async function rotateAllPages(
  pdfBytes: ArrayBuffer,
  angleDelta: number
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes);
  const pages = doc.getPages();

  pages.forEach(page => {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angleDelta) % 360));
  });

  return await doc.save();
}

/**
 * Watermarks a PDF document
 */
export async function addWatermarkToPdf(
  pdfBytes: ArrayBuffer,
  config: {
    text: string;
    fontSize: number;
    color: string;
    opacity: number;
    rotation: number;
    position: 'diagonal' | 'center' | 'top' | 'bottom';
    pageIndices?: number[];
  }
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();
  const c = hexToRgb(config.color);

  const targetIndices = config.pageIndices !== undefined 
    ? config.pageIndices 
    : pages.map((_, i) => i);

  targetIndices.forEach(idx => {
    if (idx < 0 || idx >= pages.length) return;
    const page = pages[idx];
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(config.text, config.fontSize);
    const textHeight = font.heightAtSize(config.fontSize);

    let x = (width - textWidth) / 2;
    let y = (height - textHeight) / 2;
    let rot = config.rotation;

    if (config.position === 'diagonal') {
      rot = 45;
      x = (width - textWidth * 0.707) / 2;
      y = (height - textHeight * 0.707) / 2;
    } else if (config.position === 'top') {
      y = height - 100;
    } else if (config.position === 'bottom') {
      y = 60;
    }

    page.drawText(config.text, {
      x,
      y,
      size: config.fontSize,
      font,
      color: c,
      opacity: Math.max(0.05, Math.min(1, config.opacity)),
      rotate: degrees(rot),
    });
  });

  return await doc.save();
}

/**
 * Applies all user workspace annotations (drawings, texts, signatures, images, shapes)
 * directly into the PDF vector and raster layers
 */
export async function applyAnnotationsToPdf(
  pdfBytes: ArrayBuffer,
  annotations: Annotation[],
  pageRotations: Record<number, number> = {}
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes);
  const pages = doc.getPages();
  const helveticaFont = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const helveticaObliqueFont = await doc.embedFont(StandardFonts.HelveticaOblique);
  const timesFont = await doc.embedFont(StandardFonts.TimesRoman);
  const courierFont = await doc.embedFont(StandardFonts.Courier);

  // Apply rotations first if any
  Object.entries(pageRotations).forEach(([pageIdxStr, rot]) => {
    const pIdx = parseInt(pageIdxStr, 10);
    if (pIdx >= 0 && pIdx < pages.length && rot) {
      const current = pages[pIdx].getRotation().angle;
      pages[pIdx].setRotation(degrees((current + rot) % 360));
    }
  });

  // Group annotations by page
  for (const annotation of annotations) {
    const pageIdx = annotation.pageIndex;
    if (pageIdx < 0 || pageIdx >= pages.length) continue;

    const page = pages[pageIdx];
    const { width: pWidth, height: pHeight } = page.getSize();

    if (annotation.type === 'text') {
      const a = annotation as TextAnnotation;
      let selectedFont = helveticaFont;
      if (a.fontFamily === 'serif') selectedFont = timesFont;
      else if (a.fontFamily === 'mono') selectedFont = courierFont;
      else if (a.bold) selectedFont = helveticaBoldFont;
      else if (a.italic) selectedFont = helveticaObliqueFont;

      // In browser canvas (x, y) is from top-left.
      // In PDF, y is from bottom-left!
      const pdfX = (a.x / 100) * pWidth;
      const pdfY = pHeight - ((a.y / 100) * pHeight) - (a.fontSize || 16);

      const color = hexToRgb(a.color || '#000000');
      page.drawText(a.text || '', {
        x: pdfX,
        y: pdfY,
        size: a.fontSize || 16,
        font: selectedFont,
        color: color,
      });
    } else if (annotation.type === 'drawing') {
      const a = annotation as DrawingAnnotation;
      if (a.points && a.points.length > 1) {
        const color = hexToRgb(a.color || '#000000');
        const thickness = a.strokeWidth || 2;
        const opacity = a.opacity || 1;

        for (let i = 0; i < a.points.length - 1; i++) {
          const p1 = a.points[i];
          const p2 = a.points[i + 1];

          const startX = (p1.x / 100) * pWidth;
          const startY = pHeight - ((p1.y / 100) * pHeight);
          const endX = (p2.x / 100) * pWidth;
          const endY = pHeight - ((p2.y / 100) * pHeight);

          page.drawLine({
            start: { x: startX, y: startY },
            end: { x: endX, y: endY },
            thickness: thickness,
            color: color,
            opacity: opacity,
          });
        }
      }
    } else if (annotation.type === 'highlight') {
      const a = annotation as HighlightAnnotation;
      const pdfX = (a.x / 100) * pWidth;
      const boxW = (a.width / 100) * pWidth;
      const boxH = (a.height / 100) * pHeight;
      const pdfY = pHeight - ((a.y / 100) * pHeight) - boxH;

      page.drawRectangle({
        x: pdfX,
        y: pdfY,
        width: boxW,
        height: boxH,
        color: hexToRgb(a.color || '#ffeb3b'),
        opacity: a.opacity || 0.35,
      });
    } else if (annotation.type === 'shape') {
      const a = annotation as ShapeAnnotation;
      const pdfX = (a.x / 100) * pWidth;
      const boxW = (a.width / 100) * pWidth;
      const boxH = (a.height / 100) * pHeight;
      const pdfY = pHeight - ((a.y / 100) * pHeight) - boxH;

      const strokeCol = hexToRgb(a.strokeColor || '#3b82f6');
      const hasFill = a.fillColor && a.fillColor !== 'transparent';
      const fillCol = hasFill ? hexToRgb(a.fillColor) : undefined;

      if (a.shapeType === 'rectangle') {
        page.drawRectangle({
          x: pdfX,
          y: pdfY,
          width: boxW,
          height: boxH,
          borderColor: strokeCol,
          borderWidth: a.strokeWidth || 2,
          color: fillCol,
        });
      } else if (a.shapeType === 'circle') {
        page.drawEllipse({
          x: pdfX + boxW / 2,
          y: pdfY + boxH / 2,
          xScale: boxW / 2,
          yScale: boxH / 2,
          borderColor: strokeCol,
          borderWidth: a.strokeWidth || 2,
          color: fillCol,
        });
      } else if (a.shapeType === 'line' || a.shapeType === 'arrow') {
        page.drawLine({
          start: { x: pdfX, y: pdfY + boxH },
          end: { x: pdfX + boxW, y: pdfY },
          thickness: a.strokeWidth || 2,
          color: strokeCol,
        });
      }
    } else if (annotation.type === 'image' || annotation.type === 'signature') {
      const a = annotation as (ImageAnnotation | SignatureAnnotation);
      if (a.dataUrl) {
        try {
          const isPng = a.dataUrl.startsWith('data:image/png');
          const base64Data = a.dataUrl.split(',')[1];
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const embeddedImage = isPng 
            ? await doc.embedPng(bytes) 
            : await doc.embedJpg(bytes);

          const pdfX = (a.x / 100) * pWidth;
          const boxW = (a.width / 100) * pWidth;
          const boxH = (a.height / 100) * pHeight;
          const pdfY = pHeight - ((a.y / 100) * pHeight) - boxH;

          page.drawImage(embeddedImage, {
            x: pdfX,
            y: pdfY,
            width: boxW,
            height: boxH,
          });
        } catch (err) {
          console.warn('Failed embedding image or signature into PDF:', err);
        }
      }
    } else if (annotation.type === 'watermark') {
      const a = annotation as WatermarkAnnotation;
      const textWidth = helveticaBoldFont.widthOfTextAtSize(a.text, a.fontSize || 36);
      const textHeight = helveticaBoldFont.heightAtSize(a.fontSize || 36);
      let x = (pWidth - textWidth) / 2;
      let y = (pHeight - textHeight) / 2;

      page.drawText(a.text, {
        x,
        y,
        size: a.fontSize || 36,
        font: helveticaBoldFont,
        color: hexToRgb(a.color || '#94a3b8'),
        opacity: a.opacity || 0.2,
        rotate: degrees(a.rotation || 45),
      });
    }
  }

  return await doc.save();
}
