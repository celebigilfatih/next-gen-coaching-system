# Yerel v2 çizim paketini yayımlama

Yetki:2026-10-27 Fatih Çelebigil'in tüm120 içerik, aynı-hesap istisnası,
yerel aktarım ve yayın için açık talebi. Bağlayıcı kapsam ADR-0048'dir.

1. Yeni ayrı maintenance operator ve anlamlı Node/PostgreSQL regresyonları:
   exact loopback/manifest/actor guard, default dry run, atomic120 import+
   submit+approve+archive+publish, truthful600 audit, concurrent/replay ve rollback.
   Eski v1 aracı ve normal API değiştirilmez.
2. Taze disposable DB'de RED→GREEN; normal API'nin self-review/onaysız yayın
   korumalarını yeniden sınama; kod incelemesi ve kök kalite.
3. Gerçek hedefe salt okunur preflight; yeni özel pg_dump backup, yeni DB'ye
   restore/parity; restore kopyasında operator prova ve tüm korunacak satırların
   karşılaştırılması. Özel yedek repository'ye girmez, credential yazılmaz.
4. Onaylı yerel hedefte dry run, tek atomic apply, salt okunur doğrulama,
   explicit no-op replay. Eski v1 içerik/yaşlar/kaynak ve tüm mevcut planlar sabit.
5. Canonical browser'da farklı yeni önizlemeler ve eski plan snapshot'ı okunur;
   gerçek mevcut planlara egzersiz eklenmez. Belgeler/handoff/BL-077 güncellenir.

Yeni karar zaten kullanıcıca kabul edildi; tekrar onay istenmez. Commit/push
istenmedi. Önceki audit ve çizim işi değişiklikleri korunur; managed worktree
codex/drill-specific-diagrams kullanılır.
