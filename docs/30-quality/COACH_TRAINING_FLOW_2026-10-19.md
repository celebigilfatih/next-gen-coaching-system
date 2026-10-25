# Kerem Tunalı → new training → exercise attachment — 2026-10-19

Verdict: Pass. The explicitly requested retained UI flow completed successfully.

## Authorized retained result

The user requested creating a new training under Kerem Tunalı, adding the open
exercise and checking the flow; then selected20October2026 18:30. Normal existing
admin session/UI at3132/API4000 was used. No injected session or alternative write
API, account change, deployment, migration or runtime-code modification.

- Club/team/season: Spor Manage / A Takım /2026-2027.
- New plan: Kısa Oyun ve Yansıtma — A Takım.
- Plan ID: cmvfbzkvb00392yiwp5dzmxtm.
- Responsible coach: Kerem Tunalı, actual ACTIVE COACH account; exact coachId,
  clubId and groupId verified against the preceding authorized people operation.
- Date:20October2026 18:30 Europe/Istanbul; stored2026-10-20T15:30:00.000Z.
- Exercise: A Takım · Kısa Oyun ve Yansıtma — Rol Senaryosu,
  drillId ngcs-starter-v1-senior-24, phase COOL_DOWN / Soğuma, order0.
- Exactly1 phase/18minutes. Source version cmvf4a72v00p72yyo3ffnuvim, v1, SENIOR.
  Complete contentSnapshot and boardSnapshot exactly match the published source
  resolved through existing resolvePlanContent for SENIOR. No near-age fallback.
- Exactly1 linked calendar DayPlan, matching date and18-minute duration.

## Actual workflow and verification

1. Entered title/purpose, selected Kerem and the user-selected native local date.
   Derived UTC value confirmed before submit; no timezone inference from shell.
2. Clicked Planı oluştur once. Dialog returned to the attachment picker with the
   new plan selected,0min/0phases, and scoped catalogue total443→444. The new plan
   was not in the first25 current options, so the existing retained-selection
   fallback was exercised successfully. Creation did not auto-attach the drill.
3. Clicked Plana ekle once. Success state displayed; Antrenmanı aç navigated to the
   saved detail. No failure/uncertain retry or second create/add was attempted.
4. Reloaded the detail route. Date18:30,18min/1phase and exact exercise persisted.
   Opened saved v1/A Takım instructions: organization and all four application
   steps, coaching, adaptation and progression/regression remained readable.
5. Opened Taktik tahtası → Tahtayı aç. Saved seven-element pitch rendered and
   status Kaydedildi stayed unchanged.390×844 mobile focus entry/exit worked.
   No document edits, board save, animation conversion, attendance or phase edit.
6. Read-only database verification compares complete frozen text/board with the
   published source and checks owner/date/category/order/totals/calendar linkage.
   Ignored verifier: output/local-people-2026-10-19/verify-training-flow.cjs.
   Result: training-flow-result.json in the same ignored directory, no secrets.

Whole-table ordered hashes excluding only this new plan, its one phase and linked
new DayPlan reproduce the preceding operation's exact baseline. All2060 previous
plans,8244 phases,36 matches and3629 DayPlans remain unchanged. New totals are
2061/8245/36/3630. Both deliberately edited121/103-minute plans therefore retain
all fields. The two synthetic accounts and player primary assignment remain.

## Evidence and checks

apps/frontend/qa/coach-training-flow-2026-10-19/:
01-create-ready,02-created-empty-plan,03-attachment-success,
04-desktop-saved-flow,05-saved-board-desktop,06-mobile-saved-board and
07-mobile-saved-flow PNGs.

The browser flow and independent read-only persistence assertions pass. No runtime
code changed, so the earlier focused frontend46/backend128/build/Sites gates were
not rerun or claimed as a fresh result. Current Markdown/CDSK/whitespace checks
pass:186 Markdown files/zero broken links,36 required CDSK documents/47 ADRs/zero
errors, and clean whitespace. Final persistence verification passed again after
board/mobile viewing. Existing published-version/explicit attach/role boundaries
remain ADR-0039; no new decision or ADR needed.

This new retained plan is the requested outcome, not a disposable QA record.
Do not reapply creation as a verification shortcut. Reopen its exact URL and use
read-only assertions for future inspection. The older people-only verifier pins
its pre-training full-table baseline and now intentionally differs; the new
training-flow verifier excludes only the explicitly authorized added records.

Next: user may continue editing this plan or create further phases explicitly.
