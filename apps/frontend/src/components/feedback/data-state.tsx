import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

export function LoadingState({
  label,
  count = 1,
  skeletonClassName,
}: {
  label: string;
  count?: number;
  skeletonClassName: string;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className="grid grid-cols-3 gap-4 max-[640px]:grid-cols-1"
    >
      {Array.from({ length: count }, (_, index) => (
        <Skeleton
          key={index}
          aria-hidden="true"
          className={skeletonClassName}
        />
      ))}
    </div>
  );
}

export function ErrorState({
  title,
  message,
  onRetry,
  className,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <Alert
      className={cn(
        'min-w-0 border-destructive/20 bg-destructive/5',
        className,
      )}
    >
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="break-words">{message}</AlertDescription>
      {onRetry && (
        <div className="mt-2 text-sm font-semibold">
          <Button type="button" variant="outline" onClick={onRetry}>
            Tekrar dene
          </Button>
        </div>
      )}
    </Alert>
  );
}

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="grid min-h-[300px] place-content-center justify-items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-11 text-center sm:px-11">
      <div aria-hidden="true" className="text-muted-foreground [&_svg]:size-12">
        {icon}
      </div>
      <h2 className="font-[Barlow_Condensed] text-[26px] font-semibold leading-none text-foreground">
        {title}
      </h2>
      <p className="max-w-[480px] break-words text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
