# Merge & Blast (working title — Stephen names it)

**Source request:** Penny (via Jessie doc, 7/16/2026) — plays "Merge and Blast" on playhop.com. "5 rows across & 7 rows down of squares. Each square is a multiple of 2. 2 is one color, 4 is another, 8 a new color… click a color & the blocks disappear, but the blocks have to be touching the same number/color. Once it disappears, the number jumps to the next highest number. Goes up to numbers well into the thousands. Keeps track of how many levels you complete."

**Genre:** tap-group number-merge collapse (2048-family × match-group). NON-botanical theme per the Jul-10 ruling; kid-friendly, chunky, readable.

## Core loop
- Grid: **5 columns × 7 rows** of tiles, each a power of 2 (2, 4, 8 … 8192+). One color per value (loop the palette above 4096 with a badge glyph).
- **Tap any group of ≥2 orthogonally-touching tiles of the same value** → all pop; ONE tile of the **next value** lands at the tapped cell. Rest fall (per-column gravity); new tiles feed in from the top of each column (weighted low values, bias toward values currently on the board so groups keep forming).
- **Cascades:** if the merged/settled tiles form new touching groups of ≥5, auto-chain? NO — chains stay manual (Penny's version is manual; keep player agency), BUT falling tiles that land to form a group of same-value ≥4 flash a hint glow.
- **Level goals:** each level has a target ("make a 256", "clear 40 tiles", "make two 128s"). Complete → level up, +1 to the persistent level counter (the thing Penny tracks). Board carries over between levels; every 5th level clears the bottom row as a breather.
- **Fail state:** none hard — but a "no possible group" board triggers a free shuffle (guaranteed by construction: feeder biases mean this is rare; count shuffles in stats).

## Numbers into the thousands
Value cap none; render 1024+ as "1K","2K","4K","8K". A first-time-value celebration (tile bursts + banner "FIRST 512!") — this is the retention hook.

## Modes
- **Journey** (default): the level ladder with goals, persistent level count front-and-center on the title.
- **Daily Grid** — seeded identical start board + fixed goal; one lock-in/day (house daily pattern; Listdle-eligible).
- **Zen** — endless, no goals, no sunbeams.

## House integration (non-negotiable conventions)
- Single self-contained file `satellites/<slug>/index.html`, 540×960 #stage, screens pattern (s-title/s-play/s-how/s-set), tap() helper, LS-guarded saves.
- Sunbeams via `/sunbeam-sdk.js` + `_sbCapEarn` — 30/day/game cap, 12/run standard: +2 per level cleared, +4 first daily.
- Studio music button (SWSPlayer standalone pattern, embed-guarded) + PWA (manifest, icons, network-first sw.js) + in-play home button from day one.
- DEV hook `?mbtest=1` → window.MB_DEV {start, state, tap(r,c), step, seedBoard, goalCheck, earnTest} — headless-verifiable from the first commit.
- Colorblind: value NUMBER is always on the tile (color is redundant, per colorblind=symbols rule).
- Portal wiring: GAMES/FEATURED row + thumb (≤150KB/≤480px) + ALIASES entry ('merge and blast 2048 number blocks pop').
- Art: procedural first (flat rounded tiles, chunky numerals); art pack later via art-asset-lists (non-botanical direction).

## Open for Stephen
Name (non-botanical, kid-catchy — candidates: "Blast Doubler", "Pop2", "Boomstack"); palette direction; whether Journey levels gate any cosmetics.
