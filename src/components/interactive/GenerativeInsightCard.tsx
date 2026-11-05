import React, { useState } from 'react';
import { 
  Sparkles, 
  Bot, 
  ArrowRight, 
  Check, 
  Copy, 
  ShieldAlert, 
  Layers,
  ChevronRight,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { StageItem, EvaluationState } from '../../types';

interface GenerativeInsightCardProps {
  state: EvaluationState;
  onApplyToCoDesign?: (discoveryText: string, ideationText: string) => void;
  className?: string;
}

export const GenerativeInsightCard: React.FC<GenerativeInsightCardProps> = ({
  state,
  onApplyToCoDesign,
  className = ''
}) => {
  const [selectedPrompt, setSelectedPrompt] = useState<string>('root_cause');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [applied, setApplied] = useState<boolean>(false);

  // Analyze stages
  const frictionStages = state.stages.filter(
    (s) => s.emotion < 0 || s.learning || s.compliance || s.psychological
  );

  const totalFrictions = frictionStages.length;

  const handleGenerate = (promptType: string) => {
    setSelectedPrompt(promptType);
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 450);
  };

  const getInsightContent = () => {
    if (selectedPrompt === 'root_cause') {
      return {
        title: 'Akar Masalah (Root Cause) & Beban Dominan',
        badge: 'Analisis 5C & Kepatuhan',
        summary: `Dari ${state.stages.length} tahapan pada layanan ${state.service || 'Kementerian Perdagangan'}, teridentifikasi ${totalFrictions} titik sentuh yang menimbulkan beban administratif bagi pelaku usaha.`,
        keyFindings: [
          'Verifikasi berkas persyaratan masih dilakukan berulang antar-aplikasi internal.',
          'Ketidakpastian estimasi waktu SLA pada tahap pengujian teknis meningkatkan stres pemohon (Beban Psikologis).',
          'Regulasi teknis memerlukan panduan visual (Beban Informasi) agar meminimalkan pengembalian berkas.'
        ],
        proposedAction: 'Integrasikan Single Submission API dan publikasikan dashboard pelacakan status terbuka berstandar SLA.'
      };
    }
    if (selectedPrompt === 'simplifikasi') {
      return {
        title: 'Rekomendasi Simplifikasi Dokumen & Reduksi Syarat',
        badge: 'Administrative Burden Reduction',
        summary: 'Peluang eliminasi redundansi dokumen persyaratan fisik dan peralihan ke penarikan data berbasis NIB / OSS.',
        keyFindings: [
          'Dokumen legalitas perusahaan dapat divalidasi langsung melalui interkoneksi data Kemenkumham / Ditjen AHU.',
          'Pengurangan 3 formulir isian manual menjadi format formulir digital terpadu.',
          'Pemberian notifikasi otomatis via WhatsApp/Email saat berkas diverifikasi petugas.'
        ],
        proposedAction: 'Terapkan prinsip "Once-Only" (dokumen yang sudah ada di basis data pemerintah tidak boleh diminta ulang).'
      };
    }
    return {
      title: 'Optimalisasi Waktu Siklus (SLA) & Mitigasi Risiko',
      badge: 'Efisiensi Operasional',
      summary: 'Percepatan waktu pemrosesan izin dari rata-rata 5 hari kerja menjadi maksimal 2 hari kerja.',
      keyFindings: [
        'Tahap disposisi persetujuan struktural dapat dialihkan ke tanda tangan elektronik tersertifikasi (BSrE).',
        'Penetapan ambang batas otomatis (auto-approval) untuk komoditas dan pelaku usaha bereputasi tinggi.',
        'Penyusunan mitigasi antrean loket konsultasi dengan sistem appointment daring.'
      ],
      proposedAction: 'Digitalisasi otomasi disposisi berjenjang dengan SLA berbatas waktu ketat.'
    };
  };

  const currentInsight = getInsightContent();

  const handleApply = () => {
    if (onApplyToCoDesign) {
      const discovery = `Hasil Analisis Otomatis (${currentInsight.title}):\n` + currentInsight.keyFindings.map((f) => `• ${f}`).join('\n');
      const ideation = `Rekomendasi Tindakan Korektif:\n${currentInsight.proposedAction}`;
      onApplyToCoDesign(discovery, ideation);
      setApplied(true);
      setTimeout(() => setApplied(false), 2500);
    }
  };

  return (
    <div className={`rounded-2xl border border-blue-200/90 bg-gradient-to-br from-white via-blue-50/20 to-slate-50 p-4.5 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-amber-300 flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                Open Intelligent UI
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                AI Synthesis Assistant
              </span>
            </div>
            <h3 className="text-xs font-bold text-slate-900 mt-0.5">
              Generative Co-Design & Evaluasi Beban Warga
            </h3>
          </div>
        </div>

        {/* Prompt Selector Pills */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => handleGenerate('root_cause')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
              selectedPrompt === 'root_cause'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Akar Masalah 5C
          </button>
          <button
            type="button"
            onClick={() => handleGenerate('simplifikasi')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
              selectedPrompt === 'simplifikasi'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Simplifikasi Dokumen
          </button>
          <button
            type="button"
            onClick={() => handleGenerate('sla')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
              selectedPrompt === 'sla'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Akselerasi SLA
          </button>
        </div>
      </div>

      {/* Generated Content Body */}
      <div className={`p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5 transition-opacity duration-200 ${
        isGenerating ? 'opacity-40 animate-pulse' : 'opacity-100'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentInsight.title}</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {currentInsight.badge}
          </span>
        </div>

        <p className="text-[11px] text-slate-600 leading-relaxed">
          {currentInsight.summary}
        </p>

        {/* Bullet Findings */}
        <div className="space-y-1.5 bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/60 text-[11px] text-slate-700">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Temuan Kunci Lapangan:
          </div>
          {currentInsight.keyFindings.map((finding, idx) => (
            <div key={idx} className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1 flex-shrink-0" />
              <span>{finding}</span>
            </div>
          ))}
        </div>

        {/* Action proposal */}
        <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-950 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700 mt-0.5 flex-shrink-0" />
          <div>
            <strong className="text-emerald-900">Rekomendasi Tindakan: </strong>
            <span>{currentInsight.proposedAction}</span>
          </div>
        </div>

        {/* CTA to Apply */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleApply}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
              applied
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-900 hover:bg-blue-950 text-white'
            }`}
          >
            {applied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Berhasil Diterapkan ke Co-Design</span>
              </>
            ) : (
              <>
                <span>Terapkan Rekomendasi ke Fase III</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
