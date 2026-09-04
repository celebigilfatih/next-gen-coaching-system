# Coding Standards

## Language and Framework Rules

- Backend TypeScript, NestJS 11 ve Prisma 6 kullanır.
- Yeni route'larda doğrulanmış DTO, validasyon ve açık dönüş sözleşmesi tercih edilir.
- `any`, console log ve varsayılan secret kullanımı yeni kodda gerekçesiz eklenmez.
- Veri modeli/migration değişikliği onaylı ADR ve rollback planı olmadan yapılmaz.

## Repository Conventions

- Uygulamalar `apps/` altında; backend kendi package manifestine sahiptir.
- Generated/build artifact'leri kaynak kod yerine geçmez.
- Repository topolojisi ve kullanıcı değişikliği açık karar olmadan yeniden yazılmaz.
- Anlamlı değişiklikte ilgili CDSK belgesi, changelog ve handoff güncellenir.

## Error, Security and Logging Rules

- Secret, parola hash'i, token ve hassas sağlık verisi loglanmaz veya response'a
  taşınmaz.
- Yetki yalnızca UI'da değil API kaynağı ve tenant sınırında uygulanır.
- Beklenen client hataları kontrollü HTTP hatalarına dönüştürülür.

## Formatting and Static Analysis

- **Format:** Kök `npm run format:check`, repository kalite scriptleriyle iki
  uygulamayı kendi Prettier yapılandırması altında salt-okunur doğrular.
- **Lint:** Kök ve uygulama `npm run lint` komutları salt-okunurdur; düzeltme yalnız
  açık `lint:fix` komutuyla yapılır. Backend gerçek `src`/`test` kapsamını tarar,
  legacy nested `apps/` kopyası kaynak olmadığı için dışlanır.
- **Typecheck:** Kök `npm run typecheck`, backend `tsc --noEmit` ve frontend React
  Router type generation/TypeScript kontrolünü çalıştırır.
- **Tam kapı:** `npm run quality`; E2E destructive koşulları nedeniyle ayrı tutulur.
- Backend analytics adapter'ındaki 41 unused-variable uyarısı görünür teknik borçtur;
  lint hatası yoktur ve yeni kodda uyarı eklenmemelidir.
