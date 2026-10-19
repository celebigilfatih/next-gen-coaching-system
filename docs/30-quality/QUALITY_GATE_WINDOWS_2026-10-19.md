# Windows root quality gate — 2026-10-19

Subsequent explicit request: ADR-0046 now supplies a repository-owned CDSK 0.1.0
project-profile validator. The external-source blocker and 16/17 result below are
historical; [new verification](CDSK_LOCAL_VALIDATOR_2026-10-19.md) records the next run.

User explicitly requested repairing the Windows/npm root gate and running every
stage. This is BL-061 tooling work; no business API, schema, migration, deployment
or permission policy is changed. Existing working-tree changes are preserved.

## Changes

- Root devDependency npm 12.2.0 is pinned in the existing npm lockfile. Its published
  engine range is `^22.22.2 || ^24.15.0 || >=26.0.0`; actual Node 24.19.0
  satisfies it. It is a development tool, outside serving backend artifacts.
- `tool-runtime.mjs` resolves the real npm CLI and invokes it with the current
  Node executable. No shell concatenation or `.cmd` execution through spawnSync.
  Child lifecycle scripts receive Node/local npm on PATH; no global install or
  change to the user's global Node setup is needed.
- `quality-gate.mjs` retains fail-fast by default. `--continue-on-error` attempts
  every stage, prints individual results and returns nonzero for any failure.
  Six actual tooling regressions cover argv preservation, local npm, failure
  propagation, continuation, missing validator and Python/validator paths with
  spaces. The Python fixture is explicitly synthetic, not a CDSK replacement.
- Git attributes specify LF checkout/normalization for text and binary handling
  for image/fonts. Prettier accepts native existing EOL via `endOfLine:auto`,
  retaining every other syntax/layout check. No repository-wide rewrite occurs.
  The root glob uses double quotes for Windows cmd/POSIX compatibility. One
  frontend AGENTS formatting correction preserves the instruction content.
- Prisma generation uses a copied schema and separate ignored client under
  backend `node_modules/.cache/ngcs-quality-prisma/`. Quality typecheck/build
  resolve this freshly generated client's types. The running API's loaded
  Windows engine is not renamed. Ordinary Prisma generation, typecheck and
  standalone `build:check` commands remain available with their existing roles.
- Socket gateway tests pin/restore their own feature environment and test a
  positive identity in both persistence modes. Existing revoked-family checks
  remain. Runtime authorization is unchanged.
- The scene-history UI test caches the stable undo control; remounted scene-form
  controls are queried afresh. The final state after55 edits is explicitly
  asserted before 50 undos. These state tests mock the large style sheet as well
  as the existing canvas mock; layout remains browser QA. All history assertions
  remain. The suite uses one worker and a 15-second default. Concurrent work set
  a 60-second budget for the large scene-history case; observed duration 12.2s,
  ordinary history 2.3s. The complete editor file passes 29/29 in 38.3s.

## CDSK boundary

The repository requires the external CDSK 0.1.0 `validate_project.py`, normally
at sibling `../cdsk/scripts/validate_project.py`, or explicitly selected with
`CDSK_VALIDATOR`. No copy was found on this machine or accessible installed GitHub
repositories. The user was asked for its source and requested an explanation of
its purpose; no source was supplied. The wrapper now supports a real configured
Python executable, the bundled Windows interpreter where present, or normal
platform launchers. It continues to fail closed when the real validator is absent.
No replacement rules, dummy success, skipped stage or weakening of ADR-0001 is
used to make the root command green. The original validator implementation must
be obtained before the complete CDSK/root gate can pass.

## Execution and evidence

Command: `node scripts/quality-gate.mjs --continue-on-error` from the root.
Logs stay in ignored `node_modules/.cache/ngcs-quality/`.

Diagnostic attempts found locked Prisma DLL, one inherited-environment Socket
test failure, small format differences and slow editor tests under concurrent
suites. They were stopped after source fixes; neither is a passing run.
`windows-complete-20261019.log` is the subsequent complete run, on the working tree
based on `33442ff` (`codex/mvp-stabilization`). All 17 stages were attempted;
16 passed and CDSK alone failed. The root command correctly returned exit 1.

| Check                              | Final result                       |
| ---------------------------------- | ---------------------------------- |
| Tooling regressions                | PASS, 6/6                          |
| Root script formatting             | PASS                               |
| Isolated Prisma generation         | PASS                               |
| Backend typecheck / lint / format  | PASS, all three stages             |
| Backend unit tests                 | PASS, 904/904 in 62 suites         |
| Backend quality build              | PASS                               |
| Frontend typecheck / lint / format | PASS, all three stages             |
| Frontend unit tests                | PASS, 498/498 in 60 files, 434.70s |
| Frontend production/Sites build    | PASS                               |
| Sites worker tests                 | PASS, 4/4                          |
| Local Markdown links               | PASS, 170 files, zero broken links |
| External CDSK 0.1.0 validator      | BLOCKED / exit 1, real file absent |
| Git whitespace                     | PASS                               |

The runtime Prisma engine SHA-256 is identical before and after the gate. Git's
CRLF-to-LF notices describe future normalization; whitespace validation passed.
Prisma emitted its existing package-configuration deprecation notice; generation
and both builds succeeded. No CDSK rule outcome is inferred from the wrapper's
separate six-test suite. ADR-0001 and its validator requirement remain unchanged.

Closing documentation checks: evidence-report formatting and Git whitespace pass.
Another concurrent task added three-match documentation after the complete run;
an intermediate link check saw five links to its then-unwritten report. Once that
report appeared, the closing link check passed across 172 Markdown files with zero
broken local links. The test counts above describe the completed root run, not a
claim that unrelated later edits were included in its earlier test stages.

Next: obtain the original CDSK 0.1.0 validator, point `CDSK_VALIDATOR` at it and
run `node scripts/validate-cdsk.mjs`, followed by the full root command. Until then
BL-061 remains partially implemented, with the external-source prerequisite open.

No test database reset or E2E rollout is included in this non-destructive root
gate. Existing dedicated HTTP/browser acceptance remains separate. No real
training or fixture data is modified to test the tooling.
