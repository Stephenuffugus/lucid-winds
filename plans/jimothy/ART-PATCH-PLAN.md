# Jimothy art patch: the plan

**Trigger:** when Stephen says "we're going to fix Jimothy" (or "the art patch"), read this file top to bottom, then
start at Part A or wherever the state block says. Written 2026-09-18 (release day) by the session that did the
pre-release art pass, while every fact was fresh. Everything here was run, not assumed.

---

## 0. Where things stand (2026-09-18 13:45 UTC)

- **Web is fixed and live at ARTV 56.** 55 frames recut or cleaned from Stephen's frame review, in three deploys
  (`25abe737`, `a87931c0`, `b65ef77f`, `075a03a5`), plus `d67c6e01`: the ORIGINAL Jimothy hopped BACKWARDS (his `run-l` and
  `run-r` paintings were in each other's slots; swapped at file level, atlas repacked, proven with `?shtest=1` hop shots). The list is `plans/jimothy/art-patch-done-sep18.txt`.
  ⛔ **Never overwrite a frame on that list with a raw recut.** Several were hand fixed after the recut: pink removed,
  strays erased, and Disco ko and Robot ko had a third LEG cut off. A recut puts the leg back.
- **RELEASED: Stephen said "its released" on Sep 18 about 14:08 UTC.** Steam build r8 (v9.3) is what players have, and it still
  has the OLD art and the backwards hop. The art patch is a new zip, r9 (Part D). He began remaking the 7 frames the same minute.
- **DONE Sep 18 15:15 UTC, web ARTV 58:** Part A (his EIGHT remakes are in: the seven plus a bonus Robot ko, every one limb counted,
  commit `e655d62e`) and MIKOTHY JACKSON, the 46th character, the moonwalk skin (commit `dcaede3f`, gate `test/moonwalk-check.mjs`).
- **✅ Part D BUILT Sep 18 15:35 UTC: `jimothy-steam-build-20260918-r9-v94-art-mikothy.zip`** in vault release `vault-20260904` (asset id
  572912850, 357,938,451 bytes, 93 files, exe at the zip root, sha256 `b8f3a7fbbca040a498303b38802bdc54df00400b9b1278e4feaa53ae33b94cf6`).
  Game v9.4 (SWV 89): 63 fixed frames, the original Jimothy's backwards hop fix, Mikothy Jackson, and THE WHOLE CREW made earnable
  (`crewTotal()`, `test/crew-check.mjs`). Checks run ALONE on a quiet box: runtime_preflight 5/5, steam_bootprobe clean + A/B holds,
  electron_boot OK, and the asar opened: v9.4, Mikothy + the moonwalk rule, the crew fix, the commerce flag, no atlas, nine frames byte
  equal to the tree, all 19 Mikothy frames. Workspace untouched by the build (git status empty).
  **✅ LIVE ON STEAM Sep 18 about 16:15 UTC (his words: "okay its live now"): BuildID 25394827 on `default`.** His first browser upload
  failed and the retry worked. What tripped him, for next time: the UPLOAD page's branch dropdown lists beta branches only, so "none"
  is the only choice there and that is normal; the build is set live on the BUILDS page (https://partner.steamgames.com/apps/builds/5043360:
  row, `default`, Preview Change, Set Build Live Now, phone confirmation, required now that the app is released). Publish is for
  settings and had nothing in it. A fallback zip `...-B.zip` at normal compression sits in the vault too (identical contents); future
  zips: plain `zip -r -q`, not `-9`, so a zip never differs from the ones that uploaded before.
  Recipe that worked, 17 s build: scratch root `/tmp/steambuild`, `rsync -a --exclude app --exclude node_modules --exclude dist store/jimothy-steam`,
  PARENT-only symlinks `satellites`, `sunbeam-sdk.js`, `node_modules` (so `scripts/steam_bootprobe.mjs`, copied in, can import puppeteer),
  caches to /tmp, `npm ci`, `npm run dist:win`, `python3 -m http.server 8777` from the scratch root for the preflight.
- **Left to do:** B. about 278 frames where the old cutter deleted painted effects (show him first). (superseded note on D:) the Steam zip r9, which now
  carries: 63 fixed frames, the original Jimothy's backwards hop fix, and Mikothy. ⛔ Steam r8 has none of it.
- Release state is whatever HE says it is. If anything in the store state matters, ask him; do not infer it.

## The frame numbers on the Triage page (⛔ NOT the skin doc order)

`1 idle, 2 crouch, 3 leap, 4 land, 5 run-l, 6 run-r, 7 dash-run, 8 flee, 9 coffee, 10 magnet, 11 umbrella, 12 shield,
13 scared, 14 sit, 15 eat, 16 cheer, 17 dizzy, 18 splash, 19 ko.` When he says "number 19" he means `ko.png`.
Display names are not folder names: River Otter = `chars/otter`, Dr. Jimothy = `skins/grad`, Jimothy MD = `skins/labcoat`,
Little Green Jimothy = `skins/alien`, Froggothy = `skins/froggery`, Sharkothy = `skins/shark`, Cardboard Knight = `skins/knight`.
The page's `CHARS` array is the truth: `Artifact read` it if in doubt.

---

## Part A. The 7 remakes (his paint, my cut). Target: 10 minutes of my time per frame.

| # | Character | Frame | File | What is wrong |
|---|---|---|---|---|
| 1 | Sasquatch | 19 knocked out | `chars/sasquatch/ko.png` | three arms |
| 2 | Sasquatch | 13 scared | `chars/sasquatch/scared.png` | two right arms |
| 3 | Soggy Jimothy | 19 knocked out | `skins/soggy/ko.png` | five hands |
| 4 | Nordic Jimothy | 19 knocked out | `skins/nordic/ko.png` | five hands |
| 5 | Hard Hat Jimothy | 11 umbrella | `skins/hardhat/umbrella.png` | three arms |
| 6 | Hard Hat Jimothy | 19 knocked out | `skins/hardhat/ko.png` | five legs |
| 7 | Scoutmaster Jimothy | 19 knocked out | `skins/scout/ko.png` | six legs |

Optional eighth: Garage Band 16 cheer is usable but still has orange glow beside him.

**His side (phone is fine).** All 7 are ALREADY MARKED on the Triage page with his notes
(https://claude.ai/artifact/Ue7WnxqxAWqCMyQoZWpPzZ, filter "Marked"). Each marked frame opens a kit:
1. Copy the prompt (it carries the character block, that frame's pose, and his "what is wrong" note).
2. Save the reference sheet and the frame crop, attach both to the same ChatGPT message.
3. Upload what ChatGPT made, as many tries as he likes, tap the one to use.
The prompt asks for ONE square frame on flat magenta `#FF00FF`, a clear margin, no ground, nothing detached, no pink in the art.
If the page gives him trouble, he can instead drop the PNGs in `satellites/stream-hop/art-drop7/` or send them any way he likes.

**My side, per frame:**
```
# 1. collect: ArtifactData list collection=flags  ->  frames.<f>.pick (an asset id)  ->  Artifact read url=<page> path=<id>  (saves locally)
cd /workspaces/lucid-winds/satellites/stream-hop
python3 scripts/cut_single.py <saved.png> --like assets/skins/soggy/ko.png --out /tmp/remake/soggy-ko.png --contact /tmp/remake/soggy-ko-look.png
# 2. OPEN the contact image (old | new on dark, old | new on light). Then and only then:
cp /tmp/remake/soggy-ko.png assets/skins/soggy/ko.png
```
`cut_single.py` (tested 2026-09-18: a known-answer run against the sheet cutter's own Soggy ko, IoU 0.95; two planted bad
inputs refused) keys exactly like `cut_sheet.py`, trims, pads 3 px, scales the HEIGHT to the frame it replaces, removes
pink key residue, and refuses an image with no flat border or a figure touching the edge.

**The look, every time, before the copy.** Name three things wrong before he does:
- COUNT THE LIMBS. Two arms, two legs, one tail, five fingers a paw. This is the whole reason for the remake.
- Wardrobe and props against the reference sheet (each skin doc locks them: hat, cape, rope, bag, satchel...).
- Same scale of head as its neighbours, no ground or shadow, nothing detached, no pink fringe on the light ground.
- If the shape is very different from the old frame the tool warns: the game draws by height, so a much wider frame draws smaller.
If a remake fails the look, say so plainly and ask for another try. Never ship a frame with the wrong limb count again.

---

## Part B. The restored-paint sweep (about 278 frames). ⛔ Show him before swapping.

**What it is.** The frames live today were cut by an OLD version of the cutter that deleted anything pink-ish or near the key:
water splashes, coins, flowers, swirl rings, dome pixels, a purple bandana, the Harbor Seal's umbrella edge. The current
`scripts/cut_sheet.py` keeps them. Measured 2026-09-18 with `scripts/recut_match.py`, 774 frames compared within their own
character: **278 RESTORE, 441 SAME, 26 LIVE+ (live has more paint: leave alone), 29 REMADE (repainted later: leave alone).**
By pose: magnet 25, ko 24, dizzy 23, umbrella 20, flee 18... 61 of the 278 also bring back more than 300 px of HOT PINK
effects, which he hates ("so much pink in the swooshes", "neon pink behind its feet").

**Why it was not done on release day:** he had just reviewed every frame as it is and said most skins are good. The change
is real but subtle, and it touches a third of the art. It is his call, on a page he can flick through.

**Steps:**
1. **Sources to /tmp (never /workspaces, the disk is at 89 percent; /tmp has 40 GB).** Release `backup-2026-07-29` in
   `Stephenuffugus/lucid-winds-vault`:
   ```
   mkdir -p /tmp/jim-src && cd /tmp/jim-src
   env -u GITHUB_TOKEN -u GH_TOKEN gh release download backup-2026-07-29 -R Stephenuffugus/lucid-winds-vault -p "vault-assets-20260729.tar" -p "vault-misc-20260729.tar"
   tar -xf vault-assets-20260729.tar "assets/assets/Jimothy skins-20260723T030554Z-1-001.zip" && mkdir -p skins723 && (cd skins723 && unzip -o -q "../assets/assets/Jimothy skins-20260723T030554Z-1-001.zip")
   tar -xf vault-misc-20260729.tar --wildcards "*art-drop5*" && mkdir -p z && (cd z && unzip -o -q ../satellites/stream-hop/art-drop5/0moreskins-sheets-2026-07-24.zip)
   ```
   `skins723/Jimothy skins/N/Na.png + Nb.png` = skin doc number N (1 deckhand ... 29 shark). `z/0moreskins/<name>1.png + 2.png`
   = the 13 later skins. The Barnacle's sheets are in the tree (`art-drop6/The Barnacle`). **Chicken Suit has no source anywhere.**
2. `scripts/recut_all.sh` (about 6 minutes, 2 cores, run it alone) then `python3 scripts/recut_match.py` -> `/tmp/jim-all/match.json`.
3. Build the candidate set: `cat == RESTORE`, minus everything in `art-patch-done-sep18.txt`, minus every `shield` (the
   shield sweep is DONE: 17 domes recut; the 8 where live has more paint were left alone on purpose).
4. For each candidate: take the matched recut cell, then `depink` it (⛔ never a shield). That gives "today's look plus the
   paint the old cutter deleted". `run-l`: mirror the new `run-r`, EXCEPT Market Day and Scoutmaster, which have real
   left-run paintings (leave theirs).
5. **Review page for him** (an Artifact, like the Triage page; its source is in `plans/jimothy/frame-triage/`): per character,
   live above, new below, on the dark street colour; a tick per character plus a tick per frame to veto; default = accept.
   Load `artifact-design` and `artifact-capabilities` first. He reviews on his phone: big tiles, 48 px targets.
6. Apply what he accepted. I still LOOK at every accepted frame on a contact sheet by pose before the copy: the matcher
   measures pixels, it cannot see a wrong pose or a returned extra limb.
7. Part C.

**Known fixes that ride along in this sweep:** Harbor Seal umbrella (clipped left), Skunk flee (tail, only if its recut is
not flat: it was still flat on Sep 18, so probably source-clipped).

---

## Part C. Ship to the web (5 minutes, done three times on Sep 18)

```
cd /workspaces/lucid-winds/satellites/stream-hop
# bump ARTV in index.html: the one `var ARTV='NN';` AND every `?a=NN` (5 of them, one is the atlas map tag; the check holds them equal)
node test/jimothy-check.js                       # must say 60 passed (or whatever the count is then), 0 failed
cd /workspaces/lucid-winds && git fetch origin main -q && git log --oneline HEAD..origin/main   # must be empty
git add satellites/stream-hop/assets/chars satellites/stream-hop/assets/skins satellites/stream-hop/index.html   # fenced add, never -A
git commit ... && git push origin add-sproing-jumper && git push origin add-sproing-jumper:main
```
Then PROVE it, about a minute later: the live `index.html?probe=$RANDOM` carries the new ARTV; `md5sum` of several live
`assets/<frame>.png?a=<ARTV>` equals the tree; boot the live page in headless Chrome at 412x915 and require zero console
errors and zero failed requests (`/tmp/jim-fix/boot.mjs` was the 20 line script; rewrite it if /tmp is gone).
`chars/` and `skins/` are NOT in the art atlas, so no `pack-atlas.py` run. `hero/` IS: if a hero frame ever changes, repack.
The service worker is network-first with real revalidation: an ARTV bump is enough, no SW version bump for art alone.

---

## Part D. The Steam art patch (my half 10 to 15 minutes, his half a few minutes)

"Re-vendor" just means: copy the current web game into the Steam package before building. It is the same flow as every
upload so far. Steam blocks codespace logins, so HE uploads; I build the zip.

1. Build in a SCRATCH TREE so the workspace disk is spared (recorded in memory `project_jimothy_steam_build_sep04`):
   `scratchpad/steambuild/store/jimothy-steam` with **only the PARENT dirs symlinked** (`satellites`, `sunbeam-sdk.js`).
   ⛔ Never symlink `assets` itself: `vendor.sh` does `rm -rf` and once deleted the live atlas through a symlink.
   `git status` in the real repo after every vendor. Caches to /tmp: `npm_config_cache`, `ELECTRON_CACHE`,
   `electron_config_cache`, `ELECTRON_BUILDER_CACHE`. `rsync` without `app/ node_modules/ dist/`, then `npm ci`, then `npm run dist:win`
   (that runs `vendor.sh` first, which strips the atlas and asserts `__STEAM_BUILD`).
2. Checks, alone (they flake when another headless browser is running): `python3 -m http.server 8777` from the scratch root,
   `node store/jimothy-steam/runtime_preflight.mjs`, `node scripts/steam_bootprobe.mjs`. Spot check that a fixed frame in
   `dist/win-unpacked/resources/...` has the new bytes (use `require('@electron/asar').extractFile`, never `npx asar extract-file`).
3. Zip with the exe at the ZIP ROOT, name it `jimothy-steam-build-<date>-r9-art.zip`, upload to vault release `vault-20260904`,
   record sha256 and file count.
4. Hand him a SIGNED link (his phone cannot fetch a private vault asset by its page URL):
   `curl -sI -H "Authorization: token $(gh auth token)" -H "Accept: application/octet-stream" <asset api url>` and give him the `location:` URL. It expires in minutes: make it when he is ready.
5. His clicks: partner.steamgames.com/apps/depotuploads/5043360 (depot 5043361) -> upload the zip -> Builds -> set live on `default`.
   A patch to a released game goes live when he sets it live; no review wait for a build update. If Steamworks shows something
   different, believe the screen, not this line.
6. One patch, not two: wait for his remakes (Part A) unless he says ship now.

---

## What cannot be fixed by cutting (so nobody burns an hour on it again)

- The shield domes of Little Green, Astronaut, The Barnacle, Disco, Froggothy, Hazmat, Mothman, Robot, and Hazmat's idle hood:
  the PAINTING runs off its own sheet edge. A recut is byte identical to live. The missing sliver is 3 to 8 px (under 2 px on
  a phone). A mirror repair was built, looked ragged beside the painted rim, and was deleted. Fix = a repaint, only if he cares.
- Chicken Suit shield: same clip, and no source sheet on this box or in the vault. His Drive may have it.

## Traps, each one paid for on Sep 18

- ⛔ **Orca's sheet files are swapped** (`25a.png` is the B sheet) and Trash King's cells are in another order. A blind recut
  staged Orca's EAT pose as "shield". Only the three-way look (source | live | recut) caught it. `recut_match.py` now matches by looks.
- ⛔ **Match within a character.** Global matching pairs one purple dome with another character's.
- ⛔ **Never `depink` a shield** (violet dome, magenta sparks: it punches holes). Painted pink effects exist; only flagged or
  approved frames get depinked.
- ⛔ **Missing PAINT is never residue.** A missing face, bandana or dome means recut from the source, not clean up.
- ⛔ A flat edge on a sprite is not always a cut fault: check whether the recut has it too. If yes, the painting is clipped.
- ⛔ The Triage page showed his marks as empty because he only LOOKED there; he dictated the list. Take his list verbatim
  first, map numbers with the table above, and say back what each number means before editing a file.
- ⛔ Headless Chrome skips the synthesized click of the first tap after a screenshot followed by touch drags. Shoot on a separate page.
- The game draws every frame at a FIXED HEIGHT with width by aspect (`drawSprite`). A taller bbox (a restored dome, a whole
  top hat) draws the character a touch smaller. That is correct and the same for every frame; do not "fix" it.
- System clock is UTC. He is US Eastern.

## Tools (all in `satellites/stream-hop/scripts/`)

| Tool | Use |
|---|---|
| `cut_sheet.py` | the 3x3 sheet cutter (current, good) |
| `cut_single.py` | one remade frame on magenta -> game PNG, with a look sheet |
| `depink.py` | pink key residue out of NAMED frames; importable `depink(src, out, extra=..., fringe=, orphan=)` |
| `recut_all.sh` | recut all 43 source sheet pairs into `/tmp/jim-all/cut` |
| `recut_match.py` | match recut cells to live frames by looks, within character; RESTORE / LIVE+ / REMADE / SAME |
| `cut_fault_audit.py` | find flat-sliced edges, strays, key residue, odd sizes across all 856 frames |

## The moonwalk skin: SHIPPED on web as `mikothy`, "Mikothy Jackson" (his name for it), Sep 18 15:15 UTC

What shipped: 19 frames from `art-drop7/mikothy-a.png` + `mikothy-b.png`; run-r and run-l are THE GLIDE cut from his flee painting
(body only); `moonwalk:1` = the one named exception in `heroPose` (shows the file facing AWAY from travel); SECRET lane, found by
`MOONWALK_HOPS` = 50 real backwards hops ever (`PROG.backHops`); CONTENT-MAP.md updated. Gate: `node test/moonwalk-check.mjs`
(14 checks in the running game; `--plant` must fail exactly the two direction checks).
⚖ HIS CALLS, each a one-line change: the number 50; the lane (secret); the display name. I told him twice that a real person's
surname in a paid store build is a right-of-publicity and trademark risk and that "Mikothy" alone carries the joke; he chose the
name, it is his call, do not change it without him. Known art variance, not blocking: the glove changes paws between frames and
about six frames show two gloves.

### (history) the sheet ask

Skin doc: `satellites/stream-hop/art-sheets/skin-docs/30-kingofhop.txt` = Google Doc in 012Assets
(https://docs.google.com/document/d/1rQ1-GI_b5jxjNyZsk1d-r9wpfoKjFp_u710--sA9kVU/edit). Working name "The King of Hop", id `kingofhop`,
sheets 30a + 30b, all 18 frames upright dance moves, ONE glove on the LEFT paw, limb count written into the sheet rules.
When the sheets arrive: `cut_sheet.py 30a 30b --out assets/skins/kingofhop --contact ...`, LOOK, count limbs, then the roster entry
with `moonwalk:1`, the named exception in `heroPose`, the unlock lane he picks, CONTENT-MAP.md in the same commit, a jimothy-check law.
⛔ The code word MOONWALK is TAKEN (Astronaut Jimothy, and the first soundtrack song).

The backwards hop gave him the idea: a Michael Jackson tribute Jimothy that really does hop backwards, as a moonwalk.
How it would work here: a per-character flag (say `moonwalk:1`) that shows `run-l` on right hops and `run-r` on left hops,
with a slide instead of a leap arc. Facing is otherwise a FILE-level rule (see the ⛔ note in `heroPose`), so this must be an
explicit, named exception for one skin, never a general flip.
⛔ Tell him plainly before any art is made: a real person's name or likeness in a paid store build (Steam, Play) is a
right-of-publicity and trademark risk, and that estate enforces. The safe version is a tribute by costume and move only:
one sequined glove, fedora, white socks, short trousers, the moonwalk; no name, no face, no song. A name like "Moonwalk
Jimothy" carries the joke. His call.

## His open calls

1. Part B: does he want the deleted effects back at all? Default: yes, after he flicks through the review page.
2. One Steam patch after the remakes, or an art-only patch now and a second one later? Default: one patch.
3. Garage Band 16 cheer: remake, or live with the orange glow? Default: live with it.
4. The eight source-clipped domes: repaint or leave? Default: leave.
