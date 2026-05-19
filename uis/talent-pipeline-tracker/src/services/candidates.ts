
import { apiFetch } from './api';
import type { Candidate, RecordCreate, RecordPatch } from '../types/candidate';

export type CandidatesResponse = {
  total: number;
  page: number;
  limit: number;
  data: Candidate[];
};

export async function getCandidates(params?: Record<string, string | number | undefined>) {
  const query = params
    ? '?' + new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== '')
          .map(([k, v]) => [k, String(v)])
      )
    : '';
  return apiFetch<CandidatesResponse>(`/records${query}`);
}

export async function getCandidate(id: string) {
  return apiFetch<Candidate>(`/records/${id}`);
}

export async function createCandidate(data: RecordCreate) {
  return apiFetch<Candidate>(`/records`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCandidate(id: string, data: RecordCreate) {
  return apiFetch<Candidate>(`/records/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function patchCandidate(id: string, data: RecordPatch) {
  return apiFetch<Candidate>(`/records/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
