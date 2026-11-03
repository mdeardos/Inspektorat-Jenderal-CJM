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
  Camera, 
  BookOpen, 
  ChevronDown, 
  Layers, 
  Zap, 
  ShieldAlert,
  X,
  ExternalLink,
  Save,
  Check
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
  const [viewMode, setViewMode] = useState<ViewMode>('panorama');
  const [burdenFilter, setBurdenFilter] = useState<'all' | 'learning' | 'compliance' | 'psychological' | 'negative'>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'cjm' | 'audit5c'>('cjm');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const saveTimeoutRef = useRef<any>(null);
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
        setIsDrawerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const showTemplateToast = (msg: string) => {
    setTemplateToast(msg);
    if (templateToastTimeoutRef.current) {
      clearTimeout(templateToastTimeoutRef.current);
    }
    templateToastTimeoutRef.current = setTimeout(() => {
      setTemplateToast(null);
    }, 3200);
  };

  const safeIdx = Math.max(0, Math.min(activeStageIdx, (state.stages.length || 1) - 1));
  const activeStage = state.stages[safeIdx] || {
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

  const handleFieldChange = (field: keyof StageItem, value: any) => {
    if (!state.stages[safeIdx]) return;
    const updated = { ...state.stages[safeIdx], [field]: value };
    onUpdateStage(safeIdx, updated);
  };

  const handleSaveClick = (advanceNext: boolean = false) => {
    onForceSave?.();
    setSaveSuccess(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => setSaveSuccess(false), 2400);

    if (advanceNext && state.stages.length > 0) {
      const nextIdx = (safeIdx + 1) % state.stages.length;
      onSetActiveStageIdx(nextIdx);
    }
  };

  const handleOpenStageEditor = (idx: number, initialTab: 'cjm' | 'audit5c' = 'cjm') => {
    onSetActiveStageIdx(idx);
    setDrawerTab(initialTab);
    setIsDrawerOpen(true);
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
      showTemplateToast(`Templat '${tpl.name}' disisipkan ke ${current.code || `Tahap ${safeIdx + 1}`}`);
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
      showTemplateToast(`Tahap baru '${tpl.name}' berhasil ditambahkan`);
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
    showTemplateToast('Kerangka standar 5 tahap (Awareness s.d. Post-Service) dimuat');
  };

  const handleAutoPopulate5C = () => {
    if (!activeStage) return;
    const updated: StageItem = {
      ...activeStage,
      condition: activeStage.condition || activeStage.burden || activeStage.action || 'Fakta operasional teramati di lapangan.',
      criteria: activeStage.criteria || 'Standar Pelayanan Publik & SOP Unit Terkait (SLA Permendag).',
      cause: activeStage.cause || 'Proses verifikasi manual dan keterbatasan integrasi sistem.',
      consequence: activeStage.consequence || 'Penundaan waktu layanan dan peningkatan beban pelaku usaha.',
      recommendation: activeStage.recommendation || activeStage.opportunity || 'Otomasi alur persetujuan dan integrasi data lintas instansi.'
    };
    onUpdateStage(safeIdx, updated);
    showTemplateToast('Matriks 5C berhasil diisi dari data CJM');
  };

  const getEmotionMeta = (score: number) => {
    const num = Number(score);
    if (num === 2) return { label: '+2 Sangat Puas', cls: 'bg-emerald-500/10 text-emerald-800 border-emerald-300' };
    if (num === 1) return { label: '+1 Cukup Mudah', cls: 'bg-teal-500/10 text-teal-800 border-teal-300' };
    if (num === 0) return { label: '0 Netral', cls: 'bg-slate-100 text-slate-700 border-slate-300' };
    if (num === -1) return { label: '-1 Menghambat', cls: 'bg-amber-500/10 text-amber-800 border-amber-300' };
    return { label: '-2 Sangat Sulit', cls: 'bg-rose-500/10 text-rose-800 border-rose-300' };
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
      {/* Context Top Bar: Objek Evaluasi & Next CTA */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600">
          <span className="font-extrabold text-[#071426] text-sm tracking-tight">{state.service || 'Nama Layanan Belum Diisi'}</span>
          <span className="text-slate-300" aria-hidden="true">•</span>
          <span>Unit Kerja: <strong className="text-slate-800">{state.unit || '-'}</strong></span>
          <span className="text-slate-300" aria-hidden="true">•</span>
          <span>Persona: <strong className="text-slate-800">{state.personaName || 'Belum diisi'}</strong> ({state.personaRole || 'Pelaku Usaha'})</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 bg-[#071426] hover:bg-slate-900 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition shadow-xs cursor-pointer active:scale-95"
          >
            <span>Lanjut ke Fase III: Rencana Co-Design</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* ====================================================
           1. EXECUTIVE KPI RIBBON
           ==================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Total Tahapan</div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{totalStages} <span className="text-xs font-normal text-slate-400">fase</span></div>
        </div>
        <div className="bg-white rounded-2xl border border-rose-200 p-4 shadow-2xs hover:shadow-xs transition">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700">Titik Kritis (Friction)</div>
          <div className="text-2xl font-extrabold font-mono text-rose-700 mt-1">{criticalCount} <span className="text-xs font-normal text-slate-400">tahap</span></div>
        </div>
        <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-2xs hover:shadow-xs transition">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">Beban Belajar</div>
          <div className="text-2xl font-extrabold font-mono text-amber-700 mt-1">{learningCount} <span className="text-xs font-normal text-slate-400">tahap</span></div>
        </div>
        <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-2xs hover:shadow-xs transition">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700">Beban Kepatuhan</div>
          <div className="text-2xl font-extrabold font-mono text-blue-700 mt-1">{complianceCount} <span className="text-xs font-normal text-slate-400">tahap</span></div>
        </div>
        <div className="bg-white rounded-2xl border border-purple-200 p-4 shadow-2xs hover:shadow-xs transition">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700">Beban Psikologis</div>
          <div className="text-2xl font-extrabold font-mono text-purple-700 mt-1">{psychologicalCount} <span className="text-xs font-normal text-slate-400">tahap</span></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Rerata Kepuasan</div>
          <div className={`text-2xl font-extrabold font-mono mt-1 ${Number(avgEmotion) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {Number(avgEmotion) > 0 ? `+${avgEmotion}` : avgEmotion} <span className="text-xs font-normal text-slate-400">/ 2.0</span>
          </div>
        </div>
      </div>

      {/* ====================================================
           2. INTERACTIVE CITIZEN EXPERIENCE CURVE
           ==================================================== */}
      <EmotionChart
        stages={state.stages}
        activeStageIndex={safeIdx}
        onSelectStage={(idx) => handleOpenStageEditor(idx)}
        onUpdateEmotion={(idx, score) => {
          const target = state.stages[idx];
          if (target) {
            onUpdateStage(idx, { ...target, emotion: score });
          }
        }}
      />

      {/* ====================================================
           3. THE HERO: CUSTOMER JOURNEY MAP BOARD
           ==================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
        {/* Toolbar & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-700" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                Papan Kanvas Perjalanan Warga (Customer Journey Board)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik pada kartu tahapan atau tombol edit untuk membuka Panel Kertas Kerja Audit 5C.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter by Burden */}
            <div className="flex items-center gap-1.5 text-xs bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={burdenFilter}
                onChange={(e) => setBurdenFilter(e.target.value as any)}
                className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Tahap ({totalStages})</option>
                <option value="learning">Beban Informasi Saja</option>
                <option value="compliance">Beban Kepatuhan Saja</option>
                <option value="psychological">Beban Psikologis Saja</option>
                <option value="negative">Titik Gesekan Kritis (-1 / -2)</option>
              </select>
            </div>

            {/* View Switchers */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('panorama')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'panorama'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Alur Panorama Horizontal"
              >
                <Columns3 className="w-3.5 h-3.5 text-blue-700" />
                <span>Panorama</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Grid 3 Kolom"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid 3 Kolom</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Matriks Tabular"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tabel</span>
              </button>
            </div>

            {/* Add Stage Button */}
            <button
              type="button"
              onClick={onAddStage}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-950 text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-blue-700" />
              <span>+ Tambah Tahap</span>
            </button>

            {/* Templates Popover Trigger */}
            <div className="relative inline-block" ref={templateMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsTemplateMenuOpen((prev) => !prev);
                  setTemplateConfirmSkeleton(false);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Templat Tahap</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isTemplateMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-300 z-50 p-4 space-y-3 animate-in fade-in duration-150 text-slate-900">
                  <div className="border-b border-slate-200 pb-2.5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Templat Tahapan Baku Kemendag</h4>
                      <p className="text-[11px] text-slate-500">Pilih templat tahapan untuk mempercepat penyusunan</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTemplateMenuOpen(false)}
                      className="text-slate-400 hover:text-slate-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 custom-scrollbar">
                    {STAGE_TEMPLATES.map((tpl) => (
                      <div
                        key={tpl.id}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 transition text-left"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded">
                            {tpl.badge}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-600">
                            Skor: {tpl.emotion > 0 ? `+${tpl.emotion}` : tpl.emotion}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 mt-1">{tpl.name}</div>
                        <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{tpl.subtitle}</div>
                        <div className="mt-2 pt-2 border-t border-slate-200 flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleInjectTemplate(tpl, 'append_new')}
                            className="px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[10px] font-bold transition flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Tambah ke Kanvas</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handleApplyStandardSkeleton}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 text-xs font-bold transition"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-700" />
                      <span>Muat Kerangka Standar 5 Tahap (Awareness s.d. Post-Service)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* View Mode 1 & 2: Cards Grid / Panorama */}
        {viewMode !== 'table' ? (
          <div className={viewMode === 'panorama' ? 'overflow-x-auto pb-4 custom-scrollbar' : ''}>
            <div
              className={
                viewMode === 'panorama'
                  ? 'flex items-stretch gap-4 min-w-[1580px]'
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              }
            >
              {state.stages.map((st, idx) => {
                const isActive = idx === activeStageIdx;
                const emo = getEmotionMeta(st.emotion);
                const isMatched = isStageHighlighted(st);
                const stEvidenceCount = (state.evidences || []).filter((e) => e.stageId === st.id).length;

                const burdens = [];
                if (st.learning) burdens.push('Informasi');
                if (st.compliance) burdens.push('Kepatuhan');
                if (st.psychological) burdens.push('Psikologis');

                return (
                  <div
                    key={st.id || idx}
                    className={`rounded-2xl border p-4.5 flex flex-col justify-between gap-4 transition-all ${
                      viewMode === 'panorama' ? 'w-[320px] shrink-0' : 'w-full'
                    } ${
                      isActive
                        ? 'border-[#071426] bg-blue-50/30 ring-2 ring-[#071426]/30 shadow-md'
                        : isMatched
                        ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                        : 'bg-slate-50/50 border-slate-200 opacity-40'
                    }`}
                  >
                    <div className="space-y-3.5">
                      {/* Card Header with Step flow */}
                      <div className="border-b border-slate-200 pb-3 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#071426] bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                            {st.code || `Tahap ${idx + 1}`}
                          </span>
                          <div className="flex items-center gap-1">
                            {stEvidenceCount > 0 && (
                              <span 
                                className="text-[9px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5 bg-amber-100 text-amber-900 border border-amber-300"
                                title={`${stEvidenceCount} Bukti Lapangan`}
                              >
                                <Camera className="w-2.5 h-2.5" />
                                <span>{stEvidenceCount}</span>
                              </span>
                            )}
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${emo.cls}`}>
                              {emo.label}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 break-words leading-tight">
                            {st.name || '-'}
                          </h4>
                          <p className="text-xs text-slate-500 break-words mt-0.5 leading-snug">
                            {st.subtitle || '-'}
                          </p>
                        </div>
                      </div>

                      {/* 1. Customer Action */}
                      <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/90">
                        <div className="text-[10px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                          1. Aktivitas Pengguna
                        </div>
                        <p className="text-xs text-slate-800 whitespace-pre-line break-words leading-relaxed">
                          {st.action || <span className="italic text-slate-400">Belum diisi</span>}
                        </p>
                      </div>

                      {/* 2 & 3. Touchpoints & System Response */}
                      <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-200/80 space-y-2">
                        <div>
                          <div className="text-[10px] font-bold uppercase text-blue-900 mb-0.5 tracking-wider">
                            2. Saluran (Touchpoints)
                          </div>
                          <div className="text-xs font-bold text-slate-900 break-words">
                            {st.touchpoint || '-'}
                          </div>
                        </div>
                        <div className="pt-2 border-t border-blue-200/60">
                          <div className="text-[10px] font-bold uppercase text-blue-900 mb-0.5 tracking-wider">
                            3. Respons Petugas / Sistem
                          </div>
                          <p className="text-xs text-slate-700 whitespace-pre-line break-words leading-relaxed">
                            {st.response || '-'}
                          </p>
                        </div>
                      </div>

                      {/* 4. Pain Points & 3 Burdens */}
                      <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-200">
                        <div className="text-[10px] font-bold uppercase text-rose-900 mb-1 tracking-wider">
                          4. Hambatan / Keluhan Warga
                        </div>
                        <p className="text-xs text-slate-800 whitespace-pre-line break-words leading-relaxed">
                          {st.burden || <span className="italic text-slate-400">Tidak ada keluhan kritis</span>}
                        </p>
                        {burdens.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {burdens.map((b, bIdx) => (
                              <span
                                key={bIdx}
                                className="text-[9px] px-2 py-0.5 rounded-md bg-rose-200 text-rose-950 font-bold"
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 5. Audit 5C Framework Badge */}
                      <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] font-bold uppercase text-amber-950 flex items-center gap-1 tracking-wider">
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                            <span>Audit 5C</span>
                          </div>
                          <span className="text-[9px] font-mono font-bold text-amber-800">
                            {st.condition ? 'Terisi ✓' : 'Belum Terisi'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                          {st.condition || <span className="italic text-slate-400">Belum ada catatan temuan 5C</span>}
                        </p>
                      </div>

                      {/* 6. Opportunities */}
                      <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                        <div className="text-[10px] font-bold uppercase text-emerald-950 mb-1 tracking-wider">
                          6. Peluang Solusi (Opportunities)
                        </div>
                        <p className="text-xs text-slate-800 whitespace-pre-line break-words leading-relaxed">
                          {st.opportunity || <span className="italic text-slate-400">Belum dirumuskan</span>}
                        </p>
                      </div>
                    </div>

                    {/* Card Action Trigger: Open Slide-over Drawer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenStageEditor(idx, 'cjm')}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Edit Rincian</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenStageEditor(idx, 'audit5c')}
                        className="py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Buka Lembar Temuan Audit 5C Tahap Ini"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        <span>5C</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Table Matrix View */
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse border border-slate-200 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold text-left">
                  <th className="border border-slate-300 px-3 py-2.5 w-36">Tahapan</th>
                  <th className="border border-slate-300 px-3 py-2.5">Aktivitas & Saluran</th>
                  <th className="border border-slate-300 px-3 py-2.5">Respons Sistem</th>
                  <th className="border border-slate-300 px-3 py-2.5">Hambatan & Beban</th>
                  <th className="border border-slate-300 px-3 py-2.5">Temuan Audit 5C & Solusi</th>
                  <th className="border border-slate-300 px-3 py-2.5 w-24 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {state.stages.map((st, idx) => {
                  const emo = getEmotionMeta(st.emotion);
                  return (
                    <tr key={st.id || idx} className="hover:bg-slate-50 transition">
                      <td className="border border-slate-300 p-3 font-semibold text-slate-900 align-top">
                        <div className="text-blue-950 font-bold">{st.code}: {st.name}</div>
                        <div className="text-[11px] text-slate-500">{st.subtitle}</div>
                        <div className={`mt-1.5 inline-block text-[10px] font-mono px-2 py-0.5 rounded border ${emo.cls}`}>
                          {emo.label}
                        </div>
                      </td>
                      <td className="border border-slate-300 p-3 text-slate-800 align-top leading-relaxed">
                        <div className="font-semibold">{st.action || '-'}</div>
                        <div className="text-[11px] text-slate-500 mt-1 font-normal">
                          Saluran: <strong className="text-slate-700">{st.touchpoint || '-'}</strong>
                        </div>
                      </td>
                      <td className="border border-slate-300 p-3 text-slate-700 align-top leading-relaxed">
                        {st.response || '-'}
                      </td>
                      <td className="border border-slate-300 p-3 text-slate-800 align-top leading-relaxed">
                        <div>{st.burden || '-'}</div>
                      </td>
                      <td className="border border-slate-300 p-3 text-slate-800 align-top leading-relaxed">
                        <div><strong className="text-emerald-900">Solusi:</strong> {st.opportunity || '-'}</div>
                        {st.condition && (
                          <div className="mt-1 text-[11px] text-amber-900">
                            <strong>Kondisi 5C:</strong> {st.condition}
                          </div>
                        )}
                      </td>
                      <td className="border border-slate-300 p-3 text-center align-top">
                        <button
                          type="button"
                          onClick={() => handleOpenStageEditor(idx)}
                          className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition cursor-pointer shadow-xs"
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

      {/* Evidence Tracker Section */}
      <div id="evidence-tracker-section" className="pt-4">
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

      {/* ====================================================
           4. SLEEK SLIDE-OVER INSPECTOR DRAWER
           ==================================================== */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end no-print">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="px-6 py-4 bg-[#071426] text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-400 text-slate-950 font-mono font-extrabold text-xs">
                  {activeStage.code || `Tahap ${safeIdx + 1}`}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-tight">
                    {activeStage.name || 'Edit Tahapan Layanan'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Panel Kertas Kerja Pengujian Perjalanan & Audit 5C
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tersimpan!</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Tutup Panel Editor (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Sub-nav: CJM vs 5C */}
            <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDrawerTab('cjm')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    drawerTab === 'cjm'
                      ? 'bg-white text-blue-950 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-blue-700" />
                  <span>1. Dimensi Perjalanan (CJM)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab('audit5c')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    drawerTab === 'audit5c'
                      ? 'bg-white text-amber-950 shadow-xs border border-amber-300'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>2. Kertas Kerja Audit 5C</span>
                </button>
              </div>

              {drawerTab === 'audit5c' && (
                <button
                  type="button"
                  onClick={handleAutoPopulate5C}
                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                  title="Salin temuan hambatan CJM ke lembar temuan 5C"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tarik dari CJM</span>
                </button>
              )}
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              {/* Stage Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor / Urutan</label>
                  <input
                    type="text"
                    value={activeStage.code}
                    onChange={(e) => handleFieldChange('code', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Tahap Layanan</label>
                  <input
                    type="text"
                    value={activeStage.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* TAB 1: CJM FORM */}
              {drawerTab === 'cjm' && (
                <div className="space-y-4">
                  {/* Score Selection Buttons */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
                      <span>Skor Pengalaman Pengguna (-2 s.d. +2):</span>
                      <span className="font-mono text-xs font-extrabold text-blue-700">
                        {activeStage.emotion > 0 ? `+${activeStage.emotion}` : activeStage.emotion}
                      </span>
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { score: 2, icon: '😄', label: '+2 Puas', activeCls: 'bg-emerald-600 text-white shadow-xs' },
                        { score: 1, icon: '🙂', label: '+1 Mudah', activeCls: 'bg-teal-600 text-white shadow-xs' },
                        { score: 0, icon: '😐', label: '0 Netral', activeCls: 'bg-slate-700 text-white shadow-xs' },
                        { score: -1, icon: '🙁', label: '-1 Hambat', activeCls: 'bg-amber-600 text-white shadow-xs' },
                        { score: -2, icon: '😡', label: '-2 Sulit', activeCls: 'bg-rose-600 text-white shadow-xs' }
                      ].map((emo) => {
                        const isCurrent = activeStage.emotion === emo.score;
                        return (
                          <button
                            key={emo.score}
                            type="button"
                            onClick={() => handleFieldChange('emotion', emo.score)}
                            className={`py-2 px-1 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                              isCurrent
                                ? emo.activeCls
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="text-base">{emo.icon}</span>
                            <span className="text-[10px] font-bold">{emo.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer Action */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      1. Aktivitas Pengguna (Customer Action)
                    </label>
                    <textarea
                      rows={3}
                      value={activeStage.action}
                      onChange={(e) => handleFieldChange('action', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Apa tindakan yang dilakukan warga pada tahap ini?"
                    />
                  </div>

                  {/* Touchpoints & Response */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        2. Saluran (Touchpoints)
                      </label>
                      <input
                        type="text"
                        value={activeStage.touchpoint}
                        onChange={(e) => handleFieldChange('touchpoint', e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Portal INATRADE / OSS / Loket"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        3. Respons Petugas / Sistem
                      </label>
                      <input
                        type="text"
                        value={activeStage.response}
                        onChange={(e) => handleFieldChange('response', e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Reaksi sistem atau verifikator"
                      />
                    </div>
                  </div>

                  {/* Pain Points */}
                  <div>
                    <label className="block text-xs font-bold text-rose-950 mb-1">
                      4. Hambatan / Keluhan Pengguna (Pain Points)
                    </label>
                    <textarea
                      rows={3}
                      value={activeStage.burden}
                      onChange={(e) => handleFieldChange('burden', e.target.value)}
                      className="w-full rounded-xl border border-rose-300 bg-white px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-600"
                      placeholder="Tuliskan kendala spesifik yang dihadapi pemohon..."
                    />
                  </div>

                  {/* 3 Burdens */}
                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-slate-800">
                      Klasifikasi 3 Beban Administratif:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleFieldChange('learning', !activeStage.learning)}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          activeStage.learning
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="text-[10px] font-bold">Beban Informasi</div>
                        <div className="text-[9px] opacity-80 mt-0.5">{activeStage.learning ? 'Aktif ✓' : 'Nihil'}</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFieldChange('compliance', !activeStage.compliance)}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          activeStage.compliance
                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="text-[10px] font-bold">Beban Kepatuhan</div>
                        <div className="text-[9px] opacity-80 mt-0.5">{activeStage.compliance ? 'Aktif ✓' : 'Nihil'}</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFieldChange('psychological', !activeStage.psychological)}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          activeStage.psychological
                            ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="text-[10px] font-bold">Beban Psikologis</div>
                        <div className="text-[9px] opacity-80 mt-0.5">{activeStage.psychological ? 'Aktif ✓' : 'Nihil'}</div>
                      </button>
                    </div>
                  </div>

                  {/* Opportunities */}
                  <div>
                    <label className="block text-xs font-bold text-emerald-950 mb-1">
                      6. Peluang Solusi (Opportunities)
                    </label>
                    <textarea
                      rows={3}
                      value={activeStage.opportunity}
                      onChange={(e) => handleFieldChange('opportunity', e.target.value)}
                      className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      placeholder="Rekomendasi solusi konkret untuk memangkas beban..."
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: AUDIT 5C FORM */}
              {drawerTab === 'audit5c' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 leading-relaxed">
                    <strong>Panduan Audit 5C:</strong> Formulasi temuan audit pengawasan internal mengacu pada standar IPPF IIA untuk memastikan objektivitas dan kekuatan pembuktian audit.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      1. Condition (Kondisi / Fakta Lapangan)
                    </label>
                    <textarea
                      rows={3}
                      value={activeStage.condition || ''}
                      onChange={(e) => handleFieldChange('condition', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-600"
                      placeholder="Apa kondisi aktual yang terbukti di lapangan?..."
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
                      placeholder="Permendag, SOP, atau standar SLA rujukan..."
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
                      placeholder="Mengapa kegagalan pengendalian ini terjadi?..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      4. Consequence (Konsekuensi & Dampak Risiko)
                    </label>
                    <textarea
                      rows={3}
                      value={activeStage.consequence || ''}
                      onChange={(e) => handleFieldChange('consequence', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-600"
                      placeholder="Dampak bagi pelaku usaha atau kerugian ekonomi..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      5. Corrective Action (Rekomendasi Tindakan Korektif)
                    </label>
                    <textarea
                      rows={3}
                      value={activeStage.recommendation || ''}
                      onChange={(e) => handleFieldChange('recommendation', e.target.value)}
                      className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      placeholder="Rekomendasi perbaikan konkret dan terukur bagi pimpinan unit..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const prev = (safeIdx - 1 + state.stages.length) % state.stages.length;
                    onSetActiveStageIdx(prev);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
                  <span>Sebelumnya</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = (safeIdx + 1) % state.stages.length;
                    onSetActiveStageIdx(next);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
                >
                  <span>Berikutnya</span>
                  <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveClick(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSaveClick(false);
                    setIsDrawerOpen(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#071426] hover:bg-slate-900 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <span>Selesai & Tutup</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
