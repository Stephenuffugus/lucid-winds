# Marrowdeep, Art Pack (five sheets plus six boss plates, paste ready)

**Doc in 012Assets, folder "newest request again":**
https://docs.google.com/document/d/1-5psBUdMzjXlAUN2wXoHogHkPP0uBXe-_wUpew9Gd_g/edit

**For:** Stephen's Midjourney month. Relax mode, four variations per prompt, upscale only the pick. **The game ships
with every one of these drawn by code** (flat SVG symbols); a sheet replaces its symbols one for one when it lands.
Bring the PNGs to `satellites/marrowdeep/art-drop/` (never overwrite a raw file); the ART-LEDGER row moves to DROPPED.

**The look, in one line:** bone and brass on ink; a cold, wet, old place under the world; flat vector, tight
palette, no perspective, no faces.

**Palette to hold across every sheet:** ink `#0c0a10`, bone `#e6dcc6`, marrow red `#a8322e`, brass `#c9a24a`,
lantern `#e8b45c`. Stats: ember `#c8553d`, tide `#5fb3a1`, violet `#8f7bd6`, brass `#d9b24c`.

**Locked suffix for every Marrowdeep prompt** (reuse the seed of the first pick):

```
--style raw --s 120 --chaos 4 --no text, letters, numbers, watermark, faces, photo, gradient, 3d
```

## Sheet 1 of 5: The dice and the four stats (1:1)

File back: `dice-stats.png`. Nine marks on pure ink in one grid: five polyhedral dice seen flat (a triangle, a
square, a diamond, a kite, a pentagon) in bone line, then four stat glyphs, one each: a fist as three bars (ember),
a leaning line with a dot (tide), an eye as a lens (violet), a flame in a ring (brass).

```
flat vector icon sheet on a pure near black background, three by three grid, five polyhedral dice drawn as simple flat outlines in bone white: a triangle, a square, a diamond, a kite, a pentagon, no pips, no numbers; then four glyphs each one solid colour: a clenched fist made of three horizontal bars in ember red, a leaning line with a single dot in sea teal, an eye drawn as a lens in dusty violet, a small flame inside a ring in old brass; thick even line weight, generous spacing, no shading --ar 1:1
```

## Sheet 2 of 5: Eight portraits (1:1)

File back: `portraits.png`. Eight head and shoulders SILHOUETTES on pure ink, one per Origin, in bone: hooded
(Hearthborn), ash streaked bare head (Ashwalker), reed braided hair (Fenwise), helmed with a rivet line (Ironbound),
wind blown and turned away (Straycall), a lantern held up beside the head (Lanternborn), salt crusted collar
(Saltblood), plain and unmarked (Unmarked). The code tints them by Calling; keep them one flat colour.

```
eight flat silhouette portraits, head and shoulders, bone white on a pure near black background, arranged two rows of four with space between: a hooded figure, a bare headed figure with ash streaks, a figure with reed braided hair, a helmed figure with a line of rivets, a wind blown figure turned half away, a figure holding a small lantern up beside the head, a figure with a salt crusted high collar, a plain unmarked figure; no faces, no eyes, pure flat shapes, clean edges --ar 1:1
```

## Sheet 3 of 5: The icon set (1:1)

File back: `icons.png`. Twenty nine small marks in bone on ink, five rows: six challenge shapes (a door, two chain
links, two hands passing a rope, a keyhole, a coin with a cut, an arch); eight gear slots (a coronet, a breastplate,
gauntlets, greaves, a cleaver, a locket, a warding disc, a small tally stick); six Sigil marks (a hollow circle,
rust flakes, a shiver line, a hook on a chain, a cracked ice line, a bound cloth); nine status marks (a drop, a
plate, a scar line, a laurel, a bone, a burst, a step, an open hand, a stool).

```
flat vector icon sheet, twenty nine small pictograms in bone white on a pure near black background in five neat rows: a door, two chain links, two hands passing a rope, a keyhole, a coin with a notch, an arch; a small crown, a breastplate, a pair of gauntlets, a pair of greaves, a cleaver, a locket, a round warding disc, a notched tally stick; a hollow circle, three rust flakes, a jagged shiver line, a hook on a short chain, a cracked ice line, a folded blindfold cloth; a single drop, an armour plate, a short scar line, a laurel sprig, a single bone, a small starburst, a single stair step, an open hand, a three legged stool; uniform line weight, even spacing, no shading --ar 1:1
```

## Sheet 4 of 5: The Wall and the Hall (9:16)

File back: `hall.png`. A backdrop for the Hall and the Wall screens: a long stone wall under the earth with rows of
carved name plates, most empty, lit from one low lantern; the code lays the lines over it. Keep the middle third
dark and plain so text reads.

```
a long ancient stone wall deep underground with rows of small empty carved name plates, lit only by one low brass lantern on the left, near black shadows, bone coloured stone, thin lines of red mineral in the cracks, flat painted style, tall portrait composition, the middle of the image dark and plain --ar 9:16
```

## Sheet 5 of 5: Icon mark (1:1)

File back: `icon-mark.png`. The PWA icon, only if it beats the drawn one; the mark inside the central 80 percent.

```
app icon, a single flat bone white eight sided die seen from above on a near black ground with one small red dot at its centre, flat painted style, centred, generous margin, no border, no text --ar 1:1
```

## Boss plates, six sheets (16:9), one per boss, three Aspects each

File back: `boss-<id>.png`. Each sheet is three plates side by side on ink, each plate one Aspect as a THING (never a
creature with a face), in bone with one accent in the boss's tint. The names and lines are in
`plans/marrowdeep/data/bosses.json`; write each boss's three Aspect names into the prompt below where the brackets
are, in order.

```
three flat painted plates side by side on a pure near black background, each plate a single object in bone white with one accent colour: [aspect one], [aspect two], [aspect three]; old, wet, underground, chains and salt and rust, no creatures, no faces, no text, flat vector style, even spacing --ar 16:9
```

## Delivery table

| Sheet | Ratio | File back | Where it lands |
|---|---|---|---|
| 1 Dice and stats | 1:1 | `dice-stats.png` | nine symbols in `index.html`, cut by Fable |
| 2 Portraits | 1:1 | `portraits.png` | eight symbols, cut by Fable |
| 3 Icon set | 1:1 | `icons.png` | twenty nine symbols, cut by Fable |
| 4 Hall | 9:16 | `hall.png` | `satellites/marrowdeep/art/hall.jpg` under 150 KB, the Hall and Wall backdrop |
| 5 Icon mark | 1:1 | `icon-mark.png` | `icon-512.png`, `icon-192.png`, `icon-maskable-512.png` |
| Boss plates | 16:9 | `boss-<id>.png` | three symbols per boss, cut by Fable |
