import {
  CalendarBlank,
  CheckSquare,
  ClipboardText,
  UsersThree,
} from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { getAttendancePlanPage } from '../lib/api';
import { useAssignmentPage } from '../lib/use-assignment-page';
import { Link } from 'react-router';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { useWorkspace } from '../lib/workspace-context';
import { MetricCard } from '../components/presentation/metric-card';
import { PageHero } from '../components/presentation/page-hero';
import dashboardHero from '../assets/dashboard-coach-wide.png';

export function meta() {
  return [{ title: 'Yoklama | NGCS' }];
}

export default function AttendanceRoute() {
  const { group, season, scope, loading, error, reload } = useWorkspace();
  const key = JSON.stringify([
    scope.clubId,
    scope.clubSeasonId,
    scope.teamId,
    group?.id,
    season?.id,
  ]);
  return (
    <div className="page-shell player-operations-reference attendance-reference">
      <PageHero
        className="player-operations-reference__hero attendance-reference__hero"
        image={dashboardHero}
        eyebrow="Katılım takibi"
        title="Yoklama"
        description={`${group?.name ?? 'Takım TBD'} için antrenman bazlı katılım kayıtlarını yönetin.`}
        actions={
          <Button variant="outline" asChild>
            <Link to="/app/trainings">
              <ClipboardText weight="duotone" /> Antrenmanları aç
            </Link>
          </Button>
        }
      />
      {loading ? (
        <div className="loading-grid">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : error ? (
        <Alert role="alert">
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={() => void reload()}>Tekrar dene</Button>
        </Alert>
      ) : !group ? (
        <p>Bu takım için antrenman bağlamı bulunmuyor.</p>
      ) : (
        <AttendanceCatalog key={key} groupId={group.id} seasonId={season?.id} />
      )}
    </div>
  );
}

function AttendanceCatalog({
  groupId,
  seasonId,
}: {
  groupId: string;
  seasonId?: string;
}) {
  const load = useCallback(
    (after?: string) => getAttendancePlanPage(groupId, seasonId, after),
    [groupId, seasonId],
  );
  const state = useAssignmentPage(load);
  const page = state.data;
  const playerCount = page?.summary.playerCount ?? 0;
  return (
    <section
      className="player-operations-reference__directory attendance-reference__directory"
      aria-labelledby="attendance-directory-title"
    >
      {page && (
        <>
          <p className="sr-only" aria-label="Yoklama kapsamı özeti">
            {page.summary.total} plan · {playerCount} güncel oyuncu ·{' '}
            {page.summary.presentAttendance} işaretlenmiş katılım
          </p>
          <div className="player-operations-reference__metrics attendance-reference__metrics">
            <MetricCard
              icon={ClipboardText}
              label="Toplam plan"
              value={page.summary.total}
              detail="Yoklama kapsamındaki planlar"
            />
            <MetricCard
              icon={UsersThree}
              label="Güncel oyuncu"
              value={playerCount}
              detail="Seçili takım kapsamı"
              tone="violet"
            />
            <MetricCard
              icon={CheckSquare}
              label="Katılım kaydı"
              value={page.summary.presentAttendance}
              detail="İşaretlenmiş PRESENT kaydı"
              tone="teal"
            />
          </div>
        </>
      )}
      <header className="player-operations-reference__section-head attendance-reference__head">
        <div>
          <p className="page-kicker">Antrenman planları</p>
          <h2 id="attendance-directory-title">Yoklama Listesi</h2>
        </div>
        {page && <span>{page.summary.total} plan</span>}
      </header>
      {state.loading ? (
        <div role="status" aria-label="Yoklama yükleniyor">
          <Skeleton className="h-40" />
        </div>
      ) : state.error ? (
        <Alert role="alert">
          <AlertDescription>{state.error}</AlertDescription>
          <Button onClick={state.retry}>Tekrar dene</Button>
        </Alert>
      ) : page?.items.length ? (
        <div className="attendance-list">
          {page.items.map((plan) => {
            const present = plan.presentCount;
            return (
              <Card key={plan.id}>
                <CardHeader className="attendance-card-header">
                  <span className="attendance-date">
                    <CalendarBlank />
                    <small>{formatDate(plan.date)}</small>
                  </span>
                  <div>
                    <CardTitle>{plan.title}</CardTitle>
                    <p>{plan.notes || 'Antrenman amacı TBD'}</p>
                  </div>
                  <Badge
                    variant={
                      present === playerCount && playerCount > 0
                        ? 'default'
                        : 'outline'
                    }
                  >
                    {present} katılım kaydı · {playerCount} güncel oyuncu
                  </Badge>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/app/trainings/${plan.id}?tab=attendance`}>
                      <CheckSquare /> Yoklamayı aç
                    </Link>
                  </Button>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      ) : state.pageNumber > 1 ? (
        <p>Bu sayfada plan yok</p>
      ) : (
        <div className="empty-state">
          <UsersThree weight="duotone" />
          <h2>Yoklama bekleyen plan yok</h2>
          <p>Önce bir antrenman planı oluşturun.</p>
          <Button asChild>
            <Link to="/app/trainings">Antrenmanlara git</Link>
          </Button>
        </div>
      )}
      <nav
        aria-label="Yoklama sayfaları"
        className="flex flex-wrap items-center gap-3 py-4"
      >
        <Button
          variant="outline"
          disabled={state.loading || state.pageNumber === 1}
          onClick={state.previous}
        >
          Önceki sayfa
        </Button>
        <p role="status">
          Sayfa {state.pageNumber}
          {page ? ` · ${page.items.length} / ${page.summary.total} plan` : ''}
        </p>
        <Button
          variant="outline"
          disabled={state.loading || !page?.nextCursor}
          onClick={() => {
            if (page?.nextCursor) state.next(page.nextCursor);
          }}
        >
          Sonraki sayfa
        </Button>
      </nav>
    </section>
  );
}

function formatDate(value: string | null) {
  if (!value) return 'Tarih TBD';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
