"""CDSK 0.1.0 repository profile, revision 1 (ADR-0046). Standard library only.

Independent implementation of the versioned project contract; upstream parity
has not been established. This tool reads files only and never imports project code.
"""

import argparse
from datetime import date
import json
from pathlib import Path, PurePosixPath
import re
import sys

VERSION = "0.1.0"
REQUIRED_FILES = (
    "AGENTS.md", "PROJECT_BOOT.md", "README.md", "CHANGELOG.md",
    "docs/00-product/CONSTITUTION.md", "docs/00-product/PRODUCT_SPEC.md",
    "docs/00-product/SCOPE.md", "docs/00-product/ROADMAP.md",
    "docs/00-product/GLOSSARY.md", "docs/00-product/PERSONAS.md",
    "docs/00-product/CORE_WORKFLOWS.md", "docs/00-product/REQUIREMENTS.md",
    "docs/10-architecture/OVERVIEW.md", "docs/10-architecture/BOUNDED_CONTEXTS.md",
    "docs/10-architecture/DATA_MODEL.md", "docs/10-architecture/API_CONVENTIONS.md",
    "docs/10-architecture/SECURITY_MODEL.md", "docs/10-architecture/INTEGRATIONS.md",
    "docs/10-architecture/AI_ARCHITECTURE.md", "docs/20-execution/BACKLOG.md",
    "docs/20-execution/MILESTONES.md", "docs/20-execution/RELEASE_PLAN.md",
    "docs/20-execution/CHANGE_REQUESTS.md", "docs/30-quality/CODING_STANDARDS.md",
    "docs/30-quality/TEST_STRATEGY.md", "docs/30-quality/DEFINITION_OF_DONE.md",
    "docs/40-operations/RUNBOOK.md", "docs/40-operations/DEPLOYMENT.md",
    "docs/40-operations/BACKUP_RECOVERY.md", "docs/40-operations/OBSERVABILITY.md",
    "docs/50-decisions/README.md", "docs/50-decisions/ADR-0000-template.md",
    "docs/60-ai/PROMPT_GUIDE.md", "docs/60-ai/MEMORY_STRATEGY.md",
    "docs/60-ai/CONTEXT_POLICY.md", "docs/60-ai/SESSION_HANDOFF.md",
)
BOOT_SECTIONS = (
    "Project Identity", "Current Status", "Repository Navigation",
    "Architecture Snapshot", "Decision Snapshot", "AI Context",
    "Current Priorities", "Known Constraints", "Working Agreements",
    "Exit Checklist", "AI Handoff",
)


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("duplicate JSON key: " + key)
        result[key] = value
    return result


def reject_constant(value):
    raise ValueError("non-JSON number: " + value)


def iso_date(value):
    if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        return False
    try:
        date.fromisoformat(value)
        return True
    except ValueError:
        return False


def prose(text):
    # Code examples and comments must not satisfy document metadata/structure.
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    return re.sub(r"^(`{3,}|~{3,}).*?^\1[^\n]*$", "", text, flags=re.M | re.S)


def metadata(text, name):
    match = re.search(r"^- \*\*" + re.escape(name) + r":\*\*[ \t]*([^\n]+)", text, re.M)
    return match.group(1).strip() if match else None


def validate(root):
    errors = []
    documents = {}
    root = root.resolve()

    def error(code, target, message):
        errors.append(f"{code} {target}: {message}")

    def inside(relative):
        if not isinstance(relative, str) or not relative or "\\" in relative:
            raise ValueError("expected repository-relative POSIX path")
        parts = PurePosixPath(relative)
        if parts.is_absolute() or any(part in ("", ".", "..") for part in relative.split("/")) or ":" in relative:
            raise ValueError("absolute, traversal or non-normalized path")
        resolved = (root / relative).resolve()
        if not resolved.is_relative_to(root):
            raise ValueError("path resolves outside project")
        return resolved

    def read(relative, markdown=True):
        try:
            target = inside(relative)
            if not target.is_file():
                raise ValueError("required regular file is missing")
            text = target.read_text(encoding="utf-8-sig")
            if markdown:
                visible = prose(text).strip()
                lines = visible.splitlines()
                if not lines or not re.fullmatch(r"#\s+\S.*", lines[0]):
                    raise ValueError("expected a first-level title")
                if not any(line.strip() and not line.startswith("#") for line in lines[1:]):
                    raise ValueError("document has no body")
            documents[relative] = prose(text)
            return text
        except (OSError, UnicodeError, ValueError) as exc:
            error("CDSK-FILE", relative, str(exc))
            return None

    raw = read(".cdsk.json", markdown=False)
    manifest = None
    if raw is not None:
        try:
            manifest = json.loads(raw, object_pairs_hook=unique_object, parse_constant=reject_constant)
            if not isinstance(manifest, dict):
                raise ValueError("expected a JSON object")
        except (ValueError, TypeError) as exc:
            error("CDSK-MANIFEST", ".cdsk.json", str(exc))
            manifest = None
    required = list(REQUIRED_FILES)
    if manifest is not None:
        if manifest.get("standard") != "CDSK" or manifest.get("version") != VERSION:
            error("CDSK-VERSION", ".cdsk.json", "expected CDSK " + VERSION)
        if not iso_date(manifest.get("initializedAt")):
            error("CDSK-MANIFEST", ".cdsk.json", "initializedAt must be an ISO calendar date")
        declared = manifest.get("requiredFiles")
        if not isinstance(declared, list) or not declared or not all(isinstance(item, str) for item in declared):
            error("CDSK-MANIFEST", ".cdsk.json", "requiredFiles must be a nonempty string list")
        else:
            if len(set(declared)) != len(declared):
                error("CDSK-MANIFEST", ".cdsk.json", "duplicate requiredFiles entry")
            for missing in sorted(set(REQUIRED_FILES) - set(declared)):
                error("CDSK-BASELINE", ".cdsk.json", "missing required declaration: " + missing)
            required = sorted(set(required + declared))
    for relative in required:
        if not relative.endswith(".md"):
            error("CDSK-MANIFEST", relative, "requiredFiles entries must be Markdown documents")
        read(relative)

    boot = documents.get("PROJECT_BOOT.md", "")
    if metadata(boot, "CDSK version") != VERSION:
        error("CDSK-VERSION", "PROJECT_BOOT.md", "CDSK version must match " + VERSION)
    if not metadata(boot, "Document version") or not iso_date(metadata(boot, "Last updated")):
        error("CDSK-BOOT", "PROJECT_BOOT.md", "document version and valid last-updated date required")
    sections = {
        re.sub(r"^\d+\.\s*", "", match.group(1).strip()): match.group(2).strip()
        for match in re.finditer(r"^##[ \t]+([^\n]+)\n(.*?)(?=^## |\Z)", boot, re.M | re.S)
    }
    for section in BOOT_SECTIONS:
        if section not in sections:
            error("CDSK-BOOT", "PROJECT_BOOT.md", "missing section: " + section)
        elif not sections[section]:
            error("CDSK-BOOT", "PROJECT_BOOT.md", "empty section: " + section)
    if not re.search(r"\bCDSK\s+0\.1\.0\b", documents.get("README.md", "").replace("*", "")):
        error("CDSK-VERSION", "README.md", "CDSK version declaration required")
    constitution = documents.get("docs/00-product/CONSTITUTION.md", "")
    for field in ("Version", "Status", "Effective date"):
        if not metadata(constitution, field):
            error("CDSK-CONSTITUTION", "docs/00-product/CONSTITUTION.md", "missing metadata: " + field)

    adr_count = 0
    seen = set()
    index = documents.get("docs/50-decisions/README.md", "")
    # Check the index's actual Markdown targets, not incidental filename mentions.
    indexed = set(re.findall(r"\]\((ADR-\d{4}-[^)]+\.md)\)", index))
    try:
        directory = inside("docs/50-decisions")
        for file in sorted(directory.glob("ADR-*.md")):
            if file.name == "ADR-0000-template.md":
                continue
            relative = "docs/50-decisions/" + file.name
            if relative not in documents:
                read(relative)
            text = documents.get(relative, "")
            match = re.fullmatch(r"ADR-(\d{4})-.+\.md", file.name)
            if not match or match.group(1) in seen:
                error("CDSK-ADR", relative, "invalid or duplicate ADR number")
                continue
            number = match.group(1)
            seen.add(number)
            adr_count += 1
            if not re.match(r"# ADR-" + number + r":\s+\S", text):
                error("CDSK-ADR", relative, "title must match filename ADR number")
            if metadata(text, "Status") not in ("Proposed", "Accepted", "Rejected", "Superseded"):
                error("CDSK-ADR", relative, "invalid or missing status")
            if number == "0001" and metadata(text, "Status") != "Accepted":
                error("CDSK-ADR", relative, "CDSK adoption must be Accepted")
            if not iso_date(metadata(text, "Date")):
                error("CDSK-ADR", relative, "valid date required")
            decision = re.search(
                r"^## (?:Decision(?:[ \t]+[—–-][^\n]*)?|Karar|Kabul edilen karar paketi)[ \t]*\n(.*?)(?=^## |\Z)",
                text, re.M | re.S,
            )
            if not decision or not decision.group(1).strip():
                error("CDSK-ADR", relative, "nonempty Decision section required")
            if file.name not in indexed:
                error("CDSK-ADR", relative, "missing link in ADR index")
    except (OSError, ValueError) as exc:
        error("CDSK-ADR", "docs/50-decisions", str(exc))
    if "0001" not in seen:
        error("CDSK-ADR", "docs/50-decisions", "adoption ADR-0001 required")
    return errors, len(required), adr_count


def main():
    parser = argparse.ArgumentParser(description="Validate CDSK 0.1.0 project profile revision 1 (ADR-0046)")
    parser.add_argument("project", type=Path, help="project directory (read only)")
    args = parser.parse_args()
    if not args.project.is_dir():
        parser.error("project must be an existing directory")
    errors, count, adrs = validate(args.project)
    for error in errors:
        print("[cdsk] " + error, file=sys.stderr)
    print(f"[cdsk] CDSK {VERSION} project profile r1: {count} required documents, {adrs} ADRs, {len(errors)} errors")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
