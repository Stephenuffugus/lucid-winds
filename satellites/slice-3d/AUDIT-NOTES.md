# SUPER SLICE 3D — audit notes

Audited 2026-08-16. Full pass: read end to end, defect list written BEFORE any edit,
fixed worst first, headless assertion suite left behind (`audit-check.mjs`).

Build at audit time: `v5.7`, 2467 lines, three.min.js vendored, sw v63.

## How this was verified

- Real headless Chrome at 375x667 with the swiftshader GL flags (`--use-gl=swiftshader
  --enable-unsafe-swiftshader`). **Never wait on `networkidle`** for this page: it streams
  a 600KB three.js and keeps a rAF loop alive forever, so a networkidle wait calls a
  healthy page dead. Wait on `domcontentloaded` plus a fixed settle.
- **One browser per case, launched and closed.** Reusing a single browser across ~20 WebGL
  boots on a 2-core box exhausts it and the run dies on a 30 second NAVIGATION timeout,
  which reads exactly like "the game stopped loading" and is nothing of the kind. Every
  in-page stepping loop is also timeboxed by wall clock, so the suite can report a hang
  rather than becoming one.
- All four entry points driven to their end panel through the `?dev=1` hook
  (`window._S3.stepN`), not by eyeballing: Journey, Freefall, Wall Climb, Endless.
- Every check in `audit-check.mjs` was watched FAIL on purpose before it was trusted, and
  three of them had to be rewritten because they could not go red:
  - The first play probe broke its loop the instant `G.done` flipped, which is 2.4 seconds
    before `finishLevel()` fires, and confidently reported "the end screen never shows".
    That was the probe, not the game.
  - The first "slabs survive a failed dive" check compared `onDisk >= cut` on a dive that
    cut zero slabs. It read `0 >= 0` and passed regardless of what the game did. It now
    injects a known tally and a known combo, wipes the save, and demands both reach disk.
  - The first "music label fits" check compared `scrollWidth <= clientWidth`. On the
    BROKEN build those were equal (94 == 94) — nothing overflowed, the glyphs simply ran
    edge to edge against the border. It now measures real clearance between the rendered
    text and the button's border box with a `Range`.

  The suite then earned its keep immediately: it caught a regression **I** introduced while
  fixing the music button (see defect 2).

## The core loop, start to finish — WORKS

All four modes reach their end panel, bank score, and persist. Measured:

| Mode | Result | Panel | Persisted |
|---|---|---|---|
| Journey L1 | cleared, 2835 pts, 16 sliced | `LEVEL 1 CLEAR` ★☆☆ | `level:2`, `best.l1:2835`, ☀+2, ◆+93 |
| Freefall L1 | stuck the wall at 46m | `STUCK IN THE WALL` ✕ | ◆+6 |
| Wall Climb L1 | stuck at x1 | `WALL CLIMB 1 · x1` | `climbLevel:2`, `best.c1:200` |
| Endless | 149m | `DEPTH 149m` ★ | `endlessBest:149` |

Zero page errors across all of it. No stubs, no dead menu buttons, no unreachable screen.
The `?mode=climb` and `?mode=ff` front doors both boot correctly.

Difficulty is real, not flat: `buildLevel` widens the segment bag and raises crystal density
with level, and the Freefall shaft narrows. Endless raises terminal velocity with depth
(`FF_TERM + depth*0.012`, capped 30).

## DEFECT LIST (written before any edit)

### 1. CRITICAL — a corrupt save bricks the game to a black screen. FIXED

`PROG` and `SKN` were built with `JSON.parse(...) || {default}`. A try/catch around
`JSON.parse` is not validation: any value that merely *parses* is truthy and comes straight
through. The next line then does `PROG.level = 1` on it, and under `"use strict"` assigning
a property to a primitive **throws**, which kills the entire main IIFE — all 2240 lines, the
whole game — at parse position line 255. The player gets a black stage with no way out.

Verified in a real browser, one poisoned key per boot:

```
s3d_prog=5      -> main IIFE dead: "Cannot create property 'level' on number '5'"
s3d_prog="hi"   -> main IIFE dead
s3d_prog=true   -> main IIFE dead
s3d_skins=5     -> main IIFE dead: "Cannot create property 'owned' on number '5'"
```

Not hypothetical: a quota-exceeded or interrupted `setItem` is the normal way a key ends up
holding a scalar, and this game writes on every level end.

**Fix:** a real `okObj()` / `okArr()` shape check at load. Anything that is not a plain
object (or, for `SKN.owned`, a genuine array) is discarded for the default. Also hardened
`PROG.best` and `SKN.equip` against a valid-JSON-but-wrong-shape payload
(`{"best":7}`, `{"owned":"classic"}`, `{"equip":"nope"}` — all of which previously got
through and broke later, inside a click handler, where nobody would connect it to the save).

### 2. HIGH — the Music button label is clipped mid letter. FIXED

Looked at it at 375x667 rather than trusting the layout. `/music-player.js` replaces the
`♫` glyph with the string `♫ Music`, and `.btn` inherits `padding:0` from the global `*`
reset, so the label runs edge to edge and the final `c` is sliced by the button's own
rounded border. It reads as "♫ Musi(". Screenshot in the audit scratch.

**Fix:** `#b-music` gets side padding and an explicit flex basis of 132 stage px, sized to
the label the music player actually installs.

**⛔ Read this before touching that rule.** The first attempt at this fix used
`flex:0 1 auto`, which looked obviously right and was wrong. `.btn` sets `width:100%`, so
a basis of `auto` resolves to **420px — the whole row**. The row overflowed, and the two
`flex:1` siblings (basis 0, nothing to grow into) collapsed to **28 and 36 RENDERED px**,
turning one cosmetic defect into two broken touch targets.

Nothing about that was visible in the diff. It was caught by phase 5 of `audit-check.mjs`
measuring rendered widths, which is the entire argument for having the suite. Use an
explicit basis on any button in that row, never `auto`.

### 3. HIGH — two tabs clobber each other. FIXED

`SLIV` (the currency), `PROG` and `SKN` are read ONCE at boot and written back wholesale.
Two tabs open, play a level in each, and the second write erases the first tab's slivers,
level and unlocked knives. Slivers are earned currency, so this is lost player value.

**Fix:** read-modify-write at save time. Slivers ADD their delta against whatever is on disk
now, level/best/climbLevel/endlessBest/slabsCut/cleanDives MAX or ADD as appropriate, and
owned knives UNION. A knife bought in one tab can no longer be un-bought by the other.

### 4. MEDIUM — a failed Journey or Freefall run silently discards progress. FIXED

`failLevel()` calls `saveProg()` only on the endless branch. The level and freefall branch
never saves and never calls `runTrophies()`. But `sliceSlab()` increments
`PROG.slabsCut` — the lifetime tally that feeds the Groundskeeper trophy at 100 — during
the run. A failed dive is the *normal* way a Freefall dive ends, so nearly every slab a
player cuts is thrown away, and the trophy is close to unreachable. Nothing tells them.
This is the "silent failure" class: the run looks like it counted.

**Fix:** the fail path now runs `runTrophies()` (which saves) on every mode, so slabs,
best combo and the trophies bank whether you stick it or not.

### 5. MEDIUM — the Journey fail panel describes a Freefall death. FIXED

A Journey run does not end in a wall. It ends when you touch a pink crystal, and the game
correctly bursts "SPIKED!" across the screen at that moment. One second later the end
panel then said:

```
STUCK IN THE WALL
the blade caught the wall
16 sliced · fell 3 before you stuck
```

None of which happened. You never left the ground, nothing caught your blade, and "fell 3"
is `Math.max(0, 4 - G.y)` on a run whose `G.depth` is undefined — a Freefall number
computed for a mode that has no depth. It contradicts the burst the player just saw AND
the How screen, which correctly promises "pink crystals end the run on contact".

This is the last thing a player reads before deciding whether to tap Try Again, so it is
worth more than its size.

**Fix:** the fail panel branches on mode. Journey now reads `SPIKED` / "a pink crystal
caught you" / "N sliced · best combo xN · N flips". Freefall keeps its wall wording and
its depth, which are both accurate there.

### 6. MEDIUM — dash in player copy. FIXED

Knife Forge, line 180: "Unlock knives and swords - each is pure style". Rewritten as two
sentences rather than swapping the character, per the house rule.

### 7. LOW — the feedback fab has to hide on the title screen. NOT FIXED, deliberate

The fab lands at x 315..363, y 521..571 at 375x667. The How / Forge / Music row occupies
x 42..333, y 522..572, so they overlap, and `feedback.js` correctly fades itself out
(`[data-lwfb-yield="1"]{opacity:0;pointer-events:none}`). The shared component is doing the
right thing, but the net effect is that feedback is unreachable from this game's menu.

Left alone on purpose: the fix belongs in the row's geometry or in `feedback.js`, and
`feedback.js` is outside this audit's sandbox. Narrowing the button row to clear the corner
would shrink three 48px-plus targets to buy back one, which is the wrong trade.

### 8. NOT A DEFECT — the drawn-scale/tested-scale mismatch is genuinely fixed

Project memory flags this game for "drawn scale did not match tested scale", so it was
re-verified rather than assumed. Both halves now hold:

- **Knife reach.** `measureKnife()` multiplies the measured recipe extent by `KSCALE` (0.55)
  on the way out, and `buildKnife()` draws the group at that same `KSCALE`. Contact fires
  where the knife is drawn. Live reading at boot: `KLEN 3.14, KHH 0.72, reach at angle 0
  = 3.14` against a Classic Chef recipe that spans 5.70. Correct.
- **Touch targets.** The 540x960 stage scales 0.6944 at 375x667. Declared 72px stage buttons
  render at 50px, over the 48px floor. Measured every visible control on title, how, forge
  and play screens: **zero under 48 rendered px**. The `72 is stage px` comment at line 75
  is accurate and must not be "simplified" to 48 — at 48 declared these render at 33.
  The injected exit button gets this right too: `arcade-exit.js` measures the stage's real
  scale and raises its own `minHeight` in stage units, landing at 50 rendered.

### 9. NOT A DEFECT — the exit works, and something calls it

`/arcade-exit.js` finds `#s-title`, injects "◄ All Sky Wolf games", and defines
`window.SWS_EXIT`. Measured live: the button renders at 277.8 x 50 px, visible, on the title
screen, and its handler is bound. Its `leave()` falls back to `document.referrer` and then
to `/portal/`, so it does not depend on being framed — which matters, because the portal
navigates `/satellites/` urls TOP LEVEL. This is the one class the game already passes.

## IMPROVEMENTS MADE (and why they buy the most per minute played)

### A. Journey and Freefall failures now bank their trophy progress (see defect 4)

Best value per minute of anything here. Freefall is the mode a player replays, failure is
its normal ending, and until now every one of those dives contributed nothing to the two
long-horizon unlocks. One line of placement, and the whole Freefall grind starts counting.

### B. The end panel now tells you what a Journey fail cost you

A failed Journey run said only "STUCK IN THE WALL" and how far you fell — no slice count,
no combo, nothing to beat. It now shows the same "sliced / best combo" line the other modes
show, so a failed run still ends on a number, which is the thing that makes you tap Try
Again. Cheap, and it uses data the run already had.

## SECOND PASS, 2026-08-16 (the first agent was cut off mid-audit)

Every fix claimed above was **re-read in the file** rather than trusted, because the agent
that wrote these notes never got to confirm its own work. All of it is genuinely applied:
`okObj`/`okArr` plus the `PROG.best` / `SKN.owned` / `SKN.equip` shape guards (274-281, 605),
`#b-music{flex:0 0 132px;padding:0 14px}` with the explicit basis and not `auto` (138),
read-modify-write in `saveProg`/`saveSliv`/`saveSkins` (291-320, 609-620), `runTrophies()` on
the fail path for every mode (2276), the mode-branched fail panel (2268-2277), and the
Knife Forge dash. Nothing was half applied.

### CLASS 9 — a stated promise that is not true. TWO FOUND, BOTH FIXED

This class has now paid out five times in one day across the fleet. It paid twice more here,
and both were invisible to all 44 existing assertions because nothing was broken.

**1. The Knife Forge promised knives do not affect play.** The copy read "Each one is pure
style and never changes how you play." `measureKnife()` reads the equipped recipe at paint
time and hands `KLEN` to `kReachX()`, which is what every wall contact tests. Measured across
the whole catalog with the same arithmetic the game uses:

```
3.03  Iron Cleaver (150)        <- shortest
3.14  Classic Chef (starter), and most of the shelf
3.33  Starforge Blade (PREMIUM)
3.58  Midnight Katana (500)
3.66  Wolf Fang (PREMIUM)       <- longest, 20.9% more reach than the Cleaver
```

A 20.9% spread in the number that decides when you touch a wall, with a **premium** knife at
the top of the range, described to the player as "pure style". Fixed in the copy, deliberately
not in the mechanics: `KLEN` is measured precisely so contact fires where the blade is DRAWN,
which is the bug Stephen reported on 8/01 ("the blade sticks into the wall when it is still
like inches away"). Forcing one length would re-break that. The line now says what is true —
each blade is measured exactly as drawn, so a longer sword reaches a little further.

**2. How to play promised the climb wall has no ceiling.** "one wall with no ceiling … The
bands keep going, so nothing but your throw limits you." `buildClimb` authors exactly 34
bands topping at x900, and the end panel then prints "stuck it at x1 **of x900**" straight
back at the player. The previous pass spotted the contradiction and parked it as a wording
question; it is a class 9 defect and the honest half is the sentence, so the sentence changed.
The real, defensible claim was always the one underneath it: the wall used to be capped by
your LEVEL, and now every run gets all 34 bands. The copy says that now, and names the ladder.

Both are guarded by new phase 7 assertions that check the copy against numbers read out of
the running game (catalog reach spread, and `G.world.bands` for the ladder), so the guard
fails from the direction this will actually regress: someone re-adding the claim.

With phase 7 in place all **nine** standing classes in `incoming/FLEET-AUDIT-COVERAGE.md` are
now covered here by assertion rather than by opinion — the notes above only ever claimed the
first eight, because class 9 had not been swept.

Class 9 was swept across the rest of the copy too, and the rest holds: "pink crystals end the
run on contact" (Journey) and "crystals down here shove you rather than kill" (Freefall) are
both exactly what `hitCrystal` does; "earn slivers every dive" holds on all four end paths
including the failed one; and all three trophy strings match their gates (`comboBest>=25`,
`slabsCut>=100`, `endlessBest>=150`, with slabs existing only in the Freefall world).

## SUITE RESULT

`node satellites/slice-3d/audit-check.mjs` (repo root served on :8777) — **50 passed,
0 failed**, exit 0. Covers 14 corrupt-save poisonings, all four modes to their end panel,
the failed-run save path, the four two-tab merge properties, the eight standing defect
classes, the drawn-versus-tested scale, and (phase 7, added on the second pass) the two
class 9 copy claims measured against the running game.

**Watched fail on purpose, 2026-08-16 second pass.** Phase 7 was not trusted until the old
false copy was put back into `index.html` and the suite run against it: it went
**46 passed / 4 failed, exit 1**, red on exactly the four assertions that name the lie and
green on everything else, then green again once the true copy was restored. A probe you have
not seen go red is decoration.

## WHAT STILL WORRIES ME

- **Wall Climb advances on any stick.** `PROG.climbLevel` increments whenever a climb
  finishes, regardless of the multiplier reached, so "Level" on an endless wall is a run
  counter wearing a progression label. Sticking at x1 promoted the player to Climb 2.
  Not touched: changing it is a design call about what the climb ladder means.
- ~~**The panel says "of x900".**~~ RESOLVED on the second pass — it was a class 9 defect,
  not a wording question, and the copy now names the real ladder (34 bands, top x900). If
  the Director wants the wall to genuinely never end, that is a `buildClimb` change and the
  copy must move with it; phase 7 will go red the moment the two disagree again.
- **Knife reach still varies 20.9% across the catalog**, premium knives included. The copy
  is honest about it now, but nobody has decided whether a longer blade is an ADVANTAGE
  (reaches the climb wall sooner) or a PENALTY (hits Freefall side walls sooner). That is a
  balance question for the Director, and it is worth an answer before more knives ship.
- **The feedback fab is invisible on the menu** (defect 7). Real, but the fix is not in
  this file.
- **Freefall is hard enough that a bot never scores.** Both automated dives ended stuck in
  a wall having sliced zero slabs. That is a bot with no steering rather than evidence about
  the mode, but it does mean nothing here proves a Freefall level is *clearable* — only that
  it ends cleanly. The same gap as Sproing's, and worth a targeted probe that actually
  steers.
- The service worker is `sw.js?v=63`. Any deploy must bump that in step or players keep the
  old bundle, and none of the above ships.
