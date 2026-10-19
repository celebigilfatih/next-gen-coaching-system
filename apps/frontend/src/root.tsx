import '@fontsource/barlow-condensed/500.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource-variable/inter';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLocation,
} from 'react-router';
import type { Route } from './+types/root';
import './styles.css';
import { useEffect, useState } from 'react';
import { bootstrapSession, persistentSessionsEnabled } from './lib/api';
import { ShieldChevron } from '@phosphor-icons/react';

export function links() {
  return [{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }];
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { pathname } = useLocation();
  const publicPath = [
    '/',
    '/login',
    '/accept-invitation',
    '/reset-password',
  ].includes(pathname);
  const shouldBootstrap = persistentSessionsEnabled && !publicPath;
  const [ready, setReady] = useState(!shouldBootstrap);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!shouldBootstrap) return;
    let active = true;
    void bootstrapSession()
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [attempt, shouldBootstrap]);
  if (!ready)
    return (
      <main className="error-screen" aria-live="polite">
        <h1>
          {error ? 'Oturum kontrol edilemedi' : 'Oturum kontrol ediliyor…'}
        </h1>
        {error && (
          <button
            className="button button-primary"
            onClick={() => {
              setError(false);
              setAttempt(attempt + 1);
            }}
          >
            Tekrar dene
          </button>
        )}
      </main>
    );
  return <Outlet />;
}

export function HydrateFallback() {
  return (
    <main className="hydrate-fallback" aria-busy="true" aria-live="polite">
      <div className="hydrate-fallback__brand" aria-hidden="true">
        <ShieldChevron weight="duotone" />
        <strong>NGCS</strong>
      </div>
      <p>Çalışma alanı hazırlanıyor…</p>
      <span className="hydrate-fallback__progress" aria-hidden="true" />
    </main>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Beklenmeyen bir hata oluştu.';

  return (
    <main className="error-screen">
      <p className="eyebrow">NGCS</p>
      <h1>Çalışma alanı açılamadı</h1>
      <p>{message}</p>
      <a className="primary-link" href="/app/week">
        Haftaya dön
      </a>
    </main>
  );
}
