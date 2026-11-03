import { StageItem } from '../types';

export interface StageTemplate {
  id: string;
  name: string;
  subtitle: string;
  category: 'core' | 'support' | 'post';
  badge: string;
  action: string;
  touchpoint: string;
  response: string;
  burden: string;
  learning: boolean;
  compliance: boolean;
  psychological: boolean;
  emotion: number;
  opportunity: string;
}

export const STAGE_TEMPLATES: StageTemplate[] = [
  {
    id: 'tpl-application',
    name: 'Pengajuan Permohonan (Application Submission)',
    subtitle: 'Pengisian formulir & pengunggahan dokumen prasyarat',
    category: 'core',
    badge: 'Inti Layanan',
    action: 'Mengisi formulir permohonan daring, memilih jenis izin/komoditas, dan mengunggah berkas persyaratan administratif.',
    touchpoint: 'Portal Perizinan Daring / Loket Pelayanan Terpadu',
    response: 'Sistem memvalidasi format kelengkapan awal berkas dan menerbitkan Nomor Tiket/Registrasi Permohonan.',
    burden: 'Format berkas yang dipersyaratkan kaku, pembatasan ukuran file ketat, dan kewajiban unggah ulang data legalitas yang sudah ada di NIB/OSS.',
    learning: true,
    compliance: true,
    psychological: false,
    emotion: -1,
    opportunity: 'Terapkan fitur pengisian otomatis (auto-populate) dari data NIB/NPWP dan pratinjau validasi berkas otomatis sebelum submit.'
  },
  {
    id: 'tpl-verification',
    name: 'Verifikasi & Validasi (Verification)',
    subtitle: 'Pemeriksaan kelengkapan substantif dan teknis oleh analis',
    category: 'core',
    badge: 'Proses Evaluasi',
    action: 'Menunggu proses verifikasi dokumen teknis dan klarifikasi substantif oleh tim analis perizinan.',
    touchpoint: 'Modul Penugasan Analis / Dashboard Pelacakan Berkas',
    response: 'Petugas melakukan audit substantif dan menyatakan status permohonan: Memenuhi Syarat, Butuh Revisi, atau Ditolak.',
    burden: 'Durasi pemrosesan tidak memiliki estimasi selesai pasti (ketiadaan SLA transparan) sehingga memicu kecemasan dan risiko biaya tunggu.',
    learning: false,
    compliance: false,
    psychological: true,
    emotion: -2,
    opportunity: 'Tampilkan SLA Countdown Timer 3 hari kerja di dashboard pemohon dan checklist alasan penolakan spesifik.'
  },
  {
    id: 'tpl-notification',
    name: 'Notifikasi Status (Notification)',
    subtitle: 'Pemberitahuan resmi hasil evaluasi, revisi, atau penetapan',
    category: 'core',
    badge: 'Komunikasi',
    action: 'Menerima pesan notifikasi resmi mengenai perkembangan status atau catatan revisi berkas yang perlu diperbaiki.',
    touchpoint: 'WhatsApp Resmi / SMS / Email Terdaftar / Notifikasi Web',
    response: 'Sistem mengirimkan tautan langsung perbaikan berkas atau pemberitahuan bahwa permohonan telah disetujui.',
    burden: 'Notifikasi sering terlambat terkirim, masuk folder spam email, atau catatan perbaikan analis terlalu normatif tanpa petunjuk solusi.',
    learning: true,
    compliance: false,
    psychological: true,
    emotion: 0,
    opportunity: 'Kirim notifikasi instan multi-kanal terintegrasi (WhatsApp & SMS Gateway) dengan rincian poin koreksi yang presisi.'
  },
  {
    id: 'tpl-issuance',
    name: 'Penerbitan Izin / Dokumen (Issuance & Resolution)',
    subtitle: 'Penerbitan surat keputusan resmi ber-TTE BSrE',
    category: 'core',
    badge: 'Output Akhir',
    action: 'Mengunduh dan menyimpan dokumen surat izin resmi, sertifikat, atau tanda daftar elektronik ber-QR Code.',
    touchpoint: 'Sistem Dokumen Digital Ber-TTE / Portal Mandiri',
    response: 'Menerbitkan dokumen digital berkekuatan hukum dengan tanda tangan elektronik tersertifikasi Balai Sertifikasi Elektronik (BSrE).',
    burden: 'Masa kedaluwarsa tautan unduhan terlalu singkat atau kendala server saat mengunduh berkas bertanda tangan elektronik.',
    learning: false,
    compliance: false,
    psychological: false,
    emotion: 2,
    opportunity: 'Kirimkan salinan dokumen resmi otomatis ke email direksi dan sediakan repositori unduhan permanen berkeamanan tinggi.'
  },
  {
    id: 'tpl-payment',
    name: 'Pembayaran PNBP / Retribusi (Payment & Billing)',
    subtitle: 'Penerbitan kode bayar billing SIMPONI / MPN G3',
    category: 'support',
    badge: 'Keuangan / PNBP',
    action: 'Membayar tarif PNBP/retribusi resmi perizinan melalui saluran perbankan, teller, ATM, atau mobile banking.',
    touchpoint: 'Kode Billing SIMPONI / Gateway Perbankan MPN G3',
    response: 'Merekam konfirmasi penerimaan negara secara otomatis dan mengubah status berkas perizinan menjadi lunas.',
    burden: 'Kendala timeout kode bayar perbankan dan kewajiban mengunggah struk bukti bayar fisik secara manual ke sistem.',
    learning: false,
    compliance: true,
    psychological: true,
    emotion: -1,
    opportunity: 'Integrasi rekonsiliasi pembayaran real-time via API SIMPONI/MPN G3 tanpa kewajiban unggah struk manual.'
  },
  {
    id: 'tpl-awareness',
    name: 'Pencarian Informasi Awal (Awareness & Discovery)',
    subtitle: 'Penelusuran regulasi, persyaratan, dan alur perizinan',
    category: 'support',
    badge: 'Informasi Awal',
    action: 'Mencari informasi persyaratan perizinan, kuota komoditas, dan SOP layanan melalui portal resmi atau konsultasi.',
    touchpoint: 'Website Resmi Kemendag / FAQ Daring / Helpdesk Layanan',
    response: 'Menyediakan panduan syarat dokumen, dasar hukum, dan estimasi waktu pemrosesan permohonan.',
    burden: 'Regulasi teknis sering berubah dan tersebar di beberapa tautan K/L terpisah tanpa matriks komparasi yang mudah dipahami.',
    learning: true,
    compliance: false,
    psychological: false,
    emotion: 0,
    opportunity: 'Sediakan wizard interaktif "Cek Kelayakan Berkas Mandiri" sebelum pengguna memulai pembuatan akun permohonan.'
  },
  {
    id: 'tpl-postservice',
    name: 'Pelaporan Pasca-Layanan (Post-Service & Compliance)',
    subtitle: 'Penyampaian realisasi izin atau pengaduan evaluasi',
    category: 'post',
    badge: 'Pasca-Layanan',
    action: 'Menyampaikan laporan berkala realisasi kegiatan ekspor/impor/usaha atau mengisi evaluasi kepuasan layanan.',
    touchpoint: 'Modul Pelaporan Realisasi / Survei Kepuasan Elektronik',
    response: 'Sistem merekam data realisasi kepatuhan niaga dan menerbitkan Bukti Tanda Terima Laporan elektronik.',
    burden: 'Format unggahan file data realisasi (format spreadsheet) sering gagal validasi bila terjadi selisih koma tanpa letak baris kesalahan.',
    learning: true,
    compliance: true,
    psychological: false,
    emotion: 0,
    opportunity: 'Sediakan templat spreadsheet baku ber-formula validasi otomatis dan panduan singkat 2 menit pengisian laporan.'
  }
];

// Helper to generate a 5-stage standard journey skeleton
export function getStandard5StageSkeleton(): StageItem[] {
  return [
    {
      id: 'stage-1',
      code: 'Tahap 1',
      name: 'Pencarian Informasi (Awareness)',
      subtitle: 'Pencarian Informasi Regulasi & Prasyarat',
      action: 'Mencari informasi persyaratan perizinan, kuota komoditas, dan SOP layanan melalui portal resmi.',
      touchpoint: 'Portal Resmi Kemendag / Helpdesk Layanan',
      response: 'Menyediakan panduan persyaratan dokumen dan alur pemrosesan permohonan.',
      burden: 'Regulasi teknis tersebar di beberapa aturan kementerian berbeda tanpa ringkasan terpadu.',
      learning: true,
      compliance: false,
      psychological: false,
      emotion: 0,
      opportunity: 'Sediakan wizard interaktif "Cek Persyaratan Mandiri" dalam satu halaman terpadu.'
    },
    {
      id: 'stage-2',
      code: 'Tahap 2',
      name: 'Pengajuan Permohonan (Application Submission)',
      subtitle: 'Pengisian Formulir & Unggah Dokumen Prasyarat',
      action: 'Mengisi formulir permohonan daring dan mengunggah dokumen persyaratan administratif.',
      touchpoint: 'Portal Perizinan Daring / Sistem INATRADE',
      response: 'Sistem merekam data permohonan dan menerbitkan Bukti Registrasi Permohonan resmi.',
      burden: 'Kewajiban mengunggah berkas legalitas dasar yang sebenarnya sudah tersimpan di OSS/NIB.',
      learning: true,
      compliance: true,
      psychological: false,
      emotion: -1,
      opportunity: 'Terapkan auto-populate data profil perusahaan dari basis data NIB/NPWP.'
    },
    {
      id: 'stage-3',
      code: 'Tahap 3',
      name: 'Verifikasi & Validasi (Verification)',
      subtitle: 'Pemeriksaan Substantif & Teknis oleh Analis',
      action: 'Menunggu proses verifikasi dokumen teknis dan klarifikasi substantif tim analis.',
      touchpoint: 'Modul Verifikasi Berkas / Dashboard Status Pemohon',
      response: 'Petugas melakukan audit substantif dan menyatakan status berkas lengkap atau butuh perbaikan.',
      burden: 'Waktu verifikasi tidak memiliki estimasi selesai pasti (SLA kabur) sehingga memicu kecemasan denda tunggu.',
      learning: false,
      compliance: false,
      psychological: true,
      emotion: -2,
      opportunity: 'Terapkan SLA Countdown Timer transparan di dashboard pengguna dan checklist penolakan presisi.'
    },
    {
      id: 'stage-4',
      code: 'Tahap 4',
      name: 'Penerbitan Izin (Issuance & Resolution)',
      subtitle: 'Penerbitan Dokumen Resmi Ber-TTE BSrE',
      action: 'Mengunduh surat persetujuan/izin resmi ber-TTE digital tersertifikasi BSrE.',
      touchpoint: 'Sistem Penerbitan Dokumen Digital Kemendag',
      response: 'Menerbitkan izin resmi digital yang terintegrasi secara otomatis ke Bea Cukai dan kementerian mitra.',
      burden: 'Pengguna harus mengunduh manual dan mengirimkan ke mitra kerja.',
      learning: false,
      compliance: false,
      psychological: false,
      emotion: 2,
      opportunity: 'Kirim salinan otomatis ke email direksi dan sediakan repositori unduh ber-QR Code permanen.'
    },
    {
      id: 'stage-5',
      code: 'Tahap 5',
      name: 'Pelaporan Pasca-Layanan (Post-Service)',
      subtitle: 'Penyampaian Realisasi Impor/Ekspor Berkala',
      action: 'Menyampaikan laporan kepatuhan realisasi kegiatan niaga secara berkala di sistem.',
      touchpoint: 'Modul Pelaporan Kepatuhan INATRADE',
      response: 'Mencatat data realisasi dan menerbitkan tanda bukti pelaporan elektronik.',
      burden: 'Validasi spreadsheet laporan sering gagal tanpa penjelasan letak sel kesalahan format.',
      learning: true,
      compliance: true,
      psychological: false,
      emotion: 0,
      opportunity: 'Sediakan templat spreadsheet berformula validasi otomatis dengan pra-pengecekan instan.'
    }
  ];
}
