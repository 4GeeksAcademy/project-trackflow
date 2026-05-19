import { useCallback, useEffect, useState } from 'react';
import { getCandidate, updateCandidate, patchCandidate } from '../services/candidates';
import type { Candidate, RecordCreate, RecordPatch } from '../types/candidate';

export function useCandidate(id: string) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCandidate(id);
      setCandidate(data);
    } catch (e: unknown) {
      let errorMsg = '';
      if (e && typeof e === 'object' && 'message' in e) {
        errorMsg = (e as { message: string }).message;
        const err = e as { status?: number; statusText?: string; responseText?: string; body?: unknown };
        if (err.status || err.statusText || err.responseText) {
          errorMsg += `\nStatus: ${err.status || ''} ${err.statusText || ''}`;
          errorMsg += `\nResponse: ${err.responseText || ''}`;
        }
        if (err.body) {
          errorMsg += `\nBody: ${JSON.stringify(err.body)}`;
        }
      } else {
        errorMsg = JSON.stringify(e);
      }
      setError(errorMsg || 'Failed to load candidate');
      // TEMP: log error for debugging
      console.error('[useCandidate] fetchCandidate error:', e);
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
