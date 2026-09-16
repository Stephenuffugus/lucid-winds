# HANDOFF FOR FABLE, 2026-09-16, written by Opus

Stephen, this morning: *"i want fable to look at why stuff is broken."*

This is that list. It is written so you can start on the worst one without re-deriving anything. Every claim below has a
measurement under it or is marked as a guess.

---

## 0. THE HEADLINE: THE WORST THING IS NOT IN THE REPO

**The host's CDN punishes a visitor's IP address, and that is what "stuff is broken" has meant for two days.** It does it in
two different moods, which is why it kept being misdiagnosed:

| mood | what the visitor sees | proof |
|---|---|---|
| **429 lockout** (Sep 15) | Empty 429 bodies with no MIME type, so scripts are refused and every later page dies with `net::ERR_INVALID_RESPONSE`. Lasts minutes, per IP. | One fresh load of Jimothy = **143 requests**; the edge served 33 and 429'd **109**. |
| **Tarpit** (Sep 16) | Every request answers **200** but the first byte takes **19.7 seconds**, the *identical* 19.7 s on the site root, the arcade and every game. Headless Chrome hangs past 60 s; a page of a dozen subresources can never finish. | `x-hcdn-upstream-rt: 0.004` — Hostinger's origin answered its own CDN in **four milliseconds**. All nineteen seconds are added in front of the origin. WebFetch, from a different address, fetched the same page promptly. |

⛔ **This is why three separate passes last night wrote "the site is returning 522" and "the whole site is down". It was not.**
The box doing the probing was the thing being shut out. **Before you write that anything is down, check
`time_starttransfer`, check `x-hcdn-upstream-rt`, and fetch once from a second egress.** A fixed, identical delay across
unrelated paths is a rule, not load.

**Nothing in this repo can fix it.** It is hPanel, lucidwinds.com, Performance, CDN: rate limiting / DDoS / bot protection.
It is Stephen's, he has been told twice, and it is the single highest-value thing he can do. Until then a tester who opens
game after game locks their own phone out, which is exactly what happened in front of his tester.

**What the repo already does about it** (built Sep 15, deployed): the root `sw.js` caches only ok pages and answers a 429 or
5xx from a good saved copy, never from a saved 429; `play/sw.js` and `satellites/stream-hop/sw.js` do the same; Jimothy's
`IMG()` retries a failed image six times over about two minutes. Gate: `node test/sw-lockout.mjs` (25 laws, plants red).
**That only helps a repeat visitor. A first-time visitor during a lockout still gets nothing.**

---

## 1. JIMOTHY TRIPS THE LIMIT BY ITSELF — the one repo-side fix that would matter most

One first visit to `/satellites/stream-hop/` makes **143 requests** (sprites, powers, fx, menu glyphs), which is enough to
trip the edge on its own. That is why Jimothy "is just not working on the arcade" *and* why the arcade fails for minutes
afterwards: Jimothy locks the visitor out, then everything else looks broken.

**The fix is packing those sprites into sheets.** It is real work, it is not started, and it is the highest-leverage thing
in this repo. Jimothy releases on **Friday Sep 18**, so this has a deadline attached to it.

## 2. `portalPing` has no CORS header

Reproduced again this morning on a local portal load: `Access to fetch at
'https://us-central1-focus-grove-fffa8.cloudfunctions.net/portalPing?src=new-direct' ... blocked by CORS policy`, followed
by `net::ERR_FAILED`. It is in `functions/portalTraffic.js`. Two console errors on every single portal load, and the traffic
numbers it exists to collect are presumably not arriving. Small fix, never done.

## 3. The home page HTML is 7.1 MB

Not the cause of a 429 on its own, but it is the biggest single document the studio serves and it is the first thing a
stranger downloads.

---

## 4. WHAT IS NOT BROKEN, so you do not spend a morning on it

- **The nine math games are fine.** All nine serve 200 on both page and worker, each carrying its own stamp, and I diffed
  the served bytes against the tree rather than trusting a status code. Lane C's gates are green and its plants are red.
- **The deploys are intact.** Every lane C push had its parent verified as exactly `origin/main` first.
- **The arcade rows I added this morning work** (see section 5).

---

## 5. WHAT I CHANGED THIS MORNING, so we do not collide

⛔ **I wrote portal rows, which the Sep 15 handoff reserves to you** (`No portal rows (Fable's)`). Stephen asked for it
directly: *"put them in development in the studio."* Flagging it rather than letting you find it in a diff.

`portal/index.html`: nine new `FEATURED` entries (Span, Yonder, Crease, Brim, Glimpse, Notch, Hush, Tint, Gauge), all
`beta:true` so they carry the IN DEVELOPMENT badge, all `cat:"math"`, each pointing at its own stamp. Plus nine `VIBES`
entries so a vibe filter does not silently drop them. Descriptions are Stephen's own one-line premises from
`assets/math-catalog/*-handoff.md`.

**No `thumb` field on any of the nine, deliberately** — there is no card art, and a thumb pointing at a missing file is a
broken image on the shelf; `card()` falls back to the `ic` glyph when `thumb` is absent.

**I looked at it at 412 and it is honestly not good.** Beside Gerplunk, Glyph Forge, Inkswing, Keepsies and LOAF, which all
carry full-bleed painted art, a small emoji floating in an empty black rectangle reads as a hole in the shelf rather than as
a new game. `📄` and `🌌` are nearly invisible on the dark card; `🦌` and `🔬` survive. **Nine pieces of card art is the fix
and it is Stephen's to commission.** Do not let me have quietly set the bar at "emoji is fine".

---

## 6. THE SIX FLEET-WIDE CALLS THE SHOT SWEEP SURFACED (his taste, not bugs)

About 110 shots were opened across the seven new games at 320, 375, 412 and 1366, three faults named in each, all written
into `plans/<game>/HANDOFF-<GAME>.md`. These repeated everywhere and each needs one decision:

1. **Wordless screens.** Four of seven games have doors with no words on them, and BRIM's ask lives on the door and never on
   the screen where the choosing happens, where the glasses also carry nothing marking them as pressable.
2. **One mark doing two jobs.** Reveals mark the child's choice and the true answer identically almost everywhere. NOTCH's
   find reveal and GAUGE's compare reveal already do it right: fill for truth, outline for choice.
3. **TINT's mixer averages dye against white in linear light**, washing every recipe toward grey, in a colour game.
4. **The corner disease.** The first earned thing sits in the top-left of an empty board in five games.
5. **CORE's settings gear sits 8 px from the right edge**, fleet-wide.
6. **NOTCH shows the browser's blue focus ring** on five screens.

⛔ **One finding from that sweep is WITHDRAWN and you should not act on it.** Three BRIM shots led with "both glasses are
drawn EMPTY under labels reading one eighth and seven eighths, so a child reading the picture learns the wrong thing".
It is wrong. Matching asks `Which is fuller`; the child judges from the two fractions and the water rises **at the reveal**
to prove it (`render.js:4`, the water is not drawn until `fillTo`, which main.js calls only from the reveal's frames;
`render.js:39` fills LEVEL's glass instead, because there the level is given rather than judged). Filling those glasses
would hand the child the answer. The lesson is in `plans/brim/HANDOFF-BRIM.md`: a shot names what is on the screen, but
calling it a fault is a claim about intent, and intent lives in the code.

---

## 7. WHERE THE RECORD IS

- `HANDOFF-OPUS-SEP15.md` section 10, newest first, is the running report.
- `RESUME-OPUS-SEP16.md` is the night's state, corrected at the bottom.
- `plans/<game>/HANDOFF-<GAME>.md` section 13 per game: every red, its cause, its fix, every plant and every shot fault.
- Memory: `project_cdn_429_lockout_sep15` (both moods of the CDN rule and how to tell them apart),
  `project_lane_c_math_progress_sep16`.
- **The math catalog is nine of ten. `CAIRN` (`assets/math-catalog/06-CAIRN-handoff.md`) was never built.**
