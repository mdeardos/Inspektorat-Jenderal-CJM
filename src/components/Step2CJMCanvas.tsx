import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Edit3, 
  Columns3, 
  Table as TableIcon, 
  Filter, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Sparkles, 
  Camera, 
  ChevronDown, 
  Layers, 
  Zap, 
  ShieldAlert,
  X,
  ExternalLink,
  Save,
  Check,
  Search,
  Clock,
  User,
  Info
} from 'lucide-react';
import { EvaluationState, StageItem, ViewMode, AuditEvidence } from '../types';
import { STAGE_TEMPLATES, StageTemplate, getStandard5StageSkeleton } from '../data/stageTemplates';
import { PRESETS } from '../data/presets';
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
  presetKey?: string;
  onSelectPreset?: (key: string) => void;
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
  presetKey = 'perizinan',
  onSelectPreset,
  onAddEvidence,
  onUpdateEvidence,
  onDeleteEvidence,
  onLoadSampleEvidences
}) => {
  const [activeTab, setActiveTab] = useState<'flow' | 'table'>('flow');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'negative' | 'positive'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // 5C Audit Modal & Drawer States
  const [selectedAuditIdx, setSelectedAuditIdx] = useState<number | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isEditorDrawerOpen, setIsEditorDrawerOpen] = useState<boolean>(false);
  const [editingTab, setEditingTab] = useState<'fields' | 'audit5c'>('fields');
  
  // Stage Template Popover
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);
  const templateMenuRef = useRef<HTMLDivElement>(null);

  // Evidence Modals
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState<boolean>(false);
  const [lightboxEvidence, setLightboxEvidence] = useState<AuditEvidence | null>(null);

  // Handle outside clicks and Esc key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (templateMenuRef.current && !templateMenuRef.current.contains(event.target as Node)) {
        setIsTemplateMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsTemplateMenuOpen(false);
        setIsAuditModalOpen(false);
        setIsEditorDrawerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
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

  const auditStage = selectedAuditIdx !== null && state.stages[selectedAuditIdx]
    ? state.stages[selectedAuditIdx]
    : activeStage;

  // Filtered Stages Calculation
  const filteredStages = useMemo(() => {
    return state.stages.map((st, origIdx) => ({ st, origIdx })).filter(({ st }) => {
      // Filter by Sentiment
      if (sentimentFilter === 'negative' && st.emotion >= 0) return false;
      if (sentimentFilter === 'positive' && st.emotion <= 0) return false;

      // Filter by Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (st.name || '').toLowerCase().includes(q);
        const matchAction = (st.action || '').toLowerCase().includes(q);
        const matchTouchpoint = (st.touchpoint || '').toLowerCase().includes(q);
        const matchBurden = (st.burden || '').toLowerCase().includes(q);
        const matchOpp = (st.opportunity || '').toLowerCase().includes(q);
        return matchTitle || matchAction || matchTouchpoint || matchBurden || matchOpp;
      }
      return true;
    });
  }, [state.stages, sentimentFilter, searchQuery]);

  // KPI Calculations
  const totalStages = state.stages.length || 1;
  const criticalCount = state.stages.filter(s => s.emotion < 0 || s.burden).length;
  const positiveCount = state.stages.filter(s => s.emotion > 0).length;
  
  // Calculate average CSAT scaled from emotion (-2 to +2 -> 1.0 to 5.0)
  const avgCsat = useMemo(() => {
    if (state.stages.length === 0) return '4.0';
    const sum = state.stages.reduce((acc, s) => {
      const score1to5 = ((s.emotion + 2) / 4) * 4 + 1;
      return acc + score1to5;
    }, 0);
    return (sum / state.stages.length).toFixed(1);
  }, [state.stages]);

  const csatCategory = useMemo(() => {
    const num = parseFloat(avgCsat);
    if (num >= 4.0) return 'Kategori A (Sangat Memuaskan)';
    if (num >= 3.0) return 'Kategori B (Baik & Memadai)';
    return 'Kategori C (Perlu Peningkatan)';
  }, [avgCsat]);

  // Sentiment Helper
  const getSentimentMeta = (emotion: number) => {
    if (emotion > 0) {
      return {
        cls: 'sentiment-positive',
        label: emotion === 2 ? 'Sangat Puas (+2)' : 'Puas (+1)',
        cardCls: '',
        color: '#16a34a'
      };
    }
    if (emotion < 0) {
      return {
        cls: 'sentiment-negative',
        label: emotion === -2 ? 'Friksi Berat (-2)' : 'Friksi (-1)',
        cardCls: 'status-friction',
        color: '#dc2626'
      };
    }
    return {
      cls: 'sentiment-neutral',
      label: 'Netral (0)',
      cardCls: 'status-neutral',
      color: '#d97706'
    };
  };

  // Open 5C Audit Modal
  const handleOpen5C = (idx: number) => {
    setSelectedAuditIdx(idx);
    setIsAuditModalOpen(true);
  };

  // Open Stage Editor Drawer
  const handleOpenEditor = (idx: number, tab: 'fields' | 'audit5c' = 'fields') => {
    onSetActiveStageIdx(idx);
    setSelectedAuditIdx(idx);
    setEditingTab(tab);
    setIsEditorDrawerOpen(true);
  };

  // Update 5C field
  const handleUpdateAuditField = (field: keyof StageItem, value: any) => {
    const targetIdx = selectedAuditIdx !== null ? selectedAuditIdx : safeIdx;
    if (!state.stages[targetIdx]) return;
    const updated = { ...state.stages[targetIdx], [field]: value };
    onUpdateStage(targetIdx, updated);
  };

  // Auto populate 5C fields from CJM Stage
  const handleAutoPopulate5C = () => {
    const targetIdx = selectedAuditIdx !== null ? selectedAuditIdx : safeIdx;
    const targetStage = state.stages[targetIdx];
    if (!targetStage) return;

    const conditionText = targetStage.burden || targetStage.action || 'Fakta operasional teramati dalam pengujian layanan.';
    const criteriaText = targetStage.criteria || 'Standar Operasional Prosedur (SOP) & Ketetapan SLA Kementerian Perdagangan RI.';
    const causeText = targetStage.cause || 'Proses verifikasi berulang dan keterbatasan otomasi integrasi sistem.';
    const consequenceText = targetStage.consequence || 'Penundaan kepastian waktu layanan dan peningkatan beban pelaku usaha.';
    const recoText = targetStage.opportunity || 'Otomasi validasi berkas dan transparansi pelacakan status layanan.';

    const updated: StageItem = {
      ...targetStage,
      condition: conditionText,
      criteria: criteriaText,
      cause: causeText,
      consequence: consequenceText,
      recommendation: recoText
    };
    onUpdateStage(targetIdx, updated);
    showToast('Matriks 5C berhasil diisi otomatis dari data alur');
  };

  // Inject Template
  const handleInjectTemplate = (tpl: StageTemplate) => {
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
      opportunity: tpl.opportunity,
      condition: tpl.burden || '',
      criteria: 'SOP Layanan Kemendag & Standar Pelayanan Publik',
      cause: 'Proses koordinasi manual lintas unit kerja',
      consequence: 'Waktu tunggu pemohon meningkat',
      recommendation: tpl.opportunity || ''
    };
    onBatchUpdateStages([...state.stages, newStage]);
    onSetActiveStageIdx(state.stages.length);
    onForceSave?.();
    setIsTemplateMenuOpen(false);
    showToast(`Tahap baru '${tpl.name}' berhasil ditambahkan`);
  };

  // Apply Standard 5-Stage Skeleton
  const handleApplyStandardSkeleton = () => {
    const standardStages = getStandard5StageSkeleton();
    onBatchUpdateStages(standardStages);
    onSetActiveStageIdx(0);
    onForceSave?.();
    setIsTemplateMenuOpen(false);
    showToast('Kerangka standar 5 tahap (Awareness s.d. Post-Service) dimuat');
  };

  // Dynamic SVG Curve Points Calculation
  const svgCurveData = useMemo(() => {
    if (state.stages.length === 0) return { pathD: '', dots: [] };
    const stageWidth = 1000 / Math.max(1, state.stages.length);
    const points = state.stages.map((st, idx) => {
      const x = (idx * stageWidth) + (stageWidth / 2);
      // Map emotion -2 to +2 to y 60 (lowest) to y 15 (highest)
      const normalizedScore = (st.emotion + 2) / 4; // 0.0 to 1.0
      const y = 60 - (normalizedScore * 45);
      const score1to5 = (normalizedScore * 4 + 1).toFixed(1);
      return { x, y, score: score1to5, emotion: st.emotion, name: st.name };
    });

    if (points.length < 2) {
      return { pathD: `M ${points[0].x} ${points[0].y}`, dots: points };
    }

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (curr.x - prev.x) / 2;
      const cy2 = curr.y;
      pathD += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
    }

    return { pathD, dots: points };
  }, [state.stages]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-amber-400 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* 1. Executive Card with Lead Summary & Service Switcher */}
      <section className="executive-card" aria-labelledby="lead-title">
        <div className="executive-summary">
          <h2 id="lead-title">Pemetaan Siklus Interaksi Pemangku Kepentingan Layanan Perdagangan</h2>
          <p>
            Instrumen kendali mutu pengawasan intern untuk merekam perjalanan pemohon perizinan, layanan konsultasi,
            serta pengaduan masyarakat. Dirancang berbasis Standar Audit Intern Pemerintah Indonesia (SAIPI), IPPF IIA,
            dan Peraturan Pemerintah Nomor 60 Tahun 2008 tentang SPIP.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded border border-slate-200">
              Unit Kerja: {state.unit || 'Kementerian Perdagangan'}
            </span>
            <span className="bg-blue-50 text-blue-900 font-bold px-2.5 py-1 rounded border border-blue-200">
              Persona: {state.personaName || 'Pelaku Usaha'} ({state.personaRole || 'Pemohon'})
            </span>
            <span className="bg-amber-50 text-amber-900 font-mono font-bold px-2.5 py-1 rounded border border-amber-200">
              Sesi: {state.sessionId || 'TIM-DAGLU-01'}
            </span>
          </div>
        </div>

        {/* Active Service Switcher Dropdown */}
        <div className="service-switch-box">
          <label htmlFor="service-preset-select">Pilih Objek Layanan Aktif:</label>
          <select
            id="service-preset-select"
            value={presetKey}
            onChange={(e) => onSelectPreset?.(e.target.value)}
            className="service-dropdown"
          >
            <option value="perizinan">1. Layanan Persetujuan Impor (PI) Besi atau Baja (Ditjen Daglu)</option>
            <option value="pengaduan">2. Layanan Pengaduan Konsumen & Sengketa (Ditjen PKTN)</option>
            <option value="bantuan">3. Fasilitasi Paviliun Ekspor Internasional (Ditjen PEN)</option>
            <option value="kependudukan">4. Surat Tanda Pendaftaran Waralaba / STPW (Ditjen PDN)</option>
            <option value="kosong">5. Formulir Kanvas Baru (Mulai dari Awal)</option>
          </select>
        </div>
      </section>

      {/* 2. KPI Metrics Ribbon */}
      <section className="kpi-row" aria-label="Indikator Mutu Layanan">
        <div className="kpi-card kpi-navy">
          <div className="kpi-tag">Titik Sentuh Aktif</div>
          <div className="kpi-val">{totalStages}</div>
          <div className="kpi-desc">Terpetakan pada {totalStages} fase siklus proses</div>
        </div>

        <div className="kpi-card kpi-gold">
          <div className="kpi-tag">Estimasi Rata-rata SLA</div>
          <div className="kpi-val">3-5 Hari</div>
          <div className="kpi-desc">Standar ketetapan waktu proses layanan</div>
        </div>

        <div className="kpi-card kpi-alert">
          <div className="kpi-tag">Titik Friksi / Hambatan</div>
          <div className="kpi-val" style={{ color: 'var(--red-700)' }}>
            {criticalCount} Titik
          </div>
          <div className="kpi-desc">Memerlukan rekomendasi mitigasi SOP & sistem</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-tag">Indeks Kepuasan Pengguna</div>
          <div className="kpi-val" style={{ color: 'var(--teal-700)' }}>
            {avgCsat} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>/ 5.0</span>
          </div>
          <div className="kpi-desc">{csatCategory}</div>
        </div>
      </section>

      {/* 3. Horizontal Connected Stepper Rail */}
      <nav className="stepper-nav" aria-label="Alur Tahapan Interaksi">
        {state.stages.slice(0, 5).map((st, idx) => {
          const isActive = idx === safeIdx;
          const meta = getSentimentMeta(st.emotion);

          return (
            <div
              key={st.id || idx}
              onClick={() => onSetActiveStageIdx(idx)}
              className={`stepper-step ${isActive ? 'active' : ''}`}
            >
              <div className="step-circle">{idx + 1}</div>
              <div className="min-w-0 flex-1">
                <div className="step-title truncate">{st.code}: {st.name}</div>
                <div className="step-subtitle truncate">{st.subtitle || st.touchpoint || 'Titik Sentuh Layanan'}</div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* 4. Filter Cockpit Toolbar */}
      <section className="filter-cockpit" aria-label="Pengendali Tampilan dan Filter">
        {/* View Mode Toggle */}
        <div className="filter-segment">
          <span className="filter-label-text">Tampilan:</span>
          <div className="segmented-tabs">
            <button
              type="button"
              onClick={() => setActiveTab('flow')}
              className={`segment-tab-btn ${activeTab === 'flow' ? 'active' : ''}`}
            >
              Tampilan Alur Kolom
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className={`segment-tab-btn ${activeTab === 'table' ? 'active' : ''}`}
            >
              Matriks Kertas Kerja 5C
            </button>
          </div>
        </div>

        {/* Sentiment Filter Pills */}
        <div className="filter-segment">
          <span className="filter-label-text">Filter:</span>
          <button
            type="button"
            onClick={() => setSentimentFilter('all')}
            className={`filter-pill ${sentimentFilter === 'all' ? 'active' : ''}`}
          >
            Semua ({totalStages})
          </button>
          <button
            type="button"
            onClick={() => setSentimentFilter('negative')}
            className={`filter-pill ${sentimentFilter === 'negative' ? 'active' : ''}`}
          >
            Hanya Friksi ({criticalCount})
          </button>
          <button
            type="button"
            onClick={() => setSentimentFilter('positive')}
            className={`filter-pill ${sentimentFilter === 'positive' ? 'active' : ''}`}
          >
            Hanya Puas ({positiveCount})
          </button>
        </div>

        {/* Search & Actions */}
        <div className="filter-segment" style={{ marginLeft: 'auto' }}>
          <div className="relative">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari titik sentuh, kanal, keluhan..."
              className="search-input-field"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Add Stage Button */}
          <button
            type="button"
            onClick={onAddStage}
            className="btn btn-secondary btn-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Tahap</span>
          </button>

          {/* Templates Dropdown Popover */}
          <div className="relative inline-block" ref={templateMenuRef}>
            <button
              type="button"
              onClick={() => setIsTemplateMenuOpen((prev) => !prev)}
              className="btn btn-navy btn-sm"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Templat Tahap Kemendag</span>
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
                      <div className="mt-2 pt-2 border-t border-slate-200 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleInjectTemplate(tpl)}
                          className="px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
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
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 text-xs font-bold transition cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-700" />
                    <span>Muat Kerangka Standar 5 Tahap (Awareness s.d. Post-Service)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Main Canvas View - Flow Columns vs Matriks Kertas Kerja 5C */}
      {activeTab === 'flow' ? (
        <section className="journey-canvas-panel" aria-labelledby="flow-head">
          <div className="canvas-headline">
            <h2 className="canvas-title" id="flow-head">Fluktuasi Sentimen dan Alur Titik Sentuh Layanan</h2>
            <div className="legend-indicators">
              <span className="legend-chip"><span className="legend-box sq-pos" /> Positif (Puas)</span>
              <span className="legend-chip"><span className="legend-box sq-neu" /> Netral (Wajar)</span>
              <span className="legend-chip"><span className="legend-box sq-neg" /> Friksi (Kendala)</span>
            </div>
          </div>

          {/* Sentiment Fluctuation Curve SVG */}
          <div className="curve-card-wrap" aria-label="Grafik Kurva Sentimen">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 mb-2">
              <span>KURVA KEPUASAN PENGGUNA PER TAHAPAN PROSES</span>
              <span>Skor: 1.0 (Friksi Berat) s.d. 5.0 (Sangat Puas)</span>
            </div>

            <svg
              width="100%"
              height="75"
              viewBox="0 0 1000 75"
              preserveAspectRatio="none"
              style={{ display: 'block', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Curve Stroke */}
              {svgCurveData.pathD && (
                <path
                  d={svgCurveData.pathD}
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}

              {/* Data Dots and Score Labels */}
              {svgCurveData.dots.map((pt, pIdx) => {
                let dotColor = '#16a34a';
                if (pt.emotion < 0) dotColor = '#dc2626';
                else if (pt.emotion === 0) dotColor = '#d97706';

                return (
                  <g key={pIdx}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="6"
                      fill={dotColor}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      fontSize="11"
                      fontWeight="800"
                      fill={dotColor}
                      textAnchor="middle"
                    >
                      {pt.score}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Columns Grid with Sleek Touchpoint Cards */}
          <div className="columns-grid">
            {filteredStages.map(({ st, origIdx }) => {
              const meta = getSentimentMeta(st.emotion);
              const isActive = origIdx === safeIdx;
              const hasFriction = st.emotion < 0 || Boolean(st.burden);

              return (
                <div key={st.id || origIdx} className="stage-col">
                  {/* Column Header */}
                  <div className="stage-col-header">
                    <div>
                      <div className="stage-col-name">{st.code}: {st.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium truncate max-w-[170px]">
                        {st.subtitle || 'Proses Pelayanan'}
                      </div>
                    </div>
                    <span className={`sentiment-badge ${meta.cls}`}>
                      {meta.label}
                    </span>
                  </div>

                  {/* Column Body with Touchpoint Card */}
                  <div className="stage-col-body">
                    <div className={`tp-card ${meta.cardCls}`}>
                      {/* Meta Bar */}
                      <div className="card-meta-bar">
                        <span className="channel-tag truncate max-w-[140px]" title={st.touchpoint || 'Portal / Loket'}>
                          {st.touchpoint || 'Kanal Layanan'}
                        </span>
                        <span className="sla-figure text-[10px]">
                          SLA: 1-3 Hari
                        </span>
                      </div>

                      {/* Title & Persona */}
                      <div className="card-title-text">{st.name}</div>
                      <div className="persona-badge-tag">
                        {state.personaName || 'Pelaku Usaha'} ({state.personaRole || 'Pemohon'})
                      </div>

                      {/* Action Summary */}
                      <div className="action-summary-text">
                        {st.action || 'Pemohon mengajukan permohonan dan melengkapi berkas persyaratan secara daring.'}
                      </div>

                      {/* Response System */}
                      {st.response && (
                        <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 mb-2">
                          <strong className="text-slate-800">Respons Petugas/Sistem:</strong> {st.response}
                        </div>
                      )}

                      {/* Friction Callout if present */}
                      {hasFriction && (
                        <div className="painpoint-callout">
                          <strong>Hambatan:</strong> {st.burden || 'Kendala administratif atau durasi verifikasi.'}
                        </div>
                      )}

                      {/* Opportunity Callout if present */}
                      {st.opportunity && (
                        <div className="opportunity-callout">
                          <strong>Rekomendasi:</strong> {st.opportunity}
                        </div>
                      )}

                      {/* Card Action Bar */}
                      <div className="card-action-bar">
                        <button
                          type="button"
                          onClick={() => handleOpen5C(origIdx)}
                          className="btn-inspect flex items-center gap-1"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          <span>Analisis 5C</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditor(origIdx, 'fields')}
                          className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        /* Matriks Kertas Kerja 5C Table View */
        <section className="table-card-wrap" aria-labelledby="table-head">
          <div className="canvas-headline">
            <h2 className="canvas-title" id="table-head">
              Matriks Kertas Kerja Analisis Titik Sentuh & Rekomendasi 5C
            </h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="workpaper-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '130px' }}>Tahap Layanan</th>
                  <th scope="col" style={{ width: '160px' }}>Titik Sentuh & Kanal</th>
                  <th scope="col" style={{ width: '130px' }}>Persona</th>
                  <th scope="col">Kondisi Lapangan & Kendala</th>
                  <th scope="col" style={{ width: '100px' }}>Target SLA</th>
                  <th scope="col" style={{ width: '100px' }}>Status</th>
                  <th scope="col" style={{ width: '90px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredStages.map(({ st, origIdx }) => {
                  const meta = getSentimentMeta(st.emotion);

                  return (
                    <tr key={st.id || origIdx}>
                      <td className="font-bold text-slate-900">
                        {st.code}
                        <div className="text-[11px] font-normal text-slate-500">{st.name}</div>
                      </td>
                      <td>
                        <div className="font-bold text-slate-800">{st.name}</div>
                        <div className="text-[11px] text-slate-500">{st.touchpoint || '-'}</div>
                      </td>
                      <td>
                        <span className="persona-badge-tag">{state.personaName || 'Pelaku Usaha'}</span>
                      </td>
                      <td>
                        <div className="text-xs text-slate-700">{st.action}</div>
                        {st.burden && (
                          <div className="mt-1 text-[11px] text-red-700 bg-red-50 p-1.5 rounded border border-red-200">
                            <strong>Kendala:</strong> {st.burden}
                          </div>
                        )}
                      </td>
                      <td className="font-mono text-[11px] font-bold text-slate-600">
                        1-3 Hari
                      </td>
                      <td>
                        <span className={`sentiment-badge ${meta.cls}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleOpen5C(origIdx)}
                          className="btn-inspect"
                        >
                          Analisis 5C
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 6. Evidence Tracker Section */}
      <EvidenceTracker
        evidences={state.evidences || []}
        stages={state.stages}
        onOpenEvidenceManager={() => setIsEvidenceModalOpen(true)}
        onOpenLightbox={(ev) => setLightboxEvidence(ev)}
      />

      {/* 7. Next CTA Footer */}
      <div className="flex justify-between items-center bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="text-xs text-slate-500 font-medium">
          Perubahan pada alur kanvas tersimpan otomatis dalam sesi lokal browser.
        </div>
        <button
          type="button"
          onClick={onNext}
          className="btn btn-navy text-xs font-bold"
        >
          <span>Lanjut ke Fase III: Rencana Co-Design & Rekomendasi</span>
          <ArrowRight className="w-4 h-4 text-amber-400" />
        </button>
      </div>

      {/* 8. Full Audit 5C Modal Dialog */}
      {isAuditModalOpen && auditStage && (
        <div className="modal-veil" role="dialog" aria-modal="true" aria-labelledby="modal-5c-title">
          <div className="modal-container">
            <div className="modal-header-band">
              <h3 id="modal-5c-title">
                Kertas Kerja Audit 5C: {auditStage.code} ({auditStage.name})
              </h3>
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="modal-dismiss-btn"
                aria-label="Tutup jendela"
              >
                Esc
              </button>
            </div>

            <div className="modal-inner-body">
              {/* Identity Details */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-bold block">Objek Layanan:</span>
                  <span className="font-semibold text-slate-900">{state.service}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Kanal & Touchpoint:</span>
                  <span className="font-semibold text-slate-900">{auditStage.touchpoint || 'Portal INATRADE'}</span>
                </div>
              </div>

              {/* 5C Framework Matrix Card */}
              <div className="matrix-5c-card">
                <div className="matrix-5c-head flex justify-between items-center">
                  <span>Matriks Temuan Pengawasan Intern (Standar IPPF IIA)</span>
                  <button
                    type="button"
                    onClick={handleAutoPopulate5C}
                    className="text-[10px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded border border-amber-300 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    <span>Rumuskan Otomatis dari CJM</span>
                  </button>
                </div>

                <div className="matrix-5c-content space-y-3">
                  {/* 1. Condition */}
                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-slate-700 block mb-1">
                      1. Kondisi (Condition)
                    </label>
                    <textarea
                      rows={2}
                      value={auditStage.condition || auditStage.burden || ''}
                      onChange={(e) => handleUpdateAuditField('condition', e.target.value)}
                      placeholder="Fakta operasional teramati di lapangan..."
                      className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* 2. Criteria */}
                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-slate-700 block mb-1">
                      2. Kriteria (Criteria)
                    </label>
                    <input
                      type="text"
                      value={auditStage.criteria || ''}
                      onChange={(e) => handleUpdateAuditField('criteria', e.target.value)}
                      placeholder="Dasar hukum, Permendag, atau SOP rujukan..."
                      className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* 3. Cause */}
                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-slate-700 block mb-1">
                      3. Sebab (Cause)
                    </label>
                    <textarea
                      rows={2}
                      value={auditStage.cause || ''}
                      onChange={(e) => handleUpdateAuditField('cause', e.target.value)}
                      placeholder="Akar penyebab deviasi atau hambatan operasional..."
                      className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* 4. Consequence */}
                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-slate-700 block mb-1">
                      4. Akibat (Consequence)
                    </label>
                    <textarea
                      rows={2}
                      value={auditStage.consequence || ''}
                      onChange={(e) => handleUpdateAuditField('consequence', e.target.value)}
                      placeholder="Dampak risiko bagi masyarakat, pelaku usaha, dan reputasi kementerian..."
                      className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* 5. Corrective Action */}
                  <div className="corrective-action-callout">
                    <div className="action-heading">5. Rekomendasi / Tindakan Korektif (Corrective Action)</div>
                    <textarea
                      rows={2}
                      value={auditStage.recommendation || auditStage.opportunity || ''}
                      onChange={(e) => handleUpdateAuditField('recommendation', e.target.value)}
                      placeholder="Rekomendasi tindakan korektif perbaikan tata kelola dan sistem..."
                      className="w-full text-xs p-2 rounded border border-teal-300 bg-white focus:outline-none focus:border-teal-600 mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer-band">
              <button
                type="button"
                onClick={() => {
                  onForceSave?.();
                  setIsAuditModalOpen(false);
                  showToast('Kertas kerja 5C berhasil disimpan');
                }}
                className="btn btn-navy btn-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Kertas Kerja</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="btn btn-secondary btn-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Stage Editor Slide-Over Drawer */}
      {isEditorDrawerOpen && activeStage && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-300 animate-slide-in-right">
            {/* Drawer Header */}
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-amber-500">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Panel Editor Tahapan Layanan
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  {activeStage.code}: {activeStage.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorDrawerOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Tahapan:</label>
                <input
                  type="text"
                  value={activeStage.name}
                  onChange={(e) => handleUpdateAuditField('name', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Sub-judul / Keterangan:</label>
                <input
                  type="text"
                  value={activeStage.subtitle}
                  onChange={(e) => handleUpdateAuditField('subtitle', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Aktivitas Pemohon Layanan:</label>
                <textarea
                  rows={3}
                  value={activeStage.action}
                  onChange={(e) => handleUpdateAuditField('action', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Saluran Layanan (Touchpoint):</label>
                <input
                  type="text"
                  value={activeStage.touchpoint}
                  onChange={(e) => handleUpdateAuditField('touchpoint', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Respons Petugas / Sistem:</label>
                <textarea
                  rows={2}
                  value={activeStage.response}
                  onChange={(e) => handleUpdateAuditField('response', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Hambatan / Keluhan Pengguna:</label>
                <textarea
                  rows={2}
                  value={activeStage.burden}
                  onChange={(e) => handleUpdateAuditField('burden', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Skor Sentimen Pengalaman:</label>
                <div className="flex items-center gap-2">
                  {[-2, -1, 0, 1, 2].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleUpdateAuditField('emotion', val)}
                      className={`flex-1 py-1.5 font-bold rounded border transition ${
                        activeStage.emotion === val
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {val > 0 ? `+${val}` : val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Peluang Solusi (Opportunities):</label>
                <textarea
                  rows={2}
                  value={activeStage.opportunity}
                  onChange={(e) => handleUpdateAuditField('opportunity', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  onDeleteStage(safeIdx);
                  setIsEditorDrawerOpen(false);
                  showToast('Tahapan berhasil dihapus');
                }}
                className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Tahap</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onForceSave?.();
                    setIsEditorDrawerOpen(false);
                    showToast('Perubahan tahapan tersimpan');
                  }}
                  className="btn btn-navy btn-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. Evidence Manager Modal */}
      {isEvidenceModalOpen && onAddEvidence && onUpdateEvidence && onDeleteEvidence && (
        <EvidenceManagerModal
          isOpen={isEvidenceModalOpen}
          onClose={() => setIsEvidenceModalOpen(false)}
          evidences={state.evidences || []}
          stages={state.stages}
          onAddEvidence={onAddEvidence}
          onUpdateEvidence={onUpdateEvidence}
          onDeleteEvidence={onDeleteEvidence}
          onLoadSampleEvidences={onLoadSampleEvidences}
          onOpenLightbox={(ev) => setLightboxEvidence(ev)}
        />
      )}

      {/* 11. Lightbox */}
      {lightboxEvidence && (
        <EvidenceLightbox
          evidence={lightboxEvidence}
          onClose={() => setLightboxEvidence(null)}
        />
      )}
    </div>
  );
};
