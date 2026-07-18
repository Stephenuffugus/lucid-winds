# Pinball Claymation — Art Pack  *(working title: **Blobworks**)*

> A whole pinball table hand-sculpted in modelling clay. Flip the eyeball down the lab bench, chomp the monster bumpers, knock over the beakers, feed the big goofy mouth — and set off the MEGA MASH.

**Genre:** Top-down claymation pinball (single-file HTML5 canvas, **540×960 portrait**). This is a full **reskin + rebrand of the existing Greenhouse Pinball satellite** (`satellites/greenhouse-pinball/index.html`, v1.6). The engine, physics, coordinates and rules do **not** change — this pack swaps every procedural draw for a hand-sculpted clay model, plus a set of little **frame-by-frame clay animations** (mascot wobble, bumper chomp, eyeball blink, MEGA MASH). All art is a drop-in swap gated behind an image-loaded check, with the current procedural draw as the fallback.

---

## The new name (pick one — I built the pack around *Blobworks*, a one-word swap on the logo)

The old botanical name is dead. Stephen chose the **goofy clay Monster-Lab** world; the name falls out of it:

1. **Blobworks** ⭐ RECOMMENDED — ownable and brandable, nods to the blob mascot *and* to a pinball machine's "works." Scales kid → adult; cleanest logo lockup.
2. **Squish!** — loudest and most kid-punchy; literally names the clay squash-and-stretch you asked for. Slightly generic to trademark.
3. **Gloop** — short, gooey, cute; great app-icon read.
4. **Monster Mash** — descriptive and instantly gettable, but it's a famous song title (association/■TM baggage) and the least unique as a game brand.

*Everything below is written for Blobworks. To ship any alternate, swap the word in the logo prompt (sheet 08) and the doc title — no other change.*

---

## The world (what every mechanic became)

A cozy-goofy claymation **monster laboratory at night**: a mad-scientist's workbench modelled entirely in plasticine. Warm desk-lamp pool in the middle, dark lab around the edges so the ball reads. Friendly Aardman/Gumby monsters — googly eyes, buck teeth, one stubby horn, big grins. Nothing scary.

| Mechanic (engine) | Clay object it becomes |
|---|---|
| Ball (pollen bead) | a clay **EYEBALL marble** that blinks as it rolls |
| L/R flippers (leaf blades) | clay **monster claws / mitts** |
| 3 pop-bumpers (flower heads) | 3 **chomping monster heads** (each a different critter) |
| 2 slingshots | **bubbling clay blobs** |
| B·L·O·O·M standups | clay **letter blocks** — respell **S·L·I·M·E** |
| Thistle 3-drop bank | 3 clay **beakers / test-tubes** knocked flat |
| Compost scoop | a big goofy **MONSTER MOUTH** that gulps + spits the eyeball |
| Fern / Trellis / Green / Heartvine ramps | twisty **test-tube / pipe coil** raised lanes |
| L/R orbits | **pipe loops** around the bench |
| Dandelion spinner | a clay **gear / fan** |
| S·U·N top rollovers | **light-bulb / ZAP** lane markers (respell **Z·A·P**) |
| Pollen-lock nest | a **specimen JAR / cage** that holds locked eyeballs |
| Growth ribbon | a bubbling **REACTION test-tube / power meter** |
| Moss-net save | a stretchy clay **safety-web / goo mat** |
| Compost drain | the **drain grate / sink hole** at the bottom |
| Mascot (NEW) | **Blip** — a one-eyed clay blob (Morph-style) who jiggles, blinks, waves and reacts |

### Re-theme of the copy (strings in code, not art — but the DMD/HUD art must match)
- Standups **BLOOM → SLIME** (1-line: `'BLOOM'.charAt` → `'SLIME'.charAt`)
- Rollovers **SUN → ZAP** (1-line: `'SUN'.charAt` → `'ZAP'.charAt`)
- Quests (banner copy): *Seedling Sprint → **Beaker Dash*** · *Pollen Trail → **Spin Cycle*** · … (full remap lives in the wire pass; the DMD/quest art on sheet 08 is text-free so it fits any string)
- Multiball **Pollen Multiball → GOO MULTIBALL** · Wizard **FULL BLOOM → MEGA MASH**

---

## Pick a look (all three are claymation; they differ in lighting/finish)

### 1. Midnight Monster Lab ⭐ RECOMMENDED
*Bright, candy-colored goofy clay monsters sitting on a **dark** clay lab bench. One warm desk-lamp pool in the center-top, cool moonlight fill, deep shadow toward the middle so the eyeball ball and bumpers pop. Keeps a thread to Lucid Winds' night aesthetic while being 100% its own thing.* **Lowest legibility risk, best ball read, most premium.** Sheets here use this look.

### 2. Saturday-Morning Lab
*Brighter all over, higher-key, saturated candy clay on a lighter bench — reads like a kids' TV set. Maximum charm, but a bright center fights the "keep the ball readable" rule; hold in reserve as a light "Day Shift" table skin.*

### 3. Retro Stop-Motion
*Grainier, muted vintage plasticine, Gumby-era filmic — visible film grain, slightly desaturated, imperfect. Gorgeous and characterful; best as a premium unlockable "Old Reel" table skin rather than the base look.*

---

## Sheets (generate each separately — every file has the STYLE baked in)

- `01-sheet-01-table-backdrops.md` — Full-bleed lab-bench playfield backdrops — 4 "lab shift" moods
- `02-sheet-02-eyeball-ball-trail.md` — Clay eyeball ball (idle + lit) + goo trail + launch streak
- `03-sheet-03-monster-claw-flippers.md` — Monster-claw flippers (rest + flipped) + pivot caps + glow underlay
- `04-sheet-04-bumpers-slings-standups.md` — 3 chomp-head bumpers (idle+lit) + 2 sling blobs + S·L·I·M·E letter targets
- `05-sheet-05-drops-scoop-lock-returns.md` — 3 beaker drops (up/down) + monster-mouth scoop (idle/lit/open) + specimen-jar lock (0–3) + return-gate pipe elbows
- `06-sheet-06-ramps-orbits-spinner-rollovers.md` — Raised clay lanes: coil ramps, pipe orbits, gear spinner, ZAP rollover arches, diverter flags
- `07-sheet-07-reaction-meter-states.md` — Bubbling REACTION test-tube / power meter fill states (empty→erupt)
- `08-sheet-08-ui-hud-logo.md` — UI / HUD / DMD band / TILT card / buttons / **Blobworks logo lockup** + screen furniture
- `09-sheet-09-juice-fx.md` — Clay juice FX: goo splats, eyeball pop, slime spray, spark-save, combo puff, MEGA MASH erupt ring
- `10-sheet-10-animations.md` — ⭐ **The little graphic animations** — sprite-strip frame sequences (mascot Blip, eyeball blink, bumper chomp, beaker tumble, scoop gulp, spinner spin, GOO-multiball boil-over, MEGA MASH, TILT wobble)
- `11-sheet-11-cosmetics.md` — 💰 COSMETICS CATALOG — table / claw / eyeball skins + monster-buddy companion cameos

---

## The little graphic animations (this is the fun part — how they wire)

The engine is a 60fps canvas loop with a global clock `G.t` and per-object timers, so frame animation is cheap: each animated sprite ships as a **horizontal strip of equal cells** (e.g. `blip_idle` = 6 cells of 128px). The draw code picks a cell with `Math.floor((G.t*fps)%frames)` for loops, or advances a one-shot timer on an event (`o.hitT`, `G.wizardT`, `G.tilt`). No new engine systems — just `drawImage` with a source-x offset.

Sheet 10 delivers these strips (frame counts are targets; hold the clay's **squash-and-stretch** — anticipate, overshoot, settle):
- **Blip idle** (mascot, ~6 fr loop) — gentle jiggle/breathe, parked bottom-corner
- **Blip blink** (~3 fr one-shot) — fires every few seconds
- **Blip wave / cheer** (~5 fr one-shot) — on bloom/quest/multiball
- **Eyeball blink-roll** (~4 fr loop) — the ball's eye blinks as it travels
- **Bumper chomp** (~4 fr one-shot) — squash-down → mouth snap → overshoot → settle, on `o.lit`/hit
- **Sling blob wobble** (~3 fr one-shot) — kick jiggle
- **Beaker tumble** (~3 fr) — stand → fold flat when a drop goes down
- **Scoop gulp** (~5 fr one-shot) — mouth opens → swallows eyeball → closes, on capture
- **Spinner spin** (~6 fr loop) — gear turns while ripping
- **GOO multiball boil-over** (~6 fr one-shot) — the cauldron/jar bubbles up and spills, on multiball start
- **MEGA MASH erupt** (~8 fr one-shot) — big clay burst + confetti of clay bits, on wizard start
- **TILT wobble** (~4 fr one-shot loop) — whole-table shudder cue when tilted

Keep each strip on ONE row with a magenta (`#FF00FF`) knockout background and even cell spacing so the cutter can slice on a fixed pitch.

---

## Cosmetics economy (unchanged policy — earn only, no loot boxes)

All cosmetics unlock through **PLAY**, never money and never RNG crates (kid-safe, aligns with the Sunbeam earn policy). Skins are **pure visual** — they never touch physics, score, or Sunbeam payout. Equipped skins persist in `localStorage` (`gp_skins`) — free, no server writes. Faucets: **(1) Mastery** — cumulative MEGA MASH wizards triggered + personal-best score tiers unlock skins (`PROG.blooms` / `PROG.best` already persist; gate off those). **(2) Seasonal rotation** — the four "lab shift" table backdrops auto-feature on the real-world season (existing hash-byte season system); the matching shift is free in-season, collectible year-round after first unlock. **(3) Daily-streak** — the Daily-Bloom login streak (the retention spine) widens the safety-web AND drips cosmetic unlocks at 7-day (an eyeball skin), 30-day (an "Old Reel" retro table), weekly-perfect (a monster-buddy cameo). **(4) Specials** (Old Reel table, Chrome Lab, Toxic-Spill table) are long-tail mastery/streak rewards, not sold. **Monster-buddy cameos** unlock by owning the matching companion in the main 85-companion collection (Firefly/Koi/Toad/Cicada/etc. re-sculpted in clay) — cosmetic reuse, zero new economy.

---

## Style block  *(paste verbatim at the top of every sheet)*

```
STYLE — "Midnight Monster Lab" claymation (Blobworks pinball). Top-down 90° orthographic pinball art, hand-sculpted MODELLING CLAY / plasticine, stop-motion look (Aardman / Gumby / Morph). Every object is a little clay model: visible thumbprint dents, tool-scrape seams, soft rounded edges that wobble slightly (never perfectly geometric), matte plasticine sheen with ONE soft desk-lamp highlight, tiny pressed-in dust/lint flecks, a gentle contact shadow underneath. Goofy-friendly monsters — googly eyes, buck teeth, one stubby horn, big grins; cute NOT scary, no gore, no menace. Palette: dark clay lab-bench base #22202a, slate shadow #16151d; slime green #86d24a + deep monster teal #37b3a0; goop purple #9b6fd4; eyeball cream #f1ede2 with iris #4fa3d1 + black pupil; hazard yellow #f4c93a; danger red #e5533d; brass machine #c8a84b + warm lamp cream #efe6d2; gum-pink tongue #e88ba0. Lighting: one warm desk-lamp from top-center, cool moonlight fill, dark drop-off toward the middle of the table so the moving eyeball ball + bumpers pop. Rendering: photographed-clay feel — soft studio light, subtle grain, NO vector-flat, NO neon glow-blowout, NO photoreal humans, NO text / watermark / UI baked into sprites (letters are drawn by the engine). Everything reads at small size on a 540×960 phone table. Consistent top-down view for all playfield pieces (no perspective tilt). Deliver each sprite knocked out on a flat magenta #FF00FF background.
```

---

## Wire notes  *(exact draw-call → sheet map against the CURRENT v1.6 code — `satellites/greenhouse-pinball/index.html`)*

The game ships fine procedurally; art is a drop-in swap. Gate every blit behind an image-loaded check with the current procedural draw as fallback. Add an `_ASSET_VER` bump + `?v=BUILD` cache-bust when art changes.

- **`render()` backdrop + lamp radial (lines ~707–708)** → **sheet 01**: blit the chosen "lab shift" backdrop full-frame (540×960) *under* everything; keep the center dark. Season index (`G.season`) picks the shift.
- **walls + gold rim (lines ~710–714) & `POSTS` gold caps (~716–719, at 92,706 / 438,706)** → **sheet 01** draws the bench edge trim + lane guides *into* the backdrop; posts get a small clay bumper-nub sprite (optional, sheet 06).
- **`drawShots()` (line 804)** renders the whole shot furniture; map per `sh.type`:
  - `standup` ×5 (S·L·I·M·E at 102,322 / 102,446 / 265,176 / 428,322 / 428,446, r12) → **sheet 04** letter-block target: idle (green clay), lit (glow), done (dim). Letter glyph stays engine text.
  - `drop` ×3 (Thistle bank at ~130–200, 566–578, r10) → **sheet 05** beaker: standing (`!down`) vs folded (`down`). Tumble frames on **sheet 10**.
  - `scoop` (Compost at 330,600, r15) → **sheet 05** monster-mouth: idle vs `G.scoopLit`; gulp frames on **sheet 10**.
  - `ramp`/`orbit` (fern 165,410 · trellis 435,410 · green 365,405 · heart 210,470 · lorbit 75,635 · rorbit 455,635) → **sheet 06** coil/pipe lane sprites drawn along each `path`; the diverter `fork` flag → a little clay flag; active/inactive/quest-lit states keyed as now.
  - `spinner` (Dandelion at 265,250, r20) → **sheet 06** gear; spin frames on **sheet 10** (`G.spin.ang`).
  - `rollover` ×3 (Z·A·P at 150/265/380, 128, r15) → **sheet 06** lane arch; on/off by `sh.lamp`. Letter stays engine text.
  - `return` ×2 (retL/retR at 160/370, 788, r14) → **sheet 05** pipe-elbow, glows on `sh.cd`.
- **`drawBumper(BUMPERS, '#e8c65a','#8a6d1e')` — 3 heads at 150,340 / 390,340 / 265,490 (r24/24/26)** → **sheet 04**: three DISTINCT chomp-head sprites (idle + lit), picked by bumper index; `o.lit` drives idle→chomp crossfade / chomp one-shot (sheet 10).
- **`drawBumper(SLINGS, '#7ab356','#3f6b34')` — 2 at 208,782 / 322,782 (r13)** → **sheet 04** sling-blob idle + kick.
- **skill-shot ring on lit bumper (`G.skillLit`, ~line 725)** → keep procedural glow, or **sheet 09** a clay "AIM HERE" ring.
- **plunge charge meter (452,640, ~line 728)** → **sheet 08** a clay thermometer/beaker meter (optional; procedural bar is fine).
- **Pollen-lock nest (`LOCK_NEST` 340,152; `LOCK_PATH`; 3 bead slots, ~lines 731–740)** → **sheet 05** specimen-jar/cage with 0/1/2/3 locked eyeballs; lit-gold pulse when `G.lockLit`.
- **flippers `drawFlipper(LFLIP/RFLIP)` (def ~857; L 175,842 · R 355,842 · L=82)** → **sheet 03**: rotate the horizontal claw sprite about `F.px,F.py`, swap rest↔flipped on `F.up`, overlay `pivot_cap`; add `flipper_glow_underlay` when `|F.w|>3`.
- **ball radial + `b.trail` (physics ~lines 341–342 region)** → **sheet 02** `eyeball_core` (or equipped skin), `eyeball_lit` during multiball, `trail_mote`, `launch_streak`; blink-roll frames on **sheet 10**.
- **`drawNet()` (def ~864, at `DRAINY-6`)** → **sheet 05/09** goo safety-web: armed (`G.netTime>0`) + flash (`G.netFlash>0`); compost drain grate static under it.
- **`drawGrowth()` (def ~871, x30, y120→520)** → **sheet 07** reaction-tube states keyed to `G.growth/GROWTH_MAX` (empty / low / mid / high / erupt); a bubble accent as fill passes 0.3/0.6.
- **`burst(x,y,n,col)` + `G.parts` (def line 613)** → **sheet 09**, choose sprite by the passed color: `#7ab356` green (nudge/sling) → goo_mote_green · `#e8c65a` gold (bump) → spark_gold · `#5a4632` brown (drain) → mud_puff · `#e58fa0` rose (standup) → slime_pink · `#b57de0` purple (sling) → goop_purple · `#f2d98a` gold (lock) → sparkle. 
- **`G.flash` overlay + `triggerBloom()`/wizard ring (~line 650 + wizard)** → **sheet 09** `mega_flash` + `mega_mash_ring`; **sheet 10** the multi-frame MEGA MASH erupt.
- **HUD score/mult/callout + `.screen` title/how/settings/gameover DOM** → **sheet 08** DMD band, plates, buttons, TILT card, logo lockup (CSS backgrounds for DOM, canvas blits for in-play HUD). `floats` stay procedural text.
- **`sheet 11` cosmetics** are the swap sources for sheets 01/02/03 plus monster-buddy cameos drawn as an extra decorative sprite parked near a bumper (new optional draw, no physics).
- **`sheet 10` animation strips** wire as described in "The little graphic animations" above — `drawImage` with a source-x cell offset, driven by `G.t` (loops) or event timers (one-shots).
