import React, { useRef, useState, useEffect } from 'react';
import { ProductTemplate, VariableField, CanvasElement } from '../types/index.ts';
import { formatLabelDate } from '../utils/validation.ts';
import {
  Move,
  Trash2,
  Flame,
  AlertTriangle,
  Skull,
  Biohazard,
  ShieldAlert,
  Droplet,
  CheckCircle,
  QrCode as QrIcon,
} from 'lucide-react';

const QrCodeRenderer: React.FC<{ payload: string; className?: string }> = ({ payload, className }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    import('qrcode')
      .then((QRCode) => {
        QRCode.toDataURL(payload || 'https://mn-chem.com', {
          margin: 1,
          width: 256,
          color: { dark: '#000000', light: '#ffffff' },
        })
          .then((url: string) => {
            if (isMounted) setDataUrl(url);
          })
          .catch(() => {});
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [payload]);

  if (!dataUrl) {
    return (
      <div className="w-full h-full bg-white border border-slate-300 p-1 flex flex-col items-center justify-center font-mono text-[8px] text-slate-500">
        <QrIcon className="w-4 h-4 text-slate-400 mb-0.5" />
        <span className="truncate max-w-full text-[6.5px]">QR CODE</span>
      </div>
    );
  }

  return (
    <div className={`w-full h-full bg-white p-0.5 rounded shadow-xs flex items-center justify-center ${className || ''}`}>
      <img src={dataUrl} alt="QR Code" className="w-full h-full object-contain" />
    </div>
  );
};

interface MNCleanLabelCanvasProps {
  template: ProductTemplate;
  customerPoNumber?: string;
  expiryDate?: string;
  batchNumber?: string;
  manufacturingDate?: string;
  fieldValues?: Record<string, string>;
  dateFormat?: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'DD-MMM-YYYY';
  activeFieldId?: string | null;
  activeElementId?: string | null;
  onSelectField?: (field: VariableField) => void;
  onSelectElement?: (element: CanvasElement) => void;
  onUpdateFieldPosition?: (fieldId: string, xPercent: number, yPercent: number) => void;
  onUpdateElementPosition?: (elementId: string, xPercent: number, yPercent: number) => void;
  onDeleteField?: (fieldId: string) => void;
  onDeleteElement?: (elementId: string) => void;
  interactive?: boolean;
  showGrid?: boolean;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
  canvasId?: string;
}

export const MNCleanLabelCanvas: React.FC<MNCleanLabelCanvasProps> = ({
  template,
  customerPoNumber = '',
  expiryDate = '',
  batchNumber = '',
  manufacturingDate = new Date().toISOString().split('T')[0],
  fieldValues = {},
  dateFormat = 'DD/MM/YYYY',
  activeFieldId,
  activeElementId,
  onSelectField,
  onSelectElement,
  onUpdateFieldPosition,
  onUpdateElementPosition,
  onDeleteField,
  onDeleteElement,
  interactive = false,
  showGrid = false,
  canvasRef,
  canvasId = 'mnchem-label-canvas',
}) => {
  const localContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = canvasRef || localContainerRef;
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const isBlank = template.isBlankCanvas || template.layoutPreset === 'blank';

  // Fallback default fields if template has none
  const fields: VariableField[] = template.fields && template.fields.length > 0
    ? template.fields
    : [
        {
          id: 'fld-po',
          name: 'customerPoNumber',
          label: 'Customer PO Number',
          type: 'text',
          xPercent: 55,
          yPercent: 32,
          widthPercent: 40,
          fontSize: 14,
          fontWeight: 'bold',
          fontColor: '#0a2652',
          align: 'left',
          required: true,
          showBoxFrame: false,
          showLabelPrefix: false,
        },
        {
          id: 'fld-batch',
          name: 'batchNumber',
          label: 'Batch / Lot Number',
          type: 'text',
          xPercent: 55,
          yPercent: 50,
          widthPercent: 40,
          fontSize: 14,
          fontWeight: 'bold',
          fontColor: '#0a2652',
          align: 'left',
          required: true,
          showBoxFrame: false,
          showLabelPrefix: false,
        },
        {
          id: 'fld-expiry',
          name: 'expiryDate',
          label: 'Expiry Date (VAL / EXP)',
          type: 'date',
          xPercent: 55,
          yPercent: 68,
          widthPercent: 40,
          fontSize: 14,
          fontWeight: 'bold',
          fontColor: '#d91e18',
          align: 'left',
          required: true,
          showBoxFrame: false,
          showLabelPrefix: false,
        },
      ];

  const artworkElements: CanvasElement[] = template.artworkElements || [];

  // Helper to get value of field
  const getFieldValue = (field: VariableField): string => {
    if (fieldValues[field.id] !== undefined && fieldValues[field.id] !== '') {
      return fieldValues[field.id];
    }
    if (fieldValues[field.name] !== undefined && fieldValues[field.name] !== '') {
      return fieldValues[field.name];
    }
    if (field.name === 'customerPoNumber' || field.id === 'fld-po') return customerPoNumber;
    if (field.name === 'batchNumber' || field.id === 'fld-batch') return batchNumber;
    if (field.name === 'expiryDate' || field.id === 'fld-expiry') {
      return expiryDate ? formatLabelDate(expiryDate, dateFormat) : '';
    }
    if (field.type === 'date' && fieldValues[field.id]) {
      return formatLabelDate(fieldValues[field.id], dateFormat);
    }
    return '';
  };

  // Mouse Drag handlers for positioning boxes in Designer
  const handleBoxMouseDown = (e: React.MouseEvent, field: VariableField) => {
    if (!interactive) return;
    e.stopPropagation();
    setDraggingId(field.id);
    if (onSelectField) onSelectField(field);

    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const xPx = moveEvent.clientX - rect.left;
      const yPx = moveEvent.clientY - rect.top;

      let xPercent = Math.round((xPx / rect.width) * 100);
      let yPercent = Math.round((yPx / rect.height) * 100);

      // Clamp within boundaries
      xPercent = Math.max(0, Math.min(95 - (field.widthPercent || 25), xPercent));
      yPercent = Math.max(0, Math.min(92, yPercent));

      if (onUpdateFieldPosition) {
        onUpdateFieldPosition(field.id, xPercent, yPercent);
      }
    };

    const handleMouseUp = () => {
      setDraggingId(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Mouse Drag handlers for positioning canvas elements (text, image, shape)
  const handleElementMouseDown = (e: React.MouseEvent, elem: CanvasElement) => {
    if (!interactive) return;
    e.stopPropagation();
    setDraggingId(elem.id);
    if (onSelectElement) onSelectElement(elem);

    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const xPx = moveEvent.clientX - rect.left;
      const yPx = moveEvent.clientY - rect.top;

      let xPercent = Math.round((xPx / rect.width) * 100);
      let yPercent = Math.round((yPx / rect.height) * 100);

      xPercent = Math.max(0, Math.min(98 - (elem.widthPercent || 15), xPercent));
      yPercent = Math.max(0, Math.min(95, yPercent));

      if (onUpdateElementPosition) {
        onUpdateElementPosition(elem.id, xPercent, yPercent);
      }
    };

    const handleMouseUp = () => {
      setDraggingId(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Border class based on user configuration
  const getBorderClasses = () => {
    if (template.canvasBorder === 'none') return '';
    if (template.canvasBorder === 'thin') return 'border border-slate-300';
    if (template.canvasBorder === 'accent') return 'border-4 border-[#00a3e0]';
    return 'border-2 border-slate-400'; // industrial default
  };

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      {/* Outer A4 Landscape Container (297 x 210 mm) */}
      <div
        ref={containerRef}
        id={canvasId}
        className={`w-full rounded shadow-2xl overflow-hidden relative ${getBorderClasses()}`}
        style={{
          aspectRatio: '841.89 / 595.28',
          maxWidth: '1000px',
          backgroundColor: template.canvasBgColor || '#ffffff',
        }}
      >
        {/* Alignment Grid Overlay in Designer */}
        {interactive && showGrid && (
          <div
            className="absolute inset-0 pointer-events-none z-15 opacity-40"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0, 163, 224, 0.35) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 163, 224, 0.35) 1px, transparent 1px)
              `,
              backgroundSize: '10% 10%',
            }}
          />
        )}

        {/* 1. Custom Uploaded Background Image / Artwork (if uploaded) */}
        {template.artworkUrl && (
          <img
            src={template.artworkUrl}
            alt="Label Artwork"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
          />
        )}

        {/* 2. BASE LAYOUT: STANDARD OR BLANK CANVAS */}
        {!isBlank ? (
          /* STANDARD MNCHEM INDUSTRIAL LAYOUT */
          <div className="absolute inset-2 border border-slate-300 bg-white/95 flex flex-col justify-between overflow-hidden pointer-events-none z-0">
            {/* Header Bar */}
            <div className="bg-[#071d3a] text-white px-5 py-2.5 relative border-b-4 border-[#00a3e0] shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={template.customLogoUrl || '/logo.png'}
                    alt="MNChem"
                    className="h-9 w-9 object-contain bg-white/10 rounded p-0.5 border border-white/20"
                  />
                  <div>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="font-black text-xl tracking-tight text-white">MNChem</span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#00a3e0]">
                        Modern National Chemicals
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-300 font-medium tracking-wide">
                      INDUSTRIAL OILFIELD & SPECIALTY CHEMICAL PACKAGING
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[9px] font-bold text-white tracking-wider">
                    DAMMAM 2ND INDUSTRIAL CITY, KSA
                  </p>
                  <p className="text-[8.5px] text-[#00a3e0] font-medium">
                    ISO 9001:2015 CERTIFIED FACILITY • WWW.MN-CHEM.COM
                  </p>
                </div>
              </div>
            </div>

            {/* Product Title Bar */}
            <div className="px-5 py-2 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#071d3a] tracking-tight flex items-center gap-2">
                  <span>{template.name || 'PRODUCT NAME'}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded">
                    OFFICIAL ARTWORK
                  </span>
                </h1>
                <p className="text-[11px] font-bold text-[#00a3e0] tracking-wide mt-0.5">
                  {template.description || 'Wellbore Cleaning Solvent & Surfactant System'}
                </p>
              </div>

              <div className="text-right">
                <div className="inline-block bg-[#071d3a] text-white text-[11px] font-mono font-bold px-3 py-0.5 rounded shadow-sm border border-slate-700">
                  CODE: {template.code || 'MNC-001'}
                </div>
                <p className="text-[8.5px] text-slate-500 font-semibold mt-0.5">
                  CATEGORY: {template.category || 'Specialty Chemical'}
                </p>
              </div>
            </div>

            {/* Two Column Layout: Left Column specs & hazards */}
            <div className="px-5 py-2 flex-1 grid grid-cols-12 gap-4 overflow-hidden relative">
              <div className="col-span-6 flex flex-col justify-between text-slate-800 pr-2 border-r border-slate-200">
                <div>
                  <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-[#071d3a] mb-1 flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#00a3e0] rounded-full mr-1.5 inline-block"></span>
                    Chemical Specifications & Technical Data
                  </h3>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200">
                    <div>• Appearance: <span className="font-semibold text-slate-900">Clear Amber Liquid</span></div>
                    <div>• Specific Gravity: <span className="font-semibold text-slate-900">{template.density || '0.985 - 1.015'}</span></div>
                    <div>• Flash Point: <span className="font-semibold text-slate-900">{template.flashPoint || '> 65°C'}</span></div>
                    <div>• Net Weight: <span className="font-semibold text-slate-900">{template.netWeight || '200 kg / Drum'}</span></div>
                    <div>• Net Volume: <span className="font-semibold text-slate-900">{template.netVolume || '200 L'}</span></div>
                    <div>• UN/NA Number: <span className="font-semibold text-slate-900">{template.unNumber || 'UN 1993, PG III'}</span></div>
                  </div>
                </div>

                {/* GHS Hazard Section */}
                <div className="my-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                      GHS Hazard Communication (CLP/OSHA)
                    </h3>
                    <span className="bg-rose-100 text-rose-800 text-[8.5px] font-black px-1.5 py-0.5 rounded border border-rose-300">
                      SIGNAL WORD: DANGER
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-rose-50/50 p-1.5 rounded border border-rose-200">
                    <div className="flex space-x-1.5 shrink-0">
                      <div className="w-6 h-6 rotate-45 border-2 border-rose-600 bg-white flex items-center justify-center shadow-sm">
                        <span className="-rotate-45 text-[7px] font-black text-rose-700 leading-none">FLAME</span>
                      </div>
                      <div className="w-6 h-6 rotate-45 border-2 border-rose-600 bg-white flex items-center justify-center shadow-sm">
                        <span className="-rotate-45 text-[7px] font-black text-rose-700 leading-none">CORR</span>
                      </div>
                      <div className="w-6 h-6 rotate-45 border-2 border-rose-600 bg-white flex items-center justify-center shadow-sm">
                        <span className="-rotate-45 text-[7px] font-black text-rose-700 leading-none">TOXIC</span>
                      </div>
                    </div>

                    <div className="text-[8px] text-slate-700 space-y-0.5 pl-2 border-l border-rose-200">
                      <p className="font-bold text-slate-900">• H227: Combustible liquid.</p>
                      <p className="font-bold text-slate-900">• H314: Causes severe skin burns and eye damage.</p>
                      <p className="font-bold text-slate-900">• H335: May cause respiratory irritation.</p>
                    </div>
                  </div>
                </div>

                <div className="text-[8px] text-slate-600 space-y-0.5 bg-slate-50 p-1 rounded border border-slate-200">
                  <p><strong className="text-slate-800">Precautionary:</strong> P210: Keep away from flames. P280: Wear protective gloves & eye protection. P305+P351+P338: In eyes: Rinse cautiously with water.</p>
                </div>
              </div>

              {/* Right Column: Base area for variables */}
              <div className="col-span-6 bg-slate-50/70 border-2 border-[#071d3a] rounded-lg p-2 flex flex-col justify-between">
                <div className="bg-[#071d3a] text-white px-3 py-1 rounded flex items-center justify-between">
                  <span className="font-extrabold text-[10px] tracking-wider uppercase">
                    Order & Batch Specification
                  </span>
                  <span className="text-[8px] font-semibold text-[#00a3e0]">
                    {interactive ? 'DRAG & DROP BOXES HERE' : 'VARIABLE DATA LAYER'}
                  </span>
                </div>

                <div className="flex-1 min-h-[140px]" />

                {/* Barcode representation */}
                <div className="pt-1 border-t border-slate-200 text-center">
                  <div className="h-5 flex items-center justify-center space-x-[2px] opacity-80 overflow-hidden">
                    {Array.from({ length: 44 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-slate-900"
                        style={{
                          width: i % 3 === 0 ? '3px' : '1.5px',
                          height: '100%',
                          opacity: i % 7 === 0 ? 0.3 : 1,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[7.5px] font-mono font-semibold text-slate-500 tracking-wider">
                    *{batchNumber || 'MNCHEM-LOT-SPEC'}*
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Bar */}
            <div className="bg-slate-100 border-t border-slate-300 px-5 py-1 text-[8px] text-slate-600 flex items-center justify-between shrink-0">
              <span className="font-semibold text-[#071d3a]">
                PRODUCED UNDER STRICT QUALITY CONTROL • STORAGE: 15°C TO 35°C IN ORIGINAL SEALED CONTAINER
              </span>
              <span className="font-mono text-[7.5px] text-slate-500">
                A4 LANDSCAPE (297 x 210 mm) • 100% SCALE VERIFIED
              </span>
            </div>
          </div>
        ) : (
          /* BLANK CANVAS WATERMARK/GRID IN DESIGNER */
          interactive && artworkElements.length === 0 && !template.artworkUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl max-w-md">
                <span className="text-xs font-bold text-[#071d3a] block">🎨 Blank Label Canvas</span>
                <span className="text-[11px] text-slate-600 block mt-1">
                  Use the toolbar to upload images, add brand logos, insert GHS safety pictograms, text, and place <strong>Box</strong> tools for order variables (PO, Batch, etc.).
                </span>
              </div>
            </div>
          )
        )}

        {/* 3. CUSTOM CANVAS ELEMENTS LAYER (Images, Logos, GHS Pictograms, Badges, Text) */}
        {artworkElements.map((elem) => {
          const isSelected = activeElementId === elem.id;
          return (
            <div
              key={elem.id}
              onMouseDown={(e) => handleElementMouseDown(e, elem)}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectElement) onSelectElement(elem);
              }}
              className={`absolute ${
                interactive
                  ? 'cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-[#00a3e0]'
                  : ''
              } ${isSelected ? 'ring-2 ring-[#00a3e0] z-25' : 'z-10'}`}
              style={{
                left: `${elem.xPercent}%`,
                top: `${elem.yPercent}%`,
                width: elem.widthPercent ? `${elem.widthPercent}%` : 'auto',
                height: elem.heightPercent ? `${elem.heightPercent}%` : 'auto',
                opacity: elem.opacity !== undefined ? elem.opacity : 1,
              }}
            >
              {/* Image / Graphic element */}
              {elem.type === 'image' && elem.content && (
                <img
                  src={elem.content}
                  alt={elem.label || 'Artifact'}
                  className="w-full h-full object-contain pointer-events-none rounded"
                />
              )}

              {/* Logo element */}
              {elem.type === 'logo' && (
                elem.content ? (
                  <img
                    src={elem.content}
                    alt="Brand Logo"
                    className="w-full h-full object-contain pointer-events-none"
                  />
                ) : (
                  /* High fidelity SVG rendition of the official MNChem logo with palm tree and Arabic typography */
                  <div className="w-full flex items-center justify-end select-none">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center space-x-2">
                        <span className="text-3xl font-black italic tracking-tighter text-[#7a1a2e]">
                          mn<span className="text-[#1e3a8a]">chem</span>
                        </span>
                        {/* Palm tree symbol */}
                        <svg className="w-9 h-9 text-[#008751]" viewBox="0 0 36 36" fill="currentColor">
                          <path d="M18 14c-1 0-2 4-2 18h4c0-14-1-18-2-18z" fill="#008751" />
                          <path d="M18 14c-2-5-8-7-14-5 5 3 8 7 11 9" fill="none" stroke="#008751" strokeWidth="2.5" strokeLinecap="round" />
                          <path d="M18 14c2-5 8-7 14-5-5 3-8 7-11 9" fill="none" stroke="#008751" strokeWidth="2.5" strokeLinecap="round" />
                          <path d="M18 11c-1-6-6-8-11-7 4 4 6 8 8 11" fill="none" stroke="#008751" strokeWidth="2.5" strokeLinecap="round" />
                          <path d="M18 11c1-6 6-8 11-7-4 4-6 8-8 11" fill="none" stroke="#008751" strokeWidth="2.5" strokeLinecap="round" />
                          <path d="M18 8c0-5-2-7-4-8 1 3 2 6 2 9" fill="none" stroke="#008751" strokeWidth="2" strokeLinecap="round" />
                          <path d="M18 8c0-5 2-7 4-8-1 3-2 6-2 9" fill="none" stroke="#008751" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 tracking-wider text-right -mt-1 font-sans">
                        المصنع الوطني الحديث للكيماويات
                      </span>
                      <span className="text-[7.5px] font-extrabold uppercase text-slate-600 tracking-widest text-right">
                        MODERN NATIONAL CHEMICALS
                      </span>
                    </div>
                  </div>
                )
              )}

              {/* Text element */}
              {elem.type === 'text' && (
                <div
                  className="w-full break-words select-text whitespace-pre-line"
                  style={{
                    fontSize: `${elem.fontSize || 14}px`,
                    fontWeight: elem.fontWeight || 'normal',
                    color: elem.fontColor || '#071d3a',
                    textAlign: elem.align || 'left',
                    fontFamily: elem.fontFamily || 'inherit',
                    backgroundColor: elem.bgColor || 'transparent',
                    borderColor: elem.borderColor || 'transparent',
                    borderWidth: elem.borderWidth ? `${elem.borderWidth}px` : '0px',
                    borderRadius: elem.borderRadius ? `${elem.borderRadius}px` : '0px',
                    padding: elem.bgColor ? '2px 6px' : '0',
                    lineHeight: 1.25,
                  }}
                >
                  {elem.content || 'Sample Text'}
                </div>
              )}

              {/* GHS Pictogram artifact with customizable fill and border color */}
              {elem.type === 'ghs-pictogram' && (
                <div
                  className="w-full aspect-square rotate-45 flex items-center justify-center shadow-sm transition-all"
                  style={{
                    backgroundColor: elem.bgColor || '#ffffff',
                    borderColor: elem.borderColor || '#dc2626',
                    borderWidth: elem.borderWidth ? `${elem.borderWidth}px` : '3px',
                    borderStyle: 'solid',
                  }}
                >
                  <div
                    className="-rotate-45 w-full h-full flex items-center justify-center p-1.5"
                    style={{ color: elem.fontColor || elem.borderColor || '#dc2626' }}
                  >
                    {elem.content === 'flame' && <Flame className="w-full h-full max-w-[80%] max-h-[80%]" />}
                    {elem.content === 'corrosive' && <Droplet className="w-full h-full max-w-[80%] max-h-[80%]" />}
                    {elem.content === 'toxic' && <Skull className="w-full h-full max-w-[80%] max-h-[80%]" />}
                    {elem.content === 'health' && <Biohazard className="w-full h-full max-w-[80%] max-h-[80%]" />}
                    {elem.content === 'warning' && <AlertTriangle className="w-full h-full max-w-[80%] max-h-[80%]" />}
                    {!['flame', 'corrosive', 'toxic', 'health', 'warning'].includes(elem.content || '') && (
                      <ShieldAlert className="w-full h-full max-w-[80%] max-h-[80%]" />
                    )}
                  </div>
                </div>
              )}

              {/* NFPA 704 Diamond Element */}
              {elem.type === 'nfpa-diamond' && (
                <div className="w-full aspect-square relative select-none">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                    {/* Top quadrant: Flammability (Red) */}
                    <polygon
                      points="50,2 74,26 50,50 26,26"
                      fill="#ef4444"
                      stroke="#000000"
                      strokeWidth="2.5"
                    />
                    {/* Left quadrant: Health (Blue) */}
                    <polygon
                      points="26,26 50,50 26,74 2,50"
                      fill="#3b82f6"
                      stroke="#000000"
                      strokeWidth="2.5"
                    />
                    {/* Right quadrant: Instability (Yellow) */}
                    <polygon
                      points="74,26 98,50 74,74 50,50"
                      fill="#facc15"
                      stroke="#000000"
                      strokeWidth="2.5"
                    />
                    {/* Bottom quadrant: Special (White) */}
                    <polygon
                      points="50,50 74,74 50,98 26,74"
                      fill="#ffffff"
                      stroke="#000000"
                      strokeWidth="2.5"
                    />
                    {/* Ratings */}
                    <text x="50" y="32" textAnchor="middle" dominantBaseline="middle" fill="#000000" fontSize="22" fontWeight="900" fontFamily="sans-serif">
                      {elem.nfpaFlammability !== undefined ? elem.nfpaFlammability : 2}
                    </text>
                    <text x="26" y="55" textAnchor="middle" dominantBaseline="middle" fill="#000000" fontSize="22" fontWeight="900" fontFamily="sans-serif">
                      {elem.nfpaHealth !== undefined ? elem.nfpaHealth : 1}
                    </text>
                    <text x="74" y="55" textAnchor="middle" dominantBaseline="middle" fill="#000000" fontSize="22" fontWeight="900" fontFamily="sans-serif">
                      {elem.nfpaInstability !== undefined ? elem.nfpaInstability : 1}
                    </text>
                    <text x="50" y="78" textAnchor="middle" dominantBaseline="middle" fill="#000000" fontSize="16" fontWeight="900" fontFamily="sans-serif">
                      {elem.nfpaSpecial || ''}
                    </text>
                  </svg>
                </div>
              )}

              {/* PPE Safety Pictograms Row */}
              {elem.type === 'ppe-symbol' && (
                <div className="flex items-center space-x-1.5 w-full select-none">
                  {/* 1. Gloves (Blue Circle) */}
                  <div className="w-8 h-8 rounded-full bg-[#1e40af] border-2 border-white flex items-center justify-center p-1 shadow-sm shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5" />
                      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                      <path d="M6 14v-1.5a1.5 1.5 0 0 0-3 0V16a6 6 0 0 0 6 6h6a6 6 0 0 0 6-6v-5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2" />
                    </svg>
                  </div>
                  {/* 2. Suit (Blue Circle) */}
                  <div className="w-8 h-8 rounded-full bg-[#1e40af] border-2 border-white flex items-center justify-center p-1 shadow-sm shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <circle cx="12" cy="5" r="2" />
                      <path d="M9 22V13L7 9a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1l-2 4v9" />
                      <path d="M9 13h6" />
                    </svg>
                  </div>
                  {/* 3. Boots (Blue Circle) */}
                  <div className="w-8 h-8 rounded-full bg-[#1e40af] border-2 border-white flex items-center justify-center p-1 shadow-sm shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M6 3h7v11l4 2v4H5v-4l1-13z" />
                    </svg>
                  </div>
                  {/* 4. Mask / Respirator (Blue Circle) */}
                  <div className="w-8 h-8 rounded-full bg-[#1e40af] border-2 border-white flex items-center justify-center p-1 shadow-sm shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <circle cx="12" cy="11" r="5" />
                      <circle cx="9" cy="11" r="1.5" />
                      <circle cx="15" cy="11" r="1.5" />
                      <path d="M12 16v3" />
                      <path d="M7 16l-3 2" />
                      <path d="M17 16l3 2" />
                    </svg>
                  </div>
                  {/* 5. Ventilation Fan (Red Square) */}
                  <div className="w-8 h-8 rounded bg-[#dc2626] border-2 border-white flex items-center justify-center p-1 shadow-sm shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 9C12 5 15 4 17 5c-1 3-3 4-5 4z" />
                      <path d="M15 12c4 0 5 3 4 5-3-1-4-3-4-5z" />
                      <path d="M12 15c0 4-3 5-5 4 1-3 3-4 5-4z" />
                      <path d="M9 12C5 12 4 9 5 7c3 1 4 3 4 5z" />
                    </svg>
                  </div>
                  {/* 6. No Sparks / Flame prohibited (Red Square) */}
                  <div className="w-8 h-8 rounded bg-[#dc2626] border-2 border-white flex items-center justify-center p-1 shadow-sm shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                      <line x1="3" y1="3" x2="21" y2="21" stroke="white" strokeWidth="2.5" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Safety Badges */}
              {elem.type === 'badge' && (
                <div
                  className="px-2 py-0.5 rounded font-black text-center uppercase tracking-wider text-[10px] shadow-sm inline-block"
                  style={{
                    backgroundColor: elem.bgColor || '#d91e18',
                    color: elem.fontColor || '#ffffff',
                    border: elem.borderColor ? `1px solid ${elem.borderColor}` : 'none',
                  }}
                >
                  {elem.content || 'DANGER'}
                </div>
              )}

              {/* Shape / Divider / Ribbon */}
              {elem.type === 'shape' && (
                <div
                  className="w-full h-full rounded"
                  style={{
                    backgroundColor: elem.bgColor || '#071d3a',
                    borderColor: elem.borderColor || 'transparent',
                    borderWidth: elem.borderWidth ? `${elem.borderWidth}px` : '0px',
                  }}
                />
              )}

              {/* Barcode artifact */}
              {elem.type === 'barcode' && (
                <div className="bg-white/90 p-1 border border-slate-300 rounded text-center">
                  <div className="h-6 flex items-center justify-center space-x-[2px] overflow-hidden">
                    {Array.from({ length: 38 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-slate-900"
                        style={{
                          width: i % 3 === 0 ? '2.5px' : '1.5px',
                          height: '100%',
                          opacity: i % 5 === 0 ? 0.3 : 1,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[7px] font-mono text-slate-600 block mt-0.5">
                    {elem.content || batchNumber || '*ORD-BARCODE*'}
                  </span>
                </div>
              )}

              {/* Hazard Warning Stripe Bar */}
              {elem.type === 'hazard-stripe' && (
                <div
                  className="w-full h-full rounded shadow-xs overflow-hidden border"
                  style={{
                    borderColor: elem.stripeStyle === 'red-white' ? '#dc2626' : '#000000',
                    borderWidth: '1.5px',
                    backgroundImage:
                      elem.stripeStyle === 'red-white'
                        ? 'repeating-linear-gradient(-45deg, #ef4444, #ef4444 14px, #ffffff 14px, #ffffff 28px)'
                        : elem.stripeStyle === 'orange-black'
                        ? 'repeating-linear-gradient(-45deg, #f97316, #f97316 14px, #000000 14px, #000000 28px)'
                        : 'repeating-linear-gradient(-45deg, #facc15, #facc15 14px, #000000 14px, #000000 28px)',
                  }}
                />
              )}

              {/* QR Code Matrix */}
              {elem.type === 'qr-code' && (
                <div className="w-full h-full flex flex-col items-center justify-center select-none">
                  <QrCodeRenderer
                    payload={
                      elem.content ||
                      (elem.qrPayloadType === 'po'
                        ? customerPoNumber || 'PO-4508208158'
                        : elem.qrPayloadType === 'batch'
                        ? batchNumber || 'MN-CLN-202610-01'
                        : elem.qrPayloadType === 'url'
                        ? 'https://mn-chem.com/sds'
                        : elem.content || 'MNChem-Verified-Batch')
                    }
                  />
                  {elem.label && (
                    <span className="text-[6.5px] font-mono font-bold text-slate-700 mt-0.5 uppercase tracking-wider">
                      {elem.label}
                    </span>
                  )}
                </div>
              )}

              {/* Divider Line */}
              {elem.type === 'divider' && (
                <div
                  className="w-full h-full flex items-center justify-center pointer-events-none"
                  style={{
                    borderTop:
                      elem.orientation !== 'vertical'
                        ? `${elem.borderWidth || 2}px ${elem.borderStyle || 'solid'} ${elem.borderColor || '#000000'}`
                        : 'none',
                    borderLeft:
                      elem.orientation === 'vertical'
                        ? `${elem.borderWidth || 2}px ${elem.borderStyle || 'solid'} ${elem.borderColor || '#000000'}`
                        : 'none',
                  }}
                />
              )}

              {/* Container Box / Section Card */}
              {elem.type === 'container-box' && (
                <div
                  className="w-full h-full pointer-events-none"
                  style={{
                    backgroundColor: elem.bgColor || 'rgba(255, 255, 255, 0.7)',
                    borderColor: elem.borderColor || '#cbd5e1',
                    borderWidth: `${elem.borderWidth || 1}px`,
                    borderStyle: elem.borderStyle || 'solid',
                    borderRadius: `${elem.borderRadius || 4}px`,
                  }}
                >
                  {elem.content && (
                    <div
                      className="px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider border-b"
                      style={{
                        borderColor: elem.borderColor || '#cbd5e1',
                        color: elem.fontColor || '#071d3a',
                      }}
                    >
                      {elem.content}
                    </div>
                  )}
                </div>
              )}

              {/* Delete button in interactive designer */}
              {interactive && isSelected && onDeleteElement && (
                <button
                  type="button"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onDeleteElement(elem.id);
                  }}
                  className="absolute -top-3 -right-3 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center shadow hover:bg-rose-700"
                  title="Delete element"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* 4. THE SPECIALITY "BOX" TOOL LAYER (Variable Slots e.g. PO, Batch, Expiry) */}
        {fields.map((field) => {
          const val = getFieldValue(field);
          const isSelected = activeFieldId === field.id;
          const isDragging = draggingId === field.id;

          // =========================================================================
          // CRITICAL REQUIREMENT IMPLEMENTATION:
          // In the interactive designer (interactive === true):
          // Render a visible dashed placeholder showing its pinned name (e.g. [PO])
          // so the designer knows what it is, where it sits, and can drag it.
          //
          // ON THE FINAL GENERATED LABEL / PREVIEW (interactive === false):
          // If field.showBoxFrame is FALSE (the default):
          // The box frame completely disappears!
          // It renders ONLY the number or text typed into the popup at this exact coordinate!
          // =========================================================================
          if (!interactive) {
            // FINAL LABEL MODE (Preview, Print, Finalized Order)
            return (
              <div
                key={field.id}
                className="absolute"
                style={{
                  left: `${field.xPercent}%`,
                  top: `${field.yPercent}%`,
                  width: `${Math.max(10, field.widthPercent)}%`,
                  textAlign: field.align || 'left',
                  zIndex: 20,
                }}
              >
                {field.showBoxFrame ? (
                  // User explicitly requested a visible rectangular box container
                  <div
                    className="p-1 rounded shadow-sm"
                    style={{
                      backgroundColor: field.bgColor || '#ffffff',
                      borderColor: field.borderColor || '#cbd5e1',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                    }}
                  >
                    {field.showLabelPrefix && (
                      <span className="text-[8.5px] font-extrabold uppercase tracking-wider block text-slate-700">
                        {field.label || field.name}:
                      </span>
                    )}
                    <div
                      className="truncate"
                      style={{
                        fontSize: `${field.fontSize || 14}px`,
                        color: field.fontColor || '#071d3a',
                        fontWeight: field.fontWeight || 'bold',
                        fontFamily: field.fontFamily || 'monospace, sans-serif',
                      }}
                    >
                      {val || field.placeholder || ''}
                    </div>
                  </div>
                ) : (
                  // SEAMLESS RAW TEXT MODE (THE USER'S PRIMARY REQUEST):
                  // No box, no border, no background!
                  // Only the number or text entered into the popup!
                  <div
                    className="truncate"
                    style={{
                      fontSize: `${field.fontSize || 14}px`,
                      fontWeight: field.fontWeight || 'bold',
                      color: field.fontColor || '#071d3a',
                      textAlign: field.align || 'left',
                      fontFamily: field.fontFamily || 'monospace, sans-serif',
                      lineHeight: '1.2',
                    }}
                  >
                    {field.showLabelPrefix && (
                      <span className="font-sans text-[10px] uppercase font-bold mr-1 opacity-80">
                        {field.label || field.name}:
                      </span>
                    )}
                    {val || (
                      <span className="text-slate-300 font-normal italic">
                        {field.placeholder || `[${field.label || field.name}]`}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          }

          // INTERACTIVE DESIGNER MODE:
          // Shows dashed bounding box with pinned label badge so designer can manipulate it
          return (
            <div
              key={field.id}
              onMouseDown={(e) => handleBoxMouseDown(e, field)}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectField) onSelectField(field);
              }}
              className={`absolute transition-shadow cursor-grab active:cursor-grabbing ${
                isSelected
                  ? 'ring-2 ring-[#00a3e0] bg-blue-50/90 shadow-xl z-30'
                  : 'bg-white/90 hover:ring-2 hover:ring-blue-300 z-20'
              } border-2 border-dashed border-[#00a3e0] rounded-lg p-1.5`}
              style={{
                left: `${field.xPercent}%`,
                top: `${field.yPercent}%`,
                width: `${Math.max(15, field.widthPercent)}%`,
                boxShadow: isDragging ? '0 10px 25px rgba(0,0,0,0.2)' : undefined,
              }}
            >
              {/* Pin Header Badge */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#071d3a] flex items-center gap-1 truncate">
                  <span className="px-1 py-0.2 bg-[#00a3e0] text-white rounded text-[7.5px] font-bold">
                    PIN
                  </span>
                  {field.label || field.name}
                </span>

                <div className="flex items-center space-x-1 shrink-0 ml-1">
                  <span className="text-[8px] bg-slate-100 text-slate-600 px-1 rounded flex items-center font-mono">
                    <Move className="w-2.5 h-2.5 mr-0.5 text-slate-400" />
                    {field.xPercent}%,{field.yPercent}%
                  </span>
                  {onDeleteField && (
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onDeleteField(field.id);
                      }}
                      className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer"
                      title="Delete Box"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Simulated value on canvas in designer */}
              <div className="px-2 py-1 bg-white border border-slate-200 rounded flex items-center justify-between shadow-inner">
                <span
                  className="font-mono font-bold truncate"
                  style={{
                    fontSize: `${Math.max(10, field.fontSize - 2)}px`,
                    color: field.fontColor || '#0a2652',
                    textAlign: field.align || 'left',
                  }}
                >
                  {val || (
                    <span className="text-slate-400 font-normal italic">
                      {field.placeholder || `<${field.label || field.name} Value>`}
                    </span>
                  )}
                </span>
                <span className="text-[7.5px] text-blue-600 font-bold uppercase shrink-0 ml-1">
                  {field.showBoxFrame ? 'Box Frame' : 'Text Only'}
                </span>
              </div>

              <div className="mt-0.5 text-[7px] text-slate-500 italic truncate">
                Prompt: "{field.label}" in Order popup • Prints value only
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
