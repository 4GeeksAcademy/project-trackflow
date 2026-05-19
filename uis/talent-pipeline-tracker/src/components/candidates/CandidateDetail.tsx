import { Candidate } from '../../types/candidate';
import CandidateStatusBadge from './CandidateStatusBadge';
import CandidateStageBadge from './CandidateStageBadge';

export default function CandidateDetail({ candidate }: { candidate: Candidate }) {
  return (
    <div className="border rounded p-4 mb-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
        <div>
          <h2 className="text-xl font-bold">{candidate.full_name}</h2>
          <div className="text-gray-600 text-sm">{candidate.position}</div>
        </div>
        <div className="flex gap-2">
          <CandidateStatusBadge status={candidate.status} />
          <CandidateStageBadge stage={candidate.stage} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div><span className="font-semibold">Email:</span> {candidate.email}</div>
        <div><span className="font-semibold">Phone:</span> {candidate.phone}</div>
        <div><span className="font-semibold">Experience:</span> {candidate.experience_years} years</div>
        <div><span className="font-semibold">Applied:</span> {new Date(candidate.applied_at).toLocaleDateString()}</div>
        <div><span className="font-semibold">Updated:</span> {new Date(candidate.updated_at).toLocaleDateString()}</div>
        {candidate.linkedin_url && <div><a href={candidate.linkedin_url} target="_blank" rel="noopener" className="text-blue-700 underline">LinkedIn</a></div>}
        {candidate.cv_url && <div><a href={candidate.cv_url} target="_blank" rel="noopener" className="text-blue-700 underline">CV</a></div>}
        <div><span className="font-semibold">Notes:</span> {candidate.notes_count}</div>
      </div>
    </div>
  );
}
