import React from 'react';
import { Activity, ArrowRight, CheckCircle2, CircleAlert, MapPin, Minus, Plus } from 'lucide-react';
import { StageItem } from '../../types';

interface InteractiveStageDisplayProps {
  stages: StageItem[];
  activeIndex: number;
  onSelectStage: (index: number) => void;
  onUpdateEmotion: (index: number, emotion: number) => void;
}

const emotionMeta = (emotion: number) => {
  if (emotion > 0) return { label: 'Puas', tone: 'positive' as const };
  if (emotion < 0) return { label: 'Friksi', tone: 'negative' as const };
  return { label: 'Netral', tone: 'neutral' as const };
};

export const InteractiveStageDisplay: React.FC<InteractiveStageDisplayProps> = ({
  stages,
  activeIndex,
  onSelectStage,
  onUpdateEmotion
}) => {
  if (stages.length === 0) {
    return (
      <section className="interactive-stage-display" aria-label="Papan interaktif tahapan">
        <div className="interactive-stage-empty">
          <Activity className="h-5 w-5 text-slate-400" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Belum ada tahapan layanan</h2>
            <p className="mt-1 text-xs text-slate-500">Tambahkan tahap untuk mulai membaca perjalanan pengguna.</p>
          </div>
        </div>
      </section>
    );
  }

  const safeIndex = Math.max(0, Math.min(activeIndex, stages.length - 1));
  const activeStage = stages[safeIndex];
  const sentiment = emotionMeta(activeStage.emotion);
  const burdenCount = [activeStage.learning, activeStage.compliance, activeStage.psychological].filter(Boolean).length;

  return (
    <section className="interactive-stage-display" aria-labelledby="interactive-stage-title">
      <div className="interactive-stage-heading">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="interactive-stage-icon" aria-hidden="true">
            <Activity className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="interactive-stage-title" className="text-sm font-extrabold text-slate-950">
                Papan Interaktif Tahap
              </h2>
              <span className="interactive-stage-count">{stages.length} tahap</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Pilih titik perjalanan untuk melihat konteks dan memperbarui sentimen.
            </p>
          </div>
        </div>
        <span className={`interactive-stage-status ${sentiment.tone}`}>
          {sentiment.label} {activeStage.emotion > 0 ? `(+${activeStage.emotion})` : `(${activeStage.emotion})`}
        </span>
      </div>

      <div className="interactive-stage-timeline" role="tablist" aria-label="Pilih tahap perjalanan">
        {stages.map((stage, index) => {
          const meta = emotionMeta(stage.emotion);
          const isActive = index === safeIndex;

          return (
            <React.Fragment key={stage.id || index}>
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`stage-panel-${stage.id || index}`}
                onClick={() => onSelectStage(index)}
                className={`interactive-stage-node ${isActive ? 'active' : ''} ${meta.tone}`}
              >
                <span className="interactive-stage-node-number">{index + 1}</span>
                <span className="interactive-stage-node-copy">
                  <span className="interactive-stage-node-code">{stage.code || `Tahap ${index + 1}`}</span>
                  <span className="interactive-stage-node-name">{stage.name || 'Tahap layanan'}</span>
                </span>
              </button>
              {index < stages.length - 1 && <span className="interactive-stage-connector" aria-hidden="true" />}
            </React.Fragment>
          );
        })}
      </div>

      <div id={`stage-panel-${activeStage.id || safeIndex}`} className={`interactive-stage-detail ${sentiment.tone}`} role="tabpanel">
        <div className="interactive-stage-detail-main">
          <div className="flex items-start gap-2.5">
            <div className="interactive-stage-detail-marker" aria-hidden="true">
              {sentiment.tone === 'negative' ? <CircleAlert className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Tahap aktif</div>
              <h3 className="mt-0.5 text-base font-extrabold text-slate-950 text-balance">{activeStage.name || 'Tahap layanan'}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 text-pretty">
                {activeStage.action || 'Belum ada aktivitas pengguna yang dicatat pada tahap ini.'}
              </p>
            </div>
          </div>

          <div className="interactive-stage-facts">
            <div>
              <span className="interactive-stage-fact-label"><MapPin className="h-3 w-3" /> Titik sentuh</span>
              <span className="interactive-stage-fact-value">{activeStage.touchpoint || 'Belum dicatat'}</span>
            </div>
            <div>
              <span className="interactive-stage-fact-label"><CircleAlert className="h-3 w-3" /> Beban terdeteksi</span>
              <span className="interactive-stage-fact-value">{burdenCount ? `${burdenCount} indikator` : 'Tidak ada indikator'}</span>
            </div>
          </div>
        </div>

        <div className="interactive-stage-score" aria-label="Atur skor sentimen tahap aktif">
          <span className="interactive-stage-fact-label">Skor pengalaman</span>
          <div className="interactive-stage-score-controls">
            <button
              type="button"
              onClick={() => onUpdateEmotion(safeIndex, Math.max(-2, activeStage.emotion - 1))}
              disabled={activeStage.emotion <= -2}
              aria-label="Turunkan skor pengalaman"
              className="interactive-stage-score-button"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="interactive-stage-score-value">{activeStage.emotion > 0 ? `+${activeStage.emotion}` : activeStage.emotion}</span>
            <button
              type="button"
              onClick={() => onUpdateEmotion(safeIndex, Math.min(2, activeStage.emotion + 1))}
              disabled={activeStage.emotion >= 2}
              aria-label="Naikkan skor pengalaman"
              className="interactive-stage-score-button"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <ArrowRight className="hidden h-4 w-4 text-slate-300 sm:block" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};
