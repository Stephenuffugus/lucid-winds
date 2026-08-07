# Moon Claw — handoff

Slug: `moon-claw` (working title, Director renames)
Built: 2026-08-07. Build stamp in game: `v1.0` (bottom of the menu).

An honest claw machine. A glass cabinet of nine plump plush critters in a real
physics pile, a claw with one control (hold to glide, let go to drop), and a
grip that is the same strength every single time. Whether a prize comes up is
readable physics: where the claw centres on the body, whether the prize is
wedged under a neighbor, and how hard the load swings on the carry back to the
chute. Roughly one cabinet in six hides a golden koi at the bottom of the pile,
its glow leaking up between the plushes, and pulling it out is the big moment.

---

## 1. Deploy

Not deployed, not in the portal. This folder is the whole game.

- **Serve path when vendored:** `lucidwinds.com/satellites/moon-claw/`
- No build step, no config. Copy the folder, done.
- **Serve it at its directory URL**, not `/index.html`: the sunbeam ledger key
  derives from the last path segment.
- Requests over HTTP: itself + `/dev-gate.js?v=2` (the workbench gate, same as
  stop-the-light). `thumb.png` is referenced only from `og:image` meta.
- **No service worker. No manifest. No fonts, no CDN, no third-party anything.**
- `<script src="/dev-gate.js?v=2">` sits in `<head>` right after theme-color,
  exactly like stop-the-light. Strip it when the game graduates, or leave it
  and let the gate's localStorage flag pass everyone the portal passes.

## 2. File manifest

| File | Size | What it is |
|---|---|---|
| `index.html` | 74 KB | The entire game. Markup, CSS, JS, art, audio, all inline. |
| `thumb.png` | 71 KB | Portal card source. 500x500, shot from the live play view. |
| `HANDOFF.md` | this file | Not deployable, harmless if it ships. |

## 3. Portal card copy

**Hook:** Every arcade claw is rigged. This one is honest, and that is the
problem: now it is your fault.

**Paragraph:** Moon Claw is the arcade claw machine with the con taken out. The
grip never weakens, nothing is on a timer, and the payout table does not exist:
a glass cabinet holds a pile of plush night critters with real weight, and
whether one comes up depends on where the claw closes. Centre it over a plump
body and it is yours. Clip a limb and it rides home crooked, swinging harder
and harder, and can slip at the last second over the chute. Buried prizes need
digging in the right order, because every grab and every nudge moves the pile.
Five tokens a cabinet, a prize shelf that remembers every win, and about one
cabinet in six hides a golden koi at the very bottom, glowing up through the
pile, waiting for someone patient enough to dig.

## 4. Earn moments

Announced with `parent.postMessage({sws:'earn', moment, detail}, '*')` only
while embedded (`window.SWS_EMBED`). The game never sets an amount; the host
prices moments itself. All three are day-gated in `mc_moments` so replays
cannot re-fire them.

| moment | detail | gate | rough frequency |
|---|---|---|---|
| `first_win` | `{prize}` | once per day, first prize won | ~1/day for anyone who plays at all |
| `rare_prize` | `{prize}` | once per day, needs a rare-tier or koi win | a few times a week for a regular |
| `daily_cleared` | `{haul, prizes, date}` | once per day, all 5 daily tokens spent with at least 1 prize | at most 1/day |

**Sunbeams** ride the fleet standard `window._sbCapEarn(n, tag)` (own script
block, copied verbatim from stop-the-light, null-guarded at every call site,
30/day cap in `localStorage.sw_sb_moon-claw`):

| event | sunbeams |
|---|---|
| every prize won, by tier | common 2 · uncommon 3 · rare 5 · koi 8 |
| `first_win` (1/day) | +4 |
| `rare_prize` (1/day) | +3 |
| `daily_cleared` (1/day) | +2 |

An honest session (the daily cabinet plus one free cabinet, six-ish prizes)
lands in the 20 to 30 range; both full harness sessions closed the ledger at
`{"n":26}` and `{"n":30}` (capped). Nothing pays for empty drops or sheds.

## 5. Nav map

```
s-title  (MENU, live cabinet idling in the glass behind it)
  Play a cabinet ....... -> s-how (mode free)
  Tonight's cabinet .... -> s-how (mode daily); locked once today's is done
  How to play .......... -> s-how (read only, no start button)
  Prize shelf .......... -> s-shelf
  Settings ............. -> s-set
  < All games .......... -> SWS_EXIT()      <-- the only exit in the game

s-how   (RULES, always shown before play)
  Drop in a token ...... -> s-play, starts the round
  < Menu ............... -> s-title, or back to the paused round if opened
                            from the pause overlay

s-play  (transparent HUD layer over the canvas)
  hold the canvas ...... claw glides (ping-pongs at the rails ends)
  release .............. drops. Under 150ms = misfire, no token spent
  Space/Enter hold ..... same control on keys
  pause button / Esc ... -> o-pause

o-pause
  Resume ............... back to the round exactly where it held
  How to play .......... -> s-how, back returns here
  Leave the cabinet .... -> s-sum; a prize in the claw's grip is forfeit,
                            the banked haul stands, the daily is spent

s-sum   (ROUND SUMMARY: one row per token: prize, empty, or slipped)
  Play again ........... -> s-how (free)
  Tonight's cabinet .... -> s-how (daily); locked once done
  Prize shelf .......... -> s-shelf (back returns to s-sum)
  < Menu ............... -> s-title

s-shelf (PRIZE SHELF: every win ever, newest first, drawn portraits)
  < Back ............... -> wherever it was opened from

s-set
  Sound / Extra motion toggles (rows are the switch, 74px)
  Clear my scores (two-tap; deliberately does NOT clear the prize shelf
  or the earn-moment gates)
  < Menu ............... -> s-title
```

Every screen change routes through one `show(id)` that closes all overlays
first (the Skitterlings rule). Verified headless after every nav: exactly one
visible layer, zero stacked overlays, on every path.

**Embed:** the SWS embed/exit block is stop-the-light's, verbatim. Verified in
a real iframe with `?embed=1`: `{sws:'ready'}` posts on load, the exit button
posts `{sws:'close'}`, the frame URL never changes. (Test note: under a
cross-site test host, Chrome's third-party storage partitioning gives the
iframe its own localStorage, so the dev-gate mounts inside it even if the
tester key was entered top-level. In production the portal embeds same-site
and this does not arise.)

## 6. How the machine works, and where to tune it

Everything lives in `index.html` in one IIFE. The knobs:

- **Pile:** 9 bodies per cabinet, circle physics (gravity `PGRAV`, positional
  overlap resolution, wall/floor/divider clamps, sleep). Rarity roll per slot:
  common 56% / uncommon 30% / rare 14%. Koi cabinets: `rl() < 1/6`, koi always
  dropped first so it starts at the bottom, then a burial pass re-drops the
  highest neighbor onto it until the claw would not meet it first at its own x.
- **Two PRNG streams** from one seed (`mulberry32`): layout rolls place prizes,
  cosmetic rolls only tint (`shade`) and tilt. A new cosmetic roll can never
  shift what tomorrow's daily holds. Daily seed = date, same formula as
  stop-the-light. Generation settles at a fixed 1/60 step and the pile is left
  ASLEEP afterward, so the daily cabinet is the same pile on every phone.
- **Grip:** the descending claw meets the pile's top surface at its own x
  (`pileSurfaceAt`). Offset over the body decides everything: `|dx|/r <= 0.45`
  solid, `<= 0.88` loose (quality scales down), beyond that the jaws glance
  off and SHOVE the prize (misses still dig the pile). A neighbor resting on
  top halves quality ("wedged"). All thresholds live in `resolveGrip`.
- **Carry:** trolley runs a trapezoid speed profile to the chute; the hanging
  load is a forced pendulum (`GEFF`, `CARRYL`). A crooked grip starts tilted,
  hard swings slip it further (audible ticks), and past `limA = 0.30 + q*0.85`
  it sheds. Deterministic, never random theft. The braking kick at the chute
  is the honest last-second heartbreak. A shed that lands left of the divider
  falls in the chute anyway: the lucky drop is real.
- **Scoring:** common 10 / uncommon 25 / rare 60 / koi 150 prize points.
  Personal best haul (free) and nightly best (daily) kept separately.
- **Prizes:** `TYPES` table + `drawPrizeShape` portraits (canvas, palette
  discipline, one function per critter). Add a critter = one table row + one
  portrait case.

**Test hook:** `window.MC` (state, pile, cab, surface(), setClaw(), drop(),
launch(), endRound(), settings) attaches only with `?mc_test=1` or
`localStorage.mc_test='1'`. It is a cheat surface; it never attaches unasked.

## 7. localStorage keys

All writes wrapped in try/catch; private mode degrades to a session-only game.

| key | shape | holds |
|---|---|---|
| `mc_best` | number string | best free-cabinet haul |
| `mc_daily_best` | number string | best nightly haul ever |
| `mc_daily` | `{date, haul, prizes}` | today's daily result; present and matching today = daily locked |
| `mc_stats` | `{rounds, drops, grabs, sheds, koi}` | lifetime counters (settings screen) |
| `mc_shelf` | `[{t, d, m}]` | the prize shelf: type, date won, mode. Newest first, capped 250. |
| `mc_moments` | `{win_date, rare_date, clear_date}` | earn-moment day gates |
| `mc_set` | `{sound, motion}` | settings; `motion` defaults 0 under `prefers-reduced-motion: reduce` |
| `sw_sb_moon-claw` | `{d, n}` | fleet sunbeam day-cap ledger |

"Clear my scores" removes bests, daily lock, and stats. It deliberately leaves
the prize shelf (a collection is not a score), the moment gates (no farming),
and settings.

## 8. What was verified, headless, at 375x667, real mouse input only

- Two full free rounds and a full daily round played to the summary screen
  with real press-hold-release input (never `el.click()`), including hauls of
  65, 95, and 150.
- **The golden koi won end to end**: found a koi cabinet, its glint visible
  through the pile, grabbed with a real hold and release, big celebration
  (banner, flash, burst, fanfare), koi on the shelf, `rare_prize` fired.
- A **loose grip shed its prize on the carry** organically in the final run
  (summary row "slipped on the carry"), and a clipped grab came up with the
  neighbor instead of the target. Both honest, both readable.
- Misfire guard: a sub-150ms tap does not spend a token.
- Daily cabinet byte-identical across reloads (positions compared at 2
  decimals). The same date seeds the same pile.
- Rendered touch targets: every menu button 51.4px tall, pause 51.4x51.4, all
  centres hit-test to themselves via `elementFromPoint`.
- `prefers-reduced-motion: reduce` defaults Extra motion off.
- Embed: ready + close postMessages, frame URL never changes.
- Every screen and overlay screenshotted and LOOKED AT; the padlock-sized
  claw, a duplicated marquee title, and a koi tail poking through the glass
  wall were all caught by looking and fixed.
- Zero console errors, zero page errors, zero failed requests on every path.

## 9. Known weak spots

- **The pile micro-settles a few px after boot** (persistent tiny overlaps
  keep the position solver nudging awake bodies). Layout, contents, and grabs
  are unaffected; two players' dailies are the same pile to the eye and to
  the claw. A strict pixel freeze would need an overlap-tolerant sleep.
- The synthesized audio (servo hum, slips, thunk, koi fanfare) has not been
  heard on a real device. Nothing plays before first gesture; the hum is a
  single oscillator started on hold and stopped on release/pause/hide.
- Prizes at the far left of the pile (resting against the chute divider, x
  under ~212) sit a few px left of the claw's rail end; they are still
  grabbable (the claw reaches within solid-grip range) but a player might try
  to centre perfectly and not manage it. Deliberate razor edge, worth a watch.
- Not yet tested on a physical phone, iOS Safari, or the Pi Browser.
- Leaving the daily early (pause > Leave the cabinet) spends the daily. The
  pause card shows tokens left, but a player could still feel ambushed;
  a confirm step on daily quits would be a kind addition.
