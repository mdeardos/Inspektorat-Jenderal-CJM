# Instrumen Evaluasi Pelayanan Publik Berbasis Citizen-Centric (CJM & Audit 5C)
### Inspektorat Jenderal Kementerian Perdagangan Republik Indonesia

Instrumen Kertas Kerja Evaluasi Pelayanan Publik Citizen-Centric adalah aplikasi berbasis web yang dirancang khusus untuk auditor dan evaluator Inspektorat Jenderal Kementerian Perdagangan RI. Sistem ini mengintegrasikan metodologi **Customer Journey Mapping (CJM)**, **Pengurangan Beban Administratif (Administrative Burden Reduction)**, dan **Kerangka Kerja Pengawasan Internal 5C (Condition, Criteria, Cause, Consequence, Corrective Action)** sesuai standar IPPF IIA dan COSO.

---

## 🏛️ Fitur Utama

### 1. Fase I: Identifikasi Objek & Taksonomi 5 Model Layanan Publik
- Pemilihan objek pengawasan di lingkungan unit kerja Kemendag (Ditjen Daglu, Ditjen PKTN, DJPEN, Ditjen PDN, Bappebti).
- Klasifikasi 5 Model Layanan Publik (Guardian, Performance, Activator, Funder, Yield) untuk menentukan titik fokus pengujian.
- Profiling Persona Pengguna (Citizen/Pelaku Usaha) beserta parameter literasi digital dan ekspektasi perizinan.

### 2. Fase II: Kanvas Pengujian Perjalanan (CJM) & Matriks Audit 5C
- **Connected Journey Rail**: Navigasi tahapan horizontal yang intuitif dengan indikator sentimen dan bukti lapangan.
- **Executive KPI Ribbon**: Pemantauan langsung titik kritis (friction points), akumulasi 3 beban administratif (Learning, Compliance, Psychological), dan rerata skor kepuasan.
- **Kurva Pengalaman Warga (Experience Curve)**: Visualisasi fluktuasi kepuasan dari skala -2 (Sangat Sulit) hingga +2 (Sangat Puas).
- **Kertas Kerja Audit 5C Terintegrasi**: Formulasi temuan audit terstruktur:
  - **Condition**: Fakta operasional empiris di lapangan.
  - **Criteria**: Standar regulasi Permendag dan SOP unit kerja.
  - **Cause**: Akar penyebab kegagalan pengendalian internal.
  - **Consequence**: Dampak terhadap waktu tunggu dan biaya logistik pelaku usaha.
  - **Corrective Action**: Rekomendasi tindakan korektif konkret dan terukur.
- **Pelacak Bukti Visual (Evidence Tracker)**: Lampiran tangkapan layar sistem INATRADE/SINSW, foto antrean loket, atau dokumen fisik.

### 3. Fase III: Rencana Aksi Co-Design & Pengesahan Dokumen
- Penarikan otomatis temuan titik kritis dari Kanvas CJM ke lembar kerja Co-Design (Discovery, Ideation, Action).
- Radar beban administratif dan visualisasi distribusi beban interaktif.
- Lembar Pengesahan Formal Pengendali Teknis dan Inspektur Wilayah.
- Ekspor multi-format siap cetak:
  - **Laporan Resmi PDF (Vektor Presisi Standar A4 Landscape)**
  - **Kertas Kerja Excel (.xlsx)**
  - **Cetak Langsung Dialog Peramban**
  - **Impor & Ekspor Cadangan Data JSON**

---

## 🛠️ Arsitektur Teknologi

- **Frontend Core**: React 19, TypeScript
- **Styling & Tokens**: Tailwind CSS v4, Plus Jakarta Sans, JetBrains Mono
- **Visualisasi & Diagram**: Recharts, SVG Bezier Spline Engine
- **Mesin Ekspor**: jsPDF, XLSX (SheetJS)
- **Komponen Ikon**: Lucide React
- **Standar Aksesibilitas**: WCAG AA High Contrast, Mobile Touch Optimized

---

## 🚀 Menjalankan Aplikasi Secara Lokal

Pastikan Node.js (v18+) atau Bun telah terpasang di komputer Anda.

```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan server pengembangan
npm run dev

# 3. Buka peramban di http://localhost:5173
```

---

## 📋 Standar Tata Kelola & Referensi Regulasi
1. **IPPF (International Professional Practices Framework) - The Institute of Internal Auditors (IIA)**.
2. **COSO Internal Control - Integrated Framework**.
3. **Undang-Undang Nomor 25 Tahun 2009 tentang Pelayanan Publik**.
4. **Peraturan Menteri Perdagangan RI terkait Standar Operasional Prosedur Layanan Perizinan dan Ekspor-Impor**.

---
*Inspektorat Jenderal Kementerian Perdagangan Republik Indonesia &copy; 2025. Seluruh Hak Cipta Dilindungi.*
