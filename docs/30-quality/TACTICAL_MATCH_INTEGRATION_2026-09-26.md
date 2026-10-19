# Tactical match integration — BL-058e.1

Date: 2026-09-26. ADR-0036 / CR-026 / REQ-025 / BL-058.

## Delivery boundary

The first route integration slice connects `/app/matches/:matchId` to the
shared V1/V2 editor and playback. BL-058 is **still In progress**. Drill
metadata/create/copy, training phase/snapshot and combined export/rollout gates
remain separate next slices. No retained V2 write flag, data, schema, dependency,
seed, production, commit or push was changed.

## Implemented behavior

- Additive `GET /matches/catalog/metadata/:matchId` shares the old detail's
  strict group/optional-season query and season-owned tenant filtering. It
  reads no tacticalBoard JSON; scalar `hasBoard` is computed separately.
  Old detail remains unchanged and explicitly rejects V2 documents.
- Match page reads metadata first; opening the tactical tab loads the document
  envelope with its opaque write token. A failed read cannot mount a blank
  editor. Explicit retry affects only a failed initial read.
- `ResourceBoard` submits the current token and whole document. Only a
  successful response updates the token. Conflict, disabled V2 write and
  uncertain network failure preserve the draft; no automatic refresh/retry.
  Conflict text advises exporting JSON before explicitly reopening the page.
- Existing V1 matches remain supported. Valid absent documents start a new V1
  board. V1-to-V2 conversion is explicit; the server's default-off gate remains
  authoritative and gives a clear draft-preserving message when disabled.
- Tab exit uses the actual editor's dirty guard: Cancel stays, Discard
  unmounts the unsaved draft, Save-and-leave changes tab only after success.
  Reopening reads the saved document and token anew. Playback stops on exit.
- Match analysis writes remain separate and never supply board JSON. PLAYER
  cannot edit analysis or board; playback remains available on authorized
  documents. Match/scope/session/role keys discard late prior reads.
- Mobile board negative margins no longer clip timeline labels inside the
  parent panel. No broader page redesign was performed.

## Verification

- Root `npm run quality` passed: **824 backend / 57 suites, 416 frontend /
  54 files, 4 Sites tests**, typecheck, lint, format, builds, CDSK, 140 Markdown
  files with zero broken links and whitespace. After the final CSS-only inner
  margin correction, focused formatting and real-browser geometry were
  rechecked. Local gate log: `/private/tmp/ngcs-match-integration-quality.log`.
- **Three new backend unit tests:** board-free projection, missing/denied
  scope and unknown-query rejection. Match catalog suite: 43 passing tests.
- **Seven new resource-board tests:** returned-token adoption on successive
  saves; unchanged token and retained scenes after conflict, disabled writes
  and network failure; explicit initial retry; readonly playback; local guard.
- **Four real-editor route tests:** lazy read, Cancel/Save-and-leave, real
  discard/reopen, failed-save tab retention and PLAYER remount. These use the
  actual React editor with mocked canvas/API, not a placeholder board.
- Existing seven match read/count tests pass; old scoped loading/error/retry
  and stale metadata behavior remain covered.
- **Disposable PostgreSQL 16 HTTP suite: 9/9 passed.** New scenario proves
  metadata before/after V2, no JSON in response, legacy detail 409, unknown
  query 400, cross-tenant 403/404, PLAYER read/write boundary, analysis update
  preserving document/token. Existing round-trip/concurrency/snapshot/limits
  regressions pass too.
- All 11 existing migrations deployed to the new disposable database;
  migration status current and schema diff empty. No new migration.

## Browser QA

Playwright skill/CLI, real MatchDetailRoute and Konva, isolated port 3144,
synthetic workspace/session and browser-memory fetch transport. The browser
was **not** connected to retained accounts or business records; PostgreSQL
HTTP tests above are a separate layer, not a claimed combined browser/DB E2E.

- Observed metadata-only first request, followed by one document read on tab
  open. Synthetic Save-and-leave submitted all three edited scenes and the
  exact original token, with no intervening token refresh.
- Confirmation opened with Cancel focused. Route tests additionally verify
  cancel, true discard/reopen and save-conflict behavior on the final code.
- 1672×941, 1024×900 and 390×844 checked; page scroll widths match viewport
  widths. A mobile clipping issue found visually was corrected and recaptured.
  Final mobile playback bounds are x=32–358; slider/time row x=44–346, inside
  the parent board x=31–359. Both outer panel and inherited editor negative
  margins were removed; page-width checks alone would have missed this clip.
- Local full-page artifacts:
  `output/playwright/match-integration-2026-09-26/desktop.png`, `tablet.png`,
  `mobile.png`. These are local artifacts, not required committed files.

Formal WCAG, physical touch devices and professional match-day acceptance are
not claimed. The previous playback report's unreproduced exploratory dirty
state is not diagnosed by this slice. Source-invariance unit coverage remains.

## Next steps and operations

1. BL-058e.2: board-free drill metadata and safe create/copy coordination. Do
   not send V2 through the V1 legacy create/edit/editorial workflow.
2. BL-058e.3: phase document/token integration preserving lazy phase loading,
   source/snapshot provenance, dirty navigation and uncertain-write handling.
3. BL-058e.4: combined copy → plan → match → export browser/HTTP gate; then
   separately approved local rollout. Do not infer permission to enable V2.

The temporary PostgreSQL container is dedicated to this task on loopback 55439,
database `ngcs_tactical_test`; only generated fixture records are disposable.
The task container and anonymous volume were removed after verification; only
reproducible synthetic fixture records were discarded, not retained data.
The retained application on 3132 was not restarted or reconfigured by this slice.
