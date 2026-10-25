import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CatalogControls } from './catalog-controls';

const mocks = vi.hoisted(() => ({
  pageCatalog: vi.fn(),
  scope: { clubId: 'club', clubSeasonId: 'season', teamId: 'team' },
  catalogs: {
    clubs: { nextCursor: 'next' as string | null },
    seasons: { nextCursor: 'next' as string | null },
    teams: { nextCursor: 'next' as string | null },
  },
  loading: false,
  catalogLoading: null as string | null,
  catalogRevision: 0,
}));
vi.mock('../lib/workspace-context', () => ({ useWorkspace: () => mocks }));
const view = () => <CatalogControls kind="teams" label="Takım" />;
const next = () =>
  screen.getByRole('button', { name: 'Sonraki takım seçenekleri' });
const previous = () =>
  screen.getByRole('button', { name: 'Önceki takım seçenekleri' });
const counter = (value: string) =>
  within(
    screen.getByRole('group', { name: 'Takım seçenek sayfaları' }),
  ).getByText(value);

describe('workspace catalog pagination presentation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.scope = { clubId: 'club', clubSeasonId: 'season', teamId: 'team' };
    mocks.catalogs = {
      clubs: { nextCursor: 'next' },
      seasons: { nextCursor: 'next' },
      teams: { nextCursor: 'next' },
    };
    mocks.loading = false;
    mocks.catalogLoading = null;
    mocks.catalogRevision = 0;
  });

  it('keeps first single-page controls hidden', () => {
    mocks.catalogs.teams.nextCursor = null;
    render(view());
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    expect(mocks.pageCatalog).not.toHaveBeenCalled();
  });

  it.each([
    ['clubs', 'Kulüp', 'kulüp'],
    ['seasons', 'Sezon', 'sezon'],
    ['teams', 'Takım', 'takım'],
  ] as const)(
    'retains %s labels and kind dispatch',
    async (kind, label, lower) => {
      mocks.pageCatalog.mockResolvedValue(true);
      render(<CatalogControls kind={kind} label={label} />);
      expect(
        screen.getByRole('button', { name: `Önceki ${lower} seçenekleri` }),
      ).toBeDisabled();
      await act(async () =>
        fireEvent.click(
          screen.getByRole('button', { name: `Sonraki ${lower} seçenekleri` }),
        ),
      );
      expect(mocks.pageCatalog).toHaveBeenCalledExactlyOnceWith(kind, 'next');
      expect(
        within(
          screen.getByRole('group', { name: `${label} seçenek sayfaları` }),
        ).getByText('2'),
      ).toHaveAttribute('aria-live', 'polite');
    },
  );

  it('commits only on success, honors provider busy and keeps last-page previous access', async () => {
    let resolve!: (ok: boolean) => void;
    mocks.pageCatalog
      .mockReturnValueOnce(
        new Promise<boolean>((done) => {
          resolve = done;
        }),
      )
      .mockResolvedValue(true);
    const rendered = render(view());
    fireEvent.click(next());
    expect(counter('1')).toBeInTheDocument();
    mocks.catalogLoading = 'teams';
    rendered.rerender(view());
    expect(previous()).toBeDisabled();
    expect(next()).toBeDisabled();
    await act(async () => resolve(true));
    mocks.catalogLoading = null;
    mocks.catalogs.teams.nextCursor = null;
    rendered.rerender(view());
    expect(counter('2')).toBeInTheDocument();
    expect(previous()).toBeEnabled();
    expect(next()).toBeDisabled();
    await act(async () => fireEvent.click(previous()));
    expect(mocks.pageCatalog).toHaveBeenLastCalledWith('teams', undefined);
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
  });

  it('retries failed forward/backward movement without changing the displayed page', async () => {
    mocks.pageCatalog
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    render(view());
    await act(async () => fireEvent.click(next()));
    expect(counter('1')).toBeInTheDocument();
    await act(async () => fireEvent.click(next()));
    expect(counter('2')).toBeInTheDocument();
    expect(mocks.pageCatalog.mock.calls[0]).toEqual(
      mocks.pageCatalog.mock.calls[1],
    );
    await act(async () => fireEvent.click(previous()));
    expect(counter('2')).toBeInTheDocument();
    await act(async () => fireEvent.click(previous()));
    expect(counter('1')).toBeInTheDocument();
    expect(mocks.pageCatalog.mock.calls[2]).toEqual(
      mocks.pageCatalog.mock.calls[3],
    );
  });

  it.each(['clubId', 'clubSeasonId', 'teamId', 'revision'] as const)(
    'resets for %s and ignores old pending control completion',
    async (key) => {
      let resolve!: (ok: boolean) => void;
      mocks.pageCatalog.mockResolvedValueOnce(true).mockReturnValueOnce(
        new Promise<boolean>((done) => {
          resolve = done;
        }),
      );
      const rendered = render(view());
      await act(async () => fireEvent.click(next()));
      expect(counter('2')).toBeInTheDocument();
      fireEvent.click(next());
      if (key === 'revision') mocks.catalogRevision++;
      else mocks.scope = { ...mocks.scope, [key]: 'new' };
      rendered.rerender(view());
      expect(counter('1')).toBeInTheDocument();
      await act(async () => resolve(true));
      expect(counter('1')).toBeInTheDocument();
      expect(previous()).toBeDisabled();
    },
  );

  it('disables movement during workspace or any other catalog load', () => {
    mocks.loading = true;
    const rendered = render(view());
    expect(next()).toBeDisabled();
    mocks.loading = false;
    mocks.catalogLoading = 'seasons';
    rendered.rerender(view());
    expect(next()).toBeDisabled();
    fireEvent.click(next());
    expect(mocks.pageCatalog).not.toHaveBeenCalled();
  });
});
