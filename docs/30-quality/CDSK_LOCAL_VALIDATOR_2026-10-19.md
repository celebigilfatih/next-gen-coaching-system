# Repository-owned CDSK validation — 2026-10-19

The user explicitly requested including CDSK validation in the project and
rerunning the complete root quality gate. ADR-0046 resolves ADR-0001's portable
validator question. The existing CDSK 0.1.0 project contract is implemented as
[profile revision 1](CDSK_0_1_0_PROFILE.md); upstream parity is not claimed.

## Implementation and focused checks

- Tracked Python standard-library validator; Node wrapper defaults locally.
- Original 36-file baseline, manifest/version/path/document/Boot/Constitution/ADR
  checks with deterministic rule/path diagnostics and nonzero failure status.
- Real CLI fixtures cover valid projects, broken manifests, reduced declarations,
  invalid documents/dates/versions, traversal, empty/missing handoff, ADR issues,
  spaces/BOM/UTF-8/CRLF and read-only file hashes. No API/database/network access.
- Eight Node tooling tests pass. Their Python child executes 17 unittest cases:
  16 pass and one symlink creation case is skipped on Windows due OS privilege.
  Absolute/traversal/drive/backslash rejection still runs. Actual local wrapper
  passes; explicit missing-validator and failing override cases stay nonzero.

The validator caught a real concurrent ADR-number collision: two newly written
records used 0045. This task's record was moved to 0046, its references updated,
and the focused eight-test suite passed again with 46 distinct ADRs. Four-match
planning's ADR-0045 and its decision content were preserved. Temporary conflict
notes in other dated handoffs describe the earlier state.

## Complete gate

Command: `node scripts/quality-gate.mjs --continue-on-error`.
Ignored log: `node_modules/.cache/ngcs-quality/cdsk-local-complete-20261019.log`.
Result: **17/17 stages passed; root exit 0** on the working tree based on
`33442ff`, branch `codex/mvp-stabilization`.

| Stage                              | Result                                                      |
| ---------------------------------- | ----------------------------------------------------------- |
| Tooling tests                      | PASS, 8/8 (Python child: 16 pass, one Windows symlink skip) |
| Root script formatting             | PASS                                                        |
| Isolated Prisma client             | PASS                                                        |
| Backend typecheck / lint / format  | PASS, all three stages                                      |
| Backend tests                      | PASS, 913/913, 62 suites                                    |
| Backend build                      | PASS                                                        |
| Frontend typecheck / lint / format | PASS, all three stages                                      |
| Frontend tests                     | PASS, 509/509, 61 files, 327.88s                            |
| Frontend production/Sites build    | PASS                                                        |
| Sites tests                        | PASS, 4/4                                                   |
| Markdown links                     | PASS, 178 files, zero broken local links                    |
| CDSK local profile                 | PASS, 36 required documents, 46 distinct ADRs, zero errors  |
| Git whitespace                     | PASS                                                        |

After the small JSON/empty-metadata parser fixes and ADR renumbering during the
run, the focused tooling suite was rerun on the final source: 8/8 pass. Its ignored
log is `node_modules/.cache/ngcs-quality/cdsk-focused-final-20261019.log`. The later
CDSK stage of the complete gate also used the final source. No failing stage was
skipped or converted to success. The runtime Prisma engine SHA-256 matches the
prior preserved engine; no serving DLL replacement was needed.

BL-061 is complete for the approved repository-owned model. Python 3.9+ remains
required; upstream parity and semantic/human approval verification are outside
this mechanical profile and are not implied by the passing gate.

Existing working-tree edits are preserved. No application/runtime behavior,
dependency, migration, retained data, production configuration, commit or push
is changed. Dedicated database/browser E2E remains separate from this root gate.
