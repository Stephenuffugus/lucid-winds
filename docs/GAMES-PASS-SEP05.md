# GAMES PASS, Sep 05 2026 (second terminal)

Stephen's phone checklist. One row per game, kept current as the work lands. Live URLs are
`https://lucidwinds.com/satellites/<slug>/` and `https://lucidwinds.com/play/<file>.html`.
"Live" in a row means on main AND proved by a curl with a marker only the new build has.

## Where Litter Bug edits live (decided Sep 05, 13:50Z)

`satellites/litter-bug/VENDORED.json` says the folder is a vendored copy of `Stephenuffugus/Litter_Bug`
at 3c949a5. `--check` reported EDITED: six files had drifted after the vendor commit (the arcade's em
dash sweep in 336faf0b and the SEO meta lines in f6de49a4), all small. The vendor script has not been
abandoned (c783228b re-vendored on Sep 01), and a push to upstream from this box works. So the
documented path holds: the six drifted files were ported upstream first (Litter_Bug c3f2de2), every
edit in this pass goes to `/workspaces/Litter_Bug`, its own `check.js` runs there, then
`node scripts/vendor_satellites.mjs --vendor litter-bug` brings it here byte for byte. The satellite
copy is never hand edited.

## The ledger

| game | what changed | what is still wrong | shot | live url |
|---|---|---|---|---|
| Litter Bug | the four trials are places now (a sorting chute, the inside of a dumpster, a wall with a live junction box, a shelf with a tin lid to lever), the alley is drawn (brick, dumpster with the lid up and a cat on it, chain fence, fire escape, lamp, puddle, junk), the scrim is down so it shows behind every screen and under the letterbox bands, the locked dumpster is a closed dumpster with a padlock and a WORK THE ALLEY door, wire round one can no longer spawn solved, pins clamp to the field and crossing cables glow red with a count, grub hunt targets are 58 px rendered (were 36), the picker shows an icon and your best per block, ghost seats in the champion strip | the bug parts are still generated ellipses, not painted (the brief called the 24 PNGs "painted", they are flat silhouettes from gen scripts and the live renderer never used them); the trials cap at 40 in about 20 s for a fast thumb, so the 60 s clock is mostly decoration for a good player; the arena has a 300 px gap between the log and the move cards; a second day is still the same four blocks and five challengers | `docs/games-pass-sep05/lb-*.png` | https://lucidwinds.com/satellites/litter-bug/ |
| The Attic | the room is lifted out of the mud (rafters, window, beam, bulb, crates and chair about eighteen points up, held back by one 0.34 scrim); the dust lets the object through (grime 0.62 + 0.42 off the swipe, was 0.79 x 0.79 = 0.956) so a dusty find is a thing under dust, not a failed image; the handheld prints its title in ink chosen against its shell (a 1990s pale shell had white on grey); the hash and date lines go from #6f6350 (2.2:1) to #9a8a6e; the WIPE button tracking .24em to .1em so it stays one line at 375; motes 4 px at 0.45; the shared music chip is asked to reseat after every card, sheet and the rules | the ♫ chip still parks on the left edge of the art box on the card (it scores the SVG as free space; that is music-unlocks.js, not mine); the DUST OFF panel is a faucet: one raster of 24 swipes cleared 92% and found all 10 stubs with 83 s left (the AUDIT-NOTES claim of "forty seconds of committed dragging" does not hold), a design call; at 412 the topbar wraps to two rows once the shelf count is two digits; the object renderers still have a fixed number of layouts per class, so the pictures repeat before the names do | `docs/games-pass-sep05/attic-*.png` | https://lucidwinds.com/satellites/attic/ |
| Master Pollinator | the seat name field was 18 px wide at 320 and clipped "Computer" at 375 and 412; the three seat buttons now travel as one unit and drop to a second line when the field would starve (measured: the field is 282/245/190 px at 412/375/320 and "Computer" fits at all three), 0.9rem, setup rows 6px, a sage meadow glow at the foot of the setup modal | the cost pips already sit in a cream bar at the card foot, not over the bloom (the audit's shot predates that); a painted meadow plate is the art lane; card PNGs are still 1.8 MB each (a re-export job, not CSS) | `docs/games-pass-sep05/lt13-pollen-*.png` | https://lucidwinds.com/play/pollen.html |
| 15 Puzzle | tiles vary in brightness by value, the empty square is a recessed socket, Undo dashed when dead | the socket is near black and could carry a little moss; the tile face is still a gradient (painted tile is the art lane) | `docs/games-pass-sep05/lt13-slider-*.png` | https://lucidwinds.com/play/slider.html |
| Root Rush | birch, grey bark and dark peat blocks among the browns, irregular grain, board shadow into the page, Next legible when dead, exit gate 16px | the "Move A up" hint prints into the shell's status line (fleet chrome, not the game); the sprout is still an emoji (JOB 8) | `docs/games-pass-sep05/lt13-rootrush-*.png` | https://lucidwinds.com/play/rootrush.html |
| Pyramid | covered cards keep their edges (dimmed by tone, not opacity), waste slot has a gold hairline inset, STYLE 0.75rem | no table under the cards (felt plate is the art lane); the white faces are the painted deck's | `docs/games-pass-sep05/lt13-pyramid-*.png` | https://lucidwinds.com/play/pyramid.html |
| Farkle | tray caption in the panel's serif, warmer hint, real pre roll pips, panel feathers into the page, pan `min(100vw - 16px,560px)` | the saloon brown palette is deliberate and off the house sage; a Director call, left | `docs/games-pass-sep05/lt13-farkle-*.png` | https://lucidwinds.com/play/farkle.html |
| Flood Fill | the grid on a framed plate, unselected packs stepped back, labels cream, sage up and slate down so the 17 wide board separates, the three fill styles preview themselves | fire, palette and calendar emoji on the controls (JOB 8) | `docs/games-pass-sep05/lt13-flood-*.png` | https://lucidwinds.com/play/flood.html |
| Five in a Row | drawn wood grain and two knots on the goban, a stepped lip, stats header band, HINT gold, dead UNDO/REDO dashed | painted goban and stones are the art lane; the grain is uniform (26 strokes) and a painter would beat it | `docs/games-pass-sep05/lt13-vinecross-*.png` | https://lucidwinds.com/play/vinecross.html |
| Garden Spades | green felt instead of blue, panel feathers into the page, trick well 120px with a soft gold centre, every badge 0.7rem, team colour sage | "YOUR TEAM" wraps to two lines in its half width card at 412 now that it is 0.7rem; the partner fan still squeezes 13 backs into slivers | `docs/games-pass-sep05/lt13-gardenspades-*.png` | https://lucidwinds.com/play/gardenspades.html |
| Music Studio | lane head rows scroll sideways with a fade instead of being sliced, octave arrows and instrument select 48px, select up to 150px wide, section strip scrolls, iframe ground matches the studio | the vibe picker still opens over the studio on every boot; the lane labels carry "Oct N" in the name | `docs/games-pass-sep05/lt14-song-*.png` | https://lucidwinds.com/play/song.html |
| Sokoban | floor under the cat and the pot, the grid on a plate with an edge, the fleet win scrim opaque (every native) | the win screen's own buttons are the fleet's; a board frame image is the art lane | `docs/games-pass-sep05/lt14-sokoban-*.png` | https://lucidwinds.com/play/sokoban.html |
| Chess | Move strip in serif between gold hairlines, board casts a shadow and fades into the ground, legal move dots and capture rings read on wood | piece PNGs have no alpha, so no drop shadow until they are re-cut | `docs/games-pass-sep05/lt14-chess-*.png` | https://lucidwinds.com/play/chess.html |
| Echo | tiles .85 not muddy, flash no longer blows to white, season label at the floor | the board plus the pills still push the header off at 667 (capping the board is a design call) | `docs/games-pass-sep05/lt14-simon-*.png` | https://lucidwinds.com/play/simon.html |
| Euchre | passed, Dealer, Strong and the two prompts off the floor, the trick well an inlay | numeric cards still differ only by one corner index (shared deck) | `docs/games-pass-sep05/lt14-bowergarden-*.png` | https://lucidwinds.com/play/bowergarden.html |
| Petal Match | build tag off the wallet, PETALS legible on the painting | locked pill art, above the fold HUD (design), the shelf's grey wash on unaffordable powerups | `docs/games-pass-sep05/lt14-petalmatch-*.png` | https://lucidwinds.com/play/petalmatch.html |

## Litter Bug, played at 412x915 with real touch taps (pass 1, before any change)

Every tap went through `page.touchscreen.tap` at the element's centre after `elementFromPoint`
confirmed the element was on top. Driver: `scratchpad/lbplay.mjs` (kept with the shots).

**Walls found (a place a player stops, or a thing that lies):**
1. Wire Untangle round one spawns ALREADY SOLVED 32% of the time (300 spawns measured per level). The
   "reseat until knotted" swap exchanges pins 0 and 2, which in a four pin cycle with one chord is the
   same picture. Nothing happens until you drag a pin and let go. A player sees a finished board and
   no reason to touch it.
2. Grub Hunt tap targets are 36 to 40 RENDERED px (44 CSS px at the 0.763 stage scale on a 412 phone).
   Under the 48 floor on every phone.
3. Grub Hunt is a colour hunt that the eye solves instantly: round 8 (tint 0.82) the grub still reads
   green on a grey tile. The driver cleared 64 rounds in 60 s. The shift cap of 40 lands at round 20.
4. The Dumpster, before your first bug: one sentence, an empty green outlined pill (the champbar with
   nothing in it), then 500 px of nothing and a Back button. It tells you what you need and gives you
   no way to go and get it.
5. The trials are a bare dark box: Sort is one 66 px tile falling through 1000 px of empty field with
   three outlined rectangles for bins; Grub Hunt is grey glyphs on grey tiles; Wire is dots and lines
   on black. None is a place.
6. The 540x960 stage on a 412x915 phone leaves a 90 px black band top and bottom on every screen; the
   backdrop is inside the stage, so the bands are dead.

**What is fine:** boot, how to play, block picker, shift over, the shinies clock, the daily cap.


## Litter Bug, what was built (upstream Litter_Bug, then vendored)

Played again after the rebuild with the same driver, every screen shot and opened. What the shots
showed and what was done about it:

- **Home**: the alley card was nine flat rectangles and a triangle. It is a drawn alley now. Three
  things still wrong in the frame: the champion bug is big for the scene and stands on the fence
  line; the rooftop strip has two lit specks that read as noise; the 90 px letterbox bands above and
  below the stage now carry the blurred alley but only faintly.
- **Block picker**: an icon of each place plus BEST on that block (persisted, `SAVE.bests`). Wrong:
  "NOT YET WORKED" is heavy at 12 px tracking; the icons are dark against the dark plate.
- **Sort the Recycling**: a steel chute out of a hopper stencilled RECYCLING, brick either side,
  a lamp glow, three drawn bins. The piece is 92 px with a 66 px silhouette and a 12 px label (was
  66 px and 8.5 px). Wrong: the lane is 1100 px tall for one piece at a time, so most of the belt
  is empty; the piece spawns over the hopper stencil.
- **Grub Hunt**: the inside of a dumpster, rim, lamp light, two heap mounds, a crate and a tyre; the
  junk lies on the heap with cast shadows in four heap tones so the grub cannot be found by
  "the odd colour"; its antennae twitch every 2.6 s. Targets 68 CSS px = 52 real px at 412 (the
  driver measured 58 to 61). Wrong: round 8 (tint 0.82) is still findable at a glance by tone;
  the crate is a flat brown box; the light band is uniform.
- **Wire Untangle**: brick wall, a junction box with a hazard stripe and LIVE, conduit, cable clips;
  each cable its own colour with a dark sheath and a highlight; crossing cables carry a red halo
  and a chip counts them ("1 CROSSING", "CLEAN, LET GO"); sockets instead of dots; pins clamp to
  the field; round one reseats until knotted (was 32% pre solved). Wrong: the count chip sits on
  brick beside the junction box and could live on it.
- **Pry the Lids**: a tin lid seen from above on a brick wall with a lamp, the seam a gold arc on the
  rim, the marker a pry bar riding the rim, every lid levered off becomes an open jar on the plank
  below. Wrong: the first cut had the lid in the top third with 600 px of wall under it (recentred
  in the same batch, lid 340 px); the jar row caps at 11 and prints +N after that.
- **The Dumpster, locked**: a closed dumpster with a padlock and BUGS ONLY, the sentence in cream,
  a second line that says what thirty Shinies is, and WORK THE ALLEY. Wrong: the SVG's lamp glow
  clipped to a hard rectangle in the first cut (softened, same batch).
- **Backdrop**: `#bg-scrim` .55/.68/.80 (was .86/.94/.985), `#bg-far` blur 14 px (was 34), plus a
  third copy on `#wrap` behind the stage so the letterbox is not dead black.

**A bug the rebuild introduced and the play-through caught**: the alley's gradient id prefix "b"
made a gradient named `b-dump`, and `document.getElementById('b-dump')` returned the gradient, so
THE DUMPSTER button vanished from HOME. Prefixes are `alleyA/B/W` now. The dex gate's duplicate id
check would not have caught it (the ids were not duplicated, one was shadowed).

**Depth for a second session, built**: per block bests on the picker and on the shift over screen
("a new best on this block, up from 31"). **Not built**: a rotating featured block, a weekly
crown ladder, anything that makes day two differ from day one beyond five new challengers. Those
are design calls.

**Art the code cannot make** (DETAIL table format, for the image lane):

| file | spec | replaces |
|---|---|---|
| `bg-alley-540x960.jpg` | 540x960 painted night alley in the palette the drawn one now sets: brick, the green dumpster with the lid up, chain fence right, one sodium lamp top right, wet ground | the drawn SVG alley behind every screen; the drawing is honest but flat |
| `heap-plate-494x860.jpg` | 494x860 painted dumpster interior for Grub Hunt: steel walls with rust, a mound of bags and boxes, lamp light from the rim | `heapScene()`, the two flat mounds and the crate |
| `lid-320x320.png` | 320x320 transparent painted tin lid seen from above, rim and seam groove, a printed label "ALLEY PRESERVES" | `lidSVG()`, the radial gradient lid |
| `bug-parts` (out of scope here) | the real ask: painted heads, bodies, wings, patterns for the bug renderer; the eight per bank on disk are generated ellipses and trapezoids and the live renderer does not use them | nothing today, the bugs are procedural cel shaded and read fine; this is an upgrade, not a fix |

**Measured**: 412x915 in every trial (driver), 375x667 and 320x568 on home, picker, a trial and the
dumpster (shots in the folder), `overflow.mjs` at 412/375/320 on the vendored page (rows below once
the vendor lands). `check.js` upstream: 84 ok, 0 fail (83 plus the new door assertion, which was watched red against the shadowed id mutant). Live since 24420f3c on main, proved with `?probe=` and the `alleyA` marker.

## The Attic, played at 412x915 with real touch taps

Driver: `scratchpad/atticplay.mjs`. Walk: rules, START DIGGING, RUMMAGE, WIPE OFF THE DUST, THE SHELF,
the find card front and back, WANT LIST, DUST OFF with a real touch drag, RUMMAGE to zero tickets, a
dig at zero, TODAY'S FIND, then a reload with the clock a day on. Zero page errors, zero blocked taps
once the driver picked the reachable CLOSE (the shelf's CLOSE sits under the find card's sheet and a
DOM-order driver hit it first; a thumb would not).

**Walls found: none that stop a player.** Everything answers. What the audit called out was true:
- the pre wipe card read as a load failure (grime compounded to 0.956 over the object), fixed;
- the room read as three smudges, fixed by lifting the SVG tones and adding one scrim;
- the hash line was 2.2:1, fixed;
- the WIPE button wrapped at 375 (one line at 412, measured with a Range: 1 line, 52 px), fixed.

**Depth, measured.** Title uniqueness over 1000 pulls per class (node, `ATTIC.hashToItem` on random
hashes, 2026-09-05):

| class | unique titles in 1000 pulls |
|---|---|
| RECORD | 850 (85.0%) |
| VHS | 761 (76.1%) |
| TOY | 870 (87.0%) |
| GAME | 887 (88.7%) |
| CEREAL | 946 (94.6%) |
| COMIC | 745 (74.5%) |
| PAPERBACK | 877 (87.7%) |
| ZINE | 938 (93.8%) |
| HANDHELD | 892 (89.2%) |
| LUNCHBOX | 923 (92.3%) |

The Aug audit measured 19.42% exact duplicate OBJECTS over 40,000 pulls before the grammar rewrite.
Titles now repeat between 5% (cereal) and 25% (comic) of the time within a thousand pulls of one
class; a player who digs five a day sees a class about 180 times a year, so a repeated title is
rare in play. COMIC and VHS are the thin banks if anyone widens one.

**Not built** (design calls): a second earner that is actually a game (DUST OFF as it stands pays
out to anyone who drags), a reason to open the shelf beyond looking, and the launch name and classes
Stephen still owes (`design-briefs/flagship-attic.md`).

**Art the code cannot make**: the DETAIL row's four files stand (`bg-attic-540x960.png`,
`dust-veil-300x300.png`, `shelf-plank-540x120.png`, `ticket-64x64.png`). The drawn room and the
drawn dust are now good enough to ship; the plate and the veil would be upgrades.

## Sep 05, later: the art lists and the bug coherence pass

- **Art lists**: one `ART_ASSETS.md` in every game folder (183 games, 745 files), index at
  `ART-ASSETS-INDEX.md`. Natives under `assets/games/<id>/`, satellites in their folder, vendored ones and
  Flock the World under `docs/art-lists/<slug>/`.
- **Litter Bug renderer**: the flower renderer's tricks carried over (painted offset shadows under legs and
  wings, a catch light per segment, coxa sockets, legs dimmed under wings). Sheet:
  `lb-bug-coherence-sheet.png` (the 84px "after" cells in that sheet are dark because two engines shared one
  page and their gradient ids collided; `lb-bug-84px-after.png` is the honest 84px render). Upstream
  Litter_Bug, re-vendored. The bigger look change still waits on the painted places and the style hero in
  `satellites/litter-bug/ART_ASSETS.md`.

### Litter Bug loop pass (Sep 05, later)

Forty Shinies ends a shift now instead of leaving twenty dead seconds on the clock: the done screen says CLEAN SHIFT with the time, the picker keeps the fastest clean per block, one block is featured each day and a clean shift there stamps a seven day strip. Bugdex has a families row. Shots: `lb-loop-picker.png`, `lb-loop-clean-shift.png`, `lb-loop-dex-families.png`, `lb-loop-picker-day2.png`. Driver `lbloop.mjs`. Grub cleaned in 21.5 s with real taps; sort ran the clock out at 35, so sort is the block a clean shift has to be earned on.

### The Attic condition pass (Sep 05, later)

Every grade now says where its wear came from, one line under the plate after the wipe (a bank per grade in the engine, `revealStory`), the class flaw sits in the same block, the ledger gets a WEAR row and the shared PNG prints the line above the plate. The workout VHS cover stripes were bleeding past the cassette on shared cards; the cover art is clipped now. Shots: `attic-wear-find.png`, `attic-wear-ledger.png`, `attic-wear-card.png`.

### Litter Bug identity pass (Sep 05, later)

Every bug's lore now ends on a line about a part it actually has, the specimen card and the PNG name its family, and the Bugdex has family chips that filter the grid. The bigger find: a new mint is drawn at growth 0.36 and most scored parts grow in between level 4 and 17, so a LEGENDARY minted as a plain grub with nine chips it did not show. The chips for parts not grown in are dashed now, the mint screen says how many are still to come and which is next at what level, and the ledger has a GROWN row. Shots: `lb-identity-mint.png`, `lb-identity-dex.png`, `lb-identity-spec-front.png`, `lb-identity-spec-back.png`, `lb-identity-card.png`. Driver `lbident.mjs`.

### The Attic era pass (Sep 05, later)

A 1953 lunchbox and a 1998 zine used to wear the same cream $4.99 oval. Now each era has its own sticker (paper cent dot, trading stamp, price gun label, neon shop tag, clearance barcode) and its own title voice (script, bubble, slab, chrome, grunge) on every class but records. Sheet: `attic-era-sheet.png` (`erasheet.mjs`).

### Litter Bug sound pass (Sep 05, later)

A synth in the page, no files: sixteen cues on the real paths (belt, bins, grub, lid, wire, clean shift, shift over, the week stamp, the jar, hits and crits, win and lose) and a SOUND pill on the home screen that remembers. Every cue is bounced offline in the gate and has to move air. Nobody has heard it yet; that is Stephen's phone. Shot: `lb-sound-home.png`.

### The Attic sound pass (Sep 05, later)

A synth in the page in the attic's voice: rummage rustle, the wipe, a plate sting that climbs with the grade and a fanfare for FACTORY SEALED, dust and stubs, scrap, the want list bell, the card snap, and a SOUND chip in the header. Every cue is bounced offline in the gate and has to move air. Unheard by a human. Shot: `attic-sound-head.png`.

### Litter Bug vocabulary 2 (Sep 05, later)

Segment shapes (teardrop scales, flat, ringed), an oil slick sweep, wing tints and a second leg pair on the thorax, all cosmetic, every grade unmoved over 3000 bugs. Sheet: `lb-vocab2-sheet.png`.

### The Attic shelf pass (Sep 05, later)

The shelf is a room: boards on the wall, one plank under every row with the finds standing on it, labels under the board, a glass case around a factory sealed find. On the way the gate found that SCRAP did not survive a reload (the union merge kept the disk copy, ticket paid; scrap, reload, scrap again). Fixed with a week long tombstone per scrapped hash. Shots: `attic-shelf-room.png`, `attic-shelf-room-320.png`. ⚠️ The music chip from the shell covers THE SHELF title on this sheet; that is music-unlocks.js, outside this terminal's fence.
