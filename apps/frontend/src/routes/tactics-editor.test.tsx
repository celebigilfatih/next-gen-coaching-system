import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { TacticsEditorPage } from './tactics-editor';

vi.mock('../lib/workspace-context', () => ({
  useWorkspace: () => ({
    group: { id: 'group', name: 'U17', ageGroup: 'U18' },
    reload: vi.fn(),
  }),
}));
vi.mock('../lib/session', () => {
  const session = {
    user: { id: 'coach', role: 'COACH', clubId: 'club', name: 'Coach' },
  };
  return {
    subscribeSession: () => () => {},
    getSessionGeneration: () => 0,
    getSession: () => session,
  };
});
vi.mock('../components/tactics/tactical-board-editor', () => ({
  TacticalBoardEditor: ({
    heading,
    metadata,
  }: {
    heading: React.ReactNode;
    metadata: React.ReactNode;
  }) => (
    <div aria-label="Taktik tahta editörü">
      <div className="board-commandbar">{heading}</div>
      {metadata}
    </div>
  ),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));

describe('tactics editor reference surface', () => {
  it('keeps the new club-board fields inside the approved visual hierarchy', () => {
    render(
      <MemoryRouter>
        <TacticsEditorPage />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { name: 'Yeni taktik egzersizi' }),
    ).toBeInTheDocument();
    expect(document.querySelector('.page-hero-image')).not.toBeInTheDocument();
    expect(document.querySelector('.studio-heading')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading').closest('.board-commandbar'),
    ).not.toBeNull();
    const details = screen.getByText(
      'Egzersiz bilgileri · Başlık, süre, kategori ve ekipman',
    );
    expect(details.closest('details')).not.toHaveAttribute('open');
    fireEvent.click(details);
    expect(details.closest('details')).toHaveAttribute('open');
    expect(
      screen.getByRole('link', { name: 'Taktik tahtalarına dön' }),
    ).toHaveAttribute('href', '/app/tactics');
    expect(screen.getByLabelText('Başlık')).toHaveValue(
      'Yeni taktik egzersizi',
    );
    expect(screen.getByLabelText('Süre')).toHaveValue(20);
    expect(screen.getByLabelText('Taktik tahta editörü')).toBeInTheDocument();
    expect(screen.queryByText('Kapsam')).not.toBeInTheDocument();
  });
});
