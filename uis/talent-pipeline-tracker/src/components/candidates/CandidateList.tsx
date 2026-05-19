import CandidateCard from './CandidateCard';
import type { Candidate } from '../../types/candidate';

export default function CandidateList({ candidates }: { candidates: Candidate[] }) {
  if (!candidates.length) {
    return <div className="text-center text-gray-500 py-8">No candidates found.</div>;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {candidates.map((c) => (
        <CandidateCard key={c.id} candidate={c} />
      ))}
    </div>
  );
}
