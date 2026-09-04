import * as React from 'react';
import { cn } from '../../lib/utils';

function Alert({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="alert"
      className={cn(
        'grid gap-1 rounded-lg border border-border bg-white p-4 text-sm',
        className,
      )}
      {...props}
    />
  );
}
function AlertTitle({ className, ...props }: React.ComponentProps<'h5'>) {
  return <h5 className={cn('font-semibold', className)} {...props} />;
}
function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div className={cn('text-muted-foreground', className)} {...props} />;
}
export { Alert, AlertDescription, AlertTitle };
