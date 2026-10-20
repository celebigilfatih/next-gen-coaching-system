"""Real CLI contract tests using disposable project directories, no third-party libs."""

import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from validate_project import BOOT_SECTIONS, REQUIRED_FILES

SCRIPT = Path(__file__).with_name("validate_project.py")
CACHE = SCRIPT.parents[2] / "node_modules" / ".cache"


class ProjectValidationTests(unittest.TestCase):
    def setUp(self):
        CACHE.mkdir(parents=True, exist_ok=True)
        temporary = tempfile.TemporaryDirectory(prefix="cdsk project ", dir=CACHE)
        self.root = Path(temporary.name).resolve()
        # Cleanup owns exactly one created directory inside this ignored cache.
        self.assertEqual(self.root.parent, CACHE.resolve())
        self.addCleanup(temporary.cleanup)
        for file in REQUIRED_FILES:
            self.write(file, "# Document\n\nDocument content.\n")
        self.manifest = {
            "standard": "CDSK", "version": "0.1.0", "initializedAt": "2026-08-31",
            "requiredFiles": list(REQUIRED_FILES),
        }
        self.save_manifest()
        self.write("README.md", "# Project\n\nUses **CDSK 0.1.0**.\n")
        self.write("PROJECT_BOOT.md", "# Project Boot\n\n- **Document version:** 1.0\n"
                   "- **CDSK version:** 0.1.0\n- **Last updated:** 2026-10-19\n\n"
                   + "\n".join(f"## {i}. {name}\n\nTBD\n" for i, name in enumerate(BOOT_SECTIONS, 1)))
        self.write("docs/00-product/CONSTITUTION.md", "# Constitution\n\n"
                   "- **Version:** 0.1\n- **Status:** Draft\n- **Effective date:** TBD\n")
        self.adr = "docs/50-decisions/ADR-0001-adoption.md"
        self.write(self.adr, "# ADR-0001: Adoption\n\n- **Status:** Accepted\n"
                   "- **Date:** 2026-08-31\n\n## Decision\n\nUse CDSK 0.1.0.\n")
        self.write("docs/50-decisions/README.md", "# Decisions\n\n[Adoption](ADR-0001-adoption.md)\n")

    def write(self, file, text):
        target = self.root / file
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text, encoding="utf-8")

    def save_manifest(self):
        self.write(".cdsk.json", json.dumps(self.manifest))

    def run_validator(self, expected=1, message=None, project=None):
        result = subprocess.run([sys.executable, "-B", str(SCRIPT), str(project or self.root)],
                                text=True, encoding="utf-8", capture_output=True, check=False)
        self.assertEqual(result.returncode, expected, result.stdout + result.stderr)
        if message:
            self.assertIn(message, result.stderr)
        return result

    def test_valid_project_with_spaces_bom_crlf_and_tbd_is_read_only(self):
        self.write("CHANGELOG.md", "\ufeff# Changelog\r\n\r\nTBD\r\n")
        def hashes():
            return {str(file.relative_to(self.root)): hashlib.sha256(file.read_bytes()).hexdigest()
                    for file in self.root.rglob("*") if file.is_file()}
        before = hashes()
        self.assertIn("36 required documents", self.run_validator(0).stdout)
        self.assertEqual(hashes(), before)

    def test_missing_manifest(self):
        (self.root / ".cdsk.json").unlink()
        self.run_validator(message="CDSK-FILE .cdsk.json")

    def test_invalid_manifest_shapes_and_duplicate_keys(self):
        for text in ("{bad", "[]", '{"version":"0.1.0","version":"0.2.0"}', '{"extra":NaN}'):
            with self.subTest(text=text):
                self.write(".cdsk.json", text)
                self.run_validator(message="CDSK-MANIFEST")

    def test_unknown_version_and_invalid_calendar_date(self):
        self.manifest.update(version="0.2.0", initializedAt="2026-02-30")
        self.save_manifest()
        result = self.run_validator(message="CDSK-VERSION")
        self.assertIn("initializedAt", result.stderr)

    def test_required_list_cannot_remove_baseline(self):
        self.manifest["requiredFiles"].remove("AGENTS.md")
        (self.root / "AGENTS.md").unlink()
        self.save_manifest()
        result = self.run_validator(message="CDSK-BASELINE")
        self.assertIn("CDSK-FILE AGENTS.md", result.stderr)

    def test_invalid_and_duplicate_required_lists(self):
        for value in ([], None, "AGENTS.md", [1], list(REQUIRED_FILES) + ["AGENTS.md"]):
            with self.subTest(value=value):
                self.manifest["requiredFiles"] = value
                self.save_manifest()
                self.run_validator(message="CDSK-MANIFEST")

    def test_missing_empty_title_only_and_invalid_utf8_documents(self):
        target = self.root / "AGENTS.md"
        for value in (None, b"", b"# Title\n<!-- body -->", b"body without title", b"\xff"):
            with self.subTest(value=value):
                if value is None:
                    target.unlink()
                else:
                    target.write_bytes(value)
                self.run_validator(message="CDSK-FILE AGENTS.md")

    def test_absolute_traversal_and_windows_paths_fail(self):
        for value in ("../outside.md", "/outside.md", "C:/outside.md", "..\\outside.md", "docs//bad.md"):
            with self.subTest(value=value):
                self.manifest["requiredFiles"] = list(REQUIRED_FILES) + [value]
                self.save_manifest()
                self.run_validator(message="CDSK-FILE " + value)

    def test_extra_declared_documents_are_checked(self):
        self.manifest["requiredFiles"].append("extra.md")
        self.save_manifest()
        self.run_validator(message="CDSK-FILE extra.md")
        self.write("extra.md", "# Extra\n\nContent\n")
        self.run_validator(0)

    @unittest.skipIf(os.name == "nt", "Windows symlinks require a separately enabled OS privilege")
    def test_symlink_outside_project_is_rejected(self):
        file = self.root / "AGENTS.md"
        file.unlink()
        file.symlink_to(SCRIPT)
        self.run_validator(message="path resolves outside project")

    def test_boot_and_readme_version_mismatches_fail(self):
        for file in ("PROJECT_BOOT.md", "README.md"):
            with self.subTest(file=file):
                target = self.root / file
                original = target.read_text(encoding="utf-8")
                self.write(file, original.replace("0.1.0", "0.2.0"))
                self.run_validator(message="CDSK-VERSION " + file)
                self.write(file, original)

    def test_handoff_heading_in_code_does_not_satisfy_missing_section(self):
        target = self.root / "PROJECT_BOOT.md"
        original = target.read_text(encoding="utf-8")
        self.write("PROJECT_BOOT.md", original.replace("## 11. AI Handoff", "## Other")
                   + "\n```markdown\n## AI Handoff\n```\n")
        self.run_validator(message="missing section: AI Handoff")
        self.write("PROJECT_BOOT.md", original.replace("## 11. AI Handoff\n\nTBD", "## 11. AI Handoff\n"))
        self.run_validator(message="empty section: AI Handoff")

    def test_missing_constitution_metadata(self):
        self.write("docs/00-product/CONSTITUTION.md", "# Constitution\n\nTBD\n")
        self.run_validator(message="CDSK-CONSTITUTION")
        self.write("docs/00-product/CONSTITUTION.md", "# Constitution\n\n- **Version:**\n"
                   "- **Status:** Draft\n- **Effective date:** TBD\n")
        self.run_validator(message="missing metadata: Version")

    def test_adr_number_status_date_and_decision_fail(self):
        target = self.root / self.adr
        original = target.read_text(encoding="utf-8")
        for old, new in (("ADR-0001:", "ADR-9999:"), ("Accepted", "Unknown"),
                         ("2026-08-31", "2026-02-30"), ("## Decision", "## Decision Drivers")):
            with self.subTest(old=old):
                self.write(self.adr, original.replace(old, new))
                self.run_validator(message="CDSK-ADR " + self.adr)
        self.write(self.adr, original.replace("Use CDSK 0.1.0.", ""))
        self.run_validator(message="nonempty Decision section")
        self.write(self.adr, original.replace("Accepted", "Proposed"))
        self.run_validator(message="CDSK adoption must be Accepted")

    def test_existing_decision_heading_variants(self):
        original = (self.root / self.adr).read_text(encoding="utf-8")
        for heading in ("Decision — Option A", "Karar", "Kabul edilen karar paketi"):
            with self.subTest(heading=heading):
                self.write(self.adr, original.replace("## Decision", "## " + heading))
                self.run_validator(0)

    def test_unindexed_duplicate_and_missing_adoption_adr(self):
        self.write("docs/50-decisions/README.md", "# Decisions\n\nADR-0001-adoption.md\n")
        self.run_validator(message="missing link in ADR index")
        self.write("docs/50-decisions/ADR-0001-duplicate.md", (self.root / self.adr).read_text(encoding="utf-8"))
        self.run_validator(message="duplicate ADR number")
        (self.root / self.adr).unlink()
        (self.root / "docs/50-decisions/ADR-0001-duplicate.md").unlink()
        self.run_validator(message="adoption ADR-0001 required")

    def test_invalid_project_argument(self):
        self.run_validator(2, "existing directory", self.root / "absent")


if __name__ == "__main__":
    unittest.main()
