import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LibraryDetailRoute from './library-detail';
import type { DrillContentDetail } from '../lib/api';
import { emptyBoard } from '../lib/tactical-board';
import { createContext, useContext } from 'react';

const WorkspaceRevision = createContext(0);

const mocks = vi.hoisted(() => ({
  read: vi.fn(),
  board: vi.fn(),
  reload: vi.fn(),
  role: 'COACH',
  workspace: {
    group: { id: 'g', name: 'U14 Takımı', ageGroup: 'U14' } as
      | { id: string; name: string; ageGroup: string }
      | undefined,
    scope: { clubId: 'c', clubSeasonId: 'cs', teamId: 't' },
    season: { id: 's' },
    loading: false,
    error: '',
  },
}));
vi.mock('../lib/api', () => ({ getDrillContent: mocks.read }));
vi.mock('../lib/workspace-context', () => ({
  useWorkspace: () => {
    useContext(WorkspaceRevision);
    return { ...mocks.workspace, reload: mocks.reload };
  },
}));
vi.mock('../lib/session', () => ({
  getSession: () => ({ user: { role: mocks.role } }),
}));
vi.mock('../components/tactics/tactical-board-editor', () => ({
  TacticalBoardEditor: (props: unknown) => {
    mocks.board(props);
    return <div data-testid="readonly-pitch">Saha</div>;
  },
}));
vi.mock('../components/add-drill-to-plan-dialog', () => ({
  AddDrillToPlanDialog: (props: {
    onClose: () => void;
    groupId: string;
    drillId: string;
    expectedVersionId: string;
    seasonId: string;
  }) => (
    <div
      role="dialog"
      aria-label="Plan seçimi"
      data-group={props.groupId}
      data-drill={props.drillId}
      data-version={props.expectedVersionId}
      data-season={props.seasonId}
    >
      <button onClick={props.onClose}>Seçimi kapat</button>
    </div>
  ),
}));

function detail(): DrillContentDetail {
  return {
    drill: { id: 'd', scope: 'GLOBAL', clubId: null, groupId: null },
    provenance: 'published',
    version: {
      id: 'v1',
      version: 1,
      status: 'PUBLISHED',
      title: 'Yönlü ilk kontrol',
      summary: 'Tam açıklama: çevreyi tarayın ve baskıdan uzaklaşın.',
      category: 'TECHNICAL',
      difficulty: 'MEDIUM',
      objectiveKey: 'ilk-kontrol',
      objectiveLabel: 'İlk dokunuşla sonraki aksiyonu hazırlama',
      themes: [],
      durationMin: 22,
      playerMin: 10,
      playerMax: 16,
      areaLengthM: 40,
      areaWidthM: 28,
      equipmentItems: ['Top', 'Koni'],
      organization: 'Alanı dört kapıya ayırın.',
      steps: [
        'Pas gelmeden önce omuz kontrolü yapın.',
        'İlk dokunuşla boş kapıya yönelin.',
      ],
      coachingPoints: ['Açık vücut açısını koruyun.'],
      progressions: ['Baskıyı artırın.'],
      regressions: ['Alanı büyütün.'],
      constraints: ['Kontrollü temas.'],
      safetyNotes: 'Saha zeminini kontrol edin.',
      boardDocument: emptyBoard(),
      source: {
        kind: 'OPEN_LICENSE',
        title: 'Kaynak çalışması',
        license: 'CC_BY_4_0',
        attribution: 'Özgün çalışma atfı',
        author: 'İçerik yazarı',
        changes: 'Alan ölçüsü uyarlandı.',
        sourceUrl: 'https://example.test/drill',
      },
      ageVariants: [],
    },
    variant: {
      ageGroup: 'U14',
      durationMin: 18,
      playerMin: 8,
      playerMax: 14,
      areaLengthM: 34,
      areaWidthM: 24,
      rules: ['U14 için serbest temas.'],
      coachingPoints: ['Karar süresini kademeli kısaltın.'],
    },
  };
}
function open() {
  const router = createMemoryRouter(
    [
      { path: '/app/library/:drillId', element: <LibraryDetailRoute /> },
      { path: '/app/library', element: <p>Kütüphane listesi</p> },
    ],
    { initialEntries: ['/app/library/d'] },
  );
  let revision = 0;
  const element = () => (
    <WorkspaceRevision.Provider value={revision}>
      <RouterProvider router={router} />
    </WorkspaceRevision.Provider>
  );
  const view = render(element());
  return {
    router,
    ...view,
    refreshScope: () => {
      revision++;
      view.rerender(element());
    },
  };
}
function tab(name: string) {
  fireEvent.mouseDown(screen.getByRole('tab', { name }), {
    button: 0,
    ctrlKey: false,
  });
}
describe('exercise detail workspace', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.role = 'COACH';
    mocks.workspace = {
      group: { id: 'g', name: 'U14 Takımı', ageGroup: 'U14' },
      scope: { clubId: 'c', clubSeasonId: 'cs', teamId: 't' },
      season: { id: 's' },
      loading: false,
      error: '',
    };
    mocks.read.mockResolvedValue(detail());
  });
  it('shows resolved summary and full numbered steps in the compact application panel', async () => {
    open();
    await screen.findByRole('heading', { name: 'Yönlü ilk kontrol' });
    expect(mocks.read).toHaveBeenCalledExactlyOnceWith('d', 'U14');
    expect(document.querySelector('.page-hero-image')).not.toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Egzersiz özeti' }),
    ).toHaveTextContent('18 dkOyuncu8–14Alan34×24 mUyarlamaU14');
    const steps = screen.getByRole('list', { name: 'Uygulama adımları' });
    expect(within(steps).getAllByRole('listitem')).toHaveLength(2);
    expect(steps).toHaveTextContent('Pas gelmeden önce omuz kontrolü yapın.');
    expect(screen.getByText('U14 için serbest temas.')).toBeVisible();
    expect(
      screen.getByText('Tam açıklama: çevreyi tarayın ve baskıdan uzaklaşın.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Kopyala ve düzenle' }),
    ).toHaveAttribute('href', '/app/tactics/d');
    expect(mocks.board).not.toHaveBeenCalled();
  });
  it('mounts only the selected readonly pitch and does not re-read on tab changes', async () => {
    open();
    await screen.findByRole('heading', { name: 'Yönlü ilk kontrol' });
    tab('Saha');
    expect(screen.getByTestId('readonly-pitch')).toBeInTheDocument();
    expect(mocks.board).toHaveBeenLastCalledWith(
      expect.objectContaining({
        readOnly: true,
        initiallySaved: true,
        initialDocument: detail().version!.boardDocument,
      }),
    );
    expect(mocks.board.mock.calls[0][0]).not.toHaveProperty('onSave');
    tab('Uygulama');
    expect(screen.queryByTestId('readonly-pitch')).not.toBeInTheDocument();
    expect(mocks.read).toHaveBeenCalledTimes(1);
  });
  it('keeps attribution, license, author, adaptations and source URL in the source tab', async () => {
    open();
    await screen.findByRole('heading', { name: 'Yönlü ilk kontrol' });
    tab('Kaynak');
    const source = screen.getByRole('tabpanel', { name: 'Kaynak' });
    expect(source).toHaveTextContent('CC BY 4.0');
    expect(source).toHaveTextContent('Özgün çalışma atfı');
    expect(source).toHaveTextContent('İçerik yazarı');
    expect(source).toHaveTextContent('Alan ölçüsü uyarlandı.');
    expect(source).toHaveTextContent('Saha zeminini kontrol edin.');
    expect(
      screen.getByRole('link', { name: 'Özgün kaynağı aç' }),
    ).toHaveAttribute('href', 'https://example.test/drill');
    expect(mocks.board).not.toHaveBeenCalled();
  });
  it('opens explicit plan selection with the published version and exact scope', async () => {
    open();
    await screen.findByRole('heading', { name: 'Yönlü ilk kontrol' });
    fireEvent.click(screen.getByRole('button', { name: 'Antrenmana ekle' }));
    const picker = screen.getByRole('dialog', { name: 'Plan seçimi' });
    expect(picker).toHaveAttribute('data-group', 'g');
    expect(picker).toHaveAttribute('data-drill', 'd');
    expect(picker).toHaveAttribute('data-version', 'v1');
    expect(picker).toHaveAttribute('data-season', 's');
    fireEvent.click(screen.getByRole('button', { name: 'Seçimi kapat' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Antrenmana ekle' }),
      ).toHaveFocus(),
    );
  });
  it.each(['PLAYER', 'missing-variant', 'missing-group'])(
    'keeps plan attachment disabled for %s',
    async (mode) => {
      const record = detail();
      if (mode === 'PLAYER') mocks.role = 'PLAYER';
      if (mode === 'missing-variant') record.variant = null;
      if (mode === 'missing-group') mocks.workspace.group = undefined;
      mocks.read.mockResolvedValue(record);
      open();
      await screen.findByRole('heading', { name: 'Yönlü ilk kontrol' });
      expect(
        screen.getByRole('button', { name: 'Antrenmana ekle' }),
      ).toBeDisabled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      if (mode === 'missing-variant')
        expect(
          screen.getByText(
            /Bu takım yaşı için yayınlanmış uyarlama bulunmuyor/,
          ),
        ).toBeInTheDocument();
    },
  );
  it('shows missing pitch and legacy content truthfully without a blank editor', async () => {
    const record = detail();
    record.version!.boardDocument = null;
    mocks.read.mockResolvedValueOnce(record);
    const view = open();
    await screen.findByRole('heading', { name: 'Yönlü ilk kontrol' });
    tab('Saha');
    expect(
      screen.getByText('Bu egzersiz için saha yerleşimi bulunmuyor.'),
    ).toBeInTheDocument();
    expect(mocks.board).not.toHaveBeenCalled();
    mocks.read.mockResolvedValue({
      drill: record.drill,
      version: null,
      variant: null,
      provenance: 'legacy',
    });
    await act(() => view.router.navigate('/app/library/legacy'));
    expect(
      await screen.findByText(
        'Bu eski kaydın profesyonel içerik ayrıntıları henüz doğrulanmadı.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Antrenmana ekle' }),
    ).not.toBeInTheDocument();
  });
  it('retries a failed read without showing an editor or stale content', async () => {
    mocks.read.mockRejectedValueOnce(new Error('İçerik okunamadı.'));
    open();
    expect(
      screen.getByRole('status', { name: 'Egzersiz yükleniyor' }),
    ).toBeInTheDocument();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'İçerik okunamadı.',
    );
    expect(mocks.board).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }));
    await screen.findByRole('heading', { name: 'Yönlü ilk kontrol' });
    expect(mocks.read).toHaveBeenCalledTimes(2);
  });
  it('resets tab and plan selection on scope change and rejects a previous late read', async () => {
    let finish!: (record: DrillContentDetail) => void;
    mocks.read.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const view = open();
    await waitFor(() => expect(mocks.read).toHaveBeenCalledTimes(1));
    mocks.workspace.scope.teamId = 'new';
    mocks.workspace.group = { id: 'new', name: 'Yeni takım', ageGroup: 'U16' };
    view.refreshScope();
    await screen.findByRole('heading', { name: 'Yönlü ilk kontrol' });
    const stale = detail();
    stale.version!.title = 'Önceki takım içeriği';
    await act(async () => finish(stale));
    expect(screen.queryByText('Önceki takım içeriği')).not.toBeInTheDocument();
    expect(mocks.read).toHaveBeenLastCalledWith('d', 'U16');
    fireEvent.click(screen.getByRole('button', { name: 'Antrenmana ekle' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    tab('Saha');
    mocks.workspace.scope.teamId = 'third';
    view.refreshScope();
    await screen.findByRole('heading', { name: 'Yönlü ilk kontrol' });
    expect(screen.getByRole('tab', { name: 'Uygulama' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByTestId('readonly-pitch')).not.toBeInTheDocument();
  });
  it('waits for workspace recovery before reading the exercise', async () => {
    mocks.workspace.loading = true;
    const view = open();
    expect(mocks.read).not.toHaveBeenCalled();
    mocks.workspace.loading = false;
    mocks.workspace.error = 'Takım bağlamı okunamadı.';
    view.refreshScope();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Takım bağlamı okunamadı.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }));
    expect(mocks.reload).toHaveBeenCalledTimes(1);
    expect(mocks.read).not.toHaveBeenCalled();
    mocks.workspace.error = '';
    view.refreshScope();
    await screen.findByRole('heading', { name: 'Yönlü ilk kontrol' });
  });
});
