# ADR-0034: Egzersiz uzman incelemesi ve global yayın ayrımı

- **Status:** Accepted
- **Date:** 2026-09-09
- **Owners / approvers:** Kullanıcı planı 2026-09-09 tarihinde açıkça onayladı; adlandırılmış futbol uzmanı `TBD`
- **Related:** ADR-0012, ADR-0023, ADR-0032, ADR-0033, REQ-023, BL-056, CR-024

## Context

Doğrudan global egzersiz mutation'ı, yazarlık ile sportif onayı ve platform
yayınını tek yetkide birleştiriyordu. Doğrulanmamış içerik profesyonel katalog
olarak sunulmamalıdır.

## Decision

- `DRILL_CONTENT_AUTHOR`, `DRILL_CONTENT_REVIEW` ve
  `DRILL_CONTENT_PUBLISH` ayrı capability değerleridir.
- Teknik direktör ve yardımcı antrenör varsayılan yazar; sportif direktör ve
  akademi direktörü reviewer'dır. Yazar kendi içeriğini onaylayamaz.
- Uzman onayı bulunmayan sürüm yayınlanamaz. Son global yayın ve arşiv yalnız
  `SYSTEM_ADMIN` tarafından yapılır; yayın eylemi audit edilir.
- Mevcut kulüp/grup egzersizi yetkileri korunur. Global içerik doğrudan
  değiştirilemez; kulüp bağlamına kopyalanıp düzenlenebilir.
- Reviewer gerçek kimliği atanmadığında içerik `DRAFT` kalır ve yayınlanmış
  katalog sayımına dahil edilmez.

## Consequences

Sportif kalite onayı ile platform operasyonu ayrılır. İlk 120 kayıt teknik olarak
doğrulansa bile reviewer `TBD` iken kullanıcı kataloğuna yayınlanmaz. Capability
ataması ve production operasyon sahibi ayrı yönetişim sorumluluğudur.

2026-10-19: [ADR-0041](ADR-0041-local-starter-review-exception.md) yalnız mevcut
Windows yerel başlangıç paketinin değişmemiş 120 ilk sürümü için açıkça onaylanan
aynı-hesap istisnasıdır. Fatih Çelebigil'in onayı ve istisna audit edilir;
bağımsız inceleme olarak sunulmaz. Genel runtime kuralları, production ve
gelecekteki sürümlerin bağımsız inceleme gereksinimi korunur.
