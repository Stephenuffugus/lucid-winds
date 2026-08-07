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

## 1. Deploy

Not deployed. This folder is the whole game. Nothing needs a build step.

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
| `index.html` | 61 KB | The entire game. Markup, CSS, JS, art, audio, all inline. |
| `thumb.png` | 120 KB | Portal card source. 500x500 crop of the live menu. |
| `HANDOFF.md` | — | This file. Not deployable, harmless if it ships. |

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
RS_MIN=500 RS_MAX=1600  // ramp speed window -> landing depth 0..1
DY0=400 DY1=112      // landing y at depth 0 and 1 (board coords)
RINGS=[[26,50],[60,40],[96,30],[132,20]]   // bullseye radii and pay
H100 at x 104/436, r 25                    // the corner burrows
BOARD_F=1.2          // lateral world -> board spread
launch: vy = flickSpeed*0.75 (clamped 520..2050), vxW = flickX*0.30 (±340)
```

- **Deterministic:** no randomness anywhere in play. Roll is a fixed-step
  integrator (1/240 s), the landing point is computed once at the ramp, and
  everything after is cosmetic animation. Same flick, same score, any device.
- **Scoring is a pure function of the landing point** (`judge`). Rattles are
  show; the point decides. Near-miss on any rim shimmies the ball and plays
  the rattle; a near-miss on a 100 rattles then falls out to the tray for 10.
- **The skill ladder as shipped:** a straight medium flick lands in the
  bullseye (20 at worst). The 40 band's center-line window is roughly a 7%
  power band. The corner 100s need ramp speed ~1490-1580 of 1600 on a line
  two thirds of the way to the gutter; wide means a 0.
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
`flick(vy,vxW)`, `judge`) attaches only with `?bb_test=1` or
`localStorage.bb_test='1'` — `flick` is a guaranteed deterministic throw, so
it must never attach for players.

## 8. What was verified, headless, at 375x667

- Full 9-ball round played to the summary by real mouse flicks + scripted
  throws: every outcome exercised (50, 40, 30, 20, corner 100 sunk, rim
  rattle out to tray, lane gutter, flight gutter, back wall, rollback).
  Arithmetic checked by hand: 570 round = 3x100 + 4x50 + 40 + 30, tickets
  57+15, ledger 13.
- A real pointer-drag flick launches the ball (the input path, not just the
  hook): a 120px drag in ~70ms threw a 40.
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
