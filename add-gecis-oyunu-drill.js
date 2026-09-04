const { PrismaClient } = require('./apps/backend/node_modules/@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ngcs'
    }
  }
});

async function addDrill() {
  try {
    console.log('📥 Adding drill from image...\n');

    const drillData = {
      title: "Geçiş Oyunu - 3'e Karşı 3'lük",
      category: "TECHNICAL",
      ageGroup: "U12", // U08 - U15 arası, U12 seçtim
      difficulty: "MEDIUM",
      durationMin: 20,
      equipment: "Toplar, Koniler",
      jsonData: {
        trainingSet: "Son",
        techniques: "Geçiş",
        tactics: "Oyuncu davranışı, Oyun zekasının gelişimi",
        coordination: "Hızlı işlem",
        organization: `• 15 x 25 metrelik bir alan oluşturmak için konileri işaretleyin
• Kale çizgilerine 3 küçük hedef koyun
• Oyuncular her biri 3 oyuncudan oluşan 4 takıma ayrım ve onları sahaya yerleştirin
• 2 takım birbirine karşı oynuyor`,
        process: `İşlem:
• Küçük hedeflerde 3'e karşı 3'lük 2 set
• Tüm takmlar, karşı tarafakı küçük gollerden herhangi birinde geçerli goller atabilir
• Yalnızca belirli bir çifteki oyuncular birbirleriyle yarşabilir
• Bu oyuncular diğer çiftin top taşıyıcılarını engelleyememelidir`,
        variations: `Varyasyonlar:
• Sonlara doğru küçük hedefler belirleyin
• Oyunun her iki ucuna da küçük hedefler koyun ve böylece iki oyunun farklı yönlerde ilerlemesine izin verin
• Oyun alanını genişletin
• En fazla 3 dokunuşla oynayın`,
        tips: `İpuçları ve Düzeltmeler:
• Her iki oyun da aynı sahada aynı hedeflere doğru oynanır
• Oyuncular hücumda sadece tek bir hedefe odaklanmamalı, aynı zamanda boş alanları hızla tespit etmeli ve oyunu yönlendirmelidir.
• Kaos Oyunu, sınırlı bir alanda eğlenceli ve yaratıcı çözümler bulmanıza yardımcı olur`,
        playerCount: "12 oyuncu",
        trainingArea: "Grup eğitimi, Takım eğitimi",
        location: "Saha",
        comments: "Orta seviye",
        rating: "1.0 / 5 Yıldız (Yorumlar: 1)",
        visibility: "egzersiz herkes için görünür: herkes"
      }
    };

    const drill = await prisma.drill.create({
      data: drillData
    });

    console.log('✅ Drill created successfully!');
    console.log('\n📊 Drill Details:');
    console.log(`   ID: ${drill.id}`);
    console.log(`   Title: ${drill.title}`);
    console.log(`   Category: ${drill.category}`);
    console.log(`   Age Group: ${drill.ageGroup}`);
    console.log(`   Duration: ${drill.durationMin} minutes`);
    console.log(`   Difficulty: ${drill.difficulty}`);

  } catch (error) {
    console.error('❌ Error creating drill:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addDrill();
