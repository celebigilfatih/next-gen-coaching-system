# PR #1 post-merge cleanup — 2026-10-25

The user explicitly requested deleting merged codex/mvp-stabilization locally and
on GitHub, safely removing the old PR review worktree and leaving main clean and
synchronized. This supersedes the earlier preservation instruction in the
[merge record](PR_1_MAIN_MERGE_2026-10-25.md) only for these requested artifacts.

## Safety checks and results

- PR#1 is closed/merged as a90123af143bd0017732eeb5443df73060c8182a.
  The feature tip6fb5fb647b37cc9170d38d74e5b5d025934a996c and detached review
  head d65f799 are ancestors of main. There are no feature-only commits to lose.
- Primary checkout starts clean on main7de694c, matching origin/main. The remote
  feature tip is checked against the expected merged SHA before deletion.
- The attached managed review worktree contains four staged document changes
  plus one ignored review-only build configuration. Their complete bytes, index/
  working patches and hashes are preserved in ignored primary-workspace evidence
  under output/merged-branch-cleanup-20261025 before cleanup.
- The app's archive_worktree operation saves recoverable state and removes
  the review checkout/registration. Its attachment is now archived_worktree and
  remains recoverable through the app. The old filesystem path no longer exists.
- Three node_modules junctions pointed into the primary checkout. An attempted
  non-recursive manual unlink was policy-blocked and changed no files. No alternate
  shell deletion was attempted; the managed archive completed the cleanup safely.
  All three primary dependency directories and recorded package hashes survived
  unchanged. Ignored generated builds/router types are disposable; the review-only
  build configuration was separately preserved before archiving.
- Remote deletion uses the expected-tip lease, so a concurrently advanced branch
  cannot be deleted silently. Local deletion uses git branch -d after ancestry
  verification; no force-delete, reset or main history rewrite is performed.

This closure changes documentation only. No source, dependency installation,
retained data, migration, configuration or production service is changed. Appropriate
verification is Git ancestry/ref/worktree checks, preserved-file/dependency hashes,
Markdown links, CDSK and whitespace; application suites are not rerun for deleting
already merged refs and an archived review checkout. The fresh full17/17 merge
gate remains the dated [merge evidence](PR_1_MAIN_MERGE_2026-10-25.md).

Final completion checks confirm only the primary main worktree remains active,
the feature ref is absent locally/remotely, main equals origin/main with zero
ahead/behind, and the working tree is clean after publishing these closure notes.
Exact before/after refs and preservation hashes remain in the ignored evidence
directory. Existing PR history and the recoverable archive are retained.
