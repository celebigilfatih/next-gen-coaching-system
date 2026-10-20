import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { afterEach, describe, expect, it } from 'vitest';
import { Button } from './button';
import { Toaster } from './sonner';

afterEach(() => toast.dismiss());

describe('notification primitive', () => {
  it('renders info notifications with the existing top-right placement and dismisses by keyboard', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Button
          onClick={() =>
            toast.info('One match is ready', { duration: Infinity })
          }
        >
          Notify
        </Button>
        <Toaster closeButton />
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Notify' }));
    expect(await screen.findByText('One match is ready')).toBeInTheDocument();
    const notificationList = screen.getByRole('list');
    expect(notificationList).toHaveAttribute('data-y-position', 'top');
    expect(notificationList).toHaveAttribute('data-x-position', 'right');
    const close = screen.getByRole('button', { name: 'Close toast' });
    close.focus();
    await user.keyboard('{Enter}');
    await waitFor(() =>
      expect(screen.queryByText('One match is ready')).not.toBeInTheDocument(),
    );
  });

  it('forwards placement overrides and renders plain error text without interpreting markup', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Button
          onClick={() =>
            toast.error('<img src=x onerror=alert(1)>', { duration: Infinity })
          }
        >
          Error
        </Button>
        <Toaster position="bottom-left" />
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Error' }));
    expect(
      await screen.findByText('<img src=x onerror=alert(1)>'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('list')).toHaveAttribute(
      'data-y-position',
      'bottom',
    );
    expect(screen.getByRole('list')).toHaveAttribute('data-x-position', 'left');
  });
});
