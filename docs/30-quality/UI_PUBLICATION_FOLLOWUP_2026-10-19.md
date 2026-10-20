# Training dialogs publication follow-up — 2026-10-19

The user explicitly requested committing and pushing the completed project work.
Local HEAD and remote `codex/mvp-stabilization` already contain
`3d5d758db9ebdb45d41a41557404b521d241e02e`, the preceding large publication.
This follow-up publishes the remaining reviewed training-dialog changes and QA.

## Included scope

- Exercise attachment dialog: selected exercise/team/phase, full selected plan
  facts/purpose, fixed actions, mobile scrolling and focus return.
- Shared create/edit training form: responsive fields, connected help text,
  title selection, draft preservation and pending-action guard.
- Active-coach picker refresh: clears the old selected/pinned account, reloads
  current eligible accounts and preserves the surrounding training draft.
- Existing regressions extended for attachment/selection/failure handling and
  form hints/focus/refresh. Versioned screenshots and their original dated QA
  reports are included; synthetic identities remain documented as synthetic.
- The subsequently completed coach-owned create/attach flow contributes its
  [dated report](COACH_TRAINING_FLOW_2026-10-19.md) and settled desktop/mobile
  captures. Those additional artifacts were reviewed while the full gate ran;
  the eight code/test/style file hashes stayed unchanged.

There are no backend/schema/migration/dependency changes in this follow-up.
Publishing does not run the local provisioning helper or alter retained records.
Account creation/real-browser evidence belongs to its existing dated report.
The cancelled BUSKI network discussion contributes no project files.

## Validation and publication

Fresh full root command: `node scripts/quality-gate.mjs --continue-on-error`.
Ignored log: `output/ui-publication-quality-20261019.log`.
Result: **all 17 stages pass, exit 0**.

| Check      | Result                                                                  |
| ---------- | ----------------------------------------------------------------------- |
| Tooling    | 8/8 Node cases, nested Python16 pass/1 Windows symlink privilege skip   |
| Backend    | 918/918 in62 suites; fresh isolated Prisma/types/lint/format/build pass |
| Frontend   | 514/514 in61 files; types/lint/format/production build pass             |
| Sites      | 4/4 pass                                                                |
| Markdown   | 186 files, zero broken local links                                      |
| CDSK       | 36 required documents,47 ADRs, zero errors                              |
| Whitespace | Complete gate and staged diff pass                                      |

All eight changed code/test/style files retain their pre-run SHA-256 hashes.
The stage includes58 files, including38 versioned QA PNGs (approximately3.9MB
total). Reviewed subsequent training-flow report/captures contain no additional
runtime changes. A focused high-confidence private-key/provider-key/literal-JWT
scan of actual staged text finds zero matches; no environment/dump/output/helper
artifact is staged. This is publication hygiene, not an exhaustive security audit.

No active Git pre-commit hook or core.hooksPath is configured here, so no hook
disable flag or configuration change is used. Existing root lint-staged routing
remains the separately documented BL-059 issue; the complete explicit quality gate
above supplies verification. Closing documentation edits are rechecked before
commit. The publishing commit carries this report; Git history/remote identity
and the final response identify its actual commit hash.

Only the current `codex/mvp-stabilization` branch is targeted with a normal push.
Environment files, ignored output, local helpers, logs, dependencies and generated
artifacts stay outside the commit. Existing Git author identity is used per command
if this machine has no configured identity; no global settings change.
The previous publication's wider HTTP/operator verification remains dated and is
not claimed as a fresh rerun for this frontend-only follow-up.
