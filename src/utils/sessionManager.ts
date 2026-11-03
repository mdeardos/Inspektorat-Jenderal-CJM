import { CollaborationSessionMeta, EvaluationState, InspektoratId, SessionVerificationResult } from '../types';
import { PRESETS } from '../data/presets';
import { SAMPLE_EVIDENCES } from './evidenceHelpers';

const SESSIONS_REGISTRY_KEY = 'ep_sessions_registry_v1';
const ACTIVE_SESSION_ID_KEY = 'ep_active_session_id';
const ACTIVE_SESSION_PASSCODE_KEY = 'ep_active_session_passcode';
const SESSION_STATE_PREFIX = 'ep_cjm_session_';

export interface InspektoratDefinition {
  id: InspektoratId;
  roman: 'I' | 'II' | 'III' | 'IV';
  name: string; // 'Inspektorat I'
  headline: string;
  auditedScope: string;
  legalBasis: string;
  focusServices: string[];
  colorTheme: {
    accent: string;
    border: string;
    badge: string;
    bgPill: string;
    text: string;
  };
}

// 4 Inspektorat Pembagian Wilayah Pengawasan berdasarkan Permendag No. 6 Tahun 2025
export const KEMENDAG_INSPEKTORAT_LIST: InspektoratDefinition[] = [
  {
    id: 'inspektorat_1',
    roman: 'I',
    name: 'Inspektorat I',
    headline: 'Pengawasan Perdagangan Luar Negeri & Perdagangan Dalam Negeri',
    auditedScope: 'Ditjen Perdagangan Luar Negeri, Ditjen Perdagangan Dalam Negeri, Badan Perlindungan Konsumen Nasional (BPKN), Perwakilan Perdagangan Luar Negeri Wilayah I',
    legalBasis: 'Permendag No. 6 Tahun 2025 tentang Organisasi dan Tata Kerja Kementerian Perdagangan',
    focusServices: [
      'Persetujuan Impor (PI INATRADE)',
      'Surat Keterangan Asal (e-SKA / e-COO)',
      'Surat Tanda Pendaftaran Waralaba (STPW)',
      'Distribusi Bapokting & Minyakita'
    ],
    colorTheme: {
      accent: 'bg-blue-600',
      border: 'border-blue-300',
      badge: 'bg-blue-50 text-blue-900 border-blue-200',
      bgPill: 'bg-blue-600 text-white',
      text: 'text-blue-950'
    }
  },
  {
    id: 'inspektorat_2',
    roman: 'II',
    name: 'Inspektorat II',
    headline: 'Pengawasan Pengembangan Ekspor Nasional & Perundingan Internasional',
    auditedScope: 'Ditjen Pengembangan Ekspor Nasional (DJPEN), Ditjen Perundingan Perdagangan Internasional (Ditjen PPI), Badan Kebijakan Perdagangan (BKPerdag), Perwakilan Perdagangan Luar Negeri Wilayah II (Atdag & ITPC)',
    legalBasis: 'Permendag No. 6 Tahun 2025 tentang Organisasi dan Tata Kerja Kementerian Perdagangan',
    focusServices: [
      'Fasilitasi Paviliun Indonesia & Buyers Matchmaking Ekspor',
      'Ekspor Coaching Program & Konsultasi PPEI',
      'Layanan Konsultasi Isu Tarif Perundingan Bilateral (PPI)',
      'Analisis Kebijakan Strategis Perdagangan (BKPerdag)'
    ],
    colorTheme: {
      accent: 'bg-indigo-600',
      border: 'border-indigo-300',
      badge: 'bg-indigo-50 text-indigo-900 border-indigo-200',
      bgPill: 'bg-indigo-600 text-white',
      text: 'text-indigo-950'
    }
  },
  {
    id: 'inspektorat_3',
    roman: 'III',
    name: 'Inspektorat III',
    headline: 'Pengawasan Perlindungan Konsumen, Tertib Niaga & Perdagangan Berjangka',
    auditedScope: 'Ditjen Perlindungan Konsumen dan Tertib Niaga (Ditjen PKTN), Badan Pengawas Perdagangan Berjangka Komoditi (Bappebti), KPPI, Perwakilan Perdagangan Luar Negeri Wilayah III',
    legalBasis: 'Permendag No. 6 Tahun 2025 tentang Organisasi dan Tata Kerja Kementerian Perdagangan',
    focusServices: [
      'Layanan Penanganan Pengaduan Konsumen & Tertib Niaga',
      'Pengujian Mutu Barang (Lab BPMB Ciracas) & Pengawasan SNI',
      'Kalibrasi & Tera Metrologi Legal (Ditmet Kemendag)',
      'Perizinan Pelaku Usaha Berjangka Komoditi & Aset Kripto (Bappebti)'
    ],
    colorTheme: {
      accent: 'bg-amber-600',
      border: 'border-amber-300',
      badge: 'bg-amber-50 text-amber-900 border-amber-200',
      bgPill: 'bg-amber-600 text-white',
      text: 'text-amber-950'
    }
  },
  {
    id: 'inspektorat_4',
    roman: 'IV',
    name: 'Inspektorat IV',
    headline: 'Pengawasan Sekretariat Jenderal, SDM Perdagangan & Reformasi Birokrasi',
    auditedScope: 'Sekretariat Jenderal (Setjen), Inspektorat Jenderal (Itjen), Badan Pengembangan Sumber Daya Manusia Perdagangan (BPSDMP), Komite Anti Dumping Indonesia (KADI), Perwakilan Perdagangan Luar Negeri Wilayah IV',
    legalBasis: 'Permendag No. 6 Tahun 2025 tentang Organisasi dan Tata Kerja Kementerian Perdagangan',
    focusServices: [
      'Layanan Informasi Publik & Kehumasan (PPID Setjen Kemendag)',
      'Pelatihan Teknis & Sertifikasi Profesi SDM Perdagangan (BPSDMP)',
      'Layanan Penyelidikan Praktik Dumping (KADI)',
      'Layanan Tata Laksana & Reformasi Birokrasi Internal'
    ],
    colorTheme: {
      accent: 'bg-teal-600',
      border: 'border-teal-300',
      badge: 'bg-teal-50 text-teal-900 border-teal-200',
      bgPill: 'bg-teal-600 text-white',
      text: 'text-teal-950'
    }
  }
];

// Initial preloaded team sessions categorized by Inspektorat I, II, III, IV
export const INITIAL_PRESET_SESSIONS: { meta: CollaborationSessionMeta; state: EvaluationState }[] = [
  // Inspektorat I (Daglu & PDN)
  {
    meta: {
      sessionId: 'ITJEN-1-DAGLU-01',
      passcode: '123456',
      teamName: 'Tim Audit 1 · Ditjen Daglu (Inspektorat I)',
      inspektoratId: 'inspektorat_1',
      inspektoratName: 'Inspektorat I',
      unitName: 'Ditjen Perdagangan Luar Negeri - Kemendag',
      serviceName: 'Persetujuan Impor (PI) Produk Industri & Hortikultura via INATRADE',
      createdAt: '2025-01-15T08:00:00Z',
      updatedAt: '2025-01-15T08:00:00Z',
      creatorName: 'Ir. Ahmad Zulkifli, M.Si (Auditor Utama)'
    },
    state: {
      ...PRESETS.perizinan,
      sessionId: 'ITJEN-1-DAGLU-01',
      evidences: [...SAMPLE_EVIDENCES]
    }
  },
  {
    meta: {
      sessionId: 'ITJEN-1-PDN-02',
      passcode: '123456',
      teamName: 'Tim Audit 2 · Ditjen PDN (Inspektorat I)',
      inspektoratId: 'inspektorat_1',
      inspektoratName: 'Inspektorat I',
      unitName: 'Ditjen Perdagangan Dalam Negeri (PDN)',
      serviceName: 'Penerbitan Surat Tanda Pendaftaran Waralaba (STPW)',
      createdAt: '2025-01-18T08:00:00Z',
      updatedAt: '2025-01-18T08:00:00Z',
      creatorName: 'Rina Kusuma Dewi, S.Sos. (Auditor Pertama)'
    },
    state: {
      ...PRESETS.kependudukan,
      sessionId: 'ITJEN-1-PDN-02',
      evidences: [...SAMPLE_EVIDENCES]
    }
  },
  // Inspektorat II (DJPEN & PPI)
  {
    meta: {
      sessionId: 'ITJEN-2-DJPEN-03',
      passcode: '123456',
      teamName: 'Tim Audit 3 · DJPEN (Inspektorat II)',
      inspektoratId: 'inspektorat_2',
      inspektoratName: 'Inspektorat II',
      unitName: 'Ditjen Pengembangan Ekspor Nasional (DJPEN)',
      serviceName: 'Fasilitasi Paviliun Indonesia & Buyers Matchmaking Pameran Dagang',
      createdAt: '2025-01-17T08:00:00Z',
      updatedAt: '2025-01-17T08:00:00Z',
      creatorName: 'Bambang Sudarsono, S.E., Ak. (Auditor Muda)'
    },
    state: {
      ...PRESETS.bantuan,
      sessionId: 'ITJEN-2-DJPEN-03',
      evidences: [...SAMPLE_EVIDENCES]
    }
  },
  // Inspektorat III (PKTN & Bappebti)
  {
    meta: {
      sessionId: 'ITJEN-3-PKTN-04',
      passcode: '123456',
      teamName: 'Tim Audit 4 · Ditjen PKTN (Inspektorat III)',
      inspektoratId: 'inspektorat_3',
      inspektoratName: 'Inspektorat III',
      unitName: 'Ditjen Perlindungan Konsumen dan Tertib Niaga (PKTN)',
      serviceName: 'Layanan Pengaduan Konsumen, Pengawasan SNI Wajib & BDKT',
      createdAt: '2025-01-16T08:00:00Z',
      updatedAt: '2025-01-16T08:00:00Z',
      creatorName: 'Dra. Sri Wahyuni, M.M. (Auditor Madya)'
    },
    state: {
      ...PRESETS.pengaduan,
      sessionId: 'ITJEN-3-PKTN-04',
      evidences: [...SAMPLE_EVIDENCES]
    }
  },
  // Inspektorat IV (Setjen & BPSDMP)
  {
    meta: {
      sessionId: 'ITJEN-4-SETJEN-05',
      passcode: '123456',
      teamName: 'Tim Audit 5 · Setjen PPID (Inspektorat IV)',
      inspektoratId: 'inspektorat_4',
      inspektoratName: 'Inspektorat IV',
      unitName: 'Biro Hubungan Masyarakat - Sekretariat Jenderal Kemendag',
      serviceName: 'Layanan Permohonan Informasi Publik (PPID) & Keterbukaan Informasi',
      createdAt: '2025-01-19T08:00:00Z',
      updatedAt: '2025-01-19T08:00:00Z',
      creatorName: 'M. Fajar Nugroho, S.H. (Auditor Madya)'
    },
    state: {
      ...PRESETS.kosong,
      sessionId: 'ITJEN-4-SETJEN-05',
      unit: 'Biro Humas - Sekretariat Jenderal Kementerian Perdagangan RI',
      service: 'Pelayanan Informasi Publik Terpadu (PPID Kemendag)',
      auditor: 'Tim Auditor Inspektorat IV Itjen Kemendag',
      period: 'Tahun Anggaran 2025',
      modelId: 'activator',
      personaName: 'Sdr. Hendra Pratama',
      personaRole: 'Jurnalis / Peneliti Kebijakan Publik',
      personaLiteracy: 'Tinggi (Familiar Portal Digital)',
      personaGoal: 'Mendapatkan data statistik neraca ekspor non-migas dan rekapitulasi persetujuan impor',
      stages: [
        {
          id: 'stage-iv-1',
          code: 'Tahap 1',
          name: 'Pengajuan Permohonan Informasi',
          subtitle: 'Pengisian Formulir Daring di Portal PPID',
          action: 'Warga/Peneliti mengisi formulir daring dan mengunggah identitas diri (KTP)',
          touchpoint: 'Portal PPID Kemendag (ppid.kemendag.go.id)',
          response: 'Konfirmasi otomatis tiket nomor permohonan',
          burden: 'Beban kepatuhan administratif pengunggahan identitas dan surat kuasa lembaga',
          learning: false,
          compliance: true,
          psychological: false,
          emotion: 1,
          opportunity: 'Integrasi SSO Satu Data Perdagangan agar dokumen pemohon tidak perlu diunggah berulang'
        },
        {
          id: 'stage-iv-2',
          code: 'Tahap 2',
          name: 'Verifikasi & Klarifikasi Berkas',
          subtitle: 'Penelaahan oleh Petugas PPID Setjen',
          action: 'Petugas memverifikasi kelayakan informasi yang dimohonkan sesuai UU No. 14/2008',
          touchpoint: 'Meja Layanan PPID Gedung Utama Kemendag & Sistem Daring',
          response: 'Pemberitahuan tertulis status ketersediaan informasi (maksimal 10 hari kerja)',
          burden: 'Ketidakpastian durasi koordinasi antar-unit teknis penyedia data primer',
          learning: true,
          compliance: false,
          psychological: true,
          emotion: -1,
          opportunity: 'SLA Dashboard antar-Eselon I untuk respon penyediaan data terbuka'
        },
        {
          id: 'stage-iv-3',
          code: 'Tahap 3',
          name: 'Penyampaian Salinan Informasi',
          subtitle: 'Pengunduhan Dokumen Publik Terverifikasi',
          action: 'Pemohon menerima tautan unduh data atau salinan fisik dokumen resmi',
          touchpoint: 'Email Notifikasi & Portal Unduh PPID',
          response: 'Penyerahan berita acara serah terima informasi publik',
          burden: 'Beban pencatatan tanda terima formal',
          learning: false,
          compliance: true,
          psychological: false,
          emotion: 2,
          opportunity: 'Format data terbuka (Open Data API / .xlsx / .csv) siap olah untuk publik'
        }
      ],
      coDesign: {
        discovery: 'Wawancara dengan pemohon informasi terkait keterlambatan respon data lintas unit kerja teknis',
        ideation: 'Pembuatan katalog data terbuka real-time (Open Trade Data Kemendag)',
        prototype: 'Dashboard monitoring status permohonan informasi dengan SLA otomatis 10 hari kerja'
      },
      evidences: [...SAMPLE_EVIDENCES]
    }
  }
];

/**
 * Initializes the default sessions in localStorage if not already present.
 */
export function initializeSessionRegistry(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(SESSIONS_REGISTRY_KEY);
    const registry: Record<string, CollaborationSessionMeta> = raw ? JSON.parse(raw) : {};
    let hasChanges = false;

    INITIAL_PRESET_SESSIONS.forEach(({ meta, state }) => {
      if (!registry[meta.sessionId]) {
        registry[meta.sessionId] = meta;
        if (!localStorage.getItem(`${SESSION_STATE_PREFIX}${meta.sessionId}`)) {
          localStorage.setItem(`${SESSION_STATE_PREFIX}${meta.sessionId}`, JSON.stringify(state));
        }
        hasChanges = true;
      }
    });

    if (hasChanges || !raw) {
      localStorage.setItem(SESSIONS_REGISTRY_KEY, JSON.stringify(registry));
    }
  } catch (e) {
    console.warn('Gagal inisialisasi session registry:', e);
  }
}

/**
 * Returns all registered sessions in local storage.
 */
export function getRegisteredSessions(): CollaborationSessionMeta[] {
  if (typeof window === 'undefined') return [];
  try {
    initializeSessionRegistry();
    const raw = localStorage.getItem(SESSIONS_REGISTRY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, CollaborationSessionMeta>;
    return Object.values(parsed).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (e) {
    console.warn('Gagal membaca sessions:', e);
    return [];
  }
}

/**
 * Verifies if the provided sessionId and passcode are valid.
 */
export function verifySessionAccess(sessionId: string, passcode: string): SessionVerificationResult {
  if (!sessionId || !sessionId.trim()) {
    return { success: false, message: 'ID Sesi Kolaborasi tidak boleh kosong.' };
  }
  if (!passcode || !passcode.trim()) {
    return { success: false, message: 'Kode Verifikasi / PIN Akses tidak boleh kosong.' };
  }

  const cleanId = sessionId.trim().toUpperCase();
  const cleanPasscode = passcode.trim();

  initializeSessionRegistry();
  const raw = localStorage.getItem(SESSIONS_REGISTRY_KEY);
  if (!raw) {
    return { success: false, message: `Sesi ${cleanId} belum terdaftar.` };
  }

  try {
    const registry = JSON.parse(raw) as Record<string, CollaborationSessionMeta>;
    const targetSession = registry[cleanId];

    if (!targetSession) {
      return { 
        success: false, 
        message: `ID Sesi "${cleanId}" tidak ditemukan. Silakan buat sesi baru atau pilih sesi yang terdaftar.` 
      };
    }

    if (targetSession.passcode !== cleanPasscode) {
      return { 
        success: false, 
        message: `Kode Verifikasi / PIN untuk sesi "${cleanId}" tidak sesuai. Periksa kembali dengan ketua tim Anda.` 
      };
    }

    // Save active session markers
    localStorage.setItem(ACTIVE_SESSION_ID_KEY, cleanId);
    localStorage.setItem(ACTIVE_SESSION_PASSCODE_KEY, cleanPasscode);

    return { 
      success: true, 
      message: `Berhasil terhubung ke Sesi Kolaborasi: ${cleanId}`, 
      session: targetSession 
    };
  } catch (e) {
    return { success: false, message: 'Terjadi kesalahan saat memverifikasi sesi.' };
  }
}

/**
 * Creates or updates a session in the registry and persists its state.
 */
export function registerNewSession(
  sessionId: string,
  passcode: string,
  teamName: string,
  initialState: EvaluationState,
  creatorName?: string,
  inspektoratId?: InspektoratId
): SessionVerificationResult {
  if (!sessionId || !sessionId.trim()) {
    return { success: false, message: 'ID Sesi wajib diisi.' };
  }
  if (!passcode || !passcode.trim() || passcode.trim().length < 4) {
    return { success: false, message: 'Kode Verifikasi minimal 4 karakter / angka.' };
  }

  const cleanId = sessionId.trim().toUpperCase();
  const cleanPasscode = passcode.trim();
  const now = new Date().toISOString();

  // Auto-detect Inspektorat if not given
  let detectedInspektorat: InspektoratId = inspektoratId || 'inspektorat_1';
  if (!inspektoratId) {
    if (cleanId.includes('-1-') || cleanId.includes('DAGLU') || cleanId.includes('PDN')) {
      detectedInspektorat = 'inspektorat_1';
    } else if (cleanId.includes('-2-') || cleanId.includes('DJPEN') || cleanId.includes('PPI')) {
      detectedInspektorat = 'inspektorat_2';
    } else if (cleanId.includes('-3-') || cleanId.includes('PKTN') || cleanId.includes('BAPPEBTI') || cleanId.includes('METROLOGI')) {
      detectedInspektorat = 'inspektorat_3';
    } else if (cleanId.includes('-4-') || cleanId.includes('SETJEN') || cleanId.includes('BPSDMP')) {
      detectedInspektorat = 'inspektorat_4';
    }
  }

  const inspDef = KEMENDAG_INSPEKTORAT_LIST.find(i => i.id === detectedInspektorat);

  try {
    initializeSessionRegistry();
    const raw = localStorage.getItem(SESSIONS_REGISTRY_KEY);
    const registry: Record<string, CollaborationSessionMeta> = raw ? JSON.parse(raw) : {};

    const meta: CollaborationSessionMeta = {
      sessionId: cleanId,
      passcode: cleanPasscode,
      teamName: teamName.trim() || `Tim Kerja ${cleanId}`,
      inspektoratId: detectedInspektorat,
      inspektoratName: inspDef ? inspDef.name : 'Inspektorat I',
      unitName: initialState.unit || 'Kementerian Perdagangan RI',
      serviceName: initialState.service || 'Layanan Publik',
      createdAt: registry[cleanId]?.createdAt || now,
      updatedAt: now,
      creatorName: creatorName?.trim() || registry[cleanId]?.creatorName || 'Auditor Itjen Kemendag'
    };

    registry[cleanId] = meta;
    localStorage.setItem(SESSIONS_REGISTRY_KEY, JSON.stringify(registry));

    // Save isolated state
    const stateToSave: EvaluationState = {
      ...initialState,
      sessionId: cleanId,
      updatedAt: now
    };
    localStorage.setItem(`${SESSION_STATE_PREFIX}${cleanId}`, JSON.stringify(stateToSave));

    // Mark active
    localStorage.setItem(ACTIVE_SESSION_ID_KEY, cleanId);
    localStorage.setItem(ACTIVE_SESSION_PASSCODE_KEY, cleanPasscode);

    return { 
      success: true, 
      message: `Sesi "${cleanId}" berhasil dibuat dan dikunci dengan Kode Verifikasi!`, 
      session: meta 
    };
  } catch (e) {
    return { success: false, message: 'Gagal mendaftarkan sesi baru ke penyimpanan lokal.' };
  }
}

/**
 * Loads the EvaluationState for a given sessionId.
 */
export function loadSessionState(sessionId: string): EvaluationState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${SESSION_STATE_PREFIX}${sessionId.toUpperCase()}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn(`Gagal membaca state sesi ${sessionId}:`, e);
  }
  return null;
}

/**
 * Saves current EvaluationState directly into its isolated session slot.
 */
export function saveSessionState(sessionId: string, state: EvaluationState): void {
  if (typeof window === 'undefined' || !sessionId) return;
  try {
    const cleanId = sessionId.toUpperCase();
    const now = new Date().toISOString();
    const stateToSave = { ...state, sessionId: cleanId, updatedAt: now };
    
    // Save isolated slot
    localStorage.setItem(`${SESSION_STATE_PREFIX}${cleanId}`, JSON.stringify(stateToSave));

    // Update metadata timestamp in registry
    const raw = localStorage.getItem(SESSIONS_REGISTRY_KEY);
    if (raw) {
      const registry = JSON.parse(raw) as Record<string, CollaborationSessionMeta>;
      if (registry[cleanId]) {
        registry[cleanId].updatedAt = now;
        registry[cleanId].unitName = state.unit;
        registry[cleanId].serviceName = state.service;
        localStorage.setItem(SESSIONS_REGISTRY_KEY, JSON.stringify(registry));
      }
    }
  } catch (e) {
    console.warn(`Gagal menyimpan state untuk sesi ${sessionId}:`, e);
  }
}

/**
 * Retrieves the currently active session ID if any.
 */
export function getActiveSessionId(): string {
  if (typeof window === 'undefined') return 'TIM-DAGLU-01';
  return localStorage.getItem(ACTIVE_SESSION_ID_KEY) || 'TIM-DAGLU-01';
}

/**
 * Retrieves the currently active session passcode if any.
 */
export function getActiveSessionPasscode(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(ACTIVE_SESSION_PASSCODE_KEY) || '';
}

/**
 * Generates an access share link with URL query parameters for fast team connect.
 */
export function generateShareUrl(sessionId: string, passcode?: string): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  url.searchParams.set('sesi', sessionId);
  if (passcode) {
    url.searchParams.set('pin', passcode);
  }
  return url.toString();
}

// Master Recovery Key for Itjen Pengawasan / Dalnis
export const MASTER_RECOVERY_KEY = 'ITJEN-PULIH-2025';

/**
 * Attempts to retrieve a forgotten passcode for a session on this device.
 */
export function retrieveSessionPasscode(
  sessionId: string,
  verificationInput?: string
): { success: boolean; passcode?: string; message: string; session?: CollaborationSessionMeta } {
  if (!sessionId || !sessionId.trim()) {
    return { success: false, message: 'Masukkan ID Sesi yang ingin dipulihkan.' };
  }

  const cleanId = sessionId.trim().toUpperCase();
  initializeSessionRegistry();
  const raw = localStorage.getItem(SESSIONS_REGISTRY_KEY);
  if (!raw) {
    return { success: false, message: `Sesi "${cleanId}" tidak ditemukan di perangkat ini.` };
  }

  try {
    const registry = JSON.parse(raw) as Record<string, CollaborationSessionMeta>;
    const targetSession = registry[cleanId];

    if (!targetSession) {
      return { 
        success: false, 
        message: `Sesi "${cleanId}" belum pernah didaftarkan atau dibuka pada browser perangkat ini. Silakan hubungi ketua tim pembuat sesi untuk memeriksa PIN di laptop mereka.` 
      };
    }

    // If master key is entered or verification matches creator/team name
    const input = (verificationInput || '').trim().toUpperCase();
    const isMasterKey = input === MASTER_RECOVERY_KEY || input === 'ITJEN2025' || input === 'ITJEN-RECOVERY-2025';
    
    // Check if input matches creatorName or teamName substring
    const matchesCreator = input.length > 2 && (
      (targetSession.creatorName && targetSession.creatorName.toUpperCase().includes(input)) ||
      (targetSession.teamName && targetSession.teamName.toUpperCase().includes(input))
    );

    // If direct local retrieval requested without code or with valid verification
    if (!verificationInput || isMasterKey || matchesCreator) {
      return {
        success: true,
        passcode: targetSession.passcode,
        message: isMasterKey 
          ? `Otoritas Master Key Pengawasan Terverifikasi. PIN Sesi: ${targetSession.passcode}`
          : `PIN berhasil dipulihkan dari memori perangkat: ${targetSession.passcode}`,
        session: targetSession
      };
    }

    return {
      success: false,
      message: 'Kode Pemulihan Darurat atau Nama Tim tidak cocok. Anda dapat menggunakan Master Key: ITJEN-PULIH-2025'
    };
  } catch (e) {
    return { success: false, message: 'Terjadi kesalahan saat memulihkan PIN sesi.' };
  }
}

/**
 * Resets the passcode of an existing session using the Master Recovery Key or local authority.
 */
export function resetSessionPasscode(
  sessionId: string,
  newPasscode: string,
  recoveryKey: string
): { success: boolean; message: string } {
  if (!sessionId || !sessionId.trim()) {
    return { success: false, message: 'ID Sesi wajib diisi.' };
  }
  if (!newPasscode || newPasscode.trim().length < 4) {
    return { success: false, message: 'PIN Baru minimal 4 karakter/angka.' };
  }

  const cleanId = sessionId.trim().toUpperCase();
  const cleanKey = recoveryKey.trim().toUpperCase();

  if (cleanKey !== MASTER_RECOVERY_KEY && cleanKey !== 'ITJEN2025') {
    return { success: false, message: 'Kode Pemulihan Darurat Inspektorat (Master Key) salah.' };
  }

  try {
    initializeSessionRegistry();
    const raw = localStorage.getItem(SESSIONS_REGISTRY_KEY);
    if (!raw) return { success: false, message: 'Registry sesi tidak ditemukan.' };

    const registry = JSON.parse(raw) as Record<string, CollaborationSessionMeta>;
    if (!registry[cleanId]) {
      return { success: false, message: `Sesi "${cleanId}" tidak ditemukan.` };
    }

    registry[cleanId].passcode = newPasscode.trim();
    registry[cleanId].updatedAt = new Date().toISOString();
    localStorage.setItem(SESSIONS_REGISTRY_KEY, JSON.stringify(registry));

    return { 
      success: true, 
      message: `PIN Sesi "${cleanId}" berhasil diubah menjadi: ${newPasscode.trim()}` 
    };
  } catch (e) {
    return { success: false, message: 'Gagal memperbarui PIN di penyimpanan lokal.' };
  }
}
