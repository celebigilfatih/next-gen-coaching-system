import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OptionPagination } from './option-pagination';

describe('compact option pagination', () => {
  it('retains group/name/live counter and keyboard callbacks without submitting a surrounding form', async () => {
    const previous = vi.fn();
    const next = vi.fn();
    const submit = vi.fn();
    const user = userEvent.setup();
    render(
      <form onSubmit={submit}>
        <OptionPagination
          label="Rol sayfaları"
          pageNumber={12}
          previousLabel="Önceki rol seçenekleri"
          nextLabel="Sonraki rol seçenekleri"
          previousDisabled={false}
          nextDisabled={false}
          onPrevious={previous}
          onNext={next}
        />
      </form>,
    );
    expect(
      screen.getByRole('group', { name: 'Rol sayfaları' }),
    ).toBeInTheDocument();
    expect(screen.getByText('12')).toHaveAttribute('aria-live', 'polite');
    await user.tab();
    expect(
      screen.getByRole('button', { name: 'Önceki rol seçenekleri' }),
    ).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.tab();
    expect(
      screen.getByRole('button', { name: 'Sonraki rol seçenekleri' }),
    ).toHaveFocus();
    await user.keyboard(' ');
    expect(previous).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledOnce();
    expect(submit).not.toHaveBeenCalled();
  });
  it('keeps disabled actions inert and does not infer empty-state visibility', async () => {
    const move = vi.fn();
    const user = userEvent.setup();
    render(
      <OptionPagination
        label="Rol sayfaları"
        pageNumber={1}
        previousLabel="Önceki"
        nextLabel="Sonraki"
        previousDisabled
        nextDisabled
        onPrevious={move}
        onNext={move}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Önceki' }));
    await user.click(screen.getByRole('button', { name: 'Sonraki' }));
    expect(move).not.toHaveBeenCalled();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
