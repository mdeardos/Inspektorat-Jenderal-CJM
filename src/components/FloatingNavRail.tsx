import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Layers, 
  FileText, 
  Camera, 
  FileSpreadsheet, 
  FileDown, 
  Printer, 
  RotateCcw, 
  Download, 
  Upload, 
  Loader2,
  Check,
  ChevronRight,
  Database,
  Users
} from 'lucide-react';
import { EvaluationState } from '../types';

interface FloatingNavRailProps {
  currentStep: number;
  onGoToStep: (step: number) => void;
  evidencesCount?: number;
  onOpenEvidenceTracker: () => void;
  onOpenSessionModal?: () => void;
  onOpenPortal?: () => void;
  onExportPDF: () => void;
  onExportExcel?: () => void;
  onPrintNative: () => void;
  isExportingPDF?: boolean;
  onExportJSON: () => void;
  onImportJSON: (imported: EvaluationState) => void;
  onExportCSV: () => void;
  onReset: () => void;
}

export const FloatingNavRail: React.FC<FloatingNavRailProps> = ({
  currentStep,
  onGoToStep,
  evidencesCount = 0,
  onOpenEvidenceTracker,
  onOpenSessionModal,
  onOpenPortal,
  onExportPDF,
  onExportExcel,
  onPrintNative,
  isExportingPDF = false,
  onExportJSON,
  onImportJSON,
  onExportCSV,
  onReset
}) => {
  const [resetConfirming, setResetConfirming] = useState(false);
  const [dataMenuOpen, setDataMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleResetClick = () => {
    if (!resetConfirming) {
      setResetConfirming(true);
      setTimeout(() => setResetConfirming(false), 3500);
    } else {
      setResetConfirming(false);
      onReset();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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

  const navItems = [
    {
      step: 1,
      title: 'Fase I: Identifikasi & 5 Model Layanan',
      shortTitle: 'Fase I',
      icon: Building2,
      badge: '1'
    },
    {
      step: 2,
      title: 'Fase II: Kanvas Pengujian Perjalanan (CJM)',
      shortTitle: 'Fase II',
      icon: Layers,
      badge: '2'
    },
    {
      step: 3,
      title: 'Fase III: Rencana Co-Design & Laporan Resmi',
      shortTitle: 'Fase III',
      icon: FileText,
      badge: '3'
    }
  ];

  return (
    <>
      {/* ====================================================
          DESKTOP & TABLET: FLOATING VERTICAL PILL RAIL
          ==================================================== */}
      <aside 
        className="hidden lg:flex flex-col items-center justify-between w-20 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-md p-3 sticky top-6 h-[calc(100vh-3rem)] shrink-0 z-40 transition-all select-none no-print"
        aria-label="Navigasi Utama Pelayanan Publik"
      >
        {/* Top: Kemendag Itjen Official Logo */}
        <div className="flex flex-col items-center gap-1.5 pt-1">
          <button 
            type="button"
            onClick={onOpenPortal || onOpenSessionModal}
            className="w-13 h-13 rounded-2xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-xs hover:shadow-sm hover:border-blue-400 transition cursor-pointer group"
            title="Buka Portal Beranda Sesi Tim (Landing Page)"
          >
            <img
              src="/assets/aistudio/image_6fb22ebf.png"
              alt="Logo Resmi Inspektorat Jenderal Kementerian Perdagangan"
              width={44}
              height={44}
              className="w-auto h-11 object-contain group-hover:scale-105 transition-transform"
            />
          </button>
          <span className="text-[9px] font-mono font-bold tracking-wider text-slate-500 uppercase text-center leading-none mt-1">
            PORTAL
          </span>
          <div className="w-8 h-px bg-slate-200 mt-1 mb-1" />
        </div>

        {/* Center: Phase Navigation & Evidence Tracker */}
        <div className="flex flex-col items-center gap-2.5 w-full my-auto">
          {navItems.map((item) => {
            const isActive = currentStep === item.step;
            const isPast = currentStep > item.step;
            const Icon = item.icon;

            return (
              <div key={item.step} className="relative group w-full flex justify-center">
                <button
                  type="button"
                  onClick={() => onGoToStep(item.step)}
                  className={`relative w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0b1c3d] text-white shadow-md shadow-blue-950/20 scale-105'
                      : isPast
                      ? 'bg-blue-50/80 text-blue-900 hover:bg-blue-100 hover:text-blue-950 border border-blue-200/60'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/70'
                  }`}
                  aria-label={item.title}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                  <span className={`text-[9px] font-bold mt-0.5 font-mono ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>
                    {item.shortTitle}
                  </span>

                  {/* Top Right Mini Step Badge */}
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold font-mono shadow-2xs ${
                    isActive
                      ? 'bg-amber-400 text-slate-950'
                      : isPast
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isPast ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : item.badge}
                  </div>
                </button>

                {/* Hover Tooltip Right */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all shadow-xl z-50 flex items-center gap-1.5">
                  <span>{item.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            );
          })}

          {/* Evidence Tracker Button */}
          <div className="relative group w-full flex justify-center pt-1.5">
            <button
              type="button"
              onClick={onOpenEvidenceTracker}
              className="relative w-12 h-12 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 text-slate-700 hover:text-blue-900 flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xs hover:shadow-xs"
              title="Pelacak Bukti Lapangan & Fakta Pengawasan"
              aria-label="Buka Pelacak Bukti Lapangan"
            >
              <Camera className="w-5 h-5" />
              <span className="text-[9px] font-semibold text-slate-500 mt-0.5">Bukti</span>
              {evidencesCount > 0 && (
                <div className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-4.5 rounded-full bg-blue-600 text-white text-[9px] font-mono font-bold text-center shadow-2xs">
                  {evidencesCount}
                </div>
              )}
            </button>

            {/* Hover Tooltip */}
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all shadow-xl z-50">
              Pelacak Bukti Lapangan ({evidencesCount} Lampiran)
            </div>
          </div>

          {/* Unified Inspektorat & Collaboration Button */}
          {(onOpenSessionModal || onOpenPortal) && (
            <div className="relative group w-full flex justify-center pt-1">
              <button
                type="button"
                onClick={onOpenSessionModal || onOpenPortal}
                className="relative w-12 h-12 rounded-2xl bg-blue-50/80 hover:bg-blue-100/90 border border-blue-200 hover:border-blue-300 text-blue-900 flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                title="Pilih Tim Inspektorat & Kolaborasi"
                aria-label="Pilih Tim Inspektorat & Kolaborasi"
              >
                <Building2 className="w-5 h-5 text-blue-800" />
                <span className="text-[9px] font-bold text-blue-900 mt-0.5">Tim</span>
              </button>

              {/* Hover Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all shadow-xl z-50">
                Pilih Tim Inspektorat & Kolaborasi (Permendag 6/2025)
              </div>
            </div>
          )}
        </div>

        {/* Bottom: Quick Document & Export Actions */}
        <div className="flex flex-col items-center gap-2 pb-1 w-full pt-2 border-t border-slate-100">
          {/* Quick PDF Export */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              disabled={isExportingPDF}
              onClick={onExportPDF}
              className="w-11 h-11 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
              aria-label="Unduh PDF Resmi"
            >
              {isExportingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-700" />
              ) : (
                <FileDown className="w-4 h-4 text-blue-700" />
              )}
            </button>
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all shadow-xl z-50">
              Unduh Laporan PDF Eksekutif
            </div>
          </div>

          {/* Quick Excel Export */}
          {onExportExcel && (
            <div className="relative group w-full flex justify-center">
              <button
                type="button"
                onClick={onExportExcel}
                className="w-11 h-11 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                aria-label="Unduh Excel .XLSX"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              </button>
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all shadow-xl z-50">
                Ekstrak Kertas Kerja Excel (.xlsx)
              </div>
            </div>
          )}

          {/* Print Dialog */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              onClick={onPrintNative}
              className="w-11 h-11 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              aria-label="Cetak A4 Landscape"
            >
              <Printer className="w-4 h-4" />
            </button>
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all shadow-xl z-50">
              Cetak A4 Landscape
            </div>
          </div>

          {/* Data Backup & Reset Popover */}
          <div className="relative w-full flex justify-center">
            <button
              type="button"
              onClick={() => setDataMenuOpen(!dataMenuOpen)}
              className="w-11 h-11 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              title="Cadangan Data & Pengaturan"
              aria-label="Buka Menu Data & Cadangan"
            >
              <Database className="w-4 h-4" />
            </button>

            {dataMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setDataMenuOpen(false)} 
                />
                <div className="absolute left-full ml-3 bottom-0 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-800">
                  <div className="px-3.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Cadangan & Impor Data
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        onExportJSON();
                        setDataMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2.5 transition"
                    >
                      <Download className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="font-semibold text-white">Simpan JSON</div>
                        <div className="text-[10px] text-slate-400">Ekspor berkas lengkap</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        fileInputRef.current?.click();
                        setDataMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2.5 transition"
                    >
                      <Upload className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="font-semibold text-white">Buka File JSON</div>
                        <div className="text-[10px] text-slate-400">Muat draf evaluasi</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onExportCSV();
                        setDataMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2.5 transition"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-teal-400" />
                      <div>
                        <div className="font-semibold text-white">Ekspor CSV Matriks</div>
                        <div className="text-[10px] text-slate-400">Data tabular universal</div>
                      </div>
                    </button>
                  </div>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleResetClick();
                        setDataMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-950/80 text-rose-300 flex items-center gap-2.5 transition"
                    >
                      <RotateCcw className="w-4 h-4 text-rose-400" />
                      <div>
                        <div className="font-semibold">Reset ke Awal</div>
                        <div className="text-[10px] text-rose-400">Kosongkan/setel ulang data</div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </aside>

      {/* ====================================================
          MOBILE & TABLET: FLOATING BOTTOM DOCK
          ==================================================== */}
      <nav 
        className="lg:hidden fixed bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl p-2 z-50 flex items-center justify-around no-print"
        aria-label="Navigasi Bawah Seluler"
      >
        {navItems.map((item) => {
          const isActive = currentStep === item.step;
          const Icon = item.icon;

          return (
            <button
              key={item.step}
              type="button"
              onClick={() => onGoToStep(item.step)}
              className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                isActive
                  ? 'bg-[#0b1c3d] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className={`text-[10px] font-bold font-mono mt-0.5 ${isActive ? 'text-amber-400' : 'text-slate-600'}`}>
                {item.shortTitle}
              </span>
            </button>
          );
        })}

        {(onOpenSessionModal || onOpenPortal) && (
          <button
            type="button"
            onClick={onOpenSessionModal || onOpenPortal}
            className="flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center text-blue-900 bg-blue-50 hover:bg-blue-100 transition-all border border-blue-200/70"
            title="Pilih Tim Inspektorat & Kolaborasi"
          >
            <Building2 className="w-4 h-4 text-blue-800" />
            <span className="text-[10px] font-bold mt-0.5">Tim</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenEvidenceTracker}
          className="flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all relative"
        >
          <Camera className="w-4 h-4" />
          <span className="text-[10px] font-semibold mt-0.5">Bukti</span>
          {evidencesCount > 0 && (
            <div className="absolute top-1 right-3 px-1 min-w-3.5 rounded-full bg-blue-600 text-white text-[8px] font-mono font-bold text-center">
              {evidencesCount}
            </div>
          )}
        </button>

        <button
          type="button"
          disabled={isExportingPDF}
          onClick={onExportPDF}
          className="flex-1 py-1.5 px-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center justify-center transition-all shadow-xs"
        >
          {isExportingPDF ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <FileDown className="w-4 h-4 text-white" />
          )}
          <span className="text-[10px] font-bold mt-0.5">PDF</span>
        </button>
      </nav>
    </>
  );
};
