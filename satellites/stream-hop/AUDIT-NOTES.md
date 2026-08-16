# JIMOTHY (stream-hop) — audit, 2026-08-16

Run the gate: `node test/jimothy-check.js` (no browser, no network, about a
second). 40 assertions. Every one watched RED first, and the four that matter
most were re-sabotaged after the fixes to confirm they still bite.

This is a **static** gate: it compiles every inline script block and then
asserts the invariants this file's own ⛔ comments claim but that nothing was
enforcing. It would have caught all three of this audit's high severity finds.
It cannot catch anything that needs the game to actually run; the `SH_DEV`
debug API at the bottom of index.html is the hook for that, and a puppeteer
harness belongs on top of it.

---

## THE VERDICT, PLAINLY

**This is a finished game, and a good one.** The core loop is whole: a run
starts, pauses, resumes, exits, dies, banks and continues, and it banks on every
one of those paths. `bankRun()` is genuinely idempotent through `*Paid` high
water marks. The two stream daily PRNG is intact and truly independent. The
if/else chain bug that shipped here once is fixed and well commented. The
service worker deletes only its own prefixed caches. There are no dashes in
player copy anywhere.

What it had was **three specific defects, two of them the exact failures its own
comments warn about**, plus a room with no door.

---

## WHAT THE AUDIT FOUND, WORST FIRST

### 1. 🔴 `PROG.decRew` was saved but never loaded, so capstone rewards re-paid

`grantDecadeRewards()` guards every payout on `PROG.decRew`, and the ⛔ above it
says *"Every reward is paid ONCE, keyed on the level number in PROG.decRew, so
replaying a capstone for stars can never farm it."* **That was false as
shipped.** `decRew` was absent from the `PROG` default and absent from the
loader. `saveProg()` stringifies all of PROG so it was written to disk every
time, and dropped on the very next boot.

Net effect: **every decade capstone bonus, the level 50 free Prize Bin pull
(which grants a character) and the level 100 feast (500 caps plus 20 sunbeams)
re-paid once per browser session** for anyone who replayed that capstone. The
level 50 pull is the worst of the three because it hands out a costume.

Fixed: declared in the default, read back through the type guard, and added to
`CLOUD_KEYS_SET` so it survives a reinstall too. The gate now asserts that every
payout bearing field in the save is read back on boot, not just this one.

### 2. 🔴 The service worker version drifted for the third time

`SWV='73'` in index.html against `CACHE = "jimothy-v77"` in sw.js. The
registration is `sw.js?v=SWV`, so **the browser was never refetching the worker
and every player kept installing the one from four cache bumps ago.** The file's
own comments document this happening twice before (57 vs 67, then again) and say
in as many words: *"do not rely on that twice."*

Fixed to 77, and the gate fails the build if the two numbers ever separate again.
That is the assertion I would keep above all the others in this file.

### 3. 🔴 The daily reward overlay was a room with no door

`#reward-ov` is `position:fixed; inset:0; z-index:300` and auto opens on every
return to the title screen. It had **exactly one** dismiss path: the Claim
button. No Later, no backdrop tap, no Escape, and the popstate handler checked
`bin-reveal` but never `reward-ov`, so system back navigated the screen
*underneath* the overlay while the overlay stayed on top.

Worse, Claim is also the one path that can throw: `claimReward` hid the overlay
*after* `saveProg()`, `sfx()`, `achCheck()` and `PROG.chars[skinId]=1`. A throw
in any of those left the overlay pinned over the game permanently.

Fixed: a Later button (48px), backdrop tap, a popstate case, and `claimReward`
now hides the overlay **first**, before anything that can throw. Closing costs
nothing, because `rewardReady()` is still true tomorrow.

### 4. 🟠 One `catch` over 25 statements meant a bad save truncated itself

The `sh_prog` loader is 25 hand written field copies under a single
`}catch(e){}`, in strict mode. A save that parses but has a wrong **type**
throws mid loader: `if(p.unlocked)PROG.unlocked=p.unlocked;` followed by
`PROG.unlocked.toadling=1` throws if `p.unlocked` came back a string. Everything
after that point silently never loads (caps, chars, adv, eggs, ach, daily,
playlist, codes, tokens), the game boots looking brand new, and **the first
`saveProg()` writes the stump back over the good save.**

Fixed with an `_o()` guard that returns a real plain object or null, so an object
field can never be assigned something that throws when a key is written to it,
plus a backstop that re-seeds the critical maps if they end up wrong. That
removes the throw rather than catching it later.

### 5. 🟠 The Continue button handed its only key to third party code

`reviveRun()` disabled `#go-continue`, then re-enabled it **only inside the ad
SDK's callback**. An SDK that threw or simply never called back left Continue
dead for the rest of the run. Fixed with a 20 second rescue timeout, a
once only latch, and a try/catch around the SDK call itself.

---

## CHECKED AND CLEAN

These are the things I went looking for and did not find, which is worth
recording so the next pass does not re-tread them:

- **The two stream PRNG is intact.** `rng` (the clock: weather, gulls) and
  `lrng` (the course: lanes, traffic, pads, pickups) are two separate `mkRng`
  closures with seeds a golden ratio constant apart. Zero crossover in either
  direction. The road builder contains no `Math.random`. Four assertions now
  hold this, including one that fails if the two are ever assigned from each
  other.
- **The if/else chain bug is fixed.** The bare `if(G.mode==='adventure' &&
  !L.egg)` now sits *below* the whole safe row ladder, where it belongs. The
  gate scans that region for a bare `if` that still has an `else if` beneath it.
- **`bankRun()` cannot double pay.** Caps, capsEver, flowers and sunbeams all
  use `Math.max(0, current - alreadyPaid)` delta guards, which is exactly right
  for a continued run that reaches `gameOver` more than once. Bests take the MAX.
- **The service worker's cache sweep is correctly prefix scoped** to
  `jimothy-`, deferred 3s after `clients.claim()`, and returns `Response.error()`
  rather than an empty 200 on a cache miss.
- **Content map invariants hold.** Five weekly rungs, fourteen pack costumes,
  `FIN_ON=false` so the retired colour finishes stay retired. All three are now
  asserted against `CONTENT-MAP.md` being the source of truth.
- **No em dash, en dash or spaced hyphen in any player facing string.** 157 em
  dashes in the file, every one inside a comment. The check walks the JS with a
  state machine and checks the markup's visible text separately, because the
  first two naive versions of it read CSS declarations and comment prose as
  player copy.

---

## STILL WORRIES ME

- **Nobody played it after these edits.** No browser was opened (ten agents on a
  two core box; the main loop owns browser work). The five fixes are asserted
  statically, not played. In particular the **Later button on the daily reward
  overlay has never been looked at** — it is a new button on a screen that
  appears on every return to the title, and per the project rule, wiring is not
  seeing. Shoot that overlay at 375x667 and at desktop width before trusting it.
- **`decRew` fires retroactively.** A player who has already farmed a capstone
  keeps what they farmed; the fix only stops it recurring. Nothing to do about
  that, but it means the caps economy has some inflation baked in from before.
- **`go-retry` does not `bankRun()` while `pz-restart` does.** Safe today only
  because `gameOver` already banked before `go-retry` can be reached. It is an
  asymmetry sitting directly under a ⛔ comment that says "bank first", and it is
  exactly the shape of thing that becomes a bug when someone adds a new path to
  the game over screen.
- **The comment at 2142 is wrong.** It claims the adventure landmark placement
  "consumes NO rng draws"; `pickEgg` draws once from `G.lrng`. Adventure only, so
  the shared daily is unaffected and the per level reseed keeps it deterministic,
  but the invariant as written is not held and somebody will trust it.
- **There is no runtime harness at all.** This gate is static. The purpose built
  `SH_DEV` API (start, autoPlay, levelSeed, clearLevel, resetRewards,
  reviveState, rewardOpen, pull, bootlog) is sitting there unused by any check.
  The single highest value thing left is a puppeteer harness on top of it that
  plays one adventure level and one daily to completion. Note the documented
  trap: `scripts/satellite_probe.js` waits for `networkidle0`, which the splash
  `<video>` holds open forever. Use `domcontentloaded`.
