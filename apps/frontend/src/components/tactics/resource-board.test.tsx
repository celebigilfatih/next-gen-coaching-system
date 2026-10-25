import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ResourceBoard } from './resource-board';
import { emptyBoard } from '../../lib/tactical-board';
import { createSequence } from '../../lib/tactical-scenes';
import type { BoardEditorHandle } from './tactical-board-editor';

const api = vi.hoisted(() => ({ read: vi.fn(), write: vi.fn() }));
vi.mock('../../lib/api', () => ({
  getTacticalDocument: api.read,
  putTacticalDocument: api.write,
}));
vi.mock('konva', () => ({ default: {} }));
vi.mock('react-konva', () =>
  Object.fromEntries(
    [
      'Circle',
      'Group',
      'Layer',
      'Line',
      'Rect',
      'Stage',
      'Text',
      'Transformer',
    ].map((key) => [key, () => null]),
  ),
);
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
const resource = { kind: 'match' as const, id: 'match' };
const sequence = createSequence(emptyBoard(), 'one');
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  api.read.mockResolvedValue({ document: sequence, writeToken: 'original' });
  api.write.mockImplementation(async (_resource, document) => ({
    document,
    writeToken: 'saved',
  }));
});
afterEach(() => vi.unstubAllGlobals());
function open(readOnly = false) {
  const controllerRef = { current: null as BoardEditorHandle | null };
  const saved = vi.fn();
  const router = createMemoryRouter([
    {
      path: '/',
      element: (
        <ResourceBoard
          resource={resource}
          readOnly={readOnly}
          controllerRef={controllerRef}
          onSaved={saved}
        />
      ),
    },
  ]);
  const view = render(<RouterProvider router={router} />);
  return { ...view, saved, controllerRef };
}
describe('token-bound resource board', () => {
  it('loads all scenes and adopts only successful write tokens on subsequent saves', async () => {
    const { saved } = open();
    await screen.findByRole('region', { name: 'Sahne düzenleyici' });
    fireEvent.click(screen.getByRole('button', { name: 'Sahne ekle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() => expect(saved).toHaveBeenCalledTimes(1));
    expect(api.write.mock.calls[0][0]).toEqual(resource);
    expect(api.write.mock.calls[0][1].scenes).toHaveLength(2);
    expect(api.write.mock.calls[0][2]).toBe('original');
    fireEvent.click(screen.getByRole('button', { name: 'Sahne ekle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() => expect(saved).toHaveBeenCalledTimes(2));
    expect(api.write.mock.calls[1][2]).toBe('saved');
    expect(api.read).toHaveBeenCalledTimes(1);
  });
  it.each([
    'TACTICAL_DOCUMENT_WRITE_CONFLICT',
    'TACTICAL_V2_WRITES_DISABLED',
    'Network failed',
  ])(
    'keeps the full draft and original token on %s without automatic read/retry',
    async (message) => {
      api.write.mockRejectedValue(new Error(message));
      const { saved } = open();
      await screen.findByRole('region', { name: 'Sahne düzenleyici' });
      fireEvent.click(screen.getByRole('button', { name: 'Sahne ekle' }));
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Taslağınız korundu',
        ),
      );
      expect(
        screen.getByRole('region', { name: 'Sahne düzenleyici' }),
      ).toHaveTextContent('2/12');
      expect(screen.getByRole('status')).toHaveTextContent('Kaydedilmemiş');
      expect(api.write).toHaveBeenCalledTimes(1);
      expect(api.read).toHaveBeenCalledTimes(1);
      expect(saved).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
      await waitFor(() => expect(api.write).toHaveBeenCalledTimes(2));
      expect(api.write.mock.calls[1][2]).toBe('original');
    },
  );
  it('does not mount an empty editor on a failed read; explicit retry recovers', async () => {
    api.read.mockRejectedValueOnce(new Error('Forbidden'));
    open();
    expect(await screen.findByRole('alert')).toHaveTextContent('Forbidden');
    expect(
      screen.queryByRole('button', { name: 'Kaydet' }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Tahtayı yeniden yükle' }),
    );
    await screen.findByRole('region', { name: 'Sahne düzenleyici' });
  });
  it('keeps readonly playback available with no save or conversion controls', async () => {
    open(true);
    await screen.findByRole('button', { name: 'Oynat' });
    expect(
      screen.queryByRole('button', { name: 'Kaydet' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Animasyon oluştur' }),
    ).not.toBeInTheDocument();
    expect(api.write).not.toHaveBeenCalled();
  });
  it('guards a local tab transition and permits cancellation without losing scenes', async () => {
    const { controllerRef } = open();
    const transition = vi.fn();
    await screen.findByRole('region', { name: 'Sahne düzenleyici' });
    fireEvent.click(screen.getByRole('button', { name: 'Sahne ekle' }));
    act(() => controllerRef.current!.transition(transition));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'İptal' }));
    expect(transition).not.toHaveBeenCalled();
    expect(
      screen.getByRole('region', { name: 'Sahne düzenleyici' }),
    ).toHaveTextContent('2/12');
  });
});
