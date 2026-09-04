import { useState, type FormEvent } from 'react';
import { ArrowRight, LockKey, SoccerBall } from '@phosphor-icons/react';
import { useNavigate } from 'react-router';
import { login } from '../lib/api';

export function meta() {
  return [{ title: 'Giriş | Next Generation Coaching System' }];
}

export default function LoginRoute() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigate('/app/week');
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
        <form className="login-form" onSubmit={submit}>
          <div className="login-lock">
            <LockKey weight="duotone" />
          </div>
          <p className="eyebrow">Koç hesabı</p>
          <h2>Çalışma alanına gir</h2>
          <label>
            E-posta
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Parola
            <input
              type="password"
              autoComplete="current-password"
              minLength={12}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          <button
            className="button button-primary"
            type="submit"
            disabled={busy}
          >
            {busy ? 'Giriş yapılıyor…' : 'Giriş yap'}
            <ArrowRight aria-hidden="true" />
          </button>
          <p className="login-note">
            Hesaplar yalnız yetkili davetle oluşturulur.
          </p>
        </form>
      </section>
    </main>
  );
}
