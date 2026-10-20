# Tactical icon competitor research — 2026-10-20

## Question and evidence boundary

User requested a professional football icon direction grounded in competitor
examples. Audience: coaches using the existing2D tactical editor. This is a
public-source visual comparison, not a usability study, adoption ranking or
hands-on evaluation of paid editors. Current public product images, tutorials
and release notes were inspected on2026-10-20. Marketing screenshots do not
establish the exact installed version of a competitor.

## Observed references

| Product | Visible evidence | Useful direction |
| --- | --- | --- |
| Coach Board | Numbered discs and shirts in the player picker; equipment previews include a classic ball, striped cones, hoops, ladders and actual net/goal silhouettes | The picker shows the object the coach is about to place |
| Táctica | Numbered discs carry team kit stripes; yellow keeper tokens, a black/white ball, contrasting arrows and translucent zones | Clear team/role hierarchy and little decorative clutter |
| TacticalPad | Published examples show numbered player discs and sport-specific equipment; tutorials document shirt/disc-related appearance choices;2026.1 notes describe refreshed2D objects | Keep multiple player presentations and treat football objects as a dedicated visual family |
| Sport Session Planner | Public demo uses3D human figures, cones and perspective goals | A distinct3D approach; not required by the current approved2D scope |

Primary sources:

- [Coach Board product/picker](https://www.coachboard.app/),
  [official picker image](https://www.coachboard.app/shots/picker.png?dpl=dpl_3sf1DLTaEaTwj5uKNw7ACo3qKDou).
- [Táctica](https://tactica.football/),
  [official pitch image](https://tactica.football/images/tactica-pitch.png?v=1).
- [TacticalPad tutorials](https://tacticalpad.com/edu/formation.php),
  [release notes](https://tacticalpad.com/update/),
  [official equipment example](https://www.tacticalpad.com/new/assets/images/1-708x531.png).
- [Sport Session Planner demo](https://www.sportsessionplanner.com/?a=page&page=demo.html),
  [official3D demo image](https://www.sportsessionplanner.com/images/demo/ssp_demo01a.jpg).

Coach Tactic Board's official Google Play listing was also consulted, but the
available small screenshot was not used as the basis for detailed geometry
judgments. No account creation, paid trial or competitor write was performed.

## Current NGCS comparison

The live new-board page and current editor source were checked. The existing
football ball is already recognizable. The largest semantic gaps are the
ShieldCheck keeper button, GridNine goal button and generic UsersThree wall.
These are UI symbols while the pitch shows football objects. This assessment
is design judgment, not a measured user-error result.

## Proposed direction — pending visual selection

Combine Coach Board's direct equipment recognition with Táctica's restrained
hierarchy, using original NGCS artwork:

- System commands: consistent monochrome Phosphor controls; active state blue.
- Football tools: optically normalized miniatures of the same objects rendered
  on the pitch, including an actual goal/net and keeper-specific player preview.
- Players: preserve the approved shirt default and disc alternative; simplify
  shirt silhouette, contrast and number legibility. Keep home/away/neutral roles.
- Ball: preserve the classic white/black panels; tune small-size readability.
- Cone, flag, ladder and wall: recognizable football equipment, consistent
  outline weight and restrained shadow instead of unrelated generic glyphs.
- Compare previews at24/32px and on full/half pitches on tablet/mobile before
  choosing a final set. Preserve44px targets and accessible labels.

Initial design preview should cover player, goalkeeper, ball, cone, goal and
wall together. Keep existing document geometry, V1/V2/API, snapshots and shared
Konva/SVG/PNG drawing behavior. No new renderer/vendor/schema is proposed.
This research pass changes documentation only; the proposed icon redesign has
not been implemented or approved as a selected visual reference.
