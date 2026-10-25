# NGCS Phase 2 — Product and Architecture Proposal

Status: Approved direction — P0.1 foundation implemented; later phase gates remain
Prepared: 2026-09-06
Product: Next Generation Coaching System
Decision owners: TBD

## Executive conclusion

NGCS should evolve from a coach workspace into a **Football Club Operating System
and Football Intelligence Platform**. Its defensible product core should not be a
larger collection of CRUD screens. It should be the traceable decision loop that
connects how the club wants to play with what it teaches, observes and decides:

```text
Club Game Model
  -> team and player requirements
  -> development goals
  -> training objectives and exercises
  -> match/training evidence
  -> multidisciplinary review
  -> next coaching, pathway or recruitment decision
```

The existing training, attendance, season, match, exercise and tactical-board
capabilities are a useful first vertical slice. They are not, however, a sufficient
domain foundation for multi-team, multi-season player pathways, specialist staff
permissions, longitudinal evidence or provider-neutral intelligence.

The recommended architecture is a **modular monolith first**, with explicit bounded
contexts, effective-dated history, an integration boundary and purpose-specific
read models. NGCS should build its football methodology, pathway, workflow and
decision-evidence layers. It should integrate, rather than recreate, global match
data, professional video infrastructure and wearable hardware.

The user approved the A–D direction on 2026-09-06. ADR-0021–0024 record the
accepted product, domain, authorisation/sensitive-data and provider-neutral
intelligence boundaries. P0.1a and the BL-042/P0.1b compatibility adapter and scope
selector are implemented in the repository and deployed to the approved local
environment after backup/restore and parity verification. Later roadmap phases,
suppliers and production rollout still require their own approval gates.

## Research basis and limits

The benchmark uses public, official product documentation available on
2026-09-06. Vendor claims are treated as product-positioning evidence, not as an
independent validation of accuracy or outcomes. Pricing, contractual terms, data
coverage by competition, API rights and Turkish/EU hosting options remain `TBD`
until a procurement discovery is performed.

Relevant official sources include:

- [Teamworks platform](https://teamworks.com/platform)
- [Kitman Labs Intelligence Platform](https://www.kitmanlabs.com/)
- [Hudl product portfolio](https://www.wyscout.hudl.com/products)
- [Hudl Wyscout](https://www.wyscout.hudl.com/products/wyscout)
- [Hudl StatsBomb](https://www.wyscout.hudl.com/products/statsbomb)
- [Hudl Sportscode](https://www.hudl.com/products/sportscode)
- [Catapult football products](https://www.catapult.com/sports/football)
- [SkillCorner Game Intelligence](https://skillcorner.com/products/football/game-intelligence)
- [Spiideo AutoData](https://www.spiideo.com/autodata/autodata-soccer/)
- [SoccerLAB](https://www.soccerlab.com/)
- [Once Sport football analysis](https://once.sport/football-video-analysis/)
- [Coach Paint](https://www.coachpaint.com/es/)
- [Playermaker](https://www.playermaker.com/)
- [Tonsser](https://tonsser.com/)
- [SAP Sports One documentation](https://help.sap.com/docs/SAP_SPORTS_ONE/fa508de51ca44608bf3fc57f8a5ea212/52c59550c6a14e95a68e36cfa4224f07-107.html?locale=en-US&state=PRODUCTION&version=Latest)
- [FIFA EPTS standard data format](https://football-technology.fifa.com/innovation/standards/epts/research-development-epts-standard-data-format)
- [FIFA/FIFPRO player-data guidance](https://inside.fifa.com/innovation/standards/epts/fifa-and-fifpro-develop-standards-on-management-of-personal-player)
- [Premier League EPPP player pathway](https://www.premierleague.com/en/news/2920464/elite-player-performance-plan-eppp-player-pathway)
- [FIFA talent-development guidance](https://publications.fifa.com/en/talent-development/train-the-talents/)
- [EU GDPR, Articles 5 and 9](https://eur-lex.europa.eu/eli/reg/2016/679/2016-05-04/eng)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)

## 1. New NGCS Product Vision

### Product promise

> NGCS gives every authorised football practitioner one shared, historical and
> evidence-backed view of how the club develops players and teams—from academy to
> first team—and turns observations into the next coordinated action.

### Primary customers

- Professional clubs operating a first team and academy.
- Multi-team academies that need a governed pathway to senior football.
- In a later SaaS phase, federations or club groups; this is not a P0 requirement.

### Primary users and jobs

| User                   | Decision or job NGCS must support                                          |
| ---------------------- | -------------------------------------------------------------------------- |
| Sporting director      | Build a sustainable squad and pathway aligned with the club model          |
| Academy director       | See whether every player receives the right development exposure           |
| Head/assistant coach   | Plan, deliver and review football work quickly                             |
| Analyst                | Turn match/video evidence into coach- and player-ready insight             |
| Performance staff      | Put measured load and readiness in training context                        |
| Medical staff          | Manage restricted health workflows and publish only necessary availability |
| Scout/recruitment lead | Find and compare candidates against explicit squad needs                   |
| Team manager           | Coordinate people, events and operational readiness                        |
| Player                 | Understand schedule, feedback, goals and approved development evidence     |

### Product principles

1. Player history is never reduced to the player's current team.
2. Football language is configurable, versioned and club-owned.
3. Every recommendation shows its evidence, provenance and uncertainty.
4. Medical facts and sporting availability are separate information products.
5. Mobile and pitch-side actions are short; deep analysis remains desktop/tablet-first.
6. Integrations do not define the canonical NGCS domain.
7. Dashboards answer decisions, not the availability of data.

## 2. Football Technology Competitor Benchmark

| Platform/category        | Core problem and principal users                                                       | Strong workflow                                                                         | Lesson for NGCS                                                                     | Boundary for NGCS                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Teamworks                | Connected operations, personnel, athlete performance and communication for elite sport | Shared identity/calendar data flows across specialist products; unified activity centre | A common platform foundation and one front door matter more than identical screens  | Do not build payments, collegiate compliance or every adjacent operations product        |
| Kitman Labs              | Integrated performance medicine, optimisation, coaching/development and pathways       | One player record connects development, medical, performance and operations             | Make the player pathway and development process first-class, not a reporting add-on | Do not claim predictive readiness or injury insight before data and models are validated |
| SAP Sports One           | Broad club/team administration, scouting, training, fitness and health                 | Role permissions are separated from the scope of data a role may see                    | Use capability plus data-scope authorisation and configurable club processes        | Avoid ERP-style generic forms and country-specific assumptions in the core               |
| SoccerLAB                | Football-centred centralisation, visualisation, video tagging and facility workflows   | Football data, video and operational information share one workspace                    | Preserve football context around every artefact                                     | Facility management is optional and later; it is not the initial differentiator          |
| Hudl / Sportscode        | Capture, coding, live/post-match analysis, sharing and coach communication             | Custom coding, video timelines, reports and telestration are one analyst workflow       | Video must link directly to observations, game-model concepts and feedback          | Do not rebuild a mature professional video editor or capture network                     |
| Wyscout                  | Global video/data search and recruitment evidence                                      | Search -> shortlist -> video verification -> report                                     | Keep recruitment pipeline and evidence in NGCS while linking provider assets        | Do not build or license a global competition video library from scratch                  |
| StatsBomb                | Detailed event/tracking data and football analytics                                    | Provider data synchronises with video and analysis tools                                | Retain metric definitions, source/version and video evidence together               | Do not imitate proprietary metrics or present provider metrics as club-owned truth       |
| Catapult                 | Wearable athlete monitoring plus video/performance analysis                            | Physical data is available in the context of sessions and match video                   | Build an ingestion/normalisation layer around sessions and players                  | Do not manufacture hardware or silently convert vendor data into medical conclusions     |
| SkillCorner              | Broadcast-derived tracking and off-ball/game-intelligence data                         | Event and tracking data expose space, pressure and off-ball behaviour                   | Add tactical context and role/game-model comparison to external data                | Do not make one provider's ontology the NGCS domain model                                |
| Spiideo                  | Automated capture, live analysis and synchronised event/tracking data                  | Clicking an event or visualisation retrieves the relevant clip                          | Make evidence retrieval nearly instantaneous                                        | Do not build automated cameras or a broadcast platform in the core                       |
| Once Sport / Coach Paint | Accessible tagging, coach boards, tracking and telestration                            | Fast visual explanation and export with a low learning curve                            | Keep NGCS tactical artefacts simple, reusable and presentation-ready                | Do not turn the current Konva board into a full video compositing suite                  |
| Playermaker              | Boot-mounted technical/physical tracking and player/coach feedback                     | Player-owned feedback and benchmarks after sessions                                     | Support player-facing goals and provider-neutral technical measurements             | Do not build sensor hardware or accept benchmark claims without provenance               |
| Tonsser                  | Youth player identity, exposure, community evidence and opportunity discovery          | Player portfolio -> exposure -> trial/showcase opportunity                              | A player-facing journey can improve engagement and evidence capture                 | Do not build a social network, public ranking or popularity-based talent score           |

### Market gap

The market is strongest in separate verticals: operations/AMS, video/data analysis,
recruitment libraries and sensing. The opportunity is not a feature-count contest.
It is a football-specific system of record for **why a decision was made**, linking
club method, coaching intervention, player pathway, evidence and subsequent outcome.

## 3. Features We Should Learn From Competitors

1. **One identity, calendar and activity stream.** A change should propagate to the
   workflows that need it without duplicate entry.
2. **Configurable football vocabulary.** Rubrics, tags, positions, roles and game
   principles must fit the club rather than a vendor's generic template.
3. **Data beside video.** A metric or observation should lead to the exact clip and
   vice versa.
4. **Player-centred longitudinal views.** Academy, first-team, medical, coaching and
   analysis contributions should compose a controlled Player 360 view.
5. **Workflow-specific mobile actions.** Attendance, availability, quick notes,
   ratings and acknowledgements should require seconds, not full forms.
6. **Provider-neutral ingestion.** External identifiers, source versions, units,
   quality checks and raw payload lineage must be retained.
7. **Configurable evaluation and recruitment pipelines.** Process should be
   consistent without freezing one club's terminology into code.
8. **Separate role permission from data scope.** “Physio” alone must not imply access
   to every athlete or every category of health information.

## 4. Features We Should NOT Copy

- A fifteen-item global sidebar that mirrors departments.
- A generic all-sports ERP experience dominated by tables and configuration screens.
- Proprietary hardware, global match-content acquisition or broadcast production.
- Black-box “readiness”, “potential” or injury-risk percentages with fake precision.
- An AI chat box without authorised source retrieval, citations and auditability.
- Broad medical visibility through ordinary coaching roles.
- Public youth ranking, social-network mechanics or popularity as scouting evidence.
- Collegiate compliance, NIL, ticketing, fan engagement, payroll and payments in the
  sporting-core roadmap.
- Automatic duplication of supplier dashboards inside NGCS.
- Microservices, data lake and real-time architecture before load and ownership demand them.

## 5. Proposed Club Operating Model

```text
Club (tenant/security boundary)
  Sporting Organisation
    Department (First Team, Academy, Recruitment, Performance, Medical...)
      Team (stable identity: First Team, B Team, U19, U17...)
        Team Season (the team's context in 2026/27)
          Squad / registration list
          Player and staff assignments with effective dates
```

Age labels are configuration, not enums. A club may operate U18 instead of U19 or
have women's, men's and mixed foundation pathways. A `Team` remains stable across
seasons; its `TeamSeason` holds season-specific squad, competitions, staff, game
model and objectives.

A person may have concurrent, typed assignments:

- `PRIMARY_REGISTERED`: primary squad registration.
- `TRAINING_GUEST`: e.g. a U17 player trains with U19.
- `MATCH_ELIGIBLE`: temporary match eligibility.
- `LOAN_OUT` / `LOAN_IN`.
- `INTERNATIONAL_DUTY`.
- Staff functions such as head coach, analyst or physio.

Every assignment has `effectiveFrom`, optional `effectiveTo`, reason, actor and
source. Promotion closes the former primary assignment and opens another; it does
not overwrite history.

## 6. Proposed Module Architecture

### Recommended shape

Keep NestJS, PostgreSQL, Prisma and the React application. Evolve the backend into a
modular monolith with these bounded contexts:

| Context                  | Owns                                                                  | Publishes/serves                            |
| ------------------------ | --------------------------------------------------------------------- | ------------------------------------------- |
| Identity & Access        | accounts, sessions, capabilities, scope grants                        | authorised actor and audit identity         |
| Organisation & Pathway   | club, teams, seasons, assignments                                     | current/historical roster and staff context |
| Football Model           | game-model versions, concepts, roles, position requirements           | club/team football vocabulary               |
| Coaching & Planning      | cycles, sessions, exercises, attendance                               | planned/delivered/reviewed work             |
| Player Development       | frameworks, assessments, IDPs, goals, reviews                         | development state and evidence links        |
| Competition & Match      | competitions, fixtures, selections, appearances                       | match facts and participation               |
| Analysis & Media         | video references, clips, tags, observations, playlists                | evidence packages                           |
| Recruitment              | squad needs, candidates, assignments, reports, pipeline               | governed recruitment decisions              |
| Performance              | metric definitions, measurements, loads, tests                        | sourced physical/performance facts          |
| Medical & Availability   | restricted clinical records, rehab, clearance, published availability | minimum necessary availability projection   |
| Workflow & Calendar      | tasks, acknowledgements, notifications, calendar projection           | role-specific work queue                    |
| Integration & Provenance | providers, external identities, imports, validation, lineage          | normalised source records and quality state |
| Intelligence             | authorised read models, queries, AI runs, recommendations             | cited, confidence-labelled decision support |

Cross-context state changes should initially use application services and a
transactional outbox, not a message-broker estate. Independent services become an
option only when scale, data isolation or vendor workloads justify them.

### Storage boundaries

- PostgreSQL: transactional football system of record.
- Object storage: videos, documents, images and exported boards; provider `TBD`.
- Search index: build later when cross-video/player search volume requires it.
- Analytical warehouse/lakehouse: build later for high-volume tracking/event data;
  do not place raw frame-level tracking in the operational database.
- Cache/queue: introduce only for measured workloads such as imports and media jobs.

## 7. Player 360 Architecture

Player 360 is a permission-filtered read model composed from domain owners, not one
wide mutable player table.

### Stable identity

- `Person`: identity and contact fields with a restricted visibility policy.
- `PlayerProfile`: football identity, preferred/secondary positions, foot and
  biographical attributes.
- External provider identities are mappings, never the canonical player ID.
- User login is optional; a player record must exist without a user account.

### Views

| View               | Content                                                   | Typical audience                         |
| ------------------ | --------------------------------------------------------- | ---------------------------------------- |
| Overview           | current team, role, availability projection, next actions | authorised sporting staff                |
| Pathway            | effective-dated teams, loans, guest sessions, promotions  | player, coaches, academy leadership      |
| Development        | IDP, goals, interventions, reviews, evidence              | player and assigned development staff    |
| Football profile   | roles, attributes, game-model fit evidence                | coaches, analyst, recruitment            |
| Training & matches | exposure, attendance, minutes, objectives                 | coaching/performance                     |
| Analysis & video   | observations, clips, playlists                            | role-scoped staff/player                 |
| Performance        | source-labelled measures and trends                       | performance staff, scoped coaches        |
| Availability       | sporting participation status and restrictions            | minimum necessary staff                  |
| Medical            | clinical record and rehabilitation details                | explicitly authorised medical staff only |
| History            | immutable timeline of material changes                    | scope-controlled auditors and leadership |

Facts, human assessments and derived indicators must be visually and technically
distinct. Each item carries author/source, observed-at time, valid period and later
corrections. Height and weight are measurements over time, not permanent columns.

## 8. Academy & Player Development Architecture

FIFA guidance emphasises long-term, age-appropriate development, while the Premier
League EPPP explicitly connects individual plans to technical, psychological,
physical and social development. NGCS should support club-configurable frameworks
without hard-coding EPPP or making amateur psychological diagnoses.

### Development loop

```text
Framework/Rubric Version
  -> observation or assessment
  -> agreed development goal
  -> intervention (session, exercise, video, mentoring)
  -> evidence
  -> scheduled review
  -> continue, revise, achieve or close
```

### Key concepts

- `DevelopmentFramework`: club-owned dimensions and vocabulary.
- `AssessmentTemplateVersion`: age/position/team-appropriate rubric.
- `Assessment`: dated human evaluation; later evaluation never overwrites it.
- `DevelopmentPlan`: time-boxed player plan with participants and review cadence.
- `DevelopmentGoal`: desired observable behaviour, baseline, target evidence and status.
- `Intervention`: training, match exposure, video task or staff action linked to a goal.
- `DevelopmentEvidence`: observation, clip, assessment, metric or player reflection.
- `ProgressionReview`: multidisciplinary decision, rationale and unmet criteria.

### Pathway to First Team

Do not show “72% ready” unless a club approves a validated scoring model. Default
states should be `Not assessed`, `Evidence gathering`, `Progressing`, `Review due`,
`Ready for exposure`, `Ready for decision` or `Blocked`, with:

- role/position requirements for the destination team;
- fulfilled and unfulfilled criteria;
- evidence freshness and coverage;
- exposure to older/first-team training and matches;
- explicit human decision and rationale.

## 9. Coaching & Training Architecture

### Planning hierarchy

```text
Season Plan
  -> Phase / Mesocycle
    -> Microcycle
      -> Training Session
        -> Session Block
          -> Exercise Version Snapshot
```

The terms must be configurable because clubs use different periodisation language.
The underlying relationships should remain stable.

### Session lifecycle

`DRAFT -> REVIEWED -> PUBLISHED -> IN_PROGRESS -> DELIVERED -> REVIEWED/CANCELLED`

Each session connects:

- team season plus invited/removed individuals;
- football, technical, physical and development objectives;
- versioned exercises and tactical boards;
- planned duration/intensity and measured external load;
- attendance and participation modification;
- coach observations and post-session review;
- linked game-model principles and recent match findings.

The current `TrainingPlan`, `PlanDrill`, `Attendance` and drill library should remain
operational behind a compatibility layer while this richer model is introduced.
Exercise content must be versioned or snapshotted when assigned, preserving the
current `boardSnapshot` invariant.

## 10. Tactical / Game Model Architecture

`ClubGameModel` should become a central, versioned concept, with optional team
adaptations:

```text
Club Philosophy
  -> Game Model Version
    -> Game Moment
      -> Principle
        -> Sub-principle
          -> observable behaviour / coaching cue
```

Recommended game moments are configurable but may start with in-possession,
out-of-possession, attacking transition, defensive transition and set pieces.

Additional objects:

- `RoleProfile`: expectations for a football role, not merely a field position.
- `TacticalPattern`: reusable pattern with board/video evidence.
- `TeamGameModelAdoption`: which model/version a team season uses and its adaptations.
- `TacticalObservation`: observed adherence/deviation with evidence and author.

The current `TacticalBoardDocumentV1` remains a useful visual artefact. It should be
linked to principles, sessions, matches and clips. It should not become the source
of truth for formations, player assignments or video annotations.

## 11. Match & Video Analysis Architecture

### Match workflow

1. Fixture imported/created and reconciled to competition/team season.
2. Pre-match brief: expected opponent, own objectives, selection, roles and set pieces.
3. Match facts: lineup, appearances, positions, substitutions, cards and goals.
4. Provider events/tracking retained with source, version and quality status.
5. Analysts create observations and link exact time ranges/clips.
6. Staff review team/player/game-model findings.
7. Approved findings create development, training or recruitment actions.

### Video model

- `MediaAsset`: owned or provider-referenced asset and rights metadata.
- `VideoTimeline`: timing alignment and periods.
- `VideoClip`: non-destructive in/out reference, not a duplicated video by default.
- `TagSchemaVersion` and `Tag`: club vocabulary and time-coded values.
- `AnalysisObservation`: human finding linked to player/team, principle, match moment,
  clip, confidence and follow-up.
- `Playlist`: ordered, audience-scoped clips with presentation notes.

Professional capture, transcoding, tracking and telestration should initially be
integrations. NGCS owns the workflow, context and evidence graph.

## 12. Opposition Analysis

Create an `Opponent` workspace distinct from internal teams. It should contain:

- identity resolution across providers;
- recent-match set and data-coverage status;
- versioned style/profile observations;
- preferred and alternative formations;
- build-up, pressing, transitions, rest-defence and set-piece patterns;
- key player tendencies and uncertainty;
- clips and analyst notes;
- expected XI scenarios, never presented as fact before confirmation.

An `OpponentMatchPlan` ties the opponent snapshot to one fixture, the selected
version of our game model, our objectives, own tactical plan and training actions.
The snapshot prevents later opponent-profile edits from rewriting historical match
preparation.

## 13. Scouting & Recruitment

### Pipeline

`IDENTIFIED -> MONITORING -> ASSIGNED -> SCOUTED -> SHORTLISTED -> TECHNICAL_REVIEW
-> SPORTING_REVIEW -> DUE_DILIGENCE -> CONTACT -> NEGOTIATION -> SIGNED/REJECTED/HOLD`

Statuses and gates are club-configurable; permissions and mandatory evidence are
not optional bypasses.

### Domain

- `SquadNeed`: team season, football role, priority, horizon and rationale.
- `Candidate`: external person identity resolved across providers.
- `ScoutingAssignment`: match/video/live assignment, scout and due date.
- `ScoutingReport`: rubric version, observations, evidence and recommendation.
- `CandidateEvaluation`: current ability, potential horizon and confidence; these are
  human assessments unless explicitly sourced otherwise.
- `Watchlist` / `Shortlist`: governed collaborative lists.
- `RecruitmentDecision`: stage decision, approvers, rationale and conflicts.
- `NegotiationCase`: restricted commercial state; detailed finance scope remains `TBD`.

Candidate-to-current-player comparison must use the same role requirement and metric
definitions, show coverage differences and never blend incomparable competitions
without an explicit normalisation method.

## 14. Performance & Availability

### Performance data contract

Every measurement must include athlete, session/match, source, metric definition,
unit, measurement time, ingestion time, provider version and quality flags.
`MetricDefinition` distinguishes raw measures, validated transformations and club
interpretations.

Do not place frame-level tracking in Prisma tables. Store provider payloads in an
ingestion store, normalise approved aggregates and retain lineage. FIFA's EPTS work
supports a provider-comparable transfer format, but actual vendor compliance and
contractual export rights must be verified before selection.

NGCS should not prescribe acute/chronic ratios, workload thresholds or recovery
actions by default. Clubs define methods; derived indicators show formula version,
window, missing data and responsible practitioner.

### Medical separation

Use two products:

1. **Sporting Availability Projection:** `AVAILABLE`, `MODIFIED`, `UNAVAILABLE`,
   `RETURNING`, `SUSPENDED`, `INTERNATIONAL_DUTY`, plus effective dates and permitted
   training/match constraints. Coaches see only what they need.
2. **Restricted Medical Record:** injury/illness episode, examination, treatment,
   rehabilitation, return-to-training/play clearances and clinical notes.

Health data is a special category under GDPR Article 9. Its lawful basis,
professional-secrecy model, retention, residency, subject rights, incident process
and minor/guardian policy are `TBD` and require explicit legal/privacy approval
before implementation. Every read and export needs a reasoned audit event.

## 15. Sporting Director Experience

The leadership home should be an action-and-decision workspace, not a chart wall.

### Questions it answers

- Where are squad gaps this season and in the next two season scenarios?
- Which academy players have enough current evidence for a progression review?
- Which positions have expiring contracts, weak depth or no internal successor?
- Where is player availability affecting football plans?
- Which teams are not receiving the intended development exposure?
- Which recruitment cases need a decision and what evidence is missing?
- How is the club game model being taught and observed across teams?

### Core experiences

- `Squad Planner`: current, backup, academy option and target per football role.
- `Pathway Board`: player transitions, exposure and review readiness.
- `Decision Inbox`: approvals, overdue reviews, evidence gaps and conflicts.
- `Portfolio Scenarios`: current season plus future scenarios; no automatic commitment.
- `Club Model Coverage`: linked training/observations by team, with data-quality caveats.

## 16. AI Football Intelligence Layer

### Principle

AI is an authorised reasoning interface over NGCS evidence. It is not a new source of
player facts and must not directly mutate sporting or medical records.

### Answer contract

Every response is structured as:

1. **Facts:** source-linked records and “as of” time.
2. **Interpretation:** explicitly labelled synthesis.
3. **Recommendation:** optional next action, never a hidden decision.
4. **Confidence and limitations:** coverage, freshness and contradictory evidence.
5. **Sources:** record IDs, clips, metric definitions and documents used.

### Architecture

- Capability-filtered retrieval and tool gateway; authorisation is enforced before
  retrieval, not only in the generated answer.
- Semantic index contains access-control metadata and deletions propagate to it.
- Structured football queries use governed read models; documents use retrieval.
- Prompt/model/tool versions, source set, user, purpose and outcome are audited.
- High-risk actions require human confirmation and domain-service validation.
- Evaluation sets cover hallucination, cross-club leakage, medical leakage, stale
  evidence, prompt injection and unsupported recommendations.

NIST's AI RMF emphasises validity, reliability, transparency, explainability,
privacy and ongoing governance. Those controls should be adopted proportionally.

### Delivery order

1. Cited summaries of existing records and preparation packs.
2. Natural-language retrieval over authorised players, sessions, matches and clips.
3. Transparent comparison and recurring-pattern detection.
4. Suggested training/development actions for human acceptance.
5. Limited write assistants that produce drafts only, after separate approval.

Prohibited until separately approved: medical diagnosis, automatic injury-risk
claims, autonomous squad selection, player release/contract decisions, hidden
potential scores and any answer that cannot show its evidence boundary.

## 17. Recommended Information Architecture / Navigation

### Global frame

- Persistent scope switcher: `Club -> Season -> Team`.
- Global search/command palette: authorised people, teams, events and artefacts.
- Activity centre: assignments, approvals, changes and acknowledgements.
- Six adaptive primary destinations:
  - **Today** — personal schedule and action queue.
  - **Teams** — team context and football work.
  - **Players** — directory and Player 360.
  - **Work** — calendar, training, matchday, analysis and recruitment work queues.
  - **Intelligence** — governed questions, reports and comparisons.
  - **More** — club model, administration and integrations, permission-dependent.

Recruitment, performance and medical practitioners receive role-specific shortcuts
and home queues without adding permanent global items for every department.

### Context navigation

**Player:** Overview | Development | Training & Matches | Analysis & Video |
Performance | Availability | History; Medical appears only for explicit capability.

**Team season:** Overview | Squad | Plan | Training | Matches | Game Model |
Analysis | Development | Performance | Calendar.

**Match:** Preparation | Selection | Our Plan | Opposition | Live/Events | Review |
Video | Actions.

**Mobile:** Today | Calendar | Team | Players | More. Pitch-side quick actions use
optimistic local drafts and an explicit sync state; full offline mode remains `TBD`
until workflows and conflict policy are approved.

The existing nine-route coach workspace becomes the initial `Team/Work` experience;
it is not discarded.

## 18. Recommended Domain Model Changes

### P0 canonical foundation

| Aggregate/entity                    | Purpose                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------- |
| `Club`                              | tenant and policy boundary; extend existing                                |
| `Person`                            | stable human identity independent of login or sporting role                |
| `UserAccount`                       | authentication identity linked optionally to Person; evolves existing User |
| `PlayerProfile`, `StaffProfile`     | role-specific attributes without conflating person/account                 |
| `Season`                            | club season with lifecycle; extend existing                                |
| `Team`                              | stable organisational football team with configurable category             |
| `TeamSeason`                        | season-specific team context                                               |
| `Assignment`                        | effective-dated player/staff relationship and assignment type              |
| `RoleDefinition`, `CapabilityGrant` | configurable function and data-scope authorisation                         |
| `ExternalIdentity`                  | provider identifier mapping with source and validity                       |
| `AuditEvent`                        | actor, purpose, scope and material change/access evidence                  |

### Football and work aggregates

| Context              | Core entities                                                                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Football Model       | `GameModel`, `GameModelVersion`, `TacticalConcept`, `RoleProfile`, `PositionRequirement`                                                                 |
| Coaching             | `PlanningCycle`, `TrainingSession`, `SessionBlock`, `Exercise`, `ExerciseVersion`, `Objective`, `Participation`                                          |
| Development          | `DevelopmentFramework`, `AssessmentTemplateVersion`, `Assessment`, `DevelopmentPlan`, `DevelopmentGoal`, `Intervention`, `Evidence`, `ProgressionReview` |
| Match                | `Competition`, `Fixture`, `Selection`, `Appearance`, `MatchFact`, `MatchPlan`                                                                            |
| Analysis             | `MediaAsset`, `VideoTimeline`, `VideoClip`, `TagSchemaVersion`, `AnalysisObservation`, `Playlist`                                                        |
| Opposition           | `ExternalTeam`, `OpponentProfileVersion`, `OpponentMatchPlan`                                                                                            |
| Recruitment          | `SquadNeed`, `Candidate`, `ScoutingAssignment`, `ScoutingReport`, `CandidateEvaluation`, `PipelineCase`, `RecruitmentDecision`                           |
| Performance          | `MetricDefinition`, `MetricObservation`, `TestProtocolVersion`, `PerformanceTest`, `DataQualityIssue`                                                    |
| Availability/Medical | `AvailabilityPeriod`, `ParticipationRestriction`, restricted `MedicalEpisode`, `RehabPlan`, `ClearanceDecision`                                          |
| Workflow             | `WorkItem`, `Approval`, `Notification`, `CalendarProjection`                                                                                             |
| Integration          | `Provider`, `ImportJob`, `SourceRecord`, `ReconciliationIssue`, `ConsentOrRightsRecord`                                                                  |

### Historical rules

- Material assessments, models, exercises, plans and rubrics use immutable versions.
- Membership, position/role use and availability use valid-time ranges.
- Corrections append provenance; they do not silently rewrite published decisions.
- Reports specify `asOf`, source coverage and definition versions.
- Calendar is a projection referencing owner records, not a second source of truth.
- All tenant-owned aggregates carry/enforce club scope even if it can be reached by
  relationship; defence in depth must not rely only on controller filters.

### Migration strategy

Introduce the P0 foundation additively. Map each current `PlayerGroup` to an initial
`Team` and `TeamSeason`, and each `GroupMember` to an `Assignment`. Keep current IDs
and API compatibility until parity, reconciliation and rollback gates pass. Removal
of old structures is a later, separately approved migration.

## 19. Existing NGCS Modules -> New NGCS Mapping

| Existing capability/model                            | Decision                                                 | Target                                                                            |
| ---------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Auth, invitation, reset, refresh sessions            | **EXTEND**                                               | Person/account separation, capability grants, stronger scoped audit               |
| `Club`                                               | **KEEP + EXTEND**                                        | tenant policies, sporting organisation and configuration                          |
| `PlayerGroup`, `GroupMember`                         | **REBUILD**                                              | Team, TeamSeason and effective-dated Assignment; temporary compatibility layer    |
| `Season`, `WeekPlan`, `DayPlan`                      | **EXTEND / MERGE**                                       | Season plus planning cycles and unified calendar projection                       |
| `TrainingPlan`, `PlanDrill`                          | **REBUILD incrementally**                                | TrainingSession, SessionBlock and ExerciseVersion snapshot                        |
| `Attendance`                                         | **KEEP + EXTEND**                                        | participation, modification, minutes and reason with existing uniqueness retained |
| `Drill` and library                                  | **EXTEND**                                               | Exercise + immutable versions + objective/game-model/development links            |
| Tactical Board V1                                    | **KEEP + EXTEND**                                        | reusable media artefact linked to model/session/match; not canonical lineup data  |
| `Match`                                              | **EXTEND**                                               | Fixture, selection, appearance, plan, opponent snapshot and review                |
| Socket events                                        | **MERGE**                                                | authorised activity/notification context with durable work items where needed     |
| Stats endpoints                                      | **MERGE**                                                | decision-specific read models and metric definitions                              |
| `PlayerLoad`, `PlayerPerformance`, `TeamPerformance` | **REBUILD**                                              | sourced metric observations, definitions and data-quality lineage                 |
| `VideoAnalysis`, `AnalysisReport`, `MatchAnalysis`   | **REBUILD**                                              | media/timeline/clip/tag/observation/playlists                                     |
| `ScoutingReport` prototype                           | **REBUILD**                                              | candidate identity, assignments, rubric versions, reports and pipeline            |
| Health log/status/note prototypes                    | **REMOVE from ordinary sporting surface; REBUILD later** | availability projection plus isolated medical context after privacy approval      |
| React/shadcn coach shell and routes                  | **EXTEND**                                               | context navigation and adaptive workspaces; retain the visual system              |

No destructive removal is authorised by this proposal.

## 20. Missing Modules

### Foundation blockers

- Person/account separation.
- Stable team and season-specific team model.
- Effective-dated player and staff assignments.
- Functional staff roles, capabilities and data-scope grants.
- External identity resolution and provenance.
- Immutable/versioned football definitions.

### Football-product gaps

- Club/team Game Model and football-role profiles.
- Planning cycles and delivered-session review.
- Development frameworks, IDP, goals, evidence and progression review.
- Match selection, appearances, minutes and post-match action loop.
- Media/video asset, clip, tag and playlist layer.
- Opposition workspace and fixture snapshot.
- Squad needs, candidate identity and recruitment workflow.
- Sporting director squad/pathway planning.
- Provider-neutral performance ingestion and data quality.
- Separated availability and medical systems.
- Unified calendar projection, work queue and approvals.
- Player portal and governed feedback acknowledgement.
- Intelligence read models, retrieval, evaluations and AI audit.

## 21. Build vs Integrate Matrix

| Capability                                 | Decision                             | Rationale / initial approach                                            |
| ------------------------------------------ | ------------------------------------ | ----------------------------------------------------------------------- |
| Club/team/season/pathway model             | **BUILD INTERNALLY**                 | canonical identity and history are product core                         |
| Game Model and football ontology           | **BUILD INTERNALLY**                 | principal differentiator and club-owned language                        |
| Training, exercise and attendance workflow | **BUILD/EXTEND INTERNALLY**          | existing strength and closed-loop anchor                                |
| Player development/IDP/evidence            | **BUILD INTERNALLY**                 | principal differentiator                                                |
| Match planning, review and action loop     | **BUILD INTERNALLY**                 | connects model, training and evidence                                   |
| Recruitment workflow and squad needs       | **BUILD INTERNALLY**                 | club decision process is core                                           |
| Global player/match data                   | **INTEGRATE**                        | Wyscout/StatsBomb/other provider shortlist `TBD`                        |
| Event and tracking data                    | **INTEGRATE**                        | high acquisition/normalisation cost; keep provider-neutral contract     |
| GPS/EPTS and boot sensors                  | **INTEGRATE**                        | hardware and measurement validation are specialist capabilities         |
| Professional video capture                 | **INTEGRATE**                        | Hudl/Spiideo/Catapult/other selection `TBD`                             |
| Video storage/transcoding/CDN              | **INTEGRATE MANAGED INFRASTRUCTURE** | rights, scale and reliability; provider `TBD`                           |
| Basic board diagrams and board export      | **BUILD/EXTEND**                     | already working and useful in workflow                                  |
| Advanced telestration/tracking/editor      | **INTEGRATE / DEEP LINK**            | mature specialist capability; do not rebuild initially                  |
| Medical EMR                                | **BUILD LATER or INTEGRATE**         | decide after legal, clinical and workflow discovery                     |
| Sporting availability projection           | **BUILD INTERNALLY**                 | minimum necessary coordination boundary                                 |
| Messaging/chat                             | **BUILD LATER / INTEGRATE**          | notifications first; avoid becoming a chat platform                     |
| AI summarisation/retrieval                 | **BUILD LATER on governed data**     | differentiated context, but foundation and evaluation first             |
| Computer vision/event detection            | **DO NOT BUILD NOW**                 | integrate provider outputs; reassess only with unique data/right-to-use |
| Fan, ticketing, payroll, payments, NIL     | **DO NOT BUILD**                     | outside sporting-core strategy                                          |

## 22. Competitive Differentiators

1. **Football Decision Graph.** Every principle, goal, session, observation, clip,
   assessment and decision is traceably connected.
2. **Academy-to-first-team memory.** Effective-dated pathway and evidence survive
   team, season, coach and model changes.
3. **Club-owned football language.** Versioned Game Model, roles, rubrics and tags
   align recruitment, coaching and development without forcing a generic ontology.
4. **Evidence, not fake certainty.** Coverage, freshness, provenance and human
   judgement are visible; readiness is a governed decision before it is a score.
5. **Availability without medical oversharing.** Coaches receive actionable sporting
   constraints while clinical detail remains isolated.
6. **Vendor-neutral intelligence.** The club can change data/video/sensor providers
   without losing its development and decision history.
7. **AI with a source trail.** Facts, interpretation, recommendation, confidence and
   evidence are separated by contract.
8. **Role-adaptive workspaces.** One product feels like a coach tool, analyst tool or
   director tool based on the job and context, not a generic admin panel.

The first two differentiators should guide product sequencing; the others protect
trust and switching flexibility.

## 23. Proposed Development Roadmap

Dates, team capacity, owner and release names are `TBD`.

| Priority                          | Outcome                                                   | Major scope                                                                                                               | Exit evidence                                                                                                 |
| --------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **P0 — Foundation**               | Trustworthy club, team, person, season and history kernel | Person/account split; Team/TeamSeason; effective-dated assignments; capability scopes; provenance; audit; context shell   | Existing MVP parity; cross-club/role tests; U17-to-U19 history scenario; additive migration/rollback evidence |
| **P1 — Core Football Operations** | Team operates its season in NGCS                          | unified calendar; cycles/sessions; exercise versions; selection/appearances/minutes; match planning/review; Game Model v1 | plan-to-delivery-to-review flow; match-to-next-session action; tablet/mobile critical paths                   |
| **P2 — Player Development**       | Academy development is explicit and reviewable            | development framework; assessments; IDP/goals/interventions/evidence; progression review; player view                     | six-month historical comparison; older-team exposure; evidence-based progression review without fake score    |
| **P3 — Analysis & Scouting**      | Evidence and recruitment decisions share football context | video references/clips/tags/playlists; opposition; squad needs; candidate identity; scouting pipeline/comparison          | provider asset deep link; opponent plan; candidate-vs-squad-role comparison with coverage warnings            |
| **P4 — Intelligence & AI**        | Authorised decision support reduces preparation time      | decision read models; cited search/summaries; comparison; pattern discovery; evaluation/audit                             | no cross-scope leakage; citation accuracy and hallucination thresholds; human acceptance workflow             |
| **P5 — Advanced Integrations**    | High-volume specialist data enriches the loop             | selected GPS/EPTS, event/tracking, capture/video, medical integration; warehouse/search as required                       | provider reconciliation, quality SLAs, export/exit plan, privacy/security review                              |

P0 is not a broad UI rewrite. P1–P5 depend on P0 identity, history, scope and
provenance. Medical and AI may not enter production merely because their roadmap
priority is reached; their separate approval gates remain.

## 24. Recommended First Implementation Phase

### Phase name

**P0.1 — Sporting Foundation and Pathway Proof**

Implementation note (2026-09-06): the additive sporting kernel, capability API,
Teams/Players workspaces and pathway proof are the verified P0.1a slice. BL-042
adds the transactional legacy adapter, read-only parity report and persistent
Club/Season/Team selector in P0.1b. Repository exit and the approved local rollout
are verified; production remains a separate gate. See the
[local rollout report](../30-quality/P01_LOCAL_ROLLOUT_2026-09-06.md) and
[compatibility contract](../10-architecture/P01B_COMPATIBILITY_CUTOVER.md).

### Objective

Prove that NGCS can represent one club across configurable teams and seasons, move a
player through temporary and permanent assignments without losing history, and
compose an authorised Player 360 overview—while every current MVP flow remains
operational.

### Required decisions before implementation

1. **Phase 2 product boundary:** supersede the narrow long-term implication of
   ADR-0002 while retaining its completed MVP as the baseline.
2. **Organisation/domain migration:** approve Person, Team, TeamSeason and
   effective-dated Assignment as canonical concepts and the compatibility strategy.
3. **Authorisation model:** approve functional roles plus capabilities/data scopes;
   role names alone will no longer be the full policy.
4. **Sensitive-data boundary:** approve that P0 stores sporting availability only;
   medical, safeguarding and minor-data policy remains a separate gated design.

These should be recorded as Proposed ADRs and accepted before schema/runtime work.

### In scope

#### Domain and database

- Add `Person`, `PlayerProfile`, `StaffProfile`, `Team`, `TeamSeason`, `Assignment`
  and `ExternalIdentity` through an additive migration.
- Make age/category club-configurable; seed mappings only from existing data.
- Map current `PlayerGroup` and `GroupMember` records into the new structures with
  deterministic reconciliation evidence.
- Preserve existing records and IDs through a compatibility mapping; no destructive
  removal.
- Add capability/scope grants required for team, player and history reads/writes.
- Add material-change audit entries for assignments and permission grants.

#### Backend/API

- Club/team-season context endpoints.
- Team roster endpoint with current and effective-date views.
- Player directory plus Player 360 overview/history read model.
- Assignment create/end/transition service with overlap and tenant invariants.
- Compatibility adapters so current group, season, training, attendance and match
  routes continue to function.
- Tenant, team-scope, assignment-overlap, mass-assignment and historical-query tests.

#### Frontend

- Add a Club/Season/Team scope switcher to the current shell.
- Introduce Teams and Players workspaces using the current shadcn visual language.
- Player Overview shows identity, current assignments, pathway timeline, current
  sporting availability and existing training/match evidence where present.
- Team workspace shows current roster and staff assignments.
- Existing coach routes remain accessible as the first Team/Work experience.
- 1440 px, 1024 px and 390 px verification; fast read/selection on mobile.

#### Pathway proof scenario

Demonstrate one player with:

1. primary U17 membership in season A;
2. U19 training-guest assignment without losing U17 membership;
3. permanent U19 promotion with actor, reason and date;
4. a later first-team training invitation;
5. an unbroken timeline and correct `as of` roster answers at every step.

No readiness percentage is included. The thin slice may show evidence coverage and a
human-entered progression decision only.

### Explicitly out of scope

- Medical diagnoses, clinical notes, injury prediction or rehabilitation workflow.
- Full IDP/assessment engine; only the pathway proof needed by the foundation.
- Scouting pipeline, global player database or commercial negotiations.
- GPS/EPTS, event/tracking or automated video ingestion.
- AI copilot, embeddings or automated recommendations.
- Professional video hosting, transcoding, computer vision and telestration.
- Destructive removal of `PlayerGroup`/`GroupMember` or public API breakage.
- Production hosting/provider decisions.

### Delivery sequence

1. Accepted ADRs, glossary and domain invariants.
2. API/read-model contract tests and migration rehearsal design.
3. Additive schema plus deterministic backfill in disposable PostgreSQL.
4. Assignment and authorisation domain services.
5. Compatibility adapters and regression gates.
6. Player/Team read models and context navigation.
7. Pathway proof E2E, accessibility/responsive review and CDSK reconciliation.
8. Retained-environment rollout only after explicit migration approval.

### Acceptance criteria

- A player and staff member can exist without an application login.
- A team persists across seasons while roster/staff membership changes historically.
- Concurrent guest and primary assignments are allowed; conflicting primary
  assignments follow an explicit invariant and return a deterministic error.
- `asOf` queries reproduce prior team membership and player timeline.
- All new objects are club-scoped and two-club negative tests pass.
- Capability tests prove that coach, academy director, scout, performance and medical
  boundaries do not collapse into one broad role.
- Existing login, week, training, drill, attendance, tactics and match critical flows
  remain green through the compatibility layer.
- Migration deploy/diff/backfill checks pass on disposable PostgreSQL; rollback is
  rehearsed without destructive retained-data assumptions.
- Player 360 exposes no medical detail and labels missing evidence rather than
  calculating a readiness score.
- CDSK validator, unit/integration/E2E, typecheck, lint and build gates pass.

### Risks and mitigations

| Risk                                            | Mitigation                                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| Dual-write drift between groups and assignments | One canonical write service, reconciliation job and temporary parity metrics          |
| Role migration broadens access                  | Deny-by-default capabilities, two-club fixtures and negative tests before UI exposure |
| Person merge creates identity errors            | No automatic merge; explicit reconciliation case and audit trail                      |
| Scope grows into full Player 360                | Freeze P0 fields/views and defer specialist tabs to later priorities                  |
| Historical queries become slow                  | Correct effective-date indexes first; read projections only after measured need       |
| Existing dirty worktree obscures change         | Isolate implementation commits after current MVP stabilisation changes are reconciled |

### Approval gate

Implementation must stop here. Approval of the four required decisions authorises
preparation of Proposed/Accepted ADRs and a detailed implementation plan; it does
not by itself approve medical data processing, a third-party contract, production
deployment or advanced AI.
