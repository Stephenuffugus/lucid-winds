# LOAF AUDIT — 2026-08-16

Target: `/workspaces/lucid-winds/loaf.html` (7802 lines, 360KB, single file).
Read first: `LOAF_PLAN.md` (product SSOT), `LOAF_3D_PLAN.md` (tech layer).
No browser available in this session. Everything below is either read out of the
source or proved by `loaf_check.mjs` (node, no deps), which runs the real script
block against a hand DOM shim. Nothing here was confirmed by eye. Nothing about
the synthesized voice is claimed; it has still never been heard.

---

## THE LIST (written before anything was changed)

Severity: **A** = breaks a hard product rule or loses a cat. **B** = the app
lies or strands the player. **C** = house rules / polish.

### A1. The PLAYED need can never recover in the live room
`pet.played` is restored in exactly one place: line 4151, inside the **2D
fallback** loop. Every play path in the 3D room (`bridge.played()`, laser,
yarn, pond, beans, tricks) grants XP and never touches `pet.played`.
So on the path everybody actually runs, the PLAYED bar decays to its floor and
stays pinned there, red, forever, no matter how much you play with her.
That is three things at once: a bar that lies, a state you cannot leave, and a
permanent visual accusation of neglect in an app whose first hard line is
"a reason to do something, never a punishment for being away."

### A2. Needs drain in minutes, so the normal session opens on three red bars
`NEEDS` drift at 0.9 / 1.4 / 0.7 points **per minute** with a floor of 8.
Full to floor takes 66 to 131 minutes. Nobody opens a cat app hourly, so the
default returning experience is three bars at 8 percent painted `#FF9E9E`.
The floor exists, so nothing dies. It still reads as "you neglected her" every
single time, which is the punishment the plan bans, delivered by colour.

### A3. Card 41 silently deletes the oldest cat
`Store.update` ends with `.slice(0, CONFIG.MAX_CARDS)` and `mint` prepends. At
41 cards the oldest record is dropped with no warning, no confirmation, no
message. "Nothing leaves" is a hard line and a card is a cat.

### A4. A corrupt save silently empties the collection
`Store.read` catches the JSON parse and returns `[]`. The next write persists
that empty list over the damaged one. One bad byte (a half-finished write on a
killed tab, a quota truncation) and every cat is gone, with the UI cheerfully
reporting "No cats logged yet." The corrupt payload is not preserved, so
recovery is impossible even by hand.

### B1. The 3D cat loses the race on a cold start, and the room stays flat
`Room.open` picks the 3D path only `if (window.LoafCat3D)`. `LoafCat3D` is
assigned at the very end of a module that first fetches three.js from a CDN and
then a 715KB GLB. Tap "The room" before that lands and you get the 2D
fallback for the rest of the session; the module never tells anyone it arrived.
In that state: no tricks (the panel says "This device draws her flat" — which
is a false statement about the device), and Laser, Pond and Beans are dead
buttons (`onUp` returns early for those three with no message at all).
So the most common cold-start interaction produces a degraded room and blames
the phone.

### B2. Store.update reports success after a failed write
The quota branch tries to free space by dropping photos; if that never
succeeds it says so and then `return next` anyway. Callers treat the returned
list as saved state.

### B3. `bakeMaps()` is wrapped in `try {} catch (e) {}`
If the position bake fails, `paintCoat` returns early forever and the cat
renders in the bare material — a plausible looking grey cat that is not the
owner's cat, with nothing logged. This is the exact "shows something plausible
when the real thing failed" pattern.

### C1. Touch targets under 48px
`.nav button` 44px (the two primary tabs), `#stageClips button` 44px,
`.chip2` 46px (every tuner chip), `.sw input[type=color]` 44px.

### C2. Dash characters in player facing copy
`<title>LOAF — Cat Field Unit</title>`, the tuner note ("confidently wrong —
a shadow can read as stripes"), the persona quiz header (`' — ' + q.t`), the
share sheet title (`name + ' — LOAF'`).
(The bare `—` glyphs used as empty-value placeholders on the card are
typography, not copy, and are left alone.)

### C3. Serial numbers repeat
`card.serial = list.length + 1`. Remove a card, scan another, and two cards
carry the same number.

---

## WHAT IS SOUND (checked, not assumed)

- **Nothing dies, gets sick or leaves.** No death, illness, runaway, decay or
  streak-break mechanic exists anywhere in the file. Needs have floors, tricks
  are explicitly permanent (`no forgetting, no rust`), "days together" only
  counts up, the ritual has no expiry and no penalty, a missed clicker press
  is explicitly unpunished ("She would not click you either").
- **Coat, never breed.** No inheritance anywhere; `paint()` even forces
  `coat only — never a breed` on old saved cards.
- **Read modify write is honest.** Every writer goes through
  `Store.update(list => …)` which re-reads from disk inside the call and merges
  by id; a `storage` event listener refreshes the other tab. Two tabs cannot
  clobber (proved in the harness).
- **The grader path handles the two traps** memory keeps warning about:
  `res.ok` is checked explicitly (fetch does not reject on 4xx/5xx) and
  `stop_reason === 'refusal'` is caught separately. Model output is clamped by
  `validate()` before it reaches the DOM.
- **The 3D failure ladder is right.** No WebGL, no GLB, or no morph mesh all
  return before `window.LoafCat3D` is assigned, so the app falls back to the 2D
  cat instead of showing an empty stage.
- **The trick state machine cannot hang.** `mark` closes itself after 0.9s
  (`winT`), `hold` after `HOLD_S`, `gap` advances on `pT > 0.8`. An unclicked
  session ends by itself and still pays.
- No service worker in this file, so no cache-purge risk.
- No emoji as assets: every icon is drawn (`toyIcon`).

---

## WHAT WAS CHANGED (this session)

Fixes, worst first:

1. **A1** — every play path now feeds `pet.played` through one new
   `playedNeed(n)` helper (laser, yarn, pond, beans, tricks, toy throws, the
   2D loop) and redraws the needs. Proved by the harness driving the real
   bridge object.
2. **A2** — drift rates moved from per-minute to a day scale (fed 0.12,
   played 0.18, litter 0.09 per minute) and the floor raised 8 → 45. A day
   away now lands her at the floor instead of an hour away. At the floor the
   bars read amber ("there is something you could do"), never red
   ("you failed"). Nothing else in the economy moved.
3. **A3** — `Store.update` no longer drops cards. Over the card cap it
   releases the oldest *photos* (the only large field) and says so; the
   records themselves are kept. A cat cannot leave the collection except by
   the owner pressing Remove.
4. **A4** — a save that will not parse is copied to `loaf.v1.rescue` before
   anything overwrites it, the owner is told in plain words, and any entries
   that survive the parse are still loaded (per-entry filter instead of
   all-or-nothing).
5. **B1** — the module dispatches `loaf:3dready` when `LoafCat3D` exists; the
   room listens and remounts her into 3D if the player got there first.
6. **B1b** — Laser, Pond and Beans in the 2D fallback now say what is
   happening instead of doing nothing silently, and the wording blames the
   loading, not the device.
7. **B2** — `Store.update` verifies the write by reading it back and returns
   what is actually on disk.
8. **B3** — a failed `bakeMaps` now tints the coat from the DNA base colour so
   she is at least her own colour, and the failure is recorded on `_dbg()`.
9. **C1** — 44/46px targets raised to 48px.
10. **C2** — dashes removed from the four player facing strings.
11. **C3** — serials now come from a high-water mark, never repeat.

Improvement (depth = more to notice, not more to manage):

12. **The homecoming line.** Opening the room used to say "She noticed you
    arrive." once a day. It now greets you with what she was doing while you
    were out, drawn from her persona axes and how long you were gone. It costs
    the player nothing, it is different most days, and it turns time away into
    something warm to read instead of a pile of poops to clear. Highest value
    per minute of build in the file: it is the one beat every single session
    passes through, and the app's whole thesis is that you come back.

---

## WHAT STILL WORRIES ME

- **Nothing here has been LOOKED at.** No browser in this session by
  instruction. Every claim above is source-level or node-level. The room, the
  coat painter, the 3D cat, the homecoming line and the new needs colours all
  need one pass with human eyes at 375x667 and at desktop width before anyone
  calls them done. The house rule exists because twelve green gates once
  shipped a see-through floor.
- **The synthesized voice has still never been heard.** `meow()` and `purr()`
  build their buffers in code and nobody has listened. Do not ship on the
  assumption that they sound like a cat.
- **The 2D fallback is a second, weaker game.** Tricks, laser, pond and beans
  only exist in 3D. B1b makes the fallback honest, it does not make it good.
  If the GLB fails on a real phone the player gets a much smaller app. Worth a
  decision: either build the four missing verbs flat, or make the 3D path a
  hard requirement with an honest loading screen.
- **`assets/loaf/cat.pack.glb` is 715KB** against the plan's own <400KB target,
  and it is fetched before the room can be 3D. That is the whole reason B1
  exists. Decimation is a real task, not a nit.
- **`MAX_CARDS` still caps photos at 40 cats.** Multi-cat households are meant
  to be free; a hoarder will eventually see old photos released. It now tells
  them, which is the honest floor, but the real fix is IndexedDB for photos.
- **Serial repair is forward-only.** Cards already saved with duplicate serials
  keep them; renumbering old cards would change a card the owner already has,
  which is worse.
