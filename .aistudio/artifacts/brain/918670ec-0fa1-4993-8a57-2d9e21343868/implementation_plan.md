# Rencana Implementasi: Transformasi Antarmuka Modern (Floating Pill Rail & Kemendag Executive Shell)

## 1. User Intent & Product Scope
Berdasarkan preferensi pengguna dan referensi desain visual yang dilampirkan:
* **Struktur Tata Letak Utama**: Mengadopsi arsitektur **Floating Pill Rail** (seperti referensi gambar kedua) dipadukan dengan **Floating Rounded App Canvas** (`rounded-3xl` berlatar belakang luar *soft cool-gray* `#E9EEF4`).
* **Pendekatan Visual & Palet Warna**: **Modern Clean Kemendag** dengan warna primer *Kemendag Deep Navy* (`#0B1C3D`), aksen *Gold/Amber Hairline* (`#D97706` / `#F59E0B`), kartu permukaan putih bersih (`#FFFFFF`), aksen *Emerald* untuk indikator kepatuhan/efisiensi, serta *Rose/Crimson* untuk beban administratif kritis.
* **Integritas Fungsional**: Seluruh alur kerja evaluasi 3-fase, taksonomi 5 model layanan yang telah dikoreksi, kanvas CJM, radar analitik Recharts, pelacak bukti lapangan, serta ekspor resmi PDF & Excel tetap dipertahankan 100% aktif dan terintegrasi.

---

## 2. Domain-Specific Design & Execution Architecture

### A. Layout Structure & Spatial Math
* **Outer Shell**: Latar belakang aplikasi menggunakan warna kanvas modern *light grayish-blue* (`bg-[#eef2f7]`) dengan padding luar fleksibel (`p-3 sm:p-5 lg:p-6`).
* **Floating Pill Rail (Navigasi Sisi Kiri Ramping)**:
  - Sidebar ramping mengambang (`w-18` atau `w-20` pada desktop) dengan radius membulat (`rounded-2xl` / `rounded-3xl`), latar belakang putih dengan bayangan lembut (`shadow-md border border-slate-200/80`).
  - Posisi atas: Logo resmi Itjen Kemendag tersemat sebagai jangkar identitas kementerian.
  - Bagian tengah: Tombol navigasi ikon ramping vertikal untuk:
    1. **Fase I**: Identifikasi & Profil Model Layanan (`Building2` / `UserCheck`)
    2. **Fase II**: Kanvas Pengujian Perjalanan CJM (`Layers` / `Activity`)
    3. **Fase III**: Rencana Co-Design & Laporan Resmi (`FileText` / `CheckCircle2`)
    4. **Pelacak Bukti Lapangan**: Modal repository bukti foto & dokumen (`Camera`)
    5. **Dashboard Analitik**: Visualisasi radar beban & fluktuasi skor (`BarChart3`)
  - Posisi bawah: Aksi cepat ekspor berkas (`Download` / `FileSpreadsheet` / `Printer`).
* **Floating White App Canvas (Viewport Utama)**:
  - Kontainer putih utama berbingkai membulat (`rounded-2xl lg:rounded-3xl shadow-sm border border-slate-200/80 bg-white overflow-hidden flex flex-col min-h-[calc(100vh-3rem)]`).
* **Top Header Bar**:
  - Header ramping terintegrasi di bagian atas kanvas putih:
    - *Breadcrumbs / Stage Stepper*: Fase aktif dengan teks rapi dan waktu *auto-save* (`Tersimpan Otomatis`).
    - *Docket Selector*: Pemilihan studi kasus cepat (INATRADE, Pengaduan PKTN, Pameran Ekspor, STPW, Kanvas Baru).
    - *Executive Actions*: Tombol ekspor instan (Unduh PDF Resmi, Ekstrak Excel, Cetak Langsung).

### B. Typography & Color Strategies
* **Font Family**: `Plus Jakarta Sans` untuk struktur antarmuka, judul, dan kartu interaktif; `JetBrains Mono` dengan fitur `tabular-nums` untuk penomoran tahap, skor emosi, metrik beban, dan tanggal.
* **Color Palette (Modern Clean Kemendag)**:
  - *Navy Core*: `#0B1C3D` (Aksen utama, teks judul, tombol primer).
  - *Kemendag Crimson & Gold*: `#C81E25` dan `#D97706` (Garis aksen hairline tipis 1px dan indikator fokus).
  - *Surface*: `#FFFFFF` untuk kartu data, `#F8FAFC` untuk area formulir, `#EEF2F7` untuk bingkai luar.
  - *Semantic Alerts*: Emerald (`#059669`) untuk skor positif, Rose (`#E11D48`) untuk titik beban kritis.

---

## 3. Feature Specifications & User Journey

1. **Perombakan Layout Induk (`src/App.tsx`)**:
   - Memindahkan struktur header horizontal lama menjadi kombinasi **Floating Pill Rail** di sisi kiri dan **Floating White Canvas** di sisi kanan.
   - Tetap mendukung responsivitas *mobile drawer / bottom dock* pada layar kecil (`< 1024px`) agar evaluator di lapangan tetap nyaman menggunakan tablet/ponsel.
2. **Penyelarasan Header Kanvas (`src/components/Header.tsx` / `ModernHeader.tsx`)**:
   - Menata ulang header di dalam kanvas putih agar menyatu dengan gaya dashboard modern: bilah pencarian/pemilihan studi kasus, indikator tahapan (Fase I ➔ Fase II ➔ Fase III) berdesain minimalis tanpa elemen kaku, dan tombol ekspor.
3. **Penyempurnaan Tampilan Kartu 5 Model Layanan (Fase I)**:
   - Mengadopsi kartu *soft modern* dengan radius halus dan hover micro-interaction.
   - Tetap mempertahankan data contoh Kemendag terkoreksi (INATRADE, e-COO/SKA, PPEI ECP, Paviliun Indonesia DJPEN, Lab BPMB Ciracas, dll.).
4. **Penyempurnaan Kanvas CJM (Fase II)**:
   - Panel kurva pengalaman warga (`EmotionChart`) dan kartu tahapan berdesain modern *clean-cut* selaras dengan referensi visual.
   - Menu templat tahapan dan pelacak bukti lapangan tersaji harmonis di dalam kanvas.
5. **Penyempurnaan Laporan Co-Design & Dashboard (Fase III)**:
   - Visualisasi radar analitik Recharts dan lembar kerja cetak A4 landscape tetap presisi dan siap cetak/ekspor PDF/Excel tanpa distorsi.

---

## 4. Technical Architecture & File Changes

* **`src/index.css`**: Menambahkan utility class untuk floating layout shell, custom scrollbar, dan transisi smooth navigasi pill.
* **`src/components/FloatingNavRail.tsx`** *(Komponen Baru)*: Komponen floating pill dock vertikal yang memuat logo Itjen Kemendag, navigasi Fase I–III, tombol bukti lapangan, dan pemilih berkas cepat.
* **`src/components/ModernCanvasHeader.tsx`** *(Penyempurnaan Header)*: Header ringkas di dalam kanvas putih yang mengelola aksi ekspor, status berkas, dan stepper fase yang elegan.
* **`src/App.tsx`**: Mengintegrasikan layout shell baru (`FloatingNavRail` + `ModernCanvasHeader` + Main Viewport).
* **`src/components/Step1Profile.tsx`**, **`Step2CJMCanvas.tsx`**, **`Step3Report.tsx`**: Memastikan seluruh container padding dan border radius harmonis dengan gaya floating canvas `rounded-2xl`/`rounded-3xl`.

---

## 5. Verification & Testing Plan
* **Linting & TypeScript Compilation**: Menjalankan `lint_applet` (`tsc --noEmit`) untuk memastikan tidak ada kesalahan tipe atau impor.
* **Build Verification**: Menjalankan `compile_applet` untuk memastikan bundel Vite berhasil dikompilasi tanpa error.
* **Responsiveness & Cross-Device Audit**: Memastikan layout floating pill rail beradaptasi secara mulus ke navigasi ringkas pada resolusi desktop (1440px), laptop (1280px), dan mobile/tablet (< 1024px).
* **Fungsionalitas Ekspor & Cetak**: Memverifikasi tombol *Unduh PDF*, *Ekstrak Excel*, dan dialog cetak peramban tetap menghasilkan dokumen formal yang rapi.
