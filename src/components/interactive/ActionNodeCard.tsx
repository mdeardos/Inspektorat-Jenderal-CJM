import React, { useState } from 'react';
import { 
  MoreVertical, 
  ShieldAlert, 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  User,
  Zap,
  Tag
} from 'lucide-react';
import { StageItem, AuditEvidence } from '../../types';

interface ActionNodeCardProps {
  stage: StageItem;
  index: number;
  totalStages: number;
  isActive: boolean;
  onSelect: () => void;
  onOpen5C: () => void;
  onOpenEditor: () => void;
  onDelete: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onUpdateEmotion: (newEmotion: number) => void;
  personaName?: string;
  personaRole?: string;
  evidenceCount?: number;
}

export const ActionNodeCard: React.FC<ActionNodeCardProps> = ({
  stage,
  index,
  totalStages,
  isActive,
  onSelect,
  onOpen5C,
  onOpenEditor,
  onDelete,
  onMoveLeft,
  onMoveRight,
  onUpdateEmotion,
  personaName = 'Pelaku Usaha',
  personaRole = 'Pemohon',
  evidenceCount = 0
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getSentimentInfo = (emotion: number) => {
    if (emotion > 0) {
      return {
        label: `Puas (+${emotion})`,
        pillCls: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        dotCls: 'bg-emerald-500',
        cardBorder: 'border-emerald-300 hover:border-emerald-400',
        headerBg: 'bg-gradient-to-r from-emerald-50/80 to-teal-50/40',
        pulseCls: 'bg-emerald-400'
      };
    }
    if (emotion < 0) {
      return {
        label: `Friksi (${emotion})`,
        pillCls: 'bg-rose-100 text-rose-800 border-rose-300',
        dotCls: 'bg-rose-500',
        cardBorder: 'border-rose-300 hover:border-rose-400',
        headerBg: 'bg-gradient-to-r from-rose-50/80 to-amber-50/40',
        pulseCls: 'bg-rose-400 animate-ping'
      };
    }
    return {
      label: 'Netral (0)',
      pillCls: 'bg-amber-100 text-amber-800 border-amber-300',
      dotCls: 'bg-amber-500',
      cardBorder: 'border-slate-300 hover:border-slate-400',
      headerBg: 'bg-gradient-to-r from-slate-50 to-amber-50/30',
      pulseCls: 'bg-amber-400'
    };
  };

  const sentiment = getSentimentInfo(stage.emotion);
  const has5CFilled = Boolean(stage.condition && stage.criteria && stage.cause);
  const hasBurden = stage.learning || stage.compliance || stage.psychological;

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-2xl bg-white border-2 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between overflow-visible ${
        sentiment.cardBorder
      } ${
        isActive ? 'ring-2 ring-blue-600 ring-offset-2 shadow-lg' : ''
      }`}
      style={{ minWidth: '290px', maxWidth: '340px' }}
    >
      {/* Connector Node Sockets (Left In & Right Out) */}
      <div 
        className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-900 border-2 border-white shadow-xs flex items-center justify-center z-10"
        title="Node Input Connector"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      </div>
      <div 
        className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-900 border-2 border-white shadow-xs flex items-center justify-center z-10"
        title="Node Output Connector"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      </div>

      {/* Card Header */}
      <div className={`p-3.5 rounded-t-2xl border-b border-slate-100 ${sentiment.headerBg} flex items-center justify-between relative`}>
        <div className="flex items-center gap-2 min-w-0 pr-6">
          {/* Status Indicator Pulse */}
          <div className="relative flex items-center justify-center w-3 h-3 flex-shrink-0">
            <span className={`absolute w-full h-full rounded-full opacity-75 ${sentiment.pulseCls}`} />
            <span className={`relative w-2 h-2 rounded-full ${sentiment.dotCls}`} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                {stage.code || `Tahap ${index + 1}`}
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${sentiment.pillCls}`}>
                {sentiment.label}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 truncate" title={stage.name}>
              {stage.name}
            </h4>
          </div>
        </div>

        {/* Folded Corner Action Button */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen((prev) => !prev);
            }}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-600 transition"
            title="Aksi Cepat Tahapan"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Collapsible Action Dropdown Menu */}
          {isMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1.5 text-xs animate-in fade-in duration-150"
            >
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpen5C();
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-amber-50 text-slate-800 font-medium"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Analisis Kertas Kerja 5C</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenEditor();
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 text-slate-800 font-medium"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Edit Rinci Tahapan</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              {/* Reordering */}
              <div className="px-3 py-1 text-[10px] font-mono text-slate-400 uppercase">
                Posisikan Urutan
              </div>
              <div className="flex px-2 gap-1 mb-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => {
                    setIsMenuOpen(false);
                    onMoveLeft?.();
                  }}
                  className="flex-1 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-[10px] font-bold flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Geser Kiri
                </button>
                <button
                  type="button"
                  disabled={index === totalStages - 1}
                  onClick={() => {
                    setIsMenuOpen(false);
                    onMoveRight?.();
                  }}
                  className="flex-1 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-[10px] font-bold flex items-center justify-center gap-1"
                >
                  Geser Kanan <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete();
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-red-50 text-red-600 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Tahap</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-3.5 space-y-2.5 flex-1">
        {/* Touchpoint / Channel Badge */}
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 max-w-[180px] truncate">
            <Tag className="w-2.5 h-2.5 text-slate-400" />
            <span className="truncate">{stage.touchpoint || 'Portal / Loket Kemendag'}</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            SLA: 1-3 Hari
          </span>
        </div>

        {/* User Action */}
        <div className="text-[11px] text-slate-700 leading-snug line-clamp-2">
          {stage.action || 'Pemohon mengajukan berkas dan persyaratan layanan ke sistem.'}
        </div>

        {/* Friction Highlight */}
        {stage.burden && (
          <div className="p-2 rounded-xl bg-red-50/80 border border-red-200 text-red-800 text-[11px] leading-snug">
            <span className="font-bold flex items-center gap-1 text-[10px] uppercase tracking-wider text-red-600 mb-0.5">
              <AlertTriangle className="w-3 h-3" /> Titik Friksi:
            </span>
            {stage.burden}
          </div>
        )}

        {/* Administrative Burden Tags */}
        {hasBurden && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {stage.learning && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                Info/Learning
              </span>
            )}
            {stage.compliance && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Kepatuhan Dokumen
              </span>
            )}
            {stage.psychological && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                Psikologis/Stres
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Quick Sentiment Tuning & 5C Pill */}
      <div className="p-2.5 px-3.5 bg-slate-50/80 border-t border-slate-100 rounded-b-2xl flex items-center justify-between gap-2">
        {/* Quick Emotion Stepper */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
          {[-2, -1, 0, 1, 2].map((val) => {
            const isSel = stage.emotion === val;
            let valColor = 'text-slate-400 hover:text-slate-700';
            if (isSel) {
              if (val < 0) valColor = 'bg-rose-600 text-white font-bold';
              else if (val > 0) valColor = 'bg-emerald-600 text-white font-bold';
              else valColor = 'bg-amber-500 text-white font-bold';
            }
            return (
              <button
                key={val}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateEmotion(val);
                }}
                className={`w-5 h-5 rounded text-[10px] font-mono flex items-center justify-center transition ${valColor}`}
                title={`Skor: ${val > 0 ? `+${val}` : val}`}
              >
                {val > 0 ? `+${val}` : val}
              </button>
            );
          })}
        </div>

        {/* 5C Audit Drawer Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen5C();
          }}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 border ${
            has5CFilled
              ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ShieldAlert className={`w-3 h-3 ${has5CFilled ? 'text-amber-600' : 'text-slate-400'}`} />
          <span>{has5CFilled ? '5C Terisi' : 'Kertas 5C'}</span>
          <ChevronRight className="w-2.5 h-2.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
