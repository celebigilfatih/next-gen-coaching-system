import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function PageContainer({
  className,
  width = 'full',
  ...props
}: ComponentProps<'div'> & { width?: 'full' | 'readable' }) {
  return (
    <div
      data-slot="page-container"
      className={cn(
        'min-h-[calc(100vh-var(--layout-topbar-height))] min-w-0 w-full px-[var(--page-gutter)] pt-[var(--page-padding-top)] pb-[var(--page-padding-bottom)] max-[640px]:min-h-[calc(100vh-132px)] max-[640px]:px-4 max-[640px]:pt-6 max-[640px]:pb-9',
        width === 'readable' && 'max-w-[var(--page-readable-width)]',
        className,
      )}
      {...props}
    />
  );
}

export function PageActions({
  className,
  align = 'end',
  ...props
}: ComponentProps<'div'> & { align?: 'start' | 'end' }) {
  return (
    <div
      data-slot="page-actions"
      className={cn(
        'flex flex-wrap gap-2.5 text-sm font-semibold max-[640px]:justify-start',
        align === 'start' ? 'justify-start' : 'justify-end',
        className,
      )}
      {...props}
    />
  );
}

export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
}: {
  title: ReactNode;
  eyebrow?: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header
      data-slot="page-header"
      className="mb-[var(--page-section-gap)] flex items-start justify-between gap-6 max-[640px]:mb-[22px] max-[640px]:grid"
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="m-0 mb-[7px] text-[11px] font-extrabold tracking-[0.14em] text-[var(--blue)] uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="m-0 font-[family-name:var(--font-display)] text-[clamp(34px,4vw,48px)] leading-[0.95] font-semibold tracking-[-0.02em] text-[var(--ink)]">
          {title}
        </h1>
        {description && (
          <p className="m-0 mt-2.5 text-sm leading-normal text-[var(--legacy-muted-foreground)]">
            {description}
          </p>
        )}
      </div>
      {actions && <PageActions>{actions}</PageActions>}
    </header>
  );
}
