export type PlaybackSpeed = 0.5 | 1 | 2;
export type TransportState = {
  timeMs: number;
  playing: boolean;
  preview: boolean;
  speed: PlaybackSpeed;
  loop: boolean;
};
export type PlaybackClock = {
  now: () => number;
  request: (callback: () => void) => number;
  cancel: (id: number) => void;
};

// Absolute monotonic time, never frame-count accumulation. No document writes.
export function createTacticalTransport(
  durationMs: number,
  clock: PlaybackClock,
) {
  let state: TransportState = {
    timeMs: 0,
    playing: false,
    preview: false,
    speed: 1,
    loop: false,
  };
  let anchor = 0;
  let offset = 0;
  let scheduled: number | undefined;
  const listeners = new Set<() => void>();
  function emit(patch: Partial<TransportState>) {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  }
  function cancel() {
    if (scheduled !== undefined) clock.cancel(scheduled);
    scheduled = undefined;
  }
  function settle() {
    if (!state.playing) return;
    const raw = offset + Math.max(0, clock.now() - anchor) * state.speed;
    const finished = raw >= durationMs && !state.loop;
    emit({
      timeMs: state.loop ? raw % durationMs : Math.min(durationMs, raw),
      playing: !finished,
    });
    if (finished) cancel();
  }
  function tick() {
    scheduled = undefined;
    if (!state.playing) return;
    settle();
    if (state.playing) scheduled = clock.request(tick);
  }
  function pause() {
    settle();
    cancel();
    if (state.playing) emit({ playing: false });
  }
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    play() {
      if (durationMs <= 0 || state.playing) return;
      offset = state.timeMs >= durationMs ? 0 : state.timeMs;
      anchor = clock.now();
      emit({ playing: true, preview: true, timeMs: offset });
      scheduled = clock.request(tick);
    },
    pause,
    seek(timeMs: number) {
      if (!Number.isFinite(timeMs)) return;
      pause();
      emit({
        timeMs: Math.max(0, Math.min(durationMs, timeMs)),
        preview: true,
      });
    },
    exitPreview() {
      pause();
      emit({ preview: false });
    },
    setSpeed(speed: PlaybackSpeed) {
      if (![0.5, 1, 2].includes(speed)) return;
      settle();
      offset = state.timeMs;
      anchor = clock.now();
      emit({ speed });
    },
    setLoop(loop: boolean) {
      settle();
      offset = state.timeMs;
      anchor = clock.now();
      emit({ loop });
    },
  };
}
