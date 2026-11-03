import React, { useState, useMemo } from 'react';
import { 
  Camera, 
  Plus, 
  Filter, 
  Search, 
  LayoutGrid, 
  Table as TableIcon, 
  Trash2, 
  Edit3, 
  Maximize2, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  Monitor, 
  Users, 
  BookOpen, 
  Mic, 
  HelpCircle,
  Sparkles,
  MapPin,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { AuditEvidence, EvidenceCategory, EvidenceSeverity, StageItem } from '../types';
import { CATEGORY_LABELS, SEVERITY_LABELS, SAMPLE_EVIDENCES } from '../utils/evidenceHelpers';
import { EvidenceLightbox } from './EvidenceLightbox';
import { EvidenceManagerModal } from './EvidenceManagerModal';

interface EvidenceTrackerProps {
  evidences?: AuditEvidence[];
  stages: StageItem[];
  onAddEvidence: (evidence: AuditEvidence) => void;
  onUpdateEvidence: (evidence: AuditEvidence) => void;
  onDeleteEvidence: (id: string) => void;
  onLoadSampleEvidences?: () => void;
  filterStageId?: string;
  defaultAuditor?: string;
  className?: string;
  compact?: boolean;
}

export const EvidenceTracker: React.FC<EvidenceTrackerProps> = ({
  evidences = [],
  stages,
  onAddEvidence,
  onUpdateEvidence,
  onDeleteEvidence,
  onLoadSampleEvidences,
  filterStageId,
  defaultAuditor = 'Inspektorat Jenderal Kementerian Perdagangan',
  className = '',
  compact = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>(filterStageId || 'all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState<AuditEvidence | null>(null);
  const [lightboxEvidence, setLightboxEvidence] = useState<AuditEvidence | null>(null);

  // Sync if prop filterStageId changes
  React.useEffect(() => {
    if (filterStageId) {
      setSelectedStageFilter(filterStageId);
    }
  }, [filterStageId]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = evidences.length;
    const kritis = evidences.filter((e) => e.severity === 'kritis').length;
    const sedang = evidences.filter((e) => e.severity === 'sedang').length;
    const ringan = evidences.filter((e) => e.severity === 'ringan').length;
    const withImage = evidences.filter((e) => !!e.imageUrl).length;
    return { total, kritis, sedang, ringan, withImage };
  }, [evidences]);

  // Filtered evidence list
  const filteredEvidences = useMemo(() => {
    return evidences.filter((ev) => {
      // Stage filter
      if (selectedStageFilter !== 'all') {
        if (selectedStageFilter === 'general') {
          if (ev.stageId !== 'all') return false;
        } else if (ev.stageId !== selectedStageFilter) {
          return false;
        }
      }

      // Category filter
      if (selectedCategoryFilter !== 'all' && ev.category !== selectedCategoryFilter) {
        return false;
      }

      // Severity filter
      if (selectedSeverityFilter !== 'all' && ev.severity !== selectedSeverityFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ev.title.toLowerCase().includes(q);
        const matchesDesc = ev.description.toLowerCase().includes(q);
        const matchesLoc = ev.locationOrSource?.toLowerCase().includes(q);
        const matchesDoc = ev.referenceDoc?.toLowerCase().includes(q);
        const matchesStage = ev.stageName?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesDoc && !matchesStage) {
          return false;
        }
      }

      return true;
    });
  }, [evidences, selectedStageFilter, selectedCategoryFilter, selectedSeverityFilter, searchQuery]);

  const handleOpenAddModal = (presetStageId?: string) => {
    setEditingEvidence(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ev: AuditEvidence) => {
    setEditingEvidence(ev);
    setIsModalOpen(true);
  };

  const handleSaveEvidence = (saved: AuditEvidence) => {
    if (editingEvidence) {
      onUpdateEvidence(saved);
    } else {
      onAddEvidence(saved);
    }
  };

  const getCategoryIcon = (cat: EvidenceCategory) => {
    switch (cat) {
      case 'screenshot_sistem': return <Monitor className="w-3.5 h-3.5" />;
      case 'dokumen_fisik': return <FileText className="w-3.5 h-3.5" />;
      case 'foto_antrean': return <Users className="w-3.5 h-3.5" />;
      case 'regulasi_sop': return <BookOpen className="w-3.5 h-3.5" />;
      case 'rekaman_audio': return <Mic className="w-3.5 h-3.5" />;
      default: return <HelpCircle className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden ${className}`}>
      {/* Top Header */}
      <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Pelacak Bukti Lapangan & Fakta Pengawasan
                </h3>
                <span className="text-slate-500" aria-hidden="true">·</span>
                <span className="text-xs font-mono font-semibold text-blue-300 tabular-nums">
                  {stats.total} Bukti Terdata
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Kompilasi dokumentasi visual, tangkapan layar sistem, dan dokumen fisik hasil investigasi Itjen Kemendag
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {evidences.length === 0 && onLoadSampleEvidences && (
              <button
                type="button"
                onClick={onLoadSampleEvidences}
                className="inline-flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                title="Muat contoh bukti temuan inspeksi standar Kemendag"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Muat Contoh Bukti Standar</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleOpenAddModal()}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Bukti Lapangan</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Counter Cards */}
        {!compact && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-800">
            <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700">
              <div className="text-[11px] text-slate-400">Total Temuan Bukti</div>
              <div className="text-lg font-bold text-white font-mono tabular-nums">{stats.total}</div>
            </div>
            <div className="bg-red-950/40 rounded-xl p-2.5 border border-red-800/50">
              <div className="text-[11px] text-red-300 flex items-center gap-1">
                <span>Temuan Kritis</span>
              </div>
              <div className="text-lg font-bold text-red-200 font-mono tabular-nums">{stats.kritis}</div>
            </div>
            <div className="bg-amber-950/40 rounded-xl p-2.5 border border-amber-800/50">
              <div className="text-[11px] text-amber-300 flex items-center gap-1">
                <span>Beban Sedang</span>
              </div>
              <div className="text-lg font-bold text-amber-200 font-mono tabular-nums">{stats.sedang}</div>
            </div>
            <div className="bg-blue-950/40 rounded-xl p-2.5 border border-blue-800/50">
              <div className="text-[11px] text-blue-300 flex items-center gap-1">
                <span>Lampiran Visual</span>
              </div>
              <div className="text-lg font-bold text-blue-200 font-mono tabular-nums">{stats.withImage} <span className="text-xs font-normal text-blue-300">Foto/Mockup</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari bukti, regulasi, fakta..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Filter by Stage */}
          <select
            value={selectedStageFilter}
            onChange={(e) => setSelectedStageFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Semua Tahapan</option>
            <option value="general">Temuan Umum / Lintas Tahapan</option>
            {stages.map((st) => (
              <option key={st.id} value={st.id}>
                {st.code}: {st.name}
              </option>
            ))}
          </select>

          {/* Filter by Severity */}
          <select
            value={selectedSeverityFilter}
            onChange={(e) => setSelectedSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Semua Tingkat Keparahan</option>
            <option value="kritis">🔴 Kritis</option>
            <option value="sedang">🟡 Sedang</option>
            <option value="ringan">🔵 Ringan</option>
          </select>

          {/* Filter by Category */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 hidden sm:inline-block"
          >
            <option value="all">Semua Kategori Bukti</option>
            <option value="screenshot_sistem">Tangkapan Layar Sistem</option>
            <option value="dokumen_fisik">Dokumen / Formulir Fisik</option>
            <option value="foto_antrean">Foto Antrean / Loket</option>
            <option value="regulasi_sop">Regulasi / SOP</option>
            <option value="rekaman_audio">Wawancara / Hotline</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded text-xs transition ${
              viewMode === 'grid' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Tampilan Galeri Kartu"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded text-xs transition ${
              viewMode === 'table' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Tampilan Tabel Log Audit"
          >
            <TableIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5">
        {filteredEvidences.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50">
            <Camera className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">Belum Ada Bukti Temuan Terpilih</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              {evidences.length === 0 
                ? 'Belum ada bukti lapangan yang dicatat. Anda dapat menambahkan foto, tangkapan layar portal INATRADE, atau memuat contoh inspeksi standar.'
                : 'Tidak ada bukti yang cocok dengan filter atau kata kunci pencarian Anda.'}
            </p>
            <div className="flex items-center justify-center gap-2">
              {evidences.length === 0 && onLoadSampleEvidences && (
                <button
                  type="button"
                  onClick={onLoadSampleEvidences}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition"
                >
                  Muat Contoh Bukti Standar Itjen
                </button>
              )}
              <button
                type="button"
                onClick={() => handleOpenAddModal()}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
              >
                + Tambah Bukti Pertama
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvidences.map((ev) => {
              const catMeta = CATEGORY_LABELS[ev.category] || CATEGORY_LABELS.lainnya;
              const sevMeta = SEVERITY_LABELS[ev.severity] || SEVERITY_LABELS.sedang;

              return (
                <div
                  key={ev.id}
                  className="group rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition flex flex-col overflow-hidden"
                >
                  {/* Card Visual / Thumbnail */}
                  {ev.imageUrl ? (
                    <div 
                      className="relative h-44 bg-slate-100 overflow-hidden cursor-pointer border-b border-slate-100"
                      onClick={() => setLightboxEvidence(ev)}
                    >
                      <img
                        src={ev.imageUrl}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        <span className="px-3 py-1 bg-white/90 text-slate-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Perbesar Foto</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-28 bg-slate-50 border-b border-slate-100 flex items-center justify-center text-slate-400 text-xs gap-1.5">
                      <Camera className="w-4 h-4 text-slate-300" />
                      <span>Lampiran Dokumen Teks</span>
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${sevMeta.badgeCls}`}>
                          {sevMeta.label.split(' ')[0]}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${catMeta.badgeCls} flex items-center gap-1`}>
                          {getCategoryIcon(ev.category)}
                          <span>{catMeta.label}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">
                          {ev.stageCode || 'Lintas Tahap'}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 
                        onClick={() => setLightboxEvidence(ev)}
                        className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition line-clamp-2 cursor-pointer"
                        title={ev.title}
                      >
                        {ev.title}
                      </h4>

                      {/* Fact Excerpt */}
                      <p className="text-[11px] text-slate-600 line-clamp-3 mt-1 leading-relaxed">
                        {ev.description}
                      </p>
                    </div>

                    {/* Metadata details */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[10px] text-slate-500">
                      {ev.locationOrSource && (
                        <div className="flex items-center gap-1.5 truncate" title={ev.locationOrSource}>
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{ev.locationOrSource}</span>
                        </div>
                      )}
                      {ev.referenceDoc && (
                        <div className="flex items-center gap-1.5 truncate text-blue-900 font-medium" title={ev.referenceDoc}>
                          <BookOpen className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className="truncate">{ev.referenceDoc}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-slate-400 pt-1">
                        <span>{ev.dateRecorded || 'Tercatat'}</span>
                        <span>{ev.auditorName ? ev.auditorName.split(' ')[0] : 'Itjen'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setLightboxEvidence(ev)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Rincian</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(ev)}
                        className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-200/60 transition"
                        title="Sunting Temuan Bukti"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Hapus bukti "${ev.title}"?`)) {
                            onDeleteEvidence(ev.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition"
                        title="Hapus Temuan Bukti"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View for Formal Audit Log */
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3 w-10">No</th>
                  <th className="py-2.5 px-3 w-28">Tahap</th>
                  <th className="py-2.5 px-3 w-36">Kategori</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Judul & Fakta Temuan</th>
                  <th className="py-2.5 px-3 min-w-[140px]">Lokasi / Sumber</th>
                  <th className="py-2.5 px-3 w-24">Risiko</th>
                  <th className="py-2.5 px-3 w-24 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvidences.map((ev, idx) => {
                  const catMeta = CATEGORY_LABELS[ev.category] || CATEGORY_LABELS.lainnya;
                  const sevMeta = SEVERITY_LABELS[ev.severity] || SEVERITY_LABELS.sedang;

                  return (
                    <tr key={ev.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {ev.stageCode || 'Lintas Tahap'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${catMeta.badgeCls} inline-flex items-center gap-1`}>
                          {getCategoryIcon(ev.category)}
                          <span>{catMeta.label.split(' ')[0]}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div 
                          onClick={() => setLightboxEvidence(ev)}
                          className="font-bold text-slate-900 hover:text-blue-700 cursor-pointer"
                        >
                          {ev.title}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {ev.description}
                        </div>
                        {ev.referenceDoc && (
                          <div className="text-[10px] text-blue-800 font-medium mt-0.5">
                            Rujukan: {ev.referenceDoc}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                        {ev.locationOrSource || '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${sevMeta.badgeCls}`}>
                          {sevMeta.label.split(' ')[0]}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setLightboxEvidence(ev)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Pratinjau Resolusi Penuh"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(ev)}
                            className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                            title="Sunting"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteEvidence(ev.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <EvidenceLightbox
        evidence={lightboxEvidence}
        onClose={() => setLightboxEvidence(null)}
      />

      {/* Editor Modal */}
      <EvidenceManagerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stages={stages}
        defaultStageId={selectedStageFilter !== 'all' && selectedStageFilter !== 'general' ? selectedStageFilter : stages[0]?.id}
        initialEvidence={editingEvidence}
        onSaveEvidence={handleSaveEvidence}
        defaultAuditor={defaultAuditor}
      />
    </div>
  );
};
