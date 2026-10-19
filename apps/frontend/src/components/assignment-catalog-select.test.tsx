import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssignmentCatalogSelect } from './assignment-catalog-select';

const api = vi.hoisted(() => ({ getAssignmentOptions: vi.fn() }));
vi.mock('../lib/api', () => api);
const selected = vi.fn();
const mount = () =>
  render(
    <AssignmentCatalogSelect
      kind="teams"
      clubId="club"
      name="teamId"
      label="Atama takımı"
      onSelect={selected}
    />,
  );
describe('bounded assignment options', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it('keeps the requested page and pinned selection on failure, then retries the same cursor', async () => {
    api.getAssignmentOptions
      .mockResolvedValueOnce({
        items: [{ id: 'a', name: 'Team A' }],
        nextCursor: 'cursor-a',
        limit: 25,
      })
      .mockRejectedValueOnce(new Error('Forbidden'))
      .mockResolvedValueOnce({ items: [], nextCursor: null, limit: 25 });
    mount();
    await screen.findByRole('option', { name: 'Team A' });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'a' } });
    fireEvent.click(
      screen.getByRole('button', { name: 'Sonraki Atama takımı seçenekleri' }),
    );
    await screen.findByText('Forbidden');
    expect(
      within(
        screen.getByRole('group', { name: 'Atama takımı sayfaları' }),
      ).getByText('2'),
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('combobox')).toHaveValue('a');
    expect(
      screen.queryByText('Bu sayfada seçenek yok.'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Önceki Atama takımı seçenekleri' }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Sonraki Atama takımı seçenekleri' }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }));
    await screen.findByText('Bu sayfada seçenek yok.');
    expect(api.getAssignmentOptions.mock.calls[1]).toEqual(
      api.getAssignmentOptions.mock.calls[2],
    );
    expect(api.getAssignmentOptions.mock.calls[2]).toEqual([
      'teams',
      'club',
      'cursor-a',
    ]);
    expect(screen.getByRole('combobox')).toHaveValue('a');
    expect(selected).toHaveBeenCalledExactlyOnceWith('a');
  });
  it('disables both directions while a continuation is pending and replaces only its page options', async () => {
    let resolve!: (value: unknown) => void;
    api.getAssignmentOptions
      .mockResolvedValueOnce({
        items: [{ id: 'a', name: 'Team A' }],
        nextCursor: 'cursor-a',
        limit: 25,
      })
      .mockReturnValueOnce(
        new Promise((done) => {
          resolve = done;
        }),
      );
    mount();
    await screen.findByRole('option', { name: 'Team A' });
    fireEvent.click(
      screen.getByRole('button', { name: 'Sonraki Atama takımı seçenekleri' }),
    );
    await waitFor(() =>
      expect(api.getAssignmentOptions).toHaveBeenCalledTimes(2),
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Seçenekler yükleniyor…',
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Önceki Atama takımı seçenekleri' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Sonraki Atama takımı seçenekleri' }),
    ).toBeDisabled();
    await act(async () =>
      resolve({
        items: [{ id: 'b', name: 'Team B' }],
        nextCursor: null,
        limit: 25,
      }),
    );
    expect(screen.getByRole('option', { name: 'Team B' })).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Team A' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(selected).not.toHaveBeenCalled();
  });
  it('replaces pages, pins the selected option and never implicitly selects a different team', async () => {
    api.getAssignmentOptions.mockImplementation(
      async (_kind, _club, after) => ({
        items: after
          ? [{ id: 'b', name: 'Team B' }]
          : [{ id: 'a', name: 'Team A' }],
        nextCursor: after ? null : 'a',
        limit: 25,
      }),
    );
    mount();
    await screen.findByRole('option', { name: 'Team A' });
    expect(selected).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole('button', { name: 'Sonraki Atama takımı seçenekleri' }),
    );
    await screen.findByRole('option', { name: 'Team B' });
    expect(
      screen.queryByRole('option', { name: 'Team A' }),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'b' } });
    fireEvent.click(
      screen.getByRole('button', { name: 'Önceki Atama takımı seçenekleri' }),
    );
    await screen.findByRole('option', { name: 'Team A' });
    expect(screen.getByRole('combobox')).toHaveValue('b');
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(selected).toHaveBeenCalledTimes(1);
    expect(selected).toHaveBeenLastCalledWith('b');
    expect(api.getAssignmentOptions).toHaveBeenCalledWith('teams', 'club', 'a');
  });
  it('disables failed options, supports retry and shows an empty page explicitly', async () => {
    api.getAssignmentOptions
      .mockRejectedValueOnce(new Error('Geçici hata'))
      .mockResolvedValue({ items: [], nextCursor: null, limit: 25 });
    mount();
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(await screen.findByRole('alert')).toHaveTextContent('Geçici hata');
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }));
    await screen.findByText('Bu sayfada seçenek yok.');
    expect(
      screen.getByRole('button', { name: 'Sonraki Atama takımı seçenekleri' }),
    ).toBeDisabled();
    expect(selected).not.toHaveBeenCalled();
  });
  it('starts a newly opened dialog without a prior selection', async () => {
    api.getAssignmentOptions.mockResolvedValue({
      items: [{ id: 'a', name: 'Team A' }],
      nextCursor: null,
      limit: 25,
    });
    const view = mount();
    await screen.findByRole('option', { name: 'Team A' });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'a' } });
    view.unmount();
    mount();
    await waitFor(() =>
      expect(screen.getByRole('combobox')).not.toBeDisabled(),
    );
    expect(screen.getByRole('combobox')).toHaveValue('');
  });
});
