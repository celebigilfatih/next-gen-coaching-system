import type { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

type SectionCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

/** A consistent heading and content frame for dashboard collections. */
export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName = 'dashboard-list',
}: SectionCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="section-card-header">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
