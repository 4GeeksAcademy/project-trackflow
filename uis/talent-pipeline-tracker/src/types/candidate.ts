export type Status = "received" | "in_progress" | "selected" | "discarded";
export type Stage = "pending" | "review" | "personal_interview" | "technical_interview" | "offer_presented";

export interface Candidate {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url: string | null;
  cv_url: string | null;
  status: Status;
  stage: Stage;
  experience_years: number;
  notes_count: number;
  applied_at: string;
  updated_at: string;
}

export interface RecordCreate {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url?: string | null;
  cv_url?: string | null;
  experience_years: number;
}

export interface RecordPatch {
  status?: Status | null;
  stage?: Stage | null;
}

export type RecordOut = Candidate;