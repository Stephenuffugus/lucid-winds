# Sheet 11 — 💰 COSMETICS CATALOG — Skins + Monster-Buddy Cameos

Earn-only visual customization for Blobworks pinball: alternate table backdrops, flipper-claw skins, eyeball-ball skins, and 8 decorative monster-buddy cameos re-sculpted from existing companions. Pure cosmetic — swaps the art the engine already draws, never touches physics or score.

```
STYLE — "Midnight Monster Lab" claymation (Blobworks pinball). Top-down 90 degree orthographic pinball art, hand-sculpted MODELLING CLAY / plasticine, stop-motion look (Aardman / Gumby / Morph). Every object is a little clay model: visible thumbprint dents, tool-scrape seams, soft rounded edges that wobble slightly (never perfectly geometric), matte plasticine sheen with ONE soft desk-lamp highlight, tiny pressed-in dust/lint flecks, a gentle contact shadow underneath. Goofy-friendly monsters — googly eyes, buck teeth, one stubby horn, big grins; cute NOT scary, no gore, no menace. Palette: dark clay lab-bench base #22202a, slate shadow #16151d; slime green #86d24a + deep monster teal #37b3a0; goop purple #9b6fd4; eyeball cream #f1ede2 with iris #4fa3d1 + black pupil; hazard yellow #f4c93a; danger red #e5533d; brass machine #c8a84b + warm lamp cream #efe6d2; gum-pink tongue #e88ba0. Lighting: one warm desk-lamp from top-center, cool moonlight fill, dark drop-off toward the middle of the table so the moving eyeball ball + bumpers pop. Rendering: photographed-clay feel — soft studio light, subtle grain, NO vector-flat, NO neon glow-blowout, NO photoreal humans, NO text / watermark / UI baked into sprites (letters are drawn by the engine). Everything reads at small size on a 540x960 phone table. Consistent top-down view for all playfield pieces (no perspective tilt). Deliver each sprite knocked out on a flat magenta #FF00FF background.
```

## Sheet layout

This catalog is delivered as **two physical generations** because full-bleed backdrops cannot share a knockout grid with cut sprites:

**Part A — Table backdrops (4 separate renders, full-bleed, NO magenta).** Generate each backdrop individually at **540x960 portrait**, filling the entire frame edge-to-edge (these ARE the background, so there is nothing to knock out). Every backdrop MUST keep the default **dark-center drop-off rule**: edges/counters lit, the middle of the table sinks toward #16151d so the moving eyeball ball and the three chomping bumper-heads pop. Keep the deployed long edge ≤1600px so the Hostinger resizer leaves it alone. On-table size: full 540x960.

**Part B — Props sheet (one cuttable grid).** Generate at **2048x2048**, a **4-column × 6-row grid (24 cells, 22 used)**, ~512px cell pitch with even ~64px margins and gutters so a fixed-pitch cutter slices it cleanly. Each sprite sits centered in its cell occupying ~380px, fully inside frame, on a **flat even magenta #FF00FF knockout** with only a small tight contact shadow. Grid order (left→right, top→bottom):

```
Row 1:  claw_crab_rest    claw_crab_up      claw_robot_rest    claw_robot_up
Row 2:  claw_ovenmitt_rest claw_ovenmitt_up claw_tentacle_rest claw_tentacle_up
Row 3:  ball_gumball      ball_brain        ball_moon          ball_disco
Row 4:  ball_meatball     ball_snowglobe    buddy_firefly      buddy_koi
Row 5:  buddy_toad        buddy_cicada      buddy_garden_spider buddy_luna_moth
Row 6:  buddy_raccoon     buddy_baby_mammoth  (empty)           (empty)
```

On-table render sizes: claws ~110x70px each state, balls ~28px, buddies ~40px. All claw rest/up pairs must be the SAME sculpt in two poses (rest = low/relaxed, up = flicked/raised) so they animate on-model.

## Assets

### Table skins (full-bleed 540x960 backdrops)
- `skin_table_old_reel` — the default lab bench aged into an 8mm home-movie reel: warm sepia-amber cast over #22202a, heavy film grain, hairline scratches and dust flicker, soft vignette corners, a single warm lamp-cream #efe6d2 flare top-center. Nostalgic grainy stop-motion. Center still sinks dark so the ball pops.
- `skin_table_chrome_lab` — premium tier. Same bench re-sculpted in polished chrome-grey clay with brass #c8a84b rivets and edge trim, cool moonlight fill, satin mirror-sheen counters (still matte plasticine, never glossy-plastic), teal #37b3a0 accent piping. Clean, expensive, dark-center.
- `skin_table_toxic` — bubbling acid-green makeover: slime-green #86d24a and teal #37b3a0 goop pools with rising clay bubbles and drips, hazard-yellow #f4c93a warning chevrons striping the outer rails, a sickly moon-lit glow at the edges dropping to #16151d in the middle.
- `skin_table_day` — bright cheerful daytime version: warm lamp-cream #efe6d2 sunlight flooding the whole bench, sunny slime-green-and-cream palette, chipper mood. Even in daylight the table center is kept a touch darker so the eyeball ball reads.

### Flipper / claw skins (rest + up pairs, magenta knockout)
- `skin_claw_crab_rest` / `skin_claw_crab_up` — a chunky orange-red #e5533d clay crab pincer, one googly eye pressed onto the knuckle, buck-tooth grin under it. Rest = pincer closed and low; up = pincer gaped open and flicked upward.
- `skin_claw_robot_rest` / `skin_claw_robot_up` — a brass machine pincer #c8a84b sculpted in clay, bolt-heads and a riveted hinge, a tiny danger-red #e5533d LED bead for an eye. Rest = low and idle; up = snapped up at the hinge.
- `skin_claw_ovenmitt_rest` / `skin_claw_ovenmitt_up` — a quilted gum-pink #e88ba0 oven-mitt monster hand, pressed-in stitch seams, a stubby thumb and a shy smile at the cuff. Rest = flopped down cozy; up = raised and ready.
- `skin_claw_tentacle_rest` / `skin_claw_tentacle_up` — a goop-purple #9b6fd4 suckered tentacle curl with teal #37b3a0 tips and one googly eye at the base. Rest = coiled low; up = uncurled and flicked skyward.

### Ball / eyeball skins (~28px, magenta knockout)
- `skin_ball_gumball` — a round candy gumball marble in gum-pink #e88ba0 dotted with tiny slime-green and hazard-yellow sprinkle flecks pressed into the clay, one soft lamp highlight.
- `skin_ball_brain` — a little pink-cream wrinkled clay brain marble, sculpted grooves and folds, faint teal sheen in the crevices.
- `skin_ball_moon` — a cream-grey #f1ede2 cratered moon marble, thumbprint craters dented across it, cool moonlight side and warm lamp side.
- `skin_ball_disco` — a mirror-ball built from tiny hand-cut clay facet tiles, catching the lamp in teal #37b3a0 and goop-purple #9b6fd4 glints; sparkly but matte-clay, not neon.
- `skin_ball_meatball` — a browned savory clay meatball with a single green herb fleck pressed on top, warm and round.
- `skin_ball_snowglobe` — a clear-dome snowglobe marble with a teensy one-eyed clay monster sculpted inside and white flecks of "snow," brass #c8a84b base ring.

### Monster-buddy cameos (~40px, decorative, magenta knockout)
Re-sculpts of 8 existing companions as goofy clay buddies that park beside a bumper — no physics, no collision.
- `buddy_firefly` — a round slime-green #86d24a blob-bug with a warm gold #f4c93a glowing lantern-belly, two stubby wings, one big googly eye and a grin.
- `buddy_koi` — a plump danger-red-and-cream #e5533d koi arched mid-swim, teal #37b3a0 fins, googly eye, tiny kissy mouth.
- `buddy_toad` — a squat teal #37b3a0 warty toad with a wide buck-tooth grin and a gum-pink #e88ba0 throat pouch puffed out.
- `buddy_cicada` — a chunky slime-green #86d24a cicada, folded translucent-look clay wings pressed with vein seams, two oversized cream eyes.
- `buddy_garden_spider` — a friendly round hazard-yellow #f4c93a and charcoal spider, eight stubby dented legs, a little cluster of googly eyes and a smile.
- `buddy_luna_moth` — a pale slime-green luna moth with long trailing hindwing tails, feathery antennae, a fuzzy cream #efe6d2 body.
- `buddy_raccoon` — a grey clay raccoon blob with a cream-and-charcoal bandit mask, a striped tail curled around, two little cupped hands.
- `buddy_baby_mammoth` — a tiny fuzzy brown mammoth, stubby cream tusks, trunk curled up in a wave, one stubby stomping foot, googly eyes.

## Copy-paste prompt

**PRIMARY — Part B props sheet (paste as one image):**

> handmade plasticine claymation model, hand-sculpted modelling clay, stop-motion character, macro studio photograph of real clay figurines, Aardman / Gumby / Morph plasticine look, matte-to-satin Plasticine sheen soft waxy finish NOT glossy, visible fingerprint smudges and thumbprint dents and sculpting-tool scrape marks and faint seam lines, tiny lint and dust specks, soft rounded hand-rolled edges, shot on a lightbox with soft diffuse softbox lighting, one warm desk-lamp highlight from top-center plus cool moonlight fill, 100mm macro lens shallow depth of field. STYLE — Midnight Monster Lab claymation Blobworks pinball, goofy-cute NOT scary, googly eyes, buck teeth, big friendly grins, chunky rounded proportions. Limited consistent palette, same colors across every cell, no new hues: dark clay base #22202a, slate shadow #16151d, slime green #86d24a, monster teal #37b3a0, goop purple #9b6fd4, eyeball cream #f1ede2, iris blue #4fa3d1, hazard yellow #f4c93a, danger red #e5533d, brass #c8a84b, lamp cream #efe6d2, gum-pink #e88ba0. A sprite sheet on a solid flat even chroma-key magenta #FF00FF background, pure #FF00FF fill no gradient no texture, small tight contact shadow only no cast shadow, every subject fully inside its cell not touching edges, no magenta spill on the models, strict top-down bird's-eye orthographic view zero perspective camera pointing straight down. Evenly spaced 4-column by 6-row grid, equal margins and gutters, consistent scale per cell, 22 cells used and 2 empty magenta cells. Row 1: an orange-red clay crab-pincer flipper with a googly-eye knuckle — first closed-and-low, then gaped-open-and-raised; then a brass riveted robot pincer flipper with a red LED eye — first low, then snapped up. Row 2: a quilted gum-pink oven-mitt monster hand with stitch seams — first flopped down, then raised; then a goop-purple suckered tentacle with teal tips and a googly eye — first coiled low, then uncurled up. Row 3: four small clay marbles — a gum-pink sprinkle gumball, a pink wrinkled brain, a cream-grey cratered moon, a faceted teal-and-purple disco mirror-ball. Row 4: a browned herb-flecked meatball marble, a clear-dome snowglobe marble with a tiny one-eyed monster inside; then two ~40px clay buddy critters — a slime-green firefly with a glowing gold belly, a plump red-and-cream koi with teal fins. Row 5: a squat teal warty toad with a pink throat, a green cicada with folded veined wings and big cream eyes, a friendly yellow-and-charcoal spider with a cluster of googly eyes, a pale-green luna moth with long tails and feathery antennae. Row 6: a grey bandit-masked raccoon blob with a striped tail, a fuzzy brown baby mammoth with stubby tusks and trunk raised in a wave, then two empty magenta cells. All items same clay style, same lighting, same palette, same finish, cohesive set. Negative: photoreal human, realistic skin, glossy plastic, shiny CGI render, 3D render, neon glow, bloom, lens flare, text, watermark, signature, logo, drop shadow, gradient background, vector, flat illustration, outline.

**Part A — table backdrops (generate each SEPARATELY at 540x960, full-bleed, NO magenta).** Keep Line 1 byte-identical, swap only Line 2:

> **Line 1 (all four):** handmade plasticine claymation set photographed on a lightbox, hand-sculpted modelling clay lab bench, matte waxy Plasticine sheen NOT glossy, visible thumbprint dents and tool-scrape seams and dust flecks, one warm desk-lamp from top-center plus cool moonlight fill, strict top-down orthographic view camera straight down, a dark drop-off toward the CENTER of the table sinking to #16151d so a moving ball would pop, no text no UI no watermark, fills the entire 540x960 vertical frame edge to edge, palette #22202a #16151d #86d24a #37b3a0 #9b6fd4 #f4c93a #e5533d #c8a84b #efe6d2 #e88ba0.
> **Line 2 `skin_table_old_reel`:** aged 8mm home-movie version, warm sepia-amber cast, heavy film grain, hairline scratches, dust flicker, soft vignette corners, nostalgic grainy stop-motion mood.
> **Line 2 `skin_table_chrome_lab`:** premium polished chrome-grey clay bench with brass #c8a84b rivets and trim, cool moonlight, satin mirror-sheen counters (still matte clay), teal accent piping, clean and expensive.
> **Line 2 `skin_table_toxic`:** acid-green makeover, bubbling slime-green #86d24a and teal goop pools with rising clay bubbles and drips, hazard-yellow #f4c93a warning chevrons on the outer rails, sickly moonlit glow.
> **Line 2 `skin_table_day`:** bright cheerful daytime, warm lamp-cream sunlight flooding the bench, sunny slime-green-and-cream palette, chipper wholesome mood (center still a touch darker).

## Unlock faucets

Pure visual, earn-only, **no loot boxes, no purchase path, no physics/score/payout effect.** Selected skins persist in `localStorage.gp_skins`. Every gate reads existing progress values.

| Cosmetic (gp_skins key) | Type | Faucet | Unlock condition |
|---|---|---|---|
| `skin_table_old_reel` | Table | Best-score tier | `PROG.best ≥ 250000` |
| `skin_table_chrome_lab` | Table | MEGA-MASH mastery | 10 MEGA-MASH wizard clears |
| `skin_table_toxic` | Table | Daily-streak | 14-day streak |
| `skin_table_day` | Table | Seasonal rotation | Active in Spring + Summer window |
| `skin_claw_crab` | Claw | Best-score tier | `PROG.best ≥ 50000` |
| `skin_claw_robot` | Claw | MEGA-MASH mastery | 5 MEGA-MASH clears |
| `skin_claw_ovenmitt` | Claw | Daily-streak | 7-day streak |
| `skin_claw_tentacle` | Claw | Seasonal rotation | Active in Autumn window |
| `skin_ball_gumball` | Ball | Blooms earned | `PROG.blooms ≥ 25` |
| `skin_ball_brain` | Ball | Best-score tier | `PROG.best ≥ 100000` |
| `skin_ball_moon` | Ball | Daily-streak | 30-day streak |
| `skin_ball_disco` | Ball | MEGA-MASH mastery | 3 MEGA-MASH clears |
| `skin_ball_meatball` | Ball | Seasonal rotation | Active in Autumn window |
| `skin_ball_snowglobe` | Ball | Seasonal rotation | Active in Winter window |
| `buddy_firefly` | Buddy cameo | Companion-owned | Own Firefly companion |
| `buddy_koi` | Buddy cameo | Companion-owned | Own Koi companion |
| `buddy_toad` | Buddy cameo | Companion-owned | Own The Toad companion |
| `buddy_cicada` | Buddy cameo | Companion-owned | Own The Cicada companion |
| `buddy_garden_spider` | Buddy cameo | Companion-owned | Own Garden Spider companion |
| `buddy_luna_moth` | Buddy cameo | Companion-owned | Own Luna Moth companion |
| `buddy_raccoon` | Buddy cameo | Companion-owned | Own Raccoon companion |
| `buddy_baby_mammoth` | Buddy cameo | Companion-owned | Own Baby Mammoth companion |

## Wire

Table skins swap the **Sheet 01** backdrop draw source; claw skins swap the **Sheet 02** flipper rest/up draw pair; ball skins swap the **Sheet 03** eyeball-ball draw source — each reads the selected key from `gp_skins` and falls back to the default sprite when unset or unlocked-but-not-equipped. Buddy cameos are an **extra decorative draw pass** rendered near a bumper anchor (no collision body, no score hook). All availability is gated on `PROG.blooms` / `PROG.best` + daily-streak counter + seasonal window + companion ownership per the table above.
