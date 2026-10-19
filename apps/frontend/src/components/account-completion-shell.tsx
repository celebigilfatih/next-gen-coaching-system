import { CheckCircle, LockKey, SoccerBall } from '@phosphor-icons/react';
import { Link } from 'react-router';
import type { FormEvent, ReactNode } from 'react';
import { FormError } from './forms/form-field';
import { PageActions } from './layout/page-layout';
import { Button } from './ui/button';

type Props = {
  eyebrow: string;
  title: string;
  introduction: string;
  busy: boolean;
  disabled?: boolean;
  error: string;
  success: boolean;
  submitLabel: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
};

export function AccountCompletionShell({
  eyebrow,
  title,
  introduction,
  busy,
  disabled = false,
  error,
  success,
  submitLabel,
  onSubmit,
  children,
}: Props) {
  return (
    <main className="login-shell">
      <section className="login-brand" aria-label="Ürün tanıtımı">
        <div className="login-mark">
          <SoccerBall weight="duotone" />
        </div>
        <p className="eyebrow">Next Generation Coaching System</p>
        <h1>
          Takımına katıl.
          <br />
          Sahaya hazır çık.
        </h1>
        <p className="login-intro">{introduction}</p>
      </section>
      <section className="login-panel">
        {success ? (
          <div className="account-form account-success" role="status">
            <div className="login-lock">
              <CheckCircle weight="duotone" />
            </div>
            <p className="eyebrow">İşlem tamamlandı</p>
            <h2>Hazırsınız</h2>
            <p>Yeni bilgilerinizle çalışma alanına giriş yapabilirsiniz.</p>
            <PageActions className="mt-7">
              <Button asChild size="lg" className="w-full">
                <Link to="/login">Giriş ekranına git</Link>
              </Button>
            </PageActions>
          </div>
        ) : (
          <form className="account-form" onSubmit={onSubmit} aria-busy={busy}>
            <div className="login-lock">
              <LockKey weight="duotone" />
            </div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
            <div className="grid gap-5">{children}</div>
            <FormError message={error} />
            <PageActions className="mt-7">
              <Button
                size="lg"
                className="w-full"
                type="submit"
                disabled={busy || disabled}
              >
                {busy ? 'İşleniyor…' : submitLabel}
              </Button>
            </PageActions>
            <p className="login-note">
              Bu bağlantı tek kullanımlıdır ve güvenli biçimde işlenir.
            </p>
          </form>
        )}
      </section>
    </main>
  );
}
