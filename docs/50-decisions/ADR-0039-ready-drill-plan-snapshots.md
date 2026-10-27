# ADR-0039: Hazır egzersizlerden planlama ve içerik snapshot'ı

- **Status:** Accepted
- **Date:** 2026-10-19
- **Approval:** User explicitly requested implementation of the complete plan,
  including the additive content snapshot migration.
- **Related:** ADR-0012, ADR-0025, ADR-0032–0034

## Decision

PlanDrill gains nullable JSON contentSnapshot. New published drill attachments
freeze the source version, exact team-age variant, duration and instructional
content; the existing boardSnapshot freezes the published board. Old rows remain
NULL and retain legacy reads. Plan/day totals use frozen durations when present.
The optional expectedVersionId protects against silently attaching a replacement
version. New attachments recheck publication, exact age and ownership inside a
Serializable transaction. No nearest-age fallback is allowed.

Implementation correction,2026-10-25: a non-null contentSnapshot also freezes an
absent board. Both board readers, full legacy plan projection and preservation/
first-save guards use that distinction; only pre-snapshot rows retain source
fallback. No new field or migration is needed. Explicit plan-board saves remain
independent of later source edits/publications. This restores the original
snapshot boundary. [Verification](../30-quality/FROZEN_PLAN_BOARD_FIX_2026-10-25.md).

The library and plan picker share filters and lazy detail preview. Library detail
can select an existing plan or create one, then explicitly attach the exercise.
No full-session or weekly templates, external content service or dependency is
introduced. The approved starter release is all 120 exercises after independent
expert approval; partial starter publication is blocked. Expert identity remains
TBD and is never fabricated by software or fixtures.

Administrator-created plans retain the existing requirement for an active COACH
in the selected club. The shared create form supplies clubId/coachId through an
explicit choice from the existing account catalog; COACH ownership is still
derived on the server. No staff record becomes a login account or receives grants.

## Rollout

Validate migration/import and authenticated flows on disposable PostgreSQL first.
Retained local migration/import require separate approval with verification
evidence. No production rollout, expert approval or publication is authorized by
the implementation request. Preserve existing rows and user changes.

2026-10-19 follow-up: the user separately approved retained local migration,
120-item import and publication. The exact snapshot migration and idempotent
DRAFT import are complete after backup/restore verification. Publication
permission is recorded. The user subsequently named Fatih Çelebigil and approved
all 120, but his SystemAdmin is also the import author; at that stage the
independent-account requirement of ADR-0034 kept all 120 as DRAFT.
The narrowly scoped [ADR-0041](ADR-0041-local-starter-review-exception.md) was
subsequently explicitly accepted. Its one-time local same-account maintenance
operation published all 120 atomically, with truthful exception audits. Ordinary
API review guards remain unchanged; future releases require independent review.
The separate weekly planning migration was not included.
[Local publication evidence](../30-quality/READY_DRILL_LOCAL_PUBLICATION_2026-10-19.md).

2026-10-27: Subsequent explicit user approval extends the local named same-account
exception to the exact120 diagram revisions only, through
[ADR-0048](ADR-0048-local-diagram-revision-review-exception.md). Their atomic
import/publication archives original versions and preserves all plan snapshots;
unfrozen ready-drill references must block this maintenance release. Ordinary
runtime guards and other releases retain independent review.
