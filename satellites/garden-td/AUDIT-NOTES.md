# GARDEN GUARD (garden-td) — audit + repair, 2026-08-16

Read end to end (2580 lines) BEFORE any edit. Defect list written first, then fixed worst first.
Verifier: `node satellites/garden-td/check.mjs` (add `--selftest` for the FAILWATCH pass).
100 assertions green; 6 more re-break each guard on purpose and prove the check goes red.

---

## THE LIST (written before changing anything)

### A. Correctness / dead ends

| # | Sev | Defect |
|---|-----|--------|
| A1 | HIGH | **The tutorial tip swallows the tap it asks for.** The tip card says "tap to continue ›", but the only listener that dismissed it was on the tip element itself. The canvas handler read `if (tip is showing) return;` — so a tap on the BOARD did nothing at all, no dismissal and no plant. That is the level 1 tutorial, i.e. the first thirty seconds of the game, and the tip's own text ("Tap a dashed soil spot to plant a friend") points the player at the board. |
| A2 | HIGH | **The feedback fab sits on the speed toggle.** Measured at 375x667 in a real browser: `#btnSpeed` occupies x 299-363, y 601-657; the fab's own gutter is x 285-363, y 607-655. Dead centre, and the fab is z-index 2147482000, so nothing in the game can out-stack it. `#btnWave` overlapped it too. Standing classes 2 and 8 in one control. |
| A3 | MED | **Corrupt save, two holes.** `levels` was taken wholesale if it was any object, so a record could be a string or a number. Worse, `settings` values were copied by KEY with no type check, and `textScale` goes straight into `document.documentElement.style.fontSize` — a save with `textScale: 40` renders the entire UI at 640px and there is no way back, because the Settings screen is part of the UI. Standing class 3. |
| A4 | MED | **Two tabs clobber.** `saveGame()` wrote `save` wholesale from a boot snapshot: Sap, every cleared level, every unlocked plant, every bought cosmetic, both endless bests, and the Bramble unlock. Standing class 4. |
| A5 | LOW | **The menu labels stars "Leaves".** `🌟 0 Leaves` on the main menu, while 🍃 Leaves is the in-game LIVES currency shown in the HUD every second of play. Two different things with the same name on adjacent screens. |
| A6 | LOW | `btnQuit` (pause → Quit to Map) leaves `G` alive rather than nulling it. Benign in practice: the sim is gated on `UIState==='GAME'` so the abandoned run is frozen, and the next `startLevel` replaces it. Noted, not changed. |
| A7 | LOW | `_sbCapEarn` debits the local 30/day ledger and returns a granted count that the win screen prints, even if the remote `Sunbeam.earn` rejects (the `.catch` is empty). Fleet-wide pattern, not local to this game; flagged rather than changed unilaterally. |

### B. Standing eight

1. **Exit gated on being framed** — CLEAR, with the same hardening as Burr Blast. The referrer
   fallback was already there, `#exitBtn` **is** visible on every non-play surface and **is**
   wired at line ~2333, so something really does call `SWS_EXIT`. Hardened: `framed` is now
   `?embed=1` **or** a real parent (a frame without the query param would have hit
   `location.replace` inside the frame), and `{sws:'ready'}` is posted at parse **and** on load.
   Both proved by loading the game in a real iframe and catching the postMessages.
2. **Feedback fab** — FOUND, see A2. Fixed locally (the bar reserves the gutter) **and**
   verified against the live `/feedback.js` yield: after 4s of its watcher, the fab parks with
   no control under any of its five probe points.
3. **Corrupt save merely parsing** — FOUND, see A3. Fixed. Eight corrupt shapes are now in the
   verifier, including `levels` as a string and `textScale: 40`.
4. **Two tabs clobber** — FOUND, see A4. Fixed.
5. **Silent failure** — the art loader has a real `onerror` per image and a `manifest.json`
   that 404s cleanly into a 100% canvas fallback. `sfx` degrades if WebAudio is absent. The one
   genuine instance is A7, which is fleet-shaped rather than local.
6. **Touch targets under 48 rendered px at 375x667** — CLEAR, and now measured rather than
   assumed, across nine menu screens plus the HUD, the keeper bar and BOTH bottom sheets. The
   probe credits invisible hit-slop by hit-testing 23.5px out from centre, because a 32px
   toggle with a negative-inset `::before` really is a 48px target and a box measurement would
   report a false failure.
7. **Dashes in player copy** — CLEAR. Scanned string literals and HTML text nodes separately;
   every em/en dash in the file is inside a comment.
8. **An overlay covering a control** — the tip (z 55) is the only floating panel over the
   board, and it now dismisses on any tap. The two bottom sheets lift the board rather than
   covering it (`view.buyLift`, already handled 7/17). The fab was the real instance: A2.

### C. Loop, teaching, curve — read, judged, not defects

- **Core loop is complete and has no cul-de-sac.** Menu → difficulty → 13 levels → win/lose →
  level map, plus a Potting Shed, an endless mode gated on any 13 clear, a Keeper with two
  aimed powers and ten levels, Pollen supers, five-tier towers with a fork and a graft, and
  garden reactions between statuses. Every screen has a Back that goes somewhere sensible.
- **The curve is real and measured, not asserted.** `buildWaves` rolls its threat groups at
  random, so a single sample is noise. Over 60 rolls per level the MEDIAN total wave HP is
  1.5k at L1 → 12.1k at L12, rising at every step, with a boss finale on L3/L7/L10/L13. The
  verifier now asserts monotonic medians and a ≥4x span, and the FAILWATCH proves that probe
  rejects a flat curve.
- **The How to Play page is TRUE.** Every claim on it is now an assertion: the beehive hits air
  (`air:'yes'`), marigold reaches air at ★3 so there is no anti-air softlock, the sundew's aura
  reaches flyers and paints Wet, the pitcher carries Rot, the sunflower has the highest single
  tier-3 hit of all nine plants, and "sell it back for most of your Seeds" is exactly 70%.
- **Stubs / dead ends**: none found. `runSnapshot`, `sunbeamsForRun` and the whole result path
  are wired end to end.

---

## WHAT I FIXED (worst first)

1. **A1 — the tip.** A tap anywhere on the board now dismisses the tip and consumes that tap,
   which is what "tap to continue" always said.
2. **A2 — the bottom bar leaves the fab gutter alone.** `#hud-bot` reserves 96px on the right,
   so the wave button and the speed toggle are never under the chip. The row stays centred in
   what is left, which reads as a small left offset on a wide screen and is the right trade.
   Verified twice: the bar clears the gutter on its own, and the live fab then parks clean.
3. **A3 — save validation.** `_cleanLevels` coerces every record to `{stars 0..3, cleared bool}`;
   `_cleanSettings` type-checks each setting and pins `textScale` to the four values the UI can
   actually produce, clamps volumes to 0..1 and speed to 1..3; `_cleanOwned` rebuilds the
   cosmetics list and re-guarantees the four free defaults; skin/map/mascot must be short
   strings. A save that parses but is wrong now degrades field by field.
4. **A4 — merge on write.** `saveGame()` re-reads disk first: Sap applies this tab's delta,
   per-level stars take the MAX and `cleared` is sticky, unlocked plants and bought cosmetics
   union, both endless bests take the MAX, the Bramble unlock and the tutorial flag are sticky.
   Preferences stay last-write-wins on purpose.
5. **A5 — copy.** The menu chip now reads `🌟 N Stars`.
6. **B1 — embed protocol hardened** (see B1 above).

## WHAT I IMPROVED, AND WHY THAT ONE

I did not add content. The best value per minute of play here was **making the first thirty
seconds work**, and that is A1: the game's own tutorial asked for a tap it then threw away, on
level 1, for every new player, forever. Nothing else in this game is worth as much as the
tutorial not being broken.

The second best was A2, for the same reason at the other end: the speed toggle is the control a
tower defense player touches most after the wave button, and it had a two-billion-z-index chip
parked on it for every second of every level.

## WHAT STILL WORRIES ME

- **Endless is unmeasured.** `buildEndlessWave` scales HP by `1.06^wave` with no ceiling and
  unlocks a new heavy every ~4 waves. Nobody has run it to wave 30 to see whether it becomes
  impossible, trivial, or slow. The verifier does not cover it.
- **Bramble difficulty is unmeasured.** ×1.35 HP and ×1.15 speed on top of the level curve, with
  15 Leaves instead of 20. Plausible; not played.
- **Completability is proven for level 1 only.** [8] plants six towers and wins L1, and proves a
  no-damage defense loses. Levels 2-13 have never been proven winnable by anything. A real
  proof needs a bot that places sensibly per map, and there is no such bot here.
- **The HUD is emoji-only with no text fallback.** 🍃 20 / 🌱 575 and both keeper powers carry
  their whole meaning in a glyph. On a device without an emoji font those read as empty boxes
  and the numbers mean nothing. Seen directly in the headless screenshots; likely fine on real
  phones, but it is a single point of failure with no belt.
- `/feedback.js` was mid-edit and did not parse for part of this session (unterminated comment
  ~line 449). It parses now, and the fab yield works, but it is worth knowing that a break in
  that one file silently removes the feedback chip from the whole fleet.
