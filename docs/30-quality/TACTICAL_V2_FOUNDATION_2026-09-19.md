# BL-058a — V2 validator ve zaman motoru

2026-09-19. ADR-0036 A–D kullanıcı tarafından onaylandı. Bu rapor yalnız
sözleşme/motor dilimini kapsar; V2 HTTP yazımı veya çalışan animasyon UI'sı değildir.

## Teslim

- Bağımlılıksız V1/V2 core: strict root/scene/element alanları, canonical pitch,
  tekil scene id, sahneler arası id/type tutarlılığı ve title normalizasyonu.
- 12 sahne, sahne başına 250 eleman/100.000 byte; toplam 1.500 örnek,
  500.000 UTF-8 byte ve 120.000 ms sınırları. Kesirli/non-finite süre reddi,
  cut/linear kuralı ve pozitif son hold kontrolü.
- `createTacticalPlayback` doğrulayıp özel kopyayı bir kez hazırlar;
  `frameAt` mutlak zamanda bağımsız V1 render karesi döndürür. Yalnız ortak
  player/goalkeeper/ball x/y hareketi interpolate edilir. Diğer alanlar ve
  görünürlük hedef sınırında değişir. Kaynak ve çıktı arasında mutable alias yok.
- Backend opt-in wrapper genel 400 hatası döndürür; body/isim/cause yansıtmaz.
  Mevcut controller/service ve V1 validator'ları değiştirilmedi, yeni core'a
  bağlanmadı. Eski uçlar V2 kabul etmez. UI/API/DB/migration/dependency değişmedi.

## Dosyalar ve parite

- [Backend core](../../apps/backend/src/tactics/tactical-document-core.ts),
  [backend boundary](../../apps/backend/src/tactics/tactical-document.ts),
  [backend testleri](../../apps/backend/src/tactics/tactical-document.spec.ts).
- [Frontend core](../../apps/frontend/src/lib/tactical-document-core.ts),
  [frontend testleri](../../apps/frontend/src/lib/tactical-document.test.ts).
- [Ortak sentetik fixture](../../content/tactical-contract/fixtures.json).

Monorepo paket/build topolojisi değiştirilmedi. Core iki app sınırında bulunur;
TypeScript ile aynı ayarlarla derlenen kaynakların eşitliği testi ve ortak
fixture'lar drift'i yakalar. Gelecek değişiklikte iki kopya birlikte güncellenir.
Eski frontend V1 validator'ının bütün strict kuralları aynı olduğu iddia edilmez;
yeni core backend V1 sözleşmesinin strict alan kurallarını taşır.

## Doğrulama

- Hedefli backend 63/63, frontend 63/63: 36 hatalı ortak JSON örneği; null,
  non-finite/cyclic, n/n+1 scene/element/byte/duration, UTF-8, kimlik/tür,
  title input immutability ve V1-only eski boundary.
- Motor testleri: başlangıç/hold/transition ortası/hedef/son, zero-hold/cut,
  nesne giriş/çıkışı ve görünüm değişimi, rastgele seek sırası, alias koruması,
  0,5×/1×/2× mutlak medya zamanını 30/60 Hz örnekleme. Bu saf saat testidir;
  gerçek browser FPS veya pause/speed UI testi değildir.
- `npm run content:drills:validate`: 120 taslak geçerli. Komut apply olmadan
  Prisma bağlantısı açmadan çıkar; retained veri/import/yayın değişmedi.
- `npm run quality` geçti: 788 backend testi (56 suite), 369 frontend testi
  (48 dosya), 4 Sites testi; typecheck, lint, format, build, CDSK, Markdown
  bağlantıları ve whitespace kapıları başarılı. BL-058b–e kabulü değildir.

## Kalan kapılar

BL-058b: token/CAS ve downgrade guard dahil tüm yazım yolları, HTTP payload
sınırı ve tenant/source testleri. BL-058c–e: sahne UI'sı, requestAnimationFrame
oynatıcı adaptörü, dirty/export/snapshot entegrasyonu, disposable E2E ve görsel
QA. V2 write flag henüz eklenmedi veya açılmadı. Production, retained conversion,
global editorial V2, MP4/GIF, Person bağı, offline ve 3D teslim edilmedi.
