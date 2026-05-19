import { useCallback, useEffect, useState } from 'react';
import { getNotes, addNote, deleteNote } from '../services/notes';
import type { Note, NoteCreate } from '../types/note';

export function useNotes(recordId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotes(recordId);
      setNotes(data);
    } catch (e) {
      if (e instanceof Error) setError(e.message || 'Failed to load notes');
      else setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    (async () => {
      await fetchNotes();
    })();
  }, [fetchNotes]);

  const createNote = async (data: NoteCreate) => {
    setLoading(true);
    setError(null);
    try {
      const note = await addNote(recordId, data);
      setNotes((prev) => [note, ...prev]);
      return note;
    } catch (e) {
      if (e instanceof Error) setError(e.message || 'Failed to add note');
      else setError('Failed to add note');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const removeNote = async (noteId: number) => {
    setLoading(true);
    setError(null);
    try {
      await deleteNote(recordId, noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (e) {
      if (e instanceof Error) setError(e.message || 'Failed to delete note');
      else setError('Failed to delete note');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { notes, loading, error, refresh: fetchNotes, createNote, removeNote };
}
