import { PrismaClient, Position, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const clubId = "cmkdscp8b000iqd019z2soilh";
  const groupId = "cmkdt1c9e00026og4p5gpc64s";
  const passwordHash = await bcrypt.hash("spor123", 10);

  const players = [
    // Kaleciler
    { name: "Altay Bayındır", email: "altay@ngcs.com", position: "KALECI" },
    { name: "Uğurcan Çakır", email: "ugurcan@ngcs.com", position: "KALECI" },
    { name: "Mert Günok", email: "mert@ngcs.com", position: "KALECI" },
    
    // Defans
    { name: "Merih Demiral", email: "merih@ngcs.com", position: "DEFANS" },
    { name: "Çağlar Söyüncü", email: "caglar@ngcs.com", position: "DEFANS" },
    { name: "Abdülkerim Bardakcı", email: "abdulkerim@ngcs.com", position: "DEFANS" },
    { name: "Ferdi Kadıoğlu", email: "ferdi@ngcs.com", position: "DEFANS" },
    { name: "Zeki Çelik", email: "zeki@ngcs.com", position: "DEFANS" },
    { name: "Samet Akaydin", email: "samet@ngcs.com", position: "DEFANS" },
    { name: "Eren Elmalı", email: "eren@ngcs.com", position: "DEFANS" },
    
    // Orta Saha
    { name: "Hakan Çalhanoğlu", email: "hakan@ngcs.com", position: "ORTA_SAHA" },
    { name: "Orkun Kökçü", email: "orkun@ngcs.com", position: "ORTA_SAHA" },
    { name: "Salih Özcan", email: "salih@ngcs.com", position: "ORTA_SAHA" },
    { name: "İsmail Yüksek", email: "ismail@ngcs.com", position: "ORTA_SAHA" },
    { name: "Arda Güler", email: "arda@ngcs.com", position: "ORTA_SAHA" },
    { name: "İrfan Can Kahveci", email: "irfan@ngcs.com", position: "ORTA_SAHA" },
    { name: "Kerem Aktürkoğlu", email: "kerem@ngcs.com", position: "ORTA_SAHA" },
    { name: "Barış Alper Yılmaz", email: "baris@ngcs.com", position: "ORTA_SAHA" },
    
    // Forvet
    { name: "Cenk Tosun", email: "cenk@ngcs.com", position: "FORVET" },
    { name: "Kenan Yıldız", email: "kenan@ngcs.com", position: "FORVET" },
    { name: "Semih Kılıçsoy", email: "semih@ngcs.com", position: "FORVET" },
    { name: "Bertuğ Yıldırım", email: "bertug@ngcs.com", position: "FORVET" },
  ];

  console.log(`Creating ${players.length} players for A Takım...`);

  for (const p of players) {
    try {
      // Create user
      const user = await prisma.user.create({
        data: {
          name: p.name,
          email: p.email,
          passwordHash,
          role: "PLAYER",
          position: p.position as Position,
          clubId: clubId,
        }
      });

      // Add to A Takım group
      await prisma.groupMember.create({
        data: {
          groupId: groupId,
          userId: user.id
        }
      });

      console.log(`✅ Added: ${p.name} (${p.position})`);
    } catch (e) {
      console.error(`❌ Error adding ${p.name}:`, e.message);
    }
  }

  console.log("Done!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
