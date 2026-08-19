# HANDOFF — 2026-08-18

Written for whoever picks this up with no context. Everything here was verified
today, and the commands that re-derive each claim are inline. **Run the command,
do not re-invent the measurement.**

Read in this order: this file → `AUTO-MODE.md` (the queue) → `DONE-LEDGER.md`
(what is already finished, do not redo it) → `WHAT-TO-TEST.md` (Stephen's own
test list, with the ⚖ decisions that are his).

---

## 0. THE ONLY DEADLINE

**Steam Direct was paid 2026-07-30, so Jumping Jimothy can release from Aug 29,
target Tue Sep 1.** App `5043360`, depot `5043361`. Everything else on the board
has no clock. That is eleven days from today.

Upload is `LW_STEAM_USER=<login> ./store/jimothy-steam/steampipe/upload.sh`, and
`store/jimothy-steam/vendor.sh` MUST be run first or Steam players get a stale
build. `app/` is a copy of `satellites/stream-hop`, not the source.

---

## 1. WHAT WENT LIVE TODAY

All of this is on `main` and verified on production, not sitting on a branch.
⛔ Work on `add-sproing-jumper` is not live until `git push origin add-sproing-jumper:main`.

### The thirteen off-origin games are now same-origin
Twelve arcade cards pointed at `stephenuffugus.github.io` and one at
`hunch-mauve.vercel.app`. A Horizon Store app is a TWA, so any of them would have
ejected a headset player out of the app. They also could not be cached by the
arcade's service worker and died whenever GitHub Pages did.

**The upstream repo is still the source of truth.** `VENDORING.md` is the full
account. ⛔ **Never hand-edit `satellites/<slug>/` for a vendored game** — fix it
upstream and re-vendor, or `--check` reports it as drift and the next vendor
overwrites you.

```bash
node scripts/vendor_satellites.mjs --check      # must read CLEAN for all 13
node scripts/vendored_boot_probe.mjs            # they boot, and not to a dead screen
```

**The one that would have hurt:** nine of those games' service workers deleted
**every cache on the origin**, not just their own. On github.io they were already
wiping each other. Same-origin, the first one a player opened would have wiped the
arcade shell, Lucid Winds, PadLab and Hush — the same failure that took the fleet
down once before. Fixed in all nine upstream repos so the copies stay
byte-identical. Guard: `node scripts/sw_cache_scope_check.mjs --fleet`.

Being in the fleet also put them inside checks they had never faced: **73 dashes
in player copy** across six games, Skitterlings' coin sync where a 404 and a
success were indistinguishable, and ten exits improved.

### Jimothy: the black bars are gone
The game is a fixed 540x960 stage, so a maximised 1920x1080 player saw 607px of
game and 656px of dead space each side. The sides are now the **zone's own card
art**, blurred and darkened, following the run — Pike Market looks like Pike
Market. `#bezel` in `satellites/stream-hop/index.html`.

It only renders when there IS spare width, so phones and the Steam window's
normal aspect-locked size never see it.

```bash
node scripts/jimothy_bezel_shot.mjs     # 1920x1080, 1366x768, 390x844
node scripts/jimothy_run_shot.mjs       # in-run, where the zone art actually shows
```

⚠️ **This has never been checked on a real device and needs to be.** A headless
container cannot tell you what a cheap laptop does with a blurred 1920x1080
layer, and the game has to hold 60fps.

### Jimothy: a bought build earns its costumes by playing
Stephen's ruling: earnable in game, **codes still work as an easter egg**.

On the free web build, five costumes come off a seven-day return streak and six
need a code. Fine for a free game, wrong for a purchase: 35 calendar days plus a
code hunt to reach content you already own. On a storefront build
(`__STEAM_BUILD` / `__ITCH_BUILD`, the flag `vendor.sh` already sets) those ten
sit on a campaign ladder, level 10 through 100, the daily loop is off, and the
codes still work.

Parsed out of `CHARS` rather than grepped: **45 characters** — 26 already buyable
with caps, 7 secrets already earned by feats, 1 starter, and **11 that a player
could not reach by playing at all.**

⛔ **THE BARNACLE IS DELIBERATELY NOT ON THE LADDER.** Its own note in `CHARS`
says it is "handing it to exactly one man". It is a tribute, not content, and a
ladder hands it to everybody. It stays code-only. ⚖ Stephen's if he wants it
reachable.

```bash
node scripts/jimothy_store_unlocks_check.mjs    # 13 assertions
```
Five of those thirteen exist **only to prove the free web build did not change**,
because that is the one with players in it.

---

## 2. THE FIVE THINGS STILL BETWEEN JIMOTHY AND STEAM

1. **Capsule art does not look like the game.** u/mark_succerberg, unprompted:
   *"I think jumping jimothy has pretty fluid movement. I do not like the art
   style though. The preview pic would lead me to believe that it's a newspaper
   cartoonish style kind of game."* ⭐ **The title screen is that same
   cream-paper-and-ink style**, so the mismatch is the game's front door, not
   just the store thumbnail. Capsules should be built from in-game frames.
2. **Nobody has beaten every level.** `store/jimothy-steam/BEATABILITY.md`
   exists; a solver run over all 120 levels reporting any that cannot be cleared
   is cheap, and it is the difference between shipping and dead-ending a paying
   player.
3. **Art with three legs and obvious AI tells.** 872 pose frames across 44 sheet
   folders. A machine can shortlist candidates; ⛔ it cannot decide what
   "obviously AI" means. That call is Stephen's off a contact sheet.
4. **The real-device FPS check on the bezel** (above).
5. **⚖ The `◀ Sky Wolf Studios Arcade` button on the Steam title screen.** Valve
   allows outbound links; it just reads odd in a bought desktop game. Hide or
   keep, Stephen's call, recorded in `JIMOTHY_ROADMAP.md` and still unanswered.

---

## 3. LISTINGS — the facts, not the vibes

### Listdle: two of five are live, and the criterion is quoted
Checked against the live site today, not the inbox:

```
tally 200 · hues 200 · sixfold 403 · cosmic-cadets 403 · nectar-drop 403 · jimothy 403
```
(403 is their generic not-found; a made-up slug returns it too.)

Conor's refusal of Jimothy, verbatim: *"I played it, and I think it's a fun game,
but I don't think it fits the puzzle game theme of Listdle. Even though it has a
daily mode, it is more of an action game. Please continue to keep me updated with
any new games you create."*

**The criterion is a PUZZLE with a daily.** He only ever refused Jimothy in
writing. Sixfold, Cosmic Cadets and Nectar Drop were never added and never
refused — either passed over or still in his 200-submission backlog. The door is
explicitly open for more.

⛔⛔ **Nectar Drop's daily is broken**: its own copy promises everyone the same
board and one place uses unseeded randomness. It is **submitted but NOT listed**,
so it is not publicly wrong today. Fix it before it is ever resubmitted.

⭐ The real job: find every puzzle game in the catalog with a daily, **verify the
daily is genuinely deterministic rather than trusting the label**, and send the
ones that pass.

### The generative-AI rejections
One person, Jupiter Hadley, across two outlets, and the reason was two-part:
*"Indie Games Plus doesn't cover platforms, they cover games"* plus a flat
objection to AI generation.

⛔ The move is not to conceal it. Pick venues by their stated policy, **send one
game rather than the portal** (both rejections said that in different words), and
lead with the engineering, because it is true and it is the stronger pitch:
Blackout generates murder cases with exactly one solution and the evidence to
prove it, verified over 10,000 cases; Parallel ships 100 levels each solved by a
solver before release and the on-screen par IS the solver's optimum.

### Waiting on an account from Stephen
- **GameDistribution / Azerion**, replied: *"upload your strongest titles
  directly through our Developer Portal."*
- **GameMonetize**, replied: *"create a Developer Account... We recommend
  submitting one game first."*
- **Google Play** $25 · **Apple** $99/yr · **Pi developer registration** · **free
  Meta developer account** for the Horizon app.

⛔ **Pi is blocked on us, not on Pi:** the portal forces email signup, which
fails their review. The listing URL must be `?pi=1`.
⭐ **Pace, not volume.** One title per platform, wait for the verdict, then the
next. Submitting everything at once is how accounts get flagged.

---

## 4. THE GAMES STEPHEN COULD NOT FIND — both exist

- **The slot machine is Seed Reel**, and it is **live, not gated**, at
  `/satellites/seed-reel/`, filed under **dice**, which is why it was hard to
  find.
- **Bandit's Box** is the other one people read as a slot machine. Dev-gated.
- **The dungeon crawler is Wild Wardens**, dev-gated at
  `/satellites/wild-wardens/`. Clear three rooms, beat the boss, fight/skill/
  item/run with a rhythm bar for crits. It only became reachable same-origin
  today; it used to be "BarBrawl" on github.io.

**24 cards are dev-gated.** Stephen wants to play them and graduate them. A
graduation checklist per game would let him play a shortlist rather than all 24.

---

## 5. TRAPS — every one of these cost real time TODAY

⭐⭐ **A hit is a candidate, never a verdict.** ⭐⭐ **When the same question gives
different answers on different runs, stop answering it and fix the instrument.**

| Trap | What happened |
|---|---|
| **The whole Jimothy game is inside a closure** | `PROG`, `CHARS`, `achCheck`, `G` are NOT on `window`. A checker that asserted on them died on its first line. **Test behaviour through the DOM.** |
| **innerText falls back to textContent on `display:none`** | Reading a CLOSED screen returns the whole panel, so an assertion **passed vacuously** on a run that never navigated. Assert the screen is open before judging anything on it. |
| **One click does not dismiss a splash** | It holds for a minimum time, so a click fired right after boot raced it and did nothing. Retry until it is gone. |
| **Three green signals on a dead page** | Wild Wardens returned 200, threw nothing, and rendered an exit button, on a screen reading "Unmatched Route, page could not be found". A boot probe must read rendered text. |
| **Half a base path** | Expo bakes `/BarBrawl/` in. Rewriting only the slashed form fixed every asset and left every route unmatched, because the bundle also carries `baseUrl":"/BarBrawl"` with no trailing slash and that is what the router reads. |
| **A checker's fixture colliding with real data** | The SW scope check seeded fake neighbours named `padlab-v10` and `hush-v3`, which are those apps' real cache names. Three false positives out of three hits. |
| **A directory skipped for the right reason, once** | The exit audit skipped any dir called `assets` — correct until a Vite-built game joined the fleet, whose entire bundle is `assets/index-<hash>.js`. It reported Tally STRANDED. |
| **`index.html` is not the whole game** | The defect sweep only read each satellite's index. Chameleon 3D is carded separately at `abduct-3d.html` and had never been swept. Fixing it by sweeping every sibling `.html` was wrong the other way and dragged in six dev labs. **Ask the catalog which pages are carded.** |
| **A comment killed the catalog** | `catalog.mjs` skipped strings but not comments, so ONE apostrophe in a comment ("the arcade's") made it swallow the rest of the file. Now skips comments, with a selftest for that exact case. |
| **A regex disagreeing with itself** | Counting gated characters gave 7+6, then 6+5. Parsing `CHARS` gave the truth. **Never regex a structure you can parse.** |
| **A control placed before the app paints** | The injected exit chip landed on Wild Wardens' own streak readout. Three fixes failed on three different wrong guesses; dumping `elementsFromPoint` answered it in one run. |
| **A false dead button** | Jimothy's how-to panel is 1538px of content in a 960px stage with `overflow:hidden`, so "Got it, let's hop" sits below the fold and looks broken. It scrolls. **Not a bug.** |
| **`node x.js \| tail`** | Returns *tail's* exit code. |
| **`fleet_verify` needs a server on :8777 from the REPO ROOT** | Without it two suites die on ERR_CONNECTION_REFUSED and read as red. That is NOT the CPU-contention trap; check the port first. |

---

## 6. HOW TO VERIFY THE WHOLE THING

```bash
(setsid python3 -m http.server 8777 --bind 127.0.0.1 >/dev/null 2>&1 </dev/null &)

node scripts/catalog.mjs                          # 186 carded / 162 openable
node scripts/catalog.mjs --selftest
node scripts/advertised_count_check.mjs           # every advertised number is true
node scripts/defect_sweep.mjs                     # 0 actionable across 112
node scripts/sw_cache_scope_check.mjs --fleet     # no worker wipes a neighbour
node scripts/vendor_satellites.mjs --check        # all 13 CLEAN
node scripts/vendored_boot_probe.mjs              # all 13 boot, no dead screens
node satellites/_exit_audit.mjs                   # 112 of 112 can get home
node scripts/jimothy_store_unlocks_check.mjs      # 13 assertions, both builds
node scripts/fleet_verify.mjs                     # 32 green, 0 red — RUN ALONE
```
Every one of those takes `--selftest` and proves its own detectors can fire *and*
stay quiet. ⛔ **Run the selftest before believing a report.**

Current state, all re-run today: 112 satellites, 0 dashes, 0 stranded, 0
exit-gated, 0 fetch-without-ok, 13/13 vendored CLEAN, fleet_verify 32 green /
0 red / 2209 assertions.

---

## 7. WHERE I FELL SHORT TODAY, so it is not repeated

Recorded because Stephen was right to be angry about it, and a handoff that only
lists wins is not a handoff.

- **I offered the Dewball audit as outstanding backlog when it was already done**
  on 2026-08-16, in `satellites/dewball/AUDIT-NOTES.md`. He caught it. That is
  exactly the redundancy `DONE-LEDGER.md` exists to prevent, and I did not read
  the game's own notes folder before proposing work. ⭐ **Check for an
  `AUDIT-NOTES.md` in the game folder before calling any audit outstanding.**
- **I stopped mid-task once** and had to be told to resume.
- **I told him Nectar Drop was live on Listdle and therefore urgent.** It is
  submitted and not listed. I checked the inbox and not the site.
- **I said HUNCH needed CORS work.** It already sends
  `Access-Control-Allow-Origin: *`; I had read the source and not the live
  deployment.
- **My first version of three separate checkers was wrong before the code was**
  (the closure, the vacuous pass, the fixture collision). Each one is now in the
  traps table. **Verify the checker before the code it accuses.**

---

## 8. ⚖ ONLY STEPHEN

1. Steam: the upload, the store page, the release button.
2. Google Play $25 · Apple $99/yr · Pi registration · Meta developer account.
3. GameDistribution + GameMonetize developer accounts.
4. Playing the 24 dev-gated games and saying which graduate.
5. The bezel's real-device FPS check.
6. Whether The Barnacle should be reachable without a code.
7. Whether the arcade back-button stays on the Steam title screen.
8. **HUNCH's leaderboard is 500ing on production** and was before any of this:
   `GET /api/leaderboard` returns `TypeError: fetch failed`, its Upstash Redis
   call. Needs the Upstash credentials.
9. The 11 taste and economy calls in `WHAT-TO-TEST.md` Part 3.
