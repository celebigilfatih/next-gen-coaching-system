import type { ReactNode } from 'react';
import { Alert, AlertDescription } from '../ui/alert';

// Presentation only: the caller owns control props, validation and submission.
export function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div data-slot="form-field" className="grid gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="text-base font-normal">{children}</div>
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <Alert role="alert" className="mt-4 border-destructive/30 text-destructive">
      <AlertDescription className="break-words text-destructive">
        {message}
      </AlertDescription>
    </Alert>
  );
}
