# Asterism art pack

Four sheets, paste ready. **The app ships finished without any of them**: the sky is drawn from the
real catalogue and the type is a system serif. Only the plate frame changes what a player sees at
export; the rest are quiet upgrades. `satellites/asterism/ART_ASSETS.md` lists the exact paths the
code reads, each behind an `onerror` that leaves the drawn version alone.

The `--ar` and `--style` flags are Midjourney syntax, not player copy.

---

## 1. `plate-frame.png` — the border for the Plate poster

The centre must be EMPTY: the chart and the myth are drawn inside it. This is the one sheet that
changes a keepsake, so it is first.

```
an antique celestial atlas engraving border, empty centre, fine copperplate line
work, a thin double rule with small astronomical ornaments at the four corners,
brass and bone on deep indigo, no stars inside the frame, no text, no figures,
symmetrical, --ar 4:5 --style raw --stylize 200
```

Quieter alternative, if the first is too busy against a star chart:

```
a plain engraved double rule border with a single small compass rose at each
corner, warm gold line on near black, empty middle, no text, no illustration,
--ar 4:5 --style raw --stylize 120
```

Delivered 4:5. Goes in as `art/plate-frame.png` at 1200x1500. **The host resizes anything over 1600 px
on a side**, so never deliver larger; the poster draws it scaled up at 2048x2560.

---

## 2. `parchment.png` — the myth sheet

Tiled at 20 percent behind dark serif text, so it must be pale, even, and almost featureless. Any
strong mark in it will read through the words.

```
a sheet of pale aged paper, even tone, very faint fibre and a soft warm stain
toward the edges, no folds, no burn, no writing, no border, flat lighting,
seamless, --ar 1:1 --style raw --stylize 80
```

Goes in as `art/parchment.jpg`, 1024x1024, q75.

---

## 3. `hills.png` — the ground

Keyed from white, so the app can lay it over any sky colour. It replaces a horizon that is currently
drawn from a fixed noise and looks like a ridgeline, which is honest but generic.

```
a silhouette of low rolling hills with a ragged treeline, pure black shape on
pure white, no sky, no detail inside the silhouette, no texture, wide,
--ar 4:1 --style raw --stylize 50
```

A second one worth having, for the Ohio nod the design asks for:

```
a silhouette of a flat farm horizon with one barn, a line of trees and a single
grain silo, pure black on pure white, no sky, wide, --ar 4:1 --style raw --stylize 50
```

Fable keys it and delivers `art/hills.png` at 1600x400 with alpha.

---

## 4. `icon-mark.png` — only if it beats the drawn one

The drawn icon already ships: four stars of different brightnesses joined by a gold line, with a faint
field behind them. A painted one only replaces it if it reads better at 48 px.

```
app icon, four stars of different sizes joined by a thin gold line into an
irregular four sided shape, on deep indigo, a few faint stars behind, flat,
minimal, centred, no text, --ar 1:1 --style raw --stylize 100
```

512, 192, and a **maskable 512 with the mark inside the central 80 percent**: Android crops maskable
icons to an arbitrary shape, and a corner radius over 50 in viewBox units collapses the tile to a
circle whose transparent corners composite to BLACK on an iOS home screen.

---

## What NOT to draw

- **No zodiac glyphs, no astrology.** This app is the real sky and somebody's own shapes.
- **No telescope, no observatory, no astronaut.** Nobody in this app is an expert.
- **No named constellation figures.** The whole point is that the official 88 are not here.
- **No lens flare, no nebula photograph, no Hubble colour.** The sky in the app is what a person sees
  from a field, which is faint white and blue and amber points on almost black.
- **No swirl or spiral galaxy.** The Milky Way in the app is a dim mottled band, because that is what
  it looks like from the ground.
