# Personas

## Primary Persona

- **Name / role:** Takım/grup ataması bulunan futbol antrenörü (`COACH`).
- **Problem:** Sezon içindeki antrenman ve taktik çalışma bilgisini izlenebilir
  biçimde planlamak ve takip etmek.
- **Desired outcome:** Plan, katılım ve analiz bilgisine aynı çalışma bağlamından erişmek.
- **Primary workflow:** Haftalık sezon planından antrenman oluşturmak, egzersizleri
  fazlara yerleştirmek, katılımı işaretlemek ve maç günü taktik notunu kaydetmek.
- **Constraints:** Yetki sınırı atanılan kulüp/gruptur. Cihaz, çalışma ortamı ve
  dijital yeterlilik bilgisi `TBD`.

## Observed Technical Roles

- `SYSTEM_ADMIN`, `CLUB_ADMIN`, `COACH`, `PLAYER` rolleri backend ve Prisma
  baseline'ında bulunur.
- Tenant sınırı ADR-0005, çekirdek eylem matrisi ADR-0007 ve birincil persona
  ADR-0009 ile onaylıdır. `CLUB_ADMIN` ve `PLAYER` ayrıntılı personaları `TBD`.
