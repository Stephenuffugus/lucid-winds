# BRAMBLEWICK — Boss & Ground Art (hand this straight to ChatGPT)

*Bramblewick grew from one arena into **five grounds**, each with its own boss. Two bosses
already have art (Grubfather, Stormwing). This list is the **four new bosses** plus the
**five ground backgrounds**. Every filename below is already wired into the game — the
moment a correctly-named file lands in `satellites/bramblewick/assets/`, the game uses it
instead of the placeholder shape. Until then it draws a procedural stand-in, so nothing is
blocking. Paint any subset, in any order.*

---

## SHARED RULES (paste into every prompt)
- **Flat magenta `#FF00FF` background** for the CREATURE sheet (I chroma-key it out), with a
  little even padding around each subject and narrow magenta gutters between cells. The five
  BACKGROUND images are full-bleed (**no magenta** — they fill the frame).
- **No** words, labels, numbers, UI, frames, or captions anywhere. **No magenta inside the art.**
- **View:** bosses seen from a **slight top-down game angle** (they loom over a plant on a floor),
  a clear readable silhouette at small size. Paint the bosses **bigger and heavier than a pest** —
  these are the set-pieces. No big drop shadows touching the magenta.
- **House style:** cozy-but-moody botanical storybook, **midnight-greenhouse** palette — deep
  greens, mossy near-black, warm gold, cream, restrained rose/ember. Soft top-down light, gentle
  hand-painted gouache texture, clean cartoon cel-shading. Menacing-cute, never grim. Same world
  as the rest of the Lucid Winds fleet.
- **Host rule:** keep every file **under 1600px** on its long side and reasonably small in KB.
- Export each cutout as a transparent PNG (or hand me the magenta sheet and I'll cut it).

---

## SHEET A — THE FOUR NEW BOSSES  ·  2×2 grid, 512×512 cells, flat magenta
Row-major, left→right. Paint each boss filling most of its cell.

| | Cell 1 | Cell 2 |
|---|---|---|
| 1 | `boss_tideshell` | `boss_broodmother` |
| 2 | `boss_frostmaw` | `boss_wiltqueen` |

**Identity notes** (the parenthetical colour is the placeholder tint — match its *mood*, you don't
have to match the hex):

- **`boss_tideshell`** — *The Sunken Beds boss.* A huge bog **matron**: a low, waxy **domed
  limpet/snail shield** clamped down over a soft green body, glossy and dripping with slime, small
  wary eyes peeking out from under the rim. Teal-green *(#4a8a76)*. Reads as slow, armored, patient.
  A pale rim-highlight around the shell sells the "cracks when you hit it" armor.

- **`boss_broodmother`** — *The Hothouse Understory boss.* A **Cordyceps Broodmother**: a bulbous
  fungal **spore-sac body**, dusky violet *(#9b7ad6)*, ringed by radiating pale **spore stalks /
  little asters**, a faint inner glow, two dark watchful eyes. Eerie-regal, floating/rooted.

- **`boss_frostmaw`** — *The Long Dark Conservatory boss.* A huge **frost grub** — the same body
  plan as the Grubfather but **frozen over**: pale blue-grey *(#5a7f92)* armored plates rimed with
  frost and icicles, cold breath, a blunt chewing face, small hard eyes. Cold and tanky.

- **`boss_wiltqueen`** — *the true final boss.* **The Wilt Queen**: a regal **wilted-flower
  grub-queen**, dusk purple *(#6a5a7a)*, wearing a **crown of drooping, browning petals**, sharp
  sad eyes, a trailing withered gown of leaves. The end of the game — give her the most polish.

---

## SHEET B — THE FIVE GROUND BACKGROUNDS  ·  full-bleed, NO magenta
One **top-down floor** image per ground. Same rule as the arena floor already in the game: dark and
readable so the bright pests/companions/reactions **pop** over it, a gentle vignette, botanical
texture, a framing of leaves/flora at the edges. Portrait-ish, **~1120×1400**, under 1600px.
Each is **optional** — the game tints the floor with the ground's palette until its image lands.

| ground | file | mood / palette |
|---|---|---|
| Greenhouse Floor | `bg_greenhouse.jpg` | dark mossy soil, sage flecks — the calm home turf (matches the current default floor) |
| The Sunken Beds | `bg_sunkenbeds.jpg` | wet black peat, still bog water, teal sheen, sunken planting beds |
| The Sundrift Meadow | `bg_sundrift.jpg` | warm gold dust, sun-baked dry cracked earth, dappled shade patches |
| The Hothouse Understory | `bg_understory.jpg` | violet gloom, glowing spores, pale fungal shelves and roots |
| The Long Dark Conservatory | `bg_longdark.jpg` | icy blue-black, frost rime on the glass, cold starlight, dark ice |

---

## SUGGESTED ORDER
1. **Sheet A** (the four bosses) — biggest visual payoff; one boss per ground.
2. **`bg_sunkenbeds` / `bg_understory` / `bg_longdark`** — the three most distinct grounds first.
3. The remaining two backgrounds whenever.

Hand me any batch (magenta sheet or transparent PNGs) and I'll cut, quantize, cache-bust and wire it.
