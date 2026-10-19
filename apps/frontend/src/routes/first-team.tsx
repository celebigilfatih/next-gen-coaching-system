import {
  CalendarCheck,
  CheckSquare,
  PencilSimple,
  Plus,
  SoccerBall,
  Strategy,
  UsersThree,
} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import teamsHero from '../assets/teams-hero.png';
import { PlayerDirectory } from '../components/domain/player-directory';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../components/feedback/data-state';
import { PageHero } from '../components/presentation/page-hero';
import { TeamFormDialog } from '../components/team-lifecycle-dialogs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import {
  getSportingCatalog,
  type CatalogPage,
  type SportingTeam,
} from '../lib/api';
import { getSession } from '../lib/session';
import { useWorkspace } from '../lib/workspace-context';
import { workspaceSeasonLabel } from '../lib/workspace-scope';

export function meta() {
  return [{ title: 'A Takım | NGCS' }];
}

export default function FirstTeamRoute() {
  const workspace = useWorkspace();
  if (workspace.loading)
    return <Skeleton className="h-48" aria-label="Çalışma alanı yükleniyor" />;
  if (workspace.error)
    return <ErrorState title="A Takım alınamadı" message={workspace.error} />;
  return (
    <FirstTeamCenter
      key={`${workspace.scope.clubId}:${workspace.scope.clubSeasonId}`}
    />
  );
}

function FirstTeamCenter() {
  const {
    scope,
    club,
    clubSeason,
    selectScope,
    reload: reloadWorkspace,
  } = useWorkspace();
  const role = getSession()?.user.role;
  const canManage = role === 'SYSTEM_ADMIN' || role === 'CLUB_ADMIN';
  const canCreate = role === 'SYSTEM_ADMIN';
  const exactSeason = Boolean(
    scope.clubSeasonId && scope.clubSeasonId !== '*' && clubSeason,
  );
  const [revision, setRevision] = useState(0);
  const [retry, setRetry] = useState(0);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const key = JSON.stringify([
    scope.clubId,
    scope.clubSeasonId,
    revision,
    retry,
  ]);
  const [result, setResult] = useState<{
    key: string;
    page?: CatalogPage<SportingTeam>;
    error?: string;
  }>();
  const loading = Boolean(scope.clubId) && result?.key !== key;
  const error = loading ? '' : result?.error;
  const team = loading ? undefined : result?.page?.items[0];

  useEffect(() => {
    let active = true;
    if (!scope.clubId) {
      return () => {
        active = false;
      };
    }
    getSportingCatalog('teams', {
      clubId: scope.clubId,
      clubSeasonId: scope.clubSeasonId,
      categoryKey: 'A_TAKIM',
      status: 'ACTIVE',
    })
      .then((page) => {
        if (active) setResult({ key, page });
      })
      .catch((cause: unknown) => {
        if (active)
          setResult({
            key,
            error:
              cause instanceof Error ? cause.message : 'A Takım alınamadı.',
          });
      });
    return () => {
      active = false;
    };
  }, [scope.clubId, scope.clubSeasonId, key]);

  useEffect(() => {
    if (!team || scope.teamId === team.id) return;
    selectScope({ teamId: team.id }, { preservePath: true });
  }, [team, scope.teamId, selectScope]);

  async function changed() {
    setRevision((value) => value + 1);
    await reloadWorkspace();
  }

  const scopedQuery = new URLSearchParams({
    ngcsClub: scope.clubId,
    ngcsSeason: scope.clubSeasonId,
    ngcsTeam: team?.id ?? scope.teamId,
  }).toString();

  return (
    <div className="page-shell player-operations-reference first-team-center">
      <PageHero
        className="player-operations-reference__hero first-team-center__hero"
        image={teamsHero}
        eyebrow="Sportif organizasyon"
        title={team?.name ?? 'A Takım'}
        description={
          team
            ? `${workspaceSeasonLabel(scope, clubSeason?.name)} sezonu için kadro ve günlük operasyon merkezi.`
            : 'Kulübün aktif A Takım kaydı ve kadro merkezi.'
        }
        actions={
          team && canManage ? (
            <Button
              id="first-team-edit-trigger"
              type="button"
              variant="outline"
              onClick={() => setEditing(true)}
            >
              <PencilSimple aria-hidden="true" /> Takım bilgilerini düzenle
            </Button>
          ) : !team && canCreate ? (
            <Button
              id="first-team-create-trigger"
              type="button"
              disabled={!exactSeason || loading}
              title={
                exactSeason
                  ? undefined
                  : 'A Takım oluşturmak için belirli bir sezon seçin.'
              }
              onClick={() => setCreating(true)}
            >
              <Plus aria-hidden="true" /> A Takımı oluştur
            </Button>
          ) : undefined
        }
      />

      {team ? (
        <>
          <section
            className="first-team-center__overview"
            aria-label="A Takım özeti"
          >
            <div>
              <p className="page-kicker">Aktif kapsam</p>
              <h2>{team.name}</h2>
              <div className="first-team-center__badges">
                <Badge>{team.categoryLabel}</Badge>
                <Badge variant="outline">
                  {team.ageGroupLabel ?? 'Kademe TBD'}
                </Badge>
                <Badge variant="outline">
                  {workspaceSeasonLabel(scope, clubSeason?.name)}
                </Badge>
              </div>
            </div>
            <nav
              className="first-team-center__quick-links"
              aria-label="A Takım hızlı işlemleri"
            >
              <QuickLink
                to={`/app/trainings?${scopedQuery}`}
                icon={CalendarCheck}
                label="Antrenmanlar"
              />
              <QuickLink
                to={`/app/matches?${scopedQuery}`}
                icon={SoccerBall}
                label="Maçlar"
              />
              <QuickLink
                to={`/app/attendance?${scopedQuery}`}
                icon={CheckSquare}
                label="Yoklama"
              />
              <QuickLink
                to={`/app/tactics?${scopedQuery}`}
                icon={Strategy}
                label="Taktik Tahtası"
              />
            </nav>
          </section>
          <PlayerDirectory
            team={team}
            clubId={club?.id}
            title="A Takım Oyuncuları"
            description="Aktif A Takım kadrosu ve Player 360 profilleri."
          />
        </>
      ) : error ? (
        <ErrorState
          title="A Takım alınamadı"
          message={error}
          onRetry={() => setRetry((value) => value + 1)}
        />
      ) : loading ? (
        <LoadingState label="A Takım yükleniyor" skeletonClassName="h-44" />
      ) : (
        <EmptyState
          icon={<UsersThree weight="duotone" />}
          title="Bu kapsamda A Takım bulunamadı"
          description={
            canCreate
              ? exactSeason
                ? 'A Takım kaydını oluşturarak kadro merkezini kullanmaya başlayın.'
                : 'A Takım oluşturmak için üst bardan belirli bir sezon seçin.'
              : 'İlk A Takım kaydını sistem yöneticisi oluşturabilir.'
          }
        />
      )}

      {creating && clubSeason && (
        <TeamFormDialog
          open
          onOpenChange={setCreating}
          mode="create"
          classification="FIRST_TEAM"
          clubId={scope.clubId}
          clubSeasonId={clubSeason.id}
          clubSeasonName={clubSeason.name}
          returnFocusId="first-team-create-trigger"
          onSaved={changed}
        />
      )}
      {editing && team && (
        <TeamFormDialog
          open
          onOpenChange={setEditing}
          mode="edit"
          classification="FIRST_TEAM"
          clubId={scope.clubId}
          clubSeasonId={clubSeason?.id ?? ''}
          clubSeasonName={clubSeason?.name ?? 'Sezon TBD'}
          team={team}
          returnFocusId="first-team-edit-trigger"
          onSaved={changed}
        />
      )}
    </div>
  );
}

function QuickLink({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof CalendarCheck;
  label: string;
}) {
  return (
    <Button asChild variant="outline" size="sm">
      <Link to={to}>
        <Icon weight="duotone" aria-hidden="true" /> {label}
      </Link>
    </Button>
  );
}
