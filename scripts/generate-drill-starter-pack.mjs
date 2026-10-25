import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ages = [
  {
    key: "U12",
    label: "U12",
    format: "Keşif Oyunu",
    method: "oyun ve yönlendirilmiş keşif",
    duration: -4,
    players: [6, 12],
    area: [28, 20],
    difficulty: "EASY",
  },
  {
    key: "U14",
    label: "U14",
    format: "Karar Kapıları",
    method: "değişken uyaran ve karar kapıları",
    duration: -2,
    players: [8, 14],
    area: [34, 24],
    difficulty: "MEDIUM",
  },
  {
    key: "U16",
    label: "U16",
    format: "Baskı Çözümü",
    method: "aktif rakip baskısı ve çözüm üretme",
    duration: 0,
    players: [10, 16],
    area: [40, 28],
    difficulty: "MEDIUM",
  },
  {
    key: "U18",
    label: "U18",
    format: "Maç Temposu",
    method: "yüksek tempo ve maç benzeri tekrar",
    duration: 2,
    players: [12, 20],
    area: [48, 34],
    difficulty: "HARD",
  },
  {
    key: "SENIOR",
    label: "A Takım",
    format: "Rol Senaryosu",
    method: "oyuncu rolü ve rakip senaryosu",
    duration: 4,
    players: [12, 22],
    area: [56, 40],
    difficulty: "HARD",
  },
];

const exercises = [
  [
    "WARM_UP",
    "dinamik-hareketlilik",
    "Dinamik Hareket Koridoru",
    "Koşu mekaniği ve eklem hareketliliğini top ile etkinleştirme",
  ],
  ["WARM_UP", "reaksiyon", "Renk ve Yön Reaksiyonu", "Görsel uyarana tepki, yön değiştirme ve çevresel farkındalık"],
  [
    "WARM_UP",
    "topla-aktivasyon",
    "Topla Aktivasyon Çemberi",
    "Top temasını artırırken nabzı kontrollü biçimde yükseltme",
  ],
  ["WARM_UP", "koordinasyon", "Koordinasyon ve Pas Akışı", "Ayak çabukluğu ile pas zamanlamasını birlikte hazırlama"],
  ["TECHNICAL", "pas", "Hareketli Pas Kapıları", "Pas şiddeti, açı oluşturma ve pas sonrası hareket"],
  [
    "TECHNICAL",
    "ilk-kontrol",
    "Yönlü İlk Kontrol Elması",
    "İlk dokunuşla baskıdan uzaklaşma ve sonraki aksiyonu hazırlama",
  ],
  ["TECHNICAL", "top-surme", "Dar Alanda Top Sürme Kaçışı", "Yakın kontrol, hız değişimi ve boş koridora çıkış"],
  ["TECHNICAL", "bitiricilik", "Üç Koridor Bitiricilik", "Farklı geliş açılarından dengeli ve hızlı bitiriş"],
  ["TECHNICAL", "orta", "Kanat Bağlantısı ve Orta", "Kanat kombinasyonu, ceza alanı koşuları ve orta kalitesi"],
  [
    "TECHNICAL",
    "baski-altinda-alma",
    "Baskı Altında Dönüş",
    "Rakip teması öncesi tarama, vücut açısı ve güvenli dönüş",
  ],
  ["TECHNICAL", "zayif-ayak", "Zayıf Ayak Devresi", "Tercih edilmeyen ayakla pas, kontrol ve bitiriş güveni"],
  ["TECHNICAL", "kombinasyon", "Üçüncü Oyuncu Kombinasyonu", "Duvar pası, üçüncü oyuncu koşusu ve tempo değişimi"],
  ["TACTICAL", "topa-sahip-olma", "Yönlü Sahip Olma Oyunu", "Topa sahipken genişlik, destek açıları ve yön değiştirme"],
  ["TACTICAL", "geriden-oyun", "Geriden Oyun Kurma Kanalları", "İlk hat baskısını aşma ve merkez-kanat bağlantısı"],
  [
    "TACTICAL",
    "pres",
    "Tetikleyiciyle Önde Baskı",
    "Baskı tetikleyicisini tanıma, birlikte çıkma ve pas kanalını kapatma",
  ],
  [
    "TACTICAL",
    "hucum-gecisi",
    "Top Kazanımı Sonrası Hızlı Hücum",
    "Kazanılan topu ilk pas ve destek koşularıyla ileri taşıma",
  ],
  [
    "TACTICAL",
    "savunma-gecisi",
    "Top Kaybı Sonrası Beş Saniye",
    "Top kaybında yakın baskı, merkezi koruma ve yeniden yerleşme",
  ],
  ["TACTICAL", "kompakt-blok", "Kompakt Blok Kaydırma", "Hatlar arası mesafe, top yönüne kayma ve alan savunması"],
  [
    "TACTICAL",
    "genislik-derinlik",
    "Genişlik ve Derinlik Oyunu",
    "Hücum yerleşiminde saha boyutlarını dengeli kullanma",
  ],
  ["TACTICAL", "son-bolge", "Son Bölge Karar Oyunu", "Ceza sahası çevresinde sabır, koşu seçimi ve son pas"],
  ["COOL_DOWN", "aktif-toparlanma", "Aktif Toparlanma Rotası", "Yoğunluğu kademeli düşürme ve kontrollü hareketlilik"],
  ["COOL_DOWN", "teknik-soguma", "Düşük Tempolu Pas Çemberi", "Top temasını koruyarak nabzı düşürme ve gevşeme"],
  [
    "COOL_DOWN",
    "nefes-hareketlilik",
    "Nefes ve Hareketlilik Akışı",
    "Nefes ritmiyle temel hareket açıklığını destekleme",
  ],
  ["COOL_DOWN", "yansitma", "Kısa Oyun ve Yansıtma", "Düşük yoğunluklu oyun sonrası öğrenme noktalarını sözelleştirme"],
];

const phaseDurations = { WARM_UP: 12, TECHNICAL: 18, TACTICAL: 24, COOL_DOWN: 10 };
const phaseThemes = {
  WARM_UP: ["aktivasyon", "hareket hazırlığı"],
  TECHNICAL: ["teknik gelişim", "tekrar kalitesi"],
  TACTICAL: ["oyun anlayışı", "karar verme"],
  COOL_DOWN: ["toparlanma", "yansıtma"],
};

function board(index, ageIndex) {
  const offset = (index % 4) * 18;
  return {
    schemaVersion: 1,
    kind: "tactical-board",
    pitch: { type: "training", width: 750, height: 550 },
    elements: [
      {
        id: `p-${index}-${ageIndex}-1`,
        type: "player",
        x: 170 + offset,
        y: 170,
        team: "home",
        number: "1",
        radius: 18,
      },
      {
        id: `p-${index}-${ageIndex}-2`,
        type: "player",
        x: 370,
        y: 120 + offset,
        team: "home",
        number: "2",
        radius: 18,
      },
      {
        id: `p-${index}-${ageIndex}-3`,
        type: "player",
        x: 560 - offset,
        y: 320,
        team: "home",
        number: "3",
        radius: 18,
      },
      { id: `c-${index}-${ageIndex}-1`, type: "cone", x: 120, y: 420, color: "#f59e0b", size: 14 },
      { id: `c-${index}-${ageIndex}-2`, type: "cone", x: 630, y: 420, color: "#f59e0b", size: 14 },
      { id: `b-${index}-${ageIndex}`, type: "ball", x: 205 + offset, y: 190, radius: 10 },
      {
        id: `a-${index}-${ageIndex}`,
        type: "arrow",
        x: 220 + offset,
        y: 185,
        endX: 355,
        endY: 135 + offset,
        color: "#2563eb",
        thickness: 5,
        style: "straight",
      },
    ],
  };
}

function variants(primaryIndex, duration, players, area, objective) {
  const indexes = new Set([primaryIndex]);
  if (primaryIndex > 0) indexes.add(primaryIndex - 1);
  if (primaryIndex < ages.length - 1) indexes.add(primaryIndex + 1);
  return [primaryIndex, ...[...indexes].filter((index) => index !== primaryIndex).sort()].map((index) => {
    const age = ages[index];
    return {
      ageGroup: age.key,
      durationMin: Math.max(6, duration + age.duration),
      playerMin: Math.max(4, Math.min(age.players[0], players[0] + index)),
      playerMax: Math.max(age.players[0], Math.min(age.players[1], players[1] + index * 2)),
      areaLengthM: Math.max(15, area[0] + (index - primaryIndex) * 6),
      areaWidthM: Math.max(12, area[1] + (index - primaryIndex) * 4),
      rules: [
        `${age.label} seviyesinde karar süresini oyuncuların başarısına göre ayarla.`,
        `Her tekrarın ${objective.toLocaleLowerCase("tr-TR")} amacıyla bağlantısını açıkla.`,
      ],
      coachingPoints: [
        "Oyuncunun çevre kontrolünü aksiyondan önce yapmasını iste.",
        "Tempo yükselirken teknik kalitenin korunmasını gözle.",
      ],
    };
  });
}

const items = [];
for (const [ageIndex, age] of ages.entries()) {
  for (const [exerciseIndex, exercise] of exercises.entries()) {
    const [category, objectiveKey, baseTitle, objectiveLabel] = exercise;
    const ordinal = String(exerciseIndex + 1).padStart(2, "0");
    const id = `ngcs-starter-v1-${age.key.toLowerCase()}-${ordinal}`;
    const duration = phaseDurations[category] + Math.max(0, age.duration);
    const players = age.players;
    const area = age.area;
    const content = {
      drillId: id,
      title: `${age.label} · ${baseTitle} — ${age.format}`,
      summary: `${age.label} oyuncuları için ${objectiveLabel.toLocaleLowerCase("tr-TR")} odağında ${age.method} yöntemiyle karar verme ve uygulama kalitesini birlikte geliştiren özgün saha çalışması.`,
      category,
      difficulty: age.difficulty,
      objectiveKey,
      objectiveLabel,
      themes: [...phaseThemes[category], objectiveKey.replaceAll("-", " ")],
      durationMin: duration,
      playerMin: players[0],
      playerMax: players[1],
      areaLengthM: area[0],
      areaWidthM: area[1],
      equipmentItems: category === "COOL_DOWN" ? ["top", "koni"] : ["top", "koni", "yelek"],
      organization: `${area[0]}x${area[1]} metrelik alanı konilerle belirle. ${players[0]}-${players[1]} oyuncuyu ${age.method} düzenine uygun gruplara ayır; tekrar ve dinlenme sürelerini önceden açıkla.`,
      steps: [
        "Oyunculara alanı, yönü ve çalışmanın başarı ölçütünü göster.",
        `${objectiveLabel} ilkesini ${age.format.toLocaleLowerCase("tr-TR")} formatında tanıt.`,
        "Başarı yükseldikçe karar süresini kısalt ve oyunsal baskıyı artır.",
        "Son bölümde oyunculardan çözümü serbest oyun içinde tekrar etmelerini iste.",
      ],
      coachingPoints: [
        "Aksiyondan önce çevre kontrolü ve açık vücut açısını gözle.",
        "Teknik uygulamanın hızdan önce doğru ve kontrollü olmasını iste.",
        "Oyuncular arası mesafe ile pas veya koşu zamanlamasını birlikte değerlendir.",
      ],
      progressions: [
        "Temas sayısını azalt veya karar süresini kısalt.",
        "Yönlü hedef ve aktif savunmacı ekleyerek oyuna benzerliği artır.",
      ],
      regressions: [
        "Alanı büyüt, baskıyı azalt ve serbest temasla yeniden başlat.",
        "Görevi daha küçük gruplarda kısa tekrarlarla uygula.",
      ],
      constraints: category === "TACTICAL" ? ["Her top kazanımından sonra ilk bakış ileri alana yapılır."] : [],
      safetyNotes:
        "Alan, ekipman ve oyuncu yoğunluğunu saha koşullarına göre antrenör kontrol etmelidir; klinik değerlendirme içermez.",
      boardDocument: board(exerciseIndex, ageIndex),
      source: {
        kind: "NGCS_ORIGINAL",
        title: "NGCS Özgün Başlangıç Paketi v1",
        license: "NGCS_PROPRIETARY",
        contentHash: "",
      },
      ageVariants: variants(ageIndex, duration, players, area, objectiveLabel),
    };
    const hashPayload = JSON.stringify({ ...content, source: { ...content.source, contentHash: undefined } });
    content.source.contentHash = createHash("sha256").update(hashPayload).digest("hex");
    items.push(content);
  }
}

const manifest = {
  schemaVersion: 1,
  packId: "ngcs-starter-v1",
  locale: "tr-TR",
  publicationStatus: "DRAFT",
  reviewer: "TBD",
  sourcePolicy: "NGCS_ORIGINAL_OR_VERIFIED_CC0_CC_BY_4_0",
  count: items.length,
  items,
};

if (process.argv.includes("--write")) {
  const target = resolve("content/drills/ngcs-starter-v1.json");
  await writeFile(target, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  process.stdout.write(`Wrote ${items.length} draft exercises to ${target}\n`);
} else {
  if (items.length !== 120) throw new Error(`Expected 120 items, received ${items.length}`);
  process.stdout.write(`Validated ${items.length} generated draft exercises\n`);
}
