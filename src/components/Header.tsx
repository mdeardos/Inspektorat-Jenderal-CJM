import React, { useState, useRef } from 'react';
import { 
  Printer, 
  RotateCcw, 
  Download, 
  Upload, 
  Check, 
  Building2,
  FileSpreadsheet,
  FileDown,
  Loader2,
  Camera,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { EvaluationState } from '../types';

interface HeaderProps {
  currentStep: number;
  onGoToStep: (step: number) => void;
  presetKey: string;
  onSelectPreset: (key: string) => void;
  onReset: () => void;
  onExportPDF: () => void;
  onPrintNative: () => void;
  isExportingPDF?: boolean;
  onExportExcel?: () => void;
  onExportJSON: () => void;
  onImportJSON: (imported: EvaluationState) => void;
  onExportCSV: () => void;
  saveStatus: string;
  evidencesCount?: number;
  onOpenEvidenceTracker?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onGoToStep,
  presetKey,
  onSelectPreset,
  onReset,
  onExportPDF,
  onPrintNative,
  isExportingPDF = false,
  onExportExcel,
  onExportJSON,
  onImportJSON,
  onExportCSV,
  saveStatus,
  evidencesCount = 0,
  onOpenEvidenceTracker
}) => {
  const [resetConfirming, setResetConfirming] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  return (
    <header className="bg-[#0b1c3d] text-white border-b border-slate-700/80 sticky top-0 z-30 shadow-md no-print">
      {/* Decorative Gold & Crimson Hairline Trim */}
      <div className="h-1 w-full bg-gradient-to-r from-[#c81e25] via-blue-600 to-amber-500" />

      {/* Upper Bar: Executive Dossier Header & Official Seals */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Agency Wordmark */}
        <div className="flex items-center gap-3.5">
          {/* Logo Resmi Itjen Kemendag */}
          <div 
            className="p-1 rounded-xl bg-white border border-amber-500/30 shadow-xs flex items-center justify-center shrink-0 hover:ring-2 hover:ring-blue-400/50 transition"
            title="Inspektorat Jenderal Kementerian Perdagangan Republik Indonesia"
          >
            <img
              src="/assets/aistudio/image_6fb22ebf.png"
              alt="Logo Resmi Inspektorat Jenderal Kementerian Perdagangan"
              width={42}
              height={42}
              className="h-10 w-auto object-contain shrink-0"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-amber-400 font-mono">
                Inspektorat Jenderal · Kementerian Perdagangan RI
              </span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span className="text-[10px] text-slate-300 font-semibold hidden sm:inline-block">
                Kertas Kerja Pengawasan Pelayanan Publik
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
              <span>Evaluasi Citizen-Centric & Customer Journey Mapping (CJM)</span>
            </h1>
            <div className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5">
              <span className="text-slate-400">Status Berkas:</span>
              <span className="text-emerald-400 font-mono text-[10px] font-semibold">{saveStatus}</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Docket Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Executive Case Study / Docket Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700 hover:border-slate-600 rounded-lg px-2.5 py-1.5 transition-colors shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-[11px] text-slate-400 font-medium hidden lg:inline">Berkas Objek:</span>
            <select
              value={presetKey}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="bg-transparent text-slate-100 text-xs font-semibold focus:outline-none cursor-pointer py-0.5 pr-1 max-w-[200px] sm:max-w-[260px] truncate"
              title="Pilih Berkas Studi Kasus Layanan"
            >
              <option value="perizinan" className="bg-[#0b1c3d] text-white">1. Persetujuan Impor INATRADE (Ditjen Daglu)</option>
              <option value="pengaduan" className="bg-[#0b1c3d] text-white">2. Pengaduan Konsumen (Ditjen PKTN)</option>
              <option value="bantuan" className="bg-[#0b1c3d] text-white">3. Fasilitasi Pameran Ekspor (DJPEN)</option>
              <option value="kependudukan" className="bg-[#0b1c3d] text-white">4. Pendaftaran Waralaba STPW (Ditjen PDN)</option>
              <option value="kosong" className="bg-[#0b1c3d] text-white">5. Kanvas Kosong (Evaluasi Baru Itjen)</option>
            </select>
          </div>

          {/* Quick Access: Pelacak Bukti Lapangan */}
          {onOpenEvidenceTracker && (
            <button
              type="button"
              onClick={onOpenEvidenceTracker}
              className="inline-flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs"
              title="Buka Pelacak Bukti Lapangan & Fakta Temuan"
            >
              <Camera className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Bukti Lapangan</span>
              {evidencesCount > 0 && (
                <span className="px-1.5 py-0.2 bg-blue-600 text-white text-[10px] rounded-full font-bold">
                  {evidencesCount}
                </span>
              )}
            </button>
          )}

          {/* More options dropdown: Import/Export JSON, CSV */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center gap-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs"
              title="Ekspor & Impor Data Berkas"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Data</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-60 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs text-slate-200 divide-y divide-slate-800 animate-in fade-in zoom-in-95 duration-100">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        onExportJSON();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-800/80 flex items-center gap-2.5 transition"
                    >
                      <Download className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">Simpan File (.JSON)</div>
                        <div className="text-[10px] text-slate-400">Cadangkan seluruh evaluasi untuk dibagikan</div>
                      </div>
                    </button>

                    {onExportExcel && (
                      <button
                        type="button"
                        onClick={() => {
                          onExportExcel();
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-800/80 flex items-center gap-2.5 transition group"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span>Unduh Excel (.XLSX)</span>
                            <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1.5 py-0.2 rounded font-bold">Resmi</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Lembar kerja 3-sheet siap edit manual</div>
                        </div>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onExportCSV();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-800/80 flex items-center gap-2.5 transition"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-teal-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">Ekspor Matriks (.CSV)</div>
                        <div className="text-[10px] text-slate-400">Format data tabel universal</div>
                      </div>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        fileInputRef.current?.click();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-800/80 flex items-center gap-2.5 transition"
                    >
                      <Upload className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">Buka File (.JSON)</div>
                        <div className="text-[10px] text-slate-400">Muat draf evaluasi tersimpan</div>
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

          {/* Quick Excel Export button */}
          {onExportExcel && (
            <button
              type="button"
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs"
              title="Unduh seluruh kertas kerja dalam format Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Excel</span>
            </button>
          )}

          {/* Primary CTA: Unduh Berkas PDF (.pdf) */}
          <button
            type="button"
            disabled={isExportingPDF}
            onClick={onExportPDF}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-xs"
            title="Unduh langsung dokumen PDF laporan evaluasi resmi"
          >
            {isExportingPDF ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyiapkan PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5" />
                <span>Unduh PDF</span>
              </>
            )}
          </button>

          {/* Secondary CTA: Cetak Langsung (Printer Dialog) */}
          <button
            type="button"
            onClick={onPrintNative}
            className="inline-flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs"
            title="Cetak langsung melalui dialog cetak peramban / printer fisik"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>

          {/* Reset button with 2-step inline confirm */}
          <button
            type="button"
            onClick={handleResetClick}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
              resetConfirming
                ? 'bg-rose-600 border-rose-500 text-white font-semibold shadow-xs'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-300'
            }`}
            title="Kembalikan data ke awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetConfirming ? 'Yakin Reset?' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Executive Stepper Timeline / Audit Progress Rail */}
      <div className="bg-[#071329] border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center justify-between py-1.5 overflow-x-auto custom-scrollbar" aria-label="Alur Pengawasan Eksekutif">
            <div className="flex items-center gap-2 sm:gap-4 w-full">
              {[
                { 
                  num: 1, 
                  code: 'FASE I',
                  title: 'Identifikasi Objek & 5 Model Layanan',
                  subtitle: 'Karakteristik Layanan & Persona Warga'
                },
                { 
                  num: 2, 
                  code: 'FASE II',
                  title: 'Kanvas Pengujian Perjalanan (CJM)',
                  subtitle: 'Pemeriksaan 6 Tahapan & Bukti Lapangan'
                },
                { 
                  num: 3, 
                  code: 'FASE III',
                  title: 'Rencana Co-Design & Pengesahan',
                  subtitle: 'Solusi Pangkas Beban & Laporan Resmi'
                }
              ].map((step, idx) => {
                const isActive = currentStep === step.num;
                const isPast = currentStep > step.num;

                return (
                  <React.Fragment key={step.num}>
                    <button
                      type="button"
                      onClick={() => onGoToStep(step.num)}
                      className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-left transition-all whitespace-nowrap shrink-0 group ${
                        isActive
                          ? 'bg-blue-600/30 text-white border border-blue-500/50 shadow-inner'
                          : isPast
                          ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                          isActive
                            ? 'bg-blue-500 text-white shadow-sm ring-2 ring-blue-400/40'
                            : isPast
                            ? 'bg-emerald-500 text-slate-950 font-extrabold'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : step.num}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-mono font-bold tracking-wider tabular-nums ${isActive ? 'text-amber-400' : isPast ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {step.code}
                          </span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          )}
                        </div>
                        <span className={`text-xs font-bold tracking-tight ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                          {step.title}
                        </span>
                        <span className="text-[10px] text-slate-400 hidden md:inline">
                          {step.subtitle}
                        </span>
                      </div>
                    </button>

                    {idx < 2 && (
                      <div className="hidden sm:flex flex-1 items-center px-1">
                        <div className={`h-0.5 w-full rounded-full transition-colors ${
                          isPast ? 'bg-emerald-500/50' : 'bg-slate-800'
                        }`} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
