import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlanDrillPicker } from './plan-drill-picker';
const api = vi.hoisted(() => ({ page: vi.fn() }));
vi.mock('../lib/api', () => ({ getFilteredDrillPage: api.page }));
const item = (id: string) => ({
  id,
  title: id,
  category: 'WARM_UP' as const,
  ageGroup: 'U18',
  durationMin: 12,
  difficulty: 'EASY',
  scope: 'GLOBAL',
  isBoard: false,
});
const page = (id: string, nextCursor: string | null = null) => ({
  items: [item(id)],
  total: 31,
  nextCursor,
  limit: 25,
});
describe('plan drill picker', () => {
  const add = vi.fn();
  beforeEach(() => {
    vi.resetAllMocks();
    api.page.mockImplementation(async (_g, _c, _filters, after) =>
      page(after ? 'Second' : 'First', after ? null : 'cursor'),
    );
  });
  it('keeps the ready collection and server team-age scope through filters and reset', async () => {
    render(<PlanDrillPicker groupId="g" attachedIds={[]} onAdd={add} />);
    await screen.findByRole('option', { name: /First/ });
    expect(api.page).toHaveBeenLastCalledWith(
      'g',
      undefined,
      expect.objectContaining({
        collection: 'ngcs-starter-v1',
        ageScope: 'TEAM',
      }),
      undefined,
    );
    fireEvent.change(screen.getByLabelText('Egzersiz fazı'), {
      target: { value: 'TECHNICAL' },
    });
    await waitFor(() =>
      expect(api.page).toHaveBeenLastCalledWith(
        'g',
        'TECHNICAL',
        expect.objectContaining({
          collection: 'ngcs-starter-v1',
          ageScope: 'TEAM',
        }),
        undefined,
      ),
    );
    fireEvent.change(screen.getByLabelText('Ekipman'), {
      target: { value: 'koni' },
    });
    await waitFor(() =>
      expect(api.page).toHaveBeenLastCalledWith(
        'g',
        'TECHNICAL',
        expect.objectContaining({
          collection: 'ngcs-starter-v1',
          ageScope: 'TEAM',
          equipment: 'koni',
        }),
        undefined,
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filtreleri temizle' }));
    await waitFor(() =>
      expect(api.page).toHaveBeenLastCalledWith(
        'g',
        'TECHNICAL',
        expect.objectContaining({
          collection: 'ngcs-starter-v1',
          ageScope: 'TEAM',
          equipment: undefined,
        }),
        undefined,
      ),
    );
  });
  it('shows an empty ready catalog for an unsupported age without suggesting seasonal content', async () => {
    api.page.mockResolvedValue({
      items: [],
      total: 0,
      nextCursor: null,
      ageGroup: 'U13',
    });
    render(
      <PlanDrillPicker
        groupId="g"
        ageGroup="U13"
        attachedIds={[]}
        onAdd={add}
      />,
    );
    expect(
      await screen.findByText(
        'Hazır egzersiz paketinde U13 uyarlaması bulunmuyor.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Plana ekle' })).toBeDisabled();
    expect(
      screen.queryByText(/kulüp egzersizleri varsa/i),
    ).not.toBeInTheDocument();
  });
  it('pins off-page selection and submits scalar metadata without board documents', async () => {
    render(
      <PlanDrillPicker groupId="plan-group" attachedIds={[]} onAdd={add} />,
    );
    await screen.findByRole('option', { name: 'First · Isınma' });
    fireEvent.change(screen.getByLabelText('Egzersiz ekle'), {
      target: { value: 'First' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Sonraki egzersizler' }),
    );
    await screen.findByRole('option', { name: 'Second · Isınma' });
    expect(screen.getByLabelText('Egzersiz ekle')).toHaveValue('First');
    expect(screen.getByRole('navigation')).toHaveTextContent(
      '1 / 31 katalog kaydı',
    );
    expect(api.page).toHaveBeenLastCalledWith(
      'plan-group',
      undefined,
      expect.objectContaining({
        collection: 'ngcs-starter-v1',
        ageScope: 'TEAM',
      }),
      'cursor',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Plana ekle' }));
    await waitFor(() =>
      expect(add).toHaveBeenCalledExactlyOnceWith(item('First')),
    );
    expect(screen.getByLabelText('Egzersiz ekle')).toHaveValue('');
  });
  it('retains full catalog count but hides already attached records and invalidates attached selection', async () => {
    const view = render(
      <PlanDrillPicker groupId="g" attachedIds={[]} onAdd={add} />,
    );
    await screen.findByRole('option', { name: 'First · Isınma' });
    fireEvent.change(screen.getByLabelText('Egzersiz ekle'), {
      target: { value: 'First' },
    });
    view.rerender(
      <PlanDrillPicker groupId="g" attachedIds={['First']} onAdd={add} />,
    );
    expect(
      screen.queryByRole('option', { name: /First/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Plana ekle' })).toBeDisabled();
    expect(
      screen.getByText('Bu sayfada eklenebilir egzersiz yok.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Sonraki egzersizler' }),
    ).toBeEnabled();
  });
  it('shows read errors with retry rather than implying an empty catalog', async () => {
    api.page.mockRejectedValueOnce(new Error('Read failed'));
    render(<PlanDrillPicker groupId="g" attachedIds={[]} onAdd={add} />);
    expect(
      screen.getByText('Egzersiz seçenekleri yükleniyor…'),
    ).toBeInTheDocument();
    expect(await screen.findByRole('alert')).toHaveTextContent('Read failed');
    expect(
      screen.queryByText('Bu sayfada eklenebilir egzersiz yok.'),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }));
    await screen.findByRole('option', { name: /First/ });
  });
  it('blocks double submission and retains selection on rejected writes', async () => {
    let reject!: (reason: Error) => void;
    add.mockImplementationOnce(
      () =>
        new Promise((_done, fail) => {
          reject = fail;
        }),
    );
    render(<PlanDrillPicker groupId="g" attachedIds={[]} onAdd={add} />);
    await screen.findByRole('option', { name: /First/ });
    fireEvent.change(screen.getByLabelText('Egzersiz ekle'), {
      target: { value: 'First' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Plana ekle' }));
    expect(screen.getByRole('button', { name: 'Ekleniyor…' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Sonraki egzersizler' }),
    ).toBeDisabled();
    await act(async () => reject(new Error('Forbidden')));
    expect(screen.getByRole('alert')).toHaveTextContent('Forbidden');
    expect(screen.getByLabelText('Egzersiz ekle')).toHaveValue('First');
    expect(add).toHaveBeenCalledTimes(1);
  });
  it('drops stale page responses and selection when keyed plan context changes', async () => {
    let resolve!: (value: ReturnType<typeof page>) => void;
    api.page.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const view = render(
      <PlanDrillPicker key="old" groupId="old" attachedIds={[]} onAdd={add} />,
    );
    await waitFor(() => expect(api.page).toHaveBeenCalledTimes(1));
    view.rerender(
      <PlanDrillPicker key="new" groupId="new" attachedIds={[]} onAdd={add} />,
    );
    await screen.findByRole('option', { name: /First/ });
    await act(async () => resolve(page('Stale')));
    expect(
      screen.queryByRole('option', { name: /Stale/ }),
    ).not.toBeInTheDocument();
    expect(api.page).toHaveBeenLastCalledWith(
      'new',
      undefined,
      expect.objectContaining({
        collection: 'ngcs-starter-v1',
        ageScope: 'TEAM',
      }),
      undefined,
    );
    expect(screen.getByLabelText('Egzersiz ekle')).toHaveValue('');
  });
});
