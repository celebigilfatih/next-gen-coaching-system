import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TacticalBoardEditor } from './tactical-board-editor';
import { getSportingPlayerPage, type SportingPlayerPage } from '../../lib/api';
import {
  emptyBoard,
  type TacticalBoardDocumentV1,
} from '../../lib/tactical-board';
import { createSequence, editScenes } from '../../lib/tactical-scenes';
import type { TacticalDocument } from '../../lib/tactical-document-core';
import { Blob as NodeBlob } from 'node:buffer';
import { toast } from 'sonner';

// These tests exercise real editor state and controls, not canvas rendering.
// Styles/layout are verified in browser QA; avoid a large CSS cascade for every
// history-step accessibility query in JSDOM.
vi.mock('../../styles/tactical-studio.css', () => ({}));
vi.mock('konva', () => ({ default: {} }));
vi.mock('react-konva', () => ({
  Arrow: () => null,
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
vi.mock('../../lib/api', () => ({ getSportingPlayerPage: vi.fn() }));

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
});
afterEach(() => vi.unstubAllGlobals());

function openEditor(
  initiallySaved: boolean,
  onSave = vi
    .fn<(document: TacticalBoardDocumentV1) => Promise<void>>()
    .mockResolvedValue(undefined),
) {
  const router = createMemoryRouter([
    {
      path: '/',
      element: (
        <TacticalBoardEditor
          initialDocument={emptyBoard()}
          initiallySaved={initiallySaved}
          onSave={onSave}
        />
      ),
    },
  ]);
  render(<RouterProvider router={router} />);
  return onSave;
}

function openScenes(
  initialDocument: TacticalDocument = emptyBoard(),
  onSaveDocument = vi
    .fn<(document: TacticalDocument) => Promise<void>>()
    .mockResolvedValue(undefined),
  readOnly = false,
) {
  render(
    <RouterProvider
      router={createMemoryRouter([
        {
          path: '/',
          element: (
            <TacticalBoardEditor
              initialDocument={initialDocument}
              initiallySaved
              onSaveDocument={onSaveDocument}
              readOnly={readOnly}
            />
          ),
        },
      ])}
    />,
  );
  return onSaveDocument;
}

describe('document-wide scene editor', () => {
  it('keeps mobile properties optional while scene selection and view controls preserve the complete saved sequence', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query === '(max-width: 700px)',
        media: query,
        addEventListener() {},
        removeEventListener() {},
      })),
    );
    const sequence = editScenes(createSequence(emptyBoard(), 'one'), {
      type: 'duplicate',
      id: 'one',
      newId: 'two',
    });
    const save = openScenes(sequence);
    expect(
      screen.queryByRole('tab', { name: 'Katmanlar' }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Sahne 2: Sahne 1 kopyası' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Özellik panelini göster' }),
    );
    expect(screen.getByRole('tab', { name: 'Katmanlar' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Yakınlaştır' }));
    fireEvent.click(screen.getByText('Görünüm', { exact: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Disk' }));
    expect(
      screen.getByRole('button', { name: 'Sahne 2: Sahne 1 kopyası' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent(/^Kaydedildi$/);
    expect(screen.getByRole('button', { name: 'Geri al' })).toBeDisabled();
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet' })),
    );
    expect(save).toHaveBeenCalledExactlyOnceWith(sequence);
  });

  it('exports every scene as JSON without view preferences or mutation of the saved document', async () => {
    const sequence = editScenes(createSequence(emptyBoard(), 'one'), {
      type: 'duplicate',
      id: 'one',
      newId: 'two',
    });
    sequence.scenes[1].title = 'İkinci sahne';
    const save = openScenes(sequence);
    const blobs: NodeBlob[] = [];
    const BrowserURL = globalThis.URL;
    vi.stubGlobal('Blob', NodeBlob);
    vi.stubGlobal(
      'URL',
      class extends BrowserURL {
        static createObjectURL(blob: unknown) {
          if (!(blob instanceof NodeBlob))
            throw new Error('Expected exported Blob');
          blobs.push(blob);
          return 'blob:qa';
        }
        static revokeObjectURL() {}
      },
    );
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    fireEvent.click(
      screen.getByRole('button', { name: 'Sahne 2: İkinci sahne' }),
    );
    fireEvent.click(screen.getByText('Görünüm', { exact: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Disk' }));
    fireEvent.click(screen.getByRole('button', { name: 'JSON' }));
    expect(JSON.parse(await blobs[0].text())).toEqual(sequence);
    expect(screen.getByText('Kaydedildi')).toBeInTheDocument();
    expect(save).not.toHaveBeenCalled();
    click.mockRestore();
  });

  it('exports SVG for only the selected static scene and escapes its labels', async () => {
    const board = {
      ...emptyBoard(),
      elements: [
        {
          id: 'label',
          type: 'text' as const,
          x: 120,
          y: 120,
          text: 'İlk sahne',
          color: '#ffffff',
          fontSize: 24,
        },
      ],
    };
    const sequence = editScenes(createSequence(board, 'one'), {
      type: 'duplicate',
      id: 'one',
      newId: 'two',
    });
    sequence.scenes[1].board.elements[0].text =
      '<script>İkinci & sahne</script>';
    const before = JSON.stringify(sequence);
    openScenes(sequence);
    const blobs: NodeBlob[] = [];
    const BrowserURL = globalThis.URL;
    vi.stubGlobal('Blob', NodeBlob);
    vi.stubGlobal(
      'URL',
      class extends BrowserURL {
        static createObjectURL(blob: unknown) {
          if (!(blob instanceof NodeBlob))
            throw new Error('Expected exported Blob');
          blobs.push(blob);
          return 'blob:qa';
        }
        static revokeObjectURL() {}
      },
    );
    let filename = '';
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        filename = this.download;
      });
    fireEvent.click(
      screen.getByRole('button', { name: 'Sahne 2: Sahne 1 kopyası' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Seçili sahne SVG' }));
    const svg = await blobs[0].text();
    expect(filename).toBe('ngcs-scene-two.svg');
    expect(svg).toContain('&lt;script&gt;İkinci &amp; sahne&lt;/script&gt;');
    expect(svg).not.toContain('İlk sahne');
    expect(svg).not.toContain('<script>');
    expect(JSON.stringify(sequence)).toBe(before);
    expect(screen.getByText('Kaydedildi')).toBeInTheDocument();
    click.mockRestore();
  });

  it.each([
    '{broken',
    JSON.stringify({ ...createSequence(emptyBoard(), 'one'), rogue: true }),
  ])(
    'rejects invalid imports without replacing the draft or writing to persistence: %s',
    async (content) => {
      const save = openScenes();
      fireEvent.click(screen.getByRole('button', { name: 'Top' }));
      const file = new File([content], 'invalid.json');
      Object.defineProperty(file, 'text', { value: async () => content });
      await act(async () =>
        fireEvent.change(document.querySelector('input[type="file"]')!, {
          target: { files: [file] },
        }),
      );
      expect(toast.error).toHaveBeenCalled();
      await act(async () =>
        fireEvent.click(screen.getByRole('button', { name: 'Kaydet' })),
      );
      expect(save).toHaveBeenLastCalledWith(
        expect.objectContaining({
          schemaVersion: 1,
          elements: [expect.objectContaining({ type: 'ball' })],
        }),
      );
    },
  );

  it('imports all scenes as a single undoable change and rejects oversized files before reading', async () => {
    const save = openScenes();
    const original = createSequence(emptyBoard(), 'imported');
    const file = new File([JSON.stringify(original)], 'scenes.json');
    Object.defineProperty(file, 'text', {
      value: async () => JSON.stringify(original),
    });
    const input = window.document.querySelector('input[type="file"]')!;
    await act(async () =>
      fireEvent.change(input, { target: { files: [file] } }),
    );
    expect(screen.getByLabelText('Sahne düzenleyici')).toBeInTheDocument();
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet' })),
    );
    expect(save).toHaveBeenLastCalledWith(original);
    fireEvent.click(screen.getByRole('button', { name: 'Geri al' }));
    expect(
      screen.queryByLabelText('Sahne düzenleyici'),
    ).not.toBeInTheDocument();
    const oversized = new File([' '.repeat(500001)], 'too-big.json');
    const read = vi.fn();
    Object.defineProperty(oversized, 'text', { value: read });
    await act(async () =>
      fireEvent.change(input, { target: { files: [oversized] } }),
    );
    expect(read).not.toHaveBeenCalled();
    expect(
      screen.queryByLabelText('Sahne düzenleyici'),
    ).not.toBeInTheDocument();
  });
  it('does not silently downgrade V2 through import or a legacy save callback', async () => {
    const sequence = createSequence(emptyBoard(), 'one');
    const legacySave = vi.fn();
    render(
      <RouterProvider
        router={createMemoryRouter([
          {
            path: '/',
            element: (
              <TacticalBoardEditor
                initialDocument={sequence}
                onSave={legacySave}
              />
            ),
          },
        ])}
      />,
    );
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet' })),
    );
    expect(legacySave).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Taslağınız korunuyor');
    const file = new File([JSON.stringify(emptyBoard())], 'static.json');
    Object.defineProperty(file, 'text', {
      value: async () => JSON.stringify(emptyBoard()),
    });
    await act(async () =>
      fireEvent.change(window.document.querySelector('input[type="file"]')!, {
        target: { files: [file] },
      }),
    );
    expect(screen.getByLabelText('Sahne düzenleyici')).toBeInTheDocument();
  });
  it('opts legacy callers out and converts explicitly with one undo', () => {
    openScenes();
    expect(
      screen.queryByLabelText('Sahne düzenleyici'),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Animasyon oluştur' }));
    expect(screen.getByLabelText('Sahne düzenleyici')).toBeInTheDocument();
    expect(screen.getByText('Kaydedilmemiş değişiklik')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sahneyi sil' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Geri al' }));
    expect(screen.getByText('Kaydedildi')).toBeInTheDocument();
    expect(
      screen.queryByLabelText('Sahne düzenleyici'),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Yinele' }));
    expect(screen.getByLabelText('Sahne düzenleyici')).toBeInTheDocument();
  });
  it('scene selection is clean; edits and undo cover the whole document, never one scene only', async () => {
    const seed = editScenes(createSequence(emptyBoard(), 'one'), {
      type: 'duplicate',
      id: 'one',
      newId: 'two',
    });
    const save = openScenes(seed);
    fireEvent.click(
      screen.getByRole('button', { name: 'Sahne 2: Sahne 1 kopyası' }),
    );
    expect(screen.getByText('Kaydedildi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Geri al' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Saha türü' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Oyuncu' }));
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet' })),
    );
    const written = save.mock.calls[0][0];
    if (written.schemaVersion !== 2) throw new Error();
    expect(written.scenes[0].board.elements).toHaveLength(0);
    expect(written.scenes[1].board.elements).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Sahne 1: Sahne 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Geri al' }));
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet' })),
    );
    expect(save).toHaveBeenLastCalledWith(seed);
  });
  it('conflict preserves scenes and dirty draft; pending save blocks mutations and duplicate submit', async () => {
    let reject!: (error: Error) => void;
    const save = vi.fn<(document: TacticalDocument) => Promise<void>>(
      () =>
        new Promise((_, failure) => {
          reject = failure;
        }),
    );
    openScenes(createSequence(emptyBoard(), 'one'), save);
    fireEvent.click(screen.getByRole('button', { name: 'Sahne ekle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    expect(
      screen.getByRole('button', { name: 'Sahneyi çoğalt' }),
    ).toBeDisabled();
    fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
    fireEvent.keyDown(window, { key: 's', ctrlKey: true });
    expect(save).toHaveBeenCalledTimes(1);
    await act(async () =>
      reject(
        new Error('Kayıt değişti (409). Yeniden okumadan üzerine yazılamaz.'),
      ),
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Taslağınız korunuyor');
    expect(screen.getByText('Kaydedilmemiş değişiklik')).toBeInTheDocument();
    expect(screen.getByText('2/12 · 4 sn')).toBeInTheDocument();
    expect(save).toHaveBeenCalledTimes(1);
  });
  it('confirms removal with cancel focus and modal shortcut isolation; undo restores it', async () => {
    openScenes(createSequence(emptyBoard(), 'one'));
    fireEvent.click(screen.getByRole('button', { name: 'Sahne ekle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sahneyi sil' }));
    expect(screen.getByRole('button', { name: 'İptal' })).toHaveFocus();
    fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
    expect(screen.getByText('2/12 · 4 sn')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'İptal' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Sahneyi sil' })).toHaveFocus(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Sahneyi sil' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Sahneyi silmeyi onayla' }),
    );
    expect(screen.getByText('1/12 · 2 sn')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Geri al' }));
    expect(screen.getByText('2/12 · 4 sn')).toBeInTheDocument();
  });
  it('applies scene settings as one undo and validates whitespace names', () => {
    openScenes(createSequence(emptyBoard(), 'one'));
    fireEvent.change(screen.getByLabelText('Sahne adı'), {
      target: { value: '  ' },
    });
    expect(
      screen.getByRole('button', { name: 'Sahne ayarlarını uygula' }),
    ).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Sahne adı'), {
      target: { value: '  Rakibe pres  ' },
    });
    fireEvent.change(screen.getByLabelText('Bekleme (ms)'), {
      target: { value: '3000' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Sahne ayarlarını uygula' }),
    );
    expect(screen.getByLabelText('Sahne adı')).toHaveValue('Rakibe pres');
    fireEvent.click(screen.getByRole('button', { name: 'Geri al' }));
    expect(screen.getByLabelText('Sahne adı')).toHaveValue('Sahne 1');
    expect(screen.getByLabelText('Bekleme (ms)')).toHaveValue(2000);
  });
  it('read-only users select scenes but cannot mutate or convert them', () => {
    const seed = editScenes(createSequence(emptyBoard(), 'one'), {
      type: 'duplicate',
      id: 'one',
      newId: 'two',
    });
    const save = openScenes(seed, undefined, true);
    expect(
      screen.queryByRole('button', { name: 'Sahne ekle' }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Sahne 2: Sahne 1 kopyası' }),
    );
    fireEvent.keyDown(window, { key: 's', ctrlKey: true });
    expect(save).not.toHaveBeenCalled();
    expect(screen.getByText('Kaydedildi')).toBeInTheDocument();
  });
  it('retains exactly 50 undo transitions for scene edits', () => {
    openScenes(createSequence(emptyBoard(), 'one'));
    const undo = screen.getByRole('button', { name: 'Geri al' });
    for (let i = 1; i <= 55; i++) {
      // Applying settings remounts the keyed scene form. Exercise the current
      // controls on every transition, rather than detached input/button nodes.
      fireEvent.change(screen.getByLabelText('Sahne adı'), {
        target: { value: `Pres ${i}` },
      });
      fireEvent.click(
        screen.getByRole('button', { name: 'Sahne ayarlarını uygula' }),
      );
    }
    expect(screen.getByLabelText('Sahne adı')).toHaveValue('Pres 55');
    for (let i = 0; i < 50; i++) fireEvent.click(undo);
    expect(screen.getByLabelText('Sahne adı')).toHaveValue('Pres 5');
    expect(screen.getByRole('button', { name: 'Geri al' })).toBeDisabled();
  }, 60000);
});

describe('tactical board persistence status', () => {
  it('fills an existing slot without changing geometry/type, ignores modal shortcuts and undoes in one step', async () => {
    vi.mocked(getSportingPlayerPage).mockResolvedValue({
      items: [
        {
          id: 'private-person-id',
          displayName: 'Deniz Kaya',
          playerProfile: { primaryPosition: 'KALECI' },
        },
      ],
      total: 1,
      nextCursor: null,
    } as SportingPlayerPage);
    const slot = {
      id: 'slot-1',
      type: 'player' as const,
      team: 'away' as const,
      x: 260,
      y: 310,
      radius: 30,
      rotation: 15,
      name: 'Eski Oyuncu',
      number: '9',
    };
    const board = { ...emptyBoard(), elements: [slot] };
    const save = vi
      .fn<(document: TacticalBoardDocumentV1) => Promise<void>>()
      .mockResolvedValue(undefined);
    render(
      <RouterProvider
        router={createMemoryRouter([
          {
            path: '/',
            element: (
              <TacticalBoardEditor
                initiallySaved
                initialDocument={board}
                onSave={save}
                rosterSource={{
                  teamId: 'team',
                  clubId: 'club',
                  name: 'A Takım',
                }}
              />
            ),
          },
        ])}
      />,
    );
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Kadro' }), {
      button: 0,
      ctrlKey: false,
    });
    fireEvent.change(screen.getByLabelText('Kadro işlemi'), {
      target: { value: 'assign' },
    });
    fireEvent.change(screen.getByLabelText('Formasyon yeri'), {
      target: { value: 'slot-1' },
    });
    expect(screen.getByRole('button', { name: 'Geri al' })).toBeDisabled();
    fireEvent.click(await screen.findByRole('button', { name: /Deniz Kaya/ }));
    fireEvent.keyDown(window, { key: 'Delete' });
    fireEvent.keyDown(window, { key: 'd', ctrlKey: true });
    fireEvent.keyDown(window, { key: 's', ctrlKey: true });
    expect(save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Oyuncuyu ata' }));
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet' })),
    );
    expect(save).toHaveBeenLastCalledWith({
      ...board,
      elements: [{ ...slot, name: 'Deniz Kaya', number: '' }],
    });
    expect(JSON.stringify(save.mock.calls)).not.toContain('private-person-id');
    fireEvent.click(screen.getByRole('button', { name: 'Geri al' }));
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet' })),
    );
    expect(save).toHaveBeenLastCalledWith(board);
    fireEvent.click(screen.getByRole('button', { name: 'Yinele' }));
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet' })),
    );
    expect(save).toHaveBeenLastCalledWith({
      ...board,
      elements: [{ ...slot, name: 'Deniz Kaya', number: '' }],
    });
  });

  it('adds a roster name as a V1 snapshot with no guessed number or identity field', async () => {
    vi.mocked(getSportingPlayerPage).mockResolvedValue({
      items: [
        {
          id: 'private-person-id',
          displayName: 'Deniz Kaya',
          playerProfile: { primaryPosition: 'KALECI' },
        },
      ],
      total: 1,
      nextCursor: null,
    } as SportingPlayerPage);
    const save = vi.fn(async () => {});
    const router = createMemoryRouter([
      {
        path: '/',
        element: (
          <TacticalBoardEditor
            initialDocument={emptyBoard()}
            onSave={save}
            rosterSource={{ teamId: 'team', clubId: 'club', name: 'A Takım' }}
          />
        ),
      },
    ]);
    render(<RouterProvider router={router} />);
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Kadro' }), {
      button: 0,
      ctrlKey: false,
    });
    fireEvent.click(await screen.findByRole('button', { name: /Deniz Kaya/ }));
    expect(screen.getByLabelText('Oyuncu adı')).toHaveValue('Deniz Kaya');
    expect(screen.getByLabelText('Numara')).toHaveValue('');
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet' })),
    );
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        schemaVersion: 1,
        elements: [
          expect.objectContaining({
            type: 'goalkeeper',
            name: 'Deniz Kaya',
            number: '',
          }),
        ],
      }),
    );
    expect(JSON.stringify(save.mock.calls)).not.toContain('private-person-id');
  });
  it('moves, duplicates and deletes a selected unit in single undo steps', async () => {
    const save = openEditor(true);
    fireEvent.click(screen.getByRole('button', { name: 'Ev formasyonu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ev takımını seç' }));
    expect(screen.getByText('11 seçili')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sağa taşı' }));
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet' })),
    );
    const moved = save.mock.calls[0][0];
    expect(moved.elements[0].x).toBe(164);
    fireEvent.click(screen.getByRole('button', { name: 'Çoğalt' }));
    fireEvent.click(screen.getByRole('button', { name: 'Geri al' }));
    expect(screen.getByRole('status')).toHaveTextContent(/^Kaydedildi$/);
    fireEvent.click(screen.getByRole('button', { name: 'Ev takımını seç' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sil' }));
    fireEvent.click(screen.getByRole('button', { name: 'Geri al' }));
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet' })),
    );
    expect(save.mock.calls[1][0]).toEqual(moved);
  });

  it('supports additive layer selection without marking the document dirty', async () => {
    const save = openEditor(true);
    fireEvent.click(screen.getByRole('button', { name: 'Ev formasyonu' }));
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet' })),
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Katmanlar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Oyuncu · 2 Ev' }));
    fireEvent.click(screen.getByRole('button', { name: 'Oyuncu · 3 Ev' }), {
      shiftKey: true,
    });
    expect(screen.getByText('2 seçili')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/^Kaydedildi$/);
    fireEvent.click(screen.getByRole('button', { name: 'Çoğalt' }));
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet' })),
    );
    expect(save.mock.calls[1][0].elements).toHaveLength(13);
  });

  it('hides roster and group mutation tools in read-only mode', () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: (
          <TacticalBoardEditor
            readOnly
            rosterSource={{ teamId: 'team', clubId: 'club', name: 'U18' }}
          />
        ),
      },
    ]);
    render(<RouterProvider router={router} />);
    expect(
      screen.queryByRole('tab', { name: 'Kadro' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Çoklu seçim' }),
    ).not.toBeInTheDocument();
  });
  it('keeps view preferences out of saved V1 documents and undo history', async () => {
    const save = openEditor(true);
    fireEvent.click(screen.getByText('Görünüm', { exact: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Disk' }));
    expect(screen.getByRole('button', { name: 'Disk' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Yakınlaştır' }));
    expect(screen.getByText('125%')).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Özellik panelini gizle' }),
    );
    expect(
      screen.queryByRole('tab', { name: 'Katmanlar' }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Odak modunu aç' }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(
      screen.getByRole('button', { name: 'Odak modunu aç' }),
    ).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Sahaya sığdır' }));
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/^Kaydedildi$/);
    expect(screen.getByRole('button', { name: 'Geri al' })).toBeDisabled();
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet' })),
    );
    expect(save).toHaveBeenCalledWith(emptyBoard());
  });

  it('saves a named player and preserves it when changing appearance', async () => {
    const save = openEditor(false);
    fireEvent.click(screen.getByRole('button', { name: 'Oyuncu' }));
    fireEvent.change(screen.getByLabelText('Oyuncu adı'), {
      target: { value: 'Deniz Kaya' },
    });
    fireEvent.click(screen.getByText('Görünüm', { exact: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Disk' }));
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet' })),
    );
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        schemaVersion: 1,
        elements: [
          expect.objectContaining({ type: 'player', name: 'Deniz Kaya' }),
        ],
      }),
    );
  });

  it('retains exactly 50 undo transitions and redo after history truncation', () => {
    openEditor(false);
    const add = screen.getByRole('button', { name: 'Oyuncu' });
    const undo = screen.getByRole('button', { name: 'Geri al' });
    const redo = screen.getByRole('button', { name: 'Yinele' });
    for (let index = 0; index < 51; index++) fireEvent.click(add);
    for (let index = 0; index < 50; index++) {
      expect(undo).toBeEnabled();
      fireEvent.click(undo);
    }
    expect(undo).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Kaydedilmemiş değişiklik',
    );
    for (let index = 0; index < 50; index++) {
      expect(redo).toBeEnabled();
      fireEvent.click(redo);
    }
    expect(redo).toBeDisabled();
  });
  it('does not claim a new seeded draft is saved', () => {
    const save = openEditor(false);
    expect(screen.getByRole('status')).toHaveTextContent('Henüz kaydedilmedi');
    expect(save).not.toHaveBeenCalled();
  });

  it('recognizes an existing persisted board', () => {
    openEditor(true);
    expect(screen.getByRole('status')).toHaveTextContent(/^Kaydedildi$/);
  });

  it.each([false, true])(
    'undo restores the correct baseline status (persisted=%s)',
    (persisted) => {
      openEditor(persisted);
      fireEvent.click(screen.getByRole('button', { name: 'Oyuncu' }));
      expect(screen.getByRole('status')).toHaveTextContent(
        'Kaydedilmemiş değişiklik',
      );
      fireEvent.click(screen.getByRole('button', { name: 'Geri al' }));
      expect(screen.getByRole('status')).toHaveTextContent(
        persisted ? /^Kaydedildi$/ : 'Henüz kaydedilmedi',
      );
      fireEvent.click(screen.getByRole('button', { name: 'Yinele' }));
      expect(screen.getByRole('status')).toHaveTextContent(
        'Kaydedilmemiş değişiklik',
      );
    },
  );

  it('marks a new board saved only after persistence succeeds', async () => {
    let complete!: () => void;
    const save = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          complete = resolve;
        }),
    );
    openEditor(false, save);
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    expect(screen.getByRole('status')).toHaveTextContent('Kaydediliyor…');
    expect(screen.getByRole('button', { name: 'Kaydet' })).toBeDisabled();
    await act(async () => complete());
    expect(screen.getByRole('status')).toHaveTextContent(/^Kaydedildi$/);
    expect(save).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Oyuncu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Geri al' }));
    expect(screen.getByRole('status')).toHaveTextContent(/^Kaydedildi$/);
  });

  it('keeps a failed new save unsaved and allows a successful retry', async () => {
    const save = vi
      .fn(async () => {})
      .mockRejectedValueOnce(new Error('Save failed'));
    openEditor(false, save);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    });
    expect(screen.getByRole('status')).toHaveTextContent('Henüz kaydedilmedi');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    });
    expect(screen.getByRole('status')).toHaveTextContent(/^Kaydedildi$/);
  });

  it('keeps dirty changes after an existing board fails to save', async () => {
    openEditor(
      true,
      vi.fn(async () => {
        throw new Error('Save failed');
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Oyuncu' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Kaydedilmemiş değişiklik',
    );
  });
});
