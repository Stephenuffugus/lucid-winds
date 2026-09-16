# AUDIT: everything Opus did on Sep 16, 2026 (13:45 to 20:30 UTC), for Fable to check

Stephen switched this session to Opus for the build work. He asked for Fable's judgment on the Steam
controller fixes, and Opus kept building instead of stopping so he could switch. **Treat every claim
below as unverified until you have checked it yourself.** This file lists what was done, where it is,
how to check it, and what Opus knows it did NOT check.

Ground rules for the audit:
- **Work alone.** No Agent, no Workflow, no subagents.
- **One headless browser at a time.** The box has 2 cores, and parallel browsers make gates flake.
- **Branch:** everything is on `add-sproing-jumper`.
  - "LIVE" means it was also pushed to `main`, which the host serves.
  - Deploy commits were built on `origin/main` with fenced paths; check each deploy's diff.
- **Release context:** Jumping Jimothy releases on Steam **Fri Sep 18, 10:01 EDT**, and Stephen presses the
  button.
  - The approved build on Steam today is **r4**.
  - **r5 is NOT uploaded.** It sits in the vault waiting for this audit.
- **Disk:** the workspace disk is at 94%, so build anything big under `/tmp`.

Quick map (newest first):

| # | What | Where it is now | Commits |
|---|---|---|---|
| 1 | Jimothy controller v2, crisp canvas, Steam overlay, store-build hiding | LIVE on web; in r5 | `04b6ef43`, `53b8ee8c`, deploy `2aa13b02` |
| 2 | Jimothy Steam build r5 (the zip) | private vault, NOT on Steam | built from `2aa13b02` |
| 3 | Fable review of #1 (13 agents total across two workflows, see §9) | this repo, as data | `plans/jimothy/fable-review-sep16.json` |
| 4 | Phone art remake page (private claude.ai artifact) | published page + db | sources in `plans/jimothy/frame-triage/` |
| 5 | Steam `vendor.sh` strips the web art atlas | branch; used by r5 | `fae86e42` |
| 6 | Blockspace: leaving it hung the tab | LIVE | `3b641291`, deploy `8164a7f1` |
| 7 | Cloudflare cached 429s: new image URLs | LIVE | `2f86131a`, deploy `d74bf2ff` |
| 8 | Whistlestop puzzles 7 to 12 | LIVE | `31e93dc8`/`b83268bc`, `58eeb381`/`626fbca9`, `68832960`/`c6d844c6` |
| 9 | Jimothy Lane D: image atlas (first visit 141 to 24 requests), splash JPEG | LIVE | `e1ae0da4`, `c64221ce`, deploy `8b13326a`; `02ecb8e0`, deploy `d8dfe09c` |
| 10 | Board and handoff text | branch (board also on main via `2aa13b02`) | `START-HERE.md`, `HANDOFF-OPUS-SEP15.md` §10, plan files |

---

## 1. Jimothy controller v2, crisp canvas, Steam overlay (HIGHEST PRIORITY, it ships Friday)

**Why:** Stephen's first real Steam install (Jessie's Windows laptop, PDP Afterglow wired Switch pad).
- **Notes:** his notes, verbatim, and the sorted causes are in `plans/jimothy/HANDOFF-STEAM-PAD-SEP16.md` §1 and §2.
- **Symptoms:** Y selected, B did nothing, the D-pad was dead, the cursor could not reach off-screen items,
  there was no way to stop the music, menus lagged, the stick hopped sideways, and the picture was soft.

**What changed** (`git show 04b6ef43 53b8ee8c -- satellites/stream-hop/index.html store/jimothy-steam/main.js`):
- **The GAMEPAD block** inside `boot()` in `satellites/stream-hop/index.html` (search `GAMEPAD v2`) was rewritten.
  - Buttons are read by label:
    - `XBOX` for the standard mapping.
    - `NIN_STD` for a Nintendo pad under the standard mapping, which assumes Chromium maps it by position.
    - `NIN_HID` for a raw Switch-style pad, order Y B A X.
    - `nintendo(id)` guesses the family from the id: vendor `057e`, PDP `0e6f` products `018x` to `01fx`,
      PowerA `20d6` products `a7xx`, or the words nintendo/switch/pro controller/joy-con.
  - **D-pad hat:** a raw pad's D-pad is decoded from a hat axis (`hatDirs`). An axis becomes a hat once it reads
    beyond ±1.01, and it un-marks on an off-lattice value.
  - **Stick axes:** they count only after resting near 0 (`calm`). An axis parked at ±1 for 0.8 s stops counting
    (`park`).
  - **Targets:** gathered only when a button fires (no per-frame scan). `.toggle` rows and `.musrow` are included,
    as are cards clipped by a scroll container.
  - **Follow:** `follow()` scrolls the focused element's container, and `page()` scrolls text screens.
  - **B:** `backOf()` checks, in order, the overlay "commit to nothing" buttons, then `BACK_IDS` per screen, then
    words.
    - `s-clear` goes to `cl-next` (the same as the browser back handler).
    - `s-intro` skips.
  - **Buttons:** Minus/View toggles music. The Settings row `set-padswap-row` (the "swap A and B" switch) shows
    once a pad is seen.
  - **In a run:**
    - The stick latches its dominant axis (fires at 0.6, re-arms below 0.35).
    - A held stick must come home after a screen change.
    - A sideways stick repeats at 450 ms.
    - A hops forward.
    - The menu ring is hidden during the whole play screen.
  - **Pad choice:** the most recently used pad wins (`timestamp`).
  - **Default focus:** never `go-continue` or `bin-pull`. It prefers `go-retry` on game over and `cl-next` on level
    clear.
- **`sharpen(s)`** is called from `fit()`. The canvas backing store becomes `540 * dpr * s`, capped at 2.5x.
  - A paused frame is copied across the resize.
  - `imageSmoothingQuality='medium'` is set after each resize and at boot.
  - A 500 ms poll re-fits when only `devicePixelRatio` changes.
- **`revealBadge(a)`:** tapping a badge opens the existing reveal card with its name, description and status.
- **`confirmRevive()`:** now skips its confirm only if `LW_ADS.live===true`. ⛔ **This changes web and touch
  behaviour too.** Before, the always-present ad stub skipped the confirm, so tapping "Keep going · 25 caps" spent
  at once. Now every build asks first.
- **Store builds** (`isStoreBuild()`) hide `b-install`, `go-install` and `pz-feedback`. `installAvail()` and the
  game-over install nudge skip store builds.
- **How to Play** has a controller row.
- **`OVERLAY_CLOSE`** includes `reward-later` and the web-only `sws-music-later`.
- **`store/jimothy-steam/main.js`:** `electronEnableSteamOverlay(true)` turns off steamworks.js's own 60 Hz
  `setInterval(invalidate)`. The unpacked library source was read. The window gets a 30 Hz nudge instead
  (`OVERLAY_NUDGE_MS = 33`).
- **Stamps:** `BUILD='v9.0'`, `SWV='85'`, `sw.js` `CACHE="jimothy-v85"`, arcade row `/satellites/stream-hop/?v=v82`.

**How to check:**
```bash
cd /workspaces/lucid-winds/satellites/stream-hop
node test/gamepad-check.mjs      # 65 laws, ~4 min, expect GAMEPAD OK
node test/jimothy-check.js       # expect OK 60 passed (section J is new)
cd ../.. && node test/sw-lockout.mjs   # expect 25 ok
# watch the new laws fail on the code before the change, then restore:
cd satellites/stream-hop && cp index.html /tmp/idx.now && git show fae86e42:satellites/stream-hop/index.html > index.html \
  && node test/gamepad-check.mjs | grep -c FAIL; cp /tmp/idx.now index.html && git diff --stat -- index.html   # diff must be empty
# live bytes equal the tree (one request per file, random query):
curl -s "https://lucidwinds.com/satellites/stream-hop/index.html?p=$RANDOM" | cmp - satellites/stream-hop/index.html
```
Opus measured: the old code fails 27 of the laws (it stops early at the swap step), and the pre-review code
(`04b6ef43`) fails 11. Both plants were run and the file restored.

**Look hard at these (Opus's own judgment calls, not proven on hardware):**
1. **Afterglow layout:** the Y B A X HID order and the hat on axis 9 with neutral 9/7 are what Chromium on Windows
   reports for a raw Switch-style pad. This comes from knowledge, **not from Stephen's actual pad**. The pad's real
   `navigator.getGamepads()[0].id`, `mapping`, `buttons.length` and `axes` were never read. If the id does not
   match `nintendo()`, the buttons fall back to Xbox order, which is the original bug (Y selects). The Settings
   swap only swaps A and B.
2. **`NIN_STD` assumption:** it assumes Chromium's standard mapping for a Pro Controller is positional. If
   Chromium maps it by label, A and B are backwards on real Pro Controllers.
3. **Steam Input:** with Steam Input on, a pad arrives as an Xbox 360 XInput pad and none of the Nintendo logic
   applies. Steam then decides the layout.
4. **Revive confirm:** the `confirmRevive` change is a web and touch behaviour change two days before launch.
5. **Level clear:** B goes to the next level, not the menu.
6. **Canvas cap:** the 2.5x cap means about 2.6 MP per frame on a 4K TV. There is no fallback if a weak GPU
   struggles.
7. **Overlay nudge:** 30 Hz was chosen without Steam running. Nobody has seen the Steam overlay or an achievement
   toast with this change.
8. **Web popups in the gate:** the gate closes the web-only daily reward and song card during setup. Check that
   this does not hide a real problem.
9. **Two known bugs are only asserted by reading the code:** the Prize Bin tap-to-buy spend without a confirm, and
   the `buyChar`/`buyFin` paths. Neither was changed.

**Not verified at all:** a real controller, a real Steam client, a real Windows GPU, the Steam overlay.

## 2. Steam build r5 (the zip Stephen would upload)

- **File:** `jimothy-steam-build-20260916-r5-controller.zip`, 354,535,531 bytes, 93 entries, exe at the root.
  - sha256 `db63e0215f3d5c1a9d73f02a3e07d0703a5a386b93e650fef062a0b59034fc06`.
- **Location:** GitHub release `vault-20260904` in `Stephenuffugus/lucid-winds-vault`. `SHA256SUMS.txt` there was
  updated.
- **How it was built:** in a scratch tree, not the workspace.
  - The tree was `/tmp/.../scratchpad/steambuild/store/jimothy-steam`, holding a copy of `store/jimothy-steam`
    plus symlinks `satellites` and `sunbeam-sdk.js` to the repo.
  - Commands: `npm ci`, then `npm run dist:win` (vendor.sh, then electron-builder 25.1.8 with Electron 32.3.3,
    then `tools/brand_exe.mjs`).
  - All caches were pointed at `/tmp`.
- **Checks Opus ran:**
  - `node test/electron_boot.mjs` gave ELECTRON BOOT OK.
  - `runtime_preflight.mjs` with a server on :8777 at the scratch root: 5 pass, all 3 routes walked.
  - The packed `app.asar` holds `BUILD 'v9.0'`, `GAMEPAD v2`, and main.js with `electronEnableSteamOverlay(true)`
    and `OVERLAY_NUDGE_MS = 33`.
  - A raw-pad smoke on the vendored `app/index.html`: splash, A, title, D-pad, settings, minus, B, badge card.
  - The zip round-trips: exe and asar are byte-equal.
- **How to check without the scratch tree:**
```bash
env -u GITHUB_TOKEN -u GH_TOKEN gh release download vault-20260904 -R Stephenuffugus/lucid-winds-vault \
  -p jimothy-steam-build-20260916-r5-controller.zip -D /tmp/r5 && sha256sum /tmp/r5/*.zip
cd /tmp/r5 && unzip -q *.zip -d x && node -e "const a=require('/workspaces/lucid-winds/node_modules/@electron/asar');const h=a.extractFile('x/resources/app.asar','app/index.html').toString();console.log(h.includes(\"var BUILD='v9.0'\"), h.includes('GAMEPAD v2'), !h.includes('assets/atlas/map.js'))"
# (if @electron/asar is not in the root node_modules, `npm i --prefix /tmp/asarx @electron/asar` and require it from there)
diff <(unzip -p /tmp/r5/*.zip resources/app.asar | wc -c) <(echo 239152029)
```
- **To rebuild it yourself:** follow the recipe in `~/.claude/projects/-workspaces-lucid-winds/memory/project_jimothy_steam_build_sep04.md`,
  "Rev 5".
- **Not verified:** r5 was never run on Windows, never under Steam, and never with the Steam overlay.

## 3. The Fable review of #1

`plans/jimothy/fable-review-sep16.json` has two parts:
- **`confirmed`:** 22 findings, each re-checked by a second Fable.
- **`by_lens`:** every raw finding, each checker verdict, and what each reviewer checked and found fine.

The script that ran it is `plans/jimothy/fable-review-sep16.workflow.js`.

**Check:** for each confirmed finding, find the fix in `git show 53b8ee8c` and judge whether it actually fixes it.
Two items were design questions and were changed anyway:
- The sideways stick repeat is now 450 ms.
- The overlay nudge is now 30 Hz.

The 4K cap stayed at 2.5. The Prize Bin buy paths were NOT given a confirm; only the default cursor avoids
`bin-pull`.

## 4. Phone art remake page (private artifact)

- **What it is:** https://claude.ai/artifact/Ue7WnxqxAWqCMyQoZWpPzZ (version 3). It is private to Stephen and
  declares the `db`, `assets` and `downloads` capabilities.
  - It shows every frame of all 45 characters.
  - A marked frame gets a three-step kit:
    1. A ChatGPT prompt.
    2. Save buttons for the reference sheet and the one-frame crop.
    3. An upload of ChatGPT's result, stored as an artifact asset.
- **Storage:** marks live in the page db, collection `flags`, one doc per character, shaped
  `{name, folder, frames:{<frame>:{flag,note,tags,remakes[],pick}}, note, updated}`. At the time of writing
  `flags` was empty.
- **Sources** (copied from the session scratchpad, which a new session cannot see): `plans/jimothy/frame-triage/`.
  - `page.src.html` is the page. `build.py` inlines `chars.inline.json`, `docprompts.json` and `wf-out.json`.
  - `make_sheets.py` rebuilds the pictures (they are gitignored).
  - `kit-test.cjs` has 27 laws and runs against `mock.js`, which fakes db, assets and downloads.
  - `dump-prompt.cjs` prints one prompt.
  - Opus rebuilt from the repo copy and got the exact published v3 file; kit-test was all pass.
- **Where the prompt text comes from:**
  - For 28 characters: `satellites/stream-hop/art-sheets/skin-docs/*.txt`, parsed by a script into
    `docprompts.json`.
  - For the other 17: `wf-out.json`, written by 3 agents looking at each character's reference sheet and checked
    by 3 more. These agents ran on the session model (Opus). The script is `workflows/describe-17-characters.js`.
    - Each character has `corrections` and `unsure` lists. **Nobody has compared these descriptions to the art by
      eye except those agents.**
  - The generic pose guide `poses` was also written by an agent.
- **Check:**
```bash
cd plans/jimothy/frame-triage && python3 make_sheets.py && python3 build.py --mock \
  && (node serve.mjs &) && sleep 1 && node kit-test.cjs "$PWD" | tail -2
node dump-prompt.cjs sasquatch 3 ; node dump-prompt.cjs shark 1     # read two prompts end to end
python3 -c "import json;d=json.load(open('wf-out.json'));print(d['blocks']['barnacle']['unsure'])"
```
  Then open `refs/<id>.jpg` for a few of the 17 and compare them to their `wf-out.json` block.
- **Look for:**
  - A description that invents a prop or colour. Any real-person likeness in the text: the Barnacle is a tribute
    and must not be named. Opus grepped and found none.
  - Prompts that contradict themselves. The generic pose guide says "four-square". The prompt now says the
    character's STANCE wins.
  - Whether a phone can really save and upload. This was only tested with the mock.
  - Clean up afterwards: `rm -rf sheets refs test-upload.png local.html jimothy-frame-triage.html`, and kill the
    :8917 server.

## 5. `store/jimothy-steam/vendor.sh` strips the web art atlas (`fae86e42`)

The desktop build removes `assets/atlas/` and the `<script src="assets/atlas/map.js?a=NN">` tag, with an assert.
Without it, the file:// page would fetch sheets it cannot use and fall back to per-file images.

**Check:** `git show fae86e42`. In the r5 asar, `app/index.html` has no `assets/atlas/map.js` tag and no
`app/assets/atlas/` directory. The grep in §2 covers the tag.

## 6. Blockspace leave hang (`3b641291`, LIVE `8164a7f1`)

`satellites/blockspace/index.html`:
- `pagehide` saves the build and calls `renderer.forceContextLoss()`.
- `pageshow` with `e.persisted` reloads the page.
- Stamp 20260916a appears in index.html and sw.js.
- New gate: `satellites/blockspace/test/leave.mjs`.

**Check:** `cd satellites/blockspace && node test/leave.mjs && node test/check.mjs`. Also check that the reload on a
back-cache return cannot loop, and that a mid-edit build is saved before the context is lost.

## 7. Cloudflare cached 429s (`2f86131a`, LIVE `d74bf2ff`)

**What:** seven arcade image URLs were answering `429` with `cf-cache-status: HIT` at Cloudflare IAD. The fix gives
them new query stamps:
- `portal/index.html`: `_tv` stamp `v=20260916p`, plus the five static images.
- Jimothy: manifest icons, apple icon and two images at `?a=51`; SWV and cache 84 at the time.

**Check:** `git show 2f86131a --stat`, then a single `curl -sI` on a few of those URLs. Do NOT burst. A Cloudflare
"Purge Everything" is still Stephen's to do.

## 8. Whistlestop puzzles 7 to 12 (LIVE, stamp 20260916c)

**What:**
- **New content:** puzzles The Timed Loop, The Figure Eight, Four Stations, The Long Way, Two Loops and The Shunt.
- **New mechanics:** `links` (one lever throws two switches) and `yards`/`drop` (a train leaves its cars).
- **New gate:** a par search in `sim.js --par`, with a 1.0 s minimum flip-window law.
- **Decisions:** `satellites/whistlestop/docs/DECISIONS.md`.

**Check:** `cd satellites/whistlestop && node tools/check.js` (expect ALL GATES PASSED (13)). Also play puzzles 11
and 12 by eye with `node tools/shots.mjs`. Is each one actually solvable and fair for a child?

## 9. Resource use this turn (Stephen asked not to burn resources)

Two workflows ran:
- **Character descriptions:** 7 agents, ~1.49M subagent tokens, 41 min.
- **Fable review:** 6 agents, all Fable, ~1.12M tokens, 60 min.

Opus also used a large amount of main-session context. Earlier in the day Lane D and Whistlestop ran without
workflows.

## 10. Jimothy Lane D (LIVE since 13:56 UTC)

**What:**
- **Atlas:** the six art folders are packed into ten sheets by `scripts/pack-atlas.py`, with the manifest in
  `scripts/atlas-manifest.json`.
- **Cutting:** frames are cut 1:1 in a worker into blob-backed `<img>`.
- **Tags:** `data-g` routes image tags.
- **Fallback:** a dead sheet falls back to per-file loading.
- **Splash:** now a 336 KB JPEG.
- **Stamps:** ARTV 51.

**Check:** from `satellites/stream-hop`, run:
- `node test/first-visit.mjs` (24 requests)
- `node test/atlas-identity.mjs`
- `node test/atlas-look.mjs audit --no-shots`
- `node test/atlas-lockout.mjs`

Each takes a `--plant` flag to watch it fail.

## 11. What Fable should hand back

For each numbered item:
- PASS, FAIL or UNSURE, with the evidence: the command output or the lines read.
- A severity for Friday: blocker, fix before r5 upload, or can wait.

Then say plainly **whether Stephen should upload r5 as is, upload it after fixes (then rebuild r5 per §2), or keep
r4.**
