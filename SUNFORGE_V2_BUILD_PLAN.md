# SUNFORGE v2, THE BLOCKS (Astra pack v2 wired; 7 Nov 2026, Fable's plan for the Opus overnight run)

Stephen, 6 Nov: "the aesthetic is okay but im not really liking the blocks at all." Astra's round 2 is back: she compared
three directions on the live seven ring board and picked OBSIDIAN SHARDS ("the sun trapped inside broken stone": a landed
cell is dark iron glass carrying a molten fracture in its ring's colour, a falling cell is cold intact silver, a resting
cell warms before it joins, a broken ring collapses into dark chips and light). No centre stamps, no rectangular frames.

The pack: /workspaces/sunforge-astra-v2/pack (49 files; vault release astra-four-packs-back-nov07). Her docs are copied
to docs/briefs/sunforge/round2/astra/ (ASSESSMENT.md, NOTES.md, STYLE-GUIDE.md, manifest.json). The v1 pack is at
/workspaces/sunforge-astra-v1/pack. v2 is a DELTA over v1: merge its assets/ over v1's, the manifest's records over v1's.
Game: satellites/ring-stacker/ (BUILD v5.1 live, ART_V 20261105a, sw.js CACHE ring-stacker-v10, main 3a3a4a37e's tree).
Importer: tools/sunforge-tests/astra_in.py (re runnable; takes a pack dir). Check: `node tools/sunforge-tests/check.js`.
Shot: `node tools/sunforge-tests/shoot.mjs <outdir> <screen>` (title how settings play almost crush first gameover daily).

## STATE (the builder updates this block; one line per step)

| Step | State | Commit | Note |
|---|---|---|---|
| 0 | DONE 7 Nov | 2403070e0 | merged pack /workspaces/sunforge-astra-merged/pack; importer extended (resting, notch, lit seam, How 05; cell_seam, weld_side, weld_inner_corner are byte equal to trim frames 7, 1, 5 so not copied; compat sheets and the 128 core unused); 16 files changed and 4 added, proven by sha256 before and after; ART_V 20261107a; check green |
| 1 | DONE 7 Nov | 2403070e0 | the composer unchanged: v2's trim sheet is the same eight frame cut, its frame 7 the quiet seam; the marks sheet is transparent (no stamps). Shot play (412x915, probed, not opened): the board's centre 76 percent dark pixels, 4 percent saturated vein pixels, HUD untouched, no page errors |
| 2 | DONE 7 Nov | 2403070e0 | heat = ease over lockT/LOCK_DELAY, her resting frame drawn over the cold cell at that alpha, cooling again on a reset; reduced motion holds the hot frame; the old alpha breath only when her frame is missing |
| 3 | DONE 7 Nov | 2403070e0 | her notch on the gap, rotated by the gap's side; her lit seam on every edge of the band's cells that borders another ring or the gap; the code outline under at 0.5. Shot almost (probed, not opened): 85 percent dark, 4 percent vein, acid pixels present, no page errors |
| 4 | DONE 7 Nov | 2403070e0 | How 05 in the ART table and on the How screen (Drag to slide the piece. Tap to turn it.); BUILD v5.2, ART_V 20261107a, CACHE ring-stacker-v11 and sw.js?v=11; the spent core frame not wired. /home/codespace/sf-drafts/deploy-sunforge-m3.sh DRY OK. LINE: `! bash /home/codespace/sf-drafts/deploy-sunforge-m3.sh` |

## THE LAWS
The laws of SUNFORGE_BUILD_PLAN.md bind (code directly, the check per step, ONE shot per visual step described from the
shell, never push main, commit and push add-sproing-jumper after every step, one HTML file plus assets/, every image
through art() with ART_V, no CDN, the code drawn fallback stays behind every plate). Astra's docs are advice; where they
and the game's rules differ, the game's rules win and the difference is one line in STATE.

## THE STEPS

**Step 0. Merge and import (S).** Build /workspaces/sunforge-astra-merged/pack: v1's assets/ then v2's assets/ copied over
it (cp -r v1 then cp -r v2; same names replace). Extend astra_in.py's COPY: cells adds c_cells_pieces/cell_seam.png,
weld_side.png, weld_inner_corner.png, falling_cell_resting.png; fx adds f_fx/almost_ring_notch.png and
almost_ring_lit_seam.png; hud adds e_hud_controls/how_to_play_05_drag_tap.png. Run it with the merged pack. The twelve
compatibility ring_XX sheets, ring_marks.png and core_states_128.png are not copied (the game composes cells from the
layered path and draws the 256 core). Prove the swap: sha256 of every file in satellites/ring-stacker/assets/cells,
core, fx, the thumb and og/card.jpg before and after; the replaced ones changed (ring_faces_unmarked, ring_marks_dark,
weld_trim_layers, falling_cell, ghost_cell, stick_flash, core_states, ring_crush_burst, slam_shockwave, void_swallow, the
promo tile as the arcade thumb, the social card), nothing else did. ART_V 20261107a. Check green. No shot.

**Step 1. The cells (M; the look).** The composer at index.html about line 842 (WELDED CELLS, manifest.cell_layer_recipe)
draws face, seam, weld trims, the upright mark. v2: the face sheet is 12 by 64 (rings 1 to 12), the quiet seam is its own
64 px tile (cell_seam.png: every cell gets it, very low contrast), the welds are weld_trim_layers (the same 8 frame cut
as v1: single, top, right, bottom, left, inner TL, outer TL, interior) plus weld_side.png and weld_inner_corner.png for
the layered path; ring_marks_dark is transparent now (skip the mark layer entirely rather than draw nothing). Draw: face,
seam, then only the boundary welds (a side whose neighbour is not the same ring; inner corners where two welded sides
meet), rotated, never scaled. The full perimeter single variant only for an isolated cell. Never draw a compatibility
sheet's baked weld AND the overlay. Compose once per ring and neighbour pattern at 64 px as today. Check green. ONE shot
of play at 412x915 (the fixture's seven ring board): describe it from the shell (sample the band: twelve distinct ring
colours along a radius through the gyre; no cell with a bright centre stamp). Not opened.

**Step 2. The falling piece (S).** falling_cell is cold brushed silver; falling_cell_resting is the same fold heated.
During the lock delay (G.lockT running, index.html about line 1106, where restA breathes the alpha) crossfade falling to
resting and back (alpha k = 0.5 + 0.5 cos(G.lockT * PI / LOCK_DELAY * 1.5), resting drawn over falling at k), reset to
cold when the piece is airborne again. Reduced motion: hold the resting frame steady while it rests. At lock, the ring
face by the cell's distance from the sun (as today). Check green. No shot (step 1's covers it).

**Step 3. The almost ring (S).** Today: the outline lit steady in its colour and acid brackets on the one missing cell
(about lines 904 to 930 almostRing, 1001, 1096). Her two cues: almost_ring_notch.png (64 px) drawn on the one missing
cell, rotated in 90 degree steps so its open side faces away from the band (the band is around it); almost_ring_lit_seam
(64 px, authored along the top edge) drawn on every outer boundary edge of the almost ring's cells (an edge whose
neighbour is a different ring or empty), rotated per edge, steady, no strobe. The code drawn outline stays under them at
half its alpha (DECISION 1). The ghost keeps drawing before the notch (step 7 of the m1 plan found the ghost covered it).
The core and SLAM still charge with it. Check green. ONE shot of the almost screen (shoot.mjs almost): describe from the
shell. Not opened.

**Step 4. The rest, the stamp, the line (S).** Core: her frame 3 is spent (v1's was an overloaded slot nothing drew; grep
overload finds nothing): nothing to map; if any code indexes frame 3, it is the spent look. How: a fifth plate how5 in
the ART table and on the How screen after the four, its line "Drag to slide. Tap to turn." Promo tile and social card
land through the importer (step 0). Stamp BUILD v5.2, sw.js CACHE ring-stacker-v11 (and the register line's ?v if one),
ART_V 20261107a. Check green. The deploy script /home/codespace/sf-drafts/deploy-sunforge-m3.sh in the exact pattern of
deploy-sunforge-m2.sh: SRC the stamp commit, BASE the blobs main holds NOW for satellites/ring-stacker/index.html,
og/card.jpg and portal-assets/thumbs/ring-stacker.png (read them with git rev-parse origin/main:<path> when you write the
script; the lock delay line went live on main 3a3a4a37e). `DRY=1 bash ...` once. The line into START-HERE.md:
`! bash /home/codespace/sf-drafts/deploy-sunforge-m3.sh`

## DECISIONS for Stephen (built as written until he says otherwise)
1. The code drawn outline stays under her lit seam at half alpha (default yes; the other choice: her seam alone).
2. The spent core frame is not wired to anything (default); it could show for 0.4 s after a crush.
3. Ring 12 is cold slate now under the brass file name (hers; nothing to decide unless he wants brass back).

## LIVE 8 Nov ~01:23 UTC by his line (lucid-winds main 003507efd, source 2403070e0; lucidwinds.com/satellites/ring-stacker/ serves it)
