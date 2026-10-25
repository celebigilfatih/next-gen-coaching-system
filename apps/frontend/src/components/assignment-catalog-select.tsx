import { useCallback, useId, useState } from 'react';
import { getAssignmentOptions } from '../lib/api';
import { useAssignmentPage } from '../lib/use-assignment-page';
import { Button } from './ui/button';
import { FormField } from './forms/form-field';
import { NativeSelect } from './ui/native-select';
import { OptionPagination } from './feedback/option-pagination';

export function AssignmentCatalogSelect({
  kind,
  clubId,
  name,
  label,
  onSelect,
}: {
  kind: 'teams' | 'roles';
  clubId: string;
  name: string;
  label: string;
  onSelect: (id: string) => void;
}) {
  const id = useId();
  const load = useCallback(
    (after?: string) => getAssignmentOptions(kind, clubId, after),
    [kind, clubId],
  );
  const state = useAssignmentPage(load);
  const [selected, setSelected] = useState<{ id: string; name: string }>();
  const rows = state.data?.items ?? [];
  const options =
    selected && !rows.some((row) => row.id === selected.id)
      ? [selected, ...rows]
      : rows;
  return (
    <div className="min-w-0">
      <FormField label={label} htmlFor={id}>
        <NativeSelect
          id={id}
          name={name}
          aria-label={label}
          required
          value={selected?.id ?? ''}
          disabled={state.loading || Boolean(state.error)}
          onChange={(event) => {
            const next = options.find((row) => row.id === event.target.value);
            setSelected(next);
            onSelect(next?.id ?? '');
          }}
        >
          <option value="" disabled>
            Seçin
          </option>
          {options.map((row) => (
            <option key={row.id} value={row.id}>
              {row.name}
            </option>
          ))}
        </NativeSelect>
      </FormField>
      {state.loading && <p role="status">Seçenekler yükleniyor…</p>}
      {state.error && (
        <div role="alert">
          {state.error}
          <Button type="button" variant="ghost" onClick={state.retry}>
            Tekrar dene
          </Button>
        </div>
      )}
      {!state.loading && !state.error && !rows.length && (
        <p>Bu sayfada seçenek yok.</p>
      )}
      <OptionPagination
        label={`${label} sayfaları`}
        pageNumber={state.pageNumber}
        previousDisabled={state.loading || state.pageNumber === 1}
        previousLabel={`Önceki ${label} seçenekleri`}
        onPrevious={state.previous}
        nextDisabled={state.loading || !state.data?.nextCursor}
        nextLabel={`Sonraki ${label} seçenekleri`}
        onNext={() => {
          if (state.data?.nextCursor) state.next(state.data.nextCursor);
        }}
      />
    </div>
  );
}
