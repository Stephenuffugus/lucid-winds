# AURA FARM — audit + repair pass, 2026-08-16

Audited by reading all 2593 lines of `index.html`, the portal's real click
router, and the studio rules that apply to a shipped satellite. Verification is
`test/logic.mjs` (node, no browser). Every assertion in it was watched RED
against the pre-fix source before being trusted green.

---

## PART 1 — THE AUDIT (written before any edit)

### Does the core loop work start to finish?

Yes. Title, new run, tap a soul, push their mood with Hype or Snide, watch
charge climb, harvest inside the peak window, meet the quota by dusk, dusk
report, morning letter, next day; fourteen days to an ending, then Endless
Dusk. I traced every branch and it closes. The loop is genuinely good: the
peak window is a real timing skill, Radiance vs Blight is a real economic
choice with a real cost, and the venue bloom gate paces the six venues out
over a run. Nothing below should read as "this game is broken." It is a
shipped, working game with a short list of sharp edges.

### Blockers (a player hits these)

**B1. There is no way out of the game.** `SWS_FRAMED` is computed as
`window.parent !== window`, and the exit button on the title screen renders
only when that is true. The portal's click router (portal/index.html ~2226)
reads `if(!playM && !isSat) return;` — it frames only `/play/<id>.html` and
`stephenuffugus.github.io` urls. Aura Farm ships as `/satellites/aura-farm/`,
so the portal **navigates top level** and `window.parent === window`. The exit
button has therefore never once appeared for a real player. The only way back
to the arcade is the browser back button. Confirmed against the live portal
source, and it matches the fleet rule already in memory ("exits must key off
`document.referrer`").

**B2. A corrupt save is a dead end on the title screen.** `loadRun()` only
guards against a JSON parse throw. Any value that parses (a string, a number,
`{}` from a truncated write) is truthy, so the title screen offers "Continue
Run", and `migrateRun` then throws on `r.zones[v.id]` / `r.npcs[d.id]`. The
exception escapes the onclick, so the button does nothing, forever, with no
error shown. The player cannot start a run without knowing to clear site data.
`meta` is worse: `Object.assign` merges any parsed shape, and a null
`meta.known` or a non array `meta.endings` throws inside `known()` and
`ending()` respectively.

**B3. Quitting on the ending screen and continuing replays the ending.** The
run is saved by `pagehide` with `dayT <= 0` while the dusk or ending modal is
up. On reload, "Continue Run" resumes at `dayT <= 0`, `update` immediately
calls `endDay()` again, and on day 14 that means a second `ending()`: a second
`repRecordRun` entry, a second `mile('finish')`, a second 8 Sunbeam award, and
a duplicated day in the history graph. Repeatable indefinitely.

**B4. Two tabs clobber the whole meta save.** `saveMeta()` writes the boot time
in memory object wholesale. Two tabs open, and the second write erases the
first tab's specimens, relics, milestones, known traits, Mara shoo count, rep
history, and best Endless depth. This violates the studio's read modify write
rule directly: counters must ADD, bests must MAX, sets must union.

**B5. Touch targets under 48px.** Measured as rendered px at 375x667:
`.mbtn` (contracts, shop, case, map, sound, pause) is 44px; the contract
progress `.cpill` is about 19px and is a click target that opens contracts;
`.buyBtn` in the shop is about 34px; `.big` modal buttons come to about 46px.
Only `.abtn` (50px) and `.act` (about 49px, two lines) pass.

**B6. Dashes throughout the player copy.** 55 player facing strings contain an
em dash, in a game whose prose is the reason to remember it. Hard studio rule,
and the main loop's fleet audit named this game the worst offender.

### Real but smaller

**S1. The day announcement is silently eaten.** `announceDay()` fires up to
five toasts in one tick and `toast()` keeps only three, so on any day with
weather plus a venue event the quota line and the weather line are destroyed
before a frame is drawn.

**S2. The harvest button lies about the payout.** `refreshHarvestBtn`
multiplies by tier, sign, zone and rare essence, but omits the combo
multiplier (up to 1.4x) and the Deep Well trait (1.2x). At a x5 combo on a
Deep Well soul the button reads 40% low, which is exactly when the player is
deciding whether to hold the chain.

**S3. `meta.rep` is recorded only on a completed fourteen day run.** A player
who dies on day nine twenty times has `rep.runs.length === 0` forever, so the
whole reputation system is invisible to anyone still learning the game.

**S4. Glean is the most focus efficient action in the game by 5x.** 20 + day
essence for 5 focus, no cooldown and no timing, against roughly 94 focus for a
full Radiance harvest. It is self limiting (one glean per husk, and husks are
finite), so it is not run breaking, but it does mean the optimal Endless line
is "drain everything, then tap the bones."

**S5. Cooldowns are not persisted**, so a reload clears every action cooldown.
Irrelevant in practice, noted for completeness.

**S6. Milestones pay nothing.** Ten of them, all wired and all cosmetic.

### The Broker reputation system: does it change anything the player can feel?

Almost nothing, and this was the most disappointing thing in the read.
`meta.rep` drives exactly three surfaces:

1. a line of text on the title screen,
2. which of four greetings the day 2 letter opens with,
3. `tributePrice()`, which returns 90 / 120 / 150.

Surface 3 is the only mechanical consequence in the entire system, and it is
gated behind a 45% daily roll, from day 5, that then has to pick the tribute
option out of two or three. A returning Luminary can play an entire second run
and never once encounter the only number their reputation controls. It is
written as if it were a system and it behaves like a flavour string.

### Does save and load survive a reload and a corrupt save?

Reload: yes for a mid day run, no for the states in B3. Corrupt: no, see B2.

---

## PART 2 — WHAT I CHANGED

Worst first. Every change verified by `node test/logic.mjs`.

1. **B1 exit.** Replaced the framed only check with the canonical fleet block:
   framed posts `{sws:'close'}`, unframed goes back through `document.referrer`
   when the referrer is the portal and there is history, otherwise
   `location.replace` to the portal. The button now renders in both cases, so
   the top level navigation that production actually uses has a way home. The
   `{sws:'ready'}` handshake at parse time and on load is untouched.

2. **B2 corrupt saves.** Added `sanitizeMeta()` and `validRun()`. Meta is
   coerced field by field to the right type on load. A stored run must be a
   plain object carrying `npcs`, `zones`, `unlocked` and a numeric `day` before
   the title screen will offer to continue it; anything else is dropped with a
   toast rather than throwing. `migrateRun` now rebuilds missing containers
   instead of dereferencing them.

3. **B3 replayed endings.** A run is no longer persisted once the day clock has
   run out: `saveRun()` refuses to write a run with `dayT <= 0` or in a
   finished mode, and `startGame(false)` clamps a restored `dayT` to at least
   three seconds. `ending()` is additionally guarded by a `run.ended` flag so
   it cannot record a second result for the same run.

4. **B4 two tab clobber.** `saveMeta()` is now read modify write. It re reads
   the stored copy and merges: `case` takes the higher charge per soul,
   `known` / `mile` / `relics` / `endings` union, `bestEndless` and
   `bestPurity` take MAX, `maraShoos` and `rep.failed` ADD their session
   deltas rather than overwriting an absolute, and `rep.runs` merges by a
   per run stamp so neither tab loses a finished run.

5. **B5 touch targets.** `.mbtn` 44 to 48, `.cpill` to a 48px min height with
   the label centred, `.buyBtn` to 48, `.big` to a 48px min height. Asserted in
   the test by computing rendered height from the declared CSS.

   That fix caused a regression, which the test then caught: taller contract
   pills grow `#hudRow3` from 21px to 48px, pushing the HUD to 124px while
   `playTop()` was still a hardcoded 120, so souls would have rendered behind
   the pills. `playTop()` is now 150, restoring the ~26px of clearance the old
   layout had, and three assertions pin the relationship (HUD height derived
   from the CSS, a usable play band at 375x667, and every soul placed inside
   it) so the next person to touch either number is told immediately.

6. **B6 dashes.** All 55 player facing em dashes rewritten. Sentences were
   recast rather than having the character swapped for a comma; several wanted
   to be two sentences and are now two sentences. No filler exclamation marks
   were found. The test fails on any dash character inside a player facing
   string.

7. **S1** the toast rail now holds five, so a day with weather plus a venue
   event no longer destroys its own quota line before a frame is drawn.
   **S2** the harvest estimate moved into `harvestEstimate()`, shared with
   `harvest()`, so the button now includes the combo multiplier and Deep Well
   and cannot drift from the payout again.

---

## HOW TO VERIFY

```
node test/logic.mjs        # 92 assertions, source rules + game logic
node test/playthrough.mjs  # 7 assertions, a bot plays a whole season
```

`test/harness.mjs` boots the **real** game script inside a node vm behind a
hand rolled DOM and canvas shim, so what is under test is the shipped logic and
not a copy of it. The game's top level `const`/`let` are script scoped exactly
as in a browser; the harness reaches them by appending an accessor epilogue to
the same script, which keeps every test hook out of `index.html`.

Both suites were watched RED first. The 34 real failures on the pre-fix source
are the finding list above, one assertion each. The playthrough bot was
additionally checked against two deliberate sabotages: an impossible quota
(bot correctly withers) and peak windows disabled (bot correctly starves and
the run collapses). A probe that cannot fail is not evidence.

Current state: **92 + 7 assertions green**, both script blocks parse clean,
zero `Math.random` left in logic, zero dashes in player copy, no service
worker in this game so the cache purge rule does not apply.

---

## PART 3 — WHAT I IMPROVED, AND WHY THAT

I picked **making Broker reputation a system you can feel** over adding new
content, because the game already has six venues, 68 souls, twelve traits,
eight relics, five weathers and fourteen venue events. It is not short of
content; it is short of consequence for the thing it keeps telling you it is
tracking. A returning player is the player worth investing in, and right now
the game greets them warmly and then behaves identically. More content in the
existing systems beats a new system, so nothing new was invented: reputation
now steers numbers and content that already exist.

**The Standing.** Reputation is now a live, visible standing that reaches the
run:

- **Mara prices you.** Tribute already varied by lean; now her siphon rate does
  too. A Reaper is a colleague and she takes less; a Luminary is a mark and she
  takes more. This is the single most felt number in the mid run.
- **The Broker opens your ledger.** Standing sets your starting essence for the
  run (a returning harvester of any lean starts with seed money, scaled by how
  many runs they have finished), so a second run starts with a real decision at
  the shop instead of an empty wallet.
- **Contract pools lean with you.** A Luminary sees more Radiance and Hope
  orders; a Reaper sees more Blight and Dread orders; the Gray Broker keeps the
  full pool. Same contract generator, weighted by who you have been.
- **The standing is visible during the run**, not only on the title, and the
  pause screen states plainly what it is currently doing to you.
- **Failed runs count.** `repRecordRun` now also fires on a withered run, so a
  player who has never survived fourteen days still has a history the letters
  and prices can read.

Concretely, `repStanding()` is the one place that turns history into numbers:

| Standing | Mara's siphon | Seed money | Contract board |
|---|---|---|---|
| Reaper | 0.80x, a colleague | 60 per season, to 300 | runs dark |
| Gray Broker | 1.00x, unreadable | 60 per season, to 300 | stays mixed |
| Luminary | 1.25x, a soft mark | 60 per season, to 300 | runs bright |

Depth is capped at five remembered seasons so a veteran is respected rather
than ushered past the game, and the pause screen now states in plain words what
your standing is currently doing to you, so none of it is invisible.

**Seedable RNG.** `rnd`, `pick` and a new `chance(p)` route through one xorshift32
seeded from `Date.now()` at boot, so gameplay variety is unchanged, but the
suite can seed it and assert on `rollDay`, contract generation and letter
selection deterministically. All sixteen `Math.random()` calls are gone.

---

## PART 4 — WHAT STILL WORRIES ME

- **I could not look at it.** No browser was available in this pass (ten agents
  on a two core box, the main loop owns browser work). Everything here is
  proved from source and from node. The CSS touch target fix is arithmetic on
  declared values, not a measured screenshot, and the studio rule is explicit
  that a green test is not a look. Somebody should shoot this at 375x667 and at
  desktop width before it is called done.
- **Glean's focus efficiency (S4) is untouched.** Changing it is an economy
  decision, and the numbers here are the Director's call, not mine.
- **Blight's 1.6x against a finite roster** means a reaper run is on a timer
  the game never states. That reads as intentional, but a first time reaper
  discovers it by running out of people.
- **The vendored copy is now ahead of `Stephenuffugus/aura-farm`.** The portal
  comment says edit upstream and re vendor byte identical. These fixes were
  made in the vendored file because that is the sandbox I was given. They need
  to be carried upstream, and the portal card's `?v=` stamp must be bumped on
  deploy or the host serves the old file.
- **Two tabs still clobber the run save** (not the meta save). A run is one
  coherent object and last write wins is the only sane merge for it, but a
  player with two tabs open will lose one run.
