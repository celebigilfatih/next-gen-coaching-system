# ADR-0017: Runtime and migrator image separation

- **Status:** Accepted
- **Date:** 2026-09-05
- **Owners / approvers:** Option 2 explicitly approved by user on 2026-09-05; named operations owner `TBD`
- **Supersedes / superseded by:** Refines the current backend Dockerfile and ADR-0006 deployment boundary
- **Related:** ADR-0006, ADR-0010, ADR-0016, BL-026, CR-012

## Context

The current multi-stage backend Dockerfile copies the builder's complete
`node_modules` directory into the final image. The builder needs the Prisma CLI
for client generation and controlled migrations need the CLI, but the serving
process starts only `node dist/main` and uses `@prisma/client`.

Consequently the final image contains build/test/CLI packages that the HTTP and
Socket.IO runtime does not require. ADR-0016 establishes that the current
`deepmerge-ts` advisory is not reachable through the supported application
boundary, but the packaging still violates the desired least-privilege and
runtime-only dependency posture.

## Decision Drivers

- Minimize production attack surface and scanner noise.
- Keep migrations explicit, separately observable and operator-controlled.
- Generate a Prisma Client compatible with the runtime artifact.
- Avoid divergent manifests, unreviewed overrides and destructive rollback.

## Considered Options

1. Keep copying the complete builder dependency tree into the runtime image.
2. Produce a runtime-only backend image and a separate migrator target/artifact
   from the same source, lockfile, schema and migration set.
3. Keep Prisma CLI in the runtime image but rely only on entrypoint restrictions.

## Decision

Choose Option 2:

- The runtime image contains compiled application output, generated Prisma Client
  and only required runtime dependencies/engines. It does not contain Prisma CLI,
  test tooling, source-only build tooling or seed scripts.
- A separate migrator target/artifact contains the pinned Prisma CLI and tracked
  migrations. It has no HTTP entrypoint and runs only the approved
  `prisma migrate deploy` operation.
- Runtime and migrator artifacts are built from the same immutable revision and
  lockfile. Their digests and migration status are observable release evidence.
- Migration credentials are available only to the migrator job. The serving
  runtime receives only the minimum database privileges approved for normal
  application operation; the exact privilege split is `TBD`.
- No `deepmerge-ts` override or Prisma downgrade is part of this change.

## Consequences

The serving image becomes smaller and excludes the known advisory chain from its
runtime dependency surface. Delivery gains a second artifact/job and therefore
needs explicit orchestration, credentials, failure handling and ownership.

The repository-local `npm audit --omit=dev` command still follows Prisma's
optional-peer metadata and reports the accepted three-entry advisory chain. The
actual runtime stage installs with both development and optional packages omitted;
its install reported zero vulnerabilities and its image inventory proves that
`prisma`, `@prisma/config` and `deepmerge-ts` are absent. These two measurements
answer different questions and must not be conflated.

## Rollout and Rollback

1. Confirm provider/build platform, registry, deployment orchestrator and owner
   before production rollout.
2. Build named runtime and migrator targets without changing application or
   Prisma schema behavior.
3. Verify runtime startup cannot invoke Prisma CLI and migrator cannot serve the
   application.
4. Apply migrations in a disposable PostgreSQL 16 environment, then run the full
   repository and E2E quality gates.
5. Rollback uses the previous immutable application image only when schema
   compatibility is proven; destructive migration rollback is not implied.

## Acceptance Gates

- Runtime dependency inventory excludes `prisma`, `@prisma/config` and
  `deepmerge-ts` while retaining a working generated Prisma Client.
- Migrator uses the repository lockfile and exactly the tracked migrations.
- Runtime and migration credentials, command allowlist, readiness and logs are
  documented without secrets.
- Image build, startup, migration status/schema diff, backend E2E, frontend E2E,
  `npm run quality`, CDSK and Markdown links pass.
- Production implementation and rollout receive explicit user approval.

## Verification Evidence

Verified on 2026-09-05 from the same working revision and lockfile:

- `runtime` and `migrator` Docker targets build successfully on Node 20 Alpine and
  both run as the unprivileged `node` user.
- Runtime inventory contains `dist/main.js`, `@prisma/client` and the generated
  `.prisma/client`; it contains no Prisma CLI, `@prisma/config`, `deepmerge-ts`,
  Nest CLI, Jest, source tree, migration tree or seed scripts.
- Migrator inventory contains the pinned Prisma CLI and the two tracked
  migrations, but no application `dist` or `src` tree and no HTTP entrypoint.
- The migrator applied both migrations to a clean disposable PostgreSQL 16
  database; a second run returned `No pending migrations to apply`.
- The runtime-only image started against that database, responded HTTP 200 on its
  current root smoke endpoint and reported Prisma Client `6.19.3` while the Prisma
  CLI remained unavailable.
- `docker compose --profile operations config --quiet`, root `npm run quality`,
  backend E2E 9/9 and frontend Playwright E2E 3/3 passed.

This evidence validates repository artifact separation, not production rollout.
Health/readiness, signing/SBOM, registry, credentials and orchestration remain
production gates.

## Open Questions

Container registry, build platform, deployment orchestrator, runtime/migrator
database roles, image signing/SBOM policy and named operations owner are `TBD`.
