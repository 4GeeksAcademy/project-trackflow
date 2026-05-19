import { STAGE_LABELS } from '../../lib/constants';

export default function CandidateStageBadge({ stage }: { stage: string }) {
  return (
    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
      {STAGE_LABELS[stage]}
    </span>
  );
}
