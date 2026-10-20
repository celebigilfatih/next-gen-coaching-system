# Local coach/player provisioning and picker refresh — 2026-10-19

Status: completed and verified in the user-authorized local environment.

## Diagnosis and user authorization

The current Spor Manage account directory had0 accounts across all roles/statuses.
The empty responsible-coach picker was an accurate result of its existing
clubId/COACH/ACTIVE filter, not a failed request. Sporting Person/StaffProfile
records from club setup do not themselves provide COACH login accounts.
ADR-0022/0027/0039 require preserving this distinction and explicit coach choice.

The user requested correcting the creation blocker and adding a coach/player,
then explicitly chose actual records and instructed “Kendin üret” for identity
values. This authorizes two synthetic retained-local accounts, not new add screens,
production rollout or an account-policy change. Default target was disclosed as
Spor Manage / A Takım. No new ADR/schema/API/service or password bypass is needed.

## Completed local operation

- Kerem Tunalı — COACH / ACTIVE; kerem.tunali.coach@ngcs.example.test.
- Mert Çınar — PLAYER / ACTIVE; mert.cinar.player@ngcs.example.test.
- Both have club-scoped Person identities, the appropriate StaffProfile or
  PlayerProfile and A Takım GroupMember/LEGACY_MEMBER mappings. Existing default
  compatibility role presets are created/audited by the normal domain adapter;
  no specialty, birth date, position or custom grant guessed. The new player also
  receives his disclosed A Takım primary assignment through the existing profile
  UI, current19Oct2026 date and explicit synthetic-record reason. This separate
  transition updates Player360 current-team data; legacy membership alone does not
  imply primary registration. Existing assignments/persons are not rewritten.
- The maintenance helper is ignored at output/local-people-2026-10-19/create-people.cjs.
  It pins loopback5433/ngcs_local_session_dev, rejects production, checks the active
  existing System Admin and exact club/team, rejects account/name collisions and
  an existing operation record. Dry run passed before apply. Read-only verification
  checks roles/statuses, profiles, both mappings and business fingerprints.
- Existing AccountLifecycleService.createInvitation/acceptInvitation and
  GroupsService.addMember execute the normal audited writes/compatibility sync.
  This is a local synthetic operator completion; no external invitation/email is
  sent. Each strong random initial password and raw invitation token stays only
  in process memory and is discarded. No credential appears in files/logs/report.
  Login can later use the existing administrator-initiated password-reset flow.
- Whole-table ordered fingerprints for2060 TrainingPlans,8244 PlanDrills,36 Matches
  and3629 DayPlans are identical before/after. No training or exercise attachment
  was created for verification; existing accounts/people were not rewritten.
  The ignored result.json contains only synthetic identity IDs/names/emails and
  fingerprint/counts. Verification does not rerun provisioning or reset credentials.

## Minimal UI correction

PlanCoachPicker now exposes Antrenörleri yenile without closing the training form.
Explicit refresh clears the pinned/selected coach, returns to page1 and reloads
ACTIVE club accounts. It preserves title/date/purpose and requires choosing the
refreshed account again. This prevents an account removed from eligibility from
remaining selected after refresh. Existing cursor pinning on ordinary page
navigation, role/club filter, backend authority and explicit plan submit remain.

Changed runtime source: apps/frontend/src/components/plan-coach-picker.tsx and
styles/training-plan-workspace.css. Regression tests extend
components/ready-drill-planning.test.tsx (last two relative to apps/frontend/src/).
The local maintenance helper is not imported by the application or committed.

## Verification

- Focused frontend training/planning/detail:46/46. New cases cover empty-to-active
  refresh preserving draft and requiring selection; refresh of a removed coach
  clears the old pin and disables submission. No automatic creation/attachment.
- Focused backend:128/128 across account lifecycle/directory, groups and plan
  validation. The mocked delivery-failure log is an expected negative test.
- Retained dry-run/apply/read-only verify all pass; both accounts ACTIVE with
  profiles/mappings. Full business fingerprint unchanged.
- Actual browser: new coach option visible; choosing Kerem Tunalı with local date
 20Oct2026 18:30 enables Planı oluştur. Refresh keeps title/date, clears only coach
  selection and disables submit until reselected. No plan submit was clicked.
- Account directory shows2/2 with both new names/roles/statuses.

- Actual Player directory contains Mert Çınar, and his Player360 loads correctly.
  After saving the normal primary-team transition, header/team field show A Takım
  and success toast confirms Sportif atama kaydedildi. Final read-only verification
  asserts exactly one active new primary assignment, both legacy mappings and the
  unchanged full business fingerprint.
- Typegen/TypeScript, scoped ESLint/Prettier, production build, Sites packaging and
  worker4/4 pass. Markdown184/zero broken links, CDSK36 documents/47 ADRs/zero errors
  and whitespace pass. Focused46/128 are the current slice; the prior full frontend
 512/512 is historical, not a claimed rerun with the two new refresh tests.
- No new ADR/schema/API/dependency. Existing credentials and sessions are untouched;
  production and real-person records are outside scope. Synthetic account access
  uses the standard club/team-scoped presets; it does not create a football expert.

Screenshots under apps/frontend/qa/local-people-2026-10-19/:01-coach-ready-desktop,
02-coach-ready-mobile,03-created-accounts,04-player-directory,05-player-profile.
The coach readiness capture shows an enabled submit after valid date/selection;
no plan was submitted. The existing native primary assignment is a deliberate
retained write requested as part of adding the new player, not test data cleanup.

Next: select Kerem Tunalı and explicitly submit the desired training with its own
title/date. If login is needed for the synthetic accounts, use the existing admin
password-reset flow; no reusable initial password was retained or published.


## Subsequent requested training

The user then explicitly requested an actual Kerem-owned training plus the open
exercise, selecting20October2026 18:30. That one plan/phase/calendar record is now
retained. Its verifier excludes only those new IDs and reproduces this earlier
business baseline exactly; do not interpret the legitimate additions as people-
provisioning drift. [Result](COACH_TRAINING_FLOW_2026-10-19.md).
