# ADR-0041: Yerel başlangıç paketi için adlandırılmış kullanıcı onayı istisnası

- **Status:** Accepted
- **Date:** 2026-10-19
- **Related:** ADR-0034, ADR-0039, REQ-027, CR-028, BL-062
- **Approval:** User explicitly answered “Evet, yalnız bu yerel 120 içerik için
  istisna” on 2026-10-19 after the same-account guard and scope were explained.

## Context

The user approved local migration/import/publication and then answered the named
reviewer question with “Onaylıyorum Fatih Çelebigil”. This records the named
human's approval of the 120 exercises. The importer used the only active local
SystemAdmin, which is also this user's account, as createdById. No distinct
reviewer account exists. ADR-0034 and the runtime API prohibit same-account review;
ADR-0039 also checks that distinction for the initial whole-package release.
Creating a second identity or changing authorship would misrepresent provenance.

## Decision

Permit one explicit operational exception for the unchanged `ngcs-starter-v1`
manifest's 120 versions on loopback `ngcs_local_session_dev` only. The existing
active SystemAdmin and the named human reviewer Fatih Çelebigil may be the same
account for this release. Record that fact truthfully as a local exception,
rather than describing it as independent review. Existing author/source IDs stay
unchanged. Actual field validation remains a human responsibility; software
checks do not establish sporting quality.

Use a maintenance-only operation with default dry run, explicit local target and
apply/approval guards, exact manifest checksum/version checks, one Serializable
transaction for all 120, and source verification plus submitted/approved/published
audit events carrying the approval reference, named reviewer and exception ADR.
No partial publication, synthetic identity, role grant or runtime/API bypass flag.
The ordinary API's self-review and publication guards remain unchanged.
Replay of the identical completed release must write nothing; ambiguous failure
must be resolved by a read-only state check before another attempt.

## Limits, validation and recovery

This exception does not authorize production, other databases, future revisions,
other content or a permanent policy change. Validate dry run, wrong targets,
manifest mismatch, rollback and replay on disposable PostgreSQL before applying
to the retained target. Keep the verified pre-import private backup; preserve
the unrelated V2 pilot, plans and business data. A later withdrawal archives
the released versions through the existing audited workflow, preserving plan
snapshots and provenance; do not delete history or restore over later edits.

All other releases continue to use the normal independent-review workflow with
another real reviewer. This exception is never described as independent review.

## Execution

Completed on 2026-10-19 after 10/10 dedicated PostgreSQL/guard tests and a new
private backup/restore rehearsal. All 120 are PUBLISHED with explicit same-account
exception metadata and 360 transition audits; replay writes zero. No runtime
guard, account/grant, migration or tactical flag changed.
[Evidence](../30-quality/READY_DRILL_LOCAL_PUBLICATION_2026-10-19.md).

## Subsequent explicit v2 approval — 2026-10-27

The user explicitly extended the same-account local exception to the120 new
diagram revisions after approving them as Fatih Çelebigil. This is a new,
separately pinned authorization in
[ADR-0048](ADR-0048-local-diagram-revision-review-exception.md); the v1 operation
and its original hash/guards remain unchanged. Earlier statements excluding
future revisions described the original authorization. Only the exact v2 hash
is now additionally authorized; other revisions, targets and production remain
excluded.
