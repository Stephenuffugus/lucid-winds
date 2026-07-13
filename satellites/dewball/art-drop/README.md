# Dewball art drop

**Put generated sheets here.** Name them `sheet1.png`, `sheet2.png`, ... matching the
numbering in `art-asset-lists/dewball/`. Commit and push; I cut and wire from this folder.

The sheet numbers map to the prompt files:

| Sheet | Art list file | What it is |
|---|---|---|
| 1-6  | `01`-`06-dewball-ground-w1..w6.md` | Ground / terrain per world |
| 7    | `07-dewball-skies.md`             | Skyboxes |
| 8    | `08-dewball-ballskins.md`         | Ball skins |
| 9-18 | `09`-`18-dewball-props-*.md`      | Props, 2 sheets per world (picnic, toybox, nightgarden, bazaar, bay) |
| 19   | `19-dewball-keepsakes.md`         | Keepsakes |
| 20   | `20-dewball-ui.md`                | UI |
| 21   | `21-dewball-fx.md`                | FX |

Partial drops are fine. Drop what you have and I'll cut what's there.

## State of the wiring (Jul 13, 2026)

Dewball is a three.js game and is **almost entirely procedural today**. The only art hook
that exists is the ground override:

```
assets/ground-<worldId>.jpg   // index.html ~line 966
```

Everything else (props, ball skins, skies, keepsakes, UI, FX) has **no render path yet**.
So this pack is a cut *and* a build, not just a cut. That is expected and fine.

## Rules that bit us before

- Ground/sky are **full-bleed JPGs**, not cutouts. Do not magenta-key them.
- Props/skins/UI/FX are **magenta-key cutouts** (`#FF00FF`), cut by colour DISTANCE not
  hue, so glows survive. See `scripts/cut_sled-vine.py` for the reference pipeline.
- Map sheet to role **by eye**, never by filename. Filenames have lied before.
- Watch for a stray sliver of a second object inside one cutout. That exact bug shipped
  in bridgevine: two terrain PNGs each carried a fragment of a neighbouring piece.
- The host **resizes anything over 1600px** and ignores no-cache. Keep long edge <= 1600
  and path-version anything that must not go stale.
- After ANY scatter/prop edit, run `smoke.js`. (`balance.js` is currently flaky-failing
  on main for unrelated reasons — unseeded `Math.random()` in the scatter — so do not
  trust it as a gate until it is seeded.)
