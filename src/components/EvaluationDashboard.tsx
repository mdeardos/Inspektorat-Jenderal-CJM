import React, { useMemo } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell, 
  ReferenceLine 
} from 'recharts';
import { 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  TrendingUp, 
  ShieldAlert 
} from 'lucide-react';
import { EvaluationState } from '../types';

interface EvaluationDashboardProps {
  state: EvaluationState;
}

export const EvaluationDashboard: React.FC<EvaluationDashboardProps> = ({ state }) => {
  const totalStages = state.stages.length || 1;

  // 1. Data Radar Beban Administratif
  const radarData = useMemo(() => {
    const learningCount = state.stages.filter(s => s.learning).length;
    const complianceCount = state.stages.filter(s => s.compliance).length;
    const psychologicalCount = state.stages.filter(s => s.psychological).length;
    const frictionCount = state.stages.filter(s => s.emotion < 0).length;
    const repeatCount = state.stages.filter(s => s.compliance && s.learning).length;

    const toPercent = (val: number) => Math.round((val / totalStages) * 100);

    return [
      {
        subject: 'Beban Informasi\n(Learning)',
        fullMark: 100,
        realisasi: toPercent(learningCount),
        toleransi: 20, // Batas toleransi pengawasan Itjen
        count: learningCount
      },
      {
        subject: 'Beban Kepatuhan\n(Compliance)',
        fullMark: 100,
        realisasi: toPercent(complianceCount),
        toleransi: 20,
        count: complianceCount
      },
      {
        subject: 'Beban Psikologis\n(Psychological)',
        fullMark: 100,
        realisasi: toPercent(psychologicalCount),
        toleransi: 15,
        count: psychologicalCount
      },
      {
        subject: 'Titik Friksi Kritis\n(Emotion < 0)',
        fullMark: 100,
        realisasi: toPercent(frictionCount),
        toleransi: 10,
        count: frictionCount
      },
      {
        subject: 'Beban Ganda\n(Duplikasi Syarat)',
        fullMark: 100,
        realisasi: toPercent(repeatCount),
        toleransi: 10,
        count: repeatCount
      }
    ];
  }, [state.stages, totalStages]);

  // 2. Data Grafik Batang Skor Emosi Pengguna Sepanjang Tahapan Layanan
  const barData = useMemo(() => {
    return state.stages.map((st, idx) => {
      let burdenTypes = [];
      if (st.learning) burdenTypes.push('Informasi');
      if (st.compliance) burdenTypes.push('Kepatuhan');
      if (st.psychological) burdenTypes.push('Psikologis');

      return {
        stageId: st.code || `Tahap ${idx + 1}`,
        stageName: st.name || `T${idx + 1}`,
        fullName: `${st.code}: ${st.name}`,
        subtitle: st.subtitle,
        skor: st.emotion,
        burdenCount: burdenTypes.length,
        burdens: burdenTypes.join(', ') || 'Nihil'
      };
    });
  }, [state.stages]);

  // Helper untuk warna batang berdasarkan skor emosi
  const getBarColor = (score: number) => {
    if (score === 2) return '#059669'; // Emerald-600
    if (score === 1) return '#0d9488'; // Teal-600
    if (score === 0) return '#64748b'; // Slate-500
    if (score === -1) return '#d97706'; // Amber-600
    return '#e11d48'; // Rose-600 (-2)
  };

  // 3. Analisis Eksekutif Ringkas
  const lowestStage = useMemo(() => {
    if (state.stages.length === 0) return null;
    return [...state.stages].sort((a, b) => a.emotion - b.emotion)[0];
  }, [state.stages]);

  const dominantBurden = useMemo(() => {
    const l = state.stages.filter(s => s.learning).length;
    const c = state.stages.filter(s => s.compliance).length;
    const p = state.stages.filter(s => s.psychological).length;

    if (l === 0 && c === 0 && p === 0) return 'Tidak terdeteksi beban dominan (Layanan Prima)';
    if (c >= l && c >= p) return `Beban Kepatuhan (${c} dari ${totalStages} tahap terdampak)`;
    if (p >= l && p >= c) return `Beban Psikologis (${p} dari ${totalStages} tahap terdampak)`;
    return `Beban Informasi (${l} dari ${totalStages} tahap terdampak)`;
  }, [state.stages, totalStages]);

  // Custom Tooltip untuk Bar Chart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-lg border border-slate-700 text-xs space-y-1">
          <div className="font-bold text-amber-300">{data.fullName}</div>
          <div className="text-[11px] text-slate-300">{data.subtitle}</div>
          <div className="pt-1 border-t border-slate-700 flex items-center justify-between gap-3">
            <span>Skor Emosi:</span>
            <span className="font-mono font-bold text-emerald-400">
              {data.skor > 0 ? `+${data.skor}` : data.skor}
            </span>
          </div>
          <div className="text-[11px] text-slate-300 flex items-center justify-between gap-3">
            <span>Beban Terdeteksi:</span>
            <span className="font-semibold text-rose-300">{data.burdens}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip untuk Radar Chart
  const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-lg border border-slate-700 text-xs space-y-1">
          <div className="font-bold text-blue-300">{data.subject.replace('\n', ' ')}</div>
          <div className="pt-1 border-t border-slate-700 space-y-0.5">
            <div className="flex items-center justify-between gap-3">
              <span>Realisasi Hambatan:</span>
              <strong className="text-rose-400 font-mono">{data.realisasi}% ({data.count} tahap)</strong>
            </div>
            <div className="flex items-center justify-between gap-3 text-slate-300">
              <span>Batas Toleransi Pengawasan:</span>
              <span className="text-emerald-400 font-mono">&le; {data.toleransi}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Dashboard Visual Evaluasi Pelayanan Publik
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualisasi radar intensitas 3 beban administratif dan fluktuasi skor kepuasan warga sepanjang tahapan layanan.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>Objek Layanan:</span>
          <strong className="text-slate-800 truncate max-w-xs">{state.service || 'Layanan Kemendag'}</strong>
        </div>
      </div>

      {/* Grid 2 Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART 1: Radar Beban Administratif (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-50/60 rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                <span>Radar Beban Administratif</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">5 Parameter</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Makin luas area merah, makin tinggi beban administratif yang dirasakan masyarakat.
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#334155', fontSize: 9.5, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fill: '#94a3b8', fontSize: 8 }}
                    unit="%"
                  />
                  <Tooltip content={<CustomRadarTooltip />} />
                  <Radar
                    name="Realisasi Hambatan (%)"
                    dataKey="realisasi"
                    stroke="#e11d48"
                    fill="#e11d48"
                    fillOpacity={0.35}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Batas Toleransi (%)"
                    dataKey="toleransi"
                    stroke="#059669"
                    fill="#059669"
                    fillOpacity={0.08}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '10.5px', paddingTop: '8px' }}
                    iconType="circle"
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Beban Paling Kritis:</span>
            <strong className="text-rose-800 font-semibold">{dominantBurden}</strong>
          </div>
        </div>

        {/* CHART 2: Bar Chart Distribusi Skor Emosi Sepanjang Tahapan (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-50/60 rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-800" />
                <span>Distribusi Skor Pengalaman Warga per Tahap</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Skala: -2 s.d. +2</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Batang di bawah garis 0 menandakan tahapan yang memicu hambatan, kecemasan, atau penundaan berkas.
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 15, right: 15, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="stageId" 
                    tick={{ fill: '#334155', fontSize: 10, fontWeight: 600 }}
                    interval={0}
                    dy={5}
                  />
                  <YAxis 
                    domain={[-2, 2]} 
                    ticks={[-2, -1, 0, 1, 2]}
                    tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
                  <Bar dataKey="skor" name="Skor Emosi (-2 s.d. +2)" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.skor)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend Warna Skor */}
          <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[10.5px]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>+2 Sangat Puas</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                <span>+1 Cukup Mudah</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                <span>0 Netral</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                <span>-1 Menghambat</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                <span>-2 Sangat Sulit</span>
              </span>
            </div>

            {lowestStage && (
              <span className="text-slate-600">
                Titik Paling Rawan: <strong className="text-rose-700">{lowestStage.code} ({lowestStage.name})</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Summary Insight Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-slate-800">Evaluasi Beban Terberat</div>
            <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              {dominantBurden}. Perlu diprioritaskan dalam program penyederhanaan birokrasi & perbaikan sistem.
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-2.5">
          <Activity className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-slate-800">Tahap Butuh Intervensi Segera</div>
            <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              {lowestStage 
                ? `${lowestStage.code} (${lowestStage.name}) dengan skor ${lowestStage.emotion > 0 ? '+' : ''}${lowestStage.emotion}.`
                : 'Belum ada data tahapan.'}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-slate-800">Rekomendasi Tindak Lanjut</div>
            <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              Manfaatkan tombol <em>Tarik Temuan Otomatis</em> di bawah untuk menyusun rencana aksi pemangkasan beban.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
