import React, { useState, useEffect, useRef } from 'react';
import { ProductTemplate, VariableField, CanvasElement, AVAILABLE_FONTS } from '../types/index.ts';
import { MNCleanLabelCanvas } from './MNCleanLabelCanvas.tsx';
import {
  X,
  Save,
  Trash2,
  Move,
  Upload,
  Type,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle,
  Eye,
  Check,
  FileImage,
  Box,
  Palette,
  ShieldAlert,
  Flame,
  Droplet,
  Skull,
  Square,
  Minus,
  Sliders,
  ChevronRight,
  Maximize2,
  RefreshCw,
  Grid,
  ZoomIn,
  ZoomOut,
  Copy,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown,
  QrCode as QrCodeIcon,
  SplitSquareHorizontal,
  SplitSquareVertical,
  SlidersHorizontal,
} from 'lucide-react';

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: ProductTemplate | null;
  onSave: (templateData: Partial<ProductTemplate>) => Promise<any>;
  onOpenGenerateOrder?: (template: ProductTemplate) => void;
}

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  isOpen,
  onClose,
  template,
  onSave,
  onOpenGenerateOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'designer' | 'specs'>('designer');

  // Product Basic Info
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [density, setDensity] = useState('');
  const [flashPoint, setFlashPoint] = useState('');
  const [hazardClass, setHazardClass] = useState('');
  const [netWeight, setNetWeight] = useState('');
  const [netVolume, setNetVolume] = useState('');
  const [unNumber, setUnNumber] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'archived'>('active');

  // Canvas Mode & Visuals
  const [isBlankCanvas, setIsBlankCanvas] = useState<boolean>(false);
  const [canvasBgColor, setCanvasBgColor] = useState<string>('#ffffff');
  const [canvasBorder, setCanvasBorder] = useState<'none' | 'thin' | 'industrial' | 'accent'>('industrial');
  const [canvasBorderColor, setCanvasBorderColor] = useState<string>('#000000');
  const [artworkUrl, setArtworkUrl] = useState<string>('');
  const [customLogoUrl, setCustomLogoUrl] = useState<string>('');

  // Elements & Pinned Boxes
  const [artworkElements, setArtworkElements] = useState<CanvasElement[]>([]);
  const [fields, setFields] = useState<VariableField[]>([]);

  // Selection state
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Canvas Workspace Navigation (Zoom & Alignment Grid)
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Hidden File Inputs
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const bgUploadRef = useRef<HTMLInputElement>(null);
  const logoUploadRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (template) {
      setName(template.name || '');
      setCode(template.code || '');
      setCategory(template.category || 'Specialty Chemical');
      setDescription(template.description || '');
      setDensity(template.density || '0.985 - 1.015 g/cm³');
      setFlashPoint(template.flashPoint || '> 65°C');
      setHazardClass(template.hazardClass || 'Class 3 / Class 8');
      setNetWeight(template.netWeight || '200 kg / Drum');
      setNetVolume(template.netVolume || '200 Liters');
      setUnNumber(template.unNumber || 'UN 1993, PG III');
      setInternalNotes(template.internalNotes || '');
      setStatus(template.status || 'active');
      setArtworkUrl(template.artworkUrl || '');
      setCustomLogoUrl(template.customLogoUrl || '');
      setIsBlankCanvas(Boolean(template.isBlankCanvas || template.layoutPreset === 'blank'));
      setCanvasBgColor(template.canvasBgColor || '#ffffff');
      setCanvasBorder(template.canvasBorder || 'industrial');
      setCanvasBorderColor(template.canvasBorderColor || '#000000');

      setArtworkElements(template.artworkElements || []);

      if (template.fields && template.fields.length > 0) {
        setFields(template.fields);
        setSelectedFieldId(template.fields[0].id);
      } else {
        const defaultBoxes: VariableField[] = [
          {
            id: 'fld-po',
            name: 'po',
            label: 'PO',
            type: 'text',
            xPercent: 54,
            yPercent: 32,
            widthPercent: 41,
            fontSize: 14,
            fontWeight: 'bold',
            fontColor: '#0a2652',
            align: 'left',
            required: true,
            placeholder: 'e.g. PO-984321',
            showBoxFrame: false,
            showLabelPrefix: false,
          },
          {
            id: 'fld-batch',
            name: 'batchNumber',
            label: 'Batch Number',
            type: 'text',
            xPercent: 54,
            yPercent: 50,
            widthPercent: 41,
            fontSize: 14,
            fontWeight: 'bold',
            fontColor: '#0a2652',
            align: 'left',
            required: true,
            placeholder: 'e.g. MN-CLN-2610-01',
            showBoxFrame: false,
            showLabelPrefix: false,
          },
          {
            id: 'fld-expiry',
            name: 'expiryDate',
            label: 'Expiry Date',
            type: 'date',
            xPercent: 54,
            yPercent: 68,
            widthPercent: 41,
            fontSize: 14,
            fontWeight: 'bold',
            fontColor: '#d91e18',
            align: 'left',
            required: true,
            showBoxFrame: false,
            showLabelPrefix: false,
          },
        ];
        setFields(defaultBoxes);
        setSelectedFieldId('fld-po');
      }
    } else {
      // New Template Defaults: Blank Canvas option default
      setName('');
      setCode('');
      setCategory('Wellbore Cleaning Solvent');
      setDescription('Wellbore Cleaning Solvent & Surfactant System');
      setDensity('0.985 - 1.015 g/cm³');
      setFlashPoint('> 65°C');
      setHazardClass('Class 3 / Class 8');
      setNetWeight('200 kg / Drum');
      setNetVolume('200 Liters');
      setUnNumber('UN 1993, PG III');
      setInternalNotes('');
      setStatus('active');
      setArtworkUrl('');
      setCustomLogoUrl('');
      setIsBlankCanvas(true); // Default to Blank Canvas for fresh templates
      setCanvasBgColor('#ffffff');
      setCanvasBorder('industrial');
      setArtworkElements([]);

      const initialBoxes: VariableField[] = [
        {
          id: 'fld-po',
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
          placeholder: 'e.g. PO-450012398',
          showBoxFrame: false,
          showLabelPrefix: false,
        },
      ];
      setFields(initialBoxes);
      setSelectedFieldId('fld-po');
    }
  }, [template, isOpen]);

  if (!isOpen) return null;

  // Selected Field
  const activeField = fields.find((f) => f.id === selectedFieldId) || null;
  // Selected Element
  const activeElement = artworkElements.find((e) => e.id === selectedElementId) || null;

  // 1. ADD VARIABLE "BOX" TOOL ACTION (THE CORE USER REQUIREMENT)
  const handleAddBox = (presetLabel = 'PO') => {
    const id = `box-${Date.now()}`;
    const newBox: VariableField = {
      id,
      name: presetLabel.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      label: presetLabel,
      type: presetLabel.toLowerCase().includes('date') || presetLabel.toLowerCase().includes('exp') ? 'date' : 'text',
      xPercent: 50,
      yPercent: Math.min(80, 20 + fields.length * 12),
      widthPercent: 35,
      fontSize: 14,
      fontWeight: 'bold',
      fontColor: '#071d3a',
      align: 'left',
      required: true,
      placeholder: `Enter ${presetLabel}`,
      // Speciality default: seamless text only!
      showBoxFrame: false,
      showLabelPrefix: false,
    };
    setFields((prev) => [...prev, newBox]);
    setSelectedFieldId(id);
    setSelectedElementId(null);
  };

  // 2. ADD TEXT ELEMENT
  const handleAddText = (content = 'SAMPLE TEXT', isHeader = false) => {
    const id = `txt-${Date.now()}`;
    const newElem: CanvasElement = {
      id,
      type: 'text',
      content,
      xPercent: 10,
      yPercent: Math.min(80, 15 + artworkElements.length * 8),
      widthPercent: isHeader ? 60 : 40,
      fontSize: isHeader ? 24 : 14,
      fontWeight: isHeader ? 'bold' : 'normal',
      fontColor: '#071d3a',
      align: 'left',
      zIndex: 10,
    };
    setArtworkElements((prev) => [...prev, newElem]);
    setSelectedElementId(id);
    setSelectedFieldId(null);
  };

  // 3. ADD GHS PICTOGRAM ARTIFACT
  const handleAddGhsPictogram = (type: 'flame' | 'corrosive' | 'toxic' | 'health' | 'warning') => {
    const id = `ghs-${Date.now()}`;
    const newElem: CanvasElement = {
      id,
      type: 'ghs-pictogram',
      content: type,
      xPercent: 10 + (artworkElements.filter((e) => e.type === 'ghs-pictogram').length % 5) * 8,
      yPercent: 70,
      widthPercent: 7,
      heightPercent: 10,
      zIndex: 10,
    };
    setArtworkElements((prev) => [...prev, newElem]);
    setSelectedElementId(id);
    setSelectedFieldId(null);
  };

  // 4. ADD BADGE ARTIFACT
  const handleAddBadge = (text: string, bgColor: string) => {
    const id = `bdg-${Date.now()}`;
    const newElem: CanvasElement = {
      id,
      type: 'badge',
      content: text,
      bgColor,
      fontColor: '#ffffff',
      xPercent: 10,
      yPercent: 10,
      widthPercent: 15,
      zIndex: 10,
    };
    setArtworkElements((prev) => [...prev, newElem]);
    setSelectedElementId(id);
    setSelectedFieldId(null);
  };

  // 5. ADD SHAPE / RIBBON
  const handleAddShape = (type: 'header' | 'divider' | 'panel') => {
    const id = `shp-${Date.now()}`;
    let newElem: CanvasElement;
    if (type === 'header') {
      newElem = {
        id,
        type: 'shape',
        bgColor: '#071d3a',
        xPercent: 0,
        yPercent: 0,
        widthPercent: 100,
        heightPercent: 14,
        zIndex: 1,
      };
    } else if (type === 'divider') {
      newElem = {
        id,
        type: 'shape',
        bgColor: '#00a3e0',
        xPercent: 5,
        yPercent: 50,
        widthPercent: 90,
        heightPercent: 1,
        zIndex: 2,
      };
    } else {
      newElem = {
        id,
        type: 'shape',
        bgColor: '#f8fafc',
        borderColor: '#cbd5e1',
        borderWidth: 2,
        xPercent: 48,
        yPercent: 20,
        widthPercent: 48,
        heightPercent: 65,
        zIndex: 1,
      };
    }
    setArtworkElements((prev) => [...prev, newElem]);
    setSelectedElementId(id);
    setSelectedFieldId(null);
  };

  // 6. ADD BARCODE ARTIFACT
  const handleAddBarcode = () => {
    const id = `bar-${Date.now()}`;
    const newElem: CanvasElement = {
      id,
      type: 'barcode',
      content: code ? `*${code}*` : '*MNCHEM-LOT-SPEC*',
      xPercent: 55,
      yPercent: 78,
      widthPercent: 35,
      zIndex: 5,
    };
    setArtworkElements((prev) => [...prev, newElem]);
    setSelectedElementId(id);
    setSelectedFieldId(null);
  };

  // 6B. ADD NFPA 704 FIRE DIAMOND
  const handleAddNfpaDiamond = () => {
    const id = `nfpa-${Date.now()}`;
    const newElem: CanvasElement = {
      id,
      type: 'nfpa-diamond',
      xPercent: 64,
      yPercent: 34,
      widthPercent: 24,
      nfpaFlammability: 2,
      nfpaHealth: 1,
      nfpaInstability: 1,
      nfpaSpecial: '',
      zIndex: 10,
    };
    setArtworkElements((prev) => [...prev, newElem]);
    setSelectedElementId(id);
    setSelectedFieldId(null);
  };

  // 6C. ADD PPE SAFETY ICONS ROW
  const handleAddPpeSymbols = () => {
    const id = `ppe-${Date.now()}`;
    const newElem: CanvasElement = {
      id,
      type: 'ppe-symbol',
      xPercent: 60,
      yPercent: 82,
      widthPercent: 34,
      ppeSymbolType: 'full-row',
      zIndex: 10,
    };
    setArtworkElements((prev) => [...prev, newElem]);
    setSelectedElementId(id);
    setSelectedFieldId(null);
  };

  // 6E. ADD HAZARD WARNING STRIPE BAR
  const handleAddHazardStripe = (stripeStyle: 'yellow-black' | 'red-white' | 'orange-black' = 'yellow-black') => {
    const id = `stripe-${Date.now()}`;
    const newElem: CanvasElement = {
      id,
      type: 'hazard-stripe',
      xPercent: 0,
      yPercent: 0,
      widthPercent: 100,
      heightPercent: 3.5,
      stripeStyle,
      zIndex: 2,
    };
    setArtworkElements((prev) => [...prev, newElem]);
    setSelectedElementId(id);
    setSelectedFieldId(null);
  };

  // 6F. ADD DYNAMIC QR CODE ELEMENT
  const handleAddQrCode = (qrPayloadType: 'batch' | 'po' | 'url' | 'custom' = 'batch') => {
    const id = `qr-${Date.now()}`;
    const newElem: CanvasElement = {
      id,
      type: 'qr-code',
      xPercent: 82,
      yPercent: 70,
      widthPercent: 12,
      heightPercent: 18,
      qrPayloadType,
      label: 'QR VERIFY',
      content: 'https://mn-chem.com/verify',
      zIndex: 10,
    };
    setArtworkElements((prev) => [...prev, newElem]);
    setSelectedElementId(id);
    setSelectedFieldId(null);
  };

  // 6G. ADD DIVIDER LINE
  const handleAddDivider = (orientation: 'horizontal' | 'vertical' = 'horizontal') => {
    const id = `div-${Date.now()}`;
    const newElem: CanvasElement = {
      id,
      type: 'divider',
      orientation,
      xPercent: orientation === 'horizontal' ? 3 : 50,
      yPercent: orientation === 'horizontal' ? 50 : 3,
      widthPercent: orientation === 'horizontal' ? 94 : 1,
      heightPercent: orientation === 'horizontal' ? 1 : 94,
      borderColor: '#000000',
      borderWidth: 2,
      borderStyle: 'solid',
      zIndex: 5,
    };
    setArtworkElements((prev) => [...prev, newElem]);
    setSelectedElementId(id);
    setSelectedFieldId(null);
  };

  // 6H. ADD SECTION CARD / CONTAINER BOX
  const handleAddContainerBox = (title = 'TECHNICAL SPECIFICATIONS') => {
    const id = `card-${Date.now()}`;
    const newElem: CanvasElement = {
      id,
      type: 'container-box',
      content: title,
      xPercent: 48,
      yPercent: 20,
      widthPercent: 48,
      heightPercent: 45,
      bgColor: '#ffffff',
      borderColor: '#cbd5e1',
      borderWidth: 1.5,
      borderStyle: 'solid',
      borderRadius: 4,
      zIndex: 2,
    };
    setArtworkElements((prev) => [...prev, newElem]);
    setSelectedElementId(id);
    setSelectedFieldId(null);
  };

  // 6I. ADD GHS PRECAUTIONARY / HAZARD STATEMENTS BLOCK
  const handleAddHazardStatements = () => {
    const id = `hstmt-${Date.now()}`;
    const textContent =
      'HAZARD STATEMENTS (CLP/GHS):\n' +
      '• H227: Combustible liquid.\n' +
      '• H314: Causes severe skin burns and eye damage.\n' +
      '• H335: May cause respiratory irritation.\n' +
      'PRECAUTIONARY STATEMENTS:\n' +
      '• P210: Keep away from open flames/hot surfaces.\n' +
      '• P280: Wear protective gloves & eye protection.';
    const newElem: CanvasElement = {
      id,
      type: 'text',
      content: textContent,
      fontSize: 10,
      fontWeight: 'normal',
      fontColor: '#000000',
      xPercent: 3,
      yPercent: 70,
      widthPercent: 55,
      heightPercent: 25,
      align: 'left',
      zIndex: 10,
    };
    setArtworkElements((prev) => [...prev, newElem]);
    setSelectedElementId(id);
    setSelectedFieldId(null);
  };

  // 6J. QUICK ALIGNMENT HELPER (Left, Center X, Right, Top, Center Y, Bottom)
  const handleQuickAlign = (alignment: 'left' | 'center-x' | 'right' | 'top' | 'center-y' | 'bottom') => {
    if (selectedFieldId) {
      setFields((prev) =>
        prev.map((f) => {
          if (f.id !== selectedFieldId) return f;
          const w = f.widthPercent || 30;
          let nx = f.xPercent;
          let ny = f.yPercent;
          if (alignment === 'left') nx = 2.5;
          else if (alignment === 'center-x') nx = Math.round((100 - w) / 2);
          else if (alignment === 'right') nx = Math.max(0, Math.round(97.5 - w));
          else if (alignment === 'top') ny = 3.5;
          else if (alignment === 'center-y') ny = 45;
          else if (alignment === 'bottom') ny = 88;
          return { ...f, xPercent: nx, yPercent: ny };
        })
      );
    } else if (selectedElementId) {
      setArtworkElements((prev) =>
        prev.map((e) => {
          if (e.id !== selectedElementId) return e;
          const w = e.widthPercent || 20;
          const h = e.heightPercent || 10;
          let nx = e.xPercent;
          let ny = e.yPercent;
          if (alignment === 'left') nx = 2.5;
          else if (alignment === 'center-x') nx = Math.round((100 - w) / 2);
          else if (alignment === 'right') nx = Math.max(0, Math.round(97.5 - w));
          else if (alignment === 'top') ny = 3.5;
          else if (alignment === 'center-y') ny = Math.round((100 - h) / 2);
          else if (alignment === 'bottom') ny = Math.max(0, Math.round(96 - h));
          return { ...e, xPercent: nx, yPercent: ny };
        })
      );
    }
  };

  // 6K. DUPLICATE ACTIVE ELEMENT OR BOX
  const handleDuplicateActive = () => {
    if (selectedFieldId) {
      const field = fields.find((f) => f.id === selectedFieldId);
      if (!field) return;
      const cloneId = `box-${Date.now()}`;
      const clone: VariableField = {
        ...field,
        id: cloneId,
        label: `${field.label} (Copy)`,
        name: `${field.name}_copy`,
        xPercent: Math.min(85, field.xPercent + 3),
        yPercent: Math.min(88, field.yPercent + 3),
      };
      setFields((prev) => [...prev, clone]);
      setSelectedFieldId(cloneId);
    } else if (selectedElementId) {
      const elem = artworkElements.find((e) => e.id === selectedElementId);
      if (!elem) return;
      const cloneId = `${elem.type}-${Date.now()}`;
      const clone: CanvasElement = {
        ...elem,
        id: cloneId,
        xPercent: Math.min(90, elem.xPercent + 3),
        yPercent: Math.min(90, elem.yPercent + 3),
      };
      setArtworkElements((prev) => [...prev, clone]);
      setSelectedElementId(cloneId);
    }
  };

  // 6L. ADJUST LAYER / Z-INDEX
  const handleLayerOrder = (direction: 'up' | 'down') => {
    if (selectedElementId) {
      setArtworkElements((prev) =>
        prev.map((e) => {
          if (e.id !== selectedElementId) return e;
          const cur = e.zIndex || 5;
          const next = direction === 'up' ? cur + 2 : Math.max(1, cur - 2);
          return { ...e, zIndex: next };
        })
      );
    }
  };

  // 6D. 1-CLICK LOAD SAMPLE LABEL (MNCLEAN-S REFERENCE FROM USER SCREENSHOT)
  const handleLoadMncleanSSample = () => {
    setName('MNCLEAN-S');
    setCode('1001536912');
    setCategory('Cleaning Solvent');
    setDescription('Well-Bore Cleaning Solvent');
    setIsBlankCanvas(true);
    setCanvasBgColor('#ffffff');
    setCanvasBorder('industrial');
    setCanvasBorderColor('#000000');

    // Artwork elements matching the sample label screenshot!
    const sampleElements: CanvasElement[] = [
      {
        id: 'txt-title',
        type: 'text',
        content: 'MNCLEAN-S',
        fontSize: 26,
        fontWeight: 'bold',
        fontColor: '#000000',
        xPercent: 2.5,
        yPercent: 3.5,
        widthPercent: 55,
      },
      {
        id: 'txt-subtitle',
        type: 'text',
        content: 'Well-Bore Cleaning Solvent',
        fontSize: 18,
        fontWeight: 'normal',
        fontColor: '#000000',
        xPercent: 2.5,
        yPercent: 11.5,
        widthPercent: 55,
      },
      {
        id: 'txt-material',
        type: 'text',
        content: 'MATERIAL# 1001536912',
        fontSize: 12,
        fontWeight: 'normal',
        fontColor: '#000000',
        xPercent: 2.5,
        yPercent: 17.5,
        widthPercent: 55,
      },
      {
        id: 'txt-origin',
        type: 'text',
        content: 'COUNTRY OF ORIGIN: KINGDOM OF SAUDI ARABIA',
        fontSize: 11,
        fontWeight: 'bold',
        fontColor: '#00a651',
        xPercent: 2.5,
        yPercent: 24,
        widthPercent: 55,
      },
      {
        id: 'txt-vendor-info',
        type: 'text',
        content: 'VENDOR: MODERN NATIONAL CHEMICALS FACTORY\nVENDOR ID#: 10064676',
        fontSize: 11,
        fontWeight: 'bold',
        fontColor: '#000000',
        xPercent: 2.5,
        yPercent: 31,
        widthPercent: 55,
      },
      {
        id: 'txt-email',
        type: 'text',
        content: 'info@mn-chem.com',
        fontSize: 11,
        fontWeight: 'normal',
        fontColor: '#000000',
        xPercent: 2.5,
        yPercent: 47,
        widthPercent: 55,
      },
      {
        id: 'txt-packaging',
        type: 'text',
        content: 'PACKAGING SIZE: 55 GAL Dr\nNET WEIGHT / PACKAGE: 160 KGS\nGROSS WEIGHT / PACKAGE: 180 KGS',
        fontSize: 11,
        fontWeight: 'bold',
        fontColor: '#000000',
        xPercent: 2.5,
        yPercent: 54,
        widthPercent: 55,
      },
      {
        id: 'txt-storage',
        type: 'text',
        content: 'STORE IN COOL, SHADED, WELL VENTILLATED AREA',
        fontSize: 11,
        fontWeight: 'bold',
        fontColor: '#000000',
        xPercent: 2.5,
        yPercent: 92,
        widthPercent: 65,
      },
      {
        id: 'elem-logo',
        type: 'logo',
        xPercent: 58,
        yPercent: 6,
        widthPercent: 38,
      },
      {
        id: 'txt-nfpa-heading',
        type: 'text',
        content: 'NFPA RATING\n0 : MINIMUM, 1 : LOW, 2 : MODERATE,',
        fontSize: 9.5,
        fontWeight: 'bold',
        fontColor: '#000000',
        align: 'center',
        xPercent: 58,
        yPercent: 23,
        widthPercent: 38,
      },
      {
        id: 'elem-nfpa',
        type: 'nfpa-diamond',
        xPercent: 64,
        yPercent: 34,
        widthPercent: 26,
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
        widthPercent: 34,
        ppeSymbolType: 'full-row',
      },
      {
        id: 'bdg-product-corner',
        type: 'text',
        content: 'MNCLEAN-S',
        fontSize: 9.5,
        fontWeight: 'bold',
        fontColor: '#d91e18',
        align: 'right',
        xPercent: 82,
        yPercent: 92.5,
        widthPercent: 15,
      },
    ];

    // Boxes pinned for dynamic order data entry (PO#, EXPIRATION, BATCH#):
    const sampleBoxes: VariableField[] = [
      {
        id: 'fld-po',
        name: 'po',
        label: 'PO#',
        type: 'text',
        xPercent: 2.5,
        yPercent: 39,
        widthPercent: 35,
        fontSize: 11,
        fontWeight: 'bold',
        fontColor: '#000000',
        align: 'left',
        required: true,
        defaultValue: 'PO#: 4508208158',
        placeholder: 'e.g. PO#: 4508208158',
        showBoxFrame: false,
        showLabelPrefix: false,
      },
      {
        id: 'fld-expiry',
        name: 'expiryDate',
        label: 'EXPIRATION DATE',
        type: 'text',
        xPercent: 2.5,
        yPercent: 73,
        widthPercent: 40,
        fontSize: 11,
        fontWeight: 'bold',
        fontColor: '#000000',
        align: 'left',
        required: true,
        defaultValue: 'EXPIRATION DATE: OCTOBER-2027',
        placeholder: 'e.g. EXPIRATION DATE: OCTOBER-2027',
        showBoxFrame: false,
        showLabelPrefix: false,
      },
      {
        id: 'fld-batch',
        name: 'batchNumber',
        label: 'BATCH#',
        type: 'text',
        xPercent: 2.5,
        yPercent: 80,
        widthPercent: 45,
        fontSize: 11,
        fontWeight: 'bold',
        fontColor: '#000000',
        align: 'left',
        required: true,
        defaultValue: 'BATCH#: MNCLEAN-S-20251101/01',
        placeholder: 'e.g. BATCH#: MNCLEAN-S-20251101/01',
        showBoxFrame: false,
        showLabelPrefix: false,
      },
    ];

    setArtworkElements(sampleElements);
    setFields(sampleBoxes);
    setSelectedElementId(null);
    setSelectedFieldId(null);
  };

  // 7. HANDLE IMAGE UPLOADS
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'canvas-image' | 'background' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (target === 'background') {
        setArtworkUrl(result);
      } else if (target === 'logo') {
        setCustomLogoUrl(result);
      } else if (target === 'canvas-image') {
        const id = `img-${Date.now()}`;
        const newElem: CanvasElement = {
          id,
          type: 'image',
          content: result,
          label: file.name,
          xPercent: 10,
          yPercent: 20,
          widthPercent: 25,
          zIndex: 10,
        };
        setArtworkElements((prev) => [...prev, newElem]);
        setSelectedElementId(id);
        setSelectedFieldId(null);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Update Field Properties
  const updateActiveField = (updates: Partial<VariableField>) => {
    if (!selectedFieldId) return;
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === selectedFieldId) {
          const next = { ...f, ...updates };
          // If label changed, keep name in sync if needed
          if (updates.label) {
            next.name = updates.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
          }
          return next;
        }
        return f;
      })
    );
  };

  // Update Canvas Element Properties
  const updateActiveElement = (updates: Partial<CanvasElement>) => {
    if (!selectedElementId) return;
    setArtworkElements((prev) =>
      prev.map((e) => (e.id === selectedElementId ? { ...e, ...updates } : e))
    );
  };

  // Delete Handlers
  const handleDeleteField = (fieldId: string) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  };

  const handleDeleteElement = (elemId: string) => {
    setArtworkElements((prev) => prev.filter((e) => e.id !== elemId));
    if (selectedElementId === elemId) setSelectedElementId(null);
  };

  // Wipe to blank canvas
  const handleWipeToBlank = () => {
    setIsBlankCanvas(true);
    setArtworkElements([]);
    setArtworkUrl('');
    setCanvasBgColor('#ffffff');
    setCanvasBorder('industrial');
  };

  // Keyboard Arrow Key Nudge & Delete listener for high-precision placement
  useEffect(() => {
    if (!isOpen || activeTab !== 'designer') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
      ) {
        return;
      }

      if (!selectedFieldId && !selectedElementId) return;

      const step = e.shiftKey ? 5 : 1;
      let dx = 0;
      let dy = 0;

      if (e.key === 'ArrowUp') dy = -step;
      else if (e.key === 'ArrowDown') dy = step;
      else if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedFieldId) handleDeleteField(selectedFieldId);
        else if (selectedElementId) handleDeleteElement(selectedElementId);
        return;
      } else {
        return;
      }

      e.preventDefault();
      if (selectedFieldId) {
        setFields((prev) =>
          prev.map((f) => {
            if (f.id !== selectedFieldId) return f;
            return {
              ...f,
              xPercent: Math.max(0, Math.min(95, f.xPercent + dx)),
              yPercent: Math.max(0, Math.min(92, f.yPercent + dy)),
            };
          })
        );
      } else if (selectedElementId) {
        setArtworkElements((prev) =>
          prev.map((elem) => {
            if (elem.id !== selectedElementId) return elem;
            return {
              ...elem,
              xPercent: Math.max(0, Math.min(98, elem.xPercent + dx)),
              yPercent: Math.max(0, Math.min(95, elem.yPercent + dy)),
            };
          })
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab, selectedFieldId, selectedElementId]);

  // Save Template
  const handleSave = async (andGenerate = false) => {
    if (!name.trim()) {
      setError('Please provide a Product Name');
      return;
    }
    if (!code.trim()) {
      setError('Please provide a Product Code');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const savedResult = await onSave({
        name,
        code,
        category,
        description,
        density,
        flashPoint,
        hazardClass,
        netWeight,
        netVolume,
        unNumber,
        internalNotes,
        status,
        artworkType: 'vector',
        artworkUrl,
        customLogoUrl,
        isBlankCanvas,
        layoutPreset: isBlankCanvas ? 'blank' : 'standard-split',
        canvasBgColor,
        canvasBorder,
        canvasBorderColor,
        fields,
        artworkElements,
      });

      onClose();

      if (andGenerate && onOpenGenerateOrder && savedResult) {
        onOpenGenerateOrder(savedResult);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  // Current preview template object
  const currentTemplateState: ProductTemplate = {
    id: template?.id || 'temp-id',
    name: name || 'NEW PRODUCT',
    code: code || 'CODE-001',
    category,
    description,
    density,
    flashPoint,
    hazardClass,
    netWeight,
    netVolume,
    unNumber,
    artworkType: 'vector',
    artworkUrl,
    customLogoUrl,
    isBlankCanvas,
    layoutPreset: isBlankCanvas ? 'blank' : 'standard-split',
    canvasBgColor,
    canvasBorder,
    canvasBorderColor,
    status,
    fields,
    artworkElements,
    version: template?.version || 1,
    createdAt: template?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={imageUploadRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'canvas-image')}
      />
      <input
        type="file"
        ref={bgUploadRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'background')}
      />
      <input
        type="file"
        ref={logoUploadRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'logo')}
      />

      <div className="bg-[#071d3a] border border-[#163e72] w-full max-w-7xl rounded-2xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-[#05162d] border-b border-[#163e72] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#00a3e0]/20 text-[#00a3e0] rounded-lg">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  {template ? `Edit Template: ${template.name}` : 'Product Label Designer'}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#00a3e0]/20 text-[#00a3e0] border border-[#00a3e0]/30">
                  {isBlankCanvas ? 'Blank Canvas Mode' : 'MNChem Standard Layout'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Design custom packaging artwork, upload images/logos, and place <strong>Box</strong> tools for order inputs (PO, Batch, etc.).
              </p>
            </div>
          </div>

          {/* Tab Switcher & Action Buttons */}
          <div className="flex items-center space-x-2">
            <div className="flex bg-[#0b284e] p-1 rounded-lg border border-[#163e72]">
              <button
                type="button"
                onClick={() => setActiveTab('designer')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                  activeTab === 'designer'
                    ? 'bg-[#00a3e0] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Visual Designer
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                  activeTab === 'specs'
                    ? 'bg-[#00a3e0] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Specifications & Data
              </button>
            </div>

            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Template'}</span>
            </button>

            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#00a3e0] hover:bg-[#0092c8] text-white font-bold text-xs shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Save template and immediately open Order Label generator"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Save & Generate</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="px-5 py-2 bg-rose-500/20 border-b border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Main Body */}
        {activeTab === 'designer' ? (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* LEFT / CENTER: CANVAS AND TOP TOOLBAR */}
            <div className="flex-1 flex flex-col bg-[#040e1e] overflow-hidden border-r border-[#163e72]">
              
              {/* DESIGNER TOOLBAR */}
              <div className="bg-[#071d3a] border-b border-[#163e72] px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
                {/* PRIMARY ACTIONS: THE BOX TOOL & ARTIFACTS */}
                <div className="flex items-center flex-wrap gap-1.5">
                  {/* THE CORE "BOX" TOOL */}
                  <div className="flex items-center rounded-lg bg-[#00a3e0] p-0.5 shadow-md">
                    <button
                      type="button"
                      onClick={() => handleAddBox('PO')}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#00a3e0] hover:bg-[#028ec5] text-white font-black text-xs cursor-pointer active:scale-95 transition"
                      title="Add a Box tool — pins a variable data slot for Order generation"
                    >
                      <Box className="w-4 h-4 text-white" />
                      <span>+ Add Box</span>
                    </button>
                  </div>

                  {/* PRESET BOX SHORTCUTS */}
                  <div className="hidden sm:flex items-center space-x-1 bg-[#0b284e] px-2 py-1 rounded-lg border border-[#163e72]">
                    <span className="text-[10px] text-slate-300 font-bold mr-1">Pin Box:</span>
                    <button
                      type="button"
                      onClick={() => handleAddBox('PO')}
                      className="px-2 py-0.5 bg-[#061833] hover:bg-[#00a3e0] text-slate-200 hover:text-white rounded text-[10px] font-bold border border-[#1c4880] transition"
                    >
                      + PO
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBox('Batch Number')}
                      className="px-2 py-0.5 bg-[#061833] hover:bg-[#00a3e0] text-slate-200 hover:text-white rounded text-[10px] font-bold border border-[#1c4880] transition"
                    >
                      + Batch #
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBox('Expiry Date')}
                      className="px-2 py-0.5 bg-[#061833] hover:bg-[#00a3e0] text-slate-200 hover:text-white rounded text-[10px] font-bold border border-[#1c4880] transition"
                    >
                      + Expiry Date
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBox('Drum Seal #')}
                      className="px-2 py-0.5 bg-[#061833] hover:bg-[#00a3e0] text-slate-200 hover:text-white rounded text-[10px] font-bold border border-[#1c4880] transition"
                    >
                      + Drum Seal
                    </button>
                  </div>

                  {/* ARTIFACTS & UPLOADS */}
                  <div className="h-5 w-px bg-slate-700 mx-0.5" />

                  {/* Add Text */}
                  <button
                    type="button"
                    onClick={() => handleAddText('PRODUCT TITLE', true)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-[#0b284e] hover:bg-[#12396e] text-slate-200 font-bold text-xs border border-[#163e72] transition"
                    title="Add Text Block"
                  >
                    <Type className="w-3.5 h-3.5 text-[#00a3e0]" />
                    <span>+ Text</span>
                  </button>

                  {/* Upload Image Artifact */}
                  <button
                    type="button"
                    onClick={() => imageUploadRef.current?.click()}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-[#0b284e] hover:bg-[#12396e] text-slate-200 font-bold text-xs border border-[#163e72] transition"
                    title="Upload image or artwork artifact"
                  >
                    <FileImage className="w-3.5 h-3.5 text-amber-400" />
                    <span>+ Image</span>
                  </button>

                  {/* Upload Logo */}
                  <button
                    type="button"
                    onClick={() => logoUploadRef.current?.click()}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-[#0b284e] hover:bg-[#12396e] text-slate-200 font-bold text-xs border border-[#163e72] transition"
                    title="Upload custom logo"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Logo</span>
                  </button>

                  {/* GHS Pictograms */}
                  <div className="flex items-center space-x-1 bg-[#0b284e] px-2 py-1 rounded border border-[#163e72]">
                    <span className="text-[10px] text-slate-400 font-bold mr-0.5">GHS:</span>
                    <button
                      type="button"
                      onClick={() => handleAddGhsPictogram('flame')}
                      className="p-1 hover:bg-white/10 rounded text-rose-500"
                      title="Add GHS Flame Pictogram"
                    >
                      <Flame className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddGhsPictogram('corrosive')}
                      className="p-1 hover:bg-white/10 rounded text-rose-500"
                      title="Add GHS Corrosive Pictogram"
                    >
                      <Droplet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddGhsPictogram('toxic')}
                      className="p-1 hover:bg-white/10 rounded text-rose-500"
                      title="Add GHS Toxic Pictogram"
                    >
                      <Skull className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Badges & Shapes */}
                  <button
                    type="button"
                    onClick={() => handleAddBadge('DANGER', '#d91e18')}
                    className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-black tracking-wider transition"
                  >
                    DANGER
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddBadge('WARNING', '#f59e0b')}
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded text-[10px] font-black tracking-wider transition"
                  >
                    WARNING
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddShape('panel')}
                    className="p-1.5 bg-[#0b284e] hover:bg-[#12396e] text-slate-300 rounded border border-[#163e72]"
                    title="Add Rectangle Panel"
                  >
                    <Square className="w-3.5 h-3.5 text-[#00a3e0]" />
                  </button>

                  <button
                    type="button"
                    onClick={handleAddNfpaDiamond}
                    className="flex items-center space-x-1 px-2 py-1 bg-[#0b284e] hover:bg-[#12396e] text-amber-300 rounded text-[10px] font-bold border border-[#163e72] transition"
                    title="Add NFPA 704 Diamond (Health, Flammability, Instability, Special)"
                  >
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <span>+ NFPA Diamond</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddPpeSymbols}
                    className="flex items-center space-x-1 px-2 py-1 bg-[#0b284e] hover:bg-[#12396e] text-cyan-300 rounded text-[10px] font-bold border border-[#163e72] transition"
                    title="Add PPE Safety Pictograms (Gloves, Suit, Boots, Mask, Ventilation, Spark-prohibited)"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                    <span>+ PPE Icons</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddBarcode}
                    className="px-2 py-1 bg-[#0b284e] hover:bg-[#12396e] text-slate-300 rounded text-[10px] font-mono border border-[#163e72]"
                    title="Add Barcode graphic"
                  >
                    |||| Barcode
                  </button>

                  {/* 7. NEW TOOLS: HAZARD STRIPE, QR CODE, DIVIDER, CARD, H-STATEMENTS */}
                  <button
                    type="button"
                    onClick={() => handleAddHazardStripe('yellow-black')}
                    className="flex items-center space-x-1 px-2 py-1 bg-[#0b284e] hover:bg-[#12396e] text-yellow-300 rounded text-[10px] font-bold border border-[#163e72] transition"
                    title="Add Industrial Warning Caution Stripe Bar"
                  >
                    <span className="w-2.5 h-2.5 bg-yellow-400 rounded-xs inline-block border border-black" />
                    <span>+ Stripe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddQrCode('batch')}
                    className="flex items-center space-x-1 px-2 py-1 bg-[#0b284e] hover:bg-[#12396e] text-cyan-300 rounded text-[10px] font-bold border border-[#163e72] transition"
                    title="Add Dynamic 2D QR Code Matrix"
                  >
                    <QrCodeIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>+ QR Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddDivider('horizontal')}
                    className="flex items-center space-x-1 px-2 py-1 bg-[#0b284e] hover:bg-[#12396e] text-slate-200 rounded text-[10px] font-bold border border-[#163e72] transition"
                    title="Add Divider Line"
                  >
                    <Minus className="w-3.5 h-3.5 text-slate-400" />
                    <span>+ Divider</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddContainerBox('SPECIFICATIONS')}
                    className="flex items-center space-x-1 px-2 py-1 bg-[#0b284e] hover:bg-[#12396e] text-slate-200 rounded text-[10px] font-bold border border-[#163e72] transition"
                    title="Add Grouping Container Card"
                  >
                    <Square className="w-3.5 h-3.5 text-blue-400" />
                    <span>+ Box Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddHazardStatements}
                    className="flex items-center space-x-1 px-2 py-1 bg-[#0b284e] hover:bg-[#12396e] text-amber-200 rounded text-[10px] font-bold border border-[#163e72] transition"
                    title="Add GHS Hazard & Precautionary Statements Text Block"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>+ H-Statements</span>
                  </button>
                </div>

                {/* CANVAS MODE TOGGLE & SAMPLE LOADER */}
                <div className="flex items-center space-x-2">
                  {/* 1-CLICK SAMPLE LABEL LOADER FOR MNCLEAN-S REFERENCE */}
                  <button
                    type="button"
                    onClick={handleLoadMncleanSSample}
                    className="flex items-center space-x-1.5 px-3 py-1 text-xs font-black rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md border border-blue-400/30 transition cursor-pointer active:scale-95"
                    title="Load the exact MNCLEAN-S sample label from screenshot onto Blank Canvas"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>Load Sample Label</span>
                  </button>

                  <div className="flex items-center bg-[#05162d] p-1 rounded-lg border border-[#163e72]">
                    <button
                      type="button"
                      onClick={() => setIsBlankCanvas(true)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded ${
                        isBlankCanvas
                          ? 'bg-[#00a3e0] text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Blank Canvas
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsBlankCanvas(false)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded ${
                        !isBlankCanvas
                          ? 'bg-[#00a3e0] text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      MNChem Layout
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleWipeToBlank}
                    className="flex items-center space-x-1 px-2.5 py-1 text-[10px] font-bold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    title="Clear canvas to 100% blank slate"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-400" />
                    <span>Clear to Blank</span>
                  </button>
                </div>
              </div>

              {/* CANVAS CONTROL & ALIGNMENT TOOLBAR */}
              <div className="bg-[#061833] border-b border-[#163e72] px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
                {/* Left: Zoom Controls & Grid Toggle */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center bg-[#0b284e] rounded-lg border border-[#163e72] p-0.5 space-x-1">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(60, z - 15))}
                      className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono px-1.5 text-[#00a3e0] font-bold">{zoomLevel}%</span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(160, z + 15))}
                      className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(100)}
                      className="px-1.5 py-0.5 text-[9.5px] text-slate-300 hover:text-white rounded hover:bg-white/10 font-bold"
                      title="Reset 100%"
                    >
                      100%
                    </button>
                  </div>

                  {/* Grid Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowGrid((g) => !g)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[10.5px] font-bold border transition ${
                      showGrid
                        ? 'bg-[#00a3e0]/20 border-[#00a3e0] text-[#00a3e0]'
                        : 'bg-[#0b284e] border-[#163e72] text-slate-400 hover:text-slate-200'
                    }`}
                    title="Toggle 10% Alignment Grid"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Grid: {showGrid ? 'ON' : 'OFF'}</span>
                  </button>
                </div>

                {/* Right: Quick Alignment & Layering Bar (when an element or box is selected) */}
                {selectedFieldId || selectedElementId ? (
                  <div className="flex items-center space-x-1 bg-[#0b284e] px-2 py-1 rounded-lg border border-cyan-700/60 shadow-sm animate-fadeIn">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 mr-1 flex items-center gap-1">
                      <SlidersHorizontal className="w-3 h-3" />
                      Align:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuickAlign('left')}
                      className="p-1 hover:bg-white/10 text-slate-200 hover:text-white rounded"
                      title="Align Left (2.5%)"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAlign('center-x')}
                      className="p-1 hover:bg-white/10 text-slate-200 hover:text-white rounded"
                      title="Center Horizontally (50%)"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAlign('right')}
                      className="p-1 hover:bg-white/10 text-slate-200 hover:text-white rounded"
                      title="Align Right"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => handleQuickAlign('top')}
                      className="p-1 hover:bg-white/10 text-slate-200 hover:text-white rounded"
                      title="Align Top"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAlign('center-y')}
                      className="px-1.5 py-0.5 text-[9.5px] font-bold hover:bg-white/10 text-slate-200 hover:text-white rounded"
                      title="Center Vertically"
                    >
                      Mid Y
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAlign('bottom')}
                      className="p-1 hover:bg-white/10 text-slate-200 hover:text-white rounded"
                      title="Align Bottom"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-slate-600">|</span>
                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={handleDuplicateActive}
                      className="flex items-center space-x-1 px-1.5 py-0.5 bg-[#061833] hover:bg-[#00a3e0] text-slate-200 hover:text-white rounded text-[10px] font-bold border border-[#1c4880] transition"
                      title="Duplicate element (Clone with offset)"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Duplicate</span>
                    </button>
                    {/* Layer Up / Down (for elements) */}
                    {selectedElementId && (
                      <div className="flex items-center space-x-0.5">
                        <button
                          type="button"
                          onClick={() => handleLayerOrder('up')}
                          className="px-1.5 py-0.5 text-[9.5px] font-bold bg-[#061833] hover:bg-[#12396e] text-slate-300 rounded border border-[#1c4880]"
                          title="Bring Forward"
                        >
                          Fwd
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLayerOrder('down')}
                          className="px-1.5 py-0.5 text-[9.5px] font-bold bg-[#061833] hover:bg-[#12396e] text-slate-300 rounded border border-[#1c4880]"
                          title="Send Backward"
                        >
                          Back
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[10.5px] text-slate-400 italic">
                    ⌨️ Arrow keys nudge position • Click any element to align or edit
                  </div>
                )}
              </div>

              {/* CANVAS WORKSPACE VIEW */}
              <div
                className="flex-1 p-4 sm:p-6 overflow-auto flex items-center justify-center bg-radial from-[#0a2652]/40 to-[#040e1e]"
                onClick={() => {
                  setSelectedFieldId(null);
                  setSelectedElementId(null);
                }}
              >
                <div
                  className="w-full max-w-4xl"
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.15s ease-out',
                  }}
                >
                  <MNCleanLabelCanvas
                    template={currentTemplateState}
                    interactive={true}
                    showGrid={showGrid}
                    canvasId="template-designer-canvas"
                    activeFieldId={selectedFieldId}
                    activeElementId={selectedElementId}
                    onSelectField={(field) => {
                      setSelectedFieldId(field.id);
                      setSelectedElementId(null);
                    }}
                    onSelectElement={(elem) => {
                      setSelectedElementId(elem.id);
                      setSelectedFieldId(null);
                    }}
                    onUpdateFieldPosition={(fieldId, xPercent, yPercent) => {
                      setFields((prev) =>
                        prev.map((f) => (f.id === fieldId ? { ...f, xPercent, yPercent } : f))
                      );
                    }}
                    onUpdateElementPosition={(elemId, xPercent, yPercent) => {
                      setArtworkElements((prev) =>
                        prev.map((e) => (e.id === elemId ? { ...e, xPercent, yPercent } : e))
                      );
                    }}
                    onDeleteField={handleDeleteField}
                    onDeleteElement={handleDeleteElement}
                  />
                </div>
              </div>

              {/* CANVAS BOTTOM STATUS / HELPER */}
              <div className="bg-[#05162d] border-t border-[#163e72] px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-[#00a3e0] mr-1.5"></span>
                    <strong>{fields.length} Variable Box{fields.length === 1 ? '' : 'es'}</strong>
                    <span className="ml-1 text-slate-500">(Dynamic fields in order pop-up)</span>
                  </span>
                  <span>•</span>
                  <span>{artworkElements.length} Artwork Elements</span>
                </div>
                <div className="text-[10px] text-slate-400 italic">
                  💡 Drag boxes anywhere on canvas. The pop-up prompt will show the box name, but the final label will print only the typed number.
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR: INSPECTOR PANEL */}
            <div className="w-full lg:w-84 xl:w-96 bg-[#071d3a] p-4 overflow-y-auto space-y-4 shrink-0 border-t lg:border-t-0 border-[#163e72]">
              
              {/* 1. INSPECTOR: WHEN A VARIABLE BOX IS SELECTED */}
              {activeField ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#163e72]">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-[#00a3e0]/20 text-[#00a3e0] rounded-lg">
                        <Box className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">Variable Box Settings</h4>
                        <p className="text-[10px] text-[#00a3e0] font-semibold">
                          Pin: [{activeField.label || activeField.name}]
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteField(activeField.id)}
                      className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-900/30 rounded"
                      title="Delete Box"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* A. Pin Name / Prompt Label (CRITICAL USER REQUIREMENT) */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-200 block mb-1">
                      Box Pin Name (Prompt in Order Pop-up)
                    </label>
                    <input
                      type="text"
                      value={activeField.label}
                      onChange={(e) => updateActiveField({ label: e.target.value })}
                      placeholder="e.g. PO, Batch Number, Drum Seal #"
                      className="w-full px-3 py-2 bg-[#061833] border border-[#1c4880] rounded-lg text-white font-bold text-xs focus:ring-2 focus:ring-[#00a3e0] outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      The order pop-up will show: <span className="text-[#00a3e0] font-bold">"{activeField.label || 'PO'}"</span>
                    </p>
                  </div>

                  {/* B. THE SPECIALITY OF THE BOX: FINAL APPEARANCE */}
                  <div className="p-3 bg-[#0b284e]/70 border border-[#1c4880] rounded-xl space-y-2">
                    <span className="text-[11px] font-bold text-white block">
                      Speciality: Final Label Appearance
                    </span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => updateActiveField({ showBoxFrame: false })}
                        className={`p-2 rounded-lg text-left border transition ${
                          !activeField.showBoxFrame
                            ? 'bg-[#00a3e0]/20 border-[#00a3e0] text-white'
                            : 'bg-[#061833] border-[#1c4880] text-slate-400'
                        }`}
                      >
                        <span className="text-[11px] font-bold block text-[#00a3e0]">
                          ✓ Seamless Text Only
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          Box disappears. Only typed value prints.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateActiveField({ showBoxFrame: true })}
                        className={`p-2 rounded-lg text-left border transition ${
                          activeField.showBoxFrame
                            ? 'bg-[#00a3e0]/20 border-[#00a3e0] text-white'
                            : 'bg-[#061833] border-[#1c4880] text-slate-400'
                        }`}
                      >
                        <span className="text-[11px] font-bold block text-white">
                          Box Container
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          Draws border frame around value.
                        </span>
                      </button>
                    </div>

                    {/* Prefix toggle */}
                    <label className="flex items-center space-x-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(activeField.showLabelPrefix)}
                        onChange={(e) => updateActiveField({ showLabelPrefix: e.target.checked })}
                        className="rounded border-slate-700 text-[#00a3e0] focus:ring-[#00a3e0]"
                      />
                      <span className="text-[10.5px] text-slate-300">
                        Include Pin Name prefix (e.g. "{activeField.label}: 1234")
                      </span>
                    </label>
                  </div>

                  {/* C. Input Type & Placeholder */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Input Type
                      </label>
                      <select
                        value={activeField.type}
                        onChange={(e) => updateActiveField({ type: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 bg-[#061833] border border-[#1c4880] rounded-lg text-white text-xs outline-none"
                      >
                        <option value="text">Text (General / PO)</option>
                        <option value="date">Date (Expiry / Mfg)</option>
                        <option value="number">Numeric</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        value={activeField.placeholder || ''}
                        onChange={(e) => updateActiveField({ placeholder: e.target.value })}
                        placeholder="e.g. PO-12345"
                        className="w-full px-2.5 py-1.5 bg-[#061833] border border-[#1c4880] rounded-lg text-white text-xs outline-none"
                      >
                      </input>
                    </div>
                  </div>

                  {/* D. Coordinates & Width Sliders */}
                  <div className="space-y-2 pt-2 border-t border-[#163e72]">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                      <span>Horizontal Position (X)</span>
                      <span className="text-[#00a3e0] font-mono">{activeField.xPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={85}
                      value={activeField.xPercent}
                      onChange={(e) => updateActiveField({ xPercent: parseInt(e.target.value) })}
                      className="w-full accent-[#00a3e0]"
                    />

                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                      <span>Vertical Position (Y)</span>
                      <span className="text-[#00a3e0] font-mono">{activeField.yPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={90}
                      value={activeField.yPercent}
                      onChange={(e) => updateActiveField({ yPercent: parseInt(e.target.value) })}
                      className="w-full accent-[#00a3e0]"
                    />

                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                      <span>Width</span>
                      <span className="text-[#00a3e0] font-mono">{activeField.widthPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={70}
                      value={activeField.widthPercent}
                      onChange={(e) => updateActiveField({ widthPercent: parseInt(e.target.value) })}
                      className="w-full accent-[#00a3e0]"
                    />
                  </div>

                  {/* E. Typography & Color Selection */}
                  <div className="space-y-3 pt-2 border-t border-[#163e72]">
                    <span className="text-[11px] font-bold text-slate-200 block">
                      Typography & Color Selection
                    </span>

                    {/* Font Family Selector for Variable Box */}
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">
                        Font Family (Value Rendering)
                      </label>
                      <select
                        value={activeField.fontFamily || ''}
                        onChange={(e) => updateActiveField({ fontFamily: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-[#061833] border border-[#1c4880] rounded-lg text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-[#00a3e0]"
                      >
                        <option value="">Default (Industrial Monospace)</option>
                        {AVAILABLE_FONTS.map((f) => (
                          <option key={f.id} value={f.family}>
                            {f.name} — [{f.category}]
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">
                          Font Size ({activeField.fontSize}pt)
                        </label>
                        <input
                          type="range"
                          min={10}
                          max={36}
                          value={activeField.fontSize}
                          onChange={(e) => updateActiveField({ fontSize: parseInt(e.target.value) })}
                          className="w-full accent-[#00a3e0]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Font Weight</label>
                        <div className="flex bg-[#061833] rounded-lg border border-[#1c4880] p-0.5">
                          <button
                            type="button"
                            onClick={() => updateActiveField({ fontWeight: 'normal' })}
                            className={`flex-1 py-1 text-[10px] rounded ${
                              activeField.fontWeight === 'normal'
                                ? 'bg-[#00a3e0] text-white font-bold'
                                : 'text-slate-400'
                            }`}
                          >
                            Regular
                          </button>
                          <button
                            type="button"
                            onClick={() => updateActiveField({ fontWeight: 'bold' })}
                            className={`flex-1 py-1 text-[10px] rounded ${
                              activeField.fontWeight === 'bold'
                                ? 'bg-[#00a3e0] text-white font-bold'
                                : 'text-slate-400'
                            }`}
                          >
                            Bold
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Color Swatches & Picker */}
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1.5">Text Color</label>
                      <div className="flex items-center space-x-2">
                        {['#071d3a', '#00a3e0', '#d91e18', '#000000', '#10b981', '#f59e0b', '#ffffff'].map(
                          (c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => updateActiveField({ fontColor: c })}
                              className={`w-6 h-6 rounded-full border-2 transition ${
                                activeField.fontColor === c ? 'border-white scale-110 shadow-md' : 'border-slate-600'
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          )
                        )}
                        <input
                          type="color"
                          value={activeField.fontColor}
                          onChange={(e) => updateActiveField({ fontColor: e.target.value })}
                          className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer ml-1"
                          title="Custom Color"
                        />
                      </div>
                    </div>

                    {/* Alignment */}
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Text Alignment</label>
                      <div className="flex bg-[#061833] rounded-lg border border-[#1c4880] p-0.5">
                        {(['left', 'center', 'right'] as const).map((align) => (
                          <button
                            key={align}
                            type="button"
                            onClick={() => updateActiveField({ align })}
                            className={`flex-1 py-1 text-[10px] capitalize rounded ${
                              activeField.align === align
                                ? 'bg-[#00a3e0] text-white font-bold'
                                : 'text-slate-400'
                            }`}
                          >
                            {align}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeElement ? (
                /* 2. INSPECTOR: DEDICATED INSPECTOR FOR GHS, NFPA, PPE, TEXT, SHAPES */
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#163e72]">
                    <div>
                      <h4 className="text-sm font-black text-white capitalize">
                        {activeElement.type === 'ghs-pictogram'
                          ? 'ghs-pictogram Element'
                          : activeElement.type === 'nfpa-diamond'
                          ? 'NFPA 704 Diamond'
                          : activeElement.type === 'ppe-symbol'
                          ? 'PPE Safety Pictograms'
                          : `${activeElement.type} Element`}
                      </h4>
                      <p className="text-[10px] text-slate-400">Position & Style Inspector</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteElement(activeElement.id)}
                      className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-900/30 rounded"
                      title="Delete Element"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* A. GHS PICTOGRAM SPECIFIC CONTROLS */}
                  {activeElement.type === 'ghs-pictogram' && (
                    <div className="space-y-3.5 bg-[#061833] p-3 rounded-xl border border-[#1c4880]">
                      <div>
                        <label className="text-[11px] font-bold text-slate-200 block mb-1">
                          Pictogram Hazard Type
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['flame', 'corrosive', 'toxic', 'health', 'warning', 'shield'] as const).map((gType) => (
                            <button
                              key={gType}
                              type="button"
                              onClick={() => updateActiveElement({ content: gType })}
                              className={`py-1 text-[10px] font-bold capitalize rounded border transition ${
                                activeElement.content === gType
                                  ? 'bg-rose-600 border-rose-400 text-white shadow'
                                  : 'bg-[#0b284e] border-[#1c4880] text-slate-300 hover:text-white'
                              }`}
                            >
                              {gType}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* GHS Fill Color (Background inside the diamond) */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-bold text-slate-200">
                            Fill Colour Inside GHS
                          </label>
                          <span className="text-[10px] font-mono text-slate-400">
                            {activeElement.bgColor || '#ffffff'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {[
                            { label: 'White', color: '#ffffff' },
                            { label: 'Light Red', color: '#fee2e2' },
                            { label: 'Yellow', color: '#fef08a' },
                            { label: 'Light Gray', color: '#f1f5f9' },
                            { label: 'Dark Navy', color: '#071d3a' },
                          ].map((sw) => (
                            <button
                              key={sw.color}
                              type="button"
                              onClick={() => updateActiveElement({ bgColor: sw.color })}
                              className={`w-6 h-6 rounded-md border-2 transition ${
                                (activeElement.bgColor || '#ffffff') === sw.color
                                  ? 'border-[#00a3e0] scale-110 shadow-md ring-2 ring-white/50'
                                  : 'border-slate-600'
                              }`}
                              style={{ backgroundColor: sw.color }}
                              title={`Fill: ${sw.label}`}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => updateActiveElement({ bgColor: 'transparent' })}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                              activeElement.bgColor === 'transparent'
                                ? 'bg-[#00a3e0] text-white border-white'
                                : 'bg-[#0b284e] text-slate-400 border-slate-600'
                            }`}
                            title="Transparent fill"
                          >
                            None
                          </button>
                          <input
                            type="color"
                            value={activeElement.bgColor && activeElement.bgColor !== 'transparent' ? activeElement.bgColor : '#ffffff'}
                            onChange={(e) => updateActiveElement({ bgColor: e.target.value })}
                            className="w-7 h-7 rounded border border-slate-600 bg-transparent cursor-pointer ml-auto"
                            title="Custom Fill Color"
                          />
                        </div>
                      </div>

                      {/* GHS Border / Stroke Color */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-bold text-slate-200">
                            Border Stroke Colour
                          </label>
                          <span className="text-[10px] font-mono text-slate-400">
                            {activeElement.borderColor || '#dc2626'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {['#dc2626', '#881337', '#000000', '#ea580c', '#ffffff'].map((bc) => (
                            <button
                              key={bc}
                              type="button"
                              onClick={() => updateActiveElement({ borderColor: bc })}
                              className={`w-6 h-6 rounded-md border-2 transition ${
                                (activeElement.borderColor || '#dc2626') === bc
                                  ? 'border-[#00a3e0] scale-110 shadow-md ring-2 ring-white/50'
                                  : 'border-slate-600'
                              }`}
                              style={{ backgroundColor: bc }}
                              title={`Border: ${bc}`}
                            />
                          ))}
                          <input
                            type="color"
                            value={activeElement.borderColor || '#dc2626'}
                            onChange={(e) => updateActiveElement({ borderColor: e.target.value })}
                            className="w-7 h-7 rounded border border-slate-600 bg-transparent cursor-pointer ml-auto"
                            title="Custom Border Color"
                          />
                        </div>
                      </div>

                      {/* GHS Border Width */}
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">
                          Border Thickness ({activeElement.borderWidth || 3}px)
                        </label>
                        <div className="flex bg-[#0b284e] rounded-lg p-0.5 border border-[#1c4880]">
                          {[1, 2, 3, 4].map((bw) => (
                            <button
                              key={bw}
                              type="button"
                              onClick={() => updateActiveElement({ borderWidth: bw })}
                              className={`flex-1 py-1 text-xs font-bold rounded ${
                                (activeElement.borderWidth || 3) === bw
                                  ? 'bg-[#00a3e0] text-white'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {bw}px
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* B. NFPA 704 DIAMOND SPECIFIC CONTROLS */}
                  {activeElement.type === 'nfpa-diamond' && (
                    <div className="space-y-3.5 bg-[#061833] p-3 rounded-xl border border-[#1c4880]">
                      <span className="text-[11px] font-bold text-slate-200 block">
                        NFPA 704 Quadrant Hazard Ratings
                      </span>

                      {/* Flammability (Red, Top) */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1 font-bold">
                          <span className="text-rose-400">Flammability (Red / Top)</span>
                          <span className="text-white font-mono">{activeElement.nfpaFlammability ?? 2}</span>
                        </div>
                        <div className="flex bg-[#0b284e] rounded-lg p-0.5 border border-rose-900/50">
                          {[0, 1, 2, 3, 4].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => updateActiveElement({ nfpaFlammability: num })}
                              className={`flex-1 py-1 text-xs font-bold rounded ${
                                (activeElement.nfpaFlammability ?? 2) === num
                                  ? 'bg-rose-600 text-white'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Health (Blue, Left) */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1 font-bold">
                          <span className="text-blue-400">Health (Blue / Left)</span>
                          <span className="text-white font-mono">{activeElement.nfpaHealth ?? 1}</span>
                        </div>
                        <div className="flex bg-[#0b284e] rounded-lg p-0.5 border border-blue-900/50">
                          {[0, 1, 2, 3, 4].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => updateActiveElement({ nfpaHealth: num })}
                              className={`flex-1 py-1 text-xs font-bold rounded ${
                                (activeElement.nfpaHealth ?? 1) === num
                                  ? 'bg-blue-600 text-white'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Instability (Yellow, Right) */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1 font-bold">
                          <span className="text-amber-400">Instability (Yellow / Right)</span>
                          <span className="text-white font-mono">{activeElement.nfpaInstability ?? 1}</span>
                        </div>
                        <div className="flex bg-[#0b284e] rounded-lg p-0.5 border border-amber-900/50">
                          {[0, 1, 2, 3, 4].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => updateActiveElement({ nfpaInstability: num })}
                              className={`flex-1 py-1 text-xs font-bold rounded ${
                                (activeElement.nfpaInstability ?? 1) === num
                                  ? 'bg-amber-500 text-slate-900'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Special Hazard (White, Bottom) */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-200 block mb-1">
                          Special Hazard (White / Bottom)
                        </label>
                        <div className="flex items-center space-x-1">
                          {['', 'W', 'OX', 'SA', 'COR'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => updateActiveElement({ nfpaSpecial: opt })}
                              className={`flex-1 py-1 text-[10px] font-bold rounded border ${
                                (activeElement.nfpaSpecial || '') === opt
                                  ? 'bg-white text-slate-900 border-white'
                                  : 'bg-[#0b284e] text-slate-300 border-[#1c4880]'
                              }`}
                            >
                              {opt || 'None'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* C. TEXT CONTENT & STYLING */}
                  {(activeElement.type === 'text' || activeElement.type === 'badge') && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          Text Content (Supports multiline)
                        </label>
                        <textarea
                          rows={2}
                          value={activeElement.content || ''}
                          onChange={(e) => updateActiveElement({ content: e.target.value })}
                          className="w-full px-3 py-2 bg-[#061833] border border-[#1c4880] rounded-lg text-white font-bold text-xs outline-none resize-none"
                        />
                      </div>

                      {activeElement.type === 'text' && (
                        <>
                          {/* Font Family Selector */}
                          <div>
                            <label className="text-[11px] font-bold text-slate-300 block mb-1">
                              Font Style & Family
                            </label>
                            <select
                              value={activeElement.fontFamily || ''}
                              onChange={(e) => updateActiveElement({ fontFamily: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-[#061833] border border-[#1c4880] rounded-lg text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-[#00a3e0]"
                            >
                              <option value="">Default (Standard Industrial)</option>
                              {AVAILABLE_FONTS.map((f) => (
                                <option key={f.id} value={f.family}>
                                  {f.name} — [{f.category}]
                                </option>
                              ))}
                            </select>
                            {/* Font Family Quick Chips */}
                            <div className="grid grid-cols-2 gap-1 mt-1.5">
                              {AVAILABLE_FONTS.slice(0, 4).map((f) => (
                                <button
                                  key={f.id}
                                  type="button"
                                  onClick={() => updateActiveElement({ fontFamily: f.family })}
                                  className={`px-2 py-1 text-[9.5px] rounded border truncate text-left transition ${
                                    activeElement.fontFamily === f.family
                                      ? 'bg-[#00a3e0]/20 border-[#00a3e0] text-cyan-300 font-bold'
                                      : 'bg-[#0b284e] border-[#1c4880] text-slate-300 hover:text-white'
                                  }`}
                                  style={{ fontFamily: f.family }}
                                >
                                  {f.name.split(' ')[0]}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Font Size & Weight Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                <span>Font Size</span>
                                <span className="text-[#00a3e0] font-mono font-bold">{activeElement.fontSize || 14}px</span>
                              </div>
                              <input
                                type="range"
                                min={8}
                                max={48}
                                value={activeElement.fontSize || 14}
                                onChange={(e) => updateActiveElement({ fontSize: parseInt(e.target.value) })}
                                className="w-full accent-[#00a3e0]"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-400 block mb-1">Font Weight</label>
                              <div className="flex bg-[#061833] rounded-lg border border-[#1c4880] p-0.5">
                                {[
                                  { id: 'normal', label: 'Regular' },
                                  { id: 'medium', label: 'Medium' },
                                  { id: 'bold', label: 'Bold' },
                                  { id: 'black', label: 'Heavy' },
                                ].map((w) => (
                                  <button
                                    key={w.id}
                                    type="button"
                                    onClick={() => updateActiveElement({ fontWeight: w.id as any })}
                                    className={`flex-1 py-1 text-[9px] rounded font-bold ${
                                      (activeElement.fontWeight || 'normal') === w.id
                                        ? 'bg-[#00a3e0] text-white'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    {w.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Text Alignment */}
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Alignment</label>
                            <div className="flex bg-[#061833] rounded-lg border border-[#1c4880] p-0.5 space-x-1">
                              {[
                                { id: 'left', icon: AlignLeft, label: 'Left' },
                                { id: 'center', icon: AlignCenter, label: 'Center' },
                                { id: 'right', icon: AlignRight, label: 'Right' },
                              ].map((al) => {
                                const Icon = al.icon;
                                const isCur = (activeElement.align || 'left') === al.id;
                                return (
                                  <button
                                    key={al.id}
                                    type="button"
                                    onClick={() => updateActiveElement({ align: al.id as any })}
                                    className={`flex-1 py-1 flex items-center justify-center space-x-1 text-[10px] font-bold rounded ${
                                      isCur
                                        ? 'bg-[#00a3e0] text-white shadow'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    <Icon className="w-3 h-3" />
                                    <span>{al.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Text Color */}
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1.5">Color</label>
                        <div className="flex items-center space-x-2">
                          {['#000000', '#071d3a', '#00a3e0', '#00a651', '#d91e18', '#ffffff'].map(
                            (c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => updateActiveElement({ fontColor: c })}
                                className={`w-6 h-6 rounded-full border-2 ${
                                  activeElement.fontColor === c ? 'border-white scale-110 shadow' : 'border-slate-600'
                                }`}
                                style={{ backgroundColor: c }}
                              />
                            )
                          )}
                          <input
                            type="color"
                            value={activeElement.fontColor || '#000000'}
                            onChange={(e) => updateActiveElement({ fontColor: e.target.value })}
                            className="w-7 h-7 rounded bg-transparent cursor-pointer ml-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* C2. HAZARD STRIPE CONTROLS */}
                  {activeElement.type === 'hazard-stripe' && (
                    <div className="space-y-3 bg-[#061833] p-3 rounded-xl border border-[#1c4880]">
                      <label className="text-[11px] font-bold text-slate-200 block">
                        Caution Stripe Pattern
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'yellow-black', label: 'Yellow/Black', desc: 'General Caution' },
                          { id: 'red-white', label: 'Red/White', desc: 'Severe Hazard' },
                          { id: 'orange-black', label: 'Orange/Black', desc: 'Toxic / Bio' },
                        ].map((pat) => (
                          <button
                            key={pat.id}
                            type="button"
                            onClick={() => updateActiveElement({ stripeStyle: pat.id as any })}
                            className={`p-1.5 text-center rounded-lg border transition ${
                              (activeElement.stripeStyle || 'yellow-black') === pat.id
                                ? 'bg-[#00a3e0]/20 border-[#00a3e0] text-white shadow'
                                : 'bg-[#0b284e] border-[#1c4880] text-slate-300 hover:text-white'
                            }`}
                          >
                            <span className="text-[10px] font-bold block">{pat.label}</span>
                            <span className="text-[8px] text-slate-400 block">{pat.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* C3. QR CODE CONTROLS */}
                  {activeElement.type === 'qr-code' && (
                    <div className="space-y-3 bg-[#061833] p-3 rounded-xl border border-[#1c4880]">
                      <div>
                        <label className="text-[11px] font-bold text-slate-200 block mb-1">
                          QR Payload Data Source
                        </label>
                        <select
                          value={activeElement.qrPayloadType || 'batch'}
                          onChange={(e) => updateActiveElement({ qrPayloadType: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 bg-[#0b284e] border border-[#1c4880] rounded-lg text-white text-xs outline-none"
                        >
                          <option value="batch">Order Batch Number (Dynamic)</option>
                          <option value="po">Customer PO Number (Dynamic)</option>
                          <option value="url">SDS Verification Link (Web)</option>
                          <option value="custom">Custom Payload String</option>
                        </select>
                      </div>

                      {activeElement.qrPayloadType === 'custom' && (
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">
                            Custom Payload Value
                          </label>
                          <input
                            type="text"
                            value={activeElement.content || ''}
                            onChange={(e) => updateActiveElement({ content: e.target.value })}
                            placeholder="e.g. https://mn-chem.com/sds/1001536912"
                            className="w-full px-2.5 py-1.5 bg-[#061833] border border-[#1c4880] rounded text-white text-xs outline-none"
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">
                          Caption / Sub-label (Optional)
                        </label>
                        <input
                          type="text"
                          value={activeElement.label || ''}
                          onChange={(e) => updateActiveElement({ label: e.target.value })}
                          placeholder="e.g. QR VERIFY"
                          className="w-full px-2.5 py-1.5 bg-[#061833] border border-[#1c4880] rounded text-white text-xs outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* C4. DIVIDER LINE CONTROLS */}
                  {activeElement.type === 'divider' && (
                    <div className="space-y-3 bg-[#061833] p-3 rounded-xl border border-[#1c4880]">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-300 block mb-1">Orientation</label>
                          <div className="flex bg-[#0b284e] rounded border border-[#1c4880] p-0.5">
                            <button
                              type="button"
                              onClick={() => updateActiveElement({ orientation: 'horizontal', widthPercent: 90, heightPercent: 1 })}
                              className={`flex-1 py-1 text-[10px] font-bold rounded ${
                                activeElement.orientation !== 'vertical'
                                  ? 'bg-[#00a3e0] text-white'
                                  : 'text-slate-400'
                              }`}
                            >
                              Horizontal
                            </button>
                            <button
                              type="button"
                              onClick={() => updateActiveElement({ orientation: 'vertical', widthPercent: 1, heightPercent: 90 })}
                              className={`flex-1 py-1 text-[10px] font-bold rounded ${
                                activeElement.orientation === 'vertical'
                                  ? 'bg-[#00a3e0] text-white'
                                  : 'text-slate-400'
                              }`}
                            >
                              Vertical
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-300 block mb-1">Thickness</label>
                          <select
                            value={activeElement.borderWidth || 2}
                            onChange={(e) => updateActiveElement({ borderWidth: parseInt(e.target.value) })}
                            className="w-full px-2 py-1 bg-[#0b284e] border border-[#1c4880] rounded text-white text-xs outline-none"
                          >
                            <option value={1}>1px (Thin)</option>
                            <option value={2}>2px (Standard)</option>
                            <option value={3}>3px (Bold)</option>
                            <option value={5}>5px (Heavy)</option>
                          </select>
                        </div>
                      </div>

                      {/* Line Color */}
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Line Color</label>
                        <div className="flex items-center space-x-2">
                          {['#000000', '#071d3a', '#00a3e0', '#cbd5e1', '#ef4444'].map((col) => (
                            <button
                              key={col}
                              type="button"
                              onClick={() => updateActiveElement({ borderColor: col })}
                              className={`w-6 h-6 rounded-full border-2 ${
                                (activeElement.borderColor || '#000000') === col
                                  ? 'border-white scale-110 shadow'
                                  : 'border-slate-600'
                              }`}
                              style={{ backgroundColor: col }}
                            />
                          ))}
                          <input
                            type="color"
                            value={activeElement.borderColor || '#000000'}
                            onChange={(e) => updateActiveElement({ borderColor: e.target.value })}
                            className="w-7 h-7 rounded bg-transparent cursor-pointer ml-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* C5. CONTAINER BOX / SECTION CARD CONTROLS */}
                  {activeElement.type === 'container-box' && (
                    <div className="space-y-3 bg-[#061833] p-3 rounded-xl border border-[#1c4880]">
                      <div>
                        <label className="text-[10px] text-slate-300 block mb-1">
                          Header Title (Optional)
                        </label>
                        <input
                          type="text"
                          value={activeElement.content || ''}
                          onChange={(e) => updateActiveElement({ content: e.target.value })}
                          placeholder="e.g. TECHNICAL SPECIFICATIONS"
                          className="w-full px-2.5 py-1.5 bg-[#0b284e] border border-[#1c4880] rounded text-white text-xs font-bold outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-300 block mb-1">Background Fill</label>
                          <div className="flex items-center space-x-1">
                            <input
                              type="color"
                              value={activeElement.bgColor || '#ffffff'}
                              onChange={(e) => updateActiveElement({ bgColor: e.target.value })}
                              className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                            />
                            <button
                              type="button"
                              onClick={() => updateActiveElement({ bgColor: 'transparent' })}
                              className="px-2 py-1 text-[9px] font-bold bg-[#0b284e] text-slate-300 rounded border border-[#1c4880]"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-300 block mb-1">Border Color</label>
                          <input
                            type="color"
                            value={activeElement.borderColor || '#cbd5e1'}
                            onChange={(e) => updateActiveElement({ borderColor: e.target.value })}
                            className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* D. PRECISE POSITION & SIZE (NUMERIC INPUTS + SLIDERS) */}
                  <div className="space-y-3 pt-2 border-t border-[#163e72]">
                    <span className="text-[11px] font-bold text-slate-200 block">
                      Position & Dimensions
                    </span>

                    {/* X Position */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1">
                        <span>X Position</span>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min={0}
                            max={95}
                            value={activeElement.xPercent}
                            onChange={(e) => updateActiveElement({ xPercent: Math.max(0, Math.min(95, parseInt(e.target.value) || 0)) })}
                            className="w-12 px-1.5 py-0.5 bg-[#061833] border border-[#1c4880] rounded text-right text-[#00a3e0] font-mono text-xs font-bold outline-none"
                          />
                          <span className="text-slate-400 font-mono text-xs">%</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={95}
                        value={activeElement.xPercent}
                        onChange={(e) => updateActiveElement({ xPercent: parseInt(e.target.value) })}
                        className="w-full accent-[#00a3e0]"
                      />
                    </div>

                    {/* Y Position */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1">
                        <span>Y Position</span>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min={0}
                            max={95}
                            value={activeElement.yPercent}
                            onChange={(e) => updateActiveElement({ yPercent: Math.max(0, Math.min(95, parseInt(e.target.value) || 0)) })}
                            className="w-12 px-1.5 py-0.5 bg-[#061833] border border-[#1c4880] rounded text-right text-[#00a3e0] font-mono text-xs font-bold outline-none"
                          />
                          <span className="text-slate-400 font-mono text-xs">%</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={95}
                        value={activeElement.yPercent}
                        onChange={(e) => updateActiveElement({ yPercent: parseInt(e.target.value) })}
                        className="w-full accent-[#00a3e0]"
                      />
                    </div>

                    {/* Width */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1">
                        <span>Width</span>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={activeElement.widthPercent}
                            onChange={(e) => updateActiveElement({ widthPercent: Math.max(1, Math.min(100, parseInt(e.target.value) || 5)) })}
                            className="w-12 px-1.5 py-0.5 bg-[#061833] border border-[#1c4880] rounded text-right text-[#00a3e0] font-mono text-xs font-bold outline-none"
                          />
                          <span className="text-slate-400 font-mono text-xs">%</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={100}
                        value={activeElement.widthPercent}
                        onChange={(e) => updateActiveElement({ widthPercent: parseInt(e.target.value) })}
                        className="w-full accent-[#00a3e0]"
                      />
                    </div>

                    {/* Height */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1">
                        <span>Height</span>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={activeElement.heightPercent || 10}
                            onChange={(e) => updateActiveElement({ heightPercent: Math.max(1, Math.min(100, parseInt(e.target.value) || 5)) })}
                            className="w-12 px-1.5 py-0.5 bg-[#061833] border border-[#1c4880] rounded text-right text-[#00a3e0] font-mono text-xs font-bold outline-none"
                          />
                          <span className="text-slate-400 font-mono text-xs">%</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={100}
                        value={activeElement.heightPercent || 10}
                        onChange={(e) => updateActiveElement({ heightPercent: parseInt(e.target.value) })}
                        className="w-full accent-[#00a3e0]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* 3. INSPECTOR: GENERAL CANVAS & BACKGROUND SETTINGS */
                <div className="space-y-4">
                  <div className="pb-3 border-b border-[#163e72]">
                    <h4 className="text-sm font-black text-white">Canvas & Background</h4>
                    <p className="text-[10px] text-slate-400">A4 Landscape Packaging (297 x 210 mm)</p>
                  </div>

                  {/* Canvas Background Color */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-200 block mb-1.5">
                      Canvas Background Color
                    </label>
                    <div className="flex items-center space-x-2">
                      {['#ffffff', '#f8fafc', '#071d3a', '#061833', '#fef9c3', '#ecfdf5'].map((bg) => (
                        <button
                          key={bg}
                          type="button"
                          onClick={() => setCanvasBgColor(bg)}
                          className={`w-7 h-7 rounded-lg border-2 ${
                            canvasBgColor === bg ? 'border-[#00a3e0] scale-110 shadow-md' : 'border-slate-600'
                          }`}
                          style={{ backgroundColor: bg }}
                        />
                      ))}
                      <input
                        type="color"
                        value={canvasBgColor}
                        onChange={(e) => setCanvasBgColor(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer ml-1"
                        title="Custom Color"
                      />
                    </div>
                  </div>

                  {/* Canvas Border Style */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-200 block mb-1">
                      Canvas Border Framing
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'industrial', label: 'Industrial Border' },
                        { id: 'accent', label: 'Cyan Accent Border' },
                        { id: 'thin', label: 'Fine Border' },
                        { id: 'none', label: 'No Outer Border' },
                      ].map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setCanvasBorder(b.id as any)}
                          className={`p-2 rounded-lg text-left text-[11px] font-bold border transition ${
                            canvasBorder === b.id
                              ? 'bg-[#00a3e0]/20 border-[#00a3e0] text-white'
                              : 'bg-[#061833] border-[#1c4880] text-slate-400'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upload Full Artwork / Slide Background */}
                  <div className="pt-2 border-t border-[#163e72]">
                    <label className="text-[11px] font-bold text-slate-200 block mb-1">
                      Background Artwork / Slide
                    </label>
                    {artworkUrl ? (
                      <div className="relative rounded-lg overflow-hidden border border-slate-600 mb-2">
                        <img src={artworkUrl} alt="Background" className="w-full h-24 object-cover" />
                        <button
                          type="button"
                          onClick={() => setArtworkUrl('')}
                          className="absolute top-1 right-1 p-1 bg-black/70 text-white hover:bg-rose-600 rounded text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => bgUploadRef.current?.click()}
                        className="w-full py-3 px-4 border-2 border-dashed border-[#1c4880] hover:border-[#00a3e0] rounded-xl flex items-center justify-center space-x-2 text-xs text-slate-300 font-bold transition"
                      >
                        <Upload className="w-4 h-4 text-[#00a3e0]" />
                        <span>Upload Artwork Image</span>
                      </button>
                    )}
                  </div>

                  {/* Quick summary of variable boxes */}
                  <div className="pt-2 border-t border-[#163e72]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-white">Active Variable Boxes</span>
                      <button
                        type="button"
                        onClick={() => handleAddBox('PO')}
                        className="text-[10px] font-bold text-[#00a3e0] hover:underline"
                      >
                        + Add Box
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {fields.map((f) => (
                        <div
                          key={f.id}
                          onClick={() => {
                            setSelectedFieldId(f.id);
                            setSelectedElementId(null);
                          }}
                          className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                            selectedFieldId === f.id
                              ? 'bg-[#00a3e0]/20 border-[#00a3e0] text-white'
                              : 'bg-[#061833] border-[#1c4880] text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <Box className="w-3.5 h-3.5 text-[#00a3e0] shrink-0" />
                            <span className="text-xs font-bold truncate">{f.label || f.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {f.xPercent}%,{f.yPercent}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* TAB 2: PRODUCT SPECIFICATIONS & TECHNICAL DATA */
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#040e1e]">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Basic Info */}
              <div className="bg-[#071d3a] p-5 rounded-2xl border border-[#163e72] space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center">
                  <span className="w-2 h-2 bg-[#00a3e0] rounded-full mr-2"></span>
                  Product Identification & Classification
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. MNCLEAN S"
                      className="w-full px-3 py-2 bg-[#061833] border border-[#1c4880] rounded-lg text-white font-bold text-sm focus:ring-2 focus:ring-[#00a3e0] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Product Code / SKU *
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="e.g. MNC-CLN-S"
                      className="w-full px-3 py-2 bg-[#061833] border border-[#1c4880] rounded-lg text-white font-bold text-sm focus:ring-2 focus:ring-[#00a3e0] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Category</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Wellbore Cleaning Solvent"
                      className="w-full px-3 py-2 bg-[#061833] border border-[#1c4880] rounded-lg text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">UN Number</label>
                    <input
                      type="text"
                      value={unNumber}
                      onChange={(e) => setUnNumber(e.target.value)}
                      placeholder="e.g. UN 1993, PG III"
                      className="w-full px-3 py-2 bg-[#061833] border border-[#1c4880] rounded-lg text-white text-sm outline-none font-mono"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Description / Subtitle
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Wellbore Cleaning Solvent & Surfactant System"
                      className="w-full px-3 py-2 bg-[#061833] border border-[#1c4880] rounded-lg text-white text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Chemical Specifications */}
              <div className="bg-[#071d3a] p-5 rounded-2xl border border-[#163e72] space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center">
                  <span className="w-2 h-2 bg-[#00a3e0] rounded-full mr-2"></span>
                  Chemical Packaging Specifications
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Density / Specific Gravity
                    </label>
                    <input
                      type="text"
                      value={density}
                      onChange={(e) => setDensity(e.target.value)}
                      placeholder="0.985 - 1.015 g/cm³"
                      className="w-full px-3 py-2 bg-[#061833] border border-[#1c4880] rounded-lg text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Flash Point</label>
                    <input
                      type="text"
                      value={flashPoint}
                      onChange={(e) => setFlashPoint(e.target.value)}
                      placeholder="> 65°C"
                      className="w-full px-3 py-2 bg-[#061833] border border-[#1c4880] rounded-lg text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Hazard Class</label>
                    <input
                      type="text"
                      value={hazardClass}
                      onChange={(e) => setHazardClass(e.target.value)}
                      placeholder="Class 3 / Class 8"
                      className="w-full px-3 py-2 bg-[#061833] border border-[#1c4880] rounded-lg text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Net Weight</label>
                    <input
                      type="text"
                      value={netWeight}
                      onChange={(e) => setNetWeight(e.target.value)}
                      placeholder="200 kg / Drum"
                      className="w-full px-3 py-2 bg-[#061833] border border-[#1c4880] rounded-lg text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Net Volume</label>
                    <input
                      type="text"
                      value={netVolume}
                      onChange={(e) => setNetVolume(e.target.value)}
                      placeholder="200 Liters"
                      className="w-full px-3 py-2 bg-[#061833] border border-[#1c4880] rounded-lg text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#061833] border border-[#1c4880] rounded-lg text-white text-sm outline-none"
                    >
                      <option value="active">Active (Available for Orders)</option>
                      <option value="archived">Archived (Hidden)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
