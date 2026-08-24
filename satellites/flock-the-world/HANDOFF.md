# FLOCK THE WORLD (FTW) — HANDOFF

## Aug 24 EVENING — music landed + Stephen's second notes batch (OPEN, needs his greenlight)

**Music is IN** (commit 1ee62087, live-verified): his four Suno tracks —
Corporate Optimism → theme_menu, Efficient Progress → bed_hq, Synergy
Slaughter → win, The Weight Unspools → both loss doors (same file, two names —
the manifest promises one file per id). Stereo 128k on purpose; one-shots stay
mono 96k. New `sfxCut()` stops a lingering end song on menu/new-run entry.
Still owed: bed_tension, optional crowd states. Music is his, NOT CC0
(sfx/CREDITS.md).

**His playtest notes (both runs won on easiest difficulty), verified against code:**

1. **Lobbying Blitz + Acquisition give no receipt.** Both apply instant state
   changes with no news line and no visible delta. He buys them "regularly but
   it doesn't really show you what that does." Fix shape: pushNews receipt +
   meter flash on both. Small, safe.
2. **Buy-the-whole-Story-tree is still the one strategy.** The inf tree
   suppresses exactly the systems that push back, and the patriotism floor
   (min(30, subj*35)) never bites on a LOW-subjugation run — his econ win at
   12.7% subj kept the floor at ~4.4. Narrative stack + econ door compound.
3. **Econ door has no identity.** "Too Big To Ban" = all 15 markets + GROSS
   revenue + streak. No profitability, no coverage minimum. He won it at 12.7%
   subj / 5.2% patriotism, playing the same as his fist run. (Gross-not-net
   was already flagged in the five-features pass; this is the confirming run.)
4. **Bubbles read as money-only.** Spawn split is actually 72% cash / ~18-28%
   inf / rare leak. His direction: bubbles should be an ENGAGEMENT channel —
   more of the influence economy through them, and on harder difficulties
   catching (nearly) all of them should matter. Director call on the shape.
5. **Modes feel identical.** Verified: DEEPSTATE/CRISIS are stat mods + one
   tree unlock over the same sim. Nothing in PLAY expresses the fiction.
6. **Briefings identical across modes.** Verified: one GUIDE const for all
   three. Cheapest fix: swap 2-3 mode-specific beats into the guide + restate
   the mode card's fiction at run start.
7. **Paying the bribe always wins.** Price DOES already scale
   (max(base×evScale, 5% treasury)) — the dominance is strategic: money is
   the one cost that never hurts on easy. Fix shape: bribe heat (each bribe
   raises evPct + suspicion, sellers talk — mirror acqHeat), or non-cash
   costs on more options, or difficulty-scaled evPct.

**ALL FIVE ITEMS BUILT + DEPLOYED (Stephen: "go in the order you proposed"), commits f53e2878..this:**
1. **Receipts** — root cause was toasts at z:7 under the sheet (z:40); now z:45,
   and both actions state their numbers + push a wire line (probe: ftw-receipts-aug24).
2. **The ban debate** — econ streak now heats patriotism, ramped 60d, fading to
   zero by subj 0.5. Seeded sims: zero collateral (bot streaks all form at
   subj>=0.85). Breaking the streak cools it AND resets the door. See
   BALANCE-SCALING.md.
3. **Bribe heat** — each payoff raises the next one's treasury share (5%+4pts,
   cap 35%), +0.4 suspicion, ~20d cooling; modal shows the fixers' rate;
   persists across reloads. evPrice/evPayCash are the single source.
4. **Mode identity** — run-start briefing banner from live mod values
   (modeBriefing); LEAKS READ chips on free societies under Deep Partnership;
   Crisis tree header states the day-one discount (probe: ftw-modes-aug24).
5. **Bubble engagement** — DIFFS.bubInf widens the influence share by
   difficulty (32%/38%/46%), DIFFS.bubMiss scales the price of an uncaught
   leak (0.7/1.0/1.4).

Still open from the notes: none. Still owed: bed_tension + optional crowds.

## THE FOREIGN DESK (Aug 24 late — Stephen: "go ahead and build the foreign desk arcs")

Five composite arcs under the Art 11 guardrails (composites of patterns,
citations of nothing; the school is never shown, only its indemnification
meeting; punch up only). 13 beats + 5 new cast (vance, kesh, lena, auditor,
hale — portraits pending, whorow renders name only until art lands):
- **The Arms Fair** (vance): both sides buy; provenance comes home.
- **The Pretext Procurement** (kesh): verification of an incident scheduled
  in advance; the committee asks how you were first on scene.
- **The Regrettable Data Quality Event** (dataq, once per run): the school as
  a legal memo. Every option manages liability; none lets you mourn. Gate
  proves no free door.
- **The Correspondent** (lena): kill it, buy the outlet (BLACKOUT +6d,
  deeper), or let her file.
- **The Ledger Abroad** (audit): fdPages — every dirty foreign choice writes
  pages — comes due late (day 550/650/780), scaled, then spent.

Balance was a WAR (the full story is in this section's commits): choice slots
are a FIXED budget (choiceGap), so 13 new beats displaced the relief events
and flipped the winning bots. Fixes, in order of what actually worked:
1. **Rotation**: each run gets TWO of the three personal arcs (s.fdOn, saved),
   audit is the spine — the decisive fix, and replay variety for free.
2. Collaboration pays patriotism/growth NOW (booth, certificate, outlet,
   ministry coverage), pages LATER — the corruption-feels-good design.
3. audit beat 1 is a FLASH (no choice slot); reckoning lands late and
   publication SPENDS the pages; choiceGap 34→30 (the 45s wall-clock guard
   for humans is untouched).
- **Canary rebuilt**: the balanced-bot win gate was flipping on raw dice at
  the margin — now THREE fixed seeds, all three must win. 216 checks.
- Seeded sims: **Startup (his difficulty) WINS at 37 patriotism** even on the
  greediest path; Vendor greedy scripts remain photo-finish coin flips
  (pre-existing tightness, still the standing open item).
- OPEN for Stephen: event sway copy says "oversight" everywhere while the
  meter is named Patriotism (pre-existing, all ~40 events, one sweep).

## Aug 24 pass (Stephen's FIRST WINNING RUN notes — Too Big To Ban, day 1536)

Six commits, each checked and deployed separately (9c2235de..1eb46fe2). 197 checks.

- **Sound is IN**: 22 one-shot cues live, all CC0 from Kenney.nl packs (provenance
  per file in `sfx/CREDITS.md`), wired via `SFX_HAVE`; check.js enforces the
  manifest both ways (listed-without-file and file-without-listing both red).
  Stephen still owes the music: theme_menu, bed_hq, bed_tension, win,
  loss_refusal, loss_coalition (see SFX-GUIDE.md), crowds optional.
- **Canada split from the US**: 15 regions now. NA = United States (340M),
  CND = Canada (40M, liberty .84, media .80). Old saves refused cleanly.
- **The patriotism floor**: oversight never decays below min(30, subj*35).
  Full-Story-tree runs used to pin patriotism at a dead 0.0% (dec ~5.4 =
  0.23/day of relief vs 0.05/day of endgame gain). Bots unaffected (all end 40+).
- **Event fatigue**: choice events retire after 3 firings/run (flashes 6), each
  repeat waits cd*(1+n*0.5), counts saved. Choice modals also keep 45s of REAL
  time apart in live play (day-gaps compress at 3x). Bribes cost
  max(evScale, 5% of treasury) — Law 1 applied.
- **Readability**: guide has NEXT (skip stays); BREAKING banner holds while
  paused + ✕ + 8.2s; door progress shows ✓ instead of "Compliance 95 of 80";
  landscape legends clamp on an inner element with a MORE pill (no more severed
  words through the padding); World tab re-renders keep scroll position.
- **Triage at a glance**: countries tint violet as unrest/organizing climbs, red
  wash + red border when rioting; map poke (rpop) now shows unrest/coverage/
  compliance; Capital readout in the HUD opens the World tab at the money desk.
- **Bubbles**: spawn pulled 35% toward the region anchor (no more Falklands
  bubbles under the wire), tap radius 18/z min 8, and any unpause tops live
  bubbles back up to 8 ticks so menus stop eating them.
- **Teaching**: tree descriptions state what each tree feeds and its bill;
  agitate/crackdown tooltips explain the Iron Fist one-two; one-time field
  notes at first riot, first expulsion (re-entry road), and when the
  patriotism floor first binds.
- Probes: `scripts/_ftw_notes_probe.mjs` (visual, deploys in Canada),
  `scripts/_ftw_sfx_probe.mjs` (22 built / 0 missing / 0 404s). Shots in
  `portal-assets/review/ftw-notes-aug24/` (untracked).

## Aug 20 pass (Stephen's playtest notes, ?v=20260820a)
- **Title**: FLOCK amber / THE teal / WORLD red, initials enlarged + glowing so FTW reads.
- **Map first**: HUD floats OVER the map (absolute, translucent; single row in landscape);
  camera starts CONTAIN-fit (whole map visible, `v.containZ`, HUD height reserved via `v.insetEl`);
  FIT button = whole map; portrait phones get a dismissible rotate-to-landscape hint (once per load).
- **Menus pause**: openSheet stashes speed + setSpeed(0), closeSheet restores; pill shows PAUSED.
  Event/doctrine/tutorial modals already paused.
- **Wire**: continuous marquee ticker (~75px/s, content swaps only at loop seam), replaces the 4.3s flip.
- **Enemy meter renamed Patriotism** (CRISIS mode still "Coalition"; internal var stays s.oversight).
- **Explained in-UI**: World tab carries two legend cards (bars with ▲ fill / ▼ keep-low markers,
  full words incl. MILITARY; what Enter/Agitate/Crackdown/Blackout/Concede do); action buttons carry
  title tooltips + live prices; country tip explains how unsigned regions join.
- **Every spend answers back**: sheet toast ("Spent $X · effect") + cash flashes red. Blackout now has
  a 14d visible suppression window (NEWS DARK chip counts down) + 16d cooldown.
- **Economy rebuilt** (money was pointless in minutes, 175 hoarded influence bought the whole shop):
  coverage pays UPKEEP (upkeepK vs incomeK, scaled by militarization); action/event prices scale with
  daily net income (aPrice/evScale, min old base); market entry scales with markets held (entryScale);
  node prices inflate 3% per owned node; bubbles scale with net so they stay worth tapping;
  LOBBYING BLITZ (World tab) converts cash to influence (15d cd, +0.4 patriotism) = late-game sink.
- **Synergies 8 → 16** (new: skyanchor, hallmon, shotgun, fineprint, nonewfriends, curfewplus, oncue,
  welcomemat); Feed tab now has a ledger: found ones named, 5 SEALED slots with hints, rest dark.
- Balance (live-engine sims, ftw_balance harness + check.js): balanced Vendor bot with concede
  10/10 WINS day ~1060-1140 at patriotism 33-50; human-greedy (100% bubbles) wins ~day 970 holding
  $370-1150 through day 400 (was $40k+); dep rush still loses; do nothing still loses.
- check.js: 57 checks; balanced bot now models concede (intended play, deflakes the gate).

## Aug 15 studio adoption round (?v=20260815b)
- Branding typo fixed: "Sky Walk Studio presents" → "Sky Wolf Studios
  presents" (Stephen confirmed typo).
- **The living map** (the Plague-Inc juice, inverted): FTW's signature
  is that the flow goes BOTH ways —
  - **Data packets stream HOME**: gold 2px packets arc from every watched
    region to HQ (rate scales with coverage, cap 90, additive blend,
    speed-scaled), and HQ carries a soft gold ingest glow that brightens
    with arrivals and decays. Watching the harvest thicken IS the
    progress bar.
  - **Ambient route traffic**: active↔active regions exchange plane/ship
    dots along ROUTES continuously (rate ∝ coverage, cap 40), on top of
    the existing spread/adoption dots.
  - **Event pings on the map**: protest transitions (violet ring),
    violent turns + crackdowns (red ring), countermeasure unlocks
    (violet 6-ray spark), expulsions/uprisings (big double shockwave),
    synergy discoveries (gold ring at HQ). All drawn in drawFx beside
    the existing pulses.
- sws studio bridge + menu "Back to Sky Wolf" added; beta portal card.
- mkgeo.js was NOT in the drop (Stephen doesn't have it) — if map data
  ever needs regeneration, rewrite it from the spec in this handoff.


Plague Inc-style satire sim: you're the surveillance vendor subjugating Earth via contracts, narrative capture, and manufactured crises. Win = 97% subjugation before Oversight hits 100. Single-file vanilla HTML/CSS/JS PWA, no build step, mobile-first. Lucid Winds stack.

**Files:** `flock-the-world.html` (the game, ~188KB with embedded geometry) · `sim.js` (headless balance harness, needs `game.js` extracted — see Testing) · `mkgeo.js` (regenerates the embedded country data).

## Architecture (all in the one file)

1 tick = 1 sim day. Everything tunable lives in `CFG` at the top of the script.

- **Map**: real country geometry — Natural Earth 110m via `world-atlas` npm package, converted by `mkgeo.js` (simplify + round to 1 decimal + drop islands <1.2 deg², assign 162 countries to 14 `REGIONS`, **antimeridian unwrap** — rings crossing ±180° get lon-unwrapped and duplicated ±360° so Russia/Fiji render at both map edges instead of as a bar across Canada) and embedded as `GEO` (~115KB). Equirectangular projection into 1000×403 world units. Canvas renderer: per-country `Path2D` (cached), fills by region sim state with per-country deterministic tint, country border strokes, graticule, curved dashed `ROUTES` with animated travel dots, coverage glows, region labels at zoom. To regenerate data: `npm i world-atlas topojson-client && node mkgeo.js`, replace the `const GEO=` payload.
- **Camera**: `makeView()` — drag pan, pinch zoom, wheel, +/−/⌂ buttons, cover-fit baseline (portrait fills width — the intended orientation), starts ~1.9× zoomed on the HQ country, clamped pan. Taps resolve to individual countries via bbox + point-in-polygon (`countryAtPoint`; `regionAtPoint` wraps it).
- **Country-level play**: the pick screen selects a launch **country** (highlighted; region context shown); it becomes the HQ (marker on map, named in news). Each region stores a spread order (`setSpreadOrder`: countries ranked by distance from the entry seed — HQ for the start region, the adopting neighbor's anchor for later ones), and `countryFill` lights countries **one by one** as region coverage rises (partial-brightness frontier country), so growth reads Plague-style even though the sim stays regional. Tapping any country in-game pops `#ctip` (name, status, unrest, jump to World tab).
- **Hidden synergies**: `COMBOS` — 8 secret node-pair/triple combos (e.g. Nuisance Ordinances + Plate Recognition = THE TICKET MACHINE, +0.35 income & cash bonus; Blackout + Archive = THE MEMORY HOLE, +dec). `checkCombos` runs on every purchase; unlock = gold banner + headline + permanent fx merged in `recompute` + tally atop the Feed. **Never list them in-game in advance** — discovery is the point. Full list in the COMBOS array.
- **Region sim** (per tick): coverage growth → control approach (depth = base + tech + militarization) → suspicion (rises with coverage·control·liberty·visibility; suppressed by influence; **decays with control×compliance** — normalization) → compliance pull (fear-boosted, capped) → militarization drift → **unrest engine**.
- **Resistance system** (the game's moral center — civilians are innocent, adaptive, and they remember): per-region `resist` (0-100, "Organized" violet bar) grows from suspicion + liberty + press + `grudge` (permanent memory of crackdowns), suppressed by narrative-machinery `pac` fx (astroturf/anchor/narr/corps/perp, Velvet Glove) and fear, decays only under control^2.2. Effects: cuts coverage growth (cap 45%), stalls suspicion normalization (organized regions never go quiet), feeds unrest, skims income. **Countermeasures** (`CM` table) unlock probabilistically against what the player actually built — camera-mapping atlas (any), masks/dazzle (vs face), plate swaps (vs plate), doorbell boycott (vs door), cop-watch (vs patrol; raises crackdown backfire), encryption (vs graph; cuts depth), samizdat mesh press (vs blackout; cuts blackout effect), lens brigades (vs drone; coverage decay) — each fires a violet 'res' headline teaching the real tactic, and shows as chips on the region card. **Radicalization**: successful crackdowns add grudge+resist; agitating a region with resist>40 risks provocateurs being unmasked on stream (oversight+4, resist+8, backlash). **Concede** is the de-escalation lever (−resist, −grudge). **World solidarity milestones** at avgRes 18/30/45/60/75: global camera atlas, encrypted-by-default (−depth), general strike (−15% cash, +oversight), archive leak (halved by Leak Suppression), the Great Unplugging (−3% coverage everywhere).
- **Protest state machine**: unrest 0-100 → calm / murmur(25) / peaceful(45) / violent(68-78) / uprising(85), with hysteresis. Peaceful slows growth + drips oversight; violent damages coverage (unless Counter-Riot Charter converts it to fear-compliance); uprising destroys coverage → region EXPELLED at <2% coverage. 4 simultaneous expulsions = "Great Refusal" loss. Key term: unrest drive includes `−control^1.8×42` — total control makes marching impossible (creates the mid-game danger hump and endgame quiet).
- **Region actions** (World tab, per-region cooldowns 20-25d): Agitate $80 (needs `agit`; peaceful→violent instantly), Crackdown $120 (needs `charter`; 12% backfire, halved under Iron Fist), Blackout $100 (needs `blackout`; effect scales inverse to press freedom), Concede (free; trade control for calm).
- **Skill trees** (45 nodes, 4 distinct shapes): DEPLOYMENT = broad pyramid; WATCHLIST = twin spine (Watch col ⟷ Enforce col + fusion rungs); NARRATIVE = web; CRISIS = escalation ladder with world-state `gate` functions (`threat` needs Crime Panic; `proxy` needs avgSus>18; `pretext` needs avgMil>0.12 and costs +6 oversight on buy). fx keys: `dep dth vis inc sup cmp spr dec mil fear route`.
- **Economy**: cash from covered pop × wealth. Influence: passive faucet `0.06 + subj×0.25 + cmp×0.04`/day (carries the economy — bubbles are bonus; verified winnable at 10% bubble collection), + milestone bonuses at 25/50/75/97% regional coverage.
- **Oversight**: `(avgSus×overK + subj×0.022 + lost×0.02 + warHeat×0.05)×diff − dec×0.042`, plus drips from protest states, crackdowns (+0.8), events, full-region milestones (+1). Full Narrative tree ≈ neutralizes baseline endgame growth — intentional arms race.
- **Modes**: CONTRACTOR (classic) / DEEP PARTNERSHIP (2 authoritarian regions pre-seeded, free societies resist ×1.3) / CRISIS ENGINE (war tree open + 30% off, oversight = "Coalition" ×1.22). Difficulties multiply over/sus/cash/unrest.
- **Doctrine** (permanent, at 14% subj): Velvet Glove (+cmp, slower suspicion) vs Iron Fist (+depth/+milit, safe crackdowns).
- **Pacing**: `msPerTick [0,800,380,150]` (1× ≈ 11-min win), bubbles live 34 ticks with fade-out.
- **Onboarding**: first game per page load runs the interactive `GUIDE` while the sim runs — (1) buy Nuisance Ordinances (Story tab pulses, node glows), (2) buy Free Pilot Program, (3) 22-day "watch the money grow" beat, (4) synergy tease pointing at Plate Recognition. Advance is condition-driven (`guideTick`/`guideEvent`), skippable. The old 6-step modal tutorial remains behind menu "How to play".
- **Narrative layer**: rotating WIRE ticker (4.3s) over last 8 headlines; crit headlines also fire a sliding BREAKING banner (5.2s); 15 ambient satire lines + `H{}` templated headlines for every transition; fictional composite cast (Vole/Brill/Prather/Klein/The Anchor) drives choice events. No real names — keep it that way (legal + evergreen).

## Verified balance (SEEDED sim results, 2026-08-24 evening, full notes-2 pass in)

sim.js now seeds its PRNG per scenario (identical dice across CFG comparisons)
and its DOM stubs were healed after the sound pass broke them. The old table
was stale for both reasons.

| Scenario | Result |
|---|---|
| Vendor, balanced glove bot (10% bubble pickup) | WIN day 1063, patriotism 65 |
| Vendor, dep/cap fist rush (ignores Story tree) | LOSS day 999 — regression guard holds |
| Vendor, fist from SEA | WIN day 1156, patriotism 97 (photo finish) |
| Vendor, glove #2 (full bubbles) | LOSS day 1305 at 68% subj |
| Deep Partnership from EA | WIN day 941, patriotism 36 |
| Crisis Engine from ME | LOSS day 1015 — pre-existing at HEAD, stale table claimed WIN |
| Incumbent glove from WE | LOSS day 1340 — pre-existing at HEAD |
| Do nothing | LOSS ~day 3623 — guard holds |

⛔ Bots are greedy scripts, not players (Stephen wins comfortably on easy where
they lose Vendor); the divergence from the pre-evening table is partly stale
data, partly the Aug 24 daytime passes landing while sim.js was broken. If
Vendor is meant to be bot-winnable across doctrines, that is a tuning session
of its own — flagged, not folded into this pass.

Tone: player is explicitly the parasite class; civilians are named as innocent and preyed-upon throughout (menu, ambient headlines on predatory fines/data brokers/false arrests, end screens). Loss screens celebrate the organizers by tactic; the win screen is an indictment. Keep it that way — it's the art.

## Testing harness

```
# extract script → game.js, then:
node --check game.js && node sim.js
```
`sim.js` stubs the DOM, runs 8 scenario bots × 4000 days (greedy cheapest-node buyer, market expander, agitate→crackdown playbook, concede-on-overorganized (resist>52 every 12d), configurable `collectP` bubble handicap and `trees` whitelist). Note: `let/const` don't attach to the vm context — live refs are fetched via `runInContext`. Keep the do-nothing and dep-rush scenarios as regression guards after any CFG change.

## Manual test checklist

Menu (3 modes × 3 diffs, How to play) → country pick (tap Brazil ≠ Argentina; begin button names the country) → first-run guide flow end-to-end incl. skip →  HUD/speeds/pause → tap bubbles ($/◈/!) → buy through each tree shape, verify wires light + gates show text → war tab unlock (needs Crime Panic outside Crisis mode) → doctrine modal at 14% → World tab actions incl. cooldown labels → force protests (rush deploy, skip Narrative) and watch murmur→peaceful→agitate→violent→crackdown headlines → lose by oversight, lose by 4 expulsions, win → Run it back resets cleanly. Verify Organized bar + countermeasure chips appear (build face/plate/patrol into a free region), agitate a resist>40 region until unmasked, watch a world-solidarity milestone fire, country-by-country lighting as coverage grows, HQ marker, country tap popover, gold SYNERGY banner (buy ord then plate), BREAKING banner on crit events, tutorial flow, map pan/zoom clamping at min/max, and country-tap accuracy on coastlines. Test at 320px width and desktop.

## Deploy

Firebase Hosting or GH Pages as-is (single file). Add manifest + service worker for installable PWA (same pattern as other Lucid Winds apps).

## Roadmap

- localStorage persistence (best runs, unlocks) — **only after self-hosting**; storage APIs fail inside claude.ai artifacts
- Per-region flavored headlines; more character events (cast is built for it)
- Competitor vendor AI racing your coverage; whistleblower mechanic (resets a region, purgeable via Leak Suppression)
- Achievements per mode/doctrine; SFX/haptics; region detail popover on map tap
