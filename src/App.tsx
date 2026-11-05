import React, { useState, useEffect, useCallback } from 'react';
import { EvaluationState, StageItem, AuditEvidence, SignatoryInfo } from './types';
import { PRESETS } from './data/presets';
import { SAMPLE_EVIDENCES } from './utils/evidenceHelpers';
import { ModernCanvasHeader } from './components/ModernCanvasHeader';
import { Step1Profile } from './components/Step1Profile';
import { Step2CJMCanvas } from './components/Step2CJMCanvas';
import { Step3Report } from './components/Step3Report';
import { CollaborationSessionModal } from './components/CollaborationSessionModal';
import { TeamSessionsLanding } from './components/TeamSessionsLanding';
import { generateOfficialPDF } from './utils/pdfGenerator';
import { generateOfficialExcel } from './utils/excelGenerator';
import { 
  initializeSessionRegistry, 
  loadSessionState, 
  saveSessionState, 
  verifySessionAccess,
  getActiveSessionId
} from './utils/sessionManager';

const STORAGE_KEY = 'ep_citizen_centric_cjm_v2';

export default function App() {
  // Default to Step 2 (Kanvas Pengujian Perjalanan CJM) for immediate modern visual impact
  const [currentStep, setCurrentStep] = useState<number>(2);
  const [presetKey, setPresetKey] = useState<string>('perizinan');
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<string>('Tersimpan Otomatis');
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'landing' | 'canvas'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('portal') === '1' || params.get('landing') === '1' || params.get('beranda') === '1') {
          return 'landing';
        }
      } catch (e) {
        // ignore
      }
    }
    return 'canvas';
  });

  // Primary Evaluation State with Multi-Team Isolated Storage
  const [state, setState] = useState<EvaluationState>(() => {
    if (typeof window !== 'undefined') {
      initializeSessionRegistry();
    }

    let urlSessionId = '';
    let urlPin = '';
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        urlSessionId = params.get('sesi') || params.get('proyek') || params.get('sessionId') || params.get('kode') || '';
        urlPin = params.get('pin') || params.get('kodeAkses') || '';
      } catch (e) {
        // ignore
      }
    }

    if (urlSessionId && urlPin) {
      const auth = verifySessionAccess(urlSessionId, urlPin);
      if (auth.success) {
        const loaded = loadSessionState(urlSessionId);
        if (loaded) return loaded;
      }
    }

    const activeId = urlSessionId ? urlSessionId.toUpperCase() : getActiveSessionId();
    if (activeId) {
      const isolatedState = loadSessionState(activeId);
      if (isolatedState && isolatedState.stages && Array.isArray(isolatedState.stages)) {
        return isolatedState;
      }
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.stages && Array.isArray(parsed.stages)) {
          if (!parsed.evidences || !Array.isArray(parsed.evidences) || parsed.evidences.length === 0) {
            parsed.evidences = [...SAMPLE_EVIDENCES];
          }
          if (!parsed.sessionId) {
            parsed.sessionId = activeId || 'TIM-DAGLU-01';
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Gagal membaca data dari localStorage', e);
    }

    const defaultData = JSON.parse(JSON.stringify(PRESETS.perizinan));
    defaultData.sessionId = activeId || 'TIM-DAGLU-01';
    defaultData.evidences = [...SAMPLE_EVIDENCES];
    return defaultData;
  });

  // Debounced Auto-Save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        if (state.sessionId) {
          saveSessionState(state.sessionId, state);
        }
        const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        setSaveStatus(`Tersimpan Otomatis (${now})`);
      } catch (err) {
        console.warn('Gagal menyimpan ke localStorage', err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [state]);

  const handleConnectSession = useCallback((newSessionId: string, newState: EvaluationState) => {
    setState(newState);
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setSaveStatus(`Terhubung ke ${newSessionId} (${now})`);
    
    if (newState.service?.toLowerCase().includes('impor') || newState.service?.toLowerCase().includes('inatrade')) {
      setPresetKey('perizinan');
    } else if (newState.service?.toLowerCase().includes('pengaduan') || newState.service?.toLowerCase().includes('konsumen')) {
      setPresetKey('pengaduan');
    } else if (newState.service?.toLowerCase().includes('ekspor') || newState.service?.toLowerCase().includes('pameran')) {
      setPresetKey('bantuan');
    } else if (newState.service?.toLowerCase().includes('waralaba') || newState.service?.toLowerCase().includes('stpw')) {
      setPresetKey('kependudukan');
    }
  }, []);

  const handlePatchState = useCallback((patch: Partial<EvaluationState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleUpdateStage = useCallback((index: number, updatedStage: StageItem) => {
    setState((prev) => {
      const nextStages = [...prev.stages];
      nextStages[index] = updatedStage;
      return { ...prev, stages: nextStages };
    });
  }, []);

  const handleBatchUpdateStages = useCallback((stages: StageItem[]) => {
    setState((prev) => ({ ...prev, stages }));
  }, []);

  const handleForceSave = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setSaveStatus(`Tersimpan (${now})`);
    } catch (err) {
      console.warn('Gagal menyimpan ke localStorage', err);
    }
  }, [state]);

  const handleMoveStage = useCallback((index: number, direction: 'left' | 'right') => {
    setState((prev) => {
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.stages.length) return prev;
      const nextStages = [...prev.stages];
      const temp = nextStages[index];
      nextStages[index] = nextStages[targetIndex];
      nextStages[targetIndex] = temp;
      
      const renumbered = nextStages.map((s, idx) => ({
        ...s,
        code: `Tahap ${idx + 1}`
      }));

      return { ...prev, stages: renumbered };
    });

    setActiveStageIdx((prev) => {
      if (direction === 'left' && prev > 0) return prev - 1;
      if (direction === 'right' && prev < state.stages.length - 1) return prev + 1;
      return prev;
    });

    setSaveStatus('Urutan Tahapan CJM Diperbarui');
  }, [state.stages.length]);

  const handlePatchCoDesign = useCallback((patch: Partial<EvaluationState['coDesign']>) => {
    setState((prev) => ({
      ...prev,
      coDesign: { ...prev.coDesign, ...patch }
    }));
  }, []);

  const handlePatchSignatory = useCallback((patch: Partial<SignatoryInfo>) => {
    setState((prev) => {
      const baseSignatory = prev.signatory || {
        approverTitle: 'Inspektur Wilayah / Pimpinan Unit Penyelenggara Layanan',
        approverName: '',
        approverNip: '',
        evaluatorTitle: 'Pengendali Teknis / Ketua Tim Evaluator',
        evaluatorName: prev.auditor || '',
        evaluatorNip: '',
        locationDate: `Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
      };
      return {
        ...prev,
        signatory: { ...baseSignatory, ...patch }
      };
    });
  }, []);

  const handleAddStage = useCallback(() => {
    const nextNum = state.stages.length + 1;
    const newStage: StageItem = {
      id: `stage-${Date.now()}`,
      code: `Tahap ${nextNum}`,
      name: `Tahap ${nextNum}`,
      subtitle: 'Tahapan Layanan Tambahan',
      action: '',
      touchpoint: '',
      response: '',
      burden: '',
      learning: false,
      compliance: false,
      psychological: false,
      emotion: 0,
      opportunity: ''
    };
    setState((prev) => ({
      ...prev,
      stages: [...prev.stages, newStage]
    }));
    setActiveStageIdx(state.stages.length);
    setSaveStatus('Tahap Baru Ditambahkan');
  }, [state.stages.length]);

  const handleDeleteStage = useCallback((indexToDelete: number) => {
    setState((prev) => {
      if (prev.stages.length <= 1) return prev;
      const nextStages = prev.stages.filter((_, idx) => idx !== indexToDelete);
      return { ...prev, stages: nextStages };
    });
    setActiveStageIdx((prev) => Math.max(0, Math.min(prev, state.stages.length - 2)));
    setSaveStatus('Tahap Berhasil Dihapus');
  }, [state.stages.length]);

  const handleAddEvidence = useCallback((newEvidence: AuditEvidence) => {
    setState((prev) => ({
      ...prev,
      evidences: [newEvidence, ...(prev.evidences || [])]
    }));
    setSaveStatus('Bukti Lapangan Berhasil Ditambahkan');
  }, []);

  const handleUpdateEvidence = useCallback((updatedEvidence: AuditEvidence) => {
    setState((prev) => ({
      ...prev,
      evidences: (prev.evidences || []).map((e) => (e.id === updatedEvidence.id ? updatedEvidence : e))
    }));
    setSaveStatus('Bukti Lapangan Diperbarui');
  }, []);

  const handleDeleteEvidence = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      evidences: (prev.evidences || []).filter((e) => e.id !== id)
    }));
    setSaveStatus('Bukti Lapangan Dihapus');
  }, []);

  const handleLoadSampleEvidences = useCallback(() => {
    setState((prev) => ({
      ...prev,
      evidences: [...SAMPLE_EVIDENCES]
    }));
    setSaveStatus('Contoh Bukti Standar Dimuat');
  }, []);

  const handleSelectPreset = useCallback((key: string) => {
    const targetPreset = PRESETS[key];
    if (!targetPreset) return;
    setPresetKey(key);
    setState(JSON.parse(JSON.stringify(targetPreset)));
    setActiveStageIdx(0);
    setSaveStatus('Data Contoh Dimuat');
  }, []);

  const handleReset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    const defaultData = PRESETS[presetKey] || PRESETS.perizinan;
    setState(JSON.parse(JSON.stringify(defaultData)));
    setActiveStageIdx(0);
    setSaveStatus('Data Direset ke Awal');
  }, [presetKey]);

  const handlePullOpportunities = useCallback(() => {
    const frictionStages = state.stages.filter(
      (s) => s.emotion < 0 || s.learning || s.compliance || s.psychological
    );

    const discoveryList = frictionStages
      .map((s) => `• [${s.code}: ${s.name}] ${s.burden}`)
      .filter(Boolean);

    const ideationList = state.stages
      .map((s, idx) => (s.opportunity ? `${idx + 1}. [${s.name}] ${s.opportunity}` : null))
      .filter(Boolean);

    const fallbackDiscovery = 'Seluruh tahapan pelayanan saat ini terindikasi berjalan lancar tanpa hambatan kritis yang signifikan. Fokus diarahkan pada pemeliharaan standar operasional dan kepastian digitalisasi.';

    setState((prev) => ({
      ...prev,
      coDesign: {
        ...prev.coDesign,
        discovery: discoveryList.length > 0 ? discoveryList.join('\n') : fallbackDiscovery,
        ideation: ideationList.length > 0 ? ideationList.join('\n\n') : prev.coDesign.ideation
      }
    }));
    setSaveStatus('Temuan CJM Berhasil Ditarik');
  }, [state.stages]);

  const handleExportJSON = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `CJM_Evaluasi_${(state.service || 'Layanan').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [state]);

  const handleImportJSON = useCallback((imported: any) => {
    if (!imported || typeof imported !== 'object') return;
    
    const sanitizedStages: StageItem[] = Array.isArray(imported.stages) && imported.stages.length > 0
      ? imported.stages.map((s: any, idx: number) => ({
          id: s.id || `stage-${idx + 1}`,
          code: s.code || `Tahap ${idx + 1}`,
          name: s.name || `Tahap ${idx + 1}`,
          subtitle: s.subtitle || '',
          action: s.action || '',
          touchpoint: s.touchpoint || '',
          response: s.response || '',
          burden: s.burden || '',
          learning: Boolean(s.learning),
          compliance: Boolean(s.compliance),
          psychological: Boolean(s.psychological),
          emotion: typeof s.emotion === 'number' ? Math.max(-2, Math.min(2, s.emotion)) : 0,
          opportunity: s.opportunity || '',
          condition: s.condition || '',
          criteria: s.criteria || '',
          cause: s.cause || '',
          consequence: s.consequence || '',
          recommendation: s.recommendation || ''
        }))
      : PRESETS.perizinan.stages;

    const sanitizedState: EvaluationState = {
      unit: imported.unit || '',
      service: imported.service || '',
      auditor: imported.auditor || '',
      period: imported.period || '2025',
      modelId: ['guardian', 'performance', 'activator', 'funder', 'yield'].includes(imported.modelId)
        ? imported.modelId
        : 'guardian',
      personaName: imported.personaName || '',
      personaRole: imported.personaRole || '',
      personaLiteracy: imported.personaLiteracy || PRESETS.perizinan.personaLiteracy,
      personaGoal: imported.personaGoal || '',
      stages: sanitizedStages,
      coDesign: {
        discovery: imported.coDesign?.discovery || '',
        ideation: imported.coDesign?.ideation || '',
        prototype: imported.coDesign?.prototype || ''
      },
      evidences: Array.isArray(imported.evidences) && imported.evidences.length > 0
        ? imported.evidences
        : SAMPLE_EVIDENCES
    };

    setState(sanitizedState);
    setActiveStageIdx(0);
    setSaveStatus('File JSON Berhasil Diverifikasi & Dimuat');
  }, []);

  const handleExportCSV = useCallback(() => {
    const headers = [
      'Urutan',
      'Nama Tahap',
      'Keterangan',
      'Aktivitas Pengguna',
      'Saluran (Touchpoints)',
      'Respons Sistem/Petugas',
      'Hambatan Pengguna',
      'Beban Informasi',
      'Beban Kepatuhan',
      'Beban Psikologis',
      'Skor Pengalaman (-2 s.d +2)',
      'Peluang Solusi (Opportunities)',
      'Kondisi (5C)',
      'Kriteria (5C)',
      'Sebab (5C)',
      'Akibat (5C)',
      'Rekomendasi (5C)'
    ];

    const escapeCsv = (str: string | boolean | number) => {
      const clean = String(str ?? '').replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = state.stages.map((s) => [
      escapeCsv(s.code),
      escapeCsv(s.name),
      escapeCsv(s.subtitle),
      escapeCsv(s.action),
      escapeCsv(s.touchpoint),
      escapeCsv(s.response),
      escapeCsv(s.burden),
      escapeCsv(s.learning ? 'Ya' : 'Tidak'),
      escapeCsv(s.compliance ? 'Ya' : 'Tidak'),
      escapeCsv(s.psychological ? 'Ya' : 'Tidak'),
      escapeCsv(s.emotion),
      escapeCsv(s.opportunity),
      escapeCsv(s.condition || ''),
      escapeCsv(s.criteria || ''),
      escapeCsv(s.cause || ''),
      escapeCsv(s.consequence || ''),
      escapeCsv(s.recommendation || '')
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const downloadAnchor = document.createElement('a');
    const filename = `Matriks_CJM_${(state.service || 'Layanan').replace(/\s+/g, '_')}.csv`;
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [state]);

  const handleExportPDF = useCallback(() => {
    setIsExportingPDF(true);
    setSaveStatus('Sedang Mengompilasi Dokumen PDF Resmi...');

    const cleanService = (state.service || 'Layanan_Kemendag').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 35);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `Laporan_Evaluasi_CJM_Itjen_Kemendag_${cleanService}_${dateStr}.pdf`;

    setTimeout(() => {
      try {
        const success = generateOfficialPDF(state, {
          filename,
          onSuccess: () => {
            setIsExportingPDF(false);
            setSaveStatus('Dokumen PDF Resmi Berhasil Diunduh');
          },
          onError: (err) => {
            setIsExportingPDF(false);
            setSaveStatus('Gagal membuat PDF otomatis');
            console.error('PDF Generation Error:', err);
          }
        });

        if (!success) {
          setIsExportingPDF(false);
          setSaveStatus('Gagal membuat PDF otomatis');
        }
      } catch (err) {
        setIsExportingPDF(false);
        setSaveStatus('Gagal membuat PDF otomatis');
        console.error('PDF Catch Error:', err);
      }
    }, 60);
  }, [state]);

  const handleExportExcel = useCallback(() => {
    setSaveStatus('Sedang Mengekstrak Lembar Kerja Excel (.xlsx)...');
    const cleanService = (state.service || 'Layanan_Kemendag').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 35);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `Kertas_Kerja_CJM_Itjen_Kemendag_${cleanService}_${dateStr}.xlsx`;

    try {
      const success = generateOfficialExcel(state, {
        filename,
        onSuccess: () => {
          setSaveStatus('Lembar Kerja Excel (.xlsx) Berhasil Diunduh');
        },
        onError: (err) => {
          setSaveStatus('Gagal mengekstrak berkas Excel');
          console.error('Excel Export Error:', err);
        }
      });
      if (!success) {
        setSaveStatus('Gagal mengekstrak berkas Excel');
      }
    } catch (err) {
      setSaveStatus('Gagal mengekstrak berkas Excel');
      console.error('Excel Catch Error:', err);
    }
  }, [state]);

  const handlePrintNative = useCallback(() => {
    setCurrentStep(3);
    setTimeout(() => {
      window.print();
    }, 250);
  }, []);

  if (currentView === 'landing') {
    return (
      <TeamSessionsLanding
        currentSessionId={state.sessionId || 'TIM-DAGLU-01'}
        currentState={state}
        onSelectSession={(newId, newState) => {
          handleConnectSession(newId, newState);
          setCurrentView('canvas');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onContinueCurrentCanvas={() => {
          setCurrentView('canvas');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col selection:bg-amber-100 selection:text-amber-950">
      {/* Modern Integrated Full-Bleed Executive Header */}
      <ModernCanvasHeader
        currentStep={currentStep}
        onGoToStep={(step) => {
          setCurrentStep(step);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        presetKey={presetKey}
        onSelectPreset={handleSelectPreset}
        saveStatus={saveStatus}
        sessionId={state.sessionId}
        onOpenSessionModal={() => setIsSessionModalOpen(true)}
        onOpenPortal={() => setCurrentView('landing')}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        onPrintNative={handlePrintNative}
        isExportingPDF={isExportingPDF}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onReset={handleReset}
      />

      {/* Main Spacious Viewport Container */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentStep === 1 && (
          <Step1Profile
            state={state}
            onChange={handlePatchState}
            onOpenSessionModal={() => setIsSessionModalOpen(true)}
            onOpenPortal={() => setCurrentView('landing')}
            onNext={() => {
              setCurrentStep(2);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentStep === 2 && (
          <Step2CJMCanvas
            state={state}
            onUpdateStage={handleUpdateStage}
            onBatchUpdateStages={handleBatchUpdateStages}
            onAddStage={handleAddStage}
            onDeleteStage={handleDeleteStage}
            onMoveStage={handleMoveStage}
            onForceSave={handleForceSave}
            activeStageIdx={activeStageIdx}
            onSetActiveStageIdx={setActiveStageIdx}
            onNext={() => {
              setCurrentStep(3);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            presetKey={presetKey}
            onSelectPreset={handleSelectPreset}
            onAddEvidence={handleAddEvidence}
            onUpdateEvidence={handleUpdateEvidence}
            onDeleteEvidence={handleDeleteEvidence}
            onLoadSampleEvidences={handleLoadSampleEvidences}
            onPatchCoDesign={handlePatchCoDesign}
          />
        )}

        {currentStep === 3 && (
          <Step3Report
            state={state}
            onChangeCoDesign={handlePatchCoDesign}
            onChangeSignatory={handlePatchSignatory}
            onPullOpportunities={handlePullOpportunities}
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
            onPrintNative={handlePrintNative}
            isExportingPDF={isExportingPDF}
            onBackToCanvas={() => {
              setCurrentStep(2);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAddEvidence={handleAddEvidence}
            onUpdateEvidence={handleUpdateEvidence}
            onDeleteEvidence={handleDeleteEvidence}
            onLoadSampleEvidences={handleLoadSampleEvidences}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-3.5 px-6 text-xs text-slate-500 no-print">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between">
          <span className="font-semibold text-slate-700">Inspektorat Jenderal Kementerian Perdagangan RI</span>
        </div>
      </footer>

      {/* Multi-Team Collaboration Modal */}
      <CollaborationSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        currentSessionId={state.sessionId || 'TIM-DAGLU-01'}
        currentState={state}
        onConnectSession={handleConnectSession}
      />
    </div>
  );
}
