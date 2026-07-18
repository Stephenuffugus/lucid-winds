# Blobworks Pinball — art wiring status + remake notes
_Living doc. Stephen: test the live table and add notes here (or tell me); I'll keep wiring + fixing._

The claymation art is a drop-in swap over the (unchanged) v1.6 engine. `PIN_ART` in `index.html`
blits a sprite when its PNG exists in `art/`, else the old procedural draw. To remake ANY piece:
drop a new PNG with the **same file name** into `art/`, bump `PIN_ART.VER` (cache-bust), done.

Raw source: `art-drop/Pinball claymation/` (22 sheets + `PROMPTS.txt`). Re-cut anytime:
`python3 scripts/cut_pinball_claymation.py all` → `art-drop/Pinball claymation/cut/` + preview contact sheets.

## LIVE + wired ✅
| Piece | Keys | Sheet | Notes |
|---|---|---|---|
| Table backdrop | `table_night_shift` (+day/toxic/power) | 1-4 | full-frame; night is default (G.season picks) |
| Ball | `eyeball_core`, `eyeball_lit` (multiball), `trail_mote`, `launch_streak` | 5 | |
| Flippers | `flipper_rest`, `flipper_up`, `pivot_cap`, `flipper_glow` | 6 | rotate about pivot; **verify R flipper orientation on device** |
| Bumpers | `bumper_a/b/c_idle` + `_lit` | 7 | green/teal/purple, chomp on hit |
| Slings | `sling_idle`, `sling_lit` | 7 | 4 blobs in the sheet; using 2 |
| Standups | `standup_idle/lit/done` | 7 | BLOOM→**SLIME** letters drawn on top |
| Spinner | `spinner_gear` | 9 | rotates |
| Rollovers | `rollover_on/off` | 9 | SUN→**ZAP** letters on top |
| Ramp/orbit throats | `throat_fern/trellis/green/heart/lorbit/rorbit` | 9 | blit at each entrance |
| Scoop | `scoop_idle/lit/open` | 8 | monster mouth + gold lit ring |
| Drops | `drop_up_0/1/2`, `drop_down_0/1/2` | 8 | 3 clay beakers, up/down |

## Placed (in art/), wiring NEXT ⏳
- **Lock nest jar** `lock_jar_0/1/2/3` (sheet 8) — swap into the LOCK_NEST draw (shows 0-3 locked eyeballs).
- **Return gates** `return_gate`, `return_gate_lit` (sheet 8) — the inlane feed elbows.
- **Drain grate** `drain_grate`, **goo net** `net_armed`/`net_flash` (sheet 8) — bottom drain + ball-save.
- **Posts** `post_nub`, **diverter flag** `diverter_flag`, **tube segments** `tube_straight/curve` (sheet 9).

## Animations + logo — LIVE ✅ (added Jul 18 PM)
- **Blobworks LOGO** on the title screen (sheet 11, cropped + de-fringed).
- **Blip mascot** animated on the title — idle jiggle (6fr loop) + occasional blink (3fr), canvas rAF (sheet 13).
- **MEGA MASH erupt** (sheet 16, 8fr) plays on wizard start; **goo boil-over** (sheet 15, 6fr) on multiball
  start — via the new one-shot `playAnim()` overlay + normalized equal-cell strips.
- `blip_wave` (cheer) + `tilt_wobble` cut/placed, not yet triggered.

## Not yet cut/wired 🔜 (raw sheets ready)
- **Reaction meter** (sheet 10) — the left growth ribbon → bubbling test-tube fill states.
- **UI plates/buttons/DMD frame** (rest of sheet 11) — logo done; plates/DMD still procedural.
- **Juice FX** (sheet 12) — goo splats, sparkles, mega_flash, mega_mash_ring for the burst() colors.
- **In-play frame anims** (sheet 14) — eyeball blink, bumper chomp, beaker tumble, scoop gulp, spinner spin.
- **Cosmetics** — table skins (sheets 18-21) + props (sheet 22: ball/claw skins, monster-buddy cameos).
  Needs the cosmetics/skin-picker system (not in pinball yet).

## Known issues / remake candidates 🔧
1. **Magenta fringe (minor):** a faint pink edge remains on some green/purple sprites (the generator
   baked a magenta-tinted contact shadow + AA halo; erosion removes most). Barely visible on the dark
   bench. If any piece looks haloed on your device, note it — a per-piece re-cut or a clean re-gen fixes it.
2. **Dropped noise fragments:** sheet 7 had 2 stray orange clay crumbs (#0/#4), sheet 8 had a purple
   splat (#6) — skipped as non-sprites. If any were meant to be real pieces, flag it.
3. **Flipper R orientation:** the claw sprite is rotated for both sides; looked correct headless but
   **confirm on a real device** it doesn't read upside-down when the right flipper flips.
4. **Lane-path guides:** the translucent green ramp/orbit path lines still draw over the bench (they show
   where a ramp sends the ball). Can dim/hide them — say if they bug you.
5. **Backdrop weight:** the 4 backdrops are ~2MB PNG each (kept large per your ask). If mobile load feels
   slow we can trim or serve JPG for the opaque backdrops (5-10x smaller) with no visible quality loss.
6. **Which shift shows:** the game currently always shows `table_night_shift` (G.season isn't set in
   pinball). Tell me if you want day/toxic/power tied to a mode/streak/season.

## Testing checklist for Stephen
- [ ] Backdrop + all pieces load on your phone (hard-refresh; the live host caches aggressively).
- [ ] Full screen works from the play tap + Settings button; Add to Home Screen installs + opens fullscreen.
- [ ] Flippers feel right + look right (esp. the right one).
- [ ] Any piece that looks wrong / haloed / wrong-size — note it here and I'll re-cut or ask for a re-gen.
