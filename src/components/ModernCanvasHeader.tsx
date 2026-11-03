import React, { useRef } from 'react';
import { 
  Building2, 
  FileDown, 
  FileSpreadsheet, 
  Printer, 
  Loader2, 
  Check, 
  ShieldCheck,
  FolderOpen,
  Users,
  Upload,
  Download,
  RotateCcw,
  Sparkles
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
      code: 'FASE I',
      title: 'Identifikasi Objek & 5 Model Layanan',
      shortTitle: '1. Identifikasi & Model'
    },
    {
      num: 2,
      code: 'FASE II',
      title: 'Kanvas Perjalanan Warga (CJM & Audit 5C)',
      shortTitle: '2. Kanvas CJM & Audit 5C'
    },
    {
      num: 3,
      code: 'FASE III',
      title: 'Rencana Co-Design & Pengesahan',
      shortTitle: '3. Co-Design & Laporan'
    }
  ];

  return (
    <header className="w-full bg-[#071426] text-white shadow-md border-b border-slate-800 no-print select-none">
      {/* Top National Ribbon Accent */}
      <div className="h-1 w-full bg-gradient-to-r from-red-600 via-white to-red-600 opacity-90" />

      {/* Main Bar */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Brand & Ministry Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-2 flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ITJEN KEMENDAG RI</span>
              </span>
              <span className="text-slate-600 hidden sm:inline" aria-hidden="true">•</span>
              <span className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:inline">
                Standar IPPF IIA & Permendag
              </span>
              <span className="text-slate-600 hidden md:inline" aria-hidden="true">•</span>
              <span className="text-[10px] text-slate-300 font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 hidden md:inline">
                {saveStatus}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight mt-0.5">
              Instrumen Evaluasi Pelayanan Publik Citizen-Centric
            </h1>
          </div>
        </div>

        {/* Center: Executive Stepper Tabs */}
        <nav 
          className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 self-start lg:self-auto overflow-x-auto max-w-full"
          aria-label="Navigasi Fase Pengawasan"
        >
          {steps.map((step) => {
            const isActive = currentStep === step.num;
            const isPast = currentStep > step.num;

            return (
              <button
                key={step.num}
                type="button"
                onClick={() => onGoToStep(step.num)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : isPast
                    ? 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/60'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                    isActive
                      ? 'bg-slate-950 text-amber-400'
                      : isPast
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
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

        {/* Right: Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Case Study Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
            <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={presetKey}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer py-0.5 max-w-[160px] sm:max-w-[210px] truncate"
              title="Pilih Berkas Studi Kasus Layanan Kemendag"
            >
              <option value="perizinan" className="bg-slate-900 text-white">1. Persetujuan Impor INATRADE (Daglu)</option>
              <option value="pengaduan" className="bg-slate-900 text-white">2. Pengaduan Konsumen (PKTN)</option>
              <option value="bantuan" className="bg-slate-900 text-white">3. Pameran Ekspor (DJPEN)</option>
              <option value="kependudukan" className="bg-slate-900 text-white">4. Waralaba STPW (PDN)</option>
              <option value="kosong" className="bg-slate-900 text-white">5. Kanvas Kosong (Baru)</option>
            </select>
          </div>

          {/* Session / Inspectorate Trigger */}
          <button
            type="button"
            onClick={onOpenSessionModal || onOpenPortal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
            title="Kelola Ruang Kerja Tim Inspektorat"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono text-[11px] text-amber-300">
              {sessionId || 'ITJEN-DAGLU-01'}
            </span>
          </button>

          {/* Excel Export */}
          {onExportExcel && (
            <button
              type="button"
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer"
              title="Unduh kertas kerja matriks Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Excel</span>
            </button>
          )}

          {/* PDF Export */}
          <button
            type="button"
            disabled={isExportingPDF}
            onClick={onExportPDF}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer disabled:opacity-50 shadow-sm"
            title="Unduh laporan resmi PDF"
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

          {/* Print Dialog */}
          <button
            type="button"
            onClick={onPrintNative}
            className="hidden xl:inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-xl transition cursor-pointer"
            title="Cetak langsung dokumen format A4"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Cetak</span>
          </button>
        </div>
      </div>
    </header>
  );
};
