# Fleet art detail — satellites (119 games)

Per-game working list. Master doc, cross-cutting jobs and art batches: `FLEET-ART-AUDIT-SEP04.md`.

---

## POOR — looks unfinished or accidental  (4)

### Petal Alchemy
`petal-alchemy` · satellite · creative · first committed 2026-07-10 · impact 5/5 · effort M
`satellites/petal-alchemy/index.html`

**Now:** Play screen is a five-emoji row under a search box, then roughly 430px of pure black with nothing in it, then a combine tray of three near-identical dark rectangles at the bottom. The header is covered by the music chip. Boot is a flat black page with a hot pink wordmark and a solid pink button slab. Zero images in the entire game - 1 asset file, the og card.

**Wrong with it:**
- The music chip sits squarely on #pa-top: it completely covers the back arrow button and the left half of the 'Free Alchemy / 5 discovered' label - only 'tal A[l]chemy' and 'ed' show around it.
- Over half the play screen is empty black - #pa-shelf holds five tiles in one row and then leaves roughly y=180 to y=600 as bare #0b0f0b with no empty state, no art, nothing composed.
- Every ingredient is a raw emoji, and Soil (index.html:249, soil:['Soil','brown square emoji',...]) is the literal brown square emoji - a UI colour swatch standing in for a painted ingredient.
- The bottom combine tray is three near-identical near-blacks: .slot #0f150c on a #pa-tray of #0e140d with a dashed --line border, so the '+ = play' row is almost invisible and only the gold arrow reads.
- The 'Blooms' button is flush against the right screen edge and reads as clipped, and on the title screen the pink .btn.primary slab (#d98fa6 to #b2657c with a hard #6f2f42 bottom shadow) is the only saturated shape on the page and fights the pink title directly above it.

**Background now:** Nothing painted at all. html/body #000, .wrap radial-gradient(120% 80% at 50% 0%, #101610, #05070a, #000), stage flat #0b0f0b, #pa-top and #pa-tray flat #0e140d. No img tags, no inline SVG, no assets folder, no manifest, no ART map - there is no art-loading hook of any kind to hang a painting on.

**Background wanted:** A painted apothecary bench. This is the one game in the batch where a background would also solve the composition problem: the empty half of the play screen is exactly where a bench surface and shelved jars belong.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `satellites/petal-alchemy/assets/bg-bench-540x960.jpg` | 540x960 JPG, full-bleed, midnight apothecary bench: dark wood surface across the lower third, shelves of faintly glowing jars behind, one warm gold lamp pool top-centre, near-black at the extreme top and bottom so the header bar and tray still read | Replaces the flat radial gradient and fills the 430px of dead black under the element row. Also establishes the art hook this game does not currently have. |
| `satellites/petal-alchemy/assets/elem-air.png, elem-seed.png, elem-soil.png, elem-sun.png, elem-water.png` | 128x128 transparent PNGs each: a pollen-lit curl of wind; a seed with a split husk; a crumb of dark loam on a leaf; a small sun cabochon; a dew bead with a highlight. Warm rim light, big readable silhouette | Replaces the five base emoji, brown-square Soil worst of all. These five are on screen 100% of the time, so they are the highest-value five files in the batch. |
| `satellites/petal-alchemy/assets/tray-plate-375x120.png` | 375x120 transparent PNG, painted wooden combine tray with two carved recesses, a plus sign and equals sign inlaid in brass, and a gold arrow well at the right; full-bleed horizontally, transparent above | Replaces the three near-black rectangles at the bottom that currently make the core combine action nearly invisible. |
| `satellites/petal-alchemy/assets/shelf-empty-240x240.png` | 240x240 transparent PNG, a painted empty shelf bracket with one dusty jar, intended to render at about 25% opacity | Centred in #pa-shelf when few elements are discovered, so the void reads as an empty shelf waiting to fill rather than a page that failed to render. |

**CSS to do:**
- #pa-top (index.html:71) - reserve the top-left corner: add padding-left:118px when the music chip is present, or move #pa-back into the right-hand group; the chip currently sits on top of the back button.
- .slot (index.html:90) - background:#0f150c on a #0e140d bar is invisible; lift to #18210f with border:1px solid rgba(200,168,75,.4) so the two source slots read as slots.
- #pa-shelf - add align-content:flex-start plus a centred empty-state hint so the dead lower half is intentional instead of blank.
- #pa-count ('5 discovered') - currently muted grey under the chip; raise to rgba(232,220,200,.85) and add text-shadow:0 1px 2px #000.
- .btn.primary (index.html:53) - the pink linear-gradient(180deg,#d98fa6,#b2657c) with box-shadow 0 4px 0 #6f2f42 is off house palette on a midnight page; move the button to sage/gold and keep pink as the accent on .pill and discovery moments only.
- #pa-top - add padding-right:14px; the 'Blooms' tbtn currently touches the right screen edge.

**Emoji as art:** All of it - 138 emoji, 90 distinct, are the entire visual content of the game. The five base ingredients are wind, chestnut, brown square, sun and droplet emoji; brown square (Soil) is a colour swatch doing an ingredient's job.

**Readability:** #pa-count is muted grey and half-occluded by the chip. The tray slots are dark-on-dark and the combine row barely reads. Touch targets pass - .tile is min 82x72, .tbtn and .slot are 72px.

**Music chip:** Top-left, over #pa-top - it fully covers the back arrow button and the left half of the 'Free Alchemy / 5 discovered' header label.

**Looks broken** (confirmed on a second look, severity ugly)**:** Two visible faults in the -2play frame: the music chip fully occludes the back button and the left half of the header label in #pa-top, and roughly y=180 to y=600 of the playfield is bare #0b0f0b with no content, no empty state and no art. Nothing 404'd - the game genuinely has no images (assetFiles 1 = the og card). Only 404 is the known music artefact.

### Wild Wardens
`wild-wardens` · satellite · creative · first committed 2026-08-18 · **workbench-gated** · impact 5/5 · effort L
`satellites/wild-wardens/index.html`

**Now:** All three frames are the HOW TO PLAY gate, not the game - capture reached 'no-control' and the robot never got in. The modal is a black panel with a 3px gold border and five paragraphs of all-caps gold and cream body copy. Behind it, dimmed: 'WILD WARDENS' in a heavy dark-gold display face on pure black, a thin gold rule, an all-caps tagline, and a column of identical hollow outlined rectangles - WALK THE WILD, ROSTER, SKILL TREES, TERRITORY, INVENTORY, EQUIPMENT, MASTERY, DAILY QUESTS, REPLAY, NOMINATE A BAR, FIGHT (DEMO). Two colours in the entire frame: near-black and gold.

**Wrong with it:**
- In the boot frame the modal's own primary button, GOT IT, is below the fold at 375x667 - the last visible line is 'PROGRESS SAVES IN YOUR BROWSER.' sitting on the bottom edge, with no scroll cue and no visible panel bottom. That is the same fault the capture robot hit from its side when it reported 'no-control'.
- In the play and later frames the modal has scrolled and its 'HOW TO PLAY' heading is sliced in half by the top edge of the screen, while the round arcade-exit button floats on top of the modal's gold border at the top-left, overlapping it.
- Eleven menu buttons are eleven identical hollow rectangles - same width, same 1px border, same transparent fill, same all-caps label, equal gaps. 'WALK THE WILD', the only thing a new player should press, has exactly the same weight as 'NOMINATE A BAR' and the dev-only 'FIGHT (DEMO)'. Nothing is grouped, nothing is primary, and two labels wrap to a second line ('WALK THE / WILD', 'NOMINATE A / BAR') which makes those two boxes taller than the rest for no reason.
- The title is dark gold on pure black with no glow, no plate and no art behind it, and the tagline breaks to an orphan 'THE REAL WORLD' on its own line.

**Background now:** Nothing. index.html is a 1.7KB Expo / React Native Web loader; all styling lives as inline RN StyleSheet objects inside a 4MB JS bundle (_expo/static/js/web/entry-*.js). No stylesheet, no background-image declaration, no gradient anywhere. The page ground is flat black and every screen sits directly on it. The only PNGs shipped in the satellite are expo-router and react-navigation framework chrome (back-icon, close-icon, sitemap, unmatched) - zero game art in the whole folder.

**Background wanted:** A painted overgrown-place plate for the title: a moonlit clearing swallowed by vines, a warm lantern glow low on the left, near-black canopy at the top so the wordmark reads against it. Plus a darker, softer variant of the same forest behind the roster and skill-tree screens so the menus feel like one place instead of eleven boxes on void.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/art/bg-title-1080x2340.jpg` | full-bleed opaque. Moonlit overgrown clearing, vine-swallowed stonework, warm lantern glow low-left, deep near-black canopy across the top third. | Replaces the flat black title ground - currently the entire background of the game's front door is #000000. |
| `assets/art/logo-wardens-1024x512.png` | transparent PNG. Painted WILD WARDENS wordmark in warm gold with a rim light, a couple of leaves breaking the letterforms, a soft dark drop so it holds on any plate. | Replaces the plain dark-gold web-font title that currently disappears into the black behind it. |
| `assets/art/btn-plate-360x88.png` | transparent 9-slice PNG plus a brighter primary variant (btn-plate-primary-360x88.png). Weathered wood and brass, warm gold edge light, dark interior. | Replaces the eleven identical hollow outlines with a plate that can carry a hierarchy - primary for WALK THE WILD, quiet for the rest. |
| `assets/art/icon-menu-walk.png (plus roster, tree, territory, inventory, equipment, mastery, quests)` | 8 files, 128x128 transparent PNG, one small painted mark each, gold-on-dark, readable at 32px. | Gives each menu row its own silhouette so the front door stops being a stack of eleven identical boxes. |
| `assets/art/warden-portrait-512x512.png` | transparent PNG, one painted warden bust, warm rim light, big readable silhouette. | Puts a character on the title screen. Right now the front door of a creature-taming game shows no creature and no warden. |

**CSS to do:**
- The HOW TO PLAY modal container (RN style object in the bundle source): cap it at maxHeight '86%' and pin the GOT IT button in a non-scrolling footer row, so the primary action is never below the fold at 667px.
- Same modal: add top padding clear of the safe-area inset so the 'HOW TO PLAY' heading is not clipped by the screen edge once the body scrolls.
- The arcade-exit button: raise the modal above it in z-order, or hide the exit button while a modal is open, so it stops overlapping the modal's gold border at the top-left.
- The menu button style: give the primary (WALK THE WILD) a filled gold background with dark ink and drop the other ten to a lower-contrast outline; set an explicit height of 56 so the two wrapping labels stop producing taller boxes.
- Title text colour: raise the gold to at least #F8B800 with a soft dark shadow, or set it on a plate - dark gold on pure black is the lowest-contrast element on the screen.

**Emoji as art:** Almost none - 2 emoji total, 1 distinct (the music note in the 'ON' audio toggle at top-right). The problem here is the opposite of emoji-as-art: there is no art of any kind in the satellite, emoji included.

**Readability:** The modal body is five paragraphs of all-caps 13-14px gold and cream on black - all-caps at that size is slow to read and there is a lot of it. The title and tagline behind the modal are dark gold on pure black at very low contrast. Touch targets are fine: the exit button reads about 48px and the menu rows are tall. The real readability fault here is the clipped modal, not the type size.

**Looks broken** (confirmed on a second look, severity ugly)**:** Boot frame at 375x667: the HOW TO PLAY modal's primary button GOT IT is below the visible area - the last thing on screen is 'PROGRESS SAVES IN YOUR BROWSER.' at the bottom edge with no scroll cue, and capture.reached is 'no-control', the same fault seen from the robot's side. In the play and later frames the modal has scrolled and the 'HOW TO PLAY' heading is cut in half by the top edge of the screen while the round arcade-exit button sits on top of the modal's gold border. No image 404s - there are no images to miss.

### Rabbit Ronin
`rabbit-samurai` · satellite · action · first committed 2026-07-18 · impact 5/5 · effort M
`satellites/rabbit-samurai/index.html`

**Now:** Three quarters of the phone screen is an empty dark-green vertical gradient with nothing in it. The entire game, rabbit, crates, carrots, caged mouse and ground, is crushed into the bottom 140px of a 667px frame. Flat black trapezoid silhouettes sit on the ground line with hard unlit edges. The boot screen is text only: a red and cream title over black with one solid red gradient slab button.

**Wrong with it:**
- The horizon is empty. From roughly y=60 to y=470 (about 60% of the frame) there is nothing but a three-stop gradient. drawBgSil places its procedural silhouettes at base 740 and 830, which on a 667px-tall phone is below the visible middle, so both parallax layers pile up on the ground line and the sky is bare.
- Two images 404 from the game's own folder: assets/bg-crate-far.png and assets/bg-crate-near.png. The code loads them every frame via bgLayer(), ASSETS.md already writes the spec for eight such files, and none of them were ever painted.
- The injected 'New song' pill at bottom left sits directly on top of the rabbit, so the player character is behind a button at spawn. The VINE and JUMP circles at bottom right overlap the platform and the foreground spikes, and 'Score 0' at top right is sliced by the feedback x and ladybug pair.
- Carrot pickups are the raw carrot emoji floating in mid-air, and the caged mouse is a grey rectangle with drawn bars. The only painted-looking thing on screen is the rabbit, and it is 24px tall.

**Background now:** Canvas only. A three-stop vertical sky gradient from SKY['crate'] (#20351c to #16210f to #0c1208), then two procedural silhouette bands from drawBgSil at globalAlpha .5 and .85 in rgba(10,14,10,.9) and rgba(6,9,6,.95). The painted layer that would sit over them (assets/bg-crate-far.png, assets/bg-crate-near.png) 404s, so only the fallback runs. No image renders anywhere in the frame.

**Background wanted:** Exactly what satellites/rabbit-samurai/ASSETS.md already specifies and the code already loads: two painted parallax PNGs per world, 1080x640, transparent sky, bottom edge at ground level, seamless left to right. Eight files total. The hook is written, the art is missing.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-crate-far.png` | 1080x640, transparent sky, seamless L-R tile, bottom edge is ground level. Soft dark crate-yard skyline in near-black mossy green (#20351c sky behind it): stacked shipping crates, a water tower, a crane arm. Silhouette only, large soft shapes, no detail. | Fills the empty upper half of the frame. Draws at 0.16x camera speed as the far parallax layer, replacing the procedural band that currently sits below the visible middle. |
| `bg-crate-near.png` | 1080x640, transparent sky, seamless L-R tile. Closer crate stacks, rope coils, one or two hanging lanterns with a warm gold glow. More detail than the far layer; sits over it and behind the platforms. | The near layer at 0.42x gives the middle band parallax depth, and the lantern glow puts a warm accent in a frame that is currently one flat green. |
| `bg-burrow-far.png / bg-burrow-near.png / bg-grove-far.png / bg-grove-near.png / bg-peak-far.png / bg-peak-near.png` | Six files, 1080x640 each, same spec as above. Palette anchors per ASSETS.md: Burrows warm browns (#241a12), Grove deep forest green (#16301e), Peaks cold blue night (#1b2940). | The other three of the four worlds have the identical empty-sky problem. One pair per world, deliverable one world at a time because the fallback stays in place for anything missing. |
| `moon-crate-256x256.png` | 256x256, transparent, a soft cream moon disc with a wide warm bloom halo and a couple of thin cloud bands crossing it. | Parks one anchor high in the sky layer so the top third of the frame has something to look at even before the parallax art lands. |
| `carrot-24x24.png` | 24x24, transparent, painted carrot pickup: orange root with warm gold rim light, three sage fronds, a soft glow behind it. | Replaces the raw carrot emoji used as the currency pickup. Emoji renders differently on every device and reads as a placeholder. |

**CSS to do:**
- The injected 'New song' pill (bottom left, fixed): give it bottom:104px so it clears the ground strip where the rabbit spawns. Right now the player character is behind a button on frame one.
- The top HUD row: add padding-left:120px so the level title 'Dojo 1 - 24 - The Crate Yards 1' clears the Music chip, and padding-right:96px so 'Score 0' is not sliced by the feedback x and ladybug pair.
- The VINE and JUMP circle controls: they are a good 72px, but they sit on the platform and the foreground spikes. Raise both to bottom:104px and set opacity:.55 with a 1px sage border, so the ground under them stays readable.
- The boot 'Start Dojo' button: background:linear-gradient(180deg,#d0574a,#9a2f27) is a solid filled slab, against the studio no-filled-button-slabs rule. Swap to background:transparent;border:2px solid #d0574a;color:#e8dcc8, and keep min-height:48px.

**Emoji as art:** Carrot emoji as every currency pickup on the ground, heart emoji as the life counter in the top-right HUD, and the boot screen carries its entire identity in coloured text with no image at all.

**Readability:** Cream 11-12px HUD text on a dark gradient is legible where it is not covered, but the level title, the patience counter and the score are all sliced by injected furniture. VINE and JUMP labels are cream on translucent circles laid over the crate platform texture, which drops their contrast wherever a light crate edge passes under them.

**Music chip:** Covers the level title in the top-left, hiding the words 'Dojo 1 -' before '24 - The Crate Yards 1', and clips the patience counter on the line below it (only 'nce 0/3' of 'Patience 0/3' is visible).

**Looks broken** (confirmed on a second look, severity ugly)**:** capture.badRequests lists 404 /satellites/rabbit-samurai/assets/bg-crate-far.png and 404 /satellites/rabbit-samurai/assets/bg-crate-near.png, both under the game's own folder. bgLayer() in index.html builds those exact paths and ASSETS.md specifies them. The visible consequence in the -2play shot: the top 60% of the 375x667 frame, roughly y=60 to y=470, is a bare vertical gradient with no silhouette and no horizon, because the procedural fallback drawBgSil draws at base 740/830 which lands below the visible middle on a phone.

### Abduct a Chameleon 3D
`abduct-a-chameleon` · satellite · party · first committed 2026-08-18 · **workbench-gated** · impact 4/5 · effort M
`satellites/abduct-a-chameleon/index.html`

**Now:** Every captured frame is either a wall of text or somebody else's UI. Boot is the HOW TO PLAY sheet: amber heading over near-black, cyan letterspaced subheads, ~15px body running off the bottom of the phone, with a second layer of text ghosting straight through it (CONNECTING... / SCORES / a ? button at boot, 'Turn your phone sideways' mid-page in my own landscape run). The play and later frames are the third-party Playroom lobby: flat charcoal card, stock magenta cartoon avatar, seven saturated colour dots, two white slab buttons, 'Multiplayer by Playroom v.0.0.97'. The 3D world never appears in any frame I could produce, portrait or landscape.

**Wrong with it:**
- Text sits on text: #howto (background #080c19f2, 95% alpha) lets the #rotate gate and the HUD bleed through it, so 'Turn your phone sideways' reads across the 'HOW IT PLAYS' subhead and 'CONNECTING... SCORES ?' reads across the title at boot
- The portal back-arrow (48px rounded square, top-left) lands directly on top of the 'HOW TO PLAY' kicker and clips the left of the 'Abduct a Chameleon 3D' heading
- Screen two is unbranded stock Playroom chrome - magenta/purple/lime avatar, pure white pill buttons - which shares no colour, type or edge treatment with the game's own #0E1220 + amber/cyan palette; a player's first impression of a Sky Wolf title is somebody else's SDK

**Background now:** Flat #0E1220 on html/body (one hex, zero background-image declarations in the whole 509KB file). #howto paints #080c19f2 over it; #rotate paints bare var(--bg). The 3D scene itself has real work behind it - five named mood presets with 5-stop sky ramps, fog colour, hemi and moon lights (deepnight/moonrise/emberdusk/auroral/fogbound at abduct-3d.html:1895-1904) and ~120 Kenney-style .glb props with colormap textures - but none of it is on screen in any frame.

**Background wanted:** Two painted plates, because the two screens a phone player actually sees are both bare: a full-bleed night-street backdrop behind #howto so the rules read over an image instead of a void, and the same scene behind #rotate so the most-seen screen on a portrait phone is not an emoji on flat navy.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/ui/howto-backdrop-1334x750.jpg` | 1334x750 landscape, full-bleed, painted night village street seen from slightly above: deep indigo #0E1220 ground, one warm sodium lamp pool low-left, a chameleon silhouette flattened against a wall, saucer running lights small on the horizon. Pre-darkened to ~35% luminance so 15px cream body copy reads over it with no scrim. | Replaces the flat #080c19f2 fill behind #howto and #rotate. Fixes the bleed-through at the same time (an opaque image cannot ghost) and gives the rules screen the only art it will ever have. |
| `assets/ui/saucer-beam-512x512.png` | 512x512 transparent PNG. Saucer seen three-quarter from below, warm amber cone beam falling out of it, soft rim light on the hull, glow bloom baked in. No text, no frame. | The CONNECTING... state and the tap-to-start card are currently pure type. Drop this above the heading so the loading screen and the rotate gate both carry the game's one strong silhouette. |
| `assets/ui/lobby-frame-1334x750.png` | 1334x750 transparent PNG, a border/vignette only: dark indigo falloff on all four edges, a thin amber hairline inset ~24px, corners weighted. Centre 600x420 fully transparent so the Playroom iframe shows through it. | The Playroom lobby cannot be restyled, but it can be framed. This puts a Sky Wolf edge around the stock SDK card so screen two stops looking like a different product. |

**CSS to do:**
- #howto (abduct-3d.html:353) - change background:#080c19f2 to background:#080c19 url(assets/ui/howto-backdrop-1334x750.jpg) center/cover; the 5% transparency is what lets #rotate and the HUD ghost through the rules text
- #howto - add padding-top:64px (currently 22px) so the 'HOW TO PLAY' kicker and the h2 clear the 48px portal back-arrow parked at top-left
- #rotate (abduct-3d.html:175) - replace background:var(--bg) with the same backdrop image; a phone in portrait sees this screen before anything else and it is currently a bare emoji on flat navy
- Add a #lobbyFrame element at z-index 66 carrying lobby-frame-1334x750.png with pointer-events:none, so the Playroom iframe sits inside game chrome

**Emoji as art:** Yes, and it is load-bearing. 282 emoji / 22 distinct across the file with zero <img> tags and zero inline SVG. The rotate gate's only illustration is a 44px phone emoji (#rotate .ph). The HUD in my landscape run read as emoji strings: water-drop for DIRT, cloud for SEEN, map, phone, camera, plus the whole verb bar (paint / taunt / decoy / tongue / jammer) fronted by glyphs.

**Readability:** Bad at 375x667. #howto body is 15px over a 600px+ scroll column with 14.5px list items, and the whole thing is ghosted by a second text layer, so several lines are genuinely hard to parse. #howto .kick is 12px at .22em tracking and #howto h3 is 13px letterspaced uppercase - both under the 0.7rem floor. The instructions themselves are keyboard bindings (WASD, Space, V, E, T, F, C, X, R) printed to a touch device.

**Looks broken** (confirmed on a second look, severity ugly)**:** Two independent frames show text stacked on text through the #howto panel. In the supplied -1boot.png the words 'CONNECTING...', 'SCORES' and a ? button render across the amber 'Abduct a Chameleon 3D' title. In my own 375x667 run (scratchpad/ab-try.png) the line 'Turn your phone sideways' renders across the cyan 'HOW IT PLAYS' subhead. Cause is in source: #howto sets background:#080c19f2 - 95% alpha, not opaque - at abduct-3d.html:353.

---

## PLAIN — flat colour, system font, emoji doing the work of art  (52)

### Rootbound
`rootbound` · satellite · puzzle · first committed 2026-07-07 · impact 5/5 · effort L
`satellites/rootbound/index.html`

**Now:** Boot is a flat near-black page with a green title, one line of sage description, a large solid green button and two dark ones, all system font. Both -2play and -3later landed on the LEVEL SELECT wall, not the puzzle: forty identical padlock emoji in rounded near-black boxes, five to a row, under gold section captions. Nothing in either frame is art.

**Wrong with it:**
- The play frames are the level-select wall and it is forty copies of the same padlock emoji. Nothing distinguishes one bed from the next, there is no bed number visible on a locked tile, and no section reads differently from any other; it is one texture of grey squares from top to bottom.
- The list is scrolled so that the first section ('SEEDBED 1') and the top row of its tiles are sliced by the top edge of the viewport, with no sticky header, no fade and no affordance saying the list continues upward. Half a row of clipped boxes is the first thing you see.
- Boot has an empty dead band of roughly 150px between the description line and the Play button, and the Play button itself is a solid green gradient slab (linear-gradient(180deg,#7ab356,#5c8f3f)) sitting on flat black, which is the studio's no-filled-button-slabs rule broken.
- The bottom control bar on the puzzle screen is a 90px black gradient band that cuts a hard horizontal edge across the board rather than fading into it.

**Background now:** Nothing painted. body background:#000, the shell gets radial-gradient(120% 80% at 50% 0%, #101610 0%, #05070a 70%, #000 100%), panels are flat #0b0f0b and #12180e. Zero background-image declarations, zero img tags, zero inline SVG. The folder contains only index.html, PROMPTS.md and og/; there is no assets/ directory and no art-loading hook of any kind.

**Background wanted:** A painted midnight garden bed. The premise is sliding planters aside to free a golden bloom out of a garden gate, and the screen currently shows none of that. Looking down into dark loam with sage leaf edges creeping in at the corners and a warm gold glow at the centre would give the puzzle a place to happen.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-rootbound-540x960.jpg` | 540x960, full-bleed. Painted midnight garden bed seen from above: dark warm loam texture, sage paper-cut leaf edges creeping in from all four corners, a soft gold pool of light at the centre, heavy vignette at the frame edge. | Replaces the flat #0b0f0b page. Drops into a new satellites/rootbound/assets/ folder, which does not exist yet, so this is also the game's first art hook. |
| `planter-tile-128x128.png` | 128x128, transparent, 9-sliceable (32px corners). Painted terracotta and weathered wood planter block with warm gold rim light on the top-left edge and a soft cast shadow on the bottom-right. | The sliding pieces are currently flat gradient rectangles in #12180e and gold. A lit, shadowed planter makes the pieces read as objects with weight, which is the whole point of a sliding-block puzzle. |
| `bloom-goal-96x96.png` | 96x96, transparent, with the glow baked in. The golden bloom the player is freeing: warm gold petals, cream centre, a soft halo. | The target piece is presently a gold gradient rectangle identical in shape to every other piece except its colour. A painted bloom makes the goal obvious at a glance. |
| `gate-96x160.png` | 96x160, transparent. A painted garden gate in weathered sage-painted wood, standing open, with a warm glow spilling through the opening. | Marks the exit edge of the board. Right now the exit is an unmarked gap in the frame. |
| `bed-thumbs-320x64.png` | 320x64, five 64x64 frames, transparent. One tiny painted vignette per section: a seedbed tray, a row of sprouts, a bud, a full bloom, a tangle of wild roots. | Gives the forty-tile level select five distinct visual anchors so the sections stop being one undifferentiated wall of padlocks. |

**CSS to do:**
- The level-select tile buttons: drop the padlock emoji as the tile content and render the bed number in cream at 16px with a small gold lock glyph at 60% opacity pinned in the tile corner. Forty identical emoji is the whole problem with that screen.
- The level-list scroll container: add padding-top:56px, make the section captions position:sticky;top:0 with a #0b0f0b background, and add mask-image:linear-gradient(180deg,transparent,#000 40px) so the top row stops being sliced flush by the viewport edge.
- The boot Play button: replace background:linear-gradient(180deg,#7ab356,#5c8f3f);color:#241c07 with background:transparent;border:2px solid #7ab356;color:#7ab356, keeping min-height:48px. Same treatment for the gold Nudge button in #ctrlbar.
- #ctrlbar: its inline background is linear-gradient(0deg,#0a0d09 60%,#0a0d0900), which is a hard 90px band. Change to linear-gradient(0deg,rgba(10,13,9,.94) 0%,rgba(10,13,9,.85) 55%,transparent 100%) so it fades into the board instead of cutting a straight edge across it.
- The 'Rootbound v1.0 - 41 beds' footer: currently mid-grey on near-black at roughly 10px. Raise to 11.2px and lift the colour to var(--muted) #8a9178, or remove it from the boot screen.

**Emoji as art:** Padlock emoji on all forty level tiles, a lightbulb on the Nudge button, and the hamburger, undo, reset, play and back arrow glyphs on every control. The game's entire visual identity is emoji plus coloured system text.

**Readability:** Section captions ('SPROUT ROWS', 'BUDDING BEDS', 'BLOOMWORK', 'WILD ROOTS') are gold at about 11px with 2px letter-spacing on near-black, sitting right at the floor. The 'Rootbound v1.0 - 41 beds' footer is grey on black and effectively unreadable at 375px. Level tiles are roughly 62px and the control bar buttons are 72px, both comfortably above the 48px minimum.

**Music chip:** Covers the 'SPROUT ROWS' section caption on the level-select screen completely; the caption is entirely behind the chip in both the -2play and -3later frames. This matches the already-confirmed rootbound report.

### First Sprout
`first-sprout` · satellite · creative · first committed 2026-07-10 · impact 5/5 · effort M
`satellites/first-sprout/index.html`

**Now:** A canvas night scene made entirely of primitives: a vertical navy-to-black gradient sky, twenty-six one-pixel star squares, a crescent moon built from two overlapping circles, and one brown quadratic curve for the ground. Below it a dark panel with a single shop row. Boot is a green wordmark on near-black with four emoji bullets.

**Wrong with it:**
- The Music chip is parked on the HUD. `#hud` is `position:absolute; top:0; left:0` and holds the light and dew readouts, so the chip covers them - in the shot the light value '4' is clipped at the far left edge and the dew '0' pokes out to the right of the chip, with both labels gone. The two numbers the entire idle loop is about are hidden.
- The moon is a cream `ctx.arc` with a second sky-coloured `ctx.arc` punched out of it (index.html lines 420-421). Hard edge, no halo, no craters, no warmth - clip art sitting in an otherwise empty sky.
- The horizon is empty and the ground meets the sky through a hard edge. Line 425 is one `quadraticCurveTo` fill in a flat brown with no grass line, no rim light and no silhouette of anything behind it. Nothing in the frame is composed: moon top-right, a floating bug button mid-right, a mound at the bottom, and roughly three hundred pixels of blank navy between them.
- The plant itself is primitives too - the seed is a 7px `ctx.arc`, the bloom is seven rotated ellipses, the canopy is one 50%-alpha ellipse. A game whose whole subject is growing a plant renders the plant as circles.

**Background now:** Canvas only, no image files at all (the one asset in the folder is the og share image). Sky is `createLinearGradient` from `sk[0]` to `sk[1]` to `#04060a`; stars are 26 `fillRect` dots; ground is one flat `SOILCOL` fill.

**Background wanted:** assets/bg-grove-night-750x1334.jpg - a painted midnight-greenhouse sky: deep near-black blue, a warm gold moon with a soft halo, a low hedge silhouette on the horizon so it is not empty, and a warm rim on the soil mound. Drawn once with `drawImage` before the sprites, so the whole scene stops being gradients.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `satellites/first-sprout/assets/bg-grove-night-750x1334.jpg` | 750x1334 full-bleed JPG, painted night sky with a soft star field, warm gold moon with halo, and a low dark hedge on the horizon | Replaces the three-stop linear gradient, the two-circle moon (lines 420-421) and the 26 fillRect stars (line 423) in one drawImage. |
| `satellites/first-sprout/assets/soil-mound-750x420.png` | 750x420 transparent PNG, painted dark loam with visible clods, a grass fringe along the top edge and a warm gold rim from the kindled glow | Replaces the flat quadratic-curve fill at line 425 and gives the sky-to-ground edge a transition instead of a hard colour step. |
| `satellites/first-sprout/assets/sprout-stages-512x2048.png` | 512x512 transparent cells, 4 stages stacked: dormant seed, first shoot, leafed stem, bloomed - matched to the game's kindle/wake/bloom/canopy flags | Replaces the ellipse leaves and seven-ellipse flower at lines 438-442 so the thing the player is growing is actually drawn. |
| `satellites/first-sprout/assets/moon-256.png` | 256x256 transparent PNG, painted crescent with craters and a soft gold halo | If the full background is too much work, this alone kills the worst single element in the frame. |

**CSS to do:**
- `#hud` (index.html:86) - it begins at `left:0`, exactly where the music chip lands. Give it `padding-left:96px`, or right-align the light/dew block next to `#hud-menu`, so the chip cannot cover the two counters.
- `.res .rr` and `.res .rl` (lines 90-91) 11px, `.shopbtn .sd` (108) 11px, `.foot` (75) 11px, `.wardcard .wt` (82) 11px - all five under the 11.2px floor; raise to 12px.
- `#tendhint` (96) - `var(--muted)` at `opacity:.8` over a near-black sky is almost invisible in the shot; move to `var(--cream)` at .7, or give it a soft dark pill so it reads as an instruction.
- `#logline` (100) at 12.5px sage on the dark panel is the game's narration and the lowest-contrast copy on screen; raise to 13.5px and lift the colour toward `var(--cream)`.

**Emoji as art:** Heavy. The four boot bullets are emoji (sprout, hand, moon, tree), the shop row icon is a candle emoji, the menu is a hamburger character, and 41 emoji / 21 distinct across a 41KB file are the entire iconography. There is no non-emoji icon anywhere in the game.

**Readability:** Five separate rules under the 0.7rem floor (`.res .rr`, `.res .rl`, `.shopbtn .sd`, `.foot`, `.wardcard .wt`, all 11px). `#tendhint` at 13px muted/.8 over near-black is barely visible in the shot. Touch targets pass - `#hud-menu` is 60px, `.btn.sm` and `.nsbtn` are 72px min-height.

**Music chip:** Yes, and it is the worst in the batch. The chip sits over `#hud` at top-left, covering the light value and both the 'light' and 'dew' labels, and clipping the dew value. Boot had nothing at top-left, which is exactly why the 900ms corner scoring chose it. A second injected control, a bug-report ladybug in a circle, also floats over the empty sky at mid-right with no relation to the scene.

### Garden Guard
`garden-td` · satellite · puzzle · first committed 2026-07-05 · impact 5/5 · effort M
`satellites/garden-td/index.html`

**Now:** Both frames I have are flat CSS menus, not the battlefield: boot is an empty near-black field with a big glowing green/gold GARDEN GUARD wordmark and four rounded slabs (one gold gradient PLAY, three grey), and the -2play and -3later frames are identical level-select lists of dark rounded tiles with grey numerals and three empty grey stars. The robot tapped PLAY and landed on the level picker, so the 91 painted tower/pest PNGs that ship with this game never appear in any shot.

**Wrong with it:**
- Level select: the game's own grey '← Back' pill at top-left is buried under BOTH the injected '← All Games' exit link and the '♫ Music' chip — three controls stacked in one 130x60px corner, with Back left half-visible and untappable.
- Level select: tiles 1, 2, 4, 5, 6, 8, 9 are byte-identical dark rounded rectangles — same size, same border, same three grey stars, only the numeral differs. The only thing separating a boss row from a normal row is a crown emoji. Thirteen levels and no silhouette difference between any two of them.
- Boot screen: nothing sits behind or beside the title — no keeper, no plant, no pot, no horizon, just flat #0d100c. keepers/keeper_warden.png is already painted and shipped in assets/gg/keepers/ and is on no menu screen.
- The red ladybug feedback FAB and its close button sit directly on the Level 9 tile in the level list.

**Background now:** Menus: flat near-black, the CSS --bg #0d100c with a faint radial, no image at all (bgImageDecls 0, imgTags 0). Battlefield canvas (unshot): a code-drawn gradient per theme — midnight radial #182013 to bg to bg2, plus dawn #3a2a3a/#5a4030/#2a2418, rainy, zen, starfield — with a procedurally built dirt path layer. drawBg() at index.html:1780 already tries spr(ctx,'map_'+G.map.artkey) FIRST and falls through because assets/gg/maps/ does not exist.

**Background wanted:** Four painted 540x960 map backgrounds with the path painted into the picture, exactly as the game's own ART_ASSETS.md section 6 specifies. The hook is live — drop the files in and the gradient stops being used. Plus one painted title backdrop so the menu is not a void.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/gg/maps/map_w1_kitchen.png` | 540x960 full-bleed portrait, under 512KB. Night kitchen-garden bed: raised timber beds, a compost bin at the bottom gate, the winding dirt path painted right in, warm lantern rim light, deep near-black soil, sage foliage, gold glints. | Replaces the code gradient + procedural dirt ribbon on World 1 map 1. drawBg() already calls spr(ctx,'map_kitchen') and falls through to the gradient because assets/gg/maps/ does not exist. |
| `assets/gg/maps/map_w1_herbspiral.png` | 540x960 full-bleed portrait, under 512KB. Same night garden, different signature terrain: a stone herb spiral, thyme and sage tufts, path painted in. | Second of the four World 1 maps named in ART_ASSETS.md section 6. Right now every map looks identical because they all share the same gradient. |
| `assets/gg/maps/map_w1_pond.png` | 540x960 full-bleed portrait, under 512KB. Moonlit pond edge, reeds, lily pads, wet stone path painted in. | Third World 1 map. Same hook, same reason. |
| `assets/gg/maps/map_w1_trellis.png` | 540x960 full-bleed portrait, under 512KB. Bean trellis and arch, hanging vines, straw path painted in. | Fourth World 1 map. Same hook, same reason. |
| `assets/gg/ui/title_hero_540x960.jpg` | 540x960 full-bleed. The Keeper standing in the kitchen bed at night, back three-quarter, watering can lowered; bottom 45% deliberately dark and quiet so the button stack reads on it. | Replaces the empty flat black behind the GARDEN GUARD wordmark on the title screen. |
| `assets/gg/ui/ls_thumb_kitchen_128x128.png` | 128x128 transparent, one per map (4 files: kitchen, herbspiral, pond, trellis). A tiny painted vignette of that map's signature feature. | Gives the level-select tiles something other than a numeral, so two tiles in the same frame stop sharing a silhouette. |

**CSS to do:**
- #ls-back / the level-select back pill: move to top:calc(66px + var(--safe-t)) so it clears the injected .exit-link and the 48px music chip, which both occupy the top-left at top:10px.
- .ls-cell: add a painted thumb via background-image (the ls_thumb_*.png above) plus background-size:cover and a rgba(0,0,0,.55) overlay, so cleared/locked/boss tiles differ by more than a numeral.
- .ls-cell.boss: add border-color:var(--gold) and box-shadow:inset 0 0 0 1px rgba(200,168,75,.35) so a boss row is a different object, not the same slab with a crown in it.
- .ls-cell .stars: font-size 11px to 13px and color the earned stars gold against unearned #3a3f32 — at 11px the three glyphs are an unreadable grey smudge.
- .klvl: font-size 10px to 12px (keeper level pill, under the 0.7rem floor).
- #s-title: add background:url(assets/gg/ui/title_hero_540x960.jpg) center/cover and a linear-gradient(180deg,rgba(8,12,8,.45),rgba(8,12,8,.88)) scrim on the .pad so the buttons stay readable.

**Emoji as art:** Crown emoji is the only marker for all four boss levels on the level select; a wheat emoji stands in for the endless-mode icon on the locked Long Weed banner; honeypot and star emoji stand in for the Sap and Stars currency icons on the title screen; snowflake and cross are drawn as text glyphs on enemy status badges in the canvas (index.html:1996-1998).

**Readability:** .ls-cell .stars is 11px and .klvl is 10px — both under the 0.7rem floor. The '← Back' pill on the level select is not just small but occluded, so its 48px target is unusable. Everything else on the two frames clears 48px.

**Music chip:** Yes. The 'Music' chip took the top strip next to the '← All Games' exit link (both scored against the BOOT layout, where that corner was empty). On the level-select screen it covers the right half of the game's own '← Back' pill; only '← Ba' is visible under the two pills. The chip never re-places, so this persists on every screen after boot.

### Impossible Garden
`impossible-garden` · satellite · puzzle · first committed 2026-07-10 · **workbench-gated** · impact 5/5 · effort L
`satellites/impossible-garden/index.html`

**Now:** A flat indigo-to-black vertical gradient with white system-font type. Boot: 'Impossible Garden' in cream, a gold letterspaced SKY WOLF STUDIO line, a paragraph of body copy, then one green slab and six dark slabs. The play frame landed on the garden picker — eight identical 92px dark squares numbered 1-8, a Back slab, and then roughly 400px of completely empty gradient below them. The puzzle canvas itself is never reached in any of the three shots.

**Wrong with it:**
- The picker frame is two-thirds empty. Eight buttons and a Back sit in the top third of a 667px screen and the entire lower 400px is bare gradient with nothing in it — no art, no vignette, no framing, an empty horizon by the Director's own test.
- The 'Music' chip lands squarely on the screen's own heading: it covers 'Choose a' in 'Choose a Garden' and 'Wander any' in the line beneath, so the title of the screen you are looking at is unreadable.
- The eight .lvlcard tiles are 92x92 #15141f squares with a 1px #2a331f border and a numeral — identical silhouettes, identical fill, nothing to distinguish garden 1 from garden 8. Same fault on the .btn stack, where five of the seven buttons are the same #232037 slab.
- Palette drift: :root declares the house tokens (--bg:#0d100c, --sage:#7ab356) but body/#stage/.screen actually paint indigo #141526 to #0c0b14 to #08070d. Nothing on screen is near-black or sage; the game reads cold blue-purple, off the midnight-greenhouse house style.
- This is the only game in my batch with literally zero art files — satellites/impossible-garden/ contains index.html and og/card.jpg and nothing else.

**Background now:** Pure CSS. #wrap is radial-gradient(120% 80% at 50% 0%, #171a24, #0a0910 70%, #000); #stage and .screen are linear-gradient(180deg,#141526,#0c0b14 60%,#08070d). bgImageDecls 0, imgTags 0, inlineSvg 0. The puzzle canvas draws vector shapes only — ellipse petals, a #ffe9a8 core, rgba node discs.

**Background wanted:** One painted 540x960 night-garden backdrop with an impossible-geometry read — hedge arches that do not quite meet, a stair that returns to itself, deep near-black with sage and a single warm lantern. It needs to be a real image because the game currently has no visual identity at all beyond an indigo ramp, and the maze itself is thin vector line-work that would sit well on a painted ground.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `satellites/impossible-garden/assets/bg-garden-540x960.jpg` | 540x960 full-bleed. Night hedge garden under a low moon, arches that fold back on themselves, path stones fading into the dark, deep near-black ground, sage foliage, one warm gold lantern glow. Bottom 40% deliberately quiet so menu slabs read on it. | Replaces the flat indigo linear-gradient on #stage and .screen, which is the entire visual identity of the game today. |
| `satellites/impossible-garden/assets/title-hero-540x420.png` | 540x420 transparent, sits behind the wordmark: a single impossible arch in silhouette with a wanderer figure at its base, warm rim light from the right. | Fills the empty space between the title block and the button stack on boot, where there is currently nothing at all. |
| `satellites/impossible-garden/assets/garden-thumb-1-184x184.png` | 184x184 each, eight files (garden-thumb-1 through -8). A small painted vignette of that garden's signature shape — a spiral, a bridge, a knot, a stair — near-black ground, sage line, gold node. | Gives .lvlcard something other than a numeral so eight tiles in one frame stop sharing a silhouette, and fills the picker's empty lower half by letting the grid breathe wider. |
| `satellites/impossible-garden/assets/node-bloom-64x64.png` | 64x64 transparent, the goal bloom, painted rather than the current ellipse-petals-plus-#ffe9a8-dot that game code draws at index.html:407. | The goal is the one thing the player looks for and it is currently six vector ellipses; a painted bloom gives the puzzle a focal point. |

**CSS to do:**
- #stage and .screen: replace linear-gradient(180deg,#141526,#0c0b14,#08070d) with url(assets/bg-garden-540x960.jpg) center/cover, plus a linear-gradient scrim on .pad. Failing the art, at minimum swap the indigo stops for the declared house tokens (#0d100c family) so the game stops fighting the fleet palette.
- #s-levels .pad: padding-top 26px to 76px so the 'Choose a Garden' h2.sc-h clears the injected 48px music chip that is fixed at top:10px;left:10px.
- #s-levels .pad: add justify-content:center so the grid and Back sit in the middle of the frame instead of leaving 400px of dead gradient underneath.
- .lvlcard: add background-image:url(assets/garden-thumb-N-184x184.png) with background-size:cover and move the .ln numeral to a corner chip, so the eight tiles differ by picture rather than digit.
- .badge: font-size 10px to 12px (the in-play level badge, under the 0.7rem floor).

**Readability:** Body copy is 17px and headings 23-46px, all comfortably over the floor, and .btn/.settingline are min-height 72px so touch targets are fine. The one real failure is the heading occluded by the music chip. .badge at 10px is under the floor.

**Music chip:** Yes, and it is the worst in the batch. The chip covers the words 'Choose a' in the heading 'Choose a Garden' and 'Wander any' in the subtitle directly beneath it. Identical in -2play and -3later, so the placement is permanent. It picked the top-left against the boot layout, where that corner was empty.

### Tetroku
`leaf-fit` · satellite · puzzle · first committed 2026-07-10 · impact 5/5 · effort M
`satellites/leaf-fit/index.html`

**Now:** A 9x9 grid of near-black cells (#141d10) on a near-black gradient background (#0f160e to #080c07) separated by #2a331f hairlines - at boot the playfield is almost invisible, a dark rectangle in a dark room. The only colour on the screen is the three-piece tray at the bottom: flat rounded squares in cornflower blue, orchid purple, salmon pink and orange, each with a white gloss bar across the top.

**Wrong with it:**
- The empty board is #141d10 on a #0f160e background with #2a331f grid lines (BOARDS[0] 'Willow' and the bg gradient at index.html:486). That is roughly a five-value difference; on a phone in daylight the playfield reads as an empty black rectangle, not a board, and the 3x3 dividers are one faint hairline.
- The music chip at 10,10 covers three things at once: the score readout, the arcade back arrow, and the entire first line of the on-screen instruction ('Fill a row, column, or 3x3 patch to clear it') - which is exactly the line a new player needs.
- The game is called Tetroku and its own menu copy says 'drag leaf sprigs onto the midnight trellis', but the pieces are plain rounded squares in a generic Blockudoku palette - cornflower blue and salmon pink appear nowhere else in the house palette. There is no leaf, no sprig and no trellis anywhere on the screen.
- About 150px at the bottom - a quarter of the phone - is dead black holding only the Rotate button, the ladybug feedback fab and a stray 40x40 close dot floating next to it with no visual relationship to anything.

**Background now:** Canvas linear gradient, two stops, #0f160e to #080c07 (index.html:486), plus roughly a dozen 1.6px season-tinted dots drifting at 8-15% alpha. bgImageDecls 0, imgTags 0, no drawImage anywhere; the only image file in the folder is og/card.jpg.

**Background wanted:** bg-trellis-540x960.jpg - a painted midnight trellis: dark lattice woodwork with moss in the joints, ivy creeping in from the left edge, a faint moon glow top-left, and a deep near-black falloff at the bottom so the piece tray still reads over it. The board should then sit on a painted plinth rather than floating on nothing.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-trellis-540x960.jpg` | 540x960 full-bleed painted midnight trellis wall, dark lattice, moss in the joints, ivy at one edge, moon glow top-left, near-black at the bottom | replaces the two-stop canvas gradient and finally gives the 'midnight trellis' in the game's own copy something to actually be |
| `sprig-6x-128x128.png` | six painted leaf sprigs at 128x128 transparent PNG, one per piece colour, each a different leaf shape, tinted sage / warm gold / rose / copper / pale blue / cream, soft rim light | replaces the flat rounded-square cells and the off-palette Blockudoku blue and salmon; makes pieces readable by shape as well as colour |
| `board-plinth-96x96-9slice.png` | 96x96 transparent 9-slice painted stone-and-bark frame with a soft inner shadow and mossy corners | gives the board an edge and a transition; right now it is a 1px hairline rectangle sitting on nothing |
| `cell-empty-64x64.png` | 64x64 painted empty trellis socket - a woven square, faintly lit at the top-left, transparent margin | replaces the #141d10 flat fill so an empty board is legible instead of a black hole |
| `bloom-burst-256x256.png` | 256x256 transparent painted pollen and petal burst, warm gold centre falling to transparent, additive-friendly | replaces the plain ctx.arc particle spray used for a line clear, which is the game's only moment of reward |

**CSS to do:**
- #sws-music-chip on this game: place it bottom-left or bottom-right - the top-left 96x48 covers the score, the back arrow and the first instruction line all at once.
- #sws-music-min: 40x40 measured, raise to 48x48.
- BOARDS[0] 'Willow' at index.html: cell '#141d10' to about '#1b2616' and grid '#2a331f' to about '#3f5230' so an empty board is visible at all; 'Slate' and 'Loam' have the same problem one step along.
- drawCell() index.html:534-535: the rgba(255,255,255,0.16) top bar plus rgba(0,0,0,0.22) bottom bar make every piece the same glossy lozenge - drop them once real sprig art lands, or vary them per piece type meanwhile.
- Pull the tray strip and the Rotate row down-screen by ~80px (or move the season and score readout into the gap) so the last quarter of the phone is not dead black.

**Readability:** The score is 20px cream, the timer 14px, the mode-and-season label 12px in muted #8a9178 pinned to the darkest top-right corner - that last one is right on the 0.7rem floor and hard to read. The real problem is not text: the empty board cells sit about five values off the background, so the playfield itself is the unreadable element.

**Music chip:** The 96x48 chip at 10,10 covers the score readout, the arcade-exit back arrow, and the entire first line of the instruction text 'Fill a row, column, or 3x3 patch to clear it.'

**Looks broken** (confirmed on a second look, severity ugly)**:** Overlapping UI, visible in the recorded -2play frame and reproduced in my own headless shot at 375x667: the music chip rect is {x:10, y:10, w:96.8, h:48} and it sits over the score number, the back arrow and the first instruction line. Separately, at boot the 9x9 playfield draws cells #141d10 on a #0f160e background, which renders as a near-empty black rectangle rather than a board. Note for the collector: capture.reached says 'no-control' for this game, but the shot did land on the real canvas - the game had auto-entered a run. My own filled-board shot is at /tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad/extra/leaf-fit-filled.png

### Tangent
`tangent` · satellite · action · first committed 2026-09-01 · **workbench-gated** · impact 5/5 · effort M
`satellites/tangent/index.html`

**Now:** The boot frame is a real playfield: a black canvas-generated starfield with faint violet and blue nebula blooms, and centred on it a grey wireframe disc (the deck) made of concentric etch rings, radial spokes and twelve identical bolt dots, with one 4px orange ball on the rim and a dashed cyan arc. Chrome is a dark slate strip top (level name, three criteria chips) and a row of three outlined tool buttons below. The 2play and 3later frames are not the game at all - both are the injected SOUNDTRACK drawer filling the whole screen.

**Wrong with it:**
- The deck is the biggest object on screen (190px across at 375x667) and the least painted thing in the frame - a flat #0B0F16 to #1E2734 radial with hairline rings and twelve evenly spaced identical bolt dots. It reads as a CAD viewport, not a machined dish.
- Nothing in the frame has a light source. Starfield, deck, HUD chips and tool buttons all sit in the same 0E141C-3A4A5C slate band; the only saturated pixel on screen is the 4px orange ball, so the eye has nothing to travel between and the top third of the frame is empty.
- The canvas hint text sits loose on the playfield with no plate: 'let it ride' is printed across the disc centre and the orange ball butts straight into the end of the word 'ride', while 'hold' at lower-left half-crosses the deck rim.
- The three tool buttons (Rail / Bumper / Brake) are three identical rectangles - same border, same fill, same two-line text block - indistinguishable at a glance, and their labels are 11px (0.69rem), under the 0.7rem floor.

**Background now:** Canvas-baked starfield, no image file anywhere. makeStars() at index.html:495 fills #04050A into an offscreen canvas, scatters soft radial nebula blobs at hues 200-310 at 14 percent alpha plus single-pixel stars, rebuilt per resize and blitted once per frame at draw() line 1280. Page ground is a flat var(--ground) #0E141C. bgImageDecls is 0; the 69 'asset files' counted are docs/ and docs/shots/, not art.

**Background wanted:** A full-bleed painted deep-space plate: near-black ground, one violet-into-sage nebula mass placed off centre so the disc has something to sit against, a warm gold dust drift low in the frame, star density thinning behind the deck so the deck reads as the brightest silhouette. Plus three far-side plates (Maw, Cess, Nix) for the inversion. ART_ASSETS.md Sheet 07 already specifies exactly this and names the two-line wiring change at draw() 1280 and 1342, with makeStars kept as the fallback.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-nearside-1080x2340.jpg` | full-bleed opaque, cover fit. Painted deep-space field: near-black ground, one violet/sage nebula mass off centre, warm gold dust low, stars thinning behind the centre of frame. | Replaces the procedural makeStars blit at draw() line 1280 (already a drawImage, so it is a one-line swap). Kills the flat noise field that makes the whole screen read as one grey value. |
| `deck-face-1024x1024.png` | transparent PNG, 1024 square, drawn top-down. Brushed metal dish face, warm rim light on the upper-left lip, real bolt heads with cast shadow, engraved index mark and orbit ring. | Replaces the makeDeckFace radial + etch-ring cache at line 1446, which is already a cached drawImage blit. This is the largest object on screen and currently pure wireframe. |
| `bodies-sheet-1536x512.png` | transparent, 12 cells at 128x128 (target, hazard, heavy, flip body, off-side outline, far-side variants), authored 4x for a 12-25px draw. | Replaces the small dark ferro blobs drawn by drawBodies at line 1395, so the things the player aims at read as objects instead of dots. |
| `bg-farside-maw-1080x2340.jpg (plus -cess, -nix)` | three full-bleed opaque plates, authored as the finished inverted look, NOT pre-inverted. Maw seared rust (hue 22), Cess verdant green (hue 96), Nix cold cyan (hue 168). | Replaces the flat beige field the composite stack currently produces on the far side of an inversion; drawn at line 1342 in place of the multiplied-back starfield. |

**CSS to do:**
- .tool font-size 11px to 12.5px and .tool b 11.5px to 13px (index.html:54, :56) - 11px is 0.69rem, under the 0.7rem floor, on the labels a beginner has to read.
- .tool - add a 3px left border tinted per tool (--tele / --ball / --warn) or a small glyph, so Rail, Bumper and Brake stop being three identical rectangles.
- drawOverlay (line 1907) - paint a rgba(14,20,28,.7) rounded plate behind the 'hold' and 'let it ride' canvas labels so they stop sitting loose on the starfield and clipping the deck rim and the ball.
- html,body background:var(--ground) - change the flat #0E141C to a vertical gradient down to #060A10 so the bottom HUD strip is not the same value as the sky it overlaps.

**Emoji as art:** Essentially none - one emoji in the whole source. Every mark on the playfield is a canvas vector path or gradient. The problem is not emoji standing in for art, it is procedural geometry standing in for art.

**Readability:** .tool labels are 11px (0.69rem), under the floor. The 'hold' and 'let it ride' canvas hints are --ink-dim #7C8B9B directly over the starfield with no plate and low contrast. Criteria chips at 11.5px are borderline. Touch targets are fine: .tool min-height 52px, throttle 88px, level button min-height 48px.

**Music chip:** Yes, twice. The chip took the mid-left-edge fallback spot (left:10px, top:H/2-24, music-unlocks.js:194) and in the boot frame sits directly on the left rim of the orbit dish, over the playfield. In the 2play and 3later frames it is drawn ON TOP of the SOUNDTRACK drawer's own track list, covering the 'Whispered Light / Stephen' row, while the 'New song' pill at bottom-left covers the start of the drawer's footer line. Separately, the unlock card in the boot frame covers the entire lower half including the throttle and release controls.

### Star Field
`star-field` · satellite · puzzle · first committed 2026-07-10 · impact 5/5 · effort M
`satellites/star-field/index.html`

**Now:** A 6x6 canvas grid of flat colour regions - teal, olive, purple, brown, navy - outlined in cream, floating in a black frame with a wide empty band of pure black below it. Boot is the shared satellite menu: gold wordmark, dew-blue subtitle, dark pill buttons carrying emoji.

**Wrong with it:**
- The region colours are TINTS at line 359, ten arbitrary hexes assigned by reg % 10: #2f4524 olive next to #25444d teal next to #452449 purple next to a single #4a3822 brown cell. None of them is a house colour, and because the index is the region ID rather than anything spatial, two adjacent beds can land almost the same value. It reads as random paint-by-numbers, not a night sky.
- The three planted markers are rgba(200,196,180,0.5) circles at 10% of the cell (line 373) - flat grey dots with no glow, no petal, no star. They read as debug placeholders sitting between cream grid lines.
- Composition: the board runs y147 to y492 with about 150px of pure empty black under the helper text and a bare strip above. The horizon is empty in a game called Star Field - no stars, no haze, no gradient behind the board at all.
- Region and board edges meet the black through a hard 4px cream strokeRect (line 385) - no falloff, no glow, no transition of any kind.

**Background now:** Nothing behind the board. The page is radial-gradient(120% 80% at 50% 0%, #101610, #05070a, #000) and the canvas clears to a per-theme flat fill from THEMES[].bg (Midnight #0b0f0b, Dusk #141018, Frost #0a1016, Ember #150e0a). Zero image files: assetFiles 1 is the og social card.

**Background wanted:** A painted night sky. Deep near-black at the bottom rising into a faint sage-teal haze, a scatter of small stars and one soft nebula bloom off-centre, with the middle band kept dark and low-contrast so the puzzle grid stays legible on top of it.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-starfield-night-540x960.jpg` | 540x960 full-bleed painted night sky: deep near-black bottom into a sage-teal haze, scattered small stars, one soft rose nebula bloom upper-right, the middle 500x500 kept dark and flat | replaces the flat THEMES[].bg fill; gives the empty lower third and the bare top strip something to be, and stops the board floating in a void |
| `star-glyph-atlas-256x64.png` | 256x64, four 64x64 transparent painted markers matching the existing fn cases (star, firefly, rose, bloom): warm gold petals, a cream core, a soft halo | replaces the hand-rolled starPath and ellipse loops at lines 407-410, which currently draw CSS-shape-grade forms |
| `bed-tint-tiles-512x86.png` | six 86x86 tileable transparent overlays of soft painted soil and nebula grain at about 25% opacity, laid out in one 512x86 strip | multiplied over the flat TINTS fills so each constellation bed has texture instead of being one solid rectangle |
| `pip-planted-64x64.png` | 64x64 transparent painted seed pip: a small cream seed with a warm gold rim light and a faint shadow | replaces the rgba(200,196,180,0.5) grey dot drawn for the v===1 marker at line 373 |

**CSS to do:**
- TINTS line 359: replace the ten arbitrary hexes with a house-derived ramp built off --sage #7ab356, --deep #3f6b34, --gold #c8a84b and --blue #5b9bd5 at 18-28% over #0b0f0b, and index by a hash of each region's neighbours rather than reg % 10 so two touching beds can never land the same value
- drawBoard line 385: the outer strokeRect(BX,BY,CELL*N,CELL*N) is a hard 4px cream line on black. Add a glow pass (shadowColor='#c8a84b'; shadowBlur=18) so the board meets its ground through a transition
- Lines 395 and 397: the two helper lines are '13px system-ui' inside a 540-wide stage scaled 0.694, so about 9 real px, under the 0.7rem floor. Raise to 17px, and split 'One per row, column, and colored bed - none may touch' onto two lines - at 540 wide its right end runs under the bottom-right feedback chip
- Line 389: the '0 / 6 stars planted' count is '600 15px system-ui' = about 10.4 real px. Raise to 20px
- Line 373: the planted pip is rgba(200,196,180,0.5) at CELL*0.10. Until the painted pip exists, take it to #e8dcc8 at CELL*0.14 with a gold glow so it stops reading as a debug dot

**Emoji as art:** UI only, 12 distinct: seedling (Star Garden), crescent moon (Daily Sky), herb (Zen), sparkle (Deep Field), flower (Grove), palette (Skins), gear, question mark on the menu; lightbulb for hint and a reload arrow in play. The board markers themselves are canvas paths, not emoji - but they are simple enough that they read like placeholders.

**Readability:** Both helper lines are 13px inside a 540-wide stage scaled to 0.694, so about 9 real px, under the 0.7rem floor, set in #8a9178 muted green on near-black. The '0 / 6 stars planted' count is 15px, about 10.4 real px. The third helper line runs the full stage width and its tail passes under the bottom-right feedback chip, so the last words are unreadable.

**Music chip:** Yes. The 'Music' chip is parked top-left over the mode label: the green 'Zen' of 'Zen Stargazing' shows only as fragments to the right of the chip, and the chip crowds the gold '6 x 6' size line beneath it. Separately, the injected close and ladybug chips bottom-right sit on top of the tail of the third helper line.

### Season Sway
`season-sway` · satellite · card · first committed 2026-07-10 · impact 5/5 · effort L
`satellites/season-sway/index.html`

**Now:** In play: a flat dark plum-navy field, empty for its top 190px except one tiny potted-seedling emoji, then a plain cream rounded rectangle holding a hedgehog emoji, the name 'Mole', a question and two brown swipe prompts, then four black bar-columns with coloured fills labelled Sun / Rain / Soil / Wildlife. The boot screen is better: near-black on the real house palette with a glowing gold 'Season Sway' wordmark and gold buttons. Correct colours, no art at all.

**Wrong with it:**
- The visitor cast is broken at the source: Mole and Hedgehog are the SAME hedgehog glyph (index.html:317 and :324), The Toad and Chorus Frog are the same frog, Heron is a swan and Great Blue Heron is a dove, Pangolin is a lizard, Dragonfly is a housefly, Moth is a crescent moon and Cicada is a pair of musical notes. Forty characters, and a dozen of them either share a silhouette or show the wrong animal entirely.
- The card is an unfinished shape: a flat cream rounded rect with no border, no shadow, no texture, no back - it does not lift off the ground and its bottom two thirds are empty. The two swipe prompts sit as bare brown text on the bottom corners with no affordance that they are the answers.
- The top 190px of the play screen is dead flat plum with one 44px emoji floating in it. The game is called Season Sway and is about tending one little garden, and there is no garden in the frame - no bed, no trellis, no sky, no season. Nothing tells you which season it is except a word hidden under the music chip.

**Background now:** Pure CSS on the house palette. html,body radial-gradient(120% 80% at 50% 0%, #101610, #05070a 70%, #000); #stage flat #0b0f0b; .screen linear-gradient(180deg,#0e140d,#0b0f0b). The canvas play field is filled by script over that. bgImageDecls 0, imgTags 0, and the only file on disk besides index.html is og/card.jpg.

**Background wanted:** bg-garden-night-540x960.jpg - the one little garden the game is about: a raised bed in the near foreground, a trellis and a hung lantern behind it, deep #0d100c ground, warm gold rim light on the leaves, soft painterly. Four seasonal recolours of the same composition (spring blossom, summer haze, autumn copper, winter frost) so the field itself tells you which season you are in.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `visitor-portraits-sheet-1024x1024.png` | 1024x1024 transparent, 64 cells of 128x128 for the 40 visitors plus spares: painted storybook busts, warm rim light, each with a distinct silhouette (mole vs hedgehog, toad vs chorus frog, heron vs dove) | replaces the single emoji glyph each visitor gets today, and fixes the duplicate and simply wrong glyphs at index.html:317-356 (Mole and Hedgehog both use the hedgehog, Cicada uses musical notes, Moth uses a moon) |
| `card-face-parchment-540x620.png` | 540x620, warm cream vellum with a deckled edge, faint pressed-leaf watermark, a 2px gold inner rule and a soft inner shadow, 9-slice safe margins of 40px | replaces the flat cream roundRect drawn at index.html:585 so the card looks like something you hold |
| `bg-garden-night-540x960.jpg` | 540x960 full-bleed, four seasonal variants of one composition as in background_want | fills the empty top 190px and makes the season visible instead of being a word behind the music chip |
| `meter-gauges-352x480.png` | 352x480 transparent, 4 cells of 88x120: painted sundial, rain gutter, soil core and hive gauges with a marked safe band and a needle or fill line | replaces the four black fillRect columns with emoji caps at index.html:562, which are the only readout of the balance the whole game is about |

**CSS to do:**
- The canvas HUD draws the season name at x=90,y=49 (index.html:520) which is exactly where the injected music chip lands - move it to x=190 or y=100 so 'Winter . Card 3' is not truncated to '. Card 3'.
- The card (index.html:585-593) has no stroke and no shadow. Add a 2px var(--gold) inset rule and a 0 14px 34px rgba(0,0,0,.65) drop so it sits above the field rather than in it.
- The four meters (MET_Y row, index.html:562) are bare fillRect columns. Draw a 2-tick safe band and a danger tint at each end so 'in balance' is readable at a glance instead of guessed from a bar height.
- The play screen leaves 190px of flat ground above the card with one 44px emoji in it - either raise CARD_CY to about 0.44*VH and grow the plant art, or fill the band with the garden background.

**Emoji as art:** Total, and it is the whole cast. All 40 visitors are one emoji each (index.html:317-356), the player's garden is a single potted-plant emoji above the card, and the four balance meters are capped with sun, rain-cloud, seedling and bug emoji. 49 distinct emoji, zero image files. Because each character is one glyph, character identity is entirely at the mercy of what the emoji set happens to have - which is how Mole ended up as a hedgehog.

**Readability:** Canvas text is 16-20px on a 540-wide virtual stage that scales 0.694, so 11.1-13.9 real px - the 16px meter glyph line lands at 11.1px, just at the 0.7rem floor and worth taking to 18px. The swipe prompts are #6a5a3a on cream, dim but legible. The restart button is the only proper 48px control and it is fine.

**Music chip:** Yes. The '. Music' chip covers the canvas HUD season name at x=90,y=49 - the header reads '. Card 3' with the season lost. Separately, the injected feedback ladybug disc lands on the rightmost 'Wildlife' meter and covers most of its bar and part of its label. The 'New song' chip sits below the meter row and clears it.

### Deepwell
`deepwell` · satellite · action · first committed 2026-08-16 · **workbench-gated** · impact 5/5 · effort L
`satellites/deepwell/index.html`

**Now:** A near-black navy screen of hairline-bordered dark cards, all-caps cream headings and one amber accent. Boot is the surface shop: CASH ON HAND 0, four identical gear rows, and a gold GO DOWN slab. There is not one image in the whole game - every shape on screen is a CSS gradient or a border.

**Wrong with it:**
- The injected 'Music' chip sits on the LAMP gear row and covers the right edge of its '50 CASH' price panel, so one of four things the player is shopping for is partly hidden on the screen every session starts on.
- Nothing on the surface screen says mine. No headframe, no rope, no lamp, no rock, no depth. It reads as an app settings list with a yellow button, not as the mouth of a well you are about to climb into.
- TANK, LAMP, PACK and BRACE share one silhouette exactly - same rounded rect, same left-aligned all-caps title, same grey price box, same five 6px grey dashes underneath. At a glance the four rows are indistinguishable, and the dashes give no read on what is bought.
- The gutter between the header card and the gear list is a hard edge: the panel colour steps from #14161d to #0a0b0f with no transition, no divider treatment, nothing that suggests one surface sitting on another.

**Background now:** Flat `--bg #0a0b0f` on body, a `linear-gradient(180deg,#0a0b0f,#0d0f14 40%,#08090d)` on the run screen, and the shaft rock drawn as six flat colour divs. One background-image declaration, zero image files (the only 3 assets are the PWA icons).

**Background wanted:** Painted strata, exactly as this game's own ART_ASSETS.md sheet 04 already specs: vertically-tiling 68px rock strips, one per band (topsoil 0-20m, shale 21-50, dark seam 51-90, wet shelf 91-140, the glass 141-200), so the material you are descending through actually changes.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `satellites/deepwell/art/deepwell-04-shale.png (and -topsoil, -darkseam, -wetshelf, -theglass)` | 136x480 transparent PNG each (68px wide in game at 2x), must tile seamlessly top-to-bottom, painted rock strata with seams and dust | Replaces the six flat colour divs at renderShaft line 2669. Wired by changing that line to `background:url(...) center top / 68px auto repeat-y`. |
| `satellites/deepwell/art/deepwell-01-miner.png` | 1024x2048 sheet, 32 cells, transparent; the miner rendered at 28px plus the lamp pool from 42x44 up to 284px wide | Replaces `#youMark`, currently a 16px amber CSS ring with a 5px dot - the only character in the game. |
| `satellites/deepwell/art/deepwell-09-surface-header.png` | 694x280 JPG (347x140 in game at 2x), full-bleed painted headframe and winch over the well mouth at dusk | Gives the surface screen a face. Drops in as the first child of `.scrollpane` per the spec's sheet 09; right now that screen opens with nothing but text. |
| `satellites/deepwell/art/deepwell-08-gear.png` | 640x640 sheet, 16 cells at 40px in game, transparent: tank, lamp, pack, brace, boots, charm, plus cash, sack, pick, winch, down arrow, maxed seal | Breaks the four identical shop rows apart - each one gets its own object instead of the same grey price box. |

**CSS to do:**
- The gear row card (`.card` family, index.html ~142) - add a `--gear-tint` per track and paint it into `border-left:3px solid var(--gear-tint)`, so TANK/LAMP/PACK/BRACE stop sharing one silhouette.
- `.scrollpane` on `#shopScreen` - reserve a 140px block above the CASH ON HAND card for the painted header plate; the screen currently starts flush against the 48px `.ovlhead`.
- The five progress dashes under each gear name - raise from 6px to 8px tall and fill bought steps with `var(--amber)` instead of the current uniform grey, so upgrade level reads without counting.
- The '60 CASH' price boxes - they are grey `--muted` on `#171a22`, the lowest contrast text on the screen. Move the number to `var(--cream)` and keep only the 'CASH' label muted.

**Emoji as art:** Essentially none - 3 emoji total across 182KB. The problem here is absent art, not emoji standing in for it.

**Readability:** Mostly ok: cream on near-black, body text 15px+, GO DOWN is a full-width slab well over 48px. The grey price numbers ('60 CASH', '50 CASH') are the one low-contrast element, and the 6px progress dashes carry information at a size nobody can read.

**Music chip:** Yes, twice. On the surface screen it covers the right edge of the LAMP row's '50 CASH' price panel. Inside the soundtrack drawer it sits on the '+ New' playlist button, which is the only control in the PLAYLISTS row.

### Power Scalers
`power-scalers` · satellite · creative · first committed 2026-07-05 · impact 5/5 · effort L
`satellites/power-scalers/index.html`

**Now:** Near-black navy (#0B0A14) with three big blurred radial blobs (violet, teal, magenta) drifting behind everything, rounded panel cards with hairline lavender borders, a cyan-to-violet-to-magenta gradient wordmark, and teal-to-violet gradient pill buttons. There is no illustration anywhere in the app: the only image file in the whole satellite is og/card.jpg, which is a social preview and is never rendered. Every race, power and avatar is a system emoji (226 emoji, 81 distinct).

**Wrong with it:**
- The 'Got it' button at the foot of the How to Play sheet is cut by the 667px viewport — only the top half of the word shows, so the sheet's primary dismiss is half off-screen at phone height.
- The modal sub-line collides with its own close button: 'Forge original characters, then prove them ...' ellipsises against the X and drops 'in' before wrapping to 'the arena.' — a truncated sentence in the second line of the screen.
- The floating music control's round X overlaps the red feedback ladybug on the right edge; two ~34px circles sitting half on top of each other, both hard to hit and neither belonging to the game.

**Background now:** Flat #0B0A14 (--void) with .aurora::before / ::after / .m — three fixed 52-70vmax radial-gradient circles at blur(90px), opacity .5/.5/.3, mix-blend-mode:screen, slowly drifting. Zero background images (bgImageDecls 0).

**Background wanted:** bg-arena-540x960.jpg — a painted dark arena bowl so the roster, gauntlet and duel screens sit in a place instead of on a CSS gradient. Right now the aurora blobs are the entire art direction.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-arena-540x960.jpg` | 540x960 full-bleed. Dark arena interior seen from the floor: banked stone tiers receding into shadow, two braziers throwing warm gold pools left and right, dust motes in a shaft of light, near-black across the top 140px so the sticky topbar stays readable. | Replaces the three blurred CSS aurora blobs, which are the game's only visual background. Gives the whole app a room. |
| `race-vampire-256.png (plus 9 siblings: human, vultramite, stand_user, xenomorph, cyborg, esper, draconid, eldritch, revenant)` | 256x256 transparent PNG each. Painted bust portrait, three-quarter, warm rim light from the upper left on a dark ground, big readable silhouette at 64px. | Feeds the oc.art <img> hook that already exists at index.html:1429 and already falls back to oc.emoji on error. Replaces the emoji at index.html:474-514 that currently ARE the character art. |
| `power-icons-48-sheet.png` | 576x384 transparent sprite sheet, 12x8 grid of 48x48 glyphs, engraved-brass on transparent, one per entry in the POWERS table (Super Strength, Iron Body, Deep Reserves, Overmind, Blitz Step, Killer Instinct, Aether Blast ...). | Replaces the ~60 raw emoji used as power icons (index.html:520+), which is why 81 distinct emoji are doing the job of an icon set. |
| `ui-card-frame-540x180.png` | 540x180 nine-slice, transparent. A thin brass-and-bone frame with a slightly heavier top rail and corner rivets. | The How to Play sheet is four identical rounded rectangles stacked; a frame with a real top edge breaks the repeated silhouette so the four rows stop reading as one shape. |

**CSS to do:**
- The How to Play sheet footer (the .step-body container's trailing gradient button) — make the button `position:sticky; bottom:0` with `padding-bottom:calc(14px + env(safe-area-inset-bottom))` and a short scrim above it, so 'Got it' is never cut by a 667px viewport.
- The modal header sub-line (the paragraph under 'How to Play') — it truncates against the close button; give the header `padding-right:56px` so the X does not eat the sentence.
- .emoji-pick (index.html:219) — width:44px; height:44px is under the 48px touch minimum; take both to 48px and drop the row gap to 5px to keep five per row at 375px.
- :root (index.html:24-32) — retune toward house style: --void:#0d100c, --aur-gold:#c8a84b, and keep ONE cool accent instead of the teal/violet/magenta trio. The neon triad is what makes this read as a different studio from the rest of the fleet.
- .brand .k (index.html:56) — the gradient text fill goes near-invisible when the modal scrim dims the header; add a `color:var(--ghost)` fallback and `text-shadow:0 1px 2px #000` so the wordmark survives the overlay.

**Emoji as art:** Everywhere, and they are the entire art system. 10 race icons at index.html:474-514 (🧑 🧛 🔷 👻 👽 🤖 🔮 🐉 🐙 💀), ~60 power icons at index.html:520+ (⚔️ 🛡️ 🫁 🧠 💨 🎯 🌀 ...), and EMOJI_CHOICES at index.html:1618 is a 20-entry avatar picker (❔ 😈 👑 🗡️ 🔥 ⚡ 🌙 💀 🐉 👁️ 🦂 ❄️ ☠️ 🌀 🩸 🐺 🦅 🔱 💫 🖤) that literally serves as the character portrait system.

**Readability:** .brand .s is 11.5px with .34em tracking in --mist-dim #726d90 on #0B0A14 — well under 0.7rem and low contrast. .emoji-pick is a 44px touch target, under the 48px minimum. Modal body copy (16px cream on #181524) is comfortable. The gradient wordmark loses almost all contrast once the modal scrim dims it.

**Music chip:** The chip itself covers no text — it sits in the topbar between the wordmark and the close X with a few px of clearance at 375px. But the floating music control's round X dismiss overlaps the red feedback ladybug on the right edge, roughly half on top of it; two circular controls fighting for the same ~40px of screen.

**A "looks broken" claim here was refuted on a second look.** The headline claim is refuted by measurement. In shots/power-scalers-2play.png the How-to-Play sheet spans CSS y=120-655, which is exactly the `max-height:80vh` on `.modal` (index.html:330), and it carries `overflow-y:auto`. I sampled the bottom rows: device y=1310-1334 (CSS 655-667) is uniform backdrop #07060E edge to edge, i.e. the intact 12px `.modal-back` padding below the sheet's rounded bord

### Rule Root
`rule-root` · satellite · puzzle · first committed 2026-07-10 · impact 4/5 · effort M
`satellites/rule-root/index.html`

**Now:** Boot is the house menu template again: gold display title, sage SKY WOLF STUDIO kicker, one gold slab button and six dark cards on a near-black radial gradient. Play landed on the Free Play level select: four chapter headings in sage over fourteen 96x96 dark tiles, every one of them dimmed, then 240px of empty black before a Back button.

**Wrong with it:**
- The floating Music chip sits directly on the 'Free Play' heading, hiding it completely, and eats the first seven words of the subtitle so the line begins mid-sentence with 'you have already solved in Journey'.
- All fourteen level tiles carry .locked (opacity:.4, index.html:66), so the screen's entire content is a wall of dead grey boxes whose 24px numbers land around #5b564d on #0f150c. The main subject of the screen is its least legible element.
- .grid uses justify-content:center, so the four-tile chapters fill the width while the three-tile chapters centre. The left edge zig-zags against the left-aligned CHAPTER labels - a ragged grid, not a composed one.
- 240px of flat black between the last tile and the Back button; the screen ends in empty space.

**Background now:** radial-gradient(120% 80% at 50% 0%, #101610 0%, #05070a 70%, #000 100%) on the boot stage, and a flat linear-gradient #0e140d to #0b0f0b on .screen. No image anywhere: bgImageDecls 0, imgTags 0, assetFiles 1 (the og card only), no assets/ folder.

**Background wanted:** bg-rule-garden-540x960.jpg: a painted night garden bed seen from slightly above, carved word-tile stones half-sunk in dark loam along the bottom, sage foliage framing the left and right edges, a warm gold lantern glow behind where the title sits. Same jpg reused behind .screen so menus and board share one place.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-rule-garden-540x960.jpg` | 540x960 full-bleed, painted night garden bed, dark loam foreground, word-stones half-sunk along the bottom, sage foliage framing both edges, warm gold lantern glow upper centre | Replaces the single radial gradient that is currently the whole background of both boot and play. |
| `tile-word-verb-128x96.png` | 128x96 transparent, a carved sage stone slab with a warm gold rim light and a shallow chiselled face for the word | The word tiles are the entire game and are currently canvas rectangles with a linear gradient (index.html:1072). |
| `tile-word-noun-128x96.png` | 128x96 transparent, a rooty bark-wrapped variant of the same slab, copper-toned | Nouns and verbs currently share one silhouette; a player parses the rule sentence by reading, not by seeing. |
| `lvlcard-frame-96x96.png` | 96x96 transparent, a small painted seed-pod frame; ship a second gold-lit solved variant lvlcard-frame-done-96x96.png | Gives the level select something to look at other than fourteen identical dimmed rounded rectangles. |
| `chapter-divider-470x24.png` | 470x24 transparent, a thin painted vine rule in sage with a gold node at the left end | The four CHAPTER labels currently float with no separation; a divider gives the grid a spine and hides the ragged left edge. |

**CSS to do:**
- .lvlcard.locked (index.html:66): opacity:.4 crushes the numbers to roughly #5b564d on #0f150c. Raise to opacity:.6 and hold .lvlcard .ln at opacity:1 so the number stays readable while the card still reads as locked.
- .grid (index.html:64): swap display:flex + justify-content:center for display:grid; grid-template-columns:repeat(4,96px); justify-content:start so chapters 3 and 4 align with chapters 1 and 2 instead of zig-zagging.
- #s-free .pad: pin the Back button to the bottom of the screen, or centre the grid block, so the frame does not end in 240px of black.
- h2.sc-h inside #s-free: the music chip lands on it. Add padding-left:120px to h2.sc-h on non-title screens so the heading starts clear of the chip's corner.
- .screen (index.html:42): add url(assets/bg-rule-garden-540x960.jpg) center/cover under the existing linear-gradient once the art lands.

**Emoji as art:** Seven emoji on the title-screen buttons (seedling, calendar, leaf, ribbon, flower, question mark, gear) and a full emoji icon gutter on the How screen. The puzzle board and word tiles are canvas-drawn, not emoji.

**Readability:** Level numbers at 24px cream multiplied by .4 opacity on #0f150c fail contrast badly and are the worst text on the screen. The 'Free Play' heading and the first seven words of its subtitle are hidden behind the music chip. CHAPTER labels at 13px sage with 3px letter-spacing are fine. Touch targets pass: .lvlcard is 96x96, .btn rows are 48px+.

**Music chip:** Covers the 'Free Play' heading entirely and the first seven words of the subtitle line on the Free Play screen. The chip picked its corner against the boot layout, where that corner was empty.

### Bloom Breaker
`bloom-breaker` · satellite · action · first committed 2026-07-05 · impact 4/5 · effort M
`satellites/bloom-breaker/index.html`

**Now:** A near-black playfield with a scatter of about ten single-pixel white dots for stars. Two short rows of flat rounded rectangles - five tan, four olive - float in the upper third, a white ball with a fading grey trail crosses the middle, and a plain green capsule paddle sits near the bottom above a dashed red line. Three red heart glyphs top-left, an emoji coin counter top-right, a dark green leaf blob with a ladybug on it bottom-left.

**Wrong with it:**
- The DOM pause button (#pauseBtn) sits on top of the canvas-drawn HUD readout in the top-right - the coin count and score are clipped behind it, so you can see a stray "2" and "00" poking out from the button's edges.
- About 70% of the frame is dead near-black between the brick rows and the paddle. The star dots sit in no group and no depth, the bricks have no bevel, rim light or texture, and the horizon behind the bricks is empty - it is the sloppy pattern: specks with no motivation and nothing composed.
- Silhouette collision: the paddle, the bricks and the HUD chips are all the same object - a flat rounded rectangle in a different colour. Nothing in the frame reads as a bramble or a bloom, which is what the game is named after.

**Background now:** Flat #04050a body with one radial gradient(120% 80% at 50% -10%, #1a2416, #04050a) behind the canvas; the canvas itself clears to near-black and paints a handful of white dots. Zero image files - grep for new Image / drawImage / .png inside the game returns nothing but the og: meta tags.

**Background wanted:** bg-bramble-540x960.jpg - a painted midnight bramble wall receding into fog: thorny arches across the top where the brick rows sit, a warm lantern low on the left, mossy floor behind the paddle. Dark enough (under 15% luminance) that the white ball stays the brightest thing on screen.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-bramble-540x960.jpg` | 540x960 full-bleed, midnight bramble wall into fog, thorn arches top, warm lantern lower-left, mossy floor band at the bottom, all under 15% luminance | replaces the empty near-black canvas fill; fills the dead 70% of the frame and gives the game its own identity instead of generic breakout |
| `brick-bramble-64x28.png, brick-bud-64x28.png, brick-stone-64x28.png` | 64x28 transparent PNG each, painterly, warm rim light from upper left, two-hit and one-hit variants as separate files (brick-bramble-cracked-64x28.png) | replaces the flat roundRect fills so bricks read as woven bramble and buds; also fixes the paddle/brick/chip silhouette collision |
| `paddle-leaf-120x22.png` | 120x22 transparent PNG, a curled sage leaf with a gold midrib, 9-slice safe (16px caps) so it can stretch when the paddle grows | replaces the plain green capsule; the paddle is the object the player watches for the whole run and it currently has no art at all |
| `powerups-sheet-16x-64x64.png` | one 1024x64 strip, sixteen 64x64 transparent cells, painterly icons for magnet, shield, multiball, slow, fire, laser, boomerang, heart, bomb, bloom | replaces the 16 system emoji currently drawn as powerup faces, which render as a different typeface on every device and clash with the flat rects |

**CSS to do:**
- #pauseBtn - move it off the canvas HUD line: either shift the canvas score/coin fillText origin from VW-14 to VW-58 so it clears the button, or absolutely position #pauseBtn at top:52px so the top row belongs to the readout alone. Right now the DOM button is drawn over canvas text.
- .chip, .chip.coins, .menu-stats - font-size is 10-12px; raise to 13px minimum (0.7rem = 11.2px is the floor and 10px is under it).
- .btn.gold / .btn (the big PLAY slab) - once a painted background lands, drop the solid linear-gradient(#7ab356,#5c8a3f) fill for a painted plate or an outlined pill; a filled slab over painted art is a house no-go.
- canvas HUD - the three heart glyphs are drawn with ctx.fillText('♥') at 18px sans-serif; swap for a 20x18 sprite so lives do not change shape between iOS and Android.

**Emoji as art:** Heavily. 42 distinct emoji: the powerup faces (🔱 🔫 🧲 🐌 ❤ 🔥 🛡 🌀 🪃 🌐 ⚡ 💥 🌸 ❓ 🎯 🔻), the coin counter 🪙 drawn straight into the canvas HUD, ♥ for lives, ✳ on the ball trail marker, 🗺 🛒 ⚙ on the menu buttons, and 🐞 as the feedback button.

**Readability:** HUD chips run 10px, 11px and 12px - the 10px and 11px are under the 0.7rem (11.2px) floor. The level label "1/6 · First Sprout" is dim gold on near-black and is additionally covered by the music chip. Menu buttons are 48px+ and fine.

**Music chip:** Yes. The chip parks TOP CENTRE and lands squarely on the canvas level label - it covers "· First Sprout" and clips the "6" of "1/6", so the player cannot read which level they are on. Confirmed on both -2play and -3later at 2x.

**Looks broken** (confirmed on a second look, severity ugly)**:** Overlapping UI, visible in the shot: the pause button #pauseBtn (DOM, top-right) is drawn on top of the canvas-rendered coin and score text - a stray "2" and "00" are clipped either side of the button box. Separately the injected music chip covers the canvas level label at top centre. Capture reached "canvas" so this is the real playfield, not a menu. No 404s.

### Pollinator Paths
`pollinator-paths` · satellite · puzzle · first committed 2026-07-10 · impact 4/5 · effort M
`satellites/pollinator-paths/index.html`

**Now:** Boot is the house menu template: gold display title on a near-black radial gradient, sage kicker, one gold slab button and four dark cards. Play is a 375x667 sheet of almost unbroken #0b0f0b with four canvas-drawn flower pads (dark green disc, sage leaf spokes, a cream species silhouette, a dashed gold ring), two bare pink stroke circles and one tiny gold bee. Roughly 85% of the playfield is empty black.

**Wrong with it:**
- The floating Music chip is parked on top of the top-left home button in the play HUD; only the very top of the house glyph shows above the chip's rounded corner and the chip also clips the left edge of the hearts/score bar.
- The playfield is ~85% unbroken near-black. There is no meadow ground, no grass line, no depth cue and nothing at any edge. The horizon is empty in the literal sense the house rule warns about.
- The two cross-pollination rings are bare 2px pink strokes with no fill, no glow and no petal detail. They read as stray circles left behind by a debug draw, not as blossom rings the copy calls glowing.
- The ladybug feedback button and its close X overlap each other bottom-right, two unrelated circles sitting half on top of one another over live playfield.

**Background now:** Flat canvas fill #0b0f0b plus a single vertical linear gradient (index.html:619). Menu screens use radial-gradient(120% 80% at 50% 0%, #101610 0%, #05070a 70%, #000 100%) and a flat linear-gradient #0e140d to #0b0f0b on .screen. bgImageDecls 0, imgTags 0, no assets/ folder at all.

**Background wanted:** bg-meadow-night-540x960.jpg drawn full-bleed under the canvas the way spore-drift draws abyss.jpg: painted night meadow, deep sage-black ground occupying the lower third with soft grass silhouettes, indigo sky above, a low warm moon glow top-right, gentle vignette so the pads pop.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-meadow-night-540x960.jpg` | 540x960 full-bleed, painted night meadow, indigo sky, sage-black grass silhouettes across the lower third, low warm moon glow top-right | Replaces the flat #0b0f0b canvas fill. Gives the game a place instead of a void and stops the frame reading as 85% empty. |
| `flowerpad-bee-96x96.png` | 96x96 transparent, painted flower pad from above, sage leaves, warm gold rim light, bee silhouette pressed into the centre | Replaces the canvas rosette (disc + spokes + cream blob) whose species silhouette is illegible at its 48px rendered size. |
| `flowerpad-butterfly-96x96.png` | 96x96 transparent, same pad language, rose petals, butterfly silhouette, dashed gold inner ring baked in | Same as above; also makes the three pads differ by shape and hue rather than by ring dash pattern alone. |
| `flowerpad-hummingbird-96x96.png` | 96x96 transparent, cream-gold petals, hummingbird silhouette, dotted inner ring baked in | Completes the pad set so shapes match shapes as the How screen promises. |
| `flier-bee-48x48.png` | 48x48 transparent, side-on painted bee, warm gold rim light, big readable silhouette, 3-frame wing strip optional | The bee is currently a ~24px canvas blob barely distinguishable from a dust mote. |
| `flier-butterfly-48x48.png` | 48x48 transparent, painted butterfly, rose and cream wings, warm rim light | There is no butterfly art at all; the three species must read apart at a glance while lines cross. |
| `flier-hummingbird-48x48.png` | 48x48 transparent, painted hummingbird, sage and gold, blurred wing pass | Third flier, same reason. |
| `ring-blossom-128x128.png` | 128x128 transparent, rose petal ring with a soft inner glow and a faint gold pollen dust | Replaces the bare 2px pink stroke circles that currently look unfinished. |

**CSS to do:**
- #hud .hbtn (the home button, first child of #hud): the injected music chip lands exactly here. Add padding-left:120px to #hud on the play screen, or move the home button into #hudmid, so the corner is free for the chip.
- .screen (index.html:115 area, the menu/how/wardrobe/grove screens): add url(assets/bg-meadow-night-540x960.jpg) center/cover under the existing linear-gradient, the way spore-drift does at its line 59, so menus and playfield share one place.
- .finer / the footer version line 'Pollinator Paths v1.0 - 0 landings - 0 cross-pollinations': 13px muted grey on black. Raise to 14px and to var(--cream) at 0.7 alpha.
- #hudmid .hstat: hearts and 0/6 sit at 14px against a #0f150cbb pill. Add a 1px var(--gold) top highlight or raise the pill to #0f150ce6 so the bar separates from the playfield instead of floating.

**Emoji as art:** Bee, calendar, lightning and moon emoji on the four mode buttons; a full emoji icon gutter on the How screen (pointing hand, bee, explosion, flower, blossom, moon); a flower emoji in the keepsake toast; every wardrobe item is an emoji (galaxy, sunrise, lantern, sparkles, bee, dove, shooting star). The fliers and pads themselves are canvas-drawn, not emoji.

**Readability:** Flower pad silhouettes are cream on dark green at roughly 48 rendered px and read as blobs at 1x; a player cannot tell the bee pad from the butterfly pad without the ring dash. Footer version line is 13px muted grey on near-black, borderline. HUD stats at 14px cream/gold are fine. Touch targets pass (hbtn min 52x48 with a grown hit area).

**Music chip:** Covers the top-left home button in the play HUD and overlaps the left edge of the hearts/score bar. The home button is effectively unreachable while the chip is up.

### Cipher Bloom
`cipher-bloom` · satellite · word · first committed 2026-07-10 · impact 4/5 · effort M
`satellites/cipher-bloom/index.html`

**Now:** A near-black column of seven identical rounded slabs under a gold wordmark; only the top button (Daily Cipher) is filled gold, the other six are the same flat dark-green rectangle with cream label text. The whole page is CSS: a radial gradient ground, linear-gradient buttons, zero images anywhere in the file (bgImageDecls 0, imgTags 0, inlineSvg 0, 1 asset file and that is the og share image). The robot tapped the music unlock card and landed on the Decoded Gallery, which is one line of muted text over roughly 500px of unbroken black.

**Wrong with it:**
- The injected music chip parks on the top-left of the gold CIPHER BLOOM wordmark at boot and eats the Ci; on the Decoded Gallery screen it eats Deco so the heading reads ded Gallery.
- Six of the seven menu buttons are the identical dark slab (linear-gradient(180deg,#1a2415,#121a0f), index.html:56) with no rim, no icon and no grouping, so Garden of Verses, Sun Race, Zen Reading, Gallery, Wardrobe, How to Play and Settings read as one grey mass rather than motivated pairs.
- The Decoded Gallery empty state is about 500px of flat #0b0f0b under a single Back button with no plinth, no frame and no horizon; it looks like a screen that failed to load rather than an empty collection.

**Background now:** Pure CSS. #wrap is radial-gradient(120% 80% at 50% 0%, #101610, #05070a 70%, #000) (index.html:39) and every .screen lays linear-gradient(180deg,#0e140d,#0b0f0b) over it (index.html:44). No image is loaded by the page at all.

**Background wanted:** A painted midnight garden behind the title/menu screen, and a warm vellum texture under the #paper cryptogram card. The game is about letters worn into something; right now nothing on screen has a surface.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-cipher-title-540x960.jpg` | 540x960 full-bleed, painted midnight garden: a carved stone tablet half sunk in moss with letters worn shallow, one shaft of moonlight from upper left, deep near-black ground, sage foliage, gold glints, bottom third darkened so the button stack reads | Replaces the flat linear-gradient on the title .screen. The menu currently floats on nothing. |
| `paper-vellum-516x600.png` | 516x600 transparent PNG, warm cream vellum with faint tooth, a soft deckled left edge and a subtle inner shadow, tileable vertically | Replaces #paper's flat linear-gradient(180deg,#e8dcc8,#dccbb0) at index.html:106. The cryptogram card is the hero surface of the game and is currently two stops of beige. |
| `blooms-sheet-8x-192x192.png` | One 1536x192 strip, eight 192x192 cells on transparent: eight painted keepsake blooms, warm rim light, gold-cream centres, one per unlock tier | Replaces the procedural flower drawn with ctx.ellipse and ctx.arc at index.html:607-614. That flower is the reward for solving a verse and it is currently three ellipses and a dot ring. |
| `gallery-plinth-420x260.png` | 420x260 transparent PNG, a painted empty stone seed tray with two small gold pins and a soft shadow, sage moss at the base | Gives the no blooms yet gallery something to look at instead of 500px of black. |

**CSS to do:**
- index.html:44 .screen (title screen) - add background-image:url(assets/bg-cipher-title-540x960.jpg) center/cover no-repeat above the existing linear-gradient(180deg,#0e140d,#0b0f0b) so the menu sits on painted ground.
- index.html:56 .btn - add box-shadow: inset 0 1px 0 rgba(200,168,75,.22), 0 2px 0 #0a0e08 so the six identical dark slabs separate from the ground and from each other.
- index.html:106 #paper - swap linear-gradient(180deg,#e8dcc8,#dccbb0) for url(assets/paper-vellum-516x600.png) center/cover, keeping the existing inset 0 0 40px #0002 shadow.
- Gallery empty container - give it min-height:300px and centre gallery-plinth-420x260.png in it, so the empty state is a composed frame instead of a void.
- Intro blurb (13px on a 540 stage scaled 0.694 to 375 wide = 9.0 real px) - raise to 17px stage so it clears the 0.7rem / 11.2px bar.

**Emoji as art:** Almost none - 4 emoji total, 2 distinct. The music unlock card's note glyph and the shell furniture. Emoji are not doing art duty here; CSS gradients and canvas primitives are.

**Readability:** Contrast is fine (cream on near-black, gold CTA). Text size is the problem: the intro blurb and most labels are 11-14px on a 540px stage that scales 0.694 to a 375 viewport, so they render at 7.6-9.7 real px, under the 0.7rem bar. Touch targets are already handled and documented - .kbtn is min-height:72px and .cell is padded to 68 stage px with a written exemption for width (index.html:110-112, 142-144).

**Music chip:** Yes. On boot the chip covers the first two letters of the gold Cipher Bloom wordmark. On the Decoded Gallery screen it covers Deco of Decoded Gallery and greys the subtitle under it.

### Line Loom
`line-loom` · satellite · puzzle · first committed 2026-07-10 · impact 4/5 · effort M
`satellites/line-loom/index.html`

**Now:** A near-black field with four hairline cream outline shapes (two squares, a circle, a triangle) scattered in it and one soft navy river band winding across the middle. Nothing else. Below, six numbered thread chips in a row with the last three dimmed almost out, an UNWEAVE button and a shuttle readout. Boot is better: a gold gradient wordmark, a sage subtitle and a stack of dark button slabs in house colours.

**Wrong with it:**
- The playfield reads as empty. A dot grid IS drawn (index.html:720-721) but th.grid #131a11 against th.bg #0b0f0b is essentially the same colour, so the texture that was meant to fill the field is invisible at 375px and about 70 percent of the screen is flat black.
- The stations are 1px cream wireframe outlines about 16px across. They read as debug markers, not as places, and they have no relationship to the river: the triangle sits on the bank, the rest float in void.
- Thread chips 4, 5 and 6 are at opacity .38 (.chip.lock, index.html:101) on near-black, so they read as broken rather than locked, and this collides with the standing house rule about never dimming the player's own hand.
- The river's left end is cut flat by the frame edge against nothing, and its 2px #1d3a52 stroke is the only edge treatment: water meets land through a hard line, no bank, no foam, no shallows.

**Background now:** Canvas: flat fill th.bg #0b0f0b, then a 2x2px dot grid in th.grid #131a11 every 40px, then the river polygon in th.river #101c29 with a th.redge #1d3a52 stroke (index.html:717-726). Three named themes exist (Night Loom, Parchment, Blueprint) and all three are three flat colours plus a stroke. No images anywhere: bgImageDecls 0, imgTags 0, assetFiles 1 (an og image).

**Background wanted:** A painted valley. The game's own DAILY WEAVE button says 'same valley for everyone today' and the board shows a black void. Soft night hills, tree clumps, mist pooling in the low ground, the river reading as water carved through it, all dark enough that the cream stations and the coloured threads stay the brightest things on screen.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/valley-night-540x960.jpg` | 540x960 full-bleed, painted night valley, deep #0b0f0b lows so the existing palette still sits on it, soft hills and tree clumps, a mist band through the middle third where the river runs. | Replaces the flat fill plus invisible dot grid in render(). Two sibling files, valley-parchment and valley-blueprint, cover the other two unlockable themes. |
| `assets/station-circle-96.png, station-square-96.png, station-triangle-96.png` | 96x96 PNG each, transparent, a painted stone waymarker in that shape seen from slightly above, cream rim light on the upper edge, soft shadow pooled beneath. Must read at 32px. | Replaces the 1px hairline outline strokes that currently look like a wireframe overlay. |
| `assets/bridge-96x48.png` | 96x48 PNG, transparent, a plank-and-rope bridge seen from above with a warm timber tone, rotatable about its centre. | Replaces the two stacked fillRects at index.html:739-740 (a 32x14 cream bar with a 32x4 navy bar through it). |
| `assets/river-foam-540x120.png` | 540x120 PNG, transparent, tileable horizontally, foam and wet-stone bank for the top and bottom edges of the river band. | So the water meets the land through a transition instead of a flat 2px stroke. |

**CSS to do:**
- render() index.html:720-721: th.grid #131a11 on th.bg #0b0f0b is invisible. Lift the Night Loom grid to about #1c2618 and make it a warp-and-weft cross rather than a 2px dot, so the field looks woven, which is the game's whole metaphor.
- .chip.lock (index.html:101) at opacity .38 reads as broken not locked. Keep opacity at .6 or above and add a small padlock mark, per the standing rule against dimming the player's own hand.
- #weekchip (index.html:92) is flex:1 centred in #topbar and lands straight under the injected music chip, so WEEK 1 DAY 1 is unreadable. Move #weekchip right of #bridgechip, or reserve the top-left 120px of #topbar.
- The injected feedback bug button floats at roughly x340 y510, inside the canvas playfield, where it will sit on top of stations as the map fills. Dock it into #topbar.
- render() river: the polygon runs off both frame edges with a flat stroke. Fade the stroke alpha to 0 over the last 24px at each edge so the water does not end in a hard cut.

**Emoji as art:** Almost none, and that is fine: emojiDistinct is 2. The scissors mark on UNWEAVE is a Unicode glyph and the ladybug bottom-right is injected fleet furniture. The real substitution here is not emoji but hairline canvas strokes standing in for every object in the world.

**Readability:** The HUD is disciplined: #weekchip, #bridgechip, #poolchip and #unweave are all 17px with 72px chip heights and a 72px UNWEAVE, comfortably over the 48px floor. Two problems: the build stamp on the title screen is 11px (index.html:221, 0.69rem) and the locked chips at .38 opacity are effectively unreadable. Everything is browser default sans-serif, on both the canvas and the shell.

**Music chip:** Yes. The chip sits top-centre-left over #weekchip and covers all but the leading W and a fragment of EE, so the player cannot read which week or day they are on. #weekchip is live game state that the weekly gift choice depends on.

### Pit Bike Rally
`pitbike-rally` · satellite · action · first committed 2026-07-04 · impact 4/5 · effort S
`satellites/pitbike-rally/index.html`

**Now:** At 375x667 portrait every frame is the rotate gate: a flat near-black field (#17181c), a 52x88 gold CSS-border rounded rectangle standing in for a phone, white italic 'ROTATE TO LANDSCAPE' and a thin grey caption. Nothing else is on screen. The landscape game behind it was never visible in any of the three shots, and the game's own painted art (assets/bg/bg_menu.jpg is a lovely sunset dirt track with a wolf on a rock, a green pit bike and a SKYWOLF garage) never appears on this screen.

**Wrong with it:**
- The rotate wall is a flat #17181c fill (css/game.css:172 background:var(--ink)) while bg_menu.jpg, bg_garage.jpg and bg_podium.jpg sit unused in assets/bg — the one screen a phone player is guaranteed to see is the only screen with no art on it.
- The 'phone' is a 52x88 gold border rectangle with rounded corners and nothing inside it — no speaker slot, no home button, no screen content — so next to painted game art it reads as a blank yellow card, not a device.
- The frame has no brand anchor: ui_logo_lockup.png exists in assets/art/ui and is not on this screen, so there is no title, no wolf, no bike. The only two objects in the top 350px are the injected Music chip at top-left and the red feedback ladybug at top-right, unbalanced across 500px of empty black.

**Background now:** Flat --ink #17181c on #rotate-ov (css/game.css:171-172). No image, no gradient, no texture. The screens underneath it do use painted JPGs (bg_menu / bg_garage / bg_podium) but the portrait overlay covers them.

**Background wanted:** bg-rotate-portrait-540x960.jpg — the existing bg_menu sunset dirt track recomposed vertical, under a dark scrim, so the rotate wall shows the game it is asking you to turn your phone for.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-rotate-portrait-540x960.jpg` | 540x960 full-bleed. The bg_menu scene recomposed vertical: wolf on the rock high-left, green pit bike centre-third, SKYWOLF garage low-right, sunset sky top. Baked-in 40% darkening top and bottom so white type reads. | Replaces the flat #17181c fill on #rotate-ov. Turns the only screen a portrait player sees from an empty box into the game's poster. |
| `icon-rotate-phone-96x160.png` | 96x160 transparent PNG. A painted phone with a warm gold bezel, a sliver of the dirt track visible on its screen, soft rim light from the left. | Replaces the 52x88 CSS border rectangle (#rotate-ov .phone) which is a wireframe placeholder sitting next to a repo full of painted art. |

**CSS to do:**
- #rotate-ov (css/game.css:171) — replace `background:var(--ink)` with `linear-gradient(180deg,rgba(10,10,12,.35),rgba(10,10,12,.85)), url(../assets/bg/bg-rotate-portrait-540x960.jpg) center/cover no-repeat var(--ink)`.
- #rotate-ov markup (index.html:225) — add `<img class="menu-hero" src="assets/art/ui/ui_logo_lockup.png" alt="">` above .phone; the .menu-hero rule (width:min(46vw,300px), drop-shadow) already exists in css/game.css and is unused on this screen.
- #rotate-ov p (css/game.css:177) — 14px #9a9da8 on #17181c is thin; take it to 15px var(--dust) #c9c2b4 with `text-shadow:0 1px 2px #000` once the poster is behind it.

**Readability:** The caption 'Pit Bike Rally races sideways. Turn your phone to ride.' is 14px in #9a9da8 on #17181c — low contrast and under the 0.7rem comfort bar. The banner headline is fine. No tappable elements on this screen, so no touch-target fault.

### Stop Motion
`stop-motion` · satellite · creative · first committed 2026-07-18 · impact 4/5 · effort M
`satellites/stop-motion/index.html`

**Now:** A flat near-black page (#0b0f0b over a #101610 radial) with a large sage 'Stop Motion' wordmark, a gold letter-spaced 'SKY WOLF STUDIO' subline, a four-line cream paragraph, then roughly 180px of empty black, then a green gradient 'Open Studio' button and a dark ghost 'How it works' button. There is no picture anywhere on the screen - not a camera, not a puppet, not a film strip.

**Wrong with it:**
- The whole middle of the page is empty. Between the end of the paragraph (y~340) and the Open Studio button (y~520) there is a `<div style="flex:1">` spacer painting nothing, so the composition is text at the top, buttons at the bottom, and a black hole where the hero image should be.
- Nothing on the title screen says what the app is. A creative tool about photographing objects frame by frame shows zero photographs, zero frames, zero film strip - a first-time player has only the paragraph to go on.
- The injected back-arrow chip sits directly on top of the 'How it works' heading on the help screen, covering the 'Ho' - two pieces of UI stacked in the same 44x44 box.
- The two buttons are the only shapes on the page and they are both full-width rounded slabs, one bright green one dark, stacked - no hierarchy beyond colour, and the green `.btn.primary` slab is exactly the filled-slab treatment the house style avoids over art (there is no art here to sit on, which is itself the problem).

**Background now:** No image. `#wrap` is `radial-gradient(120% 80% at 50% 0%, #101610 0%, #05070a 70%, #000 100%)`; `#stage` is a flat `#0b0f0b`; `.screen` is `linear-gradient(180deg,#0e140d,#0b0f0b)`. bgImageDecls = 0. The only `<img>` tags in the file are `#onion` (the onion-skin ghost) and `#pb-img` (the playback frame) - both user photos, no shipped art.

**Background wanted:** A painted maker-bench backdrop for the title screen, 540x960: a dark workbench top across the lower third lit by one warm desk lamp from the upper left, a phone propped on a small stand at the left edge, a clay figure mid-pose in the lamp pool, and a strip of developed film hanging out of focus at the top going near-black so the wordmark stays readable. That one plate answers 'what is this app' before the paragraph does.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-bench-540x960.jpg` | 540x960 full-bleed JPG. Dark workbench, one warm desk lamp from upper left, a propped phone at the left edge, a small clay figure mid-pose in the lamp pool, out-of-focus film strip across the top fading to near-black. | Replaces the flat #0b0f0b title screen and fills the ~180px empty band that is currently a `flex:1` spacer. |
| `hero-filmstrip-480x200.png` | 480x200 PNG, transparent. Six sprocket-holed frames in a gentle arc, each holding a clay figure one step further through a wave, with the last frame lit warmer than the first. | Drops into the empty middle of the title screen. Shows the core idea - small moves, many frames - in one glance, replacing pure explanation-by-paragraph. |
| `onion-ghost-frame-540x470.png` | 540x470 PNG, transparent. A soft cream corner-bracket viewfinder with a faint rule-of-thirds grid and a small ghost-icon badge in the top right. | The studio currently shows a bare `<video>` with four 1px `.tl` hairlines for thirds. A painted viewfinder frame makes the onion-skin state visible and gives the camera view a border. |
| `empty-strip-slot-96x96.png` | 96x96 PNG, transparent. A dashed sage frame outline with a small sprocket edge on the left and a faint plus at 30% opacity. | The frame strip at the bottom of the studio is empty on first run; a painted empty-slot plate turns the blank strip into an invitation. |

**CSS to do:**
- `#s-title .pad` - the `<div style="flex:1">` spacer at index.html:151 paints nothing across ~180px. Replace with a block carrying `background-image:url(hero-filmstrip-480x200.png); background-size:contain; background-position:center; background-repeat:no-repeat; min-height:200px`.
- The injected back-arrow chip overlaps `h2.sc-h` on `#s-how`. Add `.screen .pad{ padding-top:74px }` (or push `.sc-h` down by the chip height) so the heading clears the fixed chip on every screen.
- `#s-how .pad` bottom - the 'Got it' button is clipped by the viewport bottom under the music sheet. Add `padding-bottom:120px` to the scroll container so the primary action is always fully reachable.
- `#wrap` - layer `bg-bench-540x960.jpg` under the existing radial gradient with `background-size:cover; background-position:center`, keeping the gradient as a top scrim so the sage wordmark holds contrast.
- `.title-sub` ('SKY WOLF STUDIO') is 14px with 4px letter-spacing in `--gold` on near-black - at 375 the tracking thins it badly; drop to 3px spacing and raise to 15px.
- `.foot` build stamp ('Stop Motion v1.1') renders around 10 real px in `--muted` on black - raise or remove it from the title screen.

**Emoji as art:** Barely any - 7 emoji across 3 distinct glyphs, all in chrome (the injected Music chip, the back-arrow chip, a question mark and a chevron in `#studio-top`). Nothing on the title screen stands in for art because there is no art to stand in for: the screen is type and two buttons.

**Readability:** Body copy is fine (15px cream on near-black). Faults: `.title-sub` at 14px with 4px tracking reads thin; `.foot` build stamp ~10 real px; the `.pill` helper at `font-size:13px`; and on the help screen the 'Got it' primary button is clipped by the viewport bottom so its touch target is partly off-screen. The `.btn{min-height:72px}` stage-px convention is correct and gives ~52 real px.

**Music chip:** The chip itself parks top-right on empty space on the title screen and does not cover anything there. But the music UNLOCK sheet it raises ('CONGRATULATIONS, YOU UNLOCKED A SONG - Raked Sand Stillness') fills the bottom third of the boot frame, burying help step 6 and clipping the 'Got it' button to a sliver at the screen edge. Separately, the injected back-arrow chip covers the first two letters of the 'How it works' heading.

**Looks broken** (confirmed on a second look, severity ugly)**:** Boot frame: the back-arrow chip (top-left, ~x10-60 y10-58 at 1x) is drawn over the 'How it works' h2, hiding 'Ho'. Same frame: the music-unlock sheet covers help step 6 and leaves only the top ~8px of the green 'Got it' button visible at the screen bottom. capture.reached = 'no-more-controls' after taps 'Play it now' and 'Got it', so the robot never entered the studio - the -2play frame is the TITLE screen, not the playfield, and the studio (camera view, onion skin, frame strip) was never photographed. The two listed 404s are /music/v1/maker-bench/*.mp3, the known audio artefact, not game art.

### Meadow Weave
`meadow-weave` · satellite · puzzle · first committed 2026-07-10 · impact 4/5 · effort M
`satellites/meadow-weave/index.html`

**Now:** A near-black green-tinted void with one flat mustard hexagon at centre and six dashed ghost hexes around it; the top third of the screen is completely empty. A dark tray slab at the bottom holds two green pill buttons and a magenta hexagon.

**Wrong with it:**
- The biome art is typewriter punctuation. The gold Field hex is six flat wedges labelled with pipe characters and the tray tile is asterisks (BIOMES at index.html:253-259 uses sym '"', '~', '^', '|', '*'). Nothing on the board reads as meadow, pond, forest or orchard - it reads as a spreadsheet.
- Injected furniture buries the tray: the floating Music chip plus the portal back arrow sit on top of the NEXT tile preview (drawn at x=88, trayY+88) and cover both hint lines, 'hold the tile and circle to spin it' and 'drag your tile to a slot, or tap one'.
- Nothing frames the board. The 7-hex flower floats in a flat canvas gradient with no vignette, no horizon, no light source, and the tray is a hard-edged rgba fillRect (line 503) with no lip or shadow - the playfield and the UI meet at a raw seam.

**Background now:** Canvas linear gradient only: #111a12 to #0c130e to #080d0a (index.html:472), over a page radial gradient #101610 to #05070a to #000 (line 38). bgImageDecls 0, imgTags 0, no new Image() anywhere in the file.

**Background wanted:** bg-weave-540x960.jpg - a painted midnight meadow seen from above: dark loam and moss, a pond glint low-left, hedgerow silhouettes at the edges, and a pool of warm lantern light falling on the centre so the hex flower sits inside a place instead of on black.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-weave-540x960.jpg` | 540x960 full-bleed painted midnight meadow, deep loam and moss, pond glint low-left, hedgerow silhouettes at the frame edges, warm gold light pooling at centre | replaces the flat canvas gradient at index.html:472 so the board is not floating in void |
| `hex-biome-faces-640x128.png` | sheet of 5 painted hex faces, 128x128 each, transparent: meadow grass tuft, pond ripple, forest canopy, wheat field, orchard blossom - each with a warm rim on the top-left edge | replaces the flat BIOMES colours and the ASCII sym glyphs so terrain looks like terrain |
| `hex-slot-ghost-128x128.png` | 128x128 transparent, a soft dashed gold hex outline with a faint inner glow | replaces the setLineDash([4,4]) 1.2px outline at line 476 that currently reads as a CSS border |
| `tray-shelf-540x150.png` | 540x150 transparent PNG, painted dark wood shelf with a warm gold lip along the top edge and a soft drop shadow above it | replaces the hard rgba(12,18,12,0.9) fillRect tray so the UI meets the board through a transition |

**CSS to do:**
- Canvas board gradient at index.html:472 (ctx.createLinearGradient in drawBoard): delete it and drawImage the painted bg-weave background instead, then keep a 0.35 black scrim on top so tiles still read.
- Canvas hint text at index.html:511-513 is '600 11px system-ui' (0.69rem, under the 0.7rem floor) AND sits under the Music chip - raise to 13px and move it to trayY+108, above the button row.
- HB_MENU at index.html:532 is {w:44,h:44} - under the 48px touch minimum; make it 48x48.
- roundBtn at index.html:536 draws 'Rotate' with the emoji clockwise-arrows glyph, which renders blue on a green pill - swap for a drawn cream chevron-circle so the button is one colour family.

**Emoji as art:** The Rotate button label uses the clockwise-arrows emoji (line 509) and it renders blue against the green pill. The seed counter uses a seedling emoji in the HUD (line 495). Board terrain is worse than emoji - it is ASCII punctuation used as biome icons.

**Readability:** Canvas HUD and tray labels run 11-12px system-ui ('SEEDS', 'TILES', quest rows at line 531, both hint lines at 511-513) - all under the 0.7rem / 11.2px floor. Menu button HB_MENU is 44x44, under 48px. The two hint lines are also physically covered by the Music chip and the back arrow.

**Music chip:** The chip sits bottom-left over the tray and covers the NEXT tile preview (about 70% of it) plus both instruction lines at the foot of the screen. The portal back arrow overlaps it from the left, so three pieces of furniture stack in one corner.

**Looks broken** (confirmed on a second look, severity ugly)**:** meadow-weave-2play.png and -3later.png: the NEXT tile preview and both hint strings are obscured by the Music chip and the back arrow at the bottom-left; the hint text that is still visible reads through the chip's translucent edge. Also the feedback ladybug badge and its close X sit on the playfield at roughly x=340,y=520.

### Silt
`silt` · satellite · creative · first committed 2026-07-10 · impact 4/5 · effort S
`satellites/silt/index.html`

**Now:** All three frames are the same full-screen How Silt works text wall: a flat near-black rectangle with nine emoji bullets down the left edge and 14px cream body copy with gold bolded terms. No horizon, no image, no depth anywhere in the 375x667 frame. capture.reached says canvas, but a first-run IIFE at line 1131 auto-opens the How screen 80ms after load, so the playfield never appears in any shot.

**Wrong with it:**
- The floating Music chip (top-left, roughly x10-100 y14-58) sits directly on the screen title, so the header renders as …works with How Silt hidden behind a dark slab, and it also grays out the first bullet's The goal opener.
- #s-how already loads assets/backdrops/panel_wash.jpg, but the scrim over it is linear-gradient(rgba(11,15,11,.55), rgba(6,8,10,.86)) — at phone size not one pixel of the painting survives, so a 3.3MB art folder renders as a blank black page.
- Ten emoji bullets do the entire icon job while sixteen painted element icons sit unused in assets/ui/ (icon_silt, icon_water, icon_fire, icon_seed, icon_soil, icon_stone, icon_oil, icon_brush, icon_erase) — grep finds only assets/ui/icon_home.png referenced anywhere in the file.

**Background now:** Flat near-black. #s-how (line 47) declares url('assets/backdrops/panel_wash.jpg') but under a .55-to-.86 black gradient that erases it. The stage behind the screens is radial-gradient(120% 80% at 50% 0%, #101610 0%, #05070a 70%, #000 100%); the sim layer #simbg is set from JS (line 379) to assets/backdrops/surround_<pal>.jpg and is never visible in any of the three shots.

**Background wanted:** Keep panel_wash.jpg but lift the scrim to .30-to-.62 so it reads as a lit stone shelf behind the copy, and let the boot frame be s-title with title_shelf.jpg instead of dropping a new player onto a text wall 80ms after load. A new how_shelf backdrop would beat panel_wash because that image is too even to survive any scrim.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/backdrops/how_shelf_540x784.jpg` | 540x784 full-bleed JPG. A damp stone shelf lit warm from the upper left, soil and one glowing spore across the bottom third, the top two thirds deliberately dark and low-detail so 14px cream body copy stays legible under a .30 scrim. | Replaces the flat black How screen. panel_wash.jpg is too evenly lit to read through any scrim, which is why the current 3.3MB asset folder produces a blank page. |
| `assets/ui/how_icons_88x88.png` | 880x88 transparent PNG, ten 88x88 cells in a row: goal ring, pointing hand, sprout, pulse heart, flame, bloom, prism shard, stone, moss frond, film clapper. Sage and gold on transparent, warm rim light, readable at 34px. | Replaces the ten emoji bullets in .helprow .hi so the How screen reads as a painted page rather than a chat message. |
| `assets/ui/panel_rim_540x28.png` | 540x28 transparent PNG, a soft painted gold-to-nothing rim with a slight ink deckle. | The text panel currently meets the backdrop on a hard 1px edge; this gives the two surfaces a transition. |

**CSS to do:**
- #s-how (line 47): change the scrim from linear-gradient(rgba(11,15,11,.55),rgba(6,8,10,.86)) to (rgba(11,15,11,.30),rgba(6,8,10,.62)) so panel_wash.jpg is actually visible.
- .helprow .hi (line 121): replace the emoji text node with an <img> at 34x34 and add filter:drop-shadow(0 1px 2px #000).
- #s-how .btn (the Back button): add margin-bottom:64px — the injected #sws-music-pill is position:fixed;left:12px;bottom:12px;height:48px and currently lands on its bottom-left corner.
- The first-run IIFE at line 1131: hold s-title for about 1200ms before show('s-how') so the boot frame is title art, not a wall of text.

**Emoji as art:** Heavy. Ten emoji bullets carry the whole How screen (lines 238-247), and the material ICONS map at line 942 uses emoji for every element in the dock (hourglass, droplet, brown square, chestnut, rock, oil drum, flame, blue diamond, snowflake, sparkle, herb, volcano, black circle, snowflake, mushroom) while assets/ui/icon_silt\|water\|fire\|seed\|soil\|stone\|oil.png are painted and never referenced. Only assets/ui/icon_home.png is wired, at line 168.

**Readability:** 14px cream on near-black is fine and the gold bolded terms read well. Buttons are min-height:72px, over the 48px rule. The bullets column is 34px wide with 22px glyphs but is not tappable so that is not a target fault. The real readability hit is the music pill covering the title.

**Music chip:** Yes, twice. In all three frames the Music chip covers the screen title so How Silt works renders as …works, and it dims the first bullet's The goal opener. On the play frame the New song pill overlaps the bottom-left corner of the Back button.

**Looks broken** (confirmed on a second look, severity ugly)**:** The Music chip fully hides the screen title text How Silt in all three shots, and the New song pill overlaps the Back button's tap area at bottom-left. Separately, assets/backdrops/panel_wash.jpg is requested and then rendered invisible by its own scrim, so the frame is a blank black rectangle. No 404s; capture.badRequests is empty.

### Burrow Bowl
`burrow-bowl` · satellite · action · first committed 2026-08-07 · **workbench-gated** · impact 4/5 · effort M
`satellites/burrow-bowl/index.html`

**Now:** Title screen: a near-black navy field with faint star specks, a large warm-gold title, a hard-edged white moon blob top-right, and a gold-framed lane preview showing concentric gold ellipses (20/30/50/40/20), two black burrow mouths rimmed in gold marked 100, and a thin tray bar marked 10/10. Play shot is not the lane at all - it is a full screen of How to Play body text with emoji bullets, a gold slab button and a ghost button.

**Wrong with it:**
- The lane is nothing but stroked gold ellipses on flat navy - no felt, no timber rail, no packed earth, no burrow interior. The two 100 mouths read as holes punched in paper, not burrows, which is the whole premise of the game's name.
- The ring value labels sit ON the strokes: "40" straddles the second ring line, the right-hand "20" is bisected by the outer ring, and "10  10" float alone in an empty tray bar. Numbers fighting the geometry they label.
- The top third of the lane is dead empty navy with a random scatter of tiny dots that sit in no group and serve no purpose - the sloppy pattern exactly. Separately, the moon top-right on the title screen is a hard white blob with no halo, cloud or atmosphere around it, and the lane frame meets the starfield with a hard gold edge and no transition.

**Background now:** CSS radial-gradient(120% 80% at 50% 0%, #0d1420, #05070a 65%, #000) behind a canvas that fills linear-gradient(180deg, #0b1018, #05070a 55%, #04060a). Zero image assets - grep for new Image / drawImage / .png finds only the og: meta tag pointing at thumb.png. Three tiny inline SVGs for icons. Everything on screen is a canvas stroke or a CSS gradient.

**Background wanted:** bg-burrow-lane-540x960.jpg - a moonlit clearing floor in perspective: packed earth and short cropped grass running away from the player, two real burrow mouths with rimmed soil and dark throats, a low warm lantern off to one side, a hedge line closing the horizon so it is not empty. Dark enough that gold rings sit legibly on top.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-burrow-lane-540x960.jpg` | 540x960 full-bleed, moonlit clearing in perspective, packed earth + cropped grass, hedge line closing the horizon at the top third, warm lantern spill from the left, everything under 18% luminance | replaces the flat navy canvas fill; fixes the dead empty top third and gives the rings a surface to be painted on instead of floating in colour |
| `burrow-mouth-160x110.png` | 160x110 transparent PNG, a real burrow entrance: rimmed loose soil, grass tufts on the upper lip, a dark throat with a hint of depth, warm rim light from the left | replaces the black ellipse with a gold stroke that currently stands in for the two 100 burrows - the game's two highest-value targets have no art |
| `ring-plate-420x300.png` | 420x300 transparent, the five concentric scoring rings painted as worn brass inlay set into earth, with the value numerals engraved into clear gaps in each band | replaces the stroked ellipses and fixes the labels-on-strokes collision by baking the numbers into gaps in the rings |
| `dewball-48x48.png` | 48x48 transparent, a glowing dew sphere with a bright specular and a soft blue-green inner glow, plus dewball-trail-32x32.png | the ball the player flicks nine times a round is currently a plain filled circle |

**CSS to do:**
- .rule-note, .helprow, .title-sub - font-size is 11px and 12px; raise to 13px minimum (0.7rem = 11.2px floor).
- .screen#scr-how (the How to play wall) - it is six paragraphs of body copy with mixed-weight emoji bullets (✦ ● ◎ ⚖ ↻ ★) and it is the FIRST thing a player sees after tapping Roll a round. Cut to three lines over a small painted lane diagram, or move it behind the "?" button and let Take the lane be the default.
- .btn.primary - the gold slab (linear-gradient(#e8c063,#c08f34)) is fine on the current flat ground but becomes a filled slab over painted art once a background lands; plan an outlined or plated variant.
- the emoji bullets in .helprow - replace the mixed ✦ ● ◎ ⚖ ↻ ★ glyph set with one consistent 20x20 gold sprite per rule; they currently render at six different visual weights in one column.

**Emoji as art:** Light - 2 distinct emoji, mainly 🐞 as the feedback button. But the How to play wall leans on a mixed set of dingbat glyphs (✦ ● ◎ ⚖ ↻ ★) as rule bullets, which render at inconsistent weight and read as placeholder.

**Readability:** The lane numbers are white on gold strokes and are hard to separate from the rings they sit on. Body copy on the How to play screen is 13-14px and fine, but .rule-note at 11px and the .title-sub at 12px are at or under the floor. Buttons are 48px+ and fine.

### Tempo Grove
`tempo-grove` · satellite · action · first committed 2026-07-10 · impact 4/5 · effort M
`satellites/tempo-grove/index.html`

**Now:** On-brand midnight palette done entirely in flat canvas rectangles: a near-black radial-gradient ground, a sage-outlined rounded board frame in the TOP HALF of the screen holding a hairline grid, and 30px tiles that are flat gold or indigo squares carrying a small dot or a hollow diamond. A gold sweepline band is the one thing with any glow. Below the board sits a solid black void about 170px tall containing nothing but a floating ladybug button, and then the button dock.

**Wrong with it:**
- A quarter of the screen is empty. The canvas is 540x784 but the board is drawn in its upper portion, so from the board frame down to the dock there is roughly 170px of pure #0b0f0b holding one thing: the fleet feedback ladybug fab, floating unanchored at the bottom right of a black rectangle. Nothing is composed down there.
- The injected '♫ Music' chip covers game UI. It sits bottom-left on top of the dock's bottom row and hides the '0 SQ ·' half of the petals cell; the crop of the 2x shot shows '0 SQ' ghosting out from behind the chip's right edge. It also makes three music controls on one screen: this chip, the game's own ♫ button top-right, and the '♫ THE WAITI…' track cell bottom-right.
- Canvas HUD text is far under the floor. Lines 663 and 675 set ctx.font="11px sans-serif" on a 540x960 stage that scales by min(375/540, 667/960) = 0.694 on a phone, so 'NEXT' and '0 SQUARES · SWEEP 1' render at about 7.6 real px. The DOM dock got this right (a comment at line 78 explicitly reasons about the 0.72 scale for the 72px chips) but the canvas text never did.

**Background now:** radial-gradient(120% 80% at 50% 0%, #101610 0%, #05070a 70%, #000 100%) on #wrap, then the canvas repaints its own field with ctx.fillStyle="#0b0f0b"; ctx.fillRect(0,0,W,H) and the board interior with a flat "#0a0d09". Zero image assets: the only file in the folder besides index.html is og/card.jpg, the social card.

**Background wanted:** A painted night grove behind and below the board: near-black canopy across the top, a soft sage mist band behind the playfield, and a low garden bed of leaves and pale blossoms filling the 170px of dead canvas between the board and the dock. That dead band is where the garden border and the petals fiction already live in the copy, so paint the thing the game keeps talking about.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-grove-540x784.jpg` | 540x784 full-bleed, painted night grove: near-black canopy top third, soft sage mist band mid, a low bed of leaves and pale blossoms across the bottom 200px, warm gold fireflies, everything dark enough to sit behind a bright board | Replaces the radial-gradient plus the flat #0b0f0b fillRect, and fills the ~170px of empty black between the board frame and the dock that currently holds only a floating ladybug fab |
| `tile-sun-60x60.png` | 60x60 transparent PNG (2x of the 30px CELL), painted warm gold seed pod with a lit dome, a soft cast shadow at the lower right and a cream rim on the upper left | Replaces drawCellPx's flat fillRect plus an 11px ctx.arc dot, which is the entire art of the Sun piece |
| `tile-moon-60x60.png` | 60x60 transparent PNG, painted indigo hollow bud with a cool rim highlight and an open centre so it reads as the inverse of the Sun tile at a glance | Replaces the flat indigo rect with a stroked diamond outline; Sun and Moon currently differ only by one small glyph and share a silhouette |
| `sweepline-glow-120x784.png` | 120x784 transparent PNG, a painted vertical light shaft: hot cream core, warm gold bloom, wide soft falloff to nothing at both edges, meant to be drawn with globalCompositeOperation lighter | Replaces the ctx.fillRect trail plus two stroked lines at 646-655; the sweepline is the best moment in the game and is currently a plain gold bar |
| `petal-16x16.png (4 colour variants: rose, cream, gold, sage)` | 16x16 transparent PNGs, single painted petals with a soft edge and a faint inner vein, four hue variants for the garden border | Replaces ctx.arc(pos.x,pos.y,1.6,...) at line 623: the border petals are 1.6px radius dots that scale to about 1.1 real px and are effectively invisible on a phone |
| `next-tray-300x160.png` | 300x160 transparent PNG, a shallow painted wood-and-leaf tray with a warm inner shadow, sized to sit under the three NEXT preview pieces | The NEXT pieces are the only elements on screen with no frame; they float on bare black next to a fully framed board |

**CSS to do:**
- Canvas HUD text at index.html:663 and :675 uses ctx.font="11px sans-serif" on a 540-wide stage scaled 0.694 on a 375px phone, so it renders at ~7.6 real px. Raise to "bold 15px" minimum and name the same stack the DOM uses instead of bare sans-serif, which is currently the only typeface on the playfield.
- #dock bottom row: the injected '♫ Music' chip covers the left half of the petals .chip and hides the '0 SQ ·' stat. Reserve that corner by giving the bottom .chip row padding-left:120px, or move the squares stat up into the row above.
- The petals/track .chip labels truncate mid-word ('THE WAITI…'). Set white-space:normal; line-height:1.15; display:-webkit-box; -webkit-line-clamp:2 on .chip so the track title reads.
- Board placement: FX0/FY0 put the board in the top portion of the 540x784 canvas, leaving ~170 unused px of #0b0f0b above the 176px #dock. Centre the board vertically inside the canvas, or shrink canvas#game (line 42) from 784px to the board's real extent and let the painted background own the rest.
- #hud top row (line 43): the score sits hard against #pulsebar on one side and the ♫ button on the other with no gutter. Add gap:12px to the row and give #pulsebar a max-width so the score has room.
- :root at line 32 already declares --bg:#0d100c, --sage:#7ab356, --gold:#c8a84b, --cream:#e8dcc8, but the canvas draws hardcode "#8a9178", "#e8dcc8", "#ffe9a8", "#0a0d09" and "#0b0f0b". Read the tokens through getComputedStyle once at boot so a palette change reaches the playfield.

**Emoji as art:** 🌿 leaf in the dock petals cell (index.html lines 169, 182, 394, 723) and 🌸 blossom for the Bloom Squares reward (lines 212, 487, 745), plus 24 distinct emoji across the how-to wall. The 🐞 ladybug in the void is injected furniture, the fleet feedback fab from /feedback.js, not the game's art.

**Readability:** Canvas HUD 'NEXT' and '0 SQUARES · SWEEP 1' render at ~7.6 real px after the 0.694 stage scale, well under the 0.7rem floor, and they are #8a9178 muted grey on near-black. The '♫ THE WAITI…' cell truncates mid-word. Touch targets are fine: .chip min-height:72px stage px scales to ~50 real px, above the 48px minimum, and the source comment at line 78 shows that was deliberate.

**Music chip:** YES. The injected '♫ Music' chip parks bottom-left and overlaps the dock's bottom row, covering the left portion of the petals cell and hiding the '0 SQ ·' stat, which is visible ghosting out from behind the chip's right edge in the 2x crop. The source comment at line 95 already anticipates this band being contested by the feedback fab, but the music chip was not accounted for.

### Litter Bug
`litter-bug` · satellite · action · first committed 2026-08-18 · **workbench-gated** · impact 4/5 · effort M
`satellites/litter-bug/index.html`

**Now:** Boot is a 916-character instructions wall: gold "How to play" head, sage section labels, cream body copy and green bullet dots on flat near-black, with one green GOT IT slab at the bottom. The play and later frames are the same near-void: a single grey "Back" pill floating in the top third with roughly 500px of empty black beneath it and a green-bordered panel clipped off the top edge.

**Wrong with it:**
- The dumpster screen (2play and 3later, identical) is a void. The DOM carries "THE DUMPSTER / NO STREAK / You need a bug of your own before anybody will let you in" but none of it is visible in the frame - only the Back pill lands on screen.
- A green-bordered rounded panel (.champbar, border #2f4a38) is cut by the top edge of the viewport; just the bottom 8px of its arc shows at y=0, so the screen opens on a sliced-off shape.
- The painted backdrop is invisible by construction: #bg-far is an inline alley SVG at opacity .62 blurred 34px, sitting under #bg-scrim which runs 86% to 98.5% opaque. The file's own comment says "if you can read the backdrop, it is too loud" - the result is that both frames read as system text on flat black.
- The game owns 24 real painted PNGs (assets/heads, assets/bodies, assets/patterns, 8 each) and not one of them appears on either captured frame.

**Background now:** Flat radial near-black on #wrap (#161d26 to #080a0d to #000) over a #0b0d10 540x960 stage. An inline-SVG alley (#bg-far) exists but is blurred 34px at .62 opacity beneath a 86-98.5% opaque scrim, so it contributes nothing visible.

**Background wanted:** bg-alley-540x960.jpg behind every text screen, at a strength you can actually see: brick, dumpster and chain-fence silhouettes, one warm sodium lamp, near-black ground. Turn the existing scrim down so the place is felt instead of erased.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-alley-540x960.jpg` | 540x960 full-bleed painted night alley - brick wall, dumpster and chain-fence silhouettes, one warm sodium lamp glow top-right, near-black ground band so cream copy still reads | replaces the inline SVG that is blurred and scrimmed into invisibility; gives the instructions wall and the dumpster gate somewhere to stand |
| `dumpster-hero-540x360.png` | 540x360 transparent, painted dumpster with the lid ajar, warm light spilling from inside, trash silhouettes at the base | fills the empty dumpster screen so the locked-out state reads as a place with a closed door, not 500px of black under a Back button |
| `bug-locked-220x220.png` | 220x220 transparent, an unlit grey bug silhouette built from the existing part shapes, faint gold question mark inside | an empty-state image for "you need a bug of your own", which is currently pure invisible text |

**CSS to do:**
- #s-dump .pad - the header, #k-day and #k-note never land inside the 667px frame; set the screen to start at the top of the stage and verify #k-note is the first thing visible, since right now only #b-dump-back is on screen.
- #bg-scrim - drop the gradient stops from .86/.94/.985 to about .55/.68/.80 and #bg-far blur from 34px to 14px, so the alley backdrop is actually seen behind the copy.
- #k-note (currently .dim, 15px #8fa0b2) - promote to 18px var(--cream) inside a bordered panel so the locked message is the loudest thing on the dumpster screen.
- .champstrip - when empty it still reserves height:124px of nothing; give it a placeholder row of ghost cards so the gap is not blank.

**Readability:** Boot copy is fine - 15-17px cream on black, sage section labels at ~13px letterspaced. On the dumpster screen the only readable element is the word "Back"; every other string the DOM reports is off-frame. Back pill measures ~52px tall on the 375 phone, above the 48px floor.

**A "looks broken" claim here was refuted on a second look.** The audit frames are accurate but are a capture artefact, not the game. 1boot is a complete, readable How-to-play wall (excluded by the brief). 2play/3later are identical near-empty frames — a row-by-row scan of the 750x1334 shot finds only two content bands, device rows 1-14 (a green-bordered arc sliced at the top edge) and rows 227-333 (the Back pill), and a x10 contrast stretch confirms nothing

### Bramble Court
`bramble-court` · satellite · card · first committed 2026-07-10 · impact 4/5 · effort L
`satellites/bramble-court/index.html`

**Now:** Dark green-black felt vignette with a 5x3 grid of small draft cards; each card is a canvas-drawn creature (ellipses and arcs in one flat body colour plus an accent) over a per-card vertical gradient, ringed by a sage or rust rarity border. Correct midnight-greenhouse palette and a tidy grid, but the art is geometric blobs and the bottom 45 percent of the phone screen is unbroken near-black.

**Wrong with it:**
- The south edge number overprints the card's own name plate on every card in the draft grid: a white '3' sits on 'Origami Crane', a '5' on 'Caterpillar', a '2' on 'Butterfly'. .cardel .edS is bottom:3px and the canvas name plate is the bottom 24px of the portrait, so they occupy the same strip.
- Card names are illegible: portrait() draws them with font '700 13px system-ui' into a 168px-wide canvas, which is shown at 88 stage px in #draftpool and the whole 540x960 stage is scaled x0.694, landing the text at about 4.7 REAL px on a 375px phone.
- The lower 45 percent of the frame, everything below the 'Back' button from roughly y=420 to y=667, is empty near-black with nothing in it. The playfield is jammed into the top half and the horizon is literally empty.
- The two already-taken cards (#draftpool .cardel.taken, opacity .25) go so dark they read as holes punched in the grid rather than as spent picks; the top-left one looks like a rendering failure.

**Background now:** No image at all (bgImageDecls 0). #stage is radial-gradient(130% 90% at 50% 8%, #14200f 0%, #0b0f0b 62%, #070907 100%), a green-black felt vignette, with felt-rose (#241018) and felt-gild (#221c0c) alternates.

**Background wanted:** A painted card-table plate. bg-table-540x960.jpg: dark moss felt with a visible woven weave, a warm gold lamp pool falling from top-centre so cards sit in light, bramble and thorn creeping in from the four corners as vignette, and a strip of dark wood table lip along the bottom 200px to give the dead lower third something to be. Keeps the three felt tints as a colour-dodge overlay so felt-rose and felt-gild still work.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `cards/portraits-sheet-1680x2100.png` | 10x10 atlas of 168x210 cells (50 used), transparent background, one painted creature per cell: soft painterly, warm rim light from top-left, big readable silhouette at 88px. Roster is 50 entries across 12 archetypes (bug, wingb, bird, beast, frog, fish, jelly, shell, crawl, eye, ori, myst). | Replaces portrait(), which the source itself labels 'procedural canvas art per card (placeholder skin; the art pack re-skins these later)'. Every creature is currently two ellipses and a dot for an eye. |
| `cards/frame-sage-168x210.png and cards/frame-rust-168x210.png` | Transparent PNG card frames, 8px painted border, sage-green rounded frame with a leaf at the top notch and a rust angular frame with a thorn, plus a solid name plate band across the bottom 30px. | Replaces the CSS 2px solid borders on .cardel.own1/.own2 and gives the name a painted plate that the edge numbers can sit beside instead of on top of. |
| `bg-table-540x960.jpg` | Full-bleed 540x960 painted felt table, moss weave, top-centre lamp pool, bramble corners, wood lip along the bottom 200px. | Replaces the flat radial gradient and fills the empty bottom half of the draft and duel screens. |
| `soil/fertile-148x152.png and soil/thorn-148x152.png` | Transparent board-cell tiles matching .bcell, 148x152: fertile is turned dark loam with sage shoots, thorn is cracked ground with rust brambles. Soft edges so they blend into the felt. | Replaces .bcell.fert and .bcell.thorn, which are currently a dashed border plus a radial gradient, and makes the soil rule visible before you place. |

**CSS to do:**
- .cardel .edS — move off the name plate. Change bottom:3px to bottom:20px, or drop the canvas name plate and put the name in HTML below the portrait, so the number and the creature's name stop occupying the same 15px strip.
- .cardel .ed — font-size:15px is 10.4 real px after the x0.694 stage scale. Raise to 19px and keep the two-layer text-shadow so the numbers stay readable on light card art.
- #draftpool .cardel — 88x114 is too small to carry a name. Raise to 104x134 and let #draftpool wrap to 4 per row; the screen has 300 unused px of height to spend.
- #draftpool .cardel.taken — opacity:.25 makes taken cards look like holes. Use filter:grayscale(1) brightness(.55) with opacity:.6 and keep a visible border so they read as spent, not missing.
- #draftpool — add margin-bottom and let the pool grow; then pull #draftmine and the Back button down so the layout reaches the bottom of the 960px stage instead of stopping at y=420.

**Emoji as art:** Soil emblems and ownership marks in the card corners (.emb, the small green and gold marks reading as unicode dingbats), the rival icons on the journey list (moon and card glyphs), and the toast icons. The creature art itself is not emoji but canvas primitives, which is the same problem one level up.

**Readability:** Card names land at about 4.7 real px, far under the 0.7rem floor, and are struck through by the edge number. Edge numbers at 15px stage are 10.4 real px, thin for a value the whole game turns on. #rulechips at .7rem stage is 6.5 real px. Touch targets are handled well: the source documents the 72-stage-px rule and .filters button and #duelhead .dh-b honour it.

**Looks broken** (confirmed on a second look, severity ugly)**:** Overlapping UI, visible in bramble-court-2play.png: the .edS edge number prints on top of the canvas name plate on all 15 draft cards. Plus unreadable text: card names render at roughly 4.7 real px (13px canvas font in a 168px portrait shown at 88 stage px on a x0.694 stage).

### Garden Estates
`garden-estates` · satellite · board · first committed 2026-07-18 · impact 4/5 · effort M
`satellites/garden-estates/index.html`

**Now:** Near-black screen with a canvas-drawn Monopoly ring of 28 dark-olive rounded tiles, each carrying a thin saturated colour strip and 8-10px system-ui text; the middle of the board is a large empty black square holding only two white dice and three lines of grey status text. Below sit two flat player cards and a solid lime green 'End Turn' slab.

**Wrong with it:**
- The centre of the board is a bare black void roughly 200x160 CSS px with nothing in it but two dice and three lines of grey text; no crest, no plaque, no deck art where every board game puts its identity.
- Tile text is drawn at 8-10px on a 540-wide canvas that scales x0.694 to a 375 phone, so 'BAS $60' and 'FERTILIZER -$75' land at roughly 5.5-7 real px, well under the 0.7rem floor and unreadable.
- The property strips are a saturated Monopoly rainbow (herb #b98a3e, flower #5b9bd5, berry #d16ba5, orchard #e08a3c, vine #c0432f) that fights the sage title and the midnight ground; boot screen and board look like two different games.

**Background now:** No image anywhere. The playfield is a canvas linearGradient #10160f to #080c07; the page body behind it is radial-gradient(120% 80% at 50% 0%, #101610, #05070a, #000). bgImageDecls 0, imgTags 0, assetFiles 1 (the og share image).

**Background wanted:** bg-garden-estates-540x960.jpg, a painted overhead greenhouse workbench: worn dark wood, a folded seed catalogue, a watering can and a brass hose bib at the margins, warm lamp pooling from the top left, falling to near-black at the edges so the tile ring reads on top.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-garden-estates-540x960.jpg` | 540x960, painted dark-wood greenhouse workbench under a warm raking lamp, full-bleed, heavily vignetted to near-black at all four edges | replaces the flat vertical canvas gradient; gives the tile ring a physical surface to sit on instead of floating in black |
| `board-centre-crest-300x220.png` | 300x220 transparent, painted enamel plaque reading Garden Estates with a trowel-and-cold-frame emblem, warm gold on deep green, soft edge glow | fills the empty black board centre; dice and the roll line draw on top of it |
| `tile-icons-sheet-256x256.png` | 256x256 transparent, 4x4 grid of 32px painted icons: seed cart, sun lamp, watering can, compost heap, garden bench, gate arch, almanac book, rain cloud | replaces the text glyphs currently drawn as icons in drawCorner and drawCell (the cloud, star, diamond, arrow and smiley) |
| `pawn-set-128x32.png` | 128x32 transparent, four painted 32x32 pawns (snail, ladybug, wren, mole) each with a warm rim light and a soft contact shadow | replaces the flat filled circles drawn for players and for owner markers on each property |
| `house-greenhouse-24x24.png` | 24x24 transparent, a tiny painted cold-frame greenhouse, glass panes catching gold | replaces the 6x6 flat squares stamped in a row for houses in drawCell |

**CSS to do:**
- drawCell(): raise the property code font from '800 10px system-ui' to 14px and the price from '700 10px' to 13px, and the tax/corner/deck labels from '800 8px'/'800 9px' to 12px, so nothing renders under about 9.7 real px at the 0.694 phone scale
- GROUPS colour table (garden-estates/index.html ~line 231): retune off the Monopoly rainbow to the house palette (sage #7ab356, gold #c8a84b, rose #d18aa5, copper #c07a3c, plum #7a5b8c, cream #e8dcc8) so the ring stops fighting the sage title
- #stage background (linear-gradient(180deg,#0e140d,#0b0f0b)): swap for the painted bg-garden-estates jpg at cover, keeping the existing radial as the fallback layer beneath
- drawBoard() board backing (ctx.fillStyle='#0a0f09'): add a 2px rgba(200,168,75,.20) inner stroke plus a soft outer drop shadow so the ring reads as a physical board and not a cut hole
- The 'End Turn' button is a solid lime slab (linear-gradient(180deg,#8ec462,#5f9a3c)); replace with a gold-outlined translucent pill, border 1px #c8a84b88 on background rgba(20,26,15,.72), per the no-filled-button-slabs rule

**Emoji as art:** Text glyphs stand in for every board icon: cloud for the Weather deck, four-point star for Almanac, diamond for tax, double-up arrow for the Gate corner, recycle for Compost, smiley for Bench, right-tab for Go To, trophy in the winner line, plus the shell ladybug feedback button. 14 emoji, 10 distinct.

**Readability:** Board labels fail the size floor: 8-10px canvas text at the 0.694 phone scale renders near 5.5-7 real px ('BAS $60', 'FERTILIZER -$75', the 8px corner and tax sub-labels). Board tiles are about 34 real px on the short edge, under the 48px touch minimum for tapping a property.

**Music chip:** The 'New song' chip at bottom-left covers the left half of the status line under End Turn; only the tail 'a full set to build before ending.' is visible. On the boot frame the injected music unlock sheet buries the 'Play vs 1 Rival' button, leaving just the top of its label showing.

### Sunforge
`ring-stacker` · satellite · puzzle · first committed 2026-07-17 · impact 4/5 · effort M
`satellites/ring-stacker/index.html`

**Now:** A flat near-black navy page (radial #141828 to #000) with a small ghost 'Back to the arcade' pill at the top, the word SUNFORGE in a teal-to-gold-to-rose gradient in the vertical middle, four lines of instruction paragraph under it, then nothing at all for about 140px, then a gold Journey button and two rows of dark buttons crowded at the very bottom. No art, no board visible - both -2play and -3later are the same title screen.

**Wrong with it:**
- The composition is a hole. The title block sits at 28-50% of the screen, the button stack starts at 70%, and the 140px between them is bare flat navy with nothing in it - no emblem, no board preview, no glow. The top 25% above the title is equally empty.
- The injected furniture eats the bottom row: the gold-bordered '. Music' chip is sitting on the middle button of the three-button row (it visually replaces it), and the 'New song' chip covers the left 'How to play' button plus the left half of the version footer, which reads 'rge v4.0' instead of 'Sunforge v4.0'.
- .btn.ghost is #12141c on a #0e1018 ground - a 1.1:1 difference. 'Daily Gyre' and 'Zen' read as holes cut in the page rather than as buttons; only the gold Journey button looks pressable, so the mode row has no visual hierarchy, it has one button and two absences.

**Background now:** Pure CSS. html,body radial-gradient(120% 80% at 50% 0%, #141828, #090a12 70%, #000); #stage background var(--bg) #0e1018 with a 60px black drop shadow; .screen linear-gradient(180deg,#131624,#0c0e16). bgImageDecls 0, imgTags 0. The only files on disk are icons/icon-192.png, icons/icon-512.png (PWA icons) and og/card.jpg.

**Background wanted:** bg-gyre-540x960.jpg - a painted night sky for the forge: deep near-black at the top thinning into a warm gold horizon glow at the bottom, a slow scatter of stars, and the suggestion of a molten ring low in frame. It would fill the two empty bands (top quarter and the 140px mid-gap) that make the menu read unfinished.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `sunforge-core-256x256.png` | 256x256 transparent, a molten gold core with a corona and heat shimmer, premultiplied soft edge so it can be drawn additively | replaces the flat ctx.createRadialGradient halo at index.html:745 that is currently the entire visual identity of the golden core the whole game is about |
| `forge-pieces-512x512.png` | 512x512 transparent, 16 cells of 64x64: forged segments in brass, iron and obsidian, each with a warm rim light on one edge and a cool one on the other so rotation reads | the falling pieces are flat filled rectangles; painted segments would make a landed tower look welded instead of stacked |
| `sunforge-wordmark-420x120.png` | 420x120 transparent, painted SUNFORGE lettering: hammered gold with a teal-to-rose heat gradient running through it and a faint ember glow | replaces the CSS background-clip:text gradient at index.html:50, which is the only decorative element on the whole title screen |
| `bg-gyre-540x960.jpg` | 540x960 full-bleed as in background_want, deep #0e1018 ground | fills the empty top quarter and the 140px dead band in the middle of the menu |

**CSS to do:**
- Canvas HUD fonts at index.html:637, 646 and 786 are 9px and 11px system-ui on a 540x960 virtual stage that scales to 0.694 at 375px wide - NEXT and HOLD render at 6.2 real px and the hint line at 7.6px, far under the 0.7rem floor. Take them to 15px and 17px virtual.
- .btn.ghost (index.html:62) - background #12141c on --bg #0e1018 is invisible. Lift to #1a1f2e and keep the 1px var(--line) border so Daily Gyre and Zen read as buttons.
- .screen / .screen-inner on #s-title - set justify-content:space-between with a max-width:420px column so the title block, the instruction paragraph and the button stack share the height instead of leaving 140px of flat navy in the middle.
- The bottom button row needs margin-bottom:60px so the injected music chip (which lands bottom-centre and bottom-left) never sits on the middle button or on the version footer.

**Emoji as art:** Light - 8 distinct, and only in chrome: the gear glyph on the settings button, the back chevron, and the mode-row icons. The board is drawn geometry. The problem here is not emoji standing in for art, it is that nothing stands in for art at all: the whole screen is system-ui type, CSS gradients and rounded rectangles.

**Readability:** The canvas HUD is the fault: 9px and 11px on a stage that scales 0.694 means 6.2px and 7.6px on a phone. Menu buttons are large and comfortably over 48px. The instruction paragraph is legible cream on navy with teal and gold keyword highlights, which is the one nice typographic touch on the screen.

**Music chip:** Yes, and it is the worst in this batch. The '. Music' chip lands centred at the bottom and occupies the middle slot of the three-button row so that row now reads How / Music / gear. The 'New song' chip covers the left button and clips the footer to 'rge v4.0 . level 1 . rings ever 0'.

### Merge & Blast
`merge-blast` · satellite · math · first committed 2026-07-17 · impact 4/5 · effort M
`satellites/merge-blast/index.html`

**Now:** All three frames are the same title screen, so the playfield was never captured despite capture.reached saying "canvas" (taps list is empty; the only change between frames is a gold focus ring on the Music button). What is on screen: a flat blue-black panel, empty for its whole top half, with a CSS-gradient wordmark MERGE & BLAST in sky blue to butter yellow to rose floating at 30% height, a paragraph of grey body text, then a gold slab button and four dark rounded slabs. Source confirms the playfield is the same treatment: flat rounded rects filled from a ten-colour rainbow (COLORS at line 245: #5b9bd5 blue, #7ec98a green, #e0a843 orange, #d8607a pink, #9a6fc4 purple...) with black system-ui numerals, on the same gradient. Zero art files - assetFiles 3 is the favicon and the og image, and there is no new Image() or drawImage anywhere in the file.

**Wrong with it:**
- The #b-music label overflows its own button: #b-music is pinned to flex:0 0 72px (line 92) but music-player.js line 306 rewrites any short music button to '♫ Music', so the word Music runs past the button's right border and touches the ⚙ button beside it. Visible in the boot frame and glowing gold in the play frame.
- The top 55% of the frame is empty near-black with no horizon, no vignette, no art - the wordmark is a sticker floating in void, and the whole composition is four grey slabs stacked at the bottom.
- The wordmark gradient (#7ec3f2 sky blue → #ffd76a → #f08fac rose, line 50) and the --bg:#101018 blue-purple ground belong to a different game than the arcade's midnight greenhouse; nothing else in the frame picks the gradient up, and the sage/gold/cream house palette appears nowhere.
- 🚀 📅 🍃 ⚙ are doing all of the icon work on the four mode buttons, and the buildstamp under them is 12.5 stage px which renders at 8.7 real px on a 375 phone.

**Background now:** Flat CSS only. body is a radial-gradient(120% 80% at 50% 0%, #16162a, #0a0a12, #000); the menu screen is a linear-gradient(180deg,#14141f,#0d0d14); #s-play is transparent over #stage's flat --bg:#101018. No bgImageDecls at all.

**Background wanted:** A painted 540x960 full-bleed backdrop of a night potting bench seen from above - dark stained wood, a lantern glow up in one corner, seed packets and a trowel at the edges - with the centre deliberately kept dark and low-contrast so the number tiles stay legible on top of it. This is the single change that would move the game from plain to decent.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-merge-540x960.jpg` | 540x960 full-bleed JPG, night potting-bench overhead: near-black stained wood, warm gold lantern falloff from the top-left, sage foliage creeping the outer 15%, centre 400x600 kept under 12% luminance so tiles read | replaces the flat linear-gradient(180deg,#14141f,#0d0d14) that is the entire background of every screen, and fills the empty top half of the title frame |
| `tile-plate-120x120.png` | 120x120 transparent PNG, one painted enamel/clay tile plate with a warm rim light top-left and a soft drop shadow, painted in neutral cream so code can tint it per value | replaces the rr()+flat fill+16% white wash rounded rect drawn at line 464-467, so the ten rainbow values become one painted object in ten glazes instead of ten flat swatches |
| `wordmark-merge-blast-460x120.png` | 460x120 transparent PNG, painted wordmark in cream and warm gold with a sage sprout through the ampersand, soft outer glow baked in | replaces the CSS background-clip:text gradient at line 50 whose blue/yellow/rose is off the house palette and reads as clip art |

**CSS to do:**
- #b-music (line 92): change flex:0 0 72px to flex:0 0 116px (or min-width:116px; padding:0 12px) so the '♫ Music' label music-player.js writes into it stops overflowing into #b-set.
- .screen (line 43): add url('assets/bg-merge-540x960.jpg') center/cover under the existing linear-gradient, the way nova-bloom's #s-title layers bg_title.jpg under its radial tint.
- .foot (line 86): font-size 12.5px -> 18px. At the 540x960 stage's 0.694 scale on a 375 phone that is 8.7 rendered px, well under the 0.7rem floor.
- h1.logo gradient (line 50): swap linear-gradient(120deg,#7ec3f2,#ffd76a 55%,#f08fac) for sage #7ab356 -> gold #c8a84b -> cream #e8dcc8 so the title joins the house palette.
- COLORS (line 245): pull the ten tile fills back toward sage/gold/copper/rose/cream instead of the current full-spectrum rainbow.

**Emoji as art:** 🚀 on the primary Journey button, 📅 on Daily Grid, 🍃 on Zen, ⚙ as the settings button's entire label, plus 💥 ✨ 🔀 🧮 👆 in run copy. All of the game's iconography is emoji.

**Readability:** The buildstamp foot is 12.5 stage px = 8.7 rendered px at 375 wide; the in-canvas hint line 'tap 2+ matching tiles · they merge into the next number' (line 481) is 12 stage px = 8.3 rendered px; the sub line under the score is 13 px = 9 rendered px. All three are under the 0.7rem floor. Tile numerals are black at 55% opacity on mid-saturation fills, which is thin on the pale #e4e6ef and #7ec98a tiles.

**Music chip:** The floating injected chip did not land on anything here, but the game's own music button is the casualty: music-player.js relabels #b-music to '♫ Music' and the 72px button cannot hold it, so the label spills over the border into the ⚙ button.

### Root Groups
`root-groups` · satellite · word · first committed 2026-07-10 · impact 4/5 · effort M
`satellites/root-groups/index.html`

**Now:** Boot is a well-set dark menu: a sage title, a gold-accented explainer paragraph and a sage primary button. Play is sixteen identical dark-green rounded rectangles with cream words in a 4x4 block at the top, then about 300px of flat black, then a bottom bar with Hint, Deselect and a sage Submit.

**Wrong with it:**
- The bottom two thirds of the play frame is flat black. #rg-board is flex:1 with align-content:start (index.html:89), so a 4x4 grid pins itself to the top of a ~590px column and leaves a 300px void between the last tile row at y=285 and the control bar at y=585.
- Sixteen identical silhouettes. Every .cell is the same linear-gradient(180deg,#212c18,#151c10) rounded rect with the same 18px bold cream word; nothing distinguishes one tile from another until a group solves. The only colour anywhere in the frame is four 13px green dots on the Guesses row.
- The injected Music chip lands on the header and covers both the '◄' back button (#rg-back) and the left half of the 'Grove Groups' mode title, so the player cannot read which mode they are in.
- The bottom bar meets the board through a bare 1px border-top (#rg-bot, index.html:99) with no shadow or gap, so the shelf and the void above it read as one continuous black surface with a hairline scratched across it.

**Background now:** Flat, no image at all. bgImageDecls 0 and the single asset file is the og card. Shell is radial-gradient(120% 80% at 50% 0%, #101610 0%, #05070a 70%, #000 100%); the play panel is #0b0f0b with #0e140d bars top and bottom.

**Background wanted:** A painted midnight grove floor. bg-grove-540x960.jpg: dark loam and moss with pale root filaments crossing it, a warm gold pool of light low-centre exactly where the 300px void is, deep vignette to the corners, dark enough that cream tile text still reads at 4.5:1.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-grove-540x960.jpg` | 540x960 full-bleed painted near-black grove floor, moss and pale roots, warm gold light pool low-centre, deep vignette | Replaces the radial gradient and fills the 300px dead band under the board with a composed surface instead of flat black. |
| `tile-plate-176x88.png` | 176x88 transparent PNG, painted mossy bark or river-stone plate with a soft rounded edge and a lit top rim, 9-slice safe margins of 16px | Replaces the flat .cell gradient so sixteen tiles gain a painted surface and a real lit edge. |
| `group-crest-1-64x64.png (plus -2, -3, -4)` | four 64x64 transparent PNGs: a leaf, a root knot, a seed pod and a bloom, painted in the four group tints t1 sage / t2 blue / t3 gold / t4 rose | A solved group currently collapses to a flat coloured bar (.grp.tt1 through .tt4); a crest makes the reward read as art. |
| `root-flourish-540x200.png` | 540x200 transparent PNG, a painted root and vine flourish that fades out at both ends, meant to sit low in the frame behind the control bar | Occupies the lower band so the frame is not half empty even before the background lands. |

**CSS to do:**
- #rg-board (index.html:89) — change align-content:start to align-content:center so the 4x4 grid centres in its column instead of hugging the top and leaving 300px of black.
- #rg-top (index.html:74) — the injected chip lands on the left corner; add padding-left:96px on the game screen, or move #rg-back and the mode label right of centre, so neither is covered.
- .cell (index.html:90) — add background-image:radial-gradient(circle at 30% 20%, #2b3a1e, transparent 62%) over the existing gradient plus box-shadow:inset 0 1px 0 #3a4a26, so the tiles pick up a lit top edge and stop being sixteen identical flat rectangles.
- #rg-bot (index.html:99) — add box-shadow:0 -14px 26px rgba(0,0,0,.7) and 12px of top margin so the control shelf separates from the board through a soft transition instead of a hard 1px seam.

**Readability:** Tile text is 18px bold #f4ecda on a dark green gradient and reads fine. 'Guesses · 0 dew' sits at about 12px, at the lower edge of acceptable. Touch targets are compliant: .cell min-height 72px, .cbtn min-height 72px, .tbtn 52px.

**Music chip:** Yes. On the play screen the chip covers the '◄' back button (#rg-back) and the left half of the 'Grove Groups' mode title inside #rg-top; the title is unreadable behind it. On boot the chip sits on empty space and the music-unlock drawer additionally covers the Daily Roots and Zen Sort buttons.

### Twin Lanterns
`twin-lanterns` · satellite · party · first committed 2026-08-07 · **workbench-gated** · impact 4/5 · effort M
`satellites/twin-lanterns/index.html`

**Now:** Flat near-black with a faint blue haze at the top. A bold gold system-font 'Twin Lanterns', a letter-spaced studio line, one dark bordered note panel, then four identical 320x56 rounded pills stacked down the middle - only the gold gradient on 'Tonight's path' separates the primary action from 'All Sky Wolf games'. The bottom 130px is empty. The second frame is the How to play wall: five raw emoji in a left gutter beside five paragraphs of text.

**Wrong with it:**
- -2play: the five gutter icons do not belong to one another. A red 3D lantern emoji, a hairline typographic star, a white cartoon speech puff, a green conifer and an orange flame - four different rendering styles in one 26px column, and the conifer reads as a Christmas tree in a game about a night garden.
- -1boot: four buttons of the same size, radius, border and fill stacked with 7px gaps, and the fourth one is 'All Sky Wolf games' - the way out of the game has the same visual weight as how to play it. Nothing on the screen is illustrated; the only drawn object in the whole 25KB file is the inline SVG lantern on .cell.lantern, and it never appears on the menu.
- -1boot: the title is system-ui bold at 34px - the same typeface as the body copy, just bigger and gold. In a fleet whose house style is a storybook display serif, this reads as a settings header.
- -1boot: the bottom third of the screen is empty flat black between the last button and the footer, with no horizon, no garden, no light - the game is called Twin Lanterns and there is not one lantern on its title screen.

**Background now:** One CSS gradient and nothing else: radial-gradient(120% 90% at 50% 0%, #0b1322 0%, #05070a 62%). The single background-image declaration in the file is the inline SVG lantern glyph on .cell.lantern, not a backdrop. 0 asset files, 0 image tags, no custom font.

**Background wanted:** A painted night garden, 750x1334 full-bleed: deep near-black ground, sage foliage silhouettes down both sides, a stone path of pale glowing stones receding to the centre, and two warm lantern glows at the near corners. Held very dark so the 56px grid cells still read on top of it. This is the single change that would carry the whole game - it is the only screen furniture the design needs.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-night-garden-750x1334.jpg` | 750x1334 JPG, full-bleed, painted night garden: near-black ground, sage foliage silhouettes at the edges, pale stone path receding, two warm lantern glows low in frame, values kept under about 20% so UI reads. | Replaces the single radial gradient on body. It is the entire visual identity of the game and it does not exist. |
| `lantern-lit-256.png and lantern-dark-256.png` | Two 256x256 PNGs, transparent, painted brass lantern - one with a warm lit flame and a glow, one cold and unlit. | Replaces the 32px inline SVG on .cell.lantern (which is deliberate and correct but is a 24-viewbox line drawing), and gives the title screen and the pair screen a real object to show. |
| `stone-lit-192.png and stone-dark-192.png` | Two 192x192 PNGs, transparent, painted river stone - one warm-lit with a soft inner glow, one dark and wet. | Replaces .cell.stone, which is currently a #2b2a18 fill with an inset box-shadow and a typographic star pushed in through ::after. |
| `help-icons-5x128.png` | One sheet, 5 cells at 128x128, transparent: lantern, gift stone in a palm, a thought mark, two hands passing a phone, a flame. One painted style, warm rim light. | Replaces the five mismatched emoji in the How to play gutter, including the conifer that currently stands in for 'hand the phone over'. |

**CSS to do:**
- body: add background-image:url(bg-night-garden-750x1334.jpg) with background-size:cover and background-position:center, and keep the existing radial-gradient layered above it as the darkening wash.
- h1: swap font-family off system-ui to the house display serif and drop the 1px letter-spacing - the title currently matches the body text.
- .btn (non-gold): change from filled #0d1420 slabs to 1px var(--gold) outlined ghost buttons with a transparent fill, so the gold 'Tonight's path' is the only solid mass and the painted backdrop shows through the rest.
- .btn for 'All Sky Wolf games': reduce to 44px min-height and muted text so leaving the game stops carrying the same weight as playing it. (Keep the tap area at 48px with padding, not with height.)
- .rowtag: font-size 10px at left:-16px - under the 0.7rem floor and hanging outside the grid where it can clip at 375px. Raise to 12px and move it into the grid gutter.
- .helprow .hi: change from an emoji text cell to a 26x26 background-image cell pointing at help-icons-5x128.png.
- .foot: 11.5px - raise to 12px, it is the only thing on the boot screen holding the bottom edge.

**Emoji as art:** Five emoji in the How to play gutter at 18px carry all the iconography: lantern, four-pointed star, speech/thought puff, evergreen tree and fire. The tree one is the outlier - it stands in for 'hand the phone over' and reads as a Christmas tree. Everywhere else the game correctly avoids emoji (there is an in-code comment saying emoji lanterns render as tofu on some devices, which is why the grid lantern is a hand-drawn SVG) - the help screen was missed.

**Readability:** .rowtag at 10px is under the 0.7rem floor; .foot at 11.5px is borderline. Body copy is 15px on #cfc6b2 over near-black and reads well. Touch targets are good: cells 56px, buttons 56px, name input 48px min-height.

**Music chip:** Yes. In -2play the floating chip sits at the lower left, over the top-left corner of the '< Menu' button panel at the bottom of the How to play wall - it covers the panel's left edge and rounded corner. On the boot frame that corner was empty, which is why the 900ms placement chose it. On the boot screen itself the chip is clear (it sits left of the 'v0.1 couch edition' footer).

### Tinker Loft
`tinker-loft` · satellite · puzzle · first committed 2026-07-11 · impact 4/5 · effort M
`satellites/tinker-loft/index.html`

**Now:** All three frames land on the HOW TO TINKER text wall - capture reports 'canvas' only because a canvas exists in the DOM, taps is empty and the loft was never shown, so this grade covers the help/menu chrome only. What is visible: a near-black brown ground (#171009) with a faint warm vignette at the top, eight paragraphs of cream body text with gold inline bolds, one dark '← Back' pill at 78% height, and about 200px of dead black beneath it.

**Wrong with it:**
- The injected ♫ Music chip sits directly on the page title - at 2x the heading renders as 'OW TO TINKER' with its H hidden behind the chip's black slab. This is the boot screen, not a later one.
- A game about planks, dominoes, fans, balloons, funnels, seesaws and scissors explains all seven parts in words and shows none of them. Nine part names bolded in gold, not one icon, on a screen with 200px of unused black below the button.
- The ground is one flat brown-to-black wash with no lit end - the vignette tops out at #191009, so there is no light source, no floor line and no horizon anywhere in the frame; the '← Back' pill floats with nothing under it but a 0.7rem version stamp at 33% alpha.
- The injected chip and the feedback bubble are hard-edged black slabs with gold hairlines dropped onto the vignette with no shadow or transition, and the ✕ dismiss circle overlaps the 🐞 bubble it belongs to.

**Background now:** No image anywhere in the 79KB file (bgImageDecls 0, imgTags 0, drawImage 0). #wrap is radial-gradient(120% 80% at 50% 0%, #191009 0%, #070503 70%, #000 100%); #stage is a flat #171009 fill with a 60px black outer glow. The playfield is procedural canvas 2D - 16 hand-written part renderers (drawPlank, drawDomino, drawFan, drawBalloon, drawScissors, drawMarble, drawShelf, drawSpike, drawBasket, drawBell, drawBucket, drawSaw, drawString, drawBallSkin, drawPartIcon, drawBG) and 7 canvas gradients - but none of it was captured.

**Background wanted:** bg-loft-540x960.jpg - a painted attic loft interior sized to the game's own 540x960 stage: rafters overhead, a dusty window top-left throwing the warm key light the vignette is currently faking, a workbench edge and floorboards at the bottom, corners falling to near-black so the canvas pieces stay the brightest thing. Same wood/brass/cream palette the CSS vars already declare.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-loft-540x960.jpg` | 540x960 JPG (the exact stage size), painted attic interior, rafters + dusty window top-left, workbench and floorboards low, near-black corners, wood #8a5a2e and brass #c8a84b palette | Replaces the flat #171009 stage fill so both the help wall and the machine behind it sit in a room instead of on a brown void. |
| `parts-sheet-512x512.png` | 512x512 transparent PNG, 4x4 grid of 128px painted part icons (plank, domino, fan, balloon, funnel, seesaw, scissors, marble, spike, basket, bell, bucket, saw, string), warm brass-and-wood rim light, silhouettes matching the canvas renderers | Gives the tray real icons and lets the HOW TO TINKER wall show each part beside the sentence that names it, instead of nine gold bold words. |
| `marble-128x128.png` | 128x128 transparent PNG, painted glass marble with a warm specular highlight, a coloured core and a soft contact shadow | The marble is the protagonist of every level and is currently a canvas arc(); a painted one gives the eye something to follow during a run. |
| `goal-home-256x256.png` | 256x256 transparent PNG, painted brass cup or woven basket 'home' with a warm inner glow, soft ground shadow | Makes the goal readable at a glance instead of another canvas primitive of the same brass colour as everything else. |

**CSS to do:**
- #s-how h1 - add margin-top:56px (or padding-left:100px on the heading row) so the injected ♫ Music chip, which pins itself top-left 900ms after load, stops covering the title's first letter.
- .howp - eight full paragraphs is a wall; move the part list (paragraph 3) into a two-column icon glossary using parts-sheet, and collapse the Daily/Workbench/Zen paragraph behind a 'Modes' disclosure.
- #buildstamp - color:#9a8a7255 at .7rem on near-black is unreadable; raise to var(--muted) at .72rem or drop the stamp from the help screen.
- #wrap background - widen the vignette to radial-gradient(140% 90% at 50% -10%, #241708 0%, #0a0705 62%, #000 100%) so the ground has a lit end and a dark end instead of one flat brown value.
- The '← Back' pill and the screen container - the screen ends at 78% height with 200px of empty black; give #s-how justify-content:center or pull the button up so the composition does not bottom out into void.

**Readability:** #buildstamp at 0.7rem in #9a8a7255 (33% alpha muted on near-black) is effectively invisible. The title's first letter is covered by the music chip. Body copy at 1rem cream on #171009 reads well and the '← Back' pill is comfortably over 48px. #overstats .chip span sits exactly at 0.7rem - the floor, not under it.

**Music chip:** The injected ♫ Music chip covers the 'H' of the 'HOW TO TINKER' heading, confirmed at 2x in tinker-loft-1boot.png - the title reads 'OW TO TINKER'. It sits there on all three frames. This game is one of the /music-unlocks.js includes (index.html:138).

### Think Fast
`micro-meadow` · satellite · action · first committed 2026-07-10 · impact 4/5 · effort M
`satellites/micro-meadow/index.html`

**Now:** Boot is a tidy dark menu: big gold gradient "Think Fast" wordmark, sage SKY WOLF STUDIO kicker, a cream paragraph, one gold primary slab and five dark pills each led by a different vendor emoji. Play is an almost entirely empty dark-green field - green "WATER!" and "Tap the droopy plant" at the top, three near-black hearts, a gold star 0, a thin bar, and in the later frame one 40px canvas sprout (two brown blobs on a green stick) alone in the middle of 500px of nothing.

**Wrong with it:**
- The playfield is empty. In 2play there is literally nothing between the header and the bottom edge; in 3later a single tiny sprout sits dead centre with no ground, no horizon, no meadow. The game is called Micro Meadow and there is no meadow in it.
- The three life hearts top-left are drawn in near-black on a near-black ground and are effectively invisible, and the "Music" chip is parked directly on top of them.
- The menu's six buttons are led by six unrelated vendor emoji (circus tent, calendar, star, leaf, flower, ribbon) at six different colour temperatures and six different silhouettes, so the menu has no icon system at all - and the How and gear slots in the same row have no icon, breaking it further.
- The tap target itself is drawn with ctx.fillRect and ctx.arc - a brown bar and a green stick - so the thing the whole game asks you to look at is the least drawn thing on screen.

**Background now:** A canvas 2-stop vertical linear gradient per theme (roughly #101610 to #05070a) over a radial near-black shell. No image files at all - the single asset in the folder is an og share card.

**Background wanted:** bg-meadow-540x960.jpg drawn once under the canvas: a painted ground-level meadow with a dark loam band across the bottom third, sage grass silhouettes, dew glints and a warm gold horizon wash, so every mini-game has a floor and a horizon instead of a gradient.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-meadow-540x960.jpg` | 540x960 full-bleed painted night meadow - near-black loam bottom third, sage grass blades in silhouette, warm gold horizon glow, soft dew bokeh, centre kept dark for readability | replaces the flat 2-stop canvas gradient; gives the empty playfield a ground plane and a horizon |
| `sprout-droopy-160x160.png + sprout-happy-160x160.png` | 160x160 transparent pair, painted seedling - wilted with a curled leaf, then perked with a water bead and a soft rim light | replaces the fillRect/arc doodle that is the current tap target in the WATER round |
| `icons-modes-96x96.png` | 6-up 96px sheet on transparent (rush, daily, boss, zen, gallery, wardrobe) painted in sage and gold with matching silhouette weights | replaces the six mismatched vendor emoji on the menu so the button column reads as one set |
| `heart-48x48.png` | 48x48 transparent, cream-filled heart with a warm gold rim, plus a hollow empty variant | the current hearts are near-black on near-black and cannot be seen at all |

**CSS to do:**
- The HUD life-hearts row (top-left) - hearts render at roughly #2a2a2a on a #0b0f0b ground; recolour filled to var(--cream) with a 1px var(--gold) rim and empty to var(--line).
- The canvas container - add background-image:url(assets/bg-meadow-540x960.jpg); background-size:cover behind the canvas so the playfield is never blank between spawns.
- .btn on the menu - the emoji lead is inline text of varying width; give it a fixed slot (display:inline-flex;width:28px;justify-content:center) so all six labels start on one baseline.
- HUD top row - reserve padding-left:120px under 420px width so the injected Music chip stops sitting on the hearts.

**Emoji as art:** yes, heavily on the menu: circus tent (Meadow Rush), calendar (Daily Dash), star (Boss Bloom), leaf (Zen Meander), flower (Gallery), ribbon (Wardrobe) and a gear - 15 distinct emoji in 20 uses. In play there is no emoji, but the substitute is worse: raw canvas fillRect/arc shapes in drawLeafKind and drawKeepsake.

**Readability:** Header copy is fine (green ~28px WATER!, cream 15px subline). The three life hearts are near-black on near-black and unreadable. Menu footer "Think Fast v1.0" is ~11px muted. The circle that dismisses the feedback bug, bottom-right, is ~28px - under the 48px floor.

**Music chip:** yes - on the play screen the Music chip sits top-left directly over the life-hearts row, with the hearts drawn along its top edge. On the menu it takes the empty top-left corner and covers nothing.

### HUNCH
`hunch` · satellite · creative · first committed 2026-08-18 · impact 4/5 · effort M
`satellites/hunch/index.html`

**Now:** A dark navy app (#0d0e1a) with electric-lime accents and a real Space Grotesk / Space Mono pairing loaded from Google Fonts. On the play screen a single enormous pure-white rectangle - the drawing canvas - takes over half the phone, above a strip of twelve colour dots, a scrolling tool row and a lime pill Submit button. There is no illustration on any screen.

**Wrong with it:**
- The injected arcade back chip (48x48 at 10,10) sits on the header wordmark at boot and on the prompt label during play: the label reads '...THIS / a smiley face' with the first word buried under the chip.
- The tool row is .toolrow{flex-wrap:nowrap;overflow-x:auto}, so at 375px the Clear button is sliced in half by the right edge and reads 'Cle'. There is no fade or arrow to say it scrolls, so it reads as a rendering fault.
- The drawing canvas is a raw #fff rectangle with no paper tone, no frame, no shadow. The jump from #0d0e1a to #fff is the harshest edge anywhere on the phone and there is no transition of any kind - the white plate just starts.
- Touch targets are all under the floor: colour swatches 28x28, Fill 39x35, Eraser 61x35, Undo 55x35, Clear 54x35, pen-size slider 74x3.

**Background now:** radial-gradient(900px 600px at 80% -10%, #1b1d38, transparent 60%) over flat #0d0e1a (index.html:28). No image files at all: assetFiles is 1 and it is icons/icon.svg.

**Background wanted:** none needed as a full-bleed painting - the game's own ART_ASSETS.md fixes a flat dark navy on purpose and that decision is coherent. What it needs is the theme backdrop it already specced and never received: assets/cosmetics/themes/theme_default_bg.png at 1080x1920, a dark navy field with a faint neon grid and film grain, so the screen is not one flat colour.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/personas/persona_critic_idle@3x.png (plus noir, sunny, gremlin, zen)` | 1024x1024 transparent PNG each, chest-up mascot, consistent framing and eye-line across the set, distinct silhouette and signature colour, glowing with a slight machine undertone | the five AI personas are currently literal emoji in the source (index.html:391-397) - this is the game's whole cast, and its own ART_ASSETS.md ranks it priority 2 |
| `assets/fx/canvas_paper_1024.png` | 1024x1024 tileable off-white paper (#f7f5ef) with a faint tooth and a soft inner shadow at the edges, opaque | replaces the raw #fff drawing rectangle so the canvas meets the navy through a transition instead of the harshest value jump on the screen |
| `assets/currency/coin_hunch@3x.png` | 256x256 transparent PNG, a lime-and-teal coin mark with neon glow, 12% safe margin | replaces the coin emoji in the header and shop rows |
| `assets/cosmetics/themes/theme_default_bg.png` | 1080x1920, dark navy #0d0e1a with a faint lime neon grid falling off toward the bottom and subtle film grain | replaces the single radial gradient that is the entire background |
| `icons/icon.png` | 1024x1024 PNG no alpha, neon-lime pencil tip morphing into a glowing AI eye, centred, full-bleed dark ground | ART_ASSETS.md ranks the store icon priority 1 and only icons/icon.svg exists - the store master was never made |

**CSS to do:**
- .tbtn{padding:8px 12px} at index.html:102: add min-height:48px so Fill/Eraser/Undo/Clear stop measuring 35px tall.
- .toolrow: add padding-right:14px and a mask-image right-edge fade so the last button is never sliced flush by the viewport edge - a half-faded button reads as 'scroll me', a half-cut one reads as broken.
- .col colour swatch: 28x28 to 44x44 with a 6px gap, or wrap the strip to two rows - twelve swatches at 44px do not fit on one 375px line.
- #sws-arcade-exit lands at 10,10 over .topbar: give .topbar padding-left:60px and give the prompt label the same, so neither the wordmark nor 'DRAW THIS' sits under the chip.
- The drawing canvas element: border-radius:14px, box-shadow:0 0 0 1px var(--line), 0 18px 40px #0006, and a #f7f5ef fill instead of pure #fff.
- .tools .sz{font-size:10px} at index.html:105 and the 11px 'Draw this' label: raise both to 12px minimum (0.7rem floor).

**Emoji as art:** The five AI personas ARE emoji - The Critic is a monocle face, Gremlin is a goblin face, and three more (index.html:391-397) - and they are the game's entire cast. Header uses trophy, cart, coin and flame emoji. emojiDistinct is 34, the highest in this batch.

**Readability:** The 'Draw this' label renders at 11px (0.69rem) and the SIZE label at 10px, both under the 0.7rem floor. Touch targets measured under 48px: swatches 28x28, Fill 39x35, Eraser 61x35, Undo 55x35, Clear 54x35, slider 74x3.

**Looks broken** (confirmed on a second look, severity ugly)**:** Clipped and overlapping UI, visible in the -2play frame: the Clear button is cut in half by the right edge and reads 'Cle', and the prompt label reads '...THIS' with its first word hidden under the back chip. Measured at 375x667 in headless Chrome: bClear 54x35 inside .toolrow{flex-wrap:nowrap;overflow-x:auto}, #sws-arcade-exit rect {x:10, y:10, w:48, h:48}.

### Plot Bloom
`plot-bloom` · satellite · puzzle · first committed 2026-07-10 · impact 4/5 · effort M
`satellites/plot-bloom/index.html`

**Now:** Boot is a competent dark menu: a glowing sage title over a near-black radial gradient, a sage primary button and five ghost buttons. Play is a 7x7 grid of #141b0d rounded squares on a #0b0f0b panel, with three emoji hand cards (tulip, chair, tree) on a strip at the bottom and roughly 150px of empty black between the two.

**Wrong with it:**
- The playfield reads as one black rectangle. Empty cells are #141b0d on a #0b0f0b panel (about 1.1:1) so the 7x7 grid only exists because of its 1px #1c2614 borders; at arm's length there is no board.
- The three hand cards put three different drawing styles side by side at 34px: a photoreal Apple tulip, a flat isometric wooden chair and a cartoon broccoli tree. No shared silhouette weight, no shared light direction, three different outline treatments in one 100px strip.
- The middle of the frame is empty. The board's last row ends around y=418 and the hand strip starts at y=595; the only thing in that 175px band is a 12px muted line reading 'Pick a piece first.'
- On the boot menu there is a second dead band, about 130px of flat black between the 'How to play' button and the 'All Sky Wolf games' footer.

**Background now:** No image anywhere (bgImageDecls 0, the only asset file is the og card). Shell is radial-gradient(120% 80% at 50% 0%, #101610 0%, #05070a 70%, #000 100%); the play panel is #0b0f0b with a linear-gradient(180deg,#0e140d,#0b0f0b) header.

**Background wanted:** A painted greenhouse soil bed. bg-plot-540x960.jpg: dark loam inside a low wooden frame, one warm lamp glow entering from top-centre, deep vignette to the corners, so the grid reads as tilled plots rather than empty UI cells.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-plot-540x960.jpg` | 540x960 full-bleed painted dark loam bed inside a wooden bench frame, warm lamp pool top-centre, deep vignette; must stay dark enough for cream text | Replaces the flat radial gradient on #pb-shell. Gives the board a surface and kills both dead black bands. |
| `tile-plot-empty-96x96.png` | 96x96 transparent PNG, painted square of tilled earth with a soft raised rim and a top-left highlight | Replaces the flat #141b0d .cell.empty fill so the 49 cells are visible without relying on a 1px border. |
| `piece-flower-96x96.png (plus piece-tree, piece-pond, piece-hive, piece-bench, piece-veg, piece-hedge at the same size)` | seven 96x96 transparent PNGs, painted top-down garden props, one light direction from top-left, matched silhouette mass so no piece dominates | Replaces the seven emoji in THEMES 'classic' at index.html:259 that currently render at 26px in cells and 34px in hand cards. |

**CSS to do:**
- .cell.empty (index.html:79) — lift the fill from #141b0d to about #1b2412 and add box-shadow:inset 0 1px 0 #2c3a1c so the board separates from the #0b0f0b panel.
- #pb-board (index.html:74) — at 375px wide, padding:0 14px plus gap:5px across 7 columns yields 45px cells, under the 48px floor. Take padding to 0 6px and gap to 3px, or cap the board at 6 columns on narrow phones.
- .pcard .pn (index.html:90) — 11px is under the 0.7rem floor; raise to 12px. Same for .cell .lbadge at 9px (index.html:83), raise to 11px.
- .hand (index.html:86) — drop margin-top:auto and instead centre #pb-board in the free space, or move the score/next strip into the 175px gap so the middle of the frame is not empty.

**Emoji as art:** All seven piece types are emoji: THEMES 'classic' g:['🌷','🌳','💧','🐝','🪑','🥕','🌿'] at index.html:259, drawn at 26px inside .cell and 34px in .pcard .pg. The how-to-play and coach cards also use 🌷🐝💧🪑🌳 as inline illustration.

**Readability:** .cell .lbadge 9px and .pcard .pn 11px are under the 0.7rem floor. Grid cells compute to ~45px at 375px, under the 48px touch floor. Empty-cell fill against panel is roughly 1.1:1 contrast so the board edges are effectively invisible.

**Music chip:** Yes. On the play screen the chip sits top-left directly over the '‹' back button (.hbtn, index.html:156) and hides it completely; only the chip is visible where the back control should be.

### Whack Box
`ext-whack-box` · satellite · party · first committed unknown · **workbench-gated** · impact 4/5 · effort S
`satellites/ext-whack-box/index.html`

**Now:** The party host screen on a phone. Boot is a deep navy-to-black radial ground, a 44px warm-gold 'WHACK BOX' with a soft glow, a spaced grey subtitle, and a stack of near-black rounded cards, each with a 62px rounded square holding one small gold star glyph and gold and cream text. The lobby is the same ground with a huge cream room code, the join address, a 'nobody yet' pill, a filled gold Start slab and a ghost outline button.

**Wrong with it:**
- The join address is clipped hard against both screen edges: it reads '7.0.0.1:8792/party/play.ht', cut off at the start and the end. .ps-joinline is font-size:26px and the URL is an unbreakable <b> string, so at 375px the one piece of information the lobby exists to communicate is unreadable. The 'WHACK BOX' header above it is sliced in half by the top of the viewport and the practice-room note is cut mid-sentence at the bottom.
- The 48px round mute button is fixed at top:14px right:14px with no clearance and lands on the title in both frames: it sits on the X of 'WHACK BOX' on the menu and on the final s of 'Firefly Futures' in the lobby.
- Nine game cards, nine identical silhouettes. The catalogue gives each title a single character mark (star, star, asterisk, snowflake, flower, diamond, half-circle, star, fleuron) in an identical 62px rounded square with an identical radial-gradient wash, so at 375px the first three tiles are three small four-point stars and nothing but the word tells Mothlight from Firefly Futures.
- The Start button is a filled gold slab (linear-gradient(#e8c063,#c08f34) with #241c06 text) on near-black, and disabled it reads as a muddy olive brick with dark brown lettering, the lowest-contrast control on the screen.

**Background now:** One CSS gradient and nothing else: body{background:radial-gradient(120% 90% at 50% 0%, #0b1322 0%, var(--bg) 62%)} in party/shell/shell.css. Cards are linear-gradient(160deg,#101826,#0a0e16). No image files, no canvas, no SVG. (The 886 asset files the scanner counted belong to satellites/ext-whack-box, not to the party/ shell that actually renders.)

**Background wanted:** One painted plate for the host screen: a dark parlour at night, a low warm lamp, a table edge with cards and a glass just in frame, everything within two values of #05070a so the gold type still owns the screen. Same plate can back both the menu and the lobby.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `party/art/bg-parlour-1080x1920.jpg` | 1080x1920 full-bleed, near-black night parlour with one warm lamp pool at the top and a table edge at the bottom, heavy vignette, no text | replaces the single body radial-gradient that is the entire visual identity of both host screens |
| `party/art/tiles/mothlight.png (plus firefly, liftingfog, firstfrost, moongraft, samesoil, widemargin, bearing, understudy)` | nine 128x128 transparent PNGs, one painted object per title (a moth at a lamp, a jar of fireflies, a lantern in fog, a frosted leaf, a grafted branch, two seedlings in one pot, a wide-margin page, a compass, an empty chair in a spotlight), warm rim light on near-black | kills the nine-identical-stars problem; drops straight into the existing 62px .ps-card .g tile |
| `party/art/whackbox-wordmark-900x220.png` | 900x220 transparent, hand-lettered warm gold WHACK BOX with a soft lamp glow, no tagline | the title is currently system-font 44px with a text-shadow, and it is the only thing on the first screen |

**CSS to do:**
- .ps-joinline (party/shell/shell.css:19): font-size:26px is a TV size on a phone. Add a mobile clamp, font-size:clamp(15px,4.4vw,26px), plus word-break:break-all and padding:0 14px, and put the URL on its own line so it stops being clipped at both edges.
- .ps-mute (shell.css:41): it is fixed top:14px right:14px and covers the title. Either move it to the bottom-right or give .ps-title padding-right:64px so the two cannot occupy the same pixels.
- .ps-btn (shell.css:31): drop the filled gold slab. Use background:rgba(200,168,75,.14) with border:1px solid var(--gold) and colour var(--warm), which is the house rule against filled button slabs and also fixes the muddy disabled state.
- .ps-title / #ps-lobby (shell.css:13): the lobby column overflows the viewport top and bottom at 667px tall. Give #ps-lobby padding:20px 0 and allow the screen to scroll, or scale .ps-title to clamp(28px,9vw,44px) and #ps-code to clamp(52px,17vw,88px) so the whole lobby fits one phone screen.

**Emoji as art:** Yes, and it is the whole art budget. Every one of the nine game tiles is a single text glyph from party/catalogue.js (glyph field): U+2726, U+2727, U+274B, U+2744, U+2740, U+2756, U+25D0, U+2727, U+2766. The mute control is a bare U+266A / U+2715 character.

**Readability:** The clipped 26px join URL is the headline problem. The card meta line (.ps-card .mt, 14px with 2.5px letter-spacing, uppercase grey) reads as a smear at 375 wide. The disabled Start label is #241c06 on a dark olive fill, low contrast. Touch targets are fine: .ps-mute is 48x48 and .ps-card is min-height 96px.

**Looks broken** (confirmed on a second look, severity ugly)**:** In both the 2play and 3later frames the join address is cut off at both screen edges, rendering as '7.0.0.1:8792/party/play.ht' with the http://12 missing at the front and the 'ml' missing at the back, so a player cannot type the address they are told to open. Cause is .ps-joinline{font-size:26px} on an unbreakable <b> URL with no wrapping at 375px. The 'WHACK BOX' header is also sliced by the top of the viewport and the note text is cut mid-sentence at the bottom. capture.reached is 'no-control', so these are the host lobby and menu, not the game itself.

### Create A Critter
`create-a-critter` · satellite · creative · first committed 2026-08-15 · impact 4/5 · effort L
`satellites/create-a-critter/index.html`

**Now:** A near-white kids-app page: pale blue fading to cream, a 🪺 nest emoji at 5rem standing in for a logo, a dark-purple title, and two saturated pill slabs (coral, then leaf green) stacked down the middle. The robot reached 'no-more-controls', so the -2play and -3later frames are both the 'How it works' instructions card, not the playfield — a white rounded card with four emoji-and-text rows over a flat lavender-grey scrim.

**Wrong with it:**
- The 🪺 nest emoji IS the logo, at 5rem, dead centre above the title — the game's whole identity is a system font glyph that renders at a different colour temperature and outline weight than every other thing on the page.
- The top 40% of the boot screen is empty pale gradient with nothing in it: no horizon, no meadow, no critter, no vignette. The title floats in dead space and the eye has nowhere to land before the buttons.
- The two primary buttons are flat unlit slabs of saturated coral and saturated leaf green, back to back, on a near-white page — no rim light, no texture, no shared hue, and the green reads as a different app's button than the coral above it.
- On the instructions card the four step icons (✏️ 👁️ ✨ 🍓) share no silhouette at all: a photoreal brown eyeball sits directly under a flat yellow pencil, above a two-tone sparkle and a red strawberry. Four rendering styles in a 200px column.

**Background now:** Flat CSS gradient only. body is var(--paper); the home screen is `background:linear-gradient(180deg,#e8f2ff 0%, #fdf7ee 55%)`. bgImageDecls is 0 and assetFiles is 0 — there is no painted art anywhere in the satellite folder (only index.html and three.min.js).

**Background wanted:** assets/bg-meadow-540x960.jpg — a soft painterly dawn meadow behind the home screen: a low grass horizon at ~65% height, two or three rounded shrub silhouettes, warm rim light from the left, sky graduating from pale blue to cream so the existing gradient becomes the sky rather than the whole screen. The nursery and result screens already swap sky gradients (sky-dawn / sky-dusk / sky-night), so paint three skies and let the existing class swap drive them.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `logo-nest-256x256.png` | 256x256 transparent PNG, soft painterly woven nest with two pale eggs and a sprig of leaf, warm rim light from upper left, big readable silhouette at 120px | replaces the 🪺 emoji that is currently the entire brand mark on the home screen |
| `bg-meadow-540x960.jpg` | 540x960 full-bleed, dawn meadow, grass horizon at ~65% height, two rounded shrubs, warm left rim light, sky pale blue to cream | fills the empty top 40% of the boot screen and gives the title something to sit against |
| `icons-howto-4x-96x96.png` | four 96x96 transparent icons on one sheet — pencil, eye, sparkle, berry — all drawn in one soft-painterly style with the same 3px warm outline and the same light direction | replaces the four mismatched emoji (✏️ 👁️ ✨ 🍓) in the How-it-works card that currently show four different rendering styles |
| `critter-silhouette-320x320.png` | 320x320 transparent, a friendly generic blob-critter in three-quarter view, cream and coral, soft shadow, no face detail | gives the empty home screen a mascot anchor and previews what the drawing turns into |

**CSS to do:**
- #home .egg — replace the emoji text node with a background-image on logo-nest-256x256.png at 120px square; keep the element so layout does not move
- #home — add `background:no-repeat bottom/cover url(assets/bg-meadow-540x960.jpg), linear-gradient(180deg,#e8f2ff 0%,#fdf7ee 55%)` so the painted meadow sits under the existing gradient as a fallback
- .bigbtn and .bigbtn.green — add an inset top highlight (`box-shadow: inset 0 1px 0 rgba(255,255,255,.45), 0 4px 0 rgba(0,0,0,.10)`) and pull the green toward the coral's warmth so the two slabs read as one set
- .howstep .n — set a fixed 44px square with background-image from icons-howto-4x-96x96.png instead of an emoji glyph, so the four steps share a silhouette family
- #home .stack — add `padding-top:0` and let the new meadow background carry the upper third; currently the empty gradient band is unstyled dead space

**Emoji as art:** Heavy. 208 emoji, 80 distinct. 🪺 is the logo AND the Nursery button icon; ✏️ is the Draw button icon; ❓ the How button; the four How-it-works step icons are ✏️ 👁️ ✨ 🍓; 🐾 marks the wild visitor line; 🍓 is the Berry Picnic food; 🔍 is the zoom control. Emoji do essentially all icon and mascot duty in this game.

### Loop Warden
`loop-warden` · satellite · card · first committed 2026-07-11 · impact 4/5 · effort M
`satellites/loop-warden/index.html`

**Now:** A near-black screen with a large circular day-track: a ring of dim brown and grey rounded squares, four faintly tinted quadrants for night, dawn, noon and dusk, and a small centre dial reading DAY 1 NOON with a green HP bar. Below it a status line, a NOON ground bar, four empty placement slots, a gold RETREAT button and a row of three cramped hand cards. The ring is a genuinely composed diagram, but every mark on screen is a canvas arc or a rounded rect and every icon is an emoji.

**Wrong with it:**
- The hand cards overflow their own boxes. .card is width:97px min-height:106px, and the Watchtower card has to hold a symbol, 'Watchtower', 'meadow' and 'noon: sees 2 tiles far' - the body text spills past the card edge and collides with the Graveyard card beside it, whose 'night: raises 2' wraps onto a fourth line that runs out of the box.
- The injected music chip lands bottom-left across the first hand card, covering the Clover Field symbol and most of its name. That card is a playable control, not decoration.
- The ring tiles are invisible. Every slot on the loop is the same dim brown rounded square with no icon and barely any value separation from the background, so the loop reads as an empty bracelet; the only things you can actually see on it are the CAMP label and four quadrant words.
- Two floating grey circles, the speed button and the feedback bug, sit directly on the ring at the four and five o'clock positions, breaking the one composed shape on screen.

**Background now:** No image and no assets folder at all. #stage is radial-gradient(120% 80% at 50% 0%, #10131a 0%, #05070a 70%, #000 100%) and the canvas paints its own ground with ctx.fillRect(0,0,540,680) under a gradient. index.html has zero drawImage calls and zero asset references.

**Background wanted:** A night meadow the loop can float over. bg-loop-540x960.jpg: a low horizon at roughly y=520 with dark rolling meadow, a treeline silhouette, one distant campfire glow, and the sky above graded indigo to near-black so the ring reads as a clock hanging over the land. Keep the four quadrant tints as a multiply overlay so night, dawn, noon and dusk still recolour the world.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `loop-ring-540x540.png` | Transparent PNG of a painted brass and dark-wood clock ring with 16 engraved recessed tile slots around it, quadrant enamel inlays in indigo, rose, gold and copper, and small engraved marks at the four time positions. | Replaces the ctx.roundRect ring of dim brown squares, which is currently the entire visual identity of the game and reads as unpainted placeholder geometry. |
| `tiles/land-sheet-576x288.png` | 8x4 sheet of 72x72 transparent tiles for the land types the deck names: clover field, watchtower, graveyard, camp, meadow, grove, ruin, well. Painted top-down, warm rim light, readable at 40px. | Replaces the unicode dingbats standing in for every land in the hand and on the ring, and gives the ring slots something to hold. |
| `ui/warden-sheet-384x128.png` | Four 96x128 painted portraits for the wardens the wardrobe already defines (Warden, Knight, Ranger, Moth Monk), transparent, chest-up, in house palette. | The wardrobe currently offers those four as the glyphs shield, knight-chess-piece, arrow and crescent. Four painted portraits turn a cosmetic list into a reason to unlock. |
| `ui/palette-swatch-96x96 x3` | Three painted 96x96 swatch chips for the Emberwood, Frostmere and Gloaming loop palettes, each showing that palette's ring and ground in miniature. | Replaces the brown, blue and purple square emoji currently used as the palette icons, which is the most literal case of emoji standing in for art in the batch. |

**CSS to do:**
- .card .cn{font-size:.72rem} and .card .ck/.cq{font-size:.7rem} — these are stage px on a stage scaled x0.694, so they render at about 8.0 and 7.8 REAL px, under the 0.7rem floor. Raise .cn to 1rem and .ck/.cq to .92rem.
- .card{width:97px; min-height:106px} — the three-line body overflows. Raise to width:120px and min-height:140px, and set .card .ck{line-height:1.25; text-align:center} so 'noon: sees 2 tiles far' wraps inside the box instead of over the neighbour.
- #hand — add padding-left:96px (or margin-bottom:64px) so the injected music chip's bottom-left corner stops covering the first playable card.
- #spdbtn and the feedback button — both float over the ring. Dock #spdbtn into the control row beside #retreatbtn instead of leaving it at absolute position on the canvas.
- The ring slots painted at line 862-886 — raise the slot fill from the current near-background brown to about #2a2418 with a 1px #c8a84b33 rim so an empty slot is visibly a slot. Pure canvas change, no art needed.

**Emoji as art:** Very heavy: 31 distinct emoji doing structural work. The wardrobe uses shield, knight, arrow and crescent glyphs for the four wardens; brown, blue and purple square emoji for the three loop palettes; fire, sparkler and sparkles for the campfire tiers. In play, the hand cards and the ground bar are carried by asterisk, rook and skull glyphs. There are no image files anywhere in the game.

**Readability:** The hand card sub-labels land at roughly 7.8 real px after the stage scale, under the 0.7rem floor, and they overflow their cards. The status line 'Slime blocks the path!' and the right-aligned 'zen watch' are muted grey on near-black, very low contrast. Touch targets are handled correctly: .btn, #spdbtn and #retreatbtn are all min 72 stage px, which clears 48 real px.

**Music chip:** Yes. In loop-warden-2play.png the '♫ Music' chip sits bottom-left on top of the first card in #hand, covering the Clover Field symbol and most of its name. That card is a control the player has to tap.

**Looks broken** (confirmed on a second look, severity ugly)**:** Overlapping UI in loop-warden-2play.png: the hand-card body text overflows the 106px .card boxes and collides between the Watchtower and Graveyard cards, and the injected music chip covers the playable Clover Field card. Plus text under the floor at about 7.8 real px for .card .ck and .cq.

### Flipbook
`flipbook` · satellite · creative · first committed 2026-07-17 · impact 4/5 · effort M
`satellites/flipbook/index.html`

**Now:** Every shot lands on the how-to wall: a gold-bordered dark card filling the frame with about twenty lines of cream body copy and a gold Got it button at the bottom. The actual drawing page never appears. What styling exists is CSS only - a warm dark radial gradient ground, a two-stop cream paper gradient for the page, a repeating-linear-gradient hatch, and one genuinely nice inline SVG data URI that draws a spiral wire binding down the left edge of the book.

**Wrong with it:**
- The help wall renders TOFU. The Cinema line uses the glyph U+26F6 and the Erase line uses U+25FB (index.html:213, 217); both come out as empty rectangles, and the Daily line's U+2600 renders as a bare asterisk. Three of the icon explanations point at blank boxes.
- Two circular gold-ringed buttons overlap at the top right - the x close circle intersects the ladybug feedback circle and the x circle is half-clipped by the top of the viewport. Two round objects with the same silhouette, stacked, one cut off.
- The toolbar mixes one full-colour cartoon ghost emoji with four thin monochrome typographic marks (index.html:172-176: house, single left angle, single right angle, ghost, filled triangle). The icon row has no shared weight, colour or silhouette - the ghost is the only saturated thing on the screen.

**Background now:** CSS only. #wrap is radial-gradient(120% 80% at 50% 0%, #201a14, #0e0b08 70%, #000) (index.html:38) and #stage is a flat var(--bg). The paper page is linear-gradient(180deg,#efe6d0,#e6dabf) with a repeating-linear-gradient hatch and an SVG data-URI spiral binding (index.html:58-66). bgImageDecls is 1 and that 1 is the binding data URI. assetFiles 3 = app icons.

**Background wanted:** A painted desk under the book. The sketchbook is currently floating on flat #0e0b08 with no surface, no lamp pool and no shadow, so the one deliberate touch in the file - the spiral binding - has nothing to be bound to.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-desk-540x960.jpg` | 540x960 full-bleed, painted dark wooden desk seen from above, warm lamp pool centred behind where the book sits, a pencil and an eraser resting in a motivated group at the lower left, deep near-black at the frame edges | Replaces #stage's flat var(--bg). Gives the sketchbook a surface and a light source. |
| `paper-texture-512x716.jpg` | 512x716, warm cream laid paper with faint tooth, a slightly darker gutter down the left 40px where the spiral binding lands, and a soft top-edge shadow | Replaces the two-stop linear-gradient(180deg,#efe6d0,#e6dabf) at index.html:58. The drawing surface is the whole game and it is currently two shades of beige. |
| `icon-toolbar-sprite-350x70.png` | 350x70 transparent PNG, five 70x70 cells: home, previous page, next page, onion-skin (a faint traced pose, not a ghost), play. All one cream line weight with a warm gold active state | Replaces the house / angle-bracket / colour-emoji-ghost / triangle mix in the toolbar at index.html:172-176, which currently has five different silhouette languages in one row. |
| `icon-help-glyphs-192x32.png` | 192x32 transparent PNG, six 32x32 cream icons: cinema screen, eraser, page clear, new book, daily sun, microphone | Replaces the U+26F6 and U+25FB glyphs in the help list that render as empty tofu rectangles, plus the mismatched colour emoji beside them. |

**CSS to do:**
- index.html:39 #stage - swap background:var(--bg) for url(assets/bg-desk-540x960.jpg) center/cover so the book sits on something.
- index.html:58 .page - replace linear-gradient(180deg,var(--paper),var(--paper2)) with url(assets/paper-texture-512x716.jpg) center/cover and keep the index.html:66 repeating-linear-gradient hatch as a multiply overlay on top.
- index.html:118 .hp-card - add padding-top:56px (or push .hp-title down) so the injected music chip, which places itself 900ms after load against the boot layout, stops landing on the heading.
- The ladybug feedback circle and the x close circle - give the bug button top:auto; bottom:14px, or lay both in one flex row with a gap, so the two circles stop intersecting and neither is clipped by the top of the viewport.
- Help list items at 13px on a 540 stage scaled 0.694 to 375 wide = 9.0 real px - raise to 17px stage (11.8 real) to clear the 0.7rem bar. The .tbtn buttons at 70px stage = 48.6 real px just clear the touch bar; do not shrink them.

**Emoji as art:** Yes, heavily - 43 emoji, 19 distinct, and they ARE the icon set. The onion-skin toolbar button is a colour ghost emoji, the help card title is a notebook emoji, and the help body leans on a microphone, an outbox tray, a notebook, a sun and two geometric glyphs that do not render at all. Every one of these should be a painted icon.

**Readability:** Body copy is cream on near-black at good contrast, but 12-13px on a 0.694 stage scale renders at 8.3-9.0 real px, under the 0.7rem bar - and there are twenty lines of it, which is the densest text wall in my batch. Three glyphs render as empty boxes, so those lines are literally unreadable as written. Touch targets are fine: .tbtn is 70px stage / 48.6 real px, #hp-close is 70px full width.

**Music chip:** Yes. The chip covers the help card title so the heading reads o make a flipbook instead of How to make a flipbook, and it greys the Goal: draw line beneath. Same placement on all three shots.

**Looks broken** (confirmed on a second look, severity ugly)**:** Two faults visible in the frame. (1) Missing glyphs: index.html:213 uses U+26F6 for Cinema and index.html:217 uses U+25FB for Erase; both render as empty tofu rectangles in the shot, and U+2600 on line 216 renders as a bare asterisk. (2) Overlapping and clipped UI: the x close circle and the ladybug feedback circle intersect at the top right and the x circle is cut off by the top edge of the viewport. capture.reached is canvas, so the drawing page exists behind this wall - but the help panel is inset:0 at rgba(10,8,6,0.94) and covers it in all three frames, so the actual playfield is unassessed.

### Seed Reel
`seed-reel` · satellite · dice · first committed 2026-07-10 · impact 4/5 · effort M
`satellites/seed-reel/index.html`

**Now:** A 540x960 canvas letterboxed onto the phone: near-black vertical gradient, a 5-wide x 4-tall grid of empty dark rounded squares inside a thin green stroke, a gold SPIN pill under it, and a pale translucent disc top right. Boot is the shared satellite menu, big gold wordmark over black with gold and ghost pill buttons.

**Wrong with it:**
- The 'moon' is ctx.arc(455,120,54) at hard-coded coords with a 10% white fill (render(), line 496). The quota bar spans x70-470 at y120-136, so the disc lands on top of the right ~70px of the Bloom Quota readout. It has no halo, no maria, no rim; it reads as a grey smudge over the HUD, not a moon.
- The garden bed is 20 empty rounded rectangles filled rgba(20,26,18,0.5) on a two-stop gradient. No soil, no depth, no bed. The frame meets the background through a bare 3px green stroke, a hard edge with no falloff.
- Every reel symbol is a vendor emoji glyph drawn with fillText (SYMS[].g, 28 of them). Thirty-three distinct emoji from the system font stand in for the whole art set, so the tiles have no shared hand at all.
- The injected music chip sits top-left over the '<' back HUD button and the 'Spring - Season 1' season line.

**Background now:** Canvas linear gradient per season (curSky().top to .bot), a 5% season tint wash, and one 10%-white disc. Behind the canvas the page is radial-gradient(120% 80% at 50% 0%, #101610, #05070a, #000). Zero image files: assetFiles 1 is the og social card.

**Background wanted:** A painted night garden bed. Dark loam rows seen from slightly above, low stone edging, sage foliage bleeding in from the frame corners, one warm gold lantern glow upper-left, top 200px kept near-black so the HUD stays readable.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-seedreel-bed-540x960.jpg` | 540x960 full-bleed painted night garden: dark loam, soft stone bed edging, sage foliage bleeding in from all four corners, single warm lantern glow upper-left, top 200px near-black | replaces the two-stop CSS gradient plus the stray 10% white disc; gives the empty bed a ground instead of a void |
| `tile-soil-92x92.png` | 92x92 transparent, a soft painted soil cell: rounded dark loam square with a faint pressed rim and a hint of grain | replaces the rgba(20,26,18,0.5) rounded rect at drawBoard line 557 so an empty cell reads as prepared soil, not an empty box |
| `sprites-seedreel-552x460.png` | one atlas, 6 cols x 5 rows of 92x92 transparent painted icons covering the 28 SYMS keys (seed, sprout, leaf, clover, grass, berry, flower, worm, mushroom, foxglove, bee, rain, sun, tree, moon, koi and the rest) | replaces the emoji glyphs so all 28 tiles come from one hand instead of 33 different vendor fonts |
| `moon-seedreel-160x160.png` | 160x160 transparent painted moon, soft warm halo, faint maria, cream rim light | replaces the flat 10%-opacity disc, and lets it move up off the Bloom Quota bar |

**CSS to do:**
- render() line 496: move the moon from arc(455,120,54) to arc(455,64,44), or draw it above y=70, so it stops sitting on the quota bar at y120-136
- drawTopHUD() line 537: the quota label is '700 12px system-ui' inside a 540-wide stage scaled 0.694, so it renders at 8.3 real px. Raise to 17px (about 11.8 real px)
- drawTopHUD() line 526: the NECTAR caption is '600 12px system-ui' = 8.3 real px. Raise to 17px
- HB_MENU and HB_RETRY line 485: 48x48 stage px scales to 33 real px, under the 48px touch floor. Raise both to 70x70
- .foot (line 79) and .wardcard .wt (line 78): font-size 11px = 0.69rem, under the floor. Raise to 13px
- drawBoard() line 553: the bed backing is rgba(10,14,9,0.55) with a flat 3px stroke. Add a 2px cream inner inset and a soft outer shadow so the frame meets the background through a transition

**Emoji as art:** All 28 reel tiles are emoji glyphs (SYMS[].g: seed, sprout, leaf, clover, grass, berry, flower, worm, mushroom, foxglove, bee, rain, sun, tree, moon and more), drawn with ctx.fillText. The SPIN and HARVEST buttons carry slot-machine and seedling emoji; the title menu buttons carry sunflower, calendar, rosette, leaf, ribbon and gear.

**Readability:** Quota-bar label and NECTAR caption are 12px inside a 540-wide stage scaled to 0.694, so about 8.3 real px, well under the 0.7rem floor. .foot and .wardcard .wt are 11px CSS. The two canvas HUD chips are 48 stage px = 33 real px, under the 48px touch floor.

**Music chip:** The floating 'Music' chip is parked top-left directly over the '<' back HUD button and the 'Spring - Season 1' season line. The 'New song' chip sits bottom-left in dead space, no collision. On boot the music unlock card covers the Daily Plot / Bloom Rush row and hides Free Play, Wardrobe, How and settings entirely.

### Bubblenaut
`bubblenaut` · satellite · action · first committed 2026-07-29 · impact 4/5 · effort M
`satellites/bubblenaut/index.html`

**Now:** A near-monochrome green box. The playfield is a dark green-black rectangle inset in a mid-green tiled wall, scattered with rounded mid-green capsule platforms, a few white speck stars, two lime blob critters with dot eyes, and one small pale astronaut in the top-left. Below it a four-button pad in three unrelated colours: two navy squares with white arrows, one mint square, one cyan square. Everything in the room is drawn with fillRect and roundRect - no sprites, no images, system-ui for every glyph.

**Wrong with it:**
- Value collapse: platforms (#3fae72), wall tiles (#1d5c3c), sky (#0a1a12) and critters (#9be86f) are all the same hue at four brightnesses, so at arm's length the room is one green field - the critters you are supposed to hunt read as scenery and only the pale player pops
- The control pad belongs to a different game - navy #131f3a d-pad, mint #6fe8a8 jump, cyan #57e0ff bubble, on a #0b1120 navy tray, sitting under a green room. Four buttons, three palettes, no grouping logic
- A blank mid-green rectangle floats unexplained in the dead centre of the room, and the ladybug feedback button sits on the playfield's lower-right corner directly over a critter

**Background now:** html/body #000; the shell paints radial-gradient(120% 80% at 50% 0%, #0b1224, #05070f, #000). Inside the canvas the room ground is a two-stop vertical fill from W.sky (['#0a1a12','#07130c'] for Moss Moon) plus about 40 white 1px star dots. Five worlds each carry their own five-colour palette (index.html:347-356). No image assets at all - the folder holds icon-192/512 and og/card.jpg and nothing else.

**Background wanted:** One painted plate per world behind the tile grid. The palettes are already written and named (Moss Moon, Crystal Caverns, Rust Belt, Frost Ring, Magma Core) - each just needs a real cavern behind the rectangles so the room stops being a flat fill with dots on it.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/bg-moss-moon-750x1000.jpg` | 750x1000 full-bleed. Painted moss-cavern interior: wet dark rock #07130c to #0a1a12, clumps of pale lichen catching a cool green rim light, a few drips and a faint spore haze, depth falling to black at the edges. Value kept below the platform green #3fae72 everywhere so platforms read on top. Same painting repeated for the other four worlds in their own palettes. | Replaces ctx.fillStyle=bg plus 40 star dots (index.html:759-763). Fixes the value collapse by pushing the ground a full step darker and gives the room somewhere to be. |
| `assets/tiles-mossmoon-256x64.png` | 256x64 transparent PNG, four 64x64 cells: platform-top, platform-middle, wall-block, wall-corner. Painted stone with moss on the upper lip, warm rim light on the top edge, dark undercut. Tileable horizontally. | Replaces the roundRect capsule plus two 4px highlight/shadow strips at index.html:783-789. Turns the platforms and the surrounding frame into a built room instead of a border of green bars. |
| `assets/critter-hopper-192x64.png` | 192x64 transparent PNG, three 64x64 frames of a hop cycle. Round lime #9be86f body, two big dark eyes, a squash on landing, warm underlight. One sheet per critter (Hopper, Skitter, Drone, Slick, Cinder). | A critter is currently ctx.arc plus two dots, the same shape and hue family as everything else. A sprite with its own silhouette makes the thing you are hunting findable in one glance. |

**CSS to do:**
- .padbtn / .padbtn.bub / .padbtn.jmp (index.html:98-102) - three unrelated hues in one four-button row; retint the two d-pad buttons to the active world's solid colour and keep exactly one bright accent (the bubble button) so the pad reads as one control instead of three
- #pad tray background:#0b1120 (index.html:87) - hardcoded navy under a green room; set it per-room from W.sky[1] so the tray belongs to the world it sits under
- Canvas HUD at index.html:768-773 - the world name is 17px #8b96b8 on #0a1a12 (about 2.6:1, under the readable floor); take it to #c9d6ee at 18px and move the whole HUD block from y=30 to y=56, or right of x=112, so the injected music chip stops sitting on it
- The boot screen's cyan wordmark + rose 'SKY WOLF STUDIO' pairing is the only warm note in the game and the play screen throws it away; carry that cyan/rose accent into the HUD so boot and play look like the same product

**Emoji as art:** Light but present - 15 emoji, 7 distinct, mostly HUD and buttons: the lives row reads as three small ghost glyphs at top-right, plus the ladybug feedback badge, the music note, and arrow glyphs on the d-pad. The characters themselves are canvas shapes, not emoji, so nothing critical is emoji-substituted; the lives counter and the d-pad arrows are.

**Readability:** The HUD is the problem. 'Moss Moon' is drawn at 17px in #8b96b8 on a #0a1a12 room - roughly 2.6:1 - and is additionally covered by the music chip. 'Room 1 / 25' at 24px in the world glow colour is half covered too. Score at top-right is fine. One 11px CSS declaration. Touch targets are good: the four pad buttons are large squares well over 48px.

**Music chip:** Yes. The chip parks top-left over the canvas HUD - it completely hides the world name 'Moss Moon' and covers roughly the left half of 'Room 1 / 25' in both -2play and -3later, leaving the visible text reading as a broken fragment.

### Mosaic Draft
`mosaic-draft` · satellite · board · first committed 2026-07-11 · impact 4/5 · effort M
`satellites/mosaic-draft/index.html`

**Now:** An Azul-style tile duel on a brown-black vignette: five flat brown discs holding rounded-rect shards, a rival panel above, the player's staircase wall below, and a floor-penalty strip at the very bottom. The shards are solid fills (cobalt/amber/jade/garnet/pearl) with a single line glyph stamped in the middle; there is no painted art anywhere in the frame, no texture, and nothing that says ceramic or kiln beyond the word 'kiln' in the copy.

**Wrong with it:**
- The five kiln plates are flat #2e241a circles with a soft vignette sitting on a #1a140f panel - almost the same value as what they sit on, no cast shadow, no rim - so the plates barely separate from the background and read as smudges.
- The floor-line penalty numerals (-1 -1 -2 -2 -2 -3 -3) are roughly 11px dark red on near-black under seven empty boxes: below the 0.7rem floor, near-invisible, and the strip carries no label, so it reads as accidental leftover boxes.
- The rival's 5x5 wall top-right and the player's wall at the bottom are the same object twice at two sizes with the same glyphs - two things in one frame sharing a silhouette, which is exactly the 'sloppy' read; at ~18px the rival grid is just coloured noise.

**Background now:** No image at all. body radial-gradient(120% 80% at 50% 0%, #161110, #060505 70%, #000) plus a canvas-drawn theme gradient (THEMES.workshop bg0 #1b1512 to bg1 #0b0807). bgImageDecls: 0, imgTags: 0, inlineSvg: 0. The only file in satellites/mosaic-draft/ besides index.html is og/card.jpg.

**Background wanted:** A painted potter's workshop at night, 540x960: a brick kiln mouth glowing amber low-left, a shelf of unglazed pots receding into shadow at right, dust hanging in one shaft of light, ground values kept at #0b0807-#1b1512 so the existing HUD panels and plates still read on top. The game already has a THEMES map (workshop / nightkiln / alabaster / emberstudio) so four variants of the same plate would light up the wardrobe with no new code.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-workshop-540x960.jpg` | 540x960 full-bleed JPG, near-black #0b0807 ground, amber kiln mouth glowing low-left, shelf of unglazed pots in shadow right, one dusty light shaft, no detail in the centre third where the plates sit | Replaces the flat brown radial vignette that is currently the entire background; gives the game the workshop its copy keeps promising. |
| `bg-nightkiln-540x960.jpg / bg-alabaster-540x960.jpg / bg-emberstudio-540x960.jpg` | same 540x960 framing and composition as bg-workshop, relit to the existing THEMES palettes (#11141f cool, #2c2b25 pale, #241110 ember) | The wardrobe already sells four themes but they only change six hex values; one repaint each turns a colour swap into a real unlock. |
| `shards-sheet-640x256.png` | 640x256 transparent PNG, 5 columns x 2 rows of 128px cells: Cobalt / Amber / Jade / Garnet / Pearl, top row matte unglazed with a chipped edge, bottom row glazed with a wet specular streak top-left and a warm bounce along the bottom; keep each kind's distinct glyph shape (tri/cir/sq/star/cross) pressed into the clay rather than drawn on top | Replaces the flat rounded rect + 1px stroke glyph that every one of the ~60 tiles on screen currently uses. This is the single biggest lift in the game. |
| `plate-kiln-256x256.png` | 256x256 transparent PNG, a fired clay kiln plate seen slightly from above, warm rim light top-left, soft dark cast shadow baked into the lower 20px, shallow inner well | Replaces the flat #2e241a circle so the five factory plates lift off the panel instead of matching its value. |
| `wall-plaster-540x400.png` | 540x400 transparent PNG, the 5x5 wall as a grouted plaster panel with 25 recessed square sockets and a shadow inside each socket | Empty wall slots are currently 1px outlined boxes floating in nothing; recessed sockets make an empty slot read as a place a tile goes. |
| `rivals-3x-192x192.png` | three 192x192 transparent bust portraits - Tam the Apprentice, Mirela the Artisan, Kover the Master - warm rim light, storybook, clay-dusted aprons | Replaces the emoji (artist / artist / older person) currently standing in as rival faces on the ladder screen. |

**CSS to do:**
- #hud - the injected 97x48 chip lands on the top-left and eats the home button. Either move #hud-back to the right end of #hud, or add padding-left:112px to #hud so the chip has its own lane.
- canvas floor-line numerals (drawn in the '---- floor line ----' block ~line 849) - raise the font from ~11px to 15px on the 1080-wide backing store and change the fill from dark red to #b8524e at full alpha; on #0b0807 the current value is unreadable.
- #hud .chip span - 0.7rem sits exactly on the floor; raise to 0.75rem.
- .wcard .wl - 0.68rem is under the 0.7rem floor; raise to 0.72rem.
- kiln plate draw (the '---- factories ----' block ~line 772) - add a dark ellipse shadow under each plate and a 1px #3f3325 rim so the plates separate from the #1a140f panel behind them.
- #s-how / screen order - the game BOOTS onto HOW TO PLAY, a full screen of body copy, before the player ever sees the title. Show the title screen first and keep How behind its own button.

**Emoji as art:** Title screen buttons: vase Duel Ladder, calendar Daily Kiln, fire Kiln Rush, moon Zen Studio, shirt Wardrobe, question How, speaker sound. Rival avatars on the ladder screen are three people emoji (index.html:1086). Ten wardrobe theme icons are emoji at index.html:339-350. 38 emoji total, 25 distinct.

**Readability:** The home button (48px, correct size) is completely covered by the injected Music chip, so it cannot be tapped. Floor penalty numerals are ~11px dark red on near-black - under the 0.7rem floor and very low contrast. .wcard .wl is 0.68rem, #hud .chip span is 0.7rem (on the floor). Everything else is 0.85rem+ cream on dark and reads fine. Tiles are ~34 rendered px, under the 48px target if they are individually tappable.

**Music chip:** Yes, two collisions. (1) The Music chip is placed top-left and covers the home button and the '1 / round' HUD chip outright, plus the left half of the 'zen / zen mode' chip, and crosses the 'TAM ZEN' rival name. On the boot HOW TO PLAY screen the same chip covers the first two letters of the 'HOW TO PLAY' heading. (2) The injected ladybug feedback button and its close X sit on the bottom-right of the player's own 5x5 wall grid, the X cutting one tile in half and the ladybug covering another.

### Wireworm
`wireworm` · satellite · action · first committed 2026-08-16 · **workbench-gated** · impact 4/5 · effort M
`satellites/wireworm/index.html`

**Now:** I drove it myself to see the board, because all three supplied frames are covered by the music drawer. A 373px square of near-black green fills the upper screen, a grey-olive dotted trail bends through it, five identical blue rings sit scattered around, and the dead head is a red dot at the right edge. Below that, two enormous empty near-black boxes with faint grey turn arrows take 40% of the phone, then EXIT / DAILY / a bright lime PLAY AGAIN slab.

**Wrong with it:**
- The grid does not read as a grid. #10160b on #0c1209 is invisible at 1px, except for one vertical line at about x=190 and one horizontal at about y=272 that happen to land on whole device pixels - so a 20x20 board looks like a black rectangle with two stray seams in it.
- Every terminal is the same object: five identical blue rings with a blue centre dot, scattered with no motivated grouping. The four terminal colours and their four glyph shapes (triangle, square, diamond, cross) are what the whole scoring system rests on, and at a 15.7px disc none of the shapes resolve - the pairs are told apart by hue alone.
- The bottom 210px is two empty rounded rectangles filled #10140c on a #0a0b0f page - almost no contrast, so the primary controls read as holes rather than buttons, with a single 34px grey glyph floating in the middle of each.
- -1boot is a game-over card. There is no title screen; startRun fires at boot (index.html:3068) so the worm is moving before anything is read, and the first thing a phone shows is 'Look what you built / You ran off the board' with a score of 0. That is the first impression the store gets.
- The board meets the page through a bare 14px-radius edge with a 3-value colour step and no bezel, frame or shadow - the playfield is a rectangle floating in black.

**Background now:** A flat fillRect of #0c1209 plus a 1px etch grid at #10160b, drawn in draw() at index.html:2446. The page behind it is flat #0a0b0f. Zero background-image declarations, zero gradients, zero keyframes in the CSS; the only image files in the folder are the three PWA icons.

**Background wanted:** A painted circuit substrate: a 1024x1024 tileable dark board with copper trace ghosts under a green solder-mask sheen, dust in the corners and a soft vignette, plus a brass bezel around the 373px playfield so the board sits in something instead of floating. The overload state then warms the whole plate rather than drawing an amber stroke rectangle.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/ww-substrate-1024.png` | 1024x1024 PNG, tileable, dark solder-mask green with ghost copper traces, dust, subtle vignette; drawn into the 373x373 board. | Replaces the flat #0c1209 fillRect and the 19+19 invisible etch lines at index.html:2446-2456 (sheet 01 in the game's own ART_ASSETS.md). |
| `assets/ww-bezel-frame-512.png` | 512x512 PNG, transparent centre, 9-slice-safe brass bezel with screw heads at the corners and a warm inner rim light. | Gives the board an edge. Today it meets the page through a hard 14px radius and a 3-value colour step; it also replaces the amber strokeRect overload frame at index.html:2459-2466. |
| `assets/ww-wire-autotile-32x256.png` | One sheet, 32 cells at 256x256, transparent: 16 neighbour combinations x 2 states (live copper, dead oxidised). Live cells carry the bead/solder joint painted in. | Replaces drawWireCell at index.html:2419, which draws rounded strokes to neighbours plus a dot. In game one cell is 18.65px, so 256 is generous headroom (sheet 02). |
| `assets/ww-terminals-4x256.png` | One sheet, 4 cells at 256x256, transparent: green, blue, amber and red brass sockets, each a genuinely different silhouette (triangle plate, square plate, diamond plate, cross plate) not just a different hue. | Replaces the disc + ring + glyph terminal loop at index.html:2526-2547. Fixes the 'five identical blue rings' problem I photographed (sheet 03). |
| `assets/ww-head-8x256.png` | One sheet, 8 cells at 256x256, transparent: the worm head at eight headings, painted as a cream ceramic bead with two dark eyes, plus a dead variant tint. | Replaces the #eaffd0 disc with two eye dots at index.html:2577-2584 (sheet 04). |
| `assets/ww-pad-glyphs-2x256.png` | Two 256x256 transparent cells: painted brass rotary arrows, left and right, with a warm rim light. | Replaces the faint HTML arrow entities in the two 170x108 turn pads, which are currently the emptiest part of the screen (sheet 07). |

**CSS to do:**
- #sub: white-space:nowrap with text-overflow:ellipsis truncates the HUD at 375px - it reads 'best 0 14 ticks 0 circu...', hiding the circuit count the whole game is about. Drop to two flex columns or shorten the labels to 'ticks' and 'circ' so the line fits at 320px.
- .padbtn: fill #10140c on a #0a0b0f page is near-invisible. Give the pads a background-image (ww-pad-glyphs) plus a 1px var(--line) border and an inner top highlight, or shrink them to 88px tall and give the reclaimed height back to the board.
- #board: add a box-shadow ring and drop the flat background:#0c0f0b for the substrate image, so the playfield stops meeting the page through a hard edge.
- #loadLbl and #sub at 13px are fine, but .padbtn glyph colour #6d7a5f on #10140c is roughly 2:1 contrast - raise the glyph to #9fb08d or paint it.
- #sheetOver: reserve bottom padding (about 120px) so the injected music unlock card cannot land on the 'longest circuit' and 'overloads' stat tiles.

**Emoji as art:** Almost none - 1 emoji total in the file. The game draws everything procedurally with canvas primitives (discs, rounded strokes, strokeRect, fillText glyphs), which is the same problem by a different route: CSS and canvas shapes doing the work of art. The gear button is an HTML entity and the turn arrows are HTML entities.

**Readability:** The HUD sub-line truncates with an ellipsis at 375px, so circuits are never visible during play. Turn-pad glyphs are #6d7a5f on #10140c - about 2:1, well under readable. Everything else is comfortable: score 30px, load 17px, labels 13px. Touch targets are good - gear 48px, footer buttons 48px, turn pads 170x108.

**Music chip:** Yes, and twice over. The chip parks at the left edge around y=310: in -1boot it covers the left third of the death card's mini-board plate, and in -2play/-3later it sits on the soundtrack drawer's PLAYLISTS row, hiding the start of 'No playlists yet. Tap + New...'. Separately, in my own capture the music unlock card ('CONGRATULATIONS, YOU UNLOCKED A SONG' - Neon Rush) slid up over the bottom of the death sheet and covered the 'longest circuit' and 'overloads' stat tiles.

### Skitterlings
`skitterlings` · satellite · action · first committed 2026-06-27 · impact 4/5 · effort S
`satellites/skitterlings/index.html`

**Now:** Boot is a dark navy menu wall of eight stacked pill buttons (yellow PLAY, a mint-to-cyan CASCADE MODE gradient, five near-identical navy slabs) under a purple daily-bonus card, and the top 100px is three layers of text printed on top of each other. The play capture landed on the RUN OVER screen: a well-drawn purple blob-bunny with big eyes over a near-black gradient, big cream numerals, and behind the scrim you can just make out one dim tree silhouette on an otherwise empty world.

**Wrong with it:**
- Triple text collision in the top 100px of boot. The story line 'you'll never quite catch it, but the chase wakes the worlds...' is clipped off the top of the screen AND printed over the `#rotateHint` pill, which is `position:fixed; z-index:30` and whose 'Rotate your phone. Skitterlings plays best in landscape' wraps to five lines that burst straight out of its `border-radius:999px` shape, and both sit over the coin badge and pause buttons. Nothing in that band is readable.
- Three empty placeholder boxes lead the menu. `#favBar` renders bare star glyphs in flat navy rounded rects on a fresh install (index.html:2190, `slot.textContent = star`), so the first thing above the fold is three grey holes.
- Five of the eight menu buttons are the identical navy slab with identical cream text at identical width - Skitterlings, Vault, Worlds, Boosters, Back to Sky Wolf share one silhouette, so the menu reads as a list, not a composition.
- The game-over creature has no ground. It floats over a vertical dark gradient with its shadow missing; the world art behind (the tree at x~50,y~360) is dimmed almost to black by the scrim, so the payoff screen shows none of the world you just played.

**Background now:** Canvas-drawn, data-driven, and actually substantial: 100+ world records with sky0/sky1/skyGlow/ground/ground2/fog/star plus a parallax style (hills, clouds, aurora, ruins, city, crystals, bamboo...), decor, and weather. But the frames captured are all under a near-opaque overlay scrim, so what you SEE is a flat #12141f-ish vertical gradient. No image files at all - the folder holds only icon.svg.

**Background wanted:** Keep the procedural worlds, they are the game's best asset. What is missing is the menu and the game-over screen: both should show the CURRENT world's sky live behind a much lighter scrim, so the 'Reached Dewspring Morning' line has the actual Dewspring dawn behind it instead of black.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `menu-hero-750x420.jpg` | 750x420 JPG, full-bleed. A skitterling mid-leap in silhouette against a Dewspring dawn sky - warm peach sky0 to cream sky1, hill parallax, one glimmer spark ahead of it, bottom edge fading to the menu navy #141a2e. | Replaces the empty band at the top of the menu that the clipped story text and rotate pill currently fight over. Gives the title screen a picture. |
| `fav-slot-empty-96x96.png` | 96x96 PNG, transparent. A soft dashed sage ring with a faint sleeping skitterling curl inside at 25% opacity. | Replaces the bare star textContent in `#favBar`. Turns three grey holes into three 'not yet found' invitations. |
| `creature-shadow-220x50.png` | 220x50 PNG, transparent. A soft elliptical contact shadow, warm-black, feathered. | The RUN OVER creature has no shadow and floats. One plate fixes every creature on that screen. |

**CSS to do:**
- `#rotateHint` - it is `position:fixed` with `max-width:94vw` and wraps to five lines inside `border-radius:999px`. Change to `border-radius:16px`, add `white-space:normal; text-align:left; line-height:1.35`, and move `top` below the HUD (`top:calc(max(8px,env(safe-area-inset-top)) + 56px)`) so it stops printing over the coin badge and the story text.
- `#rotateHint button` (the dismiss X) - `padding:2px 5px; font-size:13px` gives roughly a 22px target. Add `min-width:44px; min-height:44px; display:grid; place-items:center` to clear the 48px floor.
- `.story` on `#titleScreen` - it is being clipped at the top of the scroll container. Add `padding-top` equal to the rotate-hint height, or set `#titleScreen .scroll{ scroll-padding-top:96px }`, so the first line is never cut in half.
- `.btn.alt` - five identical navy slabs. Give Worlds and Vault a distinct treatment (a left accent bar in `--accent`, or a 56px art thumb slot) so the menu has a hierarchy instead of a list.
- The RUN OVER scrim - currently near-opaque black over the canvas. Drop it to `rgba(8,10,20,.62)` with a `backdrop-filter:blur(3px)` so the world you just reached is visible behind the score.

**Emoji as art:** 51 emoji across 16 distinct glyphs, all in chrome: fullscreen, mute, pause, paw and gem in the progress chips, fire daily, and a star standing in for the missing favourite-slot art in `#favBar`. The creatures and the world are canvas-drawn, not emoji.

**Readability:** The three stacked text layers at the top of boot are outright unreadable. `#rotateHint` is 12px (0.75rem) - legal but tight - and its dismiss X is about a 22px target, under the 48px floor. `#collSub` and the Worlds blurb are set inline at `font-size:12px`. The 'Reached Dewspring Morning' line is muted lavender on near-black and reads faint.

**Looks broken** (confirmed on a second look, severity ugly)**:** Boot frame, top 100px: 'you'll never quite catch it, but the chase wakes the worlds and calls new skitterlings out of hiding.' is clipped off the top edge and drawn over the `#rotateHint` pill, whose own text ('Rotate your / phone. / Skitterlings / plays best in / landscape') wraps to five lines and overflows its 999px pill outline, and both overlap the coin badge and pause button. Play frame shows the same pill with 'landscape' cut off by the pill's bottom edge. No 404s under the game's own folder; capture.badRequests is empty.

### Mini Crossword
`mini-crossword` · satellite · word · first committed 2026-07-11 · impact 4/5 · effort M
`satellites/mini-crossword/index.html`

**Now:** Flat dark plum page, no art of any kind (1 asset file, the og card). Play screen is a canvas 5x5 grid in near-black cells over a near-black page, a gold clue bar and a full QWERTY keyboard of flat #211a3a rectangles. The single saturated thing on screen is one salmon-red letter W.

**Wrong with it:**
- The grid has no silhouette: blocked cells are drawn #050308 against a #0d0a14 page (PAPERS.newsprint, index.html:972), so the four blocked squares read as holes punched in the page rather than part of a crossword - the puzzle shape is unreadable.
- The music chip sits at the bottom-left directly on top of the Z key of the keyboard, and also on the footer strap.
- The footer strap 'Mini Crossword 1.1 - best 0 - 0 ink - 609 words' is half-clipped under the keyboard at the very bottom of the frame and is well under 0.7rem.
- The auto-check wrong-letter colour #ff6a5a (index.html:1281) plus the little red tick stroked into the cell's top-right corner is the loudest element on a plum-and-gold page and reads as a rendering artefact, not feedback.

**Background now:** Nothing painted. html/body #000, .wrap radial-gradient(120% 80% at 50% 0%, #161022, #070510, #000), stage flat #0d0a14, and the puzzle canvas fills itself with PAPERS.newsprint.bg #0d0a14 - the same colour as the page, which is why the grid dissolves.

**Background wanted:** A painted desk-at-night scene. This is a paper game with a paper metaphor already in the code (papers are called Newsprint / Graph / Parchment) and nothing on screen is paper. A desk plus a paper card under the grid would do more here than anywhere else in the batch.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/games/mini-crossword/bg-desk-540x960.jpg` | 540x960 JPG, full-bleed, dark oak desk at night seen from above-front, one warm lamp pool in the upper third, a pencil and a sprig of rosemary resting at the lower edge, deep near-black at the bottom so the keyboard reads | Replaces the flat radial gradient. Gives the puzzle a place to sit and stops the grid from floating in undifferentiated black. |
| `assets/games/mini-crossword/paper-newsprint-560x560.png` | 560x560 transparent PNG, painted paper card with softly torn edges, faint fibre texture, warm cream-grey, slight lift shadow baked in | Drawn under the canvas grid so the 5x5 reads as paper on a desk and the blocked squares have something to be black against. Three more variants (graph, parchment, midnight) already have colour entries in PAPERS and would become real skins. |
| `assets/games/mini-crossword/key-cap-56x72.png` | 56x72 transparent PNG, painted keycap with a warm top bevel and a soft bottom lip, 9-sliceable centre | Replaces the 30 flat #211a3a rectangles that currently make up the whole bottom half of the frame. |

**CSS to do:**
- PAPERS.newsprint.black (index.html:972) - '#050308' -> '#1c1530'; blocked cells must be visibly darker than the cells but lighter than the page, or the grid has no outline.
- .key (index.html:65) - max-width:56px yields roughly 34px caps at 375px across 10 columns; drop to max-width:none with flex:1 and gap:4px so caps land at 40px+ wide (min-height:72px is already fine).
- #hud .chip span (index.html:49) - font-size:.66rem -> .74rem; it is under the 0.7rem floor.
- The footer strap - add padding-bottom:calc(10px + env(safe-area-inset-bottom,0px)) and z-index above #kb, or hide it while the play screen is up; it is currently sliced by the keyboard.
- Wrong-letter ink (index.html:1281 and 1284) - '#ff6a5a' -> a house rose around '#e0808f', and drop the corner tick stroke; the current mark looks like a glitch.

**Emoji as art:** No illustration anywhere. Everything is a typographic glyph doing an icon's job: the house glyph for home, a stopwatch on Time Trial, the arrow pair on the direction button, the backspace glyph, the ladybug on the feedback FAB. 11 emoji total across the whole game.

**Readability:** #hud .chip span at .66rem is under the 0.7rem floor. Footer strap is tiny and clipped. Blocked cells vs page fail contrast outright. Keyboard caps measure about 34px wide at 375px, under 48. Clue bar and HUD chips are fine.

**Music chip:** Bottom-left, sitting on the bottom-left keyboard key (Z) and over the footer strap.

### Vinewinder
`vinewinder` · satellite · action · first committed 2026-07-03 · impact 4/5 · effort M
`satellites/vinewinder/index.html`

**Now:** A pale mint light-theme snake game. The play frame is a ~315px rounded board filled #f2f7ee to #dceadd with a grid at 5% alpha, so it reads as blank graph paper; the only thing with contrast is a 40px dark-green two-segment vine in the middle and one 10px amber seed against the left edge. Serif italic 'Vinewinder' wordmark and 'A BOTANICAL SNAKE GAME' above, a stat row below, and three hard black slabs (♫ Music top-left, ♫ New song bottom-left, the 🐞 feedback bubble) pinned onto the mint. Boot is the same mint with a gold Daily Challenge card and a deep-green PLAY button.

**Wrong with it:**
- The board reads empty. The meadow theme's grid is rgba(47,93,58,.05) on #f2f7ee, which is below the visible threshold on a phone, so the playfield looks like a loading state rather than a garden - the frame's whole visual budget is spent on one green capsule.
- Three near-black rounded slabs (♫ Music, ♫ New song, the bug bubble) sit straight on the pale mint with no shadow ramp or transition. Nothing else in the game is black, and none of them share a silhouette with the game's own white circular ⏸ and ♪ buttons - four different button languages in one frame.
- The ✕ / 🐞 feedback pair lands on the stat row and covers the word 'GARDEN' in 'CLASSIC GARDEN', and the ♫ New song chip below it sits on the 'arrows / WASD to steer' hint line.
- On boot the black music-unlock sheet covers the bottom 210px and cuts both mode cards mid-sentence ('Walls around the', 'Edges wrap. Golden'), and on the game-over screen the menu behind shows through the pale ground as illegible grey smudges around y≈510.

**Background now:** No image anywhere (imgTags 0, drawImage 0). Body is three stacked CSS gradients: radial 1200x600 #f4f8ef at 20% -10%, radial 900x500 #cfe0d0 at 90% 110%, and linear-gradient(160deg, --mist #e9f0e6, --mist-deep #d3e2d4). The canvas board is a flat theme fill (bg0/bg1 per theme) plus a 5%-alpha grid, drawn with ctx.fillRect - only 2 canvas gradients in the whole 67KB file.

**Background wanted:** bg-garden-mist-750x1334.jpg - a painted misty garden behind the board: soft out-of-focus foliage massed top and bottom-left, a warm dawn glow bottom-right exactly where the existing #cfe0d0 radial already sits, and a pale open middle so the board reads as a trellis panel hung in a garden instead of a blank sheet. Keeps the mist/vine/pollen palette that is already in :root.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-garden-mist-750x1334.jpg` | 750x1334 full-bleed JPG, painted misty garden, out-of-focus foliage top and bottom-left, warm dawn glow bottom-right, pale open centre band behind the board | Replaces the three-gradient body wash so the game has a place instead of a colour, and gives the black injected chips something to sit against. |
| `board-trellis-630x630.png` | 630x630 transparent PNG (2x of the 315px board), painted wooden lattice with soft moss in the corners and a faint paper tooth, designed to multiply under the vine at ~30% strength | Replaces the 5%-alpha canvas grid that is invisible on a phone and is why the playfield reads as empty graph paper. |
| `seed-sprites-256x256.png` | 256x256 transparent PNG, 2x2 grid of 128px painted seeds (pollen, petal, moon, dew) each with its own silhouette and a small matching glow | Replaces the flat canvas dots - the seed is the only reward on screen and is currently a 10px circle you can lose against the pale board. |
| `petal-icon-128x128.png` | 128x128 transparent PNG, painted marigold petal token, warm gold with a soft rim light | Replaces the 🌼 system emoji, which appears 14 times as the currency across the HUD chip, the Daily Challenge card and the game-over reward line. |
| `streak-icon-128x128.png` | 128x128 transparent PNG, painted ember or small lantern, warm amber glow, transparent | Replaces the 🔥 emoji in the streak chip so the two HUD chips share one painted style. |

**CSS to do:**
- The 'meadow' theme entry (index.html:395) - grid rgba(47,93,58,.05) → rgba(47,93,58,.14) and bg0/bg1 #f2f7ee/#dceadd → #e6efe1/#c9dbc7; at 5% on near-white the grid does not exist on a phone and the board reads blank.
- The injected ♫ Music / ♫ New song chips - override their slab background to rgba(36,56,43,.90) with a 1px var(--vine) hairline and a 0 6px 18px rgba(36,56,43,.18) shadow, or dock them into the top HUD row; three flat black rectangles are the loudest thing on a mint screen.
- The feedback bug bubble and its ✕ - they land on the .stats row and cover 'GARDEN'; pin them to bottom: calc(env(safe-area-inset-bottom) + 88px) or move them to the right edge of the header band.
- The in-canvas ⏸ and ♪ white circles - they float inside the top-right of the playfield over live play area; move them into the header band above the board so nothing sits on top of the vine's path.
- The mode-card list - give it padding-bottom:230px (or defer the unlock sheet until after the first run) so the music-unlock card stops cutting both mode cards mid-sentence on boot.
- The game-over screen - the menu behind bleeds through as grey smudges; set the outgoing screen to visibility:hidden after the fade rather than leaving it at low opacity.

**Emoji as art:** 🌼 is the currency, used 14 times across the HUD chip, the Daily Challenge reward line and the game-over payout; 🔥 is the streak icon; ♪ and ⏸ (❚❚) are glyphs standing in for the pause and music buttons. The vine, seeds and walls themselves are canvas primitives, not emoji.

**Readability:** 'A BOTANICAL SNAKE GAME' is a wide-tracked ~11px caption (0.69rem), just under the floor. The 5%-alpha grid is below visible contrast. 'GARDEN' in the stat row is covered by the feedback bubble. The game-over ghost text is unreadable by design but reads as an artefact. Buttons are otherwise generous - PLAY and PLAY AGAIN are ~56px tall, the mode cards are large, and the dark-green-on-mint body text has strong contrast.

**Music chip:** The injected ♫ Music chip is clear of game UI on boot (it sits left of the 🔥/🌼 HUD chips) but crowds them. The bigger injected collision is the music-unlock sheet on -1boot, which covers the bottom 210px and cuts both mode cards mid-sentence, plus the ♫ New song chip on -2play/-3later sitting on the 'arrows / WASD to steer' hint line. Vinewinder includes /music-unlocks.js at index.html:183.

### Garden Path
`garden-path` · satellite · board · first committed 2026-07-18 · impact 4/5 · effort M
`satellites/garden-path/index.html`

**Now:** A Candy-Land ladder of roughly sixty identical flat circles in six candy primaries, snaking on grey path ribbons over a two-stop green gradient. A flat gold rounded rectangle with a crown stands in for the Garden Throne at the top, two 20px hand-coded vector mascots wait at the bottom-left start, and the lower third is a bordered deck card next to an empty grey box that says your card appears here.

**Wrong with it:**
- Every one of the ~60 path tiles is the same silhouette - a circle, a darker rim, a white gloss ellipse and a white centre dot (drawTile at index.html:505) - so the board reads as a beaded necklace rather than a garden. Only the three landmark tiles break the pattern, and they break it with a gold ring, not a shape.
- The path ribbon is a flat grey band with hard right-angle corners that meets the ground on a 1px edge: no grass, no soil spill, no dapple, no transition anywhere between ribbon, tiles and ground. The ground itself is one two-stop gradient (#1c3a26 to #0c1c12) with nothing in it.
- The injected music chip (10,10, 96x48) sits directly on top of the arcade back arrow at the top-left, so during play the only way out of the game is completely hidden.
- The empty 'your card appears here' box takes about a sixth of the screen and, being flat grey with a dashed outline, reads as a missing element rather than a waiting slot.

**Background now:** Canvas linear gradient, three stops: #1c3a26 to #123020 to #0c1c12, painted every frame at index.html:472. Menu behind it is a CSS radial-gradient(120% 80% at 50% 0%, #10160f, #05070a, #000). bgImageDecls 0, imgTags 0; the only image file in the folder is og/card.jpg.

**Background wanted:** bg-gardenpath-540x960.jpg - a painted night garden lawn seen from above: mown grass bands, moss patches, a scatter of fallen petals, low hedge softening the frame edges, deep sage falling to near-black at top and bottom so the path ribbon and the deck card both read over it.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `tile-flower-6x-96x96.png` | six painted flower heads at 96x96 each, transparent PNG, one per COLORS entry (Poppy, Marigold, Sunflower, Fern, Forget-me-not, Violet), each with a genuinely DIFFERENT petal silhouette and warm rim light | replaces the identical ctx.arc circles in drawTile so tiles are told apart by shape as well as hue, and kills the beaded-necklace read |
| `bg-gardenpath-540x960.jpg` | 540x960 full-bleed painted garden ground, grass and moss, petals, hedge at the frame edge, dark falloff top and bottom | replaces the two-stop canvas gradient that is currently the entire background |
| `throne-256x256.png` | 256x256 transparent PNG, painted mossy stone throne with a gold crown resting on it, warm rim light from the left | replaces the flat gold rounded rectangle at the top of the board, which does not read as a throne at 375px |
| `mascot-5x-128x128.png` | five 128x128 transparent PNGs - Gnome, Fairy, Sprite, Princess, King - painted chest-up, each a distinct silhouette, same eye-line so they do not jitter when swapped | replaces the ~20px hand-coded vector figures that currently overlap each other on the start tile |
| `path-ribbon-tile-64x64.png` | 64x64 tileable painted stepping-stone and gravel strip with soft dirt edges and a transparent margin | replaces the flat grey rgba ribbon and gives the path a transition into the ground instead of a hard 1px edge |

**CSS to do:**
- #sws-music-chip on this game: force right:10px or bottom-left so it stops covering the arcade-exit back arrow, which also lives at 10,10 at 48x48.
- drawLandmark() index.html:500: ctx.font '800 10px system-ui' to '800 13px system-ui' and widen the label pill to match - 10px is 0.625rem, under the 0.7rem floor.
- The 'your card appears here' placeholder: give it the deck's gold 1px border and a faint card-back fill instead of flat dashed grey so it reads as an empty slot, not a broken element.
- drawTile(): drop the uniform rgba(255,255,255,0.82) 3.4px centre dot and vary TILE_R by a pixel or two per colour so the sixty tiles stop sharing one silhouette.

**Readability:** Landmark name labels are drawn at 10px (0.625rem), under the floor. The 'your card appears here' placeholder is muted grey on dark and barely reads. Every DOM button measured at or above 48px; no small touch targets outside the injected music minimise dot.

**Music chip:** The 96x48 music chip at 10,10 covers the arcade-exit back arrow, which is also at 10,10 at 48x48 - the exit is entirely hidden during play.

### Fence Off
`fence-off` · satellite · board · first committed 2026-07-11 · impact 4/5 · effort M
`satellites/fence-off/index.html`

**Now:** A 9x9 grid of 81 identical flat dark-navy rounded rectangles drawn on canvas, framed by a thin blue line, on a near-black page. Two tiny markers move on it: a gold dotted circle for you and a blue triangle in a lighter square for the rival. Tiny gold dots mark the top goal row. The boot menu before it is tidier — a gold-and-indigo FENCE OFF wordmark over five gradient mode buttons.

**Wrong with it:**
- The instruction line under the board is CLIPPED AT BOTH EDGES — it reads 'N, move either pawn, plant fences, vault fre'. The string is 'ZEN, move either pawn, plant fences, vault freely', drawn with ctx.fillText centred at x=270 in a 540px stage with no measureText check, so it runs off both sides.
- The injected ♫ Music chip is sitting squarely on the rival's HUD pill and hides it almost completely — you cannot read the opponent's fence count or vault state, which is the whole information the top bar exists to carry.
- The board is 81 flat rounded rectangles with a checkerboard alternation (BT.cellA / BT.cellB) so faint it is invisible at 375px, no wood, no grain, no light source. It is a spreadsheet, not a yard.
- The two pawns speak different visual languages: yours is a gold dotted ring, the rival's is a blue triangle inside a filled square. They do not share a silhouette, so they do not read as two of the same kind of thing racing.
- The bottom is a pile-up: the injected ♫ New song button has taken the leftmost dock slot and shoved VAULT and reset across, and under them the footer ('Fence Off 1.0 · 0 duel wins · daily streak 0') is .62rem inside a 0.694 stage — about 4.6 rendered pixels — and is clipped by the bottom edge. The 🐞 bug button and its × float over the board's lower-right rows.

**Background now:** CSS + canvas gradient only. Page: `radial-gradient(120% 80% at 50% 0%, #12151d 0%, #05070a 70%, #000 100%)`. The board is painted in canvas as a plain vertical linear gradient (`createLinearGradient(0,0,0,960)` between BT.bgA and BT.bgB) with rounded-rect fills over it. bgImageDecls 0; the only asset is og/card.jpg.

**Background wanted:** assets/bg-yard-540x960.jpg — a dusk garden yard seen from above at a slight angle: dark loam and clipped turf, a soft warm lantern glow from the top edge, deeper shadow at the bottom corners, painted so the 9x9 grid of cells reads as garden plots rather than table cells. Draw it as a canvas Image beneath the cell fills so the cell rounded rects become translucent turf tiles.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-yard-540x960.jpg` | 540x960 full-bleed, dusk garden yard from above, dark loam and turf, warm lantern glow at the top edge, corner vignette | replaces the canvas linear gradient so the board sits in a place instead of on a colour |
| `tile-turf-56x56.png` | 56x56 seamless, two variants (light/dark) of clipped turf with faint mowing direction, transparent PNG to multiply over the yard | gives the 81 identical flat rounded rects a visible, painted checker instead of an alternation you cannot see at 375px |
| `fence-post-h-120x28.png and fence-post-v-28x120.png` | 120x28 and 28x120 transparent, a painted two-rail wooden fence with warm rim light on the top rail and a soft shadow under it | replaces drawFenceBar's flat filled bar — the fences are the title mechanic and they are currently rectangles |
| `pawn-you-72x72.png and pawn-rival-72x72.png` | two 72x72 transparent pieces in ONE silhouette family — same rounded body, same base, one warm gold and one cool indigo, soft top light | replaces the gold dotted ring and the blue triangle-in-a-square, which currently read as two unrelated symbols rather than two racers |
| `gate-open-120x28.png` | 120x28 transparent, the fence art with its middle rail swung open, warm gold highlight on the hinge | the vault mechanic turns a fence into a gate and there is no art for that state at all |

**CSS to do:**
- canvas drawTitleHint / the status line at index.html:1242 — measure the string with ctx.measureText and shrink the font or wrap to two lines before drawing; 'ZEN, move either pawn, plant fences, vault freely' at 270 centre overflows 540 and clips at both edges
- #stage footer line (font-size:.62rem at line 98) — raise to at least 1rem stage px; .62rem inside the 0.694 stage renders at ~4.6px, and the line is also cut off by the bottom edge
- #hud .chip span (font-size:.7rem at line 49) — raise to .95rem; .7rem in a 0.694 stage is ~7.8 rendered px for the 'you · fences · vault' labels
- #hud — reserve the top-centre for the injected chip, or shift the two HUD pills down 56 stage px, so the ♫ Music chip stops covering the rival's pill
- #dock — the injected ♫ New song button is occupying the first dock slot; give the dock a fixed three-column grid with the injected button in its own row so VAULT and reset keep their positions
- .dbtn — add an inset top highlight and a warmer gold edge on .dbtn.lit so the selectable actions read as lit wood rather than flat panels

**Emoji as art:** Moderate — 43 emoji, 24 distinct, doing real UI duty: 🧱 is the fence counter icon in both HUD pills and on the FENCE button, ⌂ is home, ↷ is the vault icon, 🗓 the Daily Puzzle, ⚡ Blitz, 🌙 Zen Sandbox, 👕 Wardrobe, ✕ Duel Ladder. The two pawns are canvas shapes, not emoji, but they are shapes not art.

**Readability:** Two real failures. The footer at .62rem renders ~4.6px and is clipped at the bottom edge. The HUD sub-labels at .7rem render ~7.8px. Both are consequences of the 540x960 stage scaling 0.694 at 375 wide. Touch targets are fine (72px stage = ~50 rendered px, and the file documents this).

**Music chip:** YES, twice. The ♫ Music chip covers the rival's HUD pill on the play frame, hiding '▲ 🧱10 ↷1 rival · fences · vault' — the opponent's entire status. Separately the injected ♫ New song button has taken the leftmost slot of the bottom action dock, displacing VAULT and reset. The 🐞 feedback button and its × also float over the board's lower-right cells.

### Word Lightning
`bloomzap` · satellite · word · first committed 2026-07-07 · impact 4/5 · effort M
`satellites/bloomzap/index.html`

**Now:** Flat navy from top to bottom with barely visible diagonal rain hatching, a big yellow 'Word Lightning' wordmark with a soft glow, and small cream body copy. On play, three grey-navy rounded rows with an emoji cloud on each, a Back row, and then roughly 380px of completely empty navy below. Capture never reached the letter game (reached=no-more-controls), so this is the mode picker, not the playfield.

**Wrong with it:**
- The bottom 55% of the storm screen is empty. Three rows and a Back button sit crammed against the top edge, and everything beneath is bare navy with nothing in it. The horizon is literally empty.
- The three storm rows are indistinguishable as objects. Same grey-navy pill, same size, same left-aligned emoji, so Drizzle / Downpour / Tempest read as one repeated shape and the only escalation is in the words. A drizzle and a tempest should not have the same silhouette.
- The rain is not there. #rain is a 1px line at rgba(200,220,255,0.55) in a 22px cycle at 72deg, which at 375px is a faint scratch you have to look for, so a game called Word Lightning shows no weather. The 'Choose your storm' heading also sits flush against the very top of the stage with no margin above it.

**Background now:** Flat #0c1626 stage on a radial-gradient wrap (#12223a to #060a16 to #000), plus the near-invisible #rain repeating-linear-gradient and a full-screen #eaf2ff #flash on a 9-second lightning loop. The only image file in the whole folder is og/card.jpg (the share card).

**Background wanted:** It needs one. A painted 540x960 storm night: dark hedge and garden-wall silhouette across the bottom third so the empty band has content, sheeting rain, one fork of lightning behind cloud upper right, and a single warm lit cottage window on the horizon for the touch of gold. Near-black ground so the yellow wordmark and the cream copy still read on top.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `satellites/bloomzap/assets/bg-storm-540x960.jpg` | 540x960 full-bleed. Night garden under storm: near-black hedge and stone wall silhouette across the lower third, rain sheeting at roughly 72 degrees, one fork of lightning half-hidden behind cloud in the upper right, a single warm gold lit window on the horizon. Overall value dark enough that cream body text reads at 14px. | Replaces the flat navy plus invisible CSS hatching, and fills the 380px of empty navy under the mode rows. |
| `satellites/bloomzap/assets/storm-drizzle-96x96.png, storm-downpour-96x96.png, storm-tempest-96x96.png` | Three 96x96 transparent PNGs with escalating silhouettes, not just escalating weather: a small round cloud with three drops; a heavy wide cloud with sheeting rain and a lean; a black anvil cloud with a gold fork below it. Warm rim light on the cloud tops, painted, soft. | Replaces 💧 🌧️ ⛈️ and makes the three difficulty rows distinguishable at a glance instead of three identical pills. |
| `satellites/bloomzap/assets/tile-letter-96x96.png` | 96x96 transparent PNG, a letter tile plate: dark glass body, warm gold hairline rim, a soft specular sweep across the upper left, a slight bottom shadow lip. Second variant tile-letter-struck-96x96.png with a hot white-blue crackle for the zap state. | The .chip letter rack is currently flat #141c2c rectangles; a painted plate is what makes the core screen of the game look like anything. |

**CSS to do:**
- h2.sc-h on the storm screen: add margin-top:20px. It currently renders flush against the top edge of the 540x960 stage with zero breathing room.
- #s-mode .pad: add justify-content:center so the three rows and Back sit in the middle of the frame instead of jammed at the top with 380px of nothing beneath them.
- Every rule at 11px, 12px and 12.5px (the mode-row description lines, the footers): inside the 0.694-scaled stage these render at 7.6-8.7 real px. Raise the small-text floor to 16px CSS, which is 11 real px.
- #rain: widen the streak from 1px to 2px and add a second slower layer at rgba(200,220,255,0.22) on a 41px cycle, so the storm is actually visible before the painted background lands.
- .modecard rows: give each row a distinct left accent colour driven by its key (sprout / bud / bloom) so the three are not the same object three times.

**Emoji as art:** 💧 🌧️ ⛈️ are the three storm-mode icons, the only imagery on the mode screen. ⚡ appears 14 times including in the Play button label. ☀ 🌙 ☁ 🌩 🏅 🏆 🔊 🔇 🔤 🕵 carry the results screen, the sound toggle and the hint buttons. 78 emoji, 19 distinct, and one og/card.jpg is the entire painted art budget.

**Readability:** The mode-row description lines ('Strike 5 words · a passing shower') are 12.5px inside a stage scaled 0.694, so 8.7 real px, in dim grey on navy. The 11px footers render at 7.6 real px. Both are well under the 0.7rem floor. Row heights look above 48px real. The yellow-on-navy wordmark contrast is fine.

**Music chip:** Yes, and it is the worst in the batch. The chip covers the left half of the 'Choose your storm' heading so it reads '...our storm', and it covers the left half of the line beneath it. On boot it sits harmlessly top-left over empty navy, which is exactly the trap: it scored a boot layout that had nothing there.

### Hexa Hive
`hexa-hive` · satellite · puzzle · first committed 2026-07-20 · impact 4/5 · effort M
`satellites/hexa-hive/index.html`

**Now:** A gold-outlined honeycomb of near-black cells over a muddy olive field, with candy pink, yellow and orange stacked chips sitting in some cells. A flat pale-yellow disc hangs top-right and a darker green hill silhouette bands the bottom. Every mark on screen is a canvas fill: no image is loaded anywhere in the file.

**Wrong with it:**
- The sun is a hard-edged flat circle at 50% alpha (ctx.arc at VW*0.76,120,r46, index.html:571), clipped by the top-right frame edge, with no glow, no halation and no relationship to anything else in the scene.
- Sky and ground never meet through a transition: the hill polygon (index.html:574) is a flat 50%-alpha fill whose top edge cuts straight across the gradient at VH-150, so the horizon is a hard seam.
- The bee sits directly on top of a chip and covers its number, and the chips' candy pink/orange against olive green is outside the house register entirely: no cream, no sage, no rose, just saturated arcade colour on mud.
- All HUD text is literal system-ui (index.html:580-587) at 24/18/13/12px: the level title, habitat name, score and coach line are unstyled browser sans in a game whose fleet identity is serif and gold.

**Background now:** Canvas only. Per-habitat two-stop vertical gradient from a HABITATS table (Meadow #2a3a1e to #12180d), one flat orb circle, one flat ground polygon, all drawn in drawScene() at index.html:568-575. bgImageDecls 0, imgTags 0, assetFiles 1 (an og image). Behind the canvas the DOM shell is a radial gradient #1a1408 to #000.

**Background wanted:** Ten painted habitat backdrops, one per HABITATS row, at 540x960 full-bleed with the sun/moon and horizon baked in. The switch is already written (G.hab = HABITATS[(level-1)%len], index.html:281), so this is a drawImage swap inside drawScene, not new plumbing.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/hab-meadow-540x960.jpg, hab-desert, hab-rainforest, hab-jungle, hab-swamp, hab-mountains, hab-coast, hab-tundra, hab-orchard, hab-volcano` | 540x960 full-bleed JPG each, painterly, deep near-black at top and bottom so the gold comb and the HUD stay readable, sun or moon and a soft horizon painted in, warm rim light on the terrain. | Replaces the two-stop gradient plus flat orb plus flat hill polygon in drawScene(). One asset per HABITATS row; the level switcher already exists. |
| `assets/comb-frame-540x540.png` | 540x540 PNG, transparent, a painted wax comb frame with real wax thickness, warm gold rim light on the upper-left edge of each cell, empty cells dark honey rather than black. | Replaces hexPath + rgba(20,14,6,0.72) fill at index.html:591, which is the difference between wax and an outline. |
| `assets/chip-amber-128x128.png, chip-rose, chip-honey, chip-pollen` | 128x128 PNG each, transparent, one painted honeycomb chip seen slightly from above with a bevelled edge and a wax sheen; drawn repeatedly to build a stack. | Replaces the three-polygon flat stack at index.html:538-540 (dark base, flat body, one white 20% blob for a highlight). |
| `assets/bee-96x96.png` | 96x96 PNG, transparent, painted bee from above, soft wing blur, warm gold body, a readable silhouette at 24px. | Replaces the yellow ellipse with two dark rectangles for stripes at index.html:661-662. |

**CSS to do:**
- drawScene() index.html:571: the orb is a hard-edged flat disc at globalAlpha 0.5 clipped by the frame edge. Either paint it into the habitat art or give it a radial falloff and pull it fully inside the frame.
- drawScene() index.html:574: the ground polygon's top edge is a hard line. Add a 40px alpha fade or a haze band so terrain meets sky through a transition.
- HUD text at index.html:580-587 is system-ui. Set the fleet display face; the coach line at 12px (index.html:642) is under the 0.7rem floor, lift to 14px.
- The injected music chip lands on the level title (drawn at 16,32) and the habitat name (16,56). Move the HUD title block to centre or right, or reserve the top-left 120x60.
- The feedback bug button and its close X sit at roughly 28px diameter over the hill band, bottom right, under the 48px floor and unlabelled.

**Emoji as art:** The bee on the Play button and the honey pot in the zen score readout are emoji (index.html:102, 121, 140, 518, 587). The in-play bee is code-drawn but at ellipse-plus-two-rectangles fidelity it reads the same as an emoji. The ladybug feedback button is injected fleet furniture, not the game's.

**Readability:** The coach line 'tap a stack, then tap a comb cell' is 12px (0.75rem) grey #c8bfa0 over a 55%-black plate, borderline. The habitat name and score at 13px system-ui are small. The feedback bug and its X at roughly 28px are under the 48px touch floor. Chip numbers in dark #1a1206 on saturated chips read fine except where the bee covers one.

**Music chip:** Yes. The injected chip is anchored top-left in the play frame and covers the level title 'Hive 1' (drawn at 16,32) and the habitat name 'Meadow' (16,56) almost completely, and clips the left end of the quota progress bar at y=72. Both are live game state, not decoration.

**Looks broken** (confirmed on a second look, severity ugly)**:** Injected furniture, not the game's own code: the music chip fully covers the level number and habitat name in hexa-hive-2play.png. The only 404 is /music/v1/logic-den/midnight-puzzle-1.mp3, the expected missing-audio artefact, not reported. Nothing in the game's own rendering is broken.

### No Pain, No Gain
`no-pain-no-gain` · satellite · puzzle · first committed 2026-07-20 · impact 4/5 · effort M
`satellites/no-pain-no-gain/index.html`

**Now:** A flat brown box. A vertical gradient from #241a12 to #0e0a06 with a soft lamp glow at the top, two solid dark side walls and a lighter floor band. Six identical cream spike strips float in the middle third; the top quarter and the space above the floor are empty brown. A dark tray of emoji icons with gold coin prices runs along the bottom.

**Wrong with it:**
- Every trap on the board is the same spike strip at the same width and the same orientation, six times over - identical silhouette, no flip, no scale jitter, no motivated grouping. It reads as a stamp tool, not a course.
- The entire tool palette is emoji: red triangle Spikes, blue diamond Spring, gear Saw, bomb Bomb, spiral Fan, torch Laser, hammer Hammer, balloon Anti-Grav, high-voltage Tesla, red circle Portals, hole Black Hole (HAZTYPES, index.html:188-198) plus a wastebasket for Bin. The blue diamond and blue spiral are the loudest colours on the screen and neither is in the game's palette.
- Every surface meets another through a hard colour step. The side walls are fillRect(#3a2a18) and the ground is fillRect(#4a3418) with a single 8px band on top (lines 409-411) - no moulding, no cast shadow, no transition, and the arena's top quarter is dead empty brown above the lamp glow.
- The tray overflows 375px: the seventh tool is clipped mid-word to 'Ha' at the right edge and the only scroll affordance is a chevron drawn at x=VW-2 (line 553), half off-screen.

**Background now:** Canvas vertical gradient #241a12 to #1a130c to #0e0a06 (index.html:405), a radial lamp glow at the ceiling (line 407), then flat fillRects for the walls and floor (409-412). Page behind is radial-gradient(#201812, #08060a, #000) at line 37. No images: bgImageDecls 0, imgTags 0, no new Image() in the file.

**Background wanted:** bg-workshop-540x960.jpg - a painted claymation workshop wall: pinboard with pinned sketches, plasticine smears and thumbprints, a hanging worklamp that motivates the existing top glow, a scuffed plank floor with a real lip. Warm browns and clay greys, deep shadow at the frame edges.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-workshop-540x960.jpg` | 540x960 full-bleed painted claymation workshop: pinboard, plasticine smears, hanging worklamp top-centre, plank floor and skirting along the bottom quarter, vignetted corners | replaces the plain vertical gradient plus the three flat fillRects, and gives the traps a room to hang in |
| `traps-sheet-576x288.png` | 576x288 transparent sheet, 12 painted trap icons at 96x96, all in the game's gold / clay / sage palette with a warm rim light: spikes, spring, saw, bomb, fan, laser, hammer, balloon, tesla coil, portal, black hole, bin | replaces every emoji in HAZTYPES so the palette stops fighting the brown room |
| `haz-spikes-120x40.png and haz-spikes-b-120x40.png` | two 120x40 transparent painted spike strips on a clay base, one straight, one with a bent tooth and a chipped corner | two variants let the placement code alternate so six spikes in a frame stop reading as tiling |
| `clayton-sheet-384x256.png` | 384x256 transparent, the ragdoll's body parts at painting quality - head, torso blob, four limb segments - with visible thumbprint texture and a warm rim, drawn to match the existing joint radii | replaces the plain circle-and-blob ragdoll drawn at lines 479-488 so the star of the game is not three grey circles |

**CSS to do:**
- Canvas background at index.html:405-412 (drawRoom): replace the gradient and the three fillRects with a drawImage of bg-workshop, keeping the radial lamp glow at line 407 on top.
- drawTray at index.html:537: tool name labels are '700 10px system-ui' (0.625rem) and prices '800 11px' - both under the 0.7rem floor; raise to 13px and 12px and give the tray 8px more height.
- drawTray scroll affordance at line 553 draws a 22px chevron at x=VW-2, effectively off-screen - move it to VW-14 and add a 24px dark gradient fade over the clipped edge so the row visibly continues.
- The trap-selection highlight chipHi (line 537) is a 2px sage outline 86px tall inside a 96px chip - at 375px the selected tool is hard to spot against the unselected ones; fill it, do not just outline it.

**Emoji as art:** All 11 traps plus the Bin are emoji, drawn straight onto the canvas at 28px (drawTray, index.html:545) - this is the game's entire icon set. The coin price also uses the coin emoji. Nothing else in the game uses emoji; the traps and ragdoll are drawn.

**Readability:** Tool names at 10px and prices at 11px are both under the 0.7rem floor and are the two labels a player reads most. Unowned tools are drawn at globalAlpha 0.5, which pushes the grey name text down to roughly 2:1 contrast on the dark tray. Tray chips are 96px wide so touch is fine; the top-right DROP / Clear / Undo stack is comfortably 48px+.

**Music chip:** Yes. The chip parks top-left directly over the in-game HUD and covers the hamburger menu button and the coin counter - in the play frames you can see the coin pill peeking out from behind the chip's right edge, unreadable.

**Looks broken** (confirmed on a second look, severity ugly)**:** no-pain-no-gain-2play.png: the Music chip covers the top-left menu button and the coin total; the tray's seventh tool is clipped mid-word to 'Ha' at the right edge with the scroll chevron drawn half off-screen; the feedback ladybug badge and its close X sit on the playfield at about x=340,y=520. The boot menu itself is fine - flat, but intact.

### Aura Farm
`aura-farm` · satellite · creative · first committed 2026-08-15 · impact 4/5 · effort M
`satellites/aura-farm/index.html`

**Now:** Boot is a flat near-black page holding one rounded dark-violet card: a yellow-to-pink gradient wordmark AURA FARM in system sans, a saturated violet slab New Run button and two outline buttons. Nothing else is on screen: no art, no texture, no horizon. The play and later frames are not the game at all but the How to Farm rules wall, roughly 700 words of 15px body copy in a violet-black panel with emoji standing in for section icons.

**Wrong with it:**
- The New Run button is a full-width saturated violet slab, the loudest thing on the screen, and it is nowhere near the house palette. It reads as a web form submit button, not a garden.
- The wordmark gradient runs through four hues (yellow, orange, pink, lilac) in one word and nothing else on the screen picks any of them up, so the title floats unattached to its own card.
- The rules wall carries zero illustration across eight paragraphs, and its last line is cut mid-sentence by the New song chip, so the game's explanation screen is a plain text dump.

**Background now:** Flat colour only: html,body use background:var(--ink), a deep violet-black around #0d0a1a. Zero background-image declarations, zero image tags, no assets folder in satellites/aura-farm at all (only index.html, AUDIT-NOTES.md, test). The unseen canvas playfield paints procedurally in drawVenue (line 2245): a sky linear-gradient with a park day cycle, stars, a radial sun and three drifting ellipse clouds.

**Background wanted:** A painted 540x960 dusk-park plate behind the MENU and the rules sheet, so the title card sits somewhere instead of on a void: indigo sky, black tree silhouettes, one warm lamp, low fog band. The in-run canvas venues can stay procedural, they already have a day cycle.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-menu-540x960.jpg` | 540x960, full-bleed, painted dusk park: indigo sky graded to a warm horizon, black tree and lamp-post silhouettes, low fog band, motes in the air | Replaces the flat var(--ink) void behind the title card and the rules sheet; the game currently has no background image anywhere. |
| `logo-aurafarm-720x240.png` | 720x240, transparent, painted wordmark: cream letterforms with a warm gold rim light and a few drifting motes caught in the glow | Replaces the four-stop CSS gradient text that clashes with everything around it. |
| `icon-essence-128.png (x6: joy, hope, awe, sorrow, rage, dread)` | 128x128 each, transparent, painted glass-bead essence motes in the six existing emotion colours (#ffd75e, #8effc1, #9ef3ff, #6fa8ff, #ff6b52, #b06bff) | Replaces the emoji in EMOTIONS at index.html:295-301 that are used as the game's core currency icons. |
| `howto-plate-540x300.jpg` | 540x300, painted header band: a hand cupping a glowing mote over dark grass, warm rim light | Gives the rules wall an opening picture instead of starting on paragraph one. |

**CSS to do:**
- #title primary button and .act.rad/.act.bli/.act.harv/.act.harvB (index.html:110-113): drop the saturated violet and green fills for house glass, background:linear-gradient(180deg,rgba(122,179,86,.22),rgba(122,179,86,.06)); border:1px solid rgba(200,168,75,.5).
- The AURA FARM wordmark heading: replace the four-stop gradient with a two-stop cream-to-gold and add text-shadow:0 0 18px rgba(200,168,75,.35).
- .cpill (10.5px) and the .toast sub labels (9.5px): raise every CSS font-size floor to 11.5px, both are under 0.7rem.
- html,body (line 15): add the bg-menu plate as a fixed background-image under a linear-gradient scrim so the menu is not a flat void.

**Emoji as art:** Heavy: 168 emoji, 52 distinct. The six harvestable essences are emoji (icon:'sun','herb','sparkles','droplet','fire','web' at index.html:295-301), the five quality tiers are emoji (gem, star, sparkles, diamond at 285-289), and canvas fillText paints a lightning bolt over a charged soul (2708), a sleep glyph over a recovering one (2729) and anger/heart/warning glyphs over Mara (2773-2775). The rules wall uses scroll, heart, envelope and honey emoji as section bullets. The NPC bodies themselves are hand-drawn canvas figures, not emoji.

**Readability:** Body copy is fine at 15px, but .cpill contract pills sit at 10.5px and toast/sub labels at 9.5px, both under the 0.7rem floor. Touch targets are correct: .mbtn and .abtn are 48-50px and .cpill carries min-height:48px.

**Music chip:** Yes, on both later frames. The top-left Music chip covers the first visible line of the rules copy, and the bottom-left New song chip covers the last line ("When a person's wells run dry, the bones are..."). At boot the music unlock sheet covers the Records & Relics button and everything under it.

### Tomato Man
`tomato-man` · satellite · action · first committed 2026-08-18 · impact 4/5 · effort M
`satellites/tomato-man/index.html`

**Now:** Boot is a full-screen How to Play wall on a flat navy vertical gradient: cream bold headline, then four rounded translucent cards each with a large emoji in a rounded square at left (sun, white circle, joystick, dash puff) and two lines of copy. The play and later frames are both the same 'Choose a World' menu - five stacked rounded rectangles, each a slightly different faint tint (teal-brown, grey, teal, plum, near-black), each with a number, a name, one line of flavour and a lock glyph. No shot in this batch shows the actual canvas playfield.

**Wrong with it:**
- The five world cards are five identical rounded rectangles at identical size with the same 2px white-18-percent border; only a faint tint separates 'Morning Tide' from 'Eclipse'. Nothing in a card shows the world it names - 'Reflective water, wilting shade' and 'Wind and a reversing sun' are described in words and shown with nothing at all.
- Every icon in both frames is an emoji: sun, white circle, joystick and dash puff on the How to Play cards, a padlock on four world rows, a leaf for the currency, a star and a shell in the progress line. The plain white circle standing in for 'shade' is the clearest tell - a Unicode glyph is doing the job of the single most important object in the game.
- The background is one flat navy gradient (#13243f to #0b1626) behind both screens - no horizon, no sand, no sun, nothing of the beach the game is about. With the cream system-font headline on top, the front door reads as a settings panel, and the game's own locked palette (Beach #F4DCA6, Coral #FF8A5C, Beam Yellow #FFD23F) never appears anywhere in the frame.

**Background now:** Flat #0b1626 page ground with .overlay painting linear-gradient(180deg, var(--sky1) #13243f, var(--sky2) #0b1626) on every menu screen (index.html:67). bgImageDecls is 0. In-game (not visible in any shot here) the canvas paints its own sand linear gradient plus a radial sun glow procedurally at index.html:972 and :982.

**Background wanted:** A painted beach plate behind the menus: low horizon, sun-bleached sand, and one long cast shadow crossing the frame diagonally so the menu screen itself teaches the mechanic before the player has read a word. In the locked ART-NEEDED palette, under a dark scrim so the cream type stays readable.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `art/ui/logo.png` | 1024x512 transparent PNG. Painted TOMATO MAN wordmark, chunky gouache letterforms, thick Deep Navy #23314A outline, Tomato Red #E8332A fill, one warm sun glint on the upper-left of the letters. | The code already asks for this exact path (ASSET_PATHS.logo, index.html:437) and gets a 404 today. Replaces a plain system-font title. |
| `art/hero/tomato_body.png` | 512x512 transparent PNG, hero body at 4x in-game size, thick navy outline, single warm sun key, soft cel shadow, anchor at the sprite centre so the swept-shadow geometry still lines up. | Already requested by ASSET_PATHS.hero_body (index.html:436) and 404ing; the engine falls back to a drawn circle with two dots for eyes. |
| `art/ui/world_thumb_morning-tide.png (plus midday-blaze, tide-pools, dunes-at-dusk, eclipse)` | 5 files, 320x180 transparent PNG. One painted vignette per world: long dawn shadows, white-hot noon sand, reflective pools under wilting shade, wind streaks over dunes, the Angry Sun in eclipse. | Gives each world card something to show instead of a sentence, and breaks the five-identical-rectangles silhouette on the Choose a World screen. |
| `art/ui/icon_sun.png, icon_shade.png, icon_move.png, icon_dash.png` | 4 files, 128x128 transparent PNG, painted in the locked palette with the navy ink outline. | Replaces the sun / white-circle / joystick / dash emoji on the four How to Play cards. The shade icon in particular must read as a cast shadow rather than a white dot. |
| `art/ui/lock.png` | 96x96 transparent PNG, small painted padlock in Driftwood #C98B53 over navy ink. | Replaces the padlock emoji repeated on four locked world rows. |

**CSS to do:**
- .iconbtn width and height 40px to 48px (index.html:110) - the back button appears on every menu screen and is under the 48px touch floor.
- .card (the five world rows) - add min-height:96px and display:grid; grid-template-columns:96px 1fr so each row has a slot for a world thumbnail on the left.
- .overlay (index.html:67) - swap the flat linear-gradient(180deg,var(--sky1),var(--sky2)) for url(art/ui/bg_menu.jpg) center/cover with a rgba(11,22,38,.62) scrim over it.
- .badge font-size 11px to 12px (index.html:120) - 0.69rem, under the floor.

**Emoji as art:** Heavy: 87 emoji, 31 distinct. Sun, white circle, joystick and dash puff are the four icons on the How to Play cards; a padlock marks four locked worlds; a leaf is the currency in the top-right wallet; star and shell are the per-world progress marks; a tomato is the favicon; cart and question mark label the title-screen buttons.

**Readability:** Body copy is fine - cream on navy at 15-18px. Faults: the .iconbtn back button is 40x40, under the 48px touch floor, and it is on every menu screen; .badge and several menu strings are 11px (0.69rem); the '0/5 check star 0' progress line on the Morning Tide card is small gold on a light tint at the card's right edge and is the least legible thing in either frame.

### Root Weave
`root-weave` · satellite · puzzle · first committed 2026-07-10 · impact 3/5 · effort S
`satellites/root-weave/index.html`

**Now:** All three frames show the same screen: the 'How Root Weave works' wall. Gold 24px heading, seven rows of 14px cream body copy each led by a raw emoji in a 34px left gutter, a Back button, then roughly 200px of dead flat black to the bottom edge. The painted playfield was never photographed.

**Wrong with it:**
- index.html:948 force-shows s-how 80ms after load on first visit, so a new player's first screen is seven paragraphs of body text on flat black. The game ships 57 painted assets (4.8MB of bulbs, vines, blooms, backgrounds) and none of them appear in the first frame a player sees.
- The bottom ~200px under the Back button is dead flat black. The screen stops halfway and the rest is empty.
- The seven row icons are raw emoji (target, pointing hand, jigsaw, knot, blossom, candle, calendar). The knot and candle glyphs render flat and system-coloured and clash directly with the painted sage-and-gold look the game already owns on its canvas.
- .screen carries only a flat linear-gradient while assets/backgrounds/bg_midnight.jpg sits in the repo and is already drawn full-bleed on the canvas at index.html:654 - the menus and the playfield look like two different games.

**Background now:** Flat linear-gradient #0e140d to #0b0f0b on .screen; no image on any HTML screen (bgImageDecls 0, imgTags 0). The canvas, which the shots never reached, does draw assets/backgrounds/bg_midnight.jpg full-bleed via rwImg at index.html:653-654.

**Background wanted:** None needed as new art. Reuse the existing assets/backgrounds/bg_midnight.jpg behind .screen at 55-65% darkness so the How wall, title and wardrobe sit in the same soil as the board.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `how-icon-goal-64x64.png` | 64x64 transparent, painted sage-and-gold line art of a bulb at the centre of a clean weave | Replaces the target emoji in the How gutter with something in the game's own palette. |
| `how-icon-drag-64x64.png` | 64x64 transparent, a hand drawing a bulb along a glowing root | Replaces the pointing-hand emoji. |
| `how-icon-taproot-64x64.png` | 64x64 transparent, an anchored bulb with a burr knot, copper and sage | Replaces the knot emoji, which renders as a flat system glyph and is the worst offender in the gutter. |
| `how-icon-bloom-64x64.png` | 64x64 transparent, a root mandala opening into a rose bloom | Replaces the blossom emoji and previews the actual keepsake art. |
| `how-icon-candle-64x64.png` | 64x64 transparent, a warm nudge candle with a soft gold halo | Replaces the candle emoji, which is the second flat glyph in the column. |
| `how-icon-daily-64x64.png` | 64x64 transparent, a dew-marked leaf calendar in sage and gold | Replaces the calendar emoji and finishes the set so the gutter reads as one painted column. |

**CSS to do:**
- .screen (index.html:65): add url(assets/backgrounds/bg_midnight.jpg) center/cover under the existing linear-gradient so the menus and How wall share the playfield's soil.
- #s-how .pad: the wall runs seven rows then stops with ~200px of black below. Either centre the block vertically or pin #how-back to the bottom of the screen so the frame does not end in empty space.
- The first-run block at index.html:948 (show('s-how') on an 80ms timeout): gate it behind the first Play tap, or present it as a sheet over the live board, so the first frame a player sees is the painted garden rather than a text wall.
- .helprow .hi (34px wide, 22px font): once the painted icons land, set width:40px and background-size:32px so they read at phone size.

**Emoji as art:** The entire How-screen icon column is emoji (target, pointing hand, jigsaw, knot, blossom, candle, calendar), and the title-screen mode buttons carry emoji too. The playfield itself is fully painted - bulbs, vines, gnarl, blooms, backgrounds - via the rwImg loader at index.html:586.

**Readability:** Body copy at 14px cream, line-height 1.45, on near-black reads fine. The inline cross marker the copy calls out is only 14px, small for the thing it is teaching. Back button is a full-width 48px+ target. Heading 24px gold is clear.

### Sproing
`sproing` · satellite · action · first committed 2026-07-05 · impact 3/5 · effort S
`satellites/sproing/index.html`

**Now:** Boot is a flat near-black screen with a green 'Sproing' wordmark, a small cartoon avocado face inside a green ring, a bright green PLAY slab and two small chips, with the bottom half taken by an injected gold-bordered music unlock drawer. The captured play frame is not the game: it is the Draw Your Climber paint tool, a large cream rectangle with a single black dot in it, two rows of emoji tool chips, a 19-swatch colour grid and a green Save & Equip slab. The actual climbing playfield was never reached.

**Wrong with it:**
- The title screen has no background at all. body is background:#000 (index.html:38) and the .screen layers add nothing, so the wordmark, the mascot and the buttons float on flat black with hard edges and no vignette, no ground, no horizon. This is the worse for the fact that assets/bg/bg_garden_bed.jpg already exists in the repo and is never drawn behind the menu.
- The tool row on the draw screen is emoji doing the job of icons: a pencil, a paint bucket, a bottle, a wastebasket and two arrow glyphs, each in a 44px dark chip. They are five different art styles from the system font, they do not match the green-and-cream house palette, and they are the only iconography the player sees on that screen.
- The paint canvas is a raw cream rectangle butted straight against black with a 1px hard edge and no frame, no paper texture and no drop shadow, so it reads as an empty form field rather than a sketchbook page. The single black dot in the middle is the default brush preview and reads as a stray mark.
- The ladybug feedback button at the right edge is clipped half off-screen and sits on the right end of the DRAW YOUR CLIMBER button.

**Background now:** Menu and draw screens: flat #000 from html,body (index.html:38) with .screen adding no background. The PLAYFIELD is different and is the one place in this batch with real painted art: an ART loader at index.html:338-368 cross-fades six full-bleed JPGs by altitude (assets/bg/bg_garden_bed.jpg, bg_hedgerow, bg_canopy, bg_upper_air, bg_clouds, bg_starfield) and drawArt() paints 11 platform PNGs, 5 critter PNGs, 8 powerup PNGs and 4 pickup PNGs, 37 files and 3.5MB total. None of that appears in either captured frame.

**Background wanted:** bg-menu-375x667.jpg for the title and shell screens: reuse the look of the existing assets/bg/bg_garden_bed.jpg (warm night garden bed, dew-lit leaves, soft depth) darkened and blurred at the bottom so the button stack still reads over it. This is the cheapest win in the batch because the painted asset already exists and only needs a menu-safe variant plus a CSS background-image on .screen.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-menu-375x667.jpg` | 375x667 at 1x, export 1125x2001 at 3x, full-bleed. A darkened, softly blurred crop of the existing assets/bg/bg_garden_bed.jpg with a warm rim of dew light at the top and a deep near-black wash across the bottom 45% so the PLAY slab and chips stay legible. | The title screen currently paints flat #000 (index.html:38) while six painted backgrounds sit unused in assets/bg/. |
| `sproing-tools-sheet-192.png` | One sheet, eight cells at 192x192, transparent PNG. Brush small, brush large, brush dot, eraser, fill bucket, eyedropper, undo arrow, trash. All painted in the same warm-cream-on-sage house palette with a single light source from upper left. | Replaces the six mismatched system emoji standing in for the drawing tools, the only iconography on the Draw Your Climber screen. |
| `sketchbook-frame-343x260.png` | 343x260 at 1x, export 1029x780 at 3x, transparent PNG with a 16px 9-slice border. A pinned sketchbook page: torn top edge, faint paper tooth, a soft cast shadow on all four sides, corner tape. | Frames the raw cream paint rectangle so it reads as a sketchbook page rather than an empty form field with a hard 1px edge. |
| `sproing-mascot-320.png` | 320x320 transparent PNG. The avocado climber painted properly: warm rim light on the upper left, soft ambient occlusion where the pit meets the flesh, a hint of a sproing spring under it. | The current mascot is a flat two-tone shape in a plain green ring and it is the only character art on the title screen. |

**CSS to do:**
- html,body (index.html:38): swap background:#000 for the menu plate, e.g. background:#0d100c url(assets/bg/bg-menu-375x667.jpg) center/cover no-repeat, and add a bottom-weighted linear-gradient scrim on .screen so the buttons keep their contrast.
- .screen (index.html:48): currently transparent over black. Give it a subtle radial vignette (radial-gradient(120% 80% at 50% 0%, transparent, rgba(0,0,0,.55))) so the title and mascot sit in a pool of light instead of on a void.
- The paint canvas element on the Draw Your Climber screen: add border-radius:10px and box-shadow:0 8px 26px rgba(0,0,0,.6), 0 0 0 1px rgba(200,168,75,.35) so the cream page has an edge treatment instead of butting into black.
- The tool chips row: they measure roughly 44px square in the 375px frame, under the 48px floor. Raise to 48px minimum height and width.
- Font sizes 8px and 9px appear in the stylesheet (the version stamp 'Sproing v1.0.0' renders at the bottom-left in a dark green that is barely visible). Raise every sub-11.2px rule to 12px or drop the label.
- The ladybug feedback button: it is clipped by the right viewport edge and overlaps the DRAW YOUR CLIMBER button. Pin it to right:12px with a 48px box entirely inside the frame.

**Emoji as art:** Heavy on the shell screens. 99 emoji across 40 distinct glyphs. On the captured Draw Your Climber screen the entire tool row is emoji: pencil, paint bucket, bottle, wastebasket plus two arrow glyphs, and the footer chips use a folder and a sparkle. The title screen uses a shop bag and a gear emoji as the Shop and Settings icons. The playfield itself does NOT rely on emoji: drawArt() paints real PNG sprites with procedural fallbacks (index.html:1598-1651).

**Readability:** The stylesheet carries 8px and 9px rules; the version stamp at bottom-left renders in dark green on near-black and is effectively invisible. The tool chips measure about 44px square, under the 48px floor. The colour swatches are around 40px and sit in a tight grid with roughly 6px gutters, so a thumb will hit two. The Save & Equip and PLAY slabs are comfortably over 48px.

**Music chip:** Two injected elements collide on boot. The gold-bordered music unlock drawer ('CONGRATULATIONS, YOU UNLOCKED A SONG / Springs & Hops') covers the bottom half of the title screen, clipping the Shop and Settings buttons at their top edge and hiding everything below them. It is dismissible via the ▼ chevron, so this is furniture rather than a hard break, but it lands on first boot before the player has seen the menu. Separately the ladybug feedback button at the right edge overlaps the right end of the DRAW YOUR CLIMBER button and is clipped half off-screen. On the draw screen the '♫ Music' chip at top-left sits over a dark rounded plate that shows below its edge.

---

## DECENT — deliberate but thin  (44)

### Tarot Run
`tarot-run` · satellite · card · first committed 2026-08-18 · **workbench-gated** · impact 5/5 · effort L
`satellites/tarot-run/index.html`

**Now:** The title screen is genuinely composed: a deep teal stage with faint vertical curtain stripes, a gold-ringed oval seal holding a four-point star, 'Tarot Run' set in a real display serif over the italic line 'a reading of blades', then a stack of gold-outlined buttons on a thin stat footer. The run map behind it is the opposite - a near-black void with one narrow column of 58px grey circles and tiny italic labels, no backdrop, no floor, no light source.

**Wrong with it:**
- -2play: the LEAVE button in the map header is sliced by the right edge of the phone - only 'LEAV' and half an E are on screen. The three-line title 'Act 1/3 - The Undercroft - Floor 1/15' expands the flex row and #btn-flee-map has no flex-shrink guard, so it is pushed off the 375px viewport.
- -2play: every room node shares one silhouette - a 58px thin-ringed circle with a faint centre glyph. A Chest, The Merchant, The Sleeper and The Reflection read as the same button; only a desaturated hue separates them and every hue is near-grey on near-black. Nothing tells the eye which node is the live choice from a metre away.
- -2play: the node column is a ~230px ribbon centred in a 375px black frame with ~70px of dead black on each side and no backdrop at all, and the bottom row of nodes plus their 'A Mystery' labels are cut flat by the viewport with no fade to say the list continues.
- -1boot: the title seal is a CSS gradient circle with a text glyph in it, not art. art-slots/title-mark.png 404s on every boot, and so does art-slots/enemy-?.png - the loader fires on the placeholder slot before an enemy is assigned, so it asks for a file with a literal question mark in the name.

**Background now:** Title screen: layered radial gradients (warm footlight glow at 50% 100%, cold teal wash at 50% 0%) over a linear gradient of deep stage teals, plus two skewed pseudo-element 'curtains' with 1px gold inner edges. Map screen: the same body gradient with nothing painted on top, so it reads as flat near-black (#0d2127-ish). 43 gradients, 1 background-image declaration, 0 image files.

**Background wanted:** A painted theatrical backdrop per act, 1080x1920 full-bleed: velvet stage curtains framing a lit proscenium behind the title, and a separate painted Undercroft wall behind the run map - wet stone, one low lamp, dust in the beam - held at about 25% brightness so the gold nodes still lead the eye. Three acts means three backdrops, and the run then visibly descends instead of staying in the same black room for 45 floors.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `art-slots/title-mark.png` | 1024x1024 PNG, transparent background. Nine-pointed ritual seal with wand, cup, sword and pentacle at the compass points, rose gold on nothing, Art Nouveau line weight. | Replaces the CSS text glyph currently sitting in the 220px gold circle on the title screen. The loader at index.html:4747 already scans [data-art-slot] and requests this exact path - it 404s today. |
| `art-slots/enemy-spectre.png, -jackal, -echoman, -duelist, -reflection, -sleeper, -gilded, -archivist, -twins, -oracle, -crown` | 11 files, 1024x1024 PNG each, square crop, painted figure on deep teal velvet, warm rim light from below (footlights). | Fills the 175px .enemy-portrait, which today draws a 78px gold letter glyph from attr(data-glyph). ASSET_MANIFEST.json already names all 11 slot ids; art-slots/ contains only .gitkeep. |
| `bg-act1-undercroft-1080x1920.jpg (plus act2, act3)` | 1080x1920 JPG, full-bleed, painted wet-stone crypt wall with one lamp and a dust beam, values held dark so gold UI reads on top. | Gives #map-screen a floor and a horizon. Right now the run map is a flat black field with a column of circles floating in it. |
| `art-slots/node-medallions-6x256.png` | One sheet, 6 cells at 256x256, transparent: combat blade, elite crown, event moon, treasure chest, rest cup, boss skull. Painted brass medallions, each a distinct outline. | Breaks the identical-circle problem on the map - six room types currently share one 58px ring and differ only by a washed-out border colour. |
| `art-slots/card-wands-1.png through card-*-* (78 files)` | 512x720 PNG each, 5:7, cream parchment field with the Art Nouveau subject centred; suit border stays in code. | The card faces. Today each card shows a 30px gold glyph in a 56px gradient strip - this is the bulk of the manifest and the reason a card game reads as a spreadsheet. |

**CSS to do:**
- #btn-flee-map: add flex:0 0 auto, and give .map-title min-width:0 with white-space:nowrap and text-overflow:ellipsis, so the three-line floor title stops shoving the LEAVE button off the right edge at 375px.
- .room-label: font-size 11px italic in a dim cream on near-black is under the 0.7rem floor and nearly invisible. Raise to 12.5px, use var(--card-cream) at 0.85 opacity, add text-shadow:0 1px 3px rgba(0,0,0,0.9).
- .fate-ribbon: font-size 8px - raise to 10px with letter-spacing 0.08em, or replace the word with an icon.
- .card-name: font-size 10px uppercase on the card face - raise to 12px and reduce letter-spacing to keep the line count.
- .map-body: add mask-image:linear-gradient(to top, transparent 0, #000 40px) so the clipped bottom row of nodes reads as 'more below' rather than a hard cut at the viewport.
- .map-rooms: raise gap from 14px to 22px and widen .map-row gap past 24px - the column currently uses 230px of a 375px screen and leaves the rest empty.

**Emoji as art:** The whole game runs on glyphs standing in for the 90 painted slots the manifest specifies: the title seal is a text star at 88px, every enemy portrait is attr(data-glyph) at 78px, every card face is a glyph at 30px inside a 56px gradient strip, and the map nodes are moon, snowflake, scales, diamond, cross and skull glyphs at 22px. 158 emoji/glyph instances, 60 distinct, across the file.

**Readability:** Sixteen font-size declarations sit under the 11.2px (0.7rem) floor - four at 8px, three at 9px, three at 10px, six at 11px. In -2play the room labels (11px italic, dim cream on near-black) and the 10px 'you are here' marker are the worst; I had to open the 2x frame to read 'The Reversed Twins'. Node hit areas are 58px so touch targets are fine, except .room-node.completed which scales to 43px (pointer-events:none, so not currently a tap fault).

**A "looks broken" claim here was refuted on a second look.** The central claim does not survive looking at the pixels. Claim: "the LEAVE button in the map header is clipped by the right edge of the 375px viewport... only 'LEAV' and half an E are on screen." I cropped that exact corner out of both tarot-run-2play.png at 2x (750x1334, region x560-750) and at 1x (375x667, region x280-375) and magnified 4x/8x. The LEAVE button is entirely on screen: all four si

### Glyph Forge
`glyph-forge` · satellite · puzzle · first committed 2026-08-18 · **workbench-gated** · impact 5/5 · effort L
`satellites/glyph-forge/index.html`

**Now:** Gold-on-near-black illuminated-manuscript deck builder with a genuinely strong typographic identity (Cinzel Decorative title, Cormorant Garamond body, IM Fell English italics, JetBrains Mono HUD). Play frame: a HUD of glyph icons, three dashed empty stage sockets in the middle, and a row of vellum rune cards along the bottom whose faces are single Unicode characters at 32px. Boot frame was captured behind the Codex modal so the menu is dimmed by design, not by a contrast fault.

**Wrong with it:**
- The fifth hand card (EMBER) wraps onto a second row that the cast bar guillotines: the word EMBER is sliced horizontally through the middle. Cause is the phone block at index.html:876 setting .hand-grid to repeat(4,1fr) while .hand-area has no height for a second row.
- There is no enemy on screen. The boss is Chaos Cinder 8/8 but all the frame shows is the truncated word 'Chaos' plus five small red diamond pips in an otherwise empty band; art-slots/enemy-cinder.png 404s so the 180px portrait circle the manifest specifies never appears.
- The three stage sockets in the dead centre of the screen, where the whole game happens, are dashed 1px grey rectangles with faint roman numerals: the focal point of the layout is a wireframe.
- A green 'dev' pill is pinned to the mid-left edge and sits on top of the ROLL card's top-left corner and the 'Hand' row label.

**Background now:** Flat --ink-deep near-black plus two barely-visible radial gradients (gold 8% at top, violet 6% at bottom, index.html:53-58) and a grain texture at 0.5 opacity in overlay blend. bgImageDecls: 0. No painted background anywhere.

**Background wanted:** A full-bleed painted scriptorium ground: an open codex page on a dark oak desk, candle rim light from the upper left falling off into black at the edges so the gold UI still floats. It is a game about inscribing a page and the page is missing.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `art-slots/enemy-cinder.png (+7 siblings, filenames already listed in ASSET_MANIFEST.json 'enemies')` | 1024x1024 PNG, dark background, masked into a 180px circle. Baroque chiaroscuro portrait, faceless or partly obscured, like a portrait in a haunted library. | Replaces nothing at all: the slot 404s today so the enemy is five red diamonds and one truncated word. Highest single lift in the game. |
| `art-slots/rune-roll.png, rune-hollow.png, rune-gust.png, rune-drop.png, rune-ember.png (+25 more, all named in ASSET_MANIFEST.json)` | 512x512 PNG, transparent or dark ground, renders inside a 5:7 card at roughly 80x110. One illuminated sigil on aged parchment, glowing edge, distinct silhouette at thumbnail size. | Replaces the single Unicode glyph printed by .rune-art.placeholder::after (content: attr(data-glyph), 32px). The card frames are already good; only the faces are stand-ins. |
| `art-slots/title-mark.png` | 1024x1024 PNG with transparency, must read inside a circular gold frame at 200x200. Symmetrical ritual mark. | 404s today; the title screen is type only. |
| `art-slots/bg-scriptorium-540x960.jpg` | 540x960 full-bleed, painted desk and open codex page, candlelight from upper left, edges falling to near-black so gold UI stays legible. | Replaces two faint radial gradients. Not in the existing manifest; add it. |

**CSS to do:**
- .hand-grid in the phone media block (index.html:876) is repeat(4,1fr) while the hand holds 5 cards, so row 2 is clipped by .cast-row. Make .hand-grid a horizontally scrolling flex row with scroll-snap, or give .hand-area a min-height for two rows.
- .rune-stats (10px), .tm-chip (10px), .mseal (10px) and .hud-depth (10px) are all 0.625rem, under the 0.7rem floor. Lift each to 12px.
- The circular info dots after each status row (relics, prophecy, The Clockwork Vow, The True Name) render at roughly 13px. Give them a 48x48 hit box with transparent padding.
- .stage-slot: swap the dashed 1px border for a double gold rule plus an inset shadow so the three sockets read as inked recesses rather than a wireframe placeholder.
- Move the #dev pill off the mid-left edge (it lands on the ROLL card) into the top bar or behind a long press.
- index.html:1350 has a literal data-art-slot="enemy-{id}" in static HTML, producing a 404 for enemy-%7Bid%7D.png every boot. Delete the attribute; line 3247 sets it correctly at runtime.

**Emoji as art:** The entire HUD icon set is text glyphs, 38 distinct across the file: crossed-swords for depth, heart for HP, sparkle for multiplier, diamond/star/hexagon/circle-slash for run modifiers, plus a circled dot as the help affordance on every row. Every rune card face is one Unicode character (data-glyph) standing in for a 512x512 painting.

**Readability:** Four separate 10px (0.625rem) styles in the HUD and title meta. The circled-dot help affordances on the status rows measure about 13px against a 48px floor. Everything else (17px card names, 13px stats after the phone bump) is fine.

**Looks broken** (confirmed on a second look, severity ugly)**:** Game's own fault, not injected furniture: the 5th hand card is sliced through the word EMBER by the CODEX/INSCRIBE bar, clearly visible in glyph-forge-2play.png and confirmed at 2x. Separately, six real 404s under the game's own folder (art-slots/title-mark.png, enemy-cinder.png, enemy-%7Bid%7D.png, rune-roll.png, rune-hollow.png, rune-gust.png) mean the code asks for art nobody painted; art-slots/ holds only icon-192.png and icon-512.png.

### Dewball
`dewball` · satellite · action · first committed 2026-07-12 · impact 5/5 · effort M
`satellites/dewball/index.html`

**Now:** A real 3D katamari scene: you look down on a red-and-cream checkered picnic blanket with a shaded ball in the middle and dozens of orange cubes (crumbs) scattered over it, a brown post at the top-left, and everything past the middle distance dissolving into a bleached orange-pink fog. HUD is a centred cream '4.0 cm' with a gold 'GOAL 24 cm' and a thin progress bar on a dark translucent plate, a timer and pause bars top-right. The boot screen is a horizontal card rail where each world is represented by a single emoji.

**Wrong with it:**
- The picnic blanket is an untextured two-colour checker: red and cream squares meet on a razor line with no hem, no weave, no seam and no shading, so 'a giant picnic blanket' renders as a chess floor. The code already asks for the texture and gets nothing: 404 /satellites/dewball/assets/ground-w1.jpg, from the art-pack hook at index.html:3222-3225, and satellites/dewball/assets/ does not exist.
- The frame is bleached. The w1 fog (0xdf9a68 at density 0.000244, index.html:2133) plus the hemisphere light pushes the whole top third to near-white pink, so the horizon is an empty milk band with no sky, no landmark and nothing to roll toward; the brown post at top-left just dissolves into it with no base and no shadow.
- Silhouette repetition with no motivated groups in this frame: every collectible on screen is the same orange cube at three sizes, sprinkled evenly across both halves of the blanket. The code's own scatter comment (index.html:3227-3234) says props are supposed to come in clusters and trails; the shipping frame shows dust, not a spill by a plate or a trail leading off the blanket edge.

**Background now:** three.js. Sky is a three-stop gradient from W.sky (w1 #f2d0a0 / #e8955a / #6e4468), fog 0xdf9a68 at 0.000244, ground is a procedurally generated CanvasTexture checker with RepeatWrapping, props are merged instanced boxes and spheres with vertex colours. No image files at all: bgImageDecls 0, imgTags 0, and the assets/ folder the code fetches from is absent.

**Background wanted:** Painted seamless ground per world through the hook that already exists, plus a painted sky plate so the horizon has a picture in it instead of fog. Priority is w1 Crumb Country (the first world every player sees) then w2 Toybox Peaks.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/ground-w1.jpg` | 1024x1024 seamless, red and cream gingham with visible thread weave, a soft wine ring, a scatter of crumbs baked in, gentle cloth folds; tiles with itself edge to edge | the exact file the game already requests and 404s; it drops in with zero code change at index.html:3225 and turns the chessboard into fabric |
| `assets/ground-w2.jpg through assets/ground-w7.jpg` | 1024x1024 seamless each: playroom carpet loops, night-garden soil and moss, market cobbles, wet dusk sand with ripples, meadow grass, and a mixed world tile | same hook, six more worlds; each is currently a flat two-colour procedural checker in a different palette |
| `assets/sky-w1.jpg` | 2048x1024 equirectangular, late-afternoon picnic sky, warm cumulus, a hint of tree canopy at the bottom edge; needs a three-line loader mirroring the ground hook | replaces the blown-out empty fog band that fills the top third of every frame |
| `assets/card-w1.jpg through card-w7.jpg` | 320x180 each, a painted vignette of that world (the blanket corner, the toybox floor, the night garden), warm rim light, big readable shape | replaces the 2rem emoji that is the only picture on the level-select card today (.wcard .wemoji at index.html:174) |

**CSS to do:**
- #hudWorld (index.html:41): font-size .62rem is under the 0.7rem floor and the colour #8a9178 at opacity .85 lands on a bright red blanket square. Raise to .72rem, colour #e8dcc8, and give it a plate: background:rgba(7,9,10,.45); padding:3px 10px; border-radius:10px.
- #hudSizeWrap (index.html:46): it is centred with no side clearance and the injected music chip touches its left rounded corner. Add max-width:calc(100% - 130px) and top:calc(52px + env(safe-area-inset-top,0px)) so nothing can sit on it.
- .wcard .wemoji (index.html:174): swap the emoji span for an <img src='assets/card-w1.jpg'> at 100% width / 54px height with border-radius:10px, keeping the emoji as the onerror fallback.
- The bottom-right circular control in the play frame is an unlabeled dark disc holding a tiny mark I cannot resolve at 375 wide; give it the same treatment as #pauseBtn (48x48, cream at .8, text-shadow 0 1px 6px rgba(0,0,0,.9)) or a real icon.

**Emoji as art:** Yes, heavily on the level select: every one of the seven worlds is represented by a single 2rem emoji (basket, teddy bear, moon, lantern, wave, globe, zzz) as its entire card image. 148 emoji across 21 distinct glyphs in the file. The playfield itself is 3D geometry, no emoji.

**Readability:** 'CRUMB COUNTRY' bottom-left is .62rem sage at 85% opacity on a bright red ground, the lowest-contrast text in the frame and effectively unreadable at 375 wide. 'GOAL 24 cm' is 0.7rem gold on a translucent plate, right on the floor and only just legible. The pause control is a correct 48x48; the unlabeled bottom-right disc looks close to 44px.

**Music chip:** The injected chip's dark pill overlaps the left rounded corner of the #hudSizeWrap distance plate on the play screen. On the boot screen it is worse: it sits directly on the 'D' of the 'Dewball' title.

### Sweet Spot
`sweet-spot` · satellite · action · first committed 2026-08-18 · impact 5/5 · effort M
`satellites/sweet-spot/index.html`

**Now:** A flat terracotta clay court seen end-on: a 160deg orange gradient with four white 3px hairlines forming a court box, a chunky Archivo Black 'SWEET SPOT' wordmark top-left, a score top-right, and a black lozenge timing bar with a green/gold sweet zone near the bottom. Deliberate and coherent, but there is not one painted pixel in it, and the middle 55% of the frame (y=200 to y=450) is empty orange with nothing in it at all.

**Wrong with it:**
- The whole centre of the court is dead space. No net posts, no opponent, no racket, no ball at rest, no crowd, no horizon. The 'net' at top:30% is a 3px hairline identical in weight to the two baselines and the two sidelines, so it does not read as a net, just a fifth stray line, and the empty upper court has no subject and no sense of scale.
- The tip line #tip ('TAP ANYWHERE WHEN THE BAR HITS THE GREEN') overflows its box: at 375px it wraps, the final 'E' of 'THE' is cut by the right .side line, and the word 'GREEN' on line two has the .base bottom line running straight through it like a strikethrough. Confirmed by cropping the 2x shot.
- Three grey .fault dots (16px, border 3px) float below the court frame in dead space at bottom:6% with no label and no container, while everything else in the layout sits inside the court box. They read as stray UI, not as lives.

**Background now:** Flat CSS only. #wrap = repeating-linear-gradient(0deg,rgba(0,0,0,.04) 0 2px,transparent 2px 4px) over linear-gradient(160deg,#d8552c,#a83c1b), plus an inset box-shadow. The 4% scanline is invisible on a phone. No image assets exist for the game at all: the 11 asset files in the folder are PWA icons and the neighbouring shardfall build.

**Background wanted:** A full-bleed painted clay court from the receiving end: raked clay with directional drag marks, chalk lines with worn shoe scuffs, a real net with tape and posts at the current 30% line, a dark hedge or empty stands across the top 15% to close the horizon, warm low sun from the upper left. This is the single change that would transform the game, because right now the background IS the game.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-court-540x960.jpg` | 540x960 full-bleed, painted clay court in receiver POV, raked clay texture, worn chalk lines, net with tape and posts across the upper third, dark hedge/stands across the top 15%, warm low sun from upper left, vignetted corners | Replaces the flat linear-gradient(160deg,#d8552c,#a83c1b) plus five 3px div lines, and fills the 55% of the frame that is currently empty orange |
| `opponent-ready-260x260.png` | 260x260 transparent PNG, painted opponent player in a ready stance seen from behind the net, rim-lit from upper left, big readable silhouette, sized to stand just above the net line | Gives the empty upper court a subject and a sense of depth; there is currently nothing to look at above the timing bar |
| `racket-swing-320x220.png` | 320x220 transparent PNG, foreground racket head entering from the bottom-left on the swing, strings with slight motion blur, warm rim light on the frame | Anchors the timing bar to a physical action; the bar currently floats as an abstract gauge with no connection to tennis |
| `ball-felt-96x96.png` | 96x96 transparent PNG, painted felt tennis ball with the seam curve, fuzz edge and a warm rim highlight, neutral enough to be tinted by the existing ball-skin gradients | Replaces #ball, an 18px CSS circle with border-radius:50% and a flat var(--gold) fill; the shop sells 11 ball skins that are all just radial-gradients |
| `net-tape-540x120.png` | 540x120 transparent PNG, painted net band with white tape, visible mesh and a slight centre sag, soft shadow cast onto the clay below | Replaces .court .net {height:3px;background:var(--line)}, which is indistinguishable from the baselines and does not read as a net |

**CSS to do:**
- #tip (line 53): bottom:13%, font-size:12px, letter-spacing:3px overflows the court box and the word GREEN is struck through by the .base bottom line. Add padding:0 22px, drop letter-spacing to 1.5px, set line-height:1.5 and move to bottom:8% so it clears the court rectangle.
- #musicBtn (line 60): 40x40px, under the 48px minimum touch target. Set width:48px;height:48px;font-size:20px.
- .court .net (line 35) vs .court .base / .court .side (36, 37): all three are 3px var(--line) so the net has the same visual weight as the lines. Give .net height:5px plus box-shadow:0 3px 8px rgba(0,0,0,.35) and drop .base/.side to 2px.
- #wrap (line 32): the repeating-linear-gradient scanline is 4% black and invisible. Replace it with radial-gradient(130% 90% at 50% 20%, transparent 0%, rgba(0,0,0,.45) 100%) so the empty upper court reads as depth instead of flat paint.
- .logo and .stat .num (lines 40, 43): text-shadow:3px 3px 0 var(--ink) reads as misregistered print. Change to text-shadow:0 2px 0 rgba(0,0,0,.55), 0 0 18px rgba(0,0,0,.35).
- .logo small (line 41) is 9px and .stat .lbl (line 44) is 9px, both under the 0.7rem floor. Raise to 11px and cut letter-spacing from 4px to 2px so they still fit.
- .faults (line 57): the three lives sit at bottom:6% in dead space outside the court frame. Move the container into the header row next to #best so lives group with the other stats.

**Readability:** .logo small 'TAP TO SERVE' is 9px with 4px letter-spacing, and .stat .lbl 'BEST 0 / coins' is 9px, both under the 0.7rem floor and both cream at 0.8 opacity on bright orange. #musicBtn is a 40px circle, under the 48px minimum. #tip wraps and the word GREEN is bisected by the court baseline.

### Lamplighter
`lamplighter` · satellite · puzzle · first committed 2026-07-11 · impact 5/5 · effort M
`satellites/lamplighter/index.html`

**Now:** A plum-purple dusk sky with a crescent moon over a silhouetted skyline of buildings with gold-lit windows, and beneath it a 6x6 grid: dark plum house tiles with little roof triangles and clue numbers, warm tan hatched tiles for lit walkways, one gold lamp glowing, two red ringed cross markers for clashing lamps. A genuinely composed night scene built entirely from canvas primitives, with zero image assets.

**Wrong with it:**
- The skyline and the grid meet on a dead-straight horizontal line with no transition of any kind, no ground, no fence, no haze; the painted town simply stops and the puzzle board starts, and the buildings are cut mid-window at both frame edges.
- The two conflict markers are pure UI red rings with a bar through them, drawn as strokes at #ff8f7a and full red; they read as no-entry road signs and are the only saturated red anywhere in a plum-and-gold picture.
- The boot frame is a wall of body copy: 'HOW TO LIGHT A TOWN' over eight paragraphs of 14px text on flat near-black with a single outlined back button, no lantern, no town, no art at all, and that is the first thing the player sees.

**Background now:** Entirely procedural canvas. An offscreen CUR.town skyline is blitted at 0,0, then per-window fill rects kindle as cells light, then fireflies drawn as two-circle sprites, over a page radial #161022 to #070510 to #000. imgTags 0, assetFiles 1 (the og share image).

**Background wanted:** bg-lamplighter-town-540x340.png, a painted dusk skyline strip with varied roof lines (a gable, a clock tower, a chimney cluster, a domed hall), a hill behind, chimney smoke, and a soft haze band along the bottom so it dissolves into the grid instead of stopping at a hard line. The window rects can still be drawn on top so the kindling stays live.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-lamplighter-town-540x340.png` | 540x340 transparent-bottomed PNG, painted dusk skyline with varied silhouettes, a hill behind, chimney smoke, and a 40px haze gradient fading to transparent at the bottom edge | replaces the procedural rectangle town and removes the hard horizon where the art meets the grid |
| `tile-cobble-96x96.png` | 96x96 seamless tile, warm grey cobbles with dark mortar and a faint damp sheen, neutral enough to take a gold light wash | replaces the flat #221c33 walkway fill so lit and unlit cells differ by light rather than by a colour swap that currently reads as tan drywall |
| `lamp-lit-96x96.png` | 96x96 transparent, painted iron lantern on a short post with a warm flame and a soft bloom, warm rim light on the ironwork | replaces drawLamp's stacked circles, the single most-repeated object on the board |
| `lamp-clash-96x96.png` | 96x96 transparent, the same lantern cracked, its glass smoked, a dull ember instead of a flame, one thin ember-orange highlight | replaces the pure-red no-entry ring so the error state stays inside the plum-and-gold palette |
| `house-tiles-288x96.png` | 288x96 transparent, three painted 96x96 shuttered house fronts (narrow, wide, gabled) with dark windows and a gold eave line | replaces the identical dark rect plus triangle roof stamped on every house cell, so two houses in one frame stop sharing a silhouette |

**CSS to do:**
- render() footer text (ctx.font='12px sans-serif' at y 792 and y 808, rgba(232,220,200,0.5) and rgba(191,224,242,0.55)): the 540-wide canvas scales about 0.694 on a 375 phone so these land near 8.3 real px; raise to 16px canvas and lift alpha to 0.75
- #hintbtn (line 58): it shares the bottom-left corner with the injected Music chip; give the bottom control row padding-left:150px on its first child, or move HINT to the right of the row, so the chip cannot cover the icon
- The version footer line ('Lamplighter 1.0 / streets / lanterns'): add padding-bottom:calc(10px + env(safe-area-inset-bottom)); it is currently clipped by the bottom of the viewport in both play frames
- render() house branch: the roof triangle is #1c1530 on #0b0816, about a 4% lift; raise the roof accent to roughly #2a1f45 and add a 1px rgba(200,168,75,.13) eave line so houses read as houses at 48px
- render() conflict branch: replace the #ff8f7a red ring with a smoked-glass lantern, rgba(120,100,140,.9) body plus a single #e07a5f ember dot, so the error stops being the loudest colour on screen

**Emoji as art:** Menu and HUD glyphs only: lantern on the Lantern Walk button, sun on HINT, reload arrow on RESET, house glyph for home, square and check in the HUD chips; 31 emoji, 20 distinct across the menus. Inside the canvas the lamps, markers and town are drawn shapes, not emoji.

**Readability:** The two canvas footer lines ('tap: lamp, tap again: note, once more: clear' and 'zen dusk, no fail, pays nothing') land near 8 real px at half opacity, failing both the size floor and contrast. The HUD chip sub-labels ('dark cells', 'houses', 'free hints / no fail') are also small grey on dark. Grid cells measure about 48-52 real px so touch targets just clear.

**Music chip:** The 'Music' chip at bottom-left sits on top of the HINT button, covering its left third including the sun icon, in both the play and later frames. On the boot frame the same chip sits over the version footer line.

### Orb Orchard
`orb-orchard` · satellite · action · first committed 2026-07-10 · impact 4/5 · effort M
`satellites/orb-orchard/index.html`

**Now:** NOTE ON THE CAPTURE: the harness -2play and -3later frames both landed on THE GROVE, an empty-state sub-screen that is one heading, one grey sentence, a back button and ~470px of dead black - not the playfield. I drove the game myself (how, back, title, Zen Stroll, stage 1) and shot the real board at /tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad/s5shots/orb-B4.png. The actual playfield is a genuinely composed scene: a dawn sky gradient from navy to a warm gold horizon with a gold sun disc, and a green checkerboard world curving away over a close horizon, dotted with big blue glass spheres that have speculars and cast shadows. It has real depth and atmosphere - the most composed thing in this batch - but every element is a raw canvas primitive, not art.

**Wrong with it:**
- The ground is a saturated bright-green / dark-green checkerboard at full contrast. It is the loudest thing on screen, it fights the navy sky instead of sitting under it, and it is nowhere near the midnight-greenhouse palette - it reads as a 1990s demo floor.
- The world meets the sky on a hard 1px line: the checker plane just stops at HORIZON with no haze band, no fog fade and no desaturation into the distance, so the ground looks pasted onto the sky rather than receding into it.
- The player is a cream ellipse about 26px tall with a leaf sprout and two 4x5px feet, drawn at a fixed position with no rim light, and in my shot it is camouflaged against a bright blue sphere - meanwhile dew orbs, thorns, bumpers and springs all render as near-identical blue spheres, so the character you control has the weakest silhouette in a frame where nothing else has a distinct one either.

**Background now:** Canvas-drawn, no image files. body radial-gradient(120% 80% at 50% 0%, #101610, #05070a 70%, #000). In play, render() paints a three-stop vertical sky gradient from SKIES[top] via SKIES[mid] to a mix with SKIES[glow], plus 24 hand-placed 1px stars and one filled circle for the sun at (200,52,r17). Menus are the flat .screen gradient #0c1410 to #070b08. bgImageDecls: 0, imgTags: 0, inlineSvg: 0; only file besides index.html is og/card.jpg.

**Background wanted:** The sky gradient is genuinely good and should stay as code; what is missing is the horizon. Want a painted horizon band drawn over the gradient at the HORIZON line: warm gold haze, a low cloud shelf, faint distant orchard silhouettes, so the ground fades into the sky instead of ending at it. Three variants to match the existing SKIES (dawn / nebula / aurora). The ground itself needs no painted background - it needs its two greens desaturated and value-separated, which is a colour change, not art.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `horizon-dawn-540x260.png` | 540x260 transparent PNG, bottom-aligned to the horizon line: warm gold haze fading up to transparent, a soft low cloud shelf, faint dark orchard silhouettes along the very bottom edge, no hard edges anywhere | Kills the hard 1px seam where the checker plane currently just stops against the sky, and gives the run somewhere to be going. |
| `horizon-nebula-540x260.png / horizon-aurora-540x260.png` | same framing, repainted to the existing SKIES palettes - nebula purple/rose #e58fa0 glow, aurora teal/ice #bfe0f2 glow | The three skies are already wired and unlockable; one band each makes the unlock visible instead of a hue shift. |
| `runner-seedling-96x128.png` | 96x128 transparent PNG, a cream seed body with a green sprout leaf and two small feet, a face, warm rim light down the left edge and a dark contact shadow, big readable silhouette at 26px | Replaces the ctx.ellipse blob that currently vanishes against the blue orbs. Also wants firefly and comet variants - the wardrobe already sells them as three hex pairs. |
| `orbs-sheet-384x96.png` | 384x96 transparent PNG, four 96px cells: dew orb (cool glass, cool rim light top-left, warm bounce under), sunbead (gold torus with an inner glow), thorn (spiked black-plum silhouette, unmistakably hostile), bumper (silver studded puck) | Four gameplay objects currently rendered as near-identical spheres; four distinct silhouettes is what makes the board readable at a glance. |
| `spring-96x96.png` | 96x96 transparent PNG, a coiled green spring pad in a compressed pose, sage #7ab356 with a gold highlight | The fifth hazard, currently another coloured sphere, and the one the help text says throws you three tiles. |
| `grove-plot-540x300.png` | 540x300 transparent PNG, an empty orchard plot at night: twelve dotted planting sockets in rows, one seedling in the first socket, soft ground shadow | THE GROVE screen - the frame the audit harness actually captured - is currently 470px of empty black under one grey sentence. This is the empty state a player sees before they have cleared anything. |

**CSS to do:**
- canvas#game - raise the backing store from width=270 height=410 to 540x820 and drop image-rendering:pixelated (or keep pixelated and make the stage scale an integer). The current 1.39x nearest-neighbour upscale is why the checker edges and the sun rim come out chunky and unevenly stepped.
- #dock .padbtn / #pad-l - the injected 48px Music chip is placed bottom-left and lands on the left TURN pad. Add padding-bottom:56px to #dock, or shift the pad row so the bottom-left 110x56 stays clear; the chip must never sit on a movement control.
- PALS.meadow ca/cb (index.html:270) - the ground checker is [121,179,86] against [63,92,47], a 2.7x luminance jump at full saturation. Pull both toward the house sage, roughly [96,132,78] and [58,78,52], and multiply distance-fade toward the sky mid colour so far tiles desaturate.
- .wcard .wl - 0.62rem is well under the 0.7rem floor; raise to 0.72rem.
- .lvlcard .lt - 0.7rem sits exactly on the floor; raise to 0.75rem.
- #grove - give it min-height:300px and the grove-plot art as a background so THE GROVE empty state is not 470px of black.
- #s-how / screen order - the game BOOTS onto HOW TO STROLL, five paragraphs of body copy, before the title screen. Show #s-title first and keep How behind its own button.

**Emoji as art:** Title screen buttons: tree The Orchard, calendar Daily Sphere, moon Zen Stroll, lightning Blitz, flower Grove, shirt Wardrobe, question How (index.html:140-147). Wardrobe runner cards use seedling / beetle / comet emoji as the character portraits (index.html:778-780), and flower / sun emoji stand in for grove trees and blooms. 28 emoji total, 24 distinct. The playfield itself uses no emoji - it is all canvas primitives.

**Readability:** The left TURN pad is partly covered by the injected Music chip. The 'zen stroll' watermark bottom-left is very low contrast grey on green and half hidden by the same chip. .wcard .wl at 0.62rem and .lvlcard .lt at 0.7rem are at or under the 0.7rem floor. HUD chips are 48px min-height and the pads are 96px, which is correct. The player character has no contrast rule against what it stands on, so it disappears on a blue orb - a readability fault in the gameplay layer, not just the text.

**Music chip:** Yes. The Music chip picks bottom-left against the boot layout (which is the HOW TO STROLL text wall, where that corner is free) and never re-places, so in play it sits on top of the left TURN pad - a 96px movement control - and over the 'zen stroll' watermark. Separately, the injected ladybug feedback button and its close X land on the right edge of the playfield, over an orb and partly over the right TURN pad column.

### Nova Bloom
`nova-bloom` · satellite · action · first committed 2026-07-10 · impact 4/5 · effort S
`satellites/nova-bloom/index.html`

**Now:** All three frames are the same screen: the HOW TO FLY wall. This is not a robot failure - line 1067-1074 auto-shows #s-how once per device 80ms after load, so it is literally the first thing every new player sees. It is a flat near-black radial with a letterspaced cream heading and roughly 250 words of 0.8rem muted-grey system-ui body copy, four paragraphs with bold lead-ins, and a small '← Back' button. House palette is right and the typography is deliberate, but not one of the game's 44 painted assets renders on it. On the boot frame the music unlock card additionally covers the bottom 30% including that Back button.

**Wrong with it:**
- The game owns a painted 900x1600 bg_title.jpg - a neon flower blazing over a green wire horizon with a starfield - and it is bound to #s-title ONLY (line 86). The first-run how screen falls through to .screen's plain radial-gradient(#0f1610ee,#060907f5), so the best art in the game is hidden behind the wall that covers it.
- The body copy is .howtxt at 0.8rem in var(--muted) #8a9178. The 540x960 stage scales 0.694 on a 375 phone, so 0.8rem = 12.8 stage px renders as 8.9 real px of grey on near-black. Four paragraphs of it. That is the smallest, lowest-contrast text I have looked at in this batch.
- Injected furniture boxes the text in on three sides: the '♫ Music' chip top-left, a '♫ New song' pill bottom-left, and the 🐞/× feedback fab bottom-right. Nothing is composed around them, so the frame reads as a text block with three loose stickers on it.
- The 250-word wall is undifferentiated prose about six enemy types that all have painted sprites sitting unused in assets/sprites/ - no picture, no icon, no example anywhere on the screen that teaches.

**Background now:** The screen shown is .screen's radial-gradient(110% 90% at 50% 10%, #0f1610ee 0%, #060907f5 75%) over #stage - flat near-black. The game does have real backgrounds: assets/bg/bg_title.jpg (painted neon flower + wire horizon), bg_meadow.jpg, bg_violet.jpg, bg_dawn.jpg, all 900x1600, plus 28 painted sprites and 12 painted UI plates.

**Background wanted:** None needs painting - the art exists. The how screen should carry a darkened crop of bg_title.jpg the way #s-title already does, so the first screen a player sees is the game's own neon garden rather than black. One CSS line.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg_how.jpg` | 900x1600 JPG, a crop of the existing bg_title.jpg pushed 40% darker with the flower moved out of the text column into the lower third, so the copy sits over quiet sky | gives #s-how a painted ground instead of the fallback radial, without asking for a new painting |
| `howto_panel_460x760.png` | 460x760 transparent PNG, 9-sliceable smoked-glass panel with a thin sage-gold edge and soft inner glow, corners 24px | the how copy currently floats on bare black; a plate lets it sit on the painted background legibly and gives the screen a composed centre |
| `how_icon_moth / wasp / needle / serpent / mine / bulb, 64x64 each` | six 64x64 transparent PNGs, cropped and re-lit from the existing assets/sprites/enemy_*.png at icon scale with a warm rim light | turns the 'enemies read by shape and motion' paragraph from a wall of prose into a picture guide, using art that is already painted |

**CSS to do:**
- #s-how: give it the #s-title treatment from line 86 - background:radial-gradient(110% 90% at 50% 10%, #0f1610aa 0%, #060907f0 78%), url('assets/bg/bg_how.jpg') center/cover no-repeat, #060907. One line, and the first screen a new player sees stops being black.
- .howtxt (line 129): font-size .8rem -> 1.05rem. At the stage's 0.694 phone scale .8rem renders as 8.9 real px.
- .howtxt (line 129): color:var(--muted) #8a9178 -> #cbd3bd; keep var(--muted) for the .tag only.
- #s-how .howtxt: add background:rgba(13,16,12,.72); border:1px solid rgba(200,168,75,.35); border-radius:18px; padding:16px 18px so the copy has the panel plate instead of floating.
- .tag (line 89) and .subtle (line 102): .8rem and .72rem render as 8.9 and 8.0 real px - raise both to 1rem minimum.

**Emoji as art:** 🌌 Arena, 📅 Deadline Daily, 🕊 Pacifist Run, 🌙 Zen Drift, 🎨 Wardrobe, 🌼 Grove, ❓ How, ✨ FX on the title screen; 🎯 inline in the how copy for the autofire toggle. All menu iconography is emoji even though assets/ui/ holds painted button plates.

**Readability:** .howtxt 0.8rem = 8.9 rendered px in #8a9178 grey on near-black, across four paragraphs - the worst text in this batch. .subtle at .72rem = 8.0 rendered px. #buildstamp at .7rem in #5a614f = 7.8 rendered px on near-black, effectively invisible.

**Music chip:** The chip sits top-left over empty background on the how screen, so it covers nothing here - but the title screen's own '← ARCADE' button is align-self:flex-start with margin 14px (line 150), i.e. the same top-left corner, so on the title screen the chip and the arcade exit are stacked in the same box. Worth shooting the title screen to confirm.

### Sprout Dice
`sprout-dice` · satellite · dice · first committed 2026-07-05 · impact 4/5 · effort M
`satellites/sprout-dice/index.html`

**Now:** Boot is a genuinely painted wordmark: SPROUT DICE in carved green-and-gold letterforms with leaves growing out of the S and the D, on flat black, over two big gradient buttons. Play is the Trellis map — a flat vertical gradient with seven rounded dark panels stacked down the screen, each carrying a 26px emoji on the left, stitched together by a plain 3px green bar. capture.reached is no-more-controls after the robot tapped Play it now on the song card, so the frame is the run map, not combat; the painted board (bg_board.jpg, pest_*.png, die_*.png) never appears.

**Wrong with it:**
- #s-map has no background rule of its own at all — it inherits the bare .screen linear-gradient(#0e140c,#0a0d08). The screen a player navigates the entire run from is the one major screen with no art, while #s-combat right beside it (line 57) loads assets/bg_board.jpg.
- Every normal floor node is the same caterpillar emoji, so Floors 1, 2, 3, 6 and 7 are five visually identical rows in one frame sharing one silhouette — while twelve painted pest portraits (pest_aphid, pest_beetle, pest_slug, pest_thrip, pest_mantis and more) sit in assets/ wired only inside combat.
- The right-hand column is three different system glyphs at three different sizes — lock at 14px, tick at 18px, play arrow at 16px (line 555) — so it reads ragged, and the shared feedback ladybug FAB with its dismiss badge floats over the right end of the Floor 2 card with nothing anchoring it there.

**Background now:** Flat. #s-map inherits .screen's linear-gradient(180deg,#0e140c,#0a0d08) (line 40). The only painted background in the game is #s-combat's assets/bg_board.jpg under a .55/.72 scrim (line 57). The boot screen is flat black with logo.png sitting on it.

**Background wanted:** assets/bg_trellis.jpg on #s-map — a painted vertical trellis: dark wet timber uprights, sage vine climbing from the bottom of frame toward the top, warm gold light at the current floor and cold blue at the locked floors above, so progression is legible from the background alone. Apply the same .55/.72 scrim already used on #s-combat.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/bg_trellis.jpg` | 540x960 full-bleed JPG. Painted trellis of dark timber and climbing sage vine, warm light low in frame cooling to blue up top, structurally simple through the middle so 15px node titles stay readable under a .55-to-.72 scrim. | Replaces the bare CSS gradient on the map screen, the screen a player looks at most during a run, and gives the floor ladder a physical reason to be vertical. |
| `assets/node_icons_96x96.png` | 576x96 transparent PNG, six 96x96 cells: aphid, beetle, slug, elite skull-moth, rest lantern, boss crown. Painted, warm rim light, big readable silhouettes at 40px. | Replaces the caterpillar/tent/skull emoji returned by nodeInfo (lines 543-545) so five floors in one frame stop sharing an identical silhouette. Crops of the existing pest_*.png would also work. |
| `assets/ui/node_lock_48x48.png and assets/ui/node_check_48x48.png` | Two 48x48 transparent PNGs: a painted brass padlock and a sage tick, both with a soft drop shadow to match .pest-img's treatment. | Replaces the lock and tick system emoji so the right-hand column is one consistent painted set instead of three unrelated glyph sizes. |

**CSS to do:**
- #s-map: it has no background declaration at all — add background:linear-gradient(rgba(9,12,7,.55),rgba(9,12,7,.72)), url('assets/bg_trellis.jpg') center/cover no-repeat, matching #s-combat at line 57.
- .mapnode .ico (line 85): currently a 40px box holding a 26px emoji — swap to an <img> at 40x40 with filter:drop-shadow(0 2px 3px #0007), the same treatment .pest-img gets at line 102.
- .mapnode.locked (line 84): opacity:.35 pushes the 12px muted sub-label under .mapnode .info .d (line 88) close to unreadable — raise to .5, or keep the opacity and lift the sub-label colour on locked rows only.
- The node connector bar (the flat 3px green rectangle between cards): give it a taper or a vine texture, or replace it with a repeating vine PNG — it is the sloppiest element in the frame, a bare rectangle joining rounded cards.

**Emoji as art:** On the map, everything: caterpillar for every normal floor, tent for rest, skull for elite, plus lock, tick and play-arrow glyphs (nodeInfo lines 543-545, renderMap line 555). Combat is the opposite — pest_*.png and die_*.png are properly wired with emoji only as onerror fallbacks, and .pest-img + .pest-emoji{display:none} at line 103 correctly hides the emoji when the art loads. The painted art exists and is good; the map screen simply never asks for it.

**Readability:** 15px node titles and 12px sub-labels are both above the 0.7rem floor. .mapnode rows measure roughly 56px tall, over the 48px target, and boot buttons are .btn at min-height:72px — all fine. Locked rows at opacity:.35 make the 12px grey sub-label borderline. A clipped version string pokes out at the extreme bottom-left under the Floor 1 card.

**Music chip:** The Music chip is clear of the title on both frames — it ends around x107 and The Trellis starts around x148. The collision is a different injected control: the shared feedback.js ladybug FAB and its dismiss badge float over the right end of the Floor 2 card, mid-list, covering that row's edge.

### Skyshot
`skyshot` · satellite · action · first committed 2026-08-07 · **workbench-gated** · impact 4/5 · effort M
`satellites/skyshot/index.html`

**Now:** Boot is the live playfield running in attract mode behind a scrim: a deep navy-to-black vertical sky, a crescent moon top-right, a few faint stars, three soft-glowing tan five-petal moonbuds at different sizes and one green sprout on a thin stem, with a gold 'Skyshot' wordmark over it and a gold Play slab. Both -2play and -3later are the plot picker instead: 24 identical navy rounded squares in a 3-wide grid, 21 of them greyed with a padlock glyph, under three gold section headings.

**Wrong with it:**
- The moon at top-right reads as a rendering fault, not a moon: it is a dark disc overlapping a pale disc with a hard edge between them, so it scans as a grey ball with a bite taken out of it. It is the only object in the top third and the eye goes straight to it.
- The three moonbuds are one silhouette stamped three times. Each is four flat tan ellipses around a cream centre (the same construction as the SVG help icon at index.html:187), same rotation, same flat fill, no rim light and no interior detail, so the field reads as repeated clip art rather than a garden.
- The painted sky just stops. #s-title (index.html:46) drops a 4-stop scrim that goes to rgba(5,7,11,.97) by 62%, so the bottom 40% of the boot screen is a flat black slab with buttons floating on it. No ground, no horizon, no slingshot visible, and the ribbon text sits on nothing.
- The plot picker is 24 identical .lvlcard squares (index.html:104) at #101625 with a padlock; with 21 locked it reads as a disabled form, and 'the ring', 'low branch', 'the turnstile' render at ~10px muted grey under each number.

**Background now:** No image assets in the game at all (the 185KB counted is thumb.png plus the og/ share image, neither used in-game). The playfield background is drawn on canvas: a vertical linear gradient over the full height (index.html:822-824) plus one radial moon glow (825-827), a ceiling band gradient (856-858), and a flat #05080e fill for the ground (873). Menus sit on #s-title's scrim gradient over that same live canvas.

**Background wanted:** bg-nightgarden-375x667.jpg, full-bleed: a real night garden looking straight up a warm-lit slingshot from the bottom of the frame, brambles and hedge silhouettes at the left and right edges, the sky opening cold navy toward a moon at top, warm gold lantern haze at ground level so the bottom third has something in it besides scrim. Painted once and drawn under the canvas gradient at low alpha so the existing glow work still reads.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-nightgarden-375x667.jpg` | 375x667 at 1x, export 1125x2001 at 3x, full-bleed no transparency. Night garden looking up: hedge and bramble silhouettes framing left and right, warm lantern haze at the bottom, cold navy sky opening upward, one soft moon top-right. | Replaces the bare linear-gradient sky (index.html:822) and gives the bottom 40% of the title screen something under the #s-title scrim other than a black slab. |
| `moonbud-set-256.png` | One sheet, four cells at 256x256, transparent PNG. Four distinct bud silhouettes: a closed bud, a half-open bud, a wide bloom, and a spiny bramble bud. Cream centre, warm gold petals, cool rim light on the moon-facing edge. | Replaces the identical four-ellipse blob drawn at index.html:966-985 so the three buds on screen stop being one shape at three sizes. |
| `moon-crescent-160.png` | 160x160 transparent PNG, soft-edged. A painted waxing crescent with a faint earthshine disc, warm cream on the lit limb going cool blue in the shadow, no hard terminator line. | Replaces the two-disc crescent that currently photographs as a chipped grey ball, drawn from the MOONX/MOONY radial at index.html:825. |
| `slingshot-plate-220x180.png` | 220x180 transparent PNG. A forked branch slingshot with a leather pouch and a green sprout wound round it, warm rim light from below, sitting on a small mound of soil. | The launcher is currently a green dot on a hairline stem (the AX/AY glow at index.html:899); it is the thing the player aims with and it has no art. |
| `lvlcard-plate-108.png` | 108x108 at 1x, export 324x324 at 3x, transparent PNG with a 22px 9-slice border. Painted stone-and-vine tile in three states: locked (cold, mossed over), next (warm gold edge, lantern lit), cleared (three carved stars). | Replaces the flat #101625 .lvlcard rounded rects (index.html:104-114) so a screen of 24 tiles stops reading as a disabled form. |

**CSS to do:**
- #s-title (index.html:46): the scrim reaches rgba(5,7,11,.97) at 62%. Stop it at rgba(6,9,14,.72) so the live garden keeps showing behind the button stack instead of the bottom 40% going to a flat slab.
- .lvlcard.locked (index.html:109): border-color #1a2233 on background #0a0e17 is under 1.3:1 and the tile edge disappears. Lift the border to a warm muted (#2a2418) so the grid still reads as tiles.
- .lvlcard sub-labels ('the ring', 'low branch'): currently ~10px muted. Raise to 12px minimum and lighten toward var(--cream) at 70%.
- #lvl-back / the '◄' back button on the plot picker: move it to the top RIGHT or give the header a min-height that pushes it below y=110. It currently sits under the injected music chip at top-left and is completely hidden.
- .btn.ghost (index.html:70) at font-size:15px on #0a0f17 with var(--muted): fine on size, but the ghost buttons and the primary gold slab differ so much in weight that the secondary row reads as disabled. Add a 1px var(--line) glow or lift the text to cream.

**Readability:** The .lvlcard sub-labels ('the ring', 'spin and step', 'the pendulum') render at roughly 10px muted grey on #101625, under the 11.2px floor. The footer stats line on boot ('0.0 · 0 of 24 plots cleared · 0 pollen') is ~10px and is additionally half-covered by the injected 'New song' pill. Locked tile borders are near-invisible against their fill. Buttons and tiles are all over 48px.

**Music chip:** Real collision. On the plot picker the '♫ Music' chip sits at top-left directly over the '◄' back button: the back button's rounded plate is visible peeking out below the chip's lower edge and its glyph is entirely hidden, so the only way back to the menu is the 'Back to menu' button at the very bottom, which is itself half-covered by the '♫ New song' pill at bottom-left. On boot the same 'New song' pill covers the left half of the '◄ All Sky Wolf games' button and the footer stats line, and the separate round '✕' and ladybug feedback buttons at the right edge overlap the right end of the Settings button with the ladybug clipped half off-screen.

**Looks broken** (confirmed on a second look, severity ugly)**:** Overlapping UI, visible in skyshot-2play.png and skyshot-3later.png: the injected music chip at top-left fully covers the '◄' back control (its plate edge shows below the chip), and the 'New song' pill at bottom-left covers the left half of 'Back to menu'. On skyshot-1boot.png the round '✕' and ladybug buttons overlap the right edge of the Settings button and the ladybug is clipped by the viewport. Note also that capture says reached 'canvas' but both play frames are the level select, not the playfield; the playfield look is judged from the boot frame, where it runs live in attract mode behind the scrim.

### Budburst
`budburst` · satellite · action · first committed 2026-07-05 · impact 4/5 · effort M
`satellites/budburst/index.html`

**Now:** Near-black olive ground with a fine noise tile, a genuinely handsome serif wordmark (cream BUD over green italic burst), a row of six drawn colour buds with distinct glyph shapes, and dark bordered mode cards. Capture logged reached=canvas but the frame it landed on is the Powers loadout screen, not the board: eight power tiles in two columns, each with a 34px emoji floating in a wide empty canvas, and a lime Start Arcade slab clipped at the bottom.

**Wrong with it:**
- Every power card is a run-on string. 'Bomb ShotYour next bud detonates a blast.', 'RecolourSwap', 'True AimA perfect', 'UprootRip out', 'Time FreezeHalt', 'BulwarkBlock'. Eight cards, all of them, caused by .tile .ds{margin-top:-5px} pulling the description onto the name's line.
- The power icons are emoji dropped into a 200x74 canvas. iconPreview() does c.font='34px serif' and fillText at centre, so each tile has a tiny glyph adrift in a wide empty box with masses of dead space either side. The trophy standing in for Uproot and the palette standing in for Recolour do not describe their abilities at all.
- Two injected chips fight the layout at once: the ♫ Music chip covers the 'Powers' title on play and half-covers the 🪙 coin pill on boot, and a second ♫ New song pill sits over the top-left corner of the Start Arcade button, which is itself a bright lime slab clipped by the bottom edge. Separately, a small circular button holding a ladybug emoji floats unlabelled at the right edge of the boot screen, in no group with anything, while sound and help sit in a proper row on the left.

**Background now:** Near-black #0d100c with a radial to #1a2213 from the top edge, plus an inline SVG feTurbulence noise tile as a data URI. The playfield canvas uses the same gradient. The four asset files in the folder are icon-192.png, icon-512.png, icon.svg and og/card.jpg, all PWA and share art. Nothing in-game is painted.

**Background wanted:** The game screen needs one. A painted 540x960 canopy: layered leaf masses top and bottom, a warm shaft of light down the centre, near-black core value so the coloured buds keep their contrast. The menus can stay on the noise ground, which is already correct house style and looks fine.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `satellites/budburst/assets/powers/bomb-200x74.png (plus rainbow, recolour, trueaim, uproot, bloomblast, timefreeze, bulwark, and one per booster)` | 200x74 transparent PNG each, painted landscape-format vignette that fills the tile canvas edge to edge rather than a centred glyph. Bomb: a seedpod with a lit fuse and a soft blast ring. Uproot: a hand pulling a row of buds free of the vine. Time Freeze: a bud caught in frost with the canopy stalled behind it. Warm rim light, house palette, big readable silhouette. | Replaces iconPreview()'s 34px emoji fillText, which leaves ~160px of empty canvas on every one of the sixteen shop tiles. The hook already exists; it is a one-line swap from fillText to drawImage. |
| `satellites/budburst/assets/bg-canopy-540x960.jpg` | 540x960 full-bleed. Layered leaf masses crowding in from the top and bottom edges, a warm gold shaft down the centre, deep near-black core so bud colours stay legible on top. Soft painterly, no hard horizon line. | The playfield is currently the same radial gradient as every menu. This is the screen the player spends all their time on and it has no place. |
| `satellites/budburst/assets/modes/arcade-64x64.png (plus blitz, puzzle, endless, zen, daily)` | Six 64x64 transparent PNGs in one visual family: a painted spark, a sand-timer, a knotted vine puzzle, a spiral of falling leaves, a still pond leaf, a calendar leaf. Same line weight and rim-light direction across all six. | Replaces ✦ ⏱️ 🧩 🌀 🍃 📅 in .mc-ic, which currently mixes a text glyph with five colour emoji so the six mode cards do not share a family. |
| `satellites/budburst/assets/coin-40x40.png and nectar-40x40.png` | Two 40x40 transparent PNGs: a warm gold coin with a bud stamped on it, and a honey drop with a soft internal glow. Both drawn to read at 20px. | 🪙 appears 22 times and 🍯 10 times, including inline inside body text ('Upgrade · 220 🍯'), so the two currencies of the game are system emoji that render differently on every device. |

**CSS to do:**
- .tile .ds: remove margin-top:-5px and set display:block; margin-top:4px. That negative margin is what renders all eight power cards as run-on strings.
- .tile .ds{font-size:10.5px} raise to 12px, and every font-size:9px and 10px rule (.goals-h span, .build-stamp, .lvl .stars, .g-hud .obj .oLabel, .g-hud .stat .sl, .load-slot small) raise to 12px. Budburst is unscaled so 9px is 9 real px.
- .topbar / the currency pill row: add padding-right:130px, or raise its z-index above the injected chip, so the 🪙 pill stops being half-covered on boot.
- .btn-fill (Start Arcade): add margin-bottom:calc(20px + env(safe-area-inset-bottom)). It is clipped by the bottom edge of the viewport in the shot.
- The unlabelled ladybug button at the right edge of the boot screen: move it into the existing left-hand icon row with the sound and help buttons, so the header has one motivated group instead of a row plus one loose circle.

**Emoji as art:** Heavy. 🪙 (22) and 🍯 (10) are the two currencies, used in the header pills and inline in body text. 💥 🌈 🎨 🎯 🏆 ❄️ 🛡️ are the eight power icons, drawn onto canvas at 34px serif by iconPreview(). ✦ ⏱️ 🧩 🌀 🍃 📅 are the six mode-card icons. 🔒 gates prices, 👑 marks mastery, 🌸 and a ladybug sit in the header. 98 emoji, 35 distinct. The six colour buds on the boot screen are the one thing genuinely drawn, and they are the best-looking element in the game.

**Readability:** Six rules at 9px and one at 10.5px, all real px since the game is responsive rather than stage-scaled: the goals header, the build stamp, the level stars, both HUD labels and the loadout slot captions. The power descriptions at 10.5px are also the ones colliding with their names. Touch targets are fine, .buy is min-height:48px and the mode cards are well over. Colour contrast is house-correct throughout.

**Music chip:** Yes, twice over. On boot the ♫ Music chip half-covers the 🪙 coin currency pill in the top-right header. On play it sits on the 'Powers' screen title, leaving it reading as a fragment. Separately a ♫ New song pill is anchored bottom-left over the top-left corner of the 'Start Arcade →' button.

**Looks broken** (confirmed on a second look, severity ugly)**:** The game's own CSS: .tile .ds{margin-top:-5px} renders all eight power cards with the name and description glued together into one string, visible in both play frames ('Bomb ShotYour next bud detonates a blast.', 'True AimA perfect long sightline for 5 shots.'). Separately the Start Arcade button is clipped by the bottom edge of the 375x667 viewport. No bad requests at all on this game, no image 404s.

### Conduit
`conduit` · satellite · puzzle · first committed 2026-09-01 · **workbench-gated** · impact 4/5 · effort L
`satellites/conduit/index.html`

**Now:** All three captured frames are the site gate, not the game: near-black violet ground, a big gradient-filled CONDUIT wordmark (violet to gold), four paragraphs of cream body copy with small purple bullet dots, and one thin outlined 'Enter the site' button. I opened the repo's own portrait play shots (satellites/conduit/docs/shots/gate3-c-worst.png, c5-sites-375x667.png) to see the real screen: flat translucent slate quads for floors on a pure black void, hairline gold wire runs, tiny boxed text labels (SPR, PLT, SPK, GEN), a ~14px purple lozenge for the creature, and four identical rounded button slabs across the bottom.

**Wrong with it:**
- The first screen a player gets is a wall of about ninety words of body copy with a single 26px-tall outlined button at the bottom; the only picture on it is the wordmark, so the door to the game reads as a README.
- In the real playfield (docs/shots/gate3-c-worst.png) the floor slabs meet the black void on a razor edge with no wall face, no falloff and no floor texture, and the upper room and the lower corridor are split by an unexplained empty horizontal band; the top-right and lower-left quadrants of the frame are pure black with nothing in them.
- Same shot: PULSE, PEEK, CLING and FLOW are four identical rounded rectangles told apart only by their word, no icons and no state art, and the ferrofluid creature the game is named after is a 14px purple lozenge smaller than the SPR and PLT labels sitting beside it.

**Background now:** CSS: html,body{background:var(--void)} (a flat near-black) plus one faint radial bloom radial-gradient(120% 80% at 50% 0%, rgba(138,92,246,.08), transparent 60%) on the settings panel. The playfield is canvas 2D painted procedurally over a #05060A fill with a grain pattern. There is no assets/ folder in satellites/conduit at all, zero image files, zero img tags.

**Background wanted:** The game's own ART_ASSETS.md Sheet 14 already specs it: one seamless 512 material plate per site (bare cast plate, frost-pitted plate, ducting, ribbed decking, cable trays, chitin honeycomb), all within two values of #05060A, drawn under the tiles with createPattern so the void outside the site stops being empty black. Wiring point named in the doc: draw() line 1949, right after the black fill.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `conduit-floors.png` | 2048x512 sheet, 2 rows x 8 cells at 256px, magenta FF00FF gutters and background; wall, wall face, floor, shadow, concealed hatch, vent, door, wet overlay, lit, exfil, void grain, corner tick, in near-black iron 12141C with hairline 1C2030 edges | replaces the single ctx.fillRect flat-colour-per-tile-type at index.html line 1954, so the floor stops being five untextured greys and walls get a face |
| `conduit-backdrops.png` | 3216x512 strip, 1 row x 6 seamless 512 cells with 24px magenta gutters, one material per site, all within two values of #05060A | fills the empty black void that currently surrounds every site so the floor slabs sit on ground instead of floating on nothing |
| `conduit-machines.png` | 2048x1024 sheet, 4 rows x 8 cells at 256px, ten devices off and on plus action frames, 17.4px in-game inside a 24px tile, magenta cutout | the ten devices are currently identical small outlined boxes with three-letter text labels (SPR, PLT, SPK); art gives each one a silhouette so the level reads without reading |
| `conduit-patrols.png` | 2048x1024 sheet, 4 rows x 8 cells at 256px, drone, sentry and brute in eight states each plus bodies and spot ring, 14px in-game, magenta cutout | enemies are the same flat dots as everything else; they are the only moving threat and need to be the most legible thing on the board |
| `conduit-title-plate.jpg` | 375x667 full-bleed, a near-black facility interior with a violet cast and one lit duct, no text | backs the instructions gate, which today is body copy on flat void and is the first thing anyone sees |

**CSS to do:**
- #overlay (the gate at index.html:161): add background-image with the new title plate plus a linear-gradient scrim so the copy stays readable; today it is bare var(--void).
- #overlay ul li: the four bullets run to three lines each at 375px. Cap the copy block at max-width:33ch and cut the intro paragraph so 'Enter the site' is above the fold instead of at y=525.
- #go ('Enter the site'): it is a 176x48 hairline outline lost against black. Give it border:1px solid rgba(200,168,75,.55), a faint inner glow (box-shadow:inset 0 0 24px rgba(138,92,246,.18)) and min-height:52px so it reads as the one control on the screen.
- The four action buttons drawn by drawButton (2322) are 101x54 identical plates; add a 20-24px glyph cell from conduit-icons to the left of each label so they stop sharing a silhouette.

**Readability:** Gate copy is cream on near-black at a comfortable size, fine. In the playfield shot the HUD readout '22 body / 45 in wire' and the sub-line 'thin, fits vents, one hit from gone' are plain system-font white and grey directly on black with no plate, and the device chips (SPR, PLT, SPK) are about 9px gold caps; those chips are at or under the 0.7rem floor.

**Music chip:** The injected chip sits at top-left of the gate about 10px above the CONDUIT wordmark; it does not overlap it in this frame but it is close enough that on a shorter viewport it would land on the C. On the play frames it would sit over the mass ribbon and the '47 body / 53 in wire' readout, which live in exactly that corner.

### Mouse Trap
`mouse-trap` · satellite · puzzle · first committed 2026-07-18 · impact 4/5 · effort M
`satellites/mouse-trap/index.html`

**Now:** A real playfield, all hand-drawn on canvas. A 9x9 hex board sits in the upper-middle of a near-black frame: bare hexes in dark soil brown with thin gold rims on the outer ring, planted hexes as green box-hedge with five leaf bumps and a dark seam, and a small grey vector mouse with pink ears, whiskers and a curling tail in the middle. Palette is house-correct - soil brown, sage green, gold edge, cream text - and the hedge/soil/edge three-way read is genuinely legible at a glance. But the board is a bare rectangle floating on flat #0b0f0b, six lines of grey system-ui text stack around it, and the bottom 35% of the frame is empty black.

**Wrong with it:**
- The injected '♫ Music' chip sits directly on top of the game's own canvas menu button (HB_MENU={x:12,y:14,w:48,h:48}, line 489) - the '‹' glyph pokes out from the chip's left edge in the hi-res crop - and the chip's bottom border cuts through the top of the line 'Tap an empty tile to plant a hedge.' (drawn at y=92, line 494). Two overlaps from one chip.
- The board is a hard-edged rectangle of hexes ending abruptly on flat black: no pot, no soil bed, no fence, no vignette, nothing to say 'veg patch' except the copy. Nothing meets anything through a transition.
- Every hedge is the identical five-bump stamp at the identical rotation (pts array at line 455), so twenty-odd hedges read as one texture tiled rather than a garden that grew. Add per-cell rotation and two or three bump layouts off the hash.
- Six lines of grey text - title, mode/count, two instruction lines above the board and two footer lines below - crowd the small board into the middle third; the frame is more type than game.

**Background now:** Flat CSS, no image. body is radial-gradient(120% 80% at 50% 0%, #101610, #05070a, #000) and #stage is a solid #0b0f0b; the canvas paints only the board and the mouse on top of it. No assets/ folder exists (assetFiles 1 is the og image), so there is no art-loading hook of any kind.

**Background wanted:** A painted 540x960 night veg patch: soil rows in perspective at the bottom, a low woven fence and bean poles at the sides, one warm lantern glow at the top-left, and the middle band held dark and quiet so the hex board reads on top. Plus a soft radial pool of light under the board so the board's rectangle does not simply stop against black.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-garden-540x960.jpg` | 540x960 full-bleed JPG, night vegetable patch: soil rows and a low woven fence, warm gold lantern falloff from the upper-left, sage and copper foliage in the outer 15%, central 480x420 band held under 10% luminance | replaces the solid #0b0f0b stage fill and fills the dead lower third of the frame |
| `hex-soil-96x96.png / hex-hedge-96x96.png / hex-edge-96x96.png` | three 96x96 transparent PNG hex tiles - turned earth with pebbles, a clipped box hedge with warm rim light, and a gold-lit garden-edge tile with the soil falling away past it; each drawn to the same hex outline so they tessellate | replaces drawHedge()'s gradient-fill-plus-five-circles (line 449) and the two flat hex fills, so the board becomes painted ground instead of three colour swatches |
| `mouse-96x96-4frames.png` | one 384x96 transparent strip, four 96x96 frames: idle sniffing, mid-run with ears back, trapped with wide eyes, escaping with a happy squint - painted grey-brown with pink ears and nose, warm rim light | replaces the ellipse-and-arc vector mouse in drawMouse() (line 459) whose three states are already coded, so the art can drop straight into the existing phase switch |

**CSS to do:**
- Canvas HUD, line 489: move HB_MENU={x:12,y:14,w:48,h:48} out of the top-left - the injected chip claims the top-left 97x48 viewport box permanently. Put the back button beside the retry/help pair at the top right (e.g. x:VW-172) so the chip covers nothing tappable.
- Line 493: ctx.font='700 13px system-ui' -> '700 18px' and line 501-504 footer 12-13px -> 18px. At the 540-wide stage's 0.694 phone scale 13px renders as 9 real px, under the 0.7rem floor.
- #stage (line 39): background:#0b0f0b -> the painted bg-garden-540x960.jpg, center/cover.
- In drawBoard, add a radial-gradient pool (ctx.createRadialGradient at the board centre, rgba(122,179,86,0.10) -> transparent) painted under the hexes so the board edge fades into the ground instead of ending on a hard line.
- drawHedge (line 449): rotate the pts bump array by a per-cell hash so twenty hedges stop being one stamp repeated.

**Readability:** The mode/count line 'Easy · hedges planted: 2' is 13 stage px = 9 rendered px, and both footer lines are 12-13 px = 8-9 rendered px, all in #8a9178 muted grey on near-black. Under the floor and low contrast. The 48px canvas HUD buttons are 48 stage px = 33 real px - under the 48px touch minimum before the chip even lands on one of them.

**Music chip:** Yes, two things. The chip sits on the game's canvas-drawn back button at (12,14,48x48) - only the '‹' arrow escapes past its left edge - and its lower border clips the top of the 'Tap an empty tile to plant a hedge.' instruction line.

### Pollen Panic
`pollen-panic` · satellite · action · first committed 2026-07-02 · impact 4/5 · effort M
`satellites/pollen-panic/index.html`

**Now:** A Pac-Man style maze drawn as flat mid-green rounded bars on a near-black loam ground, with cream pellet dots, five magenta flower blobs and three indistinct pink pests. A pixel HUD in Silkscreen runs across the top and a serif Fraunces title carries the boot card. Coherent and deliberate retro-pixel identity, but every single mark on screen is a canvas fillRect or arc; there is not one image asset in the game.

**Wrong with it:**
- A dead band of roughly 90px of flat black sits between the HUD row and the top of the maze, and the maze is pushed hard against the bottom of the frame. Nothing is vertically centred, so the playfield reads as having slid down the screen.
- The footer 'LUCID WINDS - v4.1' at the very bottom is clipped by the viewport edge and half-covered by the injected 'New song' pill; the two sit in the same 40px strip and neither is readable.
- Every hedge wall is one flat #3F7D3B with no highlight, no shadow and no transition; each wall meets the loam ground on a hard 1px edge. The three pests are the same rounded blob silhouette in three near-identical pinks, so at 375px you cannot tell which chaser is which.

**Background now:** Flat colour only. body background is var(--loam) #101B0E, and the offscreen maze canvas is cleared with o.fillStyle=th.bg; o.fillRect(0,0,...). Zero gradients (gradients:0), zero background-image declarations, zero img tags, no assets folder (only og/). Two custom Google fonts (Fraunces, Silkscreen) are the only non-code visual asset.

**Background wanted:** A painted night garden bed under the maze. Dark loam with warm brown mulch and leaf litter, vignetted to near-black at the edges so the cream pellets keep contrast, and enough interest in the upper band to fill the dead space above the maze.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-garden-loam-750x1334.jpg` | 750x1334, full-bleed. Painted night soil bed seen from above: near-black warm brown with mulch and leaf-litter texture, a soft gold glow bleeding down from the top edge, heavy vignette at the corners. | Replaces the flat #101B0E body fill and gives the 90px dead band above the maze something to be. |
| `hedge-tile-64x64.png` | 64x64, tileable and 9-sliceable, transparent corners. A painted boxwood hedge block: sage green mass, warm gold rim light along the top edge, a soft dark shadow along the bottom. | Replaces the flat green rounded bars. Gives every wall a lit top and a shadowed base so hedges stop meeting the ground on a hard edge. |
| `pests-sheet-256x64.png` | 256x64, four frames at 64x64, transparent. Aphid, beetle, moth, snail. Each a clearly different silhouette (round, domed, winged, shelled) in the game's pink and violet range with a cream eye highlight. | The three chasers currently share one blob silhouette in three near-identical pinks. Distinct silhouettes are the single biggest readability win on this screen. |
| `sunberry-32x32.png` | 32x32, transparent, with a soft warm bloom baked in. A painted berry with a gold highlight and a small leaf. | Replaces the plain fillRect power pellet, so the thing the player chases is visually the prize instead of a slightly bigger square. |

**CSS to do:**
- #stage is flex:1 with align-items:center but the canvas still sits low because #foot is a flex sibling eating the bottom of the column. Pull #foot out of the flow (position:absolute;bottom:4px;left:0;right:0) so the canvas centres in the full leftover height and the 90px hole above the maze closes.
- #foot: position:absolute;bottom:4px with padding-bottom:env(safe-area-inset-bottom,0px) and z-index:1, so 'LUCID WINDS - v4.1' stops being clipped by the bottom edge and stops sharing a strip with the injected New song pill.
- #hud: add padding-right:132px (or move the SCORE/BEST/PETALS stats out of the top-left corner) so the injected Music chip cannot land on the score value and the PETALS label.
- #hud: at 375px the stat block plus the three .icobtn buttons overflow the row and the stat labels get squeezed. Drop letter-spacing:.5px on #hud and reduce .icobtn gap from 6px to 4px, or let the stat block wrap to a second line.

**Emoji as art:** Only the music note glyphs on the icon buttons. There are no emoji sprites; instead every game object is a canvas primitive (fillRect and arc), which is the same problem by a different route.

**Readability:** HUD labels sit at exactly the 11.2px studio floor in cream on near-black, and the ones in the top-left are partly hidden by the Music chip. 'CHAIN 11' is small magenta text drawn on top of a green hedge bar at the maze's top-left corner, low contrast. The .icobtn buttons are a proper 48x48. The footer is clipped.

**Music chip:** Covers the SCORE value and the PETALS label in the top-left HUD, on both the boot card and the play screen. The word 'SCORE' is sliced and '170' is entirely behind the chip.

### Dragon Philosophy
`dragon-philosophy` · satellite · card · first committed 2026-07-05 · **workbench-gated** · impact 4/5 · effort L
`satellites/dragon-philosophy/index.html`

**Now:** A deep violet-black card game set in Cinzel display serif with a real typographic voice. Boot is a HOW TO PLAY panel of small line-art icons and cream body text; the play frame is the patron confirm card for Vairex the Unbroken Pyre - a bordered plate with a thin red arrow glyph, the serif name, an italic epithet, a gold CASUAL stepper and a violet Begin button.

**Wrong with it:**
- The dragon patron has no dragon. Where a portrait belongs there is a 44px red arrow stroke, and the top third of the confirm card is empty violet. A card game named Dragon Philosophy shows the player a directional arrow.
- Two back buttons collide at the top left: the fixed round arcade back button sits directly on the corner of the in-page 'Choose another' pill. They overlap by roughly a third of the pill's height.
- `art/manifest.json` 404s. The bundle fetches it at boot (`fetch('art/manifest.json')` into `window.__DRAGON_ART__`) and every card renders `<img class="card-art card-art--real">` only when the manifest names one. The art pipeline is fully wired and the folder does not exist, so all art falls back to a procedural sigil.
- A painted `menu-bg.jpg` (141KB) ships in the folder and the patron screen shows none of it - that screen sits on flat `--bg`, so the one painted asset in the game is spent on a title card and nothing else.

**Background now:** Flat deep violet-black `var(--bg)` with a single `radial-gradient(1200px 600px at 50% -10%, #7d5ba624, transparent 60%)` wash on body. A painted menu-bg.jpg exists but only appears behind the title; the patron screen shows a faint dark red vignette at the very top and nothing else.

**Background wanted:** art/bg-patron-hall-750x1334.jpg - a dim dragon hall lit by one low brazier, banner colour keyed to the patron (red for Vairex), painted soft so the card plate still reads on top of it. And reuse menu-bg.jpg at ~0.25 opacity behind the patron grid instead of leaving it flat.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `satellites/dragon-philosophy/art/manifest.json` | the file itself, shaped `{ "<cardId>": "art/cards/<cardId>.png" }` | Without it the already-built `card-art--real` <img> never renders, so any painted card art is invisible to the game. This is the cheapest single fix in the batch. |
| `satellites/dragon-philosophy/art/cards/<cardId>.png` | 512x384 transparent PNG per card, painted illustration, roughly 40 non-common cards to start | Drops into `.card__art` over the procedural sigil that every card currently shows. |
| `satellites/dragon-philosophy/art/patrons/vairex.png` | 640x640 transparent PNG, painted head-and-shoulders dragon portrait with warm rim light, one per patron | Fills the empty top third of the confirm card where the red arrow glyph currently stands in for a character. |
| `satellites/dragon-philosophy/art/bg-patron-hall-750x1334.jpg` | 750x1334 full-bleed JPG, dim hall with a single warm light source, dark enough that cream text holds | Replaces flat violet on the screen where the player makes the one choice that shapes the whole run. |

**CSS to do:**
- `.patroncard__philosophy` 10px and `.patroncard__asc` 10.5px and `.ascend__chip` 10px - all three under the 11.2px floor; raise to 12px.
- `.iconbtn` is 38x38 and is used for the ascension minus/plus steppers - under the 48px touch minimum; raise to 48x48.
- `.patrons__back` - add `margin-top:52px` or move it into `.topbar`, so the fixed arcade back button stops sitting on the 'Choose another' pill.
- `.ascend` - reserve a 180px art block above `.ascend__name` so the patron portrait has a place to land and the card stops opening with a lonely arrow in dead space.

**Emoji as art:** The three HOW TO PLAY rows use small glyph icons - a card, a shopping trolley, crossed swords. The trolley for 'SHAPE YOUR DECK' is straight off-voice for a dragon card game; the rest of the game's iconography is decent hand-built SVG, so these three are the odd ones out.

**Readability:** `.patroncard__philosophy` 10px, `.patroncard__asc` 10.5px, `.ascend__chip` 10px and `.ascend__lab`/`.ascend__cap` 11px are all under 0.7rem. 'Win to unlock Ascension 1' is dim grey on violet at 11px. The minus/plus steppers are 38px, under the 48px target. Body text and the serif headings are fine.

**Music chip:** Minor. The chip picked top-right and on boot it overlaps the top-right rounded corner of the HOW TO PLAY panel; on the patron screen it clears the card. Separately, the music unlock SHEET covers the bottom third of the boot screen including the last two HOW TO PLAY rows.

### Flock the World
`flock-the-world` · satellite · puzzle · first committed 2026-08-15 · impact 4/5 · effort M
`satellites/flock-the-world/index.html`

**Now:** Two different games in two frames. Boot is genuinely composed: a painted dark cinematic plate (art/bg/bg_menu.webp) behind a glossy orange-and-red 3D 'FLOCK THE WORLD' logo with a globe in it, cream body copy and one ghost 'HOW TO PLAY' button. The play frame is the opposite: near-black top to bottom, a dim HUD whose labels barely register, empty progress tracks reading 0.0%, a navy tutorial card in the middle, and a row of seven thin grey line icons across the bottom.

**Wrong with it:**
- The play screen wears none of the game's own art. #game (index.html:965) sets no --shot, so the screen you live in for an entire run is flat panel colour plus a black canvas map, while art/bg holds thirteen painted webp plates. bg_warroom.webp and bg_synergy.webp are painted and referenced nowhere in the file at all: art already delivered and never hung.
- The HUD is smoke. Date, Capital, Influence and Suspicion, the SUBJUGATION and PATRIOTISM bars and the WATCHED line are all drawn in --dim on #080d14, and at 375 wide I could not read the top row at 1x. With both bars at 0.0% the whole upper third is grey text on black with two empty tracks.
- The bottom nav is undersized twice over: .nb span is font-size:8px (index.html:442), well under the 0.7rem floor, and .nb svg is 16px dropping to 13px on a short screen, so seven hairline glyphs sit in a row with none of them holding a distinct silhouette. LEDGER, DEPLOY, WATCH, STORY, CRISIS, WORLD and FEED are told apart by 8px caps.
- The menu wordmark is a glossy bevelled orange and red 3D logo with a chrome globe. It is well made but it belongs to a different house: no sage, no gold, no cream, no soft painterly edge, and it is the loudest object in the fleet against a midnight plate.

**Background now:** .screen{background-image:var(--shot);background-size:cover} at index.html:34. #menu sets --shot:url(art/bg/bg_menu.webp) and the end screen swaps between four painted win plates. #game sets nothing, so play is --deep panel colour plus <canvas id='map'> with a .crt scanline overlay on top. 227 asset files and 55MB of real art exist, concentrated in art/badge, art/card, art/cast, art/tree, art/ui, art/event.

**Background wanted:** A painted plate behind the map on #game, dark enough that the canvas stays the brightest thing: a war-room table seen from above with paper edges, a cold monitor glow and a coffee ring. bg_warroom.webp already exists in art/bg and is unused, so the first move is to hang it before painting anything new.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `art/bg/bg_game.webp` | 1080x1920 full-bleed, a night war-room desk seen from above, dark walnut and cold monitor light, paper edges and a coffee ring at the margins, everything within two values of #080d14, no text | gives the play screen, which today is a flat panel colour, the ground every other screen in this game already has |
| `art/ui/hud_plate.webp` | 1080x260 transparent PNG or webp, a brushed dark instrument plate with a hairline sodium edge and four recessed stat wells | backs the Date / Capital / Influence / Suspicion row so the labels stop floating as grey text on black |
| `art/ui/nav_ledger.webp and six siblings (deploy, watch, story, crisis, world, feed)` | seven 96x96 transparent icons, filled shapes with warm rim light rather than 1.7px hairline strokes, each a distinct silhouette (a ledger book, a van, an eye, a page, a siren, a globe, a ticker) | replaces the seven thin inline SVG strokes that collapse into identical grey marks at 13-16px |
| `art/bg/wordmark_alt.webp` | 900x360 transparent, the same lockup redrawn in warm gold and cream with a soft rim light instead of chrome and orange gloss | brings the loudest object in the fleet back into the midnight greenhouse palette, if the Director wants the house look to win |

**CSS to do:**
- #game (index.html:965): add style="--shot:url(art/bg/bg_warroom.webp)" so the play screen picks up the painted plate that is already in the repo and unused, then add a scrim (#game::before with background:linear-gradient(180deg,rgba(8,13,20,.72),rgba(8,13,20,.92))) so the map stays the brightest thing.
- .nb span (index.html:442): font-size:8px is under the 0.7rem floor. Raise to 10px, colour var(--ice) instead of var(--dim), and cut the letter-spacing from .08em to .04em so seven labels still fit 375px.
- #hud .slab (the Date/Capital/Influence/Suspicion labels): they are var(--dim) on #080d14. Lift to var(--ice) at .8 and give .hudrow a background:rgba(12,18,28,.85) with a 1px var(--line) top edge so the row reads as an instrument panel instead of stray text.
- #hud .hudrow: add padding-left:0 and shift #ctlrow, or reserve the top-left 120x44 corner, because the injected music chip lands there and covers the first two stats.

**Emoji as art:** Almost none, and that is a credit: the icon work is inline SVG and painted webp. The 98 emoji counted are UI characters, the hamburger U+2630, the note U+266A and the dismiss U+2715 on the BREAKING bar, not art stand-ins.

**Readability:** Worst in the batch after whack-box. .nb span at 8px is a clear fault. The HUD stat labels and the SUBJUGATION/PATRIOTISM bar labels are dim grey on near-black and I could not resolve them at 1x. The LIVE pill and the WIRE ticker at the bottom are dark orange on black at what looks like 8-9px. Touch targets are fine, .nb is min-height 52px dropping to 48px.

**Music chip:** Confirmed, twice. On the boot screen the chip covers the word SKY in 'SKY WOLF STUDIO PRESENTS'. On the play screen it is worse: it sits over the top-left of the HUD and completely covers the Date and Capital stats, which are the two numbers the player checks most often.

### Parallel
`parallel` · satellite · puzzle · first committed 2026-08-16 · **workbench-gated** · impact 4/5 · effort L
`satellites/parallel/index.html`

**Now:** Play is a genuinely composed board: a slate panel of indigo wall blocks with a glowing violet-to-amber mirror line down the centre, a violet circle A and an amber diamond B, dashed door outlines, then a stat row, a tier bar and four large control buttons. Boot is the THE ONE RULE explainer over the dimmed board with a big violet BEGIN slab and a music-unlock card filling the bottom third.

**Wrong with it:**
- The "New song" chip sits directly on top of the A LEFT control button - it completely covers the left-arrow glyph and eats half of the JUMP button beside it. One of the game's four inputs looks unusable.
- The Music chip covers the PARALLEL wordmark and the "level 1 tier 1 first light" line in the top bar; on the boot screen the same chip swallows "ONE RULE" out of "THE ONE RULE", leaving the heading reading "THE".
- Every wall block is the identical flat #2b3048 rectangle with one inset hairline. Walls, floor and background panel meet at hard edges with no transition and no light direction, so 80% of the frame is a grid of interchangeable grey cells and the two avatars are the only shapes with any weight.
- The palette (violet #8b7cf6, amber #f3b562, slate #2b3048, near-black #0a0b0f) is a different game's palette from the arcade's sage, gold and cream - there is no sage anywhere on screen.

**Background now:** #board is a flat #0d0f16 fill with a 1px #242836 border and 14px radius; walls are flat #2b3048 divs; shell is --bg:#0a0b0f. The only background-image in the whole file is a 45-degree repeating hatch on the crumbling tile. No art files - the folder holds icons and a manifest only, and ART_ASSETS.md states plainly that every icon is a font glyph and that is the single biggest reason it reads plain.

**Background wanted:** bg-parallel-540x960.jpg - a deep indigo chamber behind the board with a soft vertical light shaft running along the mirror line and a warm bounce at the floor, so the board reads as a mirrored room rather than a grey grid on a grey page.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `tile-wall-92x92.png` | 92x92 transparent, painted stone block with a warm top rim light and a dark bottom bevel, 3 variants; must still read at 30px, the 12x12 phone cell size named in ART_ASSETS.md | replaces the flat #2b3048 .t-wall rectangle that fills most of the frame and gives the board a light direction |
| `avatar-a-92x92.png + avatar-b-92x92.png` | 92x92 transparent pair - a violet moth-lantern for A and its amber mirrored twin for B, soft inner glow, clearly the same creature reflected | replaces the CSS circle and diamond so the mirror premise is legible at a glance |
| `door-a-92x92.png + door-b-92x92.png` | 92x92 transparent, arched doorway with a lit sill in each twin's colour and a soft threshold glow | replaces the dashed CSS outline, which currently reads as an unfinished placeholder rather than a goal |
| `pad-icons-64x64.png` | 4-up 64px sheet on transparent (left, jump, wait, right) painted in cream with a warm rim, matching stroke weights | replaces the font glyphs on the control pad, which the game's own art doc names as the reason it looks plain |
| `bg-parallel-540x960.jpg` | 540x960 full-bleed indigo chamber, vertical light shaft on the centre line, near-black corners | gives the board a room to sit in instead of a flat --bg fill |

**CSS to do:**
- #pad - the injected "New song" chip lands on the A LEFT button; add margin-bottom:64px to #pad, or force the injected chips into a top corner in this game, so no control is ever covered.
- #bar title block - reserve padding-left:120px under 420px width so the Music chip stops covering the PARALLEL wordmark and the level line.
- .stat span (index.html:165) - 10px letterspaced --dim grey, under the 0.7rem floor; raise to 12px and lift to --ink at 70% opacity.
- #pad button small (index.html:132) - same 10px problem on the control labels; 12px minimum.
- .t-wall (index.html:63) - the flat fill plus one inset hairline gives every block an identical silhouette; add inset 0 2px 0 rgba(255,255,255,.10) and inset 0 -3px 6px rgba(0,0,0,.5), or swap to tile-wall-92x92.png.

**Emoji as art:** yes - the entire icon set is font glyphs: menu bars, gear, restart, close, left, up, square, right, down, key, star, circle and diamond, across the control pad, the top bar and the level select. ART_ASSETS.md already names this as the reason the game reads plain.

**Readability:** .stat span and #pad button small are both 10px (0.625rem), under the 0.7rem floor, in --dim grey on a dark panel - "moves / deaths / off mirror / par" is the hardest text in the frame. The board caption "A obeys. B mirrors. Both doors at once." is small grey on the board's own dark fill. Control buttons are clamp(62px,13vh,118px) tall so touch is fine, except A LEFT, which the New song chip covers.

**Music chip:** yes, twice, and one of them is a control: the "New song" chip covers the A LEFT button and half of JUMP on the control pad, and the "Music" chip covers the PARALLEL title plus the level line in the top bar (and "ONE RULE" of "THE ONE RULE" on boot).

**Looks broken** (confirmed on a second look, severity ugly)**:** Injected furniture covers a primary control. In both 2play and 3later the "New song" chip is drawn over the bottom-left control button - the left-arrow glyph and its "A LEFT" label are entirely hidden and the JUMP button's label is clipped to "MP". The "Music" chip covers the game's own title in the top bar in the same frames. Capture reached "sparse-ui" but the board itself rendered fully; the overlap is the failure, not the render.

### Hedgerow
`hedgerow` · satellite · puzzle · first committed 2026-07-07 · impact 4/5 · effort M
`satellites/hedgerow/index.html`

**Now:** The title screen is genuinely painted — a moonlit garden with a big moon, layered blue-green foliage, coral flowers and fireflies, with the sage HEDGEROW wordmark over it. The play screen throws that away: the bed fills the frame with a dense multicoloured confetti static, two flat lime bands where hedges have grown, and a grey brick-like lower third; the painted backdrop survives only as a 30px sliver at the very top and a thin margin round the wooden border.

**Wrong with it:**
- The open bed is soil.jpg (a busy 240x239 painting of teal and gold pebbles) redrawn at 68x68 and tiled roughly 8 across by 11 down. All that detail aliases into high-frequency static — the frame's largest object reads as visual noise, not soil. The code comment at index.html:269 says 'pre-rendered continuous soil so the open bed reads as one field, not a tile grid'; it does the opposite.
- Claimed cells draw planted.jpg once per 34px cell (CS=34), so a 240px seedling painting is crushed to a 34px stamp and repeated 15 across. The bottom third stops reading as a planted bed and reads as grey paving with a visible 34px brick grid.
- The pests vanish into that noise. In -2play the red ladybug is only legible where it sits on the grey claimed zone; in -3later the green grub is invisible until it crosses the same boundary. A pest ball on the soil has no rim, no outline and no shadow to lift it off a texture with the same contrast and the same spatial frequency.
- The lime hedge bands meet the soil at a hard 1px edge with no shadow, no root line and no transition — two flat green rectangles laid on static.
- Title screen: the filled lime-green Play slab and the filled gold Skins slab sit directly on the painted moonlit garden, which is the exact thing the project's own 'NO FILLED BUTTON SLABS over painted art' rule bans.

**Background now:** Two layers. Behind everything, the selected skin's game.jpg (555x1000, the painted moonlit garden) drawn cover-scaled — but the play field covers ~92% of it. Inside the wooden border, soil.jpg tiled at CS*2 = 68px into an offscreen canvas, then blitted. Outside the stage, a CSS radial #101610 to #05070a to #000.

**Background wanted:** One painted bed per skin at the real field size, drawn once instead of tiled — a 510x748 near-black loam with quiet, sparse, LOW-contrast detail so pests can sit on it and be read. The busy pebbled texture belongs at 240px on a card, not at 68px repeated eleven times.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `satellites/hedgerow/skins/s1/sprites/soil.jpg` | Repaint at 510x748 (the real field, COLS*CS x ROWS*CS at 540 wide), full-bleed, drawn once with drawCover instead of tiled. Deep near-black loam, a few large soft clods, one or two buried pebbles, contrast kept inside a narrow band so no detail is brighter than a pest. No saturated teal or gold dots. | Replaces the 240px pebble texture that becomes confetti static at 68px tiled. This is the single change that fixes the whole play screen. |
| `satellites/hedgerow/skins/s1/sprites/planted.jpg` | Repaint at 68x68, seamless on all four edges, designed to be READ at 34px: one seedling motif, big simple silhouette, sage on near-black, no fine stippling. | Replaces the 240px seedling field that becomes a grey 34px brick when stamped per cell. Same repaint needed for hedge.jpg and grow.jpg (same 240px source, same 34px cell). |
| `satellites/hedgerow/skins/s1/sprites/ladybug.png` | 96x96 transparent, redraw with a 2px cream rim light on the top-left edge and a soft dark contact shadow baked at the bottom. Same treatment for beetle, snail, aphid, caterpillar, grub — 6 files per skin. | The pests currently camouflage into the bed. A rim and a shadow are what make a ball read on any texture, on all six skins. |
| `satellites/hedgerow/skins/s1/sprites/edge_hedge_510x34.png` | 510x34 transparent strip: the shadowed under-edge of a hedge wall, dark at the top fading to nothing, with a few root wisps. | Gives the flat lime hedge bands a transition into the soil instead of the current hard 1px edge. |

**CSS to do:**
- .btn.primary and .btn.gold on #s-title.skinned: drop the filled linear-gradient fills and use background:rgba(10,14,9,.72) with a 1px var(--gold) hairline and the label in sage/gold, so the painted moonlit garden shows through the button stack instead of being covered by two solid slabs.
- #s-title.skinned .pad: the scrim currently drops to .18 alpha at 34% height, which is where the wordmark sits — raise that stop to .34 so the sage title holds against the bright moon behind it.
- .foot: font-size 11px to 12px (version line, under the 0.7rem floor).
- .skin-card .sc-tag: font-size 10px to 12px on the skin picker (ON / PREMIUM / LOCK badges).

**Emoji as art:** Almost none in play — the pests, soil, hedges and fx are all real PNG/JPG sprites. A ladybug emoji stands in for the feedback button, and the music note glyph for the injected chip; both are injected furniture, not the game's own art.

**Readability:** The HUD is legible (green 'Round 1', cream 'Kitchen Beds', gold 'score 0'), though 'Round 1' is half-covered by the chip. The real readability failure is in the playfield, not the type: the pests do not separate from the bed. .foot 11px and .sc-tag 10px are under the 0.7rem floor. Touch targets are generous — .btn min-height 72px, .settingline 72px.

**Music chip:** Yes. The chip sits top-left over the HUD and covers the words 'Round 1' entirely plus the first word of the level name, so the top line reads '...tchen Beds'. Identical in both -2play and -3later, so it is the permanent placement, not a transient.

### Blackout
`blackout` · satellite · puzzle · first committed 2026-08-16 · **workbench-gated** · impact 4/5 · effort M
`satellites/blackout/index.html`

**Now:** A deliberately austere case file. Near-black #0a0b0f page, #14161d panels with 1px #2a2f3b hairlines, a cyan accent and one gold left-rule on the brief. Gold caps header THE QUIET ARRANGEMENT, a cyan pocket-watch dial reading 20 ACTIONS LEFT, a stack of room rows with SEARCH buttons, then six suspects drawn as tiny grey SVG silhouettes with gold spectacle dots and ASK / PRESS buttons.

**Wrong with it:**
- All six suspects share one silhouette: the same head circle and the same torso path from silhouette(i) at line 3078, differing only by a cyan collar chevron and gold specs. At 34x44 they read as the same icon repeated six times, so the cast is visually indistinguishable.
- Every element on the page is the same rounded rectangle at the same radius in the same panel grey (rooms, suspects, brief, buttons), so there is no hierarchy and the eye has no entry point.
- The page has no ground: rows float directly on flat #0a0b0f meeting a 1px hairline with no vignette, texture or transition anywhere, and the bottom of the frame runs out on empty black.

**Background now:** Flat colour: --bg:#0a0b0f with panels at #14161d and #1b1e27. Exactly one gradient in the whole 10KB stylesheet (linear-gradient(180deg,#111319,#0c0e13) on the header). No background-image, no canvas (ART_ASSETS.md confirms grep for canvas/getContext/drawImage returns 0), no art files beyond three PWA icons. The only drawn art is two inline SVG strings: silhouette(i) at 3078 and watchSvg() at 3098.

**Background wanted:** One painted 540x960 parlour plate behind the whole app, sat under a near-black scrim at 12-16% so the case file reads as happening inside a house: dark oak panelling, a mantel clock, a cold fireplace, one lamp. Plus per-room 96x96 vignette thumbs so the room list stops being bare text lines.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-parlour-540x960.jpg` | 540x960, full-bleed, dark oak panelling with a cold fireplace and one lamp, painted almost to black so 12-16% opacity over #0a0b0f still reads as a room | Gives the page a ground. There is currently no background image of any kind, just a flat hex. |
| `room-96x96.png (x6: study, cellar, hall, kitchen, library, conservatory)` | 96x96 each, transparent, painted corner-of-the-room vignettes lit by a single warm source | Fills the left of each .row so the SEARCH A ROOM list has silhouettes instead of six identical text bars. |
| `suspect-256x320.png (x6)` | 256x320 each, transparent, painted shoulder-up figures with genuinely different builds, hats, collars and hair, in the existing cyan/gold/grey key | Replaces the one repeated 34x44 SVG silhouette so the six suspects can be told apart at 44px. |
| `watch-face-256.png` | 256x256, transparent, painted brass pocket-watch face with engraved ticks and a scratched crystal | Sits under the existing SVG hand and ring from watchSvg(), replacing the flat dark disc with the only piece of real object art in the game. |

**CSS to do:**
- .row (line 63): change to display:grid; grid-template-columns:56px 1fr auto and drop a 48px room thumb in the first column so rooms stop being bare text lines.
- .brief (line 60): add background:linear-gradient(180deg,#171a22,#12141a) so the brief separates from the identical panels stacked behind it.
- .act (11px, line 67) and the row sub-labels at 9.5px in #59606e: raise to 11.5px and lighten the sub colour to at least #7c8494, both are under 0.7rem and low contrast.
- body (line 24): add the parlour plate as a fixed background-image with background-blend-mode:luminosity under an rgba(10,11,15,.88) scrim.

**Emoji as art:** Almost none, and this is a point in its favour: 5 emoji, 4 distinct. The art that exists is real drawn SVG, the 34x44 suspect figure and the 52x52 pocket watch.

**Readability:** .act action-cost captions are 11px and the room sub-labels ("open to the house", "staff key only") are 9.5px in #59606e on #14161d, so under the 0.7rem floor and low contrast on top of that. Touch targets are correct throughout, every button carries min-height:48px.

**Music chip:** Yes. On the play frame the Music chip sits bottom-left directly over the sixth suspect's row, covering that suspect's name and the first word of their descriptor. At boot the unlock sheet covers the Hall and Kitchen room rows.

### Picnic Panic
`picnic-panic` · satellite · action · first committed 2026-07-02 · impact 4/5 · effort M
`satellites/picnic-panic/index.html`

**Now:** A red-and-cream gingham picnic blanket (CSS repeating gradients) fills the whole browser frame, and inside a cream-piped, dark-bordered rounded panel sits the playfield: a flat dark-green vertical gradient (#14281c to #2c5234) with a scatter of white specks for stars. Every actor in the fight is a system emoji drawn with ctx.fillText at 18-26px: caterpillars, beetles and bees for the swarm, a potted-flower for the hero, tulips for lives.

**Wrong with it:**
- Bottom-right, the injected feedback disc (dark circle, ladybug glyph, and its own tiny x) sits directly on top of the FIRE button and clips the word to 'FIRE' with the E half-eaten. #btnF is right:16px/bottom:4px, .lwfb-fab is fixed right:12px/bottom:12px, so they are guaranteed to intersect on every phone.
- The swarm has no shared silhouette language: the yellow caterpillar row reads the same weight and colour as the gold HUD text, the green beetles read as clip-art of a different game, and the bee pair at the top is twice the visual mass of anything below it. Twelve emoji from twelve different artists is not an enemy set.
- The hero snapdragon is the least readable thing on screen - an 18px potted-plant emoji at the bottom of the field, smaller and lower-contrast than the bugs it is fighting, sitting on a flat green field with no ground line, no horizon and no picnic props. The only picnic in the picture is the border.

**Background now:** Two CSS repeating-linear-gradients on html,body making the gingham (multiply blend, --blanket-red over cream). Playfield is #stage linear-gradient(--sky-top #14281c to --sky-bot #2c5234). bgImageDecls 0, imgTags 0. The only file in satellites/picnic-panic/ besides index.html is og/card.jpg.

**Background wanted:** bg-picnic-lawn-540x960.jpg - painted night lawn seen from above: mown grass bands receding upward into a warm lantern glow, a corner of the checked blanket and a wicker basket bleeding in at the bottom edge, fireflies as depth. Full-bleed, keeps the gingham frame around it, gives the swarm somewhere to descend into.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `picnic-swarm-sheet-512x512.png` | 512x512 transparent, 8 cells of 64x64 (fly, ant, mosquito, beetle, ladybug, wasp, butterfly, cricket) painted as one family: same warm gold rim light, same 3px cream outline, same top-down 3/4 angle | replaces the 12 mismatched system emoji in the TYPES map (index.html:551-562) so the swarm reads as one enemy set instead of twelve clip-art strangers |
| `snapdragon-hero-96x96.png` | 96x96 transparent, 3 frames (idle, lean-left, lean-right) of a terracotta pot with a snapdragon, warm gold rim light, big readable silhouette | replaces the 18px tulip emoji player at index.html:1292 - the hero is currently smaller and dimmer than the enemies |
| `bg-picnic-lawn-540x960.jpg` | 540x960 full-bleed painted lawn as described in background_want, deep #14281c ground | replaces the two-stop flat green gradient on #stage; gives the field a horizon so the descent has depth |
| `picnic-powerup-icons-320x64.png` | 320x64 transparent, 10 cells of 32x32: painted seed pods, thorn, spore cap, honey drop, blossom, hourglass, ward sigil | replaces the 10 food-and-plant emoji drawn at 18px serif in index.html:1321 (acorn, chilli, cactus, mushroom, honey pot, target, hourglass) which currently read as a snack menu, not as weapons |

**CSS to do:**
- #btnF (index.html:58) - it is guaranteed to collide with the injected .lwfb-fab. Move FIRE to bottom:calc(env(safe-area-inset-bottom) + 84px) or add left-hand default, so the 80px fire disc and the 48px feedback disc never overlap.
- #stage - the playfield meets the gingham through a flat 6px #123020 border and a 6px cream ring: a hard edge. Add an inset shadow (box-shadow: inset 0 0 40px rgba(0,0,0,.5)) so the field sinks into the cloth instead of being pasted on it.
- #hud - SCORE/HI are 12px Courier with a 1px letter-space at the very top of the stage while the honey-jar counter is alone in the top-right; give the row a rgba(0,0,0,.35) rounded plate so it reads as a HUD and not as text lying on the grass.

**Emoji as art:** Total. All 12 enemy types are emoji in the TYPES map (index.html:551-562, including the boss which reuses the same bee as the wasp), the player is a tulip glyph at 18px (line 1292), lives are tulips at 13px (line 1394), all 10 power-ups are food and plant emoji (line 1321), and enemies carry a tulip when they capture. 40 distinct emoji, zero image files.

**Readability:** The FIRE label is clipped mid-word by the feedback disc - the one control the game names in its own instructions. Lives are 13px tulips in the bottom-left corner, under 0.7rem. HUD at 12px Courier on dark green reads fine; the gold GARDEN GALAGA subtitle on the title card reads fine.

**Music chip:** The floating chip parks over the top-left rounded corner of the stage (it clears SCORE/HI by ~12px, so no text is lost), and its sibling 'New song' chip sits at bottom-left just under the lives row. The worse injected collision is not the music chip: the feedback fab (ladybug disc plus its own x) lands squarely on the FIRE button in both -2play and -3later. On boot, the music unlock sheet covers the bottom third including the whole third mode card.

### Letter Launch
`letter-launch` · satellite · word · first committed 2026-08-18 · impact 4/5 · effort M
`satellites/letter-launch/index.html`

**Now:** A deep felt-green table lit from the top, with a real typographic identity — Fraunces serif for numerals and the wordmark, Bricolage Grotesque for labels, cream tiles with a warm inset edge, amber accents. The boot menu reads well: a serif LETTER LAUNCH, a gold-tinted feature card and three mode cards. The play screen is much emptier: two stacked header bars, a wooden dispenser holding one cream 'E' tile, three teal dots and three gold coins floating in a large bare space, and a 7x6 grid of 42 identical empty dark squares filling the lower half.

**Wrong with it:**
- The board is the biggest object on screen and carries no art at all: 42 identical rgba(0,0,0,.16) rounded squares on a flat felt fill (game.js:736), no wooden frame, no felt weave, no cell wells, no shadow. It reads as a placeholder grid.
- The pin field between the dispenser and the board is nearly empty and unmotivated: three flat #11463c dots and three gold coins scattered across a bare gradient with roughly 130px of dead space around them. Nothing groups, nothing frames the drop, and the eye has nowhere to land between the tile and the grid.
- Two full header bars stack at the top — SCORE / Climb / 200 / the E R N tray, then hamburger / Climb 1/3 / LOG REEF WIND / 11 / refresh — eating about 95px of a 667px screen before play begins, and the two rows repeat the same hamburger glyph and the same 'Climb' word.
- The three power-ups along the bottom are raw emoji (shuffle, recycle, bomb) on amber squares, and their cost badges (40 / 30 / 50) hang off the bottom of the buttons right at the frame edge, clipped by the safe area.
- The palette is a casino felt green and gold, not the midnight-greenhouse house style — no near-black ground, no sage, no rose. It is coherent, just not this fleet's.

**Background now:** One CSS radial gradient on body: radial-gradient(120% 80% at 50% -5%, #2b554b 0%, #20413a 45%, #16302a 100%). The canvas board fills over it with skin().felt.board and rgba(0,0,0,.18)/.16 rounded rects. No images anywhere — the whole satellite ships three PNGs and all three are app icons.

**Background wanted:** A painted felt table with an actual board: the current radial is fine as the room, but the play area needs a real surface — a wooden or brass-cornered board plate with painted cell wells under the grid, so the 42 empty squares stop reading as a placeholder.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `satellites/letter-launch/docs/art/board-plate-480x420.png` | 480x420 transparent PNG, 9-slice safe. A wooden board plate with brass corner caps, a felt inlay, and painted recessed wells on a 7x6 grid; drawn once behind the tiles. | Replaces the 42 flat rgba(0,0,0,.16) rounded rects drawn in game.js:736 — the largest and emptiest object on the play screen. |
| `satellites/letter-launch/docs/art/peg-brass-48x48.png` | 48x48 transparent. A painted brass bumper peg with a top highlight and a soft contact shadow underneath. | Replaces the flat #11463c circles at game.js:721, which currently read as three dots someone forgot to finish. |
| `satellites/letter-launch/docs/art/coin-gold-40x40.png` | 40x40 transparent. Painted gold coin with a struck star face and a rim, matching the amber #eaa53b token already in the HUD. | Replaces the canvas circle plus a text star glyph rendered in Bricolage Grotesque at game.js:713. |
| `satellites/letter-launch/docs/art/item-shuffle-64x64.png` | 64x64 transparent, three files: item-shuffle, item-recycle, item-bomb. Painted objects in the game's own wood-and-brass language, not glyphs. | Replaces the shuffle / recycle / bomb emoji standing in for the three power-ups along the bottom bar. |
| `satellites/letter-launch/docs/art/mode-levels-96x96.png` | 96x96 transparent, four files: mode-levels, mode-climb, mode-hunt, mode-daily. Small painted scene per mode — a stacked tile tower, a rope and pin, a lantern over a word list, a torn calendar leaf. | Replaces the target / climber / magnifier / calendar emoji doing the icon job on the four menu mode cards. |

**CSS to do:**
- .topbar (height:54px) and .levelbar: merge into one row — both carry a hamburger and both say 'Climb'. Dropping the duplicate frees ~40px of a 667px screen back to the board.
- .item: min-width 52px height 44px — raise height to 48px to clear the touch floor, and move the .cost badge from an overhang to inset bottom:4px so the 40/30/50 numbers stop being clipped by the frame edge.
- .qtile.small: 25x29px — far under the 48px touch floor if it is tappable; if it is display-only, keep the size but raise its 14px label.
- .lmenu, .lretry: 26x26px — both are real buttons and both are barely half the 48px floor.
- .hint at 9px and .cost at 10px: raise to 12px minimum (under the 0.7rem floor).
- body background: the radial #2b554b to #20413a to #16302a is a casino felt, not the house midnight greenhouse — if the fleet look matters, shift --felt0/--felt/--felt2 toward #1a2416 / #12180f / #0d100c and let the amber carry the warmth.

**Emoji as art:** Shuffle, recycle and bomb emoji are the three power-up icons on the play bar; target, climber, magnifier and calendar emoji are the four mode-card icons on the menu; a coin emoji is the currency icon in the top bar; a speaker emoji is the sound toggle. Plus a text star glyph drawn in Bricolage Grotesque as the coin face inside the canvas (game.js:713).

**Readability:** Type is the strongest thing here — real Fraunces and Bricolage Grotesque, cream on deep felt, good contrast. Faults are size: .hint 9px, .cost 10px, .lchip and .levelbar .lvl 11-13px are at or under the 0.7rem floor, and the touch targets miss badly — .lmenu/.lretry 26x26, .qtile.small 25x29, .iconbtn 34x34, .pill 28px tall, .item 44px tall. Nothing on the play bar reaches 48px.

### Snakes & Ladders
`snakes-ladders` · satellite · board · first committed 2026-07-18 · impact 4/5 · effort M
`satellites/snakes-ladders/index.html`

**Now:** A 10x10 board of light-green rounded squares in two alternating tints fills the top 55% of a near-black page, with eight hand-drawn tan snakes (segmented bodies, diamond markings, white googly eyes, a pink tongue) and eight brown stick ladders laid across it. Below the board: a cream 'Computer rolling...' line, a small dark ROLL pill, one white rounded die with a single pip, and two player cards. Everything below the board sits on flat black.

**Wrong with it:**
- The board has no frame and no transition. A bright #8ec462-ish green rectangle meets the black page on a dead straight hard edge on all four sides - no wooden rim, no shadow, no vignette, so the board reads as a screenshot pasted onto the page.
- Board numbers are unreadable. `ctx.font='800 13px system-ui'` in a 540px stage scaled to 375 renders about 9 real px, and START/GOAL at `700 8px` render about 5.6 real px, in #31401f on light green - a low-contrast dark-on-mid-green at half the 0.7rem floor.
- The die is a CSS-grade object in a void: `createLinearGradient(#fbf6e9 to #e6dcc4)` on a 14px-radius square with one black dot, sitting alone in ~180px of empty black with no cup, no tray, no table.
- The snakes and ladders tangle. Around squares 49-50 and 31-32 a ladder rail crosses a snake body with no depth cue - same weight, same brown family, no shadow - so the two read as one scribble.

**Background now:** Two flat layers, no image. Page: `radial-gradient(120% 80% at 50% 0%, #101610, #05070a 70%, #000)`. Canvas: `createLinearGradient(0,0,0,VH)` #101a11 to #0c130b to #0a0f08. bgImageDecls = 0; the only asset in the folder is og/card.jpg.

**Background wanted:** A painted tabletop, 540x960: dark oak boards running horizontally with warm rim light picking out the grain, going near-black at the top and bottom edges so the HUD and the player cards stay legible, and a soft warm lamp pool centred behind the board. The board itself then gets a carved wooden frame plate so it meets the table through a transition instead of a hard cut.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-table-540x960.jpg` | 540x960 full-bleed JPG. Dark oak tabletop, horizontal grain, warm lamp pool centred at y~330, corners falling to near-black. | Replaces the canvas gradient fill at index.html:342. Gives the die and the player cards a surface instead of a black void. |
| `board-frame-500x500.png` | 500x500 PNG, transparent centre. A carved sage-and-gold wooden rim about 22px thick with mitred corners, a Celtic corner knot at each corner, and an inner drop shadow onto the play squares. | Kills the hard rectangular edge where the green board meets black. Ties the game to the house card border language. |
| `snake-body-tiles-256x64.png` | 256x64 PNG strip, transparent: head, three body segments, tail, painted with a sage-green back, cream belly scales, warm rim light along the top of the coil. | Replaces the flat tan `#8a5a30` stroke bodies. Painted scales read as snakes, not worms, and separate them from the brown ladders they currently tangle with. |
| `ladder-wood-64x256.png` | 64x256 PNG, transparent, 9-slice friendly. Two warm oak rails with visible grain, rungs with a lit top face and a shadowed underside. | Replaces `strokeStyle='#8a5a30'; lineWidth:2.8` sticks. Gives the ladders a lit face so they sit visibly ABOVE the snakes. |
| `die-face-128x128.png` | Six 128x128 PNGs (die-1 through die-6), transparent. Bone-cream die with a warm gold pip inset, soft top-left key light, rounded corners. | Replaces the two-stop gradient rounded rect at index.html:472. The roll is the whole game beat and it currently looks like a placeholder. |

**CSS to do:**
- index.html:366 `ctx.font='800 13px system-ui'` - raise to `800 17px` and change fill from `#31401f` to `#1d2a12` so the numbers clear ~12 real px at 375 and gain contrast on the green.
- index.html:367-368 `ctx.font='700 8px system-ui'` for START and GOAL - raise to `700 12px`; at 8px stage they render ~5.6 real px and are pure noise.
- `drawBoard()` - draw a rounded-rect clip plus an outer `shadowBlur` under the whole grid so the board sits on the page instead of being cut out of it.
- index.html:386 ladder stroke `#8a5a30` at lineWidth 2.8 - split into a dark under-stroke (#3a2412, width 4) and a lit over-stroke (#b08a52, width 2.4) so ladders read above snakes where they cross.
- `#stage` canvas - add `background-image:url(bg-table-540x960.jpg); background-size:cover` and reduce the canvas gradient fill to a soft multiply scrim so the table shows through under the die and player cards.

**Emoji as art:** Almost none - 9 emoji across 3 distinct glyphs, and the board, snakes, ladders, pawns and die are all canvas-drawn. The two player-card tokens (the pink and gold pawn dots) are canvas arcs, not emoji.

**Readability:** Bad on the board. Cell numbers ~9 real px, START/GOAL ~5.6 real px, both dark-on-green. The 'Computer rolling...' banner (21px stage, ~14.6 real) and the player cards (15px/13px stage, ~10.4/9.0 real) are also under the 0.7rem floor. The buttons are handled correctly - `.btn{min-height:72px}` in stage px is a deliberate ~52 real px, documented in a comment at index.html:49.

**Music chip:** Yes, and it is the worst one in this batch. The Music chip parks top-left directly over squares 100, 99 and 98 - it hides the GOAL square, the destination of the entire game - and its rounded box also sits on top of the back arrow button, so two controls overlap. A second chip, 'New song', parks bottom-left over the 'You / square 6' player card and covers the player's own square number.

**Looks broken** (confirmed on a second look, severity ugly)**:** Play frame: the injected Music chip (x~10-105, y~8-58 at 1x) covers board squares 100/99/98 including the 'GOAL' label, and overlaps the game's own back-arrow button which is visible only as a sliver behind it. Bottom-left, the 'New song' chip covers the 'square 6' line of the You card. Boot frame: the music-unlock sheet covers the lower half of the 'Play vs Computer' primary button. No missing images; capture.badRequests is empty.

### Super Slice
`slice-3d` · satellite · action · first committed 2026-07-19 · impact 4/5 · effort L
`satellites/slice-3d/index.html`

**Now:** A real WebGL scene. Boot is a blurred low-poly forest (brown trunk, green canopy blobs) behind a three-colour title and a stack of candy-bright button slabs. Play is a top-down dive into a tan rock shaft: flat untextured brown walls front to back, a white-and-gold knife mid-flip, and a hot-pink and a lime sphere sitting on wooden pallets.

**Wrong with it:**
- The shaft is one flat brown. Back wall, side walls and ledges are 0x6a5138, 0x5f4832 and 0x4e3b28 under a 0.6 ambient - three browns within a hair of each other, so wall, ledge and floor all share a silhouette and depth reads as a smear. The painted strata at line 1160 are a 64x512 canvas gradient with 12%-black bands; at this camera distance they are invisible.
- The menu's button slabs are candy sky-blue (.btn.ff), hot pink (.btn.endless) and mint (.btn.climb) filled over the painted forest - filled slabs on top of art - and the root palette (--bg:#12101c indigo, --rose:#ff6d9d) belongs to no other game in the fleet. The pink and lime fruit spheres in the pit clash with the brown for exactly the same reason.
- The HUD is grey on brown: 'FREEFALL 1' sits at low opacity directly on the tan wall with no plate behind it, and the thin gradient progress line under the score is 2-3px and vanishes against the rock. The back '<' chip is a plain black square with no relationship to the world it sits in.
- Every fruit is a single-colour MeshLambertMaterial sphere - no rind, no specular, no leaf, no stem. Sixteen fruits, sixteen flat hex values.

**Background now:** A Three.js scene, no image files. scene.background = 0x1a2416 with matching fog; in Freefall a 64x256 canvas-gradient sky plane plus a plain circle sun (line 1155), and a 64x512 canvas-gradient strata plane for the back wall (line 1167). The 3 asset files are icons and the og card.

**Background wanted:** A painted canyon back wall on the existing back plane: warm ochre and sage rock bands, moss creeping down the upper third, dust motes in a shaft of light, cooling and darkening toward the bottom.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `ff-strata-512x1024.jpg` | 512x1024 full-bleed painted canyon strata: ochre and sage rock bands, mossy rim in the top eighth, a faint central light shaft with dust motes, cool near-black at the bottom | replaces the four-stop canvas gradient at line 1160 so the shaft actually has depth instead of reading as one brown field |
| `ff-wall-rock-256x256.jpg` | 256x256 tileable painted rock face with chisel facets, a warm rim highlight along one edge and a mossy speckle | applied as a map on the two side-wall Lambert materials at line 1171 so the side walls stop matching the back wall exactly |
| `fruit-rind-atlas-1024x256.png` | 1024x256, four 256x256 tiles of painted rind detail (dimpled citrus, waxy apple, ribbed melon, fibrous husk), transparent, to multiply over the existing fruit colours | replaces the flat single-hex spheres in the FRUITS table (lines 504-519) so a watermelon and a plum stop being the same object in two colours |
| `sky-dome-1024x512.jpg` | 1024x512 painted sky for the rim above the shaft: dawn gold at the horizon into deep sage-blue overhead, one soft sun bloom, a few high clouds | replaces the 64x256 three-stop gradient plane and the plain circle-geometry sun at line 1155 |

**CSS to do:**
- .btn.ff (59), .btn.endless (60), .btn.climb (61), .btn.climb2 (62): drop the sky-blue, hot-pink and mint fills for a dark translucent panel, rgba(12,16,10,.72) with a 1px sage or gold border and a gold label, so they stop being filled slabs over painted art
- :root lines 39-40: --bg:#12101c and --rose:#ff6d9d are off-house. Move to --bg:#0d100c, --rose:#e58fa0, and add --sage:#7ab356
- .combo lines 97-98: rgba(255,109,157,0.16) pink on a brown wall. Switch to the gold token and add text-shadow:0 1px 3px #000 so it survives on tan
- #h-lvl ('FREEFALL 1'): add a dark pill behind it - background:rgba(0,0,0,.45); padding:2px 10px; border-radius:10px - it currently sits as low-contrast grey directly on the rock

**Emoji as art:** UI only, 7 distinct: a chequered-flag in the level-clear banner and the ladybug feedback chip; the title-screen help rows use a bullet character. The world itself is geometry, not emoji.

**Readability:** 'FREEFALL 1' renders as low-opacity grey directly on the tan wall with no plate, the worst contrast on screen. The thin gradient progress line under the score is 2-3px and disappears against the brown. The back '<' chip is a plain dark square with a very small glyph inside it.

**Music chip:** In play the 'New song' chip sits bottom-left over empty shaft wall, no collision. On boot the music unlock card covers the 'Endless - best 0 m' button and hides everything below it.

### Fox & Basket
`fox-basket` · satellite · word · first committed 2026-07-31 · impact 4/5 · effort M
`satellites/fox-basket/index.html`

**Now:** The best-composed frame of the four. A rounded panel across the top holds a genuinely built inline-SVG orchard: two layered hill paths in deepening greens, a small stand of tree blobs at the left, a ground band, grass tufts, a stylised orange fox mid-trot, and a red-check picnic blanket with a woven basket at the right. Below it a letterspaced category line, seven green underline dashes for the word, and a 5-column keyboard of dark-green rounded keys with two already greyed out. Palette is house style throughout: near-black ground, deep greens, gold, cream, fox orange.

**Wrong with it:**
- The injected ♫ New song button covers the 'V' key completely and clips the 'W' beside it — a letter of the alphabet is physically unreachable in a guess-the-letter game.
- The ♫ Music chip sits on the scene's 'THE ORCHARD' label at top-left; the label text bleeds out from underneath it and cannot be read.
- The scene's sky is a single flat #1b2a19 rectangle. Above the hills the horizon is completely empty — no moon, no cloud, no light source — so the warm rim on the fox has nothing motivating it, and the panel ends at a hard rounded-rect border against the page black with no vignette or transition.
- The props are not in motivated groups: all three trees are jammed into the far left, then two-thirds of the meadow is bare, then the picnic sits alone at the right. The fox walks through an empty middle with nothing to pass.
- The word is seven bare underline dashes evenly spaced with no tile or slot behind them — a wireframe placeholder sitting directly under a painted scene, in the same frame.

**Background now:** CSS + inline SVG, no image files. Page: `radial-gradient(120% 80% at 50% 0%, #141b12 0%, #06080a 70%, #000 100%)`. The scene panel is `linear-gradient(180deg,#1b2a19 0%, #223018 62%, #2b3a1c 100%)` with an inline SVG (viewBox 0 0 500 250) drawn on top by JS — hills, trees, ground, tufts, blanket, basket, fox, all vector shapes built in the file. The source comment at line 235 says so outright: 'Nothing here is drawn from an asset file.' Only asset on disk is og/card.jpg.

**Background wanted:** assets/bg-orchard-500x250.jpg behind the existing SVG, not replacing it — a painted dusk orchard sky with a low warm moon at upper right (motivating the fox's rim light), soft cloud banding, and far treeline haze, so the SVG hills and fox composite over a real sky. The page ground behind the panel is fine as is.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-orchard-500x250.jpg` | 500x250 full-bleed to sit under the existing SVG, dusk sky graduating deep green to warm amber at the horizon, low moon upper right, soft cloud banding, far treeline haze at the hill line | fills the empty flat #1b2a19 sky above the hills and gives the fox's warm rim light a source |
| `fox-sheet-7x-96x96.png` | one sheet of seven 96x96 transparent frames, the fox at each of its seven step positions — trotting, then slowing, then head-down at the basket — soft painterly, warm rim light from upper right, big readable silhouette | replaces the single vector fox that only translates along x; the source already indexes seven positions (foxX(step), 0 through 6) so the swap is a drop-in |
| `picnic-basket-140x110.png` | 140x110 transparent, woven basket with a red-check cloth spilling out, a pear and a loaf, warm painterly, soft ground shadow | replaces the flat vector blanket+basket shapes at the right, which are the fox's goal and the title object |
| `orchard-trees-3x-120x160.png` | three 120x160 transparent apple trees at slightly different heights, painted, warm rim from upper right, transparent | replaces the three flat tree blobs and lets them be redistributed across the meadow instead of stacked at the far left |
| `letter-slot-40x58.png` | 40x58 transparent, a shallow carved wooden slot with a warm gold lip and a soft inner shadow, cream letter sits inside it | backs the .sl underline dashes, which are currently seven bare lines and are the weakest thing on the screen |

**CSS to do:**
- .scene — add `background:no-repeat center/cover url(assets/bg-orchard-500x250.jpg)` under the SVG, and add `box-shadow: inset 0 -24px 32px -20px #000e` so the panel fades into the page instead of stopping at a hard rounded border
- .sl — add `background:url(assets/letter-slot-40x58.png) no-repeat center/contain` and drop the `border-bottom:5px solid var(--deep)`, so the word reads as carved slots rather than seven underline dashes
- .kb — reserve a bottom row for injected furniture, or move the ♫ New song button above the keyboard; it is currently covering the V key and clipping W, making a letter unguessable
- .hud (the 'THE ORCHARD' chip at top-left) — shift it right of the 56px the ♫ Music chip claims, or centre it, so the scene label is not underneath the injected chip
- .cat — raise from 17px to 20px stage (17px inside the 0.694 stage renders at ~11.8px) so the category line is comfortably above the readable floor
- the tree positions in the scene builder (tree(26,168,15); tree(58,174,11); tree(8,176,10)) — spread the third tree to x≈230 so the props sit in two motivated groups instead of one clump at the far left with an empty middle

**Emoji as art:** Very light — 8 emoji, 3 distinct, and the two visible in the frames (♫ and 🐞) are injected furniture, not the game's own art. The fox, basket, hills, trees and tufts are all hand-built inline SVG. The one place a glyph does art duty is the paw-print bullet, which is an inline SVG data URI in CSS rather than an emoji. Good discipline.

**Readability:** Mostly ok. The category line at 17px inside a 0.694 stage renders at ~11.8px, which is borderline. Keys are 72px stage (~50 rendered px) and the row layout comment in the source shows the 48px floor was already checked and fixed. The 'THE ORCHARD' label is unreadable, but because the Music chip is on top of it, not because of size.

**Music chip:** YES, two separate hits. The ♫ Music chip covers the scene's 'THE ORCHARD' label at top-left in both the boot and play frames. The injected ♫ New song button covers the 'V' key entirely and clips 'W' in the bottom keyboard row — in a game where you tap letters, that makes a letter unguessable.

### Frost Watch
`frost-watch` · satellite · action · first committed 2026-07-11 · impact 4/5 · effort S
`satellites/frost-watch/index.html`

**Now:** A real painted scene: a starry indigo sky jpg with a crescent moon fills the top three quarters, a dark hill silhouette runs behind a row of painted snow-roofed timber cabins and lit braziers along the horizon line, and below that a pale blue-white ice band fills the bottom quarter. The town strip is genuinely lovely; the ice band below it is a 240x320 texture squeezed to 68x260, so the frost crystals are stretched into tall thin diamonds that tile eight times across with an obvious seam.

**Wrong with it:**
- The ground texture is aspect-distorted. assets/meadow/frozen.jpg is 240x320 and is drawn at 68 wide by 260 tall (index.html line 745-746, tw=68, GY=700, H=960), squeezing it to about a third of its authored width. Every ice crystal is a stretched vertical lozenge, and the repeat is visible eight times across the frame. thaw.jpg and bloom.jpg are worse: 240x320 drawn into 45x16.
- The HUD chip row overflows the 540px stage and clips its own labels. In frost-watch-2play.png 'thaw mult' reads 'thaw mul', the wave chip's progress bar runs under the next chip, and the rightmost 'town' chip is cut by the right edge of the frame.
- The sky and the ice meet the town through hard horizontal edges. The painted sky stops at a flat line, the ice band starts at another flat line, and the mlip strip that is meant to be the transition is a 240x320 photo squashed to 45x18, so it reads as a paler stripe rather than a snow crest.
- The horizon is empty in the literal sense: roughly 400 stage px between the moon and the rooftops hold nothing but a gradient and dots. Nothing sits at mid-depth.

**Background now:** Painted. assets/bg/sky.jpg (833x1080) is drawn to fill 0 to GY+40 on the canvas and is also the CSS background of #s-title and #s-over. Below it, procedural far hills in #1b2a3e, then the tiled meadow jpgs. This is the only game in the batch with a painted background already wired.

**Background wanted:** Keep sky.jpg, add the missing mid-ground and re-author the ground. The sky is doing its job; what the frame needs is one silhouette layer between the moon and the roofs and a ground tile authored at the aspect it is actually drawn at.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/meadow/frozen-136x520.jpg` | Authored at the drawn aspect (68x260 stage, so 136x520 at 2x), seamless on the left and right edges, pale blue-white frost crystals with the value pulled down toward #9db8cf so it sits under a midnight sky instead of glowing at near-white. | Replaces the 240x320 frozen.jpg that is squeezed to 68x260. Fixes both the stretched crystals and the ice band being the brightest thing on a night screen. |
| `assets/meadow/thaw-90x32.jpg and assets/meadow/bloom-90x32.jpg` | Authored at the drawn aspect (SEGW 45 x ROWH 16, so 90x32 at 2x), seamless horizontally: thaw is damp dark loam with the first green, bloom is meadow grass with small sage and rose flowers. | Replaces two 240x320 jpgs squashed into 45x16, which is a 1:7 aspect crush. The thaw meadow is the game's whole scoring mechanic and right now it is a smear. |
| `assets/meadow/lip-540x36.png` | Transparent PNG, full stage width, a snow crest with an irregular drifted top edge and translucent icicles hanging 10px below. | Replaces the squashed lip.jpg and turns the hard sky-to-ground line into an actual transition. |
| `assets/bg/treeline-540x140.png` | Transparent PNG, full stage width, a band of snow-laden conifers and one broken watchtower in near-black #0d1520, sitting at roughly y=560 behind the hills. | Fills the 400px of empty sky between the moon and the rooftops and gives the falling shards something to pass in front of. |
| `wire the 8 painted UI plates that already ship` | No new art needed: assets/ui/med_gold.png, med_slate.png, med_solar.png, chip_gold.png, chip_blue.png, chip_greenb.png, chip_smallb.png, chip_plainb.png are in the repo and referenced zero times in index.html. | Eight painted assets are already paid for and unused while chip_plain.png does every job. Free variety on the HUD and the results screen. |

**CSS to do:**
- #hud — the chip row is wider than the 540px stage and clips 'thaw mult' and 'town'. Set #hud{flex-wrap:wrap; row-gap:6px} or reduce #hud .chip padding to 0 8px and font-size to .95rem so every label survives.
- #hud .chip — give it max-width and text-overflow:ellipsis so an overflow degrades to an ellipsis instead of a word sliced by the frame edge.
- #hud .chip span — colour var(--muted) on a semi-transparent #0a0e18b8 plate over a bright ice band is the weakest contrast on screen. Darken the plate to #06080fdd or lift the label to var(--cream).
- The bottom-left corner — the injected 'New song' chip and the feedback bug button both land over the ice band. Reserve the bottom 90px of the ground as a no-information zone (nothing gameplay-critical draws there today, so this is a rule, not a change).
- Canvas draw at line 745-751 rather than CSS: pass the meadow tiles their authored aspect (draw frozen.jpg at 195x260 and tile 3 across, not 68x260 tiled 8 across) so the fix lands even before new art is painted.

**Emoji as art:** Light. The town count and the home button use the unicode house glyph, and there is a small set of HUD glyphs, but the braziers, houses, shards and effects are all painted PNGs. This is the least emoji-dependent game in the batch. Note assets/ui/ic_town.png exists but the HUD chip still prints a glyph.

**Readability:** The instructions wall on boot is well typeset: gold headings, cream body, comfortable line height, readable at 375px. In play, the HUD is the problem: labels are clipped mid-word and the muted grey sits on a translucent plate over bright ice. Touch targets pass, #hud .hbtn is min 72x72 stage px which is 50 real px.

**A "looks broken" claim here was refuted on a second look.** Refuted at 3x zoom on frost-watch-2play.png (750x1334). The claim's two specifics both fail: (1) "thaw mult" is NOT cut to "thaw mul" — the zoomed chip shows the complete string with the final "t" fully drawn; what reads as truncation at 1x is the painted plate's snowflake corner flourish overlapping the t's right side, and the word sits inside the chip's outer rounded rect with margin. (2) The "t

### Hues
`hues` · satellite · puzzle · first committed 2026-06-12 · impact 4/5 · effort M
`satellites/hues/index.html`

**Now:** Boot is a near-black page with a large cream serif HUES wordmark, a letterspaced caps tagline, a row of seven flat colour chips and three outlined mode cards; deliberate editorial typography, no art. Play is two rounded colour swatches labelled TARGET and YOURS above a stock HSV gradient square and a full-spectrum rainbow strip, with a near-white LOCK IT IN slab underneath.

**Wrong with it:**
- The two biggest controls, LOCK IT IN and NEXT ROUND, are solid near-white slabs (.lock uses background:var(--ink), #f3f1ec) and are by far the brightest things on the screen, so the chrome outshouts the two colour swatches the whole game is about.
- The palette has no house in it: :root is --bg #0a0a0c, --ink #f3f1ec, --line #1e1e22, a neutral grey design-tool scheme with no sage, gold, cream or rose anywhere; beside Blobworks or Lamplighter it does not read as the same studio.
- The play screen is a colour-picker widget, the same HSV square and rainbow strip as any paint app, with about 90px of dead empty band between the button and the results panel and a half-slid result sheet whose THIS RUN / TARGET / YOURS columns sit over blank space with no values.

**Background now:** radial-gradient(120% 80% at 50% -10%, #16161b 0%, var(--bg) 55%) over var(--bg) #0a0a0c, plus one inline SVG feTurbulence noise data-URI as a texture overlay. No painted image.

**Background wanted:** bg-hues-540x960.jpg, a painted pigment bench: ground-glass mullers, three open pigment pots (viridian, gold ochre, madder rose), a stained cloth, all in deep near-black with a warm lamp raking from top-left, kept low contrast and heavily vignetted so the two colour swatches stay the only saturated things on screen.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-hues-540x960.jpg` | 540x960, painted pigment-grinding bench in near-black with warm rim light from top-left, full-bleed, heavily vignetted, low internal contrast | replaces the flat radial plus noise overlay and gives the game a place instead of a void |
| `frame-swatch-default-320x220.png` | 320x220 transparent 9-slice with a 25% slice inset, painted brass-and-cream picture frame with a soft inner shadow lip | the TARGET/YOURS swatches currently ship as bare rounded rects while 100+ painted frames already sit unused in satellites/hues/borders/pack/; a painted default puts art on the first play screen |
| `picker-plate-360x300.png` | 360x300 transparent, a painted wooden palette board with a thumb hole, dried paint smears and a 10px inner shadow lip, sized to sit behind the HSV square | turns the stock colour-picker widget into an object in the world instead of a floating browser control |
| `hues-wordmark-420x140.png` | 420x140 transparent, the HUES serif wordmark hand-set with pigment bleed at the stroke ends and a thin gold underscore rule | replaces the plain webfont title on boot, which is the game's only identity moment |

**CSS to do:**
- .lock (hues/index.html line 198): drop background:var(--ink); use background:linear-gradient(180deg,#1a2415,#121a0f) with border:1px solid #c8a84b88 and color:var(--cream). Apply the same to the NEXT ROUND button so neither is a white slab
- :root (line 40): rebase --bg to #0d100c, --ink to #e8dcc8, --line to #243019 and add --gold #c8a84b and --sage #7ab356 so the game reads as Lucid Winds rather than a neutral grey tool
- .sh-runcols span (9px), .hud .label (10px), .tag and .seg-label (11-11.5px), .clabel (10px): all sit under the 0.7rem floor on --ink-faint #54524d over #0a0a0c; raise to 12px minimum and lift the colour to --ink-dim
- The picker block's bottom margin and the results sheet position: close the roughly 90px empty band between LOCK IT IN and the results panel so the play screen stops reading half-empty
- applyEquippedBorder() (line 712): equip a painted frame from borders/pack as the default for a new player instead of the bare rounded rect, so the 116 painted assets already in the repo appear on the first screen

**Emoji as art:** Speaker, question-mark and ladybug glyphs in the top bar, hourglass and similar in the how-to rows; 28 emoji, 17 distinct across the menus and shop. The coin is a real inline SVG, and a comment at line 928 notes the share canvas draws a dot rather than an emoji because emoji fonts are not guaranteed in canvas.

**Readability:** The 9-11.5px letterspaced caps labels (.sh-runcols 9px, .hud .label 10px, .tag and .seg-label 11-11.5px) on --ink-faint #54524d fail both the size floor and contrast. The opposite problem at the other end: the near-white LOCK IT IN and NEXT ROUND slabs glare on a dark screen.

### Siege of One
`siege` · satellite · action · first committed 2026-08-16 · **workbench-gated** · impact 4/5 · effort L
`satellites/siege/index.html`

**Now:** A 200px letterbox lane strip near the bottom of a near-black screen: dark navy sky, two faint dashed blue-grey bands floating in it, a grey dot on the upper band, and a graph-paper floor of thin grid lines. An orange two-tone stick figure with a yellow sword faces two identical grey-blue stick figures walking in. Above the lane, 300px of the 667px screen is a dark briefing panel of orange and cream body text; below it, three flat rounded pad buttons and a full-width gold strip flush to the bottom edge. Boot is a dark title card with an orange HOLD THE GATE slab over the dimmed game.

**Wrong with it:**
- The keep wall reads as two dashed scanline rulers floating in the sky, not architecture: the crenellation gradient at index.html:152 paints 15px teeth over transparent gaps at 7% height, so at 375px wide it photographs as a dotted UI divider, and the CSS moon (line 156) lands as a plain grey dot sitting ON that band like a status LED. The comment block at line 140 already records that v1 looked like a picket fence; v3 still does not read as stone.
- Hero and enemy share one silhouette. The orange defender and the grey runner are the same SVG body, same stride, same head-and-shoulders outline (SIL/sil(), ~line 1881-1995); only hue separates friend from foe, so in the play frame the three bodies scan as one repeated stamp.
- The floor meets the sky on a hard horizontal seam at top:34% with no horizon transition, and the floor itself is back to graph paper: the #lane:before slab courses (line 175) are 1px rgba(255,255,255,.055) lines that at 375px render as a faint grid, exactly the failure the comment above them says was fixed. Nothing casts a contact shadow, so the bodies hover on the lines.
- A saturated full-bleed gold bar sits flush to the very bottom edge under the control pad, ~8px tall, holding nothing. It is not from music-unlocks.js (that injects only the 48px chip and the bottom-left pill) so it is siege's own furniture bleeding past the safe area.

**Background now:** No image files at all beyond the three app icons. Everything is stacked CSS gradients: #lanebox (index.html:146-163) is a six-layer background with crenellation teeth, a radial moon, a night-air vertical ramp and a wall-foot shadow; #lane:before is the floor; #lane:after is a warm radial torch glow from the gate plus a cold vignette at the far end. bgImageDecls = 0.

**Background wanted:** art/lane/sky-wall.png at 375x68 (combat lane height) plus a 2x/3x export: a painted night keep wall seen from inside, solid lit stone mass with notches cut into its top edge, a real moon low behind it, warm haze at the horizon so the stone glows against a cold sky. Paired with art/lane/floor.png at 375x132: flagstone courses receding toward the far end, warm lamp-lit at the gate end going cold and blue-grey at the mouth, with a soft transition band where the floor meets the wall foot instead of the current hard 34% seam.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `art/lane/sky-wall.png` | 375x68 at 1x, export 1125x204 at 3x, full-bleed, no transparency. Painted night keep wall from the inside: solid lit stone with merlon notches cut in the top edge, moon low and behind, warm horizon haze under it. | Replaces the six-layer #lanebox CSS stack (index.html:146-163) whose dashed teeth read as a scanline ruler and whose radial moon reads as a grey status dot. |
| `art/lane/floor.png` | 375x132 at 1x, export 1125x396 at 3x, full-bleed, tiles horizontally. Flagstone courses in perspective, lit warm amber at the left (gate) end fading cold blue at the right, top 12px a soft transition band into the wall foot. | Replaces #lane:before (index.html:175), whose 1px slab lines photograph as graph paper and meet the sky on a hard 34% seam. |
| `art/hero/walk.png` | 4-frame horizontal strip, each cell 180x243 (3x of the 60x81 combat body), transparent PNG. Orange-cloaked defender, big readable silhouette, warm gold rim light from the gate side, sword held low. | Replaces the shared sil() SVG so the hero stops being the same stamp as the enemies; ART_ASSETS.md S02 already specs the full set. |
| `art/enemies/runner-walk.png` | 4-frame horizontal strip, each cell 180x243, transparent PNG. Thin hunched runner, cold blue-grey, cool rim light from the far end, distinctly narrower shoulders and forward lean than the hero. | Gives the commonest enemy a silhouette the player can tell from their own body at a glance; ART_ASSETS.md S03 specs the hit/die/special companions. |
| `art/lane/gate.png` | 13x132 at 1x, export 39x396 at 3x, transparent PNG. Iron-banded timber gate leaf with a lit warm edge on its inner face. | The gate is the whole premise and currently renders as a 13px orange accent line (#gate, index.html:205); a painted strip at the same 13px makes it read as a door without changing the truthful cell width. |

**CSS to do:**
- #lanebox (index.html:146): once sky-wall.png lands, drop layers 1-4 and 6 and keep only the night-air ramp as a fallback behind the image, so the dashed teeth stop rendering at all.
- #lane:before (index.html:175): reduce the 90deg 46px seam gradient to opacity 0 and let the floor plate carry the stone; keep the inset box-shadow, it is the only thing giving the lane depth.
- .ent (index.html:232): add a contact shadow, e.g. an ::after ellipse 34x7 at rgba(0,0,0,.45) blurred 4px anchored at the body's feet, so figures stand on the floor rather than hover on the grid lines.
- .hpbar (index.html:239) and the 9px HP numerals under each body: the '58' label renders under 11.2px on a 375px phone. Lift to 12px and add a 1px dark stroke, or drop the numeral and keep only the bar.
- #hint (index.html:313) at font-size:11px and the 'STILL COMING / MORE BELOW' caps row: raise to 12px minimum, and lift the muted colour off var(--muted) which is illegible over the near-black lane.
- #buildbar / the combat pad container (index.html:293): the padding uses calc(6px + var(--sb)) but a full-width gold strip still bleeds flush to the bottom edge in the 375x667 frame. Find and clip that strip inside the padded box.

**Readability:** The HP numeral under each enemy renders at roughly 9px and the 'STILL COMING' / 'MORE BELOW' caps row at about 9-10px, both muted grey on near-black. #hint is font-size:11px. All three are under the 0.7rem (11.2px) floor. The three pad buttons are comfortably over 48px. The briefing body copy is fine at ~14px but consumes 300 of 667 vertical px.

### Shell Shuffle
`shell-shuffle` · satellite · pattern · first committed 2026-06-12 · impact 4/5 · effort M
`satellites/shell-shuffle/index.html`

**Now:** A deep aubergine-to-plum page (three stacked radial/linear gradients, no image) with a warm gold HUD row, a gold gradient-clipped Fredoka title and two cup silhouettes floating dead centre. The cups themselves are genuinely painted: a base64 WebP tropical sunset (palm island, orange sun trail on water) clipped into a tapered cup shape with a cream inner rim and a soft drop shadow, so the only real art in the frame is a beach photo sitting in a purple void with no table, no floor, no horizon.

**Wrong with it:**
- The cups float. `.table` is only a radial-gradient ellipse at rgba(255,210,150,.18) and is invisible against the plum ground, so two lit objects and their hard drop-shadows hang in empty space with nothing under them and no line where a table meets a wall.
- The sunset cup skin fights the room. A saturated orange/magenta tropical photo against a #241634 purple ground shares no hue with the HUD gold or the page, and it is the DEFAULT skin (CUPS[0]) so every new player's first frame is the clash.
- The boot screen has a ~220px empty hole between 'Tap Start and find the ball!' and the Start Game button - the stage is reserved at height:260px and paints nothing until the first round, so the hero of the page is a blank purple rectangle.
- The injected bug-report widget's close X lands on the word 'pays' in the hint line and its ladybug puck crowds the right edge of the 'How to play' button.

**Background now:** No image. body background is three layers: radial-gradient(120% 80% at 50% -10%, rgba(255,206,140,.16)) + radial-gradient(90% 60% at 50% 115%, rgba(120,40,120,.35)) + linear-gradient(160deg,#140f1f,#241634 55%,#3a1a3f). bgImageDecls = 0.

**Background wanted:** A painted carnival-table backdrop, 540x960: a dark walnut table edge across the lower third with warm rim light along the front lip, a soft velvet-curtain fall behind it going near-black at the top so the HUD stays legible, and one warm lamp pool centred where the cups sit. That single plate gives the cups a surface, a horizon and a reason for the drop shadows.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-table-540x960.jpg` | 540x960 full-bleed JPG. Dark walnut table edge across the lower third, warm rim light on the front lip, deep plum velvet curtain behind falling to near-black at the top, one soft lamp pool centred at y~430. | Replaces the flat three-gradient body. Gives the cups a floor and a horizon so they stop floating. |
| `table-mat-420x120.png` | 420x120 PNG, transparent. An oval felt mat with a stitched gold edge and a soft inner shadow, seen at the same low angle as the cups. | Replaces `.table` (an 18% alpha radial ellipse that never reads). Contact-shadow anchor so each cup lands on something. |
| `cup-greenhouse-260x300.webp` | 260x300 WebP at aspect ~1.15 to match the existing skin contract, sage-and-gold botanical pattern (fern fronds, a gold rim band) on a near-black ground. | A house-style default skin to replace CUPS[0] 'Sunset'. The tropical photo is the first thing a new player sees and it belongs to no other screen in the fleet. |
| `ball-dew-96x96.png` | 96x96 PNG, transparent. A glass dew-bead with a warm gold specular highlight and a faint sage inner glow. | The ball is currently a CSS radial-gradient circle; the reveal moment is the payoff shot and deserves a painted object. |

**CSS to do:**
- `.table` - replace the radial-gradient with `background-image:url(table-mat-420x120.png); background-size:contain; background-repeat:no-repeat;` and raise height 34px to 96px so the cups sit ON something.
- `#playfield` - on the boot screen (before the first round) paint the cup art at 45% opacity as a ghost preview instead of leaving a 260px blank; kills the empty hero hole.
- `.cup-img` filter - the current `drop-shadow(0 8px 9px rgba(0,0,0,.45))` is a hard black blob with no table under it. Soften to `drop-shadow(0 10px 14px rgba(0,0,0,.55))` and add a separate `.cup-shadow` ellipse tinted to the mat, not pure black.
- `body` background - layer the new `bg-table-540x960.jpg` under the existing gradients with `background-attachment:fixed` (the fixed attachment is already there, so no scroll change).
- `header p` (the 'Keep your eye on the ball.' subline) is 13px `--muted` #b49bc9 on plum; raise to 14px and lighten to #cdb6de for contrast.

**Emoji as art:** HUD only, and heavily: fire streak, gift daily, cart SHOP in the gold pill, question mark on How to play, plus 30 emoji total across 12 distinct glyphs in shop/daily UI. The playfield itself is emoji-free - the cups are real WebP art.

**Readability:** The 'Each round adds a cup, shuffles faster, and pays more coins.' hint is muted lavender on plum and sits under the injected X puck. `.streak` is 13px and `header p` is 13px - both borderline at 375. Touch targets are handled deliberately (`.dailybtn::after`/`.shopbtn::after` extend the tap zone past the visual pill), so the 48px floor is met even though the pills look small.

**Music chip:** Yes. The chip parks mid-left at roughly x 10-105, y 313-355 and its right edge overlaps the left cup's left rim and upper body. On play frames it sits ON the leftmost cup - the cup you are meant to be tracking.

### Nectar Drop
`nectar-drop` · satellite · action · first committed 2026-07-08 · impact 3/5 · effort S
`satellites/nectar-drop/index.html`

**Now:** Boot is a genuinely painted night-botanical scene - leaves and seed pods framing the edges, a butterfly, gold sparks - with a sage 'Nectar Drop' wordmark over it. Both -2play and -3later are the same tutorial carousel dimming that art, and the card's hero illustration is a raw bright-cyan bucket emoji. The playfield itself was never reached.

**Wrong with it:**
- The tutorial card's illustration is the raw bucket emoji at about 72px (index.html:267, .helprow .hi) - glossy cyan plastic, the loudest and most off-palette object anywhere in the frame, sitting on a midnight greenhouse painting.
- The tutorial veil dims the menu but does not blur it, so the title, the intro paragraph and the Awards / How to play / Music row all read straight through the card - the '#246' from the Daily Bloom button prints through the tutorial's own body text.
- The boot menu stacks flat filled slabs over painted art: the solid green .btn.primary Play bar and four dark rectangles cover the centre of the illustration, which is the exact 'no filled button slabs over painted art' fault.
- 'SKY WOLF STUDIO' under the title is --muted grey over the lightest, busiest part of the painting and is nearly invisible.

**Background now:** Painted: .screen.artbg carries assets/screens/title.jpg with a .veil gradient over it; the playfield draws assets/bg/world01..12.jpg through drawImage at index.html:1218. 399 asset files, 90MB - by far the best-resourced game in the batch. The overlays on top of it are flat #0b0f0b panels.

**Background wanted:** None needed - the background art already exists and is good. The gap is one layer up: the tutorial and menu panels have no painted plate, so flat rectangles sit on top of the painting.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `satellites/nectar-drop/assets/ui/tut-basket-256x256.png` | 256x256 transparent PNG, painted woven basket with warm rim light, a pollen ball arcing into it, soft glow under the catch | Replaces the bucket emoji on the 'Baskets & bins' tutorial card - the single most off-palette object visible in either play frame. |
| `satellites/nectar-drop/assets/ui/card-plate-360x220.png` | 360x220 transparent PNG, painted vellum/leaf-paper panel with soft gold edging and a feathered outer edge, 9-sliceable centre | Sits behind the tutorial cards and the menu buttons so they stop being flat dark rectangles pasted over the painting. |
| `satellites/nectar-drop/assets/ui/tut-peg-256x256.png and tut-bloom-256x256.png` | 256x256 transparent PNGs, painted: a wooden peg with pollen dust caught on it; a red bloom mid-pop with petals scattering | The carousel has four dots, so three more .helprow rows carry the same emoji treatment as the bucket. Same fix applied across the set. |

**CSS to do:**
- The tutorial overlay veil (.screen .veil, index.html:58) - add backdrop-filter:blur(6px) and darken to rgba(8,12,7,.9); the menu currently reads straight through the tutorial card.
- .helprow .hi (index.html:267 region) - the 36px round glyph chip is too small to be the card's hero; take it to 64x64 and render an <img> with the emoji kept as an onerror fallback.
- .title-sub ('SKY WOLF STUDIO') - lift from --muted to rgba(232,220,200,.8) and add text-shadow:0 2px 6px rgba(0,0,0,.9) so it survives the light part of title.jpg.
- .btn.primary (index.html:70) - swap the solid linear-gradient(180deg,#7ab356,#5c8f3f) fill for rgba(122,179,86,.24) with a 2px sage border and cream text, so the painted title art is not covered by an opaque slab.

**Emoji as art:** The bucket emoji is the hero illustration of a tutorial card. Every menu button icon is an emoji too: blossom on Play, calendar on Daily Bloom, map on Gardens, herb on Gardeners, flask on Wardrobe, trophy on Awards. 87 emoji, 40 distinct.

**Readability:** 'SKY WOLF STUDIO' muted-on-lit-art is the one contrast failure. The un-blurred menu bleeding through the tutorial makes both layers harder to parse than either alone. Tutorial body text and the Let's play button are fine and comfortably over 48px.

### Sled Vine
`sled-vine` · satellite · action · first committed 2026-07-10 · impact 3/5 · effort S
`satellites/sled-vine/index.html`

**Now:** All three frames are the How Sled Vine works wall, but here the art survives: a painted dark botanical of dusky rose and ochre flowers with fern fronds fills the bottom third, with gold heading text over near-black at the top and seven emoji bullets down the left. Same first-run auto-open as silt (line 946), so the playfield is never shown despite capture.reached being canvas.

**Wrong with it:**
- The frame is two unrelated halves: a flat black text block on top, a painted flower bed on the bottom, meeting on a hard horizontal line just under the Back button. Nothing transitions; the art simply starts.
- Seven emoji bullets label the rules while a painted glyph bank sits unused on this screen in assets/ui/ (glyph_draw, glyph_erase, glyph_clear, glyph_ride, glyph_stop, glyph_retry, glyph_home). The bloom-gate bullet is a bare white ring that reads as a missing image sitting among six coloured emoji.
- The New song pill is a filled near-black slab dropped straight onto the painted flowers at bottom-left — the only part of the frame with art, and it covers it. There is also a 200px band of dead black between the Back button and the flowers where the panel simply runs out of content.

**Background now:** Painted and visible. #s-how (line 140) is linear-gradient(#0b0f0be0, #0b0f0bb0 40%, #0b0f0be6) over url('assets/backgrounds/bg_grove.jpg'). bg_title.jpg and bg_trials.jpg back the other screens; the playfield loads bg_play.jpg via _img() at line 297.

**Background wanted:** None needed — bg_grove.jpg is real painted art and it reads. What it needs is placement: ease the scrim's top stop from e0 (.88) to about cc (.80) and the mid from b0 to 88 so the whole frame is one continuous grove instead of a black slab pasted on a flower bed.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/ui/how_icons_88x88.png` | 616x88 transparent PNG, seven 88x88 cells: goal flower, ink pen, bloom-gate ring, sprouting leaf pair, thorn cluster, eraser, calendar. Painted sage and gold on transparent, warm rim light, readable at 34px. | Replaces the seven emoji bullets and kills the bare white ring that currently reads as a broken image. |
| `assets/backgrounds/bg_grove_canopy_540x300.png` | 540x300 transparent PNG, a soft canopy of vine and hanging seed pods along the top edge, fading to fully transparent by 60% height. | Gives the top of the How screen something behind the copy so the frame stops being black-over-art with a hard seam in the middle. |

**CSS to do:**
- #s-how (line 140): ease the scrim to linear-gradient(#0b0f0bcc, #0b0f0b88 40%, #0b0f0bcc) so bg_grove.jpg carries the whole frame instead of only the bottom third.
- .helprow .hi (line 107): swap the emoji text node for an <img> at 34x34 with filter:drop-shadow(0 1px 2px #000).
- #s-how .btn (Back): make the panel a flex column and give the button margin-top:auto so it pins to the panel bottom — right now it floats mid-screen with a 200px empty black band under it that splits the art.
- The first-run IIFE at line 946: hold s-title (bg_title.jpg) for about 1200ms before show('s-how') so a new player sees title art first.

**Emoji as art:** On the How wall, yes — seven emoji bullets at lines 221-227 — and in the cosmetics list where ink variants use pencil and herb emoji as their icons (lines 876-877). The play dock is better: chip() at line 812 passes both a glyph name and an emoji, so glyph_draw/glyph_erase/glyph_clear PNGs are the primary path there with emoji as fallback.

**Readability:** 14px cream body over the darkened grove is legible and the gold headings read cleanly. Buttons are min-height:72px. No text under 0.7rem in the frame. The only element that looks like a mistake rather than a choice is the 22px bare white ring bullet.

### Stop the Light
`stop-the-light` · satellite · action · first committed 2026-08-07 · impact 3/5 · effort M
`satellites/stop-the-light/index.html`

**Now:** Boot is a deep navy field with one large ring at its centre: a circle of short dark-blue petal spikes radiating outward, a gold arc of the same petals covering about a fifth of the ring at the upper right, a thin gold pointer, and a small white firefly dot on the left rim, all over a soft radial glow. A gold 'Stop the Light' wordmark sits above it and a gold 'Play a run' slab below, with the injected music drawer taking the bottom third. Both play frames are the How to Play wall instead: seven rows of cream body text with unicode glyph icons down the left, a small hint plate, and a gold 'Release the firefly' slab.

**Wrong with it:**
- The gold band and the dead zone share a silhouette. Both are the same petal spike drawn by petal() (index.html:1627), so the scoring band reads as a colour highlight on a decorative ring rather than as a gap you are aiming into. The one thing the player must judge is drawn in exactly the shape of everything he must ignore.
- The frame around the ring is empty. The canvas is a single vertical linear gradient plus one radial glow centred on the ring (index.html:1348-1357), so the ring floats in the middle of a void with nothing above it and nothing below it, no ground, no garden, no horizon, and no contact shadow anywhere. At 375x667 that is roughly 300px of blank navy above and below the only object on screen.
- The How to Play wall runs seven paragraphs of body copy with unicode glyphs (✦ ● ⚖ ✖ ☀ ∿ ↻) as its icons. They are seven different weights and styles from the system font, several of them nearly invisible against near-black, and they are the only imagery on a full screen the player must read before playing.
- The gold slab's second line ('three fireflies') renders at about 10px in a dark brown on the gold fill, which is the lowest-contrast text on the boot screen.

**Background now:** No image assets at all beyond thumb.png (the arcade tile, unused in-game). The whole playfield is canvas: a full-height vertical linear gradient filled at index.html:1348-1350, one radial gradient centred on the ring at 1355-1357, then per-object radial glows for the firefly (1615), the landing point (1532) and the ghost marker (1562). Menus are DOM plates over that same canvas.

**Background wanted:** bg-firefly-ring-375x667.jpg, full-bleed: a night garden clearing seen from above, dark loam and moss going near-black at the top and bottom edges, a faint circle of pale stones or dew-lit petals where the ring sits so the ring has a place to live, and a warm gold pool of light at the centre. The ring itself stays canvas-drawn on top so all the existing glow and drift work is untouched.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-firefly-ring-375x667.jpg` | 375x667 at 1x, export 1125x2001 at 3x, full-bleed no transparency. Night garden clearing from above: dark moss and loam, a faint ring of dew-lit stones at the centre matching the play ring's radius, near-black falloff at the top and bottom so wordmark and buttons stay readable. | Replaces the single vertical gradient at index.html:1348 and fills the ~300px of empty navy above and below the ring. |
| `ring-plate-720.png` | 720x720 transparent PNG, centred. The dead ring painted as a wreath of dark furled leaves with a carved stone rim, cool blue-grey, soft ambient occlusion at the inner edge. | Replaces the identical navy petal() spikes so the non-scoring ring stops sharing a silhouette with the gold band. |
| `band-gold-720.png` | 720x720 transparent PNG, same centre and radius as ring-plate. A warm gold arc painted as open blooms with lit petal edges and a pale cream heart at its exact middle, alpha falling off at both ends of the arc. | Makes the scoring band a different object from the ring, and paints the 'pale heart' the rules describe as a place rather than a lighter shade of the same spike. |
| `firefly-96.png` | 96x96 transparent PNG plus a 3-frame pulse strip at 288x96. A painted firefly with a warm gold abdomen glow, faint wing blur, cool blue body. | The player's only moving object is currently a bare radial gradient dot (index.html:1615) with no body. |
| `howto-icons-144.png` | One sheet, seven cells at 144x144, transparent PNG. Firefly, ring, gold band, scales (bank vs go again), a broken ring (miss), three fireflies, a drifting band. All in warm cream on transparent, one weight, one light source. | Replaces the seven mismatched unicode glyphs (✦ ● ⚖ ✖ ☀ ∿ ↻) that are the only imagery on the How to Play wall. |

**CSS to do:**
- The 'three fireflies' sub-label inside .btn.primary: it renders at about 10px in dark brown on the gold fill. Raise to 12px and darken to #20180a for contrast, or move it out of the button entirely.
- The How to Play glyph column: the icons sit in a narrow flush-left column at roughly 20px with no fixed width, so the seven rows do not align. Give the icon cell a fixed width:32px, text-align:center and a min-height of 32px so the paragraph left edges line up.
- The How to Play screen has no scroll affordance: seven paragraphs plus the hint plate plus two buttons fill past 667px with no fade at the bottom edge. Add a bottom fade (linear-gradient to the screen colour, 34px) over the scroll container.
- The 'Menu' button on the How to Play screen: it currently sits at the bottom-left where the injected 'New song' pill lands. Move it right of x=160 or give the button row a right-alignment so the pill cannot cover it.
- The screen heading ('How to play') and its subtitle sit at the very top-left where the music chip lands at 900ms. Push the heading below y=110 or centre it, so the chip cannot land on the page title.
- The stylesheet carries 10px and 11px font-size rules; raise every one under 11.2px to 12px on a 375px frame.

**Emoji as art:** Only one emoji in the whole file. But the How to Play wall uses seven unicode glyphs (✦ ● ⚖ ✖ ☀ ∿ ↻) as its row icons, which is the same failure by another route: system typography standing in for illustration on a full screen of the game.

**Readability:** The 'three fireflies' sub-label on the gold Play slab is roughly 10px dark-brown on gold, the lowest-contrast text on the boot screen. The 'read this, then release the firefly' subtitle on the How to Play screen is small muted grey AND partly covered by the music chip. The stylesheet carries 10px and 11px rules, both under the 11.2px floor. Buttons are all comfortably over 48px and the body copy on the rules wall is a good 14-15px.

**Music chip:** Confirmed and the worst in this batch. On both play frames the '♫ Music' chip sits directly on top of the screen heading: 'How to play' renders as 'H[chip]o play' with the chip covering the middle of the title, and the subtitle line 'read this, then release the firefly' is covered along its left half. At the bottom, the '♫ New song' pill covers the left portion of the '◄ Menu' button. On the boot screen the full music unlock drawer takes the bottom third, sitting under the 'Play a run' slab and covering whatever menu rows follow it.

**Looks broken** (confirmed on a second look, severity ugly)**:** Overlapping UI, plainly visible in stop-the-light-2play.png and stop-the-light-3later.png: the injected music chip covers the centre of the 'How to play' page heading and the left half of its subtitle, and the 'New song' pill covers the left portion of the '◄ Menu' button. The game's own rendering is fine. capture.reached = 'no-more-controls' so the robot stalled on the instructions wall and never entered the ring; the ring's real look is judged from the boot frame, where the same canvas draws it live behind the title.

### Moon Claw
`moon-claw` · satellite · action · first committed 2026-08-07 · **workbench-gated** · impact 3/5 · effort M
`satellites/moon-claw/index.html`

**Now:** Boot is a genuinely composed scene: a navy glass claw cabinet with a lit gantry, a gold claw hanging on its rail, a light beam raking down, a pile of pastel plush toys on the floor of the cabinet and a PRIZE CHUTE panel, under a gold serif-ish title. The play frame is not the game - it is the 'How to play' text wall, eight paragraphs of gold-highlighted body copy on near-black.

**Wrong with it:**
- Four of the nine prizes in the pile are the same green frog at nearly the same scale and pose - identical silhouette repeated across a heap that is supposed to look rummaged. Nothing is rotated, squashed or part-buried.
- The plushies are flat vector fills with zero shading, no rim light and no fabric texture, sitting in a cabinet that visibly has a light beam in it. Nothing catches that light, so the pile looks pasted onto the glass rather than lit inside it.
- The top 55% of the cabinet glass is one empty flat navy rectangle, and the PRIZE CHUTE is a plain black rect that meets the cabinet floor at a hard edge with no frame, flap or interior glow.
- The how-to wall is 1126 characters of body copy filling the entire 667px screen and pushing 'Drop in a token' to the fold - the first thing a player reads is an essay, not the cabinet.

**Background now:** Canvas and CSS gradients only. Cabinet screens use linear-gradient(180deg,#0b1018,#05070a,#04060a) (.screen.solid, index.html:44) and the page uses radial-gradient(#0d1420, #05070a, #000) (line 34). The overlay scrim is a warm radial (line 111). No images at all - bgImageDecls 0, imgTags 0, no new Image() in the file.

**Background wanted:** bg-arcade-540x960.jpg - a painted night arcade room behind the cabinet: dark patterned carpet with a lit floor strip, a second cabinet blurred at the frame edge, warm neon spill up the back wall, so the cabinet is standing somewhere instead of on black.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-arcade-540x960.jpg` | 540x960 full-bleed painted night arcade interior, dark carpet, blurred second cabinet at the edge, warm neon wash on the back wall, vignette to near-black at the corners | replaces the flat .screen.solid gradient so the menu and how-to screens are a place, not a black page |
| `plush-sheet-512x512.png` | 512x512 transparent sheet, 16 painted plushies at 128x128 (frog, owl, moth, moon, koi, toad, mushroom, bee, snail, fox kit, acorn, star, and 4 variants), each with a soft warm rim light from the top-left and stitched-seam detail | replaces the flat vector prizes drawn from line 1560 on, and gives enough distinct silhouettes to kill the repeated-frog pile |
| `cabinet-frame-420x560.png` | 420x560 transparent, painted cabinet chrome and wood frame with a lit marquee, glass reflection streaks baked into the upper third, hollow centre | replaces the drawn rects at index.html:1314-1370 and fills the empty upper half of the glass with reflection instead of flat navy |
| `prize-chute-160x220.png` | 160x220 transparent, a dark chute mouth with a rubber flap, a scuffed metal lip and a warm interior glow | replaces the plain black rectangle that currently meets the cabinet floor at a hard edge |
| `claw-96x96.png` | 96x96 transparent, painted brass claw, three jaws, warm specular on the inner curve, faint wear on the tips | gives the one object the whole game is named after some weight; it is currently a gold stroke |

**CSS to do:**
- .screen.solid (index.html:44): swap the linear-gradient for the painted bg-arcade image with a 0.55 black scrim, so the menu, how-to and result screens share the arcade room.
- The how-to list (.list, index.html:89, font-size 13.5px) runs to 1126 characters and pushes the primary button below the fold - cap it to the first four rules with a 'more' disclosure, or move the rest into first-play callouts on the cabinet.
- Canvas labels 'PRIZE' at index.html:1363 ('700 11px system-ui') and the token counter at 1490 ('700 12px') are under the 0.7rem floor - raise both to 13px.
- Reserve a 60px top gutter on .screen.solid and the cabinet header so the injected music chip cannot land on the H1 - right now it clips the first letter of the title.

**Emoji as art:** Almost none - emojiTotal is 1 for the whole file. The prizes, cabinet and claw are all procedurally drawn on canvas. The how-to rules use small glyph bullets (a pointing hand, scales, a circle) rather than emoji art.

**Readability:** Body copy on the how-to wall is 13.5px, fine. The canvas labels are the problem: PRIZE at 11px and the token counter at 12px, both under 0.7rem. Contrast is otherwise good - gold on near-black. Buttons are 48px+.

**Music chip:** Yes, twice. On boot the chip sits top-left and covers the capital M of 'Moon Claw', so the title reads 'oon Claw'. On the how-to screen the chip ('New song' state) covers the 'How to play' heading at the top AND the bottom-left 'Menu' button, hiding the only way back.

**Looks broken** (confirmed on a second look, severity ugly)**:** moon-claw-1boot.png: the Music chip overlaps the title's first letter. moon-claw-2play.png and -3later.png: the 'New song' chip covers the 'How to play' heading and sits on top of the 'Menu' button at bottom-left. Note the play frames are the instructions wall, not the playfield - capture reached 'no-more-controls' and the game is tester-gated (a fresh local visit hits the IN DEVELOPMENT key wall), so the empty-looking play shot is a robot artefact, not a broken game.

### Pong Arena
`pong` · satellite · action · first committed 2026-07-05 · impact 3/5 · effort M
`satellites/pong/index.html`

**Now:** A near-black navy shell (#05060e) with a big two-line PONG ARENA wordmark in a cyan-to-purple-to-pink gradient, a row of four currency pills, and a stack of rounded dark-panel cards. The play shot never reached the court - it landed on the CAREER: THE GAUNTLET list, nine identical rounded rows each holding a number, an emoji, a name, a ROOKIE/PRO/ACE tag and a padlock. Coherent and deliberately built, but it is all CSS panels and system type - there is not one painted pixel in the game.

**Wrong with it:**
- The injected music chip lands on the wordmark: the gold-bordered '. Music' pill covers the P of PONG on the boot screen. The logo is min(15vw,64px) so it wraps to two lines at 375px and the first line starts at the exact y the chip claims.
- Every low-priority label is --dim #5a6188 on #05060e, about 2.9:1 contrast, at 11-11.5px. That includes 'EVERY PONG THAT EVER WAS' and the three-line rotate-your-phone hint, which is the only instruction on the screen and the hardest thing on it to read.
- The gauntlet list is nine rows that share one silhouette - same height, same radius, same border, same lock - differing only by a 16px emoji. Three of those emoji (table-tennis paddle, blue triangle, a braille-dot cluster used for multiball) are from three visual worlds, and the palette (cyan/magenta/violet neon) is nowhere near the house midnight-greenhouse of sage, gold and cream.

**Background now:** Flat CSS. Menu screens are linear-gradient(160deg, rgba(9,11,24,.94), rgba(5,6,14,.97)) with a 10px backdrop-blur over #stageWrap, whose own background is radial-gradient(120% 90% at 50% -10%, #0a0d1c, #05060e 70%). The court itself is a two-stop ctx.createLinearGradient at index.html:1348 from the equipped arena palette. bgImageDecls 0, imgTags 0; only og/card.jpg exists on disk.

**Background wanted:** arena-court-540x960.jpg - a painted deck for the ball to live on: dark lacquered wood or brushed steel with a soft centre-line bloom, a warm rim of light down each wall, and a vignette that keeps the paddles the brightest things in frame. Today the ball flies over a flat gradient with no floor, so nothing conveys speed or depth.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `arena-court-540x960.jpg` | 540x960 full-bleed painted court, deep #05060e ground, centre-line glow, side-wall rim light, vignette | replaces the two-stop canvas gradient at index.html:1348 so the ball has a surface |
| `paddle-skins-512x256.png` | 512x256 transparent, 8 cells of 128x32: painted paddle skins (chrome, brass, mossed stone, bone, obsidian, gold) each with a specular highlight and a soft under-shadow | replaces the createLinearGradient/chrome stroke fakes at index.html:1265 and 1402 - the whole cosmetic economy is currently CSS-style gradients on a rectangle |
| `gauntlet-node-icons-384x128.png` | 384x128 transparent, 12 cells of 32x32: painted rank badges for the 12 career levels (first serve, sky, multiball, orbit, gauntlet, ace, boss) in gold/teal/rose | replaces the mixed emoji in the career rows so the ladder reads as a progression instead of a spreadsheet |
| `pong-title-band-540x360.jpg` | 540x360, painted hero band: a court seen at a low angle receding into dark, warm bloom at the horizon, safe empty top third for the wordmark | the boot screen is a wordmark floating on flat navy; this gives the title a stage and hides the chip landing zone |

**CSS to do:**
- --dim (index.html:43) is #5a6188 on --bg #05060e, roughly 2.9:1. Raise it to #8b93b8 (the existing --muted) for .brand .tag, .sec-title, .fine and .rally-tag, and lift those four rules from 11px to 12.5px.
- .brand (index.html:80) - add margin-top:52px so the two-line wordmark starts below the corner the injected music chip claims 900ms after load; today the chip lands on the P.
- .camp-node - nine rows with identical silhouettes. Give the locked rows opacity:.55 and the current row a 3px --rally gold left rail so the eye lands on where the player actually is.
- .mbtn .lock and .score-pill .who are 10px uppercase (lines 95 and 61) - both under 0.7rem; take them to 12px and drop the letter-spacing to .1em so they still fit.

**Emoji as art:** 18 distinct. The 12 career nodes are carried by emoji (table-tennis paddle, blue triangle, braille dots for multiball, cyclone, high voltage), the currency pills use gem/sparkle/trophy, and every locked row uses the padlock glyph. The court itself is pure canvas geometry with no emoji.

**Readability:** The tagline and the rotate-your-phone hint are 11.5px --dim, about 2.9:1 - below the 4.5:1 bar and the least readable text on the boot screen. .mbtn .lock and .score-pill .who are 10px. Buttons are correctly 48px minimum (.btn sets min-height:48px, .icob is 48x48). The gauntlet rows are 64px tall, fine.

**Music chip:** Yes - on the boot screen the '. Music' chip covers the P of PONG in the wordmark. On the career screen it clears the 'CAREER: THE GAUNTLET' header by about 4px. Separately the feedback ladybug disc sits at top-right hard against the 0/12 progress pill and the 48px close button, three controls jammed into one corner with no gap.

### Spore Drift
`spore-drift` · satellite · action · first committed 2026-07-10 · impact 3/5 · effort S
`satellites/spore-drift/index.html`

**Now:** Boot is a painted deep-water scene: abyss.jpg under a dark gradient, a blue gradient display title, a blue slab button. Play is the best frame in this batch - a violet-indigo painted deep, a slow season tint wash over it, a dozen glowing green spore orbs with rim light and spiky crowns at varying scales, and the player as a small blue glowing orb near the bottom. Real depth, real light.

**Wrong with it:**
- The floating Music chip covers the 'SPORE MASS' HUD label; the readout on screen reads as '...MASS 201' with the word SPORE buried behind the chip.
- On boot the injected music-unlock card covers the bottom two rows of title buttons outright - Zen Drift, How, Wardrobe, Grove and the gear at index.html:160-166 - and you can see two half-clipped buttons peeking behind its top edge. Five of the nine menu entries are unreachable until the card is dismissed.
- Every drifting body is the same green sphere sprite. Threat and food separate only by radius and a spiky crown, so two things in one frame share a silhouette; the player's blue orb is the only differentiated shape on screen.
- Three floating chips crowd the frame at once - Music top-left, 'New song' bottom-left, ladybug plus its close X bottom-right - and the X overlaps the ladybug's ring.
- 'SPRING CURRENT' is drawn at 11px sans-serif (index.html:793), under the 0.7rem floor, and sits only 10px in from the right edge.

**Background now:** Painted assets/backgrounds/abyss.jpg drawn full-bleed on the canvas (index.html:704) with a 13% season tint wash over it, plus the same jpg under a dark gradient on every HTML screen (index.html:59). Three more backdrops (kelp, moonpool, starfield) are preloaded at index.html:685 and unlock through the wardrobe.

**Background wanted:** None needed - abyss.jpg is already the strongest background in this batch and the wardrobe swap is wired. What is missing is a near plane: one drifting foreground silhouette layer for parallax depth.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `fg-kelp-fronds-540x300.png` | 540x300 transparent, near-plane kelp silhouettes in near-black with a faint teal edge, tileable horizontally | Adds a foreground plane so the scene has near, mid and far instead of sprites floating on one flat backdrop. |
| `spore-predator-96x96.png` | 96x96 transparent, a barbed non-spherical hostile in rose and deep red, warm rim light, distinctly not a ball | Bigger-than-you currently has to be read from radius alone. A different silhouette makes the core rule legible at a glance. |
| `mote-warm-64x64.png` | 64x64 transparent, a warm gold food mote with a soft halo, matching the existing motes sheet slicing | The two food classes currently differ only by scale; hue separation lets a player triage without measuring. |
| `hud-spore-mass-32x32.png` | 32x32 transparent, a small spore glyph in sage with a gold rim | Lets the SPORE MASS label shrink to an icon plus a number so the music chip stops fighting the word. |

**CSS to do:**
- #hud (the SPORE MASS label row): the music chip lands on it. Add padding-left:120px to #hud on the play screen, or move the label into the centre group, so the readout is never half-covered.
- The injected music-unlock card over #s-title: it covers index.html:160-166 (Zen Drift, How, Wardrobe, Grove, gear). Make #s-title .stack scrollable with padding-bottom:220px, or raise the card's bottom offset, so every menu row stays reachable while the card is up.
- Canvas draw at index.html:793: ctx.font='11px sans-serif' for the season label is under the 0.7rem floor. Take it to 13px and move it from W-10 to W-16 so it is not hard against the right edge.
- The bottom-left 'New song' chip and the bottom-right ladybug pair: give them a shared 12px inset so the three floating chips sit on one margin rather than three different ones.

**Emoji as art:** Bubble, calendar, blossom, moon and gear emoji on the title buttons; a calendar emoji in the Daily Drift banner; an emoji icon gutter on the How screen. The spores, motes and fx are real painted sprite sheets sliced r1c1-r4c4, not emoji.

**Readability:** 'SPRING CURRENT' at 11px violates the text floor. The SPORE MASS label is hidden under the music chip. The 'Daily Drift - grow to 38% of all life' banner at 13px gold on dark reads fine. Buttons are 48px+ and the pause control is a comfortable target.

**Music chip:** The chip covers the 'SPORE MASS' HUD label on the play screen. Separately, the injected music-unlock card covers the bottom two rows of title-screen buttons (Zen Drift, How, Wardrobe, Grove, gear).

### Doodle Pad
`doodle-pad` · satellite · creative · first committed 2026-07-18 · impact 3/5 · effort S
`satellites/doodle-pad/index.html`

**Now:** A real playfield. Near-black radial ground, a dark topbar, a big pure-white drawing canvas filling the upper half, and below it a well-organised tool deck: a horizontal row of brush tiles each showing a canvas-rendered preview of its own stroke, a row of size dots, a strip of colour swatches, a rainbow Mix-color bar and four dark action buttons with a sage-green Save. Palette is genuine midnight greenhouse (#0d100c ground, sage, gold selection rings, cream).

**Wrong with it:**
- The injected ♫ Music chip has parked itself directly on the topbar: it covers the last letters of the 'Doodle Pad' title and sits on top of one of the ↶/↷ arrow buttons, so an undo control is behind a floating chip.
- The 🐞 feedback bug button floats in the middle-right OF THE WHITE DRAWING SURFACE, about a third down. That is a dead zone in the artboard — a stroke drawn there hits a button instead of the canvas.
- The brush labels (Pen, Pencil, Marker, Crayon, Spray, Glitter, Stars) are 10px in a 540px stage that scales 0.694 on a 375px phone — roughly 7 rendered pixels. Well under the 0.7rem floor and the first thing that fails on a real handset.
- The white canvas meets the black tool well through a bare 1px line — a hard edge with no transition, no paper lip, no shadow, so the artboard reads as a hole cut in the UI rather than a sheet lying on it.
- The rightmost brush tile ('Stars') is half-cut under a black gradient fade with no arrow or chevron saying the row scrolls — it just looks clipped.

**Background now:** CSS only. Page: `radial-gradient(120% 80% at 50% 0%, #101610 0%, #05070a 70%, #000 100%)`. Stage #0b0f0b, topbar #0c1109, tool well #0c1109, and the drawing canvas itself is a hard `background:#ffffff`. bgImageDecls 0; the only asset in the folder is og/card.jpg (the social card, never shown in game).

**Background wanted:** None needed behind the UI — the radial midnight ground is correct and on style. What IS needed is a paper texture UNDER the drawing surface: paper-tooth-540x500.png, a subtle warm-cream fibre tile, so the artboard reads as paper instead of a #ffffff rectangle. The existing 'BG paper' toggle already implies paper; give it something to look like.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `paper-tooth-540x500.png` | 540x500, warm off-white (#faf6ee) with faint fibre tooth and a barely-there vignette at the corners, tiles cleanly | replaces the flat #ffffff canvas fill so the artboard reads as a sheet of paper, and makes the existing 'BG paper' button mean something |
| `brush-tiles-7x-144x144.png` | one sheet of seven 144x144 transparent tiles — pen nib, pencil, marker, crayon, spray can, glitter jar, star wand — soft painterly, warm gold rim light, big silhouettes readable at 50px | the brush tiles currently show only a canvas-drawn scribble of the stroke; a painted tool icon above the stroke preview would tell you what the tool IS at a glance and let the 7px text labels go away |
| `canvas-lip-540x24.png` | 540x24 transparent strip, a soft warm shadow and a thin cream paper edge, to sit at the top and bottom seam of the artboard | softens the hard 1px edge where the white canvas meets the black tool well |

**CSS to do:**
- #draw-cv — swap `background:#ffffff` for `background:url(assets/paper-tooth-540x500.png) #faf6ee` so the sheet has tooth (keep the JS fill colour in sync for Save/export)
- .canvas-wrap — add `box-shadow: inset 0 8px 16px -10px #000c, inset 0 -8px 16px -10px #000c` to give the artboard a lip instead of a hard cut against the tool well
- .brush-btn small (the 10px label) — raise to 14px stage (≈10 rendered px) or drop the label entirely once brush-tiles-7x is in; 10px stage is ~7 rendered px on a 375 phone
- .brush-row::after (the right-edge fade at line 80) — add a 24px gold chevron on top of the fade so the horizontal scroll is announced instead of looking clipped
- the injected bug button and ♫ Music chip — constrain both to the topbar strip or the tool well; anything with pointer-events must not overlay #draw-cv

**Emoji as art:** Almost none — only 6 emoji, 2 distinct, and they are the injected ♫ music note and the 🐞 feedback bug, not the game's own art. The brush previews are canvas-drawn strokes, which is the right instinct. This is the cleanest game of the four on that count.

**Readability:** Brush tile labels are 10px CSS inside a 540x960 stage that scales ~0.694 at 375 wide, so they render at roughly 7px — under the 0.7rem floor. The toast at 10px (line 89) has the same problem. Touch targets are fine: 72px stage buttons = ~50 rendered px, clear of the 48px rule, and the file already comments this.

**Music chip:** YES. On both the boot and the play frame the ♫ Music chip sits on the topbar, covering the tail of the 'Doodle Pad' title and overlapping one of the ↶/↷ undo/redo arrow buttons. On boot it also covers the 'How to use' heading and the ◄ back arrow at top-left. Separately, the 🐞 feedback button floats on the white drawing canvas itself.

### The Attic
`attic` · satellite · creative · first committed 2026-07-31 · **workbench-gated** · impact 3/5 · effort M
`satellites/attic/index.html`

**Now:** A warm dark-brown attic in Georgia serif: cream/gold type on #171310, a procedurally drawn item card (an olive-grey rectangle of circles and squiggles standing in for a 1990s handheld), and faint brown smudges of an SVG attic scene bleeding in at the top and left edges.

**Wrong with it:**
- The item art in the card slot reads as a broken/empty thumbnail, not an object: a flat olive-grey rectangle with scattered translucent circles and two loose squiggles, and its own printed title 'CHROME CANOE RUNNER 9' is grey-on-grey and illegible. It is the pre-wipe dusty state by design, but the design lands as 'the image failed to load'.
- The hand-built attic scene (rafters, round window, light shaft, hanging bulb, crates) is pushed so far back it survives only as three formless warm-brown blobs at the top corners and mid-left edge. It reads as JPEG smear rather than a room, and it is the only thing breaking the flat ground so the frame has no horizon.
- The shared gold 'Music' pill is pinned top-centre with no scrim and sits directly on top of the item art box, clipping its upper edge. Same pill covers the top of the how-to wall on the boot shot.

**Background now:** Flat #171310 with two CSS layers on top: a radial ellipse to #2b2118 at 50% -10%, and a 3px/6px repeating vertical stripe at 1.8% black / 1.5% white. Behind that a fixed full-bleed inline SVG (.atticbg) draws the room, deliberately tuned to within a few points of the page ground.

**Background wanted:** Keep the SVG room but lift it out of the mud: bg-attic-540x960.png, one painted midnight-attic plate — rafter beams top third, a round dormer window with one cool shaft falling left-to-right, crate stack along the bottom edge, warm bulb glow top-right. Painted at roughly 12-15% more separation from the ground than the current SVG so the shapes read as rafters at a glance, then held back with a single 0.55-opacity scrim rather than by desaturating the art itself.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-attic-540x960.png` | 540x960, full-bleed, no transparency. Painted attic interior: rafters, round dormer window with one light shaft, crate stack along the floor, hanging bulb. | Replaces the inline .atticbg SVG that currently reads as three brown smudges. Gives the frame a horizon and a place instead of a colour. |
| `dust-veil-300x300.png` | 300x300, transparent PNG, greyed felt/lint texture with uneven density and a few hair-fibres, ~55% coverage. | Replaces the flat translucent-circle scatter that makes an unwiped item look like a load failure. A real dust texture lets the object silhouette read through so the wipe reveals rather than un-blanks. |
| `shelf-plank-540x120.png` | 540x120, tileable horizontally, painted worn pine plank with a shadow lip along the front edge. | The shelf is currently canvas fillRect stripes at #8a6a45/#9b7a52. A painted plank makes THE SHELF read as furniture and gives the found items somewhere to sit. |
| `ticket-64x64.png` | 64x64 transparent PNG, a torn paper carnival ticket stub in cream and gold. | '5 tickets' is currently plain text in the header. A tiny painted stub makes the one spendable resource a thing rather than a word. |

**CSS to do:**
- #dustStage / .wipeBox item art: raise the pre-wipe object's base contrast so the silhouette reads through the dust. The wDust layer should sit at ~0.72 opacity over a fully-drawn object rather than the object itself being drawn near-invisible.
- The item-art SVG title text inside object-render.js currently draws near-invisible on the 1990s palette (#d8d4c8 field). Route it through the existing inkOn(bg) helper that the file already defines but does not use for this label.
- The hash/date line ('ef863f6a250600bf… · 1997') is #6f6350 on #1e1811 — around 2.2:1. Lift to #9a8a6e.
- Give the fixed .music-pill a 12px backdrop-blur and a 0.6 dark scrim disc so it stops sitting bare on top of the item art box, or move it to top-right out of the card's centre column.
- '.wantbtn' style button 'WIPE OFF THE DUST · CHECK CONDITION' wraps to two lines because of the 0.12em monospace letterspacing. Drop letterspacing to 0.06em or shorten to 'WIPE OFF THE DUST'.
- @keyframes drift dust flecks (#e8d7a8) are only 7px squares at full opacity — soften to 4-5px with a 0.45 max opacity so they read as motes, not confetti.

**Emoji as art:** Very light for a satellite: 69 emoji instances but only 4 distinct, and none are doing object art. The only one visible in the shots is the ♫ in the Music pill. All item art is procedural SVG from object-render.js / sleeve-render.js.

**Readability:** Two real faults. The hash line #6f6350 on #1e1811 is roughly 2.2:1, well under readable. The item art's own printed title is drawn grey-on-grey and cannot be read at all. Body serif at ~17px and the gold section labels are fine, and every button is min-height:48px or 56px so touch targets pass.

### Aura Off
`aura-off` · satellite · action · first committed 2026-08-29 · **workbench-gated** · impact 3/5 · effort M
`satellites/aura-off/index.html`

**Now:** A deep violet-to-plum vertical wash with a soft amber lamp bloom behind the title, and a band of small overlapping head-and-shoulder crowd silhouettes with warm dots (phone screens) across the very bottom 40px. Everything above that band is unbroken gradient with flat translucent purple cards floating on it; on the FIT CHECK screen the whole middle of the phone is five identical rounded panels and one gold-outlined selection.

**Wrong with it:**
- The middle 400px of the FIT CHECK screen is one flat purple wash with zero depth or scenery - the composed street (paving grid, lamp circle, crowd) only exists in the last 40px at the very bottom, so the game's best-looking asset is a strip you barely notice.
- The five fit cards are five identical rounded rectangles with the same fill, same radius, same silhouette; only the gold border separates the selected one. Nothing in the frame is a picture of a shoe, a cloth or a suit, so a screen about how you LOOK shows no clothing at all.
- The stat sublabels ("+8 CROWD", "+4 CROWD · +4 PANEL", "NOTHING TO LIVE UP TO") are .62-.66rem grey mono on purple - under the 0.7rem floor and low contrast; the greyed "School uniform" row reads as disabled when it is a live choice.

**Background now:** CSS gradients only, no image files in the game at all (the 11 asset files are PWA icons and mocap cache sheets). body = radial lamp glow rgba(255,182,39,.10) over a 3-stop linear from --deep #2b1450 to --ground #1a0b2e plus a bottom darkening pass, background-attachment:fixed. .floor adds two lamp radials, a lit-circle radial and a perspective-transformed paving grid; #crowd is procedural head+shoulder radial-gradient glyphs.

**Background wanted:** bg-square-dusk-540x960.jpg - a night plaza seen head-on: brick wall, chainlink, two sodium lamps, wet paving catching magenta and amber, the top third dark enough to hold the cream title. Painted, so the flat mid-screen has somewhere to be.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-square-dusk-540x960.jpg` | 540x960 full-bleed, night plaza, brick + chainlink + two sodium lamps, wet paving, magenta/amber key, top third under 12% luminance | replaces the flat body gradient behind every menu and screen; fixes the empty middle of FIT CHECK and gives the crowd band a wall to stand in front of |
| `fit-loud-clogs-256x256.png, fit-all-black-256x256.png, fit-headcloth-256x256.png, fit-frog-suit-256x256.png, fit-school-uniform-256x256.png` | 256x256 transparent PNG each, single garment or shoe on nothing, painterly, warm rim light from upper left, big readable silhouette | the five fit cards currently carry no image; one thumbnail each breaks the five-identical-rectangles look and makes the choice visual instead of textual |
| `stage-lamp-glow-540x300.png` | 540x300 transparent, soft amber cone with dust motes, hard-light blend | replaces the flat radial lamp bloom behind the title so the light has grain instead of a smooth ramp |

**CSS to do:**
- .fitgrid > * - give each card a 56px art slot on the left (grid-template-columns:56px 1fr) so a garment thumbnail has somewhere to go, and vary the selected card's elevation (box-shadow) not just its border.
- .fitgrid .mono / the stat sublabels - raise font-size from .62-.66rem to .72rem and lift the colour from --bone-44 to --bone-88 so the +CROWD/+PANEL numbers clear the 0.7rem floor.
- .fitgrid .off (the School uniform row) - stop rendering unselected-but-valid options at disabled opacity; reserve the dimmed treatment for genuinely locked rows.
- .stage / .screen - extend .floor and #crowd up behind the menu screens (currently bottom:0 height:58% only on the arena) so the paving grid and lamp circle are visible under the card stack, not just at the bottom edge.

**Emoji as art:** Almost none - only 2 emoji in the whole build (the injected ♫ music note and a feedback glyph). The fighters are a procedural SVG bone rig (src/engine/rig.js), the crowd is procedural CSS. This is a rare game that is NOT leaning on emoji.

**Readability:** Sublabels at .62-.66rem (about 10px) are under the 0.7rem floor and sit at low contrast on purple. The "STEP UP" button label is gold-on-dark and fine. Body copy at 16px is fine. Card tap targets are ~62px tall, over 48px.

### Times Table Quest
`multiplication-chart` · satellite · math · first committed 2026-07-18 · impact 3/5 · effort M
`satellites/multiplication-chart/index.html`

**Now:** Boot is an instructions wall: gold numbered discs down the left, cream body copy, sage section labels on near-black. Play is a full-width 12x12 grid where every row is a different hue - red, orange, yellow, green, teal, blue, violet - saturated headers with pale bodies and dark numerals, under a dark score header and above a gold "Done" slab.

**Wrong with it:**
- The rainbow pastel grid is a different game's palette from everything around it. The shell is midnight greenhouse (#0d100c, sage, gold, cream) and the board is a nursery-school spreadsheet; the two meet at a hard black edge with no frame, mat or transition.
- The Music chip is parked in the top header and covers the "Streak x0" readout and the right half of the "12x12" mode label.
- The three-digit answers (108, 110, 120, 132, 144) shrink to fit their ~26px cells, so the bottom-right quadrant is both the smallest type on the board and the lowest contrast, on the palest lilac and blue cells.
- On the instructions wall the injected arcade back arrow sits on top of the CONTROLS heading and the number-6 bullet, cutting the word in half.

**Background now:** Flat radial near-black shell (#14100f to #06070a) over a #0b0f0b stage; the board is opaque black behind procedurally generated HSL cells (headerCol/bodyCol at index.html:263-264, hsl(h,72%,83%)). No image assets - the one file in the folder is an og share card.

**Background wanted:** bg-slate-540x960.jpg - a painted chalkboard/desk: dark green-black slate with faint chalk grain, a warm lamp fall-off from the top-left, a wooden frame edge, so the chart sits on a surface instead of floating on void.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-slate-540x960.jpg` | 540x960 full-bleed painted chalkboard with a worn wooden frame edge and a warm lamp wash from the top-left, centre kept near-black so cell colours still pop | replaces the flat radial gradient; gives the grid a surface and stops the board floating in void |
| `chalk-frame-540x420.png` | 540x420 transparent, hand-drawn chalk double rule with soft corner flourishes sized to wrap the 12x12 grid | gives the board an edge instead of the current hard cut between coloured cells and black background |
| `tile-tex-64x64.png` | 64x64 seamless faint paper/chalk tooth, greyscale, to multiply over the cells at about 8% opacity | kills the flat vector-swatch look without changing any of the hues or the readability |
| `badge-perfect-200x200.png` | 200x200 transparent gold laurel-and-star stamp with a soft glow | the Perfect round bonus is currently the bold word "Perfect" and nothing else |

**CSS to do:**
- headerCol() and bodyCol() at index.html:263-264 - replace the full-spectrum hsl(h,...) sweep with a 4-hue house ramp (sage 95, teal 175, gold 42, rose 345) at the same lightness values, so the chart stops fighting the midnight-greenhouse shell.
- The grid cell rule - set one fixed font-size (13px) with letter-spacing:-.5px for 3-digit values instead of shrink-to-fit, and darken 3-digit ink to #1a1a1a on the pale cells.
- The play header row - reserve padding-right:120px under 420px so the injected Music chip stops covering "Streak x0" and the mode label.
- The instructions screen (.pad) - add padding-bottom:96px so the injected arcade-exit back arrow stops landing on the CONTROLS heading.

**Emoji as art:** light - a checkmark on the Done button, a triangle on the arcade exit, a gear and a star (4 distinct in 8 uses). The chart itself is CSS-coloured divs, not emoji.

**Readability:** 3-digit cell numbers shrink noticeably and sit on the palest lilac and blue cells, the weakest contrast on the board. "Round 1 of 8 - found 3 of 23" is ~12px muted cream. The feedback bug and its close circle bottom-right are ~28px, under the 48px floor. Cells are ~26px square at 12x12 on a 375 phone, well under 48px, though pinch and +/- zoom are offered as the mitigation.

**Music chip:** yes - the chip covers the "Streak x0" readout and the right half of the "12x12" label in the play header. On the instructions wall it sits beside "How to play" and covers nothing.

### OriVex
`petalvex` · satellite · puzzle · first committed 2026-07-07 · impact 3/5 · effort M
`satellites/petalvex/index.html`

**Now:** A real painted paper-cut scene: birch trunks and a snow bank behind a 4x4 puzzle bed, a painted fox standing at the bottom right, and tiles that are genuine painted paper wedges with stitched edges and hand-set numbers. But the bed itself is a flat pale blue-grey slab with a 1px grid filling the top 60% of the frame, so the first thing you read is a large empty box sitting on a photograph.

**Wrong with it:**
- The empty bed is a ~355x355 slab of flat pale blue-grey with a hairline grid, and it is the single largest object on screen. The slot fill is rgba(18,22,14,0.26) which barely tints the pale winter theme showing through, so the puzzle area reads as a hole cut in the background rather than a surface.
- The tray is clipped. The third row of tray tiles is sliced in half by the bottom control bar (Menu / Reset / Tidy / Nudge) with no scroll affordance, so the player sees a row of half-tiles at the frame edge.
- The floating feedback pair (a grey x and a red ladybug) sits on top of the tray tiles at bottom right and lands squarely on the painted fox's head, covering the one piece of character art in the frame.
- The rolled theme is the cold pale winter one. The same folder ships bg_theme_2.jpg (navy paper, gold lanterns, sage paper leaves, a paper moon) which is exactly the house midnight-greenhouse register; the pale day themes fight the palette and keep coming up.

**Background now:** Canvas draws a vertical gradient #101610 to #0a0d09, then in the default 'enamel' skin drawImage of assets/bg/bg_theme_N.jpg. Eight painted 540x960 paper-cut JPGs plus bg_bed.jpg and bg_menu.jpg, cycled per puzzle (P.themeIdx). Real painted art, live and loading (23MB asset set, 46 files).

**Background wanted:** Keep the painted themes, they are the best art in this batch. What is missing is a painted SURFACE for the bed to sit on: right now the empty bed sits directly on the theme's empty sky. Add a bed plate drawn under the slots, and add more themes in the bg_theme_2 midnight register so the pale winter/day themes stop dominating the roll.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bed-plate-720x720.png` | 720x720, transparent outside the square. A painted linen or paper quilt square with a stitched border and faint cell divisions painted in; warm neutral, slightly darker than the theme sky. | Replaces the rgba(18,22,14,0.26) slot wash. Turns the empty 355px bed from a flat hole in the sky into a fabric bed the tiles get laid onto. |
| `bg_theme_8.jpg through bg_theme_11.jpg` | 540x960 each, four files, full-bleed. Paper-cut night scenes in the register of the existing bg_theme_2: deep navy paper ground, gold paper lanterns, sage paper leaves along the bottom, a cream paper moon, a few star flecks. | Four of the eight live themes are pale daylight scenes that fight the midnight greenhouse palette and wash out the pastel tiles. Doubling the midnight themes halves how often a cold pale one rolls. |
| `tray-shelf-750x210.png` | 750x210, full-bleed, transparent above the shelf line. A painted wooden or folded-paper ledge with a soft cast shadow under its front lip. | The tray tiles currently float on the snow bank with only a 9px grey 'TRAY' label to explain them. A ledge gives the tiles somewhere to sit and separates tray from board. |

**CSS to do:**
- The tray region (drawn on the same canvas as the board, laid out in computeLayout): reserve the control bar height. The bottom button row is ~62px plus safe area; subtract that from the tray's available height so the third tray row is not sliced, or cap the tray at two rows and scroll it.
- The injected feedback pair (the fixed grey x and red ladybug at bottom right): move to bottom:104px; right:8px so it clears the tray and the painted fox, and set opacity:.55 until tapped.
- The canvas 'TRAY' label (ctx.fillText, currently ~9px grey): raise to 12px, fill #e8dcc8, and add a 2px rgba(0,0,0,.6) shadow. On the snow-bank theme it is presently invisible.
- HUD timer and 'nudges 0' use fillStyle #5c6350 (a QA fix for cream-on-cream). On the pale blue themes that grey is also low contrast; give the HUD a 2px dark text-shadow instead of darkening the fill, so it reads on both light and dark themes.

**Emoji as art:** Only in furniture: the ladybug feedback button, and the glyphs on the control bar (menu bars, reset arrow, the grid mark on the picker Play button). The tiles, wedges, frame, particles and all eight backgrounds are real painted PNG/JPG art.

**Readability:** The 'TRAY' label is roughly 9px grey on a light snow bank and is effectively invisible. The timer and nudge counter in #5c6350 on pale blue are low contrast. Control bar buttons are 48px+ and fine. Tile numbers are large and clear.

**Music chip:** On the boot / how-to-play screen the chip sits dead on the 'How to play' heading and hides the words. On the play screen it lands in the HUD gap between 'Daily / Bud' and the timer and covers nothing.

### LOAF
`ext-loaf` · satellite · creative · first committed unknown · **workbench-gated** · impact 3/5 · effort M
`satellites/ext-loaf/index.html`

**Now:** A deep plum-indigo page with amber accents, a heavy Bricolage Grotesque display face and DM Mono body - a real and deliberate typographic identity, distinct from the rest of the fleet. SCAN YOUR CAT in white-then-amber, a pill toggle, an example specimen card, then a grid of fifteen flat mauve cat silhouettes on plum tiles. The silhouettes are generated SVG paths from a SHAPES map, consistent in weight and each with a small ground line. Nothing on the page is painted - imgTags are three empty img elements waiting on a camera scan.

**Wrong with it:**
- The MUGI example card's art tile is a flat mustard-to-brown gradient - a third colour belonging to neither the plum ground nor the amber accent - and the black cat silhouette on it is CLIPPED at the right edge of the 96px tile, tail running off the panel (.demo .art, loaf.html:62).
- Two disembodied gold eye orbs float above Specimen slot empty with no head, no muzzle and no body - two identical ellipses with black slit pupils reading as stray shapes, then a large dashed empty rounded box under them. Nothing in that block sits in a motivated group.
- Every label and every line of body copy runs at 10-11px real (this page is not stage-scaled, so those are true pixels): CERTIFIED VOID MERCHANT, THE LOAF, the CHONK/VOID/ZOOMIES bar labels, 0 OF 15 SHAPES and all fifteen index captions. The FOIL rarity chip is 8px. All under the 0.7rem / 11.2px bar.

**Background now:** Flat, pure CSS: body is radial-gradient(120% 80% at 50% -10%,#2A1B3D 0%,transparent 60%) over --ink #150E1D (loaf.html:31). Every panel is a rgba plum gradient. bgImageDecls 0; the only images are three empty img tags for the camera capture.

**Background wanted:** None needed as a full-bleed - LOAF is deliberately a field-instrument UI, not a scene, and the plum-on-amber restraint is the point. What it wants instead is one painted hero: the empty specimen slot and the example card are the two places where nothing is painted and it shows.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `card-art-placeholder-300x300.jpg` | 300x300, painted amber-lit windowsill with an empty cushion and a dust mote or two, plum shadows, warm rim light from the right, matched to --panel #221733 at the edges so it seats in the card | Fills the empty .photo slot. Right now the empty state is two floating eyes over a dashed box. |
| `example-mugi-300x300.jpg` | 300x300, one painted example cat in the loaf posture, warm rim light, near-black form on a plum ground, no mustard | Replaces the mustard gradient tile with the clipped silhouette in the MUGI demo card. The page's one hero image is currently the same generated silhouette used 15 more times in the index below it. |
| `loaf-eyes-160x80.png` | 160x80 transparent PNG, the two amber eyes painted as ONE unit with a suggestion of muzzle and ear tips in near-black, soft glow falloff | If the eyes stay, they need to read as a cat in the dark rather than two loose ellipses with slit pupils. |
| `index-tile-ground-108x24.png` | 108x24 transparent PNG, a soft painted shadow ellipse, mid-plum fading to nothing | Replaces the flat 1px grey line currently sitting under each of the 15 index silhouettes; the hard line is the only unmotivated edge in an otherwise clean grid. |

**CSS to do:**
- loaf.html:62 .demo .art - the silhouette overflows the 96px tile on the right. Add padding:8px and object-fit:contain (or shrink the SVG viewBox) so MUGI's tail stops being cut off.
- loaf.html mono block - raise every font-size:10px rule (lines 41, 129, 139, 172, 183, 193, 200, 209, 258, 294, 330, 399) and the 11px rules to 12px minimum, and the 8px .demo .art .rr FOIL chip (line 65) to 11px, to clear the 0.7rem bar.
- The MUGI card art gradient - restate the tile in var(--panel-2) #2E2044 with an amber 1px rim instead of the mustard-to-brown gradient, so the third colour leaves the palette.
- The two .pupil orbs - the pair has no container. Give the wrapper a radial-gradient head shadow behind them (or swap in loaf-eyes-160x80.png) so they stop reading as two stray shapes.
- The THE CARD / THE ROOM pill - the amber pill is not centred in its track; the right half has visibly more room than the left. Equalise the padding on the track.

**Readability:** Contrast is fine (bone on plum, amber accents). Size is the fault: 10px and 11px DM Mono with .18em letter-spacing everywhere, and an 8px FOIL chip. These are real pixels, not stage-scaled, so they are genuinely under the 0.7rem bar. The Scan a cat button is a full-width amber slab well over 48px; the 15 index tiles are large. No touch-target problem.

### Blooming Words
`blooming-words` · satellite · word · first committed 2026-07-02 · impact 3/5 · effort M
`satellites/blooming-words/index.html`

**Now:** A cyanotype word garden: deep prussian-blue radial ground going from #1a4f74 at the top to near-black at the corners, a ghosted fern watermark behind the board, an empty crossword of translucent blue rounded cells, and five pearl-white pebble discs with dark-blue serif letters arranged in a ring. Gold sun counter top-right, three outlined pill controls (shuffle / hint / sun) along the bottom. Coherent and clearly authored - a real palette, a serif face, a stated concept - but every element is a CSS gradient or a thin-stroke SVG icon; there is no painted art anywhere.

**Wrong with it:**
- The top ~90px between the topbar and the board is dead blue with nothing in it, and the fern watermark that is supposed to fill it is set to opacity:.10 - on the phone it is barely a smudge, so the frame's whole upper third reads as empty
- The empty board reads as an unlit calculator: fourteen identical 33px slate-blue rounded squares with a 1px border, no paper texture, no seed or soil metaphor, nothing that says 'garden' before a word is planted
- Two pieces of injected furniture land inside the play surface: the music chip sits at the left edge of the letter ring (beside the T disc) and the ladybug feedback button plus its close badge sit on top of the P disc's lower-right - both inside the arc the player has to drag through

**Background now:** body #04121e; #app paints radial-gradient(120% 80% at 50% -10%, #1a4f74 0%, #0d3350 42%, #08243a 100%) with an #app::after multiply vignette on top. A .fern SVG at opacity:.10 sits behind the board. Zero background-image declarations and no image files beyond icons/og.png - 14 inline SVGs, all thin-stroke line icons.

**Background wanted:** A cyanotype pressed-plant plate. The og:image:alt already calls this 'a cyanotype word game with a five-petal bloom and ferns' - the game should look like an actual sun-print: paper grain, uneven exposure at the edges, ghosted fronds laid across the sheet.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/bg-cyanotype-750x1334.jpg` | 750x1334 full-bleed. Cyanotype sun-print: prussian ground #0d3350 falling to #04121e, visible cold-press paper grain, brush-edge exposure falloff at all four borders, three ghosted fern fronds laid diagonally (upper-right, lower-left, one crossing centre) at 12-18% white. No hard edges - the plate should feel bled onto paper. | Replaces the flat two-stop radial and the near-invisible .fern SVG. Fills the empty band above the board and makes the ground read as pressed paper instead of a gradient. |
| `assets/blooms-512x512.png` | 512x512 transparent PNG, 4x4 grid of 128px cells: sixteen pressed wildflowers in cyanotype white (chicory, yarrow, forget-me-not, tulip, poppy, fern tip, clover and so on), each with visible pressed-flat veining and a slight ink halo. | The whole reward loop is 'pressed 0/10 flowers' and a planted word currently produces a gold cell border plus a 9x13px CSS rectangle .petal. One sheet turns the payoff into actual specimens. |
| `assets/pebble-128x128.png` | 128x128 transparent PNG. A wet river pebble, pale mint-white, warm rim light upper-left, soft shadow lower-right, slight surface mottling. Letter drawn on top in the existing serif, not baked in. | Replaces .disc's radial-gradient plus triple inset box-shadow. The five discs are the only thing the thumb touches; a painted stone is the cheapest way to make the game look handmade. |

**CSS to do:**
- .fern (index.html:~107) - opacity:.10 is invisible on a phone; take it to .20, raise max-width from 320px to 360px, and add a second offset copy at .07 rotated ~25deg so the band above the board carries something
- .board-wrap - it is justify-content:center inside a flex:1 column, which parks the board mid-frame and leaves ~90px of dead blue above it; set justify-content:flex-start with padding-top:18px and let the fern fill the top
- .cell - a 1px rgba(58,126,160,.55) border plus a two-stop gradient reads as a spreadsheet; add box-shadow:inset 0 0 14px rgba(2,10,18,.35) and drop the border to rgba(58,126,160,.32) so empty cells recede and .filled cells carry the gold
- .ring - the ladybug button and the injected music chip both land inside it; raise .ring's z-index above the chip, or pad the container so no disc sits within 56px of the left edge or the bottom-right corner

**Emoji as art:** Barely - 5 emoji, 4 distinct, all UI furniture (the ladybug feedback badge, the music note, transport glyphs in the soundtrack drawer). No emoji stands in for a character or a flower; the art job is done by 14 thin-stroke SVG icons instead, which is a step above emoji but still not art.

**Readability:** Mostly fine and clearly considered - .journal-chip 13px, .preview 25px serif, controls 14px, --print-dim #a7cbd2 on --deep is comfortable. Three 10px and two 11px declarations are under the 0.7rem floor; the visible one is the 'BLOSSOMS' kicker above 'Garden 1'. Cells are 33px but display-only, not touch targets. The five letter discs and the three bottom pills all clear 48px.

**Music chip:** Yes, twice. In the board frame (my own 375x667 capture, scratchpad/bw-board.png) the chip sits at the left edge directly over the letter ring's left arc just above the T disc, inside the drag area. In the supplied -2play and -3later frames it lands on the SOUNDTRACK drawer and covers the words 'No playlists' and 'tap', leaving a half-sentence of the playlist instructions.

### Bandit's Box
`bandits-box` · satellite · creative · first committed 2026-08-16 · impact 3/5 · effort S
`satellites/bandits-box/index.html`

**Now:** One large, genuinely well-drawn vector raccoon - soft lilac-grey fur with real gradient shading, black-ringed eyes, pink inner ears, a coral collar with a gold bell, banded tail curled up the left side - centred on a near-black plum ground. A four-pill toy strip (bandit / puppet / spinner / pop) runs along the bottom, three round icon buttons top-right, and the title in the top bar is hidden behind the music chip.

**Wrong with it:**
- The raccoon floats. The .stage background paints a lamp pool, a table surface and a far wall, but at .10 and .22 alpha on a near-black ground none of it is visible on the phone - there is no seam where the wall meets the bench, so the character hangs in a void with a shadow under nothing
- The bottom toy strip is hard-clipped mid-word at the right edge ('pop' is sliced) with no fade or arrow, so it reads as a layout overflow rather than a scroller
- The tail reads as a detached object: the pale tail-tip disc sits over the body outline at the left and, at thumbnail size, the tail plus the body silhouette merge into one lumpy blob with no negative space between them

**Background now:** Flat var(--ink) #1B1822 on body, with .stage layering four CSS gradients on top: a radial lamp pool at 46%/12% (rgba(255,232,196,.13)), a linear surface band at 60-66% (rgba(146,132,168,.10)), a wall/floor seam at 58-63% (rgba(0,0,0,.22)) and a corner vignette. Zero image files - the only PNGs in the folder are app icons. Every toy is inline SVG (21 of them) with 40 CSS gradients.

**Background wanted:** A painted maker-bench plate. The CSS already describes exactly the right scene (lamp above and left, worn surface, dark far wall, vignette) - it is just too faint to see. One image does the job the four gradients are failing to do, and gives the toys somewhere real to sit.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/bench-750x1000.jpg` | 750x1000 full-bleed. Worn wooden workbench filling the lower 40%, warm scuffed grain, a dim lilac-grey wall behind it, one soft overhead lamp pool falling from upper-left. Overall value kept between #1B1822 and #3E374F so cream 15px text still reads on it. Nothing in the centre 400x400 - that is where the toy sits. | Replaces the four near-invisible .stage gradients. Gives the wall-to-bench transition an actual visible seam and makes the raccoon look touchable instead of floating. |
| `assets/bandit-contact-shadow-512x180.png` | 512x180 transparent PNG. Soft elliptical contact shadow, darkest and tightest at the centre where the feet meet, feathering to nothing at the edges. Warm-black, not pure black. | The comment at bandits-box/index.html line ~85 says each toy has to draw its own shadow in viewBox coords because a :before lands in the letterbox band. A shipped PNG anchored under the bandit's feet is easier to place than hand-tuned SVG per toy, and lets one asset serve all four toys. |
| `assets/toy-thumbs-608x152.png` | 608x152 sheet, four 152x152 cells: bandit head, puppet head, spinner, bubble-pop sheet. Painted at the same fidelity as the raccoon, transparent background. | The .strip chips are text-only pills right now. Small painted heads make the toy picker read as a shelf of things rather than a tab bar, and make the clipped right edge legible as 'there is more over there'. |

**CSS to do:**
- .stage (bandits-box/index.html:~72) - raise the surface band from rgba(146,132,168,.10) to ~.20 and add a 1px rgba(159,214,192,.12) hairline at the 60% mark so the wall meets the bench through a visible transition instead of a hard nothing
- .strip - add mask-image:linear-gradient(90deg,#000 82%,transparent) and padding-right:28px so the fourth pill fades out instead of being sliced mid-word
- .wordmark - it is flex:1 at the far left and the injected music chip sits on it; give it padding-left:104px (or centre it between the chip and the icon buttons) so the game's name is readable
- .hint - font-size:11px in var(--dim) #9A92A8 is under the 0.7rem floor and low contrast on #1B1822; take it to 13px and var(--milk) at .7 opacity

**Emoji as art:** Almost none - 13 emoji, 2 distinct, and none of them are doing a character's job. The toys are hand-built inline SVG. This is the right way round.

**Readability:** .hint is 11px lowercase at .14em tracking in #9A92A8 on #1B1822 - under the size floor and roughly 4:1 contrast, so the 'pull his ears and tail' prompt is the least readable thing on screen. The .mini label is 11px too. Touch targets are fine and deliberately so: .iconbtn is a real 48x48 with a 36px painted pill inside, and the strip pills are min-height'd to clear 48px rendered - the comments in the file show the author measured it.

**Music chip:** Yes. The chip sits top-left over .wordmark and covers the middle of 'bandit's box' - only 'b' and 'b x' show either side of it, in both -2play and -3later. At boot the music unlock sheet also covers the lower third of the title card including the 'tap anywhere to begin' line.

### Tally
`tally` · satellite · math · first committed 2026-08-18 · impact 3/5 · effort M
`satellites/tally/index.html`

**Now:** A warm cream/tan number puzzle with real design system discipline: a soft irregular orange target blob glowing 'MAKE 28' at the top, a cream equation strip, four rounded operator pills, and a ring of glossy navy 3D beads (2, 4, 12, a spent grey 8) orbiting a cream shuffle button. Boot is a cream 'How to play' modal with numbered orange discs over a blurred menu. It is coherent and deliberate, but every pixel of it is a CSS gradient - there is not one image file in the whole build (grep for .png/.jpg/.webp/.svg in assets/index-C8x9kx15.js returns zero hits).

**Wrong with it:**
- The game's own navy 'Add to Home Screen' banner and its own cream 'Place a number first' toast occupy the same 100px band above the nav and overlap each other - the toast cuts the banner label to 'Add to ...ome Screen' - and the banner covers the bottom bead of the ring ('12' is sliced in half in -2play and clipped in -3later).
- The 🦊 mascot bottom-left is a system emoji with a warm glow pasted behind it. It shares no line weight, no shading and no silhouette language with the beads two inches to its right, and all twelve shop Pals (owl, unicorn, bear, frog, whale, dragon, cat, rabbit, dino, robot, rocket) are the same - the entire reward economy is rendered in system emoji.
- The upper 40% is a single flat tan wash: from the LEVEL 1 header down past the target there is nothing but --bg2 fading to --bg. The horizon is empty and the target blob is left carrying the whole frame alone.
- The orbit ring guide behind the beads is a hairline at roughly 6% alpha - it reads as a smudge, not a ring - and the spent '8' bead is grey-on-tan at about 1.4:1, so the slot it is holding is barely visible.

**Background now:** No image. Body is radial-gradient(120% 90% at 50% -10%, var(--bg2), var(--bg)) - a flat cream-to-tan wash - plus a faint 1px radial dot texture. Cards use linear-gradient(165deg, ...) over --surf. Zero bgImageDecls, zero img tags, zero asset images.

**Background wanted:** bg-tally-attic-750x1334.jpg - a full-bleed painted warm attic shelf behind the play column: an abacus and a jar of loose beads thrown well out of focus, dust in a shaft of window light down the left, vignetted to near-nothing at the centre so the bead ring and equation strip stay the brightest things on screen. Keeps the existing cream/tan/burnt-orange palette exactly.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-tally-attic-750x1334.jpg` | 750x1334 (2x of 375x667), full-bleed JPG, soft painterly, out-of-focus abacus + bead jar, warm window light top-left, heavily vignetted centre | Replaces the flat cream radial wash that fills the top 40% of the play screen and gives the target blob a room to sit in. |
| `pal-fox-256x256.png` | 256x256 transparent PNG, painted fox head 3/4 view, warm rim light, soft cast shadow, same specular language as the navy beads | Replaces the 🦊 system emoji mascot, currently the only figure on screen and the one element in a completely foreign rendering style. |
| `pals-sheet-1024x1024.png` | 1024x1024 transparent PNG, 4x4 grid of 256px painted pal portraits (fox, owl, unicorn, bear, frog, whale, dragon, cat, rabbit, dino, robot, rocket), one shared 3/4 pose and one shared light direction | Replaces the twelve shop emoji. These are what coins buy - the entire reward loop is currently system font glyphs. |
| `target-blob-512x512.png` | 512x512 transparent PNG, painted terracotta clay medallion with a warm rim light, a soft inner glow and a contact shadow; number overlays in CSS | Replaces the CSS radial 'MAKE 28' blob so the hero of the screen has real material instead of a soft-edged colour smear. |

**CSS to do:**
- The install banner (the navy 'Add to Home Screen' bar) - move it to bottom: calc(var(--nav-h) + 8px) and give it a lower z-index than the toast, or auto-dismiss it after one session. Right now it and the toast share one band and it clips the bottom bead of the ring.
- The toast element ('Place a number first') - anchor it above the bead ring (bottom: 46%) instead of over it, so a hint never covers a playable bead.
- The ring guide circle behind the beads - raise the stroke from ~6% alpha to color-mix(in srgb, var(--line) 55%, transparent) at 1.5px so the orbit reads as a ring rather than a smudge.
- The spent-bead state (the greyed '8') - swap the flat grey fill for a 1.5px dashed var(--line) outline at 0.4 opacity, so the empty slot still reads against tan.
- The 'MAKE' micro-label above the target - it renders at ~11px (0.69rem) white on orange, under the 0.7rem floor; bump to 0.75rem with a 1px rgba(0,0,0,.35) text-shadow.

**Emoji as art:** 🦊 as the on-screen mascot bottom-left of the play area, and the full twelve-Pal shop cast (🦉🦄🐻🐸🐳🐲🐱🐰🦕🤖🚀🍭🌼🌆) as the game's collectible reward. 🪙 and 💎 also serve as the two currency icons in the top HUD.

**Readability:** 'MAKE' micro-label ~11px (0.69rem) white on orange, under the 0.7rem floor. The spent grey '8' bead is roughly 1.4:1 against the tan ground. The 'Add to Home Screen' label is physically cut by the toast panel. Everything else reads well and touch targets are generous (beads ~62px, operator pills ~72x48, nav items ~62px tall).

**Looks broken** (confirmed on a second look, severity ugly)**:** In tally-2play.png the cream 'Place a number first' toast sits on top of the navy 'Add to Home Screen' banner, cutting its label to 'Add to ...ome Screen', and the banner covers the lower half of the playable '12' bead. In tally-3later.png the banner still clips the '12' bead's bottom edge. Both panels are the game's own, not injected furniture.

### Flatulence Fighter
`flatulence-fighter` · satellite · action · first committed 2026-07-10 · impact 3/5 · effort M
`satellites/flatulence-fighter/index.html`

**Now:** A warm parchment scene: cream-to-tan radial ground with a faint pinstripe and dot-grid texture over it, a large inline-SVG cartoon face centred, a colour-ramped pressure gauge, three double-bordered sage cards for COUGH/SIP/WAFT, and two big dark-green LEFT HOLD / RIGHT HOLD pads with 3D bottom edges. Genuinely composed and tonally coherent, but every element is CSS, and it is the only game in the batch that abandons the midnight-greenhouse palette entirely.

**Wrong with it:**
- The injected music chip lands top-left over the round banner on both screens. On boot it covers the round title so 'THE FUNERAL' reads as 'UNERAL'; in play it covers the pause button and the front of the alert so 'CHURCH BELLS, vent now!' reads as 'H BELLS, vent now!'.
- The bottom VENT banner is cut off by the viewport edge. In flatulence-fighter-2play.png the teal 'VENT! / RELEASE UNDER THE NOISE' bar runs off the bottom of the 667px frame and its second line is half sliced, and the injected 'New song' chip sits on top of what is left.
- There is no scene, only furniture. The face floats on wallpaper with no pew, no room, no horizon; the top third above the face is empty texture. A game called THE FUNERAL shows you nothing of a funeral.
- COUGH / SIP / WAFT are told apart only by an emoji and a word; the three cards share an identical silhouette, identical border, identical size, so at a glance the row is three copies of the same object.

**Background now:** No image (bgImageDecls is one repeating-linear-gradient, not a file). Body is radial-gradient(120% 90% at 50% -10%, #e7e0cb, #d8cfb2 55%, #c7bd9c), overlaid with a 26px vertical pinstripe at 6 percent and a 28px dot grid at 8 percent, plus a crimson vignette that pulses on pressure.

**Background wanted:** A dim chapel behind the actor. bg-chapel-540x960.jpg: pew backs in dark wood receding into the lower third, a stained-glass window throwing a cool bloom high on the left, candle warmth low right, everything desaturated toward the existing parchment key so the cream cards still read on top. Keep the paper texture as a screen-blend overlay so the current pressure vignette still works.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-chapel-540x960.jpg` | Full-bleed painted chapel interior at the stage size: pew backs bottom third, stained-glass bloom upper left, candle glow lower right, values held down so the cream .card panels keep contrast. | Replaces the flat parchment gradient and gives the game the room its whole premise is set in. |
| `sprites/mourner-360x360.png` | Transparent PNG of the player character from the chest up, in a dark suit collar, in the same soft cartoon line as the current SVG face. Six expression variants on a 1080x1080 sheet: calm, strain, clench, relief, panic, slipped. | Replaces the bare floating SVG head. The face currently has no body and no shoulders, so it reads as a balloon rather than a person in a pew. |
| `sprites/scene-cast-540x260.png` | Transparent strip of the three onlookers named in the copy (the widow, the priest, a neighbour) at pew scale, painted, back three-quarter view so they can turn. | The alert text says 'The widow turns to look' and nothing on screen turns. Replaces a line of text with a beat you can see. |
| `ui/icons-action-192x192.png` | Three 64x64 painted icons on one sheet: a handkerchief cough, a water glass, a folded fan. Warm rim light, transparent. | Replaces the emoji standing in for COUGH, SIP and WAFT, and gives the three identical cards three different silhouettes. |

**CSS to do:**
- .topbar — reserve a gutter for the injected chip. Add padding-left:104px on .topbar (or move the pause button and the round title to the second row) so the music chip stops covering the round name and the alert banner.
- The vent row / bottom banner container — add padding-bottom:calc(16px + env(safe-area-inset-bottom,0px)) and reduce its min-height so the 'RELEASE UNDER THE NOISE' line is not sliced by the viewport bottom.
- .card (the COUGH/SIP/WAFT trio) — break the shared silhouette. Give each a different corner treatment or height, and set the disabled state with opacity:.55 plus a dashed border instead of the current near-invisible dashed grey, which makes SIP and WAFT look unpainted rather than on cooldown.
- .face-wrap — width:min(50vw,230px) leaves the top third of the screen empty. Raise to min(62vw,280px) and pull it up so the face and the pressure gauge form one group instead of two islands.
- body::before texture layer — the 26px pinstripe at 6 percent opacity is invisible at 375px wide. Widen to 34px and lift to 10 percent, or drop it, so it either reads as wallpaper or stops costing a paint.

**Emoji as art:** Heavy: 48 distinct emoji. The COUGH/SIP/WAFT icons, the pressure lung, the church-bell alert icon, the pause glyph and the LEFT/RIGHT hold markers are all emoji. The face is the one genuinely drawn element (inline SVG).

**Readability:** Text is fine: the alert banner, PRESSURE label and pad labels all sit well above 0.7rem after the stage scale, and the letter-spacing suits the parchment. Touch targets are generous, the two hold pads are roughly 160x150 stage px. Two faults: the SIP and WAFT cards on cooldown are dashed grey on tan at very low contrast, and the bottom banner's second line is clipped by the frame.

**Music chip:** Yes, twice. Boot: the chip covers the round title 'THE FUNERAL' and the pause button in the top bar, leaving 'UNERAL' visible. Play: the same chip covers the pause button and the first characters of the alert banner, leaving 'H BELLS, vent now!'. A second injected chip, 'New song', sits bottom-left across the VENT banner's subtitle.

**Looks broken** (confirmed on a second look, severity ugly)**:** Overlapping and clipped UI, both visible without hunting: in flatulence-fighter-1boot.png and -2play.png the music chip covers the top-bar title and the pause button; in -2play.png the bottom VENT banner runs off the 667px viewport with its second line sliced.

### Keepsies
`keepsies` · satellite · action · first committed 2026-09-04 · **workbench-gated** · impact 3/5 · effort M
`satellites/keepsies/index.html`

**Now:** A real-time 3D frame: one lit blue glass marble with a soft contact shadow sitting on a normal-mapped dirt plane that fills the whole screen, vignetted to black at the corners. Above it a gold headline and a cream instruction line, below it three empty outline dots and a faint ghost button. Boot is text only on flat #0d100c: wordmark, one-line rules, a gold PLAY slab and two outline buttons.

**Wrong with it:**
- The marble carries a hard 1px white aliased fringe all the way around its silhouette, clearly visible at 2x. It reads as a cut-out sticker pasted on the dirt, not as a rim light on glass.
- The frame is about 85 percent featureless brown. The dirt plane runs to the top of the screen with no horizon, no backdrop and no chalked ring, so the game named Keepsies never shows the ring, and there is nothing to give the marble a scale.
- The 'I have played marbles before' button is grey #98a086 at opacity .72 over mid-brown dirt with a barely visible 1px border, and the three calibration dots above it are empty 26px outlines carrying the only progress signal on the screen.
- Boot has no image at all: for a marbles game the title screen shows not one marble.

**Background now:** Two different things. DOM shell: flat --bg #0d100c with no image (bgImageDecls 0, imgTags 0). Play: a WebGL scene, procedurally shaded dirt plane plus vignette, no texture files (assets/env and assets/models are both empty directories). The 17MB of assets counted by the scanner is docs/shots screenshots and lib, not art.

**Background wanted:** Not a flat JPG. ART_ASSETS.md is explicit that the dirt and the marbles are procedural on purpose, and that is the right call. What is missing is composition: a far plane with a horizon (a dusk lot edge, a fence line, weeds) so the dirt stops being infinite, and the chalked ring on the ground.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/env/ring-chalk-1024.png` | 1024x1024 PNG, transparent, a scraped and chalked ten-foot ring with worn breaks and scuffed dirt inside the line, projected flat onto the ground plane as a decal. | The ring is in the game's own one-line pitch on the boot screen and appears in no frame. Biggest composition win available and it does not fight the procedural rule. |
| `assets/env/backdrop-lot-2048x1024.jpg` | 2048x1024 strip or equirect, dusk lot edge: chain-link, weed line, one lamp, everything low contrast and warm so the marbles stay the brightest thing in frame. | Gives the far plane a horizon. Today the dirt runs to the top edge and the frame has no depth cue beyond the vignette. |
| `assets/ui/boss-dusty.webp, boss-marlene, boss-pitboss, boss-ironsides, boss-curator` | 160x160 WebP each (also used at 96x96 on the ladder), portrait, one clear silhouette per character per ART_ASSETS.md row 6. | Already specified in the game's own art doc; currently a monogram disc drawn by code. |
| `assets/models/grails/*.glb (Drowned Knight, Astronomer, Koi, Ember Dragon)` | Figure fills ~70 percent of a 22mm sphere, shown at 140px on the inspect turntable, per ART_ASSETS.md row 2. | Already specified; placeholder is one low-poly knight. |

**CSS to do:**
- #calibBottom button (index.html:86) is opacity .72 grey over brown dirt. Raise to 1 and add background:rgba(13,16,12,.55) with a brass border so the only tappable thing on screen reads as tappable.
- #calibTop (index.html:81) starts at the very top-left, directly under the injected music chip, so the headline loses its first word. Pad #calibTop left by 120px, or centre the h2 within a reserved band.
- .tile .nm at .56rem and .tile .cnt at .6rem (index.html:137,140) in the collection screen are well under the 0.7rem floor. Lift to .72rem and .7rem.
- The three calibration dots are ~26px and carry all the progress feedback. Take them to 36px minimum and fill each with a brass disc as a snap lands.
- Renderer: confirm antialias:true on the WebGLRenderer and check the marble's rim/fresnel term. The white fringe on the silhouette is the single worst-looking thing in the frame.

**Readability:** The gold headline (1.25rem) and cream instruction line (0.92rem) are fine. The ghost button at .8rem and opacity .72 over dirt is the weak point on this screen. The collection screen carries .56rem and .6rem labels, both under the floor. Touch targets in the DOM are disciplined: buttons carry min-height 56px, quiet buttons and chips 48px.

**Music chip:** Yes, and it is the worst in this batch. The chip sits over the first word of the headline, so 'SHOW ME YOUR HARDEST SNAP' renders as 'HOW ME YOUR HARDEST SNAP'. The eaten word is the verb of the sentence. Confirmed at 2x in keepsies-2play.png.

**Looks broken** (confirmed on a second look, severity ugly)**:** Injected furniture: the music chip destroys the first word of the calibration headline. The game's own rendering has one visible defect, the hard white aliased fringe on the marble silhouette. No 404s at all. Note the capture recorded zero taps and both play frames are the same calibration screen, so the ring, the thirteen-marble cross and the results screen were never reached by the robot and are not judged here.

---

## STRONG — already carries itself  (19)

### Dew Snip
`dew-snip` · satellite · puzzle · first committed 2026-07-10 · impact 5/5 · effort S
`satellites/dew-snip/index.html`

**Now:** A genuinely painted moonlit forest fills the frame: layered dark foliage framing a blue moon-glow gap, a vine and a lit dewdrop down the centre, fireflies and gold blossoms along the lower edge. Six glossy button plates sit at the bottom. This is the best-looking screen in my batch by a wide margin - 71 real assets including bg_title.jpg, bg_play.jpg, four seasonal backgrounds, 32 sprites and 16 fx sheets.

**Wrong with it:**
- assets/ui/btn_plate_primary.png is a bad crop off a contact sheet. The 313x197 file contains only the right two thirds of the blue plate PLUS a slice of a neighbouring GREEN button on its left edge and a magenta glow fringe along its bottom. Both render live: the green sliver is visible at roughly x=47 on the Garden button, the game's largest CTA, and the magenta smears under it.
- The same button draws CSS furniture underneath the painted plate - index.html:54 sets border-color:#8fc3ea and box-shadow:0 4px 0 #2b567c on .btn.primary while index.html:85 lays the painted plate on top. You see two nested blue button outlines with a gap between them.
- The intro paragraph runs straight across the painted vine and the glowing dewdrop with no scrim, so and let a bead of dew swing free sits on the single brightest pixel group in the frame. At 14px on a 0.694 stage scale that is 9.7 real px.

**Background now:** Painted. #s-title uses url(assets/backgrounds/bg_title.jpg?v=1) center/cover (index.html:94) with a linear-gradient fallback behind it. bg_play.jpg and four bg_season_*.jpg exist for the playfield and results.

**Background wanted:** None needed - the background is already the strongest thing in the game. What it wants is a darkened variant so the button stack has a ground: bg_title_dim with the bottom third scrimmed in the paint rather than fighting the UI.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/ui/btn_plate_primary.png` | RE-CUT at 600x144 (2x of the 300x72 it renders at), transparent margins, the blue plate ONLY - no neighbouring green button on the left edge, no magenta halo along the bottom, bottom rim not clipped | The current 313x197 file carries a slice of a different button and a purple fringe, and both render on the Garden CTA. This is the single cheapest visible win in the batch. |
| `assets/ui/btn_plate.png` | RE-CUT at 600x144, transparent, green plate with its full bottom rim restored and the purple glow fringe trimmed | The current 282x198 file has the plate's bottom rim clipped and a magenta halo baked into the bottom edge; it renders on Daily Dew, Free Vine, Grove, How to play and the gear. |
| `assets/ui/card_frame.png` | RE-CUT at 546x576 symmetric, transparent, all four corner leaf clusters present and matched, no purple bottom fringe | The current 273x288 file has the bottom-right leaf corner clipped and a magenta fringe along the bottom; it frames every level card and the Grove canvas. |
| `assets/backgrounds/bg_title_dim.jpg` | 540x960, the existing bg_title with a 35 percent dark scrim painted into the bottom third and a soft falloff, so the six button plates sit on a settled ground | The button stack currently competes with lit blossoms and fireflies directly behind it. |

**CSS to do:**
- index.html:54 .btn.primary - delete box-shadow:0 4px 0 #2b567c and border-color:#8fc3ea. The painted plate at index.html:85 already carries its own bevel and rim; the CSS draws a second button behind the art.
- index.html:50-52 .btn - drop the CSS border for the same reason once the plates are re-cut.
- index.html:84-85 - center/100% 100% stretches a 282x198 (and a 313x197) plate into a 300x72 box, which is where the corner leaves smear. Switch to border-image 9-slice, or ship the plates cut at the real 300x72 aspect.
- The intro paragraph on #s-title - add background:rgba(6,10,8,.45); border-radius:12px; padding:10px 14px so the copy has a scrim instead of running over the painted dewdrop.
- Buildstamp (11px stage = 7.6 real px at 375 wide) and the body copy (14px = 9.7 real px) - raise to 16px and 18px stage respectively to clear the 0.7rem bar.

**Emoji as art:** Present but decorative, not load-bearing - 23 emoji, 13 distinct, mostly in the Grove and how-to copy. The buttons use real painted PNG icons (icon_garden, icon_daily, icon_free, icon_grove, icon_gear, icon_retry, icon_share, icon_menu), so emoji are not standing in for art on the screens that matter.

**Readability:** Contrast is good against the painted ground and the labels have a glow. Two faults: the intro paragraph crosses the lit dewdrop with no scrim, and the type is small - 14px body and 11px buildstamp on a 540 stage scaled 0.694 render at 9.7 and 7.6 real px, both under 0.7rem. Button heights are min-height:72px stage = 50 real px, which clears 48.

**Looks broken** (confirmed on a second look, severity ugly)**:** assets/ui/btn_plate_primary.png (313x197 RGBA) contains a slice of a DIFFERENT green button along its left edge plus a magenta glow fringe along its bottom - a contact-sheet cut that was never trimmed. Stretched by center/100% 100% at index.html:85, both artefacts render on the Garden button in the live boot shot: a yellow-green pill edge at roughly x=47 and a red fringe under the plate's bottom-left. btn_plate.png and card_frame.png carry the same purple bottom fringe and have clipped bottom rims. capture.reached is no-control so only the title screen was shot; the playfield is unassessed.

### Vine Runner
`vine-runner` · satellite · action · first committed 2026-07-03 · impact 3/5 · effort M
`satellites/vine-runner/index.html`

**Now:** The three captured frames all landed on the HOW TO PLAY text wall, so I drove the game myself in headless Chrome to see it. The real thing is genuinely painted: a leafy hand-lettered VINE RUNNER wordmark, a chubby sprout-with-two-leaves runner with thick outlines and rim light, a red thorn cluster and a glowing gold seed pod, all moving down a receding halfpipe drawn as concentric rings. This is real art, comparable to Berry Vine. But the whole screen is green on green on green and the painted forest vista is squashed into the tunnel throat where you never see it.

**Wrong with it:**
- The injected '♫ Music' chip sits top-right and covers the LEVEL / MEDAL readout on both the title screen and in play. Cropping the top strip at 2x shows 'LEVEL 1' and 'MEDAL' ghosting out from behind the chip's right edge, with '0m' shoved to the screen edge under it. It also crowds the game's own '?' help button.
- vista.png, a 284KB painted vine tunnel and the best asset in the folder, is drawn at index.html:697 as g.drawImage(vista, vp.cx-vw/2, vp.cy-vw/2, vw, vw) with vw=R()*1.4, which crushes it into the ~120px vanishing point. In play the tunnel interior is a muddy dark-olive smear. The forest is bought and never seen.
- Green on green on green. The runner is a green sprout on a green tube wall on a green field; only the red thorn and the gold seed separate from the background at a glance. On the title screen the character has almost no silhouette against the ring behind it.

**Background now:** Painted art exists and is loaded: art/vista.png (284KB), art/title.png (156KB) plus runner poses, seed, thorn, boost, bloom, leaf, hud-seed and two unlockable skins in art/skins/{bud,flower}. But the play background itself is procedural canvas: a 'lit checkerboard (bands x sectors)' tube drawn as flat fills, with vista.png only composited at the vanishing point. The title screen shows a flat olive field with ring arcs and no vista at all.

**Background wanted:** Two things. A tiling painted vine-tube wall so the halfpipe is a surface instead of a checkerboard, and a proper canopy backdrop for the title screen. Also draw the existing vista.png as a full-frame parallax layer at low alpha behind the tube, not only as a 120px blob in the throat.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `art/run-2.png` | 512x512 transparent PNG, the second frame of the Sprout run cycle: opposite leg forward, leaves trailing the other way, matched exactly to run.png's outline weight and rim light | It 404s on every boot (404 /satellites/vine-runner/art/run-2.png). _POSE_FILE at line 133 maps run2 to it and line 999 falls back to a horizontal FLIP of run.png, so the base Sprout swaps handedness every stride instead of running |
| `art/tube-wall-1024x1024.jpg` | 1024x1024 seamlessly tiling, painted living vine interior: ribbed green vine running one axis, wet specular highlights along the ribs, dark moss packed into the grooves, value range kept dark enough that the runner reads on top of it | Replaces the flat 'lit checkerboard bands x sectors' fills that make the tunnel a muddy olive smear in play |
| `art/bg-canopy-540x960.jpg` | 540x960 full-bleed painted canopy for the TITLE screen: dark leaf mass top and sides, a warm light break at centre for the wordmark to sit on, a soft blended ground rather than a flat plane | The title screen is currently a flat olive field with ring arcs and a hard diagonal edge, and it does not use vista.png or any other art behind the logo |
| `art/thorn-2.png and art/thorn-3.png` | 256x256 transparent PNGs each, two more hazard silhouettes distinct from thorn.png: a barbed coil and a low bramble mat, same red-black palette and outline weight | Every hazard in a run is the same red cluster, so two hazards in one frame share an identical silhouette |
| `art/runner-rim-512x512.png` | 512x512 transparent PNG, a warm cream rim-light and soft contact-shadow pass shaped to the Sprout silhouette, to be composited under the runner sprite | The green runner has almost no separation from the green tube wall; a warm rim is the cheapest fix for the game's biggest readability problem |

**CSS to do:**
- HUD placement vs the injected chip: the '♫ Music' chip parks top-right and covers the LEVEL / MEDAL block on both the title and play frames. Move the level/medal draw to the top-left under the seed counter, or reserve x > W-120, y < 90 in the HUD layout so nothing is drawn there.
- Title tagline draw ('dash the halfpipe · gather seeds · reach the bloom'): drawn full width with no inset, first and last glyphs touch x=0 and x=375. Inset 20px each side and shrink the font until it fits inside that box.
- 'FULL LOOP! SPEED SURGE' toast: dark maroon fill on dark olive, and clipped at the right edge. Give it a cream fill with a dark stroke outline, and clamp its measured width to W-40 before drawing.
- vista draw at index.html:697: g.drawImage(vista, vp.cx-vw/2, vp.cy-vw/2, vw, vw) with vw=R()*1.4 buries a 284KB painting in the tunnel throat. Add a second full-frame parallax pass of the same image behind the tube at low globalAlpha so the forest is actually visible.
- Title screen ground: two flat greens meet on a hard diagonal edge in the lower third. Add a gradient blend band or a painted horizon strip so the surfaces meet through a transition.
- #vrHow overlay: it is the first and only thing three consecutive automated captures could reach, and my own driven session needed the overlay force-hidden to get past it. Whatever the dismiss control is, it is below the fold of a long scrolling wall on a 375x667 screen. Pin a persistent 'START RUNNING' button to the bottom of #vrHow with position:sticky;bottom:0.

**Readability:** The 'FULL LOOP! SPEED SURGE' toast is dark maroon on dark olive and clipped at the right edge. On the title screen 'next runner: Bud · reach level 10' and the two control lines are muted grey-green on green at roughly 11-12px. The LEVEL / MEDAL readout is unreadable because the music chip is on top of it. Touch targets are fine: the '?' button and the arcade back button are both comfortably over 48px.

**Music chip:** YES. The injected '♫ Music' chip parks top-right and covers the LEVEL n / MEDAL HUD block, with 'LEVEL 1' and 'MEDAL' visible bleeding out from behind its right edge and '0m' / '25m' pushed against the screen edge underneath. Present on both the title screen and the play frame. It also sits immediately against the game's own '?' help button.

### Bramblewick
`bramblewick` · satellite · action · first committed 2026-07-05 · impact 3/5 · effort S
`satellites/bramblewick/index.html`

**Now:** The only game in this batch with painted art on screen. Boot shows an ornate gold BRAMBLEWICK wordmark wrapped in leaves with a hop-cone crest, sitting on a dark forest painting (assets/menu.jpg) under a green-black scrim, inside a rounded panel with a gold hairline. Palette is exactly the house one: #0d100c ground, sage, gold, cream, muted. The play frame is the same panel scrolled to the difficulty row, three toggles and a block of gold-highlighted rules text.

**Wrong with it:**
- The VERDANCY row clips: Thicket is cut in half at the panel's right edge because .seg is inline-flex with overflow:hidden and four options do not fit 375px, so at least one difficulty is invisible.
- The rules paragraph runs off the bottom of the panel mid-word ("...eam to level up and ...ild") with no fade or scroll cue, so it reads as truncated rather than scrollable.
- The painted menu.jpg is scrimmed to 72-90% black, so the background is an undifferentiated brown-black mush. The art has been paid for and then hidden.
- The GROUND stage buttons wrap into a ragged 3+2 with an orphaned Long Dark on its own row, and each locked one carries a raw emoji padlock.

**Background now:** Painted image with a scrim: #menu.on = linear-gradient(rgba(6,9,5,0.72),rgba(6,9,5,0.9)) over url('assets/menu.jpg') center/cover. In game a canvas letterboxed inside #wrap{background:#000}, with per-stage painted plates loaded through the ART map (bg.jpg, bg_greenhouse, bg_sundrift, bg_sunkenbeds, bg_understory, bg_longdark) plus 6 boss PNGs, 24 companion PNGs and a pile of ability icons. 74 asset files, 4.8MB.

**Background wanted:** None needed, the plates are already painted and wired. What it needs is for the existing menu.jpg to actually be visible: lift the flat 72-90% wash to a radial so the middle of the forest reads while the panel edges stay dark.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `menu-vignette-540x960.png` | 540x960, transparent, a soft dark vignette with a painted leaf-and-bramble frame around the edges | Lets the scrim come off the centre of menu.jpg without the panel text losing contrast, so the paid-for forest is finally visible. |
| `panel-bark-720x960.png` | 720x960, transparent, painted vellum-over-bark texture with a soft gold edge glow | Replaces the flat rgba(13,16,12,0.92) fill on .panel so the menu card is a made object rather than a grey rectangle. |
| `lock-32.png` | 32x32, transparent, small painted brass padlock with a warm highlight | Replaces the emoji padlocks on the four locked GROUND buttons, the only emoji in the game. |
| `letterbox-soil-375x120.png` | 375x120, horizontally tileable, a dark soil and bark band with a soft top edge | Fills the top and bottom letterbox bars so the canvas playfield does not meet pure #000 at a hard edge on a 375x667 phone. |

**CSS to do:**
- .seg (line 34-35): the VERDANCY row must not clip. Give it flex-wrap:wrap and remove overflow:hidden, or move the four difficulties to a 2x2 grid, so Thicket is not cut in half.
- .seg button (line 35): min-height:44px is under the fleet 48px minimum. Raise to 48px.
- .panel (line 20): add mask-image:linear-gradient(180deg,#000 88%,transparent) plus a visible scroll cue so the rules text fades rather than being sliced mid-word.
- #menu.on (line 19): swap the flat scrim for radial-gradient(ellipse at 50% 42%, rgba(6,9,5,.35), rgba(6,9,5,.92) 70%) so the painted forest reads through the middle.
- #wrap (line 15): background:#000 to #0d100c plus an inset shadow, so the letterbox bars are greenhouse-dark instead of pure black.

**Emoji as art:** Minimal: 5 emoji, 4 distinct. Four lock glyphs on the locked GROUND buttons, and a leaf emoji in the logo img onerror fallback. Everything else on screen is a painted PNG or JPG.

**Readability:** CSS floors at 0.9rem which is fine, but the canvas HUD drops to bold 9px sans-serif, well under 0.7rem at 1x on a phone. .seg button is min-height:44px, under the 48px rule. The clipped Thicket label is unreadable by definition.

**Music chip:** Yes. On the play frame the bottom-left New song chip covers the start of the last rules line, hiding the keyword before "eam to level up". At boot the music unlock sheet covers the bottom third of the menu panel, including the area where PLANT & PLAY sits.

**Looks broken** (confirmed on a second look, severity ugly)**:** Clipped UI on the menu: the fourth VERDANCY option renders as "Thicke" cut off at the panel's right edge (.seg inline-flex + overflow:hidden at index.html:34-35 on a 375px viewport), and the rules paragraph is sliced mid-word at the panel bottom with no fade. Both are visible in the 2play and 3later frames.

### Ripcord
`ripcord` · satellite · action · first committed 2026-08-30 · **workbench-gated** · impact 3/5 · effort M
`satellites/ripcord/index.html`

**Now:** The audit frames all landed on the How to Play sheet (capture.reached stuck-on:dismiss:DIV.sheetBody), so no gameplay was captured: a full-screen wall of cream body prose on warm dark brown (#241C17) with gold small-caps section heads — handsome, generously set typography, and zero illustration. The game behind it, checked against the repo's own 375x667 probe shots (docs/shots-ceremony/05-play.png, docs/shots-3d/probe-375x667-mid.png), is a photoreal top-down clay arena: a steel rim with red kerbs, chalk lines on packed dirt, and a detailed machined top with glow rings. That part is the best-looking playfield in this batch.

**Wrong with it:**
- The arena disc floats on flat near-black with hard vignette corners — roughly the top 150px and bottom 180px of the 667px frame are empty brown-black, and the '0 0 / FIRST TO FOUR / rung 1 of 25' HUD hangs in that void with nothing behind it. The horizon is literally empty.
- 'YOU BURST +2' is plain system-font green sitting raw on the dirt texture with no plate and no drop shadow; the letterforms collide with the chalk lines behind them and it reads as debug text laid over painted art.
- The wind card clips its own content: the bottom stat row renders as a half-height 'SPEED 15' cut by the panel edge, and the panel covers the lower third of the arena it is describing. (docs/shots-ceremony/01-wind-card.png, 375x667.)

**Background now:** --lo #160F0C flat near-black behind #stage; the arena itself is a canvas-drawn textured disc from assets/arenas/*.webp (pangkah, range, taya, uri) with a baked vignette. The LAUNCH 3D view clears to the same near-black, so the chrome dish hangs in a void with no floor and no horizon.

**Background wanted:** bg-arena-surround-540x960.jpg — the room the dish sits in, so the empty bands above and below the arena become a place instead of a black margin.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg-arena-surround-540x960.jpg` | 540x960 full-bleed. A dim workshop floor around the dish: worn boards, a coil of rope, a chalk box, two hanging lamps throwing warm gold pools into the top 150px and bottom 180px of the frame, everything at least 3 stops darker than the arena. | Replaces the flat --lo void behind #stage. Fills the two dead bands that currently top and tail every gameplay frame. |
| `ui-shout-plate-360x96.png` | 360x96 transparent PNG. A torn chalk-dust banner, soft feathered edges, slightly warmer than the dirt, sitting about 55% opaque in the middle and fading to nothing at the ends. | Goes under 'YOU BURST +2' and the other result shouts so they stop sitting unshaded on the arena texture. |
| `hud-score-plate-375x110.png` | 375x110 transparent PNG. A slate-and-brass scorebar: two dark score wells left, a thin brass rule, a worn label strip right for the rung counter. | Gives the '0 0 / FIRST TO FOUR / rung 1 of 25, balance' header something to sit on, so the top void reads as arena furniture rather than an unfilled margin. |
| `env-3d-floor-1024x1024.jpg` | 1024x1024 tileable dark boards, warm brown, low-frequency grain, plus a separate 2048x512 horizon gradient card (near-black at the top fading to #1a1310). | The LAUNCH 3D scene's far plane is the same value as the dish's shadow, so a chrome bowl floats in nothing. A floor and a horizon card also give the chrome something warm to reflect. |

**CSS to do:**
- #stage / the element behind canvas — swap `background:var(--lo)` for the surround poster plus `radial-gradient(60% 45% at 50% 50%, transparent 0, rgba(0,0,0,.75) 100%)` so the arena keeps focus while the margins stop being empty.
- The wind-card panel (the 'A / Try rounder laps.' sheet) — it cuts its last stat row in half; give it `max-height:calc(100vh - 380px); overflow-y:auto` plus a 12px bottom mask-image fade so SPEED is never rendered half-height.
- The shout text (the 'YOU BURST +2' element) — add `text-shadow:0 2px 0 #160F0C, 0 0 18px rgba(0,0,0,.9)` and `letter-spacing:.02em`; it currently has no separation from the texture beneath it.
- .sheet (index.html:80) — the How to Play sheet is ~2900 characters of unbroken prose; reserve a 375x180 block after the WINDING head for a winding-gesture diagram, otherwise three paragraphs describe a finger motion with no picture.

**Emoji as art:** Minimal — 92 emoji but only 4 distinct, and they are small control glyphs in the chrome (gear, X, the ◄ back arrow), not stand-ins for art. The tops, parts, arenas, decals and emblems are all real painted or 3D assets (167MB across assets/3d, assets/parts, assets/arenas, assets/topdown, assets/emblems).

**Readability:** How to Play body is 15px cream (#EDE6D8) on #241C17 — comfortable and well led. The weak line is --dim #9C9286 at ~13px for the sub-header ('rung 1 of 25, balance') sitting on near-black. Touch targets are explicitly governed: --tap:48px is declared at index.html:22 with a comment confirming the stage is not transform-scaled, and the LAUNCH button is well over it.

**Music chip:** The chip lands inside the sheet's own header row, wedged between the 'HOW TO PLAY' title and the 'Done' button with roughly 5px of clearance each side at 375px. It covers no text at this width but reads as a third header button, and at 320px it would sit on the title.

### Petal Plunge
`petal-plunge` · satellite · action · first committed 2026-07-06 · impact 3/5 · effort S
`satellites/petal-plunge/index.html`

**Now:** The only game in this batch with real painted art. A run is a full-bleed painted forest gorge - mossy boulders, fallen logs, pines, brambles and glowing mushrooms scattered down the slope, a sprite rider on a wooden sled trailing a sparkling ribbon, and a gold serif DEPTH / PETALS HUD. The menus sit on a dark painted garden photo-painting under a cream-and-green serif wordmark.

**Wrong with it:**
- The Music chip parks dead centre at the top of the running game and covers the COMBO x17 readout, sitting between DEPTH and PETALS as if it were a third HUD tile. Worse, the bottom-left 'New song' chip completely covers #ctlL, the LEFT steer control (index.html:214) - during a run only TUCK and RIGHT are visible.
- The obstacles repeat with no variation: the same pine appears six times and the same mossy boulder five times in a single frame, all at identical scale and none flipped, so a hand-painted slope reads as a tiled sheet.
- The mode-select cards use emoji as icons on top of painted art - a skier for Free Plunge, a red flag for Slalom, sparkles for Freestyle, and a calendar emoji for Daily Descent that renders a literal 'JULY 17'. The Shop button uses a shopping-bags emoji. Four clip-art glyphs on the one screen where the painted background is doing its best work.
- bg_meadow.jpg is a bright noon-blue-sky painting while the menus, the wordmark and every other biome are dark - the first biome of the run fights both the house palette and the screen the player just came from.

**Background now:** Painted full-bleed JPGs loaded through the ART module: assets/bg_meadow.jpg, bg_bramble.jpg, bg_mushroom.jpg, bg_thorn.jpg, bg_night.jpg (registered at index.html:577). 53 asset files, 6MB. Menus use a dark painted garden image plus a radial scrim at line 54.

**Background wanted:** It has one, and it works - except bg_meadow.jpg, which is a bright cyan-sky noon meadow. Repaint that single file at late afternoon or dusk: warm gold light, deeper greens, no cyan, so the biome ladder reads as one journey from dusk garden down into the night gorge instead of a jump-cut out of the dark menu.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg_meadow.jpg (repaint, 540x960)` | same composition, relit for late afternoon: warm gold key light, deeper saturated greens, sky pushed to amber-rose instead of cyan, horizon haze | the current noon-blue version is the one asset that clashes with the dark menus and the midnight-greenhouse palette |
| `obs_tree_b.png, obs_boulder_b.png, obs_shroom_b.png` | 128x128 transparent each, second variants of the three most-placed props - a leaning pine, a split boulder with a moss cap on the other side, a shorter clustered mushroom pair | gives the placer something to alternate so a frame stops showing the same silhouette five and six times |
| `mode-icons-256x256.png` | 256x256 transparent sheet, four painted 64x64 icons: a leaf sled, a bamboo gate pair, a trick spiral with petals, a dew-drop day marker | replaces the four emoji on the 'Choose a Descent' cards, including the calendar emoji that prints a wrong hard-coded date |
| `hud-plate-375x64.png` | 375x64 transparent, a painted bark-and-stone HUD bar with two recessed wells for DEPTH and PETALS and a centre well for COMBO | gives the HUD somewhere to live and reserves a centre slot, which also stops the music chip landing on the combo readout |

**CSS to do:**
- .ctl (index.html:155) and .ctl.mid (159): the steer controls are rgba(8,10,7,0.32) with a 1px sage border and .ctl.mid's label at 0.5 alpha - over the sunlit canyon they nearly vanish. Give them a solid rgba(8,10,7,0.72) plate, a gold border and a full-opacity cream label.
- #ctlL (index.html:214) is completely covered by the bottom-left music chip during a run - lift the control row above the chip's 72px reserve, or move the chip's docking corner for this game.
- .item icon on the Choose a Descent cards (index.html:121): replace the emoji text node with an <img> from mode-icons-256x256.png at 40px.
- .hstat (index.html:139) HUD pills already own both top corners; reserve the top-centre 140px as a combo well so the injected chip cannot sit on the COMBO readout.

**Emoji as art:** Four on the mode-select screen (skier, red flag, sparkles, calendar-with-a-baked-in-date), one on the Shop button, plus a firefly-lantern and cherry-blossom emoji inside the how-to copy. Everything in the actual run is painted PNG or a procedural fallback - the emoji are confined to the menu chrome, which is exactly where the painted background makes them look worst.

**Readability:** The steer buttons are the fault: .ctl.mid draws its label at rgba(224,194,104,0.5) over bright terrain, and in the canyon frame 'TUCK' and 'RIGHT' are barely legible. Touch targets are fine - .ctl has min-height 48px. HUD numerals are large and gold on dark plates. The how-to wall body copy is comfortably above 0.7rem.

**Music chip:** Yes, both chips. The top chip sits centred over the COMBO readout during a run (visible covering 'COMBO x2' and 'COMBO x17' in two separate run frames), and the bottom-left 'New song' chip completely covers #ctlL, the LEFT steer control. On the how-to screen it covers the left half of the 'Let's go' button.

**Looks broken** (confirmed on a second look, severity ugly)**:** Run frames captured locally (shots2/pp-run2.png, pp-run3.png): the LEFT steer control is entirely hidden behind the 'New song' chip and the COMBO counter is behind the top chip - a player mid-run cannot see or reach one of three controls. The audit's own 2play/3later frames are the 'How to Plunge' wall, not the playfield, with the chip over the 'Let's go' button. The feedback ladybug badge also floats on the playfield at about x=340,y=545. No missing-image 404s - all 53 assets load.

### Cosmic Cadets
`seed-flutter` · satellite · action · first committed 2026-07-10 · impact 3/5 · effort S
`satellites/seed-flutter/index.html`

**Now:** Boot is a painted night sky filling the whole frame — violet nebula, a full moon top-right, scattered stars, a golden comet burst low-centre — under a big gold 'Cosmic Cadets' wordmark, then a gold primary slab and four dark green-black mode slabs with small painted icons. The play/results frame is a different painted scene: a dark cliff arch framing a starfield with blue-grey cloud banks at the sides, and the run summary stacked in the upper third above three big buttons at the foot. Real painted JPGs and a real painted UI kit (btn_plate, card_frame, star_full/empty, ten icon_*.png).

**Wrong with it:**
- The injected '♫ New song' chip sits directly ON TOP of the '🌟 Sky Map' button on the results screen — you can read 'Sky Map' ghosting through the chip. Sky Map is unreachable from #s-go.
- The results panel is hollow: everything sits between roughly y=180 and y=380, then about 170px of flat empty sky before the Again button. The two `<div style="flex:1"></div>` spacers at index.html:187 and 195 push the block to the top and leave the middle of the frame with nothing in it.
- Hierarchy is inverted — 'clear the course to earn sunbeams · 🪙 +1 Stardust' is the largest, brightest gold line on the screen, bigger than the 'Gap 1 of 45' heading, wraps to two lines and runs past the painted vignette's edge; meanwhile 'DAILY COURSE #246 · GAPS' and 'Best Bloomstreak 0 · grew 0 stars' are small grey and sage lines that dissolve into the starfield.

**Background now:** Real painted JPGs under dark scrims — bg_title.jpg on #s-title, bg_results.jpg on #s-go, bg_play.jpg on #s-how/#s-set/#s-ward/#s-grove (index.html:48-50), each with a 180deg rgba(8,11,14) gradient over it; the canvas playfield draws its own sky. Four more phase skies (bg_phase_rosedawn / goldveil / meteor / frostnight) are shipped in assets/backgrounds.

**Background wanted:** none needed — the skies are already painted and good. What is missing is a middle-ground: a foreground silhouette layer so the hollow band on the results screen is not bare sky.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `fg-results-cliffline-540x260.png` | 540x260 transparent PNG. A near-black silhouetted cliff edge with two star-spires and three drifting seed shapes, soft gold rim light along the top contour, fully opaque at the bottom edge. | Sits across the bottom third of #s-go so the ~170px dead band between the stats and the Again button becomes foreground instead of empty sky. |
| `ui-results-card-460x300.png` | 460x300 nine-slice transparent PNG, matching the existing assets/ui/card_frame.png language: thin gold rule, dark translucent fill, small corner flourishes. | Puts the run summary on a plate. Right now every line floats loose on painted sky, which is why the small sage and grey lines vanish. |
| `icon-stardust-40x40.png` | 40x40 transparent PNG, a painted gold mote with a soft bloom, matching the star_full.png rendering. | Replaces the 🪙 emoji in the '+1 Stardust' line. assets/ui already has this icon family, so the one emoji in the sentence is the only thing breaking the painted look. |
| `fg-title-vignette-540x300.png` | 540x300 transparent PNG, a soft dark cloud bank fading from opaque at the bottom to nothing at the top. | Goes over the bottom of bg_title.jpg so the four mode buttons sit on darkness rather than on the comet burst, which is currently the brightest area of the title screen. |

**CSS to do:**
- #s-go .row (the #go-grove / #go-home / #go-share button row) — the injected music chip lands on the first item and buries Sky Map. Change .row to a 2-column grid with Sky Map on its own full-width line above Menu/Share, so nothing sits under the bottom-left corner the chip claims.
- .sun-earn — it is the largest gold text on #s-go and out-shouts .go-big; drop it to 15px var(--cream) with the stardust icon, and give .go-big the gold and the size.
- #s-go .pad (index.html:186-196) — the second `<div style="flex:1"></div>` at line 195 hollows the middle; change it to `flex:0 0 24px` so the summary block sits optically centred instead of top-heavy.
- #go-bloom (14px var(--sage)) and .go-lab — raise both to 15px and lift the caption colour from --muted #8a9178 toward #a8b096; at 14px sage over a starfield they read as texture, not text.
- .title-sub (index.html:57) — 14px with 4px letter-spacing in --sage sits on the nebula's brightest band on #s-title; add `text-shadow:0 1px 3px #000` or move it below the comet burst.

**Emoji as art:** Mixed, and inconsistently so. The title-screen mode buttons use painted PNGs through `.btn .micon` (icon_drift, icon_daily, icon_gauntlet, icon_zen, icon_skymap), but the results screen still uses raw glyphs: '↻ Again', '🌟 Sky Map', '◄ Menu', '↗ Share' (index.html:196-200) and '🪙 +1 Stardust' — even though icon_retry.png, icon_skymap.png, icon_menu.png and icon_share.png all exist in assets/ui. The painted icons are shipped and #s-go does not use them.

**Readability:** #go-bloom at 14px --sage #7ab356 and the 'DAILY COURSE #246 · GAPS' caption in --muted are both low-contrast over a busy painted starfield and sit at or under the 0.7rem bar. Touch targets are fine — .btn declares min-height:72px and the small variants still clear 48px. The wrapped 'clear the course to earn sunbeams · 🪙 +1 Stardust' line runs wider than the painted vignette that is meant to contain it.

**Music chip:** Yes, and it is the worst in this batch: the '♫ New song' chip covers the '🌟 Sky Map' button on the results screen. Confirmed at 2x on shots/seed-flutter-2play.png — the words 'Sky Map' are visible ghosting behind the chip's fill. The chip picked its corner against the boot layout, where the bottom-left was empty.

**Looks broken** (confirmed on a second look, severity ugly)**:** Overlapping UI, visible in the frame: at 2x on shots/seed-flutter-2play.png the injected music chip is drawn fully over the #go-grove 'Sky Map' button in the results button row, with the button's own label showing through underneath. Not a render failure — the painted art all loads and badRequests is empty — but one of the three results-screen controls cannot be reached.

### Burr Blast
`burr-blast` · satellite · action · first committed 2026-07-05 · impact 3/5 · effort S
`satellites/burr-blast/index.html`

**Now:** The play and later frames are a genuinely painted storybook panel: Bramble, a burr creature in a dented helmet, drawing a wooden slingshot in a sunlit greenhouse, warm greens and golds with real depth and a caption bar under it, then three pill buttons (Back, Skip, Next) with Next in gold. The boot frame is the same carousel one slide earlier and it is NOT painted: a flat green-to-black gradient with a giant tulip emoji and a wobbly black hill drawn on canvas.

**Wrong with it:**
- Comic panel 1 renders the emoji placeholder even though assets/comic-1.jpg exists and is 60KB. drawComicPanel runs 40ms after the screen shows and ART.load's onload only flips a flag (im.onload=function(){ART[nm].ok=true;}) with no redraw, so the first slide a new player ever sees is a giant tulip emoji while slide 5 is fully painted. One carousel, two art styles.
- The painted card floats on a bare near-black page with about 90px of empty black above it and 120px below. Nothing frames it, and the horizon of the frame is empty in both directions.
- The feedback FAB is a raw ladybug emoji in a thin circle at the top right of the story screen, level with the Music chip, so a debug-looking control shares the game's first impression.

**Background now:** Flat near-black page with a faint green top vignette. The story panel is a canvas that draws either the painted comic jpg cover-fit or, when the jpg has not decoded, a linear gradient plus a warm radial, a sine-wave hill and a giant emoji glyph at 34% of panel height (index.html:3218-3229). The playfield, unseen, draws a painted bg-world<N>.jpg when loaded, else a W.sky1-to-W.sky2 canvas gradient (2330-2337).

**Background wanted:** None needed as new painting: bg-world1..4.jpg, menu-bg.jpg and comic-1..6.jpg are already painted and sitting in assets/ (9.9MB, 73 files). What it needs is for panel 1 to actually use the file it already has, and for the story screen to reuse menu-bg.jpg blurred behind the card.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `story-frame-375x667.png` | 375x667, transparent, a painted leaf, twig and burr border with the middle cut out for the comic card | Stops the painted panel being a plain rectangle floating on flat black with an empty top and bottom. |
| `icon-feedback-64.png` | 64x64, transparent, a small painted ladybug in the game's warm palette with a soft rim light | Replaces the raw emoji in the feedback FAB that sits on the title and story screens. |
| `status-icon-64.png (x6: burn, sparkle, sprout, leaf, charge, frost)` | 64x64 each, transparent, painted in-run status glyphs matching the existing seed and relic art | Replaces the emoji used as run-state glyphs at index.html:1028, 1040, 1069, 2706-2707, 2783-2851, 2988. |
| `comic-1.jpg` | already exists, 540x540-ish, 60KB, painted | No repaint required. It simply is not being drawn, because the panel is never redrawn once the image decodes. |

**CSS to do:**
- #scr-story: add the existing assets/menu-bg.jpg as a blurred, darkened background-image so the comic card sits in the garden rather than on flat black.
- The #comicCanvas wrapper: add box-shadow:0 18px 48px rgba(0,0,0,.6) and a 1px rgba(200,168,75,.4) hairline so the painted card has a frame instead of a hard edge against the page.
- The feedback FAB injected by feedback.js (.lwf-fab): move it to the bottom-right and give it the same glass treatment as the Music chip so two unrelated floating controls do not sit level across the top of the first screen.
- Every font-size:9px and 10px rule in the stylesheet (there are at least six): raise the floor to 11.5px, all are under 0.7rem.

**Emoji as art:** Yes at the seams, 117 emoji across 59 distinct glyphs, though the core art is real. The comic placeholder glyphs (tulip, grub, crown, sprout, target, burst, blossom in COMIC at 3204-3211) are drawn at 34% of panel height as the ENTIRE illustration whenever a jpg is late or missing, and fire, sparkle, sprout, leaf and charge emoji are used as in-run status glyphs. Characters, materials, seeds, relics, companions, nodes and slingshot skins are all painted PNGs.

**Readability:** The caption "Bramble. Keeper of the Patch." is bold white sitting directly on the painted card with no scrim, and it lands on light foliage in the lower left, so it is close to losing contrast. Several 9-10px CSS font sizes elsewhere are under 0.7rem. Buttons (Back / Skip / Next) are comfortably over 48px.

**A "looks broken" claim here was refuted on a second look.** Refuted on the images. In burr-blast-1boot.png the story panel is a deliberately composed canvas fallback, not a failure surface: green-to-black gradient, warm radial glow upper-right, soft hill silhouette, centred tulip glyph, vignette. There is no missing-image box, no broken-image icon, no blank rectangle and no error text, and the caption "The garden of Lucid Winds. / Quiet. Growing." is bold 

### Acorn Drop
`tonic-drop` · satellite · puzzle · first committed 2026-07-11 · impact 3/5 · effort M
`satellites/tonic-drop/index.html`

**Now:** The play screen is a genuinely composed painted scene: a carved gold-and-wood ornate frame (hollow_amber.png) with oak leaves, brass studs, checkerboard corners and gold arrows, wrapped around a purple painted graffiti-cellar wall (bg_cellar.jpg), with glossy painted cube sprites that have angry faces and gem symbols falling down it. The boot screen is much weaker: a bright yellow-and-cyan italic comic wordmark over six flat rounded button slabs, a painted squirrel mascot in a shell suit bottom-right, and a painted workshop background that a heavy dark overlay has erased below about a third of the way down.

**Wrong with it:**
- PLAY: the injected floating "♫ Music" pill sits directly on top of the bottom-left pad button and completely hides the ◀ MOVE label — only a few pixels of the grey arrow glyph poke out above the pill. The most-used control in a falling-block game is buried under furniture.
- BOOT: the fleet feedback fab lands on the mascot's face — the dark ladybug disc covers the squirrel's right cheek and the small ✕ chip sits squarely on his sunglasses. The source comment at index.html:136 already knows the fab owns x=W-90..W-12 / y=H-174..H-96 and that the mascot lives in that exact corner, and nothing was moved.
- BOOT: bg_title.jpg is wiped out by its own overlay. #s-title layers linear-gradient(180deg,#140e26cc,#0a0714e0 62%,#0a0714f6) over it, so the bottom two-thirds is flat near-black with zero texture and the six menu slabs float on a void, while the top third shows a murky brown workshop that reads as noise rather than a place. A painted background is being paid for and not seen.

**Background now:** Two real painted JPGs, not gradients. Boot: #s-title = assets/backgrounds/bg_title.jpg (warm brown workshop) under linear-gradient(180deg,#140e26cc 0%,#0a0714e0 62%,#0a0714f6 100%). Play: bg_cellar.jpg drawn full-bleed 540x820 to canvas (purple brick/graffiti wall with halftone dots, paint drips, hard-edged triangles and a checkerboard), with hollow_amber.png composited on top as the frame. Menu/shop/how share bg_cellar.jpg. Fallback if an image misses is a two-stop linear gradient. Shell behind everything is radial-gradient(120% 80% at 50% 0%, #161022, #070510 70%, #000).

**Background wanted:** Keep both images — they exist and they are good. Boot needs the value falloff painted INTO the JPG (dark lower third, warm gold rim light on the top-left clutter) so the CSS overlay can drop to ~40% and the workshop is actually visible behind the buttons. Play needs a quieter variant of bg_cellar for the centre column so the graffiti stops competing with the pieces.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/backgrounds/bg_title.jpg` | 1080x1920 full-bleed repaint/regrade of the existing workshop: value falloff painted in so the bottom third is already near-black, warm gold rim light on the shelf clutter top-left, palette pulled from brown/orange toward the game's gold + rose so it stops fighting the purple-navy UI | Replaces the current image, which the #s-title overlay crushes to invisibility below 40% height — the boot screen currently reads as a black void with slabs on it |
| `assets/backgrounds/bg_cellar_quiet.jpg` | 540x820 full-bleed, same cellar wall, but graffiti drips, halftone dots, hard triangles and checkerboard pushed to under 15% contrast across the centre 60% column; full detail kept at the left/right edges where the gold frame covers it | The painted cube sprites and especially the 0.22-alpha landing ghosts currently disappear into wall detail; a quiet centre keeps the art and returns the readability |
| `assets/ui/icon_stash.png, icon_daily.png, icon_sprint.png, icon_zen.png, icon_shop.png, icon_how.png` | six 96x96 transparent PNGs, painted in the game's own gold/rose/teal with the same chunky black outline as the sprite set — acorn, calendar leaf, stopwatch, crescent, satchel, question mark | Replaces six system emoji (🌰 📅 ⏱️ 🌙 🛒 ❓) that render in six unrelated styles inside a fully painted game that already ships acorn_amber/rose/teal.png |
| `assets/sprites/ghost_frame.png` | 64x64 transparent, a soft cream dashed outline square with a faint inner glow, no fill | Replaces the current landing hint, which is the full painted sprite at globalAlpha 0.22 — on the graffiti wall it reads as a half-loaded broken tile, not a hint |
| `assets/ui/mascot_hero_safe.png` | 700x900 transparent, same squirrel pose recomposed with his raised hand fully inside the canvas and ~90px of empty margin at the bottom-right corner | Replaces mascot_hero.png, whose hand is amputated by the 375px viewport edge and whose face is the exact spot the feedback fab mounts |

**CSS to do:**
- Injected music chip (music-unlocks.js): it scores the BOOT layout where bottom-left is empty, then never re-places, so in play it lands on the pad. Add `.sws-music-chip{bottom:118px; left:12px}` scoped to the playing state (or right:12px/bottom:118px) so it clears the 92px-tall .padbtn row.
- `#hud .chip` — background:#140f24b8 is only 72% opaque, so the gold canvas frame reads straight through the 'caps' chip. Change to #0d0a16f2 plus backdrop-filter:blur(6px).
- `#hud` — the 'Zen Grove / no fail · free gather' chip runs off the right edge at 375px. Set #hud{gap:4px} and give that chip flex:1 1 auto; min-width:0; overflow:hidden; text-overflow:ellipsis.
- `#hud .chip span` (.66rem) and `.padbtn small` (.62rem) are both under the 0.7rem floor — raise both to .72rem.
- `#s-title` background overlay — soften the stops from #0a0714e0 62%/#0a0714f6 100% to #0a071499 62%/#0a0714cc 100% and add radial-gradient(120% 70% at 50% 22%, transparent, #05030acc) so the painted title art survives behind the button stack.
- `.btn` — drop the filled slab: background:linear-gradient(180deg,#1e1836,#131024) becomes rgba(10,7,18,.42) + backdrop-filter:blur(3px), and give all six one gold border (#c8a84b66) instead of the current four unrelated hues (green-black, olive, blue-black, indigo).
- `#buildstamp{color:#94889f66}` — 40% alpha grey on near-black is unreadable and it runs under the mascot's shoe. Use #cbbfd6b3 with text-shadow:0 1px 2px #000, and bottom:6px→bottom:4px with a left-aligned safe zone.
- `.title-mascot{right:-14px}` → `right:64px; width:212px` so the raised hand is not cut by the viewport and his face clears the feedback fab's reserved box (x=W-90..W-12, y=H-174..H-96).

**Emoji as art:** Six system emoji carry the entire title menu icon set: 🌰 Stash Run, 📅 (a literal July 17 calendar glyph) Daily Stash, ⏱️ Sprint, 🌙 Zen Grove, 🛒 Shop, ❓ How. Two more sit in the play HUD chips (🐛 pests, 🌰 caps) and the buildstamp. 21 emoji / 13 distinct across the file. The irony is that the game already ships painted acorn_amber/rose/teal.png sprites and six mascot poses — the menu just does not use them.

**Readability:** HUD sub-labels (#hud .chip span) at .66rem ≈ 10.5px and pad labels (.padbtn small) at .62rem ≈ 10px are both under the 0.7rem floor. The 'Zen Grove / no fail · free gather' chip is clipped off the right edge at 375px. #buildstamp at #94889f66 (40% alpha) is effectively invisible and is further cut mid-string by the mascot's shoe. The 0.22-alpha landing-ghost pieces are near-invisible against the graffiti wall. Touch targets are fine: .padbtn min-height 92px, #hud .chip 48px, .btn/.xbtn 72px+.

**Music chip:** PLAY SCREEN: the chip covers the entire bottom-left pad button — the ◀ MOVE control. Its label is fully hidden; only a small grey arrow tip shows above the pill's top edge. Textbook boot-scored placement: on the boot screen bottom-left is empty dark ground so the chip scores clean there, then it never re-places and in play that corner is the left-move button.

**Looks broken** (confirmed on a second look, severity ugly)**:** Not an art failure — two overlap/clip faults you can see in the frames. (1) tonic-drop-2play.png: the injected '♫ Music' pill fully covers the ◀ MOVE pad button, hiding a primary control. (2) tonic-drop-2play.png: the top HUD's 'Zen Grove / no fail · free gather' chip runs past the right viewport edge and its border is cut off. (3) tonic-drop-1boot.png: the feedback fab disc and its ✕ sit on the mascot's cheek and sunglasses. No missing-image boxes, no blank playfield, capture.badRequests is empty and capture.pageErrors is empty — every referenced PNG/JPG exists on disk.

### Seed Pot
`seed-pot` · satellite · puzzle · first committed 2026-07-09 · impact 3/5 · effort M
`satellites/seed-pot/index.html`

**Now:** A painted autumn arbour: amber leaves, bare branches, warm bokeh lights and a wooden deck, with a large painted terracotta pot filling the frame, a hanging lamp casting warm light from the upper left, and a painted green vine wreathed across the pot's rim. A sprout in a rainbow drop beam hovers above the mouth.

**Wrong with it:**
- The pieces pile OUTSIDE the pot. FLOOR is 902 while the pot sprite is drawn from y=202 to y=932 (index.html:227 and 426), so the seeds and the big leaf rest at the very bottom of the frame in front of the pot's painted clay belly, on the wooden deck, rather than inside the vessel. The centre leaf is clipped by the bottom edge and the right-hand seed is a sliver at the frame's right edge.
- A dashed cream guide line runs the whole height of the pot, from the rim right down to the floor (drawDropper, ctx.setLineDash([4,8]) at index.html:458, SET.guide defaults true). Over painted clay it reads as a hairline crack or a stitching seam splitting the pot in half.
- The NEXT panel top-right is clipped by the canvas edge: the right socket's gold ring is cut off, and the narrow wooden tab to its left is reduced to a 20px sliver with the small 'NEXT' label floating on painted leaves with no plate behind it.
- The Music chip covers the painted back button (assets/ui/icon_back.png, index.html:155). Only the dark shape of the arrow's left edge shows behind the pill. The ladybug fab and its × float on the pot's right shoulder with nothing behind them.

**Background now:** Painted seasonal photo-real background loaded from assets/bg/bg_<season>.jpg (autumn shown), plus a painted pot sprite from assets/pot/, a painted vine from assets/vine/, and painted tier sprites from assets/tiers/tier0_idle.png through tier7 with procedural canvas shapes as fallback. 83 asset files, 10.6MB.

**Background wanted:** None needed. bg_autumn.jpg is already painted, warm and correctly vignetted, and the lamp motivates the light on the pot. Everything wrong here is compositional, not a missing background.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/pot/pot_classic_front-560x300.png` | 560x300 transparent PNG, the lower front lip and belly of the classic pot painted as a separate overlay layer, same lighting as the existing pot sprite, soft feathered top edge | Drawn AFTER the fruits, it tucks the bottom of the pile behind clay so contents read as inside the vessel. Fixes the worst fault without touching the physics constants. |
| `assets/ui/next_panel-190x96.png` | 190x96 transparent PNG, painted wooden NEXT plate with two inset gold sockets, sized so it fits inside the 540-wide canvas with 16px of margin | Replaces the current panel whose right socket ring is cut by the canvas edge. |
| `assets/ui/fab_plate-96x96.png` | 96x96 transparent PNG, a small painted wooden disc with a warm rim light and a soft drop shadow | Gives the ladybug fab and the Music chip a surface so they stop floating on painted clay. |

**CSS to do:**
- The NEXT panel wrapper in the top bar — inset it from the right edge (right:16px rather than flush) so the second socket's gold ring is not clipped at 375px wide.
- The back-button img at index.html:155 — it is 44px, under the 48px floor, and sits under the injected chip. Set width/height to 48px and move it to position:absolute;left:12px;top:80px so it clears the chip band.
- drawDropper (index.html:458) — either default SET.guide to false, or shorten the dashed line to run only from DROPY+T.r down to DANGER+40 so it stops at the rim instead of crossing the whole painted pot.
- canvas#game (index.html:38) is a fixed 540x960 block; the vine's outer leaves land within about 2px of the frame on both sides at 375px. Add 8px of horizontal inset to the scale wrapper so the painted vine has breathing room instead of touching the bezel.

**Emoji as art:** Only in chrome, not in the playfield: #go-emoji renders 🪴 or 🏅 at 44px on the game-over card (index.html:133, 361), and the menu ribbon shows a row of seven fruit/leaf emoji as a growth-ladder illustration. Everything inside the pot is a painted tier sprite with a procedural canvas shape as fallback.

**Readability:** The 'NEXT' label is about 10px at 375px and sits directly on painted leaves with no plate, so it is the weakest text on screen. The back button is 44px, under the 48px touch floor. Everything else is canvas art with no small type.

**Music chip:** Yes. The chip sits top-left over the painted back button (assets/ui/icon_back.png) and hides all but a sliver of the arrow. It does not cover the pot or the NEXT panel.

**Looks broken** (confirmed on a second look, severity ugly)**:** Visible clipping of game content, not just chrome: game pieces render outside the vessel on the deck and are cut by the bottom and right frame edges (FLOOR=902 versus a pot sprite ending at y=932, index.html:227 and 426), and the NEXT panel's right socket ring is cut by the canvas edge. Also the painted back button is fully covered by the injected chip. No 404s and no page errors, so no art is missing; the art that exists is composed wrong.

### Inkbound
`grubtrap` · satellite · puzzle · first committed 2026-07-07 · impact 3/5 · effort S
`satellites/grubtrap/index.html`

**Now:** A fully painted screen: a teal-and-gold submerged temple backdrop, a pre-rendered soil board tiled from painted soil textures with a deterministic sprinkle of a second variant, and painted stone-planter blocks with glowing teal cores. A small pale mouse and a purple grub sit on it as painted sprites with a soft warm glow behind them. The whole look is carried by real art, not CSS.

**Wrong with it:**
- The music chip at 10,10 covers the 'Ground 1' level heading and the smaller grub-count sub-line underneath it - the two pieces of HUD that tell you where you are.
- The four movement buttons are flat olive-green CSS slabs (linear-gradient(180deg,#233015,#18220f), plain triangle glyphs, buildCtrl at index.html:755) bolted under a fully painted board. Nothing about them belongs to the world, and their split layout - up/down on the left, left/right on the right - reads as two broken halves of a d-pad rather than one control.
- The board is a hard-edged rectangle with a thin maroon border dropped straight onto the painted backdrop: no vignette, no soil spill, no rim, no transition of any kind. The control bar underneath ends in a visible horizontal band where its gradient starts at 72%.
- The hero and the grub are ~20px on a 375px screen against a field of high-contrast teal-and-stone tiles, so their silhouettes are nearly lost - the critterGlow() canvas gradient is doing all the work of separating them.

**Background now:** Real painted art. Eight skins under skins/s1..s8, each with a 130KB+ bg.jpg drawn via drawCover plus a sprites/ folder of sixteen keys (soil, soil2, block, block2, wall, wallc, seed, seedpop, hero, herohit, grub, grubfast, life, fxtrap, fxalarm, fxclear). loadSkinAssets() at index.html:270 is a working art-loading hook; ensureBoard() pre-renders the soil field. The title screen also paints the skin bg behind it via applyTitleSkin().

**Background wanted:** none needed - the painted skin backgrounds already carry the frame and there are eight of them. What is missing is not another background but a transition between the board and the backdrop.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `frame-bed-edge-96x96-9slice.png` | 96x96 transparent 9-slice: a painted planter-bed rim in wet soil with moss in the corners and a few pebbles, soft shadow on the inner edge | replaces the 1px maroon rect around the board and gives the playfield an actual edge into the painted backdrop instead of a hard cut |
| `dpad-key-144x144.png plus dpad-key-pressed-144x144.png` | 144x144 transparent, a painted stone or root cap key with a carved arrow, warm rim light, and a pressed variant sunk 4px with a darker top | replaces the flat olive CSS gradient slabs built in buildCtrl() - the only unpainted objects on a fully painted screen |
| `hero-glow-ring-128x128.png` | 128x128 transparent, a soft warm cream halo with a slightly denser inner ring, premultiplied for additive blending | replaces the procedural critterGlow() radial gradient so the ~20px hero and grub keep a readable silhouette against a busy tile field |

**CSS to do:**
- buildCtrl() mk() inline style: background:linear-gradient(180deg,#233015,#18220f) to a skin-tinted translucent glass (rgba dark over backdrop-filter:blur(6px)) so the pad stops fighting the teal and gold board.
- #sws-music-chip on this game: place it bottom-left - top-left is the 'Ground N' heading and its sub-line.
- #sws-music-min: 40x40 measured, raise to 48x48 (it is the only sub-48px target on the screen).
- #ctrlbar background:linear-gradient(0deg,#0a0d09 72%,#0a0d0900): start the fade around 35-40% so the control bar dissolves into the painted backdrop instead of cutting it with a visible band.

**Emoji as art:** UI chrome only, none in the playfield: a mouse glyph on the Play button and a palette glyph on Skins (index.html:130-131), five glyphs as the How-to-play bullet icons (mouse, grub, warning, acorn, sun), a 52px grub or leaf as the game-over face, and a sun glyph on the sunbeam line.

**Music chip:** The chip covers the 'Ground 1' level heading and the smaller grub-count sub-line at the top-left of the play HUD.

### Jade Garden
`mahjong` · satellite · board · first committed 2026-07-08 · impact 3/5 · effort S
`satellites/mahjong/index.html`

**Now:** A real painted greenhouse table: misty forest-through-leaded-glass backdrop (assets/chrome/bg-table.jpg) with a 12-column mahjong board of ivory tiles laid on it, each tile a CSS plate with a lip and drop shadow carrying a painted face (roses, dragonfly, butterfly, maple leaf, coin clusters). Boot is a lit stone arch with the sage 'Jade Garden' wordmark. This is the best-looking game in the batch.

**Wrong with it:**
- The play bar has no plate behind it: .pbar carries no background, so the sage 'Bamboo Grove' title and the 12px muted '0/56 pairs' sit straight on the brightest lit-glass part of the painting and are close to unreadable at the top of the frame.
- The board is packed edge to edge with nothing under it: tiles run within a few px of both screen edges and the bottom row nearly touches the Hint/Undo/Gardens bar, so the painted table survives only as a thin sliver and the board meets the art through a hard edge instead of a tray.
- Tiles clamp to a 32px floor (index.html:527, TW<32 -> 32), so on a 375px screen each tile is roughly 32x43 rendered px, under the 48px touch rule, and the pips on them are font-size:10px.
- The floating feedback widget (round black x plus the ladybug) sits over the lower-right of the board, on top of live tiles.

**Background now:** Painted full-bleed photo-real botanical image, assets/chrome/bg-table.jpg, layered over linear-gradient(180deg,#0e140d,#0b0f0b); menu screen uses assets/chrome/bg-menu.jpg, win screen uses win-bg.jpg. Four alternate table skins already exist (glass, moss, nightbloom, oak).

**Background wanted:** Keep it. What is missing is a tray: a painted mat under the board so the tiles rest on something instead of floating on the room photo, plus a bamboo table skin so the level named Bamboo Grove does not get the generic table.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/chrome/tray-mat-360x560.png` | 360x560, transparent PNG, painted felt/moss mat with a soft gold rim and feathered outer edge, safe to stretch vertically | Replaces the board floating directly on bg-table.jpg. Gives the tile grid a surface and turns the current hard board/backdrop edge into a transition. |
| `assets/chrome/hud-plate-375x56.png` | 375x56, transparent PNG, dark inked band, opaque at the top edge feathering to zero at the bottom, full-bleed horizontally | Sits behind .pbar so the timer, 'Bamboo Grove' and the pairs count stop competing with the lit glass roof in the photo. |
| `assets/chrome/bg-table-bamboo.jpg` | 540x960 JPG, full-bleed, night bamboo grove seen past a dark table edge, warm lantern glow top-centre, deep near-black lower third so tiles read | The Bamboo Grove layout currently renders on the generic bg-table.jpg while glass/moss/nightbloom/oak skins exist. Named level with no matching table. |

**CSS to do:**
- .pbar (index.html:114) - add background:linear-gradient(180deg,rgba(8,11,7,.88),rgba(8,11,7,0)) and text-shadow:0 1px 3px #000 so the HUD survives the painted backdrop.
- .pb-stat (index.html:120) - font-size:12px -> 14px and color:var(--muted) -> rgba(232,220,200,.82); '0/56 pairs' currently prints muted grey over a bright image.
- #boardWrap (index.html:122) - add padding:12px 10px 16px so the board never touches the screen edge or the .ctrls bar.
- Tile floor in the sizing code (index.html:527, 'if(TW<32)TW=32') - raise to 40 and let the layout scroll, or drop a column; 32x43 is under the 48px target.

**Emoji as art:** Only as fallback on the board - .tile .face-img is the painted PNG and .tile .face-fb the emoji behind it; in this shot the painted faces loaded, so no emoji is doing art on the playfield. Emoji still carry every button label: mahjong tile on Play, calendar on Daily garden, bulb on Hint, speaker on mute.

**Readability:** .pb-stat is 12px in --muted (#8a9178) over a bright painted background; the sage 'Bamboo Grove' title lands on the lit glass and nearly vanishes. Tiles render at 32x43, under 48px. Tile pips are font-size:10px.

**Music chip:** Top-left, over the left end of the play bar - it covers the exit control and crowds the timer chip. On boot it sits over the top-left corner of the painted arch.

### Berry Vine
`berry-vine` · satellite · action · first committed 2026-07-10 · impact 3/5 · effort S
`satellites/berry-vine/index.html`

**Now:** A painted nebula fills the frame: deep violet-to-black space, a rainbow comet arc sweeping across the upper third, a dense star field, and a big glossy red-pink star-berry glowing dead centre. Below it, six painted 9-slice button plates with gold-green rims. Capture never entered the playfield (reached=no-more-controls) so this is the title menu, not the game.

**Wrong with it:**
- The hero berry sits exactly where the copy goes. 'SKY WOLF STUDIO' in gold is almost entirely swallowed by the berry's highlight, and the middle two lines of the four-line intro paragraph run straight across the berry and its golden halo. The gold emphasis words (three, swap, Pollen Burst) vanish into the halo completely.
- Double icons on three buttons. The painted ::before icons and the emoji left in the label text both render: Vine Journey shows a painted star cluster AND a 🫐, Wardrobe shows a painted robe AND a 🎀, and Settings shows a painted gear AND a ⚙ side by side. Two gears on one button.
- The primary plate breaks the set. Five secondary plates share an olive body with a lime-gold rim; the Vine Journey plate is a hot pink-red neon rim over plum. Below them the 'All Sky Wolf games' bar is a plain slab with a different corner radius and no painted plate at all, so the bottom of the menu falls out of the system.

**Background now:** A real painted JPG: assets/bg/bg_title.jpg under a linear-gradient scrim that only starts at 42%. Six painted backgrounds ship (bg_title, bg_play, bg_results, bg_nebula_loops, bg_nebula_serpentine, bg_nebula_spiral) plus 86 painted asset files in total across bg/cosmetics/fx/orbs/ui/world.

**Background wanted:** None needed, the art already exists and is the strongest in the batch. What it needs is a REPAINT of bg_title.jpg with the composition fixed: hero berry moved into the lower third, and a quiet band of deep space held across the upper 45% for the wordmark and paragraph to land on.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `satellites/berry-vine/assets/bg/bg_title.jpg (repaint)` | 540x960, same nebula language and palette. Hero star-berry moved down to sit between roughly y=560 and y=860, its halo contained. Upper 45% held as quiet deep space, value under 15%, no bright comet arc crossing the copy band. | Fixes the one real fault on this screen: the intro paragraph and the studio line are currently painted over by the art's brightest area. |
| `satellites/berry-vine/assets/ui/btn_plate_primary.png (repaint)` | 320x96 9-slice, 34% border-image insets to match the existing plate. Same olive body and warm gold-green rim as btn_plate.png, but with a brighter interior glow and a slightly thicker rim so it still reads as primary. | Kills the pink neon rim that is the only thing on the menu wearing a different silhouette from the other five plates. |
| `satellites/berry-vine/assets/ui/icon_home.png` | 60x60 transparent PNG, a painted arcade-door or wolf-mark glyph in the same warm gold-on-olive as the other six ui/icon_*.png files. | The 'All Sky Wolf games' bar is the one unpainted button on the screen; giving it a plate and an icon closes the set. |

**CSS to do:**
- .ribbon: add a scrim so the paragraph survives the art. background:rgba(11,15,11,.62); -webkit-backdrop-filter:blur(3px); backdrop-filter:blur(3px); padding:12px 14px; border-radius:12px. Also raise font-size from 14px to 17px, because inside the 540x960 stage scaled to 0.694 that 14px renders at 9.7 real px.
- .title-sub: same scrim, or move it above .title-word. Today it is invisible against the berry's specular highlight.
- #s-title background: pull the gradient's first stop from 42% up to about 20%, so the copy band is darker than the art band even before the repaint lands.
- #b-journey / #b-daily / #b-rush / #b-zen / #b-ward / #b-set markup: strip the emoji out of the button labels (🫐 📅 🌸 🍃 🎀 ⚙). The painted ::before icons already do that job and three buttons currently show two icons.
- .btn.primary: drop the #e24d6a / #f08a9e / #7d2338 rim colours and inherit .btn's olive body, so all six plates read as one set.

**Emoji as art:** 🫐 📅 🌸 🍃 🎀 ⚙ sit in the six menu button labels, duplicating the painted assets/ui/icon_*.png that the same buttons already paint via ::before. 🎯 🔁 ✨ 🕳 🌈 are the row icons on the How to play screen, at 22px, where nothing is painted.

**Readability:** .ribbon is 14px inside a 540x960 stage scaled ~0.694 to a 375px phone, so 9.7 real px, and it lands on the brightest, busiest part of the painting. Two of its four lines cannot be read. .title-sub at 14px is entirely lost behind the berry. Buttons are fine: .btn min-height 72px CSS is 50 real px, over the 48px floor.

**Looks broken** (confirmed on a second look, severity ugly)**:** The game's own layout, not the injected chip: on all three frames the intro paragraph and the 'SKY WOLF STUDIO' line render over the painted berry's specular highlight and gold halo. Lines 2 and 3 of the paragraph and the gold emphasis words are unreadable. Only bad request is the expected /music/v1/berry-vine/berry-picking-fun.mp3 404. No image 404.

### Jumping Jimothy
`stream-hop` · satellite · action · first committed 2026-07-09 · impact 2/5 · effort S
`satellites/stream-hop/index.html`

**Now:** Boot is a full-page ink illustration: a cream paper ground, a brush-drawn raccoon centre frame with grass tufts under him, the Space Needle and downtown to the left and Rainier to the right, and Jimothy set in a heavy serif with a hand-drawn underline. Play is the how-to-play wall — near-black with a dozen painted item icons (coffee cup, umbrella, snack bag, walk signal, hi-vis vest, rain boots, street lamp, salmon plate) down the left and gold item names beside them.

**Wrong with it:**
- The Music chip is a filled near-black slab dropped on the boot art's cream paper at top-left — the highest-contrast object in the frame and the only element not drawn in ink. On the play frame the same chip covers the header, so the wall opens mid-sentence: the visible line starts with crosses Seattle level after level while the heading word and grab its coin sit behind it.
- The how wall is twelve near-identical rows with no grouping — the power-ups are not separated from the rules by a subhead or rule line, so a painted twelve-icon set reads as a list of receipts. Nothing in the frame is larger than 26px except the button at the bottom.
- Boot's bottom band is a hard cut: the cream illustration stops on a straight horizontal line and Jumping Jimothy / TAP TO START sits on flat near-black below it, with no vignette, deckle or paper edge joining the two surfaces.

**Background now:** Painted throughout. Boot is a full-bleed cream ink key art from assets/bg/ (keyart-portrait.jpg / splash.jpg). Play lanes are painted strips — assets/lanes/road-*.jpg, safe-*.jpg, water-*.jpg, rail2.jpg — with zone-*.jpg and nb-*.jpg neighbourhood backdrops behind them. 1229 asset files, roughly 370MB, plus per-character folders under assets/chars/. The how wall is the exception: a flat dark panel.

**Background wanted:** None needed for the game — this is the best-arted title in the batch. The one gap is the how wall, which is a flat dark panel while every other screen is painted, so the art language breaks one tap in.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/how/how_paper_540x960.jpg` | 540x960 full-bleed JPG. The same cream-ink paper as the key art but pushed dark — a rain-soaked page under a street lamp — vignetted at the edges and flat enough through the middle for 14px body copy. | The how wall is the only screen in a 370MB painted game with no background of its own, so a player leaves the ink world one tap after entering it. |
| `assets/ui/music_pill_ink_120x48.png` | 120x48 transparent PNG. A brush-drawn ink label with a hand-lettered note glyph, no filled slab, sized to sit on cream paper without a border. | Replaces the injected chip's default filled dark rectangle, which is currently the worst thing in the boot frame — a system-styled slab on hand-drawn cream art. |
| `assets/ui/star_ink_48x48.png plus star_ink_empty_48x48.png` | Two 48x48 transparent PNGs, brush-drawn stars in the same ink as the key art, one filled one outline. | Replaces the system star glyphs at #lv-stars (line 739) and #cl-stars (line 1012, 30px gold with 6px letter-spacing) — the last system typography left in an otherwise hand-drawn game. |

**CSS to do:**
- Override the injected music chip for this game: set background:transparent and border:none on #sws-music-chip and let the ink PNG carry it — the injected default is rgba(13,16,12,.86) with a gold border, a filled slab over painted cream art.
- The how-wall container: add the how_paper background and group the twelve power-up rows under a Power-ups subhead with a hairline rule, so the list has structure instead of twelve equal rows.
- The boot title band: add a 40px linear-gradient(transparent, #0d100c) overlay across the bottom of the key art so the illustration fades into the title band instead of ending on a hard straight cut.
- #cl-stars (line 1012): swap the star text glyphs for the ink star PNGs and drop the letter-spacing:6px hack.

**Emoji as art:** Almost none in the UI. Of 219 emoji in the file, 117 are the no-entry sign inside code comments; the live ones are stars and hearts for the rating and score, plus a handful (coffee, umbrella, bin, hi-vis vest, boot, pizza) used only as onerror or canvas fallbacks when a power sprite is missing — POWER_META .g at line 1388 and ctx.fillText at line 4045. Painted sprites are the primary path everywhere.

**Readability:** 14px body on near-black with gold item names reads well, and the painted 26px icons are clear at 375px. The Got it, let's hop button is a full-width green slab well over 48px. TAP TO START at boot is small caps sitting at the extreme bottom edge, close to the home-indicator zone. The only genuinely unreadable text in either frame is the header the music chip covers.

**Music chip:** Yes. Boot: the chip sits on the cream key art top-left, a filled dark slab over painted art. Play and later: it covers the how wall's heading and first line — the heading word and the phrase grab its coin are hidden behind it, so the first sentence a player reads starts mid-clause.

**Looks broken** (confirmed on a second look, severity ugly)**:** On both the play and later frames the Music chip covers the how wall's title and opening line; the visible text begins with crosses Seattle level after level and the greyed-out words grab its coin are half behind the chip. No image 404s — capture.badRequests is empty and there are no page errors.

### Blobworks
`greenhouse-pinball` · satellite · action · first committed 2026-07-09 · impact 2/5 · effort S
`satellites/greenhouse-pinball/index.html`

**Now:** A full painted claymation pinball table fills the frame: sculpted plum-clay cabinet walls, brass pipework down the right, a lantern and jars of eyeballs down the left, teal and lime blob bumpers with modelled eyes and little crowned minions, a gold gear, and two chunky green clay flippers at the bottom. The most finished-looking screen in this batch.

**Wrong with it:**
- The score is obscured: '1371' and the 'BALL' label sit at top-left directly under the injected Music chip, which covers the bottom of the digits and the whole label, so the primary readout is unreadable.
- The HUD type is unstyled system sans over painted clay. 'Ball 2 of 3' (white), 'BONUS +500' (white) and '+1000' (grey) stack and overlap in one region at three sizes and two colours, and 'moss save!' is lowercase while everything else is caps or title case.
- The pause control is a flat dark rounded slab dropped on the painted table at top-centre, and the close-X and ladybug chips at bottom-right sit over the right return gate art; three pieces of plain UI furniture punched into a fully painted surface.

**Background now:** Fully painted. PIN_ART (DIR='art/', VER='a4') blits art/table_night_shift.png as a full-frame backdrop to canvas, with per-piece PNG blits over it and a procedural fallback only when a file is absent. 93 PNGs in satellites/greenhouse-pinball/art/, roughly 82MB of assets, raw sheets in art-drop/Pinball claymation/, wiring documented in ART_STATUS.md.

**Background wanted:** None needed. The table backdrop is painted, full-bleed and correct; the only art gap is a frame or apron treatment behind the HUD readouts.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `hud-score-plate-240x88.png` | 240x88 transparent, painted clay-and-brass score bezel with a recessed dark glass window and two rivets, sized so the digits sit inside the window | gives the score a ground of its own so the injected Music chip no longer reads as part of the readout, and stops raw text floating on clay |
| `btn-pause-clay-96x96.png` | 96x96 transparent, a sculpted clay button with two brass pause bars pressed into it, warm rim light on the top edge | replaces the flat dark rounded slab currently sitting on the painted table at top-centre |
| `popup-bonus-plate-220x64.png` | 220x64 transparent, a soft warm glow plate with feathered edges that the floating score pops draw on top of | separates 'BONUS +500' and '+1000' from the busy table behind them so they stop reading as overlapping noise |

**CSS to do:**
- Score/HUD wrapper: move the score block out of the fixed top-left corner (shift it right by about 72px, or right-align it in the top bar) so the injected chip, which picks its corner 900ms after boot, cannot land on the digits
- Pause button rule: drop the solid dark background and use the painted btn-pause-clay PNG with background:none;border:none, per the no-filled-button-slabs rule
- Score, 'Ball N of 3' and the score pops: set one display stack and a single size ladder (score 28px, ball count 15px, pops 17px) in cream #e8dcc8 and gold #c8a84b with a shared text-shadow:0 2px 6px rgba(0,0,0,.75); each string is currently styled on its own
- Table wrap: add padding-bottom:env(safe-area-inset-bottom) and raise the table bottom by about 24px so the flippers are not cut by the viewport edge
- The 'moss save!' toast: match the caps and letterspacing of the other HUD lines instead of lowercase small grey

**Emoji as art:** Almost none. Every game piece is a painted PNG; only the shell furniture is glyph-based (the close X, the ladybug feedback button, and the text pause glyph). The 25 counted emoji live in menus and the eyeball fallback string, not on the table.

**Readability:** The score is the failure, covered by the Music chip. 'moss save!' is small grey on a dark painted floor and low contrast. Everything else on the table is large and legible.

**Music chip:** The 'Music' chip at top-left covers the score digits '1371' and the 'BALL' label beneath them. The 'New song' chip at bottom-left covers the left flipper and left outlane. The close-X and ladybug pair at bottom-right sit over the right return gate art.

### Bridgevine
`bridgevine` · satellite · puzzle · first committed 2026-07-10 · impact 2/5 · effort S
`satellites/bridgevine/index.html`

**Now:** A painted grove: carved vine-wrapped pillars frame both edges, a mossy stone ledge with iron anchor plates runs across the lower third against a dusk landscape of cypress trees and distant hills, a floating moss-topped island hangs at the right, glowing blue dew pods drift in the air, and a parchment scroll with copper finials and vine tendrils carries the goal text at the bottom. Ornate metal HUD frames at the top corners. The menu is the same language: gold-carved wooden button plates on near-black.

**Wrong with it:**
- The top 45% of the play frame is a near-black void. The trellis arcs up there are so dim they read as scratches rather than structure, and the painted sky JPG behind them (four exist in assets/backgrounds/) is invisible - a painted asset is being spent on a screen area nobody can see it in.
- The ♫ Music chip sits on the left finial of the parchment scroll and eats the first letter of "endless", so the goal line reads "ndless pods, nothing snaps".
- The × and 🐞 feedback circles are two flat grey discs parked on top of the painted terrain shelf's right edge - unmotivated UI dropped on the one piece of art in that corner, with a hard edge against the moss instead of any transition.

**Background now:** Real painted art. The canvas cover-fits one of four painted JPG skies (assets/backgrounds/bg_meadow_dusk.jpg, bg_high_cirrus.jpg, bg_aurora_loft.jpg, bg_deep_night.jpg) and draws 72 PNGs on top via an art(key) loader with a cache: grove_frame.png pillars, terrain_ledge_top/body/edge and terrain_shelf_floating tiles, void_mist, pods, struts, 16 fx sprites and a full painted UI set (btn_primary, goal_banner, chip_dew, lvlcard_frame). Menu is CSS #0b0f0b with those same painted plates.

**Background wanted:** none needed - four painted skies already ship. What it needs is for the chosen sky to actually READ: bg_deep_night.jpg is so dark it is indistinguishable from #000 in the Free Play shot, so either raise its floor by 8-10% luminance or default Free Play to bg_meadow_dusk.jpg.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `bg_deep_night_v2.jpg` | same 540x960 frame as the existing sky plates, but with the black floor lifted to about 8% luminance and a faint moon-lit cloud bank across the upper third | the current deep-night plate is invisible behind the trellis, which is why the top 45% of the play screen reads as void |
| `trellis_arc_glow.png` | 540x400 transparent, the same arc geometry as the existing frame but with a warm rim highlight along the top edge of each arc, additive-blend safe | the arcs currently read as scratches; a rim pass makes the empty upper half read as ceiling structure instead of nothing |
| `haze_midground.png` | 540x220 transparent, a soft warm mist band, tileable horizontally, 20-30% alpha | there is a hard edge where the painted landscape backdrop meets the black above it; a haze band gives that seam a transition |

**CSS to do:**
- the injected music chip container - bridgevine already positions #dock at the bottom; add bottom padding or a reserved keep-out rect at bottom-left so the chip cannot land on the goal scroll. The scroll's left finial is at roughly x=30-100, y=1075-1200 at 2x.
- the × and 🐞 feedback discs - give them a dark translucent plate with a 1px gold hairline (matching .hchip) instead of a bare grey circle, so they sit in the art language rather than on top of it.
- .btn.ghost (the Wardrobe / Grove / ⚙ row on the menu) - the label is grey on brown at very low contrast and reads as disabled next to the lit rows above it; raise the label to --cream and add the same gold hairline the active rows have.
- .title-sub ("GROW THE SPAN") and the version line "Bridgevine v1.2 · 0/14 trials · best height 0" - the version line is .7rem grey on near-black, right on the floor; lift to .75rem or brighten.

**Emoji as art:** Only as small UI furniture - 19 distinct, mostly ⌂ ∞ ↺ ⚙ in the HUD chips and the 🐞 feedback button. The pods, struts, terrain, dew, anchors, banners and buttons are all painted PNGs. No emoji stands in for a game object.

**Readability:** Mostly good. The scroll's brown-on-parchment goal text is high contrast and large. Faults: the version/trials line at .7rem grey on black is at the floor, and the greyed ghost-button labels (Wardrobe / Grove) are hard to read. HUD chips are ~44px tall including their frame - marginal against the 48px rule.

**Music chip:** Yes. The chip parks bottom-left and covers the parchment scroll's left copper finial plus the first letter of "endless" in the goal line, which becomes "ndless pods, nothing snaps". Confirmed at 2x.

### Petal Slice
`petal-slice` · satellite · action · first committed 2026-07-09 · impact 2/5 · effort S
`satellites/petal-slice/index.html`

**Now:** A genuinely painted scene. A full-bleed autumn arch fills the frame: a wrought-iron lantern glowing warm on the left, maple and copper leaves garlanding the whole border, terracotta pots of dried flowers on both sides, a pumpkin bottom-left and a lit wooden porch floor across the bottom, with a dark oval of night forest in the middle as the play space. Objects thrown into it are painted too - a green seed pod with a leaf seam and a stem nub, a blue berry with a dark calyx star and water beads. The palette is deep near-black, copper, gold and rose, exactly house style, and the lantern gives the frame real warm rim light.

**Wrong with it:**
- The injected '♫ Music' chip sits on the score. The canvas draws the score at (18,46) and the mode label 'ZEN GARDEN' at (20,62) (lines 458-459) and the chip's box covers both - in the hi-res crop I can read a ghost '0' and a ghost 'ZEN GARDEN' behind the chip's dark panel. The player cannot see their own score.
- Three of the object sprites share one silhouette: pod_green, berry_blue and burr are all the same fat circle at roughly 170-215px, and both the pod and the berry carry a hard white specular ellipse that reads as a glossy bouncy ball rather than a seed pod. In flight the player is cutting marbles.
- The composition is bottom-heavy dead space. The painted porch floor takes the bottom ~18% of the frame and nothing is ever thrown into it; all the action happens in the dark oval, so the best-painted parts of the backdrop - lantern, pumpkin, pots - sit permanently outside the play space with no relationship to it.
- No slice trail, splat or blade mark is visible in either play frame even though assets/fx holds trail_rose, trail_vine, trail_aurora, six splat_*.png and blade_tip_bud - the frame is beautiful and completely static-looking.

**Background now:** Painted, and per-season: assets/bg/bg_autumn.jpg is what these frames show, with bg_spring / bg_summer / bg_winter alongside it. 106 asset files, 5.4MB, covering bg, objects (24 painted pods/berries/blossoms plus pre-cut halves), fx (30 trails, splats, grafts, motes) and cosmetics (10 blade skins, 5 pod sets, 4 backgrounds).

**Background wanted:** None needed - it is already the strongest background in this batch. What it wants is a foreground layer split off the same painting so pods can fall behind the porch rail and the pots, giving the frame depth instead of a flat wallpaper the action floats in front of.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `fg-porch-autumn-540x180.png` | 540x180 transparent PNG, the porch boards and the near leaf litter cut out of bg_autumn.jpg as a separate foreground plate, soft focus, drawn after the objects | pods currently vanish at the bottom edge with nothing in front of them; a foreground plate lets them fall behind the porch and turns the dead lower 18% into depth |
| `pod_long_140x230.png` | 140x230 transparent PNG, an elongated milkweed-style seed pod, split seam down the long axis, matt sage skin with a soft broad highlight instead of a hard specular ellipse | breaks the three-way silhouette tie between pod_green, berry_blue and burr, so the player can read what is coming by outline alone |
| `blossom_star_223x199_v2.png` | 223x199 transparent PNG, a spikier six-point star blossom with visible stamens, rose and cream, to replace or sit beside blossom_pink | the current blossom is the only non-circle in the set; a second distinct outline gives the object bank three readable shapes rather than one |
| `hud_plate_score_200x86.png` | 200x86 transparent PNG, painted brass-and-leaf score plate with a dark centre, 9-sliceable | the score is currently bare cream numerals sitting straight on a busy painted backdrop with no ground under them - it needs a plate wherever it moves to |

**CSS to do:**
- Canvas HUD, lines 458-459: move ctx.fillText(''+G.score, 18, 46) and the mode label at (20,62) out of the top-left. The injected chip owns viewport 12..109 x 10..58, which is stage 17..157 x 14..84 at the 0.694 scale - dead centre of both. Draw the score centred at VW/2 with textAlign 'center', or left-aligned at x:170.
- Line 459: ctx.font='700 12px system-ui' for the mode label = 8.3 rendered px at 375 wide. Raise to 18px.
- Line 453 score floats: ctx.fillStyle='#f5ebd0' with no shadow over a busy painted backdrop - add ctx.shadowColor='rgba(0,0,0,0.7)'; ctx.shadowBlur=6 so the numbers survive the leaf clutter.
- Line 463: the petal life counter is literal 🌸/🥀 emoji at 22px on a fully painted screen - swap for the existing objects/blossom_pink.png at 26px and a desaturated copy for spent petals.
- #stage (line 39): background:#0b0f0b is fine, but add a 1px inner border-glow so the scaled stage does not butt against the letterbox with a hard edge on tall phones.

**Emoji as art:** 🌸 and 🥀 drawn on canvas at line 463 as the three-petal life counter, on a screen where every other object is painted - the one place emoji stands in for art. Plus 🍃 on the Free Play menu button and 17 distinct emoji across menu/copy.

**Readability:** The mode label at 12 stage px = 8.3 rendered px, under the floor. The score itself is 30px = 21 rendered px and fine except that the chip covers it. Body copy in the boot blurb is cream on a painted backdrop with no scrim, so the line 'Swipe to slice the tossed seed pods and blossoms in one stroke' crosses a bright leaf cluster and loses contrast mid-sentence.

**Music chip:** Yes. The chip covers the canvas-drawn score (18,46) and the mode label 'ZEN GARDEN' (20,62) at the top-left of the playfield - both are readable only as ghosts behind it in the 2x crop.

### Puppy Dash
`puppy-dash` · satellite · action · first committed 2026-08-23 · **workbench-gated** · impact 2/5 · effort S
`satellites/puppy-dash/index.html`

**Now:** A fully painted scene: blue sky with soft clouds, a painted treeline and white picket fence, and a tarmac road with a dashed centre line running to the horizon. Five painted animal portraits (puppy, kitten, bunny, fox, raccoon) sit on cream rounded cards over it, above an orange pill CTA.

**Wrong with it:**
- The painted wordmark is cropped by the top of the 667px viewport. Only 'DASH' survives and even its letter tops are cut; 'PUPPY' is entirely off-screen. #wordmark is width:min(330px,84%) with height:auto and no max-height, so on a short phone the lockup overflows the fold.
- Three dark floating pills crowd the top band all at once: the '♫ Music' chip on the wordmark's left edge, the feedback '×' and the ladybug fab on the sky at top-right, over the wordmark's speed lines. None of them has a plate or a shared alignment; they read as debris dropped on the art.
- The five .pick cards are flat cream slabs (background:var(--cream), index.html:45) sitting on top of painted art, which is exactly the studio's no-filled-button-slabs case. They also orphan: five cards in a 2-column grid leaves an empty hole bottom-right where a sixth would go.
- On boot the music-unlock drawer covers the bottom half of the picker, hiding the Raccoon card and the entire 'Let's go!' CTA.

**Background now:** Painted, layered and composited in canvas from art/environment/: sky.jpg, treeline.webp, fence.webp and road.jpg. 165 art files total including full per-character sprite sheets (run/jump/slide/land/bank/caught with .json frame maps) for all five runners, plus painted obstacles and pickups.

**Background wanted:** None needed. The environment is already painted and reads correctly. The work here is the menu-over-art treatment and the top-band crowding, not a new background.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `art/ui/card-plate-160x180.png` | 160x180 transparent PNG, painted cream-and-tan card plate with a soft brushed edge, subtle inner warmth, top-left light | Replaces the flat CSS cream slab on .pick so the runner cards sit in the painted world instead of on top of it. |
| `art/ui/wordmark-compact-330x110.webp` | 330x110, the PUPPY DASH lockup stacked to two short lines or set at a lower cap height, transparent | The current wordmark overflows a 667px viewport so half the game's name is never seen on a phone. |
| `art/ui/chip-plate-140x48.png` | 140x48 transparent PNG, a small painted wooden/tan pill with a soft drop shadow | Gives the injected Music and New song chips somewhere to land so they stop floating on sky and on the CTA. |

**CSS to do:**
- #wordmark (index.html:40) — add max-height:74px and give the picker screen padding-top:8px so the full lockup fits above the fold at 375x667.
- .pick (index.html:45) — replace background:var(--cream) with the painted plate, or as an interim background:rgba(248,240,224,.88) plus backdrop-filter:blur(2px) and a 2px solid rgba(120,80,40,.5) border, so the cards stop reading as UI rectangles pasted over art.
- .grid (index.html:44) — the fifth card orphans in a 2-column grid; give .pick:last-child{grid-column:1/-1;max-width:152px;margin:0 auto} so the picker resolves symmetrically.
- .btn (index.html:49, the 'Let's go!' pill) — add position:relative;z-index:5 and margin-left:96px on the picker screen so the injected '♫ New song' chip cannot sit on its left cap.

**Music chip:** Yes, twice. The '♫ Music' chip covers the left edge of the painted wordmark (art/ui/wordmark.webp) at top-left. The '♫ New song' chip overlaps the left rounded cap of the orange 'Let's go!' button at the bottom, cutting into the start of the label. On boot the full music-unlock drawer also covers the Raccoon card and the CTA entirely.

### Pop N Lock
`chaff-wars` · satellite · puzzle · first committed 2026-07-19 · impact 2/5 · effort S
`satellites/chaff-wars/index.html`

**Now:** Boot is a painted brick alley covered in real graffiti under a chunky painted POP N LOCK bubble-letter logo, with spray cans and a cassette as foreground props baked into the wall image. The play frame landed on the campaign ladder: fourteen rows over that same lit wall, thirteen of them locked.

**Wrong with it:**
- The ladder rows are ghosts. `.foe.locked{opacity:.42}` fades thirteen of fourteen rows to 42%, so the hot cyan and magenta of the wall reads straight through the row bodies AND through the '??? Locked / Beat the pest before to unlock.' text. The whole list looks like it is dissolving rather than locked.
- On boot the music unlock sheet lands across the bottom third and covers the 'Campaign - 0/14 beaten' button, which is the only thing a first-time player wants to press.
- The 'SKY WOLF STUDIO' line under the logo is grey on hot magenta at near-zero contrast. It reads as a smudge on the wall, not as a brand mark.
- The spray cans and cassette are painted into menu-wall.jpg at fixed positions, so on the scrolled ladder they sit underneath rows 12 through 14 and tangle with the lock icons instead of sitting in a motivated group.

**Background now:** Painted. `assets/bg/menu-wall.jpg` behind every menu screen under a three-stop scrim (rgba(13,11,8,.62) / .30 / .78), `assets/bg/battle-alley.jpg` on the play stage, and a blurred saturated-down copy of battle-alley on `#wrap::before` for the letterbox surround.

**Background wanted:** None needed. Both backgrounds are painted, on-voice and already wired with a versioned URL. What it wants is a heavier scrim on the select screen only, not a new image.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `assets/ui/lock-plate.png` | 104x104 transparent PNG (renders at 52px in `.fem`), a painted padlock on a boarded plank in the game's spray-paint palette | Replaces the bare emoji in thirteen of fourteen ladder rows, which is the only place emoji stand in for art in an otherwise fully painted game. |
| `assets/logo/studio-wordmark.png` | 480x48 transparent PNG, 'SKY WOLF STUDIO' as a stencilled spray tag with a dark drop shadow | Replaces the unreadable grey text under the logo so the studio credit survives the neon wall behind it. |

**CSS to do:**
- `.foe.locked` (index.html:185) - drop `opacity:.42` and dim with `filter:grayscale(.65) brightness(.68)` instead, so the row keeps its opaque `#171308` ground and the 12px `.fds` text stays legible over the wall.
- `#s-select.screen` - deepen the middle stop of the scrim from `rgba(13,11,8,0.30) 44%` to about `0.62`, so the wall's lit centre stops fighting the ladder.
- The studio credit under `.pnl-logo` - give it `color:var(--cream); opacity:.8; text-shadow:0 2px 0 #0c0a06` instead of the current near-transparent grey.

**Emoji as art:** The padlock in every locked ladder row (13 of 14 visible rows), plus `st.em` layered on top of the character PNG inside `.fem`. Everywhere else the art is painted PNG/JPG - 93 asset files, 44 character sheets.

**Readability:** `.foe .fds` is 12px, fine on its own, but at opacity .42 over the neon wall it is effectively unreadable in the shot. The 'SKY WOLF STUDIO' credit is at near-zero contrast. Row min-height is 72px, so touch targets pass.

**Music chip:** Not the chip - the music UNLOCK SHEET. On boot it covers the bottom third of the screen including the 'Campaign - 0/14 beaten' primary button, so the first thing a player sees is a half-hidden call to action.

### Sixfold
`sixfold` · satellite · card · first committed 2026-08-18 · impact 2/5 · effort S
`satellites/sixfold/index.html`

**Now:** A real painted photo background (blurred, warm red patch lower-left) under a stack of translucent washi cards, set in a custom serif with an inked kanji tier seal, gold accents and cream rules. Boot is a HOW TO DUEL wall with icon-boxed rules over the same blurred art. It is the most deliberately typeset thing in this batch.

**Wrong with it:**
- The RANKED DUEL modal's Close button is a raw browser default: grey system slab, 13px label, roughly 24px tall. .close is styled only as '.ascent .close' (446), '.collection .close' (472), '.profile .close' (485) and '.daily .close' (503). There is no '.duel .close', so the button written at line 4113 inherits nothing at all.
- The gold primary CTA reads 'Find a rival X'. The crossed-swords glyph at line 4121 has no variation selector, so it falls back to text presentation and renders as a thin monochrome cross that looks like a dismiss button sitting on the one control you want tapped.
- The blurred background does nothing for the modal. It is a warm red smear lower-left and grey elsewhere, with no scrim behind the card stack, so the #ffffff0e tier card floats over mud and its rectangular top edge is a hard line against the photo.
- .ll-note (543) and .ladderlist .ll-h (538) are 10px and .rankmeta (517) is 11px, all under the 0.7rem floor and all set in muted grey over a blurred photo.

**Background now:** A real image background: 16 painted/photographic jpgs in satellites/sixfold/backgrounds/ (dojo, darkdojo, torii, bamboo, cherry, maple, graveyard, palace, coast, cloudsea, frozen, ash, bloodmtn, market, sunset, village), blurred behind a .tscrim and .tvig pair, plus an SVG fractal-noise grain layer at line 71. Fighters are a 71-file sprite-atlas set in skins/.

**Background wanted:** none needed - the painted backgrounds already exist and are good. What is missing is a scrim: the duel modal needs a dark vertical gradient of its own so the card stack lands on a deliberate ground rather than straight on blurred photography.

**Art to paint:**

| file | spec | replaces |
|---|---|---|
| `rank-seals-576x96.png` | 576x96 atlas, six 96x96 transparent painted tier seals (Iron, Bronze, Silver, Gold, Jade, Onyx): an inked kanji on a stamped washi disc with a warm rim light and a torn paper edge | replaces the bare text glyph in the tier badge span, which currently renders as a plain system-font kanji next to painted art |
| `duel-scrim-375x667.png` | 375x667 transparent PNG: black-to-transparent vertical gradient with a soft vignette baked in, about 70% opacity through the centre band | gives the RANKED DUEL card stack a ground so its translucent panels stop meeting the blurred photo through a hard rectangular edge |

**CSS to do:**
- Add '.duel .close' to the selector list on the .close rule at line 446 (or add a matching block), and set min-height:48px - the RANKED DUEL Close button is currently an unstyled browser default at about 24px tall
- .ll-note line 543: font-size 10px to 12px
- .ladderlist .ll-h line 538: font-size 10px to 12px
- .rankmeta line 517: font-size 11px to 12px
- Line 4121: change 'Find a rival' + crossed-swords to the emoji-presentation form (add U+FE0F) or drop the glyph entirely, so the primary CTA stops reading as a close button
- .hero.duel: add background:linear-gradient(180deg,#0b0d12 0%,#0b0d12cc 60%,#0b0d1200 100%) behind the card stack so the modal meets the blurred photo through a transition

**Emoji as art:** UI only: calendar on the Daily button, crossed-swords on the primary CTA (misrendering as a bare cross), fire in the streak row, sun in the header. The fighters themselves are real painted sprite atlases (71 PNGs in skins/), not emoji.

**Readability:** .ll-note 10px, .ll-h 10px, .rankmeta 11px are all under the 0.7rem floor and set in muted grey over blurred photography. The unstyled duel Close button is roughly 24px tall, half the 48px touch floor. The italic note under the RANKED DUEL header is 10px grey and sits over the warm red patch of the background photo, which is where it is least readable.
