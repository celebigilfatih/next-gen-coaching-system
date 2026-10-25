import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageActions, PageContainer, PageHeader } from './page-layout';
import { Button } from '../ui/button';

describe('shared page layout', () => {
  it('preserves container props, ref and optional readable width', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <PageContainer
        ref={ref}
        width="readable"
        aria-label="Settings"
        className="custom"
      >
        Content
      </PageContainer>,
    );
    expect(ref.current).toBe(screen.getByLabelText('Settings'));
    expect(ref.current).toHaveClass(
      'custom',
      'max-w-[var(--page-readable-width)]',
    );
    expect(ref.current).not.toHaveClass('page-shell');
  });

  it('renders one heading, optional copy and real link/button actions', () => {
    render(
      <PageHeader
        title="Overview"
        eyebrow="Workspace"
        description="Selected team"
        actions={
          <>
            <Button asChild>
              <a href="/app/trainings">Plan</a>
            </Button>
            <Button>Refresh</Button>
          </>
        }
      />,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Overview',
    );
    expect(screen.getByText('Selected team')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Plan' })).toHaveAttribute(
      'href',
      '/app/trainings',
    );
    expect(
      screen.getByRole('button', { name: 'Refresh' }).parentElement,
    ).toHaveClass('text-sm', 'font-semibold');
  });

  it('does not create empty descriptions or actions and supports start alignment', () => {
    const view = render(
      <PageContainer>
        <PageHeader title="Minimal" />
      </PageContainer>,
    );
    expect(view.container.querySelector('p')).toBeNull();
    expect(
      view.container.querySelector('[data-slot="page-actions"]'),
    ).toBeNull();
    view.rerender(
      <PageActions align="start" aria-label="Account actions">
        Action
      </PageActions>,
    );
    expect(screen.getByLabelText('Account actions')).toHaveClass(
      'justify-start',
    );
  });
});
