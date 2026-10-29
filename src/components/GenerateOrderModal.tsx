import React, { useState, useEffect } from 'react';
import { ProductTemplate, OrderLabel, VariableField } from '../types/index.ts';
import { MNCleanLabelCanvas } from './MNCleanLabelCanvas.tsx';
import { generateA4LabelPdf } from '../utils/label-pdf.ts';
import {
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  Sparkles,
  AlertTriangle,
  Calendar,
} from 'lucide-react';

interface GenerateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: ProductTemplate[];
  initialTemplate?: ProductTemplate | null;
  onOrderCreated: (order: OrderLabel, pdfDataUrl: string) => void;
  dateFormat?: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'DD-MMM-YYYY';
}

export const GenerateOrderModal: React.FC<GenerateOrderModalProps> = ({
  isOpen,
  onClose,
  templates,
  initialTemplate,
  onOrderCreated,
  dateFormat = 'DD/MM/YYYY',
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  
  // Dynamic map holding values for every box added to the template!
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialTemplate && templates.some((t) => t.id === initialTemplate.id)) {
      setSelectedTemplateId(initialTemplate.id);
    } else if (templates.length > 0) {
      if (!selectedTemplateId || !templates.some((t) => t.id === selectedTemplateId)) {
        setSelectedTemplateId(templates[0].id);
      }
    }
  }, [isOpen, initialTemplate, templates]);

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || initialTemplate || templates[0];

  // When selected template changes, initialize its field values
  useEffect(() => {
    if (currentTemplate) {
      const initialMap: Record<string, string> = {};
      const fields = currentTemplate.fields || [];
      fields.forEach((f) => {
        if (f.defaultValue) {
          initialMap[f.id] = f.defaultValue;
        } else {
          // Carry over common values if user is switching between templates
          const existingValue = Object.entries(fieldValues).find(([k, v]) => {
            return (
              (k.includes('po') && f.name.includes('po')) ||
              (k.includes('batch') && f.name.includes('batch')) ||
              (k.includes('exp') && f.name.includes('exp'))
            );
          });
          initialMap[f.id] = existingValue ? existingValue[1] : '';
        }
      });
      setFieldValues(initialMap);
      setErrors({});
      setWarnings({});
    }
  }, [selectedTemplateId, currentTemplate?.id]);

  if (!isOpen) return null;

  // Active fields for the selected template
  const activeBoxes: VariableField[] = currentTemplate?.fields && currentTemplate.fields.length > 0
    ? currentTemplate.fields
    : [
        {
          id: 'fld-po',
          name: 'customerPoNumber',
          label: 'Customer PO Number',
          type: 'text',
          xPercent: 54,
          yPercent: 32,
          widthPercent: 41,
          fontSize: 14,
          fontWeight: 'bold',
          fontColor: '#0a2652',
          align: 'left',
          required: true,
          placeholder: 'e.g. PO-ARAMCO-2026-984',
        },
        {
          id: 'fld-batch',
          name: 'batchNumber',
          label: 'Batch / Lot Number',
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
        },
        {
          id: 'fld-expiry',
          name: 'expiryDate',
          label: 'Expiry Date (VAL / EXP)',
          type: 'date',
          xPercent: 54,
          yPercent: 68,
          widthPercent: 41,
          fontSize: 14,
          fontWeight: 'bold',
          fontColor: '#d91e18',
          align: 'left',
          required: true,
        },
      ];

  const handleFieldValueChange = (fieldId: string, val: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: val }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleClear = () => {
    setFieldValues({});
    setOrderNotes('');
    setErrors({});
    setWarnings({});
  };

  const validateAllBoxes = (): boolean => {
    const newErrors: Record<string, string> = {};
    const newWarnings: Record<string, string> = {};

    activeBoxes.forEach((box) => {
      const val = (fieldValues[box.id] || '').trim();
      if (box.required && !val) {
        newErrors[box.id] = `${box.label || box.name} is required.`;
      } else if (box.type === 'date' && val) {
        const parsed = new Date(val);
        if (isNaN(parsed.getTime())) {
          newErrors[box.id] = `Please enter a valid calendar date.`;
        }
      } else if (val.length > 45) {
        newWarnings[box.id] = `Text is longer than 45 characters and may scale down on print.`;
      }
    });

    setErrors(newErrors);
    setWarnings(newWarnings);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async (status: 'Finalized' | 'Draft' = 'Finalized') => {
    if (!validateAllBoxes()) {
      return;
    }

    if (!currentTemplate) return;

    try {
      setIsGenerating(true);

      // Extract core fields or first matching fields for database indexing
      const poBox = activeBoxes.find((b) => 
        b.name === 'po' || 
        b.label.toLowerCase() === 'po' || 
        b.name === 'customerPoNumber' || 
        b.id === 'fld-po' || 
        b.label.toLowerCase().includes('po')
      ) || activeBoxes[0];
      
      const batchBox = activeBoxes.find((b) => 
        b.name === 'batchNumber' || 
        b.name === 'batch' || 
        b.id === 'fld-batch' || 
        b.label.toLowerCase().includes('batch') ||
        b.label.toLowerCase().includes('lot')
      ) || activeBoxes[1] || activeBoxes[0];

      const expiryBox = activeBoxes.find((b) => 
        b.name === 'expiryDate' || 
        b.name === 'expiry' || 
        b.id === 'fld-expiry' || 
        b.label.toLowerCase().includes('exp') ||
        b.label.toLowerCase().includes('val')
      ) || activeBoxes[2] || activeBoxes[0];

      const customerPoNumber = fieldValues[poBox?.id] || Object.values(fieldValues)[0] || 'PO-DEFAULT';
      const batchNumber = fieldValues[batchBox?.id] || Object.values(fieldValues)[1] || 'MN-BATCH-01';
      const expiryDate = fieldValues[expiryBox?.id] || new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0];

      // 100% WYSIWYG FIX: Capture the exact rendered DOM preview canvas into 300-DPI snapshot
      let renderedCanvasDataUrl: string | undefined;
      const previewNode = document.getElementById('generate-order-preview-canvas');
      if (previewNode) {
        try {
          const { toPng } = await import('html-to-image');
          renderedCanvasDataUrl = await toPng(previewNode, {
            pixelRatio: 2.5,
            cacheBust: true,
            backgroundColor: currentTemplate.canvasBgColor || '#ffffff',
          });
        } catch (snapErr) {
          console.warn('Canvas snapshot capture notice (vector fallback will be used):', snapErr);
        }
      }

      // Generate the official A4 Landscape PDF with exact matching visuals!
      const pdfResult = await generateA4LabelPdf({
        template: currentTemplate,
        order: {
          customerPoNumber,
          expiryDate,
          batchNumber,
          fieldValues,
          productName: currentTemplate.name,
          productCode: currentTemplate.code,
        },
        dateFormat,
        renderedCanvasDataUrl,
      });

      const orderPayload: any = {
        templateId: currentTemplate.id,
        customerPoNumber,
        expiryDate,
        batchNumber,
        fieldValues,
        manufacturingDate: new Date().toISOString().split('T')[0],
        status,
        pdfBase64: pdfResult.dataUrl,
        notes: orderNotes,
      };

      onOrderCreated(orderPayload, pdfResult.dataUrl);
    } catch (err: any) {
      console.error('Error generating label order:', err);
      setErrors({ form: err.message || 'Failed to generate PDF label. Please try again.' });
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick fill sample data for testing
  const handleQuickFillSample = () => {
    const sampleMap: Record<string, string> = {};
    activeBoxes.forEach((box, i) => {
      if (box.type === 'date') {
        const future = new Date();
        future.setFullYear(future.getFullYear() + 2);
        sampleMap[box.id] = future.toISOString().split('T')[0];
      } else if (box.label.toLowerCase().includes('po') || box.name.includes('po')) {
        sampleMap[box.id] = 'PO-ARAMCO-2026-984';
      } else if (box.label.toLowerCase().includes('batch') || box.name.includes('batch')) {
        sampleMap[box.id] = 'MN-CLN-2610-01';
      } else {
        sampleMap[box.id] = `SPEC-VAL-${i + 1}00`;
      }
    });
    setFieldValues(sampleMap);
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#092244] border border-[#163e72] text-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#071d3a] border-b border-[#163e72] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#00a3e0]/20 border border-[#00a3e0]/40 flex items-center justify-center text-[#00a3e0]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Generate Chemical Order Label</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {activeBoxes.length} Configured Boxes
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Product: <strong className="text-white">{currentTemplate?.name || 'MNCLEAN S'}</strong> ({currentTemplate?.code})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleQuickFillSample}
              className="text-xs px-2.5 py-1 rounded bg-[#00a3e0]/20 hover:bg-[#00a3e0]/30 text-[#00a3e0] border border-[#00a3e0]/40 flex items-center gap-1 transition"
              title="Populate test data into all custom boxes"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sample Data</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Exactly the boxes added to this template! */}
          <div className="lg:col-span-5 space-y-4">
            {/* Product Template Selector */}
            <div>
              <label htmlFor="modal-template-select" className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                Target Product Template
              </label>
              <select
                id="modal-template-select"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-3 py-2 bg-[#061833] border border-[#1c4880] rounded-lg text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00a3e0]"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code}) — {t.fields?.length || 3} Custom Boxes
                  </option>
                ))}
              </select>
            </div>

            {/* Error banner if any */}
            {errors.form && (
              <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Dynamic Custom Boxes Form */}
            <div className="bg-[#071d3a] p-4 rounded-xl border border-[#163e72] space-y-3.5 shadow-md">
              <div className="flex items-center justify-between pb-2 border-b border-[#163e72]">
                <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300">
                  Fill In Template Boxes ({activeBoxes.length}):
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  Auto-mapped to label coordinates
                </span>
              </div>

              {activeBoxes.map((box, index) => {
                const val = fieldValues[box.id] || '';
                const err = errors[box.id];
                const warn = warnings[box.id];

                return (
                  <div key={box.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
                        <span>{box.label || box.name}</span>
                        {box.required && <span className="text-rose-400 font-bold">*</span>}
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Box #{index + 1} ({box.type})
                      </span>
                    </div>

                    {box.type === 'date' ? (
                      <input
                        type="date"
                        value={val}
                        onChange={(e) => handleFieldValueChange(box.id, e.target.value)}
                        className={`w-full px-3 py-2 bg-[#061833] border rounded-lg text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#00a3e0] ${
                          err ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#1c4880]'
                        }`}
                      />
                    ) : box.type === 'number' ? (
                      <input
                        type="number"
                        value={val}
                        onChange={(e) => handleFieldValueChange(box.id, e.target.value)}
                        placeholder={box.placeholder || `Enter ${box.label}`}
                        className={`w-full px-3 py-2 bg-[#061833] border rounded-lg text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#00a3e0] ${
                          err ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#1c4880]'
                        }`}
                      />
                    ) : (
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleFieldValueChange(box.id, e.target.value)}
                        placeholder={box.placeholder || `Enter ${box.label}`}
                        className={`w-full px-3 py-2 bg-[#061833] border rounded-lg text-white font-mono text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00a3e0] ${
                          err ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#1c4880]'
                        }`}
                      />
                    )}

                    {err && (
                      <p className="text-[11px] text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{err}</span>
                      </p>
                    )}
                    {warn && (
                      <p className="text-[11px] text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{warn}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                Order Notes / Packaging Reference (Optional)
              </label>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Tanker #4, Rig 18 Cleanout"
                className="w-full px-3 py-2 bg-[#061833] border border-[#1c4880] rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00a3e0]"
              />
            </div>
          </div>

          {/* Right Column: Live Label Preview with entered text mapped into boxes */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-[#061833]/70 p-4 rounded-xl border border-[#163e72] min-h-[420px]">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#00a3e0]" />
                Live Dynamic Label Preview
              </span>
              <span className="text-[11px] text-[#00a3e0] font-mono">
                A4 Landscape (297 × 210 mm)
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center py-2 overflow-auto">
              <div className="w-full max-w-[620px]">
                {currentTemplate && (
                  <MNCleanLabelCanvas
                    template={currentTemplate}
                    fieldValues={fieldValues}
                    dateFormat={dateFormat}
                    canvasId="generate-order-preview-canvas"
                  />
                )}
              </div>
            </div>

            <div className="mt-2 text-[11px] text-slate-400 text-center shrink-0">
              Values entered into the popup appear inside the designated boxes on the printed label.
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#071d3a] border-t border-[#163e72] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition"
            >
              Clear Form
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition"
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleGenerate('Finalized')}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-[#00a3e0] hover:bg-[#028ec5] text-white font-bold text-sm shadow-lg hover:shadow-cyan-500/25 active:scale-95 transition disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <span>Generating A4 PDF...</span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Generate & Finalize Label</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
