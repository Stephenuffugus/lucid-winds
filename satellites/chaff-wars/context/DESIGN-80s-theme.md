# CHAFF WARS — "BUFF THE BLOCK" 80s Graffiti / B-Boy Animal Reskin

**Design doc — art direction + implementation spec.** Nothing in the ruleset, the 6x12 board, the Tsu offsetting/all-clear math, the AI, the 14-stage ladder, boss, or secret changes. This is a **skin + character rewrite** layered onto the existing single-file ES5 canvas game at `/workspaces/lucid-winds/satellites/chaff-wars/index.html`. All code anchors below are real (verified against the current file).

---

## 1. Theme statement + fiction reconciliation

**The Keeper still defends the garden. The pests are now a graffiti crew, and their "Chaff" is grey spray paint.** A city breaker-crew of garden animals (The Grey Crew) has rolled up on the Keeper's plot to bomb it grey. Every wack tag they slap on a wall shows up as the game's existing grey **Chaff** garbage. The Keeper fights back the only way a Keeper knows how: by growing color. Your falling **seedpods are fat spray-paint throwies**, and every chain you pop is you buffing the crew's grey right off the wall and blasting the block back to neon life. Mechanically identical (grey garbage buries you, colored chains cancel it and counter-send), fictionally it is now a **paint battle**: grey concrete versus botanical neon. The boss (Baron Greymould) is the all-city KING trying to buff the entire valley to a dead quiet grey; the secret Ronin Hare is the legendary solo writer who battles with one move and no crew. Keeps the "keeper vs pests" spine, just cranks it to 1987.

---

## 2. Revised 14-character roster (The Grey Crew)

Every entry keeps its `id` (do not rename ids, they gate progression and unlock persistence at `PROG.unlocked`), keeps its `em` emoji as a fallback, keeps the pun energy, and gets a fresh neon `ac` (the accent color already drives the opponent's board-frame stroke via `drawBoardFrame(F,label,accent)` and the opponent card). Taunts are 80s-slang, readable, and contain **zero dashes** (per the Lucid Winds copy rule). `lose` lines below stay as-is unless noted; only `taunt`, `nm` (where changed), and `ac` need editing in the `ROSTER` array (lines 400-413).

Ladder order preserved. Colors given as `ac` primary + 1-2 support hues for portrait art.

**0 — The Aphid Swarm** 🐛 (keep name)
- Animal: a swarm of aphids · Role: the **toy taggers**, a mob of rookie writers who bomb in numbers
- TAG: `TOYZ` · Move: the crowd **Wave** (many little bodies rippling as one freeze)
- Palette: neon lime `#39FF14` + hot magenta `#FF2FB9` · `ac:'#39FF14'`
- Taunt: `"We tagged your whole block before you even woke up, homie."`

**1 — Gnat King Cole** 🦟 (keep, perfect pun)
- Animal: a gnat · Role: the crew **DJ**, smooth on the ones and twos
- TAG: `KOLE` · Move: turntable **scratch** spin, one wing on the wax
- Palette: electric blue `#2E8BFF` + violet `#8A5CFF` · `ac:'#2E8BFF'`
- Taunt: `"Care to bust a move before you wilt, playa?"`

**2 — Mabel Cabbagewing** 🦋 (keep)
- Animal: a cabbage moth · Role: the crew **fly girl**, style-writer with the cleanest footwork
- TAG: `FLUTTA` · Move: the **Butterfly** (real b-boy floor move) into a backspin
- Palette: cyan `#22E0E0` + hot pink `#FF4FA3` · `ac:'#22E0E0'`
- Taunt: `"I already laid my throwies in your good dirt, sucka."`

**3 — Sir Reginald Slugmore** 🐌 (keep the posh pun)
- Animal: a slug (no shell) · Role: the **popper / robot**, all slow-motion glide and dime-stops
- TAG: `SLIME` · Move: the **Robot** and the slow-mo slide (slug is slow, that is the joke)
- Palette: lavender `#B06FE0` + slime green `#8FE04A` · `ac:'#B06FE0'`
- Taunt: `"I shall glide over here eventually, and you shall lose."`

**4 — Chompers the Cutworm** 🪱 (keep)
- Animal: a cutworm · Role: the crew **cutter**, floor-b-boy and record-cutter both
- TAG: `KUTT` · Move: **The Worm** (obviously) into a floor cut
- Palette: neon orange `#FF7A18` + acid green `#B6FF3A` · `ac:'#FF7A18'`
- Taunt: `"Timber, little sprout, I am cuttin you down."`

**5 — Baron von Beetle** 🪲 (keep)
- Animal: a june beetle · Role: the **power head**, armored shell, all power moves
- TAG: `SCARAB` · Move: **windmills** and flares, that hard shell never scuffs
- Palette: metallic teal `#1FC7B0` + gold `#FFC53A` · `ac:'#1FC7B0'`
- Taunt: `"Nothin dents this shell, so quit frontin."`

**6 — Escargeddon** 🐌 (keep, best pun in the deck)
- Animal: a garden snail (shell) · Role: the **heavyweight breaker**, boombox-shell on the back
- TAG: `GEDDON` · Move: the **shell spin** / backspin, tucks in and rips
- Palette: copper `#E07B3A` + neon lime `#9FE06A` · `ac:'#E07B3A'` (kept warm to read distinct from Slugmore)
- Taunt: `"Eat my slime trail, this yard is crew territory now."`

**7 — Cawlin the Crow** 🐦 (keep, the Colin pun)
- Animal: a crow · Role: the **bomber and lookout**, flies to the high spots nobody else can tag
- TAG: `KAWZ` · Move: the **Crow freeze** and air-moves, steals shine off everybody
- Palette: iridescent violet-black `#5B4E8C` + neon cyan `#2FF0E0` · `ac:'#2FF0E0'`
- Taunt: `"Caw caw, and that means I just served you, kid."`

**8 — Gustavo the Gopher** 🦫 (keep)
- Animal: a gopher · Role: the **underground plug**, digs the tunnels the whole crew moves through
- TAG: `DIGZ` · Move: the prairie-dog **pop-up** and the Dig (bob down, pop up, freeze)
- Palette: dirt-orange `#E0A03A` + turquoise `#2FD0C0` · `ac:'#E0A03A'`
- Taunt: `"I am already under your garden, so relax and take the L."`

**9 — Duchess Dapple** 🦌 (keep)
- Animal: a deer · Role: the **style queen / uprocker**, long-legged high-fashion toprock
- TAG: `DAPPL` · Move: **uprock** with high kicks, the elegant prance-into-freeze
- Palette: rose neon `#FF5C8A` + electric gold `#FFD21A` · `ac:'#FF5C8A'`
- Taunt: `"Your tulips looked delicious, and so does this win."`

**10 — Lady Bindweed** 🌿 (keep)
- Animal: bindweed vine spirit · Role: the crew **contortionist**, threads and flexes, ties you up
- TAG: `VINE` · Move: **thread the needle** and the pretzel freeze
- Palette: neon green `#4CE05A` + magenta `#FF3BC0` · `ac:'#FF3BC0'`
- Taunt: `"Come get one big tight hug, then you are done, homie."`

**11 — Miss Mildew** 🍄 (keep) — pre-boss, palette starts going grey
- Animal: powdery mildew spore · Role: the **fog machine**, hazes the room, gliding ghost-mover
- TAG: `HAZE` · Move: the **Glide / moonwalk**, leaves a powder trail behind her
- Palette: sickly neon lavender-grey `#B8A6C8` + toxic green `#9FE04A` · `ac:'#B8A6C8'`
- Taunt: `"You already look a little grey to me, playa."`

**12 — Baron Greymould** 👑 (keep) — **BOSS**, `boss:true`
- Animal: grey mould royalty · Role: the **all-city KING**, wants the whole valley buffed grey and quiet
- TAG: `GREYKING` (giant wildstyle burner) · Move: the **King's Freeze**, throws the crown pose over a fresh grey burner
- Palette: chrome grey `#9A9A8A` + toxic green `#7BFF2A` + royal purple `#7A2FD0` · `ac:'#7BFF2A'` (his neon is the sickly green of rot)
- Taunt: `"Soon this whole valley gets buffed grey and stays real quiet."`

**13 — The Ronin Hare** 🐰 (keep) — **SECRET DUEL**, `secret:true`
- Animal: a hare · Role: the **solo legend**, no crew, one move, an OG master who battles alone
- TAG: `1BLADE` · Move: the endless no-hands **headspin** into the sword-arm freeze
- Palette: white-neon `#F0ECE0` + crimson `#E0433F` + gold `#FFC53A` · `ac:'#E0433F'`
- Taunt: `"One garden, one blade, one lesson, kid."`

> Note: stages 3 and 6 are both snails/slugs in the original — the reskin deliberately splits them (Slugmore = shell-less slow-mo popper; Escargeddon = shell-spin heavyweight) so their portraits and moves never read as duplicates.

---

## 3. Seedpod reskin — spray-paint throwies (colorblind-safe)

Current pods (function `drawPod`, line 642) are glossy radial-gradient circles with gaze eyes, fed by the 5-entry `PAL` array (lines 417-422) mapping color values 1..5. The 80s reskin keeps the exact **hue anchors** (do NOT rotate hues — the existing red/green/blue/amber/purple spread is already the colorblind-tuned set; shifting it re-breaks CB separation) but pushes saturation/brightness to **neon**, wraps each pod in a **bold black spray outline**, adds a **drip**, and stamps a **per-color glyph** so the five colors are separable by SHAPE, not hue alone (Puyo-style, the real accessibility fix for red/green confusion).

Proposed `PAL` swap (edit lines 417-422; keep `bs`/`lt`/`dk` keys so the radial gradient still works):

| idx | name (old → new) | bs (neon) | lt (highlight) | dk (drip/shadow) | glyph silhouette |
|---|---|---|---|---|---|
| 0 | Crimson → **Redline** | `#FF3B3B` | `#FF8A72` | `#B01818` | 4-point star |
| 1 | Sprout → **Toxic** | `#3BE04A` | `#9FFF6A` | `#1E8E2E` | up-chevron / leaf |
| 2 | Dewdrop → **Ice** | `#2E8BFF` | `#8FC8FF` | `#1550B0` | droplet |
| 3 | Sunbean → **Voltage** | `#FFD21A` | `#FFE97A` | `#B88A00` | lightning bolt |
| 4 | Nightshade → **Ultra** | `#C24BFF` | `#E0A6FF` | `#7A1FC0` | diamond / rhombus |

Rendering changes inside `drawPod`:
1. **Black spray outline** — before the fill, stroke the arc with `ctx.lineWidth = s*0.12; ctx.strokeStyle='#0c0a06'` (chunky throwie edge). Keep the existing radial gradient (`lt → bs → dk`) as the neon body.
2. **Drip** — one small teardrop hanging off the bottom of the blob (`ctx.arc` + a short bezier tail) in the `dk` shade. Deterministic per cell so it does not shimmer; drip length can key off cell row parity so it reads as paint, not noise.
3. **Neon glow on connected groups only** — when a pod is part of a same-color group about to pop, add `ctx.shadowBlur = s*0.4; ctx.shadowColor = pal.bs` for one frame of the pop. Cheap, sells the "buff flash."
4. **Glyph** — draw the per-color silhouette in the highlight (`lt`) color at ~35% pod size, centered above the gaze eyes. This is the load-bearing colorblind cue. Gate it on a settings toggle (see below) but **default ON**.
5. **Eyes** — keep the existing gaze eyes; optionally stamp tiny neon shades on the boss/secret pods only for flavor. Not required.

**Colorblind toggle:** there is already toggle UI (`.toggle`, line 53, and a `.settingline` pattern). Add one line: **"Tag Shapes"**, default ON, that forces the glyphs. Keeping it a toggle (rather than always-on) lets purists turn shapes off, but shipping it ON means the game is CB-safe out of the box. Hue anchors + distinct glyph silhouettes = safe for deuter/protan/tritan.

**Chaff (grey garbage)** — the `CHAFF_PAL` grey (line 424) STAYS grey (grey is the CB-neutral "junk" signal and must never collide with a real color). Reskin it as **buffed concrete**: a flat desaturated grey block with a black spray **crossout X** or slash stamped on it (a "buffed over" tag) and slight translucent overspray at the edges. This makes the fiction legible — grey Chaff literally looks like the crew painted over your wall — while staying visually inert and never mistakable for a scoring pod.

---

## 4. Board + HUD + background — 80s graffiti treatment

The whole match renders to one canvas via `drawBoardFrame(F,label,accent)` (line 626) + a HUD draw pass (lines 682-701). Menu/help screens are CSS `.screen` divs (line 28) with CSS vars at `:root` (lines 19-20). Concrete treatment:

**Background (behind both boards)**
- Recolor `:root` vars toward a **night-alley** base: keep `--bg` dark but add a warm-to-magenta radial neon glow. The body background gradient (line 25) becomes a subway/alley night: deep near-black bottom, a magenta-and-cyan neon wash up top.
- Add a **brick / subway-tile wall** behind the boards via CSS `repeating-linear-gradient` (mortar lines) layered under an inline-SVG **chain-link fence** data URI at low opacity. Fully procedural, no files.
- The two board frames read as **two walls being bombed** — your wall (color coming back) vs the rival's wall (going grey).

**Board frame** (`drawBoardFrame`)
- Replace the thin `#33301f` stroke with a **double neon spray edge**: a fat black underlay stroke, then the frame color on top, then `ctx.shadowBlur` glow. When fighting an opponent, pass their `ac` neon as `accent` so their wall glows their crew color.
- The spawn-column highlight (line 635, currently faint gold `rgba(232,193,90,0.10)`) becomes a **drip-mark / spray guide** in the active pod color.

**HUD labels** (canvas `fillText`, `system-ui`)
- Keep the words the brief locked, restyle them as spray tags with `ctx.shadowBlur` neon glow + a black underlay draw (draw the string once in `#0c0a06` offset by 2px, then again in neon on top = fake outline):
  - `CHAFF WARS` (line 682) → chunky neon throwie, magenta+cyan split fill.
  - `YOUR PLOT` (line 692) → keep the words, style as a small spray tag. (Optional flavor rename **YOUR YARD** if Stephen wants; words are free to change, only ids are locked.)
  - `RIVAL` (line 700) → keep, neon-outlined.
  - `NEXT` (line 695) → keep, or optional DJ rename **ON DECK**.
- Score numbers get a subtle neon drop shadow so they pop off the brick.

**NEXT preview** (lines 695-697) — unchanged geometry; the two preview pods just inherit the new spray-throwie `drawPod` look. If renamed to ON DECK, it reinforces the DJ/crew vibe.

**Chain popups** (float text, lines 468 + 478) — currently `'Chain '+N+'!'` and `'ALL CLEAR!'`. Reskin as **graffiti pop-tags** with a quick shake + neon outline, and add escalating 80s flavor words keyed to chain length (keep the `Chain N!` for clarity, stack a flavor word above it):
  - chain 2 → `FRESH!` · chain 3 → `DEF!` · chain 4 → `DOPE!` · chain 5+ → `ILL!`
  - All Clear (line 478) → keep the mechanic, relabel the pop `ALL CITY!` (the graffiti term for bombing everywhere) instead of `ALL CLEAR!`.
- Popups render in the popping color's neon with a black underlay, scale-punch then fade (reuse the existing `f.floats` life/`big` fields).

**Menu / help / character-select screens** (CSS)
- Title (line 35, currently a green-gold gradient text-clip) → neon **wildstyle** feel via layered `text-shadow` (stacked offset shadows = fake bubble-letter outline + glow), heavy `letter-spacing`, slight italic skew. No webfont needed for MVP.
- Buttons (`.btn`, line 40) → **spray-tag pills**: keep the 48px touch target, swap the sage/green gradient for neon-on-black with a chunky black border and a glow on `:active`.
- Opponent select rows (`.foe`, line 75) → each pest's `.fem` emoji tile gets that crew member's `ac` neon border; beaten foes (`.foe.beaten`, line 82) get a **crossed-out grey "buffed" tag** overlay (you painted over them).

---

## 5. Procedural NOW (CSS/canvas, zero art files) vs art assets LATER

**Do now, no assets, ships as a complete reskin:**
- Neon `PAL` swap + spray-throwie `drawPod` (outline, drip, glow, per-color glyph). Pure canvas.
- `CHAFF_PAL` "buffed concrete + crossout" render. Canvas.
- Board-frame neon spray edge + `ctx.shadowBlur` glow, opponent `ac` drives the color. Canvas.
- HUD label restyle (fake outline via double-draw, neon shadow), chain-popup flavor words + `ALL CITY!`. Canvas.
- Background: brick/subway `repeating-linear-gradient` + chain-link inline-SVG data URI + neon alley wash. CSS only.
- Title wildstyle via stacked `text-shadow`; `.btn` and `.foe` spray-pill restyle. CSS only.
- Roster edits: new `ac` neon per foe, new `taunt` strings, any `nm` tweaks. Data-only edit of the `ROSTER` array.
- "Tag Shapes" colorblind toggle (reuse existing `.toggle`/`.settingline`). Small JS + CSS.

This alone delivers the "rad 80s graffiti" board/HUD/pod reskin with new taunts and crew colors, self-contained, ES5, single file.

**Needs art assets later (this seeds the asset list):**
1. **14 character portraits** — the b-boy animals mid-move, one PNG each (suggest ~256x256, transparent, cut per the repo's magenta-cut cutout workflow). This is the headline ask: today each foe is just the `em` emoji drawn at line 687. Portraits swap in there with emoji as `onerror` fallback. Ladder-order priority: boss (Greymould) and secret (Ronin Hare) first for climax impact, then stage 0/1/2 for first-impression, then the middle.
2. **Wildstyle `CHAFF WARS` logo** — SVG or PNG burner for the title screen (procedural fake ships first; real logo upgrades it).
3. **Per-crew tag stickers / throwies** — each foe's TAG (`TOYZ`, `KOLE`, `GEDDON`, `GREYKING`, `1BLADE`...) as a small sprite stamped on their board frame during their fight and on the beaten-foe overlay. 14 small PNGs or SVGs.
4. **Optional painterly background hero** — a hand-done subway/alley mural if the procedural brick+fence ever feels flat. Not required for MVP.
5. **Optional menu decor sprites** — boombox, cassette, high-tops, spray-can for the menu/settings chrome.
6. **Optional graffiti display webfont** (woff2) for title/labels — licensing caveat; the stacked-`text-shadow` fake is fine and ships without it.

Estimated art-frame impact maps onto the existing brief's count (`design-briefs/chaff-wars.md`, noted as 886 MVP / 1874 full): the 14 portraits + tag stickers are the bulk of the MVP art; everything else in section 5's "do now" list needs no frames at all.

---

### Code anchors (for the implementing programmer)
- `ROSTER` array: `satellites/chaff-wars/index.html` lines **400-413** (edit `ac`, `taunt`, `nm`).
- Pod palette `PAL`: lines **417-422**; `CHAFF_PAL`: line **424**.
- `drawPod`: line **642** (add outline/drip/glyph/glow).
- `drawBoardFrame`: line **626** (neon edge + accent glow); spawn highlight line **635**.
- HUD draw: `CHAFF WARS` **682**, opponent emoji **687**, `YOUR PLOT` **692**, `NEXT` **695-697**, `RIVAL` **700-701**.
- Chain float text: **468** (`'Chain N!'`) and **478** (`ALL CLEAR!` → `ALL CITY!`).
- CSS `:root` vars: lines **19-20**; body bg gradient **25**; `.btn` **40**; `.foe`/`.foe.beaten` **75/82**; title **35**; toggle UI **53**.
- Constraints: single-file, **ES5 only** (no `const`/`let`/arrow fns), 48px min touch targets, no dashes in copy, `node --check` the extracted script before commit.