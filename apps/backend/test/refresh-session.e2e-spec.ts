import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { RefreshSessionService } from '../src/auth/refresh-session.service';

describe('Persistent browser sessions (disposable PostgreSQL)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let sessions: RefreshSessionService;
  const origin = 'http://localhost:3500';
  const password = 'session-e2e-password';
  let sequence = 0;
  const savedEnv = { ...process.env };
  const browser = { Origin: origin, 'X-NGCS-CSRF': '1' };
  const cookie = (response: request.Response) =>
    (response.headers['set-cookie'] as unknown as string[])[0].split(';')[0];

  beforeAll(async () => {
    // Concurrency assertions exercise the database protocol independently of rate limiting.
    jest.spyOn(ThrottlerGuard.prototype, 'canActivate').mockResolvedValue(true);
    const url = process.env.TEST_DATABASE_URL;
    if (
      !url ||
      process.env.E2E_ALLOW_DESTRUCTIVE_RESET !== 'true' ||
      !/test|e2e/i.test(new URL(url).pathname)
    )
      throw new Error(
        'Disposable TEST_DATABASE_URL and explicit reset permission required',
      );
    process.env.DATABASE_URL = url;
    process.env.PERSISTENT_SESSIONS_ENABLED = 'true';
    process.env.FRONTEND_ORIGIN = origin;
    process.env.JWT_SECRET = 'persistent-session-e2e-secret-32-characters';
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();
    app = module.createNestApplication();
    await app.init();
    await app.listen(0, '127.0.0.1');
    prisma = app.get(PrismaService);
    sessions = app.get(RefreshSessionService);
  });
  afterAll(async () => {
    if (app) await app.close();
    jest.restoreAllMocks();
    process.env = savedEnv;
  });
  async function user() {
    sequence += 1;
    return prisma.user.create({
      data: {
        name: 'Session Test',
        email: `session-${randomUUID()}-${sequence}@example.test`,
        passwordHash: await bcrypt.hash(password, 4),
        role: 'SYSTEM_ADMIN',
      },
    });
  }
  const login = (email: string) =>
    request(app.getHttpServer())
      .post('/auth/login')
      .set(browser)
      .send({ email, password });
  const refresh = (value: string) =>
    request(app.getHttpServer())
      .post('/auth/refresh')
      .set(browser)
      .set('Cookie', value)
      .send({});
  const me = (token: string) =>
    request(app.getHttpServer())
      .get('/auth/me')
      .auth(token, { type: 'bearer' });

  it('enforces origin/header before issuing credentials and exposes no raw refresh token in JSON', async () => {
    const actor = await user();
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: actor.email, password })
      .expect(401);
    await request(app.getHttpServer())
      .post('/auth/login')
      .set({ ...browser, Origin: 'http://evil.example.test' })
      .send({ email: actor.email, password })
      .expect(401);
    const first = await login(actor.email).expect(201);
    expect(first.body).not.toHaveProperty('refreshSession');
    expect(first.headers['cache-control']).toBe('no-store');
    expect(first.headers['set-cookie'][0]).toContain('HttpOnly');
    expect(first.headers['set-cookie'][0]).toContain('SameSite=Lax');
    const payload = app.get(JwtService).decode(first.body.access_token);
    expect(payload.exp - payload.iat).toBe(900);
    const rows = await prisma.refreshSession.findMany({
      where: { userId: actor.id },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(rows[0].tokenHash).not.toBe(cookie(first).split('=')[1]);
    const next = await refresh(cookie(first)).expect(200);
    expect(cookie(next)).not.toBe(cookie(first));
    await me(next.body.access_token).expect(200);
    await refresh(cookie(first)).expect(401);
    await refresh(cookie(next)).expect(401);
    await me(next.body.access_token).expect(401);
    expect(
      await prisma.securityAuditEvent.count({
        where: { targetUserId: actor.id, action: 'SESSION_REUSE_DETECTED' },
      }),
    ).toBe(1);
  });

  it('serializes concurrent refresh: one succeeds, replay invalidates the winner family', async () => {
    const actor = await user();
    const first = await login(actor.email).expect(201);
    const attempts = await Promise.all([
      refresh(cookie(first)),
      refresh(cookie(first)),
    ]);
    expect(attempts.map((r) => r.status).sort()).toEqual([200, 401]);
    const winner = attempts.find((r) => r.status === 200)!;
    await me(winner.body.access_token).expect(401);
    expect(
      await prisma.refreshSession.count({
        where: { userId: actor.id, revokedAt: null },
      }),
    ).toBe(0);
  });

  it('logout revokes only its family and rejects cross-origin logout', async () => {
    const actor = await user();
    const first = await login(actor.email).expect(201);
    const second = await login(actor.email).expect(201);
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', cookie(first))
      .expect(401);
    await me(first.body.access_token).expect(200);
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set(browser)
      .set('Cookie', cookie(first))
      .expect(200);
    await me(first.body.access_token).expect(401);
    await me(second.body.access_token).expect(200);
    await refresh(cookie(first)).expect(401);
  });

  it.each(['idleExpiresAt', 'absoluteExpiresAt'] as const)(
    'rejects %s expiration',
    async (field) => {
      const actor = await user();
      const first = await login(actor.email).expect(201);
      const expired = new Date(Date.now() - 1000);
      await prisma.refreshSession.updateMany({
        where: { userId: actor.id },
        data: {
          idleExpiresAt: expired,
          ...(field === 'absoluteExpiresAt'
            ? { absoluteExpiresAt: expired }
            : {}),
        },
      });
      await refresh(cookie(first)).expect(401);
      await me(first.body.access_token).expect(401);
    },
  );

  it('bounds concurrent logins to five active families', async () => {
    const actor = await user();
    const attempts = await Promise.all(
      Array.from({ length: 7 }, () => login(actor.email)),
    );
    expect(attempts.every((r) => r.status === 201)).toBe(true);
    expect(
      await prisma.refreshSession.count({
        where: { userId: actor.id, revokedAt: null },
      }),
    ).toBe(5);
    const validity = await Promise.all(
      attempts.map((r) => me(r.body.access_token)),
    );
    expect(validity.filter((r) => r.status === 200)).toHaveLength(5);
  });

  it('global revocation and password change invalidate refresh and access credentials', async () => {
    const actor = await user();
    const first = await login(actor.email).expect(201);
    await request(app.getHttpServer())
      .post('/accounts/me/revoke-sessions')
      .auth(first.body.access_token, { type: 'bearer' })
      .expect(201);
    await refresh(cookie(first)).expect(401);
    const second = await login(actor.email).expect(201);
    await request(app.getHttpServer())
      .post('/accounts/me/change-password')
      .auth(second.body.access_token, { type: 'bearer' })
      .send({
        currentPassword: password,
        newPassword: 'new-session-e2e-password',
      })
      .expect(201);
    await refresh(cookie(second)).expect(401);
    await me(second.body.access_token).expect(401);
  });

  it('prunes records after the approved retention interval without deleting recent records', async () => {
    const actor = await user();
    const old = new Date(Date.now() - 31 * 86400000);
    const recent = new Date(Date.now() - 1000);
    const expired = await prisma.refreshSession.create({
      data: {
        userId: actor.id,
        familyId: randomUUID(),
        tokenHash: randomUUID(),
        authVersion: 0,
        idleExpiresAt: old,
        absoluteExpiresAt: old,
      },
    });
    const retained = await prisma.refreshSession.create({
      data: {
        userId: actor.id,
        familyId: randomUUID(),
        tokenHash: randomUUID(),
        authVersion: 0,
        idleExpiresAt: recent,
        absoluteExpiresAt: recent,
        revokedAt: recent,
      },
    });
    await sessions.issue({ id: actor.id, authVersion: 0, clubId: null });
    expect(
      await prisma.refreshSession.findUnique({ where: { id: expired.id } }),
    ).toBeNull();
    expect(
      await prisma.refreshSession.findUnique({ where: { id: retained.id } }),
    ).not.toBeNull();
  });

  it('suspension, access changes and password reset revoke previously issued families', async () => {
    const admin = await user();
    const target = await user();
    const adminLogin = await login(admin.email).expect(201);
    const manage = (path: string) =>
      request(app.getHttpServer())
        .post(path)
        .auth(adminLogin.body.access_token, { type: 'bearer' });
    const first = await login(target.email).expect(201);
    await manage(`/accounts/${target.id}/suspend`).expect(201);
    await refresh(cookie(first)).expect(401);
    await manage(`/accounts/${target.id}/reactivate`).expect(201);
    const second = await login(target.email).expect(201);
    await request(app.getHttpServer())
      .patch(`/accounts/${target.id}/access`)
      .auth(adminLogin.body.access_token, { type: 'bearer' })
      .send({ role: 'SYSTEM_ADMIN' })
      .expect(200);
    await refresh(cookie(second)).expect(401);
    const third = await login(target.email).expect(201);
    const reset = await manage(`/accounts/${target.id}/password-reset`).expect(
      201,
    );
    await request(app.getHttpServer())
      .post('/accounts/password-resets/complete')
      .send({
        token: reset.body.token,
        newPassword: 'reset-session-e2e-password',
      })
      .expect(201);
    await refresh(cookie(third)).expect(401);
    await me(third.body.access_token).expect(401);
  });
});
