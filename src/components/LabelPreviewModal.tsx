import React, { useState } from 'react';
import { ProductTemplate, OrderLabel } from '../types/index.ts';
import { MNCleanLabelCanvas } from './MNCleanLabelCanvas.tsx';
import { X, Download, Printer, ZoomIn, ZoomOut, Maximize2, CheckCircle, Info, ExternalLink, FileImage, Loader2 } from 'lucide-react';

interface LabelPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderLabel;
  template: ProductTemplate;
  pdfDataUrl?: string;
  dateFormat?: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'DD-MMM-YYYY';
}

export const LabelPreviewModal: React.FC<LabelPreviewModalProps> = ({
  isOpen,
  onClose,
  order,
  template,
  pdfDataUrl,
  dateFormat = 'DD/MM/YYYY',
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);
      const canvasElem = document.getElementById('final-label-preview-canvas');
      if (canvasElem) {
        const { toPng } = await import('html-to-image');
        const renderedCanvasDataUrl = await toPng(canvasElem, {
          pixelRatio: 2.5,
          cacheBust: true,
          backgroundColor: template.canvasBgColor || '#ffffff',
        });

        const { generateA4LabelPdf } = await import('../utils/label-pdf.ts');
        const result = await generateA4LabelPdf({
          template,
          order,
          dateFormat,
          renderedCanvasDataUrl,
        });

        const link = document.createElement('a');
        link.href = result.dataUrl;
        link.download = `${template.name.replace(/\s+/g, '_')}_PO-${order.customerPoNumber || 'SPEC'}_A4.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
    } catch (e) {
      console.warn('Live PDF re-generation failed, falling back to existing PDF:', e);
    } finally {
      setIsExporting(false);
    }

    if (pdfDataUrl) {
      const link = document.createElement('a');
      link.href = pdfDataUrl;
      link.download = `${template.name.replace(/\s+/g, '_')}_PO-${order.customerPoNumber}_A4.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (order.pdfUrl) {
      window.open(order.pdfUrl, '_blank');
    }
  };

  const handleDownloadImage = async () => {
    try {
      setIsExporting(true);
      const canvasElem = document.getElementById('final-label-preview-canvas');
      if (canvasElem) {
        const { toPng } = await import('html-to-image');
        const imgUrl = await toPng(canvasElem, {
          pixelRatio: 3,
          cacheBust: true,
          backgroundColor: template.canvasBgColor || '#ffffff',
        });
        const link = document.createElement('a');
        link.href = imgUrl;
        link.download = `${template.name.replace(/\s+/g, '_')}_PO-${order.customerPoNumber || 'SPEC'}_Label.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Error downloading PNG label:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (pdfDataUrl) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print Label - ${template.name}</title>
              <style>
                @page { size: A4 landscape; margin: 0; }
                body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #fff; }
                iframe { width: 100%; height: 100%; border: none; }
              </style>
            </head>
            <body>
              <iframe src="${pdfDataUrl}"></iframe>
              <script>
                setTimeout(() => { window.print(); }, 800);
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#092244] border border-[#163e72] text-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="px-6 py-3.5 bg-[#071d3a] border-b border-[#163e72] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">
                  {order.productName} — Finalized Order Label
                </h2>
                <span className="text-xs font-mono font-bold bg-[#00a3e0]/20 text-[#00a3e0] px-2 py-0.5 rounded border border-[#00a3e0]/40">
                  {order.orderNumber}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                PO: <strong className="text-white">{order.customerPoNumber}</strong> | Batch: <strong className="text-white">{order.batchNumber}</strong> | Expiry: <strong className="text-white">{order.expiryDate}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center bg-[#061833] rounded-lg border border-[#1c4880] p-1 space-x-1">
              <button
                onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
                className="p-1 text-slate-400 hover:text-white rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-2 text-slate-300">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                className="p-1 text-slate-400 hover:text-white rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="p-1 text-slate-400 hover:text-white rounded"
                title="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Guideline Notice Banner */}
        <div className="bg-sky-950/80 border-b border-sky-800/60 px-6 py-2 text-xs text-sky-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-[#00a3e0] shrink-0" />
            <span>
              <strong>Print Specification:</strong> Select <strong>A4</strong> paper, <strong>Landscape</strong> orientation, and <strong>100% (Actual Size)</strong> in your printer dialog.
            </span>
          </div>
          <span className="hidden md:inline text-[11px] font-mono text-sky-300">
            A4: 297 × 210 mm (841.89 × 595.28 pt)
          </span>
        </div>

        {/* Canvas Display Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 bg-[#040e1c] flex items-center justify-center">
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
              width: '100%',
              maxWidth: '920px',
            }}
          >
            <MNCleanLabelCanvas
              template={template}
              customerPoNumber={order.customerPoNumber}
              expiryDate={order.expiryDate}
              batchNumber={order.batchNumber}
              manufacturingDate={order.manufacturingDate}
              fieldValues={order.fieldValues}
              dateFormat={dateFormat}
              canvasId="final-label-preview-canvas"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-[#071d3a] border-t border-[#163e72] flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            Status: <span className="text-emerald-400 font-semibold">{order.status}</span> • Created: {new Date(order.createdAt).toLocaleString()}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              disabled={isExporting}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#0d3466] hover:bg-[#124483] text-white text-sm font-semibold transition border border-[#1e5296] cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-[#00a3e0]" />
              <span>Print Label</span>
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#0d3466] hover:bg-[#124483] text-cyan-200 hover:text-white text-sm font-semibold transition border border-cyan-800/60 cursor-pointer disabled:opacity-50"
              title="Download 300 DPI high-resolution PNG image"
            >
              <FileImage className="w-4 h-4 text-cyan-400" />
              <span>Download PNG</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-[#00a3e0] hover:bg-[#028fc7] text-white text-sm font-bold shadow-lg transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download A4 PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
