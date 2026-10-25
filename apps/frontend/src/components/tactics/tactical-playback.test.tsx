import { act, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TacticalBoardEditor } from './tactical-board-editor';
import { emptyBoard } from '../../lib/tactical-board';
import { createSequence, editScenes } from '../../lib/tactical-scenes';
import type { TacticalDocument } from '../../lib/tactical-document-core';

vi.mock('konva', () => ({ default: {} }));
vi.mock('react-konva', () => ({
  Circle: () => null,
  Group: () => null,
  Layer: () => null,
  Line: () => null,
  Rect: () => null,
  Stage: () => null,
  Text: () => null,
  Transformer: () => null,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
let now = 0;
let frameId = 0;
let frames: Map<number, () => void>;
let motionListeners: Set<() => void>;
let reduced = false;
beforeEach(() => {
  now = 0;
  frameId = 0;
  reduced = false;
  frames = new Map();
  motionListeners = new Set();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(performance, 'now').mockImplementation(() => now);
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  vi.stubGlobal('requestAnimationFrame', (callback: () => void) => {
    frames.set(++frameId, callback);
    return frameId;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.stubGlobal('matchMedia', () => ({
    matches: reduced,
    addEventListener: (_: string, listener: () => void) =>
      motionListeners.add(listener),
    removeEventListener: (_: string, listener: () => void) =>
      motionListeners.delete(listener),
  }));
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function frame(time: number) {
  act(() => {
    now = time;
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback());
  });
}
function open(readOnly = false) {
  const board = {
    ...emptyBoard(),
    elements: [{ id: 'ball', type: 'ball' as const, x: 100, y: 100 }],
  };
  const seed = editScenes(createSequence(board, 'one'), {
    type: 'duplicate',
    id: 'one',
    newId: 'two',
  });
  seed.scenes[0].transition = 'linear';
  seed.scenes[0].transitionMs = 1000;
  seed.scenes[1].board.elements[0].x = 500;
  const save = vi
    .fn<(doc: TacticalDocument) => Promise<void>>()
    .mockResolvedValue(undefined);
  const router = createMemoryRouter([
    {
      path: '/',
      element: (
        <TacticalBoardEditor
          initialDocument={seed}
          initiallySaved
          onSaveDocument={save}
          readOnly={readOnly}
        />
      ),
    },
    { path: '/away', element: <p>Başka sayfa</p> },
  ]);
  const view = render(<RouterProvider router={router} />);
  return { save, seed, router, ...view };
}
describe('tactical playback integration', () => {
  it('dirty navigation exits preview so Save and leave persists the actual scenes', async () => {
    const { router, save } = open();
    fireEvent.click(screen.getByRole('button', { name: 'Sahne ekle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Oynat' }));
    frame(2500);
    await act(async () => {
      void router.navigate('/away');
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Duraklat' }),
    ).not.toBeInTheDocument();
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet ve çık' })),
    );
    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0]).toMatchObject({ schemaVersion: 2 });
    expect(screen.getByText('Başka sayfa')).toBeInTheDocument();
  });
  it('starts explicitly, locks editing/save and leaves the document/history clean at the final frame', async () => {
    const { save, seed } = open();
    expect(screen.getByRole('button', { name: 'Oynat' })).toBeInTheDocument();
    expect(screen.getByRole('slider')).toHaveValue('0');
    fireEvent.click(screen.getByRole('button', { name: 'Oynat' }));
    frame(2500);
    expect(screen.getByRole('slider', { name: 'Oynatma zamanı' })).toHaveValue(
      '2500',
    );
    expect(screen.getByRole('button', { name: 'Kaydet' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Oyuncu' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Sahne ekle' })).toBeDisabled();
    fireEvent.keyDown(window, { key: 's', ctrlKey: true });
    fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
    expect(save).not.toHaveBeenCalled();
    frame(7000);
    expect(screen.getByRole('button', { name: 'Oynat' })).toBeInTheDocument();
    expect(screen.getByRole('slider')).toHaveValue('5000');
    fireEvent.click(screen.getByRole('button', { name: 'Sabit sahneye dön' }));
    expect(
      screen.getByRole('button', { name: 'Sahne 2: Sahne 1 kopyası' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet' })),
    );
    expect(save).toHaveBeenCalledWith(seed);
    expect(screen.getByRole('button', { name: 'Geri al' })).toBeDisabled();
  });
  it('pause and seek retain preview; returning to a scene unlocks static editing only', () => {
    open();
    fireEvent.click(screen.getByRole('button', { name: 'Oynat' }));
    frame(2300);
    fireEvent.click(screen.getByRole('button', { name: 'Duraklat' }));
    frame(4000);
    expect(screen.getByRole('slider')).toHaveValue('2300');
    fireEvent.change(screen.getByRole('slider'), { target: { value: '2600' } });
    expect(screen.getByRole('slider')).toHaveValue('2600');
    expect(screen.getByRole('button', { name: 'Kaydet' })).toBeDisabled();
    fireEvent.click(
      screen.getByRole('button', { name: 'Sahne 2: Sahne 1 kopyası' }),
    );
    expect(
      screen.queryByRole('button', { name: 'Sabit sahneye dön' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kaydet' })).toBeEnabled();
    expect(screen.getByText('Kaydedildi')).toBeInTheDocument();
  });
  it('readonly viewers can play, seek and change speed without receiving edit actions', () => {
    open(true);
    fireEvent.change(screen.getByRole('combobox', { name: 'Oynatma hızı' }), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Oynat' }));
    frame(500);
    expect(screen.getByRole('slider')).toHaveValue('1000');
    expect(
      screen.queryByRole('button', { name: 'Kaydet' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Sahne ekle' }),
    ).not.toBeInTheDocument();
  });
  it('pauses on hidden tab, modal and route unmount and never auto-resumes', async () => {
    const { router } = open();
    fireEvent.click(screen.getByRole('button', { name: 'Oynat' }));
    frame(500);
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    fireEvent(document, new Event('visibilitychange'));
    expect(frames.size).toBe(0);
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    fireEvent(document, new Event('visibilitychange'));
    expect(frames.size).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: 'Oynat' }));
    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    await act(async () => {
      document.body.append(dialog);
    });
    expect(screen.getByRole('button', { name: 'Oynat' })).toBeInTheDocument();
    dialog.remove();
    fireEvent.click(screen.getByRole('button', { name: 'Oynat' }));
    await act(async () => router.navigate('/away'));
    expect(frames.size).toBe(0);
  });
  it('respects reduced motion on load and preference change, with explicit play still available', () => {
    reduced = true;
    open();
    expect(screen.getByRole('button', { name: 'Oynat' })).toBeInTheDocument();
    expect(screen.getByRole('slider')).toHaveValue('0');
    expect(
      screen.getByText(/Azaltılmış hareket tercihi etkin/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Oynat' }));
    frame(400);
    expect(screen.getByRole('slider')).toHaveValue('400');
    act(() => {
      reduced = false;
      motionListeners.forEach((listener) => listener());
    });
    act(() => {
      reduced = true;
      motionListeners.forEach((listener) => listener());
    });
    expect(frames.size).toBe(0);
    expect(screen.getByRole('button', { name: 'Oynat' })).toBeInTheDocument();
  });
  it('restart does not dirty the document and slider keyboard focus does not trigger editor shortcuts', () => {
    open();
    fireEvent.click(screen.getByRole('button', { name: 'Oynat' }));
    frame(300);
    fireEvent.click(screen.getByRole('button', { name: 'Başa dön' }));
    expect(screen.getByRole('slider')).toHaveValue('0');
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'd', ctrlKey: true });
    expect(screen.getByText('Kaydedildi')).toBeInTheDocument();
    expect(frames.size).toBe(0);
  });
});
