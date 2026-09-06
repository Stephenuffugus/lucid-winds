# Swell art assets

**Swell ships with no image files and looks finished**, because the aurora is generated from the
engine's own state. Everything below is an upgrade and the app never waits on it.

Prompts to paste are in `plans/swell/ART-PACK-SWELL.md`.

## What the code reads

| Path | What it is | If it is missing |
|---|---|---|
| `art/plates.json` | which mood plates have actually been delivered | it ships with an empty list, and the picker cards are type on a dark card, which is what ships today |
| `art/mood-dawn.jpg`, `art/mood-storm.jpg`, `art/mood-lullaby.jpg` | behind the three picker cards at 45 percent | only loaded if listed in `plates.json`, so a missing plate costs nothing and puts nothing on the console |

**When a plate is delivered:** drop the file in `art/` and add its mood id to the `have` list in
`art/plates.json`. That is the whole wiring.

## What Stephen delivers

| File | Delivered | In game |
|---|---|---|
| `mood-dawn.png`, `mood-storm.png`, `mood-lullaby.png` | 4:3 | `art/mood-<name>.jpg` at 1200x900 q80. **The host resizes anything over 1600 px on a side** |
| `icon-mark.png` | 1:1 | 512, 192, and a maskable 512 with the mark inside the **central 80 percent** |

## What is generated, and by what

| File | Made by |
|---|---|
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | `node tools/icons.mjs`: bands of light rising out of one point, warm at the bottom and cool at the top, the way the orchestra stacks |
| `docs/thumb.png` | `node tools/thumb.mjs`, from the RUNNING app: two real fingers held until the whole orchestra is in, chrome hidden. It refuses a tile with no light in it |
| `docs/shots/*.png` | `node tools/shots.mjs` at 412, 375, 320 and 915x412, under 200 KB each, and it measures the battery rule at every one |
| `docs/shots/p0-swell.wav` | `node test/render.mjs`. **This is the real shot.** A game you cannot photograph gets listened to instead |

## The palette, which is the whole look

```
the room          #08070C     near black, and most of the screen stays that way
strings           #E8B36A     amber, a broad low bed
choir             #A8D8F0     ice blue, a tall thin thing standing over the top
brass             #F2D06B     gold
timpani           #8C2F39     deep red, a pulse along the floor
the wash          per mood, low, in the bottom two thirds only
```

An aurora is light IN a dark sky. The single most important rule in this render is that the top half
of the screen stays dark: the first version filled the whole screen and read as a striped rectangle.
Each curtain is a radial gradient squashed horizontally, so it is soft on every edge, and the
sections ADD their light rather than paint over each other.
