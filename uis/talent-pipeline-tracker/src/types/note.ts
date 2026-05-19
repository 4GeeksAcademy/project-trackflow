export interface Note {
  id: number;
  record_id: number;
  content: string;
  created_at: string;
}

export interface NoteCreate {
  content: string;
}
