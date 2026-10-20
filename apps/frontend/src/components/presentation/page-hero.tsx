import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  image?: string;
  className?: string;
};

/** A shared, content-led hero surface for the operational home views. */
export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  image,
  className,
}: PageHeroProps) {
  return (
    <section className={cn('page-hero', className)}>
      {image && (
        <img
          className="page-hero-image"
          src={image}
          alt=""
          aria-hidden="true"
        />
      )}
      <div className="page-hero-content">
        {eyebrow && <p className="page-hero-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-hero-description">{description}</p>}
        {actions && <div className="page-hero-actions">{actions}</div>}
      </div>
    </section>
  );
}
