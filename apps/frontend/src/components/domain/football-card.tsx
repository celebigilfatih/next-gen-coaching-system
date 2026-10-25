import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

type FootballCardTone = 'default' | 'board' | 'match';

type FootballCardProps = Omit<ComponentProps<typeof Card>, 'title'> & {
  title: ReactNode;
  badge?: ReactNode;
  description?: ReactNode;
  metadata?: ReactNode;
  detail?: ReactNode;
  action?: ReactNode;
  preview?: ReactNode;
  tone?: FootballCardTone;
};

function FootballCard({
  title,
  badge,
  description,
  metadata,
  detail,
  action,
  preview,
  tone = 'default',
  className,
  ...props
}: FootballCardProps) {
  return (
    <Card
      data-slot="football-card"
      data-tone={tone}
      className={cn(
        'grid h-full content-start overflow-hidden',
        tone === 'board' && 'border-t-[3px] border-t-primary',
        tone === 'match' && 'border-t-[3px] border-t-warning',
        className,
      )}
      {...props}
    >
      {preview ? (
        <div
          aria-hidden="true"
          data-slot="football-card-preview"
          className="grid min-h-[120px] place-items-center rounded-t-[9px] bg-[linear-gradient(145deg,#116b42,#1a9057)] text-[#d9f8e6] [&_svg]:size-[53px]"
        >
          {preview}
        </div>
      ) : null}
      <CardHeader>
        <div className="flex min-w-0 items-start justify-between gap-3">
          <CardTitle className="min-w-0 break-words">{title}</CardTitle>
          {badge ? <div className="shrink-0">{badge}</div> : null}
        </div>
        {description ? (
          <CardDescription className="break-words leading-relaxed">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      {metadata || detail || action ? (
        <CardContent className="grid gap-3.5">
          {metadata ? (
            <div
              data-slot="football-card-metadata"
              className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[13px] text-muted-foreground [&>span]:inline-flex [&>span]:min-w-0 [&>span]:items-center [&>span]:gap-1.5"
            >
              {metadata}
            </div>
          ) : null}
          {detail ? <div data-slot="football-card-detail">{detail}</div> : null}
          {action ? (
            <div
              data-slot="football-card-action"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary [&>svg]:shrink-0"
            >
              {action}
            </div>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}

export { FootballCard };
export type { FootballCardProps, FootballCardTone };
