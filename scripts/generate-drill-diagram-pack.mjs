import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AGE_CONTEXTS, diagram } from "./drill-diagrams/diagram-builder.mjs";
import { warmCool } from "./drill-diagrams/warm-cool.mjs";
import { technical } from "./drill-diagrams/technical.mjs";
import { tactical } from "./drill-diagrams/tactical.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const recipes = { ...warmCool, ...technical, ...tactical };
const agePrefix = /^(U12|U14|U16|U18|A Takım):\s*/;
const decisions = [
  "Antrenör başlangıç çözümünü gösterir; ilk turda tek bir açık seçeneği birlikte okuyun, sonra oyuncuya seçim zamanı verin.",
  "Antrenör çizimde zaten bulunan iki çözümü gösterir; oyuncu hareketten önce seçimini söyler.",
  "Oyuncu top veya hareket başlamadan mevcut seçenekleri tarar; tur sonunda seçimini tek cümleyle açıklar.",
  "Oyuncular çizimdeki rollerini sırayla değiştirir; kapanan ilk çözümün ardından mevcut ikinci seçeneği arar.",
  "Oyuncu mevcut rolünün açı ve zamanlamasını okur; turun sonunda hangi işarete göre karar verdiğini açıklar.",
];

export function buildDiagramRevision(original) {
  if (Object.keys(recipes).length !== 24 || original.items.length !== 120)
    throw new Error("Expected24 recipes and120 originals");
  const items = original.items.map((base) => {
    const primary = base.ageVariants[0];
    const age = AGE_CONTEXTS[primary.ageGroup];
    const draw = diagram(`${base.drillId}-r2`, [primary.areaLengthM, primary.areaWidthM]);
    const authored = recipes[base.objectiveKey]({
      age,
      diagram: draw,
      area: [primary.areaLengthM, primary.areaWidthM],
      players: [base.playerMin, base.playerMax],
    });
    // One version has one board. Adjacent-age adaptations retain that board's
    // roles and equipment; never copy a differently populated age's layout.
    const guide = Object.fromEntries(
      Object.entries(authored).map(([key, value]) => [
        key,
        typeof value === "string"
          ? value.replaceAll(`${age.label} uyarlamasında`, "Bu örnekte")
          : Array.isArray(value)
            ? value.map((entry) =>
                typeof entry === "string" && agePrefix.test(entry)
                  ? "İşaret ve karar temposunu seçilen yaşın kurallarından alın; çizimdeki başlangıç rolleri ve ekipman düzeni korunur."
                  : entry
              )
            : value,
      ])
    );
    const actors = guide.boardDocument.elements.filter((element) =>
      ["player", "goalkeeper"].includes(element.type)
    ).length;
    const lowIntensity = base.category === "WARM_UP" || base.category === "COOL_DOWN";
    const hasDefenders =
      !lowIntensity &&
      guide.boardDocument.elements.some((element) => element.type === "player" && element.team === "away");
    const sharedRules = authored.rules.filter(
      (rule, index) => !agePrefix.test(rule) && !(base.category === "TACTICAL" && index === 0)
    );
    const ageVariants = base.ageVariants.map((variant) => {
      const variantAge = AGE_CONTEXTS[variant.ageGroup];
      return {
        ...variant,
        playerMin: Math.max(variant.playerMin, actors),
        playerMax: Math.max(variant.playerMax, actors),
        rules: [
          ...sharedRules,
          `Şema ${actors} kişilik bir örnek grubu gösterir. ${variantAge.label} uyarlamasında saha ${variant.areaLengthM}×${variant.areaWidthM} m, süre ${variant.durationMin} dk; diğer oyuncular roller değişerek katılır.`,
          `${variantAge.label}: çizimdeki oyuncu, kapı ve ekipman sayısı korunur. ${decisions[variantAge.level]}`,
          ...(hasDefenders
            ? [
                `${variantAge.label}: çizimdeki kırmızı oyuncular ${variantAge.pressure} baskı uygular; yeni savunmacı eklenmez. Uygulama yerleşmeden temas sınırı daraltılmaz.`,
              ]
            : []),
          ...(base.category === "WARM_UP" || base.category === "COOL_DOWN"
            ? ["Kontrollü rahat tempoyu koru; rakip baskısı veya hız yarışı ekleme."]
            : []),
        ],
        coachingPoints: [...guide.coachingPoints],
      };
    });
    const item = {
      ...base,
      summary: `${base.objectiveLabel}. ${guide.steps[0]}`,
      playerMin: Math.max(base.playerMin, actors),
      playerMax: Math.max(base.playerMax, actors),
      organization: `${guide.organization} Şema ${actors} kişilik tek çalışma grubunu gösterir; toplam oyuncular sayı ve alan elverirse paralel gruplara ayrılır, aksi halde rol değişerek sırayla katılır. Alan ve süre seçilen yaş uyarlamasından alınır.`,
      equipmentItems: guide.equipmentItems,
      steps: guide.steps,
      coachingPoints: guide.coachingPoints,
      progressions: guide.progressions,
      regressions: guide.regressions,
      constraints: [
        ...sharedRules,
        "Çizimdeki başlangıç rolleri, kapı ve ekipman düzeni korunur; baskı ve karar temposu seçilen yaşın kurallarından alınır.",
      ],
      boardDocument: guide.boardDocument,
      source: {
        kind: "NGCS_ORIGINAL",
        title: "NGCS Çalışmaya Özgü Çizimler ve Uygulamalar v2",
        license: "NGCS_PROPRIETARY",
      },
      ageVariants,
    };
    item.source.contentHash = createHash("sha256").update(JSON.stringify(item)).digest("hex");
    return item;
  });
  return {
    schemaVersion: 1,
    packId: "ngcs-starter-diagrams-v2",
    locale: "tr-TR",
    publicationStatus: "DRAFT",
    reviewer: "TBD",
    sourcePolicy: original.sourcePolicy,
    count: items.length,
    items,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const pack = buildDiagramRevision(
    JSON.parse(readFileSync(resolve(root, "content/drills/ngcs-starter-v1.json"), "utf8"))
  );
  if (process.argv.includes("--write")) {
    const target = resolve(root, "content/drills/ngcs-starter-diagrams-v2.json");
    writeFileSync(target, `${JSON.stringify(pack, null, 2)}\n`);
    process.stdout.write(`Wrote ${pack.count} DRAFT revisions; historic v1 unchanged\n`);
  } else process.stdout.write(`Validated ${pack.count} generated DRAFT revisions\n`);
}
