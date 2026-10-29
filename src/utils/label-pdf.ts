/**
 * A4 Landscape PDF Generator for MNChem Label Studio
 * Generates ISO A4 Landscape (297mm x 210mm = 841.89 x 595.28 points) PDF labels.
 * Supports:
 * - Blank Canvas mode with custom background colors, borders, and uploaded artwork
 * - Custom visual canvas elements (Text, Logos, GHS Pictograms, Shapes, Barcodes)
 * - Variable Box Tool: when showBoxFrame is false (default), only the typed value
 *   is rendered at the exact coordinate without any box frame or prompt label!
 */

import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import { ProductTemplate, OrderLabel, VariableField, CanvasElement } from '../types/index.ts';
import { formatLabelDate } from './validation.ts';

export const A4_LANDSCAPE_WIDTH = 841.89; // points
export const A4_LANDSCAPE_HEIGHT = 595.28; // points

export interface LabelPdfOptions {
  template: ProductTemplate;
  order: Partial<OrderLabel> & {
    customerPoNumber?: string;
    expiryDate?: string;
    batchNumber?: string;
    fieldValues?: Record<string, string>;
  };
  dateFormat?: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'DD-MMM-YYYY';
  includeCropMarks?: boolean;
  // High-resolution WYSIWYG canvas snapshot captured directly from browser DOM (100% visual match!)
  renderedCanvasDataUrl?: string;
}

/**
 * Calculates proportional fit for label within A4 landscape boundaries
 */
export function calculateLabelFit(
  contentWidth: number = 800,
  contentHeight: number = 550,
  pageWidth: number = A4_LANDSCAPE_WIDTH,
  pageHeight: number = A4_LANDSCAPE_HEIGHT,
  margin: number = 16
) {
  const availWidth = pageWidth - margin * 2;
  const availHeight = pageHeight - margin * 2;

  const scale = Math.min(availWidth / contentWidth, availHeight / contentHeight);
  const finalWidth = contentWidth * scale;
  const finalHeight = contentHeight * scale;

  const offsetX = margin + (availWidth - finalWidth) / 2;
  const offsetY = margin + (availHeight - finalHeight) / 2;

  return {
    scale,
    width: finalWidth,
    height: finalHeight,
    offsetX,
    offsetY,
    pageWidth,
    pageHeight,
  };
}

/**
 * Converts Hex string (#RRGGBB or #RGB) to pdf-lib rgb object
 */
export function hexToRgb(hex: string | undefined, defaultColor = rgb(0.04, 0.15, 0.32)) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    return defaultColor;
  }
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) / 255;
    const g = parseInt(clean[1] + clean[1], 16) / 255;
    const b = parseInt(clean[2] + clean[2], 16) / 255;
    return rgb(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b);
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    return rgb(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b);
  }
  return defaultColor;
}

/**
 * Generates an A4 Landscape PDF Document matching MNChem chemical packaging specs
 * with full support for custom blank canvases and seamless variable box values.
 */
export async function generateA4LabelPdf(options: LabelPdfOptions): Promise<{
  pdfBytes: Uint8Array;
  dataUrl: string;
  pageCount: number;
}> {
  const { template, order, dateFormat = 'DD/MM/YYYY' } = options;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`${template.name || 'MNChem Product'} Label - ${order.orderNumber || 'Draft'}`);
  pdfDoc.setAuthor('MNChem Label Studio');
  pdfDoc.setSubject(`Chemical Packaging Label for ${template.name || 'Industrial Product'}`);
  pdfDoc.setCreator('MNChem LabelFlow System');

  // Embed standard fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);
  const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const getMatchedFont = (family?: string, weight?: string): PDFFont => {
    const isBold = weight === 'bold' || weight === 'black' || weight === '900';
    if (!family) return isBold ? helveticaBold : helvetica;
    const lower = family.toLowerCase();
    if (lower.includes('mono') || lower.includes('courier') || lower.includes('consolas')) {
      return isBold ? courierBold : courier;
    }
    if (lower.includes('serif') || lower.includes('georgia') || lower.includes('times')) {
      return isBold ? timesRomanBold : timesRoman;
    }
    return isBold ? helveticaBold : helvetica;
  };

  // Exactly 1 page of A4 landscape (297 x 210 mm)
  const page = pdfDoc.addPage([A4_LANDSCAPE_WIDTH, A4_LANDSCAPE_HEIGHT]);

  const fit = calculateLabelFit(800, 550, A4_LANDSCAPE_WIDTH, A4_LANDSCAPE_HEIGHT, 15);
  const { offsetX, offsetY, width: lw, height: lh } = fit;

  // 0. HIGH-FIDELITY WYSIWYG EXPORT (100% VISUAL FIDELITY MATCH):
  // When high-resolution rendered DOM snapshot is provided from MNCleanLabelCanvas,
  // embed it directly to guarantee every font, SVG icon, color, and coordinate matches identically!
  if (options.renderedCanvasDataUrl && options.renderedCanvasDataUrl.startsWith('data:image/')) {
    try {
      const base64Data = options.renderedCanvasDataUrl.split(',')[1];
      const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      const embeddedImg = options.renderedCanvasDataUrl.includes('image/png')
        ? await pdfDoc.embedPng(imageBytes)
        : await pdfDoc.embedJpg(imageBytes);

      page.drawImage(embeddedImg, {
        x: offsetX,
        y: offsetY,
        width: lw,
        height: lh,
      });

      const pdfBytes = await pdfDoc.save();
      const binary = Array.from(pdfBytes).map((b) => String.fromCharCode(b)).join('');
      const dataUrl = `data:application/pdf;base64,${btoa(binary)}`;

      return {
        pdfBytes,
        dataUrl,
        pageCount: 1,
      };
    } catch (err) {
      console.warn('Failed to embed rendered canvas snapshot, continuing with vector drawing:', err);
    }
  }

  // Base Colors
  const navy = rgb(0.04, 0.15, 0.32);        // #071d3a
  const electricBlue = rgb(0.0, 0.64, 0.88); // #00a3e0
  const darkGray = rgb(0.2, 0.22, 0.25);
  const lightGray = rgb(0.96, 0.97, 0.98);
  const borderGray = rgb(0.82, 0.85, 0.89);
  const hazardRed = rgb(0.85, 0.12, 0.08);   // GHS Red
  const white = rgb(1, 1, 1);

  const isBlank = template.isBlankCanvas || template.layoutPreset === 'blank';
  const bgColor = hexToRgb(template.canvasBgColor, white);

  // 1. Draw Canvas Background
  page.drawRectangle({
    x: offsetX,
    y: offsetY,
    width: lw,
    height: lh,
    color: bgColor,
    borderColor: template.canvasBorderColor
      ? hexToRgb(template.canvasBorderColor, rgb(0, 0, 0))
      : template.canvasBorder === 'industrial'
      ? rgb(0, 0, 0)
      : template.canvasBorder === 'accent'
      ? electricBlue
      : borderGray,
    borderWidth:
      template.canvasBorder === 'none'
        ? 0
        : template.canvasBorder === 'industrial'
        ? 3.5
        : template.canvasBorder === 'accent'
        ? 3
        : 1.5,
  });

  // 2. Embed & Draw Uploaded Background Artwork (if provided)
  if (template.artworkUrl && template.artworkUrl.startsWith('data:image/')) {
    try {
      const base64Data = template.artworkUrl.split(',')[1];
      const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      if (template.artworkUrl.includes('image/png')) {
        const bgImg = await pdfDoc.embedPng(imageBytes);
        page.drawImage(bgImg, { x: offsetX, y: offsetY, width: lw, height: lh });
      } else {
        const bgImg = await pdfDoc.embedJpg(imageBytes);
        page.drawImage(bgImg, { x: offsetX, y: offsetY, width: lw, height: lh });
      }
    } catch (e) {
      console.warn('Could not embed custom background image into PDF:', e);
    }
  }

  // 3. BASE LAYOUT: STANDARD OR BLANK
  let contentTop = offsetY + lh - 90;

  if (!isBlank) {
    // STANDARD MNCHEM INDUSTRIAL SPLIT LAYOUT
    const headerHeight = lh * 0.16;
    const headerY = offsetY + lh - headerHeight;

    // Header Background
    page.drawRectangle({
      x: offsetX,
      y: headerY,
      width: lw,
      height: headerHeight,
      color: navy,
    });

    // Cyan stripe at bottom of header
    page.drawRectangle({
      x: offsetX,
      y: headerY,
      width: lw,
      height: 4,
      color: electricBlue,
    });

    // Brand Text
    page.drawText('MNChem', {
      x: offsetX + 24,
      y: headerY + headerHeight * 0.52,
      size: 26,
      font: helveticaBold,
      color: white,
    });

    page.drawText('MODERN NATIONAL CHEMICALS  |  INDUSTRIAL PACKAGING', {
      x: offsetX + 24,
      y: headerY + headerHeight * 0.24,
      size: 9,
      font: helvetica,
      color: electricBlue,
    });

    page.drawText('DAMMAM 2ND INDUSTRIAL CITY, KSA', {
      x: offsetX + lw - 260,
      y: headerY + headerHeight * 0.55,
      size: 9,
      font: helveticaBold,
      color: white,
    });
    page.drawText('ISO 9001:2015 CERTIFIED FACILITY  |  WWW.MN-CHEM.COM', {
      x: offsetX + lw - 260,
      y: headerY + headerHeight * 0.28,
      size: 8,
      font: helvetica,
      color: rgb(0.8, 0.85, 0.9),
    });

    // Product Title Bar
    const titleY = headerY - 54;
    page.drawText((template.name || 'PRODUCT NAME').toUpperCase(), {
      x: offsetX + 24,
      y: titleY,
      size: 28,
      font: helveticaBold,
      color: navy,
    });

    const subtitle = template.description || 'Wellbore Cleaning Solvent & Surfactant System';
    page.drawText(subtitle, {
      x: offsetX + 26,
      y: titleY - 18,
      size: 11,
      font: helvetica,
      color: electricBlue,
    });

    // Product Code Badge
    const codeText = `CODE: ${template.code || 'MNC-CLN-S01'}`;
    const codeWidth = helveticaBold.widthOfTextAtSize(codeText, 11) + 20;
    page.drawRectangle({
      x: offsetX + lw - codeWidth - 24,
      y: titleY - 10,
      width: codeWidth,
      height: 24,
      color: lightGray,
      borderColor: borderGray,
      borderWidth: 1,
    });
    page.drawText(codeText, {
      x: offsetX + lw - codeWidth - 14,
      y: titleY - 4,
      size: 11,
      font: helveticaBold,
      color: navy,
    });

    page.drawLine({
      start: { x: offsetX + 24, y: titleY - 26 },
      end: { x: offsetX + lw - 24, y: titleY - 26 },
      color: borderGray,
      thickness: 1,
    });

    // Left Column: Technical specs & GHS
    contentTop = titleY - 36;
    const leftX = offsetX + 24;
    let curY = contentTop;

    page.drawText('PRODUCT SPECIFICATIONS & IDENTIFICATION', {
      x: leftX,
      y: curY,
      size: 10,
      font: helveticaBold,
      color: navy,
    });
    curY -= 15;

    const specs = [
      `Appearance: Clear Amber Liquid`,
      `Specific Gravity @ 25°C: ${template.density || '0.985 - 1.015 g/cm³'}`,
      `Flash Point (PMCC): ${template.flashPoint || '> 65°C (> 149°F)'}`,
      `Hazard Class: ${template.hazardClass || 'Class 3 / Class 8 Combustible/Corrosive'}`,
      `UN / NA Number: ${template.unNumber || 'UN 1993, PG III'}`,
      `Net Weight / Drum: ${template.netWeight || '200 kg (~440 lbs)'}`,
    ];

    for (const spec of specs) {
      page.drawText(`• ${spec}`, {
        x: leftX + 4,
        y: curY,
        size: 8.5,
        font: helvetica,
        color: darkGray,
      });
      curY -= 13;
    }

    curY -= 8;

    // GHS Red Diamonds
    page.drawText('GHS HAZARD COMMUNICATION', {
      x: leftX,
      y: curY,
      size: 10,
      font: helveticaBold,
      color: navy,
    });
    curY -= 14;

    const diamondSize = 34;
    const diamondY = curY - diamondSize / 2;
    drawGhsDiamond(page, leftX + 22, diamondY, diamondSize, hazardRed, 'FLAME', helveticaBold);
    drawGhsDiamond(page, leftX + 78, diamondY, diamondSize, hazardRed, 'CORROSIVE', helveticaBold);
    drawGhsDiamond(page, leftX + 134, diamondY, diamondSize, hazardRed, 'HEALTH', helveticaBold);

    page.drawText('SIGNAL WORD:  DANGER', {
      x: leftX + 184,
      y: diamondY + 8,
      size: 12,
      font: helveticaBold,
      color: hazardRed,
    });

    page.drawText('Read Safety Data Sheet (SDS) before handling.', {
      x: leftX + 184,
      y: diamondY - 6,
      size: 7.5,
      font: helvetica,
      color: darkGray,
    });

    curY -= 48;

    // Hazard statements
    page.drawText('HAZARD STATEMENTS (CLP/GHS):', {
      x: leftX,
      y: curY,
      size: 8.5,
      font: helveticaBold,
      color: darkGray,
    });
    curY -= 12;

    const hazards = [
      'H227: Combustible liquid.',
      'H314: Causes severe skin burns and eye damage.',
      'H335: May cause respiratory irritation.',
    ];
    for (const h of hazards) {
      page.drawText(h, { x: leftX + 4, y: curY, size: 7.5, font: helvetica, color: darkGray });
      curY -= 10;
    }

    // Right Column Base Panel
    const rightColX = offsetX + lw * 0.52;
    const rightColY = offsetY + 34;
    const rightColW = lw * 0.45;
    const rightColH = contentTop - offsetY - 42;

    page.drawRectangle({
      x: rightColX,
      y: rightColY,
      width: rightColW,
      height: rightColH,
      color: lightGray,
      borderColor: navy,
      borderWidth: 2,
    });

    page.drawRectangle({
      x: rightColX,
      y: rightColY + rightColH - 30,
      width: rightColW,
      height: 30,
      color: navy,
    });

    page.drawText('ORDER & BATCH SPECIFICATION', {
      x: rightColX + 14,
      y: rightColY + rightColH - 20,
      size: 11,
      font: helveticaBold,
      color: white,
    });

    // Barcode at bottom of right column
    drawBarcode(page, rightColX + 16, rightColY + 16, rightColW - 32, 24, order.batchNumber || 'MNCHEM');

    // Footer Bar
    const footerY = offsetY + 8;
    page.drawLine({
      start: { x: offsetX + 24, y: footerY + 16 },
      end: { x: offsetX + lw - 24, y: footerY + 16 },
      color: borderGray,
      thickness: 1,
    });

    page.drawText('PRODUCED UNDER STRICT INDUSTRIAL QUALITY CONTROL  |  STORAGE: 15°C TO 35°C', {
      x: offsetX + 24,
      y: footerY + 5,
      size: 7.5,
      font: helveticaBold,
      color: navy,
    });
  }

  // 4. DRAW CUSTOM CANVAS ELEMENTS (Artwork / Text / Badges / Shapes)
  if (template.artworkElements && template.artworkElements.length > 0) {
    for (const elem of template.artworkElements) {
      const elemX = offsetX + (elem.xPercent / 100) * lw;
      // Convert top % to PDF bottom-up coordinate
      const elemY = offsetY + lh - (elem.yPercent / 100) * lh - ((elem.heightPercent || 10) / 100) * lh;
      const elemW = (elem.widthPercent / 100) * lw;
      const elemH = ((elem.heightPercent || 10) / 100) * lh;

      if (elem.type === 'text' && elem.content) {
        const font = getMatchedFont(elem.fontFamily, elem.fontWeight);
        const color = hexToRgb(elem.fontColor, navy);
        const fontSize = elem.fontSize || 14;
        const lines = elem.content.split('\n');
        const lineHeight = fontSize * 1.25;

        lines.forEach((line, lineIdx) => {
          let renderX = elemX;
          if (elem.align === 'center') {
            const w = font.widthOfTextAtSize(line, fontSize);
            renderX = elemX + Math.max(0, (elemW - w) / 2);
          } else if (elem.align === 'right') {
            const w = font.widthOfTextAtSize(line, fontSize);
            renderX = elemX + Math.max(0, elemW - w);
          }
          page.drawText(line, {
            x: renderX,
            y: elemY + elemH - (lineIdx + 1) * lineHeight,
            size: fontSize,
            font,
            color,
          });
        });
      } else if (elem.type === 'logo') {
        if (elem.content && elem.content.startsWith('data:image/')) {
          try {
            const base64 = elem.content.split(',')[1];
            const imgBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
            const img = elem.content.includes('image/png')
              ? await pdfDoc.embedPng(imgBytes)
              : await pdfDoc.embedJpg(imgBytes);
            page.drawImage(img, { x: elemX, y: elemY, width: elemW, height: elemH });
          } catch (e) {
            console.warn('Could not embed custom logo:', e);
          }
        } else {
          drawBrandLogo(page, elemX, elemY, elemW, elemH, helvetica, helveticaBold);
        }
      } else if (elem.type === 'badge' && elem.content) {
        const badgeBg = hexToRgb(elem.bgColor, hazardRed);
        page.drawRectangle({
          x: elemX,
          y: elemY,
          width: elemW,
          height: Math.max(18, elemH),
          color: badgeBg,
        });
        page.drawText(elem.content.toUpperCase(), {
          x: elemX + 6,
          y: elemY + 5,
          size: 9,
          font: helveticaBold,
          color: white,
        });
      } else if (elem.type === 'shape') {
        const shapeBg = hexToRgb(elem.bgColor, navy);
        page.drawRectangle({
          x: elemX,
          y: elemY,
          width: elemW,
          height: elemH,
          color: shapeBg,
        });
      } else if (elem.type === 'ghs-pictogram' && elem.content) {
        const diamondSize = Math.max(26, Math.min(elemW, elemH || elemW));
        const ghsBorderColor = hexToRgb(elem.borderColor, hazardRed);
        const ghsFillColor = elem.bgColor && elem.bgColor !== 'transparent' ? hexToRgb(elem.bgColor, white) : white;
        drawGhsDiamond(
          page,
          elemX + elemW / 2,
          elemY + elemH / 2,
          diamondSize,
          ghsBorderColor,
          ghsFillColor,
          elem.content.toUpperCase(),
          helveticaBold
        );
      } else if (elem.type === 'nfpa-diamond') {
        const diamondSize = Math.max(45, Math.min(elemW, elemH || elemW));
        drawNfpaDiamond(
          page,
          elemX + elemW / 2,
          elemY + elemH / 2,
          diamondSize,
          elem.nfpaFlammability !== undefined ? elem.nfpaFlammability : 2,
          elem.nfpaHealth !== undefined ? elem.nfpaHealth : 1,
          elem.nfpaInstability !== undefined ? elem.nfpaInstability : 1,
          elem.nfpaSpecial || '',
          helveticaBold
        );
      } else if (elem.type === 'ppe-symbol') {
        drawPpeSymbols(page, elemX, elemY + elemH * 0.2, elemW, Math.max(18, elemH * 0.6), helveticaBold);
      } else if (elem.type === 'image' && elem.content?.startsWith('data:image/')) {
        try {
          const base64 = elem.content.split(',')[1];
          const imgBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
          if (elem.content.includes('image/png')) {
            const img = await pdfDoc.embedPng(imgBytes);
            page.drawImage(img, { x: elemX, y: elemY, width: elemW, height: elemH });
          } else {
            const img = await pdfDoc.embedJpg(imgBytes);
            page.drawImage(img, { x: elemX, y: elemY, width: elemW, height: elemH });
          }
        } catch (e) {
          console.warn('Could not embed canvas element image:', e);
        }
      } else if (elem.type === 'barcode') {
        drawBarcode(page, elemX, elemY, elemW, Math.max(20, elemH), order.batchNumber || elem.content || 'MNCHEM');
      } else if (elem.type === 'hazard-stripe') {
        drawHazardStripe(page, elemX, elemY, elemW, Math.max(8, elemH), elem.stripeStyle || 'yellow-black');
      } else if (elem.type === 'qr-code') {
        const qrPayload = elem.content || order.batchNumber || order.customerPoNumber || 'https://mn-chem.com';
        drawQrCodePlaceholder(page, elemX, elemY, Math.min(elemW, elemH || elemW), qrPayload, helveticaBold);
      } else if (elem.type === 'divider') {
        drawDividerLine(
          page,
          elemX,
          elemY,
          elemW,
          elemH,
          elem.orientation || 'horizontal',
          elem.borderColor || '#cbd5e1',
          elem.borderWidth || 1.5
        );
      } else if (elem.type === 'container-box') {
        drawContainerBox(
          page,
          elemX,
          elemY,
          elemW,
          elemH,
          elem.bgColor,
          elem.borderColor,
          elem.borderWidth || 1
        );
      }
    }
  }

  // 5. THE SPECIALITY "BOX" TOOL DRAWING LAYER
  // =========================================================================
  // CRITICAL USER REQUIREMENT:
  // "the po i give the box because while generating order lab;es it shpw the
  // pop up as po not show in lable po the finl lable after genetating will
  // only have the number or any thing i typed i added it will be there insted of the box"
  //
  // IF showBoxFrame is false (the default):
  // We do NOT draw a box frame, border, or label name!
  // We draw ONLY the typed number / string directly at the exact box coordinates!
  // =========================================================================
  const customFields: VariableField[] = template.fields && template.fields.length > 0
    ? template.fields
    : [
        {
          id: 'fld-po',
          name: 'po',
          label: 'PO',
          type: 'text',
          xPercent: 56,
          yPercent: 32,
          widthPercent: 40,
          fontSize: 14,
          fontWeight: 'bold',
          fontColor: '#071d3a',
          align: 'left',
          required: true,
          showBoxFrame: false,
          showLabelPrefix: false,
        },
      ];

  for (const field of customFields) {
    // Determine the value for this box
    let val = '';
    if (order.fieldValues && order.fieldValues[field.id] !== undefined && order.fieldValues[field.id] !== '') {
      val = order.fieldValues[field.id];
    } else if (order.fieldValues && order.fieldValues[field.name] !== undefined && order.fieldValues[field.name] !== '') {
      val = order.fieldValues[field.name];
    } else if (field.name === 'po' || field.name === 'customerPoNumber' || field.id === 'fld-po') {
      val = order.customerPoNumber || '';
    } else if (field.name === 'batchNumber' || field.name === 'batch' || field.id === 'fld-batch') {
      val = order.batchNumber || '';
    } else if (field.name === 'expiryDate' || field.name === 'expiry' || field.id === 'fld-expiry') {
      val = order.expiryDate || '';
    }

    if (field.type === 'date' && val) {
      val = formatLabelDate(val, dateFormat);
    }

    // Convert coordinates:
    // xPercent (0..100) -> PDF X
    const boxX = offsetX + (field.xPercent / 100) * lw;
    // yPercent (0..100 from top) -> PDF Y (from bottom)
    const boxY = offsetY + lh - (field.yPercent / 100) * lh - 26;
    const boxW = Math.max(80, (field.widthPercent / 100) * lw);

    const textColor = hexToRgb(field.fontColor, navy);
    const font = getMatchedFont(field.fontFamily, field.fontWeight);
    const fontSize = field.fontSize || 14;

    if (field.showBoxFrame) {
      // User explicitly opted in to a visible container box with border
      drawCustomBox(
        page,
        helvetica,
        helveticaBold,
        boxX,
        boxY,
        boxW,
        field.label || field.name,
        val || 'NOT SPECIFIED',
        textColor,
        electricBlue,
        fontSize
      );
    } else {
      // SEAMLESS TEXT ONLY (DEFAULT - AS REQUESTED BY USER):
      // No box outline, no border, no background!
      // Only the typed value is placed at the exact coordinate!
      let displayText = val || '';
      if (field.showLabelPrefix) {
        displayText = `${field.label || field.name}: ${displayText}`;
      }

      if (displayText) {
        // Text width check and auto-scale if necessary
        let actualSize = fontSize;
        const textWidth = font.widthOfTextAtSize(displayText, actualSize);
        if (textWidth > boxW && actualSize > 8) {
          actualSize = Math.max(8, Math.floor((boxW / textWidth) * actualSize));
        }

        let renderX = boxX;
        if (field.align === 'center') {
          const w = font.widthOfTextAtSize(displayText, actualSize);
          renderX = boxX + Math.max(0, (boxW - w) / 2);
        } else if (field.align === 'right') {
          const w = font.widthOfTextAtSize(displayText, actualSize);
          renderX = boxX + Math.max(0, boxW - w);
        }

        page.drawText(displayText, {
          x: renderX,
          y: boxY + 4,
          size: actualSize,
          font,
          color: textColor,
        });
      }
    }
  }

  // Finalize PDF
  const pdfBytes = await pdfDoc.save();
  const binary = Array.from(pdfBytes)
    .map((b) => String.fromCharCode(b))
    .join('');
  const base64 = btoa(binary);
  const dataUrl = `data:application/pdf;base64,${base64}`;

  return {
    pdfBytes,
    dataUrl,
    pageCount: 1,
  };
}

/**
 * Draws a visible container box on the PDF when showBoxFrame is true
 */
function drawCustomBox(
  page: PDFPage,
  fontNormal: PDFFont,
  fontBold: PDFFont,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
  textColor: any,
  highlightColor: any,
  valueFontSize: number = 14
) {
  // Label name above box
  page.drawText(label.toUpperCase(), {
    x,
    y: y + 26,
    size: 8.5,
    font: fontBold,
    color: rgb(0.04, 0.15, 0.32),
  });

  // Value background box
  page.drawRectangle({
    x,
    y,
    width,
    height: 24,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.75, 0.8, 0.86),
    borderWidth: 1,
  });

  // Accent side indicator
  page.drawRectangle({
    x,
    y,
    width: 4,
    height: 24,
    color: highlightColor,
  });

  // Downscaling if text is long
  let actualSize = valueFontSize;
  const maxWidth = width - 18;
  const textWidth = fontBold.widthOfTextAtSize(value, actualSize);
  if (textWidth > maxWidth && actualSize > 8) {
    actualSize = Math.max(8, Math.floor((maxWidth / textWidth) * actualSize));
  }

  // Draw value text
  page.drawText(value, {
    x: x + 10,
    y: y + 6,
    size: actualSize,
    font: fontBold,
    color: textColor,
  });
}

function drawGhsDiamond(
  page: PDFPage,
  cx: number,
  cy: number,
  size: number,
  borderColor: any,
  fillColorOrLabel: any,
  labelOrFont: any,
  fontMaybe?: PDFFont
) {
  let fillColor = rgb(1, 1, 1);
  let label = '';
  let font: PDFFont;

  if (typeof fillColorOrLabel === 'string') {
    label = fillColorOrLabel;
    font = labelOrFont;
  } else {
    fillColor = fillColorOrLabel;
    label = labelOrFont;
    font = fontMaybe!;
  }

  const half = size / 2;
  const p1 = { x: cx, y: cy + half };
  const p2 = { x: cx + half, y: cy };
  const p3 = { x: cx, y: cy - half };
  const p4 = { x: cx - half, y: cy };

  // Fill diamond background with scanlines
  const step = 1;
  for (let dy = -half; dy <= half; dy += step) {
    const w = (1 - Math.abs(dy) / half) * size;
    page.drawLine({
      start: { x: cx - w / 2, y: cy + dy },
      end: { x: cx + w / 2, y: cy + dy },
      thickness: step + 0.5,
      color: fillColor,
    });
  }

  // Draw 4 outer diamond border lines
  page.drawLine({ start: p1, end: p2, thickness: 2.5, color: borderColor });
  page.drawLine({ start: p2, end: p3, thickness: 2.5, color: borderColor });
  page.drawLine({ start: p3, end: p4, thickness: 2.5, color: borderColor });
  page.drawLine({ start: p4, end: p1, thickness: 2.5, color: borderColor });

  const labelSize = Math.max(5, Math.min(9, size * 0.16));
  const tw = font.widthOfTextAtSize(label, labelSize);
  page.drawText(label, {
    x: cx - tw / 2,
    y: cy - labelSize / 3,
    size: labelSize,
    font,
    color: borderColor,
  });
}

function drawNfpaDiamond(
  page: PDFPage,
  cx: number,
  cy: number,
  size: number,
  flammability: number,
  health: number,
  instability: number,
  special: string,
  fontBold: PDFFont
) {
  const half = size / 2;

  // 1. Top quadrant (Flammability, Red)
  const redColor = rgb(0.93, 0.2, 0.2);
  for (let dy = 0; dy <= half; dy += 1) {
    const w = (1 - dy / half) * half;
    page.drawLine({
      start: { x: cx - w, y: cy + dy },
      end: { x: cx + w, y: cy + dy },
      thickness: 1.2,
      color: redColor,
    });
  }

  // 2. Left quadrant (Health, Blue)
  const blueColor = rgb(0.15, 0.45, 0.95);
  for (let dx = -half; dx <= 0; dx += 1) {
    const h = (1 - Math.abs(dx) / half) * half;
    page.drawLine({
      start: { x: cx + dx, y: cy - h },
      end: { x: cx + dx, y: cy + h },
      thickness: 1.2,
      color: blueColor,
    });
  }

  // 3. Right quadrant (Instability, Yellow)
  const yellowColor = rgb(0.98, 0.78, 0.1);
  for (let dx = 0; dx <= half; dx += 1) {
    const h = (1 - dx / half) * half;
    page.drawLine({
      start: { x: cx + dx, y: cy - h },
      end: { x: cx + dx, y: cy + h },
      thickness: 1.2,
      color: yellowColor,
    });
  }

  // 4. Bottom quadrant (Special, White)
  const whiteColor = rgb(1, 1, 1);
  for (let dy = -half; dy <= 0; dy += 1) {
    const w = (1 - Math.abs(dy) / half) * half;
    page.drawLine({
      start: { x: cx - w, y: cy + dy },
      end: { x: cx + w, y: cy + dy },
      thickness: 1.2,
      color: whiteColor,
    });
  }

  // Outer border & dividing cross lines in Black
  const blackColor = rgb(0, 0, 0);
  const pTop = { x: cx, y: cy + half };
  const pRight = { x: cx + half, y: cy };
  const pBottom = { x: cx, y: cy - half };
  const pLeft = { x: cx - half, y: cy };

  page.drawLine({ start: pTop, end: pRight, thickness: 2, color: blackColor });
  page.drawLine({ start: pRight, end: pBottom, thickness: 2, color: blackColor });
  page.drawLine({ start: pBottom, end: pLeft, thickness: 2, color: blackColor });
  page.drawLine({ start: pLeft, end: pTop, thickness: 2, color: blackColor });

  page.drawLine({ start: pLeft, end: pRight, thickness: 1.5, color: blackColor });
  page.drawLine({ start: pBottom, end: pTop, thickness: 1.5, color: blackColor });

  // Ratings Numbers
  const numSize = Math.max(8, Math.min(16, size * 0.22));
  // Top (Flammability)
  const flamStr = String(flammability);
  const flamW = fontBold.widthOfTextAtSize(flamStr, numSize);
  page.drawText(flamStr, {
    x: cx - flamW / 2,
    y: cy + half * 0.35,
    size: numSize,
    font: fontBold,
    color: blackColor,
  });

  // Left (Health)
  const healthStr = String(health);
  const healthW = fontBold.widthOfTextAtSize(healthStr, numSize);
  page.drawText(healthStr, {
    x: cx - half * 0.5 - healthW / 2,
    y: cy - numSize * 0.35,
    size: numSize,
    font: fontBold,
    color: blackColor,
  });

  // Right (Instability)
  const instStr = String(instability);
  const instW = fontBold.widthOfTextAtSize(instStr, numSize);
  page.drawText(instStr, {
    x: cx + half * 0.5 - instW / 2,
    y: cy - numSize * 0.35,
    size: numSize,
    font: fontBold,
    color: blackColor,
  });

  // Bottom (Special)
  if (special) {
    const specSize = Math.max(6, numSize * 0.8);
    const specW = fontBold.widthOfTextAtSize(special, specSize);
    page.drawText(special, {
      x: cx - specW / 2,
      y: cy - half * 0.65,
      size: specSize,
      font: fontBold,
      color: blackColor,
    });
  }
}

function drawPpeSymbols(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  fontBold: PDFFont
) {
  const blueColor = rgb(0.12, 0.25, 0.69);
  const redColor = rgb(0.86, 0.15, 0.15);
  const whiteColor = rgb(1, 1, 1);

  const symbols = [
    { type: 'circle', label: 'GLOVES', color: blueColor },
    { type: 'circle', label: 'SUIT', color: blueColor },
    { type: 'circle', label: 'BOOTS', color: blueColor },
    { type: 'circle', label: 'MASK', color: blueColor },
    { type: 'square', label: 'VENT', color: redColor },
    { type: 'square', label: 'SPARK', color: redColor },
  ];

  const itemSize = Math.min(height, width / 7);
  const gap = 3;

  symbols.forEach((sym, idx) => {
    const curX = x + idx * (itemSize + gap);
    if (sym.type === 'circle') {
      const radius = itemSize / 2;
      const cx = curX + radius;
      const cy = y + radius;
      page.drawCircle({
        x: cx,
        y: cy,
        size: radius,
        color: sym.color,
        borderColor: whiteColor,
        borderWidth: 1.5,
      });
      const txtSize = Math.max(4, radius * 0.45);
      const tw = fontBold.widthOfTextAtSize(sym.label, txtSize);
      page.drawText(sym.label, {
        x: cx - tw / 2,
        y: cy - txtSize / 3,
        size: txtSize,
        font: fontBold,
        color: whiteColor,
      });
    } else {
      page.drawRectangle({
        x: curX,
        y,
        width: itemSize,
        height: itemSize,
        color: sym.color,
        borderColor: whiteColor,
        borderWidth: 1.5,
      });
      const txtSize = Math.max(3.5, itemSize * 0.24);
      const tw = fontBold.widthOfTextAtSize(sym.label, txtSize);
      page.drawText(sym.label, {
        x: curX + (itemSize - tw) / 2,
        y: y + itemSize / 2 - txtSize / 3,
        size: txtSize,
        font: fontBold,
        color: whiteColor,
      });
    }
  });
}

function drawBrandLogo(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  font: PDFFont,
  fontBold: PDFFont
) {
  const burgundy = rgb(0.48, 0.1, 0.18);
  const royalBlue = rgb(0.12, 0.23, 0.54);
  const green = rgb(0, 0.53, 0.32);

  // Logo wordmark: mn (burgundy) + chem (royal blue)
  const logoSize = Math.min(26, Math.max(16, height * 0.6));
  page.drawText('mn', {
    x: x + width - 160,
    y: y + height * 0.45,
    size: logoSize,
    font: fontBold,
    color: burgundy,
  });
  const mnWidth = fontBold.widthOfTextAtSize('mn', logoSize);
  page.drawText('chem', {
    x: x + width - 160 + mnWidth,
    y: y + height * 0.45,
    size: logoSize,
    font: fontBold,
    color: royalBlue,
  });

  // Palm tree indicator
  page.drawRectangle({
    x: x + width - 35,
    y: y + height * 0.45,
    width: 4,
    height: logoSize,
    color: green,
  });
  page.drawCircle({
    x: x + width - 33,
    y: y + height * 0.45 + logoSize,
    size: 7,
    color: green,
  });

  // Subtitle
  page.drawText('MODERN NATIONAL CHEMICALS', {
    x: x + width - 160,
    y: y + height * 0.2,
    size: 7,
    font: fontBold,
    color: rgb(0.35, 0.4, 0.45),
  });
}

function drawBarcode(page: PDFPage, x: number, y: number, width: number, height: number, code: string) {
  const barCount = 42;
  const barWidth = width / (barCount * 1.5);
  const darkColor = rgb(0.1, 0.1, 0.12);

  for (let i = 0; i < barCount; i++) {
    const isThick = (i * 7 + 3) % 4 === 0;
    const w = isThick ? barWidth * 2 : barWidth;
    const curX = x + i * barWidth * 1.5;

    page.drawRectangle({
      x: curX,
      y,
      width: Math.min(w, x + width - curX),
      height,
      color: darkColor,
    });
  }
}

function drawHazardStripe(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  stripeStyle: 'yellow-black' | 'red-white' | 'orange-black' = 'yellow-black'
) {
  const isYellow = stripeStyle === 'yellow-black';
  const isRed = stripeStyle === 'red-white';
  const col1 = isYellow ? rgb(0.98, 0.78, 0.1) : isRed ? rgb(0.85, 0.12, 0.08) : rgb(0.95, 0.45, 0.1);
  const col2 = isRed ? rgb(1, 1, 1) : rgb(0.1, 0.1, 0.12);

  page.drawRectangle({ x, y, width, height, color: col1 });

  const stripeW = Math.max(6, height * 0.7);
  const total = Math.ceil((width + height) / (stripeW * 1.8));
  for (let i = -1; i < total; i++) {
    const sx = x + i * (stripeW * 1.8);
    page.drawLine({
      start: { x: Math.max(x, sx), y },
      end: { x: Math.min(x + width, sx + height), y: y + height },
      thickness: stripeW,
      color: col2,
    });
  }

  page.drawRectangle({
    x,
    y,
    width,
    height,
    borderColor: col2,
    borderWidth: 1,
  });
}

function drawDividerLine(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  orientation: 'horizontal' | 'vertical' = 'horizontal',
  colorHex: string = '#cbd5e1',
  borderWidth: number = 1.5
) {
  const color = hexToRgb(colorHex, rgb(0.7, 0.75, 0.8));
  if (orientation === 'vertical') {
    page.drawLine({
      start: { x: x + width / 2, y },
      end: { x: x + width / 2, y: y + height },
      thickness: borderWidth || 1.5,
      color,
    });
  } else {
    page.drawLine({
      start: { x, y: y + height / 2 },
      end: { x: x + width, y: y + height / 2 },
      thickness: borderWidth || 1.5,
      color,
    });
  }
}

function drawContainerBox(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  bgHex?: string,
  borderHex?: string,
  borderWidth: number = 1
) {
  const color = bgHex ? hexToRgb(bgHex, rgb(0.97, 0.98, 0.99)) : rgb(0.97, 0.98, 0.99);
  const borderColor = borderHex ? hexToRgb(borderHex, rgb(0.8, 0.83, 0.88)) : rgb(0.8, 0.83, 0.88);
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color,
    borderColor,
    borderWidth: borderWidth || 1,
  });
}

function drawQrCodePlaceholder(
  page: PDFPage,
  x: number,
  y: number,
  size: number,
  code: string,
  fontBold: PDFFont
) {
  const black = rgb(0.08, 0.08, 0.1);
  const white = rgb(1, 1, 1);

  page.drawRectangle({
    x,
    y,
    width: size,
    height: size,
    color: white,
    borderColor: black,
    borderWidth: 1.5,
  });

  const finderSize = size * 0.28;
  const drawFinder = (fx: number, fy: number) => {
    page.drawRectangle({ x: fx, y: fy, width: finderSize, height: finderSize, borderColor: black, borderWidth: 1.5 });
    const inSize = finderSize * 0.5;
    page.drawRectangle({
      x: fx + (finderSize - inSize) / 2,
      y: fy + (finderSize - inSize) / 2,
      width: inSize,
      height: inSize,
      color: black,
    });
  };

  drawFinder(x + 2, y + size - finderSize - 2);
  drawFinder(x + size - finderSize - 2, y + size - finderSize - 2);
  drawFinder(x + 2, y + 2);

  const gridCells = 5;
  const cellSize = (size - finderSize - 6) / gridCells;
  for (let r = 0; r < gridCells; r++) {
    for (let c = 0; c < gridCells; c++) {
      if ((r + c + (code.length % 3)) % 2 === 0) {
        page.drawRectangle({
          x: x + finderSize + 4 + c * cellSize,
          y: y + 2 + r * cellSize,
          width: cellSize * 0.85,
          height: cellSize * 0.85,
          color: black,
        });
      }
    }
  }

  const labelSize = Math.max(5, Math.min(8, size * 0.12));
  page.drawText('QR VERIFY', {
    x: x + 4,
    y: y - labelSize - 2,
    size: labelSize,
    font: fontBold,
    color: black,
  });
}

