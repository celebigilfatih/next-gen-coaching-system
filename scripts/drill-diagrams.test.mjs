import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import test from "node:test";
import { parseDrillContentBody, boardSvg } from "./drill-diagrams/application-validation.mjs";
import { buildDiagramRevision } from "./generate-drill-diagram-pack.mjs";

const originalPath = resolve("content/drills/ngcs-starter-v1.json");
const revisionPath = resolve("content/drills/ngcs-starter-diagrams-v2.json");
const original = JSON.parse(readFileSync(originalPath, "utf8"));
// Until the revision exists, expose the actual repeated geometry in the current pack.
const revision = existsSync(revisionPath) ? JSON.parse(readFileSync(revisionPath, "utf8")) : original;
const normalized = (value) => {
  if (Array.isArray(value)) return value.map(normalized);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !["id", "text", "number", "name", "color"].includes(key))
        .map(([key, item]) => [key, normalized(item)])
    );
  return value;
};

test("each age has24 different exercise organizations, ignoring labels, IDs and colors", () => {
  for (const age of ["u12", "u14", "u16", "u18", "senior"]) {
    const rows = revision.items.filter((item) => item.drillId.includes(`-${age}-`));
    assert.equal(rows.length, 24);
    assert.equal(new Set(rows.map((row) => JSON.stringify(normalized(row.boardDocument)))).size, 24, age);
  }
});

test("historic v1 manifest stays byte-for-byte unchanged", () => {
  assert.equal(
    createHash("sha256").update(readFileSync(originalPath)).digest("hex"),
    "e066c892a784c3a18ed8b14e5fb71977e2724fd0554911210d8d37cb75f7d28f"
  );
});

test("revision is an unpublished120-item package of the same stable drill identities", () => {
  assert.equal(revision.packId, "ngcs-starter-diagrams-v2");
  assert.equal(revision.publicationStatus, "DRAFT");
  assert.equal(revision.reviewer, "TBD");
  assert.equal(revision.count, 120);
  assert.deepEqual(
    revision.items.map((item) => item.drillId),
    original.items.map((item) => item.drillId)
  );
});

test("every revised item passes the actual backend content/board contract and shared SVG exporter", () => {
  for (const item of revision.items) {
    assert.doesNotThrow(() => parseDrillContentBody(item), item.drillId);
    const svg = boardSvg(item.boardDocument);
    assert.ok(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
    assert.ok(!svg.includes("NaN") && !svg.includes("undefined"));
    assert.ok(Buffer.byteLength(JSON.stringify(item.boardDocument)) < 100_000);
  }
});

test("all objects, arrow endpoints and whole zones stay within the field", () => {
  for (const item of revision.items) {
    const { pitch, elements } = item.boardDocument;
    const validPoint = (x, y) =>
      Number.isFinite(x) && Number.isFinite(y) && x >= 0 && y >= 0 && x <= pitch.width && y <= pitch.height;
    for (const element of elements) {
      assert.ok(validPoint(element.x, element.y), `${item.drillId}:${element.id}`);
      if (element.type === "arrow") assert.ok(validPoint(element.endX, element.endY));
      if (element.type === "line")
        for (let index = 0; index < element.points.length; index += 2)
          assert.ok(validPoint(element.x + element.points[index], element.y + element.points[index + 1]));
      if (element.type === "zone") {
        assert.ok(validPoint(element.x - element.width / 2, element.y - element.height / 2));
        assert.ok(validPoint(element.x + element.width / 2, element.y + element.height / 2));
      }
    }
  }
});

test("pressing, compact defence and final-zone decisions include the required opposition and targets", () => {
  for (const age of ["u12", "u14", "u16", "u18", "senior"]) {
    const find = (objective) =>
      revision.items.find((item) => item.drillId.includes(`-${age}-`) && item.objectiveKey === objective);
    for (const objective of ["pres", "savunma-gecisi", "kompakt-blok", "son-bolge"]) {
      const board = find(objective).boardDocument;
      assert.ok(
        board.elements.some((element) => element.type === "player" && element.team === "away"),
        `${age}:${objective} opposition`
      );
      assert.ok(
        board.elements.some((element) => ["goal", "zone"].includes(element.type)),
        `${age}:${objective} target`
      );
    }
    assert.ok(find("son-bolge").boardDocument.elements.some((element) => element.type === "goalkeeper"));
    assert.ok(find("bitiricilik").boardDocument.elements.filter((element) => element.type === "zone").length >= 3);
  }
});

test("instructions describe actual group size, rotation and enough participants for every retained age variant", () => {
  for (const item of revision.items) {
    const actors = item.boardDocument.elements.filter((element) =>
      ["player", "goalkeeper"].includes(element.type)
    ).length;
    assert.ok(item.organization.includes(`${actors} kişilik`), item.drillId);
    assert.ok(item.organization.includes("rol değişerek"));
    assert.ok(item.steps.length >= 4 && item.coachingPoints.length >= 3);
    assert.ok(item.constraints.length >= 2);
    const base = original.items.find((row) => row.drillId === item.drillId);
    assert.deepEqual(
      item.ageVariants.map((variant) => variant.ageGroup),
      base.ageVariants.map((variant) => variant.ageGroup)
    );
    for (const variant of item.ageVariants) {
      assert.ok(variant.playerMin >= actors && variant.playerMax >= variant.playerMin);
      assert.ok(variant.rules.some((rule) => rule.includes(`${actors} kişilik`)));
    }
  }
});

test("revision checksums cover instructions and the board, and never reuse a historic source checksum", () => {
  const historic = new Set(original.items.map((item) => item.source.contentHash));
  for (const item of revision.items) {
    const content = structuredClone(item);
    const actual = content.source.contentHash;
    delete content.source.contentHash;
    assert.equal(actual, createHash("sha256").update(JSON.stringify(content)).digest("hex"));
    assert.ok(!historic.has(actual), item.drillId);
  }
});

test("age variants never inherit another age's labelled rules", () => {
  const labels = { U12: "U12", U14: "U14", U16: "U16", U18: "U18", SENIOR: "A Takım" };
  for (const item of revision.items)
    for (const variant of item.ageVariants)
      for (const rule of variant.rules) {
        const label = rule.match(/^(U12|U14|U16|U18|A Takım):/);
        if (label) assert.equal(label[1], labels[variant.ageGroup], item.drillId);
      }
});

test("technical exercises without defenders never request defensive pressure", () => {
  for (const item of revision.items.filter((row) => row.category === "TECHNICAL")) {
    const defenders = item.boardDocument.elements.some(
      (element) => element.type === "player" && element.team === "away"
    );
    if (!defenders)
      for (const variant of item.ageVariants)
        assert.ok(!variant.rules.some((rule) => rule.includes("savunma baskısı")), item.drillId);
  }
});

test("tactical goals face into the field in the actual shared goal geometry", () => {
  for (const item of revision.items.filter((row) => row.category === "TACTICAL"))
    for (const goal of item.boardDocument.elements.filter((element) => element.type === "goal"))
      assert.equal(goal.rotation, goal.y < item.boardDocument.pitch.height / 2 ? 0 : 180, item.drillId);
});

test("cooldown reflection keeps shadow opposition without adding active pressure", () => {
  for (const item of revision.items.filter((row) => row.category === "COOL_DOWN"))
    for (const variant of item.ageVariants)
      assert.ok(!variant.rules.some((rule) => rule.includes("baskı uygular")), item.drillId);
});

test("shared constraints do not override selected-age pressure with the primary-age prescription", () => {
  const possession = revision.items.find(
    (row) => row.drillId.includes("-u16-") && row.objectiveKey === "topa-sahip-olma"
  );
  assert.ok(possession.ageVariants.some((variant) => variant.ageGroup === "U14"));
  assert.ok(!possession.constraints.some((rule) => rule.includes("Rakip aktif oynar")));
  const passing = revision.items.find((row) => row.drillId.includes("-u12-") && row.objectiveKey === "pas");
  assert.ok(!passing.constraints.some((rule) => rule.includes("kırmızı önce pasif gölge")));
});

test("regeneration exactly reproduces the reviewed draft without mutating its historic input", () => {
  const before = JSON.stringify(original);
  assert.deepEqual(buildDiagramRevision(original), revision);
  assert.deepEqual(buildDiagramRevision(original), revision);
  assert.equal(JSON.stringify(original), before);
});
