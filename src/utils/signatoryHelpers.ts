import { EvaluationState, SignatoryInfo } from '../types';

export const DEFAULT_SIGNATORY: SignatoryInfo = {
  approverTitle: 'Inspektur Wilayah / Pimpinan Unit Penyelenggara Layanan',
  approverName: '',
  approverNip: '',
  evaluatorTitle: 'Pengendali Teknis / Ketua Tim Evaluator',
  evaluatorName: '',
  evaluatorNip: '',
  locationDate: `Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
};

export function getResolvedSignatory(state: EvaluationState): SignatoryInfo {
  const current = state.signatory;
  const defaultDate = `Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;

  return {
    approverTitle: current?.approverTitle && current.approverTitle.trim() !== ''
      ? current.approverTitle
      : DEFAULT_SIGNATORY.approverTitle,
    approverName: current?.approverName || '',
    approverNip: current?.approverNip || '',
    evaluatorTitle: current?.evaluatorTitle && current.evaluatorTitle.trim() !== ''
      ? current.evaluatorTitle
      : DEFAULT_SIGNATORY.evaluatorTitle,
    evaluatorName: current?.evaluatorName || state.auditor || '',
    evaluatorNip: current?.evaluatorNip || '',
    locationDate: current?.locationDate && current.locationDate.trim() !== ''
      ? current.locationDate
      : defaultDate
  };
}
