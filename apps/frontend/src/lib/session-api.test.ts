import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';

describe('persistent session client', () => {
  const actor = {
    id: 'user-a',
    name: 'Coach',
    email: 'coach@example.test',
    role: 'COACH',
    clubId: 'club-a',
  };
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_PERSISTENT_SESSIONS_ENABLED', 'true');
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('shares concurrent bootstrap/refresh calls and keeps credentials in memory', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: 'access-a',
          user: actor,
          persistent_session: true,
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetcher);
    const api = await import('./api');
    const session = await import('./session');
    await Promise.all([
      api.bootstrapSession(),
      api.bootstrapSession(),
      api.refreshSession(),
    ]);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining('/auth/refresh'),
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({ 'X-NGCS-CSRF': '1' }),
      }),
    );
    expect(session.getSession()?.token).toBe('access-a');
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it('keeps server logout failure visible and retries without losing the local session', async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetcher);
    const api = await import('./api');
    const session = await import('./session');
    session.setSession({
      token: 'access-a',
      user: actor as never,
      persistent: true,
    });
    await expect(api.logout()).rejects.toThrow('offline');
    expect(session.getSession()).not.toBeNull();
    await api.logout();
    expect(session.getSession()).toBeNull();
  });

  it('does not resurrect a cleared session after an in-flight refresh', async () => {
    let complete!: (response: Response) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            complete = resolve;
          }),
      ),
    );
    const api = await import('./api');
    const session = await import('./session');
    const pending = api.refreshSession();
    session.clearSession();
    complete(
      new Response(
        JSON.stringify({ access_token: 'late-token', user: actor }),
        { status: 200 },
      ),
    );
    await pending;
    expect(session.getSession()).toBeNull();
  });

  it('does not contact refresh when the feature is disabled', async () => {
    vi.stubEnv('VITE_PERSISTENT_SESSIONS_ENABLED', 'false');
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    const api = await import('./api');
    await api.bootstrapSession();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('retries a rejected bearer request once with the refreshed token', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response('{}', { status: 401 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: 'fresh',
            user: actor,
            persistent_session: true,
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response('[]', { status: 200 }));
    vi.stubGlobal('fetch', fetcher);
    const api = await import('./api');
    const session = await import('./session');
    session.setSession({
      token: 'expired',
      user: actor as never,
      persistent: true,
    });
    await expect(api.listGroups()).resolves.toEqual([]);
    expect(fetcher).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('/groups'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer fresh' }),
      }),
    );
  });

  it('does not retry a stale request as a different logged-in user', async () => {
    let complete!: (response: Response) => void;
    const fetcher = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          complete = resolve;
        }),
    );
    vi.stubGlobal('fetch', fetcher);
    const api = await import('./api');
    const session = await import('./session');
    session.setSession({
      token: 'old',
      user: actor as never,
      persistent: true,
    });
    const pending = api.listGroups();
    session.clearSession();
    session.setSession({
      token: 'other-user',
      user: { ...actor, id: 'user-b' } as never,
      persistent: true,
    });
    complete(new Response('{}', { status: 401 }));
    await expect(pending).rejects.toThrow('Oturum değişti');
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(session.getSession()?.token).toBe('other-user');
  });
});
