# ADR-0048: Yerel v2 çizim revizyonu için adlandırılmış onay istisnası

- **Status:** Accepted
- **Date:** 2026-10-27
- **Related:** ADR-0032, ADR-0034, ADR-0039, ADR-0041, REQ-023/027, BL-077
- **Approval:** Kullanıcının açık talebi: “Yeni v2 paketindeki 120 içeriği Fatih
  Çelebigil olarak onaylıyorum. Yerel aynı-hesap istisnasını bu revizyona da
  genişletip içerikleri mevcut kütüphaneye aktaralım ve yayımlayalım.”

## Context

ADR-0041 yalnız değişmemiş ilk v1 yayınına uygulanıyordu; yeni çizim revizyonunu
kapsamıyordu. Kullanıcı şimdi v2'nin tüm120 içeriğini adını belirterek onayladı,
aynı-hesap istisnasını bu revizyona genişletmeyi ve yerel aktarım/yayını açıkça
istedi. Yeni uzman kimliği veya bağımsız inceleme kaydı icat edilmez.

## Decision

Yalnız loopback5433/ngcs_local_session_dev üzerinde, aynı120 kalıcı drillId için
ngcs-starter-diagrams-v2 paketinin ikinci içerik sürümü aktarılır ve yayımlanır.
Mevcut gerçek, aktif SystemAdmin yazar/inceleyen/yayımlayan olarak kullanılır;
insan inceleyen Fatih Çelebigil ve independentReview=false açıkça audit edilir.

Onaylı canonical JSON SHA256:
b6b38673f328b6ab6f6d5b4850c9ee1c031076c501535b00d996716cff880f0c.
Tarihî v1 hash'i:
baac44256aea6e8c35b98db3489b3c9b39170e2a5a42881aec01749d41aa38b6.
Dosyaların DRAFT/TBD authoring başlıkları korunur; yayın kaydı veritabanındadır.

Yeni maintenance-only araç default dry run kullanır. Tam hedef/sürüm/checksum,
mevcut yazar, kaynak, yaş uyarlamaları ve önceki yayın kontrol edilir.
Tek Serializable transaction120 yeni DRAFT oluşturur; submit/approve/source
verification, eski sürümü arşivleme ve yeni sürümü yayınlama birlikte tamamlanır.
Her120 içerik için beş ayrı audit kaydı: DRAFT_CREATED, SUBMITTED, APPROVED,
ARCHIVED ve PUBLISHED; onay referansı, manifest hash'i, gerçek reviewer adı ve
bu ADR taşınır. Tam ve doğrulanmış tekrar sıfır yazı yapar.

PlanDrill, TrainingPlan, DayPlan ve geçmiş içerikler değiştirilmez; yalnız eski
sürümlerin yaşam döngüsü status/archivedAt/updatedAt alanları arşivlemeyle değişir.
Drill'in güncel katalog projection'ı yeni yayınla eşitlenir. Eski planların kendi
snapshot'ı, notları ve süreleri aynen korunur.

## Limits and verification

Production, başka veritabanları, sonraki revizyonlar ve diğer içerikler kapsam
dışıdır. Normal API self-review/publish kuralları ve rol/grant sınırları değişmez.
Yeni hesap, yetki, migration veya runtime bypass flag'i eklenmez.

Uygulama öncesi temiz disposable PostgreSQL'de hedef/manifest/actor/mixed-state
redleri, dry-run, geç hata rollback, eşzamanlı çağrı, tekrar ve bozuk audit
korumaları doğrulanır. Yeni özel yedek ayrı DB'ye restore edilir ve korunacak tüm
satırlarla karşılaştırılır; restore kopyasında gerçek baseline ile prova yapılır.
Belirsiz yazımda otomatik tekrar yoktur; önce salt okunur durum doğrulanır.

Geri alma gerekirse denetlenmiş ileri düzeltme/arşiv kullanılır; geçmiş içerik
silinmez ve bütün veritabanı sonraki kullanıcı düzenlemelerinin üzerine restore
edilmez. Bu istisna bağımsız sportif sertifikasyon olarak sunulmaz.
