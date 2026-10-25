import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { MatchScheduleDialog } from './match-schedule-dialog';
const update = vi.hoisted(() => vi.fn());
vi.mock('../lib/api', () => ({ updateMatch: update }));
beforeEach(() => vi.resetAllMocks());
function setup(saved = vi.fn()) {
  const view = render(
    <MatchScheduleDialog
      matchId="m"
      date="2026-10-25T13:00:00.000Z"
      onSaved={saved}
    />,
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Tarih ve saati düzenle' }),
  );
  return { ...view, saved };
}
it('sends only the explicit Turkish date, blocks duplicate saves and displays protected results', async () => {
  let finish!: (value: unknown) => void;
  update.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const { saved } = setup();
  fireEvent.change(screen.getByLabelText('Yeni tarih ve başlama saati'), {
    target: { value: '2026-10-25T18:00' },
  });
  const button = screen.getByRole('button', {
    name: 'Tarihi ve programı güncelle',
  });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(update).toHaveBeenCalledExactlyOnceWith('m', {
    date: '2026-10-25T15:00:00.000Z',
  });
  await act(async () =>
    finish({
      date: '2026-10-25T15:00:00.000Z',
      planningSync: {
        status: 'updated',
        updated: 2,
        created: 0,
        retired: 0,
        protected: 1,
      },
    }),
  );
  expect(saved).toHaveBeenCalledWith('2026-10-25T15:00:00.000Z');
  expect(screen.getByRole('status')).toHaveTextContent(
    '2 etkinlik güncellendi',
  );
  expect(screen.getByRole('status')).toHaveTextContent('1 elle düzenlenen');
});
it('retains entered date and server conflict reason without updating the displayed match', async () => {
  update.mockRejectedValue(new Error('Elle düzenlenmiş kayıtla çakışıyor'));
  const { saved } = setup();
  fireEvent.change(screen.getByLabelText('Yeni tarih ve başlama saati'), {
    target: { value: '2026-10-24T18:00' },
  });
  fireEvent.click(
    screen.getByRole('button', { name: 'Tarihi ve programı güncelle' }),
  );
  await screen.findByRole('alert');
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Elle düzenlenmiş kayıtla çakışıyor',
  );
  expect(screen.getByLabelText('Yeni tarih ve başlama saati')).toHaveValue(
    '2026-10-24T18:00',
  );
  expect(saved).not.toHaveBeenCalled();
});
it('ignores a response after scope unmount and cancel performs no write', async () => {
  let finish!: (value: unknown) => void;
  update.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const view = setup();
  fireEvent.click(screen.getByRole('button', { name: 'Vazgeç' }));
  expect(update).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole('button', { name: 'Tarih ve saati düzenle' }),
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Tarihi ve programı güncelle' }),
  );
  await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
  view.unmount();
  await act(async () => finish({ date: '2026-10-25T13:00:00.000Z' }));
  expect(view.saved).not.toHaveBeenCalled();
});
