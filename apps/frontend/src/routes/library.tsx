import {
  Books,
  CaretLeft,
  CaretRight,
  Clock,
  Eye,
  Ruler,
  SlidersHorizontal,
  Users,
} from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { Link } from 'react-router';
import {
  DrillCatalogFilterFields,
  useDrillCatalogFilters,
} from '../components/drill-catalog-filters';
import { DrillPreview } from '../components/drill-preview';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';
import { Skeleton } from '../components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import {
  getFilteredDrillPage,
  type DrillCatalogItem,
  type DrillCatalogFilters,
  type DrillPhase,
} from '../lib/api';
import { useAssignmentPage } from '../lib/use-assignment-page';
import { useWorkspace } from '../lib/workspace-context';
import { getSession } from '../lib/session';
import '../styles/library-workspace.css';

const phases: { value: 'ALL' | DrillPhase; label: string }[] = [
  { value: 'ALL', label: 'Tümü' },
  { value: 'WARM_UP', label: 'Isınma' },
  { value: 'TECHNICAL', label: 'Teknik' },
  { value: 'TACTICAL', label: 'Taktik' },
  { value: 'COOL_DOWN', label: 'Soğuma' },
];
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
  return (
    <div className="page-shell library-workspace">
      <header className="library-heading">
        <div>
          <h1>Egzersiz Kütüphanesi</h1>
          <p>
            Hazır egzersiz paketini inceleyin; yaşa ve çalışma amacına göre
            planınıza ekleyin.
          </p>
        </div>
        <div className="library-heading-actions">
          {getSession()?.user.role === 'SYSTEM_ADMIN' && (
            <Button asChild variant="outline">
              <Link to="/app/library/manage">İçerik yönetimi</Link>
            </Button>
          )}
        </div>
      </header>
      {loading ? (
        <Skeleton className="h-48" />
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
  const { draft, setDraft, filters } = useDrillCatalogFilters();
  const advancedCount = Object.entries(draft).filter(
    ([key, value]) =>
      key !== 'q' && key !== 'source' && value !== undefined && value !== '',
  ).length;
  return (
    <Tabs
      className="library-panel"
      value={category}
      onValueChange={setCategory}
    >
      <header className="library-panel-heading">
        <div>
          <h2>Hazır Egzersizler</h2>
          <p>
            Önizlemeyle çalışmayı tanıyın; detayından mevcut bir plana ekleyin.
          </p>
        </div>
      </header>
      <div className="library-toolbar">
        <label className="library-search">
          Egzersiz ara
          <Input
            aria-label="Egzersiz ara"
            maxLength={80}
            placeholder="Başlık, amaç veya etiket ara"
            value={draft.q ?? ''}
            onChange={(e) => setDraft({ ...draft, q: e.target.value })}
          />
        </label>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal /> Filtreler
              {advancedCount > 0 ? ' (' + advancedCount + ')' : ''}
            </Button>
          </SheetTrigger>
          <SheetContent className="library-filter-panel">
            <SheetHeader>
              <SheetTitle>Egzersiz filtreleri</SheetTitle>
              <SheetDescription>
                Yaş, amaç, süre ve oyuncu sayısına göre daraltın. Sonuçlar
                anında güncellenir.
              </SheetDescription>
            </SheetHeader>
            <div className="library-filter-scroll">
              <DrillCatalogFilterFields
                value={draft}
                onChange={setDraft}
                showSearch={false}
                defaultAgeLabel="Tüm yaş grupları"
              />
            </div>
            <footer>
              <SheetClose asChild>
                <Button>Sonuçları göster</Button>
              </SheetClose>
            </footer>
          </SheetContent>
        </Sheet>
        {Object.values(draft).some(Boolean) && (
          <Button variant="ghost" onClick={() => setDraft({})}>
            Tümünü temizle
          </Button>
        )}
      </div>
      {advancedCount > 0 && (
        <p className="library-active-filters" role="status">
          {advancedCount} ayrıntılı filtre etkin
          {draft.ageGroup
            ? ' · ' + (draft.ageGroup === 'SENIOR' ? 'A Takım' : draft.ageGroup)
            : ''}
          {draft.minDuration ? ' · En az ' + draft.minDuration + ' dk' : ''}
          {draft.maxDuration ? ' · En çok ' + draft.maxDuration + ' dk' : ''}
        </p>
      )}
      <TabsList className="library-phases" aria-label="Egzersiz fazı">
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
        />
      </TabsContent>
    </Tabs>
  );
}
function LibraryPage({
  groupId,
  category,
  filters,
}: {
  groupId: string;
  category?: DrillPhase;
  filters: DrillCatalogFilters;
}) {
  const load = useCallback(
    (after?: string) =>
      getFilteredDrillPage(
        groupId,
        category,
        { ...filters, collection: 'ngcs-starter-v1' },
        after,
      ),
    [category, filters, groupId],
  );
  const state = useAssignmentPage(load);
  const page = state.data;
  const [preview, setPreview] = useState<{
    drill: DrillCatalogItem;
    ageGroup?: string;
  }>();
  const pager = (bottom = false) => (
    <nav
      className="library-pager"
      aria-label={bottom ? 'Alt egzersiz sayfaları' : 'Egzersiz sayfaları'}
    >
      <p role="status">
        Sayfa {state.pageNumber}
        {page
          ? ' · ' + page.items.length + ' / ' + page.total + ' egzersiz'
          : ''}
      </p>
      <div>
        <Button
          variant="outline"
          size="icon"
          aria-label={bottom ? 'Önceki egzersiz sayfası' : 'Önceki sayfa'}
          disabled={state.loading || state.pageNumber === 1}
          onClick={state.previous}
        >
          <CaretLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label={bottom ? 'Sonraki egzersiz sayfası' : 'Sonraki sayfa'}
          disabled={state.loading || !page?.nextCursor}
          onClick={() => {
            if (page?.nextCursor) state.next(page.nextCursor);
          }}
        >
          <CaretRight />
        </Button>
      </div>
    </nav>
  );
  return (
    <div className="library-results">
      {page && (
        <div
          className="library-result-summary"
          aria-label="Egzersiz kapsamı özeti"
        >
          <strong>{page.total} egzersiz</strong>
          {page.ageGroup ? (
            <span>
              {page.ageGroup === 'SENIOR' ? 'A Takım' : page.ageGroup} için
              sonuçlar
            </span>
          ) : (
            <span>Tüm yaş grupları</span>
          )}
        </div>
      )}
      {pager()}
      {state.loading ? (
        <div role="status" aria-label="Egzersizler yükleniyor">
          <Skeleton className="h-48" />
        </div>
      ) : state.error ? (
        <Alert role="alert">
          <AlertDescription>{state.error}</AlertDescription>
          <Button onClick={state.retry}>Tekrar dene</Button>
        </Alert>
      ) : !page?.items.length ? (
        <div className="empty-state">
          <Books />
          <h2>
            {state.pageNumber > 1
              ? 'Bu sayfada egzersiz yok'
              : 'Bu kategoride egzersiz yok'}
          </h2>
          <p>
            Seçilen yaş ve filtreler için çalışma bulunamadı. Filtreleri
            temizleyebilir veya yaş seçimini kontrol edebilirsiniz.
          </p>
        </div>
      ) : (
        <ul className="library-register" aria-label="Egzersizler">
          {page.items.map((drill) => (
            <li key={drill.id}>
              <div className="library-drill-main">
                <div className="library-drill-title">
                  <Link to={'/app/library/' + drill.id}>{drill.title}</Link>
                  <Badge variant="secondary">{sourceLabel(drill)}</Badge>
                  {drill.source?.license === 'LEGACY_UNVERIFIED' && (
                    <Badge variant="outline">Kaynak doğrulanmadı</Badge>
                  )}
                </div>
                {drill.objectiveLabel && (
                  <strong className="library-objective">
                    {drill.objectiveLabel}
                  </strong>
                )}
                {drill.summary ? (
                  <details className="library-description">
                    <summary>Egzersiz açıklaması</summary>
                    <p>{drill.summary}</p>
                  </details>
                ) : (
                  <p>
                    {drill.equipment ||
                      'Uygulamayı egzersiz detayında inceleyin.'}
                  </p>
                )}
              </div>
              <div className="library-drill-facts">
                <span>
                  <Clock /> {drill.durationMin} dk
                </span>
                <span>
                  {phaseLabel(drill.category)} ·{' '}
                  {difficultyLabel(drill.difficulty)}
                </span>
                <span>
                  {drill.ageGroup === 'SENIOR' ? 'A Takım' : drill.ageGroup}
                </span>
                {drill.playerMin && drill.playerMax ? (
                  <span>
                    <Users /> {drill.playerMin}–{drill.playerMax} oyuncu
                  </span>
                ) : null}
                {drill.areaLengthM && drill.areaWidthM ? (
                  <span>
                    <Ruler /> {drill.areaLengthM}×{drill.areaWidthM} m
                  </span>
                ) : null}
              </div>
              <div className="library-drill-actions">
                <Button
                  id={'preview-' + drill.id}
                  variant="outline"
                  aria-label={drill.title + ' önizle'}
                  onClick={() =>
                    setPreview({
                      drill,
                      ageGroup: page.ageGroup ?? drill.ageGroup,
                    })
                  }
                >
                  <Eye /> Önizle
                </Button>
                <Button asChild variant="ghost">
                  <Link
                    to={'/app/library/' + drill.id}
                    aria-label={drill.title + ' detay'}
                  >
                    Detay <CaretRight />
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {pager(true)}
      {preview && (
        <DrillPreview
          key={JSON.stringify([preview.drill.id, preview.ageGroup])}
          drillId={preview.drill.id}
          ageGroup={preview.ageGroup}
          catalogItem={preview.drill}
          detailHref={'/app/library/' + preview.drill.id}
          returnFocusId={'preview-' + preview.drill.id}
          onClose={() => setPreview(undefined)}
        />
      )}
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
  return phases.find((phase) => phase.value === value)?.label ?? value;
}
