# V2 egzersiz çizimlerinin yerel yayını — 2026-10-27

## Yetki ve kapsam

Kullanıcı tüm120 v2 içeriğini **Fatih Çelebigil** olarak açıkça onayladı;
aynı-hesap istisnasının bu revizyona genişletilmesini, mevcut yerel kütüphaneye
aktarılmasını ve yayımlanmasını istedi.
[ADR-0048](../50-decisions/ADR-0048-local-diagram-revision-review-exception.md)
Accepted olarak bu talebi sabit hedef/hash ile kaydeder. ADR-0041'in orijinal v1
aracı ve normal API inceleme/yayın korumaları değişmedi.

İnsan inceleyen adı ile mevcut gerçek SystemAdmin'in yazar/inceleyen/yayımlayan
olduğu açıkça kaydedilir; independentReview=false. Bağımsız uzman kimliği, yeni
hesap, rol/grant veya production onayı üretilmez.

Paket canonical JSON SHA256:
b6b38673f328b6ab6f6d5b4850c9ee1c031076c501535b00d996716cff880f0c.
v1 geçmişi değişmez:
baac44256aea6e8c35b98db3489b3c9b39170e2a5a42881aec01749d41aa38b6.
Manifestlerin DRAFT/TBD authoring başlıkları korunur; gerçek yayın veritabanında
sürüm ve audit kaydıyla tutulur.

## Uygulama durumu

ngcs_local_session_dev üzerinde **120 v2 PUBLISHED**, **120 v1 ARCHIVED**.
Kalıcı dry-run120; tek apply120 import/120 publish/120 archive. Salt okunur
postcondition120 tamam, explicit replay0 import/0 publish/120 alreadyPublished.
120 yeni kaynak,120 yeni sürüm,312 yaş uyarlaması ve tam600 istisna auditi var.
43 tablodaki tüm önceki satırlar, yalnız izin verilen güncel Drill projection
ve v1 arşiv alanları dışında aynı. Mevcut plan, not, içerik/tahta snapshot ve
plan/günlük süreleri değişmedi.
Son browser kontrolünün ardından restore kopyasıyla yeniden karşılaştırma:
2.063 TrainingPlan,8.295 PlanDrill ve3.631 DayPlan kaydı tamamen aynıdır.

Son kök kalite **18/18**, backend941/frontend558/çizim14/tooling8/Sites4 geçer.
Yeni operator ayrıca11/11 gerçek PostgreSQL testi ve scoped lint/format geçti.
İlk kalite denemesi yeni ADR'nin indekse henüz bağlanmamasıyla durdu;
indeks eklendikten sonraki tam tur exit0'dır.

Canonical3132 oturumu yenilemede korundu. Yayın öncesi son bölge7 nesne/v1 idi;
yayın sonrası aynı kimlik32 nesne/v2 gösterir. Pas22 ve pres35 nesne, ayrı
organizasyon ve v2 kaynakla açıldı. Kullanıcının mevcut103dk/6faz planındaki
önceden eklenmiş üçüncü oyuncu çalışması hâlâ v1 ve7 nesneli çizimdir.
Gerçek plana yeni ekleme/kayıt yapılmadı; yalnız okuma doğrulandı.
Kanıtlar [publication klasöründe](../../apps/frontend/qa/drill-diagrams-2026-10-27/publication/README.md).

## Araç ve doğrulama

Yeni ayrı maintenance aracı:
[publish-local-diagram-revision.js](../../apps/backend/scripts/publish-local-diagram-revision.js).
Uygulama runtime'ı bu dosyayı import etmez. Varsayılan dry run; exact loopback
host/5433/DB, canonical manifestler, SystemAdmin ve orijinal author/source/yaş/
yayın/projection kontrolü vardır. apply için özel process opt-in, exact
ADR-0048 onay referansı ve Accepted ADR gerekir. Bilinmeyen/tekrarlanan CLI
argümanı, bağlantı override'ı ve production reddedilir.

Tek Serializable transaction120 yeni kaynak/ikinci sürüm ve312 yaş uyarlaması
oluşturur. DRAFT_CREATED→SUBMITTED→APPROVED→eski ARCHIVED→yeni PUBLISHED için
toplam600 audit yazılır. Tam postcondition transaction içinde yeniden kontrol
edilir. Belirsiz hatada otomatik tekrar yoktur; yalnız doğrulanmış tam yayın
sıfır-yazılı tekrar olarak kabul edilir.

**11/11 Node/PostgreSQL testi geçer, skip yoktur.** Hedef/hash/actor, dry-run,
karışık/önceden kısmi v2, kopyasız legacy plan referansı, geç audit hatasıyla tam
rollback, eşzamanlı çağrıda yalnız120 yayın, bozuk audit ve tekrar0 kapsanır.
Testler yalnız yeni disposable DB'de sentetik baseline kullanır; gerçek sportif
onay sayılmaz. CLI wrong-approval testi doğru referansı gerçekten yanlış değerle
değiştirir; duplicate-flag testi ayrıdır. Scoped ESLint/Prettier geçer.

Retained hazır egzersizlere bağlı55 PlanDrill referansının tamamında sabit içerik
kopyası bulundu. Ayrıca operator kopyasız/malformed fallback referansı görürse
yayını durdurur; geçmişe tahmini snapshot doldurmaz. Bu durum rollback-only
fixture ile önce kırmızı, sonra yeşil ve kalıcı regresyonla sınandı.

## Yedek ve prova

- Yeni özel backup: %LOCALAPPDATA%/NGCS/backups/
  before-diagram-revision-20261027T053600.dump;1,137,047 byte.
- SHA256:959359afa2619322f7c03cac280c5fbc9a94259ba1c0e55713b7aef73cd2bea0.
- Yeni ngcs_diagram_publication_restore_test_20261027 DB'ye pg_restore;
  42 tablo satır hash'leri eşleşti. Yalnız normal auth lifecycle'ın oynak
  RefreshSession ve SecurityAuditEvent parity dışında; eski audit satırları
  yayın koruma karşılaştırmasında ayrıca korunur.
- Restore kopyasında dry-run120, tek apply120 yeni yayın/120 eski arşiv,
  120 kaynak/120 sürüm/312 yaş/600 audit; bütün43 tablodaki orijinal satırlar
  yalnız izin verilen güncel Drill projection ve v1 arşiv alanları hariç aynıdır.
  PlanDrill/TrainingPlan/DayPlan not/tahta/içerik/süreleri değişmedi.
- Post-read120 tamam; explicit replay0 import/0 publish/120 alreadyPublished.
  Yeni hesap/plan/maç/kadro veya migration oluşturulmadı.

İlk denemelerde tarihî v1 projection süresinin primary varyanttan farklı olduğu
görüldü; v1 preflight tam orijinal importer değerini, v2 projection çözümlenmiş
birincil yaş süresini denetleyecek şekilde düzeltildi. İki fixture assertion'ı da
migration'ın mevcut LEGACY source satırını ve önceki negatif testin updatedAt
değişimini dikkate alacak şekilde düzeltildi. Başarısız örnekler ayrı isimlerle
korundu, reset/drop yapılmadı. Son11 testin tamamı taze fixture'da geçti.

## İnceleme kararları ve sınırlar

Bağımsız kod incelemesi Critical/Important bulmadı. Tek Minor wrong-reference
testi düzeltildi; ertelenen bulgu yoktur. Legacy fallback riski için ek guard
RED→GREEN ile kapatıldı. Karar: tarihî snapshot uydurmak yerine belirsiz
referansta fail-closed. Yanlış sınıflandırma maliyeti yayının durmasıdır; plan
içeriğinin sessizce değişmesi değildir.

Reviewer'ın kapsam dışında bıraktığı başlıklar: sportif doğruluk kullanıcı
onayıyla; önceki audit/çizim kaynakları önceki14 regresyon ve görsel kabul ile;
backup/prova/kalıcı sonuç/browser/kök kalite bu operator tesliminin doğrudan
yürütme kanıtlarıyla değerlendirilir. Genel API ve production bağımsız kapıdır.

Özel dump, credential ve ham satırlar repository'ye girmez. Operatör bağlantıyı
yalnız process belleğinde çözümler. Test/restore DB'leri ve özel yedek korunur.
Önceki audit ve çizim değişiklikleri korunmuştur; bu yerel yayın aşamasında
commit/push istenmemişti. Sonraki açık [commit/push talebi](DRILL_DIAGRAM_PUSH_REVIEW_2026-10-27.md)
ayrı Git teslimidir.

Kapanışta yeni canonical kütüphane sekmesi açık bırakıldı; geçici plan ve eski
galeri sekmeleri kapatıldı. Geçici salt okunur3537 sunucusu durduruldu.
Canonical3132/4000 aynı27748/39636 PID'leriyle devam eder; restart yapılmadı.
Galeri kaynak HTML/SVG'leri repository'de kalır, onay/yayın etiketi artık
authoring DRAFT kaynağı ile veritabanı yayın durumunu ayırır.

## Geri alma

Tam veritabanını sonraki kullanıcı düzenlemelerinin üzerine restore etme.
Yayımlı v2'yi denetlenmiş bakım/normal arşiv ile geri çek ve gerekirse doğrulanmış
ileri düzeltme sürümü yayımla. v1 geçmişi ve plan kopyaları silinmez.
Manifest veya hedef değişirse bu onay kullanılamaz.
