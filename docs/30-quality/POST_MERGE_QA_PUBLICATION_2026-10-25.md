# Post-merge QA evidence publication — 2026-10-25

The user explicitly requests reviewing other pending work and committing/pushing
the completed portions to main. Publication base is aff1cb7. Ready scope: the
main browser-smoke and tactical PNG/SVG acceptance reports,12 evidence files,
their changelog/Boot records, and this review record (17 files).

## Reviewed and ready

- [Main browser smoke](MAIN_BROWSER_SMOKE_2026-10-25.md): ready-library filtering,
  preview, both attachment paths, saved two-phase/50-minute training and saved
  nine-object half-pitch tactic, backed by screenshots/read-only DB receipts.
- [Export acceptance](TACTICAL_EXPORT_ACCEPTANCE_2026-10-25.md): downloaded
  PNG1600×1200/SVG800×600, synthetic board JSON, editor/reference/render/comparison
  images and machine-readable assertions. The original in-app PNG limitation
  remains explicit; Chrome PNG succeeds. SVG font substitution may affect numeral
  rendering without changing board geometry.
- A fresh read-only verifier decodes all9 raster evidence files, checks original
  PNG/SVG hashes and repeated downloads, validates the nine-object board, matches
  SVG transforms to JSON, and rejects script/foreignObject/external references.
  It does not rewrite any source evidence.

## Test and publication boundary

The other task has started a new PNG download implementation and tests. An initial
targeted run during that edit failed31 editor cases with ReferenceError:
ReactForStage is not defined; the SVG suite passed. This is recorded as an
in-progress working-tree result, not a green result. The new editor source/test,
PNG compatibility report/ADR note and png-download-fix artifacts are excluded
pending their separate completed verification.

To verify the evidence's actual baseline without disturbing that work, git archive
copies published aff1cb7 frontend source/config into an ignored review directory
and reuses existing dependencies through a junction. Both SVG/editor suites pass
freshly there:35/35 tests. No unpublished code is substituted into that run.

Because the primary checkout is now on codex/png-download-compatibility, reviewed
main content is assembled using a separate temporary Git index based on aff1cb7.
Only the completed sections of the shared changelog/Boot are projected into main;
the active checkout, branch, normal index and working files are not changed.
The exact proposed tree is archived for normal local links/CDSK/whitespace checks.
A normal fast-forward push publishes its commit to main, followed by remote-ref
and committed-blob verification. No force push or branch switching is used.

No runtime, schema, migration, dependency, configuration or retained-data change
is included. A full root rerun is unnecessary for these evidence-only changes.
Previous root17/17 remains dated evidence for the unchanged published application,
not a claim about ongoing PNG implementation. The existing application stays up.

Ignored review receipts/logs are under output/pending-evidence-publication-20261025:
verified-artifacts.json, export-editor-tests.log, published-baseline-tests.log and
publication-tree.json. Publication scope and source bytes are pinned before push.
