import React from 'react';
import { X, Calendar, MapPin, ShieldAlert, BookOpen, User, Tag, Download } from 'lucide-react';
import { AuditEvidence } from '../types';
import { CATEGORY_LABELS, SEVERITY_LABELS } from '../utils/evidenceHelpers';

interface EvidenceLightboxProps {
  evidence: AuditEvidence | null;
  onClose: () => void;
}

export const EvidenceLightbox: React.FC<EvidenceLightboxProps> = ({ evidence, onClose }) => {
  if (!evidence) return null;

  const categoryMeta = CATEGORY_LABELS[evidence.category] || CATEGORY_LABELS.lainnya;
  const severityMeta = SEVERITY_LABELS[evidence.severity] || SEVERITY_LABELS.sedang;

  const handleDownloadImage = () => {
    if (!evidence.imageUrl) return;
    const a = document.createElement('a');
    a.href = evidence.imageUrl;
    a.download = `Bukti_${evidence.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${severityMeta.dotCls} ring-2 ring-white/20`} />
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white line-clamp-1">
                {evidence.title}
              </h3>
              <p className="text-[11px] text-slate-300 flex items-center gap-2">
                <span>{evidence.stageCode ? `${evidence.stageCode}: ${evidence.stageName || ''}` : 'Temuan Umum / Lintas Tahapan'}</span>
                <span>·</span>
                <span>{categoryMeta.label}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {evidence.imageUrl && (
              <button
                type="button"
                onClick={handleDownloadImage}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Unduh Berkas Gambar Bukti"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Main Visual Image / Mockup Preview */}
          {evidence.imageUrl ? (
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center max-h-[380px]">
              <img 
                src={evidence.imageUrl} 
                alt={evidence.title}
                className="w-full h-auto object-contain max-h-[380px]"
              />
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-400 text-xs">
              Tidak ada lampiran gambar/tangkapan layar untuk bukti temuan ini.
            </div>
          )}

          {/* Metadata Badges Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`px-2.5 py-1 rounded-md border text-[11px] ${severityMeta.badgeCls} flex items-center gap-1.5`}>
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Tingkat Keparahan: {severityMeta.label}</span>
            </span>

            <span className={`px-2.5 py-1 rounded-md border text-[11px] ${categoryMeta.badgeCls} flex items-center gap-1.5`}>
              <Tag className="w-3.5 h-3.5" />
              <span>{categoryMeta.label}</span>
            </span>

            {evidence.locationOrSource && (
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{evidence.locationOrSource}</span>
              </span>
            )}

            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Dicatat: {evidence.dateRecorded || 'Tidak tercatat'}</span>
            </span>

            {evidence.auditorName && (
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[11px] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Auditor: {evidence.auditorName}</span>
              </span>
            )}
          </div>

          {/* Audit Facts / Description */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>Fakta Temuan Lapangan & Analisis Pengawasan</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {evidence.description || 'Belum ada catatan deskripsi temuan fakta lapangan.'}
              </p>
            </div>

            {evidence.referenceDoc && (
              <div className="pt-2.5 border-t border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 mb-0.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                  <span>Dasar Regulasi / SOP Terkait:</span>
                </span>
                <p className="text-xs text-blue-900 font-medium">
                  {evidence.referenceDoc}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Pelacak Bukti Lapangan · Inspektorat Jenderal Kementerian Perdagangan RI
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
};
