import {
  Books,
  CaretLeft,
  CaretRight,
  Clock,
  Funnel,
  MagnifyingGlass,
  Plus,
  Ruler,
  SlidersHorizontal,
  Strategy,
  Users,
} from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAssignmentPage } from '../lib/use-assignment-page';
import { Link } from 'react-router';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { NativeSelect } from '../components/ui/native-select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';
import { FootballCard } from '../components/domain/football-card';
import { Skeleton } from '../components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import {
  getDrillPage,
  getFilteredDrillPage,
  type DrillCatalogItem,
  type DrillCatalogFilters,
  type DrillPhase,
} from '../lib/api';
import { useWorkspace } from '../lib/workspace-context';
import { getSession } from '../lib/session';
import teamsHero from '../assets/teams-hero.png';
import { MetricCard } from '../components/presentation/metric-card';
import { PageHero } from '../components/presentation/page-hero';

const phases: { value: 'ALL' | DrillPhase; label: string }[] = [
  { value: 'ALL', label: 'Tümü' },
  { value: 'WARM_UP', label: 'Isınma' },
  { value: 'TECHNICAL', label: 'Teknik' },
  { value: 'TACTICAL', label: 'Taktik' },
  { value: 'COOL_DOWN', label: 'Soğuma' },
];

const sources: Array<{
  value: 'ALL' | NonNullable<DrillCatalogFilters['source']>;
  label: string;
}> = [
  { value: 'ALL', label: 'Tüm içerikler' },
  { value: 'NGCS', label: 'NGCS' },
  { value: 'CLUB', label: 'Kulüp' },
  { value: 'MINE', label: 'Benim içeriklerim' },
];

const objectives = [
  ['ALL', 'Tüm amaçlar'],
  ['pas', 'Pas'],
  ['ilk-kontrol', 'İlk kontrol'],
  ['bitiricilik', 'Bitiricilik'],
  ['topa-sahip-olma', 'Topa sahip olma'],
  ['geriden-oyun', 'Geriden oyun'],
  ['pres', 'Pres'],
  ['hucum-gecisi', 'Hücum geçişi'],
  ['savunma-gecisi', 'Savunma geçişi'],
] as const;

export function meta() {
  return [{ title: 'Egzersiz Kütüphanesi | NGCS' }];
}

export default function LibraryRoute() {
  const { group, scope, loading, error, reload } = useWorkspace();
  const key = JSON.stringify([
    scope.clubId,
    scope.clubSeasonId,
    scope.teamId,
    group?.id,
  ]);
  const systemAdmin = getSession()?.user.role === 'SYSTEM_ADMIN';
  return (
    <div className="page-shell library-reference">
      <PageHero
        className="library-reference__hero"
        image={teamsHero}
        eyebrow="Antrenman içeriği"
        title="Egzersiz Kütüphanesi"
        description={`${group?.name ?? 'Takım TBD'} için erişilebilir global ve kulüp egzersizlerini kategoriye göre yönetin.`}
        actions={
          <>
            {systemAdmin ? (
              <Button asChild variant="outline">
                <Link to="/app/library/manage">İçerik yönetimi</Link>
              </Button>
            ) : null}
            <Button asChild>
              <Link to="/app/tactics/new">
                <Plus /> Tahta egzersizi oluştur
              </Link>
            </Button>
          </>
        }
      />
      {loading ? (
        <div className="loading-grid">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : error ? (
        <Alert role="alert">
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={() => void reload()}>Tekrar dene</Button>
        </Alert>
      ) : !group ? (
        <p>Bu takım için egzersiz bağlamı bulunmuyor.</p>
      ) : (
        <LibraryCatalog key={key} groupId={group.id} />
      )}
    </div>
  );
}

function LibraryCatalog({ groupId }: { groupId: string }) {
  const [category, setCategory] = useState('ALL');
  const [source, setSource] =
    useState<(typeof sources)[number]['value']>('ALL');
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [objective, setObjective] = useState('ALL');
  const [difficulty, setDifficulty] = useState('ALL');
  useEffect(() => {
    const timeout = window.setTimeout(() => setSearch(searchDraft.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [searchDraft]);
  const filters = useMemo<DrillCatalogFilters>(
    () => ({
      q: search || undefined,
      ageGroup: ageGroup || undefined,
      objective: objective === 'ALL' ? undefined : objective,
      difficulty:
        difficulty === 'ALL'
          ? undefined
          : (difficulty as DrillCatalogFilters['difficulty']),
      source: source === 'ALL' ? undefined : source,
    }),
    [ageGroup, difficulty, objective, search, source],
  );
  const hasFilters = Object.values(filters).some(Boolean);
  const renderFilterFields = () => (
    <>
      <label className="library-reference__search">
        <span className="sr-only">Egzersiz ara</span>
        <MagnifyingGlass aria-hidden="true" />
        <Input
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
          placeholder="Başlık, amaç veya etiket ara"
        />
      </label>
      <NativeSelect
        aria-label="Yaş grubu"
        value={ageGroup}
        onChange={(event) => setAgeGroup(event.target.value)}
      >
        <option value="">Takım yaşı</option>
        <option value="U12">U12</option>
        <option value="U14">U14</option>
        <option value="U16">U16</option>
        <option value="U18">U18</option>
        <option value="SENIOR">A Takım</option>
      </NativeSelect>
      <NativeSelect
        aria-label="Egzersiz amacı"
        value={objective}
        onChange={(event) => setObjective(event.target.value)}
      >
        {objectives.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </NativeSelect>
      <NativeSelect
        aria-label="Zorluk"
        value={difficulty}
        onChange={(event) => setDifficulty(event.target.value)}
      >
        <option value="ALL">Tüm zorluklar</option>
        <option value="EASY">Başlangıç</option>
        <option value="MEDIUM">Orta</option>
        <option value="HARD">İleri</option>
      </NativeSelect>
      <Button
        type="button"
        variant="ghost"
        disabled={!hasFilters && !searchDraft}
        onClick={() => {
          setSearchDraft('');
          setSearch('');
          setAgeGroup('');
          setObjective('ALL');
          setDifficulty('ALL');
          setSource('ALL');
        }}
      >
        <Funnel /> Filtreleri temizle
      </Button>
    </>
  );
  return (
    <Tabs
      className="library-reference__tabs"
      value={category}
      onValueChange={setCategory}
    >
      <section className="library-reference__catalog">
        <header className="library-reference__catalog-head">
          <div>
            <p className="page-kicker">Egzersiz kataloğu</p>
            <h2>Antrenman İçerikleri</h2>
            <p>
              Sunucu tarafında filtrelenen kategori ve sayfalı gerçek kayıtlar.
            </p>
          </div>
          <div
            className="library-reference__source-tabs"
            aria-label="İçerik kaynağı"
          >
            {sources.map((item) => (
              <Button
                key={item.value}
                type="button"
                size="sm"
                variant={source === item.value ? 'default' : 'outline'}
                aria-pressed={source === item.value}
                onClick={() => setSource(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </header>
        <div
          className="library-reference__filters library-reference__filters--desktop"
          aria-label="Egzersiz filtreleri"
        >
          {renderFilterFields()}
        </div>
        <div className="library-reference__mobile-filter">
          <Sheet>
            <SheetTrigger asChild>
              <Button type="button" variant="outline">
                <SlidersHorizontal /> Filtreler
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Egzersiz filtreleri</SheetTitle>
                <SheetDescription>
                  Yaşa, amaca ve zorluk seviyesine uygun çalışmaları daraltın.
                </SheetDescription>
              </SheetHeader>
              <div className="library-reference__filters library-reference__filters--sheet">
                {renderFilterFields()}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <TabsList className="library-tabs">
          {phases.map((phase) => (
            <TabsTrigger key={phase.value} value={phase.value}>
              {phase.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={category}>
          <LibraryPage
            key={JSON.stringify([category, filters])}
            groupId={groupId}
            category={category === 'ALL' ? undefined : (category as DrillPhase)}
            filters={filters}
            categoryLabel={
              phases.find((phase) => phase.value === category)?.label ?? 'Tümü'
            }
          />
        </TabsContent>
      </section>
    </Tabs>
  );
}
function LibraryPage({
  groupId,
  category,
  categoryLabel,
  filters,
}: {
  groupId: string;
  category?: DrillPhase;
  categoryLabel: string;
  filters: DrillCatalogFilters;
}) {
  const load = useCallback(
    (after?: string) =>
      Object.values(filters).some(Boolean)
        ? getFilteredDrillPage(groupId, category, filters, after)
        : getDrillPage(groupId, category, after),
    [category, filters, groupId],
  );
  const state = useAssignmentPage(load);
  const page = state.data;
  return (
    <div className="library-reference__catalog-body">
      {page && (
        <>
          <p className="sr-only" aria-label="Egzersiz kapsamı özeti">
            {page.total} egzersiz
          </p>
          <section
            className="library-reference__metrics"
            aria-label="Egzersiz özeti"
          >
            <MetricCard
              icon={Books}
              label="Toplam egzersiz"
              value={page.total}
              detail="Aktif kategori toplamı"
            />
            <MetricCard
              icon={Strategy}
              label="Aktif filtre"
              value={categoryLabel}
              detail="Sunucu tarafında uygulanır"
              tone="violet"
            />
            <MetricCard
              icon={Clock}
              label="Bu sayfa"
              value={page.items.length}
              detail={`Sayfa ${state.pageNumber}`}
              tone="teal"
            />
          </section>
        </>
      )}
      <div className="library-reference__results">
        {state.loading ? (
          <div role="status" aria-label="Egzersizler yükleniyor">
            <Skeleton className="h-48" />
          </div>
        ) : state.error ? (
          <Alert role="alert">
            <AlertDescription>{state.error}</AlertDescription>
            <Button onClick={state.retry}>Tekrar dene</Button>
          </Alert>
        ) : !page?.items.length && state.pageNumber > 1 ? (
          <p>Bu sayfada egzersiz yok</p>
        ) : (
          <DrillGrid drills={page?.items ?? []} />
        )}
      </div>
      <nav aria-label="Egzersiz sayfaları">
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
          {page ? ` · ${page.items.length} / ${page.total} egzersiz` : ''}
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
    </div>
  );
}
function DrillGrid({ drills }: { drills: DrillCatalogItem[] }) {
  if (!drills.length)
    return (
      <div className="empty-state">
        <Books weight="duotone" />
        <h2>Bu kategoride egzersiz yok</h2>
        <p>Kulüp egzersizleri oluşturulduğunda burada görünecek.</p>
      </div>
    );
  return (
    <div className="catalog-grid">
      {drills.map((drill) => {
        const board = drill.isBoard;
        const card = (
          <FootballCard
            tone={board ? 'board' : 'default'}
            title={drill.title}
            badge={
              <div className="library-reference__badges">
                <Badge
                  variant={drill.scope === 'GLOBAL' ? 'secondary' : 'default'}
                >
                  {sourceLabel(drill)}
                </Badge>
                {drill.source?.license === 'LEGACY_UNVERIFIED' ? (
                  <Badge variant="outline">Kaynak doğrulanmadı</Badge>
                ) : null}
              </div>
            }
            metadata={
              <>
                <span>
                  <Clock /> {drill.durationMin} dk
                </span>
                <span>{phaseLabel(drill.category)}</span>
                <span>{difficultyLabel(drill.difficulty)}</span>
                {drill.playerMin && drill.playerMax ? (
                  <span>
                    <Users /> {drill.playerMin}–{drill.playerMax}
                  </span>
                ) : null}
                {drill.areaLengthM && drill.areaWidthM ? (
                  <span>
                    <Ruler /> {drill.areaLengthM}×{drill.areaWidthM} m
                  </span>
                ) : null}
              </>
            }
            detail={
              <div className="library-reference__card-detail">
                {drill.objectiveLabel ? (
                  <strong>{drill.objectiveLabel}</strong>
                ) : null}
                <p>
                  {drill.summary ||
                    drill.equipment ||
                    'Ayrıntılar egzersiz kartında.'}
                </p>
              </div>
            }
            action={
              <>
                <Strategy /> Egzersizi incele
              </>
            }
          />
        );
        return (
          <Link
            className="list-link"
            to={`/app/library/${drill.id}`}
            key={drill.id}
          >
            {card}
          </Link>
        );
      })}
    </div>
  );
}

function sourceLabel(drill: DrillCatalogItem) {
  if (drill.scope === 'CLUB') return 'Kulüp';
  if (drill.source?.kind === 'NGCS_ORIGINAL') return 'NGCS';
  if (drill.source?.kind === 'OPEN_LICENSE') return 'Açık lisans';
  return 'Global';
}

function difficultyLabel(value: DrillCatalogItem['difficulty']) {
  return { EASY: 'Başlangıç', MEDIUM: 'Orta', HARD: 'İleri' }[value];
}

function phaseLabel(value: DrillPhase) {
  return {
    WARM_UP: 'Isınma',
    TECHNICAL: 'Teknik',
    TACTICAL: 'Taktik',
    COOL_DOWN: 'Soğuma',
  }[value];
}
