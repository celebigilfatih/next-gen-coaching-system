# Observability

## Logs, Metrics and Traces

- Kodda console log kullanımı gözlendi.
- Yapılandırılmış log, metrik, trace ve correlation kimliği doğrulanmadı.
- Sağlık veya kişisel veri loglanmamalıdır.
- BL-024 ilk diliminde opsiyonel training-plan → season-day bağlantısı yalnız
  `PLAN_SEASON_LINK_SKIPPED_NO_SEASON`, `PLAN_SEASON_LINK_SKIPPED_NO_WEEK`,
  `PLAN_SEASON_LINK_SKIPPED_PLAN_MISSING` ve `PLAN_SEASON_LINK_FAILED` sabit
  olaylarını Nest Logger'a iletir. Plan/kulüp/sezon metadata'sı veya ham error
  argümanı yoktur; başarı logu ve debug-only geniş sorgular kaldırılmıştır.
  Bu, global redaction/retention veya monitoring politikası değildir.
- İkinci BL-024 diliminde `POST /groups` create hatası yalnız `GROUP_CREATE_FAILED`
  loglar; cause/raw driver nesnesi taşımayan kontrollü HttpException, Nest'in
  ham exception'ı tekrar loglamasını önler. Önceki genel 500 response korunur.
  Sonraki dilimlerde iki club create yolu, club update, bütün group mutation'ları
  ve drill create/update/delete yolları da raw exception yerine route'a özgü sabit
  olay + cause-free generic 500 kullanır. Attendance upsert de yalnız
  `ATTENDANCE_MARK_FAILED` olayı üretir. Season/week/day/match mutation ve
  week-generation yolları da BL-037 ile kaynak kimliği/cause taşımayan işlem
  türüne özel `SEASON_*_FAILED` olaylarına indirildi. Training-plan create/update/
  delete, add/replace drill ve board snapshot yolları BL-038 ile aynı fixed-event,
  cause-free modele alındı. Onaylı MVP mutation log/DTO kapsamı tamamlandığı için
  BL-024 kapalıdır; global log sınıflandırma/redaction/retention ile MVP dışı
  sağlık/analitik prototip politikası hâlâ `TBD`'dir.

## Health and Alerts

PostgreSQL Compose healthcheck'i var. Backend readiness/liveness ve uyarı
eşikleri `TBD`.

## Dashboards and Ownership

N/A — doğrulanmış operasyon dashboard'u veya on-call sahibi yok.

## Sensitive Data Rules

Token, parola/hash, kişisel veri ve sağlık ayrıntısı loglara yazılmaz. Redaction,
erişim ve log retention politikası `TBD`.
