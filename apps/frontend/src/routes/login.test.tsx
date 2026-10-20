import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginRoute from './login';

const mocks = vi.hoisted(() => ({ login: vi.fn(), session: false }));
vi.mock('../lib/api', () => ({ login: mocks.login }));
vi.mock('../lib/session', () => ({
  getSession: () => (mocks.session ? {} : null),
}));

function showLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/app/dashboard" element={<h1>Dashboard</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}
async function fillLogin() {
  await userEvent.type(screen.getByLabelText('E-posta'), 'coach@example.test');
  await userEvent.type(screen.getByLabelText('Parola'), 'synthetic-pass-123');
}
describe('login form migration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.session = false;
  });
  it('preserves email/password browser constraints and autocomplete', () => {
    showLogin();
    const email = screen.getByLabelText('E-posta');
    const password = screen.getByLabelText('Parola');
    expect(email).toBeRequired();
    expect(email).toHaveAttribute('type', 'email');
    expect(email).toHaveAttribute('autocomplete', 'email');
    expect(password).toBeRequired();
    expect(password).toHaveAttribute('type', 'password');
    expect(password).toHaveAttribute('minlength', '12');
    expect(password).toHaveAttribute('autocomplete', 'current-password');
    expect(screen.getByRole('button', { name: 'Giriş yap' })).toHaveAttribute(
      'type',
      'submit',
    );
  });
  it('blocks empty and malformed email submissions without API calls', async () => {
    showLogin();
    await userEvent.click(screen.getByRole('button', { name: 'Giriş yap' }));
    await userEvent.type(screen.getByLabelText('E-posta'), 'invalid');
    await userEvent.type(screen.getByLabelText('Parola'), 'synthetic-pass-123');
    await userEvent.click(screen.getByRole('button', { name: 'Giriş yap' }));
    expect(mocks.login).not.toHaveBeenCalled();
  });
  it('submits by keyboard once, shows busy and waits before redirect', async () => {
    let done!: () => void;
    mocks.login.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          done = resolve;
        }),
    );
    showLogin();
    await fillLogin();
    await userEvent.keyboard('{Enter}');
    expect(
      screen.getByRole('button', { name: 'Giriş yapılıyor…' }),
    ).toBeDisabled();
    expect(screen.getByLabelText('Parola').closest('form')).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(mocks.login).toHaveBeenCalledExactlyOnceWith(
      'coach@example.test',
      'synthetic-pass-123',
    );
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    done();
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });
  it.each([new Error('Service unavailable'), 'unknown'])(
    'preserves credentials and retry after failure %s',
    async (cause) => {
      mocks.login.mockRejectedValueOnce(cause).mockResolvedValueOnce({});
      showLogin();
      await fillLogin();
      await userEvent.click(screen.getByRole('button', { name: 'Giriş yap' }));
      expect(await screen.findByRole('alert')).toHaveTextContent(
        cause instanceof Error ? cause.message : 'Giriş yapılamadı.',
      );
      expect(screen.getByLabelText('E-posta')).toHaveValue(
        'coach@example.test',
      );
      expect(screen.getByLabelText('Parola')).toHaveValue('synthetic-pass-123');
      await userEvent.click(screen.getByRole('button', { name: 'Giriş yap' }));
      await waitFor(() =>
        expect(screen.getByText('Dashboard')).toBeInTheDocument(),
      );
      expect(mocks.login).toHaveBeenCalledTimes(2);
    },
  );
  it('keeps the existing authenticated-user redirect without a login request', async () => {
    mocks.session = true;
    showLogin();
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(mocks.login).not.toHaveBeenCalled();
  });
});
