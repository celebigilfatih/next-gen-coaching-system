# ADR-0031: Player 360 notları ve kontrollü takım paylaşımı

- **Status:** Accepted
- **Date:** 2026-09-09
- **Owners / approvers:** Kullanıcı uygulama planını 2026-09-09 tarihinde açıkça onayladı; named product/data/security owner `TBD`
- **Related:** ADR-0022, ADR-0023, ADR-0030, REQ-022, BL-055, CR-023

## Context

Player 360, hesap sahibi olmayan `Person` oyuncular için not tutamıyor; teknik
enum ve kanıt-yok kartları gerçek bir sonraki eylem vermiyordu. Eski
`PlayerCoachNote` yalnız `User` kimliğine bağlıydı ve güncelleme geçmişi, takım
devri veya sürüm çakışması sınırı taşımıyordu.

## Decision

- Canonical `PlayerNote`, login hesabından bağımsız `Person` oyuncuya; kaynak
  takım, kulüp ve yazara bağlanır. Eski model ve uçlar uyumluluk için korunur.
- Teknik not; kategori, gözlem tarihi, isteğe bağlı takip tarihi/durumu, 1–4000
  karakter gövde, sürüm ve arşiv zamanı taşır. Sağlık, teşhis ve psikolojik
  değerlendirme kategorileri bu sözleşmede yoktur.
- Her başarılı içerik, arşiv/restore veya paylaşım değişikliği immutable revision
  oluşturur. Güncelleme `expectedVersion` ister; yarış 409 ile fail-closed olur.
- Not kalıcı silinmez. Yazar veya yetkili yönetici arşivler; aynı kimlikle geri
  yüklenir.
- Eski takım notu otomatik taşınmaz. `SYSTEM_ADMIN` veya aynı kulüp
  `CLUB_ADMIN`, yalnız oyuncunun aktif ataması bulunan aynı-kulüp takımına açık
  `PlayerNoteTeamGrant` verir.
- `PLAYER_NOTE_VIEW` ve `PLAYER_NOTE_MANAGE` capability'leri takım ataması,
  tenant ve grant ile birlikte değerlendirilir. `PLAYER` notlara erişemez;
  takım yöneticisi salt okunur, onaylı teknik lider rolleri kendi notlarını
  yönetir. Başka yazarın notunu yalnız yönetici değiştirebilir.
- Audit yalnız not kimliği, kategori, sürüm ve eylem metadata'sı taşır; not
  gövdesi log veya audit'e yazılmaz.
- Player 360; kompakt kimlik, URL-korumalı Genel Bakış/Notlar/Aktivite/Yolculuk,
  kullanıcı dilinde enumlar ve gerçek atama/katılım kaynaklarını gösterir.

## Consequences

Hesapsız kadro oyuncuları teknik ekip iş akışına katılır; revision ve kontrollü
grant geçmiş bağlamı korur. Takım değişimi otomatik bilgi aktarımı yapmadığı için
yönetici paylaşımı açık bir operasyon olarak kalır. Klinik veri, readiness ve
maç katılımı için bu karar yetki veya veri modeli sağlamaz.

## Rollout and rollback

İki additive migration önce disposable PostgreSQL 16 üzerinde deploy/status/diff
ile doğrulanır, sonra açıkça onaylı yerel veritabanına reset olmadan uygulanır.
Rollback yeni UI ve API controller/service'ini kaldırabilir; veri tablosu geri
alınacaksa önce kayıt export/retention kararı gerekir. Production rollout `TBD`.
