# Greenhouse Pinball → Blobworks — art drop folder

Cut claymation PNGs (magenta-knocked-out, transparent) go **here** (`satellites/greenhouse-pinball/art/`).
The game already reads them: `PIN_ART` in `index.html` blits a sprite when its PNG is present
and falls back to the current procedural draw when it is not. Nothing here yet = the game looks
exactly as it does today.

## To light up the art (when the drop lands)
1. Drop the cut PNGs in this folder, named by the manifest key + `.png` (e.g. `table_night_shift.png`).
2. In `index.html` set `PIN_ART.enabled = true` (search `var PIN_ART`) and bump `VER` to cache-bust.
3. Extend the `MAN` list + add blit sites for the rest of the pieces, following the wire-notes in
   `art-asset-lists/pinball-claymation/00-art-direction.md`.

## Wired now (drop these and they appear immediately)
| Key | What | Draw site |
|---|---|---|
| `table_night_shift` | full 540×960 lab-bench backdrop (default) | `render()` backdrop |
| `table_day_shift` / `table_toxic_spill` / `table_power_out` | the other 3 lab shifts (by `G.season`) | `render()` backdrop |
| `eyeball_core` | the ball | ball draw |
| `eyeball_lit` | the ball during GOO MULTIBALL | ball draw |

## Ready to wire next (keys reserved; add blit calls per the pack)
Flippers (`flipper_L_rest/up`, `flipper_R_rest/up`, `pivot_cap`), bumpers (`bumper_head_a/b/c` idle+lit),
slings, standups, drops, scoop, ramps/orbits/spinner/rollovers/lock, growth meter, FX, UI/logo, and the
**sheet-10 animation strips** (use `PIN_ART.frame(frames,fps,t)` for the source-x cell offset).

Sizes/anchoring: pieces render at the coords/radii in the pack wire-notes (bumpers r24/26, ball ~BALLR,
flippers L=82 rotated about the pivot, etc.). Keep the play center readable.
