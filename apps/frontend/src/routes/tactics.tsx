import {
  ArrowRight,
  CaretLeft,
  CaretRight,
  Copy,
  Plus,
  Strategy,
} from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Link } from 'react-router';
import { getTacticalDrillPage, type DrillCatalogItem } from '../lib/api';
import { useAssignmentPage } from '../lib/use-assignment-page';
import { useWorkspace } from '../lib/workspace-context';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import '../styles/tactics-workspace.css';

export function meta() {
  return [{ title: 'Taktik Tahtası | NGCS' }];
}

export default function TacticsRoute() {
  const { group, scope, loading, error, reload } = useWorkspace();
  const key = JSON.stringify([
    scope.clubId,
    scope.clubSeasonId,
    scope.teamId,
    group?.id,
  ]);
  return (
    <div className="page-shell tactics-workspace">
      <header className="tactics-workspace-heading">
        <div>
          <h1>Taktik Tahtası</h1>
          <p>
            {group?.name ?? 'Takım seçilmedi'} için saha yerleşimleri ve sahneli
            çalışmalar.
          </p>
        </div>
        <Button asChild>
          <Link to="/app/tactics/new">
            <Plus /> Yeni egzersiz
          </Link>
        </Button>
      </header>

      {loading ? (
        <div
          role="status"
          aria-label="Taktik kapsamı yükleniyor"
          className="loading-grid"
        >
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
        </div>
      ) : error ? (
        <Alert role="alert" className="route-error">
          <AlertTitle>Kütüphane alınamadı</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={() => void reload()}>Tekrar dene</Button>
        </Alert>
      ) : !group ? (
        <p>Bu takım için taktik egzersiz bağlamı bulunmuyor.</p>
      ) : (
        <TacticalCatalog key={key} groupId={group.id} />
      )}
    </div>
  );
}

function TacticalCatalog({ groupId }: { groupId: string }) {
  const load = useCallback(
    (after?: string) => getTacticalDrillPage(groupId, after),
    [groupId],
  );
  const state = useAssignmentPage(load);
  const page = state.data;
  return (
    <>
      <section
        className="tactics-workspace-panel"
        aria-labelledby="tactical-catalog-title"
      >
        <header>
          <div>
            <h2 id="tactical-catalog-title">Taktik Çalışmaları</h2>
            <p aria-label="Taktik kapsamı özeti">
              {page ? `${page.total} taktik egzersizi` : 'Tahta kataloğu'} ·
              Global ve kulüp kayıtları
            </p>
          </div>
          <nav
            className="tactics-workspace-pagination"
            aria-label="Taktik sayfaları"
          >
            <Button
              variant="outline"
              size="icon"
              aria-label="Önceki sayfa"
              disabled={state.loading || state.pageNumber === 1}
              onClick={state.previous}
            >
              <CaretLeft />
            </Button>
            <p role="status">
              Sayfa {state.pageNumber}
              {page ? ` · ${page.items.length} / ${page.total}` : ''}
            </p>
            <Button
              variant="outline"
              size="icon"
              aria-label="Sonraki sayfa"
              disabled={state.loading || !page?.nextCursor}
              onClick={() => {
                if (page?.nextCursor) state.next(page.nextCursor);
              }}
            >
              <CaretRight />
            </Button>
          </nav>
        </header>
        {state.loading ? (
          <div
            className="tactics-workspace-state"
            role="status"
            aria-label="Taktik egzersizler yükleniyor"
          >
            <Skeleton className="h-52" />
          </div>
        ) : state.error ? (
          <Alert role="alert" className="tactics-workspace-state">
            <AlertDescription>{state.error}</AlertDescription>
            <Button onClick={state.retry}>Tekrar dene</Button>
          </Alert>
        ) : !page?.items.length && state.pageNumber > 1 ? (
          <p className="tactics-workspace-state">
            Bu sayfada taktik egzersizi yok.
          </p>
        ) : (
          <TacticalRegister tacticalDrills={page?.items ?? []} />
        )}
      </section>
      <p className="tactics-workspace-help">
        Editörde saha ve formasyonlar, NGCS JSON içe aktarım, PNG, SVG ve JSON
        çıktı araçları bulunur. Global kayıtlar kulüp kopyası olarak düzenlenir.
      </p>
    </>
  );
}

function TacticalRegister({
  tacticalDrills,
}: {
  tacticalDrills: DrillCatalogItem[];
}) {
  return tacticalDrills.length ? (
    <table className="tactics-workspace-table" aria-label="Taktik egzersizleri">
      <thead>
        <tr>
          <th scope="col">Çalışma</th>
          <th scope="col">Süre</th>
          <th scope="col">Kapsam</th>
          <th scope="col">
            <span className="sr-only">Tahtayı aç</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {tacticalDrills.map((drill) => (
          <tr key={drill.id}>
            <td>
              <strong>{drill.title}</strong>
              <small>
                {phaseLabel(drill.category)} · {drill.ageGroup}
              </small>
            </td>
            <td>{drill.durationMin} dk</td>
            <td>
              <Badge
                variant={drill.scope === 'GLOBAL' ? 'secondary' : 'outline'}
              >
                {drill.scope === 'GLOBAL' ? 'Global' : 'Kulüp'}
              </Badge>
            </td>
            <td>
              <Link
                to={`/app/tactics/${drill.id}`}
                aria-label={`${drill.title} · ${drill.scope === 'GLOBAL' ? 'Kopyala ve düzenle' : 'Tahtayı aç'}`}
              >
                {drill.scope === 'GLOBAL' ? (
                  <>
                    <Copy /> Kopyala ve düzenle
                  </>
                ) : (
                  <>
                    Tahtayı aç <ArrowRight />
                  </>
                )}
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <div className="empty-state tactics-workspace-state">
      <Strategy weight="duotone" />
      <h2>Henüz taktik egzersizi yok</h2>
      <p>
        İlk kulüp egzersizini oluşturup saha yerleşimini takımınızla paylaşın.
      </p>
      <Button asChild>
        <Link to="/app/tactics/new">
          <Plus />
          Tahta oluştur
        </Link>
      </Button>
    </div>
  );
}

function phaseLabel(value: DrillCatalogItem['category']) {
  return {
    WARM_UP: 'Isınma',
    TECHNICAL: 'Teknik',
    TACTICAL: 'Taktik',
    COOL_DOWN: 'Soğuma',
  }[value];
}
