import {
  CaretLeft,
  CaretRight,
  Copy,
  DownloadSimple,
  GridFour,
  Plus,
  Strategy,
  UploadSimple,
} from '@phosphor-icons/react';
import { useCallback } from 'react';
import { getTacticalDrillPage, type DrillCatalogItem } from '../lib/api';
import { useAssignmentPage } from '../lib/use-assignment-page';
import { Link } from 'react-router';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { FootballCard } from '../components/domain/football-card';
import { Skeleton } from '../components/ui/skeleton';
import { useWorkspace } from '../lib/workspace-context';
import dashboardHero from '../assets/dashboard-coach-wide.png';
import teamsHero from '../assets/teams-hero.png';
import { MetricCard } from '../components/presentation/metric-card';
import { PageHero } from '../components/presentation/page-hero';
import { SectionCard } from '../components/presentation/section-card';

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
    <div className="page-shell tactics-reference">
      <PageHero
        className="tactics-reference__hero"
        image={dashboardHero}
        eyebrow="Ortak çalışma alanı"
        title="Taktik Tahtası"
        description={`${group?.name ?? 'Takım TBD'} için saha yerleşimlerini oluşturun ve kulüp taktik kütüphanesini yönetin.`}
        actions={
          <Button asChild>
            <Link to="/app/tactics/new">
              <Plus />
              Yeni egzersiz
            </Link>
          </Button>
        }
      />

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
    <div className="tactics-reference__workspace">
      {page && (
        <>
          <p className="sr-only" aria-label="Taktik kapsamı özeti">
            {page.total} taktik egzersizi
          </p>
          <section
            className="tactics-reference__metrics"
            aria-label="Taktik kütüphanesi özeti"
          >
            <MetricCard
              icon={Strategy}
              label="Taktik egzersizi"
              value={page.total}
              detail="Erişilebilir tahta kaydı"
            />
            <MetricCard
              icon={GridFour}
              label="Bu sayfa"
              value={page.items.length}
              detail={`Sayfa ${state.pageNumber}`}
              tone="violet"
            />
          </section>
        </>
      )}
      <div className="tactics-reference__content">
        <section
          className="tactics-reference__catalog"
          aria-labelledby="tactical-catalog-title"
        >
          <header>
            <div>
              <p className="page-kicker">Tahta kataloğu</p>
              <h2 id="tactical-catalog-title">Taktik Çalışmaları</h2>
              <p>Global ve kulüp kapsamındaki doğrulanmış tahta kayıtları.</p>
            </div>
            <nav aria-label="Taktik sayfaları">
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
          <div className="tactics-reference__catalog-body">
            {state.loading ? (
              <div role="status" aria-label="Taktik egzersizler yükleniyor">
                <Skeleton className="h-52" />
              </div>
            ) : state.error ? (
              <Alert role="alert">
                <AlertDescription>{state.error}</AlertDescription>
                <Button onClick={state.retry}>Tekrar dene</Button>
              </Alert>
            ) : !page?.items.length && state.pageNumber > 1 ? (
              <p>Bu sayfada taktik egzersizi yok.</p>
            ) : (
              <TacticalGrid tacticalDrills={page?.items ?? []} />
            )}
          </div>
        </section>
        <SectionCard
          className="tactics-reference__capabilities"
          title="Tahta Araçları"
          description="Editörde hazır olan doğrulanmış çalışma araçları"
          contentClassName="tactics-reference__capability-list"
        >
          <span>
            <GridFour />
            <strong>Saha ve formasyonlar</strong>
            <small>Farklı saha tipleri ve takım yerleşimleri</small>
          </span>
          <span>
            <UploadSimple />
            <strong>NGCS JSON içe aktarım</strong>
            <small>Doğrulanan tahta belgeleri</small>
          </span>
          <span>
            <DownloadSimple />
            <strong>PNG, SVG ve JSON çıktı</strong>
            <small>Çalışmayı paylaşmaya hazır dışa aktarım</small>
          </span>
          <Button asChild>
            <Link to="/app/tactics/new">
              <Plus /> Yeni tahta aç
            </Link>
          </Button>
        </SectionCard>
      </div>
    </div>
  );
}

function TacticalGrid({
  tacticalDrills,
}: {
  tacticalDrills: DrillCatalogItem[];
}) {
  return tacticalDrills.length ? (
    <div className="catalog-grid">
      {tacticalDrills.map((drill) => (
        <Link
          className="list-link"
          to={`/app/tactics/${drill.id}`}
          key={drill.id}
        >
          <FootballCard
            tone="board"
            preview={<img src={teamsHero} alt="" aria-hidden="true" />}
            title={drill.title}
            badge={
              <Badge
                variant={drill.scope === 'GLOBAL' ? 'secondary' : 'default'}
              >
                {drill.scope === 'GLOBAL' ? 'Global' : 'Kulüp'}
              </Badge>
            }
            description={`${phaseLabel(drill.category)} · ${drill.durationMin} dk · ${drill.ageGroup}`}
            action={
              drill.scope === 'GLOBAL' ? (
                <>
                  <Copy /> Kopyala ve düzenle
                </>
              ) : (
                'Takım tahtasını aç'
              )
            }
          />
        </Link>
      ))}
    </div>
  ) : (
    <div className="empty-state">
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
