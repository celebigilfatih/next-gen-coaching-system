import {
  ArrowRight,
  ArrowCounterClockwise,
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
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Button } from '../components/ui/button';
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
import {
  getTrainingPlanPage,
  getTrainingDayPage,
  type TrainingPlanCatalogPage,
} from '../lib/api';
import { Input } from '../components/ui/input';
import { addDays, toLocalDateKey } from '../lib/week';
import '../styles/trainings-list-workspace.css';
import { useWorkspace } from '../lib/workspace-context';

import { useAssignmentPage } from '../lib/use-assignment-page';
import { getSession, subscribeSession } from '../lib/session';

export function meta() {
  return [{ title: 'Antrenmanlar | NGCS' }];
}
export default function TrainingsRoute() {
  const { group, season, scope, loading, error, reload } = useWorkspace();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const session = useSyncExternalStore(
    subscribeSession,
    getSession,
    () => null,
  );
  const canManage = Boolean(session && session.user.role !== 'PLAYER');
  return (
    <div className="page-shell trainings-list-workspace">
      <header className="training-list-heading">
        <div>
          <h1>Antrenman Planları</h1>
          <p>
            {group?.name ?? 'Takım seçilmedi'} için antrenman akışları, fazlar
            ve katılım kayıtları.
          </p>
        </div>
        {canManage && (
          <Button
            id="training-create-trigger"
            disabled={!group || loading || Boolean(error)}
            onClick={() => setOpen(true)}
          >
            <Plus /> Yeni plan
          </Button>
        )}
      </header>
      {canManage && (
        <TrainingPlanDialog
          mode="create"
          open={open}
          onOpenChange={setOpen}
          groupId={group?.id}
          clubId={scope.clubId}
          groupName={group?.name ?? 'Takım TBD'}
          returnFocusId="training-create-trigger"
          onSaved={async (plan) => {
            await reload();
            navigate(`/app/trainings/${plan.id}`);
          }}
        />
      )}
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
        <section
          className="training-list-panel"
          aria-labelledby="training-catalog-title"
        >
          <header className="training-list-panel-heading">
            <div>
              <h2 id="training-catalog-title">Antrenman Akışları</h2>
              <p>
                {dateFilter
                  ? 'Seçili günün planları'
                  : 'Seçili takım ve sezondaki planlar'}
              </p>
            </div>
            <div
              className="training-list-filter"
              role="group"
              aria-label="Antrenman tarihi filtresi"
            >
              <label htmlFor="training-date-filter">Antrenman tarihi</label>
              <Input
                id="training-date-filter"
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
              />
              <Button
                variant="outline"
                onClick={() => setDateFilter(toLocalDateKey(new Date()))}
              >
                <CalendarBlank /> Bugün
              </Button>
              <Button
                variant="outline"
                disabled={!dateFilter}
                onClick={() => setDateFilter('')}
              >
                <ArrowCounterClockwise /> Tüm planlar
              </Button>
            </div>
          </header>
          <TrainingCatalog
            key={JSON.stringify([
              scope.clubId,
              scope.clubSeasonId,
              scope.teamId,
              group.id,
              season?.id,
              dateFilter,
            ])}
            groupId={group.id}
            groupName={group.name}
            seasonId={season?.id}
            canManage={canManage}
            dateFilter={dateFilter}
          />
        </section>
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
  dateFilter,
}: {
  groupId: string;
  groupName: string;
  seasonId?: string;
  canManage: boolean;
  dateFilter: string;
}) {
  const bounds = trainingDayBounds(dateFilter);
  const from = bounds?.from;
  const until = bounds?.until;
  const load = useCallback(
    (after?: string) =>
      dateFilter && !(from && until)
        ? Promise.reject(new Error('Geçerli bir antrenman tarihi seçin.'))
        : from && until
          ? getTrainingDayPage(groupId, seasonId, from, until, after)
          : getTrainingPlanPage(groupId, seasonId, after),
    [groupId, seasonId, from, until, dateFilter],
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
          <section
            className="training-list-summary"
            aria-label="Plan istatistikleri"
          >
            <dl>
              <div>
                <dt>
                  <ClipboardText /> Toplam plan
                </dt>
                <dd>{summary.total}</dd>
              </div>
              <div>
                <dt>
                  <Timer /> Toplam süre
                </dt>
                <dd>
                  {summary.totalDuration} <small>dk</small>
                </dd>
              </div>
              <div>
                <dt>
                  <CalendarBlank /> Tarihli plan
                </dt>
                <dd>{summary.scheduled}</dd>
              </div>
              <div>
                <dt>
                  <Clock /> Tarihsiz plan
                </dt>
                <dd>{summary.undated}</dd>
              </div>
              <div>
                <dt>
                  <CheckCircle /> Katılım kaydı
                </dt>
                <dd>{summary.presentAttendance}</dd>
              </div>
            </dl>
          </section>
        </>
      )}
      <TrainingPagination
        loading={loading}
        pageNumber={state.pageNumber}
        count={sorted.length}
        total={summary?.total}
        canNext={Boolean(state.data?.nextCursor)}
        onPrevious={state.previous}
        onNext={() => {
          if (state.data?.nextCursor) state.next(state.data.nextCursor);
        }}
      />
      <div className="training-list-body">
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
          <table
            className="training-list-table"
            aria-label="Antrenman planları"
          >
            <thead>
              <tr>
                <th scope="col">Tarih ve saat</th>
                <th scope="col">Antrenman planı</th>
                <th scope="col">Süre ve faz</th>
                <th scope="col">
                  <span className="sr-only">Plan işlemleri</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((plan) => (
                <TrainingCatalogRow
                  key={plan.id}
                  plan={plan}
                  groupName={groupName}
                  canManage={canManage}
                  onUpdated={state.refresh}
                  onDeleted={state.reload}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <ClipboardText weight="duotone" />
            <h2>
              {state.data?.summary.total
                ? 'Bu sayfada plan yok'
                : dateFilter
                  ? 'Bu tarihte antrenman planı yok'
                  : 'Henüz antrenman planı yok'}
            </h2>
            <p>
              {state.data?.summary.total
                ? 'Önceki sayfaya dönerek planlara ulaşabilirsiniz.'
                : dateFilter
                  ? 'Başka bir tarih seçin veya tüm planları gösterin.'
                  : 'Takım için ilk antrenman oluşturulduğunda burada görünecek.'}
            </p>
          </div>
        )}
      </div>
      <TrainingPagination
        bottom
        loading={loading}
        pageNumber={state.pageNumber}
        count={sorted.length}
        total={summary?.total}
        canNext={Boolean(state.data?.nextCursor)}
        onPrevious={state.previous}
        onNext={() => {
          if (state.data?.nextCursor) state.next(state.data.nextCursor);
        }}
      />
    </>
  );
}

function TrainingCatalogRow({
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
      <tr>
        <td className="training-list-date">
          {plan.date ? (
            <time dateTime={plan.date}>
              <span>
                {new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long' }).format(
                  new Date(plan.date),
                )}
              </span>
              <small>
                <Clock />{' '}
                {new Intl.DateTimeFormat('tr-TR', {
                  timeStyle: 'short',
                }).format(new Date(plan.date))}
              </small>
            </time>
          ) : (
            <span className="training-list-undated">Tarih belirtilmedi</span>
          )}
        </td>
        <th scope="row" className="training-list-plan">
          <strong>{plan.title}</strong>
          {plan.notes ? (
            <details>
              <summary>Planın amacı</summary>
              <p>{plan.notes}</p>
            </details>
          ) : (
            <p>Amaç belirtilmedi</p>
          )}
        </th>
        <td className="training-list-workload">
          <span>
            <Timer /> {plan.totalDuration} dk
          </span>
          <small>
            <ClipboardText /> {plan.phaseCount} faz
          </small>
        </td>
        <td className="training-list-row-actions">
          <div className="training-list-actions">
            <Button variant="outline" size="sm" asChild>
              <Link
                to={`/app/trainings/${plan.id}`}
                aria-label={`${plan.title} · ${formatDate(plan.date)} · Detay`}
              >
                Detay <ArrowRight />
              </Link>
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
        </td>
      </tr>
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
  if (!value) return 'Tarih belirtilmedi';
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value));
}

function TrainingPagination({
  loading,
  pageNumber,
  count,
  total,
  canNext,
  onPrevious,
  onNext,
  bottom = false,
}: {
  loading: boolean;
  pageNumber: number;
  count: number;
  total?: number;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  bottom?: boolean;
}) {
  return (
    <nav
      className="training-list-pagination"
      aria-label={
        bottom
          ? 'Listenin altındaki antrenman sayfaları'
          : 'Antrenman sayfaları'
      }
    >
      <Button
        variant="outline"
        aria-label={bottom ? 'Önceki plan sayfası' : 'Önceki sayfa'}
        disabled={loading || pageNumber === 1}
        onClick={onPrevious}
      >
        <CaretLeft />
        <span>Önceki</span>
      </Button>
      <p
        role={bottom ? undefined : 'status'}
        aria-live={bottom ? undefined : 'polite'}
      >
        {loading
          ? 'Yükleniyor…'
          : `Sayfa ${pageNumber}${total !== undefined ? ` · ${count} / ${total} plan` : ''}`}
      </p>
      <Button
        variant="outline"
        aria-label={bottom ? 'Sonraki plan sayfası' : 'Sonraki sayfa'}
        disabled={loading || !canNext}
        onClick={onNext}
      >
        <span>Sonraki</span>
        <CaretRight />
      </Button>
    </nav>
  );
}

export function trainingDayBounds(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const from = new Date(`${value}T00:00:00`);
  if (Number.isNaN(from.getTime()) || toLocalDateKey(from) !== value)
    return null;
  return { from: from.toISOString(), until: addDays(from, 1).toISOString() };
}
