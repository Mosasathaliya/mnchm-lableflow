import React, { useState } from 'react';
import { OrderLabel, ProductTemplate } from '../types/index.ts';
import { formatLabelDate } from '../utils/validation.ts';
import {
  History,
  Search,
  Filter,
  Eye,
  Download,
  Printer,
  FileText,
  Calendar,
  CheckCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface OrderHistoryViewProps {
  orders: OrderLabel[];
  templates: ProductTemplate[];
  onViewOrder: (order: OrderLabel) => void;
  onOpenGenerateModal: () => void;
  dateFormat?: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'DD-MMM-YYYY';
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  orders,
  templates,
  onViewOrder,
  onOpenGenerateModal,
  dateFormat = 'DD/MM/YYYY',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Finalized' | 'Draft'>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Filter orders
  const filtered = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesProduct = productFilter === 'all' || o.productName === productFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      o.customerPoNumber.toLowerCase().includes(q) ||
      o.batchNumber.toLowerCase().includes(q) ||
      o.productName.toLowerCase().includes(q) ||
      o.orderNumber.toLowerCase().includes(q);

    return matchesStatus && matchesProduct && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedOrders = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uniqueProductNames = Array.from(new Set(orders.map((o) => o.productName)));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-6 h-6 text-[#00a3e0]" />
            <h1 className="text-2xl font-black text-white tracking-tight">Order Packaging Label History</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Complete audit trail of all generated chemical packaging labels. View, download, or re-print finalized labels anytime.
          </p>
        </div>

        <button
          onClick={onOpenGenerateModal}
          className="px-4 py-2.5 rounded-lg bg-[#00a3e0] hover:bg-[#028fc7] text-white font-bold text-sm shadow-lg transition active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <span>Generate New Order Label</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0b284e]/70 border border-[#163e72] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search PO #, Batch #, or Order #..."
            className="w-full pl-9 pr-4 py-2 bg-[#061833] border border-[#1c4880] rounded-lg text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#00a3e0]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Product Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-400 font-semibold">Product:</span>
            <select
              value={productFilter}
              onChange={(e) => {
                setProductFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-[#061833] border border-[#1c4880] rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#00a3e0]"
            >
              <option value="all">All Products</option>
              {uniqueProductNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-400 font-semibold">Status:</span>
            {(['all', 'Finalized', 'Draft'] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition ${
                  statusFilter === s
                    ? 'bg-[#00a3e0] text-white shadow-sm'
                    : 'bg-[#071d3a] text-slate-300 hover:bg-white/10'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {filtered.length === 0 ? (
        <div className="bg-[#0b284e]/40 border border-[#163e72] rounded-xl p-12 text-center text-slate-400">
          <FileText className="w-12 h-12 mx-auto text-slate-500 mb-3 opacity-50" />
          <h3 className="text-base font-bold text-slate-200">No Orders Match Your Criteria</h3>
          <p className="text-xs text-slate-400 mt-1">Adjust filters or generate a new packaging label.</p>
        </div>
      ) : (
        <div className="bg-[#0b284e]/70 border border-[#163e72] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#071d3a] text-slate-200 uppercase tracking-wider text-[10px] border-b border-[#163e72]">
                <tr>
                  <th className="px-4 py-3">Order Number</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Customer PO #</th>
                  <th className="px-4 py-3">Batch Number</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#163e72]/60">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3 font-mono font-bold text-white">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 font-bold text-cyan-300">
                      {order.productName}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-200 font-bold">
                      {order.customerPoNumber}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-200">
                      {order.batchNumber}
                    </td>
                    <td className="px-4 py-3 font-mono text-rose-300 font-semibold">
                      {formatLabelDate(order.expiryDate, dateFormat)}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          order.status === 'Finalized'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => onViewOrder(order)}
                        className="px-2.5 py-1 rounded bg-[#00a3e0]/20 hover:bg-[#00a3e0]/30 text-[#00a3e0] text-xs font-semibold inline-flex items-center space-x-1 transition"
                        title="View & Re-print Label"
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-4 py-3 bg-[#071d3a] border-t border-[#163e72] flex items-center justify-between text-xs text-slate-400">
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} orders
              </div>
              <div className="flex items-center space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded bg-[#061833] border border-[#1c4880] text-slate-300 hover:text-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-slate-200">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded bg-[#061833] border border-[#1c4880] text-slate-300 hover:text-white disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
