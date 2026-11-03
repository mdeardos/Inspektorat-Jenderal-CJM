import React, { useRef } from 'react';
import { 
  FileDown, 
  FileSpreadsheet, 
  Printer, 
  Loader2, 
  Check, 
  FolderOpen,
  Users,
  Upload,
  Download,
  RotateCcw
} from 'lucide-react';
import { EvaluationState } from '../types';

interface ModernCanvasHeaderProps {
  currentStep: number;
  onGoToStep: (step: number) => void;
  presetKey: string;
  onSelectPreset: (key: string) => void;
  saveStatus: string;
  sessionId?: string;
  onOpenSessionModal?: () => void;
  onOpenPortal?: () => void;
  onExportPDF: () => void;
  onExportExcel?: () => void;
  onPrintNative: () => void;
  isExportingPDF?: boolean;
  onExportJSON?: () => void;
  onImportJSON?: (imported: EvaluationState) => void;
  onReset?: () => void;
}

export const ModernCanvasHeader: React.FC<ModernCanvasHeaderProps> = ({
  currentStep,
  onGoToStep,
  presetKey,
  onSelectPreset,
  saveStatus,
  sessionId,
  onOpenSessionModal,
  onOpenPortal,
  onExportPDF,
  onExportExcel,
  onPrintNative,
  isExportingPDF = false,
  onExportJSON,
  onImportJSON,
  onReset
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportJSON) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && json.stages && Array.isArray(json.stages)) {
          onImportJSON(json);
        }
      } catch (err) {
        console.error('Gagal membaca berkas JSON', err);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const steps = [
    {
      num: 1,
      title: 'Identifikasi Objek',
      shortTitle: '1. Identifikasi Objek'
    },
    {
      num: 2,
      title: 'Kanvas CJM & Audit 5C',
      shortTitle: '2. Kanvas CJM & Audit 5C'
    },
    {
      num: 3,
      title: 'Co-Design & Laporan',
      shortTitle: '3. Co-Design & Laporan'
    }
  ];

  return (
    <header className="no-print select-none">
      {/* Top Government Masthead Strip */}
      <div className="gov-masthead-strip">
        <div className="gov-badge">
          <span className="indonesia-flag" aria-hidden="true" />
          <span>INSPEKTORAT JENDERAL &bull; KEMENTERIAN PERDAGANGAN REPUBLIK INDONESIA</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-[11px] font-semibold">
          <span className="hidden sm:inline">Sistem Pengawasan Internal Pemerintah (SPIP) &bull; Standar IPPF IIA</span>
          <span className="bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700 text-[10px]">
            {saveStatus}
          </span>
        </div>
      </div>

      {/* Main Core Header */}
      <div className="header-core">
        <div className="header-layout">
          {/* Brand Cluster */}
          <div className="brand-cluster">
            <div className="seal-box" aria-label="Logo Resmi Itjen Kemendag">
              <span>ITJEN</span>
              <span className="sub">KEMENDAG</span>
            </div>
            <div className="brand-headings">
              <h1>Customer Journey Map (CJM) Layanan Pengawasan</h1>
              <p>Pemantauan Pengalaman Auditee, Pengadu Masyarakat (WBS), dan Perumusan Rekomendasi 5C</p>
            </div>
          </div>

          {/* Phase Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800" aria-label="Navigasi Fase">
            {steps.map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;

              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => onGoToStep(step.num)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : isPast
                      ? 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/60'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                      isActive
                        ? 'bg-slate-950 text-amber-400'
                        : isPast
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPast ? <Check className="w-3 h-3 stroke-[3]" /> : step.num}
                  </div>
                  <span>{step.shortTitle}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Controls */}
          <div className="header-controls">
            {/* Hidden File Input for JSON import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />

            {/* Quick Session ID Pill */}
            <button
              type="button"
              onClick={onOpenSessionModal || onOpenPortal}
              className="btn btn-navy btn-sm"
              title="Kelola Ruang Kerja Tim Pengawasan"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono text-[11px] text-amber-300">
                {sessionId || 'ITJEN-DAGLU-01'}
              </span>
            </button>

            {/* JSON Export */}
            {onExportJSON && (
              <button
                type="button"
                onClick={onExportJSON}
                className="btn btn-navy btn-sm"
                title="Unduh seluruh data dalam format JSON"
              >
                <Download className="w-3.5 h-3.5 text-slate-300" />
                <span>Unduh JSON</span>
              </button>
            )}

            {/* Reset Data */}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="btn btn-navy btn-sm"
                title="Reset formulir ke data awal"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
                <span>Reset</span>
              </button>
            )}

            {/* PDF Export */}
            <button
              type="button"
              disabled={isExportingPDF}
              onClick={onExportPDF}
              className="btn btn-navy btn-sm"
              title="Unduh dokumen resmi PDF"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span>PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5 text-amber-300" />
                  <span>PDF</span>
                </>
              )}
            </button>

            {/* Print View Native Button */}
            <button
              type="button"
              onClick={onPrintNative}
              className="btn btn-gold btn-sm"
              title="Cetak langsung dokumen formulir resmi"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
