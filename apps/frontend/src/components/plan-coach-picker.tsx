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
    <div className="plan-coach-picker grid gap-2">
      <div className="plan-coach-picker-heading">
        <label htmlFor="training-plan-coach">Sorumlu antrenör</label>
        <Button
          type="button"
          variant="ghost"
          aria-label="Antrenörleri yenile"
          disabled={disabled || page.loading}
          onClick={() => {
            setPinned(undefined);
            onChange('');
            void page.reload();
          }}
        >
          Yenile
        </Button>
      </div>
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
          aria-label="Önceki antrenörler"
          disabled={disabled || page.loading || page.pageNumber === 1}
          onClick={page.previous}
        >
          Önceki
        </Button>
        <span>Sayfa {page.pageNumber}</span>
        <Button
          type="button"
          variant="outline"
          aria-label="Sonraki antrenörler"
          disabled={disabled || page.loading || !page.data?.nextCursor}
          onClick={() => {
            if (page.data?.nextCursor) page.next(page.data.nextCursor);
          }}
        >
          Sonraki
        </Button>
      </nav>
    </div>
  );
}
