import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Sparkles, 
  Printer, 
  Building2, 
  UserCheck, 
  BarChart3, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileDown,
  Loader2,
  Camera,
  FileSpreadsheet,
  PenLine
} from 'lucide-react';
import { EvaluationState, AuditEvidence, SignatoryInfo } from '../types';
import { SERVICE_MODELS } from '../data/presets';
import { getResolvedSignatory } from '../utils/signatoryHelpers';
import { EvaluationDashboard } from './EvaluationDashboard';
import { EvidenceTracker } from './EvidenceTracker';

interface Step3ReportProps {
  state: EvaluationState;
  onChangeCoDesign: (patch: Partial<EvaluationState['coDesign']>) => void;
  onChangeSignatory?: (patch: Partial<SignatoryInfo>) => void;
  onPullOpportunities: () => void;
  onExportPDF: () => void;
  onExportExcel?: () => void;
  onPrintNative?: () => void;
  isExportingPDF?: boolean;
  onBackToCanvas: () => void;
  onAddEvidence?: (evidence: AuditEvidence) => void;
  onUpdateEvidence?: (evidence: AuditEvidence) => void;
  onDeleteEvidence?: (id: string) => void;
  onLoadSampleEvidences?: () => void;
}

export const Step3Report: React.FC<Step3ReportProps> = ({
  state,
  onChangeCoDesign,
  onChangeSignatory,
  onPullOpportunities,
  onExportPDF,
  onExportExcel,
  onPrintNative,
  isExportingPDF = false,
  onBackToCanvas,
  onAddEvidence,
  onUpdateEvidence,
  onDeleteEvidence,
  onLoadSampleEvidences
}) => {
  const [pullToast, setPullToast] = useState(false);
  const selectedModel = SERVICE_MODELS.find(m => m.id === state.modelId) || SERVICE_MODELS[0];
  const signatory = getResolvedSignatory(state);

  const handlePullWithFeedback = () => {
    onPullOpportunities();
    setPullToast(true);
    setTimeout(() => setPullToast(false), 3000);
  };

  const countLearning = state.stages.filter(s => s.learning).length;
  const countCompliance = state.stages.filter(s => s.compliance).length;
  const countPsychological = state.stages.filter(s => s.psychological).length;
  const countNegative = state.stages.filter(s => s.emotion < 0).length;

  const totalStages = state.stages.length || 1;
  const avgScore = (state.stages.reduce((acc, s) => acc + s.emotion, 0) / totalStages).toFixed(1);

  const getScoreSummary = (score: number) => {
    if (score >= 1.5) return { label: 'Sangat Memuaskan & Efisien', textColor: 'text-emerald-700 font-bold' };
    if (score >= 0.5) return { label: 'Cukup Positif (Perlu Penyempurnaan)', textColor: 'text-teal-700 font-bold' };
    if (score >= -0.5) return { label: 'Netral (Beban Cukup Terasa)', textColor: 'text-slate-700 font-bold' };
    if (score >= -1.5) return { label: 'Rentan Hambatan (Beban Tinggi)', textColor: 'text-amber-700 font-bold' };
    return { label: 'Kritis (Perlu Reformasi Menyeluruh)', textColor: 'text-rose-700 font-bold' };
  };

  const scoreMeta = getScoreSummary(Number(avgScore));

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Langkah 3: Rencana Aksi Co-Design & Laporan Kertas Kerja Resmi
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Rumuskan rencana aksi pengurangan beban administratif (burden reduction) berdasarkan temuan perjalanan warga di atas, lalu pratinjau atau cetak laporan resmi untuk dokumen pertanggungjawaban evaluasi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onBackToCanvas}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Kanvas CJM</span>
          </button>
          {onPrintNative && (
            <button
              type="button"
              onClick={onPrintNative}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
              title="Cetak langsung melalui dialog printer peramban"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Langsung</span>
            </button>
          )}

          {onExportExcel && (
            <button
              type="button"
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-800 transition shadow-2xs"
              title="Unduh seluruh lembar kerja matriks CJM dalam format Microsoft Excel (.xlsx) untuk diedit manual"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ekspor Excel (.xlsx)</span>
            </button>
          )}

          <button
            type="button"
            disabled={isExportingPDF}
            onClick={onExportPDF}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
            title="Unduh langsung berkas PDF resmi ke perangkat Anda"
          >
            {isExportingPDF ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyiapkan PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5" />
                <span>Unduh Berkas PDF (.pdf)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Panel Visual Dashboard Evaluasi (Recharts) */}
      <div className="no-print">
        <EvaluationDashboard state={state} />
      </div>

      {/* Action Plan Co-Design Editor (Hidden when printing) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-700" />
              <span>Penyusunan Rencana Tindak Lanjut Kolaboratif (Co-Design Action Plan)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Anda dapat menuliskan manual atau menekan tombol untuk menarik otomatis butir-butir temuan dari Kanvas CJM.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {pullToast && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold animate-in fade-in duration-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Temuan & usulan CJM berhasil diekstrak</span>
              </div>
            )}
            <button
              type="button"
              onClick={handlePullWithFeedback}
              className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-2xs"
              title="Otomatis mengekstrak titik hambatan dan usulan perbaikan dari kanvas CJM"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Tarik Temuan Otomatis dari CJM</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              1. Temuan Titik Kritis Pengalaman Warga (Discovery)
            </label>
            <textarea
              rows={5}
              value={state.coDesign.discovery}
              onChange={(e) => onChangeCoDesign({ discovery: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Rangkum tahapan mana yang paling banyak menyita waktu, menimbulkan frustrasi, atau menghasilkan penolakan berkas..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              2. Rencana Aksi Pangkas Beban (Burden Reduction / Ideation)
            </label>
            <textarea
              rows={5}
              value={state.coDesign.ideation}
              onChange={(e) => onChangeCoDesign({ ideation: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Langkah terobosan simplifikasi berkas, integrasi sistem, transparansi waktu, atau kanal komunikasi aktif..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              3. Target Output / Prototipe Perbaikan & PIC (Prototype & Action)
            </label>
            <textarea
              rows={5}
              value={state.coDesign.prototype}
              onChange={(e) => onChangeCoDesign({ prototype: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Wujud perubahan nyata yang diuji coba beserta unit kerja dan pejabat penanggung jawab (PIC)..."
            />
          </div>
        </div>
      </div>

      {/* Signatory Information Editor (Hidden when printing) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <PenLine className="w-4 h-4 text-blue-700" />
              <span>Pengaturan Pihak Penandatangan Lembar Pengesahan (Sign-off)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sesuaikan jabatan, nama pejabat, dan NIP untuk pihak yang mengetahui serta pengendali teknis / tim evaluator.
            </p>
          </div>
          {onChangeSignatory && (
            <button
              type="button"
              onClick={() => {
                onChangeSignatory({
                  evaluatorName: state.auditor || '',
                  locationDate: `Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                });
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-300 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition"
              title="Sinkronkan nama evaluator dengan data auditor dari Profil Evaluasi"
            >
              <span>Sinkronkan dari Profil Evaluasi</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kolom 1: Pihak Mengetahui & Menyetujui */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <UserCheck className="w-4 h-4 text-slate-700" />
              <h4 className="text-xs font-bold text-slate-900">Pihak yang Mengetahui & Menyetujui</h4>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Jabatan Penandatangan
              </label>
              <input
                type="text"
                value={signatory.approverTitle}
                onChange={(e) => onChangeSignatory?.({ approverTitle: e.target.value })}
                placeholder="Contoh: Inspektur Wilayah / Pimpinan Unit Penyelenggara Layanan"
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">
                (Keterangan instansi di bawah jabatan tidak ditampilkan)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  value={signatory.approverName}
                  onChange={(e) => onChangeSignatory?.({ approverName: e.target.value })}
                  placeholder="Contoh: Dr. Budi Santoso, S.E., M.Si."
                  className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nomor Induk Pegawai (NIP)
                </label>
                <input
                  type="text"
                  value={signatory.approverNip}
                  onChange={(e) => onChangeSignatory?.({ approverNip: e.target.value })}
                  placeholder="Contoh: 19750815 199803 1 002"
                  className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Kolom 2: Pengendali Teknis / Tim Evaluator */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <ClipboardCheck className="w-4 h-4 text-blue-700" />
              <h4 className="text-xs font-bold text-slate-900">Pengendali Teknis / Tim Evaluator</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tempat & Tanggal Penetapan
                </label>
                <input
                  type="text"
                  value={signatory.locationDate}
                  onChange={(e) => onChangeSignatory?.({ locationDate: e.target.value })}
                  placeholder="Contoh: Jakarta, 30 Juni 2025"
                  className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Jabatan Pengendali Teknis
                </label>
                <input
                  type="text"
                  value={signatory.evaluatorTitle}
                  onChange={(e) => onChangeSignatory?.({ evaluatorTitle: e.target.value })}
                  placeholder="Contoh: Pengendali Teknis / Ketua Tim Evaluator"
                  className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  value={signatory.evaluatorName}
                  onChange={(e) => onChangeSignatory?.({ evaluatorName: e.target.value })}
                  placeholder={state.auditor || 'Nama Ketua Tim / Evaluator'}
                  className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nomor Induk Pegawai (NIP)
                </label>
                <input
                  type="text"
                  value={signatory.evaluatorNip}
                  onChange={(e) => onChangeSignatory?.({ evaluatorNip: e.target.value })}
                  placeholder="Contoh: 19830210 200801 1 003"
                  className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              (Keterangan instansi di bawah jabatan tidak ditampilkan)
            </p>
          </div>
        </div>
      </div>

      {/* Panel Pelacak Bukti Lapangan & Fakta Pengawasan (no-print) */}
      <div id="evidence-tracker-section" className="no-print">
        <EvidenceTracker
          evidences={state.evidences}
          stages={state.stages}
          onAddEvidence={onAddEvidence || (() => {})}
          onUpdateEvidence={onUpdateEvidence || (() => {})}
          onDeleteEvidence={onDeleteEvidence || (() => {})}
          onLoadSampleEvidences={onLoadSampleEvidences}
          defaultAuditor={state.auditor}
        />
      </div>

      {/* ====================================================
           OFFICIAL PRINTABLE REPORT PREVIEW (A4 LANDSCAPE READY)
           ==================================================== */}
      <div 
        id="printable-report-container"
        className="bg-white rounded-xl border border-slate-300 shadow-sm p-6 sm:p-10 max-w-5xl mx-auto space-y-6"
      >
        {/* Formal Ministry/Agency Header with Official Logo */}
        <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-1 rounded-lg bg-white border border-slate-200 shadow-2xs shrink-0">
              <img
                src="/assets/aistudio/image_6fb22ebf.png"
                alt="Logo Resmi Inspektorat Jenderal Kementerian Perdagangan"
                width={52}
                height={52}
                className="h-12 w-auto object-contain"
              />
            </div>
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-blue-900">
                KEMENTERIAN PERDAGANGAN REPUBLIK INDONESIA · INSPEKTORAT JENDERAL
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight mt-0.5">
                Laporan Evaluasi Pelayanan Publik Berbasis Citizen-Centric
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Kertas Kerja Pemetaan Perjalanan Pengguna (Customer Journey Map) & Pengurangan Beban Administratif
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-700 sm:text-right shrink-0 font-medium space-y-1">
            {state.sessionId && (
              <div>Kode Proyek: <strong className="text-blue-950 font-mono font-bold">{state.sessionId}</strong></div>
            )}
            <div>Periode: <strong className="text-slate-900">{state.period || 'Tahun 2025'}</strong></div>
            <div>Tim Evaluator: <strong className="text-slate-900">{state.auditor || 'Tim Evaluator Inspektorat Jenderal Kementerian Perdagangan'}</strong></div>
            <div className="text-[11px] text-slate-500 font-mono">Status: Dokumen Pengawasan & Evaluasi Resmi</div>
          </div>
        </div>

        {/* Executive Summary Cards: KPI & Burden Indices */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Rata-rata Skor Pengalaman
            </div>
            <div className="text-2xl font-mono font-black text-slate-900 mt-0.5 tabular-nums">
              {Number(avgScore) > 0 ? `+${avgScore}` : avgScore}
            </div>
            <div className={`text-[11px] mt-1 truncate ${scoreMeta.textColor}`}>
              {scoreMeta.label}
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/40 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-900">
              Beban Informasi (Learning)
            </div>
            <div className="text-2xl font-mono font-black text-rose-900 mt-0.5 tabular-nums">
              {countLearning} <span className="text-xs font-normal text-rose-700">/ {totalStages}</span>
            </div>
            <div className="text-[10px] text-rose-700 mt-1">Tahap butuh edukasi/simplifikasi</div>
          </div>

          <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/40 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-900">
              Beban Kepatuhan (Compliance)
            </div>
            <div className="text-2xl font-mono font-black text-rose-900 mt-0.5 tabular-nums">
              {countCompliance} <span className="text-xs font-normal text-rose-700">/ {totalStages}</span>
            </div>
            <div className="text-[10px] text-rose-700 mt-1">Tahap berkas berulang / antre</div>
          </div>

          <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/40 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-900">
              Beban Psikologis (Psychological)
            </div>
            <div className="text-2xl font-mono font-black text-rose-900 mt-0.5 tabular-nums">
              {countPsychological} <span className="text-xs font-normal text-rose-700">/ {totalStages}</span>
            </div>
            <div className="text-[10px] text-rose-700 mt-1">Tahap memicu cemas / SLA kabur</div>
          </div>
        </div>

        {/* Section 1: Profil Objek & Persona */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200 text-xs">
          <div className="space-y-2">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-800" />
              <span>Objek Layanan yang Dievaluasi</span>
            </div>
            <div>
              <span className="text-slate-500">Unit Penyelenggara:</span>{' '}
              <strong className="text-slate-900">{state.unit || '-'}</strong>
            </div>
            <div>
              <span className="text-slate-500">Nama Layanan:</span>{' '}
              <strong className="text-slate-900">{state.service || '-'}</strong>
            </div>
            <div>
              <span className="text-slate-500">Model Layanan:</span>{' '}
              <strong className="text-blue-900">{selectedModel.name}</strong>{' '}
              <span className="text-slate-600">({selectedModel.category})</span>
            </div>
            <div>
              <span className="text-slate-500">Peran Unit Layanan:</span>{' '}
              <strong className="text-slate-800">{selectedModel.roleIndo}</strong>
            </div>
            <div>
              <span className="text-slate-500">Karakteristik Singkat:</span>{' '}
              <span className="text-slate-700">{selectedModel.shortDefinition}</span>
            </div>
            <div>
              <span className="text-slate-500">Varian Layanan:</span>{' '}
              <span className="text-slate-700 text-[11px]">
                {selectedModel.subModels.join(', ')}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Fokus Evaluasi:</span>{' '}
              <span className="text-slate-700">{selectedModel.focus}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-800" />
              <span>Persona Pengguna Layanan (Citizen)</span>
            </div>
            <div>
              <span className="text-slate-500">Nama & Latar Belakang:</span>{' '}
              <strong className="text-slate-900">{state.personaName || '-'}</strong>{' '}
              <span className="text-slate-600">({state.personaRole || '-'})</span>
            </div>
            <div>
              <span className="text-slate-500">Tingkat Literasi Digital:</span>{' '}
              <span className="text-slate-800">{state.personaLiteracy || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500">Harapan Utama Warga:</span>{' '}
              <span className="text-slate-800 leading-relaxed font-medium">{state.personaGoal || '-'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Full CJM Matrix Table */}
        <div className="space-y-2 break-inside-avoid">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Matriks Pemetaan Perjalanan Pengguna (Customer Journey Map Matrix)
            </h3>
            <span className="text-[11px] text-slate-500">Evaluasi Rinci Tiap Titik Interaksi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-900 text-left">
                  <th className="border border-slate-300 px-3 py-2 w-32 font-bold">Tahapan</th>
                  <th className="border border-slate-300 px-3 py-2 font-bold">Aktivitas & Saluran Layanan</th>
                  <th className="border border-slate-300 px-3 py-2 font-bold">Respons Sistem / Petugas</th>
                  <th className="border border-slate-300 px-3 py-2 font-bold">Hambatan & Klasifikasi Beban</th>
                  <th className="border border-slate-300 px-3 py-2 font-bold">Peluang Solusi (Opportunities)</th>
                </tr>
              </thead>
              <tbody>
                {state.stages.map((st, idx) => {
                  const burdens = [];
                  if (st.learning) burdens.push('Informasi');
                  if (st.compliance) burdens.push('Kepatuhan');
                  if (st.psychological) burdens.push('Psikologis');

                  const emotionColor =
                    st.emotion === 2
                      ? 'text-emerald-800 bg-emerald-50 border-emerald-300'
                      : st.emotion === 1
                      ? 'text-teal-800 bg-teal-50 border-teal-300'
                      : st.emotion === 0
                      ? 'text-slate-700 bg-slate-50 border-slate-300'
                      : st.emotion === -1
                      ? 'text-amber-800 bg-amber-50 border-amber-300'
                      : 'text-rose-800 bg-rose-50 border-rose-300';

                  return (
                    <tr key={st.id || idx} className="align-top">
                      <td className="border border-slate-300 px-3 py-2.5 font-semibold text-slate-900">
                        <div className="font-bold">{st.code}: {st.name}</div>
                        <div className="text-[11px] font-normal text-slate-500">{st.subtitle}</div>
                        <div className={`mt-1.5 inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${emotionColor}`}>
                          Skor: {st.emotion > 0 ? `+${st.emotion}` : st.emotion}
                        </div>
                      </td>

                      <td className="border border-slate-300 px-3 py-2.5 text-slate-800 whitespace-pre-line leading-relaxed">
                        <div className="font-medium">{st.action || '-'}</div>
                        <div className="text-[11px] text-slate-500 mt-1 font-normal">
                          Saluran: <strong className="text-slate-700">{st.touchpoint || '-'}</strong>
                        </div>
                      </td>

                      <td className="border border-slate-300 px-3 py-2.5 text-slate-700 whitespace-pre-line leading-relaxed">
                        {st.response || '-'}
                      </td>

                      <td className="border border-slate-300 px-3 py-2.5 text-slate-800 whitespace-pre-line leading-relaxed">
                        <div>{st.burden || <span className="italic text-slate-400">Tidak ada kendala</span>}</div>
                        {burdens.length > 0 && (
                          <div className="mt-1.5 text-[10px] font-bold text-rose-900">
                            Jenis Beban: {burdens.join(' · ')}
                          </div>
                        )}
                      </td>

                      <td className="border border-slate-300 px-3 py-2.5 text-slate-800 whitespace-pre-line leading-relaxed font-medium">
                        {st.opportunity || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2.5: Matriks Temuan Audit 5C */}
        {state.stages.some(s => s.condition || s.criteria || s.cause || s.consequence || s.recommendation) && (
          <div className="space-y-2 break-inside-avoid">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <span>Matriks Temuan Audit Pengawasan Internal (Metodologi 5C - IPPF IIA)</span>
              </h3>
              <span className="text-[11px] text-amber-800 font-mono font-bold">Standard Internal Audit Kemendag</span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-300">
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-[#07162c] text-white text-left text-[11px]">
                    <th className="border border-slate-700 px-2.5 py-2 w-28">Tahap</th>
                    <th className="border border-slate-700 px-2.5 py-2">1. Condition (Kondisi)</th>
                    <th className="border border-slate-700 px-2.5 py-2">2. Criteria (Kriteria)</th>
                    <th className="border border-slate-700 px-2.5 py-2">3. Cause (Sebab)</th>
                    <th className="border border-slate-700 px-2.5 py-2">4. Consequence (Akibat)</th>
                    <th className="border border-slate-700 px-2.5 py-2">5. Corrective Action (Rekomendasi)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {state.stages
                    .filter(s => s.condition || s.criteria || s.cause || s.consequence || s.recommendation)
                    .map((st, idx) => (
                      <tr key={st.id || idx} className="align-top text-[11px]">
                        <td className="border border-slate-300 p-2 font-bold text-slate-900 bg-slate-50">
                          {st.code}: {st.name}
                        </td>
                        <td className="border border-slate-300 p-2 text-slate-800 leading-relaxed">{st.condition || '-'}</td>
                        <td className="border border-slate-300 p-2 text-blue-900 font-medium leading-relaxed">{st.criteria || '-'}</td>
                        <td className="border border-slate-300 p-2 text-slate-700 leading-relaxed">{st.cause || '-'}</td>
                        <td className="border border-slate-300 p-2 text-rose-900 font-medium leading-relaxed">{st.consequence || '-'}</td>
                        <td className="border border-slate-300 p-2 text-emerald-950 font-bold leading-relaxed">{st.recommendation || '-'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 3: Rencana Tindak Lanjut Co-Design */}
        <div className="space-y-2 break-inside-avoid">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Rencana Tindak Lanjut Perbaikan Layanan (Co-Design Action Plan)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-lg border border-slate-300 bg-slate-50/70 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>1. Temuan Titik Kritis (Discovery)</span>
              </div>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                {state.coDesign.discovery || '-'}
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-300 bg-slate-50/70 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                <span>2. Rencana Pangkas Beban (Ideation)</span>
              </div>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                {state.coDesign.ideation || '-'}
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-300 bg-slate-50/70 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>3. Target Output & PIC (Action)</span>
              </div>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                {state.coDesign.prototype || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3.5: Lampiran Resmi Bukti Lapangan & Fakta Temuan */}
        {state.evidences && state.evidences.length > 0 && (
          <div className="pt-4 border-t-2 border-slate-900 space-y-3 break-inside-avoid">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  LAMPIRAN PENGUJIAN: BUKTI DOKUMENTASI & FAKTA TEMUAN LAPANGAN
                </h4>
                <p className="text-[10px] text-slate-500">
                  Dokumentasi visual portal perizinan, verifikasi antrean, dan dokumen fisik hasil investigasi Inspektorat Jenderal
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                {state.evidences.length} Temuan Terdata
              </span>
            </div>

            <div className="overflow-x-auto rounded border border-slate-300">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-300 text-slate-900">
                    <th className="py-1.5 px-2 w-8 text-center">No</th>
                    <th className="py-1.5 px-2 w-28">Tahap Layanan</th>
                    <th className="py-1.5 px-2 w-32">Kategori & Sumber</th>
                    <th className="py-1.5 px-2">Judul Temuan & Fakta Investigasi Lapangan</th>
                    <th className="py-1.5 px-2 w-40">Regulasi Rujukan</th>
                    <th className="py-1.5 px-2 w-20 text-center">Risiko</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {state.evidences.map((ev, i) => (
                    <tr key={ev.id} className="align-top">
                      <td className="py-1.5 px-2 text-slate-500 font-mono text-center">{i + 1}</td>
                      <td className="py-1.5 px-2 font-bold text-slate-900">
                        <div>{ev.stageCode || 'Lintas Tahap'}</div>
                        <div className="text-[9px] text-slate-500 font-normal">{ev.dateRecorded}</div>
                      </td>
                      <td className="py-1.5 px-2 text-slate-700">
                        <div className="font-semibold">{ev.category.replace('_', ' ')}</div>
                        <div className="text-[9px] text-slate-500">{ev.locationOrSource || '-'}</div>
                      </td>
                      <td className="py-1.5 px-2">
                        <div className="font-bold text-slate-900">{ev.title}</div>
                        <div className="text-slate-600 mt-0.5 leading-relaxed">{ev.description}</div>
                      </td>
                      <td className="py-1.5 px-2 text-blue-900 font-medium">
                        {ev.referenceDoc || '-'}
                      </td>
                      <td className="py-1.5 px-2 text-center font-bold">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                          ev.severity === 'kritis' ? 'bg-red-100 text-red-900' :
                          ev.severity === 'sedang' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                        }`}>
                          {ev.severity.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 4: Formal Government Sign-off / Lembar Pengesahan */}
        <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs break-inside-avoid">
          <div>
            <div className="text-slate-500 mb-1">Mengetahui & Menyetujui:</div>
            <div className="font-bold text-slate-900">{signatory.approverTitle}</div>
            <div className="mt-14 pt-1 border-t border-slate-400 w-60 text-slate-800">
              <div className="font-bold">
                {signatory.approverName ? `( ${signatory.approverName} )` : '( ............................................ )'}
              </div>
              <div className="text-[10px] text-slate-600">
                NIP. {signatory.approverNip || '......................................'}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-slate-500 mb-1">
              Ditetapkan di {signatory.locationDate || 'Jakarta, tanggal: ....................'}
            </div>
            <div className="font-bold text-slate-900">{signatory.evaluatorTitle}</div>
            <div className="mt-14 pt-1 border-t border-slate-400 w-60 ml-auto text-slate-800 text-left">
              <div className="font-bold">
                {(signatory.evaluatorName || state.auditor)
                  ? `( ${signatory.evaluatorName || state.auditor} )`
                  : '( ............................................ )'}
              </div>
              <div className="text-[10px] text-slate-600">
                NIP. {signatory.evaluatorNip || '......................................'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
