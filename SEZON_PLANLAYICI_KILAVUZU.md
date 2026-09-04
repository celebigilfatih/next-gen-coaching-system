# Sezon Planlayıcı & A Takım Modülü - Geliştirici Kılavuzu

> **Tarihsel / doğrulanmamış belge — 2026-08-31:** Bu kılavuz güncel repository
> gerçeğinin kaynağı değildir. Güncel şemada bulunmayan Macro/Meso/Micro
> modellerini ve kaynak kodu erişilemeyen frontend'i mevcut gösterir. Güncel
> bağlam için `PROJECT_BOOT.md`, CDSK belgeleri, Prisma şeması, migration'lar ve
> uygulama kodu esas alınmalıdır. Buradaki migration/kurulum komutları ayrıca
> doğrulanıp onaylanmadan çalıştırılmamalıdır.

## 🎯 Genel Bakış

Bu dokümantasyon, NGCS platformuna eklenen **Sezon Planlayıcı** ve **A Takım Performans Merkezi** modüllerinin kurulum, kullanım ve geliştirme süreçlerini açıklamaktadır.

## 📦 Oluşturulan Özellikler

### 1. Sezon Planlayıcı
- ✅ Sezon yönetimi (oluşturma, görüntüleme, güncelleme, silme)
- ✅ Makro Döngü yönetimi (Hazırlık, Sezon, Sezon Sonu)
- ✅ Mezo Döngü yönetimi (haftalık bloklar)
- ✅ Mikro Döngü yönetimi (günlük antrenman planları)
- ✅ Maç haftası analizi

### 2. A Takım Performans Merkezi
- ✅ Performans istatistikleri gösterimi
- ✅ GPS/yük verisi takibi (PlayerLoad)
- ✅ En iyi performans gösteren oyuncular
- ✅ Sakatlık risk analizi

## 🚀 Kurulum Adımları

### Adım 1: Veritabanı Migrasyonu

```bash
# Backend klasörüne gidin
cd apps/backend

# Prisma migrasyonunu çalıştırın
npm run prisma:migrate

# Migration adı sorarsa: "add_season_planner" yazın
# Prisma client'ı oluşturun
npm run prisma:generate
```

### Adım 2: Demo Veri Oluşturma

```bash
# Backend klasöründeyken seed script'ini çalıştırın
npm run prisma:seed:season
```

Bu komut şunları oluşturur:
- 1 demo kulüp
- 1 antrenör kullanıcısı (coach@demo.com / demo123)
- 3 oyuncu kullanıcısı (player1-3@demo.com / demo123)
- 1 sezon (2025/2026 – A Takım)
- 2 makro döngü
- 2 mezo döngü
- 4 mikro döngü (hafta 1-4)
- 21 oyuncu yük kaydı

### Adım 3: Backend Sunucusunu Başlatma

```bash
cd apps/backend
npm run start:dev
```

Sunucu http://localhost:4000 adresinde çalışacaktır.

### Adım 4: Frontend Sunucusunu Başlatma

```bash
cd apps/frontend
npm run dev
```

Frontend http://localhost:3001 adresinde çalışacaktır.

## 🔐 Giriş Bilgileri

Test için aşağıdaki kullanıcıları kullanabilirsiniz:

**Antrenör:**
- Email: coach@demo.com
- Şifre: demo123

**Oyuncular:**
- Email: player1@demo.com (veya player2, player3)
- Şifre: demo123

## 📱 Sayfalar ve Kullanım

### Sezon Planlayıcı Ana Sayfa
**URL:** http://localhost:3001/season-planner

**Özellikler:**
- Tüm sezonları listeler
- Her sezon için makro döngü ve hafta sayısını gösterir
- Detay sayfasına ve makro döngüler sayfasına yönlendirme

### A Takım Performans Merkezi
**URL:** http://localhost:3001/a-team

**Özellikler:**
- Ortalama HSR (High Speed Running) gösterir
- Toplam mesafe istatistikleri
- Aktif oyuncu sayısı
- Sakatlık risk durumu
- En iyi performans gösteren oyuncular listesi

## 🔧 API Endpoint'leri

### Sezon İşlemleri

```typescript
// Yeni sezon oluştur
POST /seasons
Body: {
  name: string,
  clubId: string,
  startDate: string, // ISO 8601 format
  endDate: string
}

// Tüm sezonları listele
GET /seasons?clubId=xxx

// Sezon detayı
GET /seasons/:id

// Sezon güncelle
PATCH /seasons/:id
Body: {
  name?: string,
  startDate?: string,
  endDate?: string
}

// Sezon sil
DELETE /seasons/:id
```

### Makro Döngü İşlemleri

```typescript
// Makro döngü oluştur
POST /seasons/:seasonId/macros
Body: {
  title: string,
  startDate: string,
  endDate: string,
  type: "PRE_SEASON" | "IN_SEASON" | "POST_SEASON",
  intensity?: number, // 1-10 arası
  notes?: string
}

// Makro döngüleri listele
GET /seasons/:seasonId/macros
```

### Mezo Döngü İşlemleri

```typescript
// Mezo döngü oluştur
POST /seasons/:seasonId/meso
Body: {
  macroId: string,
  startWeek: number,
  endWeek: number,
  goal: string,
  intensityJson: {
    physical: number,
    technical: number,
    tactical: number
  }
}
```

### Mikro Döngü İşlemleri

```typescript
// Mikro döngü oluştur
POST /seasons/:seasonId/micro
Body: {
  weekNumber: number,
  dayPlans: Array<{
    day: number,
    drillIds: string[],
    notes: string
  }>
}

// Belirli hafta planını getir
GET /seasons/:seasonId/micro/:weekNumber
```

### Maç Haftası Analizi

```typescript
// Maç analizi oluştur
POST /matchweekanalysis
Body: {
  seasonId: string,
  weekNumber: number,
  opponentName: string,
  opponentAnalysis?: object,
  setPieces?: object,
  videoLinks?: object
}

// Sezon maç analizlerini listele
GET /seasons/:seasonId/matchweeks
```

## 💾 Veritabanı Yapısı

### Season (Sezon)
```typescript
{
  id: string
  name: string
  clubId: string
  userId: string (oluşturan)
  startDate: DateTime
  endDate: DateTime
  macros: MacroCycle[]
  mesos: MesoCycle[]
  micros: MicroCycle[]
  matchWeeks: MatchWeekAnalysis[]
}
```

### MacroCycle (Makro Döngü)
```typescript
{
  id: string
  seasonId: string
  title: string
  startDate: DateTime
  endDate: DateTime
  type: string // PRE_SEASON, IN_SEASON, POST_SEASON
  intensity: number // 1-10
  notes?: string
  mesos: MesoCycle[]
}
```

### MicroCycle (Mikro Döngü)
```typescript
{
  id: string
  seasonId: string
  weekNumber: number
  dayPlans: Json // [{ day: 1-7, drillIds: [], notes: "" }]
}
```

### PlayerLoad (Oyuncu Yükü)
```typescript
{
  id: string
  playerId: string
  date: DateTime
  totalDistance: number
  hsr: number // High Speed Running
  sprintDistance: number
  accelerations: number
  wellness: Json // { sleep: 1-5, fatigue: 1-5, soreness: 1-5, stress: 1-5 }
}
```

## 🎨 Frontend Bileşenler

### useClubStore (Zustand)
Kulüp seçimi için global state yönetimi:

```typescript
import { useClubStore } from "@/stores/clubStore";

function MyComponent() {
  const { selectedClub, setSelectedClub } = useClubStore();
  
  // Kulüp seç
  setSelectedClub({ id: "xxx", name: "Kulüp Adı" });
  
  // Seçili kulübü kullan
  console.log(selectedClub?.name);
}
```

## 🔒 Kimlik Doğrulama

Tüm API istekleri JWT token gerektirir:

```typescript
import { useSession } from "next-auth/react";
import axios from "axios";

function MyComponent() {
  const { data: session } = useSession();
  
  const fetchData = async () => {
    const token = (session as any)?.accessToken;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/seasons`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };
}
```

## 🐛 Sık Karşılaşılan Hatalar

### Hata: "selectedClub is not defined"
**Çözüm:** clubStore'u import edin ve kullanın:
```typescript
import { useClubStore } from "@/stores/clubStore";
const { selectedClub } = useClubStore();
```

### Hata: 403 Forbidden
**Çözüm:** Authorization header'ını ekleyin:
```typescript
const token = (session as any)?.accessToken;
headers: { Authorization: `Bearer ${token}` }
```

### Hata: Prisma modelleri bulunamıyor
**Çözüm:** Prisma client'ı yeniden oluşturun:
```bash
cd apps/backend
npm run prisma:generate
```

### Hata: Migration çalışmıyor
**Çözüm:** Veritabanını sıfırlayın (dikkat: tüm veri silinir):
```bash
cd apps/backend
npx prisma migrate reset
npm run prisma:migrate
npm run prisma:seed:season
```

## 📋 Geliştirme Kontrol Listesi

### Tamamlanan ✅
- [x] Backend API endpoint'leri
- [x] Prisma schema ve migration
- [x] Service ve controller'lar
- [x] DTO'lar ve validasyon
- [x] Seed script
- [x] Frontend routing
- [x] Sidebar menü entegrasyonu
- [x] Ana sayfa listeleme
- [x] A Takım dashboard

### Geliştirilmesi Gerekenler ❌
- [ ] Makro döngü timeline sayfası
- [ ] Mezo döngü detay sayfası
- [ ] Mikro döngü haftalık planlayıcı
- [ ] Drill seçici modal
- [ ] Oyuncu yük detay sayfası
- [ ] Maç analizi editörü
- [ ] Grafik ve chart'lar (recharts)
- [ ] Sezon oluşturma formu
- [ ] Dosya yükleme (video linkler)
- [ ] Unit ve integration testler

## 🎯 Sonraki Adımlar

1. **Eksik Sayfaları Tamamlayın:**
   - Macro timeline görünümü
   - Meso detay sayfası
   - Micro haftalık planlayıcı

2. **Formlar Ekleyin:**
   - Sezon oluşturma dialog'u
   - Makro/Mezo/Micro oluşturma formları

3. **Görselleştirme:**
   - Recharts ile performans grafikleri
   - Timeline bileşenleri
   - Intensity heat map'ler

4. **Entegrasyonlar:**
   - Taktik tahtası ile drill seçimi
   - Video yükleme sistemi
   - Export to PDF özelliği

## 📞 Destek

Sorun yaşarsanız:
1. Browser console'u kontrol edin (F12)
2. Backend terminal loglarını inceleyin
3. `SEASON_PLANNER_REPORT.md` dosyasını okuyun
4. `season-planner-report.json` dosyasında detayları bulun

---

**Oluşturulma Tarihi:** 18 Ocak 2025
**Versiyon:** 1.0
**Durum:** Kısmi Tamamlandı (40%)
