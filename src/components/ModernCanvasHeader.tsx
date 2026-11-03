import React from 'react';
import { 
  Building2, 
  FileDown, 
  FileSpreadsheet, 
  Printer, 
  Loader2, 
  Check, 
  ChevronRight,
  ShieldCheck,
  Users,
  KeyRound,
  Lock
} from 'lucide-react';

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
  isExportingPDF = false
}) => {
  const steps = [
    {
      num: 1,
      code: 'FASE I',
      title: 'Identifikasi Objek & 5 Model Layanan',
      shortTitle: 'Identifikasi & Model'
    },
    {
      num: 2,
      code: 'FASE II',
      title: 'Kanvas Pengujian Perjalanan (CJM)',
      shortTitle: 'Kanvas Perjalanan (CJM)'
    },
    {
      num: 3,
      code: 'FASE III',
      title: 'Rencana Co-Design & Pengesahan',
      shortTitle: 'Rencana & Pengesahan'
    }
  ];

  return (
    <header className="border-b border-slate-200/90 bg-white px-5 sm:px-8 py-4 sm:py-5 flex flex-col gap-4 no-print select-none">
      {/* Top Row: Brand & Official Status + Case Selector + Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Ministry Branding & Status */}
        <div className="flex items-center gap-3">
          {/* Mobile view only logo (since sidebar is hidden on mobile) */}
          <div className="lg:hidden w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
            <img
              src="/assets/aistudio/image_6fb22ebf.png"
              alt="Logo Resmi Itjen Kemendag"
              width={34}
              height={34}
              className="h-8 w-auto object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider text-[#0b1c3d] uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Inspektorat Jenderal · Kementerian Perdagangan RI</span>
              </span>
              <span className="text-slate-300 hidden sm:inline" aria-hidden="true">·</span>
              <span className="text-xs text-slate-500 font-mono tabular-nums text-[11px] hidden sm:inline">
                {saveStatus}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-0.5">
              Instrumen Evaluasi Pelayanan Publik Citizen-Centric
            </h1>
          </div>
        </div>

        {/* Right: Case Study / Docket Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Docket / Studi Kasus Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-1.5 transition-colors shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span className="text-[11px] text-slate-500 font-medium hidden md:inline">Studi Kasus:</span>
            <select
              value={presetKey}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer py-0.5 max-w-[190px] sm:max-w-[240px] truncate"
              title="Pilih Berkas Studi Kasus Layanan Kemendag"
            >
              <option value="perizinan">1. Persetujuan Impor INATRADE (Ditjen Daglu)</option>
              <option value="pengaduan">2. Pengaduan Konsumen (Ditjen PKTN)</option>
              <option value="bantuan">3. Fasilitasi Pameran Ekspor (DJPEN)</option>
              <option value="kependudukan">4. Pendaftaran Waralaba STPW (Ditjen PDN)</option>
              <option value="kosong">5. Kanvas Kosong (Evaluasi Baru Itjen)</option>
            </select>
          </div>

          {/* Merged Inspektorat & Tim Kolaborasi Trigger */}
          <button
            type="button"
            onClick={onOpenSessionModal || onOpenPortal}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/90 hover:bg-blue-100 border border-blue-300 text-blue-950 font-sans text-xs font-bold tracking-tight shadow-2xs transition cursor-pointer active:scale-95 group"
            title="Pilih Inspektorat, Ganti Tim, atau Bagikan Tautan Kolaborasi"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-700 group-hover:scale-110 transition-transform" />
            <span className="font-mono text-[11px] font-extrabold text-[#0b1c3d] bg-white px-1.5 py-0.5 rounded border border-blue-200">
              {sessionId || 'ITJEN-1-DAGLU-01'}
            </span>
            <span className="hidden sm:inline text-blue-800 font-semibold text-[11px]">
              Tim Inspektorat & Kolaborasi
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-100/90 font-mono px-1.5 py-0.2 rounded-md hidden lg:inline">
              Aktif ✓
            </span>
          </button>

          {/* Quick Excel Export */}
          {onExportExcel && (
            <button
              type="button"
              onClick={onExportExcel}
              className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
              title="Unduh kertas kerja lengkap dalam format Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Excel (.xlsx)</span>
            </button>
          )}

          {/* Quick PDF Export */}
          <button
            type="button"
            disabled={isExportingPDF}
            onClick={onExportPDF}
            className="inline-flex items-center gap-1.5 bg-[#0b1c3d] hover:bg-blue-950 active:scale-95 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Unduh laporan resmi PDF"
          >
            {isExportingPDF ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Menyiapkan PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-amber-400" />
                <span>Unduh PDF</span>
              </>
            )}
          </button>

          {/* Print Dialog */}
          <button
            type="button"
            onClick={onPrintNative}
            className="hidden md:inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Cetak langsung ke peramban / printer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Cetak A4</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Executive Timeline Stepper */}
      <nav 
        className="flex items-center gap-2 sm:gap-3 overflow-x-auto custom-scrollbar pt-2 border-t border-slate-100"
        aria-label="Alur Pengawasan Eksekutif"
      >
        {steps.map((step, idx) => {
          const isActive = currentStep === step.num;
          const isPast = currentStep > step.num;

          return (
            <React.Fragment key={step.num}>
              <button
                type="button"
                onClick={() => onGoToStep(step.num)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-left transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-950 border border-blue-300/80 shadow-2xs'
                    : isPast
                    ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-all shrink-0 ${
                    isActive
                      ? 'bg-[#0b1c3d] text-white shadow-2xs'
                      : isPast
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.num}
                </div>
                <div className="flex flex-col">
                  <span className={`text-[10px] font-mono font-bold tracking-wider ${isActive ? 'text-blue-900' : isPast ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {step.code}
                  </span>
                  <span className={`text-xs font-bold tracking-tight ${isActive ? 'text-slate-950' : 'text-slate-700'}`}>
                    {step.shortTitle}
                  </span>
                </div>
              </button>

              {idx < steps.length - 1 && (
                <div className="hidden sm:flex flex-1 items-center px-1">
                  <div className={`h-0.5 w-full rounded-full transition-colors ${
                    isPast ? 'bg-emerald-500/60' : 'bg-slate-200'
                  }`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </header>
  );
};
