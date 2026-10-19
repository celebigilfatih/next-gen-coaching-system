import { useState, type FormEvent } from 'react';
import { ArrowRight, LockKey, SoccerBall } from '@phosphor-icons/react';
import { Navigate, useNavigate } from 'react-router';
import { getSession } from '../lib/session';
import { login } from '../lib/api';
import { FormError, FormField } from '../components/forms/form-field';
import { PageActions } from '../components/layout/page-layout';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export function meta() {
  return [{ title: 'Giriş | Next Generation Coaching System' }];
}

export default function LoginRoute() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (getSession()) return <Navigate to="/app/dashboard" replace />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigate('/app/dashboard', { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Giriş yapılamadı.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-brand" aria-label="Ürün tanıtımı">
        <div className="login-mark">
          <SoccerBall weight="duotone" />
        </div>
        <p className="eyebrow">Next Generation Coaching System</p>
        <h1>
          Haftayı planla.
          <br />
          Sahaya hazır çık.
        </h1>
        <p className="login-intro">
          Antrenman planı, katılım ve maç hazırlığı tek koç çalışma alanında.
        </p>
      </section>
      <section className="login-panel">
        <form className="account-form" onSubmit={submit} aria-busy={busy}>
          <div className="login-lock">
            <LockKey weight="duotone" />
          </div>
          <p className="eyebrow">Koç hesabı</p>
          <h2>Çalışma alanına gir</h2>
          <div className="grid gap-5">
            <FormField label="E-posta" htmlFor="login-email">
              <Input
                id="login-email"
                className="h-12"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </FormField>
            <FormField label="Parola" htmlFor="login-password">
              <Input
                id="login-password"
                className="h-12"
                type="password"
                autoComplete="current-password"
                minLength={12}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </FormField>
          </div>
          <FormError message={error} />
          <PageActions className="mt-7">
            <Button className="w-full" size="lg" type="submit" disabled={busy}>
              {busy ? 'Giriş yapılıyor…' : 'Giriş yap'}
              <ArrowRight aria-hidden="true" />
            </Button>
          </PageActions>
          <p className="login-note">
            Hesaplar yalnız yetkili davetle oluşturulur.
          </p>
        </form>
      </section>
    </main>
  );
}
