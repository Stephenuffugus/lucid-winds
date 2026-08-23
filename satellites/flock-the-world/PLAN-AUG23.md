# FLOCK THE WORLD — PLAY-WELL PLAN (2026-08-23)

Written by Fable from Stephen's and Penny's notes. This is the design SSOT for the
Google Play push. `HANDOFF.md` stays the engine SSOT. Build tasks at the bottom are
written for Opus, one per session, and they come BEFORE anything in
`HANDOFF-OPUS-AUG23.md`.

## The diagnosis (Penny, via Stephen)

Plague Inc lets you NAME your thing and shows the world's population actually
dwindling, in people: Infected 2,104,331 / Dead 811,402. FTW shows a meter at 61%.
A meter is a dashboard. A number that is made of people is a story. Everything the
engine needs to tell that story already exists: 14 regions with populations in
millions (world = 7,845M) and per region `coverage`, `control`, `resist`, `unrest`,
`pstate`, `lost`. It is computed every tick and never shown as people.

Stephen, on top: everything that pops up and every sound needs an overhaul. Today
there are ZERO sounds in the file and ZERO images. So "overhaul" means "build."

## 1. THE POPULATION LEDGER (the Plague Inc numbers)

Six totals, all in people (`pop` is millions, so ×1,000,000), recomputed in the same
pass that computes `s.subj` (index.html ~line 1061):

| Key | Formula | Player word | Meaning |
|---|---|---|---|
| `popWatched` | Σ pop × coverage | WATCHED | inside your frame |
| `popCompliant` | Σ pop × control | COMPLIANT | stopped noticing (= Subjugation %) |
| `popOrganized` | Σ pop × resist/100 | ORGANIZED | know what you are and are doing something |
| `popStreets` | Σ pop where pstate ∈ peaceful/violent/uprising | IN THE STREETS | |
| `popExpelled` | Σ pop where lost | EXPELLED YOU | |
| `popFree` | WORLD_POP − popWatched | NEVER WATCHED | **the number that dwindles** |

Identity that must hold every tick: `popWatched + popFree == WORLD_POP`.
COMPLIANT can legitimately exceed WATCHED in some states (control vs coverage are
separate curves); report it in check.js, do not assert it.

### Where the numbers live
1. **HUD headline** (one line under the two bars): `WATCHED 1,204,331,117`, an
   odometer that rolls toward the true value (ease 600 ms, thousands separators,
   never jumps, max 10 DOM writes/s). Tap it: opens the Ledger sheet. This is the
   Plague Inc infected counter. In the landscape single-row HUD it sits right of the
   bars; in portrait it gets its own row.
2. **Ledger sheet** (new sheet tab, first in the tab row): the six totals, each with
   a world-share bar and a per-day delta (`+2.1M/day`, computed over the last 10
   ticks). Below, every region as a row: name, `312M of 380M watched (82%)`,
   compliant, organized, state badge. Sorted by watched, descending.
3. **Map tap popover** (roadmap item, now required): tap a region on the map and a
   small card anchors near the tap: region name, the three people numbers, state,
   and the region's action buttons (Enter/Agitate/Crackdown/Blackout/Concede) with
   live prices. This is how Plague Inc plays: you poke the map, not a menu. Dismiss
   on tap-outside or drag. Does NOT pause the sim.
4. **Milestones** fire a BREAKING banner (gold) + SFX + HQ map ping: WATCHED crosses
   10M, 100M, 500M, 1B, 2B, 4B; NEVER WATCHED falls under 1B; "half the world".
5. **End screen** gets the people: watched, compliant, organized at peak, expelled,
   and the line `N people were never asked.`

## 2. NAME YOUR VENDOR

- Pick screen, above the Deploy button: label `Name your vendor`, text input, max 24
  chars, placeholder pre-filled from `VENDOR_NAMES` (invented, never a real company:
  Halcyon Civic Systems, Meridian Sightline, Northlight Assurance, Paladin Grid,
  Vantage Municipal, Lumen Watch, Clearfield Analytics, Sentry Commons). Persist in
  `localStorage.ftw_co`. Stored on `S.co`. Escape on output, always textContent or
  an escape helper, never raw innerHTML of user text.
- Used by a `CO()` helper in: the HQ marker label; headline templates that say
  "Vendor" or "the platform" (`H.concede`, `H.lost`, `H.adopt`); the AMBIENT lines
  that say "Vendor"; milestone banners (`Halcyon Civic Systems passes one billion
  watched`); `endText`; the share string; the menu (`Welcome back, Halcyon`).

## 3. NOTIFICATIONS: one system, four tiers

Today: breakingBanner, shToast, flashCash, flashCur, showEvent modal, doctrine modal,
guide, marquee wire, map pings, all independent. Replace with one queue:

| Tier | Surface | Rules |
|---|---|---|
| 0 WIRE | marquee ticker | ambient only, never interrupts |
| 1 TOAST | bottom-left stack | ≤3 visible, 2.4 s, duplicates coalesce to `×2`, icon + SFX class, never covers HUD or action buttons |
| 2 BREAKING | banner | crit only; gold = your milestones, red = losses; 5 s; one at a time, queued |
| 3 MODAL | event / doctrine | pauses; never two; defers tier 2 until closed |

Every spend still answers back (toast + cash flash). Every region state change is a
tier-1 toast with the region badge. Region lost, uprising, synergy found, milestone =
tier 2. Step 1 of the build is a contact sheet of every popup as it is today, LOOKED
at, before a line changes.

## 4. SOUND (Stephen produces, Opus wires)

No audio exists. Stephen is the producer; this is the cue sheet. **Suno (Pro, $10)
is the right tool for the musical cues**: theme_menu, bed_hq, bed_tension, win,
loss_refusal, loss_coalition, concede (the jingle), breaking (the news sting),
synergy, milestone. Paid-plan Suno grants commercial use for songs made while
subscribed, which a $1 app needs; confirm the current terms before launch. The
short one-shots (taps, buys, stamps, matches, crowd steps) come from the DAW or
recorded; Suno makes songs, not clicks. Deliver as mono
`.mp3` 96k (UI ≤ 0.6 s, stings ≤ 3 s, loops seamless) into
`satellites/flock-the-world/sfx/<id>.mp3`. Wiring: `sfx(id)` with a per-id cooldown,
three volume groups (ui / world / bed), mute toggle persisted, first-gesture unlock
for iOS, and a silent stub that logs `sfx:<id>` so wiring can be gated before files.

| id | trigger | character |
|---|---|---|
| ui_tap | any button | dry click, tiny |
| ui_open / ui_close | sheet open / close | soft panel slide |
| buy_small / buy_large | node under / over 20 influence | cash-register thunk; larger = deeper |
| cant_afford | disabled tap | dull buzz |
| synergy | secret combo found | gold sting, 2 s |
| bubble_cash / bubble_inf | bubble tapped | coin ping / glass ping |
| spend | region action paid | paper-and-coin swish |
| region_join | region signs | stamp |
| region_full | 100% instrumented | low gong + stamp |
| murmur / peaceful / violent / uprising | protest state up | crowd bed rises in 4 steps |
| region_lost | expelled | poles falling, crowd cheer (the player LOST, it should feel like it) |
| crackdown / crackdown_fail | action | armored rumble / units refuse (silence then crowd) |
| blackout | action | broadcast cut, hum |
| agitate | action | match strike |
| concede | action | PR jingle, insincere |
| breaking | tier-2 banner | news sting |
| milestone | ledger milestone | sodium-lamp power-up hum, 1.5 s |
| doctrine | doctrine chosen | boardroom chord |
| event_open | modal | folder opens |
| win / loss_refusal / loss_coalition | end | 8 s each |
| theme_menu | menu loop, 60 to 90 s | confident corporate-brochure synth, the vendor's hold music, slightly wrong |
| bed_hq | loop | server-room hum, always |
| bed_tension | loop | fades in as Patriotism > 70 |

## 5. ART

Pack: `art-asset-lists/flock-the-world/` (direction + 10 sheets), also delivered as
Docs in 012Assets. Look: **Procurement Brochure** (the glossy vendor pitch-deck
style, selling dystopia with a smile). Trees first, that is Stephen's named ask. Cut
by connected components, never an even grid. Every drop gets an ART-LEDGER row the
moment it lands. Art is generated; never described as hand-painted.

## 6. GOOGLE PLAY PACKAGING (last, and only after 1 to 5 play well on a phone)

Needs: `manifest.webmanifest` (name Flock the World, short FTW, standalone,
landscape, theme #05070b, 192 + 512 maskable icons), a service worker (versioned
cache name `ftw-v1`, network-first with a 3 s timeout fallback, cleans ONLY its own
`ftw-` prefix), `/.well-known/assetlinks.json` with the TWA signing cert, a
Bubblewrap build → AAB, listing: 512 icon, 1024x500 feature graphic, 4+ landscape
screenshots, short + full description, privacy policy URL (no data collected,
localStorage only), content rating questionnaire (satire, expect Teen), price $1.
No tip jar, no external payment link (Play Billing rule). Org account, no tester
gate.

---

# BUILD TASKS FOR OPUS (FTW track, one per fresh session, before HANDOFF-OPUS Tasks 3b+)

Rules from `HANDOFF-OPUS-AUG23.md` apply: named files only, STEP BOX, DONE command,
`FOUND:` for everything else, never `x | tail`. Screenshots: **915x412 landscape**
(the intended phone orientation) AND 412x915 portrait, dsf2, touch on, fab hidden,
and you OPEN them. Gate: `cd satellites/flock-the-world && node check.js` (57 checks
today; each task adds its own and you watch the new check FAIL once before it passes).
Bump the portal card `?v=` on every deploy. STATUS goes in `HANDOFF-OPUS-AUG23.md`.

## F1 — Ledger totals + HUD odometer + Ledger sheet
ANCHORS (index.html, today's line numbers, grep the strings if they moved):
`function tick(){` 897 · totals go right after `s.subj=subj/WORLD_POP` 1061 ·
HUD markup 355-368 (`#vSub`, `#vOvr` are the two bars; the odometer goes under
them) · tab bar `.nb[data-tab]` 383-388 (add `data-tab="led"` FIRST, before dep) ·
`function openSheet(tab)` 1617 builds `#shBody` per tab, add the `led` branch there ·
end stats `$('endStats').innerHTML` 1164 · `WORLD_POP` 486 · `REGIONS[].pop` is millions.
check.js: `ok(name,cond,detail)` + `group(n)`, runs the real script in a vm with a
DOM stub; `FTW_SELFTEST=1` runs the mutation harness, use it to watch your new
checks fail.
FILES: `satellites/flock-the-world/index.html`, `check.js`, `portal/index.html` (v bump). STEP BOX 5.
1. Compute the six totals in the tick pass. 2. HUD odometer. 3. Ledger sheet tab with
totals + region rows. 4. End-screen people lines. 5. check.js: identity
`popWatched+popFree==WORLD_POP` every tick of a 2,000-day balanced bot run; odometer
never displays a non-integer; Ledger sheet renders 14 rows.
DONE: check.js exit 0 with ≥3 new checks, both screenshots opened and three
observations written, live probe of new `?v=` shows the string `WATCHED`.

## F2 — Map tap popover
ANCHORS: `function regionAtPoint(wx,wy)` 1335 is the hit test · the map's
`pointerup` handler is registered at 1414 (`surface.addEventListener('pointerup',up)`);
inside `up`, after the bubble check (`collectAt` ~1957) and only when the pointer did
not drag, call `regionAtPoint` and open the popover · the World tab's action
buttons use `data-act="enter|agitate|crack|blackout|concede"`, reuse their handler.
FILES: `index.html`, `check.js`. STEP BOX 4.
Tap region → card with people numbers + the action buttons wired to the SAME
handlers the World tab uses (no duplicated logic). Drag does not open it. Tap
outside closes. Sim keeps running. check.js: popover opens for every region id,
each action button's price equals the World tab's price.
DONE: check.js exit 0, landscape screenshot with popover open on East Asia, opened
and read.

## F3 — Name your vendor
ANCHORS: pick screen `#pickFoot` 347, `#pickInfo` 348, `#beginBtn` 349 (input goes
above the button) · HQ label `S.hqName===c.n` 1974 · `const H={` 678 templates ·
`const AMBIENT=[` ~660 · `S.mode` / `S.hqName` are set where Deploy is confirmed.
FILES: `index.html`, `check.js`. STEP BOX 3.
Input, persistence, `CO()`, the listed call sites. check.js: a name containing
`<b>` renders as text in the HQ label and in a headline (escape test); default
name is drawn from VENDOR_NAMES; `S.co` survives reload.
DONE: check.js exit 0, screenshot of a headline carrying the name.

## F4 — Notification system
FILES: `index.html`, `check.js`, `portal-assets/review/ftw-popups-aug23/` (shots). STEP BOX 5.
Step 1 is a contact sheet of EVERY current popup surface (breaking, toast, cash
flash, event modal, doctrine modal, guide, region lost), opened and read, committed
BEFORE any change. Then the four-tier queue. check.js: never two modals; a tier-2
banner queued during a modal fires after close; 4 identical toasts in 1 s render as
one with `×4`; toast rect never intersects HUD rect or action-button rects.
DONE: check.js exit 0, before/after contact sheets committed.

## F5 — SFX module + wiring (files optional)
FILES: `index.html`, `check.js`, `sfx/` (if files exist). STEP BOX 3.
`sfx(id)` per the cue sheet, silent stub logging `sfx:<id>` when a file is absent.
check.js: every cue id in the sheet is fired at least once by the balanced bot run
(read the log), mute persists, no `sfx:` fires before first gesture.
DONE: check.js exit 0.

## F6 — Art wiring, one sheet per session as drops land
FILES: `index.html`, `satellites/flock-the-world/art/`, `art-asset-lists/ART-LEDGER.md`, cutting script. STEP BOX 4 per sheet.
Ledger row first. Cut by components (`scripts/cut_jimothy2.py` methods), LOOK at
every cut on a contact sheet at REAL render size (node icons at 44 px) with a black
column. Wire. Before/after screenshots. `?v=` bump.
DONE per sheet: ledger row says WIRED with the commit, contact sheet committed.

## F7 — Play packaging
FILES: `satellites/flock-the-world/{manifest.webmanifest,sw.js,icons/}`, `.well-known/assetlinks.json`, `store/ftw-play/`. STEP BOX 5.
Per section 6. Gates: `node scripts/sw_cache_scope_check.mjs` clean, Lighthouse
installable, a real install on Stephen's phone. Stephen signs and uploads; the
keystore never enters the repo.
DONE: AAB built, listing assets in `store/ftw-play/`, checklist file with every
Play Console field filled in text.
