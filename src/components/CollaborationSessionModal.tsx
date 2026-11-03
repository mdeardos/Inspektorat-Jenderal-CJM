import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Lock, 
  Check, 
  Copy, 
  Share2, 
  PlusCircle, 
  ArrowRight, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  Briefcase, 
  ChevronDown, 
  ChevronUp, 
  LogIn, 
  RefreshCw,
  Scale
} from 'lucide-react';
import { CollaborationSessionMeta, EvaluationState, InspektoratId } from '../types';
import { 
  getRegisteredSessions, 
  loadSessionState, 
  saveSessionState, 
  verifySessionAccess, 
  registerNewSession, 
  generateShareUrl,
  KEMENDAG_INSPEKTORAT_LIST
} from '../utils/sessionManager';
import { PRESETS } from '../data/presets';
import { SAMPLE_EVIDENCES } from '../utils/evidenceHelpers';

interface CollaborationSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSessionId: string;
  currentState: EvaluationState;
  onConnectSession: (newSessionId: string, newState: EvaluationState) => void;
  onOpenPortal?: () => void;
}

export const CollaborationSessionModal: React.FC<CollaborationSessionModalProps> = ({
  isOpen,
  onClose,
  currentSessionId,
  currentState,
  onConnectSession,
  onOpenPortal
}) => {
  const [sessions, setSessions] = useState<CollaborationSessionMeta[]>([]);
  const [activeInsp, setActiveInsp] = useState<InspektoratId>('inspektorat_1');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  // Collapsible: Buat Tim Baru
  const [showCreateTeam, setShowCreateTeam] = useState<boolean>(false);
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [newServiceName, setNewServiceName] = useState<string>('');
  const [newAuditorName, setNewAuditorName] = useState<string>('');
  const [createError, setCreateError] = useState<string>('');
  const [createSuccess, setCreateSuccess] = useState<string>('');

  // Collapsible: Hubungkan Kode Manual
  const [showManualCode, setShowManualCode] = useState<boolean>(false);
  const [manualId, setManualId] = useState<string>('');
  const [manualPin, setManualPin] = useState<string>('');
  const [manualError, setManualError] = useState<string>('');
  const [manualSuccess, setManualSuccess] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const list = getRegisteredSessions();
      setSessions(list);
      setNewAuditorName(currentState.auditor || 'Auditor Itjen Kemendag');

      // Auto-select tab matching current session
      const currentMeta = list.find(s => s.sessionId === currentSessionId);
      if (currentMeta?.inspektoratId) {
        setActiveInsp(currentMeta.inspektoratId);
      } else if (currentSessionId?.includes('-1-') || currentSessionId?.includes('DAGLU') || currentSessionId?.includes('PDN')) {
        setActiveInsp('inspektorat_1');
      } else if (currentSessionId?.includes('-2-') || currentSessionId?.includes('DJPEN') || currentSessionId?.includes('PPI')) {
        setActiveInsp('inspektorat_2');
      } else if (currentSessionId?.includes('-3-') || currentSessionId?.includes('PKTN') || currentSessionId?.includes('BAPPEBTI')) {
        setActiveInsp('inspektorat_3');
      } else if (currentSessionId?.includes('-4-') || currentSessionId?.includes('SETJEN') || currentSessionId?.includes('BPSDMP')) {
        setActiveInsp('inspektorat_4');
      }
    }
  }, [isOpen, currentSessionId, currentState.auditor]);

  if (!isOpen) return null;

  // Find active session metadata
  const currentSessionMeta = sessions.find(s => s.sessionId === currentSessionId) || {
    sessionId: currentSessionId || 'ITJEN-1-DAGLU-01',
    passcode: '123456',
    teamName: currentState.auditor || 'Tim Pengawasan Itjen Kemendag',
    unitName: currentState.unit || 'Kementerian Perdagangan RI',
    serviceName: currentState.service || 'Layanan Publik',
    inspektoratName: 'Inspektorat I',
    createdAt: '',
    updatedAt: ''
  };

  // Filter teams under selected Inspektorat
  const activeTeams = sessions.filter((s) => {
    if (s.inspektoratId) return s.inspektoratId === activeInsp;
    if (activeInsp === 'inspektorat_1') return s.sessionId.includes('-1-') || s.sessionId.includes('DAGLU') || s.sessionId.includes('PDN');
    if (activeInsp === 'inspektorat_2') return s.sessionId.includes('-2-') || s.sessionId.includes('DJPEN') || s.sessionId.includes('PPI');
    if (activeInsp === 'inspektorat_3') return s.sessionId.includes('-3-') || s.sessionId.includes('PKTN') || s.sessionId.includes('BAPPEBTI');
    if (activeInsp === 'inspektorat_4') return s.sessionId.includes('-4-') || s.sessionId.includes('SETJEN') || s.sessionId.includes('BPSDMP');
    return false;
  });

  const activeInspDef = KEMENDAG_INSPEKTORAT_LIST.find(i => i.id === activeInsp) || KEMENDAG_INSPEKTORAT_LIST[0];

  // 1-Click Fast Switch Team
  const handleSelectTeam = (team: CollaborationSessionMeta) => {
    setSwitchingId(team.sessionId);

    let loaded = loadSessionState(team.sessionId);
    if (!loaded) {
      if (team.sessionId.includes('DAGLU') || team.sessionId.includes('-1-')) {
        loaded = JSON.parse(JSON.stringify(PRESETS.perizinan));
      } else if (team.sessionId.includes('DJPEN') || team.sessionId.includes('-2-')) {
        loaded = JSON.parse(JSON.stringify(PRESETS.bantuan));
      } else if (team.sessionId.includes('PKTN') || team.sessionId.includes('-3-')) {
        loaded = JSON.parse(JSON.stringify(PRESETS.pengaduan));
      } else if (team.sessionId.includes('PDN')) {
        loaded = JSON.parse(JSON.stringify(PRESETS.kependudukan));
      } else {
        loaded = JSON.parse(JSON.stringify(currentState));
      }
      loaded!.sessionId = team.sessionId;
      loaded!.evidences = [...SAMPLE_EVIDENCES];
      saveSessionState(team.sessionId, loaded!);
    }

    setTimeout(() => {
      onConnectSession(team.sessionId, loaded!);
      onClose();
    }, 200);
  };

  // Copy Direct Share Link for Current Team
  const handleCopyShareLink = (targetId = currentSessionMeta.sessionId, passcode = currentSessionMeta.passcode) => {
    const shareUrl = generateShareUrl(targetId, passcode);
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Create New Team under Active Inspektorat
  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (!newTeamName.trim()) {
      setCreateError('Nama tim evaluasi wajib diisi.');
      return;
    }

    const randomSuffix = Math.floor(10 + Math.random() * 90);
    const roman = activeInspDef.roman;
    const generatedId = `ITJEN-${roman}-TIM-${randomSuffix}`;

    let baseState: EvaluationState;
    if (activeInsp === 'inspektorat_1') {
      baseState = JSON.parse(JSON.stringify(PRESETS.perizinan));
    } else if (activeInsp === 'inspektorat_2') {
      baseState = JSON.parse(JSON.stringify(PRESETS.bantuan));
    } else if (activeInsp === 'inspektorat_3') {
      baseState = JSON.parse(JSON.stringify(PRESETS.pengaduan));
    } else {
      baseState = JSON.parse(JSON.stringify(PRESETS.kosong));
    }

    baseState.sessionId = generatedId;
    baseState.auditor = newAuditorName.trim() || currentState.auditor || 'Auditor Itjen Kemendag';
    if (newServiceName.trim()) {
      baseState.service = newServiceName.trim();
    }
    baseState.evidences = [...SAMPLE_EVIDENCES];

    const reg = registerNewSession(
      generatedId,
      '123456',
      newTeamName.trim(),
      baseState,
      newAuditorName.trim(),
      activeInsp
    );

    if (!reg.success) {
      setCreateError(reg.message);
      return;
    }

    setCreateSuccess(`Tim ${generatedId} berhasil dibuat! Membuka kanvas...`);
    setSessions(getRegisteredSessions());

    setTimeout(() => {
      onConnectSession(generatedId, baseState);
      onClose();
    }, 500);
  };

  // Connect via Custom Code
  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');
    setManualSuccess('');

    if (!manualId.trim()) {
      setManualError('Masukkan ID Sesi.');
      return;
    }

    const auth = verifySessionAccess(manualId, manualPin || '123456');
    if (!auth.success) {
      setManualError(auth.message);
      return;
    }

    let loaded = loadSessionState(manualId);
    if (!loaded) {
      loaded = { ...currentState, sessionId: manualId.toUpperCase() };
      saveSessionState(manualId, loaded);
    }

    setManualSuccess('Sesi terverifikasi! Membuka kanvas...');
    setTimeout(() => {
      onConnectSession(manualId.toUpperCase(), loaded!);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 no-print animate-fadeIn">
      <div 
        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* 1. MODAL HEADER */}
        <div className="bg-gradient-to-r from-[#0b1c3d] via-blue-950 to-[#0b1c3d] px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-white/10 px-2 py-0.5 rounded-md">
                  Permendag No. 6 Tahun 2025
                </span>
                <span className="text-white/60 text-xs hidden sm:inline">· 4 Inspektorat Wilayah</span>
              </div>
              <h2 id="modal-headline" className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
                Pilih Tim Inspektorat & Sesi Kolaborasi
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Tutup Jendela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. ACTIVE SESSION STRIP & SHARE (COLLABORATION MERGE) */}
        <div className="bg-blue-50/70 border-b border-blue-200/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs">
              <span className="text-slate-500 font-medium">Sesi Kanvas Aktif: </span>
              <strong className="font-mono text-[#0b1c3d] bg-white px-2 py-0.5 rounded-md border border-blue-200">
                {currentSessionMeta.sessionId}
              </strong>
              <span className="text-slate-600 font-medium ml-1.5 hidden sm:inline">
                ({currentSessionMeta.teamName})
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleCopyShareLink(currentSessionMeta.sessionId, currentSessionMeta.passcode)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer ${
              copiedLink 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white hover:bg-slate-50 text-blue-950 border border-blue-300'
            }`}
            title="Salin tautan agar rekan tim bisa langsung terhubung tanpa memasukkan PIN"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Tautan Terhubung Tersalin ✓</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-blue-700" />
                <span>Salin Tautan Kolaborasi Tim</span>
              </>
            )}
          </button>
        </div>

        {/* 3. SCROLLABLE CONTENT BODY */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* STEP 1: PILIH 4 INSPEKTORAT (TABS) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-blue-700" />
                <span>Langkah 1: Pilih Inspektorat Wilayah Kerja</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Unit Mitra: <strong>{activeInspDef.auditedScope.split(',')[0]}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {KEMENDAG_INSPEKTORAT_LIST.map((insp) => {
                const isSelected = activeInsp === insp.id;
                const teamCount = sessions.filter(s => 
                  s.inspektoratId === insp.id || s.sessionId.includes(`-${insp.roman}-`)
                ).length;

                return (
                  <button
                    key={insp.id}
                    type="button"
                    onClick={() => setActiveInsp(insp.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#0b1c3d] text-white border-[#0b1c3d] shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`w-7 h-7 rounded-xl font-mono text-xs font-black flex items-center justify-center ${
                        isSelected ? 'bg-amber-400 text-slate-950' : 'bg-white text-blue-900 border border-slate-200'
                      }`}>
                        {insp.roman}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                        isSelected ? 'bg-white/20 text-amber-300' : 'bg-slate-200/80 text-slate-600'
                      }`}>
                        {teamCount} Tim
                      </span>
                    </div>

                    <div className="mt-2">
                      <h4 className="text-xs font-extrabold truncate">{insp.name}</h4>
                      <p className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                        {insp.headline.split('&')[0]}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: DAFTAR TIM DI BAWAH INSPEKTORAT INI */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-700" />
                <span>Langkah 2: Pilih Tim di Bawah {activeInspDef.name}</span>
              </label>
              <span className="text-[11px] text-slate-500">
                1-Klik langsung masuk kanvas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeTeams.map((team) => {
                const isCurrent = team.sessionId === currentSessionId;
                const isSwitching = switchingId === team.sessionId;

                return (
                  <div
                    key={team.sessionId}
                    className={`rounded-2xl border p-3.5 transition flex flex-col justify-between gap-3 ${
                      isCurrent
                        ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-500/20 shadow-2xs'
                        : 'bg-white hover:bg-slate-50/70 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-extrabold text-[#0b1c3d] bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded-md">
                          {team.sessionId}
                        </span>
                        {isCurrent ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">
                            PIN: {team.passcode}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {team.teamName}
                      </h4>

                      <p className="text-[11px] font-semibold text-blue-900/90 line-clamp-1 flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-blue-700 shrink-0" />
                        <span>{team.serviceName || 'Layanan Publik Kemendag'}</span>
                      </p>

                      <p className="text-[10px] text-slate-500 line-clamp-1 font-mono">
                        Auditi: {team.unitName || activeInspDef.auditedScope.split(',')[0]}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectTeam(team)}
                        disabled={isSwitching}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-98 ${
                          isCurrent
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-[#0b1c3d] hover:bg-blue-950 text-white'
                        }`}
                      >
                        {isSwitching ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin text-amber-300" />
                            <span>Membuka...</span>
                          </>
                        ) : isCurrent ? (
                          <>
                            <span>Tetap di Tim Ini</span>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                          </>
                        ) : (
                          <>
                            <span>Masuk Kanvas Tim Ini</span>
                            <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyShareLink(team.sessionId, team.passcode)}
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                        title="Salin tautan kolaborasi tim ini"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. MERGED SECONDARY ACTIONS (TAMBAH TIM BARU & KONEKSI MANUAL) */}
          <div className="pt-2 border-t border-slate-200/90 space-y-3">
            {/* TOGGLE BUAT TIM BARU */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/50">
              <button
                type="button"
                onClick={() => {
                  setShowCreateTeam(!showCreateTeam);
                  if (showManualCode) setShowManualCode(false);
                }}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-100/70 transition cursor-pointer select-none text-xs font-bold text-slate-800"
              >
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <span>+ Tambah Tim Pengawasan Baru di {activeInspDef.name}</span>
                </div>
                {showCreateTeam ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showCreateTeam && (
                <form onSubmit={handleCreateTeamSubmit} className="p-4 border-t border-slate-200 bg-white space-y-3">
                  {createError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{createError}</span>
                    </div>
                  )}
                  {createSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{createSuccess}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">Nama Tim Pengawasan</label>
                      <input
                        type="text"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="Contoh: Tim Audit Evaluasi Minyakita"
                        className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">Objek Layanan Publik</label>
                      <input
                        type="text"
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        placeholder="Contoh: Pengawasan Distribusi Bapokting"
                        className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Buat & Masuk Tim</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* TOGGLE KONEKSI KODE MANUAL */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/50">
              <button
                type="button"
                onClick={() => {
                  setShowManualCode(!showManualCode);
                  if (showCreateTeam) setShowCreateTeam(false);
                }}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-100/70 transition cursor-pointer select-none text-xs font-semibold text-slate-700"
              >
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4 text-blue-700" />
                  <span>Punya ID Sesi / Kode Khusus dari Rekan? Masuk di Sini</span>
                </div>
                {showManualCode ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showManualCode && (
                <form onSubmit={handleManualCodeSubmit} className="p-4 border-t border-slate-200 bg-white space-y-3">
                  {manualError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{manualError}</span>
                    </div>
                  )}
                  {manualSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{manualSuccess}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">ID Sesi Tim</label>
                      <input
                        type="text"
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value.toUpperCase())}
                        placeholder="Contoh: ITJEN-1-DAGLU-01"
                        className="w-full text-xs font-mono font-bold rounded-xl border border-slate-300 px-3 py-2 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">Kode PIN (Default: 123456)</label>
                      <input
                        type="password"
                        value={manualPin}
                        onChange={(e) => setManualPin(e.target.value)}
                        placeholder="123456"
                        className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3 py-2 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Verifikasi & Masuk</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* 5. FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Data setiap tim terisolasi secara aman di penyimpanan browser lokal.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
