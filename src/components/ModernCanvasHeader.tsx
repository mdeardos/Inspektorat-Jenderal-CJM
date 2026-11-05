import React, { useRef } from 'react';
import { 
  FileDown, 
  FileSpreadsheet, 
  Printer, 
  Loader2, 
  Check, 
  Users, 
  Download, 
  RotateCcw,
  Building,
  ShieldCheck,
  ChevronRight,
  ExternalLink
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
    { num: 1, title: 'Identifikasi Objek', shortTitle: 'Identifikasi Objek' },
    { num: 2, title: 'Kanvas CJM & Audit 5C', shortTitle: 'Kanvas CJM & Audit 5C' },
    { num: 3, title: 'Co-Design & Rekomendasi', shortTitle: 'Co-Design & Rekomendasi' }
  ];

  return (
    <header className="no-print select-none border-b border-slate-800 bg-[#070e1e] text-white">
      {/* Top Republic of Indonesia Masthead */}
      <div className="border-b border-white/10 bg-[#050a16] px-4 py-1.5 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Merah Putih flag */}
            <div className="flex h-3 w-4.5 flex-col overflow-hidden rounded-xs border border-white/20 shadow-xs" aria-hidden="true">
              <div className="h-1.5 bg-[#ef4444]" />
              <div className="h-1.5 bg-white" />
            </div>
            <span className="font-semibold tracking-wide text-slate-300">
              KEMENTERIAN PERDAGANGAN REPUBLIK INDONESIA
            </span>
            <span className="hidden text-slate-600 sm:inline">|</span>
            <span className="hidden text-amber-400 font-semibold sm:inline">
              INSPEKTORAT JENDERAL (ITJEN)
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 font-mono text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {saveStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation & Brand Header */}
      <div className="px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          
          {/* Brand Cluster */}
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-[#0d1b38] border border-amber-500/40 text-amber-400 shadow-md">
              <ShieldCheck className="h-5 w-5 text-amber-400" />
              <span className="text-[8px] font-extrabold tracking-wider text-amber-200">ITJEN</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white sm:text-lg">
                  Instrumen Audit & Customer Journey Mapping
                </h1>
                <span className="hidden rounded-md bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-400/20 lg:inline">
                  Kemendag 5C
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pengawasan Intern Pelayanan Publik & Rekomendasi Audit Kualitatif
              </p>
            </div>
          </div>

          {/* Stepper Navigation */}
          <nav className="flex items-center rounded-xl bg-slate-900/90 p-1 border border-slate-800" aria-label="Alur Pengisian">
            {steps.map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;

              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => onGoToStep(step.num)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : isPast
                      ? 'text-emerald-400 hover:bg-slate-800/80 hover:text-emerald-300'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div
                    className={`flex h-4.5 w-4.5 items-center justify-center rounded text-[10px] font-mono font-bold ${
                      isActive
                        ? 'bg-slate-950 text-amber-400'
                        : isPast
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPast ? <Check className="h-3 w-3 stroke-[3]" /> : step.num}
                  </div>
                  <span className="hidden sm:inline">{step.shortTitle}</span>
                  <span className="sm:hidden">{step.num}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {/* Session Room Button */}
            <button
              type="button"
              onClick={onOpenSessionModal || onOpenPortal}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white hover:border-slate-600 cursor-pointer shadow-xs"
              title="Kelola Ruang Kerja Sesi Tim & Inspektorat"
            >
              <Users className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-mono text-[11px] text-amber-300 font-bold">
                {sessionId || 'ITJEN-DAGLU-01'}
              </span>
            </button>

            {/* Portal Inspektorat Link */}
            {onOpenPortal && (
              <button
                type="button"
                onClick={onOpenPortal}
                className="hidden xl:flex items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-800/50 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                title="Buka Beranda Portal 4 Inspektorat"
              >
                <Building className="h-3.5 w-3.5 text-blue-400" />
                <span>Portal Tim</span>
              </button>
            )}

            {/* Export Excel */}
            {onExportExcel && (
              <button
                type="button"
                onClick={onExportExcel}
                className="flex items-center gap-1 rounded-lg border border-emerald-600/40 bg-emerald-950/40 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 hover:text-emerald-100 transition cursor-pointer"
                title="Unduh Kertas Kerja Format Excel (XLSX)"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden lg:inline">Excel</span>
              </button>
            )}

            {/* Export PDF */}
            <button
              type="button"
              disabled={isExportingPDF}
              onClick={onExportPDF}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer disabled:opacity-50"
              title="Unduh Dokumen Resmi Format PDF"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-300" />
                  <span>PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="h-3.5 w-3.5 text-amber-400" />
                  <span>PDF</span>
                </>
              )}
            </button>

            {/* Print Document */}
            <button
              type="button"
              onClick={onPrintNative}
              className="flex items-center gap-1 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-300 transition cursor-pointer shadow-xs"
              title="Cetak Langsung Lembar Evaluasi"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cetak Dokumen</span>
            </button>

            {/* Hidden JSON File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
          </div>

        </div>
      </div>
    </header>
  );
};
