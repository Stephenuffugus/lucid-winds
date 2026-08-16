# INCOMING — three planned builds (handoff to the Opus build session)

Planned 2026-08-16 by the Fable planning session with Stephen; deepened to
implementation level the same night (plans are v2). Three project drops from
Claude Chat, each audited against its source at line level and given a
BUILD-PLAN.md with locked decisions, function-level specs, and gated phases.

**Read `PORTAL-CONTRACT.md` (this folder) before wiring anything to the
portal** — it is the integration contract verified against the LIVE portal
code on 2026-08-16 (game cards are framed + need the sws:ready protocol;
Free Apps shelf is direct links with no bridge). The old NEW_SATELLITE_BRIEF
is stale; never build to it.

## The rule of the night: ONE PROJECT AT A TIME

Finish a project's phases (or park it at a clean, pushed gate) before opening
the next. Never two projects mid-flight — the codespace can stop at any time.

**Commit AND push after EVERY phase gate.** No exceptions. Save memory every
30 minutes (repo law).

## Build order (locked default)

1. **`bandits-box/`** — ASMR quiet-fidget app, 21 toys, friction engine.
   Stephen's priority. Ships framed on the arcade grid (embed protocol
   required). Landmines: `window.storage` is an artifact-sandbox API
   (settings silently do not persist in real browsers); the switch wall
   bypasses the `feel()` dispatch. `SFX-SHOT-LIST.md` in the folder is
   Stephen's foley recording guide — the sample-first pipeline is already
   wired, it just has no recordings.
2. **`hush/`** — evidence-honest sleep-sound PWA, five versions deep. Ships
   at `/hush/` on the Free Apps shelf (direct link, no bridge). Landmines:
   its sw.js deletes every cache on the origin (would black-screen the
   fleet), PWA identity collision — fix before ANY deploy. The audit tests
   its handoff cites did NOT ship; phase B rebuilds them from the stated
   invariants (all enumerated in the plan).
3. **`marblebeat/`** — marble-drop polyrhythm sequencer, merges INTO PadLab
   as a 4th "Marble" tab (instrument + "Show my beat" ghost visualizer).
   Merge is specced at function level: `marbleTick` inside `schedulerTick`,
   voices reparented to drumBus/instrBus, state v3→v4, `mb-` id prefixes
   (`app`/`playBtn` collide), hidden-canvas resize on tab switch.

Each folder: the original drop (spec/handoff/research + prototype) plus
`BUILD-PLAN.md`. Read the BUILD-PLAN first; it tells you the reading order
for the rest and its decisions are locked defaults — Stephen can veto, the
build session does not re-litigate.

## Resources that already EXIST (do not rebuild these)

- `PORTAL-CONTRACT.md` — verified portal integration contract (this folder).
- `scripts/hush_audit.js` — Hush invariant gate, BUILT AND GREEN: 155
  assertions against the real file (programs, tiers, guide routes,
  shortlist, safety defaults, Schade constants, vbpm clamp, 24-hour
  fallback, session reset, importer fixtures incl. the unit-inference
  trap). Watched red in three deliberate breaks. Run:
  `node scripts/hush_audit.js` (point it at `hush/index.html` post-port).
- `scripts/padlab_smoke.mjs` — existing puppeteer smoke for PadLab; the
  Marblebeat build EXTENDS it (marble view sweep + canvas-content probe).
- `bandits-box/SFX-SHOT-LIST.md` — Stephen's foley recording guide, mapped
  1:1 to the engine's 20 voice names.
- Research verdicts baked into the plans: iOS suspends Web Audio at screen
  lock with no reliable web workaround (Hush plan has the two-stage
  mitigation ladder); PadLab's sw.js is already origin-safe; Hush's is NOT.

## Shared laws that apply to all three (from CLAUDE.md + memory)

- Host caching: version everything, bump SW shell versions with the deploy,
  verify the LIVE url with `?probe=RANDOM` after every push.
- LOOKING is part of the job: a visual change is not done until you have
  screenshotted it at 375×667 from where the player stands and named three
  things wrong before Stephen does.
- 48px touch targets, measured RENDERED at 375×667.
- visualViewport, never innerHeight.
- No dashes in player-facing copy. Branding: SKY WOLF STUDIOS ARCADE.
- Bandits Box and Hush ship with NO earn wiring / no gamification (locked
  in their plans — it is those products' identity). Marblebeat inherits
  PadLab's existing posture unchanged.
- A probe that cannot fail is not evidence — watch every new gate fail once.

## Context from the planning session (2026-08-16)

- FTW (`satellites/flock-the-world/`) is already `beta:true` on the portal
  card, fully committed, and live on main. Nothing FTW was left stranded.
- All sibling repos (create-a-critter, aura-farm, abduct_a_chameleon) were
  checked clean and pushed. `/workspaces/ftw` is just an extracted spec
  drop; the real FTW lives in this repo.
- The three source zips in `assets/` are gitignored (`*.zip`) — the
  extracted copies here in `incoming/` are the durable record.
