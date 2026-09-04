# Product Constitution

- **Version:** 0.1
- **Status:** Draft
- **Effective date:** TBD

## Purpose and Trust

Next Generation Coaching System, futbol sezonu ve antrenman çalışma akışlarını
izlenebilir bir dijital ortama taşımayı amaçlar. Kullanıcıya gösterilen plan,
katılım ve analiz verisi doğrulanabilir kaynağa dayanmalıdır.

## Binding Principles

1. Repository tek doğruluk kaynağıdır.
2. Bilinmeyen bilgi doğrulanmış gerçek gibi sunulmaz.
3. MVP açık onay olmadan genişletilmez.
4. Oyuncu ve sağlık verisi için veri minimizasyonu, en az yetki ve açık amaç esastır.
5. Önemli ürün, mimari, veri ve güvenlik kararı ADR olmadan bağlayıcı olmaz.
6. Kabul kriteri, uygun kontroller ve güncel dokümantasyon olmadan iş tamamlanmaz.
7. Antrenörün planlama ve takip akışı MVP'nin öncelikli değer akışıdır.

## Prohibited Practices

- Secret, parola, erişim anahtarı veya gereksiz kişisel/sağlık verisini
  repository, log ya da dokümana yazmak.
- Sağlık veya performans skorunu doğrulanmamış çıkarımla üretmek.
- Bir kulübün verisini başka kulüp kullanıcısına yetki kontrolü olmadan açmak.
- Boş frontend workspace'ini çalışan ürün yüzeyi gibi belgelemek.

## Amendment Process

Değişiklik ayrı ADR, etki analizi, açık kullanıcı onayı ve changelog kaydı
gerektirir.
