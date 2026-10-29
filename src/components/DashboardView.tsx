import React, { useState } from 'react';
import { ProductTemplate, OrderLabel } from '../types/index.ts';
import { formatLabelDate } from '../utils/validation.ts';
import {
  Layers,
  FileText,
  CheckCircle2,
  Clock,
  PlusCircle,
  Search,
  ArrowRight,
  Download,
  Printer,
  Eye,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface DashboardViewProps {
  templates: ProductTemplate[];
  orders: OrderLabel[];
  onOpenGenerateModal: (template?: ProductTemplate) => void;
  onOpenCreateTemplateModal: () => void;
  onViewOrder: (order: OrderLabel) => void;
  onNavigateToProducts: () => void;
  onNavigateToHistory: () => void;
  dateFormat?: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'DD-MMM-YYYY';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  templates,
  orders,
  onOpenGenerateModal,
  onOpenCreateTemplateModal,
  onViewOrder,
  onNavigateToProducts,
  onNavigateToHistory,
  dateFormat = 'DD/MM/YYYY',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const activeTemplates = templates.filter((t) => t.status === 'active');
  const finalizedOrders = orders.filter((o) => o.status === 'Finalized');

  // Filter templates and orders by search
  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.customerPoNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-[#071d3a] via-[#0b284e] to-[#092244] rounded-2xl p-6 sm:p-8 border border-[#163e72] shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00a3e0]/15 border border-[#00a3e0]/30 text-[#00a3e0] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Industrial Packaging Compliance & A4 PDF Generator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            MNChem Chemical Label Studio
          </h1>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            Generate, verify, and export standardized GHS packaging labels for drums and bulk containers. Embed customer PO numbers, lot batches, and regulatory expiry dates onto verified A4 landscape artwork.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenGenerateModal()}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#00a3e0] hover:bg-[#028fc7] text-white font-bold text-sm shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Generate Order Label</span>
            </button>

            <button
              onClick={onOpenCreateTemplateModal}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition cursor-pointer"
            >
              <Layers className="w-4 h-4 text-cyan-300" />
              <span>Create Product Template</span>
            </button>
          </div>
        </div>

        {/* Decorative background watermark */}
        <div className="absolute right-4 -bottom-8 opacity-10 pointer-events-none select-none hidden lg:block">
          <img src="/logo.png" alt="" className="w-64 h-64 object-contain filter invert" />
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#0b284e]/70 border border-[#163e72] rounded-xl p-5 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Templates</p>
            <p className="text-2xl font-black text-white mt-1">{activeTemplates.length}</p>
            <p className="text-[11px] text-emerald-400 font-medium mt-1">Ready for packaging</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-[#00a3e0]">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#0b284e]/70 border border-[#163e72] rounded-xl p-5 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders Generated</p>
            <p className="text-2xl font-black text-white mt-1">{orders.length}</p>
            <p className="text-[11px] text-sky-400 font-medium mt-1">Audit trail preserved</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#0b284e]/70 border border-[#163e72] rounded-xl p-5 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Finalized Labels</p>
            <p className="text-2xl font-black text-white mt-1">{finalizedOrders.length}</p>
            <p className="text-[11px] text-emerald-400 font-medium mt-1">100% PDF verified</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#0b284e]/70 border border-[#163e72] rounded-xl p-5 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Standard Page Size</p>
            <p className="text-2xl font-black text-white mt-1">A4</p>
            <p className="text-[11px] text-amber-300 font-medium mt-1">297 × 210 mm Landscape</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Printer className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Search */}
      <div className="bg-[#0b284e]/60 border border-[#163e72] rounded-xl p-4 flex items-center space-x-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by product name, code (e.g. MNCLEAN S), customer PO number, or batch..."
          className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5"
          >
            Clear
          </button>
        )}
      </div>

      {/* Saved Product Templates Quick Access */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#00a3e0]" />
            <h2 className="text-lg font-bold text-white">Featured Product Templates</h2>
          </div>
          <button
            onClick={onNavigateToProducts}
            className="text-xs text-[#00a3e0] hover:text-cyan-300 font-semibold flex items-center space-x-1"
          >
            <span>View All ({templates.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.slice(0, 3).map((template) => (
            <div
              key={template.id}
              className="bg-[#0b284e]/80 border border-[#163e72] hover:border-[#00a3e0]/60 rounded-xl p-5 shadow-lg flex flex-col justify-between transition group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#071d3a] text-cyan-300 border border-[#1c4880]">
                      {template.code}
                    </span>
                    <h3 className="text-lg font-black text-white mt-2 group-hover:text-[#00a3e0] transition">
                      {template.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    {template.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                  {template.description}
                </p>

                <div className="mt-4 pt-3 border-t border-[#163e72]/60 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>Net Wt: <strong className="text-slate-200">{template.netWeight || '200 kg'}</strong></div>
                  <div>Flash Pt: <strong className="text-slate-200">{template.flashPoint || '> 65°C'}</strong></div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#163e72]/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">v{template.version}.0</span>
                <button
                  onClick={() => onOpenGenerateModal(template)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#00a3e0] hover:bg-[#028fc7] text-white text-xs font-bold shadow-sm transition active:scale-95 flex items-center space-x-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Generate Order Label</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#00a3e0]" />
            <h2 className="text-lg font-bold text-white">Recently Generated Orders</h2>
          </div>
          <button
            onClick={onNavigateToHistory}
            className="text-xs text-[#00a3e0] hover:text-cyan-300 font-semibold flex items-center space-x-1"
          >
            <span>View Full Order History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-[#0b284e]/40 border border-[#163e72] rounded-xl p-8 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto text-slate-500 mb-2 opacity-50" />
            <p className="text-sm">No orders match the search criteria.</p>
          </div>
        ) : (
          <div className="bg-[#0b284e]/70 border border-[#163e72] rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#071d3a] text-slate-200 uppercase tracking-wider text-[10px] border-b border-[#163e72]">
                  <tr>
                    <th className="px-4 py-3">Order #</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Customer PO #</th>
                    <th className="px-4 py-3">Batch #</th>
                    <th className="px-4 py-3">Expiry Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#163e72]/60">
                  {filteredOrders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition">
                      <td className="px-4 py-3 font-mono font-bold text-white">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3 font-semibold text-cyan-300">
                        {order.productName}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-200 font-bold">
                        {order.customerPoNumber}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-200">
                        {order.batchNumber}
                      </td>
                      <td className="px-4 py-3 font-mono text-rose-300">
                        {formatLabelDate(order.expiryDate, dateFormat)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onViewOrder(order)}
                          className="px-2.5 py-1 rounded bg-[#00a3e0]/20 hover:bg-[#00a3e0]/30 text-[#00a3e0] text-xs font-semibold inline-flex items-center space-x-1 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Label</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
