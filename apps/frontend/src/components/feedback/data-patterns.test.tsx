import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PagePagination } from './page-pagination';
import { EmptyState, ErrorState, LoadingState } from './data-state';
import { AssignmentPageControls } from '../assignment-page-controls';

describe('shared data presentation', () => {
  it('keeps pagination callbacks, keyboard order and native non-submit buttons', async () => {
    const previous = vi.fn();
    const next = vi.fn();
    const submit = vi.fn();
    const user = userEvent.setup();
    render(
      <form onSubmit={submit}>
        <PagePagination
          label="Test sayfaları"
          summary="Sayfa 2 · 1 / 100 kayıt"
          previousDisabled={false}
          nextDisabled={false}
          onPrevious={previous}
          onNext={next}
        />
      </form>,
    );
    expect(
      screen.getByRole('navigation', { name: 'Test sayfaları' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Sayfa 2 · 1 / 100 kayıt',
    );
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Önceki sayfa' })).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Sonraki sayfa' })).toHaveFocus();
    await user.keyboard(' ');
    expect(previous).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledOnce();
    expect(submit).not.toHaveBeenCalled();
  });

  it('does not call disabled actions or infer totals from a summary', async () => {
    const move = vi.fn();
    const user = userEvent.setup();
    render(
      <PagePagination
        label="Kayıt sayfaları"
        summary="Sayfa 3"
        previousDisabled
        nextDisabled
        onPrevious={move}
        onNext={move}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Önceki sayfa' }));
    await user.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    expect(move).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent(/^Sayfa 3$/);
  });

  it('announces loading by resource name and keeps skeletons decorative', () => {
    const view = render(
      <LoadingState
        label="Oyuncular yükleniyor"
        count={3}
        skeletonClassName="h-44"
      />,
    );
    const status = screen.getByRole('status', { name: 'Oyuncular yükleniyor' });
    expect(status.querySelectorAll('[aria-hidden="true"]')).toHaveLength(3);
    expect(status.firstElementChild).toHaveClass('h-44');
    view.rerender(
      <LoadingState label="Takımlar yükleniyor" skeletonClassName="h-48" />,
    );
    expect(
      screen.getByRole('status', { name: 'Takımlar yükleniyor' }).children,
    ).toHaveLength(1);
  });

  it('renders plain-text errors and only offers a caller-owned retry', async () => {
    const retry = vi.fn();
    const user = userEvent.setup();
    const message = '<img src=x onerror=alert(1)> Forbidden';
    const view = render(
      <ErrorState
        title="Kayıtlar alınamadı"
        message={message}
        onRetry={retry}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(screen.getByRole('alert').querySelector('img')).toBeNull();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(retry).toHaveBeenCalledOnce();
    view.rerender(
      <ErrorState title="Çalışma alanı alınamadı" message="Forbidden" />,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('keeps empty copy separate from errors and decorative icons unnamed', () => {
    render(
      <EmptyState
        title="Görünür takım yok"
        description="Seçili kapsamda kayıt yok."
        icon={<svg data-testid="empty-icon" />}
      />,
    );
    expect(
      screen.getByRole('heading', { name: 'Görünür takım yok', level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Seçili kapsamda kayıt yok.')).toBeInTheDocument();
    expect(screen.getByTestId('empty-icon').parentElement).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('retains assignment full totals and opaque cursor dispatch', async () => {
    const state = {
      loading: false,
      pageNumber: 2,
      previous: vi.fn(),
      next: vi.fn(),
    };
    const user = userEvent.setup();
    const view = render(
      <AssignmentPageControls
        label="Geçmiş"
        count={0}
        page={{ total: 120, limit: 25, nextCursor: 'opaque-cursor' }}
        state={state}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Sayfa 2 · 0 / 120 atama',
    );
    await user.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    expect(state.next).toHaveBeenCalledExactlyOnceWith('opaque-cursor');
    view.rerender(
      <AssignmentPageControls
        label="Geçmiş"
        count={0}
        state={{ ...state, loading: true }}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(/^Sayfa 2$/);
    expect(screen.getByRole('button', { name: 'Önceki sayfa' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Sonraki sayfa' }),
    ).toBeDisabled();
  });
});
