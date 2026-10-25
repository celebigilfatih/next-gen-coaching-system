import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FootballCard } from './football-card';

describe('FootballCard', () => {
  it('composes the title, badge, description and metadata slots', () => {
    render(
      <FootballCard
        title="Transition game"
        badge={<span>Global</span>}
        description="Fast attack after recovery"
        metadata={
          <>
            <span>20 dk</span>
            <span>Taktik</span>
          </>
        }
      />,
    );

    const card = screen.getByText('Transition game').closest('[data-tone]');
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Transition game',
    );
    expect(screen.getByText('Global')).toBeInTheDocument();
    expect(screen.getByText('Fast attack after recovery')).toBeInTheDocument();
    expect(screen.getByText('20 dk').parentElement).toHaveAttribute(
      'data-slot',
      'football-card-metadata',
    );
    expect(card).toHaveAttribute('data-tone', 'default');
  });

  it('uses the match accent without changing forwarded card semantics', () => {
    render(
      <FootballCard
        aria-label="Match card"
        className="custom-card"
        tone="match"
        title="Opponent"
      />,
    );

    expect(screen.getByLabelText('Match card')).toHaveAttribute(
      'data-tone',
      'match',
    );
    expect(screen.getByLabelText('Match card')).toHaveClass(
      'border-t-warning',
      'custom-card',
    );
  });

  it('keeps the pitch preview decorative and exposes the action text', () => {
    render(
      <FootballCard
        tone="board"
        title="Pressing board"
        preview={<svg data-testid="pitch-icon" />}
        action="Takım tahtasını aç"
      />,
    );

    expect(screen.getByTestId('pitch-icon').parentElement).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(
      screen
        .getByText('Takım tahtasını aç')
        .closest('[data-slot="football-card-action"]'),
    ).toHaveAttribute('data-slot', 'football-card-action');
    expect(
      screen.getByText('Pressing board').closest('[data-tone]'),
    ).toHaveClass('border-t-primary');
  });

  it('omits unused optional regions', () => {
    const { container } = render(<FootballCard title="Minimal card" />);

    expect(
      container.querySelector('[data-slot="football-card-preview"]'),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="football-card-metadata"]'),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="football-card-action"]'),
    ).not.toBeInTheDocument();
  });
});
