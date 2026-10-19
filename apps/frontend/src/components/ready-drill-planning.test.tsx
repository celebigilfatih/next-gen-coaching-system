import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlanDrillPicker } from './plan-drill-picker';
import { AddDrillToPlanDialog } from './add-drill-to-plan-dialog';

const api = vi.hoisted(() => ({
  page: vi.fn(),
  filtered: vi.fn(),
  detail: vi.fn(),
  plans: vi.fn(),
  metadata: vi.fn(),
  add: vi.fn(),
  create: vi.fn(),
  accounts: vi.fn(),
  role: 'COACH' as 'COACH' | 'SYSTEM_ADMIN',
}));
vi.mock('../lib/api', () => ({
  getDrillPage: api.page,
  getFilteredDrillPage: api.filtered,
  getDrillContent: api.detail,
  getTrainingPlanPage: api.plans,
  getTrainingEditorMetadata: api.metadata,
  addTrainingPlanDrill: api.add,
  createTrainingPlan: api.create,
  updateTrainingPlan: vi.fn(),
  deleteTrainingPlan: vi.fn(),
  getAccountPage: api.accounts,
}));
vi.mock('../lib/session', () => ({
  getSession: () => ({ user: { id: 'actor', role: api.role, clubId: 'c' } }),
}));
vi.mock('./tactics/tactical-board-editor', () => ({
  TacticalBoardEditor: ({ readOnly }: { readOnly: boolean }) => (
    <div data-testid="readonly-board" data-readonly={readOnly}>
      Saha önizlemesi
    </div>
  ),
}));
const drill = {
  id: 'd',
  title: 'Pres oyunu',
  category: 'TACTICAL',
  ageGroup: 'U14',
  durationMin: 18,
  summary: 'Baskı tetikleyicileri',
  contentVersionId: 'v1',
  playerMin: 8,
  playerMax: 14,
  areaLengthM: 30,
  areaWidthM: 20,
};
const plan = {
  id: 'p',
  title: 'Salı antrenmanı',
  groupId: 'g',
  drills: [],
  totalDuration: 0,
};
const detail = {
  version: {
    id: 'v1',
    title: drill.title,
    summary: drill.summary,
    durationMin: 20,
    equipmentItems: ['Top', 'Koni'],
    organization: 'Üç koridor kurun.',
    steps: ['Birlikte baskı yapın.'],
    coachingPoints: ['Pas kanalını kapatın.'],
    progressions: ['İki temas.'],
    regressions: ['Alanı büyütün.'],
    boardDocument: {},
    source: { title: 'NGCS', license: 'NGCS_PROPRIETARY' },
  },
  variant: {
    ageGroup: 'U14',
    durationMin: 18,
    rules: ['Üç pas.'],
    coachingPoints: ['Çevre kontrolü.'],
  },
};
const renderDialog = () =>
  render(
    <MemoryRouter>
      <AddDrillToPlanDialog
        groupId="g"
        clubId="c"
        groupName="U14"
        drillId="d"
        expectedVersionId="v1"
        phase="TACTICAL"
        onClose={vi.fn()}
      />
    </MemoryRouter>,
  );

describe('ready exercise planning', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.role = 'COACH';
    api.accounts.mockResolvedValue({
      items: [{ id: 'coach', name: 'Takım antrenörü' }],
      total: 1,
      nextCursor: null,
    });
    api.page.mockResolvedValue({ items: [drill], total: 1, nextCursor: null });
    api.filtered.mockImplementation(api.page);
    api.detail.mockResolvedValue(detail);
    api.plans.mockResolvedValue({ items: [plan], total: 1, nextCursor: null });
    api.metadata.mockResolvedValue(plan);
    api.add.mockResolvedValue({ id: 'phase' });
    api.create.mockResolvedValue({
      ...plan,
      id: 'new',
      title: 'Yeni antrenman',
    });
  });
  it('shows scalar exercise facts and loads the board only on explicit preview', async () => {
    render(
      <PlanDrillPicker
        groupId="g"
        ageGroup="U14"
        attachedIds={[]}
        onAdd={vi.fn()}
      />,
    );
    await screen.findByRole('option', { name: 'Pres oyunu · Taktik' });
    expect(api.detail).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Egzersiz ekle'), {
      target: { value: 'd' },
    });
    expect(screen.getByLabelText('Seçilen egzersiz özeti')).toHaveTextContent(
      '18 dk · 8–14 oyuncu · 30×20 m',
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Uygulamayı ve sahayı incele' }),
    );
    expect(await screen.findByText('Üç koridor kurun.')).toBeInTheDocument();
    expect(api.detail).toHaveBeenCalledExactlyOnceWith('d', 'U14');
    expect(screen.queryByTestId('readonly-board')).not.toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Saha' }), {
      button: 0,
      ctrlKey: false,
    });
    expect(screen.getByTestId('readonly-board')).toBeInTheDocument();
    expect(screen.getByTestId('readonly-board')).toHaveAttribute(
      'data-readonly',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Önizlemeyi kapat' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('sends shared duration/player/equipment filters to the server and resets paging', async () => {
    render(<PlanDrillPicker groupId="g" attachedIds={[]} onAdd={vi.fn()} />);
    await screen.findByRole('option', { name: /Pres oyunu/ });
    fireEvent.change(screen.getByLabelText('En çok süre (dk)'), {
      target: { value: '20' },
    });
    fireEvent.change(screen.getByLabelText('En az oyuncu'), {
      target: { value: '8' },
    });
    fireEvent.change(screen.getByLabelText('Ekipman'), {
      target: { value: 'koni' },
    });
    await waitFor(() =>
      expect(api.filtered).toHaveBeenLastCalledWith(
        'g',
        undefined,
        expect.objectContaining({
          maxDuration: 20,
          minPlayers: 8,
          equipment: 'koni',
        }),
        undefined,
      ),
    );
  });
  it('passes the expected version and waits for explicit add confirmation', async () => {
    renderDialog();
    await screen.findByRole('option', { name: 'Salı antrenmanı' });
    fireEvent.change(screen.getByLabelText('Antrenman planı'), {
      target: { value: 'p' },
    });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Plana ekle' })).toBeEnabled(),
    );
    expect(api.add).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Plana ekle' }));
    await screen.findByText('Egzersiz plana eklendi.');
    expect(api.add).toHaveBeenCalledExactlyOnceWith('p', {
      drillId: 'd',
      expectedVersionId: 'v1',
      phase: 'TACTICAL',
      order: 0,
    });
  });
  it('shows the full selected title and scheduled time before attachment when native options truncate', async () => {
    const date = '2027-05-19T13:00:00.000Z';
    const title = 'Hatlar arası bağlantı ve pozisyon çalışması';
    api.metadata.mockResolvedValue({ ...plan, title, date, totalDuration: 71 });
    renderDialog();
    await screen.findByRole('option', { name: 'Salı antrenmanı' });
    fireEvent.change(screen.getByLabelText('Antrenman planı'), {
      target: { value: 'p' },
    });
    const summary = within(
      await screen.findByRole('region', { name: 'Seçilen antrenman özeti' }),
    );
    expect(summary.getByText(title)).toBeVisible();
    expect(
      summary.getByText(
        new Date(date).toLocaleString('tr-TR', {
          dateStyle: 'long',
          timeStyle: 'short',
        }),
      ),
    ).toBeVisible();
    expect(summary.getByText('71 dk · 0 faz')).toBeVisible();
    expect(api.add).not.toHaveBeenCalled();
  });
  it('requires an active club coach for administrator-created plans and sends the existing API ownership fields', async () => {
    api.role = 'SYSTEM_ADMIN';
    renderDialog();
    await screen.findByRole('option', { name: 'Salı antrenmanı' });
    fireEvent.click(screen.getByRole('button', { name: 'Yeni antrenman' }));
    await screen.findByRole('option', { name: 'Takım antrenörü' });
    fireEvent.change(screen.getByLabelText('Tarih ve saat'), {
      target: { value: '2026-10-20T18:00' },
    });
    expect(
      screen.getByRole('button', { name: 'Planı oluştur' }),
    ).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Sorumlu antrenör'), {
      target: { value: 'coach' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Planı oluştur' }));
    await waitFor(() =>
      expect(api.create).toHaveBeenCalledWith(
        expect.objectContaining({
          clubId: 'c',
          coachId: 'coach',
          groupId: 'g',
        }),
      ),
    );
    expect(api.accounts).toHaveBeenCalledWith({
      clubId: 'c',
      role: 'COACH',
      status: 'ACTIVE',
      after: undefined,
    });
    expect(api.add).not.toHaveBeenCalled();
  });
  it('creates a plan without automatically attaching and keeps the selected exercise', async () => {
    renderDialog();
    await screen.findByRole('option', { name: 'Salı antrenmanı' });
    fireEvent.click(screen.getByRole('button', { name: 'Yeni antrenman' }));
    fireEvent.change(screen.getByLabelText('Tarih ve saat'), {
      target: { value: '2026-10-20T18:00' },
    });
    api.metadata.mockResolvedValue({ ...plan, id: 'new' });
    fireEvent.click(screen.getByRole('button', { name: 'Planı oluştur' }));
    await waitFor(() => expect(api.create).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.getByLabelText('Antrenman planı')).toHaveValue('new'),
    );
    expect(api.add).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Plana ekle' })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Plana ekle' }));
    await waitFor(() =>
      expect(api.add).toHaveBeenCalledWith(
        'new',
        expect.objectContaining({ drillId: 'd', expectedVersionId: 'v1' }),
      ),
    );
  });
  it('blocks retries after an uncertain write until the plan is explicitly verified', async () => {
    api.add.mockRejectedValueOnce(new Error('Bağlantı kesildi'));
    renderDialog();
    await screen.findByRole('option', { name: 'Salı antrenmanı' });
    fireEvent.change(screen.getByLabelText('Antrenman planı'), {
      target: { value: 'p' },
    });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Plana ekle' })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Plana ekle' }));
    await screen.findByRole('alert');
    expect(screen.getByRole('button', { name: 'Plana ekle' })).toBeDisabled();
    api.metadata.mockResolvedValue({ ...plan, drills: [{ drillId: 'd' }] });
    fireEvent.click(
      screen.getByRole('button', { name: 'Planı yenile ve sonucu kontrol et' }),
    );
    await screen.findByText('Egzersiz plana eklendi.');
    expect(api.add).toHaveBeenCalledTimes(1);
  });
  it('ignores an old selection read after the selected plan changes', async () => {
    let resolve!: (value: typeof plan) => void;
    api.metadata.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    api.plans.mockResolvedValue({
      items: [plan, { ...plan, id: 'p2', title: 'Çarşamba' }],
      total: 2,
      nextCursor: null,
    });
    renderDialog();
    await screen.findByRole('option', { name: 'Salı antrenmanı' });
    fireEvent.change(screen.getByLabelText('Antrenman planı'), {
      target: { value: 'p' },
    });
    await waitFor(() => expect(api.metadata).toHaveBeenCalledWith('p'));
    fireEvent.change(screen.getByLabelText('Antrenman planı'), {
      target: { value: 'p2' },
    });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Plana ekle' })).toBeEnabled(),
    );
    await act(async () => resolve({ ...plan, groupId: 'foreign' }));
    expect(
      screen.queryByText('Planın takım bağlamı değişti.'),
    ).not.toBeInTheDocument();
  });
});
