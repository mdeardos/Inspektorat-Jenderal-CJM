import React, { useMemo } from 'react';
import { AlertTriangle, BarChart3, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, Target } from 'lucide-react';
import { AuditEvidence, StageItem } from '../../types';

interface CjmOverviewDashboardProps {
  stages: StageItem[];
  evidences: AuditEvidence[];
  activeIndex: number;
  isFrictionFocus: boolean;
  onToggleFrictionFocus: () => void;
  onSelectStage: (index: number) => void;
}

const hasFiveC = (stage: StageItem) => Boolean(stage.condition && stage.criteria && stage.cause && stage.consequence && stage.recommendation);

export const CjmOverviewDashboard: React.FC<CjmOverviewDashboardProps> = ({
  stages,
  evidences,
  activeIndex,
  isFrictionFocus,
  onToggleFrictionFocus,
  onSelectStage
}) => {
  const summary = useMemo(() => {
    const friction = stages.filter((stage) => stage.emotion < 0 || stage.burden || stage.learning || stage.compliance || stage.psychological).length;
    const positive = stages.filter((stage) => stage.emotion > 0).length;
    const ready = stages.filter((stage) => Boolean(stage.name && stage.action && stage.touchpoint && hasFiveC(stage))).length;
    const average = stages.length ? stages.reduce((sum, stage) => sum + stage.emotion, 0) / stages.length : 0;
    return { friction, positive, ready, average: average.toFixed(1), progress: stages.length ? Math.round((ready / stages.length) * 100) : 0 };
  }, [stages]);

  const safeIndex = Math.max(0, Math.min(activeIndex, stages.length - 1));
  const activeStage = stages[safeIndex];
  const canGoBack = safeIndex > 0;
  const canGoForward = safeIndex < stages.length - 1;

  return (
    <section className="cjm-overview-dashboard" aria-labelledby="cjm-overview-title">
      <div className="cjm-overview-header">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="cjm-overview-icon" aria-hidden="true"><BarChart3 className="h-4 w-4" /></div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="cjm-overview-title" className="text-sm font-extrabold text-slate-950">Ringkasan evaluasi</h2>
              <span className="cjm-overview-kicker">Pantauan langsung</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">Baca kondisi kanvas sebelum masuk ke detail setiap tahap.</p>
          </div>
        </div>
        <button type="button" onClick={onToggleFrictionFocus} aria-pressed={isFrictionFocus} className={`cjm-focus-button ${isFrictionFocus ? 'active' : ''}`}>
          <AlertTriangle className="h-3.5 w-3.5" />
          {isFrictionFocus ? 'Tampilkan semua tahap' : 'Fokus friksi'}
        </button>
      </div>

      <div className="cjm-overview-grid">
        <div className="cjm-metric-card"><span className="cjm-metric-label">Tahap layanan</span><strong>{stages.length}</strong><span className="cjm-metric-note">{summary.positive} tahap bernilai positif</span></div>
        <div className="cjm-metric-card warning"><span className="cjm-metric-label">Titik perlu perhatian</span><strong>{summary.friction}</strong><span className="cjm-metric-note">friksi atau beban terdeteksi</span></div>
        <div className="cjm-metric-card"><span className="cjm-metric-label">Skor rata-rata</span><strong>{summary.average}</strong><span className="cjm-metric-note">skala pengalaman -2 sampai +2</span></div>
        <div className="cjm-metric-card success"><span className="cjm-metric-label">Kesiapan 5C</span><strong>{summary.progress}%</strong><span className="cjm-metric-note">{summary.ready} dari {stages.length} tahap lengkap</span></div>
      </div>

      <div className="cjm-overview-footer">
        <div className="cjm-progress-track" aria-label={`Kesiapan 5C ${summary.progress}%`}><span style={{ width: `${summary.progress}%` }} /></div>
        <div className="cjm-overview-status">
          <span><ClipboardCheck className="h-3.5 w-3.5" /> {evidences.length} bukti lapangan</span>
          <span><Target className="h-3.5 w-3.5" /> Tahap aktif: {activeStage?.code || 'Belum ada'}</span>
        </div>
      </div>

      {activeStage && (
        <div className="mobile-stage-nav" aria-label="Navigasi tahap pada perangkat mobile">
          <button type="button" disabled={!canGoBack} onClick={() => onSelectStage(safeIndex - 1)} aria-label="Tahap sebelumnya"><ChevronLeft className="h-4 w-4" /> Sebelumnya</button>
          <span><CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> {activeStage.code}: {activeStage.name}</span>
          <button type="button" disabled={!canGoForward} onClick={() => onSelectStage(safeIndex + 1)} aria-label="Tahap berikutnya">Berikutnya <ChevronRight className="h-4 w-4" /></button>
        </div>
      )}
    </section>
  );
};
