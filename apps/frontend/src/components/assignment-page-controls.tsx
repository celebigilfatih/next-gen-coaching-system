import { PagePagination } from './feedback/page-pagination';
import type { AssignmentPageInfo } from '../lib/api';

export function AssignmentPageControls({
  label,
  page,
  count,
  state,
}: {
  label: string;
  page?: AssignmentPageInfo;
  count: number;
  state: {
    loading: boolean;
    pageNumber: number;
    previous: () => void;
    next: (cursor: string) => void;
  };
}) {
  return (
    <PagePagination
      label={label}
      previousDisabled={state.loading || state.pageNumber === 1}
      onPrevious={state.previous}
      summary={
        <>
          Sayfa {state.pageNumber}
          {page ? ` · ${count} / ${page.total} atama` : ''}
        </>
      }
      nextDisabled={state.loading || !page?.nextCursor}
      onNext={() => {
        if (page?.nextCursor) state.next(page.nextCursor);
      }}
    />
  );
}
