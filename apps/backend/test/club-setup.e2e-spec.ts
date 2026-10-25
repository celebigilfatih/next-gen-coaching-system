import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, UserRole } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ClubSetupService } from '../src/sporting/club-setup.service';
import { configureBodyParsers } from '../src/tactics/tactical-body-parser';
import { legacyParityReport } from '../src/sporting/legacy-parity';

describe('guided club setup (dedicated PostgreSQL)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  const prefix = `setup-test-${randomUUID()}`;
  const tokens: Record<string, string> = {};
  const systemId = `${prefix}-system`;
  const body = () => ({
    requestId: randomUUID(),
    club: { name: prefix, primaryColor: '#fefefe', secondaryColor: '#123456' },
    season: {
      name: '2026-2027',
      startDate: '2026-08-14',
      endDate: '2027-05-23',
    },
    firstTeam: { name: 'A Takım', ageGroupLabel: 'SENIOR' },
    academyTeams: [{ key: 'u8', name: 'U8 Takımı', ageGroupLabel: 'U8' }],
    staff: [] as object[],
  });
  const post = (input: object, token = tokens.SYSTEM_ADMIN) =>
    request(app.getHttpServer())
      .post('/sporting/club-setup')
      .set('Authorization', `Bearer ${token}`)
      .send(input);
  const status = (id: string, token = tokens.SYSTEM_ADMIN) =>
    request(app.getHttpServer())
      .get(`/sporting/club-setup/${id}`)
      .set('Authorization', `Bearer ${token}`);

  beforeAll(async () => {
    const url = process.env.TEST_DATABASE_URL;
    if (
      !url ||
      new URL(url).pathname !== '/ngcs_club_setup_wizard_test' ||
      !['localhost', '127.0.0.1'].includes(new URL(url).hostname)
    )
      throw new Error('Exact dedicated loopback setup test DB required');
    process.env.DATABASE_URL = url;
    process.env.JWT_SECRET = randomUUID() + randomUUID();
    process.env.PERSISTENT_SESSIONS_ENABLED = 'false';
    prisma = new PrismaClient({ datasourceUrl: url });
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    app = module.createNestApplication({ bodyParser: false });
    configureBodyParsers(app);
    await app.init();
    const club = await prisma.club.create({
      data: { name: `${prefix}-foreign` },
    });
    for (const role of [
      'SYSTEM_ADMIN',
      'CLUB_ADMIN',
      'COACH',
      'PLAYER',
      'OTHER_SYSTEM',
    ] as const) {
      const actualRole = role === 'OTHER_SYSTEM' ? 'SYSTEM_ADMIN' : role;
      const user = await prisma.user.create({
        data: {
          id: role === 'SYSTEM_ADMIN' ? systemId : `${prefix}-${role}`,
          email: `${prefix}-${role}@example.test`,
          name: role,
          role: actualRole as UserRole,
          clubId: actualRole === 'SYSTEM_ADMIN' ? null : club.id,
          passwordHash: randomUUID(),
        },
      });
      tokens[role] = app.get(JwtService).sign({
        sub: user.id,
        email: user.email,
        role: user.role,
        clubId: user.clubId,
        ver: user.authVersion,
      });
    }
  });
  afterAll(async () => {
    await app?.close();
    await prisma?.$disconnect();
  });

  it('enforces administrator role on writes and reads', async () => {
    await request(app.getHttpServer())
      .post('/sporting/club-setup')
      .send(body())
      .expect(401);
    for (const role of ['CLUB_ADMIN', 'COACH', 'PLAYER']) {
      await post(body(), tokens[role]).expect(403);
      await status(randomUUID(), tokens[role]).expect(403);
    }
  });
  it('creates all projections and distinct same-name staff, without accounts/grants', async () => {
    const input = body();
    input.staff = ['p1', 'p2'].map((key) => ({
      key,
      name: 'Aynı Ad',
      role: 'HEAD_COACH',
      teamKey: 'u8',
      validFrom: input.season.startDate,
      validTo: input.season.endDate,
    }));
    const usersBefore = await prisma.user.count();
    const saved = await post(input).expect(201);
    expect(saved.headers['cache-control']).toBe('no-store');
    const clubId = saved.body.clubId as string;
    expect(saved.body).toMatchObject({
      state: 'completed',
      teamCount: 2,
      staffCount: 2,
    });
    expect(await prisma.user.count()).toBe(usersBefore);
    expect(await prisma.person.count({ where: { clubId } })).toBe(2);
    expect(
      await prisma.roleCapability.count({
        where: { roleDefinition: { clubId } },
      }),
    ).toBe(0);
    expect((await legacyParityReport(prisma, clubId)).status).toBe('IN_SYNC');
    expect(
      await prisma.club.findUnique({ where: { id: clubId } }),
    ).toMatchObject({
      primaryColor: '#fefefe',
      secondaryColor: '#123456',
      logo: null,
    });
    const assignment = await prisma.sportingAssignment.findFirstOrThrow({
      where: { clubId },
    });
    expect(assignment.validFrom.toISOString()).toBe('2026-08-13T21:00:00.000Z');
    expect(assignment.validTo?.toISOString()).toBe('2027-05-23T21:00:00.000Z');
    expect((await status(input.requestId).expect(200)).body).toEqual(
      saved.body,
    );
    expect(
      (await status(input.requestId, tokens.OTHER_SYSTEM).expect(200)).body,
    ).toEqual({ state: 'not-found' });
  });
  it('replays after process restart without mutation and rejects changed payload', async () => {
    const input = body();
    const first = await post(input).expect(201);
    const original = await prisma.club.findUniqueOrThrow({
      where: { id: first.body.clubId },
    });
    const replayService = new ClubSetupService(prisma as PrismaService);
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: systemId },
    });
    expect(
      await replayService.create(
        {
          id: user.id,
          userId: user.id,
          email: user.email,
          role: user.role,
          clubId: user.clubId,
        },
        input,
      ),
    ).toEqual(first.body);
    expect(
      (await prisma.club.findUniqueOrThrow({ where: { id: original.id } }))
        .updatedAt,
    ).toEqual(original.updatedAt);
    input.club.name += '-changed';
    await post(input).expect(409);
    expect((await status(input.requestId).expect(200)).body).toEqual(
      first.body,
    );
  });
  it('serializes simultaneous identical submissions into one club', async () => {
    const input = body();
    const responses = await Promise.all(
      Array.from({ length: 4 }, () => post(input)),
    );
    expect(responses.map((response) => response.status)).toEqual([
      201, 201, 201, 201,
    ]);
    expect(
      new Set(responses.map((response) => response.body.clubId)).size,
    ).toBe(1);
    expect(
      await prisma.team.count({ where: { clubId: responses[0].body.clubId } }),
    ).toBe(2);
  });
  it('rolls back every earlier write on late audit failure', async () => {
    // Interactive transactions have their own delegates; inject via Prisma extension.
    const faultPrisma = prisma.$extends({
      query: {
        securityAuditEvent: {
          create: async ({ args, query }) => {
            const metadata = args.data.metadata as { operation?: string };
            if (metadata?.operation === 'CLUB_SETUP_V1')
              throw new Error('injected late audit failure');
            return query(args);
          },
        },
      },
    });
    const service = new ClubSetupService(
      faultPrisma as unknown as PrismaService,
    );
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: systemId },
    });
    const principal = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      clubId: user.clubId,
    };
    const before = await prisma.club.count();
    const input = body();
    await expect(service.create(principal, input)).rejects.toMatchObject({
      status: 500,
    });
    expect(await prisma.club.count()).toBe(before);
    expect(await service.status(principal, input.requestId)).toEqual({
      state: 'not-found',
    });
  });
  it('rejects malformed payload, foreign references and oversized request without writes', async () => {
    const before = await prisma.club.count();
    await post({ ...body(), clubId: 'foreign' }).expect(400);
    await post({
      ...body(),
      staff: [{ key: 'p', personId: 'foreign' }],
    }).expect(400);
    await post({
      ...body(),
      club: { ...body().club, logo: 'x'.repeat(110_000) },
    }).expect(413);
    expect(await prisma.club.count()).toBe(before);
    await status('invalid').expect(400);
    expect((await status(randomUUID()).expect(200)).body).toEqual({
      state: 'not-found',
    });
  });
});
