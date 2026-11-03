import React, { useMemo } from 'react';
import { StageItem } from '../types';

interface EmotionChartProps {
  stages: StageItem[];
  activeStageIndex: number;
  onSelectStage: (index: number) => void;
  onUpdateEmotion?: (index: number, score: number) => void;
}

export const EmotionChart: React.FC<EmotionChartProps> = ({
  stages,
  activeStageIndex,
  onSelectStage,
  onUpdateEmotion
}) => {
  // Chart geometry
  const width = 800;
  const height = 180;
  const paddingX = 70;
  const paddingTop = 25;
  const paddingBottom = 35;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingTop - paddingBottom;

  // Emotion mapping: -2 -> plotHeight, 0 -> plotHeight/2, +2 -> 0
  const getY = (val: number) => {
    // clamp between -2 and 2
    const clamped = Math.max(-2, Math.min(2, val));
    const normalized = (clamped - (-2)) / 4; // 0 to 1
    return paddingTop + plotHeight - normalized * plotHeight;
  };

  const getX = (index: number) => {
    if (stages.length <= 1) return paddingX + plotWidth / 2;
    return paddingX + (index / (stages.length - 1)) * plotWidth;
  };

  const points = useMemo(() => {
    return stages.map((st, i) => ({
      x: getX(i),
      y: getY(st.emotion),
      emotion: st.emotion,
      name: st.name,
      code: st.code
    }));
  }, [stages]);

  // Smooth spline path
  const curvePath = useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i < points.length - 2 ? points[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  }, [points]);

  // Area under path
  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const baselineY = getY(0);
    return `${curvePath} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;
  }, [curvePath, points]);

  const emotionLevels = [
    { val: 2, label: '+2 Sangat Puas', color: '#059669', bg: 'rgba(5, 150, 105, 0.05)' },
    { val: 1, label: '+1 Cukup Mudah', color: '#0d9488', bg: 'rgba(13, 148, 136, 0.03)' },
    { val: 0, label: '0 Netral', color: '#64748b', bg: 'transparent' },
    { val: -1, label: '-1 Menghambat', color: '#d97706', bg: 'rgba(217, 119, 6, 0.03)' },
    { val: -2, label: '-2 Sangat Sulit', color: '#e11d48', bg: 'rgba(225, 29, 72, 0.05)' }
  ];

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-900"></span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Kurva Fluktuasi Pengalaman & Emosi Warga (Citizen Experience Curve)
          </h4>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>Pengalaman Positif (+1/+2)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span>Titik Gesekan & Stres (-1/-2)</span>
          </span>
          <span className="hidden sm:inline text-slate-400">· Klik titik untuk mengedit tahap</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-48 select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.18" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0.12" />
            </linearGradient>
            <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Horizontal Grid & Labels */}
          {emotionLevels.map((lvl) => {
            const y = getY(lvl.val);
            const isZero = lvl.val === 0;
            return (
              <g key={lvl.val}>
                <line
                  x1={paddingX - 10}
                  y1={y}
                  x2={width - paddingX + 10}
                  y2={y}
                  stroke={isZero ? '#94a3b8' : '#e2e8f0'}
                  strokeWidth={isZero ? '1.5' : '1'}
                  strokeDasharray={isZero ? 'none' : '3 3'}
                />
                <text
                  x={paddingX - 16}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="9.5"
                  fontWeight={isZero ? '600' : '500'}
                  fill={isZero ? '#475569' : lvl.color}
                  className="font-mono tabular-nums"
                >
                  {lvl.val > 0 ? `+${lvl.val}` : lvl.val}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Main Curve Line */}
          <path
            d={curvePath}
            fill="none"
            stroke="#1e3a8a"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Nodes and Stage Labels */}
          {points.map((p, idx) => {
            const isActive = idx === activeStageIndex;
            const isNegative = p.emotion < 0;
            const isPositive = p.emotion > 0;
            const nodeFill = isNegative ? '#e11d48' : isPositive ? '#059669' : '#64748b';

            return (
              <g
                key={idx}
                className="cursor-pointer group"
                onClick={() => onSelectStage(idx)}
              >
                {/* Active Outer Ring */}
                {isActive && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="13"
                    fill="none"
                    stroke="#1e3a8a"
                    strokeWidth="2.5"
                    strokeDasharray="3 3"
                    className="animate-pulse"
                  />
                )}

                {/* Node Target Area (Large 48px hit area for reliable touch on mobile) */}
                <circle cx={p.x} cy={p.y} r="24" fill="transparent" />

                {/* Visible Circle Node */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? 7.5 : 6}
                  fill={nodeFill}
                  stroke="#ffffff"
                  strokeWidth={isActive ? '3' : '2'}
                  filter="url(#nodeShadow)"
                  className="transition-all duration-150 group-hover:r-8"
                />

                {/* Score badge above node */}
                <rect
                  x={p.x - 14}
                  y={p.y - 23}
                  width="28"
                  height="16"
                  rx="4"
                  fill={nodeFill}
                  className="opacity-95 group-hover:opacity-100 transition-opacity"
                />
                <text
                  x={p.x}
                  y={p.y - 12}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="#ffffff"
                  className="font-mono tabular-nums pointer-events-none"
                >
                  {p.emotion > 0 ? `+${p.emotion}` : p.emotion}
                </text>

                {/* Vertical Stage Tick */}
                <line
                  x1={p.x}
                  y1={height - paddingBottom + 4}
                  x2={p.x}
                  y2={height - paddingBottom + 9}
                  stroke={isActive ? '#1e3a8a' : '#cbd5e1'}
                  strokeWidth={isActive ? '2.5' : '1'}
                />

                {/* Stage Name X-Axis Label */}
                <text
                  x={p.x}
                  y={height - paddingBottom + 20}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight={isActive ? '700' : '500'}
                  fill={isActive ? '#1e3a8a' : '#334155'}
                  className="transition-colors select-none"
                >
                  {stages[idx]?.code || `T${idx + 1}`}
                </text>
                <text
                  x={p.x}
                  y={height - paddingBottom + 31}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight={isActive ? '600' : '400'}
                  fill={isActive ? '#0f172a' : '#64748b'}
                  className="select-none"
                >
                  {stages[idx]?.name || ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Quick Score Adjuster for Active Stage */}
      {onUpdateEmotion && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span>Ubah skor untuk <strong className="text-slate-900">{stages[activeStageIndex]?.code}: {stages[activeStageIndex]?.name}</strong>:</span>
          </div>
          <div className="flex items-center gap-1">
            {[-2, -1, 0, 1, 2].map((val) => {
              const isSelected = stages[activeStageIndex]?.emotion === val;
              const colorClass =
                val < 0
                  ? isSelected ? 'bg-rose-600 text-white border-rose-600' : 'hover:bg-rose-50 text-rose-700 border-rose-200'
                  : val > 0
                  ? isSelected ? 'bg-emerald-600 text-white border-emerald-600' : 'hover:bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isSelected ? 'bg-slate-700 text-white border-slate-700' : 'hover:bg-slate-100 text-slate-700 border-slate-200';

              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => onUpdateEmotion(activeStageIndex, val)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-semibold border transition-colors ${colorClass}`}
                >
                  {val > 0 ? `+${val}` : val}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
