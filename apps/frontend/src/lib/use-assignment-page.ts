import { useEffect, useState } from 'react';

// Caller keys its resource component by person/team/date/season. A page is
// replaced, never appended; late or failed reads cannot display a prior scope.
export function useAssignmentPage<T>(load: (after?: string) => Promise<T>) {
  const [cursors, setCursors] = useState<Array<string | undefined>>([
    undefined,
  ]);
  const [revision, setRevision] = useState(0);
  const after = cursors[cursors.length - 1];
  const key = JSON.stringify([after, revision]);
  const [result, setResult] = useState<{
    key: string;
    data?: T;
    error?: string;
  }>();
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      load(after)
        .then((data) => {
          if (active) setResult({ key, data });
        })
        .catch((cause: unknown) => {
          if (active)
            setResult({
              key,
              error:
                cause instanceof Error ? cause.message : 'Kayıtlar alınamadı.',
            });
        });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [load, after, key]);
  const current = result?.key === key;
  return {
    data: current ? result?.data : undefined,
    loading: !current,
    error: current ? (result?.error ?? '') : '',
    pageNumber: cursors.length,
    previous: () =>
      setCursors((value) => (value.length > 1 ? value.slice(0, -1) : value)),
    next: (cursor: string) => setCursors((value) => [...value, cursor]),
    retry: () => setRevision((value) => value + 1),
    refresh: async () => {
      setRevision((value) => value + 1);
    },
    reload: async () => {
      setCursors([undefined]);
      setRevision((value) => value + 1);
    },
  };
}
