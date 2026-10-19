import {
  CalendarBlank,
  CaretLeft,
  CaretRight,
  CheckCircle,
  Clock,
  ClipboardText,
  DotsThreeVertical,
  PencilSimple,
  Plus,
  Trash,
  Timer,
} from '@phosphor-icons/react';
import { useCallback, useState, useSyncExternalStore } from 'react';
import { Link, useNavigate } from 'react-router';
import dashboardHero from '../assets/dashboard-coach-wide.png';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { FootballCard } from '../components/domain/football-card';
import { Skeleton } from '../components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  DeleteTrainingPlanDialog,
  TrainingPlanDialog,
} from '../components/training-plan-dialogs';
import { getTrainingPlanPage, type TrainingPlanCatalogPage } from '../lib/api';
import { useWorkspace } from '../lib/workspace-context';

import { useAssignmentPage } from '../lib/use-assignment-page';
import { MetricCard } from '../components/presentation/metric-card';
import { PageHero } from '../components/presentation/page-hero';
import { getSession, subscribeSession } from '../lib/session';

export function meta() {
  return [{ title: 'Antrenmanlar | NGCS' }];
}
export default function TrainingsRoute() {
  const { group, season, scope, loading, error, reload } = useWorkspace();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const session = useSyncExternalStore(
    subscribeSession,
    getSession,
    () => null,
  );
  const canManage = Boolean(session && session.user.role !== 'PLAYER');
  return (
    <div className="page-shell training-reference">
      <PageHero
        className="training-reference__hero"
        image={dashboardHero}
        eyebrow="Antrenman"
        title="Antrenman Planları"
        description={`${group?.name ?? 'Takım TBD'} için antrenman akışlarını, fazları ve katılım kayıtlarını yönetin.`}
        actions={
          canManage ? (
            <>
              <Button
                id="training-create-trigger"
                disabled={!group || loading || Boolean(error)}
                onClick={() => setOpen(true)}
              >
                <Plus />
                Yeni plan
              </Button>
              <TrainingPlanDialog
                mode="create"
                open={open}
                onOpenChange={setOpen}
                groupId={group?.id}
                groupName={group?.name ?? 'Takım TBD'}
                returnFocusId="training-create-trigger"
                onSaved={async (plan) => {
                  await reload();
                  navigate(`/app/trainings/${plan.id}`);
                }}
              />
            </>
          ) : null
        }
      />
      {error ? (
        <Alert className="route-error">
          <AlertTitle>Planlar alınamadı</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {loading ? (
        <div role="status">
          <Skeleton className="h-44" />
          Planlar yükleniyor…
        </div>
      ) : !error && group ? (
        <TrainingCatalog
          key={JSON.stringify([
            scope.clubId,
            scope.clubSeasonId,
            scope.teamId,
            group.id,
            season?.id,
          ])}
          groupId={group.id}
          groupName={group.name}
          seasonId={season?.id}
          canManage={canManage}
        />
      ) : !error ? (
        <p>Planları görmek için erişilebilir bir takım seçin.</p>
      ) : null}
    </div>
  );
}
function TrainingCatalog({
  groupId,
  groupName,
  seasonId,
  canManage,
}: {
  groupId: string;
  groupName: string;
  seasonId?: string;
  canManage: boolean;
}) {
  const load = useCallback(
    (after?: string) => getTrainingPlanPage(groupId, seasonId, after),
    [groupId, seasonId],
  );
  const state = useAssignmentPage(load);
  const loading = state.loading;
  const sorted = state.data?.items ?? [];
  const summary = state.data?.summary;
  return (
    <>
      {summary && (
        <>
          <p className="sr-only" aria-label="Antrenman kapsamı özeti">
            {summary.total} plan · {summary.scheduled} tarihli ·{' '}
            {summary.undated} tarihsiz · {summary.totalDuration} dakika ·{' '}
            {summary.presentAttendance} işaretlenmiş katılım
          </p>
          <section className="training-reference__metrics">
            <MetricCard
              icon={ClipboardText}
              label="Toplam plan"
              value={summary.total}
              detail="Kapsamdaki antrenmanlar"
            />
            <MetricCard
              icon={CalendarBlank}
              label="Tarihli plan"
              value={summary.scheduled}
              detail="Takvime yerleştirilmiş"
              tone="teal"
            />
            <MetricCard
              icon={Clock}
              label="Tarihsiz plan"
              value={summary.undated}
              detail="Planlama bekliyor"
              tone="amber"
            />
            <MetricCard
              icon={Timer}
              label="Toplam süre"
              value={`${summary.totalDuration} dk`}
              detail="Planlanan çalışma süresi"
              tone="violet"
            />
            <MetricCard
              icon={CheckCircle}
              label="Katılım kaydı"
              value={summary.presentAttendance}
              detail="İşaretlenmiş katılım"
              tone="teal"
            />
          </section>
        </>
      )}
      <section
        className="training-reference__catalog"
        aria-labelledby="training-catalog-title"
      >
        <header className="training-reference__catalog-head">
          <div>
            <p className="page-kicker">Plan kataloğu</p>
            <h2 id="training-catalog-title">Antrenman Akışları</h2>
            <p>Tarih, faz, süre ve amaç bilgileriyle doğrulanmış planlar.</p>
          </div>
          <nav aria-label="Antrenman sayfaları">
            <Button
              variant="outline"
              size="icon"
              aria-label="Önceki sayfa"
              disabled={loading || state.pageNumber === 1}
              onClick={state.previous}
            >
              <CaretLeft />
            </Button>
            <p role="status" aria-live="polite">
              {loading
                ? 'Yükleniyor…'
                : `Sayfa ${state.pageNumber}${summary ? ` · ${sorted.length} / ${summary.total} plan` : ''}`}
            </p>
            <Button
              variant="outline"
              size="icon"
              aria-label="Sonraki sayfa"
              disabled={loading || !state.data?.nextCursor}
              onClick={() => {
                if (state.data?.nextCursor) state.next(state.data.nextCursor);
              }}
            >
              <CaretRight />
            </Button>
          </nav>
        </header>
        <div className="training-reference__catalog-body">
          {loading ? (
            <div className="loading-grid">
              <Skeleton className="h-44" />
              <Skeleton className="h-44" />
            </div>
          ) : state.error ? (
            <Alert role="alert">
              <AlertTitle>Planlar alınamadı</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
              <Button variant="outline" onClick={state.retry}>
                Tekrar dene
              </Button>
            </Alert>
          ) : sorted.length ? (
            <div className="catalog-grid">
              {sorted.map((plan) => (
                <TrainingCatalogCard
                  key={plan.id}
                  plan={plan}
                  groupName={groupName}
                  canManage={canManage}
                  onUpdated={state.refresh}
                  onDeleted={state.reload}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <ClipboardText weight="duotone" />
              <h2>
                {state.data?.summary.total
                  ? 'Bu sayfada plan yok'
                  : 'Henüz antrenman planı yok'}
              </h2>
              <p>
                {state.data?.summary.total
                  ? 'Önceki sayfaya dönerek planlara ulaşabilirsiniz.'
                  : 'Takım için ilk antrenman oluşturulduğunda burada görünecek.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function TrainingCatalogCard({
  plan,
  groupName,
  canManage,
  onUpdated,
  onDeleted,
}: {
  plan: TrainingPlanCatalogPage['items'][number];
  groupName: string;
  canManage: boolean;
  onUpdated: () => void | Promise<void>;
  onDeleted: () => void | Promise<void>;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  return (
    <>
      <FootballCard
        title={plan.title}
        badge={<Badge variant="outline">{plan.totalDuration} dk</Badge>}
        description={plan.notes || 'Antrenman amacı TBD'}
        metadata={
          <>
            <span>
              <CalendarBlank />
              {formatDate(plan.date)}
            </span>
            <span>
              <ClipboardText />
              {plan.phaseCount} faz
            </span>
            <span>
              <Clock />
              {plan.totalDuration} dakika
            </span>
          </>
        }
        action={
          <div className="training-reference__card-actions">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/app/trainings/${plan.id}`}>Detay</Link>
            </Button>
            {canManage ? (
              <>
                <Button
                  id={`training-edit-trigger-${plan.id}`}
                  variant="outline"
                  size="sm"
                  onClick={() => setEditOpen(true)}
                >
                  <PencilSimple />
                  Düzenle
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      id={`training-menu-trigger-${plan.id}`}
                      variant="ghost"
                      size="icon"
                      aria-label={`${plan.title} işlemleri`}
                    >
                      <DotsThreeVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => setDeleteOpen(true)}
                    >
                      <Trash />
                      Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : null}
          </div>
        }
      />
      {canManage ? (
        <>
          <TrainingPlanDialog
            mode="edit"
            open={editOpen}
            onOpenChange={setEditOpen}
            groupName={groupName}
            plan={plan}
            returnFocusId={`training-edit-trigger-${plan.id}`}
            onSaved={onUpdated}
          />
          <DeleteTrainingPlanDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            plan={plan}
            returnFocusId={`training-menu-trigger-${plan.id}`}
            onDeleted={onDeleted}
          />
        </>
      ) : null}
    </>
  );
}
function formatDate(value: string | null) {
  if (!value) return 'Tarih TBD';
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value));
}
