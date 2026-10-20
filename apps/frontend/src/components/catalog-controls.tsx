import { useState } from 'react';
import { OptionPagination } from './feedback/option-pagination';
import { useWorkspace } from '../lib/workspace-context';
import type { WorkspaceCatalogs } from '../lib/api';

export function CatalogControls({
  kind,
  label,
}: {
  kind: keyof WorkspaceCatalogs;
  label: string;
}) {
  const {
    scope,
    catalogs,
    pageCatalog,
    catalogLoading,
    loading,
    catalogRevision,
  } = useWorkspace();
  return (
    <Controls
      key={`${scope.clubId}:${scope.clubSeasonId}:${scope.teamId}:${catalogRevision}`}
      kind={kind}
      label={label}
      nextCursor={catalogs[kind].nextCursor}
      disabled={loading || catalogLoading !== null}
      pageCatalog={pageCatalog}
    />
  );
}
function Controls({
  kind,
  label,
  nextCursor,
  disabled,
  pageCatalog,
}: {
  kind: keyof WorkspaceCatalogs;
  label: string;
  nextCursor: string | null;
  disabled: boolean;
  pageCatalog: (
    kind: keyof WorkspaceCatalogs,
    after?: string,
  ) => Promise<boolean>;
}) {
  const [cursors, setCursors] = useState<Array<string | undefined>>([
    undefined,
  ]);
  async function move(next: Array<string | undefined>) {
    if (await pageCatalog(kind, next[next.length - 1])) setCursors(next);
  }
  if (cursors.length === 1 && !nextCursor) return null;
  return (
    <OptionPagination
      label={`${label} seçenek sayfaları`}
      pageNumber={cursors.length}
      previousDisabled={disabled || cursors.length === 1}
      previousLabel={`Önceki ${label.toLocaleLowerCase('tr-TR')} seçenekleri`}
      onPrevious={() => void move(cursors.slice(0, -1))}
      nextDisabled={disabled || !nextCursor}
      nextLabel={`Sonraki ${label.toLocaleLowerCase('tr-TR')} seçenekleri`}
      onNext={() => {
        if (nextCursor) void move([...cursors, nextCursor]);
      }}
    />
  );
}
