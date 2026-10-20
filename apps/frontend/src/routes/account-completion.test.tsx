import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AcceptInvitationRoute from './accept-invitation';
import ResetPasswordRoute from './reset-password';

const api = vi.hoisted(() => ({
  acceptInvitation: vi.fn(),
  completePasswordReset: vi.fn(),
}));
vi.mock('../lib/api', () => api);

describe('public account completion routes', () => {
  beforeEach(() => {
    api.acceptInvitation.mockReset();
    api.completePasswordReset.mockReset();
  });

  it('removes the invitation token fragment before submitting it', async () => {
    window.history.replaceState(
      null,
      '',
      '/accept-invitation#token=invitation-secret',
    );
    api.acceptInvitation.mockResolvedValue({ id: 'user-1' });
    const user = userEvent.setup();

    render(
      <StrictMode>
        <MemoryRouter>
          <AcceptInvitationRoute />
        </MemoryRouter>
      </StrictMode>,
    );

    await screen.findByRole('heading', { name: 'Hesabını oluştur' });
    expect(window.location.hash).toBe('');
    expect(
      screen.queryByText('Davet bağlantısı bulunamadı veya geçersiz.'),
    ).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('Ad soyad'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Yeni parola'), 'secure-pass-123');
    await user.type(
      screen.getByLabelText('Yeni parola tekrarı'),
      'secure-pass-123',
    );
    await user.click(screen.getByRole('button', { name: 'Daveti kabul et' }));

    await waitFor(() =>
      expect(api.acceptInvitation).toHaveBeenCalledWith(
        'invitation-secret',
        'Ada Lovelace',
        'secure-pass-123',
      ),
    );
    expect(
      await screen.findByRole('heading', { name: 'Hazırsınız' }),
    ).toBeInTheDocument();
  });

  it('does not call the API when the reset link has no token', async () => {
    window.history.replaceState(null, '', '/reset-password');
    render(
      <MemoryRouter>
        <ResetPasswordRoute />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText('Parola bağlantısı bulunamadı veya geçersiz.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Parolayı yenile' }),
    ).toBeDisabled();
    expect(api.completePasswordReset).not.toHaveBeenCalled();
  });
});

describe.each([
  [
    'invitation',
    AcceptInvitationRoute,
    'Daveti kabul et',
    api.acceptInvitation,
  ],
  ['reset', ResetPasswordRoute, 'Parolayı yenile', api.completePasswordReset],
] as const)('%s migrated form', (kind, Component, submitLabel, request) => {
  beforeEach(() => {
    request.mockReset();
    window.history.replaceState(null, '', `/${kind}#token=synthetic-token`);
  });
  async function showAndFill(confirmation = 'synthetic-pass-123') {
    render(
      <MemoryRouter>
        <Component />
      </MemoryRouter>,
    );
    await screen.findByLabelText('Yeni parola');
    if (kind === 'invitation')
      await userEvent.type(screen.getByLabelText('Ad soyad'), 'Test Coach');
    await userEvent.type(
      screen.getByLabelText('Yeni parola'),
      'synthetic-pass-123',
    );
    await userEvent.type(
      screen.getByLabelText('Yeni parola tekrarı'),
      confirmation,
    );
  }
  it('retains required/new-password/minLength and rejects mismatched confirmation', async () => {
    await showAndFill('different-pass-123');
    for (const label of ['Yeni parola', 'Yeni parola tekrarı']) {
      expect(screen.getByLabelText(label)).toBeRequired();
      expect(screen.getByLabelText(label)).toHaveAttribute('minlength', '12');
      expect(screen.getByLabelText(label)).toHaveAttribute(
        'autocomplete',
        'new-password',
      );
    }
    await userEvent.click(screen.getByRole('button', { name: submitLabel }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Parola alanları birbiriyle eşleşmiyor.',
    );
    expect(request).not.toHaveBeenCalled();
  });
  it('retains busy, token payload, success and login link without auto-login', async () => {
    let done!: () => void;
    request.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          done = resolve;
        }),
    );
    await showAndFill();
    expect(window.location.hash).toBe('');
    await userEvent.click(screen.getByRole('button', { name: submitLabel }));
    expect(screen.getByRole('button', { name: 'İşleniyor…' })).toBeDisabled();
    expect(
      screen.getByLabelText('Yeni parola').closest('form'),
    ).toHaveAttribute('aria-busy', 'true');
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0]).toEqual(
      kind === 'invitation'
        ? ['synthetic-token', 'Test Coach', 'synthetic-pass-123']
        : ['synthetic-token', 'synthetic-pass-123'],
    );
    done();
    expect(await screen.findByRole('status')).toHaveTextContent('Hazırsınız');
    expect(
      screen.getByRole('link', { name: 'Giriş ekranına git' }),
    ).toHaveAttribute('href', '/login');
    expect(screen.queryByLabelText('Yeni parola')).not.toBeInTheDocument();
  });
  it.each([new Error('<b>Expired link</b>'), 'unknown'])(
    'reports plain-text errors, retains token and permits retry %s',
    async (cause) => {
      request.mockRejectedValueOnce(cause).mockResolvedValueOnce({});
      await showAndFill();
      await userEvent.click(screen.getByRole('button', { name: submitLabel }));
      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent(
        cause instanceof Error ? cause.message : 'İşlem tamamlanamadı.',
      );
      expect(alert.querySelector('b')).toBeNull();
      expect(screen.getByLabelText('Yeni parola')).toHaveValue(
        'synthetic-pass-123',
      );
      await userEvent.click(screen.getByRole('button', { name: submitLabel }));
      expect(await screen.findByRole('status')).toBeInTheDocument();
      expect(request).toHaveBeenCalledTimes(2);
    },
  );
  it('disables completion when the token is absent', async () => {
    window.history.replaceState(null, '', `/${kind}`);
    render(
      <MemoryRouter>
        <Component />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'bulunamadı veya geçersiz',
    );
    expect(screen.getByRole('button', { name: submitLabel })).toBeDisabled();
    expect(request).not.toHaveBeenCalled();
  });
});
