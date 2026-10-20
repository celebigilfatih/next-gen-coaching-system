import { useState, type FormEvent } from 'react';
import { AccountCompletionShell } from '../components/account-completion-shell';
import { acceptInvitation } from '../lib/api';
import { useFragmentToken } from '../lib/use-fragment-token';
import { FormField } from '../components/forms/form-field';
import { Input } from '../components/ui/input';

export function meta() {
  return [
    { title: 'Daveti kabul et | Next Generation Coaching System' },
    { name: 'referrer', content: 'no-referrer' },
  ];
}

export default function AcceptInvitationRoute() {
  const { ready, token, clearToken } = useFragmentToken();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return setError('Davet bağlantısı bulunamadı veya geçersiz.');
    if (password !== confirmation)
      return setError('Parola alanları birbiriyle eşleşmiyor.');
    setBusy(true);
    setError('');
    try {
      await acceptInvitation(token, name, password);
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
        <h1>Davet hazırlanıyor…</h1>
      </main>
    );

  return (
    <AccountCompletionShell
      eyebrow="Hesap daveti"
      title="Hesabını oluştur"
      introduction="Davetinizi tamamlayın ve takımınızın çalışma alanına güvenle katılın."
      busy={busy}
      disabled={!token}
      error={token ? error : 'Davet bağlantısı bulunamadı veya geçersiz.'}
      success={success}
      submitLabel="Daveti kabul et"
      onSubmit={submit}
    >
      <FormField label="Ad soyad" htmlFor="invitation-name">
        <Input
          id="invitation-name"
          className="h-12"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </FormField>
      <FormField label="Yeni parola" htmlFor="invitation-password">
        <Input
          id="invitation-password"
          className="h-12"
          type="password"
          autoComplete="new-password"
          minLength={12}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </FormField>
      <FormField label="Yeni parola tekrarı" htmlFor="invitation-confirmation">
        <Input
          id="invitation-confirmation"
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
