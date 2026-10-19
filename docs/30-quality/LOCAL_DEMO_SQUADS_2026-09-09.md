# Local demo squads verification — 2026-09-09

## Result

**Passed.** `NGCS Browser E2E Kulübü` ve `2026–27 Test Sezonu` yerel bağlamında
A Takım ile U12, U14, U16 ve U18 altyapı takımları bulunur. Her takımın 18 aktif
oyuncu ataması ve bir `TeamSeason` bağlantısı vardır.

## Data operation

- Mevcut `E2E U17 Takımı`, aynı takım/grup/sezon kimliği ve iki mevcut oyuncusu
  korunarak `U18 Takımı` adına ve `U18` etiketine getirildi.
- A Takım, U12, U14 ve U16 yerel takımları oluşturuldu.
- U18'deki iki mevcut oyuncu korunarak 16; diğer dört takım için 18'er olmak üzere
  toplam 88 sentetik `Person` + `PlayerProfile` kaydı oluşturuldu.
- Beş kadrodaki görünen adlar 90 benzersiz, deterministik sentetik Türkçe adla
  güncellendi. Her çalıştırmada değişen rastgelelik kullanılmaz. Doğum tarihi,
  e-posta, parola veya yeni kullanıcı hesabı üretilmedi.
- Hesap bağlantısı olan iki mevcut U18 oyuncusunun `Person.displayName` ve
  `User.name` alanları aynı transaction içinde eşitlendi; e-posta, parola, rol ve
  oturum alanlarına dokunulmadı.
- Pozisyon dağılımı yeni 18 kişilik kadrolarda 2 kaleci, 6 defans, 6 orta saha ve
  4 forvettir. U18'in iki mevcut oyuncusunun bilinmeyen pozisyonu tahmin edilmedi.
- Atamalar `PRIMARY_REGISTERED`, seçili `TeamSeason`, sezon başlangıcı ve
  `LOCAL_DEMO_ROSTER_2026_09_09` kaynak etiketiyle kaydedildi. Team ve assignment
  audit olayları yazıldı.

## Safety and repeatability

- [`populate-local-squads.js`](../../apps/backend/scripts/populate-local-squads.js)
  yalnız adı `local`, `demo`, `test` veya `e2e` içeren PostgreSQL hedefinde ve
  `NGCS_ALLOW_LOCAL_ROSTER_WRITE=true` açık onayıyla yazabilir. Kulüp ve sezon tam
  adla tekil çözümlenmeden işlem başlamaz.
- Bütün takım/sezon/kadro yazımları Serializable transaction içindedir. Herhangi
  bir hata bütün operasyonu geri alır.
- İkinci çalıştırmada beş takım için `createdTeam=false`, `previousPlayers=18`,
  `createdPlayers=0`, `renamedPlayers=0` sonucu alındı; yinelenen takım, kişi,
  atama veya değişken isim oluşmadı.
- Son sorgu bir aktif A Takım, dört aktif altyapı takımı ve her birinde 18 aktif
  oyuncu doğruladı. 88 sentetik kişinin hiçbirinde `User` hesabı yoktur.
- Production, seed/reset, silme, arşivleme, commit veya push yapılmadı.

## Application cutover

`/app/squad`, hesap gerektiren legacy `GroupMember` listesinden mevcut canonical
`/sporting/teams/:teamId/roster/page` okumasına geçirildi. Böylece ADR-0022'nin
hesapsız sportif kişi modeli Kadro ekranında da görünür; rol, tenant, tarih,
TeamSeason, cursor, retry ve stale-response sınırları korunur.

## Verification

- Kök `npm run quality` kapısı geçti: backend 52 suite/706 test, frontend 42
  dosya/279 test ve Sites 4/4. Typecheck, lint, format, iki production build,
  121 yerel Markdown bağlantısı, CDSK validator ve Git whitespace kontrolü de
  geçti.
- Authenticated Chrome QA, `/app/teams?view=first-team` içinde tek A Takım
  kartını ve `/app/teams?view=academy` içinde U12/U14/U16/U18 olmak üzere dört
  altyapı kartını doğruladı.
- `/app/squad` U12 kapsamıyla açıldığında canonical roster toplamı ve görünür
  oyuncu sayısı `18 / 18` oldu; hesapsız sentetik sportif kişiler hata olmadan
  görüntülendi. Browser QA sırasında sportif veri mutation'ı yapılmadı.
- Son veri sorgusu 90 oyuncu için 90 benzersiz görünen ad, sıfır `Demo`/`E2E`
  placeholder ve sıfır hesap/Person ad uyumsuzluğu doğruladı.
- Authenticated Chrome; sidebar'daki ayrı A Takım/Altyapı bağlantılarını,
  sekmesiz iki canonical sayfayı, `/app/teams?view=academy` compatibility
  redirect'ini, dört altyapı kartını ve U12 kadrosundaki doğal görünümlü 18 adı
  doğruladı.
