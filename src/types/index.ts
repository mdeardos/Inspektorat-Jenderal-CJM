export type ServiceModelId = 'guardian' | 'performance' | 'activator' | 'funder' | 'yield';

export interface ServiceModel {
  id: ServiceModelId;
  name: string;
  category: string;
  roleIndo: string; // Peran ringkas unit layanan
  shortDefinition: string; // Pengertian singkat ramah evaluator (Bahasa Indonesia)
  desc: string; // Deskripsi operasional pelayanan publik
  focus: string; // Titik fokus evaluasi beban administratif
  examples: string; // Contoh konkret di lingkungan Kementerian Perdagangan
  subModels: string[]; // Varian jenis layanan terkait
  keyBurdenRisk: string; // Risiko beban administratif utama
  citation?: string; // Rujukan literatur
}

export interface StageItem {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  action: string;
  touchpoint: string;
  response: string;
  burden: string;
  learning: boolean; // Beban Informasi
  compliance: boolean; // Beban Kepatuhan
  psychological: boolean; // Beban Psikologis
  emotion: number; // -2 to 2
  opportunity: string;
}

export interface CoDesignPlan {
  discovery: string;
  ideation: string;
  prototype: string;
}

export type EvidenceCategory =
  | 'screenshot_sistem' // Tangkapan Layar Portal / Sistem Daring (INATRADE, SINSW, OSS, SIMBARA, dll.)
  | 'dokumen_fisik'    // Berkas Fisik / Formulir Manual / Surat Keterangan / Duplikasi Dokumen
  | 'foto_antrean'     // Antrean Fisik / Loket Pelayanan Tatap Muka
  | 'regulasi_sop'     // Regulasi, Peraturan Menteri, atau SOP yang Tidak Sinkron
  | 'rekaman_audio'    // Transkrip Wawancara / Rekaman Telepon / Hotline
  | 'lainnya';         // Lainnya

export type EvidenceSeverity = 'kritis' | 'sedang' | 'ringan';

export interface AuditEvidence {
  id: string;
  stageId: string; // ID tahap terkait (misal 'stage-1') atau 'all' (temuan umum lintas tahapan)
  stageCode?: string; // e.g. "Tahap 3"
  stageName?: string; // e.g. "Verifikasi Dokumen Teknis"
  title: string; // Judul Temuan Bukti
  category: EvidenceCategory;
  description: string; // Catatan Fakta Temuan Lapangan
  locationOrSource?: string; // Lokasi / Sistem (misal: "Portal INATRADE v2.4 / Loket Layanan")
  severity: EvidenceSeverity; // Tingkat Dampak terhadap Warga/Pelaku Usaha
  dateRecorded: string; // Tanggal & Waktu Pencatatan (YYYY-MM-DD atau format tanggal Indonesia)
  auditorName?: string; // Nama Auditor / Pemeriksa
  imageUrl?: string; // Data URL foto/tangkapan layar base64 atau URL
  imageCaption?: string; // Keterangan Gambar
  referenceDoc?: string; // Nomor Regulasi / SOP rujukan (misal: "Permendag No. 36/2023")
}

export interface SignatoryInfo {
  approverTitle: string; // Jabatan Pihak yang Mengetahui & Menyetujui
  approverName: string;  // Nama Lengkap & Gelar Pihak yang Mengetahui
  approverNip: string;   // NIP Pihak yang Mengetahui
  evaluatorTitle: string; // Jabatan Pengendali Teknis / Tim Evaluator
  evaluatorName: string;  // Nama Lengkap & Gelar Pengendali Teknis / Evaluator
  evaluatorNip: string;   // NIP Pengendali Teknis / Evaluator
  locationDate?: string;  // Tempat & Tanggal Penetapan (e.g. Jakarta, 30 Juni 2025)
}

export interface EvaluationState {
  sessionId?: string; // ID Sesi Kolaborasi / Kode Proyek Unik (misal: "ITJEN-DAGLU-2025-01")
  unit: string;
  service: string;
  auditor: string;
  period: string;
  modelId: ServiceModelId;
  personaName: string;
  personaRole: string;
  personaLiteracy: string;
  personaGoal: string;
  stages: StageItem[];
  coDesign: CoDesignPlan;
  evidences?: AuditEvidence[]; // Pelacak Bukti Lapangan Inspektorat Jenderal
  signatory?: SignatoryInfo; // Pejabat Penandatangan Lembar Pengesahan
  updatedAt?: string;
}

export type ViewMode = 'grid' | 'panorama' | 'table';

export type InspektoratId = 'inspektorat_1' | 'inspektorat_2' | 'inspektorat_3' | 'inspektorat_4';

export interface CollaborationSessionMeta {
  sessionId: string;
  passcode: string; // PIN atau Kode Verifikasi Sesi
  teamName: string; // Nama Tim / Auditor (misal: "Tim Evaluator Daglu 1")
  inspektoratId?: InspektoratId;
  inspektoratName?: string; // misal: "Inspektorat I"
  unitName?: string;
  serviceName?: string;
  createdAt: string;
  updatedAt: string;
  creatorName?: string;
}

export interface SessionVerificationResult {
  success: boolean;
  message: string;
  session?: CollaborationSessionMeta;
}

