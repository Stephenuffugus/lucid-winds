# BURR BLAST — audit + repair, 2026-08-16

Read end to end (3109 lines) BEFORE any edit. Defect list written first, then fixed worst first.
Verifier: `node scripts/burrblast_check.mjs` in this folder (`satellites/burr-blast/check.mjs`).

Prior known-and-correct: **damage is CLOSING SPEED, not raw velocity** (`handleContact` →
`damageBody`, `speed` is the manifold closing speed). Deliberate. Not touched.

---

## THE LIST (written before changing anything)

### A. Correctness / dead ends

| # | Sev | Defect |
|---|-----|--------|
| A1 | HIGH | **Corrupt save locks the whole campaign.** `loadSave` wraps `JSON.parse` in try/catch and then trusts the shape. `SAVE.prog=s.prog||{}` accepts a string, a number, an array. `levelStars(n)` then returns `undefined`, `isLevelUnlocked` returns false for every level, and **every patch shows a padlock with no way back except Settings → Reset all progress**. `totalStars()` returns `NaN` on a string `prog`, which poisons `nutCap()`, `nutrientsLeft()`, `compSlots()` and `bringSlots()` — the loadout screen's + buttons all go dead and never say why. Worse: `SAVE.loadout=s.loadout` accepts a string, and the very next line assigns a property to that primitive, which **throws inside the try in strict mode** and silently abandons the rest of the load. This is standing class 3 exactly. |
| A2 | HIGH | **Two tabs clobber.** `persist()` writes `SAVE` wholesale from the boot snapshot. Two tabs open → the second to write erases everything the first earned: coins, stars, Fertilizer, unlocked seeds, grafts, companions, endless/expedition bests. Standing class 4. |
| A3 | MED | **Expedition state can leak into the campaign.** `_expedition`/`EXP` are cleared by the two pause buttons and by `abandonExpedition`, but not by any other route out of a run. `btnExpQuit` is gated on `confirm()`, which returns `undefined` in contexts where dialogs are suppressed — the run then cannot be quit at all from its own screen. If `_expedition` survives into a campaign fort, `getActiveLoadout()` returns the run loadout, `winLevel()` returns early into `expWinFort()`, and clearing a normal patch dumps the player into an expedition draft with no stars and no coins. |
| A4 | MED | **A stated promise that is not true.** Potassium's own copy, in two places, promises "an extra seed every 3 points, **and a steadier aim guide**" (`renderLoadout` line ~2525, `draftCard` line ~2805). The extra seeds are real (`startLevel` line ~1569). The aim guide is not: `predictPath()` does not read the loadout at all, and no other code path does. Measured, not assumed — `k` appears nowhere in `predictPath`, `render`, or the guide draw. |
| A5 | LOW | **Results copy is wrong.** `resReward` reads `next patch at 12,400 / 21,900`. Those are *this* patch's 2-star and 3-star thresholds, not the next patch's anything. |
| A6 | LOW | The sim keeps stepping after a level ends and while the menus are up (`gameLoop` only guards on `_paused`), burning frames behind a full-screen sheet. Cosmetic cost only. Left alone; noted. |

### B. Standing eight

1. **Exit gated on being framed** — CLEAR, with one hardening. `SWS_EXIT` already has the
   `document.referrer` fallback, so a top-level `/satellites/burr-blast/` navigation exits
   correctly. `#exitBtn` **is** wired (`boot()` line ~2973) and it **is** shown (`showScreen`
   reveals it on `scr-menu`), so this is not the "correct function nobody calls" shape.
   Hardening applied: the framed test was `?embed=1` **and** `parent!==window`. A frame that
   forgets the query param would have fallen through to `location.replace`, which is the blank
   frame bug the header itself warns about. Now: query param OR real frame.
   `{sws:'ready'}` is also now posted at parse **and** on `load`, per PORTAL-CONTRACT.md.
2. **Feedback fab (bottom right, ~74x74, z 2147482000)** — in play the bottom right is empty
   (ammo queue is bottom LEFT, pause/restart are top corners), so the play surface is clean.
   Full-screen sheets stack from the top, so nothing important lands in that gutter either.
   No local patch; relies on the fleet fab-yield in `/feedback.js`.
   ⚠️ At audit time `/feedback.js` did not parse (unterminated comment at line ~449, another
   agent mid-edit). Reported up, not touched — out of this sandbox.
3. **Corrupt save merely parsing** — FOUND, see A1. Fixed.
4. **Two tabs clobber** — FOUND, see A2. Fixed.
5. **Silent failure** — the art loader has a real `onerror` (`ART[nm].ok=false` → canvas
   fallback), the mascot `<img>` has `onerror`, `_sbCapEarn` is best-effort by fleet design and
   the UI never claims a sunbeam number, so it cannot lie about one. No new instance found.
6. **Touch targets under 48 rendered px at 375x667** — FOUND: `.nstep` (the nutrient +/− steppers)
   44x44, `.load-tabs .lt` 44 tall, `.toggle` hit-slop 46. All measured rendered, not declared.
   Fixed to 48.
7. **Dashes in player copy** — CLEAR. Every em/en dash in the file is inside a comment;
   scanned string literals and HTML text nodes separately and found none.
8. **An overlay covering a control** — the ability hint, the toast and the world card are all
   `pointer-events:none`. The rotate nudge is a real full-screen cover but it has its own
   dismiss button and only appears while playing in portrait. No instance.

### C. Loop, teaching, curve — read, judged, not defects

- **Core loop start to finish is complete.** Boot → intro comic (once) → menu → patch grid →
  loadout → fort → result → next. 31 authored levels across 4 worlds plus a boss, plus Endless
  and an 8-node Expedition roguelite. Every screen has a way back. Boss win routes to the
  closing comic then the menu.
- **First thirty seconds teach.** Level 1 is one pest on bare soil with two burrs — you cannot
  fail to learn "pull back, let go". Level 2 adds a block, 3 a hut, 4 a tower, 5 a shelter you
  must collapse. Each world introduces one seed and builds forts that need it. That is a real
  curve, not a flat one, and it is authored rather than generated.
- **Stubs**: `applyRelicMods` / `applyCompanionMods` / `applyGraftMods` are described in a
  comment as "stubs (slices 4-6)" but all three are fully implemented and wired. The comment is
  stale; the code is not a stub. `SAVE.nutrientCap` is a genuinely dead field — `nutCap()` is
  derived from stars and never reads it. Harmless, left.

---

## WHAT I FIXED (worst first)

1. **A1 — save validation.** `loadSave` now runs every field through a shape check:
   `prog` entries must be objects with finite `stars` 0..3 and finite `score`; `skins`,
   `seeds`, `grafts`, `compOwned`, `bonds`, `lossPaid` must be plain objects with sane values;
   `loadout.nutrients` must be an object of finite non-negative numbers; `companions`/`satchel`
   must be arrays of known ids; counters are coerced with `_num()` so a string or `null` becomes
   0 rather than `NaN`. A save that parses but has the wrong shape now degrades to defaults
   **field by field** instead of taking the whole game down. `totalStars()` also hard-guards so
   it can never return `NaN` even if something slips past.
2. **A2 — merge on write.** `persist()` re-reads what is on disk and merges before writing:
   per-level stars and score take the MAX, `coins`/`fert` apply *this tab's delta* since its own
   last write (so spends still spend and earns still add), `endlessBest`/`expBest` take the MAX,
   `skins`/`seeds`/`grafts`/`compOwned`/`lossPaid` union, `bonds` take the MAX per companion,
   and settings/equip/loadout are last-write-wins because they are preferences, not progress.
   Two tabs can now both play a session and neither loses anything earned.
3. **A3 — expedition containment.** `beginFort()` (the one door into a campaign fort) now
   abandons any live expedition first, so no route out of a run can leak `EXP` into the
   campaign. `btnExpQuit` no longer depends on `confirm()` returning a boolean: a suppressed
   dialog now quits rather than trapping the player in the run.
4. **A4 — Potassium's aim guide made true.** `predictPath()` now reads the active loadout: each
   Potassium point adds one plotted step and the dot spacing tightens from every 4th step to
   every 3rd at 6+ K, so the arc genuinely reads further and finer. The promise in the copy is
   now something the player can see. (The alternative was deleting the words; the guide is
   cheap, it is the utility stat's only non-quantity effect, and Potassium was otherwise a
   flat "+1 burr per 3" tax on the other two.)
5. **A5 — results copy.** Now reads `★★ at 12,400 · ★★★ at 21,900`, which is what the numbers
   actually are.
6. **B6 — touch targets.** `.nstep` 44 → 48, `.load-tabs .lt` 44 → 48, `.toggle` hit-slop
   `inset:-7px` → `-8px` (46 → 48 rendered). Verified by measuring `getBoundingClientRect()` in
   a real browser at 375x667, not by reading the CSS.
7. **B1 — embed protocol hardened** (see B1 above).

## WHAT I IMPROVED, AND WHY THAT ONE

**The trajectory guide now stops at what it hits.** `predictPath` integrated gravity and drag
but ignored every block in the world, so the dotted arc drew straight through the fort and out
the far side. On a slingshot game the guide *is* the aiming interface, and an arc that lies
about the first thing it touches is the single biggest per-minute cost in the game: every shot
starts with reading that line. The path now stops at the first block or pest it crosses and
draws a small impact mark there. It is a swept-circle check against block AABBs and pest radii,
capped at the same 90 steps, so it costs nothing per frame.

That is more play value per minute than any of the alternatives I considered (more levels, more
seeds, more expedition nodes) because it improves *every shot in every mode*, including the ones
already shipped.

## WHAT STILL WORRIES ME

- **The 3-star thresholds are derived, not tuned.** `G.star2`/`G.star3` come out of a formula
  over block score and ammo count (line ~1581). Nobody has played all 31 levels and confirmed
  3 stars is reachable on each. The formula is plausible; that is not the same as verified.
  A real completability proof needs a bot that can aim, and there is no such bot here.
- **Expedition difficulty is unmeasured.** `generateFort` gives roughly one seed per pest plus a
  cushion. It has never been sampled at depth 6-8 with an elite modifier, so the late run may be
  either free or impossible and nobody knows which.
- **`/feedback.js` was mid-edit and syntactically broken during this pass** (unterminated comment
  around line 449). Every game on the fleet, including this one, silently loses its feedback fab
  until that is closed. Out of my sandbox; flagged, not touched.
- The physics is a hand-rolled sequential-impulse solver. It has a settle guard, sleeping, and
  adaptive substepping, and the shipped forts settle clean (`BB_DEV.settle`), but any new fort
  shape is an unknown until it is simulated.
