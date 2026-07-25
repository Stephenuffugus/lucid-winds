# JIMOTHY — Sheet 13: the GAMES medallion (one glyph)

The home menu was cut to five buttons on 2026-07-25 (players said it had way too
much going on). The new top button is **GAMES**, and it is the only button on the
screen with no painted medallion — there was no glyph in the family that meant
"games". This sheet is that one glyph.

**Stephen's pick: the green WALK signal.** It is an object from Jimothy's actual
Seattle, and a walk sign already means GO to everyone alive, so it reads as PLAY
with no explanation. It also has the boldest silhouette of the options at
thumbnail size, which is the whole ballgame here.

## The one cell

- `glyph-games` — a rainy-night crosswalk signal box, the **walking figure lit
  green** and glowing, seen straight on. Dark weathered metal housing, a few rain
  streaks catching the light, faint green spill on the wet housing below the
  lens. Same round brass-rim medallion the rest of the family sits in.

## Specs (must match the family or it will stick out)

| | |
|---|---|
| drop path | `satellites/stream-hop/assets/ui/glyph-games.png` |
| size | **240 x 240**, RGBA PNG |
| background | transparent outside the medallion (`glyph-adventure` is 233x240, `glyph-raccoon` is 240x240 — anywhere in that range is right) |
| frame | round medallion, riveted brass/gold rim, dark navy-teal painted field inside |
| lighting | single object centred, soft rim light, painted storybook, same hand as `glyph-adventure` and `glyph-daily` |
| if cutting from a sheet | house format — #FF00FF knockout, white dividers |

⛔ **It renders at 64px on the button.** One bold silhouette. The lit green figure
has to survive being six times smaller than it is painted — no fine detail, no
lettering, no thin arms.

## Midjourney prompt

```
round brass-rimmed medallion game icon, a rainy Seattle crosswalk signal box seen
straight on, the walking-man symbol lit bright green and glowing, dark weathered
metal housing, rain streaks catching the light, green light spilling onto the wet
metal, deep navy-teal painted field inside the riveted brass ring, painted
storybook illustration, soft rim light, bold readable silhouette, centred, on a
flat magenta #FF00FF background --ar 1:1 --s 250 --style raw
```

Relax mode, batch of 4, upscale only the pick (house rules).
Grab the seed if it lands — future glyph gaps should reuse it.

## Wiring (me, the moment it lands)

1. Drop the PNG at the path above.
2. Add `['ic-games','glyph-games']` to the glyph src table in `index.html`.
3. Put the `<img class="bicon" id="ic-games">` back on `#b-games` at 64px.
4. Bump `ARTV` + the `sw.js` cache version, commit, push to main.
