# ADR-0046: Repository-owned CDSK 0.1.0 validation

- **Status:** Accepted
- **Date:** 2026-10-19
- **Owners / approvers:** Product owner, explicit request in this session.
- **Supersedes / superseded by:** Resolves ADR-0001's portable-validator open question; its standard version remains unchanged.
- **Related:** ADR-0001, BL-061, `.cdsk.json`

## Context

The former external `../cdsk/scripts/validate_project.py` is absent on Windows.
The completed root run passed 16/17 stages but correctly failed CDSK. Its original
implementation is unavailable, so equivalence to its undisclosed checks cannot
be established. The user explicitly requested: “CDSK doğrulayıcısını mevcut
standarda uygun şekilde projeye ekle; dışarıdaki eksik dosyaya bağımlı kalmayalım.”

## Decision

Keep CDSK 0.1.0 and implement a repository-owned, read-only Python standard-library
validator at `scripts/cdsk/validate_project.py`. Its project profile revision 1 is
[specified separately](../30-quality/CDSK_0_1_0_PROFILE.md), grounded in the existing
manifest, Project Boot structure and ADR records/template. This is an independent
implementation of that local contract, not a vendored upstream validator or a
claim of upstream certification/parity.

The existing Node wrapper defaults to this tracked file. An explicit
`CDSK_VALIDATOR` override remains compatible and fails when missing; it never
silently falls back after an override failure. Existing Python selection and exit
propagation remain. No checkout, package download, pip dependency or network access
is required. Python 3.9+ remains a tooling prerequisite. The root gate always
includes CDSK and always returns failure for validation errors.

## Consequences

The 36-file CDSK baseline is pinned in code so deleting a manifest declaration
cannot remove a mandatory check. Added declarations are checked too. All errors
include a rule identifier and repository-relative target. Syntax and structural
checks cannot establish content accuracy, human approval, requirement coverage or
whether an unknown is resolved; legitimate TBDs remain valid. Markdown links are
checked by the existing separate root stage. Profile changes require explicit
review and versioned rules/tests/docs, rather than silently relaxing a failure.

## Verification

During concurrent writes this new record and four-match microcycles initially
used number 0045. The duplicate-number check rejected that state. This record
was assigned the unused number 0046 and its references updated; the other
decision retains 0045. Neither decision's approved content was changed.

Real disposable-project CLI tests exercise both valid and broken fixtures,
read-only behavior, spaces/UTF-8/BOM/CRLF and fail-closed paths. The Node tooling
suite runs these tests plus the default wrapper and explicit override regressions.
One filesystem symlink case is skipped on Windows because creation requires an
OS privilege; traversal/absolute/Windows-path rejection still runs there.
Full root evidence is recorded in
[the verification report](../30-quality/CDSK_LOCAL_VALIDATOR_2026-10-19.md).

## Rollout and Rollback

No runtime, schema, database or application configuration changes. Run
`node scripts/validate-cdsk.mjs`, then `node scripts/quality-gate.mjs`. Reverting this
tooling increment restores the external prerequisite and may fail on its absence;
never substitute a successful no-op. Historical external-validator failures stay
in dated evidence, superseded by this decision.
