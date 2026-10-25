// Maintenance only: ADR-0041. Never imported by the serving application.
/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS maintenance CLI. */
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { isDeepStrictEqual } = require('node:util');
const { PrismaClient } = require('@prisma/client');

const MANIFEST_HASH =
  'baac44256aea6e8c35b98db3489b3c9b39170e2a5a42881aec01749d41aa38b6';
const APPROVAL = 'ADR-0041:user-local-120-exception:2026-10-19';
const REVIEWER = 'Fatih Çelebigil';
const COMMENT = `${APPROVAL}; reviewer=${REVIEWER}; independentReview=false`;
const TEST_DATABASE = 'ngcs_starter_publication_test';
const fields = [
  'title',
  'summary',
  'category',
  'difficulty',
  'objectiveKey',
  'objectiveLabel',
  'themes',
  'durationMin',
  'playerMin',
  'playerMax',
  'areaLengthM',
  'areaWidthM',
  'equipmentItems',
  'organization',
  'steps',
  'coachingPoints',
  'progressions',
  'regressions',
  'constraints',
  'safetyNotes',
  'boardDocument',
];
const actions = [
  'DRILL_CONTENT_SUBMITTED',
  'DRILL_CONTENT_APPROVED',
  'DRILL_CONTENT_PUBLISHED',
];

function check(condition, message) {
  if (!condition) throw new Error(message);
}

function validateTarget(rawUrl, test = false) {
  const url = new URL(rawUrl);
  const database = decodeURIComponent(url.pathname.slice(1));
  check(
    ['postgres:', 'postgresql:'].includes(url.protocol) &&
      ['127.0.0.1', 'localhost'].includes(url.hostname) &&
      url.port === '5433' &&
      database === (test ? TEST_DATABASE : 'ngcs_local_session_dev') &&
      [...url.searchParams].every(
        ([key, value]) => key === 'schema' && value === 'public',
      ),
    'Refusing target outside the approved loopback database',
  );
  return database;
}

function loadManifest() {
  const manifest = JSON.parse(
    readFileSync(
      resolve(__dirname, '../../../content/drills/ngcs-starter-v1.json'),
      'utf8',
    ),
  );
  check(
    createHash('sha256').update(JSON.stringify(manifest)).digest('hex') ===
      MANIFEST_HASH,
    'Manifest differs from the approved release',
  );
  check(
    manifest.items.length === 120 && manifest.packId === 'ngcs-starter-v1',
    'Unexpected package',
  );
  return manifest;
}

async function inspect(tx, { database, actorEmail, manifest }) {
  const [target] =
    await tx.$queryRaw`SELECT current_database() AS db, current_schema() AS schema`;
  check(
    target.db === database && target.schema === 'public',
    'Connected target mismatch',
  );
  const actor = await tx.user.findUnique({ where: { email: actorEmail } });
  check(
    actor?.role === 'SYSTEM_ADMIN' && actor.status === 'ACTIVE',
    'An existing active SystemAdmin is required',
  );
  const versions = await tx.drillVersion.findMany({
    where: { drillId: { startsWith: 'ngcs-starter-v1-' } },
    include: { source: true, ageVariants: true, drill: true },
  });
  check(
    versions.length === 120,
    'Exactly 120 unchanged first versions are required',
  );
  for (const item of manifest.items) {
    const version = versions.find((v) => v.drillId === item.drillId);
    check(
      version?.version === 1 && version.createdById === actor.id,
      'Version identity or import actor changed',
    );
    check(
      version.drill.scope === 'GLOBAL' &&
        !version.drill.clubId &&
        !version.drill.groupId,
      'Unexpected drill scope',
    );
    for (const field of fields)
      check(
        isDeepStrictEqual(version[field], item[field]),
        `Content changed: ${item.drillId}.${field}`,
      );
    for (const [field, value] of Object.entries(item.source))
      check(isDeepStrictEqual(version.source[field], value), 'Source changed');
    check(
      version.ageVariants.length === item.ageVariants.length,
      'Age adaptations changed',
    );
    for (const age of item.ageVariants) {
      const stored = version.ageVariants.find(
        (v) => v.ageGroup === age.ageGroup,
      );
      for (const [field, value] of Object.entries(age))
        check(
          stored && isDeepStrictEqual(stored[field], value),
          'Age adaptation changed',
        );
    }
    check(
      isDeepStrictEqual(version.drill.jsonData, item.boardDocument) &&
        version.drill.title === item.title &&
        version.drill.category === item.category &&
        version.drill.ageGroup === item.ageVariants[0].ageGroup &&
        version.drill.durationMin === item.durationMin &&
        version.drill.difficulty === item.difficulty &&
        version.drill.equipment === item.equipmentItems.join(', '),
      'Legacy drill projection changed',
    );
  }
  const audits = await tx.securityAuditEvent.findMany({
    where: { metadata: { path: ['approvalReference'], equals: APPROVAL } },
    select: { action: true, actorId: true, metadata: true },
  });
  const complete = versions.every(
    (v) =>
      v.status === 'PUBLISHED' &&
      v.reviewedById === actor.id &&
      v.publishedById === actor.id &&
      v.submittedAt &&
      v.approvedAt &&
      v.publishedAt &&
      !v.archivedAt &&
      v.reviewComment === COMMENT &&
      v.source.verifiedById === actor.id &&
      v.source.licenseVerifiedAt,
  );
  if (complete) {
    check(
      audits.length === 360 &&
        versions.every((v) =>
          actions.every(
            (action) =>
              audits.filter(
                (a) =>
                  a.action === action &&
                  a.actorId === actor.id &&
                  a.metadata.versionId === v.id &&
                  a.metadata.manifestSha256 === MANIFEST_HASH &&
                  a.metadata.exceptionAdr === 'ADR-0041' &&
                  a.metadata.reviewerName === REVIEWER &&
                  a.metadata.independentReview === false,
              ).length === 1,
          ),
        ),
      'Completed release audit does not match; manual verification required',
    );
  } else {
    check(
      audits.length === 0 &&
        versions.every(
          (v) =>
            v.status === 'DRAFT' &&
            !v.reviewedById &&
            !v.publishedById &&
            !v.submittedAt &&
            !v.approvedAt &&
            !v.publishedAt &&
            !v.archivedAt &&
            !v.reviewComment &&
            !v.source.verifiedById &&
            !v.source.licenseVerifiedAt,
        ),
      'Mixed or changed editorial state; verify before any retry',
    );
  }
  return { actor, versions, complete };
}

async function publishLocalStarter(prisma, options) {
  check(
    ['ngcs_local_session_dev', TEST_DATABASE].includes(options.database) &&
      process.env.NODE_ENV !== 'production',
    'Unsupported maintenance target',
  );
  check(
    createHash('sha256')
      .update(JSON.stringify(options.manifest))
      .digest('hex') === MANIFEST_HASH,
    'Manifest differs from the approved release',
  );
  return prisma.$transaction(
    async (tx) => {
      const { actor, versions, complete } = await inspect(tx, options);
      if (!options.apply || complete)
        return {
          dryRun: !options.apply,
          published: 0,
          alreadyPublished: complete ? 120 : 0,
          ready: 120,
        };
      const now = new Date();
      for (const version of versions) {
        const metadata = {
          drillId: version.drillId,
          versionId: version.id,
          version: 1,
          exceptionAdr: 'ADR-0041',
          approvalReference: APPROVAL,
          reviewerName: REVIEWER,
          independentReview: false,
          scope: 'LOCAL_STARTER_ONLY',
          manifestSha256: MANIFEST_HASH,
        };
        await tx.drillVersion.update({
          where: { id: version.id, status: 'DRAFT' },
          data: { status: 'IN_REVIEW', submittedAt: now },
        });
        await tx.securityAuditEvent.create({
          data: { action: actions[0], actorId: actor.id, metadata },
        });
        await tx.drillSource.update({
          where: { id: version.sourceId },
          data: { verifiedById: actor.id, licenseVerifiedAt: now },
        });
        await tx.drillVersion.update({
          where: { id: version.id, status: 'IN_REVIEW' },
          data: {
            status: 'APPROVED',
            reviewedById: actor.id,
            approvedAt: now,
            reviewComment: COMMENT,
          },
        });
        await tx.securityAuditEvent.create({
          data: { action: actions[1], actorId: actor.id, metadata },
        });
        await tx.drillVersion.update({
          where: { id: version.id, status: 'APPROVED' },
          data: {
            status: 'PUBLISHED',
            publishedById: actor.id,
            publishedAt: now,
          },
        });
        await tx.securityAuditEvent.create({
          data: { action: actions[2], actorId: actor.id, metadata },
        });
      }
      return { dryRun: false, published: 120, alreadyPublished: 0, ready: 120 };
    },
    { isolationLevel: 'Serializable', timeout: 30000 },
  );
}

async function cli() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const actorEmail = args[args.indexOf('--actor-email') + 1];
  check(
    args.includes('--actor-email') && actorEmail,
    '--actor-email is required',
  );
  const test = process.env.NGCS_STARTER_PUBLICATION_TEST === 'true';
  const database = validateTarget(process.env.DATABASE_URL, test);
  check(
    process.env.NODE_ENV !== 'production',
    'Production execution is prohibited',
  );
  const manifest = loadManifest();
  if (apply) {
    check(
      process.env.NGCS_ALLOW_LOCAL_STARTER_PUBLICATION === 'true',
      'Explicit apply opt-in required',
    );
    check(
      args[args.indexOf('--approval-reference') + 1] === APPROVAL &&
        args.includes('--approval-reference'),
      'Exact approval reference required',
    );
    const adr = readFileSync(
      resolve(
        __dirname,
        '../../../docs/50-decisions/ADR-0041-local-starter-review-exception.md',
      ),
      'utf8',
    );
    check(adr.includes('**Status:** Accepted'), 'ADR-0041 must be Accepted');
  }
  const prisma = new PrismaClient();
  try {
    console.log(
      JSON.stringify(
        await publishLocalStarter(prisma, {
          database,
          actorEmail,
          manifest,
          apply,
        }),
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = {
  validateTarget,
  loadManifest,
  publishLocalStarter,
  APPROVAL,
  TEST_DATABASE,
};
if (require.main === module)
  cli().catch(() => {
    console.error(
      'Local starter publication stopped. Verify database state before retry; no automatic retry.',
    );
    process.exitCode = 1;
  });
