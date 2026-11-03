import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EvaluationState } from '../types';
import { SERVICE_MODELS } from '../data/presets';
import { getResolvedSignatory } from './signatoryHelpers';

export interface GeneratePDFOptions {
  filename?: string;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (err: any) => void;
}

export function generateOfficialPDF(
  state: EvaluationState,
  options: GeneratePDFOptions = {}
): boolean {
  const {
    filename = `Laporan_Evaluasi_CJM_Itjen_Kemendag_${(state.service || 'Layanan').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 35)}_${new Date().toISOString().slice(0, 10)}.pdf`,
    onStart,
    onSuccess,
    onError
  } = options;

  try {
    onStart?.();

    // Create A4 Landscape PDF (297mm x 210mm)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 210mm
    const margin = 14;
    const contentWidth = pageWidth - margin * 2; // 269mm

    // Palette Colors (Hex/RGB for authoritative government document)
    const navyPrimary: [number, number, number] = [30, 58, 138]; // #1e3a8a
    const navyDark: [number, number, number] = [15, 23, 42]; // #0f172a
    const textDark: [number, number, number] = [30, 41, 59]; // #1e293b
    const textMuted: [number, number, number] = [100, 116, 139]; // #64748b
    const bgLight: [number, number, number] = [248, 250, 252]; // #f8fafc
    const borderSlate: [number, number, number] = [203, 213, 225]; // #cbd5e1

    let currentY = margin;

    // ==========================================
    // 1. KOP RESMI SURAT / FORMAL LETTERHEAD
    // ==========================================
    doc.setDrawColor(...navyPrimary);
    doc.setLineWidth(0.8);
    doc.line(margin, currentY + 18, margin + contentWidth, currentY + 18);
    doc.setLineWidth(0.2);
    doc.line(margin, currentY + 19, margin + contentWidth, currentY + 19);

    // Header Agency Tag
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...navyPrimary);
    doc.text('KEMENTERIAN PERDAGANGAN REPUBLIK INDONESIA', margin, currentY + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...navyDark);
    doc.text('INSPEKTORAT JENDERAL', margin, currentY + 8.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text('Kertas Kerja Pengawasan & Evaluasi Pelayanan Publik Berbasis Citizen-Centric (Customer Journey Mapping)', margin, currentY + 13);

    // Meta details on the right
    doc.setFontSize(7.5);
    doc.setTextColor(...textDark);
    if (state.sessionId) {
      doc.setFont('helvetica', 'bold');
      doc.text(`Kode Proyek: ${state.sessionId}`, margin + contentWidth, currentY + 1.5, { align: 'right' });
      doc.setFont('helvetica', 'normal');
    }
    doc.text(`Periode: ${state.period || 'Tahun 2025'}`, margin + contentWidth, currentY + 5.5, { align: 'right' });
    doc.text(`Tim Evaluator: ${state.auditor || 'Itjen Kemendag'}`, margin + contentWidth, currentY + 9.5, { align: 'right' });
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin + contentWidth, currentY + 13.5, { align: 'right' });

    currentY += 24;

    // ==========================================
    // 2. DOCUMENT TITLE
    // ==========================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.setTextColor(...navyDark);
    doc.text('LAPORAN EVALUASI PELAYANAN PUBLIK CITIZEN-CENTRIC', margin + contentWidth / 2, currentY, { align: 'center' });

    currentY += 5;

    // Selected Service Model Info
    const selectedModel = SERVICE_MODELS.find(m => m.id === state.modelId) || SERVICE_MODELS[0];

    // ==========================================
    // 3. PROFIL OBJEK LAYANAN & PERSONA WARGA (2-COL BOX)
    // ==========================================
    const boxHeight = 24;
    const halfWidth = (contentWidth - 6) / 2;

    // Left Box: Identitas Objek Layanan
    doc.setFillColor(...bgLight);
    doc.setDrawColor(...borderSlate);
    doc.roundedRect(margin, currentY, halfWidth, boxHeight, 1.5, 1.5, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...navyPrimary);
    doc.text('OBJEK LAYANAN YANG DIEVALUASI', margin + 3.5, currentY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...textDark);
    doc.text(`Unit Penyelenggara: ${state.unit || '-'}`, margin + 3.5, currentY + 9.5);
    doc.text(`Nama Layanan: ${state.service || '-'}`, margin + 3.5, currentY + 14);
    doc.text(`Model Layanan: ${selectedModel.name} (${selectedModel.category})`, margin + 3.5, currentY + 18.5);

    // Right Box: Persona Warga
    doc.setFillColor(...bgLight);
    doc.roundedRect(margin + halfWidth + 6, currentY, halfWidth, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...navyPrimary);
    doc.text('PROFIL PERSONA PENGGUNA (CITIZEN)', margin + halfWidth + 9.5, currentY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textDark);
    doc.text(`Nama & Latar Belakang: ${state.personaName || '-'} (${state.personaRole || '-'})`, margin + halfWidth + 9.5, currentY + 9.5);
    doc.text(`Karakteristik Akses: ${state.personaLiteracy || '-'}`, margin + halfWidth + 9.5, currentY + 14);
    
    const goalSnippet = (state.personaGoal || '-').length > 70 
      ? (state.personaGoal || '-').slice(0, 68) + '...' 
      : (state.personaGoal || '-');
    doc.text(`Ekspektasi Utama: ${goalSnippet}`, margin + halfWidth + 9.5, currentY + 18.5);

    currentY += boxHeight + 4;

    // ==========================================
    // 4. STATISTIK BEBAN ADMINISTRATIF & SKOR EMOSI
    // ==========================================
    const totalStages = state.stages.length || 1;
    const avgScore = (state.stages.reduce((acc, s) => acc + s.emotion, 0) / totalStages).toFixed(1);
    const countLearning = state.stages.filter(s => s.learning).length;
    const countCompliance = state.stages.filter(s => s.compliance).length;
    const countPsychological = state.stages.filter(s => s.psychological).length;

    const statColWidth = (contentWidth - 9) / 4;
    const statHeight = 11;

    const statCards = [
      { label: 'Rata-rata Skor Emosi', val: `${Number(avgScore) > 0 ? '+' : ''}${avgScore} / +2.0`, sub: 'Skala: -2 s.d. +2' },
      { label: 'Beban Informasi (Learning)', val: `${countLearning} dari ${totalStages} Tahap`, sub: 'Syarat/prosedur membingungkan' },
      { label: 'Beban Kepatuhan (Compliance)', val: `${countCompliance} dari ${totalStages} Tahap`, sub: 'Berkas berulang / waktu lama' },
      { label: 'Beban Psikologis (Psychological)', val: `${countPsychological} dari ${totalStages} Tahap`, sub: 'Ketidakpastian SLA / cemas' }
    ];

    statCards.forEach((card, i) => {
      const cardX = margin + i * (statColWidth + 3);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...borderSlate);
      doc.roundedRect(cardX, currentY, statColWidth, statHeight, 1.2, 1.2, 'FD');

      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textMuted);
      doc.text(card.label, cardX + statColWidth / 2, currentY + 3.2, { align: 'center' });

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...navyDark);
      doc.text(card.val, cardX + statColWidth / 2, currentY + 7.2, { align: 'center' });

      doc.setFontSize(5.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textMuted);
      doc.text(card.sub, cardX + statColWidth / 2, currentY + 9.8, { align: 'center' });
    });

    currentY += statHeight + 5;

    // ==========================================
    // 5. MATRIKS CUSTOMER JOURNEY MAP (AUTOTABLE)
    // ==========================================
    const tableBody = state.stages.map((st) => {
      const burdens = [];
      if (st.learning) burdens.push('Informasi');
      if (st.compliance) burdens.push('Kepatuhan');
      if (st.psychological) burdens.push('Psikologis');

      const burdenText = st.burden
        ? `${st.burden}${burdens.length > 0 ? `\n[Beban: ${burdens.join(', ')}]` : ''}`
        : 'Tidak ada hambatan';

      const emotionLabel = st.emotion > 0 ? `+${st.emotion}` : `${st.emotion}`;

      return [
        `${st.code}: ${st.name}\n(${st.subtitle || '-'})\nSkor: ${emotionLabel}`,
        `Aktivitas:\n${st.action || '-'}\n\nSaluran:\n${st.touchpoint || '-'}`,
        st.response || '-',
        burdenText,
        st.opportunity || '-'
      ];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      head: [
        ['Tahapan Layanan', 'Aktivitas Warga & Saluran', 'Respons Sistem / Petugas', 'Hambatan & Beban Warga', 'Peluang Solusi (Opportunities)']
      ],
      body: tableBody,
      headStyles: {
        fillColor: navyPrimary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'left',
        cellPadding: 2
      },
      styles: {
        fontSize: 6.8,
        lineColor: borderSlate,
        lineWidth: 0.15,
        textColor: textDark,
        cellPadding: 2,
        valign: 'top',
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 38, fontStyle: 'bold' },
        1: { cellWidth: 55 },
        2: { cellWidth: 48 },
        3: { cellWidth: 63 },
        4: { cellWidth: 65 }
      },
      didDrawPage: (data) => {
        // Footer page numbering on each page
        const pageCount = (doc.internal as any).getNumberOfPages?.() || doc.getNumberOfPages();
        doc.setFontSize(6.5);
        doc.setTextColor(...textMuted);
        doc.text(
          `Dokumen Kertas Kerja Evaluasi Pelayanan Publik Citizen-Centric · Itjen Kementerian Perdagangan RI · Halaman ${data.pageNumber} dari ${pageCount}`,
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }
    });

    let finalY = (doc as any).lastAutoTable.finalY + 6;

    // If remaining space on current page is too small for Co-Design & signatures, add new page
    if (finalY > pageHeight - 55) {
      doc.addPage();
      finalY = margin + 4;
    }

    // ==========================================
    // 6. RENCANA TINDAK LANJUT CO-DESIGN (3 COLUMNS)
    // ==========================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...navyDark);
    doc.text('RENCANA TINDAK LANJUT PERBAIKAN LAYANAN (CO-DESIGN ACTION PLAN)', margin, finalY);

    finalY += 3;

    autoTable(doc, {
      startY: finalY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      head: [
        ['1. Temuan Titik Kritis (Discovery)', '2. Rencana Aksi Pangkas Beban (Ideation)', '3. Target Output / Prototipe & PIC (Action)']
      ],
      body: [
        [
          state.coDesign.discovery || 'Tidak ada catatan temuan.',
          state.coDesign.ideation || 'Tidak ada rencana aksi.',
          state.coDesign.prototype || 'Tidak ada target output spesifik.'
        ]
      ],
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7,
        cellPadding: 2
      },
      styles: {
        fontSize: 6.8,
        textColor: textDark,
        cellPadding: 2.5,
        lineColor: borderSlate,
        lineWidth: 0.15,
        valign: 'top',
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: contentWidth / 3 },
        1: { cellWidth: contentWidth / 3 },
        2: { cellWidth: contentWidth / 3 }
      }
    });

    finalY = (doc as any).lastAutoTable.finalY + 8;

    // ==========================================
    // 6.5. LAMPIRAN RESMI: BUKTI LAPANGAN & FAKTA PENGAWASAN
    // ==========================================
    if (state.evidences && state.evidences.length > 0) {
      doc.addPage();
      let annexY = margin;

      // Letterhead for Annex Page
      doc.setDrawColor(...navyPrimary);
      doc.setLineWidth(0.6);
      doc.line(margin, annexY + 12, margin + contentWidth, annexY + 12);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...navyPrimary);
      doc.text('LAMPIRAN PENGUJIAN: BUKTI DOKUMENTASI & FAKTA TEMUAN LAPANGAN', margin, annexY + 4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...textMuted);
      doc.text('Daftar dokumentasi visual, tangkapan layar sistem perizinan, dan formulir hasil verifikasi Inspektorat Jenderal', margin, annexY + 8.5);

      annexY += 16;

      const evidenceRows = state.evidences.map((ev, idx) => {
        const catLabel = ev.category === 'screenshot_sistem' ? 'Tangkapan Layar Sistem' :
                         ev.category === 'dokumen_fisik' ? 'Dokumen / Formulir Fisik' :
                         ev.category === 'foto_antrean' ? 'Antrean / Loket Fisik' :
                         ev.category === 'regulasi_sop' ? 'Regulasi / SOP' :
                         ev.category === 'rekaman_audio' ? 'Wawancara / Rekaman' : 'Lainnya';

        const severityLabel = ev.severity === 'kritis' ? 'KRITIS (Menghambat)' :
                              ev.severity === 'sedang' ? 'SEDANG (Beban Waktu)' : 'RINGAN (Minor)';

        return [
          (idx + 1).toString(),
          `${ev.stageCode || 'Lintas Tahap'}\n${ev.dateRecorded || ''}`,
          `${catLabel}\n[${ev.locationOrSource || 'Sistem'}]`,
          `${ev.title.toUpperCase()}\n\n${ev.description}`,
          ev.referenceDoc || '-',
          severityLabel
        ];
      });

      autoTable(doc, {
        startY: annexY,
        margin: { left: margin, right: margin },
        head: [['No', 'Tahap Layanan', 'Kategori & Lokasi', 'Judul Temuan & Fakta Investigasi Lapangan', 'Dasar Regulasi / SOP', 'Tingkat Risiko']],
        body: evidenceRows,
        headStyles: {
          fillColor: navyPrimary,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7.2,
          cellPadding: 2.2
        },
        styles: {
          fontSize: 6.8,
          textColor: textDark,
          cellPadding: 2.5,
          lineColor: borderSlate,
          lineWidth: 0.15,
          valign: 'top',
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 9, halign: 'center' },
          1: { cellWidth: 26 },
          2: { cellWidth: 38 },
          3: { cellWidth: 120 },
          4: { cellWidth: 46 },
          5: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
        }
      });

      finalY = (doc as any).lastAutoTable.finalY + 8;
    }

    // Check if signature section fits, if not, add page
    if (finalY > pageHeight - 35) {
      doc.addPage();
      finalY = margin + 6;
    }

    // ==========================================
    // 7. LEMBAR PENGESAHAN RESMI / SIGN-OFF
    // ==========================================
    doc.setFontSize(7.5);
    doc.setTextColor(...textDark);

    const signatory = getResolvedSignatory(state);

    // Left Signature: Unit Penyelenggara Layanan / Pihak Mengetahui & Menyetujui
    doc.setFont('helvetica', 'normal');
    doc.text('Mengetahui & Menyetujui:', margin, finalY);
    doc.setFont('helvetica', 'bold');
    doc.text(signatory.approverTitle, margin, finalY + 4);

    doc.line(margin, finalY + 20, margin + 55, finalY + 20);
    doc.setFont('helvetica', 'bold');
    doc.text(
      signatory.approverName ? `( ${signatory.approverName} )` : '( .................................................... )',
      margin,
      finalY + 23.5
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(`NIP. ${signatory.approverNip || '.................................................'}`, margin, finalY + 26.5);

    // Right Signature: Tim Evaluator Itjen Kemendag
    const rightColX = margin + contentWidth - 65;
    doc.setFontSize(7.5);
    doc.text(`Ditetapkan di ${signatory.locationDate || 'Jakarta'}`, rightColX, finalY);
    doc.setFont('helvetica', 'bold');
    doc.text(signatory.evaluatorTitle, rightColX, finalY + 4);

    doc.line(rightColX, finalY + 20, rightColX + 55, finalY + 20);
    doc.setFont('helvetica', 'bold');
    const evaluatorDisplayName = signatory.evaluatorName || state.auditor;
    doc.text(
      evaluatorDisplayName ? `( ${evaluatorDisplayName} )` : '( .................................................... )',
      rightColX,
      finalY + 23.5
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(`NIP. ${signatory.evaluatorNip || '.................................................'}`, rightColX, finalY + 26.5);

    // Save PDF directly to disk
    doc.save(filename);
    onSuccess?.();
    return true;
  } catch (err) {
    console.error('Gagal membuat dokumen PDF:', err);
    onError?.(err);
    return false;
  }
}
