# Sheet 08 — UI / HUD / DMD / Logo Lockup

All UI furniture for Blobworks — the title logo, the in-play HUD plates, and the clay chrome behind every DOM screen. Every piece is TEXT-FREE except `logo_blobworks` (the engine draws all score numbers, labels, quest names, and the word TILT itself).

```
STYLE — "Midnight Monster Lab" claymation (Blobworks pinball). Top-down 90 degree orthographic pinball art, hand-sculpted MODELLING CLAY / plasticine, stop-motion look (Aardman / Gumby / Morph). Every object is a little clay model: visible thumbprint dents, tool-scrape seams, soft rounded edges that wobble slightly (never perfectly geometric), matte plasticine sheen with ONE soft desk-lamp highlight, tiny pressed-in dust/lint flecks, a gentle contact shadow underneath. Goofy-friendly monsters — googly eyes, buck teeth, one stubby horn, big grins; cute NOT scary, no gore, no menace. Palette: dark clay lab-bench base #22202a, slate shadow #16151d; slime green #86d24a + deep monster teal #37b3a0; goop purple #9b6fd4; eyeball cream #f1ede2 with iris #4fa3d1 + black pupil; hazard yellow #f4c93a; danger red #e5533d; brass machine #c8a84b + warm lamp cream #efe6d2; gum-pink tongue #e88ba0. Lighting: one warm desk-lamp from top-center, cool moonlight fill, dark drop-off toward the middle of the table so the moving eyeball ball + bumpers pop. Rendering: photographed-clay feel — soft studio light, subtle grain, NO vector-flat, NO neon glow-blowout, NO photoreal humans, NO text / watermark / UI baked into sprites (letters are drawn by the engine). Everything reads at small size on a 540x960 phone table. Consistent top-down view for all playfield pieces (no perspective tilt). Deliver each sprite knocked out on a flat magenta #FF00FF background.
```

## Sheet layout

Generate the whole sheet at **2048 x 2048 px**, pure flat magenta `#FF00FF` knockout background, no gradient/texture/shadow on the background. Even margins and gutters throughout so a fixed-pitch cutter can slice cleanly; no sprite touches a cell edge and no magenta bounces onto the clay.

Conceptual grid = **4 columns of 512px pitch**, with a few pieces spanning columns. Read it top to bottom in bands:

- **Band A (top, full 2048 width, ~560px tall):** `logo_blobworks` centered, rendered ~900px wide (the one baked-text piece).
- **Band B (~340px tall):** `dmd_band` spanning columns 1-3 (wide banner) and `quest_banner` spanning columns 3-4 (wide clipboard ribbon), evenly gapped.
- **Band C (~300px tall):** `score_plate`, `mult_plate`, then `tilt_card` (big placard, spans two columns).
- **Band D (~300px tall):** button pairs — `btn_primary` idle+pressed, `btn_small` idle+pressed, `btn_icon` idle+pressed — six cells in a row, idle above / pressed directly below where space allows, equal gutters.
- **Band E (bottom, ~540px tall):** `panel_frame` (large, spans columns 1-2 as a 9-slice tile) and the `how_furniture` doodads clustered in columns 3-4.

On-table render sizes (540x960 phone table): logo ~460px wide on the title screen; `dmd_band` ~500px wide top callout; `quest_banner` ~470px wide; `score_plate`/`mult_plate` ~120px wide gauges; `tilt_card` ~360px wide; `btn_primary` ~240x64, `btn_small` ~150x52, `btn_icon` ~56x56; `panel_frame` stretched as a 9-slice to ~500x760; `how_furniture` doodads ~120px each. Sculpt every piece with a little extra edge margin so the 9-slice / cutter has clean gutter.

**CSS backgrounds (DOM `.screen` chrome — sliced or stretched behind HTML):** `logo_blobworks`, `panel_frame`, `tilt_card`, `how_furniture`, `btn_primary`, `btn_small`, `btn_icon` (both states).
**Canvas blits (drawn every frame in the in-play HUD):** `dmd_band`, `score_plate`, `mult_plate`, `quest_banner`. These four MUST be text-free — the canvas engine writes the numbers/labels on top.

## Assets

- `logo_blobworks` — The game LOGO LOCKUP. The single word **"Blobworks"** modelled as chunky, hand-rolled plasticine letters, each letter a fat rounded clay slab in alternating slime green `#86d24a` and deep teal `#37b3a0`, a couple of letters wearing tiny googly eyeball beads (cream `#f1ede2`, iris `#4fa3d1`) and one stubby brass `#c8a84b` horn. Mascot **Blip** — a one-eyed slime-green clay blob with a big grin and a single googly eye — peeks over the top of the last "s", one stubby arm waving. Baked text lives ONLY here. ~900px wide on the sheet, subject fully inside frame. Small tight contact shadow only.
- `dmd_band` — TEXT-FREE clay callout banner PLATE that sits across the top of the table for score callouts. A long horizontal lozenge of dark lab-bench clay `#22202a` with a bevelled brass `#c8a84b` rim, thumbprint dents along the edge, and a slightly recessed warm-lamp-cream `#efe6d2` inset panel in the middle (blank — the engine writes on it). Two tiny goop-purple `#9b6fd4` clay rivets at each end. Wide, low, symmetrical.
- `score_plate` — Small TEXT-FREE clay gauge plate for the score readout. A rounded square tile of brass `#c8a84b` clay with a sunken teal `#37b3a0` display well (blank), one soft desk-lamp highlight top-left, a single hazard-yellow `#f4c93a` clay dot in the corner. Chunky, cute, thumbprinted.
- `mult_plate` — Small TEXT-FREE clay multiplier gauge, a sibling to `score_plate` but rounder and slightly smaller. Slime-green `#86d24a` clay body, a blank cream `#efe6d2` readout well, a tiny stubby horn nub on top and a pressed-in danger-red `#e5533d` bead for "hot multiplier" flavor. Matte, wobbly-edged.
- `quest_banner` — TEXT-FREE clay clipboard / ribbon for quest names + timer. A little hand-sculpted clipboard of dark clay `#22202a` with a brass `#c8a84b` bulldog clip at the top, a blank warm-cream `#efe6d2` paper inset, and a curled gum-pink `#e88ba0` ribbon tail hanging off one corner. Reads as a to-do note; leave the paper blank.
- `tilt_card` — Big goofy "whoa!" clay warning PLACARD for TILT (text-free — engine writes TILT across it). A fat rounded diamond/road-sign slab of hazard-yellow `#f4c93a` clay with a thick danger-red `#e5533d` clay border, hand-drawn wobble/shake lines pressed into the clay radiating out, two big worried googly eyes near the top and a wavy nervous mouth. Blank center for the engine label. Cute-panic, not scary.
- `btn_primary` — Large clay push-button, IDLE state. A wide rounded-rectangle pill of slime-green `#86d24a` clay with a raised bevel, brass `#c8a84b` rim, one soft desk-lamp highlight along the top edge, thumbprint texture, blank face (engine draws the label). Reads as clickable and springy.
- `btn_primary_down` — The PRESSED variant of `btn_primary`: same pill pushed in, flatter, darker teal-tinted `#37b3a0` face, highlight dimmed, a deeper contact shadow so it reads as depressed. Same footprint so it swaps cleanly.
- `btn_small` — Small clay push-button, IDLE. A shorter rounded pill of goop-purple `#9b6fd4` clay, brass `#c8a84b` rim, single top highlight, blank face. Chunky and friendly.
- `btn_small_down` — PRESSED variant of `btn_small`: pushed-in, muted, deeper inset shadow, highlight dimmed. Same footprint.
- `btn_icon` — Small square/round clay ICON button, IDLE. A rounded chip of brass `#c8a84b` clay with a raised bevel and a soft top-left highlight, blank center (engine draws the glyph). 48px+ touch target feel, thumbprinted.
- `btn_icon_down` — PRESSED variant of `btn_icon`: depressed, darker `#22202a`-tinted face, tighter shadow, dimmed highlight. Same footprint.
- `panel_frame` — Clay-edged PANEL for menu / gameover / how screens, built as a stretchy 9-slice tile. A thick rounded-rectangle frame of dark lab-bench clay `#22202a` with a bevelled brass `#c8a84b` inner rim, thumbprint dents and tool-scrape seams around the border, corners slightly fatter, and a large flat slate `#16151d` center well (blank, the DOM content sits inside). Even margins on all four sides so the engine can 9-slice it without warping the corners.
- `how_furniture_arrow` — A How-To diagram doodad: a fat stubby clay POINTING ARROW / directional dart in hazard-yellow `#f4c93a` with a brass tip, thumbprinted, one highlight. Playful signage for the how-to page.
- `how_furniture_hand` — A How-To diagram doodad: a chubby three-finger clay MITT / pointing hand in slime-green `#86d24a` (matching the flipper claws), one googly-eye bead on the wrist, tapping gesture. For "tap here" instructions.
- `how_furniture_spark` — A How-To diagram doodad: a small clay STAR-BURST / zap emphasis mark in warm-lamp-cream `#efe6d2` with a goop-purple `#9b6fd4` core bead, wobbly hand-cut points. For highlighting a step.

## Copy-paste prompt

> handmade plasticine claymation model, hand-sculpted modelling clay, stop-motion character, macro studio photograph of real clay figurines, Aardman / Gumby / Morph plasticine look; visible fingerprint smudges, thumbprint dents, sculpting-tool scrape marks, faint seam lines, tiny lint and dust specks, soft rounded hand-rolled edges, matte-to-satin waxy Plasticine sheen NOT glossy; shot on a lightbox with soft diffuse softbox lighting, one warm desk-lamp key from top-center plus cool moonlight fill, 100mm macro lens, subtle grain; chunky rounded proportions, big friendly oversized googly eyes, gentle grins, wholesome cheerful toy monsters, cute not scary. Limited consistent color palette, same colors across every piece, no new hues: dark lab-bench base #22202a, slate shadow #16151d, slime green #86d24a, deep monster teal #37b3a0, goop purple #9b6fd4, eyeball cream #f1ede2, iris blue #4fa3d1, hazard yellow #f4c93a, danger red #e5533d, brass #c8a84b, warm lamp cream #efe6d2, gum-pink #e88ba0.
>
> A single sprite SHEET of clay UI furniture for a monster-lab pinball game, evenly spaced grid, equal margins and gutters, consistent scale and finish per cell, one unified art style, isolated on a solid flat even chroma-key magenta #FF00FF background, pure #FF00FF fill, no gradient, no texture, no shadow on the background, clean cutout, subject fully inside each cell, no part touching edges, no magenta spill on the clay.
>
> TOP BAND (full width, big): the game LOGO — the word "Blobworks" sculpted as chunky fat hand-rolled clay letters, alternating slime green #86d24a and deep teal #37b3a0, a couple of letters with tiny googly eyeball beads and one small brass horn; a one-eyed slime-green clay blob mascot with a big grin peeking over the last letter and waving a stubby arm. This is the only cell with letters.
>
> SECOND BAND (text-free, blank display areas): a long horizontal clay callout banner plate — dark #22202a clay lozenge, brass #c8a84b rim, recessed blank warm-cream #efe6d2 inset, purple rivets at the ends; beside it a small clay clipboard ribbon — dark clay board with a brass bulldog clip, a blank cream paper inset, and a curled gum-pink ribbon tail.
>
> THIRD BAND (text-free): a small brass #c8a84b clay score gauge tile with a sunken blank teal display well and a yellow corner dot; a smaller rounder slime-green #86d24a multiplier gauge with a blank cream well, a stubby horn nub and a red bead; and a big goofy hazard-yellow #f4c93a diamond warning placard with a thick danger-red #e5533d border, pressed-in wobble shake-lines, two worried googly eyes and a nervous wavy mouth, blank center.
>
> FOURTH BAND: clay push-buttons in idle AND pressed pairs — a wide slime-green #86d24a pill primary button (raised, blank face) and its pushed-in darker teal pressed version; a shorter goop-purple #9b6fd4 small button and its pressed version; a rounded brass #c8a84b square icon button and its pressed version. All blank faces, chunky bevels, one soft top highlight, deeper inset shadow on the pressed ones.
>
> BOTTOM BAND: a large rounded clay PANEL frame — thick dark #22202a border with a bevelled brass #c8a84b inner rim, thumbprinted, fat corners, a big flat blank slate #16151d center well, even margins all four sides for 9-slice; and a small cluster of how-to diagram doodads — a fat stubby hazard-yellow pointing arrow with a brass tip, a chubby three-finger slime-green pointing mitt with a googly-eye bead, and a small cream star-burst zap mark with a purple core.
>
> Small tight contact shadow only under each piece, no cast shadow. All items same clay style, same lighting, same palette, same matte finish, cohesive set.
>
> **Negative prompt (paste into --no / negative field):** photoreal human, realistic skin, glossy plastic, shiny CGI render, 3D render, neon glow, bloom, lens flare, extra text, watermark, signature, logo, drop shadow, blurry soft shadow, gradient background, vector, flat illustration, cel-shaded, hard outline.

## Wire

HUD (canvas blits): `dmd_band` → top callout draw, `score_plate` + `mult_plate` → HUD gauge draw, `quest_banner` → quest strip draw (engine overlays all score/mult/callout/quest text; floats stay procedural text). DOM `.screen` CSS backgrounds: `logo_blobworks` → title screen, `panel_frame` → menu/gameover/how panels (9-slice), `tilt_card` → tilt overlay (engine writes TILT), `btn_primary`/`btn_small`/`btn_icon` (+`_down`) → button up/active states, `how_furniture_*` → how-to page diagram art.
