# Training attendance acceptance — 2026-10-20

Verdict: Pass. Mert Çınar appears and the requested attendance save persists.

## Retained result

- Existing plan: `cmvfbzkvb00392yiwp5dzmxtm`, Kısa Oyun ve Yansıtma — A Takım,
  Kerem Tunalı, 20 October 2026 18:30 Europe/Istanbul.
- Existing synthetic player: Mert Çınar, `cmvfblwu8000q2yvgaqnypikf`, ACTIVE
  PLAYER and current A Takım group member. No new person or membership created.
- Initial attendance was absent from storage; UI showed Mert and Katılım 0/1.
- For the user-requested synthetic workflow check, explicitly announced PRESENT
  / katıldı and clicked Mert once through the existing authenticated UI.
  Success toast appeared and the count became 1/1.
- Full page reload and reopening Katılım retained 1/1 and Mert's
  `aria-pressed=true`. The saved status remains PRESENT.

This is a synthetic acceptance entry, not evidence of real-world attendance at
the later scheduled session. No absent/present toggling loop or automatic write
retry was performed.

## Recovery and independent checks

The initial tab showed Failed to fetch. Both canonical local services had stopped;
the existing PostgreSQL container and volume were running. Restarted compiled
API 4000 and development UI 3132 with the existing ignored persistence/tactical
configuration. Database connection credentials stayed in process memory. The
ordinary persistent session recovered after reload without manual sign-in.
No authentication bypass, migration, reset, dependency or runtime source change.

Read-only Prisma assertions against the guarded loopback retained development
database verify exactly one plan/player row, status PRESENT and roster total 1.
All other attendance rows exactly match the pre-write ordered snapshot. The
existing training-flow verifier also passes: responsible coach/date, one frozen
SENIOR/v1 exercise, COOL_DOWN, 18 minutes and linked DayPlan remain unchanged;
previous 2060 plans / 8244 phases / 36 matches / 3629 day records remain unchanged.
Current totals remain 2061 / 8245 / 36 / 3630.

Ignored local read-only scripts/results are in
`output/local-people-2026-10-19/`: `inspect-attendance.cjs`,
`verify-attendance.cjs`, `attendance-before.json`, `attendance-result.json` and
the existing `verify-training-flow.cjs`. Do not rerun a write to reproduce QA.
No credentials or session tokens are included in this versioned report.

## Evidence and scope

Saved screenshot after full reload:
`apps/frontend/qa/training-attendance-2026-10-20/01-saved-attendance-after-reload.png`.
Actual browser save/reload and independent storage assertions passed. No runtime
code changed, so automated application suites were not rerun or claimed fresh.
Markdown links, CDSK and whitespace checks passed. Existing ADR-0007 authorization
and ADR-0019 unique atomic upsert apply; no new ADR or model change required.

The Katılım tab is left open. Future checks should read this retained row; further
status changes require user-directed attendance work.
