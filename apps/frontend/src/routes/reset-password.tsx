import { useState, type FormEvent } from 'react';
import { AccountCompletionShell } from '../components/account-completion-shell';
import { completePasswordReset } from '../lib/api';
import { useFragmentToken } from '../lib/use-fragment-token';
import { FormField } from '../components/forms/form-field';
import { Input } from '../components/ui/input';

export function meta() {
  return [
    { title: 'Parolayı yenile | Next Generation Coaching System' },
    { name: 'referrer', content: 'no-referrer' },
  ];
}

export default function ResetPasswordRoute() {
  const { ready, token, clearToken } = useFragmentToken();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return setError('Parola bağlantısı bulunamadı veya geçersiz.');
    if (password !== confirmation)
      return setError('Parola alanları birbiriyle eşleşmiyor.');
    setBusy(true);
    setError('');
    try {
      await completePasswordReset(token, password);
      clearToken();
      setSuccess(true);
      setPassword('');
      setConfirmation('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'İşlem tamamlanamadı.');
    } finally {
      setBusy(false);
    }
  }

  if (!ready)
    return (
      <main className="error-screen" aria-live="polite">
        <h1>Parola yenileme hazırlanıyor…</h1>
      </main>
    );

  return (
    <AccountCompletionShell
      eyebrow="Parola yenileme"
      title="Yeni parolanı belirle"
      introduction="Yöneticinizin gönderdiği tek kullanımlık bağlantıyla hesabınıza yeniden erişin."
      busy={busy}
      disabled={!token}
      error={token ? error : 'Parola bağlantısı bulunamadı veya geçersiz.'}
      success={success}
      submitLabel="Parolayı yenile"
      onSubmit={submit}
    >
      <FormField label="Yeni parola" htmlFor="reset-password">
        <Input
          id="reset-password"
          className="h-12"
          type="password"
          autoComplete="new-password"
          minLength={12}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </FormField>
      <FormField label="Yeni parola tekrarı" htmlFor="reset-confirmation">
        <Input
          id="reset-confirmation"
          className="h-12"
          type="password"
          autoComplete="new-password"
          minLength={12}
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          required
        />
      </FormField>
    </AccountCompletionShell>
  );
}
