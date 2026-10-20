# ADR-0026: Antrenman planı düzenleme ve atomik kalıcı silme

- **Status:** Accepted
- **Date:** 2026-09-08
- **Owners / approvers:** Kullanıcı 2026-09-08 tarihinde düzenleme ve silme seçeneklerini açıkça onayladı; named product/data owner `TBD`
- **Supersedes / superseded by:** N/A
- **Related:** ADR-0007, ADR-0011, ADR-0014, REQ-017, BL-049, CR-018

## Context

Antrenman kataloğu plan oluşturma ve görüntülemeyi destekliyordu ancak düzenleme
ve silme işlemleri kullanıcı yüzeyinde yoktu. Servisteki doğrudan plan silme,
bağlı `DayPlan`, `Attendance` ve `PlanDrill` satırları nedeniyle güvenilir bir
yaşam döngüsü sözleşmesi oluşturmuyordu. Katalog kartları da iç içe link/eylem
yapısı, sabit kolonlar ve doğrulanmamış tahta etiketi taşıyordu.

## Decision

- Düzenlenebilir alanlar `title`, `date` ve `notes` ile sınırlıdır. Grup/takım,
  kulüp, koç/sahiplik ve `totalDuration` bu formdan gönderilmez. Süre fazların
  doğrulanmış toplamı olarak kalır.
- Bağlı takvim izdüşümü varsa başlık, tarih ve amaç aynı Serializable transaction
  içinde `TrainingPlan` ve `DayPlan` üzerinde güncellenir. Yeni tarih bağlı
  sezonun bir haftasına düşmüyorsa veya bağlı tarih temizlenmek isteniyorsa işlem
  400 ile tamamen reddedilir.
- Silme geri alınamaz. Açık kullanıcı onayından sonra aynı Serializable
  transaction içinde sırasıyla bağlı `DayPlan`, `Attendance`, `PlanDrill`
  (tahta snapshot'ları dahil) ve `TrainingPlan` kaldırılır. Her hata bütün işlemi
  rollback eder ve dışarıya yalnız mevcut cause-free
  `TRAINING_PLAN_DELETE_FAILED` sınırı çıkar.
- Yetki yeni bir rol vermez: `SYSTEM_ADMIN`, aynı kulüpte `CLUB_ADMIN` ve atanmış
  grupta `COACH` mevcut `assertPlanManage` kontrolünü kullanır; `PLAYER` ve çapraz
  tenant/grup reddedilir.
- UI aktif etkileşimlerde pointer, disabled kontrollerde not-allowed imleci;
  erişilebilir odak dönüşü, hata halinde açık kalan Dialog ve iyimser olmayan
  silme davranışı kullanır.

## Consequences

Kalıcı silme arşiv değildir ve geri alma sağlamaz. Takvim dışına taşınacak bağlı
plan önce sezon/hafta ürün kararı gerektirir. Aynı anda yapılan düzenlemelerde
mevcut son başarılı yazım davranışı korunur; version/ETag eklenmez. Başlık
uzunluğu için repository genelinde bağlayıcı ürün politikası hâlâ `TBD`; bu teslim
yalnız UI'da boş/whitespace başlık ve tarihsiz gönderimi engeller.

Şema migration'ı veya yeni runtime bağımlılığı yoktur. Faz silme/sıralama,
arşivleme, takım taşıma ve katalogda gerçek tahta-durumu ayrı ürün kararlarıdır.

## Rollout and rollback

Frontend, mevcut `PUT`/`DELETE /training-plans/:id` uçlarını kullanır. Rollback,
UI eylemlerini ve servis transaction değişikliğini aynı revision'a geri alır;
silinmiş business data için otomatik geri yükleme yoktur. Doğrulama yalnız adı
`test` içeren disposable PostgreSQL 16 hedefinde yapılır; korunan yerel veri
silinmez.
