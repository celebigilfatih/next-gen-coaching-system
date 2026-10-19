# CDSK 0.1.0 project validation profile — revision 1

This versioned project contract implements the local CDSK adoption under
[ADR-0001](../50-decisions/ADR-0001-cdsk-adoption.md) and the explicitly approved
[ADR-0046](../50-decisions/ADR-0046-repository-owned-cdsk-validator.md). It documents
an independent implementation; the unavailable external validator's rules and
upstream equivalence remain unverified. The CDSK standard version stays 0.1.0.

## Rules and their existing sources

| Rule                          | Enforced contract                                                                                                                                                                                                                                                                                      | Source                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| CDSK-MANIFEST / CDSK-BASELINE | JSON object with unique keys; CDSK version metadata; valid initializedAt date; nonempty, unique string requiredFiles list retaining all 36 original declarations. Extra declarations are also checked.                                                                                                 | Root `.cdsk.json` adopted in ADR-0001; baseline pinned in source.                    |
| CDSK-FILE                     | Each declared document is a readable UTF-8 regular file inside the project; normalized relative POSIX paths only, no absolute/traversal/backslash/drive paths or links escaping the root. Markdown has an H1 title and a body beyond headings/comments/code examples. BOM and native EOL are accepted. | Manifest mandatory information architecture; AGENTS repository authority/read order. |
| CDSK-VERSION                  | Manifest is CDSK 0.1.0; Project Boot CDSK version matches; README declares CDSK 0.1.0. Unsupported versions fail rather than being interpreted.                                                                                                                                                        | Existing version declarations and ADR-0001.                                          |
| CDSK-BOOT                     | Document version, calendar Last updated date, and nonempty existing 11 sections from Project Identity through AI Handoff. Number prefixes are optional. Code/comment headings do not satisfy structure.                                                                                                | Existing PROJECT_BOOT.md structure and AGENTS handoff requirement.                   |
| CDSK-CONSTITUTION             | Version, Status and Effective date metadata exist. Draft status and TBD effective date are accepted.                                                                                                                                                                                                   | Existing CONSTITUTION.md metadata.                                                   |
| CDSK-ADR                      | Four-digit unique ADR numbers, title matching filename, status Proposed/Accepted/Rejected/Superseded, valid date, nonempty decision and link from ADR index. ADR-0001 adoption is present and Accepted.                                                                                                | Existing ADR template/records/index; accepted adoption.                              |

The template `ADR-0000-template.md` must exist but is exempt from record metadata
values. Existing decision titles `Decision`, `Decision — Option …` (also hyphen/en
dash), `Karar` and `Kabul edilen karar paketi` are recognized; `Decision Drivers`
does not satisfy a decision. Localized historical records retain their content.
Dates use real `YYYY-MM-DD` calendar values; no invented deadline/freshness policy
is imposed. A document's unresolved knowledge may remain `TBD` or explained `N/A`.

## Execution contract

Run `node scripts/validate-cdsk.mjs` at the repository root. It defaults to tracked
`scripts/cdsk/validate_project.py` with no external checkout/network. Python 3.9+
uses only its standard library. `PYTHON` selects an executable; platform/bundled
Python launchers remain supported. Direct usage is
`python scripts/cdsk/validate_project.py <project-directory>`.

Exit 0 means all profile rules pass, exit 1 means validation failures, and invalid
CLI arguments return 2. Diagnostics print rule IDs and paths, never file bodies.
The validator writes nothing and never imports or executes project source.
Explicit `CDSK_VALIDATOR` overrides preserve their result; a missing override
fails without fallback. The root's independent Markdown-link check still runs.

## Limits and maintenance

These are mechanical structure checks. They do not prove semantic accuracy,
approval authenticity, privacy compliance, product completion or upstream parity.
The AGENTS/Constitution/ADR authority and human decision gates still apply.
Keep code, fixture expectations and this profile version aligned when changing
rules; a failing project is not fixed by returning unconditional success or
removing its required declarations.
