import { STATUS_LABELS, STAGE_LABELS } from '../../lib/constants';
import Select from '../ui/Select';
import Spinner from '../ui/Spinner';

export default function CandidateActions({
  status,
  stage,
  onStatusChange,
  onStageChange,
  loading,
}: {
  status: string;
  stage: string;
  onStatusChange: (v: string) => void;
  onStageChange: (v: string) => void;
  loading: boolean;
}) {
  return (
    <div className="flex gap-4 flex-wrap mb-4 items-center">
      <div>
        <label className="block text-xs font-semibold mb-1">Pipeline Status</label>
        <Select value={status} onChange={e => onStatusChange(e.target.value)} disabled={loading}>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Selection Stage</label>
        <Select value={stage} onChange={e => onStageChange(e.target.value)} disabled={loading}>
          {Object.entries(STAGE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      </div>
      {loading && <Spinner />}
    </div>
  );
}
