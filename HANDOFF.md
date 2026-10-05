# HANDOFF: 5 Oct 2026, after the two crashes

Written by the Fable session of 5 Oct (01:23 to ~02:30 UTC) for the Opus 5.5 session that does the build.
Everything below was checked on this machine today; the command or the evidence is beside each claim.
**The build is Pixel Petri (the `tiny-world` repo), design 19. It is NOT in this repo.**
The 18 Aug handoff is kept at the bottom of this file; its status claims are stale (its "active task", Ripcord 3D, finished on 1 Sep).

Read in this order: this file, then the top entry of `START-HERE.md` (the board), then `/workspaces/tiny-world/STATUS.md` (top block)
and `HANDOFF-OPUS-DESIGN-19.md`.

---

## 1. What happened (UTC)

| When | What |
|---|---|
| 4 Oct 17:55:41 | The old codespace's container died with two heavy runs going on 2 cores, 8 GB, no swap. Likely memory; not proven, nothing was logging. It came back in recovery mode. |
| 4 Oct 20:05 | Work went on INSIDE the recovery container. Its token reached lucid-winds only, so **tiny-world commits could not be pushed.** |
| 4 Oct 21:55 | Last board entry: H1's review round parked on a LOCAL branch, his notes' check started (run `wf_941884c5-755`). |
| after 21:55 | The codespace failed a second time. No record of the moment survives. A rebuild failed with **error 1302**. |
| 5 Oct 00:01 | Stephen committed `rescue` (lucid-winds only), then **deleted that codespace.** |
| 5 Oct 00:42 | New codespace from `add-sproing-jumper`. Container creation failed with 1302 again at 00:50: recovery mode. |
| 5 Oct 00:57 | Stephen moved `.devcontainer` to `.devcontainer.bak`. At 01:14 the codespace came up on the default image. |

## 2. What is safe, what is lost

Checked against GitHub at 01:45 UTC 5 Oct (`git ls-remote` on tiny-world, the commit lists of both repos).

**SAFE**
- **LIVE is untouched: Pixel Petri `20261004b`** = tiny-world `c8231eb` on arcade `9759a789` (lucid-winds `origin/main`).
- tiny-world `main` = `a161a24` (H1 as built, `d11128e`; not live).
- **His sale-day notes are BUILT and on GitHub:** branch `lead/notes-oct04` = `f771f7b` (the Move button, bubble wands, the dog's line, the penguin's star, the teddy / ball / sheep costume). Never checked, never landed.
- Memory: 776 notes, last saved 16:16 UTC 4 Oct. Restored here.
- This repo: the board through 21:55 UTC 4 Oct, and the `rescue` commit (7 files: three design docs, the `.claude/settings.local.json` allow list, `health.sh`, a lock file, `b.out`). Read and scanned for secrets: none. Nothing half finished in it.
- Tumble's Play submission prep (`store/tumble-play/`, the vault release). Waiting on him, as before.

**LOST (the deleted codespace held the only copy)**
- tiny-world branch **`wip/H1-fix1`** (`c258594`) and branch **`wip/H1-review-round`** (`61fda37`): H1's whole fix and review round. Neither is on GitHub.
- Whatever run `wf_941884c5-755` did after 21:55 (the check of his notes `f771f7b`, any fix it made).
- H1's check verdict and the H1 builder's claim object (there is no `H1*.json` in memory `scripts/claims/`).
- `/workspaces/.tw-lead/` (the two recovery script copies, the logs, the look shots), the worktrees `tw-notes` and `tw-deploy-cards`, every transcript and workflow journal.
- Memory notes written after 16:16 UTC 4 Oct.

**What the board kept about the lost H1 round (so it is rebuilt, not rediscovered).** From the 21:55 entry, verbatim in `START-HERE.md`:
the round changed the **heron and otter numbers**; measured, a kind died off on 6 of her 9 painted ponds before and 1 after, her first
world 2 of 4 before and 0 after, nothing starved in 26 runs. Its per-ticket suite was RED on two findings, both still open:
1. `the-birds-fly-to-warmer-trees` (I2), seed 2: the new numbers shift her world's draws and a hungry sparrow leader turns back short of the tree (green on 4 of seeds 1 to 8, 8 before). The fixture's setup leans on the draws: fix the setup.
2. `nothing-dies-off-in-her-pond`'s mutation "the seal at 0.2" is NOT CAUGHT, on `a161a24` too (stale since `88ed746`). Replace it with a real one (a test only commit, the lead's call).

## 3. This machine, as it stands

- Codespace `didactic-tribble-wqgj4jrv5gpcg67g`. **2 cores, 7.8 GB, no swap**, 32 GB disk with 11 GB free. Default image `universal:latest` 6.1.7 (Ubuntu 24.04). **No `.devcontainer` is active**, on purpose (section 5).
- Node v24.21.0. Chrome for Testing 154 through puppeteer 25.12.0 in `/workspaces/lucid-winds/node_modules` (tiny-world's look scripts read it from there).
- **GitHub: `gh` is logged in as Stephenuffugus** by a device login he approved at 01:38 UTC (scopes repo, workflow, read:org, gist; stored in `~/.config/gh/hosts.yml`; `gh auth setup-git` done). Every cross repo command still needs `env -u GITHUB_TOKEN -u GH_TOKEN` in front: the codespace's own token reaches lucid-winds only and wins when it is set. **This login is gone after any rebuild.**
- `/workspaces`: `lucid-winds` (a SHALLOW clone, branch `add-sproing-jumper`), `tiny-world` (full, `main` = `a161a24`), `abduct_a_chameleon`.
- Memory is back in `~/.claude/projects/-workspaces-lucid-winds/memory` (a clone of `sws-memory`).

**Proved here on 5 Oct, about 01:50 UTC (tiny-world `MIGRATION.md` section 8):**

| Check | Result |
|---|---|
| `node tools/validate-data.mjs` | ok (20 files, 257 string keys) |
| `node tools/proof.mjs 19` | ok, all five recorded worlds the same, 35 s |
| `node tools/deploy-arcade.mjs` (dry run) | ok. Next stamp is **`20261005a`** (the board's "20261004c" is yesterday's date). Nothing pushed, `origin/main` still `9759a789` |
| `BASE=http://localhost:8080/ node dev/live-look.mjs` | The game boots and runs at 412 and 375; both running shots opened. The script says FAILED only because `/music/v1/tiny-world/*.mp3` is not in the repo (music is served by the host). A plain load is 104 of 104 files ok |

**NOT run: `npm test` (the whole suite, 30 to 60 min).** The next ticket's per-ticket suite is the baseline on this machine. If it is red on untouched code, that is the first job (MIGRATION section 8).

## 4. Resuming the build

The order is the board's 21:55 plan, corrected for what was lost. **One heavy job at a time, always.**

1. **His notes first** (they do not depend on H1). `git -C /workspaces/tiny-world worktree add /workspaces/tw-notes lead/notes-oct04`, then check `f771f7b`, fix if mustFix, per-ticket suite (`--keep-going`), a look, fast forward `main`, deploy. Script: memory `scripts/pixel-petri-notes-oct04.js` (build, check, fix #1): the build stage is already done.
2. **Then H1's review round, rebuilt.** The check's verdict is lost, so re-run H1's check on `d11128e` first (read only), then the fix round with section 2's record in hand, then the two red findings, per-ticket suite, land, deploy.
3. **Then H2, H3** (tiny-world `STATUS.md`, "THE NEXT STEP"). Run script: memory `scripts/pixel-petri-d19-week.js`; its header says how to restart: `{early2b: true, after2b: true, from: '<first ticket not run>'}`, plus `review: {id, claim}` for a ticket built without its check. Set `SESSION` on line 34.

Rules that cost a day when they were broken:
- **ONE heavy job at a time on this box** (a suite, a browser, a builder). Its 2 cores are one physical core; 8 GB and no swap. Two at once is what was running at 17:55.
- **Push tiny-world after every commit, wip branches too.** The credential exists now. The lost work was lost only because it could not be pushed.
- Lead files in `/tmp/tw-lead/`, an agent's scratch in `/tmp/tw-scratch-<ticket>/`. `/tmp` and `~` do not survive a rebuild; `/workspaces` does.
- Never `--help` a tool in tiny-world (`tools/test.mjs --help` runs the whole suite). Read its header.
- Never match a process by its command line (`pkill -f`, `kill $(pgrep -f ...)`): it kills the shell that runs it. Kill by saved PID. (This session did it once, again.)
- Every deploy reaches PAYING players. The deploy worktree `tw-deploy-cards` is gone: `git -C /workspaces/tiny-world worktree add /workspaces/tw-deploy-cards <commit>`.
- **Never `git push origin add-sproing-jumper:main` from here without merging first.** GitHub's compare: this branch is 87 ahead and 19 behind `main`; the 19 are Pixel Petri's deploy commits. A forced push would take the paid game off the arcade.

## 5. The container config: why it failed, and the fix (staged, NOT active)

**What is known.** The config that failed was three lines of substance: image `mcr.microsoft.com/devcontainers/universal:2`, a postCreate (`bootstrap.sh`) and a postStart (`workspace.sh`). Error 1302 is "fatal, creating container": it is raised before either script runs. So the image line is the only part of that file in play. With no config at all, the same codespace built on `universal:latest` at 01:06 (`/workspaces/.codespaces/.persistedshare/creation.log`).

**What is not known.** Why `:2` failed. The failed build's log was overwritten by the build that worked, and the host log starts at 00:51. The tag still exists (2.13.1, built May 2025, Ubuntu 20.04, 3.6 GB; `latest` is 6.1.7, Sep 2026, Ubuntu 24.04), so it was not simply deleted. **The image is the inferred cause, not a proven one.**

**The fix, in `.devcontainer.fixed/`** (Codespaces does not read that folder name, so it cannot fire by itself):
- `devcontainer.json`: the image is `universal:latest`, the one Codespaces uses by itself and the one seen building here.
- `bootstrap.sh`: installs puppeteer when `node_modules` is missing (a fresh clone has none), installs the 11 libraries Chrome needs on Ubuntu 24.04 (without them Chrome exits 127 on `libatk-1.0.so.0`), and reports a hand made gh login truthfully. **Run by hand here at 01:57 UTC: every line of its summary reads ok** (`/workspaces/.bootstrap.log`).
- `workspace.sh`: `tiny-world` is now in `CORE`, so a rebuild clones it. It was cloned by hand before, which is why it did not come back.
- `health.sh`: unchanged and still NOT wired in (his call, below).

**Why it is not active:** an untested config on this branch is the one thing that could put this codespace back in recovery mode if the container dies mid build. `.devcontainer.bak/` is untouched.

**To test it without risking this codespace:** the branch **`devcontainer-test`** is this branch with the folder already renamed to `.devcontainer`. On github.com: the repo, Code, Codespaces, the "..." menu, "New with options", branch `devcontainer-test`. If it comes up, the config is good: then here `git mv .devcontainer.fixed .devcontainer && git rm -r .devcontainer.bak`, commit, push. If it goes to recovery mode, delete that throwaway codespace; nothing here was touched. ⛔ Do not rebuild THIS codespace without asking him.

**The way out of recovery mode, if it ever happens again** (what he did): in its terminal, `cd /workspaces/lucid-winds && git mv .devcontainer .devcontainer.off && git commit -m "disable devcontainer" && git push`, then rebuild.

## 6. This repo's own checks (step 1), all run 5 Oct

Nothing here is crash damage: GitHub's compare shows this branch differs from its merge base with `main` in 13 files, none of them game code.

| Check | Result |
|---|---|
| git | clean, equal to `origin/add-sproing-jumper` before this session's commits |
| Every inline script block parses | `index.html` 82 blocks ok; ten other top level pages ok |
| `scripts/catalog.mjs` (+ selftest) | ok, a visitor can open 163 |
| `scripts/advertised_count_check.mjs` | all 7 advertised counts true |
| `scripts/sw_cache_scope_check.mjs --fleet` | ok |
| `scripts/jimothy_store_unlocks_check.mjs` | 16 ok, 0 failed |
| `scripts/vendored_boot_probe.mjs` | all 13 boot with their own titles (needs `LW_URL=http://127.0.0.1:8777`, its default port is 8951). Four optional art files 404 (tomato-man logo and hero, the title mark of tarot-run and glyph-forge) |
| `scripts/defect_sweep.mjs` | 145 satellites, 42 with candidates (36 parse without validation, 5 exit gated on a frame, 2 fetch without an ok check, keepsies' earn promise). Candidates, not verdicts. The 18 Aug handoff's "0 across 112" is long stale |
| `satellites/_exit_audit.mjs` | 144 audited: 83 pass, 7 partial, 27 graft, **27 read STRANDED** from source (tiny-world and tumble among them, which are store apps). Not opened one by one |
| `scripts/vendor_satellites.mjs --check` | **all 12 upstream repos read EDITED** (2 to 8 files each): the 27 Aug SEO pass, the 5 Sep dash sweep and the 6 Sep brand sweep edited the vendored copies. The next re-vendor overwrites those edits unless they go upstream |
| `scripts/fleet_verify.mjs` | NOT run (heavy, and no game code changed) |

## 7. His calls, none of them blocking the build

1. **The machine.** Two container deaths in a day on 2 cores and 8 GB. A 4 core, 16 GB codespace is the direct fix and roughly halves suite time; it costs twice as much an hour.
2. **`GH_PAT` as a Codespaces secret** (github.com/settings/codespaces), so a rebuild restores the private repos and memory with nobody typing. Until then a rebuild needs a device login again.
3. **The health logger** (`.devcontainer.fixed/health.sh`: one line a minute of free memory and disk to `/workspaces/.health.log`, so a death leaves a record). By hand now: `nohup bash /workspaces/lucid-winds/.devcontainer.fixed/health.sh >/dev/null 2>&1 &`. Wired in: add it to `postStartCommand`.
4. **Testing and turning on the fixed container config** (section 5).

## 8. Where this session fell short

- It started a GitHub device login without telling him first. GitHub's "new device, Washington, 172.210.53.225" warning read as a break in. It was this codespace (same IP, same minute). Say it before starting any login.
- It read this file's 18 Aug text as current for several minutes. The board is `START-HERE.md`.
- Its first script block checker called `index.html` broken (an HTML comment containing the word `<script>`), and its first boot probe ran against the wrong port. Both caught before being reported.

---
---

# THE 18 AUG 2026 HANDOFF (kept for its traps table and its commands; the status in it is stale)

> The "ACTIVE OPUS TASK (2026-08-31): the Ripcord 3D battle view" line that stood here is DONE: all five phases are ticked in
> `satellites/ripcord/HANDOFF-3D.md` and build `20260901a` is on `main`.

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

~~Nectar Drop's daily is broken~~ **FIXED (commit ada4c65a) and PROVEN
deterministic 2026-08-21** — two fresh loads, ten identical shots with powers,
identical boards and scores. Safe to send to Listdle. (The remaining candidates
with dailies still need the same determinism proof before submission.)

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
