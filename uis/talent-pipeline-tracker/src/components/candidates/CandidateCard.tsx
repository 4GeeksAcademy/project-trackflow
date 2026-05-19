import type { Candidate } from '../../types/candidate';
import { STATUS_LABELS } from '../../lib/constants';
import { STAGE_LABELS } from '../../lib/constants';
import Link from 'next/link';

export default function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <Link href={`/candidates/${candidate.id}`} className="block border rounded p-4 hover:bg-gray-50 transition">
      <div className="font-bold text-lg">{candidate.full_name}</div>
      <div className="text-sm text-gray-600">{candidate.position}</div>
      <div className="flex gap-2 mt-2">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{STATUS_LABELS[candidate.status]}</span>
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">{STAGE_LABELS[candidate.stage]}</span>
      </div>
      <div className="mt-2 text-xs text-gray-500">{candidate.email} &bull; {candidate.experience_years} yrs exp</div>
      {candidate.notes_count > 0 && (
        <div className="mt-1 text-xs text-purple-700">Notes: {candidate.notes_count}</div>
      )}
    </Link>
  );
}
