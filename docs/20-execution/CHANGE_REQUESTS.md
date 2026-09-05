# Change Requests

| ID | Change | Scope impact | ADR needed | Approver | Status |
|---|---|---|---|---|---|
| CR-001 | CDSK 0.1.0 kullan | Repository yönetişimi ve bilgi mimarisi | ADR-0001 | Product owner | Approved |
| CR-002 | Dar MVP sınırını benimse | Ürün kapsamı | ADR-0002 | Product owner | Approved |
| CR-003 | Frontend kaynak/topoloji modelini seç | Repository ve delivery mimarisi | ADR-0003 | Product owner | Approved |
| CR-004 | Şema/migration geçmişini uzlaştır | Veri modeli ve migration | ADR-0006 | Product owner approval; named data owner TBD | Approved |
| CR-005 | Çekirdek rol ve tenant matrisini uygula | Güvenlik | ADR-0005, ADR-0007 | Product owner approval; named security owner TBD | Approved |
| CR-006 | Sağlık ve ileri analitik veri politikasını onayla | Güvenlik ve gizlilik | Evet, TBD | Product owner / security owner TBD | Proposed |
| CR-007 | Frontend teknoloji ve ilk ekran akışını seç | Ürün ve frontend mimarisi | ADR-0009 | Product owner approval; named frontend owner TBD | Approved |
| CR-008 | Davet tabanlı hesap yaşam döngüsünü uygula | Auth, veri modeli ve audit | ADR-0008 | Product owner approval; named security owner TBD | Approved |
| CR-009 | Same-club cross-group aggregate ve Socket recipient sınırını kapat | Güvenlik, API/event sözleşmesi ve veri ilişkileri | ADR-0014 | Explicit user approval; named security owner TBD | Approved and verified |
| CR-010 | Password reset token tüketimini single-winner atomik yap | Güvenlik ve transaction davranışı | ADR-0015 | Explicit user approval; named security/data owner TBD | Approved and verified |
| CR-011 | Prisma CLI advisory için kanıtlı geçici risk kabulü | Dependency security ve production gate | ADR-0016 | Explicit user approval; named security/operations owner TBD | Approved |
| CR-012 | Backend runtime image ile migrator artifact/job'u ayır | Deployment mimarisi, image içeriği ve DB yetkileri | ADR-0017 | Explicit user approval; named operations owner TBD | Approved and verified |
| CR-013 | Provider-neutral kalıcı oturum ve onaylı süre/retention politikası | Auth API, frontend, additive migration ve güvenlik | ADR-0018 | Explicit user approval; named security/operations owner TBD | Approved and verified — production rollout TBD |
