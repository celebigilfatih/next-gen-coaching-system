# ADR-0035: Saha odaklı profesyonel 2D taktik stüdyosu

- **Status:** Accepted
- **Date:** 2026-09-19
- **Approval:** Kullanıcının profesyonel taktik tahta önerisine “Tamam uygulayalım” onayı.
- **Related:** ADR-0011, ADR-0012, ADR-0015, CR-025, REQ-024, BL-057.

## Context

Fotoğraflı editör başlığı ve açık metadata formu sahayı aşağı itiyordu. Oyuncular
daire, kaleler kesikli dikdörtgen olarak çiziliyor; bazı araçlar aynı ikonla
gösteriliyordu. SVG exporter tüm nesneleri daire olarak dışa aktarıyordu.

## Decision

İlk uygulama dilimi mevcut React-Konva ve shadcn tabanında 2D editördür:

- Kompakt başlık ve açılabilir egzersiz bilgileri; saha odaklı çalışma alanı.
- Forma varsayılanı, disk alternatifi ve mevcut V1 oyuncu adı/numara alanları.
- Phosphor araç ikonları ve canvas/SVG arasında ortak domain çizim geometrisi.
- Yakınlaştırma, kaydırma, sahaya sığdırma, panel gizleme ve odak görünümü.
- Görünüm tercihleri oturumluk sunum durumudur; V1 JSON'a eklenmez, dirty-state
  veya undo geçmişini değiştirmez. Yeniden açılış varsayılan forma görünümüdür.
- PNG seçimi/transformer'ı içermez; çıktı çözünürlüğü viewport zoom'una bağlı değildir.

V1 şeması, 250 eleman/100 KB limiti, save/dirty navigation, tenant/sahiplik,
plan snapshot ve maç tahtası sözleşmeleri korunur. Yeni bağımlılık veya migration
eklenmez. Bu dilim masaüstü/tablet öncelikli, mobilde kaydırılabilir araçlar ve
alt özellik paneli sunar.

## Phased direction

### Increment 2 — continued with user approval (2026-09-19)

The existing V1 name field supports an explicit roster-name snapshot, not a
new identity relation. Tactics, training snapshots and match boards can read
the current workspace roster through the existing capability/tenant-filtered,
paged player endpoint. Only the selected display name and goalkeeper/player
presentation are copied. Person identifiers, health data and inferred shirt
numbers are not persisted. UI warns that names appear in exports; later roster
changes never rewrite existing boards. A persistent Person link remains a
separate schema/privacy decision, not delivered by this increment.

Multi-selection is transient editor state: Shift/click or a touch-accessible
toggle, home/away selection, bounded unit translation, duplicate and delete.
Each unit operation is one undo step. Group resizing/rotation and saved named
units are excluded; single-object transform remains available. Shared delta
clamping preserves spacing and moves arrow endpoints with their anchors.
The timeline and index are updated atomically to prevent batched events from
leaving history out of range. PNG omits selection hints.

[Increment verification](../30-quality/TACTICAL_ROSTER_SELECTION_2026-09-19.md).

Kullanıcı 2D → kadro/taktik araçları → animasyon → maç günü → 3D/video yönünü
onayladı. Bu ADR yalnız ilk dilimin teknik sözleşmesini kesinleştirir. Sonraki
dilimlerin oyuncu kimliği, sahne/zaman modeli, çevrimdışı saklama, ekip paylaşımı,
çatışma çözümü ve provider kararları ayrı ADR'lerle somutlaştırılır. ADR-0012'nin
mevcut tek-sahne V1 sözleşmesi sessizce genişletilmez. Gerçek 3D renderer,
tracking/veri/video entegrasyonu veya elit kulüp kabulü bu teslimde iddia edilmez.

## Verification and limitations

### Increment 3 — existing-slot name snapshots (2026-09-19)

The continued approved name-snapshot work adds explicit player/goalkeeper slot
selection and confirmation. Assignment preserves id, geometry, type and team;
copies only the chosen name and clears the old number, which the coach may
enter manually. It adds no element or identity relation and is one undo step.
No V1, API or permission contract changes. Modal interaction blocks background
editor shortcuts. [Evidence](../30-quality/TACTICAL_SLOT_ASSIGNMENT_2026-09-19.md).

[Dilim doğrulaması](../30-quality/TACTICAL_STUDIO_2026-09-19.md).
Formal WCAG ve gerçek saha kenarı cihaz/kullanıcı pilotu TBD. V1 özel saha
türlerinin mevcut yön/ölçü semantiği bu sunum diliminde yeniden tanımlanmaz.

## Implementation note — selected equipment family (2026-10-20)

User selected the second six-object concept and requested toolbar/pitch use.
Original domain artwork remains in the existing shared Konva/SVG source; toolbar
miniatures are serialized from it. Six labeled horizontal add actions preserve
the existing commands/history; compact controls scroll at narrow widths. New
wall default is84px/three mannequins; saved sizes are not rewritten. No renderer,
schema, API, dependency or bulk conversion is added. This implements the accepted
presentation decision, not a new architecture choice.
[Evidence](../30-quality/TACTICAL_EQUIPMENT_IMPLEMENTATION_2026-10-20.md).

The user's follow-up extends the same family to flag, ladder and marker,
completing nine shared-art equipment tools. Existing height/length/rung/size
defaults and saved documents remain; this is presentation within the same ADR.
