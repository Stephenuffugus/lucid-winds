# LANE D: JIMOTHY'S FIRST VISIT, 141 REQUESTS TO UNDER 25. Written Sep 16 2026 by Fable for Opus.

**Do this before resuming lane B. It is the one repo side change that protects the arcade in front of a tester.**

## SESSION STATE

- Status: NOT STARTED. Next action: D1, write `satellites/stream-hop/scripts/pack-atlas.py`.
- Time: half a day to a day, one builder.
- ⛔ WEB ONLY UNTIL AFTER FRIDAY SEP 18. Do not run `store/jimothy-steam/vendor.sh`, do not upload to Steam. Build r4 is
  approved and live; Stephen presses Release App on Friday 10:01 EDT and nothing on Steam changes before that. The
  atlas reaches Steam in the first post launch patch, when he asks.

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
