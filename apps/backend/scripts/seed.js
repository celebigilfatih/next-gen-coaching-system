const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  try {
    // Create the single club
    let club = await prisma.club.findFirst();
    if (!club) {
      club = await prisma.club.create({
        data: {
          name: 'NGCS Futbol Akademisi',
          description: 'Futbol takım yönetim sistemi',
        },
      });
      console.log('✅ Club created:', club.name);
    } else {
      console.log('✅ Club already exists:', club.name);
    }

    // Check and create A Takım automatically
    const existingATeam = await prisma.playerGroup.findFirst({
      where: { clubId: club.id, category: 'A_TAKIM' },
    });

    if (!existingATeam) {
      await prisma.playerGroup.create({
        data: {
          name: 'A Takım',
          ageGroup: 'SENIOR',
          category: 'A_TAKIM',
          clubId: club.id,
        },
      });

      console.log('✅ Created A Takım');
    } else {
      console.log(`✅ A Takım already exists: ${existingATeam.name}`);
    }

    // Seed drills
    const drillsExist = await prisma.drill.count();
    if (drillsExist === 0) {
      console.log('🏃 Creating drills...');

      const drills = [
        // WARM-UP DRILLS
        {
          title: 'Dinamik Germe',
          category: 'WARM_UP',
          ageGroup: 'SENIOR',
          durationMin: 10,
          difficulty: 'EASY',
          equipment: 'Yok',
          jsonData: {
            description: 'Vücudu ısıtmak için dinamik germe hareketleri',
            steps: [
              'Ayakta bacak salınımı - 10 tekrar',
              'Kol çevirme - 10 tekrar',
              'Bacak açma ve kapatma - 10 tekrar',
              'Yürüyerek dizleri göğse çekme - 20m',
              'Yürüyerek topuk kalça - 20m',
            ],
          },
        },
        {
          title: 'Hafif Koşu',
          category: 'WARM_UP',
          ageGroup: 'SENIOR',
          durationMin: 8,
          difficulty: 'EASY',
          equipment: 'Yok',
          jsonData: {
            description: 'Kalp atışını artırmak için hafif tempolu koşu',
            steps: [
              'Saha çevresinde hafif koşu - 2 tur',
              'Tempo kademeli artar',
              'Son turda orta tempoda koşu',
            ],
          },
        },
        {
          title: 'Aktivasyon Oyunu - Rondo',
          category: 'WARM_UP',
          ageGroup: 'SENIOR',
          durationMin: 12,
          difficulty: 'MEDIUM',
          equipment: 'Top, Koniler',
          jsonData: {
            description: '6v2 rondo oyunu ile ısınma',
            setup: {
              area: '15x15m kare alan',
              players: '8 oyuncu (6 dışarıda, 2 ortada)',
            },
            steps: [
              '6 oyuncu dışarıda, 2 oyuncu ortada',
              'Dışarıdakiler 2 dokunuşla pas',
              '5 pas = 1 puan',
              'Ortadakiler top çalarsa yer değişir',
            ],
          },
        },
        {
          title: 'Koordinasyon Merdiveni',
          category: 'WARM_UP',
          ageGroup: 'SENIOR',
          durationMin: 10,
          difficulty: 'MEDIUM',
          equipment: 'Çeviklik Merdiveni',
          jsonData: {
            description: 'Ayak koordinasyonu ve çeviklik çalışması',
            steps: [
              'Her kareye tek ayak - 2 set',
              'İki ayak içeri-dışarı - 2 set',
              'Yan adımlar - 2 set',
              'Hop scotch - 2 set',
            ],
          },
        },
        {
          title: 'Pas Üçgeni',
          category: 'WARM_UP',
          ageGroup: 'SENIOR',
          durationMin: 10,
          difficulty: 'EASY',
          equipment: 'Top, Koniler',
          jsonData: {
            description: 'Üçgen formasyonda pas çalışması',
            setup: {
              area: '10x10m üçgen',
              players: '3 oyuncu',
            },
            steps: [
              'Pas yaptıktan sonra koşarak sıradaki koniye git',
              'Hem saat yönünde hem ters yönde',
              'Tek dokunuş, sonra iki dokunuş',
              '2 dakika her yönde',
            ],
          },
        },
        {
          title: 'Dinamik Koşu Drilleri',
          category: 'WARM_UP',
          ageGroup: 'SENIOR',
          durationMin: 12,
          difficulty: 'MEDIUM',
          equipment: 'Koniler',
          jsonData: {
            description: 'Farklı koşu teknikleri ile ısınma',
            steps: [
              'Yüksek dizler - 20m x 2',
              'Topuk kalça - 20m x 2',
              'Yan koşu (her iki yöne) - 20m x 2',
              'Geri koşu - 20m x 2',
              'Sprint - 20m x 2',
            ],
          },
        },

        // TECHNICAL DRILLS
        {
          title: 'Pas Kareleri 4v1',
          category: 'TECHNICAL',
          ageGroup: 'SENIOR',
          durationMin: 15,
          difficulty: 'MEDIUM',
          equipment: 'Top, Koniler',
          jsonData: {
            description: 'Dar alanda pas kalitesi ve top kontrolü geliştirme',
            setup: {
              area: '10x10m kare',
              players: '5 oyuncu (4 dışarıda, 1 ortada)',
            },
            steps: [
              '4 oyuncu köşelerde, 1 ortada',
              'Maksimum 2 dokunuş',
              'Ortadaki oyuncu top çalarsa yer değişir',
              '3 dakika rotasyon',
            ],
          },
        },
        {
          title: 'Şut Çalışması',
          category: 'TECHNICAL',
          ageGroup: 'SENIOR',
          durationMin: 20,
          difficulty: 'MEDIUM',
          equipment: 'Top, Kaleci, Koniler',
          jsonData: {
            description: 'Farklı pozisyonlardan şut atma tekniği',
            setup: {
              area: 'Ceza sahası',
              players: '6-8 oyuncu',
            },
            steps: [
              'Ceza sahası dışından şut - 10 tekrar',
              '1-2 pas sonrası şut - 10 tekrar',
              'Yan koridordan orta ve şut - 10 tekrar',
              'Hızlı kombinasyon ve bitiriş',
            ],
          },
        },
        {
          title: 'İlk Dokunuş Drili',
          category: 'TECHNICAL',
          ageGroup: 'SENIOR',
          durationMin: 15,
          difficulty: 'EASY',
          equipment: 'Top, Koniler',
          jsonData: {
            description: 'İlk dokunuşta top kontrolü ve yön değiştirme',
            steps: [
              'İkili grup çalışması',
              '10m mesafeden pas',
              'İlk dokunuşta topu kontrol et',
              'İkinci dokunuşta geri pas',
              'Her 2 dakikada partner değiştir',
            ],
          },
        },
        {
          title: 'Hava Topu Kontrolü',
          category: 'TECHNICAL',
          ageGroup: 'SENIOR',
          durationMin: 12,
          difficulty: 'MEDIUM',
          equipment: 'Top',
          jsonData: {
            description: 'Hava toplarını kontrol etme becerisi',
            steps: [
              'Partner ile hava topu alışverişi',
              'Göğüs ile kontrol',
              'Ayak ile kontrol',
              'Baş ile kontrol ve pas',
              'Vole şut çalışması',
            ],
          },
        },

        // TACTICAL DRILLS
        {
          title: 'Pres Tetikleyicileri',
          category: 'TACTICAL',
          ageGroup: 'SENIOR',
          durationMin: 25,
          difficulty: 'HARD',
          equipment: 'Top, Koniler, Yelekler',
          jsonData: {
            description: 'Takım savunması ve pres uygulaması',
            setup: {
              area: 'Yarı saha',
              players: '11v11',
            },
            steps: [
              'Rakip yavaş pas yaptığında pres başlat',
              'Yan çizgiye sıkıştırma',
              'Orta saha baskısı',
              'Topun kazanılması sonrası hızlı geçiş',
            ],
          },
        },
        {
          title: 'Pozisyon Oyunu 8v8+3',
          category: 'TACTICAL',
          ageGroup: 'SENIOR',
          durationMin: 30,
          difficulty: 'HARD',
          equipment: 'Top, Koniler, Yelekler',
          jsonData: {
            description: 'Dar alanda pozisyon bulma ve pas seçenekleri',
            setup: {
              area: '40x30m alan',
              players: '8v8 + 3 joker',
            },
            steps: [
              '3 joker her zaman topa sahip olan takımda',
              'Maksimum 3 dokunuş',
              '10 pas = 1 puan',
              'Kaleci dahil oyun kurma',
            ],
          },
        },
        {
          title: 'Taktiksel Maç 11v11',
          category: 'TACTICAL',
          ageGroup: 'SENIOR',
          durationMin: 35,
          difficulty: 'HARD',
          equipment: 'Top, 2 Kaleci, Yelekler',
          jsonData: {
            description: 'Gerçek maç formatında taktik uygulaması',
            setup: {
              area: 'Tam saha',
              players: '11v11',
            },
            steps: [
              'Belirlenen dizilişte oyun',
              'Maç içi taktik değişiklikleri',
              '2 x 15 dakika',
              'Antrenör düdüğü ile durma ve analiz',
            ],
          },
        },
        {
          title: 'Geçiş Oyunu',
          category: 'TACTICAL',
          ageGroup: 'SENIOR',
          durationMin: 20,
          difficulty: 'MEDIUM',
          equipment: 'Top, Koniler, Yelekler, 2 Mini Kale',
          jsonData: {
            description: 'Topa sahip olma ve kaybetme anlarında hızlı geçiş',
            setup: {
              area: '40x40m',
              players: '6v6',
            },
            steps: [
              'Top kazanımında 5 saniye içinde şut',
              'Top kaybında hemen savunmaya geçiş',
              'Kontra atak organizasyonu',
              'Mini kalelere gol atma',
            ],
          },
        },

        // COOL DOWN DRILLS
        {
          title: 'Statik Germe',
          category: 'COOL_DOWN',
          ageGroup: 'SENIOR',
          durationMin: 10,
          difficulty: 'EASY',
          equipment: 'Yok',
          jsonData: {
            description: 'Kasları gevşetmek için statik germe egzersizleri',
            steps: [
              'Hamstring germe - 30 saniye her bacak',
              'Quadriceps germe - 30 saniye her bacak',
              'Kalf germe - 30 saniye her bacak',
              'Sırt germe - 30 saniye',
              'Omuz germe - 30 saniye',
            ],
          },
        },
        {
          title: 'Yavaş Koşu ve Germe',
          category: 'COOL_DOWN',
          ageGroup: 'SENIOR',
          durationMin: 8,
          difficulty: 'EASY',
          equipment: 'Yok',
          jsonData: {
            description: 'Tempo düşürme ve esnetme',
            steps: [
              'Yavaş koşu - 3 dakika',
              'Yürüyüş - 2 dakika',
              'Derin nefes egzersizleri',
              'Hafif statik germeler',
            ],
          },
        },
        {
          title: 'Foam Roller',
          category: 'COOL_DOWN',
          ageGroup: 'SENIOR',
          durationMin: 12,
          difficulty: 'EASY',
          equipment: 'Foam Roller',
          jsonData: {
            description: 'Kas iyileştirme ve toparlanma',
            steps: [
              'Hamstring üzerinde rulo - 2 dakika',
              'Quadriceps üzerinde rulo - 2 dakika',
              'IT band üzerinde rulo - 2 dakika',
              'Sırt üzerinde rulo - 2 dakika',
              'Kalf üzerinde rulo - 2 dakika',
            ],
          },
        },
      ];

      for (const drill of drills) {
        await prisma.drill.create({ data: drill });
      }

      console.log(
        `✅ Created ${drills.length} drills (Warm-up, Technical, Tactical, Cool-down)`,
      );
    } else {
      console.log('✅ Drills already exist, skipping');
    }
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
