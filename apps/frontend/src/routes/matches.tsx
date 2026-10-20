import {
  ArrowCounterClockwise,
  CalendarBlank,
  SoccerBall,
} from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { EmptyState, ErrorState } from '../components/feedback/data-state';
import { PagePagination } from '../components/feedback/page-pagination';
import { MatchDayGroup } from '../components/presentation/match-day-group';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import {
  getMatchDayPage,
  getMatchPage,
  type MatchCatalogItem,
} from '../lib/api';
import { useAssignmentPage } from '../lib/use-assignment-page';
import { toLocalDateKey } from '../lib/week';
import { useWorkspace } from '../lib/workspace-context';

export function meta() {
  return [{ title: 'Maçlar | NGCS' }];
}

export function matchDayBounds(value: string) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!parts) return null;
  const year = Number(parts[1]);
  const month = Number(parts[2]) - 1;
  const day = Number(parts[3]);
  const from = new Date(year, month, day);
  if (
    from.getFullYear() !== year ||
    from.getMonth() !== month ||
    from.getDate() !== day
  ) {
    return null;
  }
  const until = new Date(year, month, day + 1);
  return { from: from.toISOString(), until: until.toISOString() };
}

export function groupMatchesByLocalDay(items: MatchCatalogItem[]) {
  const groups = new Map<string, MatchCatalogItem[]>();
  for (const match of items) {
    const key = toLocalDateKey(new Date(match.date));
    groups.set(key, [...(groups.get(key) ?? []), match]);
  }
  return [...groups.entries()].map(([dateKey, matches]) => ({
    dateKey,
    matches,
  }));
}

export default function MatchesRoute() {
  const { group, season, scope, loading, error, reload } = useWorkspace();
  const [dateFilter, setDateFilter] = useState('');
  const allSeasons = scope.clubSeasonId === '*';
  const key = JSON.stringify([
    scope.clubId,
    scope.clubSeasonId,
    scope.teamId,
    group?.id,
    season?.id,
    dateFilter,
  ]);

  return (
    <div className="page-shell matches-reference">
      <header className="matches-reference__heading">
        <h1>Maç Takvimi</h1>
        <p>
          Kapsamdaki maçları, hazırlık notlarını ve taktik tahta durumunu
          yönetin.
        </p>
      </header>
      {loading ? (
        <div
          role="status"
          aria-label="Maç kapsamı yükleniyor"
          className="matches-reference__loading"
        >
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      ) : error ? (
        <ErrorState
          title="Maçlar alınamadı"
          message={error}
          onRetry={() => void reload()}
        />
      ) : !group || (!allSeasons && !season) ? (
        <EmptyState
          icon={<SoccerBall weight="duotone" />}
          title="Maç bağlamı bulunmuyor"
          description="Bu takım ve sezon için doğrulanmış maç bağlamı yok."
        />
      ) : (
        <section
          className="matches-reference__catalog"
          aria-labelledby="match-list-title"
        >
          <header className="matches-reference__catalog-head">
            <div>
              <h2 id="match-list-title">
                {dateFilter ? 'Seçili Günün Maçları' : 'Kapsamdaki Maçlar'}
              </h2>
            </div>
            <div
              className="matches-reference__filter"
              role="group"
              aria-label="Tarih filtresi"
            >
              <label className="sr-only" htmlFor="match-date-filter">
                Maç tarihi
              </label>
              <Input
                id="match-date-filter"
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                disabled={!dateFilter}
                onClick={() => setDateFilter('')}
              >
                <ArrowCounterClockwise aria-hidden="true" />
                Tüm maçları göster
              </Button>
            </div>
          </header>
          <MatchCatalog
            key={key}
            groupId={group.id}
            seasonId={allSeasons ? undefined : season?.id}
            teamName={group.name}
            dateFilter={dateFilter}
          />
        </section>
      )}
    </div>
  );
}

function MatchCatalog({
  groupId,
  seasonId,
  teamName,
  dateFilter,
}: {
  groupId: string;
  seasonId?: string;
  teamName: string;
  dateFilter: string;
}) {
  const bounds = dateFilter ? matchDayBounds(dateFilter) : null;
  const from = bounds?.from;
  const until = bounds?.until;
  const load = useCallback(
    (after?: string) =>
      from && until
        ? getMatchDayPage(groupId, seasonId, from, until, after)
        : getMatchPage(groupId, seasonId, after),
    [from, groupId, seasonId, until],
  );
  const state = useAssignmentPage(load);
  const page = state.data;
  const groups = groupMatchesByLocalDay(page?.items ?? []);

  return (
    <>
      {page && (
        <span
          className="matches-reference__total"
          aria-label="Maç kapsamı özeti"
        >
          {page.total} maç
        </span>
      )}

      {state.loading ? (
        <div
          role="status"
          aria-label="Maçlar yükleniyor"
          className="matches-reference__loading"
        >
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : state.error ? (
        <ErrorState
          title="Maçlar alınamadı"
          message={state.error}
          onRetry={state.retry}
        />
      ) : groups.length ? (
        <table className="matches-reference__table">
          <caption className="sr-only">
            Kapsamdaki maçların tarih, saat, karşılaşma, saha ve hazırlık
            bilgileri
          </caption>
          <colgroup>
            <col className="matches-reference__date-col" />
            <col className="matches-reference__time-col" />
            <col />
            <col className="matches-reference__venue-col" />
            <col className="matches-reference__preparation-col" />
            <col className="matches-reference__action-col" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Tarih</th>
              <th scope="col">Saat</th>
              <th scope="col">Karşılaşma</th>
              <th scope="col">Saha</th>
              <th scope="col">Hazırlık</th>
              <th scope="col">
                <span className="sr-only">Maç detayı</span>
              </th>
            </tr>
          </thead>
          {groups.map((group) => (
            <MatchDayGroup
              key={group.dateKey}
              dateKey={group.dateKey}
              matches={group.matches}
              teamName={teamName}
            />
          ))}
        </table>
      ) : state.pageNumber > 1 ? (
        <p className="matches-reference__continuation-empty">
          Bu sayfada maç yok. Önceki sayfaya dönebilirsiniz.
        </p>
      ) : (
        <EmptyState
          icon={<CalendarBlank weight="duotone" />}
          title={dateFilter ? 'Bu tarihte maç yok' : 'Planlanmış maç yok'}
          description={
            dateFilter
              ? 'Tüm maçlara dönmek için tarih filtresini temizleyin.'
              : 'Sezon maçları oluşturulduğunda analiz çalışma alanı burada açılır.'
          }
        />
      )}

      <PagePagination
        label="Maç sayfaları"
        previousDisabled={state.loading || state.pageNumber === 1}
        onPrevious={state.previous}
        summary={
          <>
            Sayfa {state.pageNumber}
            {page ? ` · ${page.items.length} / ${page.total} maç` : ''}
          </>
        }
        nextDisabled={state.loading || !page?.nextCursor}
        onNext={() => {
          if (page?.nextCursor) state.next(page.nextCursor);
        }}
      />
    </>
  );
}
