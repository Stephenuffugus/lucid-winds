# Swell art pack

Four sheets, paste ready. **The app ships finished without any of them**: the aurora is generated
from the engine's own state and stays generated. Only the three mood plates change what a player
sees, and they sit behind the picker cards at 45 percent. `satellites/swell/docs/ART_ASSETS.md` says
exactly how a delivered plate gets wired in, which is: drop the file in `art/` and add its mood id to
`art/plates.json`.

The `--ar` and `--style` flags are Midjourney syntax, not player copy.

---

## 1. `mood-dawn.png` — behind the Dawn card

Sits behind small type at 45 percent, so it must be quiet, low contrast and empty in the middle.

```
the first light over a wide flat country, low warm cloud, no sun disc, no
horizon detail, almost no contrast, soft amber and grey, painterly, empty in
the middle, --ar 4:3 --style raw --stylize 150
```

## 2. `mood-storm.png` — behind the Storm card

```
weather coming in over open water, low dark cloud with one bright break in it,
no lightning, no rain, no boat, cold grey and a little brass, almost no
contrast, empty in the middle, --ar 4:3 --style raw --stylize 150
```

## 3. `mood-lullaby.png` — behind the Lullaby card

```
a dark room late in the evening with one warm lamp out of frame, soft shadow on
a wall, no furniture, no person, no window, very low contrast, warm grey and
faint amber, empty in the middle, --ar 4:3 --style raw --stylize 120
```

All three delivered 4:3. They go in as `art/mood-<name>.jpg` at 1200x900, q80. **The host resizes
anything over 1600 px on a side**, so never deliver larger.

---

## 4. `icon-mark.png` — only if it beats the drawn one

The drawn icon already ships: bands of light rising out of one point, warm at the bottom and cool at
the top, which is how the orchestra stacks. A painted one only replaces it if it reads better at
48 px.

```
app icon, five bands of light rising from a single point at the bottom, amber at
the base going to pale blue at the top, on near black, flat, minimal, centred,
no instrument, no note, no waveform, no text, --ar 1:1 --style raw --stylize 100
```

512, 192, and a **maskable 512 with the mark inside the central 80 percent**: Android crops maskable
icons to an arbitrary shape, and a corner radius over 50 in viewBox units collapses the tile to a
circle whose transparent corners composite to BLACK on an iOS home screen.

---

## What NOT to draw

- **No instrument.** No violin, no conductor, no baton, no sheet music, no piano. Nobody in this app
  is a musician and the whole promise is that you do not need to be.
- **No waveform, no equaliser bars, no spectrum.** Those are pictures of audio software.
- **No face, no hands, no figure.** The only hand in this app is the player's own.
- **No aurora photograph.** The aurora in the app is generated and it is stylised; a photograph of a
  real one behind a picker card would promise something the screen does not do.
- **Nothing busy in the middle of a plate.** Small type sits there.
