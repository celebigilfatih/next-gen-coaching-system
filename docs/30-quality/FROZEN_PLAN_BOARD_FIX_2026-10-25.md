# Frozen plan-board absence correction — 2026-10-25

The user explicitly requested fixing PR#1's frozen-absence P2, regression tests,
the root quality gate, publication on codex/mvp-stabilization and conditional
ready-for-review transition. Base: dc24eb400f756c2d727b1050d592b4cd64af4117.
The [original finding](PR_MAIN_READINESS_2026-10-20.md) remains historical evidence.

## Contract and implementation

A non-null contentSnapshot identifies a versioned attachment. Its effective board
is its saved boardSnapshot, including an absent board. Only pre-snapshot rows
with null contentSnapshot may use mutable Drill.jsonData. An explicit saved board
always wins; malformed non-null boards are never replaced by source content.
SQL NULL and JSON null have equivalent semantics.

The existing plan-content module supplies effectivePlanBoard for versioned
tactical reads, legacy first-board/replacement guards and full plan projection.
The single-board SQL reader applies the same condition without loading complete
content/board payloads into metadata. The full legacy plan response projects the
effective board only where source JSON was already selected; light metadata gains
no jsonData field. Write tokens for frozen absence stay stable across source edits.
An explicit first board save creates an independent plan snapshot normally.

Publication/exact-age/version/tenant authorization, Serializable writes, invalid
snapshot precedence, V2 downgrade/feature guards and old pre-snapshot source
fallback remain. No schema, migration, dependency, public payload field, feature
flag or new ADR is introduced. This restores accepted ADR-0012/0039 behavior.

## Verification

- Before implementation: two new tactical tests fail on changed board/token and
  stale-token first-save conflict; the full-plan projection regression fails on
  exposing the mutable source board. These are expected behavioral failures.
- The extended dedicated PostgreSQL HTTP case fails against the old code after
  publishing synthetic-approved GLOBAL v2: unchanged v1 phases expose its board.
  An initial mistyped route was corrected before recording that behavioral red run.
- After implementation: five affected suites /136 tests pass. They cover frozen
  absence/token stability, explicit first saves despite an irrelevant V2 source,
  legacy compatibility, projection and existing source/authorization guards.
- Dedicated PostgreSQL HTTP11/11 passes. The migration-shaped legacy case covers
  add and replacement, both board read APIs before/after actual v2 publication,
  frozen instructions/duration and stable tokens, full plan GET projection,
  notes/order replacement retaining v1/absence, old SQL/JSON-null row fallback,
  and explicit token-bound first-board save.
- Fresh complete `npm run quality -- --continue-on-error`: **17/17 pass, exit0**.
  Backend941/62 suites, frontend556/63 files, Sites4/tooling8, types/lints/formats,
  both builds,205-file links, CDSK36 required documents/47 ADRs and whitespace pass.
  Normal primary checkout/pinned npm; no verification-only compiler override.
- Final source hashes, staged scope, local links/CDSK/whitespace and limited text
  credential-pattern checks are verified before publication. Logs and the pinned
  seven-file source/test patch are ignored under output/frozen-board-fix-20261025.

The concurrent [independent verification](FROZEN_BOARD_INDEPENDENT_2026-10-25.md)
is preserved with its own dated commands/results; it also exercises actual CLUB
V1/V2 source edits and both null representations without retained writes.

## Review and publication

A separate read-only AI code reviewer checked the pinned seven-file correction
against the original P2 and accepted contracts: **no Important/Critical finding**.
All seven source/test hashes remain unchanged throughout full verification. The
P2 is closed and no known code blocker remains from the reviewed readiness list.
PR#1 is eligible for the user-authorized ready-for-review transition after the
verified commit is pushed and GitHub head/base/check/review state is rechecked. This is
a scoped correction review, not a new exhaustive whole-PR audit or external human
approval. Current GitHub CI/review/mergeability state is rechecked before transition.

Pre-publication GitHub checks: main remains1b831e0, protected=false, no required
status checks or repository rulesets. The initial PR head matches dc24eb4, is
draft/open/mergeable, with no reviews/threads/checks/statuses. Local verification
is not presented as GitHub CI or an external human approval. Final transition
is confirmed against the actual pushed head in the PR and closing report.

No retained database, saved user plan, migration or production service is changed
by this work. Tests use only guarded loopback ngcs_ready_drills_test and synthetic
approval fixtures. Existing rollout/backup and independent sporting-review gates
remain. PR readiness does not perform merge, auto-merge or production deployment.
