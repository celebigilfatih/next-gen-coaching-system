# Main ready-exercise and frozen-board acceptance — 2026-10-25

The user requested running the merged application from main and checking real
ready-exercise attachment plus source-independent saved diagrams.

## Runtime and isolation

Normal backend build succeeds on main. Acceptance starts at bd424a6 (the merge
and cleanup documentation are included; runtime matches reviewed6fb5fb6).
Canonical API4000/UI3132 run from this checkout with the existing retained DB,
auth/tactical settings and normal dist/main.js. A small ignored listener preload
binds the newly launched API listeners to127.0.0.1; frontend CLI also binds
loopback. No tracked application/configuration source changes are required.

Actual Chrome inspection of http://localhost:3132/app/library restores the
existing session and shows120 ready exercises across all ages. Main remains
running for the user.

Mutation acceptance uses separate API4016/UI3516 and the exact disposable
loopback database ngcs_main_ui_20261025. It copies only the synthetic dedicated
HTTP fixture database, then adds a synthetic club/admin/coach/team/season and
empty plan. The HTTP fixture's final archived starter is restored only in this
copy so it contains all120 published ready identities. Test approval records
are synthetic and are never real expert approval. The test host127.0.0.1 keeps
its browser session separate from the retained localhost application.

## Browser acceptance

1. Sign in normally to the isolated application and open its empty A Takım plan.
   The selector shows48 team-appropriate ready choices; seasonal records are
   excluded. Select ngcs-starter-v1-senior-01, inspect instructions and the
   original seven-element pitch, then explicitly click Plana ekle.
2. The saved UI shows1 phase/20 minutes and content v1. Open its board: three
   players, two cones, ball and arrow remain present. A DB read confirms the
   exact published board and source version were frozen at attachment time.
3. In the disposable copy, create a synthetic-approved source version2 with an
   empty board and a visibly different KAYNAK V2 title. Invoke the actual compiled
   DrillContentService.publish. The library detail now shows the new title and
   zero elements.
4. Fully reload the plan, explicitly reopen its phase board, and inspect Chrome.
   The original title/content v1,20 minutes and seven elements remain. This is a
   fresh server read, not merely a previously mounted editor draft.
5. Independently create a migration-shaped LEGACY/LEGACY_UNVERIFIED boardless
   CLUB fixture, attach it through the actual plan service, and inspect its
   second plan in Chrome. It reports “Bu fazda tahta kaydı yok”. Add a seven-
   element source board through the actual DrillsService.update, fully reload
   and reopen the plan board: it still reports the same absent state. Both board
   readers, the write token and entire stored phase row remain unchanged.

| Check | Source after change | Saved plan after full reload |
| --- | --- | --- |
| Ready exercise | Source version2, zero elements | Content v1, seven elements,20 minutes |
| Boardless legacy fixture | Seven elements | Board remains absent |

The ready phase's entire stored row remains unchanged after source publication
and browser reload. Its board SHA-256 before/after equals
45d1372b082c15359e5059a9528228d76da5eec0f78eb20c79e9b727c9085450.
No console errors were observed in the tested ready-plan tab.

## Retained-data preservation and closure

Initial and intermediate fingerprints of41 retained business tables match.
During the final comparison, another authorized active chat creates its separate
QA — Main kontrolü 25.10.2026 plan with two phases and one day link in the retained
application. This concurrent addition is preserved. Its identity and creation
time are verified, and excluding only those new plan/phase/day rows reproduces
all41 original table counts/hashes exactly. The original ready source catalog,
previous plans and other business records are unchanged. Auth-session/security
tables are intentionally outside the business fingerprint.

Only this task's three test tabs and isolated QA processes are closed after
evidence capture. The synthetic database and ignored logs remain available for
inspection. Canonical main API/UI stay running; concurrent smoke-test artifacts
and processes are preserved. This acceptance adds only evidence/docs, with no
runtime patch, migration, new ADR, retained source edit or production action.

Ignored operator evidence: output/main-ui-acceptance-20261025, including context,
source-change, boardless-after and final-result JSON. Operator setup initially
encountered the intentionally archived HTTP fixture and an age-variant foreign-
key naming mismatch; both were corrected in disposable setup, without an
application change. No full root suite is rerun for evidence-only changes;
the successful normal build, actual browser/service/DB checks and final local
links/CDSK/whitespace checks are the acceptance gates.

## Screenshots

- [Running main library,120 ready exercises](../../apps/frontend/qa/main-ready-plan-2026-10-25/main-library.png).
- [Original source preview](../../apps/frontend/qa/main-ready-plan-2026-10-25/source-before.png).
- [Changed source, zero elements](../../apps/frontend/qa/main-ready-plan-2026-10-25/source-after.png).
- [Preserved plan board after source publication/reload](../../apps/frontend/qa/main-ready-plan-2026-10-25/plan-preserved.png).
- [Full plan after reload](../../apps/frontend/qa/main-ready-plan-2026-10-25/plan-after-source-change.png).
- [Absent before](../../apps/frontend/qa/main-ready-plan-2026-10-25/absent-before.png) /
  [absent after source edit/reload](../../apps/frontend/qa/main-ready-plan-2026-10-25/absent-after.png).
