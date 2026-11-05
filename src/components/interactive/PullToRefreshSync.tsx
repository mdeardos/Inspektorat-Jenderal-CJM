import React, { useState, useRef, useEffect } from 'react';
import { 
  RefreshCw, 
  Check, 
  Sparkles, 
  ArrowDown, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';

interface PullToRefreshSyncProps {
  onSync: () => Promise<void> | void;
  lastSavedText?: string;
  className?: string;
}

export const PullToRefreshSync: React.FC<PullToRefreshSyncProps> = ({
  onSync,
  lastSavedText = 'Tersimpan Otomatis',
  className = ''
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const startYRef = useRef(0);
  const threshold = 55; // pixels to commit

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (isSyncing) return;
    setIsPulling(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startYRef.current = clientY;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isPulling || isSyncing) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const diff = clientY - startYRef.current;
    if (diff > 0) {
      // Add dampening curve
      const damped = Math.min(90, diff * 0.45);
      setPullDistance(damped);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    setIsPulling(false);

    if (pullDistance >= threshold) {
      // Past the line: commit!
      setIsSyncing(true);
      setPullDistance(35); // Hold at active spinner height

      try {
        await onSync();
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 2000);
      } finally {
        setTimeout(() => {
          setIsSyncing(false);
          setPullDistance(0);
        }, 400);
      }
    } else {
      // Spring back without commit
      setPullDistance(0);
    }
  };

  const handleManualClick = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setPullDistance(35);
    try {
      await onSync();
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setPullDistance(0);
      }, 400);
    }
  };

  return (
    <div className={`relative overflow-hidden select-none ${className}`}>
      {/* Pull Feedback Indicator Bar */}
      <div
        style={{ 
          height: `${pullDistance}px`,
          transition: isPulling ? 'none' : 'height 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        className="w-full flex items-center justify-center bg-gradient-to-b from-blue-50/90 to-amber-50/60 overflow-hidden border-b border-blue-200/50"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          {isSyncing ? (
            <>
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
              <span>Menyinkronkan Kertas Kerja & Menghitung Ulang 5C...</span>
            </>
          ) : isSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700">Berhasil Tersinkronisasi & Tervalidasi</span>
            </>
          ) : pullDistance >= threshold ? (
            <>
              <Sparkles className="w-4 h-4 text-amber-500 animate-bounce" />
              <span className="text-blue-900 font-extrabold">Lepaskan untuk Menjalankan Sinkronisasi</span>
            </>
          ) : (
            <>
              <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Tarik ke bawah untuk menyinkronkan data alur</span>
            </>
          )}
        </div>
      </div>

      {/* Main Touch / Pull Area */}
      <div
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between gap-3 cursor-grab active:cursor-grabbing hover:border-slate-300 transition"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 truncate">
                Status Kertas Kerja
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[11px] text-slate-500 font-mono truncate">
              {lastSavedText}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleManualClick();
            }}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Memproses...' : 'Tarik & Sinkron'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
