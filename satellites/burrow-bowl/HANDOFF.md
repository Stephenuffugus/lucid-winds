# Burrow Bowl — handoff

Slug: `burrow-bowl` (working title, Director renames).
Built: 2026-08-07. Build stamp in game: `v1.0` (bottom of the menu).

Skee-ball in the night-garden arcade. A wooden lane runs up the portrait screen
into a board of burrow rings (10/20/30/40/50 bullseye plus two corner 100
burrows). The player flicks a dewball up the lane: flick speed is power, flick
angle is line. Physics is fully deterministic — the same flick always throws
the same shot. 9 balls a round, classic scoring, personal best, a date-seeded
daily lane, and a ticket meter with a three-trophy shelf.

---

## SESSION STATE (added 2026-09-07; the newest entry is first)

- 2026-09-08 03:41 UTC, Fable's builder (REVIEWER finishing the builder that hit its session limit mid gate, then reviewing the whole): **DONE, stamp `20260908b`. The wall is gone, a hard thumb on a corner line sinks the 100, and every new assertion has a red witness.** The builder's code edits were sound; what was left was the gate finishing, the mutation watches, the shots, and three review fixes.
  **What the builder left (all inside the fence), kept:** the Aug-20 `over=df>1.15` wall removed from `toFlight()` (its settle/draw/sfx `wall` branches too), the vector clamp in `launch()` so a send past `VY_MAX` keeps its line instead of the lateral part outrunning the capped forward part (that was the corners drifting wider the harder you flick), `READ_MS` 120 to 55 in `fup()` so a hold-then-snap reads the snap, the `BB_BUILD` stamp var + comment, the node replica `sim.mjs`, `check.mjs` B8 (the flick from where the thumb stands), `tools/shots.mjs`.
  **Three review fixes I made (check.mjs and shots.mjs only, game logic untouched):** (1) **B8 found the fault the player never meets.** On a fresh profile the fleet's music card is up at boot and docks over the bottom third, which is the RACK; the builder's B8 started the round with `BB.start()` and left the card there, so `elementFromPoint` under the thumb gave a DIV and every drag was eaten (gate red first run, `the thumb's start point is the game canvas` FAIL then a 45 s hang). Fixed by taking the PLAYER'S route in, by real `touchscreen.tap` on Roll a round then Take the lane (each centre hit-tested to itself first, never `el.click()`); that tap folds the card into its pill. Logged: `music card at boot: up, after the route in: folded`. (2) **The B8 dispatcher placed points by COUNT, not the clock**, so on this 2-core box under a 4.1 load a 3000 px/s snap read 491 over 80 ms and the next throw never launched (a second 45 s hang). Rewrote both the page-dispatch and CDP paths to place each point where a thumb at that speed would be at the moment it is dispatched, and made `verdict()` return `nolaunch` instead of hanging 45 s if a drag never leaves the rack. (3) **The read band was in the wrong unit**: the game reads STAGE px/s (stagePt scales 540/W), the gate speaks CSS px/s, and the builder's `0.75..1.35` band on the raw read passed only by the accident that 540/412 is 1.311. Converted every read to CSS px/s (`cssRead`) with a tight +/-15 percent band. Also corrected the file manifest (section 2) and the size (61 to 75 KB).
  **Gate, under the fleet lock, on the final tree: `node satellites/burrow-bowl/check.mjs` = 58 passed, 0 failed** (phase A syntax + stamp law x3; phase B behaviour at 375x667; B8 the flick at 412x915). `node sim.mjs 412` prints the bands: rollback under 482, tray 483-898, rings 899-1416 (50 at 1101-1202), back band 10 from 1417 to the clamp, NO wall; corner 100 sinks 1700+ at 12.75-16 deg, the line preserved at 3000/5000 by the vector clamp. `tools/dupkeys.mjs` 0 duplicates; 6 inline blocks compile.
  **Every new assertion watched RED under a planted mutation, then reverted byte for byte (scratchpad/bb-mutate.mjs, each revert hash-checked against pristine):**
    - **oldwall** (restore the Aug-20 `over=df>1.15` wall + drop the vector clamp), planted ALONE (run M3): 14 red incl. `straight 2000/3000/5000 is judged, not walled` (wall), `... reaches full depth` (landY 118), `the CDP drag is judged, not walled`, `15 deg at 2000/3000/5000 sinks the corner 100` (wall 10), `a sweep of lines at 2500 sinks at least one` (0 sunk), `a wide full send still gutters` (wall), `BB.flick(2050,0) is judged and not a wall` (wall y 118), `sim.mjs agrees with the game (the seam)`. This is the exact fault Stephen's note 30/31 names.
    - **oldwall + stampvar** (run M1): the three stamp-law assertions red (`20260908c vs comment 20260908b`, `portal ... vs game`, `tags ... vs game`).
    - **novector** (drop only the vector clamp) + **simdrift** (sim.mjs 0.55 to 0.5) + read120 (run M2): `15 deg at 3000/5000 sinks the corner 100` red (gutterAir 0, the line outran the power) and `sim.mjs agrees (the seam)` red (`1650,-190: game tray vs sim sink`).
    - **wholegesture** (replace the READ_MS walk-back with `first=pts[0]`, the whole-gesture average) + clampdrift + oldwall (run M1b): `a hold then a snap reads the snap` red (read 823 of 3000), `the read window is the last 55 ms` red (window 474 ms), and `the replica reads the launch clamp` red under clampdrift (`sim 2050` vs a game capped at 1500).
    - The B8 harness self-check `straight X is read at speed` was seen red for real by the FIRST run of the count-based dispatcher (`straight 2000 read 618`), which is exactly the harness bug it guards; the clock dispatcher fixed it (green reads 1998/3000/4995 CSS px/s).
  **Shots opened (docs/shots/, all under 200 KB), from the player's route in at 412x915 and 375x667:** `hundred-tall.jpg` and `hundred-mid.jpg` both show the corner 100 sunk from a real 2500 px/s at 15 deg pointer drag (read 3165 / 3484 px/s): SCORE 100, the +100 pop on the left burrow, ONE HUNDRED across the lane. `lane-tall.jpg` shows the racked dewball with FLICK UP THE LANE and both corner burrows open. **Three things I see:** (1) at 375x667 the fleet feedback ladybug fab sits on the SCORE readout top-left (a readout, not a control, so no tap is stolen and the class-2 gate is right to pass; it is the top band, which the brief reserves for the chip, so the game arguably should not paint SCORE there, but that is a pre-existing layout call unrelated to tonight's note). (2) the +100 pop clips the board's left edge slightly (cosmetic, pre-existing). (3) the racked dewball overlaps the 9-ball progress dots at rest (cosmetic). None are regressions from this change; none are small enough to fix inside tonight's fence without touching layout unrelated to the note.
  **What I did NOT do, on purpose:** note 32 / director-call 65 (the ramp shows no power or line) is unbuilt, as the builder chose; it is a taste/new-work call in `docs/DIRECTOR-CALLS-SEP06.md`, not a fault, and how HARD the corner 100 should be is likewise Stephen's (the contradiction the builder flagged: the brief wanted straight 2000/3000/5000 to each land a NON-10, but the board and the rules card make a straight overthrow a tray 10 by design, so the gate asserts "judged at full depth, never walled" for straight and "the 100 sinks" for the line, and says so in its comment). The 375x667 SCORE/fab overlap and the two cosmetic clips are left for a layout pass. I did not touch any file outside satellites/burrow-bowl and the two burrow-bowl `?v=` strings.

- 2026-09-08 00:40 UTC, Fable: **THE SORT of his Sep 07 notes** (verified by one read-only agent per game and a
  second reader who tried to refute every fault; nothing built yet, he sees this first). Taste and new
  work are in `docs/DIRECTOR-CALLS-SEP06.md` section I with a recommendation and a cost each.
  **30, 31 ONE FAULT, confirmed twice, and it is the Aug 20 complaint back:** a full power flick can never score. Node replica of `:594-641` at his 412 px layout (1 CSS px = 1.31 stage px): the corner 100 window is 1568 to 1858 CSS px/s at 12 to 20 degrees; anything at or over 1860 CSS px/s (rs > 1765, df > 1.15) is a WALL for 10 at every angle, checked before the gutter; a real thumb is 2000 to 5000. The Aug 20 fix (1ebfafb6) moved that ceiling by about 100 CSS px/s, below anything a hard thumb produces, and the rules card (`:174`) still says the 100s want "a full power roll". Not a regression: nothing in physics, input or fit changed since Aug 20 (brand strings, the music include, one comment); "now" is his thumb flicking harder for the corners. Straight bands at 412: under 482 rollback, 483 to 898 tray 10, 899 to 1417 rings, 1418 to 1859 back band 10, 1860 up wall 10. Also `:957-959` averages the last 120 ms so a hold then snap reads at half speed and lands short. Gate: check.mjs never drives a pointer; its only launches are BB.flick(1080,0), 53 percent of the clamp; the Aug 20 "solution space 3.53 percent" was measured in launch space, never converted to what a thumb does. 1 to 2 h: the corner window above the rings and below the clamp with a full send judged, plus a pointer drag gate at 412 across 2000 to 5000 CSS px/s asserting a non 10. How HARD the 100 should be is his. 32 NEW WORK call 65: the ramp is drawn (32 CSS px tall) and hops, but nothing shows power or line, so a player cannot learn that the hard flick is the one that walls.
  **Doc against code:** section 7 says vy clamped 520..2050 (code 300..2050) and the 100s need rs 1490 to 1580 of 1600 (pre Aug 20); section 8 claims a real 120 px drag in the gate (there is none); section 1 says not deployed (it is live and byte identical to HEAD).

- 2026-09-07 (UTC, his evening Sep 07 EDT), Fable: **STEPHEN'S NOTES FROM THE PHONE TEST, VERBATIM.**
  Recorded here before anything was decided about them, per HANDOFF-FABLE-SEP06-EVENING.md section 1.
  Numbers are the master transcript's (35 lines across Gerplunk, Inkswing, Airworthy, Fathom, Asterism,
  Burrow Bowl, Updraft). Dictation typos are his and are kept. The sort (fault / taste / known) is the
  next entry above this one once he has seen it.
  30. "Burrow bowl still won't let me score the big points in the top left and right it just bounces off them every time"
  31. "and now it's pretty much impossible to anything except for a 10."
  32. "If we've got a ramp there that launches it up, it needs to be displayed and articulated and so the game actually shows what you're doing"

---

## 1. Deploy

Live at `lucidwinds.com/satellites/burrow-bowl/` (Fable deploys by pushing
add-sproing-jumper to main; Hostinger serves it). This folder is the whole
game. Nothing needs a build step. **Stamp:** this game has no stamp of its own;
it rides the portal link's `?v=` (`portal/index.html` and
`portal/catalog-tags.json`), and `var BB_BUILD` near the top of the game
script carries the same string so a probe can grep the live page. check.mjs
holds the three together. Bump all three or none. Current: `20260908b`.

- **Serve path when vendored:** `lucidwinds.com/satellites/burrow-bowl/`
- Every path in `index.html` is relative except `<script src="/dev-gate.js?v=2">`
  in the head (the fleet workbench gate, root-served like the rest of the fleet).
- `thumb.png` is referenced only from `og:image` / `twitter:image`; a missing
  thumb costs a link preview and nothing else.
- **No service worker. No manifest. No third-party requests** — verified
  headless: the only requests are the page itself and same-origin `dev-gate.js`.

## 2. File manifest

| File | Size | What it is |
|---|---|---|
| `index.html` | 75 KB | The entire game. Markup, CSS, JS, art, audio, all inline. |
| `thumb.png` | 120 KB | Portal card source. 500x500 crop of the live menu. |
| `HANDOFF.md` | — | This file. Not deployable, harmless if it ships. |
| `check.mjs` | — | The gate (syntax, stamp law, behaviour at 375x667, the flick at 412x915). Runs under the fleet lock. |
| `sim.mjs` | — | Node replica of the roll and the judge; reads the constants and judge() out of index.html. No browser, no lock. |
| `tools/shots.mjs` | — | Shoots title, lane, a corner 100 in flight and sunk at 412x915 and 375x667 into `docs/shots/`. Under the lock. |
| `docs/shots/` | — | The looked-at screenshots, each under 200 KB. |

## 3. Portal card copy

**Hook:** Flick a dewball up the wooden lane and drop it home in the burrow
rings. The corner hundreds are waiting.

**Paragraph:** Burrow Bowl is skee-ball at night, in a garden. A wooden lane
runs up the screen into a board of glowing burrow rings, and one flick throws
the ball: speed is power, angle is line, and the same flick always lands the
same shot, so the lane can truly be learned. Anyone can drop 20s all night. The
40 asks for a soft touch. The two tiny corner burrows pay 100 and want a full
power roll on an edge line with the gutter waiting just wide of them. Too soft
and the ball rolls back to your hand. Nine dewballs a round, a personal best
that remembers, and one nightly lane where a date-seeded breeze and coat of wax
change the roll, subtly, the same for everyone. Rounds pay tickets toward a
shelf of three trophies that nothing can buy.

## 4. Earn moments

Announced with `parent.postMessage({sws:'earn', moment, detail}, '*')` only
when `window.SWS_EMBED` is true. The game never sets an amount. All are deduped
in `bb_moments` so replays and reloads cannot re-fire them.

| moment | gate | rough frequency |
|---|---|---|
| `daily_done` | once per calendar day, when the nightly lane's round ends | at most 1/day, only if they roll the nightly lane |
| `round_over_300` | first round of 300 or more each day | most sessions with a decent player, once |
| `first_hundred_burrow` | once ever, on sinking a corner 100 | once, usually within a player's first few rounds |

**Sunbeams** (fleet standard `window._sbCapEarn`, 30/day cap in
`localStorage.sw_sb_burrow-bowl`, null-guarded at every call site):

| when | sunbeams |
|---|---|
| every round finished, scaled by score | `min(8, floor(score/40))` — a 200 round pays 5, 320+ pays 8 |
| `daily_done` (once per day) | +4 |
| `round_over_300` (first per day) | +3 |
| `first_hundred_burrow` (once ever) | +2 |

An honest session (two free rounds plus the daily, scores around 200 to 300)
earns roughly 20 to 27; a hot session caps at 30. Verified headless: a 570
round on a fresh profile wrote `{"n":13}` (8 round + 3 over300 + 2 first
hundred), and a separate profile's daily play wrote 4 on top of its round pay.

Tickets are internal bragging currency only, never converted:
`tickets = floor(score/10) + 5 per sunk hundred`, added at round end.
Trophies derive from lifetime tickets: Acorn Cup 100, Silver Dew 500, Golden
Burrow 2000. Crossing a line pops a one-time trophy card over the summary.

## 5. Nav map

Screens are internal `display` switches. Nothing touches `location` or
`history` except `SWS_EXIT`.

```
s-title  (MENU)
  Roll a round ......... -> s-how (mode free)
  Tonight's lane ....... -> s-how (mode daily); disabled once today's is rolled
  How to play .......... -> s-how (read only, no start button)
  Settings ............. -> s-set
  < All Sky Wolf games . -> SWS_EXIT()      <-- the only exit in the game

s-how   (RULES, always shown before play; daily mode shows tonight's
         wind and wax in the note card)
  Take the lane ........ -> s-play, racks ball 1
  < Menu ............... -> s-title, or back to the paused round if opened
                            from the pause overlay

s-play  (transparent HUD layer over the canvas)
  flick on the lane .... throws the ball (drag starting below the board)
  Space / Enter ........ a preset gentle straight throw (lands a 20)
  pause button ......... -> o-pause
  Escape ............... -> o-pause

o-pause
  Resume ............... back to the round exactly where it froze
  How to play .......... -> s-how, its back returns here
  End the round ........ -> s-sum; balls already thrown stand, the rest are
                            never thrown. On the daily this spends the daily
                            (the pause copy warns).

o-note  (trophy celebration, over the summary)
  Ready ................ closes, summary remains

s-sum   (ROUND SUMMARY: 9 chips, total, tickets, trophy meter)
  Roll again ........... -> s-how (free)
  Tonight's lane ....... -> s-how (daily); disabled once rolled
  < Menu ............... -> s-title

s-set   (SETTINGS: Sound / Extra motion / High contrast rings,
         trophy shelf, stats, two-tap Clear my scores)
```

Every screen change routes through one `show(id)` that closes all overlays
first. Verified headless on every path: exactly one visible screen, zero
stray overlays (computed display + opacity walk).

## 6. localStorage keys

All writes wrapped in try/catch; private mode degrades to a session-only game.

| key | shape | holds |
|---|---|---|
| `bb_best` | number as string | best free round score |
| `bb_daily_best` | number as string | best nightly lane score ever |
| `bb_daily` | `{date:"YYYY-MM-DD", score}` | today's nightly result; present and matching today = the lane is spent |
| `bb_stats` | `{rounds, hundreds, gutters, totalScore}` | lifetime counters (settings screen) |
| `bb_moments` | `{first_hundred:0|1, r300_date:"", daily_date:""}` | earn-moment dedupe gates |
| `bb_tickets` | number as string | lifetime tickets; the trophy shelf derives from this |
| `bb_set` | `{sound, motion, contrast}` | settings; `motion` defaults 0 under `prefers-reduced-motion: reduce` |
| `sw_sb_burrow-bowl` | `{d:<day>, n:<earned>}` | fleet sunbeam day-cap ledger; key derives from the directory URL |

"Clear my scores" removes `bb_best`, `bb_daily_best`, `bb_daily`, `bb_stats`.
It deliberately leaves `bb_moments` (clearing can never refarm one-time earns),
`bb_tickets` (the shelf is not a score), and `bb_set`.

## 7. How the game is tuned

Everything lives in a handful of constants near the top of the game script.

```js
FRICT=260            // lane friction px/s^2, times the daily wax
RS_MIN=500 RS_MAX=1600  // ramp speed window -> landing depth 0..1, held at 1 past RS_MAX
VY_MIN=300 VY_MAX=2050  // launch clamp; past VY_MAX the send scales as a VECTOR (line survives power)
READ_MS=55           // the flick reads its speed over the last 55 ms before release
DY0=400 DY1=112      // landing y at depth 0 and 1 (board coords)
RINGS=[[26,50],[60,40],[96,30],[132,20]]   // bullseye radii and pay
H100 at x 104/436, r 25                    // the corner burrows
BOARD_F=1.2          // lateral world -> board spread
launch: vy = flickSpeed*0.75, vxW = flickX*0.30; then if vy > VY_MAX both scale by VY_MAX/vy;
        then vy clamped 300..2050, vxW clamped ±340. No wall: nothing past the clamp exists.
```

- **Deterministic:** no randomness anywhere in play. Roll is a fixed-step
  integrator (1/240 s), the landing point is computed once at the ramp, and
  everything after is cosmetic animation. Same flick, same score, any device.
- **Scoring is a pure function of the landing point** (`judge`). Rattles are
  show; the point decides. Near-miss on any rim shimmies the ball and plays
  the rattle; a near-miss on a 100 rattles then falls out to the tray for 10.
- **The skill ladder as shipped (2026-09-08, in CSS px/s on a 412 px wide
  phone, from `node satellites/burrow-bowl/sim.mjs 412`):** under 482 rolls
  back free; 483 to 898 is short, tray 10; 899 to 1416 is the rings (20 30 40
  50 40 30 20, the 50 at 1101 to 1202); 1417 and up is the back band, which a
  STRAIGHT ball rolls down from for 10 by the rules card ("Overthrow it and
  the back wall hands the ball down to the tray"). The corner 100s want 1700
  or more on a line 13 to 16 degrees off straight; past the clamp (2085) the
  send scales as a vector so the same line sinks at 3000 or 5000 (12.75 to
  15.25 degrees). Wide of that is the air gutter, 0. There is no wall any
  more: the Aug 20 grace band ended at 1860 CSS px/s, under any hard thumb.
- **Rollback is free:** a ball that dies before the ramp rolls back to the
  rack and is not spent (real skee-ball behavior). It cannot be farmed —
  there is nothing to earn from it and physics is deterministic anyway.
- **Daily lane:** two independent mulberry32 streams off the date seed
  (`seed` and `seed^0x9E3779B9`) so wind can never shift wax. Wind is a
  constant lateral acceleration during flight only (±44 px/s^2 max, labeled
  from the left/right); wax multiplies lane friction (0.93..1.07, labeled
  slick/honest/grippy). Both printed on the daily rules card and on the HUD.
- **Contrast rule:** a 20 is a small pop and one soft chime. A corner 100 is
  a screen flash, a 36-spark burst, shake, a five-note arpeggio with shimmer,
  and ONE HUNDRED across the lane. The big line prints on the lane, never
  across the rings.
- **Sound** is a tiny synthesized set (tones + filtered noise): flick whoosh,
  wood rumble that follows ball speed while it rides the lane (looped noise
  through a lowpass, killed at the ramp), the ramp hop, per-ring sink chimes
  rising in pitch, rim rattle ticks, gutter slide, back-wall thud, ticket
  tick. Nothing plays before a user gesture; the toggle persists.

**Test hook:** `window.BB` (`state`, `settings`, `start(mode)`,
`flick(vy,vxW)`, `lastRead()`, `judge`) attaches only with `?bb_test=1` or
`localStorage.bb_test='1'` — `flick` is a guaranteed deterministic throw, so
it must never attach for players.

## 8. What was verified, headless, at 375x667

- Full 9-ball round played to the summary by real mouse flicks + scripted
  throws: every outcome exercised (50, 40, 30, 20, corner 100 sunk, rim
  rattle out to tray, lane gutter, flight gutter, back wall, rollback).
  Arithmetic checked by hand: 570 round = 3x100 + 4x50 + 40 + 30, tickets
  57+15, ledger 13.
- Real pointer-drag flicks at 412x915 (check.mjs B8, added 2026-09-08; before
  that this gate never drove a pointer and the claim that stood here was
  false): straight at 2000, 3000 and 5000 CSS px/s are judged at full depth
  and never walled; 15 degrees at 2000, 3000 and 5000 sinks the corner 100; a
  hold then a snap reads the snap; one drag goes through CDP page.mouse.
- Rules screen before every play, re-openable from menu and pause, fits
  without scrolling at 375x667.
- Every button's centre point hit-tests to itself (`elementFromPoint`), taps
  are real mouse coordinates, nothing `el.click()`ed.
- Rendered touch targets at 375x667: menu/rules/summary/settings buttons and
  rows 51.4 px, pause 51.4x51.4 px. All above the 48 px floor.
- Daily lane deterministic: same conditions string across a reload; one round
  per day enforced; quitting the daily spends it and the pause copy warns.
- Trophy line crossed (100 tickets) pops the Acorn Cup over the summary, and
  closing it leaves exactly one painted layer. Every path walked came back
  with one visible screen, zero overlays.
- `prefers-reduced-motion: reduce` defaults Extra motion off.
- Embedded in a real iframe with `?embed=1`: `{sws:'ready'}` on load,
  `{sws:'close'}` from SWS_EXIT, frame URL never changes.
- Zero console errors, zero page errors, zero failed or third-party requests
  on every pass.

## 9. Known weak spots

- The synthesized audio has not been heard on a real device or at real
  volume. The rumble gain curve especially is tuned blind.
- Not tested on a physical phone, iOS Safari, or the Pi Browser. The flick
  reads pointer events with a touchstart preventDefault; it should behave,
  but nobody's thumb has proven it.
- Wind on the daily lane is invisible in flight (it is only printed as a
  label). A drift ghost or a leaning grass cue would teach it better.
- The corner-100 rattle-out and sink look identical for the first 0.4s; a
  sharper tell (rim flash on the sink) would reward a ten-foot read.
- The board is drawn flat-on with squashed ellipses for tilt. It reads, but a
  designer may want real perspective on the ring stack someday.
