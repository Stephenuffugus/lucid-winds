# SUNFORGE v3, THE SKINS (8 Nov 2026; Fable, alone, from Stephen's ask of 8 Nov)

Stephen, 8 Nov ("doll" is speech to text for "dull"): "did we do different colors and patterns for sunforge? It'd be
really easy to have a ton of diversity in blocks for the different rings. The one we're using it's just a little doll.
I think it should be an unlockable skin and I want something that's just bright and I also want like a clay one. I want
a painted one I want. You know we can make the different rings different, so let's come up some different skins for
this and themes like the one that starts with doesn't match the original or the home screen and the menu screen so they
should be uniform"

The answer before this build: colours yes, patterns no, skins no. Every landed cell is Astra's OBSIDIAN SHARDS face for
its ring (twelve dark iron glass faces, each carrying one molten fracture in the ring's colour); her v1 dark stamps (dot,
two bars, triangle...) that gave each ring a pattern were made TRANSPARENT in v2, so colour is the only cue between rings
and the whole board is one dark material. One look, no choice, nothing to unlock. The menus run two palettes at once
(the audit below).

Game: satellites/ring-stacker/ (BUILD v5.2 live on main 003507efd, source 2403070e0; ART_V 20261107a; sw.js CACHE
ring-stacker-v11). Check: `node tools/sunforge-tests/check.js`. Shot: `node tools/sunforge-tests/shoot.mjs <outdir>
<screen>` (title how settings play almost crush first gameover daily, plus the skin screens this plan adds).

## STATE (one line per step)

| Step | State | Commit | Note |
|---|---|---|---|
| 0 | DONE |  | plan written, theme audit below; main's index and sw blobs = the branch's (de4add1c, 1f991724) |
| 1 | DONE | 7614b1f7f | SKINS table, SK and rs_skins (cur, un), RC(d) on every ring colour read (frames, almost outline, shards, flow, the gyre on the cards, fallback fill), cellSprite keyed by skin plus the painter path, skinFalling, skinResting, skinGhost, the HUD previews; BRIGHT painted (12 hues on a 30 degree ladder, gloss, rim on exposed sides, a pattern per ring); RS_DEV.skin and RS_DEV.probe; shoot.mjs skin screens and PROBE=1; check.js protects rs_skins. Check green. Shot skin-bright (probed in page, not opened): eleven distinct hues along the +x radius (255,214,34 then 255,159,31 then 240,72,78 then 233,63,191 then 187,76,233 then 125,92,243 then 74,109,242 then 31,163,252 then 20,208,208 then 29,214,122 then 123,222,44), pattern share 32 to 65 percent of each cell, cells 29 stage px on a four ring board and 20 on eleven, no page errors |
| 2 | DONE | 275e70951 | CLAY painted: twelve glazes, two soft tone blotches, speckle at a density per ring, one or two thumbprint dents, a scored or stamped mark per ring (a groove, a circle, three dots, a diagonal, a cross, a square, two grooves, a chevron, a wave, a target, a grid), a matte bevel, the clay's own dark edge on exposed sides; falling: unfired grey clay; resting: fires to terracotta. Check green. Shot skin-clay (probed in page, not opened): eleven distinct glazes along the radius (174,133,41 then 170,72,50 then 130,138,98 then 203,193,169 then 161,98,38 then 92,103,110 then 182,157,123 then 100,61,88 then 87,110,57 then 151,80,48 then 208,201,185), pattern share 11 to 44 percent, no page errors |
| 3 | DONE | a8eba48c2 | PAINTED: gesso ground with tooth, strokes with four bristle lines each in tones a little off the ring's colour, the direction and dab style per ring (long horizontals for rings 1 and 2, verticals, the two diagonals, cross hatch, round dabs, short ticks, sweeps, curls, stipple, basket weave), an uneven darker painted outline on exposed sides; falling: a pencil sketched cell on gesso; resting: an acid swipe and the outline inked. Check green. Shot skin-painted (probed in page, not opened): eleven distinct colours along the radius (225,187,73 then 230,112,49 then 58,158,154 then 209,101,141 then 151,186,66 then 82,105,201 then 240,154,65 then 226,223,211 then 177,77,147 then 87,162,119 then 165,153,226), pattern share 10 to 44 percent, the gyre region 31 percent saturated over 150 colour bins (the most textured skin), HUD untouched (graphite, 85 bins), no page errors |
| 4 | DONE | 34bb4ebf1 | unlockCheck where rings break and once at load (silent); Bright at the first ring, Clay at 5 in one run, Painted at 25 in all, saved in rs_skins; s-skins built from the SKINS table (four tiles, a 4 by 3 live sample of the twelve ring cells each, Equipped or Tap to wear or the rule, the current one ringed in acid, locked ones dimmed and greyed, a tap applies at once and clears the caches); the Skins pill top right on the title with a live chip of the worn skin, Skins buttons on Pause and Settings with the same chip, Back returns where it came from; the toast on the play screen (NEW SKIN, the name, a live cell, 2.6 s, no motion under reduced motion); the chips and tiles repaint once Obsidian's sheets load; RS_DEV.unlock and RS_DEV.skins. Check green. Shot skins (measured, not opened): four tiles each carrying its own sample (Obsidian dark over 273 colour bins, Bright 76 percent saturated, Clay 23, Painted 51), the heading acid, the Back plate dark, no page errors |
| 5 | DONE |  | one token set in :root (void, sky, graphite, rim, cream, secondary, acid, coral; the old names aliased onto it), one .screen backdrop, one .btn definition, the dead old title and result classes gone, setting lines and toggles in the system (acid on), the tbtn, cbtn and SLAM fallbacks in graphite and acid, the music ring acid, the menus on the play plate dimmed under the void gradient once it loads (How, Settings, Skins, Result; Pause keeps its translucent void over the board), the canvas floats cream and secondary with a dark edge (they sit over bright skins now), the ceiling warning and the ghost fallback coral and cream; grep finds no old colour left. The headless proof of step 4 also passed (first ring unlocks Bright with the toast, pause and settings round trips, a locked tap does nothing, the worn skin survives a reload). Check green. Shot settings (measured, not opened): heading acid, Sound toggle on acid (96,116,51), Reduced motion off graphite, setting lines sky over the dimmed plate, the foot void, no page errors |
| 6 | TODO |  | stamp v5.3, cache v12, deploy script, DRY |

## THE STEPS

**Step 1. The skins engine and BRIGHT (M).** One SKINS table (key, name, unlock rule, palette of 13 colours indexed by
ring, a cell painter at 64 px, a falling cell, a resting overlay, a ghost tint). `SK` is the active skin; `rs_skins`
(new LS key: cur, un) stores it. The composer cellSprite(d,mask) keeps Astra's layered path for OBSIDIAN (the default and
the fallback, untouched) and for every other skin paints the cell by code into the same 64 px cache, keyed by (skin,
ring, neighbour mask) exactly as today. Every ring colour read (frames, the almost outline, shards, the inward flow,
the gyre on the result and share cards, the fallback fill) goes through RC(d), the active skin's palette. The falling
piece, the resting heat, the ghost and the HUD previews route through the skin. BRIGHT: twelve saturated hues on a 30
degree ladder from the sun's yellow outward (yellow, orange, red, magenta, purple, violet, indigo, azure, teal, green,
lime, yellow green), a glossy top light, a dark rim on exposed sides only (so a ring still reads as one band), and a
pattern per ring (plain, dots, bars, checks, diagonals, rings, posts, diamonds, hatch, chevrons, triangles, stars) in a
darker tone of the same hue. Falling: white gloss with a graphite keyline; resting: warms to acid. Check green. Shot:
play with Bright (the fixture board), probed from the shell (ring colours along a radius, pattern pixels).

**Step 2. CLAY (M).** Twelve earth glazes alternating warm and cool, light and dark from the sun out (ochre, brick,
sage, cream, rust, slate, sand, plum, moss, sienna, bone, umber), matte: a soft bevel (light top left, shade bottom
right, no gloss), deterministic speckle whose density changes by ring, one or two thumbprint dents, and a stamped or
scored pattern per ring (a scored line, a stamped circle, three dots, a diagonal score, a cross, a square, two lines, a
chevron, a wave, a ring, a grid). Falling: unfired grey clay; resting: fires to terracotta. Shot: play with Clay.

**Step 3. PAINTED (M).** Twelve gouache colours (cadmium yellow, vermilion, cobalt teal, rose, chartreuse,
ultramarine, orange, titanium cream, magenta, viridian, lavender, burnt sienna) laid as strokes with bristle texture
over a gesso ground, the direction and dab style changing per ring (horizontal, vertical, two diagonals, cross hatch,
dabs, short ticks, long sweeps, curls...), a darker painted outline on exposed sides only. Falling: a pencil sketched
cell on gesso; resting: the sketch inks in. Shot: play with Painted.

**Step 4. Unlocks, the Skins screen, the toast (M).** Obsidian from the start. Bright: break your first ring
(PROG.ringsEver 1). Clay: break 5 rings in one run (G.rings 5). Painted: break 25 rings in all (PROG.ringsEver 25).
Checked where rings break (nextRingStage) and once at load for what the counters already satisfy (silent). Never gates
anything but the look. s-skins: four tiles, each a live 4 by 3 sample of its twelve ring cells, the name, one line
(Equipped, Tap to wear, or the rule), the current one ringed in acid, locked ones dimmed; a tap on an unlocked tile
applies it at once (caches cleared, previews redrawn). Reached from the title (a Skins pill top right, mirroring the
arcade pill top left, with a live cell of the current skin), from Pause and from Settings; Back returns where it came
from. A toast on the play screen the moment a skin unlocks (NEW SKIN, its name, a live cell), 2.6 s, no motion under
reduced motion. RS_DEV.skin(k) and RS_DEV.unlock(k) for the shots. Shot: skins.

**Step 5. Themes uniform (M).** The audit below made one system (Sunbreaker: void #080D15, sky #182431, graphite
#263442, rim #8297A5, cream #FFF5CB, secondary #C8D5E8, acid #DFFF4F, coral #F15370; Barlow Condensed Black display,
Space Grotesk live). The old :root tokens become aliases of these so nothing breaks; the dead old title and result
classes go; the menus (How, Settings, Skins, Result) sit on the play plate dimmed under the void gradient so they share
the title's and the board's material; toggles, setting lines, the fallback control plates, the music ring, the floats,
the ceiling warning and the ghost fallback take the Sunbreaker colours. The play chrome's nine slice HUD is untouched.
Shot: settings.

**Step 6. Stamp and the line (S).** BUILD v5.3, sw.js CACHE ring-stacker-v12 and the register line sw.js?v=12, ART_V
unchanged (no new images). /home/codespace/sf-drafts/deploy-sunforge-v3.sh in the exact pattern of deploy-sunforge-m3.sh
(SRC the stamp commit, BASE the blobs origin/main holds now for index.html, sw.js and the thumb), `DRY=1` once. The line
into START-HERE.md: `! bash /home/codespace/sf-drafts/deploy-sunforge-v3.sh`.

## THE THEME AUDIT (index.html at v5.2, before step 5; line numbers of that file)

What differed:
- L39 and L40, `:root`: the OLD palette (--bg #0e1018, --panel #171a26, --line #2a2e40, --ink #eef0f6, --muted #8d90a8,
  --gold #ffd76a, --teal #4ac8b4, --rose #e07a9a). Sunbreaker is void #080d15, sky #182431, graphite #263442, rim
  #8297a5, cream #fff5cb, secondary #c8d5e8, acid #dfff4f, coral #f15370. Both palettes are live on screen at once.
- L43 #wrap #080d15 against L44 #stage var(--bg) #0e1018: two navies meet in the letterbox on a tall phone.
- L46 .screen default: gradient #131624 to #0c0e16 (old navy). L105 #s-title fallback: #131624 to #080d15. L140 How,
  Settings, Result: #182431 to #080d15 (Sunbreaker). L181 Pause: rgba(8,13,21,.82). Four backdrops for five screens.
- L53 to L55 .title-word, .title-sub, .ribbon: dead (the old title, a teal to gold to rose gradient wordmark).
- L58 to L64 .btn and .btn.primary (old graphite, old gold with a #8a6a1e shadow), then redefined Sunbreaker at L130 to
  L132; L68 h2.sc-h old gold, redefined acid at L133. Two definitions each.
- L69 and L70 .helprow: dead (old teal rim, old gold). L100 to L102 .go-score, .go-lab, .pill: dead (old gold).
- L71 .settingline: border --line (old), fill #12141c (old) inside a Sunbreaker screen.
- L72 to L76 .toggle: track #22263a (old), on #3a6f5f (old teal green), knob #dffff0; the accent everywhere else is acid.
- L78 to L80 .tbtn and L92 to L94 .cbtn fallbacks: old rims and old gradients (covered by Astra's skins once loaded).
- L95 to L98 #slambtn fallback: OLD GOLD (#ffd76a to #d8a437, rim #ffe49a) where the primary action everywhere else is
  acid (covered by her slam skin once loaded).
- L204 #b-music.playing: an old gold ring, the one gold accent left on the title.
- Type sizes: buttons 23 (L58), 22 (L63), 21 (L128); the How lines 22 (L136), the setting lines 22 (L138): close, kept.
- JS L1152 ceiling warning rgba(255,93,108) (old rose) against coral #f15370; L1182 and L1183 the ghost fallback in old
  ink and old rose; L1250 the floats in old gold #ffd76a and old ink #eef0f6.
- Material: the title and the board are Astra's painted plates; How, Settings, Pause and the Result float on a flat
  gradient with no plate behind them. The wordmark is consistent (baked on the title plate and the result frame; the
  other screens use the Barlow acid heading).

What step 5 unifies: one token set in :root with the old names aliased onto it; one .btn definition; the dead classes
removed; one backdrop for the menus (the play plate dimmed under the void gradient; Pause keeps its translucent void
over the board by design); toggles, setting lines, control fallbacks, the music ring, floats, ceiling warning and ghost
fallback in Sunbreaker colours.

## DECISIONS for Stephen (built as written until he says otherwise)
1. Unlock rules: Bright at the first ring, Clay at 5 rings in one run, Painted at 25 rings in all. Any counter the game
   already keeps can replace these in one line each.
2. Astra's almost cues (the notch and the lit seam, both near transparent overlays in acid and cream) and her ghost
   brackets stay under every skin; the ghost is tinted per skin (cream, sand, cream). The alternative: code drawn cues
   per skin.
3. The Skins entry on the title is a pill top right (mirroring the arcade pill), not a fourth button in the row (four
   icon and word buttons do not fit 540 at 21 px). Pause and Settings also carry a Skins button.
4. The menus sit on the play plate dimmed under the void gradient. The alternative: the flat gradient as before.
5. The skin is cosmetic everywhere including the result and share cards (the gyre is drawn in the wearer's skin).
