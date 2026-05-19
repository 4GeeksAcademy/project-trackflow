import { STATUS_LABELS } from '../../lib/constants';

export default function CandidateStatusBadge({ status }: { status: string }) {
  return (
    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
      {STATUS_LABELS[status]}
    </span>
  );
}
