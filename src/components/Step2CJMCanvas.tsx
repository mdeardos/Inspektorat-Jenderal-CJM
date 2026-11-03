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
  BookOpen, 
  ChevronDown, 
  Layers, 
  Zap, 
  ShieldAlert,
  FileCheck,
  TrendingDown,
  TrendingUp,
  Activity,
  Award,
  ChevronRight
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
  const [activeTabSubView, setActiveTabSubView] = useState<'cjm' | 'audit5c'>('cjm');

  // Stage Template Dropdown States
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [templateInsertMode, setTemplateInsertMode] = useState<'append_new' | 'replace_active'>('append_new');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<'all' | 'core' | 'support' | 'post'>('all');
  const [templateToast, setTemplateToast] = useState<string | null>(null);
  const [templateConfirmSkeleton, setTemplateConfirmSkeleton] = useState(false);
  const templateMenuRef = useRef<HTMLDivElement>(null);
  const templateToastTimeoutRef = useRef<any>(null);

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
    onForceSave?.();
    setSaveToast(true);
    setSaveSuccess(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      setSaveToast(false);
      setSaveSuccess(false);
    }, 2800);

    if (advanceNext && state.stages.length > 0) {
      const nextIdx = (safeIdx + 1) % state.stages.length;
      onSetActiveStageIdx(nextIdx);
    }
  };

  // Helper to pre-populate 5C from CJM inputs
  const handleAutoPopulate5C = () => {
    if (!activeStage) return;
    const updated: StageItem = {
      ...activeStage,
      condition: activeStage.condition || activeStage.burden || activeStage.action || 'Fakta operasional teramati di lapangan.',
      criteria: activeStage.criteria || 'Standar Pelayanan Publik & SOP Unit Kerja Terkait.',
      cause: activeStage.cause || 'Proses verifikasi manual dan keterbatasan integrasi sistem.',
      consequence: activeStage.consequence || 'Penundaan waktu layanan dan peningkatan beban pelaku usaha.',
      recommendation: activeStage.recommendation || activeStage.opportunity || 'Otomasi alur persetujuan dan integrasi data lintas unit.'
    };
    onUpdateStage(safeIdx, updated);
    showTemplateToast('Matriks 5C berhasil diisi dari data CJM');
  };

  const getEmotionMeta = (score: number) => {
    const num = Number(score);
    if (num === 2) return { label: '+2 Sangat Puas', cls: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
    if (num === 1) return { label: '+1 Cukup Mudah', cls: 'bg-teal-50 text-teal-800 border-teal-300' };
    if (num === 0) return { label: '0 Netral', cls: 'bg-slate-100 text-slate-700 border-slate-300' };
    if (num === -1) return { label: '-1 Menghambat', cls: 'bg-amber-50 text-amber-800 border-amber-300' };
    return { label: '-2 Sangat Sulit', cls: 'bg-rose-50 text-rose-800 border-rose-300' };
  };

  const isStageHighlighted = (st: StageItem) => {
    if (burdenFilter === 'all') return true;
    if (burdenFilter === 'learning') return st.learning;
    if (burdenFilter === 'compliance') return st.compliance;
    if (burdenFilter === 'psychological') return st.psychological;
    if (burdenFilter === 'negative') return st.emotion < 0;
    return true;
  };

  // KPI Calculations
  const totalStages = state.stages.length || 1;
  const criticalCount = state.stages.filter(s => s.emotion < 0).length;
  const learningCount = state.stages.filter(s => s.learning).length;
  const complianceCount = state.stages.filter(s => s.compliance).length;
  const psychologicalCount = state.stages.filter(s => s.psychological).length;
  const avgEmotion = (state.stages.reduce((acc, s) => acc + s.emotion, 0) / totalStages).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Context Top Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="font-extrabold text-[#07162c] text-sm">{state.service || 'Nama Layanan Belum Diisi'}</span>
          <span className="text-slate-300" aria-hidden="true">&bull;</span>
          <span>Persona: <strong className="text-slate-800">{state.personaName || 'Belum diisi'}</strong></span>
          <span className="text-slate-300" aria-hidden="true">&bull;</span>
          <span>Unit: <strong className="text-slate-800">{state.unit || '-'}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-1.5 bg-[#07162c] hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span>Lanjut ke Rencana Co-Design</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* ====================================================
           EXECUTIVE KPI RIBBON (HIGH-CONTRAST METRIC CARDS)
           ==================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Total Tahapan</div>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">{totalStages} <span className="text-xs font-normal text-slate-500">fase</span></div>
        </div>
        <div className="bg-white rounded-xl border border-rose-200 p-3 shadow-2xs">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700">Titik Kritis (Friction)</div>
          <div className="text-xl font-extrabold font-mono text-rose-700 mt-1">{criticalCount} <span className="text-xs font-normal text-slate-500">tahap</span></div>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-3 shadow-2xs">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">Beban Belajar</div>
          <div className="text-xl font-extrabold font-mono text-amber-700 mt-1">{learningCount} <span className="text-xs font-normal text-slate-500">tahap</span></div>
        </div>
        <div className="bg-white rounded-xl border border-blue-200 p-3 shadow-2xs">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700">Beban Kepatuhan</div>
          <div className="text-xl font-extrabold font-mono text-blue-700 mt-1">{complianceCount} <span className="text-xs font-normal text-slate-500">tahap</span></div>
        </div>
        <div className="bg-white rounded-xl border border-purple-200 p-3 shadow-2xs">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700">Beban Psikologis</div>
          <div className="text-xl font-extrabold font-mono text-purple-700 mt-1">{psychologicalCount} <span className="text-xs font-normal text-slate-500">tahap</span></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Indeks Kepuasan</div>
          <div className={`text-xl font-extrabold font-mono mt-1 ${Number(avgEmotion) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {Number(avgEmotion) > 0 ? `+${avgEmotion}` : avgEmotion} <span className="text-xs font-normal text-slate-500">/ 2.0</span>
          </div>
        </div>
      </div>

      {/* ====================================================
           STAGE EDITOR WITH HORIZONTAL JOURNEY RAIL & 5C
           ==================================================== */}
      <div id="stage-editor-card" className="bg-white rounded-2xl border-2 border-slate-300 shadow-xs p-5">
        <div className="flex flex-col gap-3 pb-4 mb-4 border-b border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold text-[#07162c] uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-700" />
                <span>Pengujian Perjalanan Warga & Kertas Kerja Audit 5C</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih tahapan perjalanan layanan di bawah. Setiap pengisian langsung tersimpan secara otomatis.
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

          {/* Connected Horizontal Journey Rail */}
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
                    className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                      isActive
                        ? 'bg-[#07162c] text-white border-[#07162c] shadow-sm ring-2 ring-amber-400/60'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 w-full">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isActive ? 'text-amber-300' : 'text-blue-900'}`}>
                        {st.code || `Tahap ${idx + 1}`}
                      </span>
                      <div className="flex items-center gap-1">
                        {stEvidenceCount > 0 && (
                          <span 
                            className={`text-[9px] px-1 py-0.2 rounded font-bold flex items-center gap-0.5 ${
                              isActive ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-900 border border-amber-300'
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
                    <div className="text-xs font-bold mt-1.5 truncate w-full">
                      {st.name || `Tahap ${idx + 1}`}
                    </div>
                    <div className={`text-[11px] truncate w-full mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                      {st.subtitle || '-'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Action: Add Stage & Templates Dropdown */}
            <div className="flex items-center gap-2 self-stretch">
              <button
                type="button"
                onClick={onAddStage}
                className="inline-flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-dashed border-slate-300 hover:border-blue-600 hover:bg-blue-50/50 text-slate-700 hover:text-blue-900 text-xs font-bold transition self-stretch min-w-[95px] cursor-pointer"
                title="Tambah tahapan baru ke dalam kanvas"
              >
                <Plus className="w-4 h-4 text-blue-700" />
                <span>+ Tahap</span>
              </button>

              <div className="relative inline-block" ref={templateMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsTemplateMenuOpen((prev) => !prev);
                    setTemplateConfirmSkeleton(false);
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition self-stretch shadow-2xs cursor-pointer ${
                    isTemplateMenuOpen
                      ? 'bg-blue-700 text-white border-blue-800'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-950 border-blue-200'
                  }`}
                  title="Pilih templat tahapan umum layanan Kemendag"
                >
                  <Layers className={`w-3.5 h-3.5 ${isTemplateMenuOpen ? 'text-white' : 'text-blue-700'}`} />
                  <span>Templat</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isTemplateMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isTemplateMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-300 z-50 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-900">
                    <div className="border-b border-slate-200 pb-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">Templat Tahapan Layanan</h4>
                            <p className="text-[11px] text-slate-500">Pilih templat tahapan baku untuk mempercepat analisis</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsTemplateMenuOpen(false)}
                          className="text-slate-400 hover:text-slate-700 text-xs px-2 py-1 rounded hover:bg-slate-100"
                        >
                          ✕
                        </button>
                      </div>

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
                            className={`px-2 py-1 rounded-md font-semibold transition shrink-0 ${
                              isActive
                                ? 'bg-[#07162c] text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {labels[cat]}
                          </button>
                        );
                      })}
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {STAGE_TEMPLATES
                        .filter((tpl) => templateCategoryFilter === 'all' || tpl.category === templateCategoryFilter)
                        .map((tpl) => {
                          const emoMeta = getEmotionMeta(tpl.emotion);
                          return (
                            <div
                              key={tpl.id}
                              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/60 hover:border-blue-300 transition-all text-left"
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

                              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleInjectTemplate(tpl, 'replace_active')}
                                  className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-[10px] font-semibold text-slate-700 transition"
                                >
                                  Ganti {activeStage.code || 'Tahap Aktif'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleInjectTemplate(tpl, 'append_new')}
                                  className="px-2.5 py-1 rounded bg-blue-700 hover:bg-blue-800 text-white text-[10px] font-bold transition flex items-center gap-1 shadow-2xs"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>Tambah Baru</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      {!templateConfirmSkeleton ? (
                        <button
                          type="button"
                          onClick={() => setTemplateConfirmSkeleton(true)}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-700" />
                          <span>Bangun Kerangka Standar (5 Tahap Lengkap)</span>
                        </button>
                      ) : (
                        <div className="p-2.5 rounded-xl border border-amber-300 bg-amber-50 space-y-2 text-left">
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
                              className="px-2.5 py-1 rounded text-[10px] font-semibold text-slate-700 hover:bg-amber-100"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={handleApplyStandardSkeleton}
                              className="px-3 py-1 rounded bg-amber-700 hover:bg-amber-800 text-white text-[10px] font-bold transition shadow-2xs"
                            >
                              Ya, Muat Kerangka
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

        {/* View Toggle: CJM Journey vs Audit 5C Framework */}
        <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTabSubView('cjm')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTabSubView === 'cjm'
                  ? 'bg-[#07162c] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Dimensi Perjalanan Warga (CJM)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTabSubView('audit5c')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTabSubView === 'audit5c'
                  ? 'bg-[#07162c] text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>Kertas Kerja Temuan Audit (5C)</span>
              <span className="text-[10px] bg-amber-400 text-slate-950 px-1 rounded font-mono font-extrabold">IIA</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleAutoPopulate5C}
            className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            title="Tarik otomatis temuan hambatan CJM ke lembar temuan 5C"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Sinkronisasi CJM ke 5C</span>
          </button>
        </div>

        {/* Stage Name & Subtitle Editor Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Urutan Tahap
            </label>
            <input
              type="text"
              value={activeStage.code}
              onChange={(e) => handleFieldChange('code', e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Tahap 1"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Tahapan Layanan
            </label>
            <input
              type="text"
              value={activeStage.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Contoh: Pengajuan Permohonan & Berkas"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Keterangan Singkat Tahapan
            </label>
            <input
              type="text"
              value={activeStage.subtitle}
              onChange={(e) => handleFieldChange('subtitle', e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Contoh: Pengunggahan Dokumen Persyaratan INATRADE"
            />
          </div>
        </div>

        {/* SUBVIEW 1: STANDARD CJM FIELDS */}
        {activeTabSubView === 'cjm' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Action, Touchpoints, Response */}
            <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  1. Aktivitas Pengguna (Customer Action)
                </label>
                <textarea
                  rows={3}
                  value={activeStage.action}
                  onChange={(e) => handleFieldChange('action', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Apa tindakan nyata yang dilakukan warga pada tahap ini?"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  2. Saluran Layanan (Touchpoints)
                </label>
                <input
                  type="text"
                  value={activeStage.touchpoint}
                  onChange={(e) => handleFieldChange('touchpoint', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Contoh: Portal Web INATRADE / OSS / Loket Layanan"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  3. Respons Petugas / Sistem
                </label>
                <textarea
                  rows={3}
                  value={activeStage.response}
                  onChange={(e) => handleFieldChange('response', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Bagaimana reaksi sistem atau perlakuan petugas saat menerima permohonan?"
                />
              </div>
            </div>

            {/* Column 2: Pain Points & 3 Burdens */}
            <div className="space-y-3 bg-rose-50/40 p-4 rounded-xl border border-rose-200">
              <div>
                <label className="block text-xs font-bold text-rose-950 mb-1">
                  4. Hambatan / Keluhan Pengguna (Pain Points)
                </label>
                <textarea
                  rows={4}
                  value={activeStage.burden}
                  onChange={(e) => handleFieldChange('burden', e.target.value)}
                  className="w-full rounded-xl border border-rose-300 bg-white px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-600"
                  placeholder="Kendala apa yang dirasakan warga? Tuliskan hambatan spesifik..."
                />
              </div>
              <div>
                <span className="block text-xs font-bold text-rose-950 mb-2 flex items-center justify-between">
                  <span>Klasifikasi 3 Beban Administratif:</span>
                  <span className="text-[10px] text-rose-700 font-normal">Klik untuk aktifkan</span>
                </span>

                <div className="grid grid-cols-1 gap-2">
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
                        Syarat, regulasi, atau petunjuk teknis membingungkan warga.
                      </p>
                    </div>
                  </button>

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
                        Dokumen berulang, persyaratan fisik ganda, biaya ekstra.
                      </p>
                    </div>
                  </button>

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
                        Ketidakpastian durasi (SLA), kekhawatiran ditolak tanpa penjelasan.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Column 3: Emotion Rating & Opportunities */}
            <div className="space-y-3 bg-emerald-50/40 p-4 rounded-xl border border-emerald-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center justify-between">
                    <span>5. Skor Pengalaman Warga (-2 s.d. +2)</span>
                    <span className="font-mono text-xs font-extrabold text-blue-700">
                      Skor: {activeStage.emotion > 0 ? `+${activeStage.emotion}` : activeStage.emotion}
                    </span>
                  </label>
                  
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { score: 2, icon: '😄', label: '+2 Puas', color: 'hover:bg-emerald-50', activeCls: 'bg-emerald-600 text-white shadow-xs border-emerald-700 ring-2 ring-emerald-500/30' },
                      { score: 1, icon: '🙂', label: '+1 Mudah', color: 'hover:bg-teal-50', activeCls: 'bg-teal-600 text-white shadow-xs border-teal-700 ring-2 ring-teal-500/30' },
                      { score: 0, icon: '😐', label: '0 Netral', color: 'hover:bg-slate-50', activeCls: 'bg-slate-700 text-white shadow-xs border-slate-800 ring-2 ring-slate-500/30' },
                      { score: -1, icon: '🙁', label: '-1 Hambat', color: 'hover:bg-amber-50', activeCls: 'bg-amber-600 text-white shadow-xs border-amber-700 ring-2 ring-amber-500/30' },
                      { score: -2, icon: '😡', label: '-2 Sulit', color: 'hover:bg-rose-600', activeCls: 'bg-rose-600 text-white shadow-xs border-rose-700 ring-2 ring-rose-500/30' }
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
                  <label className="block text-xs font-bold text-emerald-950 mb-1">
                    6. Peluang Perbaikan (Opportunities)
                  </label>
                  <textarea
                    rows={4}
                    value={activeStage.opportunity}
                    onChange={(e) => handleFieldChange('opportunity', e.target.value)}
                    className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    placeholder="Rekomendasi solusi konkret untuk memangkas beban warga di tahap ini..."
                  />
                </div>
              </div>

              <div className="text-[11px] text-emerald-900 bg-emerald-100/70 p-2.5 rounded-xl border border-emerald-200">
                💡 <em>Usulan perbaikan di kolom ini dapat ditarik otomatis ke dokumen Rencana Aksi Co-Design di Fase III.</em>
              </div>
            </div>
          </div>
        )}

        {/* SUBVIEW 2: AUDIT 5C INSPECTION MATRIX (STANDAR IPPF IIA) */}
        {activeTabSubView === 'audit5c' && (
          <div className="space-y-4 bg-amber-50/40 p-4 rounded-xl border border-amber-200 animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Matriks Temuan Audit 5C &mdash; {activeStage.code}: {activeStage.name}
                </h3>
              </div>
              <span className="text-[11px] text-amber-800 font-medium">
                Standar Pengawasan Internal IPPF IIA & COSO Framework
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  1. Condition (Kondisi / Fakta Lapangan)
                </label>
                <textarea
                  rows={3}
                  value={activeStage.condition || ''}
                  onChange={(e) => handleFieldChange('condition', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-600"
                  placeholder="Apa kondisi aktual yang ditemukan saat pengujian? (Contoh: Berkas tertahan 10 hari tanpa notifikasi status)..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  2. Criteria (Kriteria / Regulasi Acuan)
                </label>
                <textarea
                  rows={3}
                  value={activeStage.criteria || ''}
                  onChange={(e) => handleFieldChange('criteria', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-600"
                  placeholder="Apa standar yang seharusnya dipatuhi? (Contoh: Permendag No. 36/2023 Pasal 14 ayat 2, SLA 3 hari kerja)..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  3. Cause (Akar Penyebab / Root Cause)
                </label>
                <textarea
                  rows={3}
                  value={activeStage.cause || ''}
                  onChange={(e) => handleFieldChange('cause', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-600"
                  placeholder="Mengapa kelemahan ini terjadi? (Contoh: Validasi masih manual, server overcapacity, atau kurangnya SDM verifikator)..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  4. Consequence (Konsekuensi & Risiko Dampak)
                </label>
                <textarea
                  rows={3}
                  value={activeStage.consequence || ''}
                  onChange={(e) => handleFieldChange('consequence', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-600"
                  placeholder="Apa dampak negatif bagi pemohon / pelaku usaha? (Contoh: Biaya demurrage logistik membengkak, ketidakpastian izin usaha)..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                5. Corrective Action (Rekomendasi Tindakan Korektif & Pengendalian)
              </label>
              <textarea
                rows={3}
                value={activeStage.recommendation || ''}
                onChange={(e) => handleFieldChange('recommendation', e.target.value)}
                className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="Rekomendasi tindakan pencegahan dan perbaikan terukur bagi pimpinan unit layanan Kemendag..."
              />
            </div>
          </div>
        )}

        {/* Stage Evidence Section / Pelacak Bukti Lapangan */}
        {(() => {
          const currentStageEvidences = (state.evidences || []).filter((e) => e.stageId === activeStage.id);

          return (
            <div className="mt-4 p-4 rounded-xl border border-blue-200 bg-blue-50/40">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-700 flex items-center justify-center">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    Bukti Lapangan Terlampir pada {activeStage.code || 'Tahap Ini'} ({currentStageEvidences.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStageModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Lampirkan Bukti Lapangan</span>
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
                      className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 cursor-pointer transition shadow-2xs group flex items-start gap-2.5"
                    >
                      {ev.imageUrl ? (
                        <img
                          src={ev.imageUrl}
                          alt={ev.title}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-100 shrink-0 group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <Camera className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-rose-700 uppercase tracking-tight">
                          {ev.severity}
                        </div>
                        <div className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-700">
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer"
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer"
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
                  className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold text-slate-700 transition cursor-pointer"
                  title="Geser posisi tahapan ini ke kiri"
                >
                  <ArrowLeft className="w-3 h-3 text-slate-500" />
                  <span>Geser Kiri</span>
                </button>
                <button
                  type="button"
                  disabled={safeIdx >= state.stages.length - 1}
                  onClick={() => onMoveStage(safeIdx, 'right')}
                  className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold text-slate-700 transition cursor-pointer"
                  title="Geser posisi tahapan ini ke kanan"
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
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  deleteConfirming
                    ? 'bg-rose-600 border-rose-600 text-white'
                    : 'border-slate-300 hover:bg-rose-50 text-slate-700 hover:text-rose-700'
                }`}
                title="Hapus tahapan ini dari perjalanan"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteConfirming ? 'Yakin Hapus Tahap Ini?' : 'Hapus'}</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {saveSuccess && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold animate-in fade-in zoom-in-95 duration-150">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Tahap {activeStage.code || ''} Tersimpan!</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleSaveClick(false)}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer select-none"
              title="Simpan data tahapan ini"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Simpan Tahap</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveClick(true)}
              className="inline-flex items-center gap-1.5 bg-[#07162c] hover:bg-slate-900 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer select-none"
              title="Simpan dan lanjut ke tahapan berikutnya"
            >
              <span>Simpan & Pindah</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Papan Kanvas Perjalanan Warga (Customer Journey Map Board)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Seluruh rincian aktivitas, beban, dan rekomendasi audit 5C disajikan lengkap.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={burdenFilter}
                onChange={(e) => setBurdenFilter(e.target.value as any)}
                className="bg-slate-100 border border-slate-200 text-slate-800 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold cursor-pointer"
              >
                <option value="all">Semua Tahap ({totalStages})</option>
                <option value="learning">Hanya Beban Informasi</option>
                <option value="compliance">Hanya Beban Kepatuhan</option>
                <option value="psychological">Hanya Beban Psikologis</option>
                <option value="negative">Hanya Titik Gesekan (-1 / -2)</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs'
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
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'panorama'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Panorama Horizontal"
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span>Panorama</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
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
                    className={`cursor-pointer rounded-2xl border p-4 flex flex-col justify-between gap-3 transition-all ${
                      isActive
                        ? 'border-[#07162c] bg-blue-50/40 ring-2 ring-[#07162c]/30 shadow-sm'
                        : isMatched
                        ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                        : 'bg-slate-50/50 border-slate-200 opacity-40'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="border-b border-slate-200 pb-2.5 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#07162c] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                            {st.code || `Tahap ${idx + 1}`}
                          </span>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${emo.cls}`}>
                            {emo.label}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 break-words">
                            {st.name || '-'}
                          </h4>
                          <p className="text-xs text-slate-500 break-words">
                            {st.subtitle || '-'}
                          </p>
                        </div>
                      </div>

                      {/* 1. Customer Action */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <div className="text-[10px] font-bold uppercase text-slate-600 mb-1">
                          1. Aktivitas Pengguna
                        </div>
                        <p className="text-xs text-slate-800 whitespace-pre-line break-words leading-relaxed">
                          {st.action || <span className="italic text-slate-400">Belum diisi</span>}
                        </p>
                      </div>

                      {/* 2 & 3. Touchpoints & Response */}
                      <div className="bg-blue-50/40 p-2.5 rounded-xl border border-blue-200 space-y-2">
                        <div>
                          <div className="text-[10px] font-bold uppercase text-blue-950 mb-0.5">
                            2. Saluran (Touchpoints)
                          </div>
                          <div className="text-xs font-bold text-slate-900 break-words">
                            {st.touchpoint || '-'}
                          </div>
                        </div>
                        <div className="pt-1.5 border-t border-blue-200">
                          <div className="text-[10px] font-bold uppercase text-blue-950 mb-0.5">
                            3. Respons Petugas / Sistem
                          </div>
                          <p className="text-xs text-slate-700 whitespace-pre-line break-words leading-relaxed">
                            {st.response || '-'}
                          </p>
                        </div>
                      </div>

                      {/* 4. Pain Points & Burden Tags */}
                      <div className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-200">
                        <div className="text-[10px] font-bold uppercase text-rose-950 mb-1">
                          4. Hambatan & Beban Pengguna
                        </div>
                        <p className="text-xs text-slate-800 whitespace-pre-line break-words leading-relaxed">
                          {st.burden || <span className="italic text-slate-400">Tidak ada keluhan signifikan</span>}
                        </p>
                        {burdens.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {burdens.map((b, bIdx) => (
                              <span
                                key={bIdx}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-rose-200 text-rose-950 font-bold"
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Audit 5C Mini Summary if populated */}
                      {(st.condition || st.criteria || st.recommendation) && (
                        <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-200 space-y-1">
                          <div className="text-[10px] font-bold uppercase text-amber-950 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                            <span>Kertas Kerja Audit 5C Terlampir</span>
                          </div>
                          {st.condition && (
                            <div className="text-[11px] text-slate-700">
                              <span className="font-semibold text-amber-900">Kondisi:</span> {st.condition}
                            </div>
                          )}
                          {st.recommendation && (
                            <div className="text-[11px] text-emerald-900">
                              <span className="font-semibold text-emerald-900">Rekomendasi:</span> {st.recommendation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 6. Opportunities & Edit Button */}
                    <div className="space-y-2 pt-1">
                      <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200">
                        <div className="text-[10px] font-bold uppercase text-emerald-950 mb-1">
                          6. Peluang Solusi (Opportunities)
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
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          isActive
                            ? 'bg-[#07162c] text-white border-[#07162c]'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
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
                <tr className="bg-slate-100 text-slate-900 font-bold text-left">
                  <th className="border border-slate-300 px-3 py-2.5 w-36">Tahapan</th>
                  <th className="border border-slate-300 px-3 py-2.5">Aktivitas & Saluran</th>
                  <th className="border border-slate-300 px-3 py-2.5">Respons Layanan</th>
                  <th className="border border-slate-300 px-3 py-2.5">Hambatan & Beban</th>
                  <th className="border border-slate-300 px-3 py-2.5">Temuan Audit 5C & Solusi</th>
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
                        <div className={`mt-1.5 inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border ${emo.cls}`}>
                          {emo.label}
                        </div>
                      </td>
                      <td className="border border-slate-300 px-3 py-2.5 text-slate-800 align-top leading-relaxed">
                        <div className="font-semibold">{st.action || '-'}</div>
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
                        <div><strong className="text-emerald-900">Solusi:</strong> {st.opportunity || '-'}</div>
                        {st.recommendation && (
                          <div className="mt-1 text-[11px] text-blue-900">
                            <strong>Rekomendasi 5C:</strong> {st.recommendation}
                          </div>
                        )}
                      </td>
                      <td className="border border-slate-300 px-3 py-2.5 text-center align-top">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSetActiveStageIdx(idx);
                            document.getElementById('stage-editor-card')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold transition cursor-pointer"
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

      {/* Pelacak Bukti Lapangan */}
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

      <EvidenceLightbox
        evidence={lightboxEvidence}
        onClose={() => setLightboxEvidence(null)}
      />

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
