import type { ReactNode } from 'react';
import { Button } from '../ui/button';

// Presentation only. Callers own cursor history, totals and request boundaries.
export function PagePagination({
  label,
  summary,
  previousDisabled,
  nextDisabled,
  onPrevious,
  onNext,
}: {
  label: string;
  summary: ReactNode;
  previousDisabled: boolean;
  nextDisabled: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <nav
      aria-label={label}
      className="grid grid-cols-2 items-center gap-3 py-4 text-sm font-semibold sm:flex sm:justify-between"
    >
      <Button
        type="button"
        variant="outline"
        className="justify-self-start"
        disabled={previousDisabled}
        onClick={onPrevious}
      >
        Önceki sayfa
      </Button>
      <p
        role="status"
        aria-live="polite"
        className="col-span-2 row-start-1 min-w-0 break-words text-center text-sm font-normal text-muted-foreground"
      >
        {summary}
      </p>
      <Button
        type="button"
        variant="outline"
        className="justify-self-end"
        disabled={nextDisabled}
        onClick={onNext}
      >
        Sonraki sayfa
      </Button>
    </nav>
  );
}
