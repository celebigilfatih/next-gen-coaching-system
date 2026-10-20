import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TrainingDetailRoute from './training-detail';
import { emptyBoard } from '../lib/tactical-board';
import type { TacticalDocument } from '../lib/tactical-document-core';
import { createSequence, editScenes } from '../lib/tactical-scenes';
import { clearSession, setSession } from '../lib/session';
import type { TrainingEditorMetadata, TrainingPhaseDocument } from '../lib/api';

const api = vi.hoisted(() => ({
  getTrainingEditorMetadata: vi.fn(),
  getTrainingPhaseDocument: vi.fn(),
  putTrainingPhaseDocument: vi.fn(),
  addTrainingPlanDrill: vi.fn(),
  getTrainingPlan: vi.fn(),
}));
vi.mock('../lib/api', () => api);
vi.mock('../lib/workspace-context', () => ({
  useWorkspace: () => ({
    scope: { clubId: 'club', clubSeasonId: 'season', teamId: 'team' },
    reload: async () => {},
  }),
}));
vi.mock('../components/plan-drill-picker', () => ({
  PlanDrillPicker: () => <div>Egzersiz seçici</div>,
}));
vi.mock('../components/plan-attendance', () => ({
  PlanAttendance: () => <div>Katılım listesi</div>,
}));
// Real editor state, dialogs and keyboard shortcuts; only canvas drawing is mocked.
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

const metadata: TrainingEditorMetadata = {
  id: 'plan',
  title: 'Antrenman',
  groupId: 'group',
  date: null,
  notes: null,
  totalDuration: 20,
  drills: ['first', 'second'].map((id, order) => ({
    id,
    drillId: `drill-${id}`,
    phase: 'TACTICAL',
    order,
    notes: null,
    drill: { id: `drill-${id}`, title: `Faz ${id}`, durationMin: 10 },
  })),
};
const response = (
  phaseId = 'first',
  document: TacticalDocument = emptyBoard(),
): TrainingPhaseDocument => ({
  planId: 'plan',
  planDrillId: phaseId,
  writeToken: `token-${phaseId}`,
  drillId: `drill-${phaseId}`,
  origin: 'drill',
  status: 'ready',
  document,
});
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  setSession({
    token: 'unit-only',
    user: {
      id: 'coach',
      role: 'COACH',
      clubId: 'club',
      name: 'Coach',
      email: 'coach@example.test',
    },
  });
  api.getTrainingEditorMetadata.mockResolvedValue(metadata);
  api.getTrainingPhaseDocument.mockImplementation(async (_plan, phase) =>
    response(phase),
  );
  api.putTrainingPhaseDocument.mockImplementation(
    async (_plan, id, document) => ({
      ...response(id, document),
      origin: 'snapshot',
      writeToken: 'saved-token',
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());
function open(path = '/app/trainings/plan') {
  const router = createMemoryRouter(
    [
      { path: '/app/trainings/:planId', element: <TrainingDetailRoute /> },
      { path: '/app/trainings', element: <p>Plan listesi</p> },
    ],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
  return router;
}
function tab(name: string) {
  fireEvent.mouseDown(screen.getByRole('tab', { name }), {
    button: 0,
    ctrlKey: false,
  });
}
async function openBoard() {
  await screen.findByRole('heading', { name: 'Antrenman' });
  tab('Taktik tahtası');
  fireEvent.click(screen.getByRole('button', { name: 'Tahtayı aç' }));
  await screen.findByRole('button', { name: 'Geri al' });
}
function dirty() {
  fireEvent.click(screen.getByRole('button', { name: 'Oyuncu' }));
}

describe('training on-demand board and draft transitions', () => {
  it('saves every V2 scene with the original token and preserves undo after first snapshot', async () => {
    const sequence = createSequence(emptyBoard(), 'one');
    api.getTrainingPhaseDocument.mockResolvedValue(response('first', sequence));
    open();
    await openBoard();
    fireEvent.click(screen.getByRole('button', { name: 'Sahne ekle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/^Kaydedildi$/),
    );
    expect(api.putTrainingPhaseDocument.mock.calls[0][2].scenes).toHaveLength(
      2,
    );
    expect(api.putTrainingPhaseDocument.mock.calls[0][3]).toBe('token-first');
    fireEvent.click(screen.getByRole('button', { name: 'Geri al' }));
    expect(
      screen.getByRole('region', { name: 'Sahne düzenleyici' }),
    ).toHaveTextContent('1/12');
    fireEvent.click(screen.getByRole('button', { name: 'Yinele' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sahne ekle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() =>
      expect(api.putTrainingPhaseDocument).toHaveBeenCalledTimes(2),
    );
    expect(api.putTrainingPhaseDocument.mock.calls[1][3]).toBe('saved-token');
    expect(api.getTrainingPhaseDocument).toHaveBeenCalledTimes(1);
  });
  it('does not adopt a different server token after conflict verification or force overwrite', async () => {
    const sequence = createSequence(emptyBoard(), 'one');
    api.getTrainingPhaseDocument.mockResolvedValue(response('first', sequence));
    api.putTrainingPhaseDocument.mockRejectedValue(
      new Error('TACTICAL_DOCUMENT_WRITE_CONFLICT'),
    );
    open();
    await openBoard();
    fireEvent.click(screen.getByRole('button', { name: 'Sahne ekle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await screen.findByText('Kayıt sonucunu doğrulayın');
    api.getTrainingPhaseDocument.mockResolvedValue({
      ...response('first', sequence),
      origin: 'snapshot',
      writeToken: 'other-session',
    });
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Kaydı doğrula' }),
      ).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Kaydı doğrula' }));
    await screen.findByText(/Sunucudaki kayıt gönderilen taslakla aynı değil/);
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Taslağı koru; yeniden kaydetmeye izin ver',
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() =>
      expect(api.putTrainingPhaseDocument).toHaveBeenCalledTimes(2),
    );
    expect(api.putTrainingPhaseDocument.mock.calls[1][3]).toBe('token-first');
    expect(
      screen.getByRole('region', { name: 'Sahne düzenleyici' }),
    ).toHaveTextContent('2/12');
  });
  it('explicitly acknowledges only the identical snapshot after a lost response, then uses its verified token', async () => {
    const sequence = createSequence(emptyBoard(), 'one');
    api.getTrainingPhaseDocument.mockResolvedValue(response('first', sequence));
    api.putTrainingPhaseDocument.mockRejectedValueOnce(
      new Error('Connection interrupted'),
    );
    open();
    await openBoard();
    fireEvent.click(screen.getByRole('button', { name: 'Sahne ekle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await screen.findByText('Kayıt sonucunu doğrulayın');
    const sent = api.putTrainingPhaseDocument.mock.calls[0][2];
    api.getTrainingPhaseDocument.mockResolvedValue({
      ...response('first', sent),
      origin: 'snapshot',
      writeToken: 'verified-snapshot',
    });
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Kaydı doğrula' }),
      ).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Kaydı doğrula' }));
    await screen.findByText(/Snapshot sunucuda doğrulandı/);
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/^Kaydedildi$/),
    );
    expect(api.putTrainingPhaseDocument).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Sahne ekle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() =>
      expect(api.putTrainingPhaseDocument).toHaveBeenCalledTimes(2),
    );
    expect(api.putTrainingPhaseDocument.mock.calls[1][3]).toBe(
      'verified-snapshot',
    );
  });
  it.each(['TACTICAL_V2_WRITES_DISABLED', 'Forbidden'])(
    'retains full V2 and guards phase leave when %s',
    async (message) => {
      api.getTrainingPhaseDocument.mockResolvedValue(
        response('first', createSequence(emptyBoard(), 'one')),
      );
      api.putTrainingPhaseDocument.mockRejectedValue(new Error(message));
      open();
      await openBoard();
      fireEvent.click(screen.getByRole('button', { name: 'Sahne ekle' }));
      fireEvent.change(screen.getByLabelText('Tahta için faz seçin'), {
        target: { value: 'second' },
      });
      fireEvent.click(
        await screen.findByRole('button', { name: 'Kaydet ve çık' }),
      );
      await waitFor(() =>
        expect(api.putTrainingPhaseDocument).toHaveBeenCalledTimes(1),
      );
      fireEvent.click(screen.getByRole('button', { name: 'İptal' }));
      expect(screen.getByLabelText('Tahta için faz seçin')).toHaveValue(
        'first',
      );
      expect(
        screen.getByRole('region', { name: 'Sahne düzenleyici' }),
      ).toHaveTextContent('2/12');
      expect(api.getTrainingPhaseDocument).toHaveBeenCalledTimes(1);
    },
  );
  it('discards a V2 draft on phase switch and opens only the explicitly requested phase', async () => {
    api.getTrainingPhaseDocument.mockImplementation(async (_plan, id) =>
      response(id, createSequence(emptyBoard(), 'one')),
    );
    open();
    await openBoard();
    fireEvent.click(screen.getByRole('button', { name: 'Sahne ekle' }));
    fireEvent.change(screen.getByLabelText('Tahta için faz seçin'), {
      target: { value: 'second' },
    });
    fireEvent.click(
      await screen.findByRole('button', { name: 'Değişiklikleri at' }),
    );
    expect(api.getTrainingPhaseDocument).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Tahtayı aç' }));
    expect(
      await screen.findByRole('region', { name: 'Sahne düzenleyici' }),
    ).toHaveTextContent('1/12');
    expect(api.getTrainingPhaseDocument).toHaveBeenLastCalledWith(
      'plan',
      'second',
    );
  });
  it('plays V2 in PLAYER scope without mutation controls', async () => {
    setSession({
      token: 'player',
      user: {
        id: 'player',
        role: 'PLAYER',
        clubId: 'club',
        name: 'Player',
        email: 'p@example.test',
      },
    });
    api.getTrainingPhaseDocument.mockResolvedValue(
      response(
        'first',
        editScenes(createSequence(emptyBoard(), 'one'), {
          type: 'duplicate',
          id: 'one',
          newId: 'two',
        }),
      ),
    );
    open();
    await openBoard();
    expect(screen.getByRole('button', { name: 'Oynat' })).toBeEnabled();
    expect(
      screen.queryByRole('button', { name: 'Kaydet' }),
    ).not.toBeInTheDocument();
    expect(api.putTrainingPhaseDocument).not.toHaveBeenCalled();
  });
  it('renders the compact detail, verified plan summary and accessible phase selection', async () => {
    open();
    await screen.findByRole('heading', { name: 'Antrenman' });
    expect(
      screen.queryByRole('link', { name: 'Planlar' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Toplam süre')).toBeInTheDocument();
    expect(screen.getByText('20 dk')).toBeInTheDocument();
    expect(screen.getByText('Plan fazı')).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Plan özeti' }),
    ).toHaveTextContent('2 faz');
    expect(
      screen.getByRole('list', { name: 'Antrenman fazları' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Faz first/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: /Faz second/ }));
    expect(screen.getByRole('button', { name: /Faz second/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Akış' })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Taktik tahtası' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Katılım' })).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Taktik tahtasına geç' }),
    );
    expect(screen.getByLabelText('Tahta için faz seçin')).toHaveValue('second');
    expect(api.getTrainingPhaseDocument).not.toHaveBeenCalled();
  });
  it('guards next/previous phase navigation and loads a board only after explicit open', async () => {
    api.getTrainingEditorMetadata.mockResolvedValue({
      ...metadata,
      drills: metadata.drills.map((item, index) => ({
        ...item,
        phase: index === 0 ? 'WARM_UP' : 'TECHNICAL',
        order: 0,
      })),
    });
    open();
    await openBoard();
    expect(screen.getByRole('button', { name: 'Önceki faz' })).toBeDisabled();
    dirty();
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki faz' }));
    fireEvent.click(await screen.findByRole('button', { name: 'İptal' }));
    expect(screen.getByLabelText('Tahta için faz seçin')).toHaveValue('first');
    expect(screen.getByRole('button', { name: 'Geri al' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki faz' }));
    fireEvent.click(
      await screen.findByRole('button', { name: 'Değişiklikleri at' }),
    );
    expect(screen.getByLabelText('Tahta için faz seçin')).toHaveValue('second');
    expect(
      screen.getByRole('option', { name: 'Faz second · Teknik · 2' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sonraki faz' })).toBeDisabled();
    expect(api.getTrainingPhaseDocument).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Tahtayı aç' }));
    await screen.findByRole('button', { name: 'Geri al' });
    expect(api.getTrainingPhaseDocument).toHaveBeenLastCalledWith(
      'plan',
      'second',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Önceki faz' }));
    expect(screen.getByLabelText('Tahta için faz seçin')).toHaveValue('first');
    expect(api.getTrainingPhaseDocument).toHaveBeenCalledTimes(2);
    expect(api.putTrainingPhaseDocument).not.toHaveBeenCalled();
  });
  it.each(['', '?tab=attendance'])(
    'loads metadata without any board JSON at entry %s',
    async (query) => {
      open(`/app/trainings/plan${query}`);
      await screen.findByRole('heading', { name: 'Antrenman' });
      expect(api.getTrainingEditorMetadata).toHaveBeenCalledWith('plan');
      expect(api.getTrainingPhaseDocument).not.toHaveBeenCalled();
      expect(api.getTrainingPlan).not.toHaveBeenCalled();
      tab('Taktik tahtası');
      expect(
        screen.getByRole('option', { name: /Faz second/ }),
      ).toBeInTheDocument();
      expect(api.getTrainingPhaseDocument).not.toHaveBeenCalled();
    },
  );
  it('opens one phase, saves once and preserves undo across its first snapshot save', async () => {
    open();
    await openBoard();
    expect(api.getTrainingPhaseDocument).toHaveBeenCalledTimes(1);
    dirty();
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/^Kaydedildi$/),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Geri al' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Kaydedilmemiş değişiklik',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Yinele' }));
    expect(screen.getByRole('status')).toHaveTextContent(/^Kaydedildi$/);
    expect(api.putTrainingPhaseDocument).toHaveBeenCalledTimes(1);
    expect(api.getTrainingEditorMetadata).toHaveBeenCalledTimes(1);
  });
  it('cancels and discards a dirty phase change without prefetch or autosave', async () => {
    open();
    await openBoard();
    dirty();
    fireEvent.change(screen.getByLabelText('Tahta için faz seçin'), {
      target: { value: 'second' },
    });
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'İptal' }));
    expect(screen.getByLabelText('Tahta için faz seçin')).toHaveValue('first');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Kaydedilmemiş değişiklik',
    );
    fireEvent.change(screen.getByLabelText('Tahta için faz seçin'), {
      target: { value: 'second' },
    });
    fireEvent.click(
      await screen.findByRole('button', { name: 'Değişiklikleri at' }),
    );
    expect(screen.getByLabelText('Tahta için faz seçin')).toHaveValue('second');
    expect(api.getTrainingPhaseDocument).toHaveBeenCalledTimes(1);
    expect(api.putTrainingPhaseDocument).not.toHaveBeenCalled();
  });
  it('saves before leaving the board tab and does not remount on cancel', async () => {
    open();
    await openBoard();
    dirty();
    tab('Akış');
    fireEvent.click(await screen.findByRole('button', { name: 'İptal' }));
    expect(screen.getByRole('button', { name: 'Geri al' })).toBeEnabled();
    tab('Akış');
    fireEvent.click(
      await screen.findByRole('button', { name: 'Kaydet ve çık' }),
    );
    await screen.findByText('Egzersiz seçici');
    expect(api.putTrainingPhaseDocument).toHaveBeenCalledTimes(1);
    tab('Taktik tahtası');
    expect(
      screen.queryByRole('button', { name: 'Oyuncu' }),
    ).not.toBeInTheDocument();
  });
  it.each(['/app/trainings', '/app/trainings/plan?ngcsClub=other'])(
    'guards route/workspace navigation %s before commit',
    async (destination) => {
      const router = open();
      await openBoard();
      dirty();
      await act(async () => {
        await router.navigate(destination);
      });
      fireEvent.click(await screen.findByRole('button', { name: 'İptal' }));
      expect(
        router.state.location.pathname + router.state.location.search,
      ).toBe('/app/trainings/plan');
      expect(screen.getByRole('status')).toHaveTextContent(
        'Kaydedilmemiş değişiklik',
      );
      await act(async () => {
        await router.navigate(destination);
      });
      fireEvent.click(
        await screen.findByRole('button', { name: 'Değişiklikleri at' }),
      );
      await waitFor(() =>
        expect(
          router.state.location.pathname + router.state.location.search,
        ).toBe(destination),
      );
    },
  );
  it('holds failed/uncertain save, reconciles by GET and acknowledges without duplicate PUT', async () => {
    let submitted!: TacticalDocument;
    api.putTrainingPhaseDocument.mockImplementation(
      async (_plan, _phase, document) => {
        submitted = document;
        throw new Error('Connection interrupted');
      },
    );
    open();
    await openBoard();
    dirty();
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await screen.findByText('Kayıt sonucunu doğrulayın');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Kaydedilmemiş değişiklik',
    );
    api.getTrainingPhaseDocument.mockImplementation(async () => ({
      ...response('first', submitted),
      origin: 'snapshot',
    }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Kaydı doğrula' }),
      ).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Kaydı doğrula' }));
    await screen.findByText(/Snapshot sunucuda doğrulandı/);
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/^Kaydedildi$/),
    );
    expect(api.putTrainingPhaseDocument).toHaveBeenCalledTimes(1);
  });
  it('keeps a failed save-and-leave dialog and its draft until cancellation', async () => {
    api.putTrainingPhaseDocument.mockRejectedValue(
      new Error('Connection interrupted'),
    );
    open();
    await openBoard();
    dirty();
    tab('Akış');
    fireEvent.click(
      await screen.findByRole('button', { name: 'Kaydet ve çık' }),
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'İptal' })).toBeEnabled(),
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'İptal' }));
    expect(screen.getByRole('tab', { name: 'Taktik tahtası' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Kaydedilmemiş değişiklik',
    );
    expect(api.putTrainingPhaseDocument).toHaveBeenCalledTimes(1);
  });
  it('rejects a mismatched phase response and retries only its selected read', async () => {
    api.getTrainingPhaseDocument.mockResolvedValueOnce(response('second'));
    open();
    await screen.findByRole('heading', { name: 'Antrenman' });
    tab('Taktik tahtası');
    fireEvent.click(screen.getByRole('button', { name: 'Tahtayı aç' }));
    await screen.findByText('Tahta yanıtı seçilen fazla eşleşmiyor.');
    expect(
      screen.queryByRole('button', { name: 'Oyuncu' }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Tahtayı yeniden yükle' }),
    );
    await screen.findByRole('button', { name: 'Oyuncu' });
    expect(api.getTrainingPhaseDocument.mock.calls).toEqual([
      ['plan', 'first'],
      ['plan', 'first'],
    ]);
    expect(api.getTrainingPlan).not.toHaveBeenCalled();
  });
  it('ignores metadata from a previous plan after navigation', async () => {
    let complete!: (value: TrainingEditorMetadata) => void;
    api.getTrainingEditorMetadata.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    );
    const router = open();
    await act(async () => {
      await router.navigate('/app/trainings/new-plan');
    });
    await screen.findByRole('heading', { name: 'Antrenman' });
    await act(async () => complete({ ...metadata, title: 'Stale old plan' }));
    expect(screen.queryByText('Stale old plan')).not.toBeInTheDocument();
    expect(api.getTrainingEditorMetadata).toHaveBeenLastCalledWith('new-plan');
    expect(api.getTrainingPhaseDocument).not.toHaveBeenCalled();
  });
  it('prevents keyboard double save and retains pending draft on save failure', async () => {
    let reject!: (cause: Error) => void;
    api.putTrainingPhaseDocument.mockImplementation(
      () =>
        new Promise((_resolve, rejectSave) => {
          reject = rejectSave;
        }),
    );
    open();
    await openBoard();
    dirty();
    fireEvent.keyDown(window, { key: 's', ctrlKey: true });
    fireEvent.keyDown(window, { key: 's', ctrlKey: true });
    expect(api.putTrainingPhaseDocument).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Tahta için faz seçin')).toBeDisabled();
    await act(async () => reject(new Error('Failed')));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Kaydedilmemiş değişiklik',
    );
  });
  it('ignores an old phase response after selection changes', async () => {
    let complete!: (value: TrainingPhaseDocument) => void;
    api.getTrainingPhaseDocument.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    );
    open();
    await screen.findByRole('heading', { name: 'Antrenman' });
    tab('Taktik tahtası');
    fireEvent.click(screen.getByRole('button', { name: 'Tahtayı aç' }));
    fireEvent.change(screen.getByLabelText('Tahta için faz seçin'), {
      target: { value: 'second' },
    });
    await act(async () => complete(response()));
    expect(
      screen.queryByRole('button', { name: 'Oyuncu' }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tahtayı aç' }));
    await screen.findByRole('button', { name: 'Oyuncu' });
    expect(api.getTrainingPhaseDocument).toHaveBeenLastCalledWith(
      'plan',
      'second',
    );
  });
  it.each(['invalid', 'absent', 'malformed'] as const)(
    'rejects non-editable %s data without fallback',
    async (kind) => {
      api.getTrainingPhaseDocument.mockResolvedValue(
        kind === 'malformed'
          ? { ...response(), document: { extra: true } }
          : {
              ...response(),
              status: kind,
              origin: kind === 'absent' ? null : 'snapshot',
              document: null,
            },
      );
      open();
      await screen.findByRole('heading', { name: 'Antrenman' });
      tab('Taktik tahtası');
      fireEvent.click(screen.getByRole('button', { name: 'Tahtayı aç' }));
      await waitFor(() =>
        expect(screen.queryByText('Tahta yükleniyor…')).not.toBeInTheDocument(),
      );
      expect(
        screen.queryByRole('button', { name: 'Oyuncu' }),
      ).not.toBeInTheDocument();
      expect(api.getTrainingPlan).not.toHaveBeenCalled();
    },
  );
  it('makes PLAYER read-only and clears protected draft after session revocation', async () => {
    setSession({
      token: 'unit-player',
      user: {
        id: 'player',
        role: 'PLAYER',
        clubId: 'club',
        name: 'Player',
        email: 'p@example.test',
      },
    });
    open();
    await openBoard();
    expect(
      screen.queryByRole('button', { name: 'Kaydet' }),
    ).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: 's', ctrlKey: true });
    expect(api.putTrainingPhaseDocument).not.toHaveBeenCalled();
    await act(async () => clearSession());
    expect(screen.getByText('Oturum gerekli.')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Antrenman' }),
    ).not.toBeInTheDocument();
  });
});
