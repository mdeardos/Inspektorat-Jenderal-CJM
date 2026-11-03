import React, { useState } from 'react';
import { 
  Building2, 
  UserCheck, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  MessageSquare, 
  Coins, 
  Sprout, 
  Info,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Tag,
  AlertTriangle,
  Search,
  Sparkles,
  User,
  Quote,
  Copy,
  Check,
  Hash,
  RefreshCw,
  Lock,
  KeyRound,
  Users,
  Share2
} from 'lucide-react';
import { EvaluationState, ServiceModelId } from '../types';
import { SERVICE_MODELS, LITERACY_OPTIONS } from '../data/presets';
import { generateShareUrl } from '../utils/sessionManager';

interface Step1ProfileProps {
  state: EvaluationState;
  onChange: (patch: Partial<EvaluationState>) => void;
  onNext: () => void;
  onOpenSessionModal?: () => void;
  onOpenPortal?: () => void;
}

export const Step1Profile: React.FC<Step1ProfileProps> = ({
  state,
  onChange,
  onNext,
  onOpenSessionModal,
  onOpenPortal
}) => {
  const [showTaxonomyModal, setShowTaxonomyModal] = useState<boolean>(false);
  const [expandedDetailId, setExpandedDetailId] = useState<ServiceModelId | null>(state.modelId);
  const [deckViewMode, setDeckViewMode] = useState<'deck' | 'compare'>('deck');
  const [copiedSessionId, setCopiedSessionId] = useState<boolean>(false);

  const selectedModel = SERVICE_MODELS.find(m => m.id === state.modelId) || SERVICE_MODELS[0];

  const handleCopySessionId = () => {
    if (!state.sessionId) return;
    const shareUrl = generateShareUrl(state.sessionId, '123456');
    navigator.clipboard.writeText(shareUrl);
    setCopiedSessionId(true);
    setTimeout(() => setCopiedSessionId(false), 2000);
  };

  const handleGenerateNewSessionId = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = state.unit?.toLowerCase().includes('daglu')
      ? 'ITJEN-DAGLU'
      : state.unit?.toLowerCase().includes('pktn')
      ? 'ITJEN-PKTN'
      : state.unit?.toLowerCase().includes('pen')
      ? 'ITJEN-DJPEN'
      : state.unit?.toLowerCase().includes('pdn')
      ? 'ITJEN-PDN'
      : 'ITJEN-CJM';
    const newId = `${prefix}-${new Date().getFullYear()}-${randomSuffix}`;
    onChange({ sessionId: newId });
  };

  const MODEL_THEMES: Record<ServiceModelId, {
    badge: string;
    bgAccent: string;
    borderActive: string;
    textDark: string;
    pillBg: string;
    glow: string;
  }> = {
    guardian: {
      badge: 'Otoritas & Regulasi Niaga',
      bgAccent: 'bg-blue-600',
      borderActive: 'border-blue-600 ring-2 ring-blue-500/30',
      textDark: 'text-blue-950',
      pillBg: 'bg-blue-50 text-blue-900 border-blue-200',
      glow: 'shadow-blue-900/10'
    },
    performance: {
      badge: 'Layanan Otomasi Cepat & 24/7',
      bgAccent: 'bg-amber-600',
      borderActive: 'border-amber-600 ring-2 ring-amber-500/30',
      textDark: 'text-amber-950',
      pillBg: 'bg-amber-50 text-amber-900 border-amber-200',
      glow: 'shadow-amber-900/10'
    },
    activator: {
      badge: 'Pemberdayaan Usaha & Konsultasi',
      bgAccent: 'bg-indigo-600',
      borderActive: 'border-indigo-600 ring-2 ring-indigo-500/30',
      textDark: 'text-indigo-950',
      pillBg: 'bg-indigo-50 text-indigo-900 border-indigo-200',
      glow: 'shadow-indigo-900/10'
    },
    funder: {
      badge: 'Bantuan Sarana & Subsidi Niaga',
      bgAccent: 'bg-emerald-600',
      borderActive: 'border-emerald-600 ring-2 ring-emerald-500/30',
      textDark: 'text-emerald-950',
      pillBg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      glow: 'shadow-emerald-900/10'
    },
    yield: {
      badge: 'Jasa Teknis Berbayar (PNBP)',
      bgAccent: 'bg-teal-600',
      borderActive: 'border-teal-600 ring-2 ring-teal-500/30',
      textDark: 'text-teal-950',
      pillBg: 'bg-teal-50 text-teal-900 border-teal-200',
      glow: 'shadow-teal-900/10'
    }
  };

  const getModelIcon = (id: ServiceModelId) => {
    switch (id) {
      case 'guardian':
        return <ShieldCheck className="w-5 h-5 text-blue-600" />;
      case 'performance':
        return <Zap className="w-5 h-5 text-amber-600" />;
      case 'activator':
        return <MessageSquare className="w-5 h-5 text-indigo-600" />;
      case 'funder':
        return <Coins className="w-5 h-5 text-emerald-600" />;
      case 'yield':
        return <Sprout className="w-5 h-5 text-teal-600" />;
    }
  };

  const coreFields = [
    { label: 'Unit Penyelenggara', filled: Boolean(state.unit?.trim()) },
    { label: 'Nama Layanan', filled: Boolean(state.service?.trim()) },
    { label: 'Tim Evaluator', filled: Boolean(state.auditor?.trim()) },
    { label: 'Nama Persona', filled: Boolean(state.personaName?.trim()) },
    { label: 'Ekspektasi Warga', filled: Boolean(state.personaGoal?.trim()) }
  ];
  const filledCount = coreFields.filter(f => f.filled).length;
  const isReady = filledCount >= 4;

  const getInitials = (name: string) => {
    if (!name.trim()) return 'P';
    return name
      .trim()
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Guidance */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1.5">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Langkah 1: Identifikasi Objek Layanan & Karakteristik Warga (Citizen Persona)
            </h2>
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-600">
              <span className="tabular-nums">{filledCount}/5</span>
              <span>Parameter Terisi</span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className={isReady ? 'text-emerald-700 font-bold' : 'text-amber-700'}>
                {isReady ? 'Siap Dievaluasi' : 'Belum Lengkap'}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
            Evaluasi pelayanan publik berbasis <em>citizen-centric</em> menempatkan perspektif warga sebagai pusat pengawasan Inspektorat Jenderal: kenali objek layanan, pahami profil pengguna, dan tetapkan klasifikasi model layanan yang tepat.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs hover:shadow-sm"
          >
            <span>Lanjut ke Kanvas CJM</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Identitas Objek & Persona */}
        <div className="lg:col-span-5 space-y-6">
          {/* Identitas Objek Evaluasi */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Identitas Unit & Objek Layanan
                </h3>
                <p className="text-[11px] text-slate-500">Unit kerja penyelenggara dan ruang lingkup pengawasan</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Merged Inspektorat & Sesi Kolaborasi Tim Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-slate-50 border border-blue-200/90 shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0b1c3d] text-amber-400 flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                        Permendag No. 6 Tahun 2025
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">
                        Inspektorat & Sesi Tim Kolaborasi
                      </h4>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Terisolasi Aman ✓</span>
                  </span>
                </div>

                {/* Current Active Team Display */}
                <div className="p-3 rounded-xl bg-white border border-blue-200 flex items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">ID SESI AKTIF:</span>
                    <span className="font-mono text-sm font-extrabold text-[#0b1c3d]">
                      {state.sessionId || 'ITJEN-1-DAGLU-01'}
                    </span>
                    <span className="text-xs text-slate-600 font-medium block mt-0.5 truncate max-w-[260px]">
                      {state.auditor || 'Tim Pengawasan Itjen Kemendag'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopySessionId}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer shrink-0 ${
                      copiedSessionId
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
                    }`}
                    title="Salin tautan kolaborasi tim untuk dibagikan"
                  >
                    {copiedSessionId ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Tersalin ✓</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-blue-700" />
                        <span>Bagi Link</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Primary Action Button: Ganti Tim / Pilih Inspektorat */}
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={onOpenSessionModal || onOpenPortal}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b1c3d] hover:bg-blue-950 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-98"
                  >
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pilih Inspektorat & Ganti Tim Pengawasan</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 ml-auto" />
                  </button>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed">
                  💡 Setiap tim pengawasan di Inspektorat I, II, III, dan IV memiliki ruang kerja terpisah sehingga input evaluasi tidak tertimpa.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit Kerja Penyelenggara Layanan
                </label>
                <input
                  type="text"
                  value={state.unit}
                  onChange={(e) => onChange({ unit: e.target.value })}
                  placeholder="Contoh: Ditjen Perdagangan Luar Negeri / Ditjen PKTN Kemendag"
                  className="w-full text-xs rounded-xl border border-slate-300 px-3.5 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Layanan Publik yang Dievaluasi
                </label>
                <input
                  type="text"
                  value={state.service}
                  onChange={(e) => onChange({ service: e.target.value })}
                  placeholder="Contoh: Penerbitan Persetujuan Impor (PI) melalui INATRADE"
                  className="w-full text-xs font-semibold rounded-xl border border-slate-300 px-3.5 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tim Evaluator
                  </label>
                  <input
                    type="text"
                    value={state.auditor}
                    onChange={(e) => onChange({ auditor: e.target.value })}
                    placeholder="Contoh: Tim Evaluator Itjen Kemendag"
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Periode Evaluasi
                  </label>
                  <input
                    type="text"
                    value={state.period}
                    onChange={(e) => onChange({ period: e.target.value })}
                    placeholder="Contoh: Semester I - 2025"
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Persona Pengguna Layanan (Citizen) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Persona Pengguna Layanan (Citizen)
                  </h3>
                  <p className="text-[11px] text-slate-500">Profil warga atau pelaku usaha yang dilayani</p>
                </div>
              </div>

              {state.personaName && (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                  <span>Persona Terisi ✓</span>
                </div>
              )}
            </div>

            {/* Persona Visual Badge Preview */}
            <div className="p-3 bg-gradient-to-r from-slate-50 to-blue-50/40 rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-xs shadow-2xs shrink-0">
                {getInitials(state.personaName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {state.personaName || 'Nama Persona Belum Diisi'}
                </div>
                <div className="text-[11px] text-slate-600 truncate">
                  {state.personaRole || 'Latar Belakang / Usaha Belum Diisi'}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama / Inisial Persona
                  </label>
                  <input
                    type="text"
                    value={state.personaName}
                    onChange={(e) => onChange({ personaName: e.target.value })}
                    placeholder="Contoh: Rina Wijaya"
                    className="w-full text-xs font-semibold rounded-xl border border-slate-300 px-3 py-2 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pekerjaan / Latar Belakang
                  </label>
                  <input
                    type="text"
                    value={state.personaRole}
                    onChange={(e) => onChange({ personaRole: e.target.value })}
                    placeholder="Contoh: Pelaku Usaha IKM Kuliner"
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Karakteristik Literasi Digital & Akses Kanal
                </label>
                <select
                  value={state.personaLiteracy}
                  onChange={(e) => onChange({ personaLiteracy: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition cursor-pointer font-medium text-slate-800"
                >
                  {LITERACY_OPTIONS.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tujuan & Ekspektasi Kunci Warga (Citizen Goal)
                </label>
                <textarea
                  rows={3}
                  value={state.personaGoal}
                  onChange={(e) => onChange({ personaGoal: e.target.value })}
                  placeholder="Apa hasil akhir yang sangat diharapkan warga saat berinteraksi dengan layanan ini?"
                  className="w-full text-xs rounded-xl border border-slate-300 px-3.5 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 leading-relaxed transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Deck Kartu Taktil 5 Model Layanan Publik */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            {/* Header & Controls */}
            <div className="pb-3.5 mb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/60 shadow-2xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <span>Deck Kartu Karakteristik Model Layanan</span>
                    <span className="text-[10px] font-mono font-normal text-slate-500 hidden sm:inline">
                      (Schedler & Guenduez, 2024)
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">Pilih 1 dari 5 model untuk menetapkan fokus pengawasan dan risiko beban</p>
                </div>
              </div>

              {/* View Mode Toggle & Modal Button */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setDeckViewMode('deck')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition ${
                      deckViewMode === 'deck'
                        ? 'bg-white text-blue-900 shadow-2xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Tampilkan dalam format Deck Interaktif & Berkas Terpilih"
                  >
                    Deck Taktil
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeckViewMode('compare')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition ${
                      deckViewMode === 'compare'
                        ? 'bg-white text-blue-900 shadow-2xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Bandingkan kelima model sekaligus secara paralel"
                  >
                    Bandingkan (5)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTaxonomyModal(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition shadow-2xs"
                  title="Lihat tabel taksonomi lengkap 5 model"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Panduan</span>
                </button>
              </div>
            </div>

            {/* Practical Evaluation Guidance */}
            <div className="mb-4 bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Setiap model memiliki <strong>titik kritis beban administratif</strong> yang berbeda. Menentukan klasifikasi yang tepat akan memandu fokus evaluator pada Kanvas CJM dan penyusunan rekomendasi Inspektorat Jenderal.
              </p>
            </div>

            {/* TAMPILAN 1: DECK TAKTIL INTERAKTIF */}
            {deckViewMode === 'deck' && (
              <div className="space-y-4">
                {/* 5-Card Tactical Deck Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {SERVICE_MODELS.map((model) => {
                    const isSelected = model.id === state.modelId;
                    const theme = MODEL_THEMES[model.id];

                    return (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => {
                          onChange({ modelId: model.id });
                          setExpandedDetailId(model.id);
                        }}
                        className={`text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between group relative ${
                          isSelected
                            ? `${theme.borderActive} bg-white shadow-md -translate-y-0.5`
                            : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 hover:-translate-y-0.5 shadow-2xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className={`p-1.5 rounded-lg transition-transform ${isSelected ? 'bg-slate-100 scale-105' : 'bg-white border border-slate-200'}`}>
                              {getModelIcon(model.id)}
                            </div>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-blue-200" />
                            )}
                          </div>
                          <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>
                            {model.name}
                          </div>
                        </div>

                        <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                          <span className={`font-medium truncate ${isSelected ? 'text-blue-700 font-bold' : 'text-slate-500'}`}>
                            {model.roleIndo.split(' ')[0]}...
                          </span>
                          <span className={`text-[9px] font-bold ${isSelected ? 'text-blue-900' : 'text-slate-400'}`}>
                            {isSelected ? '✓ Aktif' : 'Pilih'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Showcase Dossier: Kartu Taktil Model Terpilih */}
                <div className={`rounded-2xl border-2 transition-all p-5 bg-white shadow-sm ${MODEL_THEMES[selectedModel.id].borderActive}`}>
                  {/* Model Header Banner */}
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 shadow-2xs shrink-0">
                        {getModelIcon(selectedModel.id)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900">
                            {selectedModel.name}
                          </h4>
                          <span className="text-slate-300" aria-hidden="true">·</span>
                          <span className="text-xs font-semibold text-slate-700 font-mono">
                            {selectedModel.category}
                          </span>
                          <span className="text-slate-300" aria-hidden="true">·</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {MODEL_THEMES[selectedModel.id].badge}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 font-medium mt-1">
                          Peran Unit Penyelenggara: <strong className="text-slate-900">{selectedModel.roleIndo}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300/80 text-xs font-bold shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Model Terpilih</span>
                    </div>
                  </div>

                  {/* Pengertian Singkat bagi Evaluator (Anti-Slop Clean Typography) */}
                  <div className="mt-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                      <span>Pengertian Singkat bagi Evaluator (Schedler & Guenduez, 2024):</span>
                    </div>
                    <p className="text-slate-800 text-xs leading-relaxed font-normal">
                      {selectedModel.shortDefinition}
                    </p>
                  </div>

                  {/* Contoh Konkret Layanan Kemendag */}
                  <div className="mt-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 block mb-1">
                      Contoh Layanan Konkret di Lingkungan Kementerian Perdagangan:
                    </span>
                    <p className="text-slate-800 text-xs leading-relaxed">
                      {selectedModel.examples}
                    </p>
                  </div>

                  {/* Varian Sub-Models */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mr-1">
                      <Tag className="w-3 h-3" />
                      <span>Varian Layanan:</span>
                    </span>
                    {selectedModel.subModels.map((sub, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center text-[10px] font-medium px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>

                  {/* Diagnostic Radar Grid: Fokus & Risiko Beban Kritis */}
                  <div className="mt-4 pt-3.5 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 shadow-2xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 mb-1 flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Fokus Utama yang Perlu Dievaluasi:</span>
                      </div>
                      <p className="text-emerald-950 text-xs leading-relaxed">
                        {selectedModel.focus}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 shadow-2xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-rose-900 mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                        <span>Risiko Beban Administratif Kunci:</span>
                      </div>
                      <p className="text-rose-950 text-xs leading-relaxed">
                        {selectedModel.keyBurdenRisk}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAMPILAN 2: BANDINGKAN KELIMA MODEL SEKALIGUS */}
            {deckViewMode === 'compare' && (
              <div className="space-y-3">
                {SERVICE_MODELS.map((model) => {
                  const isSelected = model.id === state.modelId;
                  const theme = MODEL_THEMES[model.id];

                  return (
                    <div
                      key={model.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isSelected
                          ? `${theme.borderActive} bg-white shadow-sm`
                          : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0">
                            {getModelIcon(model.id)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-900">{model.name}</span>
                              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                {model.category}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              Peran: <strong className="text-slate-900">{model.roleIndo}</strong>
                            </div>
                            <p className="text-slate-700 text-[11px] mt-1.5 leading-relaxed">
                              {model.shortDefinition}
                            </p>
                            <div className="text-[10px] text-slate-500 mt-1">
                              <strong>Contoh Kemendag:</strong> {model.examples}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 self-end sm:self-start">
                          {isSelected ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-2xs">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Model Aktif</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                onChange({ modelId: model.id });
                                setDeckViewMode('deck');
                              }}
                              className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition"
                            >
                              Pilih Model Ini
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Summary Strip */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Model Terpilih:</span>{' '}
                <strong className="text-blue-700 font-bold">{selectedModel.name}</strong>{' '}
                <span className="text-slate-600">({selectedModel.roleIndo})</span>
              </div>
              <button
                type="button"
                onClick={onNext}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs hover:shadow-sm"
              >
                <span>Lanjut ke Kanvas CJM (Fase II)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Ringkasan 5 Model Layanan Publik */}
      {showTaxonomyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-700" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Panduan Karakteristik 5 Model Pelayanan Publik
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ikhtisar ringkas bagi Tim Evaluator Inspektorat Jenderal Kementerian Perdagangan
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTaxonomyModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
              >
                Tutup ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-blue-900 leading-relaxed">
                Kelima model layanan publik ini membedakan peran negara dalam memberikan pelayanan kepada masyarakat dan pelaku usaha. Gunakan tabel ringkasan ini untuk mencocokkan karakteristik layanan Kemendag yang sedang dievaluasi.
              </div>

              <div className="space-y-3">
                {SERVICE_MODELS.map((model, idx) => (
                  <div key={model.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs">{model.name}</h4>
                        <span className="text-[11px] text-slate-500">({model.category})</span>
                      </div>
                      <span className="text-[11px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        {model.roleIndo}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-800 leading-relaxed border border-slate-200">
                      <strong className="text-slate-900 block mb-0.5">Pengertian Singkat:</strong>
                      {model.shortDefinition}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <strong className="text-slate-800">Contoh Kemendag:</strong>{' '}
                        <span className="text-slate-600">{model.examples}</span>
                      </div>
                      <div>
                        <strong className="text-slate-800">Fokus Evaluasi:</strong>{' '}
                        <span className="text-slate-600">{model.focus}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-600">
                      <div>
                        <strong className="text-slate-800">Risiko Beban Kunci:</strong> {model.keyBurdenRisk}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onChange({ modelId: model.id });
                          setShowTaxonomyModal(false);
                        }}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                          state.modelId === model.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        {state.modelId === model.id ? '✓ Sedang Dipilih' : 'Gunakan Model Ini'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Inspektorat Jenderal Kementerian Perdagangan · Instrumen Evaluasi Pelayanan Publik
              </span>
              <button
                type="button"
                onClick={() => setShowTaxonomyModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
