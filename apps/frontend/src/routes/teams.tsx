import {
  Archive,
  ArrowCounterClockwise,
  Plus,
  ShieldChevron,
  UsersThree,
} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import teamsHero from '../assets/teams-hero.png';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../components/feedback/data-state';
import { PagePagination } from '../components/feedback/page-pagination';
import { PageHero } from '../components/presentation/page-hero';
import { TeamCard } from '../components/presentation/team-card';
import {
  ArchiveTeamDialog,
  TeamFormDialog,
} from '../components/team-lifecycle-dialogs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet';
import { Skeleton } from '../components/ui/skeleton';
import {
  getSportingCatalog,
  restoreSportingTeam,
  type CatalogPage,
  type SportingTeam,
  type TeamClassification,
} from '../lib/api';
import { getSession } from '../lib/session';
import { useWorkspace } from '../lib/workspace-context';

export type TeamView = 'first-team' | 'academy';

export function meta() {
  return [{ title: 'Takımlar | NGCS' }];
}

export default function TeamsRoute() {
  const [searchParams] = useSearchParams();
  const view =
    searchParams.get('view') === 'academy' ? 'academy' : 'first-team';
  const next = new URLSearchParams(searchParams);
  next.delete('view');
  const suffix = next.size ? `?${next.toString()}` : '';
  return <Navigate to={`/app/teams/${view}${suffix}`} replace />;
}

export function TeamDirectoryRoute({ view }: { view: TeamView }) {
  const { scope, loading, error } = useWorkspace();
  if (loading)
    return <Skeleton className="h-48" aria-label="Çalışma alanı yükleniyor" />;
  if (error) return <ErrorState title="Takımlar alınamadı" message={error} />;
  return (
    <TeamDirectory
      key={`${scope.clubId}:${scope.clubSeasonId}:${view}`}
      view={view}
    />
  );
}

function TeamDirectory({ view }: { view: TeamView }) {
  const { scope, clubSeason, selectScope, reload } = useWorkspace();
  const role = getSession()?.user.role;
  const canManage = role === 'SYSTEM_ADMIN' || role === 'CLUB_ADMIN';
  const canCreateFirstTeam = role === 'SYSTEM_ADMIN';
  const exactSeason = Boolean(
    scope.clubSeasonId && scope.clubSeasonId !== '*' && clubSeason,
  );
  const classification: TeamClassification =
    view === 'first-team' ? 'FIRST_TEAM' : 'ACADEMY';
  const categoryKey = view === 'first-team' ? 'A_TAKIM' : 'ALT_YAPI';
  const [query, setQuery] = useState('');
  const [cursors, setCursors] = useState<Array<string | undefined>>([
    undefined,
  ]);
  const [revision, setRevision] = useState(0);
  const [retry, setRetry] = useState(0);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SportingTeam>();
  const [archiving, setArchiving] = useState<SportingTeam>();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const after = cursors[cursors.length - 1];
  const key = JSON.stringify([
    scope.clubId,
    scope.clubSeasonId,
    categoryKey,
    query,
    after,
    revision,
    retry,
  ]);
  const [result, setResult] = useState<{
    key: string;
    page?: CatalogPage<SportingTeam>;
    error?: string;
  }>();
  const loading = result?.key !== key;
  const page = loading ? undefined : result?.page;
  const error = loading ? '' : result?.error;

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(
      () => {
        (scope.clubId
          ? getSportingCatalog('teams', {
              clubId: scope.clubId,
              clubSeasonId: scope.clubSeasonId,
              categoryKey,
              status: 'ACTIVE',
              after,
              q: query.trim(),
            })
          : Promise.resolve({ items: [], nextCursor: null, limit: 25 })
        )
          .then((nextPage) => {
            if (active) setResult({ key, page: nextPage });
          })
          .catch((cause: unknown) => {
            if (active)
              setResult({
                key,
                error:
                  cause instanceof Error
                    ? cause.message
                    : 'Takımlar alınamadı.',
              });
          });
      },
      query ? 250 : 0,
    );
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [scope.clubId, scope.clubSeasonId, categoryKey, query, after, key]);

  const items = page?.items ?? [];
  const canOpenCreate =
    exactSeason &&
    ((view === 'academy' && canManage) ||
      (view === 'first-team' && canCreateFirstTeam && items.length === 0));
  const createLabel =
    view === 'first-team' ? 'A Takımı oluştur' : 'Altyapı takımı ekle';

  async function changed() {
    setRevision((value) => value + 1);
    await reload();
  }

  return (
    <div className="page-shell teams-reference">
      <PageHero
        className="teams-reference__hero"
        image={teamsHero}
        eyebrow="Sportif organizasyon"
        title="Takım Yönetimi"
        description={
          view === 'first-team'
            ? 'Kulübün korunan A Takım kimliğini ve sezon bağlantısını yönetin.'
            : 'Altyapı takımlarını seçili sezon kapsamında yönetin.'
        }
        actions={
          <div className="teams-reference__hero-actions">
            {view === 'academy' && canManage && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setArchiveOpen(true)}
              >
                <Archive aria-hidden="true" /> Arşivdekiler
              </Button>
            )}
            {((view === 'academy' && canManage) ||
              (view === 'first-team' &&
                canCreateFirstTeam &&
                !loading &&
                items.length === 0)) && (
              <Button
                id="team-create-trigger"
                type="button"
                disabled={!canOpenCreate}
                title={
                  exactSeason
                    ? undefined
                    : 'Takım oluşturmak için belirli bir sezon seçin.'
                }
                onClick={() => setCreating(true)}
              >
                <Plus aria-hidden="true" /> {createLabel}
              </Button>
            )}
          </div>
        }
      />

      <section
        className="teams-reference__workspace"
        aria-label={
          view === 'first-team' ? 'A Takım yönetimi' : 'Altyapı yönetimi'
        }
      >
        <div className="teams-reference__toolbar">
          <Input
            aria-label="Takım ara"
            placeholder="Takım ara…"
            className="sporting-search"
            maxLength={100}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCursors([undefined]);
            }}
          />
        </div>

        <div className="teams-reference__section-heading">
          <div>
            <p className="page-kicker">
              {view === 'first-team'
                ? 'Korunan kulüp takımı'
                : 'Oyuncu gelişim yolu'}
            </p>
            <h2 id="visible-teams-title">
              {view === 'first-team' ? 'A Takım' : 'Altyapı Takımları'}
            </h2>
          </div>
          <span>
            {loading ? 'Yükleniyor' : `${items.length} takım gösteriliyor`}
          </span>
        </div>

        {error && (
          <ErrorState
            title="Takımlar alınamadı"
            message={error}
            onRetry={() => setRetry((value) => value + 1)}
          />
        )}
        {loading ? (
          <LoadingState label="Takımlar yükleniyor" skeletonClassName="h-48" />
        ) : error ? null : items.length ? (
          <div
            className={`teams-reference__card-grid ${
              view === 'first-team'
                ? 'teams-reference__card-grid--first-team'
                : ''
            }`}
            role="region"
            aria-labelledby="visible-teams-title"
          >
            {items.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                selected={scope.teamId === team.id}
                onSelect={() => selectScope({ teamId: team.id })}
                canManage={canManage}
                canArchive={view === 'academy'}
                onEdit={() => setEditing(team)}
                onArchive={() => setArchiving(team)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={
              view === 'first-team' ? (
                <ShieldChevron weight="duotone" />
              ) : (
                <UsersThree weight="duotone" />
              )
            }
            title={
              query
                ? 'Aramayla eşleşen takım yok'
                : view === 'first-team'
                  ? 'A Takım henüz oluşturulmamış'
                  : 'Aktif altyapı takımı yok'
            }
            description={
              query
                ? 'Arama ifadesini değiştirin veya temizleyin.'
                : view === 'first-team'
                  ? role === 'SYSTEM_ADMIN'
                    ? 'Belirli bir sezon seçip kulübün korunan A Takım kaydını oluşturun.'
                    : 'A Takım ilk kaydını sistem yöneticisi oluşturabilir.'
                  : canManage
                    ? 'Belirli bir sezon seçip ilk altyapı takımını ekleyin.'
                    : 'Bu kapsamda görüntülenebilir altyapı takımı bulunmuyor.'
            }
          />
        )}

        {view === 'academy' && (
          <PagePagination
            label="Altyapı takım sayfaları"
            previousDisabled={loading || cursors.length === 1}
            onPrevious={() => setCursors((value) => value.slice(0, -1))}
            summary={
              <>
                Sayfa {cursors.length}
                {!loading && !error
                  ? ` · ${items.length} takım gösteriliyor`
                  : ''}
              </>
            }
            nextDisabled={loading || !page?.nextCursor}
            onNext={() => {
              if (page?.nextCursor)
                setCursors((value) => [...value, page.nextCursor!]);
            }}
          />
        )}
      </section>

      {creating && (
        <TeamFormDialog
          key={`create:${classification}:${scope.clubSeasonId}`}
          open
          onOpenChange={setCreating}
          mode="create"
          classification={classification}
          clubId={scope.clubId}
          clubSeasonId={scope.clubSeasonId}
          clubSeasonName={clubSeason?.name ?? 'Seçili sezon'}
          returnFocusId="team-create-trigger"
          onSaved={changed}
        />
      )}
      {editing && (
        <TeamFormDialog
          key={`edit:${editing.id}`}
          open
          onOpenChange={(open) => {
            if (!open) setEditing(undefined);
          }}
          mode="edit"
          classification={classification}
          clubId={scope.clubId}
          clubSeasonId={scope.clubSeasonId}
          clubSeasonName={clubSeason?.name ?? 'Seçili sezon'}
          team={editing}
          returnFocusId={`team-actions-${editing.id}`}
          onSaved={changed}
        />
      )}
      {archiving && (
        <ArchiveTeamDialog
          key={archiving.id}
          open
          onOpenChange={(open) => {
            if (!open) setArchiving(undefined);
          }}
          team={archiving}
          returnFocusId={`team-actions-${archiving.id}`}
          onArchived={changed}
        />
      )}
      <ArchivedAcademySheet
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        clubId={scope.clubId}
        clubSeasonId={scope.clubSeasonId}
        onRestored={changed}
      />
    </div>
  );
}

function ArchivedAcademySheet({
  open,
  onOpenChange,
  clubId,
  clubSeasonId,
  onRestored,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubId: string;
  clubSeasonId: string;
  onRestored: () => void | Promise<void>;
}) {
  const [retry, setRetry] = useState(0);
  const [cursors, setCursors] = useState<Array<string | undefined>>([
    undefined,
  ]);
  const [restoring, setRestoring] = useState('');
  const [result, setResult] = useState<{
    page?: CatalogPage<SportingTeam>;
    error?: string;
  }>();
  const after = cursors[cursors.length - 1];

  useEffect(() => {
    if (open) setCursors([undefined]);
  }, [open, clubId, clubSeasonId]);

  useEffect(() => {
    if (!open || !clubId) return;
    let active = true;
    setResult(undefined);
    getSportingCatalog('teams', {
      clubId,
      clubSeasonId,
      categoryKey: 'ALT_YAPI',
      status: 'ARCHIVED',
      after,
    })
      .then((page) => {
        if (active) setResult({ page });
      })
      .catch((cause: unknown) => {
        if (active)
          setResult({
            error: cause instanceof Error ? cause.message : 'Arşiv alınamadı.',
          });
      });
    return () => {
      active = false;
    };
  }, [open, clubId, clubSeasonId, after, retry]);

  async function restore(team: SportingTeam) {
    if (restoring) return;
    setRestoring(team.id);
    try {
      await restoreSportingTeam(team.id);
      await onRestored();
      if (result?.page?.items.length === 1 && cursors.length > 1) {
        setCursors((value) => value.slice(0, -1));
        toast.success(`${team.name} geri yüklendi`);
        return;
      }
      setResult((previous) => ({
        ...previous,
        page: previous?.page
          ? {
              ...previous.page,
              items: previous.page.items.filter((item) => item.id !== team.id),
            }
          : undefined,
      }));
      toast.success(`${team.name} geri yüklendi`);
    } catch (cause) {
      setResult((previous) => ({
        ...previous,
        error:
          cause instanceof Error ? cause.message : 'Takım geri yüklenemedi.',
      }));
    } finally {
      setRestoring('');
    }
  }

  const items = result?.page?.items ?? [];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="teams-reference__archive-sheet">
        <SheetHeader>
          <SheetTitle>Arşivlenmiş altyapı takımları</SheetTitle>
          <SheetDescription>
            Geçmiş kayıtları korunmuş takımları aynı kimlikle geri yükleyin.
          </SheetDescription>
        </SheetHeader>
        {result?.error && (
          <ErrorState
            title="Arşiv alınamadı"
            message={result.error}
            onRetry={() => setRetry((value) => value + 1)}
          />
        )}
        {!result ? (
          <LoadingState label="Arşiv yükleniyor" skeletonClassName="h-32" />
        ) : result.error ? null : items.length === 0 ? (
          <EmptyState
            icon={<Archive weight="duotone" />}
            title="Arşiv boş"
            description="Bu sezon kapsamında arşivlenmiş altyapı takımı yok."
          />
        ) : (
          <div className="teams-reference__archive-list">
            {items.map((team) => (
              <article key={team.id} className="teams-reference__archive-item">
                <div>
                  <strong>{team.name}</strong>
                  <span>
                    {team.ageGroupLabel ?? 'Yaş etiketi TBD'} ·{' '}
                    {team.teamSeasons[0]?.clubSeason.name ?? 'Sezon TBD'}
                  </span>
                </div>
                <div>
                  <Badge variant="outline">Arşivde</Badge>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={Boolean(restoring)}
                    onClick={() => void restore(team)}
                  >
                    <ArrowCounterClockwise aria-hidden="true" />
                    {restoring === team.id ? 'Yükleniyor…' : 'Geri yükle'}
                  </Button>
                </div>
              </article>
            ))}
            <PagePagination
              label="Arşivlenmiş altyapı takım sayfaları"
              previousDisabled={cursors.length === 1 || Boolean(restoring)}
              onPrevious={() => setCursors((value) => value.slice(0, -1))}
              summary={<>Sayfa {cursors.length}</>}
              nextDisabled={!result.page?.nextCursor || Boolean(restoring)}
              onNext={() => {
                if (result.page?.nextCursor)
                  setCursors((value) => [...value, result.page!.nextCursor!]);
              }}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
