// This file documents the Milestone 2 business logic functions for TrackFlow Backoffice.
// Do not copy or import implementations directly. This is for documentation and UI reference only.

export interface ServiceFunctionDoc {
  source: string;
  function: string;
  output: string;
  note: string;
}

export const milestone2Services: ServiceFunctionDoc[] = [
  {
    source: 'uis/talent-pipeline-tracker/src/services/candidates.ts',
    function: 'getCandidates',
    output: 'Promise<{ total, page, limit, data: Candidate[] }>',
    note: 'Fetches a paginated list of candidates.'
  },
  {
    source: 'uis/talent-pipeline-tracker/src/services/candidates.ts',
    function: 'getCandidate',
    output: 'Promise<Candidate>',
    note: 'Fetches a single candidate by ID.'
  },
  {
    source: 'uis/talent-pipeline-tracker/src/services/candidates.ts',
    function: 'createCandidate',
    output: 'Promise<Candidate>',
    note: 'Creates a new candidate.'
  },
  {
    source: 'uis/talent-pipeline-tracker/src/services/candidates.ts',
    function: 'updateCandidate',
    output: 'Promise<Candidate>',
    note: 'Updates an existing candidate.'
  },
  {
    source: 'uis/talent-pipeline-tracker/src/services/notes.ts',
    function: 'getNotes',
    output: 'Promise<Note[]>',
    note: 'Fetches notes for a given record.'
  },
  {
    source: 'uis/talent-pipeline-tracker/src/services/notes.ts',
    function: 'addNote',
    output: 'Promise<Note>',
    note: 'Adds a note to a record.'
  },
  {
    source: 'uis/talent-pipeline-tracker/src/services/notes.ts',
    function: 'deleteNote',
    output: 'Promise<void>',
    note: 'Deletes a note from a record.'
  }
];
