# Bramble Court — Art Direction

**Game:** `satellites/bramble-court/index.html` — a 3×3 grid card duel in the Triple Triad / Queen's Blood mold. 40 collectible creature cards (the Lucid Winds companion roster), 10 rival courtiers, Rich Soil squares (+1 fertile / −1 thorn), house rules SAME and PLUS on later rivals.

**What ships today:** every card portrait is procedural canvas art (silhouette + palette per creature, drawn by `portrait()` and cached as dataURLs). The pack below replaces those placeholders and dresses the table. The game is fully playable without any of it.

---

## Style options (pick one; prompts in sheets 01-06 bake in the pick)

### Option A — GILDED BESTIARY (recommended)
Illuminated-manuscript trading cards. Aged vellum card faces, burnished gold-leaf rarity borders, creatures as woodcut engravings with a single rich accent color per card, heraldic side emblems (leaf sigil vs thorn sigil). The court board is dark walnut inlaid with brass rules. Feels like a card game found in a monastery library: premium, collectible, timeless. Not botanical, not childish — museum-case energy.

### Option B — NEON MENAGERIE
Synthwave arcade cabinet. Chrome card frames, creatures as neon rim-lit vector beasts on near-black, CRT scanline table felt, rarity shown by neon tube color temperature. The boldest departure from every other Sky Wolf pack; reads instantly on a phone screen.

### Option C — INKSTONE COURT
East-Asian ink-brush. Creatures in confident sumi strokes on warm paper, red seal-stamp emblems for the two sides, slate-stone board with water-etched soil squares. Calm, mature, beautiful in motion when cards flip.

**Recommendation: A (Gilded Bestiary).** It matches the "court" fiction, sets collectible-card expectations players already have, and no other pack in the catalog occupies the illuminated-manuscript space. B is the fallback if Stephen wants maximum contrast with the rest of the portal.

---

## STYLE BLOCK (baked into every sheet prompt below)

> Illuminated-manuscript trading card art, aged vellum texture, burnished gold leaf accents, woodcut engraving linework, single rich accent color per subject, deep walnut and brass surroundings, soft candlelit shading, crisp silhouettes readable at 90px, no text anywhere in the image, flat magenta #FF00FF background for knockout.

⚠️ Magenta knockout: keep every subject color at least 25% away from pure #FF00FF (no hot pinks/roses touching the key) or the cutter will eat it.

---

## Cosmetics / economy recap (verified vs live code — `WARD` array + claim flow)

- **Cards ARE the economy:** first win vs each of 10 courtiers = claim 1 of 3 shown from their signature deck (duplicate-protected); every 3rd win = seedling booster (2 unowned commons, pity-ladders upward). No lootboxes, no purchases.
- **Table felts:** Midnight Court (free) · Rose Court (beat 5 courtiers) · Gilded Court (beat all 10). Applied as `#stage` background classes `felt-rose` / `felt-gild`.
- **Card backs:** Bramble (free) · Koi Pond (daily streak 3) · Beholder's Eye (own The Beholder). Applied as `.cardel.back` classes `bk-koi` / `bk-eye`.
- Sunbeams: journey first-win 2 / replay 1 / daily 3 / draft 2 / zen 0; 30/day cap (`sw_sb_bramblecourt`).

## Sheets

| # | File | Contents |
|---|------|----------|
| 01 | `01-bramblecourt-frames.md` | Card frames ×5 rarities, side frames + emblems, 3 card backs, claim glow |
| 02 | `02-bramblecourt-creatures-common.md` | 16 common creature portraits |
| 03 | `03-bramblecourt-creatures-mid.md` | 10 uncommon + 8 rare portraits |
| 04 | `04-bramblecourt-creatures-high.md` | 5 epic + The Beholder + 10 rival crests |
| 05 | `05-bramblecourt-board.md` | Court board, fertile/thorn squares, 3 table felts |
| 06 | `06-bramblecourt-ui-fx.md` | Buttons, banners, flip burst, claim sparkle, rule chips |

## Wire notes (against shipped code)

- Portraits: `portrait(idx)` currently paints canvas and caches in `_PORT`. To wire art: draw the sheet crop into the same canvas instead of the procedural branch — the dataURL cache, `cardEl()` background-image path, dot-grid pip overlay and name plate all stay. Keep the 168×210 aspect.
- Edge pips: numerals + 3×3 dot grids are ENGINE-RENDERED (honest values, fertile/thorn shifts shown by the `+1`/`−1` badge). Portraits must leave the four edge zones (top/bottom center 34×28px, left/right middle 30×34px) quiet.
- Ownership: `.cardel.own1` (rounded sage + ✿) vs `.cardel.own2` (angular rust + ▲) — side is carried by FRAME SHAPE + emblem, not color alone. Frame art must preserve that silhouette difference.
- Board: `.bcell` 148×152, `.bcell.fert` / `.bcell.thorn` tints + `RICH +1` / `THORN −1` engine text tags stay on top of any tile art.
