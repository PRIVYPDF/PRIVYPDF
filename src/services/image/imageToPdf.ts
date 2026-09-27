import jsPDF from 'jspdf';

export interface ImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
  width: number;
  height: number;
}

export interface ImageToPdfOptions {
  pageSize: 'a4' | 'letter' | 'fit';
  orientation: 'portrait' | 'landscape' | 'auto';
  margin: 'none' | 'small' | 'medium';
  imageFit: 'contain' | 'cover' | 'stretch';
}

const PAGE_DIMENSIONS_MM = {
  a4: { portrait: [210, 297], landscape: [297, 210] },
  letter: { portrait: [215.9, 279.4], landscape: [279.4, 215.9] },
};

const MARGINS_MM = {
  none: 0,
  small: 10,
  medium: 20,
};

export async function convertImagesToPdf(
  images: ImageItem[],
  options: ImageToPdfOptions
): Promise<Uint8Array> {
  if (images.length === 0) {
    throw new Error('Please select at least one image');
  }

  let doc: jsPDF | null = null;

  for (let i = 0; i < images.length; i++) {
    const imgItem = images[i];
    const isLandscape = imgItem.width > imgItem.height;

    // Determine orientation
    let pageOrientation: 'portrait' | 'landscape' = 'portrait';
    if (options.orientation === 'auto') {
      pageOrientation = isLandscape ? 'landscape' : 'portrait';
    } else {
      pageOrientation = options.orientation;
    }

    // Determine dimensions in mm
    let pageWidthMm = 210;
    let pageHeightMm = 297;

    if (options.pageSize === 'fit') {
      // 1 px ~= 0.264583 mm at 96 dpi
      pageWidthMm = Math.max(50, imgItem.width * 0.264583);
      pageHeightMm = Math.max(50, imgItem.height * 0.264583);
    } else {
      const standard = PAGE_DIMENSIONS_MM[options.pageSize];
      [pageWidthMm, pageHeightMm] = standard[pageOrientation];
    }

    if (i === 0) {
      doc = new jsPDF({
        orientation: pageOrientation,
        unit: 'mm',
        format: options.pageSize === 'fit' ? [pageWidthMm, pageHeightMm] : options.pageSize,
      });
    } else {
      doc!.addPage(
        options.pageSize === 'fit' ? [pageWidthMm, pageHeightMm] : options.pageSize,
        pageOrientation
      );
    }

    const margin = MARGINS_MM[options.margin];
    const printableWidth = Math.max(10, pageWidthMm - margin * 2);
    const printableHeight = Math.max(10, pageHeightMm - margin * 2);

    let renderX = margin;
    let renderY = margin;
    let renderWidth = printableWidth;
    let renderHeight = printableHeight;

    if (options.imageFit === 'contain') {
      const imgAspect = imgItem.width / imgItem.height;
      const targetAspect = printableWidth / printableHeight;

      if (imgAspect > targetAspect) {
        // Image is wider relative to box
        renderWidth = printableWidth;
        renderHeight = printableWidth / imgAspect;
        renderY = margin + (printableHeight - renderHeight) / 2;
      } else {
        // Image is taller relative to box
        renderHeight = printableHeight;
        renderWidth = printableHeight * imgAspect;
        renderX = margin + (printableWidth - renderWidth) / 2;
      }
    } else if (options.imageFit === 'cover') {
      // Cover the available area
      renderWidth = printableWidth;
      renderHeight = printableHeight;
    }

    // Add image to page
    const format = imgItem.file.type.includes('png') ? 'PNG' : 'JPEG';
    doc!.addImage(
      imgItem.previewUrl,
      format,
      renderX,
      renderY,
      renderWidth,
      renderHeight
    );
  }

  const arrayBuffer = doc!.output('arraybuffer');
  return new Uint8Array(arrayBuffer);
}
