import type { ComponentType, ReactNode } from 'react';
import { Card, CardContent } from '../ui/card';

type MetricCardProps = {
  icon: ComponentType<{ weight?: 'duotone' }>;
  label: string;
  value: ReactNode;
  detail: string;
  ariaLabel?: string;
  tone?: 'blue' | 'violet' | 'amber' | 'teal';
};

/** A compact metric with an icon, a live value, and its source context. */
export function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  ariaLabel,
  tone = 'blue',
}: MetricCardProps) {
  return (
    <Card
      className={`metric-card metric-card--${tone}`}
      aria-label={ariaLabel ?? `${label} özeti`}
    >
      <CardContent>
        <span className="metric-card-icon">
          <Icon weight="duotone" />
        </span>
        <span className="metric-card-copy">
          <small>{label}</small>
          <strong>{value}</strong>
          <em>{detail}</em>
        </span>
      </CardContent>
    </Card>
  );
}
