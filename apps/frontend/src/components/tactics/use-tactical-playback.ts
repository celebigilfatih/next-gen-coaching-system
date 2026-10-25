import { useEffect, useMemo, useSyncExternalStore } from 'react';
import {
  createTacticalPlayback,
  type TacticalDocument,
} from '../../lib/tactical-document-core';
import { createTacticalTransport } from '../../lib/tactical-transport';

// These callbacks are invoked by user actions/RAF, never while constructing the store.
const browserClock = {
  now: () => performance.now(),
  request: (callback: () => void) => requestAnimationFrame(callback),
  cancel: (id: number) => cancelAnimationFrame(id),
};

const watchMotion = (listener: () => void) => {
  if (!window.matchMedia) return () => {};
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
};
const readMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export function useTacticalPlayback(document: TacticalDocument) {
  // Legacy V1 may contain an unfinished property edit. It is not a playback input.
  const sampler = useMemo(
    () =>
      document.schemaVersion === 2 ? createTacticalPlayback(document) : null,
    [document],
  );
  const transport = useMemo(
    () => createTacticalTransport(sampler?.durationMs ?? 0, browserClock),
    [sampler],
  );
  const state = useSyncExternalStore(
    transport.subscribe,
    transport.getSnapshot,
    transport.getSnapshot,
  );
  const reducedMotion = useSyncExternalStore(
    watchMotion,
    readMotion,
    () => false,
  );
  useEffect(() => {
    const hidden = () => {
      if (window.document.hidden) transport.pause();
    };
    const modal = () => {
      if (
        window.document.querySelector('[role="dialog"], [role="alertdialog"]')
      )
        transport.pause();
    };
    const observer = new MutationObserver(modal);
    observer.observe(window.document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['role'],
    });
    window.document.addEventListener('visibilitychange', hidden);
    window.addEventListener('pagehide', transport.pause);
    return () => {
      observer.disconnect();
      window.document.removeEventListener('visibilitychange', hidden);
      window.removeEventListener('pagehide', transport.pause);
      transport.pause();
    };
  }, [transport]);
  useEffect(() => {
    if (reducedMotion) transport.pause();
  }, [reducedMotion, transport]);
  const frame = useMemo(
    () => (state.preview ? sampler?.frameAt(state.timeMs) : undefined),
    [sampler, state.preview, state.timeMs],
  );
  return {
    transport,
    state,
    frame,
    durationMs: sampler?.durationMs ?? 0,
    reducedMotion,
  };
}
