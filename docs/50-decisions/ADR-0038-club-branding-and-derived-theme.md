# ADR-0038: Kulüp logosu, renkleri ve türetilmiş tema

- **Status:** Accepted
- **Date:** 2026-10-19
- **Owners / approvers:** Kullanıcı logo/renk/tema ve somut yerel migration uygulamasını açıkça onayladı
- **Supersedes / superseded by:** Extends ADR-0037
- **Related:** ADR-0006, ADR-0028, ADR-0037, CR-027, BL-060

## Context

Wizard uygulaması onaylandıktan sonra kullanıcı logo yükleme, kulüp renkleri ve
renklerden otomatik uyumlu tema istedi. Club.logo mevcut ancak kalıcı renk
alanları yoktur. Fikstür veya teknik görev renkleri kulüp temasıyla karıştırılmaz.

## Decision

- Club'a yalnız nullable primaryColor ve secondaryColor VARCHAR(7) kolonları
  eklenir. İki check constraint yalnız #RRGGBB değerlerini kabul eder. Mevcut
  kayıtlar NULL kalır; Spor Manage veya başka kulüp değerleri değiştirilmez.
- Exact migration: `20261019000000_add_club_brand_colors/migration.sql`.
  Boş dedicated DB ve retained snapshot restore kopyasında doğrulandı; özel
  backup sonrası açık onayla yalnız ngcs_local_session_dev üzerine uygulandı.
  Bu dilim sonunda branding dahil 12 migration uygulanmıştır; eşzamanlı başka
  özelliklerin migration dosyaları bu onay kapsamında deploy edilmez.
- Logo mevcut Club.logo alanında raster data URI olarak saklanır. PNG/JPEG/WebP
  kaynakları en fazla 2 MiB; tarayıcıda en fazla 512 px ve 48 KiB'ye hazırlanır.
  Backend MIME/magic/base64 ve 48 KiB sınırını yeniden doğrular. SVG/aktif içerik
  kabul edilmez. Route'un mevcut 100 KiB JSON sınırı büyütülmez.
- İlk sürüm yeni dosya servisi, bucket, credential veya vendor gerektirmez.
  Logo ve kişiler yalnız son kayıt işleminde gönderilir; preview bellektedir.
- Kulüp seçimi tema kaynağıdır. Primary buton/vurgu, secondary yardımcı vurgu
  ve bu renklerden beyazla karıştırılmış yüzey tonları türetilir. Primary üzerinde
  siyah/beyazdan daha okunaklı metin seçilir; beyaz yüzeydeki link rengi gerekli
  kontrasta koyulaştırılır. Seçili olmayan kulüp teması uygulanmaz; logout ve
  scope değişimi eski değişkenleri temizler. Eski/boş renkler NGCS temasına döner.
- Uyarı/hata/başarı renkleri, futbol sahası, forma ve ekipman renkleri korunur.
  Kimlik bilgileri, sağlık verisi veya hesap yetkileri bu değişiklikte yoktur.

## Verification and Rollback

Uygulama ve tarayıcı kanıtı: [wizard doğrulaması](../30-quality/CLUB_SETUP_WIZARD_2026-10-19.md).
Açık/koyu/sarı/beyaz renklerde primary metin ve beyaz yüzey link kontrastı
en az 4.5:1 test edildi. Seçili kulüpte logo ve tema kalıcı kayıttan yüklenir.

İzole PostgreSQL'de migration, repeat deploy/status, boş schema diff ve mevcut
kulüp/logo değerlerinin korunumu; DTO boyut/tür/renk retleri; açık/koyu renkler
ile metin kontrastı, preview, kulüp değiştirme ve boş tema testleri gerekir.
Retained local rollout öncesinde mevcut verinin özel backup/restore provası
alınır. Rollback önce uygulamayı geri alır; nullable kolonlar ve mevcut logolar
silinmez. Production rollout ayrıca onaylanır.
