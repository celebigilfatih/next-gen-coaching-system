import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';
import { WeekWorkspace } from './week';

function renderWorkspace() {
  return render(
    <MemoryRouter>
      <WeekWorkspace />
    </MemoryRouter>,
  );
}

describe('WeekWorkspace', () => {
  it('opens attendance and updates a player status', async () => {
    const user = userEvent.setup();
    renderWorkspace();

    await user.click(screen.getByRole('button', { name: /katılımı aç/i }));
    expect(screen.getByText(/6\/6 oyuncu mevcut/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /arda demir/i }));
    expect(screen.getByText(/5\/6 oyuncu mevcut/i)).toBeInTheDocument();
  });

  it('opens match analysis from match day', async () => {
    const user = userEvent.setup();
    renderWorkspace();

    await user.click(
      screen.getByRole('button', {
        name: /pzr 06 eylül, 15:00 maç, deplasman/i,
      }),
    );
    expect(
      screen.getByRole('heading', { name: 'Gençlerbirliği U17' }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/rakip ve taktik analizi/i),
    ).toBeInTheDocument();
  });
});
