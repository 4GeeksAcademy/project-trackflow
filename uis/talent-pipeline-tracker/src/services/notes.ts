import { apiFetch } from './api';
import type { Note, NoteCreate } from '../types/note';

export async function getNotes(recordId: number) {
  return apiFetch<Note[]>(`/records/${recordId}/notes`);
}

export async function addNote(recordId: number, data: NoteCreate) {
  return apiFetch<Note>(`/records/${recordId}/notes`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteNote(recordId: number, noteId: number) {
  return apiFetch<void>(`/records/${recordId}/notes/${noteId}`, {
    method: 'DELETE',
  });
}
