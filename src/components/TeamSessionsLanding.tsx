import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Users, 
  ArrowRight, 
  Search, 
  PlusCircle, 
  LogIn, 
  KeyRound, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  Upload, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Scale,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { CollaborationSessionMeta, EvaluationState, InspektoratId } from '../types';
import { 
  getRegisteredSessions, 
  verifySessionAccess, 
  registerNewSession, 
  loadSessionState, 
  saveSessionState,
  retrieveSessionPasscode,
  generateShareUrl,
  KEMENDAG_INSPEKTORAT_LIST,
  InspektoratDefinition
} from '../utils/sessionManager';
import { PRESETS } from '../data/presets';
import { SAMPLE_EVIDENCES } from '../utils/evidenceHelpers';
import { PortalDashboard } from './PortalDashboard';

interface TeamSessionsLandingProps {
  currentSessionId: string;
  currentState: EvaluationState;
  onSelectSession: (sessionId: string, sessionState: EvaluationState) => void;
  onContinueCurrentCanvas: () => void;
}

export const TeamSessionsLanding: React.FC<TeamSessionsLandingProps> = ({
  currentSessionId,
  currentState,
  onSelectSession,
  onContinueCurrentCanvas
}) => {
  // Registry List
  const [sessions, setSessions] = useState<CollaborationSessionMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeInspTab, setActiveInspTab] = useState<'all' | InspektoratId>('inspektorat_1');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [enteringId, setEnteringId] = useState<string | null>(null);

  // Advanced / Secondary Drawer State
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [advancedTab, setAdvancedTab] = useState<'create' | 'connect' | 'recover'>('create');

  // Connect Form State
  const [connectId, setConnectId] = useState<string>('');
  const [connectPin, setConnectPin] = useState<string>('');
  const [connectError, setConnectError] = useState<string>('');
  const [connectSuccess, setConnectSuccess] = useState<string>('');

  // Create Form State
  const [newInspektorat, setNewInspektorat] = useState<InspektoratId>('inspektorat_1');
  const [newId, setNewId] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('123456');
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [newAuditorName, setNewAuditorName] = useState<string>('');
  const [newTemplate, setNewTemplate] = useState<string>('perizinan');
  const [createError, setCreateError] = useState<string>('');
  const [createSuccess, setCreateSuccess] = useState<string>('');

  // Recovery State
  const [recoveryId, setRecoveryId] = useState<string>('');
  const [recoveryKey, setRecoveryKey] = useState<string>('ITJEN-PULIH-2025');
  const [recoveryResult, setRecoveryResult] = useState<{ success: boolean; message: string; passcode?: string } | null>(null);

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Sessions on Mount
  useEffect(() => {
    const list = getRegisteredSessions();
    setSessions(list);
    setNewAuditorName(currentState.auditor || 'Auditor Itjen Kemendag');
    generateDefaultTeamData('inspektorat_1');
  }, [currentState.auditor]);

  const generateDefaultTeamData = (inspId: InspektoratId) => {
    const rand = Math.floor(10 + Math.random() * 90);
    if (inspId === 'inspektorat_1') {
      setNewId(`ITJEN-1-TIM-${rand}`);
      setNewTeamName('Tim Pengawasan Ditjen Daglu & PDN');
      setNewTemplate('perizinan');
    } else if (inspId === 'inspektorat_2') {
      setNewId(`ITJEN-2-TIM-${rand}`);
      setNewTeamName('Tim Pengawasan DJPEN & PPI');
      setNewTemplate('bantuan');
    } else if (inspId === 'inspektorat_3') {
      setNewId(`ITJEN-3-TIM-${rand}`);
      setNewTeamName('Tim Pengawasan Ditjen PKTN & Bappebti');
      setNewTemplate('pengaduan');
    } else {
      setNewId(`ITJEN-4-TIM-${rand}`);
      setNewTeamName('Tim Pengawasan Setjen & BPSDMP');
      setNewTemplate('kosong');
    }
  };

  // 1-Click Fast Entry to Team Canvas
  const handleFastEntry = (session: CollaborationSessionMeta) => {
    setEnteringId(session.sessionId);
    
    // Load existing state from memory, or fallback to sensible preset
    let loaded = loadSessionState(session.sessionId);
    if (!loaded) {
      if (session.sessionId.includes('DAGLU') || session.sessionId.includes('-1-')) {
        loaded = JSON.parse(JSON.stringify(PRESETS.perizinan));
      } else if (session.sessionId.includes('DJPEN') || session.sessionId.includes('-2-')) {
        loaded = JSON.parse(JSON.stringify(PRESETS.bantuan));
      } else if (session.sessionId.includes('PKTN') || session.sessionId.includes('-3-')) {
        loaded = JSON.parse(JSON.stringify(PRESETS.pengaduan));
      } else if (session.sessionId.includes('PDN')) {
        loaded = JSON.parse(JSON.stringify(PRESETS.kependudukan));
      } else {
        loaded = JSON.parse(JSON.stringify(currentState));
      }
      loaded!.sessionId = session.sessionId;
      loaded!.evidences = [...SAMPLE_EVIDENCES];
      saveSessionState(session.sessionId, loaded!);
    }

    // Direct transition into canvas without prompt
    setTimeout(() => {
      onSelectSession(session.sessionId, loaded!);
    }, 200);
  };

  // Connect Custom Session
  const handleConnectCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setConnectError('');
    setConnectSuccess('');

    if (!connectId.trim()) {
      setConnectError('Mohon masukkan ID Sesi.');
      return;
    }

    const verification = verifySessionAccess(connectId, connectPin);
    if (!verification.success) {
      setConnectError(verification.message);
      return;
    }

    let loaded = loadSessionState(connectId);
    if (!loaded) {
      loaded = { ...currentState, sessionId: connectId.toUpperCase() };
      saveSessionState(connectId, loaded);
    }

    setConnectSuccess('Verifikasi berhasil! Mengalihkan ke kanvas...');
    setTimeout(() => {
      onSelectSession(connectId.toUpperCase(), loaded!);
    }, 400);
  };

  // Create New Session
  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (!newId.trim()) {
      setCreateError('ID Sesi wajib diisi.');
      return;
    }

    let baseState: EvaluationState;
    if (newTemplate === 'perizinan') {
      baseState = JSON.parse(JSON.stringify(PRESETS.perizinan));
    } else if (newTemplate === 'pengaduan') {
      baseState = JSON.parse(JSON.stringify(PRESETS.pengaduan));
    } else if (newTemplate === 'bantuan') {
      baseState = JSON.parse(JSON.stringify(PRESETS.bantuan));
    } else if (newTemplate === 'kependudukan') {
      baseState = JSON.parse(JSON.stringify(PRESETS.kependudukan));
    } else {
      baseState = JSON.parse(JSON.stringify(PRESETS.kosong));
    }

    baseState.sessionId = newId.trim().toUpperCase();
    baseState.evidences = [...SAMPLE_EVIDENCES];
    if (newAuditorName.trim()) {
      baseState.auditor = newAuditorName.trim();
    }

    const reg = registerNewSession(
      newId,
      newPin || '123456',
      newTeamName || `Tim Kerja ${newId}`,
      baseState,
      newAuditorName,
      newInspektorat
    );

    if (!reg.success) {
      setCreateError(reg.message);
      return;
    }

    setCreateSuccess('Tim baru berhasil dibuat! Membuka kanvas...');
    setSessions(getRegisteredSessions());
    setTimeout(() => {
      onSelectSession(newId.trim().toUpperCase(), baseState);
    }, 500);
  };

  // Recovery Handler
  const handleRecoverPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryId.trim()) {
      setRecoveryResult({ success: false, message: 'Masukkan ID Sesi yang dicari.' });
      return;
    }
    const res = retrieveSessionPasscode(recoveryId, recoveryKey);
    setRecoveryResult(res);
  };

  // JSON File Import
  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && (parsed.state || parsed.stages)) {
          const importedState: EvaluationState = parsed.state || parsed;
          const meta: CollaborationSessionMeta = parsed.meta || {
            sessionId: importedState.sessionId || `IMPORT-${Math.floor(100 + Math.random() * 900)}`,
            passcode: '123456',
            teamName: 'Tim Sesi Impor Offline',
            inspektoratId: 'inspektorat_1',
            inspektoratName: 'Inspektorat I',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          registerNewSession(meta.sessionId, meta.passcode, meta.teamName, importedState, meta.creatorName, meta.inspektoratId);
          setSessions(getRegisteredSessions());
          onSelectSession(meta.sessionId, importedState);
        }
      } catch (err) {
        alert('Format file JSON sesi tidak valid.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Filter Sessions
  const filteredSessions = sessions.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (
      s.sessionId.toLowerCase().includes(q) ||
      s.teamName.toLowerCase().includes(q) ||
      (s.unitName && s.unitName.toLowerCase().includes(q)) ||
      (s.serviceName && s.serviceName.toLowerCase().includes(q)) ||
      (s.creatorName && s.creatorName.toLowerCase().includes(q))
    );

    if (!matchesSearch) return false;
    if (activeInspTab === 'all') return true;

    if (s.inspektoratId) {
      return s.inspektoratId === activeInspTab;
    }
    if (activeInspTab === 'inspektorat_1') {
      return s.sessionId.includes('-1-') || s.sessionId.includes('DAGLU') || s.sessionId.includes('PDN');
    }
    if (activeInspTab === 'inspektorat_2') {
      return s.sessionId.includes('-2-') || s.sessionId.includes('DJPEN') || s.sessionId.includes('PPI');
    }
    if (activeInspTab === 'inspektorat_3') {
      return s.sessionId.includes('-3-') || s.sessionId.includes('PKTN') || s.sessionId.includes('BAPPEBTI');
    }
    if (activeInspTab === 'inspektorat_4') {
      return s.sessionId.includes('-4-') || s.sessionId.includes('SETJEN') || s.sessionId.includes('BPSDMP');
    }
    return true;
  });

  const activeInspDef = activeInspTab !== 'all' 
    ? KEMENDAG_INSPEKTORAT_LIST.find(i => i.id === activeInspTab)
    : null;

  const countByInsp = (inspId: InspektoratId) => {
    return sessions.filter(s => {
      if (s.inspektoratId === inspId) return true;
      if (inspId === 'inspektorat_1') return s.sessionId.includes('-1-') || s.sessionId.includes('DAGLU') || s.sessionId.includes('PDN');
      if (inspId === 'inspektorat_2') return s.sessionId.includes('-2-') || s.sessionId.includes('DJPEN') || s.sessionId.includes('PPI');
      if (inspId === 'inspektorat_3') return s.sessionId.includes('-3-') || s.sessionId.includes('PKTN') || s.sessionId.includes('BAPPEBTI');
      if (inspId === 'inspektorat_4') return s.sessionId.includes('-4-') || s.sessionId.includes('SETJEN') || s.sessionId.includes('BPSDMP');
      return false;
    }).length;
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 pb-16">
      {/* 1. TOP OFFICIAL HEADER */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs">
              <img
                src="/assets/aistudio/image_6fb22ebf.png"
                alt="Logo Resmi Itjen Kemendag"
                width={36}
                height={36}
                className="h-8 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#0b1c3d] uppercase">
                  Inspektorat Jenderal · Kemendag RI
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded hidden sm:inline">
                  Permendag 6/2025
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-950 tracking-tight">
                Pilih Tim Pengawasan Pelayanan Publik
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentSessionId && (
              <button
                type="button"
                onClick={onContinueCurrentCanvas}
                className="inline-flex items-center gap-2 bg-[#0b1c3d] hover:bg-blue-950 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer active:scale-95"
              >
                <span>Buka Kanvas Aktif</span>
                <span className="font-mono text-amber-300 text-[11px] bg-white/10 px-1.5 py-0.5 rounded">
                  {currentSessionId}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold px-2.5 py-2 rounded-xl transition cursor-pointer"
              title="Impor berkas sesi (.json)"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">Impor JSON</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleJsonFileUpload}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        <PortalDashboard
          sessions={sessions}
          currentSessionId={currentSessionId}
          currentState={currentState}
          onContinueCurrentCanvas={onContinueCurrentCanvas}
        />
        {/* Simple Step Banner */}
        <div id="inspektorat-selector" className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0b1c3d] text-xs font-bold font-mono mb-2.5">
              <Scale className="w-3.5 h-3.5 text-blue-700" />
              <span>Akses Cepat Pengawasan 4 Inspektorat (SOTK Permendag No. 6 Tahun 2025)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight leading-snug">
              Pilih Inspektorat Anda untuk Memulai Evaluasi
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Klik nama Inspektorat di bawah, lalu pilih tim Anda untuk langsung membuka kanvas kerja Customer Journey Map (CJM) tanpa kendala.
            </p>
          </div>

          {/* 4 BIG INSPEKTORAT CARDS (STEP 1) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            {KEMENDAG_INSPEKTORAT_LIST.map((insp) => {
              const isSelected = activeInspTab === insp.id;
              const count = countByInsp(insp.id);

              return (
                <button
                  key={insp.id}
                  type="button"
                  onClick={() => setActiveInspTab(insp.id)}
                  className={`relative p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#0b1c3d] to-blue-950 text-white border-[#0b1c3d] shadow-md ring-2 ring-blue-500/30'
                      : 'bg-slate-50/70 hover:bg-slate-100/90 text-slate-900 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`w-8 h-8 rounded-xl font-mono text-sm font-black flex items-center justify-center ${
                        isSelected 
                          ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' 
                          : 'bg-white border border-slate-200 text-blue-950'
                      }`}>
                        {insp.roman}
                      </span>
                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isSelected 
                          ? 'bg-white/15 text-amber-300' 
                          : 'bg-slate-200/80 text-slate-600'
                      }`}>
                        {count} Tim
                      </span>
                    </div>

                    <h3 className={`text-sm font-extrabold tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {insp.name}
                    </h3>
                    <p className={`text-[11px] font-medium mt-1 line-clamp-2 leading-relaxed ${
                      isSelected ? 'text-blue-100' : 'text-slate-500'
                    }`}>
                      {insp.headline}
                    </p>
                  </div>

                  <div className={`mt-3 pt-2.5 border-t text-[11px] font-bold flex items-center justify-between ${
                    isSelected ? 'border-white/15 text-amber-300' : 'border-slate-200 text-blue-700'
                  }`}>
                    <span>{isSelected ? 'Sedang Dipilih' : 'Pilih Wilayah Ini'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* "Semua Inspektorat" Filter Pill */}
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">
              Atau tampilkan seluruh tim lintas kementerian:
            </span>
            <button
              type="button"
              onClick={() => setActiveInspTab('all')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                activeInspTab === 'all'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Lihat Semua Tim ({sessions.length})</span>
            </button>
          </div>
        </div>

        {/* 3. STEP 2: TEAMS DIRECTORY WITH DIRECT 1-CLICK ACCESS */}
        <section id="team-directory" className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            {/* Context Header for Selected Inspektorat */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    LANGKAH 2
                  </span>
                  <h3 className="text-base font-bold text-slate-950">
                    {activeInspTab === 'all'
                      ? 'Daftar Semua Tim Pengawasan Kemendag'
                      : `Daftar Tim Pengawasan · ${activeInspDef?.name}`}
                  </h3>
                </div>
                {activeInspDef && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    <strong>Mitra Kerja (Permendag 6/2025):</strong> {activeInspDef.auditedScope}
                  </p>
                )}
              </div>

              {/* Instant Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari tim, layanan, unit..."
                  className="w-full text-xs rounded-xl border border-slate-200 pl-8 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                />
              </div>
            </div>

            {/* List of Team Cards (1-Click Entry) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {filteredSessions.map((session) => {
                const isCurrent = session.sessionId === currentSessionId;
                const isOpening = enteringId === session.sessionId;
                const inspInfo = KEMENDAG_INSPEKTORAT_LIST.find(
                  i => i.id === session.inspektoratId || session.sessionId.includes(`-${i.roman}-`)
                ) || KEMENDAG_INSPEKTORAT_LIST[0];

                return (
                  <div
                    key={session.sessionId}
                    className={`rounded-2xl border p-4.5 transition-all flex flex-col justify-between gap-4 ${
                      isCurrent
                        ? 'bg-blue-50/40 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white hover:bg-slate-50/60 border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-extrabold text-[#0b1c3d] bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-blue-700" />
                            <span>{session.sessionId}</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {session.inspektoratName || inspInfo.name}
                          </span>
                        </div>

                        {isCurrent && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                            <span>Sedang Dibuka</span>
                          </span>
                        )}
                      </div>

                      {/* Team Name and Unit */}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-900 leading-snug">
                          {session.teamName}
                        </h4>
                        <p className="text-xs font-semibold text-blue-900/90 mt-1 flex items-start gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{session.serviceName || 'Layanan Publik Kemendag'}</span>
                        </p>
                        {session.unitName && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 font-medium pl-4.5">
                            Unit: {session.unitName}
                          </p>
                        )}
                      </div>

                      {/* Auditor & Status */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Auditor: <strong className="text-slate-700">{session.creatorName ? session.creatorName.split('(')[0].trim() : 'Auditor Itjen'}</strong></span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Terisolasi Aman</span>
                        </span>
                      </div>
                    </div>

                    {/* Direct 1-Click Action Button */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleFastEntry(session)}
                        disabled={isOpening}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 ${
                          isCurrent
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-[#0b1c3d] hover:bg-blue-950 text-white'
                        }`}
                      >
                        {isOpening ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                            <span>Membuka Kanvas...</span>
                          </>
                        ) : (
                          <>
                            <span>Masuk ke Kanvas Tim Ini</span>
                            <ArrowRight className="w-4 h-4 text-amber-400" />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const url = generateShareUrl(session.sessionId, session.passcode);
                          navigator.clipboard.writeText(url);
                          setCopiedId(session.sessionId);
                          setTimeout(() => setCopiedId(null), 1500);
                        }}
                        className="p-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                        title="Salin tautan langsung untuk anggota tim lain"
                      >
                        {copiedId === session.sessionId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredSessions.length === 0 && (
              <div className="py-12 text-center space-y-3">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Tidak ada tim yang ditemukan.</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Anda dapat membuat tim baru untuk Inspektorat ini melalui menu opsi lanjutan di bawah.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdvanced(true);
                    setAdvancedTab('create');
                    if (activeInspTab !== 'all') {
                      setNewInspektorat(activeInspTab);
                      generateDefaultTeamData(activeInspTab);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Buat Tim Baru Sekarang</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 4. CLEAN COLLAPSIBLE SECONDARY OPTIONS (BUAT TIM BARU / KODE KUSTOM) */}
        <section id="team-settings" className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/70 transition cursor-pointer select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Opsi Tambahan: Buat Tim Baru atau Masuk via Kode Kustom
                </h4>
                <p className="text-[11px] text-slate-500">
                  Untuk mendaftarkan tim pengawasan baru atau memasukkan kode sesi khusus
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span>{showAdvanced ? 'Tutup' : 'Buka Formulir'}</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showAdvanced && (
            <div className="border-t border-slate-200 p-5 sm:p-6 bg-slate-50/50 space-y-5 animate-fadeIn">
              {/* Tab Selector */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <button
                  type="button"
                  onClick={() => setAdvancedTab('create')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    advancedTab === 'create'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Buat Tim Baru</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdvancedTab('connect')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    advancedTab === 'connect'
                      ? 'bg-blue-700 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Hubungkan via Kode & PIN</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdvancedTab('recover')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    advancedTab === 'recover'
                      ? 'bg-amber-700 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Pemulihan PIN (Dalnis)</span>
                </button>
              </div>

              {/* CREATE TAB */}
              {advancedTab === 'create' && (
                <form onSubmit={handleCreateNew} className="max-w-2xl space-y-4">
                  {createError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{createError}</span>
                    </div>
                  )}
                  {createSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{createSuccess}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Inspektorat Penugasan
                      </label>
                      <select
                        value={newInspektorat}
                        onChange={(e) => {
                          const val = e.target.value as InspektoratId;
                          setNewInspektorat(val);
                          generateDefaultTeamData(val);
                        }}
                        className="w-full text-xs font-semibold rounded-xl border border-slate-300 px-3 py-2 bg-white"
                      >
                        {KEMENDAG_INSPEKTORAT_LIST.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.name} ({i.headline.split('&')[0]})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        ID Sesi Kanvas (Unik)
                      </label>
                      <input
                        type="text"
                        value={newId}
                        onChange={(e) => setNewId(e.target.value.toUpperCase())}
                        placeholder="Contoh: ITJEN-1-TIM-08"
                        className="w-full text-xs font-mono font-bold rounded-xl border border-slate-300 px-3 py-2 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Nama Tim Pengawasan
                      </label>
                      <input
                        type="text"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="Nama tim..."
                        className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Template Objek Layanan
                      </label>
                      <select
                        value={newTemplate}
                        onChange={(e) => setNewTemplate(e.target.value)}
                        className="w-full text-xs font-semibold rounded-xl border border-slate-300 px-3 py-2 bg-white"
                      >
                        <option value="perizinan">Persetujuan Impor (INATRADE Daglu)</option>
                        <option value="kependudukan">Surat Tanda Pendaftaran Waralaba (PDN)</option>
                        <option value="bantuan">Fasilitasi Pameran Dagang Ekspor (DJPEN)</option>
                        <option value="pengaduan">Pengaduan Konsumen & SNI (PKTN)</option>
                        <option value="kosong">Layanan Informasi PPID (Setjen)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Buat & Langsung Masuk Kanvas</span>
                    </button>
                  </div>
                </form>
              )}

              {/* CONNECT TAB */}
              {advancedTab === 'connect' && (
                <form onSubmit={handleConnectCustom} className="max-w-md space-y-3">
                  {connectError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{connectError}</span>
                    </div>
                  )}
                  {connectSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{connectSuccess}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">ID Sesi Tim</label>
                    <input
                      type="text"
                      value={connectId}
                      onChange={(e) => setConnectId(e.target.value.toUpperCase())}
                      placeholder="Contoh: ITJEN-1-DAGLU-01"
                      className="w-full text-xs font-mono font-bold rounded-xl border border-slate-300 px-3 py-2 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">PIN / Kode Akses</label>
                    <input
                      type="password"
                      value={connectPin}
                      onChange={(e) => setConnectPin(e.target.value)}
                      placeholder="PIN 4-8 karakter (Default: 123456)"
                      className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3 py-2 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Hubungkan Sesi</span>
                  </button>
                </form>
              )}

              {/* RECOVER TAB */}
              {advancedTab === 'recover' && (
                <form onSubmit={handleRecoverPin} className="max-w-md space-y-3">
                  <p className="text-xs text-slate-600">
                    Gunakan Master Key Pengawasan (<code className="font-mono bg-slate-200 px-1 py-0.5 rounded text-slate-800">ITJEN-PULIH-2025</code>) jika tim lupa kode PIN.
                  </p>

                  {recoveryResult && (
                    <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                      recoveryResult.success ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}>
                      {recoveryResult.success ? <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />}
                      <div>
                        <p className="font-bold">{recoveryResult.message}</p>
                        {recoveryResult.passcode && (
                          <p className="font-mono font-extrabold text-sm mt-1">
                            PIN Ditemukan: {recoveryResult.passcode}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">ID Sesi yang Lupa PIN</label>
                    <input
                      type="text"
                      value={recoveryId}
                      onChange={(e) => setRecoveryId(e.target.value.toUpperCase())}
                      placeholder="Contoh: ITJEN-1-DAGLU-01"
                      className="w-full text-xs font-mono font-bold rounded-xl border border-slate-300 px-3 py-2 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Kunci Pemulihan / Master Key</label>
                    <input
                      type="text"
                      value={recoveryKey}
                      onChange={(e) => setRecoveryKey(e.target.value)}
                      placeholder="ITJEN-PULIH-2025"
                      className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3 py-2 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Pulihkan PIN Sesi</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
