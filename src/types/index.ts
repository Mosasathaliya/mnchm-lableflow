/**
 * Types for MNChem Label Studio
 */

export interface VariableField {
  id: string;
  name: string; // key / identifier e.g. "po", "customerPoNumber", "rigLocation"
  label: string; // user-visible label / prompt e.g. "PO", "Batch Number"
  type: 'text' | 'date' | 'number';
  // Coordinates in percentage (0 to 100%) of label canvas
  xPercent: number; // 0 to 100%
  yPercent: number; // 0 to 100%
  widthPercent: number; // width in %
  heightPercent?: number; // height in %
  fontFamily?: string; // Font family for box value rendering
  fontSize: number; // font size in pt (10 - 36)
  fontWeight: 'normal' | 'bold';
  fontColor: string; // Hex color
  bgColor?: string; // Box fill color
  borderColor?: string; // Box border color
  align: 'left' | 'center' | 'right';
  required: boolean;
  prefix?: string;
  placeholder?: string;
  maxLength?: number;
  defaultValue?: string;
  // Speciality Box Options:
  // Default is false: on final generated label, the box frame disappears and ONLY the typed value appears!
  showBoxFrame?: boolean;
  // Default is false: on final label, do not show "PO: ", only show the typed value e.g. "45009871"
  showLabelPrefix?: boolean;
}

export interface CanvasElement {
  id: string;
  type:
    | 'text'
    | 'image'
    | 'logo'
    | 'ghs-pictogram'
    | 'badge'
    | 'shape'
    | 'barcode'
    | 'nfpa-diamond'
    | 'ppe-symbol'
    | 'hazard-stripe'
    | 'qr-code'
    | 'divider'
    | 'container-box';
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent?: number;
  content?: string; // Text content, image data URL, badge text, pictogram key, or QR code data
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'medium' | 'bold' | 'black';
  fontColor?: string;
  bgColor?: string; // Fill color inside GHS pictograms, shapes, badges, or canvas
  borderColor?: string; // Border stroke color
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  align?: 'left' | 'center' | 'right';
  opacity?: number;
  zIndex?: number;
  label?: string; // optional label for inspector
  // NFPA 704 Diamond quadrant ratings:
  nfpaHealth?: number; // 0 - 4 (Blue)
  nfpaFlammability?: number; // 0 - 4 (Red)
  nfpaInstability?: number; // 0 - 4 (Yellow)
  nfpaSpecial?: string; // '', 'W', 'OX', 'SA', 'COR' (White)
  // PPE Symbol attributes:
  ppeSymbolType?: 'gloves' | 'suit' | 'boots' | 'mask' | 'ventilation' | 'no-sparks' | 'full-row';
  // Hazard stripe pattern:
  stripeStyle?: 'yellow-black' | 'red-white' | 'orange-black';
  // Divider orientation:
  orientation?: 'horizontal' | 'vertical';
  // QR code payload type:
  qrPayloadType?: 'batch' | 'po' | 'url' | 'custom';
}

export interface ArtworkElement extends CanvasElement {}

export interface ProductTemplate {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  density?: string;
  flashPoint?: string;
  hazardClass?: string;
  netWeight?: string;
  netVolume?: string;
  unNumber?: string;
  artworkType: 'vector' | 'image';
  artworkUrl?: string; // Base64 or stored URL for custom uploaded artwork/background
  customLogoUrl?: string; // Optional custom logo
  layoutPreset?: 'standard-split' | 'full-custom' | 'industrial-drum' | 'blank';
  isBlankCanvas?: boolean; // When true, starts from 100% blank slate
  canvasBgColor?: string; // Canvas background color (e.g. #ffffff)
  canvasBorder?: 'none' | 'thin' | 'industrial' | 'accent';
  canvasBorderColor?: string;
  status: 'active' | 'archived';
  fields: VariableField[]; // Pinned variable boxes!
  artworkElements?: CanvasElement[];
  internalNotes?: string;
  version: number;
  createdAt: number;
  updatedAt: number;
}

export interface OrderLabel {
  id: string;
  orderNumber: string; // e.g. ORD-2026-001
  templateId: string;
  templateVersion: number;
  productName: string;
  productCode: string;
  customerPoNumber: string;
  expiryDate: string; // YYYY-MM-DD
  batchNumber: string;
  manufacturingDate: string; // YYYY-MM-DD
  // Dynamic map of all custom boxes added by user to their values
  fieldValues?: Record<string, string>;
  status: 'Finalized' | 'Draft';
  pdfFileId?: string;
  pdfUrl?: string;
  pdfSizeBytes?: number;
  pageCount: number;
  createdAt: number;
  finalizedAt?: number;
  createdBy: string;
  notes?: string;
}

export interface AppSession {
  token: string;
  createdAt: number;
  expiresAt: number;
  isValid: boolean;
  ip?: string;
}

export interface AppSettings {
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'DD-MMM-YYYY';
  companyName: string;
  companyAddress: string;
  companyWebsite: string;
  defaultPageSize: 'A4';
  defaultOrientation: 'Landscape';
  autoPrintDialog: boolean;
}

export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: string;
}

export const AVAILABLE_FONTS: FontOption[] = [
  {
    id: 'sans',
    name: 'Standard Industrial Sans',
    family: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    category: 'Industrial Clean',
  },
  {
    id: 'condensed',
    name: 'DIN / Condensed Bold',
    family: '"Arial Narrow", "Franklin Gothic Medium", "DIN Alternate", "Trebuchet MS", sans-serif',
    category: 'Drum Specifications',
  },
  {
    id: 'mono',
    name: 'Industrial Monospace',
    family: '"Consolas", "Courier New", "Menlo", monospace',
    category: 'Batch & Lot Coding',
  },
  {
    id: 'impact',
    name: 'Impact / Heavy Display',
    family: '"Impact", "Arial Black", "Haettenschweiler", sans-serif',
    category: 'High Hazard Notice',
  },
  {
    id: 'tech',
    name: 'Technical Trebuchet',
    family: '"Trebuchet MS", "Lucida Sans Unicode", sans-serif',
    category: 'Product Title',
  },
  {
    id: 'serif',
    name: 'Gazette Regulatory Serif',
    family: '"Georgia", "Times New Roman", "Cambria", serif',
    category: 'Compliance & Legal',
  },
  {
    id: 'verdana',
    name: 'High-Legibility Verdana',
    family: '"Verdana", "Geneva", sans-serif',
    category: 'Fine Print & Instructions',
  },
  {
    id: 'courier',
    name: 'Typewriter / QC Stencil',
    family: '"Courier Prime", "Courier New", "Lucida Console", monospace',
    category: 'Inspection & QC',
  },
];

