# ADR-0017: Runtime and migrator image separation

- **Status:** Proposed
- **Date:** 2026-09-05
- **Owners / approvers:** Preparation approved by user; implementation approval and named operations owner `TBD`
- **Supersedes / superseded by:** Would refine the current backend Dockerfile and ADR-0006 deployment boundary
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

## Proposed Decision

Choose Option 2 after explicit implementation approval:

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

## Rollout and Rollback

1. Confirm provider/build platform, registry, deployment orchestrator and owner.
2. Implement named runtime and migrator targets without changing application or
   Prisma schema behavior.
3. Verify runtime startup cannot invoke Prisma CLI and migrator cannot serve the
   application.
4. Apply migrations in a disposable PostgreSQL 16 environment, then run the full
   repository and E2E quality gates against the runtime image.
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

## Open Questions

Container registry, build platform, deployment orchestrator, runtime/migrator
database roles, image signing/SBOM policy and named operations owner are `TBD`.
