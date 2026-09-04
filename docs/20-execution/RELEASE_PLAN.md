# Release Plan

## CDSK Başlangıç Değişiklik Seti

- **Version:** Dokümantasyon başlangıcı 0.1.
- **Target:** Yerel repository; yayın ortamı N/A.
- **Included outcomes:** CDSK manifesti, bağlam belgeleri, ADR'ler, risk/backlog ve
  tarihsel belge uyarıları.
- **Quality gates:** CDSK validator, Markdown yerel bağlantı kontrolü,
  `git diff --check`, değişiklik kapsamı incelemesi.
- **Rollout:** Tek, geri döndürülebilir dokümantasyon değişiklik seti.
- **Rollback:** Eklenen CDSK dosyaları ve tarihsel belge uyarıları ilgili commit
  geri alınarak kaldırılabilir; runtime/veritabanı etkisi yoktur.

## Product Release

- **Version, target date, environments, rollout and rollback:** TBD.
