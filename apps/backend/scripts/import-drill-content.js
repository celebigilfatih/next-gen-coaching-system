const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { PrismaClient } = require('@prisma/client');

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const actorFlag = args.indexOf('--actor-email');
const actorEmail = actorFlag >= 0 ? args[actorFlag + 1] : undefined;
const fileFlag = args.indexOf('--file');
const manifestPath = resolve(
  fileFlag >= 0
    ? args[fileFlag + 1]
    : '../../content/drills/ngcs-starter-v1.json',
);

function fail(message) {
  throw new Error(`Drill content manifest rejected: ${message}`);
}

function validate(manifest) {
  if (!manifest || manifest.schemaVersion !== 1)
    fail('schemaVersion must be 1');
  if (manifest.publicationStatus !== 'DRAFT') fail('pack must remain DRAFT');
  if (manifest.reviewer !== 'TBD')
    fail('reviewer must remain TBD until assigned');
  if (!Array.isArray(manifest.items) || manifest.items.length !== 120)
    fail('exactly 120 exercises are required');
  if (manifest.count !== manifest.items.length)
    fail('count does not match items');
  const ids = new Set();
  for (const item of manifest.items) {
    if (!item.drillId || ids.has(item.drillId)) fail('drillId must be unique');
    ids.add(item.drillId);
    if (
      !['WARM_UP', 'TECHNICAL', 'TACTICAL', 'COOL_DOWN'].includes(item.category)
    )
      fail(`${item.drillId} has an invalid category`);
    if (!['EASY', 'MEDIUM', 'HARD'].includes(item.difficulty))
      fail(`${item.drillId} has an invalid difficulty`);
    for (const field of [
      'steps',
      'coachingPoints',
      'progressions',
      'regressions',
      'ageVariants',
    ]) {
      if (!Array.isArray(item[field]) || item[field].length === 0)
        fail(`${item.drillId}.${field} is required`);
    }
    if (
      item.source?.kind !== 'NGCS_ORIGINAL' ||
      item.source?.license !== 'NGCS_PROPRIETARY' ||
      !/^[a-f0-9]{64}$/.test(item.source?.contentHash ?? '')
    )
      fail(`${item.drillId} has an invalid rights basis`);
    const clone = JSON.parse(JSON.stringify(item));
    delete clone.source.contentHash;
    const expected = createHash('sha256')
      .update(JSON.stringify(clone))
      .digest('hex');
    if (expected !== item.source.contentHash)
      fail(`${item.drillId} checksum mismatch`);
    const board = item.boardDocument;
    if (
      board?.schemaVersion !== 1 ||
      board?.kind !== 'tactical-board' ||
      board?.pitch?.type !== 'training' ||
      board?.pitch?.width !== 750 ||
      board?.pitch?.height !== 550 ||
      !Array.isArray(board.elements) ||
      board.elements.length === 0 ||
      board.elements.length > 250
    )
      fail(`${item.drillId} has an invalid tactical board`);
    const ages = new Set(item.ageVariants.map((variant) => variant.ageGroup));
    if (ages.size !== item.ageVariants.length)
      fail(`${item.drillId} repeats an age variant`);
  }
  const ageCoverage = ['U12', 'U14', 'U16', 'U18', 'SENIOR'].map((ageGroup) => [
    ageGroup,
    manifest.items.filter((item) =>
      item.ageVariants.some((variant) => variant.ageGroup === ageGroup),
    ).length,
  ]);
  if (ageCoverage.some(([, count]) => count < 24))
    fail('age coverage is below 24');
  for (const ageGroup of ['U12', 'U14', 'U16', 'U18', 'SENIOR']) {
    const primary = manifest.items.filter(
      (item) => item.ageVariants[0]?.ageGroup === ageGroup,
    );
    if (primary.length !== 24)
      fail(`${ageGroup} must have exactly 24 primary exercises`);
    const distribution = Object.fromEntries(
      ['WARM_UP', 'TECHNICAL', 'TACTICAL', 'COOL_DOWN'].map((category) => [
        category,
        primary.filter((item) => item.category === category).length,
      ]),
    );
    if (
      distribution.WARM_UP < 4 ||
      distribution.TECHNICAL < 8 ||
      distribution.TACTICAL < 8 ||
      distribution.COOL_DOWN < 4
    )
      fail(`${ageGroup} category distribution is below the approved minimum`);
  }
  return ageCoverage;
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const coverage = validate(manifest);
process.stdout.write(
  `Validated ${manifest.items.length} draft exercises (${coverage.map(([age, count]) => `${age}:${count}`).join(', ')})\n`,
);

if (!apply) process.exit(0);
if (process.env.NGCS_ALLOW_CONTENT_IMPORT !== 'true')
  fail('NGCS_ALLOW_CONTENT_IMPORT=true is required for --apply');
if (!actorEmail) fail('--actor-email is required for --apply');

const prisma = new PrismaClient();
async function main() {
  const actor = await prisma.user.findUnique({ where: { email: actorEmail } });
  if (!actor || actor.role !== 'SYSTEM_ADMIN' || actor.status !== 'ACTIVE')
    fail('an active SYSTEM_ADMIN actor is required');
  let created = 0;
  let skipped = 0;
  for (const item of manifest.items) {
    const exists = await prisma.drillSource.findFirst({
      where: { contentHash: item.source.contentHash },
      select: { id: true },
    });
    if (exists) {
      skipped += 1;
      continue;
    }
    await prisma.$transaction(async (tx) => {
      const drill = await tx.drill.upsert({
        where: { id: item.drillId },
        create: {
          id: item.drillId,
          title: item.title,
          category: item.category,
          ageGroup: item.ageVariants[0].ageGroup,
          durationMin: item.durationMin,
          difficulty: item.difficulty,
          equipment: item.equipmentItems.join(', '),
          jsonData: item.boardDocument,
          scope: 'GLOBAL',
        },
        update: {},
      });
      const latest = await tx.drillVersion.aggregate({
        where: { drillId: drill.id },
        _max: { version: true },
      });
      const source = await tx.drillSource.create({ data: item.source });
      const version = await tx.drillVersion.create({
        data: {
          drillId: drill.id,
          version: (latest._max.version ?? 0) + 1,
          status: 'DRAFT',
          title: item.title,
          summary: item.summary,
          category: item.category,
          difficulty: item.difficulty,
          objectiveKey: item.objectiveKey,
          objectiveLabel: item.objectiveLabel,
          themes: item.themes,
          durationMin: item.durationMin,
          playerMin: item.playerMin,
          playerMax: item.playerMax,
          areaLengthM: item.areaLengthM,
          areaWidthM: item.areaWidthM,
          equipmentItems: item.equipmentItems,
          organization: item.organization,
          steps: item.steps,
          coachingPoints: item.coachingPoints,
          progressions: item.progressions,
          regressions: item.regressions,
          constraints: item.constraints,
          safetyNotes: item.safetyNotes,
          boardDocument: item.boardDocument,
          searchText: [
            item.title,
            item.summary,
            item.objectiveLabel,
            ...item.themes,
            ...item.equipmentItems,
          ]
            .join(' ')
            .toLocaleLowerCase('tr-TR'),
          sourceId: source.id,
          createdById: actor.id,
          ageVariants: { create: item.ageVariants },
        },
      });
      await tx.securityAuditEvent.create({
        data: {
          action: 'DRILL_CONTENT_DRAFT_CREATED',
          actorId: actor.id,
          metadata: {
            drillId: drill.id,
            versionId: version.id,
            version: version.version,
          },
        },
      });
    });
    created += 1;
  }
  process.stdout.write(
    `Imported ${created} drafts; skipped ${skipped} existing records\n`,
  );
}

main()
  .catch((error) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
