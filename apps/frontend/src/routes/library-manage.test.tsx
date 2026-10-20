import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LibraryManageRoute from './library-manage';

const mocks = vi.hoisted(() => ({
  queue: vi.fn(),
  transition: vi.fn(),
  user: {
    id: 'author-1',
    name: 'İçerik Yazarı',
    email: 'author@example.test',
    role: 'SYSTEM_ADMIN' as const,
    clubId: null,
  },
}));

vi.mock('../lib/api', () => ({
  getDrillContentQueue: mocks.queue,
  transitionDrillContent: mocks.transition,
}));

vi.mock('../lib/session', () => ({
  getSession: () => ({ token: 'test-token', user: mocks.user }),
}));

const reviewItem = {
  id: 'version-1',
  drillId: 'drill-1',
  version: 1,
  status: 'IN_REVIEW',
  title: 'Yönlü pas ve destek açısı',
  summary: 'Pas kalitesi ve destek açısını geliştiren çalışma.',
  objectiveLabel: 'Pas',
  createdBy: { id: 'author-1', name: 'İçerik Yazarı' },
  reviewedBy: null,
  publishedBy: null,
  reviewComment: null,
  updatedAt: '2026-09-09T00:00:00.000Z',
};

function renderRoute() {
  return render(
    <MemoryRouter>
      <LibraryManageRoute />
    </MemoryRouter>,
  );
}

async function openReviewQueue() {
  fireEvent.mouseDown(screen.getByRole('tab', { name: 'İncelemede' }), {
    button: 0,
    ctrlKey: false,
  });
  await screen.findByText(reviewItem.title);
}

describe('drill content review boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.user.id = 'author-1';
    mocks.queue.mockImplementation(async (status: string) =>
      status === 'IN_REVIEW'
        ? { items: [reviewItem], total: 1 }
        : { items: [], total: 0 },
    );
    mocks.transition.mockResolvedValue(reviewItem);
  });

  it('explains and disables self-review before a forbidden request is sent', async () => {
    renderRoute();
    await openReviewQueue();

    expect(
      screen.getByText(/bağımsız bir futbol uzmanı incelemeden/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Onayla' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reddet' })).toBeDisabled();
    expect(
      screen.queryByLabelText(`${reviewItem.title} inceleme notu`),
    ).not.toBeInTheDocument();
    expect(mocks.transition).not.toHaveBeenCalled();
  });

  it('keeps independent reviewer actions available', async () => {
    mocks.user.id = 'reviewer-1';
    renderRoute();
    await openReviewQueue();

    expect(
      screen.getByLabelText(`${reviewItem.title} inceleme notu`),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Onayla' }));
    await waitFor(() =>
      expect(mocks.transition).toHaveBeenCalledWith(
        'version-1',
        'approve',
        undefined,
      ),
    );
  });
});
