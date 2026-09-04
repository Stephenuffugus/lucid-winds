# Verified structural facts (measured this session, each with its command)

## The catalog
- 188 carded: 121 satellite cards + 67 native `/play/` games. 161 openable, 27 workbench-gated.
  `node scripts/catalog.mjs`
- Gated games are hidden behind `dev-gate.js`, which short-circuits on
  `localStorage.sws_dev_ok === '1'`. Set that and all 27 open.

## The 66 native games share ONE skin  ← highest leverage finding
- Every `/play/<id>.html` is a ~2.8KB shell. It links `/play/shell.css` (11.5KB) and
  `/shared.css` (324KB), then `/games/<id>.js`.
- The entire native background is **one line**: `play/shell.css:32`
  `background: radial-gradient(1200px 600px at 70% -10%, #1a2a20 0, var(--shell-bg) 60%);`
  All 66 games sit on that same dark-green vignette. No imagery anywhere.
- Only 2 of 66 native games declare any `background-image` of their own.
- Art inventory of the 66 (from `games/<id>.js` + `assets/games/<id>/`):
  - **10 have real painted art**: petalmatch (271 files), chess (221), merge (66),
    memory (38), flood (13), pipe (9), simon (8), sokoban (7), lights (3), c4 (3)
  - **19 reference exactly one shared image** (`assets/games/new-game-btn.png` or a
    deck suit glyph) — effectively art-free
  - **37 reference no art file at all**: song, breathing, seedtoss2, storyseeds,
    stonegarden, rhythmvine, spider, pyramid, tripeaks, golf, mines, sudoku, wordsearch,
    rootrush, hanoi, slider, colorsort, petalfall, gardenlines, kakuro, mosaic, rootflow,
    rootmaze, sprout, vinewords, battleship, seedsow, vinecross, livingstones, trellis,
    set, dailybloom, recall, pottingbench, yahtzee, farkle, dewtrail
  - So **56 of 66 natives are effectively art-free**.
- 12 of the 66 live in `games/_inline/` rather than `games/`: pompond(ext), bloomwheel,
  picross, sokoban, mastermind, checkers, reversi, backgammon, set, yahtzee, farkle,
  doubleshutter.
- Chess proves the ceiling: painted piece art, wooden board, Celtic frame, green fireflies.
  Same shell, same CSS — the difference is entirely its art folder.

## Portal card art (the grid is the first thing anyone sees)
- Satellite cards carry an explicit `thumb:` field with an emoji `ic:` fallback.
  **0 broken thumb paths.** 79 thumbs are >=20KB, **37 are under 20KB**,
  **5 have no thumb at all and render as a bare emoji glyph**:
  Twin Lanterns 🏮 · Whack Box 🎪 · Sprout Dice 🎲 · Rootbound 🪴 · Jade Garden 🀄
- Native cards pull `portal-assets/screenshots/<id>.<ext>`. **0 missing.** 7 are under 20KB:
  Lights Out 14KB · 15 Puzzle 15KB · Flood Fill 6KB · Vine Puzzle 14KB · **Chess 9KB** ·
  Four in a Row 7KB · Dew Trail 15KB.
  Chess is the best-looking game in the fleet and has the 3rd-smallest card.

## Asset weight
- `assets/games/` is **387MB**.
- **Queen Bee (`games/pollen.js`) ships its masters as live art.** 101 PNGs at 1024x1024,
  1.5-2.0MB each, in `assets/games/masterpollinator/` (135MB). No downsized variants exist
  on disk, so a Splendor-style board showing a dozen cards pulls 20MB+ on a phone.
  **This is a real player-facing perf bug**, and the only one of its kind found.
- The memory game is NOT the same problem: `games/memory.js` references only the
  240x240 `-card.png` cuts (1.8MB shipped). The 86MB of 1968x1968 masters sit beside them
  unreferenced — repo weight, not page weight.
- `assets/games/pipe/repello/` is ~16MB of raw phone photos
  (`PXL_20260414_050444039.MP.jpg` and friends), referenced by nothing in any js/html/css.

## Existing convention to feed (do not invent a new one)
- Per-game art sheets already live at `satellites/<slug>/ART_ASSETS.md`, written from the
  code with sizes measured off the source. 10 exist: blackout, conduit, deepwell, garden-td,
  hunch, keepsies, parallel, siege, tangent, wireworm.
  Others use PROMPTS.md (bloomzap, petalvex, rootbound, sprout-dice) or bespoke names.
- Fleet art convention (`SATELLITE_ART_QUEUE.md`): transparent PNG or flat magenta #FF00FF
  for chroma-key; paint big, keep under 1600px long side; no baked text; midnight-greenhouse
  palette; cozy storybook / soft painterly / warm rim light.

## "Old" = first commit date, not last touched
- A Sep 02 fleet sweep touched nearly every game, so `git log -1` is useless for age.
  First-add dates are in `created.txt`. The April 3 2026 batch is the oldest native cohort
  (chess, c4, flood, freecell, golf, hanoi, klondike, lights, memory, merge, mines, pipe,
  pyramid, simon, song, spider, sudoku, tripeaks, wordsearch...).

## Capture method (so the judgements are trustworthy)
- 375x667, Pixel 7 UA, isMobile+hasTouch, deviceScaleFactor 2. Three frames per game:
  boot, after advancing into play, and a few seconds later.
- The advancer taps only controls that pass `elementFromPoint` containment, so it never
  "clicks" a covered control. It skips How-to-play/rules/back/all-games. It detects
  navigation out of the game and returns.
- Traps hit and fixed while building it, each of which would have poisoned the list:
  - `?dev=1` does NOT open gated games; without `sws_dev_ok` all 27 photograph as the same
    "IN DEVELOPMENT" card and read as 27 identical broken games.
  - A blind centre-tap plus Escape navigated 7 games out to the arcade portal; those frames
    would have been filed as "this game is a wall of text".
  - "How to play" matches /play/, so the advancer kept opening the instructions it was
    trying to skip.
  - `catalog.mjs` builds every native URL as `/play/<id>.html` and ignores row field 5, so
    Pom Pond (an external app at pom-pond.web.app) looks like a missing file. It is not.

## The one-line hook that unlocks backdrops for all 66 natives
- `play/shell.js` already knows the game: `global._a = LW_PLAY.id` (line 436), and its `init()`
  adds a `game-active` class to `<body>` at DOMContentLoaded.
- So `document.body.setAttribute('data-game', LW_PLAY.id)` in that same init, plus one rule in
  `play/shell.css`, gives every native game a drop-in painted backdrop by filename convention
  (`/assets/games/bg/<id>.jpg`), falling back to today's gradient when the file is absent.
- That is the highest-leverage single change found: it turns "66 games share one gradient" into
  "paint a file, that game has a backdrop", with no per-game code.

## Art hooks already wired and waiting for files (paint the file, it appears)
Found by watching 404s during capture, then confirmed on disk:
- **glyph-forge** — `satellites/glyph-forge/art-slots/` holds only `.gitkeep` + the 2 PWA icons.
  The game requests `title-mark.png`, `rune-roll.png`, `rune-hollow.png`, `rune-gust.png`,
  `enemy-cinder.png`. Brief already written: `ART_ASSETLIST.md`, `ART_CARDLIST.md`,
  `ART_DIRECTION.md`, `ART_SHOTLIST.md`.
- **tarot-run** — `satellites/tarot-run/art-slots/` holds ONLY `.gitkeep`. Requests
  `title-mark.png` and `icon-192.png`. **The missing icon-192.png is also a live PWA bug**:
  an installed Tarot Run has no icon. Brief exists: `ART_DIRECTION.md`.
- **tomato-man** — `satellites/tomato-man/art/` DOES NOT EXIST. Requests `art/hero/tomato_body.png`
  and `art/ui/logo.png`. Brief exists: `ART-NEEDED.md`.
- Small code bug in the same family: glyph-forge requests `enemy-{id}.png` and tarot-run
  `enemy-?.png` literally, i.e. the placeholder is not substituted before the fetch.

## NOT findings (checked, so nobody re-chases them)
- ~20 games 404 on `/music/v1/...mp3` during local capture. Audio is deliberately not in git;
  it ships from a private repo to `/music` on the host. A local server has no `/music`.
  These 404s are an artifact of the capture, not broken games.
- Pom Pond is not a missing file: it is an external app at pom-pond.web.app (GAMES row field 5).
  `scripts/catalog.mjs` builds every native URL as `/play/<id>.html` and ignores that field.

## Native shell chrome faults seen in the shots (cross-cutting, all 66)
- **The header clips "Sign in" once the wallet has a pending chip.** MEASURED, not eyeballed
  (`hdrprobe.mjs`, klondike, `#shell-pend` set to the SDK's own "(+8 pending)" string):

  | width | empty wallet | with pending chip |
  |---|---|---|
  | 320px | overflow 0 | **overflow 17px**, clips `Sign in` |
  | 360px | overflow 0 | overflow 0 (wraps cleanly) |
  | 375px | overflow 0 | **overflow 15px**, clips `Sign in` |
  | 390px | overflow 0 | overflow 0 (wraps cleanly) |

  `.shell-hdr` is a flex row with `gap:12px`, no `flex-wrap`, no `min-width:0` on the children,
  and `#shell-signin` is `white-space:nowrap`. A first-time visitor never sees it (empty wallet
  measures clean at every width, which is why a naive probe reads green). Every RETURNING player
  does, on all 66 native games, at the two commonest phone widths.
  ⛔ I first read this off a screenshot and a fresh-browser probe said "0/12 clean". Both were
  right about different states. The bug is state-dependent; seed the wallet before probing.
- **The fixed ♫ Music chip lands on the header** in the same shot, so the chrome is crowded by
  something that is not even part of the shell.
- **Empty lower third — real to the eye, NOT a layout gap.** Klondike and Stone Garden both show
  a large empty band between the last control and the "Add to Home Screen" bar. I probed it
  (`gapprobe.mjs`, 12 natives) expecting a margin bug and measured a **6px** gap on every one.
  The emptiness is inside a full-height game container, not a gap between boxes, so box geometry
  cannot see it. Treat it as a composition problem per game (the board does not fill the frame),
  not as a shell CSS bug. ⛔ Do not "fix" a margin here; there isn't one.
- Stone Garden also prints "Challenge. Reach 380px." as bare white text above the panel, on the
  very top edge, which reads as a debug string rather than a title.

## The native games ask for a font the shell never loads (MEASURED)
- `shared.css` has **183** `'Bebas Neue'` rules; **38** files under `games/` ask for it too.
- `index.html` and `wild.html` load Bebas Neue from Google Fonts. **`play/shell.css:7` does not** —
  it imports Hanken Grotesk only. So all 66 natives fall back to the system sans, which is wider.
- Measured on `/play/sprout.html` in a real browser:
  `"Bebas Neue",sans-serif` = **162.69px**, plain `sans-serif` = **162.69px** (identical, so it
  never loaded), `"Hanken Grotesk"` = 145.50px (that one is loaded).
- Consequence, measured in situ: Sprout's ENTER key is **47.6px wide holding 59.5px of text**,
  spilling 5.9px left and 6.0px right into the Z key.
- ⛔ `document.fonts.check('16px "Bebas Neue"')` returns **true** there anyway — it assumes any
  unmanaged family is a system font. `document.fonts` itself contains only Hanken Grotesk.
  **Measure a width against `sans-serif`; never trust check().**
- Fix is one line in `play/shell.css:7` (add `&family=Bebas+Neue`). Do it BEFORE the per-game CSS
  pass — several "clipped label" findings in Part 3 may be this and nothing else.

## `overflow-x:hidden` on html+body (shared.css:20-21) — three measured consequences
- **`.shell-hdr` never sticks** though it declares `position:sticky;top:0`. Measured (`stickyprobe.mjs`):
  set -77px @ scrollY 77 · trellis/sudoku/battleship -120px @ 120 · wordsearch -85px @ 85.
- **Word Search's 10th column is untappable** (`shared.css:2269` 36px floor + `wordsearch.js:276`
  `repeat(10,1fr)` = ~370-394px in a 352px row; the clamp stops it scrolling).
- **Music Studio's Solo/Mute are unreachable** (`studio.html:53` `.gs-layer-head` has no
  `overflow-x` while `.gs-grid-wrap`/`.gs-arr`/`.gs-sections` all do).

## The header clip was already found once — and fixed against the wrong state
`play/shell.css:201` has a `@media (max-width:430px)` block whose comment says the row "overflowed
and clipped the Sign in CTA", plus a `<=360px` block that hides the feedback button so it "never
clips". Both are live. It still clips, because they were tuned on an EMPTY wallet; the
`(+N pending)` string puts it back over. Re-check layout fixes in the state that broke them.
