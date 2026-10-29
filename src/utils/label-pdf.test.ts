import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLabelFit,
  generateA4LabelPdf,
  hexToRgb,
  A4_LANDSCAPE_WIDTH,
  A4_LANDSCAPE_HEIGHT,
} from './label-pdf.ts';
import { ProductTemplate } from '../types/index.ts';

const mockTemplate: ProductTemplate = {
  id: 'tmpl-mnclean-s',
  name: 'MNCLEAN S',
  code: 'MNC-CLN-S01',
  category: 'Wellbore Cleaning Solvent',
  description: 'Wellbore Cleaning Solvent & Surfactant System',
  density: '0.990 - 1.010 g/cm³',
  flashPoint: '> 65°C',
  hazardClass: 'Class 3 / 8',
  netWeight: '200 kg / Drum',
  unNumber: 'UN 1993, PG III',
  artworkType: 'vector',
  status: 'active',
  version: 1,
  fields: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

test('calculates correct A4 landscape fit without stretching', () => {
  const fit = calculateLabelFit(800, 550, A4_LANDSCAPE_WIDTH, A4_LANDSCAPE_HEIGHT, 15);

  assert.equal(fit.pageWidth, 841.89);
  assert.equal(fit.pageHeight, 595.28);
  assert.ok(fit.width <= A4_LANDSCAPE_WIDTH);
  assert.ok(fit.height <= A4_LANDSCAPE_HEIGHT);
  assert.ok(fit.offsetX >= 15);
  assert.ok(fit.offsetY >= 15);
});

test('generates valid 1-page A4 landscape PDF document with embedded values', async () => {
  const result = await generateA4LabelPdf({
    template: mockTemplate,
    order: {
      customerPoNumber: 'PO-ARAMCO-99881',
      expiryDate: '2028-10-31',
      batchNumber: 'MN-CLN-2610-B1',
      manufacturingDate: '2026-10-28',
      orderNumber: 'ORD-2026-1001',
    },
    dateFormat: 'DD/MM/YYYY',
  });

  assert.equal(result.pageCount, 1);
  assert.ok(result.pdfBytes.byteLength > 1000);
  assert.ok(result.dataUrl.startsWith('data:application/pdf;base64,'));

  // Check PDF signature '%PDF-'
  const header = String.fromCharCode(...result.pdfBytes.slice(0, 5));
  assert.equal(header, '%PDF-');
});

test('generates valid PDF from Blank Canvas with custom Box tool (seamless text-only placement)', async () => {
  const blankTemplate: ProductTemplate = {
    id: 'tmpl-blank-01',
    name: 'Custom Chemical Packaging',
    code: 'CUST-001',
    category: 'Custom Chemical',
    description: 'Bespoke customer packaging',
    artworkType: 'vector',
    isBlankCanvas: true,
    layoutPreset: 'blank',
    canvasBgColor: '#ffffff',
    status: 'active',
    version: 1,
    fields: [
      {
        id: 'box-po-1',
        name: 'po',
        label: 'PO',
        type: 'text',
        xPercent: 50,
        yPercent: 40,
        widthPercent: 40,
        fontSize: 16,
        fontWeight: 'bold',
        fontColor: '#071d3a',
        align: 'left',
        required: true,
        showBoxFrame: false, // Box speciality: seamless text only!
        showLabelPrefix: false,
      },
    ],
    artworkElements: [
      {
        id: 'txt-title',
        type: 'text',
        content: 'INDUSTRIAL SOLVENT BATCH',
        xPercent: 10,
        yPercent: 15,
        widthPercent: 80,
        fontSize: 22,
        fontWeight: 'bold',
        fontColor: '#071d3a',
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const result = await generateA4LabelPdf({
    template: blankTemplate,
    order: {
      customerPoNumber: '4500987123',
      fieldValues: {
        'box-po-1': '4500987123',
      },
      orderNumber: 'ORD-2026-BLANK-1',
    },
    dateFormat: 'DD/MM/YYYY',
  });

  assert.equal(result.pageCount, 1);
  assert.ok(result.pdfBytes.byteLength > 1000);
  const header = String.fromCharCode(...result.pdfBytes.slice(0, 5));
  assert.equal(header, '%PDF-');
});

test('generates valid PDF with GHS custom fill, NFPA 704 diamond, and PPE symbols', async () => {
  const customTemplate: ProductTemplate = {
    id: 'tmpl-mnclean-custom',
    name: 'MNCLEAN-S',
    code: '1001536912',
    category: 'Cleaning Solvent',
    description: 'Well-Bore Cleaning Solvent',
    artworkType: 'vector',
    isBlankCanvas: true,
    canvasBgColor: '#ffffff',
    canvasBorder: 'industrial',
    canvasBorderColor: '#000000',
    status: 'active',
    version: 1,
    fields: [
      {
        id: 'fld-po',
        name: 'po',
        label: 'PO#',
        type: 'text',
        xPercent: 2.5,
        yPercent: 42,
        widthPercent: 30,
        fontSize: 12,
        fontWeight: 'bold',
        fontColor: '#000000',
        align: 'left',
        required: true,
        showBoxFrame: false,
      },
    ],
    artworkElements: [
      {
        id: 'ghs-flame',
        type: 'ghs-pictogram',
        content: 'flame',
        xPercent: 35,
        yPercent: 46,
        widthPercent: 7,
        bgColor: '#fee2e2', // custom light red fill!
        borderColor: '#dc2626',
      },
      {
        id: 'elem-nfpa',
        type: 'nfpa-diamond',
        xPercent: 64,
        yPercent: 34,
        widthPercent: 20,
        nfpaFlammability: 2,
        nfpaHealth: 1,
        nfpaInstability: 1,
        nfpaSpecial: '',
      },
      {
        id: 'elem-ppe',
        type: 'ppe-symbol',
        xPercent: 60,
        yPercent: 82,
        widthPercent: 30,
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const result = await generateA4LabelPdf({
    template: customTemplate,
    order: {
      customerPoNumber: '4508208158',
      fieldValues: {
        'fld-po': 'PO#: 4508208158',
      },
      orderNumber: 'ORD-MNCLEAN-1',
    },
    dateFormat: 'DD/MM/YYYY',
  });

  assert.equal(result.pageCount, 1);
  assert.ok(result.pdfBytes.byteLength > 1000);
  const header = String.fromCharCode(...result.pdfBytes.slice(0, 5));
  assert.equal(header, '%PDF-');
});

test('hexToRgb parses standard colors and falls back reliably', () => {
  const red = hexToRgb('#ff0000');
  assert.equal(red.red, 1);
  assert.equal(red.green, 0);
  assert.equal(red.blue, 0);

  const fallback = hexToRgb('invalid');
  assert.ok(fallback.red !== undefined);
});

test('generates valid PDF with new tools: hazard-stripe, qr-code, divider, container-box', async () => {
  const newToolsTemplate: ProductTemplate = {
    id: 'tmpl-new-tools',
    name: 'MNCLEAN ADVANCED',
    code: '1001536999',
    category: 'Solvent',
    description: 'Advanced wellbore cleaner',
    artworkType: 'vector',
    isBlankCanvas: true,
    canvasBgColor: '#ffffff',
    status: 'active',
    version: 1,
    fields: [
      {
        id: 'box-po',
        name: 'po',
        label: 'PO',
        type: 'text',
        xPercent: 10,
        yPercent: 40,
        widthPercent: 30,
        fontSize: 14,
        fontWeight: 'bold',
        fontColor: '#000000',
        align: 'left',
        required: true,
      },
    ],
    artworkElements: [
      {
        id: 'elem-stripe',
        type: 'hazard-stripe',
        stripeStyle: 'yellow-black',
        xPercent: 0,
        yPercent: 0,
        widthPercent: 100,
        heightPercent: 4,
      },
      {
        id: 'elem-qr',
        type: 'qr-code',
        qrPayloadType: 'batch',
        xPercent: 80,
        yPercent: 65,
        widthPercent: 15,
        heightPercent: 20,
      },
      {
        id: 'elem-divider',
        type: 'divider',
        orientation: 'horizontal',
        xPercent: 5,
        yPercent: 50,
        widthPercent: 90,
        heightPercent: 1,
        borderColor: '#000000',
        borderWidth: 2,
      },
      {
        id: 'elem-card',
        type: 'container-box',
        content: 'SPECIFICATIONS',
        xPercent: 50,
        yPercent: 20,
        widthPercent: 45,
        heightPercent: 40,
        bgColor: '#f8fafc',
        borderColor: '#cbd5e1',
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const result = await generateA4LabelPdf({
    template: newToolsTemplate,
    order: {
      customerPoNumber: 'PO-991122',
      batchNumber: 'MN-BATCH-202610-09',
      orderNumber: 'ORD-NEW-TOOLS',
    },
    dateFormat: 'DD/MM/YYYY',
  });

  assert.equal(result.pageCount, 1);
  assert.ok(result.pdfBytes.byteLength > 1000);
  const header = String.fromCharCode(...result.pdfBytes.slice(0, 5));
  assert.equal(header, '%PDF-');
});

test('generates valid PDF when WYSIWYG renderedCanvasDataUrl is provided', async () => {
  // 1x1 transparent PNG data URL
  const samplePngDataUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const result = await generateA4LabelPdf({
    template: mockTemplate,
    order: {
      customerPoNumber: 'PO-WYSIWYG-01',
      orderNumber: 'ORD-WYSIWYG',
    },
    renderedCanvasDataUrl: samplePngDataUrl,
  });

  assert.equal(result.pageCount, 1);
  assert.ok(result.pdfBytes.byteLength > 500);
  const header = String.fromCharCode(...result.pdfBytes.slice(0, 5));
  assert.equal(header, '%PDF-');
});

