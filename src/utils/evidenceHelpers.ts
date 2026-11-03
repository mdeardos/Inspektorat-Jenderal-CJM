import { AuditEvidence, EvidenceCategory, EvidenceSeverity } from '../types';

/**
 * Client-side image compression utility
 * Resizes images to max 1200px width/height and compresses to JPEG ~0.8 quality
 * Ensures state stays compact and localStorage is never bloated.
 */
export async function compressImageFile(file: File, maxWidth: number = 1200, quality: number = 0.82): Promise<{ dataUrl: string; sizeKb: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
        resolve({ dataUrl, sizeKb });
      };
      img.onerror = (e) => reject(e);
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Generate high-fidelity SVG illustration placeholders representing audit evidence
 */
export function generatePlaceholderSvg(category: EvidenceCategory, title: string): string {
  const cleanTitle = title.replace(/[<>&"]/g, '');

  let badgeColor = '#2563eb';
  let badgeText = 'SISTEM INATRADE';
  let iconContent = '';

  if (category === 'screenshot_sistem') {
    badgeColor = '#dc2626';
    badgeText = 'PORTAL PERIZINAN DARING (INATRADE)';
    iconContent = `
      <rect x="40" y="50" width="520" height="280" rx="6" fill="#1e293b" />
      <rect x="40" y="50" width="520" height="30" rx="6" fill="#0f172a" />
      <circle cx="60" cy="65" r="4" fill="#ef4444" />
      <circle cx="75" cy="65" r="4" fill="#f59e0b" />
      <circle cx="90" cy="65" r="4" fill="#10b981" />
      <text x="110" y="69" fill="#94a3b8" font-size="11" font-family="sans-serif">https://inatrade.kemendag.go.id/status-permohonan/PI-2025</text>
      
      <rect x="60" y="100" width="480" height="40" rx="4" fill="#334155" />
      <text x="80" y="125" fill="#f87171" font-size="13" font-weight="bold" font-family="sans-serif">PERINGATAN: Status Verifikasi Melebihi SLA 5 Hari Kerja</text>
      
      <rect x="60" y="155" width="230" height="150" rx="4" fill="#1e293b" stroke="#475569" stroke-width="1" />
      <text x="75" y="180" fill="#cbd5e1" font-size="11" font-family="sans-serif">No. Permohonan: PI-2025-04892</text>
      <text x="75" y="200" fill="#cbd5e1" font-size="11" font-family="sans-serif">Komoditas: Baja Paduan</text>
      <text x="75" y="220" fill="#fca5a5" font-size="11" font-weight="bold" font-family="sans-serif">Status: Menunggu Telaah Analis</text>
      <text x="75" y="240" fill="#94a3b8" font-size="10" font-family="sans-serif">Waktu Pengajuan: 03 Maret 2025</text>
      <text x="75" y="260" fill="#94a3b8" font-size="10" font-family="sans-serif">Durasi Tertahan: 7 Hari Kerja</text>
      
      <rect x="310" y="155" width="230" height="150" rx="4" fill="#1e293b" stroke="#475569" stroke-width="1" />
      <text x="325" y="180" fill="#94a3b8" font-size="11" font-family="sans-serif">Catatan Analis:</text>
      <text x="325" y="205" fill="#f87171" font-size="11" font-style="italic" font-family="sans-serif">"Perbaiki berkas teknis"</text>
      <text x="325" y="235" fill="#64748b" font-size="9" font-family="sans-serif">(Tanpa rincian spesifik pasal atau lampiran)</text>
    `;
  } else if (category === 'dokumen_fisik') {
    badgeColor = '#ea580c';
    badgeText = 'DUPLIKASI DOKUMEN / FORMULIR FISIK';
    iconContent = `
      <rect x="70" y="50" width="210" height="280" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" />
      <text x="90" y="85" fill="#1e293b" font-size="12" font-weight="bold" font-family="sans-serif">AKTA NOTARIS</text>
      <rect x="90" y="100" width="170" height="6" fill="#e2e8f0" />
      <rect x="90" y="115" width="150" height="6" fill="#e2e8f0" />
      <rect x="90" y="130" width="165" height="6" fill="#e2e8f0" />
      <rect x="90" y="150" width="90" height="24" rx="3" fill="#fee2e2" />
      <text x="95" y="166" fill="#dc2626" font-size="9" font-weight="bold" font-family="sans-serif">DIUNGGAH ULANG</text>

      <rect x="320" y="50" width="210" height="280" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" />
      <text x="340" y="85" fill="#1e293b" font-size="12" font-weight="bold" font-family="sans-serif">DATA PROFILE OSS</text>
      <rect x="340" y="100" width="170" height="6" fill="#bfdbfe" />
      <rect x="340" y="115" width="140" height="6" fill="#bfdbfe" />
      <rect x="340" y="130" width="160" height="6" fill="#bfdbfe" />
      <rect x="340" y="150" width="110" height="24" rx="3" fill="#dbeafe" />
      <text x="345" y="166" fill="#1d4ed8" font-size="9" font-weight="bold" font-family="sans-serif">SUDAH TERVERIFIKASI</text>

      <!-- Panah Duplikasi -->
      <path d="M 285 160 L 315 160" stroke="#dc2626" stroke-width="3" stroke-dasharray="4 2" />
      <text x="195" y="290" fill="#991b1b" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle">Temuan: Beban Dokumen Berulang</text>
    `;
  } else if (category === 'foto_antrean') {
    badgeColor = '#d97706';
    badgeText = 'LOKET LAYANAN / ANTREAN TATAP MUKA';
    iconContent = `
      <rect x="50" y="50" width="500" height="280" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" />
      <rect x="50" y="50" width="500" height="40" fill="#1e3a8a" />
      <text x="70" y="75" fill="#ffffff" font-size="13" font-weight="bold" font-family="sans-serif">LOKET KONSULTASI & INFORMASI PELAYANAN</text>
      
      <!-- Counter desks -->
      <rect x="80" y="110" width="120" height="160" rx="4" fill="#e2e8f0" stroke="#94a3b8" />
      <text x="100" y="140" fill="#475569" font-size="11" font-weight="bold" font-family="sans-serif">Loket 1 (Tutup)</text>
      <rect x="240" y="110" width="120" height="160" rx="4" fill="#e2e8f0" stroke="#94a3b8" />
      <text x="260" y="140" fill="#1e3a8a" font-size="11" font-weight="bold" font-family="sans-serif">Loket 2 (Buka)</text>
      <rect x="400" y="110" width="120" height="160" rx="4" fill="#e2e8f0" stroke="#94a3b8" />
      <text x="420" y="140" fill="#475569" font-size="11" font-weight="bold" font-family="sans-serif">Loket 3 (Tutup)</text>
      
      <rect x="80" y="240" width="440" height="35" rx="4" fill="#fef3c7" stroke="#f59e0b" />
      <text x="100" y="262" fill="#92400e" font-size="11" font-weight="bold" font-family="sans-serif">Fakta Lapangan: Antrean 45 Menit karena 2 dari 3 loket sedang istirahat dinas</text>
    `;
  } else {
    badgeColor = '#0284c7';
    badgeText = 'REGULASI / DOKUMEN SOP';
    iconContent = `
      <rect x="60" y="50" width="480" height="280" rx="6" fill="#f8fafc" stroke="#94a3b8" stroke-width="2" />
      <rect x="60" y="50" width="480" height="36" fill="#0f172a" />
      <text x="80" y="74" fill="#ffffff" font-size="12" font-weight="bold" font-family="sans-serif">LEMBAR PENGUJIAN REGULASI & SOP LAYANAN</text>
      
      <rect x="80" y="105" width="440" height="50" rx="4" fill="#ffffff" stroke="#cbd5e1" />
      <text x="95" y="125" fill="#1e293b" font-size="11" font-weight="bold" font-family="sans-serif">Permendag No. 36 Tahun 2023 (Kebijakan & Pengaturan Impor)</text>
      <text x="95" y="143" fill="#64748b" font-size="10" font-family="sans-serif">Menetapkan batas SLA penerbitan 3 hari kerja sejak dokumen dinyatakan lengkap.</text>

      <rect x="80" y="170" width="440" height="60" rx="4" fill="#fee2e2" stroke="#fca5a5" />
      <text x="95" y="192" fill="#991b1b" font-size="11" font-weight="bold" font-family="sans-serif">Fakta Lapangan Tidak Sinkron:</text>
      <text x="95" y="210" fill="#7f1d1d" font-size="10" font-family="sans-serif">Sistem INATRADE tidak membedakan waktu verifikasi teknis K/L lain dengan waktu Kemendag.</text>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="100%" height="100%">
    <rect width="600" height="360" fill="#f1f5f9" />
    ${iconContent}
    <rect x="40" y="15" width="260" height="24" rx="4" fill="${badgeColor}" />
    <text x="50" y="31" fill="#ffffff" font-size="10" font-weight="bold" font-family="sans-serif">${badgeText}</text>
    <rect x="320" y="15" width="240" height="24" rx="4" fill="#ffffff" stroke="#cbd5e1" />
    <text x="330" y="31" fill="#475569" font-size="10" font-family="sans-serif">Bukti Pengawasan Itjen Kemendag</text>
  </svg>`;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/**
 * Standard realistic preset evidences for Itjen Kemendag evaluation
 */
export const SAMPLE_EVIDENCES: AuditEvidence[] = [
  {
    id: 'ev-1',
    stageId: 'stage-4',
    stageCode: 'Tahap 4',
    stageName: 'Processing & Verifikasi Dokumen',
    title: 'Tangkapan Layar Status Verifikasi Menembus 7 Hari Kerja (SLA Melebihi Batas)',
    category: 'screenshot_sistem',
    severity: 'kritis',
    locationOrSource: 'Portal INATRADE v2.4 (Menu Pelacakan Permohonan)',
    description: 'Ditemukan permohonan Persetujuan Impor (PI) Nomor Registrasi PI-2025-04892 tertahan dengan status "Dalam Proses Verifikasi Petugas" selama 7 hari kerja tanpa keterangan kendala atau notifikasi penundaan kepada pemohon, melampaui batas janji layanan 3 hari kerja.',
    dateRecorded: '14 Maret 2025',
    auditorName: 'Tim Audit Inspektorat Wilayah II',
    referenceDoc: 'Permendag No. 36 Tahun 2023 Pasal 18 ayat (2) & Standar Pelayanan Publik Ditjen Daglu',
    imageUrl: generatePlaceholderSvg('screenshot_sistem', 'Tangkapan Layar Status Verifikasi Melebihi SLA')
  },
  {
    id: 'ev-2',
    stageId: 'stage-3',
    stageCode: 'Tahap 3',
    stageName: 'Application & Pengisian Berkas',
    title: 'Duplikasi Unggah Dokumen Legalitas (Akta Perusahaan & NPWP Berulang)',
    category: 'dokumen_fisik',
    severity: 'sedang',
    locationOrSource: 'Formulir INATRADE Modul Unggah Persyaratan',
    description: 'Pelaku usaha diwajibkan mengunggah ulang salinan Akta Notaris dan NPWP perusahaan dalam format PDF, padahal entitas telah terdaftar dan profil legalitasnya telah tervalidasi pada Single Submission OSS/SINSW.',
    dateRecorded: '12 Maret 2025',
    auditorName: 'Tim Evaluator Citizen-Centric Itjen',
    referenceDoc: 'Asas Efisiensi Administrasi UU No. 25/2009 & Prinsip Satu Data Indonesia',
    imageUrl: generatePlaceholderSvg('dokumen_fisik', 'Duplikasi Unggah Dokumen Legalitas')
  },
  {
    id: 'ev-3',
    stageId: 'stage-1',
    stageCode: 'Tahap 1',
    stageName: 'Awareness & Pencarian Regulasi',
    title: 'Ketidakjelasan Kriteria Rekomendasi Teknis Kementerian Pembina',
    category: 'regulasi_sop',
    severity: 'sedang',
    locationOrSource: 'Portal Resmi Kemendag & Modul FAQ INATRADE',
    description: 'Tidak ditemukan matriks komparasi HS Code dengan instansi pembina teknis yang menerbitkan pertimbangan teknis (Kemenperin/Kementan), menyebabkan pemohon harus bolak-balik konsultasi lintas kementerian tanpa kepastian.',
    dateRecorded: '10 Maret 2025',
    auditorName: 'Tim Evaluator Itjen Kemendag',
    referenceDoc: 'SOP Penetapan Tata Niaga Impor Kemendag',
    imageUrl: generatePlaceholderSvg('regulasi_sop', 'Ketidakjelasan Kriteria Rekomendasi Teknis')
  }
];

export const CATEGORY_LABELS: Record<EvidenceCategory, { label: string; badgeCls: string; iconName: string }> = {
  screenshot_sistem: {
    label: 'Tangkapan Layar Sistem',
    badgeCls: 'bg-rose-50 text-rose-800 border-rose-300',
    iconName: 'Monitor'
  },
  dokumen_fisik: {
    label: 'Dokumen / Formulir Fisik',
    badgeCls: 'bg-amber-50 text-amber-800 border-amber-300',
    iconName: 'FileText'
  },
  foto_antrean: {
    label: 'Foto Antrean / Loket Fisik',
    badgeCls: 'bg-orange-50 text-orange-800 border-orange-300',
    iconName: 'Users'
  },
  regulasi_sop: {
    label: 'Regulasi / Dokumen SOP',
    badgeCls: 'bg-blue-50 text-blue-800 border-blue-300',
    iconName: 'BookOpen'
  },
  rekaman_audio: {
    label: 'Wawancara / Rekaman Suara',
    badgeCls: 'bg-purple-50 text-purple-800 border-purple-300',
    iconName: 'Mic'
  },
  lainnya: {
    label: 'Temuan Lapangan Lainnya',
    badgeCls: 'bg-slate-100 text-slate-800 border-slate-300',
    iconName: 'HelpCircle'
  }
};

export const SEVERITY_LABELS: Record<EvidenceSeverity, { label: string; badgeCls: string; dotCls: string }> = {
  kritis: {
    label: 'Kritis (Menghambat Layanan)',
    badgeCls: 'bg-red-100 text-red-900 border-red-300 font-bold',
    dotCls: 'bg-red-600'
  },
  sedang: {
    label: 'Sedang (Beban Kepatuhan/Waktu)',
    badgeCls: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold',
    dotCls: 'bg-amber-600'
  },
  ringan: {
    label: 'Ringan (Koreksi Minor)',
    badgeCls: 'bg-blue-100 text-blue-900 border-blue-300 font-medium',
    dotCls: 'bg-blue-600'
  }
};
