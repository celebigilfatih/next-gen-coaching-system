import { describe, expect, it } from 'vitest';
import {
  createTacticalTransport,
  type PlaybackClock,
} from './tactical-transport';

function setup(duration = 5000) {
  let now = 0;
  let id = 0;
  const callbacks = new Map<number, () => void>();
  const clock: PlaybackClock = {
    now: () => now,
    request: (callback) => {
      callbacks.set(++id, callback);
      return id;
    },
    cancel: (key) => {
      callbacks.delete(key);
    },
  };
  const transport = createTacticalTransport(duration, clock);
  return {
    transport,
    callbacks,
    step: (time: number) => {
      now = time;
      const frame = [...callbacks.values()];
      callbacks.clear();
      frame.forEach((callback) => callback());
    },
    time: (time: number) => {
      now = time;
    },
  };
}
describe('absolute-time tactical transport', () => {
  it('never autoplays and leaves no scheduled frames when paused', () => {
    const { transport: t, callbacks, step } = setup();
    expect(t.getSnapshot()).toEqual({
      timeMs: 0,
      playing: false,
      preview: false,
      speed: 1,
      loop: false,
    });
    expect(callbacks.size).toBe(0);
    t.play();
    t.play();
    expect(callbacks.size).toBe(1);
    step(500);
    t.pause();
    step(2000);
    expect(t.getSnapshot()).toMatchObject({
      timeMs: 500,
      playing: false,
      preview: true,
    });
    expect(callbacks.size).toBe(0);
    t.play();
    step(2200);
    expect(t.getSnapshot().timeMs).toBe(700);
  });
  it.each([30, 60])(
    'finishes exactly at duration even with %i Hz frames and a skipped final frame',
    (hz) => {
      const { transport: t, step, callbacks } = setup();
      t.play();
      for (let ms = 0; ms < 4990; ms += 1000 / hz) step(ms);
      step(5300);
      expect(t.getSnapshot()).toMatchObject({ timeMs: 5000, playing: false });
      expect(callbacks.size).toBe(0);
    },
  );
  it('changes speed without jumps and resumes from media time', () => {
    const { transport: t, step, time } = setup();
    t.setSpeed(0.5);
    t.play();
    step(1000);
    expect(t.getSnapshot().timeMs).toBe(500);
    time(1200);
    t.setSpeed(2);
    expect(t.getSnapshot().timeMs).toBe(600);
    step(1500);
    expect(t.getSnapshot().timeMs).toBe(1200);
    time(1550);
    t.pause();
    expect(t.getSnapshot().timeMs).toBe(1300);
  });
  it('seeking clamps, pauses, is deterministic and rejects non-finite input', () => {
    const { transport: t, step } = setup();
    t.play();
    step(1000);
    t.seek(2500);
    step(4500);
    expect(t.getSnapshot()).toMatchObject({
      timeMs: 2500,
      playing: false,
      preview: true,
    });
    t.seek(NaN);
    expect(t.getSnapshot().timeMs).toBe(2500);
    t.seek(-20);
    expect(t.getSnapshot().timeMs).toBe(0);
    t.seek(9000);
    expect(t.getSnapshot().timeMs).toBe(5000);
    t.play();
    expect(t.getSnapshot().timeMs).toBe(0);
  });
  it('loops with modulo after missed frames, then stops exactly when loop is disabled', () => {
    const { transport: t, step } = setup();
    t.setLoop(true);
    t.play();
    step(12600);
    expect(t.getSnapshot()).toMatchObject({ timeMs: 2600, playing: true });
    t.setLoop(false);
    step(15100);
    expect(t.getSnapshot()).toMatchObject({ timeMs: 5000, playing: false });
  });
  it('exits preview without changing preferences or leaving an active timer', () => {
    const { transport: t, callbacks, step } = setup();
    t.setSpeed(2);
    t.setLoop(true);
    t.play();
    step(300);
    t.exitPreview();
    expect(t.getSnapshot()).toEqual({
      timeMs: 600,
      playing: false,
      preview: false,
      speed: 2,
      loop: true,
    });
    expect(callbacks.size).toBe(0);
  });
  it('a zero-duration legacy board cannot start', () => {
    const { transport: t, callbacks } = setup(0);
    t.play();
    expect(t.getSnapshot().playing).toBe(false);
    expect(callbacks.size).toBe(0);
  });
});
