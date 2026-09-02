# HANDOFF — PUB1, the catalog ready for the ad networks

> Written 2026-09-02 by Opus at the end of the PUB1 overnight task, for Fable to review.
> Branch `add-sproing-jumper`, five commits, `6cf67a8f`..`d477c8f6`, pushed. **Never main.**
> Fence held: only `publish/**`, `scripts/pub_build.py` and `PUBLISHING.md` were touched.
> Nothing under `satellites/` was edited. `git diff --name-only 912e1517..HEAD` proves it.

---

## 1. What the task was, and what came out

HANDOFF-SEP02's PUB1 block: pick ten games, build twenty publisher ZIPs, prove each one,
make the marketing sizes, put Jimothy on a diet, and write the pitches, so that Stephen's
part stays fifteen minutes per network.

All five steps are done, one commit each.

| Step | Output | State |
|---|---|---|
| 1 | `publish/QUEUE.md` — ten picked from 84 screened, with the rejections | done |
| 2 | 20 ZIPs, 40.9 MB, **20 of 20 verified** with the real SDK live | done |
| 3 | 50 marketing images in `publish/marketing/`, contact sheet opened and critiqued | done |
| 4 | `stream-hop-diet-{gd,gm}.zip`, **54.3 MB** each, from 400.7 MB, both verified | done |
| 5 | `PITCH-CRAZYGAMES.md`, `PITCH-POKI.md`, `REPLY-GD.md`, `REPLY-GM.md` | done |

**The ten:** Bloom Breaker, Berry Vine, Petal Slice, Dew Snip, Picnic Panic, Bubblenaut,
Stop the Light, Nova Bloom, Garden Guard, Pong Arena. Ten different genres on purpose.

---

## 2. Where everything is

```
publish/
  QUEUE.md              THE RECORD. Every claim carries the command and its last line.
  HANDOFF-PUB1.md       this file
  PITCH-CRAZYGAMES.md   requirements read 2026-09-02, three titles, submission text
  PITCH-POKI.md         same, plus the exclusivity problem, which is the real finding
  REPLY-GD.md           paste-ready letter to Sabina
  REPLY-GM.md           paste-ready letter to Marian, leads with Bloom Breaker
  tools/
    pick_screen.mjs     screens every openable satellite: size, deps, round-end hook
    smoke_boot.mjs      boots N games at 375x667, records errors, 404s, tap-target sizes
    pub_verify.mjs      THE GATE. Unzip, serve bare, play a round, assert eight things
    scout.mjs           dump a built game's screens and controls, walk its menus
    marketing.mjs       the five sizes, from card art plus a real frame of play
    pick_frame.py       picks the busiest frame of a round (PIL)
    jimothy_diet.py     400.7 MB -> 55.6 MB by three checkable rules
  recipes/<game>.mjs    11 play recipes: how to drive each game to its round end
  dist/*.zip            22 ZIPs. NOT in git (*.zip is ignored, repo is 3.7 GB)
  marketing/<game>/     512x384, 512x512, 200x120, 1280x720, 1280x550 + _play.png
  marketing/CONTACT-SHEET.png
  shots/                boot + round-end screenshot and a JSON of assertions per ZIP
scripts/pub_build.py    the builder, nine fixes this session
PUBLISHING.md           status board updated: GD, GM, itch, CrazyGames, Poki
```

⛔ **The ZIPs are not committed and that is deliberate.** `*.zip` is in `.gitignore`
("extract, wire, delete, never commit"), the repo is already 3.7 GB, and every ZIP has to
be rebuilt with the real game id before upload anyway. `publish/shots/` holds the
evidence that cannot be regenerated.

---

## 3. How to check my work in about twenty five minutes

Everything below is one command and its expected last line. Run them one at a time; this
box has two cores and two headless Chromes fight each other.

**a. The fence held, and nothing under satellites/ moved.**
```
git diff --name-only 912e1517..HEAD | grep -vE '^(publish/|scripts/pub_build\.py$|PUBLISHING\.md$)'
```
→ prints nothing.

**b. The builder still produces a clean build.**
```
python3 scripts/pub_build.py satellites/bloom-breaker --target gd
```
→ ends `wrote /workspaces/lucid-winds/publish/dist/bloom-breaker-gd.zip (43 KB)`
and along the way says which absolute refs it dropped, which exit id it hid, and which
round-end function it hooked.

**c. The gate itself.** Pick any two, one of each target:
```
node publish/tools/pub_verify.mjs publish/dist/bloom-breaker-gd.zip
node publish/tools/pub_verify.mjs publish/dist/garden-td-gm.zip
```
→ `PASS bloom-breaker-gd  44 KB  ad at round end: 1`

**d. All twenty two, if you want the whole thing.** About 45 minutes, run it in the
background:
```
for g in bloom-breaker berry-vine petal-slice dew-snip picnic-panic bubblenaut \
         stop-the-light nova-bloom garden-td pong; do
  for t in gd gm; do
    python3 scripts/pub_build.py satellites/$g --target $t >/dev/null
    node publish/tools/pub_verify.mjs publish/dist/$g-$t.zip | tail -1
  done
done
python3 publish/tools/jimothy_diet.py --budget-mb 57
node publish/tools/pub_verify.mjs publish/dist/stream-hop-diet-gd.zip | tail -1
node publish/tools/pub_verify.mjs publish/dist/stream-hop-diet-gm.zip | tail -1
```
→ twenty two `PASS` lines. My last full run is in
`/tmp/.../scratchpad/pub1/verify_final22.log`, but that is a scratch path and will not
survive; rerun it rather than trust it.

**e. Look at the pictures, do not take my word for them.**
```
publish/marketing/CONTACT-SHEET.png      all fifty at once
publish/shots/<game>-<target>-3end.png   the round-end screen each ZIP actually reached
```

**f. The screener still agrees with the builder about hooks.**
```
node publish/tools/pick_screen.mjs | grep -E 'bloom-breaker|garden-td|pong'
```
→ the `hook:` column should match what `pub_build.py` prints for the same game.

---

## 4. What I would check hardest if I were you

Ranked by how much damage a mistake would do. All of these are mine, in the builder, and
they run over **every** game we ever publish.

1. **The JS string-literal rewrite** (`pub_build.py`, section 2a4). Any `"/x.js"` in the
   HTML that the ZIP does not carry becomes `"data:text/javascript,"`. It is a regex over
   the whole document, including inside script bodies, which is where it needs to be. A
   string that looks like an absolute js path but is not one would be rewritten. I
   restricted it to paths ending `.js` and to files that genuinely are missing, and every
   build syntax-checks afterwards, but this is the change with the widest blast radius.
2. **The de-brand text pass** (2e). Rewrites text nodes to remove "Lucid Winds". Script
   and style bodies are cut out first, because `a > b && c < d` looks exactly like a text
   node to a regex. Check I really did cut them out.
3. **The runtime economy sweep** (in the injected head). A MutationObserver, debounced
   120 ms, that walks `body *` and hides leaf elements whose text names sunbeams, dew
   drops, Support the Studio, Donate or a tip jar, then walks up to the button holding
   the label. It runs forever in every build. On these small canvas games it is nothing;
   on a DOM-heavy game it would not be free. It is also the only thing standing between a
   publisher build and "☀ +6 sunbeams" on a win screen.
4. **`prune_unreferenced`** deletes top-level folders no shipped html/js/css/json names.
   It removed 171.6 MB from Jimothy and 0.1 MB (`og/`) from most of the ten. A false
   negative deletes art the game needs. The boot tests would catch it as a 404, and did
   not, but the rule itself deserves a read.
5. **`[id*="feedback" i]`** in `HIDE_EXIT_CSS` is broad by design. If some game has a
   legitimate element with "feedback" in its id it goes invisible in publisher builds.
6. **The eleven recipes.** They are the least reviewed code here because they are
   throwaway drivers, but assertion D (`__pubAd` called once, at the round end) is only
   as good as the recipe reaching a real round end. I looked at every `-3end.png` and
   they are real end screens. Look at a few yourself.

---

## 5. Known imperfections, said out loud

- **The two August pilot ZIPs are STALE and I did not rebuild them.**
  `publish/dist/blooming-words-{gd,gm}.zip` and `hues-{gd,gm}.zip` were built 2026-08-07,
  before all nine builder fixes. They have no `__pubAdCalls` counter, the old
  always-true SDK guard, and a live "Sky Wolf Studio Arcade" exit button that the old
  builder never hid. Their sources have since gained `/music-unlocks.js` too. **If
  Stephen uploads either as it stands, it carries a dead portal button.** Fixing it is
  two commands per game plus a recipe each, maybe twenty minutes:
  ```
  python3 scripts/pub_build.py satellites/blooming-words --target gd
  node publish/tools/pub_verify.mjs publish/dist/blooming-words-gd.zip
  ```
  There is no `publish/recipes/blooming-words.mjs` or `hues.mjs` yet, so the verifier
  will warn "no recipe" and skip assertions D and G. **This is the first thing I would
  do next.**
- **Two card thumbs carry a wordmark baked into the art** (Bubblenaut along the bottom,
  Stop the Light across the top) and the 4:3 and 5:3 crops clip them. Letterboxing to
  avoid it was worse and is written up in QUEUE.md step 3. The real fix is a text-free
  variant of those two cards, which is Stephen's call, and Poki's guidance says
  thumbnails should carry no text at all anyway.
- **Bloom Breaker's marketing play frame is a dark table.** It is the busiest frame the
  round had; the game is simply dark until bricks start breaking. Honest, not flattering.
- **Nothing has been tested on a real device.** Everything here is headless Chrome at
  375x667. `feedback_device_testing_default` applies.
- **`A 214x28` under 48 px on all ten GameMonetize builds** and none of the ten
  GameDistribution ones. It is an anchor the GameMonetize SDK injects. Not ours.
- **I did not add CrazyGames or Poki targets to the builder.** Both pitches say exactly
  what each would need. Neither can take a ZIP from `publish/dist` as it stands, because
  a rival network's ad SDK is a third-party ad system to both of them.

---

## 6. Two things that need Stephen, not code

1. **Four of our best casual games cannot be lost.** Seed Pot, Hexa Hive, Merge Blast and
   Inkbound came off the ten because a careless player never reaches a round end. Seed
   Pot's pot was *emptier* after ten minutes and 1,500 dropped seeds than after one,
   because merging clears faster than dropping fills. Hexa Hive rebuilds the comb on
   every hive clear. The builder puts the ad break on the round end because that is where
   both networks want it, so these four would serve about one ad an hour. They need a
   second break at a level clear or a milestone. That is a design decision.
2. **Poki prefers web exclusivity, five years, and Discord and YouTube Playables count as
   web.** Anything sent to GameDistribution or GameMonetize can therefore only be their
   non-exclusive flat licence fee. The letter in `PITCH-POKI.md` says so out loud, because
   they hand curate and they check. If he wants the exclusive deal instead, the honest
   move is to hold the next title back for it. Read the exclusivity section before sending.

---

## 7. If you want to extend it

- **A recipe for a new game:** copy `publish/recipes/bloom-breaker.mjs`, use
  `node publish/tools/scout.mjs <slug>` to find the ids, iterate with
  `node publish/tools/pub_verify.mjs publish/dist/<slug>-gd.zip --offline` (blocks the ad
  stack, much faster), then sign it off with a run **without** `--offline`.
- ⛔ **Green offline is not green online.** Bloom Breaker passed with the SDK blocked and
  failed with it live, because the preroll delays the first frame and a single early tap
  landed before there was a ball. Always finish with a live run.
- ⛔ **A touch that ENDS on a button activates it.** Bubblenaut's game-over card opens
  under the thumb holding the movement pad, so a long hold released onto "Back" and
  walked the harness back to the title screen, twice. Use keys where the game documents
  them.
- ⛔ **`getBoundingClientRect` returns a size for an element below the fold.** Jimothy's
  How to play button sits at y 1028 on a 667 px screen. `h.tapSel` scrolls into view
  first; a "visible" check that ignores the viewport will loop forever tapping nothing.
- ⛔ **Do not fan recipe writing out to parallel agents on this box.** I tried nine and
  got zero files in forty minutes: the concurrency cap is two, and each agent ran its own
  Chrome. Serial was faster.

---

## 8. The commits

```
6cf67a8f  step 1: the ten, picked and looked at
94d7f0d6  step 2: twenty ZIPs, every one played to its round end headless
f04540bd  step 3: fifty marketing images
7f484ff8  step 4: Jimothy 400.7 MB -> 54.3 MB
d477c8f6  step 5: the CrazyGames and Poki pitches, and the two replies
```

Not deployed. Not pushed to main. `publish/QUEUE.md` is the document to read after this
one; it carries the evidence for every number above.
