import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BoardRoster } from './board-roster';
import { getSportingPlayerPage, type SportingPlayerPage } from '../../lib/api';

vi.mock('../../lib/api', () => ({ getSportingPlayerPage: vi.fn() }));
afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});
const source = { teamId: 'team-a', clubId: 'club-a', name: 'A Takım' };
const page = (
  name: string,
  nextCursor: string | null = null,
): SportingPlayerPage => ({
  items: [
    {
      id: name,
      displayName: name,
      clubId: 'club-a',
      birthDate: null,
      playerProfile: {
        primaryPosition: 'KALECI',
        secondaryPositions: [],
        preferredFoot: null,
      },
      assignments: [],
    },
  ],
  total: 1,
  limit: 25,
  nextCursor,
  summary: {
    total: 1,
    positions: { KALECI: 1, DEFANS: 0, ORTA_SAHA: 0, FORVET: 0, UNASSIGNED: 0 },
  },
});
describe('board roster picker', () => {
  it('requires a slot and confirmation, focuses cancel and rejects a changed target', async () => {
    vi.mocked(getSportingPlayerPage).mockResolvedValue(page('Deniz'));
    const assign = vi.fn();
    const slot = {
      id: 'slot',
      type: 'player' as const,
      x: 100,
      y: 100,
      name: 'Eski ad',
      number: '8',
    };
    const props = {
      source,
      disabled: false,
      addDisabled: true,
      onChoose: vi.fn(),
      assignment: { slots: [slot], onSelect: vi.fn(), onAssign: assign },
    };
    const view = render(<BoardRoster {...props} />);
    expect(await screen.findByRole('button', { name: /Deniz/ })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Kadro işlemi'), {
      target: { value: 'assign' },
    });
    expect(screen.getByRole('button', { name: /Deniz/ })).toBeDisabled();
    view.rerender(
      <BoardRoster
        {...props}
        assignment={{ ...props.assignment, selectedId: 'slot' }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Deniz/ }));
    expect(screen.getByRole('button', { name: 'İptal' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'İptal' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Deniz/ })).toHaveFocus(),
    );
    expect(assign).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Deniz/ }));
    view.rerender(
      <BoardRoster
        {...props}
        assignment={{
          ...props.assignment,
          selectedId: 'slot',
          slots: [{ ...slot, name: 'Değişti' }],
        }}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Seçilen yer değişti');
    expect(screen.getByRole('button', { name: 'Oyuncuyu ata' })).toBeDisabled();
    expect(assign).not.toHaveBeenCalled();
  });

  it('assigns at the element limit but disables confirmation while saving', async () => {
    vi.mocked(getSportingPlayerPage).mockResolvedValue(page('Deniz'));
    const assign = vi.fn();
    const slot = { id: 'slot', type: 'goalkeeper' as const, x: 100, y: 100 };
    const props = {
      source,
      disabled: false,
      addDisabled: true,
      onChoose: vi.fn(),
      assignment: {
        slots: [slot],
        selectedId: 'slot',
        onSelect: vi.fn(),
        onAssign: assign,
      },
    };
    const view = render(<BoardRoster {...props} />);
    await screen.findByRole('button', { name: /Deniz/ });
    fireEvent.change(screen.getByLabelText('Kadro işlemi'), {
      target: { value: 'assign' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Deniz/ }));
    view.rerender(<BoardRoster {...props} disabled />);
    expect(screen.getByRole('button', { name: 'Oyuncuyu ata' })).toBeDisabled();
    view.rerender(<BoardRoster {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Oyuncuyu ata' }));
    expect(assign).toHaveBeenCalledExactlyOnceWith(slot, 'Deniz');
    expect(props.onChoose).not.toHaveBeenCalled();
  });

  it('reads only the supplied scope and returns a name snapshot without a Person id', async () => {
    vi.mocked(getSportingPlayerPage).mockResolvedValue(page('Deniz Kaya'));
    const choose = vi.fn();
    render(<BoardRoster source={source} disabled={false} onChoose={choose} />);
    fireEvent.click(await screen.findByRole('button', { name: /Deniz Kaya/ }));
    expect(choose).toHaveBeenCalledWith('Deniz Kaya', true);
    expect(getSportingPlayerPage).toHaveBeenCalledWith({
      clubId: 'club-a',
      teamId: 'team-a',
      q: '',
      after: undefined,
      sort: 'NAME_ASC',
    });
  });
  it('keeps failed/unauthorized reads empty and supports retry', async () => {
    vi.mocked(getSportingPlayerPage)
      .mockRejectedValueOnce(new Error('403'))
      .mockResolvedValue(page('Deniz'));
    render(<BoardRoster source={source} disabled onChoose={vi.fn()} />);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'erişim yetkiniz yok',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Yeniden dene' }));
    expect(await screen.findByRole('button', { name: /Deniz/ })).toBeDisabled();
  });
  it('ignores late results after scope change', async () => {
    let resolve!: (value: SportingPlayerPage) => void;
    vi.mocked(getSportingPlayerPage)
      .mockReturnValueOnce(
        new Promise((done) => {
          resolve = done;
        }),
      )
      .mockResolvedValue(page('Yeni Takım Oyuncusu'));
    const view = render(
      <BoardRoster source={source} disabled={false} onChoose={vi.fn()} />,
    );
    view.rerender(
      <BoardRoster
        source={{ ...source, teamId: 'team-b' }}
        disabled={false}
        onChoose={vi.fn()}
      />,
    );
    await screen.findByRole('button', { name: /Yeni Takım/ });
    await act(async () => resolve(page('Eski Oyuncu')));
    expect(screen.queryByText(/Eski Oyuncu/)).not.toBeInTheDocument();
  });
  it('debounces search and resets the page cursor', async () => {
    vi.mocked(getSportingPlayerPage).mockResolvedValue(
      page('Deniz', 'cursor-2'),
    );
    render(<BoardRoster source={source} disabled={false} onChoose={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Sonraki' }));
    await waitFor(() =>
      expect(getSportingPlayerPage).toHaveBeenLastCalledWith(
        expect.objectContaining({ after: 'cursor-2' }),
      ),
    );
    vi.useFakeTimers();
    fireEvent.change(screen.getByLabelText('Kadroda oyuncu ara'), {
      target: { value: 'Ada' },
    });
    expect(
      screen.queryByRole('button', { name: /Deniz/ }),
    ).not.toBeInTheDocument();
    await act(async () => vi.advanceTimersByTime(250));
    expect(getSportingPlayerPage).toHaveBeenLastCalledWith(
      expect.objectContaining({ q: 'Ada', after: undefined }),
    );
  });
});
