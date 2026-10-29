import React, { useState } from 'react';
import { ProductTemplate } from '../types/index.ts';
import {
  Layers,
  Search,
  PlusCircle,
  Copy,
  Archive,
  RotateCcw,
  Edit,
  Eye,
  FileCheck,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface ProductLibraryViewProps {
  templates: ProductTemplate[];
  onOpenGenerateModal: (template: ProductTemplate) => void;
  onOpenEditModal: (template: ProductTemplate) => void;
  onOpenCreateModal: () => void;
  onDuplicateTemplate: (templateId: string) => Promise<void>;
  onArchiveTemplate: (templateId: string) => Promise<void>;
}

export const ProductLibraryView: React.FC<ProductLibraryViewProps> = ({
  templates,
  onOpenGenerateModal,
  onOpenEditModal,
  onOpenCreateModal,
  onDuplicateTemplate,
  onArchiveTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const filtered = templates.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.name.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const handleDuplicate = async (id: string) => {
    try {
      setActionLoadingId(id);
      await onDuplicateTemplate(id);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      setActionLoadingId(id);
      await onArchiveTemplate(id);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-6 h-6 text-[#00a3e0]" />
            <h1 className="text-2xl font-black text-white tracking-tight">Product Label Library</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Manage reusable chemical packaging artwork templates, specifications, and variable field coordinate layouts.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenCreateModal}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-[#00a3e0] hover:bg-[#028ec5] text-white font-bold text-sm shadow-lg transition active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Product Label (Blank Canvas & Box Tool)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0b284e]/70 border border-[#163e72] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full md:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates (e.g. MNCLEAN S, solvent, MNC-CLN)..."
            className="w-full pl-9 pr-4 py-2 bg-[#061833] border border-[#1c4880] rounded-lg text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#00a3e0]"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-2 self-start md:self-auto">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-1">Status:</span>
          {(['active', 'all', 'archived'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
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

      {/* Grid of Templates */}
      {filtered.length === 0 ? (
        <div className="bg-[#0b284e]/40 border border-[#163e72] rounded-xl p-12 text-center text-slate-400">
          <Layers className="w-12 h-12 mx-auto text-slate-500 mb-3 opacity-50" />
          <h3 className="text-base font-bold text-slate-200">No Product Templates Found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((template) => (
            <div
              key={template.id}
              className="bg-[#0b284e]/85 border border-[#163e72] hover:border-[#00a3e0]/60 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between transition group"
            >
              {/* Card Header */}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#071d3a] text-cyan-300 border border-[#1c4880]">
                      {template.code}
                    </span>
                    <h3 className="text-xl font-black text-white mt-2 group-hover:text-[#00a3e0] transition">
                      {template.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">{template.category}</p>
                  </div>

                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                      template.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-500/20 text-slate-400 border-slate-500/40'
                    }`}
                  >
                    {template.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-3 line-clamp-2">
                  {template.description}
                </p>

                {/* Key Technical Properties */}
                <div className="mt-4 pt-3 border-t border-[#163e72]/60 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div>
                    <span className="text-slate-400">Net Weight:</span>{' '}
                    <strong className="text-white">{template.netWeight || '200 kg'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">UN Number:</span>{' '}
                    <strong className="text-white">{template.unNumber || 'UN 1993'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Flash Point:</span>{' '}
                    <strong className="text-white">{template.flashPoint || '> 65°C'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Density:</span>{' '}
                    <strong className="text-white">{template.density || '1.0 g/cm³'}</strong>
                  </div>
                </div>

                <div className="mt-3 text-[10px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>Modified: {new Date(template.updatedAt).toLocaleDateString()}</span>
                  <span className="ml-auto font-mono">Version {template.version}.0</span>
                </div>
              </div>

              {/* Card Footer / Primary Action & Menu */}
              <div className="p-4 bg-[#071d3a] border-t border-[#163e72] flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenGenerateModal(template)}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#00a3e0] hover:bg-[#028fc7] text-white text-xs font-bold shadow-md transition active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Generate Order Label</span>
                </button>

                <button
                  onClick={() => onOpenEditModal(template)}
                  title="Edit Template & Field Layout"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                >
                  <Edit className="w-4 h-4 text-cyan-300" />
                </button>

                <button
                  onClick={() => handleDuplicate(template.id)}
                  disabled={actionLoadingId === template.id}
                  title="Duplicate Template"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                >
                  <Copy className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  onClick={() => handleArchive(template.id)}
                  disabled={actionLoadingId === template.id}
                  title={template.status === 'active' ? 'Archive Template' : 'Restore Template'}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                >
                  {template.status === 'active' ? (
                    <Archive className="w-4 h-4 text-amber-400" />
                  ) : (
                    <RotateCcw className="w-4 h-4 text-sky-400" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
