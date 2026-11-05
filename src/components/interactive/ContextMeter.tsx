import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  BarChart2, 
  Grid, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  Brain,
  FileCheck2,
  HeartPulse,
  ShieldCheck
} from 'lucide-react';
import { StageItem } from '../../types';

export type BurdenKind = 'learning' | 'compliance' | 'psychological' | 'clean';

interface ContextMeterProps {
  stages: StageItem[];
  className?: string;
  onFilterByBurden?: (kind: BurdenKind | 'all') => void;
}

export const ContextMeter: React.FC<ContextMeterProps> = ({
  stages,
  className = '',
  onFilterByBurden
}) => {
  const [hoveredKind, setHoveredKind] = useState<BurdenKind | null>(null);
  const [displayMode, setDisplayMode] = useState<'bar' | 'dots'>('bar');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Calculate distributions
  const stats = useMemo(() => {
    let learningCount = 0;
    let complianceCount = 0;
    let psychCount = 0;
    let cleanCount = 0;

    stages.forEach((st) => {
      const hasAny = st.learning || st.compliance || st.psychological;
      if (st.learning) learningCount++;
      if (st.compliance) complianceCount++;
      if (st.psychological) psychCount++;
      if (!hasAny && st.emotion >= 0) cleanCount++;
    });

    const totalWeighted = (learningCount + complianceCount + psychCount + cleanCount) || 1;
    const learningPct = Math.round((learningCount / totalWeighted) * 100);
    const compliancePct = Math.round((complianceCount / totalWeighted) * 100);
    const psychPct = Math.round((psychCount / totalWeighted) * 100);
    const cleanPct = Math.max(0, 100 - (learningPct + compliancePct + psychPct));

    return {
      learningCount,
      complianceCount,
      psychCount,
      cleanCount,
      totalWeighted,
      learningPct,
      compliancePct,
      psychPct,
      cleanPct,
      totalStages: stages.length
    };
  }, [stages]);

  // Generate dots representation (24 dots grid)
  const dotsData = useMemo(() => {
    const totalDots = 24;
    const dots: { id: number; kind: BurdenKind; label: string }[] = [];
    
    const countFor = (pct: number) => Math.round((pct / 100) * totalDots);
    const lDots = countFor(stats.learningPct);
    const cDots = countFor(stats.compliancePct);
    const pDots = countFor(stats.psychPct);
    const clDots = Math.max(0, totalDots - (lDots + cDots + pDots));

    let idx = 0;
    for (let i = 0; i < lDots && idx < totalDots; i++) {
      dots.push({ id: idx++, kind: 'learning', label: 'Beban Informasi (Learning)' });
    }
    for (let i = 0; i < cDots && idx < totalDots; i++) {
      dots.push({ id: idx++, kind: 'compliance', label: 'Beban Kepatuhan (Compliance)' });
    }
    for (let i = 0; i < pDots && idx < totalDots; i++) {
      dots.push({ id: idx++, kind: 'psychological', label: 'Beban Psikologis (Psychological)' });
    }
    while (idx < totalDots) {
      dots.push({ id: idx++, kind: 'clean', label: 'Titik Sentuh Lancar (Frictionless)' });
    }

    return dots;
  }, [stats]);

  const categories = [
    {
      id: 'learning' as BurdenKind,
      label: 'Beban Informasi',
      sub: 'Persyaratan & Prosedur rumit',
      count: stats.learningCount,
      pct: stats.learningPct,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-700',
      bgColor: 'bg-cyan-50 border-cyan-200',
      icon: Brain
    },
    {
      id: 'compliance' as BurdenKind,
      label: 'Beban Kepatuhan',
      sub: 'Duplikasi dokumen & verifikasi',
      count: stats.complianceCount,
      pct: stats.compliancePct,
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50 border-amber-200',
      icon: FileCheck2
    },
    {
      id: 'psychological' as BurdenKind,
      label: 'Beban Psikologis',
      sub: 'Stres antrean & ketidakpastian',
      count: stats.psychCount,
      pct: stats.psychPct,
      color: 'bg-rose-500',
      textColor: 'text-rose-700',
      bgColor: 'bg-rose-50 border-rose-200',
      icon: HeartPulse
    },
    {
      id: 'clean' as BurdenKind,
      label: 'Titik Lancar',
      sub: 'Tanpa kendala administratif',
      count: stats.cleanCount,
      pct: stats.cleanPct,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50 border-emerald-200',
      icon: ShieldCheck
    }
  ];

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-4.5 transition-all duration-200 ${className}`}>
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-900 text-amber-400 flex items-center justify-center shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                Context Meter: Indeks Beban Administratif
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {stats.totalStages} Titik Sentuh
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Komposisi 3 Beban Administratif Warga (Learning, Compliance, Psychological)
            </p>
          </div>
        </div>

        {/* Display Mode & Compact Toggles */}
        <div className="flex items-center gap-1.5">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100/70 p-0.5">
            <button
              type="button"
              onClick={() => setDisplayMode('bar')}
              title="Tampilan Stacked Bar"
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition flex items-center gap-1 cursor-pointer ${
                displayMode === 'bar'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3 h-3" />
              <span>Batang</span>
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('dots')}
              title="Tampilan Matriks Titik (Field of Dots)"
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition flex items-center gap-1 cursor-pointer ${
                displayMode === 'dots'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3 h-3" />
              <span>Titik</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition flex items-center gap-1 cursor-pointer"
          >
            <span>{isExpanded ? 'Kompak' : 'Rinci'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Interactive Visualization: Stacked Bar or Dots */}
      <div className="my-3">
        {displayMode === 'bar' ? (
          <div className="h-6 w-full bg-slate-100 rounded-xl overflow-hidden flex p-1 gap-1 border border-slate-200/80 shadow-inner">
            {categories.map((cat) => {
              if (cat.pct <= 0) return null;
              const isHovered = hoveredKind === cat.id;
              const isDimmed = hoveredKind !== null && hoveredKind !== cat.id;

              return (
                <div
                  key={cat.id}
                  style={{ width: `${cat.pct}%` }}
                  onMouseEnter={() => setHoveredKind(cat.id)}
                  onMouseLeave={() => setHoveredKind(null)}
                  onClick={() => onFilterByBurden?.(cat.id)}
                  className={`h-full rounded-lg transition-all duration-200 cursor-pointer relative group ${
                    cat.color
                  } ${isHovered ? 'scale-y-110 shadow-md brightness-110' : ''} ${
                    isDimmed ? 'opacity-30' : 'opacity-100'
                  }`}
                >
                  {cat.pct >= 12 && (
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white drop-shadow-xs truncate px-1">
                      {cat.pct}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-2 px-1">
              <span>FIELD OF TOKENS (24 MARKS)</span>
              <span>POINT TO LIGHT UP</span>
            </div>
            <div className="grid grid-cols-12 sm:grid-cols-24 gap-1.5">
              {dotsData.map((dot) => {
                const isHovered = hoveredKind === dot.kind;
                const isDimmed = hoveredKind !== null && hoveredKind !== dot.kind;
                let bgCls = 'bg-emerald-500';
                if (dot.kind === 'learning') bgCls = 'bg-cyan-400';
                if (dot.kind === 'compliance') bgCls = 'bg-amber-400';
                if (dot.kind === 'psychological') bgCls = 'bg-rose-500';

                return (
                  <div
                    key={dot.id}
                    onMouseEnter={() => setHoveredKind(dot.kind)}
                    onMouseLeave={() => setHoveredKind(null)}
                    onClick={() => onFilterByBurden?.(dot.kind)}
                    title={dot.label}
                    className={`w-full aspect-square rounded-full transition-all duration-150 cursor-pointer ${bgCls} ${
                      isHovered
                        ? 'scale-125 ring-2 ring-white shadow-lg shadow-white/40'
                        : isDimmed
                        ? 'opacity-20 scale-75'
                        : 'opacity-90 hover:scale-115'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Category Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {categories.map((cat) => {
          const isHovered = hoveredKind === cat.id;
          const isDimmed = hoveredKind !== null && hoveredKind !== cat.id;
          const Icon = cat.icon;

          return (
            <button
              type="button"
              key={cat.id}
              onMouseEnter={() => setHoveredKind(cat.id)}
              onMouseLeave={() => setHoveredKind(null)}
              onClick={() => onFilterByBurden?.(cat.id)}
              className={`p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                cat.bgColor
              } ${isHovered ? 'ring-2 ring-blue-500/30 scale-[1.02] shadow-xs' : ''} ${
                isDimmed ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                  <span className="text-[11px] font-bold text-slate-800 truncate">
                    {cat.label}
                  </span>
                </div>
                <Icon className={`w-3.5 h-3.5 ${cat.textColor}`} />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xs font-mono font-bold text-slate-900">
                  {cat.count} <span className="text-[10px] font-normal text-slate-500">tahap</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-600">
                  {cat.pct}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Details Pane */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 animate-in fade-in duration-200">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Sintesis Evaluasi Beban Warga (Citizen-Centric Insight)</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {stats.psychCount > 0 ? (
                <>
                  <strong className="text-rose-700">Perhatian Kritis:</strong> Terdeteksi{' '}
                  <span className="font-bold">{stats.psychCount} titik friksi psikologis</span> akibat ketidakpastian durasi layanan atau kendala antrean tatap muka. Prioritaskan transparansi pelacakan real-time pada portal.
                </>
              ) : stats.complianceCount > 0 ? (
                <>
                  <strong className="text-amber-700">Fokus Kepatuhan:</strong> Ditemukan{' '}
                  <span className="font-bold">{stats.complianceCount} titik beban kepatuhan berkas</span>. Rekomendasikan simplifikasi integrasi API antar-instansi untuk mencegah unggah dokumen berulang.
                </>
              ) : (
                <>
                  <strong className="text-emerald-700">Kondisi Prima:</strong> Alur saat ini menunjukkan beban administratif yang terkendali dengan{' '}
                  <span className="font-bold">{stats.cleanCount} tahapan lancar</span>. Pertahankan standar operasional prosedur yang berlaku.
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
