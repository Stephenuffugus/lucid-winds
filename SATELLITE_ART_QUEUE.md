# SATELLITE ART QUEUE — one game at a time
*The master index of every art asset the new satellites still want, so you can hand
ChatGPT one list at a time. Last built: 2026-07-06.*

Every new satellite ships **100% playable with canvas-drawn (procedural) art** — so
**nothing here is blocking**. Each asset is an optional drop-in upgrade: the moment a
correctly-named PNG exists, the game uses it; if it's missing, the code keeps drawing
its own version. So paint any subset, in any order, and hand me batches whenever.

---

## THE FLEET CONVENTION (read once)
- **Deliver a transparent PNG, OR paint on a flat magenta `#FF00FF` background** and I'll
  chroma-key cut it to transparent (same as every other satellite). Full-bleed backdrops
  don't need magenta — they fill the frame.
- **Paint big, never pre-shrink.** Hi-res downscales clean; upscaling looks bad. Sizes are
  listed per asset in each game's list.
- **Host rule:** lucidwinds.com down-samples anything over **1600px** on its long side and
  can serve stale copies. Keep every file **under 1600px** and reasonably small in KB. I
  version-bust each asset on deploy.
- **No text baked into the image** (except a logo/wordmark that's meant to be text).
- **House style for all of them:** cozy children's-storybook, soft painterly/gouache, warm
  rim light, big readable silhouettes, a little glow. **Midnight-greenhouse palette:** deep
  near-black backgrounds, sage green, warm gold, cream, a touch of rose. Match the Lucid
  Winds card art mood. (Each game's file repeats a tuned prompt seed you can paste.)

---

## ⭐ START HERE — portal thumbnails (tiny art, biggest visibility)
These are the game cards in the portal grid. Until a card lands, the game shows only its
emoji glyph and reads as unfinished. **~480×480, ≤150 KB each**, a dynamic hero shot.
Drop into `portal-assets/thumbs/`.

| Game | file to make | glyph shown now | hero-shot idea |
|---|---|---|---|
| **Sprout Dice** | `portal-assets/thumbs/sprout-dice.jpg` | 🎲 | plant-face dice mid-roll over a target, thorns striking a pest |
| **Petal Plunge** | `portal-assets/thumbs/petal-plunge.jpg` | 🛷 | leaf-sled carving downhill through dewdrop gates, the Gnome looming behind |
| **Bramblewick** *(when it ships)* | `portal-assets/thumbs/bramblewick.jpg` | (not in portal yet) | a familiar-swarmed sprout in a bullet-hell bloom of status reactions |

*(Garden Guard, Burr Blast, Sproing, Budburst, Bloom Breaker, Pong Arena, Power Scalers,
Dragon Philosophy, Pit Bike Rally all already have cards.)*

---

## THE FULL PER-GAME LISTS (hand ChatGPT one file at a time)

### 1. Petal Plunge  → `satellites/petal-plunge/ASSET_LIST.md`
Brand-new botanical SkiFree. The star is **the Gnome** (feral chaser — the money shot).
- **Riders (13)** `rider_<id>` @512×512 — the critter on the sled, seen from behind/above
- **Sleds (9)** `sled_<id>` @512×640 — the board you ride (leaf, petal, bark, lily pad…)
- **The Gnome** `gnome` @512×640 — red hat, wild beard, glowing eyes, reaching, running
- **Obstacles (13)** `obs_<kind>` @256×256 — bushes, trees, toadstools, thorns, logs, ramp
- **Biome backdrops (5)** `bg_<id>` @1080×1920 — meadow, bramble, mushroom, thornfall, night
- **Suggested order:** Gnome → default rider+sled (sprout, leaf) → portal thumb → the rest.

### 2. Burr Blast  → `satellites/burr-blast/design/ASSET_LIST.md`
Physics slingshot (Angry-Birds soul). Tiered, biggest lift first.
- **TIER 1:** `logo.png`, 4 world backdrops (portrait, full-bleed), hero + boss + pests
- **TIER 2:** the 6 seed icons (HUD + shop)
- **TIER 3:** the 7-panel intro comic (Bramble vs the Weevil King)
- **TIER 4 (nice-to-have):** 3 new seeds, N-P-K nutrient icons, 10 companion portraits,
  8 relic icons, currency/run icons, expedition node art
- Game is fully canvas-drawn today; every slot has a fallback.

### 3. Garden Guard  → `satellites/garden-td/ART_ASSETS.md`
Tower defense. **Note:** the 4 map backgrounds are now **optional** — I gave each map a
distinct procedural look (colour wash + off-path decor + path material), so the "bare
canvas maps" gap is closed. Painted maps would still lift it, but they're no longer a hole.
- **Biggest win first:** 9 tower bodies (96×96) → the whole board changes
- **13 pest walk-strips** (48×48) + **4 boss sprites** (160×160: aphidqueen, slugking,
  moonmoth, thornwarden — the last three are the new world bosses I just wired)
- **18 cultivar heads** (80×80) — the upgrade payoff
- **FX + the 4 reaction bursts** (steam / wildfire / bloomrot / corrode) — the signature moment
- **Keeper poses**, **UI icons + status badges** (readable by shape, colorblind-safe)
- 4 map backdrops (540×960) — now optional polish

### 4. Dragon Philosophy  → *(spec lives in its own source repo, not here)*
This one is a **built React/Vite bundle** (`satellites/dragon-philosophy/`), so painted art
is **not a drop-in** — it has to be added in the source project and rebuilt (`npm run build`
base:'./'), then re-vendored. The illustration set it wants (all placeholders today):
**8 dragon-patron portraits, 10 threat illos, 17 chase-card illustrations, ~640×512.**
When you want to tackle it, we pull the source repo, add the art there, rebuild, re-vendor.
Lower priority than the drop-in games above for that reason.

---

## ALREADY-SUPPLIED ART (not a ChatGPT job — a cut+wire job for me)
- **Pit Bike Rally** — the Jul-04 root zip *"In game art-20260704…zip"* IS its Wave 1–6 art
  pack (bikes, terrain tiles, FX strips, props, logo, 3 scene bgs). It needs repacking into
  the atlas + wiring, not generating. That's on me, not ChatGPT.
- Loose root PNGs `file_…6ca471f6….png` (Garden Guard contact sheet) and
  `file_…4eec722f….png` (Pit Bike Rally contact sheet) are manifest/reference sheets, not
  final assets.

## NEEDS NOTHING (zero-asset, complete as-is)
Sproing, Budburst, Bloom Breaker, Pong Arena, Power Scalers — all colour/canvas-driven and
finished-looking. (They only ever want optional flourish art, never required art.)

---

## RECOMMENDED WORK ORDER
1. **Thumbnails** (Sprout Dice, Petal Plunge) — smallest art, every portal visitor sees it.
2. **Petal Plunge — the Gnome + default rider/sled** — brand-new game, art has the most upside.
3. **Garden Guard tower bodies** — 9 pieces, whole board transforms.
4. **Burr Blast TIER 1** — logo + 4 backdrops + hero/boss.
5. Everything else, in whatever order feels fun. Each finished piece just quietly makes a
   game prettier — none of it blocks anything.

Hand me any batch when it's ready (transparent or magenta-bg) and I'll cut, wire, cache-bust,
and re-vendor it — one game at a time.
