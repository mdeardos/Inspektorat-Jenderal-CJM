import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Edit3, 
  LayoutGrid, 
  Columns3, 
  Table as TableIcon, 
  Filter, 
  AlertTriangle, 
  Plus, 
  Trash2,
  Sparkles,
  HelpCircle,
  Camera,
  ExternalLink,
  BookOpen,
  ChevronDown,
  Layers,
  Zap,
  Check,
  FilePlus,
  RefreshCw
} from 'lucide-react';
import { EvaluationState, StageItem, ViewMode, AuditEvidence } from '../types';
import { STAGE_TEMPLATES, StageTemplate, getStandard5StageSkeleton } from '../data/stageTemplates';
import { EmotionChart } from './EmotionChart';
import { EvidenceTracker } from './EvidenceTracker';
import { EvidenceManagerModal } from './EvidenceManagerModal';
import { EvidenceLightbox } from './EvidenceLightbox';

interface Step2CJMCanvasProps {
  state: EvaluationState;
  onUpdateStage: (index: number, updatedStage: StageItem) => void;
  onBatchUpdateStages: (stages: StageItem[]) => void;
  onAddStage: () => void;
  onDeleteStage: (index: number) => void;
  onMoveStage?: (index: number, direction: 'left' | 'right') => void;
  onForceSave?: () => void;
  activeStageIdx: number;
  onSetActiveStageIdx: (index: number) => void;
  onNext: () => void;
  onAddEvidence?: (evidence: AuditEvidence) => void;
  onUpdateEvidence?: (evidence: AuditEvidence) => void;
  onDeleteEvidence?: (id: string) => void;
  onLoadSampleEvidences?: () => void;
}

export const Step2CJMCanvas: React.FC<Step2CJMCanvasProps> = ({
  state,
  onUpdateStage,
  onBatchUpdateStages,
  onAddStage,
  onDeleteStage,
  onMoveStage,
  onForceSave,
  activeStageIdx,
  onSetActiveStageIdx,
  onNext,
  onAddEvidence,
  onUpdateEvidence,
  onDeleteEvidence,
  onLoadSampleEvidences
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [burdenFilter, setBurdenFilter] = useState<'all' | 'learning' | 'compliance' | 'psychological' | 'negative'>('all');
  const [saveToast, setSaveToast] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const saveTimeoutRef = React.useRef<any>(null);
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [lightboxEvidence, setLightboxEvidence] = useState<AuditEvidence | null>(null);

  // Stage Template Dropdown States
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [templateInsertMode, setTemplateInsertMode] = useState<'append_new' | 'replace_active'>('append_new');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<'all' | 'core' | 'support' | 'post'>('all');
  const [templateToast, setTemplateToast] = useState<string | null>(null);
  const [templateConfirmSkeleton, setTemplateConfirmSkeleton] = useState(false);
  const templateMenuRef = useRef<HTMLDivElement>(null);
  const templateToastTimeoutRef = useRef<any>(null);

  // Close template menu on click outside or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (templateMenuRef.current && !templateMenuRef.current.contains(event.target as Node)) {
        setIsTemplateMenuOpen(false);
        setTemplateConfirmSkeleton(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsTemplateMenuOpen(false);
        setTemplateConfirmSkeleton(false);
      }
    }
    if (isTemplateMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTemplateMenuOpen]);

  const showTemplateToast = (msg: string) => {
    setTemplateToast(msg);
    if (templateToastTimeoutRef.current) {
      clearTimeout(templateToastTimeoutRef.current);
    }
    templateToastTimeoutRef.current = setTimeout(() => {
      setTemplateToast(null);
    }, 3200);
  };

  const handleInjectTemplate = (tpl: StageTemplate, overrideMode?: 'append_new' | 'replace_active') => {
    const mode = overrideMode || templateInsertMode;
    if (mode === 'replace_active' && state.stages[safeIdx]) {
      const current = state.stages[safeIdx];
      const updated: StageItem = {
        ...current,
        name: tpl.name,
        subtitle: tpl.subtitle,
        action: tpl.action,
        touchpoint: tpl.touchpoint,
        response: tpl.response,
        burden: tpl.burden,
        learning: tpl.learning,
        compliance: tpl.compliance,
        psychological: tpl.psychological,
        emotion: tpl.emotion,
        opportunity: tpl.opportunity
      };
      onUpdateStage(safeIdx, updated);
      onForceSave?.();
      showTemplateToast(`Templat '${tpl.name}' berhasil disisipkan ke ${current.code || `Tahap ${safeIdx + 1}`}`);
    } else {
      // Append as new stage
      const nextNum = state.stages.length + 1;
      const newStage: StageItem = {
        id: `stage-${Date.now()}`,
        code: `Tahap ${nextNum}`,
        name: tpl.name,
        subtitle: tpl.subtitle,
        action: tpl.action,
        touchpoint: tpl.touchpoint,
        response: tpl.response,
        burden: tpl.burden,
        learning: tpl.learning,
        compliance: tpl.compliance,
        psychological: tpl.psychological,
        emotion: tpl.emotion,
        opportunity: tpl.opportunity
      };
      onBatchUpdateStages([...state.stages, newStage]);
      onSetActiveStageIdx(state.stages.length);
      onForceSave?.();
      showTemplateToast(`Tahap baru '${tpl.name}' berhasil ditambahkan ke kanvas`);
    }
    setIsTemplateMenuOpen(false);
  };

  const handleApplyStandardSkeleton = () => {
    const standardStages = getStandard5StageSkeleton();
    onBatchUpdateStages(standardStages);
    onSetActiveStageIdx(0);
    onForceSave?.();
    setIsTemplateMenuOpen(false);
    setTemplateConfirmSkeleton(false);
    showTemplateToast('Kerangka standar 5 tahap (Awareness s.d. Post-Service) berhasil dimuat');
  };

  // Safe fallback stage object if empty
  const defaultFallbackStage: StageItem = {
    id: 'stage-1',
    code: 'Tahap 1',
    name: 'Tahap Awal',
    subtitle: '',
    action: '',
    touchpoint: '',
    response: '',
    burden: '',
    learning: false,
    compliance: false,
    psychological: false,
    emotion: 0,
    opportunity: ''
  };

  const safeIdx = Math.max(0, Math.min(activeStageIdx, (state.stages.length || 1) - 1));
  const activeStage = state.stages[safeIdx] || defaultFallbackStage;

  const handleFieldChange = (field: keyof StageItem, value: any) => {
    if (!state.stages[safeIdx]) return;
    const updated = { ...state.stages[safeIdx], [field]: value };
    onUpdateStage(safeIdx, updated);
  };

  const handleSaveClick = (advanceNext: boolean = false) => {
    // 1. Force save state to localStorage immediately
    onForceSave?.();

    // 2. Trigger feedback states
    setSaveToast(true);
    setSaveSuccess(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      setSaveToast(false);
      setSaveSuccess(false);
    }, 2800);

    // 3. Advance to next stage if requested
    if (advanceNext && state.stages.length > 0) {
      const nextIdx = (safeIdx + 1) % state.stages.length;
      onSetActiveStageIdx(nextIdx);
    }
  };

  const getEmotionMeta = (score: number) => {
    const num = Number(score);
    if (num === 2) return { label: '+2 Sangat Puas', cls: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
    if (num === 1) return { label: '+1 Cukup Mudah', cls: 'bg-teal-50 text-teal-800 border-teal-300' };
    if (num === 0) return { label: '0 Netral', cls: 'bg-slate-100 text-slate-700 border-slate-300' };
    if (num === -1) return { label: '-1 Menghambat', cls: 'bg-amber-50 text-amber-800 border-amber-300' };
    return { label: '-2 Sangat Sulit', cls: 'bg-rose-50 text-rose-800 border-rose-300' };
  };

  // Filtered stage IDs for highlighting or filtering
  const isStageHighlighted = (st: StageItem) => {
    if (burdenFilter === 'all') return true;
    if (burdenFilter === 'learning') return st.learning;
    if (burdenFilter === 'compliance') return st.compliance;
    if (burdenFilter === 'psychological') return st.psychological;
    if (burdenFilter === 'negative') return st.emotion < 0;
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Context Top Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="font-bold text-slate-900">{state.service || 'Nama Layanan Belum Diisi'}</span>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span>Persona: <strong className="text-slate-800">{state.personaName || 'Belum diisi'}</strong></span>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span>Unit: <strong className="text-slate-800">{state.unit || '-'}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
          >
            <span>Lanjut ke Rencana Co-Design</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ====================================================
           FORM EDIT TAHAPAN CJM (DENGAN TABS & KONTROL LENGKAP)
           ==================================================== */}
      <div id="stage-editor-card" className="bg-white rounded-xl border-2 border-blue-900/20 shadow-xs p-5">
        <div className="flex flex-col gap-3 pb-4 mb-4 border-b border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-700" />
                <span>Form Pengisian & Evaluasi Tahapan CJM</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih tab tahapan di bawah untuk mengubah rincian evaluasi. Setiap ketikan langsung tersimpan secara otomatis.
              </p>
            </div>

            {/* Toast Indicators */}
            <div className="flex flex-wrap items-center gap-2">
              {templateToast && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-300 text-blue-900 text-xs font-semibold animate-in fade-in duration-200 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>{templateToast}</span>
                </div>
              )}
              {saveToast && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold animate-in fade-in duration-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Perubahan berhasil diverifikasi dan tersimpan</span>
                </div>
              )}
            </div>
          </div>

          {/* Stage Selector Tabs & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 flex-1 min-w-[280px]">
              {state.stages.map((st, idx) => {
                const isActive = idx === safeIdx;
                const emo = getEmotionMeta(st.emotion);

                const stEvidenceCount = (state.evidences || []).filter((e) => e.stageId === st.id).length;

                return (
                  <button
                    key={st.id || idx}
                    type="button"
                    onClick={() => onSetActiveStageIdx(idx)}
                    className={`text-left p-2.5 rounded-lg border transition-all flex flex-col justify-between ${
                      isActive
                        ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 w-full">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-blue-200' : 'text-blue-900'}`}>
                        {st.code || `Tahap ${idx + 1}`}
                      </span>
                      <div className="flex items-center gap-1">
                        {stEvidenceCount > 0 && (
                          <span 
                            className={`text-[9px] px-1 py-0.2 rounded font-bold flex items-center gap-0.5 ${
                              isActive ? 'bg-amber-400 text-amber-950' : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                            title={`${stEvidenceCount} Bukti Lapangan Terlampir`}
                          >
                            <Camera className="w-2.5 h-2.5" />
                            <span>{stEvidenceCount}</span>
                          </span>
                        )}
                        <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded border ${isActive ? 'bg-white/20 text-white border-transparent' : emo.cls}`}>
                          {st.emotion > 0 ? `+${st.emotion}` : st.emotion}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs font-bold mt-1 truncate w-full">
                      {st.name || `Tahap ${idx + 1}`}
                    </div>
                    <div className={`text-[11px] truncate w-full ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                      {st.subtitle || '-'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Action Group: Add Stage & Stage Template Dropdown */}
            <div className="flex items-center gap-2 self-stretch">
              <button
                type="button"
                onClick={onAddStage}
                className="inline-flex items-center justify-center gap-1.5 p-2.5 rounded-lg border border-dashed border-slate-300 hover:border-blue-600 hover:bg-blue-50/50 text-slate-600 hover:text-blue-800 text-xs font-semibold transition self-stretch min-w-[95px]"
                title="Tambah tahapan baru kosong ke dalam perjalanan layanan"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tahap</span>
              </button>

              {/* Stage Templates Dropdown Menu */}
              <div className="relative inline-block" ref={templateMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsTemplateMenuOpen((prev) => !prev);
                    setTemplateConfirmSkeleton(false);
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-xs font-semibold transition self-stretch shadow-2xs ${
                    isTemplateMenuOpen
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-blue-50/80 hover:bg-blue-100 text-blue-900 border-blue-200'
                  }`}
                  title="Buka menu templat tahapan umum untuk menyusun kerangka perjalanan layanan"
                  aria-expanded={isTemplateMenuOpen}
                  aria-haspopup="true"
                >
                  <Layers className={`w-3.5 h-3.5 ${isTemplateMenuOpen ? 'text-white' : 'text-blue-700'}`} />
                  <span>Templat Tahap</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isTemplateMenuOpen ? 'rotate-180 text-white' : 'text-blue-700'}`} />
                </button>

                {/* Dropdown Menu Popover Panel */}
                {isTemplateMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-84 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-300 z-50 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-900">
                    {/* Popover Header */}
                    <div className="border-b border-slate-200 pb-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-blue-100 text-blue-800">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">Templat Tahapan Layanan</h4>
                            <p className="text-[11px] text-slate-500">Pilih templat untuk mempercepat penyusunan kerangka CJM</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsTemplateMenuOpen(false)}
                          className="text-slate-400 hover:text-slate-700 text-xs px-1.5 py-0.5 rounded hover:bg-slate-100"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Insertion Mode Switcher */}
                      <div className="mt-2.5 flex items-center justify-between gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setTemplateInsertMode('append_new')}
                          className={`flex-1 py-1 px-2 rounded-md font-semibold transition text-center ${
                            templateInsertMode === 'append_new'
                              ? 'bg-white text-blue-900 shadow-2xs border border-slate-200'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          + Tambah Tahap Baru
                        </button>
                        <button
                          type="button"
                          onClick={() => setTemplateInsertMode('replace_active')}
                          className={`flex-1 py-1 px-2 rounded-md font-semibold transition text-center ${
                            templateInsertMode === 'replace_active'
                              ? 'bg-white text-blue-900 shadow-2xs border border-slate-200'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Ganti {activeStage.code || 'Tahap Aktif'}
                        </button>
                      </div>
                    </div>

                    {/* Category Filter Tabs */}
                    <div className="flex items-center gap-1 text-[10px] overflow-x-auto pb-0.5">
                      {(['all', 'core', 'support', 'post'] as const).map((cat) => {
                        const labels = {
                          all: 'Semua',
                          core: 'Inti Layanan',
                          support: 'Pendukung & PNBP',
                          post: 'Pasca-Layanan'
                        };
                        const isActive = templateCategoryFilter === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setTemplateCategoryFilter(cat)}
                            className={`px-2 py-0.8 rounded-md font-semibold transition shrink-0 ${
                              isActive
                                ? 'bg-blue-900 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {labels[cat]}
                          </button>
                        );
                      })}
                    </div>

                    {/* Scrollable Templates List */}
                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {STAGE_TEMPLATES
                        .filter((tpl) => templateCategoryFilter === 'all' || tpl.category === templateCategoryFilter)
                        .map((tpl) => {
                          const emoMeta = getEmotionMeta(tpl.emotion);
                          return (
                            <div
                              key={tpl.id}
                              className="group p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50/60 hover:border-blue-300 transition-all text-left"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-200 text-slate-800">
                                      {tpl.badge}
                                    </span>
                                    <span className={`text-[9px] font-mono font-semibold px-1 py-0.2 rounded border ${emoMeta.cls}`}>
                                      {tpl.emotion > 0 ? `+${tpl.emotion}` : tpl.emotion}
                                    </span>
                                  </div>
                                  <div className="text-xs font-bold text-slate-900 mt-1">
                                    {tpl.name}
                                  </div>
                                  <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                                    {tpl.subtitle}
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-1 truncate">
                                    Saluran: <strong className="text-slate-700">{tpl.touchpoint}</strong>
                                  </div>
                                </div>
                              </div>

                              {/* Dual Action Buttons per Card */}
                              <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleInjectTemplate(tpl, 'replace_active')}
                                  className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-[10px] font-semibold text-slate-700 transition"
                                  title={`Ganti konten ${activeStage.code || 'Tahap Aktif'} dengan templat ini`}
                                >
                                  Ganti {activeStage.code || 'Tahap Aktif'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleInjectTemplate(tpl, 'append_new')}
                                  className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold transition flex items-center gap-1 shadow-2xs"
                                  title="Tambahkan sebagai tahap baru di urutan akhir kanvas"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>Tambah Baru</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Bottom Action: Standard 5-Stage Journey Skeleton */}
                    <div className="pt-2 border-t border-slate-200">
                      {!templateConfirmSkeleton ? (
                        <button
                          type="button"
                          onClick={() => setTemplateConfirmSkeleton(true)}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition"
                          title="Muat kerangka perjalanan standar 5 tahap (Awareness s.d. Post-Service)"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-700" />
                          <span>Bangun Kerangka Standar (5 Tahap Lengkap)</span>
                        </button>
                      ) : (
                        <div className="p-2.5 rounded-lg border border-amber-300 bg-amber-50/90 space-y-2 text-left">
                          <div className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span>Ganti dengan kerangka standar 5 tahap?</span>
                          </div>
                          <p className="text-[10px] text-amber-900 leading-relaxed">
                            Akan memuat 5 tahap baku (Pencarian Informasi, Pengajuan Permohonan, Verifikasi, Penerbitan, dan Pasca-Layanan).
                          </p>
                          <div className="flex items-center justify-end gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => setTemplateConfirmSkeleton(false)}
                              className="px-2 py-1 rounded text-[10px] font-semibold text-slate-700 hover:bg-amber-100"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={handleApplyStandardSkeleton}
                              className="px-2.5 py-1 rounded bg-amber-700 hover:bg-amber-800 text-white text-[10px] font-bold transition shadow-2xs"
                            >
                              Ya, Muat Kerangka Standar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Template Chips for Current Active Stage */}
        <div className="mb-3 px-3 py-2 rounded-lg bg-blue-50/50 border border-blue-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-blue-950 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span>Templat Cepat untuk <strong className="text-blue-900">{activeStage.code || `Tahap ${safeIdx + 1}`}</strong>:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {STAGE_TEMPLATES.slice(0, 5).map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleInjectTemplate(tpl, 'replace_active')}
                className="px-2 py-1 rounded-md bg-white hover:bg-blue-100 text-slate-800 hover:text-blue-900 border border-slate-200 text-[11px] font-medium transition shadow-2xs"
                title={`Terapkan templat '${tpl.name}' ke ${activeStage.code}`}
              >
                {tpl.name.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Stage Name & Subtitle Editor Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Urutan Tahap
            </label>
            <input
              type="text"
              value={activeStage.code}
              onChange={(e) => handleFieldChange('code', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Tahap 1"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Tahapan (Dapat Disesuaikan)
            </label>
            <input
              type="text"
              value={activeStage.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Contoh: Awareness / Pencarian Informasi"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan Singkat Tahapan
            </label>
            <input
              type="text"
              value={activeStage.subtitle}
              onChange={(e) => handleFieldChange('subtitle', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Contoh: Pencarian Informasi & Regulasi"
            />
          </div>
        </div>

        {/* 3-Column Core CJM Evaluation Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Customer Action, Touchpoints, Staff/System Response */}
          <div className="space-y-3 bg-slate-50/60 p-3.5 rounded-lg border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                1. Aktivitas Pengguna (Customer Action)
              </label>
              <textarea
                rows={3}
                value={activeStage.action}
                onChange={(e) => handleFieldChange('action', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Apa tindakan nyata yang dilakukan warga pada tahap ini?"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                2. Saluran Layanan (Touchpoints)
              </label>
              <input
                type="text"
                value={activeStage.touchpoint}
                onChange={(e) => handleFieldChange('touchpoint', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Contoh: Portal Web OSS, Loket PTSP, WhatsApp"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                3. Respons Petugas / Sistem
              </label>
              <textarea
                rows={3}
                value={activeStage.response}
                onChange={(e) => handleFieldChange('response', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Bagaimana reaksi sistem atau perlakuan petugas saat menerima tindakan warga?"
              />
            </div>
          </div>

          {/* Column 2: Administrative Burden (Hambatan & Beban) */}
          <div className="space-y-3 bg-rose-50/50 p-3.5 rounded-lg border border-rose-200/80">
            <div>
              <label className="block text-xs font-semibold text-rose-950 mb-1">
                4. Hambatan / Keluhan Pengguna (Pain Points)
              </label>
              <textarea
                rows={4}
                value={activeStage.burden}
                onChange={(e) => handleFieldChange('burden', e.target.value)}
                className="w-full rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-600"
                placeholder="Kendala apa yang dirasakan warga? Tuliskan hambatan spesifik..."
              />
            </div>
            <div>
              <span className="block text-xs font-bold text-rose-950 mb-2 flex items-center justify-between">
                <span>Klasifikasi 3 Beban Administratif:</span>
                <span className="text-[10px] text-rose-700 font-normal">Klik untuk aktifkan</span>
              </span>

              <div className="grid grid-cols-1 gap-2">
                {/* Beban Informasi (Learning) */}
                <button
                  type="button"
                  onClick={() => handleFieldChange('learning', !activeStage.learning)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                    activeStage.learning
                      ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/30 text-amber-950 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className={`mt-0.5 p-1 rounded-md shrink-0 ${activeStage.learning ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Beban Informasi (Learning)</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${activeStage.learning ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-500'}`}>
                        {activeStage.learning ? 'Aktif' : 'Nihil'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      Syarat, regulasi, atau prosedur berbelit dan membingungkan warga.
                    </p>
                  </div>
                </button>

                {/* Beban Kepatuhan (Compliance) */}
                <button
                  type="button"
                  onClick={() => handleFieldChange('compliance', !activeStage.compliance)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                    activeStage.compliance
                      ? 'bg-blue-500/10 border-blue-500 ring-1 ring-blue-500/30 text-blue-950 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className={`mt-0.5 p-1 rounded-md shrink-0 ${activeStage.compliance ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Beban Kepatuhan (Compliance)</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${activeStage.compliance ? 'bg-blue-200 text-blue-900' : 'bg-slate-100 text-slate-500'}`}>
                        {activeStage.compliance ? 'Aktif' : 'Nihil'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      Berkas fotokopi berulang, antrean fisik, formulir tebal, atau biaya.
                    </p>
                  </div>
                </button>

                {/* Beban Psikologis (Psychological) */}
                <button
                  type="button"
                  onClick={() => handleFieldChange('psychological', !activeStage.psychological)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                    activeStage.psychological
                      ? 'bg-rose-500/10 border-rose-500 ring-1 ring-rose-500/30 text-rose-950 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className={`mt-0.5 p-1 rounded-md shrink-0 ${activeStage.psychological ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Beban Psikologis (Psychological)</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${activeStage.psychological ? 'bg-rose-200 text-rose-900' : 'bg-slate-100 text-slate-500'}`}>
                        {activeStage.psychological ? 'Aktif' : 'Nihil'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      Ketidakpastian waktu (SLA), stres, cemas berkas ditolak, atau petugas kaku.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Column 3: Emotion Rating & Opportunities */}
          <div className="space-y-3 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/80 flex flex-col justify-between">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center justify-between">
                  <span>5. Skor Pengalaman Warga (-2 s.d. +2)</span>
                  <span className="font-mono text-xs font-extrabold text-blue-700">
                    Skor: {activeStage.emotion > 0 ? `+${activeStage.emotion}` : activeStage.emotion}
                  </span>
                </label>
                
                {/* 5 Interactive Emotion Buttons */}
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { score: 2, icon: '😄', label: '+2 Puas', color: 'hover:bg-emerald-50', activeCls: 'bg-emerald-600 text-white shadow-xs border-emerald-700 ring-2 ring-emerald-500/30' },
                    { score: 1, icon: '🙂', label: '+1 Mudah', color: 'hover:bg-teal-50', activeCls: 'bg-teal-600 text-white shadow-xs border-teal-700 ring-2 ring-teal-500/30' },
                    { score: 0, icon: '😐', label: '0 Netral', color: 'hover:bg-slate-50', activeCls: 'bg-slate-700 text-white shadow-xs border-slate-800 ring-2 ring-slate-500/30' },
                    { score: -1, icon: '🙁', label: '-1 Hambat', color: 'hover:bg-amber-50', activeCls: 'bg-amber-600 text-white shadow-xs border-amber-700 ring-2 ring-amber-500/30' },
                    { score: -2, icon: '😡', label: '-2 Sulit', color: 'hover:bg-rose-50', activeCls: 'bg-rose-600 text-white shadow-xs border-rose-700 ring-2 ring-rose-500/30' }
                  ].map((emo) => {
                    const isCurrent = activeStage.emotion === emo.score;
                    return (
                      <button
                        key={emo.score}
                        type="button"
                        onClick={() => handleFieldChange('emotion', emo.score)}
                        className={`py-2 px-1 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none ${
                          isCurrent
                            ? emo.activeCls
                            : `bg-white border-slate-200 text-slate-700 ${emo.color}`
                        }`}
                      >
                        <span className="text-base leading-none">{emo.icon}</span>
                        <span className="text-[10px] font-bold tracking-tight">{emo.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-950 mb-1">
                  6. Peluang Perbaikan (Opportunities)
                </label>
                <textarea
                  rows={4}
                  value={activeStage.opportunity}
                  onChange={(e) => handleFieldChange('opportunity', e.target.value)}
                  className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  placeholder="Rekomendasi solusi konkret untuk memangkas beban warga di tahap ini..."
                />
              </div>
            </div>

            <div className="text-[11px] text-emerald-800 bg-emerald-100/60 p-2 rounded border border-emerald-200">
              💡 <em>Usulan perbaikan di kolom ini nantinya dapat ditarik otomatis ke dokumen Rencana Tindak Lanjut Co-Design.</em>
            </div>
          </div>
        </div>

        {/* Stage Evidence Section / Pelacak Bukti Lapangan Tahap Ini */}
        {(() => {
          const currentStageEvidences = (state.evidences || []).filter((e) => e.stageId === activeStage.id);

          return (
            <div className="mt-4 p-3.5 rounded-xl border border-blue-200 bg-blue-50/40">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-700 flex items-center justify-center">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    Bukti Lapangan Terlampir pada {activeStage.code || 'Tahap Ini'} ({currentStageEvidences.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStageModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Lampirkan Bukti di Tahap Ini</span>
                </button>
              </div>

              {currentStageEvidences.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic">
                  Belum ada bukti visual (screenshot portal INATRADE/antrean/dokumen fisik) yang dilampirkan khusus untuk tahap ini.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                  {currentStageEvidences.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setLightboxEvidence(ev)}
                      className="p-2.5 bg-white rounded-lg border border-slate-200 hover:border-blue-400 cursor-pointer transition shadow-2xs group flex items-start gap-2.5"
                    >
                      {ev.imageUrl ? (
                        <img
                          src={ev.imageUrl}
                          alt={ev.title}
                          className="w-12 h-12 rounded object-cover border border-slate-100 shrink-0 group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <Camera className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-red-700 truncate">
                          {ev.severity.toUpperCase()}
                        </div>
                        <div className="text-xs font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-700">
                          {ev.title}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {ev.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* Action Button Row */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const prev = (safeIdx - 1 + state.stages.length) % state.stages.length;
                onSetActiveStageIdx(prev);
              }}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tahap Sebelumnya</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const next = (safeIdx + 1) % state.stages.length;
                onSetActiveStageIdx(next);
              }}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
            >
              <span>Tahap Berikutnya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {state.stages.length > 1 && onMoveStage && (
              <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                <button
                  type="button"
                  disabled={safeIdx === 0}
                  onClick={() => onMoveStage(safeIdx, 'left')}
                  className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-xs font-medium text-slate-700 transition"
                  title="Geser posisi tahapan ini ke urutan sebelumnya (kiri)"
                >
                  <ArrowLeft className="w-3 h-3 text-slate-500" />
                  <span>Geser Kiri</span>
                </button>
                <button
                  type="button"
                  disabled={safeIdx >= state.stages.length - 1}
                  onClick={() => onMoveStage(safeIdx, 'right')}
                  className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-xs font-medium text-slate-700 transition"
                  title="Geser posisi tahapan ini ke urutan setelahnya (kanan)"
                >
                  <span>Geser Kanan</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                </button>
              </div>
            )}

            {state.stages.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  if (!deleteConfirming) {
                    setDeleteConfirming(true);
                    setTimeout(() => setDeleteConfirming(false), 3000);
                  } else {
                    setDeleteConfirming(false);
                    onDeleteStage(safeIdx);
                  }
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border text-xs font-medium transition ${
                  deleteConfirming
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : 'border-slate-300 hover:bg-rose-50 text-slate-600 hover:text-rose-700'
                }`}
                title="Hapus tahapan ini dari perjalanan"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteConfirming ? 'Yakin Hapus Tahap Ini?' : 'Hapus Tahap'}</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {saveSuccess && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold animate-in fade-in zoom-in-95 duration-150">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Tahap {activeStage.code || ''} Berhasil Disimpan!</span>
              </div>
            )}

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSaveClick(false)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-xs cursor-pointer active:scale-95 select-none ${
                saveSuccess
                  ? 'bg-emerald-700 text-white ring-2 ring-emerald-400 shadow-sm'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-sm'
              }`}
              title="Simpan data tahapan ini sekarang"
            >
              <CheckCircle2 className={`w-4 h-4 ${saveSuccess ? 'text-emerald-200' : 'text-white'}`} />
              <span>{saveSuccess ? 'Tersimpan & Tervalidasi ✓' : 'Simpan / OK'}</span>
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSaveClick(true)}
              className="inline-flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-xs cursor-pointer select-none"
              title="Simpan dan lanjut ke tahapan berikutnya"
            >
              <span>Simpan & Pindah Tahap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Experience Curve Chart */}
      <EmotionChart
        stages={state.stages}
        activeStageIndex={safeIdx}
        onSelectStage={onSetActiveStageIdx}
        onUpdateEmotion={(idx, score) => {
          const target = state.stages[idx];
          if (target) {
            onUpdateStage(idx, { ...target, emotion: score });
          }
        }}
      />

      {/* ====================================================
           PAPAN KANVAS CJM DENGAN TAMPILAN FLEKSIBEL
           ==================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Papan Kanvas Perjalanan Warga (Customer Journey Map Board)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Seluruh teks ditampilkan secara utuh tanpa pemotongan (zero-clipping). Klik kartu untuk mengedit di form atas.
            </p>
          </div>

          {/* View Mode Controls & Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Burden Filter */}
            <div className="flex items-center gap-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={burdenFilter}
                onChange={(e) => setBurdenFilter(e.target.value as any)}
                className="bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="all">Semua Tahap (6/6)</option>
                <option value="learning">Hanya Beban Informasi</option>
                <option value="compliance">Hanya Beban Kepatuhan</option>
                <option value="psychological">Hanya Beban Psikologis</option>
                <option value="negative">Hanya Titik Gesekan (-1 / -2)</option>
              </select>
            </div>

            {/* View Mode Toggles */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan 3 Kolom Rapi"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>3 Kolom</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('panorama')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === 'panorama'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan 6 Kolom Memanjang"
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span>Panorama</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Matriks Tabular"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tabel</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Mode 1 & 2: Cards Grid / Panorama */}
        {viewMode !== 'table' ? (
          <div className={viewMode === 'panorama' ? 'overflow-x-auto pb-4 custom-scrollbar' : ''}>
            <div
              className={
                viewMode === 'panorama'
                  ? 'grid grid-cols-6 gap-4 min-w-[1580px]'
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              }
            >
              {state.stages.map((st, idx) => {
                const isActive = idx === activeStageIdx;
                const emo = getEmotionMeta(st.emotion);
                const isMatched = isStageHighlighted(st);

                const burdens = [];
                if (st.learning) burdens.push('Beban Informasi');
                if (st.compliance) burdens.push('Beban Kepatuhan');
                if (st.psychological) burdens.push('Beban Psikologis');

                return (
                  <div
                    key={st.id || idx}
                    onClick={() => onSetActiveStageIdx(idx)}
                    className={`cursor-pointer rounded-xl border p-4 flex flex-col justify-between gap-3 transition-all ${
                      isActive
                        ? 'border-blue-800 bg-blue-50/30 ring-2 ring-blue-800/20 shadow-xs'
                        : isMatched
                        ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                        : 'bg-slate-50/50 border-slate-200 opacity-40'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="border-b border-slate-200/90 pb-2.5 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {st.code || `Tahap ${idx + 1}`}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${emo.cls}`}>
                            {emo.label}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 break-words">
                            {st.name || '-'}
                          </h4>
                          <p className="text-xs text-slate-500 break-words">
                            {st.subtitle || '-'}
                          </p>
                        </div>
                      </div>

                      {/* 1. Customer Action */}
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                        <div className="text-[10px] font-bold uppercase text-slate-600 mb-1">
                          1. Aktivitas Pengguna
                        </div>
                        <p className="text-xs text-slate-800 whitespace-pre-line break-words leading-relaxed">
                          {st.action || <span className="italic text-slate-400">Belum diisi</span>}
                        </p>
                      </div>

                      {/* 2 & 3. Touchpoints & Response */}
                      <div className="bg-blue-50/40 p-2.5 rounded-lg border border-blue-200/70 space-y-2">
                        <div>
                          <div className="text-[10px] font-bold uppercase text-blue-950 mb-0.5">
                            2. Saluran (Touchpoints)
                          </div>
                          <div className="text-xs font-semibold text-slate-900 break-words">
                            {st.touchpoint || '-'}
                          </div>
                        </div>
                        <div className="pt-1.5 border-t border-blue-200/50">
                          <div className="text-[10px] font-bold uppercase text-blue-950 mb-0.5">
                            3. Respons Petugas / Sistem
                          </div>
                          <p className="text-xs text-slate-700 whitespace-pre-line break-words leading-relaxed">
                            {st.response || '-'}
                          </p>
                        </div>
                      </div>

                      {/* 4. Pain Points & Burden Tags */}
                      <div className="bg-rose-50/60 p-2.5 rounded-lg border border-rose-200/90">
                        <div className="text-[10px] font-bold uppercase text-rose-950 mb-1">
                          4. Hambatan & Beban Pengguna
                        </div>
                        <p className="text-xs text-slate-800 whitespace-pre-line break-words leading-relaxed">
                          {st.burden || <span className="italic text-slate-400">Tidak ada keluhan</span>}
                        </p>
                        {burdens.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {burdens.map((b, bIdx) => (
                              <span
                                key={bIdx}
                                className="text-[10px] px-2 py-0.5 rounded bg-rose-200/80 text-rose-950 font-semibold"
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 6. Opportunities & Action Button */}
                    <div className="space-y-2 pt-1">
                      <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200/90">
                        <div className="text-[10px] font-bold uppercase text-emerald-950 mb-1">
                          6. Usulan Perbaikan (Opportunities)
                        </div>
                        <p className="text-xs text-slate-800 whitespace-pre-line break-words leading-relaxed">
                          {st.opportunity || <span className="italic text-slate-400">Belum dirumuskan</span>}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetActiveStageIdx(idx);
                          const el = document.getElementById('stage-editor-card');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                          isActive
                            ? 'bg-blue-900 text-white border-blue-900'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isActive ? 'Sedang Diedit di Form Atas' : 'Edit Tahap Ini'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* View Mode 3: Tabular Matrix View */
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse border border-slate-200 text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-800 text-left">
                  <th className="border border-slate-300 px-3 py-2.5 w-36">Tahapan</th>
                  <th className="border border-slate-300 px-3 py-2.5">Aktivitas & Saluran</th>
                  <th className="border border-slate-300 px-3 py-2.5">Respons Layanan</th>
                  <th className="border border-slate-300 px-3 py-2.5">Hambatan & Beban</th>
                  <th className="border border-slate-300 px-3 py-2.5">Usulan Perbaikan</th>
                  <th className="border border-slate-300 px-3 py-2.5 w-24 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {state.stages.map((st, idx) => {
                  const isActive = idx === activeStageIdx;
                  const emo = getEmotionMeta(st.emotion);
                  const burdens = [];
                  if (st.learning) burdens.push('Informasi');
                  if (st.compliance) burdens.push('Kepatuhan');
                  if (st.psychological) burdens.push('Psikologis');

                  return (
                    <tr
                      key={st.id || idx}
                      onClick={() => onSetActiveStageIdx(idx)}
                      className={`cursor-pointer transition-colors ${
                        isActive ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="border border-slate-300 px-3 py-2.5 font-semibold text-slate-900 align-top">
                        <div className="text-blue-950 font-bold">{st.code}: {st.name}</div>
                        <div className="text-[11px] text-slate-500">{st.subtitle}</div>
                        <div className={`mt-1.5 inline-block text-[10px] px-1.5 py-0.5 rounded border ${emo.cls}`}>
                          {emo.label}
                        </div>
                      </td>
                      <td className="border border-slate-300 px-3 py-2.5 text-slate-800 align-top leading-relaxed">
                        <div className="font-medium">{st.action || '-'}</div>
                        <div className="text-[11px] text-slate-500 mt-1 font-normal">
                          Saluran: <strong className="text-slate-700">{st.touchpoint || '-'}</strong>
                        </div>
                      </td>
                      <td className="border border-slate-300 px-3 py-2.5 text-slate-700 align-top leading-relaxed">
                        {st.response || '-'}
                      </td>
                      <td className="border border-slate-300 px-3 py-2.5 text-slate-800 align-top leading-relaxed">
                        <div>{st.burden || '-'}</div>
                        {burdens.length > 0 && (
                          <div className="mt-1 text-[10px] font-bold text-rose-800">
                            Beban: {burdens.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="border border-slate-300 px-3 py-2.5 text-slate-800 align-top leading-relaxed">
                        {st.opportunity || '-'}
                      </td>
                      <td className="border border-slate-300 px-3 py-2.5 text-center align-top">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSetActiveStageIdx(idx);
                            document.getElementById('stage-editor-card')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-semibold transition"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Panel Pelacak Bukti Lapangan & Fakta Pengawasan */}
      <div id="evidence-tracker-section" className="mt-8 pt-6 border-t border-slate-200">
        <EvidenceTracker
          evidences={state.evidences}
          stages={state.stages}
          onAddEvidence={onAddEvidence || (() => {})}
          onUpdateEvidence={onUpdateEvidence || (() => {})}
          onDeleteEvidence={onDeleteEvidence || (() => {})}
          onLoadSampleEvidences={onLoadSampleEvidences}
          filterStageId={activeStage.id}
          defaultAuditor={state.auditor}
        />
      </div>

      {/* Lightbox for stage-level clicks */}
      <EvidenceLightbox
        evidence={lightboxEvidence}
        onClose={() => setLightboxEvidence(null)}
      />

      {/* Modal for adding evidence pre-filled to activeStage.id */}
      <EvidenceManagerModal
        isOpen={stageModalOpen}
        onClose={() => setStageModalOpen(false)}
        stages={state.stages}
        defaultStageId={activeStage.id}
        onSaveEvidence={(saved) => {
          onAddEvidence?.(saved);
        }}
        defaultAuditor={state.auditor}
      />
    </div>
  );
};
