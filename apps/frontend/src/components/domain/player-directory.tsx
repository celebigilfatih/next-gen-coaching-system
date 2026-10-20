import {
  MagnifyingGlass,
  SlidersHorizontal,
  UsersThree,
} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  getSportingPlayerPage,
  type SportingPlayerPage,
  type SportingPlayerPositionFilter,
  type SportingPlayerSort,
} from '../../lib/api';
import { ResponsivePlayerList, type PlayerListEntry } from './player-list';
import { EmptyState, ErrorState, LoadingState } from '../feedback/data-state';
import { PagePagination } from '../feedback/page-pagination';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { NativeSelect } from '../ui/native-select';

const positionOptions: Array<{
  value: SportingPlayerPositionFilter;
  label: string;
}> = [
  { value: 'KALECI', label: 'Kaleci' },
  { value: 'DEFANS', label: 'Defans' },
  { value: 'ORTA_SAHA', label: 'Orta saha' },
  { value: 'FORVET', label: 'Forvet' },
  { value: 'UNASSIGNED', label: 'Pozisyon belirtilmemiş' },
];

export function PlayerDirectory({
  team,
  clubId,
  title = 'Takım Oyuncuları',
  description = 'Yetkiniz ve seçili takım kapsamıyla sınırlı kayıtlar.',
}: {
  team: { id: string; name: string };
  clubId?: string;
  title?: string;
  description?: string;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const rawPosition = searchParams.get('position');
  const position = positionOptions.some(({ value }) => value === rawPosition)
    ? (rawPosition as SportingPlayerPositionFilter)
    : undefined;
  const sort: SportingPlayerSort =
    searchParams.get('sort') === 'NAME_DESC' ? 'NAME_DESC' : 'NAME_ASC';
  const [cursors, setCursors] = useState<Array<string | undefined>>([
    undefined,
  ]);
  const [retry, setRetry] = useState(0);
  const after = cursors[cursors.length - 1];
  const requestKey = JSON.stringify([
    team.id,
    clubId,
    query.trim(),
    position,
    sort,
    after,
    retry,
  ]);
  const [result, setResult] = useState<{
    key: string;
    data?: SportingPlayerPage;
    error?: string;
  }>();
  const loading = result?.key !== requestKey;
  const error = loading ? '' : result?.error;
  const page = loading ? undefined : result?.data;
  const players = page?.items ?? [];

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(
      () => {
        getSportingPlayerPage({
          teamId: team.id,
          clubId,
          after,
          q: query.trim(),
          position,
          sort,
        })
          .then((value) => {
            if (active) setResult({ key: requestKey, data: value });
          })
          .catch((cause: unknown) => {
            if (active)
              setResult({
                key: requestKey,
                error:
                  cause instanceof Error
                    ? cause.message
                    : 'Oyuncular alınamadı.',
              });
          });
      },
      query ? 250 : 0,
    );
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [team.id, clubId, after, query, position, sort, requestKey]);

  function setFilter(key: 'q' | 'position' | 'sort', value: string) {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
    setCursors([undefined]);
  }

  function clearFilters() {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.delete('q');
      next.delete('position');
      next.delete('sort');
      return next;
    });
    setCursors([undefined]);
  }

  const entries: PlayerListEntry[] = players.map((player) => ({
    id: player.id,
    displayName: player.displayName,
    position: player.playerProfile.primaryPosition,
    preferredFoot: player.playerProfile.preferredFoot,
    assignment: assignmentLabel(player.assignments[0]?.assignmentType),
  }));
  const summary = page?.summary;
  const hasFilters = Boolean(query || position || sort !== 'NAME_ASC');

  return (
    <section
      className="player-operations-reference__directory player-directory"
      aria-labelledby="player-directory-title"
    >
      <header className="player-operations-reference__directory-head player-directory__head">
        <div>
          <p className="page-kicker">Oyuncu dizini</p>
          <h2 id="player-directory-title">{title}</h2>
          <span>{description}</span>
        </div>
        <div className="player-directory__toolbar" role="search">
          <label className="player-operations-reference__search">
            <MagnifyingGlass aria-hidden="true" />
            <Input
              className="sporting-search"
              aria-label="Oyuncu ara"
              placeholder="Oyuncu ara…"
              value={query}
              maxLength={100}
              onChange={(event) => setFilter('q', event.currentTarget.value)}
            />
          </label>
          <NativeSelect
            aria-label="Pozisyona göre filtrele"
            value={position ?? ''}
            onChange={(event) =>
              setFilter('position', event.currentTarget.value)
            }
          >
            <option value="">Tüm pozisyonlar</option>
            {positionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
          <NativeSelect
            aria-label="Oyuncuları sırala"
            value={sort}
            onChange={(event) => setFilter('sort', event.currentTarget.value)}
          >
            <option value="NAME_ASC">Ada göre A–Z</option>
            <option value="NAME_DESC">Ada göre Z–A</option>
          </NativeSelect>
          <Button
            type="button"
            variant="ghost"
            disabled={!hasFilters}
            onClick={clearFilters}
          >
            <SlidersHorizontal aria-hidden="true" /> Filtreleri temizle
          </Button>
        </div>
      </header>

      {summary ? (
        <div className="player-directory__summary" aria-label="Kadro özeti">
          <strong>{summary.total} toplam oyuncu</strong>
          {positionOptions.map((option) => (
            <Badge key={option.value} variant="outline">
              {option.label}: {summary.positions[option.value] ?? 0}
            </Badge>
          ))}
        </div>
      ) : null}

      {error ? (
        <ErrorState
          title="Oyuncular alınamadı"
          message={error}
          onRetry={() => setRetry((value) => value + 1)}
        />
      ) : loading ? (
        <LoadingState
          label="Oyuncular yükleniyor"
          count={4}
          skeletonClassName="h-14"
        />
      ) : players.length ? (
        <ResponsivePlayerList items={entries} />
      ) : (
        <EmptyState
          icon={<UsersThree weight="duotone" />}
          title={
            hasFilters ? 'Filtreyle eşleşen oyuncu yok' : 'Takımda oyuncu yok'
          }
          description={
            hasFilters
              ? 'Arama veya pozisyon filtresini değiştirin.'
              : 'Bu takıma atanmış oyuncular burada görünecek.'
          }
        />
      )}

      <PagePagination
        label="Oyuncu sayfaları"
        previousDisabled={loading || cursors.length === 1}
        onPrevious={() => setCursors((value) => value.slice(0, -1))}
        summary={
          <>
            Sayfa {cursors.length}
            {!loading && !error
              ? ` · ${players.length} / ${page?.total ?? players.length} sonuç`
              : ''}
          </>
        }
        nextDisabled={loading || !page?.nextCursor}
        onNext={() => {
          if (page?.nextCursor)
            setCursors((value) => [...value, page.nextCursor!]);
        }}
      />
    </section>
  );
}

function assignmentLabel(value: string | undefined) {
  if (!value) return 'Aktif oyuncu';
  return (
    {
      LEGACY_MEMBER: 'Mevcut üye',
      PRIMARY_REGISTERED: 'Ana takım',
      TRAINING_GUEST: 'Antrenman misafiri',
      MATCH_ELIGIBLE: 'Maç uygun',
      LOAN_IN: 'Kiralık gelen',
      LOAN_OUT: 'Kiralık giden',
      INTERNATIONAL_DUTY: 'Milli takım',
    }[value] ?? value
  );
}
