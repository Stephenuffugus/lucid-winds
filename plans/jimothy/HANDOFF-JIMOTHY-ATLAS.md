# LANE D: JIMOTHY'S FIRST VISIT, 141 REQUESTS TO UNDER 25. Written Sep 16 2026 by Fable for Opus.

**Do this before resuming lane B. It is the one repo side change that protects the arcade in front of a tester.**

## SESSION STATE

- **Status (Sep 16, Opus): LANE D DONE AND LIVE.** D1 and D2 deployed as `8b13326a` (served page, `map.js`, `play-0.png`
  and `sw.js` byte identical to the tree; a live first visit: 26 network requests, 18 to lucidwinds.com, the atlas on, the
  menu glyphs blob backed). D3 (the splash as JPEG) deployed right after. **Next action: nothing in this lane.** The
  Steam patch note at the bottom waits for Stephen after Friday.
- ⛔ WEB ONLY UNTIL AFTER FRIDAY SEP 18. Do not run `store/jimothy-steam/vendor.sh`, do not upload to Steam. Build r4 is
  approved and live; Stephen presses Release App on Friday 10:01 EDT and nothing on Steam changes before that.
- ⛔ **Found while probing live, NOT in this repo: Cloudflare is still serving 429s it cached during last night's
  lockout.** `assets/icons/jimothy-192.png` came back 429, `cf-cache-status: HIT`, `age` 56636 s, empty body, a Hostinger
  CDN request id, and `cache-control: public, max-age=31536000, immutable` (the `.htaccess` image rule stamps that on
  every status). Only some Cloudflare locations hold a poisoned copy (IAD did, EWR did not), so no probe from here can
  clear it. **The fix is Stephen's: Cloudflare, lucidwinds.com, Caching, Configuration, Purge Everything.** The atlas
  sidestepped it for Jimothy's art only because its URLs moved to `?a=51`.

**Measured (local copy, headless, 412 wide, 12 s):**

| | before | after |
|---|---|---|
| first visit network requests | 141 | **24** |
| packed PNGs fetched one by one | 122 | 0 |
| sheets fetched at boot | | 5 of 10 |
| boot art bytes | 12.58 MB (122 files) | 13.54 MB (5 sheets; the boot set grew by the game over and support glyphs, 130 frames) |
| rendered game frame (frozen, seeded) | `a4c2d7ae` | `a4c2d7ae`, byte identical |
| splash art | 2.41 MB PNG | 336 KB JPEG (q88, full chroma, PSNR 39.4 dB; shots `before-splash`, `after-splash` identical to the eye) |
| first visit network bytes | 18.3 MB | about 17.1 MB (13.5 MB of it the five boot sheets; the next largest is a 1.7 MB music track, outside this lane) |

**Gates, all watched red on a plant:** `node test/jimothy-check.js` 52 ok (12 new atlas laws, four plants run in a scratch
mirror through `JIMOTHY_CHECK_ROOT`: changed sprite, stale map tag, packed file as `src`, boot drift);
`test/first-visit.mjs` (plant: an empty map, 142 requests); `test/atlas-identity.mjs` (196 frames and 37 tags, 1:1 and at a
quarter, cut by the worker; plants: one frame moved a pixel, and `--plant-cutter`; built in plant: a canvas copy must
differ at a quarter); `test/atlas-look.mjs`
(the canvas version of the shim was this gate red for real); `test/atlas-lockout.mjs` (worst angle: refused sheets arrive
through the ladder, a dead sheet hands its frames to their files; plant: ladder off). `test/gamepad-check.mjs` and the root
`test/sw-lockout.mjs` 25 ok unchanged. Shots: `plans/jimothy/shots/{before,after}-{title,how,skins,run}.jpg`, opened, identical
in content.

**Decided without him (each one line to reverse):**
1. **Two tiers, not one sheet set per folder.** The six folders hold 18.9 MB; a first visit needs 12.6 MB of it. Packing
   everything into boot sheets would add about 6 MB to every first visit. Boot = what the page itself asks for at boot
   (WARM, the ic glyph table, every `data-g`), read from `index.html` by the packer; the rest loads per folder on demand.
2. **Sheets capped at 2048 x 1024, not 2048 x 2048.** The first pack made a 7 MB play sheet: one long all or nothing
   download and one long decode. Now the play art is four sheets of 1.2 to 3.7 MB. Reverse: `MAXH` in the packer.
3. **A frame is a blob backed `<img>`, not a canvas (section 3 said canvas).** Measured: Chrome filters a downscaled canvas
   differently from a downscaled image (hero/idle at a quarter size, 4077 bytes differ), so the canvas version drew
   crisper, aliased sprites, and `atlas-look` went red on it. A blob backed image is byte identical at every scale.
4. **The image tags go through the atlas too** (the spec had no plan for them, and without them the first visit was 59
   requests): `data-g` plus a MutationObserver, eight string built tags converted, the supporter heart moved off its static
   `src`. The static gate now fails any `src="assets/<packed folder>/...png"`.
5. **A sheet the ladder gives up on hands each frame to its own file** (with the ladder), so a missing or broken sheet never
   costs the art. Watched red first: the earlier build left 0 of 30 menu frames.
6. **When every frame of a sheet is made, the decoded sheet is released** from the cache, so a phone does not hold the
   sheets and the frames at once after boot.
7. **The loader reads the map through `typeof`,** because the root `test/sw-lockout.mjs` (outside this fence) lifts the
   loader into a sandbox with no `window`; there the loader falls back to the per file path that gate tests.
8. **ARTV 50 to 51, SWV and the worker cache 82 to 83, the arcade row v79 to v80,** as section 4 says. Cost: a returning
   player refetches the loose art they use once.
9. **First visit counts network requests only.** The 34 `blob:` copies never reach the edge; the gate prints them apart.
10. **Shots live in `plans/jimothy/shots/`,** not under the game folder, so no bundle ever ships them.
11. **Cutting and encoding run in an inline worker** (OffscreenCanvas, the sheet handed over as an ImageBitmap). Measured
    at 4x CPU throttling, local server: the first build cut on the main thread and added about 1.1 s of long tasks at boot
    (about 460 ms re decoding sheets for drawImage, about 300 ms of toBlob). With the worker, a boot with a run started
    measures the same art ready time as the file path (3.5 s either way), equal or fewer long tasks after the run starts,
    and a lower worst long task (160 to 200 ms against 220 to 240). An idle boot still shows about 380 ms more long task
    total than the file path, which pays no network cost on a local server; on the live site the file path pays 122 round
    trips. No Worker or OffscreenCanvas = the main thread cuts from the bitmap (identity gate plant `--plant-cutter` proves
    that path byte identical too).

**For the Steam patch after Friday (not this run):** `vendor.sh` copies `assets/atlas` (19 MB) and the map tag. A file://
build cannot encode a canvas (every file is its own origin), so each frame would fall back to its file after the sheet was
fetched and decoded for nothing. The patch should strip the map tag in the copy (one line in `vendor.sh`) and exclude
`assets/atlas`, then re run the Steam boot probe. `scripts/build-itch.mjs` needs the same look.

## 1. WHY (measured Sep 16, 12:35 UTC, local copy booted headless at 412 wide, 12 s after load)

| page | requests | bytes | 404s | console errors |
|---|---|---|---|---|
| `/satellites/stream-hop/` first visit | **141** | **18.3 MB** | 0 | 0 |
| `/portal/` first visit, no scroll | 20 | 1.8 MB | 0 | 2 (portalPing CORS, known) |

The host's CDN punishes a visitor who bursts (Sep 15: 143 requests, 33 served, 109 answered 429 with an empty body,
then the address is refused for minutes; Sep 16: the same rule in a softer mood answered 200 with a 19.7 s first byte
on every path). One Jimothy first visit trips it alone, and everything the visitor opens next looks broken. The
arcade itself is not a burst. Jimothy is.

Where the 141 go:

| directory | requests on first visit | bytes | files in dir | typical size |
|---|---|---|---|---|
| `assets/sprites` | 57 | 6.6 MB | 68 | about 320 x 230 |
| `assets/hero` | 19 | 2.2 MB | 20 | about 280 x 200 |
| `assets/ui` | 18 | 1.7 MB | 57 | about 235 x 240 |
| `assets/powers` | 16 | 1.5 MB | 18 | about 320 x 320 or 200 x 200 |
| `assets/how` | 9 | 0.4 MB | 9 | about 170 x 180 |
| `assets/fx` | 5 | 0.5 MB | 25 | about 270 x 200 |
| `assets/jimothy-hero.png` + `family.jpg` | 2 | 2.7 MB | | 1254 x 1254 RGB, no alpha, 2.4 MB as PNG |
| everything else (page, sw, sdk, fonts, firebase, one char, one music, icons) | 15 | 2.6 MB | | |

Every one of the 124 art files is under 360 px on its longest side. They fit in about seven 2048 x 2048 sheets.
**124 requests become 7, 141 becomes about 24.**

## 2. HOW THE LOADER WORKS TODAY (index.html around line 1433)

- `IMG(path)` returns an `Image` synchronously and caches it in `IMGS[path]`; `_st` is 0 loading, 1 ready, -1 failed.
  On error it retries six times (2, 4, 8, 16, 32, 60 s) at a fresh URL. `spr(name)` maps a name like `hero/idle` to
  `assets/hero/idle.png` (a few are `.jpg`, listed in `SPR_JPG`).
- `imgReady(im)` is `im._st===1 && im.naturalWidth>0`. 29 call sites guard on it; drawing goes through
  `ctx.drawImage(im, ...)` (about 17 sites). Finishes (line ~1564) draw `im` into a temp canvas and `getImageData` it.
- `WARM` (line 1649) is the boot list that fires the burst.
- The worker `sw.js` (`CACHE = "jimothy-v82"`) caches at runtime, precaches nothing, and answers a 429 or 5xx from
  cache. A repeat visitor is fine. A first visitor is the problem.
- The art cache buster is `ARTV='50'` on every `assets/` URL.

## 3. THE BUILD

### D1. The packer: `satellites/stream-hop/scripts/pack-atlas.py` (PIL 12.3 is on the box; no new dependency)

- Packs the whole of `assets/sprites`, `assets/hero`, `assets/ui`, `assets/powers`, `assets/how`, `assets/fx`
  (all PNG, all RGBA). Not `chars/` (49 MB) or `skins/` (130 MB): those load one at a time on demand and stay files.
  Not `lanes/`, `zonecard/`, `music/`: JPG, per zone, stay files.
- Deterministic: files sorted by name, shelf packing, 2 px padding, **no trimming** (a frame's w and h equal the
  file's, so `naturalWidth` semantics do not move), sheets no larger than **2048 x 2048** (iOS canvas limits and
  16 MB decoded per sheet). Re running the packer on unchanged input produces byte identical output, so a re run
  shows a clean `git status`.
- Output: `assets/atlas/<dir>-<n>.png` and `assets/atlas/map.js` containing one line,
  `window.JIMOTHY_ATLAS={sheets:["sprites-0","sprites-1",...],frames:{"sprites/coin-cap":{s:"sprites-0",x:..,y:..,w:..,h:..},...}};`
  A script tag, not a JSON fetch: `IMG()` is called at boot and must read the map synchronously.
  `<script src="assets/atlas/map.js?a=ARTV">` goes in the head before the game script; the packer prints the
  tag so the stamp cannot drift.
- PNG with `optimize=True`. Report the sheet bytes against the 12.9 MB of loose files; do not promise a number
  before it is measured. WebP is a later, separate variable.

### D2. The loader shim, in `IMG()` only

```
var ATLAS = window.JIMOTHY_ATLAS || null;    // absent = the old per file path, untouched
var SHEETS = {};
function sheetImg(id){ return IMG('assets/atlas/'+id+'.png'); }   // rides the existing retry ladder
function IMG(path){
  var im = IMGS[path]; if (im !== undefined) return im;
  var key = path.replace(/^assets\//,'').replace(/\.(png|jpg)$/,'');
  var f = ATLAS && ATLAS.frames[key];
  if (f) {
    var c = document.createElement('canvas'); c.width = f.w; c.height = f.h;
    c.naturalWidth = f.w; c.naturalHeight = f.h; c._st = 0; c._tries = 0;
    var sh = sheetImg(f.s);
    var paint = function(){ c.getContext('2d').drawImage(sh, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h); c._st = 1; };
    if (imgReady(sh)) paint(); else (sh._waiters = sh._waiters || []).push(paint);
    IMGS[path] = c; return c;
  }
  ... the existing Image path, unchanged ...
}
```
- The sheet's `onload` runs its `_waiters`. A sheet that fails keeps every frame at `_st = 0`, which is exactly the
  state the procedural fallbacks already draw for, and the retry ladder keeps trying.
- A canvas is a `CanvasImageSource`, so every `drawImage(im, ...)` site works unchanged, including the nine
  argument form. The finishes' `getImageData` reads a same origin canvas and is not tainted. Nothing outside `IMG()`
  changes. **If you find yourself editing a call site, stop: the shim is wrong, not the call site.**
- `imgReady` needs no change: the expando `naturalWidth` satisfies it.

### D3. `assets/jimothy-hero.png` (separate commit, after D1 and D2 are proved)

1254 x 1254, RGB, no alpha, 2.4 MB. Save as JPEG quality 88 (expect well under 300 KB), point its one reference
at the new file, bump ARTV. One variable, one commit.

### D4. Stamps, every time the page or the art changes

`ARTV` in index.html (50 to 51), `CACHE` in `sw.js` (jimothy-v82 to v83), the portal row `?v=v79` to `v80`
(`portal/index.html` line ~1309, that line only), and the head `?v=` if one exists. The existing lint in
`test/jimothy-check.js` says which places it checks; obey it.

## 4. GATES (each watched red on a plant before it counts; never weakened)

- **G1 `test/first-visit.mjs`**: serve the repo on 8777, load `/satellites/stream-hop/` headless at 412 wide,
  wait 12 s, count responses. Law: **at most 30 requests, 0 with status 404, 0 console errors**. Plant: rename
  `map.js` in a scratch copy; the count returns to about 141 and the gate is red.
- **G2 `test/atlas-identity.mjs`**: in the page, for every key in `JIMOTHY_ATLAS.frames`, draw `IMG(key)` and the
  original loose file into two canvases and compare `getImageData` byte for byte. PNG is lossless, so the law is
  **zero differing bytes across every frame**. Plant: add 1 to one frame's `x` in a scratch copy of the map; red.
- **G3** the existing `test/jimothy-check.js` and `test/gamepad-check.mjs`, and the root `node test/sw-lockout.mjs`,
  all green after the change.
- **G4 shots** at 412: the title, mid run with a power on screen, the how screen, the costume shelf. Opened with
  the Read tool, three faults named in each, compared against the same four shots taken BEFORE D2 from the same
  seed. If the sim exposes a seed, hash the game canvas at frame 300 before and after; identical means the atlas
  is invisible, which is the whole claim.

## 5. DEPLOY (the law from START-HERE.md section 7)

Worktree on `origin/main`; `git checkout add-sproing-jumper -- satellites/stream-hop/index.html
satellites/stream-hop/sw.js satellites/stream-hop/assets/atlas satellites/stream-hop/scripts/pack-atlas.py
satellites/stream-hop/test` plus the one portal row; verify `HEAD~1 == origin/main`; push; then probe ONE served
file with a random query (`?probe=$RANDOM`), then curl the served `map.js` and `diff` it against the tree. Never
burst probe: the box gets punished too and then every probe lies. Then merge main back into the branch.

⛔ A 200 with a 19 s first byte from this box is the tarpit, not the site. Read `x-hcdn-upstream-rt` before
writing anything down.

## 6. FENCE

`satellites/stream-hop/index.html`, `satellites/stream-hop/sw.js`, `satellites/stream-hop/assets/atlas/**`,
`satellites/stream-hop/scripts/pack-atlas.py`, `satellites/stream-hop/test/**`, the Jimothy row of
`portal/index.html`, this file, and `HANDOFF-OPUS-SEP15.md` section 10. Nothing under `art-drop*`, `art-sheets`,
`assets/chars`, `assets/skins`, `store/`.

## 7. WHAT THIS DOES NOT FIX, so nobody writes that it did

The CDN rule is per address and it is still in force (this box: 19.5 s first byte at 12:31 UTC Sep 16, origin
13 ms, second egress prompt). A tester who opens game after game will still trip it with ordinary pages. **Only
Stephen's hPanel CDN security setting fixes that.** Lane D makes Jimothy stop tripping it by itself and cuts a
phone's first download from 18 MB to whatever the sheets measure.
