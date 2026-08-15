# FLOCK THE WORLD (FTW) — HANDOFF

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

## Verified balance (sim results, this build)

| Scenario | Result |
|---|---|
| Vendor, balanced bot (even at 10% bubble pickup) | WIN ~day 800-870, oversight 40-46% |
| Vendor, dep/cap rush (ignores Narrative tree) | LOSS ~day 770-780 at 89% subj, often loses a region — resistance + protests punish it |
| Incumbent (D.sus 1.18/over 1.42), balanced w/ concede usage | ~3/4 WIN at 47-63% oversight, occasional photo-finish loss — intended |
| Crisis Engine | WIN, hottest oversight (~50-67) via warHeat |
| Do nothing | LOSS ~day 3300, loses a region to uprising |

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
