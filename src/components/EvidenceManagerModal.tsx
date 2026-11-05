import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  AlertCircle, 
  Save, 
  Sparkles, 
  MapPin, 
  BookOpen, 
  User, 
  Calendar,
  ShieldAlert,
  ImageIcon
} from 'lucide-react';
import { AuditEvidence, EvidenceCategory, EvidenceSeverity, StageItem } from '../types';
import { generatePlaceholderSvg } from '../utils/evidenceHelpers';
import { UploadDropzone } from './interactive/UploadDropzone';

interface EvidenceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stages: StageItem[];
  defaultStageId?: string;
  initialEvidence?: AuditEvidence | null;
  onSaveEvidence: (evidence: AuditEvidence) => void;
  defaultAuditor?: string;
}

export const EvidenceManagerModal: React.FC<EvidenceManagerModalProps> = ({
  isOpen,
  onClose,
  stages,
  defaultStageId,
  initialEvidence,
  onSaveEvidence,
  defaultAuditor = 'Inspektorat Jenderal Kementerian Perdagangan'
}) => {
  if (!isOpen) return null;

  // Form states
  const [stageId, setStageId] = useState<string>(
    initialEvidence?.stageId || defaultStageId || stages[0]?.id || 'stage-1'
  );
  const [title, setTitle] = useState<string>(initialEvidence?.title || '');
  const [category, setCategory] = useState<EvidenceCategory>(
    initialEvidence?.category || 'screenshot_sistem'
  );
  const [severity, setSeverity] = useState<EvidenceSeverity>(
    initialEvidence?.severity || 'sedang'
  );
  const [locationOrSource, setLocationOrSource] = useState<string>(
    initialEvidence?.locationOrSource || ''
  );
  const [referenceDoc, setReferenceDoc] = useState<string>(
    initialEvidence?.referenceDoc || ''
  );
  const [auditorName, setAuditorName] = useState<string>(
    initialEvidence?.auditorName || defaultAuditor
  );
  const [dateRecorded, setDateRecorded] = useState<string>(
    initialEvidence?.dateRecorded || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  );
  const [description, setDescription] = useState<string>(
    initialEvidence?.description || ''
  );
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    initialEvidence?.imageUrl
  );
  const [errorMsg, setErrorMsg] = useState('');

  // Generate mock illustration placeholder
  const handleUseMockSvg = () => {
    const sampleTitle = title || 'Tangkapan Layar Fakta Pengawasan Kemendag';
    const svgUrl = generatePlaceholderSvg(category, sampleTitle);
    setImageUrl(svgUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('Judul temuan bukti lapangan wajib diisi.');
      return;
    }

    const selectedStage = stages.find((s) => s.id === stageId);

    const newOrUpdatedEvidence: AuditEvidence = {
      id: initialEvidence?.id || `ev-${Date.now()}`,
      stageId,
      stageCode: selectedStage?.code || (stageId === 'all' ? 'Lintas Tahap' : 'Tahap'),
      stageName: selectedStage?.name || (stageId === 'all' ? 'Temuan Umum' : 'Layanan'),
      title: title.trim(),
      category,
      severity,
      locationOrSource: locationOrSource.trim() || undefined,
      referenceDoc: referenceDoc.trim() || undefined,
      auditorName: auditorName.trim() || undefined,
      dateRecorded: dateRecorded.trim(),
      description: description.trim(),
      imageUrl: imageUrl || undefined
    };

    onSaveEvidence(newOrUpdatedEvidence);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                {initialEvidence ? 'Sunting Bukti Lapangan' : 'Tambah Bukti Temuan Lapangan Baru'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Dokumentasi fakta pengawasan & bukti visual evaluasi pelayanan publik Itjen Kemendag
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: Tahap Terkait & Kategori Bukti */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Tahapan Layanan Terkait *
              </label>
              <select
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">Lintas Tahapan (Temuan Umum & Lingkungan Layanan)</option>
                {stages.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.code}: {st.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Kategori Bukti *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EvidenceCategory)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="screenshot_sistem">Tangkapan Layar Sistem (Portal INATRADE/SINSW/OSS)</option>
                <option value="dokumen_fisik">Dokumen / Formulir Fisik (Duplikasi Berkas)</option>
                <option value="foto_antrean">Foto Antrean / Loket Tatap Muka</option>
                <option value="regulasi_sop">Ketidaksinkronan Regulasi / Peraturan Menteri / SOP</option>
                <option value="rekaman_audio">Wawancara Warga / Rekaman Hotline Layanan</option>
                <option value="lainnya">Temuan Lapangan Lainnya</option>
              </select>
            </div>
          </div>

          {/* Row 2: Judul Bukti & Tingkat Keparahan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Judul Temuan Bukti *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Tangkapan Layar Status Verifikasi Melebihi SLA 5 Hari"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Tingkat Keparahan *
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as EvidenceSeverity)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="kritis">🔴 Kritis (Menghambat Proses)</option>
                <option value="sedang">🟡 Sedang (Beban Waktu/Kepatuhan)</option>
                <option value="ringan">🔵 Ringan (Koreksi Minor)</option>
              </select>
            </div>
          </div>

          {/* Row 3: Interactive Upload Dropzone */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-700" />
                <span>Unggah Bukti Visual (Foto / Tangkapan Layar / PDF)</span>
              </label>
              <button
                type="button"
                onClick={handleUseMockSvg}
                className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 transition"
                title="Gunakan grafik ilustrasi resmi Kemendag bila belum ada berkas foto"
              >
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>Gunakan Mockup Standar</span>
              </button>
            </div>

            <UploadDropzone
              onFileAccepted={(_file, dataUrl) => {
                setImageUrl(dataUrl);
                setErrorMsg('');
              }}
              initialPreviewUrl={imageUrl}
            />
          </div>

          {/* Row 4: Catatan Fakta Temuan Lapangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Catatan Fakta Temuan Lapangan & Analisis Pengawasan *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsikan secara objektif kondisi riil di lapangan, temuan hambatan yang dialami warga/pelaku usaha, serta dampaknya..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          {/* Row 5: Lokasi, Regulasi Rujukan, Auditor, Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>Lokasi / Sumber Sistem</span>
              </label>
              <input
                type="text"
                value={locationOrSource}
                onChange={(e) => setLocationOrSource(e.target.value)}
                placeholder="Contoh: Portal INATRADE Menu Verifikasi / Loket Layanan Lt. 2"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-blue-700" />
                <span>Nomor Regulasi / SOP Terkait</span>
              </label>
              <input
                type="text"
                value={referenceDoc}
                onChange={(e) => setReferenceDoc(e.target.value)}
                placeholder="Contoh: Permendag No. 36/2023 Pasal 18 ayat (2)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-500" />
                <span>Auditor / Pemeriksa</span>
              </label>
              <input
                type="text"
                value={auditorName}
                onChange={(e) => setAuditorName(e.target.value)}
                placeholder="Tim Evaluator Itjen Kemendag"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>Tanggal Pencatatan</span>
              </label>
              <input
                type="text"
                value={dateRecorded}
                onChange={(e) => setDateRecorded(e.target.value)}
                placeholder="Contoh: 14 Maret 2025"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Modal Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Bukti Lapangan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
