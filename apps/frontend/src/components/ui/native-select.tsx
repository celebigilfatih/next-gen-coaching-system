import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

// Keep native keyboard, validation and FormData semantics for existing forms.
export function NativeSelect({
  className,
  ...props
}: ComponentProps<'select'>) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        'h-10 min-w-0 w-full rounded-md border border-input bg-input-surface px-3 py-2 text-base font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
