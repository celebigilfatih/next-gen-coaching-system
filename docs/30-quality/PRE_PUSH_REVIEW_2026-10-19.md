# Publication review — 2026-10-19

User explicitly requested a final check, commit and push of the accumulated
approved changes to `codex/mvp-stabilization`, preserving `main`.

## Reviewed scope

Guided club/season/team/staff setup with logo/colors; frozen published exercise
content and exact-age plan attachment; mixed weekly/season planning with durable
replay and fixture-date reconciliation preserving manual decisions; coaching
catalogue/detail/tactical UI; Windows quality tooling and repository-owned CDSK.
Existing Accepted ADR-0037–0047 record these increments and local rollout boundaries.
Operational usage assumes at most three matches/week as the user clarified;
the previously implemented five-match capacity remains tested and unchanged.

Review covered setup/planning controllers and transaction authorization, scoped
content attachment/projection/publication, template ownership/rollback contracts,
additive SQL, local-operator guards and frontend scope/draft behavior. No additional
runtime change was needed in this publication pass. No deployment, migration,
retained data rewrite or new InfraScope feature is part of publication.

The three pending-in-Git migrations are the already approved additive color,
contentSnapshot and audit-enum migrations; publication does not reapply them.
Actual local migration/backup evidence remains in the corresponding reports.

## Fresh verification

`node scripts/quality-gate.mjs --continue-on-error` exits0; all17 stages pass:

| Check | Result |
| --- | --- |
| Quality tooling | 8 Node tests pass; nested Python16 pass/1 Windows privilege skip |
| Backend | 62 suites /918 tests; isolated Prisma, type, lint, format and build pass |
| Frontend | 61 files /509 tests; type, lint, format and production build pass |
| Sites packaging | 4/4 pass |
| CDSK | 36 required documents /47 ADRs /0 errors |
| Local Markdown links | 180 files /0 broken at full-gate run; final metadata rechecked |
| Git whitespace | Full gate and staged diff both pass |

Additional fresh PostgreSQL HTTP runs use only exact dedicated loopback databases:
club setup6/6, ready-drill planning9/9, week/fixture planning21/21:36/36 total.
No retained DB is targeted. Expected injected-failure diagnostics test rollback.
Operator unit guards8 pass;2 opt-in PostgreSQL operator cases are skipped and are
not claimed as fresh integration passes. Syntax checks pass for all9 operator JS
files. Earlier operator/retained rehearsal evidence remains separately dated.

Ignored local logs: `output/pre-push-quality-20261019.log` and
`output/pre-push-*.e2e-spec.log`. This review does not rerun manual browser QA;
existing viewport/retained screenshots are included with their original evidence.

## Publication hygiene and branch checks

`.gitignore` now excludes all root `output/`, Python cache directories and bytecode.
This keeps scratch DB row/hash baselines and local verification helpers out of Git;
the existing environment/log/dependency/build exclusions remain. Valid versioned
frontend QA images remain. No file is removed from the user's local output folder.
Candidate and staged text scans find no private-key/provider-key/literal-JWT or
personal-contact matches; no environment, dump, log or output artifact is staged.
This is a focused publication-hygiene check, not an exhaustive security audit.

Before commit, local HEAD and remote target both equal
`33442ffb1f8b015798d0c2c3f7307086899b143f`. Local and remote `main` both equal
`1b831e087b727b80bfed0d47005bb0b95fa0852f`. The only push target is explicit
`HEAD:refs/heads/codex/mvp-stabilization`; never force push. Final commit/remote
identity and unchanged-main checks are verified from Git after publication.

Git identity on this computer is unset; use command-scoped identity from the
existing repository commit, without changing global/local user settings. No
core.hooksPath or active `.git/hooks` hook is configured on this installation.
Tracked legacy lint-staged routing remains BL-059; no hook-disable override is
needed or planned. The complete explicit quality gate above is the delivery check.
