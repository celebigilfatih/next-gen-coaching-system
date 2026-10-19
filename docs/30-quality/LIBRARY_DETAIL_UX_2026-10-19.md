# Exercise detail UI/UX — 2026-10-19

Status: implemented; visual and affected automated gates passed.

## Direction and implementation

The user's existing Matches/training/library language now extends to
`/app/library/:drillId`. A compact text heading, four-cell semantic summary and
one white guide panel replace the photograph, separate cards and embedded aside.
Titles use36px desktop/28px mobile Inter to accommodate long authored names.

- Uygulama shows the full purpose, native full-summary disclosure, organization,
  equipment and numbered ordered steps. The desktop coaching column contains
  exact-age rules/coaching, native disclosures for coaching/constraints/
  progression/regression and safety notes. Tablet/mobile stack instructions first.
- Saha explicitly mounts the existing readonly board. The normal content request
  still returns the published board document; only renderer mounting is deferred.
  Existing focus/view controls remain. There is no new board write/save path.
- Kaynak retains source title, license, author, attribution, adaptation notes,
  original URL and safety information. No expert/publication claim is invented.
- Exact age values remain server data. Missing adaptation disables plan addition
  with an explanation; the fallback source duration is labelled Temel süre.
  Legacy records retain the honest unverified-content state and return link.
- Plan addition passes the same drill/version/group/club/season/category to the
  existing explicit picker. PLAYER, missing-group and missing-variant controls
  remain disabled. Copy keeps its original route and existing downstream guards.
  Closing the picker returns focus to Antrenmana ekle.
- The reader waits for workspace recovery, exposes retry and rejects previous
  resource responses. Request identity remounts the guide/dialog on scope or ID
  changes, clearing old selection. Loading/error states cannot show stale content.

Mobile uses44px actions/tabs/disclosures and one compact four-fact strip. Both
primary actions stay together; full instructions remain readable without line
clamping. The route alone removes inherited minimum-width overflow. No backend,
API/schema/dependency/flag or retained business-data change; no new ADR is needed.
ADR-0034/0039 publication and explicit snapshot/attachment boundaries remain.

## Verification

- Full frontend: **509/509**, **61 files**,343.11seconds, serial execution.
- Detail/library/planning suites: **29/29**, three files. Final detail-only rerun
  after the last refinements: **11/11**. Covers scalar/exact-age data, full steps,
  deferred readonly board, source attribution, explicit picker version/scope,
  close focus, PLAYER/no-group/no-variant, missing board/legacy, retry, stale reads
  and tab/dialog reset on scope changes. Context tests use an actual React context
  signal so RouterProvider memoization does not hide scope updates in the fixture.
- Final TypeScript, scoped ESLint/Prettier, production build, Sites packaging and
  worker **4/4** pass. Required client/server/hosting artefacts were generated.
- Initial Markdown check: **173 files /0 broken**; diff whitespace passes.
  Previously pending ADR-0043 report links now resolve. Full root/CDSK acceptance
  is tracked separately; this UI slice does not claim that entire gate.
- Later concurrent documentation added four-match planning references before its
  report existed. The closing **177-file check has6 missing links** to
  `FOUR_MATCH_PROGRAM_2026-10-19.md` from README, CHANGELOG, ROADMAP, TEST_STRATEGY,
  RUNBOOK and the four-match ADR. These are outside this UI slice and were not
  hidden by creating placeholder evidence. Its own report links resolve.
- Concurrent documents also reuse **ADR-0045** for both
  `ADR-0045-repository-owned-cdsk-validator.md` and
  `ADR-0045-four-match-microcycles.md`. This is an open document-identity conflict,
  reported without silently renumbering accepted decisions or choosing an
  architectural authority. No detail-page behavior depends on either decision.

Follow-up during the five-match increment: both closing observations above are
resolved. The four-match report now exists; the178-file link check has zero broken
links. Repository-owned CDSK is accepted as ADR-0046, four-match planning is ADR-0045;
the current CDSK profile checks46 distinct ADRs with zero errors. Historical closing
results above are retained; no library behavior or accepted decision is renumbered
by this follow-up.

## Actual browser evidence

Directory: `apps/frontend/qa/library-detail-ux-2026-10-19/`.

- CSS1440×1000: `15-desktop-final.png`, `03-desktop-pitch.png`.
- CSS1024×900: `14-tablet-final.png`; equal1009px content/scroll widths.
- CSS390×844: `05-mobile-overview-final.png`, `09-mobile-steps.png`,
  `06-mobile-pitch-focus.png`, `07-mobile-pitch.png`, `08-mobile-source.png`,
  `10-mobile-plan-picker.png`. Normal content/scroll widths375/375px;
  primary actions167.5×44px. All four real steps are fully readable.
- CSS320×844: `11-narrow-mobile.png`; content/scroll widths305/305px,
  primary actions132.5×44px, tab heights44px. Area units wrap instead of clipping.
- `12-tablet-no-variant.png`: actual U14 context reading the known SENIOR source
  shows the no-adaptation warning and disabled addition, with source duration
  labelled Temel süre. Existing scope selection returns to the catalogue; the
  known source was reopened normally. A Takım context was restored afterwards.
- `13-legacy-detail.png`: actual legacy record has no fabricated instructions or
  board. Actual plan picker open/Escape/focus return passed; no plan was selected,
  created or attached. No retained training/match content was changed.

`comparison-style.png` combines the approved library register
`qa/library-ux-2026-10-19/17-desktop-final.png` and final detail capture, both
1425×990 pixels, at equal800px widths preserving aspect ratio. Both were opened
together. Shared typography, white borders/panels, blue actions and compact
summary are intentional cross-page adaptation rather than identical content.

P2 refinements: the initial mobile stacked actions and2×2 summary put tabs below
the first viewport (`04-mobile-overview.png`). The final action row/four-fact strip,
summary disclosure inside Uygulama and visually hidden duplicate panel heading
bring navigation forward. The heading remains accessible. The existing picker
returned focus to body; its caller now restores the exact trigger after close.
No actionable P0/P1/P2 remains. Physical-device certification is outside this
local Chromium check. Viewport overrides are reset before delivery.

## Changed files and continuation

- `apps/frontend/src/routes/library-detail.tsx`: compact detail, guarded reader,
  guide tabs, numbered instructions and picker focus return.
- `apps/frontend/src/styles/library-detail-workspace.css`: scoped responsive UI.
- `apps/frontend/src/routes/library-detail.test.tsx`: eleven interaction cases.
- Frontend AGENTS/README, root README/CHANGELOG/Project Boot/design QA, UI migration
  and test strategy: durable direction and verification evidence.

Next: review the detail's Uygulama/Saha/Kaynak flow with the actual team content.
Keep explicit plan selection/save and the existing independent publication policy.
