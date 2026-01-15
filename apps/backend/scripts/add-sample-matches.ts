import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const seasonId = "cmkdvnkaa000oqd01rj8ylu4a";
  
  const matches = [
    {
      date: new Date("2026-01-18T19:00:00Z"),
      opponent: "Fenerbahçe",
      location: "AWAY",
      competition: "Lig",
      notes: "Derbi maçı."
    },
    {
      date: new Date("2026-01-25T16:00:00Z"),
      opponent: "Kasımpaşa",
      location: "HOME",
      competition: "Lig",
      notes: "Kendi sahamızdaki ilk maç."
    },
    {
      date: new Date("2026-02-01T19:00:00Z"),
      opponent: "Beşiktaş",
      location: "HOME",
      competition: "Lig",
      notes: "Kritik hafta."
    },
    {
      date: new Date("2026-02-04T20:30:00Z"),
      opponent: "Antalyaspor",
      location: "AWAY",
      competition: "Kupa",
      notes: "Türkiye Kupası Çeyrek Final."
    },
    {
      date: new Date("2026-02-08T13:30:00Z"),
      opponent: "Göztepe",
      location: "AWAY",
      competition: "Lig",
      notes: "Deplasman yolculuğu."
    },
    {
      date: new Date("2026-02-15T19:00:00Z"),
      opponent: "Galatasaray",
      location: "HOME",
      competition: "Lig",
      notes: "Şampiyonluk yolunda kritik viraj."
    },
    {
      date: new Date("2026-02-22T16:00:00Z"),
      opponent: "Trabzonspor",
      location: "AWAY",
      competition: "Lig",
      notes: "Zorlu Karadeniz deplasmanı."
    },
    {
      date: new Date("2026-03-01T19:00:00Z"),
      opponent: "Başakşehir",
      location: "HOME",
      competition: "Lig",
      notes: "Taktiksel mücadele."
    }
  ];

  console.log(`Adding ${matches.length} random matches to season...`);

  for (const m of matches) {
    try {
      await prisma.match.create({
        data: {
          seasonId,
          date: m.date,
          opponent: m.opponent,
          location: m.location,
          competition: m.competition,
          notes: m.notes
        }
      });
      console.log(`✅ Match Added: ${m.opponent} (${m.competition}) - ${m.date.toLocaleDateString()}`);
    } catch (e) {
      console.error(`❌ Failed to add match vs ${m.opponent}:`, e.message);
    }
  }

  console.log("Done!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
