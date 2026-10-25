import { useEffect, useRef, useState } from 'react';

export function useFragmentToken() {
  const tokenRef = useRef<string | null | undefined>(undefined);
  const [state, setState] = useState<{
    ready: boolean;
    token: string | null;
  }>({ ready: false, token: null });

  useEffect(() => {
    let active = true;
    if (tokenRef.current === undefined) {
      tokenRef.current = new URLSearchParams(window.location.hash.slice(1)).get(
        'token',
      );
    }
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}`,
    );
    queueMicrotask(() => {
      if (active) setState({ ready: true, token: tokenRef.current ?? null });
    });
    return () => {
      active = false;
    };
  }, []);

  return {
    ...state,
    clearToken: () => {
      tokenRef.current = null;
      setState((current) => ({ ...current, token: null }));
    },
  };
}
