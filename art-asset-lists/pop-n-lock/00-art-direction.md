# Pop N Lock — Art Pack  *(formerly Chaff Wars — name is FINAL, Stephen's pick 2026-07-19)*

> The best damn Mean Bean Machine remake on the block. A crew of neon 80s ANIMAL B-BOYS in
> shiny parachute pants is bombing the Keeper's garden grey, and you pop chains to blast the
> color back. Pods POP, pieces LOCK, and poppin and lockin is the dance.

**Genre:** Puyo Puyo / Dr. Robotnik's Mean Bean Machine versus-puzzler (single-file HTML5 canvas, **540x960 portrait**). This pack skins the existing satellite `satellites/chaff-wars/index.html` (slug stays `chaff-wars`; display name is **Pop N Lock**). The engine, board, rules, AI and the 14-stage ladder do **not** change. The game already ships fully playable with ZERO art files (procedural neon pods with colorblind tag-shapes, emoji opponents, CSS chrome) — every sheet here is a drop-in upgrade behind an image-loaded check with the procedural draw as fallback.

---

## The world

**"Buff the Block," 1987.** The Grey Crew — fourteen graffiti-writing, breakdancing garden
animals in parachute pants — have rolled up on the Keeper's plot to buff it grey. Their wack
grey tags are the game's **Chaff** garbage. Your falling seedpods are fat spray-paint throwies;
every chain you pop buffs their grey off the wall and blasts the block back to neon. The boss
(Baron Greymould, the all-city KING) wants the whole valley grey and quiet. The secret duel
(the Ronin Hare, TAG 1BLADE) is the legendary solo writer who battles with one move and no crew.

---

## The look — pick one (I built the pack around option 1)

1. **Neon Boombox** ⭐ RECOMMENDED — a 1987 breakdance-movie poster crossed with a Saturday-morning
   cartoon: chunky cel-shaded cartoon animals with THICK black comic outlines, neon **airbrush**
   shading, spray-paint glow and subtle halftone dots. Reads instantly at phone size, matches the
   graffiti fiction, and MJ nails this look.
2. **Pure Cel '87** — flat TMNT/Alvin-era cel animation, no airbrush. Cleaner but less "graffiti."
3. **Blacklight Velvet** — everything painted like a blacklight poster. Gorgeous but risks murky
   thumbnails at 48px.

*Everything below is written for Neon Boombox. To ship an alternate, swap the STYLE paragraph
in each sheet — the layouts and slugs do not change.*

## THE LOCKED STYLE BLOCK (paste into every sheet, never fork it)

```
STYLE — "Neon Boombox" (Pop N Lock). 1987 breakdance movie poster meets Saturday-morning cartoon: chunky cel-shaded anthropomorphic ANIMAL characters with THICK black comic outlines, neon airbrush shading, spray-paint glow edges, subtle halftone dot texture. EVERY character is an animal B-BOY in SHINY NYLON PARACHUTE PANTS — baggy MC Hammer style, billowing at the thigh, cinched at the ankle, glossy wet-nylon sheen with bright specular folds — plus 80s streetwear: high-top sneakers with fat laces, kangol and bucket hats, sweatbands, gold rope chains, boomboxes, cassette tapes, windbreakers. Cheerful swagger, kid-friendly, big expressive cartoon eyes, NO menace, NO gore. Palette: night-alley near-black #0c0a06 base; hot magenta #FF2FB9; electric cyan #2FF0E0; voltage yellow #FFD21A; neon lime #39FF14; ultra purple #C24BFF; plus each character's own accent (listed per sheet). Lighting: neon-sign rim light from one side, cool moonlight fill, characters pop off dark backgrounds. Rendering: bold flat cels + airbrush gradients, NO photorealism, NO 3D render, NO text/watermark baked into character sprites (words are drawn by the engine or live on the dedicated logo sheet). Deliver every sprite knocked out on flat magenta #FF00FF.
```

**Cut-safety note:** the cutter uses border-flood + inpaint (never a global magenta key), so
interior hot-pink/magenta hues in the ART are safe — but keep character rim-lights and glows
off pure #FF00FF, and never let a glow bleed into the knockout background.

---

## The crew (per-character law — every sheet obeys this table)

IDs are the engine's `ROSTER` ids and are FROZEN. Accent = the neon `ac` already wired to that
character's board frame in code. Pants = their parachute-pants color (contrast to accent).

| # | id | Name | Animal b-boy | TAG | Signature move | Accent | Parachute pants | Gear |
|---|---|---|---|---|---|---|---|---|
| 0 | `aphid-swarm` | The Aphid Swarm | a MOB of tiny aphids, every one in tiny pants | TOYZ | the crowd Wave | `#39FF14` | tiny magenta pairs | one shared giant boombox |
| 1 | `gnat-king-cole` | Gnat King Cole | gnat, the crew DJ | KOLE | turntable scratch spin | `#2E8BFF` | violet | headphones, one wing on the wax |
| 2 | `cabbage-moth` | Mabel Cabbagewing | cabbage moth fly girl | FLUTTA | the Butterfly into backspin | `#22E0E0` | hot pink | white kangol, wing "cape" |
| 3 | `slug-slugmore` | Sir Reginald Slugmore | shell-less slug, posh popper | SLIME | the Robot, slow-mo glide | `#B06FE0` | slime green | monocle, tuxedo jacket over pants |
| 4 | `cutworm` | Chompers the Cutworm | cutworm floor cutter | KUTT | the Worm (obviously) | `#FF7A18` | acid green | sweatband the length of him |
| 5 | `june-beetle` | Baron von Beetle | june beetle power head | SCARAB | windmills and flares | `#1FC7B0` | gold | shell worn like a windbreaker |
| 6 | `garden-snail` | Escargeddon | snail heavyweight breaker | GEDDON | the shell spin / backspin | `#E07B3A` | neon lime | BOOMBOX SHELL (speakers in the spiral) |
| 7 | `crow-cawlin` | Cawlin the Crow | crow bomber and lookout | KAWZ | the Crow freeze, air moves | `#2FF0E0` | violet-black | aviator shades, spray cans in a bandolier |
| 8 | `gopher-gustavo` | Gustavo the Gopher | gopher underground plug | DIGZ | prairie-dog pop-up freeze | `#E0A03A` | turquoise | miner headlamp worn as headband |
| 9 | `deer-duchess` | Duchess Dapple | deer style queen | DAPPL | uprock with high kicks | `#FF5C8A` | gold lame | leg warmers over the cinched ankles |
| 10 | `bindweed-lady` | Lady Bindweed | bindweed vine contortionist | VINE | thread-the-needle pretzel freeze | `#FF3BC0` | neon green | vine ribbons as arm sleeves |
| 11 | `powdery-mildew` | Miss Mildew | mildew spore fog-glider | HAZE | the moonwalk glide, powder trail | `#B8A6C8` | toxic green | fog rolling off her ankles |
| 12 | `baron-greymould` | Baron Greymould **BOSS** | grey mould royalty, all-city KING | GREYKING | the King's Freeze crown pose | `#7BFF2A` | royal purple | crown, grey fur coat, sickly green neon |
| 13 | `ronin-hare` | The Ronin Hare **SECRET** | lone hare, solo legend | 1BLADE | endless headspin into sword-arm freeze | `#E0433F` | black with crimson sash | headband, wooden bokken, no crew |
| — | `keeper` | The Keeper **PLAYER** | the gardener writer | (player's own) | calm spray-can stance | sage/gold | sage | gardening gloves, one neon spray can |

**Pods stay procedural** (neon throwies with colorblind tag-shapes drawn in code — do NOT
generate pod sprites, do NOT rotate the 5 pod hues). **Chaff stays grey** (colorblind-neutral).

---

## Sheets (generate in this order — one file each, standalone)

| Do | File | What | Cells |
|---|---|---|---|
| 1 | `01-sheet-01-crew-a.md` | Stages 0-2 crew, idle + win + lose | 3x3 |
| 2 | `02-sheet-02-crew-b.md` | Stages 3-5 crew, idle + win + lose | 3x3 |
| 3 | `03-sheet-03-crew-c.md` | Stages 6-8 crew, idle + win + lose | 3x3 |
| 4 | `04-sheet-04-crew-d.md` | Stages 9-11 crew, idle + win + lose | 3x3 |
| 5 | `05-sheet-05-heroes.md` | Boss + Ronin + Keeper, idle + win + lose | 3x3 |
| 6 | `06-sheet-06-backgrounds.md` | Battle alley + menu wall (2 full-bleed prompts) | full |
| 7 | `07-sheet-07-logo.md` | POP N LOCK wildstyle burner logo (lettered — expect MJ retries) | single |
| 8 | `08-sheet-08-ui-chrome.md` | VS frame, banner plates (text-free), mode plates, countdown bursts | 4x4 |
| 9 | `09-sheet-09-fx.md` | Pop splat, chaff splat, buff wipe, power aura (optional/polish) | 4x4 |

**MJ plan rules (Stephen's $30 Standard):** relax mode always; batch 4 per prompt and pick;
lock a seed from the first crew sheet you like and reuse it on the other four crew sheets
for consistency; upscale only final picks.

**Pipeline:** drop raw PNGs to `satellites/chaff-wars/art-drop/` (commit raws first, ledger
rule), cut via border-flood, wire behind image-loaded checks with procedural fallback. Log
LISTED → DROPPED in `art-asset-lists/ART-LEDGER.md`.
