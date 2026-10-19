import {
  ArrowRight,
  Books,
  CalendarBlank,
  CheckCircle,
  ClipboardText,
  Clock,
  SoccerBall,
  Strategy,
  UsersThree,
} from '@phosphor-icons/react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { PageContainer } from '../components/layout/page-layout';
import { MetricCard } from '../components/presentation/metric-card';
import { PageHero } from '../components/presentation/page-hero';
import { SectionCard } from '../components/presentation/section-card';
import { PagePagination } from '../components/feedback/page-pagination';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import {
  getDrillOverview,
  getTrainingOverview,
  getTrainingDayPage,
  getMatchOverview,
  getPlayerMemberPage,
} from '../lib/api';
import { useAssignmentPage } from '../lib/use-assignment-page';
import { getSession } from '../lib/session';
import { useWorkspace } from '../lib/workspace-context';
import dashboardHero from '../assets/dashboard-coach-wide.png';
import footballBanner from '../assets/dashboard-football-banner.png';

export function meta() {
  return [{ title: 'Ana Sayfa | NGCS' }];
}

// Construct local midnights rather than assuming that every day is 24 hours.
export function dashboardDayBounds(now: Date) {
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const until = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return { from: from.toISOString(), until: until.toISOString() };
}

export default function DashboardRoute() {
  const { group, season, scope, loading, error, reload } = useWorkspace();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const scopeKey = JSON.stringify([
    scope.clubId,
    scope.clubSeasonId,
    scope.teamId,
    group?.id,
    season?.id,
  ]);
  return (
    <PageContainer className="dashboard-page dashboard-reference">
      <div className="dashboard-photo" aria-hidden="true">
        <img src={dashboardHero} alt="" />
      </div>
      <PageHero
        className="dashboard-hero"
        eyebrow={new Intl.DateTimeFormat('tr-TR', { dateStyle: 'full' }).format(
          now,
        )}
        title={
          greeting(now) +
          ', ' +
          (getSession()?.user.role === 'PLAYER' ? 'Oyuncu' : 'Koç')
        }
        description="Doğru çalışma, gelişimi getirir. Bugün sahada fark yaratma zamanı."
      />
      {loading ? (
        <div
          className="dashboard-stat-grid"
          role="status"
          aria-label="Genel bakış yükleniyor"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton className="h-28" key={index} />
          ))}
        </div>
      ) : error ? (
        <ReadError error={error} retry={() => void reload()} />
      ) : !group ? (
        <p className="dashboard-empty">
          Bu takım için legacy antrenman bağlamı bulunmuyor.
        </p>
      ) : (
        <DashboardContent
          key={scopeKey}
          groupId={group.id}
          seasonId={season?.id}
          now={now}
        />
      )}
    </PageContainer>
  );
}

function DashboardContent({
  groupId,
  seasonId,
  now,
}: {
  groupId: string;
  seasonId?: string;
  now: Date;
}) {
  const { scope } = useWorkspace();
  const canReadMembers = getSession()?.user.role !== 'PLAYER';
  const loadPlayers = useCallback(
    () =>
      canReadMembers
        ? getPlayerMemberPage(groupId, undefined, 1)
        : Promise.resolve(undefined),
    [groupId, canReadMembers],
  );
  const playerOverview = useAssignmentPage(loadPlayers);
  const load = useCallback(
    () => getTrainingOverview(groupId, seasonId),
    [groupId, seasonId],
  );
  const overview = useAssignmentPage(load);
  const loadDrills = useCallback(() => getDrillOverview(groupId), [groupId]);
  const drillOverview = useAssignmentPage(loadDrills);
  const canReadMatches = Boolean(seasonId || scope.clubSeasonId === '*');
  const loadMatches = useCallback(
    () =>
      canReadMatches
        ? getMatchOverview(groupId, seasonId)
        : Promise.resolve(undefined),
    [canReadMatches, groupId, seasonId],
  );
  const matchOverview = useAssignmentPage(loadMatches);
  const summary = overview.data?.summary;
  const recentPlans = overview.data?.items ?? [];
  const latest = recentPlans[0];
  const day = dashboardDayBounds(now);
  return (
    <>
      <div className="dashboard-stat-grid">
        <MetricCard
          icon={UsersThree}
          label="Toplam oyuncu"
          ariaLabel="Oyuncu özeti"
          value={playerOverview.data?.total ?? '—'}
          detail="Seçili takım kadrosu"
        />
        <MetricCard
          icon={ClipboardText}
          label="Toplam antrenman"
          ariaLabel="Antrenman özeti"
          value={summary?.total ?? '—'}
          detail="Seçili kapsamda"
          tone="teal"
        />
        <MetricCard
          icon={Clock}
          label="Antrenman süresi"
          value={
            summary ? (
              <>
                {summary.totalDuration}
                <span className="metric-unit"> dk</span>
              </>
            ) : (
              '—'
            )
          }
          detail="Tüm planların toplamı"
          tone="amber"
        />
        <MetricCard
          icon={Books}
          label="Erişilebilir egzersiz"
          ariaLabel="Egzersiz özeti"
          value={drillOverview.data?.total ?? '—'}
          detail="Egzersiz kütüphanesi"
          tone="violet"
        />
        <MetricCard
          icon={CheckCircle}
          label="Kaydedilmiş katılım"
          ariaLabel="Katılım özeti"
          value={summary?.presentAttendance ?? '—'}
          detail="Katıldı işaretli kayıtlar"
        />
        <MetricCard
          icon={SoccerBall}
          label="Kapsamdaki maç"
          value={matchOverview.data?.total ?? '—'}
          detail="Seçili takım ve sezon"
          tone="amber"
        />
      </div>
      {!canReadMembers ? (
        <p className="dashboard-resource-note">
          Bu rol için üye listesi erişimi bulunmuyor.
        </p>
      ) : playerOverview.loading ? (
        <p role="status" aria-label="Oyuncu özeti yükleniyor">
          Oyuncu özeti yükleniyor.
        </p>
      ) : playerOverview.error ? (
        <ReadError
          error={playerOverview.error}
          retry={playerOverview.retry}
          label="Oyuncu sayısını tekrar yükle"
        />
      ) : null}
      {drillOverview.loading ? (
        <p role="status" aria-label="Egzersiz özeti yükleniyor">
          Egzersiz özeti yükleniyor.
        </p>
      ) : drillOverview.error ? (
        <ReadError
          error={drillOverview.error}
          retry={drillOverview.retry}
          label="Egzersizleri tekrar dene"
          ariaLabel="Egzersiz özeti hatası"
        />
      ) : null}
      <div className="dashboard-grid">
        <SectionCard
          title="Bugünün Programı"
          className="dashboard-today-card"
          action={<MoreLink to="/app/week">Tüm takvimi gör</MoreLink>}
          contentClassName="dashboard-panel-body"
        >
          <TodayTrainings
            key={day.from}
            groupId={groupId}
            seasonId={seasonId}
            from={day.from}
            until={day.until}
          />
        </SectionCard>
        <SectionCard
          title="Son Antrenman Kaydı"
          className="dashboard-latest-card"
          action={<MoreLink to="/app/trainings">Tüm planlar</MoreLink>}
          contentClassName="dashboard-panel-body"
        >
          {latest ? (
            <div className="dashboard-spotlight">
              <p className="dashboard-kicker">{formatDate(latest.date)}</p>
              <div className="dashboard-spotlight-icon">
                <ClipboardText weight="duotone" />
              </div>
              <h2>{latest.title}</h2>
              <div className="dashboard-record-facts">
                <span>
                  <Clock /> {latest.totalDuration} dakika
                </span>
                <span>
                  <Strategy /> {latest.phaseCount} aşama
                </span>
              </div>
              <Button asChild variant="outline">
                <Link to={'/app/trainings/' + latest.id}>
                  Antrenman detayları <ArrowRight />
                </Link>
              </Button>
            </div>
          ) : (
            <PanelPlaceholder
              loading={overview.loading}
              text={
                overview.error
                  ? 'Antrenman özeti alınamadı. Son antrenmanlar panelinden yeniden deneyin.'
                  : 'Son antrenman kaydı bulunmuyor.'
              }
            />
          )}
        </SectionCard>
        <SectionCard
          title="Kapsamdaki Maçlar"
          className="dashboard-match-card"
          action={<MoreLink to="/app/matches">Tüm maçlar</MoreLink>}
        >
          {!canReadMatches ? (
            <p className="dashboard-empty">
              Bu takım ve sezon için maç bağlamı bulunmuyor.
            </p>
          ) : (
            <MatchOverview overview={matchOverview} />
          )}
        </SectionCard>
        <SectionCard
          title="Son Antrenmanlar"
          className="dashboard-recent-card"
          action={<MoreLink to="/app/trainings">Tümü</MoreLink>}
        >
          {overview.loading ? (
            <div role="status" aria-label="Antrenman özeti yükleniyor">
              <Skeleton className="h-40" />
            </div>
          ) : overview.error ? (
            <ReadError error={overview.error} retry={overview.retry} />
          ) : recentPlans.length ? (
            recentPlans.map((plan) => (
              <Link to={'/app/trainings/' + plan.id} key={plan.id}>
                <span className="dashboard-list-icon">
                  <CalendarBlank />
                </span>
                <span>
                  <strong>{plan.title}</strong>
                  <small>
                    {formatDate(plan.date)} · {plan.totalDuration} dk
                  </small>
                </span>
                <Badge variant="outline">{plan.phaseCount} faz</Badge>
              </Link>
            ))
          ) : (
            <p className="dashboard-empty">Henüz antrenman planı yok.</p>
          )}
        </SectionCard>
        <SectionCard
          title="Planlama Durumu"
          className="dashboard-planning-card"
          action={<MoreLink to="/app/trainings">Detaylar</MoreLink>}
          contentClassName="dashboard-panel-body"
        >
          {summary ? (
            <div className="dashboard-planning">
              <div className="dashboard-plan-total">
                <strong>{summary.total}</strong>
                <span>Antrenman planı</span>
              </div>
              <PlanDistribution
                label="Tarihli plan"
                value={summary.scheduled}
                total={summary.total}
              />
              <PlanDistribution
                label="Tarihsiz plan"
                value={summary.undated}
                total={summary.total}
              />
              <p>Seçili kapsamdaki tüm planların tarih dağılımı.</p>
            </div>
          ) : (
            <PanelPlaceholder
              loading={overview.loading}
              text="Planlama dağılımı henüz alınamadı."
            />
          )}
        </SectionCard>
        <div className="dashboard-quick-column">
          <SectionCard
            title="Hızlı Erişim"
            contentClassName="dashboard-quick-links"
          >
            {[
              {
                to: 'trainings',
                label: 'Antrenmanları planla',
                icon: ClipboardText,
              },
              {
                to: 'attendance',
                label: 'Yoklamayı takip et',
                icon: CheckCircle,
              },
              {
                to: 'library',
                label: 'Egzersiz kütüphanesini aç',
                icon: Books,
              },
              { to: 'tactics', label: 'Taktik tahtasına geç', icon: Strategy },
            ].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={'/app/' + to}>
                <Icon />
                <span>{label}</span>
                <ArrowRight />
              </Link>
            ))}
          </SectionCard>
          <aside className="dashboard-football-banner">
            <img src={footballBanner} alt="" />
            <div>
              <strong>
                DAHA FAZLASI
                <br />
                MÜMKÜN
              </strong>
              <p>
                Gelişim bir süreçtir.
                <br />
                Her antrenmanda bir adım ileri.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function TodayTrainings({
  groupId,
  seasonId,
  from,
  until,
}: {
  groupId: string;
  seasonId?: string;
  from: string;
  until: string;
}) {
  const load = useCallback(
    (after?: string) =>
      getTrainingDayPage(groupId, seasonId, from, until, after),
    [groupId, seasonId, from, until],
  );
  const page = useAssignmentPage(load);
  if (page.loading)
    return (
      <div role="status" aria-label="Günlük program yükleniyor">
        <Skeleton className="h-44" />
      </div>
    );
  if (page.error)
    return (
      <ReadError
        error={page.error}
        retry={page.retry}
        label="Günlük programı tekrar dene"
      />
    );
  const plans = page.data?.items ?? [];
  return (
    <>
      <div className="dashboard-timeline" aria-label="Bugünün antrenmanları">
        {plans.length ? (
          plans.map((plan) => (
            <Link to={'/app/trainings/' + plan.id} key={plan.id}>
              <time dateTime={plan.date ?? undefined}>
                {plan.date
                  ? new Intl.DateTimeFormat('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(plan.date))
                  : '—'}
              </time>
              <span className="dashboard-list-icon">
                <ClipboardText />
              </span>
              <span>
                <strong>{plan.title}</strong>
                <small>
                  {plan.totalDuration} dk · {plan.phaseCount} faz
                </small>
              </span>
              <ArrowRight />
            </Link>
          ))
        ) : (
          <p className="dashboard-empty">
            Bugün için planlanmış antrenman yok.
          </p>
        )}
      </div>
      {(page.pageNumber > 1 || page.data?.nextCursor) && (
        <PagePagination
          label="Günlük program sayfaları"
          summary={page.pageNumber + '. sayfa'}
          previousDisabled={page.pageNumber === 1}
          nextDisabled={!page.data?.nextCursor}
          onPrevious={page.previous}
          onNext={() => {
            if (page.data?.nextCursor) page.next(page.data.nextCursor);
          }}
        />
      )}
    </>
  );
}

function MatchOverview({
  overview,
}: {
  overview: ReturnType<
    typeof useAssignmentPage<
      Awaited<ReturnType<typeof getMatchOverview>> | undefined
    >
  >;
}) {
  if (overview.loading)
    return (
      <div role="status" aria-label="Maç özeti yükleniyor">
        <Skeleton className="h-44" />
      </div>
    );
  if (overview.error)
    return (
      <ReadError
        error={overview.error}
        retry={overview.retry}
        label="Maçları tekrar dene"
        ariaLabel="Maç özeti hatası"
      />
    );
  const matches = overview.data?.items ?? [];
  return (
    <>
      <p className="dashboard-count-caption" aria-label="Maç özeti toplamı">
        {matches.length} / {overview.data?.total ?? 0} maç gösteriliyor
      </p>
      {matches.length ? (
        matches.map((match) => (
          <Link to={'/app/matches/' + match.id} key={match.id}>
            <span className="dashboard-list-icon">
              <SoccerBall />
            </span>
            <span>
              <strong>{match.opponent}</strong>
              <small>
                {formatDate(match.date)} · {match.location || 'Konum TBD'}
              </small>
              {match.result && <small>Sonuç: {match.result}</small>}
            </span>
            <Badge variant="outline">
              {match.hasBoard ? 'Hazır' : 'Tahta bekliyor'}
            </Badge>
          </Link>
        ))
      ) : (
        <p className="dashboard-empty">Planlanmış maç bulunmuyor.</p>
      )}
    </>
  );
}

function PlanDistribution({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  return (
    <div className="dashboard-plan-bar">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <progress aria-label={label} value={value} max={total || 1} />
    </div>
  );
}
function MoreLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Button variant="ghost" size="sm" asChild>
      <Link to={to}>
        {children}
        <ArrowRight />
      </Link>
    </Button>
  );
}
function PanelPlaceholder({
  loading,
  text,
}: {
  loading: boolean;
  text: string;
}) {
  return loading ? (
    <Skeleton className="h-44" />
  ) : (
    <p className="dashboard-empty">{text}</p>
  );
}
function ReadError({
  error,
  retry,
  label = 'Tekrar dene',
  ariaLabel,
}: {
  error: string;
  retry: () => void;
  label?: string;
  ariaLabel?: string;
}) {
  return (
    <Alert role="alert" aria-label={ariaLabel}>
      <AlertDescription>{error}</AlertDescription>
      <Button variant="outline" onClick={retry}>
        {label}
      </Button>
    </Alert>
  );
}
function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat('tr-TR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : 'Tarih TBD';
}
export function greeting(now: Date) {
  const hour = now.getHours();
  return hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';
}
