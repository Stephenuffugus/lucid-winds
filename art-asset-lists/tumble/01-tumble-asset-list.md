# TUMBLE — Asset List (September 17, 2026)

Google Doc (the copy Stephen works from, in Drive Github / tumble): https://docs.google.com/document/d/16FP7CNa4S5uWk-lceteNetc-82R8ZIoVe72jE8ldoGc/edit
Drive folder for the files: https://drive.google.com/drive/folders/1ilLNYWV5P-xiNoFFtTM3SK_d2BOxkrs9

What to make, in the order it pays off, with a paste ready Midjourney prompt for each, the format, and where it lands
in the game. Everything here is optional beyond section A; section A alone turns the placeholder socks into real ones.

Relax mode, four variations per prompt, pick one, upscale only the pick. Lock one suffix and one seed for the whole set
once the first sock looks right, so the eight socks read as one family.

**Delivery:** save each file with the exact name below into the Drive folder `Github / tumble`. When a batch is done,
download that folder as a zip and drop the zip into the repo's `assets/` folder the way the earlier art zips went in
(the Drive connector cannot fetch images over 2 MB). Tell me and I run the pipeline the same day.

---

## A. The eight sock references (Meshy makes the 3D from these). Highest value, do first.

One picture per silhouette. Meshy builds exactly what the picture shows, so the picture has to look like a real sock
lying flat, not a shape. The game paints every pattern itself, so the sock is plain.

Shared prompt body (change only the bracketed part):

```
top down photo of a single [SILHOUETTE] sock lying flat on a plain mid grey studio surface, empty with no foot inside,
cuff at the top, foot bent to the right so the sock makes an L, plain white cotton knit with a ribbed cuff, a visible
heel cup, a rounded toe and a few soft folds, no pattern, no logo, soft even light, no hard shadow, the whole sock
inside the frame with margin, product photography --ar 1:1 --style raw --s 150
```

| File | [SILHOUETTE] | Notes for the picture |
|---|---|---|
| `ref-ankle.png` | short ankle sock, no show height | leg about a third of the foot length |
| `ref-crew.png` | crew sock, mid calf | leg about as long as the foot |
| `ref-knee.png` | knee high sock | leg almost twice the foot, slight bunching at the ankle |
| `ref-toe.png` | toe sock with five separate toes | the toes must be visible; if Midjourney fuses them, try "five finger toe sock, toes spread" |
| `ref-baby.png` | tiny baby sock | chubby, short, thick ribbed cuff, rounded everything |
| `ref-slipper.png` | fuzzy slipper sock | thick fleece, rolled cuff, a visible sole |
| `ref-dress.png` | thin dress sock | long, slim, fine rib, smooth |
| `ref-novelty.png` | crew sock with a soft ridge along the top of the leg | a plain fabric ridge the game can turn into ears or a fin; no face, no colour |

Square, 1024 or larger, PNG. Grey background, not white (the sock is white). If a result shows a foot or a shoe, it is
a reroll. One good picture each is enough; the eight together cost 40 Meshy credits.

## B. Prop references (Meshy, second wave). The table today is flat primitives.

Same idea: one object, plain grey surface, three quarter view from slightly above, soft light, no text, no people.

```
product photo of a [PROP], alone on a plain mid grey studio surface, three quarter view from slightly above, soft even
light, no text, no hands, cozy home laundry style --ar 1:1 --style raw --s 150
```

| File | [PROP] |
|---|---|
| `prop-basket-wicker.png` | round wicker laundry basket with a rolled rim |
| `prop-hamper-plastic.png` | pastel plastic laundry hamper with vent holes |
| `prop-dryer.png` | mint green front load clothes dryer with a round glass door, door open |
| `prop-table.png` | wooden folding table with a green quilted mat on top |
| `prop-sockball.png` | a pair of socks rolled into a ball, the cuff tucked over, slightly squashed |

Later, the room (only if the first wave lands well): `prop-dresser.png` (seafoam painted dresser), `prop-radio.png`
(small wooden retro radio), `prop-plant.png` (potted monstera), `prop-lamp.png` (hanging pendant lamp, warm shade),
`prop-cat.png` (a loaf shaped sleeping cat).

## C. Store and portal art. Needed before a Play listing.

| File | Size | What it is | Prompt |
|---|---|---|---|
| `key-art.png` | 1024 x 500 (make 2048 x 1000 and I scale) | Play feature graphic and the store header. No text; I set TUMBLE in the game's typeface. | `a cozy laundry room in soft morning light, a mint green front load dryer with its round door open and a heap of colorful patterned socks tumbling out onto a wooden folding table with a green quilted mat, a wicker basket beside it, warm cream walls with a leaf wallpaper, painterly illustration, wide shot, no text --ar 2:1 --style raw --s 200` |
| `card-thumb.png` | 1080 x 1080 | The portal card (replaces the generated one). | the same scene, tighter, `--ar 1:1` |
| `icon-1024.png` | 1024 x 1024 | Play icon and home screen icon (the current one is generated). | `a single rolled sock ball, colorful stripes, soft rounded, centered on a warm cream background, flat illustration, no text --ar 1:1 --style raw --s 150` |
| `splash-portrait.png` | 1080 x 2400 | Boot screen behind the title (optional). | the room scene, portrait, the dryer centered, `--ar 9:20` |

## D. Audio (not Midjourney; his own)

- Six radio beats, one per station, or new station names with them. Loops or full tracks. They plug in as a data
  change (already built). Files into `_music-drop/` in the repo, not Drive.
- Sound effects are a Web Audio synth today (fabric shuffle, thwip, wooden basket thud, a soft huh, the dryer hum, a
  ding). If he wants real recordings the way FTW got them, say so and I source CC0 ones; nothing for him to make.

## E. Not needed from him

Hero socks (43 painted recipes), the 32 motifs, the card back, the share card, room decor drawings, the Clothesline
pegs: all generated by the game. Screenshots for the store come from the game's own tour at phone size once the socks
are real.
