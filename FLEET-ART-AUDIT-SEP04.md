# FLEET ART & CSS UPGRADE LIST
### Every carded game, opened and looked at. Sep 04 2026.

This is the working list for the graphics / backgrounds / CSS pass across the whole arcade.
It is built from **looking**, not from grepping: every game was launched at 375x667 on a Pixel 7
user agent and photographed three times — boot, in play, and a few seconds later — and every one
of those frames was opened and read.

- **186 games** audited (121 satellite cards + 66 native `/play/` games; Pom Pond is an external
  app and has no local page).
- **558 screenshots** taken. 555 have real content; the 3 blank ones are Pom Pond's 404.
- Companion file: `FLEET-ART-FACTS-SEP04.md` holds every structural measurement with the command
  that re-derives it, plus the traps hit while building the capture.

**What this does NOT do.** It grades how a game *looks*, never how fun it is or how good the idea
is. A game can be a "plain" here and still be the best thing in the arcade to play.

---

## How to use it

1. **Part 1 is where the money is.** Ten cross-cutting jobs, each of which lifts dozens of games
   at once. Do these before touching any single game — two of them are literally one line each.
2. **Part 2** ranks all 186 games worst-first so you can see the shape of it.
3. **Part 3** is the per-game working list — what it looks like now, what is wrong with it, the
   exact background it wants, the art files to paint and the CSS jobs to do.
4. **Part 4** groups the art asks into batches you can generate in one sitting.
5. **Part 5** is what I checked and found genuinely fine, so nobody spends a session re-finding it.

Per-game art sheets already live at `satellites/<slug>/ART_ASSETS.md` for ten games. Part 3 is
written to feed that same format, not to replace it.

---

## The four grades

| grade | means |
|---|---|
| **strong** | Painted art or a genuinely composed scene. Would not embarrass the studio. |
| **decent** | Coherent and deliberate but thin. A real background or a few sprites would lift it. |
| **plain** | Flat colours, system font, emoji or CSS shapes doing the work of art. |
| **poor** | Looks unfinished or accidental: clashing colours, stray boxes, nothing composed. |

**Chess is the bar.** Painted piece art on a wooden board inside a Celtic frame with green
fireflies in the border. It runs on exactly the same shell and the same CSS as the 37 native games
that have no art at all. The entire difference is its art folder. That is the whole argument for
this document.

---

## How the pictures were taken, and why you can trust them

A capture robot that gets the wrong screen produces a list full of confident nonsense, so the
harness was built to refuse to lie:

- It taps only controls that pass an `elementFromPoint` containment check, so it never "clicks"
  a control that something is covering.
- It skips How-to-play / rules / back / all-games, and it detects when a tap has navigated out to
  the arcade and returns to the game.
- It records **how** it got to each frame, so a menu shot is never read as an empty game.

Four traps were hit and fixed while building it. Each would have poisoned this list:

| trap | what it would have produced |
|---|---|
| `?dev=1` does not open the 27 workbench-gated games — `localStorage.sws_dev_ok` does | 27 games all photographed as the same "IN DEVELOPMENT" card, read as 27 broken games |
| A blind centre-tap plus Escape navigated 7 games out to the portal | 7 portal screenshots filed under game names, read as "this game is a wall of text" |
| "How to play" matches `/play/` | the advancer kept opening the instructions it was trying to skip |
| `body.innerText` reads the game *underneath* an overlay | games photographed on the how-to wall while the text said they were in play |

And two things I got wrong on the way, corrected before they reached this list: I read a clipped
"Sign in" button off a screenshot and a fresh-browser probe said clean — both were right, the bug
is state-dependent (see Part 1, Job 4). And I called the empty lower third of the native games a
margin bug; measured, the gap is 6px, so it is a composition problem, not a CSS one.

---

# PART 1 — THE TEN CROSS-CUTTING JOBS

Every one of these fixes many games from one place. Do them before any single-game art pass,
because several of them change what a per-game fix should even look like.

---

## JOB 1 — Give the 66 native games the ability to have a background at all
**Lifts: all 66 native games · Effort: 20 minutes of code, then one painting per game**

Every `/play/<id>.html` is a 2.8KB shell. It loads `/play/shell.css`, `/shared.css`, then
`/games/<id>.js`. The entire background of all 66 is **one line**:

```css
/* play/shell.css:32 */
background: radial-gradient(1200px 600px at 70% -10%, #1a2a20 0, var(--shell-bg) 60%);
```

Only 2 of the 66 declare any `background-image` of their own. There is no per-game hook, so there
is currently no way to give one a backdrop without editing that game by hand.

**The hook already almost exists.** `play/shell.js` knows which game it is — line 436 sets
`global._a = LW_PLAY.id`, and `init()` at line 905 adds a `game-active` class to `<body>`.
One line beside it opens the door for all 66:

```js
// play/shell.js, in init(), right after the game-active class
try { document.body.setAttribute('data-game', LW_PLAY.id); } catch (e) {}
```

Then a backdrop is a **file drop**, not a code change:

```js
// probe first so a game with no backdrop never fires a 404
try {
  var bg = new Image();
  bg.onload = function () {
    document.body.style.backgroundImage =
      "linear-gradient(rgba(13,20,16,.62), rgba(13,20,16,.82)), url('" + bg.src + "')";
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  };
  bg.src = '/assets/games/bg/' + LW_PLAY.id + '.jpg';
} catch (e) {}
```

Notes before building it:
- **The scrim is not optional.** These are game boards, not posters. Without the two-stop dark
  gradient over the art, every board becomes unreadable and we land straight in the
  "no filled slabs over painted art" problem.
- The `new Image()` probe costs one 404 per game that has no backdrop yet. If that is not wanted,
  ship a tiny generated `assets/games/bg/index.json` listing the ids that do have one.
- Paint 540x960, dark, low-contrast, values already pushed back. A backdrop that competes with
  the board is worse than the gradient.

**Start with 8, not 66:** chess, klondike, spider, freecell, golf, pyramid, tripeaks, juniper —
one felt/table plate serves the whole card family, so eight games get a backdrop from about two
paintings.

---

## JOB 2 — The native games ask for a font the shell never loads
**Lifts: all 66 native games · Effort: ONE LINE · probably fixes a whole family of clipped labels**

`shared.css` styles **183 rules** in `'Bebas Neue'`, and **38 of the native game files** ask for it
too. `index.html` and `wild.html` load it from Google Fonts. **`play/shell.css:7` does not** — it
imports Hanken Grotesk and nothing else. So every native game falls back to the system sans, which
is wider and differently proportioned than the condensed face the layouts were built for.

Measured in a real browser on `/play/sprout.html`, not inferred:

```
"Bebas Neue", sans-serif  →  162.69px      ← identical, so Bebas never loaded
plain sans-serif          →  162.69px
"Hanken Grotesk"          →  145.50px      ← this one IS loaded, and is narrower
```

The consequence, measured on Sprout's own keyboard: the ENTER key is **47.6px wide holding 59.5px
of text**, spilling **5.9px past its left edge and 6.0px past its right**, into the neighbouring
Z key. That is one of the "clipped label" findings in Part 3, and it is not a layout bug — the
label was sized for a condensed font that never arrived.

⛔ Do not trust `document.fonts.check('16px "Bebas Neue"')` here. It returns **true** in the play
shell even though the font is absent, because it assumes any family it does not manage is a system
font. `document.fonts` contains only Hanken Grotesk. Measure a rendered width against
`sans-serif`; identical widths mean the font did not load.

**Fix**, in `play/shell.css:7`:

```css
@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Bebas+Neue&display=swap');
```

Worth doing **before** the per-game CSS pass in Part 3: several of the clipped-text findings there
may simply evaporate, and fixing them by hand first would be fixing the wrong thing.
(`play/mastermind.html` is the one shell that already references Bebas on its own.)

---

## JOB 3 — The floating ♫ Music chip is landing on top of game UI
**Lifts: 107 games · Effort: S**

`music-unlocks.js` injects a floating "♫ Music" chip into 107 games. Its placement logic is
genuinely careful — `freeCorner()` scores a 3x3 grid over the chip's own 97x48 footprint against
an occupancy map and picks the least-occupied of ~14 candidate spots. The bug is not the scoring.

**It runs once, 900ms after load, against the BOOT layout, and never runs again.** Every game
whose later screens differ from its first screen can end up with the chip parked on something.

Confirmed by eye across the fleet — it covers a section heading in Rootbound, the HUD labels in
Flock the World, the "How to play" title in Moon Claw, and the game title in Petal Alchemy.
**101 of the audited games** have it sitting on their own UI, counted conservatively:
only where the auditor named the element it covers. Full per-game list in Part 3 under
*Music chip collision*.

Fixes, cheapest first:
1. Re-run `freeCorner()` on a `ResizeObserver` / route change, or simply on a 3-second interval
   for the first 15 seconds, so it settles after the game has drawn its real screen.
2. Give the chip a backdrop-blur and a dark scrim disc so that when it does overlap, it reads as
   chrome sitting above the game rather than as part of it.
3. It is already draggable and remembers position, so this is a first-impression bug, not a
   permanent one — which is exactly why it is worth fixing cheaply rather than perfectly.

---

## JOB 4 — The native shell header clips "Sign in" for every returning player
**Lifts: all 66 native games · Effort: S**

Measured, not eyeballed (`hdrprobe.mjs`, Klondike, `#shell-pend` set to the SDK's own
`(+8 pending)` string):

| width | empty wallet | with the pending chip |
|---|---|---|
| 320px | overflow 0 | **overflow 17px — clips `Sign in`** |
| 360px | overflow 0 | overflow 0 |
| 375px | overflow 0 | **overflow 15px — clips `Sign in`** |
| 390px | overflow 0 | overflow 0 |

`.shell-hdr` is a flex row with `gap:12px`, no `flex-wrap`, no `min-width:0` on its children, and
`#shell-signin` is `white-space:nowrap`. A first-time visitor never sees it — which is why a naive
probe reads green. Every player who has earned a sunbeam sees it, on all 66 games, at the two
commonest phone widths.

**This was already found once, and the fix was tuned on the wrong state.** `play/shell.css:201`
carries a `@media (max-width: 430px)` block whose own comment says the intrinsic width "overflowed
and clipped the Sign in CTA", and a `<=360px` block that hides the feedback button so "the sign-in
CTA never clips". Those rules are live — and the button still clips, because they were tuned
against a wallet with nothing in it. The `(+N pending)` string is what pushes it back over.

Fix: `min-width: 0` on `.shell-wallet` (a flex child will not shrink below its content without
it), `flex-wrap: wrap` on `.shell-hdr`, and collapse `(+N pending)` to `+N` under 400px. Then
re-check it **with a pending balance**, not on a fresh browser.

---

## JOB 5 — Three games are asking for art that was never painted
**Lifts: 3 games · Effort: S per game, and the wiring is already done**

Found by watching what 404'd during capture, then confirmed on disk. These have working art hooks
and empty folders, so a painted file appears in the game the moment it lands:

| game | folder | asking for |
|---|---|---|
| **Glyph Forge** | `satellites/glyph-forge/art-slots/` — only `.gitkeep` + 2 PWA icons | `title-mark.png`, `rune-roll.png`, `rune-hollow.png`, `rune-gust.png`, `enemy-cinder.png` |
| **Tarot Run** | `satellites/tarot-run/art-slots/` — **only `.gitkeep`** | `title-mark.png`, `icon-192.png` |
| **Tomato Man** | `satellites/tomato-man/art/` — **does not exist** | `art/hero/tomato_body.png`, `art/ui/logo.png` |

Briefs are already written for all three: `glyph-forge/ART_ASSETLIST.md` + `ART_CARDLIST.md` +
`ART_DIRECTION.md` + `ART_SHOTLIST.md`, `tarot-run/ART_DIRECTION.md`, `tomato-man/ART-NEEDED.md`.

Two live bugs ride along:
- **Tarot Run's missing `icon-192.png` is a real PWA fault** — an installed Tarot Run has no icon.
- Glyph Forge requests `enemy-{id}.png` and Tarot Run `enemy-?.png` **literally**: the placeholder
  is not substituted before the fetch. Same art-slot code in both, so one fix covers both.

---

## JOB 6 — Queen Bee ships 1024px masters as its live card art
**Lifts: 1 game, but it is the only real page-weight bug in the fleet · Effort: S**

`games/pollen.js` loads its card art straight out of `assets/games/masterpollinator/` — **101 PNGs
at 1024x1024, 1.5-2.0MB each, 135MB total**. There are no downsized variants on disk. A
Splendor-style board showing a dozen cards pulls 20MB+ on a phone.

The memory game already shows the right pattern: `games/memory.js` references only the 240x240
`-card.png` cuts (1.8MB shipped) and keeps its 1968px masters beside them, unreferenced. Do the
same here — cut `-card` variants at 240-320px and point `pollen.js` at those.

*(To be clear: the memory game is **not** a bug. Its 86MB of masters are repo weight, never served.)*

---

## JOB 7 — Five portal cards are a bare emoji, and 44 more are thumbnails under 20KB
**Lifts: the grid everyone sees first · Effort: S each**

The portal card carries an explicit `thumb:` field with an emoji `ic:` fallback. **No thumbnail
path is broken** — but five satellites have no `thumb` at all and render as a single glyph on the
grid:

> Twin Lanterns 🏮 · Whack Box 🎪 · Sprout Dice 🎲 · Rootbound 🪴 · Jade Garden 🀄

And 37 satellite thumbnails plus 7 native card screenshots are under 20KB, which at ~480px is a
soft, muddy card. The worst offender is the one that matters most:

> **Chess has a 9KB card.** It is the best-looking game in the arcade and has the third-smallest
> card on the grid. Re-shooting that one card is probably the highest ratio of impression to
> effort in this entire document.

---

## JOB 8 — Decide the emoji-as-art policy once, fleet-wide
**Lifts: dozens of games · Effort: a decision, then S per game**

Emoji are doing the work of real art all over the fleet, and it is the single most common note in
Part 3. It is not always wrong — an emoji in a HUD chip is fine — but it is wrong when the emoji
*is* the game object. The clearest case is **Rootbound**, whose level select is 35 identical dark
squares each showing the same gold 🔒.

Worth ruling on once: emoji are acceptable as *icons in chrome*, never as *game objects*. That one
sentence turns a hundred scattered judgement calls into a checklist.

---

## JOB 9 — Housekeeping while we are in here
**Effort: S, and it makes every clone and deploy faster**

- `assets/games/` is **387MB**.
- `assets/games/pipe/repello/` is ~16MB of raw phone photos (`PXL_20260414_050444039.MP.jpg` and
  three siblings), referenced by nothing in any js, html or css in the repo.
- `assets/games/memory/` holds 86MB of 1968x1968 masters that are never served (the game uses the
  240px cuts). Same story in several other folders.

None of this is player-facing. It is worth one pass to move masters to the vault and delete the
photos, and worth doing *before* we add a backdrop per game or the number only grows.

---

## JOB 10 — `overflow-x:hidden` on html+body makes clipped content permanently unreachable
**Lifts: all 66 native games · Effort: S · this is the cause behind several Part 3 findings**

`shared.css:20-21`:

```css
html { ... overflow-x: hidden; }
body { ... overflow-x: hidden; }
```

That single clamp has three measured consequences across the natives:

1. **The sticky header does not stick.** `.shell-hdr` declares `position: sticky; top: 0`, and it
   scrolls away like a static element. Measured on five games — at `scrollY` 77-120 the header's
   own `top` reads -77 to -120:

   | game | scrolled | header top |
   |---|---|---|
   | set | 77px | **-77px** |
   | trellis | 120px | **-120px** |
   | sudoku | 120px | **-120px** |
   | battleship | 120px | **-120px** |
   | wordsearch | 85px | **-85px** |

   So on any game taller than the viewport, the back arrow, the wallet and the sign-in button
   scroll out of reach. Several "the header is sliced by the top of the frame" notes in Part 3 are
   this, photographed mid-scroll.

2. **Word Search's tenth column is untappable.** `shared.css:2269` floors `.wc` at 36px square and
   `wordsearch.js:276` asks for `repeat(10, 1fr)`; ten 36px tracks plus gaps need ~370-394px inside
   a 352px row. The overflow would normally scroll — `overflow-x:hidden` means it never can, and
   words are placed in that column.

3. **Music Studio's Solo/Mute buttons are unreachable.** `studio.html:53` `.gs-layer-head` is a
   non-wrapping flex row with no `overflow-x`, while its siblings `.gs-grid-wrap`, `.gs-arr` and
   `.gs-sections` all have `overflow-x:auto`. That row was missed, and the page-level clamp seals it.

The clamp is presumably there to stop a horizontal scrollbar on the main Lucid Winds page. It is
inherited by all 66 natives, which do not need it. Scope it to the pages that do, or replace it
with `overflow-x: clip` on a wrapper, and give the two named rows their own `overflow-x: auto`.

---

# PART 2 — THE WHOLE FLEET, WORST FIRST

185 games. Ordered by grade, then by how much a pass would visibly gain.

**Where the fleet stands**

| | poor | plain | decent | strong |
|---|---|---|---|---|
| **all 185** | 6 | 80 | 75 | 24 |
| satellites (119) | 4 | 52 | 44 | 19 |
| natives (66) | 2 | 28 | 31 | 5 |

- **86 games (46%)** are *poor* or *plain* — flat colour, system font, emoji or CSS shapes doing the work of art.
- **24 games (13%)** already carry themselves and want nothing but small polish.
- **746 art files** and **898 CSS jobs** are named across the fleet.
- **101 games** have the injected music chip sitting on their own UI (Job 2).
  Counted conservatively — only where the auditor named what it covers.
- **90 games** carry 20+ emoji in their source, and 183 carry
  at least one. That is a *measured* count from the code, not a judgement; whether the emoji is
  standing in for art is a per-game call in Part 3 (Job 7).
- **53 games** show something visibly wrong in the frame — clipped UI,
  overlapping text, art that failed to load. Every one of these claims went to a second reader
  whose only job was to **refute** it: **52 were confirmed on that second
  look, 13 were refuted and demoted**, and 1 are marked "not yet second-checked" in Part 3.
  Refuted claims are left in the per-game notes with the refutation, not silently deleted.

**"Empty"** is the share of the play frame taken by its single most common colour — a rough
measure of how much is actually on screen. High is not automatically bad (a deliberately minimal
game scores high), but it is a good place to look first.

| # | Game | Where | Age | Look | Impact | Effort | Empty | The one thing it needs |
|---|---|---|---|---|---|---|---|---|
| 1 | **Petal Alchemy** | satellite | 2026-07-10 | poor | 5 | M | 90% | satellites/petal-alchemy/assets/bg-bench-540x960.jpg - Replaces the flat radial gradient and fills the 430px of dead black under the el |
| 2 | **Shut the Box** | native | - | poor | 5 | M | 70% | bg-shutbox-750x1334.jpg - Replaces the shared radial gradient. Gives the box somewhere to sit instead of f |
| 3 | **Wild Wardens** | satellite | 2026-08-18 | poor | 5 | L | 59% | assets/art/bg-title-1080x2340.jpg - Replaces the flat black title ground - currently the entire background of the ga |
| 4 | **Nonogram Bloom** | native | - | poor | 5 | S | 45% | board-plate-420x420.png - Sits behind the grid table (#Xw) so the puzzle has a ground; today the 5x5 float |
| 5 | **Rabbit Ronin** | satellite | 2026-07-18 | poor | 5 | M | 30% | bg-crate-far.png - Fills the empty upper half of the frame. Draws at 0.16x camera speed as the far  |
| 6 | **Abduct a Chameleon 3D** | satellite | 2026-08-18 | poor | 4 | M | 48% | assets/ui/howto-backdrop-1334x750.jpg - Replaces the flat #080c19f2 fill behind #howto and #rotate. Fixes the bleed-thro |
| 7 | **Rootbound** | satellite | 2026-07-07 | plain | 5 | L | 95% | bg-rootbound-540x960.jpg - Replaces the flat #0b0f0b page. Drops into a new satellites/rootbound/assets/ fo |
| 8 | **Rhythm and Vine** | native | 2026-04-12 | plain | 5 | M | 76% | bg-rhythmvine-trellis-540x900.jpg - fills the empty 65% of the playfield and finally puts the vine in Rhythm and Vin |
| 9 | **First Sprout** | satellite | 2026-07-10 | plain | 5 | M | 74% | satellites/first-sprout/assets/bg-grove-night-750x1334.jpg - Replaces the three-stop linear gradient, the two-circle moon (lines 420-421) and |
| 10 | **Garden Guard** | satellite | 2026-07-05 | plain | 5 | M | 72% | assets/gg/maps/map_w1_kitchen.png - Replaces the code gradient + procedural dirt ribbon on World 1 map 1. drawBg() a |
| 11 | **Impossible Garden** | satellite | 2026-07-10 | plain | 5 | L | 66% | satellites/impossible-garden/assets/bg-garden-540x960.jpg - Replaces the flat indigo linear-gradient on #stage and .screen, which is the ent |
| 12 | **Tetroku** | satellite | 2026-07-10 | plain | 5 | M | 62% | bg-trellis-540x960.jpg - replaces the two-stop canvas gradient and finally gives the 'midnight trellis' i |
| 13 | **Tangent** | satellite | 2026-09-01 | plain | 5 | M | 55% | bg-nearside-1080x2340.jpg - Replaces the procedural makeStars blit at draw() line 1280 (already a drawImage, |
| 14 | **Mosaic Garden** | native | 2026-04-12 | plain | 5 | L | 48% | bg-mosaic-540x960.jpg - The game currently has no background of any kind - it is the shared gradient beh |
| 15 | **Sudoku** | native | 2026-04-03 | plain | 5 | M | 47% | bg-sudoku-540x960.jpg - Replaces the shared 66-game radial gradient. Gives Sudoku its own room instead o |
| 16 | **Star Field** | satellite | 2026-07-10 | plain | 5 | M | 47% | bg-starfield-night-540x960.jpg - replaces the flat THEMES[].bg fill; gives the empty lower third and the bare top |
| 17 | **Stone Garden** | native | 2026-04-12 | plain | 5 | M | 46% | bg-stonegarden-750x1600.jpg - replaces the three-stop #0f1410 sky gradient and the formless radial-gradient mo |
| 18 | **Story Seeds** | native | 2026-04-12 | plain | 5 | M | 46% | bg-storyseeds-540x960.jpg - The game has no background at all; the whole screen is currently the shared shel |
| 19 | **Season Sway** | satellite | 2026-07-10 | plain | 5 | L | 45% | visitor-portraits-sheet-1024x1024.png - replaces the single emoji glyph each visitor gets today, and fixes the duplicate |
| 20 | **Deepwell** | satellite | 2026-08-16 | plain | 5 | L | 42% | satellites/deepwell/art/deepwell-04-shale.png (and -topsoil, -darkseam, -wetshelf, -theglass) - Replaces the six flat colour divs at renderShaft line 2669. Wired by changing th |
| 21 | **Root Maze** | native | 2026-04-12 | plain | 5 | L | 41% | bg-rootmaze-540x960.jpg - Replaces the flat #0d100c canvas clear at games/rootmaze.js:541. Gives the maze  |
| 22 | **Sea Battle** | native | 2026-04-24 | plain | 5 | M | 39% | assets/games/battleship/bg-sea-540x960.jpg - Replaces the shared shell radial gradient. Fills the empty C-G columns and the d |
| 23 | **Breathing Garden** | native | 2026-04-12 | plain | 5 | M | 37% | bg-breathing-540x960.jpg - Replaces the shared shell radial gradient - the whole page is currently the same |
| 24 | **Power Scalers** | satellite | 2026-07-05 | plain | 5 | L | 28% | bg-arena-540x960.jpg - Replaces the three blurred CSS aurora blobs, which are the game's only visual ba |
| 25 | **Rule Root** | satellite | 2026-07-10 | plain | 4 | M | 96% | bg-rule-garden-540x960.jpg - Replaces the single radial gradient that is currently the whole background of bo |
| 26 | **Bloom Breaker** | satellite | 2026-07-05 | plain | 4 | M | 95% | bg-bramble-540x960.jpg - replaces the empty near-black canvas fill; fills the dead 70% of the frame and g |
| 27 | **Pollinator Paths** | satellite | 2026-07-10 | plain | 4 | M | 94% | bg-meadow-night-540x960.jpg - Replaces the flat #0b0f0b canvas fill. Gives the game a place instead of a void  |
| 28 | **Cipher Bloom** | satellite | 2026-07-10 | plain | 4 | M | 92% | bg-cipher-title-540x960.jpg - Replaces the flat linear-gradient on the title .screen. The menu currently float |
| 29 | **Line Loom** | satellite | 2026-07-10 | plain | 4 | M | 90% | assets/valley-night-540x960.jpg - Replaces the flat fill plus invisible dot grid in render(). Two sibling files, v |
| 30 | **Pit Bike Rally** | satellite | 2026-07-04 | plain | 4 | S | 83% | bg-rotate-portrait-540x960.jpg - Replaces the flat #17181c fill on #rotate-ov. Turns the only screen a portrait p |
| 31 | **Mancala** | native | 2026-04-12 | plain | 4 | M | 83% | bg-seedsow-750x1334.jpg - replaces the shared shell radial gradient; gives the board a surface to sit on i |
| 32 | **Stop Motion** | satellite | 2026-07-18 | plain | 4 | M | 80% | bg-bench-540x960.jpg - Replaces the flat #0b0f0b title screen and fills the ~180px empty band that is c |
| 33 | **Meadow Weave** | satellite | 2026-07-10 | plain | 4 | M | 77% | bg-weave-540x960.jpg - replaces the flat canvas gradient at index.html:472 so the board is not floating |
| 34 | **Silt** | satellite | 2026-07-10 | plain | 4 | S | 76% | assets/backdrops/how_shelf_540x784.jpg - Replaces the flat black How screen. panel_wash.jpg is too evenly lit to read thr |
| 35 | **Burrow Bowl** | satellite | 2026-08-07 | plain | 4 | M | 75% | bg-burrow-lane-540x960.jpg - replaces the flat navy canvas fill; fixes the dead empty top third and gives the |
| 36 | **Bloom Wheel** | native | - | plain | 4 | S | 74% | wheel-plate-840x840.png - Replaces the flat #0d100c fillRect at bloomwheel.js:183 so the empty canvas read |
| 37 | **Tempo Grove** | satellite | 2026-07-10 | plain | 4 | M | 74% | bg-grove-540x784.jpg - Replaces the radial-gradient plus the flat #0b0f0b fillRect, and fills the ~170p |
| 38 | **Garden Lines** | native | 2026-04-12 | plain | 4 | M | 73% | gl-tile-faces-576x96.png - Replaces the six emoji at games/gardenlines.js:11, which ARE the game's art and  |
| 39 | **Litter Bug** | satellite | 2026-08-18 | plain | 4 | M | 73% | bg-alley-540x960.jpg - replaces the inline SVG that is blurred and scrimmed into invisibility; gives th |
| 40 | **Bramble Court** | satellite | 2026-07-10 | plain | 4 | L | 72% | cards/portraits-sheet-1680x2100.png - Replaces portrait(), which the source itself labels 'procedural canvas art per c |
| 41 | **Bee's Pollen Sort** | native | 2026-04-23 | plain | 4 | M | 71% | assets/games/colorsort/bg-hive-540x960.jpg - Replaces the bare shell gradient and gives the vials a surface. Kills the empty  |
| 42 | **Garden Estates** | satellite | 2026-07-18 | plain | 4 | M | 71% | bg-garden-estates-540x960.jpg - replaces the flat vertical canvas gradient; gives the tile ring a physical surfa |
| 43 | **Sunforge** | satellite | 2026-07-17 | plain | 4 | M | 67% | sunforge-core-256x256.png - replaces the flat ctx.createRadialGradient halo at index.html:745 that is curren |
| 44 | **Merge & Blast** | satellite | 2026-07-17 | plain | 4 | M | 64% | bg-merge-540x960.jpg - replaces the flat linear-gradient(180deg,#14141f,#0d0d14) that is the entire bac |
| 45 | **Daily Bloom** | native | 2026-04-12 | plain | 4 | M | 63% | bg-dailybloom-540x960.jpg - Replaces the shared radial-gradient void; gives the exercise a room to sit in an |
| 46 | **Root Groups** | satellite | 2026-07-10 | plain | 4 | M | 62% | bg-grove-540x960.jpg - Replaces the radial gradient and fills the 300px dead band under the board with  |
| 47 | **Twin Lanterns** | satellite | 2026-08-07 | plain | 4 | M | 62% | bg-night-garden-750x1334.jpg - Replaces the single radial gradient on body. It is the entire visual identity of |
| 48 | **Color Garden** | native | 2026-04-12 | plain | 4 | M | 62% | paper-1200x1200.jpg - Replaces the flat #faf5ee fill at colorgarden.js:381 and 428 so the coloring she |
| 49 | **Memory Meadow** | native | 2026-04-12 | plain | 4 | L | 61% | assets/games/recall/bg-meadow-540x960.jpg - fills the empty bottom two thirds and delivers on the name Memory Meadow |
| 50 | **Tinker Loft** | satellite | 2026-07-11 | plain | 4 | M | 61% | bg-loft-540x960.jpg - Replaces the flat #171009 stage fill so both the help wall and the machine behin |
| 51 | **Think Fast** | satellite | 2026-07-10 | plain | 4 | M | 59% | bg-meadow-540x960.jpg - replaces the flat 2-stop canvas gradient; gives the empty playfield a ground pla |
| 52 | **Fast Math** | native | 2026-04-12 | plain | 4 | M | 58% | abacus-owl-idle.png - Fills the live 404 at /assets/games/numbergarden/abacus-owl-idle.png and replace |
| 53 | **Word Sprout** | native | 2026-04-12 | plain | 4 | M | 57% | bg-sprout-540x960.jpg - The game currently has no background at all beyond the shared shell gradient; ev |
| 54 | **Speed Sort** | native | - | plain | 4 | M | 57% | bg-pottingbench-540x960.jpg - Replaces the shared radial gradient and puts something in the 130px empty band u |
| 55 | **HUNCH** | satellite | 2026-08-18 | plain | 4 | M | 53% | assets/personas/persona_critic_idle@3x.png (plus noir, sunny, gremlin, zen) - the five AI personas are currently literal emoji in the source (index.html:391-3 |
| 56 | **Checkers** | native | - | plain | 4 | S | 53% | assets/games/checkers/board-720x720.png - Replaces .ckd/.ckl entirely. The single fix for the game's biggest fault - a che |
| 57 | **Block Drop** | native | 2026-04-23 | plain | 4 | M | 51% | assets/games/petalfall/blocks-sheet-448x64.png - Replaces ctx.fillRect plus a hand-drawn 2px white and 2px black bevel (petalfall |
| 58 | **Plot Bloom** | satellite | 2026-07-10 | plain | 4 | M | 51% | bg-plot-540x960.jpg - Replaces the flat radial gradient on #pb-shell. Gives the board a surface and ki |
| 59 | **Whack Box** | satellite | - | plain | 4 | S | 50% | party/art/bg-parlour-1080x1920.jpg - replaces the single body radial-gradient that is the entire visual identity of b |
| 60 | **Create A Critter** | satellite | 2026-08-15 | plain | 4 | L | 50% | logo-nest-256x256.png - replaces the 🪺 emoji that is currently the entire brand mark on the home screen |
| 61 | **Word Search** | native | 2026-04-03 | plain | 4 | M | 49% | bg-wordsearch-herbarium-750x1334.jpg - Replaces the shared flat gradient; turns the void behind the letters into a page |
| 62 | **Loop Warden** | satellite | 2026-07-11 | plain | 4 | M | 49% | loop-ring-540x540.png - Replaces the ctx.roundRect ring of dim brown squares, which is currently the ent |
| 63 | **Flipbook** | satellite | 2026-07-17 | plain | 4 | M | 49% | bg-desk-540x960.jpg - Replaces #stage's flat var(--bg). Gives the sketchbook a surface and a light sou |
| 64 | **Pixel Garden** | native | 2026-04-12 | plain | 4 | M | 46% | bg-pixelgarden-540x960.jpg - Replaces the shared radial gradient that 66 natives already use. Gives the drawi |
| 65 | **Seed Reel** | satellite | 2026-07-10 | plain | 4 | M | 45% | bg-seedreel-bed-540x960.jpg - replaces the two-stop CSS gradient plus the stray 10% white disc; gives the empt |
| 66 | **Bubblenaut** | satellite | 2026-07-29 | plain | 4 | M | 44% | assets/bg-moss-moon-750x1000.jpg - Replaces ctx.fillStyle=bg plus 40 star dots (index.html:759-763). Fixes the valu |
| 67 | **Minesweeper** | native | 2026-04-03 | plain | 4 | M | 42% | assets/games/minesweeper/hidden-tiles-4x-256x256.png - Replaces one 444KB bitmap repeated 144 times; picking a variant by (r*7+c)%4 kil |
| 68 | **Mosaic Draft** | satellite | 2026-07-11 | plain | 4 | M | 41% | bg-workshop-540x960.jpg - Replaces the flat brown radial vignette that is currently the entire background; |
| 69 | **Wireworm** | satellite | 2026-08-16 | plain | 4 | M | 41% | assets/ww-substrate-1024.png - Replaces the flat #0c1209 fillRect and the 19+19 invisible etch lines at index.h |
| 70 | **Reversi** | native | - | plain | 4 | S | 41% | bg-reversi-540x960.jpg - Replaces the shared radial gradient. Gives the board a table to sit on instead o |
| 71 | **Dew Trail** | native | 2026-06-12 | plain | 4 | M | 41% | assets/games/dewtrail/bg-pond-750x1334.jpg - replaces the shared 66-game radial gradient; gives the game a place instead of a |
| 72 | **Go (Living Stones)** | native | 2026-04-12 | plain | 4 | S | 39% | board-kaya-380x380.png - Replaces the flat #2a2418 SVG background fill at games/livingstones.js:260 so th |
| 73 | **Skitterlings** | satellite | 2026-06-27 | plain | 4 | S | 36% | menu-hero-750x420.jpg - Replaces the empty band at the top of the menu that the clipped story text and r |
| 74 | **Vine Words** | native | 2026-04-12 | plain | 4 | M | 36% | bg-vinewords-540x960.jpg - Replaces the bare shared radial gradient and finally makes the title literal. Fi |
| 75 | **Mini Crossword** | satellite | 2026-07-11 | plain | 4 | M | 35% | assets/games/mini-crossword/bg-desk-540x960.jpg - Replaces the flat radial gradient. Gives the puzzle a place to sit and stops the |
| 76 | **Vinewinder** | satellite | 2026-07-03 | plain | 4 | M | 35% | bg-garden-mist-750x1334.jpg - Replaces the three-gradient body wash so the game has a place instead of a colou |
| 77 | **Garden Path** | satellite | 2026-07-18 | plain | 4 | M | 35% | tile-flower-6x-96x96.png - replaces the identical ctx.arc circles in drawTile so tiles are told apart by sh |
| 78 | **Fence Off** | satellite | 2026-07-11 | plain | 4 | M | 34% | bg-yard-540x960.jpg - replaces the canvas linear gradient so the board sits in a place instead of on a |
| 79 | **Word Lightning** | satellite | 2026-07-07 | plain | 4 | M | 33% | satellites/bloomzap/assets/bg-storm-540x960.jpg - Replaces the flat navy plus invisible CSS hatching, and fills the 380px of empty |
| 80 | **Hexa Hive** | satellite | 2026-07-20 | plain | 4 | M | 30% | assets/hab-meadow-540x960.jpg, hab-desert, hab-rainforest, hab-jungle, hab-swamp, hab-mountains, hab-coast, hab-tundra, hab-orchard, hab-volcano - Replaces the two-stop gradient plus flat orb plus flat hill polygon in drawScene |
| 81 | **No Pain, No Gain** | satellite | 2026-07-20 | plain | 4 | M | 26% | bg-workshop-540x960.jpg - replaces the plain vertical gradient plus the three flat fillRects, and gives th |
| 82 | **Aura Farm** | satellite | 2026-08-15 | plain | 4 | M | 26% | bg-menu-540x960.jpg - Replaces the flat var(--ink) void behind the title card and the rules sheet; the |
| 83 | **Tomato Man** | satellite | 2026-08-18 | plain | 4 | M | 21% | art/ui/logo.png - The code already asks for this exact path (ASSET_PATHS.logo, index.html:437) and |
| 84 | **Root Weave** | satellite | 2026-07-10 | plain | 3 | S | 86% | how-icon-goal-64x64.png - Replaces the target emoji in the How gutter with something in the game's own pal |
| 85 | **Root Flow** | native | 2026-04-12 | plain | 3 | M | 58% | assets/games/rootflow/bg-loam-540x960.jpg - replaces the shared grey-green shell gradient and gives the board somewhere to b |
| 86 | **Sproing** | satellite | 2026-07-05 | plain | 3 | S | 42% | bg-menu-375x667.jpg - The title screen currently paints flat #000 (index.html:38) while six painted ba |
| 87 | **Tarot Run** | satellite | 2026-08-18 | decent | 5 | L | 74% | art-slots/title-mark.png - Replaces the CSS text glyph currently sitting in the 220px gold circle on the ti |
| 88 | **Glyph Forge** | satellite | 2026-08-18 | decent | 5 | L | 67% | art-slots/enemy-cinder.png (+7 siblings, filenames already listed in ASSET_MANIFEST.json 'enemies') - Replaces nothing at all: the slot 404s today so the enemy is five red diamonds a |
| 89 | **Dewball** | satellite | 2026-07-12 | decent | 5 | M | 35% | assets/ground-w1.jpg - the exact file the game already requests and 404s; it drops in with zero code ch |
| 90 | **Sweet Spot** | satellite | 2026-08-18 | decent | 5 | M | 33% | bg-court-540x960.jpg - Replaces the flat linear-gradient(160deg,#d8552c,#a83c1b) plus five 3px div line |
| 91 | **Lamplighter** | satellite | 2026-07-11 | decent | 5 | M | 26% | bg-lamplighter-town-540x340.png - replaces the procedural rectangle town and removes the hard horizon where the ar |
| 92 | **Orb Orchard** | satellite | 2026-07-10 | decent | 4 | M | 93% | horizon-dawn-540x260.png - Kills the hard 1px seam where the checker plane currently just stops against the |
| 93 | **Nova Bloom** | satellite | 2026-07-10 | decent | 4 | S | 89% | bg_how.jpg - gives #s-how a painted ground instead of the fallback radial, without asking for |
| 94 | **Sprout Dice** | satellite | 2026-07-05 | decent | 4 | M | 84% | assets/bg_trellis.jpg - Replaces the bare CSS gradient on the map screen, the screen a player looks at m |
| 95 | **Skyshot** | satellite | 2026-08-07 | decent | 4 | M | 83% | bg-nightgarden-375x667.jpg - Replaces the bare linear-gradient sky (index.html:822) and gives the bottom 40%  |
| 96 | **Budburst** | satellite | 2026-07-05 | decent | 4 | M | 76% | satellites/budburst/assets/powers/bomb-200x74.png (plus rainbow, recolour, trueaim, uproot, bloomblast, timefreeze, bulwark, and one per booster) - Replaces iconPreview()'s 34px emoji fillText, which leaves ~160px of empty canva |
| 97 | **Conduit** | satellite | 2026-09-01 | decent | 4 | L | 70% | conduit-floors.png - replaces the single ctx.fillRect flat-colour-per-tile-type at index.html line 19 |
| 98 | **Mouse Trap** | satellite | 2026-07-18 | decent | 4 | M | 66% | bg-garden-540x960.jpg - replaces the solid #0b0f0b stage fill and fills the dead lower third of the fram |
| 99 | **Four in a Row** | native | 2026-04-03 | decent | 4 | M | 64% | board-840x720.png - Replaces the flat CSS gradient at c4.js:102 and supersedes the unused 1x board.p |
| 100 | **Spider** | native | 2026-04-03 | decent | 4 | M | 63% | bg-spider-felt-750x1200.jpg - Replaces the bare shell radial gradient behind the tableau, so the already-paint |
| 101 | **Pollen Panic** | satellite | 2026-07-02 | decent | 4 | M | 63% | bg-garden-loam-750x1334.jpg - Replaces the flat #101B0E body fill and gives the 90px dead band above the maze  |
| 102 | **Dragon Philosophy** | satellite | 2026-07-05 | decent | 4 | L | 62% | satellites/dragon-philosophy/art/manifest.json - Without it the already-built `card-art--real` <img> never renders, so any painte |
| 103 | **Flock the World** | satellite | 2026-08-15 | decent | 4 | M | 59% | art/bg/bg_game.webp - gives the play screen, which today is a flat panel colour, the ground every othe |
| 104 | **TriPeaks** | native | 2026-04-03 | decent | 4 | S | 57% | bg-tripeaks-table-750x1334.jpg - Replaces the shared one-gradient ground; gives the painted cards a surface so th |
| 105 | **Memory** | native | 2026-04-03 | decent | 4 | M | 56% | bg-memory-540x960.jpg - Gives the cards a surface. Right now the play screen is sixteen cards on the sha |
| 106 | **Klondike** | native | 2026-04-03 | decent | 4 | M | 56% | assets/decks/floral/card-back.png - The floral deck ships faces and pips but no back, so it borrows the LW botanical |
| 107 | **Parallel** | satellite | 2026-08-16 | decent | 4 | L | 50% | tile-wall-92x92.png - replaces the flat #2b3048 .t-wall rectangle that fills most of the frame and giv |
| 108 | **FreeCell** | native | 2026-04-03 | decent | 4 | M | 49% | bg-cardtable-750x1334.jpg - Replaces the shared radial gradient for both card games. Kills the floating-card |
| 109 | **Golf Solitaire** | native | 2026-04-03 | decent | 4 | S | 46% | bg-cardtable-750x1334.jpg - Shared with FreeCell. Replaces the flat shell gradient and fills the empty botto |
| 110 | **Lights Out** | native | 2026-04-03 | decent | 4 | M | 46% | bg-lights-540x960.jpg - Replaces the shared flat radial gradient so the board sits in a scene rather tha |
| 111 | **Hedgerow** | satellite | 2026-07-07 | decent | 4 | M | 44% | satellites/hedgerow/skins/s1/sprites/soil.jpg - Replaces the 240px pebble texture that becomes confetti static at 68px tiled. Th |
| 112 | **Vine Puzzle** | native | 2026-04-03 | decent | 4 | M | 43% | assets/games/pipe/vine-straight-b.png - replaces the third and fourth identical straight tile in a row; kills the wallpa |
| 113 | **Blackout** | satellite | 2026-08-16 | decent | 4 | M | 43% | bg-parlour-540x960.jpg - Gives the page a ground. There is currently no background image of any kind, jus |
| 114 | **Picnic Panic** | satellite | 2026-07-02 | decent | 4 | M | 43% | picnic-swarm-sheet-512x512.png - replaces the 12 mismatched system emoji in the TYPES map (index.html:551-562) so |
| 115 | **Letter Launch** | satellite | 2026-08-18 | decent | 4 | M | 43% | satellites/letter-launch/docs/art/board-plate-480x420.png - Replaces the 42 flat rgba(0,0,0,.16) rounded rects drawn in game.js:736 — the la |
| 116 | **Snakes & Ladders** | satellite | 2026-07-18 | decent | 4 | M | 42% | bg-table-540x960.jpg - Replaces the canvas gradient fill at index.html:342. Gives the die and the playe |
| 117 | **2048** | native | 2026-04-03 | decent | 4 | M | 42% | tray-merge-480x480.png - Sits behind .tb#Rb2 and replaces the invisible .t0 cells, which currently differ |
| 118 | **Yacht-Sea** | native | - | decent | 4 | L | 42% | score-icons-13-832x64.png - Replaces the 13 mismatched emoji at games/_inline/yahtzee.js:49-61. This alone l |
| 119 | **Stop at Ten** | native | 2026-04-13 | decent | 4 | M | 41% | bg-stopten-shed-750x1000.jpg - Fills the empty ground the .st-frame currently floats in, and gives the gold fra |
| 120 | **Tower of Hanoi** | native | 2026-04-03 | decent | 4 | M | 40% | hanoi-plank-660x120.png - Replaces the CSS-gradient bar so the base is an object resting on a bench instea |
| 121 | **Backgammon** | native | - | decent | 4 | M | 39% | board-1024x838.png - Replaces .bg-board's #2C1810 fill plus the 24 clip-path triangles (shared.css:25 |
| 122 | **Super Slice** | satellite | 2026-07-19 | decent | 4 | L | 37% | ff-strata-512x1024.jpg - replaces the four-stop canvas gradient at line 1160 so the shaft actually has de |
| 123 | **Word Trellis** | native | 2026-04-12 | decent | 4 | M | 37% | bg-trellis-540x960.jpg - Replaces the bare shared radial gradient. Gives the board a room to sit in inste |
| 124 | **Seed Toss** | native | 2026-04-12 | decent | 4 | M | 37% | bg-seedtoss-dusk-380x480.jpg - Replaces the 3-stop linear gradient in draw() and fills the empty middle band wh |
| 125 | **Fox & Basket** | satellite | 2026-07-31 | decent | 4 | M | 36% | bg-orchard-500x250.jpg - fills the empty flat #1b2a19 sky above the hills and gives the fox's warm rim li |
| 126 | **Frost Watch** | satellite | 2026-07-11 | decent | 4 | S | 33% | assets/meadow/frozen-136x520.jpg - Replaces the 240x320 frozen.jpg that is squeezed to 68x260. Fixes both the stret |
| 127 | **Bleeding Hearts** | native | 2026-04-12 | decent | 4 | M | 32% | trick-well-300x200.png - Fills the empty rgba(26,31,23,0.3) rectangle that is the centre of the table and |
| 128 | **Hues** | satellite | 2026-06-12 | decent | 4 | M | 32% | bg-hues-540x960.jpg - replaces the flat radial plus noise overlay and gives the game a place instead o |
| 129 | **Cribbage** | native | 2026-04-12 | decent | 4 | M | 31% | cribbage-board-680x180.png - Replaces the pure-CSS repeating-linear-gradient wood strip and the 3x6px CSS hol |
| 130 | **Siege of One** | satellite | 2026-08-16 | decent | 4 | L | 29% | art/lane/sky-wall.png - Replaces the six-layer #lanebox CSS stack (index.html:146-163) whose dashed teet |
| 131 | **Shell Shuffle** | satellite | 2026-06-12 | decent | 4 | M | 25% | bg-table-540x960.jpg - Replaces the flat three-gradient body. Gives the cups a floor and a horizon so t |
| 132 | **Three Sisters** | native | - | decent | 4 | M | 25% | bg-set-table-540x960.jpg - Replaces the flat #b6bcb2 slab and the empty radial gradient; gives the cards a  |
| 133 | **Garden Rummy** | native | 2026-04-12 | decent | 4 | M | 18% | assets/games/juniper/felt-750x1334.jpg - replaces the #2a1f48 plum gradient so the table joins the midnight-greenhouse pa |
| 134 | **Nectar Drop** | satellite | 2026-07-08 | decent | 3 | S | 93% | satellites/nectar-drop/assets/ui/tut-basket-256x256.png - Replaces the bucket emoji on the 'Baskets & bins' tutorial card - the single mos |
| 135 | **Sled Vine** | satellite | 2026-07-10 | decent | 3 | S | 77% | assets/ui/how_icons_88x88.png - Replaces the seven emoji bullets and kills the bare white ring that currently re |
| 136 | **Stop the Light** | satellite | 2026-08-07 | decent | 3 | M | 74% | bg-firefly-ring-375x667.jpg - Replaces the single vertical gradient at index.html:1348 and fills the ~300px of |
| 137 | **Moon Claw** | satellite | 2026-08-07 | decent | 3 | M | 72% | bg-arcade-540x960.jpg - replaces the flat .screen.solid gradient so the menu and how-to screens are a pl |
| 138 | **Code Breaker** | native | - | decent | 3 | M | 66% | assets/games/mastermind/new-game-btn-360x360.png - Replaces the shared 1529x1529 / 3.4MB bronze plaque that is off-palette and 26x  |
| 139 | **Pong Arena** | satellite | 2026-07-05 | decent | 3 | M | 60% | arena-court-540x960.jpg - replaces the two-stop canvas gradient at index.html:1348 so the ball has a surfa |
| 140 | **Kakuro** | native | 2026-04-12 | decent | 3 | S | 53% | bg-ledger-750x1334.jpg - Replaces the shared shell gradient so the grid sits on a surface rather than flo |
| 141 | **Master Pollinator** | native | 2026-04-12 | decent | 3 | M | 52% | bg-pollen-meadow-540x960.jpg - replaces the shared shell radial gradient; gives the painted cards a place to si |
| 142 | **Spore Drift** | satellite | 2026-07-10 | decent | 3 | S | 51% | fg-kelp-fronds-540x300.png - Adds a foreground plane so the scene has near, mid and far instead of sprites fl |
| 143 | **Doodle Pad** | satellite | 2026-07-18 | decent | 3 | S | 50% | paper-tooth-540x500.png - replaces the flat #ffffff canvas fill so the artboard reads as a sheet of paper, |
| 144 | **The Attic** | satellite | 2026-07-31 | decent | 3 | M | 48% | bg-attic-540x960.png - Replaces the inline .atticbg SVG that currently reads as three brown smudges. Gi |
| 145 | **Aura Off** | satellite | 2026-08-29 | decent | 3 | M | 48% | bg-square-dusk-540x960.jpg - replaces the flat body gradient behind every menu and screen; fixes the empty mi |
| 146 | **Times Table Quest** | satellite | 2026-07-18 | decent | 3 | M | 48% | bg-slate-540x960.jpg - replaces the flat radial gradient; gives the grid a surface and stops the board  |
| 147 | **15 Puzzle** | native | 2026-04-23 | decent | 3 | S | 43% | bg-slider-bench-750x800.jpg - Gives .Dboard something to sit on; today the board floats on the same radial gra |
| 148 | **OriVex** | satellite | 2026-07-07 | decent | 3 | M | 41% | bed-plate-720x720.png - Replaces the rgba(18,22,14,0.26) slot wash. Turns the empty 355px bed from a fla |
| 149 | **LOAF** | satellite | - | decent | 3 | M | 40% | card-art-placeholder-300x300.jpg - Fills the empty .photo slot. Right now the empty state is two floating eyes over |
| 150 | **Root Rush** | native | 2026-04-23 | decent | 3 | S | 39% | bg-rootrush-soil-600x600.jpg - replaces the three-stop CSS gradient inside .RRboard; gives the puzzle a real su |
| 151 | **Pyramid** | native | 2026-04-03 | decent | 3 | M | 38% | bg-card-table-540x960.jpg - replaces the shared shell gradient; gives the white cards a surface so they stop |
| 152 | **Blooming Words** | satellite | 2026-07-02 | decent | 3 | M | 38% | assets/bg-cyanotype-750x1334.jpg - Replaces the flat two-stop radial and the near-invisible .fern SVG. Fills the em |
| 153 | **Bandit's Box** | satellite | 2026-08-16 | decent | 3 | S | 35% | assets/bench-750x1000.jpg - Replaces the four near-invisible .stage gradients. Gives the wall-to-bench trans |
| 154 | **Farkle** | native | - | decent | 3 | M | 33% | dice-faces-768x128.png - Replaces the emoji die in the title and buttons and the CSS-dot dice in the tray |
| 155 | **Flood Fill** | native | 2026-04-03 | decent | 3 | S | 33% | assets/games/flood/board-frame-780x780.png - gives the grid an edge; right now the playfield has no boundary and no transitio |
| 156 | **Five in a Row** | native | 2026-04-12 | decent | 3 | M | 32% | board-wood-1040x1040.jpg - Replaces the diagonal linear-gradient at games/vinecross.js:107-109. Turns brown |
| 157 | **Tally** | satellite | 2026-08-18 | decent | 3 | M | 24% | bg-tally-attic-750x1334.jpg - Replaces the flat cream radial wash that fills the top 40% of the play screen an |
| 158 | **Garden Spades** | native | 2026-04-12 | decent | 3 | S | 20% | assets/games/gardenspades/felt-750x1334.jpg - replaces the #0e3a5c blue gradient so the table joins the midnight-greenhouse pa |
| 159 | **Flatulence Fighter** | satellite | 2026-07-10 | decent | 3 | M | 18% | bg-chapel-540x960.jpg - Replaces the flat parchment gradient and gives the game the room its whole premi |
| 160 | **Keepsies** | satellite | 2026-09-04 | decent | 3 | M | 14% | assets/env/ring-chalk-1024.png - The ring is in the game's own one-line pitch on the boot screen and appears in n |
| 161 | **Music Studio** | native | 2026-04-03 | decent | 2 | S | 74% | tex-song-slate-256x256.png - gives the lane panels a surface; currently every panel is the same flat rgba fil |
| 162 | **Dew Snip** | satellite | 2026-07-10 | strong | 5 | S | 31% | assets/ui/btn_plate_primary.png - The current 313x197 file carries a slice of a different button and a purple frin |
| 163 | **Sokoban** | native | - | strong | 4 | S | 78% | wall-hedge-128x128.png - Replaces assets/games/sokoban/wall.png, which is darker than the page ground and |
| 164 | **Chess** | native | 2026-04-03 | strong | 4 | S | 37% | p-king-green.png (and the other 11: p-{king,queen,rook,bishop,knight,pawn}-{green,gold}.png) - Replaces the current 128x128 RGB opaque tiles that stamp a black rectangle over  |
| 165 | **Vine Runner** | satellite | 2026-07-03 | strong | 3 | M | 79% | art/run-2.png - It 404s on every boot (404 /satellites/vine-runner/art/run-2.png). _POSE_FILE at |
| 166 | **Bramblewick** | satellite | 2026-07-05 | strong | 3 | S | 76% | menu-vignette-540x960.png - Lets the scrim come off the centre of menu.jpg without the panel text losing con |
| 167 | **Ripcord** | satellite | 2026-08-30 | strong | 3 | M | 73% | bg-arena-surround-540x960.jpg - Replaces the flat --lo void behind #stage. Fills the two dead bands that current |
| 168 | **Petal Plunge** | satellite | 2026-07-06 | strong | 3 | S | 53% | bg_meadow.jpg (repaint, 540x960) - the current noon-blue version is the one asset that clashes with the dark menus  |
| 169 | **Cosmic Cadets** | satellite | 2026-07-10 | strong | 3 | S | 44% | fg-results-cliffline-540x260.png - Sits across the bottom third of #s-go so the ~170px dead band between the stats  |
| 170 | **Burr Blast** | satellite | 2026-07-05 | strong | 3 | S | 44% | story-frame-375x667.png - Stops the painted panel being a plain rectangle floating on flat black with an e |
| 171 | **Echo** | native | 2026-04-03 | strong | 3 | S | 33% | bg-simon-750x1334.jpg - the painted tiles currently sit on the same empty shell gradient as an art-free  |
| 172 | **Euchre** | native | 2026-04-12 | strong | 3 | S | 31% | assets/games/cards/table-baize-750x1334.jpg - Replaces the CSS gradient at bowergarden.js:112-114 and the hard rail seam. Same |
| 173 | **Acorn Drop** | satellite | 2026-07-11 | strong | 3 | M | 24% | assets/backgrounds/bg_title.jpg - Replaces the current image, which the #s-title overlay crushes to invisibility b |
| 174 | **Seed Pot** | satellite | 2026-07-09 | strong | 3 | M | 23% | assets/pot/pot_classic_front-560x300.png - Drawn AFTER the fruits, it tucks the bottom of the pile behind clay so contents  |
| 175 | **Inkbound** | satellite | 2026-07-07 | strong | 3 | S | 23% | frame-bed-edge-96x96-9slice.png - replaces the 1px maroon rect around the board and gives the playfield an actual  |
| 176 | **Petal Match** | native | 2026-04-12 | strong | 3 | S | 17% | pm-bg-fade-540x180.png - Laid at the bottom of #PMbg so the painted chapter backdrop dissolves into the s |
| 177 | **Jade Garden** | satellite | 2026-07-08 | strong | 3 | S | 14% | assets/chrome/tray-mat-360x560.png - Replaces the board floating directly on bg-table.jpg. Gives the tile grid a surf |
| 178 | **Berry Vine** | satellite | 2026-07-10 | strong | 3 | S | 14% | satellites/berry-vine/assets/bg/bg_title.jpg (repaint) - Fixes the one real fault on this screen: the intro paragraph and the studio line |
| 179 | **Jumping Jimothy** | satellite | 2026-07-09 | strong | 2 | S | 80% | assets/how/how_paper_540x960.jpg - The how wall is the only screen in a 370MB painted game with no background of it |
| 180 | **Blobworks** | satellite | 2026-07-09 | strong | 2 | S | 65% | hud-score-plate-240x88.png - gives the score a ground of its own so the injected Music chip no longer reads a |
| 181 | **Bridgevine** | satellite | 2026-07-10 | strong | 2 | S | 60% | bg_deep_night_v2.jpg - the current deep-night plate is invisible behind the trellis, which is why the t |
| 182 | **Petal Slice** | satellite | 2026-07-09 | strong | 2 | S | 36% | fg-porch-autumn-540x180.png - pods currently vanish at the bottom edge with nothing in front of them; a foregr |
| 183 | **Puppy Dash** | satellite | 2026-08-23 | strong | 2 | S | 30% | art/ui/card-plate-160x180.png - Replaces the flat CSS cream slab on .pick so the runner cards sit in the painted |
| 184 | **Pop N Lock** | satellite | 2026-07-19 | strong | 2 | S | 24% | assets/ui/lock-plate.png - Replaces the bare emoji in thirteen of fourteen ladder rows, which is the only p |
| 185 | **Sixfold** | satellite | 2026-08-18 | strong | 2 | S | 21% | rank-seals-576x96.png - replaces the bare text glyph in the tier badge span, which currently renders as  |

---

# PART 4 — THE ART, GROUPED INTO BATCHES

Same 746 assets as Part 3, regrouped by what the asset *is*, so one style setup
covers a whole batch. Fleet convention (from `SATELLITE_ART_QUEUE.md`): transparent PNG **or**
paint on flat magenta `#FF00FF` for chroma-key; paint big but keep under 1600px on the long side;
no baked-in text except a real wordmark; midnight-greenhouse palette — deep near-black grounds,
sage green, warm gold, cream, a touch of rose; cozy storybook, soft painterly, warm rim light,
big readable silhouettes, a little glow.


## Backgrounds & backdrops  (242 assets across 159 games)

| game | file | spec |
|---|---|---|
| 15 Puzzle | `bg-slider-bench-750x800.jpg` | 750x800 (2x for a 375x400 slot), painted dark potting-bench wood with visible grain, warm rim light from the top-left, corners falling to near-black |
| 15 Puzzle | `tile-socket-160x160.png` | 160x160 transparent, an empty recessed socket: inner shadow, a darker floor, a little moss or grit in two corners |
| 2048 | `bg-merge-grove-540x960.jpg` | 540x960 full-bleed, night greenhouse bench, gold lamp glow top-right, near-black bottom |
| Abduct a Chameleon 3D | `assets/ui/howto-backdrop-1334x750.jpg` | 1334x750 landscape, full-bleed, painted night village street seen from slightly above: deep indigo #0E1220 ground, one warm sodium lamp pool low-left, a chameleon silhouette flattened against a wall, saucer running lights small on the horizon. Pre-darkened to ~35% luminance so 15px cream body copy reads over it with no scrim. |
| Aura Farm | `bg-menu-540x960.jpg` | 540x960, full-bleed, painted dusk park: indigo sky graded to a warm horizon, black tree and lamp-post silhouettes, low fog band, motes in the air |
| Aura Farm | `howto-plate-540x300.jpg` | 540x300, painted header band: a hand cupping a glowing mote over dark grass, warm rim light |
| Aura Off | `bg-square-dusk-540x960.jpg` | 540x960 full-bleed, night plaza, brick + chainlink + two sodium lamps, wet paving, magenta/amber key, top third under 12% luminance |
| Backgammon | `board-1024x838.png` | 1024x838 (11:9), full-bleed opaque. Painted walnut playing field: visible grain running vertically, 24 inlaid points alternating warm cream-sage and deep rose-brown, a brass-capped centre bar, warm rim light from the upper left, subtle inner shadow under the frame lip. |
| Backgammon | `bg-frame-corner-128.png` | 128x128 transparent PNG, vine-and-leaf corner ornament carved in the same wood and at the same relief as new-game-btn.png. One per board corner, mirrored. |
| Bandit's Box | `assets/toy-thumbs-608x152.png` | 608x152 sheet, four 152x152 cells: bandit head, puppet head, spinner, bubble-pop sheet. Painted at the same fidelity as the raccoon, transparent background. |
| Bee's Pollen Sort | `assets/games/colorsort/bg-hive-540x960.jpg` | 540x960 full-bleed. Amber honeycomb wall softly out of focus, a dark waxed-wood shelf across the upper third where the vials stand, warm lamp glow from top-centre, near-black bottom 30% for the control stack. |
| Berry Vine | `satellites/berry-vine/assets/bg/bg_title.jpg (repaint)` | 540x960, same nebula language and palette. Hero star-berry moved down to sit between roughly y=560 and y=860, its halo contained. Upper 45% held as quiet deep space, value under 15%, no bright comet arc crossing the copy band. |
| Berry Vine | `satellites/berry-vine/assets/ui/btn_plate_primary.png (repaint)` | 320x96 9-slice, 34% border-image insets to match the existing plate. Same olive body and warm gold-green rim as btn_plate.png, but with a brighter interior glow and a slightly thicker rim so it still reads as primary. |
| Blackout | `bg-parlour-540x960.jpg` | 540x960, full-bleed, dark oak panelling with a cold fireplace and one lamp, painted almost to black so 12-16% opacity over #0a0b0f still reads as a room |
| Blackout | `room-96x96.png (x6: study, cellar, hall, kitchen, library, conservatory)` | 96x96 each, transparent, painted corner-of-the-room vignettes lit by a single warm source |
| Bleeding Hearts | `trick-well-300x200.png` | 300x200 PNG-32 with alpha, a painted oval felt inlay ringed with a thin brass bead, dark centre, soft inner shadow, transparent outside the oval. |
| Bleeding Hearts | `bg-hearts-540x960.jpg` | 540x960 full-bleed wine parlour with a lamp pool top-centre, falling to near-black at the bottom. |
| Blobworks | `hud-score-plate-240x88.png` | 240x88 transparent, painted clay-and-brass score bezel with a recessed dark glass window and two rivets, sized so the digits sit inside the window |
| Blobworks | `popup-bonus-plate-220x64.png` | 220x64 transparent, a soft warm glow plate with feathered edges that the floating score pops draw on top of |
| Bloom Breaker | `bg-bramble-540x960.jpg` | 540x960 full-bleed, midnight bramble wall into fog, thorn arches top, warm lantern lower-left, mossy floor band at the bottom, all under 15% luminance |
| Bloom Wheel | `wheel-plate-840x840.png` | 840x840 opaque. Near-black slate ground with four concentric sage rings at 10-14 percent opacity, a small warm gold hub bloom at centre, and a radial vignette darkening the corners. |
| Blooming Words | `assets/bg-cyanotype-750x1334.jpg` | 750x1334 full-bleed. Cyanotype sun-print: prussian ground #0d3350 falling to #04121e, visible cold-press paper grain, brush-edge exposure falloff at all four borders, three ghosted fern fronds laid diagonally (upper-right, lower-left, one crossing centre) at 12-18% white. No hard edges - the plate should feel bled onto paper. |
| Bramble Court | `cards/portraits-sheet-1680x2100.png` | 10x10 atlas of 168x210 cells (50 used), transparent background, one painted creature per cell: soft painterly, warm rim light from top-left, big readable silhouette at 88px. Roster is 50 entries across 12 archetypes (bug, wingb, bird, beast, frog, fish, jelly, shell, crawl, eye, ori, myst). |
| Bramble Court | `cards/frame-sage-168x210.png and cards/frame-rust-168x210.png` | Transparent PNG card frames, 8px painted border, sage-green rounded frame with a leaf at the top notch and a rust angular frame with a thorn, plus a solid name plate band across the bottom 30px. |
| Bramble Court | `bg-table-540x960.jpg` | Full-bleed 540x960 painted felt table, moss weave, top-centre lamp pool, bramble corners, wood lip along the bottom 200px. |
| Bramble Court | `soil/fertile-148x152.png and soil/thorn-148x152.png` | Transparent board-cell tiles matching .bcell, 148x152: fertile is turned dark loam with sage shoots, thorn is cracked ground with rust brambles. Soft edges so they blend into the felt. |
| Breathing Garden | `bg-breathing-540x960.jpg` | 540x960 full-bleed, night garden, dark leaves framing the edges, one moonlit bloom top-centre, bottom 40% dropping to near-black for text legibility. |
| Breathing Garden | `tech-{478,box,478relax,triangle,bhramari,sitali,ujjayi,sigh,nadi,energy,kapalabhati,lion,calm46,coherent}-64x64.png` | 14 files, 64x64 PNG-32 transparent, single-weight sage line-art glyphs on no background - a curled leaf for calm, a bee for Bhramari, a lion's head for Lion's Breath, a triangle of stems for Triangle, a moon for Nadi Shodhana. |
| Bridgevine | `bg_deep_night_v2.jpg` | same 540x960 frame as the existing sky plates, but with the black floor lifted to about 8% luminance and a faint moon-lit cloud bank across the upper third |
| Bubblenaut | `assets/bg-moss-moon-750x1000.jpg` | 750x1000 full-bleed. Painted moss-cavern interior: wet dark rock #07130c to #0a1a12, clumps of pale lichen catching a cool green rim light, a few drips and a faint spore haze, depth falling to black at the edges. Value kept below the platform green #3fae72 everywhere so platforms read on top. Same painting repeated for the other four worlds in their own palettes. |
| Budburst | `satellites/budburst/assets/bg-canopy-540x960.jpg` | 540x960 full-bleed. Layered leaf masses crowding in from the top and bottom edges, a warm gold shaft down the centre, deep near-black core so bud colours stay legible on top. Soft painterly, no hard horizon line. |
| Burrow Bowl | `bg-burrow-lane-540x960.jpg` | 540x960 full-bleed, moonlit clearing in perspective, packed earth + cropped grass, hedge line closing the horizon at the top third, warm lantern spill from the left, everything under 18% luminance |
| Burrow Bowl | `ring-plate-420x300.png` | 420x300 transparent, the five concentric scoring rings painted as worn brass inlay set into earth, with the value numerals engraved into clear gaps in each band |
| Checkers | `assets/games/checkers/table-540x960.jpg` | 540x960 full-bleed. Dark greenhouse potting bench: worn wood, a scatter of soil grain, warm lamp falloff from the top, deep near-black at the bottom edge. |
| Chess | `p-king-green.png (and the other 11: p-{king,queen,rook,bishop,knight,pawn}-{green,gold}.png)` | 256x256 PNG-32 WITH ALPHA. Piece only, fully transparent background, warm rim light from upper-left, one soft contact-shadow ellipse baked at the base. Gold set warmed ~10% and green set lightened ~15% so both read against dark walnut. |
| Chess | `bg-chess-540x960.jpg` | 540x960 full-bleed, deep green baize table, warm lamp pool top-centre falling off to near-black at the bottom edge, a shelf corner and a mug at the lower left. |
| Cipher Bloom | `bg-cipher-title-540x960.jpg` | 540x960 full-bleed, painted midnight garden: a carved stone tablet half sunk in moss with letters worn shallow, one shaft of moonlight from upper left, deep near-black ground, sage foliage, gold glints, bottom third darkened so the button stack reads |
| Code Breaker | `bg-codebreaker-540x960.jpg` | 540x960 full-bleed JPG, dark wooden seed bench, lantern glow upper right |
| Conduit | `conduit-floors.png` | 2048x512 sheet, 2 rows x 8 cells at 256px, magenta FF00FF gutters and background; wall, wall face, floor, shadow, concealed hatch, vent, door, wet overlay, lit, exfil, void grain, corner tick, in near-black iron 12141C with hairline 1C2030 edges |
| Conduit | `conduit-title-plate.jpg` | 375x667 full-bleed, a near-black facility interior with a violet cast and one lit duct, no text |
| Create A Critter | `bg-meadow-540x960.jpg` | 540x960 full-bleed, dawn meadow, grass horizon at ~65% height, two rounded shrubs, warm left rim light, sky pale blue to cream |
| Cribbage | `bg-cribbage-540x960.jpg` | 540x960 full-bleed, dark baize + table edge + warm lamp pool, falling to near-black at the bottom so the shell footer blends. |
| Cribbage | `court-{jack,queen,king}-{red,black}-128x180.png` | 128x180 PNG-32 transparent, downsampled from the existing assets/decks/floral/{jack,queen,king}-{red,black}.png (currently 2.2-3.0MB each). |
| Daily Bloom | `bg-dailybloom-540x960.jpg` | 540x960 full-bleed JPG, dawn greenhouse interior, misted glass top, blurred seedling trays low, warm gold lamp glow bottom-left, top third near-black |
| Daily Bloom | `db-tile-plate-160x64.png` | 160x64 PNG, transparent, 9-slice-safe painted card plate with warm rim light on the top edge and a soft drop shadow |
| Dew Snip | `assets/ui/btn_plate_primary.png` | RE-CUT at 600x144 (2x of the 300x72 it renders at), transparent margins, the blue plate ONLY - no neighbouring green button on the left edge, no magenta halo along the bottom, bottom rim not clipped |
| Dew Snip | `assets/ui/btn_plate.png` | RE-CUT at 600x144, transparent, green plate with its full bottom rim restored and the purple glow fringe trimmed |
| Dew Trail | `assets/games/dewtrail/bg-pond-750x1334.jpg` | 750x1334 full-bleed, deep near-black-green still water, faint sage reed silhouette bottom edge, soft gold moon-bloom top right, no detail above 18% luminance in the centre band where the grid sits |
| Dewball | `assets/sky-w1.jpg` | 2048x1024 equirectangular, late-afternoon picnic sky, warm cumulus, a hint of tree canopy at the bottom edge; needs a three-line loader mirroring the ground hook |
| Dewball | `assets/card-w1.jpg through card-w7.jpg` | 320x180 each, a painted vignette of that world (the blanket corner, the toybox floor, the night garden), warm rim light, big readable shape |
| Dragon Philosophy | `satellites/dragon-philosophy/art/bg-patron-hall-750x1334.jpg` | 750x1334 full-bleed JPG, dim hall with a single warm light source, dark enough that cream text holds |
| Echo | `bg-simon-750x1334.jpg` | 750x1334 full-bleed, dark greenhouse interior, a stone or worn-wood bench surface across the middle third, warm gold rim from the left, deep falloff top and bottom so the tiles stay the brightest thing |
| Echo | `plate-simon-label-160x40.png` | 160x40 transparent PNG, a small dark brass nameplate with a soft inner shadow, one per tile |
| Euchre | `assets/games/cards/table-baize-750x1334.jpg` | 750x1334 full-bleed. Green felt with visible nap and a few pulled fibres, warm lamp pool centred at 50% 25% falling to near-black at the corners, a worn darker oval in the middle where tricks land, walnut rail with grain across the bottom 8%. |
| Euchre | `assets/games/cards/trick-inlay-300x420.png` | 300x420 transparent PNG. A soft-edged oval of darker felt with a thin gold-thread border, feathered so it has no hard corner anywhere. |
| Euchre | `assets/games/cards/seat-plate-120x40.png` | 120x40 transparent PNG, one carved wooden nameplate with a gold-inlay edge, greyscale-tintable so one file serves all three seats. |
| Farkle | `dice-tray-felt-512x512.jpg` | 512x512 seamless tile, dark sage felt with visible nap and a worn lighter centre |
| Fast Math | `bg-abacus-540x960.jpg` | 540x960 full-bleed night study desk with a soroban in soft focus and a warm lamp pool top-left |
| Fence Off | `bg-yard-540x960.jpg` | 540x960 full-bleed, dusk garden yard from above, dark loam and turf, warm lantern glow at the top edge, corner vignette |
| First Sprout | `satellites/first-sprout/assets/bg-grove-night-750x1334.jpg` | 750x1334 full-bleed JPG, painted night sky with a soft star field, warm gold moon with halo, and a low dark hedge on the horizon |
| Five in a Row | `table-vignette-750x400.png` | 750x400 transparent PNG. A dark tabletop plane - deep sage-black timber with warm gold rim light along the top edge and a soft falloff outward, sized to sit under and slightly wider than the board. |
| Flatulence Fighter | `bg-chapel-540x960.jpg` | Full-bleed painted chapel interior at the stage size: pew backs bottom third, stained-glass bloom upper left, candle glow lower right, values held down so the cream .card panels keep contrast. |
| Flatulence Fighter | `sprites/scene-cast-540x260.png` | Transparent strip of the three onlookers named in the copy (the widow, the priest, a neighbour) at pew scale, painted, back three-quarter view so they can turn. |
| Flipbook | `bg-desk-540x960.jpg` | 540x960 full-bleed, painted dark wooden desk seen from above, warm lamp pool centred behind where the book sits, a pencil and an eraser resting in a motivated group at the lower left, deep near-black at the frame edges |
| Flock the World | `art/bg/bg_game.webp` | 1080x1920 full-bleed, a night war-room desk seen from above, dark walnut and cold monitor light, paper edges and a coffee ring at the margins, everything within two values of #080d14, no text |
| Flock the World | `art/ui/hud_plate.webp` | 1080x260 transparent PNG or webp, a brushed dark instrument plate with a hairline sodium edge and four recessed stat wells |
| Flock the World | `art/bg/wordmark_alt.webp` | 900x360 transparent, the same lockup redrawn in warm gold and cream with a soft rim light instead of chrome and orange gloss |
| Flood Fill | `assets/games/flood/bg-terrace-750x1334.jpg` | 750x1334 full-bleed, near-black greenhouse interior, out-of-focus glass panes with faint sage muntins, one warm gold lamp bloom top-left, everything below 20% luminance behind the board area |
| Fox & Basket | `bg-orchard-500x250.jpg` | 500x250 full-bleed to sit under the existing SVG, dusk sky graduating deep green to warm amber at the horizon, low moon upper right, soft cloud banding, far treeline haze at the hill line |
| FreeCell | `bg-cardtable-750x1334.jpg` | 750x1334 full-bleed, bottle-green felt with visible nap, warm lamp pool at 50%/28%, near-black vignette, a dark wood rail across the bottom 12 percent |
| FreeCell | `cardslot-free-96x134.png` | 96x134 transparent PNG, an empty free cell: shallow felt inset with a thin gold rope edge and a small engraved sage leaf centred |
| FreeCell | `cardslot-foundation-96x134.png` | 96x134 transparent PNG, same felt inset shell, with the suit pressed into the felt in dull gold rather than a bright floating pip; four variants (spade, heart, diamond, club) |
| Frost Watch | `assets/meadow/frozen-136x520.jpg` | Authored at the drawn aspect (68x260 stage, so 136x520 at 2x), seamless on the left and right edges, pale blue-white frost crystals with the value pulled down toward #9db8cf so it sits under a midnight sky instead of glowing at near-white. |
| Frost Watch | `assets/bg/treeline-540x140.png` | Transparent PNG, full stage width, a band of snow-laden conifers and one broken watchtower in near-black #0d1520, sitting at roughly y=560 behind the hills. |
| Garden Estates | `bg-garden-estates-540x960.jpg` | 540x960, painted dark-wood greenhouse workbench under a warm raking lamp, full-bleed, heavily vignetted to near-black at all four edges |
| Garden Lines | `gl-tile-plate-96x96.png` | 96x96 PNG, transparent, 9-slice-safe ceramic tile plate with a bevelled edge, top rim light and a dark underside, designed to sit over a colour tint |
| Garden Path | `bg-gardenpath-540x960.jpg` | 540x960 full-bleed painted garden ground, grass and moss, petals, hedge at the frame edge, dark falloff top and bottom |
| Garden Rummy | `assets/games/juniper/felt-750x1334.jpg` | 750x1334 felt: #12271c to #0b1a12 ramp, woven sage nap, warm gold vignette top edge, a slightly worn oval under the stock/discard row |
| Garden Rummy | `assets/games/juniper/table-inlay-360x200.png` | 360x200 transparent, a shallow painted two-well tray: two card-shaped depressions with soft rims and contact shadows, faint gold hairline between them |
| Garden Spades | `assets/games/gardenspades/felt-750x1334.jpg` | 750x1334 tileable-centre felt: #12271c to #0b1a12 ramp, visible woven sage nap, warm gold vignette at the top edge, a faint worn patch under the trick area |
| Garden Spades | `assets/games/gardenspades/frame-corner-160x160.png` | 160x160 transparent, painted brass-and-olive table-edge corner ornament, designed to be mirrored into all four corners |
| Glyph Forge | `art-slots/enemy-cinder.png (+7 siblings, filenames already listed in ASSET_MANIFEST.json 'enemies')` | 1024x1024 PNG, dark background, masked into a 180px circle. Baroque chiaroscuro portrait, faceless or partly obscured, like a portrait in a haunted library. |
| Glyph Forge | `art-slots/bg-scriptorium-540x960.jpg` | 540x960 full-bleed, painted desk and open codex page, candlelight from upper left, edges falling to near-black so gold UI stays legible. |
| Go (Living Stones) | `bg-go-540x960.jpg` | 540x960 full-bleed, dim tatami room, lantern light from the left, near-black at the edges |
| Golf Solitaire | `bg-cardtable-750x1334.jpg` | 750x1334 full-bleed, bottle-green felt with visible nap, warm lamp pool at 50%/22%, near-black vignette, dark wood rail across the bottom 12 percent |
| Golf Solitaire | `deck-count-plate-72x72.png` | 72x72 transparent PNG, dark near-black disc at about 75 percent opacity with a thin warm gold ring, soft outer falloff |
| Golf Solitaire | `golf-waste-well-100x140.png` | 100x140 transparent PNG, an engraved felt well with a thin gold edge, empty |
| Hedgerow | `satellites/hedgerow/skins/s1/sprites/soil.jpg` | Repaint at 510x748 (the real field, COLS*CS x ROWS*CS at 540 wide), full-bleed, drawn once with drawCover instead of tiled. Deep near-black loam, a few large soft clods, one or two buried pebbles, contrast kept inside a narrow band so no detail is brighter than a pest. No saturated teal or gold dots. |
| Hues | `bg-hues-540x960.jpg` | 540x960, painted pigment-grinding bench in near-black with warm rim light from top-left, full-bleed, heavily vignetted, low internal contrast |
| Hues | `picker-plate-360x300.png` | 360x300 transparent, a painted wooden palette board with a thumb hole, dried paint smears and a 10px inner shadow lip, sized to sit behind the HSV square |
| Impossible Garden | `satellites/impossible-garden/assets/bg-garden-540x960.jpg` | 540x960 full-bleed. Night hedge garden under a low moon, arches that fold back on themselves, path stones fading into the dark, deep near-black ground, sage foliage, one warm gold lantern glow. Bottom 40% deliberately quiet so menu slabs read on it. |
| Jade Garden | `assets/chrome/tray-mat-360x560.png` | 360x560, transparent PNG, painted felt/moss mat with a soft gold rim and feathered outer edge, safe to stretch vertically |
| Jade Garden | `assets/chrome/hud-plate-375x56.png` | 375x56, transparent PNG, dark inked band, opaque at the top edge feathering to zero at the bottom, full-bleed horizontally |
| Jade Garden | `assets/chrome/bg-table-bamboo.jpg` | 540x960 JPG, full-bleed, night bamboo grove seen past a dark table edge, warm lantern glow top-centre, deep near-black lower third so tiles read |
| Kakuro | `bg-ledger-750x1334.jpg` | 750x1334 full-bleed, dark green-black ledger surface, faint ruled lines at low contrast, warm lamp pool at 50%/20%, vignetted to near-black at the edges |
| Keepsies | `assets/env/backdrop-lot-2048x1024.jpg` | 2048x1024 strip or equirect, dusk lot edge: chain-link, weed line, one lamp, everything low contrast and warm so the marbles stay the brightest thing in frame. |
| Klondike | `assets/games/cards/stock-count-plate-96x96.png` | 96x96 transparent PNG, dark plate with a thin gold rim |
| Klondike | `bg-cardtable-540x960.jpg` | 540x960 full-bleed JPG, deep green felt, gold rim light upper left, corner vignette |
| Lamplighter | `bg-lamplighter-town-540x340.png` | 540x340 transparent-bottomed PNG, painted dusk skyline with varied silhouettes, a hill behind, chimney smoke, and a 40px haze gradient fading to transparent at the bottom edge |
| Letter Launch | `satellites/letter-launch/docs/art/board-plate-480x420.png` | 480x420 transparent PNG, 9-slice safe. A wooden board plate with brass corner caps, a felt inlay, and painted recessed wells on a 7x6 grid; drawn once behind the tiles. |
| Letter Launch | `satellites/letter-launch/docs/art/mode-levels-96x96.png` | 96x96 transparent, four files: mode-levels, mode-climb, mode-hunt, mode-daily. Small painted scene per mode — a stacked tile tower, a rope and pin, a lantern over a word list, a torn calendar leaf. |
| Lights Out | `bg-lights-540x960.jpg` | 540x960 full-bleed, deep night forest floor receding into darkness, warm gold firefly motes in the top third, moss and leaf litter at the bottom |
| Litter Bug | `bg-alley-540x960.jpg` | 540x960 full-bleed painted night alley - brick wall, dumpster and chain-fence silhouettes, one warm sodium lamp glow top-right, near-black ground band so cream copy still reads |
| Loop Warden | `tiles/land-sheet-576x288.png` | 8x4 sheet of 72x72 transparent tiles for the land types the deck names: clover field, watchtower, graveyard, camp, meadow, grove, ruin, well. Painted top-down, warm rim light, readable at 40px. |
| Mancala | `bg-seedsow-750x1334.jpg` | 750x1334 full-bleed, near-black moss cloth, warm lantern falloff from upper right, blurred glass and one leaf silhouette top edge, centre kept quiet so the board reads |
| Master Pollinator | `bg-pollen-meadow-540x960.jpg` | 540x960 full-bleed, deep near-black loam ground, moonlit blooms blurred at the edges, warm gold rim light on grass tips, strong vignette |
| Meadow Weave | `bg-weave-540x960.jpg` | 540x960 full-bleed painted midnight meadow, deep loam and moss, pond glint low-left, hedgerow silhouettes at the frame edges, warm gold light pooling at centre |
| Meadow Weave | `hex-biome-faces-640x128.png` | sheet of 5 painted hex faces, 128x128 each, transparent: meadow grass tuft, pond ripple, forest canopy, wheat field, orchard blossom - each with a warm rim on the top-left edge |
| Memory | `bg-memory-540x960.jpg` | 540x960 full-bleed, dark slate potting bench from directly above, warm lamp pool centred, soft moss and scattered seed at the edges, deep falloff to near-black at the corners |
| Memory | `01-18 face cards, re-matted` | same 18 paintings, alpha background instead of the baked black square, 3:4 |
| Memory Meadow | `assets/games/recall/bg-meadow-540x960.jpg` | 540x960 full-bleed, night meadow, grass and seed-head silhouettes across the bottom third, low warm moon glow upper right, deep near-black sky |
| Merge & Blast | `bg-merge-540x960.jpg` | 540x960 full-bleed JPG, night potting-bench overhead: near-black stained wood, warm gold lantern falloff from the top-left, sage foliage creeping the outer 15%, centre 400x600 kept under 12% luminance so tiles read |
| Merge & Blast | `tile-plate-120x120.png` | 120x120 transparent PNG, one painted enamel/clay tile plate with a warm rim light top-left and a soft drop shadow, painted in neutral cream so code can tint it per value |
| Mini Crossword | `assets/games/mini-crossword/bg-desk-540x960.jpg` | 540x960 JPG, full-bleed, dark oak desk at night seen from above-front, one warm lamp pool in the upper third, a pencil and a sprig of rosemary resting at the lower edge, deep near-black at the bottom so the keyboard reads |
| Moon Claw | `bg-arcade-540x960.jpg` | 540x960 full-bleed painted night arcade interior, dark carpet, blurred second cabinet at the edge, warm neon wash on the back wall, vignette to near-black at the corners |
| Mosaic Draft | `bg-workshop-540x960.jpg` | 540x960 full-bleed JPG, near-black #0b0807 ground, amber kiln mouth glowing low-left, shelf of unglazed pots in shadow right, one dusty light shaft, no detail in the centre third where the plates sit |
| Mosaic Draft | `bg-nightkiln-540x960.jpg / bg-alabaster-540x960.jpg / bg-emberstudio-540x960.jpg` | same 540x960 framing and composition as bg-workshop, relit to the existing THEMES palettes (#11141f cool, #2c2b25 pale, #241110 ember) |
| Mosaic Draft | `plate-kiln-256x256.png` | 256x256 transparent PNG, a fired clay kiln plate seen slightly from above, warm rim light top-left, soft dark cast shadow baked into the lower 20px, shallow inner well |
| Mosaic Garden | `bg-mosaic-540x960.jpg` | 540x960 full-bleed, dark slate conservatory floor, faint grout grid receding, warm lamp falloff top-centre, deep near-black corners |
| Mosaic Garden | `floor-strip-9slice.png` | 300x80 transparent 9-slice, cracked terracotta and swept debris, muted |
| Mouse Trap | `bg-garden-540x960.jpg` | 540x960 full-bleed JPG, night vegetable patch: soil rows and a low woven fence, warm gold lantern falloff from the upper-left, sage and copper foliage in the outer 15%, central 480x420 band held under 10% luminance |
| Music Studio | `icons-song-lanes-64x64.png` | 256x64 strip, four 64x64 transparent badges - a drum skin, a bass string, a chord fan, a melody note - each tinted to its lane spine colour (orange, red, blue, yellow) |
| Nectar Drop | `satellites/nectar-drop/assets/ui/card-plate-360x220.png` | 360x220 transparent PNG, painted vellum/leaf-paper panel with soft gold edging and a feathered outer edge, 9-sliceable centre |
| No Pain, No Gain | `bg-workshop-540x960.jpg` | 540x960 full-bleed painted claymation workshop: pinboard, plasticine smears, hanging worklamp top-centre, plank floor and skirting along the bottom quarter, vignetted corners |
| Nonogram Bloom | `board-plate-420x420.png` | 420x420 transparent, painted dark linen or slate plate with a warm gold hairline edge, a soft inner shadow inside the rim and a faint woven texture |
| Nonogram Bloom | `bg-picross-540x960.jpg` | 540x960 full-bleed pressed-fern herbarium paper, warm gold pool at centre, near-black edges |
| Nova Bloom | `bg_how.jpg` | 900x1600 JPG, a crop of the existing bg_title.jpg pushed 40% darker with the flower moved out of the text column into the lower third, so the copy sits over quiet sky |
| OriVex | `bed-plate-720x720.png` | 720x720, transparent outside the square. A painted linen or paper quilt square with a stitched border and faint cell divisions painted in; warm neutral, slightly darker than the theme sky. |
| Parallel | `bg-parallel-540x960.jpg` | 540x960 full-bleed indigo chamber, vertical light shaft on the centre line, near-black corners |
| Petal Alchemy | `satellites/petal-alchemy/assets/bg-bench-540x960.jpg` | 540x960 JPG, full-bleed, midnight apothecary bench: dark wood surface across the lower third, shelves of faintly glowing jars behind, one warm gold lamp pool top-centre, near-black at the extreme top and bottom so the header bar and tray still read |
| Petal Alchemy | `satellites/petal-alchemy/assets/tray-plate-375x120.png` | 375x120 transparent PNG, painted wooden combine tray with two carved recesses, a plus sign and equals sign inlaid in brass, and a gold arrow well at the right; full-bleed horizontally, transparent above |
| Petal Match | `pm-bg-fade-540x180.png` | 540x180 transparent, a vertical gradient from fully clear at the top to solid #0d100c at the bottom, no detail |
| Petal Plunge | `bg_meadow.jpg (repaint, 540x960)` | same composition, relit for late afternoon: warm gold key light, deeper saturated greens, sky pushed to amber-rose instead of cyan, horizon haze |
| Petal Plunge | `hud-plate-375x64.png` | 375x64 transparent, a painted bark-and-stone HUD bar with two recessed wells for DEPTH and PETALS and a centre well for COMBO |
| Petal Slice | `fg-porch-autumn-540x180.png` | 540x180 transparent PNG, the porch boards and the near leaf litter cut out of bg_autumn.jpg as a separate foreground plate, soft focus, drawn after the objects |
| Petal Slice | `hud_plate_score_200x86.png` | 200x86 transparent PNG, painted brass-and-leaf score plate with a dark centre, 9-sliceable |
| Picnic Panic | `bg-picnic-lawn-540x960.jpg` | 540x960 full-bleed painted lawn as described in background_want, deep #14281c ground |
| Pit Bike Rally | `bg-rotate-portrait-540x960.jpg` | 540x960 full-bleed. The bg_menu scene recomposed vertical: wolf on the rock high-left, green pit bike centre-third, SKYWOLF garage low-right, sunset sky top. Baked-in 40% darkening top and bottom so white type reads. |
| Pixel Garden | `bg-pixelgarden-540x960.jpg` | 540x960, full-bleed JPG. Painted dark wooden bench top, warm lamp pool top-right, a rag and a jar of brushes along the bottom edge, deep near-black values, local contrast under 18%. |
| Plot Bloom | `bg-plot-540x960.jpg` | 540x960 full-bleed painted dark loam bed inside a wooden bench frame, warm lamp pool top-centre, deep vignette; must stay dark enough for cream text |
| Pollen Panic | `bg-garden-loam-750x1334.jpg` | 750x1334, full-bleed. Painted night soil bed seen from above: near-black warm brown with mulch and leaf-litter texture, a soft gold glow bleeding down from the top edge, heavy vignette at the corners. |
| Pollinator Paths | `bg-meadow-night-540x960.jpg` | 540x960 full-bleed, painted night meadow, indigo sky, sage-black grass silhouettes across the lower third, low warm moon glow top-right |
| Pong Arena | `arena-court-540x960.jpg` | 540x960 full-bleed painted court, deep #05060e ground, centre-line glow, side-wall rim light, vignette |
| Pong Arena | `gauntlet-node-icons-384x128.png` | 384x128 transparent, 12 cells of 32x32: painted rank badges for the 12 career levels (first serve, sky, multiball, orbit, gauntlet, ace, boss) in gold/teal/rose |
| Pong Arena | `pong-title-band-540x360.jpg` | 540x360, painted hero band: a court seen at a low angle receding into dark, warm bloom at the horizon, safe empty top third for the wordmark |
| Pop N Lock | `assets/ui/lock-plate.png` | 104x104 transparent PNG (renders at 52px in `.fem`), a painted padlock on a boarded plank in the game's spray-paint palette |
| Pop N Lock | `assets/logo/studio-wordmark.png` | 480x48 transparent PNG, 'SKY WOLF STUDIO' as a stencilled spray tag with a dark drop shadow |
| Power Scalers | `bg-arena-540x960.jpg` | 540x960 full-bleed. Dark arena interior seen from the floor: banked stone tiers receding into shadow, two braziers throwing warm gold pools left and right, dust motes in a shaft of light, near-black across the top 140px so the sticky topbar stays readable. |
| Power Scalers | `power-icons-48-sheet.png` | 576x384 transparent sprite sheet, 12x8 grid of 48x48 glyphs, engraved-brass on transparent, one per entry in the POWERS table (Super Strength, Iron Body, Deep Reserves, Overmind, Blitz Step, Killer Instinct, Aether Blast ...). |
| Puppy Dash | `art/ui/card-plate-160x180.png` | 160x180 transparent PNG, painted cream-and-tan card plate with a soft brushed edge, subtle inner warmth, top-left light |
| Puppy Dash | `art/ui/chip-plate-140x48.png` | 140x48 transparent PNG, a small painted wooden/tan pill with a soft drop shadow |
| Pyramid | `bg-card-table-540x960.jpg` | 540x960 full-bleed, dark green felt weave, warm pooled lamplight top-centre, near-black vignette corners, wood edge along the bottom 8% |
| Pyramid | `waste-slot-plate-96x132.png` | 96x132 transparent, a soft inset shadow well with a faint embossed suit watermark at 12% opacity |
| Rabbit Ronin | `bg-crate-far.png` | 1080x640, transparent sky, seamless L-R tile, bottom edge is ground level. Soft dark crate-yard skyline in near-black mossy green (#20351c sky behind it): stacked shipping crates, a water tower, a crane arm. Silhouette only, large soft shapes, no detail. |
| Rabbit Ronin | `bg-crate-near.png` | 1080x640, transparent sky, seamless L-R tile. Closer crate stacks, rope coils, one or two hanging lanterns with a warm gold glow. More detail than the far layer; sits over it and behind the platforms. |
| Rabbit Ronin | `bg-burrow-far.png / bg-burrow-near.png / bg-grove-far.png / bg-grove-near.png / bg-peak-far.png / bg-peak-near.png` | Six files, 1080x640 each, same spec as above. Palette anchors per ASSETS.md: Burrows warm browns (#241a12), Grove deep forest green (#16301e), Peaks cold blue night (#1b2940). |
| Reversi | `bg-reversi-540x960.jpg` | 540x960, full-bleed JPG. Painted night garden table: dark stone slab, moss in the corners, a warm lantern glow from top-right, deep values so light stones stay the brightest thing in frame. |
| Rhythm and Vine | `bg-rhythmvine-trellis-540x900.jpg` | 540x900, four vertical vine stems on the lane boundaries, leaf clusters at irregular heights, near-black between stems, sage foliage, warm gold rim from below, top 20% fading to black |
| Rhythm and Vine | `pad-plate-136x100.png` | 136x100 transparent, a shallow lit stone/wood pad with a leaf motif, one per lane, 9-slice friendly |
| Ripcord | `bg-arena-surround-540x960.jpg` | 540x960 full-bleed. A dim workshop floor around the dish: worn boards, a coil of rope, a chalk box, two hanging lamps throwing warm gold pools into the top 150px and bottom 180px of the frame, everything at least 3 stops darker than the arena. |
| Ripcord | `ui-shout-plate-360x96.png` | 360x96 transparent PNG. A torn chalk-dust banner, soft feathered edges, slightly warmer than the dirt, sitting about 55% opaque in the middle and fading to nothing at the ends. |
| Ripcord | `hud-score-plate-375x110.png` | 375x110 transparent PNG. A slate-and-brass scorebar: two dark score wells left, a thin brass rule, a worn label strip right for the rung counter. |
| Ripcord | `env-3d-floor-1024x1024.jpg` | 1024x1024 tileable dark boards, warm brown, low-frequency grain, plus a separate 2048x512 horizon gradient card (near-black at the top fading to #1a1310). |
| Root Flow | `assets/games/rootflow/bg-loam-540x960.jpg` | 540x960 full-bleed soil cross-section, dark packed loam, a few pale pebbles, faint mycelium threads, heavy vignette so the board reads on top |
| Root Flow | `assets/games/rootflow/soil-cell-256.png` | 256x256 seamless darker soil tile, slightly cooler than the backdrop |
| Root Groups | `bg-grove-540x960.jpg` | 540x960 full-bleed painted near-black grove floor, moss and pale roots, warm gold light pool low-centre, deep vignette |
| Root Groups | `tile-plate-176x88.png` | 176x88 transparent PNG, painted mossy bark or river-stone plate with a soft rounded edge and a lit top rim, 9-slice safe margins of 16px |
| Root Maze | `bg-rootmaze-540x960.jpg` | 540x960, full-bleed JPG. Painted soil cross-section: strata bands, pebbles, faint mycelium filaments, a warm lantern pool at top-right, all values kept under 20% luminance so the board reads on top. |
| Root Rush | `bg-rootrush-soil-600x600.jpg` | 600x600, dark loam texture, scattered pale pebbles and fine hair-roots, warm top-left light falling to near-black bottom-right, no visible grid |
| Rootbound | `bg-rootbound-540x960.jpg` | 540x960, full-bleed. Painted midnight garden bed seen from above: dark warm loam texture, sage paper-cut leaf edges creeping in from all four corners, a soft gold pool of light at the centre, heavy vignette at the frame edge. |
| Rule Root | `bg-rule-garden-540x960.jpg` | 540x960 full-bleed, painted night garden bed, dark loam foreground, word-stones half-sunk along the bottom, sage foliage framing both edges, warm gold lantern glow upper centre |
| Sea Battle | `assets/games/battleship/bg-sea-540x960.jpg` | 540x960 full-bleed. Night sea seen from above: deep teal-black water, warm lamp glow top-left falling off to near-black bottom-right, faint cream chart rules and depth soundings, a soft compass rose ghosted at 8% in one corner. |
| Season Sway | `bg-garden-night-540x960.jpg` | 540x960 full-bleed, four seasonal variants of one composition as in background_want |
| Seed Pot | `assets/ui/next_panel-190x96.png` | 190x96 transparent PNG, painted wooden NEXT plate with two inset gold sockets, sized so it fits inside the 540-wide canvas with 16px of margin |
| Seed Reel | `bg-seedreel-bed-540x960.jpg` | 540x960 full-bleed painted night garden: dark loam, soft stone bed edging, sage foliage bleeding in from all four corners, single warm lantern glow upper-left, top 200px near-black |
| Seed Toss | `bg-seedtoss-dusk-380x480.jpg` | 380x480 full-bleed, painted dusk meadow: warm gold horizon band low behind two ridgelines, deep teal-black at the top, two or three soft cloud banks in the middle third |
| Shell Shuffle | `bg-table-540x960.jpg` | 540x960 full-bleed JPG. Dark walnut table edge across the lower third, warm rim light on the front lip, deep plum velvet curtain behind falling to near-black at the top, one soft lamp pool centred at y~430. |
| Shell Shuffle | `table-mat-420x120.png` | 420x120 PNG, transparent. An oval felt mat with a stitched gold edge and a soft inner shadow, seen at the same low angle as the cups. |
| Shut the Box | `bg-shutbox-750x1334.jpg` | 750x1334 full-bleed, dark walnut tabletop under a single warm lamp from upper-left, grain visible in the lit third, vignetted to near-black at all four edges |
| Siege of One | `art/lane/sky-wall.png` | 375x68 at 1x, export 1125x204 at 3x, full-bleed, no transparency. Painted night keep wall from the inside: solid lit stone with merlon notches cut in the top edge, moon low and behind, warm horizon haze under it. |
| Siege of One | `art/lane/floor.png` | 375x132 at 1x, export 1125x396 at 3x, full-bleed, tiles horizontally. Flagstone courses in perspective, lit warm amber at the left (gate) end fading cold blue at the right, top 12px a soft transition band into the wall foot. |
| Siege of One | `art/lane/gate.png` | 13x132 at 1x, export 39x396 at 3x, transparent PNG. Iron-banded timber gate leaf with a lit warm edge on its inner face. |
| Skitterlings | `menu-hero-750x420.jpg` | 750x420 JPG, full-bleed. A skitterling mid-leap in silhouette against a Dewspring dawn sky - warm peach sky0 to cream sky1, hill parallax, one glimmer spark ahead of it, bottom edge fading to the menu navy #141a2e. |
| Skyshot | `bg-nightgarden-375x667.jpg` | 375x667 at 1x, export 1125x2001 at 3x, full-bleed no transparency. Night garden looking up: hedge and bramble silhouettes framing left and right, warm lantern haze at the bottom, cold navy sky opening upward, one soft moon top-right. |
| Skyshot | `slingshot-plate-220x180.png` | 220x180 transparent PNG. A forked branch slingshot with a leather pouch and a green sprout wound round it, warm rim light from below, sitting on a small mound of soil. |
| Skyshot | `lvlcard-plate-108.png` | 108x108 at 1x, export 324x324 at 3x, transparent PNG with a 22px 9-slice border. Painted stone-and-vine tile in three states: locked (cold, mossed over), next (warm gold edge, lantern lit), cleared (three carved stars). |
| Snakes & Ladders | `bg-table-540x960.jpg` | 540x960 full-bleed JPG. Dark oak tabletop, horizontal grain, warm lamp pool centred at y~330, corners falling to near-black. |
| Sokoban | `floor-path-128x128.png` | 128x128 seamless tiling, opaque, no transparent margin. Damp soil with pressed flagstone fragments; the pattern must continue across a tile seam so a run of floor cells reads as one path. |
| Sokoban | `sokoban tiles re-exported at 128x128 (player, crate, planted, target, wall, floor, player-on-target)` | Seven 128x128 PNGs, transparent where the README asks, as assets/games/sokoban/README.txt already specifies. |
| Speed Sort | `bg-pottingbench-540x960.jpg` | 540x960, full-bleed JPG. Painted potting-bench top: weathered horizontal planks, a terracotta pot, a coil of twine and a scatter of soil in the lower third, warm rim light from top-right, upper third kept near-black. |
| Speed Sort | `start-plate-340x96.png` | 340x96, transparent PNG. A painted brass-and-wood START plate with a warm rim light, a stamped label and a cast shadow; plus a 340x96 pressed variant. |
| Spider | `bg-spider-felt-750x1200.jpg` | 750x1200 full-bleed, dark sage felt with a visible weave, a warm lamp pool falling from the top, corners darkened to near-black, a faint worn patch near the centre |
| Spider | `card-slot-96x137.png` | 96x137 transparent, an empty column slot: rounded rectangle, faint inset border, soft inner shadow, a hint of felt showing through |
| Spider | `deck-preview-floral-320x180.png (and -classic-, -garden-)` | 320x180 each, a pre-composed painted fan of that deck's King, Queen and Jack at a size where the faces actually read, transparent background |
| Sproing | `bg-menu-375x667.jpg` | 375x667 at 1x, export 1125x2001 at 3x, full-bleed. A darkened, softly blurred crop of the existing assets/bg/bg_garden_bed.jpg with a warm rim of dew light at the top and a deep near-black wash across the bottom 45% so the PLAY slab and chips stay legible. |
| Star Field | `bg-starfield-night-540x960.jpg` | 540x960 full-bleed painted night sky: deep near-black bottom into a sage-teal haze, scattered small stars, one soft rose nebula bloom upper-right, the middle 500x500 kept dark and flat |
| Stone Garden | `bg-stonegarden-750x1600.jpg` | 750x1600 full-bleed (taller than the viewport so it can parallax as the camera rises), moonlit zen garden - raked sand foreground, dark treeline midground, real moon disc plus halo upper right, one warm lantern point lower left, mist transition where sand meets trees |
| Stop at Ten | `bg-stopten-shed-750x1000.jpg` | 750x1000 full-bleed, painted potting shed: dark vertical boards, a warm lamp pool top-left, a shelf edge across the lower third with two silhouetted pots, overall value kept low |
| Stop Motion | `bg-bench-540x960.jpg` | 540x960 full-bleed JPG. Dark workbench, one warm desk lamp from upper left, a propped phone at the left edge, a small clay figure mid-pose in the lamp pool, out-of-focus film strip across the top fading to near-black. |
| Stop the Light | `bg-firefly-ring-375x667.jpg` | 375x667 at 1x, export 1125x2001 at 3x, full-bleed no transparency. Night garden clearing from above: dark moss and loam, a faint ring of dew-lit stones at the centre matching the play ring's radius, near-black falloff at the top and bottom so wordmark and buttons stay readable. |
| Stop the Light | `ring-plate-720.png` | 720x720 transparent PNG, centred. The dead ring painted as a wreath of dark furled leaves with a carved stone rim, cool blue-grey, soft ambient occlusion at the inner edge. |
| Stop the Light | `band-gold-720.png` | 720x720 transparent PNG, same centre and radius as ring-plate. A warm gold arc painted as open blooms with lit petal edges and a pale cream heart at its exact middle, alpha falling off at both ends of the arc. |
| Story Seeds | `bg-storyseeds-540x960.jpg` | 540x960 full-bleed. Night desk: dark timber, the corner of a leather journal bottom-right, a warm candle pool of light upper-left falling off to #0d100c, a pressed leaf and a stub of pencil in a motivated group near the journal rather than scattered. |
| Sudoku | `bg-sudoku-540x960.jpg` | 540x960 full-bleed. Night greenhouse workbench seen from above: dark slate, faint moss creeping in at the left and bottom edges, a warm gold lamp falloff entering top-right, centre deliberately flat and unbusy so the grid stays legible over it. |
| Sudoku | `sudoku-key-plate-216x188.png` | 216x188 (2x the ~108x94 pad key), transparent. A painted river-stone chip with warm rim light top-left, a soft contact shadow bottom, and a slightly irregular edge so no two keys look die-cut. |
| Sunforge | `bg-gyre-540x960.jpg` | 540x960 full-bleed as in background_want, deep #0e1018 ground |
| Super Slice | `sky-dome-1024x512.jpg` | 1024x512 painted sky for the rim above the shaft: dawn gold at the horizon into deep sage-blue overhead, one soft sun bloom, a few high clouds |
| Sweet Spot | `bg-court-540x960.jpg` | 540x960 full-bleed, painted clay court in receiver POV, raked clay texture, worn chalk lines, net with tape and posts across the upper third, dark hedge/stands across the top 15%, warm low sun from upper left, vignetted corners |
| Sweet Spot | `ball-felt-96x96.png` | 96x96 transparent PNG, painted felt tennis ball with the seam curve, fuzz edge and a warm rim highlight, neutral enough to be tinted by the existing ball-skin gradients |
| Tally | `bg-tally-attic-750x1334.jpg` | 750x1334 (2x of 375x667), full-bleed JPG, soft painterly, out-of-focus abacus + bead jar, warm window light top-left, heavily vignetted centre |
| Tangent | `bg-nearside-1080x2340.jpg` | full-bleed opaque, cover fit. Painted deep-space field: near-black ground, one violet/sage nebula mass off centre, warm gold dust low, stars thinning behind the centre of frame. |
| Tangent | `bg-farside-maw-1080x2340.jpg (plus -cess, -nix)` | three full-bleed opaque plates, authored as the finished inverted look, NOT pre-inverted. Maw seared rust (hue 22), Cess verdant green (hue 96), Nix cold cyan (hue 168). |
| Tarot Run | `art-slots/title-mark.png` | 1024x1024 PNG, transparent background. Nine-pointed ritual seal with wand, cup, sword and pentacle at the compass points, rose gold on nothing, Art Nouveau line weight. |
| Tarot Run | `bg-act1-undercroft-1080x1920.jpg (plus act2, act3)` | 1080x1920 JPG, full-bleed, painted wet-stone crypt wall with one lamp and a dust beam, values held dark so gold UI reads on top. |
| Tarot Run | `art-slots/card-wands-1.png through card-*-* (78 files)` | 512x720 PNG each, 5:7, cream parchment field with the Art Nouveau subject centred; suit border stays in code. |
| Tempo Grove | `bg-grove-540x784.jpg` | 540x784 full-bleed, painted night grove: near-black canopy top third, soft sage mist band mid, a low bed of leaves and pale blossoms across the bottom 200px, warm gold fireflies, everything dark enough to sit behind a bright board |
| Tetroku | `bg-trellis-540x960.jpg` | 540x960 full-bleed painted midnight trellis wall, dark lattice, moss in the joints, ivy at one edge, moon glow top-left, near-black at the bottom |
| The Attic | `bg-attic-540x960.png` | 540x960, full-bleed, no transparency. Painted attic interior: rafters, round dormer window with one light shaft, crate stack along the floor, hanging bulb. |
| The Attic | `dust-veil-300x300.png` | 300x300, transparent PNG, greyed felt/lint texture with uneven density and a few hair-fibres, ~55% coverage. |
| Think Fast | `bg-meadow-540x960.jpg` | 540x960 full-bleed painted night meadow - near-black loam bottom third, sage grass blades in silhouette, warm gold horizon glow, soft dew bokeh, centre kept dark for readability |
| Three Sisters | `bg-set-table-540x960.jpg` | 540x960 full-bleed, no transparency. Midnight greenhouse table: dark oiled wood, a worn cream-green linen runner across the middle third where the grid sits, warm gold rim light from top-right, heavy vignette to #0d100c at all four edges. |
| Times Table Quest | `bg-slate-540x960.jpg` | 540x960 full-bleed painted chalkboard with a worn wooden frame edge and a warm lamp wash from the top-left, centre kept near-black so cell colours still pop |
| Tinker Loft | `bg-loft-540x960.jpg` | 540x960 JPG (the exact stage size), painted attic interior, rafters + dusty window top-left, workbench and floorboards low, near-black corners, wood #8a5a2e and brass #c8a84b palette |
| TriPeaks | `bg-tripeaks-table-750x1334.jpg` | 750x1334 full-bleed, near-black moss felt with visible weave, warm gold rim light from top-right, heavy vignette at the corners, no baked-in UI |
| Twin Lanterns | `bg-night-garden-750x1334.jpg` | 750x1334 JPG, full-bleed, painted night garden: near-black ground, sage foliage silhouettes at the edges, pale stone path receding, two warm lantern glows low in frame, values kept under about 20% so UI reads. |
| Vine Puzzle | `assets/games/pipe/bg-vinepuzzle-540x960.jpg` | 540x960 full-bleed, night vegetable plot, raised bed timber across the bottom, dark leaf canopy top, one warm lantern glow off-centre |
| Vine Runner | `art/bg-canopy-540x960.jpg` | 540x960 full-bleed painted canopy for the TITLE screen: dark leaf mass top and sides, a warm light break at centre for the wordmark to sit on, a soft blended ground rather than a flat plane |
| Vine Words | `bg-vinewords-540x960.jpg` | 540x960 full-bleed painterly night-garden wall. Vine entering bottom-left, climbing the left and top edges, 4-5 broad sage leaves with warm rim light; centre 340x340 region kept under 12% luminance so letters stay readable. |
| Vinewinder | `bg-garden-mist-750x1334.jpg` | 750x1334 full-bleed JPG, painted misty garden, out-of-focus foliage top and bottom-left, warm dawn glow bottom-right, pale open centre band behind the board |
| Whack Box | `party/art/bg-parlour-1080x1920.jpg` | 1080x1920 full-bleed, near-black night parlour with one warm lamp pool at the top and a table edge at the bottom, heavy vignette, no text |
| Wild Wardens | `assets/art/bg-title-1080x2340.jpg` | full-bleed opaque. Moonlit overgrown clearing, vine-swallowed stonework, warm lantern glow low-left, deep near-black canopy across the top third. |
| Wild Wardens | `assets/art/logo-wardens-1024x512.png` | transparent PNG. Painted WILD WARDENS wordmark in warm gold with a rim light, a couple of leaves breaking the letterforms, a soft dark drop so it holds on any plate. |
| Wild Wardens | `assets/art/btn-plate-360x88.png` | transparent 9-slice PNG plus a brighter primary variant (btn-plate-primary-360x88.png). Weathered wood and brass, warm gold edge light, dark interior. |
| Wireworm | `assets/ww-terminals-4x256.png` | One sheet, 4 cells at 256x256, transparent: green, blue, amber and red brass sockets, each a genuinely different silhouette (triangle plate, square plate, diamond plate, cross plate) not just a different hue. |
| Word Lightning | `satellites/bloomzap/assets/bg-storm-540x960.jpg` | 540x960 full-bleed. Night garden under storm: near-black hedge and stone wall silhouette across the lower third, rain sheeting at roughly 72 degrees, one fork of lightning half-hidden behind cloud in the upper right, a single warm gold lit window on the horizon. Overall value dark enough that cream body text reads at 14px. |
| Word Lightning | `satellites/bloomzap/assets/tile-letter-96x96.png` | 96x96 transparent PNG, a letter tile plate: dark glass body, warm gold hairline rim, a soft specular sweep across the upper left, a slight bottom shadow lip. Second variant tile-letter-struck-96x96.png with a hot white-blue crackle for the zap state. |
| Word Search | `bg-wordsearch-herbarium-750x1334.jpg` | 750x1334 full-bleed, dark pressed-paper ground with fibre texture, ghosted fern and seed-head line art in the outer margins at ~12% opacity, warm lamp glow top-left, vignette |
| Word Sprout | `bg-sprout-540x960.jpg` | 540x960 full-bleed. Bottom 25%: dark tilled soil with one pale sprout breaking through, warm gold key-light from the upper left. Upper 75%: deep green-black graduating to #0d100c, a soft glow where the board sits. Heavy vignette. |
| Word Trellis | `bg-trellis-540x960.jpg` | 540x960 full-bleed, painterly. Slatted wooden trellis on a dark stone wall, ivy at left and top edges, warm lantern glow top-left, centre band pushed to near-black (under 12% luminance) so board tiles stay legible. |
| Yacht-Sea | `felt-pan-1120x1120.jpg` | 1120x1120 tileable. Painted felt/baize in deep teal-green, visible nap texture, a warm lamp falloff pooling at the top-centre, edges darkening. |
| Yacht-Sea | `bg-yacht-sea-540x960.jpg` | 540x960 full-bleed. A porch at night looking out over dark water: deep sage-black sky, one warm lantern glow top-left, a low band of water at the bottom, centre kept quiet so the scorecard stays legible over it. |
| Yacht-Sea | `total-plate-680x120.png` | 680x120 transparent. A worn brass nameplate with a warm inner glow, hand-punched edges and two small rivets, sized to sit behind the TOTAL row. |

## Title marks & logos  (14 assets across 13 games)

| game | file | spec |
|---|---|---|
| Aura Farm | `logo-aurafarm-720x240.png` | 720x240, transparent, painted wordmark: cream letterforms with a warm gold rim light and a few drifting motes caught in the glow |
| Cosmic Cadets | `fg-title-vignette-540x300.png` | 540x300 transparent PNG, a soft dark cloud bank fading from opaque at the bottom to nothing at the top. |
| Create A Critter | `logo-nest-256x256.png` | 256x256 transparent PNG, soft painterly woven nest with two pale eggs and a sprig of leaf, warm rim light from upper left, big readable silhouette at 120px |
| Glyph Forge | `art-slots/title-mark.png` | 1024x1024 PNG with transparency, must read inside a circular gold frame at 200x200. Symmetrical ritual mark. |
| Hues | `hues-wordmark-420x140.png` | 420x140 transparent, the HUES serif wordmark hand-set with pigment bleed at the stroke ends and a thin gold underscore rule |
| Impossible Garden | `satellites/impossible-garden/assets/title-hero-540x420.png` | 540x420 transparent, sits behind the wordmark: a single impossible arch in silhouette with a wanderer figure at its base, warm rim light from the right. |
| Merge & Blast | `wordmark-merge-blast-460x120.png` | 460x120 transparent PNG, painted wordmark in cream and warm gold with a sage sprout through the ampersand, soft outer glow baked in |
| Music Studio | `logo-song-padlab-96x96.png` | 96x96 transparent PNG, the PADLAB mark redrawn in sage, gold, cream and rose |
| Puppy Dash | `art/ui/wordmark-compact-330x110.webp` | 330x110, the PUPPY DASH lockup stacked to two short lines or set at a lower cap height, transparent |
| Sea Battle | `assets/games/battleship/hit-splash-96x96.png` | 96x96 transparent PNG. Amber ember burst with a curl of dark smoke and scattered splinters, warm rim light, painterly not vector. |
| Sunforge | `sunforge-wordmark-420x120.png` | 420x120 transparent, painted SUNFORGE lettering: hammered gold with a teal-to-rose heat gradient running through it and a faint ember glow |
| Tomato Man | `art/ui/logo.png` | 1024x512 transparent PNG. Painted TOMATO MAN wordmark, chunky gouache letterforms, thick Deep Navy #23314A outline, Tomato Red #E8332A fill, one warm sun glint on the upper-left of the letters. |
| Whack Box | `party/art/tiles/mothlight.png (plus firefly, liftingfog, firstfrost, moongraft, samesoil, widemargin, bearing, understudy)` | nine 128x128 transparent PNGs, one painted object per title (a moth at a lamp, a jar of fireflies, a lantern in fog, a frosted leaf, a grafted branch, two seedlings in one pot, a wide-margin page, a compass, an empty chair in a spotlight), warm rim light on near-black |
| Whack Box | `party/art/whackbox-wordmark-900x220.png` | 900x220 transparent, hand-lettered warm gold WHACK BOX with a soft lamp glow, no tagline |

## Creatures, characters & sprites  (53 assets across 48 games)

| game | file | spec |
|---|---|---|
| Acorn Drop | `assets/ui/icon_stash.png, icon_daily.png, icon_sprint.png, icon_zen.png, icon_shop.png, icon_how.png` | six 96x96 transparent PNGs, painted in the game's own gold/rose/teal with the same chunky black outline as the sprite set — acorn, calendar leaf, stopwatch, crescent, satchel, question mark |
| Backgammon | `die-faces-384x64.png` | 384x64 sprite strip, six 64x64 cells, faces 1 through 6. Painted bone dice with warm amber pips, a soft top highlight and a cast shadow. |
| Bloom Wheel | `brush-tips-256x64.png` | 256x64 sprite, four 64x64 cells: round, chisel, spatter and ribbon brush marks painted in cream on transparent. |
| Bubblenaut | `assets/critter-hopper-192x64.png` | 192x64 transparent PNG, three 64x64 frames of a hop cycle. Round lime #9be86f body, two big dark eyes, a squash on landing, warm underlight. One sheet per critter (Hopper, Skitter, Drone, Slick, Cinder). |
| Create A Critter | `critter-silhouette-320x320.png` | 320x320 transparent, a friendly generic blob-critter in three-quarter view, cream and coral, soft shadow, no face detail |
| Fence Off | `pawn-you-72x72.png and pawn-rival-72x72.png` | two 72x72 transparent pieces in ONE silhouette family — same rounded body, same base, one warm gold and one cool indigo, soft top light |
| Flatulence Fighter | `sprites/mourner-360x360.png` | Transparent PNG of the player character from the chest up, in a dark suit collar, in the same soft cartoon line as the current SVG face. Six expression variants on a 1080x1080 sheet: calm, strain, clench, relief, panic, slipped. |
| Flipbook | `icon-toolbar-sprite-350x70.png` | 350x70 transparent PNG, five 70x70 cells: home, previous page, next page, onion-skin (a faint traced pose, not a ghost), play. All one cream line weight with a warm gold active state |
| Four in a Row | `rose-128.png, iris-128.png, lily-128.png` | 128x128 transparent PNG each, matching zinnia.png's painting style, lighting angle and petal density. Player-side blooms. |
| Four in a Row | `sunflower-128.png, tulip-128.png, dahlia-128.png` | 128x128 transparent PNG each. AI-side blooms, deliberately given a DIFFERENT flower form from the player set — flat-faced ray petals or a spiked star bloom, not another pom-pom — so the two sides differ in silhouette and not only in hue. Repaint calendula.png to the same rule. |
| Garden Path | `mascot-5x-128x128.png` | five 128x128 transparent PNGs - Gnome, Fairy, Sprite, Princess, King - painted chest-up, each a distinct silhouette, same eye-line so they do not jitter when swapped |
| Garden Rummy | `assets/games/cards/shroom@2x.png, flower@2x.png, bee@2x.png, bird@2x.png` | 256x256 transparent each, the four botanical suits repainted: soft painterly shading, warm rim light upper-left, a small contact shadow, silhouettes readable at 24px |
| Hexa Hive | `assets/bee-96x96.png` | 96x96 PNG, transparent, painted bee from above, soft wing blur, warm gold body, a readable silhouette at 24px. |
| HUNCH | `assets/personas/persona_critic_idle@3x.png (plus noir, sunny, gremlin, zen)` | 1024x1024 transparent PNG each, chest-up mascot, consistent framing and eye-line across the set, distinct silhouette and signature colour, glowing with a slight machine undertone |
| Inkbound | `hero-glow-ring-128x128.png` | 128x128 transparent, a soft warm cream halo with a slightly denser inner ring, premultiplied for additive blending |
| Jumping Jimothy | `assets/how/how_paper_540x960.jpg` | 540x960 full-bleed JPG. The same cream-ink paper as the key art but pushed dark — a rain-soaked page under a street lamp — vignetted at the edges and flat enough through the middle for 14px body copy. |
| Keepsies | `assets/ui/boss-dusty.webp, boss-marlene, boss-pitboss, boss-ironsides, boss-curator` | 160x160 WebP each (also used at 96x96 on the ladder), portrait, one clear silhouette per character per ART_ASSETS.md row 6. |
| Litter Bug | `dumpster-hero-540x360.png` | 540x360 transparent, painted dumpster with the lid ajar, warm light spilling from inside, trash silhouettes at the base |
| Litter Bug | `bug-locked-220x220.png` | 220x220 transparent, an unlit grey bug silhouette built from the existing part shapes, faint gold question mark inside |
| LOAF | `example-mugi-300x300.jpg` | 300x300, one painted example cat in the loaf posture, warm rim light, near-black form on a plum ground, no mustard |
| Mancala | `store-seedsow-160x340.png` | 160x340 transparent PNG, a deeper carved end bowl with a lit rim, one warm-toned for the player store and one coral-toned for the AI store |
| Master Pollinator | `pollen-tokens-sheet-192x48.png` | 192x48 transparent sprite strip, 4 painted pollen-grain discs at 48x48 (green/rose/amber/spore) plus a gold one, soft painterly, warm rim light |
| No Pain, No Gain | `clayton-sheet-384x256.png` | 384x256 transparent, the ragdoll's body parts at painting quality - head, torso blob, four limb segments - with visible thumbprint texture and a warm rim, drawn to match the existing joint radii |
| Orb Orchard | `runner-seedling-96x128.png` | 96x128 transparent PNG, a cream seed body with a green sprout leaf and two small feet, a face, warm rim light down the left edge and a dark contact shadow, big readable silhouette at 26px |
| Parallel | `avatar-a-92x92.png + avatar-b-92x92.png` | 92x92 transparent pair - a violet moth-lantern for A and its amber mirrored twin for B, soft inner glow, clearly the same creature reflected |
| Picnic Panic | `snapdragon-hero-96x96.png` | 96x96 transparent, 3 frames (idle, lean-left, lean-right) of a terracotta pot with a snapdragon, warm gold rim light, big readable silhouette |
| Root Maze | `tokens-rootmaze-192x96.png` | 192x96, transparent PNG, two 96x96 cells. A painted seeker lantern-sprite in sage and its rival mirror in rose, each with a warm rim light and a cast ground shadow. |
| Rootbound | `bloom-goal-96x96.png` | 96x96, transparent, with the glow baked in. The golden bloom the player is freeing: warm gold petals, cream centre, a soft halo. |
| Sea Battle | `assets/games/battleship/ship-hulls-320x64.png` | 320x64 transparent sprite sheet, five hulls at cell pitch 32px: lengths 2,3,3,4,5. Olive-sage decks, dark keel line, warm gold rim light along the top edge, a soft drop shadow baked in. |
| Seed Pot | `assets/pot/pot_classic_front-560x300.png` | 560x300 transparent PNG, the lower front lip and belly of the classic pot painted as a separate overlay layer, same lighting as the existing pot sprite, soft feathered top edge |
| Shut the Box | `shutbox-frame-702x440.png` | 702x440 transparent PNG, the open hinged box body: two routed channels sized for 9 tiles each, brass hinge pins at the corners, worn edge highlights, interior in shadow |
| Siege of One | `art/hero/walk.png` | 4-frame horizontal strip, each cell 180x243 (3x of the 60x81 combat body), transparent PNG. Orange-cloaked defender, big readable silhouette, warm gold rim light from the gate side, sword held low. |
| Siege of One | `art/enemies/runner-walk.png` | 4-frame horizontal strip, each cell 180x243, transparent PNG. Thin hunched runner, cold blue-grey, cool rim light from the far end, distinctly narrower shoulders and forward lean than the hero. |
| Silt | `assets/backdrops/how_shelf_540x784.jpg` | 540x784 full-bleed JPG. A damp stone shelf lit warm from the upper left, soil and one glowing spore across the bottom third, the top two thirds deliberately dark and low-detail so 14px cream body copy stays legible under a .30 scrim. |
| Skitterlings | `creature-shadow-220x50.png` | 220x50 PNG, transparent. A soft elliptical contact shadow, warm-black, feathered. |
| Snakes & Ladders | `snake-body-tiles-256x64.png` | 256x64 PNG strip, transparent: head, three body segments, tail, painted with a sage-green back, cream belly scales, warm rim light along the top of the coil. |
| Sproing | `sproing-mascot-320.png` | 320x320 transparent PNG. The avocado climber painted properly: warm rim light on the upper left, soft ambient occlusion where the pit meets the flesh, a hint of a sproing spring under it. |
| Sprout Dice | `assets/node_icons_96x96.png` | 576x96 transparent PNG, six 96x96 cells: aphid, beetle, slug, elite skull-moth, rest lantern, boss crown. Painted, warm rim light, big readable silhouettes at 40px. |
| Sprout Dice | `assets/ui/node_lock_48x48.png and assets/ui/node_check_48x48.png` | Two 48x48 transparent PNGs: a painted brass padlock and a sage tick, both with a soft drop shadow to match .pest-img's treatment. |
| Stone Garden | `stones-stonegarden-1024x512.png` | 1024x512 sprite sheet, 10 painted river stones on transparent, each with a warm-lit top edge, a cool shadow side and visible mineral grain; deliberately distinct silhouettes - flat slab, tall wedge, boulder, disc, hex, teardrop |
| Stop at Ten | `buddy-stopten-idle-148x148.png (plus -focused, -happy, -sad)` | 148x148 transparent each (2x for the 74px slot), painted seed-sprout character: warm rim light from upper left, two real veined leaves, four expressions matching the existing states |
| Stop Motion | `hero-filmstrip-480x200.png` | 480x200 PNG, transparent. Six sprocket-holed frames in a gentle arc, each holding a clay figure one step further through a wave, with the last frame lit warmer than the first. |
| Stop the Light | `firefly-96.png` | 96x96 transparent PNG plus a 3-frame pulse strip at 288x96. A painted firefly with a warm gold abdomen glow, faint wing blur, cool blue body. |
| Sweet Spot | `opponent-ready-260x260.png` | 260x260 transparent PNG, painted opponent player in a ready stance seen from behind the net, rim-lit from upper left, big readable silhouette, sized to stand just above the net line |
| Tally | `pals-sheet-1024x1024.png` | 1024x1024 transparent PNG, 4x4 grid of 256px painted pal portraits (fox, owl, unicorn, bear, frog, whale, dragon, cat, rabbit, dino, robot, rocket), one shared 3/4 pose and one shared light direction |
| Tangent | `bodies-sheet-1536x512.png` | transparent, 12 cells at 128x128 (target, hazard, heavy, flip body, off-side outline, far-side variants), authored 4x for a 12-25px draw. |
| Tarot Run | `art-slots/enemy-spectre.png, -jackal, -echoman, -duelist, -reflection, -sleeper, -gilded, -archivist, -twins, -oracle, -crown` | 11 files, 1024x1024 PNG each, square crop, painted figure on deep teal velvet, warm rim light from below (footlights). |
| Tarot Run | `art-slots/node-medallions-6x256.png` | One sheet, 6 cells at 256x256, transparent: combat blade, elite crown, event moon, treasure chest, rest cup, boss skull. Painted brass medallions, each a distinct outline. |
| Think Fast | `icons-modes-96x96.png` | 6-up 96px sheet on transparent (rush, daily, boss, zen, gallery, wardrobe) painted in sage and gold with matching silhouette weights |
| Tomato Man | `art/hero/tomato_body.png` | 512x512 transparent PNG, hero body at 4x in-game size, thick navy outline, single warm sun key, soft cel shadow, anchor at the sprite centre so the swept-shadow geometry still lines up. |
| Vine Runner | `art/runner-rim-512x512.png` | 512x512 transparent PNG, a warm cream rim-light and soft contact-shadow pass shaped to the Sprout silhouette, to be composited under the runner sprite |
| Word Trellis | `trellis-premium-192x48.png` | 192x48 sprite sheet, four 48x48 painted square emblems: gold laurel (TW), amber leaf (DW), sage sprout (TL), pale sprout (DL). Painted onto their own tinted tile grounds in house tones, no lettering. |
| Yacht-Sea | `score-icons-13-832x64.png` | 832x64 transparent strip, 13 frames of 64x64: buoy, oars, shell, sail, compass, anchor, fish school, fleet, full deck, wake, current, yacht, tide. One painted set - one light source from top-left, one line weight, warm rim light, sage/gold/cream with a touch of rose. |

## Props, pieces & tiles  (261 assets across 149 games)

| game | file | spec |
|---|---|---|
| 15 Puzzle | `tile-face-160x160.png` | 160x160 transparent, one painted leaf-green ceramic tile face: soft bevel, warm highlight along the top edge, faint glaze mottling, transparent outside the rounded square |
| 2048 | `tray-merge-480x480.png` | 480x480 transparent, painted dark slate-and-wood seed tray with 16 recessed square wells, a soft inner shadow inside each well, warm rim light along the top-left lip |
| 2048 | `arrow-pad-256x256.png` | 256x256 transparent 2x2 sheet, four painted brass-and-leaf directional keys (up, down, left, right), warm gold with sage inlay, big readable silhouettes |
| Abduct a Chameleon 3D | `assets/ui/saucer-beam-512x512.png` | 512x512 transparent PNG. Saucer seen three-quarter from below, warm amber cone beam falling out of it, soft rim light on the hull, glow bloom baked in. No text, no frame. |
| Abduct a Chameleon 3D | `assets/ui/lobby-frame-1334x750.png` | 1334x750 transparent PNG, a border/vignette only: dark indigo falloff on all four edges, a thin amber hairline inset ~24px, corners weighted. Centre 600x420 fully transparent so the Playroom iframe shows through it. |
| Acorn Drop | `assets/backgrounds/bg_title.jpg` | 1080x1920 full-bleed repaint/regrade of the existing workshop: value falloff painted in so the bottom third is already near-black, warm gold rim light on the shelf clutter top-left, palette pulled from brown/orange toward the game's gold + rose so it stops fighting the purple-navy UI |
| Acorn Drop | `assets/backgrounds/bg_cellar_quiet.jpg` | 540x820 full-bleed, same cellar wall, but graffiti drips, halftone dots, hard triangles and checkerboard pushed to under 15% contrast across the centre 60% column; full detail kept at the left/right edges where the gold frame covers it |
| Aura Off | `fit-loud-clogs-256x256.png, fit-all-black-256x256.png, fit-headcloth-256x256.png, fit-frog-suit-256x256.png, fit-school-uniform-256x256.png` | 256x256 transparent PNG each, single garment or shoe on nothing, painterly, warm rim light from upper left, big readable silhouette |
| Bee's Pollen Sort | `assets/games/colorsort/pollen-grain-104x52.png` | 104x52 transparent, greyscale/white so it tints per colour. A soft clustered pollen puff with a rim light and a slightly irregular edge, plus a second variant frame for stack variety. |
| Bee's Pollen Sort | `assets/games/colorsort/icons-controls-144x48.png` | 144x48 transparent, three 48x48 cells: a calendar leaf for Daily, a glass vial for the Glass skin, a stack of pollen for Classic. Sage and gold line art on transparent. |
| Blackout | `suspect-256x320.png (x6)` | 256x320 each, transparent, painted shoulder-up figures with genuinely different builds, hats, collars and hair, in the existing cyan/gold/grey key |
| Blackout | `watch-face-256.png` | 256x256, transparent, painted brass pocket-watch face with engraved ticks and a scratched crystal |
| Bleeding Hearts | `suit-{spade,heart,diamond,club}-64.png` | 64x64 PNG-32 transparent, downsampled from assets/decks/floral/suit-*.png (currently 993KB-1.6MB each). |
| Block Drop | `assets/games/petalfall/blocks-sheet-448x64.png` | 448x64, seven 64x64 transparent tiles, one per tetromino |
| Block Drop | `assets/games/petalfall/well-frame-660x1200.png` | 660x1200 transparent PNG, 9-sliceable, with a lip at the bottom |
| Block Drop | `assets/games/petalfall/petal-particle-64x64.png` | 64x64 transparent PNG, four rotation variants on one 256x64 strip |
| Bloom Breaker | `brick-bramble-64x28.png, brick-bud-64x28.png, brick-stone-64x28.png` | 64x28 transparent PNG each, painterly, warm rim light from upper left, two-hit and one-hit variants as separate files (brick-bramble-cracked-64x28.png) |
| Bloom Breaker | `paddle-leaf-120x22.png` | 120x22 transparent PNG, a curled sage leaf with a gold midrib, 9-slice safe (16px caps) so it can stretch when the paddle grows |
| Bloom Breaker | `powerups-sheet-16x-64x64.png` | one 1024x64 strip, sixteen 64x64 transparent cells, painterly icons for magnet, shield, multiball, slow, fire, laser, boomerang, heart, bomb, bloom |
| Bloom Wheel | `wheel-rim-880x880.png` | 880x880 transparent PNG. A painted brass-and-vine ring with warm rim light on the upper left and a cast shadow on the lower right; the centre 840px is fully transparent. |
| Bloom Wheel | `petal-guides-840x840-4.png / -8.png / -12.png` | Three 840x840 transparent overlays showing 4, 8 and 12 faint gold sector spokes radiating from the hub, roughly 15 percent opacity, with a slightly brighter first spoke. |
| Bramblewick | `menu-vignette-540x960.png` | 540x960, transparent, a soft dark vignette with a painted leaf-and-bramble frame around the edges |
| Breathing Garden | `bloom-petal-256x256.png` | 256x256 PNG-32 transparent, one soft painted petal, warm rim light on the outer edge, translucent toward the base, so 6-8 copies can be rotated around the canvas centre. |
| Bridgevine | `trellis_arc_glow.png` | 540x400 transparent, the same arc geometry as the existing frame but with a warm rim highlight along the top edge of each arc, additive-blend safe |
| Bubblenaut | `assets/tiles-mossmoon-256x64.png` | 256x64 transparent PNG, four 64x64 cells: platform-top, platform-middle, wall-block, wall-corner. Painted stone with moss on the upper lip, warm rim light on the top edge, dark undercut. Tileable horizontally. |
| Budburst | `satellites/budburst/assets/powers/bomb-200x74.png (plus rainbow, recolour, trueaim, uproot, bloomblast, timefreeze, bulwark, and one per booster)` | 200x74 transparent PNG each, painted landscape-format vignette that fills the tile canvas edge to edge rather than a centred glyph. Bomb: a seedpod with a lit fuse and a soft blast ring. Uproot: a hand pulling a row of buds free of the vine. Time Freeze: a bud caught in frost with the canopy stalled behind it. Warm rim light, house palette, big readable silhouette. |
| Budburst | `satellites/budburst/assets/modes/arcade-64x64.png (plus blitz, puzzle, endless, zen, daily)` | Six 64x64 transparent PNGs in one visual family: a painted spark, a sand-timer, a knotted vine puzzle, a spiral of falling leaves, a still pond leaf, a calendar leaf. Same line weight and rim-light direction across all six. |
| Budburst | `satellites/budburst/assets/coin-40x40.png and nectar-40x40.png` | Two 40x40 transparent PNGs: a warm gold coin with a bud stamped on it, and a honey drop with a soft internal glow. Both drawn to read at 20px. |
| Burr Blast | `story-frame-375x667.png` | 375x667, transparent, a painted leaf, twig and burr border with the middle cut out for the comic card |
| Burr Blast | `status-icon-64.png (x6: burn, sparkle, sprout, leaf, charge, frost)` | 64x64 each, transparent, painted in-run status glyphs matching the existing seed and relic art |
| Checkers | `assets/games/checkers/board-720x720.png` | 720x720, 8x8 at 90px pitch. Light squares warm walnut with grain, dark squares moss-black with a subtle leaf texture, at least 3:1 luminance between them, a 12px gold inlay frame, soft inner shadow at the frame. |
| Checkers | `assets/games/checkers/crown-64x64.png` | 64x64 transparent. A small woven-vine crown with three gold buds, warm rim light. |
| Chess | `chess-board.png` | 1024x1024 JPG/PNG, same painted walnut+maple board and carved frame, gem inlays regularised into four corner clusters instead of scattered specks. |
| Cipher Bloom | `blooms-sheet-8x-192x192.png` | One 1536x192 strip, eight 192x192 cells on transparent: eight painted keepsake blooms, warm rim light, gold-cream centres, one per unlock tier |
| Cipher Bloom | `gallery-plinth-420x260.png` | 420x260 transparent PNG, a painted empty stone seed tray with two small gold pins and a soft shadow, sage moss at the base |
| Code Breaker | `assets/games/mastermind/new-game-btn-360x360.png` | 360x360 transparent PNG, under 60KB, sage and gold seed packet |
| Code Breaker | `assets/games/mastermind/peg-right-96x96.png and peg-near-96x96.png` | two 96x96 transparent PNGs - a filled sprout peg and a hollow gold ring peg |
| Color Garden | `paper-1200x1200.jpg` | 1200x1200, warm cream laid-paper texture with subtle fibre grain, very slight corner darkening, seamless enough to sit under any page. Matches the 1200x1200 line-art pages exactly. |
| Color Garden | `page-frame-1024x1024.png` | 1024x1024 transparent PNG. A painted wooden or vellum frame with a soft deckle inner edge and four small brass pins at the corners; the centre is fully transparent so the page shows through. |
| Color Garden | `cg-swatch-tray-720x180.png` | 720x180 transparent PNG. A painted paint-tray strip: two rows of six shallow wells with a wet highlight in each and a warm wooden lip. |
| Color Garden | `cg-thumb-01.png through cg-thumb-50.png` | 96x96 each, transparent or cream ground, a downsampled thumbnail of each page's line art with a 2px cream border. |
| Conduit | `conduit-machines.png` | 2048x1024 sheet, 4 rows x 8 cells at 256px, ten devices off and on plus action frames, 17.4px in-game inside a 24px tile, magenta cutout |
| Conduit | `conduit-patrols.png` | 2048x1024 sheet, 4 rows x 8 cells at 256px, drone, sentry and brute in eight states each plus bodies and spot ring, 14px in-game, magenta cutout |
| Cosmic Cadets | `fg-results-cliffline-540x260.png` | 540x260 transparent PNG. A near-black silhouetted cliff edge with two star-spires and three drifting seed shapes, soft gold rim light along the top contour, fully opaque at the bottom edge. |
| Cosmic Cadets | `ui-results-card-460x300.png` | 460x300 nine-slice transparent PNG, matching the existing assets/ui/card_frame.png language: thin gold rule, dark translucent fill, small corner flourishes. |
| Create A Critter | `icons-howto-4x-96x96.png` | four 96x96 transparent icons on one sheet — pencil, eye, sparkle, berry — all drawn in one soft-painterly style with the same 3px warm outline and the same light direction |
| Cribbage | `cribbage-board-680x180.png` | 680x180 PNG-32 with alpha, painted walnut peg board, two drilled hole tracks with real bored shadows, a brass end-rail, worn edges. |
| Cribbage | `suit-spade-64.png, suit-heart-64.png, suit-diamond-64.png, suit-club-64.png` | 64x64 PNG-32 transparent, downsampled from the existing assets/decks/floral/suit-*.png. |
| Daily Bloom | `bloom-progress-petals-256x64.png` | 256x64 PNG, transparent, eight 32x32 petal glyphs in filled and unfilled states on one sheet |
| Daily Bloom | `db-domain-icons-384x128.png` | 384x128 PNG, transparent, six 64x64 icons: memory (seed head), attention (eye in leaves), speed (wind), language (etched word), logic (branch fork), reaction (dew drop) |
| Deepwell | `satellites/deepwell/art/deepwell-04-shale.png (and -topsoil, -darkseam, -wetshelf, -theglass)` | 136x480 transparent PNG each (68px wide in game at 2x), must tile seamlessly top-to-bottom, painted rock strata with seams and dust |
| Deepwell | `satellites/deepwell/art/deepwell-01-miner.png` | 1024x2048 sheet, 32 cells, transparent; the miner rendered at 28px plus the lamp pool from 42x44 up to 284px wide |
| Deepwell | `satellites/deepwell/art/deepwell-08-gear.png` | 640x640 sheet, 16 cells at 40px in game, transparent: tank, lamp, pack, brace, boots, charm, plus cash, sack, pick, winch, down arrow, maxed seal |
| Dew Snip | `assets/ui/card_frame.png` | RE-CUT at 546x576 symmetric, transparent, all four corner leaf clusters present and matched, no purple bottom fringe |
| Dew Trail | `assets/games/dewtrail/board-mat-720x720.png` | 720x720 transparent PNG, a dark slate/lily-pad mat with a 2px warm-gold hairline frame and a soft outer drop shadow, centre kept flat |
| Dew Trail | `assets/games/dewtrail/start-marker-128x128.png` | 128x128 transparent, a gold spiral-leaf ring with a soft glow, designed to sit behind a 58%-width number pill |
| Dewball | `assets/ground-w1.jpg` | 1024x1024 seamless, red and cream gingham with visible thread weave, a soft wine ring, a scatter of crumbs baked in, gentle cloth folds; tiles with itself edge to edge |
| Dewball | `assets/ground-w2.jpg through assets/ground-w7.jpg` | 1024x1024 seamless each: playroom carpet loops, night-garden soil and moss, market cobbles, wet dusk sand with ripples, meadow grass, and a mixed world tile |
| Doodle Pad | `brush-tiles-7x-144x144.png` | one sheet of seven 144x144 transparent tiles — pen nib, pencil, marker, crayon, spray can, glitter jar, star wand — soft painterly, warm gold rim light, big silhouettes readable at 50px |
| Dragon Philosophy | `satellites/dragon-philosophy/art/cards/<cardId>.png` | 512x384 transparent PNG per card, painted illustration, roughly 40 non-common cards to start |
| Echo | `frame-simon-tiles-780x780.png` | 780x780 transparent PNG, a carved wood and tarnished-brass 2x2 frame with four square cut-outs and a centre cross member, worn edges, soft warm rim on the top lip |
| Echo | `spring/summer/autumn/winter-tile.webp` | 512x512 webp at quality 80, target under 80KB each, re-exported from the existing PNGs |
| Euchre | `assets/decks/floral/pip-corner-32x32.png (x4 suits, red and black)` | 32x32 transparent, a small solid version of each suit pip readable at 12px. |
| Farkle | `dice-faces-768x128.png` | 768x128 PNG, transparent, six 128x128 dice faces, bone-white painted dice with warm rim light from upper-left and hand-inked pips |
| Farkle | `farkle-icons-192x64.png` | 192x64 PNG, transparent, three 64x64 icons: a coin purse, a curled reroll arrow, a leather dice cup |
| Fast Math | `sprout-idle.png` | 216x216 transparent, painted sage seedling with two leaf-arms and a face, warm rim light, on a small clay lip |
| Fence Off | `tile-turf-56x56.png` | 56x56 seamless, two variants (light/dark) of clipped turf with faint mowing direction, transparent PNG to multiply over the yard |
| First Sprout | `satellites/first-sprout/assets/sprout-stages-512x2048.png` | 512x512 transparent cells, 4 stages stacked: dormant seed, first shoot, leafed stem, bloomed - matched to the game's kindle/wake/bloom/canopy flags |
| Five in a Row | `board-wood-1040x1040.jpg` | 1040x1040 (2x the 520px max canvas), full-bleed. Painted walnut goban face: real grain running one direction, two or three subtle knots off-centre, a soft bowl of warm lamp light at the middle, corners falling to shadow. |
| Five in a Row | `stone-sage-128x128.png` | 128x128 transparent. Painted jade-green seed stone, warm rim light from top-left, faint internal translucency, a soft contact shadow baked into the bottom edge. |
| Five in a Row | `stone-rose-128x128.png` | 128x128 transparent. Painted rose-quartz stone, same light direction, but a DELIBERATELY different silhouette - slightly flattened top and a small nick in the rim - so the two sides read apart with colour removed. |
| Flatulence Fighter | `ui/icons-action-192x192.png` | Three 64x64 painted icons on one sheet: a handkerchief cough, a water glass, a folded fan. Warm rim light, transparent. |
| Flipbook | `icon-help-glyphs-192x32.png` | 192x32 transparent PNG, six 32x32 cream icons: cinema screen, eraser, page clear, new book, daily sun, microphone |
| Flock the World | `art/ui/nav_ledger.webp and six siblings (deploy, watch, story, crisis, world, feed)` | seven 96x96 transparent icons, filled shapes with warm rim light rather than 1.7px hairline strokes, each a distinct silhouette (a ledger book, a van, an eye, a page, a siren, a globe, a ticker) |
| Flood Fill | `assets/games/flood/board-frame-780x780.png` | 780x780 transparent PNG, 9-slice-safe: warm gold hairline frame with soft inner shadow and four small leaf corner ornaments, centre fully transparent |
| Flood Fill | `assets/games/flood/leaf-sage@2x.png (and gold, slate, copper, plum, crimson)` | 256x256 each, the existing six leaves repainted at 2x with a warm rim light and a soft contact shadow, edge-to-edge so center/cover crops cleanly |
| Flood Fill | `assets/games/flood/style-gem-96x96.png` | 96x96 transparent, one painted faceted gem with a specular hit, and a matching style-solid-96x96.png painted enamel disc |
| Four in a Row | `board-840x720.png` | 840x720 opaque (2x the existing 420x360 board.png). Painted walnut board: visible vertical grain, 42 drilled holes each with an inner shadow and a bright top-lip highlight, a bevelled frame edge, warm light from the upper left. |
| Four in a Row | `piece-shadow-128.png` | 128x128 transparent PNG, a soft elliptical contact shadow with a warm dark core, sized to sit just under a seated 128px bloom. |
| Fox & Basket | `fox-sheet-7x-96x96.png` | one sheet of seven 96x96 transparent frames, the fox at each of its seven step positions — trotting, then slowing, then head-down at the basket — soft painterly, warm rim light from upper right, big readable silhouette |
| FreeCell | `card-contact-shadow-140x48.png` | 140x48 transparent PNG, soft elliptical drop shadow, about 30 percent black at centre falling to zero |
| Garden Estates | `board-centre-crest-300x220.png` | 300x220 transparent, painted enamel plaque reading Garden Estates with a trowel-and-cold-frame emblem, warm gold on deep green, soft edge glow |
| Garden Estates | `tile-icons-sheet-256x256.png` | 256x256 transparent, 4x4 grid of 32px painted icons: seed cart, sun lamp, watering can, compost heap, garden bench, gate arch, almanac book, rain cloud |
| Garden Estates | `house-greenhouse-24x24.png` | 24x24 transparent, a tiny painted cold-frame greenhouse, glass panes catching gold |
| Garden Guard | `assets/gg/maps/map_w1_herbspiral.png` | 540x960 full-bleed portrait, under 512KB. Same night garden, different signature terrain: a stone herb spiral, thyme and sage tufts, path painted in. |
| Garden Guard | `assets/gg/maps/map_w1_pond.png` | 540x960 full-bleed portrait, under 512KB. Moonlit pond edge, reeds, lily pads, wet stone path painted in. |
| Garden Lines | `gl-tile-faces-576x96.png` | 576x96 PNG, transparent, six 96x96 painted botanical tokens: fern frond, toadstool, seedling, sun, dew drop, blossom - house palette, warm rim light, big readable silhouettes |
| Garden Lines | `gl-seed-bag-64x64.png` | 64x64 PNG, transparent, a small linen drawstring seed bag, warm gold rim light |
| Garden Path | `tile-flower-6x-96x96.png` | six painted flower heads at 96x96 each, transparent PNG, one per COLORS entry (Poppy, Marigold, Sunflower, Fern, Forget-me-not, Violet), each with a genuinely DIFFERENT petal silhouette and warm rim light |
| Garden Path | `throne-256x256.png` | 256x256 transparent PNG, painted mossy stone throne with a gold crown resting on it, warm rim light from the left |
| Garden Path | `path-ribbon-tile-64x64.png` | 64x64 tileable painted stepping-stone and gravel strip with soft dirt edges and a transparent margin |
| Garden Rummy | `assets/decks/floral/card-front-frame-256x356.png` | 256x356 transparent, cream card face with painted deckle edge and hairline floral border inset 6%, centre transparent |
| Garden Spades | `assets/games/gardenspades/trick-well-420x360.png` | 420x360 transparent, a shallow carved-wood inlay: a soft-edged oval depression with a faint gold compass rose or leaf medallion at 12% opacity, contact shadow around the rim |
| Garden Spades | `assets/decks/floral/card-front-frame-256x356.png` | 256x356 transparent, cream card face with a painted deckle edge, a hairline floral border inset 6%, and a soft inner shadow; centre transparent for the pip |
| Glyph Forge | `art-slots/rune-roll.png, rune-hollow.png, rune-gust.png, rune-drop.png, rune-ember.png (+25 more, all named in ASSET_MANIFEST.json)` | 512x512 PNG, transparent or dark ground, renders inside a 5:7 card at roughly 80x110. One illuminated sigil on aged parchment, glowing edge, distinct silhouette at thumbnail size. |
| Go (Living Stones) | `board-kaya-380x380.png` | 380x380, full-bleed opaque, painted kaya-wood goban surface with visible grain running vertically, a soft warm vignette at the corners and an inner shadow along the top edge |
| Go (Living Stones) | `stone-black-96x96.png` | 96x96 transparent, painted slate Go stone, lens profile, cool top-left specular highlight, soft dark contact shadow baked into the bottom third |
| Go (Living Stones) | `stone-white-96x96.png` | 96x96 transparent, painted clamshell Go stone, warm cream with faint shell banding, top-left highlight, soft contact shadow |
| Golf Solitaire | `card-contact-shadow-140x48.png` | 140x48 transparent PNG, soft elliptical drop shadow, about 30 percent black at centre falling to zero |
| Hexa Hive | `assets/comb-frame-540x540.png` | 540x540 PNG, transparent, a painted wax comb frame with real wax thickness, warm gold rim light on the upper-left edge of each cell, empty cells dark honey rather than black. |
| Hues | `frame-swatch-default-320x220.png` | 320x220 transparent 9-slice with a 25% slice inset, painted brass-and-cream picture frame with a soft inner shadow lip |
| HUNCH | `assets/currency/coin_hunch@3x.png` | 256x256 transparent PNG, a lime-and-teal coin mark with neon glow, 12% safe margin |
| Inkbound | `frame-bed-edge-96x96-9slice.png` | 96x96 transparent 9-slice: a painted planter-bed rim in wet soil with moss in the corners and a few pebbles, soft shadow on the inner edge |
| Inkbound | `dpad-key-144x144.png plus dpad-key-pressed-144x144.png` | 144x144 transparent, a painted stone or root cap key with a carved arrow, warm rim light, and a pressed variant sunk 4px with a darker top |
| Jumping Jimothy | `assets/ui/star_ink_48x48.png plus star_ink_empty_48x48.png` | Two 48x48 transparent PNGs, brush-drawn stars in the same ink as the key art, one filled one outline. |
| Kakuro | `kakuro-clue-tile-96x96.png` | 96x96 transparent PNG, dark slate tile with a real gold diagonal rule corner to corner at about 35 percent alpha, subtle top bevel, transparent corners for the numerals |
| Keepsies | `assets/env/ring-chalk-1024.png` | 1024x1024 PNG, transparent, a scraped and chalked ten-foot ring with worn breaks and scuffed dirt inside the line, projected flat onto the ground plane as a decal. |
| Klondike | `assets/decks/floral/card-back.png` | 240x336 (renders ~48x66 at 1x), full-bleed opaque, no transparency |
| Klondike | `assets/games/cards/foundation-slot-240x336.png` | 240x336 transparent PNG, one file with a faint suit sigil per corner variant or four files |
| Lamplighter | `tile-cobble-96x96.png` | 96x96 seamless tile, warm grey cobbles with dark mortar and a faint damp sheen, neutral enough to take a gold light wash |
| Letter Launch | `satellites/letter-launch/docs/art/peg-brass-48x48.png` | 48x48 transparent. A painted brass bumper peg with a top highlight and a soft contact shadow underneath. |
| Letter Launch | `satellites/letter-launch/docs/art/coin-gold-40x40.png` | 40x40 transparent. Painted gold coin with a struck star face and a rim, matching the amber #eaa53b token already in the HUD. |
| Letter Launch | `satellites/letter-launch/docs/art/item-shuffle-64x64.png` | 64x64 transparent, three files: item-shuffle, item-recycle, item-bomb. Painted objects in the game's own wood-and-brass language, not glyphs. |
| Lights Out | `frame-lights-420x420.png` | 420x420 transparent, 9-slice mossy stone-and-root border with rounded corners, ~28px inset |
| Line Loom | `assets/station-circle-96.png, station-square-96.png, station-triangle-96.png` | 96x96 PNG each, transparent, a painted stone waymarker in that shape seen from slightly above, cream rim light on the upper edge, soft shadow pooled beneath. Must read at 32px. |
| Line Loom | `assets/bridge-96x48.png` | 96x48 PNG, transparent, a plank-and-rope bridge seen from above with a warm timber tone, rotatable about its centre. |
| Line Loom | `assets/river-foam-540x120.png` | 540x120 PNG, transparent, tileable horizontally, foam and wet-stone bank for the top and bottom edges of the river band. |
| LOAF | `card-art-placeholder-300x300.jpg` | 300x300, painted amber-lit windowsill with an empty cushion and a dust mote or two, plum shadows, warm rim light from the right, matched to --panel #221733 at the edges so it seats in the card |
| LOAF | `index-tile-ground-108x24.png` | 108x24 transparent PNG, a soft painted shadow ellipse, mid-plum fading to nothing |
| Loop Warden | `loop-ring-540x540.png` | Transparent PNG of a painted brass and dark-wood clock ring with 16 engraved recessed tile slots around it, quadrant enamel inlays in indigo, rose, gold and copper, and small engraved marks at the four time positions. |
| Loop Warden | `ui/warden-sheet-384x128.png` | Four 96x128 painted portraits for the wardens the wardrobe already defines (Warden, Knight, Ranger, Moth Monk), transparent, chest-up, in house palette. |
| Loop Warden | `ui/palette-swatch-96x96 x3` | Three painted 96x96 swatch chips for the Emberwood, Frostmere and Gloaming loop palettes, each showing that palette's ring and ground in miniature. |
| Mancala | `board-seedsow-960x420.png` | 960x420 transparent PNG, carved olive-wood mancala board seen slightly from above, 12 pits plus 2 end stores, visible end grain, warm gold rim light on the top lip, cool shadow inside each pit |
| Mancala | `seed-seedsow-48x48.png` | 48x48 transparent PNG, one painted amber seed husk with a specular highlight and a soft drop shadow; ship 3 rotation variants in a 144x48 strip |
| Meadow Weave | `tray-shelf-540x150.png` | 540x150 transparent PNG, painted dark wood shelf with a warm gold lip along the top edge and a soft drop shadow above it |
| Memory | `00-card-back-v2.png` | 540x720 at 3:4 with TRANSPARENT corners, sage-and-gold Celtic knot back on deep near-black, warm rim light, a single small rose accent |
| Memory | `card-frame-3x4.png` | 240x320 transparent 9-slice, thin gold double-line with corner knots in the set-51 seasonal-knot language, ~14px inset |
| Memory Meadow | `assets/games/recall/sym-*.png (20 files)` | 20 PNGs at 96x96 with alpha, one per SYMBOLS entry in games/recall.js (Fern, Bloom, Sun, Spore, Pine, Grain, Clover, Cactus, Palm, Leaf, Hibiscus, Bouquet, Rose, Tulip, Lavender, Berry, Grape, Root, Corn, Apple), painterly, warm rim light, big readable silhouette, sage and gold and rose on transparent |
| Memory Meadow | `assets/games/recall/card-face-148x172.png` | 148x172 (2x of the 74x86 card) nine-slice-safe card face: dark pressed-earth panel, thin gold rule inset 4px, soft inner shadow |
| Memory Meadow | `assets/games/recall/card-face-selected-148x172.png` | same size, sage-lit variant with a warm outer glow |
| Minesweeper | `assets/games/minesweeper/hidden-tiles-4x-256x256.png` | 256x256 sheet holding four 128x128 tile variants (different moss, pebbles, root fragments), under 120KB total |
| Minesweeper | `assets/games/minesweeper/board-frame-1080x1080.png` | 1080x1080 transparent PNG, 9-slice with mitred corners |
| Mini Crossword | `assets/games/mini-crossword/paper-newsprint-560x560.png` | 560x560 transparent PNG, painted paper card with softly torn edges, faint fibre texture, warm cream-grey, slight lift shadow baked in |
| Mini Crossword | `assets/games/mini-crossword/key-cap-56x72.png` | 56x72 transparent PNG, painted keycap with a warm top bevel and a soft bottom lip, 9-sliceable centre |
| Moon Claw | `plush-sheet-512x512.png` | 512x512 transparent sheet, 16 painted plushies at 128x128 (frog, owl, moth, moon, koi, toad, mushroom, bee, snail, fox kit, acorn, star, and 4 variants), each with a soft warm rim light from the top-left and stitched-seam detail |
| Moon Claw | `cabinet-frame-420x560.png` | 420x560 transparent, painted cabinet chrome and wood frame with a lit marquee, glass reflection streaks baked into the upper third, hollow centre |
| Mosaic Draft | `shards-sheet-640x256.png` | 640x256 transparent PNG, 5 columns x 2 rows of 128px cells: Cobalt / Amber / Jade / Garnet / Pearl, top row matte unglazed with a chipped edge, bottom row glazed with a wet specular streak top-left and a warm bounce along the bottom; keep each kind's distinct glyph shape (tri/cir/sq/star/cross) pressed into the clay rather than drawn on top |
| Mosaic Garden | `tile-petal.png / tile-leaf.png / tile-berry.png / tile-sun.png / tile-frost.png` | five 96x96 transparent, glazed ceramic tiles with a rim highlight, a soft drop shadow and a painted motif (petal, leaf, drop, sun, flake) in the existing colours #e07a8a #6bad4a #5b9bd5 #d4a843 #a0c4e8 |
| Mosaic Garden | `panel-tray-9slice.png` | 320x320 transparent 9-slice, mossy stone tray edge with a shallow inner lip, ~24px inset |
| Mosaic Garden | `factory-dish-152.png` | 152x152 transparent, painted shallow stone dish with a worn rim, top-down |
| Mouse Trap | `hex-soil-96x96.png / hex-hedge-96x96.png / hex-edge-96x96.png` | three 96x96 transparent PNG hex tiles - turned earth with pebbles, a clipped box hedge with warm rim light, and a gold-lit garden-edge tile with the soil falling away past it; each drawn to the same hex outline so they tessellate |
| Music Studio | `tex-song-slate-256x256.png` | 256x256 seamless tile, near-black brushed slate grain at about 4 percent contrast, tileable in both axes |
| Music Studio | `icon-song-dice-48x48.png` | 48x48 transparent PNG, a painted bone-white die with warm rim light and a soft shadow, one face showing |
| Nectar Drop | `satellites/nectar-drop/assets/ui/tut-peg-256x256.png and tut-bloom-256x256.png` | 256x256 transparent PNGs, painted: a wooden peg with pollen dust caught on it; a red bloom mid-pop with petals scattering |
| No Pain, No Gain | `traps-sheet-576x288.png` | 576x288 transparent sheet, 12 painted trap icons at 96x96, all in the game's gold / clay / sage palette with a warm rim light: spikes, spring, saw, bomb, fan, laser, hammer, balloon, tesla coil, portal, black hole, bin |
| Nonogram Bloom | `cell-filled-96x96.png` | 96x96 transparent, a single painted sage leaf-tile with a warm gold rim light on its top-left edge and a soft shadow at the bottom, designed to tile cleanly edge to edge |
| Orb Orchard | `horizon-dawn-540x260.png` | 540x260 transparent PNG, bottom-aligned to the horizon line: warm gold haze fading up to transparent, a soft low cloud shelf, faint dark orchard silhouettes along the very bottom edge, no hard edges anywhere |
| Orb Orchard | `orbs-sheet-384x96.png` | 384x96 transparent PNG, four 96px cells: dew orb (cool glass, cool rim light top-left, warm bounce under), sunbead (gold torus with an inner glow), thorn (spiked black-plum silhouette, unmistakably hostile), bumper (silver studded puck) |
| OriVex | `tray-shelf-750x210.png` | 750x210, full-bleed, transparent above the shelf line. A painted wooden or folded-paper ledge with a soft cast shadow under its front lip. |
| Parallel | `tile-wall-92x92.png` | 92x92 transparent, painted stone block with a warm top rim light and a dark bottom bevel, 3 variants; must still read at 30px, the 12x12 phone cell size named in ART_ASSETS.md |
| Parallel | `pad-icons-64x64.png` | 4-up 64px sheet on transparent (left, jump, wait, right) painted in cream with a warm rim, matching stroke weights |
| Petal Alchemy | `satellites/petal-alchemy/assets/elem-air.png, elem-seed.png, elem-soil.png, elem-sun.png, elem-water.png` | 128x128 transparent PNGs each: a pollen-lit curl of wind; a seed with a split husk; a crumb of dark loam on a leaf; a small sun cabochon; a dew bead with a highlight. Warm rim light, big readable silhouette |
| Petal Alchemy | `satellites/petal-alchemy/assets/shelf-empty-240x240.png` | 240x240 transparent PNG, a painted empty shelf bracket with one dusty jar, intended to render at about 25% opacity |
| Petal Plunge | `mode-icons-256x256.png` | 256x256 transparent sheet, four painted 64x64 icons: a leaf sled, a bamboo gate pair, a trick spiral with petals, a dew-drop day marker |
| Petal Slice | `pod_long_140x230.png` | 140x230 transparent PNG, an elongated milkweed-style seed pod, split seam down the long axis, matt sage skin with a soft broad highlight instead of a hard specular ellipse |
| Picnic Panic | `picnic-swarm-sheet-512x512.png` | 512x512 transparent, 8 cells of 64x64 (fly, ant, mosquito, beetle, ladybug, wasp, butterfly, cricket) painted as one family: same warm gold rim light, same 3px cream outline, same top-down 3/4 angle |
| Picnic Panic | `picnic-powerup-icons-320x64.png` | 320x64 transparent, 10 cells of 32x32: painted seed pods, thorn, spore cap, honey drop, blossom, hourglass, ward sigil |
| Plot Bloom | `tile-plot-empty-96x96.png` | 96x96 transparent PNG, painted square of tilled earth with a soft raised rim and a top-left highlight |
| Plot Bloom | `piece-flower-96x96.png (plus piece-tree, piece-pond, piece-hive, piece-bench, piece-veg, piece-hedge at the same size)` | seven 96x96 transparent PNGs, painted top-down garden props, one light direction from top-left, matched silhouette mass so no piece dominates |
| Pollen Panic | `hedge-tile-64x64.png` | 64x64, tileable and 9-sliceable, transparent corners. A painted boxwood hedge block: sage green mass, warm gold rim light along the top edge, a soft dark shadow along the bottom. |
| Pollen Panic | `pests-sheet-256x64.png` | 256x64, four frames at 64x64, transparent. Aphid, beetle, moth, snail. Each a clearly different silhouette (round, domed, winged, shelled) in the game's pink and violet range with a cream eye highlight. |
| Pollen Panic | `sunberry-32x32.png` | 32x32, transparent, with a soft warm bloom baked in. A painted berry with a gold highlight and a small leaf. |
| Pollinator Paths | `flowerpad-butterfly-96x96.png` | 96x96 transparent, same pad language, rose petals, butterfly silhouette, dashed gold inner ring baked in |
| Pollinator Paths | `flowerpad-hummingbird-96x96.png` | 96x96 transparent, cream-gold petals, hummingbird silhouette, dotted inner ring baked in |
| Pollinator Paths | `flier-bee-48x48.png` | 48x48 transparent, side-on painted bee, warm gold rim light, big readable silhouette, 3-frame wing strip optional |
| Pollinator Paths | `ring-blossom-128x128.png` | 128x128 transparent, rose petal ring with a soft inner glow and a faint gold pollen dust |
| Pong Arena | `paddle-skins-512x256.png` | 512x256 transparent, 8 cells of 128x32: painted paddle skins (chrome, brass, mossed stone, bone, obsidian, gold) each with a specular highlight and a soft under-shadow |
| Power Scalers | `ui-card-frame-540x180.png` | 540x180 nine-slice, transparent. A thin brass-and-bone frame with a slightly heavier top rail and corner rivets. |
| Pyramid | `pyramid-frame-540x420.png` | 540x420 transparent, thin vine-and-Celtic-knot corner frame sized to the pyramid area, gold #c8a84b at 40% with a sage inner line, corners only (no full box) |
| Reversi | `board-frame-reversi-460x460.png` | 460x460, transparent PNG with a transparent 8x8 well in the centre and a 30px carved stone-and-vine border, soft inner shadow on the well lip, warm rim light top-right. |
| Reversi | `disc-moss-96x96.png` | 96x96, transparent PNG. Painted moss stone: wet rim light, a real leaf blade with visible venation, a soft ground shadow. House sage palette. |
| Reversi | `disc-lichen-96x96.png` | 96x96, transparent PNG. Painted lichen stone: crusted gold plates, a bone-white rosette, a soft ground shadow. House gold palette. |
| Rhythm and Vine | `note-leaf-sheet-336x44.png` | 336x44 transparent strip, four 84x44 painted leaf/petal notes tinted pink, gold, orange and blue to match the lanes, soft painterly with a warm rim light and a faint inner glow |
| Root Flow | `assets/games/rootflow/seed-*.png (10 files)` | 10 PNGs at 96x96 with alpha, one per COLORS entry: painted seeds and bulbs (acorn, bean, corm, tuber, sunflower seed, pip, hull, spore case, stone, rhizome), each a different SHAPE not just a different colour, warm rim light |
| Root Flow | `assets/games/rootflow/root-arm-sheet.png` | 192x64 strip with alpha: a straight root segment and an elbow, tapered and slightly irregular, tintable white-on-alpha |
| Root Groups | `group-crest-1-64x64.png (plus -2, -3, -4)` | four 64x64 transparent PNGs: a leaf, a root knot, a seed pod and a bloom, painted in the four group tints t1 sage / t2 blue / t3 gold / t4 rose |
| Root Groups | `root-flourish-540x200.png` | 540x200 transparent PNG, a painted root and vine flourish that fades out at both ends, meant to sit low in the frame behind the control bar |
| Root Maze | `tile-sheet-rootmaze-512x512.png` | 512x512, transparent PNG. A 4x4 sheet of 128px painted maze tiles: straight, elbow, tee, cross, each in a plain and a fixed/gilded variant. Real root bark on the corridors, a soft inner shadow at the tile seam, warm rim light from top-right. |
| Root Maze | `treasures-sheet-576x192.png` | 576x192, transparent PNG. Eighteen painted 96x96 botanical tokens matching the TREASURES array at games/rootmaze.js:16 (sunflower, rose, tulip, mushroom, hyacinth, cactus, bamboo, clover, cherry blossom, potted plant, hibiscus, maple, wheat, lotus, herb, seedling, deciduous, evergreen), house palette, big readable silhouettes distinguishable at 24px. |
| Root Rush | `root-blocks-sheet-512x512.png` | 512x512 transparent sheet: 6 painted root segments (h2, h3, v2, v3 plus two knotted variants) with bark texture, side nubs and a visible cut end, each in a distinct wood tone - one pale birch-root, one grey-barked, one dark peat, one ruddy |
| Root Rush | `seed-pod-block-160x80.png` | 160x80 transparent, a warm seed pod with a real painted sprout breaking from its top, sage leaves, gold rim light, soft inner glow |
| Root Weave | `how-icon-daily-64x64.png` | 64x64 transparent, a dew-marked leaf calendar in sage and gold |
| Rootbound | `planter-tile-128x128.png` | 128x128, transparent, 9-sliceable (32px corners). Painted terracotta and weathered wood planter block with warm gold rim light on the top-left edge and a soft cast shadow on the bottom-right. |
| Rule Root | `tile-word-verb-128x96.png` | 128x96 transparent, a carved sage stone slab with a warm gold rim light and a shallow chiselled face for the word |
| Rule Root | `tile-word-noun-128x96.png` | 128x96 transparent, a rooty bark-wrapped variant of the same slab, copper-toned |
| Rule Root | `lvlcard-frame-96x96.png` | 96x96 transparent, a small painted seed-pod frame; ship a second gold-lit solved variant lvlcard-frame-done-96x96.png |
| Sea Battle | `assets/games/battleship/miss-ripple-96x96.png` | 96x96 transparent PNG. A pale sage water ring with a soft second ring and a faint foam speckle, 40% opacity core. |
| Season Sway | `visitor-portraits-sheet-1024x1024.png` | 1024x1024 transparent, 64 cells of 128x128 for the 40 visitors plus spares: painted storybook busts, warm rim light, each with a distinct silhouette (mole vs hedgehog, toad vs chorus frog, heron vs dove) |
| Season Sway | `card-face-parchment-540x620.png` | 540x620, warm cream vellum with a deckled edge, faint pressed-leaf watermark, a 2px gold inner rule and a soft inner shadow, 9-slice safe margins of 40px |
| Seed Reel | `tile-soil-92x92.png` | 92x92 transparent, a soft painted soil cell: rounded dark loam square with a faint pressed rim and a hint of grain |
| Seed Reel | `sprites-seedreel-552x460.png` | one atlas, 6 cols x 5 rows of 92x92 transparent painted icons covering the 28 SYMS keys (seed, sprout, leaf, clover, grass, berry, flower, worm, mushroom, foxglove, bee, rain, sun, tree, moon, koi and the rest) |
| Seed Toss | `pot-terracotta-120x140.png` | 120x140 transparent, painted tapered flowerpot, warm rim light from upper-left, dark inner mouth, soft contact shadow baked out |
| Seed Toss | `seed-32x32.png` | 32x32 transparent, painted seed with a warm specular highlight and a faint sprout tip |
| Shell Shuffle | `cup-greenhouse-260x300.webp` | 260x300 WebP at aspect ~1.15 to match the existing skin contract, sage-and-gold botanical pattern (fern fronds, a gold rim band) on a near-black ground. |
| Shut the Box | `shutbox-tile-covered-96x96.png` | 96x96 transparent PNG, a face-down tile: dark wood in shadow, single brass pin, faint top-edge highlight |
| Silt | `assets/ui/how_icons_88x88.png` | 880x88 transparent PNG, ten 88x88 cells in a row: goal ring, pointing hand, sprout, pulse heart, flame, bloom, prism shard, stone, moss frond, film clapper. Sage and gold on transparent, warm rim light, readable at 34px. |
| Skitterlings | `fav-slot-empty-96x96.png` | 96x96 PNG, transparent. A soft dashed sage ring with a faint sleeping skitterling curl inside at 25% opacity. |
| Skyshot | `moonbud-set-256.png` | One sheet, four cells at 256x256, transparent PNG. Four distinct bud silhouettes: a closed bud, a half-open bud, a wide bloom, and a spiny bramble bud. Cream centre, warm gold petals, cool rim light on the moon-facing edge. |
| Sled Vine | `assets/ui/how_icons_88x88.png` | 616x88 transparent PNG, seven 88x88 cells: goal flower, ink pen, bloom-gate ring, sprouting leaf pair, thorn cluster, eraser, calendar. Painted sage and gold on transparent, warm rim light, readable at 34px. |
| Sled Vine | `assets/backgrounds/bg_grove_canopy_540x300.png` | 540x300 transparent PNG, a soft canopy of vine and hanging seed pods along the top edge, fading to fully transparent by 60% height. |
| Snakes & Ladders | `board-frame-500x500.png` | 500x500 PNG, transparent centre. A carved sage-and-gold wooden rim about 22px thick with mitred corners, a Celtic corner knot at each corner, and an inner drop shadow onto the play squares. |
| Snakes & Ladders | `die-face-128x128.png` | Six 128x128 PNGs (die-1 through die-6), transparent. Bone-cream die with a warm gold pip inset, soft top-left key light, rounded corners. |
| Sokoban | `wall-hedge-128x128.png` | 128x128 transparent. Repaint the bramble at roughly 2.5x its current luminance (target mean RGB ~45-55, currently 17,19,15), with a sage-lit top edge and a warm rim on the left so it reads as a solid barrier, and edges that butt cleanly against a neighbouring hedge tile. |
| Sokoban | `board-frame-540x540.png` | 540x540, 9-slice-friendly: a painted raised soil/timber garden-bed border ~28px thick, transparent centre, a few trailing leaves overlapping the top-left and bottom-right corners. |
| Speed Sort | `card-face-100x140.png` | 100x140, transparent PNG. A painted seed-packet card face: aged paper, a stitched or torn edge, a soft drop shadow, blank centre so the existing clover/pot/droplet SVG shapes draw on top of it. |
| Speed Sort | `pile-slot-120x170.png` | 120x170, transparent PNG. An empty painted card slot recessed into the bench: inner shadow, a shallow lip, faint soil dust in the corner. |
| Spore Drift | `mote-warm-64x64.png` | 64x64 transparent, a warm gold food mote with a soft halo, matching the existing motes sheet slicing |
| Sproing | `sproing-tools-sheet-192.png` | One sheet, eight cells at 192x192, transparent PNG. Brush small, brush large, brush dot, eraser, fill bucket, eyedropper, undo arrow, trash. All painted in the same warm-cream-on-sage house palette with a single light source from upper left. |
| Sproing | `sketchbook-frame-343x260.png` | 343x260 at 1x, export 1029x780 at 3x, transparent PNG with a 16px 9-slice border. A pinned sketchbook page: torn top edge, faint paper tooth, a soft cast shadow on all four sides, corner tape. |
| Sprout Dice | `assets/bg_trellis.jpg` | 540x960 full-bleed JPG. Painted trellis of dark timber and climbing sage vine, warm light low in frame cooling to blue up top, structurally simple through the middle so 15px node titles stay readable under a .55-to-.72 scrim. |
| Star Field | `pip-planted-64x64.png` | 64x64 transparent painted seed pip: a small cream seed with a warm gold rim light and a faint shadow |
| Stone Garden | `rail-stonegarden-96x1334.png` | 96x1334 transparent PNG, a painted stone shelf or bamboo rail with a lit top edge, mirrorable for the right side |
| Stop at Ten | `frame-corner-leaf-64x64.png` | 64x64 transparent, a painted gold leaf-and-tendril corner ornament, designed to mirror into all four corners |
| Stop Motion | `onion-ghost-frame-540x470.png` | 540x470 PNG, transparent. A soft cream corner-bracket viewfinder with a faint rule-of-thirds grid and a small ghost-icon badge in the top right. |
| Stop Motion | `empty-strip-slot-96x96.png` | 96x96 PNG, transparent. A dashed sage frame outline with a small sprocket edge on the left and a faint plus at 30% opacity. |
| Stop the Light | `howto-icons-144.png` | One sheet, seven cells at 144x144, transparent PNG. Firefly, ring, gold band, scales (bank vs go again), a broken ring (miss), three fireflies, a drifting band. All in warm cream on transparent, one weight, one light source. |
| Story Seeds | `prompt-card-540x260.png` | 540x260, transparent outside the card. Deckled cream-green parchment with a soft warm shadow, a pressed fern in the top-left corner, a thin gold rule across the lower third where the category sits. |
| Story Seeds | `icon-prompt-96x96-observation.png (plus -perspective, -memory, -imagination, -senses, -feeling, -gratitude, -wisdom)` | Eight 96x96 transparent painted emblems, warm rim light, big silhouette at 48px: an open eye; a rain-struck leaf; a pressed dried flower; a moon over a garden gate; a hand in soil; a heart-shaped leaf; two folded hands; a river-worn stone. |
| Sudoku | `sudoku-board-paper-880x880.png` | 880x880 (2x the 440px max grid), transparent outer edge. Aged vellum/ledger paper in cream-over-charcoal at low opacity, soft inner vignette, a faint hand-ruled hairline exactly on the 3x3 box lines, worn corners. |
| Sweet Spot | `racket-swing-320x220.png` | 320x220 transparent PNG, foreground racket head entering from the bottom-left on the swing, strings with slight motion blur, warm rim light on the frame |
| Tangent | `deck-face-1024x1024.png` | transparent PNG, 1024 square, drawn top-down. Brushed metal dish face, warm rim light on the upper-left lip, real bolt heads with cast shadow, engraved index mark and orbit ring. |
| Tempo Grove | `tile-sun-60x60.png` | 60x60 transparent PNG (2x of the 30px CELL), painted warm gold seed pod with a lit dome, a soft cast shadow at the lower right and a cream rim on the upper left |
| Tempo Grove | `tile-moon-60x60.png` | 60x60 transparent PNG, painted indigo hollow bud with a cool rim highlight and an open centre so it reads as the inverse of the Sun tile at a glance |
| Tempo Grove | `petal-16x16.png (4 colour variants: rose, cream, gold, sage)` | 16x16 transparent PNGs, single painted petals with a soft edge and a faint inner vein, four hue variants for the garden border |
| Tempo Grove | `next-tray-300x160.png` | 300x160 transparent PNG, a shallow painted wood-and-leaf tray with a warm inner shadow, sized to sit under the three NEXT preview pieces |
| Tetroku | `sprig-6x-128x128.png` | six painted leaf sprigs at 128x128 transparent PNG, one per piece colour, each a different leaf shape, tinted sage / warm gold / rose / copper / pale blue / cream, soft rim light |
| Tetroku | `board-plinth-96x96-9slice.png` | 96x96 transparent 9-slice painted stone-and-bark frame with a soft inner shadow and mossy corners |
| Tetroku | `bloom-burst-256x256.png` | 256x256 transparent painted pollen and petal burst, warm gold centre falling to transparent, additive-friendly |
| The Attic | `shelf-plank-540x120.png` | 540x120, tileable horizontally, painted worn pine plank with a shadow lip along the front edge. |
| Think Fast | `sprout-droopy-160x160.png + sprout-happy-160x160.png` | 160x160 transparent pair, painted seedling - wilted with a curled leaf, then perked with a water bead and a soft rim light |
| Three Sisters | `card-face-set-256x358.png` | 256x358 (2.5:3.5), transparent corners. Aged cream-green card stock, subtle paper grain, a 4px sage inner rule inset 8px, soft warm drop shadow baked into the lower edge. |
| Three Sisters | `card-glow-selected-256x358.png` | 256x358, transparent, additive. A warm gold bloom hugging the card border, brightest at the corners, falling off to nothing 20px in. |
| Times Table Quest | `chalk-frame-540x420.png` | 540x420 transparent, hand-drawn chalk double rule with soft corner flourishes sized to wrap the 12x12 grid |
| Times Table Quest | `tile-tex-64x64.png` | 64x64 seamless faint paper/chalk tooth, greyscale, to multiply over the cells at about 8% opacity |
| Tinker Loft | `parts-sheet-512x512.png` | 512x512 transparent PNG, 4x4 grid of 128px painted part icons (plank, domino, fan, balloon, funnel, seesaw, scissors, marble, spike, basket, bell, bucket, saw, string), warm brass-and-wood rim light, silhouettes matching the canvas renderers |
| Tinker Loft | `goal-home-256x256.png` | 256x256 transparent PNG, painted brass cup or woven basket 'home' with a warm inner glow, soft ground shadow |
| Tower of Hanoi | `hanoi-plank-660x120.png` | 660x120 PNG, transparent, a painted worn wood plank with visible grain, cut and chamfered ends, and a soft contact shadow baked into the bottom edge |
| Tower of Hanoi | `hanoi-peg-32x220.png` | 32x220 PNG, transparent, a turned wooden dowel with warm rim light on the left, a socket collar at the base, tall enough to stand clear above a full 8-disk stack |
| Tower of Hanoi | `hanoi-disk-sheet-1280x160.png` | 1280x160 PNG, transparent, eight 160x160 disks largest to smallest, painted stone and wood rings in sage through gold to terracotta, each with a real top face and a visible centre hole |
| TriPeaks | `tripeaks-slot-empty-96x134.png` | 96x134 transparent PNG, faint sage outline of a card with a small corner knot, ~18% opacity |
| Twin Lanterns | `stone-lit-192.png and stone-dark-192.png` | Two 192x192 PNGs, transparent, painted river stone - one warm-lit with a soft inner glow, one dark and wet. |
| Twin Lanterns | `help-icons-5x128.png` | One sheet, 5 cells at 128x128, transparent: lantern, gift stone in a palm, a thought mark, two hands passing a phone, a flame. One painted style, warm rim light. |
| Vine Puzzle | `assets/games/pipe/vine-straight-b.png` | 128x128 PNG with ALPHA, vine only, no soil - a second straight run with a different leaf count and a knot in the wood |
| Vine Puzzle | `assets/games/pipe/vine-source.png` | 128x128 REPAINT - a pale sprouting seed with two cotyledons pushing out of the soil and one clear exit direction |
| Vine Runner | `art/run-2.png` | 512x512 transparent PNG, the second frame of the Sprout run cycle: opposite leg forward, leaves trailing the other way, matched exactly to run.png's outline weight and rim light |
| Vine Words | `vinewords-frame-800x800.png` | 800x800 transparent PNG. Woven willow square frame ~48px thick with visible twist and tendrils, three leaves overlapping the corners so the silhouette is not a perfect square. Inner opening 704x704 for the 4x4 grid. |
| Vine Words | `vinewords-tile-96x96.png` | 96x96 transparent PNG. Painted bark-and-moss rounded tile, soft top-left rim light, seated shadow at the bottom, faint grain. Blank face; the letter is drawn over it. |
| Vine Words | `vinewords-tile-lit-96x96.png` | 96x96 transparent PNG. Same tile with a warm gold bloom in the bevel and a brighter rim, for the in-path selected state. |
| Vinewinder | `board-trellis-630x630.png` | 630x630 transparent PNG (2x of the 315px board), painted wooden lattice with soft moss in the corners and a faint paper tooth, designed to multiply under the vine at ~30% strength |
| Vinewinder | `seed-sprites-256x256.png` | 256x256 transparent PNG, 2x2 grid of 128px painted seeds (pollen, petal, moon, dew) each with its own silhouette and a small matching glow |
| Vinewinder | `petal-icon-128x128.png` | 128x128 transparent PNG, painted marigold petal token, warm gold with a soft rim light |
| Wireworm | `assets/ww-substrate-1024.png` | 1024x1024 PNG, tileable, dark solder-mask green with ghost copper traces, dust, subtle vignette; drawn into the 373x373 board. |
| Wireworm | `assets/ww-bezel-frame-512.png` | 512x512 PNG, transparent centre, 9-slice-safe brass bezel with screw heads at the corners and a warm inner rim light. |
| Wireworm | `assets/ww-wire-autotile-32x256.png` | One sheet, 32 cells at 256x256, transparent: 16 neighbour combinations x 2 states (live copper, dead oxidised). Live cells carry the bead/solder joint painted in. |
| Wireworm | `assets/ww-head-8x256.png` | One sheet, 8 cells at 256x256, transparent: the worm head at eight headings, painted as a cream ceramic bead with two dark eyes, plus a dead variant tint. |
| Word Search | `wordsearch-frame-9slice-96x96.png` | 96x96 transparent PNG cut as a 9-slice with 32px corners, thin sage-and-gold botanical border with small corner knots |
| Word Search | `wordsearch-theme-flora-128x128.png (plus -harvest, -lunar)` | 128x128 transparent PNGs, one small painted motif per word theme: a pressed leaf, a wheat sheaf, a moon-and-moth |
| Word Sprout | `sprout-stage-96x96-1.png through sprout-stage-96x96-6.png` | Six 96x96 transparent painted growth stages: seed, split husk, two seed-leaves, true leaves, bud, open bloom. Warm rim light from the left, big readable silhouette at 48px. |
| Word Sprout | `key-cap-64x84.png` | 64x84 nine-slice PNG: warm dark stone/wood key cap, 2px lit top edge, soft shadow at the bottom, transparent outside the rounded rect. |
| Word Trellis | `trellis-board-frame-880x880.png` | 880x880 transparent PNG, 9-slice safe. Carved wooden frame ~44px thick with real grain, brass corner pegs, warm rim light on the top-left edge, soft contact shadow baked into the outer 20px. Inner opening 792x792. |
| Word Trellis | `trellis-tile-ivory-96x116.png` | 96x116 transparent PNG. Bone-ivory tile with a soft bevel, faint bone grain, warm rim light top edge, seated shadow bottom. Blank face; letter and value drawn over it. |

## Icons, chips & HUD  (31 assets across 26 games)

| game | file | spec |
|---|---|---|
| Aura Farm | `icon-essence-128.png (x6: joy, hope, awe, sorrow, rage, dread)` | 128x128 each, transparent, painted glass-bead essence motes in the six existing emotion colours (#ffd75e, #8effc1, #9ef3ff, #6fa8ff, #ff6b52, #b06bff) |
| Berry Vine | `satellites/berry-vine/assets/ui/icon_home.png` | 60x60 transparent PNG, a painted arcade-door or wolf-mark glyph in the same warm gold-on-olive as the other six ui/icon_*.png files. |
| Blobworks | `btn-pause-clay-96x96.png` | 96x96 transparent, a sculpted clay button with two brass pause bars pressed into it, warm rim light on the top edge |
| Block Drop | `assets/games/petalfall/icon-hold / -drop / -fast / -pause-96x96.png` | four 96x96 transparent PNGs in var(--gold) |
| Burr Blast | `icon-feedback-64.png` | 64x64, transparent, a small painted ladybug in the game's warm palette with a soft rim light |
| Checkers | `assets/games/checkers/btn-undo-160x96.png and btn-hint-160x96.png` | 160x96 transparent each, carved wood plaques matching new-game-btn.png exactly - same wood, same vine border, same carved lettering. |
| Cosmic Cadets | `icon-stardust-40x40.png` | 40x40 transparent PNG, a painted gold mote with a soft bloom, matching the star_full.png rendering. |
| Dew Snip | `assets/backgrounds/bg_title_dim.jpg` | 540x960, the existing bg_title with a 35 percent dark scrim painted into the bottom third and a soft falloff, so the six button plates sit on a settled ground |
| Frost Watch | `assets/meadow/lip-540x36.png` | Transparent PNG, full stage width, a snow crest with an irregular drifted top edge and translucent icicles hanging 10px below. |
| Garden Guard | `assets/gg/ui/title_hero_540x960.jpg` | 540x960 full-bleed. The Keeper standing in the kitchen bed at night, back three-quarter, watering can lowered; bottom 45% deliberately dark and quiet so the button stack reads on it. |
| Hexa Hive | `assets/hab-meadow-540x960.jpg, hab-desert, hab-rainforest, hab-jungle, hab-swamp, hab-mountains, hab-coast, hab-tundra, hab-orchard, hab-volcano` | 540x960 full-bleed JPG each, painterly, deep near-black at top and bottom so the gold comb and the HUD stay readable, sun or moon and a soft horizon painted in, warm rim light on the terrain. |
| Hexa Hive | `assets/chip-amber-128x128.png, chip-rose, chip-honey, chip-pollen` | 128x128 PNG each, transparent, one painted honeycomb chip seen slightly from above with a bevelled edge and a wax sheen; drawn repeatedly to build a stack. |
| HUNCH | `icons/icon.png` | 1024x1024 PNG no alpha, neon-lime pencil tip morphing into a glowing AI eye, centred, full-bleed dark ground |
| Jumping Jimothy | `assets/ui/music_pill_ink_120x48.png` | 120x48 transparent PNG. A brush-drawn ink label with a hand-lettered note glyph, no filled slab, sized to sit on cream paper without a border. |
| Minesweeper | `assets/games/minesweeper/icon-flag-96x96.png and icon-newgame-96x96.png` | two 96x96 transparent PNGs in gold and sage |
| Nonogram Bloom | `new-game-btn-256x256.png` | 256x256 transparent, the SAME copper-and-vine plaque re-exported at button scale, plus a matching narrower plaque for the size selector |
| Nova Bloom | `how_icon_moth / wasp / needle / serpent / mine / bulb, 64x64 each` | six 64x64 transparent PNGs, cropped and re-lit from the existing assets/sprites/enemy_*.png at icon scale with a warm rim light |
| Pit Bike Rally | `icon-rotate-phone-96x160.png` | 96x160 transparent PNG. A painted phone with a warm gold bezel, a sliver of the dirt track visible on its screen, soft rim light from the left. |
| Reversi | `assets/games/new-game-btn.png` | RESIZE, not a repaint. Currently 1529x1529 and 3.35MB, displayed at clamp(120px,35vw,180px) = about 131px. Re-export at 360x360, target under 45KB. |
| Root Weave | `how-icon-goal-64x64.png` | 64x64 transparent, painted sage-and-gold line art of a bulb at the centre of a clean weave |
| Root Weave | `how-icon-drag-64x64.png` | 64x64 transparent, a hand drawing a bulb along a glowing root |
| Root Weave | `how-icon-taproot-64x64.png` | 64x64 transparent, an anchored bulb with a burr knot, copper and sage |
| Root Weave | `how-icon-bloom-64x64.png` | 64x64 transparent, a root mandala opening into a rose bloom |
| Root Weave | `how-icon-candle-64x64.png` | 64x64 transparent, a warm nudge candle with a soft gold halo |
| Shut the Box | `new-game-btn-256x256.png` | 256x256 transparent PNG, reissue of the existing carved plaque at button resolution |
| Spore Drift | `hud-spore-mass-32x32.png` | 32x32 transparent, a small spore glyph in sage with a gold rim |
| Star Field | `star-glyph-atlas-256x64.png` | 256x64, four 64x64 transparent painted markers matching the existing fn cases (star, firefly, rose, bloom): warm gold petals, a cream core, a soft halo |
| Times Table Quest | `badge-perfect-200x200.png` | 200x200 transparent gold laurel-and-star stamp with a soft glow |
| TriPeaks | `icon-deck-style-64x64.png` | 64x64 transparent PNG, two fanned painted cards in sage and gold |
| Vinewinder | `streak-icon-128x128.png` | 128x128 transparent PNG, painted ember or small lantern, warm amber glow, transparent |
| Wild Wardens | `assets/art/icon-menu-walk.png (plus roster, tree, territory, inventory, equipment, mastery, quests)` | 8 files, 128x128 transparent PNG, one small painted mark each, gold-on-dark, readable at 32px. |

## Textures, FX & overlays  (87 assets across 71 games)

| game | file | spec |
|---|---|---|
| Acorn Drop | `assets/sprites/ghost_frame.png` | 64x64 transparent, a soft cream dashed outline square with a faint inner glow, no fill |
| Aura Off | `stage-lamp-glow-540x300.png` | 540x300 transparent, soft amber cone with dust motes, hard-light blend |
| Backgammon | `checker-sage-96.png` | 96x96 transparent PNG. A carved wooden disc in sage-green stain, one pressed shamrock in the face, top-left specular rim light, soft contact shadow baked into the lower edge. |
| Bandit's Box | `assets/bench-750x1000.jpg` | 750x1000 full-bleed. Worn wooden workbench filling the lower 40%, warm scuffed grain, a dim lilac-grey wall behind it, one soft overhead lamp pool falling from upper-left. Overall value kept between #1B1822 and #3E374F so cream 15px text still reads on it. Nothing in the centre 400x400 - that is where the toy sits. |
| Bandit's Box | `assets/bandit-contact-shadow-512x180.png` | 512x180 transparent PNG. Soft elliptical contact shadow, darkest and tightest at the centre where the feet meet, feathering to nothing at the edges. Warm-black, not pure black. |
| Bee's Pollen Sort | `assets/games/colorsort/vial-glass-108x300.png` | 108x300 transparent PNG. A painted glass vial: rim highlight down the left edge, a warm reflection on the right, a small cork collar at the top, a soft contact shadow at the base. Interior fully transparent so pollen shows through. |
| Bee's Pollen Sort | `assets/games/colorsort/bee-96x96.png` | 96x96 transparent. A painted bee in three-quarter view, amber and near-black bands, warm rim light, soft wing blur. |
| Blooming Words | `assets/pebble-128x128.png` | 128x128 transparent PNG. A wet river pebble, pale mint-white, warm rim light upper-left, soft shadow lower-right, slight surface mottling. Letter drawn on top in the existing serif, not baked in. |
| Bramblewick | `panel-bark-720x960.png` | 720x960, transparent, painted vellum-over-bark texture with a soft gold edge glow |
| Bramblewick | `letterbox-soil-375x120.png` | 375x120, horizontally tileable, a dark soil and bark band with a soft top edge |
| Bridgevine | `haze_midground.png` | 540x220 transparent, a soft warm mist band, tileable horizontally, 20-30% alpha |
| Burrow Bowl | `burrow-mouth-160x110.png` | 160x110 transparent PNG, a real burrow entrance: rimmed loose soil, grass tufts on the upper lip, a dark throat with a hint of depth, warm rim light from the left |
| Burrow Bowl | `dewball-48x48.png` | 48x48 transparent, a glowing dew sphere with a bright specular and a soft blue-green inner glow, plus dewball-trail-32x32.png |
| Cipher Bloom | `paper-vellum-516x600.png` | 516x600 transparent PNG, warm cream vellum with faint tooth, a soft deckled left edge and a subtle inner shadow, tileable vertically |
| Dew Trail | `assets/games/dewtrail/dewdrop-96x96.png` | 96x96 transparent, one painted dew bead, warm rim light upper-left, tiny caustic highlight below, soft contact shadow |
| Doodle Pad | `paper-tooth-540x500.png` | 540x500, warm off-white (#faf6ee) with faint fibre tooth and a barely-there vignette at the corners, tiles cleanly |
| Doodle Pad | `canvas-lip-540x24.png` | 540x24 transparent strip, a soft warm shadow and a thin cream paper edge, to sit at the top and bottom seam of the artboard |
| Dragon Philosophy | `satellites/dragon-philosophy/art/patrons/vairex.png` | 640x640 transparent PNG, painted head-and-shoulders dragon portrait with warm rim light, one per patron |
| Fast Math | `abacus-owl-idle.png` | 216x216 transparent (68px at 3x), painted round tawny owl perched on a soroban bead rail, warm gold rim light from the left, big readable silhouette with visible wings and feet, neutral eyes |
| Fence Off | `fence-post-h-120x28.png and fence-post-v-28x120.png` | 120x28 and 28x120 transparent, a painted two-rail wooden fence with warm rim light on the top rail and a soft shadow under it |
| First Sprout | `satellites/first-sprout/assets/soil-mound-750x420.png` | 750x420 transparent PNG, painted dark loam with visible clods, a grass fringe along the top edge and a warm gold rim from the kindled glow |
| Flipbook | `paper-texture-512x716.jpg` | 512x716, warm cream laid paper with faint tooth, a slightly darker gutter down the left 40px where the spiral binding lands, and a soft top-edge shadow |
| Fox & Basket | `picnic-basket-140x110.png` | 140x110 transparent, woven basket with a red-check cloth spilling out, a pear and a loaf, warm painterly, soft ground shadow |
| Fox & Basket | `letter-slot-40x58.png` | 40x58 transparent, a shallow carved wooden slot with a warm gold lip and a soft inner shadow, cream letter sits inside it |
| Garden Estates | `pawn-set-128x32.png` | 128x32 transparent, four painted 32x32 pawns (snail, ladybug, wren, mole) each with a warm rim light and a soft contact shadow |
| Garden Guard | `assets/gg/maps/map_w1_kitchen.png` | 540x960 full-bleed portrait, under 512KB. Night kitchen-garden bed: raised timber beds, a compost bin at the bottom gate, the winding dirt path painted right in, warm lantern rim light, deep near-black soil, sage foliage, gold glints. |
| Garden Guard | `assets/gg/ui/ls_thumb_kitchen_128x128.png` | 128x128 transparent, one per map (4 files: kitchen, herbspiral, pond, trellis). A tiny painted vignette of that map's signature feature. |
| Garden Lines | `gl-cell-empty-96x96.png` | 96x96 PNG, transparent, a shallow pressed socket in wood with a soft inner shadow |
| Hedgerow | `satellites/hedgerow/skins/s1/sprites/ladybug.png` | 96x96 transparent, redraw with a 2px cream rim light on the top-left edge and a soft dark contact shadow baked at the bottom. Same treatment for beetle, snail, aphid, caterpillar, grub — 6 files per skin. |
| HUNCH | `assets/fx/canvas_paper_1024.png` | 1024x1024 tileable off-white paper (#f7f5ef) with a faint tooth and a soft inner shadow at the edges, opaque |
| HUNCH | `assets/cosmetics/themes/theme_default_bg.png` | 1080x1920, dark navy #0d0e1a with a faint lime neon grid falling off toward the bottom and subtle film grain |
| Impossible Garden | `satellites/impossible-garden/assets/garden-thumb-1-184x184.png` | 184x184 each, eight files (garden-thumb-1 through -8). A small painted vignette of that garden's signature shape — a spiral, a bridge, a knot, a stair — near-black ground, sage line, gold node. |
| Kakuro | `kakuro-cell-paper-96x96.png` | 96x96 transparent PNG, warm cream vellum with faint fibre texture and a soft inner shadow at the top edge |
| Lamplighter | `lamp-lit-96x96.png` | 96x96 transparent, painted iron lantern on a short post with a warm flame and a soft bloom, warm rim light on the ironwork |
| Lights Out | `shroom-off-160.png` | 160x160 transparent, unlit cap with a cream rim light and a faint gold underglow at the base |
| Lights Out | `shroom-on-a/b/c-160.png` | three 160x160 transparent variants, cap tilt and gill count varied, same mint-into-gold glow |
| Line Loom | `assets/valley-night-540x960.jpg` | 540x960 full-bleed, painted night valley, deep #0b0f0b lows so the existing palette still sits on it, soft hills and tree clumps, a mist band through the middle third where the river runs. |
| LOAF | `loaf-eyes-160x80.png` | 160x80 transparent PNG, the two amber eyes painted as ONE unit with a suggestion of muzzle and ear tips in near-black, soft glow falloff |
| Master Pollinator | `pollen-tree-64x64.png` | 64x64 transparent, a small painted canopy silhouette with gold rim light |
| Meadow Weave | `hex-slot-ghost-128x128.png` | 128x128 transparent, a soft dashed gold hex outline with a faint inner glow |
| Moon Claw | `prize-chute-160x220.png` | 160x220 transparent, a dark chute mouth with a rubber flap, a scuffed metal lip and a warm interior glow |
| Mosaic Draft | `wall-plaster-540x400.png` | 540x400 transparent PNG, the 5x5 wall as a grouted plaster panel with 25 recessed square sockets and a shadow inside each socket |
| Mosaic Draft | `rivals-3x-192x192.png` | three 192x192 transparent bust portraits - Tam the Apprentice, Mirela the Artisan, Kover the Master - warm rim light, storybook, clay-dusted aprons |
| Mouse Trap | `mouse-96x96-4frames.png` | one 384x96 transparent strip, four 96x96 frames: idle sniffing, mid-run with ears back, trapped with wide eyes, escaping with a happy squint - painted grey-brown with pink ears and nose, warm rim light |
| Nectar Drop | `satellites/nectar-drop/assets/ui/tut-basket-256x256.png` | 256x256 transparent PNG, painted woven basket with warm rim light, a pollen ball arcing into it, soft glow under the catch |
| Nova Bloom | `howto_panel_460x760.png` | 460x760 transparent PNG, 9-sliceable smoked-glass panel with a thin sage-gold edge and soft inner glow, corners 24px |
| Orb Orchard | `horizon-nebula-540x260.png / horizon-aurora-540x260.png` | same framing, repainted to the existing SKIES palettes - nebula purple/rose #e58fa0 glow, aurora teal/ice #bfe0f2 glow |
| Orb Orchard | `grove-plot-540x300.png` | 540x300 transparent PNG, an empty orchard plot at night: twelve dotted planting sockets in rows, one seedling in the first socket, soft ground shadow |
| Parallel | `door-a-92x92.png + door-b-92x92.png` | 92x92 transparent, arched doorway with a lit sill in each twin's colour and a soft threshold glow |
| Petal Match | `pu-dig.png / pu-cut.png / pu-wash.png / pu-boost.png` | four 96x96 transparent painted tool icons - brass trowel, garden shears, copper watering can, sunburst - warm rim light, on alpha |
| Pixel Garden | `canvas-mat-360x360.png` | 360x360, transparent PNG. A painted paper or linen mat with a soft rim-lit bevel and a cast shadow, sized to sit under the 336px canvas with a 12px reveal. |
| Pixel Garden | `palette-tray-336x224.png` | 336x224, transparent PNG. A painted wooden or chipped-enamel paint tray with 24 recessed wells on a 6x4 grid, each well 48x48 with an inner shadow, warm rim light from top-right. |
| Pollinator Paths | `flowerpad-bee-96x96.png` | 96x96 transparent, painted flower pad from above, sage leaves, warm gold rim light, bee silhouette pressed into the centre |
| Pollinator Paths | `flier-butterfly-48x48.png` | 48x48 transparent, painted butterfly, rose and cream wings, warm rim light |
| Power Scalers | `race-vampire-256.png (plus 9 siblings: human, vultramite, stand_user, xenomorph, cyborg, esper, draconid, eldritch, revenant)` | 256x256 transparent PNG each. Painted bust portrait, three-quarter, warm rim light from the upper left on a dark ground, big readable silhouette at 64px. |
| Rabbit Ronin | `carrot-24x24.png` | 24x24, transparent, painted carrot pickup: orange root with warm gold rim light, three sage fronds, a soft glow behind it. |
| Rhythm and Vine | `hitline-bloom-540x72.png` | 540x72 transparent, a row of four half-open blooms sitting on the hit line, gold #c8a84b core with sage petals, glow baked in |
| Root Maze | `arrow-push-64x64.png` | 64x64, transparent PNG. A painted brass push-lever seen end-on with a shadow and a warm highlight, plus a 64x64 pressed variant. |
| Root Rush | `exit-gate-48x140.png` | 48x140 transparent, a gold-lit gap torn in the soil wall with warm light spilling through and a few root ends at the edges |
| Rootbound | `gate-96x160.png` | 96x160, transparent. A painted garden gate in weathered sage-painted wood, standing open, with a warm glow spilling through the opening. |
| Rootbound | `bed-thumbs-320x64.png` | 320x64, five 64x64 frames, transparent. One tiny painted vignette per section: a seedbed tray, a row of sprouts, a bud, a full bloom, a tangle of wild roots. |
| Seed Pot | `assets/ui/fab_plate-96x96.png` | 96x96 transparent PNG, a small painted wooden disc with a warm rim light and a soft drop shadow |
| Seed Reel | `moon-seedreel-160x160.png` | 160x160 transparent painted moon, soft warm halo, faint maria, cream rim light |
| Shell Shuffle | `ball-dew-96x96.png` | 96x96 PNG, transparent. A glass dew-bead with a warm gold specular highlight and a faint sage inner glow. |
| Sixfold | `rank-seals-576x96.png` | 576x96 atlas, six 96x96 transparent painted tier seals (Iron, Bronze, Silver, Gold, Jade, Onyx): an inked kanji on a stamped washi disc with a warm rim light and a torn paper edge |
| Sixfold | `duel-scrim-375x667.png` | 375x667 transparent PNG: black-to-transparent vertical gradient with a soft vignette baked in, about 70% opacity through the centre band |
| Skyshot | `moon-crescent-160.png` | 160x160 transparent PNG, soft-edged. A painted waxing crescent with a faint earthshine disc, warm cream on the lit limb going cool blue in the shadow, no hard terminator line. |
| Snakes & Ladders | `ladder-wood-64x256.png` | 64x256 PNG, transparent, 9-slice friendly. Two warm oak rails with visible grain, rungs with a lit top face and a shadowed underside. |
| Spore Drift | `spore-predator-96x96.png` | 96x96 transparent, a barbed non-spherical hostile in rose and deep red, warm rim light, distinctly not a ball |
| Star Field | `bed-tint-tiles-512x86.png` | six 86x86 tileable transparent overlays of soft painted soil and nebula grain at about 25% opacity, laid out in one 512x86 strip |
| Story Seeds | `paper-texture-540x420.png` | 540x420 tileable, opaque. Warm cream ruled paper with visible fibre and a faint gutter shadow down the left edge, supplied as a night-toned variant at ~18% luminance so cream text stays legible on it. |
| Sunforge | `forge-pieces-512x512.png` | 512x512 transparent, 16 cells of 64x64: forged segments in brass, iron and obsidian, each with a warm rim light on one edge and a cool one on the other so rotation reads |
| Super Slice | `ff-strata-512x1024.jpg` | 512x1024 full-bleed painted canyon strata: ochre and sage rock bands, mossy rim in the top eighth, a faint central light shaft with dust motes, cool near-black at the bottom |
| Sweet Spot | `net-tape-540x120.png` | 540x120 transparent PNG, painted net band with white tape, visible mesh and a slight centre sag, soft shadow cast onto the clay below |
| Tally | `pal-fox-256x256.png` | 256x256 transparent PNG, painted fox head 3/4 view, warm rim light, soft cast shadow, same specular language as the navy beads |
| Tally | `target-blob-512x512.png` | 512x512 transparent PNG, painted terracotta clay medallion with a warm rim light, a soft inner glow and a contact shadow; number overlays in CSS |
| Tempo Grove | `sweepline-glow-120x784.png` | 120x784 transparent PNG, a painted vertical light shaft: hot cream core, warm gold bloom, wide soft falloff to nothing at both edges, meant to be drawn with globalCompositeOperation lighter |
| Tinker Loft | `marble-128x128.png` | 128x128 transparent PNG, painted glass marble with a warm specular highlight, a coloured core and a soft contact shadow |
| Tomato Man | `art/ui/world_thumb_morning-tide.png (plus midday-blaze, tide-pools, dunes-at-dusk, eclipse)` | 5 files, 320x180 transparent PNG. One painted vignette per world: long dawn shadows, white-hot noon sand, reflective pools under wilting shade, wind streaks over dunes, the Angry Sun in eclipse. |
| Tower of Hanoi | `hanoi-win-glow-540x300.png` | 540x300 PNG, transparent, a warm gold bloom with drifting motes, alpha falloff to nothing at the edges |
| TriPeaks | `tripeaks-peak-shadow-256x96.png` | 256x96 transparent PNG, soft elliptical drop shadow, ~35% black at centre falling to zero |
| Twin Lanterns | `lantern-lit-256.png and lantern-dark-256.png` | Two 256x256 PNGs, transparent, painted brass lantern - one with a warm lit flame and a glow, one cold and unlit. |
| Vine Puzzle | `assets/games/pipe/vine-bloom.png` | 128x128 - an open rose-pink bloom on a short stem, one entry stub, warm rim light |
| Wild Wardens | `assets/art/warden-portrait-512x512.png` | transparent PNG, one painted warden bust, warm rim light, big readable silhouette. |
| Wireworm | `assets/ww-pad-glyphs-2x256.png` | Two 256x256 transparent cells: painted brass rotary arrows, left and right, with a warm rim light. |
| Word Lightning | `satellites/bloomzap/assets/storm-drizzle-96x96.png, storm-downpour-96x96.png, storm-tempest-96x96.png` | Three 96x96 transparent PNGs with escalating silhouettes, not just escalating weather: a small round cloud with three drops; a heavy wide cloud with sheeting rain and a lean; a black anvil cloud with a gold fork below it. Warm rim light on the cloud tops, painted, soft. |
| Word Search | `win-wreath-512x512.png` | 512x512 transparent PNG, painted sage-and-gold laurel wreath with a soft inner glow |

## Everything else  (58 assets across 50 games)

| game | file | spec |
|---|---|---|
| Acorn Drop | `assets/ui/mascot_hero_safe.png` | 700x900 transparent, same squirrel pose recomposed with his raised hand fully inside the canvas and ~90px of empty margin at the bottom-right corner |
| Backgammon | `checker-rose-96.png` | 96x96 transparent PNG. The same carved disc in a dusty rose stain with a pressed four-point star, matched lighting to checker-sage-96 so the pair reads as one carved set. |
| Bleeding Hearts | `queen-spades-96x134.png` | 96x134 PNG-32 transparent, a painted Q-of-spades face in the floral deck's line-art style, with a faint red bleed at the edges. |
| Blooming Words | `assets/blooms-512x512.png` | 512x512 transparent PNG, 4x4 grid of 128px cells: sixteen pressed wildflowers in cyanotype white (chicory, yarrow, forget-me-not, tulip, poppy, fern tip, clover and so on), each with visible pressed-flat veining and a slight ink halo. |
| Bramblewick | `lock-32.png` | 32x32, transparent, small painted brass padlock with a warm highlight |
| Burr Blast | `comic-1.jpg` | already exists, 540x540-ish, 60KB, painted |
| Code Breaker | `assets/games/mastermind/row-tray-1080x220.png` | 1080x220 transparent PNG, 9-sliceable, renders about 360x73 |
| Conduit | `conduit-backdrops.png` | 3216x512 strip, 1 row x 6 seamless 512 cells with 24px magenta gutters, one material per site, all within two values of #05060A |
| Deepwell | `satellites/deepwell/art/deepwell-09-surface-header.png` | 694x280 JPG (347x140 in game at 2x), full-bleed painted headframe and winch over the well mouth at dusk |
| Dew Trail | `assets/games/dewtrail/dewdrop-lit-96x96.png` | 96x96 transparent, same bead lit sage-green from inside with a faint bloom |
| Dragon Philosophy | `satellites/dragon-philosophy/art/manifest.json` | the file itself, shaped `{ "<cardId>": "art/cards/<cardId>.png" }` |
| Farkle | `farkle-streak-ember-96x96.png` | 96x96 PNG, transparent, a painted ember with a soft gold bloom |
| Fast Math | `abacus-owl-happy.png` | 216x216 transparent, same owl, arched happy eyes, one wing raised, a faint gold sparkle over the shoulder |
| Fast Math | `abacus-owl-oops.png` | 216x216 transparent, same owl, tilted head, dropped brow, one bead knocked loose off the rail |
| Fence Off | `gate-open-120x28.png` | 120x28 transparent, the fence art with its middle rail swung open, warm gold highlight on the hinge |
| First Sprout | `satellites/first-sprout/assets/moon-256.png` | 256x256 transparent PNG, painted crescent with craters and a soft gold halo |
| Fox & Basket | `orchard-trees-3x-120x160.png` | three 120x160 transparent apple trees at slightly different heights, painted, warm rim from upper right, transparent |
| Frost Watch | `assets/meadow/thaw-90x32.jpg and assets/meadow/bloom-90x32.jpg` | Authored at the drawn aspect (SEGW 45 x ROWH 16, so 90x32 at 2x), seamless horizontally: thaw is damp dark loam with the first green, bloom is meadow grass with small sage and rose flowers. |
| Frost Watch | `wire the 8 painted UI plates that already ship` | No new art needed: assets/ui/med_gold.png, med_slate.png, med_solar.png, chip_gold.png, chip_blue.png, chip_greenb.png, chip_smallb.png, chip_plainb.png are in the repo and referenced zero times in index.html. |
| Garden Guard | `assets/gg/maps/map_w1_trellis.png` | 540x960 full-bleed portrait, under 512KB. Bean trellis and arch, hanging vines, straw path painted in. |
| Hedgerow | `satellites/hedgerow/skins/s1/sprites/planted.jpg` | Repaint at 68x68, seamless on all four edges, designed to be READ at 34px: one seedling motif, big simple silhouette, sage on near-black, no fine stippling. |
| Hedgerow | `satellites/hedgerow/skins/s1/sprites/edge_hedge_510x34.png` | 510x34 transparent strip: the shadowed under-edge of a hedge wall, dark at the top fading to nothing, with a few root wisps. |
| Impossible Garden | `satellites/impossible-garden/assets/node-bloom-64x64.png` | 64x64 transparent, the goal bloom, painted rather than the current ellipse-petals-plus-#ffe9a8-dot that game code draws at index.html:407. |
| Keepsies | `assets/models/grails/*.glb (Drowned Knight, Astronomer, Koi, Ember Dragon)` | Figure fills ~70 percent of a 22mm sphere, shown at 140px on the inspect turntable, per ART_ASSETS.md row 2. |
| Lamplighter | `lamp-clash-96x96.png` | 96x96 transparent, the same lantern cracked, its glass smoked, a dull ember instead of a flame, one thin ember-orange highlight |
| Lamplighter | `house-tiles-288x96.png` | 288x96 transparent, three painted 96x96 shuttered house fronts (narrow, wide, gabled) with dark windows and a gold eave line |
| Master Pollinator | `assets/games/masterpollinator/tier{1,2,3}/*.png re-export at 240x320` | 240x320 PNG or WebP, under 40KB each, same paintings, opaque |
| Minesweeper | `assets/games/minesweeper/revealed-128.png, flag-128.png, mine-128.png` | three 128x128 PNGs, under 40KB each |
| Moon Claw | `claw-96x96.png` | 96x96 transparent, painted brass claw, three jaws, warm specular on the inner curve, faint wear on the tips |
| No Pain, No Gain | `haz-spikes-120x40.png and haz-spikes-b-120x40.png` | two 120x40 transparent painted spike strips on a clay base, one straight, one with a bent tooth and a chipped corner |
| Orb Orchard | `spring-96x96.png` | 96x96 transparent PNG, a coiled green spring pad in a compressed pose, sage #7ab356 with a gold highlight |
| OriVex | `bg_theme_8.jpg through bg_theme_11.jpg` | 540x960 each, four files, full-bleed. Paper-cut night scenes in the register of the existing bg_theme_2: deep navy paper ground, gold paper lanterns, sage paper leaves along the bottom, a cream paper moon, a few star flecks. |
| Petal Match | `pill-locked.png` | 160x56 transparent 9-slice, a desaturated but still painted version of the existing pill-thin.png with a faint brass edge |
| Petal Plunge | `obs_tree_b.png, obs_boulder_b.png, obs_shroom_b.png` | 128x128 transparent each, second variants of the three most-placed props - a leaning pine, a split boulder with a moss cap on the other side, a shorter clustered mushroom pair |
| Petal Slice | `blossom_star_223x199_v2.png` | 223x199 transparent PNG, a spikier six-point star blossom with visible stamens, rose and cream, to replace or sit beside blossom_pink |
| Pixel Garden | `tool-icons-288x96.png` | 288x96, transparent PNG, six 48x48 cells: brush, eraser, fill bucket, dropper, mirror butterfly, grid. Cream line art with a sage active state baked as a second 288x96 row. |
| Pollinator Paths | `flier-hummingbird-48x48.png` | 48x48 transparent, painted hummingbird, sage and gold, blurred wing pass |
| Rabbit Ronin | `moon-crate-256x256.png` | 256x256, transparent, a soft cream moon disc with a wide warm bloom halo and a couple of thin cloud bands crossing it. |
| Rule Root | `chapter-divider-470x24.png` | 470x24 transparent, a thin painted vine rule in sage with a gold node at the left end |
| Sea Battle | `assets/games/battleship/icons-radar-tide-128x64.png` | 128x64 transparent, two 64x64 cells: a brass radar dish with a sweep arc, and a curling wave with gold foam. |
| Season Sway | `meter-gauges-352x480.png` | 352x480 transparent, 4 cells of 88x120: painted sundial, rain gutter, soil core and hive gauges with a marked safe band and a needle or fill line |
| Seed Toss | `ground-fringe-380x80.png` | 380x80 transparent, grass and soil fringe with irregular tufts breaking the top edge, darkening to opaque at the bottom |
| Silt | `assets/ui/panel_rim_540x28.png` | 540x28 transparent PNG, a soft painted gold-to-nothing rim with a slight ink deckle. |
| Spore Drift | `fg-kelp-fronds-540x300.png` | 540x300 transparent, near-plane kelp silhouettes in near-black with a faint teal edge, tileable horizontally |
| Stone Garden | `moon-stonegarden-256x256.png` | 256x256 transparent PNG, a cream moon disc with faint maria and a soft two-stage halo |
| Sunforge | `sunforge-core-256x256.png` | 256x256 transparent, a molten gold core with a corona and heat shimmer, premultiplied soft edge so it can be drawn additively |
| Super Slice | `ff-wall-rock-256x256.jpg` | 256x256 tileable painted rock face with chisel facets, a warm rim highlight along one edge and a mossy speckle |
| Super Slice | `fruit-rind-atlas-1024x256.png` | 1024x256, four 256x256 tiles of painted rind detail (dimpled citrus, waxy apple, ribbed melon, fibrous husk), transparent, to multiply over the existing fruit colours |
| Tetroku | `cell-empty-64x64.png` | 64x64 painted empty trellis socket - a woven square, faintly lit at the top-left, transparent margin |
| The Attic | `ticket-64x64.png` | 64x64 transparent PNG, a torn paper carnival ticket stub in cream and gold. |
| Think Fast | `heart-48x48.png` | 48x48 transparent, cream-filled heart with a warm gold rim, plus a hollow empty variant |
| Tomato Man | `art/ui/icon_sun.png, icon_shade.png, icon_move.png, icon_dash.png` | 4 files, 128x128 transparent PNG, painted in the locked palette with the navy ink outline. |
| Tomato Man | `art/ui/lock.png` | 96x96 transparent PNG, small painted padlock in Driftwood #C98B53 over navy ink. |
| Vine Puzzle | `assets/games/pipe/vine-corner-b.png` | 128x128 PNG with ALPHA, vine only - a second corner with the elbow tighter and leaves on the outside of the bend |
| Vine Puzzle | `assets/games/pipe/soil-bed-512.png` | 512x512 seamless tiling soil, dark loam, wet speckles, no vine |
| Vine Runner | `art/tube-wall-1024x1024.jpg` | 1024x1024 seamlessly tiling, painted living vine interior: ribbed green vine running one axis, wet specular highlights along the ribs, dark moss packed into the grooves, value range kept dark enough that the runner reads on top of it |
| Vine Runner | `art/thorn-2.png and art/thorn-3.png` | 256x256 transparent PNGs each, two more hazard silhouettes distinct from thorn.png: a barbed coil and a low bramble mat, same red-black palette and outline weight |
| Word Search | `wordsearch-strike-ribbon-192x48.png` | 192x48 transparent PNG, hand-inked sage strike stroke with a slightly ragged end, stretchable in the middle |

---

# PART 5 — CHECKED, AND GENUINELY FINE

Written so nobody spends a session re-finding these. Each was chased far enough to be sure.

| checked | result |
|---|---|
| **Portal thumbnail paths** | **0 broken.** Every `thumb:` on every satellite card resolves to a real file. The gaps are the 5 cards with no `thumb` field at all (Job 6), not bad paths. |
| **Native card screenshots** | **0 missing.** All 66 resolve in `portal-assets/screenshots/`. Seven are small (Job 6), none are absent. |
| **Games 404ing on their own art** | Only three, all deliberate empty art-slots: Glyph Forge, Tarot Run, Tomato Man (Job 4). No other game asks for an image it does not have. |
| **The ~20 games 404ing on `/music/v1/*.mp3`** | **Not a fault.** Audio is deliberately not in git; it ships to `/music` from a private repo. The local capture server has no `/music`. Do not "fix" these. |
| **The memory game's 95MB** | **Not a perf bug.** `games/memory.js` references only the 240x240 `-card.png` cuts — 1.8MB shipped. The 86MB of 1968px masters sit beside them, never served. Repo weight only (Job 8). |
| **Pom Pond "missing"** | **Not missing.** Its GAMES row has 7 fields, and field 5 is `https://pom-pond.web.app`; `card()` reads that as `extUrl` and opens the external app. `scripts/catalog.mjs` builds every native URL as `/play/<id>.html` and ignores field 5, so it looks like a 404 to anything that trusts the catalog's URL — and `portal/catalog-tags.json` has inherited the same wrong URL. **A second reader looking only at catalog-tags.json called this a blocker.** It is a one-line fix in catalog.mjs plus a regen of catalog-tags.json; the game itself is fine. ⛔ A derived file carries its generator's bugs forward — check the source row, not the derived index. |
| **The native shell header for a first-time visitor** | **Clean at every width tested.** It only breaks once the wallet has a pending chip (Job 3). A probe on a fresh browser reads green, which is exactly how this stayed hidden. |
| **The empty lower third on native games** | Real to the eye, but **not a layout bug**: measured at 6px across 12 games. It is a composition problem per game — the board does not fill the frame — so do not go hunting for a margin. |
| **Blank or failed-to-render screens** | **555 of 558 frames carry real content.** The only blank ones are Pom Pond's 404. Nothing in the fleet boots to an empty screen. |
| **`document.fonts.check()` in the play shell** | **It lies.** It returns `true` for "Bebas Neue" on a page that never loaded it, because it assumes any family it does not manage is a system font. Measure a rendered width against `sans-serif` instead — identical widths mean the font did not load (Job 2). |
| **The music chip's placement algorithm** | The scoring is good — a 3x3 footprint test against an occupancy map over ~14 candidate spots. The bug is purely that it runs once, 900ms in, against the boot layout (Job 2). Do not rewrite the scorer. |

Still true from `DONE-LEDGER.md`, not re-run here: the fleet-wide defect sweeps
(`img-without-onerror`, `fetch-without-ok-check`, `dashes-in-copy`, `exit-gated-on-frame`,
`EARN-PROMISE-BROKEN`) were all at 0 actionable, and Quest triage had 0 blocked.

---

# PART 3 — THE PER-GAME WORKING LIST

Split by kind, because the fix pattern differs:

- **`FLEET-ART-DETAIL-SATELLITES.md`** — 119 games, each owning its own folder and CSS.
- **`FLEET-ART-DETAIL-NATIVES.md`** — 66 games sharing one shell; most of these are waiting
  on Job 1 before a per-game pass is even worth starting.

Both are also browsable, filterable and tickable in the published punch list.
