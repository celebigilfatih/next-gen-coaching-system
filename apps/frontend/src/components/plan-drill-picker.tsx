import { useCallback, useState } from 'react';
import { getDrillPage, type DrillCatalogItem } from '../lib/api';
import { useAssignmentPage } from '../lib/use-assignment-page';
import { Button } from './ui/button';

export function PlanDrillPicker({
  groupId,
  attachedIds,
  onAdd,
}: {
  groupId: string;
  attachedIds: string[];
  onAdd: (drill: DrillCatalogItem) => Promise<void>;
}) {
  const load = useCallback(
    (after?: string) => getDrillPage(groupId, undefined, after),
    [groupId],
  );
  const page = useAssignmentPage(load);
  const [selected, setSelected] = useState<DrillCatalogItem>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
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
    if (!choice || saving) return;
    setSaving(true);
    setError('');
    try {
      await onAdd(choice);
      setSelected(undefined);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Egzersiz eklenemedi.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <div>
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
        Katalog toplamı plandaki egzersizleri de içerir. Planda olanlar seçimde
        gösterilmez.
      </p>
    </div>
  );
}
