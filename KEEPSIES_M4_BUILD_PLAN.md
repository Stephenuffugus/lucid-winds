# KEEPSIES m4, ASTRA'S ROUND 3 ON THE NEW SHOT (7 Nov 2026, Fable's plan for the Opus overnight run)

m3 is live (build 20261106a, main fbcfe26fe: the camera holds during a shot, the 154 px circle, the aim line is the aim,
the five foot ring, her round 2 kit). Astra's round 3 is back, drawn at the real size: the hold circle and its braced
state, two reticles inside a fixed 154 px viewport, spin marks (she ships them OFF by default: a third ring competes with
the aim), a dial cue, the snap card redrawn as three panels, the chalk stroke re exported with its breaks (explicit clip
polygons; the round 2 PNG lost them), an optional fine dirt tile, a narrower player chip (152 by 56 CSS) with 20 px pip
spacing, and the tier tiles' content box. CAVEAT she wrote: the materials zip (the nineteen captures) never reached her
and the live page failed for her with "Error creating WebGL context", so every judgement that needed a capture (the near
dirt, the contact shadows, the statue bars, the pill) is UNFINISHED; her sheets are studio studies. So: wire what she drew
to her numbers; the capture dependent calls stay at today's art (ground_shadow, shadow_dark, owner marks, pills, tier
tiles) and are DECISIONS for Stephen on the Pixel.

The pack: /workspaces/keepsies-astra-round3/pack (55 files; vault astra-four-packs-back-nov07). Docs copied to
docs/briefs/keepsies/round3/astra/ (ASSESSMENT-R3.md, NOTES.md, manifest.json, anchors.json). Game: satellites/keepsies/
(src/main.js, src/game/ringer.js, index.html; assets/ui and assets/env; tools/astra_in.mjs, tools/check.js,
tools/frontdoor.mjs; docs/m3/ the probes). Anchors in the code: #grabRing at index.html 481 and 611, placed in
src/main.js about 1775 (2 * grabR); the reticle at src/main.js 1633 to 1672 (sized S = px * 2 / 0.5625 from her v1 SVGs,
settled at settle01 > 0.98); ART_VARS at src/main.js 92 (the CSS variables for her plates); the chip rule at index.html
about 88 to 98 (176 by 56, nine slice 24, pips at 16 + 24k, 39); #snapArt at index.html 751; the chalk strip constants
CHALK_STRIP in src/render/plates.js (used by arenaEnv.js chalkStrip); tuning src/data/tuning.json snap.grabRadiusPx 77.
Check: `node tools/check.js --fast` from satellites/keepsies. Browser gates serial, one at a time.

## STATE (the builder updates this block; one line per step)

| Step | State | Commit | Note |
|---|---|---|---|
| 0 | DONE 7 Nov | 3ba0a05cc | tools/astra_in.mjs gained a round 3 section (seven files into assets/ui and assets/env, src/data/astra_r3.json with her anchors and caps, the retained tiles' and pills' round 3 anchors recorded; --check covers round 2 and 3); her tier tiles, pills and shadow_dark are byte equal to the game's (retained), her ground_shadow is round 2's under a new name (left); the stamp tool bumped 27 files to 20261107a |
| 1 | DONE 7 Nov | 3ba0a05cc | #grabRing draws her hold_circle.svg at 2 grabR (154) and hold_circle_braced.svg while bracing (onBrace toggles the class); the dashed CSS ring is gone; the hit region unchanged. Aim shot at 412x915 probed (docs/m3/probe_pixels.mjs, not opened): her cream ring at the circle's left and right edges (129,743 and 283,743: 25 and 28 cream pixels of 49), the top and foot clear by her design (her two arcs leave breaks at the top and bottom centre), the shooter at the centre, page errors 0 |
| 2 | DONE 7 Nov | 3ba0a05cc | #reticle is a fixed 154 box; drawReticle builds her rings inline (eight 29 degree arcs every 45 degrees at radius 33.15 + k (71.65 minus 33.15) from the cone, the full ring and her tick at settle01 > 0.98), keyline 3 and chalk 1.5 constant, no CSS scale; spin marks behind tuning snap.spinMarks (false); the dial cue 48 px at the circle's right edge while localStorage kp_dial_cue < 3, a brace that ends counts one, hidden while braced. Feel gate FEEL OK at 412x915 (30 oks: circle 72.4 px shooter at 206,743, orbit 20.1 for 20.1, dial 9.6, a brace on the edge at 71 px, the flick 0.001 off the line, the camera 0.00 in a shot, LOOK, the knuckle) and 360x780 |
| 3 | DONE 7 Nov | 3ba0a05cc | #snapArt is her snap_card.svg inline (hold, slide to turn, flick up), three words in code under it |
| 4 | DONE 7 Nov | 3ba0a05cc | the chalk strip loads env/chalk_stroke_r3.png (her export; node proved three alpha breaks at y 32: 4, 6 and 4 px at x 384, 909, 1504); her dirt tile behind tuning render.dirtDetail (false): a detail sample at 0.25 m repeat mixed at 0.18, faded out from 0.3 to 0.65 m camera distance through onBeforeCompile |
| 5 | DONE 7 Nov | 3ba0a05cc | CHIP 152 by 56, pips 16 + 20k at 39 (her 304 by 112 chip as ui/player_chip_r3.png, the CSS max width 152); TIER_TILE.content 13 22 70 61; test/plates.mjs reads her round 3 anchors; PLATES OK |
| 6 | DONE 7 Nov | 3ba0a05cc | stamp 20261107a (tools/stamp.mjs --bump, STAMP OK); fast check: THE GATES THAT CAN RUN FAST PASSED; feel FEEL OK at two phones; /home/codespace/kp-drafts/deploy-keepsies-m4.sh DRY OK (44 files) against main 9550354e0. LINE: `! bash /home/codespace/kp-drafts/deploy-keepsies-m4.sh` |

## THE LAWS
The LAWS of KEEPSIES_M3_BUILD_PLAN.md bind (code directly; the fast check per step; the probes read screenshot PIXELS,
no image is opened; one browser job at a time; never push main; commit and push after every step; docs/, sim/, test/,
tools/ and assets/store never ship; law 16's hashes: the sim is untouched tonight, so every replay hash stays as it is).

## THE STEPS

**Step 0. Import (S).** Through tools/astra_in.mjs (extend it for round 3, re runnable) into assets/ui/: hold_circle.svg,
hold_circle_braced.svg, reticle_settling_r3.svg, reticle_settled_r3.svg, spin_marks.svg, dial_cue.svg (the SVGs; her PNG
fallbacks are not needed, the game draws SVG), player_chip_r3.png (304 by 112); into assets/env/: chalk_stroke.png (2048 by
64, with the breaks) and dirt_detail.webp (the optional tile; its source PNG never). ground_shadow.png is R2's shadow_dirt
under the requested name and shadow_dark is unchanged: cmp them against what the game holds and copy nothing that is
byte equal; the same for the tier tiles and pills (retained). snap_card.svg is inlined in step 3. Register every new file
in the catalog and lint. Fast check green.

**Step 1. The circle (S).** #grabRing's dashed CSS border goes; the element stays 2 * grabR (154) square, centred on the
projected shooter, pointer-events none, with hold_circle.svg as its background at 100 percent; hold_circle_braced.svg
while st.bracing; never both. The hit region is unchanged (grabR). Fast check. ONE shot of the aim frame at 412x915 by
the m3 shot tool, probed in the shell (docs/m3/probe_pixels.mjs): a dark keyline pixel at the circle's top (206, 666)
and its foot (206, 820), the centre clear (the shooter's pixels unchanged). Not opened.

**Step 2. The reticle (M).** #reticle becomes a FIXED 154 px element centred on the shooter (no S scaling, no CSS
transform scale: her strokes must stay strokes). Inline SVG (viewBox 0 0 154 154): her settling ring and her settled
ring as paths; breathe by changing the ring path's radius about (77, 77) from 71.65 (loose) to 33.15 (settled) with the
same cone fraction the px formula uses today; chalk 1.5 CSS px and the keyline 3 px constant; the settled tick drawn at
its final coordinates and faded in only at settle01 > 0.98. spin_marks.svg behind the reticle only when
tuning snap.spinMarks is true (default false; the spin input region is unchanged). dial_cue.svg (48 px) shown beside the
circle's right edge while the save's dialCueTurns is under 3 (count a turn each time the aim phase ends), hidden on a
brace. Fast check. The feel probe (tools/frontdoor.mjs feel) at 412x915 once: the circle and reticle numbers in STATE.

**Step 3. The snap card (S).** #snapArt's drawn SVG replaced by her snap_card.svg (320 by 150; hold, turn, flick; the
words stay in code). Fast check. No shot.

**Step 4. The close view (S).** The chalk strip reads assets/env/chalk_stroke.png (CHALK_STRIP keeps y 32, thickness 40,
repeat 2048; breaks at the R2 positions); prove the breaks in node by sampling the PNG's alpha along y 32 (three runs of
near zero alpha at her widths 5, 7, 4 px). dirt_detail: wired behind tuning env.dirtDetail (default false): a second
sampler at 0.25 m repeat, blended at 0.18 over the base albedo and faded to zero between 0.3 and 0.65 m camera distance;
mipmaps and repeat wrapping; colour only. The base albedo stays the default (her advice, DECISION 2). Fast check.

**Step 5. The plates (S).** The chip rule: her 304 by 112 at 152 by 56 CSS, nine slice 24 source (12 CSS), the seven pips
16 by 16 CSS centred at x 16 + 20k, y 39 (replace the 176 and 24 numbers at index.html about 89); the tier tile render
box for the marble becomes [13, 22, 70, 61] CSS inside the 96 tile, aspect preserved, the camera render unchanged; pills
retained. test/plates.mjs and docs/m3/probe_plates.mjs at 412x915, 375x667, 360x640: every live render within 2 px of her
box, numbers only. Fast check.

**Step 6. The stamp, the feel, the line (S).** Stamp 20261107a everywhere the stamp lives (every ?v= query, as m3 did).
Fast check green, then `tools/frontdoor.mjs feel` once at 412x915 and 360x780 (FEEL OK). The deploy script
/home/codespace/kp-drafts/deploy-keepsies-m4.sh in the exact pattern of deploy-keepsies-m3.sh: SRC the stamp commit,
BUILD 20261107a, the base tree = the keepsies tree main holds NOW (git rev-parse origin/main:satellites/keepsies, m3's)
and the thumb. `DRY=1 bash ...` once. The line into START-HERE.md:
`! bash /home/codespace/kp-drafts/deploy-keepsies-m4.sh`

## DECISIONS for Stephen (built as written until he says otherwise)
1. Spin marks: off (her default). On is one tuning line, snap.spinMarks.
2. The dirt detail tile: off (her default, she never saw capture 01). On is tuning env.dirtDetail; he judges on the Pixel.
3. The capture dependent art she could not judge (contact shadows under the 72 px shooter, the owner bars at the new
   distance, the inspect pill): unchanged tonight. If they fail on the Pixel, a round 4 with the nineteen captures
   ATTACHED to the kickoff (the zip never reached her; the vault link is not a file she can open).
4. The dial cue shows for the first 3 turns of a save.

## LIVE 8 Nov ~01:17 UTC by his line (lucid-winds main 7619bc46c, source 3ba0a05cc; lucidwinds.com/satellites/keepsies serves build 20261107a)
