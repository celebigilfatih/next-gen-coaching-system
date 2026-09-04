# Prompt Guide

## New Project Trigger

> Bu proje CDSK standardını kullanacak. Proje adı: [ad]. Çözdüğü problem:
> [problem]. İlk hedef: [hedef].

## Project-specific Prompt Rules

- Önce `AGENTS.md`, anayasa ve Project Boot'u oku.
- Mevcut kod varlığını tamamlanmış/çalışır ürün olarak varsayma.
- `apps/frontend` için ADR-0003 topolojisini ve ADR-0009 teknoloji/akış kararını
  koru; seçilmemiş görsel yönü veya production topolojisini varsayma.
- Şema/migration farkında veritabanı ve otorite doğrulanmadan migration uygulama.
- Dar MVP dışındaki modülleri yeni kapsam gibi geliştirme.
- Doğrulanmamış metrik, tarih, servis, görsel sistem ve production kararını
  `TBD` bırak.

## Prohibited Prompt Content

Secret, token, parola/hash, doğrudan kişisel/sağlık verisi ve doğrulanmamış
iddialar kalıcı prompt bağlamına yazılmaz.
