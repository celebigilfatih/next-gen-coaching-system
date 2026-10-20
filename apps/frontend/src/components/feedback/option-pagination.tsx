import { Button } from '../ui/button';

// Compact option lists keep their own selection, cursor and success policies.
export function OptionPagination({
  label,
  pageNumber,
  previousLabel,
  nextLabel,
  previousDisabled,
  nextDisabled,
  onPrevious,
  onNext,
}: {
  label: string;
  pageNumber: number;
  previousLabel: string;
  nextLabel: string;
  previousDisabled: boolean;
  nextDisabled: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex min-w-0 flex-wrap items-center gap-2 pt-1 text-xs font-semibold"
    >
      <Button
        type="button"
        size="sm"
        variant="ghost"
        aria-label={previousLabel}
        disabled={previousDisabled}
        onClick={onPrevious}
      >
        Önceki
      </Button>
      <span aria-live="polite" className="tabular-nums">
        {pageNumber}
      </span>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        aria-label={nextLabel}
        disabled={nextDisabled}
        onClick={onNext}
      >
        Sonraki
      </Button>
    </div>
  );
}
