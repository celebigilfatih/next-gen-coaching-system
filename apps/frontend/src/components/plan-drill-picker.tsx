import { useCallback, useRef, useState } from 'react';
import {
  getFilteredDrillPage,
  type DrillCatalogItem,
  type DrillPhase,
  type DrillCatalogFilters,
} from '../lib/api';
import { useAssignmentPage } from '../lib/use-assignment-page';
import { Button } from './ui/button';
import { NativeSelect } from './ui/native-select';
import {
  DrillCatalogFilterFields,
  useDrillCatalogFilters,
  drillPhases,
  supportedDrillAges,
} from './drill-catalog-filters';
import { DrillPreview } from './drill-preview';

export function PlanDrillPicker({
  groupId,
  attachedIds,
  onAdd,
  ageGroup,
}: {
  groupId: string;
  attachedIds: string[];
  onAdd: (drill: DrillCatalogItem) => Promise<void>;
  ageGroup?: string;
}) {
  const { draft, setDraft, filters } = useDrillCatalogFilters();
  const [phase, setPhase] = useState<DrillPhase>();
  return (
    <div className="plan-drill-catalog">
      <details>
        <summary>Hazır egzersizleri filtrele</summary>
        <DrillCatalogFilterFields
          value={draft}
          onChange={setDraft}
          allowAge={false}
        />
      </details>
      <label className="grid gap-2 py-2 text-sm">
        Egzersiz fazı
        <NativeSelect
          aria-label="Egzersiz fazı"
          value={phase ?? ''}
          onChange={(e) =>
            setPhase((e.target.value || undefined) as DrillPhase | undefined)
          }
        >
          <option value="">Tüm fazlar</option>
          {drillPhases.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </NativeSelect>
      </label>
      <PlanDrillChoices
        key={JSON.stringify([groupId, ageGroup, phase, filters])}
        groupId={groupId}
        attachedIds={attachedIds}
        onAdd={onAdd}
        phase={phase}
        filters={filters}
        ageGroup={ageGroup}
      />
    </div>
  );
}

function PlanDrillChoices({
  groupId,
  attachedIds,
  onAdd,
  phase,
  filters,
  ageGroup,
}: {
  groupId: string;
  attachedIds: string[];
  onAdd: (drill: DrillCatalogItem) => Promise<void>;
  phase?: DrillPhase;
  filters: DrillCatalogFilters;
  ageGroup?: string;
}) {
  const load = useCallback(
    (after?: string) =>
      getFilteredDrillPage(
        groupId,
        phase,
        { ...filters, collection: 'ngcs-starter-v1', ageScope: 'TEAM' },
        after,
      ),
    [groupId, phase, filters],
  );
  const page = useAssignmentPage(load);
  const [selected, setSelected] = useState<DrillCatalogItem>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<DrillCatalogItem>();
  const writing = useRef(false);
  const rows = (page.data?.items ?? []).filter(
    (row) => !attachedIds.includes(row.id),
  );
  const choice =
    selected && !attachedIds.includes(selected.id) ? selected : undefined;
  const options =
    choice && !rows.some((row) => row.id === choice.id)
      ? [choice, ...rows]
      : rows;
  async function add() {
    if (!choice || writing.current) return;
    writing.current = true;
    setSaving(true);
    setError('');
    try {
      await onAdd(choice);
      setSelected(undefined);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Egzersiz eklenemedi.');
    } finally {
      writing.current = false;
      setSaving(false);
    }
  }
  return (
    <div>
      {page.data?.ageGroup &&
        !supportedDrillAges.includes(page.data.ageGroup) && (
          <p>
            Hazır egzersiz paketinde {page.data.ageGroup} uyarlaması bulunmuyor.
          </p>
        )}
      <div className="plan-add-drill">
        <label htmlFor="plan-drill-select">Egzersiz ekle</label>
        <select
          id="plan-drill-select"
          value={choice?.id ?? ''}
          disabled={saving || page.loading || Boolean(page.error)}
          onChange={(e) => {
            setSelected(options.find((row) => row.id === e.target.value));
            setError('');
          }}
        >
          <option value="">Kütüphaneden seçin</option>
          {options.map((row) => (
            <option key={row.id} value={row.id}>
              {row.title} ·{' '}
              {
                {
                  WARM_UP: 'Isınma',
                  TECHNICAL: 'Teknik',
                  TACTICAL: 'Taktik',
                  COOL_DOWN: 'Soğuma',
                }[row.category]
              }
            </option>
          ))}
        </select>
        <Button
          disabled={!choice || saving || page.loading || Boolean(page.error)}
          onClick={() => void add()}
        >
          {saving ? 'Ekleniyor…' : 'Plana ekle'}
        </Button>
      </div>
      {error && <p role="alert">{error}</p>}
      {choice && (
        <article
          className="drill-choice-summary"
          aria-label="Seçilen egzersiz özeti"
        >
          <strong>{choice.title}</strong>
          <p>
            {choice.summary ||
              choice.equipment ||
              'Uygulamayı önizlemeden inceleyin.'}
          </p>
          <p>
            {choice.ageGroup} · {choice.durationMin} dk
            {choice.playerMin && choice.playerMax
              ? ` · ${choice.playerMin}–${choice.playerMax} oyuncu`
              : ''}
            {choice.areaLengthM && choice.areaWidthM
              ? ` · ${choice.areaLengthM}×${choice.areaWidthM} m`
              : ''}
          </p>
          <Button
            id="plan-drill-preview-trigger"
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => setPreview(choice)}
          >
            Uygulamayı ve sahayı incele
          </Button>
        </article>
      )}
      {preview && (
        <DrillPreview
          key={preview.id}
          drillId={preview.id}
          ageGroup={preview.ageGroup ?? ageGroup}
          catalogItem={preview}
          returnFocusId="plan-drill-preview-trigger"
          onClose={() => setPreview(undefined)}
        />
      )}
      {page.loading ? (
        <p role="status">Egzersiz seçenekleri yükleniyor…</p>
      ) : page.error ? (
        <div role="alert">
          {page.error}
          <Button onClick={page.retry}>Tekrar dene</Button>
        </div>
      ) : !rows.length ? (
        <p>Bu sayfada eklenebilir egzersiz yok.</p>
      ) : null}
      <nav
        aria-label="Egzersiz seçenek sayfaları"
        className="flex flex-wrap items-center gap-3 py-4"
      >
        <Button
          variant="outline"
          disabled={saving || page.loading || page.pageNumber === 1}
          onClick={page.previous}
        >
          Önceki egzersizler
        </Button>
        <span role="status">
          Sayfa {page.pageNumber}
          {page.data
            ? ` · ${page.data.items.length} / ${page.data.total} katalog kaydı`
            : ''}
        </span>
        <Button
          variant="outline"
          disabled={saving || page.loading || !page.data?.nextCursor}
          onClick={() => {
            if (page.data?.nextCursor) page.next(page.data.nextCursor);
          }}
        >
          Sonraki egzersizler
        </Button>
      </nav>
      <p className="text-sm text-muted-foreground">
        Yalnız takımın yaşına uygun hazır egzersizler listelenir. Toplam,
        plandaki egzersizleri de içerir; planda olanlar seçimde gösterilmez.
      </p>
    </div>
  );
}
