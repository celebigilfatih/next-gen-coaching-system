// Maintenance only: ADR-0048. Never imported by the serving application.
/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS maintenance CLI. */
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { URL } = require('node:url');
const { isDeepStrictEqual: equal } = require('node:util');
const { PrismaClient } = require('@prisma/client');
const MANIFEST_HASH =
  'b6b38673f328b6ab6f6d5b4850c9ee1c031076c501535b00d996716cff880f0c';
const PREVIOUS_HASH =
  'baac44256aea6e8c35b98db3489b3c9b39170e2a5a42881aec01749d41aa38b6';
const APPROVAL = 'ADR-0048:fatih-celebigil-local-v2-120:2026-10-27';
const REVIEWER = 'Fatih Çelebigil';
const COMMENT =
  APPROVAL + '; reviewer=' + REVIEWER + '; independentReview=false';
const TEST_DATABASE = 'ngcs_diagram_publication_test_20261027';
const RESTORE_DATABASE = 'ngcs_diagram_publication_restore_test_20261027';
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
  'DRILL_CONTENT_DRAFT_CREATED',
  'DRILL_CONTENT_SUBMITTED',
  'DRILL_CONTENT_APPROVED',
  'DRILL_CONTENT_ARCHIVED',
  'DRILL_CONTENT_PUBLISHED',
];
const hash = (value) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');
function check(condition, message) {
  if (!condition) throw Error(message);
}
function validateTarget(rawUrl, test = false) {
  const url = new URL(rawUrl),
    database = decodeURIComponent(url.pathname.slice(1));
  check(
    ['postgres:', 'postgresql:'].includes(url.protocol) &&
      ['127.0.0.1', 'localhost'].includes(url.hostname) &&
      url.port === '5433' &&
      (test
        ? [TEST_DATABASE, RESTORE_DATABASE].includes(database)
        : database === 'ngcs_local_session_dev') &&
      !url.hash &&
      [...url.searchParams].every(
        ([key, value]) => key === 'schema' && value === 'public',
      ),
    'Refusing target outside the approved loopback database',
  );
  return database;
}
function validateRelease({ previous, manifest }) {
  check(
    hash(previous) === PREVIOUS_HASH && hash(manifest) === MANIFEST_HASH,
    'Manifest differs from the approved release',
  );
  check(
    manifest.packId === 'ngcs-starter-diagrams-v2' &&
      manifest.items.length === 120 &&
      equal(
        manifest.items.map((item) => item.drillId),
        previous.items.map((item) => item.drillId),
      ),
    'Unexpected package identities',
  );
}
function loadRelease() {
  const read = (name) =>
    JSON.parse(
      readFileSync(resolve(__dirname, '../../../content/drills', name), 'utf8'),
    );
  const release = {
    previous: read('ngcs-starter-v1.json'),
    manifest: read('ngcs-starter-diagrams-v2.json'),
  };
  validateRelease(release);
  return release;
}
function compare(version, item) {
  for (const field of fields)
    check(
      equal(version[field], item[field]),
      'Content changed: ' + item.drillId + '.' + field,
    );
  for (const [field, value] of Object.entries(item.source))
    check(equal(version.source[field], value), 'Source changed');
  check(
    version.ageVariants.length === item.ageVariants.length,
    'Age adaptations changed',
  );
  for (const age of item.ageVariants) {
    const stored = version.ageVariants.find(
      (row) => row.ageGroup === age.ageGroup,
    );
    for (const [field, value] of Object.entries(age))
      check(stored && equal(stored[field], value), 'Age adaptation changed');
  }
}
function compareProjection(drill, item, originalImport = false) {
  const primary = item.ageVariants[0];
  check(
    drill.scope === 'GLOBAL' &&
      !drill.clubId &&
      !drill.groupId &&
      drill.title === item.title &&
      drill.category === item.category &&
      drill.ageGroup === primary.ageGroup &&
      drill.durationMin ===
        (originalImport ? item.durationMin : primary.durationMin) &&
      drill.difficulty === item.difficulty &&
      drill.equipment === item.equipmentItems.join(', ') &&
      equal(drill.jsonData, item.boardDocument),
    'Legacy drill projection changed',
  );
}
async function inspect(tx, { database, actorEmail, previous, manifest }) {
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
  const references = await tx.planDrill.findMany({
    where: { drillId: { in: manifest.items.map((item) => item.drillId) } },
    select: { contentSnapshot: true },
  });
  check(
    references.every(
      ({ contentSnapshot: snapshot }) =>
        snapshot &&
        typeof snapshot === 'object' &&
        snapshot.schemaVersion === 1 &&
        typeof snapshot.title === 'string' &&
        Number.isInteger(snapshot.durationMin) &&
        snapshot.durationMin > 0,
    ),
    'Unfrozen plan reference; preserve legacy fallback explicitly before publication',
  );
  const versions = await tx.drillVersion.findMany({
    where: { drillId: { in: manifest.items.map((item) => item.drillId) } },
    include: { source: true, ageVariants: true, drill: true },
  });
  check(
    versions.length === 120 || versions.length === 240,
    'Mixed or changed revision set; inspect before retry',
  );
  const old = versions.filter((row) => row.version === 1),
    fresh = versions.filter((row) => row.version === 2);
  check(
    old.length === 120 && (fresh.length === 0 || fresh.length === 120),
    'Mixed or changed revision set; inspect before retry',
  );
  for (const item of previous.items) {
    const version = old.find((row) => row.drillId === item.drillId);
    check(
      version?.createdById === actor.id &&
        version.reviewedById === actor.id &&
        version.publishedById === actor.id &&
        version.submittedAt &&
        version.approvedAt &&
        version.publishedAt &&
        version.source.verifiedById === actor.id &&
        version.source.licenseVerifiedAt,
      'Original author or publication verification changed',
    );
    compare(version, item);
  }
  const audits = await tx.securityAuditEvent.findMany({
    where: { metadata: { path: ['approvalReference'], equals: APPROVAL } },
    select: { action: true, actorId: true, metadata: true },
  });
  const complete = fresh.length === 120;
  if (complete) {
    for (const item of manifest.items) {
      const version = fresh.find((row) => row.drillId === item.drillId),
        archived = old.find((row) => row.drillId === item.drillId);
      compare(version, item);
      compareProjection(version.drill, item);
      check(
        version.createdById === actor.id &&
          version.status === 'PUBLISHED' &&
          version.reviewedById === actor.id &&
          version.publishedById === actor.id &&
          version.submittedAt &&
          version.approvedAt &&
          version.publishedAt &&
          !version.archivedAt &&
          version.reviewComment === COMMENT &&
          version.source.verifiedById === actor.id &&
          version.source.licenseVerifiedAt &&
          archived.status === 'ARCHIVED' &&
          archived.archivedAt &&
          archived.archivedAt.getTime() === version.publishedAt.getTime(),
        'Mixed or changed completed release',
      );
    }
    check(
      audits.length === 600 &&
        manifest.items.every((item) =>
          actions.every((action) => {
            const row = (
              action === 'DRILL_CONTENT_ARCHIVED' ? old : fresh
            ).find((version) => version.drillId === item.drillId);
            return (
              audits.filter(
                (a) =>
                  a.action === action &&
                  a.actorId === actor.id &&
                  a.metadata.drillId === item.drillId &&
                  a.metadata.versionId === row.id &&
                  a.metadata.version === row.version &&
                  a.metadata.manifestSha256 === MANIFEST_HASH &&
                  a.metadata.exceptionAdr === 'ADR-0048' &&
                  a.metadata.approvalReference === APPROVAL &&
                  a.metadata.reviewerName === REVIEWER &&
                  a.metadata.independentReview === false &&
                  a.metadata.scope === 'LOCAL_DIAGRAM_REVISION_ONLY',
              ).length === 1
            );
          }),
        ),
      'Completed release audit does not match; inspect before retry',
    );
  } else {
    check(
      audits.length === 0 &&
        old.every((row) => row.status === 'PUBLISHED' && !row.archivedAt),
      'Mixed or changed editorial state; inspect before retry',
    );
    for (const item of previous.items)
      compareProjection(
        old.find((row) => row.drillId === item.drillId).drill,
        item,
        true,
      );
    check(
      (await tx.drillSource.count({
        where: {
          contentHash: {
            in: manifest.items.map((item) => item.source.contentHash),
          },
        },
      })) === 0,
      'Revision source already exists; inspect before retry',
    );
  }
  return { actor, old, complete };
}
async function publishLocalDiagramRevision(prisma, options) {
  check(
    ['ngcs_local_session_dev', TEST_DATABASE, RESTORE_DATABASE].includes(
      options.database,
    ) && process.env.NODE_ENV !== 'production',
    'Unsupported maintenance target',
  );
  validateRelease(options);
  return prisma.$transaction(
    async (tx) => {
      const { actor, old, complete } = await inspect(tx, options);
      if (!options.apply || complete)
        return {
          dryRun: !options.apply,
          ready: 120,
          imported: 0,
          published: 0,
          archived: 0,
          alreadyPublished: complete ? 120 : 0,
        };
      const now = new Date();
      const audit = (action, version) =>
        tx.securityAuditEvent.create({
          data: {
            action,
            actorId: actor.id,
            metadata: {
              drillId: version.drillId,
              versionId: version.id,
              version: version.version,
              exceptionAdr: 'ADR-0048',
              approvalReference: APPROVAL,
              reviewerName: REVIEWER,
              independentReview: false,
              scope: 'LOCAL_DIAGRAM_REVISION_ONLY',
              manifestSha256: MANIFEST_HASH,
            },
          },
        });
      for (const item of options.manifest.items) {
        const source = await tx.drillSource.create({ data: item.source });
        const data = Object.fromEntries(
          fields.map((field) => [field, item[field]]),
        );
        const fresh = await tx.drillVersion.create({
          data: {
            ...data,
            drillId: item.drillId,
            version: 2,
            status: 'DRAFT',
            createdById: actor.id,
            sourceId: source.id,
            searchText: [
              item.title,
              item.summary,
              item.objectiveLabel,
              ...item.themes,
              ...item.equipmentItems,
            ]
              .join(' ')
              .toLocaleLowerCase('tr-TR'),
            ageVariants: { create: item.ageVariants },
          },
        });
        await audit(actions[0], fresh);
        await tx.drillVersion.update({
          where: { id: fresh.id, status: 'DRAFT' },
          data: { status: 'IN_REVIEW', submittedAt: now },
        });
        await audit(actions[1], fresh);
        await tx.drillSource.update({
          where: { id: source.id },
          data: { verifiedById: actor.id, licenseVerifiedAt: now },
        });
        await tx.drillVersion.update({
          where: { id: fresh.id, status: 'IN_REVIEW' },
          data: {
            status: 'APPROVED',
            reviewedById: actor.id,
            approvedAt: now,
            reviewComment: COMMENT,
          },
        });
        await audit(actions[2], fresh);
        const archived = old.find((row) => row.drillId === item.drillId);
        await tx.drillVersion.update({
          where: { id: archived.id, status: 'PUBLISHED' },
          data: { status: 'ARCHIVED', archivedAt: now },
        });
        await audit(actions[3], archived);
        await tx.drillVersion.update({
          where: { id: fresh.id, status: 'APPROVED' },
          data: {
            status: 'PUBLISHED',
            publishedById: actor.id,
            publishedAt: now,
          },
        });
        const primary = item.ageVariants[0];
        await tx.drill.update({
          where: { id: item.drillId },
          data: {
            title: item.title,
            category: item.category,
            ageGroup: primary.ageGroup,
            durationMin: primary.durationMin,
            difficulty: item.difficulty,
            equipment: item.equipmentItems.join(', '),
            jsonData: item.boardDocument,
          },
        });
        await audit(actions[4], fresh);
      }
      check(
        (await inspect(tx, options)).complete,
        'Release postcondition failed',
      );
      return {
        dryRun: false,
        ready: 120,
        imported: 120,
        published: 120,
        archived: 120,
        alreadyPublished: 0,
      };
    },
    { isolationLevel: 'Serializable', timeout: 60000 },
  );
}
async function cli() {
  const args = process.argv.slice(2),
    options = { apply: false },
    seen = new Set();
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    check(!seen.has(flag), 'Duplicate option');
    seen.add(flag);
    if (flag === '--apply') options.apply = true;
    else if (flag === '--actor-email' || flag === '--approval-reference') {
      check(
        args[i + 1] && !args[i + 1].startsWith('--'),
        'Missing option value',
      );
      options[flag === '--actor-email' ? 'actorEmail' : 'approvalReference'] =
        args[++i];
    } else throw Error('Unknown option');
  }
  check(options.actorEmail, '--actor-email is required');
  options.database = validateTarget(
    process.env.DATABASE_URL,
    process.env.NGCS_DIAGRAM_PUBLICATION_TEST === 'true',
  );
  check(
    process.env.NODE_ENV !== 'production',
    'Production execution is prohibited',
  );
  Object.assign(options, loadRelease());
  if (options.apply) {
    check(
      process.env.NGCS_ALLOW_LOCAL_DIAGRAM_PUBLICATION === 'true',
      'Explicit apply opt-in required',
    );
    check(
      options.approvalReference === APPROVAL,
      'Exact approval reference required',
    );
    const adr = readFileSync(
      resolve(
        __dirname,
        '../../../docs/50-decisions/ADR-0048-local-diagram-revision-review-exception.md',
      ),
      'utf8',
    );
    check(
      adr.includes('**Status:** Accepted') && adr.includes(MANIFEST_HASH),
      'Accepted exact-release ADR required',
    );
  }
  const prisma = new PrismaClient();
  try {
    console.log(
      JSON.stringify(await publishLocalDiagramRevision(prisma, options)),
    );
  } finally {
    await prisma.$disconnect();
  }
}
module.exports = {
  validateTarget,
  loadRelease,
  publishLocalDiagramRevision,
  TEST_DATABASE,
  RESTORE_DATABASE,
  APPROVAL,
  MANIFEST_HASH,
};
if (require.main === module)
  cli().catch(() => {
    console.error(
      'Local diagram publication stopped. Verify database state before retry; no automatic retry.',
    );
    process.exitCode = 1;
  });
