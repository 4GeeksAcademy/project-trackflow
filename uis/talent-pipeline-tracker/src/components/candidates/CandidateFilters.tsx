import { STATUS_LABELS, STAGE_LABELS } from '../../lib/constants';

export default function CandidateFilters({ status, stage, onStatusChange, onStageChange }: {
  status: string;
  stage: string;
  onStatusChange: (v: string) => void;
  onStageChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-4 flex-wrap mb-4">
      <select value={status} onChange={e => onStatusChange(e.target.value)} className="border rounded px-2 py-1">
        <option value="">All Statuses</option>
        {Object.entries(STATUS_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
      <select value={stage} onChange={e => onStageChange(e.target.value)} className="border rounded px-2 py-1">
        <option value="">All Stages</option>
        {Object.entries(STAGE_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </div>
  );
}
