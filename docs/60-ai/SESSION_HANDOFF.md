# Session Handoff

Güncel kayıt `PROJECT_BOOT.md` içinde tutulur.

- **Session summary:** `1b831e0` tabanlı `codex/mvp-stabilization` çalışma ağacında
  A–D stabilizasyonu ve ADR-0017 artifact ayrımını izleyen onaylı ADR-0018 opt-in
  kalıcı oturum uygulandı. Root quality (68 backend / 13 frontend unit), disposable
  PostgreSQL 16 migration/idempotency/status/boş diff, backend 18/18 E2E ve frontend
  opt-in 4/4, flag-off 3/3 Playwright geçti. Runtime/migrator imajları yeniden
  oluşturuldu. Flag'ler varsayılan kapalı; yerel uygulama DB'sine migration veya
  production rollout yapılmadı. MVP remediation review hükmü **Pass**.
- **Documents updated:** ADR-0014–0018, `MVP_REVIEW_2026-09-05.md`, BL-017–BL-027,
  CR-009–013, requirements, security/data/API/integration/operations gerçekleri,
  roadmap/milestone, changelog ve Project Boot.
- **Decisions recorded:** Dashboard `GLOBAL + own club`; aggregate'lerde kesin
  group sınırı; Socket operasyon olaylarında güncel group/resource alıcısı;
  password reset'te transaction içi conditional single-winner claim; Prisma CLI
  advisory zinciri hosted runtime için geçici `not_actionable` risk kabulü;
  serving runtime ile migration artifact'ının ayrılması; default-disabled kalıcı
  session, 15m access/7d idle/30d absolute, beş-family ve 30d refresh-record retention.
- **Remaining risk:** Log/DTO/lint borcu, formal WCAG, provider,
  registry/orchestrator, ayrı DB rolleri, security-audit/sağlık retention,
  readiness, observability ve backup M4 kapsamında `TBD`. Web Locks bulunmayan
  tarayıcılarda eşzamanlı rotation fail-closed yeniden giriş gerektirebilir.
- **Recommended next step:** ADR-0010/0018 production rollout girdilerini ve mevcut
  artifact'lar için production registry/orchestrator/DB-role sözleşmesini
  tamamlamak.

Handoff sohbet dökümü, secret veya kişisel veri içermez.
