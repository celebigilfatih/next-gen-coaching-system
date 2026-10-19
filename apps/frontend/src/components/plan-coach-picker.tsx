import { useCallback, useState } from 'react';
import { getAccountPage } from '../lib/api';
import { useAssignmentPage } from '../lib/use-assignment-page';
import { Button } from './ui/button';
import { NativeSelect } from './ui/native-select';

export function PlanCoachPicker({
  clubId,
  value,
  onChange,
  disabled,
}: {
  clubId: string;
  value: string;
  onChange: (id: string) => void;
  disabled: boolean;
}) {
  const load = useCallback(
    (after?: string) =>
      getAccountPage({ clubId, role: 'COACH', status: 'ACTIVE', after }),
    [clubId],
  );
  const page = useAssignmentPage(load);
  const [pinned, setPinned] = useState<{ id: string; name: string }>();
  const rows = page.data?.items ?? [];
  const options =
    pinned && !rows.some((item) => item.id === pinned.id)
      ? [pinned, ...rows]
      : rows;
  return (
    <div className="grid gap-2">
      <label htmlFor="training-plan-coach">Sorumlu antrenör</label>
      <NativeSelect
        id="training-plan-coach"
        disabled={disabled || page.loading || Boolean(page.error)}
        value={value}
        onChange={(event) => {
          setPinned(options.find((item) => item.id === event.target.value));
          onChange(event.target.value);
        }}
      >
        <option value="">Antrenör seçin</option>
        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </NativeSelect>
      {page.loading ? (
        <p role="status">Antrenörler yükleniyor…</p>
      ) : page.error ? (
        <div role="alert">
          {page.error}
          <Button type="button" onClick={page.retry}>
            Antrenörleri tekrar yükle
          </Button>
        </div>
      ) : (
        !rows.length && (
          <p>
            Bu kulüpte aktif antrenör hesabı bulunmuyor. Plan oluşturmak için
            mevcut hesap yönetiminden bir antrenör atanmalıdır.
          </p>
        )
      )}
      <nav
        aria-label="Antrenör seçenek sayfaları"
        className="drill-picker-pagination"
      >
        <Button
          type="button"
          variant="outline"
          disabled={disabled || page.loading || page.pageNumber === 1}
          onClick={page.previous}
        >
          Önceki antrenörler
        </Button>
        <span>Sayfa {page.pageNumber}</span>
        <Button
          type="button"
          variant="outline"
          disabled={disabled || page.loading || !page.data?.nextCursor}
          onClick={() => {
            if (page.data?.nextCursor) page.next(page.data.nextCursor);
          }}
        >
          Sonraki antrenörler
        </Button>
      </nav>
    </div>
  );
}
