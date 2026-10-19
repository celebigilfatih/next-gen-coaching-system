# Professional Drill Library Verification — 2026-09-09

## Verdict

**Foundation pass; publication gate open.** Sürümlü veri/API/UI temeli ve 120
özgün Türkçe `DRAFT` manifest doğrulandı. Adlandırılmış futbol uzmanı `TBD`
olduğu için hiçbir yeni kayıt doğrulanmış veya yayınlanmış içerik olarak kabul
edilmez. Additive migration ve kullanıcı tarafından ayrıca onaylanan 120 kayıtlık
`DRAFT` paket retained local veritabanına uygulandı; production değiştirilmedi.

## Implemented evidence

- `DrillVersion`, `DrillAgeVariant` ve `DrillSource`; immutable yayın sürümü,
  kaynak checksum'u ve tek-published-sürüm DB indeksi.
- `DRAFT → IN_REVIEW → APPROVED → PUBLISHED → ARCHIVED`; capability kontrolü,
  self-review reddi ve SystemAdmin-only publish/archive.
- Geriye uyumlu yayınlanmış katalog; q/yaş/amaç/faz/zorluk/süre/oyuncu/ekipman/
  kaynak/scope filtreleri, sürümlü cursor ve sunucu taraflı yaş varyantı.
- `/app/library`, `/app/library/:drillId` ve `/app/library/manage`; provenance,
  profesyonel içerik, read-only tahta ve mobil filtre Sheet'i.
- `content/drills/ngcs-starter-v1.json`: yaş başına 24 ana egzersiz ve en az
  4 ısınma / 8 teknik / 8 taktik / 4 soğuma; kayıt bazlı SHA-256 ve geçerli,
  boş olmayan TacticalBoardDocumentV1.

## Database and importer verification

Disposable PostgreSQL 16 üzerinde:

1. 11 migration temiz veritabanına başarıyla deploy edildi; status güncel ve
   Prisma schema diff boştu.
2. İkinci disposable veritabanında migration öncesi eklenen beş sentetik legacy
   drill sonrasında `5 Drill / 5 PUBLISHED DrillVersion / 5 DrillAgeVariant /
   1 LEGACY_UNVERIFIED source` olarak korundu.
3. Manifest dry-run `120` kaydı doğruladı.
4. İlk apply `Imported 120 drafts; skipped 0`, ikinci apply
   `Imported 0 drafts; skipped 120` verdi.

İlk deneme PostgreSQL `55P04 unsafe enum use` hatasını yakaladı. Enum eklemeleri
ayrı `20260909001500` migration'ına ayrıldı; temiz yeniden koşu geçti.

## Automated tests

- Focused backend drill suites: 4 suite / 51 test passed.
- Focused frontend library/tactics suites: 2 file / 8 test passed.
- Backend/frontend typecheck and 120-item content validator passed.
- Tam root quality: 55 backend suite / 725 test, 44 frontend dosyası / 286 test,
  iki production build ve 4/4 Sites testi geçti. 129 Markdown dosyasında kırık
  bağlantı yok; CDSK, lint, typecheck, format ve whitespace kapıları geçti.

## Retained local rollout

İki additive migration `ngcs_local_session_dev` üzerine deploy edildi. Kullanıcının
ayrı açık onayından sonra 120 kayıtlık paket yalnız `DRAFT` durumunda aktarıldı.
İlk apply `Imported 120 drafts; skipped 0`, idempotency tekrarı `Imported 0 drafts;
skipped 120` verdi. Veritabanı postcondition'ları `120 DRAFT`, `5 PUBLISHED`,
`120 NGCS_ORIGINAL source` ve `120 DRILL_CONTENT_DRAFT_CREATED audit event` olarak
doğrulandı. Böylece mevcut beş legacy-unverified yayın korunurken hiçbir yeni
egzersiz yayınlanmadı.

## Open gates

- Adlandırılmış futbol uzmanı ve owner: `TBD`.
- Üç 40 kayıtlık sportif inceleme dalgası: not started.
- Retained local DB 120-item import: complete; drafts remain unpublished.
- Publish: blocked by expert approval by design.
- 1672×941, 1024×900 ve 390×844 authenticated browser evidence: `TBD`.
- Production/provider/ücretli lisans ortaklığı: `TBD`.

## Console and review-boundary follow-up

Retained import sonrasında SystemAdmin yazarlı iki taslak incelemeye gönderildi.
Aynı hesapla approve denemeleri ADR-0034 gereği iki `403` üretti; veritabanında
aktif `DRILL_CONTENT_REVIEW` capability'sine sahip bağımsız bir hesap bulunmadığı
salt okunur sorguyla doğrulandı. Yetki sınırı değiştirilmedi. Yönetim kartı artık
yazarın kendi içeriğinde approve/reject kontrollerini API isteğinden önce pasif
tutar ve bağımsız futbol uzmanı gereksinimini açıklar.

React Router root `HydrateFallback` ve NGCS favicon eklendi. Hedefli frontend
regresyonu 2 dosya / 9 test, typecheck ve lint geçti. Temiz Playwright login
yüklemesinde console `0 warning / 0 error`; `/favicon.svg` isteği `200` döndü.
React DevTools satırı yalnız development bilgilendirmesidir.
