# ADR-0019: Attendance tekilliği ve atomik upsert

- **Status:** Accepted
- **Date:** 2026-09-06
- **Owners / approvers:** Explicit user approval on 2026-09-06; named data/product owner TBD
- **Supersedes / superseded by:** N/A — ADR-0006 migration sürecini ve ADR-0007 yetki sınırını uygular
- **Related:** REQ-003, REQ-005, CR-014, BL-036, F-013

## Context

Karar öncesinde `AttendanceService.mark` aynı `(planId, playerId)` çifti için önce
`findFirst`, sonra ayrı bir update veya create çağrısı çalıştırıyordu. Prisma
`Attendance` modeli bu çift için birleşik unique constraint taşımıyordu. İki
eşzamanlı ilk işaretleme bu nedenle iki kayıt oluşturabilir ve yoklama görünümünü
belirsiz hale getirebilirdi.

Modelde `createdAt` vardır; ancak kayıtların hangisinin iş bakımından doğru olduğu
ve aynı timestamp durumunda nasıl seçileceği tanımlı değildir. Bu nedenle mevcut
duplicate kayıtları otomatik silmek veya birini sessizce seçmek kanıtlanmış bir
temizleme politikası değildir. Korunan `ngcs_local_session_dev` üzerinde 2026-09-06
tarihli salt-okunur envanter 0 attendance kaydı, 0 duplicate çift ve 0 fazla satır
göstermiştir; DB değiştirilmemiştir. Başka retained/production ortam bulunup
bulunmadığı ve data-owner kimliği `TBD`dir.

## Decision — Option 1

- Prisma modeline `(planId, playerId)` birleşik unique constraint'i eklensin.
- Additive migration, constraint'i oluşturmadan önce duplicate çift araması yapsın.
  Duplicate varsa açık hata ile dursun; hiçbir attendance kaydını silmesin veya
  değiştirmesin. İlgili veri data/product owner tarafından ayrı ve izlenebilir bir
  işlemle uzlaştırılmadan migration yeniden çalıştırılmasın.
- `mark`, birleşik unique anahtarı kullanan tek bir Prisma `upsert` işlemi olsun.
  Controller DTO'su, authentication, plan/oyuncu authorization'ı, response şekli,
  Socket davranışı ve `PRESENT | ABSENT` sözleşmesi değişmesin.
- Eşzamanlı geçerli yazımlarda DB'de yalnız bir kayıt kalsın. Son kalıcı durum,
  PostgreSQL'de en son commit edilen başarılı yazımın status'u olsun. Her istek
  kendi tamamlanan yazım sonucunu döndürebilir; istemciler ortak son durumu liste
  okumasıyla görür.
- Beklenmeyen persistence hataları mevcut cause-free generic 500 ve yalnız
  `ATTENDANCE_MARK_FAILED` sabit olay sınırında kalsın. Constraint veya upsert
  Prisma metadata'sı istemciye ya da loga taşınmasın.

## Alternatives

1. **Option 1 — fail-fast migration + unique constraint + atomic upsert
   (recommended):** Veri silmez, DB invariant'ı sağlar ve yarış penceresini kapatır.
2. **Option 2 — migration içinde otomatik duplicate temizliği:** Rejected for now.
   Hangi status'un doğru olduğunu belirleyen onaylı iş kuralı yoktur; `createdAt`
   tek başına kullanıcı niyetini kanıtlamaz.
3. **Option 3 — yalnız uygulama kilidi veya serializable transaction:** Rejected.
   Bütün yazım yollarını ve gelecekteki istemcileri DB seviyesinde korumaz.
4. **Option 4 — mevcut davranışı koru:** Rejected. F-013 veri doğruluğu riski açık
   kalır.

## Migration, Rollout and Rollback

Onaydan sonra yeni migration önce iki ayrı disposable PostgreSQL 16 hedefinde
kanıtlanır: temiz migration zinciri başarıyla tamamlanmalı; duplicate fixture
taşıyan eski-şema hedefinde migration açıkça başarısız olmalı ve bütün satırlar
değişmeden kalmalıdır. Korunan yerel DB'de önce salt-okunur duplicate envanteri
alınır; sonuç sıfır değilse uygulama durur ve temizleme kararı yeniden onaya gelir.

Rollout sırası migration, ardından aynı revision backend'dir. Eski servis unique
constraint altında yarışta hata üretebileceğinden iki adım arasındaki pencere kısa
tutulur. Uygulama rollback'inde constraint korunur; eski backend yalnız acil ve
kısa süreli geri dönüş için kullanılabilir. Constraint'i kaldırmak yalnız verisiz
ephemeral ortamda kabul edilir. Retained ortam için destructive rollback, backup,
owner ve açık yeni onay olmadan uygulanmaz.

## Verification

- 2026-09-06 retained-DB preflight envanteri 0 attendance/0 duplicate gösterdi.
  Ayrı açık kullanıcı onayından sonra additive migration reset/temizlik yapmadan
  `ngcs_local_session_dev` üzerine uygulandı; status güncel, attendance sayısı 0 ve
  unique index sayısı 1 olarak doğrulandı.
- Üç attendance unit suite'inde 24/24 test; birleşik anahtarlı upsert, DTO/yetki
  sırası ve cause-free hata sınırı geçti.
- Disposable PostgreSQL 16 clean deploy, repeat deploy/status ve empty schema diff
  dört migration ile geçti.
- Duplicate fixture hedefinde migration beklenen PostgreSQL `23505` / Prisma
  `P3018` ile durdu; iki farklı status taşıyan iki satır korundu ve unique index
  oluşturulmadı.
- Aynı plan/oyuncu için eşzamanlı iki ilk HTTP mark sonunda tek kayıt kaldı; sonraki
  açık status yazımı kazandı. Backend E2E toplam 26/26 geçti.
- Root quality 32 backend suite/368 test, 6 frontend dosyası/21 test, iki build,
  lint/typecheck/format, Sites 4/4, Markdown, CDSK ve diff kapılarıyla geçti. İlk
  sandbox çalışması yalnız frontend prerender localhost `EPERM` nedeniyle durdu;
  aynı kapı izinli ortamda değişikliksiz geçti.

## Approval Record

Kullanıcı 2026-09-06 tarihinde Option 1'i açıkça onayladı. Production veya başka
retained ortam tespit edilirse migration öncesi aynı salt-okunur duplicate
envanteri ve ADR-0006 operasyon kapıları yeniden uygulanır.
