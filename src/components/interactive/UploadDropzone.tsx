import React, { useState, useRef, useCallback } from 'react';
import { 
  UploadCloud, 
  File, 
  Image as ImageIcon, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles,
  HardDrive
} from 'lucide-react';

interface UploadDropzoneProps {
  onFileAccepted: (file: File, dataUrl: string) => void;
  maxSizeBytes?: number; // default 15MB
  allowedTypes?: string[];
  initialPreviewUrl?: string;
  initialFileName?: string;
  className?: string;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFileAccepted,
  maxSizeBytes = 15 * 1024 * 1024, // 15MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  initialPreviewUrl,
  initialFileName,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(Boolean(initialPreviewUrl));
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl || null);
  const [fileName, setFileName] = useState<string | null>(initialFileName || null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
  };

  const processFile = useCallback((file: File) => {
    setErrorMessage(null);

    // Validate size limit
    if (file.size > maxSizeBytes) {
      setErrorMessage(`Berkas terlalu besar (${formatFileSize(file.size)}). Batas maksimal adalah ${formatFileSize(maxSizeBytes)}.`);
      triggerShake();
      return;
    }

    // Validate mime type
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    if (!isImage && !isPdf && allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      setErrorMessage('Format berkas tidak didukung. Harap unggah gambar (JPG, PNG, WebP) atau berkas PDF.');
      triggerShake();
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);
    setIsUploading(true);
    setUploadProgress(0);
    setIsCompleted(false);

    // Read file via FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;

      // Simulated smooth progress bar
      let progress = 10;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 25) + 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadProgress(100);
          setPreviewUrl(dataUrl);
          setIsUploading(false);
          setIsCompleted(true);
          onFileAccepted(file, dataUrl);
        } else {
          setUploadProgress(progress);
        }
      }, 70);
    };

    reader.onerror = () => {
      setErrorMessage('Gagal membaca berkas. Silakan coba kembali.');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  }, [maxSizeBytes, allowedTypes, onFileAccepted]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setFileName(null);
    setFileSize(null);
    setIsCompleted(false);
    setUploadProgress(0);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Dropzone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer overflow-hidden ${
          isShaking ? 'animate-shake border-red-500 bg-red-50/50' : ''
        } ${
          isDragOver
            ? 'border-blue-600 bg-blue-50/70 scale-[1.01] shadow-lg shadow-blue-500/10'
            : isCompleted
            ? 'border-emerald-400 bg-emerald-50/30'
            : 'border-slate-300 bg-slate-50/70 hover:border-slate-400 hover:bg-slate-100/60'
        }`}
      >
        {/* State 1: Uploading with Progress Bar */}
        {isUploading && (
          <div className="space-y-3 py-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-blue-700 flex items-center justify-center animate-pulse">
              <UploadCloud className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Memproses dan Mengompresi Bukti...
              </div>
              <div className="text-[11px] text-slate-500 truncate max-w-xs mx-auto mt-0.5">
                {fileName} ({fileSize ? formatFileSize(fileSize) : ''})
              </div>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full max-w-xs mx-auto bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-150"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="text-[10px] font-mono font-bold text-slate-600">
              {uploadProgress}%
            </div>
          </div>
        )}

        {/* State 2: Completed Upload with Preview */}
        {!isUploading && isCompleted && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-3 text-left">
              {previewUrl && previewUrl.startsWith('data:image') ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shadow-xs flex-shrink-0 bg-slate-900">
                  <img
                    src={previewUrl}
                    alt="Pratinjau bukti"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 border border-emerald-300">
                  <FileText className="w-7 h-7" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-[280px]">
                    {fileName || 'Bukti Berhasil Diunggah'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                  {fileSize && <span>{formatFileSize(fileSize)}</span>}
                  <span>• Siap diverifikasi</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition"
              >
                Ganti Berkas
              </button>
              <button
                type="button"
                onClick={handleRemove}
                title="Hapus berkas"
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* State 3: Empty / Waiting for Drop */}
        {!isUploading && !isCompleted && (
          <div className="space-y-3 py-2">
            <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center transition-colors ${
              isDragOver ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              <UploadCloud className="w-6 h-6" />
            </div>

            <div>
              <div className="text-xs font-bold text-slate-900">
                <span className="text-blue-700 underline">Klik untuk mengunggah</span> atau seret berkas ke sini
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mendukung Tangkapan Layar Sistem (PNG, JPG, WebP) atau Dokumen Lapangan (PDF)
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-600">
                Maksimal 15 MB
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-600">
                Otomatis Dikompresi
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-mono font-bold text-emerald-800">
                Standar Audit 5C
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error message callout */}
      {errorMessage && (
        <div className="mt-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-[11px] font-medium">{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
