import { useCallback, useEffect, useState } from 'react';

import { getCandidates } from '../services/candidates';
import type { Candidate } from '../types/candidate';

export function useCandidates(params?: Record<string, string | number | undefined>) {

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Optionally expose pagination if needed in the future
  // const [meta, setMeta] = useState<Omit<CandidatesResponse, 'data'>>();


  // Memoize params to avoid unnecessary effect triggers
  // const stableParams = JSON.stringify(params || {});

  // Fetch candidates on mount and when params change
  useEffect(() => {
    let ignore = false;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getCandidates(params);
        if (!ignore) setCandidates(response.data);
        // Optionally: setMeta({ total: response.total, page: response.page, limit: response.limit });
      } catch (e) {
        if (!ignore) {
          if (e instanceof Error) setError(e.message || 'Failed to load candidates');
          else setError('Failed to load candidates');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetch();
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  const refresh = useCallback(() => {
    if (!loading) {
      setCandidates([]);
      setError(null);
      setLoading(true);
      getCandidates(params)
        .then(response => setCandidates(response.data))
        .catch(e => setError(e instanceof Error ? e.message : 'Failed to load candidates'))
        .finally(() => setLoading(false));
    }
  }, [params, loading]);

  return { candidates, loading, error, refresh };
}
