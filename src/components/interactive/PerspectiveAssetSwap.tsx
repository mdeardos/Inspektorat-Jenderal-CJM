import React, { useState } from 'react';
import { 
  ArrowDownUp, 
  User, 
  ShieldAlert, 
  Sparkles, 
  Check, 
  ChevronRight,
  Eye,
  FileSpreadsheet,
  Clock,
  Layers
} from 'lucide-react';
import { ServiceModelId } from '../../types';

export type PerspectiveMode = 'citizen' | 'auditor';

interface PerspectiveAssetSwapProps {
  currentPerspective: PerspectiveMode;
  onPerspectiveChange: (mode: PerspectiveMode) => void;
  serviceModelId?: ServiceModelId;
  onSelectServiceModel?: (id: ServiceModelId) => void;
  className?: string;
}

export const PerspectiveAssetSwap: React.FC<PerspectiveAssetSwapProps> = ({
  currentPerspective,
  onPerspectiveChange,
  serviceModelId = 'guardian',
  onSelectServiceModel,
  className = ''
}) => {
  const [isRotating, setIsRotating] = useState(false);

  const handleFlip = () => {
    setIsRotating(true);
    const nextMode: PerspectiveMode = currentPerspective === 'citizen' ? 'auditor' : 'citizen';
    onPerspectiveChange(nextMode);
    setTimeout(() => setIsRotating(false), 500);
  };

  const perspectives = {
    citizen: {
      id: 'citizen' as PerspectiveMode,
      title: 'Kacamata Warga & Pelaku Usaha',
      badge: 'Citizen-Centric Lens',
      subtitle: 'Pengalaman Nyata & Pengurangan Beban Administratif',
      icon: User,
      color: 'from-blue-600 to-indigo-700',
      tagColor: 'bg-blue-100 text-blue-800 border-blue-200',
      focusItems: [
        'Beban Informasi: Kemudahan memahami regulasi & alur',
        'Beban Kepatuhan: Jumlah dokumen syarat & legalisasi',
        'Beban Psikologis: Stres waktu tunggu & kepastian SLA'
      ],
      primaryMetric: 'Skor Kepuasan (CSAT -2 s.d. +2)'
    },
    auditor: {
      id: 'auditor' as PerspectiveMode,
      title: 'Kacamata Auditor Inspektorat Jenderal',
      badge: '5C Internal Audit Lens',
      subtitle: 'Pengawasan Intern Berbasis IPPF IIA & COSO Framework',
      icon: ShieldAlert,
      color: 'from-amber-600 to-slate-900',
      tagColor: 'bg-amber-100 text-amber-900 border-amber-200',
      focusItems: [
        'Condition & Criteria: Gap antara fakta vs SOP / Permendag',
        'Root Cause: Titik lemah sistem & koordinasi lintas unit',
        'Corrective Action: Rekomendasi perbaikan tata kelola'
      ],
      primaryMetric: 'Matriks Kertas Kerja 5C Terintegrasi'
    }
  };

  const active = perspectives[currentPerspective];
  const opposite = perspectives[currentPerspective === 'citizen' ? 'auditor' : 'citizen'];

  const ActiveIcon = active.icon;
  const OppositeIcon = opposite.icon;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-4.5 ${className}`}>
      {/* Title Bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Perspective Swap: Lensa Evaluasi Interaktif
            </h4>
            <p className="text-[11px] text-slate-500">
              Tukar sudut pandang telaah antara Pelaku Usaha dan Pengawas Intern
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          Dual-Perspective
        </span>
      </div>

      {/* Primary Active Card */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-slate-50 to-blue-50/40 p-3.5 relative shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${active.color} text-white flex items-center justify-center shadow-xs`}>
              <ActiveIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Lensa Utama Aktif
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${active.tagColor}`}>
                  {active.badge}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900">{active.title}</div>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500">
            {active.primaryMetric}
          </span>
        </div>

        <ul className="mt-2.5 space-y-1 text-[11px] text-slate-600 pl-1 border-t border-slate-200/60 pt-2">
          {active.focusItems.map((item, idx) => (
            <li key={idx} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Floating Flip/Swap Button (Center Intersect) */}
      <div className="relative flex justify-center -my-3 z-10">
        <button
          type="button"
          onClick={handleFlip}
          className={`px-3 py-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-md border-2 border-white flex items-center gap-1.5 text-[11px] font-bold transition transform cursor-pointer hover:scale-105 active:scale-95 ${
            isRotating ? 'rotate-180 duration-500' : ''
          }`}
          title="Tukar Kacamata Sudut Pandang"
        >
          <ArrowDownUp className="w-3.5 h-3.5 text-amber-400" />
          <span>Tukar Kacamata Sudut Pandang</span>
        </button>
      </div>

      {/* Target / Secondary Preview Card */}
      <div 
        onClick={handleFlip}
        className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 pt-4.5 cursor-pointer hover:border-slate-300 hover:bg-slate-100/60 transition group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center group-hover:bg-slate-300 transition">
              <OppositeIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Klik untuk mengaktifkan lensa:</div>
              <div className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition">
                {opposite.title}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-700 flex items-center gap-0.5">
            <span>Beralih</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
