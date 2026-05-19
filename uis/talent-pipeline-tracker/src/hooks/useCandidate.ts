import { useCallback, useEffect, useState } from 'react';
import { getCandidate, updateCandidate, patchCandidate } from '../services/candidates';
import type { Candidate, RecordCreate, RecordPatch } from '../types/candidate';

export function useCandidate(id: number) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCandidate(id);
      setCandidate(data);
    } catch (e) {
      if (e instanceof Error) setError(e.message || 'Failed to load candidate');
      else setError('Failed to load candidate');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    (async () => {
      await fetchCandidate();
    })();
  }, [fetchCandidate]);

  const editCandidate = async (data: RecordCreate) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateCandidate(id, data);
      setCandidate(updated);
      return updated;
    } catch (e) {
      if (e instanceof Error) setError(e.message || 'Failed to update candidate');
      else setError('Failed to update candidate');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const patchStatusStage = async (data: RecordPatch) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await patchCandidate(id, data);
      setCandidate(updated);
      return updated;
    } catch (e) {
      if (e instanceof Error) setError(e.message || 'Failed to update status/stage');
      else setError('Failed to update status/stage');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { candidate, loading, error, refresh: fetchCandidate, editCandidate, patchStatusStage };
}
