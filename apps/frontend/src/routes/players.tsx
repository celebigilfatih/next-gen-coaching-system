import { UsersThree } from '@phosphor-icons/react';
import { Link } from 'react-router';
import teamsHero from '../assets/teams-hero.png';
import { PlayerDirectory } from '../components/domain/player-directory';
import { ErrorState } from '../components/feedback/data-state';
import { PageHero } from '../components/presentation/page-hero';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { useWorkspace } from '../lib/workspace-context';

export function meta() {
  return [{ title: 'Oyuncular | NGCS' }];
}

export default function PlayersRoute() {
  const { team, club, clubSeason, loading, error } = useWorkspace();
  if (loading)
    return <Skeleton className="h-44" aria-label="Çalışma alanı yükleniyor" />;
  if (error)
    return <ErrorState title="Çalışma alanı alınamadı" message={error} />;

  return (
    <div
      className="page-shell player-operations-reference players-reference"
      key={`${club?.id}:${team?.id}:${clubSeason?.id}`}
    >
      <PageHero
        className="player-operations-reference__hero"
        image={teamsHero}
        eyebrow="Oyuncular"
        title={`${team?.name ?? 'Takım'} Oyuncuları`}
        description="Oyuncu kimliklerini, güncel takım bağlamını ve Player 360 profillerini yönetin."
        actions={
          <Button variant="outline" asChild>
            <Link to="/app/squad">
              <UsersThree weight="duotone" /> Tarihli kadroyu aç
            </Link>
          </Button>
        }
      />
      {team ? (
        <PlayerDirectory team={team} clubId={club?.id} />
      ) : (
        <ErrorState
          title="Takım seçilmedi"
          message="Oyuncuları görüntülemek için bir çalışma takımı seçin."
        />
      )}
    </div>
  );
}
