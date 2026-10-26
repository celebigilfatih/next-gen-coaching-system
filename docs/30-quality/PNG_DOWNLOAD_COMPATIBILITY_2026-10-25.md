# PNG download compatibility — 2026-10-25

User explicitly requested fixing PNG download in the in-app browser while keeping
Chrome support. Work is on codex/png-download-compatibility from aff1cb7; prior
uncommitted browser-smoke/export evidence and documents are preserved.

## Cause and correction

The original Konva PNG path clicked an anchor with a data:image/png;base64 URL.
This repeatedly produced no download in IAB, although Chrome created the file.
SVG used the existing Blob/object-URL helper and downloaded successfully in IAB.
Changing only PNG transport to that same helper resolves the actual reproduction.
The PNG encoder, canonical2× resolution, clone lifecycle, selection stripping,
static scene selection and filenames are unchanged. Encoded bytes are decoded
synchronously into a Uint8Array and wrapped in an image/png Blob; no fetch,
external service, library or asynchronous save operation is introduced.

## Regression and browser evidence

Two editor-control regressions (V1 and selected V2 scene) first fail with the old
data URL. After the change they verify exact PNG bytes and MIME, object-URL
download, filenames, clone dimensions/scale,2× encoding, overlay removal and
clone destruction. Exporting neither saves nor mutates the document or dirty
state. Both focused suites pass:37 tests.

The existing saved QA tactic cmvo8mkpo000l2ytchrorpagy is reloaded normally in
IAB and Chrome. IAB now emits an actual download and returns
C:/Users/fcelebigil/Downloads/ngcs-tactical-board (2).png. Chrome's normal PNG
button creates ngcs-tactical-board (3).png. Each is102,568 bytes,1600×1200 and
SHA-2564f08684a919825439ca48239f87ca5ab30356c5483162a6a048c0c22c24c22bc,
identical to the pre-fix known-good Chrome PNG. The IAB file was opened and
visually inspected: half-pitch and all nine objects remain intact. Captured
warn/error logs are empty and the editor remains Kaydedildi. No new record,
source edit, migration, login workaround or retained-data write was needed.

SVG was also downloaded again after the correction in both browsers as (2).svg
and (3).svg. Both retain the original31,378 bytes and8d4f0576 SHA-256, confirming
that the common helper's expanded binary input contract preserves text exports.

Fresh root quality passes17/17 with exit0: backend941 tests/62 suites,
frontend558 tests/63 files, Sites4 and tooling8, both builds, lint/type/format,
211-file links/CDSK/whitespace. A separate focused read-only reviewer reports
no Important/Critical finding and low regression risk. Final documentation-only
closure is followed by fresh links/CDSK/whitespace checks.

## Evidence

- [Actual IAB download](../../apps/frontend/qa/png-download-fix-2026-10-25/in-app-browser.png).
- [Actual Chrome download](../../apps/frontend/qa/png-download-fix-2026-10-25/chrome.png).
- [Download hash assertions](../../apps/frontend/qa/png-download-fix-2026-10-25/verification.json).
- [Earlier PNG/SVG comparison](TACTICAL_EXPORT_ACCEPTANCE_2026-10-25.md).
- Ignored complete quality log: output/png-download-fix-20261025-quality.log.

No new ADR is required: this restores existing ADR-0035 export behavior without
schema, security, dependency or geometry change. At implementation closure,
commit/push had not yet been requested.

## Publication review — 2026-10-25

The user subsequently authorizes final review, commit and push to
codex/png-download-compatibility. The two-file implementation is unchanged since
the successful full root17/17 run. A fresh scoped reviewer again finds no
Important/Critical issue. Commit-time scoped tests and links/CDSK/whitespace,
artifact decoding/hash checks and staged-file review verify the publication.
The full root run is not repeated without a source change.

The publication includes the earlier main smoke/export reports and their linked
QA files, alongside the fix report/downloads, so evidence links are complete in
Git. The15 QA files contain images, the board document and comparison receipts;
ignored operators, runtime logs, local environment and database material remain
outside the commit. No remote branch exists at preflight; push creates its
upstream normally. Final delivery verifies local/remote commit equality and a
clean working tree. No main merge or new PR is part of this request.
