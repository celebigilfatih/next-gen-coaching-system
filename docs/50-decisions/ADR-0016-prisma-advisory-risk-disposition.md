# ADR-0016: Prisma CLI advisory risk disposition

- **Status:** Accepted
- **Date:** 2026-09-05
- **Owners / approvers:** User approval; named security/operations owner `TBD`
- **Supersedes / superseded by:** N/A
- **Related:** BL-025, CR-011, GHSA-ggr8-5vv4-36mx, ADR-0006, ADR-0010

## Context

`npm audit --omit=dev` reports three high entries for one transitive advisory
chain: direct `prisma@6.19.3` → `@prisma/config@6.19.3` →
`deepmerge-ts@7.1.5`. GHSA-ggr8-5vv4-36mx affects `deepmerge-ts < 8.0.0` when
two attacker-influenced recursive JavaScript object graphs are merged, causing
synchronous stack exhaustion.

Repository evidence shows that NGCS runtime code imports `@prisma/client`, not
`@prisma/config` or `deepmerge-ts`. The affected merge call is inside the Prisma
CLI configuration loader. NGCS has no `prisma.config.ts/js`; application HTTP and
Socket.IO inputs do not reach that loader. A JavaScript/TypeScript Prisma config
is trusted developer/operator code and is executable by design.

There is no repository `SECURITY.md`; the boundary assessment therefore relies
on the shipped NestJS entrypoint, package/import graph, Dockerfile and operations
documents.

## Decision

- The advisory is `not_actionable` for the currently supported hosted NGCS
  runtime boundary. It is retained as dependency-hygiene and production-image
  hardening evidence, not treated as a remotely exploitable application finding.
- The current transitive version is temporarily accepted. This acceptance does
  not approve production rollout; ADR-0010 production gates remain binding.
- `npm audit fix --force`, the scanner-proposed Prisma `6.12.0` downgrade and an
  unverified `deepmerge-ts` major-version override will not be applied.
- The risk must be reviewed again before production rollout, when Prisma ships a
  compatible patched dependency, if a `prisma.config.ts/js` file is introduced,
  or if Prisma CLI/configuration becomes reachable by a less-trusted actor.
- Runtime-image removal of the Prisma CLI is handled separately by Proposed
  ADR-0017 and CR-012.

## Consequences

The application avoids an unverified dependency override or ORM downgrade while
the scanner finding remains visible and explicitly explained. Production
artifact hygiene remains unfinished until ADR-0017 is accepted and implemented.

## Verification Evidence

- `npm ls prisma @prisma/config deepmerge-ts --all` resolves the single chain to
  Prisma `6.19.3`, `@prisma/config` `6.19.3` and `deepmerge-ts` `7.1.5`.
- `npm audit --omit=dev --json` reports GHSA-ggr8-5vv4-36mx as the underlying
  advisory and offers only the Prisma `6.12.0` forced downgrade.
- Source search finds the vulnerable merge only in the installed
  `@prisma/config` CLI loader; NGCS runtime source imports only `@prisma/client`.
- The production entrypoint is `node dist/main`; Prisma CLI commands are explicit
  build or operator migration steps.

## References

- [GitHub Advisory GHSA-ggr8-5vv4-36mx](https://github.com/advisories/GHSA-ggr8-5vv4-36mx)
- [Prisma upstream issue #30052](https://github.com/prisma/orm/issues/30052)

## Open Questions

Compatible upstream Prisma release timing and named security/operations owner are
`TBD`.
