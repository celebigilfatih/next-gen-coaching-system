# ADR-0033: Özgün ve açık lisanslı egzersiz içerik politikası

- **Status:** Accepted
- **Date:** 2026-09-09
- **Owners / approvers:** Kullanıcı planı 2026-09-09 tarihinde açıkça onayladı; hukuk sahibi `TBD`
- **Related:** ADR-0032, REQ-023, BL-056, CR-024

## Context

Rakip platform ve federasyon kaynakları ürün yaklaşımı için yararlı olsa da
içeriklerin kopyalanması, scrape edilmesi veya lisans kanıtı olmadan ticari ürüne
alınması telif ve tedarik riski doğurur.

## Decision

- Başlangıç paketi NGCS tarafından Türkçe ve özgün yazılır; rakip ürünler yalnız
  özellik/filtre/paylaşım benchmark'ıdır.
- Dış içerik yalnız kayıt bazında doğrulanmış `CC0` veya `CC BY 4.0` ise kabul
  edilir. CC BY kaydı kaynak URL, yazar, atıf ve değişiklik bildirimini taşır.
- `NC`, `ND`, `SA`, belirsiz lisans ve all-rights-reserved içerik hukuk onayı
  olmadan reddedilir. FIFA içeriği yazılı ticari izin olmadan içe alınmaz.
- `DrillSource` kaynak türü, lisans, checksum, atıf, değişiklik ve doğrulayan
  aktörü saklar. Lisans kanıtı olmayan manifest importer tarafından reddedilir.
- Canlı dış servis, scraping ve otomatik internet içe aktarımı yoktur.

## Consequences

Kaynak ve lisans kullanıcıya görünür, paket tekrar üretilebilir ve checksum ile
doğrulanabilir. Dış sağlayıcı ortaklığı, ücretli içerik ve hukuk owner'ı `TBD`
kalır.
