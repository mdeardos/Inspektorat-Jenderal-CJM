import * as XLSX from 'xlsx';
import { EvaluationState, AuditEvidence } from '../types';
import { SERVICE_MODELS } from '../data/presets';
import { getResolvedSignatory } from './signatoryHelpers';

export interface GenerateExcelOptions {
  filename?: string;
  onSuccess?: () => void;
  onError?: (err: any) => void;
}

export function generateOfficialExcel(
  state: EvaluationState,
  options: GenerateExcelOptions = {}
): boolean {
  try {
    const selectedModel = SERVICE_MODELS.find(m => m.id === state.modelId) || SERVICE_MODELS[0];
    const cleanServiceName = (state.service || 'Layanan_Kemendag').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 35);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = options.filename || `Kertas_Kerja_CJM_Itjen_Kemendag_${cleanServiceName}_${dateStr}.xlsx`;

    // Initialize Workbook
    const wb = XLSX.utils.book_new();

    // ==========================================
    // SHEET 1: MATRIKS CJM & EVALUASI BEBAN
    // ==========================================
    const matrixRows: any[][] = [];

    // Agency & Document Letterhead
    matrixRows.push(['KEMENTERIAN PERDAGANGAN REPUBLIK INDONESIA']);
    matrixRows.push(['INSPEKTORAT JENDERAL']);
    matrixRows.push(['KERTAS KERJA EVALUASI PELAYANAN PUBLIK CITIZEN-CENTRIC']);
    matrixRows.push(['Customer Journey Mapping (CJM) & Pengurangan Beban Administratif']);
    matrixRows.push([]); // Blank separator

    // Metadata Block
    matrixRows.push(['OBJEK EVALUASI', '']);
    if (state.sessionId) {
      matrixRows.push(['ID Sesi / Kode Proyek', state.sessionId]);
    }
    matrixRows.push(['Unit Penyelenggara', state.unit || '-']);
    matrixRows.push(['Nama Layanan', state.service || '-']);
    matrixRows.push(['Model Layanan', `${selectedModel.name} (${selectedModel.category})`]);
    matrixRows.push(['Peran Unit Layanan', selectedModel.roleIndo]);
    matrixRows.push(['Karakteristik Model', selectedModel.shortDefinition]);
    matrixRows.push(['Tim Evaluator', state.auditor || 'Tim Evaluator Inspektorat Jenderal']);
    matrixRows.push(['Periode Evaluasi', state.period || 'Tahun 2025']);
    matrixRows.push(['Tanggal Ekspor', new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })]);
    matrixRows.push([]);

    matrixRows.push(['PROFIL PERSONA WARGA / PELAKU USAHA (CITIZEN)', '']);
    matrixRows.push(['Nama Persona', state.personaName || '-']);
    matrixRows.push(['Latar Belakang / Usaha', state.personaRole || '-']);
    matrixRows.push(['Literasi Digital & Kanal', state.personaLiteracy || '-']);
    matrixRows.push(['Harapan Utama Warga', state.personaGoal || '-']);
    matrixRows.push([]);

    // Table Header
    const tableHeader = [
      'No',
      'Kode Tahap',
      'Nama Tahapan Layanan',
      'Keterangan Tahap',
      '1. Aktivitas Pengguna (Customer Action)',
      '2. Saluran Layanan (Touchpoints)',
      '3. Respons Sistem / Petugas',
      '4. Hambatan / Keluhan Pengguna (Pain Points)',
      'Beban Informasi (Learning)',
      'Beban Kepatuhan (Compliance)',
      'Beban Psikologis (Psychological)',
      '5. Skor Emosi (-2 s/d +2)',
      'Kategori Sentimen Emosi',
      '6. Peluang Perbaikan & Rekomendasi Solusi',
      'Jumlah Bukti Terlampir'
    ];
    matrixRows.push(tableHeader);

    const getSentimentLabel = (score: number) => {
      if (score === 2) return 'Sangat Puas / Efisien';
      if (score === 1) return 'Cukup Mudah & Jelas';
      if (score === 0) return 'Netral / Wajar';
      if (score === -1) return 'Membingungkan / Menghambat';
      return 'Sangat Sulit / Frustrasi';
    };

    // Table Data Rows
    state.stages.forEach((stage, idx) => {
      const stageEvidences = (state.evidences || []).filter(e => e.stageId === stage.id);

      matrixRows.push([
        idx + 1,
        stage.code || `Tahap ${idx + 1}`,
        stage.name || '-',
        stage.subtitle || '-',
        stage.action || '-',
        stage.touchpoint || '-',
        stage.response || '-',
        stage.burden || '-',
        stage.learning ? 'YA' : 'TIDAK',
        stage.compliance ? 'YA' : 'TIDAK',
        stage.psychological ? 'YA' : 'TIDAK',
        stage.emotion,
        getSentimentLabel(stage.emotion),
        stage.opportunity || '-',
        stageEvidences.length
      ]);
    });

    // Formal Sign-off Section in Excel
    const signatory = getResolvedSignatory(state);
    matrixRows.push([]);
    matrixRows.push([]);
    matrixRows.push(['LEMBAR PENGESAHAN EVALUASI PELAYANAN PUBLIK']);
    matrixRows.push([
      'Mengetahui & Menyetujui:', '', '', '', '', '', '', '', '', '',
      `Ditetapkan di ${signatory.locationDate || 'Jakarta'}`
    ]);
    matrixRows.push([
      signatory.approverTitle, '', '', '', '', '', '', '', '', '',
      signatory.evaluatorTitle
    ]);
    matrixRows.push([]);
    matrixRows.push([]);
    matrixRows.push([
      signatory.approverName ? `( ${signatory.approverName} )` : '( ............................................ )',
      '', '', '', '', '', '', '', '', '',
      (signatory.evaluatorName || state.auditor) ? `( ${signatory.evaluatorName || state.auditor} )` : '( ............................................ )'
    ]);
    matrixRows.push([
      `NIP. ${signatory.approverNip || '......................................'}`,
      '', '', '', '', '', '', '', '', '',
      `NIP. ${signatory.evaluatorNip || '......................................'}`
    ]);

    const wsMatrix = XLSX.utils.aoa_to_sheet(matrixRows);

    // Set Column Widths for readability in Excel
    wsMatrix['!cols'] = [
      { wch: 5 },  // No
      { wch: 12 }, // Kode Tahap
      { wch: 24 }, // Nama Tahap
      { wch: 28 }, // Keterangan
      { wch: 38 }, // Aktivitas
      { wch: 26 }, // Touchpoints
      { wch: 34 }, // Respon
      { wch: 40 }, // Hambatan
      { wch: 15 }, // Learning
      { wch: 15 }, // Compliance
      { wch: 16 }, // Psychological
      { wch: 12 }, // Skor Emosi
      { wch: 22 }, // Sentimen
      { wch: 44 }, // Peluang Perbaikan
      { wch: 14 }  // Bukti Terlampir
    ];

    XLSX.utils.book_append_sheet(wb, wsMatrix, 'Matriks CJM');

    // ==========================================
    // SHEET 2: RENCANA AKSI CO-DESIGN
    // ==========================================
    const totalStages = state.stages.length || 1;
    const avgScore = (state.stages.reduce((acc, s) => acc + s.emotion, 0) / totalStages).toFixed(1);
    const countLearning = state.stages.filter(s => s.learning).length;
    const countCompliance = state.stages.filter(s => s.compliance).length;
    const countPsychological = state.stages.filter(s => s.psychological).length;

    const coDesignRows: any[][] = [];
    coDesignRows.push(['KEMENTERIAN PERDAGANGAN REPUBLIK INDONESIA · INSPEKTORAT JENDERAL']);
    coDesignRows.push(['RENCANA TINDAK LANJUT CO-DESIGN & PENGURANGAN BEBAN']);
    coDesignRows.push([]);

    coDesignRows.push(['RINGKASAN INDIKATOR EVALUASI', '']);
    coDesignRows.push(['Rata-rata Skor Emosi Pengguna', Number(avgScore) > 0 ? `+${avgScore}` : avgScore]);
    coDesignRows.push(['Total Tahapan Dievaluasi', totalStages]);
    coDesignRows.push(['Tahap Teridentifikasi Beban Informasi (Learning)', `${countLearning} Tahap (${Math.round((countLearning / totalStages) * 100)}%)`]);
    coDesignRows.push(['Tahap Teridentifikasi Beban Kepatuhan (Compliance)', `${countCompliance} Tahap (${Math.round((countCompliance / totalStages) * 100)}%)`]);
    coDesignRows.push(['Tahap Teridentifikasi Beban Psikologis (Psychological)', `${countPsychological} Tahap (${Math.round((countPsychological / totalStages) * 100)}%)`]);
    coDesignRows.push([]);

    coDesignRows.push(['FASE CO-DESIGN', 'URAIAN RENCANA AKSI PERBAIKAN PELAYANAN']);
    coDesignRows.push([
      'Fase 1: Discovery (Identifikasi Masalah & Titik Kritis)',
      state.coDesign?.discovery || 'Belum dirumuskan.'
    ]);
    coDesignRows.push([
      'Fase 2: Ideation (Penyusunan Solusi & Gagasan Reformasi)',
      state.coDesign?.ideation || 'Belum dirumuskan.'
    ]);
    coDesignRows.push([
      'Fase 3: Prototype (Rancangan Implementasi Nyata & Penanggung Jawab)',
      state.coDesign?.prototype || 'Belum dirumuskan.'
    ]);

    const wsCoDesign = XLSX.utils.aoa_to_sheet(coDesignRows);
    wsCoDesign['!cols'] = [
      { wch: 35 },
      { wch: 80 }
    ];

    XLSX.utils.book_append_sheet(wb, wsCoDesign, 'Rencana Co-Design');

    // ==========================================
    // SHEET 3: BUKTI LAPANGAN & TEMUAN PENGAWASAN
    // ==========================================
    const evidenceList: AuditEvidence[] = state.evidences || [];
    const evidenceRows: any[][] = [];

    evidenceRows.push(['KEMENTERIAN PERDAGANGAN REPUBLIK INDONESIA · INSPEKTORAT JENDERAL']);
    evidenceRows.push(['LOG PELACAK BUKTI LAPANGAN & TEMUAN PENGAWASAN PELAYANAN PUBLIK']);
    evidenceRows.push([]);

    evidenceRows.push([
      'No',
      'ID Bukti',
      'Tahap Terkait',
      'Judul Temuan Bukti',
      'Kategori Bukti',
      'Tingkat Keparahan Dampak',
      'Catatan Fakta Temuan Lapangan',
      'Lokasi / Sistem',
      'Regulasi / SOP Rujukan',
      'Pemeriksa / Auditor',
      'Tanggal Pencatatan'
    ]);

    if (evidenceList.length === 0) {
      evidenceRows.push(['-', '-', 'Belum ada bukti lapangan yang tercatat', '-', '-', '-', '-', '-', '-', '-', '-']);
    } else {
      evidenceList.forEach((ev, idx) => {
        const relatedStage = state.stages.find(s => s.id === ev.stageId);
        const stageLabel = ev.stageId === 'all'
          ? 'Lintas Seluruh Tahapan'
          : (relatedStage ? `${relatedStage.code} (${relatedStage.name})` : ev.stageId);

        evidenceRows.push([
          idx + 1,
          ev.id,
          stageLabel,
          ev.title,
          ev.category,
          ev.severity.toUpperCase(),
          ev.description,
          ev.locationOrSource || '-',
          ev.referenceDoc || '-',
          ev.auditorName || (state.auditor || '-'),
          ev.dateRecorded
        ]);
      });
    }

    const wsEvidence = XLSX.utils.aoa_to_sheet(evidenceRows);
    wsEvidence['!cols'] = [
      { wch: 5 },
      { wch: 14 },
      { wch: 28 },
      { wch: 32 },
      { wch: 20 },
      { wch: 16 },
      { wch: 45 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 16 }
    ];

    XLSX.utils.book_append_sheet(wb, wsEvidence, 'Bukti Lapangan');

    // Trigger Download in Browser
    XLSX.writeFile(wb, filename);

    options.onSuccess?.();
    return true;
  } catch (err) {
    console.error('Gagal membuat berkas Excel (.xlsx):', err);
    options.onError?.(err);
    return false;
  }
}
