import { EvaluationState, ServiceModel } from '../types';
import { SAMPLE_EVIDENCES } from '../utils/evidenceHelpers';

export const SERVICE_MODELS: ServiceModel[] = [
  {
    id: 'guardian',
    name: 'Guardian of Public Goods',
    category: 'Perizinan Lartas & Pengawasan Regulasi Niaga',
    roleIndo: 'Penerbit Izin Pembatasan & Penegak Kepatuhan',
    shortDefinition:
      'Layanan di mana negara memegang otoritas hukum untuk mengatur, menerbitkan perizinan pembatasan (larangan dan pembatasan/Lartas), menetapkan kuota, serta mengawasi dan menertibkan aktivitas niaga demi melindungi industri dalam negeri, keselamatan konsumen, dan kepentingan nasional.',
    desc: 'Layanan pengendalian kuota impor-ekspor komoditas strategis, pengawasan pemenuhan standar mutu SNI wajib atas barang beredar, registrasi legalitas usaha, dan inspeksi penertiban tertib niaga di pasar dan platform daring.',
    focus:
      'Kejelasan prasyarat rekomendasi teknis kementerian teknis (K/L) sejak awal, kepastian SLA waktu verifikasi perizinan di portal INATRADE/SINSW, rasionalitas alokasi kuota, serta transparansi alasan penolakan atau pengembalian berkas.',
    examples:
      'Persetujuan Impor (PI) Komoditas Tertentu (Ditjen Daglu), Persetujuan Ekspor (PE) Produk Pertambangan/Kehutanan (Ditjen Daglu), Pengawasan SNI Wajib Barang Beredar & Jasa (Ditjen PKTN), Surat Tanda Pendaftaran Waralaba/STPW (Ditjen PDN), Tanda Daftar Gudang/TDG (Ditjen PDN), Izin Usaha Pialang Berjangka & Pedagang Aset Kripto (Bappebti).',
    subModels: [
      'Persetujuan Impor/Ekspor (Lartas & Kuota)',
      'Pengawasan Standar SNI Wajib & Tertib Niaga',
      'Pendaftaran Legalitas Usaha (STPW & TDG)',
      'Perizinan Bursa Berjangka & Kripto',
      'Inspeksi & Penegakan Sanksi Pasar'
    ],
    keyBurdenRisk:
      'Beban kepatuhan dokumen rekomendasi teknis kementerian lain yang lambat dan berulang, serta beban psikologis ketidakpastian durasi validasi izin saat jadwal pengapalan mendesak.',
    citation: 'Schedler & Guenduez (2024)'
  },
  {
    id: 'performance',
    name: 'Performance Designer',
    category: 'Layanan Transaksional Cepat & Otomasi Satu Pintu',
    roleIndo: 'Penyelenggara Efisiensi Layanan & Otomasi Digital',
    shortDefinition:
      'Layanan di mana negara secara langsung merancang proses pelayanan terstandar, cepat, serba otomatis, dan mandiri (self-service) yang mengedepankan efisiensi waktu, tanpa tatap muka fisik, serta terintegrasi backend lintas instansi (Single Window).',
    desc: 'Layanan transaksional operasional yang menuntut kecepatan proses instan (hitungan jam), otomasi penerbitan dokumen penyerta perdagangan, integrasi data profil usaha (Machine-to-Machine via SINSW/OSS), dan akses informasi publik secara mandiri 24/7.',
    focus:
      'Kecepatan waktu penerbitan dokumen (SLA menit/jam), kemudahan antarmuka pengguna (UI/UX) portal mandiri tanpa kendala sistem (zero-downtime), pengisian otomatis (auto-populate) dari profil NIB/NPWP, serta kecepatan penanganan gangguan teknis server.',
    examples:
      'Penerbitan Surat Keterangan Asal Elektronik (e-COO / e-SKA) untuk Tarif Preferensi FTA (Ditjen Daglu / IPSKA), Sistem Pelayanan Terpadu Satu Pintu INATRADE - SINSW (Pusdatin Kemendag), Dashboard Sistem Pemantauan Pasar & Kebutuhan Pokok / SP2KP (Ditjen PDN), Otomasi Registrasi Akun Eksportir/Importir Terpadu, Layanan Penerbitan Izin Otomatis (Auto-Approval) bagi Pelaku Usaha Bereputasi Baik.',
    subModels: [
      'Penerbitan Dokumen Ekspor Elektronik (e-SKA)',
      'Sistem Satu Pintu INATRADE - SINSW Terintegrasi',
      'Pemantauan Mandiri Harga Pangan SP2KP 24/7',
      'Otomasi Sinkronisasi Profil NIB/NPWP',
      'Penerbitan Izin Otomatis (Auto-Approval)'
    ],
    keyBurdenRisk:
      'Beban belajar dan akses saat server antarkementerian mengalami gangguan/time-out, kesulitan navigasi form daring yang rumit, serta kegagalan sinkronisasi data akun antar-portal.',
    citation: 'Schedler & Guenduez (2024)'
  },
  {
    id: 'activator',
    name: 'Activator',
    category: 'Pemberdayaan Usaha, Pendampingan & Kanal Aduan',
    roleIndo: 'Penggerak Kapasitas Pelaku Usaha & Fasilitator Kolaborasi',
    shortDefinition:
      'Layanan di mana negara bertindak sebagai penggerak, pembina, dan fasilitator untuk memampukan pelaku usaha/masyarakat agar mandiri berdaya saing ekspor, menyediakan ruang mediasi sengketa niaga, serta mengedukasi konsumen cerdas.',
    desc: 'Layanan pembinaan dan bimbingan teknis intensif (coaching/mentoring), konsultasi pengembangan produk ekspor, business matching bersama perwakilan dagang di luar negeri, mediasi sengketa perlindungan konsumen, dan pendampingan pedagang pasar rakyat.',
    focus:
      'Kemudahan akses pendaftaran program pembinaan bagi UMKM daerah, relevansi materi konsultasi dan kurasi produk ekspor, kejelasan tindak lanjut mediasi sengketa konsumen, serta sikap petugas/coach yang membimbing secara empatik dan solutif.',
    examples:
      'Export Coaching Program (ECP) & Bimbingan Teknis Ekspor PPEI (Ditjen PEN), Layanan Konsultasi & Kurasi Produk di Klinik Ekspor / Export Center Kemendag (Surabaya, Makassar, Medan, dll.), Fasilitasi Temu Bisnis (Business Matching) oleh Atase Perdagangan & ITPC Luar Negeri, Layanan Pengaduan Konsumen & Fasilitasi Mediasi BPSK (Ditjen PKTN), Program Pendampingan Digitalisasi Pedagang Pasar Rakyat (Ditjen PDN).',
    subModels: [
      'Pendampingan Intensif Ekspor (Export Coaching)',
      'Klinik Ekspor & Konsultasi Kurasi Produk',
      'Temu Bisnis Buyer Asing (ITPC / Atase Perdagangan)',
      'Mediasi Konsiliasi Sengketa Konsumen (BPSK)',
      'Edukasi & Digitalisasi Pedagang Pasar Rakyat'
    ],
    keyBurdenRisk:
      'Beban psikologis saat pengaduan konsumen lambat direspons, kriteria seleksi bimbingan teknis yang terkesan elitis bagi pelaku usaha pemula, serta materi pembinaan yang terlalu teoritis tanpa tindak lanjut kontrak dagang.',
    citation: 'Schedler & Guenduez (2024)'
  },
  {
    id: 'funder',
    name: 'Funder',
    category: 'Bantuan Sarana Usaha, Fasilitasi Finansial & Subsidi',
    roleIndo: 'Penyalur Alokasi Bantuan APBN & Subsidi Niaga',
    shortDefinition:
      'Layanan di mana negara menyalurkan alokasi anggaran belanja publik (APBN) dalam bentuk hibah sarana usaha perdagangan, pembiayaan penuh kepesertaan pameran ekspor internasional, atau subsidi pembiayaan komoditas guna memperkuat daya saing pelaku usaha mikro dan UMKM binaan.',
    desc: 'Layanan penyediaan fasilitas stan pameran dagang luar negeri bersubsidi penuh APBN, subsidi kepesertaan Trade Expo Indonesia (TEI), hibah fisik sarana usaha bagi pedagang pasar/mikro, subsidi pembiayaan resi gudang komoditas pertanian, dan fasilitasi pembiayaan sertifikasi standar ekspor.',
    focus:
      'Transparansi dan keadilan kriteria kurasi seleksi penerima bantuan/subsidi, kemudahan pengajuan proposal daring tanpa pungutan liar, kepastian jadwal tahapan penetapan, serta akuntabilitas pertanggungjawaban hibah tanpa birokrasi SPJ yang memberatkan warga.',
    examples:
      'Fasilitasi Paviliun Indonesia pada Pameran Dagang Internasional di Luar Negeri Bersubsidi Penuh APBN (Ditjen PEN), Subsidi Kepesertaan Trade Expo Indonesia (TEI) bagi UMKM Siap Ekspor (Ditjen PEN), Bantuan Sarana Usaha Perdagangan bagi Pelaku Usaha Mikro (Gerobak Dagang, Tenda Usaha, Timbangan Tera) (Ditjen PDN), Fasilitas Subsidi Resi Gudang / S-SRG bagi Petani Komoditas (Bappebti), Fasilitasi Pembiayaan Sertifikasi Mutu/Halal/HACCP Internasional bagi UMKM Ekspor (Ditjen PEN).',
    subModels: [
      'Pembiayaan Penuh Stan Paviliun Indonesia Luar Negeri',
      'Subsidi Kepesertaan Trade Expo Indonesia (TEI)',
      'Hibah Sarana Usaha Pedagang Mikro Pasar Rakyat',
      'Subsidi Bunga & Biaya Simpan Resi Gudang (S-SRG)',
      'Fasilitasi Pembiayaan Sertifikasi Standar Ekspor'
    ],
    keyBurdenRisk:
      'Beban kepatuhan proposal dan SPJ administrasi yang rumit bagi pelaku usaha mikro daerah, ketidakjelasan kriteria kurasi pemilihan peserta pameran, serta lambatnya pengumuman kelulusan fasilitasi.',
    citation: 'Schedler & Guenduez (2024)'
  },
  {
    id: 'yield',
    name: 'Yield Shaper',
    category: 'Jasa Teknis Berbayar & Penerimaan PNBP Resmi',
    roleIndo: 'Penyedia Jasa Teknis Berbayar (PNBP) Sesuai Tarif PP',
    shortDefinition:
      'Layanan publik berbayar di mana kementerian menyediakan jasa teknis khusus (pengujian lab, tera metrologi, diklat bersertifikat, atau sewa sarana) yang dikenakan tarif resmi Penerimaan Negara Bukan Pajak (PNBP) sesuai Peraturan Pemerintah tentang Tarif PNBP Kementerian Perdagangan.',
    desc: 'Layanan jasa teknis pengujian mutu barang komoditas ekspor/impor di laboratorium resmi, jasa kalibrasi serta tera/tera ulang alat ukur dan timbangan niaga, pelatihan teknis kepabeanan bersertifikat, dan tarif PNBP perizinan bursa komoditi berjangka.',
    focus:
      'Transparansi rincian tarif PNBP resmi sesuai PP, integrasi kode billing pembayaran online otomatis (SIMPONI / MPN G3), kecepatan pengujian sampel dan penerbitan sertifikat/surat keterangan hasil uji (SKHU), serta eliminasi penyerahan struk bukti bayar manual.',
    examples:
      'Jasa Pengujian Mutu Barang di Balai Besar Standardisasi & Pengendalian Mutu Barang / BPMB Ciracas (Ditjen PKTN), Pelayanan Jasa Tera & Tera Ulang serta Kalibrasi UTTP oleh Direktorat Metrologi (Ditjen PKTN), Jasa Pelatihan Teknis Ekspor & Kepabeanan Bersertifikat di BBPPEI (Ditjen PEN), Tarif PNBP Hak Akses & Perizinan Perdagangan Berjangka Komoditi (Bappebti), Tarif PNBP Sewa Fasilitas Auditorium & Balai Latihan Kerja Kemendag.',
    subModels: [
      'Jasa Pengujian Laboratorium Mutu Barang (BPMB)',
      'Pelayanan Tera & Tera Ulang Metrologi Legal',
      'Jasa Kalibrasi Alat Ukur & Timbangan Industri',
      'Pelatihan Teknis Ekspor Bersertifikat (BBPPEI)',
      'Integrasi Kode Bayar Billing SIMPONI Otomatis'
    ],
    keyBurdenRisk:
      'Beban pembayaran saat integrasi kode billing SIMPONI tidak otomatis terverifikasi lunas, kewajiban konfirmasi fotokopi bukti setor manual ke kasir, dan SLA durasi uji lab yang melampaui janji layanan.',
    citation: 'Schedler & Guenduez (2024)'
  }
];

export const LITERACY_OPTIONS = [
  'Sedang (Terbiasa aplikasi pesan singkat/WhatsApp, belum familier portal perizinan teknis Kemendag)',
  'Tinggi (Terbiasa menggunakan sistem perizinan daring INATRADE/SINSW, SaaS, dan format dokumen digital)',
  'Terbatas (Mengandalkan bantuan asosiasi usaha/kerabat atau konsultasi langsung di loket Kemendag)',
  'Khusus (Penyandang disabilitas / kelompok rentan yang memerlukan aksesibilitas khusus)'
];

export const PRESETS: Record<string, EvaluationState> = {
  perizinan: {
    sessionId: 'ITJEN-DAGLU-2025-01',
    unit: 'Direktorat Fasilitasi Ekspor dan Impor / Ditjen Perdagangan Luar Negeri',
    service: 'Layanan Penerbitan Persetujuan Impor (PI) Komoditas Industri melalui Sistem INATRADE',
    auditor: 'Tim Evaluator Inspektorat Jenderal Kementerian Perdagangan',
    period: 'Semester I - 2025',
    modelId: 'guardian',
    personaName: 'Rina Wijaya, S.E.',
    personaRole: 'Manajer Regulasi & Impor PT Sumber Niaga Pangan (IKM)',
    personaLiteracy: 'Sedang (Terbiasa aplikasi pesan singkat/WhatsApp, belum familier portal perizinan teknis Kemendag)',
    personaGoal: 'Mendapatkan kepastian dokumen rekomendasi kementerian teknis sejak awal dan memperoleh Persetujuan Impor resmi tepat waktu sebelum jadwal kapal tiba di pelabuhan tanpa revisi berkas berulang.',
    stages: [
      {
        id: 'stage-1',
        code: 'Tahap 1',
        name: 'Awareness',
        subtitle: 'Pencarian Informasi & Regulasi Teknis Permendag',
        action: 'Mencari daftar komoditas wajib Persetujuan Impor, prasyarat pertimbangan teknis kementerian perindustrian, dan format permohonan melalui portal resmi Kemendag dan INATRADE.',
        touchpoint: 'Portal Web Kemendag, Beranda INATRADE, Helpdesk Ditjen Daglu',
        response: 'Menyediakan ringkasan Peraturan Menteri Perdagangan terkait tata niaga impor beserta lampiran HS Code komoditas.',
        burden: 'Aturan lampiran HS Code sangat rinci dan sering terjadi perubahan Permendag turunan sehingga pemohon bingung apakah produknya memerlukan rekomendasi teknis tambahan.',
        learning: true,
        compliance: false,
        psychological: false,
        emotion: -1,
        opportunity: 'Menyusun "Pencarian HS Code Cerdas" di beranda INATRADE yang langsung menampilkan syarat dokumen dan masa berlaku izin dalam 1 tampilan visual ringkas.'
      },
      {
        id: 'stage-2',
        code: 'Tahap 2',
        name: 'Access',
        subtitle: 'Pengajuan Hak Akses Akun INATRADE & Validasi NIB',
        action: 'Melakukan login ke portal INATRADE yang tersinkronisasi dengan portal Single Submission (OSS/SINSW) menggunakan akun NIB perusahaan.',
        touchpoint: 'Portal Perizinan Daring INATRADE Kemendag, Integrasi SINSW',
        response: 'Sistem memverifikasi NIB dan profil importir secara otomatis dari database Kementerian Investasi/Kemenkeu.',
        burden: 'Proses sinkronisasi akun berjalan cepat dan data NIB terverifikasi otomatis dalam hitungan menit.',
        learning: false,
        compliance: false,
        psychological: false,
        emotion: 1,
        opportunity: 'Pertahankan stabilitas gateway sinkronisasi dan tambahkan panduan langkah demi langkah saat pembaharuan data perusahaan.'
      },
      {
        id: 'stage-3',
        code: 'Tahap 3',
        name: 'Application',
        subtitle: 'Pengisian Rencana Impor & Unggah Rekomendasi K/L',
        action: 'Mengisi pos tarif, pelabuhan tujuan, negara asal, kuota kebutuhan tahunan, dan mengunggah Surat Rekomendasi Teknis Kementerian Perindustrian serta laporan surveyor.',
        touchpoint: 'Formulir Elektronik Permohonan INATRADE Multi-Tab',
        response: 'Sistem mencatat rincian permohonan dan memberikan nomor pendaftaran permohonan Persetujuan Impor (PI).',
        burden: 'Diminta mengunggah ulang data legalitas perusahaan (akta pendirian dan NPWP) yang sebenarnya sudah ada di database akun. Jika jaringan internet tidak stabil, form tidak menyimpan draf otomatis.',
        learning: false,
        compliance: true,
        psychological: false,
        emotion: -1,
        opportunity: 'Aktifkan fitur auto-populate profil legalitas dari database NIB serta auto-save draf isian permohonan per pos tarif agar data tidak hilang.'
      },
      {
        id: 'stage-4',
        code: 'Tahap 4',
        name: 'Processing',
        subtitle: 'Verifikasi Dokumen Teknis & Penelaahan Analis Perdagangan',
        action: 'Menunggu tahapan verifikasi kelengkapan berkas dan telaah substantif oleh Analis Perdagangan Luar Negeri Ditjen Daglu.',
        touchpoint: 'Dashboard Tracking Status Permohonan INATRADE',
        response: 'Petugas analis memeriksa kesesuaian kuota dan spesifikasi barang sesuai regulasi Permendag yang berlaku.',
        burden: 'Status di sistem hanya tertulis "Proses Verifikasi" selama lebih dari 5 hari kerja tanpa indikator SLA countdown, dan apabila ada catatan perbaikan alasannya tertulis terlalu umum ("perbaiki data teknis").',
        learning: false,
        compliance: true,
        psychological: true,
        emotion: -2,
        opportunity: 'Terapkan visual tracker progres SLA 3 hari kerja, notifikasi SMS/WhatsApp gateway saat berkas bergeser meja, dan kewajiban verifikator memberikan catatan koreksi yang spesifik poin demi poin.'
      },
      {
        id: 'stage-5',
        code: 'Tahap 5',
        name: 'Resolution',
        subtitle: 'Penerbitan Surat Persetujuan Impor (PI) TTE Resmi',
        action: 'Menerima pemberitahuan penerbitan PI dan mengunduh berkas surat persetujuan ber-Tanda Tangan Elektronik (TTE) resmi.',
        touchpoint: 'Menu Unduh Surat Keputusan INATRADE (PDF terintegrasi INSW)',
        response: 'Menerbitkan SK Persetujuan Impor digital ber-QR Code validasi keaslian yang langsung terhubung ke Bea Cukai (CEISA).',
        burden: 'Penerbitan dokumen sangat praktis, langsung terintegrasi ke sistem kepabeanan tanpa perlu mengantarkan fisik berkas ke pelabuhan.',
        learning: false,
        compliance: false,
        psychological: false,
        emotion: 2,
        opportunity: 'Pertahankan integrasi realtime ke Bea Cukai dan sediakan fitur kirim salinan otomatis ke email direksi perusahaan.'
      },
      {
        id: 'stage-6',
        code: 'Tahap 6',
        name: 'Post-Service',
        subtitle: 'Penyampaian Laporan Realisasi Impor Berkala',
        action: 'Menyampaikan laporan realisasi impor setiap bulan melalui portal INATRADE sebagai kewajiban kepatuhan regulasi.',
        touchpoint: 'Modul Pelaporan Realisasi INATRADE',
        response: 'Sistem merekam data realisasi impor dan menerbitkan tanda terima pelaporan elektronik.',
        burden: 'Format unggahan file data realisasi (format spreadsheet) sering gagal validasi bila terjadi selisih koma atau spasi tanpa penjelasan letak kesalahan baris kolom.',
        learning: true,
        compliance: true,
        psychological: false,
        emotion: 0,
        opportunity: 'Sediakan templat spreadsheet baku ber-formula validasi otomatis dan panduan video tutorial 2 menit pengisian laporan realisasi.'
      }
    ],
    coDesign: {
      discovery: 'Hasil evaluasi Itjen Kemendag mengidentifikasi titik kritis pada Tahap 3 (duplikasi unggah berkas legalitas yang sudah tercatat di NIB) dan Tahap 4 (ketidakpastian waktu verifikasi dan catatan revisi analis yang terlalu normatif, memicu beban psikologis dan biaya penumpukan kontainer di pelabuhan bagi pelaku usaha).',
      ideation: '1. Simplifikasi berkas: Hapus kewajiban unggah ulang akta/NPWP dengan memanfaatkan interoperabilitas database NIB/OSS.\n2. Transparansi SLA: Pasang Countdown Timer SLA 3 hari kerja di dashboard INATRADE dengan penanda warna status pemrosesan.\n3. Standardisasi catatan revisi: Buat dropdown checklist catatan penolakan spesifik agar pemohon mengetahui secara presisi perbaikan yang dibutuhkan.',
      prototype: 'Modul Transparansi SLA Countdown & Standarisasi Notifikasi Revisi INATRADE — Penanggung Jawab: Ditjen Perdagangan Luar Negeri & Tim Pengawasan Itjen Kemendag.'
    },
    evidences: [...SAMPLE_EVIDENCES]
  },
  pengaduan: {
    sessionId: 'ITJEN-PKTN-2025-02',
    unit: 'Direktorat Pemberdayaan Konsumen / Ditjen Perlindungan Konsumen dan Tertib Niaga (PKTN)',
    service: 'Layanan Pengaduan Konsumen & Penyelesaian Sengketa Niaga Kemendag',
    auditor: 'Tim Evaluator Inspektorat Jenderal Kementerian Perdagangan',
    period: 'Semester I - 2025',
    modelId: 'activator',
    personaName: 'Budi Santoso',
    personaRole: 'Konsumen Pengguna Transaksi Perdagangan Digital (E-Commerce)',
    personaLiteracy: 'Sedang (Terbiasa aplikasi pesan singkat/WhatsApp, belum familier portal perizinan teknis Kemendag)',
    personaGoal: 'Melaporkan kerugian akibat barang yang dibeli secara daring tidak sesuai spesifikasi dan memperoleh mediasi resmi Kemendag agar pelaku usaha bertanggung jawab.',
    stages: [
      {
        id: 'stage-1',
        code: 'Tahap 1',
        name: 'Awareness',
        subtitle: 'Pencarian Kanal Pengaduan Resmi Kemendag',
        action: 'Mencari tahu kontak pengaduan konsumen Ditjen PKTN melalui pencarian Google dan akun media sosial resmi Kementerian Perdagangan.',
        touchpoint: 'Portal konsumen.kemendag.go.id, Akun Instagram @kemendag, WhatsApp Pengaduan',
        response: 'Menyediakan tautan formulir pengaduan konsumen dan nomor WhatsApp layanan resmi Ditjen PKTN.',
        burden: 'Terdapat nomor kontak call center dan WhatsApp berbeda di postingan lama yang sudah tidak aktif.',
        learning: true,
        compliance: false,
        psychological: false,
        emotion: -1,
        opportunity: 'Integrasikan satu nomor tunggal WhatsApp resmi Ditjen PKTN bercentang hijau pada seluruh materi sosialisasi.'
      },
      {
        id: 'stage-2',
        code: 'Tahap 2',
        name: 'Access',
        subtitle: 'Pengisian Formulir Kronologi Aduan',
        action: 'Mengakses formulir pengaduan daring di ponsel dan menuliskan identitas penjual, platform dagang, serta kronologi kerugian.',
        touchpoint: 'Aplikasi Form Pengaduan Konsumen Ramah Ponsel',
        response: 'Menerbitkan nomor tiket pengaduan konsumen dan mengirimkan salinan ringkasan aduan ke email pelapor.',
        burden: 'Akses pendaftaran laporan mudah dan tidak dipersulit dengan syarat identitas yang berlebihan.',
        learning: false,
        compliance: false,
        psychological: false,
        emotion: 1,
        opportunity: 'Sediakan opsi pelaporan cepat (quick report) melalui chat WhatsApp interaktif.'
      },
      {
        id: 'stage-3',
        code: 'Tahap 3',
        name: 'Application',
        subtitle: 'Pengunggahan Bukti Transaksi & Kerugian',
        action: 'Melampirkan bukti tangkapan layar transaksi e-commerce, resi pengiriman, dan bukti komunikasi dengan penjual.',
        touchpoint: 'Modul Lampiran Bukti Aduan',
        response: 'Sistem memverifikasi kelengkapan bukti dan mengelompokkan kategori pelanggaran (penipuan, barang cacat, periklanan menyesatkan).',
        burden: 'Batas ukuran unggahan gambar cukup luas dan dapat melampirkan format PDF/JPG dengan lancar.',
        learning: false,
        compliance: false,
        psychological: false,
        emotion: 1,
        opportunity: 'Tambahkan konfirmasi otomatis bahwa data pelapor dijamin kerahasiaannya sesuai UU Perlindungan Data Pribadi.'
      },
      {
        id: 'stage-4',
        code: 'Tahap 4',
        name: 'Processing',
        subtitle: 'Klarifikasi & Mediasi Tim Pengawas PKTN',
        action: 'Menunggu proses klarifikasi oleh petugas analis pengaduan konsumen dan pemanggilan pihak pelaku usaha niaga.',
        touchpoint: 'Dashboard Status Pengaduan Konsumen & Notifikasi Email',
        response: 'Petugas menghubungi pelaku usaha niaga dan platform lokapasar untuk meminta konfirmasi tindak lanjut ganti rugi.',
        burden: 'Pelapor tidak menerima kabar pembaruan selama 10 hari kerja setelah nomor tiket diterbitkan sehingga merasa aduannya diabaikan.',
        learning: false,
        compliance: false,
        psychological: true,
        emotion: -2,
        opportunity: 'Wajibkan pembaruan status berkala minimal tiap 3 hari kerja ke WhatsApp pelapor secara otomatis dari sistem pengaduan.'
      },
      {
        id: 'stage-5',
        code: 'Tahap 5',
        name: 'Resolution',
        subtitle: 'Penyelesaian Ganti Rugi / Pengembalian Dana',
        action: 'Menerima berita acara kesepakatan penyelesaian sengketa dan pengembalian dana (refund) dari pelaku usaha yang difasilitasi Kemendag.',
        touchpoint: 'Surat Hasil Penanganan Ditjen PKTN & Transfer Pengembalian Dana',
        response: 'Menyampaikan hasil mediasi tertulis dan memastikan hak konsumen telah dipenuhi oleh pelaku usaha terkait.',
        burden: 'Penyelesaian difasilitasi dengan baik oleh petugas Kemendag dan konsumen berhasil memperoleh hak ganti rugi.',
        learning: false,
        compliance: false,
        psychological: false,
        emotion: 2,
        opportunity: 'Kirimkan kuesioner singkat 1-klik untuk menilai kepuasan penanganan mediasi pengaduan.'
      },
      {
        id: 'stage-6',
        code: 'Tahap 6',
        name: 'Post-Service',
        subtitle: 'Edukasi Hak Konsumen & Survei Layanan',
        action: 'Mengisi survei kepuasan penanganan pengaduan dan membaca tips belanja aman di era digital.',
        touchpoint: 'Tautan Survei Kepuasan Ditjen PKTN',
        response: 'Merekam umpan balik kepuasan dan menyajikan buletin konsumen cerdas.',
        burden: 'Survei sangat singkat (hanya 3 pertanyaan) dan tidak membebani waktu warga.',
        learning: false,
        compliance: false,
        psychological: false,
        emotion: 2,
        opportunity: 'Gunakan data tren pengaduan sebagai masukan audit kepatuhan pelaku usaha niaga berkala oleh Itjen Kemendag.'
      }
    ],
    coDesign: {
      discovery: 'Kelemahan paling menonjol pada penanganan pengaduan konsumen berada pada Tahap 4 (ketiadaan kabar perkembangan mediasi selama lebih dari 7-10 hari kerja, menyebabkan beban psikologis dan hilangnya kepercayaan konsumen terhadap peran pemerintah).',
      ideation: '1. Kanal Tunggal: Tetapkan 1 nomor WhatsApp resmi Ditjen PKTN bercentang hijau untuk melayani dan memantau status tiket aduan.\n2. Auto-Update SLA: Sistem mengirimkan progres otomatis maksimal 72 jam sekali kepada pelapor.\n3. Eskalasi Cepat: Hubungkan langsung sistem pengaduan Kemendag dengan contact center platform e-commerce terdaftar.',
      prototype: 'Bot Notifikasi Progres Penanganan Pengaduan Konsumen PKTN via WhatsApp — Penanggung Jawab: Ditjen PKTN & Tim Evaluator Itjen Kemendag.'
    }
  },
  bantuan: {
    sessionId: 'ITJEN-DJPEN-2025-03',
    unit: 'Direktorat Jenderal Pengembangan Ekspor Nasional (DJPEN)',
    service: 'Layanan Kurasi & Fasilitasi Paviliun Pameran Dagang Internasional bagi UMKM Siap Ekspor',
    auditor: 'Tim Evaluator Inspektorat Jenderal Kementerian Perdagangan',
    period: 'Tahun Anggaran 2025',
    modelId: 'funder',
    personaName: 'Siti Aminah',
    personaRole: 'Pemilik Usaha Mikro Kerajinan Kriya Ramah Lingkungan',
    personaLiteracy: 'Sedang (Terbiasa aplikasi pesan singkat/WhatsApp, belum familier portal perizinan teknis Kemendag)',
    personaGoal: 'Mendaftarkan produk kerajinan daerah untuk lolos kurasi booth pameran dagang internasional Trade Expo Indonesia tanpa dipungut biaya dan memperoleh akses pembeli (buyer) mancanegara.',
    stages: [
      {
        id: 'stage-1',
        code: 'Tahap 1',
        name: 'Awareness',
        subtitle: 'Penerimaan Informasi Program Fasilitasi Pameran',
        action: 'Melihat pengumuman pendaftaran kurasi paviliun UMKM binaan Kemendag untuk pameran internasional melalui media sosial Kemendag dan grup komunitas perajin.',
        touchpoint: 'Portal djpen.kemendag.go.id, Akun Media Sosial @kemendag & @djpen.kemendag',
        response: 'Menyebarkan brosur elektronik dan tautan formulir pendaftaran kurasi calon peserta pameran.',
        burden: 'Persyaratan sertifikasi internasional dan kriteria produk lolos kurasi pada brosur belum dijelaskan secara rinci.',
        learning: true,
        compliance: false,
        psychological: false,
        emotion: -1,
        opportunity: 'Sediakan infografis panduan mandiri (self-assessment checklist) kelayakan ekspor sebelum mendaftar.'
      },
      {
        id: 'stage-2',
        code: 'Tahap 2',
        name: 'Access',
        subtitle: 'Pendaftaran Daring Akun Peserta Kurasi',
        action: 'Membuka formulir pendaftaran daring dan memasukkan data izin usaha (NIB) serta profil produk kerajinan.',
        touchpoint: 'Portal Registrasi Eksportir DJPEN Kemendag',
        response: 'Sistem mengirimkan konfirmasi pendaftaran peserta kurasi dan jadwal pengiriman sampel produk.',
        burden: 'Formulir daring cukup responsif dan petunjuk pengisian cukup jelas.',
        learning: false,
        compliance: false,
        psychological: false,
        emotion: 1,
        opportunity: 'Sediakan fitur simpan otomatis di setiap tahap pengisian formulir.'
      },
      {
        id: 'stage-3',
        code: 'Tahap 3',
        name: 'Application',
        subtitle: 'Pengunggahan Katalog Produk & Pengiriman Sampel',
        action: 'Mengunggah foto resolusi tinggi katalog produk, daftar harga FOB (Free on Board), serta mengirimkan fisik sampel produk ke kantor Kemendag.',
        touchpoint: 'Modul Unggah Dokumen Ekspor & Loket Penerimaan Sampel DJPEN',
        response: 'Petugas kurator Kemendag menerima sampel fisik dan memberikan tanda terima dokumen kurasi.',
        burden: 'Format perhitungan harga ekspor (FOB/CIF) membingungkan bagi pelaku usaha mikro yang belum pernah menghitung biaya logistik kontainer.',
        learning: true,
        compliance: true,
        psychological: false,
        emotion: -1,
        opportunity: 'Sediakan kalkulator digital simulasi harga ekspor FOB/CIF sederhana pada formulir pendaftaran.'
      },
      {
        id: 'stage-4',
        code: 'Tahap 4',
        name: 'Processing',
        subtitle: 'Sidang Kurasi Produk oleh Tim Pakar Ekspor',
        action: 'Menunggu hasil penilaian kurasi kelayakan kemasan, kapasitas produksi, dan potensi pasar negara tujuan.',
        touchpoint: 'Pengumuman Status Seleksi Kurasi Online',
        response: 'Tim kurator independen dan atase perdagangan menyeleksi 50 produk terbaik untuk difasilitasi pameran.',
        burden: 'Jadwal pengumuman hasil kurasi sempat tertunda tanpa adanya pemberitahuan resmi di website, membuat peserta cemas.',
        learning: false,
        compliance: false,
        psychological: true,
        emotion: -1,
        opportunity: 'Pasang jadwal tahapan kurasi yang diperbarui secara realtime dan kirimkan pengumuman serentak via email/pesan singkat.'
      },
      {
        id: 'stage-5',
        code: 'Tahap 5',
        name: 'Resolution',
        subtitle: 'Penetapan Peserta Lolos & Fasilitasi Booth Pameran',
        action: 'Menerima surat keputusan penetapan peserta paviliun Kemendag dan menghadiri pembekalan teknis pameran.',
        touchpoint: 'Lokasi Pameran Trade Expo Indonesia (ICE BSD / Luar Negeri)',
        response: 'Menyediakan booth pameran gratis berstandar internasional lengkap dengan fasilitas penerjemah dan katalog promosi.',
        burden: 'Fasilitasi booth sangat profesional dan membantu perajin lokal bertemu langsung dengan calon pembeli dari luar negeri.',
        learning: false,
        compliance: false,
        psychological: false,
        emotion: 2,
        opportunity: 'Pertahankan kualitas fasilitasi booth dan optimalkan business matching terjadwal dengan buyers terverifikasi.'
      },
      {
        id: 'stage-6',
        code: 'Tahap 6',
        name: 'Post-Service',
        subtitle: 'Pencatatan Transaksi & Pendampingan Kontrak Dagang',
        action: 'Melaporkan potensi nilai transaksi dagang (letter of intent) dan mengikuti tindak lanjut negosiasi kontrak ekspor.',
        touchpoint: 'Klinik Ekspor / Fasilitasi Negosiasi Kontrak Dagang DJPEN',
        response: 'Memberikan pendampingan hukum perjanjian dagang internasional dan pemantauan realisasi ekspor.',
        burden: 'Pendampingan tindak lanjut kontrak sangat membantu perajin memahami klausul letter of credit (L/C).',
        learning: false,
        compliance: false,
        psychological: false,
        emotion: 2,
        opportunity: 'Jadikan fasilitasi kontrak dagang sebagai layanan terpadu satu pintu bersama Atase Perdagangan dan ITPC di luar negeri.'
      }
    ],
    coDesign: {
      discovery: 'Pelaku usaha mikro mengalami kendala teknis pada Tahap 3 dalam penyusunan kalkulasi harga ekspor (FOB/CIF) serta ketidakpastian pengumuman hasil kurasi di Tahap 4.',
      ideation: '1. Sediakan kalkulator instan estimasi harga ekspor FOB di portal DJPEN.\n2. Publikasikan kalender kurasi tahunan dan notifikasi kelulusan via WhatsApp.\n3. Terbitkan umpan balik kurasi (feedback kurator) bagi peserta yang belum lolos agar dapat memperbaiki kualitas produknya.',
      prototype: 'Formulir Kurasi Digital & Kalkulator Harga Ekspor Interaktif DJPEN — Penanggung Jawab: Ditjen Pengembangan Ekspor Nasional & Tim Evaluator Itjen Kemendag.'
    }
  },
  kependudukan: {
    sessionId: 'ITJEN-PDN-2025-04',
    unit: 'Direktorat Bina Usaha Perdagangan / Ditjen Perdagangan Dalam Negeri',
    service: 'Layanan Penerbitan Surat Tanda Pendaftaran Waralaba (STPW) secara Elektronik',
    auditor: 'Tim Evaluator Inspektorat Jenderal Kementerian Perdagangan',
    period: 'Tahun 2025',
    modelId: 'performance',
    personaName: 'Andi Pratama',
    personaRole: 'Pelaku Usaha Waralaba Nasional (Franchisor Makanan & Minuman)',
    personaLiteracy: 'Tinggi (Terbiasa menggunakan sistem perizinan daring INATRADE/SINSW, SaaS, dan format dokumen digital)',
    personaGoal: 'Menerbitkan Surat Tanda Pendaftaran Waralaba (STPW) secara cepat, tanpa birokrasi berbelit, dan terverifikasi secara digital untuk legalitas ekspansi gerai.',
    stages: [
      {
        id: 'stage-1',
        code: 'Tahap 1',
        name: 'Awareness',
        subtitle: 'Pengecekan Syarat Prospektus Waralaba',
        action: 'Mengecek syarat pendaftaran prospektus penawaran waralaba dan STPW melalui portal Ditjen PDN.',
        touchpoint: 'Portal Informasi Perizinan Usaha Dagang Kemendag',
        response: 'Menampilkan pedoman format prospektus dan persyaratan HAKI merek dagang.',
        burden: 'Informasi daftar persyaratan terstruktur rapi dan mudah diunduh.',
        learning: false,
        compliance: false,
        psychological: false,
        emotion: 1,
        opportunity: 'Sediakan templat standar prospektus penawaran waralaba siap pakai.'
      },
      {
        id: 'stage-2',
        code: 'Tahap 2',
        name: 'Access',
        subtitle: 'Login & Validasi Akun Melalui OSS',
        action: 'Masuk ke sistem perizinan terintegrasi dengan kredensial akun NIB tunggal.',
        touchpoint: 'Sistem Terintegrasi OSS - Kemendag',
        response: 'Sistem mengenali KBLI waralaba dan membuka modul permohonan STPW.',
        burden: 'Integrasi Single Sign-On (SSO) berjalan lancar.',
        learning: false,
        compliance: false,
        psychological: false,
        emotion: 2,
        opportunity: 'Pertahankan performa integrasi API OSS-Kemendag.'
      },
      {
        id: 'stage-3',
        code: 'Tahap 3',
        name: 'Application',
        subtitle: 'Pengunggahan Dokumen HAKI & Perjanjian Waralaba',
        action: 'Mengunggah sertifikat merek dagang Ditjen KI, contoh perjanjian waralaba, dan laporan keuangan 2 tahun terakhir.',
        touchpoint: 'Formulir Unggah Berkas STPW Daring',
        response: 'Sistem menerima berkas dan memeriksa kelengkapan administratif.',
        burden: 'Proses unggah file lancar tanpa batasan ukuran yang memberatkan.',
        learning: false,
        compliance: false,
        psychological: false,
        emotion: 2,
        opportunity: 'Integrasikan validasi sertifikat merek secara otomatis dengan database Kemenkumham (Ditjen KI).'
      },
      {
        id: 'stage-4',
        code: 'Tahap 4',
        name: 'Processing',
        subtitle: 'Verifikasi Substantif & Validasi Komposisi Produk Dalam Negeri',
        action: 'Menunggu penelaahan syarat penggunaan barang/jasa dalam negeri minimal 80% pada jaringan gerai waralaba.',
        touchpoint: 'Dashboard Status Permohonan STPW',
        response: 'Verifikator memeriksa kepatuhan tingkat komponen dalam negeri (TKDN) gerai waralaba.',
        burden: 'Pemeriksaan kepatuhan produk dalam negeri membutuhkan waktu 7 hari kerja tanpa estimasi penyelesaian pasti.',
        learning: false,
        compliance: true,
        psychological: true,
        emotion: -1,
        opportunity: 'Tampilkan status persentase kelengkapan verifikasi dan jadwal SLA yang tegas.'
      },
      {
        id: 'stage-5',
        code: 'Tahap 5',
        name: 'Resolution',
        subtitle: 'Penerbitan STPW Elektronik ber-QR Code',
        action: 'Menerima dan mengunduh STPW digital yang telah ditandatangani secara elektronik.',
        touchpoint: 'Sistem Penerbitan Dokumen Digital Kemendag',
        response: 'Menerbitkan STPW resmi dengan tanda tangan elektronik bersertifikasi BSrE.',
        burden: 'Dokumen izin diterbitkan dalam format PDF resmi dengan kode QR verifikasi instan.',
        learning: false,
        compliance: false,
        psychological: false,
        emotion: 2,
        opportunity: 'Kirim notifikasi otomatis saat masa berlaku STPW mendekati 5 tahun untuk perpanjangan berkala.'
      },
      {
        id: 'stage-6',
        code: 'Tahap 6',
        name: 'Post-Service',
        subtitle: 'Pelaporan Perkembangan Gerai Tahunan',
        action: 'Menyampaikan laporan berkala pembukaan gerai baru waralaba secara mandiri di sistem.',
        touchpoint: 'Modul Pelaporan Kepatuhan Waralaba',
        response: 'Mencatat pertumbuhan jaringan waralaba dan memberikan sertifikat kepatuhan tahunan.',
        burden: 'Pelaporan tahunan secara digital sangat menghemat waktu pengusaha.',
        learning: false,
        compliance: false,
        psychological: false,
        emotion: 2,
        opportunity: 'Berikan penghargaan (Franchise Award) bagi waralaba yang tertib lapor dan menyerap produk UMKM lokal.'
      }
    ],
    coDesign: {
      discovery: 'Model Performance Designer pada layanan STPW telah berjalan cukup efisien, dengan ruang perbaikan pada percepatan verifikasi kepatuhan produk dalam negeri di Tahap 4.',
      ideation: '1. Integrasi otomatis verifikasi sertifikat HAKI dengan database Kemenkumham.\n2. Terapkan SLA Countdown 5 hari kerja untuk verifikasi substantif prospektus.\n3. Fitur pengingat otomatis perpanjangan STPW.',
      prototype: 'Dashboard Integrasi Validasi HAKI & Pelacak STPW Digital — Penanggung Jawab: Ditjen Perdagangan Dalam Negeri & Tim Evaluator Itjen Kemendag.'
    }
  },
  kosong: {
    sessionId: 'ITJEN-CJM-2025-99',
    unit: 'Unit Penyelenggara Layanan Teknis - Kementerian Perdagangan',
    service: '',
    auditor: 'Tim Evaluator Inspektorat Jenderal Kementerian Perdagangan',
    period: '2025',
    modelId: 'guardian',
    personaName: '',
    personaRole: '',
    personaLiteracy: 'Sedang (Terbiasa aplikasi pesan singkat/WhatsApp, belum familier portal perizinan teknis Kemendag)',
    personaGoal: '',
    stages: [
      {
        id: 'stage-1',
        code: 'Tahap 1',
        name: 'Awareness',
        subtitle: 'Pencarian Informasi Awal',
        action: '',
        touchpoint: '',
        response: '',
        burden: '',
        learning: false,
        compliance: false,
        psychological: false,
        emotion: 0,
        opportunity: ''
      },
      {
        id: 'stage-2',
        code: 'Tahap 2',
        name: 'Access',
        subtitle: 'Akses & Pendaftaran Akun',
        action: '',
        touchpoint: '',
        response: '',
        burden: '',
        learning: false,
        compliance: false,
        psychological: false,
        emotion: 0,
        opportunity: ''
      },
      {
        id: 'stage-3',
        code: 'Tahap 3',
        name: 'Application',
        subtitle: 'Pengisian Permohonan & Berkas',
        action: '',
        touchpoint: '',
        response: '',
        burden: '',
        learning: false,
        compliance: false,
        psychological: false,
        emotion: 0,
        opportunity: ''
      },
      {
        id: 'stage-4',
        code: 'Tahap 4',
        name: 'Processing',
        subtitle: 'Verifikasi & Pemrosesan Berkas',
        action: '',
        touchpoint: '',
        response: '',
        burden: '',
        learning: false,
        compliance: false,
        psychological: false,
        emotion: 0,
        opportunity: ''
      },
      {
        id: 'stage-5',
        code: 'Tahap 5',
        name: 'Resolution',
        subtitle: 'Penerbitan Hasil Layanan / Dokumen',
        action: '',
        touchpoint: '',
        response: '',
        burden: '',
        learning: false,
        compliance: false,
        psychological: false,
        emotion: 0,
        opportunity: ''
      },
      {
        id: 'stage-6',
        code: 'Tahap 6',
        name: 'Post-Service',
        subtitle: 'Pasca-Layanan & Evaluasi Pengguna',
        action: '',
        touchpoint: '',
        response: '',
        burden: '',
        learning: false,
        compliance: false,
        psychological: false,
        emotion: 0,
        opportunity: ''
      }
    ],
    coDesign: {
      discovery: '',
      ideation: '',
      prototype: ''
    }
  }
};
