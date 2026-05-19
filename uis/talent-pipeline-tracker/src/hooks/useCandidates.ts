import { useCallback, useEffect, useState } from 'react';
import { getCandidates } from '../services/candidates';
import type { Candidate } from '../types/candidate';

export function useCandidates(params?: Record<string, string | number | undefined>) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCandidates(params);
      setCandidates(data);
    } catch (e) {
      if (e instanceof Error) setError(e.message || 'Failed to load candidates');
      else setError('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    (async () => {
      await fetchCandidates();
    })();
  }, [fetchCandidates]);

  return { candidates, loading, error, refresh: fetchCandidates };
}
