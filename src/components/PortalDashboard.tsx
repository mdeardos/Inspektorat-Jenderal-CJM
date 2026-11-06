import React, { useMemo } from 'react';
import { Activity, AlertTriangle, ArrowRight, BarChart3, ClipboardCheck, LayoutDashboard, Search, ShieldCheck, Users } from 'lucide-react';
import { CollaborationSessionMeta, EvaluationState, StageItem } from '../types';

interface PortalDashboardProps {
  sessions: CollaborationSessionMeta[];
  currentSessionId: string;
  currentState: EvaluationState;
  onContinueCurrentCanvas: () => void;
}

const isFiveCReady = (stage: StageItem) => Boolean(stage.condition && stage.criteria && stage.cause && stage.consequence && stage.recommendation);

export const PortalDashboard: React.FC<PortalDashboardProps> = ({ sessions, currentSessionId, currentState, onContinueCurrentCanvas }) => {
  const summary = useMemo(() => {
    const stages = currentState.stages || [];
    const frictionStages = stages.filter((stage) => stage.emotion < 0 || stage.burden || stage.learning || stage.compliance || stage.psychological);
    const readyStages = stages.filter((stage) => isFiveCReady(stage));
    const average = stages.length ? stages.reduce((total, stage) => total + stage.emotion, 0) / stages.length : 0;
    const maxFriction = Math.max(1, ...stages.map((stage) => Number(Boolean(stage.burden)) + Number(stage.emotion < 0) + Number(stage.learning || stage.compliance || stage.psychological)));
    return {
      stages,
      frictionStages,
      readyStages,
      average: average.toFixed(1),
      readiness: stages.length ? Math.round((readyStages.length / stages.length) * 100) : 0,
      maxFriction
    };
  }, [currentState.stages]);

  return (
    <section className="portal-dashboard" aria-labelledby="portal-dashboard-title">
      <aside className="portal-dashboard-sidebar">
        <div className="portal-brand">
          <div className="portal-brand-mark"><img src="/assets/aistudio/image_6fb22ebf.png" alt="Logo Inspektorat Jenderal Kemendag" /></div>
          <div><strong>Itjen Kemendag</strong><span>Portal Evaluasi CJM</span></div>
        </div>
        <nav className="portal-dashboard-nav" aria-label="Navigasi dashboard">
          <a className="active" href="#portal-dashboard-title"><LayoutDashboard className="h-4 w-4" /> Dashboard</a>
          <a href="#inspektorat-selector"><ShieldCheck className="h-4 w-4" /> Inspektorat</a>
          <a href="#team-directory"><Users className="h-4 w-4" /> Daftar Tim</a>
          <a href="#team-settings"><ClipboardCheck className="h-4 w-4" /> Pengaturan sesi</a>
        </nav>
        <div className="portal-dashboard-sidebar-note">
          <span className="portal-sidebar-note-icon"><Activity className="h-4 w-4" /></span>
          <strong>Gunakan data lapangan</strong>
          <span>Setiap temuan perlu punya fakta dan rujukan yang bisa ditinjau.</span>
        </div>
      </aside>

      <div className="portal-dashboard-main">
        <div className="portal-dashboard-topbar">
          <div>
            <span className="portal-eyebrow">Kementerian Perdagangan Republik Indonesia</span>
            <h2 id="portal-dashboard-title">Ringkasan pengawasan pelayanan publik</h2>
            <p>Pantau kesiapan evaluasi dan lanjutkan pekerjaan tim dari satu tempat.</p>
          </div>
          <div className="portal-dashboard-actions">
            <label className="portal-search"><Search className="h-3.5 w-3.5" /><input aria-label="Cari di dashboard" placeholder="Cari tim atau layanan" /></label>
            <button type="button" onClick={onContinueCurrentCanvas} className="portal-primary-action">Buka kanvas aktif <ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="portal-dashboard-kpis">
          <div className="portal-kpi"><span className="portal-kpi-icon blue"><Users className="h-4 w-4" /></span><div><strong>{sessions.length}</strong><span>Tim terdaftar</span></div></div>
          <div className="portal-kpi"><span className="portal-kpi-icon amber"><BarChart3 className="h-4 w-4" /></span><div><strong>{summary.stages.length}</strong><span>Tahap sesi aktif</span></div></div>
          <div className="portal-kpi"><span className="portal-kpi-icon red"><AlertTriangle className="h-4 w-4" /></span><div><strong>{summary.frictionStages.length}</strong><span>Titik perlu perhatian</span></div></div>
          <div className="portal-kpi"><span className="portal-kpi-icon teal"><ClipboardCheck className="h-4 w-4" /></span><div><strong>{summary.readiness}%</strong><span>Kesiapan 5C</span></div></div>
        </div>

        <div className="portal-dashboard-grid">
          <section className="portal-panel portal-chart-panel" aria-labelledby="portal-friction-title">
            <div className="portal-panel-heading"><div><h3 id="portal-friction-title">Di mana friksi paling banyak terjadi?</h3><p>Distribusi beban dan sentimen pada sesi aktif.</p></div><span className="portal-panel-badge">{summary.average} rata-rata</span></div>
            <div className="portal-bars" role="img" aria-label="Grafik friksi per tahap layanan">
              {summary.stages.slice(0, 6).map((stage, index) => {
                const score = Number(Boolean(stage.burden)) + Number(stage.emotion < 0) + Number(stage.learning || stage.compliance || stage.psychological);
                return <div className="portal-bar-row" key={stage.id || index}><span className="portal-bar-label">{stage.code || `Tahap ${index + 1}`}</span><div className="portal-bar-track"><span style={{ width: `${Math.max(8, (score / summary.maxFriction) * 100)}%` }} /></div><strong>{score}</strong></div>;
              })}
              {summary.stages.length === 0 && <p className="portal-empty">Belum ada tahap pada sesi aktif.</p>}
            </div>
          </section>

          <section className="portal-panel portal-readiness-panel" aria-labelledby="portal-readiness-title">
            <div className="portal-panel-heading"><div><h3 id="portal-readiness-title">Kesiapan laporan</h3><p>Progress pengisian 5C sesi aktif.</p></div></div>
            <div className="portal-readiness-body">
              <div className="portal-ring">
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <circle className="portal-ring-track" cx="50" cy="50" r="42" />
                  <circle className="portal-ring-progress" cx="50" cy="50" r="42" pathLength="100" style={{ strokeDashoffset: 100 - summary.readiness }} />
                </svg>
                <div><strong>{summary.readiness}%</strong><span>siap</span></div>
              </div>
              <div className="portal-readiness-copy"><strong>{summary.readyStages.length} dari {summary.stages.length} tahap</strong><span>memiliki Condition, Criteria, Cause, Consequence, dan Corrective Action.</span><button type="button" onClick={onContinueCurrentCanvas}>Lengkapi di kanvas <ArrowRight className="h-3.5 w-3.5" /></button></div>
            </div>
          </section>
        </div>

        <div className="portal-dashboard-grid lower">
          <section className="portal-panel" aria-labelledby="portal-activity-title">
            <div className="portal-panel-heading"><div><h3 id="portal-activity-title">Aktivitas sesi</h3><p>Ruang kerja yang tersedia untuk dilanjutkan.</p></div><a href="#team-directory">Lihat semua</a></div>
            <div className="portal-session-list">
              {sessions.slice(0, 4).map((session) => <button type="button" key={session.sessionId} onClick={onContinueCurrentCanvas} className="portal-session-row"><span className="portal-session-dot" /><span><strong>{session.teamName}</strong><small>{session.serviceName || 'Layanan publik Kemendag'}</small></span><ArrowRight className="h-4 w-4" /></button>)}
              {sessions.length === 0 && <p className="portal-empty">Belum ada tim. Buat sesi pertama di bawah.</p>}
            </div>
          </section>

          <section className="portal-panel portal-highlight-panel" aria-labelledby="portal-active-title">
            <div className="portal-highlight-label">Sesi aktif</div>
            <h3 id="portal-active-title">{currentState.service || 'Belum memilih layanan'}</h3>
            <p>{currentState.unit || 'Unit kerja belum diisi'} · {currentSessionId || 'Belum ada kode sesi'}</p>
            <div className="portal-highlight-stats"><span><strong>{summary.frictionStages.length}</strong> friksi</span><span><strong>{summary.readyStages.length}</strong> siap 5C</span></div>
            <button type="button" onClick={onContinueCurrentCanvas}>Lanjutkan evaluasi <ArrowRight className="h-4 w-4" /></button>
          </section>
        </div>
      </div>
    </section>
  );
};
